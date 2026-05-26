'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  classifyGeminiArticle,
  indicatorSearchContext,
  buildSearchPrompt,
  buildBatchSearchPrompt,
  normalizeArticleCountry,
  parseJsonFromText,
  isGroundingRedirectUrl,
  resolveFromGroundingMetadata,
  resolveGeminiArticleUrl,
} = require('../lib/news-gemini');

test('indicatorSearchContext prefers definition over boilerplate links', () => {
  const ctx = indicatorSearchContext('WB_WDI_SL_UEM_TOTL_ZS');
  assert.match(ctx.title, /Unemployment/i);
  assert.match(ctx.definition, /labor force/i);
  assert.ok(ctx.searchTerms.some((t) => /desempleo|desocupación/i.test(t)));
  assert.ok(!ctx.definition.includes('data360api'));
});

test('classifyGeminiArticle tags blocked domains without dropping record', () => {
  const result = classifyGeminiArticle({
    headline: 'Informe WB',
    url: 'https://data360.worldbank.org/en/int/dataset/WB_WDI',
    source_name: 'World Bank',
    published_at: '2026-05-01',
  }, {
    fetchedAt: '2026-05-22T12:00:00.000Z',
    from: '2026-04-01',
    to: '2026-05-21',
    seenUrls: new Set(),
    knownUrlIds: new Set(),
  });
  assert.equal(result.status, 'rejected');
  assert.ok(result.tags.includes('blocked_domain'));
});

test('classifyGeminiArticle tags outside window and duplicates', () => {
  const url = 'https://www.example.com/noticia';
  const id = require('../lib/news').headlineId(url);
  const outside = classifyGeminiArticle({
    headline: 'Vieja',
    url,
    source_name: 'example',
    published_at: '2020-01-01',
  }, {
    fetchedAt: '2026-05-22T12:00:00.000Z',
    from: '2026-04-01',
    to: '2026-05-21',
    seenUrls: new Set([id]),
    knownUrlIds: new Set(),
  });
  assert.equal(outside.status, 'rejected');
  assert.ok(outside.tags.includes('outside_window'));
  assert.ok(outside.tags.includes('duplicate_url_run'));
});

test('buildSearchPrompt includes date window and JSON-only instruction', () => {
  const prompt = buildSearchPrompt('ARG', {
    idno: 'X',
    title: 'Inflación',
    definition: 'IPC anual',
    searchTerms: ['inflación', 'IPC'],
  }, { from: '2026-04-01', to: '2026-05-21', mediaHints: ['La Nación'] });
  assert.match(prompt, /2026-04-01/);
  assert.match(prompt, /SOLO con un objeto JSON/i);
  assert.match(prompt, /La Nación/);
});

test('parseJsonFromText extracts JSON from fenced markdown', () => {
  const parsed = parseJsonFromText('```json\n{"articles":[{"headline":"H","url":"https://x.com/a"}]}\n```');
  assert.equal(parsed.articles[0].headline, 'H');
});

test('buildBatchSearchPrompt covers all countries and ISO3 field', () => {
  const prompt = buildBatchSearchPrompt(['GTM', 'MEX'], {
    idno: 'WB_KNOMAD_BRE',
    title: 'Remesas',
    definition: 'Flujos de remesas',
    searchTerms: ['remesas'],
  }, { from: '2026-04-01', to: '2026-05-21', maxPerCountry: 2 });
  assert.match(prompt, /GTM \(Guatemala\)/);
  assert.match(prompt, /MEX \(Mexico\)/);
  assert.match(prompt, /"country": "ISO3 \(GTM\|MEX\)"/);
  assert.match(prompt, /Máximo 2 artículos por país/);
});

test('normalizeArticleCountry accepts ISO3 and Spanish names', () => {
  const allowed = ['GTM', 'MEX', 'ARG'];
  assert.equal(normalizeArticleCountry('GTM', allowed), 'GTM');
  assert.equal(normalizeArticleCountry('guatemala', allowed), 'GTM');
  assert.equal(normalizeArticleCountry('Mexico', allowed), 'MEX');
  assert.equal(normalizeArticleCountry('Chile', allowed), null);
});

test('isGroundingRedirectUrl detects vertex grounding proxies', () => {
  assert.equal(
    isGroundingRedirectUrl('https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQabc'),
    true,
  );
  assert.equal(isGroundingRedirectUrl('https://www.clarin.com/nota'), false);
});

test('resolveFromGroundingMetadata returns canonical URI when present', () => {
  const redirect = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQabc';
  const meta = {
    groundingChunks: [
      { web: { uri: redirect, title: 'Titular' } },
      { web: { uri: 'https://www.clarin.com/economia/nota.html', title: 'Titular' } },
    ],
  };
  assert.equal(resolveFromGroundingMetadata(redirect, meta), null);
  const meta2 = {
    groundingChunks: [
      { web: { uri: 'https://www.infobae.com/america/nota.html', title: 'Titular' } },
    ],
  };
  assert.equal(
    resolveFromGroundingMetadata('https://www.infobae.com/america/nota.html', meta2),
    'https://www.infobae.com/america/nota.html',
  );
});

test('resolveGeminiArticleUrl rejects unresolved grounding redirect without follow', async () => {
  const redirect = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQabc';
  const out = await resolveGeminiArticleUrl(
    { url: redirect, headline: 'H' },
    null,
    { resolveGroundingUrls: false },
  );
  assert.equal(out.unresolved, true);
  assert.ok(out.tags.includes('unresolved_grounding_redirect'));
});

test('resolveGeminiArticleUrl uses redirect cache', async () => {
  const redirect = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQcache';
  const cache = new Map([[redirect, 'https://www.lanacion.com.ar/nota']]);
  const out = await resolveGeminiArticleUrl(
    { url: redirect, headline: 'H' },
    null,
    { resolveGroundingUrls: true, redirectCache: cache },
  );
  assert.equal(out.url, 'https://www.lanacion.com.ar/nota');
  assert.ok(out.tags.includes('grounding_redirect_cached'));
});

test('classifyGeminiArticle rejects grounding redirect URLs', () => {
  const result = classifyGeminiArticle({
    headline: 'Titular',
    url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQabc',
    source_name: 'Clarín',
    published_at: '2026-05-01',
  }, {
    fetchedAt: '2026-05-22T12:00:00.000Z',
    from: '2026-04-01',
    to: '2026-05-21',
    seenUrls: new Set(),
    knownUrlIds: new Set(),
  });
  assert.equal(result.status, 'rejected');
  assert.ok(result.tags.includes('unresolved_grounding_redirect'));
});
