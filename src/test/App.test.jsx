// @vitest-environment happy-dom
// App.jsx — owns the ticked formulary and the F6 undo-reset wiring. Beyond
// this, App holds no logic of its own; Formulary/Plan/Rulebook render what
// it passes them (already covered by their own test files).
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../ui/App.jsx';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  localStorage.clear();
});

describe('App — F6 Reset is undoable', () => {
  it('offers Undo reset in place of Reset right after clearing a non-empty formulary', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('checkbox', { name: /Engerix-B/ }));
    expect(screen.getByRole('checkbox', { name: /Engerix-B/ })).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('checkbox', { name: /Engerix-B/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Undo reset' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Undo reset' }));
    expect(screen.getByRole('checkbox', { name: /Engerix-B/ })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('drops the undo option once the clinician ticks something new — the old formulary is no longer "one click away"', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('checkbox', { name: /Engerix-B/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: 'Undo reset' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: /RotaTeq/ }));
    expect(screen.queryByRole('button', { name: 'Undo reset' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('does nothing when Reset is clicked on an already-empty formulary — nothing to undo', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByRole('button', { name: 'Undo reset' })).not.toBeInTheDocument();
  });
});
