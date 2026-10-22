# Capability audit

Kyr's capability audit against Orsino, one family of rules at a time. Each family answers the same seven questions. The counts are not written here: bin/handbook.ts reads them from the books (each family names the handbook sections that hold its entries) and renders doc/architecture/capability-audit.md and the matrix on the handbooks' landing page. Deficiencies are ranked by what fixing them unlocks.

| Family | Entries |
|---|---|
| Ancestries, callings, backgrounds and formations | 54 faithful, 247 adapted, 8 kyr, 5 not playable, 4 unreachable, 11 orsino data only |
| Character creation | 18 faithful, 24 adapted, 1 kyr |
| Progression, feats and high levels | 242 faithful, 8 adapted, 2 kyr, 42 not playable |
| Action timing, reactions, conditions, costs and targeting | 175 faithful, 17 adapted, 26 kyr, 28 not playable |
| Spells: traditions, slots, durations and unusual magic | 239 faithful, 4 adapted, 2 kyr, 39 not playable |
| Summoning, transformation, domination, movement, divination and travel | 35 faithful, 1 adapted, 16 not playable, 10 orsino data only |
| Creatures: families, special attacks, resistances, behaviour and difficulty | 105 faithful, 122 adapted, 9 represented, 21 kyr, 5 not playable, 154 orsino data only |
| Equipment, treasure and magic items | 330 faithful, 93 adapted, 26 represented, 26 kyr, 25 not playable, 7 orsino data only |
| Environment, world and planar rules | 115 kyr, 190 orsino data only |
| Content authoring and generation | 5 kyr |

## Ancestries, callings, backgrounds and formations

Entries: 54 faithful, 247 adapted, 8 kyr, 5 not playable, 4 unreachable, 11 orsino data only.

**What Orsino defines.** 25 ancestries (racialModifier, occupationOptions, traits), 7 classes with classModifier gear, gold and proficiencies, 215 backgrounds, 16 party traits recognised from the company's make-up.

**What Kyr implements faithfully.** Ancestry and calling attribute modifiers, hit dice, weapon and armour proficiencies, class abilities, lineage traits, the 215 backgrounds' scores and gold, formations recognised when a company sets out and held for good.

**What Kyr deliberately adapts.** Backgrounds are grouped into kinds whose meaning is Kyr's (a skill, gear, a contact who hears news). Specializations are chosen or drawn at creation. Skills are carried, not rolled.

**What is data only.** 20 of Orsino's 25 ancestries (birdfolk, orc, halfling and the rest) and the formations that need them.

**What is missing or wrong.** Most ancestries; class starting gear and gold are Kyr's own; formations needing a non-playable ancestry are unreachable.

**What abstractions are needed.** Ancestries are data plus traits Kyr already executes, so the gap is translation through the registry, not mechanism. A trait's perks that read an environment, a weapon or a trigger already run.

**Whether the browser makes it understandable.** Company formation shows ancestry, calling, background and specialization with their modifiers and a formation preview. The handbook now explains each in full.

Handbook sections: `phb:ancestries`, `phb:callings`, `phb:backgrounds`, `phb:traits`, `phb:formations`, `phb:orsino-company/orsino-ancestry`.

## Character creation

Entries: 18 faithful, 24 adapted, 1 kyr.

**What Orsino defines.** CharacterRecord and the pc template: 3d6 attributes with racial and class modifiers, hit die plus positive Constitution, starting spells for casters, class gear and gold.

**What Kyr implements faithfully.** Hit points at level 1 (hit die plus positive Constitution modifier), NPC hit points above level 1, attribute modifiers, starting abilities, spell selection for a specialist caster.

**What Kyr deliberately adapts.** Attribute rolls are seeded per companion so a company can be re-rolled deterministically; gear is the calling's list plus the background's.

**What is data only.** Orsino's occupation options per ancestry beyond Kyr's playable callings.

**What is missing or wrong.** Nothing structural for the three playable ancestries and seven callings.

**What abstractions are needed.** None: creation uses only rules Kyr already runs; it widens as ancestries are translated.

**Whether the browser makes it understandable.** Forming a company reads top to bottom on a phone and side by side on a desktop; each choice shows what it changes.

Handbook sections: `phb:callings`, `phb:ancestries`.

## Progression, feats and high levels

Entries: 242 faithful, 8 adapted, 2 kyr, 42 not playable.

**What Orsino defines.** Experience to any level (50L³ + 150L² + 300L − 600), a quality point a level, a new spell for specialists, feats at 5, 10 and 15, an epic note at 20; spell levels to 9 as caster level rises.

