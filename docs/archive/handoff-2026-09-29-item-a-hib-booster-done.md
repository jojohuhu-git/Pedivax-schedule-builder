# Pedivax Schedule Builder — Handoff after item A (Hib booster fix) (2026-09-29)

> **SUPERSEDED (2026-09-29)** — item B has since been done and merged too
> (PR #13, `main` at `fe1bb8d`, 543 tests). The remaining queue is **C, D, E**, not
> **B, C, D, E** as this file says below. Read
> `handoff-2026-09-29-item-b-whole-syringe-done.md` instead; item C's scope has also
> shrunk, because B fixed its Pentacel-at-4-years part structurally.

> **Supersedes nothing** — this continues
> `handoff-2026-09-28-brand-indication-airtight-queue.md` (now committed to `main`,
> it had never been committed before this session). That file's Findings 1-3, owner
> decisions, and queue B-E are all still the live source of truth. This handoff just
> records that **item A is done**; read the 2026-09-28 file for the full queue detail.

Branch: `main` (item A's branch `fix/hib-pedvaxhib-booster-a` was merged squash and
deleted). Pushed — PR [#11](https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/11),
merged. Baseline was 522 passing tests; now **525 passing (15 files)**, all green,
working tree clean at commit `0be26c1`. Both CI workflows (`Tests`, `Deploy to GitHub
Pages`) ran on the merge and succeeded.

## What's done

**A — Hib booster fix.** `PedvaxHIB`'s `covers` in `src/data/products.js` changed from
Hib doses `[1,3]` to `[1,4]`. PedvaxHIB is a monovalent Hib product (not a
DTaP-IPV-Hib-HepB combo), so per immunize.org/Merck it's an acceptable booster —
previously it could never fill the 4-dose mixed-brand path's booster slot, so stocking
PedvaxHIB + Vaxelis together silently fell back to an all-PedvaxHIB 3-dose plan while
Vaxelis's own Hib content rode along uncounted (6 real Hib doses for a plan that said 3).
Fixes Findings 1 and 2 from the 2026-09-28 handoff exactly as scoped.

One display bug surfaced *by* the fix, fixed in the same PR: `src/ui/Formulary.jsx`'s
`subLine()` computed the checklist's "N doses" text from the `covers[]` dose-number span
— which now diverges from PedvaxHIB's own actual series length (4 vs. 3) now that its
covers range is wider than its own exclusive path. Changed to prefer
`setsSeriesLength[series]` when present.

Verified: new tests in `src/test/plan.test.js` (fail on pre-fix code, pass after) +
existing suite green (525/525) + live-checked on the deployed site — ticking PedvaxHIB +
Vaxelis now shows **4 injections** (was 6), PedvaxHIB delivering the 15-month Hib booster,
and the checklist still correctly reads "PedvaxHIB · 3 doses". Commit `2cb9d6c` (fix) +
`8fa1733` (caught up the never-committed 2026-09-28 handoff first).

## What's NOT done — the remaining queue

All from `handoff-2026-09-28-brand-indication-airtight-queue.md` — unchanged, not
re-litigated here:

- **B — Count every antigen in every syringe** (medium, risky): make placing a product
  score everything it contains, not just what it was picked for. Touches `plan.js`
  scoring core; every existing plan needs re-checking, expect surprises.
- **C — Restrictions become fields, not sentences** (medium): replace blunt
  `cannotBeBooster` with precise per-product restriction fields + reason-code tests.
  Absorbs the Finding-3 Pentacel-at-4-years fix. Visible schedule change for
  Pentacel-only clinics — give it its own PR.
- **D — Rulebook prints used-for/not-used-for** (small once C lands).
- **E — Add Penbraya and Penmenvy** (largest, mostly source verification). Recommended
  after B, so the antigen-counting invariant exists before two new combo products arrive.

Recommended order remains **B → C → D → E**, but — as before — ask the owner which item
next rather than defaulting; A was picked this way too.

## Why this is a good stopping point

A is a complete, independently-shippable unit: its own PR, its own tests, verified live,
merged and deployed. It doesn't touch or partially implement any of B-E's scope, so there
is no half-finished state to track. B is explicitly the risky one (owner should decide
when to take it on, not have it default-started).

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git checkout main && git pull`
2. Run `npm test` — confirm **525 passing (15 files)** before any new work.
3. **Ask which item next — don't default.** Options are B, C, D (blocked on C), or E
   (recommended after B). Each has a real trade-off named in the 2026-09-28 handoff.
4. Per item: reproduce → failing test → fix → full suite green → live-verify in the app
   (`preview_start`, name `"Pedivax Schedule Builder dev server"`, port 5187) → commit
   named by item ID. Both a logic test (node env) and a UI rendering test (happy-dom) are
   required for anything visible.
5. Branch → PR → squash merge, per the `ship` skill. Do not push to `main` directly.
   After merge, confirm both CI workflows succeed (`gh run list --limit 3`) and spot-check
   the live site before calling it done.
