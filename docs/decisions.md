# Decisions

## Settled

| Decision | Date |
|---|---|
| Repo name is **Pedivax-schedule-builder**, kept separate from the existing PediVax (vaxapp). | 2026-09-24 |
| Version 1 is **healthy children only** — no asplenia, HIV, transplant or other risk conditions. | 2026-09-24 |
| "Most efficient" means **fewest needle sticks and/or fewest office visits**, depending on which products are stocked. | 2026-09-24 |
| Visits are **fixed to the standard well-child dates**. The app does not invent off-calendar visits. | 2026-09-24 |
| A dose **may be shifted inside its own legal window** to catch a combination product, if the clinician stocks that combo. | 2026-09-24 |
| The plan must **show which antigens each injection covers**, so a clinician can trace them. | 2026-09-24 |
| Dose numbering follows MeningoVax: **"Dose 3 of 5"**, with boosters visually distinct from primary doses. | 2026-09-24 |
| Products are chosen from a **checklist**, grouped by antigen and by combination product. | 2026-09-24 |
| Optional / shared-decision doses (MenB) **are shown**, clearly marked, and counted separately. | 2026-09-24 |
| Only visits where **something is due** are shown; the empty well-child visits are named in one line underneath. | 2026-09-24 |
| Output is a **printable page / save as PDF**. | 2026-09-24 |
| Annual vaccines (flu, COVID) sit in a **disclaimer band at the top**, not inside the plan. | 2026-09-24 |
| The **rulebook is generated from the planner's data**, never written alongside it. | 2026-09-24 |
| Every clinical rule carries **source, quoted sentence and a checked-on date**; a test fails when a date passes twelve months. | 2026-09-24 |
| Products are **retired, never deleted** — `retired: '2026-03-01'`, so old plans stay explainable. | 2026-09-24 |
| The plan speaks in **ages only** — it is a clinic protocol, not a per-child handout. No date of birth, no calendar dates. | 2026-09-25 |
| For Hib, rotavirus and MenB the app **picks the shorter series and says why**; the clinician can override. | 2026-09-25 |
| **HPV is a 2-dose series** — a birth-to-18 plan always starts in the 9–14 year band, where AAP gives 2 doses at 0 and 6–12 months (minimum interval 5 months; repeat if given too soon). Planned at the 11- and 12-year visits. | 2026-09-25 |
| **vaxapp is not a port target.** The owner plans to rebuild it. Useful logic may be copied *out* of vaxapp; nothing is owed back to it. MeningoVax and PneumoVax remain live parity targets. | 2026-09-25 |
| **Fewest injections is the score.** Visit count is a display nicety only — every visit is a Bright Futures check the child attends anyway, so an empty visit is not a trip saved. A test flags any plan where the two goals disagree. | 2026-09-25 |
| **A package insert may fill a gap, never narrow a rule.** Where CDC/AAP say nothing brand-specific, the insert is an acceptable source — recorded with its revision date and marked on the rulebook as resting on an insert alone. It may never override an age or dose rule an organization has already made. | 2026-09-25 |
| **"What you could add" ships** — the planner names products the clinic did *not* tick and says what stocking one would save. | 2026-09-25 |
| **One update inbox per repo.** `docs/updates/INBOX.md` lives here; MeningoVax and PneumoVax keep their own. Each applied note names the other apps that owe the same change. | 2026-09-25 |
| **Refines the row above:** when two visit choices cost the exact same number of shots, the app picks the one touching fewer checkups — free tidiness, never a shots-for-visits trade. There is still no toggle and no alternate plan shown; visit count remains display-only otherwise. | 2026-09-26 |
| **Products are labeled by valence where that matters, not just by the shared series abbreviation.** Prevnar 20 and Vaxneuvance both cover "PCV," but PCV20 and PCV15 protect against different serotype sets and are not the same product — the checklist, schedule, and rulebook all now tag them `PCV20`/`PCV15`/`PCV13` instead of the ambiguous shared `PCV`. | 2026-09-26 |
| **The schedule states each dose's total, not just its number** (e.g. "Hib Dose 1 of 4"), because a combination product can silently commit a whole series to a longer path — "Dose 1" alone doesn't say whether that's 1 of 3 or 1 of 4. A combination shot also gets a plain lead-in line ("One injection, 3 vaccines — covers:") before its antigen tags. | 2026-09-26 |
| **Schedule notes use clinical scheduling language, not casual explanation** — e.g. "Earliest due at 1 month; scheduled at 2 months instead to combine with another vaccine due at that visit" rather than "it landed here because that costs no extra shot or visit" (owner feedback: the app is used by a clinician, not a lay reader). | 2026-09-26 |
| **The checklist splits into two sections** — single vaccines grouped by antigen, then a separate combination-vaccine section. Refines the 2026-09-24 row above, which in practice produced fourteen groups ordered by nothing but their first product's position in `products.js`. | 2026-09-26 |
| **Antigens run in age order, not alphabetical** — the row order of the AAP/CDC schedule table, which is essentially age of first dose with the ties already broken. Alphabetical was rejected because it is really two orders that disagree (the checklist shows abbreviations, the rulebook shows disease names, and those sort differently), and because it would make the checklist disagree with the plan beside it. | 2026-09-26 |
| **Combination vaccines are sub-grouped by the visit they serve** (2–6 months · 12 months and 4 years · the 4-to-6 year booster), and within each sub-group the product with the most antigens comes first — more antigens means fewer injections, which is what the app scores on, so the list reads best-first. Every row says what the product replaces. | 2026-09-26 |
| **The rulebook runs in the same age order**, and its jump bar is grouped into the same age blocks. MenB moves from 4th to last: it was placed by its "shared decision" property rather than by age, which is why the bar looked arbitrary. | 2026-09-26 |
| **On a phone the checklist collapses** to one line ("11 products stocked · Change") so the schedule is the first thing on screen. Measured 2026-09-26 at 375 × 812 px: the schedule currently starts 2,525 px down the page. | 2026-09-26 |
| **Fix the styling habits, keep the typeface.** The app reads as machine-built because of uppercase letter-spaced micro-labels, monospace on things that aren't code, a chip on every item, and errors dressed as statistics — not because of the font. The system stack stays; no new typeface. | 2026-09-26 |
| **The legend says "Oral"**, not "Oral — not an injection". | 2026-09-26 |
| **No organization / package-insert chips in the rulebook** — the source link already makes which one it is obvious. `tier` stays in the data, where `sources.test.js` still needs it. | 2026-09-26 |
| **The empty-visit line collapses consecutive ages into ranges, states itself in one sentence, and sits below the plan** rather than above it — its job is reassurance that no visit was silently dropped, which the reader wants after the schedule. No `<details>` toggle: it prints closed, and the printed page is the point. | 2026-09-26 |
| **The checklist heading is "Your formulary"**, not "What we stock" — the word the code has used since it was written (`pedivax-formulary`, `encodeFormulary`, `initialFormulary`); the interface was the only place using a different one. It is also where the stocked count goes later. | 2026-09-26 |
| **The antigen order is copied from the AAP/CDC schedule table, not derived.** "Order by age" does not settle it on its own — DTaP, Hib, pneumococcal, polio and rotavirus all start at the 2-month visit — so the tiebreak is the published table's own row order rather than a rule this app invents. A sequence clinicians already recognise beats a rule nobody has seen. The table must be fetched and quoted before any reordering; a remembered order is not a verified one. | 2026-09-26 |

