'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runFetchData } = require('../bin/fetch-data');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

test('runFetchData --probe-only writes changed-since and index (mocked HTTP)', async (t) => {
  const dataDir = createTmpDir();
  t.after(() => rmTmpDir(dataDir));
  const watchlistFile = path.join(__dirname, 'fixtures/watchlist-mini.json');
  await runFetchData(
    ['--probe-only', '--data-dir', dataDir, '--watchlist-file', watchlistFile],
    {
      csvUrl: (db, idno) => `https://mock.test/${db}/${idno}.csv`,
      headCsv: async () => ({
        status: 200,
        etag: '"e"',
        lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
        changed: true,
      }),
    }
  );

  assert.ok(fs.existsSync(path.join(dataDir, 'changed-since.json')));
  assert.ok(fs.existsSync(path.join(dataDir, 'index.json')));
  const changed = JSON.parse(fs.readFileSync(path.join(dataDir, 'changed-since.json'), 'utf8'));
  assert.equal(changed.total_probed, 2);
  assert.ok(Array.isArray(changed.changed_indicators));
});

test('runFetchData fetches metadata when CSV unchanged but md missing', async (t) => {
  const dataDir = createTmpDir();
  t.after(() => rmTmpDir(dataDir));
  const watchlistFile = path.join(__dirname, 'fixtures/watchlist-mini.json');
  const indicatorsDir = path.join(dataDir, 'indicators');
  fs.mkdirSync(indicatorsDir, { recursive: true });

  const client = require('../lib/data360-client');
  const origGetMetadata = client.getMetadata;
  let metadataCalls = 0;
  client.getMetadata = async () => {
    metadataCalls += 1;
    return {
      value: [{
        series_description: {
          name: 'Mock indicator',
          database_name: 'Mock DB',
        },
      }],
    };
  };
  t.after(() => {
    client.getMetadata = origGetMetadata;
  });

  await runFetchData(
    ['--data-dir', dataDir, '--watchlist-file', watchlistFile],
    {
      csvUrl: (db, idno) => `https://mock.test/${db}/${idno}.csv`,
      headCsv: async () => ({
        status: 200,
        etag: '"e"',
        lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
        changed: false,
      }),
      getCsv: async () => ({ status: 304, body: null }),
    },
  );

  assert.ok(metadataCalls >= 1, 'expected metadata API calls for missing md files');
  const mdFiles = fs.readdirSync(indicatorsDir).filter((f) => f.endsWith('.md'));
  assert.ok(mdFiles.length >= 1, 'expected at least one indicator markdown file');
});
