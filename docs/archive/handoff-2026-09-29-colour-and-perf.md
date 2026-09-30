# Pedivax Schedule Builder — Handoff after the colour and lag session (2026-09-29, session 3)

Repo: `/Users/joannehuang/Downloads/Pedivax-schedule-builder`. Live at
https://jojohuhu-git.github.io/Pedivax-schedule-builder/

The app's promise: a clinician ticks the products their clinic stocks; the app plans the
most efficient birth-to-18 schedule those products can deliver for a healthy child.
**Ages only — no dates, no patient data.**

Branch: **`main`**, at `ac29381`, clean, in sync with `origin/main`. Baseline going in was
703 passing; now **717 passing (19 files)**, all green, `npm run build` green, Pages deploy
green, live site verified. Numbers from running the suite, not remembered.

> **No open queue.** Everything the owner raised this session is shipped. One small
> question is outstanding (below). Ask before starting anything new.

## What's done

Four PRs merged and deployed today, in order: **#19** and **#20** (see
`handoff-2026-09-29-prevnar13-and-moved-note.md`), then:

1. **#22 — a shared-decision dose is a shot** (`a1e052b`). Purple removed entirely; the
   17-year MenB dose is counted in its own visit header like any other injection.
2. **#25 — paint the schedule first** (`ac29381`). The lag the owner reported is fixed.

## #22 — the colour rule, now settled

**A colour may only describe something about the shot itself. Everything else is words.**
The legend is three entries and should stay three — teal (one shot covering several
vaccines), amber (booster — the owner likes these chips and said so explicitly), green
(oral, not a needle), plus red for a gap. **The owner was asked directly whether any other
colours should be used. The answer was no. Do not add a fourth hue.**

Purple went because of the owner's own argument, which is the one to reuse: a pentavalent
(Penbraya/Penmenvy) carries a routine MenACWY dose and a shared-decision MenB dose in
**one syringe**, and was never tinted or discounted — `isSdmShot()` only fires when
*every* antigen in the shot is shared-decision. The same MenB antigen was being treated
two different ways depending on which product delivered it.

The counting was independently wrong. Rendering the everything-stocked formulary, the
visit headers summed to **19** while the stat tile said **20**, because the 17-year
Bexsero dose was reported as "0 injections + 1 shared-decision" while `score.js` had been
counting it all along. A test now adds up every visit header and asserts it equals the
total. The owner's framing is worth keeping: *whether to give it is a conversation; how
many times the child is injected is not a matter of opinion.*

Unchanged: the "Not a routine dose… (shared clinical decision-making)" sentence still
prints, as ordinary secondary text. No scheduling logic was touched.

## #25 — where the lag actually was

Measured, not guessed. Per tick, on a production build:

| scenario | the schedule | "would save injections" | gap buttons |
|---|---|---|---|
| all 31 stocked | 18.6 ms | 17.9 ms | — |
| "fewest injections" preset | 16.5 ms | **333.8 ms** | — |
| half stocked | 16.5 ms | **286.9 ms** | **182.9 ms** |
| nothing stocked | 1.7 ms | 69.4 ms | 82.9 ms |

**Building the schedule costs under 20 ms and was never the slow part.** Both advisory
panels re-run `plan.js`'s whole search once per candidate product, and nothing was cached,
so the 4-second tick banner clearing itself recomputed all of it again.

Fixed by computing the schedule, counts and gap list from `ticked` (painted immediately)
and the two advisory panels from `useDeferredValue(ticked)`, plus a 24-entry cache inside
`buildPlan`. **Live site: 109–188 ms → 1–41 ms per tick; the preset ~334 ms → 1 ms.**
Nothing was made cheaper and nothing is approximated — the same functions run on the same
inputs, a beat later. The suggestion list is filtered against the *current* formulary on
the way out, so it can never offer a product already stocked.

### Three traps, all of which cost time — read before touching this again

1. **Dev-build timings are worthless for React concurrency work.** StrictMode
   double-invokes every render. Measure a production build: this session added a
   **"Pedivax Schedule Builder production preview"** entry (`vite preview`, port 5292) to
   the session's `.claude/launch.json`. Note `.claude/` is gitignored in this repo, so
   that entry is local only.
2. **The tidy version of the deferral silently undoes itself.** Keying the gap-button memo
   on the current gap list means it misses on every tick and the expensive search lands
   back on the urgent path.
3. **The first attempt made it 2× SLOWER** (184–249 ms), and the reasoning behind it
   looked sound. Only a call counter compiled into the bundle caught it — it showed **13
   plan searches inside the click handler instead of 1.** Measure this file; don't reason
   about it.

If the lag ever returns, the next lever — **not taken, and risky** — is pruning which
products `suggest()` tests. It would need an exhaustive proof across every formulary
first, because it could silently drop a real suggestion.

## What's NOT done

- **One open question, asked and not yet answered:** a pentavalent does **not** print the
  "Not a routine dose" sentence, because the shot as a whole *is* routine (the MenACWY
  half is due). Deliberate, flagged to the owner, left alone. Ask before changing it.
- **The `design-review` skill does not list this app at all.** The colour rule above is an
  owner-decided design decision and belongs there so a future session applies it instead
  of re-asking. Offered to the owner, not yet done — her skill file, her call.
- Prevnar 13's exact retirement date: abandoned by owner decision, closed. Don't reopen.

## A GitHub-mechanics note, so nobody repeats it

The perf work took three PR numbers for one commit. #23 was **stacked** on #22 (base set
to #22's branch so the diff stayed clean); GitHub **auto-closed** it when #22 merged and
deleted that base branch, and a closed PR whose base is gone cannot be reopened or
retargeted. #24 re-opened it from the same branch and **conflicted**, because that branch
still carried its own copy of #22's commit while `main` had the squashed version. #25 is
the same commit cherry-picked cleanly onto `main`. **Don't stack PRs in this repo** —
merge one, then branch the next off `main`.

## Why this is a good stopping point

Everything the owner raised is shipped, merged, deployed and verified on the live site.
The suite is green at 717, the build is green, `main` is clean, and nothing is
half-landed.

## Resuming

1. `cd /Users/joannehuang/Downloads/Pedivax-schedule-builder && git fetch && git status`
   — expect `main` at or after `ac29381`, clean.
2. Run `npm test`, confirm **717 passing (19 files)** before any new work. Check failed
   **suites**, not just failed tests — a file that crashes while loading runs zero tests
   and reports zero failures.
3. Dev server: `preview_start`, name `"Pedivax Schedule Builder dev server"`. The preview
   proxy reports the wrong port on this repo (three sessions running) — read
   `preview_logs` for the port vite actually bound and `navigate` straight to
   `http://localhost:<port>/Pedivax-schedule-builder/`. If the Browser pane is hidden,
   `computer` clicks and screenshots fail but `read_page`, `get_page_text` and
   `javascript_tool` still work — verify with those rather than skipping live checks.
4. **Ask the owner what to work on. There is no queue.** The known candidates are the
   pentavalent sentence question above, adding this app to the `design-review` skill, an
   adversarial audit (`app-audit`), or a live click-through — the four real bugs found in
   September all came from the owner using the running app, not from tests.
5. Per-item workflow: reproduce → failing test → fix → full suite green → live-verify in
   the running app → commit named by the item.
6. Push policy: **branch off `main` → PR → `gh pr merge --squash`**, one PR per item, and
   see the stacking note above.
