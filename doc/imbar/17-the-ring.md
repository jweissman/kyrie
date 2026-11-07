# 17. The Ring: an institution Deem casts, a hierarchy a company rolls up, an adversary that goes round the world

*`data/goings-on/factors/{situation,ring}.kyr`, `tables.json`, `templates.json`, `module.json`; `data/adventures/the-dorothea/{ring,lamp}.kyr` (and the imports in `placed.json`, `placed.kyr`, `company.kyr`); the `tolleth` herald's `exports` in `data/adventures/countries.json`. Tests: `test/ring-hierarchy.test.ts`, `test/ring-responds.test.ts`, `test/ring-lamp.test.ts` (`test/support/ring.ts`, `test/fixtures/ring/*`). Frictions: `adventures/ring-friction.md`. No `src/` change, no province added, no shared event or catalog entry edited.*

## 17.1 What it is, and why this one

The Dorothea's House of Marchbank buys up lamp-stations (authored). Its **criminal arm, the Ring**, is what Deem
generates: the Founders' Exchange of `10-exchange.md` is now the Ring's *front* in the country behind the passage, and
the Exchange's factor, carter and hands are its lowest three ranks. A smuggling ring fits better than a cult or a
slavers' band because the House's own habit is to *lease and not light*: the wreck is a right, the wreck's goods are
a lot, and the lot has to be got from a beach to a buyer by hands who are never the same hands. A ring is that.

| Rank | Who | Where | Cast by Deem | Past it by |
|---|---|---|---|---|
| **Cell** | the cellar-men (commoners, 2, **level 1-3**) | the Exchange's cellar under the largest inn (a warehouse) | folk by terrain, level | six coin; a lie (persuasion); a fight (a level-1 company wins, 5 seeds in 5) |
| **Fence** | the factor | the taproom and, up the stair behind her chair, the counting-room | folk by terrain, name, stock, muscle | the waybill put to her (persuasion), the key she gives; or the strongbox picked |
| **Lieutenant** ("R.") | a regional boss, **his own table** | a bonded store behind Garrick's chandlery at Tolleth (placed by the Dorothea) | folk by terrain (`lieutenantFolk`), name, level 3-4, **temper** (1 greedy, 2 proud, 3 frightened), **secret** (1 skims, 2 a child at a school the Principal pays, 3 informs to the Watch) | his temper's price; the leaf's margin turns him |
| **Principal** | the head, who keeps the black book | goes round: the counting-room over the taproom, a day abroad, the bonded store, the boiling-house loft at Port Ness, home | folk by terrain, name, level 4-5, **stay** (2-3 days), **away** (3-5 days), **nerve** (1-3) | all three ranks laid before him; his nerve then decides |

Five worlds, five rings (Deem; the Exchange's own row of `10-exchange.md` is unchanged, since the ring is drawn **after**
what the Exchange always drew; see friction R17):

| seed | factor | lieutenant (temper, secret) | Principal (nerve, stay, away) |
|---|---|---|---|
| thorn | Taklinn | Nharash (proud, skims) | Cy (stands, 3 d, 3 d) |
| a1 | Naillil | Mharash (frightened, informs) | Ivellios (flees, 3 d, 4 d) |
| kite | Arannis | Jade (proud, skims) | Thamior (buys, 2 d, 3 d) |
| ash | Valen | Vharash (proud, school) | Barendd Rumnaheim (flees, 3 d, 3 d) |
| wren | Jeremiah | Theren (proud, informs) | Varis (stands, 2 d, 4 d) |

Buildings: a **warehouse** (cellar) and a **counting-room** in the largest town; a **bonded store** (safehouse) at
Tolleth; a **loft** over a boiling-house at Port Ness. Three places on the company's map across the home country, the
Tolleth province and the island it sails to; and the Principal visits each of them.

## 17.2 What a player learns where

Evidence is read, never flagged. What passes between the country and the Dorothea is four **facts** the herald
binds (`waybill_read`, `ledger_read`, `lieutenant_named`, `principal_traced`; plus `seal_seen`) and three entities
(`ring_coast`, `ring_head`, `abroad`), read through canonical relations only (`knows`, `at`, `routed`, `dead`,
`hidden until` a fact). No module names another module's flag.

