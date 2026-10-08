/**
 * softwaredevelopment.hu — free website check (Cloudflare Worker)
 *
 *   GET /check?url=example.hu   → facts about the page: HTTPS, security headers, SEO tags,
 *                                 mobile basics, size and response time (a few seconds)
 *   GET /speed?url=example.hu   → Google PageSpeed Insights scores for mobile (10–30 s)
 *
 * The site turns these facts into a score and a bilingual report; this worker only measures.
 * Optional secret: PSI_KEY (a free Google API key) raises the PageSpeed quota.
 * Deploy: see README.md next to this file.
 */

const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?softwaredevelopment\.hu$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const UA = 'Mozilla/5.0 (compatible; softwaredevelopment.hu site check; +https://softwaredevelopment.hu/website-check/)';
const MAX_HTML = 1_500_000;

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.some((r) => r.test(origin)) ? origin : 'https://softwaredevelopment.hu',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const reqUrl = new URL(request.url);
    const json = (data, status = 200, maxAge = 0) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store' },
      });

    const target = normalise(reqUrl.searchParams.get('url') || '');
    if (!target) return json({ error: 'bad-url' }, 400);

    // the same site checked again within a few minutes comes from the cache
    const cacheKey = new Request(`https://cache.site-check/${reqUrl.pathname}?u=${encodeURIComponent(target.href)}`);
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) {
      const body = await hit.text();
      return new Response(body, { headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'hit' } });
    }

    let data;
    if (reqUrl.pathname.endsWith('/speed')) data = await speed(target, env);
    else if (reqUrl.pathname.endsWith('/check') || reqUrl.pathname === '/') data = await check(target);
    else return json({ error: 'not-found' }, 404);

    const res = json(data, data.error ? 502 : 200);
    if (!data.error) ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'public, max-age=600' } })));
    return res;
  },
};

/* ---------- input ---------- */

function normalise(raw) {
  let s = raw.trim();
  if (!s || s.length > 300) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  // public web sites only
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal') || host === 'localhost') return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  u.hash = '';
  return u;
}

async function get(url, { timeout = 12000, method = 'GET', redirect = 'follow' } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    return await fetch(url, { method, redirect, signal: ctl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'hu,en;q=0.8', 'Accept-Encoding': 'gzip, deflate, br' } });
  } finally {
    clearTimeout(t);
  }
}

async function readCapped(res, max) {
  const reader = res.body?.getReader();
  if (!reader) return { text: '', bytes: 0 };
  const chunks = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes <= max) chunks.push(value);
    else {
      await reader.cancel();
      break;
    }
  }
  const buf = new Uint8Array(Math.min(bytes, max));
  let at = 0;
  for (const c of chunks) {
    buf.set(c.subarray(0, Math.min(c.byteLength, buf.length - at)), at);
    at += c.byteLength;
    if (at >= buf.length) break;
  }
  return { text: new TextDecoder('utf-8', { fatal: false }).decode(buf), bytes };
}

/* ---------- the check ---------- */

