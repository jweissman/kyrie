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
| 23 | Carters who walk a day down the valley for meal and back, every few days, unless the ford is in spate | NPC plans of a dozen steps never found: the planner told states apart by the hour they were reached | 3 |
| 24 | A door the brigands open with their own key and the company must pick, break or be let through | A blocking thing stopped everyone, its owners too | 1, 3 |
| 25 | A jar of noonlight poured out on the dark, and gone; the same jar is what the brigand queen wants | Changes could spend goods, not use up an item | 3, 4 |
| 26 | A visitor admitted to the brigand queen who must touch nothing on the way; robbed, she remembers | Tolerance, guests and grudges had no words; guards either blocked or did not | 1, 4 |
| 27 | Darkness that eats light, a lamp-tender that attacks whoever it finds unlit, and hounds that flee from sunlight | Unlit places and light only | 1, 3 |
| 28 | Outlaws who step out of the trees and demand road-money: pay, turn out an empty purse, fight, or run under their arrows | Someone could fall on the company, but not stop it to talk | 3, 7 |
| 30 | A gilded tomb that satisfies the greedy with gilt lead, the true tomb beneath it, and a rite that keeps the dead asleep while a candle burns | Containers, tries and hidden ways existed; nothing measured how long a light burns | 8 |
| 29 | The same raiders' hold in another region: a cave of outlaws in the mountains, a ring-fort of hobs in the fen, each bound to a road and a settlement there | Scenarios placed by context; one fixed shape each | 6 |

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

### The Lanthorn (October 21): rows 5, 7, 12, 15, 23–27 have machinery and content

The Varrow's citadel (`data/sites/lanthorn`) is six levels and five ways in: the gate, a postern barred inside, a
chain from the fell to the top of the tower, the cistern's flooded overflow, and the crack below the cellars. What it
needed of the language was small and general:

- `tolerates(x, company)`: one who lets the company be does not bar its way, fall on it, or break its rest. A toll
  paid, an audience granted and a bargain kept are each one fact, and taking them back is retracting it.
- `keyholder(x, thing)`: a barred door does not bar its keyholder or those who serve them. Before, the carters could
  not leave their own gate.
- `lightless(place)` and `sunlight`: a place where ordinary light dies; only sunlight shows anything there.
  `benighted` now covers both, so the Tender's rule ("falls on whoever it finds unlit") and the glooms' are one line.
- `consuming <item kind>` on a change: the jar of noonlight is used up scorching the Unlight. Before:

      Change scorch "Unstop the noonlight at the Unlight" from ravening to scorched needing sunlight.  // jar kept

  After, the same jar cannot also be given to Ninefingers, which is the choice:

      Change scorch "Unstop the noonlight at the Unlight" from ravening to scorched consuming noonlight.

- The NPC planner kept states apart by the hour they were reached, so a twelve-step journey exhausted its budget of
  2000 nodes; without a deadline it now keys by the world alone, and the carters' day-long round trip plans at once.

The Lanthorn still names sixteen relations of its own (`roused`, `guest`, `wanted`, `provisions`, `laden`, `gloom`,
`kindled`, ...). Several (an alarm, a store of provisions, carrying supplies, guests, a grudge) belong to any
stronghold; they are the first candidates for shared vocabulary when the stronghold becomes a reusable kit.

### Composition (October 21): rows 22, 28, 29 have machinery; the assembler places kits

The assembler now keeps a ledger of commitments in a Kyr vocabulary of its own (`data/assembly/vocabulary.kyr`),
read from region modules (authored or generated) and added to by kit placements, never rewritten
(`doc/architecture/composition.md`). A kit declares slots with hard requirements and weighted preferences, which
are Kyr predicates over the ledger. It also declares dimensions that Deem proposes from the kit's tables, checked
against what is committed, and the facts and modules each placement establishes. The first kit, the raiders' hold
(`data/kits/raider-hold`), has two hold shapes (ring-fort, cave) and two folk (hobs, outlaws) behind one role
interface, so any hold houses any folk.

Before, the Varrow's raiders were nine lines of region rules with nowhere to live. Now the Hob-Knot is one manifest
entry, `{ "kit": "../kits/raider-hold/kit.json", "id": "knot", "fix": { ... } }`. It brings a ring-fort with a
souterrain, a Gaffer who takes tribute, a captive who knows the hobs' fear of bells, and a stolen bell in their own
plunder. In a generated region the same kit binds itself to a site off the roads, a road stretch and a settlement
within reach, and Deem decides who the raiders are and what their hold is. When the region's scenarios have taken
every site, the assembler asks Deem's site generator for another and composes again, at most twice. It records the
request, for example "raiders: nothing can be approach: every candidate fails a requirement; Deem proposes Fen
Walls (ruin)".

`halts(x, company)` is the non-violent sibling of `assails`: it breaks off whatever the company was doing and leaves
it facing x. The outlaws use it to stop travellers, then give them one watch to pay, show an empty purse, fight or
run. Their patience rules come before the hold-up in the module so that they cannot fire in the same watch as it.

### The Candle Tombs (October 21): row 13 closed in content, row 30 is design

The burial labyrinth under Two Barrows (`data/sites/candle-tombs`) needed no new machinery. Everything in it is a
thing with states, a try, a hidden way, a measure and a few rules:

- The gilded tomb's crown is gilt lead. A close look says so, its description says it is "heavier than gold should
  be", and Iselde pays two crowns for it.
- The Lamp-Father's image hides the stair to his true tomb, and its worn pointing finger is the clue.
- A candle lit in the threshold niche burns for three hours (a measure counted down each watch). While it burns,
  the dead sleep. Each watch spent below without it stirs them, and robbing them stirs them more.
- The weeping slope is a risk, unless a rope is tied to the ring at its top (`consuming rope`: the rope stays there).
- The dead door out through the far barrow opens one way.

This is row 8 of the categories ("shallow design despite adequate machinery") turned around: the depth came from
the design, not from new language.

### The Brimming and the House of the Hush (October 21): row 9 closed in content

Conveyances needed no new machinery either. Each is a scenery thing on a way, blocking in one state, and an action
that sets the other:

- the House of the Hush's basket lift comes down when the company rings at the post below, if the house will
  have it;
- Spill's boat crosses the Brimming's still lake for two coin;
- the Skerry mine's deep cage is chained until Captain Hest lowers the company, or a thief picks the padlock.

The Brimming is the Lanthorn's fifth way in, up the crack from beyond the lake, and its Glimmerkin are a second
source of noonlight (one jar, for 45 coin) besides the Lanthorn's racks. While the Unlight ravens, its hounds come
down the crack at night: the Glimmerkin lose jars, and a company on the far shore meets them. The Waking Bell in
the Hush routs the Hob-Knot's hobs (the Hush imports them), and the house never lets the ringers back in. The
Glimmerkin are a new, non-playable ancestry: one catalog entry and a name list.

### A kit that builds on another (October 21): row 22 closed

The bounty kit needs a power that some other placement put in the world, and binds to it through the ledger:
which settlement it raids, its chief, its band. This is the "power whose needs imply..." half of row 22 seen from
the other side: a later structure built on an earlier one's commitments, with no code that knows about either. The
assembler asks Deem for a site only when the first refusal is for a place off the roads. A bounty refused for want
of raiders is not helped by a site, and is left out until the raiders are placed.

