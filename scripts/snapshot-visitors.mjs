import { mkdir, readFile, writeFile } from "node:fs/promises";

const config = JSON.parse(await readFile(
    new URL("../static/data/visitor-config.json", import.meta.url), "utf8"
));
const base = new URL(config.apiBase);
if (config.provider !== "weijue-analytics-v1" || base.protocol !== "https:" ||
    base.username || base.password || base.search || base.hash) {
    throw new Error("Invalid counter configuration");
}
// This endpoint only reads totals: backups must never manufacture page views.
const response = await fetch(base.href.replace(/\/$/, "") + "/v1/totals", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000)
});
if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`);
const record = await response.json();
if (record.provider !== config.provider ||
    !Number.isSafeInteger(record.site_uv) || record.site_uv < 0 ||
    !Number.isSafeInteger(record.site_pv) || record.site_pv < record.site_uv ||
    !Number.isFinite(Date.parse(record.startedAt)) ||
    !Number.isFinite(Date.parse(record.recordedAt)) ||
    Date.parse(record.startedAt) > Date.parse(record.recordedAt)) {
    throw new Error("Invalid visitor totals");
}
const directory = new URL("../static/data/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("visitor-totals.json", directory), JSON.stringify(record, null, 2) + "\n");
console.log(record);
