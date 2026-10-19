# Domain model reconstruction: report

19 October 2026. This companion to [domain-model.md](domain-model.md) records what was done, what it achieved and
what remains. The figures come from `bun bin/orsino-registry.ts report` ([orsino-coverage.md](orsino-coverage.md))
and from the tests named below. Passing tests are evidence that the claims below hold, not evidence that the model
is right.

## 1. What the existing data model got wrong

The full audit is in [domain-model.md §1](domain-model.md#1-audit-what-the-old-catalogs-meant). In short:

- **Categories followed the generator, not meaning.** DEEM needs a race and a class, so a dragon was a *class*
  (`orsino_dragon`) and a construct a *race*. Five creature chassis sat among the adventuring classes. Animals,
  constructs and peoples shared `races.json`, and `frost_wolf` was a copy of `wolf` with no stated relationship.
- **Places' machinery was global.** A Serewater counterweight, a Reedwake steam pipe, a Skellfold rotten ladder, two
  rest procedures and three dead consumable copies were "abilities" beside a mage's bolt. Every creature in every
  world was offered `canTrain(…, ladder_fall)`; the Serewater golden histories recorded those facts.
- **Two sources of truth for most concepts.** Two ability files (the typed one silently overriding the other), two
  background files, two skill systems merged at run time, an ecology wolf beside a race wolf, and Orsino provenance
  scattered across three catalogs as well as the ledger.
- **Misattribution.** `orsino_abjurer` cast a fire ward that Orsino gives to the *life and ocean domains*
  (`resist_fire`, `protection_from_fire`), not to the abjuration school. `orsino_life_cleric` cast Luminous Touch,
  which is a *light-domain* spell.
- **Import machinery in the fiction.** The company sheet printed "from Orsino 'hunter'". Descriptions told the player
  about "owner-combat-turn boundaries".
- **Placeholders shaped like catalogs.** Religion was one invented deity; Orsino's theology (15 domains, 33 deities,
  domain blessings, domain spells, cleric domain specializations) was absent. Ecology was five records with English
  "interaction" notes.

## 2. Canonical concepts and why

There are thirteen catalogs in [data/canon](../../data/canon), one per concept, each validated by
[CanonValidation](../../src/canon/canon-validation.ts) when content loads:

| Concept | Why it is separate |
|---|---|
| `ancestries` | A people takes adventuring classes (Orsino `racialModifier`, `occupationOptions`); it may offer lineage traits. |
| `species` | A creature statted by its own nature (Orsino animal and monster templates take no class). Has a creature *type*, nature traits, natural abilities, temperament and habitats. **Variants** (`variantOf`) override only what differs. |
| `classes` | Adventuring callings, with skills granted and **specializations** offered. `commoner` is marked non-adventuring, open to every people. |
| `traits` | Permanent grants in one shape, with a category: lineage, nature, affinity, character, feat, party, specialization. This is Orsino's own unification. A specialization carries spell access by tradition and school or domain. |
| `conditions` | Applied states with a lifetime. They are no longer mixed with passive traits. |
| `abilities` | Things a creature chooses to do: technique, spell (tradition, level, school or domain) or natural attack. Nothing else. |
| `backgrounds` | Origins (`use: background`) and trades (`use: profession`), with typed contributions. |
| `skills` | Deterministic capabilities. Grants live on the granter (background, class, item), never on the skill. |
| `items` | Item kinds with a category, use, granted ability or skill, modifiers, and a weapon's damage and rider. The validator checks that the damage and rider match what the granted strike deals. |
| `religion` | Domains (alignment, blessing, the spell-domain name), and deities belonging to one or more domains. Orsino lists twelve deities under several. |
| `organisms` | Plants and animals with habitats and signs. An animal links to the species that plays it; a plant links to what it yields. Habitats map to Orsino terrains. |
| `rules` | Attributes, damage kinds, save categories, and the two rest procedures the world rules call. |
| `aliases` | Former identifiers, resolved for old modules, saves and transcripts; validated never to shadow a canonical id. |

**Language changes.** Persons now take `Species wolf.` (no ancestry, no calling), `Trait vitalist.` and `Carries
longsword_of_flames.`. Modules declare `Hazard id "name" means "<effect>".`, a mechanism of that module only,
resolved by the same `AbilityUse` pipeline. No second executor exists: [CanonRuntime](../../src/canon/canon-runtime.ts)
lowers canonical entries into the shapes `Content`, `Effects`, `ItemCatalog` and `Overlays` already used.

