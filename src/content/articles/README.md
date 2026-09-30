# Articles

Each article is a folder with one Markdown file per language:

```
src/content/articles/
  how-long-does-a-web-app-take/   ← the folder name is the URL: /articles/how-long-does-a-web-app-take/
    en.md
    hu.md                         ← optional; readers fall back to the other language
```

Start by copying `_template/` (folders starting with `_` are ignored) and
renaming it. Each file begins with frontmatter:

```
---
title: How long does a custom web app take?
description: One or two sentences, about 150 characters. Used in search results and link previews.
date: 2026-10-15
updated: 2026-11-02
tags: [web apps, planning]
draft: true
---
```

- `date` is `YYYY-MM-DD`, optionally with a time (`YYYY-MM-DD HH:MM`); the list is
  sorted newest first, and the time decides the order of articles from the same day
  (an article without a time counts as the start of that day).
- `updated` and `tags` are optional.
- `draft: true` shows the article in `npm run dev` only. Remove it to publish.

The body is ordinary Markdown: `##` headings, lists, links, **bold**, `code`,
fenced code blocks, quotes, tables and images (put images in
`public/articles/<slug>/` and link them as `/articles/<slug>/picture.jpg`).

On build, every published article gets its own page with the right title,
description and preview tags, and is added to `sitemap.xml`.
