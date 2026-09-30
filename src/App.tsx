import { lazy, Suspense, useEffect, useState } from 'react';
import { useI18n } from './i18n';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import SystemStatus from './components/SystemStatus';
import ScrollProgress from './components/ScrollProgress';
import TechnicalCursor from './components/TechnicalCursor';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
// the article pages (and the Markdown renderer) load only when visited
const Articles = lazy(() => import('./pages/Articles'));
const Article = lazy(() => import('./pages/Article'));

/**
 * Hungarian pages carry ?lang=hu in the address bar, so a copied link opens in the
 * same language. English, the default, keeps clean URLs.
 */
function useLangInUrl(lang: string) {
  // pathname/hash come from the router so this reruns on navigation; the query is read
  // from the live address because replaceState below does not update the router's copy
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('lang') ?? 'en') === lang) return;
    if (lang === 'en') params.delete('lang');
    else params.set('lang', lang);
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${pathname}${query ? `?${query}` : ''}${hash}`);
  }, [lang, pathname, hash]);
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { t, lang } = useI18n();
  useLangInUrl(lang);

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
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<Article />} />
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
