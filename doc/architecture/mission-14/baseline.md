# Mission 14: baseline

Short and evidence-backed, as the brief asks; the work follows it.

## 1. Dungeon generation now

A generated region's adventure sites are the makers' *works*: thirteen hand-written Kyr plans
(`data/generation/works/*.kyrt`), each a fixed set of 4–14 places (sections choose some of them), one or two levels.
Every work gets, at most, one trap on its inner way (three in five), one wonder beyond it (one in two), one riddle
door on its way in (two in five), one or two treasures from its makers' lists, and a den of beasts drawn by habitat
(`RegionRenewal`, `RegionEcology`). Danger is 1 or 2 by plan; nothing rises with depth; there is no elite, no boss,
no objective deeper than the work itself. The *great work* (one per region) is hidden until the makers' story is
pieced together, and is another fixed plan of 5–7 places. The writing is good and the places make physical sense;
there is nothing to explore for longer than an hour.

## 2. What survives of Orsino's dungeon design

Orsino's `dungeon`/`room`/`boss_room` templates (`../orsino/settings/fantasy/templates.json`) and Dungeoneer
(`src/orsino/Dungeoneer.ts`) made a *campaign* of a town and several dungeons of rising level (`_moduleLevel`,
`dungeonIndex`). Each dungeon is a paced run of 10–11 rooms by *flavor* (`roomSequences`: standard, dangerous,
lucrative, balanced), each room's odds set by its *guide* (`roomOverlays`: entrance, empty, trap, mob, elite, special,
treasure, wonder, puzzle), room types biased by building (`roomBias`), set-piece *special rooms* (`specialRooms`:
phylactery, catacombs, ritual chamber…), challenge rising through the run (`targetCr + round(index/3)`), traps hard
or deadly one time in ten with punishment rolled up to 100 when deadly, riddles by difficulty paying loot by
difficulty, legendary wonders 2%, treasure by tier, an elite and a boss room (`difficultyTier`, `bossNpcTypes`), a
goal (`macguffin` before a `bad_outcome`) and a rumour in town (`dungeonRumor`); resting risks wandering monsters.

| Orsino | In Kyrie | Verdict |
|---|---|---|
| Riddles (4 difficulties, loot by difficulty) | One per riddle door, drawn evenly; a wrong word does fixed cold harm; no reward by difficulty | Weaker |
| Traps (difficulty, DC, punishments to 100) | Mechanisms with signs and remedies (better); one per work; harm capped at 10.5 everywhere | Weaker in distribution |
| Wonders (common, 2% legendary) | 43 runnable, drawn evenly, one or two a country | Weaker in rarity |
| Room sequences, overlays, bias | Fixed plans | Absent |
| Special rooms | None | Absent |
| Difficulty tiers, monster ranks, rising challenge | Level from plan danger (1–2) + 1 | Absent |
| Elites, bosses, boss rooms | A great work's dragon only | Absent |
| Goal and rumour | Hooks per work (who tells of it); the great work's revelation | Partial |
| Several dungeons of rising level | All works alike in danger | Absent |
| Aspects, templates, shops | Present | Present |

The 751 "reference" entries include `roomSequence`, `roomOverlay`, `specialRoom`, `difficultyTier`, `monsterRank`,
`treasureTier`, `trapRoll` and `wonderRoll`, each marked as replaced by Kyr's works. They were not replaced in
behaviour: Kyrie kept the vocabulary and lost the pacing, scaling and escalation.

## 3. Kyr limits that block deep, reactive sites

- **Time**: every action costs a whole ten-minute watch; a torch (one hour) lasts six actions.
- **Making things in play**: no new people or objects during play (finding 14).
- **Conditional ways** are possible (`opening when P`), but not conditional destinations (a cage that goes to where it
  is).
- **Counted offers** (a wonder or a feature used a number of times), **carrying capacity** and **rule tracing** are
  absent.
- **Inhabitants** keep their lairs; a site is re-taken once (`RegionRenewal`), nothing comes up from below.

## 4. Interface conventions in the way

- The room chart (`MapView.local`) draws one level's grid with names; it does not show up and down, landmarks, or
  known-but-blocked against unknown.
- Generic tries are offered on everything ("Listen at the letters round the door").
- A way with an obstacle had a heading that looked clickable and did nothing ("The dark behind the iron door": the
  tripwire still lay across it after the ice elemental was killed). *Fixed in Stage 1.*
- A person who turns angry (the owner of something taken) showed as a painting with nothing to click and no way to
  give it back. *Fixed in Stage 1: "Give it back", and a silent person's actions are shown.*

## 5. Invariants neglected

- `bin/` held 23 scripts. *Fixed: `bin/kyrie` alone; the command's tools in `src/cli` (lint, compile, test, validate,
  preview, world, voice, handbook, orsino, playtext); utilities in `scripts/`; checked by `test/repository.test.ts`.*
- No written contract. *Written: [`doc/CONTRACT.md`](../../CONTRACT.md).*

## What gives the most

1. A generated **deep site** built from its makers' purpose, several levels, with Orsino's pacing, escalation,
   elites and an objective restored inside Kyrie's physical places.
2. **Sub-watch time** for small actions, so light and supplies can be planned.
3. Mechanisms that act across rooms and levels (water, winding gear, collapse) in Kyr, and a level map that shows
   them.
