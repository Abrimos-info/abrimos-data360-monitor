'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  candidateFingerprint,
  isUnchangedIndicator,
  rankIndicatorsBySignal,
} = require('../lib/analysis/analysis-cache');

test('candidateFingerprint is stable for same detections', () => {
  const candidates = [{
    alert: { country: 'ARG', type: 'abrupt_change', observation: { time_period: '2025-09-01', value: '10' } },
    detection_meta: { claim_id: 'abc', z_score: 2.1 },
  }];
  assert.equal(candidateFingerprint(candidates), candidateFingerprint(candidates));
});

test('candidateFingerprint changes when observation changes', () => {
  const base = [{
    alert: { country: 'ARG', observation: { time_period: '2025-09-01', value: '10' } },
    detection_meta: { claim_id: 'abc', z_score: 2.1 },
  }];
  const changed = [{
    alert: { country: 'ARG', observation: { time_period: '2025-09-01', value: '11' } },
    detection_meta: { claim_id: 'abc', z_score: 2.1 },
  }];
  assert.notEqual(candidateFingerprint(base), candidateFingerprint(changed));
});

test('rankIndicatorsBySignal orders by max |z|', () => {
  const byIndicator = new Map([
    ['LOW', [{ detection_meta: { z_score: 1.2 } }]],
    ['HIGH', [{ detection_meta: { z_score: 3.5 } }]],
  ]);
  assert.deepEqual(
    rankIndicatorsBySignal(['LOW', 'HIGH'], byIndicator),
    ['HIGH', 'LOW'],
  );
});

test('isUnchangedIndicator false without cache files', () => {
  assert.equal(isUnchangedIndicator('/tmp/nonexistent-alerts-dir', 'X', []), false);
});
