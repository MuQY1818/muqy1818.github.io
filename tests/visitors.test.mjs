import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../static/js/visitors.js", import.meta.url), "utf8");
const provider = "weijue-analytics-v1";
const cacheKey = "weijue.visitor-totals.v2";
const snapshot = {
    provider, site_uv: 100, site_pv: 200,
    startedAt: "2026-11-17T00:00:00Z", recordedAt: "2026-11-17T08:00:00Z"
};
const live = { ...snapshot, site_uv: 101, site_pv: 201, recordedAt: "2026-11-17T09:00:00Z" };
const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve)); };

function boot({ record = snapshot, stored = null, storage = new Map(), storageBlocked = false,
    local = false, deferredSnapshot = false, deferredPost = false, postFailures = 0,
    liveRecord = live, configFailure = false } = {}) {
    const status = {};
    const since = {};
    const retry = { hidden: true, addEventListener: (_, callback) => { retry.click = callback; } };
    const counts = ["site_uv", "site_pv"].map(key => ({
        dataset: { visitorCount: key }, textContent: "\u2014"
    }));
    const panel = {
        dataset: {}, classList: { add() {} }, setAttribute() {},
        querySelector: selector => selector === "[data-visitor-status]" ? status :
            selector === "[data-visitor-started]" ? since : retry
    };
    if (stored) storage.set(cacheKey, JSON.stringify(stored));
    const requests = [];
    const timers = new Map();
    let timerId = 0;
    let postIndex = 0;
    let finishSnapshot;
    let finishPost;
    let failReads = false;
    const result = data => ({ ok: true, json: async () => data });
    const context = {
        window: {}, crypto, URL, AbortController,
        location: { protocol: local ? "file:" : "https:", hostname: "muqy1818.github.io" },
        document: { querySelector: () => panel, querySelectorAll: () => counts },
        localStorage: {
            getItem: key => {
                if (storageBlocked) throw new Error("Storage blocked");
                return storage.get(key) ?? null;
            },
            setItem: (key, value) => {
                if (storageBlocked) throw new Error("Storage blocked");
                storage.set(key, value);
            }
        },
        setTimeout: (callback, delay) => {
            timers.set(++timerId, { callback, delay });
            return timerId;
        },
        clearTimeout: id => timers.delete(id),
        fetch: (url, options) => {
            requests.push({ url, method: options.method || "GET", body: options.body });
            return new Promise((resolve, reject) => {
                options.signal.addEventListener("abort", () => reject(new Error("Timed out")));
                if (url.includes("visitor-config.json")) {
                    if (configFailure) reject(new Error("Config unavailable"));
                    else resolve(result({ provider, apiBase: "https://counter.example" }));
                } else if (url.includes("visitor-totals.json")) {
                    finishSnapshot = () => record ? resolve(result(record)) : reject(new Error("Offline"));
                    if (!deferredSnapshot) finishSnapshot();
                } else if (url.endsWith("/v1/visit")) {
                    const index = postIndex++;
                    finishPost = () => {
                        if (index < postFailures || !liveRecord) reject(new Error("API unavailable"));
                        else resolve(result(liveRecord));
                    };
                    if (!deferredPost || index > 0) finishPost();
                } else if (url.endsWith("/v1/totals")) {
                    if (failReads) reject(new Error("API unavailable"));
                    else resolve(result(liveRecord));
                } else reject(new Error("Unexpected URL"));
            });
        }
    };
    vm.runInNewContext(source, context);
    return {
        panel, status, since, retry, counts, requests, storage,
        finishSnapshot: () => finishSnapshot(), finishPost: () => finishPost(),
        failReads: () => { failReads = true; },
        posts: () => requests.filter(request => request.method === "POST"),
        fire: delay => {
            for (const [id, timer] of [...timers]) {
                if (timer.delay === delay) {
                    timers.delete(id);
                    timer.callback();
                }
            }
        }
    };
}

async function exhaustRetries(app) {
    await settle();
    app.fire(1500);
    await settle();
}

test("a page load sends one event and displays fresh totals and the start date", async () => {
    const app = boot();
    await settle();
    assert.equal(app.posts().length, 1);
    assert.equal(app.panel.dataset.state, "ready");
    assert.deepEqual(app.counts.map(el => el.textContent), ["101", "201"]);
    assert.equal(app.status.textContent, "Updated just now");
    assert.match(app.since.textContent, /Counting since Nov 17, 2026/);
    assert.equal(JSON.parse(app.storage.get(cacheKey)).site_uv, 101);
    assert.equal(app.retry.hidden, false);
});

