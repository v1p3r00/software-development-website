import type { Lang } from '../../data/projects';

export interface GuideExample {
  weak: string;
  strong: string;
  why: string;
}

export interface GuideTopic {
  id: string;
  title: string;
  body: string;
  points?: string[];
  examples?: GuideExample[];
}

export interface Guide {
  title: string;
  subtitle: string;
  intro: string;
  weak: string;
  strong: string;
  why: string;
  topics: GuideTopic[];
  mistakesTitle: string;
  mistakesIntro: string;
  mistakeLabel: string;
  fixLabel: string;
  mistakes: { mistake: string; fix: string }[];
  cta: string;
}

const en: Guide = {
  title: 'How to write an ideal CV',
  subtitle: 'Guide',
  intro:
    'A recruiter often decides in under a minute whether to read a CV properly. These principles help yours survive that first scan — and the automated screening many companies run before a person ever sees it.',
  weak: 'Weak',
  strong: 'Strong',
  why: 'Why it works',
  topics: [
    {
      id: 'concise',
      title: 'Keep it concise and easy to scan',
      body: 'One page for early-career candidates, two pages for most experienced professionals. Recruiters skim first and read later, so make the important things findable at a glance.',
      points: [
        'Short bullet points (one or two lines) instead of paragraphs.',
        'The most recent and most relevant information first.',
        'Leave out roles older than 10–15 years unless they matter for this job.',
        'White space is not wasted space — it guides the eye.',
      ],
    },
    {
      id: 'tailor',
      title: 'Tailor the CV to the position',
      body: 'A generic CV competes with tailored ones and loses. Read the job ad, note the skills and results it asks for, and make sure those are visible — in the title, the summary and the first bullet points.',
      points: [
        'Use the same job title the ad uses, if it honestly fits you.',
        'Mirror the ad’s keywords (“stakeholder management”, “Spring Boot”) where they are true for you.',
        'Reorder bullets so the most relevant achievement comes first in each role.',
        'Keep a master CV with everything, and trim a copy for each application.',
      ],
    },
    {
      id: 'summary',
      title: 'Start with a strong professional summary',
      body: 'Three or four sentences at the top that answer: who are you, what are you best at, and what do you bring to this role? It is the part most likely to be read in full.',
      examples: [
        {
          weak: 'Hard-working, motivated team player looking for new challenges in a dynamic company.',
          strong:
            'Frontend developer with 7 years of experience building data-heavy React applications for banking clients. Led the rebuild of a customer dashboard used by 40,000 people, cutting support tickets by 30%. Looking to bring that focus on usability to a product team.',
          why: 'It names the role, the experience, a concrete result and what the candidate wants next — instead of adjectives anyone could claim.',
        },
      ],
    },
    {
      id: 'achievements',
      title: 'Describe achievements, not only responsibilities',
      body: 'A list of duties tells the reader what the job was. Achievements tell them what you did with it. A useful pattern: action verb + what you did + the result.',
      examples: [
        {
          weak: 'Responsible for the company website.',
          strong: 'Rebuilt the company website on a modern CMS, raising organic traffic by 60% in six months and halving page load time.',
          why: 'It starts with an action, shows the scope of the work and proves the impact with numbers.',
        },
        {
          weak: 'Worked on customer support tickets.',
          strong: 'Resolved 40+ customer tickets a week with a 96% satisfaction score; wrote 25 help articles that reduced repeat questions by 20%.',
          why: 'Volume, quality and a lasting improvement — the reader can picture the contribution.',
        },
        {
          weak: 'Helped with the migration to the cloud.',
          strong: 'Migrated 12 internal services to AWS with zero downtime, reducing hosting costs by €18,000 a year.',
          why: '“Helped with” hides your role. The strong version states exactly what you delivered.',
        },
      ],
    },
    {
      id: 'numbers',
      title: 'Use measurable results where possible',
      body: 'Numbers make claims believable and memorable. Think in terms of money, time, volume, quality and people. If you lack exact figures, a careful estimate (“around 30%”) is still better than nothing — as long as you can explain it in an interview.',
      points: [
        'Money: revenue gained, cost saved, budget managed.',
        'Time: faster processes, deadlines met, hours saved per week.',
        'Volume: users, clients, transactions, tickets, projects.',
        'People: team size led, people trained or mentored.',
      ],
    },
    {
      id: 'relevance',
      title: 'Prioritise relevant skills and experience',
      body: 'Not everything you have done belongs on every CV. Give the most space to what matters for this role, and shrink or remove the rest.',
      points: [
        'Experienced professionals: experience first, education short.',
        'Graduates and career changers: education, projects and transferable skills first.',
        'List the skills the job asks for before the ones it does not.',
        'Skip obvious or outdated skills (basic Word, Windows XP).',
      ],
    },
    {
      id: 'consistency',
      title: 'Use clear headings and consistent formatting',
      body: 'Standard headings (Experience, Education, Skills) let readers and software find information instantly. Consistency signals care: if one date says “03/2021”, every date should use the same format.',
      points: [
        'One date format, one bullet style, one font family throughout.',
        'Reverse chronological order within each section.',
        'Same structure for every role: title, company, dates, achievements.',
        'Language levels on one scale — for example CEFR A1–C2.',
      ],
    },
    {
      id: 'personal',
      title: 'Avoid unnecessary personal information',
      body: 'Your CV should be about your professional value. Many details that were once standard are now unnecessary — and some can invite bias.',
      points: [
        'Not needed: full street address, date of birth, marital status, children, ID numbers, religion.',
        'A city and country are enough for location.',
        'Photos: common in parts of Europe, discouraged in the UK and US — follow local practice.',
        'Use a professional email address — firstname.lastname works best.',
      ],
    },
    {
      id: 'proofread',
      title: 'Avoid spelling and grammar mistakes',
      body: 'A typo can be enough to put a CV on the “no” pile, especially for roles that require attention to detail. Proofread in more than one way.',
      points: [
        'Run a spell checker, then read the CV out loud.',
        'Read it on paper or in the PDF — mistakes look different there.',
        'Check names of companies, tools and technologies (“JavaScript”, not “Javascript”).',
        'Ask someone else to read it; fresh eyes catch what yours skip.',
      ],
    },
    {
      id: 'design',
      title: 'Keep the design professional and readable',
      body: 'Design should help the content, not compete with it. A clean layout with one accent colour looks more professional than graphics, icons and skill charts.',
      points: [
        'Body text around 10–11 pt; headings clearly larger.',
        'One or two fonts, one accent colour.',
        'Avoid skill “bars” with no meaning — “Excel ●●●●○” says little; “Excel (pivot tables, Power Query)” says more.',
        'Always send a PDF so the layout looks the same everywhere.',
      ],
    },
    {
      id: 'ats',
      title: 'Make it ATS-friendly where appropriate',
      body: 'Larger employers often use Applicant Tracking Systems that read your CV before a person does. They work best with simple, text-based layouts.',
      points: [
        'Use standard section headings and a single column (the “ATS plain” layout).',
        'No text in images, headers or footers; no tables for layout.',
        'Include the keywords from the job ad in natural sentences.',
        'Save as a text-based PDF (as this tool does) or a .docx if the portal asks for it.',
      ],
    },
  ],
  mistakesTitle: 'Common CV mistakes and how to avoid them',
  mistakesIntro: 'Most rejected CVs are not bad — they are unclear. These are the mistakes recruiters mention most often.',
  mistakeLabel: 'Mistake',
  fixLabel: 'Fix',
  mistakes: [
    { mistake: 'Sending the same CV to every job.', fix: 'Adjust the title, summary and top bullet points for each application.' },
    { mistake: 'Listing duties instead of results.', fix: 'For every role, ask: what changed because I was there? Write that down.' },
    { mistake: 'Buzzwords like “team player” or “results-driven”.', fix: 'Show the quality with an example instead of claiming it.' },
    { mistake: 'Three pages or more.', fix: 'Cut old roles, merge similar bullets and drop obvious skills.' },
    { mistake: 'Gaps or unclear dates.', fix: 'Use consistent month/year dates; a short honest line for a career break is fine.' },
    { mistake: 'Unprofessional email address.', fix: 'Create a simple firstname.lastname address for applications.' },
    { mistake: 'Fancy layouts that break in ATS software.', fix: 'Use a clean template, and the plain layout for online portals.' },
    { mistake: 'Lying or exaggerating.', fix: 'Everything on the CV can come up in the interview — be ready to back it up.' },
  ],
  cta: 'Start building your CV',
};

