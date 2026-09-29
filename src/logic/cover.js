// The single gate. Two questions are answered here and nowhere else — no
// screen, and no other logic file, may ask either of them itself
// (docs/data-design.md):
//
//   1. "May THIS product give THIS dose of THIS series at THIS visit?"
//      — `canCover`, below.
//   2. "May this product be given at this visit at all, given that a
//      syringe delivers everything in it?" — `deliverableAt`, at the foot
//      of this file. That is the rule that makes a pentavalent usable only
//      when MenACWY and MenB are both due the same day.
//
// Mirrors `brandRules.js` in vaxapp, which exists for the same reason:
// local brand checks scattered across surfaces drift apart.
//
// Checks run in this order (docs/data-design.md's own list):
//   1. the product is stocked and not retired
//   2. the series matches something the product covers
//   3. a written restriction (`product.restrictions[]`) names this series'
//      booster dose, and the visit is old enough for that restriction to
//      apply — checked BEFORE the dose-number licence below, on purpose:
//      a written, sourced restriction must always be the reason reported
//      when it is the reason, never buried behind a numeric coincidence
//      that happens to reach the same answer for an unrelated cause (see
//      restrictions.test.js's reason-code test, and docs/decisions.md,
//      "Found while building item C")
//   4. the dose number is inside that coverage's `doses` range
//   5. the visit's age is inside the product's own min/max age
//   6. the visit is one of the dose's nominal windows (`dose.at`), and the
//      dose's own minAgeDays / maxAgeDays / minIntervalFromPrevDays hold —
//      checked numerically, not just by list membership, because an earlier
//      dose can shift (to catch a combination product) and change which of
//      several nominal visits is actually legal
//
import { PRODUCTS } from '../data/products.js';

// `dose` is the resolved dose definition for this dose number — either a
// plain series' `doses[n-1]`, or (for Hib/RV/MenB) the chosen variant's
// `doses[n-1]` from seriesLength.js. `prevVisit` is the visit where the
// previous dose number in the SAME chosen path actually landed in this
// plan, or null for dose 1.
export function canCover({ product, ticked, seriesKey, dose, visit, prevVisit }) {
  if (!ticked.has(product.name)) {
    return { ok: false, reason: 'not-stocked' };
  }
  if (product.retired) {
    return { ok: false, reason: 'retired' };
  }

  const coverage = product.covers.find((c) => c.series === seriesKey);
  if (!coverage) {
    return { ok: false, reason: 'series-not-covered' };
  }

  if (dose.booster) {
    const restriction = restrictionBlocking(product, seriesKey, visit);
    if (restriction) {
      return { ok: false, reason: 'restricted-booster', restriction };
    }
  }

  const [loDose, hiDose] = coverage.doses;
  if (dose.n < loDose || dose.n > hiDose) {
    return { ok: false, reason: 'dose-number-not-licensed' };
  }

  if (product.minAgeDays != null && visit.ageDays < product.minAgeDays) {
    return { ok: false, reason: 'visit-too-young-for-product' };
  }
  if (product.maxAgeDays != null && visit.ageDays > product.maxAgeDays) {
    return { ok: false, reason: 'visit-too-old-for-product' };
  }

  const windowResult = doseWindowOk(dose, visit, prevVisit);
  if (!windowResult.ok) {
    return windowResult;
  }

  return { ok: true };
}

// Finds the written restriction (if any) that bars `product` from giving
// `seriesKey`'s booster dose at `visit` — the replacement for the old blunt
// `cannotBeBooster` flag (item C, 2026-09-29). A restriction with
// `minAgeDays: null` applies to every booster of that series (Vaxelis: not
// the booster at all, per immunize.org); one with a number applies only
// from that age on (Pentacel: fine as the 15-month DTaP/Hib/IPV booster —
// that IS its licensed booster — but not as the 4–6-year one). Exported so
// restrictions.test.js's reason-code test can call it directly, isolated
// from every other check in `canCover`.
export function restrictionBlocking(product, seriesKey, visit) {
  return (product.restrictions ?? []).find(
    (r) =>
      r.rule === 'not-booster' &&
      r.series === seriesKey &&
      (r.minAgeDays == null || visit.ageDays >= r.minAgeDays)
  );
}