## Found while mocking up

**Some products commit the whole series.** The formulary checklist answers two different
questions and the app must keep them apart:

1. *What is in the fridge?* — plain yes/no per product.
2. *Which one will you actually use?* — only for Hib, rotavirus and MenB, where the brand
   choice sets the length of the entire series.

Conflating those silently added an injection in the first mockup. Verified 2026-09-24:

- **Hib** — PedvaxHIB start to finish is 3 doses. Any PRP-T product, or any mix of brands, is 4.
- **Rotavirus** — Rotarix is 2 doses, RotaTeq is 3. Not interchangeable.
- **MenB** — Bexsero and Trumenba are not interchangeable; one brand for both doses.

**The two 4–6 year booster combos are licensed along manufacturer lines.** Verified
2026-09-24 against MMWR 4 September 2015, 64(34):948-9 and immunize.org.

- **Quadracel** — "approved for administration as a fifth dose in the DTaP series and as a
  fourth or fifth dose in the IPV series in children aged 4 through 6 years who have
  received 4 doses of DTaP-IPV-Hib (Pentacel, Sanofi Pasteur) and/or DTaP (Daptacel,
  Sanofi Pasteur) vaccine." ACIP endorsed the licensed indications.
- **Kinrix** — approved "in children ages 4 through 6 years who received DTaP (Infanrix)
  and/or DTaP-HepB-IPV (Pediarix) as the first three doses and DTaP (Infanrix) as the
  fourth dose."
