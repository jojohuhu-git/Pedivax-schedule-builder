// suggest.js — "what you could add". docs/data-design.md: name products the
// clinic did NOT tick and what stocking one would save, by re-running
// plan.js itself (never an estimate) with each candidate added.
import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '../data/products.js';
import { suggest } from '../logic/suggest.js';

const ALL_NAMES = PRODUCTS.filter((p) => !p.retired).map((p) => p.name);

describe('suggest — a clinic with no combination products stocked', () => {
  const ticked = new Set(['Engerix-B', 'ActHIB', 'Daptacel', 'IPOL', 'Prevnar 20', 'Rotarix']);
  const results = suggest(ticked);

  it('leads with Vaxelis — the one product that joins DTaP+IPV+Hib+HepB at every 2/4/6-month visit', () => {
    expect(results[0]).toEqual({ product: 'Vaxelis', saves: 8 });
  });

  it('also names Pentacel and Pediarix, in descending order of savings', () => {
    const byProduct = Object.fromEntries(results.map((r) => [r.product, r.saves]));
    expect(byProduct.Pentacel).toBe(7);
    expect(byProduct.Pediarix).toBe(5);
    const savesInOrder = results.map((r) => r.saves);
    expect(savesInOrder).toEqual([...savesInOrder].sort((a, b) => b - a));
  });

  it('names PedvaxHIB too — switching Hib to its own shorter 3-dose path saves a real shot even with no combo product involved', () => {
    const byProduct = Object.fromEntries(results.map((r) => [r.product, r.saves]));
    expect(byProduct.PedvaxHIB).toBe(1);
  });

  it('never suggests a product already stocked', () => {
    for (const name of ticked) expect(results.some((r) => r.product === name)).toBe(false);
  });
});

describe('suggest — edge cases', () => {
  it('suggests nothing when every current product is already stocked', () => {
    expect(suggest(new Set(ALL_NAMES))).toEqual([]);
  });

  it('suggests nothing when nothing is stocked at all — one product alone can only add injections, never remove them from a plan with none', () => {
    expect(suggest(new Set())).toEqual([]);
  });

  it('never suggests a retired product, even from an empty formulary', () => {
    const results = suggest(new Set());
    expect(results.some((r) => r.product === 'Prevnar 13')).toBe(false);
  });
});

describe('suggest — never reports a negative saving, for any formulary', () => {
  it('every unticked product either helps or does nothing, across every single-product-removed formulary', () => {
    const formularies = [new Set(ALL_NAMES), ...ALL_NAMES.map((name) => new Set(ALL_NAMES.filter((n) => n !== name)))];
    for (const ticked of formularies) {
      for (const r of suggest(ticked)) {
        expect(r.saves, `${r.product} on formulary missing nothing in particular`).toBeGreaterThan(0);
      }
    }
  });
});