test("the refresh button only reads totals and never adds a tracking event", async () => {
    const app = boot();
    await settle();
    app.retry.click();
    await settle();
    assert.equal(app.posts().length, 1);
    assert.equal(app.requests.filter(request => request.url.endsWith("/v1/totals")).length, 1);
    assert.equal(app.panel.dataset.state, "ready");
});

test("uncertain requests retry with exactly the same event ID and payload", async () => {
    const app = boot({ postFailures: 1 });
    await exhaustRetries(app);
    assert.equal(app.posts().length, 2);
    assert.equal(app.posts()[0].body, app.posts()[1].body);
    assert.equal(app.panel.dataset.state, "ready");
});

test("a timed-out write can be retried safely using the same event", async () => {
    const app = boot({ deferredPost: true });
    await settle();
    app.fire(8000);
    await settle();
    app.fire(1500);
    await settle();
    assert.equal(app.posts().length, 2);
    assert.equal(app.posts()[0].body, app.posts()[1].body);
    assert.equal(app.panel.dataset.state, "ready");
});

test("another page load reuses the browser ID and creates a fresh event ID", async () => {
    const first = boot();
    await settle();
    const second = boot({ storage: first.storage });
    await settle();
    const a = JSON.parse(first.posts()[0].body);
    const b = JSON.parse(second.posts()[0].body);
    assert.equal(a.visitorId, b.visitorId);
    assert.notEqual(a.eventId, b.eventId);
});

test("blocked storage sends a view without inventing a persistent visitor", async () => {
    const app = boot({ storageBlocked: true });
    await settle();
    assert.equal(JSON.parse(app.posts()[0].body).visitorId, null);
    assert.equal(app.panel.dataset.state, "ready");
});

test("API failure retains dated fallback data and exposes a working read retry", async () => {
    const app = boot({ liveRecord: null });
    await exhaustRetries(app);
    assert.equal(app.panel.dataset.state, "cached");
    assert.deepEqual(app.counts.map(el => el.textContent), ["100", "200"]);
    assert.match(app.status.textContent, /Live stats unavailable.*saved Nov 17, 2026/);
    assert.equal(app.retry.hidden, false);
});

test("a failed refresh after an earlier success is not falsely labeled fresh", async () => {
    const app = boot();
    await settle();
    app.failReads();
    app.retry.click();
    await settle();
    assert.equal(app.panel.dataset.state, "cached");
    assert.match(app.status.textContent, /Live stats unavailable/);
    assert.deepEqual(app.counts.map(el => el.textContent), ["101", "201"]);
});

test("a late static snapshot must not overwrite a successful live reading", async () => {
    const app = boot({ deferredSnapshot: true });
    await settle();
    app.finishSnapshot();
    await settle();
    assert.equal(app.panel.dataset.state, "ready");
    assert.equal(app.counts[0].textContent, "101");
});

test("a more recent saved reading wins over an older fallback", async () => {
    const app = boot({ stored: live, liveRecord: null });
    await exhaustRetries(app);
    assert.equal(app.counts[0].textContent, "101");
    assert.equal(app.panel.dataset.state, "cached");
});

test("legacy or invalid totals are never mixed into the new counter", async () => {
    const legacy = { site_uv: 21, site_pv: 71, recordedAt: "2026-11-16T12:14:25Z" };
    const app = boot({ record: legacy, stored: legacy, liveRecord: { ...live, site_uv: -1 } });
    await settle();
    assert.equal(app.panel.dataset.state, "unavailable");
    assert.deepEqual(app.counts.map(el => el.textContent), ["\u2014", "\u2014"]);
});

test("configuration failure preserves saved data without sending a visit", async () => {
    const app = boot({ configFailure: true });
    await settle();
    assert.equal(app.posts().length, 0);
    assert.equal(app.panel.dataset.state, "cached");
    assert.equal(app.retry.hidden, false);
});

test("complete failure stays distinct from a legitimate zero count", async () => {
    const app = boot({ record: null, configFailure: true, storageBlocked: true });
    await settle();
    assert.equal(app.panel.dataset.state, "unavailable");
    assert.deepEqual(app.counts.map(el => el.textContent), ["\u2014", "\u2014"]);
});

test("local previews never contact the API or record traffic", async () => {
    const app = boot({ local: true });
    await settle();
    assert.equal(app.panel.dataset.state, "preview");
    assert.equal(app.requests.length, 0);
    assert.equal(app.retry.hidden, true);
});
