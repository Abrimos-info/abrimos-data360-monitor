'use strict';

/** @typedef {{ claim_id?: string, value?: unknown, display_es?: string, display_en?: string, pcn_status?: string }} ClaimToken */

const CLAIM_MARKER_RE = /\{\{claim:([^}|]+)\|([^}]*)\}\}/g;

function normalizeClaimMarkerText(text) {
  if (!text || typeof text !== 'string' || !text.includes('{{claim:')) return text;
  return text.replace(/\{\{claim:([\s\S]*?)\}\}/g, (full, inner) => {
    const pipe = inner.indexOf('|');
    if (pipe === -1) return full;
    const id = inner.slice(0, pipe).replace(/\s+/g, '');
    const val = inner.slice(pipe + 1).replace(/\s+/g, '');
    return `{{claim:${id}|${val}}}`;
  });
}

function coerceClaimValue(raw) {
  if (raw == null) return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const trimmed = String(raw).trim().replace(/%/g, '').trim();
  if (!trimmed) return null;
  if (/^-?\d{1,3}(\.\d{3})*,\d+$/.test(trimmed) || /^-?\d+,\d+$/.test(trimmed)) {
    const es = Number(trimmed.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(es)) return es;
  }
  const en = Number(trimmed.replace(/,/g, ''));
  if (Number.isFinite(en)) return en;
  const esFallback = Number(trimmed.replace(/\./g, '').replace(',', '.'));
  if (Number.isFinite(esFallback)) return esFallback;
  return null;
}

function claimValuesMatch(a, b) {
  const na = coerceClaimValue(a);
  const nb = coerceClaimValue(b);
  if (na != null && nb != null) {
    return Math.abs(na - nb) <= Math.max(0.001, Math.abs(na) * 1e-6);
  }
  return String(a ?? '').trim() === String(b ?? '').trim();
}

/**
 * Match a narrative marker to the best claim_token (supports duplicate claim_ids).
 * @param {ClaimToken[]} tokens
 * @param {string} claimId
 * @param {string} [fallback]
 */
function findClaimToken(tokens, claimId, fallback) {
  const id = String(claimId || '');
  const list = (tokens || []).filter((t) => t && String(t.claim_id) === id);
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  for (const t of list) {
    if (claimValuesMatch(t.value, fallback)) return t;
    if (claimValuesMatch(t.display_es, fallback)) return t;
    if (claimValuesMatch(t.display_en, fallback)) return t;
  }
  return list[0];
}

function isClaimMarker(text) {
  return typeof text === 'string' && text.includes('{{claim:');
}

function markerDisplayText(fallback, token, lang) {
  const fb = fallback != null ? String(fallback).trim() : '';
  if (fb && !isClaimMarker(fb)) return fb;
  if (!token) return fb || '';
  const field = lang === 'en' ? 'display_en' : 'display_es';
  const raw = token[field];
  if (raw && !isClaimMarker(raw)) return raw;
  if (token.value != null && String(token.value) !== '') return String(token.value);
  return fb;
}

module.exports = {
  CLAIM_MARKER_RE,
  normalizeClaimMarkerText,
  coerceClaimValue,
  claimValuesMatch,
  findClaimToken,
  markerDisplayText,
  isClaimMarker,
};
