import { useState } from 'react';
import { Frame, Field, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Case = 'ok' | 'missing' | 'invalid' | 'noauth';

const BODY = '{ "title": "Buy milk", "done": false }';

function respond(m: Method, c: Case): { status: number; text: string; headers: string[]; body: string; why: { en: string; hu: string } } {
  if (c === 'noauth') return { status: 401, text: 'Unauthorized', headers: ['WWW-Authenticate: Bearer'], body: '{ "error": "Login required" }', why: { en: 'No valid token was sent, so the server does not know who you are.', hu: 'Nem jött érvényes token, így a szerver nem tudja, ki vagy.' } };
  if (c === 'missing' && m !== 'POST') return { status: 404, text: 'Not Found', headers: ['Content-Type: application/json'], body: '{ "error": "Task 999 not found" }', why: { en: 'The URL points to a resource that does not exist.', hu: 'Az URL egy nem létező erőforrásra mutat.' } };
  if (c === 'invalid' && (m === 'POST' || m === 'PUT')) return { status: 400, text: 'Bad Request', headers: ['Content-Type: application/json'], body: '{ "error": "title must not be blank" }', why: { en: 'The request body failed validation — the client must fix it.', hu: 'A kérés törzse nem ment át az ellenőrzésen — a kliensnek kell javítania.' } };
  switch (m) {
    case 'GET':
      return { status: 200, text: 'OK', headers: ['Content-Type: application/json', 'Cache-Control: no-cache'], body: '{ "id": 42, "title": "Buy milk", "done": false }', why: { en: 'Reading is safe and idempotent: nothing changes on the server.', hu: 'Az olvasás biztonságos és idempotens: a szerveren semmi sem változik.' } };
    case 'POST':
      return { status: 201, text: 'Created', headers: ['Location: /api/tasks/43', 'Content-Type: application/json'], body: '{ "id": 43, "title": "Buy milk", "done": false }', why: { en: 'A new resource was created; Location tells you where it lives.', hu: 'Új erőforrás jött létre; a Location fejléc megmondja, hol érhető el.' } };
    case 'PUT':
      return { status: 200, text: 'OK', headers: ['Content-Type: application/json'], body: '{ "id": 42, "title": "Buy milk", "done": true }', why: { en: 'The whole resource was replaced. Sending the same PUT twice gives the same result.', hu: 'Az egész erőforrás lecserélődött. Ugyanaz a PUT kétszer is ugyanazt eredményezi.' } };
    default:
      return { status: 204, text: 'No Content', headers: [], body: '', why: { en: 'Deleted. There is nothing to send back, so the body is empty.', hu: 'Törölve. Nincs mit visszaküldeni, ezért üres a törzs.' } };
  }
}

const CLASSES = [
  { c: 2, en: '2xx success', hu: '2xx siker' },
  { c: 3, en: '3xx redirect', hu: '3xx átirányítás' },
  { c: 4, en: '4xx client error', hu: '4xx kliens hiba' },
  { c: 5, en: '5xx server error', hu: '5xx szerver hiba' },
];

export default function HttpExplorer({ lang }: WidgetProps) {
  const t = tr(lang);
  const [m, setM] = useState<Method>('GET');
  const [c, setC] = useState<Case>('ok');
  const id = m === 'POST' ? '' : c === 'missing' ? '/999' : '/42';
  const hasBody = m === 'POST' || m === 'PUT';
  const reqBody = c === 'invalid' && hasBody ? '{ "title": "", "done": false }' : BODY;
  const r = respond(m, c);
  const cls = Math.floor(r.status / 100);
  const req = [`${m} /api/tasks${id} HTTP/1.1`, 'Host: shop.example.com', ...(c === 'noauth' ? [] : ['Authorization: Bearer eyJhbGciOi…']), ...(hasBody ? ['Content-Type: application/json', '', reqBody] : [])].join('\n');
  const res = [`HTTP/1.1 ${r.status} ${r.text}`, ...r.headers, ...(r.body ? ['', r.body] : [])].join('\n');
  return (
    <Frame lang={lang} title={t('HTTP request & response explorer', 'HTTP kérés–válasz felfedező')} hint={t('Pick a method and a situation, and read what goes over the wire.', 'Válassz metódust és helyzetet, és nézd meg, mi megy át a hálózaton.')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('Method', 'Metódus')}>
          <Seg label="method" options={['GET', 'POST', 'PUT', 'DELETE'] as const} value={m} onChange={setM} />
        </Field>
        <Field label={t('Situation', 'Helyzet')}>
          <Seg
            label="case"
            value={c}
            onChange={setC}
            options={[
              { v: 'ok', l: t('Happy path', 'Minden rendben') },
              { v: 'missing', l: t('Unknown id', 'Ismeretlen id') },
              { v: 'invalid', l: t('Invalid body', 'Hibás törzs') },
              { v: 'noauth', l: t('Not logged in', 'Nincs belépve') },
            ]}
          />
        </Field>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <div className="label mb-1.5">→ {t('Request', 'Kérés')}</div>
          <pre className="vw-code min-h-[9.5rem]">{req}</pre>
        </div>
        <div className="min-w-0">
          <div className="label mb-1.5">← {t('Response', 'Válasz')}</div>
          <pre className="vw-code min-h-[9.5rem]">
            <span className={cls === 2 ? 'text-[#30a46c]' : 'text-[#e5484d]'}>{res.split('\n')[0]}</span>
            {'\n' + res.split('\n').slice(1).join('\n')}
          </pre>
        </div>
      </div>
      <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
        <span className="font-semibold text-text">{r.status} {r.text}:</span> {r.why[lang]}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {CLASSES.map((k) => (
          <span key={k.c} className={'border px-2 py-0.5 font-mono text-[12.5px] ' + (k.c === cls ? 'border-accent text-accent' : 'border-line text-dim')}>
            {k[lang]}
          </span>
        ))}
      </div>
    </Frame>
  );
}
