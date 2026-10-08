import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { readyTracks } from '../data/interview';
import { Arrow, CornerMarks, Section, SectionHeader } from '../components/ui';
import { SupportShare } from '../components/ShareButtons';
import { site } from '../data/site';

export default function Interview() {
  const { t, lp, lang } = useI18n();
  const ti = t.interview;

  useSeo({ title: t.seo.interviewTitle, description: t.seo.interviewDescription, path: '/interview/' });

  return (
    <Section id="interview" className="min-h-[70vh] pt-24 lg:pt-24">
      <SectionHeader
        index={ti.index}
        title={ti.title}
          inHeader
        subtitle={ti.subtitle}
        right={
          <span className="label">
            {ti.tracks}: {String(readyTracks.length).padStart(2, '0')}
          </span>
        }
      />

      <p className="mb-12 max-w-[68ch] text-base leading-relaxed text-muted sm:text-lg">{ti.intro}</p>

      <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {readyTracks.map((track, i) => (
          <li key={track.id} className="flex">
            <Link
              to={lp(`/interview/${track.id}/`)}
              data-cursor="follow"
              className="group relative flex w-full flex-col border border-line bg-surface p-6 transition-colors duration-300 hover:border-accent sm:p-8"
            >
              <CornerMarks />
              <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-tech text-dim">
                <span>
                  <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mx-2">/</span>
                  200 {ti.questions}
                </span>
                <span className="text-accent">● {track.short}</span>
              </div>
              <h2 className="mt-6 font-display text-[clamp(1.2rem,6.4vw,1.5rem)] font-extrabold uppercase leading-tight tracking-tight [overflow-wrap:anywhere] transition-colors group-hover:text-accent">
                {track.title[lang]}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{track.text[lang]}</p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                <div className="flex flex-wrap gap-1.5">
                  {track.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <Arrow className="mb-1 shrink-0 text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <SupportShare url={`${site.url}${lp('/interview/')}`} text={t.ux.supportInterview} className="mt-10" />
    </Section>
  );
}
