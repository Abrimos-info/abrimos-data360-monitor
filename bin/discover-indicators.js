#!/usr/bin/env node
// bin/discover-indicators.js
'use strict';

const fs = require('fs');
const path = require('path');
const { buildDynamicWatchlist } = require('../lib/dynamic-watchlist');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { daysBack: 7, out: path.join(REPO_ROOT, 'data', 'dynamic-watchlist.json') };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--days-back') args.daysBack = parseInt(argv[++i], 10);
    if (argv[i] === '--out') args.out = argv[++i];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`[discover] Searching for datasets updated in the last ${args.daysBack} days ...`);

  const watchlist = await buildDynamicWatchlist({ daysBack: args.daysBack });
  console.log(`[discover] Found ${watchlist.length} indicators across ${new Set(watchlist.map((e) => e.database_id)).size} datasets`);

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(watchlist, null, 2) + '\n', 'utf8');
  console.log(`[discover] Written to ${args.out}`);

  const byDataset = {};
  for (const e of watchlist) {
    if (!byDataset[e.database_id]) byDataset[e.database_id] = [];
    byDataset[e.database_id].push(e.idno);
  }
  for (const [db, idnos] of Object.entries(byDataset)) {
    console.log(`  ${db}: ${idnos.length} indicators`);
  }
}

main().catch((e) => { process.stderr.write(`Error: ${e.message}\n`); process.exit(1); });
