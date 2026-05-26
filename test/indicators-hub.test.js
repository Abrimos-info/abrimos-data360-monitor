'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  recentUpdatedIndicators,
  watchlistByTier,
  indicatorKnown,
  buildIndicatorAlertCounts,
  attachAlertCounts,
  sortHubTierEntries,
  HUB_TIER_ORDER,
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

test('HUB_TIER_ORDER puts dynamic first', () => {
  assert.equal(HUB_TIER_ORDER[0], 'dynamic');
});

test('buildIndicatorAlertCounts splits noticias and reportajes', () => {
  const counts = buildIndicatorAlertCounts();
  const fao = counts.get('FAO_CP_23012');
  assert.ok(fao);
  assert.ok(fao.noticias >= 1);
  const wjp = counts.get('WJP_ROL_OVRL');
  if (wjp) assert.ok(wjp.reportajes >= 1);
});

test('sortHubTierEntries ranks dynamic tier by alert volume', () => {
  const counts = buildIndicatorAlertCounts();
  const entries = attachAlertCounts(
    [{ idno: 'AAA' }, { idno: 'FAO_CP_23012' }],
    counts,
  );
  const sorted = sortHubTierEntries(entries, 'dynamic');
  const faoIdx = sorted.findIndex((e) => e.idno === 'FAO_CP_23012');
  const aaaIdx = sorted.findIndex((e) => e.idno === 'AAA');
  assert.ok(faoIdx >= 0 && aaaIdx >= 0);
  assert.ok(faoIdx < aaaIdx);
});
