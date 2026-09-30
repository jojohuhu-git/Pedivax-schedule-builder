> **SUPERSEDED 2026-09-29 by `handoff-2026-09-29-prevnar13-and-moved-note.md`.**
> Both loose ends this file listed are now closed: the `movedNote` bug it deferred was
> fixed and merged (PR #19), and the Penmenvy authority question it raised was answered by
> the owner — **Penmenvy stays in, no code change owed.** The Prevnar 13 date it flagged as
> unverified has been abandoned entirely (PR #20): the card now says "No longer
> recommended" with no date, because no organization source gives one. `main` is at
> `ebdb407` @ 703 tests, not `5af2ce8` @ 679. Read the newer file.

# Pedivax Schedule Builder — Handoff after item E, the last of the brand-indication queue (2026-09-29)

Repo: `/Users/joannehuang/Downloads/Pedivax-schedule-builder`. Live at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/

The app's promise, because it constrains everything below: a clinician ticks the products
their clinic stocks; the app plans the most efficient birth-to-18 schedule those products
can deliver for a healthy child. **Ages only — no dates, no patient data.**

Branch: **`main`**, at `5af2ce8` after PR #17 was squash-merged. Baseline going in was 608
passing tests; now **679 passing (17 files)**, all green, `npm run build` green. Verified by
running the suite, not remembered.

> **The brand-indication airtightness queue (2026-09-28) is now FULLY CONSUMED.** All five
> items are merged: A #11, B #13, C #14, D #16, E #17. That queue file has been bannered.
> **There is no open queue in this repo.** Ask the owner what to do next — do not invent one.

## What item E did

**Penbraya (Pfizer) and Penmenvy (GSK)** — one injection that is simultaneously a MenACWY
dose and a MenB dose — are now stockable products. A clinic with one plans the **16-year
visit as a single shot instead of two**.

1. **The both-due rule is structural, not written out.** A pentavalent may only be used
   when MenACWY *and* MenB are both due that clinic day. Nothing new implements this: it
   falls out of item B's whole-syringe rule (a product may only be given where *every*
   antigen in it has a dose due), so at the 11-year visit, where only MenACWY is due, a
   pentavalent is simply not offerable. **That rule moved from `plan.js` into `cover.js`**,
   beside `canCover`, so both halves of "may this product be given here" live in the one
   gate file. MeningoVax keeps the same rule in `recommend.js` with a second copy in its
   validator, which is why it kept drifting there; here there is no second copy.
2. **Never a second pentavalent dose.** Each covers `MenB doses [1,1]` — CDC states it
   positively, the matching plain brand gives dose 2. A clinic stocking Penbraya without
   Trumenba (or Penmenvy without Bexsero) gets an honest gap at 17 years whose Add button
   names the right partner. Verified live.
3. **MenB's variants are now brand FAMILIES**, not single brands (`family: 'MenB-4C'` /
   `'MenB-FHbp'`, and `requiresAllDosesFrom` lists the pentavalent alongside the plain
   brand). That is what stops 4C and FHbp being mixed inside one child's series, and why a
   clinic stocking only a pentavalent still gets a planned series rather than none.
4. **`allAntigensMustBeDue: true` is mandatory on every multi-antigen product** and is
   **load-bearing, not documentation** — `cover.js` refuses an undeclared combination
   outright, so the next Penbraya-like product added without it fails loudly instead of
   quietly delivering an uncounted antigen. `pentavalent.test.js` names any product missing
   it *and* proves the refusal actually fires (by removing the field in place).
5. Penmenvy joined the **"Fewest injections" preset** (23 → 22). Penbraya would change
   nothing there — that preset stocks Bexsero, not Trumenba, so the planner correctly leaves
   Penbraya on the shelf rather than open a 17-year gap.

### Two real defects surfaced while doing it

- **`clusterVariantOptions` crashed on MenB.** It assumed every variant-bearing series has a
  fallback path. MenB has none. Until item E only Hib/HepB/IPV reached that code; the
  pentavalents put MenACWY and MenB in one cluster and brought MenB through it. Fixed.
- **The "you stock both brands" sentence could name a product the clinic does not own** —
  it printed each variant's canonical brand, so a Penmenvy+Trumenba clinic would have been
  told "the plan uses Bexsero". It now names what is actually stocked and which family is in
  use, and `plan.js` re-derives it from the family the *search* chose (`familyChoiceNote`),
  not the one `seriesLength.js` merely preferred.

### Proof it was additive

Every plan for every formulary that does **not** stock a pentavalent is **byte-identical**
to before the branch — swept all products, each single-product-removed variant, both
presets, and every combination pair (1,049 lines; the only diff was the reworded MenB
sentence). Do not redo this sweep; redo it only if you change scoring again.

