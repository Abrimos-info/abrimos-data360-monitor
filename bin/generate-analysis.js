#!/usr/bin/env node
'use strict';

/**
 * End-to-end pipeline orchestrator.
 *
 *   1. Load all CSV series under data/context (annual, pulse, forecast)
 *   2. Run abrupt-change and cross-country anomaly detection
 *   3. Group candidate alerts by indicator
 *   4. For each indicator, build the omnibus numbered context and call the LLM
 *      to produce bilingual narratives and claim tokens
 *   5. Merge LLM output into the deterministic alert shells
 *   6. Validate each alert against docs/alert-schema.json and Q1-Q7
 *   7. Write data/alerts/{IDNO}.json and concatenate to data/alerts.json
 *
 * Run:
 *   node bin/generate-analysis.js                full pipeline
 *   node bin/generate-analysis.js --only IDNO    single indicator (dev fast path)
 *   node bin/generate-analysis.js --no-llm       skip LLM, use deterministic stub narratives
 */

const fs = require('fs');
const path = require('path');

const ai = require('../lib/ai-client');
const dataLoader = require('../lib/data-loader');
const { buildContext } = require('../lib/analysis/context-builder');
const { buildCandidate } = require('../lib/analysis/candidate-builder');
const { detectAbruptChanges } = require('../lib/detect/z-score');
const { detectCrossCountryAnomalies } = require('../lib/detect/cross-indicator');
const { parseLlmResponse } = require('../lib/analysis/alert-extractor');
const { validateAlert } = require('../lib/analysis/quality-validator');
const { computeClaimId } = require('../lib/pcn-claims');

const REPO_ROOT = path.resolve(__dirname, '..');
const ANALYSES_DIR = path.join(REPO_ROOT, 'data', 'analyses');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');
const ALERTS_FILE = path.join(REPO_ROOT, 'data', 'alerts.json');

const { COUNTRIES } = dataLoader;

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function parseArgs(argv) {
  const args = { only: null, noLlm: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only' && argv[i + 1]) { args.only = argv[++i]; continue; }
    if (a.startsWith('--only=')) { args.only = a.slice('--only='.length); continue; }
    if (a === '--no-llm') { args.noLlm = true; continue; }
  }
  return args;
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
        // Deduplicate by (period). Keep the row with the largest absolute value when ties exist
        // (mitigates indicators that come with multiple disaggregations).
        const map = new Map();
        for (const o of obs) {
          const prev = map.get(o.time_period);
          if (!prev) { map.set(o.time_period, o); continue; }
          const a = Math.abs(Number(prev.value) || 0);
          const b = Math.abs(Number(o.value) || 0);
          if (b > a) map.set(o.time_period, o);
        }
        const cleaned = Array.from(map.values()).sort((a, b) => a.time_period.localeCompare(b.time_period));
        if (!all[idno]) all[idno] = {};
        all[idno][country] = cleaned;
      }
    }
  }
  return all;
}

function groupByIndicator(detections) {
  const map = new Map();
  for (const d of detections) {
    if (!map.has(d.indicator)) map.set(d.indicator, []);
    map.get(d.indicator).push(d);
  }
  return map;
}

