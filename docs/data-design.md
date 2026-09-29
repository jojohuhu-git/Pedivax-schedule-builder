# File layout and data design

Settled 2026-09-25. Nothing here is built yet — this is the shape to build to.

Every decision below traces to a line in [decisions.md](decisions.md). Where this file
and that one disagree, decisions.md wins.

---

## The rule the whole thing hangs on

> The rulebook is **generated from the same data the planner uses.**

That means the data files below are the only place a clinical fact is written down. The
planner reads the scheduling fields. The rulebook prints the documentation fields that
sit beside them. Neither screen may hold a rule of its own, and neither may work around
one it does not like.

Three things read this data — the plan, the rulebook, and the "what you could add"
suggestions. All three must go through the same two functions (`cover.js` and
`seriesLength.js`). This is the same lesson vaxapp learned the hard way with five
surfaces drifting apart; here there are three, and they are gated from the start.

---

## Folder layout

```
Pedivax-schedule-builder/
├── CLAUDE.md              agent guide — write this FIRST, from this document
├── MAP.md                 plain-English folder guide
├── README.md              what the app is
├── index.html
├── package.json           React + Vite + Vitest, matching the other apps
├── .claude/launch.json    dev server config, so `preview_start` works
├── src/
│   ├── data/              ← the only place a clinical fact lives
│   │   ├── visits.js        the well-child visit calendar
│   │   ├── sources.js       every citable source, with edition, date and snapshot
│   │   ├── series.js        one entry per antigen: doses, windows, intervals, facts
│   │   └── products.js      one entry per product: coverage, licence, ages, facts
│   ├── logic/             ← the only place a decision is made
│   │   ├── cover.js         may THIS product give THIS dose at THIS visit?
│   │   ├── seriesLength.js  how many doses, given the brands stocked?
│   │   ├── plan.js          build the schedule
│   │   ├── score.js         count injections; count visits
│   │   └── suggest.js       "what you could add"
│   ├── ui/
│   │   ├── App.jsx
│   │   ├── Formulary.jsx    the tick list
│   │   ├── Plan.jsx         the schedule
│   │   ├── Rulebook.jsx     generated from src/data — holds no rules of its own
│   │   └── print.css        the printable page
│   └── test/
├── mockups/               kept, frozen, for reference only
└── docs/
    ├── decisions.md
    ├── data-design.md     this file
    ├── updates/           where new vaccine information arrives
    └── archive/
```

Root stays `CLAUDE.md`, `MAP.md`, `README.md` — the standard layout across all the apps.

---

## The four data files

### `visits.js` — the calendar

The app speaks in **ages only**. It is a clinic protocol, not a per-child handout: no
date of birth is ever entered and no calendar date is ever printed.

```js
export const VISITS = [
  { id:'birth', label:'Birth',     ageDays:0    },
  { id:'m2',    label:'2 months',  ageDays:61   },
  { id:'m4',    label:'4 months',  ageDays:122  },
  ...
];
```

