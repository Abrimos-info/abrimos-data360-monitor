'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { detectCrossCountryAnomalies } = require('../lib/detect/cross-indicator');

test('detectCrossCountryAnomalies finds regional outlier', () => {
  const period = '2024';
  const series = {
    TEST_IND: {
      GTM: [{ value: '10', time_period: period }],
      HND: [{ value: '11', time_period: period }],
      ARG: [{ value: '10', time_period: period }],
      ECU: [{ value: '100', time_period: period }],
      MEX: [{ value: '12', time_period: period }],
    },
  };
  const out = detectCrossCountryAnomalies(series, { threshold: 2 });
  assert.ok(out.some((c) => c.country === 'ECU'));
});

test('detectCrossCountryAnomalies skips when fewer than 3 countries', () => {
  const series = {
    TEST_IND: {
      GTM: [{ value: '10', time_period: '2024' }],
      HND: [{ value: '11', time_period: '2024' }],
    },
  };
  assert.equal(detectCrossCountryAnomalies(series).length, 0);
});
