'use strict';

const fs = require('fs');
const path = require('path');
const { latestDetectedAt } = require('./alert-display');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'data', 'index.json');

function readIndexGeneratedAt() {
  if (!fs.existsSync(INDEX_PATH)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    return raw.generated_at || raw.since || null;
  } catch (_) {
    return null;
  }
}

function getDataAgeIso(alerts = []) {
  const fromIndex = readIndexGeneratedAt();
  const fromAlerts = latestDetectedAt(alerts);
  const candidates = [fromIndex, fromAlerts].filter(Boolean).map((iso) => Date.parse(iso));
  if (!candidates.length) return null;
  return new Date(Math.max(...candidates)).toISOString();
}

function getDataAgeSeconds(alerts = []) {
  const iso = getDataAgeIso(alerts);
  if (!iso) return null;
  const ageMs = Date.now() - Date.parse(iso);
  return Math.max(0, Math.floor(ageMs / 1000));
}

module.exports = {
  getDataAgeIso,
  getDataAgeSeconds,
  readIndexGeneratedAt,
};