**Quarantine.** [data/legacy](../../data/legacy) holds material that only legacy campaigns and recorded histories
use. Lint reports any use of it, and recommended campaigns have none.

## 3. Replaced and retired

**Deleted:** `abilities.json`, `orsino/mechanics.json`, `races.json`, `classes.json`, `statuses.json`, `items.json`,
`rules.json`, `backgrounds.json`, `capabilities.json`, `religions.json`, `ecology.json`, `creatures.json`,
`encounters.json`, `orsino/overlays.json`. No code imports a catalog file except `src/canon/canon.ts`.

Entries:

- **Split.** `races.json` became 4 ancestries and 8 species. `frost_wolf` is a variant of `wolf`, and `red_dragon`
  a variant of the Orsino-composed `dragon`. `statuses.json` became 8 conditions and 2 traits.
- **Merged.** Two ability files became one, with a kind on every entry.
- **Moved into species.** Five creature chassis (`wild_beast`, `rime_beast`, `barrow_warden`, `mortuary_custodian`,
  `orsino_dragon`).
- **Moved into their modules as Hazards.** `foundry_steam` (Reedwake), `heave_strain` (Caught Below),
  `ladder_fall` (Skellfold).
- **Moved to rules.** `camp_recovery`, `rough_rest`.
- **Retired as unused.** `minor_healing_potion`, `antidote_dose`, `burning_resin`.
- **Quarantined.**
  - Classes `orsino_abjurer` and `orsino_life_cleric` (misattributed; the canonical path is cleric + `vitalist` +
    `resist_fire`).
  - Serewater's puzzle backgrounds and skill grants; its `censer_*` traps, lessons and items.
  - The automatic-hit Longsword of Flames, renamed `longsword_of_flames_autohit`; the canonical
    `longsword_of_flames` is the attack-roll weapon.
- **Renamed, with aliases.** `orsino_fireproof` (ability) → `resist_fire`; `orsino_fireproof` (condition) →
  `fireproof`; `orsino_formidable` → `formidable`; `orsino_fire_breath` → `fire_breath`; `orsino_dragon_bite` →
  `bite`; `orsino_cure_minor` → `cure_minor`; `orsino_luminous_touch` → `luminous_touch`; `longsword_of_flames_typed`
  → `longsword_of_flames`; `foundry_ward_focus` → `warding_focus`; `fireproofsalve` → `fireproof_salve`; and others.

**Migrated modules.**

- Reedwake: `Species cave_hound`, `Species bronze_construct`, a local steam Hazard, canonical items.
- Caught Below and Skellfold: local Hazards.
- Red Crag: `Species red_dragon`.
- Legacy devotion rules: the canonical spell name.
- No canonical module mentions `orsino_`.

**Fixture updates, each for a stated reason.**

- The Serewater golden comparison now ignores catalog projections for abilities retired since recording. The retired
  ones are the site hazards and dead entries above, so every gameplay fact is still compared.
- One command-contract assertion compares the save's structure rather than its die. The hazard's identifier, and so
  its seed, became module-scoped.
- Tests that used the misattributed abjurer use the canonical vitalist cleric.
- Red Crag's recorded histories were re-recorded. They reach the same outcomes.

## 4. Orsino coverage

Of 2,651 catalogued source entries, 103 are represented or better, 64 executable or better and 18 play-validated.
These counts are about Orsino entries, not Kyr definitions. They include rule vocabulary (save categories and damage
kinds), which inflates them:

| | Represented or better | Executable or better | Play-validated |
|---|---:|---:|---:|
| Content (backgrounds, gear, items, spells, traits, creatures, domains…) | 74 | 35 | 15 |
| Rule vocabulary (save categories, damage kinds) | 29 | 29 | 3 |

New this round:

- **Represented:** 4 ancestries, 5 classes, 15 domains (with their 33 deities), the dragon, construct, undead and
  Golem monster entries, and 10 traits with declared gaps.
- **Executable:** `resist_fire`, the `vitalist` and `lightbringer` specializations, the `construct`, `undead`,
  `sturdy` and `fire_affinity` traits, `smash`, `slam`, the iron golem substance and the Golem type.

**Correction.** The 15 domains were briefly reported executable because the extractor did not analyse
`deityBlessings`. It now does, and they are represented: no shrine can yet grant an Orsino domain blessing.

## 5. Gaps that remain

**Mechanical.**

