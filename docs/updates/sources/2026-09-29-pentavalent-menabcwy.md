# Snapshot: the pentavalent MenABCWY vaccines — Penbraya and Penmenvy

Fetched live **2026-09-29** via the `verify-clinical-source` skill, for item E of the
2026-09-28 brand-indication airtightness queue.

Everything below is a direct quote from the page named above it. Nothing here is
transcribed from memory, from MeningoVax, or from the queue document.

---

## CDC Child Immunization Schedule Notes, 2025 — meningococcal
URL: https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html
Edition: "United States, 2025", last reviewed **2 July 2025** (the edition this app is
pinned to — see docs/decisions.md, "Clinical authority").

> Children age 10 years or older may receive a single dose of Penbraya as an alternative
> to separate administration of MenACWY and MenB when both vaccines would be given on the
> same clinic day

> For age-eligible children not at increased risk, if Penbraya is used for dose 1 MenB,
> MenB-FHbp (Trumenba) should be administered for dose 2 MenB.

> For age-eligible children at increased risk of meningococcal disease, Penbraya may be
> used for additional MenACWY and MenB doses (including booster doses) if both would be
> given on the same clinic day and at least 6 months have elapsed since most recent
> Penbraya dose.

(That third sentence is an at-increased-risk rule. This app plans only the healthy child
with no risk conditions, so it is recorded for completeness and not modeled.)

**Penmenvy does not appear on this page at all** — checked explicitly. See the note on the
authority pin below.

---

## ACIP: Pfizer pentavalent MenACWY-TT/MenB-FHbp (Penbraya)
URL: https://www.cdc.gov/mmwr/volumes/73/wr/mm7315a4.htm
MMWR **2024;73(15)**, published **18 April 2024**.

> licensed for use among persons aged 10–25 years

> MenACWY-TT/MenB-FHbp may be used when both MenACWY and MenB are indicated at the same
> visit

> complete the MenB series with a dose of MenB-FHbp 6 months after the pentavalent vaccine
> dose

---

## ACIP: GSK pentavalent MenACWY-CRM/MenB-4C (Penmenvy)
URL: https://www.cdc.gov/mmwr/volumes/75/wr/mm7501a2.htm
MMWR **2026;75(1)**, published **8 January 2026**. The ACIP vote it reports:

> On April 16, 2025, ACIP recommended that MenACWY-CRM/MenB-4C may be used when both

> licensed for use in persons aged 10–25 years

> MenACWY-CRM/MenB-4C may be used when both MenACWY and MenB are indicated at the same
> visit

> should complete the MenB series with a dose of MenB-4C administered 6 months after the
> MenACWY-CRM/MenB-4C dose

---

## Why Penmenvy is in, despite the mid-2025 authority pin

The app is pinned to guidance as it stood before the federal changes that began mid-2025
(docs/decisions.md). Penmenvy's MMWR write-up published 8 January 2026, which is after
that line — but the **ACIP action it reports is 16 April 2025**, before the 9 June 2025
committee replacement that the pin exists to exclude. The publication lag is editorial,
not a change of recommendation.

The pin's second half also carries it: AAP is the forward source and governs where AAP and
CDC disagree. AAP's 2026 schedule adds Penmenvy to the MenABCWY recommendation alongside
Penbraya, and states that where Penmenvy is used for MenB dose 1, Bexsero completes the
series. (AAP's own pages at publications.aap.org return HTTP 403 to an automated fetch,
so this is recorded from a search summary of them, **not** as a quoted live read — the
Penmenvy rules this app actually implements all rest on the ACIP/MMWR quotes above, which
were read live. If a quotable AAP read becomes possible, add it here.)

CDC's 2025 notes page being silent on Penmenvy is a publication lag, not a disagreement,
and the authority rule treats silence as silence: "where AAP is silent on a specific
mechanic, CDC/MMWR stands" — and here CDC/MMWR speaks.
