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

### Client-side routing

GitHub Pages has no rewrite rules, so the build copies `index.html` to
`404.html`. A deep link such as `/project/bank-projects` is served that file and
React Router renders the right view with the URL intact.

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
  pages/         Home, ProjectDetail
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

The form composes a `mailto:` message — no backend. To post to an API or a
service like Formspree instead, replace the `submit` handler in
`src/components/ContactTerminal.tsx`.
