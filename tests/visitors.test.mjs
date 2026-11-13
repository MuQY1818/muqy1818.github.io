import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../static/js/visitors.js", import.meta.url), "utf8");
const snapshot = { site_uv: 100, site_pv: 200, recordedAt: "2026-11-12T00:00:00Z" };
const settle = () => new Promise(resolve => setImmediate(resolve));

function boot({ record = snapshot, stored = null, storageBlocked = false,
    local = false, deferred = false } = {}) {
    const status = {};
    const retry = { hidden: true, addEventListener: (_, callback) => { retry.click = callback; } };
    const counts = ["site_uv", "site_pv"].map(key => ({
        dataset: { visitorCount: key }, textContent: "\u2014"
    }));
    const panel = {
        dataset: {}, classList: { add() {} }, setAttribute() {},
        querySelector: selector => selector === "[data-visitor-status]" ? status : retry
    };
    const scripts = [];
    const timers = new Map();
    const storage = new Map(stored ? [["weijue.visitor-totals.v1", JSON.stringify(stored)]] : []);
    let timerId = 0;
    let fetches = 0;
    let finishFetch;
    const context = {
        window: {}, location: { protocol: local ? "file:" : "https:", hostname: "muqy1818.github.io" },
        document: {
            querySelector: () => panel, querySelectorAll: () => counts,
            createElement: () => ({ remove() {} }),
            head: { appendChild: script => scripts.push(script) }
        },
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
        fetch: () => {
            fetches++;
            return new Promise((resolve, reject) => {
                finishFetch = () => record ?
                    resolve({ ok: true, json: async () => record }) : reject(new Error("Offline"));
                if (!deferred) finishFetch();
            });
        }
    };
    vm.runInNewContext(source, context);
    return {
        panel, status, retry, counts, scripts, context, storage,
        fetches: () => fetches, finishFetch: () => finishFetch(),
        reply: data => {
            const script = scripts.at(-1);
            const callback = new URL(script.src).searchParams.get("jsonpCallback");
            context.window[callback](data);
        },
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

test("a first visit can show the dated snapshot when analytics is blocked", async () => {
    const app = boot();
    app.scripts[0].onerror();
    await settle();
    assert.equal(app.panel.dataset.state, "cached");
    assert.deepEqual(app.counts.map(el => el.textContent), ["100", "200"]);
    assert.match(app.status.textContent, /Saved Nov 12, 2026/);
    assert.equal(app.retry.hidden, false);
});

test("a response after the soft timeout can still replace saved totals", async () => {
    const app = boot();
    await settle();
    app.fire(20000);
    assert.equal(app.panel.dataset.state, "cached");
    assert.equal(app.retry.hidden, false);
    app.reply({ site_uv: 1234, site_pv: 5678 });
    assert.equal(app.panel.dataset.state, "ready");
    assert.deepEqual(app.counts.map(el => el.textContent), ["1,234", "5,678"]);
    assert.equal(app.retry.hidden, true);
    assert.equal(JSON.parse(app.storage.get("weijue.visitor-totals.v1")).site_uv, 1234);
});

test("an older snapshot must not overwrite a successful live reading", async () => {
    const app = boot({ deferred: true });
    app.reply({ site_uv: 120, site_pv: 240 });
    app.finishFetch();
    await settle();
    assert.equal(app.panel.dataset.state, "ready");
    assert.equal(app.counts[0].textContent, "120");
});

test("retry recovers without requiring storage to work", async () => {
    const app = boot({ storageBlocked: true });
    app.scripts[0].onerror();
    await settle();
    app.retry.click();
    assert.equal(app.scripts.length, 2);
    app.reply({ site_uv: 150, site_pv: 300 });
    assert.equal(app.panel.dataset.state, "ready");
    assert.equal(app.counts[1].textContent, "300");
});

test("invalid live data leaves the more recent saved reading intact", async () => {
    const app = boot({
        stored: { site_uv: 130, site_pv: 260, recordedAt: "2026-11-13T00:00:00Z" }
    });
    await settle();
    app.reply({ site_uv: -1, site_pv: "999" });
    assert.equal(app.panel.dataset.state, "cached");
    assert.equal(app.counts[0].textContent, "130");
});

test("complete network failure keeps unavailable counts distinct from zero", async () => {
    const app = boot({ record: null, storageBlocked: true });
    app.scripts[0].onerror();
    await settle();
    assert.equal(app.panel.dataset.state, "unavailable");
    assert.deepEqual(app.counts.map(el => el.textContent), ["\u2014", "\u2014"]);
    assert.equal(app.retry.hidden, false);
});

test("a hard timeout cleans up the callback and retains the snapshot", async () => {
    const app = boot();
    await settle();
    app.fire(20000);
    app.fire(60000);
    assert.equal(app.panel.dataset.state, "cached");
    assert.equal(Object.keys(app.context.window).length, 0);
});

test("local previews neither record traffic nor show a nonworking retry", async () => {
    const app = boot({ local: true });
    await settle();
    assert.equal(app.panel.dataset.state, "preview");
    assert.equal(app.fetches(), 0);
    assert.equal(app.scripts.length, 0);
    assert.equal(app.retry.hidden, true);
});
