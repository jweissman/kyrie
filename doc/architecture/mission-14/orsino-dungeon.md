# Orsino's dungeons in Kyrie: a behavioural audit

Written for: whoever has to decide whether Kyrie's deep sites are Orsino's dungeons recovered, or something else
wearing their names.

The baseline (`baseline.md` §2) found that Kyrie had kept Orsino's dungeon vocabulary (751 reference entries marked
"replaced by Kyr's works") and lost its behaviour: pacing, scaling, escalation. This audit compares behaviour, not
entry statuses. Orsino's side is `../orsino/settings/fantasy/templates.json` (`dungeon`, `room`, `boss_room`,
`trap`, `wonder`) and its tables (`roomSequences`, `roomOverlays`, `trapDc`, `treasure`), which
`bin/kyrie orsino generate` copies into `data/generation/scenes/orsino-world.json` under `dungeon`. Kyrie's side is
`src/world/deep/*` and its data, `data/generation/deep/deep.json`.

Verdicts: **Faithful** (the same behaviour, from Orsino's own data); **Adapted** (the same intent, changed to fit
Kyrie's places and rules, and why); **Beyond** (Kyrie does something Orsino does not); **Missing**.

## What Orsino's dungeon does

A module is a town and five dungeons of rising level (`_targetCr = moduleLevel + index`). A dungeon is a straight run
of rooms in a sequence drawn from four flavours (standard, dangerous, lucrative, balanced). Each room's guide
(entrance, empty, trap, mob, elite, special, treasure, wonder, puzzle) sets the chances of an encounter, a trap, a
puzzle, a wonder, a shrine and treasure. The room's challenge rises a step every third room. Traps are mechanical or
magical, easy or medium nine times in ten, and hard or deadly the tenth, with a punishment rolled from a table that
reaches its worst only when deadly; each has detect and disarm DCs. Riddles come by difficulty and pay loot by
difficulty. Wonders are one in ten rooms, legendary one time in fifty. Treasure is mostly negligible or minor, now and
then minor or major, one or two items. A boss room ends the run, with a boss encounter, two to eight minor or major
treasures and gear. The dungeon has a goal (retrieve a legendary MacGuffin before a bad outcome) and a rumour by
building type. Room types are biased by building (temple, fortress, library, tomb, mine), though the template fixes
the building to tomb.

## How Kyrie's deep sites compare

| Orsino behaviour | Kyrie now | Verdict |
|---|---|---|
| Room sequence by flavour (four flavours) | Each level draws one of Orsino's sequences (`DeepPacing.level`, `tables.sequences`) | Faithful |
| Room guide sets the odds of fight, trap, puzzle, wonder, treasure | Orsino's overlays, read from its own table, for each room in the order the level is reached (`DeepPacing.order`) | Faithful |
| Challenge a step higher every third room | `max(0, round(i/3) - 1)` added to a room's dwellers' level | Faithful |
| Five dungeons of rising level in a module (`moduleLevel + index`) | One site of four levels, each a dungeon of the module: dwellers at 1 + depth, so 1, 2, 3, 4 before the step along the run and an elite's two | Faithful in the rise; Adapted in that the dungeons are the levels of one site you go down, not five you travel between |
| Elite rooms (challenging) | Drawn from the purpose's elites by depth, two levels higher, always aspected, rarer aspects deeper (`DeepPacing.dwellers`) | Adapted: elites are the site's own (a goblin chief, a shift-boss wraith, a steam elemental) |
| Monster race by challenge (goblin/kobold to 5, orc/human to 10…) | Dwellers by depth from the site's purpose (rats, goblins and spiders at the top; ghouls and bone hounds in the haulage; ooze and crystal elementals in the drowned level) | Adapted: who lives there follows from what the place is |
| Boss room and boss encounter | The keeper at the bottom, in the room the purpose names, with a refuge and a fear; too strong to fight at first, beaten by knowing what it cannot bear | Adapted, and Beyond: a boss with a strategy rooted in the site's history (`deep-history`, `DeepSites.keeper`, `bane`) |
| Goal: a legendary MacGuffin before a bad outcome | The heart of the vein, what the makers died for: an objective once its story is heard, told when brought into daylight (`DeepSites.raised`) | Adapted: no clock on it; the bad outcome is the dark, not a deadline |
| Rumour in town by building type | The home town's innkeeper tells where it is and how to go; its merchant tells the story and buys the ore (`DeepSites.hooks`) | Adapted |
| Traps: easy/medium nine in ten, hard/deadly one in ten; punishment by difficulty | Harm capped by depth: no more than an average 10.5 at the top, 17.5, 28, 45 below, and no less than 0.6 of the depth above (`DeepPacing.trap`, `caps`) | Adapted: deeper is deadlier by construction rather than by a one-in-ten roll |
| Trap detect and disarm DCs | A trap shows a sign; looking closely tells what it is; knowing that opens remedies that need a skill or a tool (a pole across a glyph); risking it hurts (`RegionMarvels.snare`) | Adapted: knowledge and tools instead of DC rolls; Orsino's `trapDc` is copied but unused |
| Riddles by difficulty, loot by difficulty | Orsino's riddles, difficulty by depth (easy at the top, deadly at the bottom, a step harder one time in four); a casket pays a tier by difficulty, mostly the makers' own valuables; a wrong word breathes cold harm by difficulty (`DeepRooms.casket`) | Faithful in the riddles and their loot; Adapted in the harm |
| Wonders one room in ten, legendary 2% | Orsino's odds by guide; drawn from the site's list of fitting wonders (a singing crystal in a mine, not a fountain); no legendary wonders | Adapted: fit over rarity |
| Treasure mostly negligible/minor, now and then minor/major | A tier by depth, the better tier one time in five, never beyond what the site's purpose names; mostly the makers' own valuables, priced so a level of the mine pays about a level of the company | Adapted: the economy is Kyrie's, where selling treasure is experience |
| Shrines one room in ten | A shrine room on the haulage level, with a wonder; no shrine blessing in the deep | Missing (as Orsino's shrine) |
| Special rooms (phylactery, catacombs…) | The `special` guide puts an earlier party's camp there: its bedroll, its notebook (told once), rope and a torch | Adapted |
| Room decoration, features, auras | Every room's look is written for its role in the purpose; no auras | Different by design (written, not drawn); auras Missing |
| Gear in rooms | The purpose's finds by tier | Adapted |
| Building types and room bias | One purpose, the Delvers' mine (`DeepPurposes.all`) | Missing: only the mine. Orsino too fixed its building to tomb |
| Resting risks wandering monsters | Some rooms are restful; savage and territorial bands walk their own level, one in six each watch to where the company is (`DeepSites.rest`) | Faithful in intent |
| A dungeon is generated and then fixed | Built from what it was for (spine, branches, loops, connectors between levels), then what came after (the successors' and their fall's marks), then who lives there; it fills again while the company is away (`DeepLayouts`, `DeepHistory`, `DeepTime`) | Beyond |
| Linear run of rooms | Levels joined by a cage that runs once its wheel is freed, ladders, a one-way ore pass, a walled stair, a climb; loops; a hidden air shaft that is a second way out; a level that drains only while water is turned onto a pump a level up (`DeepMechanisms`) | Beyond |

## Where it is pinned

- `test/deep-expedition.test.ts`: told of at the home inn, the way told, walked to, gone into by torchlight; tries
  that suit a thing; dwellers met with words at stated odds; refilled while away.
- `test/long-expedition.test.ts`: a whole first expedition, played by its labels, replayed, and resumed from a save.
- `test/deep-history.test.ts`: the successors' marks by the world's own history.
- The mechanisms (winch, seal, drowning and draining, the vent, the keeper's flight from noon) were played through
  in text, with the record in this mission's report.

## What is still not Orsino's, and should be

- More than one purpose: Orsino's building types (temple, fortress, library, tomb) are Kyrie's other arts (sky, stone,
  bone, water) with no deep purpose yet.
- Orsino's shrines in the deep, and its auras.
- Trap DCs, if a roll is wanted alongside knowledge and tools; the table is there.
