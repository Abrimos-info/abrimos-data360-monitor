'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const INDEX_PATH = path.join(REPO_ROOT, 'data', 'index.json');

function isReplayMode(opts = {}) {
  return Boolean(opts.asOf);
}

function blobDateIso(value) {
  if (!value) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

function loadIndexRows(indexPath = INDEX_PATH) {
  if (!fs.existsSync(indexPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return Array.isArray(data.indicators) ? data.indicators : [];
  } catch (_) {
    return [];
  }
}

function buildIndexMap(indexRows) {
  return new Map((indexRows || []).map((row) => [row.idno, row]));
}

function isNoticia(item) {
  return (item?.content_type || 'noticia') !== 'reportaje';
}

function publishedIndicatorIdnos(alerts) {
  const out = new Set();
  for (const item of alerts || []) {
    if (!isNoticia(item)) continue;
    const idno = item.indicator?.idno;
    if (idno) out.add(idno);
  }
  return out;
}

function noticiasForReplayDay(alerts, asOf) {
  const day = String(asOf).slice(0, 10);
  return (alerts || []).filter((item) => isNoticia(item)
    && String(item.detected_at || '').slice(0, 10) === day);
}

function strictBlobReplayEnabled(opts = {}) {
  if (opts.replayStrictBlob != null) return Boolean(opts.replayStrictBlob);
  return process.env.ANALYSIS_REPLAY_STRICT_BLOB === 'true';
}

/**
 * Pick indicators to narrate on a replay day.
 * Strict blob mode: prefer idnos whose CSV last_modified falls on asOf;
 *   otherwise none until that calendar day (dry days are valid).
 * Default (drip): idnos not yet published, ranked upstream, optionally capped
 *   by blob last_modified <= asOf when index metadata exists.
 */
function selectIdnosForReplayDay(idnos, asOf, { indexMap, published, strictBlob } = {}) {
  const day = String(asOf).slice(0, 10);
  const unpublished = (idnos || []).filter((idno) => !published?.has(idno));

  if (strictBlob) {
    const sameDay = unpublished.filter((idno) => {
      const blobDay = blobDateIso(indexMap?.get(idno)?.last_modified);
      return blobDay === day;
    });
    return sameDay;
  }

  const hasIndex = indexMap && indexMap.size > 0;
  if (!hasIndex) return unpublished;

  return unpublished.filter((idno) => {
    const blobDay = blobDateIso(indexMap.get(idno)?.last_modified);
    if (!blobDay) return true;
    return blobDay <= day;
  });
}

module.exports = {
  INDEX_PATH,
  isReplayMode,
  blobDateIso,
  loadIndexRows,
  buildIndexMap,
  publishedIndicatorIdnos,
  noticiasForReplayDay,
  strictBlobReplayEnabled,
  selectIdnosForReplayDay,
};
