// @vitest-environment happy-dom
// App.jsx — owns the ticked formulary and the F6 undo-reset wiring. Beyond
// this, App holds no logic of its own; Formulary/Plan/Rulebook render what
// it passes them (already covered by their own test files).
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../ui/App.jsx';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  // The F4 tick-delta message dismisses itself after a real 4 seconds
  // (App.jsx, TICK_DELTA_MS), which made the assertions below a race
  // against the machine rather than a test of the app: on CI's slower
  // runner the F1 preset test took 9.6s end to end and the message had
  // already cleared itself before the assertion ran. Neutralise that one
  // timer — and only that one, by its length, since nothing else in the
  // app schedules anything remotely that long — so userEvent's own short
  // internal delays keep running on the real clock. (Swapping in vitest's
  // fake timers wholesale does not work here: userEvent and Testing
  // Library both stall on a clock that only advances when asked.)
  const realSetTimeout = globalThis.setTimeout;
  vi.stubGlobal('setTimeout', (fn, ms, ...rest) =>
    ms >= 4000 ? 0 : realSetTimeout(fn, ms, ...rest)
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// A near-empty formulary gaps most of the 13 series at once, and each gap
// row now runs fixesForSeries' own candidate search (F2) on every render —
// real work, not a hang, but enough of it that a full App render plus two
// userEvent clicks measured 5.8s on CI's slower runner against vitest's
// 5000ms default (this file's own tests ran 3.3s-5.5s even when they
// stayed under the default locally). Raised per-file rather than patching
// just the one that tipped over, since several others in this file were
// already close to that same edge.
vi.setConfig({ testTimeout: 15000 });

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

describe('App — F4 shows the effect of a tick', () => {
  it('shows the before/after injection count next to the checklist right after a tick', async () => {
    render(<App />);
    expect(screen.queryByText(/^\d+ → \d+ injections?$/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: /Engerix-B/ }));
    expect(screen.getByText('0 → 3 injections')).toBeInTheDocument();
  });

  it('shows nothing when the tick makes no difference to the total (nothing to report)', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('checkbox', { name: /Engerix-B/ }));
    // A second, redundant hepatitis B brand doesn't change the total —
    // plan.js already prefers the first one it found.
    await userEvent.click(screen.getByRole('checkbox', { name: /Recombivax HB/ }));
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
  });
});

describe('App — F1 starting presets', () => {
  it('ticks every product in the preset and reports the injection-count effect, end to end', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /Single-brand basics/ }));
    expect(screen.getByRole('checkbox', { name: /Engerix-B/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /MenQuadfi/ })).toBeChecked();
    expect(screen.getByText('0 → 32 injections')).toBeInTheDocument();
    expect(screen.queryByText('Start from a typical formulary:')).not.toBeInTheDocument();
  });
});
