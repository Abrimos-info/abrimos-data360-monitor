'use strict';

const FETCH_BODY = process.env.NEWS_FETCH_BODY !== 'false';
const MAX_CHARS = parseInt(process.env.NEWS_ARTICLE_MAX_CHARS || '2500', 10);
const TIMEOUT_MS = parseInt(process.env.NEWS_ARTICLE_TIMEOUT_MS || '15000', 10);
/** Bytes read from HTML response; head + opening paragraphs are enough for extraction. */
const READ_BYTES = parseInt(process.env.NEWS_ARTICLE_READ_BYTES || '600000', 10);
const USER_AGENT = process.env.NEWS_FETCH_USER_AGENT
  || 'Mozilla/5.0 (compatible; Data360NewsAgent/1.0; +https://github.com/Abrimos-info/abrimos-data360-monitor)';

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&([a-z]+);/gi, ' ');
}

function stripTags(html) {
  return decodeHtmlEntities(String(html || '').replace(/<[^>]+>/g, ' '));
}

function normalizeWhitespace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function firstSentences(text, maxLen = 320) {
  const clean = normalizeWhitespace(text);
  if (!clean) return null;
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  return (cut > 80 ? slice.slice(0, cut + 1) : `${slice.trim()}…`).trim();
}

function truncate(text, maxLen = MAX_CHARS) {
  const clean = normalizeWhitespace(text);
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trim()}…`;
}

function metaContent(html, pattern) {
  const re = new RegExp(pattern, 'i');
  const match = html.match(re);
  return match ? normalizeWhitespace(stripTags(match[1])) : null;
}

function extractParagraphText(html) {
  const chunks = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = normalizeWhitespace(stripTags(match[1]));
    if (text.length >= 40) chunks.push(text);
    if (chunks.join(' ').length >= MAX_CHARS * 2) break;
  }
  return chunks.length ? chunks.join('\n\n') : null;
}

function extractJsonLdArticleBody(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const body = node?.articleBody || node?.description;
        if (typeof body === 'string' && body.length > 80) return body;
      }
    } catch (_) {}
  }
  return null;
}

function extractArticleText(html) {
  if (!html) return null;
  const candidates = [
    extractJsonLdArticleBody(html),
    metaContent(html, '<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)'),
    metaContent(html, '<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description'),
    metaContent(html, '<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)'),
    metaContent(html, '<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description'),
    extractParagraphText(html),
  ].filter(Boolean);

  const best = candidates.sort((a, b) => b.length - a.length)[0];
  return best ? truncate(best) : null;
}

async function readResponsePrefix(response, maxBytes) {
  if (!response.body) {
    return await response.text();
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchArticleHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es,en;q=0.8',
        'User-Agent': USER_AGENT,
      },
    });
    if (!res.ok) {
      throw new Error(`Request failed with status code ${res.status}`);
    }
    const type = String(res.headers.get('content-type') || '');
    if (type && !type.includes('text/html') && !type.includes('application/xhtml')) {
      throw new Error(`unsupported content-type: ${type}`);
    }
    return readResponsePrefix(res, READ_BYTES);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`timeout after ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeArticleUrl(raw) {
  let u = String(raw || '').trim();
  u = u.replace(/\s+/g, '');
  u = u.replace(/[)\]"'`,]+$/g, '');
  if (!/^https?:\/\//i.test(u)) return null;
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.href;
  } catch (_) {
    return null;
  }
}

async function fetchArticleFromUrl(url) {
  const normalized = sanitizeArticleUrl(url);
  if (!normalized) {
    return { body_excerpt: null, body_fetch: 'invalid_url', body_error: 'invalid URL' };
  }
  try {
    const html = await fetchArticleHtml(normalized);
    const body_excerpt = extractArticleText(html);
    if (!body_excerpt) {
      return { body_excerpt: null, body_fetch: 'empty', body_error: 'no extractable text' };
    }
    return {
      body_excerpt,
      body_chars: body_excerpt.length,
      body_fetch: 'ok',
      body_fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      body_excerpt: null,
      body_fetch: 'failed',
      body_error: err.message,
    };
  }
}

async function enrichHeadlineWithArticle(headline, opts = {}) {
  const enabled = opts.fetchBody ?? FETCH_BODY;
  if (!enabled || !headline?.url) return headline;

  const result = await fetchArticleFromUrl(headline.url);
  const enriched = { ...headline, ...result };

  if (result.body_excerpt && !enriched.snippet) {
    enriched.snippet = firstSentences(result.body_excerpt);
  }

  return enriched;
}

module.exports = {
  FETCH_BODY,
  MAX_CHARS,
  READ_BYTES,
  extractArticleText,
  fetchArticleFromUrl,
  enrichHeadlineWithArticle,
  sanitizeArticleUrl,
  firstSentences,
  normalizeWhitespace,
};
