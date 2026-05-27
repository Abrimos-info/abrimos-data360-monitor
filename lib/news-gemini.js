'use strict';

const fs = require('fs');
const path = require('path');
const { loadIndicatorMetadata } = require('./data-loader');
const { appendHeadline, headlineId, readJsonlFile, jsonlPath, listMonthFiles } = require('./news');
const { enrichHeadlineWithArticle, sanitizeArticleUrl } = require('./news-article-fetch');
const { COUNTRY_GDELT } = require('./news');
const { DEFAULT_COUNTRIES } = require('./news-fetch');
const { logTiming } = require('./timing');
const { pipeLog } = require('./pipe-log');
const { summarizeIndicatorNewsCoverage, logNewsCoverage } = require('./news-coverage');

const SCOPE = 'news-gemini';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_NEWS_MODEL
  || process.env.GEMINI_MODEL
  || 'gemini-2.5-flash-lite';
const GEMINI_MODEL_FALLBACK = process.env.GEMINI_MODEL_FALLBACK || 'gemini-2.5-flash';
const GROUNDING = process.env.GEMINI_SEARCH_GROUNDING !== 'false';
const GEMINI_PACE_MS = parseInt(process.env.GEMINI_PACE_MS || '6000', 10);
const GEMINI_MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || '3', 10);
const GEMINI_429_MAX_RETRIES = parseInt(process.env.GEMINI_429_MAX_RETRIES || '1', 10);
const GEMINI_ABORT_AFTER_429 = parseInt(process.env.GEMINI_ABORT_AFTER_429 || '3', 10);
const GEMINI_SKIP_COVERED = process.env.GEMINI_SKIP_COVERED !== 'false';
const GEMINI_NEWS_MIN_ACCEPTED = parseInt(process.env.GEMINI_NEWS_MIN_ACCEPTED || '1', 10);
const GEMINI_NEWS_BATCH = process.env.GEMINI_NEWS_BATCH !== 'false';
const GEMINI_SKIP_FALLBACK_ON_429 = process.env.GEMINI_SKIP_FALLBACK_ON_429 !== 'false';
const SAVE_RAW = process.env.GEMINI_SAVE_RAW !== 'false';
const RESOLVE_GROUNDING_URLS = process.env.GEMINI_RESOLVE_GROUNDING_URLS !== 'false';
const RESOLVE_TIMEOUT_MS = parseInt(process.env.GEMINI_RESOLVE_TIMEOUT_MS || '8000', 10);
const RESOLVE_USER_AGENT = process.env.NEWS_FETCH_USER_AGENT
  || 'Mozilla/5.0 (compatible; Data360NewsAgent/1.0; +https://github.com/Abrimos-info/abrimos-data360-monitor)';
const DEFAULT_FROM = process.env.GEMINI_NEWS_FROM || '2026-04-01';
const DEFAULT_TO = process.env.GEMINI_NEWS_TO || '2026-05-21';

const REPO_ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(REPO_ROOT, 'data', 'news', 'raw');

const BLOCKED_HOST_PATTERNS = [
  /worldbank\.org/i,
  /data360/i,
  /knomad\.org/i,
  /ilo\.org/i,
  /data360files/i,
];

const SPANISH_TERM_HINTS = {
  unemployment: ['desempleo', 'desocupación', 'tasa de desempleo'],
  inflation: ['inflación', 'IPC', 'precios al consumidor'],
  remittance: ['remesas', 'envíos de dinero'],
  mortality: ['mortalidad', 'muertes'],
  poverty: ['pobreza', 'línea de pobreza'],
  gini: ['desigualdad', 'coeficiente de Gini'],
  enrollment: ['matrícula', 'escolarización'],
  'labor force': ['fuerza laboral', 'participación laboral'],
  government: ['gobierno', 'gasto público'],
  gdp: ['PIB', 'producto interno bruto'],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpCodeFromError(err) {
  const match = String(err?.message || '').match(/HTTP (\d+)/);
  return match ? match[1] : null;
}

function logArticle(headline, country, idno) {
  const fields = {
    idno,
    country,
    status: headline.ingest_status,
    headline: (headline.headline || '(sin titular)').slice(0, 80),
  };
  if (headline.url) fields.url = headline.url;
  if (headline.body_fetch === 'ok') fields.body = `${headline.body_chars}chars`;
  else if (headline.body_fetch && headline.body_fetch !== 'skipped') {
    fields.body = 'skip';
    if (headline.body_error) fields.reason = headline.body_error.split('\n')[0].slice(0, 80);
  }
  if (headline.ingest_tags?.length) fields.tags = headline.ingest_tags.join(',');
  pipeLog(SCOPE, 'article', fields);
}

function parseJsonFromText(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : trimmed).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Gemini response did not contain JSON object');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function rawJsonlPath(country, baseDir = RAW_DIR) {
  return path.join(baseDir, country, 'responses.jsonl');
}

