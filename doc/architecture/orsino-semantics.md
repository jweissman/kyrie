# Orsino's rules in Kyr: a semantic inventory

The registry report (`orsino-coverage.md`) counts entries. This document is about systems: how each of Orsino's
rules works in Orsino, what Kyr does with it, and whether the two agree. Every claim names the test that holds it.

Status words:

- **Faithful:** Kyr does what Orsino does.
- **Adapted:** Kyr does something different on purpose, for a stated reason.
- **Incomplete:** part of the rule runs; the rest is named.
- **Incorrect:** Kyr ran it differently from Orsino without saying so. These are bugs; the ones found are listed
  with their fixes.

Sources read: Orsino at `4cb27ce` (`src/orsino/Combat.ts`, `rules/Commands.ts`, `rules/Fighting.ts`,
`rules/SkillCheck.ts`, `rules/CharacterRecord.ts`, `Trait.ts`, `Dungeoneer.ts`, `tactics/AbilityScoring.ts`,
`settings/fantasy/*.json`).

## Company formations (party traits)

**Orsino.** Sixteen traits of type `party`. Each requires a formation: a multiset of three classes (three clerics)
or of three ancestries (a human, an elf and a dwarf). A matching party is recognized when it is formed, and every
member holds the trait. Its statuses become passive effects.

**Kyr.** Implemented as one mechanism, not sixteen cases:

- `Formations.recognize` and `Formations.near` read `requires.company` from the catalog.
- `Content.createCreature` gives every member the formation the company was formed as.
- The perks then act through the ordinary paths: modifiers, conditional perks, triggers and bonuses.

**Faithful.** 15 of 16 formations execute. The Circle (three rangers) does not: it needs animal summoning.

Communicated when the company is chosen ("Together they make", "One change away: make one companion an elf"), and
on the company sheet. Perk text is generated from what each perk does, not from Orsino's prose: Orsino's
"+5 to investigation checks" names a check that Kyr does not make.

Tests (`test/formations.test.ts`):

- three clerics are a Synod;
- a Synod member's healing has +1d4;
- a mixed company is no Synod;
- near-misses name the companion who is missing.

## Perks: where, with what, and when

**Orsino.** A trait's statuses carry modifiers, plus some keys that work differently:

- `whileEnvironment`: holds only in a dungeon of that terrain.
- `condition.weapon`: holds only with a weapon of that weight.
- `onKill`, `onLevelUp`, `onOffensiveCasting`: triggers.
- `searchBonus`, `goldMultiplier`, `lootBonus`, `spellDurationBonus`, `backstabMultiplier`: bonuses.

**Kyr.** The catalog translation (`orsino-translate.ts`) keeps each perk's condition and kind. Before this, the
weapon and environment conditions were dropped, so those perks held everywhere. The runtime reads them as follows:

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| Environment perks | the dungeon's terrain | `Environment.of`: urban in a settlement, cave in an unlit place, else the nearest place's `terrain` fact. The Varrow and every generated region now declare terrain. | Adapted (Kyr has no dungeon terrain roll) |
| Weapon perks | weapon weight; the melee condition is declared but not checked | weight checked; a melee perk does not hold with a missile weapon | Adapted: Kyr checks the declared condition |
| `onKill` | from the shared hit handler, so spell kills count | `PerkTriggers.after`, per enemy the ability killed | Faithful |
| kill gold | gold pieces | converted at Kyr's rate, a coin for every ten gold pieces | Faithful to the economy |
| `onLevelUp` | +max hp per level | added to the rolled hit points in `Advancement.train` | Faithful |
| `onOffensiveCasting` | extra damage to each enemy when a resisted spell is cast | the same, for abilities with a resist | Faithful |
| `goldMultiplier` | more gold from every source | applied when coin enters the company (`commitMoney`); the largest applies | Faithful |
| `spellDurationBonus` | statuses the holder applies last longer | added in `Effects.condition` | Faithful |
| `backstabMultiplier` | backstab damage | `Perks.abilityDamage`, multiplied per ability | Faithful |
| `searchBonus` | d20 + Wisdom modifier + bonus ≥ 15, one member | Kyr takes 10: the best searcher's 10 + Wisdom modifier + bonus ≥ 15 finds what would otherwise need a skill | Adapted (Kyr does not roll a search) |
| `lootBonus` | that many common consumables on a successful search | the same, to the searcher, when the search (taken at 10) succeeds | Adapted |

