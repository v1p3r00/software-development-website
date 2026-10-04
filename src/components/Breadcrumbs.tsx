import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** Home / Section / Page — the last crumb is the current page */
export default function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="label flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line-strong">/</span>}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} onClick={c.onClick} data-cursor="follow" className="transition-colors hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className="line-clamp-1 max-w-[40ch] text-muted">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
