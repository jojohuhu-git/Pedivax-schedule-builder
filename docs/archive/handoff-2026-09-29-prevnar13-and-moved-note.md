> **SUPERSEDED 2026-09-29 by `handoff-2026-09-29-colour-and-perf.md`.** Two more PRs
> merged after this file was written: #22 (shared-decision doses count as injections, the
> purple is gone) and #25 (the per-tick lag, 109-188 ms down to 1-41 ms on the live site).
> `main` is at `ac29381` @ 717 tests, not `1afd71e` @ 703. This file's "no open queue" is
> still true; read the newer one for the colour rule and the three performance traps.

# Pedivax Schedule Builder — Handoff after PRs #19 and #20 (2026-09-29, session 2)

Repo: `/Users/joannehuang/Downloads/Pedivax-schedule-builder`. Live at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/

The app's promise, because it constrains everything: a clinician ticks the products their
clinic stocks; the app plans the most efficient birth-to-18 schedule those products can
deliver for a healthy child. **Ages only — no dates, no patient data.**

Branch: **`main`**, at `ebdb407`, working tree clean, in sync with `origin/main`. Baseline
going in was 679 passing; now **703 passing (19 files)**, all green, `npm run build` green,
Pages deploy green, live site verified. Numbers from running the suite just now, not
remembered.

> **There is NO open queue and NO open question in this repo.** Both prior queues are
> fully consumed, and the two loose ends the last handoff listed are now closed. Ask the
> owner what to work on — do not invent a queue.

## What's done

1. **PR #19 — `movedNote` / `placement.js`** (`1093687`). The sentence under each shot
   explaining why that dose sits at that visit no longer guesses. It had been asserting
   two things it never checked: that the dose had been *moved* (it read `dose.at[0]` as
   "earliest due", ignoring minimum intervals — so MenB dose 2 was told it could have been
   given at 16 years, which the 6-month interval made impossible), and that it was moved
   *to combine with another vaccine* (asserted every time; at the 17-year visit nothing
   else was due). The decision moved out of `Plan.jsx` into new `src/logic/placement.js`,
   using the same `doseWindowOk()` gate the planner uses, measured from where the previous
   dose actually landed. Two further visits printing the same unchecked claim were fixed:
   hepatitis B dose 2 at 2 months, and Hib's toddler booster at 15 months in a no-combo
   clinic. `placement.test.js` (13 tests) ends with a guard re-checking **every sentence
   the app can print** against the facts it claims. Detail: PR #19's body.

2. **PR #20 — Prevnar 13 states its status, not a date** (`ebdb407`). The Rulebook card
   read "Retired 2024-04-30"; it now reads **"No longer recommended"**, with no date.
   `retired` is a plain boolean flag — which is all `cover.js` ever read it as. Files:
   `products.js`, `series.js`, `sources.js` (new `immunizePcvAskExperts`),
   `Rulebook.jsx`, `sources.test.js`, `Rulebook.test.jsx`. **No planning behaviour
   changed** — PCV13 was already excluded and stays excluded.

### The clinical finding behind #20 — do NOT re-litigate

Reading the sources live to settle the year showed **no organization source gives PCV13 a
retirement date at all.** Snapshot with all three reads:
`docs/updates/sources/2026-09-29-pcv13-status.md`.

- **immunize.org, Ask the Experts — Pneumococcal** (live 2026-09-29): *"PCV13 (Prevnar 13,
  Pfizer) is FDA-licensed and may still be available in some clinics. It is no longer
  routinely recommended."* This is the load-bearing sentence and the reason the planner
  refuses the product.
- **CDC pneumococcal surveillance** (live 2026-09-29): introduction years only. No
  discontinuation. Checked explicitly.
- **Pfizer's Prevnar 20 marketing page** (live 2026-09-29): *"In the US, Prevnar 13 was
  available for adults from 2012 to 2024."* The only source naming a year — a manufacturer
  page, and a sentence about **adults** while this app plans children. Named in prose, not
  added to `sources.js` (whose tiers are `organization`/`insert` only).

**Five sessions of chasing the Medline PDF's bot wall are over. Do not restart it.** A
date may only be re-added alongside a sentence read live from an organization source.

