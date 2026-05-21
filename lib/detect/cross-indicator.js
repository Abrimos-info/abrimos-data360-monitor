'use strict';

/**
 * Strategy 4, cross-country anomaly detection.
 *
 * For each indicator, look at the most recent year with at least three reporting countries
 * within the watchlist. A country is flagged when its value is more than `threshold` sigma
 * away from the regional median.
 */

const Decimal = require('decimal.js');

const DEFAULT_THRESHOLD = 2;
const MIN_COUNTRIES = 3;

function toNumber(s) {
  try { return new Decimal(s).toNumber(); }
  catch (_) { return Number.NaN; }
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function mad(values, med) {
  const deviations = values.map((v) => Math.abs(v - med));
  return median(deviations) || 1e-9;
}

function detectCrossCountryAnomalies(series, opts = {}) {
  const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
  const out = [];

  for (const [idno, byCountry] of Object.entries(series)) {
    const periodMap = new Map();
    for (const [country, observations] of Object.entries(byCountry)) {
      for (const obs of observations || []) {
        const v = toNumber(obs.value);
        if (!Number.isFinite(v)) continue;
        if (!periodMap.has(obs.time_period)) periodMap.set(obs.time_period, []);
        periodMap.get(obs.time_period).push({ country, value: v, observation: obs });
      }
    }
    if (periodMap.size === 0) continue;

    const periods = [...periodMap.keys()].sort();
    let latestUsable = null;
    for (let i = periods.length - 1; i >= 0; i--) {
      const entries = periodMap.get(periods[i]);
      if (entries.length >= MIN_COUNTRIES) { latestUsable = periods[i]; break; }
    }
    if (!latestUsable) continue;

    const snapshot = periodMap.get(latestUsable);
    const values = snapshot.map((e) => e.value);
    const med = median(values);
    const m = mad(values, med);
    const scale = 1.4826 * m;

    for (const entry of snapshot) {
      if (scale === 0) continue;
      const z = (entry.value - med) / scale;
      if (Math.abs(z) < threshold) continue;
      // Also build the per-period history for the involved country for charts and narrative
      const countryHistory = byCountry[entry.country] || [];
      out.push({
        type: 'anomaly',
        indicator: idno,
        country: entry.country,
        observation: entry.observation,
        z_score: z,
        regional_median: med,
        regional_mad: m,
        regional_snapshot: snapshot.map((s) => ({
          country: s.country,
          value: s.value,
          time_period: latestUsable,
        })),
        history: [...countryHistory].sort((a, b) => a.time_period.localeCompare(b.time_period)),
      });
    }
  }

  return out;
}

module.exports = { detectCrossCountryAnomalies };
