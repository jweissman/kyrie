# Module 3: The Bound Howe (a race that does not wait)

*11 November 2026. Branch `adventure/p3-howe`, re-engined from `adventure/fs-expedition`. This page is the storyboard of the second version; the last section says what is proved and what is not. The first version (a barrow expedition: a dungeon that waited, with a camp of salvagers and a levy as factions) is in the git history; its rooms, laws and best puzzles are kept below, and what changed is said plainly.*

**One line.** A king's howe on a ridge, and a week in which three companies race at it and the dead answer: the shire-reeve's licence-men are cutting through the howe's flank, a second company with a patron's letter and a ram is a day or two behind them, and the howe, which keeps the bounds of the land, responds to every door that is opened. If nobody comes, things happen: the face breaks about the seventh day, the dead raid the camp that night, the town's levy is lost with it, and three days on the dead walk down to the green. The company can ally with either side, deceive the one, sabotage the other, turn a captain, shut the door behind everyone, or arrive in time to lose.

## What changed, and why

The blind playtests never reached the first version, and the sibling content that was reached (Lapisrecs) showed a good puzzle chain with one-hit fights. Read against the commission, the Bound Howe was a *dungeon that waits*: its rooms, its camp and its levy were the same on day 1 and on day 30, and "salvagers" and "levy" were scenery for the company's errand. What was good in it, and is kept: the laws of the howe (the seal-stone and its three keys, the hungry mounts and their bells, the three flutes and the worn one, the lying tread, the foul drift, the flood, the basin and the Mouth), the warden and her tally-stick, the survey cairn and the plan made of three finds, the ring and its grey grass. What was missing was **momentum**. The engine is now an *escalating crisis with rival parties*, and the dungeon is the place where its consequences land.

| | before | after |
|---|---|---|
| Time | the same on day 1 and day 30 | a clock of beats on `day(clock)`, drawn per country |
| Parties | one faction (the camp) and a levy that stood still | four that move: the licence-men's cutting, the Lantern Company, the dead, the reeve's levy; plus a local who wants it left alone |
| What the company's act changes | rooms for itself | rooms for the others (a breach, a flood, a forced door, a reset tread) |
| Finding it | a line overheard in a taproom from day 2 | a hiring-man's cart and a notice on the first green from day 2; smoke over the nearer town's roofs; a wounded digger on a hurdle later |
| Combat | the dead in their rooms; the camp when attacked | reasons: rival retainers at a door, the dead raiding the camp, the dead walking to the green, the crew turning on a thief or a torc-bearer |
| Outcomes | a torc paid or a seal shut | four ground states (sealed, opened, sacked, overrun) shown on both greens and in the first town |

## The clock (the unclocked course, and what moves it)

Two numbers are drawn per country by Deem (`templates.json`): **B**, the day the licence-men break through (day 6 to 8), and **A**, the day the second company reaches the ridge (day 4 to 6). Day numbers are the world's `day(clock)`: day 1 is the morning the company starts.

