'use strict';

const fs = require('fs');
const path = require('path');
const { enrichAlert, sortAlertsByDataDate } = require('./alert-display');

const ROOT = path.resolve(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data/alerts.json');
const FIXTURE_PATH = path.join(ROOT, 'data/alerts.fixture.json');

let alerts = [];
let countries = [];
let categories = [];
const reloadCallbacks = [];

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const countriesList = Array.isArray(item.countries)
    ? item.countries
    : (item.country ? [item.country] : []);
  return {
    ...item,
    _type_label: item.content_type === 'reportaje' ? 'Reportaje' : 'Noticia',
    _countries: countriesList,
  };
}

function load() {
  const filepath = fs.existsSync(ALERTS_PATH) ? ALERTS_PATH : FIXTURE_PATH;
  if (!fs.existsSync(filepath)) {
    console.warn(new Date(), 'alerts-store: no alerts file found at', ALERTS_PATH, 'or', FIXTURE_PATH);
    alerts = [];
    countries = [];
    categories = [];
    return;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.alerts || []);
    alerts = sortAlertsByDataDate(list.map(enrichAlert).map(normalizeItem));
    const allCountries = alerts.flatMap((a) => (Array.isArray(a._countries) && a._countries.length ? a._countries : [a.country]));
    countries = uniqueSorted(allCountries);
    categories = uniqueSorted(alerts.map((a) => a.category));
    console.log(new Date(), `alerts-store: loaded ${alerts.length} alerts from ${path.basename(filepath)}`);
  } catch (err) {
    console.error(new Date(), 'alerts-store: failed to parse', filepath, err.message);
    alerts = [];
  }
}

function matchesType(item, typeFilter) {
  if (!typeFilter) return true;
  return item.type === typeFilter || item.content_type === typeFilter;
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort();
}

function reload() {
  load();
  for (const cb of reloadCallbacks) {
    try { cb(); } catch (e) { console.error(new Date(), 'alerts-store reload callback failed:', e); }
  }
}

function onReload(cb) {
  reloadCallbacks.push(cb);
}

function getAlerts() { return alerts; }
function getCountries() { return countries; }
function getCategories() { return categories; }

function getAlertsForIndicator(idno, opts = {}) {
  if (!idno) return [];
  let list = alerts.filter((a) => a.indicator?.idno === idno);
  if (opts.country) {
    list = list.filter((a) => {
      if (a.country === opts.country) return true;
      if (Array.isArray(a._countries) && a._countries.includes(opts.country)) return true;
      if (Array.isArray(a.countries) && a.countries.includes(opts.country)) return true;
      return false;
    });
  }
  return list;
}

load();

module.exports = {
  getAlerts,
  getCountries,
  getCategories,
  getAlertsForIndicator,
  reload,
  onReload,
  normalizeItem,
  matchesType,
};
