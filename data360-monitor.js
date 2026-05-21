'use strict';

require('dotenv').config({ override: true });

const http = require('http');
const path = require('path');
const fs = require('fs');

const router = require('./lib/router');
const views = require('./lib/views');
const i18n = require('./lib/i18n');
const alertsStore = require('./lib/alerts-store');

i18n.onReload(views.clearTemplateCache);
alertsStore.onReload(views.clearTemplateCache);

const host = 'localhost';
const port = parseInt(process.env.D360_PORT, 10) || 8090;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  setupDevWatchers();
}

const server = http.createServer(router.requestListener);
server.listen(port, host, () => {
  console.log(new Date(), `data360-monitor listening on http://${host}:${port} (${isDev ? 'dev' : 'prod'})`);
});

function setupDevWatchers() {
  let chokidar;
  try {
    chokidar = require('chokidar');
  } catch (e) {
    console.warn(new Date(), 'chokidar not installed, skipping dev watchers');
    return;
  }

  const root = __dirname;
  const watchPaths = [
    path.join(root, 'templates'),
    path.join(root, 'config'),
    path.join(root, 'static'),
    path.join(root, 'data/alerts.json'),
    path.join(root, 'data/alerts.fixture.json'),
  ];

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    ignored: /node_modules|\.git/,
  });

  watcher.on('all', (event, filepath) => {
    const ext = path.extname(filepath);
    if (ext === '.pug') {
      console.log(new Date(), 'template changed, clearing cache:', filepath);
      views.clearTemplateCache();
    } else if (filepath.endsWith('strings.es.json') || filepath.endsWith('strings.en.json')) {
      console.log(new Date(), 'strings changed, reloading i18n:', filepath);
      i18n.reload();
    } else if (filepath.endsWith('alerts.json') || filepath.endsWith('alerts.fixture.json')) {
      console.log(new Date(), 'alerts changed, reloading store:', filepath);
      alertsStore.reload();
    } else if (ext === '.css') {
      console.log(new Date(), 'css changed, will be re-minified on next request:', filepath);
    } else if (ext === '.js' || ext === '.json') {
      console.log(new Date(), 'js/json changed, restart needed (run nodemon or restart manually):', filepath);
    }
  });
}
