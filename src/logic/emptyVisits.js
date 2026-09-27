// Turns the list of well-child visits with nothing due into one readable
// clause, collapsing consecutive same-unit ages into a range — 2026-09-26 UX
// queue A4. Plan.jsx used to print all seventeen ages in a row; this is the
// only place that decides how they group, so a different formulary (a
// different set of empty visits) always produces the right ranges instead
// of a hardcoded string.
import { VISIT_INDEX } from '../data/visits.js';

function unitOf(label) {
  return label.trim().split(' ').pop();
}

function withoutUnit(label) {
  const parts = label.trim().split(' ');
  return parts.slice(0, -1).join(' ');
}

// Two empty visits merge into one run only when they're adjacent in the
// visit calendar (no visit with something due sits between them) AND share
// the same age unit — "3–5 days" next to "1 month" stays two separate
// entries; "2 years" next to "2½ years" next to "3 years" becomes one range.
function sameRun(a, b) {
  return VISIT_INDEX[b.id] === VISIT_INDEX[a.id] + 1 && unitOf(b.label) === unitOf(a.label);
}

function describeRun(run) {
  if (run.length === 1) return run[0].label;
  const first = run[0];
  const last = run[run.length - 1];
  if (run.length === 2) return `${withoutUnit(first.label)} and ${last.label}`;
  return `${withoutUnit(first.label)} to ${withoutUnit(last.label)} ${unitOf(last.label)}`;
}

function joinWithOxfordComma(items) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// `emptyVisits` — visits from VISITS (in calendar order) with nothing
// scheduled. Returns the clause to follow "No vaccine is due at the other
// well-child visits:", or '' when every visit has something due.
export function describeEmptyVisits(emptyVisits) {
  if (emptyVisits.length === 0) return '';
  const runs = [];
  let run = [emptyVisits[0]];
  for (let i = 1; i < emptyVisits.length; i++) {
    const visit = emptyVisits[i];
    if (sameRun(emptyVisits[i - 1], visit)) {
      run.push(visit);
    } else {
      runs.push(run);
      run = [visit];
    }
  }
  runs.push(run);
  return joinWithOxfordComma(runs.map(describeRun));
}
