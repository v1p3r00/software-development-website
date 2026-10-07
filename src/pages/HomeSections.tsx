import About from '../components/About';
import ContactTerminal from '../components/ContactTerminal';
import InteractiveProjects from '../components/InteractiveProjects';
import ProjectGrid from '../components/ProjectGrid';
import Services from '../components/Services';
import TechStack from '../components/TechStack';
import Testimonials from '../components/Testimonials';

/** Everything below the hero: its own chunk, so the first screen hydrates without it. */
export default function HomeSections() {
  return (
    <>
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
