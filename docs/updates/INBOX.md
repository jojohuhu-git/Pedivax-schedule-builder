# Vaccine update inbox

**Paste links here.** One per line. No format rules, no headings to keep tidy — a bare
URL is enough, a sentence of context is better. Anything in this file is unprocessed.

Next agent session: read this file first, before anything else.

---

## Unprocessed

<!-- paste below this line -->


---

## How this gets handled (for the agent, not for Joanne)

For each line above:

1. **Fetch the link live.** Follow the `verify-clinical-source` skill. Never work from
   the pasted text alone, and never from memory.
2. **Check it against the authority pin** in `docs/decisions.md` — this app follows
   guidance as it stood before the mid-2025 federal changes, plus AAP, and AAP governs
   disagreements. A post-mid-2025 CDC change is *recorded* but does **not** change a rule.
   Say so explicitly rather than silently ignoring it.
3. **Save a copy of the page or PDF** into `docs/updates/sources/`. URLs get replaced;
   the quote in the data file has to stay traceable to something that cannot change.
4. **Change the data file** if the rule actually moved — including the quoted sentence,
   the source label with its edition and date, and a fresh `verified:` date.
5. **Write a note** in `docs/updates/applied/` named `YYYY-MM-DD-short-slug.md` covering:
   - the link, and what it said
   - whether it changed a rule, or was recorded and not applied, and why
   - **which other apps owe the same change** — MeningoVax or PneumoVax — or "none".
     **vaxapp is not a port target**: the owner is rebuilding it, so nothing is owed
     back to it. Copy logic *out* of vaxapp freely; never file work *into* it.
6. **Move the line out of Unprocessed.** Never delete it.

The twelve-month staleness test is the other half of this loop: when it fails, it is
telling Joanne which quote needs re-reading, and the fresh link comes back in here.
