'use strict';

const axios = require('axios');
const { pipeLog } = require('./pipe-log');
const {
  COUNTRY_GDELT,
  articleToHeadline,
  appendHeadline,
} = require('./news');
const {
  buildCountryNewsQuery,
  themesForAnnualWatchlist,
  themesForIndicatorOrFallback,
  indicatorHintsFromThemes,
} = require('./news-themes');

const DEFAULT_COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];
const GDELT_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_PACE_MS = parseInt(process.env.GDELT_PACE_MS || '8000', 10);
const MAX_ATTEMPTS = parseInt(process.env.GDELT_MAX_ATTEMPTS || '2', 10);
const GDELT_FALLBACK_MAX_RECORDS = parseInt(process.env.GDELT_FALLBACK_MAX_RECORDS || '15', 10);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function toGdeltDatetime(isoDate, endOfDay) {
  const [y, m, d] = isoDate.split('-');
  return endOfDay ? `${y}${m}${d}235959` : `${y}${m}${d}000000`;
}

function isRateLimited(err, data) {
  if (err?.response?.status === 429) return true;
  if (typeof data === 'string' && data.includes('Please limit requests')) return true;
  return false;
}

function backoffMs(attempt, rateLimited) {
  if (rateLimited) return Math.min(GDELT_PACE_MS * (2 ** attempt), 32000);
  return 2000 * (attempt + 1);
}

async function fetchGdeltQuery(query, from, to, maxRecords) {
  const params = {
    query,
    mode: 'artlist',
    format: 'json',
    sort: 'DateDesc',
    maxrecords: maxRecords,
    startdatetime: toGdeltDatetime(from, false),
    enddatetime: toGdeltDatetime(to, true),
  };

  let lastErr;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await axios.get(GDELT_URL, {
        params,
        timeout: 45000,
        headers: { 'User-Agent': 'abrimos-data360-monitor/0.1 (research; contact@abrimos.info)' },
        validateStatus: (s) => s >= 200 && s < 300,
      });
      if (isRateLimited(null, res.data)) {
        throw Object.assign(new Error('GDELT rate limit'), { rateLimited: true });
      }
      return (res.data && typeof res.data === 'object') ? (res.data.articles || []) : [];
    } catch (err) {
      lastErr = err;
      const rateLimited = isRateLimited(err, err.response?.data);
      if (rateLimited && attempt >= MAX_ATTEMPTS - 1) break;
      if (attempt < MAX_ATTEMPTS - 1) await sleep(backoffMs(attempt, rateLimited));
    }
  }
  throw lastErr;
}

async function fetchCountryNews(country, from, to, { themes, maxRecords, maxPerTheme }) {
  const gdeltCountry = COUNTRY_GDELT[country];
  if (!gdeltCountry) throw new Error(`Unknown country: ${country}`);

  if (!themes) {
    const query = `SOURCECOUNTRY:${gdeltCountry} SOURCELANG:Spanish`;
    const articles = await fetchGdeltQuery(query, from, to, maxRecords);
    return { articles, articleThemes: articles.map(() => []), themesUsed: [] };
  }

  const byUrl = new Map();
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    if (i > 0) await sleep(GDELT_PACE_MS);
    try {
      const query = buildCountryNewsQuery(country, { theme });
      const articles = await fetchGdeltQuery(query, from, to, maxPerTheme);
      for (const a of articles) {
        if (a.url && !byUrl.has(a.url)) byUrl.set(a.url, { article: a, themes: [theme] });
        else if (a.url && byUrl.has(a.url)) byUrl.get(a.url).themes.push(theme);
      }
    } catch (_) { /* skip failed theme */ }
  }

  const merged = [...byUrl.values()]
    .map(({ article, themes: articleThemes }) => ({ article, themes: [...new Set(articleThemes)] }))
    .sort((a, b) => (b.article.seendate || '').localeCompare(a.article.seendate || ''))
    .slice(0, maxRecords);

  return {
    articles: merged.map((m) => m.article),
    articleThemes: merged.map((m) => m.themes),
    themesUsed: themes,
  };
}

function appendGdeltArticles(articles, articleThemes, country, fetchedAt, { idnoHint } = {}) {
  let added = 0;
  const seenUrls = new Set();
  for (let j = 0; j < articles.length; j++) {
    const article = articles[j];
    const articleTags = articleThemes?.[j] || [];
    const headline = articleToHeadline(article, country, fetchedAt, { tags: articleTags });
    headline.fetch_source = headline.fetch_source || 'gdelt';
    const hints = idnoHint ? [idnoHint] : indicatorHintsFromThemes(articleTags);
    if (hints.length) headline.indicators_hint = hints;

    const tags = [];
    let status = 'accepted';
    if (!headline.headline) {
      tags.push('missing_headline');
      status = 'rejected';
    }
    if (!headline.url) {
      tags.push('missing_url');
      status = 'rejected';
    }
    if (headline.url && seenUrls.has(headline.id)) {
      tags.push('duplicate_url_run');
      if (status === 'accepted') status = 'duplicate';
    }
    headline.ingest_status = status;
    headline.ingest_tags = tags;
    headline.gdelt_raw = article;

    appendHeadline(country, headline);
    if (headline.url) seenUrls.add(headline.id);
    added += 1;
  }
  return added;
}

