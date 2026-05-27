#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { createTimer } = require('../lib/timing');
const { pipeLog } = require('../lib/pipe-log');
const fs = require('fs');
const path = require('path');
const { buildNewsSectionLines } = require('../lib/news');
const { themesForAnnualWatchlist } = require('../lib/news-themes');
const { fetchNews, fetchGdeltForIndicators, DEFAULT_COUNTRIES, GDELT_PACE_MS, GDELT_FALLBACK_MAX_RECORDS } = require('../lib/news-fetch');
const { fetchNewsGemini } = require('../lib/news-gemini');

function parseArgs(argv) {
  const args = {
    countries: DEFAULT_COUNTRIES,
    from: '2026-04-01',
    to: '2026-05-21',
    maxRecords: 40,
    maxPerTheme: 6,
    maxPerIndicator: 3,
    maxIndicators: null,
    sample: false,
    preview: true,
    useThemes: true,
    batch: process.env.GEMINI_NEWS_BATCH !== 'false',
    fetchBody: process.env.NEWS_FETCH_BODY !== 'false',
    skipCovered: process.env.GEMINI_SKIP_COVERED !== 'false',
    provider: process.env.GEMINI_API_KEY ? 'gemini' : 'gdelt',
    watchlistFile: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sample') { args.sample = true; continue; }
    if (a === '--no-preview') { args.preview = false; continue; }
    if (a === '--no-themes') { args.useThemes = false; continue; }
    if (a === '--provider' && argv[i + 1]) { args.provider = argv[++i]; continue; }
    if (a.startsWith('--provider=')) { args.provider = a.slice('--provider='.length); continue; }
    if (a === '--watchlist-file' && argv[i + 1]) { args.watchlistFile = argv[++i]; continue; }
    if (a.startsWith('--watchlist-file=')) { args.watchlistFile = a.slice('--watchlist-file='.length); continue; }
    if (a === '--countries' && argv[i + 1]) { args.countries = argv[++i].split(',').map((s) => s.trim().toUpperCase()); continue; }
    if (a.startsWith('--countries=')) { args.countries = a.slice('--countries='.length).split(',').map((s) => s.trim().toUpperCase()); continue; }
    if (a === '--from' && argv[i + 1]) { args.from = argv[++i]; continue; }
    if (a.startsWith('--from=')) { args.from = a.slice('--from='.length); continue; }
    if (a === '--to' && argv[i + 1]) { args.to = argv[++i]; continue; }
    if (a.startsWith('--to=')) { args.to = a.slice('--to='.length); continue; }
    if (a === '--max-records' && argv[i + 1]) { args.maxRecords = parseInt(argv[++i], 10); continue; }
    if (a.startsWith('--max-records=')) { args.maxRecords = parseInt(a.slice('--max-records='.length), 10); continue; }
    if (a === '--max-per-theme' && argv[i + 1]) { args.maxPerTheme = parseInt(argv[++i], 10); continue; }
    if (a.startsWith('--max-per-theme=')) { args.maxPerTheme = parseInt(a.slice('--max-per-theme='.length), 10); continue; }
    if (a === '--max-per-indicator' && argv[i + 1]) { args.maxPerIndicator = parseInt(argv[++i], 10); continue; }
    if (a.startsWith('--max-per-indicator=')) { args.maxPerIndicator = parseInt(a.slice('--max-per-indicator='.length), 10); continue; }
    if (a === '--max-indicators' && argv[i + 1]) { args.maxIndicators = parseInt(argv[++i], 10); continue; }
    if (a.startsWith('--max-indicators=')) { args.maxIndicators = parseInt(a.slice('--max-indicators='.length), 10); continue; }
    if (a === '--batch') { args.batch = true; continue; }
    if (a === '--no-batch') { args.batch = false; continue; }
    if (a === '--no-body') { args.fetchBody = false; continue; }
    if (a === '--skip-covered') { args.skipCovered = true; continue; }
    if (a === '--no-skip-covered') { args.skipCovered = false; continue; }
  }
  if (args.sample) {
    args.countries = ['ARG', 'MEX'];
    args.maxPerTheme = 4;
    args.maxRecords = 20;
  }
  if (!args.watchlistFile) {
    const defaultWatchlist = path.join(__dirname, '..', 'data', 'dynamic-watchlist.json');
    if (fs.existsSync(defaultWatchlist) && args.provider === 'gemini') {
      args.watchlistFile = defaultWatchlist;
    }
  }
  return args;
}

