// The tick list — docs/data-design.md's Formulary.jsx. Products are chosen
// from a checklist, grouped by antigen and by combination product (settled
// 2026-09-24). Holds no clinical logic of its own: it only reads `group`,
// `covers`, `kind`, `sdm`, `route` and `retired` off each product.
//
// Retired products (Prevnar 13) are never offered here — a clinic building a
// plan today cannot newly stock a discontinued product. They still exist in
// products.js so an old saved plan stays explainable, just not in this list.
import { PRODUCTS } from '../data/products.js';
import { SERIES } from '../data/series.js';

function abbrsFor(product) {
  return product.covers.map((c) => SERIES[c.series]?.abbr ?? c.series).join(' + ');
}

export default function Formulary({ ticked, onToggle, onReset }) {
  const groups = [];
  for (const p of PRODUCTS) {
    if (p.retired) continue;
    let g = groups.find((x) => x.name === p.group);
    if (!g) groups.push((g = { name: p.group, combo: false, sdm: false, items: [] }));
    if (p.kind === 'combination') g.combo = true;
    if (p.sdm) g.sdm = true;
    g.items.push(p);
  }

  return (
    <aside className="rail">
      <div className="rail-head">
        <h2>What we stock</h2>
        <button className="linkbtn" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div>
        {groups.map((g) => (
          <div key={g.name} className={`grp${g.combo ? ' combo' : ''}${g.sdm ? ' sdmgrp' : ''}`}>
            <div className="grp-t">{g.name}</div>
            {g.items.map((p) => (
              <label className="chk" key={p.name}>
                <input
                  type="checkbox"
                  checked={ticked.has(p.name)}
                  onChange={() => onToggle(p.name)}
                />
                <span>
                  <span className="nm">{p.name}</span>
                  <span className="cv">
                    {abbrsFor(p)}
                    {p.route === 'oral' ? ' · oral' : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
