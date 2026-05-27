'use strict';

(function () {
  function initDumbbellTabs() {
    document.querySelectorAll('.d360-dumbbell-tabs').forEach(function (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.d360-dumbbell-tab');
        if (!btn) return;
        var idx = btn.dataset.dumbbellTab;
        tabs.querySelectorAll('.d360-dumbbell-tab').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.dumbbellTab === idx);
          b.setAttribute('aria-selected', b.dataset.dumbbellTab === idx);
        });
        tabs.querySelectorAll('.d360-dumbbell-panel').forEach(function (p) {
          var active = p.dataset.dumbbellPanel === idx;
          p.classList.toggle('is-active', active);
          p.setAttribute('aria-hidden', String(!active));
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initDumbbellTabs);
}());
