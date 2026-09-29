# Pedivax Schedule Builder — Handoff: brand-indication airtightness queue (2026-09-28)

> This is a **new queue**, not a resumption. The previous handoff
> (`handoff-2026-09-27-batch-e-f-complete.md`) correctly says its UX copy queue is
> finished and nothing is open — that remains true. Leave it alone.

Repo: `/Users/joannehuang/Downloads/Pedivax-schedule-builder`. Live at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/

Branch: `main`, clean, in sync with `origin/main` at `0bfbc1d`. **522 tests passing
(15 files), all green** — verified by `npm test` on 2026-09-28.

**Nothing in this queue is implemented.** This session was planning only: it reproduced
three defects, verified the governing clinical sources live, and settled four owner
decisions. No code was changed.

The app's promise, because it constrains every item below: a clinician ticks the products
their clinic stocks; the app plans the most efficient birth-to-18 schedule those products
can deliver for a healthy child. **It plans in ages only — no dates, no patient data.**

---

## What the owner reported, and what it actually is

All three are the same root cause wearing different clothes: **the app counts only the
antigens it deliberately picked a product for, and the gate blocks products for
coincidental reasons rather than for the written rule.**

### Finding 1 — Hib duplicated when PedvaxHIB and Vaxelis are both stocked

Reproduce: tick **PedvaxHIB + Vaxelis**. Today's plan:

```
2mo   PedvaxHIB (Hib)  +  Vaxelis (HepB, DTaP, polio)   <- Vaxelis also contains Hib
4mo   PedvaxHIB (Hib)  +  Vaxelis (HepB, DTaP, polio)   <- same again
6mo                       Vaxelis
15mo  PedvaxHIB
6 injections; Hib antigen delivered 6 times for a plan that says 3 doses
```

**Cause.** `PedvaxHIB` in `src/data/products.js` covers `Hib doses [1,3]`. In a mixed or
PRP-T series the 12–15 month booster is *numbered 4*. No stocked product can then serve
Hib dose 4 (Vaxelis is correctly barred from boosting), so the 4-dose path in
`clusterVariantOptions` (`src/logic/plan.js`) is dead and the search falls back to the
all-PedvaxHIB 3-dose path — which forces Hib into its own syringe while Vaxelis's Hib
rides along uncounted.

**PedvaxHIB is the only Hib product with this defect** — verified by sweeping all six
single×combo pairings. ActHIB, Hiberix and Pentacel all cover doses 1–4; `ActHIB+Vaxelis`,
`Hiberix+Vaxelis` and `PedvaxHIB+Pentacel` are clean, and Vaxelis stocked alone correctly
reports a gap at 15 months.

### Finding 2 — the ActHIB/Hiberix suggestion that looked wrong

Same cause, no separate work. Adding ActHIB opens the dose-4 slot, Vaxelis starts carrying
Hib, and the plan drops 6 → 4 injections, so `suggest.js` honestly reports "saves 2". Fix
Finding 1 and the suggestion disappears on its own.

### Finding 3 — Pentacel over-vaccinates at the 4-year visit (found this session)

Reproduce: tick **Pentacel alone**.

```
15mo  Pentacel (DTaP 4, Hib 4)   <- Hib series complete
4y    Pentacel (polio 4)         <- delivers a 5th Hib and a 5th DTaP, uncounted
```

`products.js` already records the rule, quoting immunize.org: Pentacel "should not be used
for any dose in the primary series for children age 5 years or older or as the booster
dose for children ages 4 through 6 years." The sentence is in the rulebook. It is not
wired into `cover.js` — Pentacel's `cannotBeBooster` is `[]`.

### The structural finding behind all three

Each written restriction was tested against `cover.js` directly. Results:

```
Pediarix as the HepB birth dose    blocked — reason "dose-number-not-licensed"
Vaxelis as the HepB birth dose     blocked — reason "dose-number-not-licensed"
Vaxelis as the Hib booster         blocked — reason "dose-number-not-licensed"
Pentacel at ages 5 and 6           blocked — reason "dose-number-not-licensed"
Pentacel as the 4y DTaP booster    blocked — reason "not-a-nominal-visit"
Pentacel as the 4y polio booster   ALLOWED
```

Not one block cites the rule meant to cause it. They are numbering and visit-window
coincidences doing the work of real rules. Finding 1 is what happens when such a
coincidence gets it wrong — and renumbering anything can silently remove the rest.

**Not a defect, do not "fix" it:** RotaTeq's dose 3 is allowed at 8 months though its
insert says not after 32 weeks. That is the documented CDC-over-insert rule; `products.js`
stores `insertMaxAgeDays` precisely so the gap stays visible. Item D must *display* it.

---

## Owner decisions settled this session — apply, do not re-litigate

1. **Fewest needles wins, and duplicates are the real objection.** The 4-dose Hib path (4
   shots, 4 Hib doses) beats the 3-dose path (6 shots, 6 Hib doses) on both counts. There
   is no trade-off to weigh.
2. **Pentavalents (Penbraya, Penmenvy) may only be used when MenACWY *and* MenB are both
   due the same day.** Otherwise flag a gap. The owner notes this rule repeatedly
   regressed in MeningoVax; build it so it cannot.
