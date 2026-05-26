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
  assert.ok(row.name && row.name !== 'FAO_CP_23012');
  assert.ok(row.last_modified_display || row.last_data_display || row.name);
});

test('enrichIndicator resolves title from metadata when label is idno', () => {
  const row = enrichIndicator({ idno: 'WJP_ROL_FAC_6', label: 'WJP_ROL_FAC_6' }, 'es');
  assert.match(row.name, /Regulatory Enforcement|cumplimiento/i);
  assert.notEqual(row.name, 'WJP_ROL_FAC_6');
});

test('enrichIndicator exposes ISO timestamp for CSV update', () => {
  const row = enrichIndicator({
    idno: 'FAO_CP_23012',
    last_modified: 'Mon, 25 May 2026 22:48:41 GMT',
  }, 'es');
  assert.match(row.last_modified_iso, /^2026-05-25T/);
});

test('formatUpdatedDate parses HTTP date', () => {
  const out = formatUpdatedDate('Mon, 25 May 2026 22:48:41 GMT', 'es');
  assert.match(out, /2026/);
});

test('formatDataPeriod formats ISO date', () => {
  const out = formatDataPeriod('2025-09-01', 'en');
  assert.match(out, /2025/);
});
