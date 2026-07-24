/* Blog list page (blog.html) + homepage "Recent Posts" preview (index.html) */
(function () {
    'use strict';

    var MANIFEST_URL = 'posts/index.json';

    document.addEventListener('DOMContentLoaded', function () {
        initThemeToggle();
        initSpotlight();

        var wantsList = document.getElementById('posts-grid');
        var wantsRecent = document.getElementById('recent-posts');
        if (!wantsList && !wantsRecent) return;

        fetch(MANIFEST_URL)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (posts) {
                posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
                if (wantsList) initBlogList(posts);
                if (wantsRecent) renderRecent(posts);
            })
            .catch(function (err) {
                console.error('Failed to load posts manifest:', err);
                if (wantsRecent) {
                    wantsRecent.innerHTML = '<li><time>----.--</time><p>Posts coming soon.</p></li>';
                }
            });
    });

    /* ---------- theme toggle (icon morph + circular reveal) ---------- */

    function initThemeToggle() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var sync = function () {
            var dark = document.documentElement.dataset.theme === 'dark';
            btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
            btn.setAttribute('aria-label', btn.title);
            btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
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

    /* ---------- blog list page ---------- */

    function initBlogList(posts) {
        var grid = document.getElementById('posts-grid');
        var searchInput = document.getElementById('blog-search-input');
        var tagBox = document.getElementById('tag-filters');
        var activeTag = 'All';
        var query = '';

        var tags = ['All'].concat(Array.from(new Set(posts.flatMap(function (p) { return p.tags || []; }))));
        tagBox.innerHTML = tags.map(function (t) {
            return '<button class="tag-pill' + (t === 'All' ? ' active' : '') + '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</button>';
        }).join('');

        tagBox.addEventListener('click', function (e) {
            var btn = e.target.closest('.tag-pill');
            if (!btn) return;
            activeTag = btn.dataset.tag;
            tagBox.querySelectorAll('.tag-pill').forEach(function (b) { b.classList.toggle('active', b === btn); });
            render();
        });

        searchInput.addEventListener('input', function () {
            query = searchInput.value.trim().toLowerCase();
            render();
        });

        function render() {
            var filtered = posts.filter(function (p) {
                var tagOk = activeTag === 'All' || (p.tags || []).indexOf(activeTag) >= 0;
                var haystack = [p.title, p.excerpt, (p.tags || []).join(' ')].join(' ').toLowerCase();
                return tagOk && (!query || haystack.indexOf(query) >= 0);
            });

            if (!filtered.length) {
                grid.innerHTML = '<div class="blog-empty">[ No posts found ]</div>';
                return;
            }

            grid.innerHTML = filtered.map(function (p, i) {
                return '' +
                    '<div class="post-card" style="animation-delay:' + Math.min(i * 60, 360) + 'ms">' +
                        '<div class="post-card-meta">' +
                            '<span class="post-card-date">' + formatDate(p.date) + '</span>' +
                            (p.tags || []).map(function (t) { return '<span class="mini-tag">' + escapeHtml(t) + '</span>'; }).join('') +
                        '</div>' +
                        '<h3 class="post-card-title">' +
                            '<a href="post.html?p=' + encodeURIComponent(p.slug) + '">' + escapeHtml(p.title) + '</a>' +
                        '</h3>' +
                        '<p class="post-card-excerpt">' + escapeHtml(p.excerpt || '') + '</p>' +
                        '<span class="read-more">Read</span>' +
                    '</div>';
            }).join('');
        }

        render();
    }

    /* ---------- homepage recent posts (news-list markup) ---------- */

    function renderRecent(posts) {
        var box = document.getElementById('recent-posts');
        var recent = posts.slice(0, 3);
        if (!recent.length) {
            box.innerHTML = '<li><time>----.--</time><p>No posts yet. Stay tuned!</p></li>';
            return;
        }
        box.innerHTML = recent.map(function (p) {
            var ym = p.date.slice(0, 7);
            return '' +
                '<li>' +
                    '<time datetime="' + escapeHtml(ym) + '">' + escapeHtml(ym.replace('-', '.')) + '</time>' +
                    '<p><a href="post.html?p=' + encodeURIComponent(p.slug) + '">' + escapeHtml(p.title) + '</a></p>' +
                '</li>';
        }).join('');
    }

    /* ---------- helpers ---------- */

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
