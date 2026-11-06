# Creatures: what defines them and what makes them (M19-60)

The owner, 5 November: every creature, authored, generated, imported, met in an adventure, summoned or denned, should
be made by one canonical pipeline from one canonical base definition (`animals.json`, `monsters.json`), with
variation apart from species and rats and oozes as the regression cases. This is the diagnosis that comes first:
traced read-only on 5 November (the audit's working notes are in `/var/tmp/kyrie/creature-audit/`), each claim checked
against the code at the line named.

## One door, two engines

Every creature is made by `Content.createCreature` (src/content.ts:141); summons come in by `Content.creature`
(content.ts:101) and reach it too. Behind it are two engines, chosen by a list:

- If the species is a key of `creatureBody` in `data/generation/tables/creatures.json` — **dragon, wolf, golem, bear,
  cave_spider**, and nothing else — the creature is made by the Deem grammar (`generatedKind`, content.ts:131–140,
  switch at content.ts:148; the same test again at src/campaign/cast.ts:46).
- Every other species (rats, oozes, ghouls, dogs, the whole Orsino bestiary) is made from the catalog by
  `Creation.chassis` (src/rules/creation.ts:25–34).

So the same Kyr line, `Species X.`, takes a different road by X. These are the "five principal types".

## Where creatures are defined

| Source | What | Status |
|---|---|---|
| `data/catalog/species.json` | 31 hand species (wolf, dog, cat, boar, great_rat, cave_spider, dragon, golem, …) and 5 fighting objects; species `temperaments` by type | Authoritative; the chassis reads it |
| `data/catalog/orsino/species.json` | 93 generated kinds (54 monsters, 39 animals: rat, goat, ooze, …); no temperament or habitats; animals fixed at 2–3 hp with no growth | Authoritative, generated; joined with the hand file in `Canon.species` (src/canon/canon.ts:69) |
| Kyr `Species id "name" like base …` | 59 module-local kinds; may change name, temperament, description, habitats only | Authoritative per module; some ids clash across modules (`brock_kind`, `conger_kind`) |
| `data/catalog/variations.json` | 11 overlays on 6 axes (age, size, role, region, disposition, corruption) | Authoritative; `Variant x.` |
| `data/catalog/orsino/variants.json` | Orsino aspects and undead templates | Authoritative, generated; `Aspect x.` / `Undead x.` |
| `data/catalog/organisms.json` | 3 animals, 5 plants | Animals dead (only validation reads them); plants live |
| `creatures.json#creatureBody` | the 5 bodies, again | Redundant copy of species.json **and** the switch; a spec keeps four fields in step, the rest drift |
| `creatures.json#creatureAncestry`, `#creatureClass` | human, elf; ranger, warrior | Redundant copies of ancestries/classes; Deem humanoids only |
| `creatures.json#environmentAdaptation` | frost, marsh | Duplicates variations `frost`/`marsh` |
| `creatures.json#constructMaterial`, `#creatureRole` | stone; guardian | Deem constructs only; no live content asks |
| `creatures.json#creatureFamilies`, `#creatureKinds`, `#creatureFamilyPool`, `#creatureDimensions` | Deem's dispatch and eligibility | Live only for the five; the pool only when nothing is asked (CLI, tests) |
| `creatures.json#creaturePopulation` | race pools for people | Live: a creature with no race asked is drawn from it |
| `dragons.json` (`dragonLineage`, `dragonMaturity`) | lineages, ages | Live: `raceId: dragon` becomes "Young black dragon" |
| `ecology.json#denBeast` | what dens where, by habitat, by species id | Authoritative placement |
| `ecology.json#wildSign` | animal signs | Decorative; some keys are not species (grouse, adder, curlew, …) |
| deep sites' `dwellers`/`elites`/`keeper` | groups by species or ancestry+calling | Authoritative placement |
| `community.ts`, `occupations.json`, `folk.json` | town dogs, cats, goats, cows | Species named in code and data |
| `abilities.json` summons | species ids to call | Live |
| `data/paintings/registry.json` | 18 paintings named for species | Catalogued, **unused** for creatures |

## The regression cases

- **Rats.** Five stat lines: Orsino `rat` (2 hp at any level; tollhouse's "rats as big as cats", the deep sites at
  depth 0, summon_vermin, keel.kyr), `great_rat` (variant of rat, rolled, d3), the buck rat (great_rat + elder +
  great), `ci_rat_kind` (like rat, "size of a terrier", 2 hp), `pantry_rat` (like cave_hound). All by the chassis.
- **Oozes.** Only Orsino's `ooze` (44 hp at level 1, engulf, psionic blast); deep sites and summons. No hand entry.
- **Wolf.** Defined in species.json, creatureBody, creatureKinds, organisms (`grey_wolf`), `frost_wolf` (its own d10),
  variations `frost`, environmentAdaptation `frost`, local `umber_wolf`; always made by Deem, which adds frost or
  marsh at random (4:1:1) to a plain `raceId: wolf` with nothing in its name to say so.
- **Spider.** No plain `spider`: Orsino's was absorbed into `cave_spider`, an adjective made a species. The brood
  mother is made two ways (Deem body, 17 hp; species + great + brood_mother, 21 hp).
- **Authored adversaries.** The man with the black candle (`Ancestry human. Calling mage.`) and the Bargeman (local
  kind like great_pike) go by the chassis.

## Where one creature is two

- Dragon: species `dragon` (99 hp) is not what `raceId: dragon` makes (Deem: "Young black dragon", 36 hp); traits
  grant abilities only on the chassis road, so the Deem dragon has no `flight`.
- golem (Deem, grows) and iron_golem (chassis, fixed 15 hp) at level 8: 34 hp against 15.
- frost/marsh twice; `great` against the great_* species; dragon lineage red against `red_dragon`; slump written to
  replace `mud_elemental`, which a deep site still uses.
- Three habitat vocabularies: species/organisms (`woodland, upland, …`), ecology (`wood, grove, fen, …`) and Deem
  terrains (`forest, cave, …`).
- Portraits: only people of playable peoples have likenesses; animals an emblem; monsters nothing.

Adjective-as-species: cave_spider, cave_hound, great_rat, great_snake, great_centipede, great_pike, frost_wolf,
red_dragon, iron_golem, bone_hound; local young_owlbear, old_lion, umber_wolf, pantry_rat, marl_pike, silver_eel and
the eels "like great_pike", and more (the audit's list).

## Convergence (the plan, in this order)

1. **One engine.** `createCreature` makes every species by the chassis; the `creatureBody` switch goes (content.ts:148,
   cast.ts:46), and Deem's creature dimensions that are variation (lineage, maturity, adaptation, material, role)
   become entries of `variations.json`. Deem keeps choosing *which* base and *which* variations for a context; it no
   longer makes bodies.
2. **One base file per kind.** `data/catalog/animals.json` and `monsters.json` replace `species.json`'s species and
   carry the Orsino kinds by provenance (`source.orsino`), so that the base creatures Westernesse knows are in two
   files; the Orsino import writes its proposals beside them, not a second truth. Fighting objects stay apart.
3. **Variation, not species.** `cave_spider` becomes `spider` + `cave`; `great_rat` → `rat` + `great`; `frost_wolf` →
   `wolf` + `frost`; with aliases so old ids resolve (and old saves load). Those that are kinds of their own stay
   (red_dragon is a lineage of dragon; a revenant is not a variation of anything).
4. **One habitat vocabulary**, the ecology's, which dens and variation hints already use.
5. **Portraits by base id**, with an override for a variation that is truly distinct; the 18 paintings used.
6. **Acceptance** (the owner's): a new base creature by JSON alone, used in play; variations of one; made by Deem and
   by an authored scenario through the same machinery; its abilities, behaviour and portrait from its one record;
   kept across a save and reload; no path left that makes a creature another way.

## Done, 5 November

1. **One engine** (b930448c): every species is made from its record by the catalog chassis; the `creatureBody` switch
   (content.ts, cast.ts) is gone. A den with no beast of the world's picks a species (or outlaws, made as people) from
   its own tables (`data/situations/den/tables.json`: `denSpecies`, `denPeople`, `denCalling`); the brood-hollow's
   spiders are `Species cave_spider` with the brood-mother's variation.
2. **Two authored files** (79292ece): `data/catalog/animals.json` and `monsters.json` replace `species.json`;
   Orsino's 92 generated kinds are read with them from `data/catalog/orsino/species.json`, its role said in both files'
   `about` (a hand record naming an Orsino source stands in its place).
3. **Variation, not species** (cb16909a): a base `rat` that grows with its level, a base `spider`; `great_rat` is rat
   + great, `cave_spider` is spider + great + cave (`Species.variations`, applied once wherever one is made, and taken
   as chosen by a country's dens); the variation `cave` on its own axis (`haunt`), apart from climate.
5. **Portraits** (a30ce8b0): by the record's `portrait`, else a painting of the kind, else its base's
   (`CreaturePortraits`); the eighteen creature paintings now shown.
6. **Acceptance** (`test/creature-pipeline.test.ts`): every base creature from its own record; the rat's growth;
   great rat and cave spider from their bases and variations; the eel, a kind added by its record alone (and denning
   in rivers and lakes), made by an author's Person and by generation's casting alike, with its record's abilities,
   kept across a save and its reading again; portraits by kind.

## The inherited corpus, counted (5 November, late; the owner's audit)

Read-only audit against the Orsino checkout at the revision `data/sources/orsino/registry.json` pins (working notes and
tables in `/var/tmp/kyrie/creature-audit2/`). The registry matches Orsino's tables one for one: 44 animals, 40 monster
types in 10 classes, 17 elements, 10 dragon colours, 10 golem substances, 4 undead templates, 31 aspects, 8 ranks,
5 fighting objects. Nothing was lost in extraction; every loss was in conversion or placement.

| Before (5 November) | Count |
|---|---|
| Orsino bases with a Kyrie record | 84 of 84 (38 animals and 54 monster kinds generated beside the hand files) |
| Reached in play under their own name | 12 of 44 animals, 18 of 40 types |
| Reached only through a summon spell | 21 animals, 13 types (and 5 elementals) |
| Unconsumed | the vampire; antimagic ward, barrier, bomb, phylactery; organisms' three animals |
| Overlays carried | dragon colours 1 of 10, golem substances 1 of 10 (each made a species), ranks 0 of 8, templates 2 of 4 reachable |
| Generated animals | fixed 2–3 hit points at every level |
| Parallel paths | Deem's creature grammar (families, bodies, lineages, materials, adaptations, `dragons.json`), `organisms.json` |
| Visual text | Orsino has it for the 44 animals and 10 colours only; 18 kinds matched to a painting by name, the bear's showing no bear |

| After (6 November) | Where |
|---|---|
| One record per base kind: 54 animals, 45 monsters (105 records name their Orsino source), each with what it looks like | `animals.json`, `monsters.json`; the generated species file is gone and `bin/kyrie orsino bestiary` only says what Orsino has that no record stands for |
| What varies a kind as structure: 17 elements, 11 materials, 10 lineages, the stag's sex, beside age, size, role, region, haunt, disposition, corruption | `variations.json`; kept with each creature made (`Creature.variations`), refused where they do not fit its kind or type |
| A golem of any of Orsino's ten substances (and bronze), by one pathway; the materials named once | `materials.json` |
| Every dragon colour, with its breath and proof (the red's as Kyr's fire power) | lineage variations |
| The seventeen elementals the Elemental with an element; summons call them, never the bare base | `Species.requires` |
| Orsino's animals grow from their first-level hit points | animal records' `growth` |
| All four undead templates reachable in barrow and ruin dens | `RegionEcology.variant` |
| The fighting objects are devices, never creatures, placed by the deep sites as Orsino's encounters | `devices.json`, `Device turret.` |
| Portraits by record: 22 kinds name their painting; the rest name none, and so say they need one | `portrait` in each record |
| One way to make a body; the grammar retired, an author's `Creature` words read onto it | `Cast.creature` |

Specs: `creature-pipeline`, `creature-variation`, `devices`, `natural-history`, `geology`.

## Operational, 6 November (the owner: a bestiary the game uses, not one imported)

**What Orsino did.** Orsino composed each dungeon room's encounter as a party within a budget: twice the room's
challenge (`_levelBudget = targetCr*2`), the room's challenge rising one a dungeon and more a third of the way along its
rooms (templates.json:482, 525), the levels spread over two to five members given roles in order (tank, then support or
controller…), the enemy people by the challenge's band (goblins and kobolds, then orcs, lizardfolk, humans, then ogres
and trolls, then the draconic), a companion animal sometimes, a device one time in five; the boss room its own
generator (one leader, one companion, one monster at two thirds of the room's challenge). Its ranks were names only (their
hit points and armour were set after both were reckoned), and its bestiary monsters came into dungeons only as a boss's
undead, the catacombs' mummy and the ossuary's bone golem (`/var/tmp/kyrie/m19/orsino-encounters.md`, cited).

**What Kyrie had.** A deep site's dwellers were the four purposes' own lists by depth (about 25 kinds in all); the
dens a table by habitat; nothing measured how dangerous a kind was, so nothing could spend a budget.

**What it has now.**

| Step | Where |
|---|---|
| Each kind's danger, measured: the game's own fights against a lone human warrior of the standard kit, at the kind's first level and its fifth (a rat 0.17 of a first-level warrior, a wolf 0.5, a bear 1, a golem 5, a drake beyond a twentieth-level warrior) | `data/catalog/challenge.json`, `bin/kyrie bestiary challenge`, `src/world/challenge.ts` |
| Eligibility from the record alone: the habitats it lives in and how common it is there; never tame, never a device, never a kind met only with what it requires bare (the Elemental) | `Parties.eligible` |
| Composition as Orsino's: a budget of twice the room's challenge, two to five of a kind (one of a kind met `alone`), each at the highest level its share allows and no higher than its share; a second kind beside the first one time in three; one time in twelve a kind beyond the budget, alone, to be gone round | `src/world/parties.ts` |
| A party fought as one: a fight with any of its groups where they stand together is with all of them | `beside(group, group)` in `data/rules/inhabitants.kyr`, `src/campaign/beside.ts` |
| Structure laid on as it is drawn: a golem of a material, a dragon of a lineage, where the record does not say | `CreatureVariants.structural` |
| Deep sites: half the rooms of creatures (never a site's own people, who are its faction with their own words) hold a composed party from the purpose's `dwellerHabitats` | `DeepPacing.composed` |
| Dens: a kind whose record has an abundance and keeps a den dens by its share beside the table; one beyond a first den's danger is rare there and alone | `RegionEcology.den`, `recorded` |
| The open country: an animal that keeps no den is met where it lives, by its record | `data/generation/wild/animals.kyrt`, `RegionAnimals` |

**The ontology.** Qualifiers became variations of a base wherever they modify one: the hound (Orsino's) is the base of
the dog, the cave hound (cave) and the knitted bone hound (skeletal); the great rat, centipede and snake are their bases
made great, with only what is truly theirs (a venomous bite, the snake's coils); the great pike is a pike great and
old (a pike added as its base); the frost wolf is a wolf of the frost made great; the bronze custodian is the Golem in
bronze; Orsino's four undead templates are the variations of an undeath axis (what the dead are hurt by is their traits');
Orsino's small animal wyrm is a wyrmling, a dragon of the animal template (`wyrm_animal` kept as an alias); the drake,
wyrm and wyvern no longer carry the Fly spell. The tiger, lion, panther, crocodile and hyena were Orsino's companion
template (a squirrel's hit points) and are adapted as beasts of the wild. Kept distinct where warranted: the slump (the
Long Man's Wet), the eel, the dragon's ninety-nine hit points.

**Authoring.** The hollow-stalker (monsters.json) was added by its record alone, measured by `bin/kyrie bestiary
challenge hollow_stalker`, and is met in generated deep sites; self-heal (plants.json) with the item it gives
(items.json, selfheal) grows in generated meadows and heaths, is gathered as any stand's crop, and heals as its item
says. Boundaries named: a plant's `uses` are descriptive (no rule reads them); nothing identifies a plant (a stand is
seen and named outright); a new kind not yet measured is taken as a first-level warrior's match until it is.

Specs: `bestiary` (ontology, templates, measured danger, composition within budget, deep sites of four countries with
the parties fought together, the hollow-stalker in a generated deep site, self-heal in generated countries),
`natural-history`, `creature-pipeline`, `creature-variation`, `devices`. Coverage: `bin/kyrie bestiary report`
([bestiary.md](bestiary.md)); the inventory of Orsino's entries: [bestiary-inventory.md](bestiary-inventory.md).

## Not yet

- **Named compositions still literal**: `fire_elemental` and its sixteen siblings, `iron_golem`, `red_dragon` are records
  that name a base and its variation (no chassis of their own, but generation reaches them by their names, not by
  composition). Next: aliases to `base/variation` ids, generation drawing the base with its structural variation, the
  summons by the variation's Orsino source (the owner, 6 November, late).
- **Ranks** (Orsino's eight) are not carried: in Orsino they changed only the name (see above); Kyr's measured challenge
  and level do their work.
- **Authored adjective-kinds** in adventures (`pantry_rat` like cave_hound; the eels like great_pike; `umber_wolf`,
  `young_owlbear`): to reconcile in their adventures.
- **The dragon** keeps Kyr's 99 hit points and no maul: the fights with dragons were written for it.
