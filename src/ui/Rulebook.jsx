// Every rule the planner uses, printed with its source — docs/data-design.md's
// Rulebook.jsx. CLAUDE.md: "The rulebook is generated from the same data the
// planner uses." This file makes no clinical claim of its own: every sentence
// on the page is either read straight off src/data/ (dose ages, licensed
// products, brand-length choices) or is one of that data's own recorded
// `facts[]` (claim + quoted sentence + source + checked-on date). Nothing is
// re-derived or re-typed — one-source-of-truth.test.js checks that this
// page's dose counts can never quietly drift from what plan.js actually
// builds.
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';
import { SOURCES } from '../data/sources.js';
import { VISITS, VISIT_INDEX } from '../data/visits.js';

const STALE_DAYS = 365;

function visitLabel(id) {
  return VISITS[VISIT_INDEX[id]]?.label ?? id;
}

function describeDose(dose) {
  const ages = dose.at.map(visitLabel).join(' or ');
  return `dose ${dose.n}${dose.booster ? ' (booster)' : ''} at ${ages}`;
}

function daysStale(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
}

function Fact({ fact }) {
  const source = SOURCES[fact.source];
  const stale = daysStale(fact.verified) > STALE_DAYS;
  return (
    <div className={`fact${stale ? ' stale' : ''}`}>
      <p className="fact-claim">{fact.claim}</p>
      <blockquote>&ldquo;{fact.quote}&rdquo;</blockquote>
      <p className="fact-src">
        {source ? (
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        ) : (
          fact.source
        )}
        {source && <span className="tag valence">{source.tier}</span>}
        <span className="quiet"> · checked {fact.verified}</span>
        {stale && <span className="stalewarn"> — over a year old, due for a re-check</span>}
      </p>
    </div>
  );
}

function coverageLine(product) {
  return product.covers
    .map((c) => {
      const abbr = SERIES[c.series]?.abbr ?? c.series;
      const [lo, hi] = c.doses;
      return `${abbr} dose${lo === hi ? '' : 's'} ${lo === hi ? lo : `${lo}–${hi}`}`;
    })
    .join(', ');
}

function ProductRule({ product }) {
  const lengthNotes = Object.entries(product.setsSeriesLength ?? {}).map(
    ([key, n]) => `Using ${product.name} commits ${SERIES[key]?.abbr ?? key} to a ${n}-dose series.`
  );
  const boosterNote =
    product.cannotBeBooster.length > 0
      ? `${product.name} may not be used as the booster dose for: ${product.cannotBeBooster
          .map((k) => SERIES[k]?.abbr ?? k)
          .join(', ')}.`
      : null;

  return (
    <div className="rule-product">
      <h4>
        {product.name}
        {product.commonName && <span className="tag valence">{product.commonName}</span>}
        {product.kind === 'combination' && <span className="tag combo">Combination</span>}
        {product.route === 'oral' && <span className="tag oral">Oral</span>}
        {product.retired && <span className="tag sdm">Retired {product.retired}</span>}
      </h4>
      <p className="quiet">Covers: {coverageLine(product)}</p>
      {lengthNotes.map((n) => (
        <p className="quiet" key={n}>
          {n}
        </p>
      ))}
      {boosterNote && <p className="quiet">{boosterNote}</p>}
      {product.lineage && (
        <p className="quiet">
          Usually paired with: {product.lineage.prefer.join(', ')}. {product.lineage.escape}
        </p>
      )}
      {product.facts.map((f, i) => (
        <Fact fact={f} key={i} />
      ))}
    </div>
  );
}

function seriesAnchor(key) {
  return `series-${key}`;
}

function SeriesRule({ series }) {
  const products = PRODUCTS.filter((p) => p.covers.some((c) => c.series === series.key));
  return (
    <section className="rule-series" id={seriesAnchor(series.key)}>
      <h2>
        {series.name} <span className="quiet">({series.abbr})</span>
      </h2>
      {series.variants ? (
        series.variants.map((v) => (
          <p className="quiet" key={v.id}>
            <b>
              {v.label} — {v.doseCount} dose{v.doseCount === 1 ? '' : 's'}:
            </b>{' '}
            {v.doses.map(describeDose).join(' · ')}
          </p>
        ))
      ) : (
        <p className="quiet">
          <b>
            {series.doses.length} dose{series.doses.length === 1 ? '' : 's'}:
          </b>{' '}
          {series.doses.map(describeDose).join(' · ')}
        </p>
      )}
      {series.sdm && <p className="note">{series.sdm}</p>}
      {series.facts.map((f, i) => (
        <Fact fact={f} key={i} />
      ))}
      <div className="rule-products">
        {products.map((p) => (
          <ProductRule product={p} key={p.name} />
        ))}
      </div>
    </section>
  );
}

export default function Rulebook() {
  return (
    <main className="rulebook">
      <nav className="rule-jump" aria-label="Jump to an antigen">
        <span className="quiet">Jump to:</span>
        {Object.values(SERIES).map((series) => (
          <a href={`#${seriesAnchor(series.key)}`} key={series.key}>
            {series.abbr}
          </a>
        ))}
      </nav>
      <p className="note">
        <b>This page is generated from the same data the planner uses.</b> Every rule below is
        read straight from the file that also builds the schedule — nothing here is written
        down twice, so this page and the plan can never quietly disagree.
      </p>
      <p className="note">
        <b>Which authority this follows.</b> ACIP/CDC/AAP/immunize.org govern over an FDA
        package insert — an insert may fill in a detail these organizations don't state, but
        it can never make a rule stricter than they already allow. Where AAP and CDC disagree,
        AAP governs. This app follows guidance as it stood before the federal changes that
        began in mid-2025, plus AAP's own current schedule.
      </p>
      {Object.values(SERIES).map((series) => (
        <SeriesRule series={series} key={series.key} />
      ))}
    </main>
  );
}
