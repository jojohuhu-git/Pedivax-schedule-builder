// F2 (2026-09-26 UX queue, Batch F): fixFor(ticked, seriesKey, doseN)
// answers "which unstocked product would close this specific gap." Values
// below are read straight from a real buildPlan() run, not guessed.
import { describe, it, expect } from 'vitest';
import { fixFor, fixesForSeries } from '../logic/fixGap.js';
import { buildPlan } from '../logic/plan.js';
import { PRODUCTS } from '../data/products.js';

const GAPPY_FORMULARY = new Set(['Daptacel', 'IPOL', 'ActHIB', 'Prevnar 20', 'Rotarix', 'Engerix-B']);

describe('fixFor', () => {
  it('confirms the fixture formulary actually gaps the doses these tests use', () => {
    const gaps = buildPlan(GAPPY_FORMULARY)
      .visits.flatMap((v) => v.gaps)
      .map((g) => `${g.seriesKey} dose ${g.dose.n}`);
    for (const dose of ['MMR dose 1', 'VAR dose 1', 'HepA dose 1', 'Tdap dose 1', 'HPV dose 1', 'MenACWY dose 1']) {
      expect(gaps).toContain(dose);
    }
  });

  it('names a real product that closes a plain single-series gap', () => {
    expect(fixFor(GAPPY_FORMULARY, 'HepA', 1)).toBe('Havrix');
    expect(fixFor(GAPPY_FORMULARY, 'Tdap', 1)).toBe('Adacel');
    expect(fixFor(GAPPY_FORMULARY, 'MenACWY', 1)).toBe('MenQuadfi');
  });

  it('prefers a combination product when it closes two gaps in one shot, over a single-antigen product that only closes one', () => {
    // Varivax alone would close VAR dose 1 but leave MMR dose 1 still gapped
    // (needing a separate M-M-R II shot later); ProQuad closes both at once,
    // for fewer total injections — the same fewest-needles goal plan.js
    // itself optimizes for.
    expect(fixFor(GAPPY_FORMULARY, 'VAR', 1)).toBe('ProQuad');
  });

  it('never suggests a product the clinic already stocks', () => {
    const fix = fixFor(GAPPY_FORMULARY, 'HepA', 1);
    expect(GAPPY_FORMULARY.has(fix)).toBe(false);
  });

  it('returns null once every candidate for a series is already stocked — nothing left to suggest', () => {
    const everyProduct = new Set(PRODUCTS.filter((p) => !p.retired).map((p) => p.name));
    expect(fixFor(everyProduct, 'DTaP', 1)).toBeNull();
  });
});

describe('fixesForSeries', () => {
  // The batched form Plan.jsx actually calls: one buildPlan() per candidate
  // product, not one per candidate per dose — an empty formulary gaps every
  // dose of every series at once, and the per-dose version made that render
  // slow enough to time out a real test (see Plan.jsx / App.jsx callers).
  it('answers every gapped dose of a series from the same candidate search', () => {
    const fixes = fixesForSeries(GAPPY_FORMULARY, 'HepA', [1, 2]);
    expect(fixes).toEqual({ 1: 'Havrix', 2: 'Havrix' });
  });

  it('agrees with the single-dose fixFor wrapper', () => {
    const fixes = fixesForSeries(GAPPY_FORMULARY, 'MenACWY', [1, 2]);
    expect(fixes[1]).toBe(fixFor(GAPPY_FORMULARY, 'MenACWY', 1));
  });
});

// Item B (2026-09-28 brand-indication queue). Ranking candidates by
// injections alone suggested a product that closed the named gap while
// opening the same number of gaps elsewhere.
describe('a fix must not trade one gap for another', () => {
  it('sends a Pentacel-only clinic to Quadracel, not Kinrix, for the last polio dose', () => {
    const ticked = new Set(['Pentacel']);
    // Kinrix is licensed for the FOURTH polio dose; a Pentacel child's
    // 4-6 year shot is their fifth, which is what Quadracel is for.
    expect(fixFor(ticked, 'IPV', 5)).toBe('Quadracel');
    const withKinrix = buildPlan(new Set([...ticked, 'Kinrix']));
    const withQuadracel = buildPlan(new Set([...ticked, 'Quadracel']));
    const gaps = (plan) => plan.visits.flatMap((v) => v.gaps).length;
    expect(gaps(withKinrix)).toBe(gaps(buildPlan(ticked)));
    expect(gaps(withQuadracel)).toBeLessThan(gaps(buildPlan(ticked)));
  });
});
