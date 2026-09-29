// Item E of the 2026-09-28 brand-indication airtightness queue.
//
// The pentavalents — Penbraya (Pfizer, MenACWY-TT/MenB-FHbp) and Penmenvy
// (GSK, MenACWY-CRM/MenB-4C) — are one injection that is simultaneously a
// MenACWY dose and a MenB dose. The owner's standing rule, and the CDC's
// own words, is that they may be used ONLY when both MenACWY and MenB are
// due on the same clinic day:
//
//   "Children age 10 years or older may receive a single dose of Penbraya
//   as an alternative to separate administration of MenACWY and MenB when
//   both vaccines would be given on the same clinic day."
//   — CDC child/adolescent schedule notes, 2025 edition
//
// The owner's note on this item (2026-09-28): the rule kept regressing in
// MeningoVax, where it lives inside recommend.js with a second copy in the
// validator. Here it has exactly one implementation — cover.js's
// `deliverableAt`, the same whole-syringe gate item B built — and the
// pentavalents get it for free by being ordinary combination products.
// This file proves that, from the outside, for every visit in the calendar.
import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../data/products.js';
import { SERIES } from '../data/series.js';
import { VISITS } from '../data/visits.js';
import { buildPlan } from '../logic/plan.js';
import { deliverableAt } from '../logic/cover.js';

const PENTAVALENTS = ['Penbraya', 'Penmenvy'];
const BY_NAME = Object.fromEntries(PRODUCTS.map((p) => [p.name, p]));

function shotsAt(plan, visitId) {
  const v = plan.visits.find((x) => x.visit.id === visitId);
  return v ? v.injections : [];
}
function gapsAt(plan, visitId) {
  const v = plan.visits.find((x) => x.visit.id === visitId);
  return v ? v.gaps.map((g) => `${g.seriesKey}${g.dose.n}`) : [];
}
function allShots(plan) {
  return plan.visits.flatMap((v) => v.injections.map((i) => ({ visit: v.visit, ...i })));
}

describe('the pentavalents exist and say what they contain', () => {
  it.each(PENTAVALENTS)('%s is a stockable combination product covering MenACWY and MenB', (name) => {
    const p = BY_NAME[name];
    expect(p, `${name} is not in products.js`).toBeDefined();
    expect(p.retired).toBeNull();
    expect(p.kind).toBe('combination');
    expect(p.covers.map((c) => c.series).sort()).toEqual(['MenACWY', 'MenB']);
  });

  // CDC: "if Penbraya is used for dose 1 MenB, MenB-FHbp (Trumenba) should
  // be administered for dose 2 MenB" (and the GSK MMWR says the same for
  // Penmenvy with MenB-4C). A pentavalent is therefore licensed for MenB
  // dose 1 only — the owner's decision 3, "never a second pentavalent
  // dose", is this field, not a separate rule bolted on beside it.
  it.each(PENTAVALENTS)('%s covers MenB dose 1 only — dose 2 must be the matching plain brand', (name) => {
    expect(BY_NAME[name].covers.find((c) => c.series === 'MenB').doses).toEqual([1, 1]);
  });

  it.each(PENTAVALENTS)('%s is licensed 10 through 25 years', (name) => {
    expect(BY_NAME[name].minAgeDays).toBe(3653);
    expect(BY_NAME[name].maxAgeDays).toBe(9131);
  });
});

