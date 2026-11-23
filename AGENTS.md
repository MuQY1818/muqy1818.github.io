# Project Update Notes

## 2026-11-22

- Research positioning changed at the user's request from **Agentic Robotics / Embodied Reasoning** to **vision-language-action (VLA) models for long-horizon manipulation**; the user judged the real-time, closed-loop advantage of VLA policies over VLM-agent pipelines to be the better direction. This supersedes the 2026-10-17 label note for the homepage (tagline, meta description, sidebar focus, bio). RSI stays as the long-term goal. The GitHub profile README (MuQY1818/MuQY1818) was rewritten to match on 2026-11-23 (centered header, research table, three selected papers, macbot + OpenYoink side by side, headerless experience table, folded contests, no WeChat). The account bio still needs the user's `gh auth refresh -s user` (or a manual edit) to change to "Embodied AI Algorithm Intern @ Noematrix | VLA Models for Long-Horizon Manipulation".
- Conscious Gaze is no longer part of the main line (user request). Selected publications are ChainVLA, RoboStream, Mind2Act World, in that order; Conscious Gaze, CALO and PiN-Mod sit in a text-only "Other publications" list. The Robotics / Multimodal / Systems topic filters were removed because they advertised three directions.
- New Research section (2x2 numbered themes): execution state across action chunks (ChainVLA), memory for long-horizon manipulation (RoboStream), VLA post-training at Noematrix (NOW tag), diagnosing mind and action (Mind2Act World, contributor). Do not call RoboStream a VLA method. The Noematrix work is described as VLA post-training, as confirmed by the user.
- The hero is name + tagline + two plain body paragraphs. Rejected by the user in this pass, do not reintroduce: a robot demo video in the hero (also a cleaned, re-graded version with a step-tracker overlay), an animated ChainVLA diagram card, a large serif thesis paragraph with underline marks, and a warm-paper single-column redesign modelled on pi.website / kzakka.com. The user wants the page clean and refined within the existing white / sidebar / Newsreader + Inter / link-blue style.
- Open Source is its own section again, between Publications and Experience, with a nav link. **macbot** comes first: the user's public Apache-2.0 project (`https://github.com/MuQY1818/macbot`, PyPI `macbot` published by MuQY1818); the description and the ~165 ms per pi0.5 action chunk (MLX, M5 Pro) figure are from its README. Its icon `static/assets/img/macbot-mark.svg` is a local copy of the repo's `assets/logo-mark.svg` (rect-only pixel art), rendered with `image-rendering: pixelated`. OpenYoink is second, unchanged.
- Experience order is Noematrix, Tsinghua, Fudan, CUMT. News shows four embodied items first; Honors shows four awards and folds the six programming/math contests. The visitor counter is unchanged: it was briefly dropped in a preview and the user asked for it back, so keep it.
- The new rules live in an appended block at the end of `home.css`; asset version `20261122-vla1`.
- The WeChat ID was removed from the sidebar at the user's request (not to be exposed for now); do not add it back to the homepage or profile README unless asked.

## 2026-11-20

- Mind2Act World now has a public technical report
  (`https://arxiv.org/abs/2611.26444`, submitted 2026-11-19) and official code
  (`https://github.com/Mind2Act/Mind2Act_World`), verified against the project
  website, arXiv metadata and public repository. This supersedes the Nov 15
  "coming soon" and "Project contributor" wording.
- Move the existing video entry to the top of "Preprints & Under Review",
  label it "arXiv preprint, 2026", and remove the empty Project Releases group.
  The abbreviated author line follows the released paper's order and bolds
  Weijue Bu without implying first or equal authorship. Keep the video and
  social links, and add a November News entry linking the paper and code.

## 2026-11-17

- The user approved replacing Busuanzi with a self-managed Cloudflare Worker +
  D1 counter. Backend source, SQL migrations, tests and deployment notes live in
  `analytics/`; the public API URL is in `static/data/visitor-config.json`.
  Complete backend deployment and verification before publishing the frontend.
