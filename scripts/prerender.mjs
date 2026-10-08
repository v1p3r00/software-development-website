/**
 * Prerender every page the SEO step wrote into dist (runs after both builds).
 *
 * For each dist/**\/index.html the app is rendered for that address and the
 * markup goes into <div id="root">, so the first paint needs no JavaScript;
 * main.tsx then hydrates it. The stylesheet the page needs above the fold is
 * inlined and the full one loads without blocking the render.
 *
 * A page that fails to render keeps its empty root and simply renders in the
 * browser, as before.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const server = path.join(root, 'node_modules/.prerender/entry-server.js');

// the app touches a few browser globals while rendering; give it inert stand-ins
const noop = () => {};
const storage = { getItem: () => null, setItem: noop, removeItem: noop };
globalThis.localStorage ??= storage;
globalThis.sessionStorage ??= storage;

const { render } = await import(pathToFileURL(server).href);

let Beasties = null;
try {
  ({ default: Beasties } = await import('beasties'));
} catch {
  console.warn('[prerender] beasties is not installed: the stylesheet stays render-blocking');
}
const beasties =
  Beasties &&
  new Beasties({
    path: dist,
    publicPath: '/',
    preload: 'swap',
    pruneSource: false,
    inlineFonts: false,
    preloadFonts: false,
    reduceInlineStyles: false,
    logLevel: 'silent',
  });

/** removes each <tag>…</tag> block (nesting-aware) for which keep(index) is false */
function dropBlocks(html, tag, keep) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  let out = '';
  let at = 0;
  let depth = 0;
  let start = -1;
  let n = 0;
  for (const m of html.matchAll(re)) {
    if (!m[1]) {
      if (depth === 0) start = m.index;
      depth++;
    } else if (depth > 0) {
      depth--;
      if (depth === 0) {
        if (!keep(n++)) {
          out += html.slice(at, start);
          at = m.index + m[0].length;
        }
      }
    }
  }
  return out + html.slice(at);
}

/**
 * Critical CSS covers the first screen only: beasties reads a copy of the page that keeps
 * the header and the first section, and its result (inline styles + async stylesheet) is
 * put in front of the full page. Inlining the rules of every section made each page's
 * HTML tens of kilobytes heavier for no visible gain.
 */
/** hover, focus and other interaction states can wait for the full stylesheet */
const INTERACTIVE = /:(hover|focus|focus-visible|focus-within|active)\b|::placeholder|::selection/;
let postcss = null;
try {
  ({ default: postcss } = await import('postcss'));
} catch {
  /* optional: without it the critical CSS keeps its interaction rules */
}
function dropInteractive(head) {
  if (!postcss) return head;
  return head.replace(/<style>([\s\S]*?)<\/style>/, (whole, css) => {
    try {
      const root = postcss.parse(css);
      root.walkRules((rule) => {
        if (rule.parent?.type === 'atrule' && /keyframes/i.test(rule.parent.name)) return;
        const keep = rule.selectors.filter((sel) => !INTERACTIVE.test(sel));
        if (!keep.length) rule.remove();
        else if (keep.length !== rule.selectors.length) rule.selectors = keep;
      });
      root.walkAtRules((at) => {
        if (at.nodes && !at.nodes.length) at.remove();
      });
      return `<style>${root.toString()}</style>`;
    } catch {
      return whole;
    }
  });
}

async function inlineCritical(html) {
  const cut = html.indexOf('<body');
  if (cut < 0) return beasties.process(html);
  const firstScreen = dropBlocks(dropBlocks(html, 'section', (i) => i === 0), 'footer', () => false);
  const processed = await beasties.process(firstScreen);
  const headEnd = processed.indexOf('<body');
  if (headEnd < 0) return beasties.process(html);
  return dropInteractive(processed.slice(0, headEnd)) + html.slice(cut);
}

function* pagesIn(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets') yield* pagesIn(file);
    } else if (entry.name === 'index.html') yield file;
  }
}

const started = Date.now();
let done = 0;
const failed = [];
for (const file of pagesIn(dist)) {
  const rel = path.relative(dist, path.dirname(file)).split(path.sep).join('/');
  const url = rel ? `/${rel}/` : '/';
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) continue;
  try {
    const app = await render(url);
    let out = html.replace('<div id="root"></div>', () => `<div id="root">${app}</div>`);
    if (beasties) out = await inlineCritical(out);
    fs.writeFileSync(file, out);
    done++;
  } catch (err) {
    failed.push(`${url}: ${String(err?.message ?? err).split('\n')[0]}`);
  }
}
console.log(`[prerender] ${done} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);
if (failed.length) console.warn(`[prerender] ${failed.length} left to the browser:\n  ${failed.slice(0, 20).join('\n  ')}`);
