'use strict';

(function () {
  function mergeAlerts(alerts) {
    if (!alerts || !alerts.length) return;
    if (window.D360DetailPanel && window.D360DetailPanel.mergeAlerts) {
      window.D360DetailPanel.mergeAlerts(alerts);
    } else {
      window.D360_ALERTS = window.D360_ALERTS || [];
      alerts.forEach(function (incoming) {
        if (!incoming || !incoming.id) return;
        var idx = window.D360_ALERTS.findIndex(function (a) { return a.id === incoming.id; });
        if (idx >= 0) window.D360_ALERTS[idx] = incoming;
        else window.D360_ALERTS.push(incoming);
      });
    }
  }

  function updateEventCount() {
    var feed = document.querySelector('.d360-main__feed .d360-feed, .d360-feed');
    if (!feed) return;
    var visible = feed.querySelectorAll('[data-alert-id]:not(.d360-card--hidden)').length;
    var count = document.getElementById('d360-event-count');
    if (count) count.textContent = String(visible);
    var emptyFiltered = document.getElementById('d360-empty-filtered');
    if (emptyFiltered) {
      emptyFiltered.style.display = (visible === 0 && feed.querySelectorAll('[data-alert-id]').length > 0) ? '' : 'none';
    }
  }

  function upsertAlertsInFeed(alerts, lang) {
    if (!alerts || !alerts.length) return 0;
    mergeAlerts(alerts);
    var feed = document.querySelector('.d360-main__feed .d360-feed, .d360-feed');
    if (!feed || !window.D360ChatCards || !window.D360ChatCards.renderAlertCards) return 0;

    var lng = lang || window.D360_LANG || 'es';
    var added = 0;
    alerts.forEach(function (alert) {
      if (!alert || !alert.id) return;
      if (feed.querySelector('[data-alert-id="' + CSS.escape(alert.id) + '"]')) return;
      var html = window.D360ChatCards.renderAlertCards([alert], lng);
      if (!html) return;
      feed.insertAdjacentHTML('beforeend', html);
      var card = feed.querySelector('[data-alert-id="' + CSS.escape(alert.id) + '"]');
      if (card && window.D360DetailPanel && window.D360DetailPanel.bindCard) {
        window.D360DetailPanel.bindCard(card);
      }
      added += 1;
    });
    if (added) updateEventCount();
    return added;
  }

  function notifyAlertsUpdated() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        var channel = new BroadcastChannel('d360-alerts');
        channel.postMessage({ type: 'updated', at: Date.now() });
        channel.close();
      }
    } catch (_) { /* ignore */ }
  }

  async function refreshAlertsFromServer(lang) {
    try {
      var res = await fetch('/api/alerts', { cache: 'no-store' });
      if (!res.ok) return 0;
      var data = await res.json();
      return upsertAlertsInFeed(data.alerts || [], lang);
    } catch (_) {
      return 0;
    }
  }

  function bindRefreshOnFocus(lang) {
    window.addEventListener('focus', function () {
      refreshAlertsFromServer(lang);
    });
    if (typeof BroadcastChannel !== 'undefined') {
      var channel = new BroadcastChannel('d360-alerts');
      channel.addEventListener('message', function (ev) {
        if (ev.data && ev.data.type === 'updated') {
          refreshAlertsFromServer(lang);
        }
      });
    }
  }

  window.D360AlertsFeed = {
    mergeAlerts: mergeAlerts,
    upsertAlertsInFeed: upsertAlertsInFeed,
    refreshAlertsFromServer: refreshAlertsFromServer,
    notifyAlertsUpdated: notifyAlertsUpdated,
    bindRefreshOnFocus: bindRefreshOnFocus,
  };
}());
