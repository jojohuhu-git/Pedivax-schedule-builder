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
    group: 'HepB',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepB', doses: [1, 3] }],
    minAgeDays: 0,
    maxAgeDays: null,
    insertMinAgeDays: 0,
    lineage: null,
    setsSeriesLength: { HepB: 3 },
    restrictions: [],
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
    group: 'HepB',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepB', doses: [1, 3] }],
    minAgeDays: 0,
    maxAgeDays: null,
    insertMinAgeDays: 0,
    lineage: null,
    setsSeriesLength: { HepB: 3 },
    restrictions: [],
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
    group: 'RV',
    kind: 'single',
    route: 'oral',
    covers: [{ series: 'RV', doses: [1, 2] }],
    minAgeDays: 42,
    maxAgeDays: 244,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 168,
    lineage: null,
    setsSeriesLength: { RV: 2 },
    restrictions: [],
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
    group: 'RV',
    kind: 'single',
    route: 'oral',
    covers: [{ series: 'RV', doses: [1, 3] }],
    minAgeDays: 42,
    maxAgeDays: 244,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 224,
    lineage: null,
    setsSeriesLength: { RV: 3 },
    restrictions: [],
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
    restrictions: [],
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
    restrictions: [],
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
    // Doses [1,4], not [1,3]: PedvaxHIB is a monovalent Hib product (not a
    // DTaP-IPV-Hib-HepB combo), so per immunize.org it is an acceptable
    // booster too. Without dose 4 covered here, a mixed PedvaxHIB+Vaxelis
    // formulary had no product left to fill the 4-dose path's booster slot
    // and silently fell back to an all-PedvaxHIB 3-dose plan while Vaxelis's
    // own Hib content rode along uncounted (handoff-2026-09-28, Finding 1).
    covers: [{ series: 'Hib', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: { Hib: 3 },
    restrictions: [],
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
    group: 'MenB',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenB', doses: [1, 2] }],
    minAgeDays: 3653, // 10 years, per insert; the SDM population this app plans for is 16-18
    maxAgeDays: 9131, // 25 years
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    restrictions: [],
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
    group: 'MenB',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenB', doses: [1, 2] }],
    minAgeDays: 3653,
    maxAgeDays: 9131,
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    restrictions: [],
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
    commonName: 'PCV20',
    group: 'PCV',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
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
    commonName: 'PCV15',
    group: 'PCV',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
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
    restrictions: [],
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
    restrictions: [],
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
    // Plain IPV, licensed for any dose of the polio series — including the
    // 5th, which exists only on the combination path (series.js, IPV
    // `combination` variant). `setsSeriesLength` keeps IPOL's own checklist
    // line honest at "4 doses": an all-IPOL clinic runs the standard 4-dose
    // series, and the wider covers[] span only means IPOL may also finish a
    // series that a combination product made longer.
    covers: [{ series: 'IPV', doses: [1, 5] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: { IPV: 4 },
    restrictions: [],
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
      {
        claim:
          'Plain IPV carries no dose-number restriction of its own, so IPOL can ' +
          'give the dose after the 4th birthday whether that dose is the 4th or ' +
          '(after a polio-containing combination at 15-18 months) the 5th.',
        source: 'cdc2025IpvNotes',
        verified: '2026-09-28',
        quote:
          '4 or more doses of IPV can be administered before age 4 years when a ' +
          'combination vaccine containing IPV is used. However, a dose is still ' +
          'recommended on or after age 4 years and at least 6 months after the ' +
          'previous dose.',
      },
    ],
  },
  {
    name: 'M-M-R II',
    group: 'MMR',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MMR', doses: [1, 2] }],
    minAgeDays: 365,
    maxAgeDays: null,
    insertMinAgeDays: 365,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months and older; 2-dose series at 12-15 months and 4-6 ' +
          'years — matches CDC/ACIP exactly, no gap.',
        source: 'insertMMRII',
        verified: '2026-09-25',
        quote:
          'The first dose is administered at 12 to 15 months of age. A second dose ' +
          'is administered at 4 to 6 years of age.',
      },
    ],
  },
  {
    name: 'Priorix',
    group: 'MMR',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MMR', doses: [1, 2] }],
    minAgeDays: 365,
    maxAgeDays: null,
    insertMinAgeDays: 365,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months and older; 2-dose series at 12-15 months and 4-6 ' +
          'years — matches CDC/ACIP exactly, no gap.',
        source: 'insertPriorix',
        verified: '2026-09-25',
        quote: 'First dose – 12 through 15 months of age. Second dose – 4 through 6 years of age.',
      },
    ],
  },
  {
    name: 'Varivax',
    group: 'VAR',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'VAR', doses: [1, 2] }],
    minAgeDays: 365,
    maxAgeDays: null,
    insertMinAgeDays: 365,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months and older; 2-dose series at 12-15 months and 4-6 ' +
          'years — matches CDC/ACIP exactly, no gap.',
        source: 'insertVarivax',
        verified: '2026-09-25',
        quote:
          'The first dose is administered at 12 to 15 months of age. The second ' +
          'dose is administered at 4 to 6 years of age. There should be a minimum ' +
          'interval of 3 months between doses.',
      },
    ],
  },
  {
    name: 'ProQuad',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    // Checklist sub-grouping (Batch C / C3, queue's own copy) — which visits
    // this product serves, and its rank within that visit's list (most
    // antigens first; a manual field rather than a UI-derived sort, since
    // the tie-break between Pentacel and Pediarix below isn't "more
    // antigens," it's "more DTaP doses covered").
    comboVisitGroup: 'toddler',
    comboRank: 1,
    comboLabel: 'MMR + chickenpox',
    covers: [
      { series: 'MMR', doses: [1, 2] },
      { series: 'VAR', doses: [1, 2] },
    ],
    minAgeDays: 365,
    maxAgeDays: 4383,
    insertMinAgeDays: 365,
    insertMaxAgeDays: 4383,
    lineage: null,
    setsSeriesLength: null,
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months through 12 years; covers doses 1-2 of both MMR and ' +
          'Varicella, at the same 12-15 month / 4-6 year visits either series uses ' +
          'alone.',
        source: 'insertProQuad',
        verified: '2026-09-25',
        quote:
          'ProQuad is a vaccine indicated for active immunization for the ' +
          'prevention of measles, mumps, rubella, and varicella in children 12 ' +
          'months through 12 years of age. The first dose is administered at 12 ' +
          'to 15 months of age. The second dose is administered at 4 to 6 years of ' +
          'age.',
      },
      {
        claim:
          'CDC prefers separate MMR/varicella products at dose 1 because ProQuad ' +
          'roughly doubles the rate of fever/febrile seizure 5-12 days after a ' +
          "first dose in previously-unvaccinated 12-23-month-olds, versus M-M-R II " +
          'and Varivax given separately (0.70 vs. 0.32 per 1000 children) — the ' +
          "insert's own safety data, not a narrower insert overriding CDC/AAP.",
        source: 'insertProQuad',
        verified: '2026-09-25',
        quote:
          'The incidence of febrile seizures 5 to 12 days after ProQuad (dose 1) ' +
          '(0.70 per 1000 children) was higher than that in children receiving ' +
          'M-M-R II and VARIVAX concomitantly (0.32 per 1000 children).',
      },
      {
        claim:
          'AAP prefers ProQuad at dose 2 (4-6 years) to save an injection, where ' +
          'CDC 2025 is silent — this is the pairing this app recommends at that visit.',
        source: 'aapChildSchedule2026',
        verified: '2026-09-24',
        quote:
          'For the 2nd dose at 4–6 years, MMRV generally is preferred over MMR ' +
          'plus monovalent varicella to minimize the number of injections.',
      },
    ],
  },
  {
    name: 'Havrix',
    group: 'HepA',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepA', doses: [1, 2] }],
    minAgeDays: 365,
    maxAgeDays: null,
    insertMinAgeDays: 365,
    insertMaxAgeDays: null,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months through 18 years; primary dose plus booster 6-12 ' +
          "months later — CDC/ACIP sets no ceiling on the interval, so the insert's " +
          'own 12-month ceiling is not a gap.',
        source: 'insertHavrix',
        verified: '2026-09-25',
        quote:
          'A single 0.5-mL dose and a 0.5-mL booster dose administered between 6 to ' +
          '12 months later.',
      },
    ],
  },
  {
    name: 'Vaqta',
    group: 'HepA',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HepA', doses: [1, 2] }],
    minAgeDays: 365,
    maxAgeDays: null,
    insertMinAgeDays: 365,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 12 months and older; primary dose plus booster 6-18 months ' +
          'later — matches CDC/ACIP exactly, no gap.',
        source: 'insertVaqta',
        verified: '2026-09-25',
        quote:
          'Children/Adolescents: vaccination consists of a 0.5-mL primary dose ' +
          'administered intramuscularly, and a 0.5-mL booster dose administered ' +
          'intramuscularly 6 to 18 months later.',
      },
    ],
  },
  {
    name: 'Adacel',
    group: 'Tdap',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'Tdap', doses: [1, 1] }],
    minAgeDays: 3653,
    maxAgeDays: null,
    insertMinAgeDays: 3653,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 10 through 64 years — a year wider than CDC/ACIP\'s 11-year ' +
          'routine age, not narrower, so no gap.',
        source: 'insertAdacel',
        verified: '2026-09-25',
        quote: 'Adacel is approved for use in persons 10 through 64 years of age.',
      },
    ],
  },
  {
    name: 'Boostrix',
    group: 'Tdap',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'Tdap', doses: [1, 1] }],
    minAgeDays: 3653,
    maxAgeDays: null,
    insertMinAgeDays: 3653,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          "Licensed from 10 years of age — a year wider than CDC/ACIP's 11-year " +
          'routine age, not narrower, so no gap.',
        source: 'insertBoostrix',
        verified: '2026-09-25',
        quote:
          'Active booster immunization against tetanus, diphtheria, and pertussis ' +
          'in individuals aged 10 years and older.',
      },
    ],
  },
  {
    name: 'Gardasil 9',
    group: 'HPV',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'HPV', doses: [1, 2] }],
    minAgeDays: 3287,
    maxAgeDays: null,
    insertMinAgeDays: 3287,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 9 through 45 years, both sexes; 2-dose schedule at 0, 6-12 ' +
          'months for the 9-14-year band — matches CDC/ACIP exactly, no gap. The ' +
          'only currently-marketed HPV product (Gardasil-quadrivalent and Cervarix ' +
          'are both discontinued in the US).',
        source: 'insertGardasil9',
        verified: '2026-09-25',
        quote:
          '0, 6 to 12 months. If the second dose is administered earlier than 5 ' +
          'months after the first dose, administer a third dose at least 4 months ' +
          'after the second dose.',
      },
    ],
  },
  {
    name: 'Menveo',
    group: 'MenACWY',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenACWY', doses: [1, 2] }],
    minAgeDays: 61,
    maxAgeDays: 20089,
    insertMinAgeDays: 61,
    insertMaxAgeDays: 20089,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 2 months through 55 years; single dose covers either the 11-12 ' +
          'year primary or the 16-year booster — matches CDC/ACIP\'s routine ' +
          'schedule (the insert\'s own booster language is framed around ' +
          '"continued risk," reflecting its original trials, not ACIP\'s later ' +
          'routine-for-everyone policy; the age window still covers it).',
        source: 'insertMenveo',
        verified: '2026-09-25',
        quote:
          'MENVEO is a vaccine indicated for active immunization ... in ' +
          'individuals 2 months through 55 years of age.',
      },
    ],
  },
  {
    name: 'MenQuadfi',
    group: 'MenACWY',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'MenACWY', doses: [1, 2] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed from 6 weeks of age (matches AAP, not CDC 2025\'s 2-year ' +
          'figure — see the MenACWY series facts). A single dose covers either the ' +
          '11-12 year primary or the 16-year booster.',
        source: 'insertMenQuadfi',
        verified: '2026-09-25',
        quote: 'MenQuadfi is approved for use in individuals 6 weeks of age and older.',
      },
    ],
  },
  {
    name: 'Pediarix',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    // HepB is [2,4], not [1,3] like DTaP/IPV — corrected 2026-09-26. Pediarix
    // starts at 2 months (minAgeDays below), so it can never give the HepB
    // birth dose (dose 1, monovalent, within 24 hours per ACIP). Given after
    // a separate birth dose, its three administrations are HepB doses 2, 3,
    // and 4 of a 4-dose series — see the correction fact below.
    comboVisitGroup: 'infant',
    comboRank: 3,
    comboLabel: 'DTaP + hep B + polio (doses 1–3)',
    covers: [
      { series: 'DTaP', doses: [1, 3] },
      { series: 'HepB', doses: [2, 4] },
      { series: 'IPV', doses: [1, 3] },
    ],
    minAgeDays: 42,
    maxAgeDays: 2192,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 2192,
    lineage: null,
    setsSeriesLength: { HepB: 4 },
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 6 years (prior to 7th birthday); three doses, ' +
          'all at 2, 4, 6 months.',
        source: 'insertPediarix',
        verified: '2026-09-25',
        quote:
          'PEDIARIX may be given as early as 6 weeks of age through 6 years of age ' +
          '(prior to the seventh birthday). Three doses (0.5 mL each) administered ' +
          'at 2, 4, and 6 months of age.',
      },
      {
        claim: 'Licensed for only the first 3 doses of the DTaP series.',
        source: 'izPediarix',
        verified: '2026-09-25',
        quote:
          'Pediarix is licensed by the Food and Drug Administration (FDA) for only ' +
          'the first 3 doses of the DTaP series.',
      },
      {
        claim:
          'For HepB specifically, Pediarix cannot be the birth dose (it starts at 6 ' +
          "weeks; the birth dose is due within 24 hours). Given after a separate " +
          "monovalent birth dose — the only way this app's on-time plan uses it — " +
          "its 3 administrations are HepB doses 2, 3, and 4 of a 4-dose series, not " +
          "1-3. Found and corrected 2026-09-26: the covers[] entry had copied DTaP/" +
          "IPV's [1,3] pattern onto HepB without checking that HepB's own dose 1 is " +
          'the birth dose specifically.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-26',
        quote:
          'Administration of 4 doses is permitted when a combination vaccine ' +
          'containing HepB is used after the birth dose.',
      },
    ],
  },
  {
    name: 'Pentacel',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    comboVisitGroup: 'infant',
    comboRank: 2,
    comboLabel: 'DTaP + polio + Hib (DTaP doses 1–4)',
    covers: [
      { series: 'DTaP', doses: [1, 4] },
      { series: 'IPV', doses: [1, 4] },
      { series: 'Hib', doses: [1, 4] },
    ],
    minAgeDays: 42,
    maxAgeDays: 1461,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 1461,
    lineage: null,
    setsSeriesLength: { Hib: 4 },
    // Item C, 2026-09-29: "not the 4-6 year DTaP/IPV booster" below, wired
    // as a real restriction instead of a sentence nobody enforced. It is
    // deliberately NOT unconditional like Vaxelis's — Pentacel's own dose 4
    // IS the correct 12-15-month DTaP/Hib/IPV booster, so the age floor
    // (1,461 days = 4 years, the same threshold DTaP dose 5 and IPV's own
    // 4-6-year dose already use) is what tells the two apart. Hib carries no
    // matching entry: Hib has no 4-6-year booster for anything to restrict.
    // The other half of the same fact below — "not for any primary-series
    // dose at age 5+" — is already covered by this product's own
    // `maxAgeDays: 1461` (tighter than the 1,826-day/5-year floor the fact
    // names), checked by restrictions.test.js's prose test so it can't
    // silently stop being true.
    allAntigensMustBeDue: true,
    restrictions: [
      { series: 'DTaP', rule: 'not-booster', minAgeDays: 1461, source: 'izPentacel' },
      { series: 'IPV', rule: 'not-booster', minAgeDays: 1461, source: 'izPentacel' },
    ],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 4 years (prior to 5th birthday); covers doses 1-4 ' +
          'of DTaP, IPV, and Hib, at 2, 4, 6, 15-18 months. Sets the Hib series to 4 ' +
          'doses, same path as ActHIB/Hiberix.',
        source: 'insertPentacel',
        verified: '2026-09-25',
        quote:
          'Pentacel is approved for use as a four dose series in children 6 weeks ' +
          'through 4 years of age (prior to fifth birthday). Pentacel is to be ' +
          'administered as a 4-dose series at 2, 4, 6 and 15-18 months of age.',
      },
      {
        claim:
          'Not for use as any primary-series dose at age 5+ (already covered by this ' +
          "product's own maxAgeDays), and not the 4-6 year DTaP/IPV booster (wired " +
          "above as this product's `restrictions`) — that role belongs to " +
          'Kinrix/Quadracel.',
        source: 'izPentacel',
        verified: '2026-09-25',
        quote:
          'should not be used for any dose in the primary series for children age 5 ' +
          'years or older or as the booster dose for children ages 4 through 6 years.',
      },
    ],
  },
  {
    name: 'Vaxelis',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    // HepB is [2,4], not [1,3] — same correction and reasoning as Pediarix
    // (2026-09-26): Vaxelis starts at 6 weeks, so it can never be the HepB
    // birth dose; given after a separate birth dose its 3 administrations
    // are HepB doses 2, 3, and 4. See the correction fact below.
    comboVisitGroup: 'infant',
    comboRank: 1,
    comboLabel: 'DTaP + polio + Hib + hep B (doses 1–3)',
    covers: [
      { series: 'DTaP', doses: [1, 3] },
      { series: 'IPV', doses: [1, 3] },
      { series: 'Hib', doses: [1, 3] },
      { series: 'HepB', doses: [2, 4] },
    ],
    minAgeDays: 42,
    maxAgeDays: 1461,
    insertMinAgeDays: 42,
    insertMaxAgeDays: 1461,
    lineage: null,
    setsSeriesLength: { Hib: 4, HepB: 4 },
    // Item C, 2026-09-29: for DTaP and IPV, Vaxelis's own dose-number licence
    // ([1,3]) already excludes their booster doses (both are dose 4+), so
    // these two entries mostly document the restriction for the rulebook —
    // but for Hib, Vaxelis's licence ([1,3]) reaches all the way to the
    // pedvax-variant booster (dose 3), so this IS the only thing standing
    // between a stocked Vaxelis and an illegal Hib booster. See
    // restrictions.test.js's reason-code test, which proves each entry
    // fires for the reason named here, not a numeric coincidence.
    allAntigensMustBeDue: true,
    restrictions: [
      { series: 'DTaP', rule: 'not-booster', minAgeDays: null, source: 'izVaxelis' },
      { series: 'IPV', rule: 'not-booster', minAgeDays: null, source: 'izVaxelis' },
      { series: 'Hib', rule: 'not-booster', minAgeDays: null, source: 'izVaxelis' },
    ],
    retired: null,
    facts: [
      {
        claim:
          'Licensed 6 weeks through 4 years; 3-dose series at 2, 4, 6 months covering ' +
          'DTaP, IPV, Hib, and HepB. Sets the Hib series to 4 doses, same path as ' +
          'Pentacel/ActHIB/Hiberix.',
        source: 'insertVaxelis',
        verified: '2026-09-25',
        quote:
          'VAXELIS is approved for use as a 3-dose series in children from 6 weeks ' +
          'through 4 years of age. VAXELIS is to be administered as a 3-dose series ' +
          'at 2, 4, and 6 months of age.',
      },
      {
        claim:
          'Not approved as the booster dose of DTaP, IPV, or Hib — broader than the ' +
          'Hib-only restriction the frozen mockup assumed; corrected here to all ' +
          'three. For DTaP and IPV the dose-number licence above already excludes ' +
          'dose 4/5, so this mostly documents the restriction for the rulebook — but ' +
          "for Hib the licence's own dose 3 reaches the pedvax-variant booster, so " +
          'this restriction is the only thing blocking it (item C, 2026-09-29).',
        source: 'izVaxelis',
        verified: '2026-09-25',
        quote: 'It is not approved as the booster dose of DTaP [dose 4 or 5] or IPV [dose 4] or Hib [dose 4].',
      },
      {
        claim:
          'For HepB specifically, Vaxelis cannot be the birth dose (it starts at 6 ' +
          "weeks; the birth dose is due within 24 hours). Given after a separate " +
          "monovalent birth dose — the only way this app's on-time plan uses it — " +
          "its 3 administrations are HepB doses 2, 3, and 4 of a 4-dose series, not " +
          '1-3. Same correction as Pediarix, found 2026-09-26.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-26',
        quote:
          'Administration of 4 doses is permitted when a combination vaccine ' +
          'containing HepB is used after the birth dose.',
      },
    ],
  },
  {
    name: 'Kinrix',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    comboVisitGroup: 'booster',
    comboRank: 1,
    comboLabel: 'final DTaP + polio',
    covers: [
      { series: 'DTaP', doses: [5, 5] },
      { series: 'IPV', doses: [4, 4] },
    ],
    minAgeDays: 1461,
    maxAgeDays: 2557,
    insertMinAgeDays: 1461,
    insertMaxAgeDays: 2557,
    lineage: {
      prefer: ['Infanrix', 'Pediarix'],
      escape:
        'Either Kinrix or Quadracel may be used when the earlier brand is unknown, ' +
        'or when Kinrix or Quadracel is the only product stocked.',
    },
    setsSeriesLength: null,
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Approved as the 5th DTaP dose and 4th IPV dose, ages 4-6 years, for ' +
          'children who received Infanrix (first 3 DTaP) and/or Pediarix, then ' +
          'Infanrix as dose 4.',
        source: 'izDtapIpv',
        verified: '2026-09-25',
        quote:
          'Kinrix: approved for use as the fifth dose of DTaP and the fourth dose ' +
          'of IPV in children ages 4 through 6 years who received DTaP (Infanrix) ' +
          "and/or DTaP-HepB-IPV (Pediarix) as the first three doses and DTaP " +
          '(Infanrix) as the fourth dose.',
      },
      {
        claim: 'The brand-lineage match is a preference, not a bar.',
        source: 'izDtapIpv',
        verified: '2026-09-25',
        quote:
          "Although it is preferable to use the same manufacturer's DTaP vaccine " +
          'for all of the doses in the series, you can give either Kinrix or ' +
          'Quadracel as the fifth dose of DTaP and fourth dose of IPV at age 4 ' +
          'through 6 years if the previous brand is unknown or if Kinrix or ' +
          'Quadracel is the only product stocked.',
      },
    ],
  },
  {
    name: 'Quadracel',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    comboVisitGroup: 'booster',
    comboRank: 2,
    comboLabel: 'final DTaP + polio',
    covers: [
      { series: 'DTaP', doses: [5, 5] },
      { series: 'IPV', doses: [4, 5] },
    ],
    minAgeDays: 1461,
    maxAgeDays: 2557,
    insertMinAgeDays: 1461,
    insertMaxAgeDays: 2557,
    lineage: {
      prefer: ['Daptacel', 'Pentacel'],
      escape:
        'Either Kinrix or Quadracel may be used when the earlier brand is unknown, ' +
        'or when Kinrix or Quadracel is the only product stocked.',
    },
    setsSeriesLength: null,
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'Approved (2015) as the 5th DTaP dose and 4th-or-5th IPV dose, ages 4-6 ' +
          'years, for children who received Pentacel and/or Daptacel.',
        source: 'izDtapIpv',
        verified: '2026-09-25',
        quote:
          'Quadracel: approved by the FDA in 2015 for use in children 4 through 6 ' +
          'years of age ... for use in children who have received 4 doses of ' +
          'Pentacel (DTaP-IPV-Hib, Sanofi) and/or Daptacel (DTaP, Sanofi) vaccine ' +
          '... approved ... as the fourth or fifth dose in the IPV series.',
      },
      {
        claim: 'The brand-lineage match is a preference, not a bar.',
        source: 'izDtapIpv',
        verified: '2026-09-25',
        quote:
          "Although it is preferable to use the same manufacturer's DTaP vaccine " +
          'for all of the doses in the series, you can give either Kinrix or ' +
          'Quadracel as the fifth dose of DTaP and fourth dose of IPV at age 4 ' +
          'through 6 years if the previous brand is unknown or if Kinrix or ' +
          'Quadracel is the only product stocked.',
      },
    ],
  },
  // ── The pentavalent MenABCWY products (item E, 2026-09-29) ─────────────
  //
  // One injection that is simultaneously a MenACWY dose and a MenB dose.
  // The whole reason they earn a place here: without one, a clinic's
  // 16-year visit costs two shots (a plain MenACWY plus a plain MenB) for
  // two doses that are always due on the same day.
  //
  // The rule the owner asked to be unbreakable (2026-09-28, and CDC's own
  // words): a pentavalent may be used ONLY when MenACWY and MenB are both
  // due that clinic day. Nothing special implements that. It falls out of
  // the whole-syringe gate item B built — `allAntigensMustBeDue` below,
  // enforced in cover.js's deliverableAt — which already refuses any
  // product one of whose antigens has no dose due at the visit. In
  // MeningoVax the same rule is written out longhand in recommend.js with
  // a second copy in the validator, and it kept drifting apart; here there
  // is no second copy to drift from.
  //
  // MenB is covered for dose 1 ONLY. CDC states it positively — after a
  // pentavalent dose 1, the matching plain brand gives dose 2 — so the
  // dose-number licence IS the rule here, not a coincidence standing in
  // for one (contrast Pentacel, whose real restriction needed its own
  // `restrictions[]` entry because its dose-number licence said nothing
  // about the 4-year visit). A clinic that stocks a pentavalent but not
  // its matching plain brand therefore gets an honest gap at 17 years
  // naming what to add, never a second pentavalent dose.
  //
  // The two are NOT interchangeable with each other: Penbraya's MenB half
  // is FHbp (Trumenba's family), Penmenvy's is 4C (Bexsero's). That is
  // expressed in series.js's MenB variants, which name the whole family
  // rather than the single plain brand they used to.
  {
    name: 'Penbraya',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    comboVisitGroup: 'adolescent',
    comboRank: 1,
    comboLabel: 'MenACWY + MenB (Trumenba family)',
    covers: [
      { series: 'MenACWY', doses: [1, 2] },
      { series: 'MenB', doses: [1, 1] },
    ],
    minAgeDays: 3653, // 10 years
    maxAgeDays: 9131, // 25 years, same ceiling as Bexsero/Trumenba
    // Recorded from the MMWR's own statement of the FDA licence rather
    // than a DailyMed fetch, so there is no gap to show; sources.js says
    // why there is no separate insert source.
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'May be given only when a MenACWY dose and a MenB dose are both due on the ' +
          'same clinic day, from age 10 years. This is the whole condition of use, and ' +
          'the app enforces it in one place (cover.js) rather than re-deriving it per ' +
          'screen.',
        source: 'cdc2025PentavalentNotes',
        verified: '2026-09-29',
        quote:
          'Children age 10 years or older may receive a single dose of Penbraya as an ' +
          'alternative to separate administration of MenACWY and MenB when both ' +
          'vaccines would be given on the same clinic day',
      },
      {
        claim:
          'Gives MenB dose 1 only. Dose 2 must be Trumenba (MenB-FHbp) — the same ' +
          "family as Penbraya's own MenB component. A clinic stocking Penbraya without " +
          'Trumenba sees a gap at 17 years naming it, not a second Penbraya dose.',
        source: 'cdc2025PentavalentNotes',
        verified: '2026-09-29',
        quote:
          'For age-eligible children not at increased risk, if Penbraya is used for ' +
          'dose 1 MenB, MenB-FHbp (Trumenba) should be administered for dose 2 MenB.',
      },
      {
        claim: 'Licensed 10 through 25 years.',
        source: 'acipPenbraya2024',
        verified: '2026-09-29',
        quote: 'licensed for use among persons aged 10–25 years',
      },
      {
        claim:
          'ACIP states the same both-due condition in its own words, and the 6-month ' +
          'spacing to the second MenB dose — which this app’s fixed well-child ' +
          'calendar already satisfies (16 years to 17 years).',
        source: 'acipPenbraya2024',
        verified: '2026-09-29',
        quote:
          'MenACWY-TT/MenB-FHbp may be used when both MenACWY and MenB are indicated ' +
          'at the same visit',
      },
    ],
  },
  {
    name: 'Penmenvy',
    group: 'Combination products',
    kind: 'combination',
    route: 'injection',
    comboVisitGroup: 'adolescent',
    comboRank: 2,
    comboLabel: 'MenACWY + MenB (Bexsero family)',
    covers: [
      { series: 'MenACWY', doses: [1, 2] },
      { series: 'MenB', doses: [1, 1] },
    ],
    minAgeDays: 3653,
    maxAgeDays: 9131,
    insertMinAgeDays: 3653,
    insertMaxAgeDays: 9131,
    lineage: null,
    setsSeriesLength: { MenB: 2 },
    allAntigensMustBeDue: true,
    restrictions: [],
    retired: null,
    facts: [
      {
        claim:
          'May be given only when a MenACWY dose and a MenB dose are both due at the ' +
          'same visit, from age 10 years — the same condition as Penbraya.',
        source: 'acipPenmenvy2025',
        verified: '2026-09-29',
        quote:
          'MenACWY-CRM/MenB-4C may be used when both MenACWY and MenB are indicated ' +
          'at the same visit',
      },
      {
        claim:
          'Gives MenB dose 1 only. Dose 2 must be Bexsero (MenB-4C) — the same ' +
          "family as Penmenvy's own MenB component — six months later, which the " +
          '16-to-17-year gap in this app’s calendar satisfies.',
        source: 'acipPenmenvy2025',
        verified: '2026-09-29',
        quote:
          'should complete the MenB series with a dose of MenB-4C administered 6 ' +
          'months after the MenACWY-CRM/MenB-4C dose',
      },
      {
        claim:
          'Licensed 10 through 25 years. ACIP recommended it on 16 April 2025 — ' +
          "before this app's mid-2025 authority cutoff (docs/decisions.md); only the " +
          'MMWR write-up is later, and the CDC 2025 schedule notes page, last reviewed ' +
          '2 July 2025, does not mention Penmenvy at all. That silence is a ' +
          'publication lag, not a disagreement: AAP’s 2026 schedule carries ' +
          'Penmenvy alongside Penbraya. See the snapshot for the full reasoning.',
        source: 'acipPenmenvy2025',
        verified: '2026-09-29',
        quote: 'licensed for use in persons aged 10–25 years',
      },
    ],
  },
  {
    name: 'Prevnar 13',
    commonName: 'PCV13',
    group: 'PCV',
    kind: 'single',
    route: 'injection',
    covers: [{ series: 'PCV', doses: [1, 4] }],
    minAgeDays: 42,
    maxAgeDays: null,
    insertMinAgeDays: 42,
    lineage: null,
    setsSeriesLength: null,
    restrictions: [],
    retired: '2024-04-30',
    facts: [
      {
        claim:
          'No longer the routinely-used pneumococcal product — replaced by PCV15/PCV20. ' +
          'Kept here, not deleted, so an old saved plan can still be explained. Its own ' +
          'retirement date (30 April 2024) is commonly cited but rests on a document ' +
          "title and search summaries of a PDF that returns HTTP 403 across three " +
          'sessions now (WebFetch, curl, and a real browser all hit an active bot-' +
          'verification wall, not a dead link) — not a sentence read live. Pfizer\'s own ' +
          'Prevnar 20 marketing page (adult.prevnar20.com/whyprevnar20, fetched live ' +
          '2026-09-26) independently states "Prevnar 13 was available for adults from ' +
          '2012 to 2024" — corroborates the year, but gives no day-level date and is a ' +
          'marketing page, not an organization or insert source. The specific day (30 ' +
          'April) remains recorded with a caveat, not as a plain verified fact.',
        source: 'cdc2025PcvNotes',
        verified: '2026-09-25',
        quote: 'minimum age: 6 weeks [PCV15], [PCV 20]; 2 years [PPSV23]',
      },
    ],
  },
];
