'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  publishedIndicatorIdnos,
  noticiasForReplayDay,
  selectIdnosForReplayDay,
  blobDateIso,
} = require('../lib/analysis/replay-mode');

test('blobDateIso normalizes HTTP dates', () => {
  const iso = blobDateIso('Wed, 28 May 2026 12:00:00 GMT');
  assert.match(iso, /^2026-05-28$/);
});

test('publishedIndicatorIdnos collects noticia idnos only', () => {
  const set = publishedIndicatorIdnos([
    { content_type: 'noticia', indicator: { idno: 'A' } },
    { content_type: 'reportaje', indicator: { idno: 'B' } },
    { indicator: { idno: 'C' } },
  ]);
  assert.deepEqual([...set].sort(), ['A', 'C']);
});

test('noticiasForReplayDay filters by detected_at date', () => {
  const day = noticiasForReplayDay([
    { content_type: 'noticia', detected_at: '2026-05-22T12:00:00.000Z' },
    { content_type: 'noticia', detected_at: '2026-05-23T12:00:00.000Z' },
  ], '2026-05-22');
  assert.equal(day.length, 1);
});

test('eligibleNoticiasForDay excludes rejected noticias', () => {
  const { eligibleNoticiasForDay } = require('../lib/analysis/replay-mode');
  const day = eligibleNoticiasForDay([
    { content_type: 'noticia', detected_at: '2026-05-27T12:00:00.000Z' },
    { content_type: 'noticia', detected_at: '2026-05-27T12:00:00.000Z', quality_status: 'rejected' },
  ], '2026-05-27');
  assert.equal(day.length, 1);
});

test('selectIdnosForReplayDay drips unpublished indicators', () => {
  const idnos = selectIdnosForReplayDay(
    ['A', 'B', 'C'],
    '2026-05-24',
    { indexMap: new Map(), published: new Set(['A']), strictBlob: false },
  );
  assert.deepEqual(idnos, ['B', 'C']);
});

test('selectIdnosForReplayDay strict mode matches blob day only', () => {
  const indexMap = new Map([
    ['A', { last_modified: 'Wed, 22 May 2026 10:00:00 GMT' }],
    ['B', { last_modified: 'Wed, 29 May 2026 10:00:00 GMT' }],
  ]);
  const day22 = selectIdnosForReplayDay(['A', 'B'], '2026-05-22', {
    indexMap,
    published: new Set(),
    strictBlob: true,
  });
  assert.deepEqual(day22, ['A']);
  const day29 = selectIdnosForReplayDay(['A', 'B'], '2026-05-29', {
    indexMap,
    published: new Set(['A']),
    strictBlob: true,
  });
  assert.deepEqual(day29, ['B']);
});