function buildLlmPrompt(idno, context, candidates) {
  const systemPrompt = fs.readFileSync(path.join(REPO_ROOT, 'lib', 'prompts', 'analysis-system.md'), 'utf8');
  const candidatesJson = candidates.map((c) => ({
    candidate_id: c.candidate_id,
    type: c.alert.type,
    country: c.alert.country,
    indicator_name: c.alert.indicator.name.en,
    observation: c.alert.observation,
    magnitude: c.alert.magnitude,
    z_score: c.detection_meta.z_score,
    claim_id: c.detection_meta.claim_id,
  }));
  const task = [
    'Tarea: produce narrativas bilingües (es, en) para cada candidato detectado.',
    '',
    'Reglas:',
    '- Una entrada por candidate_id en el objeto JSON final.',
    '- narrative_citizen: lenguaje llano, audiencia general, máximo 280 caracteres por idioma.',
    '- narrative_journalist: tono periodístico con z-score o mediana regional, máximo 280 caracteres por idioma.',
    '- Cada narrativa cita al menos una vez el valor observado con su unidad.',
    '- claim_tokens debe incluir un objeto por cada cifra citada, con `claim_id` (usar el provisto) y `value` numérico.',
    '- Si una afirmación es causal o predictiva, envolver con [HIPÓTESIS] ... [/HIPÓTESIS].',
    '- No inventes datos que no estén en el contexto.',
    '',
    'Formato de respuesta:',
    '```json',
    '{',
    '  "narratives": {',
    '    "<candidate_id>": {',
    '      "narrative_citizen":    { "es": "...", "en": "..." },',
    '      "narrative_journalist": { "es": "...", "en": "..." },',
    '      "claim_tokens": [{ "claim_id": "...", "value": 4.2, "display_es": "...", "display_en": "..." }]',
    '    }',
    '  },',
    '  "quality": [{ "check": "Q1", "ok": true, "notes": "" }]',
    '}',
    '```',
    '',
    'CANDIDATOS:',
    '```json',
    JSON.stringify(candidatesJson, null, 2),
    '```',
    '',
    'CONTEXTO:',
    '```',
    context,
    '```',
  ].join('\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: task },
  ];
}

function deterministicNarrative(candidate) {
  const obs = candidate.alert.observation;
  const country = candidate.alert.country;
  const idnoName = candidate.alert.indicator.name.en;
  const z = candidate.detection_meta.z_score;
  const sign = z >= 0 ? '+' : '−';
  const absZ = Math.abs(z).toFixed(1);
  const value = obs.value;
  const unit = obs.unit || '';
  const period = obs.time_period;
  const claimId = candidate.detection_meta.claim_id;
  const valueDisplayEs = `${value} ${unit}`.trim();
  const valueDisplayEn = `${value} ${unit}`.trim();

  return {
    narrative_citizen: {
      es: `${country} registró ${valueDisplayEs} en ${idnoName} para ${period}, ${sign}${absZ}σ respecto a su trayectoria reciente.`,
      en: `${country} recorded ${valueDisplayEn} in ${idnoName} for ${period}, ${sign}${absZ}σ from its recent trajectory.`,
    },
    narrative_journalist: {
      es: `Detección automática: ${country} ${valueDisplayEs} en ${idnoName} (${period}). z-score ${sign}${absZ}σ vs ventana de 5 puntos previos.`,
      en: `Auto-detected: ${country} ${valueDisplayEn} in ${idnoName} (${period}). z-score ${sign}${absZ}σ against 5-point baseline.`,
    },
    claim_tokens: [{
      claim_id: claimId,
      value: Number(value),
      display_es: valueDisplayEs,
      display_en: valueDisplayEn,
    }],
  };
}

