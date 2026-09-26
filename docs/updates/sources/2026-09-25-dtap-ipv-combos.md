# Snapshot: the five DTaP/IPV combination products — Pediarix, Pentacel,
# Vaxelis, Kinrix, Quadracel

Fetched live 2026-09-25 via the `verify-clinical-source` skill. Added now
because HepB, Hib, DTaP and IPV — every antigen these five touch — are all
verified, per the B2 queue order (docs/archive/handoff-2026-09-25-b1-b2-partial.md).

## Pediarix (DTaP-HepB-IPV) — DailyMed, label revision 9/2026
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=dd047022-e51c-4aa1-bd68-bc23161c3ce3&type=display

> PEDIARIX may be given as early as 6 weeks of age through 6 years of age
> (prior to the seventh birthday).

> Three doses (0.5 mL each) administered at 2, 4, and 6 months of age.

Covers only the first 3 doses of DTaP, HepB, and IPV (immunize.org confirms:
"Pediarix is licensed by the Food and Drug Administration (FDA) for only
the first 3 doses of the DTaP series").

## Pentacel (DTaP-IPV/Hib) — DailyMed, label revision 4/2026
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=67d5c665-ca88-49ba-b7d3-7145d9878cf0&type=display

> Pentacel is approved for use as a four dose series in children 6 weeks
> through 4 years of age (prior to fifth birthday).

> Pentacel is to be administered as a 4-dose series at 2, 4, 6 and 15-18
> months of age.

Covers DTaP, IPV, and Hib doses 1-4. This is one of the two products that
sets the Hib series to 4 doses (`setsSeriesLength: { Hib: 4 }`), same as
ActHIB/Hiberix — Pentacel's Hib component is the PRP-T type, which
`series.js`'s Hib facts already document as the 4-dose path.

immunize.org (combo-vaccines/dtap-ipv-hib/): "should not be used for any
dose in the primary series for children age 5 years or older or as the
booster dose for children ages 4 through 6 years" — confirms Pentacel is
never the 4-6-year DTaP/IPV booster; that role belongs to Kinrix/Quadracel.

## Vaxelis (DTaP-IPV-Hib-HepB) — DailyMed, label revision 4/2026
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=3ed8472a-c6eb-4076-9d66-025ede589e3d&type=display

> VAXELIS is approved for use as a 3-dose series in children from 6 weeks
> through 4 years of age

> VAXELIS is to be administered as a 3-dose series at 2, 4, and 6 months of
> age.

immunize.org (combo-vaccines/dtap-ipv-hib-hepb/): "It is not approved as
the booster dose of DTaP [dose 4 or 5] or IPV [dose 4] or Hib [dose 4]."

**Finding vs. the frozen mockup / data-design.md sketch:** both only
flagged `cannotBeBooster: ['Hib']` for Vaxelis. The live quote says the
restriction covers all three of its non-HepB components — DTaP, IPV, and
Hib — not Hib alone. Recorded as `cannotBeBooster: ['DTaP', 'IPV', 'Hib']`.
In practice `covers[].doses` (all `[1,3]`) already excludes dose 4/5 for
every component, so this mostly documents the restriction for the
rulebook rather than changing what `cover.js` would allow — but it's the
honest, fuller citation rather than the guessed narrower one.

Also sets Hib to 4 doses (`setsSeriesLength: { Hib: 4 }`), same reasoning
as Pentacel — Vaxelis is grouped with the PRP-T/4-dose Hib path in
`series.js`'s existing Hib facts ("ActHIB, Hiberix, Pentacel, or Vaxelis:
4-dose series").

## Kinrix / Quadracel (DTaP-IPV boosters) — immunize.org, re-fetched live
URL: https://www.immunize.org/ask-experts/topic/combo-vaccines/dtap-ipv/

Re-verified live this session (same page docs/decisions.md quoted
2026-09-24 — refreshed rather than reused, since it cost nothing extra and
keeps every fact in this app backed by its own dated snapshot file, not
just a prose citation in decisions.md).

> Kinrix: approved for use as the fifth dose of DTaP and the fourth dose of
> IPV in children ages 4 through 6 years who received DTaP (Infanrix)
> and/or DTaP-HepB-IPV (Pediarix) as the first three doses and DTaP
> (Infanrix) as the fourth dose.

> Quadracel: approved by the FDA in 2015 for use in children 4 through 6
> years of age ... for use in children who have received 4 doses of
> Pentacel (DTaP-IPV-Hib, Sanofi) and/or Daptacel (DTaP, Sanofi) vaccine ...
> approved ... as the fourth or fifth dose in the IPV series.

> Although it is preferable to use the same manufacturer's DTaP vaccine for
> all of the doses in the series, you can give either Kinrix or Quadracel
> as the fifth dose of DTaP and fourth dose of IPV at age 4 through 6 years
> if the previous brand is unknown or if Kinrix or Quadracel is the only
> product stocked.

Age range for both: 1461-2557 days (4 through 6 years, i.e. before the 7th
birthday) — same convention docs/data-design.md's own worked Quadracel
example already used.

## Conclusion

All five added as `kind: 'combination'`. Pediarix and Vaxelis need no
`setsSeriesLength` (neither reaches the Hib series). Pentacel and Vaxelis
both set `{ Hib: 4 }`. Kinrix and Quadracel carry a `lineage` preference
(never a bar, per CLAUDE.md) pointing at their matching first-3/4-dose
brands, with the "unknown or only one stocked" escape clause quoted above.
Vaxelis's `cannotBeBooster` is corrected to all three of DTaP/IPV/Hib, not
just Hib, per the live quote — a real (if mostly redundant) finding.
