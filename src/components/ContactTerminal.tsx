import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { Section, SectionHeader, cx } from './ui';

type Field = 'name' | 'email' | 'phone' | 'company' | 'project';
type Choice = 'contact' | 'meeting' | 'type' | 'budget' | 'timeline' | 'source';
const EMPTY = { name: '', email: '', phone: '', company: '', project: '' };
const NO_CHOICES: Record<Choice, string> = { contact: '', meeting: '', type: '', budget: '', timeline: '', source: '' };
const CALL_HOURS = { from: '09:00', to: '17:00' };
// at least seven digits, allowing the usual + ( ) - / and spaces
const PHONE = /^\+?[\d\s()\-/]{7,20}$/;
type Errors = Partial<Record<Field, string>>;

/** phones get the form as a short survey: one question per screen, big tap targets */
const PHONE_QUERY = '(max-width: 767px)';
function usePhoneLayout() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}
/** survey steps: type, budget, timeline, project, contact method, details, review */
const STEPS = 7;
const STEP_OF: Partial<Record<Field, number>> = { project: 3, name: 5, email: 5, phone: 5 };

function useTypewriter(text: string, enabled: boolean) {
  const [out, setOut] = useState(enabled ? '' : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 34);
    return () => window.clearInterval(id);
  }, [text, enabled]);
  return out;
}

