'use strict';

const fs = require('fs');
const path = require('path');

const ai = require('../ai-client');
const { validateItem } = require('./quality-validator');

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

function buildReportajePrompt(datasetId, noticias) {
  const promptsDir = path.join(REPO_ROOT, 'lib', 'prompts');
  const system = fs.readFileSync(path.join(promptsDir, 'reportaje-system.md'), 'utf8');
  const task = fs.readFileSync(path.join(promptsDir, 'reportaje-task.md'), 'utf8');

  const noticiasContext = noticias
    .map((n, i) => `### Noticia ${i + 1}\n\`\`\`json\n${JSON.stringify(n, null, 2)}\n\`\`\``)
    .join('\n\n');

  const datasetUrl = `https://data360.worldbank.org/en/int/dataset/${datasetId}`;

  const user = [
    task,
    '',
    '---',
    '',
    `## §7. Noticias generadas para dataset ${datasetId}`,
    '',
    noticiasContext,
    '',
    `Dataset URL: ${datasetUrl}`,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function parseReportajeBlock(llmText) {
  const BLOCK_RE = /```reportaje\s*([\s\S]*?)```/g;
  const results = [];
  let m;
  while ((m = BLOCK_RE.exec(llmText)) !== null) {
    try { results.push(JSON.parse(m[1].trim())); } catch (_) {}
  }
  return results;
}

async function generateReportaje(datasetId, noticias, opts = {}) {
  const messages = buildReportajePrompt(datasetId, noticias);

  if (opts.noLlm) {
    return { reportaje: null, skipped: true, reason: '--no-llm flag set' };
  }

  // Match the call pattern used in lib/analysis/runner.js: ai.complete(messages, { label })
  const llmText = await ai.complete(messages, { label: `reportaje:${datasetId}` });
  const items = parseReportajeBlock(llmText);

  const contextClaimIds = new Set(
    noticias.flatMap((n) => (n.claim_tokens || []).map((t) => t.claim_id))
  );

  const valid = items.filter((item) => {
    const { ok, failures } = validateItem(item, contextClaimIds);
    if (!ok) {
      const failStr = failures.map((f) => `${f.check}: ${f.notes}`).join('; ');
      console.warn(`[reportaje-runner] ${datasetId}: reportaje failed validation — ${failStr}`);
    }
    return ok;
  });

  return { reportaje: valid[0] || null, raw: llmText };
}

async function runReportajes(allNoticias, opts = {}) {
  const minNoticias = opts.minNoticias ?? 2;
  const groups = groupNoticiasByDataset(allNoticias, { minNoticias });
  const reportajes = [];

  for (const [datasetId, noticias] of groups) {
    console.log(`[reportaje-runner] Generating Reportaje for dataset ${datasetId} (${noticias.length} noticias) ...`);
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
  }

  return reportajes;
}

module.exports = {
  groupNoticiasByDataset,
  generateReportaje,
  runReportajes,
  parseReportajeBlock,
  buildReportajePrompt,
};
