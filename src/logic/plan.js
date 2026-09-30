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
// three small groups of series ever share a combination product — DTaP/IPV/
// Hib/HepB (Pediarix, Pentacel, Vaxelis, Kinrix, Quadracel), MMR/VAR
// (ProQuad), and MenACWY/MenB (Penbraya, Penmenvy — added 2026-09-29 with
// item E). Series outside a shared-product group can't have their visit
// choice change the injection count at all (no product would ever cover two
// of their doses at once), so they're searched the same way — as a
// cluster of one — and it's cheap: the exhaustive per-cluster search below
// is a few hundred combinations at most, not a real optimization engine.
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { VISITS, VISIT_INDEX } from '../data/visits.js';
import { resolveSeriesLength, familyChoiceNote } from './seriesLength.js';
import { deliverableAt, doseWindowOk } from './cover.js';

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
  // Same eligibility rule as seriesLength.js: a variant that names brands
  // needs one of them stocked; a variant that names none (IPV's standard
  // 4-dose path) is always on offer. Shortest first, fallback last, so a
  // tie keeps the shorter series.
  const eligible = series.variants
    .filter(
      (v) =>
        !v.fallback &&
        (!v.requiresAllDosesFrom || v.requiresAllDosesFrom.some((name) => ticked.has(name)))
    )
    .sort((a, b) => a.doseCount - b.doseCount);
  // MenB is the one variant-bearing series with NO fallback variant: its
  // two paths are two brand families, and a clinic stocking neither has no
  // MenB series at all rather than a default one (seriesLength.js says the
  // same, and buildPlan reports it as `unresolved`). Until item E this
  // function was only ever reached by Hib/HepB/IPV, which all have a
  // fallback, so appending it unconditionally was safe; the pentavalents
  // put MenACWY and MenB in one cluster and brought MenB through here.
  const ordered = fallback ? [...eligible, fallback] : eligible;
  return ordered.map((v) => ({
    variant: v,
    doses: v.doses,
    sequences: seriesSequences(v.doses),
    allowedProducts: allowedProductsFor(seriesKey, v),
    doseCount: v.doseCount,
  }));
}

// The whole-syringe question — "may this product be given here at all,
// given that a syringe delivers everything in it?" — used to live right
// here. Item E (2026-09-29) moved it into cover.js beside `canCover`: it
// is a clinical rule, not a scoring detail (it is what makes a pentavalent
// usable only when MenACWY and MenB are both due the same day), and the
// gate file is where this app keeps the rules that must never be
// re-derived anywhere else. Nothing about the behaviour changed.

// Fewest products that deliver the most of `items`, where every chosen
// product delivers its whole content and no two chosen products share a
// series (giving the same antigen twice in one visit is the duplicate this
// whole item exists to prevent). That makes this an exact-cover problem,
// not the set cover it used to be: a due dose may be left as a gap even
// when a stocked product could give it, if the only way to give it would
// also duplicate something else.
//
// Exhaustive, memoized on the set of series already spoken for — at most a
// handful of series come due at one visit, so this is exact, not greedy.
// Options are walked in `PRODUCTS` declaration order and only a strict
// improvement replaces the incumbent, so ties resolve the same way the
// previous minimum-cover search resolved them.
function bestPacking(items, options) {
  if (items.length === 0) return { chosen: [], gaps: [] };
  const bitOf = new Map(items.map((item, i) => [item.seriesKey, 1 << i]));
  const masked = options.map((o, order) => ({
    ...o,
    order,
    mask: o.covers.reduce((m, item) => m | bitOf.get(item.seriesKey), 0),
  }));
  const memo = new Map();

  function solve(used) {
    let i = 0;
    while (i < items.length && used & (1 << i)) i++;
    if (i === items.length) return { gaps: 0, chosen: [] };
    if (memo.has(used)) return memo.get(used);
    let best = null;
    const consider = (candidate) => {
      if (
        !best ||
        candidate.gaps < best.gaps ||
        (candidate.gaps === best.gaps && candidate.chosen.length < best.chosen.length)
      ) {
        best = candidate;
      }
    };
    for (const option of masked) {
      if (!(option.mask & (1 << i))) continue; // doesn't answer the first open series
      if (option.mask & used) continue; // would duplicate an antigen already given
      const rest = solve(used | option.mask);
      consider({ gaps: rest.gaps, chosen: [option, ...rest.chosen] });
    }
    const withoutIt = solve(used | (1 << i));
    consider({ gaps: withoutIt.gaps + 1, chosen: withoutIt.chosen });
    memo.set(used, best);
    return best;
  }

  const { chosen } = solve(0);
  const covered = chosen.reduce((m, o) => m | o.mask, 0);
  return {
    // Listed in `options` order (which follows PRODUCTS), not the order the
    // search happened to pick them in — a visit's shots read the same way
    // however the search arrived at them.
    chosen: chosen
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((o) => ({ product: o.product, covers: o.covers })),
    gaps: items.filter((item) => !(covered & bitOf.get(item.seriesKey))),
  };
}

