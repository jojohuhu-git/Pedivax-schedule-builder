// Item C, 2026-09-29 (docs/archive/handoff-2026-09-28-brand-indication-
// airtight-queue.md): `restrictions[]` replaced the old blunt
// `cannotBeBooster` flag, which couldn't express Pentacel's case at all ("it
// IS the 15-month booster, it must not be the 4-6-year one"). This file
// guards the two invariants the queue named for the replacement:
//
//   - the PROSE TEST — a restriction-shaped sentence in a product's
//     `facts[]` with no matching `restrictions[]` entry fails the suite,
//     and (the reverse, added here for the same reason) an entry with no
//     documenting fact fails too, so nothing here is ever untraceable to a
//     source;
//   - the REASON-CODE TEST — for each entry, `cover.js` must refuse *for
//     that named rule* (`reason: 'restricted-booster'`), isolated from
//     every numeric coincidence that happens to reach the same answer. The
//     2026-09-28 audit found every existing block except one was exactly
//     such a coincidence — the layer this file exists to stop happening
//     again.
import { describe, it, expect } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { VISITS } from '../data/visits.js';
import { canCover, restrictionBlocking } from '../logic/cover.js';

const VISIT_AGE = Object.fromEntries(VISITS.map((v) => [v.id, v.ageDays]));
const SERIES_KEYS = Object.keys(SERIES);

// A fact's `claim` (our own paraphrase, not the raw regulatory quote — the
// quote is free-text prose that doesn't reliably name series by abbreviation)
// is "restriction-shaped" when it uses one of these specific negative-
// licensing phrasings. Deliberately narrow and phrase-based, not a generic
// "not" + "booster" co-occurrence check: this codebase's clinical prose
// routinely uses both words in unrelated sentences (a CDC-vs-AAP age
// disagreement, an insert's own booster timing) without restricting
// anything — checked against every product's real facts before landing on
// this list, and it matches exactly the two real restrictions with no false
// positives. Item C's own scope is the booster restriction specifically;
// the age-ceiling half of Pentacel's fact is checked separately below,
// against `maxAgeDays` rather than a `restrictions[]` entry, because that
// half is already a deliberate, sourced field — not the kind of numeric
// coincidence this item exists to replace.
const RESTRICTION_LANGUAGE =
  /\bnot (approved|for use|used|licensed)\b|should not be used|not to be (used|given)|not indicated|not recommended/i;
const MENTIONS_BOOSTER = /\bbooster\b/i;
const AGE_CEILING_RESTRICTION = /age (\d+)\+|\b(\d+)\s*years?\s*(?:of age\s*)?(?:or older|and older|or more)/i;

function seriesMentioned(text) {
  return SERIES_KEYS.filter((key) => new RegExp(`\\b${key}\\b`).test(text));
}

describe('restrictions[] — the prose test (facts <-> field, both directions)', () => {
  for (const product of PRODUCTS) {
    for (const [i, fact] of product.facts.entries()) {
      if (RESTRICTION_LANGUAGE.test(fact.claim) && MENTIONS_BOOSTER.test(fact.claim)) {
        const named = seriesMentioned(fact.claim);
        it(`${product.name} fact #${i} names a series a restriction can be checked against`, () => {
          expect(
            named.length,
            `"${fact.claim}" reads as a booster restriction but names no series this test recognizes (${SERIES_KEYS.join(', ')})`
          ).toBeGreaterThan(0);
        });
        for (const series of named) {
          it(`${product.name} fact #${i}: restrictions[] has a not-booster entry for ${series}`, () => {
            expect(
              product.restrictions?.some((r) => r.rule === 'not-booster' && r.series === series),
              `${product.name}'s fact #${i} ("${fact.claim}") documents a ${series} booster restriction with no matching restrictions[] entry — it would print in the rulebook but never actually block anything`
            ).toBe(true);
          });
        }
      }

      const ageMatch = fact.claim.match(AGE_CEILING_RESTRICTION);
      if (ageMatch) {
        it(`${product.name} fact #${i}: age-ceiling language is reflected in maxAgeDays`, () => {
          const years = Number(ageMatch[1] ?? ageMatch[2]);
          const thresholdDays = years * 365;
          expect(
            product.maxAgeDays,
            `${product.name}'s fact #${i} ("${fact.claim}") says age ${years}+ is disallowed, but maxAgeDays is null (unbounded)`
          ).not.toBeNull();
          expect(
            product.maxAgeDays,
            `${product.name}'s fact #${i} says age ${years}+ is disallowed, but maxAgeDays (${product.maxAgeDays}) doesn't exclude it`
          ).toBeLessThan(thresholdDays);
        });
      }
    }
  }

  for (const product of PRODUCTS) {
    for (const [i, r] of (product.restrictions ?? []).entries()) {
      it(`${product.name} restrictions[${i}] (${r.series}) is documented by a fact naming that series`, () => {
        const documented = product.facts.some(
          (f) =>
            RESTRICTION_LANGUAGE.test(f.claim) &&
            MENTIONS_BOOSTER.test(f.claim) &&
            seriesMentioned(f.claim).includes(r.series)
        );
        expect(
          documented,
          `${product.name}'s restrictions[${i}] bars ${r.series}'s booster but no fact says so — an unsourced restriction`
        ).toBe(true);
      });
    }
  }
});

