# Snapshot: Bright Futures Periodicity Schedule — visit ages

**URL:** https://www.brightfutures.org/pocket/pdf/appendices.pdf (Bright Futures
Pocket Guide appendices; Bright Futures is the AAP/HRSA program that publishes
the periodicity schedule)
**Fetched live:** 2026-09-25, via the `verify-clinical-source` skill

**Format note:** the primary AAP PDF (downloads.aap.org/AAP/PDF/periodicity_schedule.pdf)
returned image/binary content that could not be extracted as text by the fetch
tool available in this session, and the AAP practice-management and Pediatric
Care Online pages either omit the table or return HTTP 403. This Bright Futures
pocket-guide PDF mirror is the one source in this search that returned readable
column labels. It should be re-verified against the primary AAP PDF once a
session has a working PDF-to-text path (`pdftoppm`/poppler is not installed in
this environment — see the failed attempt this session).

## Quoted content — visit-age columns, in order

> Prenatal, Newborn, 3-5 d, 1 mo, 2 mo, 4 mo, 6 mo, 9 mo, 12 mo, 15 mo, 18 mo,
> 24 mo, 30 mo, 3 y, 4 y, 5 y, 6 y, 7 y, 8 y, 9 y, 10 y, 11 y, 12 y, 13 y, 14 y,
> 15 y, 16 y, 17 y, 18 y, 19 y, 20 y, 21 y

`src/data/visits.js` uses everything from Newborn (folded into `birth`) through
18 y — this app's scope is birth-to-18. Prenatal and ages 19–21 y are outside
scope and omitted.
