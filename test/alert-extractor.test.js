'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseLlmResponse, extractJsonBlock } = require('../lib/analysis/alert-extractor');

test('extractJsonBlock from fenced json', () => {
  const raw = 'intro\n```json\n{"narratives":{}}\n```\noutro';
  const block = extractJsonBlock(raw);
  assert.ok(block.includes('"narratives"'));
});

test('parseLlmResponse parses narratives and quality', () => {
  const raw = `\`\`\`json
{
  "narratives": {
    "c1": {
      "narrative_citizen": { "es": "a", "en": "b" },
      "narrative_journalist": { "es": "c", "en": "d" },
      "claim_tokens": []
    }
  },
  "quality": [{ "check": "Q1", "ok": true, "notes": "" }]
}
\`\`\``;
  const parsed = parseLlmResponse(raw);
  assert.ok(parsed.narratives.c1);
  assert.equal(parsed.quality.length, 1);
});

test('parseLlmResponse throws on invalid JSON', () => {
  assert.throws(() => parseLlmResponse('```json\n{broken\n```'), /invalid JSON/);
});
