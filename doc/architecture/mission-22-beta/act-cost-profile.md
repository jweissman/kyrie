# Where an act's time goes (23 November)

The owner asked why an ordinary act takes ~110–130 ms headless when a pure decision should take milliseconds, with a
target of **15 ms for a headless decision**, and whether a Rust/wasm core would help. This measures it, with no engine
change, on the warrior's golden walk (Iscoed, 44 turns), using stage timers and Bun's CPU profiler
(`bun --cpu-prof`).

## Stages

| Stage | Median | p90 | Worst |
|---|---|---|---|
| **The simulation alone:** one campaign act done (`Campaign.execute`) | **6.1 ms** | 26 ms | 63 ms |
| A turn through the runner, everything included | 127 ms | 285 ms | 997 ms |
| The screen built (`ScreenModel.build`) on an unchanged world | 14 ms | 21 ms | 320 ms |
| The screen built right after an act (its caches invalidated) | **57 ms** | | |
| The glance (`Glance.of`) | 11–18 ms | 32 ms | 100 ms |

*[F]* **The simulation already meets the 15 ms target at the median.** The rest of the turn is everything around
it.

## Where the rest goes (CPU profile, inclusive time over the walk)

| What | Share | What it is |
|---|---|---|
| Journeys walked leg by leg | ~29% | `Travel.step`: each leg rechecks interruption and danger and rebuilds much of the frame (`interrupted` 14%, `danger` 10%) |
| The legal actions, worked out again every turn | ~21% | `Campaign.offered` → groundings → operator bindings and joins (`operators.ts`) over the whole world |
| The world's tick rules | ~17% | `watch-loop` and `campaign-tick`: rules fired as time passes |
| Perception for the player view | ~15% | `PlayerView.observe`/`perceive` |
| Routes inside the screen | ~11% | `Itinerary.plan`/`route` and `KnownWays.search`, built with every screen |
| The terminal's own scene text | ~8% | `TerminalScene.leaf`; the runner's, not the browser's |
| Native copying | ~7% self time | `JSON.stringify`, `structuredClone`, object cloning: state copied per command |

## What it means

- *[F]* **The cost is recomputation, not the language.** Each turn works out from scratch things that barely change
  between turns: the legal actions over the whole world, perception, routes, and a journey's checks at every leg. Most
  of the time is in our own TypeScript loops, sets and maps over facts. None of it is a cost that a faster language
  would remove while the algorithms stay the same.
- *[I]* **Rust/wasm is not the first move.** A kernel in Rust would speed up `World.solve` and friends, which are
  about 15–20% of the time. But every query would cross the wasm boundary and copy facts into JS for presentation, the
  heaviest part, and the incremental work below would still be needed. Revisit it only if, after the algorithmic
  fixes, the kernel's own solve dominates.
- *[I]* **The fixes are incremental computation**, of the kind the engine already does in places (`KeptParts`,
  `kept-groundings`, `world-memo`, `CheckedActions`):
  1. **Legal actions by what changed.** An act changes a few facts; only the operators whose requirements read those
     relations need re-grounding. Read-set tracking exists for validation (`CheckedActions`); extend it to grounding.
  2. **A journey's legs without the frame.** Check interruption and danger by the relations that cause them (a threat
     at the next hex, a rule due), not by rebuilding perception each leg. Build the full frame once, on arrival or
     interruption.
  3. **Routes and perception only when drawn.** Plan the itinerary when the map or the wayfinder is open, not with
     every screen. Memoise perception per world, since the world is immutable.
  4. **Tick rules indexed by their trigger,** so that a minute passing fires only the rules that can fire.
  5. **Fewer copies.** Find what is stringified and cloned per command (likely checkpoints and keys built by
     `JSON.stringify`) and key by identity, or copy on write.
- *[I]* **A reasonable target:** a non-journey act's whole turn (act, screen, glance) under 30 ms headless, and the
  decision itself (act plus legal actions) under 15 ms. Journeys budgeted per leg, under 5 ms a leg without the frame.

## Checked for quick wins, and why none is quick (23 November)

- **Fact keys.** `World.key` builds every fact's key with `JSON.stringify`, but that is only part of
  `JSON.stringify`'s 3.9% of the walk. And the key's JSON form is parsed back: `World.nameOf` slices the relation's
  name out of it, and the read-set tracking (`WorldReads.saw`) records keys. One script builds a key by hand
  (src/cli/srd-encounters.ts:18). A faster key format is a careful change for about a 2% gain.
- **A journey leg's danger check** (`Travel.danger`, about 10%) builds the whole presented choice list
  (`PlayerView.choices`) on every leg, only to ask whether an attack is offered. A pre-check would skip it on empty
  legs. But `reaches` (data/rules/passages.kyr:86) lets an attack reach an opponent five ways: at the same place; on a
  way from here; guarding a way from here, standing at its far end; inside an open container here; or carried. A
  pre-check that misses one walks a journey past a guard. The right fix asks the attack operator's own grounding for
  the leg's place, not the whole presented list, and needs a spec over journeys past each of the five.
- **The terminal's scene text** (about 8%) is the runner's only; the browser does not pay it.

## For beta

This belongs to the first sprint's performance gate (owner-direction-2026-11-23.md: first meaningful action within
1.5 s, an act settled within 300 ms in the browser).

- Start with **(1)** and **(2)**: together they are half the walk's time.
- Keep a **turn-cost ratchet** headless, by stage: test/act-budget measures one kind of question today. A spec over
  the golden walk's turns, at the median and p90, would hold the gains.
- Re-profile after each fix with `bun --cpu-prof`.

To reproduce: start the world (PlayTool, `--world iscoed --as human/warrior/Wenna`), play the warrior's walk through
a Runner with AsMeant, and profile with `bun --cpu-prof`, counting only the samples after the world is made.
