import Hero from '../components/Hero';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { Suspense, lazy, useEffect } from 'react';
import { scrollToSection } from '../lib/scrollToSection';

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
    <>
      <Hero />
      <Suspense fallback={null}>
        <HomeSections />
      </Suspense>
    </>
  );
}
