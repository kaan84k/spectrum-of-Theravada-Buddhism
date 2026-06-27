# On-Demand Section Summaries with Google Gemini — Implementation Plan

Goal: let a reader summarize **only the part they need** — a single TOC section
(or a highlighted passage) — with Google Gemini, instead of summarizing whole
books up front. You spend tokens **only on the exact parts someone asks for**.

---

## 1. The core decision: on-demand, per section — not the whole book

Earlier idea: pre-summarize every book at build time. Problem: you pay tokens for
content **nobody reads**, and a whole-book summary is coarse.

New approach: **summarize a part, when asked.** Each book page already has clean
section structure via `.sinh-toc` headings. We put a small **✨ සාරාංශය** button on
each section. The reader clicks it → only that section's text goes to Gemini → a
short summary appears inline under that heading.

```
  reader clicks ✨ on ONE section
            │  (only that section's text)
            ▼
   ┌─────────────────┐      summary       ┌────────────────────────┐
   │  Gemini Flash   │ ─────────────────► │ inline under the heading│
   └─────────────────┘                    └────────────────────────┘
            ▲  cached in localStorage (per section hash)
            └── same section asked again → 0 tokens, instant
```

Tokens are spent **per requested section, once** (cached after). A reader who only
opens two sections only ever pays for two sections — true "only the parts we need."

---

## 2. Two trigger styles (both summarize a *part*, not the book)

Default = **A**. **B** is an optional add-on.

- **A. Per-section button** *(recommended, build this first)*
  A small **✨ සාරාංශය** button injected next to each `.sinh-toc` heading.
  Bounded, predictable chunk = the text from that heading up to the next heading.
- **B. Highlight-to-summarize** *(optional, later)*
  Reader selects any passage → a floating **✨ Summarize selection** button →
  summarizes exactly the selected text. Fully arbitrary, can't be cached by section.

Both call the same `summarize(text)` routine; only the **source of `text`** differs.

---

## 3. Where the Gemini call happens — Bring-Your-Own-Key (default)

Runtime, in the browser, using a key the **reader** supplies once. Rationale for a
static, no-backend, `file://`-friendly site:

- **No backend, no proxy** — keeps the project static.
- **Your API key is never shipped** — there is no key in the repo at all.
- **You pay nothing** — each reader uses their own free-tier Gemini key.
- **Truly minimum tokens** — only requested sections are ever sent.

Flow:
1. First time a reader clicks ✨, show a tiny one-field dialog: *"Paste your free
   Google Gemini API key"* + a link to where to get one.
2. Store it in `localStorage` (`gemini-key`). Never sent anywhere except Google.
3. All later clicks use the stored key silently. A small "key" control lets them
   change/remove it.

> **Alternative (if you want readers to need no key):** a tiny serverless proxy
> (Cloud Function / Cloudflare Worker) holds *your* key and the browser calls it.
> Hides the key but adds a backend, you pay all usage, and it breaks `file://`.
> Documented here as a fallback, not the default. The frontend code is identical
> except the `fetch` URL points at your proxy instead of Google.

---

## 4. Token-minimization strategy (still the whole point)

| # | Technique | Why it saves tokens |
|---|-----------|---------------------|
| 1 | **On-demand, per section** | The biggest saving: untouched sections cost **0**. You never pay for a whole book. |
| 2 | **localStorage cache by section hash** | A section summarized once is remembered; re-opening it = 0 tokens, instant. Key: `sum:<file>:<headingId>:<sha1(text)>`. |
| 3 | **Strip HTML before sending** | Send plain section text only — no tags/classes/markup. |
| 4 | **Per-section input cap** | If one section is huge, cap to `MAX_INPUT_CHARS` (e.g. 8000) before sending. |
| 5 | **`maxOutputTokens`** | Hard ceiling on summary length (e.g. 180). |
| 6 | **Gemini Flash / Flash-Lite** | Cheapest summarization-capable model. |
| 7 | **Tight fixed prompt, no examples** | Short instruction; ask for plain Sinhala, no "Here is a summary…" preamble. |
| 8 | **Debounce / single-flight** | Ignore repeat clicks while a request is in flight; disable the button with a spinner. |

A section is typically a few hundred to ~2k words, so each request is small and the
cache means it's paid for at most once per reader.

---

## 5. Files to add / change

