> **Superseded** by
> [handoff-2026-09-25-b2-complete.md](handoff-2026-09-25-b2-complete.md) —
> B2 is now fully done (all 14 vaccine groups + all 6 combo products).
> Read that file, not this one, for current state.

# Pedivax Schedule Builder — Handoff after B1 + B2 partial (2026-09-25)

Branch: `main`, no base (first branch — see "Push policy" below). **NOT pushed** — the
GitHub repo is public and empty; ask before the first push, per the previous handoff.

No test suite exists yet (`npm test` → "No test files found, exiting with code 1" — this
is expected, tests are B5, not a failure). `npm run build` succeeds. Working tree is
clean at commit `659afe4`.

**Supersedes:** `handoff-2026-09-25-planning-complete-build-next.md`. That handoff said
"nothing has been built" and pointed at queue items B1-B5. B1 is now done and B2 is
roughly one-third done — read *this* file, not that one, for current state.

## What's done

**B1 — scaffold, complete.** React 18 + Vite 5 + Vitest 2, matching the other apps'
tooling. `git init` done, `CLAUDE.md` written from `docs/data-design.md`. Dev server
verified live in the browser (port 5187, registered as both this repo's own
`.claude/launch.json` and an entry in `~/Downloads/vaxapp-main/.claude/launch.json`,
which is where this session's `preview_start` tool actually reads server configs from —
worth knowing if a future session's `preview_start` can't find this app's server).
Commit `9452653`.

**B2 — four data files, four of roughly thirteen vaccine groups done.** Owner's
explicit choice (2026-09-25): build one vaccine group at a time, live-verify every
clinical fact via the `verify-clinical-source` skill, commit per group. Every commit
below has its live quotes, URLs, and label revision dates saved to
`docs/updates/sources/2026-09-25-*.md` and cited from `src/data/sources.js`.

1. **Visit calendar** (`46f7846`) — `src/data/visits.js`, the full Bright Futures/AAP
   birth-to-18 well-child calendar, 28 visits. `NO_VAX_VISITS` from the old mockup was
   deliberately **not** carried over as a hardcoded list — it's derived in the logic
   layer instead (not built yet), so it can't drift from what the doses actually land on.
2. **Hepatitis B** (`46f7846`) — 3-dose series, quoted from CDC 2025 notes + the
   minimum-interval table + both monovalent inserts (Engerix-B, Recombivax HB — both
   agree with CDC, no gap). Two corrections found vs. the frozen mockup: it had no
   1-month visit (CDC allows dose 2 anytime 1-2 months) and treated 9 months as
   vaccine-free everywhere (CDC allows the HepB final dose there too).
3. **Rotavirus** (`e7db0a0`) — Rotarix (2-dose) vs RotaTeq (3-dose), modeled as
   `series.js`'s first `variants` case. **Real insert-vs-ACIP gap found**: both brand
   inserts want the series finished earlier (24wk / 32wk) than CDC/ACIP allows (final
   dose up to 8 months) — CDC/ACIP governs, recorded as `insertMaxAgeDays` on each
   product for the rulebook, not enforced by the (not-yet-built) `cover.js`.
4. **Hib** (`286815f`) — PedvaxHIB 3-dose vs. any-PRP-T-or-mixed 4-dose. **Another
   insert-vs-ACIP gap**: ActHIB and Hiberix's own inserts put the booster at 15-18
   months; CDC/ACIP allows it at 12 months and governs. PedvaxHIB's insert already
   matches CDC exactly. Also corrected a stale web-search claim (never written to a data
   file) that Hiberix was booster-only — the live DailyMed fetch says otherwise.
5. **MenB** (`659afe4`) — completes the three brand-length-setting series (with
   Rotavirus and Hib), but is a different shape: Bexsero and Trumenba are BOTH 2-dose
   series at 0-and-6-months, so there's no shorter-vs-longer choice, only a same-brand
   requirement. Confirmed the October 2024 ACIP interval change predates this app's
   mid-2025 authority cutoff, so it's adopted rather than excluded.

`src/data/products.js` currently holds 9 single-antigen products (2 HepB, 2 Rotavirus,
3 Hib, 2 MenB). No combination products yet — see below.

## What's NOT done — the remaining queue

**B2, remaining single-antigen groups** (no fixed order; pick whichever is next):
PCV (pneumococcal — decisions.md already has verified PCV7/PCV13 retirement facts to
reuse, see its "Verified 2026-09-25" section), DTaP, IPV, MMR, Varicella, HepA, Tdap,
HPV, MenACWY.

**B2, combination products** — do these *after* every antigen they touch is verified,
not before (a combo entry needs every `covers[]` antigen checked):
- Pediarix (DTaP+HepB+IPV, doses 1-3) — needs DTaP + IPV
- Pentacel (DTaP+IPV+Hib, doses 1-4, sets Hib:4) — needs DTaP + IPV (Hib already done)
- Vaxelis (DTaP+IPV+Hib+HepB, doses 1-3, sets Hib:4, cannotBeBooster:['Hib']) — needs
  DTaP + IPV (HepB and Hib already done)
- Kinrix / Quadracel (DTaP+IPV boosters, ages 4-6) — decisions.md's "Found while mocking
  up" section already has the MMWR-cited lineage rule for these two (dose 4-OR-5 for
  IPV, brand-lineage preference not a bar) — reuse those quotes, don't re-fetch
