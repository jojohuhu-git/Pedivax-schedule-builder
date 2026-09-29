// F2 (2026-09-26 UX queue, Batch F): "Nothing covers DTaP dose 5 · Add
// Kinrix" — plan.js already knows a dose has no covering product (that's
// what a gap is); this answers the next question, "which unstocked product
// would close THIS gap," the same way suggest.js answers "which unstocked
// product would save an injection": re-run plan.js with one candidate added
// and see what changed. A gap is a yes/no question (still gapped or not),
// not a saved-injections count, so this can't just reuse suggest()'s list —
// a product that fills a gap adds a shot where there was none; it may not
// "save" anything by suggest.js's own definition.
//
// Batched by series, not by individual dose: an empty formulary gaps every
// dose of every series at once, and Plan.jsx already groups gap rows by
// series (gapsBySeries) — checking one hypothetical plan per candidate
// product answers every one of that series's gapped doses in a single
// buildPlan() call, instead of re-running it once per dose per candidate.
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from './plan.js';
import { scorePlan } from './score.js';

// doseNumbers: the dose numbers of `seriesKey` currently gapped (Plan.jsx
// already has this from gapsBySeries). Returns { [doseNumber]: productName
// | null } — the unstocked product that closes that dose, if any.
//
// Candidates are ranked the way plan.js's own `isBetter` ranks plans:
// fewest REMAINING GAPS across the whole schedule first, then fewest
// injections, then name for a stable answer. Gaps have to come first
// because closing one gap can open another: a Pentacel-only clinic is
// missing the 4-6 year DTaP and polio doses, and adding Kinrix closes them
// but takes the 15-month Pentacel shot away (Kinrix can only give the
// FOURTH polio dose, so polio drops back to a 4-dose series and Pentacel's
// 15-month polio content no longer has a dose to be) — leaving exactly as
// many gaps as before, just somewhere else. Quadracel, licensed for the
// fourth OR fifth polio dose, actually finishes the schedule. Ranking on
// injections alone preferred Kinrix, because a plan that gives up on two
// doses needs fewer needles than one that gives them.
export function fixesForSeries(ticked, seriesKey, doseNumbers) {
  const candidates = PRODUCTS.filter(
    (p) => !p.retired && !ticked.has(p.name) && p.covers.some((c) => c.series === seriesKey)
  );

  const best = new Map(doseNumbers.map((n) => [n, null]));

  for (const product of candidates) {
    const withProduct = new Set(ticked);
    withProduct.add(product.name);
    const plan = buildPlan(withProduct);
    const allGaps = plan.visits.flatMap((v) => v.gaps);
    const stillGapped = new Set(
      allGaps.filter((g) => g.seriesKey === seriesKey).map((g) => g.dose.n)
    );
    const gaps = allGaps.length;
    const injections = scorePlan(plan).injections;

    for (const doseN of doseNumbers) {
      if (stillGapped.has(doseN)) continue;
      const current = best.get(doseN);
      const better =
        !current ||
        gaps < current.gaps ||
        (gaps === current.gaps &&
          (injections < current.injections ||
            (injections === current.injections && product.name < current.product)));
      if (better) best.set(doseN, { product: product.name, gaps, injections });
    }
  }

  return Object.fromEntries([...best].map(([doseN, b]) => [doseN, b?.product ?? null]));
}

// Single-dose convenience wrapper, kept for callers that only need one
// answer — internally still the batched search above.
export function fixFor(ticked, seriesKey, doseN) {
  return fixesForSeries(ticked, seriesKey, [doseN])[doseN];
}
