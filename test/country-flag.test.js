'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { iso3ToFlagEmoji } = require('../lib/country-flag');

test('iso3ToFlagEmoji returns flag for demo countries', () => {
  assert.equal(iso3ToFlagEmoji('ARG'), '🇦🇷');
  assert.equal(iso3ToFlagEmoji('MEX'), '🇲🇽');
  assert.equal(iso3ToFlagEmoji('GTM'), '🇬🇹');
});

test('iso3ToFlagEmoji returns empty for unknown ISO3', () => {
  assert.equal(iso3ToFlagEmoji('USA'), '');
  assert.equal(iso3ToFlagEmoji(''), '');
});
