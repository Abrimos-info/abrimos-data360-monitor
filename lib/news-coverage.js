'use strict';

const fs = require('fs');
const path = require('path');
const { listMonthFiles, readJsonlFile, NEWS_DIR } = require('./news');
const { pipeLog } = require('./pipe-log');

function loadHeadlinesInWindow(countries, from, to, { newsDir = NEWS_DIR } = {}) {
  const fromMonth = from.slice(0, 7);
  const toMonth = to.slice(0, 7);
  const out = [];
  for (const country of countries) {
    const dir = path.join(newsDir, country);
    const months = listMonthFiles(country, fromMonth, toMonth);
    // listMonthFiles reads from NEWS_DIR — use direct dir scan when newsDir override
    const monthFiles = newsDir === NEWS_DIR
      ? months
      : (fs.existsSync(dir)
        ? fs.readdirSync(dir)
          .filter((f) => f.endsWith('.jsonl'))
          .map((f) => f.replace('.jsonl', ''))
          .filter((m) => (!fromMonth || m >= fromMonth) && (!toMonth || m <= toMonth))
          .sort()
        : []);
    for (const month of monthFiles) {
      for (const h of readJsonlFile(path.join(dir, `${month}.jsonl`))) {
        if (!h?.headline || !h?.url) continue;
        const day = (h.published_at || h.fetched_at || '').slice(0, 10);
        if (!day || day < from || day > to) continue;
        out.push({ ...h, country: h.country || country });
      }
    }
  }
  return out;
}

function summarizeIndicatorNewsCoverage(idnos, countries, {
  from,
  to,
  minAccepted = 1,
  newsDir,
} = {}) {
  const headlines = loadHeadlinesInWindow(countries, from, to, { newsDir });
  const byIdno = Object.fromEntries(idnos.map((idno) => [idno, { accepted: 0, countries: new Set() }]));

  for (const h of headlines) {
    if (h.ingest_status && h.ingest_status !== 'accepted') continue;
    for (const idno of (h.indicators_hint || [])) {
      if (!byIdno[idno]) continue;
      byIdno[idno].accepted += 1;
      byIdno[idno].countries.add(h.country);
    }
  }

  const hasNews = [];
  const needsNews = [];
  const details = {};
  for (const idno of idnos) {
    const info = byIdno[idno];
    const countriesList = [...info.countries].sort();
    details[idno] = { accepted: info.accepted, countries: countriesList };
    if (info.accepted >= minAccepted) hasNews.push(idno);
    else needsNews.push(idno);
  }

  return {
    total: idnos.length,
    hasNews,
    needsNews,
    details,
    minAccepted,
    window: `${from}→${to}`,
  };
}

function summarizeCountryNewsCoverage(countries, {
  from,
  to,
  minAccepted = parseInt(process.env.NEWS_MIN_ACCEPTED_PER_COUNTRY || '8', 10),
  newsDir,
} = {}) {
  const headlines = loadHeadlinesInWindow(countries, from, to, { newsDir });
  const byCountry = Object.fromEntries(
    countries.map((c) => [c, { accepted: 0, latest: null }]),
  );

  for (const h of headlines) {
    if (h.ingest_status && h.ingest_status !== 'accepted') continue;
    const country = h.country;
    if (!byCountry[country]) continue;
    byCountry[country].accepted += 1;
    const day = (h.published_at || h.fetched_at || '').slice(0, 10);
    if (day && (!byCountry[country].latest || day > byCountry[country].latest)) {
      byCountry[country].latest = day;
    }
  }

  const hasNews = [];
  const needsNews = [];
  const details = {};
  for (const country of countries) {
    const info = byCountry[country];
    details[country] = { accepted: info.accepted, latest: info.latest };
    if (info.accepted >= minAccepted) hasNews.push(country);
    else needsNews.push(country);
  }

  return {
    total: countries.length,
    hasNews,
    needsNews,
    details,
    minAccepted,
    window: `${from}→${to}`,
  };
}

function logCountryNewsCoverage(scope, summary) {
  pipeLog(scope, 'coverage', {
    window: summary.window,
    countries: summary.total,
    has_news: summary.hasNews.length,
    needs_news: summary.needsNews.length,
    min_accepted: summary.minAccepted,
  });
  for (const country of summary.hasNews) {
    const d = summary.details[country];
    pipeLog(scope, 'skip', {
      country,
      reason: 'has news',
      accepted: d.accepted,
      latest: d.latest || 'none',
    });
  }
  for (const country of summary.needsNews) {
    const d = summary.details[country];
    pipeLog(scope, 'needs-fetch', {
      country,
      accepted: d.accepted,
      latest: d.latest || 'none',
    });
  }
}

function logNewsCoverage(scope, summary) {
  pipeLog(scope, 'coverage', {
    window: summary.window,
    total: summary.total,
    has_news: summary.hasNews.length,
    needs_news: summary.needsNews.length,
    min_accepted: summary.minAccepted,
  });
  if (summary.hasNews.length) {
    pipeLog(scope, 'has-news', { idnos: summary.hasNews.join(',') });
    for (const idno of summary.hasNews) {
      const d = summary.details[idno];
      pipeLog(scope, 'skip', {
        idno,
        reason: 'has news',
        accepted: d.accepted,
        countries: d.countries.join(',') || 'none',
      });
    }
  }
  if (summary.needsNews.length) {
    pipeLog(scope, 'needs-news', { idnos: summary.needsNews.join(',') });
    for (const idno of summary.needsNews) {
      const d = summary.details[idno];
      pipeLog(scope, 'needs-fetch', {
        idno,
        accepted: d.accepted,
        countries: d.countries.join(',') || 'none',
      });
    }
  }
}

module.exports = {
  loadHeadlinesInWindow,
  summarizeIndicatorNewsCoverage,
  summarizeCountryNewsCoverage,
  logNewsCoverage,
  logCountryNewsCoverage,
};
