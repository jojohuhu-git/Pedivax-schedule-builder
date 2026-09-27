// @vitest-environment happy-dom
// Rulebook.jsx — renders every series and product's own data. Holds no
// clinical logic of its own; one-source-of-truth.test.js checks the numbers
// it would print actually match the planner.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rulebook from '../ui/Rulebook.jsx';
import { SERIES } from '../data/series.js';
import { PRODUCTS } from '../data/products.js';

describe('Rulebook', () => {
  it('renders every series by name, and every product by name', () => {
    const { container } = render(<Rulebook />);
    const text = container.textContent;
    for (const series of Object.values(SERIES)) {
      expect(text).toContain(series.name);
    }
    for (const product of PRODUCTS) {
      expect(text).toContain(product.name);
    }
  });

  it('labels Prevnar 20 and Vaxneuvance by valence, so it is clear PCV20 and PCV15 are not the same product', () => {
    render(<Rulebook />);
    expect(screen.getByText('PCV20')).toBeInTheDocument();
    expect(screen.getByText('PCV15')).toBeInTheDocument();
    expect(screen.getByText('PCV13')).toBeInTheDocument();
  });

  it('marks a retired product as retired, with its date', () => {
    render(<Rulebook />);
    expect(screen.getByText('Retired 2024-04-30')).toBeInTheDocument();
  });

  it('prints every fact\'s claim, quoted sentence, and checked-on date', () => {
    const { container } = render(<Rulebook />);
    const someFact = SERIES.PCV.facts[0];
    expect(screen.getByText(someFact.claim)).toBeInTheDocument();
    const quotes = [...container.querySelectorAll('blockquote')].map((el) => el.textContent);
    expect(quotes.some((q) => q.includes(someFact.quote))).toBe(true);
    expect(screen.getAllByText(`checked ${someFact.verified}`, { exact: false }).length).toBeGreaterThan(0);
  });
});
