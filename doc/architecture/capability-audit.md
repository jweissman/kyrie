# Capability audit

Kyr's capability audit against Orsino, one family of rules at a time. Each family answers the same seven questions. The counts are not written here: bin/handbook.ts reads them from the books (each family names the handbook sections that hold its entries) and renders doc/architecture/capability-audit.md and the matrix on the handbooks' landing page. Deficiencies are ranked by what fixing them unlocks.

| Family | Entries |
|---|---|
| Ancestries, callings, backgrounds and formations | 34 faithful, 247 adapted, 8 kyr, 5 not playable, 4 unreachable, 21 orsino data only |
| Character creation | 8 faithful, 24 adapted, 1 kyr |
| Progression, feats and high levels | 224 faithful, 7 adapted, 2 kyr, 61 not playable |
| Action timing, reactions, conditions, costs and targeting | 167 faithful, 9 adapted, 8 kyr, 44 not playable |
| Spells: traditions, slots, durations and unusual magic | 221 faithful, 3 adapted, 2 kyr, 58 not playable |
| Summoning, transformation, domination, movement, divination and travel | 27 faithful, 1 adapted, 24 not playable, 10 orsino data only |
| Creatures: families, special attacks, resistances, behaviour and difficulty | 105 faithful, 122 adapted, 9 represented, 19 kyr, 5 not playable, 154 orsino data only |
| Equipment, treasure and magic items | 69 faithful, 20 adapted, 1 represented, 20 kyr, 141 orsino data only |
| Environment, world and planar rules | 74 kyr, 190 orsino data only |
| Content authoring and generation | 9 kyr |

## Ancestries, callings, backgrounds and formations

Entries: 34 faithful, 247 adapted, 8 kyr, 5 not playable, 4 unreachable, 21 orsino data only.

**What Orsino defines.** 25 ancestries (racialModifier, occupationOptions, traits), 7 classes with classModifier gear, gold and proficiencies, 215 backgrounds, 16 party traits recognised from the company's make-up.

**What Kyr implements faithfully.** Ancestry and calling attribute modifiers, hit dice, weapon and armour proficiencies, class abilities, lineage traits, the 215 backgrounds' scores and gold, formations recognised when a company sets out and held for good.

**What Kyr deliberately adapts.** Backgrounds are grouped into kinds whose meaning is Kyr's (a skill, gear, a contact who hears news). Specializations are chosen or drawn at creation. Skills are carried, not rolled.

**What is data only.** 20 of Orsino's 25 ancestries (birdfolk, orc, halfling and the rest) and the formations that need them.

**What is missing or wrong.** Most ancestries; class starting gear and gold are Kyr's own; formations needing a non-playable ancestry are unreachable.

**What abstractions are needed.** Ancestries are data plus traits Kyr already executes, so the gap is translation through the registry, not mechanism. A trait's perks that read an environment, a weapon or a trigger already run.

**Whether the browser makes it understandable.** Company formation shows ancestry, calling, background and specialization with their modifiers and a formation preview. The handbook now explains each in full.

Handbook sections: `phb:ancestries`, `phb:callings`, `phb:backgrounds`, `phb:traits`, `phb:formations`, `phb:orsino-company/orsino-ancestry`.

## Character creation

Entries: 8 faithful, 24 adapted, 1 kyr.

**What Orsino defines.** CharacterRecord and the pc template: 3d6 attributes with racial and class modifiers, hit die plus positive Constitution, starting spells for casters, class gear and gold.

**What Kyr implements faithfully.** Hit points at level 1 (hit die plus positive Constitution modifier), NPC hit points above level 1, attribute modifiers, starting abilities, spell selection for a specialist caster.

**What Kyr deliberately adapts.** Attribute rolls are seeded per companion so a company can be re-rolled deterministically; gear is the calling's list plus the background's.

**What is data only.** Orsino's occupation options per ancestry beyond Kyr's playable callings.

**What is missing or wrong.** Nothing structural for the three playable ancestries and seven callings.

**What abstractions are needed.** None: creation uses only rules Kyr already runs; it widens as ancestries are translated.

**Whether the browser makes it understandable.** Forming a company reads top to bottom on a phone and side by side on a desktop; each choice shows what it changes.

Handbook sections: `phb:callings`, `phb:ancestries`.

## Progression, feats and high levels

Entries: 224 faithful, 7 adapted, 2 kyr, 61 not playable.

