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

// A written restriction may apply from birth (Vaxelis: never the booster) or
// only from some age on (Pentacel: fine as the 15-month booster, barred from
// the 4-6-year one) — grouped by (age, source) so products with the same age
// floor and citation across several series print one sentence, not one per
// series. Exported so one-source-of-truth.test.js can check this function's
// own output against `restrictions[]` and `cover.js`, not just the data.
export function boosterNotes(product) {
  const grouped = new Map();
  for (const r of product.restrictions ?? []) {
    if (r.rule !== 'not-booster') continue;
    const key = `${r.minAgeDays ?? 'always'}|${r.source}`;
    if (!grouped.has(key)) {
      grouped.set(key, { minAgeDays: r.minAgeDays, source: r.source, seriesKeys: [] });
    }
    grouped.get(key).seriesKeys.push(r.series);
  }
  return [...grouped.values()].map(({ minAgeDays, source, seriesKeys }) => {
    const who = seriesKeys.map((k) => SERIES[k]?.abbr ?? k).join(', ');
    const text =
      minAgeDays == null
        ? `${product.name} may not be used as the booster dose for: ${who}.`
        : `${product.name} may not be used as the booster dose for: ${who}, from the ` +
            `${visitAtAge(minAgeDays)} visit on.`;
    return { text, source, minAgeDays, seriesKeys };
  });
}

function visitAtAge(ageDays) {
  return VISITS.find((v) => v.ageDays === ageDays)?.label ?? `day ${ageDays}`;
}

// The insert is often older or narrower than current CDC/ACIP guidance
// (CLAUDE.md); products.js records both the governed range `cover.js`
// actually enforces (minAgeDays/maxAgeDays) and the insert's own
// (insertMinAgeDays/insertMaxAgeDays) precisely so this gap can be shown
// programmatically instead of resting on a hand-written fact that could
// drift from the fields. Exported for the same reason as boosterNotes.
export function insertGapNotes(product) {
  const notes = [];
  if (product.insertMinAgeDays != null && product.insertMinAgeDays !== product.minAgeDays) {
    notes.push({
      bound: 'min',
      text:
        `Package insert does not start ${product.name} before ${humanAge(product.insertMinAgeDays)}; ` +
        `this app follows CDC/ACIP, which allows it from ${humanAge(product.minAgeDays)}.`,
    });
  }
  if (product.insertMaxAgeDays != null && product.insertMaxAgeDays !== product.maxAgeDays) {
    notes.push({
      bound: 'max',
      text:
        `Package insert allows ${product.name} only through ${humanAge(product.insertMaxAgeDays)}; ` +
        `this app follows CDC/ACIP, which allows it through ${humanAge(product.maxAgeDays)} instead.`,
    });
  }
  return notes;
}

function humanAge(days) {
  if (days === 0) return 'birth';
  if (days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  const months = Math.round(days / 30.4);
  return `${months} month${months === 1 ? '' : 's'}`;
}

function ProductRule({ product }) {
  const lengthNotes = Object.entries(product.setsSeriesLength ?? {}).map(
    ([key, n]) => `Using ${product.name} commits ${SERIES[key]?.abbr ?? key} to a ${n}-dose series.`
  );
  const boosterLines = boosterNotes(product);
  const insertGapLines = insertGapNotes(product);

  return (
    <div className="rule-product">
      <h4>
        {product.name}
        {product.commonName && <span className="tag valence">{product.commonName}</span>}
        {product.kind === 'combination' && <span className="tag combo">Combination</span>}
        {product.route === 'oral' && <span className="tag oral">Oral</span>}
        {product.retired && <span className="tag retired">Retired {product.retired}</span>}
      </h4>
      <p className="quiet">Covers: {coverageLine(product)}</p>
      {lengthNotes.map((n) => (
        <p className="quiet" key={n}>
          {n}
        </p>
      ))}
      {boosterLines.map((n) => {
        const source = SOURCES[n.source];
        return (
          <p className="quiet" key={n.text}>
            {n.text}{' '}
            {source ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                ({source.label})
              </a>
            ) : (
              `(${n.source})`
            )}
          </p>
        );
      })}
      {insertGapLines.map((n) => (
        <p className="quiet insert-gap" key={n.bound}>
          {n.text}
        </p>
      ))}
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

// Same three age blocks the 2026-09-26 UX review settled on for the
// checklist (docs/decisions.md, docs/fix-2026-09-26-ux-copy-queue.md A3) —
// `ageBlock` on each series is the one source of truth for which block it's
// in; this just orders and labels the three blocks themselves.
const AGE_BLOCKS = [
  { id: 'infant', label: 'Birth & infant' },
  { id: 'toddler', label: 'Toddler & preschool' },
  { id: 'adolescent', label: 'Adolescent' },
];

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
        {AGE_BLOCKS.map((block, i) => (
          <span className="jump-block" key={block.id}>
            {i > 0 && <span className="jump-sep" aria-hidden="true" />}
            <span className="jump-block-label">{block.label}</span>
            {Object.values(SERIES)
              .filter((series) => series.ageBlock === block.id)
              .map((series) => (
                <a href={`#${seriesAnchor(series.key)}`} key={series.key}>
                  {series.abbr}
                </a>
              ))}
          </span>
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
