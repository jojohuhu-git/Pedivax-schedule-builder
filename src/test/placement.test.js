// placement.js — the sentence under a shot explaining why the dose sits at
// the visit it does. Two independent falsehoods it must never print again
// (found 2026-09-29 while verifying item E; the defect shipped in PR #8):
//
//   1. A dose's FIRST LISTED visit treated as its earliest POSSIBLE visit.
//      MenB dose 2 is listed at 16, 17 and 18 years but must follow dose 1
//      by a minimum interval; with dose 1 at 16 years, 16 years was never
//      an option, yet the card said "Earliest due at 16 years".
//   2. "to combine with another vaccine" asserted without checking. At the
//      17-year visit that Bexsero dose is the only thing due.
//
// The last test here is the anti-drift guard: it re-checks every sentence
// the app can print, for every one- and two-product formulary, against the
// facts the sentence claims.
import { describe, it, expect } from 'vitest';
import { placementNote, earliestLegalVisitId } from '../logic/placement.js';
import { buildPlan } from '../logic/plan.js';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { PRESETS } from '../data/presets.js';
import { VISITS, VISIT_INDEX } from '../data/visits.js';
import { doseWindowOk } from '../logic/cover.js';

const byId = (id) => VISITS[VISIT_INDEX[id]];
const FEWEST = new Set(PRESETS.find((p) => p.id === 'fewest').products);
const BASICS = new Set(PRESETS.find((p) => p.id === 'basics').products);

// Every shot in a plan, paired with the two facts placementNote needs from
// its visit: does the syringe carry more than one series, and is anything
// else due at that visit at all (a shot, or a dose no stocked product
// covers).
function shotsOf(plan) {
  return plan.visits.flatMap(({ visit, injections, oral, gaps }) => {
    const allShots = [...injections, ...oral];
    return allShots.map((shot) => ({
      shot,
      visitId: visit.id,
      otherDosesDueHere: allShots.length > 1 || gaps.length > 0,
    }));
  });
}

function noteFor(plan, visitId, productName) {
  const found = shotsOf(plan).find((s) => s.visitId === visitId && s.shot.product.name === productName);
  expect(found, `no ${productName} shot at ${visitId}`).toBeDefined();
  return placementNote({
    covers: found.shot.covers,
    visitId: found.visitId,
    otherDosesDueHere: found.otherDosesDueHere,
  });
}

describe('earliestLegalVisitId — the earliest visit that could actually give a dose', () => {
  const menb = SERIES.MenB.variants.find((v) => v.id === 'bexsero');

  it('is not simply the first visit the dose is listed at', () => {
    const dose2 = menb.doses[1];
    expect(dose2.at).toEqual(['y16', 'y17', 'y18']);
    // Dose 1 given at 16 years: the 183-day floor rules 16 years out.
    expect(earliestLegalVisitId(dose2, byId('y16'))).toBe('y17');
  });

  it('is the first listed visit when nothing rules it out', () => {
    expect(earliestLegalVisitId(menb.doses[0], null)).toBe('y16');
  });

  it('moves with the previous dose — a later dose 1 pushes dose 2 later too', () => {
    expect(earliestLegalVisitId(menb.doses[1], byId('y17'))).toBe('y18');
  });
});

describe('MenB dose 2 at the 17-year visit — the reported bug', () => {
  // The exact reproduction from the report: the shipped "Fewest injections"
  // preset, 17-year visit, Bexsero dose 2 of 2.
  const plan = buildPlan(FEWEST);
  const note = noteFor(plan, 'y17', 'Bexsero');

  it('never claims 16 years was the earliest it could have been given', () => {
    expect(note).not.toMatch(/Earliest due at 16 years/);
    expect(note).not.toMatch(/as early as 16 years/);
  });

  it('never claims it was combined with anything — it is the only dose due there', () => {
    expect(note).not.toMatch(/combine|one injection covers/i);
  });

  it('says 17 years is the earliest visit that can give it, and why', () => {
    expect(note).toMatch(/17 years is the earliest visit that can give it/);
    expect(note).toMatch(/minimum interval/);
    // And it names where the dose it must follow actually landed.
    expect(note).toMatch(/16 years/);
  });
});

describe('a dose genuinely moved later to share one syringe', () => {
  // Pentacel at 15 months: Hib's booster window is {12, 15} months and
  // DTaP's is {15, 18}, so Hib really is held back to 15 months, and there
  // it really does travel in the same syringe.
  const note = noteFor(buildPlan(FEWEST), 'm15', 'Pentacel');

  it('names the earliest visit it could have had, and says one injection covers the group', () => {
    expect(note).toMatch(/as early as 12 months/);
    expect(note).toMatch(/scheduled at 15 months instead/);
    expect(note).toMatch(/one injection covers it together with the other vaccines due at that visit/);
  });
});

