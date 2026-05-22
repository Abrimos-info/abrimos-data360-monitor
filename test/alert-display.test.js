'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatLastUpdate, isStaleDataPeriod } = require('../lib/alert-display');

test('formatLastUpdate formats ISO timestamp', () => {
  const out = formatLastUpdate('2026-05-21T15:30:00.000Z');
  assert.match(out, /2026-05-21/);
  assert.match(out, /UTC/);
});

test('formatLastUpdate returns em dash for empty', () => {
  assert.equal(formatLastUpdate(null), '—');
});

test('isStaleDataPeriod flags old annual data', () => {
  assert.equal(isStaleDataPeriod('2018'), true);
  assert.equal(isStaleDataPeriod('2099'), false);
});
