// docs/data-design.md's score.js: count injections, count visits. A plain
// tally over an already-built plan (see plan.js) — not a second search.
// Fewest injections is the score; visit count is a display nicety only
// (docs/decisions.md), so this file never chooses between plans, it just
// counts the one plan.js already built.
import { buildPlan } from './plan.js';

export function scorePlan(plan) {
  return {
    injections: plan.visits.reduce((sum, v) => sum + v.injections.length, 0),
    visits: plan.visits.length,
  };
}

export function score(ticked) {
  return scorePlan(buildPlan(ticked));
}