3. **If a clinic stocks a pentavalent but not the matching plain MenB brand** (Trumenba for
   Penbraya, Bexsero for Penmenvy), the 17-year dose is a **gap** naming what to add — not
   a second pentavalent dose.
4. **Td (TDVAX/Tenivac) is dropped.** A healthy on-time child has no Td dose before 18; it
   only becomes useful if this app ever grows catch-up logic.

---

## The queue — nothing started

### A. Hib booster fix — small
Change `PedvaxHIB`'s `covers` to `Hib doses [1,4]`. Clinically correct per the sources
below; mixing brands already forces the 4-dose path, which is right. Fixes Findings 1
and 2. Needs a logic test (the `PedvaxHIB+Vaxelis` plan) and a UI test.

### B. Count every antigen in every syringe — medium, touches the planner's core
Placing a product must deliver **everything it contains**, not only what it was picked for.
One invariant then holds the app up:

> Every antigen delivered must be a planned, counted dose of that series. Nothing else may
> be delivered at all.

This makes Findings 1 and 3 impossible rather than detected — the search cannot score
them, so it will not pick them. Touches `coverVisit` / `evaluateAssignment` in `plan.js`.

**This is the risky item.** It changes scoring, so every existing plan needs re-checking.
Expect changes beyond the two known cases; show the owner each one rather than assuming
they are improvements.

### C. Restrictions become fields, not sentences — medium
Add an explicit per-product "not used for" list, precise enough to say what the sources
say. The existing `cannotBeBooster` is too blunt for Pentacel (it *is* the 15-month
booster; it must not be the 4–6 year one). Then two tests:
- a prose test — a restriction sentence in `facts[]` with no matching field fails the suite;
- a reason-code test — for each written restriction, the refusal must name *that rule*, not
  a coincidence. This is the layer that catches accidental blocks before they evaporate.

Absorbs the Pentacel fix: once wired, Pentacel stops being used at the 4-year visit. Note
a Pentacel-only clinic then has **no polio booster at 4 years** and the plan will show a
gap naming Kinrix/Quadracel. That is correct and honest, but it is a visible change to
schedules that look fine today — give it its own PR so the owner can look at it alone.

### D. Rulebook prints used-for / not-used-for — small once C lands
Per product: the dose numbers and ages it will be used for, the restrictions that apply
with their citation, and any insert-vs-CDC gap (RotaTeq above). Extend
`one-source-of-truth.test.js` from dose counts to restrictions, **both ways**: the rulebook
may not print a restriction the gate doesn't enforce, and the gate may not enforce one the
rulebook doesn't print.

### E. Penbraya and Penmenvy — largest, mostly source verification
Currently absent. The slot is real: today the 16-year visit plans `Bexsero + Menveo` (two
shots) where one pentavalent would do. Work:
- add both products; port verified sources from MeningoVax (`src/data/refs.js`,
  `src/logic/pentavalentCredit.js`) and re-verify live per this repo's rule;
- teach the MenB series that a pentavalent commits it to a brand family;
- put decision 2's both-due rule in **`cover.js` only** — it is the single gate every
  screen goes through. In MeningoVax the rule lives inside `recommend.js` with a separate
  copy in the validator, which is why it kept drifting;
- make the setting **mandatory**: a test fails if any product covering two or more series
  doesn't explicitly declare whether it is all-or-nothing, so the next Penbraya-like
  product cannot silently omit it;
- decision 3's gap at 17 years.

**Recommended order: A → B → C → D → E.** B before E, so the invariant is in place before
two new combination products arrive.

---

## Clinical sources verified live this session (2026-09-28)

For item A. Any *new* fact still needs its own live fetch per `verify-clinical-source`.

- **CDC child/adolescent schedule notes** —
  https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html
  > "Vaxelis is not recommended for use as a booster dose. A different Hib-containing
  > vaccine should be used for the booster dose."
- **ACIP/MMWR, Hib-containing vaccines** —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11392226/ — for the booster, "any Hib vaccine
  except DTaP-IPV-Hib-HepB should be used"; "no vaccine formulation is preferred."
- **Merck, PedvaxHIB** —
  https://www.merckvaccines.com/pedvaxhib/frequently-asked-questions/
  > "PedvaxHIB may be interchanged with other licensed Haemophilus b conjugate vaccines
  > for the primary and booster doses."
  (Insert tier — fills a gap in organization guidance, does not narrow one. Permitted.)
- **immunize.org Ask the Experts: Hib** — https://www.immunize.org/ask-experts/topic/hib/
  > "A 2-dose primary schedule…is only appropriate when both doses are PedvaxHIB."

  — confirms the app's existing 3-vs-4 dose rule is already right.

---

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git checkout main && git pull`
2. Run `npm test` — confirm **522 passing (15 files)** before any new work.
3. Start the dev server with `preview_start`, name `"Pedivax Schedule Builder dev server"`
   (`.claude/launch.json`, port 5187). Verify in the running app, not only in tests.
4. **Ask which item first — don't default.** A is recommended (smallest, and a wrong answer
   on screen today). B is the risky one. C ships a visible change to Pentacel-only clinics.
5. Per item: reproduce → failing test → fix → full suite green → live-verify in the app →
   commit named by item ID. Both layers of test are required for anything visible: a logic
   test (node env) and a UI rendering test (happy-dom).
6. Branch → PR → squash merge, per the `ship` skill. Do not push to `main`.
