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

  await t.test('GET / body includes country picker', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('d360-app'), 'missing app shell element');
    assert.ok(res.body.includes('d360-picker'), 'missing country picker');
  });

  await t.test('GET /argentina returns front page', async () => {
    const res = await get(base + '/argentina');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('d360-frontpage') || res.body.includes('d360-page--frontpage'));
  });

  await t.test('GET / tagline matches D-006 exact phrase', async () => {
    const i18n = require('../lib/i18n');
    const tagline = i18n.getString('tagline', 'en');
    const res = await get(base + '/?lang=en');
    assert.match(
      res.body,
      new RegExp(`<meta name="description" content="${tagline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      'tagline meta description not found in page'
    );
  });

  await t.test('GET /indicadores returns indicators hub', async () => {
    const res = await get(base + '/indicadores');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('d360-page--indicators'));
    assert.ok(res.body.includes('d360-ind-pill__id'));
    assert.ok(res.body.includes('d360-indicator-meta'));
  });

  await t.test('GET /indicador/FAO_CP_23012 returns indicator page', async () => {
    const res = await get(base + '/indicador/FAO_CP_23012');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('FAO_CP_23012'));
  });

  await t.test('GET / body includes recent indicators section when data exists', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('d360-picker'));
  });

  await t.test('GET /argentina nav links Portada to country edition', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('href="/argentina"'));
    assert.match(res.body, /nav\.monitor|Portada|Home/);
  });

  await t.test('GET /argentina front page has edition and update on one line', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-header__edition-line'));
    assert.ok(res.body.includes('d360-country-select'));
  });

  await t.test('GET /argentina front page has vertical indicator list', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-frontpage__indicator-list'));
    assert.ok(res.body.includes('d360-frontpage__indicator-cols'));
    assert.ok(res.body.includes('d360-frontpage__indicator-value-col'));
  });

  await t.test('GET /about has country selector with language', async () => {
    const res = await get(base + '/about');
    assert.ok(res.body.includes('d360-site-nav__locale'));
    assert.ok(res.body.includes('d360-country-select'));
  });

  await t.test('GET /argentina front page has edition masthead', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-header__edition'));
  });

  await t.test('GET /argentina headlines show month and year', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-frontpage__headline-date'));
    assert.ok(res.body.includes('sep 2025') || res.body.includes('may 2026'));
    assert.ok(res.body.includes('d360-frontpage__headline-meta-sep'));
    assert.match(res.body, /d360-frontpage__headline-meta[\s\S]{0,400}d360-ind-pill__id/);
  });

  await t.test('GET /argentina hero reportaje shows lead text', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-frontpage__hero-lede'));
    assert.ok(
      res.body.includes('World Justice Project') || res.body.includes('Justicia del World Justice'),
      'expected hero lead copy from featured reportaje',
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

  await t.test('GET /?country=ARG legacy feed via query on country path', async () => {
    const res = await get(base + '/argentina?legacy=1');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('D360_ALERTS'));
  });

  await t.test('GET /?variant=num on legacy feed', async () => {
    const res = await get(base + '/argentina?legacy=1&variant=num');
    assert.equal(res.status, 200);
  });

  await t.test('GET /?variant=invalid on legacy feed', async () => {
    const res = await get(base + '/argentina?legacy=1&variant=invalid');
    assert.equal(res.status, 200);
  });

  await t.test('GET /?alert=nonexistent-id returns 200 without crashing', async () => {
    const res = await get(base + '/?alert=nonexistent-id');
    assert.equal(res.status, 200);
  });

  await t.test('GET /api/chat/config returns chat LLM info', async () => {
    const res = await get(base + '/api/chat/config');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('application/json'));
    const data = JSON.parse(res.body);
    assert.ok(data.providerLabel || data.provider);
    assert.ok(data.model);
  });

  await t.test('GET /chat redirects to home', async () => {
    const res = await get(base + '/chat');
    assert.equal(res.status, 302);
    assert.equal(res.headers.location, '/');
  });

  await t.test('newsletter UI elements present on dashboard', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('id="d360-subscribe-btn"'));
    assert.ok(res.body.includes('id="d360-newsletter"'));
  });

  await t.test('GET /static/js/newsletter-modal.js returns 200', async () => {
    const res = await get(base + '/static/js/newsletter-modal.js');
    assert.equal(res.status, 200);
  });

  await t.test('GET /static traversal blocked', async () => {
    const res = await get(base + '/static/../package.json');
    assert.equal(res.status, 404);
  });

  await t.test('GET /?lang=es sets html lang', async () => {
    const res = await get(base + '/?lang=es');
    assert.match(res.body, /<html[^>]*lang="es"/);
  });

  await t.test('GET /?langMode=both returns 200 on monitor', async () => {
    const res = await get(base + '/?langMode=both');
    assert.equal(res.status, 200);
  });
});