async function main() {
  const timer = createTimer('fetch-news');
  const args = parseArgs(process.argv.slice(2));
  pipeLog('fetch-news', 'config', {
    provider: args.provider,
    countries: args.countries.join(','),
    window: `${args.from}→${args.to}`,
  });

  if (args.provider === 'gemini') {
    const { GEMINI_PACE_MS } = require('../lib/news-gemini');
    pipeLog('fetch-news', 'gemini', {
      pace: `${GEMINI_PACE_MS}ms`,
      batch: args.batch ? 'on' : 'off',
      body: args.fetchBody ? 'fetch' : 'skip',
      skip_covered: args.skipCovered ? 'on' : 'off',
    });
    const result = await fetchNewsGemini({
      countries: args.countries,
      watchlistFile: args.watchlistFile,
      maxPerIndicator: args.maxPerIndicator,
      maxIndicators: args.maxIndicators,
      from: args.from,
      to: args.to,
      batch: args.batch,
      fetchBody: args.fetchBody,
      skipCovered: args.skipCovered,
    });
    pipeLog('fetch-news', 'done', {
      provider: 'gemini',
      accepted: result.totalAccepted || 0,
      saved: result.totalNew || 0,
      failed: result.failed || 0,
      aborted: result.aborted ? 'yes' : 'no',
    });

    const fallbackEnabled = process.env.GEMINI_FALLBACK_TO_GDELT !== 'false';
    if (fallbackEnabled && result.aborted && result.abortedReason === 'quota_exhausted') {
      pipeLog('fetch-news', 'fallback', { provider: 'gdelt', reason: result.abortedReason }, 'warn');
      const fallbackMax = parseInt(process.env.GDELT_FALLBACK_MAX_RECORDS || String(GDELT_FALLBACK_MAX_RECORDS), 10);

      if (result.pendingIdnos?.length) {
        pipeLog('fetch-news', 'gdelt-indicators', {
          count: result.pendingIdnos.length,
          pace: `${GDELT_PACE_MS}ms`,
        });
        const indSummary = await fetchGdeltForIndicators({
          idnos: result.pendingIdnos,
          countries: args.countries,
          from: args.from,
          to: args.to,
        });
        pipeLog('fetch-news', 'gdelt-indicators-done', {
          appended: indSummary.totalNew,
          failed: indSummary.failedIdnos?.length || 0,
        });
      }

      pipeLog('fetch-news', 'gdelt', { pace: `${GDELT_PACE_MS}ms`, max: fallbackMax });
      const countrySummary = await fetchNews({
        countries: args.countries,
        from: args.from,
        to: args.to,
        maxRecords: fallbackMax,
        maxPerTheme: args.maxPerTheme,
        useThemes: false,
      });
      if (countrySummary.failedCountries?.length) {
        pipeLog('fetch-news', 'gdelt-failed-countries', {
          countries: countrySummary.failedCountries.join(','),
        }, 'warn');
      }
    }
  } else {
    pipeLog('fetch-news', 'gdelt', { pace: `${GDELT_PACE_MS}ms` });
    const summary = await fetchNews({
      countries: args.countries,
      from: args.from,
      to: args.to,
      maxRecords: args.maxRecords,
      maxPerTheme: args.maxPerTheme,
      useThemes: args.useThemes,
    });
    for (const [country, info] of Object.entries(summary.countries)) {
      if (info.error) {
        pipeLog('fetch-news', 'fail', { country, error: info.error }, 'warn');
      } else {
        pipeLog('fetch-news', 'country', { country, merged: info.fetched, new: info.new });
      }
    }
    pipeLog('fetch-news', 'done', {
      provider: 'gdelt',
      fetched: summary.totalFetched,
      appended: summary.totalNew,
    });
  }

  timer.end('total', args.provider);

  if (args.preview) {
    const themeNote = args.provider === 'gemini'
      ? 'Fuente: Gemini + búsqueda web por descripción de indicador.'
      : `Filtro GDELT: ${themesForAnnualWatchlist().length} temas validados.`;
    console.log('\n--- Preview: Discurso público reciente ---\n');
    const { lines } = buildNewsSectionLines(args.countries, {
      fromMonth: args.from.slice(0, 7),
      toMonth: args.to.slice(0, 7),
      limitPerCountry: 8,
      themeNote,
    });
    console.log('## Discurso público reciente\n');
    console.log(lines.join('\n'));
  }
}

main().catch((err) => {
  console.error('[fetch-news] fatal:', err.message);
  process.exit(1);
});
