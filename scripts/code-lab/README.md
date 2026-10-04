# Course code lab

`public/vendor/code-lab.js` is loaded into the sandboxed exercise iframe for
`ts` and `react` exercises. It bundles React 19 + React DOM and Sucrase (to
compile TypeScript/JSX in the browser) and exposes `window.React`,
`window.ReactDOM` and `window.compileCode(code, kind)`.

It is built separately so the site itself gains no dependencies:

```bash
mkdir /tmp/lab && cp entry.js vite.config.js /tmp/lab && cd /tmp/lab
echo '{"type":"module"}' > package.json
npm install react@19 react-dom@19 sucrase vite@8
npx vite build            # → out/code-lab.js, copy to public/vendor/
```

## SQL lab

`public/vendor/sql-lab.js` is loaded for `sql` exercises: sql.js (SQLite compiled
to WebAssembly) with the `.wasm` binary embedded as base64, so the sandboxed
exercise page can start it without a cross-origin fetch. It exposes
`window.initSql()`, which resolves to the sql.js module.

```bash
cd /tmp/lab && npm install sql.js
node make-sql-lab.mjs ../path/to/PersonalPage/public/vendor/sql-lab.js
```
