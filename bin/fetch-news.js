#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { createTimer, startRunTimer } = require('../lib/timing');
const { pipeLog } = require('../lib/pipe-log');
const { buildNewsSectionLines } = require('../lib/news');
const { computeNewsWindow } = require('../lib/news-window');
const { fetchNewsPool } = require('../lib/news-pool');
const { fetchNews, DEFAULT_COUNTRIES } = require('../lib/news-fetch');
const { fetchNewsGemini } = require('../lib/news-gemini');

function parseArgs(argv) {
  const args = {
    countries: DEFAULT_COUNTRIES,
    from: null,
    to: null,
    asOf: null,
    mode: process.env.NEWS_MODE || 'pool',
    maxRecords: 40,
    maxPerTheme: 6,
    maxPerIndicator: 3,
    maxIndicators: null,
    sample: false,
    preview: true,
    useThemes: true,
    batch: process.env.GEMINI_NEWS_BATCH !== 'false',
    fetchBody: process.env.NEWS_FETCH_BODY !== 'false',
    skipCovered: process.env.NEWS_SKIP_COVERED !== 'false',
    watchlistFile: null,
    gdeltFallback: process.env.NEWS_GDELT_FALLBACK !== 'false',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sample') { args.sample = true; continue; }
    if (a === '--no-preview') { args.preview = false; continue; }
    if (a === '--no-themes') { args.useThemes = false; continue; }
    if (a === '--mode' && argv[i + 1]) { args.mode = argv[++i]; continue; }
    if (a.startsWith('--mode=')) { args.mode = a.slice('--mode='.length); continue; }
    if (a === '--watchlist-file' && argv[i + 1]) { args.watchlistFile = argv[++i]; continue; }
    if (a.startsWith('--watchlist-file=')) { args.watchlistFile = a.slice('--watchlist-file='.length); continue; }
    if (a === '--countries' && argv[i + 1]) { args.countries = argv[++i].split(',').map((s) => s.trim().toUpperCase()); continue; }
    if (a.startsWith('--countries=')) { args.countries = a.slice('--countries='.length).split(',').map((s) => s.trim().toUpperCase()); continue; }
    if (a === '--from' && argv[i + 1]) { args.from = argv[++i]; continue; }
    if (a.startsWith('--from=')) { args.from = a.slice('--from='.length); continue; }
    if (a === '--to' && argv[i + 1]) { args.to = argv[++i]; continue; }
    if (a.startsWith('--to=')) { args.to = a.slice('--to='.length); continue; }
    if (a === '--as-of' && argv[i + 1]) { args.asOf = argv[++i]; continue; }
    if (a.startsWith('--as-of=')) { args.asOf = a.slice('--as-of='.length); continue; }
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
    if (a === '--no-gdelt-fallback') { args.gdeltFallback = false; continue; }
    if (a === '--gdelt-only') { args.mode = 'gdelt'; continue; }
  }
  if (args.sample) {
    args.countries = ['ARG', 'MEX'];
    args.maxPerTheme = 4;
    args.maxRecords = 20;
  }
  return args;
}

function resolveWindow(args) {
  if (args.from && args.to) {
    return { from: args.from, to: args.to };
  }
  return computeNewsWindow({
    from: args.from,
    to: args.to,
    asOf: args.asOf,
  });
}

async function main() {
  startRunTimer('fetch-news');
  const timer = createTimer('fetch-news');
  const args = parseArgs(process.argv.slice(2));
  const window = resolveWindow(args);
  args.from = window.from;
  args.to = window.to;

  pipeLog('fetch-news', 'config', {
    mode: args.mode,
    countries: args.countries.join(','),
    window: `${args.from}→${args.to}`,
    skip_covered: args.skipCovered ? 'on' : 'off',
  });

  if (args.mode === 'pool') {
    const result = await fetchNewsPool({
      countries: args.countries,
      from: args.from,
      to: args.to,
      replayFrom: args.from,
      replayTo: args.to,
      skipCovered: args.skipCovered,
      fetchBody: args.fetchBody,
      gdeltFallback: args.gdeltFallback,
    });
    pipeLog('fetch-news', 'done', {
      mode: 'pool',
      skipped: result.skipped ? 'yes' : 'no',
      calls: result.totalCalls || 0,
      gemini: result.geminiCalls || 0,
      gdelt: result.gdeltCalls || 0,
      accepted: result.totalAccepted || 0,
      saved: result.totalNew || 0,
    });
  } else if (args.mode === 'indicator') {
    const watchlistFile = args.watchlistFile
      || require('path').join(__dirname, '..', 'data', 'dynamic-watchlist.json');
    const result = await fetchNewsGemini({
      countries: args.countries,
      watchlistFile: require('fs').existsSync(watchlistFile) ? watchlistFile : null,
      maxPerIndicator: args.maxPerIndicator,
      maxIndicators: args.maxIndicators,
      from: args.from,
      to: args.to,
      batch: args.batch,
      fetchBody: args.fetchBody,
      skipCovered: args.skipCovered,
    });
    pipeLog('fetch-news', 'done', {
      mode: 'indicator',
      accepted: result.totalAccepted || 0,
      saved: result.totalNew || 0,
      failed: result.failed || 0,
      calls: result.totalCalls || 0,
    });
  } else if (args.mode === 'gdelt') {
    const summary = await fetchNews({
      countries: args.countries,
      from: args.from,
      to: args.to,
      maxRecords: args.maxRecords,
      maxPerTheme: args.maxPerTheme,
      useThemes: args.useThemes,
    });
    pipeLog('fetch-news', 'done', {
      mode: 'gdelt',
      fetched: summary.totalFetched,
      appended: summary.totalNew,
    });
  } else {
    throw new Error(`Unknown news mode: ${args.mode}`);
  }

  timer.end('total', args.mode);

  if (args.preview) {
    console.log('\n--- Preview: Discurso público reciente ---\n');
    const { lines } = buildNewsSectionLines(args.countries, {
      fromMonth: args.from.slice(0, 7),
      toMonth: args.to.slice(0, 7),
      publishedTo: args.asOf || args.to,
      limitPerCountry: 8,
      themeNote: args.mode === 'pool'
        ? 'Fuente: pool por país (Gemini → GDELT fallback).'
        : null,
    });
    console.log('## Discurso público reciente\n');
    console.log(lines.join('\n'));
  }
}

main().catch((err) => {
  console.error('[fetch-news] fatal:', err.message);
  process.exit(1);
});
