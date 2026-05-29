'use strict';

const { renderClaimMarkers, sanitizeClaimTokens } = require('../alert-display');
const { pickBilingual } = require('./enrich-edition');

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeHref(url) {
  if (!url || typeof url !== 'string') return null;
  const href = url.trim().replace(/[)\],.;]+$/, '');
  if (/^https?:\/\//i.test(href) || href.startsWith('/')) return href;
  return null;
}

function renderInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(MARKDOWN_LINK_RE, (full, label, url) => {
    const href = sanitizeHref(url);
    if (!href) return full;
    return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  });
}

function claimContextForAlert(alert) {
  if (!alert) return { claim_tokens: [] };
  return { claim_tokens: sanitizeClaimTokens(alert.claim_tokens || []) };
}

function renderNewsletterField(text, alert, lang) {
  if (!text) return '';
  const withClaims = renderClaimMarkers(text, claimContextForAlert(alert), lang);
  return renderInlineMarkdown(withClaims);
}

function buildDisplayEdition(edition, { getAlertById }, lang) {
  const heroAlert = edition.hero?.noticia_id ? getAlertById(edition.hero.noticia_id) : null;
  const greetingText = pickBilingual(edition.greeting, lang);

  return {
    greeting_html: renderNewsletterField(greetingText, null, lang),
    hero: edition.hero ? {
      title: pickBilingual(edition.hero.title, lang),
      lede_html: renderNewsletterField(
        pickBilingual(edition.hero.lede_absorbed, lang),
        heroAlert,
        lang,
      ),
      cta_link: edition.hero.cta_link,
    } : null,
    featured: (edition.featured || []).map((item) => {
      const alert = item.noticia_id ? getAlertById(item.noticia_id) : null;
      return {
        title: pickBilingual(item.title, lang),
        one_liner_html: renderNewsletterField(
          pickBilingual(item.one_liner, lang),
          alert,
          lang,
        ),
      };
    }),
    close: pickBilingual(edition.close, lang),
  };
}

module.exports = {
  escapeHtml,
  renderInlineMarkdown,
  renderNewsletterField,
  buildDisplayEdition,
};