**What Orsino defines.** Experience to any level (50L³ + 150L² + 300L − 600), a quality point a level, a new spell for specialists, feats at 5, 10 and 15, an epic note at 20; spell levels to 9 as caster level rises.

**What Kyr implements faithfully.** Orsino's experience formula to level 20, a quality point and a rolled hit die every level, a new spell of the tradition for specialists up to half their level rounded up, feats at 5, 10 and 15, THAC0 and saves by level.

**What Kyr deliberately adapts.** Slots by spell level, prepared at rest, in place of Orsino's single pool (mage 6 + level + twice the Intelligence modifier; cleric 4 + level + Wisdom; bard 3 + level + Charisma); they reach Orsino's spell levels, a ninth-level spell at 17, and bards seventh at 18. A level is taken at the next sheltered rest. Kyr adds calling features: techniques and calling traits at set levels (a warrior's Rapid Strike at 7 and a second action at 13, a ranger's Arrow Volley at 7), so that every calling gains something in kind at least every three levels.

**What is data only.** Nothing of the levels themselves. Three of Orsino's ten feats (Mana Focusing, Natural Bond, Skald) cannot be played.

**What is missing or wrong.** Feats are few: a mage or a ranger has none it can take, and most warriors have none left at 15. No epic play past 20.

**What abstractions are needed.** Calling features as data (level, techniques, calling traits) applied the same way at creation and at training, and allowed by the store's advancement guard; the playable feats wait on bonus spell slots, summoning bonuses and combat-start hooks.

**Whether the browser makes it understandable.** Each companion's sheet says what the next level brings in kind; the handbook tables each calling level by level, and the audit reports any stretch of four levels that brings nothing new.

Handbook sections: `phb:advancement`, `phb:feats`, `phb:magic`.

## Action timing, reactions, conditions, costs and targeting

Entries: 167 faithful, 9 adapted, 8 kyr, 44 not playable.

**What Orsino defines.** Initiative each round, actions a turn, haste and slow, preparation (Charge), compelled moves, wound-up blows, reactions on being attacked, on an enemy's melee, attack, cast or charge, on combat start, on a status expiring, on healing and on a kill; random multi-target spells.

**What Kyr implements faithfully.** Initiative, THAC0 against descending armour class, criticals, evasion, saves with the three-successes rule, the death save, haste and slow, confusion, charm and domination, preparation and compelled moves, conditions that tick and lapse, recharge.

**What Kyr deliberately adapts.** Wind-ups are shown to the company a turn ahead; fleeing is the whole company's.

**What is data only.** Reactions to an enemy's action (onEnemyMelee, onEnemyAttack, onEnemyCharge, onOffensiveCasting), onExpire and onCombatStart, extra turns, reflection and spell turning.

**What is missing or wrong.** Random multi-target spells (magic missile, lightning bolt, cone of cold, meteor swarm, prismatic spray); reactions to what an enemy does; thirty-two statuses Kyr cannot apply (overwatch, braced, invisible, reflect, spellturn, timestop and others).

**What abstractions are needed.** A reaction is a condition's or trait's hook on an event another combatant causes, answered within that event; a random target set is a target kind with a count expression. Both are general and replayable from the seed.

**Whether the browser makes it understandable.** A fight shows whose turn it is, the order, wound-up blows and conditions. It does not show a reaction as it happens or why a creature chose its target.

Handbook sections: `phb:combat`, `phb:conditions`, `phb:techniques`.

## Spells: traditions, slots, durations and unusual magic

Entries: 221 faithful, 3 adapted, 2 kyr, 58 not playable.

**What Orsino defines.** 131 arcane and 154 divine spells across levels 0 to 9, schools and domains, slot tables, spell saves and durations, and spells that summon, cast other spells, choose an effect at random, resurrect, kill outright or shift planes.

**What Kyr implements faithfully.** Slots by spell level, preparation and readying at rest, cantrips, spell saves for half or none, school and domain access, durations in turns, random targets drawn once for every effect of a spell, electric damage as Orsino's content deals it, and summoning.

**What Kyr deliberately adapts.** Preparing a different spell takes an hour. A random spell's count is evaluated as written (Orsino's parseInt reads "2 + round(#level/2)" as 2 and an expression as nothing).

**What is data only.** None: every Orsino spell is catalogued and says whether it plays.

