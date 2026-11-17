import test, { before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import worker from "../src/worker.js";

const origin = "https://muqy1818.github.io";
const secret = "test-only-secret-that-is-never-a-production-key";
let mf;
let db;
let env;

before(async () => {
    mf = new Miniflare({
        modules: true,
        script: "export default { fetch() { return new Response('test'); } }",
        compatibilityDate: "2026-07-01",
        d1Databases: ["DB"]
    });
    db = await mf.getD1Database("DB");
    const schema = await readFile(new URL("../migrations/0001_counter.sql", import.meta.url), "utf8");
    for (const statement of schema.trim().split(/\n\s*\n/)) {
        await db.prepare(statement).run();
    }
});

beforeEach(async () => {
    await db.batch([
        db.prepare("DELETE FROM visit_events"),
        db.prepare("DELETE FROM visitors"),
        db.prepare("UPDATE totals SET site_uv = 0, site_pv = 0")
    ]);
    env = {
        DB: db, ALLOWED_ORIGIN: origin, VISITOR_HMAC_KEY: secret,
        REQUEST_LIMITER: { limit: async () => ({ success: true }) }
    };
});

after(async () => { await mf?.dispose(); });

function event(overrides = {}) {
    return {
        eventId: crypto.randomUUID(),
        visitorId: crypto.randomUUID(),
        occurredAt: Date.now(),
        ...overrides
    };
}

function send(payload, { headers = {}, ...options } = {}) {
    return worker.fetch(new Request("https://counter.example/v1/visit", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
        ...options
    }), env);
}

async function totals() {
    const result = await worker.fetch(new Request("https://counter.example/v1/totals", {
        headers: { Origin: origin }
    }), env);
    assert.equal(result.status, 200);
    return result.json();
}

test("reading totals is read-only and allows only the configured browser origin", async () => {
    const response = await worker.fetch(new Request("https://counter.example/v1/totals", {
        headers: { Origin: origin }
    }), env);
    const data = await response.json();
    assert.equal(data.provider, "weijue-analytics-v1");
    assert.equal(data.site_pv, 0);
    assert.equal(data.site_uv, 0);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    await totals();
    assert.equal((await db.prepare("SELECT count(*) AS n FROM visit_events").first()).n, 0);
});

test("one event counts one browser and view, storing only a keyed hash", async () => {
    const payload = event();
    const response = await send(payload, { headers: { "CF-Connecting-IP": "192.0.2.1" } });
    assert.equal(response.status, 200);
    assert.deepEqual(
        (({ site_uv, site_pv, counted }) => ({ site_uv, site_pv, counted }))(await response.json()),
        { site_uv: 1, site_pv: 1, counted: true }
    );
    const row = await db.prepare("SELECT * FROM visitors").first();
    assert.match(row.visitor_hash, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(row).includes(payload.visitorId));
    assert.ok(!JSON.stringify(row).includes("192.0.2.1"));
    assert.deepEqual(Object.keys(row).sort(), ["first_seen_at", "visitor_hash"]);
});

test("another page load from a returning browser adds a view, not a visitor", async () => {
    const first = event();
    await send(first);
    await send(event({ visitorId: first.visitorId }));
    const data = await totals();
    assert.equal(data.site_uv, 1);
    assert.equal(data.site_pv, 2);
});

test("retrying an event cannot add another view or substitute another visitor", async () => {
    const first = event();
    await send(first);
    const retry = await (await send(first)).json();
    assert.equal(retry.counted, false);
    await send({ ...first, visitorId: crypto.randomUUID() });
    const data = await totals();
    assert.equal(data.site_pv, 1);
    assert.equal(data.site_uv, 1);
});

test("concurrent visits and retries are atomic in the actual D1 runtime", async () => {
    const visitorId = crypto.randomUUID();
    const pages = Array.from({ length: 20 }, () => event({ visitorId }));
    const responses = await Promise.all(pages.flatMap(payload => [send(payload), send(payload)]));
    assert.ok(responses.every(response => response.status === 200));
    const data = await totals();
    assert.equal(data.site_uv, 1);
    assert.equal(data.site_pv, 20);
});

test("storage-disabled visits count views without inventing browser identities", async () => {
    await send(event({ visitorId: null }));
    await send(event({ visitorId: null }));
    const data = await totals();
    assert.equal(data.site_uv, 0);
    assert.equal(data.site_pv, 2);
});

test("bad origins, invalid events and oversized bodies cannot write", async () => {
    assert.equal((await send(event(), { headers: { Origin: "https://other.example" } })).status, 403);
    assert.equal((await send(event(), { headers: { Origin: "" } })).status, 403);
    assert.equal((await send(event(), { headers: { "Content-Type": "text/plain" } })).status, 415);
    for (const invalid of [
        event({ eventId: "not-a-uuid" }),
        event({ visitorId: "not-a-uuid" }),
        event({ occurredAt: Date.now() - 8 * 86400000 }),
        event({ occurredAt: Date.now() + 600000 }),
        null
    ]) {
        assert.equal((await send(invalid)).status, 400);
    }
    assert.equal((await send({ ...event(), extra: "x".repeat(1100) })).status, 413);
    const data = await totals();
    assert.equal(data.site_pv, 0);
    assert.equal(data.site_uv, 0);
});

test("rate limits run before storage and return a retry interval", async () => {
    env.REQUEST_LIMITER.limit = async () => ({ success: false });
    const response = await send(event(), { headers: { "CF-Connecting-IP": "192.0.2.1" } });
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), "60");
    assert.equal((await totals()).site_pv, 0);
});

test("known crawler user agents are not counted", async () => {
    const response = await send(event(), { headers: { "User-Agent": "ExampleBot/1.0" } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).counted, false);
    assert.equal((await totals()).site_pv, 0);
});

test("cleanup expires deduplication records while preserving visitor totals", async () => {
    await send(event());
    await db.prepare("UPDATE visit_events SET received_at = ?")
        .bind(Math.floor(Date.now() / 1000) - 9 * 86400).run();
    await worker.scheduled({}, env);
    assert.equal((await db.prepare("SELECT count(*) AS n FROM visit_events").first()).n, 0);
    assert.equal((await totals()).site_pv, 1);
    assert.equal((await totals()).site_uv, 1);
});

test("preflight is read-only, and unconfigured or broken storage fails closed", async () => {
    const preflight = await worker.fetch(new Request("https://counter.example/v1/visit", {
        method: "OPTIONS", headers: { Origin: origin }
    }), env);
    assert.equal(preflight.status, 204);
    assert.equal((await totals()).site_pv, 0);
    const missingSecret = await worker.fetch(new Request("https://counter.example/v1/totals"), {
        ...env, VISITOR_HMAC_KEY: undefined
    });
    assert.equal(missingSecret.status, 503);
    const brokenDb = await worker.fetch(new Request("https://counter.example/v1/totals"), {
        ...env, DB: { prepare() { throw new Error("private storage detail"); } }
    });
    assert.equal(brokenDb.status, 503);
    assert.ok(!(await brokenDb.text()).includes("private storage detail"));
});
