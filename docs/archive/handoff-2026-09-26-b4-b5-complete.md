# Pedivax Schedule Builder — Handoff after B4/B5 complete (2026-09-26)

**Supersedes:** `handoff-2026-09-26-b3-plan-js.md` (and, transitively, the two
2026-09-25 handoffs it already superseded). Read this one.

Branch: `main`. This repo has **no branch protection** (confirmed live via
`gh api repos/jojohuhu-git/Pedivax-schedule-builder/branches/main/protection`
→ 404 "Branch not protected") and every commit so far has gone straight to
`main` — that has been the established habit since the repo's first push.
This session's two commits are already pushed.

Baseline at session start was 186 passing tests (4 files) at commit `5a8a64d`.
Now **467 passing (11 files)**, all green, working tree clean, pushed at
commit `46480f5`. `npm run build` is clean.

## What's done this session

1. **PCV20 vs PCV15 labeling** (commit `e141e2a`). Owner asked: make it clear
   Prevnar 20 and Vaxneuvance are not the same product (different serotype
   coverage) even though this app schedules them identically. Added a
   `commonName` field to `products.js` (`PCV20`, `PCV15`, and `PCV13` on the
   retired Prevnar 13); the checklist, the schedule's shot tags, and the
   "what you could add" panel all now show that instead of the ambiguous
   shared `PCV` series abbreviation.
2. **Schedule wording, from live feedback on the running app** (same
   commit). A dose tag now says "Dose 1 of 4", not just "Dose 1" — the total
   matters because a combination product can silently commit a whole series
   to a longer path (Hib via Pentacel is 4, via PedvaxHIB alone is 3). A
   combination shot gets a plain lead-in line ("One injection, 3 vaccines —
   covers:"). The note explaining a shifted dose now reads as clinical
   scheduling language ("Earliest due at 1 month; scheduled at 2 months
   instead to combine with another vaccine due at that visit") instead of
   casual prose the owner flagged as not clinician-friendly.
3. **B4 finished: `Rulebook.jsx` and `src/ui/print.css`** (commit `46480f5`).
   The rulebook prints every series and product straight from `src/data` —
   nothing re-derived, per CLAUDE.md's "the rulebook is generated from the
   same data the planner uses." Includes a "Jump to:" row linking to each
   antigen's section (owner asked for this live) and a Plan/Rulebook toggle
   in the header. `print.css` hides the tick list, the toggle, and the print
   button itself so only the schedule or rulebook actually prints.
4. **B5 finished: all six required tests now exist** (commit `46480f5`).
   `staleness.test.js`, `sources.test.js`, `one-source-of-truth.test.js` were
   the three missing ones. `sources.test.js`'s "an insert may never narrow an
   organization rule" check is mechanical, not just a naming convention: it
   mutates each product's insert-only age fields and proves `cover.js`'s
   `canCover()` never changes its answer, for every dose that product is
   actually licensed for. `one-source-of-truth.test.js` builds the exact
   formulary that should commit the planner to each series/variant's dose
   count and checks `plan.js` actually lands on the number the rulebook
   prints.

All four items are recorded in `docs/decisions.md`'s Settled table (items 1-2
under 2026-09-26 rows near the bottom).

## What's NOT done — the remaining queue

- **P2 — Deploy workflow.** Unlike vaxapp/MeningoVax/PneumoVax, this repo has
  no `.github/workflows/` at all yet — no CI test gate, no GitHub Pages
  deploy. The app has never been deployed; it only runs from `npm run dev`
  today. Ask the owner before setting this up (it changes how the repo
  behaves on every future push) and confirm whether Pages should even be
  public yet, since the app isn't announced as finished.
- **P2 — Prevnar 13's 30 April 2024 retirement date is still not verified
  from a live-read sentence** (two sessions running — the Medline PDF
  returns HTTP 403). Recorded honestly as unverified in `products.js`'s own
  facts and in `docs/decisions.md`'s "Still open" list; don't upgrade it to
  a plain fact without an actual live read.
- **P2 — CDC 2025 quotes are not yet snapshotted into the data files**, per
  `docs/decisions.md`'s "Still open" — they currently rest on a live URL
  (`docs/updates/sources/`) that could be replaced out from under the app.
- **P3 — the mockups' own elaborate "whole schedule on one screen" grid and
  two-pane nav rail were deliberately NOT rebuilt** in `Rulebook.jsx` — this
  session scoped the rulebook as a clear list-per-series-and-product page
  instead, which satisfies CLAUDE.md's actual requirement ("generated from
  the same data the planner uses," dose counts provably matching) without
  the mockup's extra visual complexity. If the owner wants the mockup's grid
  view specifically, that's a new, separate ask — don't assume it's owed.

## Why this is a good stopping point

Every item CLAUDE.md names as required for v1 (`src/data`, `src/logic`, all
three UI screens, all six named tests) now exists and is tested — B3, B4, and
B5 are each fully done, not partial. The remaining queue is deploy
infrastructure and two data-provenance footnotes, none of which block using
the app locally today. Nothing here is mid-edit.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git checkout main`
2. `npm test` — confirm **467 passing (11 files)** before any new work.
3. Ask the owner, don't default: (a) is it time to set up CI + GitHub Pages
   deploy, and should the Pages site be public yet; (b) does she want the
   Prevnar 13 date re-verification attempted again (may need a different
   tool than this session's poppler-less PDF read); (c) is there any new
   antigen/product data to bring in from `docs/updates/INBOX.md`.
4. This app has no per-item finding queue like vaxapp's fix-queue — new work
   here is either a new vaccine-data addition (use `verify-clinical-source`
   before writing any clinical fact) or a UI/copy refinement like this
   session's. Either way: change, run the full suite, live-verify in the
   browser (`preview_start` with `.claude/launch.json`'s
   `"Pedivax Schedule Builder dev server"` config, port 5187), then commit.
5. No branch protection; direct commits to `main` are this repo's
   established habit. Still run the full suite green before every push.
