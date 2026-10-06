import { Link } from 'react-router-dom';
import { labs } from '../data/labs';
import type { Lab } from '../data/labs';
import { readyTracks } from '../data/interview';
import { allLessons, modules } from '../data/course';
import { useProgress } from './course/progress';
import { useI18n } from '../i18n';
import { usePageTransition } from '../lib/pageTransition';
import { CourseLessonPage, labPreload } from '../pages/lazy';
import LabIcon from './LabIcon';
import { Cake } from './modernization/art';
import LandingCover from './LandingCover';
import { landings, readyLandings } from '../data/landings';
import { Arrow, CornerMarks, Section, SectionHeader, cx } from './ui';
import { site } from '../data/site';

/** a generic person silhouette for the sample CV photos */
function Avatar({ className = '', hue = '#c9b8a6' }: { className?: string; hue?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden>
      <rect width="40" height="48" fill={hue} />
      <circle cx="20" cy="18" r="8.5" fill="#f3e6da" />
      <path d="M20 9c-6 0-9 4-9 9 0 1 .2 2 .5 3 1-4 4-6 8.5-6s7.5 2 8.5 6c.3-1 .5-2 .5-3 0-5-3-9-9-9z" fill="#5a3d30" />
      <path d="M5 48c1.5-9 7.5-13 15-13s13.5 4 15 13z" fill="#2f3a4d" />
      <path d="M17 35l3 5 3-5" fill="#fff" />
    </svg>
  );
}

