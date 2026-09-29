// Exhaustive product x series x dose-number licence check (docs/data-
// design.md's required `cover.test.js`), plus focused tests for each of
// cover.js's other gates (stocked/retired, product age bounds, dose
// windows, the booster bar, and the "lineage never blocks" invariant).
import { describe, it, expect } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { VISITS } from '../data/visits.js';
import { canCover } from '../logic/cover.js';

const VISIT_AGE = Object.fromEntries(VISITS.map((v) => [v.id, v.ageDays]));

// For one product and one dose definition, find a visit in the dose's own
// `at` list that also sits inside the PRODUCT's own age window — proof that
// some real visit exists where this product could legally give this dose —
// and a synthetic "previous dose" visit placed comfortably before it, only
// so a `minIntervalFromPrevDays` floor has something to measure from.
// Deliberately not a full chained schedule: whether a chain of real doses
// from possibly-different products stays internally consistent is
// plan.js/needles-vs-visits territory, not this licence check.
function findLegalVisit(dose, product) {
  const loAge = Math.max(dose.minAgeDays ?? 0, product.minAgeDays ?? 0);
  const hiAge = Math.min(dose.maxAgeDays ?? Infinity, product.maxAgeDays ?? Infinity);
  const id = dose.at.find((visitId) => {
    const age = VISIT_AGE[visitId];
    return age >= loAge && age <= hiAge;
  });
  if (!id) return null;
  return { id, ageDays: VISIT_AGE[id] };
}

function syntheticPrevVisit(dose, visit) {
  if (dose.minIntervalFromPrevDays == null) return null;
  return { id: '__synthetic-prev__', ageDays: visit.ageDays - dose.minIntervalFromPrevDays - 1000 };
}

// Which variant (or plain doses[]) a given product actually commits a
// brand-length-setting series to, so the schedule built for that product
// matches what it would really receive.
// Every dose list a product could find itself giving a dose from, most
// likely path first. A dose NUMBER does not mean the same thing in every
// path — IPV dose 4 is the 4-6 year booster on the standard path but the
// 15-18 month extra dose on the combination path (series.js, IPV) — so a
// product's declared licence for dose n is satisfied if ANY path of the
// series has a legal place for it. Which path a product is actually
// allowed to serve is plan.js's job (its `allowedProducts`), not
// cover.js's; this file only proves the licence is exercisable at all.
function doseListsForProduct(series, product, seriesKey) {
  if (!series.variants) return [series.doses];
  const preferred = [];
  const bySelf = series.variants.find((v) => v.requiresAllDosesFrom?.includes(product.name));
  if (bySelf) preferred.push(bySelf.doses);
  const count = product.setsSeriesLength?.[seriesKey];
  const byCount = count != null ? series.variants.find((v) => v.doseCount === count) : null;
  if (byCount) preferred.push(byCount.doses);
  const rest = series.variants.map((v) => v.doses).filter((d) => !preferred.includes(d));
  return [...preferred, ...rest];
}

