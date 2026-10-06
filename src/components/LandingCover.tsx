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
        <img src={l.poster} alt="" loading="lazy" decoding="async" className="landing-cover-img" />
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
