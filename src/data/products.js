// One entry per product. `covers[].doses` is the dose-number licence and the
// field everything else depends on — see docs/data-design.md. Products are
// retired, never deleted (`retired: 'YYYY-MM-DD'`), so old printed plans stay
// explainable.
//
// Two ages per product: `minAgeDays` is the CDC/ACIP/AAP-governed floor
// cover.js actually enforces; `insertMinAgeDays` is the package-insert floor,
// recorded so the rulebook can show a gap when one exists (CLAUDE.md — the
// insert is often older/narrower and never overrides an organization rule).
// This app's data-design.md sketch didn't spell out `insertMinAgeDays` as its
// own field; it is added here to satisfy that rule explicitly rather than
// burying the insert age inside a fact nobody can compare programmatically.
//
// Built one vaccine group at a time (owner's choice, 2026-09-25). Only the
// two monovalent Hepatitis B products are verified so far. Combination
// products that also carry HepB (Pediarix, Vaxelis) are added once DTaP/IPV/
// Hib are each verified — a combo entry needs every antigen it covers
// checked, not just the one whose group happens to be done.
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
];
