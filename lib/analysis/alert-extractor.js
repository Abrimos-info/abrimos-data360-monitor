// lib/analysis/alert-extractor.js
'use strict';

const NOTICIA_BLOCK_RE = /```noticia\s*([\s\S]*?)```/g;
const CLAIM_TOKEN_RE = /\{\{claim:([^|]+)\|([^}]+)\}\}/g;

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
  let m;
  while ((m = NOTICIA_BLOCK_RE.exec(llmText)) !== null) {
    try {
      const item = JSON.parse(m[1].trim());
      // Collect claim_tokens from story text if not explicitly listed
      if (!Array.isArray(item.claim_tokens) || item.claim_tokens.length === 0) {
        const storyText = (item.story?.es || '') + (item.story?.en || '');
        item.claim_tokens = resolveClaims(storyText);
      }
      results.push(item);
    } catch (e) {
      // malformed JSON block — skip
    }
  }
  return results;
}

// Keep parseLlmResponse as the canonical export used by runner.js
function parseLlmResponse(text) {
  return parseNoticias(text);
}

module.exports = { parseLlmResponse, parseNoticias, resolveClaims };
