(function () {
    "use strict";

    var panel = document.querySelector(".visitors");
    if (!panel) return;

    var status = panel.querySelector("[data-visitor-status]");

    function setState(state, message) {
        panel.dataset.state = state;
        panel.setAttribute("aria-busy", state === "loading" ? "true" : "false");
        status.textContent = message;
    }

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) {
                panel.classList.add("is-visible");
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        observer.observe(panel);
    } else {
        panel.classList.add("is-visible");
    }

    // Keep local previews and other copies out of the public site's totals.
    if (location.protocol !== "https:" || location.hostname !== "muqy1818.github.io") {
        setState("preview", "Counts appear on the published site");
        return;
    }

    setState("loading", "Loading totals");

    var callback = "__weijueVisitors_" + Date.now();
    var script = document.createElement("script");
    var timer;

    function cleanup() {
        clearTimeout(timer);
        script.remove();
        delete window[callback];
    }

    function unavailable() {
        cleanup();
        setState("unavailable", "Totals temporarily unavailable");
    }

    window[callback] = function (data) {
        if (!data || !Number.isSafeInteger(data.site_uv) || data.site_uv < 0 ||
            !Number.isSafeInteger(data.site_pv) || data.site_pv < 0) {
            unavailable();
            return;
        }

        cleanup();
        var format = new Intl.NumberFormat("en-US");
        document.querySelectorAll("[data-visitor-count]").forEach(function (element) {
            element.textContent = format.format(data[element.dataset.visitorCount]);
        });
        setState("ready", "Updated on this visit");
    };

    // Busuanzi groups site totals by referrer; send only the origin.
    script.referrerPolicy = "origin";
    script.src = "https://busuanzi.ibruce.info/busuanzi?jsonpCallback=" + callback;
    script.async = true;
    script.onerror = unavailable;
    timer = setTimeout(unavailable, 8000);
    document.head.appendChild(script);
}());
