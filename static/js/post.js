/* Post reader page (post.html?p=<slug>) */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initThemeToggle();
        initSpotlight();
        initProgressBar();

        var slug = new URLSearchParams(location.search).get('p');
        if (!slug || !/^[\w-]+$/.test(slug)) {
            showError('No post specified.');
            return;
        }

        Promise.all([
            fetch('posts/index.json').then(function (r) { return r.json(); }),
            fetch('posts/' + encodeURIComponent(slug) + '.md').then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
        ]).then(function (results) {
            var posts = results[0].sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
            var md = results[1];
            var idx = posts.findIndex(function (p) { return p.slug === slug; });
            renderPost(md, idx >= 0 ? posts[idx] : null);
            renderPrevNext(posts, idx);
        }).catch(function (err) {
            console.error(err);
            showError('Post not found: "' + slug + '".');
        });
    }

    /* ---------- rendering ---------- */

    function renderPost(md, meta) {
        var title = meta ? meta.title : 'Untitled';
        document.title = title + ' - Weijue Bu';
        var desc = document.querySelector('meta[name="description"]');
        if (desc && meta && meta.excerpt) desc.setAttribute('content', meta.excerpt);

        document.getElementById('post-title').textContent = title;
        document.getElementById('post-meta').innerHTML = [
            meta ? '<span class="post-date">' + formatDate(meta.date) + '</span>' : '',
            '<span>' + readingTime(md) + '</span>'
        ].concat(
            meta && meta.tags ? meta.tags.map(function (t) { return '<span class="mini-tag">' + escapeHtml(t) + '</span>'; }) : []
        ).join('');

        // Protect math segments before Markdown parsing, restore after.
        var math = [];
        var protectedMd = md.replace(
            /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g,
            function (m) { return '@@MATH' + (math.push(m) - 1) + '@@'; }
        );
        var html = marked.parse(protectedMd);
        html = html.replace(/@@MATH(\d+)@@/g, function (_, i) { return math[+i]; });
        html = DOMPurify.sanitize(html);

        var content = document.getElementById('post-content');
        content.innerHTML = html;

        if (window.renderMathInElement) {
            renderMathInElement(content, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '\\(', right: '\\)', display: false }
                ],
                throwOnError: false
            });
        }

        enhanceCodeBlocks(content);
        buildToc(content);
    }

    /* ---------- code blocks: highlight + header + copy ---------- */

    function enhanceCodeBlocks(root) {
        root.querySelectorAll('pre code').forEach(function (code) {
            if (window.hljs) {
                try { hljs.highlightElement(code); } catch (e) { /* plain text */ }
            }
            var pre = code.parentElement;
            var lang = (code.className.match(/language-(\w+)/) || [null, 'text'])[1];

            var wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            var header = document.createElement('div');
            header.className = 'code-block-header';

            var label = document.createElement('span');
            label.textContent = lang;

            var btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', function () {
                navigator.clipboard.writeText(code.innerText).then(function () {
                    btn.textContent = 'Copied ✓';
                    setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
                });
            });

            header.appendChild(label);
            header.appendChild(btn);
            wrapper.insertBefore(header, pre);
        });
    }

    /* ---------- table of contents ---------- */

    function buildToc(content) {
        var tocBox = document.getElementById('toc-list');
        var tocCol = document.getElementById('post-toc-col');
        if (!tocBox) return;

        var headings = content.querySelectorAll('h2, h3');
        if (headings.length < 2) {
            if (tocCol) tocCol.style.display = 'none';
            return;
        }

        var links = [];
        headings.forEach(function (h, i) {
            if (!h.id) h.id = 'sec-' + i;
            var a = document.createElement('a');
            a.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-h3' : '');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            tocBox.appendChild(a);
            links.push({ h: h, a: a });
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    links.forEach(function (l) { l.a.classList.toggle('active', l.h === en.target); });
                }
            });
        }, { rootMargin: '-10% 0px -75% 0px' });
        headings.forEach(function (h) { observer.observe(h); });
    }

    /* ---------- prev / next navigation ---------- */

    function renderPrevNext(posts, idx) {
        var box = document.getElementById('post-nav');
        if (!box || idx < 0) return;
        var newer = idx > 0 ? posts[idx - 1] : null;
        var older = idx < posts.length - 1 ? posts[idx + 1] : null;
        box.innerHTML =
            (newer
                ? '<a href="post.html?p=' + encodeURIComponent(newer.slug) + '"><span class="nav-label">← Newer</span>' + escapeHtml(newer.title) + '</a>'
                : '<span></span>') +
            (older
                ? '<a class="nav-next" href="post.html?p=' + encodeURIComponent(older.slug) + '"><span class="nav-label">Older →</span>' + escapeHtml(older.title) + '</a>'
                : '<span></span>');
    }

    /* ---------- progress bar & theme ---------- */

    function initProgressBar() {
        var bar = document.getElementById('reading-progress');
        if (!bar) return;
        var onScroll = function () {
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function initThemeToggle() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var sync = function () {
            var dark = document.documentElement.dataset.theme === 'dark';
            btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
            btn.setAttribute('aria-label', btn.title);
            btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
            var light = document.getElementById('hljs-light');
            var darkCss = document.getElementById('hljs-dark');
            if (light && darkCss) {
                light.disabled = dark;
                darkCss.disabled = !dark;
            }
        };

        btn.addEventListener('click', function (e) {
            var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            var apply = function () {
                document.documentElement.dataset.theme = next;
                localStorage.setItem('blog-theme', next);
                sync();
            };
            if (reduceMotion || !document.startViewTransition) {
                apply();
                return;
            }
            var x = e.clientX, y = e.clientY;
            var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 360;
            var root = document.documentElement;
            root.style.setProperty('--tx', x + 'px');
            root.style.setProperty('--ty', y + 'px');
            var vt = document.startViewTransition(apply);
            vt.ready.then(function () {
                // easeInOutCubic sweep + feathered mask edge (academic.css).
                // fill:forwards is required — without it --reveal-r snaps back
                // to 0 at the end and the old theme flashes for a frame.
                root.animate(
                    { '--reveal-r': ['0px', radius + 'px'] },
                    { duration: 850, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
                );
                root.animate(
                    { opacity: [0, 1] },
                    { duration: 260, easing: 'ease-out', fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
                );
            }).catch(function () { /* transition skipped */ });
        });
        sync();
    }

    /* ---------- mouse spotlight (page-level warm glow) ---------- */

    function initSpotlight() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        var spot = document.createElement('div');
        spot.id = 'spotlight';
        spot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(spot);
        var sx = -1000, sy = -1000, queued = false;
        document.addEventListener('pointermove', function (e) {
            sx = e.clientX;
            sy = e.clientY;
            if (!queued) {
                queued = true;
                requestAnimationFrame(function () {
                    queued = false;
                    spot.style.setProperty('--mx', sx + 'px');
                    spot.style.setProperty('--my', sy + 'px');
                });
            }
        }, { passive: true });
    }

    /* ---------- helpers ---------- */

    function showError(msg) {
        var t = document.getElementById('post-title');
        if (t) t.textContent = 'Oops';
        var c = document.getElementById('post-content');
        if (c) {
            c.innerHTML = '<div class="blog-empty">[ ' + escapeHtml(msg) + ' ]<br><br><a href="blog.html">← Back to all posts</a></div>';
        }
    }

    function readingTime(md) {
        var text = md.replace(/[#>*`\-\[\]()\$\\]/g, ' ');
        var cjk = (text.match(/[一-鿿]/g) || []).length;
        var words = text.replace(/[一-鿿]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        var mins = Math.max(1, Math.round(words / 200 + cjk / 400));
        return mins + ' min read';
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function formatDate(iso) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
})();