```
assets/
  js/
    summarize.js     NEW  trigger UI + Gemini call + cache (loaded after reader.js)
  css/
    reader.css       EDIT styles for the ✨ buttons, inline summary, key dialog, spinner
book pages           NO CHANGE if summarize.js is added via the shared script include;
                     otherwise add one <script src="../assets/js/summarize.js"> per page
```

No build step, no Node tooling, no committed JSON, no API key in the repo.

---

## 6. `assets/js/summarize.js` — responsibilities

A self-contained IIFE, same style as `reader.js`:

1. **Find sections**: `document.querySelectorAll('.sinh-toc')`. For each heading,
   the "section text" = text of the nodes between it and the next `.sinh-toc`.
2. **Inject a ✨ button** next to each heading (small, unobtrusive, `aria-label`
   in Sinhala). Optionally only show on hover/focus to stay calm.
3. **On click**:
   - Gather + clean the section text (strip tags, collapse whitespace, cap length).
   - Compute `sha1` of the text → build cache key.
   - **Cache hit** → render instantly, 0 tokens.
   - **Miss** → ensure a key exists (prompt if not) → call Gemini → cache → render.
4. **`summarize(text)`**: `POST` to the Gemini REST endpoint
   `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
   with `maxOutputTokens`, `temperature: 0.3`, and the fixed Sinhala prompt.
   (REST avoids bundling the SDK — no build step.)
5. **Render**: insert a `<div class="section-summary">` under the heading with the
   summary, an "AI" chip, and a tiny "✕" to dismiss. Re-clicking re-opens from cache.
6. **Errors**: bad key / quota / network → inline, friendly Sinhala message; never
   break reading. Everything here is progressive enhancement.
7. **Key management**: `getKey()/setKey()/clearKey()` on `localStorage['gemini-key']`;
   a minimal modal for entering it (no external CSS framework).

Config constants at the top (easy to tune):

```js
var MODEL = 'gemini-2.5-flash';
var MAX_INPUT_CHARS = 8000;
var MAX_OUTPUT_TOKENS = 180;
var PROMPT = 'ඔබ බෞද්ධ ග්‍රන්ථ කොටස් සාරාංශ කරන සහායකයෙකි. පහත කොටස ' +
             'වාක්‍ය 2–3කින්, සරල සිංහලෙන්, පෙරවදනක් නැතිව සාරාංශ කරන්න:';
```

---

## 7. UI sketch

```
┌────────────────────────────────────────────┐
│  සිල් සමාදන්වීම            [ ✨ සාරාංශය ]      │  ← heading + button
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ සාරාංශය  ⟨AI⟩                        ✕  │ │  ← appears on click
│  │ මෙම කොටසින් සිල් සමාදන් වන ආකාරය...      │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ...full original section text continues...  │
└────────────────────────────────────────────┘
```

---

## 8. Step-by-step build order

1. Write `assets/js/summarize.js` with section detection + ✨ buttons + **cache
   layer only** (mock the summary string) — verify the UI and section boundaries
   on a couple of books with **zero API calls**.
2. Add the BYOK key dialog + `localStorage` helpers.
3. Wire the real Gemini REST call; test on **one** section, tune prompt / caps.
4. Add the CSS (buttons, summary card, spinner, key modal; light + dark themes).
5. Include `summarize.js` on book pages (after `books-data.js` + `reader.js`).
6. Verify: cache hit = instant + no network (check devtools), errors are graceful,
   reading is unaffected when no key is set.
7. (Optional) Add **highlight-to-summarize** (trigger B) reusing `summarize(text)`.
8. Document the BYOK step + where to get a free key in `README.md`.

---

## 9. Before you run — verify, don't assume

- **Model id & pricing**: confirm the current cheapest summarization model
  (`gemini-2.5-flash` / `flash-lite`) and its REST endpoint shape before coding §6.
- **Free tier & rate limits**: BYOK readers rely on Google's free tier — note its
  request limits in the key dialog so users aren't surprised by 429s.
- **CORS**: confirm the `generativelanguage.googleapis.com` endpoint allows direct
  browser calls with an API key (it does today, but verify). If not, the serverless
  proxy in §3 becomes required.
- **Key safety messaging**: tell readers their key is stored only in their browser
  and sent only to Google — important for trust.

---

### Summary of the change

Whole-book → **part-on-demand**: a ✨ button per section summarizes just that
section when clicked, results cached per reader. Bring-your-own-key keeps the site
static, your key out of the repo, and your cost at $0 — and tokens are spent **only
on the exact parts a reader chooses to summarize.**
