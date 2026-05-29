'use strict';

const { DEMO_COUNTRIES } = require('../url-slug');
const { buildClaimMapFromCandidates, buildClaimMapFromNoticias } = require('../pcn-annotate');

function normalizeCountry(value) {
  if (!value) return null;
  const s = String(value).trim().toUpperCase();
  return s || null;
}

function pickPrimaryCountry(candidates) {
  let best = null;
  let bestZ = -Infinity;
  for (const c of candidates || []) {
    const z = Math.abs(Number(c.detection_meta?.z_score ?? c.z_score ?? 0));
    if (z >= bestZ) {
      bestZ = z;
      best = normalizeCountry(c.alert?.country || c.country);
    }
  }
  return best;
}

function isValidDemoCountry(country) {
  return DEMO_COUNTRIES.includes(normalizeCountry(country));
}

function validateCountryField(item, opts = {}) {
  const failures = [];
  const country = normalizeCountry(item?.country);
  if (!country) {
    failures.push({ check: 'Q-country', notes: 'country is required' });
    return failures;
  }
  if (!isValidDemoCountry(country)) {
    failures.push({ check: 'Q-country', notes: `country ${country} not in demo LAC set` });
    return failures;
  }
  const expected = normalizeCountry(opts.expectedCountry);
  if (expected && country !== expected) {
    failures.push({ check: 'Q-country', notes: `country_mismatch: expected ${expected}, got ${country}` });
  }
  const claimMap = opts.candidates?.length
    ? buildClaimMapFromCandidates(opts.candidates, opts.idno)
    : buildClaimMapFromNoticias(opts.sourceNoticias || []);
  for (const token of item.claim_tokens || []) {
    const meta = claimMap.get(token.claim_id);
    if (meta && normalizeCountry(meta.refArea) !== country) {
      failures.push({
        check: 'Q-country',
        notes: `claim_id ${token.claim_id} belongs to ${meta.refArea}, not ${country}`,
      });
    }
  }
  return failures;
}

module.exports = {
  normalizeCountry,
  pickPrimaryCountry,
  isValidDemoCountry,
  validateCountryField,
};
