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
  //
  // A variant that names no products at all is always available: IPV's
  // standard 4-dose path is open to every polio product, and which path a
  // clinic ends up on depends on where its products land on the calendar,
  // not on which brand it buys (series.js, IPV). Being always available it
  // is also always the preferred pick here, which is right — it is the
  // shorter of the two, and plan.js only moves to the longer path when the
  // shorter one would actually cost an injection.
  const eligible = series.variants
    .filter((v) => !v.fallback && (v.requiresAllDosesFrom ?? []).some((name) => ticked.has(name)))
    .concat(series.variants.filter((v) => !v.fallback && !v.requiresAllDosesFrom))
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
    // both families are 2-dose series; the only real question is which one
    // the whole series commits to. If products from more than one family
    // are stocked, pick the first in declaration order and say so plainly,
    // since there is no dose-count reason to prefer either.
    note = familyChoiceNote(series, ticked, chosen);
  }

  return { variant: chosen, doseCount: chosen.doseCount, doses: chosen.doses, note };
}

// Which of a variant's named products this clinic actually stocks.
function stockedFrom(variant, ticked) {
  return (variant.requiresAllDosesFrom ?? []).filter((name) => ticked.has(name));
}

function listOf(names) {
  if (names.length < 2) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// The sentence for a series whose variants are brand FAMILIES rather than
// single brands — MenB, and only MenB today.
//
// Item E, 2026-09-29: this used to read "You stock both Bexsero and
// Trumenba; the plan uses Bexsero," naming each variant's canonical brand.
// Once the pentavalents joined the variants' product lists that sentence
// could name a brand the clinic doesn't own at all — a clinic stocking
// Penmenvy and Trumenba would have been told the plan uses Bexsero. So it
// now names the stocked products and the family, and says which FAMILY is
// in use rather than a brand that may not be the one giving the dose.
//
// `chosen` is passed in rather than re-derived because for MenB the final
// say belongs to plan.js's cluster search, not to this file — the search
// can prefer the other family when that one closes the series and this
// one leaves a gap. plan.js re-calls this with the family it actually
// landed on (see buildPlan's seriesNotes).
export function familyChoiceNote(series, ticked, chosen) {
  const others = series.variants.filter(
    (v) => v !== chosen && stockedFrom(v, ticked).length > 0
  );
  if (others.length === 0) return null;
  // A colon-led list, not "X and Y and Z": a single family can itself hold
  // two stocked brands (Bexsero and Penmenvy are both 4C), and joining the
  // families with "and" as well then reads as one flat run-on — "You stock
  // Bexsero and Penmenvy (MenB-4C) and Penbraya (MenB-FHbp)". The colon
  // keeps the two levels apart at a glance.
  const describe = (v) => `${listOf(stockedFrom(v, ticked))} (${v.family})`;
  return (
    `${series.name} — ${chosen.doseCount} doses either way. You stock products from ` +
    `both families: ${[chosen, ...others].map(describe).join(', ')}. The plan uses ` +
    `${chosen.family}. Both doses must come from the same family — the two are not ` +
    `interchangeable within a series.`
  );
}
