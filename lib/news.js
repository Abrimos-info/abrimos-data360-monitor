'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(REPO_ROOT, 'data', 'news');

const COUNTRY_GDELT = {
  ARG: 'Argentina',
  ECU: 'Ecuador',
  GTM: 'Guatemala',
  HND: 'Honduras',
  MEX: 'Mexico',
};

function normalizeNewsUrl(url) {
  return String(url || '').trim().toLowerCase().replace(/\/$/, '');
}

function headlineId(url) {
  return crypto.createHash('sha1').update(normalizeNewsUrl(url)).digest('hex');
}

function parseGdeltSeendate(seendate) {
  // 20260521T201500Z -> ISO
  if (!seendate || seendate.length < 15) return null;
  const y = seendate.slice(0, 4);
  const m = seendate.slice(4, 6);
  const d = seendate.slice(6, 8);
  const hh = seendate.slice(9, 11);
  const mm = seendate.slice(11, 13);
  const ss = seendate.slice(13, 15);
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}

function monthKeyFromIso(iso) {
  return iso ? iso.slice(0, 7) : null;
}

function sourceLabel(domain) {
  if (!domain) return 'desconocido';
  const base = domain.replace(/^www\./, '').split('.')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function articleToHeadline(article, country, fetchedAt, { tags = [] } = {}) {
  const url = article.url || '';
  const publishedAt = parseGdeltSeendate(article.seendate) || fetchedAt;
  const domain = article.domain || '';
  return {
    id: headlineId(url),
    country,
    published_at: publishedAt,
    fetched_at: fetchedAt,
    source: {
      name: sourceLabel(domain),
      domain,
    },
    url,
    headline: (article.title || '').trim(),
    snippet: null,
    language: article.language || 'es',
    gdelt_tone: article.tone != null ? Number(article.tone) : undefined,
    tags: [...tags],
    indicators_hint: [],
  };
}

function jsonlPath(country, month) {
  return path.join(NEWS_DIR, country, `${month}.jsonl`);
}

function readJsonlFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
  const out = [];
  for (const line of lines) {
    try { out.push(JSON.parse(line)); } catch (_) { /* skip bad line */ }
  }
  return out;
}

function listMonthFiles(country, fromMonth, toMonth) {
  const dir = path.join(NEWS_DIR, country);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => f.replace('.jsonl', ''))
    .filter((m) => (!fromMonth || m >= fromMonth) && (!toMonth || m <= toMonth))
    .sort();
}

function loadCountryHeadlines(country, {
  fromMonth = null,
  toMonth = null,
  limit = 8,
  publishedFrom = null,
  publishedTo = null,
} = {}) {
  const months = listMonthFiles(country, fromMonth, toMonth);
  const byId = new Map();
  for (const month of months) {
    for (const h of readJsonlFile(jsonlPath(country, month))) {
      if (h && h.id) byId.set(h.id, h);
    }
  }
  return Array.from(byId.values())
    .filter((h) => h.headline && h.url)
    .filter((h) => !h.ingest_status || h.ingest_status === 'accepted')
    .filter((h) => {
      const day = (h.published_at || h.fetched_at || '').slice(0, 10);
      if (!day) return true;
      if (publishedFrom && day < publishedFrom) return false;
      if (publishedTo && day > publishedTo) return false;
      return true;
    })
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .slice(0, limit);
}

function formatHeadlineLines(h) {
  const date = h.published_at.slice(0, 10);
  const name = h.source?.name || h.source?.domain || 'desconocido';
  const domain = h.source?.domain || '';
  const author = h.author ? `Autor: ${h.author}` : null;
  const quote = h.body_excerpt || h.snippet;
  const quoteLabel = h.body_excerpt ? 'Extracto' : 'Cita';
  const snippet = quote ? `${quoteLabel}: "${quote.length > 800 ? `${quote.slice(0, 799).trim()}…` : quote}"` : null;
  const lines = [
    `- [${date}] ${name}${author ? ` · ${author}` : ''} (${domain}): "${h.headline}"`,
    `  URL: ${h.url}`,
  ];
  if (snippet) lines.push(`  ${snippet}`);
  if (h.body_fetch === 'ok' && h.body_chars) {
    lines.push(`  Texto recuperado desde URL (${h.body_chars} chars, sin LLM).`);
  }
  return lines;
}

function formatHeadlineLine(h) {
  return formatHeadlineLines(h).join('\n');
}

function buildNewsSectionLines(countries, {
  fromMonth = '2026-04',
  toMonth = '2026-05',
  limitPerCountry = 8,
  publishedFrom = null,
  publishedTo = null,
  themeNote = null,
  indicatorFilter = null,
} = {}) {
  const periodEnd = publishedTo || toMonth;
  const lines = [
    'Titulares de prensa para los países del scope.',
    `Período: ${fromMonth} a ${periodEnd}. Máximo ${limitPerCountry} titulares por país, más reciente primero.`,
  ];
  if (publishedTo) {
    lines.push(`Solo titulares publicados hasta ${publishedTo} (fecha de corte del análisis).`);
  }
  if (themeNote) lines.push(themeNote);
  lines.push('');
  let any = false;
  for (const country of countries) {
    const headlines = loadCountryHeadlines(country, {
      fromMonth,
      toMonth,
      limit: limitPerCountry,
      publishedFrom,
      publishedTo,
    });
    lines.push(`### ${country}`);
    lines.push('');
    if (headlines.length === 0) {
      lines.push('Sin titulares en el snapshot para este país.');
    } else {
      any = true;
      const filtered = indicatorFilter
        ? headlines.filter((h) => (h.indicators_hint || []).some((id) => indicatorFilter.has(id)))
        : headlines;
      const list = filtered.length ? filtered : headlines;
      for (const h of list) {
        lines.push(...formatHeadlineLines(h));
      }
    }
    lines.push('');
  }
  return { lines, any };
}

function resolveNewsMonth(headline) {
  return monthKeyFromIso(headline.published_at || headline.fetched_at)
    || new Date().toISOString().slice(0, 7);
}

function appendHeadline(country, headline) {
  if (!headline.id) {
    headline.id = headlineId(headline.url || `${headline.fetched_at || Date.now()}:${headline.headline || 'untitled'}`);
  }
  const month = resolveNewsMonth(headline);
  const file = jsonlPath(country, month);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(headline)}\n`, 'utf8');
  return true;
}

function buildNewsSectionForDataset(countries, idnos, opts = {}) {
  const filter = new Set(idnos || []);
  return buildNewsSectionLines(countries, {
    ...opts,
    indicatorFilter: filter.size ? filter : null,
    themeNote: opts.themeNote || `Prensa filtrada por indicadores del dataset: ${[...filter].join(', ')}.`,
  });
}

module.exports = {
  NEWS_DIR,
  COUNTRY_GDELT,
  normalizeNewsUrl,
  headlineId,
  parseGdeltSeendate,
  monthKeyFromIso,
  articleToHeadline,
  loadCountryHeadlines,
  formatHeadlineLines,
  formatHeadlineLine,
  buildNewsSectionLines,
  buildNewsSectionForDataset,
  resolveNewsMonth,
  appendHeadline,
  readJsonlFile,
  jsonlPath,
  listMonthFiles,
};
