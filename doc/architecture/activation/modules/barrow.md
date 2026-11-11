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

## Not finished (said plainly)

(filled at the end of the work)
