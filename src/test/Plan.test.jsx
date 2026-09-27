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
import { buildPlan } from '../logic/plan.js';
import { scorePlan } from '../logic/score.js';

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

  it('shows Pentacel carrying DTaP and Hib together, tagged as a combination product', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    const pentacel = screen.getByText('Pentacel');
    expect(pentacel.parentElement.querySelector('.tag.combo')).toHaveTextContent('Combination');
  });
});

describe('Plan — every current product stocked, including Bexsero (A5)', () => {
  it('states a shared-decision product is included, without contradicting the schedule below it', () => {
    render(<Plan ticked={ALL_PRODUCTS} onAddProduct={() => {}} />);
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText('shared-decision product in this plan')).toBeInTheDocument();
    expect(screen.queryByText('None')).not.toBeInTheDocument();
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
