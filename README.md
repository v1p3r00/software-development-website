# David Mészáros — Portfolio

A personal portfolio built as a technical interface rather than a conventional
marketing page: industrial grid, monospaced system metadata, wireframe case
schematics and a small set of genuinely useful interactions.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS 3** with a token-based theme (CSS custom properties, dark + light)
- Self-hosted variable fonts (Archivo / Inter / JetBrains Mono / Caveat) — no third-party requests
- No animation library: transitions are CSS + `requestAnimationFrame`, so the bundle stays small

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

### Routing and SEO

GitHub Pages cannot rewrite URLs, and crawlers and link previews often do not
run JavaScript. So after `vite build`, `scripts/seo.ts` writes a real HTML file
for every route — home, each case study (`/project/<id>/`), the article index
(`/articles/`) and each article (`/articles/<slug>/`) — each with its own title,
description, canonical URL, Open Graph / Twitter tags and schema.org data. It
also writes `sitemap.xml`, `robots.txt` and a `noindex` `404.html` (which still
boots the app, so any other client-side route keeps working). In the browser,
`src/hooks/useSeo.ts` keeps the head in step as you navigate.

The social preview image is `public/og.png` (1200×630).

## Structure

```
src/
  components/    Navigation, Hero, ProjectGrid, ProjectCard, ProjectVisual,
                 About, Services, TechStack, ContactTerminal, CommandPalette,
                 LanguageSwitcher, SystemStatus, ScrollProgress,
                 TechnicalCursor, Footer, ui (shared primitives)
  data/          projects.ts, services.ts, technologies.ts, site.ts
  hooks/         useTheme, useMisc (scroll/observer/clock helpers), useGoToSection
  i18n/          en.ts (source of truth + Dict type), hu.ts, index.tsx (provider)
  pages/         Home, ProjectDetail, Articles, Article
  content/       articles/ (Markdown), frontmatter.ts
  lib/           seo-shared.ts (used by the app and the build)
scripts/         seo.ts (per-route HTML, sitemap, robots)
```

Content lives in `src/data` and `src/i18n`; components contain no copy.
`en.ts` defines the `Dict` type, so a missing Hungarian key is a build error.

## Editing content

- **Projects** — `src/data/projects.ts`. Order in the array is the order on the
  page. Each project carries its copy in both languages plus a `visual` key that
  selects one of the wireframe schematics in `components/ProjectVisual.tsx`.
  Replace those with real screenshots when they are cleared for publication.
- **Capabilities** — `src/data/services.ts` (including the INPUT → PROCESS →
  SYSTEM → OUTPUT flow shown on hover).
- **Tech stack** — `src/data/technologies.ts`. Every entry becomes a card in
  the 3D ring; `links` are treated as bidirectional, so each relation only
  needs declaring once. The ring auto-sizes its radius so cards never overlap,
  whatever the node count.
- **Contact details, social links, build tag** — `src/data/site.ts`.
- **Articles** — Markdown files in `src/content/articles/<slug>/en.md` (and
  optionally `hu.md`). See `src/content/articles/README.md`; copy `_template/`
  to start one. `draft: true` keeps an article out of the production build.
  While there are no articles, `/articles/` shows a "coming soon" state and is
  kept out of search results.
- **Search titles and descriptions** — `seo` in `src/i18n/en.ts` / `hu.ts`.
- **Interactive projects** (home-page Projects section and the Projects menu) —
  `src/data/labs.ts`; each entry's page preloader is in `labPreload`
  (`src/pages/lazy.ts`) and its icon in `components/LabIcon.tsx`.
- **CV Maker** (`/cv-maker/`) — `src/pages/CvMaker.tsx` plus `src/components/cv/`:
  `model.ts` (data shape, section kinds), `text.ts` (EN/HU interface copy and
  tips), `guideContent.ts` (the “How to write an ideal CV” guide), `examples.ts`
  (the sample CV), `CvSheet.tsx` + `cv.css` (the four layouts and print rules).
  PDF export uses the browser's print dialog, so the text stays selectable; the
  CV is autosaved in `localStorage` and can be exported/imported as JSON.

## Interactions

| Interaction | Where |
|---|---|
| Command palette (`⌘K` / `Ctrl K`) | navigate, open a case, switch theme or language, copy email |
| 3D stack carousel | CSS 3D ring: idle auto-rotation, drag to spin, click a card or a connection to snap to it, arrow buttons, group jump, live top-view radar |
| Technical cursor | desktop pointers only; `data-cursor="open \| follow \| inspect"` on any element |
| System status HUD | bottom left, appears after the hero |
| Section rail | right edge on very wide screens |
| Case-study loader | progress bar transition into `/project/:id` |
| Filters | client-side project filtering by category |
| Theme | dark (default) and a light "daylight" variant, persisted |
| Language | EN (default) / HU, persisted |

## Accessibility & motion

Semantic landmarks, labelled controls, visible focus rings, a skip link, real
form labels with `aria-invalid` / `role="alert"` validation, and full keyboard
support in the command palette. Every animation is disabled under
`prefers-reduced-motion: reduce`, including the case-study loader and the
custom cursor.

## Contact form

The form posts to [Web3Forms](https://web3forms.com), which emails each enquiry
to the site address (`site.formEndpoint` / `site.formAccessKey` in
`src/data/site.ts`; the key is public by design and can only deliver to that
address). Besides name, email and the project description it asks, optionally,
for a phone number, the preferred way to be contacted (email, phone with call
hours, or a meeting online or in person), company, project type, budget,
timeline and how the visitor found the site. A hidden honeypot field filters
out bots.
