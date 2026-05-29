'use strict';

const fs = require('fs');
const path = require('path');
const ai = require('../ai-client');
const { readPrompt } = require('../analysis/prompt-builder');
const { extractJsonObject } = require('../analysis/alert-extractor');
const { NEWSLETTER_EDITIONS_DIR } = require('../paths');
const { pathForCountry } = require('../url-slug');

function alertsForDate(alerts, dateIso) {
  return (alerts || []).filter((a) => {
    if ((a.content_type || 'noticia') !== 'noticia') return false;
    if (a.quality_status === 'rejected') return false;
    if (!a.detected_at) return false;
    return String(a.detected_at).slice(0, 10) === dateIso;
  });
}

function compactPoolEntry(alert) {
  const mag = Number(alert.magnitude?.replace?.(/[^\d.]/g, '') || alert.score || 0);
  return {
    noticia_id: alert.id,
    country_iso: alert.country,
    dataset_id: alert.dataset_id,
    title: alert.title,
    lead: alert.lead,
    story: alert.story,
    claim_tokens: alert.claim_tokens,
    verification_trace_ok: Boolean(alert.verification_trace?.data360_dataset_url),
    mag: Number.isFinite(mag) ? mag : (alert.score || 0),
    cov_inv: 0.5,
    reg: 0.5,
    bonus_orphan: 0,
    score: alert.score || 0,
    gdelt_mentions_7d: 0,
    published_at: alert.detected_at,
    cta_link: pathForCountry(alert, alert.country) || alert._path || '/',
  };
}

function buildNewsletterContext(dateIso, alerts) {
  const pool = alerts.map(compactPoolEntry);
  return [
    '## §1 Edición',
    '',
    `- scope: LAC`,
    `- date_iso: ${dateIso}`,
    '',
    '## §7 Pool de candidatos del día',
    '',
    '```json',
    JSON.stringify(pool, null, 2),
    '```',
    '',
    '## §9 URLs',
    '',
    `- cta.url: /newsletter/lac/${dateIso}`,
    `- footer.methodology_link: /metodologia`,
  ].join('\n');
}

function parseNewsletterJson(llmText) {
  const fence = /```(?:newsletter|json)\s*/g;
  let m;
  while ((m = fence.exec(llmText)) !== null) {
    const jsonText = extractJsonObject(llmText, m.index + m[0].length);
    if (!jsonText) continue;
    try {
      return JSON.parse(jsonText);
    } catch (_) {}
  }
  const bare = extractJsonObject(llmText, 0);
  if (bare) {
    try {
      return JSON.parse(bare);
    } catch (_) {}
  }
  return null;
}

function buildMessages(context, dateIso) {
  const system = [
    readPrompt('newsletter-system.md'),
    '',
    readPrompt('newsletter-template.md'),
  ].join('\n');
  const user = [
    readPrompt('newsletter-task.md'),
    '',
    '---',
    '',
    context,
    '',
    `Emití el JSON de la edición LAC para ${dateIso} en un bloque \`\`\`newsletter\`\`\`.`,
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

async function generateNewsletterEdition({ dateIso, alerts, noLlm = false, effort = null } = {}) {
  if (!dateIso) throw new Error('dateIso is required');
  const pool = alertsForDate(alerts, dateIso);
  if (!pool.length && !noLlm) {
    console.warn(`[newsletter] no noticias for ${dateIso}`);
  }
  const context = buildNewsletterContext(dateIso, pool);
  if (noLlm) {
    const dry = {
      edition: {
        scope: 'LAC',
        label: 'LAC',
        date_iso: dateIso,
        is_dry_day: pool.length === 0,
      },
      subject: { es: `Edición LAC ${dateIso}`, en: `LAC edition ${dateIso}` },
      preheader: { es: 'Hallazgos verificados del día.', en: 'Verified findings of the day.' },
      greeting: { es: `Edición del ${dateIso}.`, en: `Edition for ${dateIso}.` },
      hero: pool[0] ? {
        noticia_id: pool[0].id,
        country_iso: pool[0].country,
        title: pool[0].title,
        lede_absorbed: pool[0].lead,
        cta_link: pathForCountry(pool[0], pool[0].country) || '/',
      } : null,
      featured: [],
      close: { type: 'default', es: 'Mañana sale otra edición.', en: 'Another edition tomorrow.' },
      cta: { label: { es: 'Ver edición →', en: 'See edition →' }, url: `/newsletter/lac/${dateIso}` },
    };
    const { enrichEditionFromAlerts } = require('./enrich-edition');
    return enrichEditionFromAlerts(dry, pool);
  }
  const messages = buildMessages(context, dateIso);
  const llmResult = await ai.complete(messages, {
    label: `newsletter:${dateIso}`,
    model: process.env.AI_MODEL_NEWSLETTER || process.env.AI_MODEL_NOTICIA,
    effort,
  });
  const edition = parseNewsletterJson(llmResult.content);
  if (!edition) {
    throw new Error(`[newsletter] failed to parse LLM output for ${dateIso}`);
  }
  if (!edition.edition) edition.edition = { scope: 'LAC', label: 'LAC', date_iso: dateIso };
  edition.edition.date_iso = dateIso;
  if (!edition.cta) edition.cta = { label: { es: 'Ver edición →', en: 'See edition →' }, url: `/newsletter/lac/${dateIso}` };
  const { enrichEditionFromAlerts } = require('./enrich-edition');
  return enrichEditionFromAlerts(edition, pool);
}

function saveEdition(scope, dateIso, edition) {
  fs.mkdirSync(NEWSLETTER_EDITIONS_DIR, { recursive: true });
  const filepath = path.join(NEWSLETTER_EDITIONS_DIR, `${scope}-${dateIso}.json`);
  fs.writeFileSync(filepath, JSON.stringify(edition, null, 2) + '\n', 'utf8');
  return filepath;
}

module.exports = {
  alertsForDate,
  buildNewsletterContext,
  generateNewsletterEdition,
  parseNewsletterJson,
  saveEdition,
};
