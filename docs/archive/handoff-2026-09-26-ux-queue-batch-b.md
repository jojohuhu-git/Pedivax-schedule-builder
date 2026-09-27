> **Superseded by `docs/archive/handoff-2026-09-26-ux-queue-batch-c.md`** — Batch C
> (this handoff's own "Resuming" step 3) is now done and its PR is open. Read the newer
> file for the current state.

# Pedivax Schedule Builder — Handoff after UX copy queue Batch A + Batch B (2026-09-26)

> Supersedes `docs/archive/handoff-2026-09-27-ux-queue-batch-a.md` — that handoff's
> "Resuming" steps (merge PR #1, then start Batch B) are both done; don't re-do them.

Branch: `main`. Clean, up to date with `origin/main`, at commit `4c593cb`.

Baseline at session start was 479 passing tests (PR #1 open, not yet merged). This
session merged PR #1, then did Batch B and merged PR #2. Now **483 passing (11 test
files)**, all green, `npm run build` green, and the GitHub Pages deploy for both merges
succeeded (`gh run list` — both `Tests` and `Deploy to GitHub Pages` runs show `ok`).

## What's done (by item ID)

1. **PR #1 (Batch A, from the prior session) — merged**, squash, branch deleted.
   `https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/1`.
2. **B1** (P0) — the MenB "both brands stocked" note no longer says "the clinician can
   switch to the other brand instead" (misleading — reads as *mid-series* brand
   switching, which isn't allowed). Now states the same-brand rule directly. Also fixed
   the seam bug where one brand mention kept "for both doses" and the other had it
   stripped off (`.replace()` on only one side).
3. **B2** (P1) — each of the 8 relevant variants (HepB monovalent/combo, RV
   rotarix/rotateq, Hib pedvax/prpt, MenB bexsero/trumenba) now carries its own
   `chosenNote` (or `noun`, for MenB) in `src/data/series.js`. `seriesLength.js` selects
   the right one instead of assembling a sentence from `label` (which stays reserved for
   the rulebook heading, unchanged). `one-source-of-truth.test.js` untouched and still
   green.
4. **B3** (P1) — all four series' notes rewritten to open with the current dose count and
   ages, never with what the clinic *doesn't* stock, and never inviting a switch to the
   longer path. Verified the exact wording live (see below) matches what the queue
   specified for HepB/RV/Hib fallback and shorter-path cases.
5. **B4** (P2) — panel heading renamed from "Why some series are longer or shorter than
   expected" to "Dose counts set by the brands you stock" (`src/ui/Plan.jsx`).
6. **PR #2 (Batch B) — merged**, squash, branch deleted.
   `https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/2`.

Commit: `4c593cb` (all of B1–B4, one commit). Tests updated in the same commit:
`src/test/series-length.test.js`, `src/test/plan.test.js`, `src/test/Plan.test.jsx` —
old assertions on the removed "switch"/"None of the shorter..." wording replaced with
assertions on the new text (and explicit `.not.toMatch(/switch/i)` / `.not.toMatch(/none
of the/i)` checks so the old bug can't silently come back).

**Not touched, deliberately:** `src/logic/plan.js`'s own separate note generator (the
"Stocking a product that already covers another dose at the same visit (a combination
product) commits this series to N doses here..." message, used when the cluster search
overrides `resolveSeriesLength`'s pick because a combo product is stocked). That sentence
isn't in the Batch B queue text at all — only `seriesLength.js`'s own notes were in scope.
Verified live it still reads correctly and is unaffected.

## Live verification (three formularies, per the queue's own STOP line)

Connected to an already-running dev server from another session on this same repo
(`http://localhost:5188/Pedivax-schedule-builder/` — Vite serves from disk, so it picked
up this session's edits via HMR) rather than starting a new one; the folder was already at
its 5-server-per-folder limit.

1. **Nothing stocked (gap)** — HepB/RV/Hib all show their fallback `chosenNote`. No
   "None of the shorter-series products are stocked" text anywhere.
2. **Combination-heavy** (Engerix-B + PedvaxHIB + Vaxelis + Pentacel) — HepB and Hib
   correctly show `plan.js`'s override note (combo product forces the longer path even
   though the shorter one is stocked); RV shows its fallback `chosenNote`. Confirms the
   two note sources still cooperate correctly.
3. **Shorter-series** (Engerix-B + PedvaxHIB + Rotarix + Bexsero + Trumenba) — HepB, RV,
   and Hib each show their shorter-path `chosenNote`; MenB shows the rewritten
   both-stocked note verbatim: "Meningococcal B — 2 doses either way. You stock both
   Bexsero and Trumenba; the plan uses Bexsero. The same brand must be used for both
   doses — the two are not interchangeable within a series." No console errors in any of
   the three.

Also spot-checked the Rulebook tab: `label` text ("Bexsero for both doses — 2 doses:",
"PedvaxHIB for every dose — 3 doses:") is unchanged, confirming B2 didn't disturb its
rulebook job.

`docs/fix-2026-09-26-ux-copy-queue.md` — B1–B4 marked **DONE**, its own STOP line filled
in with the real numbers, and the file's header status line updated (Batch A DONE/merged,
Batch B DONE, Batches C–F still open).

## What's NOT done — the remaining queue

Same file, `docs/fix-2026-09-26-ux-copy-queue.md`. All still OPEN:

- **Batch C** (P1) — reorganize the formulary checklist into "Single vaccines" +
  "Combination vaccines" sections, in the same age-block order Batch A gave the
  rulebook. **C2 requires fetching the live AAP/CDC schedule table first** (via
  `verify-clinical-source`) — the queue explicitly flags the reviewer's recalled row
  order as unverified; do not reorder from memory.
- **Batch D** (P1) — collapse the checklist to one line on phones; the largest measured
  UX problem (schedule starts 2,525px down the page on a 375px-wide screen).
- **Batch E** (P2) — five "reads as machine-made" style habits (uppercase micro-labels,
  overused monospace, chip overuse, error-as-statistic, per `docs/decisions.md`).
- **Batch F** (P1/P2) — eight independent usability items (starting-formulary presets, a
  fix-button on each gap row, moving "what you could add" up, etc.) — can be split
  further across sessions.

## Why this is a good stopping point

Batch B closed out the P0 item in the whole queue (the MenB wording bug) and is a
complete, independently-shippable unit — merged, deployed, nothing here touches
`Formulary.jsx` or `products.js`, which is exactly what Batch C needs untouched. The queue
file says each batch is a whole conversation; Batch C is unrelated code and starts with a
mandatory live source-fetch, so there's no half-finished thread to pick back up.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git checkout main && git pull` — should
   already be at `4c593cb` or later.
2. Run `npx vitest run` — confirm **483 passing** before any new work.
3. Start Batch C with the `fix-queue` skill. **First action: fetch the live AAP/CDC
   schedule table via `verify-clinical-source`** for C2's row order — do not proceed from
   the reviewer's recalled order in the queue file.
4. Same per-item workflow as Batches A/B: reproduce → failing test → fix → full suite →
   live-verify → commit named by item ID.
5. This repo has no branch protection, but the established pattern (both this session and
   the last) is branch → PR → ask the owner before squash-merging. Don't default to
   auto-merging without asking — do it the way PR #1 and PR #2 were each confirmed first.
