'use strict';

(function () {
  function uiString(key, lang) {
    var strings = window.D360_STRINGS || {};
    var bag = strings[lang] || {};
    return bag[key] || key;
  }

  function pickLang() {
    return window.D360_LANG === 'en' ? 'en' : 'es';
  }

  function initArticle() {
    var alert = window.D360_ALERT;
    if (!alert) return;
    var lng = pickLang();
    var renderClaims = window.D360PcnClaims && window.D360PcnClaims.renderClaimMarkersHtml
      ? function (text) { return window.D360PcnClaims.renderClaimMarkersHtml(text, alert, lng); }
      : (window.D360DetailPanel && window.D360DetailPanel.renderClaimMarkersHtml
        ? function (text) { return window.D360DetailPanel.renderClaimMarkersHtml(text, alert, lng); }
        : null);

    var normalizeClaims = window.D360PcnClaims && window.D360PcnClaims.normalizeClaimMarkerText
      ? window.D360PcnClaims.normalizeClaimMarkerText.bind(window.D360PcnClaims)
      : function (t) { return t; };

    var leadEl = document.getElementById('d360-article-lead');
    var leadText = alert.lead && alert.lead[lng];
    if (leadEl && leadText && renderClaims) {
      leadEl.innerHTML = renderClaims(normalizeClaims(leadText));
    }

    var storyEl = document.getElementById('d360-article-story');
    var storyText = alert.story && alert.story[lng];
    if (!storyText && alert.body) storyText = alert.body[lng];
    if (storyEl && storyText) {
      storyText = normalizeClaims(storyText);
      var storyHtml = storyText;
      if (window.D360Markdown && window.D360Markdown.renderMarkdown) {
        storyHtml = window.D360Markdown.renderMarkdown(storyText);
      } else if (window.marked) {
        storyHtml = window.marked.parse(storyText, { gfm: true, breaks: false });
      }
      if (window.D360PcnClaims && window.D360PcnClaims.injectClaimMarkersIntoHtml) {
        storyHtml = window.D360PcnClaims.injectClaimMarkersIntoHtml(storyHtml, alert, lng);
      } else if (renderClaims) {
        storyHtml = renderClaims(storyText);
      }
      storyEl.innerHTML = storyHtml;
    }

    var chartEl = document.getElementById('d360-article-chart');
    if (chartEl && alert.chart_series && window.D360Charts) {
      chartEl.innerHTML = window.D360Charts.renderChartSvg(alert.chart_series);
    }

    if (window.D360Chat && window.D360Chat.initScoped) {
      window.D360Chat.initScoped({
        alertId: alert.id,
        container: document.querySelector('.d360-alert-chat'),
        panelEl: document.querySelector('.d360-alert-chat__panel'),
        messagesEl: document.getElementById('d360-alert-chat-messages'),
        presetsEl: document.getElementById('d360-alert-chat-presets'),
        formEl: document.getElementById('d360-alert-chat-form'),
        inputEl: document.getElementById('d360-alert-chat-input'),
        sendEl: document.getElementById('d360-alert-chat-send'),
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initArticle);
}());
