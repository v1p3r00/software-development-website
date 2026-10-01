// Turns the raw question-set text (the ### Q / ###END format) into the JSON the
// interview page loads:  node scripts/interview/parse.mjs javascript
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
// node parse.mjs [track…]  (no argument: every track in raw/)
const wanted = process.argv.slice(2);
const all = [...new Set(fs.readdirSync(path.join(here, 'raw')).map((f) => f.split('.')[0]))];
const out = path.resolve(here, '../../src/data/interview');
fs.mkdirSync(out, { recursive: true });

const LEVELS = ['junior', 'medior', 'senior'];

// the free-form TOPIC lines grouped into a few areas (first match wins); labels in src/data/interview
const AREAS = [
  ['security', /xss|cors|csrf|samesite|security|content security|pollution|crypto|secure|postmessage/],
  ['storage', /storage|cookie|indexeddb/],
  ['eventloop', /event loop|microtask|rendering/],
  ['memory', /memory|garbage|weakref|leak|retention|cache/],
  ['debugging', /test|debug|production/],
  ['patterns', /pattern|strategy|architecture|resilience|middleware/],
  ['typescript', /typescript/],
  ['async', /promise|async|await|abort|cancel|race|concurren|retry|idempot|dedup|backoff/],
  ['performance', /performance|debounc|throttl|memoiz/],
  ['browser', /fetch|worker|broadcast|observer|structured|service/],
  ['dom', /dom|event/],
  ['modules', /module|import/],
  ['iterators', /iterator|generator/],
  ['errors', /error/],
  ['syntax', /functional|immutab/],
  ['types', /coercion|==|equality|primitive|object\.is|toprimitive|reference|typeof/],
  ['objects', /object|prototype|class|inherit|getter|setter|propert|proxy|symbol/],
  ['collections', /array|reduce|map|set|spread|rest|destructuring/],
  ['functions', /closure|function|this|call|apply|bind|arrow/],
  ['scope', /hoisting|scope|var|let|const/],
];
// the JavaScript set has free-form topics; the later sets use a fixed topic list, which is the area
const areaOfJs = (topic) => AREAS.find(([, re]) => re.test(topic.toLowerCase()))?.[0] ?? 'syntax';

// stray spellings of a listed topic
const TOPIC_ALIASES = { Terraform: 'Infrastructure as Code (Terraform)', 'Test plans & test cases': 'Test cases & test plans' };

