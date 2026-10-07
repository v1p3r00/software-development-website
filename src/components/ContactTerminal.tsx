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
      if (first) window.setTimeout(() => document.getElementById(`contact-${first}`)?.focus(), 0);
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
                  'border px-2.5 py-1 font-mono text-[11.5px] font-medium uppercase tracking-tech transition-colors duration-200',
                  on
                    ? 'border-accent bg-accent text-onaccent'
                    : 'border-line-strong text-text hover:border-accent hover:text-accent',
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
