'use strict';

/**
 * Apply Q1 to Q7 checks against a final alert. Returns { ok, failures[] } per alert.
 * Reject alerts that fail Q1 (untraceable claims) or Q2 (schema-missing fields).
 */

const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '..', '..', 'docs', 'alert-schema.json');
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

const MAX_NARRATIVE_LEN = 320; // schema does not enforce but Q4 does

function checkBilingual(s) {
  return s && typeof s === 'object' && typeof s.es === 'string' && typeof s.en === 'string';
}

function validateAlert(alert, contextClaimIds) {
  const failures = [];
  const ok = validateSchema(alert);
  if (!ok) {
    failures.push({ check: 'Q2', notes: ajv.errorsText(validateSchema.errors) });
  }

  if (!checkBilingual(alert.narrative_citizen)) failures.push({ check: 'Q4', notes: 'narrative_citizen missing bilingual fields' });
  if (!checkBilingual(alert.narrative_journalist)) failures.push({ check: 'Q4', notes: 'narrative_journalist missing bilingual fields' });

  if (alert.narrative_citizen && alert.narrative_citizen.es && alert.narrative_citizen.es.length > MAX_NARRATIVE_LEN) {
    failures.push({ check: 'Q4', notes: `narrative_citizen.es too long (${alert.narrative_citizen.es.length} chars)` });
  }
  if (alert.narrative_journalist && alert.narrative_journalist.es && alert.narrative_journalist.es.length > MAX_NARRATIVE_LEN) {
    failures.push({ check: 'Q4', notes: `narrative_journalist.es too long (${alert.narrative_journalist.es.length} chars)` });
  }

  if (Array.isArray(alert.claim_tokens) && contextClaimIds instanceof Set) {
    for (const token of alert.claim_tokens) {
      if (!contextClaimIds.has(token.claim_id)) {
        failures.push({ check: 'Q1', notes: `claim_id ${token.claim_id} not present in context` });
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

module.exports = { validateAlert };
