# Checkpoint C: Orsino's mechanics in Kyr

Status: complete. The behavioural changes in §4 were written before any recorded history was re-recorded.

## 1. What is now executed, and where it comes from

| Concern | Orsino source | Kyr |
|---|---|---|
| Species and class | `pc` template; monsters have no class | `Creature.classId` is optional. A person has an ancestry and a class; a species creature has none, and the schema rejects either mix. |
| Ancestries | `racialModifier`, `traits` table | Attribute modifiers, class options, forbidden traits; `humanoid` and racial traits are given at birth (no longer optional). |
| Classes | `classModifier`, `abilities`, `weapon`, `armor` tables | Seven classes plus Kyr's commoner: hit die, attribute modifiers, class abilities, starting weapon and armour drawn from the tables, proficiencies, specialization choices, spell slots. `fighter` and `magic_user` are aliases of `warrior` and `mage`. |
| Scores | `str: =3d6`, overlays add | 3d6 each, plus ancestry, class and background modifiers. Kyr's +2 to a "primary" score and its cap of 18 are gone. |
| Modifier | `Fighting.statMod` = round((s − 10) / 2) | Same. Kyr had round((s − 10) / 3). |
| Hit points | pc: hitDie + max(0, CON mod); npc: max(2, round(hitDie + (L − 1)·hitDie/2 + CON mod)) | Same (the npc formula for anything created above level 1). |
| Spell slots | `maxSpellSlotsForCombatant` | Same; Kyr's mana is the slot pool and every spell costs one slot. |
| Specialization | `chooseTraits` (one of `traitChoices`, minus forbidden) | Same; chosen, or drawn from the seeded stream when not given. |
| Spell selection | `pickInitialSpells` | Cantrips of the school/domain; 3/2/1 picks at levels 1–3, the first of each level within the school/domain. Validated when given, drawn when not. Only executable spells are offered (see §3). |
| NPC spells | `Combat` set-up for enemy casters | People of modules prepare: every cantrip of the tradition plus min(6, 2 + ⌈L/2⌉) spells of the school/domain up to ⌈L/2⌉. |
| Spell level gate | `actionIsValid`: ability.level > ⌈L/2⌉ is invalid | Same, in combat and in the field (`canCast`, field use). |
| Proficiency | `Inventory.isProficient` when equipping or buying | Same for equipping: `proficient(member, itemkind)` is a projected fact `equip_item` requires. Starting gear is not checked (as in Orsino). |
| Attack roll | `Fighting.attack` | THAC0 = 20 − ⌊L/2⌋; AC = 10 − armour ac + `ac` effects − DEX mod; to-hit = STR (melee) or DEX (missile) mod + `toHit`; natural 1 misses; critical range 20 − `criticalRangeIncrease`; evasion roll. |
| Weapon damage | `Fighting.attack`, `handleAttack` | Weapon die + critical bonus + positive STR/DEX mod + `bonusMeleeDamage`. Melee or ranged is offered from the equipped (or natural) weapon. |
| Hit pipeline | `Commands.handleHit` | `bonusDamage`, resistance (`resistAll` + kind; negative amplifies), `damageReduction`, temporary hit points, death save at DC 25 (survive at 1), damage-kind triggers (save DC 15 or gain the status), `onAttacked`. |
| Saves | `handleSave` | d20 (+`allRolls`) + attribute mod + level + `saveVersus<Kind>` + `saveVersusAll`; immunity; three successes per kind per encounter. |
| Spell resistance | `AbilityHandler.perform` | Offensive spells with save-for-half/negate: each target saves vs magic at 15 + `bonusSpellDC` first; saved targets take half or nothing and ignore the spell's debuffs. |
| Debuffs | `handleSingleEffect` | DC = `saveDC` (15) + caster level + `bonusSpellDC`, against the effect's or status's save kind. |
| Effect order | `perform` | Effects in order across their targets; the first effect that takes hold on no target ends the ability. Amounts roll per target. |
| Rounds | `Combat.round`, `turn` | Initiative each round (d20 + DEX mod + `initiative`); untimed conditions tick at round start; cooldowns tick at the turn; `noActions` loses the turn; turn-end effects after acting. |
| Control | `compelNextMove`, `forceTarget` | A compelled creature must use the ability; a taunted one must target its taunter. |
| Hooks | `onAttack`, `onAttackHit`, `onMissReceived`, `onAttacked` | Executed for conditions and equipment (riposte, hidden, poisoned blade, hunter's mark, Longsword of Flames). |
| Tie-breaks | — | The automatic controller ranks by score, then the ability's position in the actor's own list, then target id. Catalog order no longer matters. |

## 2. How the catalog is built

`bun bin/orsino-registry.ts catalog` translates the registry snapshot into `data/catalog/orsino/` (abilities, conditions,
items, traits, blessings). An Orsino key Kyr does not execute is recorded per entry: under `unsupported` (the entry is
represented but never offered) or under `omits` with a reason (the entry stays executable). Hand-written entries in
`data/catalog` override a generated one only by naming the same Orsino source.

## 3. Design ambiguities and deliberate departures

**Inconsistencies in Orsino itself, reproduced or flagged rather than repaired**

1. *Rangers know Heal Ally.* Orsino's ranger ability list includes `heal`, the fifth-level divine spell. A ranger
   knows it from level 1 and can cast it only from level 9. Kyr does the same; the elf ranger's "heal" is no longer
   offered in or out of combat until then.
2. *`electric` is not an Orsino damage kind.* Five spells and `lightning_breath` use it; Orsino runs them with no
   resistance applying. Kyr marks them not executable instead of mapping them to lightning.
3. *Saved-against-spell leaks.* Orsino resets `_savedVersusSpell` only for spells with save flags, so a stale success
   can skip a later spell's debuffs. Kyr resets it for every spell.
4. *Escape inverts its save.* The monster Escape skill uses a fear-style save, so succeeding makes the escape fail.
   Kyr uses Orsino's player Flee (an even chance) for every creature that flees.
5. *`consumeOn` is never executed.* Kyr follows Orsino: a poisoned blade lasts its three rounds.
6. *Starting armour outside proficiency.* Rangers can start in chainmail and clerics in splint or chainmail, which
   their armour proficiencies exclude. Orsino checks proficiency only when equipping or buying; Kyr does the same.
7. *Weapons without a kind.* The Longsword of Flames has no weapon kind, so only warriors (all weapons) may wield it.
8. *Durations that disagree with descriptions.* Resist Fire says "for 5 rounds" but sets no duration, so Orsino's
   default of 3 applies. Kyr applies 3.
9. *Random choices.* Spillover, cascade and Flee use `Math.random`; Kyr draws from the seeded stream.

**Where the rules are incomplete and Kyr chose**

10. *Spell picks Kyr cannot execute.* Kyr offers only executable spells. Where a school or domain has no executable
    spell at a level (for example abjuration at level 2, divination, chaos, storm), the "first pick within the school"
    rule opens to the whole tradition. Orsino would have offered a spell Kyr cannot cast.
11. *`allRolls`.* Kyr adds it to every d20. Orsino may also add it to damage dice rolled through Deem's roll hook.
12. *World time.* Orsino has no world clock. Kyr's persistent conditions (poisoned, bleeding) tick with the world
    clock outside encounters, without the encounter's death save or damage-kind triggers.
13. *People of modules are NPCs.* They prepare spells by Orsino's enemy-caster rule; player characters choose.
14. *A person created above level 1* has Orsino's NPC hit points; there is no level-up yet (§6).
15. *Fireproof, poisoned and bleeding persist.* Kyr keeps these as world conditions beyond an encounter; Orsino's
    statuses end with the fight.

**Not executed, and recorded as such**

- Class starting gold, item proficiency for consumables, and the starting kit. Classes are therefore "represented" in
  the ledger.
- Status features: allegiance changes, controlled and random actions, reflection, reactions to enemy abilities
  (`onEnemyCharge`), extra attacks or turns, `noStatusExpiry`, `onKill`, `onExpire`. 25 of Orsino's 141 statuses, and the
  abilities that apply them are represented, not executable. Among class abilities this removes Set Spear, Charm,
  Deactivate Device and Call Animal Companion.
- Effects: cast, random effects, cascade, resurrection by percentage, summons of generated creatures, item creation.
- Monsters' attacks per turn (the dragon's three), and Orsino's animal and NPC stat lines.

