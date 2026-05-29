'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { pipeLog, stepLog } = require('../lib/pipe-log');

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

test('stepLog and milestone pipeLog append run elapsed', () => {
  const prev = process.env.D360_RUN_EPOCH;
  process.env.D360_RUN_EPOCH = String(Date.now() - 65_000);
  const lines = [];
  const orig = console.log;
  console.log = (line) => lines.push(line);
  try {
    stepLog('pipeline', 'discover ...');
    pipeLog('fetch-news', 'done', { mode: 'pool', calls: 5 });
    pipeLog('news-gemini', 'article', { idno: 'X', headline: 'H' });
  } finally {
    console.log = orig;
    if (prev) process.env.D360_RUN_EPOCH = prev;
    else delete process.env.D360_RUN_EPOCH;
  }
  assert.match(lines[0], /\[pipeline\] discover \.\.\. \| \+1m 5s/);
  assert.match(lines[1], /\[fetch-news\] done \|.*\| \+1m 5s/);
  assert.doesNotMatch(lines[2], /\+1m 5s/);
});
