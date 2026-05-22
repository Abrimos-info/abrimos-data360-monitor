'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeClaimId, buildClaimToken } = require('../lib/pcn-claims');

const baseObs = {
  database_id: 'WB_WDI',
  indicator: 'WB_WDI_FP_CPI_TOTL_ZG',
  country: 'ARG',
  time_period: '2024',
  value: 5.5,
  unit: '%',
};

test('computeClaimId is stable for same tuple', () => {
  const a = computeClaimId(baseObs);
  const b = computeClaimId({ ...baseObs });
  assert.equal(a, b);
  assert.match(a, /^[a-f0-9]{16}$/);
});

test('computeClaimId changes when time_period changes', () => {
  const a = computeClaimId(baseObs);
  const b = computeClaimId({ ...baseObs, time_period: '2025' });
  assert.notEqual(a, b);
});

test('buildClaimToken matches schema shape', () => {
  const token = buildClaimToken(baseObs, { displayEs: '5,5 %', displayEn: '5.5%' });
  assert.equal(token.claim_id, computeClaimId(baseObs));
  assert.equal(token.value, 5.5);
  assert.equal(token.display_es, '5,5 %');
});
