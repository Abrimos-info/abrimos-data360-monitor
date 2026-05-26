'use strict';

const fs = require('fs');
const path = require('path');

const ai = require('../ai-client');
const { validateItem } = require('./quality-validator');
const { iterateFencedJson, coerceTypes, sanitizeReportajeItem } = require('./alert-extractor');
const { buildNewsSectionForDataset } = require('../news');
const { COUNTRIES } = require('../data-loader');
const { annotateReportajeClaims } = require('../pcn-annotate');
const { datasetSearchUrl } = require('../data360-urls');
const { logTiming } = require('../timing');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');

function groupNoticiasByDataset(noticias, { minNoticias = 1 } = {}) {
  const groups = new Map();
  for (const n of noticias) {
    if (n.content_type !== 'noticia') continue;
    if (!groups.has(n.dataset_id)) groups.set(n.dataset_id, []);
    groups.get(n.dataset_id).push(n);
  }
  for (const [key, items] of groups) {
    if (items.length < minNoticias) groups.delete(key);
  }
  return groups;
}

function noticiasEligibleForReportaje(noticias) {
  return noticias.filter((n) => {
    if (n.content_type !== 'noticia') return false;
    const status = n.quality_status || 'accepted';
    if (status === 'incomplete' || status === 'rejected') {
      console.warn(`[reportaje-runner] skipping noticia ${n.id} (quality_status=${status})`);
      return false;
    }
    return true;
  });
}

function compactNoticiaForReportaje(n) {
  const verifiedClaims = (n.claim_tokens || []).filter(
    (t) => t.pcn_status === 'verified' || t.pcn_status == null
  );
  return {
    id: n.id,
    quality_status: n.quality_status || 'accepted',
    countries: n.countries,
    dataset_id: n.dataset_id,
    indicator: n.indicator ? {
      idno: n.indicator.idno,
      name: n.indicator.name,
    } : undefined,
    observation: n.observation,
    chart_series: n.chart_series,
    magnitude: n.magnitude,
    claim_tokens: verifiedClaims.length ? verifiedClaims : (n.claim_tokens || []),
  };
}

function buildReportajePrompt(datasetId, noticias) {
  const promptsDir = path.join(REPO_ROOT, 'lib', 'prompts');
  const system = fs.readFileSync(path.join(promptsDir, 'reportaje-system.md'), 'utf8');
  const task = fs.readFileSync(path.join(promptsDir, 'reportaje-task.md'), 'utf8');

  const noticiasContext = noticias
    .map((n, i) => `### Noticia ${i + 1}\n\`\`\`json\n${JSON.stringify(compactNoticiaForReportaje(n), null, 2)}\n\`\`\``)
    .join('\n\n');

  const datasetUrl = datasetSearchUrl(datasetId);

  const allowedClaimIds = [
    ...new Set(noticias.flatMap((n) => (n.claim_tokens || []).map((t) => t.claim_id))),
  ];

  const idnos = [...new Set(noticias.map((n) => n.indicator?.idno).filter(Boolean))];
  const countries = [...new Set(noticias.flatMap((n) => n.countries || (n.country ? [n.country] : [])))];
  const newsSection = buildNewsSectionForDataset(
    countries.length ? countries : COUNTRIES,
    idnos,
    { fromMonth: '2026-04', toMonth: '2026-05', limitPerCountry: 6 },
  );

  const user = [
    task,
    '',
    '---',
    '',
    `## §7. Noticias generadas para dataset ${datasetId}`,
    '',
    '§7 incluye solo datos estructurados (`observation`, `chart_series`, `claim_tokens`). Redactá el reportaje desde estos valores; no hay story ni lead de las Noticias.',
    '',
    noticiasContext,
    '',
    '### allowed_claim_ids',
    'Reutilizá EXCLUSIVAMENTE estos `claim_id` heredados de las Noticias. Cualquier otro será rechazado por la validación automática.',
    '',
    ...allowedClaimIds.map((id) => `- ${id}`),
    '',
    `Dataset URL: ${datasetUrl}`,
  ];

  if (newsSection.any) {
    user.push('', '---', '', '## §8. Prensa reciente (contexto para citar en el reportaje)', '');
    user.push(...newsSection.lines);
    user.push('', 'Al citar prensa externa: fragmento textual entre comillas, medio, autor y enlace markdown [medio](url).');
  }

  const userContent = user.join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: userContent },
  ];
}

