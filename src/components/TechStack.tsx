import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groups, technologies } from '../data/technologies';
import { useI18n } from '../i18n';
import { usePrefersReducedMotion } from '../hooks/useMisc';
import { Section, SectionHeader, cx } from './ui';

const N = technologies.length;
const STEP = 360 / N;
const AUTO_SPEED = 3.2; // degrees per second

/** shortest signed distance, in degrees, between two angles */
function delta(a: number, b: number) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

export default function TechStack() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();

  const frameRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const [angle, setAngle] = useState(0);
  const [radius, setRadius] = useState(420);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  /** adjacency is symmetric: a link declared on either side counts */
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!map.has(a)) map.set(a, new Set());
      map.get(a)!.add(b);
    };
    for (const tech of technologies) {
      for (const other of tech.links) {
        add(tech.id, other);
        add(other, tech.id);
      }
    }
    return map;
  }, []);

  /* ---- responsive ring radius ---- */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      // the ring has to be wide enough that one card's arc slot exceeds the card
      // itself, whatever the node count — otherwise neighbours overlap
      const cardW = window.matchMedia('(min-width: 640px)').matches ? 150 : 118;
      const needed = (N * cardW * 1.06) / (2 * Math.PI);
      setRadius(Math.round(Math.min(900, Math.max(needed, w * 0.5))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const setAngleBoth = useCallback((next: number) => {
    angleRef.current = next;
    setAngle(next);
  }, []);

  /* ---- idle auto-rotation ---- */
  useEffect(() => {
    if (reduced || paused || dragging || selected !== null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngleBoth(angleRef.current - AUTO_SPEED * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, paused, dragging, selected, setAngleBoth]);

  /* ---- snap to a given card ---- */
  const goTo = useCallback(
    (index: number) => {
      const target = -index * STEP;
      const current = angleRef.current;
      setSelected(index);
      if (reduced) {
        setAngleBoth(target);
        return;
      }
      const from = current;
      const diff = delta(target, current);
      const start = performance.now();
      const dur = 520;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setAngleBoth(from + diff * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    [reduced, setAngleBoth],
  );

  const nudge = useCallback(
    (dir: 1 | -1) => {
      const front = Math.round(-angleRef.current / STEP);
      goTo(front + dir);
    },
    [goTo],
  );

  /* ---- drag to spin ---- */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let startX = 0;
    let startAngle = 0;
    let active = false;
    let moved = false;

    const down = (e: PointerEvent) => {
      active = true;
      moved = false;
      startX = e.clientX;
      startAngle = angleRef.current;
      setDragging(true);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        setSelected(null);
      }
      setAngleBoth(startAngle + dx * 0.32);
    };
    const up = () => {
      if (!active) return;
      active = false;
      setDragging(false);
      if (moved) {
        // settle on the nearest card
        const front = Math.round(-angleRef.current / STEP);
        goTo(front);
      }
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [goTo, setAngleBoth]);

  const frontIndex = ((Math.round(-angle / STEP) % N) + N) % N;
  const active = technologies[frontIndex];
  const connections = [...(adjacency.get(active.id) ?? [])]
    .map((id) => technologies.find((x) => x.id === id))
    .filter((x): x is (typeof technologies)[number] => Boolean(x));

  return (
    <Section id="stack">
      <SectionHeader
        index={t.stack.index}
        title={t.stack.title}
        subtitle={t.stack.subtitle}
        right={<span className="label hidden sm:block">{t.stack.hint}</span>}
      />

      <div className="border border-line bg-surface">
        {/* instrument header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="label-a">stack_ring.3d</span>
          <span className="label">
            {String(frontIndex + 1).padStart(2, '0')} / {N} · r{radius}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* ── the carousel ── */}
          <div
            ref={frameRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={cx(
              'relative col-span-1 h-[340px] touch-pan-y select-none overflow-hidden sm:h-[420px] lg:col-span-8 lg:h-[480px]',
              dragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            style={{ perspective: '1800px', perspectiveOrigin: '50% 50%' }}
            data-cursor="inspect"
          >
            {/* floor grid + horizon */}
            <div className="tech-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  'linear-gradient(90deg, rgb(var(--c-surface)) 0%, transparent 16%, transparent 84%, rgb(var(--c-surface)) 100%)',
              }}
            />

            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translate(-50%, -50%) translateY(${-Math.round(radius * 0.156)}px) rotateX(-9deg) rotateY(${angle}deg)`,
              }}
            >
              {technologies.map((tech, i) => {
                const d = delta(i * STEP + angle, 0); // 0 = facing the viewer
                const front = Math.abs(d) < STEP / 2;
                const depth = Math.cos((d * Math.PI) / 180); // 1 front … -1 back
                const opacity = Math.max(0.12, (depth + 1) / 2);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={tech.name}
                    aria-current={front}
                    tabIndex={front ? 0 : -1}
                    className="absolute left-1/2 top-1/2 w-[118px] sm:w-[150px]"
                    style={{
                      transform: `translate(-50%, -50%) rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      opacity,
                      transition: dragging ? 'none' : 'opacity .25s linear',
                      pointerEvents: depth > 0.2 ? 'auto' : 'none',
                    }}
                  >
                    <span
                      className={cx(
                        'relative block border bg-bg px-3 py-3 text-center transition-colors duration-300',
                        front ? 'border-accent' : 'border-line-strong',
                      )}
                    >
                      <span className="label block text-left opacity-70">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cx(
                          'mt-1 block font-mono text-[12px] uppercase tracking-tech transition-colors',
                          front ? 'text-text' : 'text-muted',
                        )}
                      >
                        {tech.name}
                      </span>
                      <span className="label mt-1 block opacity-60">{t.stack.groups[tech.group]}</span>
                      {front && (
                        <>
                          <span className="absolute -right-px -top-px h-1.5 w-1.5 bg-accent" />
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] text-accent"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M0 0h14M0 0v14M100 0h-14M100 0v14M0 100h14M0 100v-14M100 100h-14M100 100v-14"
                              stroke="currentColor"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ── readout ── */}
          <div className="col-span-1 border-t border-line p-4 sm:p-6 lg:col-span-4 lg:border-l lg:border-t-0">
            <div className="label-a mb-1">// {t.stack.node}</div>
            <div className="display text-3xl leading-none">{active.name}</div>
            <div className="label mt-2">{t.stack.groups[active.group]}</div>

            <div className="mt-6 border-t border-line pt-4">
              <div className="label mb-3">
                {t.stack.connections} · {String(connections.length).padStart(2, '0')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {connections.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => goTo(technologies.indexOf(tech))}
                    data-cursor="follow"
                    className="border border-line px-2 py-1 font-mono text-2xs uppercase tracking-tech text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            </div>

            {/* top view of the ring */}
            <div className="mt-8 flex items-center gap-4">
              <svg viewBox="0 0 90 90" className="h-[90px] w-[90px] shrink-0" fill="none" aria-hidden>
                <circle cx="45" cy="45" r="34" stroke="rgb(var(--c-line))" strokeDasharray="2 4" />
                <circle cx="45" cy="45" r="1.5" fill="rgb(var(--c-line-strong))" />
                <path d="M45 45 L45 5" stroke="rgb(var(--c-accent))" strokeWidth="0.8" opacity="0.5" />
                {technologies.map((tech, i) => {
                  const a = ((i * STEP + angle - 90) * Math.PI) / 180;
                  const on = i === frontIndex;
                  return (
                    <circle
                      key={tech.id}
                      cx={45 + Math.cos(a) * 34}
                      cy={45 + Math.sin(a) * 34}
                      r={on ? 3 : 1.6}
                      fill={on ? 'rgb(var(--c-accent))' : 'rgb(var(--c-line-strong))'}
                    />
                  );
                })}
              </svg>
              <div className="min-w-0">
                <div className="label mb-1">Ring / top view</div>
                <div className="font-mono text-2xs uppercase tracking-tech text-muted">
                  θ {String(Math.round(((-angle % 360) + 360) % 360)).padStart(3, '0')}°
                </div>
                <div className="font-mono text-2xs uppercase tracking-tech text-dim">
                  {N} nodes · {STEP.toFixed(1)}° step
                </div>
              </div>
            </div>

            {/* transport */}
            <div className="mt-6 flex items-center gap-2">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => nudge(dir)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') nudge(-1);
                    if (e.key === 'ArrowRight') nudge(1);
                  }}
                  aria-label={dir === -1 ? t.stack.prev : t.stack.next}
                  data-cursor="follow"
                  className="grid h-9 w-9 place-items-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {dir === -1 ? '←' : '→'}
                </button>
              ))}
              <span className="ticks-x ml-2 h-2 flex-1 opacity-40" aria-hidden />
            </div>

            {/* group jump */}
            <div className="mt-6 flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => goTo(technologies.findIndex((tech) => tech.group === g))}
                  data-cursor="follow"
                  className={cx(
                    'border px-2 py-1 font-mono text-2xs uppercase tracking-tech transition-colors',
                    active.group === g
                      ? 'border-accent text-accent'
                      : 'border-line text-dim hover:border-line-strong hover:text-text',
                  )}
                >
                  {t.stack.groups[g]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2">
          <span className="label">
            &gt; {dragging ? 'spin' : paused || selected !== null ? 'hold' : 'idle'} · {active.id}
            <span className="caret ml-1" />
          </span>
          <span className="label hidden sm:block">{t.stack.hint}</span>
        </div>
      </div>
    </Section>
  );
}
