# PediVax Schedule Builder

A clinician ticks the vaccine products their clinic actually stocks. The app plans the
most efficient birth-to-18 schedule those products can deliver, for a healthy child who
has had no vaccines yet.

Nothing here is real code yet. This folder holds the working mockups and the decisions
behind them, so the design can be looked at and argued with before anything is built.

## What's in here

| File | What it is |
|---|---|
| `mockups/formulary-planner.html` | The planner. Tick products on the left, the plan recomputes. |
| `mockups/rulebook.html` | The reference side. Every rule with the sentence it came from. |
| `docs/decisions.md` | Settled decisions and still-open questions. |
| `docs/data-design.md` | The folder layout and the shape of the data files. |
| `docs/updates/INBOX.md` | Paste links to new vaccine information here. |

Open either mockup by double-clicking it — they are single files and need no server.

Live links:
- Planner — https://claude.ai/artifact/1APCVGJGKMRExNrakAaSvE
- Rulebook — https://claude.ai/artifact/8RcXuxbBCLmLLU32GS9wHw

## The one rule the whole design rests on

The rulebook is **generated from the same data the planner uses**. It is not written
alongside it. So the rulebook cannot say "MMR dose 2 at 4 years" while the planner
schedules something else — both are reading the same line. Every rule in that data
carries its source, the exact quoted sentence, and the date somebody last read it.

## Scope, for now

Healthy children only. No risk conditions, no catch-up, no flu or COVID inside the plan.

## Keeping it current

New vaccine information goes in `docs/updates/INBOX.md` — paste a link, nothing else
required. Saved copies of the pages live in `docs/updates/sources/`, because a URL can be
replaced with a different edition and a quote has to stay traceable. Every processed link
leaves a dated note in `docs/updates/applied/` saying what changed and what did not.

A test fails when any quoted rule has gone twelve months without being re-read. That is
the other half of the loop: it tells you what to go and look up.

## Next

The layout and data design are settled — see `docs/data-design.md`. The first build
task is to scaffold the app and write `CLAUDE.md` from that document.