- **But the lineage is a preference, not a bar.** immunize.org: "you can give either
  Kinrix or Quadracel as the fifth dose of DTaP and fourth dose of IPV at age 4 through 6
  years if the previous brand is unknown or if Kinrix or Quadracel is the only product
  stocked."

This matters here more than it does in vaxapp. vaxapp meets a child whose earlier brands
are often unknown, which is exactly the case the escape clause covers. This app *plans*
the earlier doses, so it always knows the lineage — it can tell a clinic stocking Daptacel
and Kinrix that Quadracel is the matched product, or reassure one that stocks only Kinrix.

**Two smaller differences from vaxapp, both real:**
- vaxapp's `COMBO_DOSE_GATES` allows Quadracel for IPV dose 4 only; the licence covers
  dose 4 or 5.
- vaxapp holds no lineage condition for either product at all.

## Clinical authority — the edition this app is pinned to

Decided 2026-09-24, after verifying the timeline live.

**The app follows guidance as it stood before the federal changes that began in mid-2025,
plus AAP, which has continued publishing its own schedule.** Where AAP and CDC disagree,
AAP governs — the same rule the other apps already use.

Verified timeline (Congressional Research Service, *Changes to CDC Vaccine
Recommendations in 2025 and 2026*, IN12684):

| Date | What happened |
|---|---|
| 27 May 2025 | COVID-19 for children moved from universal to shared clinical decision-making |
| 9 June 2025 | "On June 9, 2025, the HHS Secretary removed all 17 then-sitting ACIP committee members and subsequently appointed new members." |
| 18–19 Sept 2025 | COVID-19 for children → SCDM; MMRV changed from preferential to recommending against |
| 4–5 Dec 2025 | Hepatitis B → SCDM for infants of HBsAg-negative or unknown mothers; CDC adopted it 17 Dec 2025 |
| 5 Jan 2026 | New federal childhood schedule, "adopted through presidential directive rather than ACIP consultation" — hepatitis A, hepatitis B, COVID-19, rotavirus, influenza and meningococcal dropped from routine; RSV moved to high-risk |

**So the cutoff is mid-2025, not 2026.** The practical line is the CDC 2025 schedule.

**Useful accident:** the CDC notes page the rulebook quotes still serves *"Child Immunization
Schedule Notes | Recommendations for Ages 18 Years or Younger, United States, 2025"*, last
reviewed 2 July 2025. Every CDC quote in the rulebook is therefore from before the changes.
That is luck, not a plan — the source label now names the edition and the date, and the
quotes must be snapshotted into the data file rather than re-fetched from a live URL that
could be replaced.

