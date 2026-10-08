import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { stripLang } from '../../i18n/paths';
import { site } from '../../data/site';
import type { Lang } from '../../data/projects';
import { cx } from '../ui';
import { TEXT } from './text';
import type { Text } from './text';
import { faqs, popular } from './faq';
import type { Next } from './faq';
import { byKind, faqItem, itemById, search, tokens } from './knowledge';
import type { Item } from './knowledge';

/* ------------------------------------------------------------------ *
 * The site assistant: answers from the site's own content and a set   *
 * of prepared answers (no AI), and walks the visitor through a        *
 * project request that is mailed exactly like the contact form.       *
 * ------------------------------------------------------------------ */

type ShowWhat = 'services' | 'projects' | 'demos' | 'landings' | 'articles' | 'stack';

type Act =
  | { t: 'menu' }
  | { t: 'ask' }
  | { t: 'faq'; id: string }
  | { t: 'show'; what: ShowWhat }
  | { t: 'item'; id: string }
  | { t: 'order'; interest?: string }
  | { t: 'pick'; value: string }
  | { t: 'toggle'; value: string }
  | { t: 'skip' }
  | { t: 'done' }
  | { t: 'edit'; field?: Field }
  | { t: 'send' }
  | { t: 'cancel' }
  | { t: 'resume' }
  | { t: 'human' }
  | { t: 'href'; href: string };

interface Chip {
  label: string;
  act: Act;
  primary?: boolean;
  selected?: boolean;
}

interface Card {
  id: string;
  title: string;
  text: string;
  meta?: string;
  image?: string;
  path?: string;
  cta: string;
  /** "I want one like this" starts a request with this as the interest */
  like?: string;
}

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text?: string;
  cards?: Card[];
  link?: { href: string; label: string };
  /** a snapshot of the request when it was summarised */
  summary?: Order;
  tone?: 'ok' | 'error';
}

type Field = 'type' | 'url' | 'budget' | 'timeline' | 'features' | 'message' | 'name' | 'email' | 'contact' | 'phone';

interface Order {
  type?: string;
  url?: string;
  budget?: string;
  timeline?: string;
  features: string[];
  message?: string;
  name?: string;
  email?: string;
  contact?: string;
  phone?: string;
  interest: string[];
}

type Mode = { m: 'chat' } | { m: 'order'; step: Field | 'summary'; editing: boolean } | { m: 'human-q' } | { m: 'human-email'; question: string };

const EMPTY_ORDER: Order = { features: [], interest: [] };
const STORE = 'dm.support.v2';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** the order of the questions; the URL only for a modernization, the phone only if a call is wanted */
function nextStep(o: Order, from: Field | null, T: Text): Field | 'summary' {
  const all: Field[] = ['type', 'url', 'budget', 'timeline', 'features', 'message', 'name', 'email', 'contact', 'phone'];
  const skip = (f: Field) =>
    (f === 'url' && o.type !== T.order.types[3]) || (f === 'phone' && o.contact !== T.order.contactMethods[1] && o.contact !== T.order.contactMethods[2]);
  for (let i = from ? all.indexOf(from) + 1 : 0; i < all.length; i++) if (!skip(all[i])) return all[i];
  return 'summary';
}

const textSteps: Field[] = ['url', 'message', 'name', 'email', 'phone'];

