import About from '../components/About';
import ContactTerminal from '../components/ContactTerminal';
import Hero from '../components/Hero';
import ProjectGrid from '../components/ProjectGrid';
import Services from '../components/Services';
import TechStack from '../components/TechStack';
import { useI18n } from '../i18n';
import { useSeo } from '../hooks/useSeo';

export default function Home() {
  const { t } = useI18n();
  useSeo({ title: t.seo.homeTitle, description: t.seo.homeDescription, path: '/' });
  return (
    <>
      <Hero />
      <About />
      <ProjectGrid />
      <Services />
      <TechStack />
      <ContactTerminal />
    </>
  );
}
