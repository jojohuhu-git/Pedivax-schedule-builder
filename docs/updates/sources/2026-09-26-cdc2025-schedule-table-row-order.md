# Snapshot: CDC Child and Adolescent Immunization Schedule — table row order

**URL:** https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-age.html
**Fetched live:** 2026-09-26, via the `verify-clinical-source` skill, for Batch C / C2
of `docs/fix-2026-09-26-ux-copy-queue.md` (formulary checklist reorganisation).
**Page's own "Last Reviewed" / "Last Updated" date:** July 2, 2025 — the CDC 2025
edition (Addendum) docs/decisions.md pins this app to (pre-mid-2025 federal changes;
see `feedback_pin_pre_2025_vaccine_authority` memory).

## Full row order as published (top to bottom)

1. Respiratory syncytial virus (RSV-mAb [Nirsevimab])
2. Hepatitis B (HepB)
3. Rotavirus (RV)
4. Diphtheria, tetanus, & acellular pertussis (DTaP)
5. *Haemophilus influenzae* type b (Hib)
6. Pneumococcal conjugate (PCV15, PCV20)
7. Inactivated poliovirus (IPV)
8. COVID-19 (1vCOV-mRNA, 1vCOV-aPS)
9. Influenza (IIV3, ccIIV3)
10. Influenza (LAIV3)
11. Measles, mumps, rubella (MMR)
12. Varicella (VAR)
13. Hepatitis A (HepA)
14. Tetanus, diphtheria, & acellular pertussis (Tdap)
15. Human papillomavirus (HPV)
16. Meningococcal (MenACWY)
17. Meningococcal B (MenB)
18. Respiratory syncytial virus vaccine (RSV [Abrysvo])
19. Dengue (DEN4CYD)
20. Mpox

## Row order restricted to the 13 series this app models

Dropping RSV, COVID-19, Influenza, Dengue, and Mpox (none of which Pedivax Schedule
Builder covers — see `src/data/series.js`), the live table gives:

**HepB · RV · DTaP · Hib · PCV · IPV · MMR · VAR · HepA · Tdap · HPV · MenACWY · MenB**

This is the order C2 specifies the formulary checklist and rulebook should use for
"Single vaccines," and it **matches the reviewer's recalled order exactly** (the recall
quoted in the queue file), not today's `series.js` order. Today's file runs
`HepB · RV · Hib · MenB · PCV · DTaP · IPV · MMR · VAR · HepA · Tdap · HPV · MenACWY` —
Hib and PCV both sit ahead of DTaP, and MenB is misfiled 4th (grouped by its
shared-decision property instead of by age/table position).

## Format note

Direct `curl` to cdc.gov is bot-blocked in this sandbox (HTTP 403, same gap noted in
other source snapshots in this folder); the content above was retrieved through the
WebFetch tool, which renders the page and returns its text — not a byte-for-byte HTML
mirror, but a traceable live read of the actual table on the pinned 2025 edition.

An AAP PDF cross-check (`downloads.aap.org/AAP/PDF/AAP-Immunization-Schedule.pdf`) was
also attempted for the same row order, since AAP is this project's tiebreak authority.
It could not be read in this session — WebFetch cannot parse the raw PDF binary, and
local PDF rendering needs `poppler-utils`, not installed in this sandbox (the same gap
already recorded against the Prevnar 13 retirement-date check). Not pursued further:
row *ordering* on a wall chart is not a clinical rule the AAP-vs-CDC disagreement
authority applies to (dose counts, ages, and intervals are unaffected either way), and
the live CDC 2025 table already independently confirms the order the queue asked for.
