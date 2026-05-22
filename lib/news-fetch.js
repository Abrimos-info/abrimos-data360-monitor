'use strict';

const axios = require('axios');
const {
  COUNTRY_GDELT,
  articleToHeadline,
  appendHeadline,
} = require('./news');
const {
  buildCountryNewsQuery,
  themesForAnnualWatchlist,
  indicatorHintsFromThemes,
} = require('./news-themes');

const DEFAULT_COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];
const GDELT_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_PACE_MS = 8000;
const MAX_ATTEMPTS = 5;

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
  return rateLimited ? GDELT_PACE_MS * (2 ** attempt) : 2000 * (attempt + 1);
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
      if (isRateLimited(null, res.data)) throw Object.assign(new Error('GDELT rate limit'), { rateLimited: true });
      return (res.data && typeof res.data === 'object') ? (res.data.articles || []) : [];
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS - 1) await sleep(backoffMs(attempt, isRateLimited(err, err.response?.data)));
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

async function fetchNews(opts = {}) {
  const countries = opts.countries || DEFAULT_COUNTRIES;
  const from = opts.from || '2026-04-01';
  const to = opts.to || new Date().toISOString().slice(0, 10);
  const maxRecords = opts.maxRecords || 40;
  const maxPerTheme = opts.maxPerTheme || 6;
  const useThemes = opts.useThemes !== false;
  const fetchedAt = new Date().toISOString();
  const themes = useThemes ? themesForAnnualWatchlist() : null;
  const summary = { countries: {}, totalNew: 0, totalFetched: 0, from, to };

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    if (i > 0) await sleep(GDELT_PACE_MS);
    try {
      const { articles, articleThemes } = await fetchCountryNews(country, from, to, {
        themes, maxRecords, maxPerTheme,
      });
      let added = 0;
      for (let j = 0; j < articles.length; j++) {
        const article = articles[j];
        const articleTags = articleThemes?.[j] || [];
        const headline = articleToHeadline(article, country, fetchedAt, { tags: articleTags });
        const hints = indicatorHintsFromThemes(articleTags);
        if (hints.length) headline.indicators_hint = hints;
        if (!headline.headline || !headline.url) continue;
        if (appendHeadline(country, headline)) added += 1;
      }
      summary.countries[country] = { new: added, fetched: articles.length };
      summary.totalNew += added;
      summary.totalFetched += articles.length;
    } catch (err) {
      summary.countries[country] = { error: err.message, new: 0, fetched: 0 };
    }
  }
  return summary;
}

module.exports = {
  fetchNews,
  fetchCountryNews,
  fetchGdeltQuery,
  DEFAULT_COUNTRIES,
  GDELT_PACE_MS,
};
