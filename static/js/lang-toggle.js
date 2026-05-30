'use strict';

(function () {
  function initLangToggle() {
    var buttons = document.querySelectorAll('.d360-lang__btn');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lang');
        if (mode !== 'es' && mode !== 'en') return;
        var url = new URL(window.location.href);
        url.searchParams.set('lang', mode);
        url.searchParams.delete('langMode');
        document.cookie = 'd360_lang=' + mode + '; Path=/; Max-Age=31536000; SameSite=Lax';
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
