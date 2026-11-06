# Frictions: the Dorothea archipelago

| # | Friction | Status | Smallest repair |
|---|---|---|---|
| A1 | **No terrain kinds beyond `region/settlement/wilderness/site/building/room`.** Volcano, jungle and salt flat are prose only. Ashkeld is a `wilderness` with hot springs and a rim hazard written by hand. | **blocked** | A `terrain` tag on a Place that other rules and the chart can read. |
| A2 | **No distance on the world map for a module-local archipelago.** Distance is `progress` thresholds per call in a hull Thing; the chart knows nothing of the sea (as 07-voyage §7.3). Ashkeld reads as three days only by the clock. | **blocked** | A `sea` passage kind with a duration, and `countries.json` placement for non-adjacent provinces. |
| A3 | A passage `opening when` shuts at *both* ends: a failed lock-lift that closed the counting-house door trapped the company inside. Worked round by moving the company out in the failure branch. | tested | Optional "shuts behind" side. |
| A4 | `Decrease … by …` below zero hides the action: a clerk with no gold made `Take the clerk's twelve coin` vanish. Needed `Initially Set quantity(latch, gold)`. | tested | Clamp by default (friction 4 above). |
| A5 | Waiting by `=N` can overshoot a rule's warning window (the raiders land, say "a few minutes more", and the fight fires). Tests use `=until at(raiders, ness_quay)`. | tested | None needed; document `=until`. |
| A6 | A rule that changes `at(party, …)` is not needed: an action can `Retract at(actor, site). Assert at(actor, other).` to move the company (the climb, the lighter). Worked. | tested | -- |
| A7 | Terrain-free tide: `Set phase(tide) to watch(clock) - watch(clock) / 72 * 72` in a `Rule … when true`, read in a passage's `opening when`. Worked, no repair. | tested | -- |
| A8 | Reset for a second voyage is a long list of `Retract`s; a `Reset <group of relations>` would be shorter and safer. | tested | `Reset` construct. |
| A9 | `Person` surnames are global: Rudd and Thane (taken), Meg, Penhale, Cobb, Dray, Tansy, Lanyon. Renamed on lint. | tested | Module-qualified names. |
| A10 | Orsett, "the Wednesday boat", a real counting-house: not a place we can seed without a province (re-seeds every world). Carried as a seat, a board and a seal. | **blocked** | Agent route to a not-yet-installed region (§11.4). |
