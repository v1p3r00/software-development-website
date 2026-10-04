// builds public/vendor/sql-lab.js: sql.js (classic script, defines initSqlJs) + the wasm binary as base64
import fs from 'node:fs';
const loader = fs.readFileSync('node_modules/sql.js/dist/sql-wasm.js', 'utf8');
const wasm = fs.readFileSync('node_modules/sql.js/dist/sql-wasm.wasm').toString('base64');
const version = JSON.parse(fs.readFileSync('node_modules/sql.js/package.json', 'utf8')).version;
const boot = `
;(function () {
  var b64 = ${JSON.stringify(wasm)};
  var ready = null;
  /** resolves to the sql.js module (SQL.Database …) */
  window.initSql = function () {
    if (!ready) {
      var bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      ready = initSqlJs({ wasmBinary: bytes });
    }
    return ready;
  };
})();
`;
fs.writeFileSync(process.argv[2], `/*! Course SQL lab: sql.js ${version} (MIT) — SQLite (public domain) compiled to WebAssembly, embedded. Rebuild: scripts/code-lab/README.md */\n` + loader + boot);