### A second defect #20 fixed, and the rule it came from

Both PCV13 facts cited CDC's pneumococcal notes and quoted *"minimum age: 6 weeks [PCV15],
[PCV 20]"* — a real quote from a real source that says nothing about PCV13's status. Owner's
rule, stated this session: **"there should be no guessing. Every decision made should refer
to a source of truth."** Guards added in `sources.test.js`: a withdrawn product's flag
carries no year or date; no fact may state a retirement date for one; any
withdrawal-explaining fact must cite an **organization-tier** source (this is the guard that
would have caught the mis-citation). `Rulebook.test.jsx` asserts the status tag appears
*and* that no year-bearing retirement tag appears anywhere.

## Owner decisions settled this session — apply, do not re-ask

1. **Penmenvy stays in the app. CLOSED.** The question the last handoff raised (the CDC
   2025 notes page never mentions it; its ACIP action is 16 April 2025, inside the
   pre-mid-2025 pin; the AAP half rests on a search summary because publications.aap.org
   403s automated fetches) is answered. Owner's reasoning: *"vaccine guidelines will
   continue to update with new recommendations. The references will need to be re-reviewed
   periodically and updated for vaccines."* **No code change was made and none is owed.**
   She did not ask for a Rulebook caveat line — do not add one unprompted.
   For reassurance if it resurfaces: that periodic re-review is already automated.
   `staleness.test.js` fails the whole suite on any fact whose `verified:` date is more
   than twelve months old, across both `series.js` and `products.js`.
2. **Prevnar 13's exact retirement date is abandoned**, then the year too — see #20 above.
3. **PR #19 approved and merged** on the principle quoted above.

## What's NOT done

**Nothing is queued.** Both the UX copy queue (A–F) and the brand-indication airtightness
queue (A–E) are fully consumed and bannered. No item is half-landed, nothing is blocked,
and no question is waiting on the owner.

The only thing deliberately left alone is the Medline PDF chase, closed above.

## Why this is a good stopping point

Both PRs are merged, squashed, deployed and verified on the live site. The suite is green
at 703, the build is green, and neither change altered a single planned schedule — #19
changed only explanatory sentences, #20 only what the Rulebook prints about a product the
planner already refused. `main` is clean and in sync.

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git fetch && git status`
   — expect `main` at or after `ebdb407`, clean.
2. Run `npm test` and confirm **703 passing (19 files)** before any new work. A different
   number means the baseline moved — diagnose before starting. Check **failed suites**,
   not just failed tests: a file that crashes while loading runs zero tests and reports
   zero failures.
3. Start the dev server with `preview_start`, name `"Pedivax Schedule Builder dev server"`
   (`.claude/launch.json`). **See the port trap below.**
4. **Ask the owner what to work on. Do not default to anything.** There is no queue and no
   outstanding question. If she has no preference, the only candidates ever floated are an
   adversarial audit (`app-audit` skill) or a live click-through with her — the two real
   bugs she caught in September both came from using the running app, not from tests.
5. Per-item workflow, unchanged: reproduce → failing test → fix → full suite green →
   live-verify in the running app → commit named by the item ID.
6. Push policy: **branch → PR → `gh pr merge --squash`**, one PR per item. `main` is not
   protected here, but the PR flow is the established habit and every item since 2026-09-27
   has used it.

## One environment trap, now confirmed three sessions running

**The Browser-pane preview proxy reports the wrong port on this repo.** This session it
reported 52743 while vite had actually bound **5191** (5187–5190 were taken by other
sessions). Read `preview_logs` for the port vite actually printed, then `navigate` straight
to `http://localhost:<that port>/Pedivax-schedule-builder/`. Try this first if the preview
looks blank or every request returns `ERR_CONNECTION_REFUSED`.

Separately: if the Browser pane is not displayed on screen, `computer` clicks and
screenshots fail ("not compositing frames") while `read_page`, `get_page_text` and
`javascript_tool` still work — use those to verify rather than abandoning live verification.

The stale agent worktree that blocked `git checkout main` last session is **gone**;
`git worktree list` shows only the real folder.
