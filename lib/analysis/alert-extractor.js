// lib/analysis/alert-extractor.js
'use strict';

const CLAIM_TOKEN_RE = /\{\{claim:([^|]+)\|([^}]+)\}\}/g;

// Walks the text from startIdx looking for a balanced top-level JSON object.
// String/escape-aware so inner braces and triple-backticks inside string
// values don't fool the scanner — eliminates the silent-drop class of bugs
// caused by weak models emitting ``` inside story fields.
function extractJsonObject(text, startIdx = 0) {
  let i = startIdx;
  while (i < text.length && text[i] !== '{') i++;
  if (i >= text.length) return null;
  const start = i;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (escape) { escape = false; continue; }
    if (inStr) {
      if (c === '\\') escape = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Iterate every `fence` occurrence ("noticia" or "reportaje") and pull the
// balanced JSON object that follows. The closing ``` is ignored entirely,
// since by the time we have the balanced object we know the JSON ended.
function* iterateFencedJson(text, fence) {
  const opener = new RegExp('```' + fence + '\\s*', 'g');
  let m;
  while ((m = opener.exec(text)) !== null) {
    const jsonText = extractJsonObject(text, m.index + m[0].length);
    if (jsonText) yield jsonText;
  }
}

function resolveClaims(text) {
  const tokens = [];
  let m;
  while ((m = CLAIM_TOKEN_RE.exec(text)) !== null) {
    tokens.push({ claim_id: m[1].trim(), value: m[2].trim() });
  }
  return tokens;
}

function parseNoticias(llmText) {
  const results = [];
  for (const jsonText of iterateFencedJson(llmText, 'noticia')) {
    try {
      const item = JSON.parse(jsonText);
      if (!Array.isArray(item.claim_tokens) || item.claim_tokens.length === 0) {
        const storyText = (item.story?.es || '') + (item.story?.en || '');
        item.claim_tokens = resolveClaims(storyText);
      }
      results.push(item);
    } catch (_) {
      // malformed JSON — skip
    }
  }
  return results;
}

function parseLlmResponse(text) {
  return parseNoticias(text);
}

module.exports = {
  parseLlmResponse,
  parseNoticias,
  resolveClaims,
  extractJsonObject,
  iterateFencedJson,
};
