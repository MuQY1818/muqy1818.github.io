const PROVIDER = "weijue-analytics-v1";
const DAY = 86400;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOTALS_SQL = "SELECT site_uv, site_pv, started_at FROM totals WHERE id = 1";
let cachedSecret;
let cachedKey;

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function digest(secret, value) {
    if (secret !== cachedSecret) {
        cachedSecret = secret;
        cachedKey = crypto.subtle.importKey(
            "raw", new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
    }
    const bytes = await crypto.subtle.sign(
        "HMAC", await cachedKey, new TextEncoder().encode(value)
    );
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

function headers(origin, allowedOrigin) {
    const result = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Vary": "Origin"
    });
    if (origin === allowedOrigin) {
        result.set("Access-Control-Allow-Origin", origin);
        result.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        result.set("Access-Control-Allow-Headers", "Content-Type");
        result.set("Access-Control-Max-Age", "86400");
    }
    return result;
}

function response(data, status, origin, allowedOrigin) {
    return new Response(data === null ? null : JSON.stringify(data), {
        status, headers: headers(origin, allowedOrigin)
    });
}

async function readEvent(request, now) {
    if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json") {
        throw new HttpError(415, "JSON required");
    }
    if (Number(request.headers.get("Content-Length")) > 1024) {
        throw new HttpError(413, "Payload too large");
    }
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "Missing event");
    let text = "";
    let size = 0;
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 1024) {
                await reader.cancel();
                throw new HttpError(413, "Payload too large");
            }
            text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
    } finally {
        reader.releaseLock();
    }
    let event;
    try {
        event = JSON.parse(text);
    } catch {
        throw new HttpError(400, "Invalid JSON");
    }
    if (!event || !UUID.test(event.eventId) ||
        (event.visitorId !== null && !UUID.test(event.visitorId)) ||
        !Number.isSafeInteger(event.occurredAt) ||
        event.occurredAt < now - 7 * DAY * 1000 ||
        event.occurredAt > now + 300000) {
        throw new HttpError(400, "Invalid or expired event");
    }
    return event;
}

function record(row, counted) {
    if (!row || !Number.isSafeInteger(row.site_uv) || !Number.isSafeInteger(row.site_pv)) {
        throw new Error("Missing totals");
    }
    return {
        provider: PROVIDER,
        site_uv: row.site_uv,
        site_pv: row.site_pv,
        startedAt: new Date(row.started_at * 1000).toISOString(),
        recordedAt: new Date().toISOString(),
        ...(counted === undefined ? {} : { counted })
    };
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const allowedOrigin = env.ALLOWED_ORIGIN;
        try {
            const path = new URL(request.url).pathname;
            if (!["/v1/totals", "/v1/visit", "/healthz"].includes(path)) {
                throw new HttpError(404, "Not found");
            }
            if (origin && origin !== allowedOrigin) throw new HttpError(403, "Origin not allowed");
            if (request.method === "OPTIONS") {
                if (origin !== allowedOrigin) throw new HttpError(403, "Origin required");
                return response(null, 204, origin, allowedOrigin);
            }
            if ((path === "/v1/visit" && request.method !== "POST") ||
                (path !== "/v1/visit" && request.method !== "GET")) {
                throw new HttpError(405, "Method not allowed");
            }
            if (path === "/v1/visit" && origin !== allowedOrigin) {
                throw new HttpError(403, "Origin required");
            }
            if (!env.DB || typeof env.VISITOR_HMAC_KEY !== "string" ||
                env.VISITOR_HMAC_KEY.length < 32 || !env.REQUEST_LIMITER) {
                throw new HttpError(503, "Counter not configured");
            }
            // IP is used only in a short-lived, daily salted rate-limit key.
            const ip = request.headers.get("CF-Connecting-IP");
            if (ip) {
                const day = Math.floor(Date.now() / (DAY * 1000));
                const key = await digest(env.VISITOR_HMAC_KEY, `rate:${day}:${ip}`);
                const limit = await env.REQUEST_LIMITER.limit({ key });
                if (!limit.success) {
                    const result = response({ error: "Too many requests" }, 429, origin, allowedOrigin);
                    result.headers.set("Retry-After", "60");
                    return result;
                }
            }
            if (path === "/healthz") {
                await env.DB.prepare("SELECT 1").first();
                return response({ status: "ok" }, 200, origin, allowedOrigin);
            }
            if (path === "/v1/totals") {
                return response(record(await env.DB.prepare(TOTALS_SQL).first()), 200, origin, allowedOrigin);
            }

            const now = Date.now();
            const event = await readEvent(request, now);
            if (/(?:bot\b|crawler|spider|headless)/i.test(request.headers.get("User-Agent") || "")) {
                return response(record(await env.DB.prepare(TOTALS_SQL).first(), false), 200, origin, allowedOrigin);
            }
            const visitorHash = event.visitorId === null ? null :
                await digest(env.VISITOR_HMAC_KEY, `visitor:${event.visitorId.toLowerCase()}`);
            const results = await env.DB.batch([
                env.DB.prepare(
                    "INSERT INTO visit_events (event_id, visitor_hash, received_at) VALUES (?, ?, ?) " +
                    "ON CONFLICT(event_id) DO NOTHING"
                ).bind(event.eventId.toLowerCase(), visitorHash, Math.floor(now / 1000)),
                env.DB.prepare(TOTALS_SQL)
            ]);
            return response(
                record(results[1].results[0], results[0].meta.changes > 0),
                200, origin, allowedOrigin
            );
        } catch (error) {
            if (error instanceof HttpError) {
                return response({ error: error.message }, error.status, origin, allowedOrigin);
            }
            // Never log payloads, IP addresses, identifiers, or database rows.
            console.warn("Visitor counter storage request failed");
            return response({ error: "Counter temporarily unavailable" }, 503, origin, allowedOrigin);
        }
    },

    async scheduled(_event, env) {
        // Keep a buffer beyond the seven-day client retry window.
        await env.DB.prepare("DELETE FROM visit_events WHERE received_at < ?")
            .bind(Math.floor(Date.now() / 1000) - 8 * DAY).run();
    }
};
