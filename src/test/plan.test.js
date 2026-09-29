// plan.js — the schedule builder. Covers docs/decisions.md's worked Pentacel
// example (needles-first, not visits-first), the "don't shift without a
// reason" invariant, formulary gaps, and the brand-consistency bug this file
// exists because of: a series on its EXCLUSIVE shorter path (PedvaxHIB,
// monovalent HepB) must never have one of its doses covered by a product
// that isn't on that path's own brand list — mixing products mid-series
// silently changes how many total doses the series actually needs
// (docs/decisions.md, Hib: "any mix of brands is 4"; series.js's HepB
// comment: "4 doses is permitted... after the birth dose" — a combination
// product used for any post-birth dose commits the whole series to 4).
import { describe, it, expect } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from '../logic/plan.js';

const ALL_PRODUCTS = new Set(PRODUCTS.filter((p) => !p.retired).map((p) => p.name));

function visit(plan, id) {
  return plan.visits.find((v) => v.visit.id === id);
}

function productsGiven(v) {
  return v.injections.map((i) => i.product.name);
}

function covers(v, productName) {
  return v.injections.find((i) => i.product.name === productName)?.covers ?? [];
}

describe('buildPlan — full formulary (every current product stocked)', () => {
  const plan = buildPlan(ALL_PRODUCTS);

  it('gives the HepB birth dose alone, monovalent — no combo product is licensed that early', () => {
    const birth = visit(plan, 'birth');
    expect(productsGiven(birth)).toEqual(['Engerix-B']);
  });

  it('uses Vaxelis for the whole 2/4/6-month primary series — DTaP+IPV+Hib+HepB in one shot each visit', () => {
    for (const id of ['m2', 'm4', 'm6']) {
      const v = visit(plan, id);
      expect(productsGiven(v)).toContain('Vaxelis');
      const seriesCovered = covers(v, 'Vaxelis').map((c) => c.seriesKey).sort();
      expect(seriesCovered).toEqual(['DTaP', 'HepB', 'Hib', 'IPV']);
    }
  });

  it('the worked Pentacel example: DTaP dose 4 and Hib\'s booster land together at 15 months, not spread across 12 and 15/18', () => {
    const m15 = visit(plan, 'm15');
    expect(productsGiven(m15)).toEqual(['Pentacel']);
    const seriesCovered = covers(m15, 'Pentacel').map((c) => c.seriesKey).sort();
    expect(seriesCovered).toEqual(['DTaP', 'Hib']);
    // and nothing was left behind at 12 months for either series
    const m12 = visit(plan, 'm12');
    expect(covers(m12, 'Pentacel')).toEqual([]);
    expect(plan.visits.some((v) => v.visit.id === 'm12' && covers(v, 'ActHIB').length)).toBe(false);
  });

  it('HepB and Hib both land on their 4-dose path — consistent with Vaxelis/Pentacel being used, not the shorter path\'s dose count', () => {
    const hepbDoses = plan.visits.flatMap((v) => v.injections.flatMap((i) => i.covers)).filter((c) => c.seriesKey === 'HepB');
    const hibDoses = plan.visits.flatMap((v) => v.injections.flatMap((i) => i.covers)).filter((c) => c.seriesKey === 'Hib');
    expect(hepbDoses.map((d) => d.dose.n).sort()).toEqual([1, 2, 3, 4]);
    expect(hibDoses.map((d) => d.dose.n).sort()).toEqual([1, 2, 3, 4]);
    expect(plan.seriesNotes.HepB).toMatch(/combination product/i);
    expect(plan.seriesNotes.Hib).toMatch(/combination product/i);
  });

  it('MMR/VAR align with ProQuad at 12 months and 4 years', () => {
    const m12 = visit(plan, 'm12');
    const y4 = visit(plan, 'y4');
    expect(covers(m12, 'ProQuad').map((c) => c.seriesKey).sort()).toEqual(['MMR', 'VAR']);
    expect(covers(y4, 'ProQuad').map((c) => c.seriesKey).sort()).toEqual(['MMR', 'VAR']);
  });

  it('the 4-6 year DTaP/IPV booster uses Kinrix or Quadracel, not two separate shots', () => {
    const y4 = visit(plan, 'y4');
    const combo = y4.injections.find((i) => ['Kinrix', 'Quadracel'].includes(i.product.name));
    expect(combo).toBeTruthy();
    expect(combo.covers.map((c) => c.seriesKey).sort()).toEqual(['DTaP', 'IPV']);
  });

  it('rotavirus is reported as oral, never as an injection', () => {
    for (const id of ['m2', 'm4']) {
      const v = visit(plan, id);
      expect(v.oral.some((o) => ['Rotarix', 'RotaTeq'].includes(o.product.name))).toBe(true);
      expect(productsGiven(v)).not.toContain('Rotarix');
      expect(productsGiven(v)).not.toContain('RotaTeq');
    }
  });

  it('has no formulary gaps when everything is stocked', () => {
    for (const v of plan.visits) expect(v.gaps).toEqual([]);
  });

  it('no dose is ever covered by a product outside its own committed variant — the brand-mixing bug this file guards against', () => {
    // If a product itself commits a series to a specific dose count (e.g.
    // PedvaxHIB -> Hib:3, Vaxelis -> Hib:4), every dose that series actually
    // received in this plan must agree with that count — a real "3 doses
    // given but Vaxelis appeared once" would mean brands got mixed without
    // the series length changing to match, silently under-dosing the child.
    for (const v of plan.visits) {
      for (const inj of v.injections) {
        for (const c of inj.covers) {
          // HepB's own dose 1 (the birth dose) is identical in both variants
          // and can only ever be monovalent (no combo product is licensed
          // that early) — it doesn't commit the rest of the series either way.
          if (c.seriesKey === 'HepB' && c.dose.n === 1) continue;
          const setLen = PRODUCTS.find((p) => p.name === inj.product.name)?.setsSeriesLength?.[c.seriesKey];
          if (setLen == null) continue;
          const totalDoses = plan.visits
            .flatMap((vv) => vv.injections.flatMap((i) => i.covers))
            .filter((cc) => cc.seriesKey === c.seriesKey).length;
          expect(totalDoses, `${c.seriesKey}: ${inj.product.name} implies ${setLen} doses`).toBe(setLen);
        }
      }
    }
  });
});

