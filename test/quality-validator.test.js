'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAlert } = require('../lib/analysis/quality-validator');

function minimalAlert(overrides = {}) {
  return {
    id: 'alert_2026-05-22_001',
    type: 'abrupt_change',
    country: 'ARG',
    category: 'economy',
    indicator: { idno: 'WB_WDI_FP_CPI_TOTL_ZG', database_id: 'WB_WDI', name: { es: 'x', en: 'x' } },
    observation: { value: 5, time_period: '2024', unit: '%' },
    magnitude: { es: '+1σ', en: '+1σ' },
    chart_series: [{ period: '2024', value: 5 }],
    narrative_citizen: { es: 'Corta.', en: 'Short.' },
    narrative_journalist: { es: 'Técnica.', en: 'Technical.' },
    verification_trace: {
      data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/WB_WDI',
      csv_link: 'https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.csv',
    },
    score: 0.9,
    detected_at: '2026-05-22T12:00:00Z',
    license: 'CC BY-4.0',
    claim_tokens: [{ claim_id: 'abc123', value: 5 }],
    ...overrides,
  };
}

test('validateAlert passes minimal valid alert', () => {
  const ctx = new Set(['abc123']);
  const { ok, failures } = validateAlert(minimalAlert(), ctx);
  assert.equal(ok, true);
  assert.equal(failures.length, 0);
});

test('validateAlert Q1 fails on orphan claim_id', () => {
  const { ok, failures } = validateAlert(minimalAlert(), new Set());
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q1'));
});

test('validateAlert Q2 fails on schema violation', () => {
  const bad = minimalAlert({ country: 'ZZZ' });
  const { ok, failures } = validateAlert(bad, new Set(['abc123']));
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q2'));
});

test('validateAlert Q4 fails on overlong narrative', () => {
  const long = 'x'.repeat(400);
  const bad = minimalAlert({
    narrative_citizen: { es: long, en: 'ok' },
  });
  const { ok, failures } = validateAlert(bad, new Set(['abc123']));
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q4'));
});
