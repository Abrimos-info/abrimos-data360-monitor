'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAgainstSchema } = require('../lib/analysis/quality-validator');
const { loadAlertsFromDashboard } = require('./helpers/load-alerts');
const { parseClaimIdsFromAnalysis } = require('./helpers/parse-context-claims');

const DEMO_COUNTRIES = new Set(['GTM', 'HND', 'ARG', 'ECU', 'MEX']);
const DEMO_TYPES = new Set(['abrupt_change', 'anomaly']);

test('all dashboard alerts pass alert-schema.json', () => {
  const alerts = loadAlertsFromDashboard();
  assert.ok(alerts.length > 0, 'expected alerts in data/alerts.json');
  for (const alert of alerts) {
    const { ok, errors } = validateAgainstSchema(alert);
    assert.ok(ok, `${alert.id}: ${errors.map((e) => e.message).join('; ')}`);
  }
});

test('dashboard alerts respect D-003 countries and D-010 types', () => {
  for (const alert of loadAlertsFromDashboard()) {
    assert.ok(DEMO_COUNTRIES.has(alert.country), `${alert.id}: country ${alert.country}`);
    assert.ok(DEMO_TYPES.has(alert.type), `${alert.id}: type ${alert.type}`);
  }
});

test('verification_trace URLs are https', () => {
  for (const alert of loadAlertsFromDashboard()) {
    const vt = alert.verification_trace;
    assert.ok(vt, `${alert.id}: missing verification_trace`);
    for (const key of ['data360_dataset_url', 'csv_link']) {
      const url = vt[key];
      assert.ok(url && url.startsWith('https://'), `${alert.id}: ${key} must be https URL`);
    }
  }
});

test('chart_series has finite values', () => {
  for (const alert of loadAlertsFromDashboard()) {
    assert.ok(Array.isArray(alert.chart_series) && alert.chart_series.length > 0, `${alert.id}: chart_series`);
    for (const pt of alert.chart_series) {
      assert.ok(typeof pt.period === 'string' && pt.period.length > 0);
      assert.ok(Number.isFinite(pt.value), `${alert.id}: non-finite chart value`);
    }
  }
});

test('each alert with claim_tokens has at least one traced to analysis context', () => {
  let checked = 0;
  for (const alert of loadAlertsFromDashboard()) {
    if (!Array.isArray(alert.claim_tokens) || alert.claim_tokens.length === 0) continue;
    const idno = alert.indicator?.idno;
    assert.ok(idno, `${alert.id}: missing indicator.idno for Q1`);
    const contextIds = parseClaimIdsFromAnalysis(idno);
    if (contextIds.size === 0) continue;
    checked++;
    const traced = alert.claim_tokens.some((token) => contextIds.has(token.claim_id));
    assert.ok(
      traced,
      `${alert.id}: no claim_token found in data/analyses/${idno}.md`
    );
  }
  assert.ok(checked > 0, 'expected claim_tokens with matching analysis files');
});
