'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../lib/alerts-store');

test('alerts-store reload completes under loose budget', () => {
  const t0 = Date.now();
  store.reload();
  const alerts = store.getAlerts();
  const elapsed = Date.now() - t0;
  // In CI we often only have `alerts.fixture.json` (small), while in prod/dev we may
  // have a full pipeline-generated `alerts.json`. Budget check should hold for both.
  assert.ok(alerts.length >= 1);
  assert.ok(elapsed < 3000, `reload took ${elapsed}ms`);
});
