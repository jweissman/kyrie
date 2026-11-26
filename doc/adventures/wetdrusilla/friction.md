# Wet Drusilla: friction

## Creative intent
A funeral as an adventure. A sand-ship crosses the dry bed of a sea to scatter one woman's ashes, and the player assembles
her from the verses of a bawdy song, one per person who loved or robbed her. The ninth verse is the company's. The
wonder tranche was empty (0 of 36 in `suggest adventure`), and perilous crossings had two. Nothing here is a ledger: the
only counting is verses, casks and who is willing to sing.

Deliberate choices:
- **Knowledge is the key.** The chorus (from Mabin) stops the raiders. The goat verse (Bartle) or Tiggs finds the safe lane. A low note (Perpetua) keeps the Singing off. Verses are instructions.
- **Safety against knowledge.** Wax (the reward for telling Bartle the truth) keeps the company safe and deaf, so Sunniva's verse is not overheard. Holding the low note protects the whole deck, and the verse is not overheard either. Only a company with open ears learns it, unasked, and then has to decide whether to say so.
- **Danger with ways round.** Raiders: chorus, two casks, outrun (needs the point-off lore), or fight. Crust: goat, listening (wayfinding or woodcraft), or a one-in-three guess. The safe lane is a Deem roll, so it differs between worlds.
- **Persistent consequence.** Ashes lost on the dune lower Sunniva's warmth for the rest of the voyage. The raiders only come to the Silver if they were sung to.
- **Refinement in pass 3:** the jar on the Silver already scratched DRUSILLA SARSBY, Wet, before anyone carried her there. The tide endings answer it.

## What works (tests, not only reach)
13 journeys in test/wetdrusilla.test.ts: both early endings (left on the quay, marooned), the raiders sung to and paid,
the crust on a good and bad call, the night in both forms (Sunniva walks; the note is held), and endings tide_true,
tide_in, salt and urn_home. hand_deep has no journey of its own (a company of four verses and two waters; not written).
`verify`: lint 0 errors, 13 passing, reach 25/34 topics (reach is greedy and ended on left_quay at once, which tells
nothing about the voyage). It was not played by a human, and I did not look at the page in a browser: preview built and
served (HTTP 200), nothing more.

## Incomplete or weak
- Sunniva's warmth is a hidden number with four sources; a player cannot see it. The only signal is the ending.
- hand_deep and the cleric/performance lines (a bard should lead the song) are thin: one `Observe` for rites, nothing for performance.
- The verses are the weakest verse I could defend. Verse 4 and verse 9 want a poet.
- Fighting the raiders is possible and untested; Jessamy's verse is then lost with no remedy.
- No `after` entry in countries.json: its `after.by` needs a module word to go stale, and I did not build one. The Ebb's neighbours will not remark on whether the sea came.
- The only chance to buy casks is before sailing. Water is otherwise decorative past the raiders.
- The company is a hireling; Pomfret's pay ("three coin at the Silver") is promised and never paid.

## Authoring difficulties
- `bartle_asks` (a Topic put with `addressed(bartle, actor)`) is linted as an action with no target, three warnings, though it plays. Adding `company(actor)` quieted nothing.
- Blocked passages leak. A `blocking` thing on a way shows "push and pull at the rope ladder" and the destination's name from the first room (the Chorus, the Silver, a ship not yet seen). I used `hidden until` facts that rules teach. It works, but the state text of every inactive thing is then told on every visit to the deck, so I cut each to a phrase. A thing that is silent in a state would be better.
- A ship that moves is five states of one room and a measure. It works, but there is no `Vehicle` or `Leg`: the same leg-by-leg clock is hand-written with day and hour thresholds, and the `Rule` text is "heard everywhere" (25 lint advisories) because a rule cannot say "heard wherever the party is aboard".
- `nowhere` is a placement and not a place: `at(x, nowhere)` fails to load. Retracting `at` is the only way out.
- `Result … when` goes before the full stop, which the compiler explains well; the guide shows it only for rolls in text.
- Deem is barely reachable from a module: `(1d3)` rolled once at install is all I could find. I would have drawn which verse each person remembers, and one of several lines for the jar, from a table in the module.
- No Hazard can be bound to a place on a deck, so the crust is a rule that asserts `strikes`.

## Proposed Kyr/Deem improvements
1. A silent state, or a state told only at one end of a way.
2. `heard aboard` for a rule: heard wherever the company is in a place's site.
3. A module-local Deem table, `Table x { … }`, drawn once at install and readable by facts (`drawn(table, row)`).
4. A `Route` or `Voyage` form: legs by clock, with a place that travels.
5. A hidden measure shown as a quiet note when it crosses a threshold (warmth), as a milestone is.
6. `kyrie lint` should not treat a Topic put to the company as an unbound action.

## Registry
`data/adventures/countries.json` gets one entry (id wetdrusilla, marker pomfret, south, desert). It places in every
test seed; `bin/kyrie countries --diff` shows nine placings and none moved but the new one. No other registry or engine file is touched.
