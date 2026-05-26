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

test('headlineDateLabel shows month and year from observation', () => {
  const { headlineDateLabel } = require('../lib/alert-display');
  const label = headlineDateLabel({
    observation: { time_period: '2025-09-01', period_display: { es: 'sep 2025', en: 'Sep 2025' } },
  }, 'es');
  assert.equal(label, 'sep 2025');
});

test('headlineDateLabel falls back to detected_at for reportajes', () => {
  const { headlineDateLabel } = require('../lib/alert-display');
  const label = headlineDateLabel({
    content_type: 'reportaje',
    detected_at: '2026-05-26T01:24:26.717Z',
  }, 'es');
  assert.equal(label, 'may 2026');
});

test('headlineDateLabel adds month to annual data period', () => {
  const { headlineDateLabel } = require('../lib/alert-display');
  const label = headlineDateLabel({
    observation: { time_period: '2025' },
    detected_at: '2026-05-26T01:24:26.717Z',
  }, 'es');
  assert.equal(label, 'ene 2025');
});
