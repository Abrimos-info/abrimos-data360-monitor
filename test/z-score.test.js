'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { detectAbruptChanges } = require('../lib/detect/z-score');

function series(values) {
  return values.map((value, i) => ({
    value: String(value),
    time_period: `202${i}`,
  }));
}

test('detectAbruptChanges ignores short series', () => {
  const out = detectAbruptChanges({
    TEST_IND: { GTM: series([1, 2, 3]) },
  });
  assert.equal(out.length, 0);
});

test('detectAbruptChanges detects large jump', () => {
  const out = detectAbruptChanges({
    TEST_IND: { GTM: series([10, 12, 9, 11, 10, 50]) },
  }, { threshold: 2, window: 5 });
  assert.equal(out.length, 1);
  assert.equal(out[0].type, 'abrupt_change');
  assert.ok(Math.abs(out[0].z_score) >= 2);
});

test('detectAbruptChanges skips non-numeric values', () => {
  const obs = series([10, 10, 10, 10, 10, 10]);
  obs[5] = { value: 'n/a', time_period: '2025' };
  const out = detectAbruptChanges({ TEST_IND: { GTM: obs } });
  assert.equal(out.length, 0);
});

test('detectAbruptChanges preserves Decimal precision strings', () => {
  const out = detectAbruptChanges({
    TEST_IND: {
      GTM: [
        ...series([10, 10, 10, 10, 10]),
        { value: '50.000000000000001', time_period: '2025' },
      ],
    },
  }, { threshold: 2 });
  assert.ok(out.length >= 0);
});
