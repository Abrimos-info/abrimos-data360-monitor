'use strict';

require('dotenv').config();

const { execFile } = require('child_process');
const { formatDuration } = require('./timing');

/**
 * Multi-provider LLM client with cost tracking and model fallbacks.
 *
 * Providers (AI_PROVIDER or legacy AI_MODE):
 *   claude-code | vllm (LAIA) | nvidia (NIM / Kimi)
 *
 * Chat uses CHAT_AI_PROVIDER when set; otherwise inherits AI_PROVIDER / AI_MODE.
 */

function resolveAnalysisProvider() {
  return process.env.AI_PROVIDER || process.env.AI_MODE || 'claude-code';
}

function resolveChatProvider() {
  return process.env.CHAT_AI_PROVIDER
    || process.env.AI_PROVIDER
    || process.env.AI_MODE
    || 'vllm';
}

function looksLikeVllmModel(model) {
  return /qwen|gpt-oss|laia/i.test(String(model || ''));
}

function resolveAnalysisModel(explicitModel, provider = resolveAnalysisProvider()) {
  if (provider === 'nvidia') {
    if (explicitModel && !looksLikeVllmModel(explicitModel)) return explicitModel;
    return process.env.AI_MODEL_NVIDIA || NVIDIA_MODEL;
  }
  if (provider === 'vllm') {
    return explicitModel || process.env.AI_MODEL || VLLM_MODEL;
  }
  return explicitModel || null;
}

const ENABLED = process.env.AI_ENABLED !== 'false';
const TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '120000', 10);
const CHAT_TIMEOUT_MS = parseInt(process.env.AI_CHAT_TIMEOUT_MS || process.env.AI_TIMEOUT_MS || '300000', 10);
const REPORT_TIMEOUT_MS = parseInt(process.env.AI_REPORT_TIMEOUT_MS || '300000', 10);
const TRACK_COSTS = process.env.AI_TRACK_COSTS !== 'false';

const KIMI_MODEL = 'moonshotai/kimi-k2.6';

const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'opus';
const CLAUDE_MODEL_FALLBACKS = (process.env.CLAUDE_MODEL_FALLBACKS ?? 'sonnet,haiku')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const VLLM_URL = process.env.AI_API_URL || 'https://llms.laia.ar/v1';
const VLLM_KEY = process.env.AI_API_KEY || '';
const VLLM_MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-14B-Instruct-AWQ';

const NVIDIA_URL = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_MODEL = process.env.AI_MODEL_NVIDIA || KIMI_MODEL;

// Pricing per 1M tokens. ESTIMATES ONLY. Real claude-code billing is via subscription.
const MODEL_PRICING = {
  'qwen': { input: 0, output: 0 },
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
};

let totalStats = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0, durationMs: 0 };

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

function normalizeModelKey(modelKey) {
  if (modelKey === 'claude-sonnet') return 'claude-sonnet-4-6';
  if (modelKey === 'claude-haiku') return 'claude-haiku-4-5';
  if (modelKey === 'claude-opus') return 'claude-opus-4-7';
  return modelKey;
}

