'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('groupNoticiasByDatasetAndCountry groups by dataset_id and country', () => {
  const { groupNoticiasByDatasetAndCountry } = require('../lib/analysis/reportaje-runner');
  const noticias = [
    { id: 'n1', dataset_id: 'FAO_CP', content_type: 'noticia', country: 'ARG' },
    { id: 'n2', dataset_id: 'FAO_CP', content_type: 'noticia', country: 'GTM' },
    { id: 'n3', dataset_id: 'WB_WDI', content_type: 'noticia', country: 'ARG' },
  ];
  const groups = groupNoticiasByDatasetAndCountry(noticias);
  assert.equal(groups.size, 3);
  assert.equal(groups.get('FAO_CP::ARG').length, 1);
  assert.equal(groups.get('FAO_CP::GTM').length, 1);
  assert.equal(groups.get('WB_WDI::ARG').length, 1);
});

test('groupNoticiasByDatasetAndCountry groups same-country noticias for reportaje', () => {
  const { groupNoticiasByDatasetAndCountry } = require('../lib/analysis/reportaje-runner');
  const noticias = [
    { id: 'n1', dataset_id: 'FAO_CP', content_type: 'noticia', country: 'ARG' },
    { id: 'n2', dataset_id: 'FAO_CP', content_type: 'noticia', country: 'ARG' },
    { id: 'n3', dataset_id: 'SOLO', content_type: 'noticia', country: 'ARG' },
  ];
  const groups = groupNoticiasByDatasetAndCountry(noticias, { minNoticias: 2 });
  assert.ok(groups.has('FAO_CP::ARG'));
  assert.ok(!groups.has('SOLO::ARG'));
});

test('reportajeFingerprint changes when noticia set changes', () => {
  const { reportajeFingerprint } = require('../lib/analysis/reportaje-runner');
  const a = [
    { id: 'n1', quality_status: 'accepted' },
    { id: 'n2', quality_status: 'accepted' },
  ];
  const b = [
    { id: 'n1', quality_status: 'accepted' },
    { id: 'n3', quality_status: 'accepted' },
  ];
  assert.notEqual(reportajeFingerprint(a), reportajeFingerprint(b));
  assert.equal(reportajeFingerprint(a), reportajeFingerprint([...a].reverse()));
});
