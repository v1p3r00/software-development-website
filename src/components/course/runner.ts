import type { Exercise } from '../../data/course';

export interface TestResult {
  name: string;
  pass: boolean;
  error?: string;
}

/** sandbox flags: scripts, and forms so submit events fire (the page cannot navigate the site) */
export const SANDBOX = 'allow-scripts allow-forms';

export interface RunResult {
  results: TestResult[];
  logs: string[];
  error: string | null;
}

/** keeps learner code from closing the script tag it is embedded in */
const safe = (code: string) => code.replace(/<\/script/gi, '<\\/script');

/** console capture + error trap, injected before the learner's code */
const prelude = (nonce: string) => `<script>
(() => {
  const logs = (window.__logs = []);
  const fmt = (v) => { if (typeof v === 'string') return v; try { return JSON.stringify(v); } catch { return String(v); } };
  for (const k of ['log', 'info', 'warn', 'error']) {
    const orig = console[k];
    console[k] = (...a) => { logs.push(a.map(fmt).join(' ')); orig.apply(console, a); };
  }
  window.__err = null;
  // a submitted form would reload the sandbox page and lose the results; nothing should navigate here
  window.addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('error', (e) => { window.__err = e.message; });
  window.__nonce = ${JSON.stringify(nonce)};
  // helpers for tests that drive a UI like a user would
  window.tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));
  window.click = async (el) => { el.click(); await window.tick(); };
  window.typeInto = async (el, value) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await window.tick();
  };
  // leaving a field the way React notices it (React listens for focusout, not blur)
  window.leave = async (el) => {
    el.dispatchEvent(new FocusEvent('blur'));
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await window.tick();
  };
})();
</script>`;

/**
 * runs the selected tests (sync or async) once the page has loaded and been laid out, then posts
 * the results; `only` picks one test so every test can get a fresh page of its own
 */
const harness = (ex: Exercise, only?: number) => `<script>
const __whenReady = async () => { if (window.__ready) await window.__ready; await new Promise((r) => {
  // after load, wait a frame so layout exists; hidden or throttled frames get no
  // animation frames, so a short timer stands in for it
  const go = () => {
    let fired = false;
    const fin = () => { if (!fired) { fired = true; setTimeout(r, 0); } };
    requestAnimationFrame(fin);
    setTimeout(fin, 80);
  };
  if (document.readyState === 'complete') go();
  else addEventListener('load', go, { once: true });
}); };
(async () => {
  await __whenReady();
  const tests = ${safe(JSON.stringify(only === undefined ? ex.tests : only < 0 ? [] : [ex.tests[only]]))};
  // each test body may use await (helpers like click / typeInto / tick)
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const results = [];
  for (const t of tests) {
    try {
      const pass = await new AsyncFunction(t.code)();
      // a test passes by returning true, or by finishing without throwing (assertion style)
      results.push({ name: t.name, pass: pass === true || pass === undefined });
    } catch (e) {
      results.push({ name: t.name, pass: false, error: String((e && e.message) || e) });
    }
  }
  parent.postMessage({ course: window.__nonce, results, logs: window.__logs, error: window.__err }, '*');
})();
</script>`;

/**
 * the iframe document for one run: all tests (only undefined), a single test (only = index)
 * or none at all (only = -1, for the preview and console output)
 */
export function buildDoc(ex: Exercise, code: string, nonce: string, only?: number): string {
  if (ex.kind === 'sql') {
    // a fresh SQLite database per page: seed it, run the learner's SQL, expose the results to the tests
    const boot = `window.__ready = (async () => {
  const SQL = await initSql();
  const db = (window.db = new SQL.Database());
  const rows = (r) => r.values.map((v) => Object.fromEntries(r.columns.map((c, i) => [c, v[i]])));
  window.query = (sql) => db.exec(sql).flatMap(rows);
  try { db.run(${JSON.stringify(ex.setup ?? '')}); } catch (e) { window.__err = 'Setup error: ' + e.message; return; }
  window.results = []; window.result = [];
  try {
    const out = db.exec(${JSON.stringify(code)});
    window.results = out.map(rows); window.result = window.results.length ? window.results[window.results.length - 1] : [];
    // show each result set as a small text table in the output pane
    for (const r of out) {
      const w = r.columns.map((c, i) => Math.min(28, Math.max(String(c).length, ...r.values.map((v) => String(v[i] ?? 'NULL').length))));
      const line = (cells) => cells.map((c, i) => String(c ?? 'NULL').slice(0, 28).padEnd(w[i])).join(' │ ');
      console.log([line(r.columns), w.map((n) => '─'.repeat(n)).join('─┼─'), ...r.values.map(line), '(' + r.values.length + (r.values.length === 1 ? ' row)' : ' rows)')].join('\\n'));
    }
    if (!out.length) console.log('OK — statement(s) ran, no rows returned.');
  } catch (e) { window.__err = 'SQL error: ' + e.message; }
})();`;
    return `<!doctype html><html><head><meta charset="utf-8">${prelude(nonce)}<script src="/vendor/sql-lab.js"></script></head><body><script>${safe(boot)}</script>${harness(ex, only)}</body></html>`;
  }
  if (ex.kind === 'ts' || ex.kind === 'react') {
    // compiled in the frame by the code lab (TypeScript / JSX → JavaScript), then run as a
    // classic script so its top-level declarations are visible to the tests
    const react = ex.kind === 'react';
    const boot = `(() => {
  let out;
  try { out = compileCode(${JSON.stringify(code)}, ${JSON.stringify(ex.kind)}); }
  catch (e) { window.__err = 'Compile error: ' + e.message; return; }
  const s = document.createElement('script'); s.textContent = out; document.body.appendChild(s);
  ${react ? `const r = document.createElement('script');
  r.textContent = "if (typeof App === 'function') { window.__root = ReactDOM.createRoot(document.getElementById('root')); ReactDOM.flushSync(() => window.__root.render(React.createElement(App))); }";
  document.body.appendChild(r);` : ''}
})();`;
    return `<!doctype html><html><head><meta charset="utf-8">${prelude(nonce)}<script src="/vendor/code-lab.js"></script>${
      react ? '<style>body{font-family:system-ui,sans-serif;margin:16px;line-height:1.5}</style>' : ''
    }</head><body>${react ? '<div id="root"></div>' : ''}<script>${safe(boot)}</script>${harness(ex, only)}</body></html>`;
  }
  if (ex.kind === 'js') {
    return `<!doctype html><html><head><meta charset="utf-8">${prelude(nonce)}</head><body><script>${safe(code)}</script>${harness(ex, only)}</body></html>`;
  }
  // web: the learner writes the page; keep a doctype in front so layout is in standards mode
  const doctype = /^\s*<!doctype[^>]*>/i.exec(code);
  const rest = doctype ? code.slice(doctype[0].length) : code;
  return `<!doctype html>${prelude(nonce)}${rest}${harness(ex, only)}`;
}
