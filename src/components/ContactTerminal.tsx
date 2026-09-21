import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { site } from '../data/site';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { Section, SectionHeader, cx } from './ui';

type Field = 'name' | 'email' | 'project';
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
  const [values, setValues] = useState({ name: '', email: '', project: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = t.contact.errorName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t.contact.errorEmail;
    if (values.project.trim().length < 8) next.project = t.contact.errorProject;
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = `Project enquiry — ${values.name}`;
    const body = `${values.project}\n\n—\n${values.name}\n${values.email}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = (name: Field, label: string, placeholder: string, textarea = false) => {
    const id = `contact-${name}`;
    const invalid = Boolean(errors[name]);
    const shared = {
      id,
      name,
      value: values[name],
      onChange: set(name),
      placeholder,
      'aria-invalid': invalid,
      'aria-describedby': invalid ? `${id}-error` : undefined,
      className: cx(
        'w-full resize-none border-0 bg-transparent px-0 py-1 font-mono text-sm text-text placeholder:text-dim focus:outline-none',
      ),
    };
    return (
      <div className="border-b border-line py-3">
        <div className="flex items-start gap-3">
          <label
            htmlFor={id}
            className={cx(
              'mt-1 shrink-0 font-mono text-2xs uppercase tracking-tech',
              invalid ? 'text-accent' : 'text-dim',
            )}
          >
            {label}:
          </label>
          {textarea ? <textarea rows={3} {...shared} /> : <input type={name === 'email' ? 'email' : 'text'} {...shared} />}
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
          <div className="border border-line bg-surface">
            {/* terminal chrome */}
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-2xs tracking-tech text-muted">$ ./contact</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-line-strong" />
                <span className="h-1.5 w-1.5 bg-line-strong" />
                <span className="h-1.5 w-1.5 bg-accent" />
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <p className="mb-1 font-mono text-2xs uppercase tracking-tech text-dim">
                {boot}
                {!reduced && <span className="caret" />}
              </p>
              <p className="mb-6 font-mono text-2xs uppercase tracking-tech text-accent">● {t.contact.ready}</p>

              <form onSubmit={submit} noValidate>
                {field('name', t.contact.name, t.contact.namePh)}
                {field('email', t.contact.email, t.contact.emailPh)}
                {field('project', t.contact.project, t.contact.projectPh, true)}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    data-cursor="follow"
                    className="group inline-flex items-center gap-3 bg-accent px-6 py-3.5 font-mono text-[11px] uppercase tracking-tech text-black transition-colors duration-300 hover:bg-text"
                  >
                    <span>&gt; {t.contact.send}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                  {sent && (
                    <p role="status" className="font-mono text-2xs uppercase tracking-tech text-muted">
                      {t.contact.sent}{' '}
                      <a href={`mailto:${site.email}`} className="text-accent underline underline-offset-2">
                        {site.email}
                      </a>
                    </p>
                  )}
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
                <dd className="text-right font-mono text-[12px] tracking-tech text-text">
                  {href ? (
                    <a href={href as string} data-cursor="follow" className="hover:text-accent">
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
