'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const alertsStore = require('../lib/alerts-store');
const {
  buildReportajeSeries,
  renderReportajeChartForAlert,
} = require('../lib/reportaje-chart');

describe('reportaje-chart', () => {
  it('buildReportajeSeries assembles multi-series payload from noticias', () => {
    const reportaje = alertsStore.getAlerts().find((a) => a.id === 'reportaje_RWB_PFI_2026-05-26')
      || alertsStore.getAlerts().find((a) => a.content_type === 'reportaje' && (a.noticia_ids || []).length >= 2);
    if (!reportaje) return;

    const payload = buildReportajeSeries(reportaje, (id) => alertsStore.getAlertById(id), () => alertsStore.getAlerts(), 'es');
    assert.ok(payload);
    assert.ok(Array.isArray(payload.series) && payload.series.length >= 2);
    assert.ok(Array.isArray(payload.periods) && payload.periods.length >= 2);
    assert.ok(payload.series.some((s) => Array.isArray(s.points) && s.points.length >= 2));
  });

  it('renderReportajeChartForAlert returns dumbbell SVG', () => {
    const reportaje = alertsStore.getAlerts().find((a) => a.content_type === 'reportaje');
    if (!reportaje) return;

    const svg = renderReportajeChartForAlert(reportaje, (id) => alertsStore.getAlertById(id), {
      lang: 'es',
      getAllAlerts: () => alertsStore.getAlerts(),
    });

    assert.match(svg, /d360-dumbbell/);
    assert.match(svg, /d360-dumbbell__connector/);
    assert.match(svg, /d360-dumbbell__dot--end/);
  });

  it('renderReportajeChartForAlert returns empty for noticia', () => {
    const noticia = alertsStore.getAlerts().find((a) => a.content_type !== 'reportaje');
    if (!noticia) return;
    assert.equal(renderReportajeChartForAlert(noticia, alertsStore.getAlertById), '');
  });
});
