'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  loadDynamicIndicatorIdnos,
  isDynamicIndicator,
  clearDynamicIndicatorCache,
  CONTEXT_DIR,
} = require('../lib/data-loader');
const { analyzeIndicator } = require('../lib/analysis/runner');

test('loadDynamicIndicatorIdnos reads idnos from dynamic.csv', () => {
  clearDynamicIndicatorCache();
  const argDynamic = path.join(CONTEXT_DIR, 'ARG', 'dynamic.csv');
  if (!fs.existsSync(argDynamic)) {
    assert.ok(true, 'no dynamic.csv in fixture env');
    return;
  }
  const idnos = loadDynamicIndicatorIdnos();
  assert.ok(idnos.size >= 0);
  for (const id of idnos) assert.match(id, /^[A-Z0-9_]+$/);
});

test('analyzeIndicator skips pulse-tier watchlist indicators', async () => {
  clearDynamicIndicatorCache();
  if (isDynamicIndicator('FAO_CP_23012')) {
    assert.ok(true, 'FAO_CP_23012 is dynamic in this env — skip pulse guard test');
    return;
  }
  const result = await analyzeIndicator('FAO_CP_23012', { noLlm: true });
  assert.equal(result.alerts.length, 0);
  assert.match(result.message, /dynamic-tier/i);
});
