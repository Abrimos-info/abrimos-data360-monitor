'use strict';

const fs = require('fs');
const path = require('path');
const { enrichAlert, sortAlertsByDataDate } = require('./alert-display');
const { assignUniquePaths, pathForCountry } = require('./url-slug');

const ROOT = path.resolve(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data/alerts.json');
const FIXTURE_PATH = path.join(ROOT, 'data/alerts.fixture.json');

let alerts = [];
let countries = [];
let categories = [];
let byId = new Map();
let byPath = new Map();
const reloadCallbacks = [];

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  let country = item.country;
  if (!country && Array.isArray(item.countries) && item.countries.length) {
    country = item.countries[0];
  }
  const normalized = {
    ...item,
    _type_label: item.content_type === 'reportaje' ? 'Reportaje' : 'Noticia',
  };
  if (country) normalized.country = String(country).toUpperCase();
  delete normalized.countries;
  delete normalized._countries;
  return normalized;
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
    alerts = assignUniquePaths(sortAlertsByDataDate(list.map(enrichAlert).map(normalizeItem)));
    byId = new Map(alerts.map((a) => [a.id, a]));
    byPath = new Map();
    for (const a of alerts) {
      if (a._path) byPath.set(a._path, a);
      if (a._paths && typeof a._paths === 'object') {
        for (const p of Object.values(a._paths)) {
          if (p) byPath.set(p, a);
        }
      }
    }
    const allCountries = alerts.map((a) => a.country).filter(Boolean);
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
    list = list.filter((a) => a.country === opts.country);
  }
  return list;
}

function getAlertById(id) {
  return byId.get(id) || null;
}

function getAlertByPath(pathStr) {
  const key = pathStr.startsWith('/') ? pathStr : `/${pathStr}`;
  return byPath.get(key) || null;
}

function findPcnDemoAlert() {
  const list = alerts.filter((a) => Array.isArray(a.claim_tokens) && a.claim_tokens.length && a.story);
  const pick = list.find((a) => !a.claim_tokens.some((t) => t.pcn_status === 'rejected')) || list[0];
  if (!pick) return null;
  const iso = pick.country;
  const alertPath = pathForCountry(pick, iso) || pick._path;
  if (!alertPath) return null;
  return { alert: pick, path: alertPath, iso };
}

function getAlertsForCountry(iso, opts = {}) {
  let list = alerts.filter((a) => a.country === iso);
  if (opts.content_type) {
    list = list.filter((a) => (a.content_type || 'noticia') === opts.content_type);
  }
  return list;
}

load();

module.exports = {
  getAlerts,
  getCountries,
  getCategories,
  getAlertsForIndicator,
  getAlertById,
  getAlertByPath,
  findPcnDemoAlert,
  getAlertsForCountry,
  reload,
  onReload,
  normalizeItem,
  matchesType,
};
