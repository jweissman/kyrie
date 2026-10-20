# The fantasy domain model

19 October 2026. This document has four parts:

- an audit of what Kyr's content catalogs actually mean;
- the fantasy taxonomy that Orsino's source supports;
- the canonical model Kyr now uses;
- the migration from the old catalogs.

The model is implemented under [data/catalog](../../data/catalog) and [src/canon](../../src/canon). The registry,
support table and ledger that track Orsino coverage are described in [orsino-checkpoint.md](orsino-checkpoint.md).

## 1. Audit: what the old catalogs meant

Each claim below was checked against the files and their loaders, not inferred from file names.

| Catalog | What it claimed to be | What it actually contained | Loader and real use |
|---|---|---|---|
| `races.json` (12) | Ancestries | 4 peoples (human, elf, dwarf, goblin), 1 summoned spirit (wisp), 5 animals or creatures (wolf, frost_wolf, boar, cave_hound, red_dragon), 1 undead (revenant), 1 construct (bronze_construct). `frost_wolf` duplicates `wolf` with no relationship. Animals carry `nameGroup: "hero"` and placeholder descriptions such as "Wolf of the frontier." | DEEM `creatureRace` table and `Content.resistance`. The `stats`/`hitPoints` fields added for the dragon made a species stat line look like an ancestry property. |
| `classes.json` (13) | Adventuring classes | 6 adventuring classes; 5 creature chassis (barrow_warden, wild_beast, rime_beast, mortuary_custodian, orsino_dragon); 2 misattributed "Orsino" classes. `orsino_abjurer` has a fire ward that Orsino gives the *divine* life and ocean domains, not the arcane abjuration school. `orsino_life_cleric` has Luminous Touch, which Orsino files under the *light* domain. | DEEM `creatureClass` table. Creature chassis are classes only because generation needs a hit die and an ability list. |
| `abilities.json` (45) + `orsino/mechanics.json` (9) | Abilities | Class techniques; spells with no tradition, level or school; ancestry techniques; natural attacks (`rending_bite`); three Serewater traps (`censer_*`); Caught Below and Skellfold hazards (`heave_strain`, `ladder_fall`); a Reedwake hazard (`foundry_steam`); two dead consumable copies (`minor_healing_potion`, `antidote_dose`, used by nothing because items carry their own effect text); an unused `burning_resin`; two rest procedures (`camp_recovery`, `rough_rest`) that the campaign coordinator calls by id; two lessons (`cinder_lesson`, `serewater_training`). Two files for one concept, with the typed one overriding the English one by id. | `Content.abilities`, one global namespace. Hazards are "abilities" because `expose` looks abilities up by id. |
| `statuses.json` (10) | Conditions | Applied conditions (poisoned, stunned, bleeding…), and, since the dragon slice, two *passive traits* (`orsino_formidable`, `orsino_fire_affinity`) stored as if they were conditions. | `Effects.status`. |
| `backgrounds.json` (3) | A background system | Three Serewater puzzle keys (surveyor, pilgrim, forager), each a sentence naming a capability. No modifiers, gear or source. The real backgrounds are in `orsino/overlays.json`. | `Content.createCreature` accepts either file. Two background systems. |
| `capabilities.json` (7) | Skills | An inverted grant table (capability → classes, races, backgrounds). `fellowship` is Orsino's *party trait* (human + elf + dwarf), disguised as a capability. `climbing` and `spectralSight` grant nothing; only items provide them. Names mix snake and camel case. | `PartyCapabilities`, which merges this table with overlay skills: two skill sources. |
| `religions.json` (1) | Religions | One invented deity (Veyra) with Kyr-only domains, an observance sentence and one blessing ability. Orsino's actual theology (15 domains, 33 deities, per-domain blessings, 154 domain-keyed divine spells, 14 cleric domain specializations, shrine template) is absent. | `Items.bless`. |
| `ecology.json` (5) | Ecology | Two plants and three animals, with habitats and English "interaction" notes. Animals duplicate creature identities (`greywolf` versus race `wolf`) with no link. Plants link to a Kyr item. | Read only by tests and the legacy `ecology.kyr` ruleset. |
| `items.json` (25) | Item kinds | Orsino gear; Kyr consumables whose effect is English ability text; equipment with flat armor/power/save; site-specific kinds (`foundry_ward_focus`, `bronzeBearing`, `register`, `brasskey`); and two Longswords of Flames (one only for recorded histories). No category, weight, value semantics, damage or properties. | `ItemCatalog`. |
| `creatures.json`, `encounters.json` | Creatures | Race + class pairs for summons and the arena demo. | `Content.creature`, `Content.encounter`. |
| `orsino/overlays.json` | Backgrounds and professions | The real background system: 9 Orsino backgrounds with exact attribute deltas, gold, class requirements, plus Kyr skills, gear, offers and routines. | `Overlays`. |

