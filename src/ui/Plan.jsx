// The schedule — docs/data-design.md's Plan.jsx. Reads `buildPlan`, `score`
// and `suggest` from the logic layer and renders them; makes no scheduling
// decision of its own (CLAUDE.md: cover.js/plan.js are the only place a
// decision is made).
import { SERIES } from '../data/series.js';
import { VISITS } from '../data/visits.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';
import { suggest } from '../logic/suggest.js';

function isSdmSeries(seriesKey) {
  return !!SERIES[seriesKey]?.sdm;
}

function isSdmShot(shot) {
  return shot.covers.every((c) => isSdmSeries(c.seriesKey));
}

function abbr(seriesKey) {
  return SERIES[seriesKey]?.abbr ?? seriesKey;
}

function movedNote(covers, visitId) {
  const moved = covers.find((c) => c.dose.at.length > 1 && c.dose.at[0] !== visitId);
  if (!moved) return null;
  const options = moved.dose.at.map((id) => VISITS.find((v) => v.id === id)?.label ?? id);
  return `This dose's window also allows ${options.join(' or ')}; it landed here because that costs no extra shot or visit.`;
}

function Shot({ shot, visitId, index }) {
  const sdm = isSdmShot(shot);
  const note = movedNote(shot.covers, visitId);
  return (
    <div className={`shot${sdm ? ' sdmshot' : ''}`}>
      <div className="shot-n">{index + 1}</div>
      <div className="shot-body">
        <div className="shot-nm">
          {shot.product.name}
          {shot.product.kind === 'combination' && <span className="tag combo">Combination</span>}
          {shot.product.route === 'oral' && <span className="tag oral">Oral</span>}
          {sdm && <span className="tag sdm">Shared decision</span>}
        </div>
        <div className="ants">
          {shot.covers.map((c) => (
            <span className={`ant${c.dose.booster ? ' boost' : ''}`} key={`${c.seriesKey}-${c.dose.n}`}>
              <span className="a">{abbr(c.seriesKey)}</span>
              <span className="d">
                Dose {c.dose.n}
                {c.dose.booster ? ' · booster' : ''}
              </span>
            </span>
          ))}
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
            <div className="n">{Object.keys(gapsBySeries).length}</div>
            <div className="l">{Object.keys(gapsBySeries).length === 1 ? 'antigen you cannot cover' : 'antigens you cannot cover'}</div>
          </div>
        ) : (
          <div className="sd">
            <div className="n">{plan.unresolved.length === 0 ? 'None' : 'Optional'}</div>
            <div className="l">shared-decision products {plan.unresolved.length === 0 ? 'stocked' : 'not yet decided'}</div>
          </div>
        )}
      </div>

      <p className="quiet">
        <b>No vaccines due at:</b> {emptyVisits.map((v) => v.label).join(', ') || 'none — every well-child visit needs something'}.
        These well-child visits are left out of the plan below so the printed page stays short.
      </p>

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
          Oral — not an injection
        </span>
        <span>
          <span className="sw s" />
          Shared decision — not routine
        </span>
      </div>

      {allGaps.length > 0 && (
        <div className="panel gap">
          <h3>Nothing you stock can give these</h3>
          <p>Tick a product that covers each one, or the child cannot complete the schedule here.</p>
          <ul className="gaplist">
            {Object.entries(gapsBySeries).map(([key, doses]) => (
              <li key={key}>
                <b>{SERIES[key].name}</b>
                <span>
                  dose{doses.length > 1 ? 's' : ''} {doses.join(', ')} of {plan.placements[key]?.doses.length}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {seriesNoteEntries.length > 0 && (
        <div className="panel">
          <h3>Why some series are longer or shorter than expected</h3>
          {seriesNoteEntries.map(([key, note]) => (
            <p key={key}>
              <b>{abbr(key)}:</b> {note}
            </p>
          ))}
        </div>
      )}

      <div>
        {plan.visits.map(({ visit, injections, oral }) => {
          const allShots = [...injections, ...oral];
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
                  <Shot shot={shot} visitId={visit.id} index={i} key={`${shot.product.name}-${i}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h3>What you could add</h3>
        <p>Products you don't stock, and how many injections each would save across the whole birth-to-18 plan.</p>
        <div className="sugg">
          {suggestions.length === 0 && <p>Nothing left to add would save an injection.</p>}
          {suggestions.map(({ product, saves }) => (
            <div className="sugg-row" key={product}>
              <span className="s-nm">{product}</span>
              <span className="s-win">
                −{saves} injection{saves === 1 ? '' : 's'}
              </span>
              <button type="button" onClick={() => onAddProduct(product)}>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
