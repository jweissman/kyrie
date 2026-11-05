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

## Not yet

- Deem's creature grammar (`creatureFamilies`, `creatureKinds`, `creatureBody`, `creatureAncestry`, `creatureClass`,
  `constructMaterial`, `creatureRole`, `environmentAdaptation`, `creatureFamilyPool`; `dragons.json`) is reached
  only when a creature is asked for by its dimensions (`Creature family …`, the Deem CLI, the handbook's "Generated
  creatures"); no content asks. To retire with that handbook section, its lineages and maturities made variations.
- One habitat vocabulary (step 4): species `habitats` still in the organisms' words, dens and variation hints in the
  ecology's.
- Authored kinds that are adjectives of another (`pantry_rat` like cave_hound; five giant eels like great_pike, now
  that `eel` exists; `umber_wolf`, `young_owlbear`): to reconcile in their adventures, fight by fight.
- `organisms.json`'s three animals (red_deer, otter, grey_wolf) are still read only by validation: Orsino's `deer` and
  `otter` and the hand `wolf` are their creatures.