function parse(text, lang, track) {
  const areaOf = (topic) => (track === 'javascript' ? areaOfJs(topic) : TOPIC_ALIASES[topic] ?? topic);
  // a block runs from its '### Qn' header to '###END' (or, when that line was left out, to the next header)
  const blocks = text
    .split(/(?=^### Q\d+)/m)
    .map((b) => (b.includes('###END') ? b.slice(0, b.indexOf('###END')) : b.replace(/\n```[\s\S]*$/, '')).trim())
    .filter((b) => /^### Q\d+/.test(b));
  const qs = [];
  const seen = new Set();
  for (const raw of blocks) {
    const b = raw
      .replace(/^(?:KÉRDÉS|Kérdés|Question):/m, 'QUESTION:')
      .replace(/^(?:VÁLASZ|HELYES VÁLASZ|Helyes válasz|Answer):/m, 'ANSWER:')
      // a fenced listing instead of CODE:/ENDCODE
      .replace(/^```[\w-]*[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, 'CODE:\n$1\nENDCODE');
    const id = Number(b.match(/^### Q(\d+)/)[1]);
    if (seen.has(id)) continue; // ChatGPT sometimes repeats a block when a part is continued
    seen.add(id);
    const field = (name) => b.match(new RegExp(`^${name}:[ \\t]*(.*)$`, 'm'))?.[1].trim() ?? '';
    // between QUESTION: and the options: the question text, then one or more code blocks,
    // possibly with a sentence between them ("Suppose another module imports it:")
    const body = b.match(/^QUESTION:[ \t]*([\s\S]*?)(?=^A\))/m)?.[1] ?? '';
    const parts = body.split(/^CODE:[ \t]*\n([\s\S]*?)\n^ENDCODE[ \t]*$/m);
    let question = parts[0].trim();
    const codeParts = [];
    for (let i = 1; i < parts.length; i += 2) {
      codeParts.push(parts[i].replace(/\s+$/, ''));
      const between = (parts[i + 1] ?? '').trim();
      if (!between) continue;
      // text after the last listing is part of the question; text between listings becomes a comment
      if (i + 2 >= parts.length) question = `${question}\n${between}`.trim();
      else codeParts.push(between.split('\n').map((l) => `// ${l}`).join('\n'));
    }
    const code = codeParts.length ? codeParts.join('\n\n') : undefined;
    // options may span lines, and an option can be a whole listing (CODE: … ENDCODE)
    const region = b.match(/^A\)[\s\S]*?(?=^ANSWER:)/m)?.[0] ?? '';
    const options = ['A', 'B', 'C', 'D'].map((l) => {
      const part = region.split(/^(?=[A-D]\))/m).find((p) => p.startsWith(`${l})`)) ?? '';
      return part
        .slice(2)
        .replace(/^CODE:[ \t]*\n([\s\S]*?)\n^ENDCODE[ \t]*$/m, '$1')
        .replace(/^\s*\n/, '')
        .trimEnd()
        .replace(/^[ \t]+(?=\S)/, '');
    });
    const explanation = (b.match(/^EXPLANATION:[ \t]*([\s\S]*)$/m)?.[1] ?? '').replace(/^NOTE:.*$/gm, '').trim();
    const answer = 'ABCD'.indexOf(field('ANSWER').charAt(0));
    const level = field('LEVEL').toLowerCase();
    // letters named in the explanation pin the options to their authored order
    const fixed = /(?:\b(?:[Aa]z?|[Tt]he|[Oo]ption|[Aa]nswer|[Vv]álasz|[Oo]pció)\s+[A-D]\b|\b[A-D]\)|\b[A-D][-‑ ]?(?:válasz|opció|option|answer)\b)/.test(explanation);
    const topic = field('TOPIC');
    const q = { id, level, area: areaOf(topic), topic, type: field('TYPE').toLowerCase(), question, ...(code ? { code } : {}), options, answer, explanation, ...(fixed ? { fixed: true } : {}) };
    const problems = [];
    if (!LEVELS.includes(level)) problems.push(`level "${level}"`);
    if (!question) problems.push('no question');
    if (options.some((o) => !o)) problems.push('missing option');
    if (answer < 0) problems.push('no answer');
    if (!explanation) problems.push('no explanation');
    const accents = (question + explanation).match(/[őűáéíóú]/g)?.length ?? 0;
    if (lang === 'en' && accents > 6) problems.push('looks Hungarian');
    if (lang === 'hu' && accents < 3) problems.push('looks English');
    if (problems.length) console.warn(`[${lang}] Q${id}: ${problems.join(', ')}`);
    qs.push(q);
  }
  return qs.sort((a, b) => a.id - b.id);
}

function run(track) {
  const sets = {};
  for (const lang of ['hu', 'en']) {
    const file = path.join(here, 'raw', `${track}.${lang}.txt`);
    if (!fs.existsSync(file)) continue;
    sets[lang] = parse(fs.readFileSync(file, 'utf8'), lang, track);
  }

  // the languages must describe the same questions, with the same right answer and the same code
  if (sets.hu && sets.en) {
    const en = new Map(sets.en.map((q) => [q.id, q]));
    for (const q of sets.hu) {
      const e = en.get(q.id);
      if (!e) { console.warn(`Q${q.id}: missing in en`); continue; }
      if (e.answer !== q.answer) console.warn(`Q${q.id}: answer differs (hu ${q.answer}, en ${e.answer})`);
      if ((e.code ?? '') !== (q.code ?? '')) console.warn(`Q${q.id}: code differs between languages`);
      e.level = q.level; e.type = q.type; e.area = q.area;
      // the option order is shared, so a letter reference in either language pins it in both
      if (e.fixed || q.fixed) e.fixed = q.fixed = true;
    }
  }

  for (const [lang, qs] of Object.entries(sets)) {
    fs.writeFileSync(path.join(out, `${track}.${lang}.json`), JSON.stringify(qs, null, 1) + '\n');
    const dist = [0, 0, 0, 0];
    qs.forEach((q) => dist[q.answer]++);
    const lv = Object.fromEntries(LEVELS.map((l) => [l, qs.filter((q) => q.level === l).length]));
    const ids = qs.map((q) => q.id);
    const gaps = [];
    for (let i = 1; i <= Math.max(...ids); i++) if (!ids.includes(i)) gaps.push(i);
    console.log(`${track}.${lang}: ${qs.length} questions, answers A/B/C/D ${dist.join('/')}, levels ${JSON.stringify(lv)}${gaps.length ? `, missing ${gaps.join(',')}` : ''}`);
  }
}

for (const track of wanted.length ? wanted : all) run(track);
