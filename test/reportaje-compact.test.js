'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  compactNoticiaForReportaje,
  noticiasEligibleForReportaje,
} = require('../lib/analysis/reportaje-runner');

test('compactNoticiaForReportaje keeps structured data only, no story', () => {
  const full = {
    id: 'n1',
    content_type: 'noticia',
    quality_status: 'accepted',
    countries: ['ECU'],
    dataset_id: 'DS',
    title: { es: 'T', en: 'T' },
    lead: { es: 'L', en: 'L' },
    story: { es: 'x'.repeat(900), en: 'y'.repeat(900) },
    observation: { value: '77', time_period: '2025', unit: 'RANK' },
    chart_series: [{ time_period: '2025', value: '77' }],
    claim_tokens: [
      { claim_id: 'abc', value: '77', pcn_status: 'verified' },
      { claim_id: 'bad', value: '99', pcn_status: 'rejected' },
    ],
    indicator: { idno: 'X', name: { es: 'n', en: 'n' } },
  };
  const compact = compactNoticiaForReportaje(full);
  assert.equal(compact.story, undefined);
  assert.equal(compact.title, undefined);
  assert.equal(compact.lead, undefined);
  assert.deepEqual(compact.observation, full.observation);
  assert.deepEqual(compact.chart_series, full.chart_series);
  assert.equal(compact.claim_tokens.length, 1);
  assert.equal(compact.claim_tokens[0].claim_id, 'abc');
});

test('noticiasEligibleForReportaje excludes incomplete and rejected', () => {
  const list = [
    { id: 'ok', content_type: 'noticia', quality_status: 'accepted' },
    { id: 'bad', content_type: 'noticia', quality_status: 'incomplete' },
    { id: 'rej', content_type: 'noticia', quality_status: 'rejected' },
  ];
  const eligible = noticiasEligibleForReportaje(list);
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].id, 'ok');
});
