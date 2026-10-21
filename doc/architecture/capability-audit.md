# Capability audit

Kyr's capability audit against Orsino, one family of rules at a time. Each family answers the same seven questions. The counts are not written here: bin/handbook.ts reads them from the books (each family names the handbook sections that hold its entries) and renders doc/architecture/capability-audit.md and the matrix on the handbooks' landing page. Deficiencies are ranked by what fixing them unlocks.

| Family | Entries |
|---|---|
| Ancestries, callings, backgrounds and formations | 37 faithful, 244 adapted, 1 kyr, 5 not playable, 4 unreachable, 21 orsino data only |
| Character creation | 11 faithful, 21 adapted, 1 kyr |
| Progression, feats and high levels | 149 faithful, 4 adapted, 2 kyr, 83 not playable, 56 unreachable |
| Action timing, reactions, conditions, costs and targeting | 166 faithful, 8 adapted, 8 kyr, 46 not playable |
| Spells: traditions, slots, durations and unusual magic | 146 faithful, 2 kyr, 80 not playable, 56 unreachable |
| Summoning, transformation, domination, movement, divination and travel | 7 faithful, 1 adapted, 37 not playable, 7 unreachable, 10 orsino data only |
| Creatures: families, special attacks, resistances, behaviour and difficulty | 27 faithful, 14 adapted, 9 represented, 19 kyr, 5 not playable, 247 orsino data only |
| Equipment, treasure and magic items | 69 faithful, 20 adapted, 1 represented, 20 kyr, 141 orsino data only |
| Environment, world and planar rules | 74 kyr, 190 orsino data only |
| Content authoring and generation | 9 kyr |

## Ancestries, callings, backgrounds and formations

Entries: 37 faithful, 244 adapted, 1 kyr, 5 not playable, 4 unreachable, 21 orsino data only.

**What Orsino defines.** 25 ancestries (racialModifier, occupationOptions, traits), 7 classes with classModifier gear, gold and proficiencies, 215 backgrounds, 16 party traits recognised from the company's make-up.

**What Kyr implements faithfully.** Ancestry and calling attribute modifiers, hit dice, weapon and armour proficiencies, class abilities, lineage traits, the 215 backgrounds' scores and gold, formations recognised when a company sets out and held for good.

**What Kyr deliberately adapts.** Backgrounds are grouped into kinds whose meaning is Kyr's (a skill, gear, a contact who hears news). Specializations are chosen or drawn at creation. Skills are carried, not rolled.

**What is data only.** 20 of Orsino's 25 ancestries (birdfolk, orc, halfling and the rest) and the formations that need them.

**What is missing or wrong.** Most ancestries; class starting gear and gold are Kyr's own; formations needing a non-playable ancestry are unreachable.

**What abstractions are needed.** Ancestries are data plus traits Kyr already executes, so the gap is translation through the registry, not mechanism. A trait's perks that read an environment, a weapon or a trigger already run.

**Whether the browser makes it understandable.** Company formation shows ancestry, calling, background and specialization with their modifiers and a formation preview. The handbook now explains each in full.

Handbook sections: `phb:ancestries`, `phb:callings`, `phb:backgrounds`, `phb:traits`, `phb:formations`, `phb:orsino-company/orsino-ancestry`.

## Character creation

Entries: 11 faithful, 21 adapted, 1 kyr.

**What Orsino defines.** CharacterRecord and the pc template: 3d6 attributes with racial and class modifiers, hit die plus positive Constitution, starting spells for casters, class gear and gold.

**What Kyr implements faithfully.** Hit points at level 1 (hit die plus positive Constitution modifier), NPC hit points above level 1, attribute modifiers, starting abilities, spell selection for a specialist caster.

**What Kyr deliberately adapts.** Attribute rolls are seeded per companion so a company can be re-rolled deterministically; gear is the calling's list plus the background's.

**What is data only.** Orsino's occupation options per ancestry beyond Kyr's playable callings.

**What is missing or wrong.** Nothing structural for the three playable ancestries and seven callings.

**What abstractions are needed.** None: creation uses only rules Kyr already runs; it widens as ancestries are translated.