// The rule itself, checked from the outside: across every formulary that
// stocks a pentavalent, it may only ever appear at a visit where BOTH of
// its series have a dose the plan counts.
describe('a pentavalent is only ever given when MenACWY and MenB are both due', () => {
  const singles = ['Menveo', 'MenQuadfi', 'Bexsero', 'Trumenba'];
  const formularies = [
    ...PENTAVALENTS.map((p) => [`${p} alone`, [p]]),
    ...PENTAVALENTS.flatMap((p) => singles.map((s) => [`${p} + ${s}`, [p, s]])),
    ...PENTAVALENTS.flatMap((p) =>
      singles.flatMap((a, i) => singles.slice(i + 1).map((b) => [`${p} + ${a} + ${b}`, [p, a, b]]))
    ),
    ['both pentavalents', PENTAVALENTS],
    ['every meningococcal product', [...PENTAVALENTS, ...singles]],
    ['every product stocked', PRODUCTS.filter((p) => !p.retired).map((p) => p.name)],
  ];

  it('has a broad set of formularies to check', () => {
    expect(formularies.length).toBeGreaterThan(20);
  });

  it('never places a pentavalent at a visit where only one of the two series is due', () => {
    const offenders = [];
    for (const [label, names] of formularies) {
      for (const shot of allShots(buildPlan(new Set(names)))) {
        if (!PENTAVALENTS.includes(shot.product.name)) continue;
        const counted = shot.covers.map((c) => c.seriesKey).sort();
        if (counted.join() !== 'MenACWY,MenB') {
          offenders.push(`${label} — ${shot.visit.label}: ${shot.product.name} counted only ${counted.join('+') || 'nothing'}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('never gives a pentavalent twice to the same child', () => {
    const offenders = [];
    for (const [label, names] of formularies) {
      const given = allShots(buildPlan(new Set(names)))
        .map((s) => s.product.name)
        .filter((n) => PENTAVALENTS.includes(n));
      const seen = new Set();
      for (const n of given) {
        if (seen.has(n)) offenders.push(`${label} — ${n} given twice`);
        seen.add(n);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('the case this item exists for — one shot at 16 years instead of two', () => {
  it('Penbraya + Trumenba + MenQuadfi: 16 years is a single injection covering both', () => {
    const plan = buildPlan(new Set(['Penbraya', 'Trumenba', 'MenQuadfi']));
    const y16 = shotsAt(plan, 'y16');
    expect(y16).toHaveLength(1);
    expect(y16[0].product.name).toBe('Penbraya');
    expect(y16[0].covers.map((c) => `${c.seriesKey}${c.dose.n}`).sort()).toEqual(['MenACWY2', 'MenB1']);
  });

  it('Penbraya + Trumenba + MenQuadfi: Trumenba finishes the MenB series at 17 years', () => {
    const plan = buildPlan(new Set(['Penbraya', 'Trumenba', 'MenQuadfi']));
    const y17 = shotsAt(plan, 'y17');
    expect(y17.map((s) => s.product.name)).toEqual(['Trumenba']);
    expect(y17[0].covers.map((c) => `${c.seriesKey}${c.dose.n}`)).toEqual(['MenB2']);
  });

  it('Penmenvy + Bexsero + MenQuadfi: the same, in the 4C family', () => {
    const plan = buildPlan(new Set(['Penmenvy', 'Bexsero', 'MenQuadfi']));
    expect(shotsAt(plan, 'y16').map((s) => s.product.name)).toEqual(['Penmenvy']);
    expect(shotsAt(plan, 'y17').map((s) => s.product.name)).toEqual(['Bexsero']);
  });

  it('saves exactly one injection against the same clinic without the pentavalent', () => {
    const count = (names) =>
      buildPlan(new Set(names)).visits.reduce((n, v) => n + v.injections.length, 0);
    expect(count(['Penbraya', 'Trumenba', 'MenQuadfi'])).toBe(count(['Trumenba', 'MenQuadfi']) - 1);
  });
});

// Owner decision 3, 2026-09-28: "pentavalent stocked without its matching
// plain MenB brand => gap at 17y, never a second pentavalent dose." CDC
// says the same thing positively — dose 2 must be the matching monovalent.
describe('a pentavalent without its matching plain MenB brand leaves an honest gap', () => {
  it.each([
    ['Penbraya', 'Trumenba'],
    ['Penmenvy', 'Bexsero'],
  ])('%s + MenQuadfi: MenB dose 2 is a gap naming %s, not a second pentavalent', (penta, partner) => {
    const plan = buildPlan(new Set([penta, 'MenQuadfi']));
    expect(shotsAt(plan, 'y16').map((s) => s.product.name)).toEqual([penta]);
    expect(gapsAt(plan, 'y17')).toEqual(['MenB2']);
    // and nothing later quietly closes it with another pentavalent
    const given = allShots(plan).map((s) => s.product.name);
    expect(given.filter((n) => n === penta)).toHaveLength(1);
    expect(BY_NAME[partner].covers.some((c) => c.series === 'MenB')).toBe(true);
  });

  // The families are not interchangeable: the wrong plain brand does not
  // rescue the pentavalent's series.
  it.each([
    ['Penbraya', 'Bexsero'],
    ['Penmenvy', 'Trumenba'],
  ])('%s + %s + MenQuadfi: the plan never mixes the two MenB families in one series', (penta, wrongPartner) => {
    const plan = buildPlan(new Set([penta, wrongPartner, 'MenQuadfi']));
    const menbShots = allShots(plan).filter((s) => s.covers.some((c) => c.seriesKey === 'MenB'));
    const brands = new Set(menbShots.map((s) => s.product.name));
    const family = (n) => (['Bexsero', 'Penmenvy'].includes(n) ? '4C' : 'FHbp');
    expect(new Set([...brands].map(family)).size).toBeLessThanOrEqual(1);
  });
});

describe('a pentavalent is refused where only MenACWY is due', () => {
  it('Penbraya alone: the 11-year MenACWY dose is a gap, not a pentavalent', () => {
    const plan = buildPlan(new Set(['Penbraya']));
    expect(shotsAt(plan, 'y11').map((s) => s.product.name)).toEqual([]);
    expect(gapsAt(plan, 'y11')).toContain('MenACWY1');
  });

  it('Penbraya + MenQuadfi: the 11-year dose is MenQuadfi, the 16-year one is Penbraya', () => {
    const plan = buildPlan(new Set(['Penbraya', 'MenQuadfi']));
    expect(shotsAt(plan, 'y11').map((s) => s.product.name)).toEqual(['MenQuadfi']);
    expect(shotsAt(plan, 'y16').map((s) => s.product.name)).toEqual(['Penbraya']);
  });
});

// The queue's "make the setting mandatory" requirement: a product that
// contains more than one antigen must SAY that every antigen in it has to
// be due, so the next Penbraya-like product cannot silently omit it. The
// declaration is load-bearing, not documentation — cover.js refuses an
// undeclared combination outright (see deliverableAt), so a missing field
// makes the product unusable rather than quietly permissive.
describe('every combination product declares that all of its antigens must be due', () => {
  const combos = PRODUCTS.filter((p) => p.covers.length > 1);

  it('has combination products to check', () => {
    expect(combos.length).toBeGreaterThan(5);
  });

  it.each(combos.map((p) => [p.name, p]))('%s declares allAntigensMustBeDue', (_name, product) => {
    expect(product.allAntigensMustBeDue).toBe(true);
  });

  // The declaration has to be load-bearing, or the test above is guarding a
  // field nothing reads \u2014 which is exactly how this repo ended up with
  // insertMinAgeDays and restrictions[] sitting in the data for months with
  // nothing consulting them. cover.js refuses an undeclared combination
  // outright, so a product added without the field is unusable rather than
  // quietly permissive. Checked by taking the field off a real product in
  // place and putting it straight back.
  it('cover.js refuses a combination product that has not declared it', () => {
    const pentacel = PRODUCTS.find((p) => p.name === 'Pentacel');
    const visit = VISITS.find((v) => v.id === 'm2');
    const due = pentacel.covers.map((c) => ({
      seriesKey: c.series,
      dose: { n: 1, at: ['m2'] },
      visit,
      prevVisit: null,
      route: 'injection',
      allowedProducts: null,
    }));
    const ticked = new Set(['Pentacel']);

    expect(deliverableAt(due, ticked).map((o) => o.product.name)).toEqual(['Pentacel']);
    try {
      delete pentacel.allAntigensMustBeDue;
      expect(deliverableAt(due, ticked)).toEqual([]);
    } finally {
      pentacel.allAntigensMustBeDue = true;
    }
    expect(deliverableAt(due, ticked).map((o) => o.product.name)).toEqual(['Pentacel']);
  });
});

// Nothing above depends on the adolescent calendar staying where it is, but
// the rule only has anything to bite on while MenACWY's booster and MenB's
// first dose share a visit. If that ever stops being true this test says so
// directly, instead of the pentavalent tests quietly passing on an empty set.
describe('the calendar still gives the two series a shared visit', () => {
  it('MenACWY dose 2 and MenB dose 1 are both due at 16 years', () => {
    const y16 = VISITS.find((v) => v.id === 'y16');
    expect(SERIES.MenACWY.doses[1].at).toContain(y16.id);
    for (const variant of SERIES.MenB.variants) {
      expect(variant.doses[0].at).toContain(y16.id);
    }
  });
});
