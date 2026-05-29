'use strict';

const { pipeLog } = require('./pipe-log');
const { logTiming } = require('./timing');
const { computeNewsWindow } = require('./news-window');
const {
  summarizeCountryNewsCoverage,
  logCountryNewsCoverage,
} = require('./news-coverage');
const {
  fetchNewsForCountry,
  GEMINI_PACE_MS,
  isRateLimitError,
  GEMINI_ABORT_AFTER_429,
} = require('./news-gemini');
const {
  fetchGdeltForCountry,
  DEFAULT_COUNTRIES,
  GDELT_PACE_MS,
} = require('./news-fetch');

const SCOPE = 'news-pool';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function minAcceptedForCountry(opts) {
  return opts.minAcceptedPerCountry
    ?? parseInt(process.env.NEWS_MIN_ACCEPTED_PER_COUNTRY || '8', 10);
}

function geminiEnabled(opts) {
  if (opts.geminiFirst === false) return false;
  if (process.env.NEWS_GEMINI_FIRST === 'false') return false;
  return Boolean(process.env.GEMINI_API_KEY);
}

function gdeltFallbackEnabled(opts) {
  if (opts.gdeltFallback === false) return false;
  return process.env.NEWS_GDELT_FALLBACK !== 'false';
}

/**
 * Fetch headlines: up to one Gemini call per country, GDELT fallback per country
 * when Gemini fails or returns no accepted articles. Skips countries already covered.
 */
async function fetchNewsPool(opts = {}) {
  const countries = opts.countries || DEFAULT_COUNTRIES;
  const window = opts.from && opts.to
    ? { from: opts.from, to: opts.to }
    : computeNewsWindow({
      from: opts.replayFrom || opts.from,
      to: opts.replayTo || opts.to,
      asOf: opts.asOf,
      lookbackDays: opts.lookbackDays,
    });
  const { from, to } = window;
  const minAccepted = minAcceptedForCountry(opts);
  const skipCovered = opts.skipCovered !== false
    && process.env.NEWS_SKIP_COVERED !== 'false';
  const maxArticles = opts.maxArticles
    ?? parseInt(process.env.NEWS_MAX_ARTICLES_PER_COUNTRY || '8', 10);
  const minGeminiAccepted = opts.minGeminiAccepted
    ?? parseInt(process.env.NEWS_MIN_GEMINI_ACCEPTED || '1', 10);

  let coverage = summarizeCountryNewsCoverage(countries, { from, to, minAccepted });
  if (skipCovered) logCountryNewsCoverage(SCOPE, coverage);

  let targets = skipCovered ? coverage.needsNews : [...countries];
  if (!targets.length) {
    pipeLog(SCOPE, 'skip', { reason: 'all countries covered', window: `${from}→${to}` });
    return {
      skipped: true,
      window,
      coverage,
      geminiCalls: 0,
      gdeltCalls: 0,
      totalNew: 0,
      totalAccepted: 0,
      countries: {},
    };
  }

  const useGemini = geminiEnabled(opts);
  const useGdeltFallback = gdeltFallbackEnabled(opts);
  pipeLog(SCOPE, 'config', {
    window: `${from}→${to}`,
    targets: targets.join(','),
    gemini: useGemini ? 'first' : 'off',
    gdelt_fallback: useGdeltFallback ? 'on' : 'off',
    min_accepted: minAccepted,
    max_articles: maxArticles,
  });

  const seenUrls = new Set();
  let geminiCalls = 0;
  let gdeltCalls = 0;
  let totalNew = 0;
  let totalAccepted = 0;
  let geminiDisabled = false;
  let failedRequestStreak429 = 0;
  const countrySummary = {};
  const runT0 = Date.now();

  for (let i = 0; i < targets.length; i++) {
    const country = targets[i];
    if (i > 0) await sleep(useGemini && !geminiDisabled ? GEMINI_PACE_MS : GDELT_PACE_MS);

    let accepted = 0;
    let appended = 0;
    let source = null;

    if (useGemini && !geminiDisabled) {
      try {
        pipeLog(SCOPE, 'gemini', { country, window: `${from}→${to}` });
        geminiCalls += 1;
        const result = await fetchNewsForCountry(country, {
          from,
          to,
          maxArticles,
          seenUrls,
          fetchBody: opts.fetchBody,
        });
        appended = result.appended;
        accepted = result.accepted;
        totalNew += appended;
        totalAccepted += accepted;
        source = 'gemini';
        failedRequestStreak429 = 0;
        pipeLog(SCOPE, 'gemini-done', { country, accepted, saved: appended });
      } catch (err) {
        pipeLog(SCOPE, 'gemini-fail', {
          country,
          error: err.message.split('\n')[0].slice(0, 120),
        }, 'warn');
        if (isRateLimitError(err)) {
          failedRequestStreak429 += 1;
          if (failedRequestStreak429 >= GEMINI_ABORT_AFTER_429) {
            pipeLog(SCOPE, 'gemini-off', {
              reason: 'quota exhausted',
              streak: failedRequestStreak429,
            }, 'warn');
            geminiDisabled = true;
          }
        } else {
          failedRequestStreak429 = 0;
        }
      }
    }

    if (accepted < minGeminiAccepted && useGdeltFallback) {
      try {
        pipeLog(SCOPE, 'gdelt', { country, reason: source ? 'gemini-insufficient' : 'no-gemini' });
        gdeltCalls += 1;
        const gdelt = await fetchGdeltForCountry(country, from, to, {
          maxRecords: maxArticles,
          useThemes: false,
        });
        totalNew += gdelt.added;
        totalAccepted += gdelt.added;
        accepted += gdelt.added;
        appended += gdelt.added;
        source = source ? `${source}+gdelt` : 'gdelt';
        pipeLog(SCOPE, 'gdelt-done', { country, appended: gdelt.added, fetched: gdelt.fetched });
      } catch (err) {
        pipeLog(SCOPE, 'gdelt-fail', { country, error: err.message }, 'warn');
      }
    }

    countrySummary[country] = { source, accepted, appended };
  }

  logTiming(SCOPE, 'total', Date.now() - runT0, `${geminiCalls} gemini + ${gdeltCalls} gdelt, ${totalAccepted} accepted`);

  coverage = summarizeCountryNewsCoverage(countries, { from, to, minAccepted });

  return {
    skipped: false,
    window,
    coverage,
    geminiCalls,
    gdeltCalls,
    totalCalls: geminiCalls + gdeltCalls,
    totalNew,
    totalAccepted,
    countries: countrySummary,
  };
}

module.exports = {
  fetchNewsPool,
  minAcceptedForCountry,
};
