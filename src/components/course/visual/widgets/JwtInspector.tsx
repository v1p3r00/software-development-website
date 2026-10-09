import { useEffect, useState } from 'react';
import { Frame, Field, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

const SECRET = 'course-demo-secret-change-me-32-bytes!';
const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64json = (o: unknown) => b64url(enc.encode(JSON.stringify(o)));

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
}

const NOW = 1791000000;

export default function JwtInspector({ lang }: WidgetProps) {
  const t = tr(lang);
  const [sub, setSub] = useState('anna@example.com');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [exp, setExp] = useState(15);
  const [tamper, setTamper] = useState(false);
  const [sig, setSig] = useState('');
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub, role, iat: NOW, exp: NOW + exp * 60 };
  const signedPayload = b64json(payload);
  const shownPayload = tamper ? b64json({ ...payload, role: 'ADMIN' }) : signedPayload;
  const h = b64json(header);
  useEffect(() => {
    let live = true;
    if (crypto?.subtle) sign(`${h}.${signedPayload}`).then((s) => live && setSig(s));
    return () => {
      live = false;
    };
  }, [h, signedPayload]);
  const expired = exp <= 0;
  const valid = !tamper && !expired;
  return (
    <Frame lang={lang} title={t('Inside a JWT', 'Egy JWT belseje', 'Vnútro JWT')} hint={t('Edit the claims. The token is re-signed with HMAC-SHA256 — then try to cheat.', 'Módosítsd a claimeket. A token HMAC-SHA256-tal újra aláíródik — aztán próbálj csalni.', 'Uprav claimy. Token sa znova podpíše cez HMAC-SHA256 – potom skús podvádzať.')}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="sub">
          <input value={sub} onChange={(e) => setSub(e.target.value)} className="border border-line bg-bg px-2 py-1.5 font-mono text-[14px] text-text outline-none focus:border-accent" />
        </Field>
        <Field label="role">
          <Seg label="role" options={['USER', 'ADMIN'] as const} value={role} onChange={setRole} />
        </Field>
        <Field label={`exp: ${exp <= 0 ? t('expired', 'lejárt', 'vypršal') : t(`in ${exp} min`, `${exp} perc múlva`, `o ${exp} min`)}`}>
          <input className="vw-range" type="range" min={-5} max={60} value={exp} onChange={(e) => setExp(Number(e.target.value))} aria-label="expiry" />
        </Field>
      </div>
      <div className="mt-4 break-all border border-line bg-bg p-3 font-mono text-[13.5px] leading-relaxed">
        <span className="text-[#e5484d]">{h}</span>.<span className={tamper ? 'bg-[#e5484d]/20 text-[#d97706]' : 'text-[#7c5cff]'}>{shownPayload}</span>.<span className="text-[#0ea5e9]">{sig || '…'}</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="min-w-0 border border-line p-2.5">
          <div className="label mb-1 text-[#e5484d]">header</div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-text">{JSON.stringify(header, null, 1)}</pre>
        </div>
        <div className="min-w-0 border border-line p-2.5">
          <div className="label mb-1 text-[#7c5cff]">payload</div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-text">{JSON.stringify(tamper ? { ...payload, role: 'ADMIN' } : payload, null, 1)}</pre>
        </div>
        <div className="min-w-0 border border-line p-2.5">
          <div className="label mb-1 text-[#0ea5e9]">signature</div>
          <p className="font-mono text-[13px] leading-relaxed text-muted">HMACSHA256(base64url(header) + "." + base64url(payload), secret)</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[15px] text-muted">
          <input type="checkbox" checked={tamper} onChange={(e) => setTamper(e.target.checked)} className="accent-[rgb(var(--c-accent))]" />
          {t('Attacker edits the payload to role: "ADMIN" (without the secret)', 'Támadó a payloadot role: "ADMIN"-ra írja (titok nélkül)', 'Útočník prepíše payload na role: "ADMIN" (bez tajného kľúča)')}
        </label>
        <span className={'ml-auto border px-2.5 py-1 font-mono text-[13.5px] ' + (valid ? 'border-[#30a46c] text-[#30a46c]' : 'border-[#e5484d] text-[#e5484d]')}>
          {valid ? t('✓ server accepts: signature valid', '✓ a szerver elfogadja: az aláírás érvényes', '✓ server akceptuje: podpis je platný') : tamper ? t('✕ 401: signature does not match', '✕ 401: az aláírás nem egyezik', '✕ 401: podpis nesedí') : t('✕ 401: token expired', '✕ 401: lejárt token', '✕ 401: token vypršal')}
        </span>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{t('Anyone can decode a JWT — it is only Base64. Never put secrets in the payload; the signature only proves nobody changed it.', 'Bárki dekódolhat egy JWT-t — ez csak Base64. Soha ne tegyél titkot a payloadba; az aláírás csak azt bizonyítja, hogy senki nem módosította.', 'JWT dokáže dekódovať ktokoľvek – je to len Base64. Nikdy nedávaj do payloadu tajomstvá; podpis iba dokazuje, že ho nikto nezmenil.')}</p>
    </Frame>
  );
}
