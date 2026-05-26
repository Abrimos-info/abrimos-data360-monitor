'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatLocalDisplay, formatLocalTitle } = require('../lib/local-datetime');

test('formatLocalDisplay omits timezone suffix', () => {
  const out = formatLocalDisplay('2026-05-21T15:30:00.000Z', 'es');
  assert.match(out, /\d/);
  assert.doesNotMatch(out, /UTC|GMT|hora/i);
});

test('formatLocalTitle includes timezone name', () => {
  const out = formatLocalTitle('2026-05-21T15:30:00.000Z', 'en');
  assert.ok(out.length > 10);
  assert.match(out, /UTC|GMT|[A-Za-z]{3,}/);
});
