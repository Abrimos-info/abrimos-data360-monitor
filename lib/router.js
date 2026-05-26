'use strict';

const fs = require('fs');
const path = require('path');
const views = require('./views');
const chatApi = require('./chat/api');
const alertsApi = require('./alerts-api');
const pipelineApi = require('./pipeline-api');

const ROOT = path.resolve(__dirname, '..');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
};

async function requestListener(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.parsedUrl = url;
    req.segments = url.pathname.split('/').filter(Boolean);

    if (url.pathname === '/api/chat/config') {
      return chatApi.handleChatConfig(req, res);
    }

    if (url.pathname === '/api/chat') {
      return chatApi.handleChat(req, res);
    }

    if (url.pathname === '/api/alerts') {
      return alertsApi.handleAlerts(req, res);
    }

    if (url.pathname === '/api/pipeline/refresh') {
      return pipelineApi.handlePipelineRefresh(req, res);
    }

    if (url.pathname === '/api/pipeline/status') {
      return pipelineApi.handlePipelineStatus(req, res);
    }

    if (url.pathname.startsWith('/static/')) {
      return sendStatic(req, res, url.pathname.replace(/^\/static\//, ''), url);
    }

    return await views.routePage(req, res);
  } catch (err) {
    console.error(new Date(), 'requestListener error:', err);
    return serverError(req, res, err);
  }
}

async function sendStatic(req, res, relPath, url = null) {
  const safe = path.normalize(relPath).replace(/^(\.\.[/\\])+/, '');
  const filepath = path.join(ROOT, 'static', safe);

  if (!filepath.startsWith(path.join(ROOT, 'static'))) {
    return notFound(req, res);
  }

  fs.stat(filepath, (err, stat) => {
    if (err || !stat.isFile()) {
      return notFound(req, res);
    }
    const ext = path.extname(filepath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    const isProd = process.env.NODE_ENV === 'production';
    const versioned = url?.searchParams?.has('v');
    const cacheControl = isProd && versioned
      ? 'public, max-age=31536000, immutable'
      : (isProd ? 'public, max-age=300' : 'no-cache');
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
    });
    fs.createReadStream(filepath).pipe(res);
  });
}

function notFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><title>404</title><h1>Not found</h1>');
}

function serverError(req, res, err) {
  res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta charset="utf-8"><title>500</title><h1>Server error</h1><pre>${escapeHtml(err.message)}</pre>`);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = { requestListener };
