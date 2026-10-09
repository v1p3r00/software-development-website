import { useState } from 'react';
import { Frame, Field, Seg, tr } from './Frame';
import type { WidgetProps } from './Frame';

export default function BoxModel({ lang }: WidgetProps) {
  const t = tr(lang);
  const [width, setWidth] = useState(200);
  const [padding, setPadding] = useState(20);
  const [border, setBorder] = useState(4);
  const [margin, setMargin] = useState(16);
  const [sizing, setSizing] = useState<'content-box' | 'border-box'>('content-box');
  const content = sizing === 'border-box' ? Math.max(0, width - 2 * padding - 2 * border) : width;
  const borderBox = content + 2 * padding + 2 * border;
  const total = borderBox + 2 * margin;
  const sliders: Array<[string, number, (v: number) => void, number, number]> = [
    ['width', width, setWidth, 80, 320],
    ['padding', padding, setPadding, 0, 48],
    ['border', border, setBorder, 0, 16],
    ['margin', margin, setMargin, 0, 48],
  ];
  const Ring = ({ name, size, cls, children }: { name: string; size: number; cls: string; children: React.ReactNode }) => (
    <div className={'relative ' + cls} style={{ padding: size }}>
      {size >= 12 && <span className="absolute left-1.5 top-0.5 font-mono text-[10px] uppercase tracking-wider opacity-80">{name}</span>}
      {children}
    </div>
  );
  return (
    <Frame lang={lang} title={t('The CSS box model', 'A CSS dobozmodell', 'CSS box model')} hint={t('Drag the sliders and switch box-sizing to see where every pixel goes.', 'Húzd a csúszkákat és váltsd a box-sizinget: lásd, hová megy minden pixel.', 'Posúvaj posuvníky a prepínaj box-sizing – uvidíš, kam ide každý pixel.')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
        <div className="grid content-start gap-4">
          {sliders.map(([name, v, set, min, max]) => (
            <Field key={name} label={`${name}: ${v}px`}>
              <input className="vw-range" type="range" min={min} max={max} value={v} onChange={(e) => set(Number(e.target.value))} aria-label={name} />
            </Field>
          ))}
          <Field label="box-sizing">
            <Seg label="box-sizing" options={['content-box', 'border-box'] as const} value={sizing} onChange={setSizing} />
          </Field>
        </div>
        <div className="min-w-0">
          <div className="overflow-x-auto py-1">
            <div className="mx-auto w-max">
              <Ring name="margin" size={margin} cls="border border-dashed border-line-strong bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgb(var(--c-line)/0.5)_6px_7px)] text-dim">
                <Ring name="border" size={border} cls="bg-text/70 text-bg">
                  <Ring name="padding" size={padding} cls="bg-accent/20 text-accent">
                    <div className="grid place-items-center bg-accent text-onaccent" style={{ width: content, height: 70 }}>
                      <span className="font-mono text-[12.5px]">{content}px</span>
                    </div>
                  </Ring>
                </Ring>
              </Ring>
            </div>
          </div>
          <pre className="vw-code mt-4">{`.card {\n  box-sizing: ${sizing};\n  width: ${width}px;\n  padding: ${padding}px;\n  border: ${border}px solid;\n  margin: ${margin}px;\n}`}</pre>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              [t('content', 'tartalom', 'obsah'), content],
              [t('visible box', 'látható doboz', 'viditeľný box'), borderBox],
              [t('space taken', 'elfoglalt hely', 'zabrané miesto'), total],
            ].map(([k, v]) => (
              <div key={k} className="border border-line px-2 py-2">
                <div className="font-mono text-[16.5px] font-semibold text-text">{v}px</div>
                <div className="label mt-0.5">{k}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {sizing === 'content-box'
              ? t(`content-box: width is only the content, so the box grows to ${borderBox}px once padding and border are added.`, `content-box: a width csak a tartalom, így a padding és a border hozzáadásával a doboz ${borderBox}px lesz.`, `content-box: width je len obsah, takže po pridaní paddingu a borderu box narastie na ${borderBox}px.`)
              : t(`border-box: width includes padding and border, so the box stays ${width}px and the content shrinks instead.`, `border-box: a width tartalmazza a paddinget és a bordert, így a doboz ${width}px marad, a tartalom zsugorodik.`, `border-box: width zahŕňa padding aj border, takže box ostane ${width}px a zmenší sa obsah.`)}
          </p>
        </div>
      </div>
    </Frame>
  );
}
