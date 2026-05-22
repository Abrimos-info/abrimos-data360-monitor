'use strict';

(function (global) {
  function toChartPoints(observations) {
    return (observations || []).map(function (o) {
      return {
        period: o.time_period || o.period || o.TIME_PERIOD || o.year || '',
        value: Number(o.value != null ? o.value : (o.OBS_VALUE != null ? o.OBS_VALUE : o.obs_value)),
      };
    }).filter(function (p) { return Number.isFinite(p.value); });
  }

  function extractObservations(data) {
    if (!data) return null;
    if (Array.isArray(data.chart_series) && data.chart_series.length) return data.chart_series;
    if (Array.isArray(data.series) && data.series.length) return data.series;
    if (Array.isArray(data.data) && data.data.length && typeof data.data[0] === 'object') {
      return toChartPoints(data.data.map(function (o) {
        return {
          time_period: o.TIME_PERIOD || o.time_period || o.period,
          value: o.OBS_VALUE != null ? o.OBS_VALUE : o.value,
        };
      }));
    }
    if (Array.isArray(data.time_series) && data.time_series.length) {
      return toChartPoints(data.time_series.map(function (o) {
        return {
          period: o.period || o.time_period || o.year,
          value: o.value,
        };
      }));
    }
    if (Array.isArray(data.observations) && data.observations.length) {
      return toChartPoints(data.observations);
    }
    if (data.data && typeof data.data === 'object') return extractObservations(data.data);
    return null;
  }

  function resolveSparklineSeries(spec) {
    if (!spec) return null;
    var cache = global.D360_SPARKLINE_CACHE || {};

    if (spec.series && Array.isArray(spec.series)) return spec.series;
    if (spec.observations && Array.isArray(spec.observations)) return toChartPoints(spec.observations);
    if (spec.chart_series && Array.isArray(spec.chart_series)) return spec.chart_series;

    if (spec.indicator_id && spec.country_code) {
      var key = spec.indicator_id + '|' + spec.country_code;
      if (cache[key]) return cache[key];
    }

    if (spec.alert_id) {
      var alerts = global.D360_ALERTS || [];
      for (var i = 0; i < alerts.length; i++) {
        if (alerts[i].id === spec.alert_id && alerts[i].chart_series) {
          return alerts[i].chart_series;
        }
      }
    }

    return null;
  }

  function renderSparklineHtml(spec, rendered) {
    var series = resolveSparklineSeries(spec);
    if (!series || !series.length || !global.D360Charts) {
      return '<p class="d360-md-sparkline-missing">[sparkline unavailable]</p>';
    }
    var key = JSON.stringify({
      alert_id: spec.alert_id || null,
      indicator_id: spec.indicator_id || null,
      country_code: spec.country_code || null,
      n: series.length,
      first: series[0] && series[0].period,
      last: series[series.length - 1] && series[series.length - 1].period,
    });
    if (rendered && rendered.has(key)) return '';
    if (rendered) rendered.add(key);
    return '<div class="d360-md-sparkline">' + global.D360Charts.renderChartSvg(series) + '</div>';
  }

  function repairSparklineFences(text) {
    if (!text || text.indexOf('```sparkline') === -1) return text;
    var re = /```sparkline\s*\r?\n(\{[\s\S]*?\})\s*/g;
    var out = '';
    var last = 0;
    var match;
    while ((match = re.exec(text)) !== null) {
      out += text.slice(last, match.index);
      var json = match[1].trim();
      var rest = text.slice(match.index + match[0].length);
      out += '```sparkline\n' + json + '\n';
      if (rest.indexOf('```') === 0) {
        out += '```\n';
        last = match.index + match[0].length + 3;
        if (text[last] === '\r') last += 1;
        if (text[last] === '\n') last += 1;
      } else {
        out += '```\n';
        last = match.index + match[0].length;
      }
    }
    out += text.slice(last);
    return out;
  }

  function decodeHtml(text) {
    return String(text)
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  function replaceSparklineBlocks(html, rendered) {
    return html.replace(/<pre><code class="language-sparkline">([\s\S]*?)<\/code><\/pre>/gi, function (_, raw) {
      try {
        var spec = JSON.parse(decodeHtml(raw.trim()));
        return renderSparklineHtml(spec, rendered);
      } catch (e) {
        return '<p class="d360-md-sparkline-missing">[invalid sparkline JSON]</p>';
      }
    });
  }

  function stripFakeChartImages(text) {
    if (!text) return text;
    return String(text)
      .replace(/!\[[^\]]*\]\(\s*https?:\/\/(?:dummyimage\.com|via\.placeholder\.com|placehold\.co|placeholder\.com)[^)]*\)/gi, '')
      .replace(/!\[[^\]]*(?:[Gg]ráfica|[Cc]hart|[Gg]raph)[^\]]*\]\(\s*https?:\/\/[^)]+\)/gi, '')
      .replace(/^\s*\d{4}\d{4}\s*$/gm, '');
  }

  function wrapBareSparklineJson(text) {
    if (!text || text.indexOf('```sparkline') !== -1) return text;
    return text.replace(
      /^\s*\{"indicator_id"\s*:\s*"([^"]+)"\s*,\s*"country_code"\s*:\s*"([^"]+)"\s*\}\s*$/gm,
      '```sparkline\n{"indicator_id":"$1","country_code":"$2"}\n```'
    );
  }

  function removeFakeImagesFromHtml(html) {
    return html
      .replace(/<p>\s*<img[^>]*src="https?:\/\/(?:dummyimage|via\.placeholder|placehold)[^"]*"[^>]*>\s*<\/p>/gi, '')
      .replace(/<img[^>]*src="https?:\/\/(?:dummyimage|via\.placeholder|placehold)[^"]*"[^>]*>/gi, '');
  }

  function injectMissingSparklines(html, rendered, pending) {
    if (!pending || !pending.length) return html;
    if (/<div class="d360-md-sparkline">/.test(html)) return html;
    var out = html;
    pending.forEach(function (spec) {
      out += renderSparklineHtml(spec, rendered);
    });
    return out;
  }
  function stripFakeToolBlocks(text) {
    if (!text) return text;
    return String(text)
      .replace(/```(?:json|tool)?\s*\n\{\s*"name"\s*:\s*"(?:fetch_news|read_news|mcp_[^"]+)"[\s\S]*?\}\s*```/gi, '')
      .replace(/^\s*\{\s*"name"\s*:\s*"(?:fetch_news|read_news)"[\s\S]*?\}\s*$/gm, '');
  }

  function preprocessSparklines(text) {
    if (!text) return text;
    var out = stripFakeToolBlocks(text);
    out = stripFakeChartImages(out);
    out = repairSparklineFences(out);
    out = wrapBareSparklineJson(out);
    out = out.replace(/^\s*\{"alert_id"\s*:\s*"([^"]+)"\s*\}\s*$/gm, function (_, id) {
      return '```sparkline\n{"alert_id":"' + id + '"}\n```';
    });
    return out;
  }

  function renderMarkdown(text, options) {
    options = options || {};
    if (!text) return '';
    var markedFn = global.marked && global.marked.parse ? global.marked.parse.bind(global.marked) : null;
    if (!markedFn) {
      return '<pre>' + String(text).replace(/</g, '&lt;') + '</pre>';
    }

    var rendered = new Set();
    var processed = preprocessSparklines(text);
    var html = markedFn(processed, { gfm: true, breaks: false });
    html = replaceSparklineBlocks(html, rendered);
    html = removeFakeImagesFromHtml(html);
    html = injectMissingSparklines(html, rendered, options.pendingCharts);
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    if (global.D360IndicatorPills && global.D360IndicatorPills.enhanceIndicatorPills) {
      global.D360IndicatorPills.enhanceIndicatorPills(wrap);
    }
    return wrap.innerHTML;
  }

  function cacheSeriesFromTool(payload) {
    if (!payload || payload.name !== 'mcp_get_data' || payload.ok === false) return;
    var req = payload.request || {};
    var series = payload.chart_series;
    if (!series || !series.length) {
      try {
        var parsed = payload.response_text ? JSON.parse(payload.response_text) : null;
        series = extractObservations(parsed);
      } catch (_) { /* ignore */ }
    }
    if (!series || !series.length) return;

    global.D360_SPARKLINE_CACHE = global.D360_SPARKLINE_CACHE || {};
    var key = (req.indicator_id || '') + '|' + (req.country_code || '');
    if (key !== '|') global.D360_SPARKLINE_CACHE[key] = series;
    if (payload.indicator_name && req.indicator_id) {
      global.D360IndicatorPills = global.D360IndicatorPills || {};
      if (global.D360IndicatorPills.registerIndicator) {
        global.D360IndicatorPills.registerIndicator({
          idno: req.indicator_id,
          name: payload.indicator_name,
          database_id: req.database_id,
        });
      }
    }
  }

  global.D360Markdown = {
    renderMarkdown: renderMarkdown,
    resolveSparklineSeries: resolveSparklineSeries,
    cacheSeriesFromTool: cacheSeriesFromTool,
    toChartPoints: toChartPoints,
    repairSparklineFences: repairSparklineFences,
  };
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global)));
