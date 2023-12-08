/*
TENSION - By Hans Elley
Bulma code
 */
document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    const $menu = document.querySelector('.navbar-burger.game-menu');
    const $items = document.querySelectorAll('.navbar-item:not(.navbar-logo)');

    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {

            // Get the target from the "data-target" attribute
            const target = el.dataset.target;
            const $target = document.getElementById(target);

            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"

            AnimateMenu($target, function(active) {
                if (active) {
                    el.classList.add('is-active');
                    $target.classList.add('is-active');
                } else {
                    el.classList.remove('is-active');
                    $target.classList.remove('is-active');
                }
            });
        });
    });

    if ($items.length > 0) {
        $items.forEach(a => {
            a.addEventListener('click', function() {
                const target = $menu.dataset.target;
                const $target = document.getElementById(target);

                AnimateMenu($target, function() {
                    $target.classList.remove('is-active');

                    $navbarBurgers.forEach(el => {
                        el.classList.remove('is-active');
                    });

                    a.classList.remove('is-active');
                });
            });
        })
    }

    Listen('ReSize', function() {
        const target = $menu.dataset.target;
        const $target = document.getElementById(target);

        if (!IsMobile()) {
            $target.style.height = '100%';
            $target.classList.add('is-active');
        } else {
            $target.style.height = '0';
            $target.classList.remove('is-active');
        }

        $navbarBurgers.forEach(el => {
            el.classList.remove('is-active');
        });
    });
});

function AnimateMenu($target, callback) {
    if (!IsMobile()) {
        callback(!$target.classList.contains('is-active'));
    } else {
        // MOBILE ANIMATIONS
        let Nav = document.querySelector('.navbar-brand');
        let NavRect = Nav.getBoundingClientRect();
        let ScreenHeight = window.innerHeight;
        let MenuHeight = ScreenHeight - NavRect.height + 'px';

        if ($target.classList.contains('is-active')) {
            $target.style.height = MenuHeight;

            $target.Animate({
                height: MenuHeight
            }, {
                height: 0
            },{
                duration: 250,
                easing: 'ease-in-out',
                fill: 'forwards'
            }, function() {
                $target.style.display = 'none';

                callback(false);
            });
        } else {
            $target.style.height = 0;
            $target.style.display = 'block';

            $target.Animate({
                height: 0
            }, {
                height: MenuHeight
            },{
                duration: 250,
                easing: 'ease-in-out',
                fill: 'forwards'
            }, function() {
                callback(true);
            });
        }
    }
}