'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { csvUrl, headCsv, getCsv } = require('../lib/data360-client');

function startServer(handler) {
  return new Promise((resolve) => {
    const srv = http.createServer(handler);
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

test('csvUrl builds predictable blob path', () => {
  const url = csvUrl('WB_WDI', 'WB_WDI_FP_CPI_TOTL_ZG');
  assert.match(url, /WB_WDI\/WB_WDI_FP_CPI_TOTL_ZG\.csv$/);
});

test('headCsv sends conditional headers when cache present', async (t) => {
  let seen = null;
  const srv = await startServer((req, res) => {
    seen = req.headers;
    res.writeHead(304);
    res.end();
  });
  t.after(() => new Promise((r) => srv.close(r)));
  const { port } = srv.address();
  const url = `http://127.0.0.1:${port}/test.csv`;
  const out = await headCsv(url, { etag: '"abc"', lastModified: 'Wed, 21 May 2025 00:00:00 GMT' });
  assert.equal(out.status, 304);
  assert.equal(out.changed, false);
  assert.equal(seen['if-none-match'], '"abc"');
  assert.ok(seen['if-modified-since']);
});

test('headCsv without cache returns 200 changed', async (t) => {
  const srv = await startServer((req, res) => {
    res.writeHead(200, { ETag: '"new"', 'Last-Modified': 'Wed, 21 May 2025 00:00:00 GMT' });
    res.end();
  });
  t.after(() => new Promise((r) => srv.close(r)));
  const { port } = srv.address();
  const out = await headCsv(`http://127.0.0.1:${port}/x.csv`, null);
  assert.equal(out.status, 200);
  assert.equal(out.changed, true);
  assert.equal(out.etag, '"new"');
});

test('getCsv returns body on 200 and null on 304', async (t) => {
  const srv = await startServer((req, res) => {
    if (req.headers['if-none-match']) {
      res.writeHead(304);
      res.end();
      return;
    }
    res.writeHead(200, { ETag: '"e"' });
    res.end('a,b\n1,2');
  });
  t.after(() => new Promise((r) => srv.close(r)));
  const { port } = srv.address();
  const base = `http://127.0.0.1:${port}/d.csv`;
  const first = await getCsv(base, null);
  assert.equal(first.status, 200);
  assert.equal(first.body, 'a,b\n1,2');
  const second = await getCsv(base, { etag: '"e"' });
  assert.equal(second.status, 304);
  assert.equal(second.body, null);
});
