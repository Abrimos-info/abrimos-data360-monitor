'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  recentUpdatedIndicators,
  watchlistByTier,
  indicatorKnown,
} = require('../lib/indicators-hub');

test('recentUpdatedIndicators returns sorted list', () => {
  const list = recentUpdatedIndicators(5);
  assert.ok(Array.isArray(list));
  if (list.length >= 2) {
    const a = new Date(list[0].last_modified || 0).getTime();
    const b = new Date(list[1].last_modified || 0).getTime();
    assert.ok(a >= b);
  }
});

test('watchlistByTier includes static tiers', () => {
  const tiers = watchlistByTier();
  assert.ok(tiers.pulse.length > 0);
  assert.ok(tiers.annual.length > 0);
});

test('indicatorKnown matches watchlist idno', () => {
  assert.equal(indicatorKnown('FAO_CP_23012'), true);
  assert.equal(indicatorKnown('NOT_A_REAL_IDNO_XYZ'), false);
});