function estimateCost(modelKey, inputTokens, outputTokens) {
  const normalized = normalizeModelKey(modelKey);
  const pricing = MODEL_PRICING[normalized] || { input: 0, output: 0 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

function providerDisplayName(provider) {
  if (provider === 'vllm') return 'LAIA';
  if (provider === 'nvidia') return 'NVIDIA';
  if (provider === 'claude-code') return 'Claude';
  return provider;
}

function getAnalysisModelInfo() {
  const provider = resolveAnalysisProvider();
  if (provider === 'claude-code') {
    return { provider: 'claude-code', providerLabel: 'Claude', model: CLAUDE_MODEL };
  }
  if (provider === 'nvidia') {
    return {
      provider: 'nvidia',
      providerLabel: 'NVIDIA',
      model: process.env.AI_MODEL_NVIDIA || NVIDIA_MODEL,
    };
  }
  return { provider: 'vllm', providerLabel: 'LAIA', model: process.env.AI_MODEL || VLLM_MODEL };
}

function logAnalysisLlm(scope = 'AI-ANALYSIS') {
  const info = getAnalysisModelInfo();
  console.log(`[${scope}] LLM: ${info.providerLabel} | ${info.model}`);
  return info;
}

function logTokenUsage(modelKey, inputTokens, outputTokens, label = '', durationMs = null, providerLabel = '') {
  if (!TRACK_COSTS) return;
  const cost = estimateCost(modelKey, inputTokens, outputTokens);
  totalStats.inputTokens += inputTokens;
  totalStats.outputTokens += outputTokens;
  totalStats.cost += cost;
  totalStats.calls += 1;
  if (Number.isFinite(durationMs)) totalStats.durationMs += durationMs;
  const costStr = cost > 0 ? ` (~$${cost.toFixed(6)} est)` : ' (free)';
  const timeStr = Number.isFinite(durationMs) ? ` | ${formatDuration(durationMs)}` : '';
  const tag = label ? ` | ${label}` : '';
  const providerPrefix = providerLabel ? `${providerLabel} | ` : '';
  console.log(`[AI-COST] ${providerPrefix}${modelKey} | in: ${inputTokens} | out: ${outputTokens}${timeStr}${costStr}${tag}`);
}

function makeCompletionStats(cfg, model, durationMs, inputTokens, outputTokens) {
  return {
    provider: cfg.provider || cfg.providerTag || 'unknown',
    provider_label: cfg.providerLabel || providerDisplayName(cfg.provider || cfg.providerTag),
    model,
    duration_ms: durationMs,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  };
}

function logLlmCall(providerLabel, model, label, promptSizeKB, inputTokens) {
  const tag = label ? ` | ${label}` : '';
  const size = promptSizeKB != null
    ? ` | prompt: ${promptSizeKB}KB (${inputTokens} tokens)`
    : (inputTokens != null ? ` | ${inputTokens} tokens` : '');
  console.log(`[AI-CALL] ${providerLabel} | ${model}${tag}${size}`);
}

function getTokenStats() {
  return { ...totalStats };
}

function resetTokenStats() {
  totalStats = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0, durationMs: 0 };
}

function buildClaudeModelCandidates() {
  const primary = CLAUDE_MODEL;
  const fallbacks = CLAUDE_MODEL_FALLBACKS.filter((m) => m !== primary);
  return [primary, ...fallbacks];
}

function isClaudeQuotaMessage(s) {
  return /quota|usage limit|reset at|out of credits|exceeded|please upgrade/i.test(s || '');
}

async function completeOpenAiCompatible(messages, options = {}, cfg = {}) {
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 4096;
  const label = options.label || '';
  const model = options.model || cfg.model;
  const baseUrl = cfg.baseUrl;
  const apiKey = cfg.apiKey || '';
  const providerTag = cfg.providerTag || 'openai-compat';
  const providerLabel = cfg.providerLabel || providerDisplayName(cfg.provider || providerTag);
  const maxRetries = parseInt(process.env.AI_FETCH_RETRIES || '3', 10);

  const inputText = messages.map((m) => m.content).join(' ');
  const inputTokens = estimateTokens(inputText);
  const promptSizeKB = (inputText.length / 1024).toFixed(1);
  logLlmCall(providerLabel, model, label, promptSizeKB, inputTokens);

  const timeoutMs = (label.startsWith('reportaje:') || inputText.length / 1024 > 10)
    ? REPORT_TIMEOUT_MS
    : TIMEOUT_MS;

  function isRetryableNetworkError(err) {
    return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|AbortError|socket hang up/i.test(err.message || '');
  }

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const t0 = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '(could not read body)');
        throw new Error(
          `[${providerTag}] HTTP ${res.status} ${res.statusText}\n` +
          `  url: ${baseUrl}/chat/completions | model: ${model}\n` +
          `  prompt: ${promptSizeKB}KB (${inputTokens} tokens) | maxTokens: ${maxTokens}\n` +
          `  response: ${body.slice(0, 1000)}`
        );
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`[${providerTag}] Empty or malformed response: ${JSON.stringify(data).slice(0, 500)}`);
      }
      const output = content.trim();
      const usage = data.usage || {};
      const outputTokens = usage.completion_tokens || estimateTokens(output);
      const resolvedInputTokens = usage.prompt_tokens || inputTokens;
      const durationMs = Date.now() - t0;
      logTokenUsage(model, resolvedInputTokens, outputTokens, label, durationMs, providerLabel);
      return {
        content: output,
        stats: makeCompletionStats(cfg, model, durationMs, resolvedInputTokens, outputTokens),
      };
    } catch (err) {
      lastErr = err.name === 'AbortError'
        ? new Error(`[${providerTag}] Timeout after ${timeoutMs / 1000}s on ${baseUrl}`)
        : err;
      if (attempt < maxRetries && isRetryableNetworkError(lastErr)) {
        const delay = 2000 * (attempt + 1);
        console.warn(`[AI-WARN] ${label || providerTag} network error — retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw lastErr;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr || new Error(`[${providerTag}] request failed`);
}

async function completeVllm(messages, options = {}) {
  return completeOpenAiCompatible(messages, options, {
    baseUrl: VLLM_URL,
    apiKey: VLLM_KEY,
    model: options.model || process.env.AI_MODEL || VLLM_MODEL,
    providerTag: 'vllm',
    provider: 'vllm',
    providerLabel: 'LAIA',
  });
}

async function completeNvidia(messages, options = {}) {
  if (!NVIDIA_KEY) {
    throw new Error('[nvidia] NVIDIA_API_KEY is required when AI_PROVIDER=nvidia');
  }
  return completeOpenAiCompatible(messages, options, {
    baseUrl: NVIDIA_URL,
    apiKey: NVIDIA_KEY,
    model: options.model || NVIDIA_MODEL,
    providerTag: 'nvidia',
    provider: 'nvidia',
    providerLabel: 'NVIDIA',
  });
}

function runClaudeOnce(model, prompt, timeoutMs, inputTokens, promptSizeKB, label) {
  const modelKey = normalizeModelKey(`claude-${model}`);
  const t0 = Date.now();
  return new Promise((resolve, reject) => {
    let proc;
    const timer = setTimeout(() => {
      if (proc) proc.kill('SIGTERM');
      reject(new Error(
        `[claude-code] Timeout after ${timeoutMs / 1000}s\n` +
        `  model: ${model} | prompt: ${promptSizeKB}KB (${inputTokens} tokens)`
      ));
    }, timeoutMs);

    proc = execFile(
      CLAUDE_BIN,
      ['-p', `--model=${model}`],
      { maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        clearTimeout(timer);
        const stderrTrim = (stderr || '').trim();
        const stdoutTrim = (stdout || '').trim();
        if (err) {
          const combined = `${stderrTrim}\n${stdoutTrim}`;
          const quotaHit = isClaudeQuotaMessage(combined);
          const detail = [
            `[claude-code] process failed (exit ${err.code ?? err.signal ?? 'unknown'})`,
            quotaHit ? '  quota or usage limit reached. Wait for reset or switch provider.' : '',
            `  model: ${model} | prompt: ${promptSizeKB}KB (${inputTokens} tokens)`,
            stderrTrim ? `  stderr: ${stderrTrim.slice(0, 1500)}` : '',
            stdoutTrim ? `  stdout (first 500): ${stdoutTrim.slice(0, 500)}` : '',
          ].filter(Boolean).join('\n');
          return reject(new Error(detail));
        }
        if (!stdoutTrim) {
          return reject(new Error(`[claude-code] Empty response for model ${model}`));
        }
        if (isClaudeQuotaMessage(stdoutTrim)) {
          return reject(new Error(`[claude-code] Quota reached: ${stdoutTrim.slice(0, 400)}`));
        }
        const outputTokens = estimateTokens(stdoutTrim);
        const durationMs = Date.now() - t0;
        logTokenUsage(modelKey, inputTokens, outputTokens, label, durationMs, 'Claude');
        resolve({
          content: stdoutTrim,
          stats: makeCompletionStats(
            { provider: 'claude-code', providerLabel: 'Claude' },
            modelKey,
            durationMs,
            inputTokens,
            outputTokens,
          ),
        });
      }
    );
    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}

async function completeClaudeCode(messages, options = {}) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n');
  const prompt = system ? `${system}\n\n${user}` : user;
  const label = options.label || '';

  const inputTokens = estimateTokens(prompt);
  const promptSizeKB = (prompt.length / 1024).toFixed(1);
  const timeoutMs = prompt.length / 1024 > 10 ? REPORT_TIMEOUT_MS : TIMEOUT_MS;

  const candidates = buildClaudeModelCandidates();
  let lastErr;
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    const isLast = i === candidates.length - 1;
    logLlmCall('Claude', model, label, promptSizeKB, inputTokens);
    console.log(`[AI-DEBUG] claude -p --model=${model} | timeout: ${timeoutMs / 1000}s`);
    try {
      const result = await runClaudeOnce(model, prompt, timeoutMs, inputTokens, promptSizeKB, label);
      return result;
    } catch (err) {
      lastErr = err;
      const isQuota = isClaudeQuotaMessage(err.message);
      if (isQuota && !isLast) {
        console.warn(`[AI-WARN] quota on ${model}, trying ${candidates[i + 1]}`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error('[claude-code] No model candidates available');
}

async function complete(messages, options = {}) {
  if (!ENABLED) throw new Error('AI_ENABLED is false');
  const provider = resolveAnalysisProvider();
  const model = resolveAnalysisModel(options.model, provider);
  const opts = { ...options, model };
  if (provider === 'claude-code') {
    try {
      return await completeClaudeCode(messages, opts);
    } catch (err) {
      if (process.env.AI_FALLBACK_VLLM_ON_CLAUDE_QUOTA === 'true' && isClaudeQuotaMessage(err.message)) {
        console.warn('[AI-WARN] Claude quota exhausted. Falling back to vllm.');
        return await completeVllm(messages, { ...opts, model: resolveAnalysisModel(opts.model, 'vllm') });
      }
      throw err;
    }
  }
  if (provider === 'vllm') {
    return await completeVllm(messages, opts);
  }
  if (provider === 'nvidia') {
    return await completeNvidia(messages, opts);
  }
  throw new Error(`[ai-client] Unknown AI_PROVIDER: ${provider}`);
}

function getChatModelInfo() {
  const provider = resolveChatProvider();
  if (provider === 'claude-code') {
    return { provider: 'claude-code', providerLabel: 'Claude', model: CLAUDE_MODEL };
  }
  if (provider === 'nvidia') {
    return {
      provider: 'nvidia',
      providerLabel: 'NVIDIA',
      model: process.env.AI_MODEL_NVIDIA || NVIDIA_MODEL,
    };
  }
  return { provider: 'vllm', providerLabel: 'LAIA', model: process.env.AI_MODEL || VLLM_MODEL };
}

async function chatCompleteOpenAi(messages, options = {}, cfg = {}) {
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 4096;
  const label = options.label || 'chat';
  const tools = options.tools;
  const model = cfg.model;
  const baseUrl = cfg.baseUrl;
  const apiKey = cfg.apiKey || '';
  const provider = cfg.provider || 'openai-compat';
  const providerLabel = cfg.providerLabel || providerDisplayName(provider);

  const inputText = messages.map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content))).join(' ');
  const inputTokensEst = estimateTokens(inputText);
  logLlmCall(providerLabel, model, label, (inputText.length / 1024).toFixed(1), inputTokensEst);
  const t0 = Date.now();
  const timeoutMs = options.timeoutMs
    || (tools?.length ? CHAT_TIMEOUT_MS : TIMEOUT_MS);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };
    if (tools?.length) {
      body.tools = tools;
      body.tool_choice = options.tool_choice || 'auto';
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`[${provider}-chat] HTTP ${res.status}: ${errBody.slice(0, 800)}`);
    }

    const data = await res.json();
    const msg = data?.choices?.[0]?.message || {};
    const content = msg.content || '';
    const durationMs = Date.now() - t0;
    const usage = data.usage || {};
    const inputTokens = usage.prompt_tokens || inputTokensEst;
    const outputTokens = usage.completion_tokens || estimateTokens(content + JSON.stringify(msg.tool_calls || []));
    const tokensPerSecond = durationMs > 0 ? outputTokens / (durationMs / 1000) : 0;

    logTokenUsage(model, inputTokens, outputTokens, label, durationMs, providerLabel);
    return {
      content: content.trim(),
      tool_calls: msg.tool_calls || [],
      raw: data,
      stats: {
        provider,
        providerLabel,
        model,
        duration_ms: durationMs,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        tokens_per_second: Math.round(tokensPerSecond * 10) / 10,
      },
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`[${providerLabel}] chat request timed out after ${Math.round(timeoutMs / 1000)}s`);
      timeoutErr.code = 'ETIMEDOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function chatCompleteVllm(messages, options = {}) {
  return chatCompleteOpenAi(messages, options, {
    baseUrl: VLLM_URL,
    apiKey: VLLM_KEY,
    model: VLLM_MODEL,
    provider: 'vllm',
    providerLabel: 'LAIA',
  });
}

async function chatCompleteNvidia(messages, options = {}) {
  if (!NVIDIA_KEY) {
    throw new Error('[nvidia] NVIDIA_API_KEY is required when CHAT_AI_PROVIDER=nvidia');
  }
  return chatCompleteOpenAi(messages, options, {
    baseUrl: NVIDIA_URL,
    apiKey: NVIDIA_KEY,
    model: NVIDIA_MODEL,
    provider: 'nvidia',
    providerLabel: 'NVIDIA',
  });
}

async function chatCompleteClaude(messages, options = {}) {
  const t0 = Date.now();
  const flat = messages.map((m) => {
    if (m.role === 'tool') return `[tool result ${m.tool_call_id}]: ${m.content}`;
    if (m.tool_calls) return `[assistant tool_calls]: ${JSON.stringify(m.tool_calls)} ${m.content || ''}`;
    return `[${m.role}]: ${m.content}`;
  }).join('\n\n');
  const toolsHint = options.tools?.length
    ? '\n\nIf you need a tool, respond ONLY with a fenced block:\n```tool\n{"name":"tool_name","arguments":{}}\n```\nOtherwise respond in markdown.'
    : '';
  const claudeResult = await completeClaudeCode([
    { role: 'user', content: flat + toolsHint },
  ], { label: options.label || 'chat' });
  const response = claudeResult.content;
  const claudeStats = claudeResult.stats || {};
  const durationMs = claudeStats.duration_ms ?? (Date.now() - t0);
  const outputTokens = claudeStats.output_tokens ?? estimateTokens(response);
  const inputTokens = claudeStats.input_tokens ?? estimateTokens(flat);
  const tokensPerSecond = durationMs > 0 ? outputTokens / (durationMs / 1000) : 0;
  const baseStats = {
    provider: claudeStats.provider || 'claude-code',
    providerLabel: claudeStats.provider_label || 'Claude',
    model: claudeStats.model || CLAUDE_MODEL,
    duration_ms: durationMs,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    tokens_per_second: Math.round(tokensPerSecond * 10) / 10,
  };

  const toolMatch = response.match(/```tool\s*\n([\s\S]*?)\n```/);
  if (toolMatch) {
    try {
      const parsed = JSON.parse(toolMatch[1]);
      return {
        content: '',
        tool_calls: [{
          id: `call_${Date.now()}`,
          type: 'function',
          function: { name: parsed.name, arguments: JSON.stringify(parsed.arguments || {}) },
        }],
        stats: baseStats,
      };
    } catch (_) { /* fall through */ }
  }
  return { content: response, tool_calls: [], stats: baseStats };
}

async function chatComplete(messages, options = {}) {
  if (!ENABLED) throw new Error('AI_ENABLED is false');
  const provider = resolveChatProvider();
  if (provider === 'claude-code') return chatCompleteClaude(messages, options);
  if (provider === 'nvidia') return chatCompleteNvidia(messages, options);
  return chatCompleteVllm(messages, options);
}

module.exports = {
  complete,
  chatComplete,
  getAnalysisModelInfo,
  logAnalysisLlm,
  getChatModelInfo,
  resolveAnalysisProvider,
  resolveChatProvider,
  resolveAnalysisModel,
  providerDisplayName,
  estimateTokens,
  estimateCost,
  normalizeModelKey,
  formatDuration,
  getTokenStats,
  resetTokenStats,
};
