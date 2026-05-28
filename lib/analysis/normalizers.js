'use strict';

function isBilingualField(field) {
  return field
    && typeof field === 'object'
    && typeof field.es === 'string'
    && typeof field.en === 'string';
}

function ensureBilingual(field, fallback = '') {
  if (!field || typeof field !== 'object') {
    const text = fallback || 'n/a';
    return { es: text, en: text };
  }
  const es = (field.es || '').trim() || (field.en || '').trim() || fallback || 'n/a';
  const en = (field.en || '').trim() || es;
  return { es, en };
}

module.exports = {
  isBilingualField,
  ensureBilingual,
};
