# Share pictures of the free tools

`public/og/{cv-maker,interview,course}.{en,hu}.png` (1200×630) are what Facebook and LinkedIn show when
the CV maker, the interview simulator (and every track) or the course (and every lesson) is shared.
`scripts/seo.ts` points each page's `og:image` at them.

To change the text or the pictures, edit `make.cjs` and regenerate:

1. make static fonts from the site's variable fonts (fontTools + brotli):
   Archivo 800, Inter 400 and 600, JetBrains Mono 500, latin + latin-ext merged, saved as
   `fonts/OGArchivo.ttf`, `OGInter.ttf`, `OGInterSemi.ttf`, `OGMono.ttf` next to `make.cjs`
2. `npm i @resvg/resvg-js` (anywhere) and fix the require path at the top of `make.cjs`
3. `node make.cjs ../../public/og`

Facebook caches previews: after a deploy, re-scrape a URL with https://developers.facebook.com/tools/debug/

## Landing pages and case studies

`public/og/landing-pages.{en,hu}.png`, `landing-<slug>.{en,hu}.png` and `project-<id>.{en,hu}.png` are rendered
from HTML with Playwright (the site's own fonts, each landing page's `poster.webp`, and each case study's
card visual), in the same frame as the pictures above. `scripts/seo.ts` points the gallery, every landing
page and every case study at them.
