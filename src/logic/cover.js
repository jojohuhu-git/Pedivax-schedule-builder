// The single gate. "May THIS product give THIS dose of THIS series at THIS
// visit?" is answered here and nowhere else — no screen, and no other logic
// file, may ask that question itself (docs/data-design.md). Mirrors
// `brandRules.js` in vaxapp, which exists for the same reason: local brand
// checks scattered across surfaces drift apart.
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
