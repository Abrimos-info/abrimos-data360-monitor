'use strict';

(function () {
  function init() {
    var btn = document.getElementById('d360-country-menu-btn');
    var menu = document.getElementById('d360-country-menu');
    if (!btn || !menu) return;

    function openMenu() {
      menu.style.display = '';
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('d360-country-menu-open');
    }

    function closeMenu() {
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('d360-country-menu-open');
    }

    btn.addEventListener('click', function () {
      if (menu.style.display === 'none' || !menu.style.display) openMenu();
      else closeMenu();
    });

    menu.querySelectorAll('[data-country-menu-dismiss]').forEach(function (node) {
      node.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
