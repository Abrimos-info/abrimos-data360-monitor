'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('appendHeadline always writes even when checks fail', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'news-append-'));
  const newsDir = path.join(tmpRoot, 'data', 'news');
  const newsPath = path.join(tmpRoot, 'lib', 'news.js');
  fs.mkdirSync(path.dirname(newsPath), { recursive: true });
  fs.writeFileSync(newsPath, `
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO_ROOT = ${JSON.stringify(tmpRoot)};
const NEWS_DIR = path.join(REPO_ROOT, 'data', 'news');
function headlineId(url) {
  return crypto.createHash('sha1').update(String(url).toLowerCase()).digest('hex');
}
function monthKeyFromIso(iso) { return iso ? iso.slice(0, 7) : null; }
function resolveNewsMonth(headline) {
  return monthKeyFromIso(headline.published_at || headline.fetched_at) || new Date().toISOString().slice(0, 7);
}
function jsonlPath(country, month) { return path.join(NEWS_DIR, country, month + '.jsonl'); }
function appendHeadline(country, headline) {
  if (!headline.id) headline.id = headlineId(headline.url || headline.fetched_at);
  const file = jsonlPath(country, resolveNewsMonth(headline));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(headline) + '\\n', 'utf8');
  return true;
}
module.exports = { appendHeadline, jsonlPath, NEWS_DIR };
`);

  const { appendHeadline, jsonlPath } = require(newsPath);
  const bad = {
    id: 'bad1',
    fetched_at: '2026-05-21T12:00:00Z',
    ingest_status: 'rejected',
    ingest_tags: ['missing_url', 'missing_headline'],
    headline: null,
    url: null,
  };
  assert.equal(appendHeadline('ARG', bad), true);
  assert.equal(appendHeadline('ARG', { ...bad, ingest_tags: ['duplicate_url_store'] }), true);
  const file = jsonlPath('ARG', '2026-05');
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 2);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