`ageDays` exists only so intervals can be checked ("is 15 months at least 6 months after
6 months?"). These are nominal ages for arithmetic, not real dates, and nothing prints
them.

`NO_VAX_VISITS` lists the Bright Futures checks this plan needs nothing at, so the
printed page can name them in one line and nobody wonders whether the app lost them.

### `sources.js` — where every sentence came from

```js
export const SOURCES = {
  cdc2025: {
    label:    'CDC child & adolescent immunization schedule 2025, notes',
    edition:  'last reviewed 2 July 2025',
    url:      'https://...',
    snapshot: '2026-09-24-cdc-child-notes-2025.html',   // in docs/updates/sources/
    tier:     'organization'
  },
  insertDaptacel: {
    label:    'Daptacel package insert',
    edition:  'revised <date>',
    snapshot: '...',
    tier:     'insert'
  }
};
```

Two fields do real work:

- **`snapshot`** — the saved copy in `docs/updates/sources/`. A URL can be replaced with
  a different edition overnight; a saved file cannot. Every quote must be findable in one.
- **`tier`** — `'organization'` or `'insert'`. The rulebook marks every `'insert'` rule
  visually, so a clinician can see at a glance which rules rest on the weaker source.
  A test enforces the settled limit: **an insert may only fill a gap, never narrow a rule
  an organization has already made.**

### `series.js` — one entry per antigen

Merges the two mockups' shapes into one. Scheduling fields and documentation fields sit
side by side, which is the whole point.

```js
{
  key:'HepA', name:'Hepatitis A', abbr:'HepA', route:'injection',
  doses:[
    { n:1, at:['m12','m15'] },
    { n:2, at:['m18'], minIntervalFromPrevDays:183 }
  ],
  facts:[
    { claim:'Two doses at least six months apart, both started in the second year.',
      source:'cdc2025', verified:'2026-09-24',
      quote:'2-dose series (minimum interval: 6 months) at age 12–23 months' }
  ]
}
```

`route:'oral'` matters — rotavirus is not a needle, and the injection count must not
pretend it is.

**Variants, for the three series where the brand sets the length.** This is the thing
that silently added an injection to the first mockup, so it is explicit:

```js
{
  key:'Hib', ...,
  variants:[
    { id:'pedvax', label:'PedvaxHIB for every dose', doseCount:3,
      requiresAllDosesFrom:['PedvaxHIB'],
      doses:[ {n:1,at:['m2']}, {n:2,at:['m4']}, {n:3,at:['m12','m15'],booster:true} ] },
    { id:'prpt',  label:'Any PRP-T product, or any mix of brands', doseCount:4,
      fallback:true,
      doses:[ ... ] }
  ]
}
```

`fallback:true` is the variant used when nothing else qualifies — mixing brands lands
here, which is exactly the rule. Hib, rotavirus and MenB are the only three series with
variants.

A dose may carry `minAgeDays`, `minIntervalFromPrevDays`, `booster:true`, and a plain
`note` for the cases with two conditions at once (polio dose 4 must be on or after 4
years **and** at least 6 months after dose 3).

### `products.js` — one entry per product

```js
{
  name:'Quadracel', kind:'combination', route:'injection',
  covers:[
    { series:'DTaP', doses:[5,5] },
    { series:'IPV',  doses:[4,5] }        // the licence is dose 4 OR 5
  ],
  minAgeDays:1461, maxAgeDays:2557,       // 4 years to 6 years
  lineage:{
    prefer:['Daptacel','Pentacel'],
    escape:'Either product may be used when the earlier brand is unknown or is the only one stocked.'
  },
  setsSeriesLength:null,                  // Pentacel and Vaxelis set {Hib:4}
  restrictions:[],                        // see below — replaced cannotBeBooster, item C 2026-09-29
  retired:null,                           // Prevnar 13 has a date here
  facts:[ ... ]
}
```

- **`covers[].doses`** is the dose-number licence, and it is the field everything else
  depends on. Pediarix is `[1,3]`. Kinrix and Quadracel are `[5,5]` for DTaP. Getting
  one of these wrong silently produces an illegal schedule.
- **`lineage`** — a preference, not a bar. This app *plans* the earlier doses so it
  always knows the brand history: it can tell a clinic stocking Daptacel and Kinrix that
  Quadracel is the matched product, and reassure one stocking only Kinrix that the escape
  clause covers them. It must never refuse a plan on lineage grounds.
- **`setsSeriesLength`** — the field that stops the mockup's silent extra injection.
- **`restrictions`** — one entry per written "not used for" rule, precise enough to name
  what the source actually says: `{ series, rule: 'not-booster', minAgeDays, source }`.
  `minAgeDays: null` bars the booster at every age (Vaxelis: never the booster for DTaP,
  IPV, or Hib); a number bars it only from that age on (Pentacel: its own dose 4 IS the
  correct 12-15-month booster, but it must not be the 4-6-year one — `minAgeDays: 1461`).
  Replaced the old blunt `cannotBeBooster: [seriesKey]` (item C, 2026-09-29) because that
  flag couldn't express Pentacel's case at all, and testing every written restriction
  against `cover.js` found most were enforced by a numeric coincidence (the dose-number
  licence, a visit-window mismatch) rather than by the rule itself — exactly the kind of
  block that silently evaporates if the numbering ever changes.
  `restrictions.test.js` has two tests guarding this: a **prose test** (a restriction-
  shaped sentence in `facts[]` with no matching entry here fails the suite, and vice
  versa) and a **reason-code test** (for each entry, `cover.js` must refuse *for that
  reason*, isolated from every numeric coincidence that happens to reach the same answer).
- **`retired`** — products are retired, never deleted, so old printed plans stay
  explainable. A retired product is hidden from the tick list and still shown in the
  rulebook.

---

## The logic layer

### `cover.js` — the single gate

**The only place that answers "may this product give this dose of this series at this
visit?"** No screen, and no other logic file, may ask that question itself. It checks, in
order: the product is stocked and not retired · the series matches · a written
`restrictions[]` entry doesn't bar this series' booster dose at this visit's age (checked
**before** the dose-number licence, so a sourced restriction is always the reported reason
when it applies, never buried behind a coincidence) · the dose number is inside
`covers[].doses` · the visit age is inside the product's min/max · the dose's own
`minAgeDays` and interval are satisfied.

