# Orsino as a generative fantasy substrate

Status: source audit and proposed compatibility targets; no corpus import or runtime extension in this investigation. Inspected 18 October 2026. The [existing compatibility matrix](../orsino-compatibility.md) remains the record of implemented Kyr examples.

## Revisions actually checked

The intended neighboring working checkout is `/home/jweissman/work/orsino`, clean on `main`, revision **`4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`**. A fresh `git ls-remote` against `https://github.com/jweissman/orsino.git` confirms that both upstream HEAD and main still point there. All available heads were checked: the newest by commit timestamp is review branch `claude/code-review-feedback-xmObx`, **`7b76ce37d4081620b536bfecdd48e8cb7a58d97d`** (23 February 2026, 13:17:06 UTC). Its diff from main is exactly one added, 4,036-line `package-lock.json`. There are no changed rules, templates, or definitions relative to either previous audit. The isolated bare audit checkout fetched missing objects; the user's Orsino checkout was not altered. No later revision is being presumed from the website.

Source links below pin main rather than an unstable branch. Counts were computed by parsing the actual JSON files; they count entries/groups, not independently verified working mechanics.

## Categorized inventory

| Category | Actual source inventory | Kyr status and reuse boundary |
|---|---|---|
| Construction | 25 [templates](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/settings/fantasy/templates.json): loot, gemstone, deity, hamlet, tavern, shop, townHall, town, equipment, line, pc, animal, dragon, monster, npc, combatEntity, encounter, shrine, riddle, trap, wonder, room, boss_room, dungeon, module | Compositional patterns are reusable. These are not 25 Kyr-compatible constructors. Current Kyr correctly has one canonical creature path. |
| Character content | 7 class records, 25 ancestry records, 215 background records in [core tables](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/settings/fantasy/tables.json); 100 traits including 16 party, 14 racial, 10 feat, 20 template, 12 domain | Kyr party creation and class capability grants are adaptations. Background perks, proficiency, feat prerequisites/incompatibilities, multiset party formations and advancement are not ported by selecting a familiar class name. |
| Active magic/combat | 57 core abilities, 131 arcane, 154 divine; 141 statuses | Some related Kyr effect families exist. Individual spell parity remains unproven; category saves, triggers, reflection/cascade, slot rules and modifiers prevent a wholesale import. |
| Wildlife | 44 animal kinds; 27 companion-association groups; 31 aspects and associated ability lists | Bodies, weapons and aspect overlays preserve distinctions. Kyr's wildlife access/pacification rules are adaptations, not Natural Bond companion summoning. |
| Monsters | 10 monster families, 40 named type classifications/modifiers/ability groups; 8 ranks; 4 creature-template modifier groups | Useful compositional type × rank × terrain × aspect structure. Current bespoke Kyr representatives are not faithful imports of these schemas. |
| Possessions | [Item tables](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/settings/fantasy/tables/items.json): 15 armor, 83 weapon, 68 gear, 28 consumable, 48 equipment, 71 junk groups; 6 treasure ranks/value groups; 5 gem rarity groups; 27 shop types | Inventory instances, equipment slots, proficiency, AC and item-sourced modifiers need real semantics before import. Current Kyr gold/rations and consumed learning seal are a narrow working subset. |
| Religion | deity name and blessing tables each have 15 domain groups; 33 current deity gender entries (older `_deityName`/`_deityGender` tables also remain); generated shrine composes a generated deity and its blessing | Generate shared deity instances once and reference their IDs. Orsino shrine's ten-turn buff, healing/damage and offering are candidate effects, not implemented Kyr religious institutions. |
| Marvels/hazards | 60 ordinary +20 legendary wonder type/description/effect entries; 100 trap punishment/description/effect groups; 4 trap DC groups; riddles with rewards | Strong stress corpus. Not all entries imply distinct mechanics; many wonders share stat upgrades. Kyr currently has no generic skill/disarm/room-trigger/equipment integration. |
| Cosmology | 10 planar modifier/description groups | Orsino attaches planar passive effects at module entry. Kyr has no equivalent source-scoped modifier aggregation or spell-slot/duration multipliers. |
| Geography/sites | 10 terrain groups; 11 terrain-feature/modifier groups; 10 terrain-element/climate groups; 9 climate-weather groups; 5 dungeon purposes; 35 room narratives, 9 special rooms, 9 room overlays, 4 room sequences | Contextual construction material, not a functioning generated regional economy, ecology or branching dungeon topology. |

