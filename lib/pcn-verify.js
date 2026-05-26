'use strict';

const fs = require('fs');
const path = require('path');
const { computeClaimId } = require('./pcn-claims');
const { CONTEXT_TIERS } = require('./data-loader');

const DATA_DIR = path.join(__dirname, '..', 'data', 'context');
const TIER_PRIORITY = { dynamic: 3, forecast: 2, annual: 1 };
const COUNTRIES = ['ARG', 'ECU', 'GTM', 'HND', 'MEX'];

const _cache = new Map();

function parseCsv(filePath) {
  if (_cache.has(filePath)) return _cache.get(filePath);
  if (!fs.existsSync(filePath)) { _cache.set(filePath, []); return []; }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  if (lines.length < 2) { _cache.set(filePath, []); return []; }
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(',');
    const row = {};
    headers.forEach((h, j) => { row[h] = vals[j] ? vals[j].trim() : ''; });
    rows.push(row);
  }
  _cache.set(filePath, rows);
  return rows;
}

// Build a lookup index for one country: "indicator|time_period" → row + meta.
function buildCountryIndex(country) {
  const key = `idx:${country}`;
  if (_cache.has(key)) return _cache.get(key);
  const index = new Map();
  for (const tier of CONTEXT_TIERS) {
    const fp = path.join(DATA_DIR, country, `${tier}.csv`);
    for (const row of parseCsv(fp)) {
      const unit = row.unit_measure || '';
      const fullKey = `${row.indicator}|${row.time_period}|${unit}`;
      index.set(fullKey, { ...row, country, tier });
      const legacyKey = `${row.indicator}|${row.time_period}`;
      const existing = index.get(legacyKey);
      const rowTierRank = TIER_PRIORITY[tier] || 0;
      const existingRank = existing ? (TIER_PRIORITY[existing.tier] || 0) : 0;
      if (!existing || rowTierRank >= existingRank) {
        index.set(legacyKey, { ...row, country, tier });
      }
    }
  }
  _cache.set(key, index);
  return index;
}

// Verify that a claim_id matches a stored observation in the local CSV snapshots.
// Uses 0.1% tolerance for floating-point comparisons.
//
// params:
//   claimId      - 8 or 16-char hex id (MCP passthrough or locally generated)
//   expectedValue - the numeric value asserted in the narrative (string or number)
//   indicator    - Data360 indicator IDNO (e.g. "WB_WDI_NY_GDP_PCAP_CD")
//   refArea      - ISO country code (ARG, ECU, GTM, HND, MEX)
//   timePeriod   - year or date string matching the CSV (e.g. "2022", "2000-01-01")
//
// meta may carry database_id and disaggregation fields from the detection candidate
// (local CSV rows only store indicator/time_period/value/unit_measure).
// returns { valid, observation, source, message }
function verifyClaim(claimId, expectedValue, indicator, refArea, timePeriod, meta = {}) {
  if (!COUNTRIES.includes(refArea)) {
    return { valid: false, observation: null, source: null, message: `Unknown country: ${refArea}` };
  }
  const index = buildCountryIndex(refArea);
  const unit = meta.unit_measure || '';
  let obs = unit ? index.get(`${indicator}|${timePeriod}|${unit}`) : null;
  if (!obs) obs = index.get(`${indicator}|${timePeriod}`);
  if (!obs) {
    return {
      valid: false, observation: null, source: null,
      message: `Observation not found in local CSVs: ${indicator} / ${refArea} / ${timePeriod}`,
    };
  }

  // Cross-check claim_id consistency when it was locally generated.
  // MCP-sourced ids (8 chars) are not validated here — they are trusted from the source.
  const expectedId = computeClaimId({
    database_id: meta.database_id || obs.database_id || '',
    indicator,
    country: refArea,
    time_period: timePeriod,
    unit_measure: meta.unit_measure || obs.unit_measure || '',
    comp_breakdown_1: meta.comp_breakdown_1 || obs.comp_breakdown_1 || '_Z',
    comp_breakdown_2: meta.comp_breakdown_2 || obs.comp_breakdown_2 || '_Z',
    comp_breakdown_3: meta.comp_breakdown_3 || obs.comp_breakdown_3 || '_Z',
    sex: meta.sex || obs.sex || '_T',
    age: meta.age || obs.age || '_T',
    urbanisation: meta.urbanisation || obs.urbanisation || '_T',
  });
  if (claimId.length === 16 && claimId !== expectedId) {
    return {
      valid: false,
      observation: null, source: null,
      message: `Claim ID mismatch: got ${claimId}, expected ${expectedId}`,
    };
  }

  const storedVal = parseFloat(obs.value);
  const claimedVal = parseFloat(String(expectedValue).replace(/[^0-9.-]/g, ''));
  if (isNaN(storedVal) || isNaN(claimedVal)) {
    return {
      valid: false,
      observation: obs,
      source: `data/context/${refArea}/${obs.tier}.csv`,
      message: `Cannot compare non-numeric values: stored=${obs.value}, claimed=${expectedValue}`,
    };
  }

  const delta = Math.abs(storedVal - claimedVal);
  const tolerance = Math.max(Math.abs(storedVal) * 0.001, 0.001);
  const valid = delta <= tolerance;

  return {
    valid,
    observation: { indicator: obs.indicator, refArea, timePeriod, value: obs.value, unit: obs.unit_measure },
    source: `data/context/${refArea}/${obs.tier}.csv`,
    message: valid
      ? `Verified: ${indicator} ${refArea} ${timePeriod} = ${obs.value} ${obs.unit_measure}`
      : `Value mismatch: claimed ${expectedValue}, stored ${obs.value} (delta ${delta.toFixed(4)})`,
  };
}

// Verify all claim tokens parsed from a narrative string.
// claimMap: Map of claimId → { indicator, refArea, timePeriod } built from the analysis context.
// Returns { total, valid, invalid, results[] }
function verifyNarrativeClaims(tokens, claimMap) {
  const results = [];
  for (const { claimId, value } of tokens) {
    const meta = claimMap.get(claimId);
    if (!meta) {
      results.push({ claimId, value, valid: false, message: 'No context entry for this claim_id' });
      continue;
    }
    const r = verifyClaim(claimId, value, meta.indicator, meta.refArea, meta.timePeriod, meta);
    results.push({ claimId, value, ...r });
  }
  const valid = results.filter((r) => r.valid).length;
  return { total: results.length, valid, invalid: results.length - valid, results };
}

function clearCache() { _cache.clear(); }

module.exports = { verifyClaim, verifyNarrativeClaims, clearCache };
