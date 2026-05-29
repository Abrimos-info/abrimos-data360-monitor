'use strict';

const { formatRunElapsed } = require('./timing');

/** Events that get a run-elapsed suffix in pipeLog (milestones, not per-article noise). */
const MILESTONE_EVENTS = new Set([
  'config', 'done', 'skip', 'summary', 'fail', 'abort', 'gemini-off',
  'gdelt-fail', 'gdelt-done', 'gemini-done', 'gemini-fail', 'gemini-off',
  'coverage', 'needs-fetch', 'total',
]);

/**
 * Structured console line: [scope] event | key=value | ...
 * Milestone events append run elapsed (+2m 14s) when D360_RUN_EPOCH is set.
 */
function pipeLog(scope, event, fields = {}, level = 'log') {
  const showElapsed = fields.elapsed === true
    || (fields.elapsed !== false && MILESTONE_EVENTS.has(event));
  const parts = [];
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'elapsed') continue;
    if (value == null || value === '') continue;
    const s = String(value).replace(/\s+/g, ' ').trim();
    parts.push(`${key}=${s}`);
  }
  let line = parts.length
    ? `[${scope}] ${event} | ${parts.join(' | ')}`
    : `[${scope}] ${event}`;
  if (showElapsed) {
    const elapsed = formatRunElapsed();
    if (elapsed) line += ` | ${elapsed}`;
  }
  if (level === 'warn') console.warn(line);
  else console.log(line);
}

/** Orchestrator step line with run elapsed: [scope] message | +2m 14s */
function stepLog(scope, message, level = 'log') {
  const elapsed = formatRunElapsed();
  const line = elapsed ? `[${scope}] ${message} | ${elapsed}` : `[${scope}] ${message}`;
  if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = { pipeLog, stepLog, MILESTONE_EVENTS };
