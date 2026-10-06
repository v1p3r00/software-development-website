import { Link } from 'react-router-dom';
import { labs } from '../data/labs';
import type { Lab } from '../data/labs';
import { readyTracks } from '../data/interview';
import { allLessons, isReady, modules } from '../data/course';
import { useProgress } from './course/progress';
import { useI18n } from '../i18n';
import { usePageTransition } from '../lib/pageTransition';
import { CourseLessonPage, InterviewTrackPage, labPreload } from '../pages/lazy';
import LabIcon from './LabIcon';
import { Cake } from './modernization/art';
import LandingCover from './LandingCover';
import { landings, readyLandings } from '../data/landings';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from './ui';
import { site } from '../data/site';

/** stacked page schematics: the CV maker's layouts */
function CvVisual({ lang }: { lang: 'en' | 'hu' }) {
  const features =
    lang === 'hu'
      ? ['Élő előnézet', '24 elrendezés', 'PDF export', 'Útmutató']
      : ['Live preview', '24 layouts', 'PDF export', 'Writing guide'];
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

/** the course as a compact route of its ten modules */
function CourseVisual({ lang }: { lang: 'en' | 'hu' }) {
  const { t, lp } = useI18n();
  const { link } = usePageTransition();
  const { progress } = useProgress();
  const last = progress.last ? allLessons.find((l) => l.slug === progress.last) : undefined;
  const done = Object.keys(progress.done).length;
  return (
    <div>
      {last && (
        <Link
          to={lp(`/course/${last.slug}/`)}
          onClick={link(lp(`/course/${last.slug}/`), 'slide', { prepare: CourseLessonPage.preload })}
          data-cursor="follow"
          className="group mb-4 flex items-center gap-4 border border-accent bg-accent/10 px-4 py-3 transition-colors hover:bg-accent/20"
        >
          <span className="min-w-0 flex-1">
            <span className="label-a block">
              {t.ux.continueCourse} · {done}/{allLessons.length}
            </span>
            <span className="mt-1 block truncate text-[15px] font-semibold text-text">
              {Number(last.module.num)}.{last.module.lessons.findIndex((l) => l.slug === last.slug) + 1} {last.title[lang]}
            </span>
          </span>
          <Arrow className="shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
      <ol className="relative grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
        {modules.map((m) => {
          // a module is live once any of its lessons has content
          const live = m.lessons.some((l) => isReady(l.slug));
          return (
          <li key={m.id} className="flex items-center gap-3 bg-surface px-3 py-2.5">
            <span
              className={cx(
                'grid h-5 w-5 shrink-0 place-items-center border font-mono text-[9px]',
                live ? 'border-accent bg-accent text-onaccent' : 'border-line-strong text-dim',
              )}
            >
              {m.num}
            </span>
            <span className={cx('truncate text-[13px]', live ? 'text-text' : 'text-muted')}>{m.title[lang]}</span>
          </li>
          );
        })}
      </ol>
      <p className="label mt-3">{lang === 'hu' ? `Kvízek · böngészős gyakorlatok · ${site.showPatreon ? 'mintaprojektek a Patreonon' : 'haladási térkép'}` : `Quizzes · in-browser exercises · ${site.showPatreon ? 'sample projects on Patreon' : 'progress map'}`}</p>
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

/** the modernization showcase in miniature: an old and a new page split by a divider */
function ModernVisual({ lang }: { lang: 'en' | 'hu' }) {
  const points =
    lang === 'hu'
      ? ['3 élő demó', 'Asztali + mobil', 'Működő kosár', 'Foglalás, űrlapok']
      : ['3 live demos', 'Desktop + mobile', 'Working cart', 'Booking & forms'];
  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line-strong bg-[#fff4f7]" aria-hidden>
        {/* after */}
        <div className="absolute inset-x-0 top-0 flex h-[13%] items-center justify-between border-b border-[#f4d5e0] bg-[#fffafc] px-[5%]">
          <span className="font-serif text-[clamp(7px,1.1vw,11px)] tracking-[0.22em] text-[#b4245d]">MÁLNAVIRÁG</span>
          <span className="h-[46%] w-[20%] rounded-full bg-[#b4245d]" />
        </div>
        <div className="absolute left-[6%] top-[30%] w-[40%] space-y-[6%]">
          <span className="block h-2 w-full rounded-full bg-[#3a1a28]/80" />
          <span className="block h-2 w-3/4 rounded-full bg-[#3a1a28]/80" />
          <span className="block h-1.5 w-2/3 rounded-full bg-[#7c5967]/40" />
          <span className="mt-3 block h-4 w-1/2 rounded-full bg-[#b4245d]" />
        </div>
        <Cake className="absolute bottom-[4%] right-[2%] w-[52%]" body="#f6c4d0" cream="#fff5f8" top="berries" accent="#e0245e" tiers={2} />
        {/* before, clipped */}
        <div className="absolute inset-0 bg-[#d63384] transition-[clip-path] duration-700 ease-tech [clip-path:inset(0_50%_0_0)] group-hover/lab:[clip-path:inset(0_78%_0_0)]">
          <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle,rgb(255_255_255/0.35)_0_2px,transparent_3px)_0_0/14px_14px]" />
          <div className="absolute inset-x-[12%] top-[6%] h-[34%] overflow-hidden rounded-t-[50%] border-2 border-[#ffb3d6] bg-[#ffd6ea]">
            <Cake className="mx-auto h-full [filter:saturate(1.7)_contrast(1.15)]" body="#4a2c22" cream="#f3d9c4" drip="#2c1712" top="candles" accent="#ff4fa3" plate={false} />
          </div>
          <div className="absolute inset-x-[12%] top-[40%] h-[8%] bg-gradient-to-b from-white via-[#ff9cc9] to-[#ffc4df]" />
          <div className="absolute inset-x-[12%] bottom-0 top-[48%] bg-[#fff0f6] px-[6%] pt-[5%] text-center font-serif text-[clamp(7px,1.05vw,11px)] italic leading-tight text-[#e6007e]">
            Üdvözöljük a honlapunkon!
            <br />
            <span className="text-black">Házi készítésű finomságok…</span>
          </div>
        </div>
        {/* divider */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white transition-[left] duration-700 ease-tech group-hover/lab:left-[22%]">
          <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/60 text-[11px] text-white">
            ⇆
          </span>
        </div>
        <span className="absolute bottom-2 left-2 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tech text-white">
          {lang === 'hu' ? 'Előtte' : 'Before'}
        </span>
        <span className="absolute bottom-2 right-2 bg-white/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tech text-black">
          {lang === 'hu' ? 'Utána' : 'After'}
        </span>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
        {points.map((f) => (
          <li key={f} className="flex items-center gap-2 bg-surface px-3 py-2.5 font-mono text-2xs uppercase tracking-tech text-muted">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** a fan of brand covers that spreads out on hover */
function LandingVisual({ lang }: { lang: 'en' | 'hu' }) {
  const fan = [landings[3], landings[1], landings[4], landings[0]];
  const points =
    lang === 'hu'
      ? [`${landings.length} márka`, 'Teljes képernyő', 'Élő interakciók', 'Könnyed animáció']
      : [`${landings.length} brands`, 'Full screen', 'Live interactions', 'Light animation'];
  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[16/10] w-full" aria-hidden>
        {fan.map((l, i) => (
          <div
            key={l.slug}
            className="absolute inset-[8%] shadow-2xl transition-transform duration-700 ease-tech"
            style={{
              transform: `translateX(${(i - 3) * 7}%) rotate(${(i - 3) * 4}deg)`,
              zIndex: i,
            }}
          >
            <div
              className="h-full w-full transition-transform duration-700 ease-tech group-hover/lab:[transform:translateX(var(--fx))_rotate(var(--fr))]"
              style={{ '--fx': `${(i - 3) * 9}%`, '--fr': `${(i - 3) * 3}deg` } as React.CSSProperties}
            >
              <LandingCover l={l} className="h-full w-full" />
            </div>
          </div>
        ))}
        <span className="absolute bottom-2 right-2 z-10 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tech text-white">
          {readyLandings.length} / {landings.length} live
        </span>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
        {points.map((f) => (
          <li key={f} className="flex items-center gap-2 bg-surface px-3 py-2.5 font-mono text-2xs uppercase tracking-tech text-muted">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
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
          <p className="mt-5 max-w-[60ch] whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">{lab.desc[lang]}</p>

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
              className="group inline-flex items-center gap-4 bg-accent px-6 py-4 font-mono text-[12.5px] uppercase tracking-tech text-onaccent transition-colors duration-300 hover:bg-text"
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
          {lab.id === 'cv' ? (
            <CvVisual lang={lang} />
          ) : lab.id === 'course' ? (
            <CourseVisual lang={lang} />
          ) : lab.id === 'modernization' ? (
            <ModernVisual lang={lang} />
          ) : lab.id === 'landing' ? (
            <LandingVisual lang={lang} />
          ) : (
            <InterviewVisual />
          )}
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
