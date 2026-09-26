// One entry per antigen. Scheduling fields (doses[].at / minAgeDays /
// minIntervalFromPrevDays) and documentation fields (facts[]) sit side by
// side — the planner reads the former, the rulebook prints the latter, and
// neither may hold a rule the other doesn't know about. See
// docs/data-design.md for the full field shapes and docs/decisions.md for
// the authority pin (this app follows guidance as it stood before the
// mid-2025 federal changes, plus AAP; AAP governs where AAP and CDC 2025
// disagree).
//
// Built one vaccine group at a time (owner's choice, 2026-09-25). Only
// Hepatitis B is verified and populated so far — every other antigen is
// added as its own group is fetched and quoted, never guessed to fill the
// shape in early.
export const SERIES = {
  HepB: {
    key: 'HepB',
    name: 'Hepatitis B',
    abbr: 'HepB',
    route: 'injection',
    doses: [
      { n: 1, at: ['birth'], minAgeDays: 0 },
      { n: 2, at: ['m1', 'm2'], minIntervalFromPrevDays: 28 },
      {
        n: 3,
        at: ['m6', 'm9', 'm12', 'm15', 'm18'],
        minAgeDays: 168,
        minIntervalFromPrevDays: 56,
        note:
          'Also requires at least 16 weeks (112 days) since dose 1 — whichever ' +
          'of the two interval floors is later governs.',
      },
    ],
    facts: [
      {
        claim:
          '3-dose series for infants of HBsAg-negative mothers: birth, 1–2 months, 6–18 months.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-25',
        quote: '3-dose series at ages 0, 1–2, and 6–18 months',
      },
      {
        claim:
          'Birth dose within 24 hours of birth for a medically stable infant of normal birth weight.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-25',
        quote:
          'Birth weight ≥2,000 grams: 1 dose within 24 hours of birth if medically stable',
      },
      {
        claim:
          'Minimum interval dose 1→2 is 4 weeks; dose 2→3 is 8 weeks and at least 16 weeks ' +
          'after dose 1; minimum age for the final dose is 24 weeks (168 days).',
        source: 'cdc2025HepbIntervals',
        verified: '2026-09-25',
        quote:
          'Dose 2 to dose 3: 8 weeks and at least 16 weeks after first dose. ' +
          'Minimum age for the final dose is 24 weeks',
      },
      {
        claim:
          'A 4th HepB-containing dose is expected, not an error, when a combination ' +
          'vaccine that includes HepB is used for the doses after the monovalent birth dose.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-25',
        quote:
          'Administration of 4 doses is permitted when a combination vaccine ' +
          'containing HepB is used after the birth dose',
      },
    ],
  },
};
