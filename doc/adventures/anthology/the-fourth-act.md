# Wapshott's Fourth Act — The Island of Monsters

*Adventure III of [the anthology](README.md). Files `data/goings-on/circus/act4.kyr` (the crate, the hatching, the charter, the Colonel), `isle.kyr` (the island's places and telegraphs), `isle_life.kyr` (its creatures, plants, finds, bargains); catalog `data/catalog/animals.json` (thirteen species); spec `test/circus-act4.test.ts`. 7 November 2026.*

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

## Second pass: what changed (deepening)

**Acts and chapters.** IV.i the tent (the crate; Honoria, Hench, Pip, the Quinceys, Mumchance and Nance each get a beat; the Colonel is asked not to name them and does), IV.ii the town (a night chase with a church tower and no fight; the Colonel's bucket and trumpet make it worse unless held; Sallow sends a net), IV.iii the Sundial (`voyage.kyr`: a brig as a region, eleven days each way, the contract read aloud, a storm, a calm, Crewe's story of Captain Vance), IV.iv Sarn, IV.v the Rest (`tent.kyr`: the Steward asks what a Keeper brings home; the Dowager's, Pell's and Sallow's answers).

**The Colonel.** Flaw: he names things and cannot be seen afraid. Costs: (1) the storm, where the player may cover his fear or name it; (2) the named hatchling that will not leave his boot until he sets it down (the pack will not take the young back otherwise); (3) the trumpet at the herd; (4) the quay: hold to the Rule, carry an egg home, or let the Society take its pair, each costing Billie something. Private affection: the widow at Dunmere; his mistake: the letter and the names.

**Companions with arcs, asked of the player.** Billie (cage or field), Mumchance (the slate by the herd), Sir Gervase (which kinds he may take, and Thorne's field-book), Crewe (was the Captain right to answer), Dab the stowaway (tell, hide, or promote), Captain Harrow (would you leave four men on a beach). Each is a question put to the player and answered by one of three topics, and each answer leaves a different fact.

**Side stories that lead nowhere:** the seventh Warden's unfinished epitaph (the key and a lore check), the green bottle from the *Hasty Mary* (cast back, or carried to Jabez's Book), the Coldharbour camp (bury the dead; Dr Thorne's field-book is Sir Gervase's old master), the boy in the hold, Harrow's men.

**Creatures: thirteen new species.** fern_runner, hook_claw, stilt_runner, three_horn, lantern_neck, tyrant, sail_wing, dawn_piper, plate_back, mud_skimmer, glide_lizard, bone_scuttler, shore_brooder, each with a behaviour and a telegraph a plain player can use: the pipers tell the herd's hour; plate-backs and sleeping lantern-necks shelter a company from the tyrant; skimmers leave the water when the lurker is near; glide-lizards show the hidden game-trail round the hook-claws; scuttlers show the one safe line over the crust; the brooder holds the strand and is gone round. Creatures keep hours: the tyrant patrols the plain at dusk, the herd moves lake, plain, plain, the colony launches at dawn and leaves its ledges empty for three hours.

**Ways, not fights.** Tyrant: leave the plain at evening; the ridge; the three-horn ring; the plate-back ring; the lantern-necks' legs; meat; or fight (level six). Hook-claws: return the young; meat; the freed calf; fire; Mumchance sitting; the hidden trail; or fight. Harrow: parley; buy the calf; spring the cage; cut the nets; the Society's charter; or four men. Three-horns: rescue the sunk calf; bamboo; a stealthy walk; Mumchance; the detour by the cliffs; or fight.

## Limitation lists (updated)
1. **Content that works in play:** all of the above, and `test/circus-act4.test.ts` (9 tests) walks the tent, the town, the voyage, the island's hours, six companion conversations and four side stories.
2. **Authored but not specced:** the tar-pit rescue, the egg taken and the pack's night, the cliff pitch with the colony, the bamboo and fire ways, Harrow's writ, the egg and specimen leave-choices at the Rest, and the Dowager's letter; no independent playtest of any of it.
3. **The engine cannot yet represent:** creatures that patrol by their own errands (done as hourly rules), a ship that moves through time (done as a berth fact and a wait), a follower who stays put between a question and its answer, and consequences that re-score the Revels.
4. **Incomplete assets:** thirteen species have no paintings (animals/<id> to be made); plant uses unread; dragons' eggs (2000) and teeth are only valuables; lantern lighting (see friction.md); Fenwick's contract clauses (Phase II) are not edited, only read aloud.

## Direction change: expedition, survival, awe (supersedes parts above)
Sarn is no longer a place where a verdict is given. The party are passengers and staff of the Colonel's expedition; time goes on the tide table, the casks, the delta fever, the tyrant's dusk, and one night on the quay (`endings.kyr`). **Removed:** the Rest's reckoning (the Steward's account, the Dowager's letter, the Preserve declared in the Crown's name), Sir Gervase's clauses read aloud as exposition (now two lines and a joke), the Colonel explaining the quay. **Added:** water casks and a spring; the fever and its cures; a reef passage that closes on the ninth day and three ways to run it; a night in which something comes for the camp, survivable by the Wardens' cages, fire, meat, or by having made peace with the hook-claws and the tyrant (and costing the bosun or an arm if not); Mr Mudge the bosun, Aggie Nunn the cook, Dab, and the net-men for voices. **Endings:** home with nothing; home with a loss (the bosun); a fiasco (the Colonel's named hatchling eats Ada's ticket-book at the gate); the Colonel hurt; the Colonel stays to keep the doors. None is a civic settlement.

## After the hostile review (what is now true)
The Rest's reckoning, the Warrant scoring and the contract-reading scenes are gone from the text and the specs. The Colonel decides what he takes home from what he has done (a query, four topics) and it costs Billie her post. Four casks, a hunted meal, a found spring, a fever that weakens; a reef passage that closes on the ninth day and can leave the ship aground for a month; a night when the pack stands at the edge of the fire on three beats and a door must be held. Endings are exclusive: nothing, a loss, a hurt Colonel, a fiasco at the gate, the Colonel stays. The spec file now has 14 tests, the charter chain among them played with nothing set by hand.
