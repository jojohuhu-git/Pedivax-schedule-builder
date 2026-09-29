// The tick list — docs/data-design.md's Formulary.jsx. Holds no clinical
// logic of its own: it only reads `group`, `covers`, `kind`, `route`,
// `comboVisitGroup`/`comboRank`/`comboLabel`, `commonName` and `retired` off
// each product, plus each series's own `sdm` note text.
//
// Reorganised for the 2026-09-26 UX queue's Batch C (docs/fix-2026-09-26-ux-
// copy-queue.md): two top-level sections (single vaccines, then combination
// vaccines — C1), singles ordered and headed the way C2/C4 settled, combos
// sub-grouped by the visit they serve (C3), and the per-product sub-line
// dropped wherever it would just repeat the heading (C5).
//
// Batch D / D1: below the 860px breakpoint the full checklist is what pushed
// the schedule 2,525px down the page, so it starts collapsed to one line
// ("N products stocked · Change") and opens on tap. The full list is always
// rendered — only theme.css's media query hides it on a phone — so desktop,
// which ignores that media query, is unaffected by this state at all.
//
// Retired products (Prevnar 13) are never offered here — a clinic building a
// plan today cannot newly stock a discontinued product. They still exist in
// products.js so an old saved plan stays explainable, just not in this list.
import { useState } from 'react';
import { PRODUCTS } from '../data/products.js';
import { SERIES } from '../data/series.js';
import { PRESETS } from '../data/presets.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';

// C2: row order copied live from the CDC 2025 child/adolescent immunization
// schedule table (docs/updates/sources/2026-09-26-cdc2025-schedule-table-row-
// order.md), restricted to the 13 antigens this app models — not derived or
// recalled. MenB (the two shared-decision products) sits at the end, same as
// the CDC table and A3's rulebook order, not filed under a policy heading.
export const SINGLE_GROUP_ORDER = [
  'HepB',
  'RV',
  'DTaP',
  'Hib',
  'PCV',
  'IPV',
  'MMR',
  'VAR',
  'HepA',
  'Tdap',
  'HPV',
  'MenACWY',
  'MenB',
];

// C4: consistent headings — disease names with the abbreviation in
// parentheses where it helps, never a bare abbreviation next to a spelled-
// out name in the same list, and never the group's own abbreviation
// repeated a third time under every product it contains. Deliberately a
// different, shorter vocabulary than the rulebook's own headings (which use
// each series's full clinical name) — this list is for scanning a checklist
// fast, not for the sourced rule page.
export const GROUP_HEADING = {
  HepB: 'Hepatitis B',
  RV: 'Rotavirus',
  DTaP: 'Diphtheria, tetanus, pertussis (DTaP)',
  Hib: 'Hib',
  PCV: 'Pneumococcal',
  IPV: 'Polio (IPV)',
  MMR: 'Measles, mumps, rubella (MMR)',
  VAR: 'Chickenpox (varicella)',
  HepA: 'Hepatitis A',
  Tdap: 'Tdap booster',
  HPV: 'HPV',
  MenACWY: 'Meningococcal ACWY',
  MenB: 'Meningococcal B',
};

// C3: combinations are sub-grouped by the visit they serve, not by file
// order. `comboRank` on each product (products.js) breaks ties within a
// visit group by antigen breadth — a manual field, not a sort Formulary.jsx
// derives, because the real tie-break (Pentacel over Pediarix) is "more DTaP
// doses covered," not just antigen count.
const COMBO_VISIT_GROUPS = [
  { id: 'infant', label: 'For the 2, 4 and 6 month visits' },
  { id: 'toddler', label: 'For 12 months and 4 years' },
  { id: 'booster', label: 'For the 4-to-6 year booster' },
];

// C5: the per-product sub-line is noise on a single vaccine sitting under a
// heading that already names the disease — drop it there in favor of the
// dose count, which genuinely varies by brand (PedvaxHIB · 3 doses vs.
// ActHIB · 4 doses). Keep it where it earns its place: combinations (their
// own C3 copy), valence-matters products (PCV20/PCV15, whose dose count
// doesn't vary by brand — the valence is the whole story), and the two oral
// products (the route is worth flagging, same as PCV's valence — but unlike
// PCV, the oral products' dose count DOES vary by brand: Rotarix is 2 doses,
// RotaTeq is 3. Found live 2026-09-27: the original version of this function
// grouped "commonName or oral" into one branch and always returned just the
// abbreviation/valence, which silently dropped the dose count on both oral
// products — Rotavirus was the one series where every product lost its
// dose count, because both its products are oral.
function subLine(product) {
  if (product.kind === 'combination') return product.comboLabel;
  if (product.commonName) return product.commonName;
  // Prefer setsSeriesLength over the covers[] dose-number span: for a
  // product on the series' exclusive shorter path (PedvaxHIB), the two can
  // differ — PedvaxHIB covers Hib doses [1,4] (it may also serve the 4-dose
  // path's booster when brands are mixed) but its OWN path is still 3 doses
  // start to finish (A: handoff-2026-09-28-brand-indication-airtight-queue.md).
  const seriesKey = product.covers[0].series;
  const [lo, hi] = product.covers[0].doses;
  const n = product.setsSeriesLength?.[seriesKey] ?? hi - lo + 1;
  const doseText = `${n} dose${n === 1 ? '' : 's'}`;
  return product.route === 'oral' ? `${doseText} · oral` : doseText;
}

