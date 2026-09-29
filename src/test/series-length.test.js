// docs/data-design.md's required `series-length.test.js`: "Mixing Hib
// brands adds a dose; Rotarix 2 and RotaTeq 3; MenB is one brand
// throughout." Settled behaviour (docs/decisions.md, 2026-09-25): the app
// picks the shorter series and says why; the clinician can override.
import { describe, it, expect } from 'vitest';
import { SERIES } from '../data/series.js';
import { resolveSeriesLength } from '../logic/seriesLength.js';

describe('seriesLength.js — Hib', () => {
  it('picks PedvaxHIB’s 3-dose path when PedvaxHIB is stocked', () => {
    const result = resolveSeriesLength(SERIES.Hib, new Set(['PedvaxHIB']));
    expect(result.doseCount).toBe(3);
    expect(result.variant.id).toBe('pedvax');
    expect(result.note).toMatch(/2, 4 and 12–15 months/);
    expect(result.note).not.toMatch(/switch/i);
  });

  it('falls back to the 4-dose path when only a PRP-T product is stocked', () => {
    const result = resolveSeriesLength(SERIES.Hib, new Set(['ActHIB']));
    expect(result.doseCount).toBe(4);
    expect(result.variant.id).toBe('prpt');
  });

  it('mixing PRP-T brands (no PedvaxHIB stocked) still lands on the 4-dose path', () => {
    const result = resolveSeriesLength(SERIES.Hib, new Set(['ActHIB', 'Hiberix']));
    expect(result.doseCount).toBe(4);
    expect(result.variant.id).toBe('prpt');
  });

  it('still defaults to the shorter PedvaxHIB path when both are stocked (clinician can override to the 4-dose path)', () => {
    const result = resolveSeriesLength(SERIES.Hib, new Set(['PedvaxHIB', 'ActHIB']));
    expect(result.doseCount).toBe(3);
    expect(result.variant.id).toBe('pedvax');
  });

  it('with nothing stocked, still resolves to the fallback length — whether anything can actually deliver it is plan.js’s question, not this one’s', () => {
    const result = resolveSeriesLength(SERIES.Hib, new Set());
    expect(result.doseCount).toBe(4);
    expect(result.variant.id).toBe('prpt');
  });
});

describe('seriesLength.js — Rotavirus', () => {
  it('Rotarix is 2 doses', () => {
    const result = resolveSeriesLength(SERIES.RV, new Set(['Rotarix']));
    expect(result.doseCount).toBe(2);
  });

  it('RotaTeq is 3 doses', () => {
    const result = resolveSeriesLength(SERIES.RV, new Set(['RotaTeq']));
    expect(result.doseCount).toBe(3);
  });

  it('stocking both still defaults to Rotarix’s shorter path', () => {
    const result = resolveSeriesLength(SERIES.RV, new Set(['Rotarix', 'RotaTeq']));
    expect(result.doseCount).toBe(2);
    expect(result.variant.id).toBe('rotarix');
  });

  it('Rotarix chosen: states the current path, never invites switching to the longer one (B3)', () => {
    const result = resolveSeriesLength(SERIES.RV, new Set(['Rotarix']));
    expect(result.note).toMatch(/2 and 4 months/);
    expect(result.note).not.toMatch(/switch/i);
  });

  it('RotaTeq-only clinic: the note leads with the current dose count, not with what is missing (B3)', () => {
    const result = resolveSeriesLength(SERIES.RV, new Set(['RotaTeq']));
    expect(result.note).toBe(
      'Rotavirus — 3 doses at 2, 4 and 6 months. Any series containing a RotaTeq dose ' +
        '— or mixing the two brands — is a 3-dose series. An all-Rotarix series is 2 ' +
        'doses, at 2 and 4 months.'
    );
    expect(result.note).not.toMatch(/none of the/i);
  });
});

