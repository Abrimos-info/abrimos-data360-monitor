'use strict';

/**
 * Strategy 1, abrupt change detection.
 *
 * For each (indicator, country) series with at least 6 observations, compute the z-score
 * of the most recent observation against the 5 previous points. Emit a candidate when
 * the absolute z-score is at or above the threshold.
 */

const Decimal = require('decimal.js');

const DEFAULT_THRESHOLD = 2;
const DEFAULT_WINDOW = 5;

function toNumber(s) {
  try { return new Decimal(s).toNumber(); }
  catch (_) { return Number.NaN; }
}

function mean(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

function stddev(values, m) {
  if (values.length < 2) return 0;
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function detectAbruptChanges(series, opts = {}) {
  const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
  const window = opts.window ?? DEFAULT_WINDOW;
  const out = [];

  for (const [idno, byCountry] of Object.entries(series)) {
    for (const [country, observations] of Object.entries(byCountry)) {
      if (!observations || observations.length < window + 1) continue;

      const sorted = [...observations].sort((a, b) => a.time_period.localeCompare(b.time_period));
      const last = sorted[sorted.length - 1];
      const lastValue = toNumber(last.value);
      if (!Number.isFinite(lastValue)) continue;

      const priorValues = sorted.slice(-1 - window, -1)
        .map((o) => toNumber(o.value))
        .filter(Number.isFinite);
      if (priorValues.length < 3) continue;

      const m = mean(priorValues);
      const s = stddev(priorValues, m);
      if (s === 0) continue;

      const z = (lastValue - m) / s;
      const isRank = String(last.unit_measure || '').toUpperCase() === 'RANK';
      let emit = Math.abs(z) >= threshold;
      if (!emit && isRank && sorted.length >= 2) {
        const prevPoint = sorted[sorted.length - 2];
        const prevValue = toNumber(prevPoint.value);
        if (Number.isFinite(prevValue) && Math.abs(lastValue - prevValue) >= 15) emit = true;
      }
      if (!emit) continue;

      const previous = sorted[sorted.length - 2];
      out.push({
        type: 'abrupt_change',
        indicator: idno,
        country,
        observation: last,
        previous,
        z_score: z,
        baseline_mean: m,
        baseline_stddev: s,
        history: sorted,
      });
    }
  }

  return out;
}

module.exports = { detectAbruptChanges };
