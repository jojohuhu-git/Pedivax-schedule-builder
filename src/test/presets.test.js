// F1 (2026-09-26 UX queue, Batch F): both starting presets must actually
// work — every product name real and stocked, every series closed with no
// gaps. If products.js changes in a way that breaks one of these, this
// test is what catches it (nothing else exercises presets.js).
import { describe, it, expect } from 'vitest';
import { PRESETS } from '../data/presets.js';
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';

describe('PRESETS', () => {
  const ACTIVE_NAMES = new Set(PRODUCTS.filter((p) => !p.retired).map((p) => p.name));

  it('names only real, currently-stocked products', () => {
    for (const preset of PRESETS) {
      for (const name of preset.products) {
        expect(ACTIVE_NAMES.has(name), `${preset.id}: ${name}`).toBe(true);
      }
    }
  });

  it('leaves no gaps — every antigen is fully covered', () => {
    for (const preset of PRESETS) {
      const plan = buildPlan(new Set(preset.products));
      const gaps = plan.visits.flatMap((v) => v.gaps);
      expect(gaps, preset.id).toHaveLength(0);
    }
  });

  it('the fewest-injections preset actually uses fewer injections than the single-brand one', () => {
    const basics = PRESETS.find((p) => p.id === 'basics');
    const fewest = PRESETS.find((p) => p.id === 'fewest');
    const basicsInjections = scorePlan(buildPlan(new Set(basics.products))).injections;
    const fewestInjections = scorePlan(buildPlan(new Set(fewest.products))).injections;
    expect(fewestInjections).toBeLessThan(basicsInjections);
    // Verified real values (not guessed) — a change here means products.js
    // changed and these presets should be re-picked, not that the test is wrong.
    expect(basicsInjections).toBe(32);
    expect(fewestInjections).toBe(22);
  });
});
