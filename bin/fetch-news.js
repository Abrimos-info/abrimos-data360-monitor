#!/usr/bin/env node
'use strict';

const { buildNewsSectionLines } = require('../lib/news');
const { themesForAnnualWatchlist } = require('../lib/news-themes');
const { fetchNews, DEFAULT_COUNTRIES, GDELT_PACE_MS } = require('../lib/news-fetch');

function parseArgs(argv) {
  const args = {
    countries: DEFAULT_COUNTRIES,
    from: '2026-04-01',
    to: '2026-05-21',
    maxRecords: 40,
    maxPerTheme: 6,
    sample: false,
    preview: true,
    useThemes: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sample') { args.sample = true; continue; }
    if (a === '--no-preview') { args.preview = false; continue; }
    if (a === '--no-themes') { args.useThemes = false; continue; }
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
  }
  if (args.sample) {
    args.countries = ['ARG', 'MEX'];
    args.maxPerTheme = 4;
    args.maxRecords = 20;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log('[fetch-news] countries:', args.countries.join(', '));
  console.log('[fetch-news] window:', args.from, '→', args.to);
  console.log('[fetch-news] pace:', `${GDELT_PACE_MS}ms between theme requests`);

  const summary = await fetchNews({
    countries: args.countries,
    from: args.from,
    to: args.to,
    maxRecords: args.maxRecords,
    maxPerTheme: args.maxPerTheme,
    useThemes: args.useThemes,
  });

  for (const [country, info] of Object.entries(summary.countries)) {
    if (info.error) console.log(`[fetch-news] ${country} FAILED: ${info.error}`);
    else console.log(`[fetch-news] ${country}: ${info.fetched} merged, ${info.new} new`);
  }
  console.log(`[fetch-news] done: ${summary.totalFetched} fetched, ${summary.totalNew} appended`);

  if (args.preview) {
    const themes = args.useThemes ? themesForAnnualWatchlist() : null;
    const themeNote = themes ? `Filtro GDELT: ${themes.length} temas validados.` : null;
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
