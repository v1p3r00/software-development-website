// node make.cjs <outdir> — renders the share pictures (1200×630) of the CV maker, interview simulator and course
const fs = require('fs');
const path = require('path');
const { Resvg } = require(process.env.HOME + '/shot/node_modules/@resvg/resvg-js');
const out = process.argv[2];
const F = path.join(__dirname, 'fonts');
const fonts = ['OGArchivo.ttf', 'OGInter.ttf', 'OGInterSemi.ttf', 'OGMono.ttf'].map((f) => path.join(F, f));

const C = { bg: '#08080a', text: '#e6e4de', grey: '#8a8a86', dim: '#5c5d61', line: '#26282c', accent: '#ff5f1f', surface: '#111215' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mono = (x, y, s, fill, size = 17, ls = 4, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="OG Mono" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;

function frame() {
  let g = '';
  for (let x = 0; x <= 1200; x += 40) g += `<line x1="${x}" y1="0" x2="${x}" y2="630" stroke="#ffffff" stroke-opacity="0.035"/>`;
  for (let y = 0; y <= 630; y += 40) g += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#ffffff" stroke-opacity="0.035"/>`;
  const plus = (x, y) => `<path d="M${x - 6} ${y}h12M${x} ${y - 6}v12" stroke="${C.accent}" stroke-width="1.6"/>`;
  return `<rect width="1200" height="630" fill="${C.bg}"/>${g}
    <rect x="36" y="36" width="1128" height="558" fill="none" stroke="${C.line}"/>
    ${plus(36, 36)}${plus(1164, 36)}${plus(36, 594)}${plus(1164, 594)}`;
}

function left(d) {
  let s = `<line x1="84" y1="96" x2="124" y2="96" stroke="${C.grey}" stroke-width="1.2"/>${mono(140, 102, '// SOFTWAREDEVELOPMENT.HU', C.accent, 17, 4)}`;
  const size = d.size ?? 92;
  d.lines.forEach((l, i) => {
    const y = 210 + i * (size * 0.98);
    const fill = i % 2 === 1 ? C.grey : C.text;
    s += `<text x="80" y="${y}" font-family="OG Archivo" font-size="${size}" letter-spacing="-2" fill="${fill}">${esc(l)}</text>`;
    // the orange full stop square, placed after the measured word (approximate width per glyph)
    const w = d.widths[i];
    s += `<rect x="${80 + w + 6}" y="${y - size * 0.2}" width="${size * 0.2}" height="${size * 0.2}" fill="${C.accent}"/>`;
  });
  s += `<text x="84" y="500" font-family="OG Inter" font-size="28" fill="${C.text}">${esc(d.sub)}</text>`;
  s += mono(84, 542, d.meta, C.grey, 15, 3);
  return s;
}

function monogram() {
  return `<rect x="1052" y="482" width="64" height="64" fill="none" stroke="${C.grey}" stroke-opacity="0.7"/>
    <text x="1084" y="525" font-family="OG Archivo" font-size="26" fill="${C.text}" text-anchor="middle">DM</text>
    <rect x="1108" y="538" width="9" height="9" fill="${C.accent}"/>`;
}

// ---------- right-hand visuals ----------
function cvVisual(L) {
  const sheet = (x, y, rot, accent, name, dark) => {
    const lines = (yy, ws, col = '#d4d4d8') => ws.map((w, i) => `<rect x="${x + 26}" y="${yy + i * 13}" width="${w}" height="6" rx="3" fill="${col}"/>`).join('');
    return `<g transform="rotate(${rot} ${x + 150} ${y + 200})">
      <rect x="${x + 6}" y="${y + 10}" width="300" height="410" fill="#000" opacity="0.45"/>
      <rect x="${x}" y="${y}" width="300" height="410" fill="${dark ? '#16171b' : '#fbfbfa'}"/>
      <rect x="${x}" y="${y}" width="300" height="96" fill="${accent}"/>
      <circle cx="${x + 56}" cy="${y + 48}" r="28" fill="#ffffff" opacity="0.9"/>
      <text x="${x + 98}" y="${y + 44}" font-family="OG Archivo" font-size="21" fill="#ffffff">${esc(name)}</text>
      <rect x="${x + 98}" y="${y + 56}" width="120" height="7" rx="3.5" fill="#ffffff" opacity="0.7"/>
      ${lines(y + 120, [110], accent)}
      ${lines(y + 140, [240, 220, 180])}
      ${lines(y + 196, [90], accent)}
      ${lines(y + 216, [250, 230, 200, 160])}
      ${lines(y + 285, [90], accent)}
      ${lines(y + 305, [230, 210, 120])}
      <g>${[0, 1, 2, 3].map((i) => `<rect x="${x + 26 + i * 64}" y="${y + 360}" width="56" height="20" rx="10" fill="${accent}" opacity="0.18"/>`).join('')}</g>
    </g>`;
  };
  return `<g transform="translate(120 40) scale(0.84)">${sheet(760, 70, -7, '#2563eb', 'Anna Kovács', false)}${sheet(870, 54, 5, '#ff5f1f', 'David M.', false)}</g>`;
}

function interviewVisual(L) {
  const x = 690, y = 124, w = 400;
  const opts = L === 'hu'
    ? ['A virtuális DOM másolata', 'Komponensek közti állapot', 'Mellékhatások kezelése', 'Stílusok betöltése']
    : ['A copy of the virtual DOM', 'State shared between parts', 'Handling side effects', 'Loading the stylesheets'];
  const correct = 2, wrong = 0;
  let o = '';
  opts.forEach((t, i) => {
    const yy = y + 146 + i * 48;
    const ok = i === correct, bad = i === wrong;
    o += `<rect x="${x + 24}" y="${yy}" width="${w - 48}" height="40" fill="${ok ? '#30a46c' : bad ? '#e5484d' : '#1a1b1f'}" fill-opacity="${ok || bad ? 0.16 : 1}" stroke="${ok ? '#30a46c' : bad ? '#e5484d' : C.line}"/>`;
    o += mono(x + 40, yy + 26, String.fromCharCode(65 + i), ok ? '#30a46c' : bad ? '#e5484d' : C.dim, 15, 0);
    o += `<text x="${x + 66}" y="${yy + 26}" font-family="OG Inter" font-size="17" fill="${C.text}">${esc(t)}</text>`;
    if (ok) o += `<path d="M${x + w - 52} ${yy + 20} l6 6 l12 -13" fill="none" stroke="#30a46c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (bad) o += `<path d="M${x + w - 51} ${yy + 13} l13 13 M${x + w - 38} ${yy + 13} l-13 13" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>`;
  });
  const q = L === 'hu' ? ['Mire való a useEffect hook', 'egy React komponensben?'] : ['What is the useEffect hook', 'used for in React?'];
  return `<rect x="${x}" y="${y}" width="${w}" height="340" fill="${C.surface}" stroke="${C.line}"/>
    ${mono(x + 24, y + 38, 'REACT · MID', C.accent, 14, 3)}${mono(x + 190, y + 38, '37/200', C.dim, 14, 2)}
    <text x="${x + 24}" y="${y + 86}" font-family="OG Inter Semi" font-size="24" fill="${C.text}">${esc(q[0])}</text>
    <text x="${x + 24}" y="${y + 118}" font-family="OG Inter Semi" font-size="24" fill="${C.text}">${esc(q[1])}</text>
    ${o}
    <g transform="translate(${x + w - 70} ${y - 12})">
      <circle cx="0" cy="0" r="46" fill="${C.bg}" stroke="${C.line}" stroke-width="8"/>
      <circle cx="0" cy="0" r="46" fill="none" stroke="${C.accent}" stroke-width="8" stroke-dasharray="${2 * Math.PI * 46 * 0.86} 999" transform="rotate(-90)"/>
      <text x="0" y="9" font-family="OG Archivo" font-size="26" fill="${C.text}" text-anchor="middle">86%</text>
    </g>`;
}

function courseVisual(L) {
  const mods = L === 'hu'
    ? ['A web működése', 'HTML és CSS', 'JavaScript és TS', 'React', 'REST API-k Spring Boottal', 'Adatbázisok és JPA', 'Hitelesítés és biztonság', 'Tesztelés', 'Docker, CI/CD, élesítés', 'Záróprojekt és karrier']
    : ['How the web works', 'HTML & CSS', 'JavaScript & TypeScript', 'React', 'REST APIs with Spring Boot', 'Databases & JPA', 'Authentication & security', 'Testing', 'Docker, CI/CD & deployment', 'Capstone & career'];
  const tones = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#22d3ee', '#fb923c', '#818cf8', '#2dd4bf', '#ff5f1f'];
  const x = 712, y = 96;
  let s = `<line x1="${x + 18}" y1="${y + 20}" x2="${x + 18}" y2="${y + 20 + 9 * 44}" stroke="${C.line}" stroke-width="2"/>`;
  mods.forEach((m, i) => {
    const yy = y + 20 + i * 44;
    const done = i < 4;
    s += `<rect x="${x + 4}" y="${yy - 14}" width="28" height="28" fill="${done ? tones[i] : C.bg}" stroke="${tones[i]}" stroke-width="2"/>`;
    s += mono(x + 18, yy + 5, String(i + 1).padStart(2, '0'), done ? '#0b0b0c' : tones[i], 12, 0, 'middle');
    s += `<text x="${x + 50}" y="${yy + 7}" font-family="${done ? 'OG Inter Semi' : 'OG Inter'}" font-size="19" fill="${done ? C.text : C.grey}">${esc(m)}</text>`;
  });
  return s;
}

const COPY = {
  'cv-maker': {
    visual: cvVisual,
    en: { lines: ['WRITE', 'DESIGN', 'EXPORT'], sub: 'Free CV Maker — live preview, PDF export', meta: 'NO SIGN-UP · NO WATERMARK · EN / HU' },
    hu: { lines: ['ÍRD MEG', 'TERVEZD', 'EXPORTÁLD'], sub: 'Ingyenes önéletrajz-készítő, PDF export', meta: 'REGISZTRÁCIÓ ÉS VÍZJEL NÉLKÜL' },
  },
  interview: {
    visual: interviewVisual,
    en: { lines: ['PRACTISE', 'ANSWER', 'GET HIRED'], sub: 'Technical interview simulator — 14 tracks', meta: 'JAVA · REACT · SQL · DEVOPS · QA · AI' },
    hu: { lines: ['GYAKOROLJ', 'VÁLASZOLJ', 'JUSS BE'], sub: 'Technikai interjúszimulátor — 14 téma', meta: 'JAVA · REACT · SQL · DEVOPS · QA · AI' },
  },
  course: {
    visual: courseVisual,
    en: { lines: ['LEARN', 'BUILD', 'DEPLOY'], sub: 'Free full-stack course: React + Spring Boot', meta: '10 MODULES · 48 LESSONS · IN-BROWSER EXERCISES' },
    hu: { lines: ['TANULJ', 'ÉPÍTS', 'ÉLESÍTS'], sub: 'Ingyenes kurzus: React + Spring Boot', meta: '10 MODUL · 48 LECKE · BÖNGÉSZŐS FELADATOK' },
  },
};

// measure words by rendering them alone once (resvg gives the real bounding box)
function measure(text, size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="200"><text x="0" y="150" font-family="OG Archivo" font-size="${size}" letter-spacing="-2" fill="#fff">${esc(text)}</text></svg>`;
  const r = new Resvg(svg, { font: { fontFiles: fonts, loadSystemFonts: false } });
  const bbox = r.getBBox();
  return bbox ? bbox.x + bbox.width : text.length * size * 0.6;
}

fs.mkdirSync(out, { recursive: true });
for (const [id, def] of Object.entries(COPY)) {
  for (const L of ['en', 'hu']) {
    const d = def[L];
    // shrink the heading until the longest word fits the left column
    let size = 92;
    while (Math.max(...d.lines.map((l) => measure(l, size))) > 560 && size > 60) size -= 4;
    const widths = d.lines.map((l) => measure(l, size));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${frame()}${left({ ...d, size, widths })}${def.visual(L)}${monogram()}</svg>`;
    const png = new Resvg(svg, { font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'OG Inter' }, fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    fs.writeFileSync(path.join(out, `${id}.${L}.png`), png);
    console.log(id, L, size, png.length);
  }
}