- ProQuad (MMR+VAR) — needs MMR + VAR

**B3 — logic layer.** `cover.js` (single gate), `seriesLength.js`, `plan.js`,
`score.js`, `suggest.js`. Not started; can't meaningfully start before B2 covers enough
antigens to exercise the logic against.

**B4 — the three screens + printable page.** Not started.

**B5 — the six named tests** (`docs/data-design.md`'s list, including the staleness
tripwire and the needles-vs-visits disagreement test). Not started.

**Open clinical items, from the previous handoff, still open:** re-fetch Pfizer's
Prevnar 13 discontinuation letter (PDF still 403s); snapshot format for CDC/AAP quotes
uses `.md` extraction files rather than raw HTML/PDF mirrors, because this session's
`curl` to cdc.gov returns HTTP 403 (bot-blocked) and WebFetch on FDA/AAP PDFs mostly
returns unparseable binary (`pdftoppm`/poppler is not installed in this environment,
so the Read tool can't render a saved PDF either) — a future session with a working
PDF-to-text path should prefer raw mirrors and can leave a note if it upgrades any of
this session's `.md` snapshots.

## Why this is a good stopping point

Every commit so far is independently green (loads, builds) and self-contained — no
half-written vaccine group, no product referencing a series that doesn't exist yet. The
three brand-length-setting series (the trickiest shape in `docs/data-design.md`) are
now all done, so whoever builds `seriesLength.js` in B3 has real examples of both
patterns (shorter-vs-longer for Hib/RV, same-length/same-brand for MenB) to work from.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git status` — confirm clean tree at
   `659afe4` (or later, if this handoff is stale — check `git log`).
2. `npm run build` — confirm it still succeeds before adding anything.
3. Pick the next single-antigen group (owner's call, no fixed order) or ask. For each:
   fetch live via `verify-clinical-source`, save a snapshot to `docs/updates/sources/`,
   add the `sources.js` entries, add the `series.js` entry, add the `products.js`
   entries, sanity-check with a quick `node -e "import(...)"` load, `npm run build`,
   commit. This session's four B2 commits are the template.
4. Once every single-antigen group is done, do the combination products, then move to
   B3. Don't start B3 early — the logic layer needs real data to be tested against.
5. **Push policy: ask before the first push.** The GitHub repo is public and currently
   empty. Once initialized, use the `ship` skill for branch/PR/merge rules.
6. **vaxapp is not a port target.** Copy useful logic *out* of `~/Downloads/vaxapp-main`
   freely; file nothing back into it.
