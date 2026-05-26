'use strict';

const fs = require('fs');
const path = require('path');
const ai = require('../ai-client');
const { iterateFencedJson, sanitizeNoticiaItem } = require('./alert-extractor');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PROMPTS_DIR = path.join(REPO_ROOT, 'lib', 'prompts');

function parseTranslateBlock(text) {
  for (const jsonText of iterateFencedJson(text, 'noticia-translate')) {
    try {
      return JSON.parse(jsonText);
    } catch (_) {}
  }
  return null;
}

function buildTranslatePrompt(noticia, contextClaimIds) {
  const system = fs.readFileSync(path.join(PROMPTS_DIR, 'noticia-translate.md'), 'utf8');
  const allowed = [...contextClaimIds];
  const user = [
    '## Noticia en español (fuente)',
    '',
    '```json',
    JSON.stringify({
      title: { es: noticia.title?.es },
      lead: { es: noticia.lead?.es },
      story: { es: noticia.story?.es },
      indicator_name: { es: noticia.indicator?.name?.es },
      claim_tokens: noticia.claim_tokens || [],
    }, null, 2),
    '```',
    '',
    '### allowed_claim_ids (PCN — no modificar ids)',
    '',
    ...allowed.map((id) => `- ${id}`),
    '',
    'Traducí title.en, lead.en, story.en, indicator_name.en y actualizá claim_tokens[].value al locale EN si corresponde.',
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function mergeTranslation(noticia, translated) {
  if (!translated) return noticia;
  const out = { ...noticia };
  out.title = { ...noticia.title, en: translated.title?.en || noticia.title?.en || '' };
  out.lead = { ...noticia.lead, en: translated.lead?.en || noticia.lead?.en || '' };
  out.story = { ...noticia.story, en: translated.story?.en || noticia.story?.en || '' };
  if (Array.isArray(translated.claim_tokens) && translated.claim_tokens.length) {
    out.claim_tokens = translated.claim_tokens;
  }
  if (out.indicator && translated.indicator_name?.en) {
    out.indicator = {
      ...out.indicator,
      name: { ...out.indicator.name, en: translated.indicator_name.en },
    };
  } else if (out.indicator?.name) {
    out.indicator = {
      ...out.indicator,
      name: { es: out.indicator.name.es, en: out.indicator.name.en || out.indicator.name.es },
    };
  }
  return sanitizeNoticiaItem(out);
}

async function translateNoticia(noticia, contextClaimIds, opts = {}) {
  if (opts.noTranslate) return noticia;
  const messages = buildTranslatePrompt(noticia, contextClaimIds);
  const label = `translate:${noticia.id || noticia.indicator?.idno || 'noticia'}`;
  const response = await ai.complete(messages, {
    label,
    model: process.env.AI_MODEL_TRANSLATE || process.env.AI_MODEL_NOTICIA,
  });
  const parsed = parseTranslateBlock(response);
  if (!parsed) {
    console.warn(`[noticia-translate] ${label}: no parseable noticia-translate block`);
    return noticia;
  }
  return mergeTranslation(noticia, parsed);
}

module.exports = {
  buildTranslatePrompt,
  translateNoticia,
  parseTranslateBlock,
  mergeTranslation,
};
