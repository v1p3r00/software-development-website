import { useI18n } from '../i18n';
import { useGoToSection } from '../hooks/useGoToSection';
import { site } from '../data/site';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const goTo = useGoToSection();

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="relative grid h-10 w-10 place-items-center border border-line-strong font-display text-lg font-extrabold leading-none">
              DM
              <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-accent" />
            </span>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-tech text-text">{site.name}</div>
              <div className="label mt-1">{t.ui.roleLine}</div>
              <p className="mt-3 max-w-[38ch] text-[13px] leading-relaxed text-muted">{t.footer.tagline}</p>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              ['home', t.nav.home],
              ['about', t.nav.about],
              ['projects', t.nav.projects],
              ['services', t.nav.services],
              ['contact', t.nav.contact],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={goTo(id)}
                data-cursor="follow"
                className="font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:text-accent"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex gap-2">
            {site.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={l.label}
                data-cursor="follow"
                className="grid h-9 w-9 place-items-center border border-line font-mono text-2xs tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {l.short}
              </a>
            ))}
          </div>
        </div>

        <div className="ticks-x mt-10 h-2 opacity-30" aria-hidden />

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 font-mono text-2xs uppercase tracking-tech text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.name}. {t.footer.rights}
          </span>
          <span className="hidden sm:block">{t.footer.colophon}</span>
          <span>
            {site.version} / build {site.build}
          </span>
        </div>
      </div>
    </footer>
  );
}