## 4. Behavioural changes and re-recorded histories

Every change below follows from an Orsino rule in §1, so a history recorded before it encodes the old Kyr rule.

| Change | What players and histories see |
|---|---|
| statMod ÷ 2 instead of ÷ 3 | Every modifier roughly 50% larger: hit, damage, saves, hit points. |
| 3d6 straight, plus ancestry, class and background modifiers | Different scores for every generated creature; no score above 18 only by luck. |
| Orsino hit points and spell slots | A level-1 warrior has 12 + CON; a cleric has 5 + level + WIS slots. |
| Class kits are Orsino's | Kyr's Riverland techniques, wounding blow, venom and mend wounds are gone. |
| Melee or ranged from the weapon, against armour class | Attacks miss. A first-level company needs 22 or more to hit Orsino's red dragon (AC −3), so it cannot hit at all. |
| Defend is AC −2 for the round | Guarding no longer halves damage. |
| Initiative every round | Turn order changes every round; it is not speed. |
| Additive resistances and per-hit bonus damage | Fire against a fireproofed company: the dragon's +3 bonus damage applies before the 50%. |
| Death save at 25 | Rarely matters at level 1 (unreachable without bonuses). |
| Damage-kind triggers | Every surviving weapon hit asks for a save against bleed, shred or stun; fire against burning. |
| Effects stop at the first failure | A trap whose first effect is saved does nothing more. |
| Flee is an even chance, and only for the player's side as a menu choice | Retreat can fail. |
| Ids of named items and abilities | `fire_breath` is `breathe_fire`; `bite` is a weapon; `fighter` is `warrior`. |

