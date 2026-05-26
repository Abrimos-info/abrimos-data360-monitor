'use strict';

/**
 * Structured console line: [scope] event | key=value | ...
 * Matches [TIMING] style used elsewhere in the pipeline.
 */
function pipeLog(scope, event, fields = {}, level = 'log') {
  const parts = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value == null || value === '') continue;
    const s = String(value).replace(/\s+/g, ' ').trim();
    parts.push(`${key}=${s}`);
  }
  const line = parts.length
    ? `[${scope}] ${event} | ${parts.join(' | ')}`
    : `[${scope}] ${event}`;
  if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = { pipeLog };
