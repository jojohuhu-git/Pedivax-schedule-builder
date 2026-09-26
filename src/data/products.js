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
];
