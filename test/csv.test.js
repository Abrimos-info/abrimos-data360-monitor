'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCsv, rowsToCsv, mergeContextRows } = require('../lib/csv');

test('parseCsv and rowsToCsv round-trip quoted values', () => {
  const headers = ['indicator', 'note'];
  const rows = [{ indicator: 'A', note: 'hello, "world"' }];
  const text = rowsToCsv(headers, rows);
  const back = parseCsv(text);
  assert.deepEqual(back.headers, headers);
  assert.equal(back.rows[0].note, 'hello, "world"');
});

test('parseCsv empty input', () => {
  const { headers, rows } = parseCsv('');
  assert.deepEqual(headers, []);
  assert.deepEqual(rows, []);
});

test('mergeContextRows replaces idno and keeps others sorted', () => {
  const existing = [
    { indicator: 'A', time_period: '2023' },
    { indicator: 'B', time_period: '2024' },
    { indicator: 'A', time_period: '2022' },
  ];
  const incoming = [{ indicator: 'A', time_period: '2025' }];
  const merged = mergeContextRows(existing, incoming, 'A');
  assert.equal(merged.filter((r) => r.indicator === 'A').length, 1);
  assert.equal(merged.find((r) => r.indicator === 'A').time_period, '2025');
  assert.ok(merged.some((r) => r.indicator === 'B'));
});
