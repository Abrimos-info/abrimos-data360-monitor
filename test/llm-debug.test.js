'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildLlmDebug, llmStep } = require('../lib/analysis/llm-debug');

test('buildLlmDebug aggregates totals and keeps per-step breakdown', () => {
  const debug = buildLlmDebug([
    llmStep('narrate', {
      provider: 'nvidia',
      provider_label: 'NVIDIA',
      model: 'moonshotai/kimi-k2.6',
      duration_ms: 12000,
      input_tokens: 8000,
      output_tokens: 1500,
    }),
    llmStep('translate', {
      provider: 'nvidia',
      provider_label: 'NVIDIA',
      model: 'moonshotai/kimi-k2.6',
      duration_ms: 3000,
      input_tokens: 2000,
      output_tokens: 400,
    }),
  ]);

  assert.equal(debug.provider, 'nvidia');
  assert.equal(debug.provider_label, 'NVIDIA');
  assert.equal(debug.model, 'moonshotai/kimi-k2.6');
  assert.equal(debug.duration_ms, 15000);
  assert.equal(debug.input_tokens, 10000);
  assert.equal(debug.output_tokens, 1900);
  assert.equal(debug.steps.length, 2);
  assert.equal(debug.steps[0].phase, 'narrate');
  assert.equal(debug.steps[1].phase, 'translate');
});

test('buildLlmDebug returns undefined when no steps', () => {
  assert.equal(buildLlmDebug([]), undefined);
  assert.equal(buildLlmDebug([null, undefined]), undefined);
});

test('validateAlert accepts optional llm_debug on noticia', () => {
  const { validateAlert } = require('../lib/analysis/quality-validator');
  const item = {
    content_type: 'noticia',
    id: 'noticia_test_ARG_X_2024_1',
    title: { es: 'Aumentó la inflación en Argentina', en: 'Inflation rose in Argentina' },
    lead: { es: 'Resumen breve.', en: 'Brief summary.' },
    story: { es: 'x'.repeat(250), en: 'y'.repeat(250) },
    countries: ['ARG'],
    dataset_id: 'WB_WDI',
    indicator: { idno: 'WB_WDI_FP_CPI_TOTL_ZG', database_id: 'WB_WDI', name: { es: 'x', en: 'x' } },
    observation: { value: '5', time_period: '2024', unit: '%' },
    chart_series: [{ period: '2024', value: 5 }],
    verification_trace: {
      data360_dataset_url: 'https://data360.worldbank.org/en/int/dataset/WB_WDI',
      csv_link: 'https://data360files.worldbank.org/data360-data/data/WB_WDI/WB_WDI_FP_CPI_TOTL_ZG.csv',
    },
    score: 0.9,
    detected_at: '2026-05-22T12:00:00Z',
    claim_tokens: [{ claim_id: 'abc123', value: '5' }],
    llm_debug: buildLlmDebug([
      llmStep('narrate', {
        provider: 'vllm',
        provider_label: 'LAIA',
        model: 'Qwen/Qwen2.5-14B-Instruct-AWQ',
        duration_ms: 5000,
        input_tokens: 1000,
        output_tokens: 200,
      }),
    ]),
  };
  const { ok, failures } = validateAlert(item, new Set(['abc123']));
  assert.equal(ok, true, failures.map((f) => f.notes).join('; '));
});
