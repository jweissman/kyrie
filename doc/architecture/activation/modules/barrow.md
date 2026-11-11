# Module 3: The Bound Howe (a dangerous expedition)

*11 November 2026. Branch `adventure/fs-expedition`. The storyboard was written first (image, then dramatic function, then mechanism) and revised against the build; this is the revised text. The last section says what is proved and what is not.*

**One line.** A king's howe on a wind-scoured ridge, half robbed already: a salvage crew digs in its lee for the gold; an old woman keeps the dead's rest with a hearth and a tally-stick; the shire-reeve's clerk wants the king's torc; the dead keep their law in the gallery, the horse-hall and the chamber of flutes; and under the Barrow-Kin's floor lies something older than the Kin, which they were set to keep down.

**Where it is in the world.** A *standing scenario* (`data/scenarios/bound-howe.scenario.json`, registered in `standing.json` after the circus): every first country holds one. The scenario takes a generated site of kind `barrow` (or `cave` in a mountain country, where no barrow stands) and the settlement nearest to it. The generated site is the Kin's small *marker-barrow* at the foot of the ridge; the module (`data/situations/bound-howe/`) builds the rest within it: the ridge, the king-howe, what lies under it. The country's people tell of it by three hooks (the diggers, the shire-reeve's levy, the old woman on the ridge); the way in is the steep path, or a sheep-way told of by the rumour or found by searching at the foot.

**Told in the first town too (integration, 11 November 2026).** The hooks reach only the town nearest the howe and its
road neighbour (in `kahitude` Brockminster and Fearnmaere), which a blind playtest never visited. The scenario now also
binds `first` to the `largest` settlement (s1) and imports its taproom, where two drovers are overheard from the second
day (`Observe drovers_tell ... as hearsay when day(clock) >= 2 and not knows(party, ridge_told) ... teaches ridge_told`),
one line, gone once heard; it teaches the diggers' hook, which opens the sheep-way. The clerk, green, shrine and walkers
stay with `town` (`near:howe`). The castellan of this module is now the *shire-reeve* (and the levy a call for iron and gold),
so that a country holding the Silent Lord, whose castellan and levy are another's, does not hear one office twice. The
specs read the howe's site and town from the placement, not from `w13`/`s5`.

**Intended party, and what a prepared one does.** Three or four, **levels 3 to 5**, level 4 the middle. It is the starting country's deep end, beyond its dens, its towers and the Hall's cellar. A first-level company can climb the ridge, pay the watch, hear the warden, take the fold's salt and read the survey stone (transcript 1), and should not go on; one that does is met at the forecourt by an ambush the page has already described. Measured with the engine's auto-fight (seed `kahitude`; four of level four unless said): the household of three ghouls falls with no loss; the dead horses and the riders that wake with their bells kill four of level three and are taken by four of level four with no one down; the king with his two sworn is taken by four of level four or five with one casualty (the mage); the camp (four hands and the captain) is broken by four of level four; the Mouth in the well is *not* won by auto-attacks at levels four to six (a casualty or more each time), which is as designed: it is answered by fire and by not going down. Every danger is foreshadowed in the outer works, answerable by preparation or ingenuity, and the way out is the way in. The price of the prize is moral and national, not lethal.

**What it is not.** Nothing here copies a published trap. The mechanisms are the Barrow-Kin's own, and each follows from what `arts.json` says they believed (the dead keep the bounds of the land; a people with no barrows has no country; they spoke with their dead through flutes of bone; they laid kings with their horses).

## 1. The map: twenty-three places, three regions

```
THE RIDGE (open air; the generated marker-barrow is its foot)                      THE HOWE                                     UNDER
 marker-barrow ─steep path (weather)─► lookout ─► heather rise ─► camp in the lee ─► trench ─► shaft head ═ rope ═► shaft foot ─ dig-camp ─ low drift (air) ─ sump ─ flooded passage ─ older chamber ─ well
      │ (sheep-way, told or found)              │         │ │         └─ track ─┐                                      (robbers' hole)│                                     │ first folk's stair (the plan)
      └──► old fold ──(tins)──────────────────┘         │ └─► goat-track ─ warden's hearth                                       ▼                                     ▼
                                                         └──► ring of stones ─ sunwise (20m) | straight (5m, grey grass) ─► forecourt ═ seal ═► gallery of kings ─► horse-hall ─► riders' bench
                                                                    └─ survey cairn                                                 │            └► harness-store ◄─ robbers' hole      ▲
                                                                                                                                    └► chamber of flutes ─ steps up ─► high chamber ─► room behind the seat ◄───────┘
```

| Region | Place | Dramatic function | Painting (`scenery.json` `places`) |
|---|---|---|---|
| Ridge | the marker-barrow (generated) | the first look: the howe on the skyline, two columns of smoke | site's own |
| Ridge | the salvagers' lookout | the watch, the toll; the steep path is plain to it | pass |
| Ridge | the old sheepfold | the quiet way round, salt for the sheep; a line of tins across the gap | heath |
| Ridge | the heather rise | the crossroads of the ridge | peak |
| Ridge | the warden's hearth | a safe rest, the rites, the tally-stick | rustic home |
| Ridge | the camp in the lee | the faction: captain, hands, surgeon (sells barley, salt, rope, spikes, a shovel, oil, torches, candles) | campfire |
| Ridge | the robbers' trench | their cutting into the flank; props that can slide | quarry adit |
| Ridge | the head of the robbers' shaft | the winch and the sentry: the second way in | mine shaft |
| Ridge | the ring of standing stones | grey grass that does not move; two ways on | ruins on a hill |
| Ridge | the survey cairn | a squared stone older (or newer) than the Kin; its bronze plate | ruins |
| Howe | the forecourt of the howe | oxen bones, the lintel, the seal-stone; the iron-capped dead | barrow forecourt |
| Howe | the gallery of kings | the household seated in its niches; a lesser torc | barrow passage |
| Howe | the horse-hall | the dead's mounts at empty mangers; bells on the pickets | stable |
| Howe | the harness-store | barley, a lesser torc, bronze; the robbers' hole opens in its floor | barrow recess |
| Howe | the riders' bench | the king's riders, who wake to the bells | barrow recess |
| Howe | the chamber of flutes | the law of the voice: sound as hazard and key | necromanteion |
| Howe | the high chamber | the king on his seat; the torc; his sworn | barrow chamber |
| Howe | the room behind the seat | the Kin's last, sealed from within, or broken open | vault sealed |
| Under | the foot of the robbers' shaft | the second entrance lands in the middle | mine winze |
| Under | the robbers' dig-camp | their lower works, their dead laid in a row, the plan on a post | mine face |
| Under | the sump | the drowned crew | mine sump |
| Under | the older chamber | pale stone that is not the Kin's; a basin | adyton |
| Under | the listening well | what the Kin were set to keep down | cistern |

## 2. Factions

| Faction | Who | Wants | Relations |
|---|---|---|---|
| **The Kin-host** | the household (3 ghouls), the king's riders (2 revenants), the dead horses (3), the king (revenant) and his two sworn (revenants); the last of the Kin (4 spirits, if the Kin sealed themselves in) | the bound kept: the door shut, the mounts fed, the roll answered, the torc left | at war with the salvagers; will not harm the warden; bound to what lies in the well by the same oath |
| **The Spade-Company** | the captain (named per country), four hands, two watchers, the pit sentry, the cook and surgeon | the torc's weight in coin; the shire-reeve's licence honoured; to be paid | afraid of the household by night (salt across every track into the camp); the warden has salted their tracks; owed by the clerk |
| **The warden** | an old woman at a hearth, the last lay-keeper | the bound kept, the salvagers gone; she will not draw a blade | knows the greeting, the tune's mark and what the torc is; trusts salt |
| **The shire-reeve's clerk** | at the nearest town's green | the levy made up by midwinter; pays by the weight: 80 for the king's torc, 30 for any other torc of the Kin (three make a levy) | holds the salvagers' licence; knows more of the cairn than he says |
| **What lies in the well** | the Mouth (mouther) | out | speaks in the voices of whoever it has taken (the drowned crew call for "Hob") |

## 3. Hazards, each with its clue and its answers

| # | Hazard | Clue | Answers | If it goes wrong |
|---|---|---|---|---|
| 1 | **Weather** on the steep path (clear, brewing, white; by terrain: rain, mist, wind, snow, dust) | cloud coming down from the howe; the lookout's smoke lies flat; a sign at the foot | wait it out; sheep-way | cold damage (1d8, DC 15) to whoever crosses in the white |
| 2 | **Tins** across the fold's gap | a line seen with woodcraft or pushed with a pole | cut (lockwork or trapwork), step over (stealth check), or take the steep path | the watch comes down to the fold |
| 3 | **The watch** | trodden ground; horn and crossbow | four coin; say you come about the levy; or fight | alarm; the camp is roused only by a fight there |
| 4 | **Grey grass** | a mule's bones on it; the deer-track goes round | the sunwise way (20 minutes); never the straight way (5) | chill and weakness (2d6, DC 16) each crossing |
| 5 | **The seal-stone** | worn smooth; the lintel names the king | rites (quiet; the household stays seated); the greeting (taught by the warden); or a shoulder (loud; the household rises); heave it back to shut | forced in a sealed country: the household wakes |
| 6 | **The roll of kings** | names cut under each niche; the lintel | call the roll into the open door | the household is hostile on entry |
| 7 | **Hungry mangers** | clean, scratched troughs; the sacks in the store; the warden: "feed the mount before the rider" | pour barley in (a good bought at the camp, or taken from the store by the second entrance) | the horses fight; the bells wake the riders |
| 8 | **The bells** | cords of plaited horsehair to bronze bells | stop them with candle-wax and rag | the riders rise (revenants, level 6) |
| 9 | **The flutes** | the worn flute felt in the dark; the stave on the lintel; the tally-stick | play the worn flute: the dead ask who keeps the bound, and the king will talk | any other flute shrieks (1d8, DC 13) and rouses the household |
| 10 | **The false step** | one tread's bright edge; a dead robber at the foot | wedge it with iron spikes; prod it with a pole; or step over after it has gone | a fall (2d6, DC 13) |
| 11 | **The torc** | cut with WHILE THIS IS WORN THE BOUND IS KEPT; the warden | leave it; take a lesser torc from the harness-store or the third niche; or take it and break the bound | the king rises, the sworn with him, and each night the household walks to the nearest town's green |
| 12 | **Trench props** | a fresh tongue of spoil | pole or spikes to brace them | a slide (2d6, DC 13) |
| 13 | **Foul air** in the drift | a candle burns blue; a dead jay in a cage | dig out the vent (shovel) | poison (1d6, DC 13) each crossing |
| 14 | **The flooded passage** | black water; the robbers' line | make fast the line with rope; or drain the sluice (the dig-camp's plan, or the sketch) | drowning damage (1d6, DC 12), once |
| 15 | **The Mouth's voices** | the crew's calling voices | do not follow them; burn oil on the water: it sinks | pulled toward the well (1d6, DC 13) |
| 16 | **Night** | salt lines at the camp; the trodden ring; the warden | salt the sill (a line of salt across the howe's door keeps the household in); keep to the hearth, the camp (if welcome) or the harness-store | the household on the forecourt; rest broken |

## 4. Encounters (level; tactic)

| # | Encounter | Where | Level | Tactic |
|---|---|---|---|---|
| 1 | the watch (2) | lookout | 3 | toll, levy-talk, or a fight; sneak by the fold |
| 2 | the hands (4) and the captain | the camp | 3, 4 | the hands break at half; a bargain (twelve coin), a hard persuasion (the torc's cost) or a fight; the captain can be turned or killed |
| 3 | the pit sentry | the shaft head | 3 | the captain's leave; or rope down by night |
| 4 | the iron-capped dead (2) | the forecourt | 2 | an ambush: the ring shows them first; put them down in the light |
| 5 | the household (3 ghouls) | the gallery by day; the forecourt by night if the door is open | 3 | rites/greeting/roll/salt, or the door as a chokepoint |
| 6 | the dead horses (3) | the horse-hall | 4 | feed them; or fight at the arch |
| 7 | the riders (2 revenants) | the bench | 6 | still the bells; or hold them at the horse-hall arch |
| 8 | the king and his sworn | the high chamber | 13, 6, 6 | answer him (flute, then an oath); or fight on the steps |
| 9 | the drowned crew (3) | the sump | 3 | in the drift mouth, one passage wide |
| 10 | the Mouth | the well | 7 | oil on the water; or do not go down |
| 11 | the last of the Kin (4 spirits) | behind the seat | 3 | peaceable while the stone stands; the stone broken from outside breaks the bound |
| 12 | the walkers | forecourt, ring; the town green after the torc | 3 | salt; the warden's hearth; the camp |

## 5. Resource pressure

- **Light.** Torches burn an hour (M19-170); every room of the howe and below is dark, and a company that cannot see cannot act on what it cannot see. The older chamber's basin takes lamp oil and lights the chamber and the well for good. Oil also drives the Mouth down.
- **Wounds.** The ridge's weather, the grey grass, the trench, the steps, the drift and the flood cost blood and no healer lies below the camp (the cook sells bandages).
- **Time.** A day's light on the ridge; the household walks at night if the door is open and the sill unsalted; a camp at the forecourt is broken by it.
- **Carry.** The king's torc weighs fourteen, a lesser torc five, a sack of barley six; the company is laden at ten and twice each member's strength and goes at half pace.
- **Supplies.** Barley, salt, spikes, rope, a shovel, a candle, lamp oil, a pole, a torch more than one thinks.
- **Rests.** The warden's hearth and the harness-store are rests; the camp is a rest if the captain tolerates the company; anywhere else on the ridge is a camp out in the open and the forecourt after dark is the worst place on it.

## 6. Approaches

1. **The front:** the steep path (or the sheep-way and the tins), past the watch (toll, levy), round the ring, the seal (rites, greeting or shoulder), the gallery, the horse-hall (barley), the chamber of flutes, the steps, the king.
2. **The bargain:** twelve coin to the captain; the sentry lets the company down the shaft; arrive in the dig-camp and come up through the robbers' hole into the harness-store, past the gallery and the seal, with the barley and a lesser torc to hand.
3. **The quiet way:** the sheep-way, the tins cut or stepped over, round the ring, the rite.
4. **The warden's way:** salt for her ring; the tally-stick; the greeting; the stave; she knows what the torc is.
5. **The back:** the foul drift, the sump (line or sluice), the older chamber (basin lit), the first folk's stair that the three finds (the diggers' sketch, the tally-stick, the cairn's bronze plate) put together, up into the room behind the seat, and the stone drawn aside from inside: the throne without the gallery, the horses or the flutes, and without breaking the bound.
6. **Retreat and return:** every room has a way back; bands keep their posts and do not follow; the seal can be heaved home from the forecourt and the howe is kept; the harness-store is a rest; the plan, once made, stays made.

## 7. Persistent consequences, outside the site

1. **The levy.** The torc (or three lesser torcs) taken to the clerk in the nearest town: eighty coin for the king's, thirty for each other, the levy struck off the notice on the green. Any smith will also buy a torc for his own price.
2. **The bound.** Broken (the king's torc lifted, or the stone behind the seat broken from outside), the household walks each night down the lane to the nearest town's green, and a line of salt appears across the taproom's threshold by day. Kept (the seal heaved home), the green says the ridge has been quiet, and the shrine's priest gives two flasks of holy water.
3. **The captain.** Turned (a hard persuasion with the torc's cost): the tents come down, the captain and the hands go to the town's taproom, the licence-notice is taken off the post, and she gives the sketch. Killed: the clerk strikes the licence off his tally. Paid: the camp is a rest and the shaft is open.
4. **The warden.** Trusted by salt: the tally and the greeting. A kept howe leaves her hearth lit.
5. **The oath.** Sworn to the king (after the flute): broken, with a voice from the stone, if the torc is taken.
6. **The cairn.** The plate's wheel-and-wing, shown to the clerk, makes him put it in a drawer: "do not show it to the shire-reeve; he will build something." Unresolved; the threads motif.

*Not built:* an interest of Wystan Hale (the Hall's keeper, once the castellan's spearman) in the howe, because the region module does not export him (request R37, was R15g).

## 8. Variation by country (Deem: `tables.json`, `templates.json`)

Identity is fixed: the same twenty-three places, the same laws, the same prize. What a seed changes:

- the dead **king's name and by-name** by terrain (Aldwine Long-Sighted, Wulfric Reed-Walker, Ordgar Stone-Shouldered, Sigeric Hearth-Cold, Cenred Dust-Rider…), the **captain** (name; warrior, thief or ranger), the **warden**, the **clerk** and the **surgeon** (names by the country's folk);
- **which flute is the king's**, one of three (`kinflute`), and so what the hand finds in the dark and what the stave on the lintel says;
- **how the howe was left**: the Kin sealed themselves in (the seal set, the last of the Kin lie behind the seat, the household sits) or strangers broke it before (the seal already forced, the stone behind the seat broken, nothing in the last room, the household already walking by night). `kahitude`, `thorn`, `d4` broke it; `a1`, `b2`, `c3` sealed it;
- **the weather of the ridge** by terrain (rain, mist, wind, snow, dust).

## 9. What is proved, and what is not

*IMPLEMENTED* (Kyr, Deem and data only; no TypeScript beyond a new script and a spec): the scenario, the module (23 places, 16 hazards, 12 encounter groups, five factions, topics, actions, objectives, milestones), the tables, the paintings, the standing registration, `scripts/play-party.ts`, this document.

*AUTOMATICALLY VERIFIED* by `test/bound-howe.test.ts`: it is installed in the six seeds `kahitude`, `a1`, `b2`, `thorn`, `c3`, `d4` (and `kite` by `bin/kyrie world`); reached from the starting town by the page's own labels; weather, the watch, the tins, the grey grass; the camp (trade, toll, the persuasion, the fight); the warden, the cairn and the plan; the seal by rites, greeting, shoulder and roll in a sealed and a broken country; the household by day and by night, and the salt; the horses, flutes and steps; the oath and the torc; the second entrance, the drift, the sump, the basin, the Mouth, the first folk's stair; the levy, the walkers on the green, the priest. A company is set down in a place by `Placed.at` only to skip the walk, never to skip what lies there.

*ACTUALLY EXPERIENCED* (read by the author as a player would, through the command line): two routes in `transcripts/bound-howe.txt`: the walk from Thornhaven alone at level one to the ring, and a prepared company of four through the whole of the front route to a shut door.

*NOT verified:* no cold player, no browser session, no painting looked at by eye (the paintings are chosen by name and the registry); the Mouth's fight with items; the death-and-return of a company that is beaten (no spec plays a loss through to a return); the carry limit's effect with the torc in a pack; countries in mountain terrain (the `cave` fallback) were loaded but not played.
