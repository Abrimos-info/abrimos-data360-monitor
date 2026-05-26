'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAlert } = require('../lib/analysis/quality-validator');

function minimalNoticia(overrides = {}) {
  return {
    content_type: 'noticia',
    id: 'noticia_test_ARG_X_2024_1',
    title: { es: 'Aumentó la inflación en Argentina', en: 'Inflation rose in Argentina' },
    lead: { es: 'Resumen breve.', en: 'Brief summary.' },
    story: { es: 'x'.repeat(250), en: 'y'.repeat(250) },
    countries: ['ARG'],
    dataset_id: 'WB_WDI',
    indicator: { idno: 'WB_WDI_FP_CPI_TOTL_ZG', database_id: 'WB_WDI', name: { es: 'x', en: 'x' } },
    observation: { value: '5', time_period: '2024', unit: '%' },
    chart_series: [{ period: '2024', value: 5 }],
    verification_trace: {
      data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/WB_WDI',
      csv_link: 'https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.csv',
    },
    score: 0.9,
    detected_at: '2026-05-22T12:00:00Z',
    claim_tokens: [{ claim_id: 'abc123', value: '5' }],
    ...overrides,
  };
}

test('validateAlert passes minimal valid noticia', () => {
  const ctx = new Set(['abc123']);
  const { ok, failures } = validateAlert(minimalNoticia(), ctx);
  assert.equal(ok, true);
  assert.equal(failures.length, 0);
});

test('validateAlert allows digits in title (Q8 removed)', () => {
  const { ok, failures } = validateAlert(
    minimalNoticia({ title: { es: 'Inflación al 12%', en: 'Inflation at 12%' } }),
    new Set(['abc123']),
  );
  assert.equal(ok, true);
  assert.equal(failures.length, 0);
});

test('validateAlert allows long story (no max char cap)', () => {
  const long = 'x'.repeat(5000);
  const { ok, failures } = validateAlert(
    minimalNoticia({ story: { es: long, en: long } }),
    new Set(['abc123']),
  );
  assert.equal(ok, true);
  assert.equal(failures.length, 0);
});

test('validateAlert Q1 does not block by default (PCN tags claims instead)', () => {
  const { ok, failures } = validateAlert(minimalNoticia(), new Set());
  assert.equal(ok, true);
  assert.equal(failures.length, 0);
});

test('validateAlert Q1 fails with strictQ1', () => {
  const { ok, failures } = validateAlert(minimalNoticia(), new Set(), { strictQ1: true });
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q1'));
});

test('validateAlert Q2 fails on schema violation', () => {
  const bad = minimalNoticia({ score: 1.5 });
  const { ok, failures } = validateAlert(bad, new Set(['abc123']));
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q2'));
});

test('validateAlert Q4 fails on short story', () => {
  const bad = minimalNoticia({
    story: { es: 'corta', en: 'short' },
  });
  const { ok, failures } = validateAlert(bad, new Set(['abc123']));
  assert.equal(ok, false);
  assert.ok(failures.some((f) => f.check === 'Q4'));
});