### Capabilities the file names hide

- `orsino/overlays.json` is a sound typed contribution model (attributes, gold, skills, gear, offers, routine, with
  source tags). It is the right basis for backgrounds and professions, not `backgrounds.json`.
- Items already grant abilities and capabilities when equipped, through the canonical effect pipeline.
- Consumable `use` text is parsed by the same ability grammar, so items do not need ability copies.
- `devotion.kyr` (shrines, blessing once per company) and `ecology.kyr` (identify and gather) are reasonable
  interaction rules. They lack a domain model underneath, not mechanics.

### Diagnosis

1. **Categories were chosen by the generator's needs, not by meaning.** DEEM's creature template needs a race and a
   class, so every creature became one. A dragon was a "class" because it needed a hit die; a construct was a
   "race" because it needed resistances.
2. **One global namespace held world mechanisms and character abilities alike.** A Serewater counterweight, a rest
   procedure and a mage's bolt were the same kind of thing because the `expose` resolver looks abilities up by id.
3. **Duplicated systems with no authority.** There were two background files, two skill sources, two ability files,
   two longswords, and an ecology wolf beside a race wolf.
4. **Import machinery leaked into the vocabulary.** `orsino_` prefixes appeared in ids, entity names and the
   company sheet ("from Orsino 'hunter'"). Description fields told the player about "owner-combat-turn
   boundaries" and "typed-v1".
5. **Misattribution.** Two classes were labelled Orsino although they contradicted the source.
6. **Theology and ecology were placeholders shaped like catalogs.**

## 2. What Orsino actually distinguishes

Derived from `settings/fantasy` and from how `src/orsino` uses each table.

