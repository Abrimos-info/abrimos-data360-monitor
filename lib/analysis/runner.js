'use strict';

const fs = require('fs');
const path = require('path');

const ai = require('../ai-client');
const dataLoader = require('../data-loader');
const { createTimer, logTiming } = require('../timing');
const { buildContext } = require('./context-builder');
const { buildCandidate } = require('./candidate-builder');
const { detectAbruptChanges } = require('../detect/z-score');
const { detectCrossCountryAnomalies } = require('../detect/cross-indicator');
const { parseLlmResponse, sanitizeNoticiaItem } = require('./alert-extractor');
const { buildLlmDebug, llmStep } = require('./llm-debug');
const { validateAlert } = require('./quality-validator');
const { computeClaimId } = require('../pcn-claims');
const { annotateNoticiaClaims } = require('../pcn-annotate');
const { enrichAlert, formatPeriodNarrative, sortAlertsByDataDate } = require('../alert-display');
const { runReportajes } = require('./reportaje-runner');
const { translateNoticia } = require('./noticia-translate');
const {
  isUnchangedIndicator,
  loadCachedAlerts,
  rankIndicatorsBySignal,
  saveAnalysisCache,
} = require('./analysis-cache');

const { pickPrimaryCountry } = require('./country-utils');
const NOTICIA_TRANSLATE = process.env.NOTICIA_TRANSLATE !== 'false';
const ANALYSIS_MAX_INDICATORS = parseInt(process.env.ANALYSIS_MAX_INDICATORS || '0', 10);

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES_DIR = path.join(REPO_ROOT, 'data', 'analyses');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');
const ALERTS_FILE = path.join(REPO_ROOT, 'data', 'alerts.json');
const {
  COUNTRIES,
  NOTICIA_TIERS,
  CONTEXT_TIERS,
  isDynamicIndicator,
  loadDynamicIndicatorIdnos,
  collapseObservationsByPeriod,
} = dataLoader;

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

