# Pedivax Schedule Builder — Handoff after item B (whole-syringe accounting) (2026-09-29)

> **Supersedes `handoff-2026-09-29-item-a-hib-booster-done.md`.** This continues the same
> queue, `handoff-2026-09-28-brand-indication-airtight-queue.md`, which is still the live
> source of truth for items **C, D and E** (its Findings, owner decisions, and clinical
> sources all still stand). Items **A and B are now both done and merged** — read this
> file for what changed, and the 2026-09-28 file for the remaining queue detail.

Repo: `/Users/joannehuang/Downloads/Pedivax-schedule-builder`. Live at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/

Branch: `main`, clean, in sync with `origin/main` at **`fe1bb8d`**. Item B's branch
`fix/b-count-every-antigen` was squash-merged as
PR [#13](https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/13) and deleted.
Baseline was 525 passing tests; now **543 passing (16 files)**, all green. Both CI
workflows (`Tests`, `Deploy to GitHub Pages`) succeeded on the merge, and the deployed
site was spot-checked afterwards.

The app's promise, because it constrains everything below: a clinician ticks the products
their clinic stocks; the app plans the most efficient birth-to-18 schedule those products
can deliver for a healthy child. **Ages only — no dates, no patient data.**

## What's done

**B — count every antigen in every syringe.** A product may now only be given at a visit
where **every** antigen it contains has a dose due that it may legally give, and no two
shots at one visit may carry the same antigen. Findings 1–3 of the 2026-09-28 queue are
now unscoreable rather than merely detected — the search cannot pick them. Rewrote
`coverVisit`'s inner search in `src/logic/plan.js` from a minimum set cover into an exact
packing (`deliverableAt` + `bestPacking`).

It was worse than the two reported cases: on the **everything-stocked plan the app opens
with**, Pentacel at 15 months was delivering an uncounted polio dose.

**The clinical finding — settled, do not re-litigate.** Polio is genuinely a **5-dose**
series whenever Pentacel is used. Verified live 2026-09-28; CDC and AAP say it in
identical words, so there is no AAP-vs-CDC tiebreak here:

> "4 or more doses of IPV can be administered before age 4 years when a combination
> vaccine containing IPV is used. However, a dose is still recommended on or after age 4
> years and at least 6 months after the previous dose."

— [CDC child/adolescent schedule notes](https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html),
Poliovirus vaccination; same sentence in the AAP-published schedule. Pentacel is given at
2, 4, 6 **and** 15–18 months, so a Pentacel child really does get four polio doses before
the fourth birthday and a fifth at 4–6 years.

IPV therefore became a **fifth brand-length-setting series** — and the first whose two
paths name **no brand**. That forced a small generalization: a variant naming no products
is always available (`seriesLength.js`, `plan.js`), plus a `reachedWith` field on the one
variant no brand list can identify, for `one-source-of-truth.test.js`. The Hib and DTaP
notes were checked at the same time and carry **no** equivalent allowance.

**Two things that fell out, both already implied by data that was already in the repo:**

1. **Kinrix is not interchangeable with Quadracel after Pentacel.** Kinrix is approved as
   the *fourth* polio dose (Infanrix/Pediarix lineage); Quadracel as the "fourth or
   fifth". Already encoded as `IPV [4,4]` vs `[4,5]` with sourced quotes — the planner now
   acts on them. The **"Fewest injections" starting preset was mis-paired** (Pentacel +
   Kinrix) and showed a real 2-dose gap at 15 months once the accounting was honest;
   swapped to Quadracel, same 23 injections, no gaps.
2. **`fixGap.js` suggested a fix that made things worse** — it ranked candidates by
   injection count alone, so it told a Pentacel-only clinic to "Add Kinrix", closing one
   gap and opening two. Now ranks by remaining gaps first, then injections, matching
   `plan.js`'s own `isBetter`.

**Plan changes, swept across 126 formularies: 45 changed, 0 still over-deliver.** 32
changed only in that a previously hidden dose is now printed (same needle count, same
gaps). **All 13 that changed counts involve Pentacel.** Everything-stocked stays at 21
injections / 0 gaps. A Pentacel-only clinic now shows an honest 4-year gap instead of a
5th Hib and DTaP dose — that is **Finding 3, which item C was scheduled to fix; B made it
structurally impossible first, so C's scope has shrunk.**

**Performance, and a test-flake trap worth remembering.** Item B first made `buildPlan`
~30% slower (polio's second variant multiplies the cluster search), which turned CI red —
not on a wrong number, but because `App.test.jsx`'s tick-delta banner dismisses itself
after a real 4 seconds and that test took 9.6s on CI's runner. Fixed by caching one
visit's answer by what is actually due there, keyed on the dose **objects** (two doses
both numbered "Hib dose 2" are different objects on the 3- and 4-dose paths — a
distinction that must not collapse). **105 → 18 ms per full plan, 6× faster than before
this branch**; suite 25s → 10s; plans byte-identical (same sweep, same 45 changed, same
numbers). The test now neutralises that one 4-second timer by its length.
**Vitest's fake timers do NOT work in this repo** — `userEvent` and Testing Library both
stall on a clock that only advances when asked, and all six App tests time out. Don't
retry that approach.

Full writeup: `docs/decisions.md`, "Found while building item B (whole-syringe
accounting), 2026-09-28". New test file: `src/test/whole-syringe.test.js` — it sweeps 112
formularies mechanically and, on the pre-fix code, reported 45 formularies delivering an
uncounted antigen and 3 giving one twice in a visit.

