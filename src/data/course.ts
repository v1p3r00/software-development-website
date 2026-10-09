import type { Lang } from './projects';
import { modules } from './courseSyllabus';

/**
 * The full-stack course: lesson loading.
 * Lesson content lives in src/content/course/<slug>.<lang>.json (see LessonContent);
 * a lesson is "ready" when its file exists for at least one language.
 */
export { modules };
export type { CourseLesson, CourseModule } from './courseSyllabus';

export const allLessons = modules.flatMap((m) => m.lessons.map((lesson) => ({ ...lesson, module: m })));

// ---------- lesson content ----------

export interface QuizQuestion {
  question: string;
  options: string[];
  /** index into options */
  answer: number;
  explanation: string;
}

export interface ExerciseTest {
  /** shown to the learner */
  name: string;
  /** JS body run in the sandbox after the learner's code; returns true when it passes */
  code: string;
}

export interface Exercise {
  title: string;
  /** Markdown */
  task: string;
  /**
   * js: code runs as a script, console output is shown; ts: TypeScript, compiled then run like js;
   * web: an HTML page (with CSS) rendered as a preview; react: JSX/TSX defining App, rendered as a preview;
   * sql: SQL run against a fresh in-browser SQLite database seeded with `setup`; results are shown as tables
   */
  kind: 'js' | 'ts' | 'web' | 'react' | 'sql';
  /** sql only: statements that create and fill the tables before the learner's SQL runs */
  setup?: string;
  starter: string;
  solution: string;
  hint?: string;
  tests: ExerciseTest[];
}

export interface LessonContent {
  title: string;
  /** one or two sentences under the title */
  intro: string;
  /** Markdown */
  body: string;
  takeaways: string[];
  quiz: QuizQuestion[];
  exercise?: Exercise;
}

const files = import.meta.glob<{ default: LessonContent }>('../content/course/*.json');

const fileOf = (slug: string, lang: Lang) => `../content/course/${slug}.${lang}.json`;

export const isReady = (slug: string) => (['en', 'hu', 'sk'] as const).some((l) => fileOf(slug, l) in files);

/** the lesson in the requested language, else English, else whichever exists */
export async function loadLesson(slug: string, lang: Lang): Promise<{ content: LessonContent; lang: Lang } | null> {
  const order: Lang[] = [lang, 'en', 'hu', 'sk'];
  for (const l of order) {
    const load = files[fileOf(slug, l)];
    if (load) return { content: (await load()).default, lang: l };
  }
  return null;
}

export const readyLessons = allLessons.filter((x) => isReady(x.slug));
