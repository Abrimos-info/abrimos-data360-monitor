'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { summarizeIndicatorNewsCoverage } = require('../lib/news-coverage');

test('summarizeIndicatorNewsCoverage splits has-news vs needs-news', (t) => {
  const tmpRoot = path.join(__dirname, 'tmp', 'news-coverage');
  t.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

  const file = path.join(tmpRoot, 'GTM', '2026-05.jsonl');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    JSON.stringify({
      id: 'a1',
      country: 'GTM',
      published_at: '2026-05-10T12:00:00.000Z',
      headline: 'Remesas suben',
      url: 'https://example.com/a',
      ingest_status: 'accepted',
      indicators_hint: ['WB_KNOMAD_BRE'],
    }),
    JSON.stringify({
      id: 'a2',
      country: 'GTM',
      published_at: '2026-05-11T12:00:00.000Z',
      headline: 'Rechazada',
      url: 'https://example.com/b',
      ingest_status: 'rejected',
      indicators_hint: ['WB_KNOMAD_MRI'],
    }),
  ].join('\n') + '\n', 'utf8');

  const summary = summarizeIndicatorNewsCoverage(
    ['WB_KNOMAD_BRE', 'WB_KNOMAD_MRI', 'WJP_ROL_OVRL'],
    ['GTM'],
    { from: '2026-05-01', to: '2026-05-21', minAccepted: 1, newsDir: tmpRoot },
  );

  assert.deepEqual(summary.hasNews, ['WB_KNOMAD_BRE']);
  assert.deepEqual(summary.needsNews, ['WB_KNOMAD_MRI', 'WJP_ROL_OVRL']);
  assert.equal(summary.details.WB_KNOMAD_BRE.accepted, 1);
  assert.deepEqual(summary.details.WB_KNOMAD_BRE.countries, ['GTM']);
  assert.equal(summary.details.WB_KNOMAD_MRI.accepted, 0);
});
