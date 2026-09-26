**Supersedes:** `handoff-2026-09-25-b1-b2-partial.md`. That handoff left B2
one-third done (4 of 14 groups). B2 is now **completely done** — read this
file, not that one, for current state.

# Pedivax Schedule Builder — Handoff after B2 complete (2026-09-25)

Branch: `main`, no base (first branch). **NOT pushed — and there is no git
remote configured at all** (`git remote -v` is empty). The previous
handoff said "ask before the first push, repo is public and empty" —
before that can even happen, `git remote add origin <url>` needs to run.
Ask the owner for the remote URL (or confirm `jojohuhu-git/Pedivax-schedule-
builder` is right) before pushing.

No test suite exists yet — `npm test` → "No test files found, exiting with
code 1". This is expected (tests are B5, not started), not a failure.
`npm run build` succeeds. Working tree is clean at commit `d0779ca`.

## What's done

**B1 — scaffold** (commit `9452653`, from the previous session): React 18 +
Vite 5 + Vitest 2, `CLAUDE.md` written, dev server verified.

**B2 — all 14 vaccine groups and all 6 combination products, complete.**
14 commits (`46f7846` through `d0779ca`), one per group, each live-verified
via the `verify-clinical-source` skill with a dated snapshot in
`docs/updates/sources/` and cited from `src/data/sources.js`. Final counts:
**13 series, 31 products, 57 sources** in `src/data/`.

Groups, in commit order: visit calendar + HepB (`46f7846`) · Rotavirus
(`e7db0a0`) · Hib (`286815f`) · MenB (`659afe4`) · PCV (`fb9e512`) · DTaP
(`e125c7b`) · IPV (`3ce7bde`) · the 5 DTaP/IPV combos — Pediarix, Pentacel,
Vaxelis, Kinrix, Quadracel (`033d05c`) · MMR + Varicella + ProQuad
(`5f14782`) · Hepatitis A (`c78790d`) · Tdap (`f057f2b`) · HPV (`ea95b4e`)
· MenACWY (`d0779ca`).

**Real findings from this session**, beyond "verified, matches":
- **Vaxelis's `cannotBeBooster`** was `['Hib']` in the frozen mockup and
  `docs/data-design.md`'s sketch. The live immunize.org quote says it's not
  approved as the booster for DTaP, IPV, *or* Hib — corrected to all three
  (`033d05c`). Mostly redundant with the dose-number licence, but the
  honest fuller citation.
- **Hepatitis A** is the first series where the minimum-interval floor
  (6 months) actually changes which on-time visit is valid for dose 2 —
  m18 if dose 1 ran at 12 months, m24 if it ran at 15 months. The frozen
  mockup hardcoded m18 alone, which would silently violate the floor for a
  15-month first dose (`c78790d`).
- **HPV**: `docs/decisions.md` attributed the 2-dose-at-0/6-12-months rule
  to AAP specifically, but CDC 2025's own notes page states the identical
  rule — no real AAP/CDC disagreement, just cite either (`ea95b4e`).
- **MenACWY**: reused MeningoVax's own live-verified AAP/CDC disagreement
  (MenQuadfi's minimum age — CDC 2025 says 2 years, AAP says 6 weeks) —
  confirmed MenQuadfi's own FDA insert independently agrees with AAP's 6
  weeks, not CDC's 2 years (`d0779ca`).
- **Prevnar 13's retirement date** (30 April 2024) is still not verified
  from a live-read sentence — the Medline PDF 403s every session that's
  tried it (this one included). Recorded with an explicit caveat in
  `fb9e512` rather than upgraded to a plain fact.

## What's NOT done — the remaining queue

**B3 — the logic layer.** Not started. `src/logic/` is empty.
- `cover.js` — the single gate: may this product give this dose of this
  series at this visit? Mirrors `brandRules.js` in vaxapp.
- `seriesLength.js` — for Hib, rotavirus, MenB: pick the shorter series,
  say why, let the clinician override.
- `plan.js` — builds the schedule from `cover.js` + `seriesLength.js`.
- `score.js` — fewest injections is the score; visit count is a display
  nicety only; flag any plan where the two disagree (`docs/decisions.md`'s
  worked Pentacel example is the test case to build against).
- `suggest.js` — "what you could add," by re-running `plan.js`, never an
  estimate.

Now that all 13 series and 31 products exist, B3 has real data to build
and test against — this was the blocker before.

**B4 — the three screens + printable page.** Not started, blocked on B3.

**B5 — the six named tests** (`docs/data-design.md`'s list: `staleness.
test.js`, `sources.test.js`, `cover.test.js`, `series-length.test.js`,
`needles-vs-visits.test.js`, `one-source-of-truth.test.js`). Not started.
Some of these (staleness, sources) could technically start now since
`src/data/` is complete, but `cover.test.js` and `series-length.test.js`
need `src/logic/` to exist first.

**Open clinical items, carried forward, still open:**
- Prevnar 13's discontinuation date (30 April 2024) — still resting on a
  document title/search summary, not a live-read sentence. Re-attempt only
  if a future session has a working PDF-to-text path (poppler is not
  installed in this environment).
- No git remote configured — see the top of this handoff.

## Why this is a good stopping point

Every one of B2's 14 commits is independently green (loads, builds) and
self-contained. All three of the trickiest data shapes in
`docs/data-design.md` — brand-length-setting `variants[]` (Hib/RV/MenB),
combination products with dose-range licences and lineage preferences
(the 5 DTaP/IPV combos + ProQuad), and a real minimum-interval floor that
changes visit placement (HepA) — now have live examples in the data files
for B3's logic layer to be built and tested against. There is no
half-finished vaccine group and no product referencing a series that
doesn't exist.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git status` — confirm clean
   tree at `d0779ca` (or later, if this handoff is stale — check `git log`).
2. `npm run build` — confirm it still succeeds before adding anything.
3. **Ask the owner**: is there a git remote to add, and does the repo need
   its first push before B3 starts, or can B3 proceed locally first?
4. Start B3: `cover.js` first (the single gate everything else depends on),
   then `seriesLength.js`, `plan.js`, `score.js`, `suggest.js`, in that
   order — each one has real data to test against now. Write the matching
   B5 test as each logic file is built, rather than deferring all six to
   the end (the exhaustive `cover.test.js` invariant walk especially
   benefits from being written alongside `cover.js`, not after).
5. **Push policy: ask before the first push.** No remote is configured yet
   at all (see top of this handoff) — confirm the target before running
   `git remote add`.
6. **vaxapp is not a port target.** Copy useful logic *out* of
   `~/Downloads/vaxapp-main` freely; file nothing back into it. MeningoVax
   and PneumoVax remain live parity targets for meningococcal/pneumococcal
   rules specifically.
