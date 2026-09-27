# Pedivax Schedule Builder — Handoff after UX copy queue Batch D (2026-09-26)

> **Supersedes** `docs/archive/handoff-2026-09-26-ux-queue-batch-c.md` — that handoff's
> "Resuming" steps (confirm PR #3 merge, start Batch D) are both done. Don't re-fetch,
> don't re-verify PR #3.

Batch D (D1/D2) shipped as **PR #4, merged into `main` by the owner** at commit
`8a42fc5`. A small docs-only follow-up, **PR #5, is open** (CI green, not yet
merged — ask the owner before merging it):
https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/5

Baseline was 489 passing tests; now **493 passing (11 files)**, all green on `main`
(verified via `npx vitest run` at commit `8a42fc5`, 2026-09-26).

## What's done (by item ID)

1. **D1** — below the 860px breakpoint, the formulary checklist (`src/ui/Formulary.jsx`)
   now starts collapsed to one line — "N products stocked · Change" — and opens on tap.
   Implementation: a `useState` toggle in `Formulary.jsx`, and CSS-only visibility in
   `src/ui/theme.css` (`.rail-summary` / `.rail-body`, both scoped to the existing
   `@media (max-width: 860px)` block). The full checklist markup is **always** in the
   DOM — only the media query hides it — so desktop is provably unaffected regardless of
   toggle state. Verified live at true desktop width (1280px): no summary line renders,
   layout identical to pre-Batch-D.
2. **D2** — re-measured live at 375×812px with a 12-product formulary: first visit card
   moved from **2,525px → 1,230px**. Did **not** reach the item's stated "no scrolling"
   target — the remaining 1,230px is the summary tiles, legend, and
   brand-dependent-dose-count prose ("Dose counts set by the brands you stock"), none of
   which is the checklist Batch D scoped. That's a Batch F candidate if it's worth its
   own item, not a Batch D gap.
   - Tap open/close: verified live (screenshots in PR #4).
   - `print.css`: unchanged and still correct — `.rail { display: none !important }`
     already covered the whole rail before this change and still does, since the new
     toggle/summary markup lives inside `.rail`. Verified by inspection, not a live
     print-preview screenshot (this browser tool has no print-preview mode).
   - **Keyboard open/close: NOT verified live.** An automated test
     (`userEvent.keyboard('{Enter}')` in `src/test/Formulary.test.jsx`) passes, and the
     toggle is a plain `<button>` with no custom key handling. But this session's live
     browser-preview tool could not trigger keyboard activation on **any** button,
     including the pre-existing "Reset" button — confirmed by testing Reset directly, so
     it's a tooling limitation, not a regression this PR introduced. Still, this is a
     real gap between "the queue says confirm it" and what actually got confirmed —
     worth a real keyboard tap-through next time someone's in the app on a device.

Commits: `6ca85b4` (D1/D2, PR #4, merged) — `dac5d0c` on branch
`docs/mark-batch-d-done-in-queue` (PR #5, queue-file status update only, not merged).

## Important — this folder had two concurrent sessions

Partway through this session, `main` had already moved (PR #4 got merged, and another
chat session had pulled `main` and checked out a **local-only** branch
`fix/batch-e-style-habits`, apparently starting Batch E) — all in the same shared working
directory this session also uses. A `cd`-and-commit in this session landed a commit on
that other branch by accident (git doesn't warn you when the currently-checked-out
branch has changed since your last command). Caught via `git reflog`; fixed by moving the
stray commit to its own branch (`docs/mark-batch-d-done-in-queue`, now PR #5) with
`git branch <name> <sha>` + `git reset --hard` back to `origin/main`, so the other
session's branch is byte-for-byte what they left it. Verified: `git diff
fix/batch-e-style-habits origin/main` is empty.

**If you're the next session in this same folder:** run `git branch --show-current` and
`git log --oneline -3` before your first commit — don't assume the branch you started on
is still checked out, especially after any tool call that can take a while (another
session's `cd`/checkout in the same shared directory can land in between). If
`fix/batch-e-style-habits` still exists locally with commits ahead of `origin/main`, that
is likely someone else's in-progress Batch E — read it, don't overwrite or rebase it
without checking whose it is first.

## What's NOT done — the remaining queue

Same file, `docs/fix-2026-09-26-ux-copy-queue.md`:

- **Batch E** (P2) — five "reads as machine-made" style habits (uppercase micro-labels,
  overused monospace, chip overuse, error-as-statistic). **May already be in progress** —
  see the concurrent-session note above; check `fix/batch-e-style-habits` before starting
  fresh.
- **Batch F** (P1/P2) — eight independent usability items (starting-formulary presets, a
  fix-button on each gap row, moving "what you could add" up, etc.) — can be split
  further across sessions.

## Why this is a good stopping point

Batch D is a complete, independently-shippable unit, already merged. The one loose end
(PR #5) is a one-line docs commit with green CI, waiting only on the owner's say-so to
merge — no code risk. Batch E is unrelated code (typography/style, not layout), so
there's no half-finished implementation thread here to pick back up — only the
concurrent-session state to be aware of.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git branch --show-current` — **check this
   first**, per the concurrent-session note above, before assuming you're on `main`.
2. `git checkout main && git pull` — should land on `8a42fc5` or later.
3. Run `npx vitest run` — confirm **493 passing** before any new work.
4. Ask the owner to merge PR #5 (docs-only, CI green) — or confirm it's already merged.
5. Check whether `fix/batch-e-style-habits` (local, not pushed) has work from another
   session before starting Batch E — if it does, that's a running session's WIP, not
   yours to resume or overwrite.
6. Start Batch E (or F) with the `fix-queue` skill, one batch per session, same
   reproduce → failing test → fix → full suite → live-verify → commit-by-ID workflow as
   A–D.
7. Branch → PR → ask the owner before squash-merging, same pattern as every batch so far.
