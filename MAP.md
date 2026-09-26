# Folder guide

Plain-English map of this folder. Keep it current when folders change.

```
Pedivax-schedule-builder/
├── CLAUDE.md        agent guide — what the app is, the rules that don't bend
├── README.md        what the app is, and links to the mockups
├── MAP.md           this file
├── index.html       the page the app loads into
├── package.json     what libraries the app needs
├── .claude/
│   └── launch.json  tells the dev-server tool how to start this app
├── src/
│   ├── main.jsx     starts the app
│   ├── data/        the ONLY place a clinical fact is written down
│   │   ├── visits.js    the well-child visit calendar
│   │   ├── sources.js   every citable source, with edition and check date
│   │   ├── series.js    one entry per vaccine: doses, timing, the facts behind them
│   │   └── products.js  one entry per product: what it covers, its licensed ages
│   ├── logic/       the ONLY place a scheduling decision is made
│   │   ├── cover.js       may this product give this dose at this visit?
│   │   ├── seriesLength.js  which brand-length series applies?
│   │   ├── plan.js        builds the schedule
│   │   ├── score.js       counts injections and visits
│   │   └── suggest.js     "what you could add"
│   ├── ui/          the three screens
│   │   ├── App.jsx      the app shell
│   │   ├── Formulary.jsx  tick the products you stock
│   │   ├── Plan.jsx     the schedule
│   │   └── Rulebook.jsx  every rule, generated from src/data
│   └── test/        the six required tests live here
├── mockups/         clickable HTML mockups — frozen, reference only, not the real app
│   ├── formulary-planner.html   tick the products you stock, see the schedule
│   └── rulebook.html            the rules, each with its source and check date
└── docs/
    ├── decisions.md   what has been settled and what is still open
    ├── data-design.md the folder layout and the shape of the data files
    ├── updates/      where new vaccine information arrives
    │   ├── INBOX.md  paste links here as you find them — nothing else required
    │   ├── sources/  saved copies of pages and PDFs, so a quote stays traceable
    │   └── applied/  one dated note per link, saying what changed and what did not
    └── archive/       finished plans and end-of-session handoffs go here
        └── handoff-2026-09-25-b1-b2-partial.md   ← start here (supersedes the
            planning-complete handoff — B1 is done, B2 is partly done)
```

`src/data/` (B2) and `src/logic/` (B3 — `cover.js`, `seriesLength.js`, `plan.js`)
are built and tested. `score.js`, `suggest.js`, and the three UI screens
(`Formulary.jsx`, `Plan.jsx`, `Rulebook.jsx`) are not built yet (queue items
B3's remainder + B4). `App.jsx` is currently a placeholder shell.
