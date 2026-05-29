'use strict';

const { pathForCountry } = require('../url-slug');

function pickBilingual(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.es || field.en || '';
}

function resolveCtaLink(alert) {
  if (!alert) return null;
  return pathForCountry(alert, alert.country) || alert._path || null;
}

function enrichStoryBlock(block, alertById) {
  if (!block || typeof block !== 'object') return block;
  const alert = block.noticia_id ? alertById.get(block.noticia_id) : null;
  if (!alert) return { ...block };
  const ctaLink = resolveCtaLink(alert);
  return {
    ...block,
    country_iso: block.country_iso || alert.country,
    claim_tokens: alert.claim_tokens || block.claim_tokens,
    ...(ctaLink ? { cta_link: ctaLink } : {}),
  };
}

/**
 * Bind hero/featured/orphan blocks to source noticias: canonical cta_link + claim_tokens.
 */
function enrichEditionFromAlerts(edition, alerts) {
  if (!edition || typeof edition !== 'object') return edition;
  const alertById = new Map(
    (alerts || []).filter((a) => a?.id).map((a) => [a.id, a]),
  );
  const out = { ...edition };
  if (out.hero) out.hero = enrichStoryBlock(out.hero, alertById);
  if (Array.isArray(out.featured)) {
    out.featured = out.featured.map((item) => enrichStoryBlock(item, alertById));
  }
  if (out.orphan) out.orphan = enrichStoryBlock(out.orphan, alertById);
  return out;
}

module.exports = {
  enrichEditionFromAlerts,
  enrichStoryBlock,
  pickBilingual,
  resolveCtaLink,
};