describe('a dose moved later that still costs its own injection', () => {
  // Hepatitis B dose 2 may land at the 1-month or the 2-month checkup. It
  // goes to 2 months, where other vaccines are already due — but Engerix-B
  // is its own injection there, so the old "without an extra injection"
  // claim was false.
  const note = noteFor(buildPlan(BASICS), 'm2', 'Engerix-B');

  it('says other vaccines are already due there, and never claims an injection was saved', () => {
    expect(note).toMatch(/as early as 1 month/);
    expect(note).toMatch(/scheduled at 2 months instead, where other vaccines are already due/);
    expect(note).not.toMatch(/combine|one injection covers|without an extra injection/i);
  });
});

describe('nothing to explain', () => {
  it('says nothing for a dose sitting at its first listed visit', () => {
    const dose = { n: 1, at: ['y16', 'y17', 'y18'] };
    expect(placementNote({ covers: [{ seriesKey: 'MenB', dose, prevVisit: null }], visitId: 'y16' })).toBeNull();
  });

  it('says nothing for a dose with only one visit to begin with', () => {
    const dose = { n: 1, at: ['m2'] };
    expect(placementNote({ covers: [{ seriesKey: 'PCV', dose, prevVisit: null }], visitId: 'm2' })).toBeNull();
  });
});

describe('a minimum age, rather than an interval, as the real reason', () => {
  it('names the minimum age instead of inventing a combination', () => {
    // Synthetic, like cover.test.js's fixtures: no real series needs this
    // branch today, and the sentence must be right the day one does.
    const dose = { n: 1, at: ['m12', 'm15'], minAgeDays: 400 };
    const note = placementNote({
      covers: [{ seriesKey: 'Synthetic', dose, prevVisit: null }],
      visitId: 'm15',
    });
    expect(note).toMatch(/Listed from 12 months/);
    expect(note).toMatch(/minimum age/);
    expect(note).toMatch(/15 months is the earliest visit that can give it/);
    expect(note).not.toMatch(/combine|one injection covers/i);
  });
});

// ── The guard ────────────────────────────────────────────────────────────
// Both halves of the old sentence were plausible-looking assertions nobody
// re-checked. This re-checks every sentence the app can produce against the
// facts it claims, so the next plausible-looking assertion fails here.
describe('every sentence the app can print is true of the plan that produced it', () => {
  const names = PRODUCTS.filter((p) => !p.retired).map((p) => p.name);
  const formularies = { ...Object.fromEntries(PRESETS.map((p) => [p.label, new Set(p.products)])) };
  formularies['every current product'] = new Set(names);
  for (const n of names) formularies[`only ${n}`] = new Set([n]);
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++)
      formularies[`${names[i]} + ${names[j]}`] = new Set([names[i], names[j]]);

  it('claims a combination only when the syringe really carries more than one series', () => {
    const lies = [];
    for (const [label, ticked] of Object.entries(formularies)) {
      for (const { shot, visitId, otherDosesDueHere } of shotsOf(buildPlan(ticked))) {
        const note = placementNote({ covers: shot.covers, visitId, otherDosesDueHere });
        if (note && /one injection covers it together/.test(note) && shot.covers.length < 2) {
          lies.push(`${label} @${visitId} ${shot.product.name}: ${note}`);
        }
      }
    }
    expect(lies).toEqual([]);
  });

  it('names an earlier visit only when that visit could really have given the dose', () => {
    const lies = [];
    for (const [label, ticked] of Object.entries(formularies)) {
      for (const { shot, visitId, otherDosesDueHere } of shotsOf(buildPlan(ticked))) {
        const note = placementNote({ covers: shot.covers, visitId, otherDosesDueHere });
        const claimed = note?.match(/as early as ([^;]+);/)?.[1];
        if (!claimed) continue;
        const target = VISITS.find((v) => v.label === claimed);
        // Some dose in this syringe must actually be givable at that visit.
        const anyLegal = shot.covers.some(
          (c) => target && c.dose.at.includes(target.id) && doseWindowOk(c.dose, target, c.prevVisit).ok
        );
        if (!anyLegal) lies.push(`${label} @${visitId} ${shot.product.name}: ${note}`);
      }
    }
    expect(lies).toEqual([]);
  });

  it('calls this visit the earliest only when no listed visit ahead of it could have given the dose', () => {
    const lies = [];
    for (const [label, ticked] of Object.entries(formularies)) {
      for (const { shot, visitId, otherDosesDueHere } of shotsOf(buildPlan(ticked))) {
        const note = placementNote({ covers: shot.covers, visitId, otherDosesDueHere });
        if (!note || !/is the earliest visit that can give it/.test(note)) continue;
        const ok = shot.covers.some((c) => earliestLegalVisitId(c.dose, c.prevVisit) === visitId);
        if (!ok) lies.push(`${label} @${visitId} ${shot.product.name}: ${note}`);
      }
    }
    expect(lies).toEqual([]);
  });
});