- A POST records one UUID event; database triggers and uniqueness constraints
  prevent duplicate/concurrent retries from inflating totals. The refresh
  button and snapshot script only GET totals. Preview hosts never count.
- Visitors estimate random first-party browser identities. Blocked storage
  counts page views without inventing a visitor ID. D1 stores HMAC hashes and
  short-lived event records, not raw IPs or original browser IDs. Keep secrets
  outside Git, retain the HMAC key between deploys, and do not casually reset
  production data.
- New-provider cache records are versioned separately from Busuanzi. Archive
  legacy totals without adding them to the new counts. On failure, retain the
  true saved timestamp and display "Live stats unavailable"; never relabel old
  data as fresh. The world map remains decorative.

## 2026-11-15

- At the user's request the Fudan Experience card shows the university emblem + wordmark (like Tsinghua/CUMT) instead of the TEAI logo: `fudan-logo.png` is the official white monochrome logo from `https://www.fudan.edu.cn/_upload/site/00/02/2/logo.png` (233x72) recoloured to Fudan blue `#0E419C`, trimmed to 221x64. The source has a brown semi-transparent drop shadow under the white glyphs; only near-white pixels are kept, otherwise the shadow turns into a blue halo. No higher-resolution official source was reachable (the old `fudan.edu.cn/files/logo.zip` is 404). The sidebar keeps the TEAI logo.
- Personal touches (user-chosen): sidebar motto **知行合一** under the name (chosen by the user because 知/行 mirror reasoning/action), set in Zhi Mang Xing brush script subset to those four glyphs (`zhimangxing-motto.woff2`, 1.5 KB, OFL), with an English `title` tooltip. The Reflections section closes with a right-aligned handwritten "Weijue Bu" signature: inline SVG glyph outlines from Mrs Saint Delafield (OFL; outlines only, no font file shipped), drawn letter by letter once when scrolled into view (`profile.js`), static and filled without JS or under reduced motion. This is the only Chinese text besides logo artwork; keep it.
- Mobile/tablet pass (user asked for both PC and mobile to be polished): at <=760px the nav is two tiers, name on top and a swipeable one-row section strip (edge-faded, hidden scrollbar) that auto-scrolls to keep the current section in view. At <=900px the sidebar hides its own name (the page H1 and nav already show it; the 知行合一 motto leads the identity block) and the sidebar visitor peek (the full Visitors section is at the bottom). Small labels are at least ~11px; disclosure toggles and small standalone links get 6-8px vertical padding on touch widths. Scrollspy switches when a heading passes ~30% of the viewport height.
- Nav scroll effect (after `yu2hi13.github.io`): every nav link has a 2px underline scaled from the centre, grey on hover and link-blue for the current section, animated in .28s. `profile.js` scrollspy lights the last section when the page is scrolled to the bottom, and after a nav click it keeps the clicked link lit until scrolling comes to rest (180ms after the last scroll event, 4s cap; any wheel/touch/key input releases it) so the underline does not flicker through intermediate sections.
- Publications follow the senior collaborator's homepage (`yu2hi13.github.io`) at the user's request: no card borders, one row per paper separated by hairlines; a 42% media column holding a 16:9 frame with a soft shadow (videos `cover`, figures `contain` on white), top-aligned with the title; a venue ribbon (`.pub-badge`, link blue; grey for "Under review") hanging off the frame's top-left corner. Titles all start at the same x. Earlier variants the user rejected: small centred media with big gaps, full-bleed cropped video panels, bordered cards with inset media.
- The user rejected the green/tinted panels as looking "too AI": all cards (experience, publications, open source) are now plain white with a 1px line, no green or grey fills; accents use only the existing link blue and neutral ink, and the video badge is a translucent dark label. Do not reintroduce tinted card backgrounds or teal accents.
- Homepage refresh (user-approved; style references `selen-suyue.github.io` and the senior collaborator's homepage `yu2hi13.github.io`, adapted rather than copied). Keeps white background, blue links, Newsreader + Inter; adds one local **Caveat** handwritten greeting (`static/assets/fonts/caveat-latin.woff2` + OFL). Sticky nav with scrollspy, sticky desktop sidebar, four Experience cards placed above Publications, publication topic filters (All / Robotics / Multimodal / Systems). Behaviour lives in `static/js/profile.js`; preview videos autoplay only when visible, have a play/pause button, and respect reduced motion. Inline play/pause/graduation-cap icons are from Lucide (`static/assets/lucide-LICENSE.txt`).
- The user rejected the blue-background CUMT tile. `cumt-logo.png` is now the official monochrome wordmark from `https://www.cumt.edu.cn/images/logo.png` (white, transparent) recoloured to CUMT blue `#00549f` with alpha kept, shown on the same white card as the other affiliations. Do not reintroduce the blue tile.
- Added **Mind2Act World** under a new "Project Releases" publication group, at the user's request (the user contributed to the project). Title, description and links follow the senior collaborator's homepage entry: project release 2026, technical report and full code coming soon; no public author list exists, so the entry says "Project contributor" only. Links: project site, Douyin, RedNote (English labels, English-only site). Preview `static/assets/videos/mind2act_thumb.mp4` is a 23s, 640px, muted cut (19s–42s) of the senior's public preview video; poster `thumbs/mind2act.jpg` is a frame from it.
- Visitor counter and its dated fallback/retry behaviour are unchanged.

## 2026-10-17

- The user explicitly chose **Agentic Robotics** as the research-area label, replacing **Agentic Robot Learning**. Apply it consistently to the homepage metadata, sidebar, interests and focus paragraph, the GitHub profile README, and GitHub account bio. The paired direction remains **Embodied Reasoning**; RSI remains a long-term goal. This supersedes the terminology in the 2026-10-07 note. Use natural sentence case in prose and title case in the short GitHub bio; do not rewrite historical paper titles or imply new research results.

## 2026-10-16

- The user's public contact email is now **weijue1215@163.com**, per explicit request. Both the homepage Email link and GitHub profile README mailto use this address; preserve it in future updates.
- Added OpenYoink to a dedicated **Open Source** section between Publications and Experience, with a matching top-nav anchor and GitHub profile entry. It is the user's public MIT-licensed macOS app (`https://github.com/MuQY1818/OpenYoink`), built with SwiftUI and AppKit; describe the drag-and-drop shelf / Dynamic Island, Quick Look, optional clipboard history, and multi-display support as documented in the public README. Link to the English project website, source, and latest release. Keep research statements and publication entries unchanged.
- The local project icon (`static/assets/img/openyoink-icon.png`, also `assets/openyoink-icon.png` in the profile) is the existing 256px app-icon PNG from `OpenYoink/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-256.png`; preserve its artwork and transparency. No remote badges or third-party asset requests are added, and no changing star/download counts are hard-coded.

## 2026-10-15

- Unified both homepage Experience entries around horizontal official logos and a shared 160px brand column; text starts at the same position, and both entries stack consistently on small screens. The user explicitly requested replacing the circular Tsinghua emblem here, superseding the earlier emblem-layout note. `tsinghua-logo.svg` is the same original-colour vector used in the GitHub profile, extracted from the official VI handbook page 30 (A-3-10, emblem with horizontal Chinese/English wordmark) with its 2X clear space retained. Keep the original proportions; do not crop or recolour it.
- Added the user-confirmed **incoming Embodied AI Algorithm Intern at Noematrix** status to the homepage bio, News, and Experience, and the GitHub profile README. Expected start: **2026-10-26**, from the offer supplied by the user. Keep the role explicitly incoming until the user confirms starting; do not present completed contributions or assume a current employment period. Post-training is the communicated focus; no specific model, mentor, or independent research assignment has been confirmed.
- Noematrix wordmark: official **609 × 144 PNG**, sourced from `https://www.noematrix.ai/image/common/logo.png` on the corporate homepage. Preserve original proportions and colours; the homepage displays it at 160px wide (more than 3× source density). The GitHub profile uses the same native pixels with 24px padding and a white-backed dark-theme variant for legibility. Neither is a vector or an AI-upscaled logo.
- The new Experience entry reuses the existing typography/card layout, with a blue brand accent, spacing between entries, and a single-column layout on small screens. Existing Tsinghua emblem, research focus, approved Reflections text, and publication contents are preserved.

## 2026-10-12

- Added the user-approved, English-only **Reflections** section after Awards, with a `#reflections` top-nav link. The two paragraphs describe the user's changing perspective from efficiency to intelligence, ask how experience can build lasting capability without forgetting, and connect that question to embodied AI through action and environmental evidence. Preserve the approved text; the past/present/future framing is a personal perspective rather than a universal historical claim.
- Reused existing section headings, typography, and paragraph spacing. The reflection is ordinary prose, with no quotation styling, extra decoration, or new JavaScript. Updated the stylesheet version for the paragraph-spacing rule. The GitHub profile README was not part of this addition.
- **Typography change (chosen from four rendered previews: A Source Serif 4 + Inter / B Newsreader + Inter / C Instrument Sans + JetBrains Mono / D full-serif Newsreader).** User picked **B**, and the sans direction was rejected as clashing with the existing blue chips and rounded cards. Now: `Inter` for body/nav/meta at `15.5px / 1.7`, and `Newsreader` 500 for `.side-name`, `.section h2`, `.pub-sub`, `.pub-title`, `.exp-role`. The previous `Helvetica Neue` stack had no typographic intent — headings and body differed only by weight.
- **Fonts are self-hosted, not linked from Google Fonts.** Per the user's "只保留实际用到的字重" choice, only the **latin** subsets were downloaded to `static/assets/fonts/` (`inter-latin.woff2` 48KB as a 400–600 variable font, `newsreader-latin.woff2` 59KB at 500), each with its `*-OFL.txt`. Keep them local: the site previously had zero third-party requests, and a Google Fonts link would both slow/fail on mainland networks and fall back to a worse system font. Verify any new weight by checking `document.fonts` reports `loaded` and that `performance.getEntriesByType("resource")` shows no external host.
- Font-family fallbacks stay in every rule (`Georgia, "Times New Roman", serif` for display, the original Helvetica/Arial stack for body) so the page degrades sanely if a woff2 ever fails to load.

## 2026-10-07

- Research focus re-stated per user request — the user judged the earlier phrasing imprecise: "我的研究 focus 应该是 我研究 Agentic Robot Learning / Embodied Reasoning 这一块可能比较准确". **Current focus is now `agentic robot learning` + `embodied reasoning`**; these two replaced `embodied foundation models` / `embodied agents` / `Agentic Embodied AI` everywhere the focus is stated (homepage `meta description`, sidebar `.side-focus`, bio interests, bio focus paragraph; README Research section). Sentence form is deliberately identical in both places: "My current focus is … — vision-language models that reason about the physical world and drive robots through long-horizon manipulation tasks."
- **RSI is KEPT but demoted to a long-term goal**, per the user's explicit choice when asked ("两个都保留，RSI 作为长期方向"): both pages now end the focus with "Longer term, I want to work on **RSI (recursive self-improvement) in Embodied AI**." — keep the spelled-out expansion on first use (see the 2026-09-25 note; bare "RSI" misreads in English contexts). Do not delete RSI, and do not promote it back to the lead focus without asking.
- `spatial intelligence` and `long-horizon robotic manipulation` stay in the bio interest list — the user only revised the *focus* pair. The Tsinghua Experience text and all publication entries are untouched (ChainVLA keeps its factual VLA wording).
- README Research: the standalone "I work on spatial intelligence and embodied AI for long-horizon robotic manipulation." lead was dropped rather than re-worded, because the new focus sentence already carries the manipulation end-goal and the paragraph read repetitively otherwise; the paragraph now opens directly with "My research asks how vision-language models can reason about the physical world and act over long horizons…".

## 2026-10-05

- Awards list completed against the 保研 résumé (`08-保研材料/02_申请材料/简历/Latex项目/Latex/main_chinese_boxed.tex`, 8 items): added the three that were missing — 2026.08 Second Prize, 15th "China Software Cup" Collegiate Software Design Contest (National Finals, Higher Education Group); 2025.09 15th Place, Tianchi Alibaba Mobile Recommendation Algorithm Challenge; 2025.07 Second Prize, RAICOM Jiangsu Division Programming Skills Competition. **This reverses the 2026-07-19 note that kept Tianchi/RAICOM off the homepage** — the user has since asked for the full list ("Award 好像没有写全啊"), so completeness now wins. Homepage and README Honors both carry all 10 entries in reverse-chronological order (10 = the résumé's 8 + National Scholarship + SJTU Academic Potential 1st Prize, the latter two sourced from the 保研 résumé's parent list and older résumé versions respectively).

## 2026-10-04

- Removed supervisor/group attribution from the public profile per user request ("Professor Wang Zhi's Group 就不写吧，都统一不写哪个老师的组了"): homepage bio now says only "at Tsinghua Shenzhen International Graduate School"; Experience card org line is only the school (no `Prof. Zhi Wang's group`); GitHub README intro and Experience entry likewise omit the supervisor. Paper author lists still contain Zhi Wang where he is a paper co-author — that is bibliographic fact, not an internship-group affiliation, so do not remove it.
- Experience uses the complete official vector emblem in `static/assets/img/affiliations/tsinghua-emblem.svg`, extracted from the **official VI handbook** `https://vi.tsinghua.edu.cn/download/VisualIdentity-cn.pdf` page 5 (A-1-01). Preserve all three emblem paths, their original fills and proportions, and the official 2X clear space (X = emblem diameter / 15). The former density-cropped PNG clipped the upper/right outer ring; it is no longer used. Do not raster-crop, apply circular clipping, or recolour the emblem. Its display box is 96px on desktop and 80px on mobile; the work description spans the full entry width below the identity row.
- Added an **Experience** section (homepage `#experience` + nav link; plain-text version in the profile README): Research Intern, Tsinghua Shenzhen International Graduate School, Prof. Zhi Wang's group, **2025.12 – 2026.08**. Dates verified against the sealed internship certificate (`09-求职实习/卜炜珏_清华科研实习证明_求职版.pdf` and the original docx: 中山大学 `00_原始附件/实习证明.docx`, issued 2026-08-28) — **the internship résumé's "2026.07" is outdated; 2026.08 is correct.** Bio switched to past tense.
- Blog removed from the homepage per user request ("Blog 这个模块先帮我砍掉吧"). Only two links existed (top nav + sidebar, both `blog.html`); the `#blog`/Recent Posts section was already gone in the 2026-09-24 redesign and `index.html` no longer loads `blog.js`. `blog.html`, `post.html`, `posts/*` and the blog CSS/JS are KEPT in the repo so the module can be restored by re-adding two links — "先" implies it may come back.
- Linked the ChainVLA project page (`https://muqy1818.github.io/chainvla-web/`, from the arXiv tex; the URL is NOT in the ICLR submission so double-blind is intact) and the RoboStream code repo (`https://github.com/yu2hi13/RoboStream`, from the project page — it lives on the co-first author's account, not the user's).
- Conscious Gaze teaser replaced per user feedback ("太丑了") with the paper's **Fig. 3 (Cognitive Demand Sensor)**, from page 3 of the camera-ready rendered at 400 DPI. The figure is ~3.5:1, so `thumbs/cgvlm.jpg` is centred on a white 2:1 canvas (560x280) to keep the row height in step with the other thumbnails.
- PiN-Mod teaser: `thumbs/pinmod.jpg` from the architecture figure the user supplied (1598x840 source, already ~2:1). Every publication entry now carries a thumbnail, so `.pub` is uniformly `has-thumb` — the full-width fallback in CSS stays for future entries that have no figure.
- RoboStream teaser is now a looping video instead of a still (`robostream_thumb.mp4`: transcoded from `videos/robostream_overview.mp4` — 560x316, H.264 CRF 30, no audio, `+faststart`, 476KB vs the 4MB original).
- Added the page's ONLY script, an inline reduced-motion guard before `</body>`: under `prefers-reduced-motion: reduce` it strips `autoplay` and pauses, leaving the poster. Needed because a looping autoplay video is continuous motion (WCAG 2.2.2) and the homepage is otherwise JS-free — do not grow this script beyond that guard.
- Publication thumbnails sit on the left (reference: the user's screenshot of an academic-group site). `static/assets/img/Papers/thumbs/*.jpg` are 560px wide, ~21-42KB; `calo.jpg`/`chainvla.jpg` were cropped from their sharp letterbox bands — `CALO.png` (71,412)-(965,831) and `ChainVLA.png` (52,396)-(947,863).
- Original `Papers/*.png` are kept: `posts/hello-blog.md` still embeds `RoboStream.png`.

## 2026-10-03

- Added the National Scholarship (2025–2026 academic year, undergraduate) to homepage News (2026.10 entry, top) and Awards (top), and to the profile README's News and Honors. English rendering: "National Scholarship (2025–2026 academic year)" — dated 2026.10 when the award notice arrived.

## 2026-09-25

- Synced ChainVLA's title with the current ICLR resubmission (source: `iclr2027/main.tex` in the Obsidian paper vault, title `\title{ChainVLA: Chaining Vision-Language-Action Queries through a Unified Execution State for Long-Horizon Manipulation}`): homepage publication entry and the profile README both switched from the old "Chaining Task Progress and Motion Intent Across VLA Queries". Still shows "Under review" only — the submission venue stays hidden on public pages until acceptance (standing double-blind rule from 2026-07-19 v3).
- Reframed the research direction per user request ("以后我想做具身大模型和具身智能体" + "VLA WAM 我比较持悲观态度"): personal statements across homepage and README now lead with **embodied foundation models** and **embodied agents**; the sidebar focus line reads "Focusing on embodied foundation models and embodied agents — VLM-driven robotic manipulation."; bio interests dropped "VLA state memory"/"spatio-temporal reasoning" for the new pair; the Tsinghua internship sentence says "vision-language-model-based planning" instead of "VLA planning"; README lost the "receding-horizon VLA policies" sentence. Deliberately NO negative stance on VLA/VAM anywhere public (ChainVLA is still under review; publication entries keep their factual VLA descriptions) — the preference is expressed by what the profile now emphasizes.
- Added the user's two current research directions across homepage and profile README (user phrasing: "具身智能的 RSI" + "Agentic Embodied AI", i.e. VLM-driven robots doing manipulation; RSI read as recursive self-improvement): homepage sidebar `.side-focus` and a third bio paragraph state the current focus with both directions bolded, and the README Research section carries the same sentence. "RSI" is deliberately spelled out on first use — in English contexts bare "RSI" can misread; keep the expansion.

## 2026-09-24

- Homepage fully redesigned per user request (reference: bighuang624.github.io, an academicpages-style Jekyll site, "现在的主页有点花里胡哨"): `index.html` rewritten as a static academic page — slim top nav, left sidebar (GitHub avatar, name, role, contact links with feather icons, WeChat line, TEAI logo), main column (bio, News, Publications grouped into Peer-reviewed Conference / Journal / Preprints & Under Review, Awards & Honors). New `static/css/home.css`; ZERO JavaScript — no canvas, typewriter, ticker, video feeds, tilt, fancy cursor or metric counters; light-only (homepage drops the dark toggle; blog/post pages keep academic.css + their own dark mode, so `academic.css` and `home.js` remain in the repo but `index.html` no longer references `home.js`). This also removes the old ≤320px topnav overflow noted below.
- Avatar: `static/assets/img/avatar.jpg` — the user's GitHub avatar (`github.com/muqy1818.png`; JPEG data despite the .png URL, hence the .jpg name).
- English-only per user request ("不要出现中文"): page title/name is "Weijue Bu"; the KaiTi Chinese-name hero is gone. Venue chips are pure CSS (no shields badges); ChainVLA stays venue-less ("Under review", double-blind). The Challenge Cup project card was dropped (the award itself remains in News + Awards).
- Per follow-up feedback, author-position labels were removed from News ("(co-first author)" / "(student first author)" / "(first author)") and the explicit "co-first author" text next to ChainVLA — author order plus the * equal-contribution note carry that information now. The profile README's News was synced the same way.
- Removed the major-rank callouts per user request ("Rank 9/185 可以不用说"): the `Rank 9/185 · Top 4.86%` fact chip and the `Major Rank · Top` metric (hero metrics strip now spans 3 columns), and the rank clause in `bio-lead`. Also dropped from the GitHub profile README's About Me line. Do not re-add rank/GPA mentions to published pages (same standing rule as the CV link and GPA chip from 2026-07-19).

- Announced admission to Fudan TEAI (incoming graduate student) across the homepage: hero eyebrow → "Incoming Graduate Student @ FUDAN TEAI", a new `.affiliation-marks` logo strip between the eyebrow and the name, bio rewritten to lead with the incoming status (CUMT undergrad and Tsinghua SIGS internship preserved as current), a `Fudan TEAI · Incoming` fact chip (hot-styled), one typewriter phrase replaced with `INCOMING @ FUDAN TEAI`, and a 2026.09 news item linking `teai.fudan.edu.cn`.
- Official logos added under `static/assets/img/affiliations/`: `teai-logo.svg` + `teai-logo-white.svg` (TEAI's own horizontal marks from teai.fudan.edu.cn). The TEAI mark swaps to the white version under `html[data-theme="dark"]` via two `<img>`s toggled in CSS — NOT `<picture media>`, because the site's theme is a localStorage attribute and `prefers-color-scheme` would not follow it. (Per later user request the homepage shows the TEAI mark only; `fudan-emblem.png` was removed from the site and lives solely in the profile README's `assets/`.)
- Logos are local assets rather than remote hotlinks; GitHub profile README uses the same two files under `assets/`.
- Known pre-existing issue, not fixed here: at ≤320px viewports `.topnav` overflows horizontally (GitHub link + theme toggle clipped); unrelated to this update.

## 2026-07-24

- Dark mode is now site-wide (previously blog-only): the palette redefinitions + `.theme-toggle` rule moved from `blog.css` into `academic.css` (blog.css keeps only blog components); hard-coded light tints overridden under `html[data-theme="dark"]` are `.topbar`, `.ticker`, `.news-list li:hover`. The `[ Dark ]` toggle lives in the topnav on every page (same localStorage key `blog-theme`, same inline pre-paint script).
- `home.js` canvas line-art follows the theme: all `rgba(20,20,19,...)` ink strokes go through a mutable `INK` variable (light `20,20,19` / dark `236,234,227`), contact shadows through `SHADE` (dark = `0,0,0`); a MutationObserver on `<html data-theme>` swaps values and the next animation frame repaints. Coral accents unchanged.
- Theme toggle upgraded from plain text to an animated icon chip (sun/moon SVG morph, in `academic.css`); clicking reveals the new theme via `document.startViewTransition` — a soft-edged radial mask (`@property --reveal-r` animated on `::view-transition-new(root)`, 180px feather, 850ms easeInOutCubic + 260ms fade-in) expanding from the pointer; falls back to an instant switch on Firefox / reduced-motion. Same handler duplicated in `blog.js` and `post.js` (`initThemeToggle`). Load-bearing detail: the mask animation needs `fill: 'forwards'` — without it `--reveal-r` snaps back to 0 at the end and the old theme flashes for a frame. (A full freeze mechanism that paused canvas/video/typewriter during the transition was tried and REMOVED per user preference — live motion keeps playing during the sweep.)
- Published the full Tsinghua exam cheatsheet as a single long reference post `exam-template` (title 「机考模板」; converted from the LaTeX parts in the author's Obsidian vault, code blocks verified byte-identical to source; all 11 sections in one page, user explicitly wanted one plain post instead of a split series). tikzpicture figures from the source are not renderable on the web — their captions/essential in-figure content were preserved as text/formulas instead.
- Added root `.nojekyll` so GitHub Pages serves the site 100% statically (guarantees `posts/*.md` are served verbatim and skips Jekyll build processing).
- Added paper grain + custom cursor (both in `academic.css`): `body::before` is a fixed SVG feTurbulence noise layer (grayscale, opacity .035, z-index 90, `filter: invert(1)` in dark mode) giving the paper its tooth. The cursor is a coral dot following instantly + a lagging reticle ring (lerp .16, rAF loop) injected by `initCursor()` (duplicated in `blog.js` and `post.js`, gated to fine pointers / no reduced-motion; `html.fancy-cursor * { cursor: none }`, text fields keep the native I-beam and hide the pair). Ring expands + reveals reticle ticks over interactive elements (`pointerover` delegation), shrinks on pointerdown. (A pointer-following spotlight glow preceded the cursor and was REMOVED per user feedback — do not re-add it.)
- cache-bust bumped to `?v=20260724i` (academic.css + home.js + blog.css).

## 2026-07-23

- Added a client-side Markdown blog module (no build step, GitHub Pages friendly):
  - posts live in `posts/<slug>.md`; `posts/index.json` is the manifest (slug/title/date/tags/excerpt); publishing = add the md file + a manifest entry + push. Image paths inside posts are relative to the site root (e.g. `static/assets/img/...`).
  - `blog.html` = list page (live search + tag pill filters + card grid, staggered fade-in); `post.html?p=<slug>` = reader page (vendored `marked.min.js` + DOMPurify + highlight.js + KaTeX auto-render, the latter three from CDN). Math is protected from the Markdown parser via `@@MATHn@@` placeholders before `marked.parse`, restored before sanitize; delimiters `$$...$$`, `\[...\]`, `\(...\)`.
  - homepage gained a Blog section (Module 02; Publications/Awards renumbered 03/04) filled by `static/js/blog.js` into `#recent-posts` with news-list markup; topnav gained a `Blog` link (the mobile CSS hides the 3rd nav item = Awards, Blog stays visible).
  - `static/css/blog.css` reuses the academic.css design tokens (palette/fonts/shadows) instead of defining its own; dark mode (blog pages only, homepage stays light) just redefines the same CSS vars under `html[data-theme="dark"]` + overrides the hard-coded light topbar tint; persisted in localStorage key `blog-theme`; toggle is the `[ Dark ]` topnav button on blog pages.
  - reader page extras: coral reading progress bar, sticky TOC built from h2/h3 (hidden < 992px), code blocks with feed-bar style header + copy button, prev/next nav, reading-time estimate.
  - blog pages deliberately do NOT load `home.js` or the robot-arm canvas — quiet reading page; consistency comes from shared tokens/topbar/footer.
  - cache-bust bumped to `?v=20260723a`.

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
- Reflections third paragraph (user-approved 2026-11-15): the reward loop that shapes robots also shapes people; ends on the research yardstick "real work in the world vs. a number on a leaderboard". Keep personal stories, third parties, and determinism/education-policy material off the site.
