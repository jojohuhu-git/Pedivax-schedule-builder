// @vitest-environment happy-dom
// Formulary.jsx — the tick list renders every non-retired product, grouped,
// and reports ticks/resets back to the caller. Holds no clinical logic.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Formulary from '../ui/Formulary.jsx';
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

  it('shows which antigens each product covers', () => {
    render(<Formulary ticked={new Set()} onToggle={() => {}} onReset={() => {}} />);
    expect(screen.getByText('DTaP + IPV + Hib + HepB')).toBeInTheDocument(); // Vaxelis
    expect(screen.getAllByText('RV · oral')).toHaveLength(2); // Rotarix, RotaTeq
  });
});
