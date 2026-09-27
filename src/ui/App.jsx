// The app shell — docs/data-design.md's App.jsx. Owns the ticked formulary
// (the only state this app has) and keeps it in the URL `?s=` and in
// localStorage, so a clinic can bookmark or share its own formulary
// (docs/decisions.md, "State", same pattern as vaxapp). No date of birth and
// no patient information is ever entered or stored.
import { useEffect, useState } from 'react';
import { PRODUCTS } from '../data/products.js';
import Formulary from './Formulary.jsx';
import Plan from './Plan.jsx';
import Rulebook from './Rulebook.jsx';
import './theme.css';
import './print.css';

const STORAGE_KEY = 'pedivax-formulary';
const VALID_NAMES = new Set(PRODUCTS.filter((p) => !p.retired).map((p) => p.name));

function encodeFormulary(ticked) {
  return [...ticked].map(encodeURIComponent).join(',');
}

function decodeFormularyParam(raw) {
  if (!raw) return null;
  const names = raw.split(',').map(decodeURIComponent).filter((n) => VALID_NAMES.has(n));
  return new Set(names);
}

function readStoredFormulary() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!Array.isArray(raw)) return null;
    return new Set(raw.filter((n) => VALID_NAMES.has(n)));
  } catch {
    // localStorage unavailable or corrupt — fall through to an empty formulary rather than guessing.
    return null;
  }
}

function initialFormulary() {
  const fromUrl = decodeFormularyParam(new URLSearchParams(window.location.search).get('s'));
  if (fromUrl !== null) return fromUrl;
  return readStoredFormulary() ?? new Set();
}

export default function App() {
  const [ticked, setTicked] = useState(initialFormulary);
  const [view, setView] = useState('plan');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (ticked.size) params.set('s', encodeFormulary(ticked));
    else params.delete('s');
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ticked]));
    } catch {
      // Private browsing or storage disabled — the URL still carries state for this session.
    }
  }, [ticked]);

  const toggle = (name) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const add = (name) => {
    setTicked((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));
  };

  const reset = () => setTicked(new Set());

  return (
    <>
      <header>
        <div className="h-top">
          <div>
            <div className="eyebrow">Healthy child, birth to 18 years · no prior vaccines</div>
            <h1>Pedivax Schedule Builder</h1>
            <p className="sub">
              {view === 'plan'
                ? 'Tick the vaccine products your clinic stocks. The plan below shows every visit from birth to 18 years for a healthy child with no prior vaccines, and which antigen each shot covers.'
                : "Every schedule rule and every product rule the plan uses, with its source and the sentence it was read from."}
            </p>
          </div>
          <div className="btns">
            <nav className="viewnav">
              <button
                type="button"
                className={view === 'plan' ? 'active' : ''}
                onClick={() => setView('plan')}
              >
                Plan
              </button>
              <button
                type="button"
                className={view === 'rulebook' ? 'active' : ''}
                onClick={() => setView('rulebook')}
              >
                Rulebook
              </button>
            </nav>
            <button id="print" type="button" onClick={() => window.print()}>
              Print / save PDF
            </button>
          </div>
        </div>
        {view === 'plan' && (
          <div className="banner">
            <div className="note">
              <b>Not included in this plan:</b> influenza (every year from 6 months) and COVID-19 (per current
              season) follow their own annual cadence, not fixed well-child ages. RSV antibody is seasonal and is
              not a vaccine series. Give these alongside the plan below.
            </div>
          </div>
        )}
      </header>

      {view === 'plan' ? (
        <div className="wrap">
          <Formulary ticked={ticked} onToggle={toggle} onReset={reset} />
          <Plan ticked={ticked} onAddProduct={add} />
        </div>
      ) : (
        <Rulebook />
      )}

      <footer>Pedivax Schedule Builder · healthy child, no prior doses, no risk factors.</footer>
    </>
  );
}