// Which stocked products may be given at this visit, and the fewest-needle
// way to combine them. Oral doses (rotavirus) never combine with an
// injection and are packed separately — they cost the child nothing in the
// needle count, and no product mixes the two routes, so splitting them
// cannot hide an antigen from deliverableAt's whole-syringe check.
// `d.allowedProducts` (set for any dose that came from a brand-committed
// variant) is part of that check too, so a product numerically licensed for
// a dose but belonging to the WRONG variant is never offered.
function coverVisit(due, ticked) {
  const oral = due.filter((d) => d.route === 'oral');
  const injectable = due.filter((d) => d.route !== 'oral');

  const shots = bestPacking(injectable, deliverableAt(injectable, ticked));
  const drops = bestPacking(oral, deliverableAt(oral, ticked));
  return { injections: shots.chosen, oral: drops.chosen, gaps: [...shots.gaps, ...drops.gaps] };
}

// The cluster search below scores thousands of whole-schedule assignments,
// and the same visit keeps coming back with the same doses due: shifting
// DTaP's booster from 15 to 18 months changes nothing about what the
// 2-month visit looks like, but every combination re-derives it. This
// caches one visit's answer by what is actually due there.
//
// The key has to name everything coverVisit's answer depends on: the dose
// definitions themselves (stable objects straight out of series.js — two
// doses both numbered "Hib dose 2" are different objects on the 3-dose and
// 4-dose paths, which is exactly the distinction that must not collapse),
// where the previous dose landed, and any brand restriction the variant
// carries. `ticked` is fixed for the whole of one buildPlan, so it needn't
// be in the key — the cache is cleared at the top of every buildPlan, and
// nothing here is async, so no two plans ever share it.
const visitCache = new Map();
let nextObjectId = 1;
const objectIds = new WeakMap();
function objectId(o) {
  if (!o) return 0;
  let id = objectIds.get(o);
  if (!id) {
    id = nextObjectId++;
    objectIds.set(o, id);
  }
  return id;
}

function cachedCoverVisit(due, ticked) {
  const key = due
    .map((d) => `${objectId(d.dose)}@${d.visit.id}<${d.prevVisit?.id ?? ''}#${objectId(d.allowedProducts)}`)
    .sort()
    .join('|');
  let hit = visitCache.get(key);
  if (!hit) {
    hit = coverVisit(due, ticked);
    visitCache.set(key, hit);
  }
  return hit;
}

// Lexicographic score: an assignment that leaves more doses uncovered by any
// stocked product is always worse, no matter how few injections it uses —
// "fewest injections" is a score over deliverable plans, not a way to make
// gaps disappear. Only once two assignments tie on gaps does injection count
// decide, and only once THAT ties too does visit count. `visits` (distinct
// visit ids touched) is tallied for both objectives below.
function evaluateAssignment(dueByVisit, ticked) {
  let gaps = 0;
  let injections = 0;
  for (const due of Object.values(dueByVisit)) {
    const result = cachedCoverVisit(due, ticked);
    gaps += result.gaps.length;
    injections += result.injections.length;
  }
  return { gaps, injections, visits: Object.keys(dueByVisit).length };
}

