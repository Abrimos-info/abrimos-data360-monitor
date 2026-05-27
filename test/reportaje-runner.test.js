'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('groupNoticiasByDataset groups by dataset_id', () => {
  const { groupNoticiasByDataset } = require('../lib/analysis/reportaje-runner');
  const noticias = [
    { id: 'n1', dataset_id: 'FAO_CP', content_type: 'noticia', countries: ['ARG'] },
    { id: 'n2', dataset_id: 'FAO_CP', content_type: 'noticia', countries: ['GTM'] },
    { id: 'n3', dataset_id: 'WB_WDI', content_type: 'noticia', countries: ['ARG'] },
  ];
  const groups = groupNoticiasByDataset(noticias);
  assert.equal(groups.size, 2);
  assert.equal(groups.get('FAO_CP').length, 2);
  assert.equal(groups.get('WB_WDI').length, 1);
});

test('groupNoticiasByDataset excludes single-noticia datasets when minNoticias = 2', () => {
  const { groupNoticiasByDataset } = require('../lib/analysis/reportaje-runner');
  const noticias = [
    { id: 'n1', dataset_id: 'FAO_CP', content_type: 'noticia' },
    { id: 'n2', dataset_id: 'FAO_CP', content_type: 'noticia' },
    { id: 'n3', dataset_id: 'SOLO', content_type: 'noticia' },
  ];
  const groups = groupNoticiasByDataset(noticias, { minNoticias: 2 });
  assert.ok(groups.has('FAO_CP'));
  assert.ok(!groups.has('SOLO'));
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
