'use strict';

require('dotenv').config({ override: true });

const http = require('http');
const path = require('path');

const router = require('./lib/router');
const views = require('./lib/views');
const i18n = require('./lib/i18n');
const alertsStore = require('./lib/alerts-store');

i18n.onReload(views.clearTemplateCache);
alertsStore.onReload(views.clearTemplateCache);

const host = 'localhost';
const port = parseInt(process.env.D360_PORT, 10) || 8090;
const isDev = process.env.NODE_ENV !== 'production';

const server = http.createServer(router.requestListener);
server.listen(port, host, () => {
  console.log(new Date(), `data360-monitor listening on http://${host}:${port} (${isDev ? 'dev' : 'prod'})`);
  if (isDev) setupDevWatchers(server);
});

function restartServer() {
  if (process.env.pm_id) {
    console.log(new Date(), 'watcher: running under PM2, exiting for restart');
    process.exit(0);
  }

  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections();
  }

  server.close(() => {
    console.log(new Date(), 'watcher: server closed, spawning new process...');
    const { spawn } = require('child_process');
    const entry = path.join(__dirname, 'data360-monitor.js');
    const child = spawn(process.execPath, [entry], {
      detached: true,
      stdio: 'inherit',
      env: process.env,
    });
    child.unref();
    process.exit(0);
  });
}

function setupDevWatchers(activeServer) {
  let chokidar;
  try {
    chokidar = require('chokidar');
  } catch (e) {
    console.warn(new Date(), 'chokidar not installed, skipping dev watchers');
    return;
  }

  const root = __dirname;
  const watcher = chokidar.watch([
    path.join(root, 'data360-monitor.js'),
    path.join(root, '.env'),
    path.join(root, 'lib'),
    path.join(root, 'config'),
    path.join(root, 'templates'),
    path.join(root, 'data/alerts.json'),
    path.join(root, 'data/alerts.fixture.json'),
  ], {
    ignored: (filePath) => {
      if (filePath.includes('node_modules')) return true;
      if (filePath.includes('.git')) return true;
      if (filePath.includes(`${path.sep}lib${path.sep}`) && !filePath.endsWith('.js')) return true;
      if (filePath.includes(`${path.sep}templates${path.sep}`) && !filePath.endsWith('.pug')) return true;
      if (filePath.includes(`${path.sep}config${path.sep}`) && !filePath.endsWith('.json')) return true;
      return false;
    },
    ignoreInitial: true,
    usePolling: true,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
    persistent: true,
  });

  watcher.on('error', (err) => {
    console.error(new Date(), 'watcher error:', err.message);
  });

  watcher.on('ready', () => {
    const watched = watcher.getWatched();
    const fileCount = Object.values(watched).reduce((n, files) => n + files.length, 0);
    console.log(new Date(), `watcher ready, watching ${fileCount} files`);
  });

  watcher.on('change', (filepath) => {
    console.log(new Date(), 'watcher: changed', filepath);

    if (filepath.endsWith('.pug')) {
      console.log(new Date(), 'watcher: clearing template cache');
      views.clearTemplateCache();
      return;
    }

    if (filepath.endsWith('strings.es.json') || filepath.endsWith('strings.en.json')) {
      console.log(new Date(), 'watcher: reloading i18n');
      i18n.reload();
      views.clearTemplateCache();
      return;
    }

    if (filepath.endsWith('alerts.json') || filepath.endsWith('alerts.fixture.json')) {
      console.log(new Date(), 'watcher: reloading alerts store');
      alertsStore.reload();
      return;
    }

    console.log(new Date(), 'watcher: server code changed, restarting...');
    restartServer();
  });
}
