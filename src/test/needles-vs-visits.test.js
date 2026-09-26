// docs/data-design.md's required invariant test: fewest injections is the
// score (docs/decisions.md); this file checks, by name, whether optimizing
// for fewest VISITS instead would ever choose a genuinely DIFFERENT set of
// shots — a real shots-for-visits trade, not just a free tidiness win.
//
// The `objective: 'visits'` option on buildPlan exists solely for this file
// to build that alternate plan; the shipped app never passes it, and
// plan.js's default tie-break already prefers fewer visits for free once
// injection count is equal (owner confirmed 2026-09-26 — see plan.js's
// `isBetter`). So the real question this file answers is narrower than it
// first sounds: not "do the two plans ever differ" (they can, harmlessly),
// but "does optimizing for visits ever cost a shot" — and today it doesn't,
// for any formulary this app can produce (checked exhaustively below, not
// just spot-checked).
import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';

const ALL_NAMES = PRODUCTS.filter((p) => !p.retired).map((p) => p.name);

describe('needles vs. visits — optimizing for visits never costs a shot', () => {
  it('every formulary (every product stocked, and every single-product-removed variant) scores the same injections either way', () => {
    const formularies = [new Set(ALL_NAMES), ...ALL_NAMES.map((name) => new Set(ALL_NAMES.filter((n) => n !== name)))];
    for (const ticked of formularies) {
      const needlesScore = scorePlan(buildPlan(ticked));
      const visitsScore = scorePlan(buildPlan(ticked, { objective: 'visits' }));
      expect(needlesScore.injections, `formulary: ${[...ticked].join(', ')}`).toBe(visitsScore.injections);
    }
  });

  it('a clinic with no all-in-one combo product: the two objectives agree, because plan.js\'s default already took the free win', () => {
    // hepatitis B's 2nd dose (window m1/m2) costs the same one Engerix-B
    // shot whichever visit it lands on when nothing combines it with
    // anything else — plan.js's default now picks m2 (joining the
    // already-busy 2-month visit) for free, same as objective:'visits'
    // would, so there is nothing left for a visits-first search to improve.
    const ticked = new Set(ALL_NAMES.filter((n) => n !== 'Vaxelis'));
    const needles = buildPlan(ticked);
    const visits = buildPlan(ticked, { objective: 'visits' });
    expect(scorePlan(needles)).toEqual(scorePlan(visits));
    expect(needles.visits.some((v) => v.visit.id === 'm1')).toBe(false);
  });
});
