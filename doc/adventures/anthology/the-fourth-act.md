# Wapshott's Fourth Act — The Island of Monsters

*Adventure III of [the anthology](README.md). Files `data/goings-on/circus/act4.kyr` (the crate, the hatching, the charter, the Colonel), `isle.kyr` (the island's places and telegraphs), `isle_life.kyr` (its creatures, plants, finds, bargains); catalog `data/catalog/animals.json` (seven species); spec `test/circus-act4.test.ts`. 7 November 2026.*

## How it grows out of Phases I and II
Phase II ended with the Warrant decided, the Keepers' Book unread in one column, a claw and a thigh-bone, and the Colonel a Keeper. Act IV starts two days after the Revels (`revelsDone`): a mate of the brig *Sundial* delivers a crate that the Colonel's own letter — to "the one address he had not tried" — summoned. Eleven eggs; they hatch the night they come. If the company had Billie or Honoria warm them (`warm_lamp`, `warm_oven`) they hatch penned; if not they hatch loose on the town's green and the geese suffer (`hatchlings_damage`). They are caught by meat, by stillness or by Billie, never by a fight. Sir Gervase reads the paper, finds *Sarn* in the Book's red column and charters the *Sundial*; the Colonel, Billie and (if he is regarded) Mumchance come as followers. The island is a region of the circus module, reached by a `ferry` from the first town's green, so the circus's people can be on it.

## The island
Six regions, no order: the Progress's shore (landing, cage-row, the Preserve-house with the Warden's journal and map), the mangrove delta (egg-beds, Captain Harrow's Hippodrome camp, a crocodile), the cycad forest (fern-runners, the hook-claws' hollow, the kingsfoil hollow), the fern plain (stilt-runners, three-horns, the lantern-necks at the lake, the tyrant's hollow), the steam basin (bone-beds, the tar-pits with a sunk young three-horn), the nesting cliffs (sail-wings).

**Behaviour:** hook-claws hunt in a pack and are telegraphed by a click that stops; three-horns guard their calf; the tyrant hunts the plain's edge at dusk (a rush hazard unless the company stands in the lee of the herd); the lantern-necks do nothing at all — at dawn a herd of ten wades the lake, which is a Milestone (400) for watching and a hazard for standing in the way; sail-wings guard the ledge path.

**The decisions** (all persisted as facts, all survive a checkpoint): return the penned hatchlings at the den (the pack lets the company be); take an egg (worth 2000 to a dealer; the pack comes by night until it is put back); free Harrow's hook-claw calf or buy it; haul the sunk three-horn out of the pitch; stop the Colonel's trumpet (persuasion, or Mumchance's hand); and at the quay the Colonel's own choice — hold to the Rule (*nothing is to be taken that cannot be fed*), carry an egg home (Billie gives notice), or give Sir Gervase his pair of each (Billie sits on the quay). Each puts a line on the beast tent at home.

## Creatures: canonical and missing
Used unchanged: crocodile (variants great, elder), bat/raven none; hook_claw takes the canonical `young` variation for hatchlings. **New catalog records** (`animals.json`, no habitats so no generated den draws them; no portrait): fern_runner, hook_claw, stilt_runner, three_horn, lantern_neck, tyrant, sail_wing. *Paintings required:* `animals/fern_runner`, `hook_claw`, `stilt_runner`, `three_horn`, `lantern_neck`, `tyrant`, `sail_wing` (data/paintings/animals.json). Items from Orsino: dragons_egg, dragons_tooth, unusual_seashell, fallen_star, bronze_bracelet; plants: dulse, bamboo, cinnamon, dragonwort, staggerweed, kingsfoil; one local kind (island pitch) and two local documents (journal, map).

## Tested
`test/circus-act4.test.ts`: the crate comes and opens; hatches loose and is caught; hatches penned; the charter, the voyage, the den, the dawn herd, the trumpet, the Colonel's choice, home, and a save/reload. Circus Phase I and II specs rerun.

## 1. Content that works in play
Crate, eggs, both hatchings, three catches, charter chain, ferry and followers, hook-claw bargain, dawn herd, trumpet, the leave choice, home lines, chapters, milestones.

## 2. Authored content present but not reachable (or not specced)
Harrow (parley, calf purchase, springing the cage); the tar-pit rescue and mercy; the egg taken and the pack's night; the tyrant's rush and `stand_in_herd`; sail-wings and the cliff view; the two other leave choices (egg, specimens) and Billie's resignation; Mumchance as the one who stills the Colonel; all plants and finds. Reachable by hand; none played by an independent player; the island has had no playtest.

## 3. Actions or consequences the engine cannot yet represent
- **A creature that wanders by its own habits** (the tyrant's dusk hunt, the herd's dawn crossing) is rules keyed to the hour, not creatures that go; `Person` pursuits exist for people only, and the herd is placed.
- **Carrying live animals home** as exhibits: the menagerie's welfare system counts only commissions it already knows; hatchlings are penned in the beast tent but have no feed or draw.
- **The circus abroad:** the troupe rules move people by `post`; the expedition holds the wagons by pushing `moveDay` and marking people `away`.
- **Ports:** a generated country has no coast; the ferry goes from the first town's green with no sea described.
- **Consequences in the Warrant/Inventory** of what is taken or left: facts are kept but the Revels' scoring is not re-run.

## 4. Existing assets whose migration or integration is incomplete
- Seven new species have no paintings; the Monster Manual/Encyclopedia list them without plates (`bin/kyrie handbook` regenerated).
- Plant `uses` are not read; dragons' eggs and teeth are only valuables.
- The Keepers' Book (rest.kyr) is not edited: *Sarn* is learned from the crate's paper, not from Jabez's margins.
