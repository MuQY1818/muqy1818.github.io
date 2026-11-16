(function () {
    "use strict";

    var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var nav = document.querySelector(".topnav");
    var links = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
    var sections = links.map(function (link) {
        return { link: link, section: document.getElementById(link.hash.slice(1)) };
    }).filter(function (entry) { return entry.section; });
    var framePending = false;
    var videoUpdates = [];

    function updateNavigation() {
        framePending = false;
        if (!nav || !sections.length) return;
        var boundary = nav.getBoundingClientRect().bottom + 48;
        var current = sections[0];
        sections.forEach(function (entry) {
            if (entry.section.getBoundingClientRect().top <= boundary) current = entry;
        });
        sections.forEach(function (entry) {
            if (entry === current) entry.link.setAttribute("aria-current", "location");
            else entry.link.removeAttribute("aria-current");
        });
    }

    function queueNavigation() {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(updateNavigation);
    }

    function measureNavigation() {
        if (nav) {
            document.documentElement.style.setProperty("--nav-height", nav.offsetHeight + "px");
        }
        queueNavigation();
    }

    if (nav) {
        window.addEventListener("scroll", queueNavigation, { passive: true });
        window.addEventListener("resize", measureNavigation);
        if ("ResizeObserver" in window) {
            new ResizeObserver(measureNavigation).observe(nav);
        }
        measureNavigation();
    }

    document.querySelectorAll("[data-preview-video]").forEach(function (video) {
        var card = video.closest(".pub");
        var visible = !("IntersectionObserver" in window);

        // Muted previews loop while on screen; no controls, no autoplay under reduced motion.
        function updatePlayback() {
            var shouldPlay = visible && !card.hidden && !document.hidden && !motion.matches;
            if (shouldPlay) {
                var playback = video.play();
                if (playback) playback.catch(function () {});
            } else {
                video.pause();
            }
        }

        document.addEventListener("visibilitychange", updatePlayback);
        if (motion.addEventListener) motion.addEventListener("change", updatePlayback);
        else motion.addListener(updatePlayback);
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
                updatePlayback();
            }, { threshold: 0.25 }).observe(video.closest(".pub-media"));
        }
        videoUpdates.push(updatePlayback);
        updatePlayback();
    });

    // Write the closing signature once, the first time it scrolls into view.
    var signature = document.querySelector(".signature");
    if (signature && "IntersectionObserver" in window && !motion.matches) {
        signature.classList.add("is-armed");
        var signatureObserver = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            signature.getBoundingClientRect();
            signature.classList.add("is-drawn");
            signatureObserver.disconnect();
        }, { threshold: 0.6 });
        signatureObserver.observe(signature);
    }

    var filters = document.querySelector(".publication-filters");
    if (filters) {
        var buttons = Array.from(filters.querySelectorAll("[data-filter]"));
        var cards = Array.from(document.querySelectorAll(".pub[data-topic]"));
        var groups = Array.from(document.querySelectorAll(".publication-group"));
        var status = document.querySelector("[data-filter-status]");
        var currentTopic = null;

        function selectTopic(topic, animate) {
            if (topic === currentTopic) return;
            currentTopic = topic;
            var count = 0;
            buttons.forEach(function (button) {
                button.setAttribute("aria-pressed", String(button.dataset.filter === topic));
            });
            cards.forEach(function (card) {
                var wasHidden = card.hidden;
                var show = topic === "all" || card.dataset.topic === topic;
                if (card.getAnimations) {
                    card.getAnimations().forEach(function (animation) { animation.cancel(); });
                }
                card.hidden = !show;
                if (show) {
                    count++;
                    if (animate && wasHidden && !motion.matches && card.animate) {
                        card.animate([
                            { opacity: 0.35, transform: "translateY(5px)" },
                            { opacity: 1, transform: "translateY(0)" }
                        ], { duration: 180, easing: "ease-out" });
                    }
                }
            });
            groups.forEach(function (group) {
                group.hidden = !Array.from(group.querySelectorAll(".pub")).some(function (card) {
                    return !card.hidden;
                });
            });
            status.textContent = count + " publication" + (count === 1 ? "" : "s") +
                (topic === "all" ? " shown." : " in " + topic + ".");
            videoUpdates.forEach(function (update) { update(); });
            queueNavigation();
        }

        buttons.forEach(function (button, index) {
            button.addEventListener("click", function () { selectTopic(button.dataset.filter, true); });
            button.addEventListener("keydown", function (event) {
                var next = index;
                if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
                else if (event.key === "ArrowLeft") next = (index + buttons.length - 1) % buttons.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = buttons.length - 1;
                else return;
                event.preventDefault();
                buttons[next].focus();
                selectTopic(buttons[next].dataset.filter, true);
            });
        });
        filters.hidden = false;
        status.hidden = false;
        selectTopic("all", false);
    }
}());
