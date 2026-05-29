'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { computeNewsWindow, addDays } = require('../lib/news-window');
const { summarizeCountryNewsCoverage } = require('../lib/news-coverage');
const { buildCountrySearchPrompt } = require('../lib/news-gemini');

test('computeNewsWindow anchors replay range with lookback', () => {
  const w = computeNewsWindow({ from: '2026-05-22', to: '2026-05-29', lookbackDays: 30 });
  assert.equal(w.to, '2026-05-29');
  assert.equal(w.from, addDays('2026-05-22', -30));
});

test('computeNewsWindow uses asOf as end when only replay from provided', () => {
  const w = computeNewsWindow({ from: '2026-05-22', lookbackDays: 14 });
  assert.equal(w.to, '2026-05-22');
  assert.equal(w.from, addDays('2026-05-22', -14));
});

test('buildCountrySearchPrompt is macro scoped without indicator idno', () => {
  const prompt = buildCountrySearchPrompt('MEX', {
    from: '2026-04-22',
    to: '2026-05-29',
    maxArticles: 8,
  });
  assert.match(prompt, /Mexico/i);
  assert.match(prompt, /2026-04-22/);
  assert.match(prompt, /2026-05-29/);
  assert.match(prompt, /economía/i);
  assert.doesNotMatch(prompt, /WB_/);
});

test('summarizeCountryNewsCoverage counts accepted headlines in window', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'news-cov-'));
  const newsDir = path.join(tmp, 'news');
  fs.mkdirSync(path.join(newsDir, 'ARG'), { recursive: true });
  const rows = [
    { headline: 'A', url: 'https://a.com/1', published_at: '2026-05-10T00:00:00Z', ingest_status: 'accepted', country: 'ARG' },
    { headline: 'B', url: 'https://a.com/2', published_at: '2026-05-15T00:00:00Z', ingest_status: 'accepted', country: 'ARG' },
    { headline: 'Old', url: 'https://a.com/3', published_at: '2026-03-01T00:00:00Z', ingest_status: 'accepted', country: 'ARG' },
  ];
  fs.writeFileSync(
    path.join(newsDir, 'ARG', '2026-05.jsonl'),
    rows.map((r) => JSON.stringify(r)).join('\n'),
    'utf8',
  );
  const summary = summarizeCountryNewsCoverage(['ARG'], {
    from: '2026-04-01',
    to: '2026-05-29',
    minAccepted: 2,
    newsDir,
  });
  assert.deepEqual(summary.hasNews, ['ARG']);
  assert.deepEqual(summary.needsNews, []);
  assert.equal(summary.details.ARG.accepted, 2);
});
