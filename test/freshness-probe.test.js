'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { probeWatchlist, buildChangedSinceReport, buildIndex } = require('../lib/freshness-probe');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

const mini = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/watchlist-mini.json'), 'utf8')
);

const csvUrlFn = (db, idno) => `https://mock.test/${db}/${idno}.csv`;

test('probeWatchlist first run marks all changed', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const result = await probeWatchlist(mini, dir, {
    csvUrl: csvUrlFn,
    headCsv: async () => ({
      status: 200,
      etag: '"new"',
      lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
      changed: true,
    }),
  });
  assert.equal(result.changed, mini.length);
  assert.equal(result.since, null);
  assert.ok(result.indicators.every((r) => r.first_probe));
});

test('probeWatchlist second run 304 yields unchanged', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const headCsv = async (url, cache) => {
    if (!cache) {
      return { status: 200, etag: '"e1"', lastModified: 'Wed, 21 May 2025 00:00:00 GMT', changed: true };
    }
    return { status: 304, etag: null, lastModified: null, changed: false };
  };
  await probeWatchlist(mini, dir, { csvUrl: csvUrlFn, headCsv });
  const second = await probeWatchlist(mini, dir, { csvUrl: csvUrlFn, headCsv });
  assert.equal(second.changed, 0);
  assert.ok(second.since);
});

test('probeWatchlist force marks all changed on 304', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const result = await probeWatchlist(mini, dir, {
    force: true,
    csvUrl: csvUrlFn,
    headCsv: async () => ({
      status: 304,
      etag: null,
      lastModified: null,
      changed: false,
    }),
  });
  assert.equal(result.changed, mini.length);
  assert.equal(result.force, true);
});

test('buildChangedSinceReport and buildIndex shape', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const probe = await probeWatchlist(mini, dir, {
    csvUrl: csvUrlFn,
    headCsv: async () => ({
      status: 200,
      etag: '"e"',
      lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
      changed: true,
    }),
  });
  const report = buildChangedSinceReport(probe);
  assert.equal(report.changed_indicators.length, probe.changed);
  const index = buildIndex(probe);
  assert.equal(index.total, mini.length);
  assert.equal(index.indicators.length, mini.length);
});
