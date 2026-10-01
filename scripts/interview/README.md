# Interview question sets

`raw/<track>.<lang>.txt` holds the question sets in the plain-text format they were written in
(ChatGPT, prompted in Hungarian, then translated to English with the code kept identical):

```
### Q12
LEVEL: junior | medior | senior
TOPIC: Closures
TYPE: output | theory | debug | behavior | performance | async | edgecase | trap | production | algorithm
QUESTION: …
CODE:
…            (optional, may repeat; text between listings becomes a // comment)
ENDCODE
A) …
B) …
C) …
D) …
ANSWER: B
EXPLANATION: … (may span lines)
###END
```

`node scripts/interview/parse.mjs javascript` turns them into `src/data/interview/<track>.<lang>.json`
and warns about missing fields, answers that differ between the languages and gaps in the numbering.
It also groups the free-form topics into areas (labels in `src/data/interview/index.ts`) and marks
questions whose explanation names options by letter as `fixed`; all others get shuffled options.

New track: add the raw files, run the parser, add an entry to `tracks` in `src/data/interview/index.ts`
and its title/blurb keys under `interview` in `src/i18n/en.ts` / `hu.ts`, plus a route in `scripts/seo.ts`.
