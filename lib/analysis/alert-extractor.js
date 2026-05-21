'use strict';

/**
 * Extract structured alert blocks from an LLM response.
 *
 * The LLM is asked to return a single fenced ```json block containing
 * narratives keyed by candidate_id. Layout:
 *
 *   ```json
 *   {
 *     "narratives": {
 *       "<candidate_id>": {
 *         "narrative_citizen":   { "es": "...", "en": "..." },
 *         "narrative_journalist":{ "es": "...", "en": "..." },
 *         "claim_tokens": [{ "claim_id": "...", "value": 4.2, "display_es": "...", "display_en": "..." }]
 *       }
 *     },
 *     "quality": [{ "check": "Q1", "ok": true, "notes": "" }, ...]
 *   }
 *   ```
 */

function extractJsonBlock(text) {
  const fence = /```json\s*([\s\S]*?)```/m;
  const match = text.match(fence);
  if (match) return match[1].trim();
  // Fallback: find the first { and last } that bound a JSON object.
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}

function parseLlmResponse(rawText) {
  if (!rawText) throw new Error('alert-extractor: empty LLM response');
  const block = extractJsonBlock(rawText);
  if (!block) throw new Error('alert-extractor: no JSON block found in LLM response');
  let parsed;
  try {
    parsed = JSON.parse(block);
  } catch (err) {
    throw new Error(`alert-extractor: invalid JSON in LLM response. ${err.message}`);
  }
  if (!parsed.narratives || typeof parsed.narratives !== 'object') {
    throw new Error('alert-extractor: missing narratives object');
  }
  return parsed;
}

module.exports = { parseLlmResponse, extractJsonBlock };