**AAP is the forward source.** Its *Recommended Child and Adolescent Immunization Schedule
for Ages 18 Years or Younger, United States, 2026* — **updated 2 September 2026**, fetched
2026-09-24 — still carries every routine childhood vaccine, including the universal
hepatitis B birth dose ("Birth weight ≥2000 grams: 1 dose within 24 hours of birth if
medically stable"), identical to the CDC 2025 wording.

### Two places AAP and CDC 2025 actually disagree — AAP wins in both

1. **MMRV / ProQuad.** CDC 2025: separate MMR and varicella are recommended for dose 1 at
   12–47 months. AAP: *"The AAP expresses no preference between MMR plus monovalent
   varicella vaccine or MMRV for toddlers receiving their first immunization of this
   kind"*, and *"For the 2nd dose at 4–6 years, MMRV generally is preferred over MMR plus
   monovalent varicella to minimize the number of injections."* This directly serves the
   app's goal — at the 4–6 year visit AAP actively wants the combination.
2. **MenQuadfi's minimum age.** CDC 2025 says 2 years. AAP says **6 weeks**. Nearly two
   years apart. (MeningoVax already shipped the 6-week floor; this app matches it.)

### Brand minimum ages — the rule

Each product carries **two** ages: the package-insert minimum, and the age CDC/ACIP/AAP
say it may be used from. Where they differ, **CDC/ACIP/AAP wins** — the insert is often
older and narrower. The insert is recorded anyway, so the difference is visible rather
than silently resolved.

## Verified 2026-09-25

### Retired pneumococcal products

**PCV13 / Prevnar 13 — discontinued 30 April 2024. Date NOT directly verified.**
Pfizer's own discontinuation letter (dated January 2024, hosted by the distributor
Medline) is titled *"Prevnar 13 Discontinuation April 30, 2024"*, and the search index
summary states Pfizer's Return Goods Policy applied until that date. **The PDF itself
returned HTTP 403 and could not be opened**, so this rests on the document's title and
index summary, not on a sentence read live. It should be re-fetched before shipping.
immunize.org Ask the Experts (Pneumococcal, reviewed 13 November 2024) confirms the
status but gives no date: *"PCV13 (Prevnar 13, Pfizer) is FDA-licensed and may still be
available in some clinics. It is no longer routinely recommended."*

**2026-09-26, third attempt — still not verified.** Owner supplied
`https://adult.prevnar20.com/whyprevnar20` as a possible source. Fetched live: it states
*"In the US, Prevnar 13 was available for adults from 2012 to 2024"* — confirms the
**year** but gives no day-level date, and it's Pfizer's own marketing page, not an
organization or insert-tier source. Also re-attempted the Medline discontinuation letter
directly (found its real URL via search this time, not just a cached title): WebFetch,
`curl` with a browser user-agent, and a real browser session all hit the same wall — not
a dead link, an active "Verifying the device..." bot-detection challenge. Did not attempt
to solve it (out of scope for this app, and not something to automate past). **Three
sessions running, three different tools — the date stays a recorded-with-caveat fact,
not a verified one**, until someone can open that PDF through a real browser by hand.

**PCV7 / Prevnar — no discontinuation date exists in any authoritative source.**
Searched and read live. What the sources actually say:
- MMWR 59(9), 12 March 2010: *"On February 24, 2010, a 13-valent pneumococcal conjugate
  vaccine (PCV13 [Prevnar 13, Wyeth Pharmaceuticals Inc., a subsidiary of Pfizer Inc.])
  was licensed by the Food and Drug Administration (FDA)"* and *"PCV13 is approved for
  use among children aged 6 weeks--71 months and succeeds PCV7, which was licensed by
  FDA in 2000."*
- MMWR RR-59(11), the 2010 recommendations: read in full; **contains no sentence saying
  PCV7 stopped being produced, distributed or available.** It says only that PCV13
  *"replaces PCV7, which is made by the same manufacturer."*
- immunize.org: providers were directed to *"transition from use of PCV7 to use of PCV13
  for routine vaccination of children"* in February 2010.

So the honest data-file entry is **"replaced by PCV13, February 2010"** — not
"discontinued 2010". Writing a discontinuation date would be inventing one.

### Does fewer needles ever disagree with fewer visits? Yes — and here is the mechanism

Both goals are served by piling doses onto the same visit, so they agree nearly always.
They come apart in one specific way: **combination products are licensed for particular
dose numbers**, and that licence pins a dose to a particular visit.

- Pediarix covers only DTaP doses 1–3. Kinrix and Quadracel cover only DTaP dose 5.
  Vaxelis may not be the Hib booster.
- Saving a needle therefore requires two doses to meet at the one visit where the combo
  is licensed for both of their dose numbers.
- Emptying a visit requires the opposite freedom — moving a dose anywhere in its window.

Worked example. A clinic stocks Pentacel (DTaP 1–4, IPV 1–4, Hib 1–4).
- *Needles-first:* DTaP dose 4 and Hib dose 4 both at 15 months, one Pentacel injection
  instead of three. The 18-month visit survives, holding hepatitis A dose 2 alone.
