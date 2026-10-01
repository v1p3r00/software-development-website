import { Suspense, useState } from 'react';
import { useI18n } from './i18n';
import { Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import SystemStatus from './components/SystemStatus';
import ScrollProgress from './components/ScrollProgress';
import TechnicalCursor from './components/TechnicalCursor';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import { ArticlePage, ArticlesPage } from './pages/lazy';
import { useRouteCommitSignal } from './lib/pageTransition';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { t } = useI18n();
  useRouteCommitSignal();

  return (
    <div className="grain relative min-h-screen bg-bg">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:border focus:border-accent focus:bg-bg focus:px-4 focus:py-2 focus:font-mono focus:text-2xs focus:uppercase focus:tracking-tech focus:text-accent"
      >
        {t.ui.skip}
      </a>

      <ScrollProgress />
      <Navigation onOpenPalette={() => setPaletteOpen(true)} />

      <main>
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            {/* every route also exists under /hu for the Hungarian version */}
            <Route path="/hu?" element={<Home />} />
            <Route path="/hu?/project/:id" element={<ProjectDetail />} />
            <Route path="/hu?/articles" element={<ArticlesPage />} />
            <Route path="/hu?/articles/:slug" element={<ArticlePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <SystemStatus />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <TechnicalCursor />
    </div>
  );
}