/** the CV maker as it feels: three real-looking printed CVs in different layouts */
function CvVisual({ lang }: { lang: 'en' | 'hu' }) {
  const hu = lang === 'hu';
  const features = hu
    ? ['Élő előnézet', '24 elrendezés', 'PDF export', 'Útmutató']
    : ['Live preview', '24 layouts', 'PDF export', 'Writing guide'];
  const L = {
    role: hu ? 'Termékdizájner' : 'Product Designer',
    profile: hu ? 'Profil' : 'Profile',
    exp: hu ? 'Tapasztalat' : 'Experience',
    edu: hu ? 'Tanulmányok' : 'Education',
    skills: hu ? 'Készségek' : 'Skills',
    lang: hu ? 'Nyelvek' : 'Languages',
    blurb: hu
      ? 'Felhasználóközpontú termékeket tervezek, a kutatástól a kész felületig.'
      : 'I design user-centred products, from research to polished interfaces.',
  };
  // greyed text lines, like body copy seen from a distance
  const lines = (ws: number[], c = 'bg-[#c9ccd3]') => (
    <span className="flex flex-col gap-[3px]">
      {ws.map((w, i) => (
        <span key={i} className={cx('block h-[2px] rounded-full', c)} style={{ width: `${w}%` }} />
      ))}
    </span>
  );
  const page = 'absolute aspect-[210/297] overflow-hidden rounded-[2px] bg-white text-[#1f2430] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55),0_2px_6px_rgb(0_0_0/0.25)] transition-transform duration-700 ease-tech';
  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto h-64 w-full max-w-[340px] sm:h-72" aria-hidden>
        {/* back left: classic, centred header */}
        <div className={cx(page, 'left-[2%] top-8 h-[80%] -rotate-[8deg] p-[7%] group-hover/lab:-translate-x-4 group-hover/lab:-rotate-[12deg]')}>
          <div className="border-b border-[#1f2430] pb-[5%] text-center">
            <div className="font-serif text-[9px] font-semibold tracking-[0.18em]">MÁRK SZABÓ</div>
            <div className="mt-[2px] text-[5px] uppercase tracking-[0.2em] text-[#6b7280]">{hu ? 'Pénzügyi elemző' : 'Financial Analyst'}</div>
          </div>
          <div className="mt-[7%] text-[5px] font-bold uppercase tracking-[0.15em]">{L.exp}</div>
          <div className="mt-[3%]">{lines([95, 88, 92, 70])}</div>
          <div className="mt-[7%] text-[5px] font-bold uppercase tracking-[0.15em]">{L.edu}</div>
          <div className="mt-[3%]">{lines([90, 60])}</div>
        </div>
        {/* back right: bold colour header */}
        <div className={cx(page, 'right-[2%] top-6 h-[80%] rotate-[8deg] group-hover/lab:translate-x-4 group-hover/lab:rotate-[12deg]')}>
          <div className="flex items-center gap-[6%] bg-[#0f766e] px-[7%] py-[8%] text-white">
            <Avatar className="h-7 w-6 rounded-full" hue="#99d5cc" />
            <div>
              <div className="text-[8px] font-bold leading-none">Eszter Tóth</div>
              <div className="mt-[3px] text-[5px] opacity-80">{hu ? 'Marketing vezető' : 'Marketing Lead'}</div>
            </div>
          </div>
          <div className="p-[7%]">
            <div className="text-[5px] font-bold uppercase tracking-[0.12em] text-[#0f766e]">{L.exp}</div>
            <div className="mt-[3%]">{lines([92, 80, 86])}</div>
            <div className="mt-[6%] text-[5px] font-bold uppercase tracking-[0.12em] text-[#0f766e]">{L.skills}</div>
            <div className="mt-[3%] flex flex-wrap gap-[3px]">
              {[16, 22, 12, 18, 14].map((w, i) => (
                <span key={i} className="h-[5px] rounded-full bg-[#ccebe6]" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>
        {/* front: modern sidebar layout */}
        <div className={cx(page, 'left-1/2 top-0 z-10 grid h-[94%] -translate-x-1/2 grid-cols-[36%_1fr] group-hover/lab:-translate-y-2 group-hover/lab:scale-[1.03]')}>
          <div className="flex flex-col gap-[6px] bg-[#1f2a44] px-[10%] py-[12%] text-white">
            <Avatar className="mx-auto h-11 w-9 rounded-[3px]" />
            <div className="mt-1 text-[5px] font-bold uppercase tracking-[0.15em] text-[#f59e0b]">{hu ? 'Kapcsolat' : 'Contact'}</div>
            <div className="space-y-[2px] text-[4.5px] leading-tight text-white/80">
              <div>anna.kovacs@mail.hu</div>
              <div>+36 30 123 4567</div>
              <div>Budapest</div>
            </div>
            <div className="mt-1 text-[5px] font-bold uppercase tracking-[0.15em] text-[#f59e0b]">{L.skills}</div>
            {[90, 75, 82, 60].map((w, i) => (
              <span key={i} className="block h-[3px] w-full rounded-full bg-white/15">
                <span className="block h-full rounded-full bg-[#f59e0b]" style={{ width: `${w}%` }} />
              </span>
            ))}
            <div className="mt-1 text-[5px] font-bold uppercase tracking-[0.15em] text-[#f59e0b]">{L.lang}</div>
            <div className="text-[4.5px] text-white/80">{hu ? 'Angol · Német' : 'English · German'}</div>
          </div>
          <div className="px-[9%] py-[10%]">
            <div className="text-[11px] font-extrabold leading-none tracking-tight">Anna Kovács</div>
            <div className="mt-[3px] text-[6px] font-semibold text-[#d97706]">{L.role}</div>
            <div className="mt-[8%] text-[5px] font-bold uppercase tracking-[0.15em] text-[#1f2a44]">{L.profile}</div>
            <p className="mt-[3px] text-[4.5px] leading-[1.35] text-[#4b5563]">{L.blurb}</p>
            <div className="mt-[8%] text-[5px] font-bold uppercase tracking-[0.15em] text-[#1f2a44]">{L.exp}</div>
            {[
              ['Senior UX Designer', 'Nordlight · 2021–'],
              ['UI Designer', 'Brightwave · 2018–21'],
            ].map(([r, c]) => (
              <div key={r} className="mt-[5px]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[5px] font-semibold">{r}</span>
                  <span className="text-[4px] text-[#9ca3af]">{c}</span>
                </div>
                <div className="mt-[2px]">{lines([96, 84, 90])}</div>
              </div>
            ))}
            <div className="mt-[8%] text-[5px] font-bold uppercase tracking-[0.15em] text-[#1f2a44]">{L.edu}</div>
            <div className="mt-[3px] text-[4.5px] text-[#4b5563]">MOME · BA {hu ? 'Formatervezés' : 'Design'}</div>
          </div>
        </div>
        {/* export badge */}
        <span className="absolute -bottom-1 right-[10%] z-20 flex items-center gap-1.5 bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-tech text-onaccent shadow-lg transition-transform duration-500 ease-tech group-hover/lab:-translate-y-1">
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v7M3 5l3 3 3-3M2 11h8" /></svg>
          PDF
        </span>
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
      {/* the course as it looks: module list on the left, a passing exercise on the right */}
      <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden border border-line-strong bg-bg" aria-hidden>
        <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-tech text-dim">
          <span>
            <span className="text-accent">04</span> / React / useState
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-16 bg-line">
              <span className="block h-full w-[38%] bg-accent transition-[width] duration-700 ease-tech group-hover/lab:w-[46%]" />
            </span>
            {lang === 'hu' ? '18/48 lecke' : '18/48 lessons'}
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[38%_1fr]">
          <ol className="flex min-h-0 flex-col overflow-hidden border-r border-line py-1">
            {modules.map((m, i) => {
              const state = i < 3 ? 'done' : i === 3 ? 'now' : 'todo';
              return (
                <li
                  key={m.id}
                  className={cx(
                    'flex min-h-0 flex-1 items-center gap-2 px-2.5 text-[10.5px] leading-none',
                    state === 'now' ? 'bg-accent/10 text-text' : state === 'done' ? 'text-muted' : 'text-dim',
                  )}
                >
                  <span
                    className={cx(
                      'grid h-3.5 w-3.5 shrink-0 place-items-center border font-mono text-[8px]',
                      state === 'done' && 'border-accent bg-accent text-onaccent',
                      state === 'now' && 'border-accent text-accent',
                      state === 'todo' && 'border-line-strong',
                    )}
                  >
                    {state === 'done' ? '✓' : Number(m.num)}
                  </span>
                  <span className="truncate">{m.title[lang]}</span>
                </li>
              );
            })}
          </ol>
          <div className="flex min-h-0 flex-col bg-[#0f1420]">
            <pre className="min-h-0 flex-1 overflow-hidden px-3 py-3 font-mono text-[10px] leading-[1.7] text-[#c9d1e4] sm:text-[11px]">
              <span className="text-[#c792ea]">function</span> <span className="text-[#82aaff]">Counter</span>() {'{'}
              {'\n'}  <span className="text-[#c792ea]">const</span> [n, setN] ={'\n'}    <span className="text-[#82aaff]">useState</span>(<span className="text-[#f78c6c]">0</span>);
              {'\n'}  <span className="text-[#c792ea]">return</span> <span className="text-[#89ddff]">&lt;button</span>{'\n'}    <span className="text-[#ffcb6b]">onClick</span>={'{'}() =&gt; <span className="text-[#82aaff]">setN</span>(n + <span className="text-[#f78c6c]">1</span>){'}'}<span className="text-[#89ddff]">&gt;</span>
              {'\n'}    {'{'}n{'}'}<span className="text-[#89ddff]">&lt;/button&gt;</span>;{'\n'}{'}'}
            </pre>
            <div className="flex items-center justify-between border-t border-white/10 bg-[#0c2a1c] px-3 py-1.5 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-[#4ade80]">
                <span className="grid h-3.5 w-3.5 place-items-center bg-[#22c55e] text-[8px] text-[#052e16]">✓</span>
                {lang === 'hu' ? '3/3 teszt' : '3/3 tests'}
              </span>
              <span className="bg-accent px-1.5 py-0.5 font-bold text-onaccent transition-transform duration-500 ease-tech group-hover/lab:scale-110">+20 XP</span>
            </div>
          </div>
        </div>
      </div>
      <FeatureGrid
        items={
          lang === 'hu'
            ? [`${modules.length} modul`, 'Kvízek', 'Böngészős gyakorlatok', site.showPatreon ? 'Mintaprojektek' : 'Haladási térkép']
            : [`${modules.length} modules`, 'Quizzes', 'In-browser exercises', site.showPatreon ? 'Sample projects' : 'Progress map']
        }
      />
    </div>
  );
}

/** the four-up feature box every project card ends with */
function FeatureGrid({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
      {items.map((f) => (
        <li key={f} className="flex items-center gap-2 bg-surface px-3 py-2.5 font-mono text-2xs uppercase tracking-tech text-muted">
          <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
          {f}
        </li>
      ))}
    </ul>
  );
}

/** a question as the simulator shows it, framed like the other project previews */
function InterviewVisual() {
  const { lang } = useI18n();
  const hu = lang === 'hu';
  const options = ['"null"', '"object"', '"undefined"', '"number"'];
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden border border-line-strong bg-bg" aria-hidden>
        <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-tech text-dim">
          <span className="flex items-center gap-2">
            <span className="bg-[#f7df1e] px-1 py-px font-bold text-black">JS</span>
            {hu ? '7. kérdés / 20' : 'Question 7 / 20'}
          </span>
          <span className="flex items-center gap-1.5 text-accent">
            <span className="h-1.5 w-1.5 animate-pulse bg-accent" />
            00:42
          </span>
        </div>
        <div className="h-1 bg-line">
          <span className="block h-full w-[35%] bg-accent transition-[width] duration-700 ease-tech group-hover/lab:w-[40%]" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-semibold text-text sm:text-[15px]">{hu ? 'Mit ír ki ez a kód?' : 'What does this print?'}</div>
            <div className="flex shrink-0 items-center gap-2 border border-line-strong bg-surface py-1 pl-1 pr-2.5">
              <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(var(--c-line))" strokeWidth="4" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="94.2" strokeDashoffset="17" />
              </svg>
              <span className="font-mono text-[10px] leading-tight">
                <span className="block font-bold text-text">82%</span>
                <span className="block text-dim">{hu ? 'Medior' : 'Mid-level'}</span>
              </span>
            </div>
          </div>
          <pre className="bg-[#0f1420] px-3 py-2.5 font-mono text-[11.5px] text-[#c9d1e4] sm:text-[13px]">
            <span className="text-[#82aaff]">console</span>.<span className="text-[#82aaff]">log</span>(<span className="text-[#c792ea]">typeof</span> <span className="text-[#f78c6c]">null</span>);
          </pre>
          <ul className="grid grid-cols-2 gap-1.5">
            {options.map((o, i) => (
              <li
                key={o}
                className={cx(
                  'flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-500 sm:py-2 sm:text-[12px]',
                  i === 1
                    ? 'border-line-strong text-text group-hover/lab:border-[#22c55e] group-hover/lab:bg-[#22c55e]/15 group-hover/lab:text-[#4ade80]'
                    : 'border-line text-muted',
                )}
              >
                <span className="grid h-3.5 w-3.5 shrink-0 place-items-center border border-current text-[8px]">{'ABCD'[i]}</span>
                {o}
                {i === 1 && <span className="ml-auto opacity-0 transition-opacity duration-500 group-hover/lab:opacity-100">✓</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <FeatureGrid
        items={
          hu
            ? [`${readyTracks.length} téma`, `${(readyTracks.length * 200).toLocaleString('hu')} kérdés`, 'Szint és pontszám', 'Kódolvasás, hibakeresés']
            : [`${readyTracks.length} tracks`, `${(readyTracks.length * 200).toLocaleString('en')} questions`, 'Level & score', 'Code reading & bugs']
        }
      />
    </div>
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

/** a still from a 3D configurator, framed like the other previews */
function ToolVisual({ id, lang }: { id: 'garage' | 'shirt'; lang: 'en' | 'hu' }) {
  const points =
    id === 'garage'
      ? lang === 'hu'
        ? ['Élő 3D modell', 'Tető, kapu, burkolat', 'Szín és extrák', 'Árbecslés']
        : ['Live 3D model', 'Roof, door, cladding', 'Colours & extras', 'Price estimate']
      : lang === 'hu'
        ? ['Férfi és női modell', 'Saját szöveg vagy kép', 'Elöl és hátul', 'Mockup letöltés']
        : ['Man & woman models', 'Your text or image', 'Front and back', 'Mockup download'];
  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line-strong bg-bg" aria-hidden>
        <img
          src={`/labs/${id}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          width={960}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 ease-tech group-hover/lab:scale-[1.04]"
        />
        <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tech text-white">3D · WebGL</span>
      </div>
      <FeatureGrid items={points} />
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
          ) : lab.id === 'garage' || lab.id === 'shirt' ? (
            <ToolVisual id={lab.id} lang={lang} />
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
