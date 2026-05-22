'use strict';

(function () {
  function initLangToggle() {
    var buttons = document.querySelectorAll('.d360-lang__btn');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lang');
        var url = new URL(window.location.href);
        url.searchParams.set('langMode', mode);
        if (mode === 'es' || mode === 'en') {
          url.searchParams.set('lang', mode);
        }
        window.location.href = url.toString();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangToggle);
  } else {
    initLangToggle();
  }
}());
