import About from '../components/About';
import ContactTerminal from '../components/ContactTerminal';
import Hero from '../components/Hero';
import ProjectGrid from '../components/ProjectGrid';
import Services from '../components/Services';
import TechStack from '../components/TechStack';

export default function Home() {
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
