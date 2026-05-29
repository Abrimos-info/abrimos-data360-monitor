// lib/analysis/quality-validator.js
'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '..', '..', 'docs', 'alert-schema.json');
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

function compileDefinition(name) {
  return ajv.compile({
    ...schema.definitions[name],
    definitions: schema.definitions,
  });
}

const validateNoticiaSchema = compileDefinition('noticia');
const validateReportajeSchema = compileDefinition('reportaje');

function schemaErrors(item) {
  if (item?.content_type === 'noticia') {
    return validateNoticiaSchema(item) ? null : validateNoticiaSchema.errors;
  }
  if (item?.content_type === 'reportaje') {
    return validateReportajeSchema(item) ? null : validateReportajeSchema.errors;
  }
  return validateSchema(item) ? null : validateSchema.errors;
}

const STORY_MIN_LEN = 200;

const { validateCountryField } = require('./country-utils');

const { isBilingualField: checkBilingual } = require('./normalizers');

function validateItem(item, contextClaimIds, opts = {}) {
  const failures = [];
  const errors = schemaErrors(item);
  if (errors) {
    failures.push({ check: 'Q2', notes: ajv.errorsText(errors) });
  }

  for (const failure of validateCountryField(item, opts)) {
    failures.push(failure);
  }

  // Q4: bilingual fields present and non-empty
  for (const field of ['title', 'lead', 'story']) {
    if (!checkBilingual(item[field])) {
      failures.push({ check: 'Q4', notes: `${field} missing bilingual es/en fields` });
    }
  }

  // Q4: story length sanity (minimum only; no max char cap for reportajes)
  if (item.story?.es && item.story.es.length < STORY_MIN_LEN) {
    failures.push({ check: 'Q4', notes: `story.es too short (${item.story.es.length} chars, min ${STORY_MIN_LEN})` });
  }

  if (opts.strictQ1 && Array.isArray(item.claim_tokens) && contextClaimIds instanceof Set) {
    for (const token of item.claim_tokens) {
      if (!contextClaimIds.has(token.claim_id)) {
        failures.push({ check: 'Q1', notes: `claim_id ${token.claim_id} not in context` });
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

function validateAgainstSchema(item) {
  const ok = validateSchema(item);
  return { ok, errors: ok ? [] : (validateSchema.errors || []) };
}

// Keep old export name for backward compat with runner.js
module.exports = { validateAlert: validateItem, validateItem, validateAgainstSchema, validateSchema };