| Day | Crew (Spade-Company) | Rival (Lantern Company) | The dead | Town and levy |
|---|---|---|---|---|
| 1 | cutting the trench; face *sound* | not on the ridge | bound; seal set (or broken, by the country's fate) | smoke over the near town's roofs; the clerk's levy notice |
| 2 | | | | **the hiring-man's cart arrives on the first town's green**, with a notice that says where |
| 3 | | | | the reeve's levy is called on the near town's green |
| A | | **arrives**, camps by the ring | | |
| A+1 | | takes its ram to the door | | |
| B-2 | face goes *thin*: it rings, a draught comes through | | | |
| B-1 | | | | **the levy marches**: for the diggers, to the camp (default); against them, to bury the face (if the priest, the clerk or the warden was turned) |
| A+2 | | the ram goes in: the seal is forced (sealed country) or walked through | **the host stirs** | |
| A+3 | | its hands fight the household in the gallery: it wins by a die, by the roll sold to it, or because the household is dead; else the hands die and the captain comes out with the reader | | |
| A+4 | | at the flutes: the reader plays the right flute only if told (or one time in three); else he falls | | |
| A+5 | | at the throne; the king asks who keeps the bound; the torc is lifted; the hands die; the captain and the reader go out with it | | |
| B | face *broken*; **the horse-hall is lit by day through the breach** | | on the first dark the riders and mounts raid the camp: the watch is dead, the crew and the foreman go to the town | |
| B+1 | | | the second way in (shaft, dig-camp, drift, sump) begins to flood: the breach lets the ridge's spring run down the old drain | |
| A+7 | | the captain and the reader leave the ridge with the torc | | |
| B+3 | | | **the host is abroad**: each night the household walks down to the green | the levy, if it was at the camp, is lost; the first town's green carries the closed-road notice |
| 14 | the country holds one of four states: sealed, opened, sacked, overrun | | | |

What moves a beat: the foreman's men undo a wedge in three days; a split ram-shoe delays the rival by two days; killing or turning the captain stops her; a turned foreman stops the crew; a buried face stops the breach for good; a levy turned against the diggers buries the face on the day before it breaks. The default course is the `unclocked` line of `module.json`.

## Where it is in the world

A *standing scenario* (`data/scenarios/bound-howe.scenario.json`): every first country holds one. It takes a generated site of kind `barrow` (or `cave`) and the settlement nearest it (`town`), and now also the **largest settlement (`first`)**, whose green and taproom it imports; the hiring-man's cart arrives on that green on day 2. Four hooks (the diggers, the levy, the old woman, and the second company on the road) are told by the innkeepers of the near town and its road neighbour.

## The parties, and what they want

| Party | Who | Wants | Moves | Where it can be talked to, fooled, robbed, fought |
|---|---|---|---|---|
| **The Spade-Company** | the foreman (drawn name; warrior, thief or ranger), four hands, two watchers, the pit sentry, the cook and surgeon (sells barley, salt, rope, spikes, a shovel, oil, torches), Tam the digger | the licence honoured; the torc's weight in coin; to be paid | cuts the face; undoes a wedge; is raided and flees | the camp: a bargain, a hire, a persuasion, a chest, a fight |
| **The Lantern Company** | the captain (drawn; owes a patron), three hands, a scout, her nephew the reader | the king's torc by midwinter, or the company's bond is forfeit | arrives, takes a ram to the door, goes in, comes out | its camp by the ring: a bargain (the roll of kings sold, 60 coin), a lie (the wrong flute), a letter, a ram, a fight |
| **The Kin-host** | the household (3 ghouls), the mounts (3), the riders (2 revenants), the king (13) and his sworn, the last of the Kin | the bound kept; the door shut; the torc left | stirs, raids the camp, walks to the green | the gallery, the horse-hall, the camp (night), the green (night) |
| **The reeve's levy** | five townsmen under a baker, the clerk, the priest | the licence honoured and the iron and gold made up; or, once turned, the howe shut | is called, marches, buries the face or is lost | the near town's green, the shrine |
| **The warden** | an old woman at a hearth | the dead left alone; the diggers gone | can be asked to walk down to the town (and leave her hearth cold) | the hearth |

The patron of the Lantern Company is **the shire-reeve himself**, who also licenses the Spade-Company and has told his clerk of one. The captain's letter and the foreman's ledger both prove it (`reeve_double`).

## The howe, and the way the week lands in it

Twenty-six places, four ways in. The old rooms and laws are as in the first version (the forecourt, the gallery of kings, the horse-hall, the harness-store, the riders' bench, the chamber of flutes, the high chamber, the room behind the seat; the robbers' shaft, dig-camp, drift, sump, flooded passage, the older chamber and the well). New: **the face of the cutting** (the end of the trench), **the Lantern Company's camp** (by the ring), **the Kin's weir** (a drain-cistern under the horse-hall).

| Way in | Needs | Changes with the week |
|---|---|---|
| The front: the seal-stone | rites, the greeting (from the warden, or the scholar's own reading of the lintel), a shoulder; or the rival's ram | forced by the rival; the greeting stays learnable |
| The robbers' shaft (the foreman's leave, or a rope by night) and the hole into the harness-store | the second way in | **floods** three days after the breach; the weir's stopcock drains it again |
| The back: the sump, the older chamber, the first folk's stair (the plan of three finds) | the plan | unchanged |
| **The breach** at the face | digging, or time | opens by the clock; light and the dead come through it |

What one party's act changes for the others: the breach lights the horse-hall by day, draws the riders onto the camp, and floods the lower works. A forced seal re-arms nothing; **a seal heaved home re-arms the middle tread** (the Kin built it to be shut, and kept). A split ram delays the rival's door; a buried face closes the breach. The stopcock in the weir stops the flood; the weir is reached by a grating under the horse-hall's mangers (found by searching) or from the sump.

## Combat (and what each fight is for)

| Fight | Level, numbers | Reason | Ways round |
|---|---|---|---|
| the watch at the lookout (2), the hands (4) and the foreman | 3, 4 | the licence, and fear | a toll, a hire, a persuasion, the tins, the cutting |
| the Lantern hands (3), the scout, the captain, the reader | 3, 3, 5, 3 | a commission; a bond | the roll sold; a lie; a letter; a ram split; a persuasion |
| the dead in the gallery (3 ghouls), the horses (3), the riders (2) | 3, 4, 6 | the bound | rites, greeting, roll, barley, wax; the closing rite (a cleric) |
| the riders and mounts raiding the camp | 6, 4 | the breach | be elsewhere; the levy at the camp does not survive |
| the iron-capped dead (2) | 2 | the king's night | the committal (a cleric) or a fight in the light |
| the king and his sworn | 13, 6 | the torc | the flute, the oath, the torc left or laid back |
| the Mouth, the drowned crew | 7, 3 | what the Kin were set to keep down | oil; do not go down |

Difficulty is data only (level, numbers, temperament and `Warns`); the figures are at the end.

## Background, and what the system supports

| Calling | Sees or does |
|---|---|
| ranger (`woodcraft`) | the crews' tracks on the rise and the ring (who came, how many, what they carry); the cutting's spoil (twelve men, no more); the track to the king's flute in the chamber of flutes |
| warrior (`intimidation`, `brawn`) | the disposition of the diggers (they watch the hill, not the road) and of the rival's hands (afraid of the diggers, not of the dead); the shoulder at the seal; the hurry at the face |
| scholar (`lore`) | the greeting on the lintel (so the warden is not the only way to learn it); the Kin's plate at the weir; the plan |
| thief (`lockwork`, `trapwork`, `stealth`) | the foreman's pay-chest, the captain's strongbox (a patron's letter), the ram, the tins, the pin under the middle tread, the props at the face |
| cleric (`rites`, `insight`) | the seal's rite; the unfinished closing rite of the household (and the closing rite, an action); the committal over the iron-capped dead; the captain's number in her lips |

*Not supported (no TypeScript added):* a "warrior's read of a band" as its own capability (`intimidation` is borrowed), a ranger's count of a track as a number, and a skill checked against one named person other than by a `Resolve check`.

## What the country keeps

The first town sees the cart (day 2), the hurdle (after the raid), the closed-road notice (three days into the dead), and the struck-through licence if the howe is shut; its innkeeper has three answers by state. The near town sees its levy called, marched, lost, or home with clean spades; its green sees the dead at night once the host is abroad; its clerk learns his master hired two companies; its priest rallies the levy; its warden may have walked down. The ground state is four things: **sealed** (the seal set, the face closed, the torc home); **opened** (a way open, the torc home); **sacked** (the torc gone, to the rival or the company); **overrun** (the dead on the greens).

*Mercy:* the cleric can close the household's rites and lay the iron-capped dead to rest; Tam can be paid his wages and a road home; the reader can be spared by the company that tells the captain what the torc will cost. *Betrayal:* the foreman turns on a company that carries the king's torc into her camp and on one that robs her chest while it lingers; the captain takes the torc under the king's own question; the company can sell her the roll of kings and tell her the wrong flute.

## What the fights measure (the encounter audit's own machinery)

`scripts/encounter-audit.ts`'s `EncounterAudit.measure` over the howe's new and changed bands, against four (warrior, cleric, mage, thief) at level 3, 4 and 5, 12 trials each, fought in the open (no warning turn, no ambush, no place's laws: see `encounters.md` §1). *Win*, *wiped*, rounds to win / rounds to be wiped, hurt = share of the worst-hit member's hit points lost.

| Band | L3 | L4 | L5 |
|---|---|---|---|
| Lantern hands x3 (level 3 warriors) | win .25, wiped .75, 25 rounds | win .25, wiped .50, 22 rounds | win .67, wiped 0, 14 rounds |
| the whole Lantern Company (hands, captain L4, scout, reader) | wiped 1.00 | wiped 1.00 | win 0, wiped .58 |
| the Lantern remnant (captain L4 and the reader; hands dead) | win .67, wiped .25 | win .92, hurt .48, 15 rounds | win .92, 12 rounds |
| the household, now four ghouls of level 4 (was three of level 3: won in 5 to 6 rounds, hurt .2 to .4) | win 1, 12 rounds, hurt .61 | win 1, 9 rounds, hurt .34 | win 1, 5 rounds |
| the camp raid: two revenants (level 6) and three dead horses (level 4) | wiped .75 | win .58, 26 rounds, hurt .96 | win 1, 14 rounds |
| the Spade-Company's four hands and foreman (unchanged) | wiped 1.00 | wiped 1.00 | win .08, wiped .50 |

What this says, honestly: the whole Lantern Company, the Spade-Company's hands with their foreman, and the camp raid are *meant* to be avoided or won by another means at levels 3 and 4 (a persuasion, a sold roll, a split ram, a letter, the closing rite, being elsewhere); the remnant after the howe has had its way with the hands is a fight a prepared company of level 4 wins at a cost; the household, which the first version let three of level 3 beat in five rounds at a fifth of their hit points, now lasts nine. The audit fights in the open; the page's warning turn, the places' narrowness and the company's preparation are not in these numbers. The fights are long in rounds because natural weapons do not grow with level (R83 in the requests file), not because they are hard to begin.

## What is proved, and what is not

*IMPLEMENTED* (Kyr, Deem and data; no TypeScript, no change to `data/rules`, first-hour text or the shared files): `data/situations/bound-howe/` (`situation.kyr` re-voiced and extended, `crisis.kyr`, `rival.kyr`, `crew.kyr`, `town.kyr`; `templates.json` and `tables.json` draw the second company's captain and reader, the hiring-man, the labourer, and the two day-numbers); the scenario imports the first town's green; `scripts/play-howe-week.ts`; the three requests R85 to R88; this page; two transcripts.

*AUTOMATICALLY VERIFIED* (`test/bound-howe.test.ts`, 57 specs, passing; `test/standing-modules-found.test.ts`, 14, passing): the module loads in the six seeds (`kahitude`, `a1`, `b2`, `thorn`, `c3`, `d4`) with its people where they belong and the days drawn; **the week by the clock with no one on the ridge** (levy called on day 3; the second company camped on its day and at the door the day after; the face thin two days before it breaks; the seal forced two days after the company's arrival; the face broken on its day; the raid on the first dark, the watch dead, the foreman in the town; the dead on the green and the levy lost three days on); a rival and a player each able to force the door, and the crew and the player each able to break the face; the second company's way through the howe when shown the roll and the right flute (sacked, the torc gone, the scout and hands dead, the tread sprung), and when told the wrong flute (the reader dead, the torc home); a split ram delaying the door by two days; a strongbox picked for a letter; the captain turned by the reeve's seal; the clerk shown it and the levy turned against the diggers, marching with salt and burying the face; the priest and the warden rallying it (the warden's hearth left cold); the face wedged (undone in three days) and brought down; the horse-hall lit by the breach by day; the lower works flooded on the third day and drained by the stopcock; the tread reset by a shut door; the raid on a company at the camp; hiring at the cart; the labourer's key and the thief's pick for the pay-chest; the foreman turning on a torc-bearer; the first town's end (the hurdle, the closed-road notice, the dead on the near green); each calling's observations (ranger, scholar, cleric) and the cleric's closing rite and committal; all the first version's laws (the seal, the roll, the mounts, the flutes, the steps, the oath, the second way in, the Mouth, the plan, the levy, the priest) in sealed and broken countries. Four ground states are *reachable* in specs (sealed by `howe_kept`, sacked by the rival's path, overrun by the nobody course, opened between the breach and the dead's third night).

*ACTUALLY PLAYED* (by the page's labels, `bound-howe-race.txt`; not a cold player): a lone level-one warrior from the starting town, by the cart on the first green on day 2 to the camp (no set-down); the first town and the town below the ridge on days 2, 5, 8, 12 with nobody on the ridge (no set-down); four of level four selling the second company the roll and the flute (the company is set down at the camp on its day with `Placed.at`, and the waits are `=day` steps). The first version's two routes (`bound-howe.txt`) predate the change.

*NOT verified:* no cold player and no browser session; no painting seen by eye (the three new places take their painting from their names, and want entries in `scenery.json`: the integrator's one-liners are in the report); the Lantern Company's whole-company fight is tuned to be won by other means and has not been played by a human; the levy's fight with the dead and the rival's fight with the household are dice and `Slay` (R85, R86); the first town's market does not change its prices (the hiring-man sells fixed stock); the cave fallback in a mountain country and the desert and frost countries are loaded only; `kahitude` is no longer a country in which the Kin were broken (the template's draws moved; `b2` and `d4` are); nobody has tried to complete the best case (the howe shut, the face buried, the torc home, the rival turned, the reeve's seal shown) in one run.
