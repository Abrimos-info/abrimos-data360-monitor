'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { pipeLog } = require('../lib/pipe-log');

test('pipeLog formats key=value pairs', () => {
  const lines = [];
  const orig = console.log;
  console.log = (line) => lines.push(line);
  try {
    pipeLog('news-gemini', 'article', {
      idno: 'WB_KNOMAD_BRE',
      country: 'GTM',
      status: 'accepted',
      headline: 'Remesas suben',
      url: 'https://example.com/nota',
      body: '2500chars',
    });
  } finally {
    console.log = orig;
  }
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[news-gemini\] article \|/);
  assert.match(lines[0], /url=https:\/\/example.com\/nota/);
  assert.match(lines[0], /headline=Remesas suben/);
});

test('pipeLog omits empty fields', () => {
  const lines = [];
  const orig = console.warn;
  console.warn = (line) => lines.push(line);
  try {
    pipeLog('fetch-news', 'fail', { country: 'ARG', error: 'timeout' }, 'warn');
  } finally {
    console.warn = orig;
  }
  assert.match(lines[0], /^\[fetch-news\] fail \| country=ARG \| error=timeout$/);
});
