'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data/alerts.json');
const FIXTURE_PATH = path.join(ROOT, 'data/alerts.fixture.json');

let alerts = [];
let countries = [];
let categories = [];
const reloadCallbacks = [];

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
    alerts = Array.isArray(raw) ? raw : (raw.alerts || []);
    countries = uniqueSorted(alerts.map((a) => a.country));
    categories = uniqueSorted(alerts.map((a) => a.category));
    console.log(new Date(), `alerts-store: loaded ${alerts.length} alerts from ${path.basename(filepath)}`);
  } catch (err) {
    console.error(new Date(), 'alerts-store: failed to parse', filepath, err.message);
    alerts = [];
  }
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

load();

module.exports = {
  getAlerts,
  getCountries,
  getCategories,
  reload,
  onReload,
};
