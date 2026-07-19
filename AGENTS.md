# Project Update Notes

## 2026-07-19 (v3)

- Anonymized the ChainVLA submission target for double-blind review: every public mention of the venue was removed (chip, Fig. 02 caption, marquee ticker all say just "Under Review"). Keep it that way until acceptance — do not re-add the venue name to any published file, including this one.
- "Robotics Researcher" fancy pass (palette unchanged, all content preserved):
  - background canvas upgraded to a full pick-and-place robotics scene: the arm runs a 15 s keyframed cycle (HOME → pre-grasp → grasp a hatched wireframe cube → carry → release onto a PLACE workstation pedestal → return; cubic easing + ≤0.016 rad damped wobble on arrival; two-segment gripper fingers rotate at knuckles; grasp contact at cube top y=0.16 with knuckles offset ±0.09 > cube half-edge so interpenetration is geometrically impossible). Rendering: tapered capsule double-links with struts, bearing-style joint housings (shoulder/elbow angle arcs), flared pedestal base with bolts, 1.5 s fading coral EE trail, soft floor shadows under EE/elbow/cube (cube shadow diffuses when lifted), grasp/release pulse rings, depth-layered pedestal ring around the seated cube. Around it: 3 range rings, a 7 s rotating coral LiDAR sweep with fading arc trail, and a jittered 131-point floor cloud that flares coral when scanned (seeded RNG, polar hit-test).
  - projector final values: desktop cx=0.68W cy=0.72H scale=min(W,H)*0.26, mobile cx=0.5W cy=0.76H scale=0.24 — the rightmost values that keep the whole cycle (incl. LiDAR rings, gripper reach, trail, pedestal) inside the viewport at 1440/1280/1024 with ≥40px margin (cx≥0.80W provably clips the HOME pose). Do NOT move it right again; instead the canvas scroll-fades: opacity 1 → 0 linearly over scrollY 0.3–1.0 viewport-heights (rAF-throttled scroll listener writing canvas.style.opacity), so the arm never peeks from behind publication cards.
  - a grid-ripple hover effect on pub cards (static/js/ripple.js + canvas overlay) was tried and REMOVED per user feedback ("违和"); do not re-add a grid/dot hover texture to cards — hover = tilt + coral glow only.
  - hero: giant outlined "ROBOTICS" watermark (JetBrains Mono, `-webkit-text-stroke`, cropped at the hero edge, hidden < 900px); terminal role-line typewriter (`#typer`, cycles 4 phrases from `data-phrases`, block caret; keep `#typer` inline — a reserved min-width detaches the caret while typing); full-hero-width metrics strip with scroll-triggered count-up (`.metric-num[data-count]`, data-decimals/prefix/suffix, 1.4 s ease-out) — note its width `calc(100% * 2 / 1.15 + 60px)` is coupled to the hero grid geometry.
  - full-bleed marquee ticker between hero and News (`.ticker-track`, 28 s translateX(-50%) loop, spans duplicated twice, separators wrapped in `<b>` for coral); pauses on hover.
  - feed HUD: center crosshair reticle on `.feed-screen::after`, 5.2 s scanline sweep band on `.feed::after`.
  - pub cards (except the full-width Challenge Cup card) carry `data-tilt`: pointer-driven rotateX/Y ±2.5° + lift via rAF lerp (fine pointers only), coral radial glow via `--mx/--my`; CSS hover translateY is neutralized for `[data-tilt]`.
  - everything new no-ops without its hooks and is disabled/static under `prefers-reduced-motion`; cache-bust now `?v=20260719d`.

## 2026-07-19 (v2)

- Re-skinned the homepage from the dark "robotics console" to an Anthropic-style warm-paper light theme per user request:
  - palette: cream paper `#f0eee6`, ink `#141413`, coral accent `#d97757` (ECCV + links), sage green (TCC), muted violet (ICME), ink chips (co-first / Challenge Cup), dashed coral (under review).
  - rounded cards (14px), pill chips, soft shadows; serif headings kept (Source Serif 4 + KaiTi for the Chinese name).