- Accuracy and armour class (toHit, ac, evasion, natural armour).
- Ancestry attribute modifiers: catalogued, *not applied*, because applying them would change every recorded party.
- Orsino class chassis: hit dice, attribute modifiers, proficiencies, spell slots, bard and monk.
- Party traits on a company.
- Reactive hooks (onAttackHit, onKill…).
- Attribute-modifying conditions.
- Multiple attacks per turn.
- Creature temperament: recorded but not yet behaviour.
- Organisms have no canonical placement construct. Only the legacy `ecology.kyr` places them in rooms.

**Semantic and design problems still open.**

1. **Kyr classes are not Orsino classes.** `fighter` stands in for Orsino's warrior with a different hit die and no
   proficiencies. The ledger says "represented"; the vocabulary still implies equivalence. The honest fix is to adopt
   Orsino's chassis and re-record histories. That is a decision, not a cleanup.
2. **The runtime still says race and class.** A species creature lowers to `raceId = classId = species id`. Authors
   never see this, but saves, the combat projection and the UI do.
3. **Kyr-native spells have invented levels.** `heal`, `bolt` and `sleep` have a tradition and a level, but the level
   is Kyr's guess, and they have no school or domain. They cannot be reached through a specialization.
4. **The abjurer specialization grants nothing.** No abjuration spell is executable yet. Its record is "executable"
   because the access rule works; in play it is empty.
5. **Specialization grants differ from Orsino.** Kyr grants every executable spell of the domain up to ⌈level/2⌉.
   Orsino has the player pick (all cantrips, then 3/2/1 spells of levels 1–3).
6. **Provenance lives in two places.** Canon entries cite their Orsino source; the ledger records support level,
   gaps and evidence. A test enforces that they agree, but the link is still written twice.
7. **The quarantine is lint-enforced, not compile-enforced.** Legacy abilities are still in the global runtime list,
   so a new module *can* reference one. Lint reports it; the compiler does not stop it.
8. **Combat ties depend on catalog order.** NPCs break equal scores in catalog order, so
   `data/legacy/ability-order.json` freezes the historical order. Tactics should break ties explicitly instead.
9. **Implementation metadata in canon.** `damagePolicy: typed-v1` remains on typed abilities, and hazards are always
   typed-v1.
10. **Legacy campaigns now show their category errors.** A goblin cleric, a dwarf ranger, wisps given a class, and
    species on legacy chassis. They are reported, not fixed.
11. **Browser evidence not re-recorded.** The opt-in browser recordings under `doc/playtests/command-contract` and
    `integration-reorientation` still name old identifiers. They are historical evidence, not tests, but they no
    longer match current ids.

## 6. Did ordinary authoring become simpler?

Mostly yes. The guide's example ([guide.md](../authoring/guide.md)) now includes all of the following, and
`test/authoring-guide.test.ts` checks that it lints clean and that each person gets the mechanics named:
- a level-3 human fighter with the knight feat, the locksmith background and the Longsword of Flames;
- a dwarf cleric with the life-domain specialization;
- a grey wolf;
- a local hazard.

| Task | Before | After |
|---|---|---|
| A cave hound | `Ancestry cave_hound. Calling wild_beast.` (a "race" plus a "class") | `Species cave_hound.` |
| A red dragon | `Ancestry red_dragon. Calling orsino_dragon.` | `Species red_dragon.` (a variant of `dragon`) |
| A life cleric | impossible without the invented class `orsino_life_cleric` | `Calling cleric. Trait vitalist. Level 3.` |
| A person with a sword | impossible (only shops and floors held items) | `Carries longsword_of_flames.` |
| A steam pipe | add `foundry_steam` to the global ability catalog, then reference it | `Hazard foundry_steam "…" means "…".` in the site |
| Fire resistance | `orsino_fireproof`, which named a status, an ability and a class's spell | `resist_fire` (spell) applies `fireproof` (condition); `fire_affinity` is a trait |

It is still harder than it should be in places:
- Placing plants and animals in a site needs the legacy ecology rules.
- Choosing a lineage trait has no creation UI.
- Writing an Orsino spell that Kyr does not yet execute still means adding an ability entry by hand.

## 7. Fewer competing sources of truth?

Yes for active content. Each concept now has one catalog, the only loader is `Canon`, and the old files are gone.
What remains:

- The quarantined legacy catalogs (7 files), used only by legacy campaigns and recorded histories.
- Provenance written in both canon and ledger (kept consistent by test).
- The frozen ability order.

Each has a stated retirement condition: retire the legacy campaigns, derive ledger links from canon, and make tactics
order-independent.
