'use strict';

const { loadStaticCopy } = require('../static-copy');

const PAGE_SEO_KEYS = {
  metodologia: 'metodologia',
  privacidad: 'privacidad',
  terminos: 'terminos',
  uso: 'uso',
};

function createStaticPageHandlers({ getTemplate, pageLocals, seoLocals }) {
  const renderStatic = getTemplate('static-prose');

  function staticContentPage(req, res, pageId, activeRoute) {
    const seoKey = PAGE_SEO_KEYS[pageId] || pageId;
    const base = pageLocals(req, {
      activeRoute,
      pageId,
      ...seoLocals(req, seoKey),
    });
    const staticCopy = loadStaticCopy(pageId, base.lang);
    const html = renderStatic({ ...base, staticCopy });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  return {
    metodologiaPage(req, res) {
      return staticContentPage(req, res, 'metodologia', 'about');
    },
    privacidadPage(req, res) {
      return staticContentPage(req, res, 'privacidad', 'about');
    },
    terminosPage(req, res) {
      return staticContentPage(req, res, 'terminos', 'about');
    },
    usoPage(req, res) {
      return staticContentPage(req, res, 'uso', 'about');
    },
  };
}

module.exports = { createStaticPageHandlers };