async function fetchNews(opts = {}) {
  const countries = opts.countries || DEFAULT_COUNTRIES;
  const from = opts.from || '2026-04-01';
  const to = opts.to || new Date().toISOString().slice(0, 10);
  const maxRecords = opts.maxRecords || 40;
  const maxPerTheme = opts.maxPerTheme || 6;
  const useThemes = opts.useThemes !== false;
  const fetchedAt = new Date().toISOString();
  const themes = useThemes ? themesForAnnualWatchlist() : null;
  const summary = { countries: {}, totalNew: 0, totalFetched: 0, from, to, failedCountries: [] };

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (i > 0) await sleep(GDELT_PACE_MS);
    pipeLog('news-gdelt', 'country', {
      country,
      window: `${from}→${to}`,
      themes: themes ? themes.length : 0,
      max: maxRecords,
    });
    try {
      const { articles, articleThemes } = await fetchCountryNews(country, from, to, {
        themes, maxRecords, maxPerTheme,
      });
      const added = appendGdeltArticles(articles, articleThemes, country, fetchedAt);
      summary.countries[country] = { new: added, fetched: articles.length };
      summary.totalNew += added;
      summary.totalFetched += articles.length;
      pipeLog('news-gdelt', 'done', { country, fetched: articles.length, appended: added });
    } catch (err) {
      summary.countries[country] = { error: err.message, new: 0, fetched: 0 };
      summary.failedCountries.push(country);
      pipeLog('news-gdelt', 'fail', { country, error: err.message }, 'warn');
    }
  }

  if (summary.failedCountries.length) {
    pipeLog('news-gdelt', 'summary', {
      failed: summary.failedCountries.join(','),
      ok: countries.length - summary.failedCountries.length,
    }, 'warn');
  }
  return summary;
}

/** GDELT fallback for specific indicators (Gemini pending idnos). */
async function fetchGdeltForIndicators(opts = {}) {
  const idnos = (opts.idnos || []).filter(Boolean);
  if (!idnos.length) {
    return { idnos: 0, totalNew: 0, totalFetched: 0, failedIdnos: [] };
  }

  const countries = opts.countries || DEFAULT_COUNTRIES;
  const from = opts.from || '2026-04-01';
  const to = opts.to || new Date().toISOString().slice(0, 10);
  const maxPerCountry = opts.maxPerCountry || 4;
  const minAccepted = opts.minAccepted || 2;
  const fetchedAt = new Date().toISOString();
  const summary = { idnos: idnos.length, totalNew: 0, totalFetched: 0, failedIdnos: [] };

  pipeLog('news-gdelt', 'indicators', {
    count: idnos.length,
    window: `${from}→${to}`,
    pace: `${GDELT_PACE_MS}ms`,
  });

  for (let i = 0; i < idnos.length; i++) {
    const idno = idnos[i];
    if (i > 0) await sleep(GDELT_PACE_MS);
    const themes = themesForIndicatorOrFallback(idno);
    let accepted = 0;
    let fetched = 0;

    pipeLog('news-gdelt', 'idno', { idno, themes: themes.join(',') || 'none' });

    for (const country of countries) {
      if (accepted >= minAccepted) break;
      try {
        const query = themes.length
          ? buildCountryNewsQuery(country, { themes })
          : `SOURCECOUNTRY:${COUNTRY_GDELT[country]} SOURCELANG:Spanish`;
        const articles = await fetchGdeltQuery(query, from, to, maxPerCountry);
        fetched += articles.length;
        const added = appendGdeltArticles(
          articles,
          articles.map(() => themes),
          country,
          fetchedAt,
          { idnoHint: idno },
        );
        accepted += added;
        if (added > 0) {
          pipeLog('news-gdelt', 'idno-done', { idno, country, appended: added });
        }
      } catch (err) {
        pipeLog('news-gdelt', 'idno-fail', { idno, country, error: err.message }, 'warn');
      }
      if (accepted < minAccepted) await sleep(GDELT_PACE_MS);
    }

    summary.totalNew += accepted;
    summary.totalFetched += fetched;
    if (accepted === 0) summary.failedIdnos.push(idno);
  }

  if (summary.failedIdnos.length) {
    pipeLog('news-gdelt', 'indicators-summary', {
      failed: summary.failedIdnos.length,
      ok: idnos.length - summary.failedIdnos.length,
    }, 'warn');
  }
  return summary;
}

/** Single-country GDELT fetch (one query, no per-theme loop). */
async function fetchGdeltForCountry(country, from, to, {
  maxRecords = parseInt(process.env.NEWS_GDELT_MAX_PER_COUNTRY || '12', 10),
  useThemes = false,
} = {}) {
  const fetchedAt = new Date().toISOString();
  const themes = useThemes ? themesForAnnualWatchlist() : null;
  const { articles, articleThemes } = await fetchCountryNews(country, from, to, {
    themes,
    maxRecords,
    maxPerTheme: 6,
  });
  const added = appendGdeltArticles(articles, articleThemes, country, fetchedAt);
  return { country, fetched: articles.length, added, accepted: added };
}

module.exports = {
  fetchNews,
  fetchGdeltForIndicators,
  fetchGdeltForCountry,
  fetchCountryNews,
  fetchGdeltQuery,
  DEFAULT_COUNTRIES,
  GDELT_PACE_MS,
  GDELT_FALLBACK_MAX_RECORDS,
};