## Clinical sources — fetched live 2026-09-29

Full snapshot with every quote: `docs/updates/sources/2026-09-29-pentavalent-menabcwy.md`.
CDC 2025 schedule notes (Penbraya's same-clinic-day rule and the Trumenba-for-dose-2 rule),
ACIP MMWR 2024;73(15) (Penbraya, 10–25 years), ACIP MMWR 2026;75(1) (Penmenvy, 10–25 years,
Bexsero for dose 2).

**One thing the owner may want to revisit — flagged in PR #17, not yet answered.** The CDC
2025 notes page, the edition this app is pinned to, **does not mention Penmenvy at all**
(checked explicitly). Penmenvy was included anyway because its **ACIP action is 16 April
2025** — before the 9 June 2025 committee replacement the mid-2025 cutoff exists to exclude,
only the MMWR write-up being later — and because AAP's 2026 schedule carries it. The AAP
half is recorded from a search summary, **not a quoted live read**: publications.aap.org
returns HTTP 403 to automated fetches. Every Penmenvy rule the code implements rests on the
ACIP/MMWR quotes, which *were* read live. If the owner prefers, pulling Penmenvy back out
leaves Penbraya working on its own.

## Parity

This repo is not in the `vaccine-parity` table, but MeningoVax was checked anyway since both
are meningococcal tools. It **agrees on every point**: same both-due-same-day rule, same
4C/FHbp family lock (`FAMILY_BY_KEY` in its `src/data/brands.js`), and it independently
recorded the same finding that the CDC page omits Penmenvy. Deliberately **not** ported:
MeningoVax's ≥6-month rule for repeat Penbraya doses in children at *increased risk* — this
app plans only the healthy child and never gives a second pentavalent.

## What's NOT done

- **Nothing from the brand-indication queue.** It is finished.
- **One pre-existing bug found while verifying, deliberately left alone** (own scope, own
  PR): `movedNote()` in `src/ui/Plan.jsx` (~line 33) prints "Earliest due at 16 years;
  scheduled at 17 years instead to combine with another vaccine due at that visit" for the
  17-year MenB dose — but nothing else is due that day, and 16 years was never legal for it
  (the 6-month interval). It reads `dose.at[0]` as "earliest due" without checking legality,
  and asserts the combining reason without checking it. `Plan.jsx` is byte-identical to what
  PR #8 shipped, so this predates item E. A background task was filed for it.
- **Prevnar 13's 30 April 2024 retirement date** is still not verified from a live-read
  sentence (four sessions, three tools, all hitting the same bot wall on the Medline PDF).
  Unchanged, still recorded with its caveat. Don't attempt the bot challenge.

## Why this is a good stopping point

The queue that opened on 2026-09-28 is complete and merged, the suite is green, the build is
green, and the change was proven additive for every clinic that doesn't stock the new
products. Nothing is half-landed and nothing is blocked.

## Two environment traps that cost time this session

1. **A stale agent worktree holds `main`.** `git worktree list` shows one under
   `/private/tmp/claude-501/...-claude-worktrees-charming-maxwell-981551/.../psb-main` at the
   pre-merge commit. It blocks `git checkout main` in the real folder ("already checked out")
   and — per the owner's own memory note — makes vitest collect a second copy of `src/` and
   report phantom failures. Work on a branch off `origin/main`, or ask the owner before
   removing it.
2. **The Browser-pane preview proxy reports the wrong port on this repo.** It said 59624
   while vite had actually bound **5190** (5187–5189 were taken by other sessions), and every
   request to the reported port returned `ERR_CONNECTION_REFUSED`. Read `preview_logs` for
   the port vite actually printed and `navigate` straight to
   `http://localhost:<that port>/Pedivax-schedule-builder/`. This is the second session to
   hit it — try it first if the preview looks blank.

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git fetch && git status`
   — expect `main` at or after `5af2ce8`. (See trap 1 if checkout refuses.)
2. Run `npm test` and confirm **679 passing (17 files)** before any new work. A different
   number means the baseline moved — diagnose before starting, don't proceed.
3. Start the dev server with `preview_start`, name `"Pedivax Schedule Builder dev server"`
   (`.claude/launch.json`). See trap 2 for the port.
4. **There is no queue. Ask the owner what to work on — do not default to anything.** If
   they have no preference, the two open items above (the `movedNote` bug; whether Penmenvy
   stays in given the authority pin) are the only known candidates.
5. Per-item workflow, unchanged: reproduce → failing test → fix → full suite green →
   live-verify in the running app → commit named by the item ID.
6. Push policy: **branch → PR → `gh pr merge --squash`**, one PR per item, as items A–E all
   did. `main` is not protected here, but the PR flow is the established habit.