export default function SupportPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, lp } = useI18n();
  const T = TEXT[lang];
  const { pathname } = useLocation();
  const path = stripLang(pathname);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [mode, setMode] = useState<Mode>({ m: 'chat' });
  const [order, setOrder] = useState<Order>(EMPTY_ORDER);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const idRef = useRef(1);
  const queue = useRef<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // the latest state for the async helpers
  const live = useRef({ mode, order, lang, msgs });
  live.current = { mode, order, lang, msgs };

  /* ---------- persistence (same tab only) ---------- */
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.sessionStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as { msgs: Msg[]; chips: Chip[]; mode: Mode; order: Order };
        if (s.msgs?.length) {
          setMsgs(s.msgs);
          setChips(s.chips ?? []);
          setMode(s.mode ?? { m: 'chat' });
          setOrder({ ...EMPTY_ORDER, ...s.order });
          idRef.current = Math.max(...s.msgs.map((m) => m.id)) + 1;
          return;
        }
      }
    } catch {
      /* private mode or a broken entry: start fresh */
    }
    greet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.slice(-80), chips, mode, order }));
    } catch {
      /* ignore */
    }
  }, [msgs, chips, mode, order]);

  // (pending replies are not cancelled on unmount: React's development double-mount would drop the greeting)

  /* ---------- scrolling, focus, keyboard ---------- */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
  }, [msgs, typing, chips]);
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      // phones: don't pop the keyboard over the conversation
      if (window.matchMedia('(min-width: 640px)').matches) inputRef.current?.focus();
      else panelRef.current?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  /* ---------- message helpers ---------- */
  const push = (m: Omit<Msg, 'id'>) => setMsgs((list) => [...list, { ...m, id: idRef.current++ }]);

  /** bot messages arrive one by one after a short "typing" pause */
  const say = useCallback((list: Omit<Msg, 'id'>[], nextChips: Chip[] = []) => {
    queue.current.forEach((t) => window.clearTimeout(t));
    queue.current = [];
    setChips([]);
    if (reduced()) {
      list.forEach(push);
      setChips(nextChips);
      return;
    }
    setTyping(true);
    let at = 0;
    list.forEach((m, i) => {
      const len = (m.text?.length ?? 60) + (m.cards ? 120 : 0);
      at += Math.min(900, 280 + len * 2.2) + (i ? 120 : 0);
      queue.current.push(
        window.setTimeout(() => {
          push(m);
          if (i === list.length - 1) {
            setTyping(false);
            setChips(nextChips);
          }
        }, at),
      );
    });
    if (!list.length) {
      setTyping(false);
      setChips(nextChips);
    }
  }, []);

  /** a text answer, split into bubbles at blank lines */
  const bubbles = (text: string): Omit<Msg, 'id'>[] =>
    text
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => ({ from: 'bot' as const, text: t }));

  /* ---------- cards ---------- */
  const card = useCallback(
    (it: Item): Card => {
      const cta = it.kind === 'article' ? T.read : it.kind === 'lab' || it.kind === 'landing' || it.kind === 'case' ? T.try : T.open;
      const like = it.kind === 'landing' || it.kind === 'lab' || it.kind === 'case' || it.kind === 'project' || it.kind === 'service' ? it.title : undefined;
      return { id: it.id, title: it.title, text: it.text, meta: it.meta, image: it.image, path: it.path, cta, like };
    },
    [T],
  );

  const menuChips = useCallback(
    (): Chip[] => [
      { label: T.menu.order, act: { t: 'order' }, primary: true },
      { label: T.menu.ask, act: { t: 'ask' } },
      { label: T.menu.price, act: { t: 'faq', id: 'price-website' } },
      { label: T.menu.demos, act: { t: 'faq', id: 'demos' } },
    ],
    [T],
  );

  /** a chip for every follow-up in a prepared answer */
  const nextChips = useCallback(
    (next: Next[] | undefined): Chip[] => {
      const out: Chip[] = [];
      for (const n of next ?? []) {
        if ('faq' in n) {
          const f = faqs.find((x) => x.id === n.faq);
          if (f) out.push({ label: f.q[lang], act: { t: 'faq', id: f.id } });
        } else if ('order' in n) {
          if (live.current.mode.m !== 'order') out.push({ label: T.menu.order, act: { t: 'order' }, primary: true });
        }
        else if ('show' in n) out.push({ label: T.show[n.show], act: { t: 'show', what: n.show } });
        else if ('href' in n) out.push({ label: n.label[lang], act: { t: 'href', href: n.href } });
        else if ('human' in n) out.push({ label: T.human, act: { t: 'human' } });
      }
      return out;
    },
    [T, lang],
  );

  /** chips that depend on the page the visitor is on */
  const contextChips = useCallback((): Chip[] => {
    const proj = path.match(/^\/project\/([^/]+)/);
    if (proj) return [{ label: T.context.project, act: { t: 'item', id: `project:${proj[1]}` } }];
    const land = path.match(/^\/landing-pages\/([^/]+)/);
    if (land) return [{ label: T.context.landing, act: { t: 'order', interest: itemById(lang, `landing:${land[1]}`)?.title } }];
    if (path.startsWith('/landing-pages')) return [{ label: T.show.landings, act: { t: 'show', what: 'landings' } }];
    if (path.startsWith('/modernization')) return [{ label: T.context.modernize, act: { t: 'faq', id: 'modernize' } }];
    if (path.startsWith('/course') || path.startsWith('/interview')) return [{ label: T.context.course, act: { t: 'faq', id: 'learning' } }];
    return [];
  }, [path, T, lang]);

  /* ---------- greeting ---------- */
  function greet() {
    const L = live.current.lang;
    const t = TEXT[L];
    say([{ from: 'bot', text: t.hello }, { from: 'bot', text: t.helloHere }], [...contextChips(), ...menuChips()]);
  }

  /* ---------- answering ---------- */
  const answerFaq = useCallback(
    (id: string, prefix: Omit<Msg, 'id'>[] = []) => {
      const it = faqItem(lang, id);
      if (!it?.faq) return;
      const f = it.faq;
      const list: Omit<Msg, 'id'>[] = [...prefix, ...bubbles(f.a[lang])];
      if (f.link) list.push({ from: 'bot', link: { href: f.link.href, label: f.link.label[lang] } });
      say(list, [...nextChips(f.next), ...followUps()]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, say, nextChips],
  );

  /** when a request is half done, offer to continue it under every answer */
  function followUps(): Chip[] {
    const m = live.current.mode;
    const t = TEXT[live.current.lang];
    if (m.m === 'order') return [{ label: t.order.resume, act: { t: 'resume' }, primary: true }, { label: t.order.cancel, act: { t: 'cancel' } }];
    return [{ label: t.anythingElse, act: { t: 'ask' } }];
  }

  const show = useCallback(
    (what: ShowWhat) => {
      const pick: Record<ShowWhat, () => Item[]> = {
        services: () => byKind(lang, 'service'),
        projects: () => byKind(lang, 'project').slice(0, 8),
        demos: () => byKind(lang, 'lab'),
        landings: () => byKind(lang, 'landing'),
        articles: () => byKind(lang, 'article').slice(0, 6),
        stack: () => [],
      };
      if (what === 'stack') return answerFaq('stack');
      const items = pick[what]();
      say([{ from: 'bot', text: T.showIntro[what] }, { from: 'bot', cards: items.map(card) }], [
        ...(what !== 'projects' ? [{ label: T.show.projects, act: { t: 'show', what: 'projects' } } as Chip] : []),
        ...(what !== 'demos' ? [{ label: T.show.demos, act: { t: 'show', what: 'demos' } } as Chip] : []),
        { label: T.menu.order, act: { t: 'order' }, primary: true },
        ...followUps(),
      ]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, T, say, card, answerFaq],
  );

  /** free text from the visitor, outside the request steps */
  const answerText = useCallback(
    (q: string) => {
      const qt = tokens(q);
      // "how much is a webshop / an app": the price answers cover every project type
      const PRICE = /^(ar|ara|arak|arat|aron|mennyibe|mennyi|kerul|kerulne|koltseg|koltsege|koltsegek|price|prices|pricing|cost|costs|much|budget|quote|fee|fees|rate|rates|draga|olcso|expensive|cheap)$/;
      const APP = /^(app|apps|application|webapp|alkalmazas|webalkalmazas|szoftver|software|system|rendszer|saas|portal|crm|erp|mvp|platform)/;
      if (qt.some((w) => PRICE.test(w)) && !(qt.includes('mennyi') && qt.some((w) => /^(ido|idot|het|honap)/.test(w)))) {
        return answerFaq(qt.some((w) => APP.test(w)) ? 'price-app' : 'price-website');
      }
      const hits = search(lang, q);
      const words = qt.length;
      const top = hits[0];
      // too little of the question was understood: better to hand it over than to answer something else
      if (!top || top.score < 1.2 || (words >= 3 && Math.max(...hits.slice(0, 5).map((h) => h.coverage)) < 0.4)) {
        say([{ from: 'bot', text: T.noMatch }], [{ label: T.human, act: { t: 'human' }, primary: true }, ...menuChips().slice(0, 3)]);
        return;
      }
      const confident = top.score >= Math.max(1.8, words * 0.8);
      const faqHit = hits.find((h) => h.item.kind === 'faq');
      const content = hits.filter((h) => h.item.kind !== 'faq' && h.score >= top.score * 0.45).slice(0, 4);
      const techHit = top.item.kind === 'tech' ? top.item : null;

      if (techHit) {
        say([{ from: 'bot', text: techHit.text }], [{ label: T.show.projects, act: { t: 'show', what: 'projects' } }, { label: T.menu.order, act: { t: 'order' }, primary: true }, ...followUps()]);
        return;
      }
      if (faqHit && (faqHit === top || faqHit.score >= top.score * 0.8) && faqHit.score >= 2 && (faqHit.coverage >= 0.5 || words <= 2)) {
        const f = faqHit.item.faq!;
        const list: Omit<Msg, 'id'>[] = bubbles(f.a[lang]);
        if (f.link) list.push({ from: 'bot', link: { href: f.link.href, label: f.link.label[lang] } });
        const related = content.filter((h) => h.score >= faqHit.score * 0.4).slice(0, 3);
        if (related.length) list.push({ from: 'bot', text: T.alsoRelevant }, { from: 'bot', cards: related.map((h) => card(h.item)) });
        say(list, [...nextChips(f.next), ...followUps()]);
        return;
      }
      if (confident && content.length) {
        say([{ from: 'bot', text: T.found }, { from: 'bot', cards: content.map((h) => card(h.item)) }], [
          { label: T.menu.order, act: { t: 'order' }, primary: true },
          { label: T.human, act: { t: 'human' } },
          ...followUps(),
        ]);
        return;
      }
      // not sure: offer the closest questions and pages
      const guesses = hits.slice(0, 4);
      say([{ from: 'bot', text: T.notSure }], [
        ...guesses.map((h): Chip => (h.item.kind === 'faq' ? { label: h.item.title, act: { t: 'faq', id: h.item.faq!.id } } : { label: h.item.title, act: { t: 'item', id: h.item.id } })),
        { label: T.human, act: { t: 'human' } },
      ]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, T, say, card, nextChips, menuChips],
  );

  const showItem = useCallback(
    (id: string) => {
      const it = itemById(lang, id);
      if (!it) return;
      const extra: Chip[] =
        it.kind === 'project'
          ? [{ label: T.context.similar, act: { t: 'order', interest: it.title }, primary: true }]
          : [{ label: T.menu.order, act: { t: 'order', interest: it.kind === 'article' ? undefined : it.title }, primary: true }];
      say([{ from: 'bot', cards: [card(it)] }], [...extra, ...followUps()]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, T, say, card],
  );

  /* ---------- the project request ---------- */
  const stepChips = useCallback(
    (step: Field | 'summary', o: Order): Chip[] => {
      const t = TEXT[live.current.lang].order;
      const skip: Chip = { label: t.skip, act: { t: 'skip' } };
      switch (step) {
        case 'type':
          return [...t.types.map((v) => ({ label: v, act: { t: 'pick', value: v } as Act, selected: o.type === v })), { label: t.cancel, act: { t: 'cancel' } }];
        case 'budget':
          return [...t.budgets.map((v) => ({ label: v, act: { t: 'pick', value: v } as Act, selected: o.budget === v })), skip];
        case 'timeline':
          return [...t.timelines.map((v) => ({ label: v, act: { t: 'pick', value: v } as Act, selected: o.timeline === v })), skip];
        case 'features':
          return [
            { label: `${t.done} ✓`, act: { t: 'done' }, primary: true },
            ...t.featureList.map((v) => ({ label: v, act: { t: 'toggle', value: v } as Act, selected: o.features.includes(v) })),
          ];
        case 'contact':
          return t.contactMethods.map((v) => ({ label: v, act: { t: 'pick', value: v }, selected: o.contact === v }));
        case 'url':
        case 'phone':
        case 'message':
          return [skip];
        case 'summary':
          return [
            { label: `${t.sendIt} ↵`, act: { t: 'send' }, primary: true },
            { label: t.edit, act: { t: 'edit' } },
            { label: t.cancel, act: { t: 'cancel' } },
          ];
        default:
          return [];
      }
    },
    [],
  );

  const ask = useCallback(
    (step: Field | 'summary', o: Order, editing = false, prefix: Omit<Msg, 'id'>[] = []) => {
      const t = TEXT[live.current.lang].order;
      setMode({ m: 'order', step, editing });
      if (step === 'summary') {
        say([...prefix, { from: 'bot', text: t.summary }, { from: 'bot', summary: { ...o, features: [...o.features], interest: [...o.interest] } }], stepChips('summary', o));
        return;
      }
      const q: Record<Field, string> = {
        type: t.type,
        url: t.url,
        budget: t.budget,
        timeline: t.timeline,
        features: t.features,
        message: t.message,
        name: t.name,
        email: t.email,
        contact: t.contactVia,
        phone: t.phone,
      };
      say([...prefix, { from: 'bot', text: q[step] }], stepChips(step, o));
    },
    [say, stepChips],
  );

  /** store an answer and move on (or back to the summary when editing) */
  const answer = useCallback(
    (step: Field, value: string | undefined, shown?: string) => {
      const t = TEXT[live.current.lang];
      const cur = live.current.order;
      const editing = live.current.mode.m === 'order' && live.current.mode.editing;
      if (step === 'email' && value && !EMAIL.test(value.trim())) {
        push({ from: 'user', text: value });
        say([{ from: 'bot', text: t.order.emailBad }], []);
        return;
      }
      if (shown !== '') push({ from: 'user', text: shown ?? value ?? t.order.skip });
      // the must-haves are collected by the toggles; Done only moves on
      const o: Order = step === 'features' ? cur : { ...cur, [step]: value?.trim() || undefined };
      setOrder(o);
      const next = editing ? 'summary' : nextStep(o, step, t);
      // a changed type can add or remove the URL question
      if (editing && step === 'type' && o.type === t.order.types[3] && !o.url) return ask('url', o, true);
      if (editing && step === 'contact' && (o.contact === t.order.contactMethods[1] || o.contact === t.order.contactMethods[2]) && !o.phone) return ask('phone', o, true);
      ask(next, o, editing);
    },
    [ask, say],
  );

  const startOrder = useCallback(
    (interest?: string) => {
      const t = TEXT[live.current.lang].order;
      const o: Order = { ...live.current.order, interest: [...live.current.order.interest] };
      if (interest && !o.interest.includes(interest)) o.interest.push(interest);
      setOrder(o);
      const intro: Omit<Msg, 'id'>[] = [{ from: 'bot', text: t.start }];
      if (interest) intro.push({ from: 'bot', text: `${t.interest} ${interest}.` });
      // already halfway through: carry on where it stopped
      const m = live.current.mode;
      if (m.m === 'order') return ask(m.step, o, m.editing, interest ? [{ from: 'bot', text: `${t.interest} ${interest}.` }] : []);
      ask(o.type ? nextStep(o, 'type', TEXT[live.current.lang]) : 'type', o, false, intro);
    },
    [ask],
  );

  const sendOrder = useCallback(async () => {
    const t = TEXT[live.current.lang];
    const o = live.current.order;
    if (!o.email || !EMAIL.test(o.email)) return ask('email', o, true);
    setSending(true);
    setChips([]);
    const ok = await post({
      subject: `Project request (site chat) — ${o.name || o.email}${o.type ? ` (${o.type}${o.budget ? ` · ${o.budget}` : ''})` : ''}`,
      name: o.name || '—',
      email: o.email,
      phone: o.phone || '—',
      preferred_contact: o.contact || '—',
      project_type: o.type || '—',
      current_site: o.url || '—',
      budget: o.budget || '—',
      timeline: o.timeline || '—',
      must_haves: o.features.join(', ') || '—',
      interested_in: o.interest.join(', ') || '—',
      message: o.message || '—',
      page: window.location.pathname,
      language: live.current.lang,
      chat_transcript: transcript(live.current.msgs),
      replyto: o.email,
    });
    setSending(false);
    if (ok) {
      setOrder(EMPTY_ORDER);
      setMode({ m: 'chat' });
      say([{ from: 'bot', text: t.order.sent, tone: 'ok' }], menuChips().slice(1));
    } else {
      say([{ from: 'bot', text: `${t.order.failed} ${site.email}`, tone: 'error' }], [
        { label: t.order.retry, act: { t: 'send' }, primary: true },
        { label: t.order.edit, act: { t: 'edit' } },
      ]);
    }
  }, [ask, say, menuChips]);

  const sendQuestion = useCallback(
    async (question: string, email: string) => {
      const t = TEXT[live.current.lang];
      setSending(true);
      const ok = await post({
        subject: `Question from the site chat — ${email}`,
        name: '—',
        email,
        message: question,
        page: window.location.pathname,
        language: live.current.lang,
        chat_transcript: transcript(live.current.msgs),
        replyto: email,
      });
      setSending(false);
      setMode({ m: 'chat' });
      if (ok) say([{ from: 'bot', text: t.humanSent, tone: 'ok' }], menuChips());
      else say([{ from: 'bot', text: `${t.order.failed} ${site.email}`, tone: 'error' }], menuChips());
    },
    [say, menuChips],
  );

  /* ---------- chips ---------- */
  const run = useCallback(
    (chip: Chip) => {
      const a = chip.act;
      const t = TEXT[live.current.lang];
      const m = live.current.mode;
      const o = live.current.order;
      switch (a.t) {
        case 'menu':
          push({ from: 'user', text: chip.label });
          return say([{ from: 'bot', text: t.helloHere }], [...contextChips(), ...menuChips()]);
        case 'ask':
          push({ from: 'user', text: chip.label });
          return say([{ from: 'bot', text: t.pickQuestion }], [
            ...popular.map((id) => {
              const f = faqs.find((x) => x.id === id)!;
              return { label: f.q[live.current.lang], act: { t: 'faq', id } as Act };
            }),
            ...(m.m === 'order' ? followUps() : []),
          ]);
        case 'faq':
          push({ from: 'user', text: chip.label });
          return answerFaq(a.id);
        case 'show':
          push({ from: 'user', text: chip.label });
          return show(a.what);
        case 'item':
          push({ from: 'user', text: chip.label });
          return showItem(a.id);
        case 'order':
          push({ from: 'user', text: chip.label });
          return startOrder(a.interest);
        case 'pick':
          if (m.m === 'order' && m.step !== 'summary') return answer(m.step, a.value);
          return;
        case 'toggle': {
          const features = o.features.includes(a.value) ? o.features.filter((f) => f !== a.value) : [...o.features, a.value];
          const next = { ...o, features };
          setOrder(next);
          setChips(stepChips('features', next));
          return;
        }
        case 'done':
          if (m.m === 'order') return answer('features', undefined, o.features.length ? o.features.join(', ') : t.order.skip);
          return;
        case 'skip':
          if (m.m === 'order' && m.step !== 'summary') return answer(m.step, undefined, t.order.skip);
          return;
        case 'edit':
          if (!a.field) {
            push({ from: 'user', text: chip.label });
            const fields: Field[] = ['type', ...(o.type === t.order.types[3] ? (['url'] as Field[]) : []), 'budget', 'timeline', 'features', 'message', 'name', 'email', 'contact', 'phone'];
            return say([], fields.map((f) => ({ label: t.order.labels[f], act: { t: 'edit', field: f } as Act })));
          }
          push({ from: 'user', text: `${t.order.edit}: ${t.order.labels[a.field]}` });
          return ask(a.field, o, true);
        case 'send':
          push({ from: 'user', text: chip.label.replace(' ↵', '') });
          return void sendOrder();
        case 'cancel':
          push({ from: 'user', text: chip.label });
          setOrder(EMPTY_ORDER);
          setMode({ m: 'chat' });
          return say([{ from: 'bot', text: t.order.cancelled }], menuChips());
        case 'resume':
          push({ from: 'user', text: chip.label });
          if (m.m === 'order') return ask(m.step, o, m.editing, [{ from: 'bot', text: t.order.inProgress }]);
          return startOrder();
        case 'human': {
          push({ from: 'user', text: chip.label });
          // the last thing the visitor typed is most likely the question
          const lastQ = [...live.current.msgs].reverse().find((x) => x.from === 'user' && x.text && x.text.length > 8 && !Object.values(t.menu).includes(x.text));
          if (lastQ?.text) {
            setMode({ m: 'human-email', question: lastQ.text });
            return say([{ from: 'bot', text: `“${lastQ.text}”` }, { from: 'bot', text: t.humanEmail }], []);
          }
          setMode({ m: 'human-q' });
          return say([{ from: 'bot', text: t.humanAsk }], []);
        }
        case 'href':
          return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say, answerFaq, show, showItem, startOrder, answer, ask, stepChips, sendOrder, contextChips, menuChips],
  );

  /* ---------- typed input ---------- */
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || typing || sending) return;
    setInput('');
    const m = live.current.mode;
    const t = TEXT[live.current.lang];
    if (m.m === 'human-q') {
      push({ from: 'user', text });
      setMode({ m: 'human-email', question: text });
      return say([{ from: 'bot', text: t.humanEmail }], []);
    }
    if (m.m === 'human-email') {
      push({ from: 'user', text });
      if (!EMAIL.test(text)) return say([{ from: 'bot', text: t.order.emailBad }], []);
      return void sendQuestion(m.question, text);
    }
    if (m.m === 'order' && m.step !== 'summary') {
      // a question typed mid-request is answered, then the request carries on
      const isQuestion = /\?\s*$/.test(text) && m.step !== 'email' && m.step !== 'phone' && m.step !== 'url';
      if (textSteps.includes(m.step) && !isQuestion) return answer(m.step, text);
      // a choice step: accept a typed option, otherwise treat it as a question
      const options = stepChips(m.step, live.current.order).filter((c) => c.act.t === 'pick' || c.act.t === 'toggle');
      const typed = options.find((c) => tokens(c.label).some((w) => tokens(text).includes(w)));
      if (typed && typed.act.t === 'pick') return answer(m.step, typed.act.value);
      if (typed && typed.act.t === 'toggle') return run(typed);
    }
    push({ from: 'user', text });
    // a request in plain words starts the order
    if (/^(.*\b(start|order|quote|offer|hire|ajanlat|arajanlat|megrendel|rendelnek|projektet|inditan))/.test(tokens(text).join(' ')) && m.m === 'chat') {
      return startOrder();
    }
    answerText(text);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit();
  };

  const restart = () => {
    queue.current.forEach((t) => window.clearTimeout(t));
    setTyping(false);
    setMsgs([]);
    setChips([]);
    setOrder(EMPTY_ORDER);
    setMode({ m: 'chat' });
    window.setTimeout(greet, 30);
  };

  /* ---------- rendering ---------- */
  const step = mode.m === 'order' && mode.step !== 'summary' ? mode.step : null;
  const progress = useMemo(() => {
    if (mode.m !== 'order') return null;
    const all: Array<Field | 'summary'> = [];
    let s: Field | 'summary' = 'type';
    const t = TEXT[lang];
    while (s !== 'summary' && all.length < 12) {
      all.push(s);
      s = nextStep(order, s, t);
    }
    all.push('summary');
    return { at: Math.max(0, all.indexOf(mode.step)) + 1, of: all.length };
  }, [mode, order, lang]);

  const placeholder = step && textSteps.includes(step) ? (step === 'url' ? T.order.urlPh : step === 'message' ? T.order.messagePh : T.placeholderAnswer) : mode.m === 'human-email' ? 'you@company.com' : T.placeholder;
  const inputType = step === 'email' || mode.m === 'human-email' ? 'email' : step === 'phone' ? 'tel' : 'text';

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={T.title}
      tabIndex={-1}
      hidden={!open}
      className={cx(
        // a utility like `flex` would override the hidden attribute, so the display follows `open` here
        open ? 'flex' : 'hidden',
        'support-panel fixed inset-0 z-[60] flex-col bg-bg outline-none sm:inset-auto sm:bottom-[92px] sm:right-6 sm:h-[min(640px,calc(100dvh-8.5rem))] sm:w-[392px] sm:border sm:border-line-strong sm:shadow-[0_30px_70px_-20px_rgb(0_0_0/0.55)]',
      )}
    >
      {/* corner marks, as on the site's frames */}
      <span aria-hidden className="support-plus left-[-6px] top-[-6px] hidden sm:block" />
      <span aria-hidden className="support-plus right-[-6px] top-[-6px] hidden sm:block" />

      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center border border-line-strong font-display text-[13px] font-extrabold text-text">
          DM
          <i className="absolute -bottom-px -right-px h-2 w-2 bg-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-tech text-accent">// support</p>
          <p className="truncate font-display text-[15px] font-extrabold uppercase leading-tight text-text">{T.title}</p>
          <p className="flex items-center gap-1.5 font-mono text-[10.5px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3ccf7a]" aria-hidden />
            {T.status}
          </p>
        </div>
        <button type="button" onClick={restart} title={T.restart} aria-label={T.restart} data-cursor="follow" className="grid h-8 w-8 place-items-center text-muted transition-colors hover:text-accent">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M2.5 8a5.5 5.5 0 1 0 1.7-4M2.5 2.5v3h3" />
          </svg>
        </button>
        <button type="button" onClick={onClose} title={T.close} aria-label={T.close} data-cursor="follow" className="grid h-8 w-8 place-items-center text-muted transition-colors hover:text-accent">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </header>

      {progress && (
        <div className="flex items-center gap-3 border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-tech text-muted">
          <span>
            {T.order.step} {progress.at}/{progress.of}
          </span>
          <span className="flex flex-1 gap-[3px]" aria-hidden>
            {Array.from({ length: progress.of }, (_, i) => (
              <i key={i} className={cx('h-1 flex-1', i < progress.at ? 'bg-accent' : 'bg-line-strong')} />
            ))}
          </span>
        </div>
      )}

      <div ref={listRef} className="support-list flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {msgs.map((m) => (
          <Message key={m.id} m={m} lang={lang} T={T} lp={lp} onLike={(title) => run({ label: T.like, act: { t: 'order', interest: title } })} onNavigate={() => window.matchMedia('(max-width: 639px)').matches && onClose()} />
        ))}
        {typing && (
          <div className="support-in flex w-fit gap-1 border border-line bg-surface px-3 py-2.5" aria-label="…">
            {[0, 1, 2].map((i) => (
              <i key={i} className="support-dot h-1.5 w-1.5 bg-muted" style={{ animationDelay: `${i * 160}ms` }} />
            ))}
          </div>
        )}
        {sending && <p className="font-mono text-[11px] uppercase tracking-tech text-muted">{T.order.sending}</p>}
      </div>

      {chips.length > 0 && (
        <div className="support-in flex max-h-[38%] flex-wrap gap-1.5 overflow-y-auto border-t border-line px-4 py-3">
          {chips.map((c, i) =>
            c.act.t === 'href' ? (
              <Link
                key={i}
                to={lp(c.act.href)}
                onClick={() => window.matchMedia('(max-width: 639px)').matches && onClose()}
                data-cursor="follow"
                className="support-chip"
              >
                {c.label} ↗
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => run(c)}
                aria-pressed={c.act.t === 'toggle' ? !!c.selected : undefined}
                data-cursor="follow"
                className={cx('support-chip', c.primary && 'support-chip-primary', c.selected && 'support-chip-on')}
              >
                {c.act.t === 'toggle' && <span aria-hidden className="mr-1.5 inline-block w-3">{c.selected ? '■' : '□'}</span>}
                {c.label}
              </button>
            ),
          )}
        </div>
      )}

      <form onSubmit={submit} className="border-t border-line px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
        <div className="flex items-center gap-2 border border-line-strong bg-surface px-3 focus-within:border-accent">
          <span className="font-mono text-[13px] text-accent" aria-hidden>
            &gt;
          </span>
          <input
            ref={inputRef}
            type={inputType}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete={step === 'email' ? 'email' : step === 'name' ? 'name' : step === 'phone' ? 'tel' : 'off'}
            enterKeyHint="send"
            maxLength={step === 'message' ? 1200 : 300}
            className="h-11 min-w-0 flex-1 bg-transparent font-mono text-[13.5px] text-text outline-none placeholder:text-dim"
          />
          <button type="submit" disabled={!input.trim() || typing || sending} aria-label={T.send} data-cursor="follow" className="grid h-8 w-8 place-items-center bg-accent text-onaccent transition-opacity disabled:opacity-30">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
            </svg>
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] leading-snug text-dim">{T.disclosure}</p>
      </form>
    </div>
  );
}