function appendRawGeminiResponse(country, record, baseDir = RAW_DIR) {
  if (!SAVE_RAW) return null;
  const file = rawJsonlPath(country, baseDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
  return file;
}

function parseRetryDelayMs(message, attempt) {
  const retryIn = String(message).match(/retry in ([\d.]+)s/i);
  if (retryIn) return Math.ceil(parseFloat(retryIn[1]) * 1000) + 500;
  const retryDelay = String(message).match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryDelay) return parseInt(retryDelay[1], 10) * 1000 + 500;
  if (/HTTP 429/.test(message)) return Math.min(120000, 15000 * (2 ** attempt));
  return Math.min(60000, 3000 * (2 ** attempt));
}

function maxRetriesForError(err) {
  return isRateLimitError(err) ? GEMINI_429_MAX_RETRIES : GEMINI_MAX_RETRIES;
}

function isRetryableGeminiError(err) {
  return /HTTP (429|503)/.test(err.message);
}

function isRateLimitError(err) {
  return /HTTP 429/.test(err.message);
}

const COUNTRY_ALIASES = {
  argentina: 'ARG',
  ecuador: 'ECU',
  guatemala: 'GTM',
  honduras: 'HND',
  mexico: 'MEX',
  méxico: 'MEX',
};

function normalizeArticleCountry(raw, allowedCountries) {
  if (!raw || !allowedCountries?.length) return null;
  const trimmed = String(raw).trim();
  const upper = trimmed.toUpperCase();
  if (allowedCountries.includes(upper)) return upper;
  const alias = COUNTRY_ALIASES[trimmed.toLowerCase()];
  if (alias && allowedCountries.includes(alias)) return alias;
  for (const code of allowedCountries) {
    const name = COUNTRY_GDELT[code];
    if (name && name.toLowerCase() === trimmed.toLowerCase()) return code;
  }
  return null;
}

function loadWatchlistEntries(watchlistFile) {
  const raw = JSON.parse(fs.readFileSync(watchlistFile, 'utf8'));
  return Array.isArray(raw) ? raw : (raw.indicators || raw.entries || []);
}

function extractMdSection(md, sectionName) {
  const lines = md.split('\n');
  const target = sectionName.toLowerCase();
  const start = lines.findIndex((l) => l.trim().toLowerCase() === `## ${target}`);
  if (start === -1) return '';
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').replace(/\s+/g, ' ').trim();
}

function deriveSearchTerms(title, definition, topics) {
  const terms = new Set();
  const text = `${title} ${definition} ${topics.join(' ')}`.toLowerCase();
  for (const [en, esList] of Object.entries(SPANISH_TERM_HINTS)) {
    if (text.includes(en)) {
      for (const t of esList) terms.add(t);
    }
  }
  for (const topic of topics.slice(0, 4)) {
    const label = topic.split('_(')[0].trim();
    if (label.length > 3) terms.add(label.toLowerCase());
  }
  for (const word of title.split(/\W+/)) {
    if (word.length > 5) terms.add(word.toLowerCase());
  }
  return [...terms].slice(0, 10);
}

function indicatorSearchContext(idno) {
  const md = loadIndicatorMetadata(idno);
  if (!md) {
    // When running in CI or on a fresh deploy, `data/indicators/*.md` may not exist yet
    // (it's pipeline-generated and gitignored). Provide a small deterministic fallback for
    // the demo + tests without performing network I/O.
    const FALLBACK = {
      WB_WDI_SL_UEM_TOTL_ZS: {
        title: 'Unemployment, total (% of total labor force)',
        definition: 'Unemployment refers to the share of the labor force that is without work but available for and seeking employment.',
        topics: ['Labor market'],
      },
    };
    const f = FALLBACK[String(idno || '').trim()];
    if (f) {
      return { idno, title: f.title, definition: f.definition, topics: f.topics, searchTerms: deriveSearchTerms(f.title, f.definition, f.topics) };
    }
    return { idno, title: idno, definition: '', topics: [], searchTerms: [] };
  }
  const titleMatch = md.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1].trim() : idno;
  const definition = extractMdSection(md, 'Definition') || extractMdSection(md, 'Definición');
  const topics = [...md.matchAll(/^-\s+(.+?)\s+_\(/gm)].map((m) => m[1].trim());
  const searchTerms = deriveSearchTerms(title, definition, topics);
  return { idno, title, definition, topics, searchTerms };
}

function indicatorSearchText(idno) {
  const ctx = indicatorSearchContext(idno);
  return [ctx.title, ctx.definition, ctx.searchTerms.join(', ')].filter(Boolean).join(' — ').slice(0, 1200);
}