describe('seriesLength.js — MenB', () => {
  it('is one brand throughout — Bexsero alone resolves to Bexsero for both doses', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set(['Bexsero']));
    expect(result.doseCount).toBe(2);
    expect(result.variant.id).toBe('bexsero');
    // Item E, 2026-09-29: each variant now names a brand FAMILY, so the
    // pentavalent carrying that family's MenB component belongs in the list.
    expect(result.variant.requiresAllDosesFrom).toEqual(['Bexsero', 'Penmenvy']);
  });

  it('is one brand throughout — Trumenba alone resolves to Trumenba for both doses', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set(['Trumenba']));
    expect(result.doseCount).toBe(2);
    expect(result.variant.id).toBe('trumenba');
  });

  it('neither variant is a fallback — dose count never differs between brands', () => {
    const bexsero = SERIES.MenB.variants.find((v) => v.id === 'bexsero');
    const trumenba = SERIES.MenB.variants.find((v) => v.id === 'trumenba');
    expect(bexsero.fallback).toBeFalsy();
    expect(trumenba.fallback).toBeFalsy();
    expect(bexsero.doseCount).toBe(trumenba.doseCount);
  });

  it('stocking both families picks one and says so, since there is no dose-count reason to prefer either', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set(['Bexsero', 'Trumenba']));
    expect(result.doseCount).toBe(2);
    expect(['bexsero', 'trumenba']).toContain(result.variant.id);
    expect(result.note).toBe(
      'Meningococcal B — 2 doses either way. You stock products from both ' +
        'families: Bexsero (MenB-4C), Trumenba (MenB-FHbp). The plan uses MenB-4C. ' +
        'Both doses must come from the same family — the two are not ' +
        'interchangeable within a series.'
    );
    // B1: must state the same-family rule, never invite a mid-series switch,
    // and never repeat the seam bug where only one mention of the brand
    // dropped its trailing phrase ("Bexsero for both doses was picked").
    expect(result.note).not.toMatch(/switch/i);
    expect(result.note).not.toMatch(/for both doses was picked/i);
  });

  // Item E, 2026-09-29: the sentence above used to name each variant's
  // canonical brand. Now that a pentavalent can be the only product a clinic
  // owns from its family, naming the canonical brand would name a product
  // that is not in the fridge at all — this is that case.
  it('names the products actually stocked, not the family’s canonical brand', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set(['Penmenvy', 'Trumenba']));
    expect(result.note).toContain('Penmenvy (MenB-4C)');
    expect(result.note).not.toContain('Bexsero');
  });

  it('a pentavalent alone still makes its family available — the series is planned, not abandoned', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set(['Penbraya']));
    expect(result.variant.id).toBe('trumenba');
    expect(result.doseCount).toBe(2);
    // One family only, so there is no choice to explain.
    expect(result.note).toBeNull();
  });

  it('reports no usable variant when no MenB product at all is stocked — MenB has no fallback', () => {
    const result = resolveSeriesLength(SERIES.MenB, new Set());
    expect(result.variant).toBeNull();
    expect(result.doseCount).toBeNull();
  });
});

describe('seriesLength.js — Hepatitis B (added 2026-09-26, same pattern as Hib)', () => {
  it('is 3 doses when a monovalent product is stocked', () => {
    const result = resolveSeriesLength(SERIES.HepB, new Set(['Engerix-B']));
    expect(result.doseCount).toBe(3);
    expect(result.variant.id).toBe('monovalent');
  });

  it('either monovalent brand alone is enough — requiresAllDosesFrom means "any of", not "all of", here', () => {
    const result = resolveSeriesLength(SERIES.HepB, new Set(['Recombivax HB']));
    expect(result.doseCount).toBe(3);
  });

  it('is 4 doses when only a HepB-containing combo is stocked', () => {
    const result = resolveSeriesLength(SERIES.HepB, new Set(['Pediarix']));
    expect(result.doseCount).toBe(4);
    expect(result.variant.id).toBe('combo');
  });

  it('still defaults to the shorter monovalent path when both a monovalent product and a combo are stocked', () => {
    const result = resolveSeriesLength(SERIES.HepB, new Set(['Engerix-B', 'Pediarix']));
    expect(result.doseCount).toBe(3);
    expect(result.variant.id).toBe('monovalent');
  });

  it('Pediarix-only clinic: the note names what is actually stocked, never opens with what is absent (B3)', () => {
    const result = resolveSeriesLength(SERIES.HepB, new Set(['Pediarix']));
    expect(result.note).toMatch(/^Hepatitis B — 4 doses/);
    expect(result.note).not.toMatch(/none of the/i);
    expect(result.note).toMatch(/Pediarix or Vaxelis/);
  });
});

describe('seriesLength.js — plain series pass through untouched', () => {
  it('a series with no variants just returns its own doses', () => {
    const result = resolveSeriesLength(SERIES.DTaP, new Set(['Daptacel']));
    expect(result.variant).toBeNull();
    expect(result.doseCount).toBe(SERIES.DTaP.doses.length);
    expect(result.doses).toBe(SERIES.DTaP.doses);
    expect(result.note).toBeNull();
  });
});
