// @vitest-environment happy-dom
// Plan.jsx — renders buildPlan/score/suggest's own output. Makes no
// scheduling decision itself; these tests check the render matches what the
// (separately tested) logic layer already computed for a few real
// formularies, not a second copy of the scheduling rules.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Plan from '../ui/Plan.jsx';
import { PRODUCTS } from '../data/products.js';
import { PRESETS } from '../data/presets.js';
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';
import { suggest } from '../logic/suggest.js';

const ALL_PRODUCTS = new Set(PRODUCTS.filter((p) => !p.retired).map((p) => p.name));

describe('Plan — nothing stocked', () => {
  it('shows a gap for every routine antigen and never renders an actual shot', () => {
    const { container } = render(<Plan ticked={new Set()} onAddProduct={() => {}} />);
    expect(screen.getByText('Nothing in your formulary covers these doses.')).toBeInTheDocument();
    expect(screen.getByText('Diphtheria, tetanus, pertussis')).toBeInTheDocument();
    expect(container.querySelectorAll('.shot')).toHaveLength(0);
  });

  // F2 — each gapped dose gets its own fix suggestion
  it('offers an Add button naming a real product for each gapped dose (F2)', async () => {
    const onAddProduct = vi.fn();
    render(<Plan ticked={new Set()} onAddProduct={onAddProduct} />);
    const hepaGroup = screen.getByText('Hepatitis A').closest('li');
    expect(within(hepaGroup).getByText(/Nothing covers dose 1 of 2\./)).toBeInTheDocument();
    const [addHepA] = within(hepaGroup).getAllByRole('button', { name: 'Add Havrix' });
    await userEvent.click(addHepA);
    expect(onAddProduct).toHaveBeenCalledWith('Havrix');
  });
});

describe('Plan — every current product stocked', () => {
  const score = scorePlan(buildPlan(ALL_PRODUCTS));

  it('shows the actual injection and visit counts from the logic layer, and no gaps panel', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(screen.getByText(String(score.injections))).toBeInTheDocument();
    expect(screen.getByText(String(score.visits))).toBeInTheDocument();
    expect(screen.queryByText('Nothing in your formulary covers these doses.')).not.toBeInTheDocument();
  });

  it('has nothing left to suggest', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(screen.getByText('Nothing left to add would save an injection.')).toBeInTheDocument();
  });

  it('shows Pentacel carrying DTaP and Hib together, said in the sentence rather than a "Combination" chip (E3)', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const pentacelShots = [...container.querySelectorAll('.shot')].filter((shot) =>
      shot.querySelector('.shot-nm').textContent.startsWith('Pentacel')
    );
    expect(pentacelShots.length).toBeGreaterThan(0);
    const sayItInWords = pentacelShots.every((shot) =>
      /One injection covering (two|three|four) vaccines/.test(shot.textContent)
    );
    expect(sayItInWords).toBe(true);
    // No shot anywhere still renders the redundant chip — every combination
    // shot already says so in the lead-in sentence.
    expect(container.querySelectorAll('.tag.combo')).toHaveLength(0);
  });

  // Item B (2026-09-28 brand-indication queue). Pentacel contains polio and
  // is given at 15 months, so that shot is a real 4th polio dose. Until
  // item B the card said "covering two vaccines" and listed only DTaP and
  // Hib — the polio dose was delivered and never shown.
  it('shows Pentacel\'s polio dose at 15 months, counted out of five', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const pentacel = [...container.querySelectorAll('.shot')].find((shot) =>
      shot.querySelector('.shot-nm').textContent.startsWith('Pentacel')
    );
    expect(pentacel).toBeDefined();
    expect(pentacel.textContent).toMatch(/One injection covering three vaccines/);
    const antigens = [...pentacel.querySelectorAll('.ant')].map((a) => a.textContent);
    expect(antigens).toContain('IPVDose 4 of 5');
  });
});

// Item B. A clinic stocking only Pentacel gets an honest 4-year gap:
// Pentacel must not be used as the 4-6 year booster, and its polio content
// means it cannot be given at a visit where polio is not also due.
describe('Plan — a Pentacel-only clinic', () => {
  it('leaves the 4-year visit empty and names the missing polio and DTaP doses', () => {
    const { container } = render(<Plan ticked={new Set(['Pentacel'])} onAddProduct={() => {}} />);
    const gapPanel = screen.getByText('Nothing in your formulary covers these doses.').closest('.panel');
    const polio = within(gapPanel).getByText('Inactivated poliovirus').closest('li');
    expect(within(polio).getByText(/Nothing covers dose 5 of 5\./)).toBeInTheDocument();
    const dtap = within(gapPanel).getByText('Diphtheria, tetanus, pertussis').closest('li');
    expect(within(dtap).getByText(/Nothing covers dose 5 of 5\./)).toBeInTheDocument();
    // ...and no shot anywhere is Pentacel at a visit past the 15-month one.
    const pentacelShots = [...container.querySelectorAll('.shot')].filter((s) =>
      s.querySelector('.shot-nm').textContent.startsWith('Pentacel')
    );
    expect(pentacelShots).toHaveLength(4);
  });
});

