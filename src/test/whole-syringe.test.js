// Item B of the 2026-09-28 brand-indication queue. The one invariant that
// holds the planner up:
//
//   Every antigen delivered must be a planned, counted dose of that series.
//   Nothing else may be delivered at all.
//
// A syringe delivers everything in it. Before this, the planner scored only
// the doses it deliberately picked a product for, so it could "save an
// injection" with a combination product while quietly adding a dose that
// appeared nowhere on the schedule — six real Hib doses for a plan that
// said three, a 5th Hib and DTaP from Pentacel at the 4-year visit, an
// uncounted polio dose from Pentacel at 15 months on the everything-stocked
// plan the app opens with.
//
// The check below is deliberately mechanical and exhaustive rather than a
// list of the cases we happened to find: it re-reads each chosen product's
// own `covers` (its antigen content) and insists the plan accounted for
// every entry. A new combination product cannot slip past it.
import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../data/products.js';
import { PRESETS } from '../data/presets.js';
import { buildPlan } from '../logic/plan.js';

const ACTIVE = PRODUCTS.filter((p) => !p.retired).map((p) => p.name);
const COMBOS = PRODUCTS.filter((p) => !p.retired && p.covers.length > 1).map((p) => p.name);
const BY_NAME = Object.fromEntries(PRODUCTS.map((p) => [p.name, p]));

// Every antigen the plan hands the child that it did not count as a dose.
function uncountedAntigens(plan) {
  const found = [];
  for (const v of plan.visits) {
    for (const shot of [...v.injections, ...v.oral]) {
      const counted = new Set(shot.covers.map((d) => d.seriesKey));
      for (const content of BY_NAME[shot.product.name].covers) {
        if (!counted.has(content.series)) {
          found.push(`${v.visit.label}: ${shot.product.name} also contains ${content.series}`);
        }
      }
    }
  }
  return found;
}

// Same question from the other side: no series may be given twice at one
// visit. Two products that each legitimately contain DTaP are still two
// DTaP doses in one morning.
function duplicateAntigens(plan) {
  const found = [];
  for (const v of plan.visits) {
    const seen = new Set();
    for (const shot of [...v.injections, ...v.oral]) {
      for (const content of BY_NAME[shot.product.name].covers) {
        if (seen.has(content.series)) {
          found.push(`${v.visit.label}: ${content.series} given twice (${shot.product.name})`);
        }
        seen.add(content.series);
      }
    }
  }
  return found;
}

const formularies = [
  ['every product stocked', ACTIVE],
  ...ACTIVE.map((name) => [`all but ${name}`, ACTIVE.filter((n) => n !== name)]),
  ...ACTIVE.map((name) => [`${name} alone`, [name]]),
  ...PRESETS.map((p) => [`preset: ${p.label}`, p.products]),
  ...COMBOS.flatMap((a, i) => COMBOS.slice(i + 1).map((b) => [`${a} + ${b}`, [a, b]])),
  // Each combination product beside one single-antigen product for a series
  // it also contains — the shape that produced every reported case: a
  // clinic that stocks both the all-in-one and the plain shot.
  ...COMBOS.flatMap((c) =>
    ['Engerix-B', 'Recombivax HB', 'ActHIB', 'Hiberix', 'PedvaxHIB', 'Daptacel', 'Infanrix', 'IPOL'].map(
      (single) => [`${c} + ${single}`, [c, single]]
    )
  ),
];

describe('every antigen delivered is a counted dose', () => {
  it('has a broad set of formularies to check (an empty sweep would prove nothing)', () => {
    expect(formularies.length).toBeGreaterThan(100);
  });

  it('no plan delivers an antigen it did not count, for any formulary', () => {
    const offenders = [];
    for (const [label, names] of formularies) {
      const found = uncountedAntigens(buildPlan(new Set(names)));
      if (found.length) offenders.push(`${label} — ${found.join('; ')}`);
    }
    expect(offenders).toEqual([]);
  });

  it('no plan gives the same antigen twice at one visit, for any formulary', () => {
    const offenders = [];
    for (const [label, names] of formularies) {
      const found = duplicateAntigens(buildPlan(new Set(names)));
      if (found.length) offenders.push(`${label} — ${found.join('; ')}`);
    }
    expect(offenders).toEqual([]);
  });
});

// The three reported/found cases, pinned individually so a regression says
// which one broke rather than just "the sweep failed".
describe('the cases that prompted the rule', () => {
  it('Pentacel alone: the 4-year visit is a gap, not a 5th Hib and DTaP dose', () => {
    const plan = buildPlan(new Set(['Pentacel']));
    const y4 = plan.visits.find((v) => v.visit.id === 'y4');
    expect(y4.injections).toEqual([]);
    expect(y4.gaps.map((g) => `${g.seriesKey}${g.dose.n}`).sort()).toEqual([
      'DTaP5',
      'IPV5',
      'MMR2',
      'VAR2',
    ]);
    // Pentacel's own data already said so; before item B the sentence was
    // in the rulebook but nothing enforced it.
    const hib = plan.visits.flatMap((v) => v.injections.flatMap((i) => i.covers)).filter((c) => c.seriesKey === 'Hib');
    expect(hib.map((d) => d.dose.n)).toEqual([1, 2, 3, 4]);
  });

  it('Pentacel alone: the 15-month shot counts its polio dose instead of hiding it', () => {
    const plan = buildPlan(new Set(['Pentacel']));
    const m15 = plan.visits.find((v) => v.visit.id === 'm15');
    const covers = m15.injections[0].covers.map((c) => `${c.seriesKey}${c.dose.n}`);
    expect(covers).toContain('IPV4');
    expect(plan.placements.IPV.doses).toHaveLength(5);
    expect(plan.seriesNotes.IPV).toMatch(/5 doses/);
  });

  it('PedvaxHIB + Vaxelis: four injections, four Hib doses — not six of each', () => {
    const plan = buildPlan(new Set(['PedvaxHIB', 'Vaxelis']));
    const injections = plan.visits.reduce((n, v) => n + v.injections.length, 0);
    expect(injections).toBe(4);
    const hibGiven = plan.visits
      .flatMap((v) => v.injections)
      .filter((i) => BY_NAME[i.product.name].covers.some((c) => c.series === 'Hib'));
    expect(hibGiven).toHaveLength(4);
  });

  it('Pediarix + Pentacel: never both in one visit — they would duplicate DTaP and polio', () => {
    const plan = buildPlan(new Set(['Pediarix', 'Pentacel']));
    for (const v of plan.visits) {
      const names = v.injections.map((i) => i.product.name);
      expect(names.includes('Pediarix') && names.includes('Pentacel'), v.visit.label).toBe(false);
    }
  });
});
