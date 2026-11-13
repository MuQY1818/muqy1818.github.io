import { mkdir, writeFile } from "node:fs/promises";

const response = await fetch(
    "https://busuanzi.ibruce.info/busuanzi?jsonpCallback=WeijueSnapshot",
    {
        headers: { Referer: "https://muqy1818.github.io/" },
        signal: AbortSignal.timeout(15000)
    }
);
if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`);
const text = await response.text();
const match = text.match(/WeijueSnapshot\((\{.*\})\);/s);
if (!match) throw new Error("Unexpected Busuanzi response");
const data = JSON.parse(match[1]);
if (!Number.isSafeInteger(data.site_uv) || data.site_uv < 0 ||
    !Number.isSafeInteger(data.site_pv) || data.site_pv < 0) {
    throw new Error("Invalid visitor totals");
}
const record = {
    site_uv: data.site_uv,
    site_pv: data.site_pv,
    recordedAt: new Date().toISOString()
};
const directory = new URL("../static/data/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL("visitor-totals.json", directory), JSON.stringify(record, null, 2) + "\n");
console.log(record);
