'use strict';

/**
 * Normalize LLM narrative output to match alert schema and Q1 traceability.
 * Coerces claim values to numbers, maps fabricated claim_ids to context IDs,
 * and falls back to deterministic claim_tokens when the LLM output is invalid.
 */

function resolveClaimId(rawId, contextClaimIds) {
  const id = String(rawId || '');
  if (!id) return null;
  if (contextClaimIds.has(id)) return id;
  for (const ctxId of contextClaimIds) {
    if (ctxId.startsWith(id) || ctxId.endsWith(id)) return ctxId;
  }
  return null;
}

function coerceNumber(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/%/g, '');
    const en = Number(trimmed.replace(/,/g, ''));
    if (Number.isFinite(en)) return en;
    const es = Number(trimmed.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(es)) return es;
  }
  if (Number.isFinite(fallback)) return fallback;
  return null;
}

function rewriteClaimMarkers(text, contextClaimIds, idRemap, validTokens) {
  if (!text || typeof text !== 'string') return text;
  const valueById = new Map((validTokens || []).map((t) => [t.claim_id, t.value]));
  const usedIds = new Set();
  return text.replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, (_, rawId, display) => {
    const resolved = idRemap.get(String(rawId))
      || resolveClaimId(rawId, contextClaimIds);
    if (!resolved || !contextClaimIds.has(resolved)) return display;
    const tokenVal = valueById.get(resolved);
    const displayNum = coerceNumber(display, null);
    const sameValue = tokenVal == null || displayNum == null
      || Math.abs(tokenVal - displayNum) <= Math.max(0.001, Math.abs(tokenVal) * 1e-6);
    if (usedIds.has(resolved) || !sameValue) return display;
    usedIds.add(resolved);
    return `{{claim:${resolved}|${display}}}`;
  });
}

function normalizeLlmNarrative(candidate, llm, contextClaimIds, deterministicNarrative, previousClaimIdFn) {
  const det = deterministicNarrative(candidate);
  if (!llm || !llm.narrative_citizen) return det;

  const primaryId = candidate.detection_meta.claim_id;
  const prevId = previousClaimIdFn ? previousClaimIdFn(candidate) : null;

  const idRemap = new Map();
  const mergedById = new Map(det.claim_tokens.map((t) => [t.claim_id, { ...t }]));
  const llmTokens = Array.isArray(llm.claim_tokens) ? llm.claim_tokens : [];

  for (let i = 0; i < llmTokens.length; i++) {
    const t = llmTokens[i];
    const rawId = String(t.claim_id || '');
    let resolved = resolveClaimId(rawId, contextClaimIds);
    if (!resolved) {
      if (i === 0) resolved = primaryId;
      else if (i === 1 && prevId) resolved = prevId;
    }
    if (rawId && resolved) idRemap.set(rawId, resolved);
    if (!resolved || !contextClaimIds.has(resolved)) continue;
    if (mergedById.has(resolved) && i > 1) continue;

    const base = mergedById.get(resolved) || {};
    const fallbackVal = resolved === primaryId
      ? Number(candidate.alert.observation.value)
      : (resolved === prevId && candidate.detection_meta.previous
        ? Number(candidate.detection_meta.previous.value)
        : base.value);
    const value = coerceNumber(t.value, fallbackVal);
    if (!Number.isFinite(value)) continue;

    mergedById.set(resolved, {
      claim_id: resolved,
      value,
      display_es: t.display_es || base.display_es,
      display_en: t.display_en || base.display_en,
    });
  }

  const claim_tokens = Array.from(mergedById.values()).map((t) => ({
    ...t,
    value: coerceNumber(t.value, Number(candidate.alert.observation.value)),
  }));

  const rewrite = (text) => rewriteClaimMarkers(text, contextClaimIds, idRemap, claim_tokens);

  return {
    narrative_citizen: {
      es: rewrite(llm.narrative_citizen?.es) || det.narrative_citizen.es,
      en: rewrite(llm.narrative_citizen?.en) || det.narrative_citizen.en,
    },
    narrative_journalist: {
      es: rewrite(llm.narrative_journalist?.es) || det.narrative_journalist.es,
      en: rewrite(llm.narrative_journalist?.en) || det.narrative_journalist.en,
    },
    claim_tokens,
  };
}

module.exports = { normalizeLlmNarrative, resolveClaimId, coerceNumber, rewriteClaimMarkers };
