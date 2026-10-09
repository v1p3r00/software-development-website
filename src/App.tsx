import { Suspense, lazy, useEffect, useState } from 'react';
import { useI18n } from './i18n';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SystemStatus from './components/SystemStatus';
import ScrollProgress from './components/ScrollProgress';
import TechnicalCursor from './components/TechnicalCursor';
import BackToTop from './components/BackToTop';
import MobileTalk from './components/MobileTalk';
import SupportBot from './components/support/SupportBot';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import { ProjectDetailPage, ArticlePage, ArticlesPage, CourseLessonPage, CoursePage, CvMakerPage, GarageDesignerPage, InterviewPage, InterviewTrackPage, LandingPagesPage, LandingStagePage, ModernizationPage, ShirtDesignerPage, CameraStudyPage, WebsiteCheckPage, IndustryPage } from './pages/lazy';
import { stripLang } from './i18n/paths';
import { labFor } from './data/labs';
import { isLandingStage } from './data/landings';
import { useRouteCommitSignal } from './lib/pageTransition';
import { countVisit } from './hooks/useVisitorCount';
import { pauseOffscreenAnimations } from './lib/pauseOffscreen';

/** '' is English (bare paths); the others are the language prefixes */
const LANG_PREFIXES = ['', '/hu', '/sk'];

// the command palette is only fetched once it is first opened (or on idle, below)
const loadPalette = () => import('./components/CommandPalette');
const CommandPalette = lazy(loadPalette);

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  useEffect(() => {
    if (paletteOpen) setPaletteUsed(true);
  }, [paletteOpen]);
  // until the palette is loaded it cannot hear ⌘K / Ctrl+K itself
  useEffect(() => {
    if (paletteUsed) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    // warm it up in idle time so the first open is instant
    const idle = window.setTimeout(() => void loadPalette(), 6000);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(idle);
    };
  }, [paletteUsed]);
  const { t } = useI18n();
  useRouteCommitSignal();
  // the interactive projects are full-screen stages: no footer or floating widgets
  const path = stripLang(useLocation().pathname);
  const showcase = !!labFor(path);
  // a landing page owns the whole screen: no grain, no custom cursor, only the menu button
  const stage = isLandingStage(path);
  // count the visit on whichever page it lands, not only when the home hero is shown
  useEffect(() => countVisit(), []);
  // endless CSS animations (marquee, pulsing dots…) pause while scrolled out of view;
  // scanned a moment after each route change, once lazy content has rendered
  useEffect(() => {
    if (stage) return; // the landing stage runs its own scan
    let stop: (() => void) | undefined;
    const id = window.setTimeout(() => {
      const main = document.getElementById('main');
      if (main) stop = pauseOffscreenAnimations(main);
    }, 1200);
    return () => {
      window.clearTimeout(id);
      stop?.();
    };
  }, [path, stage]);

  return (
    <div className={stage ? 'relative min-h-screen' : 'grain relative min-h-screen bg-bg'}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:border focus:border-accent focus:bg-bg focus:px-4 focus:py-2 focus:font-mono focus:text-2xs focus:uppercase focus:tracking-tech focus:text-accent"
      >
        {t.ui.skip}
      </a>

      {!showcase && <ScrollProgress />}
      <Navigation onOpenPalette={() => setPaletteOpen(true)} />

      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            {/* every route also exists under /hu and /sk for the Hungarian and Slovak versions */}
            {LANG_PREFIXES.flatMap((pre) => [
              <Route key={pre || '/'} path={pre || '/'} element={<Home />} />,
              <Route key={`${pre}/project/:id`} path={`${pre}/project/:id`} element={<ProjectDetailPage />} />,
              <Route key={`${pre}/articles`} path={`${pre}/articles`} element={<ArticlesPage />} />,
              <Route key={`${pre}/articles/:slug`} path={`${pre}/articles/:slug`} element={<ArticlePage />} />,
              <Route key={`${pre}/interview`} path={`${pre}/interview`} element={<InterviewPage />} />,
              <Route key={`${pre}/interview/:id`} path={`${pre}/interview/:id`} element={<InterviewTrackPage />} />,
              <Route key={`${pre}/cv-maker`} path={`${pre}/cv-maker`} element={<CvMakerPage />} />,
              <Route key={`${pre}/course`} path={`${pre}/course`} element={<CoursePage />} />,
              <Route key={`${pre}/course/:slug`} path={`${pre}/course/:slug`} element={<CourseLessonPage />} />,
              <Route key={`${pre}/modernization`} path={`${pre}/modernization`} element={<ModernizationPage />} />,
              <Route key={`${pre}/landing-pages`} path={`${pre}/landing-pages`} element={<LandingPagesPage />} />,
              <Route key={`${pre}/landing-pages/:slug`} path={`${pre}/landing-pages/:slug`} element={<LandingStagePage />} />,
              <Route key={`${pre}/garage-designer`} path={`${pre}/garage-designer`} element={<GarageDesignerPage />} />,
              <Route key={`${pre}/shirt-designer`} path={`${pre}/shirt-designer`} element={<ShirtDesignerPage />} />,
              <Route key={`${pre}/camera-study`} path={`${pre}/camera-study`} element={<CameraStudyPage />} />,
              <Route key={`${pre}/website-check`} path={`${pre}/website-check`} element={<WebsiteCheckPage />} />,
              <Route key={`${pre}/industries`} path={`${pre}/industries`} element={<IndustryPage />} />,
              <Route key={`${pre}/industries/:slug`} path={`${pre}/industries/:slug`} element={<IndustryPage />} />,
            ])}
            <Route path="*" element={<NotFound onSearch={() => setPaletteOpen(true)} />} />
          </Routes>
        </Suspense>
      </main>

      {!showcase && <Footer />}
      {!showcase && <SystemStatus />}
      {paletteUsed && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
        </Suspense>
      )}
      {!stage && <TechnicalCursor />}
      {!showcase && <BackToTop />}
      {!showcase && <MobileTalk />}
      {!stage && <SupportBot />}
    </div>
  );
}
