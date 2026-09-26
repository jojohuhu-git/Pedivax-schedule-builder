# Snapshot: Rotavirus — CDC schedule notes, CDC interval table, both inserts

All fetched live 2026-09-25 via the `verify-clinical-source` skill (WebFetch;
direct FDA/CDC fetch is blocked in this sandbox — see the format note in
`2026-09-25-cdc2025-hepb-notes.md`).

## CDC Child Immunization Schedule Notes, 2025 — Rotavirus (RV)
URL: https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html

> Rotarix: 2-dose series at age 2 and 4 months

> RotaTeq: 3-dose series at age 2, 4, and 6 months

> If any dose in the series is either RotaTeq or unknown, default to 3-dose series.

> Do not start the series on or after age 15 weeks, 0 days.

> The maximum age for the final dose is 8 months, 0 days.

## CDC catch-up/minimum-interval table — RV row
URL: https://www.cdc.gov/vaccines/schedules/wcms-inc/child-schedule-table-catchup_TP4.html

> Minimum age for dose 1: 6 weeks. Maximum age for first dose is 14 weeks, 6 days.

> Minimum interval between doses: 4 weeks between dose 1-2 and dose 2-3.
> Maximum age for final dose is 8 months, 0 days.

## Rotarix package insert (DailyMed, label revision 1/2024)
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f3182470-1965-4e20-dbaf-e3506f893ea5&type=display

> The first dose should be administered to infants beginning at 6 weeks of
> age. There should be an interval of at least 4 weeks between the first and
> second dose. The 2-dose series should be completed by 24 weeks of age.

## RotaTeq package insert (DailyMed, label revision 5/2026)
URL: https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=aaf3b24e-85fd-43ee-b657-2ee4df312ec3&type=display

> Administer orally as a series of 3 doses starting at 6 to 12 weeks of age,
> with the subsequent doses administered at 4 to 10 week intervals. The third
> dose should not be given after 32 weeks of age.

## Insert-vs-organization gap found here

Both inserts say to **complete the series earlier** than CDC/ACIP allows:
Rotarix's insert wants the 2-dose series done by 24 weeks; RotaTeq's insert
won't give dose 3 after 32 weeks. CDC/ACIP allows the final dose up to 8
months (about 35 weeks) for either brand. Per the authority rule, **CDC/ACIP
wins** — a late catch-up dose the insert would have refused is still valid.
Recorded in series.js as `insertMaxAgeDaysFinalDose` on each variant, purely
so the rulebook can show the gap; cover.js enforces the CDC ceiling only.
