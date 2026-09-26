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

  // Hib is the third series (with Rotavirus and MenB) whose brand choice sets
  // the length of the whole series — decisions.md: "PedvaxHIB start to
  // finish is 3 doses. Any PRP-T product, or any mix of brands, is 4."
  Hib: {
    key: 'Hib',
    name: 'Haemophilus influenzae type b',
    abbr: 'Hib',
    route: 'injection',
    variants: [
      {
        id: 'pedvax',
        label: 'PedvaxHIB for every dose',
        doseCount: 3,
        requiresAllDosesFrom: ['PedvaxHIB'],
        doses: [
          { n: 1, at: ['m2'], minAgeDays: 42 },
          { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
          {
            n: 3,
            at: ['m12', 'm15'],
            booster: true,
            minAgeDays: 365,
            minIntervalFromPrevDays: 56,
          },
        ],
      },
      {
        id: 'prpt',
        label: 'Any PRP-T product (ActHIB, Hiberix), or any mix of brands',
        doseCount: 4,
        fallback: true,
        doses: [
          { n: 1, at: ['m2'], minAgeDays: 42 },
          { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
          { n: 3, at: ['m6'], minIntervalFromPrevDays: 28 },
          {
            n: 4,
            at: ['m12', 'm15'],
            booster: true,
            minAgeDays: 365,
            minIntervalFromPrevDays: 56,
          },
        ],
      },
    ],
    facts: [
      {
        claim:
          'PedvaxHIB is a 3-dose series (2 doses at 2 and 4 months, booster at 12-15 ' +
          'months). Any PRP-T product (ActHIB, Hiberix) or a mix of brands is 4 doses ' +
          '(3 doses at 2, 4, 6 months, booster at 12-15 months).',
        source: 'cdc2025HibNotes',
        verified: '2026-09-25',
        quote:
          'ActHIB, Hiberix, Pentacel, or Vaxelis: 4-dose series (3-dose primary series ' +
          'at age 2, 4, and 6 months, followed by a booster dose at age 12–15 months) / ' +
          'PedvaxHIB: 3-dose series (2-dose primary series at age 2 and 4 months, ' +
          'followed by a booster dose at age 12–15 months)',
      },
      {
        claim: 'The routine minimum age for dose 1 is 6 weeks.',
        source: 'cdc2025HibIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 6 weeks',
      },
      {
        claim:
          "ActHIB and Hiberix's own package inserts put the booster at 15-18 months; " +
          'CDC/ACIP allows it as early as 12 months and governs. PedvaxHIB\'s insert ' +
          'already matches CDC exactly (12-15 months).',
        source: 'insertActHIB',
        verified: '2026-09-25',
        quote:
          'A three-dose primary series administered at 2, 4, and 6 months of age. ' +
          'A single booster dose administered at 15-18 months of age.',
      },
    ],
  },

  // MenB is the last of the three brand-length-setting series, but unlike
  // Hib/RV it is not a shorter-vs-longer choice: Bexsero and Trumenba are
  // BOTH 2-dose series when spaced correctly. What decisions.md's "not
  // interchangeable" actually requires here is a same-brand commitment, not
  // a dose-count trade-off — so both variants below have doseCount 2 and
  // neither is a `fallback`.
  MenB: {
    key: 'MenB',
    name: 'Meningococcal B',
    abbr: 'MenB',
    route: 'injection',
    sdm: 'Not a routine dose. CDC recommends MenB for adolescents not at increased ' +
      'risk age 16–23 years (preferred 16–18) by shared clinical decision-making ' +
      'with the family, not as a universal recommendation.',
    variants: [
      {
        id: 'bexsero',
        label: 'Bexsero for both doses',
        doseCount: 2,
        requiresAllDosesFrom: ['Bexsero'],
        doses: [
          { n: 1, at: ['y16', 'y17', 'y18'] },
          { n: 2, at: ['y16', 'y17', 'y18'], minIntervalFromPrevDays: 183 },
        ],
      },
      {
        id: 'trumenba',
        label: 'Trumenba for both doses',
        doseCount: 2,
        requiresAllDosesFrom: ['Trumenba'],
        doses: [
          { n: 1, at: ['y16', 'y17', 'y18'] },
          { n: 2, at: ['y16', 'y17', 'y18'], minIntervalFromPrevDays: 183 },
        ],
      },
    ],
    facts: [
      {
        claim:
          'Shared clinical decision-making for adolescents not at increased risk, age ' +
          '16-23 (preferred 16-18) — not a universal recommendation.',
        source: 'cdc2025MenBNotes',
        verified: '2026-09-25',
        quote:
          'Adolescents not at increased risk age 16–23 years (preferred age 16–18 ' +
          'years) based on shared clinical decision-making.',
      },
      {
        claim:
          'Bexsero and Trumenba are each a 2-dose series at least 6 months apart; the ' +
          'same brand must be used for both doses.',
        source: 'cdc2025MenBNotes',
        verified: '2026-09-25',
        quote: 'Bexsero or Trumenba (use same brand for all doses): 2-dose series at least 6 months apart',
      },
      {
        claim:
          'If dose 2 is given earlier than 6 months after dose 1, a 3rd dose is needed ' +
          'at least 4 months after dose 2. Not modeled as a schedule branch here: this ' +
          "app's fixed birth-to-18 visits are always ≥6 months apart at this age range, " +
          'so an early dose 2 cannot occur in an on-time plan.',
        source: 'cdc2025MenBNotes',
        verified: '2026-09-25',
        quote: 'if dose 2 is administered earlier than 6 months, administer dose 3 at least 4 months after dose 2',
      },
      {
        claim:
          "This is an October 2024 ACIP dosing change (from 0-and-≥1-month to " +
          '0-and-6-months) — before this app\'s mid-2025 authority cutoff, so it is ' +
          'adopted, not one of the excluded later changes.',
        source: 'cdc2025MenBNotes',
        verified: '2026-09-25',
        quote: 'Bexsero or Trumenba (use same brand for all doses): 2-dose series at least 6 months apart',
      },
    ],
  },

  // PCV is a plain 4-dose series, like HepB — unlike Hib/RV/MenB, the two
  // current products (Prevnar 20, Vaxneuvance) cover doses 1-4 identically,
  // so there's no brand choice that changes the series length and no
  // `variants[]` needed.
  PCV: {
    key: 'PCV',
    name: 'Pneumococcal conjugate',
    abbr: 'PCV',
    route: 'injection',
    doses: [
      { n: 1, at: ['m2'], minAgeDays: 42 },
      { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
      { n: 3, at: ['m6'], minIntervalFromPrevDays: 28 },
      {
        n: 4,
        at: ['m12', 'm15'],
        booster: true,
        minAgeDays: 365,
        minIntervalFromPrevDays: 56,
      },
    ],
    facts: [
      {
        claim: '4-dose series at 2, 4, 6, and 12-15 months.',
        source: 'cdc2025PcvNotes',
        verified: '2026-09-25',
        quote: '4-dose series at 2, 4, 6, 12–15 months',
      },
      {
        claim: 'The routine minimum age for dose 1 is 6 weeks.',
        source: 'cdc2025PcvIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 6 weeks',
      },
      {
        claim:
          'Minimum intervals: 4 weeks between doses given before the 1st birthday; ' +
          'dose 4 requires at least 8 weeks after dose 3 and is only needed for a ' +
          'child who received all 3 primary doses before 12 months — which describes ' +
          "every on-time child this app plans for, so dose 4 always applies here.",
        source: 'cdc2025PcvIntervals',
        verified: '2026-09-25',
        quote:
          '8 weeks (as final dose). This dose is only necessary for children age 12 ' +
          'through 59 months regardless of risk ... who received 3 doses before age ' +
          '12 months.',
      },
      {
        claim:
          'PCV13 (Prevnar 13) is no longer the routinely-used product; the two current ' +
          'products are PCV15 (Vaxneuvance) and PCV20 (Prevnar 20), both licensed from ' +
          "6 weeks of age. PCV13's own retirement date (commonly cited as 30 April " +
          "2024) rests on a document title and search summaries, not a sentence read " +
          "live — the underlying PDF is bot-blocked (HTTP 403) both this session and " +
          'last. Recorded as unverified rather than upgraded to a fact.',
        source: 'cdc2025PcvNotes',
        verified: '2026-09-25',
        quote: 'minimum age: 6 weeks [PCV15], [PCV 20]; 2 years [PPSV23]',
      },
    ],
  },

  // DTaP is another plain series, like HepB/PCV — Daptacel and Infanrix both
  // cover doses 1-5 identically, no brand choice that changes series length.
  // The two 4-6-year booster combo products (Kinrix, Quadracel) are DTaP+IPV
  // and are added once IPV is verified, per the B2 queue.
  DTaP: {
    key: 'DTaP',
    name: 'Diphtheria, tetanus, pertussis',
    abbr: 'DTaP',
    route: 'injection',
    doses: [
      { n: 1, at: ['m2'], minAgeDays: 42 },
      { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
      { n: 3, at: ['m6'], minIntervalFromPrevDays: 28 },
      {
        n: 4,
        at: ['m15', 'm18'],
        booster: true,
        minAgeDays: 365,
        minIntervalFromPrevDays: 183,
      },
      {
        n: 5,
        at: ['y4', 'y5', 'y6'],
        booster: true,
        minAgeDays: 1461,
        minIntervalFromPrevDays: 183,
      },
    ],
    facts: [
      {
        claim:
          '5-dose series: 3-dose primary at 2, 4, 6 months, boosters at 15-18 months ' +
          'and 4-6 years.',
        source: 'cdc2025DtapNotes',
        verified: '2026-09-25',
        quote:
          '5-dose series (3-dose primary series at age 2, 4, and 6 months, followed ' +
          'by booster doses at ages 15–18 months and 4–6 years)',
      },
      {
        claim: 'The routine minimum age for dose 1 is 6 weeks.',
        source: 'cdc2025DtapIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 6 weeks',
      },
      {
        claim:
          'Minimum intervals: 4 weeks between doses 1-2 and 2-3; 6 months between ' +
          'doses 3-4 and doses 4-5. A 5th dose is not needed if dose 4 was given at ' +
          'age 4 or older and at least 6 months after dose 3 — this cannot occur in ' +
          "an on-time plan, since dose 4 always lands at 15-18 months.",
        source: 'cdc2025DtapIntervals',
        verified: '2026-09-25',
        quote:
          'Dose 3 to dose 4: 6 months / Dose 4 to dose 5: 6 months / A fifth dose is ' +
          'not necessary if the fourth dose was administered at age 4 years or older ' +
          'and at least 6 months after dose 3',
      },
      {
        claim:
          "Both current products' inserts allow dose 4 at 15-20 months, one month " +
          "wider than CDC/ACIP's 15-18-month routine window — a wider insert, not a " +
          'narrower one, so no gap to flag. CDC/ACIP governs the on-time schedule.',
        source: 'insertDaptacel',
        verified: '2026-09-25',
        quote:
          'The five dose immunization series consists of a 0.5 mL dose administered ' +
          'intramuscularly at 2, 4, 6 and 15-20 months of age, and at 4-6 years of age.',
      },
    ],
  },

  // IPV is another plain series, like HepB/PCV/DTaP — IPOL is the only
  // single-antigen product, no brand choice, no variants. Unlike the other
  // boosters in this app, dose 4 has a real absolute-age floor (4 years)
  // that binds on-time, not just a minimum interval — it's placed at the
  // y4 visit rather than the earlier m18/y3 visits the interval alone would
  // allow.
  IPV: {
    key: 'IPV',
    name: 'Inactivated poliovirus',
    abbr: 'IPV',
    route: 'injection',
    doses: [
      { n: 1, at: ['m2'], minAgeDays: 42 },
      { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
      { n: 3, at: ['m6', 'm12', 'm15', 'm18'], minIntervalFromPrevDays: 28 },
      {
        n: 4,
        at: ['y4', 'y5', 'y6'],
        booster: true,
        minAgeDays: 1461,
        minIntervalFromPrevDays: 183,
      },
    ],
    facts: [
      {
        claim:
          '4-dose series: 2, 4, 6-18 months, 4-6 years. The final dose must be on or ' +
          'after age 4 and at least 6 months after the previous dose — an absolute ' +
          'floor, not just an interval, so it always lands at the 4-6 year visits ' +
          'even for a child whose earlier doses ran early.',
        source: 'cdc2025IpvNotes',
        verified: '2026-09-25',
        quote:
          '4-dose series at ages 2, 4, 6–18 months, 4–6 years; administer the final ' +
          'dose on or after age 4 years and at least 6 months after the previous dose.',
      },
      {
        claim: 'The routine minimum age for dose 1 is 6 weeks.',
        source: 'cdc2025IpvIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 6 weeks',
      },
      {
        claim:
          'A 4th dose is not needed if dose 3 was given at age 4 or older and at ' +
          "least 6 months after dose 2 — this cannot occur in an on-time plan, since " +
          'dose 3 always lands at 6-18 months.',
        source: 'cdc2025IpvIntervals',
        verified: '2026-09-25',
        quote:
          'A fourth dose is not necessary if the third dose was administered at age ' +
          '4 years or older and at least 6 months after the previous dose.',
      },
    ],
  },

  // MMR and Varicella are both plain 2-dose series at the same two visits
  // (12-15 months, 4-6 years) — modeled separately (matching the mockup's
  // separate MMR/VAR abbreviations) even though ProQuad delivers both at
  // once, because the series' own dose ages/intervals never depend on which
  // product gives them.
  MMR: {
    key: 'MMR',
    name: 'Measles, mumps, rubella',
    abbr: 'MMR',
    route: 'injection',
    doses: [
      { n: 1, at: ['m12', 'm15'], minAgeDays: 365 },
      {
        n: 2,
        at: ['y4', 'y5', 'y6'],
        booster: false,
        minIntervalFromPrevDays: 28,
      },
    ],
    facts: [
      {
        claim: '2-dose series at 12-15 months and 4-6 years.',
        source: 'cdc2025MmrVarNotes',
        verified: '2026-09-25',
        quote: 'MMR: 2-dose series at age 12–15 months, age 4–6 years',
      },
      {
        claim:
          'Minimum age for dose 1 is 12 months; minimum interval to dose 2 is 4 ' +
          "weeks (3 months if either dose is the MMRV combination). Neither floor " +
          "binds this app's on-time plan, which spaces the two doses years apart.",
        source: 'cdc2025MmrVarIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 12 months / minimum interval dose 1 to dose 2: 4 weeks',
      },
      {
        claim:
          'CDC 2025 recommends separate MMR and varicella for dose 1 (12-47 months), ' +
          'with MMRV only if the family prefers it. AAP expresses no preference at ' +
          'dose 1 — so there is no real disagreement to resolve there. At dose 2, AAP ' +
          "actively prefers the MMRV combination to save an injection, which CDC 2025 " +
          "doesn't address either way. Documentary: it changes which product " +
          "(ProQuad vs. separate M-M-R II/Varivax) the plan prefers, not this series' " +
          'own dose ages.',
        source: 'aapChildSchedule2026',
        verified: '2026-09-24',
        quote:
          'The AAP expresses no preference between MMR plus monovalent varicella ' +
          'vaccine or MMRV for toddlers receiving their first immunization of this ' +
          'kind. ... For the 2nd dose at 4–6 years, MMRV generally is preferred over ' +
          'MMR plus monovalent varicella to minimize the number of injections.',
      },
    ],
  },

  VAR: {
    key: 'VAR',
    name: 'Varicella',
    abbr: 'VAR',
    route: 'injection',
    doses: [
      { n: 1, at: ['m12', 'm15'], minAgeDays: 365 },
      {
        n: 2,
        at: ['y4', 'y5', 'y6'],
        booster: false,
        minIntervalFromPrevDays: 90,
      },
    ],
    facts: [
      {
        claim: '2-dose series at 12-15 months and 4-6 years — same visits as MMR.',
        source: 'cdc2025MmrVarNotes',
        verified: '2026-09-25',
        quote: 'Varicella: 2-dose series at age 12–15 months, 4–6 years',
      },
      {
        claim:
          "Minimum age for dose 1 is 12 months; minimum interval to dose 2 is 3 " +
          "months. Doesn't bind this app's on-time plan, which spaces the two doses " +
          'years apart.',
        source: 'cdc2025MmrVarIntervals',
        verified: '2026-09-25',
        quote: 'Varicella — minimum age for dose 1: 12 months; minimum interval dose 1 to dose 2: 3 months.',
      },
      {
        claim:
          'Same AAP/CDC MMRV preference nuance as MMR: no real disagreement at dose ' +
          '1; AAP prefers the combination at dose 2. See the MMR series facts for ' +
          'the full quote — documentary, does not change this series\' dose ages.',
        source: 'aapChildSchedule2026',
        verified: '2026-09-24',
        quote:
          'For the 2nd dose at 4–6 years, MMRV generally is preferred over MMR plus ' +
          'monovalent varicella to minimize the number of injections.',
      },
    ],
  },
};