function countryMediaHints(country) {
  const bgPath = path.join(REPO_ROOT, 'data', 'context', country, 'background.md');
  if (!fs.existsSync(bgPath)) return [];
  const md = fs.readFileSync(bgPath, 'utf8');
  const m = md.match(/prensa[^(\n]*\(([^)]+)\)/i);
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8);
}

function parseArticleDateIso(raw, fallbackIso) {
  if (!raw) return fallbackIso;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T12:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s.endsWith('Z') ? s : `${s}Z`);
    return Number.isFinite(d.getTime()) ? d.toISOString() : fallbackIso;
  }
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString() : fallbackIso;
}

function isWithinWindow(isoDate, from, to) {
  const day = isoDate.slice(0, 10);
  return day >= from && day <= to;
}

function isBlockedHost(hostname) {
  return BLOCKED_HOST_PATTERNS.some((re) => re.test(hostname || ''));
}

function loadKnownUrlIds(country, from, to) {
  const fromMonth = from.slice(0, 7);
  const toMonth = to.slice(0, 7);
  const ids = new Set();
  for (const month of listMonthFiles(country, fromMonth, toMonth)) {
    for (const h of readJsonlFile(jsonlPath(country, month))) {
      if (h?.id) ids.add(h.id);
    }
  }
  return ids;
}

function isGroundingRedirectUrl(url) {
  try {
    const u = new URL(String(url || '').trim());
    return /vertexaisearch\.cloud\.google\.com$/i.test(u.hostname)
      && /grounding-api-redirect/i.test(u.pathname);
  } catch (_) {
    return false;
  }
}

function groundingChunks(groundingMetadata) {
  return groundingMetadata?.groundingChunks
    || groundingMetadata?.grounding_chunks
    || [];
}

/** If metadata carries a non-redirect URI for the same grounding target, use it. */
function resolveFromGroundingMetadata(redirectUrl, groundingMetadata) {
  if (!redirectUrl || !groundingMetadata) return null;
  const target = String(redirectUrl).trim();
  for (const chunk of groundingChunks(groundingMetadata)) {
    const web = chunk?.web || chunk?.retrievedContext?.web || {};
    const uri = web.uri || web.url;
    if (!uri) continue;
    const normalized = String(uri).trim();
    if (normalized === target && !isGroundingRedirectUrl(normalized)) return normalized;
  }
  return null;
}

async function followGroundingRedirect(url, opts = {}) {
  if (!url || !isGroundingRedirectUrl(url)) return null;
  const timeoutMs = opts.timeoutMs ?? RESOLVE_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { 'User-Agent': RESOLVE_USER_AGENT };
  try {
    for (const method of ['HEAD', 'GET']) {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: method === 'GET' ? { ...headers, Range: 'bytes=0-0' } : headers,
      });
      if (res.url && !isGroundingRedirectUrl(res.url)) return res.url;
    }
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
  return null;
}

/**
 * Resolve Gemini grounding redirect URLs to canonical article URLs before ingest.
 * Uses grounding metadata when available, otherwise follows HTTP redirects (cached).
 */
async function resolveGeminiArticleUrl(article, groundingMetadata, opts = {}) {
  const tags = [];
  const rawUrl = article?.url ? String(article.url).trim() : '';
  if (!rawUrl) return { url: null, tags: ['missing_url'], unresolved: true };

  let candidate = sanitizeArticleUrl(rawUrl) || rawUrl.replace(/\s+/g, '');
  if (!isGroundingRedirectUrl(candidate)) {
    return { url: sanitizeArticleUrl(candidate), tags, unresolved: false };
  }

  let resolved = resolveFromGroundingMetadata(candidate, groundingMetadata);
  if (resolved) tags.push('grounding_metadata_resolved');

  if (!resolved && (opts.resolveGroundingUrls ?? RESOLVE_GROUNDING_URLS)) {
    const cache = opts.redirectCache;
    if (cache?.has(candidate)) {
      resolved = cache.get(candidate);
      if (resolved) tags.push('grounding_redirect_cached');
    } else {
      resolved = await followGroundingRedirect(candidate, opts);
      if (cache) cache.set(candidate, resolved);
      if (resolved) tags.push('grounding_redirect_followed');
    }
  }

  const finalUrl = sanitizeArticleUrl(resolved);
  if (!finalUrl || isGroundingRedirectUrl(finalUrl)) {
    tags.push('unresolved_grounding_redirect');
    return { url: null, tags, unresolved: true, original_url: candidate };
  }

  return { url: finalUrl, tags, unresolved: false, original_url: candidate };
}

