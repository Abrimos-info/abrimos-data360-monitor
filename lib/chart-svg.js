'use strict';

function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function defaultDashForIndex(i) {
  const patterns = [null, '5 3', '2 2', '8 3 2 3'];
  return patterns[i % patterns.length];
}

function sortPeriods(periods) {
  return [...new Set(periods.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function renderChartSvg(series, opts = {}) {
  if (!Array.isArray(series) || !series.length) return '';
  const w = opts.width || 520;
  const h = opts.height || 140;
  const padL = 28; const padR = 12; const padT = 12; const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const values = series.map((p) => p.value);
  const avgs = series.filter((p) => p.regional_avg !== undefined).map((p) => p.regional_avg);
  const allValues = values.concat(avgs);
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = (maxV - minV) || 1;
  const top = maxV + range * 0.1;
  const bot = minV - range * 0.1;
  const rangeAdj = top - bot;

  const xFn = (i) => padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const yFn = (v) => padT + innerH - ((v - bot) / rangeAdj) * innerH;

  const linePoints = series.map((p, i) => `${xFn(i)},${yFn(p.value)}`).join(' ');
  const avgPoints = (avgs.length === series.length)
    ? series.map((p, i) => `${xFn(i)},${yFn(p.regional_avg)}`).join(' ')
    : null;
  const areaPath = `M ${xFn(0)},${yFn(bot)} L ${linePoints.replace(/ /g, ' L ')} L ${xFn(series.length - 1)},${yFn(bot)} Z`;

  const dots = series.map((p, i) => {
    const cx = xFn(i); const cy = yFn(p.value);
    if (p.is_change_point) return `<circle class="d360-chart__dot d360-chart__dot--cp" cx="${cx}" cy="${cy}" r="4"/>`;
    return `<circle class="d360-chart__dot" cx="${cx}" cy="${cy}" r="2"/>`;
  }).join('');

  const avgLine = avgPoints ? `<polyline class="d360-chart__avg" points="${escAttr(avgPoints)}"/>` : '';
  const aria = opts.ariaLabel || 'Historical series';

  return `<svg class="d360-chart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escAttr(aria)}">`
    + `<line class="d360-chart__axis" x1="${padL}" x2="${w - padR}" y1="${h - padB}" y2="${h - padB}"/>`
    + `<path class="d360-chart__area" d="${escAttr(areaPath)}"/>`
    + `<polyline class="d360-chart__line" points="${escAttr(linePoints)}"/>`
    + avgLine + dots
    + `<text class="d360-chart__label" x="${padL}" y="${h - 6}">${escHtml(series[0].period)}</text>`
    + `<text class="d360-chart__label" x="${w - padR}" y="${h - 6}" text-anchor="end">${escHtml(series[series.length - 1].period)}</text>`
    + `</svg>`;
}

function buildSegments(periods, valueByPeriod) {
  const segments = [];
  let current = [];
  for (const p of periods) {
    const v = valueByPeriod.get(p);
    if (v == null || !Number.isFinite(v)) {
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push({ period: p, value: v });
  }
  if (current.length) segments.push(current);
  return segments;
}

function renderMultiSeriesChartSvg(payload, opts = {}) {
  if (!payload || !Array.isArray(payload.series) || !payload.series.length) return '';
  const variant = opts.variant === 'compact' ? 'compact' : 'full';
  const w = opts.width || 720;
  const h = opts.height || (variant === 'compact' ? 160 : 300);
  const padL = 34; const padR = 14; const padT = 12; const padB = variant === 'compact' ? 44 : 86;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const aria = opts.ariaLabel || 'Regional multi-series chart';

  const periods = sortPeriods(payload.periods || payload.series.flatMap((s) => (s.points || []).map((p) => p.period)));
  if (!periods.length) return '';

  const allValues = [];
  for (const s of payload.series) {
    for (const p of (s.points || [])) {
      const v = Number(p.value);
      if (Number.isFinite(v)) allValues.push(v);
    }
  }
  if (!allValues.length) return '';

  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = (maxV - minV) || 1;
  const top = maxV + range * 0.1;
  const bot = minV - range * 0.1;
  const rangeAdj = top - bot;

  const xFn = (i) => padL + (periods.length === 1 ? innerW / 2 : (i / (periods.length - 1)) * innerW);
  const yFn = (v) => padT + innerH - ((v - bot) / rangeAdj) * innerH;

  const focusCountry = opts.focusCountry || null;
  const legend = opts.legend !== false;

  let svg = `<svg class="d360-chart d360-chart--multi" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escAttr(aria)}">`;
  svg += `<line class="d360-chart__axis" x1="${padL}" x2="${w - padR}" y1="${h - padB}" y2="${h - padB}"/>`;

  const seriesSorted = [...payload.series].sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
  seriesSorted.forEach((s, idx) => {
    const valueByPeriod = new Map();
    for (const p of (s.points || [])) {
      const v = Number(p.value);
      if (Number.isFinite(v)) valueByPeriod.set(p.period, v);
    }
    const segments = buildSegments(periods, valueByPeriod);
    if (!segments.length) return;

    const isFocus = focusCountry && s.country === focusCountry;
    const muted = focusCountry && !isFocus;
    const color = s.color || '#0083C8';
    const dash = s.dash || defaultDashForIndex(idx);
    const strokeWidth = isFocus ? 2.6 : 1.8;
    const opacity = muted ? 0.35 : 1;
    const dashAttr = dash ? ` stroke-dasharray="${escAttr(dash)}"` : '';

    for (const seg of segments) {
      const pts = seg.map((p) => {
        const i = periods.indexOf(p.period);
        return `${xFn(i).toFixed(1)},${yFn(p.value).toFixed(1)}`;
      }).join(' ');
      svg += `<polyline class="d360-chart__line d360-chart__line--multi${muted ? ' is-muted' : ''}" points="${escAttr(pts)}" fill="none" stroke="${escAttr(color)}" stroke-width="${strokeWidth}" opacity="${opacity}"${dashAttr}/>`;
    }
  });

  svg += `<text class="d360-chart__label" x="${padL}" y="${h - 6}">${escHtml(periods[0])}</text>`;
  svg += `<text class="d360-chart__label" x="${w - padR}" y="${h - 6}" text-anchor="end">${escHtml(periods[periods.length - 1])}</text>`;

  if (legend) {
    const legX = padL;
    let legY = h - (variant === 'compact' ? 28 : 70);
    const maxItems = variant === 'compact' ? 6 : 12;
    const items = seriesSorted.slice(0, maxItems);
    svg += `<g class="d360-chart__legend" transform="translate(${legX}, ${legY})">`;
    let row = 0;
    for (const s of items) {
      const y = row * 14;
      const color = s.color || '#0083C8';
      svg += `<line class="d360-chart__legend-swatch" x1="0" x2="14" y1="${y - 4}" y2="${y - 4}" stroke="${escAttr(color)}" stroke-width="2"/>`;
      svg += `<text class="d360-chart__legend-label" x="18" y="${y}">${escHtml(s.label || s.id || '')}</text>`;
      row += 1;
    }
    if (seriesSorted.length > maxItems) {
      const y = row * 14;
      svg += `<text class="d360-chart__legend-more" x="0" y="${y}">${escHtml(`+${seriesSorted.length - maxItems} more`)}</text>`;
    }
    svg += '</g>';
  }

  svg += '</svg>';
  return svg;
}

module.exports = {
  escHtml,
  escAttr,
  sortPeriods,
  renderChartSvg,
  renderMultiSeriesChartSvg,
};

