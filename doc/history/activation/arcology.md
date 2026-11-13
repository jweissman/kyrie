# A ruined Mathematical Age arcology near the starting region: a conception

*11 November 2026. A storyboard and design exercise, **not built**. Nothing here is canon until the owner says so; nothing in it needs the M20 opening to change. It reads the two paintings the owner has already made of the place (`scene-ruins-arcology`, a hall of tiers and bridges under a broken glass roof; `scene-ruins-installation`, a drowned city under a great ring), imported in this branch's batch and held dormant until an adventure uses them.*

## What it is, and what it must not be

The Mathematical Age made things to answer questions, by number, and it is much older than the Aeneans; the Aeneans found, learned to start and fenced such works, and wrote law about works they did not make (the repository's own history ledger, `doc/imbar/02-history.md`). So: **the arcology is not Aenean, and the Aeneans were not its builders.** They were its first tourists. It must not become the explanation of the Empire's end, an amnesia machine, or a mandatory opening. It is a *place that is much too large for the people who find it*, whose purpose is legible in pieces and arguable as a whole.

**Where it stands.** Beside the old paved road a day or so from the first town, where the posting-house's painted road shows a grey blank marked in a different hand: *OLDER THAN THE ROAD*. The straightest road in the country bends once, eight miles, round nothing visible. The posting-house's pedantic stationmaster complains in his day-book of "the Prefect's detour": a rule that the road must not go through, and that no stage be built on, a place the Posts mapped and refused to name. (This is the thread the road station plants; see the treatment.)

## Central mysteries (kept open; each has two readings)

1. **What the tiers were for.** Housing, say the ledger-halls; *answering*, say the engines. Both are true of different levels, and the levels do not agree on which came first.
2. **Why the Posts went round it.** A taboo, a hazard, an order from a Prefect who had read something; the stationmaster's day-book, the lamp-keeper's folk custom, and a late Aenean coin of an unlisted regnal year do not settle it.
3. **What runs, still.** Water, light-shafts and a hum are all that does. Whether any of it is a *system* or merely a leftover is the expedition's argument.
4. **Who has been in.** An Aenean survey party (their chalked numerals on a landing), a later monastic party (a cut-down ladder), and someone this decade (a fresh lantern-tin). The three disagree about the stair.

## The spatial outline

Seven strata, from the road down and in. Each is one or two rooms of the authoring format's *level* (see `data/generation/deep/*.json`: spine, branches, loops, connectors with mechanisms), so it can be written as a deep-site *purpose* in data without a new engine.

```
 road ── the Bend ── the Landing ── the Terrace of Tiers ──┐
                                            │               │ the Bridge of Weights
 the Reckoning Room ◄── the Question Hall ◄─┘               ▼
        │                    │                       the Great Void (atrium, glass roof)
        │                    └───► the Drowned Level ◄──────┘
        ▼                                 │
 the Roots (cultivation vaults) ◄─────────┘        the Ring-walk (roof; a view only)
        │
 the Service Way ──► a cliff-face door onto the far side
```

## Eight to twelve environmental moments (for painting commissions)

*Painted without anyone in the foreground, wide, light and state first. Marked where the owner has already painted something close.*

1. **The Bend.** A kerbed Aenean road, ruler-straight, turning once and sharply round a hillside of tumbled green; a milestone with two counts on it, the second struck through. *(New.)*
2. **The Landing.** A broad shelf of dressed stone where the survey party chalked its numerals; tall doors the colour of old brass, one a hand's breadth open. *(New.)*
3. **The Terrace of Tiers.** The building seen from outside: ring on ring of balconied terraces climbing a cliff, ivy, a waterfall coming out of the fourth ring. *(New; the owner's installation painting is the vista from above.)*
4. **The Great Void.** The inside of the tiers: bridges, gantries, balustrades, a broken glass roof letting rain and sky down a hundred-foot well. *(`scene-ruins-arcology`: built, dormant.)*
5. **The Bridge of Weights.** A long span over the void whose deck tilts under what it carries, with counterweights on chains as thick as a man's arm: a traversal puzzle with a posted limit. *(New.)*
6. **The Question Hall.** Rows of niches with brass tablets, a lamp-hollow beside each; a rolling ladder; the hum is loudest here. *(New; a cousin of `infinite-library` and `archive`.)*
7. **The Reckoning Room.** A dome with a bronze ring and a painted ceiling of the reckoning of the sky: the first makers' watch-towers, much grown. *(Near: `celestial-observatory`, `celestial-map`, not yet imported.)*
8. **The Drowned Level.** Pillars standing in clear black water, pipes and a valve-wheel above the surface, shafts of light from the void. *(`scene-waterworks`, imported here, is exactly the register.)*
9. **The Roots.** Vaults of cultivation under the arcology: terraced beds gone to a green wilderness, glowing pools, crystal. *(Near: `crystallarium`, `glowing-pool`, `crystal-grotto`, not yet imported.)*
10. **The Quiet Floor.** One level where nothing is wrong: rooms laid for a meal, lamps trimmed, no dust. It is the most frightening place in the site because it is the only one that has been *kept*. *(New.)*
11. **The Ring-walk.** The arcology's roof and the great ring seen above the drowned city, from a place that is only a viewing-ledge. *(`scene-ruins-installation`: built, dormant.)*
12. **The Service Way.** A narrow brick passage, lamp-niches every ten paces, coming out of a cliff-face door onto the far side, a day from anywhere. *(New.)*

## Traversal problems (ways of getting through that are not "fight")

- **Load and weight** (the Bridge): a posted limit in the old numerals; what the company carries is the puzzle (a heavy pack, a captive, a laden mule).
- **Water** (the Drowned Level): drained by a valve in the roots, with consequences upstream (the posting-house's cistern valve is a small rehearsal of this).
- **Counting** (the Stair That Counts, between Landing and Terrace): treads that sound a note; a number of steps is the "key". Anyone can follow the survey party's chalk; anyone who can read the old numerals can be quicker; a scholar companion can be *right*.
- **Light.** Two levels are lit by the void; two by nothing. The lamp economy of the first hour (M19-170) applies at its harshest.
- **Return.** Every stratum has one way back to the one above that does not use the stratum's own mechanism: the Service Way is the first one found backwards.

## Creature ecology (using what the bestiary already holds)

| Stratum | Who lives there | Why it is plausible |
|---|---|---|
| Terrace | swifts, bats, ledge-goats, ravens | a cliff-face colony; none dangerous, all information (a goat on a balcony says a stair is sound) |
| Void | owlbears/boars at the foot, carrion birds above | the dead zone under a well of light |
| Question Hall | **constructs**: `automaton`, `clockwork_soldier` (both currently authored-in-scene-only; here they are the arcology's *own* keepers, dormant until the hum changes) | the one place they make sense as wardens rather than monsters |
| Drowned Level | eels, pike, an `ooze` | clear water, old cisterns |
| Roots | giant insects, `dryad`/`sprite`-class fey where the beds have gone wild, a `slump` | overgrown cultivation |
| Quiet Floor | nothing | which is the problem |

The point of the table is *plausible availability somewhere*: it activates two stranded construct kinds without placing them in the opening region.

## Why different people come (not one opening)

- **A scholar of Aenean inscriptions** (the posting-house copyist, or any caller of lore): the numerals on the Landing disagree with the day-book.
- **A guide's obligation**: the gamekeeper of the Hall sworn to turn people back from "the Works" by a family oath nobody remembers the reason for. He has never been inside.
- **A debt**: the first town's job board or the hobs' toll-house gives money to someone who also needs a brass tablet.
- **A pilgrim's doubt** (a religious figure whose belief is *challenged but not refuted*): the Question Hall's tablets answer questions in a way the faith has a word for, and the word is "temptation".
- **An apprentice's ambition**: the glassmaker's, clockmaker's or herb-wife's apprentice sees a level they could not have imagined.
- **A creditor's agent**, **a prince's surveyor**, **a monk of the old order with a ladder**: each reads the same Landing differently.

## How it connects to what is built

- **The posting-house** names it (the map's grey blank; the day-book's detour; the lamp-keeper's custom of not going past the Fourth Stone).
- **The Hall's muniments**: the Empire's grant of the road ("fifty paces either side belong to the road") has a clause that stops at the Bend. The steward does not know why.
- **The old stones on the hill**: first makers who counted the sky; their chime plays the four notes that the arcology's Question Hall hums in the other key. (A clue, not a claim.)
- **The oldcoin scholar** (existing scenario): who pays in old coin and reads the old places, is the natural first person to ask about the late coin the fisc-chest holds.

## What an adventure would need (technically)

Nothing outside the existing authoring system for a first version: a deep *purpose* (`data/generation/deep/arcology.json`, in the format of `waterworks.json`) with seven levels and the connectors above; the two paintings mapped to the kinds `arcology`/`void`; the two construct species given an `arcology` role. What would be new: a **posted-limit mechanism** (load-bearing bridge) is not a thing the rules express today; it can be faked with a `Thing` whose change `needing` an item-weight predicate, or requested properly (see the Kyr/Deem requests).
