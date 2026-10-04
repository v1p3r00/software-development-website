import { scrollBehavior } from '../../lib/motion';
export const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
