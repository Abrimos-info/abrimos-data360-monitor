'use strict';

/**
 * Build llm_debug metadata persisted on Noticias / Reportajes.
 * @param {Array<{ phase: string, provider: string, provider_label: string, model: string, duration_ms: number, input_tokens: number, output_tokens: number }|null|undefined>} steps
 */
function buildLlmDebug(steps) {
  const normalized = (steps || [])
    .filter(Boolean)
    .map((s) => ({
      phase: s.phase,
      provider: s.provider,
      provider_label: s.provider_label,
      model: s.model,
      duration_ms: s.duration_ms ?? 0,
      input_tokens: s.input_tokens ?? 0,
      output_tokens: s.output_tokens ?? 0,
    }));
  if (!normalized.length) return undefined;

  const totals = normalized.reduce(
    (acc, s) => ({
      duration_ms: acc.duration_ms + s.duration_ms,
      input_tokens: acc.input_tokens + s.input_tokens,
      output_tokens: acc.output_tokens + s.output_tokens,
    }),
    { duration_ms: 0, input_tokens: 0, output_tokens: 0 },
  );

  const primary = normalized[0];
  return {
    provider: primary.provider,
    provider_label: primary.provider_label,
    model: primary.model,
    ...totals,
    steps: normalized,
  };
}

function llmStep(phase, stats) {
  if (!stats) return null;
  return {
    phase,
    provider: stats.provider,
    provider_label: stats.provider_label,
    model: stats.model,
    duration_ms: stats.duration_ms,
    input_tokens: stats.input_tokens,
    output_tokens: stats.output_tokens,
  };
}

module.exports = { buildLlmDebug, llmStep };
