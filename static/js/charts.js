'use strict';

(function (global) {
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

  function renderChartSvg(series) {
    if (!series || !series.length) return '';
    var w = 520, h = 140;
    var padL = 28, padR = 12, padT = 12, padB = 22;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var values = series.map(function (p) { return p.value; });
    var avgs = series.filter(function (p) { return p.regional_avg !== undefined; }).map(function (p) { return p.regional_avg; });
    var allValues = values.concat(avgs);
    var minV = Math.min.apply(null, allValues);
    var maxV = Math.max.apply(null, allValues);
    var range = (maxV - minV) || 1;
    var top = maxV + range * 0.1;
    var bot = minV - range * 0.1;
    var rangeAdj = top - bot;

    function xFn(i) {
      return padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    }
    function yFn(v) {
      return padT + innerH - ((v - bot) / rangeAdj) * innerH;
    }

    var linePoints = series.map(function (p, i) { return xFn(i) + ',' + yFn(p.value); }).join(' ');
    var avgPoints = (avgs.length === series.length)
      ? series.map(function (p, i) { return xFn(i) + ',' + yFn(p.regional_avg); }).join(' ')
      : null;
    var areaPath = 'M ' + xFn(0) + ',' + yFn(bot) +
      ' L ' + linePoints.replace(/ /g, ' L ') +
      ' L ' + xFn(series.length - 1) + ',' + yFn(bot) + ' Z';

    var dots = series.map(function (p, i) {
      var cx = xFn(i), cy = yFn(p.value);
      if (p.is_change_point) {
        return '<circle class="d360-chart__dot d360-chart__dot--cp" cx="' + cx + '" cy="' + cy + '" r="4"/>';
      }
      return '<circle class="d360-chart__dot" cx="' + cx + '" cy="' + cy + '" r="2"/>';
    }).join('');

    var avgLine = avgPoints
      ? '<polyline class="d360-chart__avg" points="' + escAttr(avgPoints) + '"/>'
      : '';

    return '<svg class="d360-chart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Historical series">' +
      '<line class="d360-chart__axis" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + (h - padB) + '" y2="' + (h - padB) + '"/>' +
      '<path class="d360-chart__area" d="' + escAttr(areaPath) + '"/>' +
      '<polyline class="d360-chart__line" points="' + escAttr(linePoints) + '"/>' +
      avgLine + dots +
      '<text class="d360-chart__label" x="' + padL + '" y="' + (h - 6) + '">' + escHtml(series[0].period) + '</text>' +
      '<text class="d360-chart__label" x="' + (w - padR) + '" y="' + (h - 6) + '" text-anchor="end">' + escHtml(series[series.length - 1].period) + '</text>' +
      '</svg>';
  }

  global.D360Charts = { renderChartSvg, escHtml, escAttr };
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global)));
