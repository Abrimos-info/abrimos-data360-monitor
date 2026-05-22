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
