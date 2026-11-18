# Compiling once: the plan for setting out's seconds (lever 3)

The third of the six shared mechanisms (the owner, 18 November, approved). Rows: AX-03, AX-04, AX-06, AX-08, OR-08,
OR-23, OR-44, and S1-3's one defect (setting out 10.8 s on a laptop, 7.8 s on a phone: recordings/s1-3-opening.md).

## Measured (18 November, `bun scripts/load-costs.ts full`; a CPU profile of a cold and a warm start)

| Start | Total | Parse | Installs (40) | Campaign |
|---|---|---|---|---|
| cold (no parse kept) | 14.4 s | 153 parses, 3.4 MB, 8.2 s | 6.3 s | 12.8 s |
| warm (the parse store on disk) | 5.9 s | none | 2.2 s | 4.7 s |

- At a reader's pace the start made ready during creation already hides most of it (OR-08: 1.4–3.1 s from release);
  what cannot be hidden is the install chain, 4.2–5.3 s in the browser, because the protagonist's name is in every
  placement's context, so nothing of it can start before the last choice (first-touch-performance.md §6).
- `structuredClone` is the largest single self cost of a start (2.56 s over a cold and a warm run), spread over the
  actions' grounding, each install's copy of the shared rules (`ModuleBundle.loading`), composition, and world changes;
  the ohm parser is the rest of the cold cost.

## The plan, in order of saving and risk

1. **Compiled modules kept by text** (about −2.5 s warm, no world changes): a module's compiled form keyed by the hash
   of its text and the shared rules' edition, kept in memory and in the page's store.
2. **The shared rules composed once per edition** (AX-03, about −0.9 s): composed and validated once, every install
   referring to them, after proving that a shared declaration's validity does not depend on the module beside it.
3. **Copies at handoffs only where something will change** (about −1.0 s): the shared rules' copy per install, the
   actions' grounding, the world's changes, each by the immutability its readers already keep.
4. **The name out of the installs' inputs** (lets the chain be prepared during creation): the country's people drawn
   without reference to the protagonist's name, a collision settled after. Changes generated worlds (traces, fixtures):
   last, and measured.

Each step keeps the determinism pins (test/set-out-ready: a checkpoint byte-equal to a cold set-out) and is measured
by `scripts/load-costs.ts` and the S1-3 recorder before and after. The profile is kept at
/var/tmp/kyrie/m22/prof/full-warm.md.
