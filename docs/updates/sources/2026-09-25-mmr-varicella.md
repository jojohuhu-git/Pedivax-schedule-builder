# Snapshot: MMR and Varicella — CDC schedule notes, catch-up intervals,
# the AAP/CDC MMRV disagreement, and all three single-antigen inserts

Fetched live 2026-09-25 via the `verify-clinical-source` skill.

## CDC Child Immunization Schedule Notes, 2025 — MMR and Varicella
URL: https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html
Page last reviewed: July 2, 2025

> MMR: 2-dose series at age 12–15 months, age 4–6 years

> Varicella: 2-dose series at age 12–15 months, 4–6 years

> For dose 1 in children age 12–47 months, it is recommended to administer
> MMR and varicella vaccines separately. MMRV may be used if parents or
> caregivers express a preference.

## CDC child/adolescent catch-up table — minimum intervals
URL: https://www.cdc.gov/vaccines/schedules/wcms-inc/child-schedule-table-catchup_TP4.html

> MMR — minimum age for dose 1: 12 months; minimum interval dose 1 to dose
> 2: 4 weeks (or 3 months if MMRV is used for either dose).

> Varicella — minimum age for dose 1: 12 months; minimum interval dose 1
> to dose 2: 3 months.

Neither minimum interval binds this app's on-time plan (doses are years
apart, at 12-15mo and 4-6y) — recorded for rulebook completeness, matching
the same treatment as every other series so far whose interval floor
doesn't bind on time.

## The AAP/CDC 2025 MMRV disagreement — reused from docs/decisions.md,
## verified 2026-09-24 (yesterday; not re-fetched)

docs/decisions.md, "Two places AAP and CDC 2025 actually disagree" already
quotes AAP's *Recommended Child and Adolescent Immunization Schedule ...
2026* (updated 2 September 2026, fetched 2026-09-24) —
https://downloads.aap.org/AAP/PDF/AAP-Immunization-Schedule.pdf (URL from
vaxapp's `src/data/aapBaseline.js`, which cites the same PDF):

> The AAP expresses no preference between MMR plus monovalent varicella
> vaccine or MMRV for toddlers receiving their first immunization of this
> kind. Parents should be counseled about the rare possibility of their
> child developing a febrile seizure 1 to 2 weeks after immunization with
> MMRV for the 1st immunizing dose.

> For the 2nd dose at 4–6 years, MMRV generally is preferred over MMR plus
> monovalent varicella to minimize the number of injections.

CDC 2025 (quoted above): recommends separate MMR/varicella for dose 1,
MMRV only if the family prefers it — silent on a dose-2 preference either
way. Per CLAUDE.md's authority rule, AAP governs where the two disagree:
**dose 1** — AAP is neutral, so there's no real disagreement to resolve
(CDC's dose-1 preference for separate shots stands, since AAP doesn't
contradict it, only declines to prefer either). **Dose 2** — AAP actively
prefers the combination (fewer injections) where CDC 2025 says nothing;
that's exactly what this app's needles-first design already wants, so
ProQuad is recorded as preferred at dose 2 once it's added.

This is documentary — it changes which *product* the plan recommends
(ProQuad vs. separate M-M-R II/Varivax), not the MMR/VAR series' own dose
ages or intervals, which are identical either way. Recorded on the MMR and
VAR series facts now; will also appear on ProQuad's product facts.

## M-M-R II package insert (DailyMed, label revision 6/2026)
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=252968ca-c714-4c1c-9e60-0b699cb9362f&type=display
Licensed age range: 12 months of age and older.

> The first dose is administered at 12 to 15 months of age. A second dose
> is administered at 4 to 6 years of age.

## Priorix package insert (DailyMed, label revision 11/2025)
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=95c6fdb6-b587-4413-92f9-d592b9f7a23e&type=display
Licensed age range: 12 months of age and older.

> First dose – 12 through 15 months of age. Second dose – 4 through 6
> years of age.

## Varivax package insert (DailyMed, label revision 8/2026)
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=524cf052-e90e-4595-af0a-608edbe9bd31&type=display
Licensed age range: 12 months of age and older.

> The first dose is administered at 12 to 15 months of age. The second
> dose is administered at 4 to 6 years of age. There should be a minimum
> interval of 3 months between doses.

All three inserts agree exactly with CDC/ACIP — no insert-narrower
conflict for any of the three products.

## ProQuad (MMR+Varicella combo) — DailyMed, label revision 11/2025
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=73eae9fc-507b-4c9c-883d-63eb2e3cc6f6&type=display

> ProQuad is a vaccine indicated for active immunization for the
> prevention of measles, mumps, rubella, and varicella in children 12
> months through 12 years of age.

> The first dose is administered at 12 to 15 months of age. The second
> dose is administered at 4 to 6 years of age.

**Why CDC prefers separate products at dose 1 — now grounded in a real
number, not just "recommended separately":**

> Administration of ProQuad (dose 1) to children 12 to 23 months old who
> have not been previously vaccinated against measles, mumps, rubella, or
> varicella, nor had a history of the wild-type infections, is associated
> with higher rates of fever and febrile seizures at 5 to 12 days after
> vaccination when compared to children vaccinated with M-M-R II and
> VARIVAX administered separately.

> The incidence of febrile seizures 5 to 12 days after ProQuad (dose 1)
> (0.70 per 1000 children) was higher than that in children receiving
> M-M-R II and VARIVAX concomitantly (0.32 per 1000 children).

This is the insert's own safety data explaining CDC's dose-1 preference —
not a narrower insert overriding CDC/AAP (CLAUDE.md's "insert may fill a
gap, never narrow a rule"), because CDC/AAP already recommend the same
thing for the same reason; the insert just supplies the number. Recorded
on ProQuad's product facts as the dose-1 reason, alongside AAP's dose-2
preference for the combination (both quoted above in the MMR series facts).

## Conclusion

MMR and Varicella both modeled as plain 2-dose series (like HepB/PCV/DTaP/
IPV), no `variants[]` — same ages for both series, identical whichever
product delivers them. ProQuad added as a `kind: 'combination'` product
covering both series' doses 1-2, licensed 12 months through 12 years.
