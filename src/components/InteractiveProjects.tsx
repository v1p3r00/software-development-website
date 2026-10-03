import { Link } from 'react-router-dom';
import { labs } from '../data/labs';
import type { Lab } from '../data/labs';
import { readyTracks } from '../data/interview';
import { useI18n } from '../i18n';
import { usePageTransition } from '../lib/pageTransition';
import { InterviewTrackPage, labPreload } from '../pages/lazy';
import LabIcon from './LabIcon';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from './ui';

/** stacked page schematics: the CV maker's layouts */
function CvVisual({ lang }: { lang: 'en' | 'hu' }) {
  const features =
    lang === 'hu'
      ? ['Élő előnézet', '4 elrendezés', 'PDF export', 'Útmutató']
      : ['Live preview', '4 layouts', 'PDF export', 'Writing guide'];
  const line = (w: string, extra = '') => <span className={cx('block h-[3px] bg-line-strong/70', extra)} style={{ width: w }} />;
  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto h-56 w-full max-w-[300px] sm:h-64" aria-hidden>
        {/* back page: single column */}
        <div className="absolute left-[6%] top-6 aspect-[210/297] h-[85%] -rotate-6 border border-line bg-bg p-3 transition-transform duration-500 ease-tech group-hover/lab:-translate-x-3 group-hover/lab:-rotate-[9deg]">
          <span className="mb-2 block h-1.5 w-1/2 bg-line-strong" />
          <span className="flex flex-col gap-1.5">{line('90%')}{line('70%')}{line('80%')}{line('60%')}</span>
        </div>
        {/* middle page: accent rail */}
        <div className="absolute right-[6%] top-4 aspect-[210/297] h-[85%] rotate-6 border border-line border-l-4 border-l-accent bg-bg p-3 transition-transform duration-500 ease-tech group-hover/lab:translate-x-3 group-hover/lab:rotate-[9deg]">
          <span className="mb-2 block h-2 w-3/4 bg-text/80" />
          <span className="flex flex-col gap-1.5">{line('85%')}{line('65%')}{line('75%')}</span>
        </div>
        {/* front page: sidebar layout */}
        <div className="absolute left-1/2 top-0 grid aspect-[210/297] h-[92%] -translate-x-1/2 grid-cols-[34%_1fr] border border-line-strong bg-bg shadow-2xl transition-transform duration-500 ease-tech group-hover/lab:-translate-y-1">
          <span className="flex flex-col gap-1.5 bg-accent/10 p-2">
            <span className="block aspect-[4/5] w-full bg-line-strong/60" />
            <span className="block h-[3px] w-2/3 bg-accent" />
            {line('90%')}
            {line('70%')}
          </span>
          <span className="flex flex-col gap-1.5 p-2">
            <span className="block h-2 w-4/5 bg-text/80" />
            <span className="block h-[3px] w-1/2 bg-accent" />
            <span className="mt-1 flex flex-col gap-1">{line('95%')}{line('80%')}{line('88%')}</span>
            <span className="mt-1 flex flex-col gap-1">{line('90%')}{line('70%')}</span>
          </span>
        </div>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 bg-surface px-3 py-2.5 font-mono text-2xs uppercase tracking-tech text-muted">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InterviewVisual() {
  const { t, lp, lang } = useI18n();
  const { link } = usePageTransition();
  return (
    <>
      <div className="label-a mb-4">// {t.labs.jumpIn}</div>
      <ul className="grid grid-cols-2 gap-px border border-line bg-line">
        {readyTracks.map((track) => (
          <li key={track.id} className="bg-surface">
            <Link
              to={lp(`/interview/${track.id}/`)}
              onClick={link(lp(`/interview/${track.id}/`), 'slide', { prepare: InterviewTrackPage.preload })}
              data-cursor="follow"
              className="group flex items-center justify-between gap-2 px-3 py-2.5 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:bg-bg hover:text-accent"
            >
              <span className="truncate">{track.title[lang]}</span>
              <span className="text-dim transition-colors group-hover:text-accent">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function LabCard({ lab }: { lab: Lab }) {
  const { t, lp, lang } = useI18n();
  const { link } = usePageTransition();
  const tl = t.labs;
  const to = lp(lab.path);
  const preload = labPreload[lab.id];
  const open = link(to, 'slide', preload ? { prepare: preload } : {});

  return (
    <li className="group/lab relative border border-line bg-surface transition-colors duration-300 hover:border-line-strong">
      <CornerMarks />
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="flex flex-col p-6 sm:p-8 lg:col-span-7 lg:border-r lg:border-line">
          <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-tech text-dim">
            <span>
              <span className="text-accent">{lab.num}</span>
              <span className="mx-2">/</span>
              {tl.live}
            </span>
            <span className="text-accent">● {lab.short}</span>
          </div>
          <div className="mt-6 flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center border border-line-strong text-text transition-colors group-hover/lab:border-accent">
              <LabIcon id={lab.id} />
            </span>
            <h3 className="display pt-1 text-[2rem] leading-none sm:text-[2.6rem]">{lab.title[lang]}</h3>
          </div>
          <p className="mt-5 max-w-[60ch] text-sm leading-relaxed text-muted sm:text-base">{lab.desc[lang]}</p>

          {lab.id === 'interview' && (
            <dl className="mt-8 grid max-w-md grid-cols-2 gap-px border border-line bg-line">
              <div className="bg-surface p-4">
                <dt className="label">{tl.tracks}</dt>
                <dd className="display mt-1 text-3xl">{String(readyTracks.length).padStart(2, '0')}</dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="label">{tl.questions}</dt>
                <dd className="display mt-1 text-3xl">{(readyTracks.length * 200).toLocaleString(lang)}</dd>
              </div>
            </dl>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
            <Link
              to={to}
              onClick={open}
              onMouseEnter={preload ? () => void preload() : undefined}
              data-cursor="follow"
              className="group inline-flex items-center gap-4 bg-accent px-6 py-4 font-mono text-[11px] uppercase tracking-tech text-onaccent transition-colors duration-300 hover:bg-text"
            >
              {lab.cta[lang]}
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <div className="flex flex-wrap gap-1.5">
              {lab.tags.map((tag) => (
                <span key={tag} className="border border-line px-2 py-0.5 font-mono text-2xs uppercase tracking-tech text-dim">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-line p-6 sm:p-8 lg:col-span-5 lg:border-t-0">
          {lab.id === 'cv' ? <CvVisual lang={lang} /> : <InterviewVisual />}
        </div>
      </div>
    </li>
  );
}

/** Home-page section listing the interactive projects that run on this site. */
export default function InteractiveProjects() {
  const { t } = useI18n();
  const tl = t.labs;
  return (
    <Section id="interactive">
      <SectionHeader
        index={tl.index}
        title={tl.title}
        subtitle={tl.subtitle}
        right={<span className="label hidden sm:block">{tl.hint}</span>}
      />
      <ul className="grid grid-cols-1 gap-5">
        {labs.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
      </ul>
      <p className="label mt-6">{tl.more}</p>
    </Section>
  );
}