async function check(target) {
  const started = Date.now();
  let res;
  // try https first; a site that only answers on http is a finding in itself
  const https = new URL(target.href);
  https.protocol = 'https:';
  try {
    res = await get(https.href);
  } catch {
    try {
      const http = new URL(target.href);
      http.protocol = 'http:';
      res = await get(http.href);
    } catch (e) {
      return { error: 'unreachable', detail: String(e && e.message ? e.message : e).slice(0, 200), input: target.href };
    }
  }
  const timeMs = Date.now() - started;
  const final = new URL(res.url || https.href);
  const { text: html, bytes } = await readCapped(res, MAX_HTML);

  // does plain http send visitors on to https?
  let httpRedirect = null;
  try {
    const http = new URL(final.href);
    http.protocol = 'http:';
    const r = await get(http.href, { redirect: 'manual', timeout: 6000 });
    const loc = r.headers.get('location') || '';
    httpRedirect = r.status >= 300 && r.status < 400 && /^https:\/\//i.test(loc);
  } catch {
    httpRedirect = null;
  }

  const h = (k) => res.headers.get(k);
  const origin = `${final.protocol}//${final.host}`;
  const [robots, sitemap] = await Promise.all([small(`${origin}/robots.txt`), small(`${origin}/sitemap.xml`)]);
  const robotsSitemap = robots.ok ? /^\s*sitemap:\s*(\S+)/im.exec(robots.text)?.[1] || null : null;
  let sitemapOk = sitemap.ok && /<(urlset|sitemapindex)\b/i.test(sitemap.text);
  if (!sitemapOk && robotsSitemap) {
    const s2 = await small(robotsSitemap);
    sitemapOk = s2.ok && /<(urlset|sitemapindex)\b/i.test(s2.text);
  }

  const page = parse(html, final);
  const cspHeader = h('content-security-policy') || '';
  return {
    input: target.href,
    url: final.href,
    status: res.status,
    contentType: h('content-type') || '',
    timeMs,
    bytes,
    https: final.protocol === 'https:',
    httpRedirect,
    headers: {
      hsts: !!h('strict-transport-security'),
      // a <meta http-equiv> policy and a <meta name="referrer"> work in the browser just like the headers
      csp: !!cspHeader || page.cspMeta,
      cspMeta: !cspHeader && page.cspMeta,
      xcto: (h('x-content-type-options') || '').toLowerCase().includes('nosniff'),
      frame: !!h('x-frame-options') || /frame-ancestors/i.test(cspHeader),
      referrer: !!h('referrer-policy') || page.referrerMeta,
      permissions: !!h('permissions-policy'),
      compression: /gzip|br|zstd|deflate/i.test(h('content-encoding') || ''),
      server: (h('server') || '').slice(0, 60),
      poweredBy: (h('x-powered-by') || '').slice(0, 60),
    },
    robots: { exists: robots.ok, sitemapListed: !!robotsSitemap, blocksAll: robots.ok && /^\s*disallow:\s*\/\s*$/im.test(robots.text) && /^\s*user-agent:\s*\*/im.test(robots.text) },
    sitemap: sitemapOk,
    page,
  };
}

async function small(url) {
  try {
    const r = await get(url, { timeout: 5000 });
    if (!r.ok) return { ok: false, text: '' };
    const { text } = await readCapped(r, 300_000);
    // some servers answer every address with the home page
    const html = /^\s*<!doctype html|^\s*<html/i.test(text);
    return { ok: !html, text };
  } catch {
    return { ok: false, text: '' };
  }
}

/* ---------- reading the HTML ---------- */

const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  if (m) return (m[2] ?? m[3] ?? m[4] ?? '').trim();
  // a bare attribute (<img alt>) is present with an empty value
  return new RegExp(`\\s${name}(?=[\\s/>])`, 'i').test(tag) ? '' : null;
};
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, ' ')
    .trim();

function metas(html) {
  const out = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) out.push(m[0]);
  return out;
}
function metaContent(list, key, value) {
  const tag = list.find((t) => (attr(t, key) || '').toLowerCase() === value);
  return tag ? decode(attr(tag, 'content') || '') : null;
}

