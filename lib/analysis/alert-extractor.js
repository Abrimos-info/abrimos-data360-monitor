// lib/analysis/alert-extractor.js
'use strict';

const { datasetSearchUrl, csvUrl } = require('../data360-urls');

const CLAIM_TOKEN_RE = /\{\{claim:([^|]+)\|([^}]+)\}\}/g;

// Walks the text from startIdx looking for a balanced top-level JSON object.
// String/escape-aware so inner braces and triple-backticks inside string
// values don't fool the scanner — eliminates the silent-drop class of bugs
// caused by weak models emitting ``` inside story fields.
function extractJsonObject(text, startIdx = 0) {
  let i = startIdx;
  while (i < text.length && text[i] !== '{') i++;
  if (i >= text.length) return null;
  const start = i;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (escape) { escape = false; continue; }
    if (inStr) {
      if (c === '\\') escape = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Iterate every `fence` occurrence ("noticia" or "reportaje") and pull the
// balanced JSON object that follows. The closing ``` is ignored entirely,
// since by the time we have the balanced object we know the JSON ended.
function* iterateFencedJson(text, fence) {
  const opener = new RegExp('```' + fence + '\\s*', 'g');
  let m;
  while ((m = opener.exec(text)) !== null) {
    const jsonText = extractJsonObject(text, m.index + m[0].length);
    if (jsonText) yield jsonText;
  }
}

function resolveClaims(text) {
  const tokens = [];
  let m;
  while ((m = CLAIM_TOKEN_RE.exec(text)) !== null) {
    tokens.push({ claim_id: m[1].trim(), value: m[2].trim() });
  }
  return tokens;
}

// Coerce the fields whose JSON-schema type small models routinely get wrong:
// observation.value and claim_token.value are required strings (Data360
// OBS_VALUE is decimal-precision text), chart_point.value is a number for
// rendering. Quietly fix instead of rejecting — Q2 would cascade and drop
// the whole item.
function coerceTypes(item) {
  if (!item || typeof item !== 'object') return item;
  if (item.observation && item.observation.value != null && typeof item.observation.value !== 'string') {
    item.observation.value = String(item.observation.value);
  }
  if (Array.isArray(item.claim_tokens)) {
    for (const t of item.claim_tokens) {
      if (t && t.value != null && typeof t.value !== 'string') t.value = String(t.value);
    }
  }
  if (Array.isArray(item.chart_series)) {
    for (const p of item.chart_series) {
      if (p && p.value != null && typeof p.value !== 'number') {
        const n = Number(p.value);
        if (Number.isFinite(n)) p.value = n;
      }
    }
  }
  return item;
}

const NOTICIA_TOP_LEVEL = new Set([
  'content_type', 'id', 'title', 'lead', 'story', 'countries', 'dataset_id',
  'indicator', 'observation', 'magnitude', 'chart_series', 'claim_tokens',
  'verification_trace', 'score', 'detected_at', 'data_period_stale', 'license',
  'quality_status', 'quality_tags', 'llm_debug',
]);

const REPORTAJE_TOP_LEVEL = new Set([
  'content_type', 'id', 'title', 'lead', 'story', 'countries', 'dataset_id',
  'indicators', 'noticia_ids', 'claim_tokens', 'verification_trace', 'score',
  'detected_at', 'license', 'quality_status', 'quality_tags', 'llm_debug',
]);

function normalizeDetectedAt(value) {
  if (!value) return new Date().toISOString();
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) return `${s.replace(/\.\d+$/, '')}Z`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T12:00:00.000Z`;
  if (/^\d{4}$/.test(s)) return `${s}-01-01T12:00:00.000Z`;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

function normalizeScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function buildDatasetUrl(datasetId) {
  return datasetSearchUrl(datasetId);
}

function buildCsvLink(datasetId, idno) {
  return csvUrl(datasetId, idno);
}

function isHttpUri(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function ensureBilingual(field, fallback = '') {
  if (!field || typeof field !== 'object') {
    const text = fallback || 'n/a';
    return { es: text, en: text };
  }
  const es = (field.es || '').trim() || (field.en || '').trim() || fallback || 'n/a';
  const en = (field.en || '').trim() || es;
  return { es, en };
}

function coerceCountryList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((c) => {
      if (!c) return null;
      if (typeof c === 'string') return c.trim().toUpperCase();
      if (typeof c === 'object') {
        if (typeof c.iso === 'string') return c.iso.trim().toUpperCase();
        if (typeof c.code === 'string') return c.code.trim().toUpperCase();
      }
      return String(c).trim().toUpperCase();
    })
    .filter(Boolean);
}

/** Strip legacy keys and fill empty .en fields before schema validation. */
function sanitizeNoticiaItem(item) {
  if (!item || typeof item !== 'object') return item;
  item.content_type = 'noticia';
  if (!Array.isArray(item.countries) && item.country) {
    item.countries = [item.country];
  }
  item.countries = coerceCountryList(item.countries);
  for (const key of Object.keys(item)) {
    if (!NOTICIA_TOP_LEVEL.has(key)) delete item[key];
  }
  item.title = ensureBilingual(item.title);
  item.lead = ensureBilingual(item.lead);
  item.story = ensureBilingual(item.story);
  if (item.indicator && typeof item.indicator === 'object') {
    item.indicator.name = ensureBilingual(item.indicator.name, item.indicator.idno || '');
  }
  if (item.magnitude && typeof item.magnitude === 'object') {
    item.magnitude = item.magnitude.es || item.magnitude.en || String(item.magnitude);
  }
  item.detected_at = normalizeDetectedAt(item.detected_at);
  item.score = normalizeScore(item.score);
  if (item.dataset_id) {
    if (item.indicator && typeof item.indicator === 'object' && !item.indicator.database_id) {
      item.indicator.database_id = item.dataset_id;
    }
    if (!item.verification_trace || typeof item.verification_trace !== 'object') {
      item.verification_trace = {};
    }
    if (!item.verification_trace.data360_dataset_url) {
      item.verification_trace.data360_dataset_url = buildDatasetUrl(item.dataset_id);
    }
    if (!item.verification_trace.csv_link && item.indicator?.idno) {
      item.verification_trace.csv_link = buildCsvLink(item.dataset_id, item.indicator.idno);
    }
  }
  if (!Array.isArray(item.claim_tokens)) item.claim_tokens = [];
  return coerceTypes(item);
}

/** Strip noticia-only keys and fill reportaje metadata from source Noticias. */
function sanitizeReportajeItem(item, sourceNoticias = []) {
  if (!item || typeof item !== 'object') return item;
  item.content_type = 'reportaje';
  for (const key of Object.keys(item)) {
    if (!REPORTAJE_TOP_LEVEL.has(key)) delete item[key];
  }

  const idnos = [...new Set(sourceNoticias.map((n) => n.indicator?.idno).filter(Boolean))];
  const noticiaIds = sourceNoticias.map((n) => n.id).filter(Boolean);
  const countries = [...new Set(sourceNoticias.flatMap((n) => coerceCountryList(
    n.countries || (n.country ? [n.country] : []),
  )))];
  const datasetId = item.dataset_id || sourceNoticias[0]?.dataset_id;

  item.dataset_id = datasetId;
  if (!Array.isArray(item.indicators) || item.indicators.length < 2) {
    item.indicators = idnos.length >= 2 ? idnos : (item.indicators || idnos);
  }
  if (!Array.isArray(item.noticia_ids) || !item.noticia_ids.length) {
    item.noticia_ids = noticiaIds;
  }
  if (!Array.isArray(item.countries) || !item.countries.length) {
    item.countries = countries;
  }
  item.countries = coerceCountryList(item.countries);

  item.title = ensureBilingual(item.title);
  item.lead = ensureBilingual(item.lead);
  item.story = ensureBilingual(item.story);
  item.detected_at = normalizeDetectedAt(item.detected_at);
  item.score = normalizeScore(item.score);

  if (!item.verification_trace || typeof item.verification_trace !== 'object') {
    item.verification_trace = {};
  }
  if (!item.verification_trace.data360_dataset_url && datasetId) {
    item.verification_trace.data360_dataset_url = buildDatasetUrl(datasetId);
  }
  const csvLinks = new Set();
  for (const n of sourceNoticias) {
    const idno = n.indicator?.idno;
    const db = n.indicator?.database_id || n.dataset_id || datasetId;
    if (idno && db) csvLinks.add(buildCsvLink(db, idno));
    else if (isHttpUri(n.verification_trace?.csv_link)) {
      csvLinks.add(String(n.verification_trace.csv_link).trim());
    }
  }
  for (const link of (item.verification_trace.csv_links || [])) {
    if (isHttpUri(link)) csvLinks.add(String(link).trim());
  }
  if (isHttpUri(item.verification_trace?.csv_link)) {
    csvLinks.add(String(item.verification_trace.csv_link).trim());
  }
  delete item.verification_trace.csv_link;
  if (csvLinks.size) item.verification_trace.csv_links = [...csvLinks];
  else delete item.verification_trace.csv_links;
  if (!Array.isArray(item.claim_tokens)) item.claim_tokens = [];

  return coerceTypes(item);
}

function parseNoticias(llmText) {
  const results = [];
  for (const jsonText of iterateFencedJson(llmText, 'noticia')) {
    try {
      const item = JSON.parse(jsonText);
      if (!Array.isArray(item.claim_tokens) || item.claim_tokens.length === 0) {
        const storyText = (item.story?.es || '') + (item.story?.en || '');
        item.claim_tokens = resolveClaims(storyText);
      }
      coerceTypes(item);
      sanitizeNoticiaItem(item);
      results.push(item);
    } catch (_) {
      // malformed JSON — skip
    }
  }
  return results;
}

function parseLlmResponse(text) {
  return parseNoticias(text);
}

module.exports = {
  parseLlmResponse,
  parseNoticias,
  resolveClaims,
  extractJsonObject,
  iterateFencedJson,
  coerceTypes,
  sanitizeNoticiaItem,
  sanitizeReportajeItem,
  normalizeDetectedAt,
  normalizeScore,
  ensureBilingual,
};
