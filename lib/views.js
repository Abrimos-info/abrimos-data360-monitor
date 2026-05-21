'use strict';

const fs = require('fs');
const path = require('path');
const pug = require('pug');

const i18n = require('./i18n');
const alertsStore = require('./alerts-store');

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
  const accept = (req.headers['accept-language'] || '').toLowerCase();
  if (accept.startsWith('en')) return 'en';
  return 'es';
}

function pickLangMode(req) {
  const m = req.parsedUrl.searchParams.get('langMode');
  if (m === 'es' || m === 'en' || m === 'both') return m;
  return 'both';
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

async function dashboardPage(req, res) {
  const lang = pickLang(req);
  const langMode = pickLangMode(req);
  const filters = readFilters(req);
  const allAlerts = alertsStore.getAlerts();
  const visibleAlerts = applyFilters(allAlerts, filters);

  const html = getTemplate('dashboard')({
    lang,
    langMode,
    filters,
    allAlerts,
    visibleAlerts,
    selectedAlertId: filters.alert,
    stringsEs: i18n.getAll('es'),
    stringsEn: i18n.getAll('en'),
    _: i18n.getString,
    countries: alertsStore.getCountries(),
    categories: alertsStore.getCategories(),
  });

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function aboutPage(req, res) {
  const lang = pickLang(req);
  const html = getTemplate('about')({
    lang,
    _: i18n.getString,
  });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = {
  dashboardPage,
  aboutPage,
  clearTemplateCache,
};