function classifyGeminiArticle(article, ctx) {
  const tags = [];
  let status = 'accepted';
  const rawUrl = article?.url ? String(article.url).trim() : '';
  const headline = article?.headline ? String(article.headline).trim() : '';

  if (!headline) {
    tags.push('missing_headline');
    status = 'rejected';
  }
  if (!rawUrl) {
    tags.push('missing_url');
    status = 'rejected';
  }

  const url = rawUrl ? sanitizeArticleUrl(rawUrl) : null;
  if (rawUrl && !url) {
    tags.push('invalid_url');
    status = 'rejected';
  }

  let hostname = '';
  if (url) {
    try {
      hostname = new URL(url).hostname;
    } catch (_) {
      tags.push('invalid_url');
      status = 'rejected';
    }
  }

  if (hostname && isBlockedHost(hostname)) {
    tags.push('blocked_domain');
    status = 'rejected';
  }

  if (url && isGroundingRedirectUrl(url)) {
    tags.push('unresolved_grounding_redirect');
    status = 'rejected';
  }

  const publishedAt = parseArticleDateIso(article?.published_at, ctx.fetchedAt);
  if (ctx.from && ctx.to && !isWithinWindow(publishedAt, ctx.from, ctx.to)) {
    tags.push('outside_window');
    status = 'rejected';
  }

  const urlId = url ? headlineId(url) : null;
  if (urlId && ctx.seenUrls?.has(urlId)) {
    tags.push('duplicate_url_run');
    if (status === 'accepted') status = 'duplicate';
  }
  if (urlId && ctx.knownUrlIds?.has(urlId)) {
    tags.push('duplicate_url_store');
    if (status === 'accepted') status = 'duplicate';
  }

  if (url && article?.source_name) {
    const sourceNorm = String(article.source_name).toLowerCase().replace(/\s+/g, '');
    const hostNorm = hostname.replace(/^www\./, '').split('.')[0];
    if (hostNorm && !sourceNorm.includes(hostNorm) && !hostNorm.includes(sourceNorm.slice(0, 4))) {
      tags.push('source_domain_mismatch');
      if (status === 'accepted') status = 'incomplete';
    }
  }

  return { url, headline, hostname, publishedAt, urlId, status, tags };
}

function applyBodyFetchTags(headline) {
  if (headline.body_fetch === 'ok') return headline;
  if (!headline.body_fetch || headline.body_fetch === 'skipped') return headline;
  headline.ingest_tags = [...(headline.ingest_tags || []), `body_${headline.body_fetch}`];
  if (headline.ingest_status === 'accepted') headline.ingest_status = 'incomplete';
  return headline;
}

function buildSearchPrompt(country, ctx, { from, to, mediaHints = [], maxArticles = 3 }) {
  const countryName = COUNTRY_GDELT[country] || country;
  const terms = ctx.searchTerms.length ? ctx.searchTerms.join(', ') : ctx.title;
  const mediaLine = mediaHints.length
    ? `Medios de referencia en ${countryName} (orientación, no exclusivo): ${mediaHints.join(', ')}.`
    : '';

  return `Busca artículos de prensa en español sobre "${ctx.title}" en ${countryName}.
Ventana de publicación: solo artículos entre ${from} y ${to} (inclusive).

Indicador (${ctx.idno}):
- Definición: ${ctx.definition || ctx.title}
- Términos útiles en prensa: ${terms}

${mediaLine}

Evitá enlaces a páginas del Banco Mundial, KNOMAD, Data360, ILO u otros repositorios de datos (no son noticias).
Si no hay cobertura creíble en ese período, devolvé {"articles":[]}.
No inventes URLs. El hostname debe ser un medio real.

Respondé SOLO con un objeto JSON (sin markdown ni texto extra):
{
  "articles": [
    {
      "headline": "titular",
      "url": "https://...",
      "author": "nombre del autor o vacío",
      "source_name": "nombre del medio",
      "published_at": "YYYY-MM-DD"
    }
  ]
}
Máximo ${Math.max(1, Math.min(3, maxArticles))} artículos.`;
}

