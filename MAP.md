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
│   │   ├── App.jsx      the app shell — owns the ticked formulary, syncs ?s= + localStorage
│   │   ├── Formulary.jsx  tick the products you stock
│   │   ├── Plan.jsx     the schedule
│   │   ├── Rulebook.jsx  every rule, generated from src/data, with a jump-to-antigen nav
│   │   ├── print.css    hides the tick list/nav so only the schedule or rulebook prints
│   │   └── theme.css    design tokens + component styles, from the frozen mockups
│   └── test/        the six required tests, plus UI rendering tests for each screen
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
        └── handoff-2026-09-26-b3-plan-js.md   ← superseded by this file's own
            summary below (B3 fully done; Formulary.jsx/Plan.jsx now built too) —
            see git log for a fresher handoff once one is written
```

`src/data/` (B2) and `src/logic/` (B3 — `cover.js`, `seriesLength.js`, `plan.js`,
`score.js`, `suggest.js`) are all built and tested — B3 is done. B4 (all three
screens — `App.jsx`, `Formulary.jsx`, `Plan.jsx`, `Rulebook.jsx`, `print.css`)
is built, live-verified, and tested. All six required tests exist and pass —
B5 is done. See `docs/archive/` for the latest handoff.