describe('cover.js — exhaustive product x series x dose-number licence', () => {
  for (const product of PRODUCTS) {
    for (const coverage of product.covers) {
      const { series: seriesKey, doses: [lo, hi] } = coverage;
      const series = SERIES[seriesKey];
      const doseLists = doseListsForProduct(series, product, seriesKey);
      // The below-/above-licence checks below read the most likely path —
      // "one dose number outside the licence" only means something against
      // a single numbering.
      const doses = doseLists[0];
      const ticked = new Set([product.name]);
      // Cap at the doses the series actually defines on its longest path —
      // a product's own licence can reach a dose number no path uses, and
      // there is no dose definition to test past that.
      const cappedHi = Math.min(hi, Math.max(...doseLists.map((d) => d.length)));

      for (let n = lo; n <= cappedHi; n++) {
        const testName = product.retired
          ? `${product.name} (retired) may NOT give ${seriesKey} dose ${n}`
          : `${product.name} may give ${seriesKey} dose ${n} (licensed ${lo}-${hi})`;
        it(testName, () => {
          const tried = [];
          let found = null;
          for (const doses of doseLists) {
            const dose = doses[n - 1];
            if (!dose) continue;
            tried.push(dose.at.join('/'));
            const visit = findLegalVisit(dose, product);
            if (visit) {
              found = { dose, visit };
              break;
            }
          }
          expect(
            found,
            `no visit in ${tried.join(' or ')} fits both the dose window and ${product.name}'s own age range`
          ).not.toBeNull();
          const result = canCover({
            product,
            ticked,
            seriesKey,
            dose: found.dose,
            visit: found.visit,
            prevVisit: syntheticPrevVisit(found.dose, found.visit),
          });
          if (product.retired) {
            expect(result).toEqual({ ok: false, reason: 'retired' });
          } else {
            expect(result.ok, JSON.stringify(result)).toBe(true);
          }
        });
      }

      const belowRange = lo > 1 && lo - 1 <= doses.length ? doses[lo - 2] : null;
      if (belowRange && !product.retired) {
        it(`${product.name} may NOT give ${seriesKey} dose ${belowRange.n} (below its licence)`, () => {
          const visit = findLegalVisit(belowRange, product) ?? {
            id: belowRange.at[0],
            ageDays: VISIT_AGE[belowRange.at[0]],
          };
          const result = canCover({
            product,
            ticked,
            seriesKey,
            dose: belowRange,
            visit,
            prevVisit: syntheticPrevVisit(belowRange, visit),
          });
          expect(result).toEqual({ ok: false, reason: 'dose-number-not-licensed' });
        });
      }

      const aboveRange = hi < doses.length && !product.retired ? doses[hi] : null;
      if (aboveRange) {
        it(`${product.name} may NOT give ${seriesKey} dose ${aboveRange.n} (above its licence)`, () => {
          const visit = findLegalVisit(aboveRange, product) ?? {
            id: aboveRange.at[0],
            ageDays: VISIT_AGE[aboveRange.at[0]],
          };
          const result = canCover({
            product,
            ticked,
            seriesKey,
            dose: aboveRange,
            visit,
            prevVisit: syntheticPrevVisit(aboveRange, visit),
          });
          expect(result).toEqual({ ok: false, reason: 'dose-number-not-licensed' });
        });
      }
    }
  }
});

