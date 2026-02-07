(function () {
    'use strict';

    var cards = document.querySelectorAll('.floating-card');
    var bgText = document.querySelector('.floating-world__bg-text');
    var floatingWorld = document.querySelector('.floating-world');
    var nav = document.querySelector('.floating-nav');
    var ticking = false;

    // Slight random rotation for each card on load
    cards.forEach(function (card) {
        var rotation = (Math.random() - 0.5) * 6; // -3 to +3 degrees
        card.setAttribute('data-rotation', rotation);
        card.style.transform = 'rotate(' + rotation + 'deg)';
    });

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    function updateParallax() {
        var scrollY = window.scrollY;
        var windowHeight = window.innerHeight;

        // Nav background on scroll
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Show/hide background text based on floating world visibility
        if (floatingWorld) {
            var rect = floatingWorld.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                floatingWorld.classList.add('in-view');
            } else {
                floatingWorld.classList.remove('in-view');
            }
        }

        // Parallax effect on floating cards
        cards.forEach(function (card) {
            var speed = parseFloat(card.getAttribute('data-speed')) || 0.5;
            var rotation = parseFloat(card.getAttribute('data-rotation')) || 0;
            var yOffset = -(scrollY * speed);

            card.style.transform = 'translateY(' + yOffset + 'px) rotate(' + rotation + 'deg)';
        });

        // Subtle parallax on background text
        if (bgText) {
            var bgOffset = scrollY * 0.15;
            bgText.style.transform = 'translate(-50%, calc(-50% + ' + bgOffset + 'px))';
        }

        ticking = false;
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial call
    updateParallax();
})();
