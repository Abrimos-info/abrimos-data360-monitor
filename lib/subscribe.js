'use strict';

const { DEMO_COUNTRIES } = require('./url-slug');
const { SUBSCRIBERS_TSV } = require('./paths');
const { appendTsvLine } = require('./file-utils');

const VALID_TYPES = new Set(['newsletter_lac', 'indicator_alerts']);
const VALID_TOPICS = new Set(['macro', 'fiscal', 'social', 'food_security', 'governance']);

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

function normalizeCountries(body) {
  let list = Array.isArray(body.countries) ? body.countries : [];
  if (!list.length && body.country_iso) {
    list = [String(body.country_iso).trim()];
  }
  return list
    .map((c) => String(c).trim().toUpperCase())
    .filter((c) => DEMO_COUNTRIES.includes(c));
}

function normalizeTopics(body) {
  if (!Array.isArray(body.topics)) return [];
  return body.topics
    .map((t) => String(t).trim())
    .filter((t) => VALID_TOPICS.has(t));
}

function previewUrl(subscriptionType, countries, topics) {
  if (subscriptionType === 'newsletter_lac') {
    return '/newsletter';
  }
  const params = new URLSearchParams();
  if (countries.length) params.set('countries', countries.join(','));
  if (topics.length) params.set('topics', topics.join(','));
  const qs = params.toString();
  return qs ? `/indicadores?${qs}` : '/indicadores';
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
  const countries = normalizeCountries(body);
  const topics = normalizeTopics(body);
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

  const tsvPath = process.env.SUBSCRIBERS_TSV || SUBSCRIBERS_TSV;
  appendTsvLine(tsvPath, [
    new Date().toISOString(),
    email,
    subscriptionType,
    countries.join('|'),
    topics.join('|'),
    lang,
    req.headers['user-agent'] || '',
    req.headers.referer || '',
  ]);

  const url = previewUrl(subscriptionType, countries, topics);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, preview_url: url }));
}

module.exports = {
  handleSubscribe,
  previewUrl,
  normalizeCountries,
  normalizeTopics,
  VALID_TOPICS,
};
