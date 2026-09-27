# Pedivax Schedule Builder — Handoff after UX copy queue Batch A (2026-09-27)

Branch: `fix/ux-copy-queue-batch-a`, off `main`. **Pushed** and PR open:
https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/1 — CI (`Tests` workflow)
green, `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`. **Not merged** — the owner
hasn't been asked to merge it yet.

Baseline was 467 passing tests; now **479 passing (11 test files)**, all green, working
tree clean at commit `1b3f027`. `npm run build` also green.

This session picked up `docs/fix-2026-09-26-ux-copy-queue.md` — a UX review's findings
queue, meant to run one batch per session via the `fix-queue` skill. A1 and A2 were
already done-but-uncommitted when this session started; this session finished A3–A6,
committed everything, and shipped the PR.

## What's done (by item ID)

1. **A1** — legend now says "Oral" instead of "Oral — not an injection". `src/ui/Plan.jsx`.
2. **A2** — dropped the rulebook's redundant organization/insert chip next to each source
   link (the link itself already makes that obvious). `src/ui/Rulebook.jsx`. `tier` is
   unchanged in the data — `sources.test.js` still needs it.
3. **A3** — `MenB` moved from 4th to last in `src/data/series.js` (age order: its own
   first dose is 16 years, later than everything else). Added an `ageBlock` field
   (`'infant' | 'toddler' | 'adolescent'`) to every series — the one source of truth for
   which of the three UX-review blocks it's in — and grouped the rulebook's jump bar
   (`src/ui/Rulebook.jsx`) into those three blocks with a light separator (`src/ui/theme.css`).
   Verified the reorder is behaviorally inert for the planner: MenB shares no combination
   product with anything else, so it's always its own single-series cluster in
   `plan.js` — moving its key in the object can't change any other series' visit/product
   choice. The 467-test baseline stayed green after the reorder alone, before any other
   change.
4. **A4** — the "no vaccine due" line no longer lists all 17 empty ages across two
   sentences above the schedule. New pure function `src/logic/emptyVisits.js`
   (`describeEmptyVisits`, unit-tested in `src/test/empty-visits.test.js`) collapses
   consecutive same-unit ages into a range: a run of 2 joins with "and" ("17 and 18
   years"), a run of 3+ collapses to "X to Y unit" ("5 to 10 years"); different units
   never merge even if adjacent (`3–5 days` stays separate from `1 month`). The line is
   now one sentence, moved below the schedule in `src/ui/Plan.jsx`.
5. **A5** — the third summary tile no longer says "None / shared-decision products
   stocked" while a shared-decision product (e.g. Bexsero) is actually stocked and
   visible in the schedule right below it. Now "Included / shared-decision product in
   this plan" when `plan.unresolved` is empty; the other branch ("Optional / ... not yet
   decided") was already accurate and is unchanged.
6. **A6** — remaining small strings reworded per the queue's table: the gap panel
   heading/body, "What you could add" → "Products that would save injections", the
   combination-shot lede now spells out the antigen count via a small
   `NUMBER_WORDS = {2: 'two', 3: 'three', 4: 'four'}` map (every combo product in this
   app covers 2–4 antigens), the header's disclaimer (was repeated in the eyebrow, the
   sub-paragraph, and the footer — now once at the top plus the footer, `src/ui/App.jsx`),
   and the checklist heading is "Your formulary" (`src/ui/Formulary.jsx`).

Commits: `c46cdb9` (A3), `1b3f027` (A1/A2/A4–A6). `docs/decisions.md` already carried the
2026-09-26 review's settled decisions (pre-existing, uncommitted before this session).
`docs/fix-2026-09-26-ux-copy-queue.md` itself now has every A-item marked DONE and its
own STOP line filled in with the real final numbers.

## What's NOT done — the remaining queue

Same file, `docs/fix-2026-09-26-ux-copy-queue.md`. All still OPEN:

- **Batch B** (P0/P1) — the series-length explanation sentences in `seriesLength.js`'s
  prose (Hib/RV/HepB/MenB). B1 is P0: the current MenB wording could genuinely mislead a
  reader into thinking they can switch brands mid-series. The only batch that edits
  `src/data/`. Its own PR.
- **Batch C** (P1) — reorganize the formulary checklist into "Single vaccines" +
  "Combination vaccines" sections, in the same age-block order A3 just gave the
  rulebook. **C2 requires fetching the live AAP/CDC schedule table first** (via
  `verify-clinical-source`) — do not reorder from memory, the queue explicitly flags
  the reviewer's recalled order as unverified.
- **Batch D** (P1) — collapse the checklist to one line on phones; the largest measured
  UX problem (schedule starts 2,525px down the page on a 375px-wide screen).
- **Batch E** (P2) — five "reads as machine-made" style habits (uppercase micro-labels,
  overused monospace, chip overuse, error-as-statistic, per docs/decisions.md).
- **Batch F** (P1/P2) — eight independent usability items (starting-formulary presets, a
  fix-button on each gap row, moving "what you could add" up, etc.) — can be split
  further across sessions.

## Why this is a good stopping point

Batch A is a complete, independently-shippable unit — one PR, CI green, nothing here
touches `src/data/` or any clinical rule. The queue file itself says each batch is a
whole conversation and batches shouldn't mix in one session (context-exhaustion risk);
Batch A's own STOP line is now filled in with real numbers for whoever verifies the
baseline next. Batch B is next and is unrelated code (`seriesLength.js`'s prose
generation, not `Plan.jsx`/`Rulebook.jsx`), so there's no half-finished thread here to
pick back up.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git checkout main && git pull` once PR #1
   is merged (or `git checkout fix/ux-copy-queue-batch-a` to review it first).
2. Run `npx vitest run` — confirm **479 passing** before any new work (or the post-merge
   count on `main`, which should be the same).
3. Ask the owner: is PR #1 ready to merge as-is, or do they want to review it live first?
   This repo has no branch protection, but the queue's own baseline note says to still
   branch + PR "to match the other three apps" — don't default to squash-merging without
   asking, since that decision hasn't been made for this repo the way it has for vaxapp/
   PneumoVax.
4. Start Batch B with the `fix-queue` skill, one batch per session, per the queue file's
   own instructions. Reproduce → failing test → fix → full suite → live-verify → commit
   named by item ID, same as this session did for A3–A6.
5. Push + PR (this repo's established pattern per the queue file, even though `main`
   isn't protected) — do not push directly to `main`.