function buildBatchSearchPrompt(countries, ctx, { from, to, maxPerCountry = 2 }) {
  const terms = ctx.searchTerms.length ? ctx.searchTerms.join(', ') : ctx.title;
  const countryLines = countries.map((code) => {
    const name = COUNTRY_GDELT[code] || code;
    const hints = countryMediaHints(code);
    const media = hints.length ? ` Medios orientativos: ${hints.slice(0, 4).join(', ')}.` : '';
    return `- ${code} (${name})${media}`;
  }).join('\n');

  return `Busca artículos de prensa en español sobre "${ctx.title}" en estos países de América Latina:
${countryLines}

Ventana de publicación: solo artículos entre ${from} y ${to} (inclusive).

Indicador (${ctx.idno}):
- Definición: ${ctx.definition || ctx.title}
- Términos útiles en prensa: ${terms}

Evitá enlaces a páginas del Banco Mundial, KNOMAD, Data360, ILO u otros repositorios de datos (no son noticias).
Si un país no tiene cobertura creíble en ese período, omitilo (no inventes).
No inventes URLs. El hostname debe ser un medio real.

Respondé SOLO con un objeto JSON (sin markdown ni texto extra):
{
  "articles": [
    {
      "country": "ISO3 (${countries.join('|')})",
      "headline": "titular",
      "url": "https://...",
      "author": "nombre del autor o vacío",
      "source_name": "nombre del medio",
      "published_at": "YYYY-MM-DD"
    }
  ]
}
Máximo ${maxPerCountry} artículos por país.`;
}

async function saveGeminiArticles(country, idno, articles, classifyCtx, opts, rawRecord) {
  const fetchedAt = classifyCtx.fetchedAt;
  let appended = 0;
  let accepted = 0;

  for (let i = 0; i < articles.length; i++) {
    const rawArticle = articles[i];
    const resolved = await resolveGeminiArticleUrl(rawArticle, rawRecord.grounding_metadata, opts);
    const article = { ...rawArticle, url: resolved.url || undefined };
    const classified = classifyGeminiArticle(article, classifyCtx);
    const ingestTags = [...new Set([...(resolved.tags || []), ...classified.tags])];
    let ingestStatus = classified.status;
    if (resolved.unresolved) ingestStatus = 'rejected';

    let headline = {
      id: classified.urlId || headlineId(`${idno}:${fetchedAt}:${i}:${JSON.stringify(rawArticle).slice(0, 80)}`),
      country,
      published_at: classified.publishedAt,
      fetched_at: fetchedAt,
      source: {
        name: rawArticle.source_name || 'desconocido',
        domain: classified.hostname,
      },
      author: rawArticle.author || null,
      url: classified.url || resolved.url || null,
      headline: classified.headline || null,
      snippet: rawArticle.snippet ? String(rawArticle.snippet).trim() : null,
      language: 'es',
      fetch_source: 'gemini',
      tags: [],
      indicators_hint: [idno],
      ingest_status: ingestStatus,
      ingest_tags: ingestTags,
      gemini_raw: {
        ...rawArticle,
        ...(resolved.original_url && resolved.url && resolved.original_url !== resolved.url
          ? { original_url: resolved.original_url, resolved_url: resolved.url }
          : {}),
      },
    };

    if (classified.url && classified.headline) {
      headline = await enrichHeadlineWithArticle(headline, opts);
      headline = applyBodyFetchTags(headline);
    }

    rawRecord.articles_evaluated.push({
      country,
      ingest_status: headline.ingest_status,
      ingest_tags: headline.ingest_tags,
      url: headline.url,
      headline: headline.headline,
    });

    appendHeadline(country, headline);
    appended += 1;
    if (headline.ingest_status === 'accepted') accepted += 1;
    if (classified.urlId) classifyCtx.seenUrls.add(classified.urlId);

    logArticle(headline, country, idno);
  }

  return { appended, accepted };
}

async function geminiFetchJsonOnce(prompt, model) {
  if (!GEMINI_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }
  const t0 = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  };
  if (GROUNDING) {
    body.tools = [{ google_search: {} }];
  } else {
    body.generationConfig.responseMimeType = 'application/json';
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 400)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const candidate = data.candidates?.[0] || null;
  logTiming('news-gemini', model, Date.now() - t0);
  return { text, model, candidate, api: data };
}

async function geminiFetchJson(prompt, opts = {}) {
  const models = [GEMINI_MODEL];
  if (GEMINI_MODEL_FALLBACK && !models.includes(GEMINI_MODEL_FALLBACK)) {
    models.push(GEMINI_MODEL_FALLBACK);
  }

  let lastErr;
  let hitRateLimit = false;
  for (const model of models) {
    if (hitRateLimit && GEMINI_SKIP_FALLBACK_ON_429) break;
    for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt++) {
      try {
        return await geminiFetchJsonOnce(prompt, model);
      } catch (err) {
        lastErr = err;
        if (isRateLimitError(err)) hitRateLimit = true;
        const maxRetries = maxRetriesForError(err);
        if (!isRetryableGeminiError(err) || attempt >= maxRetries) break;
        const delay = parseRetryDelayMs(err.message, attempt);
        pipeLog(SCOPE, 'retry', {
          model,
          http: httpCodeFromError(err) || 'error',
          attempt: `${attempt + 1}/${maxRetries}`,
          wait: `${Math.round(delay / 1000)}s`,
        }, 'warn');
        await sleep(delay);
        if (opts.onRateLimit && isRateLimitError(err)) opts.onRateLimit(delay);
      }
    }
    if (models.length > 1 && model !== models[models.length - 1] && !hitRateLimit) {
      pipeLog(SCOPE, 'fallback', { from: model, to: GEMINI_MODEL_FALLBACK }, 'warn');
    }
  }
  throw lastErr;
}