**What is missing or wrong.** Spells that cast other spells, choose an effect at random or in turn, resurrect, kill outright, planeshift, or apply one of 34 statuses Kyr cannot run (overwatch, invisible, reflect, spell turning, time stop).

**What abstractions are needed.** An effect that casts a named ability; a weighted random choice of effects drawn from the battle's seed; resurrection as a state change on a fallen creature; statuses that answer what an enemy does.

**Whether the browser makes it understandable.** Each companion's sheet shows what is prepared today; a spell is cast from the fight's menu with its effect stated. The handbook lists every spell with whether it plays.

Handbook sections: `phb:magic`.

## Summoning, transformation, domination, movement, divination and travel

Entries: 27 faithful, 1 adapted, 24 not playable, 10 orsino data only.

**What Orsino defines.** Summon creatures by kind or generated template, polymorph and shapechange, charm and dominate, flee, teleport and planeshift, divination that reveals.

**What Kyr implements faithfully.** Charm and domination (allegiance changes and control), fleeing, and summoning: creatures by kind, by class, by element or by type, at the level the spell names, owned by the summoner, at most 3 + level / 3 at once with the oldest sent back, and gone when the fight ends.

**What Kyr deliberately adapts.** Kyr draws a summoned monster from all the named classes' kinds at once, where Orsino draws a class and then a kind.

**What is data only.** Summons with an aspect (images, the weird), polymorph, shapechange, teleport, planeshift, mind reading, truesight.

**What is missing or wrong.** Transformation; travel by magic; divination that answers a question about the world; summons that outlast a fight.

**What abstractions are needed.** One entity lifecycle for summon, create, transform and dismiss; travel as a world action whose destination must be known; divination as a world action that teaches a fact the company can then act on.

**Whether the browser makes it understandable.** Summoned creatures appear in the fight's order. Nothing yet presents a place reached by magic.

Handbook sections: `dmg:orsino-world/orsino-plane`.

## Creatures: families, special attacks, resistances, behaviour and difficulty

Entries: 105 faithful, 122 adapted, 9 represented, 19 kyr, 5 not playable, 154 orsino data only.

**What Orsino defines.** 10 monster classes (stat line, weapon, hide, up to three attacks a turn, worth, gold) × 40 types × 31 aspects × 8 ranks, 44 animals, 17 elementals, dragons by colour, golems by substance, 89 kinds of person by trade.

**What Kyr implements faithfully.** Resistances and vulnerabilities, natural weapons and hides, creature traits such as flying and formidable, and Orsino's bestiary composed by its own template: 39 monster types by class, 16 elementals by element and 38 animals by kind, with each class's actions a turn (an owlbear's two, a dragon's three), growth with level (qualities by round(level / 8), hit points by three a level) and worth (class experience + 50 a level).

**What Kyr deliberately adapts.** Kyr's hand-made species (wolves, boars, the bear, the dragon) roll their qualities instead of using Orsino's stat line; a generated species keeps only the abilities and traits Kyr can play and names the rest; the gold a kill was worth is not carried.

**What is data only.** Ranks (which change nothing in Orsino either), the 31 aspects, the golem substances and dragon colours Kyr has not taken, and Orsino's 89 kinds of person by trade.

**What is missing or wrong.** Temperament and habitat are recorded but read by nothing in play, so creatures do not yet warn, bargain, retreat or pursue by their nature; aspects; most generated creatures are not yet placed in any world.

**What abstractions are needed.** OrsinoBestiary (bun bin/orsino-registry.ts bestiary) composes species from the registry; species statistics carry actions, growth and worth; temperament as rules by which an inhabitant answers intrusion is still to come.

**Whether the browser makes it understandable.** Foes show their condition and wind-ups; the Monster Manual describes every species by type, with what each leaves out.

Handbook sections: `mm:species`, `mm:natural-abilities`, `mm:creature-traits`, `mm:orsino-bestiary`.

## Equipment, treasure and magic items

Entries: 69 faithful, 20 adapted, 1 represented, 20 kyr, 141 orsino data only.

**What Orsino defines.** 83 weapons, 15 armours, 68 pieces of gear, 48 magic items, 28 consumables, treasure tiers by depth.

**What Kyr implements faithfully.** Weapons and armour with proficiency, weight and the knight's perk; consumables that heal or harm.

**What Kyr deliberately adapts.** Treasure is placed by authors and kits, not rolled by tier.

