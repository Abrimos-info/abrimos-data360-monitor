'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadChangedIdnos } = require('../lib/changed-since');
const { maxRetriesForError } = require('../lib/news-gemini');

test('loadChangedIdnos returns changed_indicators array', () => {
  const tmp = path.join(__dirname, 'tmp', 'changed-since-test.json');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify({ changed_indicators: ['WB_KNOMAD_BRE', 'WJP_ROL_OVRL'] }), 'utf8');
  assert.deepEqual(loadChangedIdnos(tmp), ['WB_KNOMAD_BRE', 'WJP_ROL_OVRL']);
});

test('loadChangedIdnos returns empty array when none changed', () => {
  const tmp = path.join(__dirname, 'tmp', 'changed-since-empty.json');
  fs.writeFileSync(tmp, JSON.stringify({ changed_indicators: [] }), 'utf8');
  assert.deepEqual(loadChangedIdnos(tmp), []);
});

test('maxRetriesForError uses lower limit for HTTP 429', () => {
  const err429 = new Error('Gemini HTTP 429: quota');
  const err503 = new Error('Gemini HTTP 503: unavailable');
  assert.ok(maxRetriesForError(err429) <= maxRetriesForError(err503));
});