export default function ContactTerminal() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [values, setValues] = useState(EMPTY);
  const [choices, setChoices] = useState(NO_CHOICES);
  const [callHours, setCallHours] = useState(CALL_HOURS);
  const wantsCall = choices.contact !== '' && choices.contact === t.contact.contactMethods[1];
  const wantsMeeting = choices.contact !== '' && choices.contact === t.contact.contactMethods[2];
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [honey, setHoney] = useState('');
  const [visible, setVisible] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const phone = usePhoneLayout();
  const [step, setStep] = useState(0);
  const sv = t.contact.survey;

  // on phones the chat button would sit on the survey's buttons: it steps aside while the form is on screen
  useEffect(() => {
    const el = boxRef.current;
    if (!phone || !el) return;
    const io = new IntersectionObserver(([e]) => document.body.classList.toggle('contact-in-view', e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => {
      io.disconnect();
      document.body.classList.remove('contact-in-view');
    };
  }, [phone]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const boot = useTypewriter(`${t.contact.boot}...`, visible && !reduced);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t.contact.errorName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t.contact.errorEmail;
    if (values.phone.trim() ? !PHONE.test(values.phone.trim()) : wantsCall) next.phone = t.contact.errorPhone;
    if (values.project.trim().length < 8) next.project = t.contact.errorProject;
    return next;
  };
  // a field is checked when the visitor leaves it (only if something was typed), not while typing
  const onBlurField = (field: Field) => () => {
    if (!values[field].trim()) return;
    const msg = validate()[field];
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      // take the visitor straight to the first thing to fix
      const first = (['name', 'email', 'phone', 'company', 'project'] as Field[]).find((f) => next[f]);
      // in the survey, go back to the screen that holds it
      if (phone && first && STEP_OF[first] !== undefined) setStep(STEP_OF[first]!);
      if (first) window.setTimeout(() => document.getElementById(`contact-${first}`)?.focus(), phone ? 60 : 0);
      return;
    }

    // bots fill the hidden field; pretend it worked and send nothing
    if (honey) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: site.formAccessKey,
          from_name: 'softwaredevelopment.hu',
          name: values.name,
          email: values.email,
          phone: values.phone.trim() || '—',
          preferred_contact: choices.contact || '—',
          call_hours: wantsCall ? `${callHours.from}–${callHours.to}` : '—',
          meeting: wantsMeeting ? choices.meeting || '—' : '—',
          company: values.company || '—',
          project_type: choices.type || '—',
          budget: choices.budget || '—',
          timeline: choices.timeline || '—',
          heard_via: choices.source || '—',
          message: values.project,
          subject: `Project enquiry — ${values.name}${choices.type ? ` (${choices.type})` : ''}`,
          replyto: values.email,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(data.success) !== 'true') {
        setStatus('error');
        return;
      }
      setStatus('sent');
      setStep(0);
      setValues(EMPTY);
      setChoices(NO_CHOICES);
      setCallHours(CALL_HOURS);
    } catch {
      setStatus('error');
    }
  };

  /** A row of toggle chips; picking the selected one again clears it. */
  const choice = (key: Choice, label: string, options: readonly string[], wideLabel = false) => (
    // the fieldset itself is the flex container: <legend> has to be its first child.
    // A floated legend is laid out like any other child, so flex still applies.
    <fieldset
      className={cx(
        '-mx-3 flex flex-col gap-2 border-b border-line px-3 py-2',
        !wideLabel && 'sm:flex-row sm:items-start sm:gap-3',
      )}
    >
        <legend
          className={cx(
            'float-left mt-1.5 shrink-0 font-mono text-[12px] font-semibold uppercase tracking-tech text-text',
            !wideLabel && 'sm:w-[7rem]',
          )}
        >
          {/[?:]$/.test(label) ? label : `${label}:`}
        </legend>
        <div className="flex flex-wrap gap-1">
          {options.map((option) => {
            const on = choices[key] === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                data-cursor="follow"
                onClick={() => setChoices((c) => ({ ...c, [key]: on ? '' : option }))}
                className={cx(
                  'chip',
                  on ? 'border-accent bg-accent text-onaccent' : 'chip-off',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
    </fieldset>
  );

  const field = (name: Field, label: string, placeholder: string, textarea = false) => {
    const id = `contact-${name}`;
    const invalid = Boolean(errors[name]);
    const shared = {
      id,
      name,
      value: values[name],
      onChange: set(name),
      onBlur: onBlurField(name),
      placeholder,
      autoComplete: ({ name: 'name', email: 'email', phone: 'tel', company: 'organization', project: 'off' } as const)[name],
      'aria-invalid': invalid,
      'aria-describedby': invalid ? `${id}-error` : undefined,
      className: cx(
        'w-full resize-none border-0 bg-transparent px-0 py-1 font-mono text-base text-text placeholder:text-dim focus:outline-none',
      ),
    };
    return (
      <div className="-mx-3 border-b border-line border-l-2 border-l-transparent px-3 py-2 transition-colors focus-within:border-l-accent focus-within:bg-accent/5">
        <div className="flex items-start gap-3">
          <label
            htmlFor={id}
            className={cx(
              'mt-1.5 shrink-0 font-mono text-[12px] font-semibold uppercase tracking-tech',
              invalid ? 'text-accent' : 'text-text',
            )}
          >
            {label}:
          </label>
          {textarea ? (
            <textarea rows={2} {...shared} />
          ) : (
            <input
              type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
              inputMode={name === 'phone' ? 'tel' : undefined}
              {...shared}
            />
          )}
        </div>
        {invalid && (
          <p id={`${id}-error`} role="alert" className="mt-1 pl-1 font-mono text-2xs tracking-tech text-accent">
            ! {errors[name]}
          </p>
        )}
      </div>
    );
  };

  /* ---------- the phone survey ---------- */

  // keep the survey card in view when its height changes from one screen to the next
  const goStep = (n: number) => {
    setStep(n);
    window.requestAnimationFrame(() => {
      const top = boxRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.4) boxRef.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    });
  };
  const stepErrors = (n: number): Errors => {
    const all = validate();
    return Object.fromEntries(Object.entries(all).filter(([f]) => STEP_OF[f as Field] === n)) as Errors;
  };
  const next = () => {
    const errs = stepErrors(step);
    if (Object.keys(errs).length) {
      setErrors((prev) => ({ ...prev, ...errs }));
      const first = (['name', 'email', 'phone', 'project'] as Field[]).find((f) => errs[f]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    goStep(Math.min(STEPS - 1, step + 1));
  };
  /** one tap answers the question and moves on (tapping the chosen one again clears it) */
  const pick = (key: Choice, option: string, advance: boolean) => {
    const on = choices[key] === option;
    setChoices((c) => ({ ...c, [key]: on ? '' : option }));
    if (!on && advance) window.setTimeout(() => goStep(step + 1), reduced ? 0 : 220);
  };
  const options = (key: Choice, list: readonly string[], advance: boolean) => (
    <div role="radiogroup" className="grid grid-cols-1 gap-2">
      {list.map((option) => {
        const on = choices[key] === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => pick(key, option, advance)}
            className={cx(
              'flex min-h-[52px] w-full items-center justify-between gap-3 border px-4 py-3 text-left text-[15px] transition-colors',
              on ? 'border-accent bg-accent/10 text-text' : 'border-line bg-bg text-text active:border-line-strong',
            )}
          >
            {option}
            <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border', on ? 'border-accent bg-accent text-onaccent' : 'border-line-strong')}>
              {on && (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
  const input = (name: Field, label: string, placeholder: string, textarea = false) => {
    const id = `contact-${name}`;
    const invalid = Boolean(errors[name]);
    const shared = {
      id,
      name,
      value: values[name],
      onChange: set(name),
      onBlur: onBlurField(name),
      placeholder,
      autoComplete: ({ name: 'name', email: 'email', phone: 'tel', company: 'organization', project: 'off' } as const)[name],
      'aria-invalid': invalid,
      'aria-describedby': invalid ? `${id}-error` : undefined,
      className: cx(
        'w-full border bg-bg px-3.5 py-3 text-base text-text placeholder:text-dim focus:border-accent focus:outline-none',
        invalid ? 'border-accent' : 'border-line',
        textarea && 'min-h-[132px] resize-none',
      ),
    };
    return (
      <div>
        <label htmlFor={id} className={cx('mb-1.5 block font-mono text-[11.5px] font-semibold uppercase tracking-tech', invalid ? 'text-accent' : 'text-muted')}>
          {label}
        </label>
        {textarea ? (
          <textarea rows={5} {...shared} />
        ) : (
          <input
            type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
            inputMode={name === 'phone' ? 'tel' : name === 'email' ? 'email' : undefined}
            enterKeyHint="next"
            {...shared}
          />
        )}
        {invalid && (
          <p id={`${id}-error`} role="alert" className="mt-1.5 font-mono text-2xs tracking-tech text-accent">
            ! {errors[name]}
          </p>
        )}
      </div>
    );
  };
  const summary: [string, string, number][] = [
    [t.contact.typeLabel, choices.type, 0],
    [t.contact.budgetLabel, choices.budget, 1],
    [t.contact.timelineLabel, choices.timeline, 2],
    [t.contact.project, values.project, 3],
    [t.contact.contactLabel, [choices.contact, wantsCall ? `${callHours.from}–${callHours.to}` : '', wantsMeeting ? choices.meeting : ''].filter(Boolean).join(' · '), 4],
    [t.contact.name, [values.name, values.email, values.phone, values.company].filter((v) => v.trim()).join(' · '), 5],
  ];

  const survey = (
    <form onSubmit={submit} noValidate className="contact-survey">
      <input
        type="text"
        name="_honey"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        aria-label="Leave this field empty"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      {status === 'sent' ? (
        <div className="py-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-onaccent">
            <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
          </span>
          <p role="status" className="mt-4 text-[16px] font-semibold text-text">
            {t.contact.sent}
          </p>
          <p className="mt-1.5 text-[13px] text-muted">{t.contact.replyTime}</p>
          <button type="button" onClick={() => setStatus('idle')} className="mt-5 border border-line-strong px-4 py-2.5 font-mono text-[12px] uppercase tracking-tech text-text">
            {sv.start}
          </button>
        </div>
      ) : (
        <>
          {/* progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tech text-muted">
              <span>{sv.step.replace('{n}', String(step + 1)).replace('{total}', String(STEPS))}</span>
              {step <= 2 && (
                <button type="button" onClick={() => goStep(step + 1)} className="-my-2 py-2 pl-3 text-muted underline-offset-4 active:text-text">
                  {sv.skip} →
                </button>
              )}
            </div>
            <div className="mt-2 h-1 overflow-hidden bg-line" aria-hidden>
              <div className="h-full bg-accent transition-[width] duration-500 ease-tech" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
            </div>
          </div>

          <div key={step} className="contact-step">
            <h3 className="font-display text-[1.45rem] font-extrabold leading-tight tracking-tight text-text">{sv.steps[step]}</h3>
            {sv.hints[step] && <p className="mt-1 text-[13.5px] leading-snug text-muted">{sv.hints[step]}</p>}

            <div className="mt-4 space-y-3">
              {step === 0 && options('type', t.contact.types, true)}
              {step === 1 && options('budget', t.contact.budgets, true)}
              {step === 2 && options('timeline', t.contact.timelines, true)}
              {step === 3 && input('project', t.contact.project, t.contact.projectPh, true)}
              {step === 4 && (
                <>
                  {options('contact', t.contact.contactMethods, false)}
                  {wantsMeeting && (
                    <div className="pt-2">
                      <p className="mb-2 font-mono text-[11.5px] font-semibold uppercase tracking-tech text-muted">{t.contact.meetingLabel}</p>
                      {options('meeting', t.contact.meetings, false)}
                    </div>
                  )}
                  {wantsCall && (
                    <div className="pt-2">
                      <p className="mb-2 font-mono text-[11.5px] font-semibold uppercase tracking-tech text-muted">{t.contact.callLabel}</p>
                      <div className="flex items-center gap-2">
                        {(['from', 'to'] as const).map((edge, i) => (
                          <span key={edge} className="flex flex-1 items-center gap-2">
                            {i === 1 && <span className="text-dim">–</span>}
                            <input
                              type="time"
                              step={900}
                              value={callHours[edge]}
                              onChange={(e) => setCallHours((h) => ({ ...h, [edge]: e.target.value }))}
                              aria-label={`${t.contact.callLabel} ${edge === 'from' ? t.contact.callFrom : t.contact.callTo}`}
                              className="time-input w-full border border-line bg-bg px-3 py-3 text-base text-text focus:border-accent focus:outline-none"
                            />
                          </span>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[12px] text-dim">{t.contact.callHint}</p>
                    </div>
                  )}
                </>
              )}
              {step === 5 && (
                <>
                  {input('name', t.contact.name, t.contact.namePh)}
                  {input('email', t.contact.email, t.contact.emailPh)}
                  {input('phone', t.contact.phone, t.contact.phonePh)}
                  {input('company', t.contact.company, t.contact.companyPh)}
                </>
              )}
              {step === 6 && (
                <>
                  <dl className="divide-y divide-line border border-line">
                    {summary.map(([k, v, at]) => (
                      <div key={k} className="flex items-start gap-3 px-3.5 py-2.5">
                        <div className="min-w-0 flex-1">
                          <dt className="font-mono text-[10.5px] uppercase tracking-tech text-muted">{k}</dt>
                          <dd className={cx('mt-0.5 line-clamp-3 text-[14px] leading-snug', v ? 'text-text' : 'text-dim')}>{v || '—'}</dd>
                        </div>
                        <button type="button" onClick={() => goStep(at)} className="-my-1 shrink-0 py-1 font-mono text-[11px] uppercase tracking-tech text-accent">
                          {sv.edit}
                        </button>
                      </div>
                    ))}
                  </dl>
                  <div className="pt-1">
                    <p className="mb-2 font-mono text-[11.5px] font-semibold uppercase tracking-tech text-muted">{sv.sourceShort}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.contact.sources.map((o) => {
                        const on = choices.source === o;
                        return (
                          <button
                            key={o}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setChoices((c) => ({ ...c, source: on ? '' : o }))}
                            className={cx('min-h-[40px] border px-3.5 py-2 text-[14px]', on ? 'border-accent bg-accent text-onaccent' : 'border-line text-text')}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* navigation */}
          <div className="mt-5 flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={() => goStep(step - 1)} className="min-h-[52px] border border-line-strong px-4 font-mono text-[13px] uppercase tracking-tech text-text">
                ← {sv.back}
              </button>
            )}
            {step < STEPS - 1 ? (
              <button type="button" onClick={next} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 bg-accent px-5 font-mono text-[14px] font-semibold uppercase tracking-tech text-onaccent">
                {sv.next} <span aria-hidden>→</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex min-h-[52px] flex-1 items-center justify-center gap-2 bg-accent px-5 font-mono text-[14px] font-semibold uppercase tracking-tech text-onaccent disabled:opacity-70"
              >
                {status === 'sending' ? `${t.contact.sending}…` : t.contact.send} <span aria-hidden>→</span>
              </button>
            )}
          </div>
          {status === 'error' && (
            <p role="status" className="mt-3 text-[13px] text-muted">
              ! {t.contact.error}{' '}
              <a href={`mailto:${site.email}`} className="text-accent underline underline-offset-2">
                {site.email}
              </a>
            </p>
          )}
        </>
      )}
    </form>
  );

  return (
    <Section id="contact">
      <SectionHeader index={t.contact.index} title={t.contact.title} subtitle={t.contact.subtitle} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div ref={boxRef} className="lg:col-span-7">
          <div data-scroll-target="contact" className="contact-box border-2 border-accent bg-surface">
            {/* terminal chrome */}
            <div className="flex items-center justify-between bg-accent px-4 py-2.5 text-onaccent">
              <span className="font-mono text-[13px] font-semibold tracking-tech">
                $ ./contact <span className="ml-2 hidden font-medium opacity-90 sm:inline">— {boot}{!reduced && boot.length < t.contact.boot.length + 3 && <span className="caret" />}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-onaccent/40" />
                <span className="h-2 w-2 bg-onaccent/40" />
                <span className="h-2 w-2 bg-onaccent" />
              </span>
            </div>

            <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
              {phone ? survey : (<>
              <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-tech text-accent [@media(max-height:800px)]:hidden">● {t.contact.ready}</p>

              <form onSubmit={submit} noValidate>
                {/* honeypot: hidden from people, tempting to bots */}
                <input
                  type="text"
                  name="_honey"
                  value={honey}
                  onChange={(e) => setHoney(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  aria-label="Leave this field empty"
                  className="absolute -left-[9999px] h-px w-px opacity-0"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                  {field('name', t.contact.name, t.contact.namePh)}
                  {field('email', t.contact.email, t.contact.emailPh)}
                  {field('phone', t.contact.phone, t.contact.phonePh)}
                  {field('company', t.contact.company, t.contact.companyPh)}
                </div>
                {choice('contact', t.contact.contactLabel, t.contact.contactMethods)}
                {wantsCall && (
                  <fieldset className="-mx-3 flex flex-col gap-2 border-b border-line px-3 py-3 sm:flex-row sm:items-center sm:gap-3">
                      <legend className="float-left shrink-0 font-mono text-2xs uppercase tracking-tech text-dim sm:w-[7rem]">
                        └ {t.contact.callLabel}:
                      </legend>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['from', 'to'] as const).map((edge, i) => (
                          <span key={edge} className="flex items-center gap-2">
                            {i === 1 && <span className="font-mono text-sm text-dim">–</span>}
                            <input
                              type="time"
                              step={900}
                              value={callHours[edge]}
                              onChange={(e) => setCallHours((h) => ({ ...h, [edge]: e.target.value }))}
                              aria-label={`${t.contact.callLabel} ${edge === 'from' ? t.contact.callFrom : t.contact.callTo}`}
                              className="time-input border border-line bg-transparent px-2 py-1 font-mono text-sm text-text focus:border-accent focus:outline-none"
                            />
                          </span>
                        ))}
                        <span className="font-mono text-2xs uppercase tracking-tech text-dim">{t.contact.callHint}</span>
                      </div>
                  </fieldset>
                )}
                {wantsMeeting && choice('meeting', `└ ${t.contact.meetingLabel}`, t.contact.meetings)}
                {choice('type', t.contact.typeLabel, t.contact.types)}
                {choice('budget', t.contact.budgetLabel, t.contact.budgets)}
                {choice('timeline', t.contact.timelineLabel, t.contact.timelines)}
                {field('project', t.contact.project, t.contact.projectPh, true)}
                {choice('source', t.contact.sourceLabel, t.contact.sources, true)}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    data-cursor="follow"
                    className="hero-cta group inline-flex w-full items-center justify-center gap-3 bg-accent px-8 py-4 font-mono text-[15px] font-semibold [@media(max-height:800px)]:py-3 uppercase tracking-tech text-onaccent transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-text disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-10"
                  >
                    <span>
                      &gt; {status === 'sending' ? `${t.contact.sending}…` : t.contact.send}
                    </span>
                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                  {status !== 'sent' && <p className="w-full text-[13px] text-muted sm:w-auto">{t.contact.replyTime}</p>}
                  <p role="status" aria-live="polite" className="font-mono text-2xs uppercase tracking-tech">
                    {status === 'sent' && (
                      <span className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-3 py-2 text-accent">✓ {t.contact.sent}</span>
                    )}
                    {status === 'error' && (
                      <span className="text-muted">
                        ! {t.contact.error}{' '}
                        <a href={`mailto:${site.email}`} className="text-accent underline underline-offset-2">
                          {site.email}
                        </a>
                      </span>
                    )}
                  </p>
                </div>
              </form>
              </>)}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 lg:border-l lg:border-line lg:pl-8">
          <dl className="border-t border-line">
            {[
              [t.contact.directLabel, site.email, `mailto:${site.email}`],
              [t.contact.basedLabel, 'Budapest / Central Europe', null],
              [t.contact.responseLabel, t.contact.responseValue, null],
            ].map(([k, v, href]) => (
              <div key={k as string} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <dt className="label">{k}</dt>
                <dd className="text-right font-mono text-[12px] font-medium tracking-tech text-text">
                  {href ? (
                    <a href={href as string} data-cursor="follow" className="hover:text-accent [overflow-wrap:anywhere]">
                      {v}
                    </a>
                  ) : (
                    v
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {site.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                data-cursor="follow"
                className="border border-line px-3 py-2 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {l.label} ↗
              </a>
            ))}
          </div>

          <p className="mt-8 rotate-[-2deg] font-hand text-xl text-sand">{t.ui.buildTogether}</p>
        </aside>
      </div>
    </Section>
  );
}
