'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function createTmpDir(prefix = 'd360-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function rmTmpDir(dir) {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { createTmpDir, rmTmpDir };
