'use strict';

const fs = require('fs');
const path = require('path');
const { computeClaimId, claimInputFromObservation } = require('./pcn-claims');
const { databaseIdFor } = require('./analysis/candidate-builder');
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

function rowClaimInput(row, country) {
  return claimInputFromObservation(row, {
    database_id: databaseIdFor(row.indicator),
    indicator: row.indicator,
    country,
  });
}

function enrichRow(row, country, tier) {
  const databaseId = databaseIdFor(row.indicator);
  return { ...row, country, tier, database_id: databaseId };
}

// Build a lookup index for one country: legacy keys + cid:{claim_id} → row.
function buildCountryIndex(country) {
  const key = `idx:${country}`;
  if (_cache.has(key)) return _cache.get(key);
  const index = new Map();
  for (const tier of CONTEXT_TIERS) {
    const fp = path.join(DATA_DIR, country, `${tier}.csv`);
    for (const row of parseCsv(fp)) {
      const enriched = enrichRow(row, country, tier);
      const unit = row.unit_measure || '';
      const fullKey = `${row.indicator}|${row.time_period}|${unit}`;
      index.set(fullKey, enriched);
      const legacyKey = `${row.indicator}|${row.time_period}`;
      const existing = index.get(legacyKey);
      const rowTierRank = TIER_PRIORITY[tier] || 0;
      const existingRank = existing ? (TIER_PRIORITY[existing.tier] || 0) : 0;
      if (!existing || rowTierRank >= existingRank) {
        index.set(legacyKey, enriched);
      }
      const claimId = computeClaimId(rowClaimInput(row, country));
      index.set(`cid:${claimId}`, enriched);
    }
  }
  _cache.set(key, index);
  return index;
}

function metaForVerify(meta = {}, obs = {}) {
  return {
    database_id: meta.database_id || obs.database_id || databaseIdFor(obs.indicator),
    unit_measure: meta.unit_measure || obs.unit_measure || '',
    comp_breakdown_1: meta.comp_breakdown_1 || obs.comp_breakdown_1 || '_Z',
    comp_breakdown_2: meta.comp_breakdown_2 || obs.comp_breakdown_2 || '_Z',
    comp_breakdown_3: meta.comp_breakdown_3 || obs.comp_breakdown_3 || '_Z',
    sex: meta.sex || obs.sex || '_T',
    age: meta.age || obs.age || '_T',
    urbanisation: meta.urbanisation || obs.urbanisation || '_T',
  };
}

// Verify that a claim_id matches a stored observation in the local CSV snapshots.
// Uses 0.1% tolerance for floating-point comparisons.
function verifyClaim(claimId, expectedValue, indicator, refArea, timePeriod, meta = {}) {
  if (!COUNTRIES.includes(refArea)) {
    return { valid: false, observation: null, source: null, message: `Unknown country: ${refArea}` };
  }
  const index = buildCountryIndex(refArea);
  let obs = claimId.length === 16 ? index.get(`cid:${claimId}`) : null;
  const unit = meta.unit_measure || '';
  if (!obs && unit) obs = index.get(`${indicator}|${timePeriod}|${unit}`);
  if (!obs) obs = index.get(`${indicator}|${timePeriod}`);
  if (!obs) {
    return {
      valid: false, observation: null, source: null,
      message: `Observation not found in local CSVs: ${indicator} / ${refArea} / ${timePeriod}`,
    };
  }

  const merged = metaForVerify(meta, obs);

  // Cross-check claim_id consistency when it was locally generated.
  const expectedId = computeClaimId(claimInputFromObservation(obs, {
    database_id: merged.database_id,
    indicator,
    country: refArea,
  }));
  if (claimId.length === 16 && claimId !== expectedId) {
    return {
      valid: false, observation: null, source: null,
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

module.exports = { verifyClaim, verifyNarrativeClaims, clearCache, rowClaimInput };
