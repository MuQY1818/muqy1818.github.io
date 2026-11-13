import { readFile, writeFile } from "node:fs/promises";

// Natural Earth v5.1.2, 110m land polygons (public domain).
// https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson
// Usage: node scripts/build-visitor-map.mjs /path/to/ne_110m_land.geojson
const source = JSON.parse(await readFile(process.argv[2], "utf8"));
const polygons = source.features.flatMap(({ geometry }) =>
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
);

function insideRing(x, y, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) &&
            x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function onLand(x, y) {
    return polygons.some(([outer, ...holes]) =>
        insideRing(x, y, outer) && !holes.some(ring => insideRing(x, y, ring))
    );
}

const dots = [];
for (let latitude = -56; latitude <= 82; latitude += 3) {
    for (let longitude = -177; longitude < 180; longitude += 3) {
        if (!onLand(longitude, latitude)) continue;
        const x = ((longitude + 180) / 360 * 480).toFixed(1);
        const y = ((86 - latitude) / 146 * 224).toFixed(1);
        dots.push(`<circle cx="${x}" cy="${y}" r="1.35"/>`);
    }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="224" viewBox="0 0 480 224">
<!-- Decorative land map. Natural Earth v5.1.2; public domain. No visitor locations. -->
<g fill="#a5c4d8">${dots.join("")}</g>
</svg>
`;
await writeFile(new URL("../static/assets/img/visitor-world.svg", import.meta.url), svg);
console.log(`Built decorative visitor map with ${dots.length} dots.`);