**Red Crag histories, re-recorded.** The fire history (fireproof the company, fight, run) cannot be played as
recorded: under these rules the dragon kills the company before the old "run after the bite" condition is met. The
history now runs after the breath. The breath kills Elen outright through her salve (4d6 + 3, halved: 12 against
her 12 hit points); the rest flee. The theft and tribute histories involve no fight and change only where creature
generation changed.

## 5. Random-sequence coupling

Kyr is deterministic: the same seed and commands reproduce the same history. But a history's random draws are not
isolated from unrelated changes. Measured on the Serewater March:

1. **Every resolved action advances a shared counter that seeds later rolls.** Combats and hazards are seeded with
   `campaign seed : encounter counter : action`. Buying, taking, giving, equipping, resting and field casting all
   advance the counter. Passing one rope between companions before the hound fight changed who acted first, every
   roll and the damage dealt.
2. **Seeds contain entity ids.** Renaming an installation (`world` to `hill`) changes every hazard and combat seed in
   it, even with identical content. The boar did not change the fatal-hazard test in Checkpoint B; the rename did.
3. **One stream per battle.** Initiative, attacks, saves, triggers and damage draw in sequence. Any rule that adds a
   roll (a new trigger save) shifts every later roll in that fight.
4. **One stream per creature at creation.** Name, scores, class, specialization, spells, weapon and armour draw in that
   order. Choosing spells instead of drawing them changed a cleric's starting weapon and armour. Growing the spell
   catalog changes drawn spells, and so everything after them.
5. **Isolated.** Each creature has its own generation seed (`… :module:<installation>:creature:<id>`), so adding a
   person to a module does not change anyone else. The automatic controller's choices no longer depend on catalog
   order.

Consequence: a golden history is a regression test of the whole stack, not of one rule. Re-recording is needed after
any change that adds, removes or reorders a draw. A redesign (named streams per subsystem, derived per event) belongs
to the generative-kernel work.

## 6. End-to-end playthrough of the Serewater March

Two fresh runs through `PlaySession`, the same engine Mono drives, with the default company (Elen elf ranger,
Bran human warrior, Dori dwarf vitalist cleric). Scripts and logs are in `doc/playtests/checkpoint-c`.

**Run 1, by the drain** (`drain-route.log`). Preparation at Nera's and the shrine; past the boar with woodcraft;
through the culvert; padlock, pry bar and harness; Ash fought in the gallery (one round: Elen's critical, then Ash's
death save fails); Pell levered free and escorted home by the long way; Wren's reward; a night at the Oar. Edda's
permit ran out (watch 39) before the company reached the foundry yard, so the bearing stayed undelivered.

**Run 2, by the ridge** (`ridge-route.log`). The salvage office now says where Edda is and when her permit ends.
The company met her first, took the commission, fought Ash over two rounds (a miss, a sweep, the hound's rending bite
on Elen, Dori's finishing blow), freed Pell, took the bearing, climbed the hoist scar on Elen's harness and delivered
it at watch 32 for six coin.

**Mechanically correct, as observed**

- Scores, hit points and slots follow Orsino (Elen DEX 22: 3d6 plus elf, ranger and hunter modifiers).
- Elen knows Heal Ally and is never offered it, in combat or in the field; Dori's Cure spells are offered in the field.
- Initiative is rolled every round; attacks show THAC0, armour class and to-hit; a sweep's prone debuff is saved;
  piercing and slashing hits trigger bleed and shred saves; the death save at 25 fails even on a natural 20 at level 2.
- Hesta refuses service once she has seen Ash attacked; the escorted Pell is reunited with Wren; Edda pays only
  before her deadline.

**Player-facing problems found, and what was done**

| Problem | Status |
|---|---|
| Every action repeated every discovery already made ("a tram crawl runs…") | Fixed: only facts learned by that action are reported. |
| Discovery and journal text showed raw placeholders ("{salvage__permit} covers {salvage__prize}") | Fixed: rendered. |
| Resting reported "recovers 0 HP", "gains 0 mana" and "loses bleeding" for everyone | Fixed: nothing happened, nothing is said. |
| Nothing in town said where the salvager was or when the permit ended | Fixed: the salvage office says so. |
| An escorted person who cannot climb is silently left behind when the company climbs | Open: Pell takes the long way; the player is not told. |
| The choice list offers every equipped item for giving and setting down, and one row per stock unit | Open (presentation). |
| Trigger saves (shred, bleed, burning) appear without explanation | Open (presentation). |
| A first-level company cannot hit Orsino's red dragon at all | Faithful to Orsino's monster template; a balance question for the next mission. |

## 7. Not done in this checkpoint

- Level-up (Orsino's experience thresholds, hit-point growth, score increase, new spell and feats every fifth level).
  Kyr still spends experience on training.
- Spell picks for a mage or cleric at creation are chosen in the manifest or drawn; Mono offers the specialization
  but not the individual picks.
- Monsters' extra attacks per turn; Orsino's animal and NPC stat lines; the status features and effects listed in §3.
