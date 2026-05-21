'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const router = require('../lib/router');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

test('HTTP routes', async (t) => {
  const srv = http.createServer(router.requestListener);
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const { port } = srv.address();
  const base = `http://127.0.0.1:${port}`;

  t.after(() => new Promise((resolve) => srv.close(resolve)));

  await t.test('GET / returns 200 text/html', async () => {
    const res = await get(base + '/');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
  });

  await t.test('GET / body includes app shell and inline data', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('d360-app'),        'missing app shell element');
    assert.ok(res.body.includes('D360_ALERTS'),     'missing inline alert data');
    assert.ok(res.body.includes('d360-detail-tpl'), 'missing detail template element');
  });

  await t.test('GET / tagline matches D-006 exact phrase', async () => {
    const res = await get(base + '/');
    assert.ok(
      res.body.includes('Verified events across Data360 indicators'),
      'tagline not found in page'
    );
  });

  await t.test('GET /about returns 200 text/html', async () => {
    const res = await get(base + '/about');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
  });

  await t.test('GET /static/css/main.css returns 200 text/css', async () => {
    const res = await get(base + '/static/css/main.css');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/css'));
  });

  await t.test('GET /static/css/tokens.css returns 200 text/css', async () => {
    const res = await get(base + '/static/css/tokens.css');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/css'));
  });

  await t.test('GET /static/js/behavior.js returns 200 text/javascript', async () => {
    const res = await get(base + '/static/js/behavior.js');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('javascript'));
  });

  await t.test('GET /nonexistent returns 404', async () => {
    const res = await get(base + '/this-page-does-not-exist');
    assert.equal(res.status, 404);
  });

  await t.test('GET /static/nonexistent.css returns 404', async () => {
    const res = await get(base + '/static/css/nonexistent.css');
    assert.equal(res.status, 404);
  });

  await t.test('GET /?country=ARG returns 200 without crashing', async () => {
    const res = await get(base + '/?country=ARG');
    assert.equal(res.status, 200);
  });

  await t.test('GET /?variant=num returns 200 without crashing', async () => {
    const res = await get(base + '/?variant=num');
    assert.equal(res.status, 200);
  });

  await t.test('GET /?variant=invalid defaults gracefully', async () => {
    const res = await get(base + '/?variant=invalid');
    assert.equal(res.status, 200);
  });

  await t.test('GET /?alert=nonexistent-id returns 200 without crashing', async () => {
    const res = await get(base + '/?alert=nonexistent-id');
    assert.equal(res.status, 200);
  });
});
