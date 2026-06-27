/* =====================================================================
   summarize.js — On-demand section summaries via Google Gemini.
   Progressive enhancement; nothing here is required to read the book.

   What it does:
     • Adds a small "✨ සාරාංශය" button to every section heading (.sinh-toc).
     • On click it sends ONLY that section's text to Gemini and shows a short
       Sinhala summary inline under the heading.
     • Results are cached in localStorage (keyed by a hash of the section text)
       so re-opening a section costs nothing and is instant.

   Tokens are spent only on the exact sections a reader chooses to summarize.

   Key handling — Bring Your Own Key (BYOK):
     The reader pastes their own free Gemini API key once; it is stored in
     localStorage and sent only to Google. No key lives in this repo, there is
     no backend, and the author pays nothing.
   ===================================================================== */
(function () {
    'use strict';

    /* ---- config (tune for cost / length) -------------------------- */
    var MODEL             = 'gemini-2.5-flash';
    var MAX_INPUT_CHARS   = 8000;   // hard cap on text sent per section
    var MAX_OUTPUT_TOKENS = 1024;   // room for a 2–3 sentence Sinhala summary
                                    // (Sinhala tokenizes heavily; see thinking note below)
    var KEY_LS            = 'gemini-key';
    var ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/' +
                   MODEL + ':generateContent';
    var PROMPT =
        'ඔබ බෞද්ධ ග්‍රන්ථ කොටස් සාරාංශ කරන සහායකයෙකි. ' +
        'පහත දැක්වෙන කොටස වාක්‍ය 2–3කින්, සරල හා පැහැදිලි සිංහලෙන්, ' +
        'පෙරවදනක් හෝ "මෙම කොටසේ" වැනි වචන නැතිව, සෘජුවම සාරාංශ කරන්න:';

    var FILE = decodeURIComponent(location.pathname.split('/').pop());

    /* ---- tiny helpers (mirrors reader.js) ------------------------- */
    function el(tag, attrs, html) {
        var n = document.createElement(tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        if (html != null) n.innerHTML = html;
        return n;
    }
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

    /* Small non-crypto string hash (djb2). crypto.subtle is unavailable on
       file://, and this is only a cache key, so a fast 32-bit hash is fine. */
    function hash(str) {
        var h = 5381, i = str.length;
        while (i) { h = (h * 33) ^ str.charCodeAt(--i); }
        return (h >>> 0).toString(36);
    }

    /* ---- section text extraction ---------------------------------- */
    /* The text of a section = every element between its heading and the next
       .sinh-toc heading. We read textContent (no markup) and collapse space. */
    function sectionText(heading) {
        var parts = [], node = heading.nextElementSibling;
        while (node && !node.classList.contains('sinh-toc')) {
            var t = (node.textContent || '').replace(/\s+/g, ' ').trim();
            if (t) parts.push(t);
            node = node.nextElementSibling;
        }
        var text = parts.join('\n');
        return text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
    }

    /* ---- BYOK key dialog ------------------------------------------ */
    function getKey() { return lsGet(KEY_LS); }
    function askKey() {
        return new Promise(function (resolve) {
            var existing = document.getElementById('gemini-key-modal');
            if (existing) existing.parentNode.removeChild(existing);

            var overlay = el('div', { id: 'gemini-key-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Gemini යතුර' });
            overlay.innerHTML =
                '<div class="gk-box">' +
                '  <h2 class="gk-title">Gemini API යතුර</h2>' +
                '  <p class="gk-note">සාරාංශ ලබා ගැනීමට ඔබගේ නොමිලේ Google Gemini API ' +
                'යතුර අවශ්‍ය වේ. එය ඔබගේ බ්‍රවුසරයේ පමණක් ගබඩා වන අතර Google වෙත පමණක් යැවේ.</p>' +
                '  <input type="password" class="gk-input" placeholder="API යතුර මෙහි අලවන්න" autocomplete="off" spellcheck="false">' +
                '  <p class="gk-get"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">නොමිලේ යතුරක් ලබා ගන්න →</a></p>' +
                '  <div class="gk-actions">' +
                '    <button type="button" class="gk-cancel">අවලංගු කරන්න</button>' +
                '    <button type="button" class="gk-save">සුරකින්න</button>' +
                '  </div>' +
                '</div>';
            document.body.appendChild(overlay);
            var input = overlay.querySelector('.gk-input');
            input.focus();

            function close(value) {
                overlay.parentNode && overlay.parentNode.removeChild(overlay);
                document.removeEventListener('keydown', onKey);
                resolve(value);
            }
            function save() {
                var v = input.value.trim();
                if (!v) { input.focus(); return; }
                lsSet(KEY_LS, v);
                close(v);
            }
            function onKey(e) {
                if (e.key === 'Escape') close(null);
                else if (e.key === 'Enter' && document.activeElement === input) save();
            }
            overlay.querySelector('.gk-save').addEventListener('click', save);
            overlay.querySelector('.gk-cancel').addEventListener('click', function () { close(null); });
            overlay.addEventListener('click', function (e) { if (e.target === overlay) close(null); });
            document.addEventListener('keydown', onKey);
        });
    }

    /* ---- Gemini REST call ----------------------------------------- */
    function callGemini(text, key) {
        return fetch(ENDPOINT + '?key=' + encodeURIComponent(key), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: PROMPT + '\n\n' + text }] }],
                generationConfig: {
                    maxOutputTokens: MAX_OUTPUT_TOKENS,
                    temperature: 0.3,
                    // gemini-2.5-flash "thinks" by default, and thinking tokens
                    // count against maxOutputTokens — leaving little for the actual
                    // answer (the "2–3 meaningless words" bug). Summarizing needs no
                    // reasoning, so disable it: fixes truncation AND saves tokens.
                    thinkingConfig: { thinkingBudget: 0 }
                }
            })
        }).then(function (r) {
            return r.json().then(function (data) {
                if (!r.ok) {
                    var msg = (data && data.error && data.error.message) || ('HTTP ' + r.status);
                    if (r.status === 400 || r.status === 403) { lsDel(KEY_LS); } // likely bad key
                    throw new Error(msg);
                }
                var c = data.candidates && data.candidates[0];
                var out = c && c.content && c.content.parts && c.content.parts[0] && c.content.parts[0].text;
                if (!out) {
                    var reason = (c && c.finishReason) || 'EMPTY';
                    if (reason === 'MAX_TOKENS') throw new Error('පිළිතුර දිගු වැඩියි (MAX_TOKENS)');
                    if (reason === 'SAFETY' || reason === 'BLOCKLIST') throw new Error('අන්තර්ගතය අවහිර විය');
                    throw new Error('හිස් පිළිතුරක් (' + reason + ')');
                }
                return out.trim();
            });
        });
    }

    /* ---- per-section UI ------------------------------------------- */
    function attach(heading) {
        // Avoid double-injecting if init runs twice.
        if (heading.querySelector('.sum-btn')) return;

        var btn = el('button', {
            type: 'button', class: 'sum-btn',
            title: 'මෙම කොටස සාරාංශ කරන්න', 'aria-label': 'මෙම කොටස සාරාංශ කරන්න'
        }, '<span class="sum-ico" aria-hidden="true">✨</span><span class="sum-lbl">සාරාංශය</span>');
        heading.appendChild(btn);

        var card = null;          // the summary card element, once created
        var busy = false;

        function ensureCard() {
            if (card) return card;
            card = el('div', { class: 'section-summary', role: 'status', 'aria-live': 'polite' });
            heading.parentNode.insertBefore(card, heading.nextSibling);
            return card;
        }
        function render(textOrHtml, isError) {
            var c = ensureCard();
            c.classList.toggle('is-error', !!isError);
            c.innerHTML =
                '<div class="ss-head"><span class="ss-title">සාරාංශය</span>' +
                '<span class="ss-ai">AI</span>' +
                '<button type="button" class="ss-x" aria-label="වසන්න">✕</button></div>' +
                '<div class="ss-body"></div>';
            c.querySelector('.ss-body').textContent = textOrHtml;
            c.querySelector('.ss-x').addEventListener('click', function () {
                c.parentNode && c.parentNode.removeChild(c);
                card = null;
            });
        }
        function spinner() {
            var c = ensureCard();
            c.classList.remove('is-error');
            c.innerHTML = '<div class="ss-loading"><span class="ss-spin" aria-hidden="true"></span>' +
                          'සාරාංශ කරමින්…</div>';
        }

        btn.addEventListener('click', function () {
            if (busy) return;
            // If the card is already showing, a second click toggles it closed.
            if (card && card.parentNode) { card.parentNode.removeChild(card); card = null; return; }

            var text = sectionText(heading);
            if (!text || text.length < 40) { render('මෙම කොටස කෙටි වැඩියි.', true); return; }

            // 'v2' bump: ignores any short/garbage summaries cached before the
            // thinking-budget fix, so readers get a fresh, proper summary.
            var cacheKey = 'sum:v2:' + FILE + ':' + heading.id + ':' + hash(text);
            var cached = lsGet(cacheKey);
            if (cached) { render(cached, false); return; }

            busy = true;
            spinner();
            Promise.resolve(getKey() || askKey()).then(function (key) {
                if (!key) { busy = false; if (card) { card.parentNode.removeChild(card); card = null; } return; }
                return callGemini(text, key).then(function (summary) {
                    lsSet(cacheKey, summary);
                    render(summary, false);
                }).catch(function (err) {
                    render('සාරාංශය ලබා ගත නොහැකි විය: ' + err.message, true);
                });
            }).then(function () { busy = false; }, function () { busy = false; });
        });
    }

    /* ---- init ----------------------------------------------------- */
    function init() {
        var headings = document.querySelectorAll('.sinh-toc');
        if (!headings.length) return;
        Array.prototype.forEach.call(headings, attach);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
