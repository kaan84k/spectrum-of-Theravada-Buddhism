/* =====================================================================
   reader.js — Reading-experience enhancements for book pages.
   Injects (progressive enhancement; nothing here is required to read):
     • a top reading-progress bar (long pages only)
     • a settings popover: theme / width / font-size (persisted)
     • a collapsible table of contents on mobile
     • previous / next book + "back to collection" navigation
   Pairs with books-data.js (loaded first) for the prev/next sequence.
   The <head> boot snippet already applied saved theme/width/font to
   <html> before paint; here we wire the controls and reflect state.
   ===================================================================== */
(function () {
    'use strict';

    var doc = document.documentElement;

    /* ---- persisted settings --------------------------------------- */
    var SETTINGS = {
        theme: { key: 'reader-theme', def: 'system', values: ['light', 'dark', 'system'] },
        width: { key: 'reader-width', def: 'comfortable', values: ['narrow', 'comfortable', 'wide'] },
        font:  { key: 'reader-font',  def: 'm',           values: ['s', 'm', 'l', 'xl'] }
    };
    function getSetting(name) {
        try {
            var v = localStorage.getItem(SETTINGS[name].key);
            if (v && SETTINGS[name].values.indexOf(v) !== -1) return v;
        } catch (e) {}
        return SETTINGS[name].def;
    }
    function applySetting(name, value) {
        if (name === 'theme') {
            if (value === 'system') doc.removeAttribute('data-theme');
            else doc.setAttribute('data-theme', value);
        } else {
            doc.setAttribute('data-' + name, value);
        }
        try { localStorage.setItem(SETTINGS[name].key, value); } catch (e) {}
        reflect(name, value);
    }
    function reflect(name, value) {
        var group = document.querySelector('.rs-options[data-setting="' + name + '"]');
        if (!group) return;
        group.querySelectorAll('button').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.value === value));
        });
    }

    /* ---- el() tiny helper ----------------------------------------- */
    function el(tag, attrs, html) {
        var n = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        if (html != null) n.innerHTML = html;
        return n;
    }

    /* ---- 1. reading progress bar ---------------------------------- */
    function buildProgress() {
        var bar = el('div', { id: 'reading-progress', 'aria-hidden': 'true' }, '<span></span>');
        document.body.appendChild(bar);
        var fill = bar.firstChild;
        function update() {
            var max = doc.scrollHeight - doc.clientHeight;
            bar.style.display = max > 1000 ? 'block' : 'none'; // long pages only
            fill.style.width = max > 0 ? (doc.scrollTop / max * 100) + '%' : '0%';
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ---- 2. settings popover -------------------------------------- */
    function optionRow(setting, label, opts) {
        var btns = opts.map(function (o) {
            return '<button type="button" data-value="' + o.v + '" aria-pressed="false">' + o.t + '</button>';
        }).join('');
        return '<div class="rs-group"><span class="rs-label">' + label + '</span>' +
            '<div class="rs-options" data-setting="' + setting + '">' + btns + '</div></div>';
    }
    function buildSettings() {
        var panel =
            optionRow('theme', 'තේමාව', [{ v: 'light', t: 'ආලෝක' }, { v: 'dark', t: 'අඳුරු' }, { v: 'system', t: 'පද්ධතිය' }]) +
            optionRow('width', 'පළල', [{ v: 'narrow', t: 'පටු' }, { v: 'comfortable', t: 'මධ්‍යම' }, { v: 'wide', t: 'පුළුල්' }]) +
            optionRow('font', 'අකුරු ප්‍රමාණය', [{ v: 's', t: 'A−' }, { v: 'm', t: 'A' }, { v: 'l', t: 'A+' }, { v: 'xl', t: 'A++' }]);

        var wrap = el('div', { id: 'reader-settings' });
        var toggle = el('button', {
            id: 'reader-settings-toggle', type: 'button',
            'aria-expanded': 'false', 'aria-controls': 'reader-settings-panel',
            title: 'කියවීමේ සැකසුම්', 'aria-label': 'කියවීමේ සැකසුම්'
        }, 'Aa');
        var pop = el('div', { id: 'reader-settings-panel', role: 'group', 'aria-label': 'කියවීමේ සැකසුම්', hidden: 'hidden' }, panel);
        wrap.appendChild(toggle);
        wrap.appendChild(pop);
        document.body.appendChild(wrap);

        function open(o) {
            pop.hidden = !o;
            toggle.setAttribute('aria-expanded', String(o));
        }
        toggle.addEventListener('click', function () { open(pop.hidden); });
        pop.addEventListener('click', function (e) {
            var b = e.target.closest('button[data-value]');
            if (!b) return;
            applySetting(b.parentNode.dataset.setting, b.dataset.value);
        });
        // close on outside click / Escape
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target) && !pop.hidden) open(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !pop.hidden) { open(false); toggle.focus(); }
        });

        // reflect current state in the buttons
        Object.keys(SETTINGS).forEach(function (name) { reflect(name, getSetting(name)); });
    }

    /* ---- 3. collapsible TOC on mobile ----------------------------- */
    function buildTocToggle() {
        var title = document.querySelector('.patuna-title');
        var list = document.querySelector('.TOC-container');
        if (!title || !list) return;
        title.classList.add('toc-toggle');
        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');

        function setCollapsed(c) {
            list.classList.toggle('is-collapsed', c);
            title.setAttribute('aria-expanded', String(!c));
        }
        // Collapsed by default on narrow screens so the reader reaches the
        // text quickly; always open on wider screens (CSS also enforces it).
        setCollapsed(window.matchMedia('(max-width: 600px)').matches);
        function toggle() { setCollapsed(!list.classList.contains('is-collapsed')); }
        title.addEventListener('click', toggle);
        title.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
    }

    /* ---- 4. prev / next book + back to collection ----------------- */
    function stageById(key) {
        if (typeof STAGES === 'undefined') return null;
        for (var i = 0; i < STAGES.length; i++) { if (STAGES[i].key === key) return STAGES[i]; }
        return null;
    }
    function buildBookNav() {
        if (typeof BOOKS === 'undefined') return;
        var seq = BOOKS.filter(function (b) { return b.url; }); // readable books, in order
        var file = decodeURIComponent(location.pathname.split('/').pop());
        var idx = -1;
        for (var i = 0; i < seq.length; i++) {
            if (seq[i].url.split('/').pop() === file) { idx = i; break; }
        }
        if (idx === -1) return;

        var cur = seq[idx], prev = seq[idx - 1], next = seq[idx + 1];
        var stage = stageById(cur.stage);
        var nav = el('nav', { class: 'book-nav', 'aria-label': 'ග්‍රන්ථ අතර සංචලනය' });

        function link(book, cls, dirText) {
            var a = el('a', { class: 'book-nav-link ' + cls, href: '../' + book.url });
            var crosses = stage && book.stage !== cur.stage;
            var sub = crosses ? '<span class="bn-stage">' + (stageById(book.stage) || {}).title + '</span>' : '';
            a.innerHTML = '<span class="bn-dir">' + dirText + '</span>' +
                '<span class="bn-title">' + book.title + '</span>' + sub;
            return a;
        }

        if (prev) nav.appendChild(link(prev, 'prev', '‹ පෙර ග්‍රන්ථය'));
        else nav.appendChild(el('span', { class: 'book-nav-link is-empty' }));

        var coll = el('a', {
            class: 'book-nav-link collection',
            href: '../index.html' + (stage ? '#' + stage.id : '')
        }, '<span class="bn-dir">එකතුව</span><span class="bn-title">සියලු ග්‍රන්ථ</span>');
        nav.appendChild(coll);

        if (next) nav.appendChild(link(next, 'next', 'ඊළඟ ග්‍රන්ථය ›'));
        else nav.appendChild(el('span', { class: 'book-nav-link is-empty' }));

        // place before the trailing <script> tags
        document.body.appendChild(nav);
    }

    /* ---- 5. reading position memory + manual bookmark ------------- */
    /* Position is stored against the nearest heading id (toc-ind-N) plus a
       fraction toward the next heading — robust to font-size / width changes
       because it is re-measured live on restore, never a raw pixel value. */
    var FILE    = decodeURIComponent(location.pathname.split('/').pop());
    var POS_KEY  = 'reader-pos:'  + FILE;   // auto: where you last were
    var MARK_KEY = 'reader-mark:' + FILE;   // manual: a spot you pinned

    function lsGet(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

    function headings() { return Array.prototype.slice.call(document.querySelectorAll('.sinh-toc')); }
    function absTop(elm) { return elm.getBoundingClientRect().top + window.pageYOffset; }
    function docMax() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }

    function describePos() {
        var hs = headings();
        var y = window.pageYOffset;
        var max = docMax();
        var progress = max > 0 ? Math.max(0, Math.min(100, Math.round(y / max * 100))) : 0;
        if (!hs.length) return { id: null, frac: 0, progress: progress, title: '' };
        var ref = y + Math.min(window.innerHeight * 0.25, 160);
        var cur = null, curTop = 0, nextTop = null;
        for (var i = 0; i < hs.length; i++) {
            var t = absTop(hs[i]);
            if (t <= ref) { cur = hs[i]; curTop = t; }
            else { nextTop = t; break; }
        }
        if (!cur) return { id: null, frac: 0, progress: progress, title: '' };
        var bottom = nextTop != null ? nextTop : document.documentElement.scrollHeight;
        var frac = bottom > curTop ? (y - curTop) / (bottom - curTop) : 0;
        return { id: cur.id, frac: Math.max(0, Math.min(1, frac)), progress: progress, title: (cur.textContent || '').trim() };
    }

    function scrollToPos(pos, smooth) {
        if (!pos) return false;
        var y;
        if (pos.id && document.getElementById(pos.id)) {
            var hs = headings(), el0 = document.getElementById(pos.id), curTop = absTop(el0), nextTop = null;
            for (var i = 0; i < hs.length; i++) { if (hs[i] === el0) { if (hs[i + 1]) nextTop = absTop(hs[i + 1]); break; } }
            var bottom = nextTop != null ? nextTop : document.documentElement.scrollHeight;
            y = curTop + (pos.frac || 0) * (bottom - curTop);
        } else if (typeof pos.progress === 'number') {
            y = docMax() * (pos.progress / 100);
        } else { return false; }
        window.scrollTo({ top: Math.max(0, y - 12), behavior: smooth ? 'smooth' : 'auto' });
        return true;
    }

    /* Run cb once layout is settled (fonts can reflow and shift offsets). */
    function whenReady(cb) {
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { setTimeout(cb, 60); }); }
        else { window.addEventListener('load', function () { setTimeout(cb, 60); }); }
    }

    function startAutoSave() {
        if (docMax() < 1000) return;            // short page: nothing worth resuming
        var timer = null;
        function save() { var p = describePos(); if (p) { p.ts = Date.now(); lsSet(POS_KEY, p); } }
        function schedule() { if (timer) return; timer = setTimeout(function () { timer = null; save(); }, 700); }
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
    }

    var toastTimer;
    function toast(msg) {
        var t = document.getElementById('reader-toast');
        if (!t) { t = el('div', { id: 'reader-toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
    }

    function showResumePill(target, isMark) {
        var pct = (target.progress != null) ? ' · ' + target.progress + '%' : '';
        var label = (isMark ? '🔖 ඔබගේ සලකුණට' : '↪ ඔබ නැවැත්වූ තැනට') + pct;
        var pill = el('div', { id: 'resume-bar', role: 'status' });
        pill.appendChild(el('button', { type: 'button', class: 'resume-go' }, label));
        pill.appendChild(el('button', { type: 'button', class: 'resume-x', 'aria-label': 'වසන්න' }, '✕'));
        document.body.appendChild(pill);
        requestAnimationFrame(function () { pill.classList.add('show'); });
        var hideT = setTimeout(hide, 9000);
        function hide() { clearTimeout(hideT); pill.classList.remove('show'); setTimeout(function () { if (pill.parentNode) pill.parentNode.removeChild(pill); }, 300); }
        pill.querySelector('.resume-go').addEventListener('click', function () { scrollToPos(target, true); hide(); });
        pill.querySelector('.resume-x').addEventListener('click', hide);
    }

    function maybeResume() {
        var hash = location.hash;
        // A real in-page anchor (TOC link, #toc): let the browser handle it.
        if (hash && hash !== '#resume' && document.getElementById(hash.slice(1))) return;
        var mark = lsGet(MARK_KEY), pos = lsGet(POS_KEY), target = mark || pos;
        if (!target) return;
        if (hash === '#resume') { whenReady(function () { scrollToPos(target, false); }); return; }
        var p = target.progress || 0;
        if (p < 3 || p > 97) return;            // basically at start / finished
        if (window.pageYOffset > 200) return;   // not a fresh top-of-page load
        showResumePill(target, !!mark);
    }

    function buildBookmark() {
        var wrap = el('div', { id: 'bookmark-ctl' });
        var btn = el('button', {
            id: 'bookmark-toggle', type: 'button', 'aria-haspopup': 'true',
            'aria-expanded': 'false', title: 'කියවීමේ සලකුණු', 'aria-label': 'කියවීමේ සලකුණු'
        }, '🔖');
        var pop = el('div', { id: 'bookmark-panel', role: 'menu', hidden: 'hidden' });
        wrap.appendChild(btn);
        wrap.appendChild(pop);
        document.body.appendChild(wrap);

        function refresh() { btn.classList.toggle('has-mark', !!lsGet(MARK_KEY)); }
        function renderPanel() {
            var mark = lsGet(MARK_KEY);
            var html = '<button type="button" class="bm-act" data-act="set">📍 මෙතැන සලකුණු කරන්න</button>';
            if (mark) {
                var pct = mark.progress != null ? ' · ' + mark.progress + '%' : '';
                html += '<button type="button" class="bm-act" data-act="go">↪ සලකුණට යන්න' + pct + '</button>' +
                        '<button type="button" class="bm-act bm-del" data-act="clear">✕ සලකුණ ඉවත් කරන්න</button>';
            }
            pop.innerHTML = html;
        }
        function open(o) { if (o) renderPanel(); pop.hidden = !o; btn.setAttribute('aria-expanded', String(o)); }

        btn.addEventListener('click', function () { open(pop.hidden); });
        pop.addEventListener('click', function (e) {
            var b = e.target.closest('.bm-act'); if (!b) return;
            var act = b.dataset.act;
            if (act === 'set') { var p = describePos() || {}; p.ts = Date.now(); lsSet(MARK_KEY, p); toast('මෙතැන සලකුණු කළා ✓'); }
            else if (act === 'go') { var m = lsGet(MARK_KEY); if (m) scrollToPos(m, true); }
            else if (act === 'clear') { lsDel(MARK_KEY); toast('සලකුණ ඉවත් කළා'); }
            refresh();
            open(false);
        });
        document.addEventListener('click', function (e) { if (!wrap.contains(e.target) && !pop.hidden) open(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { open(false); btn.focus(); } });
        refresh();
    }

    /* ---- init ----------------------------------------------------- */
    function init() {
        buildProgress();
        buildSettings();
        buildTocToggle();
        buildBookNav();
        startAutoSave();
        buildBookmark();
        maybeResume();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
