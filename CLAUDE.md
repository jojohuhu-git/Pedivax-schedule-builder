# Pedivax Schedule Builder — Agent Guide

## What This App Is

A clinician ticks the vaccine products their clinic actually stocks. The app plans the
most efficient birth-to-18 schedule those products can deliver, for a **healthy child
with no prior vaccines**. Client-side React SPA — no backend, no auth, no database.

**It speaks in ages only.** This is a clinic protocol, not a per-child handout: no date
of birth is ever entered, and no calendar date is ever printed. Contrast with vaxapp,
which validates one real child's real-dated history — this app plans a hypothetical
child's schedule from age zero.

This is a separate app from vaxapp/PediVax. **vaxapp is not a port target** — the owner
is rebuilding it. Copy useful logic *out* of vaxapp; file nothing back into it.
MeningoVax and PneumoVax remain live parity targets for meningococcal/pneumococcal rules.

## The one rule everything else hangs on

> **The rulebook is generated from the same data the planner uses.**

`src/data/` is the only place a clinical fact is written down. The planner reads the
scheduling fields; the rulebook prints the documentation fields beside them. Neither
screen — and no logic file other than `cover.js` and `seriesLength.js` — may decide a
rule for itself. `one-source-of-truth.test.js` enforces that the rulebook's dose counts
equal the planner's.

## Start Here

```bash
npm install
npm run dev        # dev server, port 5187
npm test           # Vitest test suite
npm run build      # production build to dist/
```

Dev server: start at the beginning of every session using the `preview_start` tool with
name `"Pedivax Schedule Builder dev server"`, config at `.claude/launch.json`.

All public asset paths MUST use `import.meta.env.BASE_URL` (Vite sets
`base: '/Pedivax-schedule-builder/'`, matching the GitHub repo name exactly — Pages
paths are case-sensitive).

## Source of Truth Files

| What | Where |
|---|---|
| Plain-English folder guide (owner is a non-coder) | [MAP.md](MAP.md) |
| Settled owner decisions + still-open items | [docs/decisions.md](docs/decisions.md) |
| Folder layout and the shape of the data files | [docs/data-design.md](docs/data-design.md) |
| Where new vaccine information goes | [docs/updates/INBOX.md](docs/updates/INBOX.md) |
| Session history / handoffs | [docs/archive/](docs/archive/) |

`docs/decisions.md` and `docs/data-design.md` are authoritative. Where a mockup in
`mockups/` (frozen, reference-only) disagrees with either, the docs win — the mockup
data is explicitly draft and has already produced at least one silently wrong schedule
(see "Found while mocking up" in decisions.md).

## The Four Data Files (`src/data/`)

- **`visits.js`** — the well-child visit calendar. `ageDays` is nominal, for interval
  arithmetic only — nothing prints it, and nothing here is a real date.
- **`sources.js`** — every citable source: label, edition, URL, a `snapshot` filename
  (the saved copy in `docs/updates/sources/`, because a live URL can be replaced), and a
  `tier` of `'organization'` or `'insert'`.
- **`series.js`** — one entry per antigen: doses, windows, intervals, and the `facts[]`
  that carry `claim` / `source` / `verified` / `quote`. Hib, rotavirus and MenB carry a
  `variants[]` array because the brand chosen sets the length of the whole series — the
  thing that silently added an extra injection to the first mockup.
- **`products.js`** — one entry per product: `covers[].doses` (the dose-number licence —
  get this wrong and the schedule is illegal), `lineage` (a preference, never a bar),
  `setsSeriesLength`, `cannotBeBooster`, `retired` (products are retired, never deleted).

Full field shapes and worked examples: [docs/data-design.md](docs/data-design.md).

## The Logic Layer (`src/logic/`)

- **`cover.js`** — the single gate. The only place that answers "may this product give
  this dose of this series at this visit?" No screen and no other logic file may ask
  that question itself. Mirrors `brandRules.js` in vaxapp, for the same reason: local
  brand checks scattered across surfaces drift apart.
- **`seriesLength.js`** — for Hib, rotavirus and MenB, returns the chosen variant *and
  the sentence explaining the choice*. Settled behavior: **pick the shorter series, say
  why, let the clinician override.**
- **`plan.js`** — builds the schedule from `cover.js` + `seriesLength.js`.
- **`score.js`** — **fewest injections is the score; visit count is a display nicety
  only.** The two can genuinely disagree (combination products are licensed for
  particular dose numbers, which pins a dose to a particular visit) — `score.js`
  computes both and a test fails loudly on any formulary where they disagree, rather
  than silently resolving it.
- **`suggest.js`** — "what you could add": re-runs `plan.js` with each unticked product
  added and reports the difference. Must use `plan.js` itself, never an estimate.

## Non-Negotiable Rules

### Root Directory Hygiene
Only `CLAUDE.md`, `MAP.md`, and `README.md` live at the repo root. Session notes,
handoffs, and finished plans go to `docs/archive/`. Keep `MAP.md` current when folders
change.

### Clinical Authority — pinned edition
This app follows guidance **as it stood before the federal changes that began mid-2025**,
plus AAP (which has kept publishing its own schedule). Where AAP and CDC 2025 disagree,
**AAP governs** — same rule as vaxapp/MeningoVax/PneumoVax. Full verified timeline and
the two known AAP/CDC disagreements (MMRV preference; MenQuadfi's minimum age) are in
[docs/decisions.md](docs/decisions.md). Never adopt a post-mid-2025 federal change.

Each product carries **two** minimum ages: the package-insert age, and the age
CDC/ACIP/AAP say it may be used from. Where they differ, CDC/ACIP/AAP wins — record the
insert age anyway so the gap is visible.

**A package insert may fill a gap in organization guidance; it may never narrow a rule
an organization has already made.** `sources.test.js` enforces this.

### Verify Before Writing a Clinical Fact
Before any `series.js`, `products.js`, or `sources.js` entry goes in, use the
`verify-clinical-source` skill: fetch the authoritative page live and quote it. Never
transcribe from the frozen mockups or from memory — the mockup data is draft and has
already been wrong once (see decisions.md).

### Staleness
Every fact's `verified` date is checked by `staleness.test.js`: a date older than twelve
months fails the suite. That failure is the prompt to go re-read the source, not a bug.

### Scope, v1
Healthy children only — no asplenia, HIV, transplant, or other risk conditions. No
catch-up logic. Flu and COVID sit in a disclaimer band at the top, never inside the plan.

## Testing Expectations

Six tests are required to exist (see [docs/data-design.md](docs/data-design.md) for
what each protects): `staleness.test.js`, `sources.test.js`, `cover.test.js`,
`series-length.test.js`, `needles-vs-visits.test.js`, `one-source-of-truth.test.js`.

No real-clock dependency exists anywhere in this app (ages only, no calendar dates), so
unlike vaxapp/MeningoVax there is no frozen-`Date` fixture pattern to maintain.

## State

The ticked formulary lives in the URL (`?s=`) and in `localStorage` — a clinic can
bookmark or share its own formulary. Nothing else is stored; no patient information is
ever entered.

## Branch & Deploy

Repo is **public** on GitHub (`jojohuhu-git/Pedivax-schedule-builder`) and currently
empty. **Ask before the first push.** Once initialized, follow the `ship` skill for
branch/PR/merge rules.
