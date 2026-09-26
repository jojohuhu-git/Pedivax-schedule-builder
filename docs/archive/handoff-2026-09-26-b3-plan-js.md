**Supersedes:** `handoff-2026-09-25-b2-complete.md` and
`handoff-2026-09-25-b1-b2-partial.md`. Both predate B3 entirely. Read this
file for current state.

# Pedivax Schedule Builder — Handoff after plan.js (2026-09-26)

Repo: [github.com/jojohuhu-git/Pedivax-schedule-builder](https://github.com/jojohuhu-git/Pedivax-schedule-builder)
(public). Branch: `main`, no protection rules yet — this session added the
remote (there was none before) and has been pushing straight to `main`, same
as every prior commit in this repo's history. Working tree clean at commit
`ddaaf59`, pushed. Baseline was 150 passing tests (2 files); now **165
passing (3 files)**, all green. `npm run build` succeeds.

## What's done this session

**Remote added, repo pushed for the first time.** `git remote add origin` +
push — the repo existed on GitHub but was empty. All prior local history
(20 commits through B2) plus this session's work is now live.

**`cover.js`'s `doseWindowOk` exported** (was module-private) — `plan.js`
needed the same pure-calendar legality check cover.js already has; exporting
it avoids a second implementation of the same rule.

**`plan.js` built and tested — the schedule builder.** The real content of
this session. Given a ticked formulary, it decides which visit each dose
lands on and which product covers it, minimizing total injections
(`docs/decisions.md`'s settled score). Series that share a combination
product (DTaP/IPV/Hib/HepB via Pediarix/Pentacel/Vaxelis/Kinrix/Quadracel;
MMR/VAR via ProQuad) have their flexible doses chosen JOINTLY, by brute
force over the small set of real options — everything else places at its
own earliest legal visit, since nothing else could ever change its
injection count. `src/test/plan.test.js`, 15 tests.

**A real bug found and fixed while building it**, recorded in
`docs/decisions.md` under "Found while building B3": a first version
pre-resolved Hib/HepB's brand-length-setting variant from the formulary
alone (via the existing `seriesLength.js`), then let the visit search
assign products against that fixed dose list. Because Hib and HepB both
share a combo product with DTaP/IPV, this let the search assign a PRP-T
combo (Pentacel) to a series it had already labeled as PedvaxHIB's
exclusive 3-dose path — an actual under-dose, one Hib shot short of what
"any mix of brands is 4" requires (`docs/decisions.md`, settled 2026-09-25).
`cover.test.js`'s own `dosesForProduct` comment had already flagged this
exact interaction as plan.js's job to solve, not a new problem to escalate.
Fixed by making the variant choice part of the SAME joint search as the
visit choice, for the two series where it's actually entangled (Hib, HepB)
— RV and MenB don't need this, since no combo product touches either of
them. `plan.test.js` has a standing regression test for it (the
"brand-mixing" invariant).

**MAP.md updated** — no longer says the logic layer isn't built.

## What's NOT done — the remaining queue

**B3's other two logic files.**
- `score.js` — not started. Per `docs/data-design.md`: compute BOTH the
  needles-optimal plan (what `plan.js` already does) and a visits-optimal
  plan (same search machinery, different objective — minimize visits
  touched instead of injections), and fail loudly on any formulary where
  they disagree, rather than silently picking one. `plan.js`'s
  `searchCluster`/`evaluateAssignment` should generalize cleanly to a
  second objective; the worked Pentacel example in `decisions.md` is the
  test case to build against. Needs its own `needles-vs-visits.test.js`.
- `suggest.js` — not started, blocked on nothing (could go before or after
  `score.js`). Re-runs `plan.js` with one un-ticked product added at a time
  and reports the injection-count difference — must use `plan.js` itself,
  never an estimate.

**B4 — the three screens + printable page.** Not started, blocked on
`score.js`/`suggest.js` existing (the UI will call all of `plan.js`,
`score.js`, `suggest.js`).

**B5 — the six named tests.** `cover.test.js` (132 tests) and
`series-length.test.js` (18 tests) existed already; `plan.test.js` (15
tests) is new this session. Still missing: `staleness.test.js`,
`sources.test.js`, `needles-vs-visits.test.js` (blocked on `score.js`),
`one-source-of-truth.test.js` (blocked on the UI existing, since it checks
the rulebook's dose counts against the planner's).

**Open clinical items, carried forward from B2, still open:**
- Prevnar 13's discontinuation date (30 April 2024) — still resting on a
  document title, not a live-read sentence (the PDF 403s).
- The 16 single-antigen brand rules still need their inserts read
  (`docs/decisions.md`'s "Still open" section).

## Why this is a good stopping point

`plan.js` is the one genuinely hard piece of B3 — a real constraint search,
not a lookup — and it's now built, tested (165 green), and has already
caught and fixed one real under-dosing bug rather than shipping it quietly.
`score.js` and `suggest.js` are both meant to be built ON TOP of `plan.js`
(data-design.md is explicit: all three go through the same functions), so
there's no half-finished shared state to hand off — the next session starts
clean with solid ground under it.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git status` — confirm clean
   tree at `ddaaf59` (or later, if this handoff is stale — check `git log`).
2. `npm test` — confirm 165 passing before adding anything.
3. Start with `score.js`: reuse `plan.js`'s cluster search with the
   objective flipped to visit count, compare against the needles-optimal
   plan, and write `needles-vs-visits.test.js` alongside it (the pattern
   from this session — write the matching test as the logic file is built,
   not after — worked well and caught a real bug early).
4. Then `suggest.js`.
5. **Push policy: this session pushed straight to `main` for every commit**,
   matching the repo's whole history so far (no PRs, no protection rules).
   Keep doing that unless the owner asks for branch+PR — ask if unsure
   rather than assuming either way carries forward silently.
6. **vaxapp is not a port target** (unchanged). Copy useful logic OUT of
   `~/Downloads/vaxapp-main` freely; file nothing back into it. MeningoVax
   and PneumoVax remain live parity targets for meningococcal/pneumococcal
   rules specifically — unrelated to this app's own queue.
