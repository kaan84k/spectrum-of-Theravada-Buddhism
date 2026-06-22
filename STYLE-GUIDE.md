# The Basics — Book Style Guide

This document describes the shared on-screen reading styles used by the books in
the **The-Basics** collection (e.g. *බෞද්ධයාගේ අත්පොත* and *පුණ්‍යෝපදේශය*).
Both books embed an identical `<style>` block in their `<head>`, so any new book
in this collection should reuse the same system for a consistent look.

The design goal is a warm, paper-like single-column reading "page" optimised for
long-form Sinhala text, with a built-in dark mode, print styles, and a floating
"back to contents" button.

---

## 1. External resources

| Purpose | Reference |
| --- | --- |
| Print / PDF stylesheet | `https://pitaka.lk/books/common/print-pdf.css` (with a relative fallback `../../../../books/common/print-pdf.css`) |
| Reading fonts | Google Fonts — `Noto Serif Sinhala` (400–700) and `Noto Sans Sinhala` (400–700) |

Fonts are loaded with `preconnect` hints and `display=swap`, with graceful
fallback to system Sinhala fonts (`Iskoola Pota`, `Nirmala UI`) when offline.

---

## 2. Design tokens (CSS custom properties)

Defined on `:root`, with a dark-mode override under
`@media (prefers-color-scheme: dark)`.

### Light theme (default)

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#f5f1e8` | Page background (behind the reading column) |
| `--page` | `#fbf8f1` | Reading column ("paper") background |
| `--ink` | `#2b2620` | Primary body text |
| `--ink-soft` | `#5b5346` | Secondary / muted text |
| `--accent` | `#8a5a2b` | Headings, titles, links, bold text |
| `--accent-soft` | `#b08442` | Rules, borders, list markers, hover |
| `--rule` | `#e3dac6` | Hairline borders / dividers |
| `--gatha-bg` | `#f3ead6` | Verse (gāthā) block background, hover |
| `--shadow` | `rgba(60, 45, 20, 0.12)` | Soft shadows |

### Dark theme (`prefers-color-scheme: dark`)

| Token | Value |
| --- | --- |
| `--bg` | `#1a1815` |
| `--page` | `#232019` |
| `--ink` | `#e8e1d2` |
| `--ink-soft` | `#b3a98f` |
| `--accent` | `#d6a35f` |
| `--accent-soft` | `#c8995a` |
| `--rule` | `#3a342a` |
| `--gatha-bg` | `#2c2719` |
| `--shadow` | `rgba(0, 0, 0, 0.4)` |

### Font stacks

| Token | Stack |
| --- | --- |
| `--serif` | `"Noto Serif Sinhala", "Iskoola Pota", "Nirmala UI", "Noto Sans Sinhala", serif` |
| `--sans` | `"Noto Sans Sinhala", "Nirmala UI", "Iskoola Pota", sans-serif` |

**Convention:** body text uses `--serif`; titles, headings, the TOC title and the
floating button use `--sans`.

---

## 3. Page layout

- **`html`** — `scroll-behavior: smooth`, `--bg` background, `-webkit-text-size-adjust: 100%`.
- **`body`** — the whole book is one centered reading column:
  - `max-width: 46rem`, `margin: 0 auto`
  - fluid padding: `clamp(1.5rem, 4vw, 3.5rem)` vertical, `clamp(1.1rem, 5vw, 3.5rem)` horizontal
  - `--page` background with a soft `box-shadow: 0 0 28px var(--shadow)`
  - `--serif`, `font-size: 1.18rem`, `line-height: 1.95`
  - legibility: `font-feature-settings: "kern" 1, "liga" 1`, `text-rendering: optimizeLegibility`, `-webkit-font-smoothing: antialiased`

---

## 4. Components

### Title block
- `.title` — `--serif`, `clamp(1.9rem, 6vw, 2.9rem)`, weight 700, centered, `--accent`.
- `.author` — centered, `1.05rem`, weight 500, `--ink-soft`.
- `.title + .author::after` — decorative `4rem × 3px` rounded `--accent-soft` rule below the author.

### Table of contents
- `#toc-header` — hidden (`display: none`).
- `.patuna-title` — `--sans`, `1.5rem`, weight 600, centered, `--accent`. The on-page heading "පටුන".
- `.TOC-container` — unstyled list (`list-style: none`), top border `--rule`; each `li` has a bottom border `--rule`.
- Indent levels:
  - `li.H1` — weight 600 (top level)
  - `li.H2` — `padding-left: 1.4rem`, `font-size: 0.96em`, link colour `--ink-soft`
  - `li.H3` — `padding-left: 2.8rem`, `font-size: 0.9em`, link colour `--ink-soft` *(used in books with 3 TOC depths, e.g. බෞද්ධයාගේ අත්පොත)*
