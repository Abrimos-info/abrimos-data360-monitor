'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractArticleText,
  firstSentences,
  normalizeWhitespace,
  sanitizeArticleUrl,
} = require('../lib/news-article-fetch');

const FIXTURE = `<!doctype html>
<html><head>
<meta name="description" content="Resumen corto del artículo.">
<meta property="og:description" content="Descripción Open Graph más larga sobre remesas en Ecuador durante 2025.">
<script type="application/ld+json">{"@type":"NewsArticle","articleBody":"El Banco Central reportó un récord histórico de remesas recibidas en 2025, con un crecimiento sostenido durante el primer trimestre."}</script>
</head><body>
<p>Este párrafo introductorio es demasiado corto.</p>
<p>Las remesas enviadas por migrantes ecuatorianos marcaron un récord histórico en 2025, según datos oficiales publicados esta semana.</p>
<p>Los analistas señalan que el flujo sostenido apoya el consumo interno en varias provincias del país.</p>
</body></html>`;

test('extractArticleText prefers json-ld articleBody or paragraphs', () => {
  const text = extractArticleText(FIXTURE);
  assert.ok(text);
  assert.match(text, /remesas/i);
  assert.ok(text.length > 80);
});

test('firstSentences truncates at sentence boundary', () => {
  const out = firstSentences('Primera oración completa. Segunda oración mucho más larga que debería quedar fuera del límite establecido para prueba.', 40);
  assert.match(out, /Primera oración completa\./);
});

test('sanitizeArticleUrl removes spaces and validates', () => {
  assert.equal(
    sanitizeArticleUrl('https://www. Forbes.com/ecuador/2024/04/03/record'),
    'https://www.forbes.com/ecuador/2024/04/03/record'
  );
  assert.equal(sanitizeArticleUrl('not a url'), null);
});
