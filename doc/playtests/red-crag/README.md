# The Red Crag: a dragon from the Orsino corpus

The vertical slice that follows the [Orsino checkpoint](../../architecture/orsino-checkpoint.md). A red dragon,
composed from Orsino's own tables, holds a crag above Thrale. A portable situation
([data/situations/dragon-roost](../../../data/situations/dragon-roost)) installs it into a canonical site
([data/sites/thrale](../../../data/sites/thrale)), with the campaign at `data/red-crag/thrale.campaign.json`.

```sh
bun test test/red-crag.test.ts test/orsino-registry.test.ts
bun bin/record-red-crag.ts          # re-records the three histories below
bun bin/kyrie.ts lint data/red-crag/thrale.campaign.json
```

## Three histories

Each history is ordinary play through `PlaySession`, scripted in [test/red-crag-histories.ts](../../../test/red-crag-histories.ts).

| History | What the company does | What persists |
|---|---|---|
| [fire.md](fire.md) | Buys and applies three fireproof salves, crosses the rope bridge, attacks, survives one breath, loses Dori to a bite, flees | The bridge burns; the company walks home by the goat path and the scree (needing their rope); Dori stays dead |
| [theft.md](theft.md) | Asks the shepherd when the dragon hunts, waits, crosses while it is away, takes the bell home | The bell rings, but the dragon returns at its hour, finds the theft and burns the bridge; 18 ticks later the hay barn in Thrale burns |
| [tribute.md](tribute.md) | Hails the dragon, pays 15 coins, asks for the bell, carries it home | Nothing burns. The dragon hunts and returns the next day, still placated |

The dragon hunts every day on a schedule set by DEEM (leaves at watch 31–36, returns at 55–60), whether or not the
company is there. Its name is generated from a subset of Orsino's `npcName.dragon` list.

## The breath, exactly

From [fire.trace.json](fire.trace.json) (the full command receipt):

```
Calder uses orsino_fire_breath.                         one 4d6 roll, shared: 14
Dori saves versus breath: d20 17 + con -1 + level 1 + bonus 0 = 17 against 16: success.
Dori takes 3 fire damage (rolled 14; halved by the save, resistance 0.5)
Elen saves versus breath: d20 19 + con 2 + level 1 + bonus 0 = 22 against 16: success.  → 3
Bran saves versus breath: d20 20 + con 0 + level 1 + bonus 0 = 21 against 16: success.  → 3
...
Calder attacks Dori: d20 3 + 8 against 10: hit.  Dori takes 3 piercing damage (rolled 10; power 3); falls.
receipt world change: + exposedTo(world__ledge, fire)  →  event: "Flame runs along the bridge ropes."
```

`test/red-crag.test.ts` also checks, with six targets and no hit-point clamping, that every save total is d20 + Con
modifier + level + breath bonuses. Damage is halved on success, then halved again by fireproof. An `immuneBreath`
creature succeeds without rolling. A fourth successful breath save in one encounter fails.

## What is Orsino and what is Kyr

| Aspect | Orsino source | Kyr |
|---|---|---|
| Scores and hit points | `monster` template: stat line + base 21 + terrain + aspect + Dragon type overlay; HP = 85 + statMod(con) + 3·level | **Same numbers**, composed by `OrsinoMonsters` from registry entries and checked by test: Str 35, Dex 28, Con 32, Int 29, Wis 27, Cha 31, 99 HP. Kyr's statMod (÷3) reads them. |
| Breath weapon | `fire_breath`: 4d6 fire, natural, `breath: true`. Used through `melee`: one target, THAC0 attack roll, no save, no area, no recharge | Exact 4d6 fire. **Adapted:** every opponent, one shared roll, a breath-category save for half, three-turn recharge. |
| Breath save | Category `breath`, Constitution, `saveVersusBreath`, `immuneBreath`; never invoked by any Orsino content | **Same category semantics** (attribute, level, category and all-save bonuses, immunity, three-success cap). The difficulty, 15 + level, is Orsino's default debuff difficulty. |
| Formidable | toHit 3, bonusDamage 3, saveVersusWill 2, 10% bludgeoning/piercing/slashing resistance | Translated: will +2, the three resistances, power 3. **toHit omitted.** Resists typed subtypes only, not legacy untyped physical damage. |
| Flying | evasion 5, toHit 1 | **Not attached.** Neither effect has a Kyr meaning yet. |
| Natural armour, three attacks a turn, maul, flight spell, 10d100 gold | Present | **Omitted** and recorded in the ledger. The dragon is therefore *represented*, not *executable*. |
| Bite | `monsterWeapon.dragon` = bite, 1d6 piercing, replaced by the breath for coloured dragons | Used while the breath rekindles (Kyr adaptation). 1d6 + Str modifier, Kyr typed attack against 10. |
| Fire in the roost | — | **Kyr:** an area effect of an element records `exposedTo(place, element)`. The authored bridge reacts through an ordinary world event. |

## Engine changes this slice needed

All of these are general, and none is specific to dragons:

- **Save categories** (`save.kind`) in the shared `AbilityUse` path (`src/ability-use.ts`), with categories and
  attributes in `data/rules.json`.
- **Category modifiers and immunities** on statuses (`saves`, `immune`).
- **Passive traits** on ancestries and callings (`traits`), read by the same modifier, save and resistance queries.
- **Creature kinds with a stat line and hit points** (`races.json` `stats`, `hitPoints`).
- **New damage kinds:** lightning, force, sonic, and `true` (ignores resistance and armour).
- **Environmental exposure** (`data/rulesets/world/elements.kyr`, `src/campaign/exposure.ts`). It only applies to
  modules that include the elements ruleset, so no earlier history changes.

## Known gaps shown by this slice

- **No creature starts a fight.** The dragon guards and answers theft through world events, but only the company
  can begin combat.
- **A monster cannot leave an encounter.** `flee` ends the whole battle, so a creature cannot retreat alone.
- **Accuracy and armour class** (toHit, AC, evasion) are still the next combat mechanic. Party attacks are legacy
  automatic hits, so the dragon's scales would not matter yet even if modelled.
- **A level-1 company cannot win this fight**, and that is faithful to the source numbers. Preparation, timing and
  payment are the intended ways through.
