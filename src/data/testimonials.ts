import type { Lang } from './projects';

/**
 * Real client quotes for the "What clients say" section on the home page.
 * The section stays hidden while this list is empty — add only genuine feedback
 * that the client agreed to publish.
 *
 *   { quote: { en: '…', hu: '…', sk: '…' }, name: 'Jane Doe', role: { en: 'CTO, Example Ltd', hu: 'CTO, Example Kft.', sk: 'CTO, Example s.r.o.' } }
 */
export interface Testimonial {
  quote: Record<Lang, string>;
  name: string;
  role: Record<Lang, string>;
  /** optional link to the person's or company's page */
  url?: string;
}

export const testimonials: Testimonial[] = [];
