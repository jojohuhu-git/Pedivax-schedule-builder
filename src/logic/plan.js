// Builds the schedule from cover.js + seriesLength.js — docs/data-design.md's
// `plan.js`. This is the one real optimization problem in the app: fewest
// injections is the score (docs/decisions.md), and a dose may be shifted to
// a later visit inside its own legal window to catch a combination product.
//
// Why this needs an actual search, not just "place every dose at its
// earliest legal visit": Hib's toddler booster window is {m12,m15} but
// DTaP's is {m15,m18} — placed independently at each series' own earliest
// visit, Hib lands at 12 months and DTaP at 15, and Pentacel (which covers
// both, plus IPV) never gets a visit where all three are actually due. Only
// {m15,m15} lets one Pentacel injection replace three separate shots. So
// series that share a combination product must have their flexible doses
// chosen JOINTLY, not one series at a time.
//
// The search stays small because of the data's own shape: only a handful of
// doses across all 13 series have more than one nominal `at` visit, and only
// two small groups of series ever share a combination product — DTaP/IPV/
// Hib/HepB (Pediarix, Pentacel, Vaxelis, Kinrix, Quadracel) and MMR/VAR
// (ProQuad). Series outside a shared-product group can't have their visit
// choice change the injection count at all (no product would ever cover two
// of their doses at once), so they're searched the same way — as a
// cluster of one — and it's cheap: the exhaustive per-cluster search below
// is a few hundred combinations at most, not a real optimization engine.
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { VISITS, VISIT_INDEX } from '../data/visits.js';
import { resolveSeriesLength } from './seriesLength.js';
import { canCover, doseWindowOk } from './cover.js';

function visitById(id) {
  return VISITS[VISIT_INDEX[id]];
}

