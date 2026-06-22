/* =====================================================================
   library.js — Renders the home page book list from books-data.js and
   powers the client-side search + faceted filters. No dependencies, no
   network: everything runs from the in-page BOOKS array so the site
   stays static and works from file://.
   ===================================================================== */
(function () {
    'use strict';

    /* ---- escape helper (data is trusted, but keep rendering safe) ---- */
    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    /* ---- filter state: a query string + one Set of values per facet ---- */
    var FACET_KEYS = ['stage', 'difficulty', 'topics', 'audience'];
    var state = { query: '', stage: new Set(), difficulty: new Set(), topics: new Set(), audience: new Set() };

    /* Precompute a lowercased search haystack per book so typing is cheap.
       Includes the visible text plus the Sinhala facet labels, so a search
       like "භාවනා" or "පෝය" also matches via the tags. */
    function labelFor(facet, value) {
        var list = FACETS[facet] || [];
        for (var i = 0; i < list.length; i++) { if (list[i].value === value) return list[i].label; }
        return value;
    }
    BOOKS.forEach(function (b) {
        var parts = [b.title, b.topic, b.desc, b.tag, labelFor('stage', b.stage), labelFor('difficulty', b.difficulty)];
        b.topics.forEach(function (t) { parts.push(t, labelFor('topics', t)); });
        b.audience.forEach(function (a) { parts.push(a, labelFor('audience', a)); });
        b._haystack = parts.join(' ').toLowerCase();
    });

    /* ---- matching --------------------------------------------------- */
    function matchesFacet(book, facet) {
        var sel = state[facet];
        if (sel.size === 0) return true;                 // no selection = no constraint
        if (facet === 'topics' || facet === 'audience') { // book matches if it has ANY selected value
            return book[facet].some(function (v) { return sel.has(v); });
        }
        return sel.has(book[facet]);                     // single-valued facets
    }
    function matches(book) {
        if (state.query && book._haystack.indexOf(state.query) === -1) return false;
        return FACET_KEYS.every(function (f) { return matchesFacet(book, f); });
    }

    /* ---- reading progress (shared with reader.js via localStorage) -- */
    /* reader.js stores per-book keys "reader-pos:<file>" (auto) and
       "reader-mark:<file>" (manual). We surface them here as a "continue
       reading" hint so a started book is easy to pick back up. */
    function readingState(b) {
        if (!b.url) return null;
        var file = b.url.split('/').pop();
        function get(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
        var mark = get('reader-mark:' + file), pos = get('reader-pos:' + file), t = mark || pos;
        if (!t || typeof t.progress !== 'number') return null;
        var p = Math.max(0, Math.min(100, Math.round(t.progress)));
        if (p < 2 || p > 99) return null;           // not meaningfully started, or finished
        return { progress: p, hasMark: !!mark };
    }

    /* ---- card + panel rendering ------------------------------------ */
    function cardHTML(b) {
        var soon = !b.available;
        var rs = soon ? null : readingState(b);
        var read;
        if (soon) {
            read = '<span class="card-read is-soon">ඉදිරියේදී</span>';
        } else {
            var href = esc(b.url) + (rs ? '#resume' : '');
            read = '<a class="card-read' + (rs ? ' is-resume' : '') + '" href="' + href + '">' +
                (rs ? 'දිගටම කියවන්න' : 'කියවන්න') + '</a>';
        }
        var progress = rs
            ? '<div class="card-progress" aria-label="කියවූ ප්‍රමාණය ' + rs.progress + '%">' +
                '<span class="card-progress-track"><span class="card-progress-fill" style="width:' + rs.progress + '%"></span></span>' +
                '<span class="card-progress-num">' + (rs.hasMark ? '🔖 ' : '') + rs.progress + '%</span>' +
              '</div>'
            : '';
        return '' +
            '<article class="card' + (soon ? ' card-soon' : '') + '">' +
                '<span class="card-tag' + (soon ? ' tag-soon' : '') + '">' + esc(b.tag) + '</span>' +
                '<h3 class="card-title">' + esc(b.number) + '. ' + esc(b.title) + '</h3>' +
                '<p class="card-topic">' + esc(b.topic) + '</p>' +
                '<p class="card-desc">' + esc(b.desc) + '</p>' +
                progress +
                read +
            '</article>';
    }
    function panelHTML(stage, books) {
        var cards = books.map(cardHTML).join('');
        var sub = stage.sub ? '<p class="phase-sub">' + esc(stage.sub) + '</p>' : '';
        return '' +
            '<section class="phase" id="' + stage.id + '">' +
                '<div class="phase-head">' +
                    '<span class="phase-num">' + stage.num + '</span>' +
                    '<div><h2 class="phase-title">' + esc(stage.title) + '</h2>' + sub + '</div>' +
                '</div>' +
                '<p class="phase-lede">' + esc(stage.lede) + '</p>' +
                '<div class="card-grid">' + cards + '</div>' +
            '</section>';
    }

    var libraryEl, countEl, noResultsEl;

    function render() {
        var html = '';
        var total = 0;
        STAGES.forEach(function (stage) {
            var books = BOOKS.filter(function (b) { return b.stage === stage.key && matches(b); });
            total += books.length;
            if (books.length) html += panelHTML(stage, books);
            // Dim the matching quick-link in the top bar when a stage is empty.
            var link = document.querySelector('.topbar-nav a[href="#' + stage.id + '"]');
            if (link) link.classList.toggle('is-empty', books.length === 0);
        });
        libraryEl.innerHTML = html;
        countEl.textContent = 'ග්‍රන්ථ ' + total + 'ක්';
        noResultsEl.hidden = total !== 0;
    }

    /* ---- filter toolbar UI ----------------------------------------- */
    function buildFilters(container) {
        var html = FACET_KEYS.map(function (facet) {
            var chips = FACETS[facet].map(function (opt) {
                return '<button type="button" class="chip" data-facet="' + facet + '" ' +
                    'data-value="' + esc(opt.value) + '" aria-pressed="false">' + esc(opt.label) + '</button>';
            }).join('');
            return '<div class="filter-group">' +
                '<span class="filter-group-label">' + esc(FACET_LABELS[facet]) + '</span>' +
                '<div class="chips">' + chips + '</div></div>';
        }).join('');
        container.innerHTML = html;

        container.addEventListener('click', function (e) {
            var btn = e.target.closest('.chip');
            if (!btn) return;
            var facet = btn.dataset.facet, value = btn.dataset.value;
            var on = state[facet].has(value);
            if (on) { state[facet].delete(value); } else { state[facet].add(value); }
            btn.setAttribute('aria-pressed', on ? 'false' : 'true');
            render();
            updateClearButton();
        });
    }

    var clearBtn;
    function anyActive() {
        return state.query !== '' || FACET_KEYS.some(function (f) { return state[f].size > 0; });
    }
    function updateClearButton() {
        if (clearBtn) clearBtn.hidden = !anyActive();
    }
    function clearAll() {
        state.query = '';
        FACET_KEYS.forEach(function (f) { state[f].clear(); });
        document.querySelectorAll('.chip[aria-pressed="true"]').forEach(function (c) {
            c.setAttribute('aria-pressed', 'false');
        });
        var input = document.getElementById('book-search');
        if (input) input.value = '';
        render();
        updateClearButton();
    }

    /* ---- init ------------------------------------------------------- */
    function init() {
        libraryEl = document.getElementById('library');
        countEl = document.getElementById('result-count');
        noResultsEl = document.getElementById('no-results');
        if (!libraryEl) return;

        buildFilters(document.getElementById('filters'));

        var input = document.getElementById('book-search');
        if (input) {
            input.addEventListener('input', function () {
                state.query = input.value.trim().toLowerCase();
                render();
                updateClearButton();
            });
        }

        clearBtn = document.getElementById('clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', clearAll);

        render();
        updateClearButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
