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

function formatLlmDebugSummary(llmDebug) {
  if (!llmDebug || typeof llmDebug !== 'object') return '';
  const label = llmDebug.provider_label || llmDebug.provider || '';
  const model = llmDebug.model || '';
  if (label && model) return `${label} · ${model}`;
  return label || model || '';
}

function formatDurationMs(ms, lang) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n < 1000) return `${Math.round(n)} ms`;
  const sec = Math.round(n / 1000);
  if (sec < 60) return lang === 'en' ? `${sec}s` : `${sec} s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return lang === 'en' ? `${min}m ${rem}s` : `${min} min ${rem} s`;
}

function detectTypeFromAlertId(id) {
  if (!id || typeof id !== 'string') return null;
  if (id.includes('abrupt_change')) return 'abrupt_change';
  if (id.includes('anomaly')) return 'anomaly';
  return null;
}

/**
 * Rows for the article production disclaimer (from alert.json fields).
 * @param {object} alert
 * @param {string} lang
 * @param {(key: string, lang: string) => string} translate
 */
function buildProductionMetaRows(alert, lang, translate) {
  if (!alert || typeof alert !== 'object') return [];
  const t = typeof translate === 'function' ? translate : () => '';
  const rows = [];

  if (alert.indicator?.idno) {
    rows.push({
      label: t('article.production.indicator', lang),
      value: alert.indicator.idno,
      mono: true,
    });
  }

  const detType = detectTypeFromAlertId(alert.id);
  if (detType) {
    rows.push({
      label: t('article.production.detection', lang),
      value: t(`type.${detType}`, lang),
    });
  }

  if (alert.detected_at) {
    rows.push({
      label: t('article.production.detected', lang),
      value: alert.detected_at,
      isTime: true,
    });
  }

  if (alert.quality_status) {
    const qKey = `article.production.quality_${alert.quality_status}`;
    const qLabel = t(qKey, lang);
    rows.push({
      label: t('article.production.quality', lang),
      value: qLabel !== qKey ? qLabel : alert.quality_status,
    });
  }

  const dbg = alert.llm_debug;
  if (dbg) {
    const summary = formatLlmDebugSummary(dbg);
    if (summary) {
      rows.push({
        label: t('article.production.model', lang),
        value: summary,
        title: formatLlmDebugTitle(dbg),
      });
    }
    if (dbg.duration_ms != null) {
      rows.push({
        label: t('article.production.duration', lang),
        value: formatDurationMs(dbg.duration_ms, lang),
      });
    }
    if (dbg.input_tokens != null) {
      rows.push({
        label: t('article.production.tokens_in', lang),
        value: String(dbg.input_tokens),
        mono: true,
      });
    }
    if (dbg.output_tokens != null) {
      rows.push({
        label: t('article.production.tokens_out', lang),
        value: String(dbg.output_tokens),
        mono: true,
      });
    }
  }

  return rows;
}

function formatLlmDebugTitle(llmDebug) {
  if (!llmDebug || !Array.isArray(llmDebug.steps)) return '';
  return llmDebug.steps.map((s) => {
    const parts = [
      s.phase,
      s.provider_label || s.provider,
      s.model,
      `in ${s.input_tokens ?? 0}`,
      `out ${s.output_tokens ?? 0}`,
      `${s.duration_ms ?? 0}ms`,
    ].filter(Boolean);
    return parts.join(' · ');
  }).join('\n');
}

module.exports = {
  buildLlmDebug,
  llmStep,
  formatDurationMs,
  detectTypeFromAlertId,
  buildProductionMetaRows,
  formatLlmDebugSummary,
  formatLlmDebugTitle,
};
