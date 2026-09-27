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
    products: [
      'Pentacel',
      'Kinrix',
      'ProQuad',
      'Engerix-B',
      'Rotarix',
      'Prevnar 20',
      'Havrix',
      'Adacel',
      'Gardasil 9',
      'MenQuadfi',
      'Bexsero',
    ],
  },
];
