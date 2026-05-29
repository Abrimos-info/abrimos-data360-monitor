'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatDuration, createTimer, startRunTimer, formatRunElapsed } = require('../lib/timing');

describe('timing', () => {
  it('formatDuration handles ms, seconds, and minutes', () => {
    assert.equal(formatDuration(500), '500ms');
    assert.equal(formatDuration(2500), '2.5s');
    assert.equal(formatDuration(65_000), '1m 5s');
  });

  it('createTimer end returns totalMs', () => {
    const timer = createTimer('test');
    const { totalMs } = timer.end('total');
    assert.ok(totalMs >= 0);
  });

  it('startRunTimer sets D360_RUN_EPOCH and formatRunElapsed returns suffix', () => {
    const prev = process.env.D360_RUN_EPOCH;
    delete process.env.D360_RUN_EPOCH;
    startRunTimer('test-run');
    assert.ok(process.env.D360_RUN_EPOCH);
    assert.match(formatRunElapsed(), /^\+/);
    if (prev) process.env.D360_RUN_EPOCH = prev;
    else delete process.env.D360_RUN_EPOCH;
  });
});
