'use strict';

const { DEMO_COUNTRIES } = require('./url-slug');
const { SUBSCRIBERS_TSV } = require('./paths');
const { appendTsvLine } = require('./file-utils');
const { loadLatestEditionDate } = require('./newsletter/editions');
const { countrySlug } = require('./url-slug');

const VALID_TYPES = new Set(['newsletter_lac', 'indicator_alerts']);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function previewUrl(subscriptionType, countryIso) {
  if (subscriptionType === 'newsletter_lac') {
    const date = loadLatestEditionDate('lac') || '2026-05-28';
    return `/newsletter/lac/${date}`;
  }
  const slug = countrySlug(countryIso);
  return `/alertas/${slug}/ejemplo`;
}

async function handleSubscribe(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (_) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'invalid_json' }));
    return;
  }

  const email = String(body.email || '').trim();
  const subscriptionType = String(body.subscription_type || '').trim();
  const countryIso = body.country_iso ? String(body.country_iso).trim().toUpperCase() : '';
  const lang = body.lang === 'en' ? 'en' : 'es';

  if (!isValidEmail(email)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'invalid_email' }));
    return;
  }

  if (!VALID_TYPES.has(subscriptionType)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'invalid_type' }));
    return;
  }

  if (subscriptionType === 'indicator_alerts') {
    if (!countryIso || !DEMO_COUNTRIES.includes(countryIso)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'invalid_country' }));
      return;
    }
  }

  const tsvPath = process.env.SUBSCRIBERS_TSV || SUBSCRIBERS_TSV;
  appendTsvLine(tsvPath, [
    new Date().toISOString(),
    email,
    subscriptionType,
    subscriptionType === 'indicator_alerts' ? countryIso : '',
    lang,
    req.headers['user-agent'] || '',
    req.headers.referer || '',
  ]);

  const url = previewUrl(subscriptionType, countryIso);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, preview_url: url }));
}

module.exports = { handleSubscribe, previewUrl };
