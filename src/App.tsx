import { Suspense, useEffect, useState } from 'react';
import { useI18n } from './i18n';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import SystemStatus from './components/SystemStatus';
import ScrollProgress from './components/ScrollProgress';
import TechnicalCursor from './components/TechnicalCursor';
import BackToTop from './components/BackToTop';
import MobileTalk from './components/MobileTalk';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import { ArticlePage, ArticlesPage, CourseLessonPage, CoursePage, CvMakerPage, InterviewPage, InterviewTrackPage, ModernizationPage } from './pages/lazy';
import { stripLang } from './i18n/paths';
import { labFor } from './data/labs';
import { useRouteCommitSignal } from './lib/pageTransition';
import { countVisit } from './hooks/useVisitorCount';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { t } = useI18n();
  useRouteCommitSignal();
  // the interactive projects are full-screen stages: no footer or floating widgets
  const showcase = !!labFor(stripLang(useLocation().pathname));
  // count the visit on whichever page it lands, not only when the home hero is shown
  useEffect(() => countVisit(), []);

  return (
    <div className="grain relative min-h-screen bg-bg">
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
            {/* every route also exists under /hu for the Hungarian version */}
            <Route path="/hu?" element={<Home />} />
            <Route path="/hu?/project/:id" element={<ProjectDetail />} />
            <Route path="/hu?/articles" element={<ArticlesPage />} />
            <Route path="/hu?/articles/:slug" element={<ArticlePage />} />
            <Route path="/hu?/interview" element={<InterviewPage />} />
            <Route path="/hu?/interview/:id" element={<InterviewTrackPage />} />
            <Route path="/hu?/cv-maker" element={<CvMakerPage />} />
            <Route path="/hu?/course" element={<CoursePage />} />
            <Route path="/hu?/course/:slug" element={<CourseLessonPage />} />
            <Route path="/hu?/modernization" element={<ModernizationPage />} />
            <Route path="*" element={<NotFound onSearch={() => setPaletteOpen(true)} />} />
          </Routes>
        </Suspense>
      </main>

      {!showcase && <Footer />}
      {!showcase && <SystemStatus />}
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <TechnicalCursor />
      {!showcase && <BackToTop />}
      {!showcase && <MobileTalk />}
    </div>
  );
}
