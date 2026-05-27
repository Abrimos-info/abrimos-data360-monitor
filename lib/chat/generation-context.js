'use strict';

const fs = require('fs');
const path = require('path');
const alertsStore = require('../alerts-store');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES_DIR = path.join(REPO_ROOT, 'data', 'analyses');
const ALERTS_DIR = path.join(REPO_ROOT, 'data', 'alerts');

const DEFAULT_MAX_CHARS = parseInt(process.env.CHAT_GENERATION_CONTEXT_MAX_CHARS || '48000', 10);

function truncateMarkdown(text, maxChars) {
  if (!text || text.length <= maxChars) {
    return { markdown: text || '', truncated: false };
  }
  return {
    markdown: `${text.slice(0, maxChars)}\n\n… [contexto truncado para chat]`,
    truncated: true,
  };
}

function readFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim();
    }
  } catch (_) { /* ignore */ }
  return null;
}

function extractContextFromLlmCallDump(filePath) {
  const raw = readFileIfExists(filePath);
  if (!raw) return null;
  const userIdx = raw.indexOf('\n## user\n');
  if (userIdx < 0) return null;
  const afterUser = raw.slice(userIdx + '\n## user\n'.length);
  const ctxMarkers = [
    '\n---\n\n# CONTEXTO',
    '\n---\n\n# CONTEXTO SLIM',
    '\n# CONTEXTO SLIM',
    '\n# CONTEXTO INTEGRADO',
  ];
  for (const marker of ctxMarkers) {
    const pos = afterUser.indexOf(marker);
    if (pos >= 0) {
      const start = marker.startsWith('\n---') ? pos + '\n---\n\n'.length : pos + 1;
      return afterUser.slice(start).trim();
    }
  }
  const parts = afterUser.split(/\n---\n/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1].trim();
    if (last.startsWith('# CONTEXTO')) return last;
  }
  return null;
}

function loadNoticiaContextMarkdown(idno) {
  if (!idno) return { markdown: null, source: 'missing' };
  const mdPath = path.join(ANALYSES_DIR, `${idno}.md`);
  const fromMd = readFileIfExists(mdPath);
  if (fromMd) return { markdown: fromMd, source: 'analyses_md' };
  const llmPath = path.join(ANALYSES_DIR, `${idno}.llm-call.md`);
  const fromLlm = extractContextFromLlmCallDump(llmPath);
  if (fromLlm) return { markdown: fromLlm, source: 'llm_call' };
  return { markdown: null, source: 'missing' };
}

function publishedNoticiaFallback(noticiaId) {
  const alert = alertsStore.getAlertById(noticiaId);
  if (!alert) return '';
  const title = alert.title?.es || alert.title || alert.id;
  const lead = alert.lead?.es || alert.lead || '';
  const story = alert.story?.es || alert.story || '';
  const idno = alert.indicator?.idno || 'unknown';
  return [
  `### Noticia publicada ${noticiaId} (${idno})`,
  '',
  `_Sin contexto omnibus en disco para ${idno}; solo texto publicado._`,
  '',
  `**Titular:** ${title}`,
  '',
  lead ? `**Lead:** ${lead}` : '',
  story ? `**Story:**\n${story}` : '',
  ].filter(Boolean).join('\n');
}

function resolveReportajeIdnos(alert) {
  const idnos = new Set();
  if (Array.isArray(alert.indicators)) {
    for (const id of alert.indicators) if (id) idnos.add(id);
  }
  if (Array.isArray(alert.noticia_ids)) {
    for (const nid of alert.noticia_ids) {
      const n = alertsStore.getAlertById(nid);
      if (n?.indicator?.idno) idnos.add(n.indicator.idno);
    }
  }
  return [...idnos];
}

function loadReportajeContextMarkdown(alert) {
  const idnos = resolveReportajeIdnos(alert);
  if (!idnos.length) {
    return { markdown: null, source: 'missing', missingIdnos: [] };
  }
  const sections = [];
  const missingIdnos = [];
  const sources = new Set();

  for (const idno of idnos) {
    const { markdown, source } = loadNoticiaContextMarkdown(idno);
    if (markdown) {
      sources.add(source);
      sections.push(`## Indicador ${idno}\n\n${markdown}`);
    } else {
      missingIdnos.push(idno);
    }
  }

  if (Array.isArray(alert.noticia_ids)) {
    for (const nid of alert.noticia_ids) {
      const n = alertsStore.getAlertById(nid);
      const idno = n?.indicator?.idno;
      if (idno && missingIdnos.includes(idno)) {
        const fb = publishedNoticiaFallback(nid);
        if (fb) sections.push(fb);
      }
    }
  }

  if (!sections.length) {
    return { markdown: null, source: 'missing', missingIdnos };
  }

  const combined = sections.join('\n\n---\n\n');
  let source = 'noticia_analyses_aggregate';
  if (sources.size === 1) source = [...sources][0] === 'llm_call' ? 'noticia_analyses_aggregate' : 'noticia_analyses_aggregate';
  if (missingIdnos.length) source = 'noticia_analyses_aggregate_partial';

  return { markdown: combined, source, missingIdnos };
}

/**
 * Load pipeline generation context for scoped article chat.
 * @param {object} alert - enriched alert from alerts-store
 * @param {{ maxChars?: number }} [opts]
 * @returns {{ markdown: string, source: string, truncated: boolean, missingIdnos?: string[] } | null}
 */
function loadGenerationContext(alert, opts = {}) {
  if (!alert || typeof alert !== 'object') return null;
  const maxChars = opts.maxChars ?? DEFAULT_MAX_CHARS;

  let raw;
  let source;
  let missingIdnos;

  if (alert.content_type === 'reportaje') {
    const r = loadReportajeContextMarkdown(alert);
    raw = r.markdown;
    source = r.source;
    missingIdnos = r.missingIdnos;
  } else {
    const idno = alert.indicator?.idno;
    const r = loadNoticiaContextMarkdown(idno);
    raw = r.markdown;
    source = r.source;
    if (!raw && alert.id) {
      const fb = publishedNoticiaFallback(alert.id);
      if (fb) {
        raw = fb;
        source = 'published_fallback';
      }
    }
  }

  if (!raw) {
    console.log(`[CHAT-CONTEXT] alert_id=${alert.id} source=missing chars=0`);
    return null;
  }

  const { markdown, truncated } = truncateMarkdown(raw, maxChars);
  console.log(
    `[CHAT-CONTEXT] alert_id=${alert.id} source=${source} chars=${markdown.length} truncated=${truncated}`,
  );
  return { markdown, source, truncated, ...(missingIdnos?.length ? { missingIdnos } : {}) };
}

module.exports = {
  loadGenerationContext,
  loadNoticiaContextMarkdown,
  truncateMarkdown,
  ANALYSES_DIR,
  ALERTS_DIR,
};
