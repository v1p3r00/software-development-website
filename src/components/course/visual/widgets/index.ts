import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { WidgetProps } from './Frame';

type W = LazyExoticComponent<ComponentType<WidgetProps & Record<string, unknown>>>;

/** interactive explainers, loaded on demand; use in a lesson body as ~~~widget <name>\n~~~ */
export const widgets: Record<string, W> = {
  'request-journey': lazy(() => import('./RequestJourney')),
  'http-explorer': lazy(() => import('./HttpExplorer')),
  'box-model': lazy(() => import('./BoxModel')),
  'flex-playground': lazy(() => import('./FlexPlayground')),
  breakpoints: lazy(() => import('./Breakpoints')),
  'event-bubbling': lazy(() => import('./EventBubbling')),
  'event-loop': lazy(() => import('./EventLoop')),
  'react-rerender': lazy(() => import('./ReactRerender')),
  'effect-lifecycle': lazy(() => import('./EffectLifecycle')),
  'layered-request': lazy(() => import('./LayeredRequest')),
  'sql-join': lazy(() => import('./SqlJoin')),
  'index-scan': lazy(() => import('./IndexScan')),
  'jwt-inspector': lazy(() => import('./JwtInspector')),
  'test-pyramid': lazy(() => import('./TestPyramid')),
  'docker-layers': lazy(() => import('./DockerLayers')),
  'ci-pipeline': lazy(() => import('./CiPipeline')),
};

/** which lesson gets which explainer (the retrofit places them in the best-fitting section) */
export const widgetFor: Record<string, string> = {
  'how-a-website-loads': 'request-journey',
  'http-basics': 'http-explorer',
  'css-fundamentals': 'box-model',
  'flexbox-and-grid': 'flex-playground',
  'responsive-design': 'breakpoints',
  'js-dom-events': 'event-bubbling',
  'js-async': 'event-loop',
  'react-state-props': 'react-rerender',
  'react-effects-data': 'effect-lifecycle',
  'layered-architecture': 'layered-request',
  'sql-fundamentals': 'sql-join',
  'query-performance': 'index-scan',
  'spring-security-jwt': 'jwt-inspector',
  'testing-pyramid': 'test-pyramid',
  'docker-basics': 'docker-layers',
  'ci-github-actions': 'ci-pipeline',
};
