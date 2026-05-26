'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('ai-client provider labels', () => {
  const saved = {};

  beforeEach(() => {
    for (const key of [
      'AI_PROVIDER',
      'CHAT_AI_PROVIDER',
      'AI_MODEL',
      'AI_MODEL_NVIDIA',
    ]) {
      saved[key] = process.env[key];
    }
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    delete require.cache[require.resolve('../lib/ai-client')];
  });

  it('providerDisplayName maps vllm to LAIA and nvidia to NVIDIA', () => {
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    assert.equal(ai.providerDisplayName('vllm'), 'LAIA');
    assert.equal(ai.providerDisplayName('nvidia'), 'NVIDIA');
    assert.equal(ai.providerDisplayName('claude-code'), 'Claude');
  });

  it('getAnalysisModelInfo reports LAIA for vllm provider', () => {
    process.env.AI_PROVIDER = 'vllm';
    process.env.AI_MODEL = 'Qwen/Qwen2.5-14B-Instruct-AWQ';
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const info = ai.getAnalysisModelInfo();
    assert.equal(info.providerLabel, 'LAIA');
    assert.equal(info.model, 'Qwen/Qwen2.5-14B-Instruct-AWQ');
  });

  it('getAnalysisModelInfo uses Kimi on NVIDIA without AI_MODEL fallback', () => {
    process.env.AI_PROVIDER = 'nvidia';
    process.env.AI_MODEL = 'Qwen/Qwen2.5-14B-Instruct-AWQ';
    delete process.env.AI_MODEL_NVIDIA;
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const info = ai.getAnalysisModelInfo();
    assert.equal(info.providerLabel, 'NVIDIA');
    assert.equal(info.model, 'moonshotai/kimi-k2.6');
  });

  it('logAnalysisLlm prints provider and model', () => {
    process.env.AI_PROVIDER = 'nvidia';
    delete process.env.AI_MODEL_NVIDIA;
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const lines = [];
    const orig = console.log;
    console.log = (...args) => lines.push(args.join(' '));
    try {
      const info = ai.logAnalysisLlm('AI-ANALYSIS');
      assert.equal(info.providerLabel, 'NVIDIA');
      assert.match(lines[0], /\[AI-ANALYSIS\] LLM: NVIDIA \| moonshotai\/kimi-k2\.6/);
    } finally {
      console.log = orig;
    }
  });

  it('resolveAnalysisModel ignores Qwen override when provider is nvidia', () => {
    process.env.AI_PROVIDER = 'nvidia';
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const model = ai.resolveAnalysisModel('Qwen/Qwen2.5-14B-Instruct-AWQ', 'nvidia');
    assert.equal(model, 'moonshotai/kimi-k2.6');
  });

  it('getChatModelInfo inherits AI_PROVIDER when CHAT_AI_PROVIDER unset', () => {
    process.env.AI_PROVIDER = 'nvidia';
    delete process.env.CHAT_AI_PROVIDER;
    delete process.env.AI_MODE;
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const info = ai.getChatModelInfo();
    assert.equal(info.providerLabel, 'NVIDIA');
    assert.equal(info.model, 'moonshotai/kimi-k2.6');
  });

  it('getChatModelInfo reports NVIDIA + Kimi for chat provider', () => {
    process.env.CHAT_AI_PROVIDER = 'nvidia';
    delete process.env.AI_MODEL_NVIDIA;
    delete require.cache[require.resolve('../lib/ai-client')];
    const ai = require('../lib/ai-client');
    const info = ai.getChatModelInfo();
    assert.equal(info.providerLabel, 'NVIDIA');
    assert.equal(info.model, 'moonshotai/kimi-k2.6');
  });
});
