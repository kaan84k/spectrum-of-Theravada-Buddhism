# Modernization Ideas

This project is already a useful static reading site: it has a main index, book pages grouped into learning stages, and a warm reading style for long-form Sinhala text. The next improvements should make it feel more modern while keeping the calm, scholarly tone of a Theravada Buddhism library.

## Priority Checklist

- [ ] Fix text encoding across all HTML and markdown files so Sinhala displays correctly everywhere.
- [ ] Move repeated CSS into shared stylesheet files instead of embedding large `<style>` blocks in every page.
- [ ] Redesign the home page as a modern library dashboard with clearer navigation.
- [ ] Add search, filtering, and topic tags for the books.
- [ ] Improve mobile navigation and reading comfort.
- [ ] Add consistent metadata, previews, and SEO for every book page.
- [ ] Add accessibility and performance checks before publishing.

## 1. Fix Sinhala Text Encoding

Several files appear to contain Sinhala text that may be interpreted incorrectly by some tools or environments. Before doing visual work, confirm every page is saved as UTF-8 and that Sinhala renders correctly in the browser, editor, terminal, and deployed site.

Recommended actions:

- Resave all `.html` and `.md` files as UTF-8.
- Keep `<meta charset="UTF-8">` at the top of every HTML document head.
- Check whether the current mojibake text is only a terminal display issue or actual file corruption.
- Add a short `README.md` note saying files must remain UTF-8.

## 2. Create A Shared Design System

The book pages already use good design tokens such as `--bg`, `--page`, `--ink`, `--accent`, and font stacks. Move these into shared CSS files so every page can be improved from one place.

Suggested files:

- `assets/css/base.css` for resets, fonts, variables, body styles, and dark mode.
- `assets/css/reader.css` for book page typography, table of contents, headings, verse blocks, and print styles.
- `assets/css/home.css` for the index page layout.

Benefits:

- Easier maintenance.
- More consistent pages.
- Smaller HTML files.
- Faster future redesign work.

## 3. Modernize The Home Page

The current `index.html` uses simple vertical sections. A modern version can feel more like a calm digital library.

Ideas:

- Add a sticky top bar with the site title and quick links.
- Add a compact hero area with the collection name, short description, and reading progress cues.
- Convert the five learning stages into scannable section panels.
- Show each book as a card with title, level, topic, short description, and a clear "Read" link.
- Use responsive grid layout on desktop and single-column layout on mobile.
- Add subtle dividers, better spacing, and stronger typographic hierarchy.

Keep the visual tone restrained: warm paper colors, readable Sinhala fonts, quiet borders, and minimal decoration.

## 4. Add Search And Filters

For a content-heavy project, search will make the site feel much more modern.

Useful filters:

- Stage: Basics, Philosophy, Vinaya, Meditation, Abhidhamma.
- Difficulty: Beginner, Intermediate, Advanced.
- Topic: Sila, Dana, Bhavana, Abhidhamma, Vinaya, Sutta, Poya, Parami.
- Audience: Lay readers, meditators, monastics, advanced students.

Simple implementation:

- Store book metadata in a small JavaScript array or `books.json`.
- Render the home page book list from that data.
- Add a search input and filter buttons.
- Use client-side filtering so the site stays static and easy to host.

## 5. Improve The Reading Experience

The existing book page style is already strong. These upgrades would make it feel more polished.

Ideas:

- Add a reading-width toggle: comfortable, narrow, wide.
- Add a font-size control.
- Add light/dark/system theme buttons instead of relying only on system preference.
- Add a progress indicator at the top of long pages.
- Add a collapsible table of contents on mobile.
- Add previous/next book navigation at the bottom of each book.
- Add "Back to collection" and "Next section" links.

## 6. Improve Mobile UX

Many readers will use phones, so mobile polish matters.

Recommended actions:

- Test all pages at 360px, 390px, 430px, 768px, and desktop widths.
- Avoid justified paragraphs on narrow screens.
- Keep tap targets at least 44px high.
- Make the home page filters wrap cleanly.
- Make long titles break naturally without overlapping.
- Keep the floating back-to-contents button clear of bottom browser UI.

## 7. Add Better Navigation Between Books

Readers should always know where they are in the collection.

Ideas:

- Add breadcrumbs at the top of every book page.
- Add stage labels to each book.
- Add previous and next book links.
- Add a complete collection table of contents.
- Add "recommended reading path" callouts on the home page.

Example:

```text
Collection > The Basics > Baudhdhayage Athpotha
Previous: Punyopadeshaya
Next: Pohoya Dinaya
```

## 8. Add Metadata For Every Book

Each HTML page should have consistent metadata for sharing, search engines, and browser previews.

Recommended metadata:

- `<title>`
- `<meta name="description">`
- Open Graph title, description, image, and type.
- Canonical URL if the site has a final domain.
- `lang="si"` on the `<html>` tag.

Later, add structured data using JSON-LD for book/article pages.

## 9. Add Visual Assets Carefully

This project should not look like a generic marketing site. Visuals should support reading and trust.

Good options:

- A simple collection cover image.
- Small category icons for the five stages.
- Subtle paper texture only if it does not reduce readability.
- Book-cover thumbnails if real covers are available.

Avoid:

- Heavy gradients.
- Decorative clutter.
- Low-contrast text.
- Stock images that do not directly relate to the collection.

## 10. Add Accessibility Checks

Accessibility will also make the site feel more professional.

Checklist:

- Use semantic headings in order.
- Make all links descriptive.
- Ensure color contrast passes WCAG AA.
- Add visible focus states for keyboard navigation.
- Respect reduced-motion preferences.
- Make controls usable without JavaScript where practical.

## 11. Add Performance Improvements

The site can stay fast because it is static.

Recommended actions:

- Use shared CSS files with browser caching.
- Preload or preconnect only the font resources that are actually needed.
- Avoid large JavaScript frameworks unless the site becomes much more complex.
- Minify CSS and JS only during a build step, not in source files.
- Add image dimensions to prevent layout shift.

## 12. Suggested Implementation Order

1. Confirm and fix UTF-8 Sinhala text encoding.
2. Extract shared CSS into `assets/css/base.css`, `reader.css`, and `home.css`.
3. Redesign `index.html` with a modern responsive library layout.
4. Create `books.json` or a shared metadata object for all books.
5. Add search and filters on the home page.
6. Add previous/next navigation to book pages.
7. Add theme, font-size, and reading-width controls.
8. Run mobile, accessibility, and performance checks.

## Modern Design Direction

Use a quiet scholarly style:

- Warm off-white background.
- Deep brown or muted gold accent.
- Sinhala-first typography with strong line height.
- Clear stages and reading paths.
- Simple cards, clean borders, and generous spacing.
- Strong mobile reading comfort.

The best modern version of this project should feel like a peaceful digital library, not a flashy app.
