'use strict';

const fs = require('fs');
const path = require('path');

const ai = require('../ai-client');
const dataLoader = require('../data-loader');
const { buildContext } = require('./context-builder');
const { buildCandidate } = require('./candidate-builder');
const { detectAbruptChanges } = require('../detect/z-score');
const { detectCrossCountryAnomalies } = require('../detect/cross-indicator');
const { parseLlmResponse } = require('./alert-extractor');
const { validateAlert } = require('./quality-validator');
const { computeClaimId } = require('../pcn-claims');
const { enrichAlert, formatPeriodNarrative, sortAlertsByDataDate } = require('../alert-display');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES_DIR = path.join(REPO_ROOT, 'data', 'analyses');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');
const ALERTS_FILE = path.join(REPO_ROOT, 'data', 'alerts.json');
const { COUNTRIES } = dataLoader;

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function readAlertsAggregate() {
  if (!fs.existsSync(ALERTS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function mergeAlertsJson(idno, alerts) {
  const aggregate = sortAlertsByDataDate([
    ...readAlertsAggregate().filter((a) => a.indicator?.idno !== idno),
    ...alerts.map(enrichAlert),
  ]);
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(aggregate, null, 2), 'utf8');
  return aggregate.length;
}

function writeIndicatorOutputs(idno, alerts, context) {
  ensureDir(ANALYSES_DIR);
  ensureDir(ALERTS_DIR);
  fs.writeFileSync(path.join(ANALYSES_DIR, `${idno}.md`), context, 'utf8');
  fs.writeFileSync(path.join(ALERTS_DIR, `${idno}.json`), JSON.stringify(alerts, null, 2), 'utf8');
  const total = mergeAlertsJson(idno, alerts);
  return { alertCount: alerts.length, totalAlerts: total };
}

function loadAllSeries() {
  const all = {};
  for (const country of COUNTRIES) {
    for (const tier of ['annual', 'pulse', 'forecast']) {
      const rows = dataLoader.loadCountryTier(country, tier);
      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.indicator]) grouped[row.indicator] = [];
        grouped[row.indicator].push({
          time_period: row.time_period,
          value: row.value,
          unit_measure: row.unit_measure,
        });
      }
      for (const [idno, obs] of Object.entries(grouped)) {
        const map = new Map();
        for (const o of obs) {
          const prev = map.get(o.time_period);
          if (!prev) { map.set(o.time_period, o); continue; }
          if (Math.abs(Number(o.value) || 0) > Math.abs(Number(prev.value) || 0)) map.set(o.time_period, o);
        }
        const cleaned = Array.from(map.values()).sort((a, b) => a.time_period.localeCompare(b.time_period));
        if (!all[idno]) all[idno] = {};
        all[idno][country] = cleaned;
      }
    }
  }
  return all;
}

function buildBaselineSeries() {
  const baselineSeries = {};
  for (const country of COUNTRIES) {
    baselineSeries[country] = {};
    const rows = dataLoader.loadCountryTier(country, 'annual');
    for (const row of rows) {
      if (!baselineSeries[country][row.indicator]) baselineSeries[country][row.indicator] = [];
      baselineSeries[country][row.indicator].push({
        time_period: row.time_period,
        value: row.value,
        unit_measure: row.unit_measure,
      });
    }
    for (const arr of Object.values(baselineSeries[country])) {
      arr.sort((a, b) => a.time_period.localeCompare(b.time_period));
    }
  }
  return baselineSeries;
}

function groupByIndicator(detections) {
  const map = new Map();
  for (const d of detections) {
    if (!map.has(d.indicator)) map.set(d.indicator, []);
    map.get(d.indicator).push(d);
  }
  return map;
}

