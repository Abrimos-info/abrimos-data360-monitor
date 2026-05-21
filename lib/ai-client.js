'use strict';

/**
 * Multi-provider LLM client with cost tracking and model fallbacks.
 *
 * Providers:
 *   AI_PROVIDER=claude-code   Use the Claude CLI binary via subprocess.
 *                             Billing is the Abrimos Claude subscription.
 *   AI_PROVIDER=vllm          Hit an OpenAI-compatible vLLM endpoint (LAIA / Qwen).
 *                             Free.
 *
 * Selected via the AI_PROVIDER environment variable. Other env knobs:
 *   AI_ENABLED                "true" to enable any call (kill switch)
 *   AI_MODEL                  Model name for vllm
 *   AI_API_URL                Base URL for vllm
 *   AI_API_KEY                Bearer token for vllm
 *   CLAUDE_BIN                Path to the Claude CLI shim
 *   CLAUDE_MODEL              Primary Claude model (sonnet / haiku / opus). Default sonnet.
 *   CLAUDE_MODEL_FALLBACKS    CSV of fallback models when primary fails. Default "sonnet,haiku".
 *   AI_TIMEOUT_MS             Default per-call timeout in ms (120000)
 *   AI_REPORT_TIMEOUT_MS      Timeout for large prompts (300000)
 *   AI_TRACK_COSTS            "false" to silence cost logs
 *
 * Public API:
 *   complete(messages, opts) returns the model response as a string.
 *   getTokenStats() returns cumulative token and cost counters.
 *   estimateTokens(text) rough char-based estimator (4 chars per token).
 */

const { execFile } = require('child_process');

const PROVIDER = process.env.AI_PROVIDER || 'claude-code';
const ENABLED = process.env.AI_ENABLED !== 'false';
const TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '120000', 10);
const REPORT_TIMEOUT_MS = parseInt(process.env.AI_REPORT_TIMEOUT_MS || '300000', 10);
const TRACK_COSTS = process.env.AI_TRACK_COSTS !== 'false';

const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'opus';
const CLAUDE_MODEL_FALLBACKS = (process.env.CLAUDE_MODEL_FALLBACKS ?? 'sonnet,haiku')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const VLLM_URL = process.env.AI_API_URL || 'https://llms.laia.ar/v1';
const VLLM_KEY = process.env.AI_API_KEY || '';
const VLLM_MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-14B-Instruct-AWQ';

// Pricing per 1M tokens. ESTIMATES ONLY. Real claude-code billing is via subscription.
const MODEL_PRICING = {
  'qwen': { input: 0, output: 0 },
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
};

let totalStats = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };

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

function logTokenUsage(modelKey, inputTokens, outputTokens, label = '') {
  if (!TRACK_COSTS) return;
  const cost = estimateCost(modelKey, inputTokens, outputTokens);
  totalStats.inputTokens += inputTokens;
  totalStats.outputTokens += outputTokens;
  totalStats.cost += cost;
  totalStats.calls += 1;
  const costStr = cost > 0 ? ` (~$${cost.toFixed(6)} est)` : ' (free)';
  const tag = label ? ` | ${label}` : '';
  console.log(`[AI-COST] ${modelKey} | in: ${inputTokens} | out: ${outputTokens}${costStr}${tag}`);
}

function getTokenStats() {
  return { ...totalStats };
}

function resetTokenStats() {
  totalStats = { inputTokens: 0, outputTokens: 0, cost: 0, calls: 0 };
}

function buildClaudeModelCandidates() {
  const primary = CLAUDE_MODEL;
  const fallbacks = CLAUDE_MODEL_FALLBACKS.filter((m) => m !== primary);
  return [primary, ...fallbacks];
}

function isClaudeQuotaMessage(s) {
  return /quota|usage limit|reset at|out of credits|exceeded|please upgrade/i.test(s || '');
}

async function completeVllm(messages, options = {}) {
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 4096;
  const label = options.label || '';

  const inputText = messages.map((m) => m.content).join(' ');
  const inputTokens = estimateTokens(inputText);
  const promptSizeKB = (inputText.length / 1024).toFixed(1);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${VLLM_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(VLLM_KEY ? { 'Authorization': `Bearer ${VLLM_KEY}` } : {}),
      },
      body: JSON.stringify({ model: VLLM_MODEL, messages, temperature, max_tokens: maxTokens }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '(could not read body)');
      throw new Error(
        `[vllm] HTTP ${res.status} ${res.statusText}\n` +
        `  url: ${VLLM_URL}/chat/completions | model: ${VLLM_MODEL}\n` +
        `  prompt: ${promptSizeKB}KB (${inputTokens} tokens) | maxTokens: ${maxTokens}\n` +
        `  response: ${body.slice(0, 1000)}`
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`[vllm] Empty or malformed response: ${JSON.stringify(data).slice(0, 500)}`);
    }
    const output = content.trim();
    const outputTokens = estimateTokens(output);
    logTokenUsage(VLLM_MODEL, inputTokens, outputTokens, label);
    return output;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`[vllm] Timeout after ${TIMEOUT_MS / 1000}s on ${VLLM_URL}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function runClaudeOnce(model, prompt, timeoutMs, inputTokens, promptSizeKB, label) {
  const modelKey = normalizeModelKey(`claude-${model}`);
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
        logTokenUsage(modelKey, inputTokens, outputTokens, label);
        resolve(stdoutTrim);
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
    console.log(`[AI-DEBUG] claude -p --model=${model} | prompt: ${promptSizeKB}KB (${inputTokens} tokens) | timeout: ${timeoutMs / 1000}s`);
    try {
      return await runClaudeOnce(model, prompt, timeoutMs, inputTokens, promptSizeKB, label);
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
  if (PROVIDER === 'claude-code') {
    try {
      return await completeClaudeCode(messages, options);
    } catch (err) {
      if (process.env.AI_FALLBACK_VLLM_ON_CLAUDE_QUOTA === 'true' && isClaudeQuotaMessage(err.message)) {
        console.warn('[AI-WARN] Claude quota exhausted. Falling back to vllm.');
        return await completeVllm(messages, options);
      }
      throw err;
    }
  }
  if (PROVIDER === 'vllm') {
    return await completeVllm(messages, options);
  }
  throw new Error(`[ai-client] Unknown AI_PROVIDER: ${PROVIDER}`);
}

module.exports = {
  complete,
  estimateTokens,
  estimateCost,
  normalizeModelKey,
  getTokenStats,
  resetTokenStats,
};
