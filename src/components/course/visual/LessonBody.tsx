import { Suspense, useMemo } from 'react';
import type { Lang } from '../../../data/projects';
import { parseBody } from './blocks';
import { mdToHtml } from './md';
import Diagram from './Diagram';
import { Callout, Compare, Terms } from './BlockViews';
import { widgets } from './widgets';

/** renders a lesson body: Markdown plus diagrams, callouts, comparisons, key terms and interactive widgets */
export default function LessonBody({ body, lang }: { body: string; lang: Lang }) {
  const segments = useMemo(() => parseBody(body), [body]);
  return (
    <div className="lesson-body">
      {segments.map((s, i) => {
        switch (s.type) {
          case 'md':
            return <div key={i} className="prose-article" dangerouslySetInnerHTML={{ __html: mdToHtml(s.text) }} />;
          case 'diagram':
            return <Diagram key={i} spec={s.spec} kicker={lang === 'hu' ? 'Ábra' : 'Diagram'} />;
          case 'callout':
            return <Callout key={i} variant={s.variant} title={s.title} md={s.md} lang={lang} />;
          case 'compare':
            return <Compare key={i} spec={s.spec} lang={lang} />;
          case 'terms':
            return <Terms key={i} items={s.items} lang={lang} />;
          case 'widget': {
            const W = widgets[s.name];
            if (!W) return import.meta.env.DEV ? <pre key={i}>unknown widget {s.name}</pre> : null;
            return (
              <Suspense key={i} fallback={<div className="vis-widget h-56 animate-pulse" />}>
                <W lang={lang} {...s.props} />
              </Suspense>
            );
          }
          default:
            return import.meta.env.DEV ? (
              <pre key={i} className="border border-accent p-3 text-xs">
                {s.kind}: {s.message}
              </pre>
            ) : null;
        }
      })}
    </div>
  );
}
