'use strict';

/**
 * Compute the date window for news ingest / coverage checks.
 *
 * Replay: anchor on `--from` / `--to` so headlines span lookback days before
 * the first simulated day through the last replay day (inclusive).
 */

function addDays(isoDate, delta) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function computeNewsWindow({
  from = null,
  to = null,
  asOf = null,
  lookbackDays = parseInt(process.env.NEWS_LOOKBACK_DAYS || '30', 10),
} = {}) {
  const envFrom = process.env.GEMINI_NEWS_FROM || process.env.NEWS_FROM || null;
  const envTo = process.env.GEMINI_NEWS_TO || process.env.NEWS_TO || null;

  let end = to || asOf || envTo || todayIso();
  let start = from || envFrom || null;

  if (from && !to && !asOf) {
    end = from;
    start = addDays(from, -lookbackDays);
  } else if (from && (to || asOf)) {
    end = to || asOf;
    start = addDays(from, -lookbackDays);
  } else if (!start) {
    start = addDays(end, -lookbackDays);
  }

  if (start > end) start = end;

  return { from: start, to: end, lookbackDays };
}

module.exports = {
  addDays,
  todayIso,
  computeNewsWindow,
};
