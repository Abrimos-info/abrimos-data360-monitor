'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('getStaticVersion returns a non-empty string', () => {
  delete require.cache[require.resolve('../lib/static-version')];
  const { getStaticVersion, getCommitHash } = require('../lib/static-version');
  const version = getStaticVersion();
  assert.match(String(version), /^\d+$/);
  assert.ok(getCommitHash().length >= 1);
});

test('staticAsset appends version query param', () => {
  delete require.cache[require.resolve('../lib/static-version')];
  const { staticAsset, getStaticVersion } = require('../lib/static-version');
  const version = getStaticVersion();
  assert.equal(staticAsset('css/main.css'), `/static/css/main.css?v=${version}`);
  assert.equal(staticAsset('/js/behavior.js'), `/static/js/behavior.js?v=${version}`);
});
