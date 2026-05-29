'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { enrichEditionFromAlerts, resolveCtaLink } = require('../lib/newsletter/enrich-edition');
const {
  renderInlineMarkdown,
  renderNewsletterField,
  buildDisplayEdition,
} = require('../lib/newsletter/render-edition');

const sampleAlert = {
  id: 'noticia_abrupt_change_GTM_WB_PIP_NPOOR_UMIC_2023_001',
  country: 'GTM',
  _path: '/guatemala/noticia/2023/05/pobreza-umic',
  claim_tokens: [{
    claim_id: 'abad647a8fc91a64',
    value: '10.4953',
    display_es: '10,50',
    display_en: '10.50',
  }],
};

test('resolveCtaLink prefers pathForCountry', () => {
  assert.equal(resolveCtaLink(sampleAlert), '/guatemala/noticia/2023/05/pobreza-umic');
});

test('enrichEditionFromAlerts replaces hero cta_link from source noticia', () => {
  const edition = {
    hero: {
      noticia_id: sampleAlert.id,
      cta_link: '/?noticia=noticia_abrupt_change_GTM_WB_PIP_NPOOR_UMIC_2023_001',
      lede_absorbed: { es: 'texto' },
    },
    featured: [{
      noticia_id: sampleAlert.id,
      cta_link: '/?noticia=bad',
      one_liner: { es: 'x' },
    }],
  };
  const out = enrichEditionFromAlerts(edition, [sampleAlert]);
  assert.equal(out.hero.cta_link, '/guatemala/noticia/2023/05/pobreza-umic');
  assert.equal(out.featured[0].cta_link, '/guatemala/noticia/2023/05/pobreza-umic');
  assert.equal(out.hero.claim_tokens.length, 1);
});

test('renderInlineMarkdown converts markdown links to anchors', () => {
  const html = renderInlineMarkdown(
    'Según la [Plataforma BM](https://data360.worldbank.org/en/dataset/WB_PIP) publicada.',
  );
  assert.match(html, /<a href="https:\/\/data360\.worldbank\.org\/en\/dataset\/WB_PIP"/);
  assert.match(html, />Plataforma BM</);
});

test('renderNewsletterField resolves claim tokens and markdown', () => {
  const html = renderNewsletterField(
    'Alcanzó {{claim:abad647a8fc91a64|10,4953}} según [BM](https://data360.worldbank.org/en/dataset/WB_PIP).',
    sampleAlert,
    'es',
  );
  assert.doesNotMatch(html, /\{\{claim:/);
  assert.match(html, /10,4953/);
  assert.match(html, /<a href="https:\/\/data360\.worldbank\.org\/en\/dataset\/WB_PIP"/);
});

test('buildDisplayEdition produces html fields for hero and featured', () => {
  const edition = enrichEditionFromAlerts({
    greeting: { es: 'Hola.' },
    hero: {
      noticia_id: sampleAlert.id,
      title: { es: 'Título hero' },
      lede_absorbed: {
        es: 'Valor {{claim:abad647a8fc91a64|10,4953}} en [PIP](https://data360.worldbank.org/en/dataset/WB_PIP).',
      },
      cta_link: '/guatemala/noticia/2023/05/pobreza-umic',
    },
    featured: [{
      noticia_id: sampleAlert.id,
      title: { es: 'Featured' },
      one_liner: {
        es: 'Cayó a {{claim:abad647a8fc91a64|0,900}} según [WJP](https://data360.worldbank.org/en/dataset/WJP_ROL).',
      },
    }],
    close: { es: 'Cierre.' },
  }, [sampleAlert]);

  const display = buildDisplayEdition(edition, {
    getAlertById: (id) => (id === sampleAlert.id ? sampleAlert : null),
  }, 'es');

  assert.match(display.hero.lede_html, /10,4953/);
  assert.doesNotMatch(display.hero.lede_html, /\{\{claim:/);
  assert.match(display.featured[0].one_liner_html, /<a href="https:\/\/data360\.worldbank\.org\/en\/dataset\/WJP_ROL"/);
});
