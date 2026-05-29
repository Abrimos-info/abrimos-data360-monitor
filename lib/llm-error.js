'use strict';

/** @typedef {'quota'|'auth'|'docker'|'timeout'|'empty_response'|'network'|'http_error'|'process_exit'|'unknown'} LlmErrorKind */

const LLM_ERROR_HINTS = {
  quota: 'Cuota o rate limit. Esperá reset, bajá effort/modelo, o usá ANTHROPIC_API_KEY con billing.',
  auth: 'Sesión expirada o API key inválida. docker exec -it claude-cli claude auth login — o definí ANTHROPIC_API_KEY.',
  docker: 'Contenedor Claude no corre. docker compose up -d claude-cli',
  timeout: 'Prompt muy largo o LLM lento. Subí AI_TIMEOUT_MS / AI_REPORT_TIMEOUT_MS o reducí contexto.',
  empty_response: 'El modelo devolvió stdout vacío. Reintentar o cambiar modelo.',
  network: 'Error de red hacia la API. Revisar conectividad y reintentar.',
  http_error: 'HTTP error desde Anthropic/NVIDIA. Ver status en el log.',
  process_exit: 'CLI claude salió con error. Correr prueba manual (ver hint en log).',
  unknown: 'Ver stderr/stdout completos en el log o correr prueba manual del provider.',
};

/**
 * Classify LLM failure text into a stable kind for grep and run summaries.
 * @param {string|Error} input
 * @param {{ stderr?: string, stdout?: string, body?: string, exitCode?: number|string, transport?: string, httpStatus?: number|string }} [meta]
 */
function classifyLlmError(input, meta = {}) {
  const msg = typeof input === 'string' ? input : (input?.message || String(input || ''));
  const stderr = meta.stderr || '';
  const stdout = meta.stdout || '';
  const body = meta.body || '';
  const exitCode = meta.exitCode ?? meta.code;
  const httpStatus = meta.httpStatus
    ?? (msg.match(/HTTP (\d{3})/i) || body.match(/HTTP (\d{3})/i) || [])[1];
  const combined = [msg, stderr, stdout, body].join('\n');
  const lower = combined.toLowerCase();

  let kind = /** @type {LlmErrorKind} */ ('unknown');
  let subkind = '';

  if (/timeout after|etimedout|aborterror|timed out|signal.*term/i.test(combined)) {
    kind = 'timeout';
  } else if (/quota|usage limit|rate.?limit|out of credits|exceeded|please upgrade|529 overloaded/i.test(lower)
    || httpStatus === '429' || httpStatus === '529') {
    kind = 'quota';
  } else if (/auth login|not authenticated|invalid.*api.?key|unauthorized|authentication required|401/i.test(lower)
    || httpStatus === '401' || httpStatus === '403') {
    kind = 'auth';
  } else if (/container.*not running|docker not found|no local claude and docker/i.test(lower)) {
    kind = 'docker';
  } else if (/empty response/i.test(lower)) {
    kind = 'empty_response';
  } else if (/fetch failed|econnreset|enotfound|eai_again|socket hang up|network error/i.test(lower)) {
    kind = 'network';
  } else if (/process failed \(exit|\[claude-code\] process failed|\[anthropic\] http/i.test(combined)
    || (exitCode != null && exitCode !== 0)) {
    kind = 'process_exit';
    const stderrLines = stderr.trim().split('\n').filter(Boolean);
    const onlyWrapper = stderrLines.length > 0
      && stderrLines.every((line) => /^\[claude-wrapper\]/i.test(line))
      && !stdout.trim()
      && !body.trim();
    if (onlyWrapper) subkind = 'cli_silent_exit';
    else if (/^\[anthropic\] http/i.test(msg)) kind = 'http_error';
  } else if (httpStatus && Number(httpStatus) >= 400) {
    kind = 'http_error';
  }

  const hint = subkind === 'cli_silent_exit'
    ? 'CLI salió sin mensaje (Docker). Prueba: echo OK | docker exec -i claude-cli claude -p --model=opus'
    : LLM_ERROR_HINTS[kind];

  return {
    kind,
    subkind: subkind || undefined,
    hint,
    transport: meta.transport || undefined,
    exitCode: exitCode != null ? String(exitCode) : undefined,
    httpStatus: httpStatus != null ? String(httpStatus) : undefined,
  };
}

function formatLlmErrorLog(classification, { label, model, idno } = {}) {
  const parts = [
    `[AI-ERROR] kind=${classification.kind}`,
    classification.subkind ? `subkind=${classification.subkind}` : '',
    classification.transport ? `transport=${classification.transport}` : '',
    model ? `model=${model}` : '',
    label ? `label=${label}` : '',
    idno ? `idno=${idno}` : '',
    classification.exitCode ? `exit=${classification.exitCode}` : '',
    classification.httpStatus ? `http=${classification.httpStatus}` : '',
    `hint=${classification.hint}`,
  ].filter(Boolean);
  return parts.join(' | ');
}

function enrichLlmError(err, meta = {}) {
  const classification = classifyLlmError(err, meta);
  if (err && typeof err === 'object') {
    err.llmError = classification;
  }
  return classification;
}

function createLlmErrorAccumulator() {
  const counts = {};
  const samples = {};
  return {
    record(classification, context = {}) {
      const key = classification.subkind
        ? `${classification.kind}:${classification.subkind}`
        : classification.kind;
      counts[key] = (counts[key] || 0) + 1;
      if (!samples[key]) {
        samples[key] = { classification, context };
      }
    },
    summaryLines() {
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      if (!total) return [];
      const breakdown = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `${k}:${n}`)
        .join(', ');
      const topKey = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const top = samples[topKey];
      return [
        `[analysis] LLM failures: ${total} total — ${breakdown}`,
        top ? `[analysis] LLM failure hint (top): ${top.classification.hint}` : '',
      ].filter(Boolean);
    },
  };
}

module.exports = {
  LLM_ERROR_HINTS,
  classifyLlmError,
  enrichLlmError,
  formatLlmErrorLog,
  createLlmErrorAccumulator,
};
