import type { FlowNode, Tone } from './blocks';

/** the diagram palette; each tone is an rgb triplet CSS variable (--v-<tone>) defined per theme in index.css */
export const TONES: Tone[] = ['blue', 'violet', 'green', 'amber', 'pink', 'cyan', 'orange', 'red', 'indigo', 'teal'];

/** default colour per node kind, so the same kind of thing looks the same in every lesson */
export const kindTone: Record<NonNullable<FlowNode['kind']>, Tone> = {
  user: 'pink',
  client: 'blue',
  server: 'violet',
  db: 'green',
  service: 'cyan',
  external: 'teal',
  cloud: 'teal',
  file: 'amber',
  queue: 'orange',
  code: 'indigo',
};
