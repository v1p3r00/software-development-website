import { useEffect, useState } from 'react';
import { Frame, Seg, Stepper, tr } from './Frame';
import type { WidgetProps } from './Frame';
import { useAutoplay } from './useAutoplay';

type Case = 'ok' | 'invalid' | 'duplicate';
const LAYERS = ['Client', 'Controller', 'Service', 'Repository', 'Database'] as const;
type L = (typeof LAYERS)[number];

interface Step {
  at: L;
  dir: 'down' | 'up';
  data: string;
  en: string;
  hu: string;
  bad?: boolean;
}

function steps(c: Case): Step[] {
  const req: Step = { at: 'Client', dir: 'down', data: c === 'invalid' ? 'POST /api/tasks\n{ "title": "" }' : 'POST /api/tasks\n{ "title": "Buy milk", "dueDate": "2026-10-10" }', en: 'The client sends JSON over HTTP.', hu: 'A kliens JSON-t küld HTTP-n.' };
  const ctrl: Step = { at: 'Controller', dir: 'down', data: 'CreateTaskRequest(title="Buy milk", dueDate=2026-10-10)', en: '@RestController maps the URL and turns JSON into a request DTO; @Valid checks it.', hu: 'A @RestController leképezi az URL-t, a JSON-ból kérés-DTO lesz; a @Valid ellenőrzi.' };
  if (c === 'invalid')
    return [
      req,
      { ...ctrl, data: 'CreateTaskRequest(title="")\n@NotBlank title → violation', en: 'Validation fails in the controller layer — the service is never called.', hu: 'Az ellenőrzés a controller rétegben elbukik — a service-t meg sem hívjuk.', bad: true },
      { at: 'Client', dir: 'up', data: '400 Bad Request\n{ "errors": { "title": "must not be blank" } }', en: 'A @RestControllerAdvice turns the exception into a clear 400 response.', hu: 'Egy @RestControllerAdvice világos 400-as válasszá alakítja a kivételt.', bad: true },
    ];
  const svc: Step = { at: 'Service', dir: 'down', data: 'taskService.create(request)\n→ rule: title must be unique per user', en: 'The service holds the business rules and the transaction (@Transactional).', hu: 'A service tartalmazza az üzleti szabályokat és a tranzakciót (@Transactional).' };
  const repoCheck: Step = { at: 'Repository', dir: 'down', data: 'taskRepository.existsByOwnerAndTitle(…)', en: 'The repository is the only layer that talks to the database.', hu: 'A repository az egyetlen réteg, amely az adatbázissal beszél.' };
  if (c === 'duplicate')
    return [
      req,
      ctrl,
      svc,
      repoCheck,
      { at: 'Database', dir: 'up', data: 'SELECT … → true', en: 'A task with this title already exists.', hu: 'Már létezik ilyen című feladat.' },
      { at: 'Service', dir: 'up', data: 'throw new DuplicateTaskException(title)', en: 'The rule is broken, so the service throws a domain exception.', hu: 'Sérül a szabály, ezért a service domain-kivételt dob.', bad: true },
      { at: 'Client', dir: 'up', data: '409 Conflict\n{ "error": "Task \\"Buy milk\\" already exists" }', en: 'The exception handler maps it to 409 Conflict.', hu: 'A kivételkezelő 409 Conflict válasszá alakítja.', bad: true },
    ];
  return [
    req,
    ctrl,
    svc,
    { at: 'Repository', dir: 'down', data: 'taskRepository.save(new Task(…))', en: 'The service builds an entity and asks the repository to save it.', hu: 'A service entitást épít, és megkéri a repositoryt, hogy mentse.' },
    { at: 'Database', dir: 'down', data: "INSERT INTO task (title, due_date, owner_id)\nVALUES ('Buy milk', '2026-10-10', 7)", en: 'Hibernate generates the SQL.', hu: 'A Hibernate legenerálja az SQL-t.' },
    { at: 'Repository', dir: 'up', data: 'Task(id=43, title="Buy milk", …)', en: 'The saved entity comes back with its generated id.', hu: 'A mentett entitás a generált azonosítóval jön vissza.' },
    { at: 'Service', dir: 'up', data: 'TaskResponse(id=43, title="Buy milk", dueDate=2026-10-10)', en: 'The entity is mapped to a response DTO — internal fields stay hidden.', hu: 'Az entitásból válasz-DTO lesz — a belső mezők rejtve maradnak.' },
    { at: 'Controller', dir: 'up', data: 'ResponseEntity.created(URI("/api/tasks/43")).body(dto)', en: 'The controller picks the status code and headers.', hu: 'A controller választja ki az állapotkódot és a fejléceket.' },
    { at: 'Client', dir: 'up', data: '201 Created\nLocation: /api/tasks/43\n{ "id": 43, "title": "Buy milk", "dueDate": "2026-10-10" }', en: 'JSON goes back to the client.', hu: 'A JSON visszamegy a kliensnek.' },
  ];
}

export default function LayeredRequest({ lang }: WidgetProps) {
  const t = tr(lang);
  const [c, setC] = useState<Case>('ok');
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const all = steps(c);
  useEffect(() => setI(0), [c]);
  useAutoplay(playing, i, all.length, setI, setPlaying, 1900);
  const s = all[Math.min(i, all.length - 1)];
  return (
    <Frame lang={lang} title={t('A request through the layers', 'Egy kérés útja a rétegeken át')} hint={t('Follow a POST through Controller → Service → Repository and back. Try the failure cases too.', 'Kövess végig egy POST-ot: Controller → Service → Repository és vissza. Próbáld ki a hibás eseteket is.')}>
      <Seg
        label="case"
        value={c}
        onChange={setC}
        options={[
          { v: 'ok', l: t('Valid request', 'Érvényes kérés') },
          { v: 'invalid', l: t('Blank title', 'Üres cím') },
          { v: 'duplicate', l: t('Duplicate title', 'Ismétlődő cím') },
        ]}
      />
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,12rem)_1fr]">
        <ol className="grid gap-1.5">
          {LAYERS.map((l) => {
            const on = l === s.at;
            return (
              <li key={l} className={'flex items-center justify-between border px-3 py-2 font-mono text-[14px] transition-colors ' + (on ? (s.bad ? 'border-[#e5484d] bg-[#e5484d]/10 text-[#e5484d]' : 'border-accent bg-accent/15 text-accent') : 'border-line text-muted')}>
                {l}
                {on && <span>{s.dir === 'down' ? '↓' : '↑'}</span>}
              </li>
            );
          })}
        </ol>
        <div className="min-w-0">
          <pre className={'vw-code min-h-[5.5rem] !whitespace-pre-wrap ' + (s.bad ? '!border-[#e5484d]/60' : '')}>{s.data}</pre>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{s[lang]}</p>
        </div>
      </div>
      <div className="mt-4">
        <Stepper lang={lang} i={i} n={all.length} setI={setI} playing={playing} setPlaying={setPlaying} />
      </div>
    </Frame>
  );
}
