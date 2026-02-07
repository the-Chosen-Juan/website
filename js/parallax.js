(function () {
    'use strict';

    // --- CONFIG ---
    var SCROLL_SPEED = 3.5;       // How fast we fly through Z per pixel scrolled
    var MOUSE_TILT = 8;           // Max degrees of mouse tilt
    var MOUSE_SMOOTH = 0.08;      // Mouse interpolation speed
    var CARD_FADE_Z = 600;        // Z threshold where cards start fading out (too close)

    // --- ELEMENTS ---
    var scene = document.getElementById('scene');
    if (!scene) return; // Only run on index page

    var sceneInner = scene.querySelector('.scene__inner');
    var cards = scene.querySelectorAll('.card');
    var bgText = document.querySelector('.world-bg-text');
    var worldWrapper = document.querySelector('.world-wrapper');

    // --- STATE ---
    var mouseX = 0, mouseY = 0;
    var currentTiltX = 0, currentTiltY = 0;
    var scrollZ = 0;
    var ticking = false;
    var maxScroll = 0;

    // Calculate page height needed for the deepest card
    var deepestZ = 0;
    cards.forEach(function (card) {
        var z = parseFloat(card.getAttribute('data-z')) || 0;
        if (z < deepestZ) deepestZ = z;
    });

    // Set world wrapper height so user can scroll through all cards
    // We need enough scroll to push camera from 0 to past the deepest card
    var totalDepth = Math.abs(deepestZ) + 2000; // extra space past last card
    var scrollHeight = totalDepth / SCROLL_SPEED;
    worldWrapper.style.height = scrollHeight + 'px';

    // --- MOUSE TRACKING ---
    document.addEventListener('mousemove', function (e) {
        // Normalized -1 to 1
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- SCROLL & RENDER ---
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(render);
            ticking = true;
        }
    }

    function render() {
        ticking = false;

        // Camera Z position based on scroll
        scrollZ = window.scrollY * SCROLL_SPEED;

        // Smooth mouse tilt
        currentTiltX += (mouseY * -MOUSE_TILT - currentTiltX) * MOUSE_SMOOTH;
        currentTiltY += (mouseX * MOUSE_TILT - currentTiltY) * MOUSE_SMOOTH;

        // Apply tilt to the inner scene
        sceneInner.style.transform =
            'rotateX(' + currentTiltX + 'deg) rotateY(' + currentTiltY + 'deg)';

        // Update each card
        cards.forEach(function (card) {
            var baseZ = parseFloat(card.getAttribute('data-z')) || 0;
            var baseX = parseFloat(card.getAttribute('data-x')) || 0;
            var baseY = parseFloat(card.getAttribute('data-y')) || 0;
            var baseR = parseFloat(card.getAttribute('data-r')) || 0;

            // Effective Z = base Z + camera scroll
            var effectiveZ = baseZ + scrollZ;

            // Opacity: fade in from far away, fade out when too close
            var opacity = 1;
            if (effectiveZ < -2000) {
                opacity = Math.max(0, 1 - (Math.abs(effectiveZ) - 2000) / 1500);
            }
            if (effectiveZ > CARD_FADE_Z) {
                opacity = Math.max(0, 1 - (effectiveZ - CARD_FADE_Z) / 400);
            }

            // Convert x/y percentages to vw/vh offsets from center
            var tx = baseX + 'vw';
            var ty = baseY + 'vh';

            card.style.transform =
                'translate3d(' + tx + ', ' + ty + ', ' + effectiveZ + 'px) ' +
                'rotate(' + baseR + 'deg)';
            card.style.opacity = opacity;

            // Hide cards that have completely flown past
            if (effectiveZ > CARD_FADE_Z + 400 || opacity <= 0) {
                card.style.visibility = 'hidden';
            } else {
                card.style.visibility = 'visible';
            }
        });

        // Background text parallax - moves slower, subtle depth
        if (bgText) {
            var bgOpacity = 1;
            if (scrollZ > Math.abs(deepestZ) * 0.8) {
                bgOpacity = Math.max(0, 1 - (scrollZ - Math.abs(deepestZ) * 0.8) / 2000);
            }
            bgText.style.opacity = bgOpacity;
            bgText.style.transform = 'translate(-50%, -50%) translateZ(' + (scrollZ * 0.15 * -1) + 'px)';
        }

        // Keep requesting frames for smooth mouse tilt even without scroll
        if (Math.abs(mouseX) > 0.01 || Math.abs(mouseY) > 0.01) {
            requestAnimationFrame(render);
        }
    }

    // Continuous render loop for smooth mouse tilt
    function loop() {
        render();
        requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(loop);

})();
