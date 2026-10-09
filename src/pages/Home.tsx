import Hero from '../components/Hero';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { Suspense, lazy, useEffect } from 'react';
import { scrollToSection } from '../lib/scrollToSection';
import { AppIcons, AppTabBar } from '../landing/appKit';
import './homeApp.css';

// the sections below the hero load as one chunk, requested as soon as this module runs;
// on a prerendered page their HTML is already there and hydrates when it arrives
const loadSections = () => import('./HomeSections');
const HomeSections = lazy(loadSections);
if (typeof window !== 'undefined') void loadSections();

export default function Home() {
  const { t } = useI18n();
  useSeo({ title: t.seo.homeTitle, description: t.seo.homeDescription, path: '/' });
  // a link like /hu/#contact or /sk/#contact (from another page or shared) lands on that section
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && id !== 'home') scrollToSection(id, false);
  }, []);
  return (
    // .home-app: on phones (≤767px) the home page is laid out like an app (homeApp.css);
    // larger screens ignore the class
    <div className="home-app">
      <Hero />
      <Suspense fallback={null}>
        <HomeSections />
      </Suspense>
      <HomeTabBar />
    </div>
  );
}

/** phones only: the bottom tab bar, with "Let's talk" as its raised action */
function HomeTabBar() {
  const { t } = useI18n();
  const go = (id: string) => {
    scrollToSection(id);
    history.replaceState(null, '', id === 'home' ? window.location.pathname : `#${id}`);
  };
  return (
    <AppTabBar
      className="home-tabbar"
      onSelect={go}
      tabs={[
        { id: 'home', label: t.nav.home, icon: <AppIcons.home /> },
        { id: 'interactive', label: t.nav.labs, icon: <AppIcons.play /> },
        { id: 'projects', label: t.nav.projects, icon: <AppIcons.grid /> },
        { id: 'services', label: t.nav.services, icon: <AppIcons.list /> },
      ]}
      action={{ label: t.nav.talkShort, icon: <AppIcons.chat />, onClick: () => go('contact') }}
    />
  );
}
