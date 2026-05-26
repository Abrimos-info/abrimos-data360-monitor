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
    if (a.category != null) {
      assert.ok(typeof a.category === 'string',                      `${a.id}: category must be string`);
    }
    if ((a.content_type || 'noticia') === 'noticia') {
      assert.ok(a.indicator && typeof a.indicator.idno === 'string', `${a.id}: indicator.idno must be string`);
    } else if (a.content_type === 'reportaje') {
      assert.ok(Array.isArray(a.indicators) && a.indicators.length >= 1, `${a.id}: indicators[] required for reportaje`);
      assert.ok(a.indicators.every((x) => typeof x === 'string'),     `${a.id}: indicators[] must be strings`);
    }
    if ((a.content_type || 'noticia') === 'noticia') {
      assert.ok(a.observation && a.observation.value !== undefined,  `${a.id}: observation.value required`);
    }
    assert.ok(typeof (a.content_type || 'noticia') === 'string',     `${a.id}: content_type must be string`);
    // Noticias/reportajes can attach one or more countries (reportajes are regional).
    const countries = Array.isArray(a._countries) ? a._countries : (Array.isArray(a.countries) ? a.countries : (a.country ? [a.country] : []));
    assert.ok(countries.length >= 1,                                `${a.id}: at least one country required`);
    assert.ok(countries.every((c) => typeof c === 'string'),         `${a.id}: countries must be strings`);
    // Narratives differ by content type: the new schema uses title/lead/story per language.
    if ((a.content_type || 'noticia') === 'noticia') {
      // New schema (pipeline) uses title/lead/story. Legacy fixture uses narrative_* fields.
      const hasNew = a.title && a.lead && a.story;
      const hasLegacy = a.narrative_citizen && a.narrative_journalist;
      assert.ok(hasNew || hasLegacy,                                 `${a.id}: narrative fields required`);
    } else if (a.content_type === 'reportaje') {
      assert.ok(a.title && typeof a.title === 'object',              `${a.id}: title required`);
      assert.ok(a.story && typeof a.story === 'object',              `${a.id}: story required`);
    }
    assert.ok(a.verification_trace,                                  `${a.id}: verification_trace required`);
  }
});

test('alert type is one of the known values', () => {
  // Legacy fixture alerts use `type` (abrupt_change|anomaly). The monitor output uses `content_type`.
  const knownLegacy = new Set(['abrupt_change', 'anomaly']);
  const knownContent = new Set(['noticia', 'reportaje']);
  for (const a of store.getAlerts()) {
    if (a.type != null) {
      assert.ok(knownLegacy.has(a.type), `unknown legacy type: ${a.type}`);
    } else {
      assert.ok(knownContent.has(a.content_type || 'noticia'), `unknown content_type: ${a.content_type}`);
    }
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
  const alertCountries = new Set(
    store.getAlerts().flatMap((a) => (Array.isArray(a._countries) && a._countries.length ? a._countries : (a.country ? [a.country] : [])))
  );
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
