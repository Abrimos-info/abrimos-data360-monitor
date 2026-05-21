'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../lib/alerts-store');

test('getAlerts() returns an array', () => {
  assert.ok(Array.isArray(store.getAlerts()));
});

test('each alert has required schema fields', () => {
  for (const a of store.getAlerts()) {
    assert.ok(typeof a.id === 'string',                              `${a.id}: id must be string`);
    assert.ok(typeof a.country === 'string',                         `${a.id}: country must be string`);
    assert.ok(typeof a.category === 'string',                        `${a.id}: category must be string`);
    assert.ok(typeof a.type === 'string',                            `${a.id}: type must be string`);
    assert.ok(a.indicator && typeof a.indicator.idno === 'string',   `${a.id}: indicator.idno must be string`);
    assert.ok(a.observation && a.observation.value !== undefined,    `${a.id}: observation.value required`);
    assert.ok(a.narrative_citizen && typeof a.narrative_citizen === 'object', `${a.id}: narrative_citizen required`);
    assert.ok(a.verification_trace,                                  `${a.id}: verification_trace required`);
  }
});

test('alert type is one of the known values', () => {
  const known = new Set(['abrupt_change', 'cross_indicator_anomaly', 'anomaly']);
  for (const a of store.getAlerts()) {
    assert.ok(known.has(a.type), `unknown type: ${a.type}`);
  }
});

test('getCountries() returns a sorted array with no duplicates', () => {
  const countries = store.getCountries();
  assert.ok(Array.isArray(countries));
  assert.deepEqual(countries, [...countries].sort());
  assert.equal(countries.length, new Set(countries).size);
});

test('getCategories() returns a sorted array with no duplicates', () => {
  const categories = store.getCategories();
  assert.ok(Array.isArray(categories));
  assert.deepEqual(categories, [...categories].sort());
  assert.equal(categories.length, new Set(categories).size);
});

test('getCountries() values are a subset of alert country fields', () => {
  const alertCountries = new Set(store.getAlerts().map((a) => a.country));
  for (const c of store.getCountries()) {
    assert.ok(alertCountries.has(c), `derived country "${c}" not found in any alert`);
  }
});

test('getCategories() values are a subset of alert category fields', () => {
  const alertCats = new Set(store.getAlerts().map((a) => a.category));
  for (const c of store.getCategories()) {
    assert.ok(alertCats.has(c), `derived category "${c}" not found in any alert`);
  }
});

test('reload() keeps getAlerts() consistent', () => {
  store.reload();
  assert.ok(Array.isArray(store.getAlerts()));
  assert.ok(Array.isArray(store.getCountries()));
  assert.ok(Array.isArray(store.getCategories()));
});
