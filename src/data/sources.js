// Every citable source, with edition, date and a snapshot in
// docs/updates/sources/. See docs/data-design.md for the field shapes and
// CLAUDE.md for the authority rule (ACIP/CDC/AAP/immunize.org > FDA insert;
// AAP governs where AAP and CDC 2025 disagree; this app is pinned to
// guidance as it stood before the federal changes that began mid-2025 —
// docs/decisions.md, "Clinical authority — the edition this app is pinned to").
//
// `tier`: 'organization' (CDC/ACIP/AAP/immunize.org) or 'insert' (FDA package
// insert). sources.test.js enforces that no 'insert' fact narrows a rule an
// organization has already made — an insert may only fill a gap.
export const SOURCES = {
  cdc2025HepbNotes: {
    label: 'CDC Child Immunization Schedule Notes, 2025 — Hepatitis B',
    edition: 'last reviewed July 2, 2025',
    url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html',
    snapshot: '2026-09-25-cdc2025-hepb-notes.md',
    tier: 'organization',
  },
  cdc2025HepbIntervals: {
    label: 'CDC child/adolescent catch-up table — Hepatitis B minimum intervals',
    edition: '2025 schedule cycle',
    url: 'https://www.cdc.gov/vaccines/schedules/wcms-inc/child-schedule-table-catchup_TP4.html',
    snapshot: '2026-09-25-cdc2025-hepb-catchup-intervals.md',
    tier: 'organization',
  },
  brightFuturesPeriodicity: {
    label: 'Bright Futures/AAP Periodicity Schedule — well-child visit ages',
    edition: 'Bright Futures Pocket Guide appendices (accessed 2026-09-25)',
    url: 'https://www.brightfutures.org/pocket/pdf/appendices.pdf',
    snapshot: '2026-09-25-brightfutures-periodicity.md',
    tier: 'organization',
  },
  insertEngerixB: {
    label: 'Engerix-B package insert (DailyMed)',
    edition: 'label revision 3/2010 — unusually old, flagged to re-check',
    url: 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=4d930f24-4ddb-488d-9e79-3f495972733b&type=display',
    snapshot: '2026-09-25-hepb-inserts.md',
    tier: 'insert',
  },
  insertRecombivaxHB: {
    label: 'Recombivax HB package insert (DailyMed)',
    edition: 'label revision 6/2021',
    url: 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f1ad4bca-839d-41cd-a132-a6984780912e&type=display',
    snapshot: '2026-09-25-hepb-inserts.md',
    tier: 'insert',
  },
  cdc2025RvNotes: {
    label: 'CDC Child Immunization Schedule Notes, 2025 — Rotavirus',
    edition: 'last reviewed July 2, 2025',
    url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html',
    snapshot: '2026-09-25-rotavirus.md',
    tier: 'organization',
  },
  cdc2025RvIntervals: {
    label: 'CDC child/adolescent catch-up table — Rotavirus minimum/maximum ages',
    edition: '2025 schedule cycle',
    url: 'https://www.cdc.gov/vaccines/schedules/wcms-inc/child-schedule-table-catchup_TP4.html',
    snapshot: '2026-09-25-rotavirus.md',
    tier: 'organization',
  },
  insertRotarix: {
    label: 'Rotarix package insert (DailyMed)',
    edition: 'label revision 1/2024',
    url: 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=f3182470-1965-4e20-dbaf-e3506f893ea5&type=display',
    snapshot: '2026-09-25-rotavirus.md',
    tier: 'insert',
  },
  insertRotaTeq: {
    label: 'RotaTeq package insert (DailyMed)',
    edition: 'label revision 5/2026',
    url: 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=aaf3b24e-85fd-43ee-b657-2ee4df312ec3&type=display',
    snapshot: '2026-09-25-rotavirus.md',
    tier: 'insert',
  },
  cdc2025HibNotes: {
    label: 'CDC Child Immunization Schedule Notes, 2025 — Hib',
    edition: 'last reviewed July 2, 2025',
    url: 'https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-notes.html',
    snapshot: '2026-09-25-hib.md',
    tier: 'organization',
  },
  cdc2025HibIntervals: {
    label: 'CDC child/adolescent catch-up table — Hib minimum intervals',
    edition: '2025 schedule cycle',
    url: 'https://www.cdc.gov/vaccines/schedules/wcms-inc/child-schedule-table-catchup_TP4.html',
    snapshot: '2026-09-25-hib.md',
    tier: 'organization',
  },
  insertActHIB: {
    label: 'ActHIB package insert (DailyMed)',
    edition: 'label revision 5/2026',
    url: 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=8143d01c-4911-40db-95b2-47f3ebea2a7d&type=display',
    snapshot: '2026-09-25-hib.md',
    tier: 'insert',
  },
  insertHiberix: {
    label: 'Hiberix package insert (DailyMed)',
    edition: 'label revision January 21, 2025',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=745ff8df-1618-4b76-9aa1-6f42752c0dda',
    snapshot: '2026-09-25-hib.md',
    tier: 'insert',
  },
  insertPedvaxHIB: {
    label: 'PedvaxHIB package insert (DailyMed)',
    edition: 'label revision April 2023',
    url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9dff46c6-4b15-4d10-aca6-d5ef3735a530',
    snapshot: '2026-09-25-hib.md',
    tier: 'insert',
  },
};
