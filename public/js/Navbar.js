(function () {
  var header = document.querySelector('.qms-header');
  var nav = document.querySelector('.qms-navbar');
  if (!nav) return;

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function isMobileNav() {
    return window.matchMedia('(max-width: 991px)').matches;
  }

  nav.addEventListener('click', function (event) {
    if (!isMobileNav()) return;
    var typeBtn = event.target.closest('.qms-type-btn');
    var menuBtn = event.target.closest('.qms-menu-btn');
    if (typeBtn) {
      event.preventDefault();
      var typeItem = typeBtn.parentElement;
      var open = typeItem.classList.contains('is-open');
      if (typeItem.parentElement) {
        Array.prototype.forEach.call(typeItem.parentElement.children, function (el) {
          if (el !== typeItem) el.classList.remove('is-open');
        });
      }
      typeItem.classList.toggle('is-open', !open);
      return;
    }
    if (menuBtn) {
      event.preventDefault();
      var item = menuBtn.parentElement;
      var willOpen = !item.classList.contains('is-open');
      Array.prototype.forEach.call(nav.querySelectorAll('.qms-cat.is-open, .qms-drop.is-open'), function (el) {
        if (el !== item) el.classList.remove('is-open');
      });
      item.classList.toggle('is-open', willOpen);
    }
  });
})();
