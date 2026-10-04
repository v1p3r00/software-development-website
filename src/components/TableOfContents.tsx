import { useEffect, useState } from 'react';
import { cx } from './ui';
import { scrollBehavior } from '../lib/motion';

interface Item {
  id: string;
  text: string;
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

/**
 * "On this page": reads the h2 headings inside `root` once the content has rendered,
 * gives them ids (so sections can be linked) and highlights the one being read.
 */
export default function TableOfContents({ root, title, deps = [], className }: { root: string; title: string; deps?: unknown[]; className?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const container = document.querySelector(root);
    if (!container) return;
    const used = new Set<string>();
    const hs = [...container.querySelectorAll('h2')] as HTMLElement[];
    const list = hs.map((h) => {
      let id = h.id || slugify(h.textContent ?? '');
      while (used.has(id)) id += '-2';
      used.add(id);
      h.id = id;
      h.style.scrollMarginTop = '110px';
      return { id, text: h.textContent ?? '' };
    });
    setItems(list);
    if (!hs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' },
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, ...deps]);

  if (items.length < 3) return null;
  return (
    <nav aria-label={title} className={className}>
      <div className="label-a mb-3">// {title}</div>
      <ol className="grid gap-1 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(it.id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
                history.replaceState(null, '', `#${it.id}`);
              }}
              className={cx(
                '-ml-px block border-l-2 py-1 pl-3 text-[13.5px] leading-snug transition-colors',
                active === it.id ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text',
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
