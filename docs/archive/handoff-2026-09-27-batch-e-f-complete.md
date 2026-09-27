# Pedivax Schedule Builder — Handoff after Batch E/F complete, queue finished (2026-09-27)

> **Supersedes** `docs/archive/handoff-2026-09-26-ux-queue-batch-d.md` and every earlier
> `handoff-*-ux-queue-batch-*.md` in this folder. The whole UX copy queue
> (`docs/archive/fix-2026-09-26-ux-copy-queue.md`, moved from `docs/` and marked
> **CONSUMED** — it was previously OPEN with only Batches A–C done) is now finished.
> Don't resume it, don't re-verify PR #3/#4's merge status — they're long since merged.

Branch: `main`. Clean tree at commit `e491f73`. **522 tests passing (15 files)**, `npm
run build` green. Deployed and live-verified at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/.

## What's done this session

Merged, in order, onto `main`:

1. **PR #5** — docs-only, marked Batch D done in the queue file with D2's real numbers.
   Leftover from the session that built Batch D; owner confirmed the merge.
2. **PR #6 — Batch E (E1–E4)**, "stop the app from reading as machine-built": sentence
   case for micro-labels, monospace restricted to actual aligned figures, dropped the
   redundant Combination/Shared-decision chips (their info is already in an adjacent
   sentence), and the gap tile now names the missing antigens in a sentence instead of
   dressing a failure as a stat.
3. **PR #7 — bug fix, not part of the queue**: the owner found live, mid-session, that
   every Rotavirus product had silently lost its own dose count (`subLine()` in
   `Formulary.jsx` grouped "has a commonName" and "is oral" into one branch that never
   reached the dose-count line). Fixed; Rotarix now reads "2 doses · oral", RotaTeq
   "3 doses · oral".
4. **PR #8 — Batch F (F1–F7)**, the rest of the usability queue:
   - **F1** — two one-tap starting formularies (`src/data/presets.js`) before anything is
     ticked: "Single-brand basics" (32 injections) and "Fewest injections" (Pentacel +
     Kinrix + ProQuad, 23 injections), both verified zero-gap.
   - **F2** — every gapped dose gets its own real fix suggestion ("Nothing covers dose 5
     of 5. Add Kinrix"), via new `src/logic/fixGap.js`. Batched per series (one
     `buildPlan()` per candidate product, not per candidate per dose) — the first,
     per-dose version was fast enough for one gap but slow enough on a fully-empty
     formulary to time out a render.
   - **F3** — "Products that would save injections" moved from the page bottom to right
     after the stat tiles.
   - **F4** — ticking a box shows "0 → 3 injections" beside the checklist itself, clears
     after 4s or on Reset/Undo.
   - **F5** — search box filtering the 30-product checklist by name/commonName; empty
     groups (including the section heading) disappear rather than showing blank.
   - **F6** — checklist heading states the stocked count; Reset is undoable for one
     action.
   - **F7** — the checklist rail no longer scrolls independently of the page.
5. **PR #9 — CI fix**: PR #8's merge broke the `main` Tests check — one `App.test.jsx`
   test hit vitest's 5000ms default on CI's slower runner (5845ms; never failed locally).
   Real computation (F2's per-gap-row search), not a hang. Raised `testTimeout` to
   15000ms for that file.

All five merge points came back `MERGEABLE` with no manual conflict resolution needed,
including Batch E and Batch F both touching `Plan.jsx`'s gap tile and `Shot` component.

## What's NOT done

**Nothing is open in this queue.** One deferred item, recorded (not silently dropped):
F4's 4-second auto-clear timer has no automated test — vitest's fake timers didn't
reliably flush the React state update in this jsdom setup, and forcing it added flakiness
without adding confidence (the code itself is a single `setTimeout` + `setState`). The
two real-time behaviors (delta appears on a real tick, stays absent when nothing changed)
are covered.

No other backlog exists for this app beyond what's in `docs/decisions.md`'s own "Still
open" section (Prevnar 13's exact retirement date, snapshotting the CDC 2025 quotes,
reading the remaining single-antigen brand inserts) — unrelated to this queue, unstarted,
not blocking anything.

## Why this is a good stopping point

The entire six-batch queue is merged, deployed, and live-verified end to end (not just a
green test suite) — presets, search, the fix-buttons, and the moved panels were all
clicked through on the actual running app, both locally and on the deployed Pages site.
Nothing is mid-edit; the working tree is clean.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git checkout main && git pull`
2. Run the suite — confirm **522 passing** before any new work.
3. There is no active queue. If the owner wants more UX work, it starts as a fresh
   review/audit, not a continuation of this file.
4. Per-item workflow (unchanged from this queue): reproduce → failing test → fix → full
   suite green → live-verify in the running dev server (`preview_start`,
   `"Pedivax Schedule Builder dev server"`, port 5187) → commit.
5. Push policy (confirmed again this session): branch → PR → **ask the owner before
   merging** — this repo has no branch protection, but the owner has asked for the same
   review pattern as the other three apps every time so far.
