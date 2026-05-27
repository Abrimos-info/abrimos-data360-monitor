'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { pickLang, pickLangMode, langModeForRoute, readFilters } = require('../lib/views');

function mockReq(query, headers = {}) {
  const url = new URL(`http://localhost/${query ? `?${query}` : ''}`);
  return { parsedUrl: url, headers };
}

test('pickLang prefers query param', () => {
  assert.equal(pickLang(mockReq('lang=en')), 'en');
  assert.equal(pickLang(mockReq('lang=es')), 'es');
});

test('langModeForRoute always matches active lang (no both mode)', () => {
  const req = mockReq('langMode=both&lang=en');
  assert.equal(langModeForRoute(req, 'monitor', 'en', pickLangMode(req)), 'en');
  assert.equal(pickLangMode(req), 'en');
});

test('readFilters defaults invalid variant to narr', () => {
  const f = readFilters(mockReq('variant=invalid&country=ARG'));
  assert.equal(f.variant, 'narr');
  assert.equal(f.country, 'ARG');
});
