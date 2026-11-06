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

## Sea-events table (third pass, `the-dorothea/weather.kyr`)

**Done in the module, no engine change.** The ship's own die (`dice(hull)`, per thing per watch) selects among five
sea events by range (squall, drifting lantern, fever, calm, a fishing fleet); two at most per passage, in the open-sea
window only. Different seeds draw different events at different watches (`test/dorothea-sea.test.ts` sweeps six seeds
and answers each trouble by every exit it promises). Findings:

| # | Friction | Status | Smallest repair |
|---|---|---|---|
| 13 | A "table" in Kyr is a set of rules with mutually exclusive `dice(x)` ranges, one per row; there is no weighted `Draw from <table>` inside a rule, and Deem tables roll at install, not per watch. | tested | `Draw <row> from <table>` in a rule, with the row's effects as the rule body. |
| 14 | An answer takes a watch, and the table may draw again in that same watch (a raft left astern met a calm at once): emergent, but tests must expect chained draws. | tested | Optional `after <n> watches` guard (today `seaAt` and arithmetic). |
| 15 | Fixed-timeline tests break the moment a chance table exists (seven failed): they needed a `seaQuiet` switch the author must invent. | tested | A test-level `Journey` option to pin `dice()` high. |
| 16 | Not built: more islands, a trading-house hierarchy, a sea passage kind, route choice. The Dorothea is one route between two places. | blocked/not done | Agent route to a not-yet-installed region (§11.4) for the trade; a `sea` passage kind for the chart. |
| 17 | `hasCalling` voices did not fire in the Gosse agent's campaign (callings installed under another module's prefix); `capable(party, rites…)` works there. **Not reproduced in the Dorothea:** its calling-keyed voices (`memberOf(?m, party) and hasCalling(?m, calling_ranger)` and the thief, cleric, warrior, mage and bard ones in `voices.kyr`) fire in the standalone `the-dorothea` campaign, played by `test/the-dorothea.test.ts` and `test/dorothea-voices.test.ts`. The failure is the Gosse campaign's, not general; the Long Man's is in its own tests. Other campaigns were not checked here. | read; closed for the Dorothea | Document which form is portable; or alias `calling_*` globally. |
