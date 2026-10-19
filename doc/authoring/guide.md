# Authoring a Kyr world

This guide takes you from an empty folder to a playable region: a village with an inn and a shop, the people who
keep them, a ruin across the water, and a situation installed in it. Everything below uses only the recommended
vocabulary ([ontology.md](../architecture/ontology.md)). The example is checked by `test/authoring-guide.test.ts`,
which pulls the code blocks out of this file, installs them and plays them, so the example always works.

You need three files:

| File | What it holds |
|---|---|
| `site.kyr` | The places, passages, people, things and knowledge of your region |
| `module.json` | Which rules the site uses and which of its places a situation may use |
| `*.campaign.json` | Which site and situations to install, and a default company |

## 1. Places: one tree, from region to room

Every place sits inside exactly one other place. The kinds, from outside in, are `region`, `settlement` or
`wilderness`, `site`, `building`, `level` and `room`. Only rooms are somewhere a company can stand. Larger places
give rooms their context: a room inside a building is indoors, and a room inside a settlement is in town. Rules use
both facts. You cannot camp in the inn's taproom or on the village green, but you can on the lake shore.

The `at x, y` numbers are a room's cell on the map of its area. For an area, they are its position on the region
map. Rooms of different areas never share a map, so you can number each area from zero.

```kyr
Module thornmere "Thornmere" {
  Description "A lake village, the reed shore beyond it, and a drowned chapel on the far side of the ford.".

  Place mere "The Thornmere country" is region.
  Place village "Thornmere" is settlement within mere at 0, 0.
  Place shore "The reed shore" is wilderness within mere at 1, 0.
  Place chapel_site "The drowned chapel" is site within mere at 2, 0.
  Place inn "The Heron" is building within village.
  Place chandlery "Osk's chandlery" is building within village.
  Place crypt "The crypt" is level within chapel_site.

  Place green "the village green" is room within village at 1, 1.
  Place taproom "the Heron's taproom" is room within inn at 1, 0.
  Place counter "Osk's counter" is room within chandlery at 2, 1.
  Place cottage "the reed-cutter's cottage" is room within village at 0, 1.
  Place strand "the lake strand" is room within shore at 0, 0.
  Place porch "the chapel porch" is room within chapel_site at 0, 0.
  Place nave "the flooded nave" is room within chapel_site at 1, 0.
  Place stair_foot "the foot of the crypt stair" is room within crypt at 1, 1.
  Place ossuary "the ossuary" is room within crypt at 2, 1.
```

## 2. Passages: how places connect

A passage joins two places and can be used in both directions unless it is `one way`. Its kind says what it is
physically. The kinds are `passage`, `door`, `doorway`, `arch`, `gate`, `stair`, `steps`, `ladder`, `shaft`, `path`,
`track`, `road`, `causeway`, `bridge`, `ford`, `tunnel`, `crawl`, `culvert`, `drift`, `incline` and `ferry`. Its
duration says how long it takes to cross: ten minutes unless you write `taking 30 minutes` or `taking 2 hours`. A
passage can be `hidden until` a fact is known, or `needing` a skill or an item kind.

```kyr
  Passage heron_door "the Heron's door" is door between taproom and green.
  Passage chandlery_door "the chandlery door" is door between counter and green.
  Passage cottage_door "the cottage door" is door between cottage and green.
  Passage shore_path "the shore path" is path between green and strand taking 1 hour.
  Passage ford "the chapel ford" is ford between strand and porch taking 30 minutes.
  Passage chapel_door "the chapel door" is doorway between porch and nave.
  Passage crypt_stair "the crypt stair" is stair between nave and stair_foot.
  Passage ossuary_arch "the ossuary arch" is arch between stair_foot and ossuary.
  Passage bone_chute "the bone chute" is shaft between ossuary and strand one way hidden until chute_known.
```

`kyrie lint` checks that the kinds make sense. A stair that does not change level, or a road that ends indoors, is
reported.

## 3. The company and the people

The company is declared once, where it starts. Its members come from character creation, or from the campaign's
default `party` if the player skips creation. Coin and rations given to the company go into its members' purses and
packs.

```kyr
  Company party "Your company" of 3 at green.
  Initially Set quantity(party, gold) to 8. Initially Set quantity(party, rations) to 1.
```

