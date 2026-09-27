// @vitest-environment happy-dom
// Formulary.jsx — the tick list renders every non-retired product, grouped
// into a Single-vaccines section (antigen order copied live from the CDC
// 2025 schedule table, Batch C / C2) and a Combination-vaccines section
// (sub-grouped by visit, Batch C / C3), and reports ticks/resets back to the
// caller. Holds no clinical logic.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Formulary, { SINGLE_GROUP_ORDER, GROUP_HEADING } from '../ui/Formulary.jsx';
import { PRODUCTS } from '../data/products.js';

describe('Formulary', () => {
  it('renders every non-retired product, and never the retired one', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    for (const p of PRODUCTS.filter((x) => !x.retired)) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
    expect(screen.queryByText('Prevnar 13')).not.toBeInTheDocument();
  });

  it('checks the box for a ticked product and leaves the rest unchecked', () => {
    render(<Formulary ticked={new Set(['Engerix-B'])} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByRole('checkbox', { name: /Engerix-B/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Recombivax HB/ })).not.toBeChecked();
  });

  it('calls onToggle with the product name when its checkbox is clicked', async () => {
    const onToggle = vi.fn();
    render(<Formulary ticked={new Set()} onToggle={onToggle} onReset={() => {}} />);
    await userEvent.click(screen.getByRole('checkbox', { name: /Engerix-B/ }));
    expect(onToggle).toHaveBeenCalledWith('Engerix-B');
  });

  it('calls onReset when Reset is clicked', async () => {
    const onReset = vi.fn();
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalled();
  });

  // F6 — the heading states how many of the 30 active products are ticked
  it('states how many of the active products are stocked in the heading (F6)', () => {
    render(<Formulary ticked={new Set(['Engerix-B', 'RotaTeq'])} onToggle={() => {}} onReset={() => {}} />);
    const total = PRODUCTS.filter((p) => !p.retired).length;
    expect(screen.getByText(`· 2 of ${total} stocked`)).toBeInTheDocument();
  });

  // F6 — Reset used to wipe the formulary with no way back
  it('shows Undo reset instead of Reset once the formulary has just been cleared (F6)', async () => {
    const onUndoReset = vi.fn();
    render(
      <Formulary
        ticked={new Set()}
        onToggle={() => {}}
        onReset={() => {}}
        justCleared
        onUndoReset={onUndoReset}
      />
    );
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo reset' }));
    expect(onUndoReset).toHaveBeenCalled();
  });

  it('labels Prevnar 20 and Vaxneuvance by valence, not the shared PCV abbreviation — they protect against different serotypes and are not the same product', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByText('PCV20')).toBeInTheDocument();
    expect(screen.getByText('PCV15')).toBeInTheDocument();
    expect(screen.queryByText('PCV', { exact: true })).not.toBeInTheDocument();
  });

  // C1 — two top-level sections
  it('splits into a Single vaccines section and a Combination vaccines section', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByText('Single vaccines')).toBeInTheDocument();
    expect(screen.getByText('Combination vaccines')).toBeInTheDocument();
    // Vaxelis (a combination product) is not filed under a single-antigen heading
    expect(screen.getByText('Vaxelis')).toBeInTheDocument();
  });

  // C2 — singles run in the live-fetched CDC 2025 schedule-table order
  it('orders the single-vaccine antigen headings the way the CDC 2025 schedule table does, MenB last', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    const headings = screen.getAllByText((_, el) => el.classList?.contains('grp-t'));
    const headingText = headings.map((el) => el.textContent);
    const expectedOrder = SINGLE_GROUP_ORDER.map((k) => GROUP_HEADING[k]);
    // headingText includes the combo visit sub-headings too, appended after
    // all single headings — check the single-section prefix matches exactly.
    expect(headingText.slice(0, expectedOrder.length)).toEqual(expectedOrder);
  });

  // C3 — combinations sub-grouped by visit, most antigens (or most DTaP
  // doses, for the Pentacel/Pediarix tie) first within each sub-group
  it('sub-groups combinations by the visit they serve, in the queue-specified order', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByText('For the 2, 4 and 6 month visits')).toBeInTheDocument();
    expect(screen.getByText('For 12 months and 4 years')).toBeInTheDocument();
    expect(screen.getByText('For the 4-to-6 year booster')).toBeInTheDocument();

    const infantHeading = screen.getByText('For the 2, 4 and 6 month visits');
    const infantGroup = infantHeading.closest('.grp');
    const namesInOrder = within(infantGroup)
      .getAllByText((_, el) => el.classList?.contains('nm'))
      .map((el) => el.textContent);
    expect(namesInOrder).toEqual(['Vaxelis', 'Pentacel', 'Pediarix']);

    expect(screen.getByText('DTaP + polio + Hib + hep B (doses 1–3)')).toBeInTheDocument();
    expect(screen.getByText('DTaP + polio + Hib (DTaP doses 1–4)')).toBeInTheDocument();
    expect(screen.getByText('DTaP + hep B + polio (doses 1–3)')).toBeInTheDocument();
    expect(screen.getByText('MMR + chickenpox')).toBeInTheDocument();
    expect(screen.getAllByText('final DTaP + polio')).toHaveLength(2); // Kinrix, Quadracel
  });

  // C4 — consistent headings: disease names with the abbreviation in
  // parentheses where it helps, no bare-abbreviation-next-to-plain-English mix
  it('uses full, consistent antigen headings instead of bare abbreviations', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByText('Diphtheria, tetanus, pertussis (DTaP)')).toBeInTheDocument();
    expect(screen.getByText('Polio (IPV)')).toBeInTheDocument();
    expect(screen.getByText('Measles, mumps, rubella (MMR)')).toBeInTheDocument();
    expect(screen.getByText('Chickenpox (varicella)')).toBeInTheDocument();
    expect(screen.getByText('Tdap booster')).toBeInTheDocument();
    expect(screen.getByText('Meningococcal ACWY')).toBeInTheDocument();
    expect(screen.getByText('Meningococcal B')).toBeInTheDocument();
    // 'Shared-decision products' is no longer its own group heading
    expect(screen.queryByText('Shared-decision products')).not.toBeInTheDocument();
  });

  it('shows the shared-decision note as text under the Meningococcal B heading, not a tinted section', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    const heading = screen.getByText('Meningococcal B');
    const group = heading.closest('.grp');
    expect(group.className).not.toMatch(/sdmgrp/);
    expect(within(group).getByText(/shared clinical decision-making/i)).toBeInTheDocument();
  });

  // C5 — drop the redundant sub-line on plain singles, keep the dose count
  it('shows a dose count instead of a repeated abbreviation on plain single vaccines', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    const pedvax = screen.getByText('PedvaxHIB').closest('.chk');
    const acthib = screen.getByText('ActHIB').closest('.chk');
    expect(within(pedvax).getByText('3 doses')).toBeInTheDocument();
    expect(within(acthib).getByText('4 doses')).toBeInTheDocument();
    // No bare series-abbreviation sub-line left on a plain single like DTaP
    expect(screen.queryByText('DTaP', { selector: '.cv' })).not.toBeInTheDocument();
  });

  it('keeps the abbreviation sub-line on the two oral products', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getAllByText('RV · oral')).toHaveLength(2); // Rotarix, RotaTeq
  });

  // D1 — a one-line phone summary that opens/closes the checklist. The
  // media query that hides the full list below 860px lives in theme.css and
  // isn't exercised by happy-dom, so this test covers the structural/JS half
  // (the toggle button, its label, its state) that CSS alone can't.
  describe('the phone-summary toggle (D1)', () => {
    it('states how many products are stocked, singular and plural', () => {
      const { rerender } = render(
        <Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />
      );
      expect(screen.getByText('0 products stocked')).toBeInTheDocument();

      rerender(<Formulary ticked={new Set(['Engerix-B'])} onToggle={() => {}} onReset={() => {}} />);
      expect(screen.getByText('1 product stocked')).toBeInTheDocument();

      rerender(
        <Formulary
          ticked={new Set(['Engerix-B', 'Recombivax HB'])}
          onToggle={() => {}}
          onReset={() => {}}
        />
      );
      expect(screen.getByText('2 products stocked')).toBeInTheDocument();
    });

    it('starts closed and opens on tap, exposing aria-expanded and an .open class for the mobile CSS to key off', async () => {
      const { container } = render(
        <Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />
      );
      const toggle = screen.getByRole('button', { name: /products stocked/i });
      const rail = container.querySelector('.rail');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(within(toggle).getByText('Change')).toBeInTheDocument();
      expect(rail.className).not.toMatch(/\bopen\b/);

      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(within(toggle).getByText('Done')).toBeInTheDocument();
      expect(rail.className).toMatch(/\bopen\b/);
    });

    it('closes again on a second tap (and by keyboard, since it is a real button)', async () => {
      const { container } = render(
        <Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />
      );
      const toggle = screen.getByRole('button', { name: /products stocked/i });
      const rail = container.querySelector('.rail');

      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      toggle.focus();
      await userEvent.keyboard('{Enter}');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(rail.className).not.toMatch(/\bopen\b/);
    });

    it('the full checklist (Your formulary, Reset, every product) is always present in the DOM — CSS alone decides whether it shows, so desktop never loses it', () => {
      render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
      expect(screen.getByText('Your formulary')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
      expect(screen.getByText('Single vaccines')).toBeInTheDocument();
    });
  });

  // F1 — one-tap starting formularies, offered only before anything is ticked
  describe('starting presets (F1)', () => {
    it('offers both presets when nothing is ticked yet', () => {
      render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} onApplyPreset={() => {}} />);
      expect(screen.getByText('Start from a typical formulary:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Single-brand basics/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Fewest injections/ })).toBeInTheDocument();
    });

    it('disappears once a clinic has its own formulary going', () => {
      render(
        <Formulary
          ticked={new Set(['Engerix-B'])}
          onToggle={() => {}}
          onReset={() => {}}
          onApplyPreset={() => {}}
        />
      );
      expect(screen.queryByText('Start from a typical formulary:')).not.toBeInTheDocument();
    });

    it('applies the preset\'s product list when tapped', async () => {
      const onApplyPreset = vi.fn();
      render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} onApplyPreset={onApplyPreset} />);
      await userEvent.click(screen.getByRole('button', { name: /Single-brand basics/ }));
      expect(onApplyPreset).toHaveBeenCalledTimes(1);
      const [products] = onApplyPreset.mock.calls[0];
      expect(products).toContain('Engerix-B');
      expect(products).toContain('MenQuadfi');
    });
  });
});