// Is `visit` a legal place for this dose, given where the previous dose in
// the same series/variant actually landed? Exported so plan.js can ask the
// same pure-calendar question (no product involved) when it searches for
// where a dose could go — `canCover` stays the only place that adds a
// product to the question, which is the rule this file is for.
export function doseWindowOk(dose, visit, prevVisit) {
  if (!dose.at.includes(visit.id)) {
    return { ok: false, reason: 'not-a-nominal-visit-for-this-dose' };
  }
  if (dose.minAgeDays != null && visit.ageDays < dose.minAgeDays) {
    return { ok: false, reason: 'before-dose-minimum-age' };
  }
  if (dose.maxAgeDays != null && visit.ageDays > dose.maxAgeDays) {
    return { ok: false, reason: 'after-dose-maximum-age' };
  }
  if (dose.minIntervalFromPrevDays != null) {
    if (!prevVisit) {
      return { ok: false, reason: 'no-previous-dose-to-measure-interval-from' };
    }
    if (visit.ageDays - prevVisit.ageDays < dose.minIntervalFromPrevDays) {
      return { ok: false, reason: 'interval-too-short' };
    }
  }
  return { ok: true };
}


// ── The whole-syringe gate ────────────────────────────────────────────────
//
// `canCover` above answers a one-series question. This answers the other
// half of the same gate, and it has to live here rather than in a screen or
// in plan.js for the reason this file exists at all: it is the rule most
// likely to be re-derived somewhere else and drift. Moved here from
// plan.js on 2026-09-29 (item E) because the pentavalents made it a
// clinical rule in its own right rather than an internal scoring detail —
// the owner's standing instruction is that Penbraya/Penmenvy may be used
// ONLY when MenACWY and MenB are both due the same clinic day, and in
// MeningoVax that rule lives in recommend.js with a second copy in the
// validator and has regressed repeatedly. Here there is one copy.
//
// A syringe delivers everything in it. `product.covers` is the product's
// actual antigen content (Pentacel's three entries ARE DTaP + IPV + Hib),
// so giving a product at a visit gives the child every one of those
// antigens — whether or not the planner picked the product for them. The
// invariant (docs/decisions.md, item B of the 2026-09-28 queue):
//
//   Every antigen delivered must be a planned, counted dose of that series.
//   Nothing else may be delivered at all.
//
// So a product is offerable at a visit only if EVERY series it contains has
// a dose due at that visit which this product may legally give. One antigen
// with nothing due — Pentacel's Hib at the 4-year visit once the Hib series
// is finished, or a pentavalent's MenB half at the 11-year visit where only
// MenACWY is due — disqualifies the whole product, because there is no way
// to give the part the planner wanted without also giving the part it
// didn't. Before this rule the planner scored only the doses it
// deliberately picked a product for, so it could "save an injection" and
// quietly add a dose that appeared nowhere on the schedule.
//
// `allAntigensMustBeDue` is the mandatory declaration item E asked for: a
// product containing more than one antigen must say, in its own data, that
// this rule applies to it. It is not a toggle — there is no useful `false`,
// since a real combination vaccine cannot be split in the syringe — it is
// an acknowledgement, and it is load-bearing rather than documentation: an
// undeclared combination is refused outright here, so the next
// Penbraya-like product added without it fails loudly instead of quietly
// being allowed to deliver an uncounted antigen. pentavalent.test.js fails
// the suite for any such product, naming it.
//
// Returns one entry per offerable product: `covers` is exactly the set of
// due doses that product would deliver — its whole content, nothing less.
export function deliverableAt(items, ticked) {
  const dueBySeries = new Map(items.map((item) => [item.seriesKey, item]));
  return PRODUCTS.filter((p) => ticked.has(p.name) && !p.retired)
    .map((product) => {
      if (product.covers.length > 1 && product.allAntigensMustBeDue !== true) {
        return null; // undeclared combination — see the note above
      }
      const covers = [];
      for (const content of product.covers) {
        const item = dueBySeries.get(content.series);
        if (!item) return null; // antigen in the syringe with no dose due here
        if (item.allowedProducts && !item.allowedProducts.has(product.name)) return null;
        const verdict = canCover({
          product,
          ticked,
          seriesKey: item.seriesKey,
          dose: item.dose,
          visit: item.visit,
          prevVisit: item.prevVisit,
        });
        if (!verdict.ok) return null;
        covers.push(item);
      }
      if (!covers.length) return null;
      // Report the doses in the order this visit lists them, not the order
      // the product's antigens happen to be written in — the schedule
      // screen prints this list, and its reading order shouldn't depend on
      // how a product entry was typed.
      return { product, covers: items.filter((item) => covers.includes(item)) };
    })
    .filter(Boolean);
}
