'use strict';

const fs = require('fs');
const path = require('path');
const Decimal = require('decimal.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTEXT_DIR = path.join(REPO_ROOT, 'data', 'context');
const INDICATORS_DIR = path.join(REPO_ROOT, 'data', 'indicators');
const SNAPSHOTS_DIR = path.join(REPO_ROOT, 'data', 'snapshots');
const DYNAMIC_WATCHLIST_PATH = path.join(REPO_ROOT, 'data', 'dynamic-watchlist.json');

const NOTICIA_TIERS = ['dynamic'];

/** Context CSV tiers used for detection (all-tiers mode), PCN, and LLM — excludes legacy pulse. */
const CONTEXT_TIERS = ['annual', 'forecast', 'dynamic'];

const COUNTRIES = ['GTM', 'HND', 'ARG', 'ECU', 'MEX'];

function parseCsvRow(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; }
      else if (ch === '"') { quoted = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function loadCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return [];
  const lines = raw.split('\n');
  const headers = parseCsvRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvRow(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx]; });
    rows.push(row);
  }
  return rows;
}

function loadCountryTier(country, tier) {
  const file = path.join(CONTEXT_DIR, country, `${tier}.csv`);
  return loadCsv(file);
}

let _dynamicIdnoCache = null;

function loadDynamicWatchlist() {
  if (!fs.existsSync(DYNAMIC_WATCHLIST_PATH)) return [];
  try {
    const watchlist = JSON.parse(fs.readFileSync(DYNAMIC_WATCHLIST_PATH, 'utf8'));
    return Array.isArray(watchlist) ? watchlist : [];
  } catch (_) {
    return [];
  }
}

/** Unique indicator idnos eligible for Noticia generation (dynamic watchlist only). */
function loadDynamicIndicatorIdnos() {
  if (_dynamicIdnoCache) return _dynamicIdnoCache;
  const idnos = new Set();
  for (const entry of loadDynamicWatchlist()) {
    if (entry?.idno) idnos.add(entry.idno);
  }
  // Fallback when discover has not run yet (tests, dry runs): infer from dynamic.csv.
  if (idnos.size === 0) {
    for (const country of COUNTRIES) {
      for (const row of loadCountryTier(country, 'dynamic')) {
        if (row.indicator) idnos.add(row.indicator);
      }
    }
  }
  _dynamicIdnoCache = idnos;
  return idnos;
}

function isDynamicIndicator(idno) {
  return loadDynamicIndicatorIdnos().has(idno);
}

function clearDynamicIndicatorCache() {
  _dynamicIdnoCache = null;
}

function loadIndicatorMetadata(idno) {
  const file = path.join(INDICATORS_DIR, `${idno}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function loadCountryBackground(country) {
  const file = path.join(CONTEXT_DIR, country, 'background.md');
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function loadCountryNews(country, opts) {
  const { loadCountryHeadlines, formatHeadlineLines } = require('./news');
  const headlines = loadCountryHeadlines(country, opts);
  if (headlines.length === 0) return null;
  return headlines.flatMap(formatHeadlineLines).join('\n');
}

function groupSeriesByCountry(tier) {
  const series = {};
  for (const country of COUNTRIES) {
    const rows = loadCountryTier(country, tier);
    series[country] = {};
    for (const row of rows) {
      const idno = row.indicator;
      if (!series[country][idno]) series[country][idno] = [];
      series[country][idno].push({
        time_period: row.time_period,
        value: row.value,
        unit_measure: row.unit_measure,
      });
    }
  }
  return series;
}

function preferredUnitForIndicator(idno) {
  if (String(idno || '').startsWith('RWB_PFI_')) return 'RANK';
  return null;
}

/** Collapse duplicate period rows; prefer RANK over SCORE for press-freedom indicators. */
function collapseObservationsByPeriod(observations, idno) {
  const preferred = preferredUnitForIndicator(idno);
  const byPeriod = new Map();
  for (const o of observations) {
    const period = o.time_period;
    const unit = o.unit_measure || '';
    const existing = byPeriod.get(period);
    if (!existing) {
      byPeriod.set(period, o);
      continue;
    }
    if (preferred) {
      const existingPreferred = (existing.unit_measure || '') === preferred;
      const incomingPreferred = unit === preferred;
      if (incomingPreferred && !existingPreferred) byPeriod.set(period, o);
      continue;
    }
    try {
      const a = new Decimal(existing.value);
      const b = new Decimal(o.value);
      if (b.abs().greaterThan(a.abs())) byPeriod.set(period, o);
    } catch (_) {
      byPeriod.set(period, o);
    }
  }
  return Array.from(byPeriod.values()).sort((a, b) => a.time_period.localeCompare(b.time_period));
}

function pickLatestPerKey(rows) {
  // Group by (indicator, time_period) and keep the preferred unit or largest absolute value.
  const map = new Map();
  for (const row of rows) {
    const key = `${row.indicator}@${row.time_period}`;
    const existing = map.get(key);
    if (!existing) { map.set(key, row); continue; }
    const preferred = preferredUnitForIndicator(row.indicator);
    if (preferred) {
      const existingPreferred = (existing.unit_measure || '') === preferred;
      const incomingPreferred = (row.unit_measure || '') === preferred;
      if (incomingPreferred && !existingPreferred) map.set(key, row);
      continue;
    }
    try {
      const a = new Decimal(existing.value);
      const b = new Decimal(row.value);
      if (b.abs().greaterThan(a.abs())) map.set(key, row);
    } catch (_) {
      map.set(key, row);
    }
  }
  return Array.from(map.values());
}

function loadDataDict(idno) {
  const p = path.join(SNAPSHOTS_DIR, `${idno}_DATADICT.csv`);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function loadIndicatorMetadataJson(idno) {
  const p = path.join(SNAPSHOTS_DIR, `${idno}.meta.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

module.exports = {
  COUNTRIES,
  CONTEXT_DIR,
  INDICATORS_DIR,
  SNAPSHOTS_DIR,
  DYNAMIC_WATCHLIST_PATH,
  NOTICIA_TIERS,
  CONTEXT_TIERS,
  loadDynamicWatchlist,
  loadCsv,
  loadCountryTier,
  loadDynamicIndicatorIdnos,
  isDynamicIndicator,
  clearDynamicIndicatorCache,
  loadIndicatorMetadata,
  loadCountryBackground,
  loadCountryNews,
  loadDataDict,
  loadIndicatorMetadataJson,
  groupSeriesByCountry,
  preferredUnitForIndicator,
  collapseObservationsByPeriod,
  pickLatestPerKey,
};