- *Visits-first:* push DTaP dose 4 out to 18 months to share the visit with hepatitis A
  dose 2, and the 15-month visit may empty — but DTaP 4 and Hib 4 are now apart, so
  Pentacel covers neither pairing and the child takes more injections.

**But "fewer visits" saves the family nothing.** Every visit in this plan is a Bright
Futures well-child check the child attends anyway; the app never invents a visit. An
"empty" visit is a check-up with no shot, not a trip avoided. Needles are the only cost
the child actually bears.

**Settled 2026-09-25** (see the Settled table above): fewest injections is the score;
fewest visits is a display tie-break only; a test flags any plan where the two disagree,
so a real case is reported rather than silently resolved. The Pentacel/hepatitis-A
scenario above is a hypothetical illustrating *why* the two goals can diverge in
principle — see "Found while building score.js" below for what actually happens when
`plan.js`'s search is asked to optimize for visits instead.

## Found while building B3 (plan.js), 2026-09-26

**A brand-length-setting series' variant can't be decided before the visit
search — it has to be decided BY it.** seriesLength.js resolves Hib/HepB's
variant purely from what's ticked, independent of anything else. But Hib and
HepB both share a combination product with DTaP/IPV (Pentacel, Vaxelis) —
and using that combo for even one dose silently commits the WHOLE series to
the longer path, regardless of what seriesLength.js picked in isolation.

A first version of plan.js pre-resolved each series' variant via
seriesLength.js, then let the visit/product search run against that fixed
dose list. Built against a formulary stocking PedvaxHIB (3-dose, the
"shorter" path) AND Pentacel, it produced a schedule that labeled the series
PedvaxHIB's 3-dose path while actually giving every real dose via Pentacel
(PRP-T) — a genuine under-dose, one real Hib shot short of what "any mix of
brands is 4" (above) requires. cover.test.js's own `dosesForProduct` helper
already carried a comment naming this exact gap as plan.js's job to close,
not a new problem.

**Fix:** for the two series that both (a) have a brand-restricted shorter
path and (b) share a combo product with another series — only Hib and HepB
today — the variant choice is now a branch INSIDE the same joint visit
search as DTaP/IPV/HepB, not a fact decided beforehand. Each branch commits
consistently to one variant's own product list for every dose in that
branch, so a product from the wrong variant can never cover one of its
doses. Regression test: `plan.test.js`'s brand-mixing invariant — for any
product that itself sets a series' dose count (`setsSeriesLength`), the
total doses that series actually received in the plan must match that
count, everywhere except HepB's dose 1 (identical across variants, and
physically only a monovalent product can give it — no combo is licensed
that young).

RV and MenB don't need this — no combination product touches either, so
their variant genuinely can't be entangled with another series' choice, and
seriesLength.js's simpler formulary-only resolution stays correct for them.

## Found while building score.js, 2026-09-26

**The Pentacel/hepatitis-A "visits-first" story above can't actually happen with
plan.js's search, and testing turned up a different, real, cost-free case instead.**
`plan.js` only ever looks for savings *within* one cluster of series that share a
combination product (built structurally from every product that exists, not just what's
stocked). Hepatitis A never shares a combination product with DTaP/Hib, so it is always
its own cluster — the search has no way to know a DTaP dose could land on the same visit
as a hepatitis A dose, and so never tries. The worked example was a good illustration of
the *idea* (combination-product licensing can pin a dose to one visit), but not a
schedule this app can actually produce.

Running both objectives (`buildPlan(ticked)` vs. `buildPlan(ticked, { objective: 'visits'
})`) against every formulary the app can build — every product stocked, and every
single-product-removed variant of that, in `needles-vs-visits.test.js` — found zero cases
where optimizing for visits costs a shot. It did find real, harmless disagreements in
visit count alone: when a clinic has no all-in-one product covering a flexible dose (for
example hepatitis B's 2nd dose, legally due at the 1-month **or** 2-month checkup, with
nothing to combine it with either way), the shot costs the same regardless of which visit
it lands on. **Owner decision, 2026-09-26:** since this is genuinely free — not a
shots-for-visits trade — `plan.js`'s default tie-break (`isBetter`, still optimizing on
injections first) now also prefers the visit choice that touches fewer checkups whenever
two choices cost the exact same number of shots (see the Settled table above). There is
still no toggle and no alternate plan ever shown to the clinician; this only changes which
one of several equally-good-on-shots schedules the app picks.