describe('buildPlan — no combination products stocked', () => {
  const ticked = new Set(['Engerix-B', 'ActHIB', 'Daptacel', 'IPOL', 'Prevnar 20', 'Rotarix']);
  const plan = buildPlan(ticked);

  // Hib's booster window is {m12,m15}; DTaP's is fixed at m15 (its `at`
  // array has no m12 option). No product here combines the two into one
  // shot, so both visit choices cost the exact same 2 injections — a true
  // tie plan.js's default tie-break now resolves in favor of fewer visits
  // touched (owner confirmed 2026-09-26: free consolidation, not a
  // shots-for-visits trade, since m12 and m15 are both Bright Futures
  // checkups the child attends regardless).
  it('shifts Hib\'s booster onto DTaP\'s fixed m15 visit when doing so is free — same 2 shots, one fewer visit line', () => {
    const hibBooster = plan.visits
      .flatMap((v) => v.injections.map((i) => ({ visitId: v.visit.id, covers: i.covers })))
      .find((entry) => entry.covers.some((c) => c.seriesKey === 'Hib' && c.dose.booster));
    expect(hibBooster.visitId).toBe('m15');
  });

  it('DTaP\'s booster stays at its own earliest visit too', () => {
    const dtapBooster = plan.visits
      .flatMap((v) => v.injections.map((i) => ({ visitId: v.visit.id, covers: i.covers })))
      .find((entry) => entry.covers.some((c) => c.seriesKey === 'DTaP' && c.dose.n === 4));
    expect(dtapBooster.visitId).toBe('m15');
  });

  it('Hib stays 4-dose (ActHIB, not PedvaxHIB, is stocked)', () => {
    const hibCount = plan.visits
      .flatMap((v) => v.injections.flatMap((i) => i.covers))
      .filter((c) => c.seriesKey === 'Hib').length;
    expect(hibCount).toBe(4);
  });
});

