'use strict';

const { normalizeCountry } = require('./country-utils');

function parseLimit(value, fallback = 0) {
  if (value == null || value === '') return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function resolveLimits(opts = {}) {
  return {
    maxIndicators: opts.maxIndicators ?? parseLimit(process.env.ANALYSIS_MAX_INDICATORS, 0),
    maxPerCountry: opts.maxNoticiasPerCountry
      ?? parseLimit(process.env.ANALYSIS_MAX_NOTICIAS_PER_COUNTRY, 0),
    maxPerRun: opts.maxNoticiasPerRun
      ?? parseLimit(process.env.ANALYSIS_MAX_NOTICIAS_PER_RUN, 0),
  };
}

function isLimitEnabled(limits) {
  return limits.maxPerCountry > 0 || limits.maxPerRun > 0;
}

function isNoticia(item) {
  return (item?.content_type || 'noticia') !== 'reportaje';
}

function countNoticias(alerts) {
  return (alerts || []).filter(isNoticia).length;
}

function countNoticiasByCountry(alerts) {
  const counts = {};
  for (const item of alerts || []) {
    if (!isNoticia(item)) continue;
    const country = normalizeCountry(item.country);
    if (!country) continue;
    counts[country] = (counts[country] || 0) + 1;
  }
  return counts;
}

function evaluateIndicatorLimit({ primaryCountry, countryCounts, runCount, limits }) {
  if (limits.maxPerRun > 0 && runCount >= limits.maxPerRun) {
    return { skip: true, reason: 'run_cap', detail: `${runCount}/${limits.maxPerRun} noticias` };
  }
  if (limits.maxPerCountry > 0 && primaryCountry) {
    const countryTotal = countryCounts[primaryCountry] || 0;
    if (countryTotal >= limits.maxPerCountry) {
      return {
        skip: true,
        reason: 'country_cap',
        detail: `${primaryCountry} ${countryTotal}/${limits.maxPerCountry}`,
      };
    }
  }
  return { skip: false };
}

function recordNoticias(countryCounts, alerts, { primaryCountry } = {}) {
  let added = 0;
  for (const item of alerts || []) {
    if (!isNoticia(item)) continue;
    const country = normalizeCountry(item.country) || primaryCountry;
    if (!country) continue;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    added += 1;
  }
  return added;
}

function formatLimitsLog(limits) {
  const parts = [];
  if (limits.maxIndicators > 0) parts.push(`top ${limits.maxIndicators} indicators`);
  if (limits.maxPerCountry > 0) parts.push(`${limits.maxPerCountry}/country`);
  if (limits.maxPerRun > 0) parts.push(`${limits.maxPerRun}/run`);
  return parts.join(', ');
}

module.exports = {
  parseLimit,
  resolveLimits,
  isLimitEnabled,
  isNoticia,
  countNoticias,
  countNoticiasByCountry,
  evaluateIndicatorLimit,
  recordNoticias,
  formatLimitsLog,
};
