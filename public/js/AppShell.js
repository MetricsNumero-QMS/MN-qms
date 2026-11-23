(function () {
    var toggle = document.getElementById('qmsMenuToggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    var menu = document.getElementById('qmsUserMenu');
    var userToggle = document.getElementById('qmsUserToggle');
    if (!menu || !userToggle) return;

    function closeMenu() {
        menu.classList.remove('is-open');
        userToggle.setAttribute('aria-expanded', 'false');
    }

    userToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('is-open');
        userToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });
})();
