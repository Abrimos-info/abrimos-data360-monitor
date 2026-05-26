'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  appendRawGeminiResponse,
  rawJsonlPath,
  parseJsonFromText,
} = require('../lib/news-gemini');

test('parseJsonFromText extracts JSON from fenced markdown', () => {
  const parsed = parseJsonFromText('Here you go:\n```json\n{"articles":[{"headline":"H","url":"https://x.com/a"}]}\n```');
  assert.equal(parsed.articles[0].headline, 'H');
});

test('appendRawGeminiResponse writes audit line to country jsonl', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'news-raw-'));
  const record = {
    fetched_at: '2026-05-22T12:00:00.000Z',
    country: 'ARG',
    idno: 'WB_WDI_SL_UEM_TOTL_ZS',
    raw_text: '{"articles":[]}',
    parsed: { articles: [] },
    articles_saved: 0,
  };
  const file = appendRawGeminiResponse('ARG', record, tmp);
  assert.equal(file, rawJsonlPath('ARG', tmp));
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).idno, 'WB_WDI_SL_UEM_TOTL_ZS');
  fs.rmSync(tmp, { recursive: true, force: true });
});
