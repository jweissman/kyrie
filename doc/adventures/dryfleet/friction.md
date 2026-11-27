# The Sea Is Late: friction

*Adventure `dryfleet`. Story before code: story.md. Branch `adventure/dryfleet`.*

## Creative intent
A wonder-and-peril adventure, the form the corpus has least of (0 wonder, 2 peril of 40 by `suggest adventure`), with no ledger, no ancient obligation and no registry. The sea left Landfall nineteen years ago; it returns at dusk on the third day. The player is a witness and a broker, and the deadline is a physical one. The turn is that salvage is ballast: the hoard of a rotten ship keeps a top-heavy theatre upright. Tamsin Lundy, born the night the sea left, wants to be disappointed by it properly. Lore touched: the Rì's brass-drum man (Dun Rìerdan), Tolt's "the sea knocks", Marchbank's brig. I checked against whales (Tailrace, Over Exall) and walking orchards (Windfall) and moved away from both.

## What works
- The Return reads each company by where it stands and what it did: 9 endings, 5 last-couplet variants, a dozen fate rules. The player chooses the Players' last line (thanks, sorry, "You're late", silence), and it is heard across the water.
- Believing is different for each person. Hesper needs two signs (and her slate changes to DRAWING in the scene). Samphire cannot be argued with, only reached through Tamsin. Skellow is moved by being caught out, or, harder, by persuasion.
- The marl ride is peril with Deem variety: a per-watch wind die decides whether the cutter runs, and the walk is always available.
- Verified: lint clean (no warnings), 12 journey tests passing, `verify` all checks hold.

## Verification, honestly
- `bin/kyrie verify dryfleet`: compiled clean, 12 tests pass. Reach explores 14/14 rooms, 38/46 topics, ends by caught and town_unbelieved; the other 7 endings are held by explicit journeys in test/dryfleet.test.ts (stage_up, stage_over, bar_moved, bar_alone, light_lit, light_dark, town_believed).
- `voice repeats`: "nineteen years" and "the third dusk" recur on purpose; the five masque rules share a frame. Left in; the last-couplet rules could be one rule with a Deem-style template.
- `bin/kyrie preview` built and served (HTTP 200). **I did not look at the page**, no browser here. Passing tests are not satisfying play; no human has played this.

## Incomplete or thin
- Pacing: the whole tour can be done in 13 hours of a 58-hour deadline. The rest is waiting. Needs a second pressure or less slack (Time costs are one hoard-shift of 3 hours).
- No combat. The marl and the clams hurt, but the combat gauntlet gap stays open. Skellow's crew never fights for the Cormorant; the plot is only ever told.
- `samphireWarned`, `put_ballast_hard` (persuasion failure branch), `wall_lit` and the pearl wade are untested by journey; the ride's failure branch is not tested.
- Orlo, Sloe and the Wet Bar crowd are thin: Orlo's fate is a joke, not a stake. The Hare is never used on the way back in any test.
- Not placed: no entry in data/adventures/countries.json (a global registry, not mine to edit), so it is reachable only as its own campaign until someone adds the rumour, notice and march.
- Ending text is long and the fates arrive as one block at the Return. A page might want them across a few turns.

## Authoring difficulties
- Journey tests: steps are regexes on labels; cross-site ways are labelled by the site ("Into the Rise", "Into the Dry Fleet by the causeway to the Rise"). `?step` and `=until query()` were what rescued reusable fragments, and I found them only by reading other tests.
- Globals do not persist in the scripting harness, so a state fact like `windUp` is a Relation on party with a dice rule; there is no first-class weather state for an adventure without a place.
- `incline` and `stair` need a level change; a slipway and a lamp stair in one-level sites are linted. I used `path` and `steps`.
- "Heard everywhere" advice fires for every rule anchored by a derived Query (`exposed()`, `atLight()`) rather than `at(...)`; the lint does not look through a query. 33 advice lines remain.
- Measures cannot be read from the harness (`j.holds('masqueLine')` errors; a scalar has no relation form), so I could not assert the chosen couplet.

## Proposed Kyr/Deem improvements
- Let the anchor check read through Queries.
- A `Wind`/`Weather` state for a module, not only place scenery.
- A Journey assertion for scalar measures.
- A per-company "last chance" ending variant (`Ending … after N`) so the Return can be told across turns.
- A Deem template for a repeated frame with a variable last line (the masque).
