// One entry per antigen. Scheduling fields (doses[].at / minAgeDays /
// minIntervalFromPrevDays) and documentation fields (facts[]) sit side by
// side — the planner reads the former, the rulebook prints the latter, and
// neither may hold a rule the other doesn't know about. See
// docs/data-design.md for the full field shapes and docs/decisions.md for
// the authority pin (this app follows guidance as it stood before the
// mid-2025 federal changes, plus AAP; AAP governs where AAP and CDC 2025
// disagree).
//
// Built one vaccine group at a time (owner's choice, 2026-09-25). Every
// antigen is added as its own group is fetched and quoted, never guessed to
// fill the shape in early.
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

  // Rotavirus is one of the three series (with Hib and MenB) whose brand
  // choice sets the length of the whole series — decisions.md: "Rotarix is
  // 2 doses, RotaTeq is 3. Not interchangeable." `variants` replaces `doses`
  // for these; the app picks the shorter variant and says why, per
  // seriesLength.js (docs/data-design.md), with the clinician able to override.
  RV: {
    key: 'RV',
    name: 'Rotavirus',
    abbr: 'RV',
    route: 'oral',
    variants: [
      {
        id: 'rotarix',
        label: 'Rotarix',
        doseCount: 2,
        requiresAllDosesFrom: ['Rotarix'],
        doses: [
          { n: 1, at: ['m2'], minAgeDays: 42, maxAgeDays: 104 },
          { n: 2, at: ['m4'], minIntervalFromPrevDays: 28, maxAgeDays: 244 },
        ],
        insertMaxAgeDaysFinalDose: 168,
      },
      {
        id: 'rotateq',
        label: 'Any RotaTeq dose, or any mix of brands',
        doseCount: 3,
        fallback: true,
        doses: [
          { n: 1, at: ['m2'], minAgeDays: 42, maxAgeDays: 104 },
          { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
          { n: 3, at: ['m6'], minIntervalFromPrevDays: 28, maxAgeDays: 244 },
        ],
        insertMaxAgeDaysFinalDose: 224,
      },
    ],
    facts: [
      {
        claim: 'Rotarix is a 2-dose series (2 and 4 months); RotaTeq is a 3-dose series (2, 4, 6 months).',
        source: 'cdc2025RvNotes',
        verified: '2026-09-25',
        quote: 'Rotarix: 2-dose series at age 2 and 4 months / RotaTeq: 3-dose series at age 2, 4, and 6 months',
      },
      {
        claim: 'If any dose in the series is RotaTeq, or the brand is unknown, the whole series defaults to 3 doses.',
        source: 'cdc2025RvNotes',
        verified: '2026-09-25',
        quote: 'If any dose in the series is either RotaTeq or unknown, default to 3-dose series.',
      },
      {
        claim: 'The series must start before 15 weeks 0 days of age (minimum age for dose 1 is 6 weeks).',
        source: 'cdc2025RvIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 6 weeks. Maximum age for first dose is 14 weeks, 6 days.',
      },
      {
        claim:
          'CDC/ACIP allows the final dose up to 8 months of age for either brand — later than either ' +
          "brand's own package insert states. The insert is recorded but does not narrow this window.",
        source: 'cdc2025RvIntervals',
        verified: '2026-09-25',
        quote: 'Maximum age for final dose is 8 months, 0 days.',
      },
    ],
  },
};
