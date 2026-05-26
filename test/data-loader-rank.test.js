'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { collapseObservationsByPeriod } = require('../lib/data-loader');

test('collapseObservationsByPeriod prefers RANK over SCORE for RWB_PFI', () => {
  const obs = [
    { time_period: '2024', value: '43.33', unit_measure: 'SCORE' },
    { time_period: '2024', value: '94', unit_measure: 'RANK' },
    { time_period: '2025', value: '43.93', unit_measure: 'SCORE' },
    { time_period: '2025', value: '77', unit_measure: 'RANK' },
  ];
  const out = collapseObservationsByPeriod(obs, 'RWB_PFI_ECC');
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((o) => o.unit_measure), ['RANK', 'RANK']);
  assert.deepEqual(out.map((o) => o.value), ['94', '77']);
});
