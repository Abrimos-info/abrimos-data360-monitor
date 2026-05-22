#!/usr/bin/env node
'use strict';

#!/usr/bin/env node
'use strict';

/**
 * Standalone spike: validate conditional HEAD on Data360 bulk CSVs.
 *
 * For the integrated pipeline see bin/fetch-data.js and
 * docs/data-fetcher-architecture.md.
 *
 * Run:
 *   node examples/freshness-probe-demo.js
 *   node examples/freshness-probe-demo.js --sample 50
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BLOB_BASE = 'https://data360files.worldbank.org/data360-data/data';
const API_BASE = 'https://data360api.worldbank.org';
const CACHE_FILE = path.join(__dirname, '.freshness-cache-demo.json');

// Mix of datasets from connector/watchlist.json
const DEMO_INDICATORS = [
  { database_id: 'WB_WDI', idno: 'WB_WDI_NY_GDP_PCAP_CD' },
  { database_id: 'WB_WDI', idno: 'WB_WDI_FP_CPI_TOTL_ZG' },
  { database_id: 'IPC_IPC', idno: 'IPC_IPC_PHASE' },
  { database_id: 'IMF_WEO', idno: 'IMF_WEO_NGDP_RPCH' },
  { database_id: 'FAO_CP', idno: 'FAO_CP_23012' },
];

function csvUrl(databaseId, idno) {
  return `${BLOB_BASE}/${databaseId}/${idno}.csv`;
}

function parseArgs(argv) {
  const args = { sample: 0 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--sample' && argv[i + 1]) {
      args.sample = parseInt(argv[++i], 10);
    }
  }
  return args;
}

async function headCsv(url, cache) {
  const headers = {};
  if (cache?.etag) headers['If-None-Match'] = cache.etag;
  if (cache?.lastModified) headers['If-Modified-Since'] = cache.lastModified;

  const res = await axios.head(url, {
    headers,
    timeout: 30000,
    validateStatus: () => true,
  });

  return {
    status: res.status,
    etag: res.headers.etag || null,
    lastModified: res.headers['last-modified'] || null,
    changed: res.status !== 304,
  };
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

async function probeList(indicators, label, useCache) {
  const cache = useCache ? loadCache() : {};
  const results = [];
  const t0 = Date.now();

  for (const { database_id, idno } of indicators) {
    const url = csvUrl(database_id, idno);
    const key = idno;
    const prev = cache[key] || null;
    const head = await headCsv(url, useCache ? prev : null);

    if (head.changed && head.status === 200) {
      cache[key] = { etag: head.etag, lastModified: head.lastModified, probedAt: new Date().toISOString() };
    }

    results.push({
      idno,
      database_id,
      status: head.status,
      changed: head.changed,
      lastModified: head.lastModified || prev?.lastModified || null,
    });
  }

  if (!useCache) saveCache(cache);

  const elapsed = Date.now() - t0;
  const changed = results.filter((r) => r.changed).length;
  const skipped = results.filter((r) => r.status === 304).length;

  console.log(`\n--- ${label} (${elapsed} ms) ---`);
  for (const r of results) {
    const flag = r.status === 304 ? '304 skip' : r.status === 200 ? '200 fetch' : `HTTP ${r.status}`;
    console.log(`  ${r.idno.padEnd(28)} ${flag.padEnd(10)} Last-Modified: ${r.lastModified || 'n/a'}`);
  }
  console.log(`  Summary: ${changed} changed, ${skipped} not modified, ${indicators.length} total`);

  return { elapsed, changed, skipped };
}

async function fetchDatasetSample(datasetId, limit) {
  const res = await axios.get(`${API_BASE}/data360/indicators`, {
    params: { datasetId },
    timeout: 60000,
  });
  const idnos = res.data.slice(0, limit);
  return idnos.map((idno) => ({ database_id: datasetId, idno }));
}

async function main() {
  const { sample } = parseArgs(process.argv.slice(2));

  console.log('Data360 freshness probe — standalone demo');
  console.log('Cache file:', CACHE_FILE);

  // Phase 1: cold probe (no conditional headers)
  await probeList(DEMO_INDICATORS, 'Phase 1: cold HEAD (establish cache)', false);

  // Phase 2: warm probe (conditional — should all be 304)
  await probeList(DEMO_INDICATORS, 'Phase 2: conditional HEAD (expect 304)', true);

  if (sample > 0) {
    console.log(`\n--- Scale sample: first ${sample} indicators from WB_WDI ---`);
    const listRes = await axios.get(`${API_BASE}/data360/indicators`, {
      params: { datasetId: 'WB_WDI' },
      timeout: 60000,
    });
    console.log(`  WB_WDI catalog size: ${listRes.data.length} indicators`);

    const sampleList = listRes.data.slice(0, sample).map((idno) => ({
      database_id: 'WB_WDI',
      idno,
    }));

    const t0 = Date.now();
    let changed = 0;
    let skipped = 0;
    let errors = 0;

    // Parallel batches of 20 (conservative for demo)
    const BATCH = 20;
    for (let i = 0; i < sampleList.length; i += BATCH) {
      const batch = sampleList.slice(i, i + BATCH);
      const heads = await Promise.all(
        batch.map(async ({ database_id, idno }) => {
          try {
            const h = await headCsv(csvUrl(database_id, idno), null);
            if (h.status === 304) skipped++;
            else if (h.status === 200) changed++;
            else errors++;
            return h;
          } catch {
            errors++;
            return { status: 0 };
          }
        }),
      );
      process.stdout.write(`  probed ${Math.min(i + BATCH, sampleList.length)}/${sampleList.length}\r`);
    }

    const elapsed = Date.now() - t0;
    const rate = Math.round((sample / elapsed) * 1000 * 60);
    console.log(`\n  ${sample} HEADs in ${elapsed} ms (~${rate} req/min)`);
    console.log(`  Extrapolated 13k at this rate: ~${Math.round((13000 / rate) * 60)} s`);
    console.log(`  (API docs cite 5,000 req/min/IP — parallel batches can go faster)`);
  }

  console.log('\nDone. Re-run to see Phase 2 stay at 304 until Data360 republishes a CSV.');
}

main().catch((e) => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