async function processOneIndicator(idno, candidates, allSeries, baselineSeries, opts) {
  const seriesByCountry = {};
  for (const country of COUNTRIES) {
    seriesByCountry[country] = (allSeries[idno] && allSeries[idno][country]) || [];
  }
  const baselineByCountry = {};
  for (const country of COUNTRIES) {
    baselineByCountry[country] = baselineSeries[country] || {};
  }

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

  let narratives = {};
  if (opts.noLlm) {
    for (const c of candidates) {
      narratives[c.candidate_id] = deterministicNarrative(c);
    }
  } else {
    try {
      const messages = buildLlmPrompt(idno, context, candidates);
      const response = await ai.complete(messages, { label: `analysis:${idno}` });
      const parsed = parseLlmResponse(response);
      narratives = parsed.narratives || {};
      for (const c of candidates) {
        if (!narratives[c.candidate_id]) {
          console.warn(`[analysis] LLM did not return narrative for ${c.candidate_id}, falling back to deterministic`);
          narratives[c.candidate_id] = deterministicNarrative(c);
        }
      }
    } catch (err) {
      console.warn(`[analysis] LLM failed for ${idno}: ${err.message.slice(0, 200)}`);
      console.warn('[analysis] falling back to deterministic narratives');
      for (const c of candidates) {
        narratives[c.candidate_id] = deterministicNarrative(c);
      }
    }
  }

  const contextClaimIds = new Set(candidates.map((c) => c.detection_meta.claim_id));
  const finalAlerts = [];
  for (const c of candidates) {
    const n = narratives[c.candidate_id];
    if (!n) continue;
    const alert = {
      ...c.alert,
      narrative_citizen: n.narrative_citizen,
      narrative_journalist: n.narrative_journalist,
      ...(n.claim_tokens && n.claim_tokens.length ? { claim_tokens: n.claim_tokens } : {}),
    };
    const { ok, failures } = validateAlert(alert, contextClaimIds);
    if (!ok) {
      console.warn(`[analysis] validation issues for ${alert.id}: ${failures.map((f) => `${f.check}:${f.notes}`).join(' | ')}`);
    }
    finalAlerts.push(alert);
  }

  return { alerts: finalAlerts, context };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  ensureDir(ANALYSES_DIR);
  ensureDir(ALERTS_DIR);

  console.log('[analysis] loading series ...');
  const allSeries = loadAllSeries();
  const indicators = Object.keys(allSeries).sort();
  console.log(`[analysis] ${indicators.length} indicators across ${COUNTRIES.length} countries`);

  console.log('[analysis] running detection ...');
  const abrupt = detectAbruptChanges(allSeries);
  const anomalies = detectCrossCountryAnomalies(allSeries);
  console.log(`[analysis] candidates: ${abrupt.length} abrupt_change, ${anomalies.length} anomaly`);

  let sequence = 1;
  const allCandidates = [];
  for (const detection of [...abrupt, ...anomalies]) {
    allCandidates.push(buildCandidate(detection, sequence++));
  }

  // Build baselineSeries (annual only) for the context-builder snapshot per country.
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
    for (const [k, arr] of Object.entries(baselineSeries[country])) {
      arr.sort((a, b) => a.time_period.localeCompare(b.time_period));
    }
  }

  const byIndicator = groupByIndicator(allCandidates.map((c) => ({
    indicator: c.alert.indicator.idno,
    ...c,
  })));

  let processedIdnos = [...byIndicator.keys()].sort();
  if (opts.only) processedIdnos = processedIdnos.filter((k) => k === opts.only);

  console.log(`[analysis] processing ${processedIdnos.length} indicators with candidates ...`);
  const finalAlerts = [];
  for (const idno of processedIdnos) {
    const candidates = byIndicator.get(idno);
    console.log(`[analysis] ${idno}: ${candidates.length} candidate(s)`);
    const { alerts, context } = await processOneIndicator(idno, candidates, allSeries, baselineSeries, opts);
    fs.writeFileSync(path.join(ANALYSES_DIR, `${idno}.md`), context, 'utf8');
    fs.writeFileSync(path.join(ALERTS_DIR, `${idno}.json`), JSON.stringify(alerts, null, 2), 'utf8');
    finalAlerts.push(...alerts);
  }

  fs.writeFileSync(ALERTS_FILE, JSON.stringify(finalAlerts, null, 2), 'utf8');
  console.log(`[analysis] wrote ${finalAlerts.length} alerts to ${ALERTS_FILE}`);

  const stats = ai.getTokenStats();
  console.log(`[AI-COST-ANALYSIS] total calls: ${stats.calls} | in: ${stats.inputTokens} | out: ${stats.outputTokens} | est: $${stats.cost.toFixed(4)}`);
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n${e.stack || ''}\n`);
  process.exit(1);
});
