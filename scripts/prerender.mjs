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
    if (beasties) out = await beasties.process(out);
    fs.writeFileSync(file, out);
    done++;
  } catch (err) {
    failed.push(`${url}: ${String(err?.message ?? err).split('\n')[0]}`);
  }
}
console.log(`[prerender] ${done} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);
if (failed.length) console.warn(`[prerender] ${failed.length} left to the browser:\n  ${failed.slice(0, 20).join('\n  ')}`);