**Incorrect, now fixed:** Orsino's knight has +5 to hit only with a heavy weapon. Kyr's earlier catalog gave it
always, and its fighters carried no weapon weight, so no weight perk could ever have held. Both are fixed
(`test/domain-model.test.ts`: dagger, no bonus; greatsword, +5).

**Incorrect, now withdrawn:** this work first made a search bonus halve search time. Orsino has no such rule. It was
replaced by the check above before it was committed.

## Preparation, requirements and compulsion

**Orsino.**

- `prepare_charge` applies Preparing to Charge (+2 to hit, +2 damage, `compelNextMove: charge`, two turns).
- `charge` requires that status and removes it.
- Backstab requires Hidden.
- Set Spear requires an intercepting weapon.
- Countdown and Black Ritual require their own status to be absent.
- `setupFor` is only a hint for the AI's ability scoring.

**Kyr.** Previously, the inline status was registered after the abilities that need it, so Charge lost its
requirement: it could be used at once, and the prepare step was meaningless. Now:

- the translator registers inline statuses first;
- `requires.status` and `requires.notStatus` gate `Battle.usable`;
- the status's `compel` leaves Charge as the only legal action;
- `removeStatus` matches by name pattern, as Orsino's regex does.

**Faithful:** Charge, Backstab, Set Spear's requirement.

**Incomplete:**

- Set Spear's `onEnemyCharge` reaction does not run.
- Countdown and Black Ritual need `onExpire` casting.

Test: `test/formations.test.ts`, "keeps Charge out of reach until a warrior has prepared it".

## Progression

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| Experience curve | `xpForLevel` (50L³ + 150L² + 300L − 600), unbounded | the same formula, to level 20 | Faithful (`advancement.test.ts`) |
| Hit points | hit die + Constitution modifier, at least 1 | same, plus `onLevelUp` perks | Faithful |
| Qualities | a point of any quality per level | `raise_quality`, spent in the field | Faithful |
| Spells | a specialist picks a new spell of its school or domain, up to half its level rounded up | of its tradition, and never of a level it has no slot for | Adapted (`Advancement.learnable`) |
| Spell slots | one pool (mage 6 + level + 2 × INT modifier; cleric 4 + level + WIS; bard 3 + level + CHA), any spell up to ⌈L/2⌉ | slots by spell level to class level 20, prepared at rest, reaching the same spell levels: sixth at 11, ninth at 17; bards seventh at 18 | Adapted (`classes.json` notes) |
| Feats | at levels 5, 10 and 15 | the same | Faithful |
| Calling features | none beyond ability level gates | techniques and calling traits at set levels (Rapid Strike, Arrow Volley, a second action at 13 or 17), so every calling gains something new at least every three levels | Kyr's own (`progression.test.ts`) |
| Made at a level | an NPC's chassis | a companion made at a level holds what one trained to it holds, and a specialist knows a spell for each level since | Kyr's own |

Three of Orsino's ten feats still do not execute: Focused Casting (`bonusSpellSlots`), Animal Companion (a
summoning bonus) and Warlord's Presence (its trait statuses).

## Turn structure

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| `extraAttacksPerTurn` | actions a turn = the creature's attacks + extra, at least one | the same, with a species' own actions | Faithful (`turn-structure.test.ts`) |
| `monsterAttacksPerTurn` | a monster class's actions a turn (an owlbear's two, a dragon's three) | the species statistic `actions` | Faithful (`summoning.test.ts`) |
| `randomActions`, `changeAllegiance`, `controlledActions` | confusion, charm, domination | the same | Faithful |
| `extraTurns` | the whole turn again | none | Incomplete (time stop) |

