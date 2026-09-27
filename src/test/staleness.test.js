// CLAUDE.md: "Every fact's `verified` date is checked... a date older than
// twelve months fails the suite. That failure is the prompt to go re-read
// the source, not a bug." No frozen-Date fixture here — this app has no
// real-clock dependency anywhere else (ages only, no calendar dates), so the
// real clock is exactly what should gate this one check.
import { describe, expect, it } from 'vitest';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';

const TWELVE_MONTHS_DAYS = 365;

function daysSince(dateStr) {
  return (Date.now() - new Date(`${dateStr}T00:00:00Z`).getTime()) / 86_400_000;
}

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

describe('staleness — every clinical fact must have been checked within the last 12 months', () => {
  const entries = allFacts();

  it('has facts to check at all (a passing empty suite would prove nothing)', () => {
    expect(entries.length).toBeGreaterThan(50);
  });

  it.each(entries)('%s', (_label, fact) => {
    expect(daysSince(fact.verified)).toBeLessThanOrEqual(TWELVE_MONTHS_DAYS);
  });
});
