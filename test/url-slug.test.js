'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  slugify,
  countrySlug,
  isoFromCountrySlug,
  buildAlertPath,
  parseArticlePath,
  assignUniquePaths,
} = require('../lib/url-slug');

test('slugify normalizes accents and spaces', () => {
  assert.equal(slugify('Aumentó la inflación en Argentina'), 'aumento-la-inflacion-en-argentina');
});

test('countrySlug maps ISO3 to slug', () => {
  assert.equal(countrySlug('ARG'), 'argentina');
  assert.equal(isoFromCountrySlug('mexico'), 'MEX');
});

test('buildAlertPath produces SEO path', () => {
  const pathStr = buildAlertPath({
    content_type: 'noticia',
    country: 'ARG',
    title: { es: 'Aumentó la inflación' },
    detected_at: '2026-05-22T10:00:00Z',
  });
  assert.match(pathStr, /^\/argentina\/noticia\/2026\/05\/aumento-la-inflacion$/);
});

test('parseArticlePath roundtrip', () => {
  const parsed = parseArticlePath(['argentina', 'noticia', '2026', '05', 'test-slug']);
  assert.equal(parsed.iso, 'ARG');
  assert.equal(parsed.slug, 'test-slug');
});

test('assignUniquePaths resolves collisions', () => {
  const base = {
    content_type: 'noticia',
    country: 'ARG',
    title: { es: 'Igual titular' },
    detected_at: '2026-05-22T10:00:00Z',
  };
  const out = assignUniquePaths([
    { ...base, id: 'a1' },
    { ...base, id: 'a2' },
  ]);
  assert.notEqual(out[0]._path, out[1]._path);
});
