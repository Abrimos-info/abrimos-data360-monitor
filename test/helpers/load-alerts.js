'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ALERTS_PATH = path.join(ROOT, 'data', 'alerts.json');

function loadAlertsFromDashboard() {
  if (!fs.existsSync(ALERTS_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(ALERTS_PATH, 'utf8'));
  return Array.isArray(raw) ? raw : (raw.alerts || []);
}

function loadAlertsFromPerIndicatorFiles() {
  const dir = path.join(ROOT, 'data', 'alerts');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    const list = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    if (Array.isArray(list)) out.push(...list);
  }
  return out;
}

module.exports = {
  loadAlertsFromDashboard,
  loadAlertsFromPerIndicatorFiles,
  ALERTS_PATH,
};
