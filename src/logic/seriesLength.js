// For the four series where the brand sets the length of the whole series
// (Hib, rotavirus, HepB, MenB — docs/decisions.md, "found while mocking
// up"; HepB joined the other three on 2026-09-26), this is the only place
// that decides which variant applies. Settled behaviour: pick the shorter
// series and say why; the clinician can override by choosing a different
// variant directly in the UI.
//
// `ticked` is the Set of stocked product names (the formulary). Series
// without a `variants[]` array (everything except Hib/RV/HepB/MenB) simply
// pass their own `doses[]` straight through — this function is meaningful
// for all series, not just the four with a brand choice, so plan.js only
// has one path to call.
export function resolveSeriesLength(series, ticked) {
  if (!series.variants) {
    return { variant: null, doseCount: series.doses.length, doses: series.doses, note: null };
  }

  const fallback = series.variants.find((v) => v.fallback) ?? null;
  // "Any of" these products, not "all of" — for Hib/RV/MenB the list is
  // always a single product so the two read the same, but HepB's
  // monovalent variant lists two interchangeable products (Engerix-B,
  // Recombivax HB), either of which is enough to run the shorter path.
  const eligible = series.variants
    .filter((v) => !v.fallback && v.requiresAllDosesFrom.some((name) => ticked.has(name)))
    .sort((a, b) => a.doseCount - b.doseCount);

  const chosen = eligible[0] ?? fallback;
  if (!chosen) {
    // Only reachable for a series with no `fallback` variant at all (MenB)
    // when nothing eligible is stocked either — plan.js decides what to do
    // with a series nothing can currently deliver; this just reports that.
    return { variant: null, doseCount: null, doses: null, note: null };
  }

  let note = null;
  if (fallback) {
    // Hib / RV / HepB: exactly one shorter variant and one fallback. Each
    // carries its own pre-written sentence (series.js, `chosenNote`) for
    // when IT is the one actually in use — the shorter variant's version
    // when its product is stocked, the fallback's version when it isn't and
    // the series defaults to the longer path. Never phrased as "switch to
    // X instead" (Batch B, B3) — it states the current dose count first,
    // then the alternative as a fact.
    note = chosen.chosenNote ?? null;
  } else if (eligible.length > 1) {
    // MenB: no variant is a "fallback" and neither is clinically shorter —
    // both Bexsero and Trumenba are 2-dose series; the only real question is
    // which single brand the whole series commits to. If more than one is
    // stocked, pick the first in declaration order and say so plainly,
    // since there is no dose-count reason to prefer either.
    note =
      `${series.name} — ${chosen.doseCount} doses either way. You stock both ` +
      `${chosen.noun} and ${eligible[1].noun}; the plan uses ${chosen.noun}. The same ` +
      `brand must be used for both doses — the two are not interchangeable within a series.`;
  }

  return { variant: chosen, doseCount: chosen.doseCount, doses: chosen.doses, note };
}