describe('Plan — every current product stocked, including Bexsero (A5, E3)', () => {
  it('states a shared-decision product is included, without contradicting the schedule below it', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText('shared-decision product in this plan')).toBeInTheDocument();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
  });

  it('drops the redundant "Shared decision" chip — the sdmline sentence beneath the shot already says it', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(container.querySelectorAll('.tag.sdm')).toHaveLength(0);
    expect(screen.getAllByText(/shared clinical decision-making/).length).toBeGreaterThan(0);
  });
});

// Owner decision 2026-09-29: a shared-decision shot is a shot. It was the
// one kind of dose the app singled out — tinted purple, and subtracted from
// its own visit's injection count ("0 injections + 1 shared-decision") while
// the total at the top of the page counted it all along. The owner's reason
// for ending that is the cleanest argument available: a pentavalent
// (Penbraya/Penmenvy) carries a routine MenACWY dose and a shared-decision
// MenB dose in ONE syringe, and it has never been tinted or discounted,
// because `isSdmShot` only fires when EVERY antigen in the shot is
// shared-decision. So the same MenB antigen was being counted or not counted
// depending on which product delivered it.
//
// Whether to give it is a conversation, and the sentence under the shot is
// where that conversation belongs. How many times the child is injected is
// not a matter of opinion.
describe('Plan — a shared-decision dose is counted and drawn like any other', () => {
  it('counts it in its own visit header instead of setting it to one side', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const headers = [...container.querySelectorAll('.v-meta')].map((el) => el.textContent);
    expect(headers.some((h) => /shared-decision/.test(h))).toBe(false);
    expect(headers.some((h) => /^0 injections/.test(h))).toBe(false);
  });

  it("every visit's injection count adds up to the total at the top of the page", () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const perVisit = [...container.querySelectorAll('.v-meta')].map((el) => {
      const m = el.textContent.match(/^(\d+) injections?/);
      expect(m).not.toBeNull();
      return Number(m[1]);
    });
    const summed = perVisit.reduce((a, b) => a + b, 0);
    expect(summed).toBe(scorePlan(buildPlan(ALL_PRODUCTS)).injections);
  });

  it('gives it no tint of its own — the same treatment a pentavalent already gets', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(container.querySelectorAll('.sdmvisit')).toHaveLength(0);
    expect(container.querySelectorAll('.sdmshot')).toHaveLength(0);
  });

  it('drops the shared-decision entry from the colour legend, leaving three', () => {
    const { container } = render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const swatches = [...container.querySelectorAll('.legend .sw')];
    expect(swatches).toHaveLength(3);
    expect(container.querySelector('.legend').textContent).not.toMatch(/Shared decision/);
  });

  it('still says in words that the dose is not routine', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(screen.getAllByText(/shared clinical decision-making/).length).toBeGreaterThan(0);
  });
});

// The two advisory panels are computed from a deferred copy of the
// formulary so the schedule can paint immediately (see Plan.jsx's comment
// for the measurements). That means they can briefly hold the previous
// formulary's answer. The one case where stale advice would actually
// mislead — being told to stock something already in the fridge — is closed
// by filtering the list against the CURRENT formulary on the way out, and
// this is that guard.
describe('Plan — advice is never about a product you already stock', () => {
  it.each([
    ['nothing stocked', new Set()],
    ['everything stocked', ALL_PRODUCTS],
    ['one combination product only', new Set(['Pentacel'])],
    ['a preset', new Set(PRESETS[0].products)],
  ])('%s: no suggestion names a ticked product', (_label, ticked) => {
    const { container } = render(<Plan ticked={ticked} onAddProduct={() => {}} />);
    const named = [...container.querySelectorAll('.sugg-row .s-nm')].map((el) =>
      el.childNodes[0].textContent.trim()
    );
    for (const name of named) expect(ticked.has(name)).toBe(false);
  });

  it('still reaches the right answer once settled — every suggestion matches suggest()', () => {
    const ticked = new Set(PRESETS[0].products);
    const { container } = render(<Plan ticked={ticked} onAddProduct={() => {}} />);
    const shown = [...container.querySelectorAll('.sugg-row .s-nm')].map((el) =>
      el.childNodes[0].textContent.trim()
    );
    expect(shown).toEqual(suggest(ticked).map((s) => s.product));
  });
});

