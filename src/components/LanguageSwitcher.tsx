import { useI18n } from '../i18n';
import { cx } from './ui';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={cx('flex items-center border border-line font-mono text-2xs tracking-tech', className)}
      role="group"
      aria-label="Language"
    >
      {(['en', 'hu'] as const).map((code, i) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          data-cursor="follow"
          className={cx(
            'px-2 py-1 uppercase transition-colors duration-200',
            i === 1 && 'border-l border-line',
            lang === code ? 'bg-accent text-black' : 'text-dim hover:text-text',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
