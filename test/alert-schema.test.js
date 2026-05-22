// test/alert-schema.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateAgainstSchema } = require('../lib/analysis/quality-validator');

const BASE_NOTICIA = {
  content_type: 'noticia',
  id: 'noticia_abrupt_ARG_FAO_CP_23012_2026-01_001',
  title: { es: 'Precios suben en Argentina', en: 'Prices rise in Argentina' },
  lead: { es: 'El IPC subió en Argentina.', en: 'CPI rose in Argentina.' },
  story: { es: 'A'.repeat(250), en: 'B'.repeat(250) },
  countries: ['ARG'],
  dataset_id: 'FAO_CP',
  indicator: { idno: 'FAO_CP_23012', database_id: 'FAO_CP', name: { es: 'IPC general', en: 'Consumer Prices' } },
  claim_tokens: [{ claim_id: 'abc123', value: '128.5' }],
  verification_trace: {
    data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/FAO_CP',
    csv_link: 'https://data360files.worldbank.org/data360-data/data/FAO_CP/FAO_CP_23012.csv',
  },
  score: 0.75,
  detected_at: '2026-05-22T12:00:00.000Z',
};

const BASE_REPORTAJE = {
  content_type: 'reportaje',
  id: 'reportaje_FAO_CP_2026-05-22',
  title: { es: 'Presión alimentaria en LAC', en: 'Food pressure in LAC' },
  lead: { es: 'Tres indicadores muestran.', en: 'Three indicators show.' },
  story: { es: 'C'.repeat(300), en: 'D'.repeat(300) },
  countries: ['ARG', 'GTM'],
  dataset_id: 'FAO_CP',
  indicators: ['FAO_CP_23012', 'FAO_CP_23013'],
  noticia_ids: ['noticia_001', 'noticia_002'],
  claim_tokens: [],
  verification_trace: { data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/FAO_CP' },
  score: 0.8,
  detected_at: '2026-05-22T12:00:00.000Z',
};

test('valid noticia passes schema', () => {
  const { ok } = validateAgainstSchema(BASE_NOTICIA);
  assert.equal(ok, true);
});

test('noticia missing story fails schema', () => {
  const { ok } = validateAgainstSchema({ ...BASE_NOTICIA, story: undefined });
  assert.equal(ok, false);
});

test('valid reportaje passes schema', () => {
  const { ok } = validateAgainstSchema(BASE_REPORTAJE);
  assert.equal(ok, true);
});

test('reportaje with one indicator fails (minItems: 2)', () => {
  const { ok } = validateAgainstSchema({ ...BASE_REPORTAJE, indicators: ['FAO_CP_23012'] });
  assert.equal(ok, false);
});

test('item with unknown content_type fails schema', () => {
  const { ok } = validateAgainstSchema({ ...BASE_NOTICIA, content_type: 'alert' });
  assert.equal(ok, false);
});