async function fetchNewsForIndicator(country, idno, opts = {}) {
  const t0 = Date.now();
  const from = opts.from || DEFAULT_FROM;
  const to = opts.to || DEFAULT_TO;
  const ctxMeta = indicatorSearchContext(idno);
  const mediaHints = countryMediaHints(country);
  const maxArticles = opts.maxPerIndicator ?? 3;
  const prompt = buildSearchPrompt(country, ctxMeta, { from, to, mediaHints, maxArticles });
  const fetchedAt = new Date().toISOString();
  const classifyCtx = {
    fetchedAt,
    from,
    to,
    seenUrls: opts.seenUrls || new Set(),
    knownUrlIds: opts.knownUrlIds || loadKnownUrlIds(country, from, to),
  };

  const rawRecord = {
    fetched_at: fetchedAt,
    country,
    idno,
    from,
    to,
    batch: false,
    indicator_context: ctxMeta,
    media_hints: mediaHints,
    grounding: GROUNDING,
    prompt,
    raw_text: null,
    parsed: null,
    parse_error: null,
    error: null,
    model: null,
    grounding_metadata: null,
    finish_reason: null,
    articles_fetched: 0,
    articles_saved: 0,
    articles_accepted: 0,
    articles_evaluated: [],
  };

  let appended = 0;
  let accepted = 0;
  try {
    const { text, model, candidate } = await geminiFetchJson(prompt, opts);
    rawRecord.raw_text = text;
    rawRecord.model = model;
    rawRecord.grounding_metadata = candidate?.groundingMetadata ?? null;
    rawRecord.finish_reason = candidate?.finishReason ?? null;

    const parsed = parseJsonFromText(text);
    rawRecord.parsed = parsed;
    const articles = Array.isArray(parsed.articles) ? parsed.articles : [];
    rawRecord.articles_fetched = articles.length;

    ({ appended, accepted } = await saveGeminiArticles(
      country, idno, articles, classifyCtx, opts, rawRecord
    ));

    rawRecord.articles_saved = appended;
    rawRecord.articles_accepted = accepted;
  } catch (err) {
    if (rawRecord.raw_text && !rawRecord.parsed) {
      rawRecord.parse_error = err.message;
    } else {
      rawRecord.error = err.message;
    }
    throw err;
  } finally {
    const rawPath = appendRawGeminiResponse(country, rawRecord, opts.rawDir);
    if (rawPath) {
      pipeLog(SCOPE, 'raw', { path: path.relative(REPO_ROOT, rawPath), idno, country });
    }
  }

  logTiming('news-gemini', `${country}/${idno}`, Date.now() - t0, `${accepted} accepted / ${appended} saved`);
  return { fetched: rawRecord.articles_fetched, appended, accepted };
}

