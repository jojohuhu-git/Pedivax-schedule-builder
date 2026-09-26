// For the three series where the brand sets the length of the whole series
// (Hib, rotavirus, MenB — docs/decisions.md, "found while mocking up"),
// this is the only place that decides which variant applies. Settled
// behaviour: pick the shorter series and say why; the clinician can
// override by choosing a different variant directly in the UI.
//
// `ticked` is the Set of stocked product names (the formulary). Series
// without a `variants[]` array (everything except Hib/RV/MenB) simply pass
// their own `doses[]` straight through — this function is meaningful for
// all series, not just the three with a brand choice, so plan.js only has
// one path to call.
export function resolveSeriesLength(series, ticked) {
  if (!series.variants) {
    return { variant: null, doseCount: series.doses.length, doses: series.doses, note: null };
  }

  const fallback = series.variants.find((v) => v.fallback) ?? null;
  const eligible = series.variants
    .filter((v) => !v.fallback && v.requiresAllDosesFrom.every((name) => ticked.has(name)))
    .sort((a, b) => a.doseCount - b.doseCount);

  const chosen = eligible[0] ?? fallback;
  if (!chosen) {
    // Only reachable for a series with no `fallback` variant at all (MenB)
    // when nothing eligible is stocked either — plan.js decides what to do
    // with a series nothing can currently deliver; this just reports that.
    return { variant: null, doseCount: null, doses: null, note: null };
  }

  let note = null;
  if (chosen !== fallback && fallback) {
    note =
      `${chosen.label} is the shorter path — ${chosen.doseCount} doses instead of ` +
      `${fallback.doseCount}. The clinician can switch to ${fallback.label} instead.`;
  } else if (chosen === fallback && eligible.length === 0 && series.variants.some((v) => !v.fallback)) {
    note =
      `None of the shorter-series products are stocked, so this uses ${chosen.label} ` +
      `(${chosen.doseCount} doses).`;
  } else if (!fallback) {
    // MenB: no variant is a "fallback" and neither is clinically shorter —
    // both Bexsero and Trumenba are 2-dose series; the only real question is
    // which single brand the whole series commits to. If more than one is
    // stocked, pick the first in declaration order and say so plainly,
    // since there is no dose-count reason to prefer either.
    if (eligible.length > 1) {
      note =
        `${chosen.label} and ${eligible[1].label.replace(' for both doses', '')} are both ` +
        `2-dose series with no length difference — ${chosen.label} was picked; the ` +
        `clinician can switch to the other brand instead.`;
    }
  }

  return { variant: chosen, doseCount: chosen.doseCount, doses: chosen.doses, note };
}
