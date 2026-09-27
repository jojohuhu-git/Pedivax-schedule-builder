# UX and wording queue — Pedivax Schedule Builder

**Written:** 2026-09-26, from a UX review that drove the running app at desktop and at
375 × 812 px (iPhone size). Findings artifact: *Formulary Rail Rethink*
(https://claude.ai/artifact/RJ9jXrVGVjaK2fjwTetR17).

**Status:** OPEN. Batch A is DONE (A1–A6, merged as PR #1). Batch B is DONE (B1–B4,
merged as PR #2). Batch C is DONE (C1–C5, PR opened 2026-09-26; C2's source fetch is
in `docs/updates/sources/2026-09-26-cdc2025-schedule-table-row-order.md`) — see its own
STOP line below for the baseline the next session (Batch D) should verify against.
Batches D–F are still open.

Run this with the `fix-queue` skill, one batch at a time. **Each batch is a whole
conversation.** Every batch ends at a STOP line: finish the batch, open its pull request,
write a handoff, and let the next batch start in a fresh session. Do not run two batches
in one conversation — that is what makes the context run out mid-item.

---

## Baseline — verify this before touching anything

| | |
|---|---|
| Repo | `~/Downloads/Pedivax-schedule-builder` |
| Branch at time of writing | `main`, commit `d46f43c` |
| Working tree | **Dirty on purpose** — `src/ui/Plan.jsx` and `src/ui/Rulebook.jsx` hold A1 and A2, finished and green but not committed |
| Full suite | **467 passing, 0 failing** (`npx vitest run`) |
| `main` protection | **Not protected** on this repo (checked 2026-09-26 via `gh api`). Still branch + PR, to match the other three apps — follow the `ship` skill |
| Dev server | `preview_start` with name `"Pedivax Schedule Builder dev server"`, port 5187 |

If the suite count differs and nothing explains it, stop and find out why before coding.
See the memory note about a vitest run collecting an agent worktree's copy of `src/`.

## Ground rules that bound every item here

- **Nothing in this queue changes a clinical rule.** Dose counts, ages, intervals and
  eligibility stay exactly as they are. If an item looks like it needs a clinical change,
  stop and ask — do not decide it inside a copy fix.
- Wording is for a **clinician**, not a lay reader (decisions.md, 2026-09-26). Precise
  scheduling language, no casual explanation, no jargon that isn't already clinical.
- The rulebook is generated from the same data the planner uses. New prose belongs in
  `src/data/`, never written twice.
- CSS custom properties only, no inline hex. No pill shapes. No decorative emoji.
- Both test layers for anything visible: a logic test and a rendering test.

---

## Settled in the review session — do not re-open

These were the owner's answers on 2026-09-26. They are also recorded in
[decisions.md](decisions.md).

1. **The checklist splits into two sections:** single vaccines grouped by antigen, then a
   separate combination-vaccine section. (Refines the 2026-09-24 row "grouped by antigen
   and by combination product," which in practice produced fourteen groups in file order.)
2. **Antigens run in age order, not alphabetical** — the row order of the AAP/CDC schedule
   table, which is essentially age of first dose with the ties already broken.
3. **Combination vaccines are sub-grouped by the visit they serve,** and within each
   sub-group the product with the most antigens comes first.
4. **The rulebook runs in the same age order,** and its jump bar is grouped into the same
   age blocks.
5. **On a phone the checklist collapses,** showing one line — "11 products stocked ·
   Change" — so the schedule is the first thing on screen.
6. **Fix the styling habits, keep the typeface.** No new font. The system stack stays.
7. **The legend says "Oral"** — not "Oral — not an injection."
8. **No organization / package-insert chips in the rulebook** — the source link already
   makes that obvious.
9. **The antigen order is copied from the AAP/CDC schedule table, not derived.** "By age"
   alone does not produce one list — five vaccines all start at the 2-month visit — so the
   tiebreak is the table's own row order rather than a rule of our own. A sequence
   clinicians already recognise beats a tidy rule nobody has seen.
10. **The checklist heading is "Your formulary."**

## Still needs the owner

Nothing. Every question raised by the review was answered on 2026-09-26. The one task that
still has to happen before Batch C writes code is a **source fetch, not a decision** — see
C2.

---

# Batch A — Copy quick wins

One pull request. Nothing here touches logic; all of it is strings and ordering.

### A1 — Legend reads "Oral" · P2 · **DONE**
`src/ui/Plan.jsx`. "Oral — not an injection" → "Oral". Verified live 2026-09-26.

### A2 — Drop the source tier chips · P2 · **DONE**
`src/ui/Rulebook.jsx`. Removed the `<span className="tag valence">{source.tier}</span>`
that printed the raw database values `organization` and `insert` next to each source link.
`tier` stays in the data — `sources.test.js` still requires it and the "an insert may fill
a gap, never narrow a rule" test still uses it. Verified live 2026-09-26.

### A3 — Put the rulebook in age order · P1 · **DONE**
`src/data/series.js` declaration order drives both the rulebook body and its jump bar.
It is already in age order **except MenB, which sits 4th** — between Hib and pneumococcal,
two 2-month vaccines — because it was placed by its "shared decision" property rather than
by age. Its sibling MenACWY is already last.

- Move the `MenB` entry to the end, after `MenACWY`.
- Group the jump bar into three age blocks with a light separator, same blocks as the
  checklist: *Birth & infant* · *Toddler & preschool* · *Adolescent*.
- Watch for anything that depends on `Object.values(SERIES)` order —
  `one-source-of-truth.test.js` and `Rulebook.test.jsx` both walk it.

### A4 — Rewrite the empty-visit line · P1 · **DONE**
`src/ui/Plan.jsx`. Today it reads:

> **No vaccines due at:** 3–5 days, 1 month, 9 months, 2 years, 2½ years, 3 years, 5 years,
> 6 years, 7 years, 8 years, 9 years, 10 years, 13 years, 14 years, 15 years, 17 years,
> 18 years. These well-child visits are left out of the plan below so the printed page
> stays short.

Seventeen ages in one run, sitting above the schedule to announce that nothing happens,
in two sentences, one of which explains a build decision the reader didn't ask about.

Replace with one sentence whose consecutive ages are collapsed into ranges:

> **No vaccine is due at the other well-child visits:** 3–5 days, 1 month, 9 months,
> 2 to 3 years, 5 to 10 years, 13 to 15 years, and 17 and 18 years.

- Compute the runs from the actual empty-visit list against `VISITS` order — never
  hardcode them. A different formulary must produce different ranges correctly.
- **Move it below the plan.** Its job is reassurance that no visit was silently dropped,
  which the reader wants after the schedule, not before it.
- Do **not** use a `<details>` toggle: it prints closed, and the printed wall chart is the
  point of this app.
- Test: a formulary that empties a different set of visits produces the right ranges,
  including a single stray age that must not become a range.

### A5 — Fix the third stat tile · P1 · **DONE**
`src/ui/Plan.jsx`. With Bexsero ticked, the tile reads **"None / shared-decision products
stocked"** while Bexsero is stocked and appears in the schedule below it. The code means
"no *undecided* shared-decision products"; what it says is contradicted by the plan three
inches down. Reword so the tile states what is true about the formulary in front of it.

Shipped as "Included / shared-decision product in this plan" when resolved (unresolved
list is empty), keeping "Optional / shared-decision products not yet decided" for the
other case, which was already accurate.

### A6 — Remaining small strings · P2 · **DONE**
`src/ui/Plan.jsx` unless noted.

| Now | Change to |
|---|---|
| "Nothing you stock can give these" | "Nothing in your formulary covers these doses." |
| "Tick a product that covers each one, or the child cannot complete the schedule here." | "Add a product for each, or the series can't be finished with what you stock." |
| "What you could add" | "Products that would save injections" |
| "One injection, 3 vaccines — covers:" | "One injection covering three vaccines:" |
| Header repeats "healthy child, birth to 18 years, no prior vaccines" in the eyebrow, the paragraph below it, and the footer | Once at the top; keep the footer line as the disclaimer |
| "What we stock" (checklist heading, `Formulary.jsx`) | **"Your formulary"** — the word the code has used all along (`pedivax-formulary`, `encodeFormulary`, `initialFormulary`), and it makes the gap-panel line above read naturally. F6 later hangs the count off it: "Your formulary · 11 of 30 stocked · Reset" |

Leave alone: "25 injections, birth to 18 years"; the legend; and the
"Earliest due at 1 month; scheduled at 2 months instead…" note, whose wording the owner
settled on 2026-09-26.

> ## STOP — Batch A ends here — DONE 2026-09-27
> Full suite green (**479 passing**, up from the 467 baseline — 7 new logic tests for
> A4's range-collapsing, 5 new rendering tests for A3/A4/A5/A6), `npm run build` green,
> live-verified on desktop and at 375 px against the real running app (screenshots and
> page-text checks in the session, not just the test suite). One PR opened from
> `fix/ux-copy-queue-batch-a`. Handoff written.
>
> A6's table row for the antigen count ("One injection, 3 vaccines — covers:" → "One
> injection covering three vaccines:") needed a small number-word map
> (`NUMBER_WORDS = {2: 'two', 3: 'three', 4: 'four'}`) since the count is computed, not
> a literal string — every combination product in this app covers 2–4 antigens, so the
> map doesn't need a case beyond that.
>
> Start Batch B in a new conversation.

---

# Batch B — The series-length explanations

The highest-severity content in the queue, and the only batch that edits `src/data/`.
Its own pull request.

**The problem, verified 2026-09-26** for a clinic stocking Engerix-B, RotaTeq, Pentacel,
Bexsero and Trumenba:

```
[HepB] Engerix-B and/or Recombivax HB (standalone hepatitis B) is the shorter path —
       3 doses instead of 4. The clinician can switch to Pediarix or Vaxelis for
       doses 2 through 4 instead.
[RV]   None of the shorter-series products are stocked, so this uses Any RotaTeq dose,
       or any mix of brands (3 doses).
[Hib]  None of the shorter-series products are stocked, so this uses Any PRP-T product
       (ActHIB, Hiberix), or any mix of brands (4 doses).
[MenB] Bexsero for both doses and Trumenba are both 2-dose series with no length
       difference — Bexsero for both doses was picked; the clinician can switch to the
       other brand instead.
```

**The cause:** `seriesLength.js` builds these by dropping a variant's `label` into a
sentence template. `label` is written to head a rulebook table ("Any PRP-T product
(ActHIB, Hiberix), or any mix of brands") and cannot also serve as a sentence fragment.

### B1 — The MenB note must not invite a mid-series brand change · **P0** · **DONE**
The only item in this queue where the current wording could mislead. "The clinician can
switch to the other brand instead" means *switch which brand the whole plan uses*; read
quickly at a desk it says *switch brands mid-series*. The verified quote already in
[series.js](../src/data/series.js) line ~327 is **"Bexsero or Trumenba (use same brand
for all doses)"**. Put that rule in the note and remove the word "switch."

Also fixes the visible seam — a `.replace(' for both doses', '')` strips the trailing
phrase from one mention of the label and not the other, producing "Bexsero for both doses
was picked."

### B2 — Split `label` from the plan's prose · P1 · **DONE**
Add a written-out string to each variant in `series.js` — one for when that variant is
chosen as the shorter path, one for when it is the fallback. `seriesLength.js` then
*selects* prose instead of *assembling* it. `label` keeps its rulebook job unchanged.

This keeps the one-source-of-truth rule: the prose still lives in `src/data/`, a human
just gets to write it. `one-source-of-truth.test.js` must still pass untouched.

### B3 — Write the four replacements · P1 · **DONE**
Each answers the three things a clinician actually wants — how many doses, at what ages,
and what would change it. Ages come from the variant's own `doses[]`, not retyped.

> **Hib — 4 doses** at 2, 4, 6 and 12–15 months. ActHIB and Hiberix are 4-dose series, and
> so is any series that mixes brands. Only an all-PedvaxHIB series is 3 doses (2, 4 and
> 12–15 months).

> **Rotavirus — 3 doses** at 2, 4 and 6 months. Any series containing a RotaTeq dose — or
> mixing the two brands — is a 3-dose series. An all-Rotarix series is 2 doses, at 2 and
> 4 months.

> **Hepatitis B — 3 doses** at birth, 1–2 months and 6 months, because you stock standalone
> hepatitis B vaccine. Giving doses 2–4 as Pediarix or Vaxelis is equally correct, but
> makes it a 4-dose series — one more injection.

> **Meningococcal B — 2 doses either way.** You stock both Bexsero and Trumenba; the plan
> uses Bexsero. The same brand must be used for both doses — the two are not
> interchangeable within a series.

Each of the four series also needs its **fallback-direction** wording (the case where the
shorter product is *not* stocked). Two rules for those: never open with what the clinic
doesn't have, and never invite the reader to switch to the longer option. Today a Rotarix
clinic is told *"Rotarix is the shorter path — 2 doses instead of 3. The clinician can
switch to Any RotaTeq dose, or any mix of brands instead"* — the app calls a choice better
and then offers to undo it.

Check the Pediarix-only case while here: the note opens "None of the shorter-series
products are stocked" and then names Pediarix, which that clinic *does* stock.

### B4 — Rename the panel · P2 · **DONE**
"Why some series are longer or shorter than expected" → **"Dose counts set by the brands
you stock."** Expected by whom? The panel only ever appears for the four brand-dependent
series, so say so.

> ## STOP — Batch B ends here — DONE 2026-09-26
> 483 passing (up from 479), 0 failing. `npm run build` green. Notes checked live
> against three formularies: nothing stocked (gap), Vaxelis+Pentacel (combination-heavy,
> exercises plan.js's own override note — unchanged and still correct), and
> Engerix-B+PedvaxHIB+Rotarix+Bexsero+Trumenba (shorter-series, exercises all four new
> `chosenNote` strings plus the rewritten MenB note). PR opened, handoff written.

---

# Batch C — Reorganise the checklist

The owner's main request. Its own pull request. **Do C2's source check first** — if the
schedule row order can't be confirmed, stop and ask rather than guessing.

Today the fourteen group headings come out in whatever order each group's first product
happens to sit in `products.js`, and two of them aren't diseases at all:

```
1 Hepatitis B   2 Rotavirus   3 Hib   4 Shared-decision products   5 Pneumococcal
6 DTaP   7 IPV   8 MMR   9 Varicella   10 Combination products   11 Hepatitis A
12 Tdap   13 HPV   14 MenACWY
```

Row 4 is meningococcal B — a 16-year-old vaccine filed between two newborn ones, grouped
by a policy instead of by what it protects against. Row 10 holds six products whose only
shared trait is more than one antigen in the syringe, and sits tenth only because ProQuad
is typed first in the file.

### C1 — Two sections · P1 · **DONE**
`src/data/products.js` + `src/ui/Formulary.jsx`. Add whatever field the data needs so the
UI can render **Single vaccines** (grouped by antigen) and **Combination vaccines**
separately, without `Formulary.jsx` deciding anything clinical for itself.

### C2 — Singles in schedule-table order · P1 · **DONE**
Settled 2026-09-26: **copy the AAP/CDC schedule table's row order**; do not derive an
order of our own. That makes the fetch below the first action of Batch C — the table is
now the specification, so it has to be read before any reordering.

**Do not reorder anything on recall.** The reviewer's remembered order and the order
already in `series.js` disagree, which is itself the evidence that one of them is wrong:

```
series.js today:  HepB · RV · Hib  · MenB · PCV · DTaP · IPV · MMR · VAR · HepA · Tdap · HPV · MenACWY
reviewer's recall: HepB · RV · DTaP · Hib  · PCV · IPV  · MMR · VAR · HepA · Tdap · HPV · MenACWY · MenB
```

MenB is misfiled either way and moves to the end. But the rest still differs — today's file
runs Hib, pneumococcal, DTaP, polio where the recalled order runs DTaP, Hib, pneumococcal,
polio. Use `verify-clinical-source` to fetch the AAP schedule, quote its actual rows into
the commit message, and use what it says. "Shared-decision products" stops being a group; Bexsero and Trumenba become
**Meningococcal B** at the end, with the shared-decision note as a line of text under the
group rather than a tint over the whole section.

### C3 — Combinations sub-grouped by visit · P1 · **DONE**

> **For the 2, 4 and 6 month visits**
> Vaxelis — DTaP + polio + Hib + hep B (doses 1–3)
> Pentacel — DTaP + polio + Hib (DTaP doses 1–4)
> Pediarix — DTaP + hep B + polio (doses 1–3)
>
> **For 12 months and 4 years**
> ProQuad — MMR + chickenpox
>
> **For the 4-to-6 year booster**
> Kinrix — final DTaP + polio
> Quadracel — final DTaP + polio

Most antigens first inside each sub-group: more antigens means fewer injections, which is
what the app scores on, so the list reads best-first. Pentacel sits above Pediarix despite
both being three antigens because Pentacel covers DTaP doses 1–4 and Pediarix only 1–3 —
show that difference in the sub-label. Every sub-label says what the product **replaces**.

### C4 — Consistent headings · P2 · **DONE**
Today the headings mix plain English ("Hepatitis B", "Varicella") with bare abbreviations
("Hib", "IPV", "MenACWY"), then repeat the abbreviation under every product — so
"HEPATITIS B → Engerix-B → HepB" says the same thing three times.

Use disease names with the abbreviation in parentheses where it helps: "Hepatitis B",
"Rotavirus", "Diphtheria, tetanus, pertussis (DTaP)", "Polio (IPV)", "Hib",
"Pneumococcal", "Measles, mumps, rubella (MMR)", "Chickenpox (varicella)", "Hepatitis A",
"Tdap booster", "HPV", "Meningococcal ACWY", "Meningococcal B".

### C5 — Drop the redundant sub-line on singles · P2 · **DONE**
The per-product abbreviation line earns its place on a combination ("DTaP + polio + Hib")
and on products where the valence matters (PCV20 / PCV15) and on the two oral products.
On a single vaccine under a heading that already names the disease, it is noise. Keep the
dose-count difference, which is genuinely useful: "PedvaxHIB · 3 doses" against
"ActHIB · 4 doses".

> ## STOP — Batch C ends here · **DONE 2026-09-26**
> C2's live fetch confirmed the reviewer's recalled order exactly (matches today's
> `docs/updates/sources/2026-09-26-cdc2025-schedule-table-row-order.md`) — only the
> Hib/DTaP swap and MenB's move (already done by A3) were needed in `series.js`.
> 483 → **489 passing** (`npx vitest run`), `npm run build` green, live-verified at
> desktop and at 375 × 812 px (dev server on port 5187) — no console errors, no
> horizontal overflow, both sections and all three combo sub-groups render with the
> right order and copy. Rulebook jump bar picked up the DTaP/Hib reorder automatically
> (single source of truth via `series.js` declaration order) with no Rulebook.jsx
> changes needed.

---

# Batch D — Make it work on a phone

The largest measured problem in the review, and independent of everything above.

### D1 — Collapse the checklist on phones · P1
**Measured 2026-09-26 at 375 × 812 px: the schedule starts 2,525 px down the page** —
roughly three full swipes past a form — because the 2,012 px checklist stacks above it.
The thing the app is for is invisible on the device most people reach for.

Below the existing 860 px breakpoint, the checklist starts closed as one line —
"11 products stocked · Change" — and opens on tap. Desktop is unchanged.

### D2 — Prove it · P1
Re-measure with the dev server running at 375 px and record the number in the PR. Target:
the first visit card visible without scrolling. Also confirm the panel opens and closes by
tap and by keyboard, and that `print.css` still hides the rail.

> ## STOP — Batch D ends here

---

# Batch E — Stop it looking machine-made

The owner chose **fix the habits, keep the typeface** — no new font, the system stack
stays. These five habits are what read as AI-built; they are style, not structure.

### E1 — Sentence case for micro-labels · P2
Every group heading and eyebrow is uppercase, 11 px, letter-spaced (`.eyebrow`, `.grp-t`,
`.spec-h` in `theme.css`). It is the single most recognisable tell. Sentence case, one
step larger, normal letter-spacing.

### E2 — Monospace only for numbers that line up · P2
`--f-mono` currently sets vaccine names, coverage lines, dose labels and visit metadata.
Monospace signals machine output. Keep it for dose counts and aligned figures; everything
else takes the body face.

### E3 — Fewer chips · P2
`Combination`, `Oral`, `PCV20`, `Shared decision`, `Retired` all render as bordered
uppercase chips. Keep the ones carrying information the row can't say in words; say the
rest in the sentence.

### E4 — An error should not look like a statistic · P1
The three summary tiles dress a good number, a neutral number and a *failure* identically.
Keep the two counts as counts; turn the gap into a sentence that names the fix. Pairs
naturally with F2.

> ## STOP — Batch E ends here

---

# Batch F — Remaining usability items

Independent of each other; can be split further across sessions if needed.

| ID | Item | Why | P |
|---|---|---|---|
| F1 | Two or three one-tap starting formularies the user then edits | Opening the app fresh shows `0 injections` and **12 red "cannot cover" rows** — a first impression of failure, measured 2026-09-26 | P1 |
| F2 | A fix button on each gap row — "Nothing covers DTaP dose 5 · *Add Kinrix*" | The app already computes which product closes each gap; today it reports the problem in one panel and the cure far below it | P1 |
| F3 | Move "What you could add" up beside the injection count | Best feature in the app, sitting where almost nobody scrolls | P1 |
| F4 | Show the effect of a tick — "25 → 22 injections" | Ticking a box silently re-renders a long page; on a phone the count is off-screen entirely | P2 |
| F5 | Search box in the checklist | 30 products across three screens; anyone who knows the product name wants to type it | P2 |
| F6 | "11 of 30 stocked" in the panel heading, and make Reset undoable or confirmable | No way to tell at a glance whether you finished ticking; Reset wipes everything silently | P2 |
| F7 | Let the whole page scroll on desktop | The rail is 2,012 px of content inside a fixed-height box, so the wheel does different things depending on where the pointer sits | P2 |

> ## STOP — Batch F ends here. Queue complete.

---

## When the queue is finished

Mark this file's status header **CONSUMED** with the date, move it to `docs/archive/`, and
record anything deferred as its own note so a later session can't resume a stale queue.