const hu: Guide = {
  title: 'Hogyan írj ideális önéletrajzot',
  subtitle: 'Útmutató',
  intro:
    'A toborzó gyakran egy percen belül eldönti, hogy alaposan elolvas-e egy önéletrajzot. Ezek az elvek segítenek, hogy a tiéd túléljen ezt az első átfutást — és azt az automatikus szűrést is, amelyet sok cég még azelőtt lefuttat, hogy ember látná.',
  weak: 'Gyenge',
  strong: 'Erős',
  why: 'Miért működik',
  topics: [
    {
      id: 'concise',
      title: 'Legyen tömör és könnyen átfutható',
      body: 'Pályakezdőknek egy oldal, a legtöbb tapasztalt szakembernek két oldal. A toborzók előbb átfutják, csak utána olvassák, ezért a fontos dolgokat első pillantásra meg kell találni.',
      points: [
        'Rövid, egy-két soros pontok bekezdések helyett.',
        'A legfrissebb és legrelevánsabb információ kerüljön előre.',
        'A 10–15 évnél régebbi munkahelyeket hagyd el, hacsak nem fontosak ehhez az álláshoz.',
        'Az üres tér nem elpazarolt hely — vezeti a szemet.',
      ],
    },
    {
      id: 'tailor',
      title: 'Igazítsd a megpályázott pozícióhoz',
      body: 'Az általános önéletrajz alulmarad a célzottal szemben. Olvasd el a hirdetést, jegyezd fel, milyen készségeket és eredményeket keresnek, és gondoskodj róla, hogy ezek látszódjanak — a titulusban, az összefoglalóban és az első pontokban.',
      points: [
        'Használd a hirdetésben szereplő pozíciónevet, ha valóban illik rád.',
        'Vedd át a hirdetés kulcsszavait („stakeholder management”, „Spring Boot”), ahol igazak rád.',
        'Minden munkahelynél a legrelevánsabb eredmény kerüljön az első helyre.',
        'Tarts egy mindent tartalmazó mester-önéletrajzot, és minden jelentkezéshez abból szabj egy rövidebbet.',
      ],
    },
    {
      id: 'summary',
      title: 'Kezdj erős szakmai összefoglalóval',
      body: 'Három-négy mondat a lap tetején, amely megválaszolja: ki vagy, miben vagy a legjobb, és mit hozol ebbe a pozícióba? Ezt a részt olvassák el a legnagyobb eséllyel végig.',
      examples: [
        {
          weak: 'Szorgalmas, motivált csapatjátékos vagyok, aki új kihívásokat keres egy dinamikus cégnél.',
          strong:
            'Frontend fejlesztő 7 év tapasztalattal adatintenzív React alkalmazások fejlesztésében banki ügyfeleknek. Vezettem egy 40 000 ember által használt ügyfélfelület újraírását, amely 30%-kal csökkentette a supportjegyek számát. A felhasználhatóságra való odafigyelést egy termékcsapatban szeretném kamatoztatni.',
          why: 'Megnevezi a szerepet, a tapasztalatot, egy konkrét eredményt és a következő célt — olyan jelzők helyett, amelyeket bárki állíthatna magáról.',
        },
      ],
    },
    {
      id: 'achievements',
      title: 'Eredményeket írj, ne csak feladatokat',
      body: 'A feladatlista elárulja, mi volt a munkakör. Az eredmények azt mutatják meg, mit kezdtél vele. Hasznos minta: cselekvő ige + mit csináltál + mi lett az eredménye.',
      examples: [
        {
          weak: 'A cég weboldaláért feleltem.',
          strong: 'Modern CMS-re építettem át a cég weboldalát, amivel hat hónap alatt 60%-kal nőtt az organikus forgalom, a betöltési idő pedig a felére csökkent.',
          why: 'Cselekvéssel indít, megmutatja a munka terjedelmét, és számokkal bizonyítja a hatást.',
        },
        {
          weak: 'Ügyfélszolgálati jegyekkel foglalkoztam.',
          strong: 'Heti 40+ ügyféljegyet oldottam meg 96%-os elégedettséggel; 25 súgócikket írtam, amelyek 20%-kal csökkentették az ismétlődő kérdéseket.',
          why: 'Mennyiség, minőség és tartós javulás — az olvasó el tudja képzelni a hozzájárulásodat.',
        },
        {
          weak: 'Segítettem a felhőbe költözésben.',
          strong: '12 belső szolgáltatást migráltam AWS-re leállás nélkül, évi 18 000 eurós üzemeltetési megtakarítással.',
          why: 'A „segítettem” elrejti a szerepedet. Az erős változat pontosan kimondja, mit szállítottál.',
        },
      ],
    },
    {
      id: 'numbers',
      title: 'Ahol lehet, mérhető eredményeket adj meg',
      body: 'A számok hihetővé és emlékezetessé teszik az állításokat. Gondolkodj pénzben, időben, mennyiségben, minőségben és emberekben. Ha nincs pontos adatod, egy óvatos becslés („nagyjából 30%”) is jobb a semminél — feltéve, hogy az interjún meg tudod magyarázni.',
      points: [
        'Pénz: bevételnövekedés, megtakarítás, kezelt költségvetés.',
        'Idő: gyorsabb folyamatok, tartott határidők, heti megspórolt órák.',
        'Mennyiség: felhasználók, ügyfelek, tranzakciók, jegyek, projektek.',
        'Emberek: vezetett csapat mérete, betanított vagy mentorált kollégák.',
      ],
    },
    {
      id: 'relevance',
      title: 'A releváns készségek és tapasztalatok legyenek elöl',
      body: 'Nem minden, amit valaha csináltál, kerül minden önéletrajzba. A legtöbb helyet annak add, ami ennél a pozíciónál számít, a többit rövidítsd vagy hagyd el.',
      points: [
        'Tapasztalt szakemberek: előbb a tapasztalat, a tanulmányok röviden.',
        'Pályakezdők és pályaváltók: előbb a tanulmányok, a projektek és az átvihető készségek.',
        'Az álláshoz kért készségeket sorold fel a többi előtt.',
        'Hagyd el a magától értetődő vagy elavult készségeket (alap Word, Windows XP).',
      ],
    },
    {
      id: 'consistency',
      title: 'Egyértelmű címsorok, következetes formázás',
      body: 'A megszokott címsorok (Szakmai tapasztalat, Tanulmányok, Készségek) alapján az olvasó és a szoftver is azonnal megtalálja, amit keres. A következetesség gondosságot sugall: ha az egyik dátum „2021/03”, akkor mindegyik ilyen formátumú legyen.',
      points: [
        'Egy dátumformátum, egy felsorolásstílus, egy betűcsalád végig.',
        'Fordított időrend minden szakaszon belül.',
        'Minden munkahelynél ugyanaz a szerkezet: pozíció, cég, dátumok, eredmények.',
        'A nyelvtudás egy skálán — például a KER szerinti A1–C2 szinteken.',
      ],
    },
    {
      id: 'personal',
      title: 'Kerüld a felesleges személyes adatokat',
      body: 'Az önéletrajz a szakmai értékedről szól. Sok egykor kötelező adat ma már felesleges — némelyik pedig akár előítéletet is kelthet.',
      points: [
        'Nem kell: pontos lakcím, születési dátum, családi állapot, gyermekek, igazolványszámok, vallás.',
        'Helyszínként elég a város.',
        'Fotó: Közép-Európában gyakori, az Egyesült Királyságban és az USA-ban kerülendő — kövesd a helyi szokást.',
        'Professzionális e-mail-címet használj — a vezeteknev.keresztnev formátum a legjobb.',
      ],
    },
    {
      id: 'proofread',
      title: 'Kerüld a helyesírási és nyelvtani hibákat',
      body: 'Egy elírás is elég lehet ahhoz, hogy az önéletrajz a „nem” kupacra kerüljön, főleg olyan pozíciónál, ahol a precizitás fontos. Többféleképpen is olvasd át.',
      points: [
        'Futtass helyesírás-ellenőrzést, majd olvasd fel hangosan.',
        'Olvasd el papíron vagy a PDF-ben is — ott másképp tűnnek fel a hibák.',
        'Ellenőrizd a cégek, eszközök és technológiák nevét („JavaScript”, nem „Javascript”).',
        'Kérj meg valakit, hogy olvassa el; a friss szem észreveszi, amin a tiéd átsiklik.',
      ],
    },
    {
      id: 'design',
      title: 'Professzionális, jól olvasható megjelenés',
      body: 'A design a tartalmat szolgálja, ne versenyezzen vele. Egy letisztult elrendezés egyetlen kiemelőszínnel profibb, mint a grafikák, ikonok és készségdiagramok.',
      points: [
        'Törzsszöveg kb. 10–11 pont, a címsorok érezhetően nagyobbak.',
        'Egy-két betűtípus, egy kiemelőszín.',
        'Kerüld az értelmetlen készség-„csíkokat” — az „Excel ●●●●○” keveset mond, az „Excel (pivot táblák, Power Query)” sokkal többet.',
        'Mindig PDF-et küldj, hogy mindenhol ugyanúgy nézzen ki.',
      ],
    },
    {
      id: 'ats',
      title: 'Legyen ATS-barát, ahol szükséges',
      body: 'A nagyobb munkáltatók gyakran jelentkeztető rendszert (ATS) használnak, amely előbb olvassa az önéletrajzot, mint egy ember. Ezek az egyszerű, szövegalapú elrendezéssel működnek a legjobban.',
      points: [
        'Megszokott címsorok és egyetlen hasáb (az „ATS-barát” elrendezés).',
        'Ne legyen szöveg képben, fejlécben vagy láblécben; ne használj táblázatot a tördeléshez.',
        'A hirdetés kulcsszavai természetes mondatokban szerepeljenek.',
        'Szövegalapú PDF-et ments (ahogy ez az eszköz is), vagy .docx-et, ha a felület azt kéri.',
      ],
    },
  ],
  mistakesTitle: 'Gyakori hibák és elkerülésük',
  mistakesIntro: 'A legtöbb elutasított önéletrajz nem rossz — csak nem elég világos. Ezeket a hibákat említik a toborzók a leggyakrabban.',
  mistakeLabel: 'Hiba',
  fixLabel: 'Megoldás',
  mistakes: [
    { mistake: 'Ugyanazt az önéletrajzot küldöd minden helyre.', fix: 'Minden jelentkezésnél igazítsd a titulust, az összefoglalót és az első pontokat.' },
    { mistake: 'Feladatokat sorolsz eredmények helyett.', fix: 'Minden munkahelynél kérdezd meg: mi változott attól, hogy ott voltam? Ezt írd le.' },
    { mistake: 'Közhelyek, mint „csapatjátékos” vagy „eredményorientált”.', fix: 'Állítás helyett mutasd meg a tulajdonságot egy példán keresztül.' },
    { mistake: 'Három vagy több oldal.', fix: 'Húzd ki a régi munkahelyeket, vond össze a hasonló pontokat, hagyd el a magától értetődő készségeket.' },
    { mistake: 'Hézagok vagy homályos dátumok.', fix: 'Következetes év/hónap dátumok; egy rövid, őszinte sor egy kihagyott időszakról teljesen rendben van.' },
    { mistake: 'Nem professzionális e-mail-cím.', fix: 'Hozz létre egy egyszerű vezeteknev.keresztnev címet a jelentkezésekhez.' },
    { mistake: 'Látványos elrendezés, amelyet az ATS nem tud olvasni.', fix: 'Letisztult sablon, online felületekre pedig az egyszerű elrendezés.' },
    { mistake: 'Hazugság vagy túlzás.', fix: 'Az önéletrajz minden pontja előkerülhet az interjún — legyél kész alátámasztani.' },
  ],
  cta: 'Kezdd el az önéletrajzodat',
};

export const guides: Record<Lang, Guide> = { en, hu };