```
 THE LARGEST TOWN                                   TOLLETH                         PORT NESS            SKERROW
 search the taproom ──> cellar hatch                 
 cellar-men (pay / lie / fight)
   └ topic: "whom do you answer to" ──> seal_seen, the stair is known
   └ search the cellar ──> a WAYBILL ──read──> waybill_read
 factor: press with the waybill (persuasion) ──> the key; lieutenant_named
   └ strongbox (key or lockwork) ──> a LEAF of the day-book ──read──> ledger_read
                                             │ lieutenant_named / ledger_read
                                             ▼
                                   plank door behind Garrick's racks (hidden until)
                                   R. at the bonded store: his temper's price,
                                     or the leaf's margin (his secret)
                                     ──> principal_traced + toldPrincipal
                                   his desk ──> a LETTER under the seal ──> principal_traced
                                             │ principal_traced
                                             ▼                                  ladder to the loft
                                                                                (hidden until)
 the Principal, wherever he is on his round <──────────────────────────────────── the lamp in the gable
   expose_principal: needs waybill_read + ledger_read + principal_traced  (cell, fence and coast)
```

A second, independent route to each building exists, so that a company that never reads the town's book can still
find them: the lading hatch under Tolleth quay (`Found by searching`), the boiling-house back stair from the pier
(`Found by searching`). Reading one rank reveals a member and a building **in another province**; reading the
Tolleth lieutenant makes the Principal exposable **in the town**.

## 17.3 The adversary

The Principal is a person with a place, and the places are where the Ring is: `at(ring_head, X)`, canonical, written
by rules in two modules that share no measure (each keeps its own clock; they meet at a shared place, `abroad`).

```
 town counting-room ──(stay: Deem, 2-3 days)──> abroad ──(1 day: the Dorothea's clock)──> bonded store
   ▲                                                                                        │ 2 days
   │(away: Deem, 3-5 days, the town's clock)                                                ▼
   └───────────────────── abroad <──────(3 days)────────────────────────────────── loft at Port Ness
```

A full round is about twelve days. Whether the company is there or not he is somewhere: with Tolleth not yet
installed he circles town and `abroad`; when Tolleth comes into the world the Dorothea takes him from `abroad` at the
next pass. Every position, timer and flag is an ordinary fact: a save resumes into it, same facts, same person
(`canonical()` equal: `ring-responds` and `ring-hierarchy`).

### The adversary's table of responses

The Ring knows only what its people see: the cellar-men see who comes to the cellar, the factor hears her table, R.
sees who comes to his store. Nothing is told it by magic. Each response is a rule with that condition, a durable
fact, and an effect somewhere else.

| The company | The Ring answers | By what | Tested |
|---|---|---|---|
| pays the cellar-men, lies to them, or beats them (`seenSearch`, `routed`, `dead` of the cell) | **hires muscle**: two warriors (level 2-3, Deem) are posted at the counting-room within three hours | `hired`, `hireAt`, `bravos` | `ring-responds` 1 |
| the same, and sleeps or waits in the largest town's taproom after dark | **sends its hands at night** to where the company is; five coin to have them sit on the stair | `bravos_by_night` | 2, with a reload |
| searched the cellar and has not taken the book | **burns the evidence**: a day later the leaf is gone from the strongbox and ash is in the grate (a leaf the company already carries is not burned) | `evidence_burned`, `burnt` | 3, 4 |
| talks to R. (any of the ways) | **sacrifices the lieutenant**, half an hour after he has talked (long enough to ask him where the Principal is tonight): a letter to the harbourmaster, R. routed and taken from the store; a bill on the harbourmaster's door; the store swept; the Principal's circuit **leaves out the store** and he sits four days at the loft | `lieutenant_cut`, `routed(lieutenant)`, `ring_skips_store` | 5 |
| turns R. with the leaf's margin | R. is **not** sacrificed; he is the company's, and says where the Principal is | `turned` | 6 |
| lays all three ranks before the Principal, **nerve 1** | **he flees the country for good**: `routed`, sent abroad; the Ring has no head | `principal_nerve_flees` | `ring-hierarchy` |
| the same, **nerve 3** | **he buys**: sixty crowns and the company's face, no blow struck while he offers; refused, he turns | `offered`, `take_principal_silver` | `ring-hierarchy`, `ring-played` |
| the same, **nerve 2** | **he stands**: an hour to be gone, then the warn runs again and a fight follows | `stood`, `standAt`, `principal_door_closes` | `ring-hierarchy`, `ring-played` |
| the same, **his lieutenant turned** (any nerve above 1) | **he breaks**: "My man signed"; he goes to the boat | `principal_breaks` | `ring-played` |
| asks the factor / buys back / names her at the inn | the Exchange's own six answers (`10-exchange.md`) | `suspects`, `exposed` | `exchange-responds` (unchanged) |

Deem rolls choose which of the nerve rows a given world has; a different seed is a different head. The
Principal's *route* changes with the company's acts (the store skipped), his *muscle* with its acts (hired), his
*evidence* with its acts (burned), and his *rank below him* with its acts (sacrificed).

## 17.4 Its fall opens a deeper adventure

