'use strict';

(function () {

  function open() {
    var el = document.getElementById('d360-newsletter');
    if (!el) return;
    el.style.display = '';
    document.body.classList.add('d360-onboard-open');
  }

  function close() {
    var el = document.getElementById('d360-newsletter');
    if (el) el.style.display = 'none';
    document.body.classList.remove('d360-onboard-open');
  }

  function init() {
    var btn = document.getElementById('d360-subscribe-btn');
    var el = document.getElementById('d360-newsletter');
    if (!btn || !el) return;

    btn.addEventListener('click', open);

    el.querySelectorAll('[data-newsletter-dismiss]').forEach(function (node) {
      node.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.style.display !== 'none') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
