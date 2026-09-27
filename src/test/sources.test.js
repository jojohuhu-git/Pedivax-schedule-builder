// CLAUDE.md / docs/data-design.md: every `source` key referenced by a fact
// must resolve in SOURCES; every source must carry enough to cite (label,
// edition, url, snapshot, tier); and "a package insert may fill a gap, never
// narrow a rule an organization has already made." That last rule is
// mechanical, not just a naming convention: cover.js's canCover() is the
// single place a product's age licence is enforced, and it reads
// `minAgeDays`/`maxAgeDays` only — never `insertMinAgeDays`/
// `insertMaxAgeDays`. Those insert-only fields exist purely so the rulebook
// can show the gap; this test proves they can never change a scheduling
// decision, for any product, at any dose it's licensed for.
import { describe, expect, it } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { SOURCES } from '../data/sources.js';
import { VISITS } from '../data/visits.js';
import { canCover } from '../logic/cover.js';

function allFacts() {
  const entries = [];
  for (const series of Object.values(SERIES)) {
    series.facts.forEach((fact, i) => entries.push([`series ${series.key} fact ${i}`, fact]));
  }
  for (const product of PRODUCTS) {
    product.facts.forEach((fact, i) => entries.push([`product ${product.name} fact ${i}`, fact]));
  }
  return entries;
}

describe('sources — every fact cites a real, complete source', () => {
  const entries = allFacts();

  it('has facts to check at all', () => {
    expect(entries.length).toBeGreaterThan(50);
  });

  it.each(entries)('%s cites a source key that exists in SOURCES', (_label, fact) => {
    expect(SOURCES[fact.source]).toBeDefined();
  });

  it.each(Object.entries(SOURCES))('SOURCES.%s has everything needed to cite it', (_key, source) => {
    expect(source.label).toBeTruthy();
    expect(source.edition).toBeTruthy();
    expect(source.url).toMatch(/^https?:\/\//);
    expect(source.snapshot).toBeTruthy();
    expect(['organization', 'insert']).toContain(source.tier);
  });
});

// One dose per (product, series-coverage) pair, from either the plain
// `doses[]` or every variant's `doses[]` — a flat pool is fine here since
// we're only asking "does mutating the insert-only fields change the
// outcome for this dose number at this visit," not resolving which variant
// actually applies.
function candidateDoses(seriesKey) {
  const series = SERIES[seriesKey];
  return series.variants ? series.variants.flatMap((v) => v.doses) : series.doses;
}

describe('sources — a package insert can fill a gap but never narrow an organization rule', () => {
  const withInsertAges = PRODUCTS.filter(
    (p) => p.insertMinAgeDays != null || p.insertMaxAgeDays != null
  );

  it('has products with a recorded insert age to check at all', () => {
    expect(withInsertAges.length).toBeGreaterThan(5);
  });

  it.each(withInsertAges.map((p) => [p.name, p]))(
    "%s's insert-only ages never change what canCover() allows",
    (_name, product) => {
      // A hostile mutation: an insert that claimed to start almost 3000
      // years from now and end at birth. If canCover() ever consulted these
      // fields, this product would stop covering everything it covers today.
      const mutated = { ...product, insertMinAgeDays: 999_999, insertMaxAgeDays: 0 };
      let checked = 0;
      for (const coverage of product.covers) {
        for (const dose of candidateDoses(coverage.series)) {
          if (dose.n < coverage.doses[0] || dose.n > coverage.doses[1]) continue;
          for (const visitId of dose.at) {
            const visit = VISITS.find((v) => v.id === visitId);
            const ticked = new Set([product.name]);
            const args = (p) => ({
              product: p,
              ticked,
              seriesKey: coverage.series,
              dose,
              visit,
              prevVisit: null,
            });
            const before = canCover(args(product));
            const after = canCover(args(mutated));
            expect(after).toEqual(before);
            checked++;
          }
        }
      }
      expect(checked).toBeGreaterThan(0);
    }
  );
});
