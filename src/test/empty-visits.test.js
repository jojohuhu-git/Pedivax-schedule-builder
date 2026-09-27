// A4 (2026-09-26 UX queue): the "no vaccine due" line collapses consecutive
// same-unit ages into a range instead of listing all seventeen out.
import { describe, expect, it } from 'vitest';
import { describeEmptyVisits } from '../logic/emptyVisits.js';
import { VISITS } from '../data/visits.js';

function visitsById(...ids) {
  return ids.map((id) => VISITS.find((v) => v.id === id));
}

describe('describeEmptyVisits', () => {
  it('returns an empty string when nothing is empty', () => {
    expect(describeEmptyVisits([])).toBe('');
  });

  it('leaves a single stray age alone — not a range', () => {
    expect(describeEmptyVisits(visitsById('m9'))).toBe('9 months');
  });

  it('does not merge adjacent visits across a unit change (days into months)', () => {
    expect(describeEmptyVisits(visitsById('d3_5', 'm1'))).toBe('3–5 days and 1 month');
  });

  it('joins a run of exactly two same-unit ages with "and"', () => {
    expect(describeEmptyVisits(visitsById('y17', 'y18'))).toBe('17 and 18 years');
  });

  it('collapses a run of three or more same-unit ages into a "to" range', () => {
    expect(describeEmptyVisits(visitsById('m24', 'm30', 'y3'))).toBe('2 to 3 years');
  });

  it('reproduces the full example from the 2026-09-26 UX queue', () => {
    const ids = [
      'd3_5', 'm1', 'm9', 'm24', 'm30', 'y3', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10',
      'y13', 'y14', 'y15', 'y17', 'y18',
    ];
    expect(describeEmptyVisits(visitsById(...ids))).toBe(
      '3–5 days, 1 month, 9 months, 2 to 3 years, 5 to 10 years, 13 to 15 years, and 17 and 18 years'
    );
  });

  it('produces different ranges for a different formulary\'s empty-visit set', () => {
    // A different gap pattern (e.g. two separate runs of years split by a
    // due visit at y11) must not reuse the ranges from another formulary.
    const ids = ['m9', 'y7', 'y8', 'y9', 'y10', 'y13'];
    expect(describeEmptyVisits(visitsById(...ids))).toBe('9 months, 7 to 10 years, and 13 years');
  });
});