## What's NOT done — the remaining queue

All from `handoff-2026-09-28-brand-indication-airtight-queue.md`, unchanged except where
noted:

- **C — Restrictions become fields, not sentences** (medium). Replace the blunt
  `cannotBeBooster` with precise per-product "not used for" fields, plus a prose test (a
  restriction written in `facts[]` with no matching field fails the suite) and a
  reason-code test (each refusal must cite *that rule*, not a numbering coincidence).
  **Scope reduced:** its Pentacel-at-4-years fix already landed with B, so C is now about
  making the *reasons* explicit rather than changing any schedule.
- **D — Rulebook prints used-for / not-used-for** (small once C lands). Per product: dose
  numbers and ages used for, restrictions with citations, and any insert-vs-CDC gap (the
  RotaTeq 8-month one). Extend `one-source-of-truth.test.js` to restrictions **both
  ways**.
- **E — Penbraya and Penmenvy** (largest, mostly source verification). The pentavalent
  both-due rule goes in `cover.js` **only**. Note B's invariant now exists, which was the
  stated reason for doing B before E.

## Why this is a good stopping point

B is a complete, independently-shippable unit: its own PR, its own tests, verified live on
the deployed site, merged, and recorded in `docs/decisions.md`. It does not partially
implement C, D or E. The one thing it took from C — the Pentacel 4-year fix — it finished
rather than half-did, and that is called out above so C is not re-scoped by surprise.

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git checkout main && git pull`
2. Run `npm test` — confirm **543 passing (16 files)** before any new work.
3. Start the dev server with `preview_start`, name `"Pedivax Schedule Builder dev server"`
   (`.claude/launch.json`, port 5187 — it often lands on 5188 if 5187 is held by a stale
   server; read `preview_logs` for the URL vite actually printed, and note it serves under
   the `/Pedivax-schedule-builder/` base path). The formulary can be driven straight from
   the URL: `?s=Pentacel,Quadracel,...`.
4. **Ask which item next — don't default.** C, D (depends on C) or E. Each trade-off is
   named in the 2026-09-28 handoff; C's is now smaller than that file says.
5. Per item: reproduce → failing test → fix → full suite green → live-verify in the
   running app → commit named by the item ID. Both layers are required for anything
   visible: a logic test (node env) and a UI rendering test (happy-dom).
6. Branch → PR → squash merge, per the `ship` skill. Do not push to `main`. After merge,
   confirm both CI workflows succeed and spot-check the live site.