- `a.TOC` — block links, `--ink`, no underline, animated `background`/`color`/`padding-left`.
- `a.TOC:hover` — `--gatha-bg` background, `--accent` text, indents right on hover (level-specific hover paddings keep alignment).

### Body headings (`h1`–`h4`)
All headings: `--sans`, `--accent`, `line-height: 1.4`, `scroll-margin-top: 1.5rem`.
- `h1` (and `h1.sinh-toc`) — `clamp(1.5rem, 4.5vw, 2.05rem)`, weight 700, centered, bottom border `2px --rule`.
- `h2` (and `h2.sinh-toc`) — `clamp(1.25rem, 3.5vw, 1.5rem)`, weight 600, left border `4px --accent-soft` with `padding-left: 0.7rem`.
- `h3` (and `h3.sinh-toc`) — `clamp(1.1rem, 3vw, 1.28rem)`, weight 600, colour `--ink-soft`.
- `h4` — inherits the shared heading rule (declared in books that use it).

### Body text
- `p` — `margin: 0 0 1.25rem`, justified (`text-align: justify; text-justify: inter-word`), `overflow-wrap: break-word`.
- `b, strong` — `--accent`, weight 600 (switches to `--accent-soft` in dark mode).

### Verse / gāthā blocks (`.gatha`)
- `--gatha-bg` background, left border `4px --accent-soft`, `border-radius: 0 6px 6px 0`, `margin: 1.6rem 0`, `padding: 1rem 1.4rem`, centered.
- `.gatha p` — tight margins, centered, weight 500, `line-height: 1.8`.
- `.gatha b, .gatha strong` — overridden to `--ink` (not accent) inside verses.

### Lists
- `ol, ul` — `padding-left: 1.6rem`; items `line-height: 1.85` with bottom margin (`0.7rem` for general lists, `0.9rem` for numbered paritta lists).
- `li::marker` — `--accent-soft`.

### Floating "back to contents" button (`#back-to-toc`)
- Fixed bottom-right, fluid offset `clamp(0.8rem, 3vw, 2rem)`, `z-index: 50`.
- `3rem` circular (`border-radius: 50%`), `--accent` background, white text, `--sans` `0.78rem` weight 600, soft shadow.
- Hidden by default (`opacity: 0; visibility: hidden; transform: translateY(8px)`); revealed via the `.show` class with a fade/slide transition.
- `:hover` → `--accent-soft`.
- Markup: `<a id="back-to-toc" href="#toc" title="පටුනට">පටුන</a>` (JS toggles `.show` on scroll).

---

## 5. Responsive & print

### Mobile (`max-width: 480px`)
- `body` — `font-size: 1.08rem`, `line-height: 1.85`.
- `p` — left-aligned instead of justified (avoids large word gaps on narrow screens).

### Print (`@media print`)
- `#back-to-toc` — hidden.
- `body` — white background, black text, `12pt`, no shadow, `max-width: none`.

---

## 6. Document structure (markup contract)

```html
<a id="back-to-toc" href="#toc" title="පටුනට">පටුන</a>
<div>
  <div class="title">…book title…</div>
  <div class="author">…author…</div>
</div>
<div id="toc-header"><a class='toc-link' href='#toc'>පටුන</a></div>
<div class="patuna-title" id="toc">පටුන</div>
<ul class="TOC-container">
  <li class="H1"><a class="TOC" href="#toc-ind-0">…</a></li>
  <li class="H2"><a class="TOC" href="#toc-ind-…">…</a></li>
  …
</ul>
<!-- body sections with matching id="toc-ind-N" anchors -->
```

---

## 7. Differences between the two books

The style blocks are otherwise identical; the only variations are:

| Feature | බෞද්ධයාගේ අත්පොත | පුණ්‍යෝපදේශය |
| --- | --- | --- |
| TOC depth | H1, H2, **H3** | H1, H2 |
| Body headings | h1–**h4** | h1–h3 |
| Lists | `ol` **and `ul`** | `ol` only |

When starting a new book, copy the fuller variant (with H3/h4 and both list
types) so the styles are ready regardless of content.