**What Kyr implements faithfully.** Orsino's experience formula to level 20, a quality point and a rolled hit die every level, a new spell of the tradition for specialists up to half their level rounded up, feats at 5, 10 and 15, THAC0 and saves by level.

**What Kyr deliberately adapts.** Slots by spell level, prepared at rest, in place of Orsino's single pool (mage 6 + level + twice the Intelligence modifier; cleric 4 + level + Wisdom; bard 3 + level + Charisma); they reach Orsino's spell levels, a ninth-level spell at 17, and bards seventh at 18. A level is taken at the next sheltered rest. Kyr adds calling features: techniques and calling traits at set levels (a warrior's Rapid Strike at 7 and a second action at 13, a ranger's Arrow Volley at 7), so that every calling gains something in kind at least every three levels.

**What is data only.** Nothing of the levels themselves. Three of Orsino's ten feats (Mana Focusing, Natural Bond, Skald) cannot be played.

**What is missing or wrong.** Feats are few: a mage or a ranger has none it can take, and most warriors have none left at 15. No epic play past 20.

**What abstractions are needed.** Calling features as data (level, techniques, calling traits) applied the same way at creation and at training, and allowed by the store's advancement guard; the playable feats wait on bonus spell slots, summoning bonuses and combat-start hooks.

**Whether the browser makes it understandable.** Each companion's sheet says what the next level brings in kind; the handbook tables each calling level by level, and the audit reports any stretch of four levels that brings nothing new.

Handbook sections: `phb:advancement`, `phb:feats`, `phb:magic`.

## Action timing, reactions, conditions, costs and targeting

Entries: 175 faithful, 17 adapted, 26 kyr, 28 not playable.

**What Orsino defines.** Initiative each round, actions a turn, haste and slow, preparation (Charge), compelled moves, wound-up blows, reactions on being attacked, on an enemy's melee, attack, cast or charge, on combat start, on a status expiring, on healing and on a kill; random multi-target spells.

**What Kyr implements faithfully.** Initiative, THAC0 against descending armour class, criticals, evasion, saves with the three-successes rule, the death save, haste and slow, confusion, charm and domination, preparation and compelled moves, conditions that tick and lapse, recharge, and reactions: a status answers an enemy's named ability (overwatch and blade barrier to a melee blow, a braced spear to a charge), any attack (charm aura, consecrated ground) or any casting (magebane), before the deed lands; what lapses can act (a countdown detonates, a black ritual raises a lich), and a healer's own statuses answer its healing.

**What Kyr deliberately adapts.** Wind-ups are shown to the company a turn ahead; fleeing is the whole company's; a reaction never sets off another.

**What is data only.** Extra turns and turning off reactions (time stop), reflection and spell turning, untargetability, invisibility and the sight that sees through it.

**What is missing or wrong.** Twenty-four statuses still cannot be applied: reflection and spell turning, invisibility and the sight that sees through it, untargetability, time stop's extra turns, polymorph; with them the abilities that apply them.

**What abstractions are needed.** Reflection and spell turning as reactions to being struck or targeted; invisibility as a targeting rule with a perception that defeats it.

**Whether the browser makes it understandable.** A fight tells each reaction as it happens ("the warden answers the wolf"); it does not yet show which statuses are waiting to answer.

Handbook sections: `phb:combat`, `phb:conditions`, `phb:techniques`.

## Spells: traditions, slots, durations and unusual magic

Entries: 239 faithful, 4 adapted, 2 kyr, 39 not playable.

**What Orsino defines.** 131 arcane and 154 divine spells across levels 0 to 9, schools and domains, slot tables, spell saves and durations, and spells that summon, cast other spells, choose an effect at random, resurrect, kill outright or shift planes.

