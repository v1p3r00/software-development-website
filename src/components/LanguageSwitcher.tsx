import { useId } from 'react';
import { useI18n } from '../i18n';
import type { Lang } from '../data/projects';
import { cx } from './ui';

/** Union Jack; ids are per instance because the switcher renders twice (header and mobile menu) */
function FlagEN() {
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <clipPath id={`${id}s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagHU() {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="30" height="6.67" fill="#CD2A3E" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#436F4D" />
    </svg>
  );
}

const FLAGS: Record<Lang, { Flag: () => React.JSX.Element; name: string }> = {
  en: { Flag: FlagEN, name: 'English' },
  hu: { Flag: FlagHU, name: 'Magyar' },
};

export default function LanguageSwitcher({ className = '', large = false }: { className?: string; large?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cx('flex items-center', large ? 'gap-2.5' : 'gap-1.5', className)} role="group" aria-label="Language / Nyelv">
      {(['en', 'hu'] as const).map((code) => {
        const { Flag, name } = FLAGS[code];
        const on = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={on}
            aria-label={name}
            title={name}
            data-cursor="follow"
            className={cx(
              'relative block overflow-hidden border transition-all duration-200',
              large ? 'h-[22px] w-[33px]' : 'h-[16px] w-[24px]',
              on
                ? 'border-accent opacity-100 ring-1 ring-accent ring-offset-2 ring-offset-bg'
                : 'border-line opacity-45 grayscale hover:opacity-100 hover:grayscale-0',
            )}
          >
            <Flag />
          </button>
        );
      })}
    </div>
  );
}