describe('cover.js — the other gates', () => {
  const daptacel = PRODUCTS.find((p) => p.name === 'Daptacel');
  const dtapDose1 = SERIES.DTaP.doses[0]; // { n:1, at:['m2'], minAgeDays:42 }
  const m2 = { id: 'm2', ageDays: VISIT_AGE.m2 };
  const m4 = { id: 'm4', ageDays: VISIT_AGE.m4 };

  it('refuses a product that is not ticked', () => {
    const result = canCover({
      product: daptacel,
      ticked: new Set(),
      seriesKey: 'DTaP',
      dose: dtapDose1,
      visit: m2,
      prevVisit: null,
    });
    expect(result).toEqual({ ok: false, reason: 'not-stocked' });
  });

  it('refuses a retired product even if ticked', () => {
    const retired = { ...daptacel, retired: '2020-01-01' };
    const result = canCover({
      product: retired,
      ticked: new Set([retired.name]),
      seriesKey: 'DTaP',
      dose: dtapDose1,
      visit: m2,
      prevVisit: null,
    });
    expect(result).toEqual({ ok: false, reason: 'retired' });
  });

  it('refuses a series the product does not cover at all', () => {
    const result = canCover({
      product: daptacel,
      ticked: new Set([daptacel.name]),
      seriesKey: 'IPV',
      dose: SERIES.IPV.variants[0].doses[0],
      visit: m2,
      prevVisit: null,
    });
    expect(result).toEqual({ ok: false, reason: 'series-not-covered' });
  });

  it('refuses a visit that is not one of the dose’s nominal windows', () => {
    // dose 1's `at` is ['m2'] only — m4 is not a legal place for it.
    const result = canCover({
      product: daptacel,
      ticked: new Set([daptacel.name]),
      seriesKey: 'DTaP',
      dose: dtapDose1,
      visit: m4,
      prevVisit: null,
    });
    expect(result).toEqual({ ok: false, reason: 'not-a-nominal-visit-for-this-dose' });
  });

  it('refuses a dose placed before its own minimum interval from the previous dose', () => {
    const dtapDose2 = SERIES.DTaP.doses[1]; // minIntervalFromPrevDays: 28
    const tooSoon = { id: 'm4', ageDays: VISIT_AGE.m2 + 10 }; // fake: only 10 days after dose 1
    const result = canCover({
      product: daptacel,
      ticked: new Set([daptacel.name]),
      seriesKey: 'DTaP',
      dose: dtapDose2,
      visit: tooSoon,
      prevVisit: m2,
    });
    expect(result).toEqual({ ok: false, reason: 'interval-too-short' });
  });

  it('refuses a dose that needs an interval but has no previous dose to measure from', () => {
    const dtapDose2 = SERIES.DTaP.doses[1];
    const result = canCover({
      product: daptacel,
      ticked: new Set([daptacel.name]),
      seriesKey: 'DTaP',
      dose: dtapDose2,
      visit: m4,
      prevVisit: null,
    });
    expect(result).toEqual({ ok: false, reason: 'no-previous-dose-to-measure-interval-from' });
  });

  it('refuses a visit outside the PRODUCT’s own age window, even on a nominal series visit', () => {
    const kinrix = PRODUCTS.find((p) => p.name === 'Kinrix');
    const dtapDose5 = SERIES.DTaP.doses[4];
    const tooYoung = { id: 'y4', ageDays: kinrix.minAgeDays - 1 };
    const result = canCover({
      product: kinrix,
      ticked: new Set([kinrix.name]),
      seriesKey: 'DTaP',
      dose: dtapDose5,
      visit: tooYoung,
      prevVisit: { id: 'm15', ageDays: VISIT_AGE.m15 },
    });
    expect(result).toEqual({ ok: false, reason: 'visit-too-young-for-product' });
  });

  it('never refuses on lineage grounds — lineage is a preference, never a bar (decisions.md)', () => {
    const kinrix = PRODUCTS.find((p) => p.name === 'Kinrix');
    expect(kinrix.lineage).not.toBeNull(); // sanity: this product does carry a preference
    const dtapDose5 = SERIES.DTaP.doses[4];
    const y4 = { id: 'y4', ageDays: VISIT_AGE.y4 };
    const prevVisit = { id: 'm15', ageDays: VISIT_AGE.m15 };
    // No prior brand is ticked at all — the escape-clause case — and it
    // still succeeds, because cover.js never even reads `lineage`.
    const result = canCover({
      product: kinrix,
      ticked: new Set([kinrix.name]),
      seriesKey: 'DTaP',
      dose: dtapDose5,
      visit: y4,
      prevVisit,
    });
    expect(result).toEqual({ ok: true });
  });

  it('bars a product from being a series’ booster dose when cannotBeBooster names that series', () => {
    const vaxelis = PRODUCTS.find((p) => p.name === 'Vaxelis');
    expect(vaxelis.cannotBeBooster).toContain('Hib');
    // Vaxelis's real dose-number licence (1-3) already excludes Hib's real
    // booster (dose 4), so this uses a synthetic booster-flagged dose to
    // isolate the cannotBeBooster check itself, per the fuller citation
    // recorded in products.js (izVaxelis).
    const syntheticBoosterDose = { n: 2, at: ['m4'], booster: true };
    const result = canCover({
      product: vaxelis,
      ticked: new Set([vaxelis.name]),
      seriesKey: 'Hib',
      dose: syntheticBoosterDose,
      visit: m4,
      prevVisit: m2,
    });
    expect(result).toEqual({ ok: false, reason: 'cannot-be-booster' });
  });
});
