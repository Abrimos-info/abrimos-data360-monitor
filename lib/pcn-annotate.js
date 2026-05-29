'use strict';

const { computeClaimId, claimInputFromObservation } = require('./pcn-claims');
const { verifyClaim, lookupObservationByClaimId } = require('./pcn-verify');
const { COUNTRIES } = require('./data-loader');
const { databaseIdFor } = require('./analysis/candidate-builder');

const PCN_STATUS = {
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  UNVERIFIED: 'unverified',
};

function rawObservationFromCandidate(c) {
  return c.detection_meta?.observation
    || c.observation
    || c.alert?.observation;
}

function claimMetaFromObservation(obs, { idno, country, databaseId } = {}) {
  if (!obs?.time_period || !country) return null;
  const input = claimInputFromObservation(obs, { database_id: databaseId, indicator: idno, country });
  return {
    indicator: idno,
    refArea: country,
    timePeriod: input.time_period,
    unit_measure: input.unit_measure,
    comp_breakdown_1: input.comp_breakdown_1,
    comp_breakdown_2: input.comp_breakdown_2,
    comp_breakdown_3: input.comp_breakdown_3,
    sex: input.sex,
    age: input.age,
    urbanisation: input.urbanisation,
    database_id: databaseId,
  };
}

function buildClaimMapFromCandidates(candidates, idno) {
  const map = new Map();
  for (const c of candidates || []) {
    const country = c.country || c.alert?.country;
    const claimId = c.claim_id || c.detection_meta?.claim_id;
    const databaseId = c.alert?.indicator?.database_id || databaseIdFor(idno);
    const rawObs = rawObservationFromCandidate(c);
    const meta = claimMetaFromObservation(rawObs, { idno, country, databaseId });
    if (claimId && meta) {
      map.set(claimId, meta);
    }
    const prev = c.previous || c.detection_meta?.previous;
    if (prev?.time_period && country) {
      const prevMeta = claimMetaFromObservation(prev, { idno, country, databaseId });
      if (!prevMeta) continue;
      const prevId = computeClaimId(claimInputFromObservation(prev, {
        database_id: databaseId,
        indicator: idno,
        country,
      }));
      map.set(prevId, prevMeta);
    }
  }
  return map;
}

function buildClaimMapFromNoticias(noticias) {
  const map = new Map();

  for (const n of noticias || []) {
    const idno = n.indicator?.idno;
    const databaseId = n.indicator?.database_id || n.dataset_id || (idno ? databaseIdFor(idno) : '');
    const country = n.country ? String(n.country).toUpperCase() : null;
    if (!idno || !country) continue;
    const obsMeta = claimMetaFromObservation(n.observation, { idno, country, databaseId });
    for (const t of n.claim_tokens || []) {
      if (!t?.claim_id || map.has(t.claim_id)) continue;
      const row = lookupObservationByClaimId(t.claim_id, COUNTRIES);
      if (row) {
        const rowIdno = row.indicator || idno;
        map.set(t.claim_id, claimMetaFromObservation(row, {
          idno: rowIdno,
          country: row.country,
          databaseId: databaseIdFor(rowIdno),
        }));
        continue;
      }
      if (obsMeta) map.set(t.claim_id, obsMeta);
    }
  }
  return map;
}

function annotateClaimToken(token, { contextClaimIds, claimMap }) {
  if (!token || typeof token !== 'object') return token;
  const out = { ...token };
  const claimId = String(out.claim_id || '');

  if (!(contextClaimIds instanceof Set) || !contextClaimIds.has(claimId)) {
    out.pcn_status = PCN_STATUS.REJECTED;
    out.pcn_reason = 'claim_id not in allowed context';
    return out;
  }

  const meta = claimMap?.get(claimId);
  if (!meta) {
    out.pcn_status = PCN_STATUS.UNVERIFIED;
    out.pcn_reason = 'no observation metadata for claim verification';
    return out;
  }

  const result = verifyClaim(
    claimId,
    out.value,
    meta.indicator,
    meta.refArea,
    meta.timePeriod,
    meta,
  );
  out.pcn_status = result.valid ? PCN_STATUS.VERIFIED : PCN_STATUS.REJECTED;
  out.pcn_reason = result.message;
  if (result.source) out.pcn_source = result.source;
  if (result.observation) out.pcn_observation = result.observation;
  return out;
}

function annotateClaimTokens(claimTokens, opts) {
  if (!Array.isArray(claimTokens)) return [];
  return claimTokens.map((t) => annotateClaimToken(t, opts));
}

function summarizeClaimQuality(claimTokens) {
  const tokens = claimTokens || [];
  const verified = tokens.filter((t) => t.pcn_status === PCN_STATUS.VERIFIED).length;
  const rejected = tokens.filter((t) => t.pcn_status === PCN_STATUS.REJECTED).length;
  const unverified = tokens.filter((t) => t.pcn_status === PCN_STATUS.UNVERIFIED).length;
  const tags = [];
  if (rejected) tags.push(`${rejected}_claims_rejected`);
  if (unverified) tags.push(`${unverified}_claims_unverified`);
  if (tokens.some((t) => t.pcn_reason === 'claim_id not in allowed context')) tags.push('orphan_claim');

  let quality_status = 'accepted';
  if (tokens.length === 0) {
    quality_status = 'incomplete';
    tags.push('no_claim_tokens');
  } else if (rejected === tokens.length) {
    quality_status = 'incomplete';
  } else if (rejected > 0 || unverified > 0) {
    quality_status = 'incomplete';
  }

  return { quality_status, quality_tags: tags, verified, rejected, unverified, total: tokens.length };
}

function annotateNoticiaClaims(noticia, contextClaimIds, candidates, idno) {
  if (!noticia || typeof noticia !== 'object') return noticia;
  const claimMap = buildClaimMapFromCandidates(candidates, idno);
  noticia.claim_tokens = annotateClaimTokens(noticia.claim_tokens, { contextClaimIds, claimMap });
  const summary = summarizeClaimQuality(noticia.claim_tokens);
  noticia.quality_status = summary.quality_status;
  noticia.quality_tags = summary.quality_tags;
  return noticia;
}

function annotateReportajeClaims(reportaje, contextClaimIds, noticias) {
  if (!reportaje || typeof reportaje !== 'object') return reportaje;
  const claimMap = buildClaimMapFromNoticias(noticias);
  reportaje.claim_tokens = annotateClaimTokens(reportaje.claim_tokens, { contextClaimIds, claimMap });
  const summary = summarizeClaimQuality(reportaje.claim_tokens);
  reportaje.quality_status = summary.quality_status;
  reportaje.quality_tags = summary.quality_tags;
  return reportaje;
}

module.exports = {
  PCN_STATUS,
  buildClaimMapFromCandidates,
  buildClaimMapFromNoticias,
  annotateClaimToken,
  annotateClaimTokens,
  annotateNoticiaClaims,
  annotateReportajeClaims,
  summarizeClaimQuality,
};
