// The schedule — docs/data-design.md's Plan.jsx. Reads `buildPlan`, `score`
// and `suggest` from the logic layer and renders them; makes no scheduling
// decision of its own (CLAUDE.md: cover.js/plan.js are the only place a
// decision is made).
import { PRODUCTS } from '../data/products.js';
import { SERIES } from '../data/series.js';
import { VISITS } from '../data/visits.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';
import { suggest } from '../logic/suggest.js';
import { describeEmptyVisits } from '../logic/emptyVisits.js';
import { fixesForSeries } from '../logic/fixGap.js';
import { placementNote } from '../logic/placement.js';

// A combination product's antigen count is always small (2-4) — spelled out
// reads as a clinician's sentence rather than a template filling in a number.
const NUMBER_WORDS = { 2: 'two', 3: 'three', 4: 'four' };

function isSdmSeries(seriesKey) {
  return !!SERIES[seriesKey]?.sdm;
}

function isSdmShot(shot) {
  return shot.covers.every((c) => isSdmSeries(c.seriesKey));
}

function abbr(seriesKey) {
  return SERIES[seriesKey]?.abbr ?? seriesKey;
}

// Why this dose sits at this visit is `placement.js`'s to answer — reading
// `dose.at[0]` as "earliest" and asserting a combination that was never
// checked is exactly the pair of mistakes that lived here until 2026-09-29.
function Shot({ shot, visitId, index, placements, otherDosesDueHere }) {
  const sdm = isSdmShot(shot);
  const note = placementNote({ covers: shot.covers, visitId, otherDosesDueHere });
  return (
    <div className={`shot${sdm ? ' sdmshot' : ''}`}>
      <div className="shot-n">{index + 1}</div>
      <div className="shot-body">
        <div className="shot-nm">
          {shot.product.name}
          {shot.product.commonName && <span className="tag valence">{shot.product.commonName}</span>}
          {shot.product.route === 'oral' && <span className="tag oral">Oral</span>}
        </div>
        {shot.covers.length > 1 && (
          <p className="quiet combo-lede">
            One injection covering {NUMBER_WORDS[shot.covers.length] ?? shot.covers.length} vaccines:
          </p>
        )}
        <div className="ants">
          {shot.covers.map((c) => {
            const total = placements[c.seriesKey]?.doses.length;
            return (
              <span className={`ant${c.dose.booster ? ' boost' : ''}`} key={`${c.seriesKey}-${c.dose.n}`}>
                <span className="a">{abbr(c.seriesKey)}</span>
                <span className="d">
                  Dose {c.dose.n}
                  {total ? ` of ${total}` : ''}
                  {c.dose.booster ? ' · booster' : ''}
                </span>
              </span>
            );
          })}
        </div>
        {sdm && <div className="sdmline">{SERIES[shot.covers[0].seriesKey].sdm}</div>}
        {note && <div className="seriesnote">{note}</div>}
      </div>
    </div>
  );
}