function parse(html, base) {
  const head = html.slice(0, 200_000);
  const ms = metas(head);
  const title = decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1] || '');
  const description = metaContent(ms, 'name', 'description');
  const viewport = metaContent(ms, 'name', 'viewport');
  const generator = metaContent(ms, 'name', 'generator');
  const htmlTag = /<html\b[^>]*>/i.exec(html)?.[0] || '';
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const rel = (r) => links.find((l) => (attr(l, 'rel') || '').toLowerCase().split(/\s+/).includes(r));
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  const externalScripts = scripts.filter((s) => attr(s, 'src'));
  const text = decode(body.replace(/<[^>]+>/g, ' '));
  const years = [...text.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => +m[1]).filter((y) => y > 1995 && y < 2100);
  const jq = /jquery[.-]?(\d+\.\d+(?:\.\d+)?)(?:\.min)?\.js/i.exec(html)?.[1] || /jquery\/(\d+\.\d+(?:\.\d+)?)\//i.exec(html)?.[1] || null;
  const insecure = base.protocol === 'https:' ? [...html.matchAll(/<(?:img|script|iframe|source|link)\b[^>]*\b(?:src|href)\s*=\s*["']http:\/\//gi)].length : 0;
  return {
    title,
    description,
    viewport,
    lang: attr(htmlTag, 'lang'),
    h1: (body.match(/<h1\b/gi) || []).length,
    canonical: rel('canonical') ? attr(rel('canonical'), 'href') : null,
    icon: !!(rel('icon') || rel('shortcut') || rel('apple-touch-icon')),
    ogTitle: metaContent(ms, 'property', 'og:title'),
    ogImage: metaContent(ms, 'property', 'og:image'),
    jsonLd: /<script[^>]+type\s*=\s*["']application\/ld\+json["']/i.test(html),
    images: imgs.length,
    imagesNoAlt: imgs.filter((i) => attr(i, 'alt') === null).length,
    imagesLazy: imgs.filter((i) => (attr(i, 'loading') || '').toLowerCase() === 'lazy').length,
    modernImages: /\.(webp|avif)\b/i.test(html),
    scripts: externalScripts.length,
    stylesheets: links.filter((l) => (attr(l, 'rel') || '').toLowerCase() === 'stylesheet').length,
    words: text ? text.split(' ').length : 0,
    generator,
    wordpress: /wp-content\/|wp-includes\//i.test(html) || /wordpress/i.test(generator || ''),
    jquery: jq,
    copyrightYear: years.length ? Math.max(...years) : null,
    insecureResources: insecure,
    tel: /href\s*=\s*["']tel:/i.test(html),
    mail: /href\s*=\s*["']mailto:/i.test(html),
    form: /<form\b/i.test(html),
    analytics: /googletagmanager\.com|google-analytics\.com|gtag\(|plausible\.io|matomo|umami|simpleanalytics|goatcounter|usefathom|static\.cloudflareinsights\.com|clarity\.ms|connect\.facebook\.net/i.test(html),
    trackingCookies: /googletagmanager\.com|google-analytics\.com|gtag\(|connect\.facebook\.net|clarity\.ms|matomo/i.test(html),
    cspMeta: ms.some((t) => (attr(t, 'http-equiv') || '').toLowerCase() === 'content-security-policy' && !!attr(t, 'content')),
    referrerMeta: !!metaContent(ms, 'name', 'referrer'),
    cookieBanner: /cookie(?:bot|yes|law|consent|notice|-banner)|onetrust|complianz|cmplz|iubenda|cookiehub|sütik?\b/i.test(html),
    flash: /\.swf\b|application\/x-shockwave-flash/i.test(html),
  };
}

/* ---------- PageSpeed ---------- */

async function speed(target, env) {
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', target.href);
  api.searchParams.set('strategy', 'mobile');
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) api.searchParams.append('category', c);
  if (env.PSI_KEY) api.searchParams.set('key', env.PSI_KEY);
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 55000);
    const r = await fetch(api.href, { signal: ctl.signal });
    clearTimeout(t);
    const d = await r.json();
    if (!r.ok || !d.lighthouseResult) return { error: 'psi', detail: d?.error?.message?.slice(0, 200) || `HTTP ${r.status}` };
    const L = d.lighthouseResult;
    const score = (k) => (L.categories?.[k]?.score == null ? null : Math.round(L.categories[k].score * 100));
    const audit = (k) => L.audits?.[k]?.numericValue ?? null;
    return {
      url: L.finalUrl || target.href,
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
      lcp: audit('largest-contentful-paint'),
      cls: audit('cumulative-layout-shift'),
      tbt: audit('total-blocking-time'),
      fcp: audit('first-contentful-paint'),
      weight: audit('total-byte-weight'),
    };
  } catch (e) {
    return { error: 'psi', detail: String(e && e.message ? e.message : e).slice(0, 200) };
  }
}

// for tests
export { normalise, parse };
