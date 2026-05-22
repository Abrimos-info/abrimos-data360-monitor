'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { isAcceptable, downloadCsvSnapshot } = require('../lib/context-fetch');
const { saveEtag } = require('../lib/freshness-cache');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

test('isAcceptable filters OBS_STATUS and WGI breakdown', () => {
  assert.equal(isAcceptable({ OBS_STATUS: 'A', SEX: '_T', AGE: '_T', URBANISATION: '_T' }, '_T', null), true);
  assert.equal(isAcceptable({ OBS_STATUS: 'P' }, '_T', null), false);
  assert.equal(isAcceptable({ OBS_STATUS: 'A', COMP_BREAKDOWN_1: 'WGI_EST' }, '_Z', 'WGI_EST'), true);
  assert.equal(isAcceptable({ OBS_STATUS: 'A', COMP_BREAKDOWN_1: 'OTHER' }, '_Z', 'WGI_EST'), false);
});

test('downloadCsvSnapshot fetches when local CSV missing despite etag cache', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const body = 'indicator,time_period,value\nX,2024,1\n';
  saveEtag(dir, 'FAO_CP_23012', {
    etag: '"cached"',
    lastModified: 'Wed, 20 May 2025 00:00:00 GMT',
    probedAt: '2026-05-20T00:00:00Z',
    csv_url: 'https://mock.test/x.csv',
  });
  const res = await downloadCsvSnapshot(dir, {
    database_id: 'FAO_CP',
    idno: 'FAO_CP_23012',
  }, {
    csvUrl: () => 'https://mock.test/x.csv',
    getCsv: async (url, cache) => {
      assert.equal(cache, null, 'must not send conditional GET when local file missing');
      return { status: 200, body, etag: '"e"', lastModified: 'Wed, 21 May 2025 00:00:00 GMT' };
    },
  });
  assert.equal(res.downloaded, true);
  assert.ok(fs.existsSync(path.join(dir, 'FAO_CP_23012.csv')));
});

test('downloadCsvSnapshot skips write on 304 when local exists', async (t) => {
  const dir = createTmpDir();
  t.after(() => rmTmpDir(dir));
  const csvPath = path.join(dir, 'FAO_CP_23013.csv');
  fs.writeFileSync(csvPath, 'keep', 'utf8');
  saveEtag(dir, 'FAO_CP_23013', {
    etag: '"e"',
    lastModified: 'Wed, 21 May 2025 00:00:00 GMT',
    probedAt: '2026-05-21T00:00:00Z',
    csv_url: 'https://mock.test/y.csv',
  });
  const res = await downloadCsvSnapshot(dir, { database_id: 'FAO_CP', idno: 'FAO_CP_23013' }, {
    csvUrl: () => 'https://mock.test/y.csv',
    getCsv: async () => ({ status: 304, body: null }),
  });
  assert.equal(res.downloaded, false);
  assert.equal(res.status, 304);
  assert.equal(fs.readFileSync(csvPath, 'utf8'), 'keep');
});
