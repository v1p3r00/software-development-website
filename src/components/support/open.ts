/** open the site assistant from anywhere, optionally straight into a project request */
export const SUPPORT_EVENT = 'dm-support-open';

export interface SupportRequest {
  /** what the visitor is interested in; starts a project request when given */
  interest?: string;
}

export function openSupport(interest?: string) {
  window.dispatchEvent(new CustomEvent<SupportRequest>(SUPPORT_EVENT, { detail: { interest } }));
}
