// Why a dose sits at the visit it does — the one sentence printed under a
// shot on the schedule. Its own module for the same reason emptyVisits.js
// is: Plan.jsx used to work this out inline, and got it wrong two ways at
// once, because answering it honestly needs the window arithmetic cover.js
// already owns (CLAUDE.md: no screen may decide a rule for itself).
//
// The sentence this replaces, found 2026-09-29 while verifying item E and
// shipped since PR #8:
//
//   "Earliest due at 16 years; scheduled at 17 years instead to combine
//    with another vaccine due at that visit, without an extra injection or
//    visit."
//
// printed under MenB dose 2 at the 17-year visit. Both halves were false.
//
//   1. "Earliest due at 16 years" read `dose.at[0]` — the first visit the
//      dose is LISTED at — as if being listed made a visit legal. MenB
//      dose 2 is listed at 16, 17 and 18 years but carries a
//      minIntervalFromPrevDays floor, and dose 1 is given at 16 years, so
//      16 years was never an option for dose 2. The dose had not been
//      moved at all: it was already at the earliest visit that could give
//      it, which is where the planner put it.
//   2. "to combine with another vaccine ... without an extra injection" was
//      asserted, never checked. At the 17-year visit that Bexsero dose is
//      the only thing due; nothing was combined and no injection was saved.
//
// So there are two separate questions here, and neither is guessed:
//
//   - Which visit is the earliest that could ACTUALLY give this dose?
//     `doseWindowOk` (cover.js) already answers exactly that, given where
//     the previous dose in the series landed — and plan.js puts that visit
//     on every due item as `prevVisit`. Listing order is not consulted for
//     legality, only for which visit to name as "listed from".
//   - Was anything actually combined? Only when the syringe carries more
//     than one series, which is the same fact the card's own "One injection
//     covering two vaccines" lead-in is drawn from. A dose moved to a busy
//     visit where it is still its own injection saves a trip, not a needle,
//     and the sentence now says only that.
//
// Nothing here states a clinical quantity. The interval and minimum age are
// named as reasons, never printed as numbers: the figures live in
// series.js's `facts[]` with their sources (MenB's is CDC's own "2-dose
// series at least 6 months apart"), and the rulebook is where they print.
// Re-deriving "183 days" into prose here would be a second copy of a
// clinical fact outside src/data/, which is the one thing this app forbids.
import { VISITS, VISIT_INDEX } from '../data/visits.js';
import { doseWindowOk } from './cover.js';

function visitById(id) {
  return VISITS[VISIT_INDEX[id]];
}

function label(id) {
  return visitById(id)?.label ?? id;
}

// The earliest visit that could actually give this dose, given where the
// previous dose in its series landed — NOT merely the first visit listed.
// `dose.at` is written earliest-first (plan.js relies on the same ordering),
// so the first entry that clears the window is the earliest legal one.
// Returns null if no listed visit is legal at all; plan.js only ever places
// legal sequences, so that means this dose was never scheduled.
export function earliestLegalVisitId(dose, prevVisit) {
  return dose.at.find((id) => doseWindowOk(dose, visitById(id), prevVisit).ok) ?? null;
}

// One dose's explanation, or null when there is nothing to explain.
function noteForDose(cover, visitId, sharedSyringe, otherDosesDueHere) {
  const { dose, prevVisit } = cover;
  // A dose listed at a single visit was never placed by a choice, so there
  // is no choice to explain.
  if (dose.at.length < 2) return null;

  const earliest = earliestLegalVisitId(dose, prevVisit);
  if (!earliest) return null;
  const here = label(visitId);

  if (earliest === visitId) {
    // The dose is at the earliest visit that could give it — it was not
    // moved, and claiming it was is the first half of the old bug. Say
    // nothing when nothing sits ahead of it; otherwise explain why the
    // visits listed ahead of it could not have it. The first listed visit
    // is the one a clinician would expect, so report its reason.
    if (dose.at[0] === visitId) return null;
    const listedFrom = label(dose.at[0]);
    const { reason } = doseWindowOk(dose, visitById(dose.at[0]), prevVisit);
    if (reason === 'interval-too-short' && prevVisit) {
      return (
        `Listed from ${listedFrom}, but it has to follow the previous dose — given at ` +
        `${label(prevVisit.id)} — by a minimum interval. ${here} is the earliest visit ` +
        `that can give it.`
      );
    }
    if (reason === 'before-dose-minimum-age') {
      return (
        `Listed from ${listedFrom}, but this dose has a minimum age. ${here} is the ` +
        `earliest visit that can give it.`
      );
    }
    return `Listed from ${listedFrom}, but ${here} is the earliest visit that can give it.`;
  }

  // Genuinely later than it had to be: the planner chose this visit over an
  // earlier legal one. What that bought depends on what is actually here.
  const couldBe = `Could be given as early as ${label(earliest)}`;
  if (sharedSyringe) {
    // Verified, not assumed: this product carries more than one series at
    // this visit, so the move really did replace separate shots with one.
    return (
      `${couldBe}; scheduled at ${here} instead, so one injection covers it together ` +
      `with the other vaccines due at that visit.`
    );
  }
  if (otherDosesDueHere) {
    // Still its own injection — the move saved a trip, not a needle.
    return `${couldBe}; scheduled at ${here} instead, where other vaccines are already due.`;
  }
  return `${couldBe}; scheduled at ${here}.`;
}

// The sentence for one shot, or null.
//
//   covers            — the shot's `covers` (plan.js's due items: each has
//                       `dose` and the `prevVisit` its series' previous dose
//                       landed on). More than one means one syringe is
//                       carrying more than one series.
//   visitId           — the visit this shot is at.
//   otherDosesDueHere — is anything else due at this visit: another shot, or
//                       a dose no stocked product covers. Passed in rather
//                       than assumed, because it is a fact about the visit
//                       and not about this shot.
//
// At most one dose in a syringe has anything to explain in today's data (the
// 15-month Pentacel carries three, and only Hib was held back), but the
// first with something to say is used rather than the first that merely has
// a choice of visits — which is what the old code did, and what would have
// made it print the wrong dose's story the day a second one moved.
export function placementNote({ covers, visitId, otherDosesDueHere = false }) {
  const sharedSyringe = covers.length > 1;
  for (const cover of covers) {
    const note = noteForDose(cover, visitId, sharedSyringe, otherDosesDueHere);
    if (note) return note;
  }
  return null;
}
