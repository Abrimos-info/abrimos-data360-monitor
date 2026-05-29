'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  classifyLlmError,
  enrichLlmError,
  formatLlmErrorLog,
  createLlmErrorAccumulator,
} = require('../lib/llm-error');

test('classifyLlmError detects quota from anthropic 429', () => {
  const c = classifyLlmError('[anthropic] HTTP 429\n  response: rate_limit', { httpStatus: 429 });
  assert.equal(c.kind, 'quota');
});

test('classifyLlmError detects docker container down', () => {
  const c = classifyLlmError('', {
    stderr: "[claude-wrapper] container 'claude-cli' is not running. Start with: docker compose up -d claude-cli",
    exitCode: 1,
  });
  assert.equal(c.kind, 'docker');
});

test('classifyLlmError detects silent cli exit via docker wrapper', () => {
  const c = classifyLlmError('[claude-code] process failed (exit 1)', {
    stderr: '[claude-wrapper] using docker: claude-cli',
    stdout: '',
    exitCode: 1,
  });
  assert.equal(c.kind, 'process_exit');
  assert.equal(c.subkind, 'cli_silent_exit');
});

test('classifyLlmError detects auth errors', () => {
  const c = classifyLlmError('Please run claude auth login to authenticate', { exitCode: 1 });
  assert.equal(c.kind, 'auth');
});

test('formatLlmErrorLog is grep-friendly', () => {
  const line = formatLlmErrorLog(
    { kind: 'quota', hint: 'wait' },
    { idno: 'WB_MPO_X', label: 'analysis:WB_MPO_X', model: 'opus' },
  );
  assert.match(line, /^\[AI-ERROR\] kind=quota/);
  assert.match(line, /idno=WB_MPO_X/);
});

test('createLlmErrorAccumulator summarizes dominant failure', () => {
  const acc = createLlmErrorAccumulator();
  acc.record({ kind: 'process_exit', subkind: 'cli_silent_exit', hint: 'manual test' });
  acc.record({ kind: 'process_exit', subkind: 'cli_silent_exit', hint: 'manual test' });
  acc.record({ kind: 'quota', hint: 'wait' });
  const lines = acc.summaryLines();
  assert.equal(lines.length, 2);
  assert.match(lines[0], /LLM failures: 3 total/);
  assert.match(lines[0], /process_exit:cli_silent_exit:2/);
});

test('enrichLlmError attaches classification to Error', () => {
  const err = new Error('fail');
  const c = enrichLlmError(err, { stderr: 'timeout after 300s', exitCode: 1 });
  assert.equal(err.llmError.kind, c.kind);
});
