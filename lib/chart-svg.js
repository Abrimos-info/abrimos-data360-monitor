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

function formatDumbbellValue(v) {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(Math.abs(v) < 10 ? 2 : 0);
}

function formatPeriodShort(period) {
  const years = String(period).match(/\d{4}/g);
  if (!years || !years.length) {
    const s = String(period);
    return s.length > 10 ? `${s.slice(0, 9)}…` : s;
  }
  if (years.length === 1) return years[0];
  const first = years[0];
  const last = years[years.length - 1];
  return first === last ? first : `${first}–${last.slice(-2)}`;
}

/**
 * Dumbbell (range) chart: one row per country, two dots connected by a line.
 * payload = { title, unit, rows: [{ iso, label, color, startPeriod, startValue, endPeriod, endValue }] }
 */
function renderDumbbellChartSvg(payload, opts = {}) {
  if (!payload || !Array.isArray(payload.rows) || !payload.rows.length) return '';

  const rows = payload.rows.filter((r) => Number.isFinite(r.startValue) && Number.isFinite(r.endValue));
  if (!rows.length) return '';

  const labelW = opts.labelWidth || 72;
  const rowH = opts.rowHeight || 28;
  const padT = opts.padTop || 28;   // room for axis labels at top
  const padB = opts.padBottom || 28; // enough for period legend line
  const padR = opts.padRight || 52; // room for end-value label
  const w = opts.width || 520;

  const innerW = w - labelW - padR;
  const h = padT + rows.length * rowH + padB;

  const allValues = rows.flatMap((r) => [r.startValue, r.endValue]);
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = (maxV - minV) || 1;
  const lo = minV - range * 0.12;
  const hi = maxV + range * 0.12;
  const span = hi - lo;

  const xFn = (v) => labelW + ((v - lo) / span) * innerW;
  const yFn = (i) => padT + i * rowH + rowH / 2;

  const aria = opts.ariaLabel || payload.title || 'Dumbbell chart';
  let svg = `<svg class="d360-dumbbell" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escAttr(aria)}">`;

  // Grid lines + top-axis tick labels (3 ticks)
  const ticks = [0, 0.5, 1].map((t) => lo + t * span);
  for (const tv of ticks) {
    const tx = xFn(tv).toFixed(1);
    const label = formatDumbbellValue(tv);
    svg += `<line class="d360-dumbbell__grid" x1="${tx}" x2="${tx}" y1="${padT - 6}" y2="${h - padB}"/>`;
    svg += `<text class="d360-dumbbell__tick" x="${tx}" y="${padT - 8}" text-anchor="middle">${escHtml(label)}</text>`;
  }

  // Minimum pixel gap to consider dots "too close" to render as dumbbell
  const MIN_DOT_GAP = 14;

  // Rows
  rows.forEach((r, i) => {
    const y = yFn(i);
    const cx1 = xFn(r.startValue);
    const cx2 = xFn(r.endValue);
    const color = r.color || '#0083C8';
    const moved = r.endValue !== r.startValue;
    const tooClose = Math.abs(cx2 - cx1) < MIN_DOT_GAP;

    // Country label
    svg += `<text class="d360-dumbbell__label" x="${labelW - 6}" y="${y + 4}" text-anchor="end">${escHtml(r.label || r.iso)}</text>`;

    if (!moved || tooClose) {
      // Single dot: no dumbbell, just one filled dot at end position
      svg += `<circle class="d360-dumbbell__dot d360-dumbbell__dot--end" cx="${cx2.toFixed(1)}" cy="${y}" r="6" fill="${escAttr(color)}"/>`;
    } else {
      // Connector line
      svg += `<line class="d360-dumbbell__connector" x1="${cx1.toFixed(1)}" x2="${cx2.toFixed(1)}" y1="${y}" y2="${y}" stroke="${escAttr(color)}"/>`;
      // Start dot (hollow)
      svg += `<circle class="d360-dumbbell__dot d360-dumbbell__dot--start" cx="${cx1.toFixed(1)}" cy="${y}" r="5" stroke="${escAttr(color)}" fill="#fff"/>`;
      // End dot (filled)
      svg += `<circle class="d360-dumbbell__dot d360-dumbbell__dot--end" cx="${cx2.toFixed(1)}" cy="${y}" r="6" fill="${escAttr(color)}"/>`;
    }

    // End value label — use fixed right margin when dots are close or overlap would occur
    const valLabel = formatDumbbellValue(r.endValue);
    const rightMarginX = labelW + innerW + 4;
    const wentDown = cx2 < cx1;
    const leftWouldOverlap = wentDown && (cx2 - 10) < labelW + 28;
    const nearDotOverlap = tooClose || !moved || Math.abs(cx2 - cx1) < 24;
    const nearRightEdge = cx2 + 36 > labelW + innerW;
    let valX;
    let valAnchor;
    if (nearDotOverlap || nearRightEdge || leftWouldOverlap) {
      valX = rightMarginX;
      valAnchor = 'start';
    } else {
      const labelRight = !wentDown;
      valX = labelRight ? cx2 + 10 : cx2 - 10;
      valAnchor = labelRight ? 'start' : 'end';
    }
    svg += `<text class="d360-dumbbell__value" x="${valX}" y="${y + 4}" text-anchor="${valAnchor}">${escHtml(valLabel)}</text>`;
  });

  // Period legend bottom-left (short labels; dynamic spacing)
  if (rows[0] && rows[0].startPeriod && rows[0].endPeriod) {
    const startLabel = formatPeriodShort(rows[0].startPeriod);
    const endLabel = formatPeriodShort(rows[0].endPeriod);
    const lx = labelW;
    const ly = h - 4;
    const endDotX = lx + 13 + startLabel.length * 5.5 + 14;
    svg += `<circle cx="${lx + 5}" cy="${ly - 4}" r="4" fill="none" stroke="#888" stroke-width="1.2"/>`;
    svg += `<text class="d360-dumbbell__legend-text" x="${lx + 13}" y="${ly}">${escHtml(startLabel)}</text>`;
    svg += `<circle cx="${endDotX.toFixed(1)}" cy="${ly - 4}" r="5" fill="#888"/>`;
    svg += `<text class="d360-dumbbell__legend-text" x="${(endDotX + 8).toFixed(1)}" y="${ly}">${escHtml(endLabel)}</text>`;
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
  renderDumbbellChartSvg,
};