function loadAllSeries(opts = {}) {
  const tiers = opts.tiers || NOTICIA_TIERS;
  const all = {};
  for (const country of COUNTRIES) {
    for (const tier of tiers) {
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
        const cleaned = collapseObservationsByPeriod(obs, idno);
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

const { buildNoticiaMessages } = require('./prompt-builder');

function buildLlmPrompt(context, idno, { esOnly = NOTICIA_TRANSLATE } = {}) {
  return buildNoticiaMessages(context, { esOnly });
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
    claim_tokens: [{
      claim_id: candidate.detection_meta.claim_id,
      value: Number(obs.value),
      display_es: valueDisplayEs,
      display_en: valueDisplayEn,
    }],
  };
}

async function processOneIndicator(idno, candidates, allSeries, baselineSeries, opts = {}) {
  const t0 = Date.now();
  const seriesByCountry = {};
  for (const country of COUNTRIES) {
    seriesByCountry[country] = (allSeries[idno] && allSeries[idno][country]) || [];
  }
  const baselineByCountry = {};
  for (const country of COUNTRIES) baselineByCountry[country] = baselineSeries[country] || {};

  const mappedCandidates = candidates.map((c) => ({
    candidate_id: c.candidate_id,
    type: c.alert.type,
    country: c.alert.country,
    observation: c.alert.observation,
    previous: c.detection_meta.previous,
    z_score: c.detection_meta.z_score,
    baseline_mean: c.detection_meta.baseline_mean,
    regional_median: c.detection_meta.regional_median,
    claim_id: c.detection_meta.claim_id,
  }));

  const context = buildContext({
    idno,
    seriesByCountry,
    baselineSeriesByCountry: baselineByCountry,
    candidates: mappedCandidates,
    slim: opts.slimContext !== false,
  });
  logTiming('analysis', `${idno} | context`, Date.now() - t0);

  const messages = buildLlmPrompt(context, idno, { esOnly: opts.translate !== false && NOTICIA_TRANSLATE });
  writeLlmCallDump(idno, messages);

  const contextClaimIds = buildContextClaimIds(candidates);
  let noticias = [];
  let narrateStats = null;

  if (opts.noLlm) {
    // Dry-run: skip LLM entirely. Per-indicator output stays empty (no real
    // noticia content can be synthesized deterministically). The pipeline
    // plumbing still gets exercised end-to-end.
    noticias = [];
  } else {
    try {
      const llmT0 = Date.now();
      const llmResult = await ai.complete(messages, {
        label: `analysis:${idno}`,
        model: process.env.AI_MODEL_NOTICIA,
        effort: opts.effort,
      });
      narrateStats = llmResult.stats;
      logTiming('analysis', `${idno} | noticia-llm`, Date.now() - llmT0);
      const parsed = parseLlmResponse(llmResult.content);
      noticias = Array.isArray(parsed) ? parsed : [];
      if (noticias.length === 0 && /```noticia/.test(llmResult.content)) {
        ensureDir(ALERTS_DIR);
        const rawPath = path.join(ALERTS_DIR, `${idno}.raw.txt`);
        fs.writeFileSync(rawPath, llmResult.content, 'utf8');
        console.warn(`[analysis] ${idno}: LLM emitted a noticia opener but parsing yielded 0 items — raw saved to ${path.relative(REPO_ROOT, rawPath)}`);
      }
    } catch (err) {
      console.warn(`[analysis] LLM failed for ${idno}: ${err.message.slice(0, 120)}`);
      noticias = [];
    }
  }

  const expectedCountry = pickPrimaryCountry(candidates);
  const finalAlerts = [];
  for (const item of noticias) {
    let enriched = sanitizeNoticiaItem(enrichAlert(item));
    enriched.country = expectedCountry || enriched.country;
    let translateStats = null;
    if (opts.translate !== false && NOTICIA_TRANSLATE && !opts.noLlm) {
      try {
        const trT0 = Date.now();
        const trResult = await translateNoticia(enriched, contextClaimIds, opts);
        enriched = sanitizeNoticiaItem(trResult.noticia);
        translateStats = trResult.stats;
        logTiming('analysis', `${idno} | translate`, Date.now() - trT0);
      } catch (err) {
        console.warn(`[analysis] translate failed for ${enriched.id || idno}: ${err.message.slice(0, 120)}`);
        enriched = sanitizeNoticiaItem(enriched);
      }
    }
    enriched = annotateNoticiaClaims(enriched, contextClaimIds, candidates, idno);
    enriched.detected_at = opts.asOf
      ? `${opts.asOf}T12:00:00.000Z`
      : new Date().toISOString();
    const llmDebug = buildLlmDebug([
      llmStep('narrate', narrateStats),
      llmStep('translate', translateStats),
    ]);
    if (llmDebug) enriched.llm_debug = llmDebug;
    const { ok, failures } = validateAlert(enriched, contextClaimIds, {
      expectedCountry,
      candidates,
      idno,
    });
    if (!ok) {
      const detail = failures.map((f) => `${f.check}(${f.notes})`).join('; ');
      console.warn(`[analysis] validation issues for ${enriched.id || idno}: ${detail}`);
      continue;
    }
    const rejectedClaims = (enriched.claim_tokens || []).filter((t) => t.pcn_status === 'rejected');
    if (rejectedClaims.length) {
      console.warn(`[analysis] ${enriched.id || idno}: ${rejectedClaims.length} PCN claim(s) rejected — noticia kept`);
    }
    finalAlerts.push(enriched);
  }

  if (finalAlerts.length && candidates?.length) {
    saveAnalysisCache(ALERTS_DIR, idno, candidates);
  }

  const writeMeta = writeIndicatorOutputs(idno, finalAlerts, context);
  logTiming('analysis', `${idno} | total`, Date.now() - t0, `${finalAlerts.length} alert(s)`);
  return { idno, alerts: finalAlerts, context, ...writeMeta };
}

function detectAllCandidates(opts = {}) {
  const allSeries = loadAllSeries(opts);
  const allowed = opts.allowedIdnos || loadDynamicIndicatorIdnos();
  const abrupt = detectAbruptChanges(allSeries);
  const anomalies = detectCrossCountryAnomalies(allSeries);
  let sequence = 1;
  const allCandidates = [];
  for (const detection of [...abrupt, ...anomalies]) {
    if (allowed.size && !allowed.has(detection.indicator)) continue;
    allCandidates.push(buildCandidate(detection, sequence++));
  }
  const byIndicator = groupByIndicator(allCandidates.map((c) => ({ indicator: c.alert.indicator.idno, ...c })));
  return { allSeries, byIndicator, abruptCount: abrupt.length, anomalyCount: anomalies.length };
}

async function analyzeIndicator(idno, opts = {}) {
  if (!isDynamicIndicator(idno)) {
    return {
      idno,
      alerts: [],
      message: `Noticia generation is limited to dynamic-tier indicators; ${idno} is not in the dynamic watchlist or context`,
    };
  }
  const { allSeries, byIndicator } = detectAllCandidates({ tiers: NOTICIA_TIERS });
  const candidates = byIndicator.get(idno);
  if (!candidates?.length) return { idno, alerts: [], message: `No detection candidates for ${idno}` };
  return processOneIndicator(idno, candidates, allSeries, buildBaselineSeries(), opts);
}

async function runAnalysis(opts = {}) {
  ensureDir(ANALYSES_DIR);
  ensureDir(ALERTS_DIR);
  const timer = createTimer('analysis');
  const phase = opts.phase || 'all';
  const runNoticias = phase === 'all' || phase === 'noticias';
  const runReportajesPhase = (phase === 'all' || phase === 'reportajes') && !opts.only;
  const dynamicOnly = opts.allTiers !== true;
  const allowedIdnos = dynamicOnly ? loadDynamicIndicatorIdnos() : null;
  const detectionTiers = dynamicOnly ? NOTICIA_TIERS : CONTEXT_TIERS;

  if (dynamicOnly) {
    console.log(`[runner] dynamic-only mode: ${allowedIdnos.size} indicator(s) in watchlist`);
    if (allowedIdnos.size === 0) {
      console.warn('[runner] empty dynamic watchlist — run npm run discover && fetch with --watchlist-file data/dynamic-watchlist.json');
    }
  }

  const detectOpts = { tiers: detectionTiers };
  if (allowedIdnos) detectOpts.allowedIdnos = allowedIdnos;
  const { allSeries, byIndicator, abruptCount, anomalyCount } = detectAllCandidates(detectOpts);
  timer.lap('detect', `${abruptCount + anomalyCount} candidate(s)${dynamicOnly ? ' (dynamic watchlist)' : ''}`);
  const baselineSeries = buildBaselineSeries();
  let processedIdnos = [...byIndicator.keys()].sort();
  if (allowedIdnos) {
    processedIdnos = processedIdnos.filter((idno) => allowedIdnos.has(idno));
  }
  processedIdnos = rankIndicatorsBySignal(processedIdnos, byIndicator);
  const maxIndicators = opts.maxIndicators ?? ANALYSIS_MAX_INDICATORS;
  if (maxIndicators > 0 && processedIdnos.length > maxIndicators) {
    console.log(`[runner] capping analysis to top ${maxIndicators} indicator(s) by |z| (of ${processedIdnos.length})`);
    processedIdnos = processedIdnos.slice(0, maxIndicators);
  }
  if (opts.only) processedIdnos = processedIdnos.filter((k) => k === opts.only);

  let results = [];
  let skippedUnchanged = 0;
  if (runNoticias) {
    if (!opts.only && !opts.changedOnly && !opts.appendAlerts) fs.writeFileSync(ALERTS_FILE, '[]', 'utf8');
    for (const idno of processedIdnos) {
      const candidates = byIndicator.get(idno);
      if (opts.changedOnly && !opts.noLlm && isUnchangedIndicator(ALERTS_DIR, idno, candidates)) {
        skippedUnchanged++;
        console.log(`[analysis] ${idno}: skipped (detection unchanged, using cached alert)`);
        if (!opts.only) {
          const cached = loadCachedAlerts(ALERTS_DIR, idno);
          if (cached.length) mergeAlertsJson(idno, cached);
        }
        results.push({ idno, alerts: loadCachedAlerts(ALERTS_DIR, idno), skipped: true });
        continue;
      }
      if (opts.onProgress) opts.onProgress({ phase: 'indicator', idno, count: candidates.length });
      results.push(await processOneIndicator(idno, candidates, allSeries, baselineSeries, opts));
    }
    if (skippedUnchanged) {
      console.log(`[analysis] ${skippedUnchanged} indicator(s) skipped (--changed-only)`);
    }
  } else if (runReportajesPhase) {
    processedIdnos = [];
  }

  const allAlerts = results.flatMap((r) => r.alerts || []);

  let reportajes = [];
  if (runReportajesPhase) {
    const allNoticias = readAlertsAggregate().filter((i) => i.content_type === 'noticia');
    console.log(`[runner] Phase 2: generating Reportajes from ${allNoticias.length} Noticias ...`);
    const rpT0 = Date.now();
    reportajes = await runReportajes(allNoticias, {
      noLlm: opts.noLlm,
      changedOnly: opts.changedOnly,
      asOf: opts.asOf,
      effort: opts.effort,
    });
    logTiming('analysis', 'reportajes-phase', Date.now() - rpT0, `${reportajes.length} reportaje(s)`);
    console.log(`[runner] Reportajes generated: ${reportajes.length}`);

    if (reportajes.length > 0) {
      const aggregate = sortAlertsByDataDate([...readAlertsAggregate(), ...reportajes]);
      fs.writeFileSync(ALERTS_FILE, JSON.stringify(aggregate, null, 2), 'utf8');
    }
  }

  timer.end('pipeline', `${allAlerts.length} noticias, ${reportajes.length} reportajes`);

  return {
    abruptCount,
    anomalyCount,
    indicatorsProcessed: processedIdnos.length,
    indicatorsSkipped: skippedUnchanged,
    alertCount: allAlerts.length,
    reportajeCount: reportajes.length,
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