**Whether the browser makes it understandable.** Forming a company reads top to bottom on a phone and side by side on a desktop; each choice shows what it changes.

Handbook sections: `phb:callings`, `phb:ancestries`.

## Progression, feats and high levels

Entries: 149 faithful, 4 adapted, 2 kyr, 83 not playable, 56 unreachable.

**What Orsino defines.** Experience to any level (50L³ + 150L² + 300L − 600), a quality point a level, a new spell for specialists, feats at 5, 10 and 15, an epic note at 20; spell levels to 9 as caster level rises.

**What Kyr implements faithfully.** The experience formula to level 10, quality points, specialist spells, feats at 5 and 10, the death save and THAC0 by level.

**What Kyr deliberately adapts.** A level is taken at the next sheltered rest.

**What is data only.** Levels 11 to 20 and every slot row past class level 10.

**What is missing or wrong.** Slot tables stop at class level 10, so spells of levels 6 to 9 are unreachable and no level past 10 exists. Feats at 15 cannot be reached. Of ten feats, three are not playable.

**What abstractions are needed.** Slot tables and thresholds that run to 20 as data; a test party at levels 1, 5, 10 and 15; a way to start a campaign with an experienced company.

**Whether the browser makes it understandable.** Advancement is announced and applied at rest; there is no view of what the next level brings.

Handbook sections: `phb:advancement`, `phb:feats`, `phb:magic`.

## Action timing, reactions, conditions, costs and targeting

Entries: 166 faithful, 8 adapted, 8 kyr, 46 not playable.

**What Orsino defines.** Initiative each round, actions a turn, haste and slow, preparation (Charge), compelled moves, wound-up blows, reactions on being attacked, on an enemy's melee, attack, cast or charge, on combat start, on a status expiring, on healing and on a kill; random multi-target spells.

**What Kyr implements faithfully.** Initiative, THAC0 against descending armour class, criticals, evasion, saves with the three-successes rule, the death save, haste and slow, confusion, charm and domination, preparation and compelled moves, conditions that tick and lapse, recharge.

**What Kyr deliberately adapts.** Wind-ups are shown to the company a turn ahead; fleeing is the whole company's.

**What is data only.** Reactions to an enemy's action (onEnemyMelee, onEnemyAttack, onEnemyCharge, onOffensiveCasting), onExpire and onCombatStart, extra turns, reflection and spell turning.

**What is missing or wrong.** Random multi-target spells (magic missile, lightning bolt, cone of cold, meteor swarm, prismatic spray); reactions to what an enemy does; thirty-two statuses Kyr cannot apply (overwatch, braced, invisible, reflect, spellturn, timestop and others).

**What abstractions are needed.** A reaction is a condition's or trait's hook on an event another combatant causes, answered within that event; a random target set is a target kind with a count expression. Both are general and replayable from the seed.

**Whether the browser makes it understandable.** A fight shows whose turn it is, the order, wound-up blows and conditions. It does not show a reaction as it happens or why a creature chose its target.

Handbook sections: `phb:combat`, `phb:conditions`, `phb:techniques`.

## Spells: traditions, slots, durations and unusual magic

Entries: 146 faithful, 2 kyr, 80 not playable, 56 unreachable.

**What Orsino defines.** 131 arcane and 154 divine spells across levels 0 to 9, schools and domains, slot tables, spell saves and durations, and spells that summon, cast other spells, choose an effect at random, resurrect, kill outright or shift planes.

**What Kyr implements faithfully.** Slots by spell level, preparation and readying at rest, cantrips, spell saves for half or none, school and domain access, durations in turns.

**What Kyr deliberately adapts.** Preparing a different spell takes an hour.

**What is data only.** None: every Orsino spell is catalogued and says whether it plays.

**What is missing or wrong.** Unreachable spells above level 5 and unplayable spells that summon, cast, randomize, resurrect, kill outright or planeshift.

**What abstractions are needed.** Entity creation with an owner and a lifetime (summon, create, dismiss); an effect that casts a named ability; a weighted random choice of effects drawn from the battle's seed; resurrection as a state change on a fallen creature.