**What Kyr implements faithfully.** Slots by spell level, preparation and readying at rest, cantrips, spell saves for half or none, school and domain access, durations in turns, random targets drawn once for every effect of a spell, electric damage, summoning, effects drawn at random, spells that cast another at no cost, raising the fallen with a share of their health and any traits (animate dead's undead), and turning or commanding foes so they flee the fight.

**What Kyr deliberately adapts.** Preparing a different spell takes an hour. A random spell's count is evaluated as written. A kill rolls the save the spell declares, which Orsino never rolls. A cycling spell keeps its place per caster.

**What is data only.** None: every Orsino spell is catalogued and says whether it plays.

**What is missing or wrong.** Spells that planeshift, teleport, polymorph or shapechange, cascade from target to target, or apply a status Kyr cannot run.

**What abstractions are needed.** Cascading damage as a target rule; transformation as a temporary change of a creature's kind.

**Whether the browser makes it understandable.** Each companion's sheet shows what is prepared today; a spell is cast from the fight's menu with its effect stated. The handbook lists every spell with whether it plays.

Handbook sections: `phb:magic`.

## Summoning, transformation, domination, movement, divination and travel

Entries: 35 faithful, 1 adapted, 16 not playable, 10 orsino data only.

**What Orsino defines.** Summon creatures by kind or generated template, polymorph and shapechange, charm and dominate, flee, teleport and planeshift, divination that reveals.

**What Kyr implements faithfully.** Charm and domination (allegiance changes and control), fleeing, and summoning: creatures by kind, by class, by element or by type, at the level the spell names, owned by the summoner, at most 3 + level / 3 at once with the oldest sent back, and gone when the fight ends.

**What Kyr deliberately adapts.** Kyr draws a summoned monster from all the named classes' kinds at once, where Orsino draws a class and then a kind.

**What is data only.** Summons with an aspect (images, the weird), polymorph, shapechange, teleport, planeshift, mind reading, truesight.

**What is missing or wrong.** Transformation; travel by magic; divination that answers a question about the world; summons that outlast a fight.

**What abstractions are needed.** One entity lifecycle for summon, create, transform and dismiss; travel as a world action whose destination must be known; divination as a world action that teaches a fact the company can then act on.

**Whether the browser makes it understandable.** Summoned creatures appear in the fight's order. Nothing yet presents a place reached by magic.

Handbook sections: `dmg:orsino-world/orsino-plane`.

## Creatures: families, special attacks, resistances, behaviour and difficulty

Entries: 105 faithful, 122 adapted, 9 represented, 21 kyr, 5 not playable, 154 orsino data only.

**What Orsino defines.** 10 monster classes (stat line, weapon, hide, up to three attacks a turn, worth, gold) × 40 types × 31 aspects × 8 ranks, 44 animals, 17 elementals, dragons by colour, golems by substance, 89 kinds of person by trade.

**What Kyr implements faithfully.** Resistances and vulnerabilities, natural weapons and hides, creature traits such as flying and formidable, and Orsino's bestiary composed by its own template: 39 monster types by class, 16 elementals by element and 38 animals by kind, with each class's actions a turn (an owlbear's two, a dragon's three), growth with level (qualities by round(level / 8), hit points by three a level) and worth (class experience + 50 a level).

**What Kyr deliberately adapts.** Kyr's hand-made species (wolves, boars, the bear, the dragon) roll their qualities instead of using Orsino's stat line; a generated species keeps only the abilities and traits Kyr can play and names the rest; the gold a kill was worth is not carried. Temperament acts through the inhabitants rules only where a place gives the creature its words (its warning, onslaught, flinch or plea).

**What is data only.** Ranks (which change nothing in Orsino either), the 31 aspects, the golem substances and dragon colours Kyr has not taken, and Orsino's 89 kinds of person by trade.

**What is missing or wrong.** Aspects; most generated creatures are not yet placed in any world; pursuit beyond a creature's own ground is authored per place.

**What abstractions are needed.** OrsinoBestiary composes species from the registry; species statistics carry actions, growth and worth; the inhabitants rules read temperament (warn, bargain for tribute, keep a post, strike from ambush unless keen eyes spot it, slink away, fight when cornered, flee what it fears, yield when beaten, rally the next day).

**Whether the browser makes it understandable.** Foes show their condition and wind-ups; the Monster Manual describes every species by type, with what each leaves out.

Handbook sections: `mm:species`, `mm:natural-abilities`, `mm:creature-traits`, `mm:orsino-bestiary`.

## Equipment, treasure and magic items

Entries: 330 faithful, 93 adapted, 26 represented, 26 kyr, 25 not playable, 7 orsino data only.

**What Orsino defines.** 83 weapons, 15 armours, 68 pieces of gear, 48 magic items, 28 consumables, treasure tiers by depth.

**What Kyr implements faithfully.** Weapons and armour with proficiency, weight and the knight's perk; consumables that heal or harm.

**What Kyr deliberately adapts.** Treasure is placed by authors and kits, not rolled by tier.

**What is data only.** 60 of 68 gear, 42 of 48 magic items, 22 of 28 consumables, treasure tiers.

**What is missing or wrong.** Most magic items, including those that react when their bearer is attacked; item charges; treasure by tier.

**What abstractions are needed.** Items are mostly data over effects Kyr already runs; the reaction abstraction above unlocks the rest.

**Whether the browser makes it understandable.** Outfitting is a menu of what each companion carries; the handbook lists every item.

Handbook sections: `phb:equipment`, `dmg:orsino-world/orsino-equipment`, `dmg:orsino-world/orsino-consumable`, `dmg:orsino-world/orsino-gear`, `dmg:orsino-world/orsino-treasureTier`.

## Environment, world and planar rules

Entries: 115 kyr, 190 orsino data only.

**What Orsino defines.** Terrain and weather, light, traps with triggers and saves, wonders that grant, ten planes with alignment, terrain, domain and global effects applied to everyone resident.

**What Kyr implements faithfully.** Terrain perks (an elven tribe in a forest), searching by taking 10 against 15, and planes as Orsino has them: a plane is a place whose laws every creature in it holds, as Orsino's planeModifiers.globalEffects are a residency passive (the dead dark halves fire, slows healing and weakens will; test/powers-and-laws.test.ts).

**What Kyr deliberately adapts.** Time, light, weather, passages, obstacles, lodging, food, dominion, people and inhabitants are Kyr's own world rules, written in Kyr and listed in the guide. A plane's law is a catalog condition a place names; it holds in every fight fought there and a rule can change it. Travel between planes is by portal, a passage with an access condition (knowledge, sunlight, a seal), not Orsino's planeshift.

**What is data only.** Orsino's ten planes, its traps and its wonders.

**What is missing or wrong.** Planeshift and teleport as spells; generated traps and wonders.

**What abstractions are needed.** law(place, law) collected up the containment chain; portals as passages with access conditions; a rule's instances re-checked one by one so two powers cannot both take one fortress.

**Whether the browser makes it understandable.** The map draws one region (or plane) at a time and shows ways out to others; a place's laws are not yet shown before a fight.

Handbook sections: `dmg:world-rules`, `dmg:orsino-world/orsino-plane`, `dmg:orsino-world/orsino-trap`, `dmg:orsino-world/orsino-wonder`.

## Content authoring and generation

Entries: 5 kyr.

**What Orsino defines.** Deem tables and templates generate creatures, dungeons, rooms, settlements, shops and treasure; the books are generated from the same tables.

**What Kyr implements faithfully.** Deem as the generator; creature generation by family, terrain and adaptation; dragons by lineage and maturity.

**What Kyr deliberately adapts.** Worlds are assembled from a region's geography and kits whose slots, proposals and provided facts are checked; campaigns install regions, sites, planes, institutions and kits that reach one another only through imported entities (a place, a group, a fact).

**What is data only.** Dungeon and room generation, settlements and shops by size, traps, wonders.

**What is missing or wrong.** Dungeon and room generation from Orsino's tables; generated planes and cities.

**What abstractions are needed.** The same shared vocabulary serves authored and generated content: a power takes a stronghold that stands empty, by night, with the men it posts, by the shared dominion rules, with nothing in the place's own rules naming it (test/fixtures/proving).

**Whether the browser makes it understandable.** Generated worlds play like authored ones.

Handbook sections: `dmg:making-worlds`, `dmg:campaigns`, `mm:generated`.

## Deficiencies, ranked by what fixing them unlocks

| Rank | Deficiency | Unlocks | Cycle | State |
|---:|---|---|---:|---|
| 1 | Progression stopped at level 10 | 56 spells of levels 6–9, feats at 15, levels 11–20; now reached, with calling features for every calling | 4 | addressed |
| 2 | Creatures were fourteen hand-made species acting once a turn, and their temperament was read by nothing | Orsino's bestiary (93 species) with actions a turn and growth; inhabitants that warn, bargain, keep posts, ambush, slink, fear, yield and rally | 2 | addressed |
| 3 | Summoning had no ownership, limit or generated creatures | 12 summoning abilities now play; aspect summons (images, the weird) still do not | 3 | addressed |
| 4 | No reactions to what an enemy does | overwatch, blade barrier, braced spears, magebane, consecrated ground, charm aura now play; reflection and spell turning do not | 3 | addressed |
| 5 | No random multi-target spells | magic missile, lightning bolt, cone of cold, meteor swarm now play; prismatic spray waits on cycling effects | 3 | addressed |
| 6 | No planes, place laws or travel between worlds | place laws and portals run (test/fixtures/proving); the Unlit, the plane that showed them in play, was retired with the old corpus in Mission 8; Orsino's planes and planeshift remain data | 5 | partly addressed |
| 7 | Cast, random, cycling, resurrect, kill and flee effects | chaos bolt, warp, prismatic spray, raise dead, animate dead, death, command, turn undead now play; 43 abilities still do not | 3 | addressed |
| 8 | Items are mostly Orsino data | 60 gear, 42 magic items, 22 consumables | 2 | open |
| 9 | Electric damage is not a Kyr damage kind | 11 spells and weapons | 3 | addressed |
| 10 | No city, no institutions as kits | the rules a city needs (permissions after dark, a power's patronage, prices that follow a road) run; Brack, the city that showed them, was retired with the old corpus in Mission 8; institutions are not yet kits | 5 | partly addressed |
