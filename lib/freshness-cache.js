'use strict';

const fs = require('fs');
const path = require('path');

const PROBE_STATE_FILE = '_probe-state.json';

function etagPath(snapshotsDir, idno) {
  return path.join(snapshotsDir, `${idno}.etag`);
}

function csvSnapshotPath(snapshotsDir, idno) {
  return path.join(snapshotsDir, `${idno}.csv`);
}

function metaSnapshotPath(snapshotsDir, idno) {
  return path.join(snapshotsDir, `${idno}.meta.json`);
}

function loadEtag(snapshotsDir, idno) {
  const file = etagPath(snapshotsDir, idno);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveEtag(snapshotsDir, idno, record) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
  fs.writeFileSync(etagPath(snapshotsDir, idno), JSON.stringify(record, null, 2) + '\n', 'utf8');
}

function loadProbeState(snapshotsDir) {
  const file = path.join(snapshotsDir, PROBE_STATE_FILE);
  if (!fs.existsSync(file)) return { last_probe_at: null };
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveProbeState(snapshotsDir, state) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
  fs.writeFileSync(
    path.join(snapshotsDir, PROBE_STATE_FILE),
    JSON.stringify(state, null, 2) + '\n',
    'utf8',
  );
}

module.exports = {
  etagPath,
  csvSnapshotPath,
  metaSnapshotPath,
  loadEtag,
  saveEtag,
  loadProbeState,
  saveProbeState,
};
