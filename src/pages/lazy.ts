import { createElement, lazy, useState } from 'react';
import type { ComponentType } from 'react';

/**
 * React.lazy with a preload(): once preloaded, the page renders straight away
 * instead of suspending for a frame — a page transition can then capture the real
 * page rather than the loading placeholder.
 */
function lazyPage(load: () => Promise<{ default: ComponentType }>) {
  let Loaded: ComponentType | null = null;
  let pending: Promise<void> | null = null;
  const preload = () =>
    (pending ??= load().then((m) => {
      Loaded = m.default;
    }));
  const Lazy = lazy(() => preload().then(() => ({ default: Loaded as ComponentType })));
  function Page() {
    // fixed per mount, so a later preload doesn't swap the component type under React
    const [C] = useState<ComponentType>(() => Loaded ?? Lazy);
    return createElement(C);
  }
  return Object.assign(Page, { preload });
}

// the article pages (and the Markdown renderer) load only when visited
export const ArticlesPage = lazyPage(() => import('./Articles'));
export const ArticlePage = lazyPage(() => import('./Article'));
// the interview simulator and its question sets
export const InterviewPage = lazyPage(() => import('./Interview'));
export const InterviewTrackPage = lazyPage(() => import('./InterviewTrack'));
// the CV maker, its templates and guide
export const CvMakerPage = lazyPage(() => import('./CvMaker'));
// the full-stack course
export const CoursePage = lazyPage(() => import('./Course'));
export const CourseLessonPage = lazyPage(() => import('./CourseLesson'));
// the before/after modernization showcase
export const ModernizationPage = lazyPage(() => import('./Modernization'));
// the landing page showcase: the gallery and the full-screen stage (each landing page is its own chunk)
export const LandingPagesPage = lazyPage(() => import('./LandingPages'));
export const LandingStagePage = lazyPage(() => import('./LandingStage'));

// the 3D configurators
export const GarageDesignerPage = lazyPage(() => import('./GarageDesigner'));
export const ShirtDesignerPage = lazyPage(() => import('./ShirtDesigner'));

/** preloaders for the interactive projects, by `labs` id */
export const labPreload: Record<string, () => Promise<void>> = {
  interview: InterviewPage.preload,
  cv: CvMakerPage.preload,
  course: CoursePage.preload,
  modernization: ModernizationPage.preload,
  landing: LandingPagesPage.preload,
  garage: GarageDesignerPage.preload,
  shirt: ShirtDesignerPage.preload,
};
