# Friction found while reauthoring (third pass)

*Each entry: what I tried, what happened, the cost, the smallest repair. Status is **tested** (I hit it and fixed or
worked round it) or **read**.*

| # | Friction | Status | Cost | Smallest repair |
|---|---|---|---|---|
| 1 | **`Assert lends(...)` is not a gift.** A person "lending" an item compiled, linted clean, and the player never held it. Six cross-adventure gifts from the first pass were unobtainable and my tests had masked it with `j.give`. | tested | A whole chain of evidence was decorative. Found only by writing `gifts.test.ts` that asks every giver. | Lint: warn when an item kind is only ever `lends`-asserted. Docs: say `Give item to actor` is the transfer. |
| 2 | `Hazard` cannot nest in an `Action`; a fight that follows a *failed* action must be a Person moved on by `On failure { Assert at(...) }`. | tested | Boarding parties are written as persons parked `at nowhere`, then moved. Works, is indirect. | `On failure … Encounter <group>` or `Bring <person>`. |
| 3 | An item or person "off stage" needs a place called `nowhere` (Sennet calls its `offstage`) declared per module. | tested | Boilerplate in every module; one more global name. | A built-in `nowhere`. |
| 4 | `Decrease … by …` below zero hides the action instead of clamping; lint advises `or to nothing` for `take_cut`, `pay_the_hands`, `light_the_ship`. | read | Three advisories left standing; harmless while the cargo is positive. | Default to clamp, or make the lint an error. |
| 5 | Rules cannot assert discovery knowledge (`established`). | tested | Cross-module knowledge must ride on custody or a relation. | (as §11.1) |
| 6 | Lint "heard at" anchor advice on `Rule` voices: every calling-keyed voice in the Dorothea warns. | read | Noise: the voices *are* anchored by `at <place>`. | Do not fire anchor advice when the condition is `memberOf(?m, party)`-guarded. |
| 7 | Timers are hand-made: every dramatic clock (the men, the storm, the pin) is `clock` + `=N` arithmetic in rules and re-derived in tests. | tested | Retiming Skerrow broke five tests in turn (Jago window, men, plate, storm, `toDusk`). | A named `Clock … ticks every N` with `after`/`within` conditions. |
| 8 | An action's `Time` cannot be a measure (so the Slack's interest is announced, not charged). | blocked | Unchanged since §11.1. | `Time <expression>`. |
| 9 | Adding a province re-seeds every generated world; the trace, seeded tests and `web/bundles.generated.json` all move. | tested | Three-step ritual each time. I did not add a province this pass. | A seed that is stable across added provinces. |
| 10 | Global names: persons, kinds, canonical relations (`watched`, `owes`, `arrivedAt`, `vessel`). | tested | Renames in this and the previous pass. | Module-qualified names in Kyr. |
| 11 | Tests that jump the clock (`=356`) and rules keyed on absolute time collide when two clocks share a scene. | tested | See 7. | As 7. |
| 12 | The preset party has no race/background facts and no name addressing. | read | Companions are barks. | §11.6. |

## What I did not finish in this pass

Honest list: the Orsett reckoning on return (the cargo's shortfall is counted but no one at Orsett acts on it); the
Long Man's "eleven strokes and a blank" foreshadow; the Slack's pin clock written as a succession of Observes; the
new boarding party has a test for the bribe route only through the Skerrow suite, not its own. Each is a data change
and none needed an engine change.