function buildLlmPrompt(context, idno) {
  const promptsDir = path.join(REPO_ROOT, 'lib', 'prompts');
  const system = [
    fs.readFileSync(path.join(promptsDir, 'noticia-system.md'), 'utf8'),
    '',
    fs.readFileSync(path.join(promptsDir, 'noticia-template.md'), 'utf8'),
  ].join('\n');
  const user = [
    fs.readFileSync(path.join(promptsDir, 'noticia-task.md'), 'utf8'),
    '',
    '---',
    '',
    context,
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function writeLlmCallDump(idno, messages) {
  ensureDir(ANALYSES_DIR);
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const user = messages.find((m) => m.role === 'user')?.content || '';
  fs.writeFileSync(path.join(ANALYSES_DIR, `${idno}.llm-call.md`), [
    '# LLM call dump (audit artifact)', '',
    `- indicator: ${idno}`, `- generated_at: ${new Date().toISOString()}`, '',
    '---', '', '## system', '', system, '', '---', '', '## user', '', user, '',
  ].join('\n'), 'utf8');
}

const COUNTRY_NAMES_ES = { ARG: 'Argentina', ECU: 'Ecuador', GTM: 'Guatemala', HND: 'Honduras', MEX: 'México' };
const COUNTRY_NAMES_EN = { ARG: 'Argentina', ECU: 'Ecuador', GTM: 'Guatemala', HND: 'Honduras', MEX: 'Mexico' };

function formatNumberEs(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
}
function formatNumberEn(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
}
function unitSuffix(unit, lang) {
  if (!unit) return '';
  if (unit === '%' || unit === 'PT' || String(unit).toLowerCase().includes('percent')) return ' %';
  if (unit === 'USD') return ' USD';
  if (unit === 'IX') return lang === 'es' ? ' (índice)' : ' (index)';
  if (unit === 'U' || unit === 'unitless') return '';
  return ` ${unit}`;
}
function indicatorNameEs(idno, fallback) {
  const map = {
    FAO_CP_23012: 'IPC general (índice, base 2015=100)',
    WB_WDI_FP_CPI_TOTL_ZG: 'inflación anual (IPC, % anual)',
    GOV_WGI_GE: 'efectividad del gobierno (WGI, estimado)',
  };
  return map[idno] || fallback;
}
function previousClaimId(candidate) {
  const prev = candidate.detection_meta.previous;
  if (!prev) return null;
  return computeClaimId({
    database_id: candidate.alert.indicator.database_id,
    indicator: candidate.alert.indicator.idno,
    country: candidate.alert.country,
    time_period: prev.time_period,
    unit_measure: prev.unit_measure,
  });
}
function buildContextClaimIds(candidates) {
  const ids = new Set();
  for (const c of candidates) {
    ids.add(c.detection_meta.claim_id);
    const prevId = previousClaimId(c);
    if (prevId) ids.add(prevId);
  }
  return ids;
}
function withArticleEs(name) {
  return /^(el |la |los |las )/i.test(name) ? name : `el ${name}`;
}

function deterministicNarrative(candidate) {
  const obs = candidate.alert.observation;
  const country = candidate.alert.country;
  const countryEs = COUNTRY_NAMES_ES[country] || country;
  const countryEn = COUNTRY_NAMES_EN[country] || country;
  const nameEs = withArticleEs(indicatorNameEs(candidate.alert.indicator.idno, candidate.alert.indicator.name.en));
  const nameEn = candidate.alert.indicator.name.en;
  const z = candidate.detection_meta.z_score;
  const sign = z >= 0 ? '+' : '−';
  const absZ = Math.abs(z).toFixed(1);
  const periodEs = formatPeriodNarrative(obs.time_period, 'es');
  const periodEn = formatPeriodNarrative(obs.time_period, 'en');
  const valueDisplayEs = `${formatNumberEs(obs.value)}${unitSuffix(obs.unit, 'es')}`;
  const valueDisplayEn = `${formatNumberEn(obs.value)}${unitSuffix(obs.unit, 'en')}`;
  return {
    narrative_citizen: {
      es: `Registró un cambio notable ${nameEs} en ${countryEs} en ${periodEs}.`,
      en: `${nameEn} changed notably in ${countryEn} in ${periodEn}.`,
    },
    narrative_journalist: {
      es: `${countryEs} ${nameEs} ${valueDisplayEs} (${obs.time_period}). z-score ${sign}${absZ.replace('.', ',')}σ.`,
      en: `${countryEn} ${nameEn} ${valueDisplayEn} (${obs.time_period}). z-score ${sign}${absZ}σ.`,
    },
    claim_tokens: [{
      claim_id: candidate.detection_meta.claim_id,
      value: Number(obs.value),
      display_es: valueDisplayEs,
      display_en: valueDisplayEn,
    }],
  };
}

async function processOneIndicator(idno, candidates, allSeries, baselineSeries, opts = {}) {
  const seriesByCountry = {};
  for (const country of COUNTRIES) {
    seriesByCountry[country] = (allSeries[idno] && allSeries[idno][country]) || [];
  }
  const baselineByCountry = {};
  for (const country of COUNTRIES) baselineByCountry[country] = baselineSeries[country] || {};

  const context = buildContext({
    idno,
    seriesByCountry,
    baselineSeriesByCountry: baselineByCountry,
    candidates: candidates.map((c) => ({
      candidate_id: c.candidate_id,
      type: c.alert.type,
      country: c.alert.country,
      observation: c.alert.observation,
      previous: c.detection_meta.previous,
      z_score: c.detection_meta.z_score,
      baseline_mean: c.detection_meta.baseline_mean,
      regional_median: c.detection_meta.regional_median,
      claim_id: c.detection_meta.claim_id,
    })),
  });

  const messages = buildLlmPrompt(context, idno);
  writeLlmCallDump(idno, messages);

  const contextClaimIds = buildContextClaimIds(candidates);
  let noticias = [];

  if (opts.noLlm) {
    // Dry-run: skip LLM entirely. Per-indicator output stays empty (no real
    // noticia content can be synthesized deterministically). The pipeline
    // plumbing still gets exercised end-to-end.
    noticias = [];
  } else {
    try {
      const response = await ai.complete(messages, { label: `analysis:${idno}` });
      const parsed = parseLlmResponse(response);
      noticias = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[analysis] LLM failed for ${idno}: ${err.message.slice(0, 120)}`);
      noticias = [];
    }
  }

  const finalAlerts = [];
  for (const item of noticias) {
    const enriched = enrichAlert(item);
    const { ok, failures } = validateAlert(enriched, contextClaimIds);
    if (!ok) {
      console.warn(`[analysis] validation issues for ${enriched.id || idno}: ${failures.map((f) => f.check).join(', ')}`);
      continue;
    }
    finalAlerts.push(enriched);
  }

  const writeMeta = writeIndicatorOutputs(idno, finalAlerts, context);
  return { idno, alerts: finalAlerts, context, ...writeMeta };
}

function detectAllCandidates() {
  const allSeries = loadAllSeries();
  const abrupt = detectAbruptChanges(allSeries);
  const anomalies = detectCrossCountryAnomalies(allSeries);
  let sequence = 1;
  const allCandidates = [];
  for (const detection of [...abrupt, ...anomalies]) {
    allCandidates.push(buildCandidate(detection, sequence++));
  }
  const byIndicator = groupByIndicator(allCandidates.map((c) => ({ indicator: c.alert.indicator.idno, ...c })));
  return { allSeries, byIndicator, abruptCount: abrupt.length, anomalyCount: anomalies.length };
}

async function analyzeIndicator(idno, opts = {}) {
  const { allSeries, byIndicator } = detectAllCandidates();
  const candidates = byIndicator.get(idno);
  if (!candidates?.length) return { idno, alerts: [], message: `No detection candidates for ${idno}` };
  return processOneIndicator(idno, candidates, allSeries, buildBaselineSeries(), opts);
}

async function runAnalysis(opts = {}) {
  ensureDir(ANALYSES_DIR);
  ensureDir(ALERTS_DIR);
  const { allSeries, byIndicator, abruptCount, anomalyCount } = detectAllCandidates();
  const baselineSeries = buildBaselineSeries();
  let processedIdnos = [...byIndicator.keys()].sort();
  if (opts.only) processedIdnos = processedIdnos.filter((k) => k === opts.only);
  if (!opts.only) fs.writeFileSync(ALERTS_FILE, '[]', 'utf8');

  const results = [];
  for (const idno of processedIdnos) {
    const candidates = byIndicator.get(idno);
    if (opts.onProgress) opts.onProgress({ phase: 'indicator', idno, count: candidates.length });
    results.push(await processOneIndicator(idno, candidates, allSeries, baselineSeries, opts));
  }

  const allAlerts = results.flatMap((r) => r.alerts);
  return {
    abruptCount,
    anomalyCount,
    indicatorsProcessed: processedIdnos.length,
    alertCount: allAlerts.length,
    results,
  };
}

module.exports = {
  runAnalysis,
  analyzeIndicator,
  processOneIndicator,
  loadAllSeries,
  detectAllCandidates,
};
