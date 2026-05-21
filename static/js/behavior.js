'use strict';

(function () {

  // ---------------------------------------------------------------
  // Escape helpers — used when building innerHTML strings
  // ---------------------------------------------------------------
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

  // ---------------------------------------------------------------
  // Subscribe button (newsletter is non-functional per D-009)
  // ---------------------------------------------------------------
  function initSubscribeButton() {
    var btn = document.getElementById('d360-subscribe-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.alert('Newsletter coming soon.');
    });
  }

  // ---------------------------------------------------------------
  // Filters: show/hide cards client-side, sync URL
  // ---------------------------------------------------------------
  function initFilters() {
    var country = document.getElementById('d360-filter-country');
    var category = document.getElementById('d360-filter-category');
    var variant = document.getElementById('d360-filter-variant');
    if (!country || !category) return;

    if (variant) {
      variant.addEventListener('change', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.value);
        window.location.href = url.toString();
      });
    }

    function apply() {
      var c = country.value;
      var k = category.value;
      var cards = document.querySelectorAll('[data-alert-id]');
      var visible = 0;
      cards.forEach(function (card) {
        var cc = card.getAttribute('data-country');
        var ck = card.getAttribute('data-category');
        var hide = (c !== 'ALL' && c !== cc) || (k !== 'ALL' && k !== ck);
        card.classList.toggle('d360-card--hidden', hide);
        if (!hide) visible++;
      });
      var count = document.getElementById('d360-event-count');
      if (count) count.textContent = String(visible);
      syncUrl({ country: c, category: k });
      toggleEmptyFiltered(visible === 0 && cards.length > 0);
    }

    country.addEventListener('change', apply);
    category.addEventListener('change', apply);
  }

  function toggleEmptyFiltered(show) {
    var el = document.getElementById('d360-empty-filtered');
    if (el) el.style.display = show ? '' : 'none';
  }

  function syncUrl(params) {
    var url = new URL(window.location.href);
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === null || v === undefined || v === 'ALL') {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, v);
      }
    });
    history.replaceState(null, '', url.toString());
  }

  // ---------------------------------------------------------------
  // Language toggle
  // ---------------------------------------------------------------
  function initLangToggle() {
    var buttons = document.querySelectorAll('.d360-lang__btn');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lang');
        var url = new URL(window.location.href);
        url.searchParams.set('langMode', mode);
        window.location.href = url.toString();
      });
    });
  }

  // ---------------------------------------------------------------
  // Card clicks
  // ---------------------------------------------------------------
  function initCardClicks() {
    var cards = document.querySelectorAll('[data-alert-id]');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        openDetail(card.getAttribute('data-alert-id'));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail(card.getAttribute('data-alert-id'));
        }
      });
    });
  }

  // ---------------------------------------------------------------
  // Detail panel
  // ---------------------------------------------------------------

  function renderChartSvg(series) {
    var w = 520, h = 140;
    var padL = 28, padR = 12, padT = 12, padB = 22;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var values = series.map(function (p) { return p.value; });
    var avgs = series
      .filter(function (p) { return p.regional_avg !== undefined; })
      .map(function (p) { return p.regional_avg; });
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

    return '<svg class="d360-chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="Historical series">' +
      '<line class="d360-chart__axis" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + (h - padB) + '" y2="' + (h - padB) + '"/>' +
      '<path class="d360-chart__area" d="' + escAttr(areaPath) + '"/>' +
      '<polyline class="d360-chart__line" points="' + escAttr(linePoints) + '"/>' +
      avgLine + dots +
      '<text class="d360-chart__label" x="' + padL + '" y="' + (h - 6) + '">' + escHtml(series[0].period) + '</text>' +
      '<text class="d360-chart__label" x="' + (w - padR) + '" y="' + (h - 6) + '" text-anchor="end">' + escHtml(series[series.length - 1].period) + '</text>' +
      '<text class="d360-chart__label" x="4" y="' + (yFn(maxV) + 3) + '">' + (Math.round(maxV * 100) / 100) + '</text>' +
      '<text class="d360-chart__label" x="4" y="' + (yFn(minV) + 3) + '">' + (Math.round(minV * 100) / 100) + '</text>' +
      '</svg>';
  }

  function renderBindings(node, alert, lang) {
    var lng = (lang === 'en') ? 'en' : 'es';

    function bind(name, html) {
      var el = node.querySelector('[data-bind="' + name + '"]');
      if (el) el.innerHTML = html;
    }

    bind('countryTag',
      '<span class="d360-country"><span class="d360-country__iso">' + escHtml(alert.country) + '</span></span>');

    bind('category', escHtml(alert.category));

    var chipCls = alert.type === 'abrupt_change' ? 'abrupt' : 'anomaly';
    var chipLabel = alert.type === 'abrupt_change' ? 'Abrupt change' : 'Anomaly';
    var chipSvg = alert.type === 'abrupt_change'
      ? '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M1 8 L4 4 L6 6 L9 2" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M2 5 L4 5 M6 5 L8 5 M5 2 L5 8" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round"/></svg>';
    bind('typeChip',
      '<span class="d360-typechip d360-typechip--' + chipCls + '">' +
      '<span class="d360-typechip__shape" aria-hidden="true">' + chipSvg + '</span>' +
      '<span>' + escHtml(chipLabel) + '</span></span>');

    bind('title', escHtml(alert.indicator.name[lng]));
    bind('idno', escHtml(alert.indicator.idno));

    var displayVal = alert.observation.display
      ? alert.observation.display[lng]
      : String(alert.observation.value);
    bind('value', escHtml(displayVal));
    bind('period', escHtml(alert.observation.time_period));

    var magText = String(alert.magnitude ? alert.magnitude[lng] : '');
    var magSign = magText.charAt(0) === '+'
      ? 'up'
      : (magText.charAt(0) === '−' || magText.charAt(0) === '-') ? 'down' : 'neutral';
    bind('magnitude', '<span class="d360-mag d360-mag--' + magSign + '">' + escHtml(magText) + '</span>');

    var citizen = alert.narrative_citizen ? alert.narrative_citizen[lng] : '';
    var journalist = alert.narrative_journalist ? alert.narrative_journalist[lng] : '';
    bind('narrativeCitizen', escHtml(citizen));
    bind('narrativeJournalist', escHtml(journalist));

    var chartEl = node.querySelector('[data-bind="chart"]');
    if (chartEl && alert.chart_series && alert.chart_series.length) {
      chartEl.innerHTML = renderChartSvg(alert.chart_series);
    }

    var traceEl = node.querySelector('[data-bind="trace"]');
    if (traceEl && alert.verification_trace) {
      var t = alert.verification_trace;
      var items = [];
      if (t.data360_dataset_url) {
        items.push(
          '<li><span class="d360-trace__num">1</span>' +
          '<a class="d360-trace__link" href="' + escAttr(t.data360_dataset_url) + '" target="_blank" rel="noopener">Data360 dataset</a>' +
          '<span class="d360-trace__hint">data360.worldbank.org</span></li>'
        );
      }
      if (t.csv_link) {
        items.push(
          '<li><span class="d360-trace__num">2</span>' +
          '<a class="d360-trace__link" href="' + escAttr(t.csv_link) + '" target="_blank" rel="noopener">CSV download</a>' +
          '<span class="d360-trace__hint">.csv</span></li>'
        );
      }
      if (t.methodology_ref) {
        items.push(
          '<li><span class="d360-trace__num">3</span>' +
          '<span>' + escHtml(t.methodology_ref) + '</span>' +
          '<span class="d360-trace__hint">methodology</span></li>'
        );
      }
      traceEl.innerHTML = items.join('');
    }

    var metaEl = node.querySelector('[data-bind="meta"]');
    if (metaEl) {
      metaEl.innerHTML = [
        '<div><dt>Country</dt><dd>' + escHtml(alert.country) + '</dd></div>',
        '<div><dt>Category</dt><dd>' + escHtml(alert.category) + '</dd></div>',
        '<div><dt>Score</dt><dd>' + escHtml(String(alert.score != null ? alert.score : '')) + '</dd></div>',
        '<div><dt>Detected</dt><dd>' + escHtml(alert.detected_at ? alert.detected_at.slice(0, 10) : '') + '</dd></div>',
      ].join('');
    }

    var previewText = (journalist || citizen || '').slice(0, 80);
    bind('copyPreview', escHtml(previewText + (previewText.length >= 80 ? '...' : '')));

    var copyBtn = node.querySelector('.d360-detail__copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var traceUrl = alert.verification_trace && alert.verification_trace.data360_dataset_url
          ? alert.verification_trace.data360_dataset_url
          : 'https://data360.worldbank.org';
        var text = (journalist || citizen) + '\n\nSource: ' + traceUrl;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
        } else if (window.clipboardData) {
          window.clipboardData.setData('text', text);
        }
      });
    }
  }

  function openDetail(alertId) {
    var alerts = window.D360_ALERTS || [];
    var found = null;
    for (var i = 0; i < alerts.length; i++) {
      if (alerts[i].id === alertId) { found = alerts[i]; break; }
    }
    if (!found) return;

    closeDetail(true);

    var langMode = window.D360_LANG_MODE || 'both';
    var lang = (langMode === 'es') ? 'es' : 'en';

    var tpl = document.getElementById('d360-detail-tpl');
    if (!tpl) return;

    var fragment = document.importNode(tpl.content, true);
    var panel = fragment.firstElementChild;
    renderBindings(panel, found, lang);

    var closeBtn = panel.querySelector('.d360-detail__close');
    if (closeBtn) closeBtn.addEventListener('click', function () { closeDetail(false); });

    document.body.appendChild(panel);
    syncUrl({ alert: alertId });

    var firstFocusable = panel.querySelector('button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeDetail(skipSync) {
    var existing = document.querySelector('.d360-detail');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    if (!skipSync) syncUrl({ alert: null });
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function init() {
    initSubscribeButton();
    initFilters();
    initLangToggle();
    initCardClicks();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDetail(false);
    });

    var initialAlert = window.D360_FILTERS && window.D360_FILTERS.alert;
    if (initialAlert) openDetail(initialAlert);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
