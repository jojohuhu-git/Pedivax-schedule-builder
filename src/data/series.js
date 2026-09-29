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
  // HepB became a brand-length-setting series (with Hib, RV, MenB) on
  // 2026-09-26, once cover.test.js's exhaustive check caught Pediarix and
  // Vaxelis being modeled as covering HepB doses 1-3 — impossible, since
  // dose 1 is specifically the birth dose and neither product is licensed
  // before 6 weeks. Given after a separate birth dose, a HepB-containing
  // combo product makes this a 4-dose series (CDC 2025: "Administration of
  // 4 doses is permitted when a combination vaccine containing HepB is used
  // after the birth dose" / "substitute 'dose 4' for 'dose 3' [in minimum-
  // interval calculations]" — see the 2026-09-26 addition to
  // docs/updates/sources/2026-09-25-cdc2025-hepb-notes.md). Unlike Hib/RV/
  // MenB, dose 1 (the birth dose) is identical and unaffected in both
  // variants — only doses 2 onward differ, which is why both variants below
  // repeat the same dose-1 definition rather than sharing one series-level
  // list. `requiresAllDosesFrom` here means "any of these products", not
  // "all" (seriesLength.js) — either monovalent brand alone is enough.
  HepB: {
    key: 'HepB',
    name: 'Hepatitis B',
    abbr: 'HepB',
    route: 'injection',
    ageBlock: 'infant',
    variants: [
      {
        id: 'monovalent',
        label: 'Engerix-B and/or Recombivax HB (standalone hepatitis B)',
        doseCount: 3,
        requiresAllDosesFrom: ['Engerix-B', 'Recombivax HB'],
        // Written for seriesLength.js (docs UX queue, Batch B/B2) — a
        // human-authored sentence, not assembled from `label`, which stays
        // reserved for the rulebook table heading above.
        chosenNote:
          'Hepatitis B — 3 doses at birth, 1–2 months and 6 months, because you stock ' +
          'standalone hepatitis B vaccine. Giving doses 2–4 as Pediarix or Vaxelis is ' +
          'equally correct, but makes it a 4-dose series — one more injection.',
        doses: [
          { n: 1, at: ['birth'], minAgeDays: 0 },
          { n: 2, at: ['m1', 'm2'], minIntervalFromPrevDays: 28 },
          {
            n: 3,
            at: ['m6', 'm9', 'm12', 'm15', 'm18'],
            booster: false,
            minAgeDays: 168,
            minIntervalFromPrevDays: 56,
            note:
              'Also requires at least 16 weeks (112 days) since dose 1 — whichever ' +
              'of the two interval floors is later governs.',
          },
        ],
      },
      {
        id: 'combo',
        label: 'Pediarix or Vaxelis for doses 2 through 4',
        doseCount: 4,
        fallback: true,
        chosenNote:
          'Hepatitis B — 4 doses at birth, 1–2 months, 4 months and 6 months, because ' +
          'Pediarix or Vaxelis is carrying doses 2 through 4. An all-Engerix-B or ' +
          'Recombivax HB series is 3 doses instead (birth, 1–2 months and 6 months).',
        doses: [
          { n: 1, at: ['birth'], minAgeDays: 0 },
          { n: 2, at: ['m1', 'm2'], minIntervalFromPrevDays: 28 },
          { n: 3, at: ['m4'], minIntervalFromPrevDays: 28 },
          {
            n: 4,
            at: ['m6'],
            booster: false,
            minAgeDays: 168,
            minIntervalFromPrevDays: 56,
            note:
              "CDC: 'substitute dose 4 for dose 3' — this dose carries the same " +
              'gating the 3-dose path puts on dose 3 (also requires at least 16 ' +
              'weeks since dose 1).',
          },
        ],
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
      {
        claim:
          "In the 4-dose path, CDC's own rule for spacing is 'substitute dose 4 for " +
          "dose 3' — it does not separately state a dose 2→dose 3 interval. This app " +
          'reads that as: whichever administration ends up last keeps the old dose-3 ' +
          'gating (quoted above), and the step before it uses the same 4-week floor ' +
          "as every other primary-series step in this app (DTaP/IPV/PCV/Hib). This is " +
          'a reasoned reading of the quote, not a separately quoted number — see the ' +
          '2026-09-26 addition to the snapshot for the full reasoning.',
        source: 'cdc2025HepbNotes',
        verified: '2026-09-26',
        quote: "Minimum intervals (see Table 2): when 4 doses are administered, substitute 'dose 4' for 'dose 3' in these calculations",
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
    ageBlock: 'infant',
    variants: [
      {
        id: 'rotarix',
        label: 'Rotarix',
        doseCount: 2,
        requiresAllDosesFrom: ['Rotarix'],
        chosenNote:
          'Rotavirus — 2 doses at 2 and 4 months, because you stock Rotarix. Any series ' +
          'containing a RotaTeq dose, or mixing the two brands, is a 3-dose series ' +
          'instead (adds a 6-month dose).',
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
        chosenNote:
          'Rotavirus — 3 doses at 2, 4 and 6 months. Any series containing a RotaTeq ' +
          'dose — or mixing the two brands — is a 3-dose series. An all-Rotarix series ' +
          'is 2 doses, at 2 and 4 months.',
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

  // DTaP is another plain series, like HepB — Daptacel and Infanrix both
  // cover doses 1-5 identically, no brand choice that changes series length.
  // The two 4-6-year booster combo products (Kinrix, Quadracel) are DTaP+IPV
  // and are added once IPV is verified, per the B2 queue.
  DTaP: {
    key: 'DTaP',
    name: 'Diphtheria, tetanus, pertussis',
    abbr: 'DTaP',
    route: 'injection',
    ageBlock: 'infant',
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

  // Hib is the third series (with Rotavirus and MenB) whose brand choice sets
  // the length of the whole series — decisions.md: "PedvaxHIB start to
  // finish is 3 doses. Any PRP-T product, or any mix of brands, is 4."
  Hib: {
    key: 'Hib',
    name: 'Haemophilus influenzae type b',
    abbr: 'Hib',
    route: 'injection',
    ageBlock: 'infant',
    variants: [
      {
        id: 'pedvax',
        label: 'PedvaxHIB for every dose',
        doseCount: 3,
        requiresAllDosesFrom: ['PedvaxHIB'],
        chosenNote:
          'Hib — 3 doses at 2, 4 and 12–15 months, because you stock PedvaxHIB for ' +
          'every dose. Any series with an ActHIB or Hiberix dose, or mixing brands, is ' +
          'a 4-dose series instead (adds a 6-month dose).',
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
        chosenNote:
          'Hib — 4 doses at 2, 4, 6 and 12–15 months. ActHIB and Hiberix are 4-dose ' +
          'series, and so is any series that mixes brands. Only an all-PedvaxHIB ' +
          'series is 3 doses (2, 4 and 12–15 months).',
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

  // PCV is a plain 4-dose series, like HepB — unlike Hib/RV/MenB, the two
  // current products (Prevnar 20, Vaxneuvance) cover doses 1-4 identically,
  // so there's no brand choice that changes the series length and no
  // `variants[]` needed.
  PCV: {
    key: 'PCV',
    name: 'Pneumococcal conjugate',
    abbr: 'PCV',
    route: 'injection',
    ageBlock: 'infant',
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

  // IPV is normally a 4-dose series, but it is the ONE series where CDC and
  // AAP explicitly say a combination product may add a dose: "4 or more
  // doses of IPV can be administered before age 4 years when a combination
  // vaccine containing IPV is used. However, a dose is still recommended on
  // or after age 4 years." Pentacel is given at 2, 4, 6 AND 15-18 months,
  // so a Pentacel child really does get four polio doses before the fourth
  // birthday and a fifth at 4-6 years. That is the standard outcome of
  // using Pentacel, not over-vaccination — so it is modelled as a real
  // 5-dose path rather than left as an uncounted extra antigen (checked
  // 2026-09-28: the Hib and DTaP notes carry no equivalent allowance, so
  // IPV is the only series that needs one).
  //
  // A 5th brand-length-setting series, then — but unlike Hib/RV/HepB/MenB,
  // neither path is tied to a brand: every IPV product may give doses in
  // either, and which path a clinic lands on falls out of where its
  // products actually land on the calendar. plan.js's cluster search picks
  // it, preferring the shorter 4-dose path on a tie.
  //
  // In both paths the final dose has a real absolute-age floor (4 years)
  // that binds on-time, not just a minimum interval — it's placed at the
  // y4 visit rather than the earlier m18/y3 visits the interval alone would
  // allow.
  IPV: {
    key: 'IPV',
    name: 'Inactivated poliovirus',
    abbr: 'IPV',
    route: 'injection',
    ageBlock: 'infant',
    variants: [
      {
        id: 'standard',
        label: 'Any IPV product, no polio-containing shot at the 15–18-month visit',
        doseCount: 4,
        chosenNote:
          'Polio — 4 doses at 2, 4, 6–18 months and 4–6 years. A combination ' +
          'product that also contains polio and is given at the 15–18-month ' +
          'booster visit (Pentacel) makes it a 5-dose series instead; the extra ' +
          'dose is expected, and the 4–6 year dose is still needed either way.',
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
      },
      {
        id: 'combination',
        label: 'A polio-containing combination product at the 15–18-month visit (Pentacel)',
        doseCount: 5,
        fallback: true,
        // The one variant in this app that no brand list can identify: it is
        // reached by WHERE a product lands, not by which brand is stocked.
        // Named here so one-source-of-truth.test.js can build the formulary
        // that commits the planner to it.
        reachedWith: ['Pentacel'],
        chosenNote:
          'Polio — 5 doses at 2, 4, 6, 15–18 months and 4–6 years. Pentacel ' +
          'contains polio and is given at the 15–18-month booster visit, so that ' +
          'shot is a 4th polio dose; a dose on or after the 4th birthday is still ' +
          'recommended, which makes five. CDC and AAP both allow this explicitly.',
        doses: [
          { n: 1, at: ['m2'], minAgeDays: 42 },
          { n: 2, at: ['m4'], minIntervalFromPrevDays: 28 },
          { n: 3, at: ['m6'], minIntervalFromPrevDays: 28 },
          // The extra dose exists because a DTaP-IPV combination lands on
          // the 15-18 month DTaP booster visit — that is the only place it
          // ever comes from, so that is the only window it is offered in.
          { n: 4, at: ['m15', 'm18'], minIntervalFromPrevDays: 28 },
          {
            n: 5,
            at: ['y4', 'y5', 'y6'],
            booster: true,
            minAgeDays: 1461,
            minIntervalFromPrevDays: 183,
          },
        ],
      },
    ],
    facts: [
      {
        claim:
          'A combination product containing polio may push the count past 4 before ' +
          'the 4th birthday, and that is expected rather than an error — but a dose ' +
          'on or after age 4 is still recommended, so a Pentacel child ends on 5 ' +
          'doses. CDC and AAP state this in identical words, so there is no ' +
          'disagreement to resolve.',
        source: 'cdc2025IpvNotes',
        verified: '2026-09-28',
        quote:
          '4 or more doses of IPV can be administered before age 4 years when a ' +
          'combination vaccine containing IPV is used. However, a dose is still ' +
          'recommended on or after age 4 years and at least 6 months after the ' +
          'previous dose.',
      },
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
    ageBlock: 'toddler',
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
    ageBlock: 'toddler',
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

  // Hepatitis A is the first series where the minimum-interval floor
  // actually binds an on-time plan: both doses land in the 12-23-month
  // window, only 6 months apart at minimum, so which visit is valid for
  // dose 2 depends on when dose 1 happened (m12 -> m18 works; m15 needs
  // m24, since m18 would be only 3 months later). Both are listed as valid
  // `at` options and the interval does the real gating — the frozen mockup
  // hardcoded m18 alone, which would silently violate the floor for a
  // child whose dose 1 ran at 15 months.
  HepA: {
    key: 'HepA',
    name: 'Hepatitis A',
    abbr: 'HepA',
    route: 'injection',
    ageBlock: 'toddler',
    doses: [
      { n: 1, at: ['m12', 'm15'], minAgeDays: 365 },
      { n: 2, at: ['m18', 'm24'], minIntervalFromPrevDays: 183 },
    ],
    facts: [
      {
        claim: '2-dose series, both doses at 12-23 months, minimum 6 months apart.',
        source: 'cdc2025HepaNotes',
        verified: '2026-09-25',
        quote: '2-dose series (minimum interval: 6 months) at age 12–23 months',
      },
      {
        claim: 'The routine minimum age for dose 1 is 12 months.',
        source: 'cdc2025HepaIntervals',
        verified: '2026-09-25',
        quote: 'Minimum age for dose 1: 12 months',
      },
      {
        claim:
          'Minimum interval dose 1 to dose 2 is 6 months — no maximum interval set ' +
          'by CDC/ACIP, unlike the two inserts below.',
        source: 'cdc2025HepaIntervals',
        verified: '2026-09-25',
        quote: 'Minimum interval dose 1 to dose 2: 6 months',
      },
    ],
  },

  // Tdap is a single adolescent booster dose, unlike every series so far —
  // no primary series, no interval to check.
  Tdap: {
    key: 'Tdap',
    name: 'Tetanus, diphtheria, pertussis (adolescent booster)',
    abbr: 'Tdap',
    route: 'injection',
    ageBlock: 'adolescent',
    doses: [{ n: 1, at: ['y11', 'y12'], booster: true, minAgeDays: 4018 }],
    facts: [
      {
        claim: 'One dose, routinely at 11-12 years.',
        source: 'cdc2025TdapNotes',
        verified: '2026-09-25',
        quote: 'Age 11–12 years: 1 dose Tdap (adolescent booster)',
      },
      {
        claim:
          'An early dose at age 10 satisfies the requirement and the 11-12-year ' +
          "dose is then skipped — a catch-up allowance, out of scope for this app's " +
          'v1 (no catch-up logic), since an on-time child simply takes the one ' +
          'routine dose.',
        source: 'cdc2025TdapNotes',
        verified: '2026-09-25',
        quote: 'Age 10 years who receive Tdap do not need the adolescent Tdap booster dose at age 11–12 years.',
      },
    ],
  },

  // HPV can start as early as 9 (CDC/AAP agree), but decisions.md settles
  // this app's plan to always use the 2-dose 9-14-year schedule, placed at
  // the 11- and 12-year visits specifically (not a window) — an owner
  // decision, not a clinical minimum.
  HPV: {
    key: 'HPV',
    name: 'Human papillomavirus',
    abbr: 'HPV',
    route: 'injection',
    ageBlock: 'adolescent',
    doses: [
      { n: 1, at: ['y11'], minAgeDays: 3287 },
      { n: 2, at: ['y12'], minIntervalFromPrevDays: 152 },
    ],
    facts: [
      {
        claim:
          'Routinely recommended at 11-12 years (can start at 9). For anyone whose ' +
          'first dose is at 9-14 years, a 2-dose series at 0, 6-12 months. This app ' +
          "always starts in that band (decisions.md), so the 15+/3-dose branch " +
          'never applies to an on-time plan.',
        source: 'cdc2025HpvNotes',
        verified: '2026-09-25',
        quote:
          'HPV vaccination routinely recommended at age 11–12 years (can start at ' +
          'age 9 years). Age 9–14 years at initial vaccination: 2-dose series at 0, ' +
          '6–12 months (minimum interval: 5 months; repeat dose if administered ' +
          'too soon).',
      },
      {
        claim:
          "Placed at the 11- and 12-year visits specifically — an owner decision " +
          '(docs/decisions.md, 2026-09-25), not a clinical minimum; CDC/AAP allow ' +
          'anywhere in the 9-14 window with a 6-12 month gap.',
        source: 'cdc2025HpvNotes',
        verified: '2026-09-25',
        quote: 'HPV vaccination routinely recommended at age 11–12 years (can start at age 9 years)',
      },
      {
        claim:
          "No AAP/CDC disagreement here — CDC's 2-dose-at-0/6-12-months rule for " +
          'the 9-14 band matches what AAP recommends for the same population; ' +
          "cited from CDC directly (this session's live read), no decision needed.",
        source: 'cdc2025HpvNotes',
        verified: '2026-09-25',
        quote: 'Age 9–14 years at initial vaccination: 2-dose series at 0, 6–12 months',
      },
    ],
  },

  // MenACWY, routine healthy-adolescent schedule only (this app's v1 has no
  // risk-condition/infant branch). No variants — Menveo and MenQuadfi both
  // cover both doses identically for this population.
  MenACWY: {
    key: 'MenACWY',
    name: 'Meningococcal ACWY',
    abbr: 'MenACWY',
    route: 'injection',
    ageBlock: 'adolescent',
    doses: [
      { n: 1, at: ['y11', 'y12'], minAgeDays: 4018 },
      { n: 2, at: ['y16'], booster: true, minIntervalFromPrevDays: 56 },
    ],
    facts: [
      {
        claim: '2-dose series: primary at 11-12 years, booster at 16.',
        source: 'cdc2025MenacwyNotes',
        verified: '2026-09-25',
        quote: '2-dose series at age 11–12 years; 16 years',
      },
      {
        claim:
          'Minimum interval between doses is 8 weeks — never binds this app\'s ' +
          'on-time plan, which spaces the two doses roughly 4 years apart.',
        source: 'cdc2025MenacwyIntervals',
        verified: '2026-09-25',
        quote: 'Minimum interval between doses: 8 weeks',
      },
      {
        claim:
          "CDC 2025 gives MenQuadfi a 2-year minimum age; AAP says 6 weeks, and " +
          "MenQuadfi's own FDA insert independently agrees with AAP, not CDC. AAP " +
          'governs (never adopt a CDC revision narrower than AAP) — MeningoVax ' +
          'already ships this; this app matches it.',
        source: 'waDohMenQuadfiAapAlignment',
        verified: '2026-09-22',
        quote:
          'Updated MenACWY recommendations to align with the American Academy of ' +
          'Pediatrics. The minimum age for the first MenQuadfi dose is now 6 weeks, ' +
          'instead of 2 years for children who meet the recommendation.',
      },
    ],
  },

  // MenB is the last of the three brand-length-setting series, but unlike
  // Hib/RV it is not a shorter-vs-longer choice: Bexsero and Trumenba are
  // BOTH 2-dose series when spaced correctly. What decisions.md's "not
  // interchangeable" actually requires here is a same-brand commitment, not
  // a dose-count trade-off — so both variants below have doseCount 2 and
  // neither is a `fallback`.
  //
  // Filed last (moved from 4th, 2026-09-26 UX review, item A3): its "shared
  // decision" property isn't an age, and every other series here runs in
  // age order, so a policy-based placement between two infant series read
  // as arbitrary. MenB's own first dose is at 16 years — later than every
  // other series — so last is where age order actually puts it.
  MenB: {
    key: 'MenB',
    name: 'Meningococcal B',
    abbr: 'MenB',
    route: 'injection',
    ageBlock: 'adolescent',
    sdm: 'Not a routine dose. CDC recommends MenB for adolescents not at increased ' +
      'risk age 16–23 years (preferred 16–18) by shared clinical decision-making ' +
      'with the family, not as a universal recommendation.',
    variants: [
      {
        id: 'bexsero',
        label: 'Bexsero for both doses',
        // For seriesLength.js's prose when both brands are stocked — kept
        // separate from `label` so that sentence never has to strip a
        // trailing phrase back off (Batch B, B1).
        noun: 'Bexsero',
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
        noun: 'Trumenba',
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
};
