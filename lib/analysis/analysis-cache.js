'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function candidateFingerprint(candidates) {
  const parts = (candidates || []).map((c) => {
    const obs = c.alert?.observation || c.observation || {};
    const meta = c.detection_meta || {};
    return [
      c.alert?.country || c.country || '',
      c.alert?.type || c.type || '',
      obs.time_period || '',
      String(obs.value ?? ''),
      meta.claim_id || c.claim_id || '',
      meta.z_score != null ? Number(meta.z_score).toFixed(3) : '',
    ].join('|');
  }).sort();
  return crypto.createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 16);
}

function metaPath(alertsDir, idno) {
  return path.join(alertsDir, `${idno}.meta.json`);
}

function alertPath(alertsDir, idno) {
  return path.join(alertsDir, `${idno}.json`);
}

function loadCachedMeta(alertsDir, idno) {
  const fp = metaPath(alertsDir, idno);
  if (!fs.existsSync(fp)) return null;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (_) {
    return null;
  }
}

function loadCachedAlerts(alertsDir, idno) {
  const fp = alertPath(alertsDir, idno);
  if (!fs.existsSync(fp)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveAnalysisCache(alertsDir, idno, candidates) {
  fs.mkdirSync(alertsDir, { recursive: true });
  const fingerprint = candidateFingerprint(candidates);
  fs.writeFileSync(metaPath(alertsDir, idno), JSON.stringify({
    fingerprint,
    idno,
    candidate_count: candidates?.length || 0,
    updated_at: new Date().toISOString(),
  }, null, 2), 'utf8');
  return fingerprint;
}

function isUnchangedIndicator(alertsDir, idno, candidates) {
  const meta = loadCachedMeta(alertsDir, idno);
  if (!meta?.fingerprint) return false;
  if (meta.fingerprint !== candidateFingerprint(candidates)) return false;
  const alerts = loadCachedAlerts(alertsDir, idno);
  return alerts.length > 0;
}

function maxAbsZScore(candidates) {
  let best = 0;
  for (const c of candidates || []) {
    const z = Math.abs(c.detection_meta?.z_score ?? c.z_score ?? 0);
    if (z > best) best = z;
  }
  return best;
}

function rankIndicatorsBySignal(idnos, byIndicator) {
  return [...idnos].sort((a, b) => {
    const za = maxAbsZScore(byIndicator.get(a));
    const zb = maxAbsZScore(byIndicator.get(b));
    if (zb !== za) return zb - za;
    return a.localeCompare(b);
  });
}

module.exports = {
  candidateFingerprint,
  loadCachedAlerts,
  loadCachedMeta,
  saveAnalysisCache,
  isUnchangedIndicator,
  maxAbsZScore,
  rankIndicatorsBySignal,
};