- Signature background: a fixed canvas drawing a wireframe robot arm in line-art style (forward kinematics, iconic reaching pose with gentle breathing motion, coral gripper and end-effector ring, perspective floor grid); positioned bottom-right, disabled under `prefers-reduced-motion`.
- Video integration from the RoboStream project page:
  - hero: `robostream_overview.mp4` (23 s) in a "CAM-01" viewfinder frame with REC dot and telemetry caption;
  - RoboStream card: `hard_build1.mp4` (63 s) as "CAM-02"; poster JPEGs generated with ffmpeg; both autoplay muted loop (autoplay stripped when reduced motion).
- Publication cards: left media column now stretches to full card height (`object-fit: cover`) to eliminate empty voids; ChainVLA and CALO wide teasers were pre-composed into 4:5 portraits with blurred background fill (ImageMagick) so cover-cropping loses no content.
- ChainVLA card synced with the journal/conference submission: new title "Chaining Task Progress and Motion Intent Across VLA Queries", Progress Context / Motion Tail abstract, 62.8% RMBench / 98.8% LIBERO results, chip `Under Review`, real teaser figure. (Venue name deliberately omitted everywhere — double-blind review, see v3.)
- Conscious Gaze card synced with arXiv 2512.05546: official title, real authors (Weijue Bu, Guan Yuan, Guixian Zhang), Harsanyi-interaction abstract, arXiv link added; marked First Author.
- CALO card uses the colorful pipeline teaser (not the beige architecture figure).

## 2026-07-19

- Full homepage redesign toward an "engineering blueprint / field notebook" aesthetic:
  - removed Bootstrap, Font Awesome, and Academicons dependencies; the page now uses custom CSS (`static/css/academic.css`) plus a small vanilla JS file (`static/js/home.js`).
  - typography: KaiTi-first display for the Chinese name, Source Serif 4 for headings, Inter for body, JetBrains Mono for labels/chips.
  - palette: warm paper base with cool ink, cobalt blue as the structural accent, copper reserved for highlights (co-first / first-author / Challenge Cup markers).
  - signature background: a fixed canvas animating a slowly drifting node graph with occasional copper "temporal message" pulses, referencing RoboStream's CSTG; disabled under `prefers-reduced-motion`.
  - sticky top nav (`W.BU_`), bracket-style mono link chips, figure frames with crop marks and `Fig. NN` captions, venue chips per paper, scroll-reveal animations, click-to-copy WeChat chip with toast.
- Added the CALO paper (accepted by IEEE Transactions on Cloud Computing, student first author) to News and Publications; thumbnail `static/assets/img/Papers/CALO.png` was rendered from the paper's architecture figure (no paper PDF is hosted, per user request). Links to code: `https://github.com/MuQY1818/calo-experiments`.
- RoboStream entry now uses the official title, the full author list from the project page (`Yuzhi Huang*, Jie Wu*, Weijue Bu*, ...`, equal contribution), and links to the arXiv abstract page `https://arxiv.org/abs/2603.12939`.
- Marked Conscious Gaze (ICME 2026) as First Author.
- Fixed award dates against the July 2026 resume: ICPC bronze 2025.03 -> 2025.05, Lanqiao Cup second prize 2024.04 -> 2025.05, list kept in chronological order.
- Removed the broken GitHub shields badges and the GitHub corner ribbon; visitor badge moved to the footer.
- Dropped dead `href="#"` PDF/Dataset placeholder buttons.
- Per user feedback, kept the homepage minimal: no CV download link (the resume PDF contains a phone number), no GPA chip, no extra awards (Tianchi/RAICOM), no SO-101 practice project.

## 2026-07-02

- Updated homepage biography ranking to `9/185 (Top 4.86%)`.
- Updated RoboStream status to `Accepted by ECCV 2026` and marked Weijue Bu as co-first author.
- Added a 2026.07 news item for RoboStream's ECCV 2026 acceptance.
- Added ChainVLA as a current selected research project based on the latest resume.
- Replaced the homepage profile image reference with `static/assets/img/photo.png` and styled it as a circular framed avatar.
- Restyled the homepage toward a Claude-inspired warm paper aesthetic and added a KaiTi-first fallback for Chinese characters.
- Replaced the static visitor badge with a live visitor counter and added cache-busting query parameters for the stylesheet and profile image.

## 2026-05-27

- Replaced the homepage profile image reference with `static/assets/img/photo2.jpg`.
- Processed `photo2.jpg` into a vertical 2:3 portrait asset for the existing homepage profile layout.