When `routed(ring_head)` or `dead(ring_head)` holds (the nerve-1 flight, a rout in a fight, or a death), the
Dorothea sets `ringFallen` and the trap in Skerrow's oil store, shut under a House padlock, opens: **the Lamp
Below**. Unreachable before (`ring-lamp` 1: no way offered; `ring-hierarchy`: the same in a drawn world, then open
after the fall, and the same after a reload). The reason is in the fiction: a seal is a thing everyone has agreed to
be afraid of, and the Ring's hands were what made them afraid.

The Lamp Below (`lamp.kyr`): the lamp-engine of the Mathematical Age under the Pharos, which the Aeneans found,
learned to start, fenced and wrote law about (bible 14.3; its plaque is *their claim* to have built it). Danger
level 5-7: wheel-floor of three-dice teeth, a Governor of level 6. Three acts, each with a way round.

| Act | Place | Problem | Ways past (none is only a fight) |
|---|---|---|---|
| I. The gate | the black stair (names on the wall, a drift of coins), the keepers' gate | a bronze gate with two locks | the **rubbing** of the Prefect's Table sets the numerals; the **thief** takes the real tumbler quietly; **Marren's** counting; a bar (loud: the engine quickens and a lone company is no longer counted as the keeper) |
| II. The engine | the ledge over the wheel-floor; the tally-crawl; the keepers' gallery (two centuries of OWED / KEPT chalked on the wall) | thirty paces of turning brass | the **rubbing's second column is a tread**; a **mage** ciphers the teeth without it; throw or ease the **brake** (the Pharos above goes out: a cost); run it (climbing, a bad end); the **crawl** for a company of one |
| III. The well | the lens-well | the Governor, who counts: *one keeper, all others are removal* | the stop-word from **Oswin Tarn**, who is trapped in the gallery (a choice: carry him up, or the book); a keg of the Pharos's oil poured into the pilot; the **cleric's** office for the dead; a company of **one**, counted as the keeper; or a fight at level 6 |

The kept light is used once: the pilot in the bronze cup at the bottom, fed by hand through a lead pipe from the
island's oil store, by Kestles who did not know where it went. Voices: ranger (the stair's wear), thief (the gate's
second lock), mage (the wheels as number), cleric (the office), warrior (the Governor's hip). Characterization:
Marren (wants to know what the lamp is for; will cut a seal herself), Oswin Tarn (wants out; fears being told he was
wrong; will not leave without his book), the Governor (wants a count). History not on the path: the names on the
stair, the coins left on the third turn by everyone for no reason anyone knows, the OWED/KEPT quarrel, the plaque.
A fish and over it a flame is on the gate and on the gauge, explained nowhere.

## 17.5 Deem-generated or authored

| Generated (at assembly, by Deem) | Authored (Kyr) |
|---|---|
| ancestry of factor, lieutenant, Principal, cellar-men, hired men, by the terrain (three tables); their names; their levels (cell 1-3, hired 2-3, lieutenant 3-4, Principal 4-5); the cell's and hired men's number | the places, passages, evidence, topics and actions; what each rank knows; every response rule |
| the Principal's `stay`, `away` and `nerve`; R.'s `temper` and `secret`; the house's `run`, `stock`, `muscle` | the circuit and its rules; the Lamp Below, in full; the herald contract |

## 17.6 Honest shortfalls

- **The Principal does not plan, and cannot be met between places.** He moves by rules on timers, in two modules that
  meet at a place. `Pursuit … seeks … using go` *does* work for him: measured, a walk from the town's taproom to the
  Tolleth way-in took about five days (planning 40 steps). It was not shipped: a planner will not take a `hidden until`
  way, so it cannot reach the store, and a walking, territorial head would warn every company on the road (friction R1).
  His responses are rules with conditions, not choices among means.
- **He is somewhere only in countries that exist.** The circuit takes in the home country and the Tolleth province
  (Tolleth, Port Ness). Low Water, Merrowdale and Ammerlin are bound by the carter and the steward, not stops.
- **Fights with the Principal and the lieutenant are not simulated.** Only the cell was (a level-1 company wins).
  The Principal (level 4-5) and R. (3-4) are by design a way to be got round, and a danger to a company that stays at
  their door: the first test run **lost a company that waited in the store when the Principal came**. That is meant.
- **The standalone Dorothea has no ring.** `company.kyr` declares stand-ins; there the Lamp Below is reached only when
  a test asserts `routed(ring_head)`. In a generated world it is the real Principal.
- **No torture.** A name under persuasion, a bribe and fright are written; intimidation as a check on the factor is not.
- **The unlit-lamp tests use a fixed roll** (`j.roll('pass')`) where a check is the way in; the dice are not walked.
- `knows` cannot be written by a rule, so every discovery is learned by an item read, a topic or an action; where the
  Ring "learns" what the company knows, it does so from what its people saw, not from the company's knowledge.