function parseReportajeBlock(llmText, sourceNoticias = []) {
  const results = [];
  for (const jsonText of iterateFencedJson(llmText, 'reportaje')) {
    try {
      const item = JSON.parse(jsonText);
      coerceTypes(item);
      sanitizeReportajeItem(item, sourceNoticias);
      results.push(item);
    } catch (_) {}
  }
  return results;
}

async function generateReportaje(datasetId, noticias, opts = {}) {
  const messages = buildReportajePrompt(datasetId, noticias);

  if (opts.noLlm) {
    return { reportaje: null, skipped: true, reason: '--no-llm flag set' };
  }

  // Match the call pattern used in lib/analysis/runner.js: ai.complete(messages, { label })
  const llmT0 = Date.now();
  const llmText = await ai.complete(messages, {
    label: `reportaje:${datasetId}`,
    model: process.env.AI_MODEL_REPORTAJE,
  });
  logTiming('analysis', `reportaje:${datasetId} | llm`, Date.now() - llmT0);
  const items = parseReportajeBlock(llmText, noticias);

  if (items.length === 0 && /```reportaje/.test(llmText)) {
    fs.mkdirSync(ALERTS_DIR, { recursive: true });
    const rawPath = path.join(ALERTS_DIR, `reportaje_${datasetId}.raw.txt`);
    fs.writeFileSync(rawPath, llmText, 'utf8');
    console.warn(`[reportaje-runner] ${datasetId}: LLM emitted a reportaje opener but parsing yielded 0 items — raw saved to ${path.relative(REPO_ROOT, rawPath)}`);
  }

  const contextClaimIds = new Set(
    noticias.flatMap((n) => (n.claim_tokens || []).map((t) => t.claim_id))
  );

  const valid = items.filter((item) => {
    annotateReportajeClaims(item, contextClaimIds, noticias);
    const { ok, failures } = validateItem(item, contextClaimIds);
    if (!ok) {
      const failStr = failures.map((f) => `${f.check}: ${f.notes}`).join('; ');
      console.warn(`[reportaje-runner] ${datasetId}: reportaje failed validation — ${failStr}`);
      return false;
    }
    const rejectedClaims = (item.claim_tokens || []).filter((t) => t.pcn_status === 'rejected');
    if (rejectedClaims.length) {
      console.warn(`[reportaje-runner] ${datasetId}: ${rejectedClaims.length} PCN claim(s) rejected — reportaje kept`);
    }
    return true;
  });

  return { reportaje: valid[0] || null, raw: llmText };
}

async function runReportajes(allNoticias, opts = {}) {
  const minNoticias = opts.minNoticias ?? 2;
  const eligible = noticiasEligibleForReportaje(allNoticias);
  const groups = groupNoticiasByDataset(eligible, { minNoticias });
  const reportajes = [];

  for (const [datasetId, noticias] of groups) {
    console.log(`[reportaje-runner] Generating Reportaje for dataset ${datasetId} (${noticias.length} noticias) ...`);
    const dsT0 = Date.now();
    try {
      const { reportaje } = await generateReportaje(datasetId, noticias, opts);
      if (reportaje) {
        reportaje.detected_at = reportaje.detected_at || new Date().toISOString();
        reportajes.push(reportaje);

        fs.mkdirSync(ALERTS_DIR, { recursive: true });
        fs.writeFileSync(
          path.join(ALERTS_DIR, `reportaje_${datasetId}.json`),
          JSON.stringify(reportaje, null, 2) + '\n',
          'utf8'
        );
      }
      logTiming('analysis', `reportaje:${datasetId} | total`, Date.now() - dsT0);
    } catch (err) {
      console.warn(`[reportaje-runner] ${datasetId} failed: ${err.message.split('\n')[0]}`);
    }
  }

  return reportajes;
}

module.exports = {
  groupNoticiasByDataset,
  generateReportaje,
  runReportajes,
  parseReportajeBlock,
  buildReportajePrompt,
  compactNoticiaForReportaje,
  noticiasEligibleForReportaje,
};
