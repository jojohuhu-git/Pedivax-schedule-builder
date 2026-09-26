// docs/data-design.md's suggest.js: "what you could add" — names products the
// clinic did NOT tick and what stocking one would save: "stocking Vaxelis
// would save this child 4 injections." Re-runs plan.js with each unticked
// product added and reports the injection-count difference against the
// current plan — never an estimate, since plan.js's own search is the only
// thing that actually knows which combination products would apply.
//
// Adding a product to a formulary only ever gives plan.js's search MORE
// options (a new candidate at coverVisit, or — for a brand-length-setting
// series like Hib/HepB — a new variant branch in clusterVariantOptions), and
// the search already picks the best of everything it's offered. So stocking
// one more product can never cost an extra injection; this only ever reports
// a saving of 0 or more, and only lists the products where it's actually > 0.
import { PRODUCTS } from '../data/products.js';
import { buildPlan } from './plan.js';
import { scorePlan } from './score.js';

export function suggest(ticked) {
  const baseline = scorePlan(buildPlan(ticked)).injections;
  const candidates = PRODUCTS.filter((p) => !p.retired && !ticked.has(p.name));

  return candidates
    .map((p) => {
      const withProduct = new Set(ticked);
      withProduct.add(p.name);
      const injections = scorePlan(buildPlan(withProduct)).injections;
      return { product: p.name, saves: baseline - injections };
    })
    .filter((s) => s.saves > 0)
    .sort((a, b) => b.saves - a.saves || a.product.localeCompare(b.product));
}