describe('Plan — a formulary with a real gap names which antigens (E4)', () => {
  it('states the missing antigens in a sentence instead of a bare failing count', () => {
    render(<Plan ticked={new Set()} onAddProduct={() => {}} />);
    expect(screen.getByText(/No product covers .* — see the list below\./)).toBeInTheDocument();
    expect(screen.queryByText('antigens you cannot cover')).not.toBeInTheDocument();
  });
});

describe('Plan — the empty-visit line (A4)', () => {
  it('collapses consecutive same-unit ages into a range, below the schedule, in one sentence', () => {
    const { container } = render(<Plan ticked={new Set()} onAddProduct={() => {}} />);
    const line = screen.getByText('No vaccine is due at the other well-child visits:');
    expect(line.parentElement.textContent).toMatch(/5 to 10 years/);
    // It must come after the last visit card, not above the schedule.
    const visits = [...container.querySelectorAll('.visit')];
    const lastVisit = visits[visits.length - 1];
    expect(lastVisit.compareDocumentPosition(line.parentElement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('Plan — a combination shot spells out the antigen count (A6)', () => {
  it('says "covering three vaccines" instead of "3 vaccines — covers"', () => {
    render(<Plan ticked={new Set(['Pentacel', 'Prevnar 20', 'Rotarix', 'Engerix-B'])} onAddProduct={() => {}} />);
    expect(screen.getAllByText('One injection covering three vaccines:').length).toBeGreaterThan(0);
  });
});

describe('Plan — a clinic with no combination products, and PedvaxHIB unstocked', () => {
  const ticked = new Set(['Engerix-B', 'ActHIB', 'Daptacel', 'IPOL', 'Prevnar 20', 'Rotarix']);

  // F3 — moved up beside the injection count, ahead of the schedule itself
  it('places "Products that would save injections" right after the stat tiles, before any visit card (F3)', () => {
    const { container } = render(<Plan ticked={ticked} onAddProduct={() => {}} />);
    const sum = container.querySelector('.sum');
    const suggPanel = screen.getByText('Products that would save injections').closest('.panel');
    const firstVisit = container.querySelector('.visit');
    expect(sum.compareDocumentPosition(suggPanel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(suggPanel.compareDocumentPosition(firstVisit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('offers Vaxelis and PedvaxHIB as suggestions, and clicking Add reports the right product', async () => {
    const onAddProduct = vi.fn();
    render(<Plan ticked={ticked} onAddProduct={onAddProduct} />);
    expect(screen.getByText('Vaxelis')).toBeInTheDocument();
    expect(screen.getByText('PedvaxHIB')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: 'Add' });
    await userEvent.click(buttons[0]);
    expect(onAddProduct).toHaveBeenCalledWith('Vaxelis');
  });

  it('explains why Hib stays 4-dose (no shorter-path product stocked), without leading with the absence', () => {
    render(<Plan ticked={ticked} onAddProduct={() => {}} />);
    expect(screen.getByText(/Hib — 4 doses at 2, 4, 6 and 12–15 months\./)).toBeInTheDocument();
    expect(screen.queryByText(/None of the shorter-series products are stocked/)).not.toBeInTheDocument();
  });

  it('renames the series-length panel to say what it actually explains (B4)', () => {
    render(<Plan ticked={ticked} onAddProduct={() => {}} />);
    expect(screen.getByText('Dose counts set by the brands you stock')).toBeInTheDocument();
  });
});

// Item E, 2026-09-29. CLAUDE.md requires both layers for anything visible:
// pentavalent.test.js proves the planner's answer, these prove the clinician
// actually sees it — the one-injection 16-year visit, and the honest gap a
// clinic gets when it stocks a pentavalent without its family's plain brand.
describe('Plan — a pentavalent MenABCWY product', () => {
  const withPartner = new Set(['Penbraya', 'Trumenba', 'MenQuadfi']);
  const withoutPartner = new Set(['Penbraya', 'MenQuadfi']);

  function shotsNamed(container, name) {
    return [...container.querySelectorAll('.shot')].filter((shot) =>
      shot.querySelector('.shot-nm').textContent.startsWith(name)
    );
  }

  it('shows the 16-year visit as one injection carrying both MenACWY and MenB', () => {
    const { container } = render(<Plan ticked={withPartner} onAddProduct={() => {}} />);
    const [penbraya] = shotsNamed(container, 'Penbraya');
    expect(penbraya).toBeDefined();
    expect(penbraya.textContent).toMatch(/One injection covering two vaccines/);
    expect(penbraya.textContent).toContain('MenACWY');
    expect(penbraya.textContent).toContain('MenB');
  });

  it('never shows a second pentavalent dose — the plain brand finishes the series', () => {
    const { container } = render(<Plan ticked={withPartner} onAddProduct={() => {}} />);
    expect(shotsNamed(container, 'Penbraya')).toHaveLength(1);
    expect(shotsNamed(container, 'Trumenba')).toHaveLength(1);
  });

  it('without the matching plain brand, shows a MenB gap offering the right partner by name', async () => {
    const onAddProduct = vi.fn();
    const { container } = render(<Plan ticked={withoutPartner} onAddProduct={onAddProduct} />);
    // The pentavalent still gives dose 1 — the gap is dose 2 only.
    expect(shotsNamed(container, 'Penbraya')).toHaveLength(1);
    const menbGroup = screen.getByText('Meningococcal B').closest('li');
    expect(within(menbGroup).getByText(/Nothing covers dose 2 of 2\./)).toBeInTheDocument();
    // Trumenba, not Bexsero: Penbraya's MenB half is the FHbp family.
    const [addPartner] = within(menbGroup).getAllByRole('button', { name: 'Add Trumenba' });
    await userEvent.click(addPartner);
    expect(onAddProduct).toHaveBeenCalledWith('Trumenba');
  });

  it('is not offered at the 11-year visit, where only MenACWY is due', () => {
    const { container } = render(<Plan ticked={withoutPartner} onAddProduct={() => {}} />);
    const y11 = [...container.querySelectorAll('.visit')].find((v) =>
      v.textContent.includes('11 years')
    );
    expect(y11).toBeDefined();
    expect(y11.textContent).toContain('MenQuadfi');
    expect(y11.textContent).not.toContain('Penbraya');
  });
});

// 2026-09-29. The note under a shot ("Earliest due at …; scheduled at …
// instead to combine with another vaccine…") was wrong in two independent
// ways at the 17-year visit — see placement.test.js's header for both. These
// are the rendering half of that fix: placement.test.js proves the sentence
// is right, these prove the clinician is shown the right sentence.
describe('Plan — why a dose sits at the visit it does', () => {
  const FEWEST = new Set(PRESETS.find((p) => p.id === 'fewest').products);
  const BASICS = new Set(PRESETS.find((p) => p.id === 'basics').products);

  function visitCard(container, label) {
    return [...container.querySelectorAll('.visit')].find(
      (v) => v.querySelector('.v-age').textContent === label
    );
  }

  it('does not tell the clinician MenB dose 2 could have been given at 16 years', () => {
    const { container } = render(<Plan ticked={FEWEST} onAddProduct={() => {}} />);
    const y17 = visitCard(container, '17 years');
    expect(y17).toBeDefined();
    expect(y17.textContent).toContain('Bexsero');
    const note = y17.querySelector('.seriesnote');
    expect(note).not.toBeNull();
    expect(note.textContent).not.toMatch(/Earliest due at 16 years/);
    expect(note.textContent).not.toMatch(/as early as 16 years/);
  });

  it('does not tell the clinician the 17-year dose was combined with anything', () => {
    const { container } = render(<Plan ticked={FEWEST} onAddProduct={() => {}} />);
    const y17 = visitCard(container, '17 years');
    // One shot only, so there is nothing it could have been combined with.
    expect(y17.querySelectorAll('.shot')).toHaveLength(1);
    expect(y17.querySelector('.seriesnote').textContent).not.toMatch(/combine|one injection covers/i);
  });

  it('tells the clinician the real reason instead — the interval after the previous dose', () => {
    const { container } = render(<Plan ticked={FEWEST} onAddProduct={() => {}} />);
    const note = visitCard(container, '17 years').querySelector('.seriesnote').textContent;
    expect(note).toMatch(/minimum interval/);
    expect(note).toMatch(/17 years is the earliest visit that can give it/);
  });

  it('still explains a dose that really was held back to share one syringe (15-month Pentacel)', () => {
    const { container } = render(<Plan ticked={FEWEST} onAddProduct={() => {}} />);
    const note = visitCard(container, '15 months').querySelector('.seriesnote').textContent;
    expect(note).toMatch(/as early as 12 months/);
    expect(note).toMatch(/one injection covers it together with the other vaccines due at that visit/);
  });

  it('never claims a saved injection for a dose that is still its own shot (2-month hepatitis B)', () => {
    const { container } = render(<Plan ticked={BASICS} onAddProduct={() => {}} />);
    const m2 = visitCard(container, '2 months');
    const engerix = [...m2.querySelectorAll('.shot')].find((s) =>
      s.querySelector('.shot-nm').textContent.startsWith('Engerix-B')
    );
    expect(engerix).toBeDefined();
    const note = engerix.querySelector('.seriesnote').textContent;
    expect(note).toMatch(/where other vaccines are already due/);
    expect(note).not.toMatch(/combine|one injection covers|without an extra injection/i);
  });
});
