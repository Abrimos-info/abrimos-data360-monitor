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
    var color = state === 'verified'
      ? 'var(--ok)'
      : (state === 'failed' ? 'var(--err)' : 'var(--warn)');
    var svg;
    if (state === 'verified') {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<circle cx="7" cy="7" r="6" fill="none" stroke="' + color + '" stroke-width="1.4"/>'
        + '<path d="M4 7.2 L6.2 9.4 L10 5.6" stroke="' + color + '" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>';
    } else if (state === 'pending') {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<circle cx="7" cy="7" r="6" fill="none" stroke="' + color + '" stroke-width="1.4"/>'
        + '<path d="M7 4 L7 7 L9 8.5" stroke="' + color + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
        + '</svg>';
    } else {
      svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true">'
        + '<circle cx="7" cy="7" r="6" fill="none" stroke="' + color + '" stroke-width="1.4"/>'
        + '<path d="M4 4 L10 10 M10 4 L4 10" stroke="' + color + '" stroke-width="1.4" stroke-linecap="round"/>'
        + '</svg>';
    }
    var tipHtml = '<span class="d360-vmark__tip"><strong>' + escHtml(tipTitle) + '</strong>';
    if (tipDesc) tipHtml += '<span>' + escHtml(tipDesc) + '</span>';
    tipHtml += '</span>';
    return '<span class="d360-vmark d360-vmark--' + state + '" tabindex="0" role="img" aria-label="'
      + escAttr(tipTitle) + '">' + svg + tipHtml + '</span>';
  }

  function resolveClaimDisplay(token, lang, fallback) {
    if (!token) return fallback || '';
    var field = lang === 'en' ? 'display_en' : 'display_es';
    if (token[field] && token[field].indexOf('{{claim:') === -1) return token[field];
    return fallback || String(token.value || '');
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

  function localeNumberVariants(raw, lang) {
    var n = Number(raw);
    if (!Number.isFinite(n)) return [];
    var lng = lang === 'en' ? 'en' : 'es';
    var out = [];
    out.push(n.toLocaleString(lng, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    if (Math.round(n * 10) / 10 === n) {
      out.push(n.toLocaleString(lng, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    }
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
    var tokens = (alert.claim_tokens || []).filter(function (t) { return t && t.pcn_status; });
    if (!tokens.length) return html;
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
      var replaced = renderPlainClaimMarkersHtml(raw, alert, lang);
      if (replaced.indexOf('d360-claim') === -1) return;
      var holder = document.createElement('span');
      holder.innerHTML = replaced;
      while (holder.firstChild) parent.insertBefore(holder.firstChild, node);
      parent.removeChild(node);
    });
    return wrap.innerHTML;
  }

  function renderClaimMarkersHtml(text, alert, lang) {
    if (!text) return '';
    if (/\{\{claim:/.test(text)) {
      var map = new Map((alert.claim_tokens || []).map(function (t) { return [String(t.claim_id), t]; }));
      return String(text).replace(/\{\{claim:([^}|]+)\|([^}]*)\}\}/g, function (_, id, fallback) {
        var token = map.get(String(id));
        var display = resolveClaimDisplay(token, lang, fallback || id);
        if (token && token.pcn_status) {
          return renderClaimHtml(token, display, lang);
        }
        return escHtml(display);
      });
    }
    return renderPlainClaimMarkersHtml(text, alert, lang);
  }

  window.D360PcnClaims = {
    pcnStatusToVmarkState: pcnStatusToVmarkState,
    renderVerificationMarkHtml: renderVerificationMarkHtml,
    renderClaimHtml: renderClaimHtml,
    renderClaimMarkersHtml: renderClaimMarkersHtml,
    injectClaimMarkersIntoHtml: injectClaimMarkersIntoHtml,
    resolveClaimDisplay: resolveClaimDisplay,
  };
}());
