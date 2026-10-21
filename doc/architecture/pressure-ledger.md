# The pressure ledger

Demanding situations of the kind an old-school referee adjudicates every session, held against what Kyr and
Kyrie can express. Each obstacle is classified by what is actually missing:

1. world facts or relationships · 2. authoring expressiveness · 3. generic action or applicability semantics ·
4. persistent consequence modeling · 5. perception, knowledge or reporting · 6. procedural generation or assembly ·
7. player-facing discoverability or usability · 8. shallow adventure design despite adequate machinery

A row is closed only when a reusable mechanism makes several different situations simpler to author, and the
situation has been played in the browser. Before/after examples sit with the change that closed them.

## Situations

| # | Situation | Before this mission | Kind |
|---|---|---|---|
| 1 | A chest with a poisoned needle in its lock: scratches around the keyhole for a careful eye, a disarm for a trapper, or open it at arm's length with a pole, or smash it and break what is inside | No containment; traps only on passages; no probing | 1, 3 |
| 2 | A secret door behind a tapestry, found by searching or by a draught noticed at a crack, opened by pressing a carved rose | Hidden passages until a fact, room searches; no clue that only a careful look notices | 5 |
| 3 | A pit in a corridor: a seam in the floor, probed with a pole, jumped, bridged with a plank or roped across; a fall injures and may separate | Passage hazards, risk and countermeasures by skill; no pole or plank, no separation | 3 |
| 4 | An idol on a pressure plate; lift it and the ceiling drops; swap in a sack of sand of the same weight | No containment, no weight swap | 1, 3 |
| 5 | A gate guard who challenges, can be bribed, fooled with a forged pass, or fought; trespassers spotted are attacked and the alarm raised | Guards that block, payments, passes as knowledge; the guard never attacks; no alarm | 3, 4 |
| 6 | A patrol walking a circuit, ambushed or avoided by timing | People move; nobody attacks the company; schedules are not observable | 3, 5 |
| 7 | A dark room whose frescoes only light reveals; a creature that fears light; a lantern covered to creep past | Unlit places and light; no light-shy creature, no stealth in the dark | 1, 3 |
| 8 | A flooded drift, swum at a cost or drained by a sluice someone told you of | Done in Holt keep | — |
| 9 | A basket lift up a cliff winched by monks above; ride it, or cut it | No conveyances | 1, 3 |
| 10 | A head that answers three questions truly and lies ever after | Topics with latches; nobody lies | 5 |
| 11 | A merchant with a false scale that a sharp eye notices; haggling | Buying and selling at fixed prices | 3, 5 |
| 12 | A mirror that takes your reflection if you look into it; sunlight bounced from it opens a sun-door | No experimentation; conditions exist | 1, 3 |
| 13 | A false tomb of gilded lead over the real one; a party may leave satisfied with the fake | Nothing looks like what it is not | 1, 5 |
| 14 | Three levers, one setting opens the vault, wrong ones flood the room; clues cut in the walls | Machinery adequate (states, rules, sources) | 8 |
| 15 | A power loses its oil to the company and raids the cave folk for bottled light instead, or gives up the beacon | Pursuits and obstruction; no substitute-seeking | 4 |
| 16 | The company takes the gatehouse; the toll lifts, prices fall in the mining town, raiders move onto the road | Machinery adequate; no content | 8 |
| 17 | Crossing the pass in snow, or waiting for a clear day, or taking the miners' tunnel | Passages with times; no weather, no waypoints | 1, 3, 7 |
| 18 | An ambush on the road, avoided by someone who heard the scouts' report or by travelling at night | No route encounters; nobody attacks | 3, 5 |
| 19 | Surrender to brigands: robbed, held in the cells, escape or ransom | No surrender or capture | 3, 4 |
| 20 | A shepherd's path learned in an inn; a shortcut found by leaving the road | Hidden passages revealed by facts; no off-road exploration | 6, 7 |
| 21 | Loot that must be appraised; hot goods a fence pays less for; an heir who wants the heirloom back | Fixed buyers; no appraisal | 1, 3 |
| 22 | A generated region that needs a power to threaten its pass, and a power whose needs imply a stronghold, a supply route and a people to raid | One-way generation; scenarios placed by context only | 6 |

## Progress

Entries below record each change that closed or narrowed a row, with a before/after example.

### Objects (October 21): rows 1, 2, 3, 4 have machinery; browser play pending

Containment (`inside`, `Holds.`, states flagged `closed`, `take_out`, `put_in`), concealment (`hidden until` for
things and items, `Found by searching` with an optional skill), traps on objects (`strikes(hazard, group)`, turned on
one member by the seeded stream), and six try verbs (look closely, prod, pry, burn, push, listen) offered on every
thing whose means the company has, with "Nothing comes of it." when nothing does. Before, the trapped chest in
`test/fixtures/strongroom` could not be written at all (no containment, no trap that springs on an object); now it
is fourteen lines, and its needle, the alcove behind the map, the pit under the flagstone and the pressure plate
are all the same few relations. The idol swap needed no special case: anything put on the plate keeps the ceiling
up, because the rule asks only whether something is inside it.


### People who fall on the company (October 21): rows 5, 6, 18 have machinery

A fact `assails(x, company)` (asserted by a trespass rule, or by an NPC's `assail` action, which patrols and hunters
can plan with) stops whatever the company is doing, interruptible or not, and the fight that follows is the standard
attack, fought there and then and recorded in the same transcript step, so replays reproduce it. A company that
runs is put back where it came from; the assault is spent either way. Before, a sentry could only block a way; now
`test/fixtures/watch-house` has a sentry who challenges anyone without the watch-word and a patrol that hunts
intruders through the yard, each one rule or one pursuit long. A barred way now says it is barred even when there
is something to try on what bars it, and tries on a thing that stands on a way gather under one entry for it.

### The Varrow road (October 21): rows 17, 18, 20 have machinery and content

A die thrown every watch (`dice(clock)`, from the campaign's seed) is all the chance a world needs: the Varrow's
weather turns before dawn on it, and Hob raiders come up out of the gorse on it at night or in fog. Weather is a
`scenery` entity whose state other things follow by ordinary rules: rain swells the ford (a blocking state on the
way), snows over the goat path and lengthens the Gap road (`Set travelTime(gap_road) to 18`). Before, a pass in
snow could only be a fixed obstacle; now it is six rules over one sky, and the same seed gives the same weather.
The goat path is a way hidden until known: Jory tells of it at the smithy, or a woodsman finds it by searching the
switchbacks. A thing on a way nobody knows of is not noticed, so the snow on the goat path does not give it away.

