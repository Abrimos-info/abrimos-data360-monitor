'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const cache = require('../lib/freshness-cache');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

test('etag and probe state round-trip in tmpdir', (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));

  assert.equal(cache.loadEtag(dir, 'WB_WDI_FP_CPI_TOTL_ZG'), null);
  assert.deepEqual(cache.loadProbeState(dir), { last_probe_at: null });

  const etagPath = cache.etagPath(dir, 'WB_WDI_FP_CPI_TOTL_ZG');
  assert.match(etagPath, /WB_WDI_FP_CPI_TOTL_ZG\.etag$/);
  assert.match(cache.csvSnapshotPath(dir, 'X'), /X\.csv$/);
  assert.match(cache.metaSnapshotPath(dir, 'X'), /X\.meta\.json$/);

  cache.saveEtag(dir, 'WB_WDI_FP_CPI_TOTL_ZG', {
    etag: '"e1"',
    lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
    probedAt: '2026-05-21T00:00:00Z',
    csv_url: 'https://example.test/x.csv',
  });
  const loaded = cache.loadEtag(dir, 'WB_WDI_FP_CPI_TOTL_ZG');
  assert.equal(loaded.etag, '"e1"');

  cache.saveProbeState(dir, { last_probe_at: '2026-05-21T10:00:00Z', total: 35 });
  assert.equal(cache.loadProbeState(dir).last_probe_at, '2026-05-21T10:00:00Z');
  assert.ok(fs.existsSync(path.join(dir, '_probe-state.json')));
});