## Effects and targets (mission 7)

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| `randomEnemies` | distinct living enemies, the count read with `parseInt` | distinct living enemies drawn once from the seed for all of a spell's effects and saves; the count evaluated as written | Adapted: `parseInt` reads "2 + round(#level/2)" as 2 and "=1d6 + …" as nothing |
| `summon` | creatures by template, owned by the summoner, at most 3 + ⌊level/3⌋, the oldest sent back; gone when the fight ends | the same, by species, animal kind, ancestry companions, monster class, element or type | Adapted: Kyr draws one kind from all the named classes at once |
| `cast` | another ability performed at no slot cost | the same; an ability casting an unplayable one is unplayable | Faithful |
| `randomEffect`, `cycleEffects` | one effect at random; the next in turn | from the seed; the cycle kept per caster | Faithful; cycle adapted |
| `resurrect` | a fallen ally back with `hpPercent` and `applyTraits` | the same | Faithful |
| `kill` | the target falls; the declared save is never rolled | the declared save is rolled, as a debuff's | Adapted |
| `flee` (on another) | save or flee; a fleeing foe leaves at the next round | the same; it leaves alive, with what it summoned | Faithful |
| Flee (the company's) | an even chance each time (`Math.random() < 0.5`); a failed attempt costs the turn | an even chance the first time, three in four the second, sure the third; and sure in the first round of a fight that fell on the company unwarned and was seen, in which the company acts first | Adapted (Mission 17, PT-10, PT-24): flight failed again and again, and a lone company was killed by what it had no turn to back away from (`the-moment.test.ts`, `engagement.test.ts`) |
| Reactions | `onEnemy<Ability>`, `onEnemy<EffectType>`, casting reactions, `onExpire`, `onHeal`, `onCombatStart` | the same keys, run before the provoking effect lands; a reaction sets off no other | Faithful (`reactions.test.ts`) |
| Electric damage | dealt by content, resisted by no rule | a damage kind resisted only by resistance to all | Faithful |

43 of 354 abilities and 24 of 172 conditions still do not execute; at the start of mission 7 the counts were 89
and 35. Each refuses itself in the catalog and is never offered.

## The bestiary

`bun bin/orsino-registry.ts bestiary` composes Kyr species from Orsino's monster template (`OrsinoMonsters`): 39
monster types by class, 16 elementals by element and 38 animals by kind. Each species grows with level as the
template does: attributes by round(level / 8), and hit points by the class line + CON modifier + 3 a level. Each has
the class's actions a turn and is worth the class's experience + 50 a level. What Kyr cannot play is named in
`omits`. A hand-written species that names the same Orsino source stands in place of the generated one.

## Planes

Orsino's planes carry `globalEffects` that every resident holds. In Kyr a place may declare `law(place, law)`, where
the law names a catalog condition; everyone in a fight there holds it. Planes are places of kind `plane`, reached by
portals: passages with access conditions (knowledge, sunlight, a seal). Orsino's ten planes and planeshift remain
data.

## Ancestry, class, background and equipment

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| Attributes | 3d6 per score, plus the ancestry's, class's and background's modifiers | same | Faithful |
| Backgrounds | 215 in `backgroundModifier`: modifiers, gold, a required class, starting gear | 24, hand-copied, with Kyr's skills, offers, routines and contacts added | Incomplete; to become a Deem table (mission 6, B) |
| Ancestry traits | birth traits and lineage | executed, with environment perks now conditional | Faithful |
| Weapons | damage, type, weight, missile, intercept | the same, now including weight | Faithful |
| Spell slots and preparation | slots by level; prepared spells | the same; changing a prepared spell takes an hour (`prepare_spell`) | Adapted (Orsino prepares at rest) |

## What would change these judgements

The registry check (`bun bin/orsino-registry.ts check`) refuses a catalog entry translated as executable if any of
its features is judged unsupported. A new Orsino revision must pass that check before it can be adopted.
