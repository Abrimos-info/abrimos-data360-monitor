'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeNoticiaItem, sanitizeReportajeItem, normalizeDetectedAt } = require('../lib/analysis/alert-extractor');
const { validateAlert } = require('../lib/analysis/quality-validator');

const sourceNoticias = [
  {
    id: 'noticia_1',
    country: 'ARG',
    dataset_id: 'WB_WDI',
    indicator: { idno: 'WB_WDI_SL_UEM_TOTL_ZS', database_id: 'WB_WDI' },
    verification_trace: {
      csv_link: 'https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SL_UEM_TOTL_ZS.csv',
    },
    claim_tokens: [{ claim_id: 'a1', value: '1' }],
  },
  {
    id: 'noticia_2',
    country: 'MEX',
    dataset_id: 'WB_WDI',
    indicator: { idno: 'WB_WDI_SI_POV_DDAY', database_id: 'WB_WDI' },
    verification_trace: {
      csv_link: 'https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_SI_POV_DDAY.csv',
    },
    claim_tokens: [{ claim_id: 'a2', value: '2' }],
  },
];

test('normalizeDetectedAt fixes date-only and missing timezone', () => {
  assert.equal(normalizeDetectedAt('2024'), '2024-01-01T12:00:00.000Z');
  assert.equal(normalizeDetectedAt('2026-05-22'), '2026-05-22T12:00:00.000Z');
  assert.match(normalizeDetectedAt('2026-05-22T12:00:00'), /Z$/);
});

test('sanitizeNoticiaItem fixes detected_at without timezone', () => {
  const item = sanitizeNoticiaItem({
    content_type: 'noticia',
    id: 'n1',
    type: 'abrupt_change',
    title: { es: 'Título', en: '' },
    lead: { es: 'Lead.', en: '' },
    story: { es: 'x'.repeat(250), en: '' },
    country: 'GTM',
    dataset_id: 'WB_WDI',
    indicator: { idno: 'WB_WDI_SH_DYN_MORT', name: { es: 'Mortalidad', en: '' } },
    claim_tokens: [{ claim_id: 'abc', value: '1' }],
    score: '0.8',
    detected_at: '2026-05-22T12:00:00',
  });
  assert.match(item.detected_at, /Z$/);
  assert.equal(item.score, 0.8);
  assert.ok(item.verification_trace.csv_link.includes('WB_WDI_SH_DYN_MORT'));
});

test('sanitizeReportajeItem fills metadata from source noticias', () => {
  const item = sanitizeReportajeItem({
    content_type: 'noticia',
    id: 'reportaje_WB_WDI_2026-05-22',
    indicator: { idno: 'WB_WDI_SL_UEM_TOTL_ZS' },
    title: { es: 'Panorama regional', en: '' },
    lead: { es: 'Resumen.', en: '' },
    story: { es: 'y'.repeat(300), en: '' },
    claim_tokens: [{ claim_id: 'a1', value: '1' }],
    verification_trace: { csv_link: 'https://example.com/x.csv' },
    detected_at: '2026-05-22',
    score: 'high',
  }, sourceNoticias);

  assert.equal(item.content_type, 'reportaje');
  assert.equal(item.indicator, undefined);
  assert.deepEqual(item.indicators, ['WB_WDI_SL_UEM_TOTL_ZS', 'WB_WDI_SI_POV_DDAY']);
  assert.deepEqual(item.noticia_ids, ['noticia_1', 'noticia_2']);
  assert.ok(item.verification_trace.data360_dataset_url.includes('WB_WDI'));
  assert.ok(item.verification_trace.csv_links.length >= 2);

  const { ok, failures } = validateAlert(item, new Set(['a1', 'a2']));
  assert.equal(ok, true, failures.map((f) => f.notes).join('; '));
});

test('sanitizeReportajeItem replaces invalid LLM csv_links with source noticias URLs', () => {
  const item = sanitizeReportajeItem({
    content_type: 'reportaje',
    id: 'reportaje_WJP_ROL_test',
    dataset_id: 'WJP_ROL',
    title: { es: 'Panorama', en: 'Overview' },
    lead: { es: 'Resumen.', en: 'Summary.' },
    story: { es: 'y'.repeat(300), en: 'y'.repeat(300) },
    claim_tokens: [{ claim_id: 'a1', value: '1' }],
    verification_trace: {
      csv_links: ['...', 'WJP_ROL_OVRL.csv', 'not-a-uri'],
    },
  }, sourceNoticias.map((n) => ({ ...n, dataset_id: 'WJP_ROL' })));

  assert.ok(item.verification_trace.csv_links.every((u) => u.startsWith('https://')));
  assert.equal(item.verification_trace.csv_links.length, 2);
});
