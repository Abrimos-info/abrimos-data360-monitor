'use strict';

const fs = require('fs');
const path = require('path');
const pug = require('pug');

const i18n = require('./i18n');
const alertsStore = require('./alerts-store');
const { latestDetectedAt, formatLastUpdate } = require('./alert-display');
const { loadChatPresets, buildFreshnessPreset, DEMO_COUNTRIES } = require('./chat/freshness-preset');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');

const templateCache = new Map();

function getTemplate(name) {
  if (templateCache.has(name)) return templateCache.get(name);
  const filepath = path.join(TEMPLATES_DIR, `${name}.pug`);
  const fn = pug.compileFile(filepath, { cache: false, pretty: false });
  templateCache.set(name, fn);
  return fn;
}

function clearTemplateCache() {
  templateCache.clear();
}

function pickLang(req) {
  const url = req.parsedUrl;
  const q = url.searchParams.get('lang');
  if (q === 'es' || q === 'en') return q;
  const m = url.searchParams.get('langMode');
  if (m === 'es' || m === 'en') return m;
  const accept = (req.headers['accept-language'] || '').toLowerCase();
  if (accept.startsWith('en')) return 'en';
  return 'es';
}

function pickLangMode(req) {
  const m = req.parsedUrl.searchParams.get('langMode');
  if (m === 'es' || m === 'en') return m;
  if (m === 'both') return pickLang(req);
  return pickLang(req);
}

function langModeForRoute(req, route, lang, langMode) {
  if (route === 'monitor') return langMode === 'both' ? lang : langMode;
  return langMode;
}

function readFilters(req) {
  const sp = req.parsedUrl.searchParams;
  const variant = sp.get('variant');
  return {
    country: sp.get('country') || 'ALL',
    category: sp.get('category') || 'ALL',
    variant: ['narr', 'num', 'news'].includes(variant) ? variant : 'narr',
    alert: sp.get('alert') || null,
  };
}

function applyFilters(alerts, filters) {
  return alerts.filter((a) => {
    if (filters.country !== 'ALL' && a.country !== filters.country) return false;
    if (filters.category !== 'ALL' && a.category !== filters.category) return false;
    return true;
  });
}

function loadPresets(lang) {
  return loadChatPresets(lang || 'es');
}

function pageLocals(req, extra = {}) {
  const lang = pickLang(req);
  const rawLangMode = pickLangMode(req);
  const route = extra.activeRoute || 'monitor';
  const langMode = langModeForRoute(req, route, lang, rawLangMode);
  return {
    lang,
    langMode,
    stringsEs: i18n.getAll('es'),
    stringsEn: i18n.getAll('en'),
    _: i18n.getString,
    ...extra,
  };
}

async function dashboardPage(req, res) {
  const langMode = pickLangMode(req);
  const filters = readFilters(req);
  const allAlerts = alertsStore.getAlerts();
  const visibleAlerts = applyFilters(allAlerts, filters);
  const lastUpdateIso = latestDetectedAt(allAlerts);

  const html = getTemplate('dashboard')(pageLocals(req, {
    activeRoute: 'monitor',
    filters,
    allAlerts,
    visibleAlerts,
    selectedAlertId: filters.alert,
    lastUpdate: formatLastUpdate(lastUpdateIso),
    countries: alertsStore.getCountries(),
    categories: alertsStore.getCategories(),
  }));

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function chatPage(req, res) {
  const lang = pickLang(req);
  const freshness = buildFreshnessPreset(lang);
  const html = getTemplate('chat')(pageLocals(req, {
    activeRoute: 'chat',
    presets: loadPresets(lang),
    freshnessCatalog: freshness.catalog,
    freshnessProbedAt: freshness.probed_at,
    freshnessCatalogBlock: freshness.catalog_block,
    demoCountries: DEMO_COUNTRIES,
    allAlerts: alertsStore.getAlerts(),
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function aboutPage(req, res) {
  const html = getTemplate('about')(pageLocals(req, {
    activeRoute: 'about',
  }));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = {
  dashboardPage,
  chatPage,
  aboutPage,
  clearTemplateCache,
  pickLang,
  pickLangMode,
  langModeForRoute,
  readFilters,
  applyFilters,
};
