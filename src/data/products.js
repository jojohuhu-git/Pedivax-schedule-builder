// One entry per product. `covers[].doses` is the dose-number licence and the
// field everything else depends on — see docs/data-design.md. Products are
// retired, never deleted (`retired: 'YYYY-MM-DD'`), so old printed plans stay
// explainable.
//
// Two ages per product: `minAgeDays`/`maxAgeDays` are the CDC/ACIP/AAP-
// governed floor and ceiling cover.js actually enforces; `insertMinAgeDays`/
// `insertMaxAgeDays` are the package-insert values, recorded so the rulebook
// can show a gap when one exists (CLAUDE.md — the insert is often older/
// narrower and never overrides an organization rule). Rotavirus is the first
// case where the insert is narrower on the *ceiling*, not the floor: both
// brands' inserts want the series finished earlier than CDC/ACIP requires.
// data-design.md's sketch didn't spell these fields out; they're added here
// to satisfy that rule explicitly rather than burying the insert age inside
// a fact nobody can compare programmatically.
//
// Built one vaccine group at a time (owner's choice, 2026-09-25). Hepatitis B
// and Rotavirus are verified so far. Combination products that carry more
// than one of these antigens (Pediarix, Vaxelis carry HepB; none so far carry
// RV) are added once every antigen they cover has its own group verified.
export const PRODUCTS = [
  {
    name: 'Engerix-B',
    group: 'Hepatitis B',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepB', doses: [1, 3] }],
    minAgeDays: 0,
    maxAgeDays: null,
    insertMinAgeDays: 0,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed for infants and children birth through 19 years on a 0-, 1-, 6-month schedule.',
        source: 'insertEngerixB',
        verified: '2026-09-25',
        quote:
          'Primary immunization for infants ... children (birth through 10 years) ... ' +
          'consists of a series of 3 doses (0.5 mL each) given on a 0-, 1-, and 6-month schedule.',
      },
    ],
  },
  {
    name: 'Recombivax HB',
    group: 'Hepatitis B',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepB', doses: [1, 3] }],
    minAgeDays: 0,
    maxAgeDays: null,
    insertMinAgeDays: 0,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim: 'Licensed birth through 19 years on a 0-, 1-, 6-month schedule.',
        source: 'insertRecombivaxHB',
        verified: '2026-09-25',
        quote: 'A series of 3 doses (0.5 mL each) given on a 0-, 1-, and 6-month schedule.',
      },
    ],
  },
  {
    name: 'Rotarix',
    group: 'Rotavirus',
    kind: 'single',
    route: 'oral',
    covers: [{ series: 'RV', doses: [1, 2] }],
    minAgeDays: 42,
    maxAgeDays: 244,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 168,
    lineage: null,
    setsSeriesLength: { RV: 2 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Insert schedule is dose 1 at 6 weeks, dose 2 at least 4 weeks later, series ' +
          'completed by 24 weeks — CDC/ACIP allows completion later, up to 8 months.',
        source: 'insertRotarix',
        verified: '2026-09-25',
        quote:
          'The first dose should be administered to infants beginning at 6 weeks of age. ' +
          'There should be an interval of at least 4 weeks between the first and second ' +
          'dose. The 2-dose series should be completed by 24 weeks of age.',
      },
    ],
  },
  {
    name: 'RotaTeq',
    group: 'Rotavirus',
    kind: 'single',
    route: 'oral',
    covers: [{ series: 'RV', doses: [1, 3] }],
    minAgeDays: 42,
    maxAgeDays: 244,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 224,
    lineage: null,
    setsSeriesLength: { RV: 3 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          "Insert schedule is 3 doses starting 6-12 weeks, 4-10 week intervals, dose 3 " +
          "not after 32 weeks — CDC/ACIP allows the final dose later, up to 8 months.",
        source: 'insertRotaTeq',
        verified: '2026-09-25',
        quote:
          'Administer orally as a series of 3 doses starting at 6 to 12 weeks of age, ' +
          'with the subsequent doses administered at 4 to 10 week intervals. The third ' +
          'dose should not be given after 32 weeks of age.',
      },
    ],
  },
  {
    name: 'ActHIB',
    group: 'Hib',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'Hib', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: null,
    lineage: null,
    setsSeriesLength: { Hib: 4 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          "This product's own insert puts the booster at 15-18 months; CDC/ACIP allows " +
          'it as early as 12 months and governs, so a 12-month booster is still valid.',
        source: 'insertActHIB',
        verified: '2026-09-25',
        quote:
          'A three-dose primary series administered at 2, 4, and 6 months of age. ' +
          'A single booster dose administered at 15-18 months of age.',
      },
    ],
  },
  {
    name: 'Hiberix',
    group: 'Hib',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'Hib', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: { Hib: 4 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 4 years for the full primary-plus-booster series ' +
          "(a stale web search claimed booster-only; the live insert does not say that). " +
          "This product's own insert puts the booster at 15-18 months; CDC/ACIP allows " +
          'it as early as 12 months and governs.',
        source: 'insertHiberix',
        verified: '2026-09-25',
        quote: 'HIBERIX is approved for use in children aged 6 weeks through 4 years (prior to fifth birthday).',
      },
    ],
  },
  {
    name: 'PedvaxHIB',
    group: 'Hib',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'Hib', doses: [1, 3] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: { Hib: 3 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          '2-dose primary series (2 and 4 months) plus a booster at 12-15 months, at ' +
          'least 2 months after dose 2 — matches CDC/ACIP exactly, no gap.',
        source: 'insertPedvaxHIB',
        verified: '2026-09-25',
        quote:
          'Infants 2 to 14 months of age should receive a 0.5 mL dose of vaccine ' +
          'ideally beginning at 2 months of age followed by a 0.5 mL dose 2 months ' +
          'later ... a booster dose (0.5 mL) should be administered at 12 to 15 ' +
          'months of age, but not earlier than 2 months after the second dose.',
      },
    ],
  },
  {
    name: 'Bexsero',
    group: 'Shared-decision products',
    sdm: true,
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenB', doses: [1, 2] }],
    minAgeDays: 3653, // 10 years, per insert; the SDM population this app plans for is 16-18
    maxAgeDays: 9131, // 25 years
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim: 'Licensed 10 through 25 years; 2-dose series at 0 and 6 months.',
        source: 'insertBexsero',
        verified: '2026-09-25',
        quote:
          'BEXSERO is approved for use in individuals aged 10 through 25 years. ... ' +
          'Administer a dose (0.5 mL) at 0 and 6 months.',
      },
    ],
  },
  {
    name: 'Trumenba',
    group: 'Shared-decision products',
    sdm: true,
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenB', doses: [1, 2] }],
    minAgeDays: 3653,
    maxAgeDays: 9131,
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim: 'Licensed 10 through 25 years; 2-dose series at 0 and 6 months.',
        source: 'insertTrumenba',
        verified: '2026-09-25',
        quote:
          'Trumenba is approved for use in individuals 10 through 25 years of age. ... ' +
          'Administer a dose (0.5 mL) at 0 and 6 months.',
      },
    ],
  },
  {
    name: 'Prevnar 20',
    group: 'Pneumococcal',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 17 years; 4-dose series at 2, 4, 6, 12-15 months — ' +
          'matches CDC/ACIP exactly, no gap.',
        source: 'insertPrevnar20',
        verified: '2026-09-25',
        quote:
          'Administer Prevnar 20 as a 4-dose series at 2, 4, 6, and 12 through 15 ' +
          'months of age (and at least 2 months after the third dose). The first dose ' +
          'may be given as early as 6 weeks of age.',
      },
    ],
  },
  {
    name: 'Vaxneuvance',
    group: 'Pneumococcal',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed from 6 weeks of age; 4-dose series at 2, 4, 6, 12-15 months — ' +
          'matches CDC/ACIP exactly, no gap.',
        source: 'insertVaxneuvance',
        verified: '2026-09-25',
        quote:
          'Administer VAXNEUVANCE as a 4-dose series at 2, 4, 6 and 12 through 15 ' +
          'months of age.',
      },
    ],
  },
  {
    name: 'Daptacel',
    group: 'DTaP',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'DTaP', doses: [1, 5] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 6 years (prior to 7th birthday); 5-dose series at ' +
          '2, 4, 6, 15-20 months, 4-6 years — insert window is a month wider than ' +
          'CDC/ACIP at dose 4, not narrower, so no gap.',
        source: 'insertDaptacel',
        verified: '2026-09-25',
        quote:
          'The five dose immunization series consists of a 0.5 mL dose administered ' +
          'intramuscularly at 2, 4, 6 and 15-20 months of age, and at 4-6 years of age.',
      },
    ],
  },
  {
    name: 'Infanrix',
    group: 'DTaP',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'DTaP', doses: [1, 5] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 6 years (prior to 7th birthday); 5-dose series at ' +
          '2, 4, 6, 15-20 months, 4-6 years — insert window is a month wider than ' +
          'CDC/ACIP at dose 4, not narrower, so no gap.',
        source: 'insertInfanrix',
        verified: '2026-09-25',
        quote:
          'One dose each at 2, 4, and 6 months of age. One booster dose at 15 to 20 ' +
          'months of age and another booster dose at 4 to 6 years of age.',
      },
    ],
  },
  {
    name: 'IPOL',
    group: 'IPV',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'IPV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed from 6 weeks of age; 4-dose series at 2, 4, 6-18 months, 4-6 ' +
          'years — matches CDC/ACIP exactly, no gap.',
        source: 'insertIPOL',
        verified: '2026-09-25',
        quote:
          'The primary series of IPOL vaccine consists of three 0.5 mL doses ' +
          'administered intramuscularly or subcutaneously, preferably eight or more ' +
          'weeks apart and usually at ages 2, 4, and 6 to 18 months.',
      },
    ],
  },
  {
    name: 'Prevnar 13',
    group: 'Pneumococcal',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    cannotBeBooster: [],
    retired: '2024-04-30',
    facts: [
      {
        claim:
          'No longer the routinely-used pneumococcal product — replaced by PCV15/PCV20. ' +
          'Kept here, not deleted, so an old saved plan can still be explained. Its own ' +
          'retirement date (30 April 2024) is commonly cited but rests on a document ' +
          "title and search summaries of a PDF that returns HTTP 403 both this session " +
          'and last — not a sentence read live. Recorded with a caveat rather than as a ' +
          'plain verified fact; re-fetch the letter directly before treating the date ' +
          'as settled.',
        source: 'cdc2025PcvNotes',
        verified: '2026-09-25',
        quote: 'minimum age: 6 weeks [PCV15], [PCV 20]; 2 years [PPSV23]',
      },
    ],
  },
];