**What is data only.** 60 of 68 gear, 42 of 48 magic items, 22 of 28 consumables, treasure tiers.

**What is missing or wrong.** Most magic items, including those that react when their bearer is attacked; item charges; treasure by tier.

**What abstractions are needed.** Items are mostly data over effects Kyr already runs; the reaction abstraction above unlocks the rest.

**Whether the browser makes it understandable.** Outfitting is a menu of what each companion carries; the handbook lists every item.

Handbook sections: `phb:equipment`, `dmg:orsino-world/orsino-equipment`, `dmg:orsino-world/orsino-consumable`, `dmg:orsino-world/orsino-gear`, `dmg:orsino-world/orsino-treasureTier`.

## Environment, world and planar rules

Entries: 74 kyr, 190 orsino data only.

**What Orsino defines.** Terrain and weather, light, traps with triggers and saves, wonders that grant, ten planes with alignment, terrain, domain and global effects applied to everyone resident.

**What Kyr implements faithfully.** Terrain perks (an elven tribe in a forest), searching by taking 10 against 15.

**What Kyr deliberately adapts.** Time, light, weather, passages, obstacles, lodging, food, dominion and people are Kyr's own world rules, written in Kyr and listed in the guide.

**What is data only.** All ten planes, all traps and wonders.

**What is missing or wrong.** Planes as places with laws; a law that changes magic or combat for everyone in a place; traps and wonders as generated content.

**What abstractions are needed.** A place's laws as modifiers every creature there holds while it is there (Orsino's residency passive), applied through the same condition machinery; travel between planes as a passage whose access is a condition.

**Whether the browser makes it understandable.** The map shows places and ways; nothing yet shows a place's laws.

Handbook sections: `dmg:world-rules`, `dmg:orsino-world/orsino-plane`, `dmg:orsino-world/orsino-trap`, `dmg:orsino-world/orsino-wonder`.

## Content authoring and generation

Entries: 9 kyr.

**What Orsino defines.** Deem tables and templates generate creatures, dungeons, rooms, settlements, shops and treasure; the books are generated from the same tables.

**What Kyr implements faithfully.** Deem as the generator; creature generation by family, terrain and adaptation; dragons by lineage and maturity.

**What Kyr deliberately adapts.** Worlds are assembled from a region's geography and kits whose slots, proposals and provided facts are checked; every choice is recorded.

**What is data only.** Dungeon and room generation, settlements and shops by size, traps, wonders.

**What is missing or wrong.** Institutions and planes as kits; a city; a layered situation web that spans levels of play.

**What abstractions are needed.** Kits that bring sites, institutions and planes with the facts they must preserve.

**Whether the browser makes it understandable.** Generated worlds play like authored ones.

Handbook sections: `dmg:making-worlds`, `dmg:campaigns`, `mm:generated`.

## Deficiencies, ranked by what fixing them unlocks

| Rank | Deficiency | Unlocks | Cycle | State |
|---:|---|---|---:|---|
| 1 | Progression stopped at level 10 | 56 spells of levels 6–9, feats at 15, levels 11–20; now reached, with calling features for every calling | 4 | addressed |
| 2 | Creatures were fourteen hand-made species acting once a turn; their temperament is still read by nothing | Orsino's bestiary (93 species) with actions a turn and growth; inhabitants that answer intrusion still to come | 2 | partly addressed |
| 3 | Summoning had no ownership, limit or generated creatures | 12 summoning abilities now play; aspect summons (images, the weird) still do not | 3 | addressed |
| 4 | No reactions to what an enemy does | 32 statuses (overwatch, braced, reflect, spellturn …), reactive magic items | 3 | open |
| 5 | No random multi-target spells | magic missile, lightning bolt, cone of cold, meteor swarm now play; prismatic spray waits on cycling effects | 3 | addressed |
| 6 | No planes, place laws or magical travel | 10 planes, planeshift, teleport, a planar adventure | 5 | open |
| 7 | Cast, random effect, resurrect and kill effects | 20 entries that cast, 6 that randomize, 8 that resurrect or kill | 3 | open |
| 8 | Items are mostly Orsino data | 60 gear, 42 magic items, 22 consumables | 2 | open |
| 9 | Electric damage is not a Kyr damage kind | 11 spells and weapons | 3 | addressed |
| 10 | No city, no institutions as kits | urban investigation, negotiation and patronage | 5 | open |
