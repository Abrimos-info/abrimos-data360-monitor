'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data', 'alerts.json');
const ALERTS_DIR = path.join(ROOT, 'data', 'alerts');

function readAlerts() {
  if (!fs.existsSync(ALERTS_PATH)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(ALERTS_PATH, 'utf8'));
    return Array.isArray(raw) ? raw : (raw.alerts || []);
  } catch (_) {
    return [];
  }
}

function countReportajeFiles() {
  if (!fs.existsSync(ALERTS_DIR)) return 0;
  return fs.readdirSync(ALERTS_DIR).filter((f) => f.startsWith('reportaje_') && f.endsWith('.json')).length;
}

function buildPipelineSummary() {
  const alerts = readAlerts();
  const noticias = alerts.filter((a) => (a.content_type || 'noticia') !== 'reportaje');
  const reportajes = alerts.filter((a) => a.content_type === 'reportaje');
  const incomplete = noticias.filter((n) => n.quality_status === 'incomplete');
  const rejected = noticias.filter((n) => n.quality_status === 'rejected');
  const accepted = noticias.filter((n) => !n.quality_status || n.quality_status === 'accepted');

  const datasets = new Set(noticias.map((n) => n.dataset_id).filter(Boolean));
  const indicators = new Set(noticias.map((n) => n.indicator?.idno).filter(Boolean));

  return {
    noticias: {
      total: noticias.length,
      accepted: accepted.length,
      incomplete: incomplete.length,
      rejected: rejected.length,
    },
    reportajes: {
      total: reportajes.length,
      files: countReportajeFiles(),
    },
    datasets: datasets.size,
    indicators: indicators.size,
  };
}

function printPipelineSummary(scope = 'pipeline:dynamic') {
  const s = buildPipelineSummary();
  console.log(`[${scope}] summary | noticias=${s.noticias.total} (accepted=${s.noticias.accepted}, incomplete=${s.noticias.incomplete}, rejected=${s.noticias.rejected})`);
  console.log(`[${scope}] summary | reportajes=${s.reportajes.total} (files=${s.reportajes.files}) | datasets=${s.datasets} | indicators=${s.indicators}`);
  if (s.noticias.incomplete > 0) {
    console.warn(`[${scope}] summary | ${s.noticias.incomplete} noticia(s) incomplete — excluded from reportaje synthesis`);
  }
  return s;
}

module.exports = {
  buildPipelineSummary,
  printPipelineSummary,
};
