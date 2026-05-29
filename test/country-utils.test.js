'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCountryField, pickPrimaryCountry } = require('../lib/analysis/country-utils');

test('validateCountryField allows LAC comparison claims from other demo countries', () => {
  const protagonistClaim = 'claim-mex-2025';
  const otherClaim = 'claim-gtm-2025';
  const item = {
    country: 'MEX',
    claim_tokens: [
      { claim_id: protagonistClaim, value: '10' },
      { claim_id: otherClaim, value: '8' },
    ],
  };
  const candidates = [
    {
      country: 'MEX',
      claim_id: protagonistClaim,
      observation: { time_period: '2025', value: '10', unit: 'IX' },
      alert: { country: 'MEX', indicator: { idno: 'X', database_id: 'WB_WDI' } },
    },
    {
      country: 'GTM',
      claim_id: otherClaim,
      observation: { time_period: '2025', value: '8', unit: 'IX' },
      alert: { country: 'GTM', indicator: { idno: 'X', database_id: 'WB_WDI' } },
    },
  ];
  const failures = validateCountryField(item, {
    expectedCountry: 'MEX',
    candidates,
    idno: 'X',
  });
  assert.deepEqual(failures, []);
});

test('validateCountryField rejects claims outside demo LAC set', () => {
  const item = {
    country: 'MEX',
    claim_tokens: [{ claim_id: 'claim-usa', value: '1' }],
  };
  const candidates = [
    {
      country: 'USA',
      claim_id: 'claim-usa',
      observation: { time_period: '2025', value: '1' },
      alert: { country: 'USA', indicator: { idno: 'X', database_id: 'WB_WDI' } },
    },
  ];
  const failures = validateCountryField(item, {
    expectedCountry: 'MEX',
    candidates,
    idno: 'X',
  });
  assert.ok(failures.some((f) => f.check === 'Q-country' && /USA/.test(f.notes)));
});

test('pickPrimaryCountry chooses highest absolute z', () => {
  const primary = pickPrimaryCountry([
    { country: 'GTM', z_score: 2.1 },
    { country: 'MEX', z_score: -3.4 },
  ]);
  assert.equal(primary, 'MEX');
});