The 44 animal kinds are badger, bat, bear, beetle, boar, butterfly, centipede, crocodile, crow, deer, dragonfly, eagle, falcon, ferret, fox, frog, goat, hawk, hedgehog, hound, hummingbird, hyena, lion, lizard, mole, moth, otter, owl, panther, pony, pseudodragon, rabbit, ram, rat, raven, snake, spider, squirrel, stag, stoat, tiger, turtle, wolf and wyrm. These mix ordinary taxonomic levels, domesticated forms, sexes/life roles and fantasy creatures. They should remain authorable creature kinds, not be mistaken for a biological taxonomy. Fish and many wetland organisms are conspicuously absent; beaver is absent despite its obvious frontier-water relevance.

## What the original generation actually does

[Template.ts](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/src/orsino/Template.ts) is an ordered constructor, not declarative unification or JavaScript object spread:

- Properties are resolved in source order against inherited options plus already assembled fields. An inherited value suppresses the ordinary property's generation. `>name` forces evaluation despite an inherited `name`; use this deliberately to avoid assigning a region's name to every inhabitant.
- `_` fields participate in evaluation and nested context, then are omitted from that constructed object's public output. `defined('key')` checks current context presence, not truthiness. `#key` reads DEEM evaluation context. `=` starts an expression; ordinary strings are literal.
- `gen(type)` inherits current context; `genIsolated(type)` deliberately does not. `genList` inherits context and `_index`. `mapGenList` binds per-item contextual fields; with multiple lists it uses the shortest length, so mismatched role/budget lists can silently truncate.
- Both `*overlay` and `^overlay` add numbers, concatenate arrays, replace strings, OR booleans, and shallow-merge objects with already assembled object fields winning. `^` additionally evaluates expression-valued strings. Neither means arbitrary recursive merge or unconditional replacement. A later zero/false cannot reliably cancel an earlier positive/true through additive/OR overlay semantics.
- Table groups may hold scalar/object values or selectable lists. Repeated alternatives can weight a selection; dice-keyed groups can weight via their key distribution. These are established idioms, not a proposed new probability engine.
- `lookup(..., condition)` filters candidate values in context, but original [Generator.ts](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/src/orsino/Generator.ts) warns and returns the first option when no candidate satisfies the filter. This is unsafe as a hard ecological/proficiency constraint. Validate actual generated output; do not silently import that fallback policy.

The neighboring DEEM tests `test/template.extra.test.ts` explicitly exercise contextual helpers, overlays and removal; generator/trace tests cover isolated runtime plumbing. This audit reads those tests alongside implementation rather than treating expression text as JavaScript.

Kyr uses the separate neighboring `deem` package (`package.json` points to `file:../deem`), whose current Template/Generator retain these core composition conventions but have explicit runtime/trace plumbing. Orsino's embedded DEEM is historical source, not the same dependency. Preserve Kyr's tested seed/runtime path. Orsino still calls `Math.random` directly for generated IDs, table helpers and several command decisions; the `seed` option alone is not evidence of complete deterministic generation/replay.

Actual reusable composition examples:

1. `town`: overlays `hamlet`, nests one deity/tavern/townHall, builds shops from independently chosen shop types. `shop` overlays stock/description from its kind.
2. `pc`: composes background, ancestry and class overlays plus equipment and hometown. It does not justify a new specialized goblin or fighter construction algorithm. Several defaults are narrower than their tables (e.g. its public race defaults to human/elf/dwarf despite a larger ancestry table).
3. `monster`: type classification, level/stat base, rank, terrain, aspect, optional elemental/substance/dragon layers and distinct abilities. Copying only its HP would destroy the point.
4. `module`: plane overlay, town, five dungeons. A dungeon picks a room sequence and adds a boss room. This is useful content composition but primarily an ordered room crawl, not a branching, persistent connected region.

## Shared effects: useful precedent and incompatible assumptions

Orsino already avoids one interpreter per site category. [Dungeoneer.ts](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/src/orsino/Dungeoneer.ts) routes trap effects (around lines 749–767), shrine/wonder effects (around 869) and consumables through `AbilityHandler.handleEffect` with command handlers. It creates a trap pseudo-combatant and a pseudo-combat context. Reuse the *semantic intent*, not compulsory fake fighters for every inanimate source. A typed source reference plus actor/recipient context is a better Kyr boundary.

