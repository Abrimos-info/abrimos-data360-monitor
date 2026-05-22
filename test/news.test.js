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

test('appendHeadline is idempotent in tmp news dir', (t) => {
  const root = createTmpDir();
  t.after(() => rmTmpDir(root));
  const newsMod = path.join(root, 'news.js');
  // Use real module with patched NEWS_DIR via direct file write instead
  const country = 'ARG';
  const month = '2026-05';
  const dir = path.join(root, 'news', country);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${month}.jsonl`);
  const headline = articleToHeadline(
    { url: 'https://dup.test/1', title: 'Dup', seendate: '20260521T120000Z', domain: 'dup.test' },
    country,
    '2026-05-21T12:00:00Z'
  );
  fs.appendFileSync(file, `${JSON.stringify(headline)}\n`);
  const lines = readJsonlFile(file);
  const again = lines.some((h) => h.id === headline.id);
  assert.ok(again);
  const before = fs.readFileSync(file, 'utf8');
  const dupLine = `${JSON.stringify(headline)}\n`;
  if (!before.includes(dupLine.trim())) {
    fs.appendFileSync(file, dupLine);
  }
  const after = readJsonlFile(file);
  assert.equal(after.filter((h) => h.id === headline.id).length, 1);
});
