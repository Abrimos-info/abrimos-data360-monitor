'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STATUS_PATH = path.join(ROOT, 'data', 'pipeline-status.json');

function readStatus() {
  if (!fs.existsSync(STATUS_PATH)) {
    return { status: 'idle', started_at: null, finished_at: null, error: null };
  }
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
  } catch (_) {
    return { status: 'idle', started_at: null, finished_at: null, error: null };
  }
}

function writeStatus(patch) {
  const next = { ...readStatus(), ...patch, updated_at: new Date().toISOString() };
  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function isRunning() {
  const s = readStatus();
  return s.status === 'running';
}

function startPipelineRefresh() {
  if (isRunning()) {
    return { ok: false, error: 'Pipeline already running', status: readStatus() };
  }

  writeStatus({
    status: 'running',
    started_at: new Date().toISOString(),
    finished_at: null,
    error: null,
  });

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npm, ['run', 'pipeline:dynamic'], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  let log = '';
  child.stdout.on('data', (d) => { log += d.toString(); });
  child.stderr.on('data', (d) => { log += d.toString(); });

  child.on('close', (code) => {
    const finishedAt = new Date().toISOString();
    const startedAt = readStatus().started_at;
    const durationMs = startedAt ? Date.now() - Date.parse(startedAt) : null;
    if (code === 0) {
      writeStatus({
        status: 'done',
        finished_at: finishedAt,
        error: null,
        exit_code: code,
        duration_ms: durationMs,
      });
    } else {
      writeStatus({
        status: 'error',
        finished_at: finishedAt,
        error: `exit ${code}`,
        log_tail: log.slice(-4000),
        exit_code: code,
        duration_ms: durationMs,
      });
    }
    try {
      const alertsStore = require('./alerts-store');
      alertsStore.reload();
    } catch (_) { /* ignore */ }
  });

  child.unref();
  return { ok: true, status: readStatus() };
}

async function handlePipelineRefresh(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  const result = startPipelineRefresh();
  res.writeHead(result.ok ? 202 : 409, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

async function handlePipelineStatus(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(readStatus()));
}

module.exports = {
  readStatus,
  startPipelineRefresh,
  handlePipelineRefresh,
  handlePipelineStatus,
};
