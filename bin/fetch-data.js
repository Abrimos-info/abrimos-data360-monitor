#!/usr/bin/env node
'use strict';

/**
 * Unified watchlist fetcher with conditional HEAD freshness probe (Phase 1).
 *
 * Outputs:
 *   data/changed-since.json          Indicators updated since last probe
 *   data/changed-since-YYYY-MM-DD.json  Dated copy
 *   data/index.json                  Per-indicator freshness summary
 *   data/snapshots/{IDNO}.etag       ETag cache for next conditional HEAD
 *   data/snapshots/{IDNO}.csv        Bulk CSV (when changed or --force)
 *   data/snapshots/{IDNO}.meta.json  Full metadata document
 *
 * Run:
 *   node bin/fetch-data.js                 probe + fetch changed
 *   node bin/fetch-data.js --probe-only      probe only, no downloads
 *   node bin/fetch-data.js --force           treat all as changed
 */

const fs = require('fs');
const path = require('path');
const { getWatchlist } = require('../lib/watchlist');
const { probeWatchlist, buildChangedSinceReport, buildIndex } = require('../lib/freshness-probe');
const { downloadCsvSnapshot, downloadDataDict, downloadMetadataJson, refreshContextForIndicators } = require('../lib/context-fetch');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { probeOnly: false, force: false, dataDir: null, watchlistFile: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--probe-only') args.probeOnly = true;
    else if (a === '--force') args.force = true;
    else if (a === '--data-dir') args.dataDir = argv[++i];
    else if (a === '--watchlist-file') args.watchlistFile = argv[++i];
  }
  return args;
}

function loadWatchlist(opts) {
  if (opts.watchlistFile) {
    return JSON.parse(fs.readFileSync(opts.watchlistFile, 'utf8'));
  }
  return getWatchlist();
}

function resolveDirs(dataDir) {
  const base = dataDir || path.join(REPO_ROOT, 'data');
  return {
    DATA_DIR: base,
    SNAPSHOTS_DIR: path.join(base, 'snapshots'),
    CONTEXT_DIR: path.join(base, 'context'),
    INDICATORS_DIR: path.join(base, 'indicators'),
  };
}

function datedStamp(iso) {
  return (iso || new Date().toISOString()).slice(0, 10);
}

function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

async function runFetchData(argv, hooks = {}) {
  const opts = parseArgs(argv);
  const { DATA_DIR, SNAPSHOTS_DIR, CONTEXT_DIR, INDICATORS_DIR } = resolveDirs(opts.dataDir);
  const watchlist = loadWatchlist(opts);

  console.log(`[fetch-data] probing ${watchlist.length} watchlist indicators ...`);

  const probeResult = await probeWatchlist(watchlist, SNAPSHOTS_DIR, {
    force: opts.force,
    headCsv: hooks.headCsv,
    csvUrl: hooks.csvUrl,
  });
  const changedSince = buildChangedSinceReport(probeResult);
  const index = buildIndex(probeResult);

  writeJson(path.join(DATA_DIR, 'changed-since.json'), changedSince);
  writeJson(
    path.join(DATA_DIR, `changed-since-${datedStamp(probeResult.probed_at)}.json`),
    changedSince,
  );
  writeJson(path.join(DATA_DIR, 'index.json'), index);

  console.log(`[fetch-data] probe done in ${probeResult.elapsed_ms} ms`);
  console.log(`[fetch-data] changed: ${probeResult.changed} | unchanged: ${probeResult.unchanged} | errors: ${probeResult.errors}`);
  if (probeResult.since) {
    console.log(`[fetch-data] since last probe: ${probeResult.since}`);
  }

  if (probeResult.changed_indicators.length > 0) {
    console.log('[fetch-data] updated indicators:');
    for (const idno of probeResult.changed_indicators) {
      const row = probeResult.indicators.find((r) => r.idno === idno);
      const tag = row?.first_probe ? 'first probe' : 'modified';
      console.log(`  - ${idno} (${tag})`);
    }
  } else {
    console.log('[fetch-data] no indicators changed since last probe');
  }

  console.log(`[fetch-data] wrote data/changed-since.json (${changedSince.changed} changed)`);
  console.log('[fetch-data] wrote data/index.json');

  if (opts.probeOnly) {
    console.log('[fetch-data] --probe-only: skipping snapshot and context fetch');
    return;
  }

  const toFetch = watchlist.filter((e) => probeResult.changed_indicators.includes(e.idno));
  if (toFetch.length === 0) {
    console.log('[fetch-data] nothing to download');
    return;
  }

  console.log(`[fetch-data] downloading ${toFetch.length} CSV snapshot(s) ...`);
  for (const entry of toFetch) {
    process.stdout.write(`  csv ${entry.idno} ... `);
    try {
      const res = await downloadCsvSnapshot(SNAPSHOTS_DIR, entry, {
        force: opts.force,
        getCsv: hooks.getCsv,
        csvUrl: hooks.csvUrl,
      });
      if (res.downloaded) {
        process.stdout.write(`${res.bytes} bytes\n`);
      } else if (res.status === 304) {
        process.stdout.write('304 (already current)\n');
      } else {
        process.stdout.write(`HTTP ${res.status}\n`);
      }
    } catch (e) {
      process.stdout.write(`fail: ${e.message.slice(0, 80)}\n`);
    }
  }

  console.log('[fetch-data] refreshing LAC context for changed indicators ...');
  await refreshContextForIndicators(CONTEXT_DIR, INDICATORS_DIR, SNAPSHOTS_DIR, toFetch, {
    forceMetadata: opts.force,
  });

  console.log('[fetch-data] downloading data dictionaries and metadata JSON for changed indicators ...');
  for (const entry of toFetch) {
    await downloadDataDict(SNAPSHOTS_DIR, entry).catch((e) => console.warn(`  dict ${entry.idno}: ${e.message}`));
    await downloadMetadataJson(SNAPSHOTS_DIR, entry).catch((e) => console.warn(`  meta ${entry.idno}: ${e.message}`));
  }

  console.log('[fetch-data] done');
}

async function main() {
  await runFetchData(process.argv.slice(2));
}

if (require.main === module) {
  main().catch((e) => {
    process.stderr.write(`Error: ${e.message}\n`);
    process.exit(1);
  });
}

module.exports = { runFetchData, parseArgs, resolveDirs, loadWatchlist, writeJson };
