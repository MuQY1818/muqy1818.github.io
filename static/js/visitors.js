(function () {
    "use strict";

    var panel = document.querySelector(".visitors");
    if (!panel) return;

    var status = panel.querySelector("[data-visitor-status]");
    var retry = panel.querySelector("[data-visitor-retry]");
    var cacheKey = "weijue.visitor-totals.v1";
    var saved = null;
    var hasLiveTotals = false;
    var pending = false;
    var cancelRequest = null;

    function setState(state, message) {
        panel.dataset.state = state;
        panel.setAttribute("aria-busy", state === "loading" ? "true" : "false");
        status.textContent = message;
        retry.hidden = pending || (state !== "cached" && state !== "unavailable");
    }

    function validCounts(data) {
        return data && Number.isSafeInteger(data.site_uv) && data.site_uv >= 0 &&
            Number.isSafeInteger(data.site_pv) && data.site_pv >= 0;
    }

    function validRecord(data) {
        return validCounts(data) && typeof data.recordedAt === "string" &&
            Number.isFinite(Date.parse(data.recordedAt));
    }

    function render(record, cached) {
        var format = new Intl.NumberFormat("en-US");
        document.querySelectorAll("[data-visitor-count]").forEach(function (element) {
            element.textContent = format.format(record[element.dataset.visitorCount]);
        });
        var date = new Date(record.recordedAt);
        status.title = cached ? "Last successful reading: " + date.toISOString() : "";
        setState(cached ? "cached" : "ready", cached ?
            "Saved " + new Intl.DateTimeFormat("en-US", {
                month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
            }).format(date) : "Updated on this visit");
    }

    function showSaved() {
        if (saved) render(saved, true);
        else setState("unavailable", "Totals temporarily unavailable");
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

    try {
        var cached = JSON.parse(localStorage.getItem(cacheKey));
        if (validRecord(cached)) saved = cached;
    } catch (error) {
        // Storage is optional, including in browsers that block it.
    }

    // The same-origin snapshot also works on a first visit when analytics is blocked.
    fetch("static/data/visitor-totals.json", { cache: "no-cache" })
        .then(function (response) {
            if (!response.ok) throw new Error("Snapshot unavailable");
            return response.json();
        })
        .then(function (record) {
            if (!validRecord(record) || hasLiveTotals) return;
            if (!saved || Date.parse(record.recordedAt) > Date.parse(saved.recordedAt)) {
                saved = record;
            }
            render(saved, true);
        })
        .catch(function () {
            // Keep any existing totals while the independent live request completes.
        });

    function requestLive() {
        if (cancelRequest) cancelRequest();
        pending = true;
        if (saved) render(saved, true);
        else setState("loading", "Loading totals");

        var callback = "__weijueVisitors_" + Date.now();
        var script = document.createElement("script");
        var active = true;
        var softTimer;
        var hardTimer;

        function cleanup() {
            if (!active) return;
            active = false;
            pending = false;
            clearTimeout(softTimer);
            clearTimeout(hardTimer);
            script.remove();
            delete window[callback];
            cancelRequest = null;
        }

        function unavailable() {
            if (!active) return;
            cleanup();
            showSaved();
        }

        cancelRequest = cleanup;
        window[callback] = function (data) {
            if (!active) return;
            if (!validCounts(data)) {
                unavailable();
                return;
            }
            cleanup();
            hasLiveTotals = true;
            saved = {
                site_uv: data.site_uv,
                site_pv: data.site_pv,
                recordedAt: new Date().toISOString()
            };
            render(saved, false);
            try {
                localStorage.setItem(cacheKey, JSON.stringify(saved));
            } catch (error) {
                // The reading remains usable without persistent storage.
            }
        };

        // A slow reply can still replace the saved reading after the soft timeout.
        softTimer = setTimeout(function () {
            pending = false;
            showSaved();
        }, 20000);
        hardTimer = setTimeout(unavailable, 60000);
        script.referrerPolicy = "origin";
        script.src = "https://busuanzi.ibruce.info/busuanzi?jsonpCallback=" + callback;
        script.async = true;
        script.onerror = unavailable;
        document.head.appendChild(script);
    }

    retry.addEventListener("click", requestLive);
    requestLive();
}());
