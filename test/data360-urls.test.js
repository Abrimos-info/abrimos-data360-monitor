'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  datasetSearchUrl,
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

test('indicatorSearchUrl is alias of indicatorUrl', () => {
  assert.equal(
    indicatorSearchUrl('FAO_CP_23012'),
    'https://data360.worldbank.org/en/indicator/FAO_CP_23012',
  );
});

test('csvUrl points at data360files blob', () => {
  assert.equal(
    csvUrl('FAO_CP', 'FAO_CP_23012'),
    'https://data360files.worldbank.org/data360-data/data/FAO_CP/FAO_CP_23012.csv',
  );
});
