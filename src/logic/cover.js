// The single gate. "May THIS product give THIS dose of THIS series at THIS
// visit?" is answered here and nowhere else — no screen, and no other logic
// file, may ask that question itself (docs/data-design.md). Mirrors
// `brandRules.js` in vaxapp, which exists for the same reason: local brand
// checks scattered across surfaces drift apart.
//
// Checks run in this order (docs/data-design.md's own list):
//   1. the product is stocked and not retired
//   2. the series matches something the product covers
//   3. the dose number is inside that coverage's `doses` range
//   4. the visit's age is inside the product's own min/max age
//   5. the visit is one of the dose's nominal windows (`dose.at`), and the
//      dose's own minAgeDays / maxAgeDays / minIntervalFromPrevDays hold —
//      checked numerically, not just by list membership, because an earlier
//      dose can shift (to catch a combination product) and change which of
//      several nominal visits is actually legal
//   6. the product is not barred from being this series' booster dose
//
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

  if (dose.booster && product.cannotBeBooster.includes(seriesKey)) {
    return { ok: false, reason: 'cannot-be-booster' };
  }

  return { ok: true };
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
