import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import { projects } from '../data/projects';
import { site } from '../data/site';
import { cx } from './ui';

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

export default function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { t, setLang, lang } = useI18n();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const goTo = (hash: string) => () => {
    setOpen(false);
    navigate('/');
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: 'home', group: t.palette.navigate, label: t.palette.goHome, hint: '01', run: goTo('home') },
      { id: 'about', group: t.palette.navigate, label: t.palette.goAbout, hint: '02', run: goTo('about') },
      { id: 'projects', group: t.palette.navigate, label: t.palette.goProjects, hint: '03', run: goTo('projects') },
      { id: 'services', group: t.palette.navigate, label: t.palette.goServices, hint: '04', run: goTo('services') },
      { id: 'contact', group: t.palette.navigate, label: t.palette.goContact, hint: '05', run: goTo('contact') },
    ];
    const cases: Command[] = projects.map((p) => ({
      id: `case-${p.id}`,
      group: t.projects.subtitle,
      label: `${p.num} — ${p.title}`,
      hint: '↗',
      run: () => {
        setOpen(false);
        navigate(`/project/${p.id}`);
      },
    }));
    const actions: Command[] = [
      {
        id: 'theme',
        group: t.palette.actions,
        label: t.palette.theme,
        hint: theme === 'dark' ? 'dark' : 'light',
        run: () => toggle(),
      },
      {
        id: 'copy',
        group: t.palette.actions,
        label: copied ? t.palette.copied : t.palette.copyEmail,
        hint: site.email,
        run: () => {
          void navigator.clipboard?.writeText(site.email);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        },
      },
    ];
    const langs: Command[] = [
      {
        id: 'lang-en',
        group: t.palette.language,
        label: t.palette.en,
        hint: lang === 'en' ? '●' : 'EN',
        run: () => setLang('en'),
      },
      {
        id: 'lang-hu',
        group: t.palette.language,
        label: t.palette.hu,
        hint: lang === 'hu' ? '●' : 'HU',
        run: () => setLang('hu'),
      },
    ];
    return [...nav, ...cases, ...actions, ...langs];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, theme, lang, copied]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setIndex(0), [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i) => (i + 1) % Math.max(1, filtered.length));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[index]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen, filtered, index]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  if (!open) return null;

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center bg-bg/80 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.palette.title}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        className="w-full max-w-[600px] border border-line-strong bg-surface shadow-2xl"
        style={{ animation: 'fadeUp .25s cubic-bezier(.16,1,.3,1) both' }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="font-mono text-2xs tracking-tech text-accent">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.palette.placeholder}
            aria-label={t.palette.placeholder}
            className="w-full bg-transparent font-mono text-sm text-text placeholder:text-dim focus:outline-none"
          />
          <span className="label border border-line px-1.5 py-0.5">ESC</span>
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {filtered.length === 0 && <li className="px-4 py-6 text-center label">{t.palette.empty}</li>}
          {filtered.map((cmd, i) => {
            const header = cmd.group !== lastGroup ? cmd.group : null;
            lastGroup = cmd.group;
            const on = i === index;
            return (
              <li key={cmd.id}>
                {header && <div className="label px-4 pb-1 pt-3">{header}</div>}
                <button
                  type="button"
                  data-active={on}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => cmd.run()}
                  className={cx(
                    'flex w-full items-center justify-between gap-4 px-4 py-2 text-left font-mono text-[13px] transition-colors',
                    on ? 'bg-surface2 text-text' : 'text-muted hover:text-text',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cx('h-1 w-1', on ? 'bg-accent' : 'bg-line-strong')} />
                    {cmd.label}
                  </span>
                  <span className="truncate font-mono text-2xs uppercase tracking-tech text-dim">{cmd.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2 font-mono text-2xs uppercase tracking-tech text-dim">
          <span>↑ ↓ {t.palette.hintSelect}</span>
          <span>⏎ {t.palette.hintOpen}</span>
          <span>ESC {t.palette.hintClose}</span>
        </div>
      </div>
    </div>
  );
}