This mirrors `brandRules.js` in vaxapp, which exists because local brand checks scattered
across surfaces drifted apart. An exhaustive invariant test walks every product × series
× dose number.

### `seriesLength.js` — resolving the brand commitment

For Hib, rotavirus and MenB the brand sets the length of the whole series. Settled
behaviour: **the app picks the shorter series and says why; the clinician can override.**

So this returns the chosen variant *and the sentence explaining the choice*, which the
plan prints. If the clinic stocks both Rotarix and RotaTeq the app picks Rotarix, says
"one fewer dose", and offers the switch.

### `score.js` and the needles-vs-visits tie-break

**Fewest injections is the score. Visit count is a display nicety only.**

The reasoning, recorded so nobody re-opens it: every visit in this plan is a Bright
Futures well-child check the child attends regardless, and the app never invents a
visit. An empty visit is a check-up with no shot, not a trip avoided. Injections are the
only cost the child actually bears.

The two goals can genuinely disagree, because combination products are licensed for
particular dose numbers and that licence pins a dose to a particular visit. So
`score.js` computes both, optimises on injections, and a test fails loudly on any
formulary where the visit-optimal plan differs — reporting the case rather than quietly
resolving it.

### `suggest.js` — "what you could add"

Names products the clinic did **not** tick and what stocking one would save:
*"stocking Vaxelis would save this child 4 injections."* Re-runs `plan.js` with each
unticked product added and reports the difference. It must use the same `plan.js`, never
an estimate.

---

## Tests that have to exist

| Test | What it protects |
|---|---|
| `staleness.test.js` | Any `verified` date older than twelve months fails. The tripwire that tells Joanne which quote to re-read. |
| `sources.test.js` | Every `source` key resolves; every source has a `snapshot`; no `tier:'insert'` fact narrows an organization rule. |
| `cover.test.js` | Exhaustive product × series × dose-number licence check. |
| `series-length.test.js` | Mixing Hib brands adds a dose; Rotarix 2 and RotaTeq 3; MenB is one brand throughout. |
| `needles-vs-visits.test.js` | Fails with the case whenever the two goals disagree. |
| `one-source-of-truth.test.js` | The rulebook's dose counts equal the planner's. Should be trivially true — and it stops being true the moment somebody re-implements a rule in a screen. |

---

## State

The ticked formulary goes in the URL (`?s=`) and in `localStorage`, same as vaxapp — so a
clinic can bookmark its own formulary and send it to a colleague. Nothing else is stored,
and no patient information is ever entered, so there is nothing sensitive to keep.

## Scope, unchanged

Healthy children only. No risk conditions, no catch-up, no flu or COVID inside the plan —
those sit in a disclaimer band at the top.
