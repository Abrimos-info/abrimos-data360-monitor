'use strict';

(function (root) {
  var IDNO_RE = /\b(?:WB|FAO|IMF)_[A-Z0-9_]+\b/g;
  var DATA360_BASE = 'https://data360.worldbank.org/en/int/indicators';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ui(key) {
    var lang = root.D360_LANG || 'es';
    var strings = (root.D360_STRINGS && root.D360_STRINGS[lang]) || {};
    return strings[key] || (root.D360_STRINGS && root.D360_STRINGS.en && root.D360_STRINGS.en[key]) || key;
  }

  function catalogMap() {
    var map = {};
    (root.D360_INDICATOR_CATALOG || []).forEach(function (row) {
      if (row && row.idno) map[row.idno] = row;
    });
    return map;
  }

  function registry() {
    root.D360_INDICATOR_REGISTRY = root.D360_INDICATOR_REGISTRY || {};
    return root.D360_INDICATOR_REGISTRY;
  }

  function registerIndicator(entry) {
    if (!entry || !entry.idno) return;
    var reg = registry();
    var prev = reg[entry.idno] || {};
    var cat = catalogMap()[entry.idno];
    var catName = cat && (cat.name || cat.label);
    var resolvedName = (entry.name && entry.name !== entry.idno) ? entry.name
      : (catName && catName !== entry.idno) ? catName
        : (prev.name && prev.name !== entry.idno) ? prev.name
          : (entry.label && entry.label !== entry.idno) ? entry.label
            : null;
    reg[entry.idno] = {
      idno: entry.idno,
      name: resolvedName || entry.idno,
      database_id: entry.database_id || prev.database_id || null,
      url: entry.url || prev.url || (DATA360_BASE + '/' + encodeURIComponent(entry.idno)),
    };
  }

  function registerIndicators(list) {
    (list || []).forEach(registerIndicator);
  }

  function initFromCatalog() {
    registerIndicators(root.D360_INDICATOR_CATALOG || []);
    (root.D360_ALERTS || []).forEach(function (alert) {
      var ind = alert && alert.indicator;
      if (!ind || !ind.idno) return;
      registerIndicator({
        idno: ind.idno,
        name: (ind.name && (ind.name.es || ind.name.en)) || ind.idno,
        database_id: ind.database_id,
      });
    });
  }

  function lookup(idno) {
    var reg = registry();
    var cat = catalogMap()[idno];
    var catName = cat && (cat.name || cat.label);
    var name = (reg[idno] && reg[idno].name !== idno) ? reg[idno].name
      : (catName && catName !== idno) ? catName
        : idno;
    var url = (reg[idno] && reg[idno].url)
      || (cat && cat.url)
      || (DATA360_BASE + '/' + encodeURIComponent(idno));
    return { idno: idno, name: name, url: url };
  }

  function humanName(meta) {
    return meta && meta.name && meta.name !== meta.idno ? meta.name : null;
  }

  function precedingHasHumanName(text, beforeIndex, meta) {
    var name = humanName(meta);
    if (!name || beforeIndex <= 0) return false;
    var normName = name.toLowerCase().replace(/\s+/g, ' ').trim();
    var ctx = text.slice(0, beforeIndex).replace(/\s+/g, ' ').trim().toLowerCase();
    if (!ctx) return false;
    if (ctx.endsWith(normName)) return true;
    var segments = text.slice(0, beforeIndex).split(/\n+/).map(function (s) {
      return s.trim().toLowerCase().replace(/\s+/g, ' ');
    }).filter(Boolean);
    var last = segments[segments.length - 1];
    if (!last || last === meta.idno.toLowerCase()) return false;
    if (normName.indexOf(last) >= 0 || last.indexOf(normName.slice(0, 28)) >= 0) return true;
    return false;
  }

  function renderIndicatorPill(idno, opts) {
    opts = opts || {};
    var meta = lookup(idno);
    var btnLabel = ui('chat.indicator_open');
    var name = !opts.skipName && humanName(meta);
    var pill = '<span class="d360-ind-pill">' +
      '<code class="d360-ind-pill__id">' + escapeHtml(meta.idno) + '</code>' +
      '<span class="d360-ind-pill__sep" aria-hidden="true">·</span>' +
      '<a class="d360-ind-pill__btn" href="' + escapeHtml(meta.url) + '" target="_blank" rel="noopener">' +
      escapeHtml(btnLabel) + '</a>' +
      '</span>';
    if (!name) return pill;
    return '<span class="d360-ind-ref">' +
      '<span class="d360-ind-name">' + escapeHtml(name) + '</span>' +
      pill +
      '</span>';
  }

  function renderIndicatorPills(indicators) {
    if (!indicators || !indicators.length) return '';
    var seen = {};
    var ids = [];
    indicators.forEach(function (ind) {
      if (!ind || !ind.idno || seen[ind.idno]) return;
      seen[ind.idno] = true;
      registerIndicator(ind);
      ids.push(ind.idno);
    });
    return '<div class="d360-ind-pills">' +
      ids.map(function (idno) { return renderIndicatorPill(idno); }).join('') +
      '</div>';
  }

  function shouldSkipNode(node) {
    var el = node.parentElement;
    if (!el) return true;
    if (el.closest('.d360-ind-ref, .d360-ind-pill, pre, code, a, script, style, svg, .d360-md-sparkline')) return true;
    return false;
  }

  function enhanceIndicatorPills(container) {
    if (!container || typeof document === 'undefined' || !document.createTreeWalker) return;
    var NF = typeof NodeFilter !== 'undefined' ? NodeFilter : null;
    if (!NF) return;
    var textNodes = [];
    var walker = document.createTreeWalker(container, NF.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !IDNO_RE.test(node.nodeValue)) continue;
      IDNO_RE.lastIndex = 0;
      if (shouldSkipNode(node)) continue;
      textNodes.push(node);
    }

    textNodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      IDNO_RE.lastIndex = 0;
      if (!IDNO_RE.test(text)) return;
      IDNO_RE.lastIndex = 0;

      var frag = document.createDocumentFragment();
      var last = 0;
      var match;
      var re = /\b(?:WB|FAO|IMF)_[A-Z0-9_]+\b/g;
      while ((match = re.exec(text)) !== null) {
        if (match.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        }
        var wrap = document.createElement('span');
        var meta = lookup(match[0]);
        wrap.innerHTML = renderIndicatorPill(match[0], {
          skipName: precedingHasHumanName(text, match.index, meta),
        });
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
        last = re.lastIndex;
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  initFromCatalog();

  root.D360IndicatorPills = {
    registerIndicator: registerIndicator,
    registerIndicators: registerIndicators,
    renderIndicatorPill: renderIndicatorPill,
    renderIndicatorPills: renderIndicatorPills,
    enhanceIndicatorPills: enhanceIndicatorPills,
    lookup: lookup,
    initFromCatalog: initFromCatalog,
  };
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : global)));
