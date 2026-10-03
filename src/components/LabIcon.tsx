import { cx } from './ui';

/** line icons for the interactive projects, drawn in the site's 1px technical style */
export default function LabIcon({ id, className = '' }: { id: string; className?: string }) {
  const common = { viewBox: '0 0 32 32', fill: 'none', 'aria-hidden': true, className: cx('h-8 w-8', className) } as const;
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
  return (
    <svg {...common}>
      <rect x="3" y="6" width="26" height="20" stroke="currentColor" />
      <path d="M3 10h26" stroke="currentColor" />
      <path d="M8 15l3 3-3 3" stroke="currentColor" className="text-accent" />
      <path d="M14 21h7" stroke="currentColor" />
    </svg>
  );
}
