# Statistic ownership and Deem's merge contract

## Authoritative rules and duplicated arithmetic

Kyr's authoritative runtime rules are `Creation.hitPoints`, `Creation.slots`, and `FantasyRules.statMod` (also exposed by `Fighting.statMod`). The ordinary Deem `creature_statistics` template contains portable copies of their arithmetic so it can run through the installed CLI without importing Kyr or registering custom functions. This is deliberate, tested duplication; it is not a second independently evolving rule set.

`test/creature-statistics.test.ts` compares the Deem calculation with the runtime over first and advanced levels, odd/even hit dice, negative/zero/positive Constitution modifiers, every canonical class's slot factors, and attribute boundary values. Spell/class choice orchestration is not thereby implemented for every class: this test establishes formula agreement only.

The duplicated pieces are:

- Modifier: `round((score - 10) / 2)`, using JavaScript/Deem half-up rounding. Runtime score validation is stricter than the arithmetic alone.
- Rolled HP: at level 1, `max(1, hitDie + max(0, CON modifier))`; above level 1, `max(2, round(hitDie + (level - 1) * hitDie / 2 + CON modifier))`.
- Slot capacity (`maxMana`): class base plus `2 + level` plus the class multiplier times its positive casting-attribute modifier. This capacity is currently assigned even to noncasters; it does not give them spells.
- Stored speed: the nonnegative base-Dex modifier, described below.

Generation additionally supports explicit fixed HP and additive `hpBonus`/`manaBonus`. Those modify initial capacities through existing numeric statistics, not a new combat or casting model. With no bonus and no fixed HP, the portable formulas exactly match `Creation`. An explicit fixed HP body bypasses CON/level HP derivation; a CON contribution still affects saves and other attribute-based mechanics.

There is also data duplication between the small checked-in Deem body/class/ancestry tables and canonical catalogs. The tests check those shared facts, including proficient starting choices and supported class abilities. The canonical catalogs and runtime remain authoritative. A future consolidation should preserve independent CLI generation and must not restore runtime table injection or hide generation decisions in an adapter.

## `speed`: actual meaning, range and use

`Creature.base.speed` is a compatibility field calculated as:

```text
max(0, round((base Dexterity - 10) / 2))
```

It is a unitless, cached, nonnegative base-Dex modifier. It is not feet, squares, passage duration, actions per turn or initiative. It is not capped at a conventional maximum: ordinary unmodified 3d6 Dexterity produces 0–4; Dex 35 produces 13. The schema admits safe integer scores of 1 through `Number.MAX_SAFE_INTEGER`, giving speed 0 through 4,503,599,627,370,491. Values outside the schema's integer constraints are rejected.

No current executor reads `speed` to resolve gameplay. It is generated, stored, projected and validated. `Battle.round` uses **effective Dexterity's signed modifier**, plus initiative modifiers, directly; it does not use the cached field. Passage duration comes from `travelTime`/`ActionTime`. Conditions that alter Dexterity can change initiative without changing this stored base field. A regression test changes stored speed to 100,000 and verifies unchanged seeded initiative.

This is a domain-model gap, not an implemented movement-speed rule. Removing/renaming the field or adding movement rates would require an explicit rule/schema decision; this change does neither.

## Which numbers may accumulate?

Deem's native `*` overlay adds numbers. It is appropriate only where a contribution is intended to add. It does not know the semantic unit or ownership of a property.

| Property | Contract |
|---|---|
| Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma | Additive score contributions before derivation. Invalid final scores are rejected by Kyr. |
| `level` | The selected family/maturity supplies its level contribution from a zero base; a caller-authored level is an explicit final replacement. Multiple maturity rows are not stacked. |
| `hitDie` | Exclusive chassis input from the selected body or class. It is not an HP bonus or a die roll. Zero defaults allow the single owner to supply it. |
| `fixedHp` | Exclusive optional body HP override; zero means derive HP. General overlays must not use it as a bonus. |
| `hpPerLevel` | Exclusive with `fixedHp`, from the same body: what a fixed line gains each level above the first. Orsino's monster template grows a line by 3 a level; the golem's does (13 at level 1, 34 at level 8). Zero, the default, keeps a line fixed at every level, as a dragon's maturity total is. |
| `slotBase`, `slotMultiplier`, `slotAttribute` | Exclusive class-rule factors, not a generic pool of independently stacking bonuses. Only one class is selected. |
| `hpBonus`, `manaBonus` | Additive adjustments across contributions, applied after base HP/slot derivation. Results are bounded to legal minima (1 HP, 0 capacity). |
| `maxHp`, `maxMana`, `speed` | Derived outputs. Computed once after composition and installed with forced assignments (`>`), never a numeric `*statistics` merge. |
| Resistances/defenses | Contributed by canonical traits/equipment and combined by Kyr's modifier rules. Nested Deem objects do not recursively add resistance maps. |

The old `hitPoints` input mixed an HP override with an HP adjustment: adding to a rolled body's zero could accidentally turn it into a tiny fixed-HP body. `fixedHp` and `hpBonus` now separate those meanings. Dragon maturity HP adjustments use `hpBonus`; the adult body's fixed HP remains 99. Stone contributes +4 HP to the golem's fixed 13, yielding 17, while the same HP-bonus operation works on a rolled animal's derived capacity.

The old `*statistics = gen(creature_statistics)` could also add derived outputs to earlier writes. It is replaced by a private calculation followed by explicit assignments to `maxHp`, `maxMana` and `speed`. A test injects both additive bonuses and erroneous writes of 999 to all three derived outputs: the finalizer ignores those reserved-output writes, adds only the supported bonus fields and produces HP 20, mana 5 and speed 0. This ownership applies within `_creature_complete`; an arbitrary caller that overlays another number onto a completed creature can still change it under ordinary Deem semantics.

Numeric merge is not suitable for arbitrary new properties by default. An author must identify each new field as an additive contribution, a single-owner input, or a derived/replacement value. Deem does not automatically diagnose every contradictory custom overlay.

The public generators now share `_creature_complete` for those forced final assignments. Use `gen(type, parameters)` for caller constraints: unlike placing numeric parameters next to a `*result` overlay, scoped parameters do not add themselves onto the returned statistics. The ordinary additive overlay contract itself is unchanged.
