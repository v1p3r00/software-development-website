import About from '../components/About';
import ContactTerminal from '../components/ContactTerminal';
import Hero from '../components/Hero';
import InteractiveProjects from '../components/InteractiveProjects';
import ProjectGrid from '../components/ProjectGrid';
import Services from '../components/Services';
import TechStack from '../components/TechStack';
import Testimonials from '../components/Testimonials';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';
import { useEffect } from 'react';
import { scrollToSection } from '../lib/scrollToSection';

export default function Home() {
  const { t } = useI18n();
  useSeo({ title: t.seo.homeTitle, description: t.seo.homeDescription, path: '/' });
  // a link like /hu/#contact (from another page or shared) lands on that section
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && id !== 'home') scrollToSection(id, false);
  }, []);
  return (
    <>
      <Hero />
      <InteractiveProjects />
      <ProjectGrid />
      <Services />
      <TechStack />
      <Testimonials />
      <About />
      <ContactTerminal />
    </>
  );
}
