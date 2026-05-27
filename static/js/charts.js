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

  function sortPeriods(periods) {
    var uniq = {};
    var out = [];
    (periods || []).forEach(function (p) {
      if (!p) return;
      if (uniq[p]) return;
      uniq[p] = true;
      out.push(String(p));
    });
    return out.sort();
  }

  function buildSegments(periods, valueByPeriod) {
    var segments = [];
    var current = [];
    periods.forEach(function (p) {
      var v = valueByPeriod[p];
      if (v === undefined || v === null || !isFinite(v)) {
        if (current.length) segments.push(current);
        current = [];
        return;
      }
      current.push({ period: p, value: v });
    });
    if (current.length) segments.push(current);
    return segments;
  }

  function renderMultiSeriesChartSvg(payload, opts) {
    opts = opts || {};
    if (!payload || !payload.series || !payload.series.length) return '';
    var variant = opts.variant === 'compact' ? 'compact' : 'full';
    var w = opts.width || 720;
    var h = opts.height || (variant === 'compact' ? 160 : 300);
    var padL = 34, padR = 14, padT = 12, padB = (variant === 'compact' ? 44 : 86);
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var aria = opts.ariaLabel || 'Regional multi-series chart';

    var periods = sortPeriods(payload.periods || []);
    if (!periods.length) {
      periods = sortPeriods(payload.series.reduce(function (acc, s) {
        (s.points || []).forEach(function (p) { acc.push(p.period); });
        return acc;
      }, []));
    }
    if (!periods.length) return '';

    var allValues = [];
    payload.series.forEach(function (s) {
      (s.points || []).forEach(function (p) {
        var v = Number(p.value);
        if (isFinite(v)) allValues.push(v);
      });
    });
    if (!allValues.length) return '';

    var minV = Math.min.apply(null, allValues);
    var maxV = Math.max.apply(null, allValues);
    var range = (maxV - minV) || 1;
    var top = maxV + range * 0.1;
    var bot = minV - range * 0.1;
    var rangeAdj = top - bot;

    function xFn(i) {
      return padL + (periods.length === 1 ? innerW / 2 : (i / (periods.length - 1)) * innerW);
    }
    function yFn(v) {
      return padT + innerH - ((v - bot) / rangeAdj) * innerH;
    }

    var focusCountry = opts.focusCountry || null;
    var maxItems = variant === 'compact' ? 6 : 12;
    var legend = (opts.legend === false) ? false : true;

    var svg = '<svg class="d360-chart d360-chart--multi" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + escAttr(aria) + '">' +
      '<line class="d360-chart__axis" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + (h - padB) + '" y2="' + (h - padB) + '"/>';

    payload.series.forEach(function (s, idx) {
      var valueByPeriod = {};
      (s.points || []).forEach(function (p) {
        var v = Number(p.value);
        if (p.period && isFinite(v)) valueByPeriod[p.period] = v;
      });
      var segments = buildSegments(periods, valueByPeriod);
      if (!segments.length) return;
      var isFocus = focusCountry && s.country === focusCountry;
      var muted = focusCountry && !isFocus;
      var color = s.color || '#0083C8';
      var dash = s.dash;
      var dashAttr = dash ? (' stroke-dasharray="' + escAttr(dash) + '"') : '';
      var strokeWidth = isFocus ? 2.6 : 1.8;
      var opacity = muted ? 0.35 : 1;
      segments.forEach(function (seg) {
        var pts = seg.map(function (p) {
          var i = periods.indexOf(p.period);
          return xFn(i).toFixed(1) + ',' + yFn(p.value).toFixed(1);
        }).join(' ');
        svg += '<polyline class="d360-chart__line d360-chart__line--multi' + (muted ? ' is-muted' : '') + '" points="' + escAttr(pts) + '" fill="none" stroke="' + escAttr(color) + '" stroke-width="' + strokeWidth + '" opacity="' + opacity + '"' + dashAttr + '/>';
      });
    });

    svg += '<text class="d360-chart__label" x="' + padL + '" y="' + (h - 6) + '">' + escHtml(periods[0]) + '</text>' +
      '<text class="d360-chart__label" x="' + (w - padR) + '" y="' + (h - 6) + '" text-anchor="end">' + escHtml(periods[periods.length - 1]) + '</text>';

    if (legend) {
      var legX = padL;
      var legY = h - (variant === 'compact' ? 28 : 70);
      svg += '<g class="d360-chart__legend" transform="translate(' + legX + ',' + legY + ')">';
      payload.series.slice(0, maxItems).forEach(function (s, i) {
        var y = i * 14;
        var color = s.color || '#0083C8';
        svg += '<line class="d360-chart__legend-swatch" x1="0" x2="14" y1="' + (y - 4) + '" y2="' + (y - 4) + '" stroke="' + escAttr(color) + '" stroke-width="2"/>';
        svg += '<text class="d360-chart__legend-label" x="18" y="' + y + '">' + escHtml(s.label || s.id || '') + '</text>';
      });
      if (payload.series.length > maxItems) {
        svg += '<text class="d360-chart__legend-more" x="0" y="' + (maxItems * 14) + '">+' + (payload.series.length - maxItems) + ' more</text>';
      }
      svg += '</g>';
    }

    svg += '</svg>';
    return svg;
  }

  global.D360Charts = { renderChartSvg: renderChartSvg, renderMultiSeriesChartSvg: renderMultiSeriesChartSvg, escHtml: escHtml, escAttr: escAttr };
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global)));