## Found while building item B (whole-syringe accounting), 2026-09-28

**Polio is a 5-dose series whenever Pentacel is used, and the app was hiding the 5th.**

Item B's rule is that a syringe delivers everything in it, so a product may only be given
at a visit where every antigen it contains has a dose due. Applying that turned up
something the planner had been quietly papering over: on the everything-stocked plan —
the one the app opens with — Pentacel was used at 15 months for the DTaP and Hib boosters,
and its polio content was delivered and never counted. Enforcing the rule strictly would
have refused Pentacel there and cost an extra needle.

But the extra polio dose is not a mistake. Checked live on 2026-09-28, CDC and AAP say it
in identical words:

> "4 or more doses of IPV can be administered before age 4 years when a combination
> vaccine containing IPV is used. However, a dose is still recommended on or after age 4
> years and at least 6 months after the previous dose."

— CDC child/adolescent schedule notes, Poliovirus vaccination; the AAP-published schedule
carries the same sentence, so there is no AAP-vs-CDC tiebreak to make here. Pentacel is
given at 2, 4, 6 **and** 15–18 months, so a Pentacel child genuinely receives four polio
doses before the fourth birthday and a fifth at 4–6 years. That is the standard result of
using Pentacel, not over-vaccination.

So polio became a fifth brand-length-setting series (`variants[]`, like Hib/RV/HepB/MenB):
a standard 4-dose path and a 5-dose combination path. It differs from the other four in
one way worth remembering — **neither path names a brand.** Every polio product may give
doses in either; which path a clinic lands on falls out of *where* its products land on
the calendar, not what is in its fridge. `seriesLength.js` and `plan.js` were generalised
so a variant that names no products is always available, and the one-source-of-truth test
gained a `reachedWith` field for the single variant no brand list can identify.

Checked at the same time: the Hib and DTaP notes carry **no** equivalent allowance, so
polio is the only series that needed one.

**Two consequences worth knowing about, both of which the data already implied:**

- **Kinrix and Quadracel are not interchangeable after Pentacel.** Kinrix is approved as
  "the fourth dose of IPV" (the Infanrix/Pediarix lineage); Quadracel as "the fourth or
  fifth dose". A Pentacel child's 4–6 year shot is their fifth, so Quadracel is the right
  partner and Kinrix cannot finish the series. Both quotes were already in `products.js`
  and already encoded as `IPV [4,4]` vs `IPV [4,5]`; nothing about them changed. What
  changed is that the planner now acts on them. The **"Fewest injections" starting preset
  was mis-paired** (Pentacel + Kinrix) and showed a real 2-dose gap at 15 months once the
  accounting was honest — swapped to Quadracel, which closes it.
- **A Pentacel-only clinic now shows a gap at 4 years** for the last DTaP and polio doses,
  instead of a 5th Hib and DTaP dose delivered by a Pentacel its own rulebook entry says
  must not be used at 4–6 years. This is Finding 3 of the 2026-09-28 queue, which item C
  was scheduled to fix explicitly; item B makes it structurally impossible first.

**Also fixed, because item B exposed it:** `fixGap.js` ranked candidate products by
injection count alone, so it told a Pentacel-only clinic to "Add Kinrix" for the last
polio dose — which closes that gap and opens two others, for no net improvement, because
a plan that gives up on two doses needs fewer needles than one that gives them. It now
ranks by remaining gaps first, then injections, matching `plan.js`'s own `isBetter`.

## Still open

- **Re-fetch Pfizer's Prevnar 13 discontinuation letter** to confirm 30 April 2024 from
  a sentence rather than a document title.
- **Snapshotting the CDC 2025 quotes into the data file** so the app does not depend on a
  live URL whose contents can be replaced.
- **The 16 single-antigen brand rules still need their inserts read.** The rule for how
  to do it is settled above; the reading has not been done.
