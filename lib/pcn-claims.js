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

function computeClaimId(observation) {
  const canonical = {
    database_id: observation.database_id || '',
    indicator: observation.indicator || observation.idno || '',
    ref_area: observation.country || observation.ref_area || '',
    time_period: observation.time_period || '',
    comp_breakdown_1: observation.comp_breakdown_1 || '_Z',
    comp_breakdown_2: observation.comp_breakdown_2 || '_Z',
    comp_breakdown_3: observation.comp_breakdown_3 || '_Z',
    unit_measure: observation.unit_measure || observation.unit || '',
    sex: observation.sex || '_T',
    age: observation.age || '_T',
    urbanisation: observation.urbanisation || '_T',
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

module.exports = { computeClaimId, buildClaimToken, formatClaimToken, parseClaimTokens, claimIdFromMcpPoint };
