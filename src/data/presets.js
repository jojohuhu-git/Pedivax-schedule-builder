// F1 (2026-09-26 UX queue, Batch F): opening the app fresh showed "0
// injections" and every antigen in red — a first impression of failure for
// an app whose whole point is planning a real schedule. These are one-tap
// starting points a clinic then edits, not a clinical recommendation of
// their own: every product named here already exists in products.js, and
// each preset is picked to illustrate one real stocking strategy rather
// than to prescribe one. Verified against a real buildPlan() run — both
// close every series with zero gaps (see fix-2026-09-26-ux-copy-queue.md,
// F1) — the injection count itself is computed live wherever it's shown,
// never retyped, so it can't quietly drift from what plan.js says.
export const PRESETS = [
  {
    id: 'basics',
    label: 'Single-brand basics',
    description: 'One brand per antigen, no combination products.',
    products: [
      'Engerix-B',
      'Rotarix',
      'PedvaxHIB',
      'Bexsero',
      'Prevnar 20',
      'Daptacel',
      'IPOL',
      'M-M-R II',
      'Varivax',
      'Havrix',
      'Adacel',
      'Gardasil 9',
      'MenQuadfi',
    ],
  },
  {
    id: 'fewest',
    label: 'Fewest injections',
    description: 'Every combination product this app models that actually helps.',
    // Quadracel, not Kinrix, is the 4-6 year partner for Pentacel. Pentacel
    // contains polio and is given at 15-18 months, so a Pentacel child has
    // had four polio doses before the 4th birthday and the 4-6 year shot is
    // their FIFTH — which is what Quadracel is approved for ("the fourth or
    // fifth dose in the IPV series"), while Kinrix is approved as the fourth
    // (the Infanrix/Pediarix lineage). Shipped as Kinrix until 2026-09-28,
    // when item B's whole-syringe accounting made the mismatch visible as a
    // real 2-dose gap at 15 months; see products.js's Kinrix/Quadracel facts.
    products: [
      'Pentacel',
      'Quadracel',
      'ProQuad',
      'Engerix-B',
      'Rotarix',
      'Prevnar 20',
      'Havrix',
      'Adacel',
      'Gardasil 9',
      'MenQuadfi',
      // Penmenvy (MenABCWY) with Bexsero, not Penbraya (2026-09-29, item E).
      // A pentavalent only helps a clinic that also stocks the matching
      // plain MenB brand for dose 2, and Penmenvy's MenB half is Bexsero's
      // family (4C) while Penbraya's is Trumenba's (FHbp). Adding Penbraya
      // here instead would change nothing at all: the planner would leave
      // it on the shelf rather than open a gap at 17 years. Penmenvy turns
      // the 16-year visit from two shots into one.
      'Penmenvy',
      'Bexsero',
    ],
  },
];
