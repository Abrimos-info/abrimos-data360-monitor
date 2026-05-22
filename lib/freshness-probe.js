'use strict';

const { headCsv, csvUrl } = require('./data360-client');
const { loadEtag, saveEtag, loadProbeState, saveProbeState } = require('./freshness-cache');

/**
 * Probe watchlist indicators via conditional HEAD on bulk CSVs.
 *
 * @param {object[]} indicators - watchlist entries with database_id, idno, tier, label
 * @param {string} snapshotsDir
 * @param {{ force?: boolean }} opts - force treats every indicator as changed (skip 304)
 * @returns {Promise<object>} probe result with changed list and per-indicator details
 */
async function probeWatchlist(indicators, snapshotsDir, opts = {}) {
  const force = Boolean(opts.force);
  const headCsvFn = opts.headCsv || headCsv;
  const csvUrlFn = opts.csvUrl || csvUrl;
  const previousProbe = loadProbeState(snapshotsDir);
  const t0 = Date.now();
  const results = [];

  for (const entry of indicators) {
    const { database_id, idno, tier, label } = entry;
    const url = csvUrlFn(database_id, idno);
    const prev = loadEtag(snapshotsDir, idno);
    const head = force
      ? await headCsvFn(url, null)
      : await headCsvFn(url, prev);

    const changed = force || head.changed;
    const isFirstProbe = !prev;

    if (head.status === 200 && head.etag) {
      saveEtag(snapshotsDir, idno, {
        etag: head.etag,
        lastModified: head.lastModified,
        probedAt: new Date().toISOString(),
        csv_url: url,
      });
    }

    results.push({
      idno,
      database_id,
      tier,
      label,
      csv_url: url,
      status: head.status,
      changed,
      first_probe: isFirstProbe,
      last_modified: head.lastModified || prev?.lastModified || null,
      previous_last_modified: prev?.lastModified || null,
      previous_probed_at: prev?.probedAt || null,
      etag: head.etag || prev?.etag || null,
    });
  }

  const probedAt = new Date().toISOString();
  saveProbeState(snapshotsDir, {
    last_probe_at: probedAt,
    previous_probe_at: previousProbe.last_probe_at || null,
    total: indicators.length,
  });

  const changedList = results.filter((r) => r.changed);
  const unchangedList = results.filter((r) => !r.changed);
  const errors = results.filter((r) => r.status >= 400 && r.status !== 304);

  return {
    probed_at: probedAt,
    since: previousProbe.last_probe_at || null,
    elapsed_ms: Date.now() - t0,
    total_probed: indicators.length,
    changed: changedList.length,
    unchanged: unchangedList.length,
    errors: errors.length,
    force,
    indicators: results,
    changed_indicators: changedList.map((r) => r.idno),
  };
}

function buildChangedSinceReport(probeResult) {
  return {
    probed_at: probeResult.probed_at,
    since: probeResult.since,
    elapsed_ms: probeResult.elapsed_ms,
    total_probed: probeResult.total_probed,
    changed: probeResult.changed,
    unchanged: probeResult.unchanged,
    errors: probeResult.errors,
    force: probeResult.force,
    changed_indicators: probeResult.changed_indicators,
    indicators: probeResult.indicators
      .filter((r) => r.changed)
      .map((r) => ({
        idno: r.idno,
        database_id: r.database_id,
        tier: r.tier,
        label: r.label,
        status: r.status,
        first_probe: r.first_probe,
        last_modified: r.last_modified,
        previous_last_modified: r.previous_last_modified,
        previous_probed_at: r.previous_probed_at,
        csv_url: r.csv_url,
      })),
  };
}

function buildIndex(probeResult) {
  return {
    generated_at: probeResult.probed_at,
    since: probeResult.since,
    total: probeResult.total_probed,
    changed_count: probeResult.changed,
    indicators: probeResult.indicators.map((r) => ({
      idno: r.idno,
      database_id: r.database_id,
      tier: r.tier,
      label: r.label,
      changed_this_run: r.changed,
      first_probe: r.first_probe,
      last_modified: r.last_modified,
      etag: r.etag,
      csv_url: r.csv_url,
    })),
  };
}

module.exports = {
  probeWatchlist,
  buildChangedSinceReport,
  buildIndex,
};