function ProductCheck({ product, ticked, onToggle }) {
  return (
    <label className="chk">
      <input
        type="checkbox"
        checked={ticked.has(product.name)}
        onChange={() => onToggle(product.name)}
      />
      <span>
        <span className="nm">{product.name}</span>
        <span className="cv">{subLine(product)}</span>
      </span>
    </label>
  );
}

export default function Formulary({
  ticked,
  onToggle,
  onReset,
  justCleared,
  onUndoReset,
  tickDelta,
  onApplyPreset,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const active = PRODUCTS.filter((p) => !p.retired);
  // F5: 30 products across two sections — anyone who knows the product
  // name wants to type it rather than scan for it. Matches the product's
  // own name or its commonName (PCV20/PCV15), same names shown on the row.
  const q = query.trim().toLowerCase();
  const matching = q
    ? active.filter((p) => p.name.toLowerCase().includes(q) || p.commonName?.toLowerCase().includes(q))
    : active;
  const singles = matching.filter((p) => p.kind !== 'combination');
  const combos = matching.filter((p) => p.kind === 'combination');

  const singleGroups = SINGLE_GROUP_ORDER.map((key) => ({
    key,
    heading: GROUP_HEADING[key],
    sdm: SERIES[key]?.sdm ?? null,
    items: singles.filter((p) => p.group === key),
  })).filter((g) => g.items.length > 0);

  const comboGroups = COMBO_VISIT_GROUPS.map((vg) => ({
    ...vg,
    items: combos
      .filter((p) => p.comboVisitGroup === vg.id)
      .sort((a, b) => a.comboRank - b.comboRank),
  })).filter((g) => g.items.length > 0);

  const n = ticked.size;

  return (
    <aside className={open ? 'rail open' : 'rail'}>
      <button
        type="button"
        className="rail-summary"
        aria-expanded={open}
        aria-controls="rail-body"
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          {n} product{n === 1 ? '' : 's'} stocked
        </span>
        <span className="rail-summary-action">{open ? 'Done' : 'Change'}</span>
      </button>
      <div className="rail-body" id="rail-body">
        <div className="rail-head">
          <div>
            <h2>
              Your formulary <span className="quiet">· {n} of {active.length} stocked</span>
            </h2>
            {/* F4: shown right where a clinician's eyes already are after a
                tick, since the injection count itself lives below the
                schedule and can be off-screen entirely on a phone. */}
            {tickDelta && (
              <p className="tick-delta">
                {tickDelta.from} → {tickDelta.to} injection{tickDelta.to === 1 ? '' : 's'}
              </p>
            )}
          </div>
          {justCleared ? (
            <button className="linkbtn" type="button" onClick={onUndoReset}>
              Undo reset
            </button>
          ) : (
            <button className="linkbtn" type="button" onClick={onReset}>
              Reset
            </button>
          )}
        </div>
        {/* F5: 30 products across two sections is a lot to scan. */}
        <div className="search">
          <input
            type="search"
            className="search-input"
            placeholder="Search products…"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="linkbtn" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
        </div>
        {q && singles.length === 0 && combos.length === 0 && (
          <p className="search-empty">No product matches "{query.trim()}".</p>
        )}
        {/* F1: opening the app fresh showed 0 injections and every antigen
            in red — a one-tap starting point fixes the first impression;
            the clinician edits from there, same as ticking by hand. Only
            offered before anything is ticked — once a clinic has its own
            formulary going, a "starting point" isn't the right offer. */}
        {ticked.size === 0 && (
          <div className="presets">
            <p className="presets-lede">Start from a typical formulary:</p>
            {PRESETS.map((preset) => {
              const injections = scorePlan(buildPlan(new Set(preset.products))).injections;
              return (
                <button
                  type="button"
                  className="preset-row"
                  key={preset.id}
                  onClick={() => onApplyPreset(preset.products)}
                >
                  <span className="preset-nm">{preset.label}</span>
                  <span className="preset-desc">
                    {preset.description} {injections} injections.
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {singleGroups.length > 0 && (
          <div className="fml-section">
            <div className="fml-section-t">Single vaccines</div>
            {singleGroups.map((g) => (
              <div key={g.key} className="grp">
                <div className="grp-t">{g.heading}</div>
                {g.sdm && <p className="sdmline">{g.sdm}</p>}
                {g.items.map((p) => (
                  <ProductCheck product={p} ticked={ticked} onToggle={onToggle} key={p.name} />
                ))}
              </div>
            ))}
          </div>
        )}
        {comboGroups.length > 0 && (
          <div className="fml-section">
            <div className="fml-section-t">Combination vaccines</div>
            {comboGroups.map((g) => (
              <div key={g.id} className="grp combo">
                <div className="grp-t">{g.label}</div>
                {g.items.map((p) => (
                  <ProductCheck product={p} ticked={ticked} onToggle={onToggle} key={p.name} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
