'use strict';

/**
 * Proof-Carrying Numbers claim primitives.
 *
 * Until the dedicated PCN integration ships, this module provides:
 *   computeClaimId(observation)   stable claim id used by detection and the LLM
 *   buildClaimToken(obs, opts)    a claim-token object that matches the alert schema
 *
 * The id format mirrors what worldbank/data360-mcp returns from get_data so the two
 * paths interoperate.
 */

const crypto = require('crypto');

const DISAGG_DEFAULTS = {
  comp_breakdown_1: '_Z',
  comp_breakdown_2: '_Z',
  comp_breakdown_3: '_Z',
  sex: '_T',
  age: '_T',
  urbanisation: '_T',
};

/** Normalized tuple for computeClaimId — never use display unit (%) as unit_measure. */
function claimInputFromObservation(observation, opts = {}) {
  const obs = observation || {};
  return {
    database_id: opts.database_id || obs.database_id || '',
    indicator: opts.indicator || obs.indicator || opts.idno || '',
    country: opts.country || obs.country || obs.ref_area || '',
    time_period: obs.time_period || '',
    unit_measure: obs.unit_measure || '',
    comp_breakdown_1: obs.comp_breakdown_1 || DISAGG_DEFAULTS.comp_breakdown_1,
    comp_breakdown_2: obs.comp_breakdown_2 || DISAGG_DEFAULTS.comp_breakdown_2,
    comp_breakdown_3: obs.comp_breakdown_3 || DISAGG_DEFAULTS.comp_breakdown_3,
    sex: obs.sex || DISAGG_DEFAULTS.sex,
    age: obs.age || DISAGG_DEFAULTS.age,
    urbanisation: obs.urbanisation || DISAGG_DEFAULTS.urbanisation,
  };
}

function computeClaimId(observation) {
  const input = claimInputFromObservation(observation, {
    database_id: observation.database_id,
    indicator: observation.indicator || observation.idno,
    country: observation.country || observation.ref_area,
  });
  if (!input.unit_measure && observation.unit) {
    input.unit_measure = observation.unit;
  }
  const canonical = {
    database_id: input.database_id,
    indicator: input.indicator,
    ref_area: input.country,
    time_period: input.time_period,
    comp_breakdown_1: input.comp_breakdown_1,
    comp_breakdown_2: input.comp_breakdown_2,
    comp_breakdown_3: input.comp_breakdown_3,
    unit_measure: input.unit_measure,
    sex: input.sex,
    age: input.age,
    urbanisation: input.urbanisation,
  };
  const json = JSON.stringify(canonical, Object.keys(canonical).sort());
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);
}

function buildClaimToken(observation, { displayEs, displayEn } = {}) {
  const claimId = computeClaimId(observation);
  return {
    claim_id: claimId,
    value: Number(observation.value),
    display_es: displayEs,
    display_en: displayEn,
  };
}

// Format a PCN claim token as used in LLM narrative output.
// Pattern: {{claim:CLAIM_ID|value}}
function formatClaimToken(claimId, value) {
  return `{{claim:${claimId}|${value}}}`;
}

// Parse all claim tokens from a narrative string.
// Returns array of { claimId, value, raw }.
function parseClaimTokens(text) {
  const re = /\{\{claim:([0-9a-f]+)\|([^}]+)\}\}/g;
  const results = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    results.push({ claimId: m[1], value: m[2], raw: m[0] });
  }
  return results;
}

// Extract claim_id from a Data360 MCP data point (passthrough when available).
// The MCP returns 8-char hex ids computed server-side; our computeClaimId produces
// 16-char ids. When both are present they are different formats — use MCP ids for
// PCN UI components and our ids for internal pipeline traceability.
function claimIdFromMcpPoint(point, indicator) {
  if (point.claim_id) return point.claim_id;
  return computeClaimId({
    indicator: indicator || '',
    country: point.REF_AREA || point.ref_area || '',
    time_period: point.TIME_PERIOD || point.time_period || '',
    unit_measure: point.UNIT_MEASURE || point.unit_measure || '',
  });
}

module.exports = {
  DISAGG_DEFAULTS,
  claimInputFromObservation,
  computeClaimId,
  buildClaimToken,
  formatClaimToken,
  parseClaimTokens,
  claimIdFromMcpPoint,
};
