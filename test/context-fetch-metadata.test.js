'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  entriesNeedingMetadata,
  ensureIndicatorMetadata,
} = require('../lib/context-fetch');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

test('entriesNeedingMetadata includes changed and missing md', () => {
  const indicatorsDir = createTmpDir();
  try {
    fs.writeFileSync(path.join(indicatorsDir, 'HAS_MD.md'), '# Existing\n', 'utf8');
    const watchlist = [
      { idno: 'HAS_MD', database_id: 'DB', label: 'HAS_MD' },
      { idno: 'NO_MD', database_id: 'DB', label: 'NO_MD' },
      { idno: 'CHANGED', database_id: 'DB', label: 'CHANGED' },
    ];
    const changedIds = new Set(['CHANGED']);
    const needs = entriesNeedingMetadata(watchlist, indicatorsDir, changedIds, false);
    assert.deepEqual(needs.map((e) => e.idno).sort(), ['CHANGED', 'NO_MD']);
  } finally {
    rmTmpDir(indicatorsDir);
  }
});

test('ensureIndicatorMetadata writes markdown from API', async () => {
  const root = createTmpDir();
  const indicatorsDir = path.join(root, 'indicators');
  const snapshotsDir = path.join(root, 'snapshots');
  fs.mkdirSync(indicatorsDir, { recursive: true });
  fs.mkdirSync(snapshotsDir, { recursive: true });

  const client = require('../lib/data360-client');
  const original = client.getMetadata;
  client.getMetadata = async () => ({
    value: [{
      series_description: {
        name: 'Test indicator title',
        database_name: 'Test DB',
      },
    }],
  });
  try {
    await ensureIndicatorMetadata(indicatorsDir, snapshotsDir, [{
      idno: 'TEST_IND',
      database_id: 'TEST_DB',
      label: 'TEST_IND',
    }]);
    const mdPath = path.join(indicatorsDir, 'TEST_IND.md');
    assert.ok(fs.existsSync(mdPath));
    assert.match(fs.readFileSync(mdPath, 'utf8'), /Test indicator title/);
  } finally {
    client.getMetadata = original;
    rmTmpDir(root);
  }
});
