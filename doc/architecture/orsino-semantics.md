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
| Experience curve | table | same table | Faithful (`advancement.test.ts`) |
| Hit points | hit die + Constitution modifier, at least 1 | same, plus `onLevelUp` perks | Faithful |
| Qualities | a point of any quality per level | `raise_quality`, spent in the field | Faithful |
| Spells | a specialist picks a new spell of its school or domain | of its tradition | Adapted (documented in `Advancement.learnable`) |
| Feats | at levels 5, 10 and 15: a class feat of that level or below, not held, not ruled out by one held | the same: `take_feat` is offered after the level is taken under a roof; granted abilities are added; the store refuses any other change | Faithful |
| Exclusive feats at creation | `incompatibleWith` | refused at creation ("rules out") | Faithful |

Tests: `test/advancement.test.ts`, "a feat at the fifth level".

Three of Orsino's ten feats do not execute:

- Focused Casting needs `bonusSpellSlots`.
- Animal Companion needs summoning.
- Warlord's Presence needs `onCombatStart`.

## Turn structure

| Rule | Orsino | Kyr | Status |
|---|---|---|---|
| `extraAttacksPerTurn` | actions per turn = the creature's attacks + extra, never fewer than one | the same, for creatures of one attack; a hasted creature acts twice before its turn ends | Faithful (`test/turn-structure.test.ts`) |
| `randomActions` | a random action from the valid ones, for player and enemy alike | the creature falls on one of its legal commands; the player is offered only that one, and the log says why | Faithful |
| `changeAllegiance` | the creature's allies and enemies swap; a player character so affected is no longer player-controlled | the same: only the turned creature's own view flips | Faithful |
| `controlledActions` | control flips to the other side | the same: a dominated foe is the player's to command | Faithful |
| `extraTurns` | the whole turn again | none | Incomplete (1 status) |
| multi-attack monsters (`monsterAttacksPerTurn`) | a monster's base attacks | one | Incomplete (10 monster classes) |
| summoning | `summon` adds combatants for the encounter | none | Incomplete: 16 abilities, 1 formation, 1 feat |
| `cast` / `onExpire` | an effect casts another ability | none | Incomplete: 20 entries |
| reactions (`onEnemyCharge`, `onEnemyMelee`, `onEnemyAttack`, `onAttacked`, `reflect*`) | hooks run on another creature's action | `onAttack` hooks only | Incomplete: about 15 entries |

With these, haste, slow, confusion, insanity, charm and domination run. 92 of 340 catalogued abilities and 35 of
162 conditions do not execute; before the turn structure the counts were 127 and 41. Each refuses itself in the
catalog (`unsupported`) and is never offered, so no ability is offered in a form different from Orsino's.

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
