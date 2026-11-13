# Monsters and spells against the Revised 3.5 SRD

**Status:** exploratory briefing, 12 November 2026. This is a read-only comparison of the present catalogs and
runtime with the Revised (v.3.5) System Reference Document. It is not an implementation commission, a balance pass,
or a completed entry-by-entry concordance.

## Question and answer

How much of Westernesse's present monster and spell catalog could become recognisably SRD-accurate by changing data,
and how much depends on mechanics Kyrie cannot represent?

The short answer is that simple harm, healing and temporary conditions can often be brought closer by changing a few
numbers. Most distinctive monsters and many utility, control and high-level spells cannot. Westernesse currently
adapts Orsino's game, not the SRD: Orsino supplies broad monster chassis and a spell vocabulary that often borrows an
SRD name while changing its level, targets, scaling or effect. A catalog entry marked `faithful` means faithful to
that Orsino source.

The most useful division is therefore not *accurate/inaccurate*, but:

1. **Retune:** the runtime already expresses the important effect; data can make it a closer adaptation.
2. **Compose:** the pieces exist, but the entry must be rebuilt from them rather than merely retuned.
3. **Extend:** a reusable rule is missing from the engine or schema.
4. **Reimagine:** exact SRD behaviour would import a subsystem at odds with Westernesse's combat or world model; keep
   the creature or spell as an analogue and state the departure.

## Baseline and scope