| Question | Orsino's answer (evidence) | Kyr's decision |
|---|---|---|
| Ancestry versus species | `racialModifier` (25 peoples: attribute deltas, `occupationOptions`, `pcRace`) is used by the `pc` and `npc` templates. Animals (`animalKind`, 44) and monsters (`monsterClass` × `monsterType`) are generated by other templates that use no class. Goblin, orc and dragon also appear in `npcStat` as statted peoples. | **Ancestry**: a people that takes adventuring classes. **Species**: a kind of creature statted by its own nature. Disjoint identities. |
| Variants | Dragon colours overlay a breath weapon; golem substances, elemental kinds and the undead `creatureTemplateModifiers` (skeletal, zombie, spectral, vampiric) overlay attributes and add traits. | **Variant**: a species entry with `variantOf` and declared changes, resolved by composition. Creature templates can apply to many bases. |
| Composable natures | `traits.json` type `template`: construct, undead, flying, incorporeal, celestial, fiendish, humanoid, huge, inanimate, regeneration… Attached through `monsterTraits`. Monster *class* (beast, undead, construct, dragon, fey…) is the classification. | **Creature type** (classification) plus **nature traits** (mechanics). Being undead is a type; carrying the undead immunities is a trait. A Kyr revenant can be of type undead without Orsino's undead trait, and the record says so. |
| Individual variation | `creatureAspects` (wildtype, ferocious, swift…: attribute and ability overlays). | Catalogued as aspects. Not yet modelled in Kyr. |
| Classes and specializations | `classModifier` (7). Classes offer `traitChoices`. A *school* or *domain* trait grants spellbooks restricted to that school or domain (`CharacterRecord.pickInitialSpells`). Castable spell level is ⌈level/2⌉; spell slots follow a per-class formula. | **Class** plus **specialization** (a trait of category specialization, with spell access). A specialization is not a class. |
| Backgrounds, professions, nobility | One `backgroundModifier` table (215). No profession distinction. `nobilityOverlay` is separate. | **Background** entries; Kyr adds the *profession* use (offers, routine) explicitly. Nobility stays catalogued. |
| Feats and passive modifiers | Traits of type feat (class and level requirements, granted abilities, incompatibilities), character, racial, elemental, party. | **Trait** with a category. One concept: a passive grant with requirements. |
| Active abilities | `abilities.json` skills (55), arcane spells (school, level), divine spells (domain, level). | **Ability** with a kind: technique, spell (tradition, level, school or domain), natural (a creature's own attack). |
| Items | Master weapon, armour, gear, consumable and equipment tables, plus junk and treasure. | **Item kind** with a category and typed properties. |
| Skills | No catalog. `SkillCheck`: search, examine, disarm, gatherInformation with `…Bonus` modifiers. | **Skill**: Kyr's deterministic capabilities, with their Orsino counterparts named. Who grants a skill lives on the granting concept. |
| Saves, damage, conditions | 15 save categories, 15 damage kinds, 141 statuses (buff or condition). | Rules vocabulary plus **condition** (applied, with a lifetime), kept separate from trait (permanent). |
| Theology | Domain is the hub: deities per domain (`deityName`), a blessing per domain (`deityBlessings`), divine spells per domain, a cleric specialization per domain, and a shrine template (deity, blessing, offering). Alignment derives from domain. | **Domain**, **Deity** (domain, alignment), **Shrine** behaviour from the blessing. Tradition and institution are Kyr concepts, used only where authored. |
| Ecology | Habitats are terrains (`terrainFeatures`, climates); animals have no habitat in `animalKind`. Herbs are consumables (comfrey, kingsfoil…). | **Organism** (plant or animal) with habitats and signs. An animal links to its game species; a plant links to the item it yields. **Habitat** vocabulary maps to Orsino terrains. |
| Site mechanisms | Traps (100 trap effects) and room features belong to rooms and dungeons, not to characters. | **Hazard**: declared inside a site or situation module and resolved through the shared effect pipeline. Never global. |

Distinctions *not* introduced because nothing needs them yet: a separate "lineage" catalog (a lineage is a variant
or trait of an ancestry); a separate "affiliation" catalog (institutions are situation material); and an organism
taxonomy deeper than plant or animal.

## 3. The canonical model

```
                 rules (attributes, damage, saves, resources, procedures)
                    │
     conditions ────┼──── traits ───────────── abilities (technique | spell | natural)
   (applied, timed) │  (permanent grants:          ▲          ▲
                    │   lineage, nature,           │          │ spell access
                    │   affinity, character,       │          │
                    │   feat, party,          specialization ─┘
                    │   specialization)            ▲
  ancestries ── classes ── backgrounds        domains ── deities
  (peoples)    (callings)  (and professions)     (theology hub)
       ▲                                           ▲
       │ is a person's                             │ blessing (condition)
  species ── variants              item kinds ── skills ◀── granted by background, item, class
  (creature kinds,                 (category +
   type, stat line,                 properties)
   natures, abilities)
       ▲
  organisms (plants, animals: habitats, signs; animal → species, plant → item)
```

Each concept has one catalog file in `data/catalog` and one validator in `src/canon`. References between concepts
are typed fields, and the validator rejects references of the wrong kind.

| Concept | Definition | Key properties | Lowering | Example | Counterexample |
|---|---|---|---|---|---|
| Ancestry | A people whose members take adventuring classes | attribute modifiers, class options, lineage trait choices, naming group, playable | creature `kind`; modifiers added to generated scores | human, elf, dwarf, goblin | wolf, dragon |
| Species | A kind of creature statted by its own nature | type, statistics (rolled or fixed), natural abilities, resistances, nature traits, temperament, habitats | creature `kind`; species abilities and statistics replace a class | wolf, cave_hound, dragon | human |
| Variant | A species defined by changes to a base species | `variantOf` plus overriding fields; resolved recursively | same as species | frost_wolf (of wolf), red_dragon (of dragon) | an unrelated copy |
| Class | An adventuring calling | hit die, mana, primary attribute, abilities, specialization choices, Orsino correspondence | creature `calling` | fighter, cleric, magic_user | dragon, wild_beast |
| Trait | A permanent grant | category, modifiers, granted abilities, requirements, incompatibilities, spell access | passive modifiers read by `Effects`; granted abilities | formidable, fire_affinity, vitalist, abjurer | stunned (a condition) |
| Condition | An applied state with a lifetime | modifiers, periodic damage, incapacity, stacking | `Effects` conditions | poisoned, fireproof | formidable |
| Ability | Something a creature can choose to do | kind (technique, spell, natural), cost, recharge, effects; spell: tradition, level, school or domain | combat and field commands | resist_fire, bite, cleave | a counterweight, a rest |
| Hazard | A mechanism of a place | effects written in the same effect language; local to its module | `expose` / `Hurts with` | Skellfold's rotten ladder | a mage's bolt |
| Background | An origin or trade | attribute modifiers, gold, class requirement, skills, gear, offers, routine; use: background or profession | creature overlay | hunter, innkeeper | woodcraft |
| Skill | A deterministic capability | name, meaning, Orsino counterpart | `capable(company, skill)` | lockwork, woodcraft | fellowship (a party trait) |
| Item kind | A kind of portable object | category, slot, value, weight, use effect, equipped grants, modifiers, tool skill | item instances | rope, longsword_of_flames, fireproof_salve | the counterweight |
| Domain / deity | A sphere of divine power; a god of it | domain blessing, alignment; deity name, gender, domain | shrine blessing | life (Brigid, Dagda…), Veyra (Kyr, travel) | a single named blessing |
| Organism | A living thing found in places | kind (plant or animal), habitats, signs, species or yield | ecology facts | yarrow → yarrow poultice, wolf → wolf | a creature stat line |

### Identity, provenance and presentation

- **Canonical ids are ordinary fantasy words,** unique within their family: `fireproof`, `resist_fire`, `abjurer`,
  `wolf`, `longsword_of_flames`.
- **Entity-bearing families share one namespace,** because their ids become Kyr entities: abilities, item kinds,
  skills, deities and organisms. The validator rejects a collision across them.
- **Source identity lives in `source`,** inspectable but never shown in fiction, and keyed to the registry:
  `{"orsino": "divineSpell:resist_fire", "fidelity": "adapted", "notes": "..."}`.
- **Old ids are kept as aliases** in `data/catalog/aliases.json` (`orsino_fireproof` → `fireproof`). Modules, saves
  and transcripts are resolved through them, and an alias may never shadow a canonical id.
- **Player-facing text** (`name`, `description`) describes the fiction. Implementation notes belong in `source.notes`.

### Local material

A site or situation declares its mechanisms with `Hazard id "name" means "<effect>".` They are compiled into that
installation only, named like any other module entity, and resolved by the same `AbilityUse` path. The global
ability catalog contains only things a creature can learn or be born with.

## 4. Migration map

| Old location | Canonical concept | Action | Risk |
|---|---|---|---|
| `races.json` human, elf, dwarf, goblin | `canon/ancestries.json` | split | none; ids kept |
| `races.json` wolf, frost_wolf, boar, cave_hound, revenant, bronze_construct, wisp, red_dragon | `canon/species.json` | split; frost_wolf becomes a variant of wolf; `red_dragon` a variant of `dragon` | histories keep the same rolled statistics |
| `classes.json` fighter, cleric, magic_user, thief, commoner, ranger | `canon/classes.json` | retained, with Orsino correspondence and support stated | chassis still Kyr, see gaps |
| `classes.json` wild_beast, rime_beast, barrow_warden, mortuary_custodian, orsino_dragon | species statistics and natural abilities | moved into species | the lowering keeps generated values |
| `classes.json` orsino_abjurer, orsino_life_cleric | `legacy/classes.json` | retired from canon (misattributed); canon has cleric + vitalist + `resist_fire` | legacy tests use the quarantine |
| `abilities.json` + `orsino/mechanics.json` | `canon/abilities.json` | merged; kinds added | old ids aliased |
| `foundry_steam`, `heave_strain`, `ladder_fall` | `Hazard` in Reedwake, Caught Below, Skellfold | moved to their modules | — |
| `censer_*`, `cinder*`, `serewater_training`, `brace_line`, `dawn_spark` | `legacy/abilities.json` | quarantined with the legacy campaigns that use them | recorded saves name them |
| `minor_healing_potion`, `antidote_dose`, `burning_resin` | — | retired (unused) | — |
| `camp_recovery`, `rough_rest` | `catalog/vocabulary.json` procedures | moved | coordinator lookup |
| `statuses.json` | `canon/conditions.json` and `canon/traits.json` | split | — |
| `backgrounds.json` (surveyor, pilgrim, forager) | `legacy/backgrounds.json` | quarantined (Serewater histories) | — |
| `capabilities.json` | `canon/skills.json` + grants on classes, items and backgrounds | replaced; `fellowship` becomes a party trait in the legacy rule set | Orra and Serewater use it |
| `orsino/overlays.json` | `canon/backgrounds.json` | moved; source keyed to the registry | UI shows the background name only |
| `religions.json` | `canon/religion.json` (domains, deities) | replaced; Veyra kept as a Kyr deity of explicit Kyr domains | — |
| `ecology.json` | `canon/organisms.json` + `canon/habitats.json` | replaced; animals link to species, plants to items | — |
| `items.json` | `canon/items.json` | migrated to categories and properties; site-only kinds flagged | — |
| `rules.json` | `catalog/vocabulary.json` | moved | — |
| `creatures.json`, `encounters.json` | arena fixture | moved under `legacy/` | — |

Section 5 of the [report](domain-model-report.md) records what was actually done, and what was not.
