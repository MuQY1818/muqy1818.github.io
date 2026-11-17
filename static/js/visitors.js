(function () {
    "use strict";

    var panel = document.querySelector(".visitors");
    if (!panel) return;

    var provider = "weijue-analytics-v1";
    var cacheKey = "weijue.visitor-totals.v2";
    var browserKey = "weijue.visitor-id.v1";
    var uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var status = panel.querySelector("[data-visitor-status]");
    var retry = panel.querySelector("[data-visitor-retry]");
    var since = panel.querySelector("[data-visitor-started]");
    var saved = null;
    var hasLiveTotals = false;
    var pending = false;
    var apiBase = null;
    var production = location.protocol === "https:" && location.hostname === "muqy1818.github.io";

    function setState(state, message) {
        panel.dataset.state = state;
        panel.setAttribute("aria-busy", pending ? "true" : "false");
        status.textContent = message;
        retry.hidden = pending || !production;
    }

    function validRecord(data) {
        return data && data.provider === provider &&
            Number.isSafeInteger(data.site_uv) && data.site_uv >= 0 &&
            Number.isSafeInteger(data.site_pv) && data.site_pv >= data.site_uv &&
            typeof data.recordedAt === "string" && Number.isFinite(Date.parse(data.recordedAt)) &&
            typeof data.startedAt === "string" && Number.isFinite(Date.parse(data.startedAt)) &&
            Date.parse(data.startedAt) <= Date.parse(data.recordedAt) &&
            Date.parse(data.recordedAt) <= Date.now() + 300000;
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
        }).format(new Date(value));
    }

    function render(record, cached) {
        var format = new Intl.NumberFormat("en-US");
        document.querySelectorAll("[data-visitor-count]").forEach(function (element) {
            element.textContent = format.format(record[element.dataset.visitorCount]);
        });
        if (since) since.textContent = "Counting since " + formatDate(record.startedAt) + ".";
        status.title = "Reading taken at " + record.recordedAt;
        setState(cached ? "cached" : "ready", cached ?
            "Live stats unavailable \u00b7 saved " + formatDate(record.recordedAt) : "Updated just now");
    }

    function showSaved() {
        if (saved) render(saved, true);
        else setState("unavailable", "Live stats temporarily unavailable");
    }

    function finishRequest() {
        pending = false;
        panel.setAttribute("aria-busy", "false");
        retry.hidden = !production;
    }

    function acceptRecord(data, live) {
        if (!validRecord(data)) throw new Error("Invalid totals");
        if (!live && hasLiveTotals) return;
        if (live || !saved || Date.parse(data.recordedAt) > Date.parse(saved.recordedAt)) {
            if (live && hasLiveTotals && saved.startedAt === data.startedAt &&
                Date.parse(data.recordedAt) < Date.parse(saved.recordedAt)) return;
            saved = {
                provider: provider, site_uv: data.site_uv, site_pv: data.site_pv,
                recordedAt: data.recordedAt, startedAt: data.startedAt
            };
        }
        if (live) {
            hasLiveTotals = true;
            try {
                localStorage.setItem(cacheKey, JSON.stringify(saved));
            } catch (error) {
                // A blocked cache must not discard a successful reading.
            }
        }
        render(saved, !hasLiveTotals);
    }

    function fetchJson(url, options) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 8000);
        var settings = Object.assign({
            cache: "no-store", credentials: "omit", signal: controller.signal
        }, options);
        return fetch(url, settings).then(function (response) {
            if (!response.ok) throw new Error("Statistics request failed");
            return response.json();
        }).finally(function () { clearTimeout(timer); });
    }

    function loadConfig() {
        if (apiBase) return Promise.resolve(apiBase);
        return fetchJson("static/data/visitor-config.json?v=20261117").then(function (config) {
            var url = new URL(config.apiBase);
            if (config.provider !== provider || url.protocol !== "https:" ||
                url.username || url.password || url.search || url.hash) {
                throw new Error("Invalid counter configuration");
            }
            apiBase = url.href.replace(/\/$/, "");
            return apiBase;
        });
    }

    function randomId() {
        if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
        var bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        var text = Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
        return [text.slice(0, 8), text.slice(8, 12), text.slice(12, 16), text.slice(16, 20), text.slice(20)].join("-");
    }

    function browserId() {
        try {
            var id = localStorage.getItem(browserKey);
            if (uuid.test(id)) return id;
            id = randomId();
            localStorage.setItem(browserKey, id);
            return id;
        } catch (error) {
            return null;
        }
    }

    function refreshTotals() {
        if (pending) return;
        pending = true;
        setState("loading", "Updating statistics");
        loadConfig().then(function (base) {
            return fetchJson(base + "/v1/totals");
        }).then(function (record) {
            acceptRecord(record, true);
        }).catch(showSaved).finally(finishRequest);
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

    if (!production) {
        setState("preview", "Counts appear on the published site");
        return;
    }

    try {
        var cached = JSON.parse(localStorage.getItem(cacheKey));
        if (validRecord(cached)) saved = cached;
    } catch (error) {
        // Browser storage is optional.
    }

    pending = true;
    if (saved) render(saved, true);
    else setState("loading", "Loading statistics");
    retry.addEventListener("click", refreshTotals);
    fetchJson("static/data/visitor-totals.json").then(function (record) {
        acceptRecord(record, false);
    }).catch(function () {
        // The independent API request can still succeed.
    });

    // Reuse this event ID on uncertain retries. Reading totals never writes.
    var event;
    try {
        event = { eventId: randomId(), visitorId: browserId(), occurredAt: Date.now() };
    } catch (error) {
        pending = false;
        refreshTotals();
        return;
    }

    loadConfig().then(function (base) {
        function post() {
            return fetchJson(base + "/v1/visit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event),
                keepalive: true
            });
        }
        return post().catch(function () {
            return new Promise(function (resolve) { setTimeout(resolve, 1500); }).then(post);
        });
    }).then(function (record) {
        acceptRecord(record, true);
    }).catch(showSaved).finally(finishRequest);
}());