This briefing uses the Revised 3.5 SRD as the baseline. Fortitude, Reflex and Will saves, nine spell levels, many
spell names and monster names all point to that lineage, although Westernesse deliberately combines it with
descending armour class and other old-game conventions. The surviving original Wizards download is inconvenient;
the [archived SRD conversion](https://github.com/olimot/srd-v3.5) identifies and links the original documents, and the
[Hypertext SRD monster index](https://www.d20srd.org/srd/monsters/) provides a navigable copy.

This is a rules comparison, not legal advice. Beholder, mind flayer, yuan-ti and several other names were designated
Product Identity and do not occur as open SRD monsters; the [Hypertext SRD FAQ](https://www.d20srd.org/faq.htm) lists
them. Westernesse's `discerner` and `mind_destroyer` are consequently best judged as analogues: whether they preserve
the play identity of their inspirations without copying the protected identity, not whether their names and text
match an SRD entry.

The inspected Westernesse sources are:

- `data/catalog/monsters.json`, 54 monster species;
- `data/catalog/abilities.json` and `data/catalog/orsino/abilities.json`, 291 spell records between them;
- `data/catalog/conditions.json` and `data/catalog/orsino/conditions.json`;
- the `Species`, `Ability`, `Effect`, `Condition` and `Modifiers` types and their runtimes.

Of the monsters, 41 call themselves adaptations of Orsino and 13 are unlabelled or Kyr-authored. Of the spell
records, 278 are marked faithful to Orsino, nine adapted and four unlabelled. Twelve generated Orsino spell records
have an empty typed effect list and explicitly say Kyr can execute no effect; at least 32 spell records declare some
unsupported semantics. These counts describe raw records, not unique resolved abilities: a Kyr record can override or
supplement a generated Orsino record, and Kyr's own compact `effect` strings are parsed into typed effects at load.

## What the runtime can already say

The present effect language is deliberately small but useful. It can express:

- weapon attacks and typed damage;
- healing, revival, direct death and level drain;
- a saving throw which negates an effect or halves damage;
- conditions for a fixed number of turns, world-time units, or until removed;
- one target, allies, enemies, both parties, or a fixed/random subset;
- a cone or burst placed in the current rank-based positions;
- chained `cast`, random and cycling effects;
- summoning from a species or list of species;
- daily uses, recharge, wind-up and a required preceding condition;
- multiple actions and a sequence of natural weapons;
- percentage resistance, immunity, damage reduction and ordinary combat modifiers;
- hooks at a bounded set of combat moments.

This makes a good substrate for a Westernesse adaptation. It does not make Kyrie a 3.5 combat engine, nor should
numeric similarity be mistaken for behavioural fidelity.

## How an ability actually runs

The important boundary is not the JSON record by itself. A spell or monster power passes through six representations
and decisions before it changes the game. The following is the present workflow, with the concrete constraints each
stage imposes on an adaptation.

### 1. Catalog records become runtime abilities

An `Ability` in `data/catalog` may contain either a compact `effect` sentence or an already typed `effects` array.
`CanonRuntime.ability` lowers both into an `ArenaAbility`. A compact sentence is parsed by `Abilities.ohm` and
`AbilityParser`; a typed array bypasses the grammar and is validated later.

The compact grammar is intentionally much narrower than the TypeScript effect union. It can say:

```text
Deal 2d6 fire damage to enemies unless reflex save against (15 + #level).
Apply fear to enemies for 2 turns unless wisdom save against 12.
Remove poisoned from ally.
Summon wolf for self.
```

It cannot say “after an attack hits,” choose an area shape, attach a trait filter, halve damage on a save, select a
random subset, set daily uses, or express nested random/cycling effects. Those are possible only in the typed JSON
form because `Effect`, `Save` and `ArenaAbility` contain fields the prose grammar does not expose. This distinction
matters when estimating a mitigation: some gaps need only a typed record; others require extending the runtime; only
author-facing syntax needs a grammar change.

`CanonRuntime.abilities` drops every ability whose record has an `unsupported` object. It does not inspect whether
the unsupported piece is peripheral or defining. Thus Dispel Magic is absent from the runtime rather than a legal
spell which visibly fails. Conversely, a condition with `unsupported` is dropped from `Content.statuses`; any
otherwise retained ability which applies it will fail validation when the battle loads. “Catalogued” therefore does
not mean “playable,” and the resolved runtime—not raw JSON—is the right object for the concordance.

### 2. A creature receives a detached combat projection

`CombatProjection.fighter` copies the persistent creature into a `Fighter`: scores, effective level after level
drain, HP, mana, slots, learned and item-granted abilities, conditions, equipment, traits, variations and daily uses.
A species creature's base abilities are marked `innate`, which lets it use a record classified as a spell without a
prepared slot. The fight mutates this detached projection and `Battle.commit` writes the persistent portions back.

This explains two adaptation limits. First, a condition can currently preserve only `id`, remaining duration,
source, applier, clock, temporary HP and a one-turn timing flag; it cannot carry a chosen polymorph form, a
concentration dependency or an aura origin. Second, effective statistics are reconstructed from base scores plus
ordinary modifiers. There is no projection layer for “be a wolf until this condition ends,” so the present
`polymorphed` condition has no way to do what its name promises.

### 3. `Battle` constructs the legal commands

At a creature's turn, `Battle.usable` filters known abilities by:

- ready spell slot, innate casting or mana/daily affordability;
- cooldown;
- the rule that an ability's level may not exceed `ceil(actor.level / 2)`;
- `noSpellcasting`;
- one required or forbidden status;
- an intercepting-weapon requirement;
- an available carried item.

`Battle.commandsFor` then derives targets. An effect which says `enemy`, `ally` or `dead ally` produces one command
per eligible fighter. An ability with no individually selected target is aimed at the actor unless it has a cone or
burst, in which case it is aimed at one occupied enemy zone. Trait restrictions are filters on fighters. There is no
place here to spend a Hit Dice budget, choose four willing creatures, select an unattended object, aim at an empty
zone, or reserve concentration. Those are targeting/legality gaps, not damage-interpreter gaps.

If no command remains, the creature waits. This is good: unfulfillable target restrictions do not produce a button
which fails after commitment. New selectors should preserve that property.

### 4. `Battle.step` owns turn structure and expenditure

`Battle.step` rejects any command not produced by `legalCommands`. It handles a monster's declared wind-up, then
calls `AttackRoutine.strike`, which may invoke the ability more than once for a natural attack routine. After the
ability resolves it spends a carried item, checks retreat and battle end, and lets a creature with remaining actions
act again. `extraAttacksPerTurn` is therefore real: Haste's condition gives an additional action, and the battle loop
honours it.

Turn-end periodic effects then run. At a new round, ordinary encounter conditions lose one remaining turn and expire;
world-time and owner-turn conditions are advanced elsewhere by their corresponding clocks. A condition applied by
another creature after its target has already acted receives `waits`, preventing it from expiring before it has
affected one target turn. These are substantial, correct lifecycle semantics already present and should be reused,
not replaced by a second duration system.

### 5. `AbilityUse.perform` pays once and resolves an ordered list

`AbilityUse.perform` validates effects and affordability, spends the spell slot/mana/daily use, records the action,
and resolves effects in their authored order. It has two distinct save mechanisms:

- ability-level `resist` gives every hostile recipient one category save before any effects; an effect may then use
  `onResist: "half"` or `"negate"`;
- effect-level `save` rolls when that particular effect is reached; success normally negates, or halves damage when
  `save.success` is `half`.

These are saves, despite the first field's name. Neither is 3.5 spell resistance, which is a caster-level check made
by the spellcaster against the target's defense.

Effects share a random draw through `context.drawn`, so one spell's several effects land on the same randomly chosen
creatures. Area recipients are recalculated from the chosen zone through `Positions.caught` and may include allies.
Resolution stops when the first effect succeeds on no target. This last rule is significant: an attempted attack
followed by a separately authored poison effect would already stop after a miss, but it would also apply poison after
any successful attack only by relying on list order and shared target. It cannot express several attacks followed by
Rend only if two hit, nor distinguish “attack succeeded” from “the preceding non-attack effect did something.”

### 6. `AbilityUse.effectOn` handles saves, reactions and compound effects

Before a hostile effect lands, opposing conditions may react through `Reactions.provoke`. An attack uses the ordinary
THAC0/armour/evasion roll and, on a hit, weapon damage plus attack hooks. Random and cycle effects choose one nested
effect; `cast` invokes another ability for free. Other effects evaluate an amount, apply an ability-level resisted
result, roll their own save if declared, and dispatch to `Effects.apply`.

This interpreter already supports several behaviours which the earlier summary made sound absent:

- **Invisibility does end on an attack or offensive spell.** The `invisible` condition defines `onAttack` and
  `onOffensiveCasting` hooks which remove itself. `AbilityUse.attack` fires the former before its roll and
  `Reactions.cast` fires the latter after an offensive spell. The current gap is not conditional expiry in this
  example; it is that the mechanism is an indirect hook convention, has no general source dependency or suppression,
  and lacks a focused test that both expiry paths occur.
- **Haste changes combat.** Its modifiers add Dexterity, initiative, AC and `extraAttacksPerTurn`; `Battle.step`
  consumes the extra action.
- **Charm changes allegiance.** `Targeting.candidates`, command control and tactics read `changeAllegiance`.
- **Maze is only partial.** `mazed.noActions` makes the target skip turns, but the unsupported `untargetable` part is
  dropped, so it is still present and attackable if the condition were admitted.
- **Time Stop is inert.** `timestopped` has no executable modifiers; its extra-turn semantics are explicitly
  unsupported, so the condition is excluded from runtime.
- **Polymorph and Shapechange are inert.** Their conditions contain no executable modifiers and list their defining
  statistic/form changes as unsupported.

This is the distinction the rest of this briefing should preserve: Invisibility is an implemented rule which may
need generalisation and tests; Maze is a lossy approximation; Time Stop and Polymorph are unimplemented promises.

### 7. `Effects.apply` changes only a bounded set of state

The effect dispatcher can defend, flee, damage, drain and heal HP, revive, kill, drain levels, apply or remove a
condition, restore a resource, teach an ability, summon a fighter or set a combat travel destination. Damage then
passes through bonus damage, percentage resistance, flat damage reduction, temporary HP, the death save, damage-type
condition triggers and `onAttacked` hooks.

An applied condition is a reference to a catalog condition plus duration/source metadata. `Effects.modifiers`
recomputes its mechanical meaning from all active conditions, traits, equipment, species resistances and variations.
This is elegant for additive facts—AC, saves, extra actions, invisibility—but cannot replace the fighter's weapon,
species, ability list or location. That is why transformations need a projection mechanism rather than more modifier
keys.

### 8. Positions are three zones, not unmodelled altogether

`Positions` places combatants in the company's rear, the press, or the opposing rear. A burst catches one zone; a
cone covers the zones between source and aim, excluding the source's own rear companions and including friend and foe
elsewhere. This already gives Fireball and breath weapons meaningful friendly fire and placement.

The gap is narrower than “no geometry”: there is no line distinct from a cone, no empty-zone aim, no persistent wall
or cloud, no movement action between zones, and no reach/movement-mode rule. Mitigation should extend this topology
rather than introduce feet or a square grid.

### 9. Events are the account and extension seam

Every resolution writes typed `CombatEvent`s for the action, attacks, saves, damage, conditions, removal, expiry,
reactions and battle end. Presentation formats these events; it does not need to infer the rule from prose. Any new
spell-resistance check, aura entry, concentration loss, defense bypass or transformation must add an event which says
what happened and why. If a proposed mechanic changes a number but cannot be distinguished in the event trace, it
will be difficult to explain, forecast or verify through the page.

## Changes which are chiefly data

These changes need authorship and tests but no new primitive:

| Present content | Closer adaptation available now |
|---|---|
| Fixed monster attributes and hit points | Use the SRD scores and listed average HP directly; disable accidental procedural growth |
| One generic natural weapon | Name an `attacks` sequence such as claw, claw, bite |
| Damage or healing spell | Change level, dice, damage kind, target, save and area |
| Save-negates condition | Use the corresponding condition and Fortitude, Reflex or Will save |
| Breath weapon | Use a cone or burst, typed damage, save for half, and daily use/recharge |
| Energy immunity or percentage weakness | Put it in species `resistances` or a nature trait |
| Paralysis, charm, sleep, fear, invisibility | Apply the existing executable condition with the intended duration |
| Limited spell-like power | Make it a natural ability with uses/recharge rather than a prepared spell |

Likely first candidates are the chimera, ghoul, wraith and pegasus. A chimera can have its claw/claw/bite routine and
one proper breath weapon instead of Fireball and Lightning Bolt. A ghoul can keep claws and a paralyzing attack while
losing the generic undead package of Curse, Fear, Life Drain and Regeneration. A wraith already has approximations of
incorporeality and level drain. A pegasus needs authored rather than rolled scores, flight, hoof attacks and charge.

Straight damage and healing spells are also the cheapest spell work. Burning Hands, Fireball, Cone of Cold and the
Cure family all fit the current effect vocabulary. Caster-level scaling needs a policy (see below), but a bounded
Westernesse formula can be written today with Deem expressions.

## Existing pieces which need recomposition

Several entries look close only because their names are familiar. They can be made recognisable from existing pieces,
but not by changing a constant:

- **Chimera:** the current generic beast chassis has Maul, Charge, Rage and Poison Bite in addition to two wizard
  spells. Its identity should instead be its several natural attacks and one colour-dependent breath weapon.
- **Ghoul:** paralysis is present, but regeneration and generic spell-like undead powers produce a different monster.
- **Wraith:** incorporeality and drain are present, but its ordinary claws, armour and generic curse/fear suite need a
  coherent conversion.
- **Unicorn:** charge and healing exist. Its current `dr` and `resist` fields are not in `Species` and no runtime reads
  them, so they are inert data. Some defenses can be translated into executable traits or `resistances`; its aura,
  teleportation and wider spell-like suite cannot all be.
- **Discerner:** random or cycling rays, saves and most individual ray results are expressible. Its defining antimagic
  cone and the directional choice between cone and rays are not.
- **Summon Monster:** summoning works, but each present spell chooses from broad Westernesse type lists rather than an
  SRD summon table, and the first spell is itself second level.

This middle class benefits from an explicit adaptation sheet per entry: source identity, behaviours to preserve,
Westernesse conversion, intentional omissions and a play test. Copying an SRD stat block field by field would produce
dead data and misleading fidelity.

## Missing reusable monster semantics

The following are not data adjustments. Some could be compact, reusable extensions; others would change the game's
combat model substantially.

| Missing concept | Consequence |
|---|---|
| Hit Dice by creature type, BAB and per-creature base saves | SRD attack, save and advancement numbers have no direct home |
| Size, space, reach and grapple | Grab, constrict, swallow whole, rake and many large-creature identities collapse |
| Movement rates and modes | Land, fly, swim, burrow and manoeuvrability are mostly descriptive |
| Natural armour apart from equipment | A hide or shell is represented by wearing catalog armour |
| Spell resistance | Spells cannot make the separate caster-level check SRD monsters expect |
| Fixed energy resistance | `fire 10` is unlike the current percentage resistance model |
| Bypassable damage reduction | `10/magic`, silver, adamantine and alignment have no representation |
| Regeneration exceptions | “Regenerates except damage of these kinds” is not the ordinary healing trait |
| Ability damage and drain | Poison, disease and many rays cannot attack attributes |
| Poison stages and disease incubation | One immediate condition substitutes for a longer process |
| Auras, gazes and proximity triggers | Effects generally begin when an ability is chosen, not by presence or sight |
| Trample, overrun and combat manoeuvres | They have no positional or opposed-check substrate |
| Ethereal and planar states | Combat and travel cannot represent entering another coexistence state |
| Templates | Vampire and lich cannot be layered faithfully over a base creature or classed caster |
| Conditional defeat and return | Coffins, gaseous escape, phylacteries and rejuvenation need world-state rules |
| Spell-specific defenses | Golem immunities and exceptions cannot inspect the exact incoming spell |

The absence of CR, alignment, organization, treasure tables, skills, feats and full SRD advancement is less urgent.
Westernesse already has its own worth, temperament, habitats, encounter composition and growth. These should receive
documented conversion policies rather than parallel SRD subsystems unless the design actually needs them.

## Representative monster distance

| Creature | Present implementation | Assessment |
|---|---|---|
| **Balor** | Generic demon with Curse, Terror, Burning Hands and Mass Curse | **Extend/reimagine.** Sword and whip routine, entanglement, defenses, spell-like suite and death throes are absent |
| **Lich** | Generic undead with five powers | **Extend.** Class spellcasting, aura/touch details and phylactery are its identity |
| **Vampire** | Generic undead with charm and drain | **Extend.** Template, grapple/blood drain, forms, gaseous escape, coffin and weaknesses are absent |
| **Golem** | Slam, Smash, Defend and poison immunity | **Extend.** Material bodies, magic immunity, spell exceptions and berserk are absent |
| **Dryad** | Generic fey spell list | **Extend.** Tree dependence and tree stride connect the monster to the world |
| **Nymph** | Generic fey spell list | **Extend.** Blinding beauty, stunning glance and druid casting are absent |
| **Satyr** | Generic fey spell list | **Compose/extend.** Pipes require selectable aura-like results |
| **Pixie** | Generic fey spell list | **Compose/extend.** Persistent invisibility and special arrows need explicit treatment |
| **Xill** | No abilities | **Extend.** Four-armed routine, grab, paralysis, implantation and ethereal ambush are absent |
| **Yrthak** | No abilities | **Extend.** Sonic sense, sonic lance and explosive interaction are absent |
| **Grey Render** | Fear and Charge | **Extend.** Grab/rend and its protective bond are absent |

The later records for Grey Render, Lillend, Pegasus, Unicorn, Xill and Yrthak are particularly misleading as
adaptations: several carry close paraphrases of SRD appearance or behaviour, yet use rolled attributes and omit most
signature rules. Their source currently says they are an author's own creation. They need a provenance and licensing
review as well as mechanics work.

## Spell distance

Many familiar names presently denote materially different spells:

| Spell | Present record | Revised 3.5 relationship |
|---|---|---|
| **Burning Hands** | Level 2, fixed 2d6 to enemies | Level, scaling, area and save need conversion |
| **Fireball** | Level 4, fixed 6d6 to enemies | The SRD spell is level 3 and scales by caster level in an area |
| **Sleep** | Level 3, all enemies for three turns | The SRD spell is level 1 and limited by creature HD in an area |
| **Haste** | Level 5, one ally for three turns | The SRD spell is level 3, affects several creatures and grants several benefits |
| **Invisibility** | Level 6, one ally for three turns; attacking or casting offensively already removes it | Conditional expiry works; level, duration and target policy differ from the SRD |
| **Magic Missile** | Scaling random targets and different dice/count | Broad identity survives, exact missile growth and allocation do not |
| **Lightning Bolt** | Level 4, two random enemies, may paralyze | The line, level, scaling and absence of paralysis are all material |
| **Raise Dead** | Level 4, restores 50% health | Level, eligibility, time limit, costs and consequences differ |

The following generated spell records do nothing executable: Chain Lightning, Dispel Magic, Electric Arc, Major
Image, Minor Image, Plane Shift, Shock Pulse, Weird, Create Poison, Goodberry, Static Shock and Zephyrwild. The
resolved-canon audit should determine which remain visible after Kyr overrides and which are offered in play.

Other spells apply a named condition while omitting what makes the condition meaningful:

- Time Stop has no extra turns.
- Polymorph does not replace statistics, attacks, abilities or item use.
- Shapechange does not replace statistics or natural weapon.
- Maze and similar effects cannot make a target truly absent or untargetable.
- Spell Turning lacks its spell reflection.
- Mind Reading cannot read thoughts.

## Missing reusable spell semantics

The workflow above makes the missing seams more precise:

1. **Declared scaling rather than an arbitrary expression.** The interpreter can already evaluate `#level` in a
   damage or save expression. What it lacks is a separate casting level, an ordinary way to cap it and presentation
   which can say the result at the caster's current level. Fireball can be authored today as an expression, but every
   author would have to invent the cap and rounding convention independently.
2. **More shapes on the existing three-zone topology.** Cone and burst already work and already include friendly
   fire. Lightning Bolt cannot be made accurate because there is no line shape; Blade Barrier and Cloudkill cannot
   occupy a boundary or zone after the casting action has ended.
3. **Selectors beyond relationship and one trait.** Command construction understands one ally/enemy, all of a side,
   random subsets and `targetTrait`. Sleep cannot spend a limited total of target levels; Haste cannot ask for several
   chosen willing creatures; Dispel Magic cannot select a magical condition; Knock cannot select a world object.
4. **Resolution stages beyond saves.** The engine has attack rolls and two forms of saving throw, but an ability
   cannot declaratively require a ranged-touch attack followed by spell resistance followed by a save. The present
   ability-level field named `resist` is itself a target saving throw, not SRD spell resistance. Dispel checks have no
   effect or condition metadata to test against.
5. **Condition dependencies and suppression.** Conditional expiry is not wholly missing: Invisibility already
   removes itself through attack and offensive-casting hooks. What is missing is a common representation for an
   effect depending on its caster, ending when concentration is lost, allowing a new save after a named event, or
   becoming suppressed without being removed. Antimagic and sustained spells need those distinctions. Invisibility
   is evidence that typed combat hooks can implement one case, not evidence that expiry is currently broken.
6. **Field procedures.** The `travel` combat effect only sets an encounter result location; the effect dispatcher
   does not create inventory, reveal knowledge, alter a passage or select a campaign destination. Plane Shift,
   Goodberry and divinations therefore need campaign operations, not another combat modifier.
7. **Persistent consequences other than HP and levels.** `enervate` already implements level drain. There is no
   parallel effect for temporary Strength damage, poison stages, disease incubation or restoration of an attribute.
   Those require persistent creature state and world-clock recovery/removal, not just another damage type.

Components, exact range units and casting times should be lower priority unless the page will let players reason
about them. Adding fields which never affect a choice would repeat the unicorn's inert `dr`/`resist` problem.

## Mitigating the major gap classes

The mitigations below are deliberately smaller than a 3.5 implementation. Each adds one rule Westernesse can explain
to a player and reuse outside the source entry. A field is not a mitigation until it changes legality, resolution or
the account of an action and has a test at that boundary.

### 1. Preserve the SRD combat scale; convert representations, not hit points

**Correction to the first review.** “Convert SRD Hit Dice to Westernesse HP” is the wrong default. Hit points are the
denominator against which weapon damage, spell damage, healing, multiple attacks and encounter endurance were
balanced. If Westernesse imports an SRD longsword's 1d8, a ghoul's claw damage and a Fireball's dice but independently
compresses the ghoul's HP, it has not adapted the balanced stat block; it has made a new one. That may eventually be
desirable, but it should be called a rebalance and measured as such.

Westernesse is already close enough to the same numerical scale that direct use is plausible. Its longsword is 1d8,
dagger 1d4 and greatsword 1d10; its classes range from the mage's d4 to the warrior's d12. Damage and healing are
ordinary integer HP changes. There is no engine limit which requires monster HP to be compressed.

The present mismatch is introduced by monster construction. Most Orsino-derived monsters use
`base + Constitution modifier + 3 × generated level`; fixed attributes also rise with generated level. A creature's
procedural `level` simultaneously affects THAC0, category saves, spell access, innate-spell cooldown and expressions
which read `#level`. Feeding an SRD Hit Dice total or CR into that one field would therefore alter much more than HP
and would not reproduce the source rules.

**Mitigation.** For a named SRD creature, preserve these source values unless a recorded Westernesse rule changes
them:

- listed average hit points as fixed `hitPoints`;
- the source damage dice and number of natural attacks;
- ability scores;
- spell damage, healing and target counts, including caster-level caps once supported;
- energy resistance, DR and regeneration in their actual flat/bypass form once supported.

Also record Hit Dice structurally rather than discarding them:

```ts
hitDice: { count: 2, die: 12, constitutionPerDie: 0, listedAverage: 13 }
```

The exact shape should retain the source expression (`2d12`, or `2d12+3`) and listed average. `maxHp` should use the
listed average by default so encounters remain deterministic; an optional rolled-monster mode could roll the same
expression without changing the schema. Hit Dice then remain available for effects which genuinely depend on them,
such as Sleep, advancement and some save DCs. They must not be reconstructed from `maxHp` or Westernesse level.

Separate at least three concepts which the present `level` conflates:

- **Hit Dice:** the creature's source durability and the budget read by HD-dependent effects;
- **combat progression:** the attack/save progression currently obtained from Westernesse level;
- **encounter rank:** ecology, worth, warnings and encounter composition.

For an initial adaptation, fixed `attackBonus` and per-save bonuses from the SRD stat block are more faithful than
choosing a Westernesse level which happens to approximate one of them. Later, a family of advancing monsters may
derive those numbers from Hit Dice and creature type. CR should inform encounter rank and warnings; it should not
silently become Hit Dice or character level.

The conversion policy is still needed, but only where the representation truly differs:

- ascending SRD AC to descending Westernesse AC, preferably by preserving the d20 hit probability against a stated
  reference attacker;
- full attack entries to `attacks`, actions and on-hit riders;
- square-grid reach and areas to Westernesse's zones;
- source action types to Westernesse turn actions;
- CR and treasure to Westernesse ecology, `worth` and encounter warnings.

Do **not** include an HP multiplier or general damage compression in `srd35-westernesse-v1`. If play later shows that
direct SRD values make every encounter too long or too deadly, inspect the whole ratio: party HP progression, hit
chance, attacks per round, monster damage, spell damage, healing and rest. Change one global rule or declare a
versioned balance profile. Do not hand-tune monster HP until it feels right while continuing to call the result
SRD-accurate.

Direct HP does not by itself inherit SRD balance. Westernesse has different attack progression, critical damage,
initiative, saves, party control and action economy. The useful inherited unit is therefore a combat envelope:

```text
durability = HP after defenses and healing
offense = hit chance × damage on hit × attacks per round
control = expected turns or actions denied
```

Preserving source HP and damage gives that audit an honest baseline. The concordance should show source and
Westernesse values for each term, then attribute every difference to a named rule.

Procedural growth should be disabled for a fixed SRD stat block. A separately named advanced specimen may apply an
explicit advancement rule; ecology must not silently ask for “a level-7 ghoul” and receive new HP, attributes, saves,
spell access and cooldowns from unrelated Westernesse formulas.

Add source metadata along these lines rather than adding unused SRD fields to `Species`:

```json
"source": {
  "srd35": "monster:ghoul",
  "conversion": "srd35-westernesse-v1",
  "fidelity": "adapted",
  "notes": "Uses the listed 13 HP, 2d12 Hit Dice and natural attack routine; adapts paralysis duration."
}
```

`Source` currently cannot name `srd35`; extending it is safe only if catalog validation requires a conversion and
notes with it. The raw reference values belong in the concordance, not in live creature records.

**Acceptance.** A generated report shows source and executable HP, attack dice, attack count, hit chance against
reference defenses, save chances and expected damage per round. Exact copies are visibly exact; every other value
names its conversion rule. A fixture creates the monster through every ecology path and confirms that HP, Hit Dice,
scores and attacks do not change with encounter rank or an accidental second conversion. A short encounter benchmark
compares rounds-to-defeat and expected party harm with the source combat envelope; it reports divergence rather than
automatically normalising it away.

### 2. Separate a creature's body from equipment

**Gap.** A monster's shell, hide and natural attacks are presently expressed through catalog weapons and armour.
This works numerically, but a golem wearing plate or a wraith wearing cloth gives the wrong answers to disarming,
equipment, narration and any future effect which distinguishes natural from manufactured protection.

**Mitigation.** Add `naturalArmor` to `Statistics` in the same descending-AC units as armour, and make combat choose
the better applicable protection rather than silently stacking it. Keep `armor` only for an actually equipped item.
Natural weapons are already marked and `attacks` already names their sequence; validate that every species attack is
a natural weapon unless the species explicitly carries equipment.

Do not reproduce touch AC, flat-footed AC and size modifiers as three more stored numbers. If a new action needs to
ignore armour, give the action an explicit attack mode such as `ignores: "armor"`; derive its roll from one rule.

**Unlocks.** Chimera, golem, dragon, unicorn and most beasts become honest bodies. Disarm and equipment changes can
then leave their innate attacks and protection intact.

**Acceptance.** Removing all equipment from a golem does not change its protection or slam. Removing a sword from a
balor removes the sword attack but not its body. The character page calls natural armour hide, scales or the species'
authored term rather than naming worn plate.

### 3. Generalise defenses as typed mitigation with bypasses

**Gap.** The modifier system has percentage resistance, flat untyped `damageReduction` and save-category immunity.
It cannot express energy resistance 10, DR bypassed by magic/material/alignment, regeneration stopped by particular
damage, spell resistance, or a golem's reaction to named spells. The unused unicorn `dr` and `resist` objects are an
example of foreign-shaped data falling through this gap.

**Mitigation.** Replace the single implicit defense path with a small ordered defense vocabulary:

```ts
type Defense =
  | { kind: 'immunity'; to: DamageOrEffectSelector }
  | { kind: 'resistance'; to: DamageSelector; amount: number; mode: 'flat' | 'fraction' }
  | { kind: 'reduction'; amount: number; unless?: AttackTag[] }
  | { kind: 'regeneration'; amount: number; stoppedBy: DamageSelector[] }
  | { kind: 'spellResistance'; difficulty: Amount }
  | { kind: 'spellInteraction'; abilities: string[]; effects: Effect[] };
```

Attack and spell effects then carry semantic tags already known at resolution: damage type, natural/manufactured,
spell, and—only where content needs them—`magic`, material and alignment tags. Resolution order should be explicit:
immunity; spell resistance; resistance/reduction; temporary HP; HP; regeneration eligibility. The event account must
name what prevented or bypassed harm.

This need not replace existing percentage `resistances` at once. Introduce `defenses`, translate the old map to
fraction defenses at canon load, migrate authored species, and remove the compatibility translation only after the
catalog report is empty.

Use `spellInteraction` sparingly for golems and similarly iconic cases. It is a dispatch on canonical ability id,
not a regular expression over a spell's name or description.

**Unlocks.** Unicorn energy resistance and DR, golem magic immunity/exceptions, vampire DR, troll-like regeneration,
and ordinary spell resistance.

**Acceptance.** A table-driven test crosses each defense with a bypassing and non-bypassing attack. Combat narration
says, for example, that silver passed a defense or fire stopped regeneration. Unknown defense keys fail catalog load;
the old unicorn fields must fail rather than remain inert.

### 4. Add combat riders instead of a complete manoeuvre subsystem

**Gap.** Grab, constrict, rend, rake, poison on hit, energy drain on touch and special arrows depend on one attack
landing. The effect language can attack or apply a condition, but has no first-class sequence in which the latter is
conditional on the attack's result. Implementing 3.5 grapple, attacks of opportunity and opposed manoeuvre bonuses
would be disproportionate to a rank-based party fight.

**Mitigation.** Let an attack effect carry `onHit`, `onCritical` and perhaps `onMiss` effects, using the same typed
effects and the original target:

```json
{
  "kind": "attack",
  "target": "enemy",
  "weapon": "bite",
  "onHit": [
    { "kind": "apply", "status": "paralyzed", "duration": 2,
      "target": "enemy", "save": { "kind": "fortitude", "difficulty": "..." } }
  ]
}
```

Add one `held` condition for the Westernesse analogue of grab: no elaborate grapple score, but the holder and victim
are linked; the victim cannot change rank or flee, and either can spend an action on a Strength or Dexterity save to
break it. Constrict is an `onTurnEnd` hook while the link remains. Rend triggers after a declared number of attacks
from one action hit the same target. Rake is extra `onHit` damage while held. Swallow whole should wait until content
needs an interior state; it is not merely a stronger held condition.

**Unlocks.** Ghoul paralysis, wyvern poison, vampire blood drain, grey render grab/rend, xill paralysis and many
animal attacks.

**Acceptance.** One attack roll determines whether its riders occur; a miss never poisons or paralyzes. The event
trace retains parent attack identity. Held has visible legal consequences and an escape action; it cannot survive the
holder's death or the end of combat.

### 5. Model presence effects with a bounded trigger vocabulary

**Gap.** Auras, gaze attacks, frightening presence and an antimagic cone happen because creatures can perceive or
stand near one another, not because the owner spends an ordinary action. Current hooks cover combat start and several
attack/casting moments but not entering a presence, beginning a turn near it, looking at it, or suppressing magic in a
direction.

**Mitigation.** Add only triggers the rank-and-area model can observe deterministically:

- `onCombatStart` against eligible opposing creatures;
- `onTurnStart` for the holder or affected creature;
- `onEnterArea` and `onLeaveArea` when rank/area changes;
- `onSeen` once per observer per encounter;
- `whileInArea`, a derived condition refreshed while the spatial predicate holds.

An `Aura` should name shape, reach in ranks, eligible targets, save cadence (`once`, `onEnter`, `eachTurn`) and effect.
A gaze is an `onSeen` aura with a declared avert action: avert gives the defender the intended protection and a
visible targeting penalty. Without an avert choice, calling a passive save a gaze adds terminology but no play.

The discerner's antimagic is the hard case. Represent it as a cone-shaped `whileInArea` suppression condition which
sets `noSpellcasting` and suppresses effects tagged `magic`; choosing its aim is the discerner's action or stance for
the round. Eye rays may target outside the cone, so the AI must choose cone protection or ray access. Do not implement
antimagic as blanket dispelling: suppression ends on leaving the cone and should not erase durations.

**Unlocks.** Mummy despair, nymph beauty, dragon fear, satyr pipes where they are sustained, and the discerner's main
tactical identity.

**Acceptance.** Trigger cadence is identity-keyed and cannot fire twice because presentation reprojects a fight.
Moving into and out of an aura produces one typed begin/end event. An averted gaze changes legal/odds information
before commitment. A suppressed spell resumes with its remaining duration when suppression ends.

### 6. Treat movement modes as permissions, not measured speed

**Gap.** Westernesse has front/rear combat positions and placed cone/burst areas, not a square grid. Copying SRD feet,
reach and manoeuvrability would not create meaningful movement. Yet flying, swimming, burrowing, incorporeality and
tree stride must affect what a creature can reach or escape.

**Mitigation.** Define movement modes as capabilities over the existing topology:

```ts
movement: {
  modes: ['land', 'fly'],
  shift: 1,
  ignores?: ['front-rank', 'ground-hazard'],
  requires?: ['open-air']
}
```

`shift` is ranks per move, not feet. Modes answer whether a passage, hazard, interception or target is legal. Flight
allows crossing the front rank and ignoring ground hazards, but exposed flyers remain targetable; burrow temporarily
removes ordinary line of attack but must declare where it will surface; incorporeal movement may cross a physical
barrier only where world authoring permits it. Tree stride is a field travel ability between explicitly tree-linked
places, not combat teleportation.

Size should begin as tags (`tiny`, `large`, `huge`) consumed only by authored rules such as interception, carrying,
engulf or passage constraints. Do not introduce space/reach numbers until more than one visible decision depends on
them.

**Unlocks.** Pegasus and pixie flight, dryad tree stride, wraith passage, xill ethereal approach (once an ethereal
mode exists), and more honest dragon breath positioning.

**Acceptance.** Each movement mode has at least one place or combat choice it opens and one it does not. Forecast and
legality use the same predicate. A trait which changes no legal action, target, hazard or account is rejected as
descriptive rather than mechanical.

### 7. Give persistent monsters an anchor in world state

**Gap.** A lich's phylactery, vampire's coffin, dryad's tree and xill's implanted egg are not combat modifiers. They
are relationships between a creature and a persistent thing or place. Treating them as a combat condition loses the
adventure their identity is meant to create.

**Mitigation.** Use existing world identities and rules rather than a monster-only lifecycle engine. A species may
declare a required `anchor` role; creature creation or authored content must bind it to an item, person or place id.
Typed defeat events can then schedule or permit a rule:

```text
anchor: { role: "phylactery", id: item-or-place-id }
onDefeat: become disembodied; return at anchor after N world-time unless anchor is destroyed
```

The exact consequence belongs in Kyr world rules where possible: the catalog supplies the combat event and required
role, while the adventure decides where the coffin is, who knows of it, how it can be destroyed and what changes
afterwards. Generic generated encounters which cannot supply an anchor should not generate an anchored creature, or
should use an explicitly lesser analogue without the return rule.

Templates should likewise be decomposed. A vampire or lich needed for a story is a composed creature with a base
body/calling plus a nature trait and anchor; Kyrie need not support every legal 3.5 template combination. The composed
record must snapshot or deterministically derive the result so reloads do not change it.

**Unlocks.** Lich, vampire, dryad and other monsters whose defeat is an investigation rather than an HP threshold.

**Acceptance.** Defeating the body changes but does not falsely complete the relevant undertaking. Destroying the
anchor is persistent, prevents the return and is visible in the world's account. Save/reload and elapsed time produce
the same scheduled return.

### 8. Standardise spell scaling and duration without importing caster-level bookkeeping

**Gap.** Many SRD spells scale dice, targets or duration by caster level with a cap. Current Deem expressions can use
`#level`, but there is no declared cap, no distinction between caster level and creature level, and no shared rule
for rounding. Fixed Orsino values therefore replace much of a spell's progression.

**Mitigation.** Add `castingLevel` to the ability context, derived initially from effective character level after
level drain. Add expression helpers or typed quantities so every author does not reinvent caps:

```ts
{ kind: 'scaled', base: '1d6', perLevels: 1, maximum: 10, by: 'castingLevel' }
{ kind: 'duration', base: 0, perLevels: 1, maximum: 10, unit: 'turn' }
```

If extending `Amount` is too heavy, standard Deem functions such as `cappedLevel(10)` are sufficient, provided the
generated encyclopedia expands them into plain language and validation rejects raw `#level` in an SRD-converted
spell without an explicit scaling note.

Use Westernesse clocks deliberately: `turn` for encounter effects, world-time units for exploration, and
`until-removed` for durable curses. Do not mechanically convert every SRD round/minute/hour. Choose the clock which
makes the promise and expiry legible in this game.

**Unlocks.** Magic Missile count, Fireball damage, cure bonuses, summons, Dispel Magic checks and many durations.

**Acceptance.** Boundary tests cover level 1, every cap and one level beyond each cap. Spell presentation says the
current result before casting. Level drain changes scaling once, through `castingLevel`, and no generated monster
accidentally uses the target's level.

### 9. Extend targeting and areas through encounter topology

**Gap.** `enemy`, `enemies`, random subsets, cone and burst cannot distinguish a line, emanation, wall, persistent
cloud, willing target, creature type, Hit Dice budget or object. Replacing all of them with “enemies” removes tactics
and often removes drawbacks such as friendly fire.

**Mitigation.** Split *selection* from *area*. A target selector filters candidates; an area determines who is caught
at resolution:

```ts
selector: { relation: 'enemy', traits?: ['living'], willing?: false, maximum?: 4, budget?: { stat: 'level', total: 4 } }
area: { shape: 'line' | 'cone' | 'burst' | 'rank' | 'aura', origin: 'caster', extent: 2, persists?: 3 }
```

Use Westernesse level as the explicit analogue for an SRD Hit Dice budget; never call it Hit Dice in player text.
Lines cross ranks from an origin and catch friend or foe. Walls occupy a boundary between ranks. Persistent zones
re-evaluate on entry and at a named turn phase. Objects and points in the field require separate target kinds rather
than pretending a fighter is an object.

The AI and danger forecast must use the same selector/area calculation as resolution. An area spell is not legally
aimed until at least one aim exists; the page shows who is presently caught, including allies, before confirmation.

**Unlocks.** Lightning Bolt, true Fireball placement, Sleep's limited pool, Blade Barrier, clouds, auras and breath
weapons.

**Acceptance.** Golden tests cover each shape at every rank arrangement, including friendly fire and movement into a
persistent zone. Random target selection occurs once and is replay-stable. The preview and resulting recipient ids
are identical unless an intervening reaction changes positions, in which case the trace names it.

### 10. Make spell resolution a declared pipeline

**Gap.** SRD spells may require an attack roll, then spell resistance, then a saving throw, with different effects on
success. Dispel Magic makes a caster-level check against an effect rather than a creature. Current `resist` is an
Orsino save made before effects and `save` lives on individual effects; the word “resist” risks conflating spell
resistance with saving throws.

**Mitigation.** Give an ability a typed resolution declaration:

```ts
resolution: [
  { kind: 'attack', mode: 'ranged-touch' },
  { kind: 'spellResistance' },
  { kind: 'save', save: 'reflex', success: 'half' }
]
```

Westernesse need not add a full touch-AC column: `ranged-touch` can be the existing attack roll ignoring armour, as
long as that rule is consistent and visible. Each stage filters or annotates the same recipient set. Effects should
refer to the outcome (`when: failedSave`, `when: passedSave`) rather than independently rolling duplicate saves.

Dispel requires effects to carry source ability, caster/casting level, magic tag and remaining duration. Add a
`dispel` effect which selects active magical effects and makes one seeded casting-level check per declared policy.
Removal is then an event naming the dispelled source. Counterspelling is lower priority: add it only when players and
AI can reserve a reaction and identify a spell before it resolves.

Rename or migrate the existing ability-level `resist` to `magicSave` or the general pipeline so it cannot later be
mistaken for spell resistance.

**Unlocks.** Acid Arrow and other rays, Disintegrate, spell resistance, Dispel Magic and eventually counterspelling.

**Acceptance.** One cast produces at most one roll for each declared stage and records the ordered results. A failed
attack performs no later stages; immunity or spell resistance is not reported as a successful Reflex save. Dispel can
remove only effects tagged magical and cannot remove a mundane poison merely because both are conditions.

### 11. Make conditions own their expiry and suppression rules

**Present behavior.** Conditions already have duration, three clock choices, source and applier identity, refresh
semantics, turn-end effects and event hooks. `Battle.round` expires ordinary encounter conditions; `Effects.advance`
advances owner-turn and world-time conditions. The `waits` flag prevents a newly applied hostile condition from
losing a turn before it can affect its holder. Invisibility is specifically implemented: its `onAttack` hook removes
it before the weapon roll, and its `onOffensiveCasting` hook removes it after an offensive spell. Haste's extra action
and charm's changed allegiance are also executable condition modifiers.

**Gap.** The current mechanism handles cases which can be written as a hook on the affected creature. It cannot say
that a condition depends on another creature continuing to concentrate, becomes inactive rather than removed inside
antimagic, allows a new save when its source harms the holder, or pauses/continues its clock while suppressed. A
`ConditionInstance` has nowhere to store such a dependency. Invisibility does not need this mitigation to function;
it is the working precedent which should be preserved and made explicit.

**Mitigation.** Extend a condition instance with its source and a declarative lifecycle:

```ts
lifecycle: {
  expiresOn: ['holderAttacks', 'holderCastsOffensive', 'sourceLosesConcentration'],
  saveAgainOn: ['sourceHarmsHolder'],
  dependsOnSource: true,
  suppressedBy: ['antimagic']
}
```

Map these names to typed combat events, never narration. Concentration is one condition on the caster linked to one
or more effects; taking damage prompts the declared check, voluntarily casting another concentration spell ends the
old one, and incapacitation ends it. Suppression marks an effect inactive while retaining source and remaining
duration. Refresh and stacking rules continue to be condition policy, not ad hoc ability code.

Existing hook-defined cases such as Invisibility can remain compatible or be migrated to the lifecycle declaration;
they must not acquire a second expiry path which fires twice.

**Unlocks.** Source-dependent charm or domination, sustained auras, antimagic suppression and a useful subset of
concentration spells. It also makes Invisibility's already working behavior visible to validation and documentation.

**Acceptance.** First preserve the current behavior with focused tests: an invisible attacker loses invisibility
before its attack; an invisible caster loses it after an offensive spell but not after a friendly spell; an area
effect may still catch an invisible target. Then test the new cases: every lifecycle expiry is a typed end event with
a cause; replaying presentation cannot expire a condition; suppressed turns consume duration only if the condition
explicitly says so; source death and combat end clean dependent encounter conditions without touching persistent
world conditions.

### 12. Treat transformation as a reversible projection

**Gap.** Polymorph and Shapechange currently apply conditions whose defining fields—display name, statistics,
abilities, weapon and item access—are unsupported. Mutating the underlying creature in place would make expiry,
stacking, save/load and death restoration fragile.

**Mitigation.** A transformation condition should point to a canonical form and declare which facets it overlays:

```ts
form: {
  species: 'wolf',
  replace: ['appearance', 'physicalAttributes', 'naturalArmor', 'attacks', 'movement'],
  retain: ['identity', 'hpFraction', 'mentalAttributes', 'conditions'],
  suppress: ['equipment', 'spellcasting']
}
```

`CombatProjection` derives the effective fighter from base creature plus ordered overlays each time; it does not
rewrite the campaign creature. HP needs one explicit policy—retain damage and maximum, retain percentage, or use
temporary HP—and should be common to every transformation. Nested transformations either replace the current form
and reveal the earlier one on expiry, or are rejected by a stacking rule.

Do not support arbitrary author-entered statistics inside a spell. Forms must be canonical species or bounded form
records, which makes their attacks, portraits and text inspectable.

**Unlocks.** Polymorph, Shapechange, vampire animal forms and authored curses.

**Acceptance.** Transform, save, reload and expire returns exactly to the prior projection without restoring damage,
spent slots or removed equipment. A transformed creature's legal actions and page agree. Killing either form has one
declared consequence, not a resurrection caused by removing the overlay.

### 13. Route world magic through field procedures, not combat effects

**Gap.** Plane Shift, Goodberry, Create Poison, divinations and durable wards have no executable effects because they
change travel, inventory, knowledge or authored places. Encoding them as combat conditions would make them technically
non-empty but still false promises.

**Mitigation.** Give abilities an optional field procedure built from the campaign's existing typed operations:

- `createItem(kind, count, lifetime?)` for Goodberry and Create Poison;
- `travel(destinationSelector, company)` for teleportation and planar passage;
- `reveal(factSelector, scope)` for divination;
- `alterPassage`, `alterPlaceState` or an authored Kyr resolution for Knock, wards and terrain;
- `teach`, `restore`, `removePersistentCondition` where those operations already exist.

A destination or fact must resolve from world state. Plane Shift should offer known, legal planar destinations rather
than accept a string; a divination must reveal a typed fact the narrator can phrase; a created item must enter the
ordinary inventory and expiry clock. When an ability's possible world changes are adventure-specific, let it emit a
typed invocation which Kyr rules may answer. If no rule answers it, the ability is unavailable with a reason—it must
not spend a slot and narrate success.

Separate `combatEffects` and `fieldProcedure` in presentation and legality. A spell may have both, but each context
shows only what it can execute there.

**Unlocks.** Goodberry, Create Poison, Plane Shift, divination, longer-lived light/wards and story-specific magic.

**Acceptance.** Field use changes canonical campaign state and survives save/reload. Created objects participate in
ordinary pack limits, use and expiry. Unknown destinations/facts are not leaked in the choice label. No zero-effect
spell is castable merely because it has a level and description.

### 14. Make unsupported content fail visibly and measure the migration

**Gap.** Today a spell may load with empty `effects`, a condition may load while its defining modifier is listed only
under `unsupported`, and a species may carry unknown fields. This preserves catalog coverage at the cost of presenting
abilities which cannot keep their promise.

**Mitigation.** Add a resolved-canon capability audit to catalog validation:

- unknown fields are errors at every catalog boundary;
- an ability with neither executable combat effects nor a field procedure is `referenceOnly: true` and cannot be
  learned, prepared, granted or selected;
- a condition whose description promises an unsupported defining behavior is likewise reference-only or rejected;
- every `unsupported` key is included in a generated ledger with the playable entries depending on it;
- source fidelity is computed or reviewed against executable semantics, never inferred from successful translation.

Keep `unsupported` as useful evidence, but distinguish `omits` (deliberate adaptation), `blockedBy` (named missing
primitive), and `referenceOnly` (catalogued but unavailable). The Encyclopedia can still mention reference-only
material if it plainly says it is not a playable ability; character creation and AI must not offer it.

Set a ratchet in tests: the number of playable zero-effect abilities is zero immediately; the total unsupported
ledger may not grow without an explicit fixture and briefing amendment. The concordance should report counts after
override resolution, since raw generated and adapting records can otherwise double-count or hide one another.

**Acceptance.** The current unicorn `dr` and `resist` fields make validation fail. Chain Lightning cannot be learned or
cast until it has semantics. CI publishes the resolved counts of playable, reference-only, omitted and blocked
entries, with links to their source records.

## Order of mitigation

The dependencies suggest six bounded increments rather than one monster-system rewrite:

| Increment | Adds | Proves with |
|---|---|---|
| **A. Honest catalog** | resolved audit, unknown-field rejection, reference-only legality, provenance | Unicorn, Chain Lightning, Goodberry |
| **B. Preserved combat scale** | source HP/Hit Dice and damage, decoupled encounter rank, natural armour, attack riders, authored scaling | Ghoul, Chimera, Burning Hands, Fireball |
| **C. Defenses and resolution** | typed defenses, attack/save/SR pipeline, dispel | Golem, Unicorn, Acid Arrow, Dispel Magic |
| **D. Position and presence** | movement permissions, richer areas, auras/gazes/suppression | Pegasus, Nymph or Mummy, Discerner, Lightning Bolt |
| **E. Conditional forms** | lifecycle conditions, concentration, reversible transformations | Invisibility, Charm Person, Polymorph, vampire form |
| **F. World identity and magic** | anchors and field procedures | Lich, Vampire, Dryad, Goodberry, Plane Shift |

Each increment should end with one encounter or field journey played through the page. The stopping rule is not that
all source fields have somewhere to go; it is that the selected creature or spell makes its defining promise, the
player can reason about it before acting, and the event/world account explains the result afterwards.

## Recommended policy

Westernesse should aim for **recognisable adaptation**, not silent numerical imitation. Each borrowed or analogous
entry should declare:

- its source analogue and whether that analogue is open SRD content;
- the two or three behaviours which constitute its play identity;
- whether it is retuned, composed, extended or deliberately reimagined;
- every material omission, especially inert or unsupported effects;
- the Westernesse encounter level or context in which it was tested.

Reserve `faithful` for fidelity to the source named beside it, and make the source explicit in reports. “Faithful to
Orsino” and “SRD-accurate” are presently different claims.

## A bounded next pass

Do not begin by rewriting all 345 records. Produce a resolved-canon concordance and use it to choose mechanics:

1. Resolve overrides exactly as `Canon` does and emit one row per playable monster and spell.
2. Match only clear SRD analogues; keep original Westernesse/Orsino content separate.
3. For each match record source level/type, current level/type, executable effects, inert fields, missing expressible
   effects and missing primitives.
4. Assign `retune`, `compose`, `extend` or `reimagine` and an impact/risk rank.
5. Implement one vertical slice from each useful family: a ghoul, chimera, golem and discerner; Burning Hands,
   Invisibility, Dispel Magic and Goodberry. These exercise simple combat, natural routines, conditional defense,
   analogue identity, conditional expiry, resolution layers and world effects.
6. Play those entries before generalising. Preserve only primitives which produce a legible choice or consequence in
   Westernesse.

That pass would turn the broad conclusion here into an implementation backlog while keeping the engine's own design
in charge of the adaptation.