**Whether the browser makes it understandable.** Each companion's sheet shows what is prepared today; a spell is cast from the fight's menu with its effect stated. The handbook lists every spell with whether it plays.

Handbook sections: `phb:magic`.

## Summoning, transformation, domination, movement, divination and travel

Entries: 7 faithful, 1 adapted, 37 not playable, 7 unreachable, 10 orsino data only.

**What Orsino defines.** Summon creatures by kind or generated template, polymorph and shapechange, charm and dominate, flee, teleport and planeshift, divination that reveals.

**What Kyr implements faithfully.** Charm and domination (allegiance changes and control), fleeing.

**What Kyr deliberately adapts.** Summoning calls a catalogued species and it fights for the summoner until the fight ends.

**What is data only.** Generated summons, polymorph, shapechange, teleport, planeshift, mind reading, truesight.

**What is missing or wrong.** Ownership and dismissal of summoned creatures; transformation; travel by magic; divination that answers a question about the world.

**What abstractions are needed.** One entity lifecycle for summon, create, transform and dismiss; travel as a world action whose destination must be known; divination as a world action that teaches a fact the company can then act on.

**Whether the browser makes it understandable.** Summoned creatures appear in the fight's order. Nothing yet presents a place reached by magic.

Handbook sections: `dmg:orsino-world/orsino-plane`.

## Creatures: families, special attacks, resistances, behaviour and difficulty

Entries: 27 faithful, 14 adapted, 9 represented, 19 kyr, 5 not playable, 247 orsino data only.

**What Orsino defines.** 10 monster classes (stat line, weapon, hide, up to three attacks a turn, worth, gold) × 40 types × 31 aspects × 8 ranks, 44 animals, 17 elementals, dragons by colour, golems by substance, 89 kinds of person by trade.

**What Kyr implements faithfully.** Resistances and vulnerabilities, natural weapons and hides, creature traits such as flying and formidable, experience by kind and level, the golem as Orsino composes it.

**What Kyr deliberately adapts.** Most of Kyr's fourteen species roll their qualities instead of using Orsino's stat line.

**What is data only.** Most monster types, every rank and aspect, 40 of 44 animals, every elemental and kind of person.

**What is missing or wrong.** Several attacks a turn; most of the bestiary; temperament and habitat are recorded but read by nothing in play, so creatures do not warn, bargain, retreat or pursue by their nature.

**What abstractions are needed.** Species composed from Orsino's monster template through the registry (OrsinoMonsters already reproduces it); attacks a turn as a species statistic; temperament as the rules by which an inhabitant answers intrusion.

**Whether the browser makes it understandable.** Foes are shown with their condition and wind-ups. The Monster Manual now describes every species and what is not yet held.

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

| Rank | Deficiency | Unlocks | Cycle |
|---:|---|---|---:|
| 1 | Progression stops at level 10 | 56 spells of levels 6–9, feats at 15, levels 11–20 | 4 |
| 2 | Creatures are fourteen hand-made species, one attack a turn, and their temperament is read by nothing | Orsino's bestiary through the monster template; multi-attack; inhabitants that answer intrusion | 2 |
| 3 | Summoning has no ownership, lifetime or dismissal, and cannot call a generated creature | 16 summoning abilities, 27 companions, conjured guardians | 3 |
| 4 | No reactions to what an enemy does | 32 statuses (overwatch, braced, reflect, spellturn …), reactive magic items | 3 |
| 5 | No random multi-target spells | magic missile, lightning bolt, cone of cold, meteor swarm, prismatic spray | 3 |
| 6 | No planes, place laws or magical travel | 10 planes, planeshift, teleport, a planar adventure | 5 |
| 7 | Cast, random effect, resurrect and kill effects | 20 entries that cast, 6 that randomize, 8 that resurrect or kill | 3 |
| 8 | Items are mostly Orsino data | 60 gear, 42 magic items, 22 consumables | 2 |
| 9 | Electric damage is not a Kyr damage kind | 11 spells and weapons | 3 |
| 10 | No city, no institutions as kits | urban investigation, negotiation and patronage | 5 |
