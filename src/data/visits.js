// The well-child visit calendar. Ages only — this app never enters a date of
// birth and never prints a calendar date (see docs/decisions.md, 2026-09-25).
//
// `ageDays` exists only so intervals can be checked ("is 15 months at least
// 6 months after 6 months?"). It is a NOMINAL age for arithmetic, derived as
// round(months * 30.4375) or round(years * 365.25) — the average-month/
// average-year convention already used in docs/data-design.md's own example
// (2 months -> 61 days, 4 months -> 122 days). Nothing here is a real date.
//
// Every visit below is a standard Bright Futures/AAP well-child check —
// decisions.md: "Visits are fixed to the standard well-child dates. The app
// does not invent off-calendar visits." Source: Bright Futures Periodicity
// Schedule, see sources.js `brightFuturesPeriodicity`.
//
// Which of these end up with nothing due is NOT hardcoded here — that would
// duplicate a fact plan.js already knows and let the two drift apart, which
// is exactly what one-source-of-truth.test.js exists to catch. score.js/
// plan.js compute the empty-visit list from VISITS minus whatever a series
// actually schedules onto them.
export const VISITS = [
  { id: 'birth', label: 'Birth', ageDays: 0 },
  { id: 'd3_5', label: '3–5 days', ageDays: 4 },
  { id: 'm1', label: '1 month', ageDays: 30 },
  { id: 'm2', label: '2 months', ageDays: 61 },
  { id: 'm4', label: '4 months', ageDays: 122 },
  { id: 'm6', label: '6 months', ageDays: 183 },
  { id: 'm9', label: '9 months', ageDays: 274 },
  { id: 'm12', label: '12 months', ageDays: 365 },
  { id: 'm15', label: '15 months', ageDays: 457 },
  { id: 'm18', label: '18 months', ageDays: 548 },
  { id: 'm24', label: '2 years', ageDays: 731 },
  { id: 'm30', label: '2½ years', ageDays: 913 },
  { id: 'y3', label: '3 years', ageDays: 1096 },
  { id: 'y4', label: '4 years', ageDays: 1461 },
  { id: 'y5', label: '5 years', ageDays: 1826 },
  { id: 'y6', label: '6 years', ageDays: 2192 },
  { id: 'y7', label: '7 years', ageDays: 2557 },
  { id: 'y8', label: '8 years', ageDays: 2922 },
  { id: 'y9', label: '9 years', ageDays: 3287 },
  { id: 'y10', label: '10 years', ageDays: 3653 },
  { id: 'y11', label: '11 years', ageDays: 4018 },
  { id: 'y12', label: '12 years', ageDays: 4383 },
  { id: 'y13', label: '13 years', ageDays: 4748 },
  { id: 'y14', label: '14 years', ageDays: 5114 },
  { id: 'y15', label: '15 years', ageDays: 5479 },
  { id: 'y16', label: '16 years', ageDays: 5844 },
  { id: 'y17', label: '17 years', ageDays: 6209 },
  { id: 'y18', label: '18 years', ageDays: 6575 },
];

export const VISIT_INDEX = Object.fromEntries(VISITS.map((v, i) => [v.id, i]));
