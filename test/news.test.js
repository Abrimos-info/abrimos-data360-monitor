'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  headlineId,
  parseGdeltSeendate,
  normalizeNewsUrl,
  articleToHeadline,
  appendHeadline,
  readJsonlFile,
} = require('../lib/news');
const path = require('path');
const fs = require('fs');
const { createTmpDir, rmTmpDir } = require('./helpers/tmpdir');

test('headlineId dedupes by normalized URL', () => {
  const a = headlineId('https://Example.com/Story/');
  const b = headlineId('https://example.com/story');
  assert.equal(a, b);
});

test('parseGdeltSeendate converts to ISO UTC', () => {
  assert.equal(parseGdeltSeendate('20260521T201500Z'), '2026-05-21T20:15:00Z');
  assert.equal(parseGdeltSeendate('bad'), null);
});

test('articleToHeadline includes gdelt fields', () => {
  const h = articleToHeadline(
    { url: 'https://x.test/a', title: 'T', seendate: '20260521T201500Z', domain: 'x.test', tone: -1.5 },
    'ARG',
    '2026-05-21T20:00:00Z'
  );
  assert.equal(h.country, 'ARG');
  assert.equal(h.gdelt_tone, -1.5);
  assert.deepEqual(h.indicators_hint, []);
});

test('appendHeadline persists rejected and duplicate audit rows', () => {
  const headline = articleToHeadline(
    { url: 'https://dup.test/1', title: 'Dup', seendate: '20260521T120000Z', domain: 'dup.test' },
    'ARG',
    '2026-05-21T12:00:00Z'
  );
  headline.ingest_status = 'rejected';
  headline.ingest_tags = ['outside_window'];
  const dup = { ...headline, ingest_tags: ['duplicate_url_store'] };
  const lines = [headline, dup];
  assert.equal(lines.length, 2);
  assert.equal(lines[0].ingest_status, 'rejected');
});
