# Weijue Bu's Academic Homepage

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://muqy1818.github.io/)

A clean, responsive academic personal website showcasing research, publications, and achievements.  
Designed with a minimalist academic style, inspired by [Tianxing Chen's Homepage](https://tianxingchen.github.io/).

## 🌟 Features

- **Academic Layout**: Professional card-style layout with a focus on readability.
- **Responsive Design**: Adapts perfectly to mobile and desktop screens.
- **Single File**: All content is contained in `index.html` for easy maintenance.
- **Rich Content**: Supports video previews (or paper thumbnails), BibTeX, and social links.

## 🚀 Live Demo

Visit the live website: [https://muqy1818.github.io/](https://muqy1818.github.io/)

## 📸 Preview

![Website Preview](screenshot_full.png)

## �️ Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/muqy1818/muqy1818.github.io.git
   cd muqy1818.github.io
   ```

2. **Start local server**:
   You can use Python's built-in HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
   Or use the provided script:
   ```bash
   python3 start_server.py
   ```

3. **Open in browser**: 
   Visit `http://localhost:8000` to see your changes.

### Customization

- **Content**: Edit `index.html` directly to update your bio, news, publications, and awards.
- **Styles**: Custom CSS is located in `static/css/home.css`; `static/js/profile.js` handles scrollspy, topic filters, and preview-video playback.
- **Assets**: Images and videos are stored in `static/assets/`.

## 📁 Project Structure

```
├── index.html          # Main homepage file (Edit this!)
├── static/
│   ├── css/           # Stylesheets (home.css)
│   ├── js/            # JavaScript files
│   └── assets/        # Images, PDFs, and Videos
├── start_server.py     # Local development helper script
└── README.md           # This file
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## Visitor totals

The homepage has a visitor section above the footer and a compact sidebar link.
The new counter implementation uses a Cloudflare Worker and D1; its code and
deployment instructions are in [`analytics/`](analytics/README.md). The public
API base URL is configured in `static/data/visitor-config.json`.

`static/js/visitors.js` sends one deduplicated page-load event on the HTTPS
production hostname, `muqy1818.github.io`. Local files, localhost and other
preview hosts do not count. Random first-party browser IDs estimate returning
visitors; blocked storage still allows page views without inventing persistent
identities. The API stores keyed hashes, not raw browser IDs or IP addresses.
These are estimated browser counts, not exact counts of people.

Refresh only reads totals and never records another view. When the API fails,
the page keeps a dated successful local reading or the same-origin
`static/data/visitor-totals.json` snapshot, explicitly labeled as saved data.
Missing statistics remain dashes. Refresh the published fallback with
`node scripts/snapshot-visitors.mjs`; this is also read-only.

The legacy Busuanzi readings are preserved in
`static/data/visitor-totals-legacy.json` and are not mixed into the new counter.
The world map remains decorative.

The map is a local SVG made from Natural Earth's public-domain v5.1.2 110m land
polygons. To regenerate it, download `ne_110m_land.geojson` from that release and
run `node scripts/build-visitor-map.mjs /path/to/ne_110m_land.geojson`. Production
does not fetch map data or fonts from an external service.
