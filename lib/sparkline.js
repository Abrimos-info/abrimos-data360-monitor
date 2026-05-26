'use strict';

function renderSparklineSvg(series, opts = {}) {
  if (!Array.isArray(series) || !series.length) return '';
  const w = opts.width || 72;
  const h = opts.height || 28;
  const pad = 2;
  const values = series.map((p) => Number(p.value)).filter((v) => Number.isFinite(v));
  if (!values.length) return '';
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = (maxV - minV) || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const points = values.map((v, i) => {
    const x = pad + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
    const y = pad + innerH - ((v - minV) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="d360-sparkline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline class="d360-sparkline__line" fill="none" points="${points}"/></svg>`;
}

module.exports = { renderSparklineSvg };
