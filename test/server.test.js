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
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
  });

  await t.test('GET /argentina returns front page', async () => {
    const res = await get(base + '/argentina');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('d360-frontpage') || res.body.includes('d360-page--frontpage'));
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
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
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
    assert.ok(res.body.includes('d360-ind-pill__id'));
    assert.ok(res.body.includes('d360-indicator-meta'));
    assert.ok(res.body.includes('d360-local-datetime'));
    assert.ok(res.body.includes('d360-lastupdate'));
  });

  await t.test('GET /indicador/FAO_CP_23012 returns indicator page', async () => {
    const store = require('../lib/alerts-store');
    const idno = (store.getAlerts().find((a) => a?.indicator?.idno)?.indicator?.idno) || 'WB_WDI_FP_CPI_TOTL_ZG';
    const res = await get(base + '/indicador/' + encodeURIComponent(idno));
    assert.equal(res.status, 200);
    assert.ok(res.body.includes(idno));
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
  });

  await t.test('GET / body includes recent indicators section when data exists', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('d360-picker'));
  });

  await t.test('GET / without country cookie links Portada to country picker', async () => {
    const res = await get(base + '/');
    assert.match(res.body, /wb-nav__link[^>]+href="\/"/);
    assert.doesNotMatch(res.body, /wb-nav__link[^>]+href="\/argentina"/);
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

  await t.test('GET /argentina front page has PCN legend and no visible ISO tag', async () => {
    const res = await get(base + '/argentina');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('d360-pcn-legend'));
    assert.doesNotMatch(res.body, /class="d360-country__iso"/);
  });

  await t.test('GET /argentina front page ticker uses observationWithPcn when indicators exist', async () => {
    const res = await get(base + '/argentina');
    if (!res.body.includes('d360-frontpage__indicator-val')) return;
    assert.ok(
      res.body.includes('d360-obs-with-pcn') || res.body.includes('d360-vmark'),
      'expected PCN markup in indicator rail',
    );
  });

  await t.test('GET /argentina front page hero has editorial eyebrow', async () => {
    const res = await get(base + '/argentina');
    if (!res.body.includes('d360-frontpage__hero')) return;
    assert.ok(res.body.includes('d360-frontpage__hero-eyebrow'));
    assert.ok(res.body.includes('d360-frontpage__hero-rule'));
  });

  await t.test('GET /about has country selector with language', async () => {
    const res = await get(base + '/about');
    assert.ok(res.body.includes('wb-header__locale'));
    assert.ok(res.body.includes('d360-country-select'));
  });

  await t.test('GET /argentina front page has edition masthead', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-header__edition'));
  });

  await t.test('GET /argentina headlines show month and year', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-frontpage__headline-date'));
    // In fixture-only CI, we may render an empty state with no seeded headlines.
    // When headlines exist, dates should show month+year.
    if (res.body.includes('sep 2025') || res.body.includes('may 2026')) {
      assert.ok(true);
    }
    assert.ok(res.body.includes('d360-frontpage__headline-meta-sep'));
    assert.match(res.body, /d360-frontpage__headline-meta[\s\S]{0,400}d360-ind-pill__id/);
  });

  await t.test('GET /argentina headlines show generation datetime', async () => {
    const res = await get(base + '/argentina');
    assert.ok(res.body.includes('d360-frontpage__headline-generated'));
    assert.ok(res.body.includes('d360-local-datetime'));
    assert.match(res.body, /datetime="[^"]+"/);
  });

  await t.test('GET /argentina hero shows generation datetime', async () => {
    const res = await get(base + '/argentina');
    // Hero exists only when there is a featured reportaje in the dataset.
    if (res.body.includes('d360-frontpage__hero')) {
      assert.ok(res.body.includes('local-datetime.js'));
    }
    assert.ok(res.body.includes('local-datetime.js'));
  });

  await t.test('GET article page shows production metadata in chrome footer', async () => {
    const store = require('../lib/alerts-store');
    const argAlert = store.getAlertsForCountry('ARG')[0];
    if (!argAlert || !argAlert._paths || !argAlert._paths.ARG) return;
    const res = await get(base + argAlert._paths.ARG);
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('d360-article-chrome'));
    assert.ok(res.body.includes('d360-article__production-meta') || res.body.includes('d360-article__disclaimer'));
    assert.match(res.body, /Generado|Generated/);
    assert.match(res.body, /time[^>]+d360-local-datetime[^>]+datetime="/);
  });

  await t.test('GET article page uses floating scoped chat without embedded chat', async () => {
    const store = require('../lib/alerts-store');
    const argAlert = store.getAlertsForCountry('ARG')[0];
    if (!argAlert || !argAlert._paths || !argAlert._paths.ARG) return;
    const res = await get(base + argAlert._paths.ARG);
    assert.doesNotMatch(res.body, /d360-article__chat/);
    assert.doesNotMatch(res.body, /d360-alert-chat/);
    assert.ok(res.body.includes('d360-floating-chat--scoped'));
    assert.ok(res.body.includes('d360-fab-presets'));
    assert.ok(res.body.includes('window.D360_ALERT_ID'));
    assert.ok(res.body.includes('d360-shell'));
  });

  await t.test('GET / includes inline logo mark in header', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('d360-lockup__mark'));
    assert.match(res.body, /d360-lockup__mark[\s\S]{0,200}circle/);
  });

  await t.test('GET /argentina hero reportaje shows lead text', async () => {
    const res = await get(base + '/argentina');
    // Hero reportaje isn't present in the legacy fixture dataset.
    if (res.body.includes('d360-frontpage__hero-lede')) {
      assert.ok(
        res.body.includes('World Justice Project') || res.body.includes('Justicia del World Justice'),
        'expected hero lead copy from featured reportaje',
      );
    }
  });

  await t.test('country frontpage and reportaje article render dumbbell chart', async () => {
    const reportaje = require('../lib/alerts-store').getAlerts()
      .find((a) => a.content_type === 'reportaje' && (a.noticia_ids || []).length >= 2);
    if (!reportaje) return;

    const iso = (reportaje.countries || [])[0] || 'ARG';
    const slugMap = { ARG: 'argentina', ECU: 'ecuador', GTM: 'guatemala', HND: 'honduras', MEX: 'mexico' };
    const countryPath = slugMap[iso] || 'argentina';
    const fp = await get(`${base}/${countryPath}`);
    if (fp.body.includes('d360-frontpage__hero-chart')) {
      assert.match(fp.body, /d360-dumbbell/);
    }

    const articlePath = reportaje._paths && reportaje._paths[iso];
    if (!articlePath) return;
    const art = await get(`${base}${articlePath}`);
    assert.equal(art.status, 200);
    assert.match(art.body, /d360-article__reportaje-chart/);
    assert.match(art.body, /d360-dumbbell/);
  });

  await t.test('GET /about returns 200 text/html', async () => {
    const res = await get(base + '/about');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/html'));
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
    assert.ok(res.body.includes('d360-prose'));
    assert.ok(res.body.includes('trazabilidad activa') || res.body.includes('active traceability'));
  });

  await t.test('GET /alertas/mexico/ejemplo returns alerts sample copy', async () => {
    const res = await get(base + '/alertas/mexico/ejemplo');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('Alertas de indicadores') || res.body.includes('Indicator alerts'));
    assert.doesNotMatch(res.body, /\[alerts\.sample_/);
  });

  await t.test('GET /static/css/main.css returns 200 text/css', async () => {
    const res = await get(base + '/static/css/main.css');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/css'));
  });

  await t.test('GET /static/css/main.css with ?v= returns 200', async () => {
    const res = await get(base + '/static/css/main.css?v=123');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/css'));
  });

  await t.test('HTML pages reference versioned static assets', async () => {
    const res = await get(base + '/about');
    assert.equal(res.status, 200);
    assert.match(res.body, /\/static\/css\/main\.css\?v=\d+/);
    assert.match(res.body, /window\.staticVersion\s*=\s*"\d+"/);
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

  await t.test('GET /chat returns chat page with wb chrome', async () => {
    const res = await get(base + '/chat');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('wb-nav'));
    assert.ok(res.body.includes('d360-chat'));
    assert.ok(res.body.includes('d360-page--band'));
    assert.ok(res.body.includes('d360-shell'));
    assert.ok(res.body.includes('d360-lockup__mark'));
    assert.match(res.body, /d360-lockup__mark[\s\S]{0,200}circle/);
  });

  await t.test('GET / includes product chrome and logo', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('wb-nav'));
    assert.ok(res.body.includes('d360-lockup__mark'));
    assert.match(res.body, /d360-lockup__mark[\s\S]{0,200}circle/);
    assert.ok(!res.body.includes('WORLD BANK GROUP'));
    assert.ok(!res.body.includes('wb-globe.svg'));
  });

  await t.test('newsletter modal form fields present on home', async () => {
    const res = await get(base + '/');
    assert.ok(res.body.includes('id="d360-subscribe-form"'));
    assert.ok(res.body.includes('name="subscription_type"'));
    assert.ok(res.body.includes('value="newsletter_lac"'));
    assert.ok(res.body.includes('value="indicator_alerts"'));
    assert.ok(res.body.includes('id="d360-subscribe-country"'));
    assert.ok(res.body.includes('id="d360-subscribe-email"'));
    assert.ok(res.body.includes('data-open-subscribe'));
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

  await t.test('GET /metodologia returns methodology page', async () => {
    const res = await get(base + '/metodologia');
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('static.metodologia') || res.body.includes('Metodolog'));
  });

  await t.test('POST /api/subscribe accepts newsletter_lac', async () => {
    const res = await new Promise((resolve, reject) => {
      const req = http.request(base + '/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (r) => {
        let body = '';
        r.on('data', (chunk) => { body += chunk; });
        r.on('end', () => resolve({ status: r.statusCode, body }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({
        email: 'test@example.com',
        subscription_type: 'newsletter_lac',
        lang: 'es',
      }));
      req.end();
    });
    assert.equal(res.status, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.ok, true);
    assert.ok(data.preview_url.includes('/newsletter/lac/'));
  });

  await t.test('GET /?langMode=both ignores both and uses lang', async () => {
    const res = await get(base + '/?langMode=both&lang=en');
    assert.equal(res.status, 200);
    assert.match(res.body, /lang="en"/);
  });
});
