'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  datasetSearchUrl,
  resolvePublicDatasetUrl,
  indicatorUrl,
  indicatorSearchUrl,
  csvUrl,
} = require('../lib/data360-urls');

test('datasetSearchUrl uses public search endpoint', () => {
  assert.equal(
    datasetSearchUrl('FAO_CP'),
    'https://data360.worldbank.org/en/search?query=FAO_CP',
  );
});

test('indicatorUrl uses public indicator page', () => {
  assert.equal(
    indicatorUrl('WB_KNOMAD_MIG'),
    'https://data360.worldbank.org/en/indicator/WB_KNOMAD_MIG',
  );
});

test('resolvePublicDatasetUrl rewrites legacy int/dataset links', () => {
  assert.equal(
    resolvePublicDatasetUrl(null, 'https://data360.worldbank.org/en/int/dataset/WB_PIP'),
    'https://data360.worldbank.org/en/search?query=WB_PIP',
  );
  assert.equal(
    resolvePublicDatasetUrl('FAO_CP', 'https://data360.worldbank.org/en/int/dataset/IGNORED'),
    'https://data360.worldbank.org/en/search?query=FAO_CP',
  );
});

test('indicatorUrl adds trend view and country when country is set', () => {
  assert.equal(
    indicatorUrl('WB_MPO_NVINDTOTLCN', { country: 'ARG' }),
    'https://data360.worldbank.org/en/indicator/WB_MPO_NVINDTOTLCN?view=trend&country=ARG',
  );
});

test('indicatorSearchUrl is alias of indicatorUrl', () => {
  assert.equal(
    indicatorSearchUrl('FAO_CP_23012', { country: 'MEX' }),
    'https://data360.worldbank.org/en/indicator/FAO_CP_23012?view=trend&country=MEX',
  );
});

test('csvUrl points at data360files blob', () => {
  assert.equal(
    csvUrl('FAO_CP', 'FAO_CP_23012'),
    'https://data360files.worldbank.org/data360-data/data/FAO_CP/FAO_CP_23012.csv',
  );
});
