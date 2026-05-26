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

function logTiming(scope, label, ms, extra = '') {
  const suffix = extra ? ` | ${extra}` : '';
  console.log(`[TIMING] ${scope}${label ? ` | ${label}` : ''} | ${formatDuration(ms)}${suffix}`);
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
  logTiming,
  createTimer,
  timed,
};
