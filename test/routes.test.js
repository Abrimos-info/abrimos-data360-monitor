'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const views = require('../lib/views');
const routeRegistry = require('../lib/route-registry');
const { buildAlertPath } = require('../lib/url-slug');

test('routes.json viewNames resolve to views exports', () => {
  const { routes } = routeRegistry.loadRoutesConfig();
  for (const route of routes) {
    assert.equal(typeof views[route.viewName], 'function', `missing handler: ${route.viewName}`);
  }
});

test('matchRoute resolves sample paths', () => {
  assert.equal(routeRegistry.matchRoute([]).viewName, 'countryPickerPage');
  assert.equal(routeRegistry.matchRoute(['about']).viewName, 'aboutPage');
  assert.equal(routeRegistry.matchRoute(['chat']).viewName, 'chatPage');
  assert.equal(routeRegistry.matchRoute(['indicadores']).viewName, 'indicatorsHubPage');
  assert.equal(routeRegistry.matchRoute(['mexico']).viewName, 'frontpagePage');
  assert.equal(routeRegistry.matchRoute(['indicador', 'WB_WDI_FP_CPI_TOTL_ZG']).viewName, 'indicatorDetailPage');
  assert.equal(routeRegistry.matchRoute(['metodologia']).viewName, 'metodologiaPage');
  assert.equal(routeRegistry.matchRoute(['privacidad']).viewName, 'privacidadPage');
  assert.equal(routeRegistry.matchRoute(['terminos']).viewName, 'terminosPage');
  assert.equal(routeRegistry.matchRoute(['uso']).viewName, 'usoPage');
  assert.equal(routeRegistry.matchRoute(['newsletter']).viewName, 'newsletterIndexPage');
  assert.equal(routeRegistry.matchRoute(['newsletter', 'lac', '2026-05-28']).viewName, 'newsletterEditionPage');
  assert.equal(routeRegistry.matchRoute(['alertas', 'mexico', 'ejemplo']).viewName, 'alertsSamplePage');
  assert.equal(routeRegistry.matchRoute(['no-such-page']).viewName, 'notFoundPage');
});

test('matchRoute resolves 5-segment article paths', () => {
  const samplePath = buildAlertPath({
    countrySlug: 'argentina',
    contentType: 'noticia',
    slug: 'inflacion-alimentos',
    id: 'noticia_test',
  });
  const segments = samplePath.split('/').filter(Boolean);
  assert.equal(segments.length, 5);
  const match = routeRegistry.matchRoute(segments);
  assert.equal(match.viewName, 'alertPage');
  assert.ok(match.params.parsed);
});
