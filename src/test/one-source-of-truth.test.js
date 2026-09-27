// CLAUDE.md: "one-source-of-truth.test.js enforces that the rulebook's dose
// counts equal the planner's." Rulebook.jsx prints, for a plain series,
// `series.doses.length`, and for a variant-bearing series, each variant's
// own `doseCount`. This test builds the exact formulary that should commit
// the planner to each of those numbers and checks plan.js actually lands on
// it — "should be trivially true," per data-design.md, "and it stops being
// true the moment somebody re-implements a rule in a screen."
import { describe, expect, it } from 'vitest';
import { SERIES } from '../data/series.js';
import { buildPlan } from '../logic/plan.js';

describe('one source of truth — the rulebook and the planner agree on every dose count', () => {
  const plainSeries = Object.values(SERIES).filter((s) => !s.variants);
  const variantSeries = Object.values(SERIES).filter((s) => s.variants);

  it('has both plain and variant-bearing series to check', () => {
    expect(plainSeries.length).toBeGreaterThan(0);
    expect(variantSeries.length).toBeGreaterThan(0);
  });

  it.each(plainSeries.map((s) => [s.key, s]))(
    '%s: the rulebook dose count matches an otherwise-empty formulary\'s plan',
    (key, series) => {
      const plan = buildPlan(new Set());
      expect(plan.placements[key].doses.length).toBe(series.doses.length);
    }
  );

  // For each variant, tick exactly the formulary that should commit the
  // planner to it: one of its named products, or (for the fallback variant,
  // which names none) nothing at all — resolveSeriesLength's own fallback
  // rule.
  const variantCases = variantSeries.flatMap((series) =>
    series.variants.map((variant) => ({
      seriesKey: series.key,
      variant,
      ticked: variant.requiresAllDosesFrom ? new Set([variant.requiresAllDosesFrom[0]]) : new Set(),
    }))
  );

  it.each(variantCases.map((c) => [`${c.seriesKey} — ${c.variant.label}`, c]))(
    "%s: the rulebook's dose count matches the planner's",
    (_label, { seriesKey, variant, ticked }) => {
      const plan = buildPlan(ticked);
      expect(plan.placements[seriesKey]).toBeDefined();
      expect(plan.placements[seriesKey].doses.length).toBe(variant.doseCount);
    }
  );
});