export default function Plan({ ticked, onAddProduct }) {
  const plan = buildPlan(ticked);
  const score = scorePlan(plan);
  const suggestions = suggest(ticked);

  const allGaps = plan.visits.flatMap((v) => v.gaps);
  const gapsBySeries = {};
  for (const g of allGaps) (gapsBySeries[g.seriesKey] ??= []).push(g.dose.n);

  const dueVisitIds = new Set(plan.visits.map((v) => v.visit.id));
  const emptyVisits = VISITS.filter((v) => !dueVisitIds.has(v.id));

  const seriesNoteEntries = Object.entries(plan.seriesNotes);

  return (
    <main>
      <div className="sum">
        <div>
          <div className="n">{score.injections}</div>
          <div className="l">injections, birth to 18 years</div>
        </div>
        <div>
          <div className="n">{score.visits}</div>
          <div className="l">visits that need a vaccine</div>
        </div>
        {allGaps.length > 0 ? (
          <div className="bad">
            <div className="gapmsg">
              No product covers {Object.keys(gapsBySeries).map((key) => SERIES[key].abbr).join(', ')} — see the list below.
            </div>
          </div>
        ) : (
          <div className="sd">
            <div className="n">{plan.unresolved.length === 0 ? 'Included' : 'Optional'}</div>
            <div className="l">
              {plan.unresolved.length === 0
                ? 'shared-decision product in this plan'
                : 'shared-decision products not yet decided'}
            </div>
          </div>
        )}
      </div>

      {/* F3: moved up beside the injection count it explains — this used to
          sit at the very bottom of the page, past the whole schedule, where
          almost nobody scrolls. */}
      <div className="panel">
        <h3>Products that would save injections</h3>
        <p>Products you don't stock, and how many injections each would save across the whole birth-to-18 plan.</p>
        <div className="sugg">
          {suggestions.length === 0 && <p>Nothing left to add would save an injection.</p>}
          {suggestions.map(({ product, saves }) => {
            const commonName = PRODUCTS.find((p) => p.name === product)?.commonName;
            return (
              <div className="sugg-row" key={product}>
                <span className="s-nm">
                  {product}
                  {commonName && <span className="tag valence">{commonName}</span>}
                </span>
                <span className="s-win">
                  −{saves} injection{saves === 1 ? '' : 's'}
                </span>
                <button type="button" onClick={() => onAddProduct(product)}>
                  Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        <span>
          <span className="sw c" />
          Combination product
        </span>
        <span>
          <span className="sw b" />
          Booster dose
        </span>
        <span>
          <span className="sw o" />
          Oral
        </span>
        <span>
          <span className="sw s" />
          Shared decision — not routine
        </span>
      </div>

      {allGaps.length > 0 && (
        <div className="panel gap">
          <h3>Nothing in your formulary covers these doses.</h3>
          <p>Add a product for each, or the series can't be finished with what you stock.</p>
          <ul className="gaplist">
            {Object.entries(gapsBySeries).map(([key, doses]) => {
              const fixes = fixesForSeries(ticked, key, doses);
              return (
              <li key={key}>
                <b>{SERIES[key].name}</b>
                <ul className="gapdoses">
                  {doses.map((doseN) => {
                    const fix = fixes[doseN];
                    const total = plan.placements[key]?.doses.length;
                    return (
                      <li className="gapdose" key={doseN}>
                        <span>
                          Nothing covers dose {doseN}
                          {total ? ` of ${total}` : ''}.
                        </span>
                        {fix && (
                          <button type="button" className="linkbtn" onClick={() => onAddProduct(fix)}>
                            Add {fix}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
              );
            })}
          </ul>
        </div>
      )}

      {seriesNoteEntries.length > 0 && (
        <div className="panel">
          <h3>Dose counts set by the brands you stock</h3>
          {seriesNoteEntries.map(([key, note]) => (
            <p key={key}>
              <b>{abbr(key)}:</b> {note}
            </p>
          ))}
        </div>
      )}

      <div>
        {plan.visits.map(({ visit, injections, oral, gaps }) => {
          const allShots = [...injections, ...oral];
          // Anything else due at this visit — another shot, or a dose no
          // stocked product covers (still due, listed in the gap panel).
          const otherDosesDueHere = allShots.length > 1 || gaps.length > 0;
          const sdmOnly = allShots.length > 0 && allShots.every(isSdmShot);
          const n = injections.filter((s) => !isSdmShot(s)).length;
          const extras = [];
          if (oral.length) extras.push(`${oral.length} oral`);
          const sd = injections.filter(isSdmShot).length;
          if (sd) extras.push(`${sd} shared-decision`);
          return (
            <div className={`visit${sdmOnly ? ' sdmvisit' : ''}`} key={visit.id}>
              <div className="v-head">
                <span className="v-age">{visit.label}</span>
                <span className="v-meta">
                  {n} injection{n === 1 ? '' : 's'}
                  {extras.length ? ` + ${extras.join(' + ')}` : ''}
                </span>
              </div>
              <div className="shots">
                {allShots.map((shot, i) => (
                  <Shot
                    shot={shot}
                    visitId={visit.id}
                    index={i}
                    placements={plan.placements}
                    otherDosesDueHere={otherDosesDueHere}
                    key={`${shot.product.name}-${i}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {emptyVisits.length > 0 && (
        <p className="quiet">
          <b>No vaccine is due at the other well-child visits:</b> {describeEmptyVisits(emptyVisits)}.
        </p>
      )}
    </main>
  );
}
