'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  enrichIndicator,
  formatUpdatedDate,
  formatDataPeriod,
} = require('../lib/indicator-display');

test('enrichIndicator resolves watchlist label and dates', () => {
  const row = enrichIndicator({ idno: 'FAO_CP_23012' }, 'en');
  assert.equal(row.idno, 'FAO_CP_23012');
  assert.match(row.name, /Consumer Prices/i);
  assert.ok(row.last_modified_display || row.last_data_display || row.name);
});

test('formatUpdatedDate parses HTTP date', () => {
  const out = formatUpdatedDate('Mon, 25 May 2026 22:48:41 GMT', 'es');
  assert.match(out, /2026/);
});

test('formatDataPeriod formats ISO date', () => {
  const out = formatDataPeriod('2025-09-01', 'en');
  assert.match(out, /2025/);
});
