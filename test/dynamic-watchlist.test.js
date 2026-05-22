'use strict';
const { test, mock } = require('node:test');
const assert = require('node:assert/strict');

test('fetchRecentDatasets returns datasets updated within days window', async (t) => {
  const { fetchRecentDatasets } = require('../lib/dynamic-watchlist');
  const fakeSearch = async (body) => ({
    value: [
      {
        type: 'dataset',
        series_description: {
          database_id: 'FAO_CP',
          name: 'Consumer Price',
          date_last_update: '2026-05-21',
          csv_link: 'https://example.com/FAO_CP/FAO_CP.csv',
        },
      },
      {
        type: 'dataset',
        series_description: {
          database_id: 'OLD_DS',
          name: 'Old Dataset',
          date_last_update: '2025-01-01',
          csv_link: 'https://example.com/OLD_DS/OLD_DS.csv',
        },
      },
    ],
  });
  const results = await fetchRecentDatasets({ daysBack: 7, searchFn: fakeSearch, referenceDate: new Date('2026-05-22') });
  assert.equal(results.length, 1);
  assert.equal(results[0].database_id, 'FAO_CP');
});

test('expandDatasetToIndicators uses the indicator code from listIndicators as idno', async (t) => {
  // Data360's /data360/indicators returns codes already in their canonical
  // form — sometimes prefixed with the database_id (WB_WDI_NY_GDP_PCAP_CD),
  // sometimes bare (AV_DT). Either way, the code IS the idno; we must not
  // re-prefix it ourselves.
  const { expandDatasetToIndicators } = require('../lib/dynamic-watchlist');
  const fakeListIndicators = async (datasetId) => ['FAO_CP_23012', 'FAO_CP_23013'];
  const entries = await expandDatasetToIndicators('FAO_CP', { listIndicatorsFn: fakeListIndicators });
  assert.equal(entries.length, 2);
  assert.equal(entries[0].idno, 'FAO_CP_23012');
  assert.equal(entries[0].database_id, 'FAO_CP');
  assert.equal(entries[1].idno, 'FAO_CP_23013');
});

test('expandDatasetToIndicators preserves bare codes for datasets that return them unprefixed', async (t) => {
  const { expandDatasetToIndicators } = require('../lib/dynamic-watchlist');
  const fakeListIndicators = async (datasetId) => ['AV_DT', 'CT_ALLI'];
  const entries = await expandDatasetToIndicators('WB_LPI_20', { listIndicatorsFn: fakeListIndicators });
  assert.equal(entries[0].idno, 'AV_DT');
  assert.equal(entries[1].idno, 'CT_ALLI');
});

test('buildDynamicWatchlist keeps indicators whose CSV HEAD returns 200', async (t) => {
  const { buildDynamicWatchlist } = require('../lib/dynamic-watchlist');
  const fakeSearch = async () => ({
    value: [{
      type: 'dataset',
      series_description: { database_id: 'FAO_CP', name: 'CP', date_last_update: '2026-05-21', csv_link: '' },
    }],
  });
  const fakeList = async () => ['FAO_CP_23012'];
  const fakeHead = async (url) => ({ status: 200, changed: true, etag: 'abc', lastModified: 'Tue, 21 May 2026 00:00:00 GMT' });
  const silentLog = { log: () => {}, warn: () => {} };
  const result = await buildDynamicWatchlist({
    daysBack: 7,
    referenceDate: new Date('2026-05-22'),
    searchFn: fakeSearch,
    listIndicatorsFn: fakeList,
    headCsvFn: fakeHead,
    log: silentLog,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].idno, 'FAO_CP_23012');
  assert.equal(result[0].tier, 'dynamic');
});
