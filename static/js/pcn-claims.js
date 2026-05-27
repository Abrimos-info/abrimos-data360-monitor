'use strict';

(function () {

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

  function uiString(key, lang) {
    var strings = window.D360_STRINGS || {};
    var bag = strings[lang] || strings.es || {};
    if (bag[key]) return bag[key];
    if (lang !== 'en' && strings.en && strings.en[key]) return strings.en[key];
    return null;
  }

  function pcnStatusToVmarkState(pcnStatus) {
    if (pcnStatus === 'rejected') return 'failed';
    if (pcnStatus === 'unverified') return 'pending';
    if (pcnStatus === 'verified') return 'verified';
    return null;
  }

  function claimTipCopy(state, token, lang) {
    var lng = lang === 'en' ? 'en' : 'es';
    if (state === 'failed') {
      return {
        title: uiString('pcn.failed.title', lng) || (lng === 'en' ? 'Verification failed' : 'Verificación fallida'),
        desc: token && token.pcn_reason
          ? token.pcn_reason
          : (uiString('pcn.failed.desc', lng) || (lng === 'en'
            ? 'Could not verify against local CSV data.'
            : 'No se pudo verificar contra los CSV locales.')),
      };
    }
    if (state === 'pending') {
      return {
        title: uiString('pcn.pending.title', lng) || (lng === 'en' ? 'Unverified' : 'Sin verificar'),
        desc: (token && token.pcn_reason)
          || uiString('pcn.pending.desc', lng)
          || (lng === 'en' ? 'Not checked against local data.' : 'Sin verificación contra datos locales.'),
      };
    }
    return {
      title: uiString('pcn.verified.title', lng) || (lng === 'en' ? 'Verified' : 'Verificado'),
      desc: (token && token.pcn_reason)
        || uiString('pcn.verified.desc', lng)
        || (lng === 'en'
          ? 'Mechanically checked against the source.'
          : 'Comprobado mecánicamente contra la fuente.'),
    };
  }

  function renderVerificationMarkHtml(state, tipTitle, tipDesc, size) {
    size = size || 12;
    var stroke = state === 'failed' ? 'var(--err)' : 'var(--warn)';
    var svg;
    if (state === 'verified') {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<rect class="d360-vmark__diamond" x="3" y="3" width="8" height="8" rx="0.5" transform="rotate(45 7 7)" fill="#0083C8"/>'
        + '</svg>';
    } else if (state === 'pending') {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<rect class="d360-vmark__diamond" x="3" y="3" width="8" height="8" rx="0.5" transform="rotate(45 7 7)" fill="none" stroke="' + stroke + '" stroke-width="1.5"/>'
        + '</svg>';
    } else {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<rect class="d360-vmark__diamond" x="3" y="3" width="8" height="8" rx="0.5" transform="rotate(45 7 7)" fill="none" stroke="' + stroke + '" stroke-width="1.5"/>'
        + '</svg>';
    }
    var tipHtml = '<span class="d360-vmark__tip"><strong>' + escHtml(tipTitle) + '</strong>';
    if (tipDesc) tipHtml += '<span>' + escHtml(tipDesc) + '</span>';
    tipHtml += '</span>';
    return '<span class="d360-vmark d360-vmark--' + state + '" tabindex="0" role="img" aria-label="'
      + escAttr(tipTitle) + '">' + svg + tipHtml + '</span>';
  }

  function coerceClaimValue(raw) {
    if (raw == null) return null;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    var trimmed = String(raw).trim().replace(/%/g, '').trim();
    if (!trimmed) return null;
    if (/^-?\d{1,3}(\.\d{3})*,\d+$/.test(trimmed) || /^-?\d+,\d+$/.test(trimmed)) {
      var esFirst = Number(trimmed.replace(/\./g, '').replace(',', '.'));
      if (Number.isFinite(esFirst)) return esFirst;
    }
    var en = Number(trimmed.replace(/,/g, ''));
    if (Number.isFinite(en)) return en;
    var es = Number(trimmed.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(es)) return es;
    return null;
  }

  function claimValuesMatch(a, b) {
    var na = coerceClaimValue(a);
    var nb = coerceClaimValue(b);
    if (na != null && nb != null) {
      return Math.abs(na - nb) <= Math.max(0.001, Math.abs(na) * 1e-6);
    }
    return String(a == null ? '' : a).trim() === String(b == null ? '' : b).trim();
  }

  function findClaimToken(tokens, claimId, fallback) {
    var id = String(claimId || '');
    var list = (tokens || []).filter(function (t) { return t && String(t.claim_id) === id; });
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (claimValuesMatch(t.value, fallback)) return t;
      if (claimValuesMatch(t.display_es, fallback)) return t;
      if (claimValuesMatch(t.display_en, fallback)) return t;
    }
    return list[0];
  }

  function normalizeClaimMarkerText(text) {
    if (!text || text.indexOf('{{claim:') === -1) return text;
    return String(text).replace(/\{\{claim:([\s\S]*?)\}\}/g, function (full, inner) {
      var pipe = inner.indexOf('|');
      if (pipe === -1) return full;
      var cid = inner.slice(0, pipe).replace(/\s+/g, '');
      var val = inner.slice(pipe + 1).replace(/\s+/g, '');
      return '{{claim:' + cid + '|' + val + '}}';
    });
  }

  function resolveClaimDisplay(token, lang, fallback) {
    var fb = fallback != null ? String(fallback).trim() : '';
    if (fb && fb.indexOf('{{claim:') === -1) return fb;
    if (!token) return fb;
    var field = lang === 'en' ? 'display_en' : 'display_es';
    if (token[field] && token[field].indexOf('{{claim:') === -1) return token[field];
    return fb || String(token.value || '');
  }

  function renderClaimHtml(token, display, lang) {
    var state = pcnStatusToVmarkState(token && token.pcn_status);
    if (!state) {
      return '<span class="d360-claim__num">' + escHtml(display) + '</span>';
    }
    var tips = claimTipCopy(state, token, lang);
    var claimCls = 'd360-claim';
    if (state === 'failed') claimCls += ' d360-claim--failed';
    else if (state === 'verified') claimCls += ' d360-claim--verified';
    else if (state === 'pending') claimCls += ' d360-claim--pending';
    var idAttr = token && token.claim_id
      ? ' data-claim-id="' + escAttr(token.claim_id) + '" data-pcn-status="' + escAttr(token.pcn_status) + '"'
      : '';
    return '<span class="' + claimCls + '"' + idAttr + '>'
      + '<span class="d360-claim__num">' + escHtml(display) + '</span>'
      + renderVerificationMarkHtml(state, tips.title, tips.desc, 12)
      + '</span>';
  }

  function formatManualNumber(n, lang, decimals) {
    if (!Number.isFinite(n)) return null;
    var d = decimals == null ? 2 : decimals;
    var fixed = n.toFixed(d);
    var parts = fixed.split('.');
    var intPart = parts[0];
    var decPart = parts[1];
    if (lang === 'en') {
      var groupedEn = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return d > 0 && decPart ? groupedEn + '.' + decPart : groupedEn;
    }
    var groupedEs = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return d > 0 && decPart ? groupedEs + ',' + decPart : groupedEs;
  }

  function localeNumberVariants(raw, lang) {
    var n = Number(raw);
    if (!Number.isFinite(n)) return [];
    var lng = lang === 'en' ? 'en' : 'es';
    var out = [];
    [0, 1, 2, 3].forEach(function (d) {
      var manual = formatManualNumber(n, lng, d);
      if (manual) out.push(manual);
      out.push(n.toLocaleString(lng, { minimumFractionDigits: d, maximumFractionDigits: d }));
    });
    return out;
  }

  function claimSearchVariants(token, lang) {
    var variants = new Set();
    var display = resolveClaimDisplay(token, lang);
    if (display) variants.add(display);
    if (token.value != null && String(token.value) !== display) variants.add(String(token.value));
    localeNumberVariants(token.value, lang).forEach(function (v) { variants.add(v); });
    var field = lang === 'en' ? 'display_en' : 'display_es';
    if (token[field] && token[field].indexOf('{{claim:') === -1) variants.add(token[field]);
    var other = lang === 'en' ? token.display_es : token.display_en;
    if (other && other.indexOf('{{claim:') === -1) variants.add(other);
    return Array.from(variants).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
  }

  function renderPlainClaimMarkersHtml(text, alert, lang) {
    var tokens = (alert.claim_tokens || []).filter(function (t) { return t && t.pcn_status; });
    if (!tokens.length) return escHtml(text);
    var usedClaims = new Set();
    var matches = [];
    tokens.forEach(function (token) {
      if (usedClaims.has(token.claim_id)) return;
      var matched = false;
      claimSearchVariants(token, lang).some(function (needle) {
        var idx = text.indexOf(needle);
        if (idx === -1) return false;
        matches.push({ idx: idx, len: needle.length, token: token, display: needle });
        usedClaims.add(token.claim_id);
        matched = true;
        return true;
      });
      if (matched) return;
    });
    if (!matches.length) return escHtml(text);
    matches.sort(function (a, b) { return a.idx - b.idx || b.len - a.len; });
    var filtered = [];
    var cursor = -1;
    matches.forEach(function (m) {
      if (m.idx < cursor) return;
      filtered.push(m);
      cursor = m.idx + m.len;
    });
    var out = '';
    var pos = 0;
    filtered.forEach(function (m) {
      out += escHtml(text.slice(pos, m.idx));
      out += renderClaimHtml(m.token, m.display, lang);
      pos = m.idx + m.len;
    });
    out += escHtml(text.slice(pos));
    return out;
  }

  function injectClaimMarkersIntoHtml(html, alert, lang) {
    if (!html || !alert) return html || '';
    var hasMarkers = html.indexOf('{{claim:') !== -1;
    var tokens = alert.claim_tokens || [];
    if (!hasMarkers && !tokens.some(function (t) { return t && t.pcn_status; })) return html;
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (node) {
      var parent = node.parentElement;
      if (!parent || parent.closest('.d360-claim, .d360-vmark, .d360-hypothesis')) return;
      var raw = node.textContent;
      if (!raw || !raw.trim()) return;
      var replaced = renderClaimMarkersHtml(raw, alert, lang);
      if (replaced.indexOf('d360-claim') === -1 && replaced.indexOf('{{claim:') !== -1) return;
      if (replaced === escHtml(raw)) return;
      var holder = document.createElement('span');
      holder.innerHTML = replaced;
      while (holder.firstChild) parent.insertBefore(holder.firstChild, node);
      parent.removeChild(node);
    });
    return wrap.innerHTML;
  }

  function renderClaimMarkersHtml(text, alert, lang) {
    if (!text) return '';
    var normalized = normalizeClaimMarkerText(text);
    if (/\{\{claim:/.test(normalized)) {
      var tokens = alert.claim_tokens || [];
      return String(normalized).replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, function (_, id, fallback) {
        var token = findClaimToken(tokens, id, fallback);
        var display = resolveClaimDisplay(token, lang, fallback || id);
        if (token && token.pcn_status) {
          return renderClaimHtml(token, display, lang);
        }
        return escHtml(display);
      });
    }
    return renderPlainClaimMarkersHtml(normalized, alert, lang);
  }

  window.D360PcnClaims = {
    pcnStatusToVmarkState: pcnStatusToVmarkState,
    renderVerificationMarkHtml: renderVerificationMarkHtml,
    renderClaimHtml: renderClaimHtml,
    renderClaimMarkersHtml: renderClaimMarkersHtml,
    injectClaimMarkersIntoHtml: injectClaimMarkersIntoHtml,
    normalizeClaimMarkerText: normalizeClaimMarkerText,
    resolveClaimDisplay: resolveClaimDisplay,
    findClaimToken: findClaimToken,
  };
}());