// Which of two candidate assignments wins. Gaps always decide first,
// regardless of objective — "fewest injections" (or "fewest visits") is a
// score over deliverable plans, never a way to make a gap disappear.
//
// Default objective ('injections', what the shipped app always uses):
// fewest shots wins outright. When two assignments cost the SAME number of
// shots, prefer the one touching fewer checkups — this is never a
// shots-for-visits trade (owner confirmed 2026-09-26: a real case is a
// clinic without an all-in-one combo product, where hepatitis B's 2nd dose
// can land at the 1-month or 2-month checkup for the same one shot either
// way; landing it on the 2-month visit, already busy with other vaccines,
// leaves the 1-month line off the schedule entirely instead of showing it
// with one shot alone). Only a true tie on both gets resolved by traversal
// order (earliest visit / preferred variant first).
//
// `objective: 'visits'` inverts the first two: fewest visits wins outright,
// shots break ties. Used solely by score.js's needles-vs-visits test, to
// build the alternate plan it compares against — the shipped app never
// passes it.
function isBetter(score, best, objective) {
  if (!best) return true;
  if (score.gaps !== best.gaps) return score.gaps < best.gaps;
  if (objective === 'visits') {
    if (score.visits !== best.visits) return score.visits < best.visits;
    return score.injections < best.injections;
  }
  if (score.injections !== best.injections) return score.injections < best.injections;
  return score.visits < best.visits;
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
function searchCluster(clusterKeys, resolved, ticked, objective) {
  const members = clusterKeys
    .map((key) => {
      const series = SERIES[key];
      if (series.variants && clusterKeys.length > 1) {
        const choices = clusterVariantOptions(key, ticked).flatMap((opt) =>
          opt.sequences.map((seq) => ({
            variant: opt.variant,
            doses: opt.doses,
            seq,
            allowedProducts: opt.allowedProducts,
          }))
        );
        return { key, choices };
      }
      const doses = resolved[key].doses;
      if (!doses) return { key, choices: [] };
      const allowedProducts = resolved[key].variant
        ? allowedProductsFor(key, resolved[key].variant)
        : null;
      return {
        key,
        choices: seriesSequences(doses).map((seq) => ({
          variant: resolved[key].variant ?? null,
          doses,
          seq,
          allowedProducts,
        })),
      };
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
      if (isBetter(score, best, objective)) {
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
// The second argument's `objective` is 'injections' (the default, and the
// only thing the shipped app ever asks for) or 'visits' — score.js's
// needles-vs-visits test uses 'visits' to build the alternate plan it
// compares against; nothing else should ever pass it.
// Returns:
//   visits         — in calendar order, only visits with something due, each
//                     { visit, injections: [{product, covers}], oral, gaps }
//   placements     — seriesKey -> { variant, doses, seq, allowedProducts } used
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
// buildPlan is pure: the same formulary and objective always produce the
// same plan, and no caller mutates what it returns. So the answers are
// worth keeping. The screen asks for the same plan several times over —
// Plan.jsx renders it, suggest.js takes it as its baseline, and App.jsx
// needs the before-and-after counts for the tick-effect banner — and a
// clinician ticking a box on and off again asks for plans already built.
// A small bounded cache turns all of those into lookups. 24 entries is
// comfortably more than one session's worth of back-and-forth and stays
// trivial in memory; the oldest is dropped when it fills.
const PLAN_CACHE = new Map();
const PLAN_CACHE_MAX = 24;

function planCacheKey(ticked, objective) {
  return `${objective}|${[...ticked].sort().join('\u0000')}`;
}

export function buildPlan(ticked, { objective = 'injections' } = {}) {
  const cacheKey = planCacheKey(ticked, objective);
  if (PLAN_CACHE.has(cacheKey)) return PLAN_CACHE.get(cacheKey);
  const built = buildPlanUncached(ticked, { objective });
  if (PLAN_CACHE.size >= PLAN_CACHE_MAX) PLAN_CACHE.delete(PLAN_CACHE.keys().next().value);
  PLAN_CACHE.set(cacheKey, built);
  return built;
}

function buildPlanUncached(ticked, { objective = 'injections' } = {}) {
  // One plan, one cache — `ticked` is fixed for the whole of this call, so
  // nothing from a previous formulary may survive into this one.
  visitCache.clear();
  const resolved = {};
  for (const [key, series] of Object.entries(SERIES)) {
    resolved[key] = resolveSeriesLength(series, ticked);
  }

  const schedulable = Object.keys(resolved).filter((k) => resolved[k].doses);
  const unresolved = Object.keys(resolved).filter((k) => !resolved[k].doses);

  const clusters = buildClusters(schedulable);
  const placements = {};
  for (const cluster of clusters) {
    Object.assign(placements, searchCluster(cluster, resolved, ticked, objective));
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
    ...cachedCoverVisit(dueByVisit[v.id], ticked),
  }));

  const seriesNotes = {};
  for (const [key, r] of Object.entries(resolved)) {
    if (!placements[key]) continue;
    const actualDoseCount = placements[key].doses.length;
    if (r.doseCount === actualDoseCount) {
      // Same dose count, but possibly not the same variant: MenB's two
      // brand families are both 2 doses, so the search can move to the
      // other one (because it closes the series where the preferred one
      // leaves a gap at 17 years) without changing the count. Re-derive
      // the sentence from the family actually used — resolveSeriesLength's
      // copy would name the wrong one (item E, 2026-09-29).
      if (placements[key].variant && placements[key].variant !== r.variant) {
        seriesNotes[key] = familyChoiceNote(SERIES[key], ticked, placements[key].variant);
        continue;
      }
      if (r.note) seriesNotes[key] = r.note;
      continue;
    }
    // The cluster search picked a different variant than resolveSeriesLength
    // would on formulary alone — always the longer one, since the search
    // only overrides the shorter/preferred pick when the shorter one would
    // cost an extra injection (evaluateAssignment's tie-break never moves
    // the OTHER way: a strictly-preferred shorter choice always wins ties).
    //
    // "even though a shorter path is also stocked" is only true when the
    // shorter path is a brand you actually buy (Hib's PedvaxHIB, HepB's
    // monovalents). IPV's shorter path names no brand — every polio
    // product can give it, and the series gets longer because of WHERE a
    // combination product lands, not because of what is in the fridge. For
    // that case say the variant's own sentence instead.
    if (!r.variant?.requiresAllDosesFrom && placements[key].variant?.chosenNote) {
      seriesNotes[key] = placements[key].variant.chosenNote;
      continue;
    }
    seriesNotes[key] =
      `Stocking a product that already covers another dose at the same visit ` +
      `(a combination product) commits this series to ${actualDoseCount} doses ` +
      `here, even though a shorter path is also stocked — using the shorter ` +
      `path alone would cost an extra injection.`;
  }

  return { visits, placements, resolved, unresolved, seriesNotes };
}
