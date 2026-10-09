import type { CSSProperties } from 'react';
import { useI18n } from '../i18n';
import type { Landing } from '../data/landings';

/** A brand cover drawn from the roster: its colours, its type, its idea. */
export default function LandingCover({ l, className = '' }: { l: Landing; className?: string }) {
  const { lang } = useI18n();
  return (
    <div
      className={`landing-cover ${className}`}
      style={{ '--lb': l.colors.bg, '--lf': l.colors.fg, '--la': l.colors.accent } as CSSProperties}
      aria-hidden
    >
      {l.poster ? (
        <img src={l.poster} srcSet={`${l.poster.replace('.webp', '-640.webp')} 640w, ${l.poster} 1600w`} sizes="(min-width: 1024px) 40vw, 80vw" width={1600} height={1000} alt={`${l.name} — ${l.sector[lang]}, ${{ en: 'landing page', hu: 'bemutató oldal', sk: 'landing page' }[lang]}`} loading="lazy" decoding="async" className="landing-cover-img" />
      ) : (
        <span className="landing-cover-glow" />
      )}
      {!l.poster && (
        <>
          <span className="landing-cover-num">{l.num}</span>
          <span className="landing-cover-name" style={{ fontFamily: l.display }}>
            {l.name}
          </span>
          <span className="landing-cover-sector">{l.sector[lang]}</span>
        </>
      )}
    </div>
  );
}
