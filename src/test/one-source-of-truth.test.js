// CLAUDE.md: "one-source-of-truth.test.js enforces that the rulebook's dose
// counts equal the planner's." Rulebook.jsx prints, for a plain series,
// `series.doses.length`, and for a variant-bearing series, each variant's
// own `doseCount`. This test builds the exact formulary that should commit
// the planner to each of those numbers and checks plan.js actually lands on
// it — "should be trivially true," per data-design.md, "and it stops being
// true the moment somebody re-implements a rule in a screen."
//
// Item D, 2026-09-29: extends the same idea from dose counts to
// restrictions and insert-vs-CDC gaps, both ways — calling the RULEBOOK'S
// OWN rendering functions (`boosterNotes`, `insertGapNotes`), not just
// re-reading `products.js`, so a bug in how Rulebook.jsx groups or filters
// its data (not only a bug in the data itself — restrictions.test.js
// already guards that) would fail here.
import { describe, expect, it } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from '../logic/plan.js';
import { canCover } from '../logic/cover.js';
import { boosterNotes, insertGapNotes } from '../ui/Rulebook.jsx';

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
  // rule. IPV's 5-dose combination path is the one variant no brand list
  // identifies — it is reached by WHERE a product lands on the calendar,
  // not by which brand is stocked — so it names its own `reachedWith`
  // formulary and this test uses that.
  const variantCases = variantSeries.flatMap((series) =>
    series.variants.map((variant) => ({
      seriesKey: series.key,
      variant,
      ticked: new Set(
        variant.reachedWith ??
          (variant.requiresAllDosesFrom ? [variant.requiresAllDosesFrom[0]] : [])
      ),
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

// Item D: the same "one source of truth" property, extended from dose
// counts to booster restrictions. Calls `boosterNotes` — the actual
// function Rulebook.jsx renders — so a bug in ITS grouping/filtering logic
// fails here even though `restrictions.test.js` (which reads `products.js`
// directly, never calling into Rulebook.jsx) would not catch it.
describe('one source of truth — the rulebook prints a restriction iff the gate enforces it', () => {
  // Direction 1: nothing in restrictions[] is silently missing from the
  // printed page, and what IS printed is a real, enforced restriction —
  // not a fabrication introduced by a grouping bug.
  for (const product of PRODUCTS) {
    const notBoosterRestrictions = (product.restrictions ?? []).filter((r) => r.rule === 'not-booster');
    if (notBoosterRestrictions.length === 0) continue;
    const notes = boosterNotes(product);

    for (const r of notBoosterRestrictions) {
      it(`${product.name}: boosterNotes() prints its ${r.series} restriction, and cover.js actually enforces it`, () => {
        const note = notes.find((n) => n.seriesKeys.includes(r.series) && n.source === r.source);
        expect(
          note,
          `restrictions[] bars ${product.name}'s ${r.series} booster (source ${r.source}), but boosterNotes() printed no matching line`
        ).toBeDefined();
        expect(note.minAgeDays).toBe(r.minAgeDays);

        // The same synthetic-booster construction as restrictions.test.js's
        // reason-code test: an in-licence dose number, so a refusal can only
        // be explained by the restriction the rulebook just printed.
        const licensedDoseN = product.covers.find((c) => c.series === r.series).doses[0];
        const blockAge = Math.max(r.minAgeDays ?? 0, product.minAgeDays ?? 0);
        const result = canCover({
          product,
          ticked: new Set([product.name]),
          seriesKey: r.series,
          dose: { n: licensedDoseN, at: ['synthetic'], booster: true },
          visit: { id: 'synthetic', ageDays: blockAge },
          prevVisit: null,
        });
        expect(result.ok, `${product.name} prints a ${r.series} restriction cover.js does not enforce`).toBe(false);
        expect(result.reason).toBe('restricted-booster');
      });
    }
  }

  // Direction 2: nothing printed on the page is unbacked by a real
  // restrictions[] entry — boosterNotes() can only ever be reporting data
  // that's actually there, never inventing a series or a stricter age floor.
  for (const product of PRODUCTS) {
    const notes = boosterNotes(product);
    if (notes.length === 0) continue;

    it(`${product.name}: every line boosterNotes() prints traces back to a real restrictions[] entry`, () => {
      for (const note of notes) {
        for (const seriesKey of note.seriesKeys) {
          const backing = (product.restrictions ?? []).find(
            (r) => r.rule === 'not-booster' && r.series === seriesKey && r.source === note.source
          );
          expect(
            backing,
            `${product.name}'s rulebook line names ${seriesKey} (source ${note.source}) with no matching restrictions[] entry`
          ).toBeDefined();
          expect(backing.minAgeDays).toBe(note.minAgeDays);
        }
      }
    });
  }
});

// Item D: the insert-vs-CDC/ACIP age gap (products.js's own comment: "so the
// rulebook can show a gap when one exists"). Same both-ways shape as above,
// but simpler — no gate to call into, since insertMinAgeDays/insertMaxAgeDays
// are display-only fields cover.js never reads (verified: cover.js only
// touches minAgeDays/maxAgeDays). The invariant is purely "the printed gap
// and the data agree," which is what insertGapNotes() itself computes — this
// guards against the function forgetting a bound or reporting a gap that
// isn't really there.
describe('one source of truth — the rulebook prints an insert-age gap iff one exists', () => {
  for (const product of PRODUCTS) {
    const hasMinGap = product.insertMinAgeDays != null && product.insertMinAgeDays !== product.minAgeDays;
    const hasMaxGap = product.insertMaxAgeDays != null && product.insertMaxAgeDays !== product.maxAgeDays;
    if (!hasMinGap && !hasMaxGap) continue;

    it(`${product.name}: insertGapNotes() reports exactly the bounds that actually diverge`, () => {
      const notes = insertGapNotes(product);
      const bounds = notes.map((n) => n.bound);
      expect(bounds.includes('min')).toBe(hasMinGap);
      expect(bounds.includes('max')).toBe(hasMaxGap);
    });
  }

  it('has at least one real case to check (Rotavirus)', () => {
    const withGap = PRODUCTS.filter((p) => insertGapNotes(p).length > 0);
    expect(withGap.length).toBeGreaterThan(0);
  });

  for (const product of PRODUCTS) {
    const hasNoGap =
      (product.insertMinAgeDays == null || product.insertMinAgeDays === product.minAgeDays) &&
      (product.insertMaxAgeDays == null || product.insertMaxAgeDays === product.maxAgeDays);
    if (!hasNoGap) continue;

    it(`${product.name}: insertGapNotes() prints nothing when the insert and CDC/ACIP ranges agree`, () => {
      expect(insertGapNotes(product)).toEqual([]);
    });
  }
});
