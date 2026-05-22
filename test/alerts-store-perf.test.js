'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../lib/alerts-store');

test('alerts-store reload completes under loose budget', () => {
  const t0 = Date.now();
  store.reload();
  const alerts = store.getAlerts();
  const elapsed = Date.now() - t0;
  assert.ok(alerts.length >= 40);
  assert.ok(elapsed < 3000, `reload took ${elapsed}ms`);
});
