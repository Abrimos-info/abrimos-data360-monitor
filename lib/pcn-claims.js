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

module.exports = { computeClaimId, buildClaimToken };
