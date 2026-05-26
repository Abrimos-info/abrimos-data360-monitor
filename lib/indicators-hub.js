'use strict';

const fs = require('fs');
const path = require('path');
const { getWatchlist } = require('./watchlist');
const alertsStore = require('./alerts-store');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'data/index.json');
const DEFAULT_DYNAMIC_PATH = path.join(ROOT, 'data/dynamic-watchlist.json');

function resolveDynamicWatchlistPath() {
  const envPath = process.env.D360_DYNAMIC_WATCHLIST_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const envDataDir = process.env.D360_DATA_DIR;
  if (envDataDir) {
    const p = path.join(envDataDir, 'dynamic-watchlist.json');
    if (fs.existsSync(p)) return p;
  }

  const scriptsPath = '/opt/scripts/abrimos-data360-monitor/data/dynamic-watchlist.json';
  if (fs.existsSync(scriptsPath)) return scriptsPath;

  return DEFAULT_DYNAMIC_PATH;
}

function readJson(filepath) {
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function loadIndex() {
  return readJson(INDEX_PATH) || { indicators: [] };
}

function loadDynamicWatchlist() {
  const raw = readJson(resolveDynamicWatchlistPath());
  if (!raw) return [];
  return Array.isArray(raw) ? raw : (raw.indicators || raw.watchlist || []);
}

function recentUpdatedIndicators(limit = 12) {
  const index = loadIndex();
  return [...(index.indicators || [])]
    .sort((a, b) => new Date(b.last_modified || 0) - new Date(a.last_modified || 0))
    .slice(0, limit);
}

function watchlistByTier() {
  const tiers = { pulse: [], annual: [], forecast: [], dynamic: [] };
  for (const entry of getWatchlist()) {
    const tier = entry.tier || 'annual';
    if (tiers[tier]) tiers[tier].push(entry);
  }
  for (const entry of loadDynamicWatchlist()) {
    tiers.dynamic.push({
      idno: entry.idno,
      database_id: entry.database_id,
      label: entry.label || entry.idno,
      tier: 'dynamic',
    });
  }
  const seen = new Set();
  for (const tier of Object.keys(tiers)) {
    tiers[tier] = tiers[tier].filter((e) => {
      if (!e.idno || seen.has(e.idno)) return false;
      seen.add(e.idno);
      return true;
    });
  }
  return tiers;
}

function findCatalogEntry(idno) {
  const key = String(idno || '').toUpperCase();
  const fromWatchlist = getWatchlist().find((e) => e.idno === idno);
  if (fromWatchlist) return fromWatchlist;
  const fromDynamic = loadDynamicWatchlist().find((e) => e.idno === idno);
  if (fromDynamic) return fromDynamic;
  const fromIndex = (loadIndex().indicators || []).find((e) => e.idno === idno);
  if (fromIndex) return fromIndex;
  return { idno: key, label: key, database_id: key.split('_')[0] };
}

function indicatorKnown(idno) {
  if (!idno) return false;
  if (getWatchlist().some((e) => e.idno === idno)) return true;
  if (loadDynamicWatchlist().some((e) => e.idno === idno)) return true;
  if ((loadIndex().indicators || []).some((e) => e.idno === idno)) return true;
  if (alertsStore.getAlertsForIndicator(idno).length) return true;
  return false;
}

function indicatorPageData(idno) {
  const catalog = findCatalogEntry(idno);
  const alerts = alertsStore.getAlertsForIndicator(idno);
  const byCountry = {};
  for (const alert of alerts) {
    const countries = [
      alert.country,
      ...(Array.isArray(alert.countries) ? alert.countries : []),
      ...(Array.isArray(alert._countries) ? alert._countries : []),
    ].filter(Boolean);
    for (const iso of [...new Set(countries)]) {
      if (!byCountry[iso]) byCountry[iso] = [];
      byCountry[iso].push(alert);
    }
  }
  return { catalog, alerts, byCountry };
}

function countryTickerIndicators(iso, limit = 10) {
  return alertsStore.getAlertsForCountry(iso)
    .filter((a) => (a.content_type || 'noticia') !== 'reportaje')
    .slice(0, limit);
}

/** @returns {Map<string, { noticias: number, reportajes: number }>} */
function buildIndicatorAlertCounts() {
  const counts = new Map();
  const bump = (idno, field) => {
    const key = String(idno || '').trim().toUpperCase();
    if (!key) return;
    if (!counts.has(key)) counts.set(key, { noticias: 0, reportajes: 0 });
    counts.get(key)[field] += 1;
  };
  for (const alert of alertsStore.getAlerts()) {
    if ((alert.content_type || 'noticia') === 'reportaje') {
      for (const idno of alert.indicators || []) bump(idno, 'reportajes');
    } else {
      bump(alert.indicator?.idno, 'noticias');
    }
  }
  return counts;
}

function attachAlertCounts(entries, countsMap) {
  const counts = countsMap || buildIndicatorAlertCounts();
  return (entries || []).map((entry) => {
    const key = String(entry.idno || '').trim().toUpperCase();
    const tallies = counts.get(key) || { noticias: 0, reportajes: 0 };
    return { ...entry, alert_counts: { ...tallies } };
  });
}

const HUB_TIER_ORDER = ['dynamic', 'pulse', 'annual', 'forecast'];

function sortHubTierEntries(entries, tier) {
  const list = [...(entries || [])];
  if (tier !== 'dynamic') return list;
  const score = (e) => (e.alert_counts?.noticias || 0) + (e.alert_counts?.reportajes || 0);
  return list.sort((a, b) => score(b) - score(a) || String(a.idno || '').localeCompare(String(b.idno || '')));
}

module.exports = {
  loadIndex,
  loadDynamicWatchlist,
  recentUpdatedIndicators,
  watchlistByTier,
  findCatalogEntry,
  indicatorKnown,
  indicatorPageData,
  countryTickerIndicators,
  buildIndicatorAlertCounts,
  attachAlertCounts,
  sortHubTierEntries,
  HUB_TIER_ORDER,
};