[Ability.ts](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/src/orsino/Ability.ts) includes attacks, cast, direct damage/healing, buffs/debuffs, drain, summon, upgrade, gold/XP, resurrection, kill, random/cycled effects, learn, grantPassive, teleport/planeshift, HP recalculation and item acquisition. These are not all small variations on damage. Teleport changes authoritative location, acquisition changes owned object state, and passives need provenance/stacking; a generic `apply(any)` escape hatch would obscure these differences.

[ModuleRunner.ts](https://github.com/jweissman/orsino/blob/4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3/src/orsino/ModuleRunner.ts#L239) removes old planar passives and attaches the new plane's `globalEffects`. Arcadia grants spell DC +1, duration ×1.2 and an extra slot; Hades grants DC −1 and duration ×0.8. That does not establish full cosmological simulation or planar travel topology.

Rules that must remain explicit compatibility decisions:

- Orsino `statMod` is `Math.round((score-10)/2)`; Kyr deliberately retains its pinned `/3`. Score 18 is +4 versus +3.
- Orsino category saves include poison/death/reflex/etc.; Kyr uses six attribute saves. Do not label a Wisdom save “poison” and claim parity.
- Orsino weapon/armor proficiency and AC/hit resolution differ from Kyr's automatic hits and flat reduction. Signed fractional resistance before flat reduction is the supported shared arithmetic subset.
- Orsino Fellowship grants investigation bonuses; Kyr institutional access is a named adaptation. Ranger wildlife approach is not the original extra animal summon.
- Shrine buff duration is combat-style turns, not automatically ten exploration ticks. Kyr world-time durations and combat owner turns need separate explicit clocks.
- Rest/stabilization, checkpoint restoration and death differ across Orsino modes; current Kyr safe six-hour recovery never revives. No silent change to existing saves/creatures is warranted.

Some fictional claims exceed the stored mechanics even in the source corpus: `whispering_tree` describes whispered secrets but its actual effect is a permanent +1 Wisdom upgrade, not information transfer; a deity alignment does not produce an institution, doctrine or obligation; and the generated `dungeon.goal`/`bad_outcome` strings are not executable deadlines. Porting prose alone must not manufacture those capabilities.

## Botany and zoology review: useful generation, bounded simulation

Orsino provides evocative terrain tokens and animal overlays, **not** a reusable botanical taxonomy, habitat occupancy model, food web or coherent geographic species ranges. `terrainFeatures` includes willow/elm/fern/moss and `riddleAnswerGroups.plant` includes names; these are naming/riddle content, not plants with harvestable resources. `animal.terrain` and `animal_type` can be selected independently, while companion associations are ancestry-grouped. Treat those associations as cultural possibilities, not biological restrictions or deterministic ancestry stereotypes.

For a cool temperate frontier, start with functional guilds and habitat constraints. The following is a **proposed content plan**, not implemented ecology or real-world foraging guidance:

| Habitat | Botanical guilds / examples | Animal guilds / Orsino candidates | Play-relevant state, if implemented |
|---|---|---|---|
| Dry wooded ridge | Pine/oak canopy, berry shrub, fern understorey | Deer/boar browse, fox/wolf predators, owl, beetles | Concealment, timber/resin, tracks, seasonal food caches; finite authored harvest stocks |
| Stream and wet meadow | Alder/willow edge, sedges/reeds, damp-ground fungi | Frog, otter, dragonfly, crow; add beaver as new content | Wet crossing alternatives, reed cordage, lodge-created obstacle; authored dam rather than simulated hydrology |
| Cultivated valley | Grain plots, orchard, hedgerow shrubs and herbs | Goat/pony/hound, rat, moth | Fodder and supplies, owned harvests, barn access; no claim of agricultural production cycles |
| Limestone entrance/ruin | Moss/fern at lit entrance; fungi on organic debris | Bats, spiders, centipedes, rats; supernatural residents separately contextualized | Light/noise-sensitive encounters, roost disturbance, guano traces, darkness; do not generate lush photosynthetic gardens in unlit rooms |
| Cold exposed upland | Low shrubs, grasses, sparse conifers by shelter | Ram, raven, eagle; wolves on suitable ranges | Exposure, fuel scarcity and shelter, only when actual hazard rules exist |

Real references support broad associations, not a simulation mandate: USDA's [eastern white pine silvics](https://research.fs.usda.gov/silvics/eastern-white-pine) and [gray alder review](https://research.fs.usda.gov/feis/species-reviews/alninc) distinguish forest types and wetland edges. They also prevent indiscriminate mixing of plants from different regions. NPS describes [bat roosts and seasonal use](https://www.nps.gov/subjects/bats/where-bats-live.htm) and [beavers creating wetlands](https://www.nps.gov/articles/north-american-beaver-acadia.htm). Fantasy analogues should declare a coherent regional palette; they need not reproduce North American geography.

Suggested plant records: kind, growthForm, habitatTags, moisture/light/temperature bands, season, resourceRefs, visibility cues and interaction capabilities. Animal records: kind, habitatTags, diet guild, activity period, social group, disposition constraints, signs, loot/resource refs and creature-generation context. These fields constrain construction; only capabilities backed by rules affect play. A poisonous-looking mushroom is not mechanically poisonous until its use effects are defined. Herb names must not promise healing outside actual healing effects.

Generate site occupancy once, not a new population on each entry. Avoid unrestricted population reproduction, energy budgets, disease ecology and trophic simulation. The near-term purpose is coherent encounters, meaningful resources and readable clues.

## Smallest representative stress corpus

Do not import all tables before proving these seven definitions can share semantics:

| Representative | What the implementation must prove | Port policy |
|---|---|---|
| `masterWeapon` ordinary weapon + leather armor | Owned item identity, equip/proficiency, derived modifiers, attack amount source, meaningful reward | Choose faithful hit/AC rules or explicitly name a Kyr adaptation before content conversion |
| `consumables.minor_healing_potion` (2d4+2) | Same heal effect in combat/field; one committed item charge; no use after death/invalid target | Translate definition after explicit cost/consumption policy |
| `trapEffects.poisoned_spikes` | Ordered piercing + poison effects, source identity, trigger-once state, detection/disarm and recipient selection | Preserve damage distinctions; do not invent an Orsino save the source lacks |
| Divine `sunmark` / `sunmarked` | 1d3 damage plus status; magic-save penalty, fire/radiant vulnerability and on-attacked reaction | Genuine attachment/reaction stress; defer if causal ordering is undefined |
| `deityBlessings.knowledge` shrine | +Int/+Wis/examine modifiers from source-scoped temporary attachment, offering/resource commitment | Use real deity ID shared with institution; explicit turn/world duration adaptation |
| `wonderEffects.whispering_tree` | Permanent Wisdom upgrade with source consumption and save/reload, distinct from temporary buff | Original +1 Wisdom; no arbitrary learned-rumor substitute |
| `planeModifiers.Arcadia` | Derived DC/duration modifier aggregation and clean detach on departure | Slots unsupported until a slot model exists; do not silently ignore the third property |

Add an Orsino animal kind with natural weapon/body and a rank/aspect monster only after the weapon and attachment paths work. A boss should exploit the same saves, resistance, condition and environmental rules as other sources. This set tests architecture before breadth; it is a proposed suite, not a claim these ports now execute.

## Construction boundary for the next region

Use world/plane context → region palette → habitat graph → settlement/site roles → rooms/inhabitants/owned objects. Choose shared culture/religion/resource records first, bind stable IDs, then generate inhabitants and site details in their context. Dungeons need a purpose/history and **an explicit connected topology** with alternate vertical routes, rather than `genList(room)` being mistaken for a map. Room overlays can then allocate coherent encounters, treasure, shrines and hazards under the selected history.

Validate references, habitat suitability, connectivity, affordable supplies, mandatory-route alternatives, item/effect support, resource totals and ID uniqueness before installation. Record seed, package/content revision, chosen contexts and provenance in the instantiated dossier. Freeze the result into the campaign. Shared references must point at one deity, institution, creature or item instance, not repeated nested copies of the same fictional entity.

This requires neither a universal Adventure record nor a new generator. It requires reusable small constructors, data tables, contextual bindings and an installation/validation boundary feeding Kyr's existing authoritative world.