async function fetchNewsForIndicatorBatch(idno, countries, opts = {}) {
  const t0 = Date.now();
  const from = opts.from || DEFAULT_FROM;
  const to = opts.to || DEFAULT_TO;
  const maxPerCountry = opts.maxPerIndicator ?? 2;
  const ctxMeta = indicatorSearchContext(idno);
  const prompt = buildBatchSearchPrompt(countries, ctxMeta, { from, to, maxPerCountry });
  const fetchedAt = new Date().toISOString();
  const seenUrls = opts.seenUrls || new Set();
  const knownByCountry = {};
  for (const country of countries) {
    knownByCountry[country] = loadKnownUrlIds(country, from, to);
  }

  const rawRecord = {
    fetched_at: fetchedAt,
    countries,
    idno,
    from,
    to,
    batch: true,
    indicator_context: ctxMeta,
    grounding: GROUNDING,
    prompt,
    raw_text: null,
    parsed: null,
    parse_error: null,
    error: null,
    model: null,
    grounding_metadata: null,
    finish_reason: null,
    articles_fetched: 0,
    articles_saved: 0,
    articles_accepted: 0,
    articles_evaluated: [],
    articles_skipped_country: 0,
  };

  let appended = 0;
  let accepted = 0;
  try {
    const { text, model, candidate } = await geminiFetchJson(prompt, opts);
    rawRecord.raw_text = text;
    rawRecord.model = model;
    rawRecord.grounding_metadata = candidate?.groundingMetadata ?? null;
    rawRecord.finish_reason = candidate?.finishReason ?? null;

    const parsed = parseJsonFromText(text);
    rawRecord.parsed = parsed;
    const articles = Array.isArray(parsed.articles) ? parsed.articles : [];
    rawRecord.articles_fetched = articles.length;

    const byCountry = {};
    for (const country of countries) byCountry[country] = [];

    for (const article of articles) {
      const country = normalizeArticleCountry(article.country, countries);
      if (!country) {
        rawRecord.articles_skipped_country += 1;
        rawRecord.articles_evaluated.push({
          ingest_status: 'rejected',
          ingest_tags: ['missing_country'],
          url: article.url || null,
          headline: article.headline || null,
        });
        pipeLog(SCOPE, 'article', {
          idno,
          status: 'rejected',
          tags: 'missing_country',
          headline: (article.headline || '(sin titular)').slice(0, 80),
          url: article.url || undefined,
        });
        continue;
      }
      byCountry[country].push(article);
    }

    for (const country of countries) {
      const classifyCtx = {
        fetchedAt,
        from,
        to,
        seenUrls,
        knownUrlIds: knownByCountry[country],
      };
      const saved = await saveGeminiArticles(
        country, idno, byCountry[country], classifyCtx, opts, rawRecord
      );
      appended += saved.appended;
      accepted += saved.accepted;
    }

    rawRecord.articles_saved = appended;
    rawRecord.articles_accepted = accepted;
  } catch (err) {
    if (rawRecord.raw_text && !rawRecord.parsed) {
      rawRecord.parse_error = err.message;
    } else {
      rawRecord.error = err.message;
    }
    throw err;
  } finally {
    if (SAVE_RAW) {
      for (const country of countries) {
        const rawPath = appendRawGeminiResponse(country, {
          ...rawRecord,
          country,
          articles_evaluated: rawRecord.articles_evaluated.filter((a) => !a.country || a.country === country),
        }, opts.rawDir);
        if (rawPath && country === countries[0]) {
          pipeLog(SCOPE, 'raw', {
            path: path.relative(REPO_ROOT, rawPath),
            idno,
            countries: countries.join(','),
          });
        }
      }
    }
  }

  logTiming('news-gemini', `${idno} batch`, Date.now() - t0, `${accepted} accepted / ${appended} saved`);
  return { fetched: rawRecord.articles_fetched, appended, accepted };
}