// Union-find over series, connected when some product's `covers` names both
// — structural (built from every product, not just stocked ones) so cluster
// shape doesn't change as a formulary is ticked/unticked; an unstocked
// combination just never gets chosen by the search below.
function buildClusters(seriesKeys) {
  const parent = Object.fromEntries(seriesKeys.map((k) => [k, k]));
  function find(k) {
    while (parent[k] !== k) {
      parent[k] = parent[parent[k]];
      k = parent[k];
    }
    return k;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  for (const product of PRODUCTS) {
    const keys = product.covers.map((c) => c.series).filter((s) => seriesKeys.includes(s));
    for (let i = 1; i < keys.length; i++) union(keys[0], keys[i]);
  }
  const groups = {};
  for (const k of seriesKeys) {
    const root = find(k);
    (groups[root] ??= []).push(k);
  }
  return Object.values(groups);
}

// Every legal visit-sequence for one series' resolved dose list, in the
// order its `at` arrays are written (earliest option first) — pure calendar
// legality, the same rule cover.js's `canCover` uses, with no product
// involved yet. A plain series with no flexible doses returns exactly one
// sequence.
function seriesSequences(doses) {
  function go(i, prevVisit) {
    if (i === doses.length) return [[]];
    const dose = doses[i];
    const rest = [];
    for (const visitId of dose.at) {
      const visit = visitById(visitId);
      if (doseWindowOk(dose, visit, prevVisit).ok) {
        for (const tail of go(i + 1, visit)) rest.push([visit, ...tail]);
      }
    }
    return rest;
  }
  return go(0, null);
}

// A brand-length-setting series' chosen variant restricts which products may
// actually give its doses — not just which dose NUMBER a product is licensed
// for. Two doses that are both numerically "Hib dose 2" mean different
// things depending on whether the series is on PedvaxHIB's 3-dose path or
// the PRP-T/mixed 4-dose path, and cover.js's dose-number check alone can't
// tell them apart (cover.test.js's `dosesForProduct` comment names this as
// plan.js's job). Only the EXCLUSIVE variant (the one with an explicit
// `requiresAllDosesFrom` brand list — PedvaxHIB alone, or Engerix-B/
// Recombivax alone) is actually restricted: using anything else for even
// one dose forfeits that variant's own shorter count, which is exactly why
// it's the one path that names its products. The "mixed brands" fallback is
// unrestricted by design (decisions.md, Hib: "any mix of brands is 4") —
// nothing stops it from being over-restricted by accident here, since a
// fallback dose that's numerically identical across variants (HepB's birth
// dose) must still accept whichever product actually gives birth doses.
function allowedProductsFor(seriesKey, variant) {
  return variant.requiresAllDosesFrom ? new Set(variant.requiresAllDosesFrom) : null;
}

// For a variant-bearing series that shares a combination product with
// another series in its own cluster — today only Hib (Pentacel, Vaxelis)
// and HepB (Pediarix, Vaxelis) — the variant itself has to be decided BY
// the same search as the visit choice, not before it. resolveSeriesLength
// (used for every other purpose: the rulebook, RV, MenB, and as the
// "preferred" ordering hint here) only looks at what's ticked. It has no
// way to know that using a PRP-T combo for a DTaP/IPV dose silently commits
// Hib to the 4-dose path too, even when PedvaxHIB is ALSO stocked — pre-
// resolving to PedvaxHIB's 3-dose path and then letting the visit search
// cover one of those doses with Pentacel anyway would silently under-dose
// the child by a real Hib shot. So every eligible variant is tried as its
// own branch here, preferred (shorter) one first so ties still favor it,
// each carrying the product restriction above.
function clusterVariantOptions(seriesKey, ticked) {
  const series = SERIES[seriesKey];
  const fallback = series.variants.find((v) => v.fallback);
  const eligible = series.variants
    .filter((v) => !v.fallback && v.requiresAllDosesFrom?.some((name) => ticked.has(name)))
    .sort((a, b) => a.doseCount - b.doseCount);
  const ordered = [...eligible, fallback];
  return ordered.map((v) => ({
    doses: v.doses,
    sequences: seriesSequences(v.doses),
    allowedProducts: allowedProductsFor(seriesKey, v),
    doseCount: v.doseCount,
  }));
}

// Minimum-size product set (from `coverage`, each `{product, covers}`) whose
// union covers every item in `reachable`. Brute force over subset size,
// smallest first, first fit wins — n is always small (a handful of stocked
// products relevant to one visit), so this is exact, not a greedy
// approximation, and ties resolve to `coverage`'s own declaration order.
function firstCoveringCombo(coverage, size, reachable) {
  const n = coverage.length;
  const idx = Array.from({ length: size }, (_, i) => i);
  while (idx[0] <= n - size) {
    const chosen = idx.map((i) => coverage[i]);
    const union = new Set();
    for (const c of chosen) for (const item of c.covers) union.add(item);
    if (reachable.every((item) => union.has(item))) return chosen;
    let i = size - 1;
    while (i >= 0 && idx[i] === n - size + i) i--;
    if (i < 0) return null;
    idx[i]++;
    for (let j = i + 1; j < size; j++) idx[j] = idx[j - 1] + 1;
  }
  return null;
}

function minimalCover(items, coverage) {
  if (items.length === 0) return { chosen: [], gaps: [] };
  const reachable = items.filter((item) => coverage.some((c) => c.covers.includes(item)));
  const gaps = items.filter((item) => !reachable.includes(item));
  if (reachable.length === 0) return { chosen: [], gaps };
  for (let size = 1; size <= coverage.length; size++) {
    const combo = firstCoveringCombo(coverage, size, reachable);
    if (combo) return { chosen: combo.map((c) => ({ product: c.product, covers: c.covers })), gaps };
  }
  return { chosen: [], gaps: items };
}

function coverageFor(items, candidates, ticked) {
  return candidates
    .map((product) => ({
      product,
      covers: items.filter(
        (d) =>
          (!d.allowedProducts || d.allowedProducts.has(product.name)) &&
          canCover({
            product,
            ticked,
            seriesKey: d.seriesKey,
            dose: d.dose,
            visit: d.visit,
            prevVisit: d.prevVisit,
          }).ok
      ),
    }))
    .filter((c) => c.covers.length > 0);
}

// Which stocked products could cover which of this visit's due doses, and
// the fewest-injection way to combine them. Oral doses (rotavirus) never
// combine with an injection and are reported separately — they cost the
// child nothing in the needle count. `d.allowedProducts` (set for any dose
// that came from a brand-committed variant) narrows candidates before
// cover.js's own gate runs, so a product that's numerically licensed for a
// dose but belongs to the WRONG variant is never offered.
function coverVisit(due, ticked) {
  const oral = due.filter((d) => d.route === 'oral');
  const injectable = due.filter((d) => d.route !== 'oral');
  const candidates = PRODUCTS.filter((p) => ticked.has(p.name) && !p.retired);

  const { chosen, gaps } = minimalCover(injectable, coverageFor(injectable, candidates, ticked));
  const oralResult = minimalCover(oral, coverageFor(oral, candidates, ticked));
  return { injections: chosen, oral: oralResult.chosen, gaps: [...gaps, ...oralResult.gaps] };
}

// Lexicographic score: an assignment that leaves more doses uncovered by any
// stocked product is always worse, no matter how few injections it uses —
// "fewest injections" is a score over deliverable plans, not a way to make
// gaps disappear. Only once two assignments tie on gaps does injection count
// decide.
function evaluateAssignment(dueByVisit, ticked) {
  let gaps = 0;
  let injections = 0;
  for (const due of Object.values(dueByVisit)) {
    const result = coverVisit(due, ticked);
    gaps += result.gaps.length;
    injections += result.injections.length;
  }
  return { gaps, injections };
}

function dueListFor(seriesKey, doses, sequence, allowedProducts) {
  const route = SERIES[seriesKey].route;
  return doses.map((dose, i) => ({
    seriesKey,
    dose,
    visit: sequence[i],
    prevVisit: i > 0 ? sequence[i - 1] : null,
    route,
    allowedProducts: allowedProducts ?? null,
  }));
}

// Joint search over one cluster of series. Most members offer exactly one
// dose-count "choice" (their own resolved doses, already fixed) — Hib and
// HepB, when clustered with DTaP/IPV, offer one choice per eligible variant
// instead (see clusterVariantOptions). Tries every combination, scores by
// evaluateAssignment, first-found wins a tie — sequences and variants are
// both generated preferred/earliest-first, so a tie means "don't shift a
// dose, and don't switch to the longer variant, unless it actually helps."
function searchCluster(clusterKeys, resolved, ticked) {
  const members = clusterKeys
    .map((key) => {
      const series = SERIES[key];
      if (series.variants && clusterKeys.length > 1) {
        const choices = clusterVariantOptions(key, ticked).flatMap((opt) =>
          opt.sequences.map((seq) => ({ doses: opt.doses, seq, allowedProducts: opt.allowedProducts }))
        );
        return { key, choices };
      }
      const doses = resolved[key].doses;
      if (!doses) return { key, choices: [] };
      const allowedProducts = resolved[key].variant
        ? allowedProductsFor(key, resolved[key].variant)
        : null;
      return { key, choices: seriesSequences(doses).map((seq) => ({ doses, seq, allowedProducts })) };
    })
    .filter((m) => m.choices.length > 0);

  let best = null;
  function recurse(i, chosen) {
    if (i === members.length) {
      const dueByVisit = {};
      members.forEach((m, mi) => {
        const choice = chosen[mi];
        for (const item of dueListFor(m.key, choice.doses, choice.seq, choice.allowedProducts)) {
          (dueByVisit[item.visit.id] ??= []).push(item);
        }
      });
      const score = evaluateAssignment(dueByVisit, ticked);
      if (!best || score.gaps < best.gaps || (score.gaps === best.gaps && score.injections < best.injections)) {
        best = { ...score, chosen: chosen.slice() };
      }
      return;
    }
    for (const choice of members[i].choices) {
      chosen.push(choice);
      recurse(i + 1, chosen);
      chosen.pop();
    }
  }
  if (members.length) recurse(0, []);

  const placements = {};
  if (best) members.forEach((m, i) => { placements[m.key] = best.chosen[i]; });
  return placements;
}

// Builds the whole schedule for a ticked formulary (Set of product names).
// Returns:
//   visits         — in calendar order, only visits with something due, each
//                     { visit, injections: [{product, covers}], oral, gaps }
//   placements     — seriesKey -> { doses, seq, allowedProducts } actually used
//   resolved       — seriesLength.js's per-series output, incl. its note —
//                     the PREFERRED variant before the cluster search runs;
//                     see seriesNotes below for what actually happened
//   unresolved     — series with nothing to schedule at all (MenB, when
//                     neither Bexsero nor Trumenba is stocked — its own
//                     shared-decision status, not a formulary gap)
//   seriesNotes    — one explanatory line per series whose ACTUAL dose count
//                     came from the cluster search, corrected from
//                     `resolved`'s note when the search overrode it (Hib/
//                     HepB only — see clusterVariantOptions)
export function buildPlan(ticked) {
  const resolved = {};
  for (const [key, series] of Object.entries(SERIES)) {
    resolved[key] = resolveSeriesLength(series, ticked);
  }

  const schedulable = Object.keys(resolved).filter((k) => resolved[k].doses);
  const unresolved = Object.keys(resolved).filter((k) => !resolved[k].doses);

  const clusters = buildClusters(schedulable);
  const placements = {};
  for (const cluster of clusters) {
    Object.assign(placements, searchCluster(cluster, resolved, ticked));
  }

  const dueByVisit = {};
  for (const key of schedulable) {
    const p = placements[key];
    if (!p) continue; // no legal sequence exists at all — shouldn't happen for real data, but don't crash the plan over it
    for (const item of dueListFor(key, p.doses, p.seq, p.allowedProducts)) {
      (dueByVisit[item.visit.id] ??= []).push(item);
    }
  }

  const visits = VISITS.filter((v) => dueByVisit[v.id]).map((v) => ({
    visit: v,
    ...coverVisit(dueByVisit[v.id], ticked),
  }));

  const seriesNotes = {};
  for (const [key, r] of Object.entries(resolved)) {
    if (!placements[key]) continue;
    const actualDoseCount = placements[key].doses.length;
    if (r.doseCount === actualDoseCount) {
      if (r.note) seriesNotes[key] = r.note;
      continue;
    }
    // The cluster search picked a different variant than resolveSeriesLength
    // would on formulary alone — always the longer one, since the search
    // only overrides the shorter/preferred pick when the shorter one would
    // cost an extra injection (evaluateAssignment's tie-break never moves
    // the OTHER way: a strictly-preferred shorter choice always wins ties).
    seriesNotes[key] =
      `Stocking a product that already covers another dose at the same visit ` +
      `(a combination product) commits this series to ${actualDoseCount} doses ` +
      `here, even though a shorter path is also stocked — using the shorter ` +
      `path alone would cost an extra injection.`;
  }

  return { visits, placements, resolved, unresolved, seriesNotes };
}
