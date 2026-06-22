# Spectrum of Theravāda Buddhism

> A calm, web-readable digital library of the Dhamma works of the Most Venerable
> **Rērukānē Candavimala Mahā Nāyaka Thera** (අතිපූජ්‍ය රේරුකානේ චන්දවිමල මහා නාහිමි),
> arranged as a five-phase reading path — from lay basics to deep Abhidhamma.

A fully **static** site (plain HTML, CSS, and vanilla JavaScript — no build step,
no frameworks). It runs equally well from a local `file://` open or hosted on
GitHub Pages, and is designed for comfortable long-form reading of Sinhala text.

## ✨ Features

- **Five-phase reading path** — books grouped from foundational lay practice up to Abhidhamma.
- **Modern home page** — sticky top bar, hero, and scannable stage panels with book cards.
- **Search & filters** — client-side search plus Stage / Difficulty / Topic / Audience facets (works fully offline).
- **Reading controls** — light / dark / system theme, reading-width and font-size toggles, all remembered via `localStorage`.
- **Long-read comfort** — top reading-progress bar, collapsible mobile table of contents, and previous / next / back-to-collection navigation.
- **Mobile-first polish** — ≥44px tap targets, safe-area-aware floating controls, and Sinhala-aware text wrapping.
- **Progressive enhancement** — every page is readable without JavaScript; a `<noscript>` fallback lists all books.

## 📖 Reading path

| Phase | Folder | Theme |
| --- | --- | --- |
| 1 | `1-The-Basics/` | Basics for lay devotees |
| 2 | `2-Foundational-Philosophy/` | Foundational philosophy & ethics |
| 3 | `3-Monastic-Discipline/` | Vinaya & sīla |
| 4 | `4-Meditation-Bhavana/` | Meditation & mental culture |
| 5 | `5-Abhidhamma/` | Abhidhamma & ultimate reality |

There are **17 books** currently readable across the five phases, with more planned.

## 🚀 Getting started

This is a static site — no install or build is required.

**Just open it:** double-click `index.html`, or open it in any browser.

**Or serve it locally** (recommended, so paths behave exactly as on GitHub Pages):

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

### Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Your site goes live at `https://<user>.github.io/spectrum-of-Theravada-Buddhism/`.

## 🗂️ Project structure

```
.
├── index.html                 # Home page (library dashboard)
├── 1-The-Basics/              # Phase 1 book pages
├── 2-Foundational-Philosophy/ # Phase 2 book pages
├── 3-Monastic-Discipline/     # Phase 3 book pages
├── 4-Meditation-Bhavana/      # Phase 4 book pages
├── 5-Abhidhamma/              # Phase 5 book pages
└── assets/
    ├── css/
    │   ├── base.css           # Design tokens, fonts, dark mode, body baseline
    │   ├── home.css           # Home page layout (topbar, hero, cards, filters)
    │   └── reader.css         # Book page typography, TOC, reading controls, print
    └── js/
        ├── books-data.js      # Single source of truth: books, stages, facets
        ├── library.js         # Home page: render, search, faceted filtering
        └── reader.js          # Book pages: theme/width/font, progress, TOC, nav
```

See [`STYLE-GUIDE.md`](STYLE-GUIDE.md) for the on-screen styling conventions and
[`MODERNIZATION-IDEAS.md`](MODERNIZATION-IDEAS.md) for the roadmap.

## ⚠️ Encoding: files must stay UTF-8

All content is in Sinhala script, so **every `.html` and `.md` file must be saved
as UTF-8 (without a BOM)**. Do not let an editor re-save them as ANSI/Windows-1252
or UTF-16 — that corrupts the Sinhala text.

- Keep `<meta charset="UTF-8">` near the top of every HTML `<head>`.
- Configure your editor to default to UTF-8 (e.g. VS Code: `"files.encoding": "utf8"`).
- If Sinhala looks like garbled characters (mojibake) in a **terminal**, that is
  usually just the console font/codepage — the file itself is fine. Confirm in a browser.

<details>
<summary>Verify encoding (PowerShell)</summary>

```powershell
Get-ChildItem -Recurse -Include *.html,*.md | ForEach-Object {
    try {
        [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($_.FullName)) | Out-Null
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
        "{0}  BOM={1}  {2}" -f "OK", $bom, $_.Name
    } catch { "BAD  $($_.Name)" }
}
```
</details>

## 🛠️ Tech

Plain HTML5 · CSS custom properties (design tokens) · vanilla JavaScript ·
Noto Serif/Sans Sinhala fonts. No dependencies, no build tooling.

## 📚 Source

The Sinhala texts in this collection are sourced from the Venerable author's
works as published on **[tipitaka.lk](https://tipitaka.lk/library/462)** —
*Rērukānē Candavimala Mahā Nāyaka Thera's library* on the Tipiṭaka.lk digital
library. This project re-presents that material as a self-contained, offline-
capable reading site; all gratitude and credit for the original digitisation
goes to tipitaka.lk and its contributors.

- Reference / source library: <https://tipitaka.lk/library/462>

## 🤝 Contributing

Contributions are welcome — corrections to the Sinhala text, new book pages,
accessibility and mobile fixes, or roadmap items from
[`MODERNIZATION-IDEAS.md`](MODERNIZATION-IDEAS.md).

**Repository:** <https://github.com/kaan84k/spectrum-of-Theravada-Buddhism>

How to contribute:

1. **Fork** the repository and clone your fork.
2. Create a branch: `git checkout -b fix/short-description`.
3. Make your change. Please keep in mind:
   - Every `.html` / `.md` file **must stay UTF-8 (no BOM)** — see the encoding note above.
   - Follow [`STYLE-GUIDE.md`](STYLE-GUIDE.md) for on-screen styling.
   - Keep the site **static** — no build step, no frameworks; vanilla HTML/CSS/JS only.
   - When adding a book, also add its metadata to `assets/js/books-data.js` so it
     appears in search, filters, and previous/next navigation.
4. Verify the page opens correctly in a browser (and that Sinhala renders properly).
5. **Commit, push** to your fork, and open a **Pull Request** describing the change.

Found a problem but don't want to send a PR? Please
[open an issue](https://github.com/kaan84k/spectrum-of-Theravada-Buddhism/issues).

## 🙏 Credits & license

The Dhamma texts are the work of the Most Venerable **Rērukānē Candavimala Mahā
Nāyaka Thera**, presented here for free distribution as **Dhamma dāna** — for the
benefit and study of all. Please preserve attribution (to the author and to
[tipitaka.lk](https://tipitaka.lk/library/462)) when sharing.

The site code (HTML/CSS/JS scaffolding under `assets/` and the page templates) is
free to reuse and adapt.

> සියලු දෙනාටම නිවන් සුව සැලසේවා! 🙏
