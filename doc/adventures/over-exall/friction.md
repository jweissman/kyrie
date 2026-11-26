# Over Exall: friction

## Creative intent
A wonder-tranche adventure (the corpus had none): a drift-whale hung by the lip on a steeple, sinking a house-height each dusk. The wonder is the animal and its back; the play is five people who each hold one true thing about it and fear what the others would do. Nobody is a villain. Three ways to lift it (warm it with the Long Fire, feed it what it is, cut a whaler's old iron out of its shoulder), a gun on a clock, and an old woman who wants to go up with it. Story first: doc/adventures/over-exall/story.md.

Connections: Cloudgate (the Grand Tour) is where Saley is from; the Wickering rain-cloud (Weatherdrove) is why the lanes failed and the whale is lost; the iron echoes nothing else on purpose, but see below.

## What works
- The knowledge chain is real investigation: the barbel at night, Dorcas, and the Old Leaven's provenance each lead to the same fact by different roads (`rank_known`). Elley will not give the leaven until the player can tell him whose it is.
- Saley is moved by evidence (the stamped iron), not coin; she can also be argued with, or sabotaged (`spike_gun`), and each leaves a different mark on the ending.
- Five endings plus Dorcas variants, all reached by explicit journeys (test/overexall.test.ts, 10 passing): Candlemas, The Lodger Leaves, The Lodger Stays (one lift, Saley shamed), Arithmetic, The Roof of the World.
- Aftermath lines for Marta, Elley, Tolt and a spiked Saley are told at the dawn the whale goes.

## Verification
`bin/kyrie verify overexall`: compiles, lint 0 errors/0 warnings (7 advisories: endings "heard everywhere", ignorable; ending rules are unanchored by nature), 10/10 journeys pass. Reach (greedy, 400 steps) saw topics 18/29, acts 3/6, rooms 10/14; the unreached are the branches the journeys cover by hand. `voice repeats` finds deliberate echoes (the third-below hum, the "breath goes out"); I trimmed none of them. No human play recorded. I did not run the browser preview in this session, so the page's look (painting hints for a whale and a steeple) is unverified.

## Incomplete or weak
- Untested by journey: `argue_saley` (roll), `spike_gun` (roll), `sway_tolt` (roll), `tolt_pay` (the test company has 10 gold, price is 15), the ladder hazard (`gust`), Judith's topics, the arithmetic endings with and without Dorcas, `fall_dorcas`, `stays` with Dorcas aboard (no ending says what happens to her).
- Time is cheap: talk is free and travel is minutes, so a competent player finishes in the first afternoon and then waits. Rising is held to the next dawn so the ending is not instant, but the three-day clock only presses a player who dawdles.
- Three lifts are sums in a measure (`lifted()`); the player is never told what the count is. A tougher design would show the belly's state per lift.
- The "stays" ending is thin: one lift is not an obvious cause of a gentle landing. It is charming rather than earned.
- Sab Thord has two topics and one shortcut; Judith is mostly colour. Neither has a stake.
- The kite ride is a bare passage ("You leave the Windlass Field in the full of the morning"): the most wondrous trip has generic narration.
- Goingbank also has an iron in a living creature's shoulder and a breathing hide. Mine is a different animal and story, but an integrator should know.

## Authoring difficulties
- `Observe … as sign when`: the order (`as` before `when`) is the opposite of how it reads; the compiler error was not helpful.
- `barred` is a shared-rules state name and fails at load; the error is clear but it is a trap for any door.
- A `needing crowbar` Change does not accept an item that is `like crowbar`; one must name the kind (`needing crowbar or oe_bar`). Silent: the act simply is not offered. `inspect` of an unoffered act printed nothing useful.
- Passage names become labels, and a passage between a room outside a site and a room in it reads "Into St Ebba's by <name>"; naming a passage for the label took two tries.
- A Change's `when` message is shown only until it holds, and an unoffered act gives no reason in `play --choices`.
- Carrying a cask and a crock halves the company's pace, which silently ate a three-hour calm window. I widened it to six; an author wants to see weight coming.
- Manners are a closed list (no "brave").
- Deem: I used inline repertoires (`again … then`) and dice, not a Deem table; there was no obvious place to hang "what the barbel takes tonight" as a table the world could reuse.

## Proposed improvements
- `inspect --why act "<label>"` that says which clause of a Change or Action fails (needing, when, requires).
- A passage's own words (a kite ride, a ladder in wind) told on crossing, as a Thing's state is.
- A way to declare a measure's stages as player-visible (a belly that is "taut" at two lifts).
- `Observe` grammar that accepts `when` before `as`.
- An ending-aftermath construct: lines keyed to relations, told with the ending, without each being an unanchored rule.
