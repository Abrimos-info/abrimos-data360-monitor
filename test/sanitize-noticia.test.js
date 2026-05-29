'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeNoticiaItem } = require('../lib/analysis/alert-extractor');

test('sanitizeNoticiaItem strips legacy keys and fills empty en from es', () => {
  const item = sanitizeNoticiaItem({
    content_type: 'noticia',
    id: 'n1',
    type: 'abrupt_change',
    country: 'MEX',
    title: { es: 'Subió el indicador', en: '' },
    lead: { es: 'Resumen.', en: '' },
    story: { es: 'x'.repeat(250), en: '' },
    dataset_id: 'DS',
    indicator: { idno: 'X', database_id: 'DS', name: { es: 'Nombre', en: '' } },
    claim_tokens: [{ claim_id: 'abc', value: '1' }],
    verification_trace: {
      data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/DS',
      csv_link: 'https://data360files.worldbank.org/data360-data/data/DS/X.csv',
    },
    score: 0.5,
    detected_at: '2026-05-22T12:00:00Z',
  });
  assert.equal(item.type, undefined);
  assert.equal(item.title.en, 'Subió el indicador');
  assert.equal(item.indicator.name.en, 'Nombre');
});