// Builds the exact scenario one restriction is meant to block: a booster
// dose whose NUMBER is inside the product's own dose-number licence (so a
// pass here can only be explained by the restriction, never by the numeric
// coincidence the 2026-09-28 audit found doing the work everywhere else),
// at the age the restriction names.
function licensedDoseNumber(product, series) {
  return product.covers.find((c) => c.series === series).doses[0];
}

function syntheticBoosterCheck(product, series, ageDays) {
  return canCover({
    product,
    ticked: new Set([product.name]),
    seriesKey: series,
    dose: { n: licensedDoseNumber(product, series), at: ['synthetic'], booster: true },
    visit: { id: 'synthetic', ageDays },
    prevVisit: null,
  });
}

describe('restrictions[] — the reason-code test (refuses for the named rule, not a coincidence)', () => {
  for (const product of PRODUCTS) {
    for (const [i, r] of (product.restrictions ?? []).entries()) {
      const blockAge = Math.max(r.minAgeDays ?? 0, product.minAgeDays ?? 0);

      it(`${product.name} restrictions[${i}]: refuses ${r.series}'s booster with reason 'restricted-booster', not a dose-number or window coincidence`, () => {
        const result = syntheticBoosterCheck(product, r.series, blockAge);
        expect(result.ok).toBe(false);
        expect(result.reason).toBe('restricted-booster');
        expect(result.restriction).toEqual(r);
      });

      if (r.minAgeDays != null) {
        it(`${product.name} restrictions[${i}]: does NOT block the same ${r.series} booster before its age floor — proves the age condition, not the series alone, is doing the work`, () => {
          const earlyAge = Math.max(r.minAgeDays - 30, product.minAgeDays ?? 0);
          expect(earlyAge).toBeLessThan(r.minAgeDays); // guard: the test proves nothing if this isn't actually earlier
          expect(restrictionBlocking(product, r.series, { id: 'synthetic', ageDays: earlyAge })).toBeUndefined();
          expect(syntheticBoosterCheck(product, r.series, earlyAge)).toEqual({ ok: true });
        });
      }
    }
  }
});

describe('restrictions[] — the Pentacel case this item exists for', () => {
  const pentacel = PRODUCTS.find((p) => p.name === 'Pentacel');
  const m6 = { id: 'm6', ageDays: VISIT_AGE.m6 };
  const m15 = { id: 'm15', ageDays: VISIT_AGE.m15 };
  const y4 = { id: 'y4', ageDays: VISIT_AGE.y4 };

  it('is still a legal 12-15-month DTaP booster — that IS its own dose 4, not the one being restricted', () => {
    const dtapDose4 = SERIES.DTaP.doses[3];
    expect(dtapDose4.booster).toBe(true);
    const result = canCover({
      product: pentacel,
      ticked: new Set(['Pentacel']),
      seriesKey: 'DTaP',
      dose: dtapDose4,
      visit: m15,
      prevVisit: m6,
    });
    expect(result).toEqual({ ok: true });
  });

  it('is refused as a 4-6-year DTaP booster — for the written restriction, once isolated from the dose-number licence that also (coincidentally) excludes it', () => {
    // Real dose 5 is already out of Pentacel's [1,4] DTaP licence, which is
    // exactly the coincidence the 2026-09-28 audit flagged ("Pentacel as the
    // 4y polio booster ALLOWED" for the equivalent IPV case, before item B).
    // A synthetic in-range dose number isolates the restriction itself.
    const syntheticDose4Booster = { n: 4, at: ['y4'], booster: true };
    const result = canCover({
      product: pentacel,
      ticked: new Set(['Pentacel']),
      seriesKey: 'DTaP',
      dose: syntheticDose4Booster,
      visit: y4,
      prevVisit: m15,
    });
    expect(result).toEqual({
      ok: false,
      reason: 'restricted-booster',
      restriction: { series: 'DTaP', rule: 'not-booster', minAgeDays: VISIT_AGE.y4, source: 'izPentacel' },
    });
  });
});
