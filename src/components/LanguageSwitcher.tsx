import { useI18n } from '../i18n';
import { LANGS } from '../data/projects';
import type { Lang } from '../data/projects';
import { cx } from './ui';

/**
 * Union Jack, as a small bitmap: drawn as SVG its counterchanged diagonals need
 * clip paths, and the first clip path on a page holds up the first paint by
 * ~0.4 s on CPU-rendered (no-GPU) browsers. A cached file rather than a data URI,
 * so it isn't repeated in every page's HTML.
 */
const UNION_JACK = '/flags/gb.webp';

function FlagEN() {
  return <img src={UNION_JACK} alt="" aria-hidden width={24} height={16} decoding="async" className="h-full w-full object-cover" />;
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

/** Slovak tricolour with the coat of arms (double cross on three hills), placed towards the hoist */
function FlagSK() {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="30" height="6.67" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0B4EA2" />
      <rect y="13.33" width="30" height="6.67" fill="#EE1C25" />
      <path d="M7 4.3h7.2v6.2c0 3.1-1.8 4.6-3.6 5.4C8.8 15.1 7 13.6 7 10.5z" fill="#fff" />
      <path d="M7.55 4.85h6.1v5.65c0 2.6-1.45 3.85-3.05 4.6-1.6-.75-3.05-2-3.05-4.6z" fill="#EE1C25" />
      <path d="M10.2 6.2h.8v1.1h1.5v.8H11v1h1.9v.8H11v2h-.8v-2H8.3v-.8h1.9v-1H8.7v-.8h1.5z" fill="#fff" />
      <path d="M7.7 12.3c.6-.6 1.2-.6 1.6-.1.45-.7 1.4-.7 1.9 0 .4-.5 1-.5 1.6.1-.4 1.3-1.4 2.1-2.2 2.5-.8-.4-2.5-1.2-2.9-2.5z" fill="#0B4EA2" />
    </svg>
  );
}

const FLAGS: Record<Lang, { Flag: () => React.JSX.Element; name: string }> = {
  en: { Flag: FlagEN, name: 'English' },
  hu: { Flag: FlagHU, name: 'Magyar' },
  sk: { Flag: FlagSK, name: 'Slovenčina' },
};

export default function LanguageSwitcher({ className = '', large = false }: { className?: string; large?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cx('flex items-center', large ? 'gap-2.5' : 'gap-1.5', className)} role="group" aria-label="Language / Nyelv / Jazyk">
      {LANGS.map((code) => {
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
