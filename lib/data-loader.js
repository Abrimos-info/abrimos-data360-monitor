'use strict';

const fs = require('fs');
const path = require('path');
const Decimal = require('decimal.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTEXT_DIR = path.join(REPO_ROOT, 'data', 'context');
const INDICATORS_DIR = path.join(REPO_ROOT, 'data', 'indicators');

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

function loadCountryNews(country) {
  const newsRoot = path.join(REPO_ROOT, 'data', 'news', country);
  if (!fs.existsSync(newsRoot)) return null;
  const entries = fs.readdirSync(newsRoot)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .slice(-10);
  if (entries.length === 0) return null;
  return entries.map((f) => fs.readFileSync(path.join(newsRoot, f), 'utf8')).join('\n\n---\n\n');
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

function pickLatestPerKey(rows) {
  // Group by (indicator, time_period) and keep the row with the largest absolute value,
  // a defensive collapse for indicators that come with multiple disaggregations in the CSV.
  const map = new Map();
  for (const row of rows) {
    const key = `${row.indicator}@${row.time_period}`;
    const existing = map.get(key);
    if (!existing) { map.set(key, row); continue; }
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

module.exports = {
  COUNTRIES,
  CONTEXT_DIR,
  INDICATORS_DIR,
  loadCsv,
  loadCountryTier,
  loadIndicatorMetadata,
  loadCountryBackground,
  loadCountryNews,
  groupSeriesByCountry,
  pickLatestPerKey,
};