A person has a place and whatever you choose to fix about them: `Ancestry`, `Calling` (class), `Level`, a
`Profession`, a `Background`. Anything you leave open is filled by generation, if the campaign generates people, or
by a default. **What you write always wins.** If a generator suggests a different ancestry, it is ignored and the
conflict is reported by `kyrie lint`.

A profession or background is an overlay adapted from Orsino. It can add attribute modifiers, coin, gear, skills,
services offered to others, and a daily routine. An innkeeper offers lodging and keeps the inn without you writing
either. `Sells` stocks goods, which are counted, or item kinds, which become individual items on the shelf. `Offers`
adds or replaces a service.

```kyr
  Person wenna "Wenna" at taproom {
    Role "innkeeper". Profession innkeeper. Peaceable.
    Sells rations for 2 coin from 4.
  }
  Person osk "Osk" at counter {
    Role "chandler". Ancestry dwarf. Peaceable.
    Sells rations for 2 coin from 6.
    Sells rope for 1 coin from 2.
    Sells bandages for 1 coin from 3.
    Offers healing "salve and clean linen" for 2 coin.
  }
  Person tam "Old Tam" at green {
    Role "eel-catcher". Background hunter. Calling ranger. Peaceable.
  }
```

Backgrounds and professions are in `data/canon/backgrounds.json`:

- Professions: `innkeeper`, `herbalist`, `priest`, `boatman`.
- Backgrounds: `hunter`, `medic`, `locksmith`, `explorer`, `miner`.

Some backgrounds require a class; `hunter`, for example, requires a ranger.

### Classes, traits, equipment and creatures

A person of an ancestry can have a class, a level, traits and equipment.

- **Trait** names something they are or have learned. A specialization, such as a cleric's `vitalist` (the life
  domain), opens the spells of its domain up to the highest level the person can cast. A feat, such as `knight`,
  needs its class and level. A lineage trait, such as a dwarf's `sturdy`, needs its ancestry.
- **Carries** gives them one of an item kind. A weapon or focus is equipped if its slot is free, and grants the
  strike or technique it carries.

A creature that is not a person of an ancestry is a **Species**: a wolf, a cave hound, a golem, a dragon. A species
brings its own statistics, natural attacks and nature traits, so it takes no class. A variant such as `frost_wolf`
or `red_dragon` names its base species in the catalog and changes only what differs.

```kyr
  Person reeve "Hollis" at green {
    Role "reeve". Ancestry human. Calling fighter. Level 3. Trait knight. Background locksmith.
    Carries longsword_of_flames. Peaceable.
  }
  Person sister "Sister Maren" at taproom {
    Role "travelling healer". Ancestry dwarf. Calling cleric. Level 3. Trait vitalist. Background medic. Peaceable.
  }
  Person wolf "a grey wolf" at strand {
    Role "a lone wolf, thin from the winter". Species wolf.
  }
```

The catalogs live in `data/canon`, one file per concept: `ancestries`, `species`, `classes`, `traits`,
`backgrounds`, `abilities`, `conditions`, `items`, `skills`, `religion`, `organisms` and `rules`. Use the plain
identifiers you find there. Former identifiers still resolve through `aliases.json`, but lint reports them.

## 4. Things with states

A thing stands at a place or on a passage, and is in exactly one state at a time. Each state has the description the
player sees while it holds. A `blocking` state closes the passage the thing is on, and a `dangerous` state hurts
whoever crosses. A `Change` moves the thing from one state to another; it can need a skill or an item kind, or consume
a good. You never write a separate scene line saying the gate is open: the gate's state says it.

```kyr
  Thing grille "the rusted grille" on ossuary_arch {
    State shut blocking "A rusted iron grille closes the ossuary arch.".
    State open "The grille hangs open on one hinge.".
    Change force "Lever the grille open" from shut to open needing crowbar.
    Change pick "Pick the grille's lock" from shut to open needing lockwork.
  }
  Item lever "a sexton's bar" is crowbar at nave.
```

A mechanism of your site is a **Hazard**, written in the same effect language as abilities. It belongs to your
module alone; no other world sees it. A thing hurts whoever crosses it while it is in a dangerous state.

```kyr
  Hazard bone_slide "A slide down the bone chute" means "Deal (1d4) physical damage to ally unless dexterity save against (10).".
  Thing chute_bones "loose bones" on bone_chute {
    State loose dangerous "Loose bones slither down the chute.".
    State settled "The bones have settled at the bottom of the chute.".
    Hurts with bone_slide when loose then settled.
  }
```

## 5. Knowledge