/* ---------- one message ---------- */

function Message({
  m,
  lang,
  T,
  lp,
  onLike,
  onNavigate,
}: {
  m: Msg;
  lang: Lang;
  T: Text;
  lp: (p: string) => string;
  onLike: (title: string) => void;
  onNavigate: () => void;
}) {
  if (m.from === 'user')
    return (
      <div className="support-in flex justify-end">
        <p className="max-w-[85%] whitespace-pre-line bg-accent px-3 py-2 text-[14px] leading-snug text-onaccent">{m.text}</p>
      </div>
    );
  if (m.cards)
    return (
      <div className="support-in -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1">
        {m.cards.map((c) => (
          <CardView key={c.id} c={c} T={T} lp={lp} onLike={onLike} onNavigate={onNavigate} single={m.cards!.length === 1} />
        ))}
      </div>
    );
  if (m.link)
    return (
      <Link to={lp(m.link.href)} onClick={onNavigate} data-cursor="follow" className="support-in group flex max-w-[90%] items-center gap-3 border border-line bg-surface px-3 py-2.5 transition-colors hover:border-accent">
        <span className="font-mono text-[10px] uppercase tracking-tech text-accent">{lang === 'hu' ? 'Cikk' : 'Article'}</span>
        <span className="flex-1 text-[13.5px] leading-snug text-text">{m.link.label}</span>
        <span className="font-mono text-[12px] text-muted transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    );
  if (m.summary && typeof m.summary === 'object') return <Summary order={m.summary} T={T} />;
  return (
    <div className="support-in flex">
      <p
        className={cx(
          'max-w-[88%] whitespace-pre-line border bg-surface px-3 py-2 text-[14px] leading-relaxed text-text',
          m.tone === 'ok' ? 'border-[#3ccf7a]/60' : m.tone === 'error' ? 'border-accent' : 'border-line',
        )}
      >
        {m.tone === 'ok' && <span className="mr-1.5 font-mono text-[#3ccf7a]">✓</span>}
        {m.text}
      </p>
    </div>
  );
}

function CardView({ c, T, lp, onLike, onNavigate, single }: { c: Card; T: Text; lp: (p: string) => string; onLike: (t: string) => void; onNavigate: () => void; single: boolean }) {
  const href = c.path ? (c.path.startsWith('/#') ? `${lp('/')}${c.path.slice(1)}` : lp(c.path)) : undefined;
  return (
    <article className={cx('flex shrink-0 snap-start flex-col border border-line bg-surface', single ? 'w-[88%]' : 'w-[230px]')}>
      {c.image ? (
        <img src={c.image} alt="" loading="lazy" decoding="async" className="aspect-[16/9] w-full border-b border-line object-cover" />
      ) : (
        <div className="support-cardart aspect-[16/6] w-full border-b border-line" aria-hidden />
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {c.meta && <p className="font-mono text-[9.5px] uppercase tracking-tech text-accent">{c.meta}</p>}
        <h4 className="font-display text-[14px] font-extrabold leading-tight text-text">{c.title}</h4>
        <p className="line-clamp-3 text-[12.5px] leading-snug text-muted">{c.text}</p>
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1.5">
          {href && (
            <Link to={href} onClick={onNavigate} data-cursor="follow" className="font-mono text-[11px] uppercase tracking-tech text-text underline-offset-4 hover:text-accent hover:underline">
              {c.cta} ↗
            </Link>
          )}
          {c.like && (
            <button type="button" onClick={() => onLike(c.like!)} data-cursor="follow" className="font-mono text-[11px] uppercase tracking-tech text-accent underline-offset-4 hover:underline">
              {T.like} →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Summary({ order, T }: { order: Order; T: Text }) {
  const L = T.order.labels;
  const rows: Array<[string, string | undefined]> = [
    [L.type, order.type],
    [L.url, order.url],
    [L.budget, order.budget],
    [L.timeline, order.timeline],
    [L.features, order.features.join(', ') || undefined],
    [L.interest, order.interest.join(', ') || undefined],
    [L.message, order.message],
    [L.name, order.name],
    [L.email, order.email],
    [L.contact, order.contact],
    [L.phone, order.phone],
  ];
  return (
    <div className="support-in border border-line-strong bg-surface p-3 font-mono text-[12px] leading-relaxed">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="shrink-0 text-accent">&gt;</span>
            <span className="w-[92px] shrink-0 text-muted">{k}</span>
            <span className="min-w-0 break-words text-text">{v}</span>
          </div>
        ))}
    </div>
  );
}

/* ---------- sending ---------- */

function transcript(msgs: Msg[]): string {
  return msgs
    .filter((m) => m.text)
    .map((m) => `${m.from === 'user' ? 'Visitor' : 'Bot'}: ${m.text}`)
    .join('\n')
    .slice(-6000);
}

async function post(fields: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(site.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: site.formAccessKey, from_name: 'softwaredevelopment.hu · chat', ...fields }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
    return res.ok && String(data.success) === 'true';
  } catch {
    return false;
  }
}

