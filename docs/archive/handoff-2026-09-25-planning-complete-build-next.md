# Pedivax-schedule-builder — Handoff after planning completed (2026-09-25)

**SUPERSEDED 2026-09-25 — see
[handoff-2026-09-25-b1-b2-partial.md](handoff-2026-09-25-b1-b2-partial.md).** B1 (the
scaffold this file said was "nothing has been built") is now done, and B2 is roughly a
third done (visits.js, HepB, Rotavirus, Hib, MenB). Everything below is historical.

Repo: `~/Downloads/Pedivax-schedule-builder`.
GitHub: https://github.com/jojohuhu-git/Pedivax-schedule-builder — **public, and
completely empty.** No branches, no commits.

**Verified state, not remembered — all three of these are unusual, read them:**

- **This folder is not a git repository.** `git status` → *"fatal: not a git repository"*.
  Nothing here has ever been committed.
- **There is no test suite and no `package.json`.** There is no passing count to quote,
  and nothing to run. Do not write "tests green" anywhere until a suite exists.
- **There is no application.** Nine files, all documents and two frozen HTML mockups:

  ```
  MAP.md  README.md
  docs/decisions.md  docs/data-design.md
  docs/updates/INBOX.md  docs/updates/applied/README.md  docs/updates/sources/README.md
  mockups/formulary-planner.html  mockups/rulebook.html
  ```

## What the app is

A clinician ticks the vaccine products their clinic actually stocks. The app plans the
most efficient birth-to-18 schedule those products can deliver, for a healthy child with
no prior vaccines. **It speaks in ages only — a clinic protocol, not a per-child
handout.** No date of birth is ever entered and no calendar date is ever printed.

The promise the whole design rests on: **the rulebook page is generated from the same
data the planner uses.** Every clinical rule carries its source, the exact quoted
sentence, and the date somebody last read it live.

## What's done

1. **All owner decisions are settled** — `docs/decisions.md`. Nineteen settled rows.
   Eight were answered on 2026-09-25 and are the ones a previous plan would not have had:
   ages-only; app picks the shorter Hib/rotavirus/MenB series and says why with an
   override; HPV is always the 2-dose series; **fewest injections is the score and visit
   count is only a display nicety**; a package insert may fill a gap but never narrow an
   organization's rule; "what you could add" ships; one update inbox per repo; and
   **vaxapp is no longer a port target**.
2. **The file layout and data design are settled** — `docs/data-design.md`, 271 lines.
   Four data files, five logic files, the single-gate rule, and the six tests that have
   to exist. This is the document to build from.
3. **A place for new vaccine information exists** — `docs/updates/`. `INBOX.md` takes
   bare pasted links; `sources/` holds snapshotted pages so a quote stays traceable when
   a URL is replaced; `applied/` takes one dated note per processed link. The handling
   rules are written inside `INBOX.md`.
4. **Two clinical facts verified live** (recorded under *Verified 2026-09-25* in
   decisions.md, with the quotes):
   - **PCV7 has no discontinuation date in any authoritative source.** MMWR 59(9)
     (12 March 2010) and MMWR RR-59(11) were both read in full; neither says PCV7 stopped
     being produced. The honest entry is *"replaced by PCV13, February 2010"*. Do not
     write a discontinuation date — there isn't one to write.
   - **Prevnar 13's 30 April 2024 date is NOT properly verified.** It comes from the
     *title* of Pfizer's discontinuation letter, not a sentence: the PDF returned HTTP
     403 and could not be opened. It is on the open list to re-fetch.

## What's NOT done — the queue

Nothing has been built. In order:

**B1 — Scaffold the app and write `CLAUDE.md`.** React + Vite + Vitest matching the other
apps, `.claude/launch.json` so `preview_start` works, `git init`, first commit. Write
`CLAUDE.md` from `docs/data-design.md` — it was deliberately not written until the
structure was settled, and now it is.

**B2 — Build the four data files** (`src/data/visits.js`, `sources.js`, `series.js`,
`products.js`) from the two mockups plus the shapes in `docs/data-design.md`. The mockup
data is draft: every row needs its source, quote and `verified` date.

**B3 — Build the logic layer.** `cover.js` is the single gate — the only place that
answers "may this product give this dose at this visit?". Nothing else may ask it.

**B4 — Build the three screens** (formulary, plan, rulebook) plus the printable page.

**B5 — Write the six tests** named in `docs/data-design.md`, including the staleness
tripwire and the needles-vs-visits disagreement test.

**Open clinical items, none blocking the build:**
- Re-fetch Pfizer's Prevnar 13 letter to confirm 30 April 2024 from a sentence.
- Snapshot the CDC 2025 quotes into `docs/updates/sources/`.
- Read the inserts for the 16 single-antigen brand rules still marked unverified. The
  *rule* for how to treat an insert is settled; the reading is not done.

## Why this is a good stopping point

Every decision the build depends on is answered and written down, so the next session can
start typing code without asking anything. Nothing is half-built — there is no partial
scaffold to reconcile, no uncommitted work, and no branch to find. The two mockups are
frozen reference and are not in the way.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder`
2. **Read `docs/decisions.md` first, then `docs/data-design.md`.** Do not re-litigate
   anything in the settled table — those are owner decisions, apply them.
3. There is nothing to check out and no suite to run. Confirm the state instead:
   `git status` should still say "not a git repository" until B1 does `git init`.
4. Start at **B1**. It is the only item with a hard ordering constraint; B2–B5 follow it
   naturally.
5. Follow the owner's standing rules: plain English in every commit message and PR body;
   the `verify-clinical-source` skill before any clinical rule goes into a data file —
   fetch the page live and quote it, never transcribe from a mockup or from memory. The
   mockup data is explicitly marked draft.
6. **Push policy: ask before the first push.** The GitHub repo is **public** and empty,
   so the first push publishes this app to the world. Once it is initialised, use the
   `ship` skill for the branch/PR/merge rules.
7. **vaxapp is not a port target.** The owner is rebuilding it. Copy useful logic *out*
   of `~/Downloads/vaxapp-main`; file nothing back *into* it. MeningoVax and PneumoVax
   are still live parity targets.
