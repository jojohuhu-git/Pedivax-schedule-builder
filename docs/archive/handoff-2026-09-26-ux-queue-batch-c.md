> **Superseded** by
> [handoff-2026-09-26-ux-queue-batch-d.md](handoff-2026-09-26-ux-queue-batch-d.md) — PR #3
> is merged and Batch D is also done. Resume from that file instead.

# Pedivax Schedule Builder — Handoff after UX copy queue Batch C (2026-09-26)

> Supersedes `docs/archive/handoff-2026-09-26-ux-queue-batch-b.md` — that handoff's
> "Resuming" step 3 (start Batch C with a live AAP/CDC fetch) is done. Don't re-fetch.

Branch: `fix/batch-c-formulary-reorg`, off `main`. Pushed to `origin`, PR
[#3](https://github.com/jojohuhu-git/Pedivax-schedule-builder/pull/3) open, CI green.
**Not merged** — this repo's established pattern (Batches A and B before it) is to ask
the owner before squash-merging, not auto-merge.

Baseline was 483 passing tests; now **489 passing (11 files)**, all green, `npm run
build` green, working tree clean at commit `b82eb7f`.

## What's done (by item ID)

1. **C2's source fetch (done first, per the queue's own rule)** — live-fetched the CDC
   2025 child/adolescent schedule table via `verify-clinical-source`. Snapshot:
   `docs/updates/sources/2026-09-26-cdc2025-schedule-table-row-order.md`. It confirmed
   the queue's own "reviewer's recall" order exactly — not today's `series.js` order,
   which had Hib and PCV ahead of DTaP.
2. **C1** (P1) — `Formulary.jsx` now renders two top-level sections, **Single vaccines**
   and **Combination vaccines**, split on the existing `kind` field (no new field
   needed for the split itself).
3. **C2** (P1) — singles now run **HepB, RV, DTaP, Hib, PCV, IPV, MMR, VAR, HepA, Tdap,
   HPV, MenACWY, MenB** — the live-fetched order. `series.js`'s declaration order was
   reordered to match (swapped DTaP and Hib; MenB was already last from A3). The
   Rulebook tab's jump bar and body picked this up automatically — no `Rulebook.jsx`
   change needed, confirming the single-source-of-truth invariant held.
   "Shared-decision products" is no longer its own group; Bexsero/Trumenba are now
   grouped as **Meningococcal B** at the end, with `SERIES.MenB.sdm`'s existing note
   text rendered as a plain `.sdmline` under the heading instead of a `.sdmgrp` tinted
   background over the whole group (that CSS class is now deleted from `theme.css`).
4. **C3** (P1) — the six combination products (Vaxelis, Pentacel, Pediarix, ProQuad,
   Kinrix, Quadracel) are sub-grouped by the visit they serve, via two new
   `products.js` fields: `comboVisitGroup` (`'infant'`/`'toddler'`/`'booster'`) and
   `comboRank` (manual tie-break — Pentacel outranks Pediarix because it covers 4 DTaP
   doses to Pediarix's 3, not because of antigen count, so this couldn't be a UI-derived
   sort). Each product's queue-specified sub-label lives in a new `comboLabel` field
   (e.g. "DTaP + polio + Hib + hep B (doses 1–3)" for Vaxelis).
5. **C4** (P2) — checklist headings now use a consistent vocabulary, e.g. "Polio (IPV)",
   "Chickenpox (varicella)", "Tdap booster" — a new `GROUP_HEADING` map local to
   `Formulary.jsx` (deliberately not `SERIES.name`, which the Rulebook still uses for
   its own, differently-tuned headings).
6. **C5** (P2) — plain single vaccines now show a dose count ("PedvaxHIB · 3 doses" /
   "ActHIB · 4 doses") instead of a redundant abbreviation sub-line. The abbreviation
   line is kept on combinations (their own `comboLabel`), the two valence-matters PCV
   products (PCV20/PCV15), and the two oral products (Rotarix/RotaTeq, "RV · oral").

Everything above is one commit: `b82eb7f`. Tests updated/added in the same commit:
`src/test/Formulary.test.jsx` (7 new assertions covering C1–C5, one old assertion on
the removed generic-abbreviation text replaced).

## Live verification (per the queue's own STOP line)

Connected to an already-running dev server from another session on this same repo
(`http://localhost:5187/Pedivax-schedule-builder/`) rather than starting a new one —
this folder was already at its 5-dev-server-per-folder cap. Vite serves from disk, so
HMR picked up this session's edits.

- **Desktop:** both sections render; all 13 single-vaccine group headings appear in the
  live-fetched order; the Meningococcal B note reads as plain purple text with no
  background tint; all three combo sub-groups show the right products, order, and copy
  (screenshotted the 2/4/6-month group and the toddler/booster groups).
- **375×812px (iPhone size):** same content, no horizontal overflow, no layout breakage.
  (Batch D's phone-collapse fix is separately scoped and intentionally untouched here —
  the checklist still runs long above the schedule on a phone, as before.)
- **Console:** no errors on either viewport.
- **Rulebook tab:** spot-checked — jump bar now reads "HepB RV DTaP Hib PCV IPV" for
  Birth & infant, confirming the reorder propagated with zero `Rulebook.jsx` changes.

## What's NOT done — the remaining queue

Same file, `docs/fix-2026-09-26-ux-copy-queue.md`. All still OPEN:

- **Batch D** (P1) — collapse the checklist to one line on phones; the largest measured
  UX problem (schedule starts 2,525px down the page on a 375px-wide screen). Independent
  of Batch C — touches layout/CSS, not the grouping logic Batch C just changed.
- **Batch E** (P2) — five "reads as machine-made" style habits (uppercase micro-labels,
  overused monospace, chip overuse, error-as-statistic, per `docs/decisions.md`). Note:
  Batch C's own new `.grp-t` antigen headings are still uppercase micro-labels (existing
  convention, unchanged) — Batch E's own scope, not pre-empted here.
- **Batch F** (P1/P2) — eight independent usability items (starting-formulary presets, a
  fix-button on each gap row, moving "what you could add" up, etc.).

## Why this is a good stopping point

Batch C closed out the owner's main request from the review (the checklist reorg) as one
complete, independently-shippable unit — merged nothing else, touched no other screen's
logic, and the Rulebook picking up the reorder for free is a good sign the "one source of
truth" invariant is holding. Batch D is unrelated code (mobile layout/CSS) with no
half-finished thread here to pick back up.

## Resuming

1. `cd ~/Downloads/Pedivax-schedule-builder && git checkout main && git pull` — after PR
   #3 is merged, should be at `b82eb7f` or later. If not yet merged, ask the owner first
   (see below) rather than merging it yourself.
2. Run `npx vitest run` — confirm **489 passing** before any new work.
3. **Ask the owner to confirm the squash-merge of PR #3** before starting Batch D — same
   pattern as PRs #1 and #2 (branch → PR → ask, no auto-merge, no `--admin`).
4. Start Batch D with the `fix-queue` skill. Same per-item workflow as A/B/C: reproduce →
   failing test → fix → full suite → live-verify (at 375px, since that's the whole point
   of D1) → commit named by item ID.
5. Branch → PR → ask the owner before squash-merging, same as every batch so far.