async function fetchNewsGemini({
  countries = DEFAULT_COUNTRIES,
  watchlistFile = null,
  idnos = null,
  maxPerIndicator = 3,
  maxIndicators = null,
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  batch = GEMINI_NEWS_BATCH,
  fetchBody = process.env.NEWS_FETCH_BODY !== 'false',
  skipCovered = GEMINI_SKIP_COVERED,
  minAccepted = GEMINI_NEWS_MIN_ACCEPTED,
} = {}) {
  if (!GEMINI_KEY) {
    pipeLog(SCOPE, 'skip', { reason: 'GEMINI_API_KEY not set' }, 'warn');
    return { skipped: true, totalNew: 0 };
  }

  let entries = [];
  if (watchlistFile && fs.existsSync(watchlistFile)) {
    entries = loadWatchlistEntries(watchlistFile);
  } else if (Array.isArray(idnos)) {
    entries = idnos.map((idno) => ({ idno }));
  }

  if (!entries.length) {
    pipeLog(SCOPE, 'skip', { reason: 'no indicators to search' }, 'warn');
    return { totalNew: 0 };
  }
  if (maxIndicators != null && maxIndicators > 0 && entries.length > maxIndicators) {
    pipeLog(SCOPE, 'limit', { kept: maxIndicators, total: entries.length });
    entries = entries.slice(0, maxIndicators);
  }

  const allIdnos = entries.map((e) => e.idno || e.code).filter(Boolean);
  let coverage = null;
  if (skipCovered && allIdnos.length) {
    coverage = summarizeIndicatorNewsCoverage(allIdnos, countries, { from, to, minAccepted });
    logNewsCoverage(SCOPE, coverage);
    if (!coverage.needsNews.length) {
      pipeLog(SCOPE, 'skip', { reason: 'all indicators have news in window', window: coverage.window });
      return {
        totalNew: 0,
        totalAccepted: 0,
        failed: 0,
        totalCalls: 0,
        skipped: true,
        coverage,
      };
    }
    const needSet = new Set(coverage.needsNews);
    entries = entries.filter((e) => needSet.has(e.idno || e.code));
  }

  const totalCalls = batch ? entries.length : entries.length * countries.length;
  const seenUrls = new Set();
  pipeLog(SCOPE, 'config', {
    indicators: entries.length,
    countries: countries.join(','),
    calls: totalCalls,
    mode: batch ? 'batch' : 'per-country',
    window: `${from}→${to}`,
    pace: `${GEMINI_PACE_MS}ms`,
    body: fetchBody ? 'on' : 'off',
    skip_covered: skipCovered ? 'on' : 'off',
  });

  let totalNew = 0;
  let totalAccepted = 0;
  let failed = 0;
  let paceMs = GEMINI_PACE_MS;
  let failedRequestStreak429 = 0;
  let aborted = false;
  let abortedReason = null;
  const pendingIdnos = entries.map((e) => e.idno || e.code).filter(Boolean);
  const completedIdnos = new Set();
  const runT0 = Date.now();
  const callOpts = {
    maxPerIndicator,
    from,
    to,
    seenUrls,
    fetchBody,
    redirectCache: new Map(),
    onRateLimit: () => {
      paceMs = Math.min(60000, Math.max(paceMs * 2, GEMINI_PACE_MS));
    },
  };

  const handleRequestFailure = (err, ctx) => {
    failed += 1;
    pipeLog(SCOPE, 'fail', ctx, 'warn');
    if (!isRateLimitError(err)) {
      failedRequestStreak429 = 0;
      return false;
    }
    failedRequestStreak429 += 1;
    if (failedRequestStreak429 >= GEMINI_ABORT_AFTER_429) {
      pipeLog(SCOPE, 'abort', {
        reason: 'Gemini quota exhausted',
        streak: failedRequestStreak429,
        hint: 'wait and retry, disable GEMINI_SEARCH_GROUNDING, or use --provider=gdelt',
      }, 'warn');
      abortedReason = 'quota_exhausted';
      return true;
    }
    return false;
  };

  for (const entry of entries) {
    if (aborted) break;
    const idno = entry.idno || entry.code;
    if (!idno) continue;

    if (batch) {
      try {
        pipeLog(SCOPE, 'search', { idno, countries: countries.join(','), mode: 'batch' });
        const { appended, accepted } = await fetchNewsForIndicatorBatch(idno, countries, callOpts);
        totalNew += appended;
        totalAccepted += accepted;
        completedIdnos.add(idno);
        failedRequestStreak429 = 0;
        paceMs = GEMINI_PACE_MS;
      } catch (err) {
        aborted = handleRequestFailure(err, {
          idno,
          mode: 'batch',
          error: err.message.split('\n')[0].slice(0, 120),
        });
      }
      if (!aborted) await sleep(paceMs);
      continue;
    }

    for (const country of countries) {
      if (aborted) break;
      try {
        pipeLog(SCOPE, 'search', { idno, country, mode: 'per-country' });
        const { appended, accepted } = await fetchNewsForIndicator(country, idno, callOpts);
        totalNew += appended;
        totalAccepted += accepted;
        completedIdnos.add(idno);
        failedRequestStreak429 = 0;
        paceMs = GEMINI_PACE_MS;
      } catch (err) {
        aborted = handleRequestFailure(err, {
          idno,
          country,
          error: err.message.split('\n')[0].slice(0, 120),
        });
      }
      if (!aborted) await sleep(paceMs);
    }
  }

  if (failed > 0) {
    pipeLog(SCOPE, 'summary', {
      failed,
      calls: totalCalls,
      aborted: aborted ? 'yes' : 'no',
      hint: 'GEMINI_NEWS_BATCH=true NEWS_FETCH_BODY=false --changed-only or --provider=gdelt',
    }, 'warn');
  }
  logTiming('news-gemini', 'total', Date.now() - runT0, `${totalAccepted} accepted, ${totalNew} saved, ${failed} failed${aborted ? ', aborted' : ''}`);
  const stillPending = pendingIdnos.filter((id) => !completedIdnos.has(id));
  return {
    totalNew,
    totalAccepted,
    failed,
    totalCalls,
    aborted,
    abortedReason,
    coverage,
    pendingIdnos: stillPending,
  };
}

module.exports = {
  fetchNewsGemini,
  fetchNewsForIndicator,
  fetchNewsForIndicatorBatch,
  indicatorSearchText,
  indicatorSearchContext,
  classifyGeminiArticle,
  isGroundingRedirectUrl,
  resolveFromGroundingMetadata,
  resolveGeminiArticleUrl,
  followGroundingRedirect,
  buildSearchPrompt,
  buildBatchSearchPrompt,
  normalizeArticleCountry,
  countryMediaHints,
  parseRetryDelayMs,
  parseJsonFromText,
  maxRetriesForError,
  appendRawGeminiResponse,
  rawJsonlPath,
  GEMINI_PACE_MS,
  GEMINI_NEWS_BATCH,
  GEMINI_ABORT_AFTER_429,
  GEMINI_429_MAX_RETRIES,
  SAVE_RAW,
  DEFAULT_FROM,
  DEFAULT_TO,
};
