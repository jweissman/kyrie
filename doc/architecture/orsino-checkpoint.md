# Orsino content program: checkpoint

19 October 2026. This is the checkpoint the content program asked for before broad implementation: a verified corpus
inventory and compatibility matrix, the registry and adaptation architecture, a module disposition plan, an execution
sequence, and three acceptance scenarios. The full per-family matrix is generated:
[orsino-coverage.md](orsino-coverage.md).

**After this round:** steps 1 to 5 of the [execution sequence](#6-execution-sequence) are done. The registry, the
support table, the ledger and the generated report exist. The engine gained save categories, passive traits,
creature kinds with stat lines, four damage kinds and environmental exposure. The red dragon slice is recorded in
[doc/playtests/red-crag](../playtests/red-crag/README.md). The tables below describe the state *before* that work;
[orsino-coverage.md](orsino-coverage.md) is always current.

## 1. What was verified, and how

Orsino was read at `/home/jweissman/work/orsino`, revision `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3` (clean). The
inventory is not hand-counted. `bun bin/orsino-registry.ts generate` reads twelve JSON files and six TypeScript rule
files and writes [data/orsino/registry.json](../../data/orsino/registry.json). `test/orsino-registry.test.ts`
regenerates it from the pinned checkout and compares byte for byte. Extraction fails if any Orsino table is not
assigned to a registry family, so nothing in the corpus is silently left out.

Kyr claims were checked against code, not documentation. Kyr baseline before this work: 253 tests pass, 10 skip,
0 fail; `kyrie lint` reports the two Caught Below campaigns clean and every other campaign as legacy.

Documentation found stale or inconsistent:

- README says attacks "still hit automatically". Only legacy abilities do. Typed abilities roll d20 + statMod against
  an authored defense (`src/ability-use.ts`).
- `orsino-runtime-coverage.md` says Kyr attacks automatically hit. This is stale for the same reason.
- `orsino-compatibility.md` lists equipment as unsupported in one table, then as implemented in a later section.
  Equipment-sourced modifiers and granted abilities exist (`src/item-catalog.ts`).
- Kyr's `Effects.resistance` takes the strongest resistance. Orsino sums `resistAll` and the specific resistance.
  This is documented correctly in one place and omitted in others.

## 2. Corpus inventory

2,651 registry entries in 79 families. The counts are source definitions, not supported content.

| Concept | Families (entries) | Mechanical structure |
|---|---|---|
| Ancestries | `ancestry` (25): birdfolk, bugbear, catfolk, draconic, duergar, dwarf, elf, fae, giant, gnoll, gnome, goblin, half_elf, half_orc, halfling, human, insectoid, kobold, lizardfolk, ogre, orc, sylph, tiefling, troll, undine | `racialModifier`: six attribute deltas, `occupationOptions` (class whitelist), `pcRace`, `forbiddenTraits`, `evil`. Separate `traits` table offers a choice of racial traits for 19 of them. |
| Classes | `class` (7): bard, cleric, mage, monk, ranger, thief, warrior | Hit die, six attribute deltas, gold, starting gear, weapon/armour/item proficiencies by kind and weight, trait choices (mage and cleric schools and domains), class weapon and armour lists, class ability lists. |
| Backgrounds and professions | `background` (215), `nobility` (3) | Attribute deltas and gold; 57 require a class; 16 give starting gear, and 12 of those name gear absent from Orsino's own gear catalog. Orsino makes no profession/background distinction; that split is Kyr's. |
| Feats and character modifiers | `trait` (100): 20 template, 16 party, 14 racial, 12 domain, 10 feat, 9 school, 9 character, 8 elemental, 2 divine | Requirements (race, races, class, classes, level), granted abilities, spellbooks, incompatibilities, and one or more passive statuses using the status modifier vocabulary. |
| Party-wide bonuses | 16 `party` traits: academician, accordant, adventurer, deepfolk, elvenkin, fellowship, feywild, foundrywork, guild, hordeling, oligarch, perinath, synodist, tragedian, warbander, wildfolk | Multiset ancestry requirements (hordeling: three orcs); effects are statuses applied to every member, including reactive hooks (`onKill`). |
| Weapons, armour, gear, consumables | `weapon` (83, 31 natural, 11 breath, 8 missile, 10 intercept), `armor` (15, 5 natural), `gear` (68), `consumable` (28), `equipment` (48), `junk` (71), `treasureTier` (6), `gem` (5), `shop` (27) | Weapons: dice, damage type, kind, weight. Armour: descending AC bonus. Equipment: status modifiers (`ac`, `toHit`, resistances, `onAttackHit`). Consumables: effect lists with targets and charges. |
| Spells, abilities, conditions | `ability` (57 skills), `arcaneSpell` (131), `divineSpell` (154), `status` (141: 93 buff, 48 condition) | 23 effect types, 9 target kinds; saves by category with `saveForHalf`/`saveNegates`; 149 status modifier keys including 15 save modifiers, 15 immunities, 15 resistances and 25 reactive hooks. |
| Creatures | `animal` (44), `companion` (27), `aspect` (31), `creatureTemplate` (4), `monsterClass` (10), `monsterType` (40), `monsterRank` (8), `dragonColor` (10), `elemental` (17), `golemSubstance` (10), `npcRace` (17), `npcType` (89), `npcRank` (12), `combatEntity` (5) | Monster = class stat line + stat base + type modifier + aspect + rank + terrain, natural weapon and armour, traits, attacks per turn. Animal = base 3 + kind overlay + aspect. NPC = race stat line + type modifier (role, abilities, traits) + rank. |
| Saves, damage, rules | `rule.saveKind` (15), `rule.damageKind` (15), `rule.statusModifier` (149), `rule.effectType` (23), `rule.targetKind` (9), `rule.formula` (8) | Parsed from `SaveKind.ts`, `DamageKind.ts`, `Status.ts`, `Ability.ts`, `Commands.ts`, `Fighting.ts`. |
| Skills | No catalog | `SkillCheck`: search, examine, disarm, gatherInformation, each d20 + statMod + `<skill>Bonus` against a DC. Bonuses come from statuses (`searchBonus`, `pickLockBonus`, …). |
| World and generation | dungeon, rooms, traps (100), wonders (80), planes (10), deities (15 domains), terrain, settlements, riddles, languages, names, barks, 25 generation templates | Catalogued for later regional work. Not part of this checkpoint's mechanics. |

### Orsino rules that matter for fidelity

- **Saves.** `Commands.handleSave`: success if d20 ≥ DC − (statMod(attribute) + `saveVersus<Kind>` + `saveVersusAll`) −
  level. Each category has its own attribute: breath, poison, death, disease, stun, bleed and fortitude use
  Constitution; magic, will, fear, charm and sleep use Wisdom; reflex uses Dexterity; paralyze uses Strength; insanity
  uses Intelligence. An `immune<Kind>` modifier is an automatic success. **A combatant can succeed at most three times
  per category per combat**: the fourth save automatically fails (`savedTimes`, reset in the `Combat` constructor).
- **Spell saves.** An offensive spell with `saveForHalf` or `saveNegates` rolls one save versus *magic* at DC
  15 + `bonusSpellDC` before any effect resolves. A debuff rolls against its own category at (saveDC or 15) +
  `bonusSpellDC` + caster level.
- **Breath.** The `breath` save category exists, and so does `immuneBreath` (on `fire_affinity`). **No Orsino
  definition ever calls for a breath save.** Breath weapons are natural weapons (`fire_breath`: 4d6 fire, `breath:
  true`). A monster dragon's colour overlay replaces its bite with its breath weapon, and it uses it through the
  ordinary `melee` ability: one target, a THAC0 attack roll against armour class, no save, no area, no recharge, up to
  three attacks a turn. The `breath` weapon flag is read by no code. `lightning_breath` deals `electric` damage,
  which is not one of Orsino's damage kinds, so no `resistLightning` ever applies to it. Ten lightning spells have the
  same defect.
- **Accuracy.** THAC0 = 20 − ⌊level/2⌋. A hit needs d20 ≥ THAC0 − (AC − defender Dex mod) − toHit. Algebraically this
  is an ascending roll: d20 + ⌊level/2⌋ + Str (or Dex) mod + toHit ≥ 10 + armour bonus − Σ status `ac` + defender Dex
  mod. A hit can still be evaded: d20 ≥ 20 − evasion.
- **statMod.** Orsino rounds (score − 10) / 2. Kyr rounds (score − 10) / 3. This is a pinned Kyr ruleset divergence.
- **Resistance.** `resistAll` + `resist<Kind>`, applied before anything else, floored; negative values are
  vulnerability; `true` damage ignores resistance.

## 3. Compatibility today

Support levels are computed from [the adaptation ledger](../../data/orsino/adaptations.json), and feasibility from
[the per-feature support table](../../data/orsino/kyr-support.json). See the generated matrix for every family.

| Status | Orsino definitions |
|---|---|
| Play-validated | backgrounds hunter, medic, locksmith, innkeeper, herbalist; gear rope, crowbar; Longsword of Flames (typed); minor healing potion; antidote; fireproof |
| Executable, not play-validated | backgrounds explorer, miner, priest, boatman; thieves' tools, shovel; Luminous Touch; Cure Minor Wounds |
| Represented only | none |
| Kyr content that borrows a name but is **not** linked | Kyr classes fighter, magic_user, commoner and the Orsino-named `orsino_abjurer` class (Orsino's abjurer is a mage school trait); Kyr races human/elf/dwarf (no racial modifiers or traits); Kyr wolf, frost wolf, revenant, bronze construct and cave hound; Dawn spark (deliberately not called Sunmark) |
| Absent | ancestry modifiers and racial traits; Orsino class chassis, proficiencies and progression; feats; party traits; save categories; accuracy and armour class; the monster, animal and NPC composition tables; reactive hooks; planes |

1,777 of 2,651 entries are *feasible*: every rule feature they use already has a Kyr meaning. Most of those are names,
descriptions and generation tables. Among the mechanical families, all 215 backgrounds and 48 of 68 gear entries are
feasible. So are 190 of 342 abilities and spells, but most of those are only feasible because of documented
adaptations of damage, debuff and buff.

### Largest reusable gaps

Ranked by how many mechanical entries each one blocks (generated table: [orsino-coverage.md](orsino-coverage.md#largest-mechanical-gaps)).

1. **Save categories.** `save:will` blocks 60 entries, `save:fortitude` 41, `save:reflex` 15, with 12 further
   categories. For 66 abilities and statuses a category save is the *only* missing feature. Kyr has six attribute
   saves.
2. **Creature composition from source tables.** NPC types (89: abilities, role and attributes), animals (44), monster
   types (40), aspects (31), NPC races (17) and elementals (17). Kyr builds creatures from a race and a class chassis.
   It cannot read an Orsino stat line, a natural weapon or natural armour.
3. **Accuracy and armour class.** `modifier:toHit` (48), `modifier:ac` (43), `modifier:evasion` (26), armour `ac`
   (15). Kyr's typed attack compares against a constant the attacker's ability declares, not against the defender.
4. **Passive traits.** Racial, character, feat and party traits are persistent statuses that Kyr cannot attach to an
   ancestry, class or company. Ancestry attribute modifiers (25) belong here too.
5. **Status attribute modifiers and rolls:** `str`…`cha` (11–21 each), `allRolls` (25), `tempHp` (14).
6. **Reactive hooks:** `onAttackHit`, `onAttacked`, `onTurnEnd`, `onKill`, and the `attacker`/`target` targets they use.
7. **Missing damage kinds:** lightning, force, sonic and true. `electric` is a source defect.
8. **Effect forms:** `cast` (20 entries), conditional effects on traits (21), `randomEnemies`, cascade.

## 4. Registry and adaptation architecture

```
Orsino checkout ──generate──▶ data/orsino/registry.json        catalogued: every source definition, verbatim
                                    │  (family:key ids, file and table provenance, references, rule features)
data/orsino/kyr-support.json ──────┤  Kyr's judgement of each rule feature: faithful / adapted / cosmetic / unsupported
data/orsino/adaptations.json ──────┤  which Kyr definitions represent an entry, at what level, with declared gaps
                                    ▼
             OrsinoRegistry (src/registry) ──report──▶ doc/architecture/orsino-coverage.md
                                    │
     canonical Kyr catalogs (races, classes, abilities + mechanics, statuses, items, overlays, creatures)
```

- **One source of truth per question.** The registry answers *what Orsino says*. The support table answers *what Kyr's
  engine can mean*. The ledger answers *which Kyr definition stands for which Orsino entry*. Kyr catalogs keep
  only Kyr definitions. The scattered `provenance` and `orsino` strings on items and mechanics were moved into the
  ledger. The overlay `orsino` key stays because the company sheet displays it.
- **Status is computed, never asserted in prose.** A ledger record must cover every unsupported feature of its
  source with an explicit `omits` or `adapts` entry. A record that omits anything can only be *represented*.
  *Executable* requires every source feature to run, faithfully or by a declared adaptation. *Play-validated* requires
  `file#text` evidence that the test reads. Links must name existing Kyr definitions that pass their own catalog
  validation. This rule is what stops an unsupported entry silently becoming a simplified executable substitute.
- **Reproducible adaptation, not copying.** Bulk families will be adapted by typed translators from registry
  entries (for example, a status's modifier map to a Kyr status; an animal's stat line to a creature definition).
  Each translator is tested against the registry entry it reads. Hand-written Kyr definitions remain for deliberate
  adaptations, and they are checked against the source values they claim to preserve.
- **Identity stays authored.** Translators produce catalog definitions. They never write a person's fields. The
  existing authored > generated > default precedence (`Cast.person`) is unchanged.
- **Kept out of the runtime bundle.** The registry is 1.7 MB. Only tools and tests read it. Runtime catalogs hold only
  adapted definitions.

## 5. Module disposition and consolidation plan

These categories describe composition responsibilities. None of them is a new runtime entity kind.

| Category | Contents now | Disposition |
|---|---|---|
| Shared rules | `rulesets/world/{core,passages,people,needs,services,care,belongings}.kyr`, `rulesets/discovery.kyr` | Keep. Add rule modules only for new canonical vocabulary (environmental exposure in this slice). |
| Shared catalogs | `races`, `classes`, `abilities` + `orsino/mechanics`, `statuses`, `items`, `orsino/overlays`, `rules`, `creatures`, `encounters`, DEEM defaults | Keep. Add typed fields (save categories, passive traits, creature stat blocks). Retire `backgrounds.json`, `capabilities.json` and `encounters.json` once their only users (Serewater fixtures, the arena demo) are retired. |
| Regions | Embedded in each site: Reedwake's `march` region, Skellfold's region | Split the region (settlements, wilderness, routes) from adventure sites in Stage F, so several sites can share one region. |
| Sites | `sites/reedwake`, `sites/skellfold`: real rooms, passages, durations, services | Keep as the canonical pattern. New sites follow it. |
| Situations | `situations/caught-below` (canonical); `trapped-traveler` and `founding-charter` (extracted, but written in legacy relations: `trapped`, `restrainedBy`, `obstruction`) | Keep Caught Below. Rebuild `founding-charter` canonically as the first **institution** module (an obligation that ties a keeper, a charter and a shelter). `trapped-traveler` is superseded by Caught Below; keep it only as a Greenhollow fixture. |
| Encounters | The hound and boiler sentinel are inlined in Reedwake | Extract reusable encounter modules (guarded passage, lair) with role bindings; the dragon is the first. |
| Institutions and factions | Only legacy: Serewater salvagers, Orra's institutions, the Open Hand Sanctuary | Rebuild from `founding-charter` and Serewater's salvagers in Stage E under one contract: members, obligations, resources and places, read by several situations. |
| Active campaigns | `caught-below/{river,quarry}` | Keep. Add the dragon slice campaign. Later, one regional campaign (Stage F). |
| Legacy fixtures | Serewater (2), Orra (3), Frontier, Blackvein (2), Greenhollow (2), Sanctuary, Discovery orchard, client study, bundle demos | Keep replaying; no new features. Mine for reconstruction: Serewater's salvager faction and custodian, Orra's refuge, Blackvein's mine. Retire each after its best material exists canonically. |
| Obsolete experiments | `data/experiments`, `data/modules/{crossing,living-crossing,pantry}`, `bundles/pantry*` | They redefine canonical `at`/`quantity`/`watch` (lint errors). Keep only as language tests; remove from the browser bundle. |
| Clients | Mono (canonical); Folio, Wayfarer, `player-app`, Orra page, workbench | Mono only for new work. Retire the others with their campaigns. |

**Module contract** (extends the existing manifest; no new runtime kinds):

| Concern | Contract |
|---|---|
| Dependencies | `rules` list; catalogs are global. A module may not redefine a shared relation (lint error already). |
| Role bindings | `imports` with typed `roles` and fact `conditions`, as Caught Below does. |
| Provided entities | `exports`. Only exported ids may be bound by other modules. |
| Spatial installation | A site provides places and passages. A situation receives places as roles and may add rooms only *within* a bound place. |
| Mutable state ownership | The installing module owns the state of what it declares. Others change it only through shared actions and rules. |
| Lifecycle | Installed at campaign start or late; developments are latched events and pursuits over the shared clock; outcomes are observations, not campaign termination. |
| Compatibility | Manifest `version`; registry-backed catalog ids; lint must be clean for recommended modules. |

## 6. Execution sequence

Each step depends only on the steps above it.

1. **Registry (done).** Snapshot, support table, ledger, report, tests.
2. **Save categories** in the shared effect pipeline: `save.kind`, the attribute mapping, level, `saveVersus<Kind>`,
   `saveVersusAll`, immunities, and the three-success cap per encounter. Unblocks 66 entries alone.
3. **Passive traits** on ancestry and class (and later company): persistent attachments read by the same
   resistance, save and power queries.
4. **Missing damage kinds:** lightning, force, sonic, true (true ignores resistance).
5. **Creature definitions from source tables,** using one creature constructor: stat line, natural weapon and armour,
   traits, abilities, rank. → **dragon slice (done):** breath as an area category save, recharge, defences,
   environmental exposure, three recorded histories. Steps 2–4 are done as part of it.
6. **Accuracy and armour class** (THAC0 recast as an ascending roll against defender armour) → skilled opponents and
   equipment armour.
7. **Ancestry modifiers, racial traits, Orsino class chassis, proficiencies** → differentiated party creation
   (scenario A). Then feats and party traits on the company.
8. **Ordinary creatures:** the animal composition, senses (`together`, notice), territory pursuits, retreat as a
   creature action that leaves the encounter.
9. **Module contracts in lint;** extract encounter modules; rebuild the founding charter as an institution.
10. **Region module and the regional campaign** (scenario C at scale; Stage F).

## 7. Acceptance scenarios

### A. Differentiated party creation

Two companies are created from the canonical catalogs and both take the same expedition (Reedwake to Censer Hill):

- **Company 1:** dwarf warrior with the miner background, human cleric with the medic background, halfling thief with
  the locksmith background.
- **Company 2:** elf ranger with the hunter background, gnome mage with the scholar background, human bard with the
  noble nobility overlay.

Pass conditions:

- Each member's scores equal the generated base plus the Orsino racial, class and background deltas. The test reads
  the expected deltas from the registry, not from a copy.
- Hit points use the Orsino hit die. Proficiencies reject an illegal weapon at equip time.
- The company sheet lists every contribution with its source and scope (member, company).
- The offered action sets differ for reasons the receipts name. Company 1 can dig the quick way and pick the padlock.
  Company 2 can calm the hound and has a scholar's reading of the survey board. The expedition source contains no
  branch on company identity.
- Both histories replay deterministically.

### B. Mechanically faithful dragon encounter

A red dragon composed from `monsterClass:dragon`, `monsterType:Dragon`, `dragonColor:red`, `weapon:fire_breath`,
`trait:formidable` and `trait:flying` holds a roost reached by a rope bridge.

Pass conditions:

- The trace shows one `fire_breath` use bound to every company member present, one shared 4d6 fire amount, and a
  separate **breath-category** save per member. The save total is d20 + Con mod + level + `saveVersusBreath` +
  `saveVersusAll` against the declared DC, with half damage on success. A creature with `immuneBreath` succeeds
  automatically. A fourth success in one encounter fails.
- Fire resistance from the Orsino `fireproof` status halves the damage after the save. Formidable's 10% physical
  resistances apply to the company's blows.
- The breath cannot be used again until its cooldown expires. Between breaths the dragon bites.
- Fire released in the roost exposes the roost to fire. The authored rope bridge burns through the ordinary world
  rules, and the company's way back changes.
- No dragon-specific executor, fake combatant or damage path exists. The ledger records each deliberate difference
  from Orsino: area, save category, recharge, and one action per turn.

### C. One situation installed in two regions

*Caught Below* already installs at Reedwake (river) and Skellfold (quarry) from one source. The acceptance version
raises the bar to two *regions*, each built from a region module plus several sites:

- One situation source; two campaigns bind its roles to different sites in different regions.
- In each, the situation's events fire on the shared clock whether or not the company is present.
- Its people use that region's services and routes.
- A consequence in one installation (the way closed, a debt of gratitude) persists after the company leaves and is
  visible on return.
- Lint is clean for both campaigns. The situation's files are byte-identical between the two.
