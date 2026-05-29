'use strict';

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}m ${remSec}s`;
}

/** Wall-clock epoch (ms) shared across pipeline subprocesses via env. */
function runEpochMs() {
  const raw = process.env.D360_RUN_EPOCH;
  if (raw && /^\d+$/.test(raw)) return parseInt(raw, 10);
  return null;
}

function runElapsedMs() {
  const epoch = runEpochMs();
  return epoch != null ? Date.now() - epoch : null;
}

/** Suffix for logs, e.g. "+2m 14s". Empty when no run timer active. */
function formatRunElapsed() {
  const ms = runElapsedMs();
  return ms != null ? `+${formatDuration(ms)}` : '';
}

/**
 * Start (or inherit) a run-wide timer. Child processes inherit D360_RUN_EPOCH
 * when spawned with env: process.env.
 */
function startRunTimer(scope) {
  if (!process.env.D360_RUN_EPOCH) {
    process.env.D360_RUN_EPOCH = String(Date.now());
  }
  if (scope && !process.env.D360_RUN_SCOPE) {
    process.env.D360_RUN_SCOPE = scope;
  }
  return runEpochMs();
}

function logTiming(scope, label, ms, extra = '') {
  const parts = [`[TIMING] ${scope}${label ? ` | ${label}` : ''} | ${formatDuration(ms)}`];
  if (extra) parts.push(extra);
  const elapsed = formatRunElapsed();
  if (elapsed) parts.push(elapsed);
  console.log(parts.join(' | '));
}

function createTimer(scope) {
  const t0 = Date.now();
  const laps = [];
  let last = t0;

  return {
    lap(label, extra) {
      const now = Date.now();
      const ms = now - last;
      laps.push({ label, ms });
      logTiming(scope, label, ms, extra);
      last = now;
      return ms;
    },
    end(label = 'total', extra) {
      const ms = Date.now() - t0;
      logTiming(scope, label, ms, extra);
      return { totalMs: ms, laps };
    },
    elapsed() {
      return Date.now() - t0;
    },
  };
}

async function timed(scope, label, fn) {
  const t0 = Date.now();
  try {
    const result = await fn();
    logTiming(scope, label, Date.now() - t0);
    return result;
  } catch (err) {
    logTiming(scope, `${label} (failed)`, Date.now() - t0, err.message?.split('\n')[0]?.slice(0, 80));
    throw err;
  }
}

module.exports = {
  formatDuration,
  formatRunElapsed,
  runElapsedMs,
  startRunTimer,
  logTiming,
  createTimer,
  timed,
};
