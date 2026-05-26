'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { computeClaimId } = require('../lib/pcn-claims');
const { verifyClaim, clearCache } = require('../lib/pcn-verify');

const ANNUAL_CSV = path.join(__dirname, '..', 'data', 'context', 'ARG', 'annual.csv');
const FIXTURE_ROW = 'FAO_CP_23012,2099-01-01,11322.289801,IX';

test('verifyClaim accepts claim_id hashed with database_id', () => {
  clearCache();
  const original = fs.readFileSync(ANNUAL_CSV, 'utf8');
  fs.writeFileSync(ANNUAL_CSV, `${original.trim()}\n${FIXTURE_ROW}\n`, 'utf8');

  try {
    const claimId = computeClaimId({
      database_id: 'FAO_CP',
      indicator: 'FAO_CP_23012',
      country: 'ARG',
      time_period: '2099-01-01',
      unit_measure: 'IX',
    });

    const result = verifyClaim(
      claimId,
      '11322.289801',
      'FAO_CP_23012',
      'ARG',
      '2099-01-01',
      { database_id: 'FAO_CP', unit_measure: 'IX' },
    );

    assert.equal(result.valid, true, result.message);
  } finally {
    fs.writeFileSync(ANNUAL_CSV, original, 'utf8');
    clearCache();
  }
});
