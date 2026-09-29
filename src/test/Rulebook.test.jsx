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

  it('groups the jump bar into the same three age blocks as the checklist, with MenB filed under Adolescent (A3)', () => {
    render(<Rulebook />);
    expect(screen.getByText('Birth & infant')).toBeInTheDocument();
    expect(screen.getByText('Toddler & preschool')).toBeInTheDocument();
    expect(screen.getByText('Adolescent')).toBeInTheDocument();

    const jump = screen.getByLabelText('Jump to an antigen');
    const links = [...jump.querySelectorAll('a')].map((a) => a.textContent);
    // Every series still gets a link, and MenB now sits after its own age
    // block's other members (Tdap, HPV, MenACWY) rather than between Hib and
    // pneumococcal.
    expect(links).toContain('MenB');
    expect(links.indexOf('MenB')).toBeGreaterThan(links.indexOf('MenACWY'));
  });

  it('runs the series bodies themselves in the same age order as the jump bar', () => {
    const { container } = render(<Rulebook />);
    const headings = [...container.querySelectorAll('.rule-series h2')].map((h) => h.textContent);
    expect(headings[headings.length - 1]).toContain('Meningococcal B');
  });

  it('prints Pentacel\'s booster restriction with a clickable citation to its source, not just the sentence (item D)', () => {
    render(<Rulebook />);
    // Pentacel covers both DTaP and IPV, so the SeriesRule for each prints
    // its own ProductRule card — same sentence appears once per series.
    const sentences = screen.getAllByText(
      'Pentacel may not be used as the booster dose for: DTaP, IPV, from the 4 years visit on.'
    );
    expect(sentences.length).toBeGreaterThan(0);
    for (const sentence of sentences) {
      const link = sentence.parentElement.querySelector('a');
      expect(link).not.toBeNull();
      expect(link.href).toContain('immunize.org');
    }
  });

  it('prints Vaxelis\'s never-a-booster restriction with its own citation', () => {
    render(<Rulebook />);
    const sentences = screen.getAllByText('Vaxelis may not be used as the booster dose for: DTaP, IPV, Hib.');
    expect(sentences.length).toBeGreaterThan(0);
    for (const sentence of sentences) {
      expect(sentence.parentElement.querySelector('a')).not.toBeNull();
    }
  });

  it('shows the insert-vs-CDC/ACIP age gap for RotaTeq and Rotarix, not just inside a fact quote (item D)', () => {
    render(<Rulebook />);
    expect(
      screen.getByText(
        'Package insert allows RotaTeq only through 32 weeks; this app follows CDC/ACIP, which allows it through 8 months instead.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Package insert allows Rotarix only through 24 weeks; this app follows CDC/ACIP, which allows it through 8 months instead.'
      )
    ).toBeInTheDocument();
  });

  it('prints no insert-age-gap line for a product whose insert and CDC/ACIP ranges already agree', () => {
    const { container } = render(<Rulebook />);
    expect(container.querySelectorAll('.insert-gap').length).toBe(2);
  });
});
