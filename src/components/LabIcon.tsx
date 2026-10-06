import { cx } from './ui';

/** line icons for the interactive projects, drawn in the site's 1px technical style */
export default function LabIcon({ id, className = '' }: { id: string; className?: string }) {
  const common = { viewBox: '0 0 32 32', fill: 'none', 'aria-hidden': true, className: cx('h-8 w-8', className) } as const;
  if (id === 'course') {
    return (
      <svg {...common}>
        <path d="M3 11l13-6 13 6-13 6z" stroke="currentColor" />
        <path d="M8 13.5V20c2.5 2 5 3 8 3s5.5-1 8-3v-6.5" stroke="currentColor" />
        <path d="M29 11v8" stroke="currentColor" className="text-accent" />
      </svg>
    );
  }
  if (id === 'cv') {
    return (
      <svg {...common}>
        <path d="M8 3h12l6 6v20H8z" stroke="currentColor" />
        <path d="M20 3v6h6" stroke="currentColor" />
        <circle cx="14" cy="13" r="2.5" stroke="currentColor" />
        <path d="M10.5 19c.6-2 2-3 3.5-3s2.9 1 3.5 3" stroke="currentColor" />
        <path d="M11 23h12M11 26h8" stroke="currentColor" className="text-accent" />
      </svg>
    );
  }
  if (id === 'modernization') {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="26" height="20" stroke="currentColor" />
        <path d="M3 10h26" stroke="currentColor" />
        <path d="M6 14h7M6 17h5M6 20h7" stroke="currentColor" strokeDasharray="1.5 1.5" />
        <path d="M19 14h7M19 17h7M19 20h4" stroke="currentColor" />
        <path d="M16 3v26" stroke="currentColor" className="text-accent" />
        <path d="M14 16l-1.5 0M18 16h1.5" stroke="currentColor" className="text-accent" />
      </svg>
    );
  }
  if (id === 'landing') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="26" height="22" stroke="currentColor" />
        <path d="M3 9h26" stroke="currentColor" />
        <path d="M7 14h11M7 17.5h8" stroke="currentColor" />
        <path d="M7 22h6" stroke="currentColor" className="text-accent" />
        <circle cx="23" cy="18" r="3.5" stroke="currentColor" className="text-accent" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="6" width="26" height="20" stroke="currentColor" />
      <path d="M3 10h26" stroke="currentColor" />
      <path d="M8 15l3 3-3 3" stroke="currentColor" className="text-accent" />
      <path d="M14 21h7" stroke="currentColor" />
    </svg>
  );
}
