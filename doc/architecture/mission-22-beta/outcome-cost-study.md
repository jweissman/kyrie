# The cost of predicting an act's outcome by trying it (23 November)

Research for Sprint 1 of the preparation report, whose central proposal is an engine-owned *Outcome* for each offered
act. The Outcome would be computed by a bounded speculative step (the act done on a fork of the world, the result
read, the fork discarded) and checked against what happens when the act is really taken. The report named its cost
as the chief risk. This measures it with no engine change, by doing each act and undoing it (`Campaign.execute`, then
`Campaign.undo`) at every turn of the warrior's golden walk (Iscoed, 44 turns), on this machine.

## What was measured

| Measure | Result |
|---|---|
| Campaign acts offered a turn | median 52, at most 178 |
| One act done and undone | median **10.5 ms**, p95 29 ms, worst 313 ms |
| Every offered campaign act, each turn | median **750 ms**, p95 1.44 s, worst 3.0 s |

Journeys and moves (`travel:`, `go(…)`) were left out: their outcome is the route's, already known.

## What it means

- *[F]* **Trying everything the engine offers, every turn, is out of budget** by a factor of two to ten: 750 ms at the
  median against the 300 ms settled budget, before anything is drawn.
- *[I]* **Trying only what a player can see is plausible.** The four, plus a lens's rows, are a dozen acts or so; at a
  median of 10.5 ms that is about 125 ms. It needs three conditions:
  - computed lazily, for the rows drawn;
  - memoised per world, since the world is immutable and a frame redrawn on the same world needs no new fork;
  - computed off the critical path where it can be, for example during the hold or after the answer is drawn.
- *[F]* **Most rows the page shows are not campaign acts.** A talk opened (`talk:<id>`), a way taken (`exit:…`) and a
  journey (`travel:…`) are the session's and the runner's commands, not `Campaign.execute`'s. An attempt to fork the
  rows drawn through the campaign found almost nothing to fork. So **the Outcome must be defined over the commands
  rows do, through the session**, not only over campaign operators. Otherwise it covers the minority of rows and leaves
  the page inferring the rest, which is the defect it exists to remove.
- *[I]* **A cheaper step is available for many acts.** An act's own effects plus the rules they wake are a
  `World.apply` and a rule pass, not a full `execute`. A full execute also advances time, runs narration and keeps a
  receipt. The audit's "bounded speculative step" should mean that cheaper pass, with the full execute kept for
  checking a prediction after the fact.

## For Sprint 1

1. **Define the Outcome over session commands.** Talk, way, journey, act and question each get a predicted result,
   by the cheapest faithful means. Routes already predict journeys; a talk's outcome is its questions' outcomes.
2. **Budget it.** Fork only the rows drawn, memoised per world. Measure, before adopting it, that the settled time of
   an ordinary act stays under 300 ms in the browser (test/input-answered-browser now logs `settled`).
3. **Check every prediction.** When an act is taken, compare what was predicted with what happened. The continuity
   census (scripts/continuity-census.ts) is the walk-wide form of that check.

The probes were throwaway scripts; the numbers above are their output. To repeat them: time `execute` then `undo` for
each id in `Campaign.offered()` at each turn of `golden/warrior-walk.txt`.
