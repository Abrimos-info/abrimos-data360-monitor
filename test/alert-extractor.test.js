// test/alert-extractor.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseLlmResponse } = require('../lib/analysis/alert-extractor');

const SAMPLE_LLM_OUTPUT = `
Análisis completado.

\`\`\`noticia
{
  "content_type": "noticia",
  "id": "noticia_abrupt_ARG_FAO_CP_23012_2026-01_001",
  "title": { "es": "IPC sube", "en": "CPI rises" },
  "lead": { "es": "El IPC subió.", "en": "CPI rose." },
  "story": { "es": "{{claim:abc123|128.5}} es el valor más reciente.", "en": "{{claim:abc123|128.5}} is the latest value." },
  "country": "ARG",
  "dataset_id": "FAO_CP",
  "indicator": { "idno": "FAO_CP_23012", "database_id": "FAO_CP", "name": { "es": "IPC", "en": "CPI" } },
  "claim_tokens": [{ "claim_id": "abc123", "value": "128.5" }],
  "verification_trace": { "data360_dataset_url": "https://data360.worldbank.org/en/int/dataset/FAO_CP", "csv_link": "https://data360files.worldbank.org/data360-data/data/FAO_CP/FAO_CP_23012.csv" },
  "score": 0.7,
  "detected_at": "2026-05-22T12:00:00.000Z"
}
\`\`\`
`;

test('parseLlmResponse extracts noticia block', () => {
  const items = parseLlmResponse(SAMPLE_LLM_OUTPUT);
  assert.equal(items.length, 1);
  assert.equal(items[0].content_type, 'noticia');
  assert.equal(items[0].id, 'noticia_abrupt_ARG_FAO_CP_23012_2026-01_001');
  assert.deepEqual(items[0].claim_tokens, [{ claim_id: 'abc123', value: '128.5' }]);
});

test('parseLlmResponse skips malformed JSON', () => {
  const items = parseLlmResponse('\`\`\`noticia\n{bad json\n\`\`\`');
  assert.equal(items.length, 0);
});

test('parseNoticias auto-derives claim_tokens from story text when missing', () => {
  const { parseNoticias } = require('../lib/analysis/alert-extractor');
  const llmOutput = '\`\`\`noticia\n' + JSON.stringify({
    content_type: 'noticia',
    story: { es: 'Valor: {{claim:foo|42.0}}', en: 'Value: 42.0' },
    claim_tokens: [],
  }) + '\n\`\`\`';
  const items = parseNoticias(llmOutput);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0].claim_tokens, [{ claim_id: 'foo', value: '42.0' }]);
});

test('parseNoticias tolerates triple-backticks inside string fields', () => {
  const { parseNoticias } = require('../lib/analysis/alert-extractor');
  // Story contains ``` inside the value — the old regex-based parser would
  // close on the first inner fence and silently drop the noticia. The
  // brace-balanced parser walks the JSON correctly and ignores fences inside
  // string values.
  const body = {
    content_type: 'noticia',
    id: 'noticia_fence_test',
    title: { es: 'Titulo', en: 'Title' },
    story: { es: 'Considera el bloque \`\`\`tabla\\n... ejemplo ...\\n\`\`\`', en: 'See table' },
    claim_tokens: [],
  };
  const llmOutput = '\`\`\`noticia\n' + JSON.stringify(body) + '\n\`\`\`\nTrailing prose.';
  const items = parseNoticias(llmOutput);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'noticia_fence_test');
});

test('parseNoticias recovers when closing fence is missing', () => {
  const { parseNoticias } = require('../lib/analysis/alert-extractor');
  // Truncated model output: no closing ```. As long as the JSON object is
  // balanced, we still extract it.
  const body = { content_type: 'noticia', id: 'noticia_truncated', title: { es: 'A', en: 'A' }, claim_tokens: [] };
  const llmOutput = '\`\`\`noticia\n' + JSON.stringify(body) + '\n';
  const items = parseNoticias(llmOutput);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'noticia_truncated');
});

test('extractJsonObject is brace-balanced and string-aware', () => {
  const { extractJsonObject } = require('../lib/analysis/alert-extractor');
  const text = 'prefix { "outer": { "inner": "}}" } } suffix';
  assert.equal(extractJsonObject(text), '{ "outer": { "inner": "}}" } }');
});

test('parseNoticias coerces observation.value and claim_tokens[].value to string', () => {
  const { parseNoticias } = require('../lib/analysis/alert-extractor');
  // Weak models often emit observation.value as a JSON number; the schema
  // requires a string (Data360 OBS_VALUE convention). Quietly coerce so the
  // Q2 schema check passes and we don't drop the whole noticia.
  const body = {
    content_type: 'noticia',
    id: 'noticia_coerce_test',
    title: { es: 'A', en: 'A' },
    observation: { value: 123.45, time_period: '2024', unit: 'IX' },
    claim_tokens: [{ claim_id: 'abc', value: 7 }],
    chart_series: [{ period: '2024', value: '42.5' }],
  };
  const llmOutput = '\`\`\`noticia\n' + JSON.stringify(body) + '\n\`\`\`';
  const [item] = parseNoticias(llmOutput);
  assert.equal(item.observation.value, '123.45');
  assert.equal(item.claim_tokens[0].value, '7');
  assert.equal(item.chart_series[0].value, 42.5);
});