describe('buildPlan — PedvaxHIB stocked with no DTaP/IPV combination product', () => {
  it('Hib stays on its own shorter 3-dose path, unaffected by DTaP/IPV', () => {
    const ticked = new Set(['PedvaxHIB', 'Daptacel', 'IPOL', 'Engerix-B', 'Prevnar 20']);
    const plan = buildPlan(ticked);
    const hibDoses = plan.visits
      .flatMap((v) => v.injections.flatMap((i) => i.covers))
      .filter((c) => c.seriesKey === 'Hib');
    expect(hibDoses).toHaveLength(3);
    expect(plan.seriesNotes.Hib).toMatch(/2, 4 and 12–15 months/);
  });
});

describe('buildPlan — PedvaxHIB and Vaxelis both stocked (A: Hib booster fix)', () => {
  // Finding 1 (docs/archive/handoff-2026-09-28-brand-indication-airtight-queue.md):
  // PedvaxHIB used to cover only Hib doses [1,3], so it could never serve the
  // 12-15 month booster (dose 4) of the mixed/PRP-T 4-dose path. With no
  // product able to fill that slot, plan.js fell back to the all-PedvaxHIB
  // 3-dose path — forcing a dedicated PedvaxHIB shot at every visit while
  // Vaxelis's own Hib content rode along uncounted, delivering Hib 6 times
  // for a plan that claimed 3 doses. PedvaxHIB is a monovalent Hib product
  // (not a DTaP-IPV-Hib-HepB combo), so it is an acceptable booster per
  // immunize.org and Merck's own interchangeability guidance — it should
  // cover doses [1,4].
  const plan = buildPlan(new Set(['PedvaxHIB', 'Vaxelis']));

  it('counts exactly 4 Hib doses, matching the 4-dose mixed-brand path Vaxelis commits the series to', () => {
    const hibDoses = plan.visits
      .flatMap((v) => v.injections.flatMap((i) => i.covers))
      .filter((c) => c.seriesKey === 'Hib');
    expect(hibDoses.map((d) => d.dose.n).sort()).toEqual([1, 2, 3, 4]);
  });

  it('lets PedvaxHIB serve the 12-15 month Hib booster instead of forcing a redundant all-PedvaxHIB path', () => {
    const m15 = plan.visits.find((v) => v.visit.id === 'm15');
    const booster = m15.injections.find((i) =>
      i.covers.some((c) => c.seriesKey === 'Hib' && c.dose.n === 4),
    );
    expect(booster?.product.name).toBe('PedvaxHIB');
  });

  it('drops to 4 total injections (no dedicated PedvaxHIB shot at m2/m4 riding alongside Vaxelis)', () => {
    const totalInjections = plan.visits.reduce((sum, v) => sum + v.injections.length, 0);
    expect(totalInjections).toBe(4);
  });
});

describe('buildPlan — nothing stocked', () => {
  const plan = buildPlan(new Set());

  it('reports every routine series as a gap', () => {
    const allGaps = plan.visits.flatMap((v) => v.gaps);
    const gapSeries = new Set(allGaps.map((g) => g.seriesKey));
    for (const key of ['HepB', 'Hib', 'PCV', 'DTaP', 'IPV', 'RV', 'MMR', 'VAR', 'HepA', 'Tdap', 'HPV', 'MenACWY']) {
      expect(gapSeries.has(key), `expected ${key} to show as a gap`).toBe(true);
    }
  });

  it('MenB is absent, not reported as a gap — it is shared clinical decision-making, not a required dose', () => {
    const allGaps = plan.visits.flatMap((v) => v.gaps);
    expect(allGaps.some((g) => g.seriesKey === 'MenB')).toBe(false);
    expect(plan.unresolved).toContain('MenB');
  });
});