A discovery is something that can be known. Its sources are where it can be learned: a document to read, or a person
who will say it. A passage hidden until a fact is known appears on the map once the company knows that fact.

```kyr
  Discovery chute_known "A bone chute drops from the ossuary to the strand; the sexton's ledger marks it." {
    Source ledger "the sexton's ledger" at porch readable by party.
  }
```

## 6. Descriptions and goal

An observation describes a place while its condition holds. Write what the company sees; leave out how the game
works. `kyrie lint` reports text that explains the implementation ("persists", "the engine", "flag").

```kyr
  Observe green_scene at green when true "Cottages lean around a muddy green. The Heron's sign hangs over one door, and Osk's chandlery smells of tar and candles.".
  Observe taproom_scene at taproom when true "A peat fire and a long table. Eel nets dry in the rafters.".
  Observe counter_scene at counter when true "Coils of rope, jars of salve, and sacks of meal behind a scarred counter.".
  Observe cottage_scene at cottage when true "One room, a reed bed, and a window facing the water.".
  Observe strand_scene at strand when true "Grey water laps a pebble strand. Across the shallows, the chapel's roofline breaks the surface of the reeds.".
  Observe porch_scene at porch when true "A stone porch above the waterline. A ledger lies swollen on the bench.".
  Observe nave_scene at nave when true "Knee-deep water fills the nave. Steps go down at the far end.".
  Observe stair_scene at stair_foot when true "Dry air, and the smell of old bone.".
  Observe ossuary_scene at ossuary when true "Shelves of skulls, and a square black opening in the floor.".
  Goal false.
}
```

## 7. module.json: rules and exports

The bundle lists the rules your site uses and names the places a situation may use. Exports are the only way a
situation reaches into your site, so a situation never names a particular room. A site that generates nothing leaves
out `generation`.

```json module.json
{
  "version": 1,
  "situation": "site.kyr",
  "rules": ["../../rulesets/world/core.kyr", "../../rulesets/world/passages.kyr",
    "../../rulesets/world/people.kyr", "../../rulesets/world/needs.kyr", "../../rulesets/world/services.kyr",
    "../../rulesets/discovery.kyr", "../../rulesets/world/care.kyr", "../../rulesets/world/belongings.kyr"],
  "globals": ["party"],
  "exports": { "party": "party", "home": "cottage", "lookout": "strand", "captive": "ossuary",
    "tools": "nave", "site": "chapel_site", "closing": "ford" }
}
```

## 8. Installing a situation

A situation is a reusable conflict written over roles. *Caught Below*
([data/situations/caught-below](../../data/situations/caught-below)) needs a company, a site, the room where someone
is trapped, a room with a tool, the home they left, a lookout where someone waits, and a passage that will close. The
campaign binds each role to one of your exports. The situation then brings its own people, the fallen weight, the
closing water and its outcomes. Its `setting` chooses the regional flavour: names, what fell, and what closes the
way.

```json campaign.json
{
  "version": 1,
  "name": "Caught Below — Thornmere",
  "modules": [
    { "id": "world", "bundle": "module.json" },
    { "id": "rescue", "bundle": "../../situations/caught-below/module.json", "context": { "setting": "river" },
      "imports": { "party": "world.party", "workings": "world.site", "captive_room": "world.captive",
        "tool_room": "world.tools", "home": "world.home", "lookout": "world.lookout",
        "closing_way": "world.closing" } }
  ],
  "party": [
    { "name": "Ilse", "raceId": "human", "classId": "fighter", "backgroundId": "locksmith" },
    { "name": "Rook", "raceId": "elf", "classId": "ranger", "backgroundId": "hunter" },
    { "name": "Sefa", "raceId": "dwarf", "classId": "cleric", "backgroundId": "medic" }
  ]
}
```

In Thornmere, someone is pinned in the ossuary, someone waits on the strand, and the ford floods in the afternoon.
The grille needs the sexton's bar or the locksmith's skill. The bone chute is a way back for a company that read the
ledger. The Heron sells a night's sleep, Osk sells rope and salve, and every hour on the shore path is an hour of the
river rising.

## 9. Check it

```
bun bin/kyrie.ts lint path/to/your.campaign.json
```

Lint reports identity conflicts, places outside the containment tree, passages whose ends are not places,
duplicate passages, passage kinds that contradict their ends, rooms the company cannot reach, actions with no
possible target, items of unknown kinds, and prose that explains the implementation. A recommended world has no
findings.
