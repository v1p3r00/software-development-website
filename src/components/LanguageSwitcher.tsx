import { useI18n } from '../i18n';
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
