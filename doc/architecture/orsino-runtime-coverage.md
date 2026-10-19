# Orsino recovery: source-to-runtime coverage

Inspected working checkout: `/home/jweissman/work/orsino`, clean, revision
`4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`. This is the actual source inspected, not a claim that a website or
unfetched remote contains nothing newer. No upstream source was modified. Earlier comprehensive generation
inventory remains in [orsino-generative-audit.md](../design/orsino-generative-audit.md).

The current source contains 57 root, 131 arcane and 154 divine ability records, 141 statuses, 100 traits and 25
root templates. These are raw file records, not a supported-content count or necessarily unique executable
abilities. Tables include 215 background groups, 25 ancestry groups, 83 weapon groups, 68 gear groups, 28
consumable groups, 48 equipment groups, 27 shop types, 44 animal kinds, 40 monster-type groups, 80 wonder
functions/descriptions and ten planar groups. Counting a table entry does not establish mechanical support.

## What the source actually does

- `src/orsino/Ability.ts:AbilityEffect` represents typed effects, conditional traits, saves, half damage,
  chance, cascade, spillover, summons, learning, travel and more. `handleEffect` delegates damage to the common
  command handlers. Descriptions are not an adequate specification.
- `src/orsino/rules/Commands.ts` applies named resistance sources before flat reduction. Negative resistance is
  vulnerability; `true` damage bypasses these defenses. Sources accumulate in Orsino. Kyr currently takes the
  strongest granted resistance instead: a deliberate difference, not parity.
- `src/orsino/rules/Fighting.ts` resolves weapon dice, attack rolls and critical/stat bonuses. Kyr attacks
  automatically hit. Weapon dice can be recovered faithfully while the *whole weapon mechanic* remains adapted.
- `settings/fantasy/tables/items.json:longsword_of_flames` is **piercing 1d8**, with an on-hit fire 1d6 rider.
  Its name is not permission to replace piercing with slashing. The new catalog keeps its actual fields.
- `abilities/arcane.json:magic_missile` describes three 1d3 bolts, but its executable effects say
  `1d4 + floor(#level/3)` against `2 + round(#level/2)` random enemies. It is **not imported** here. A port must
  explicitly choose the executed source semantics, rather than invent a compromise under the same name.

## Coverage by mechanic family

| Family / representative source | Runtime status | Proven fidelity / gap |
|---|---|---|
| Backgrounds hunter, medic, locksmith, explorer, miner | **Adapted**, existing typed overlays | Source stat deltas/class requirements retained; gold explicitly scaled by ten; Kyr skills/gear additions declared. No background advancement. |
| Professions innkeeper, herbalist, priest, boatman | **Adapted**, existing overlays | Typed source contributions; services/routines are Kyr interpretations. Boatman still has no executable fare crossing. Profession now survives combat projection. |
| Crowbar, rope, thieves' tools, shovel, map, bandages, herbs | **Partial/adapted** | Real instances/ownership and some meaningful capabilities. Crowbar operates the valve; rope enables authored requirements. Not Orsino encumbrance, all tool checks or crafting. |
| Longsword of Flames | **Adapted**, newly executable | Exact 1d8 piercing + 1d6 fire, one equipped source. No accuracy, proficiency or critical rules. Current power/flat armor apply independently per component. Unequipping removes the granted attack; it is not learned. |
| Fireproof | **Adapted**, typed catalog replaces string definition | Exact 0.5 fire resistance. Kyr two-mana, ten-owner-combat-turn lifetime. Persistent through travel; no world-time expiry. |
| Luminous Touch / Cure Minor | **Adapted**, existing shared effects | Inspected healing expressions retained; Kyr costs/chassis/selection. Other divine effects remain unsupported unless individually covered. |
| Damage components / signed resistance | **Partial**, shared reducer | Independent typed components, integer flooring, immunity at 1, negative vulnerability, source-keyed status resistance. Physical subtypes fall back to legacy broad physical resistance. Does not reproduce additive resistAll, all damage types, true-damage bypass or full hit packets. |
| Saving throws | **Adapted** | Attribute saves and explicit totals; **not** Orsino poison/death/reflex/sleep categories, immunity-to-save categories, save-for-half or per-round save limits. |
| Conditions | **Partial** | Apply/remove, source/lifetime, skip, flat modifiers and periodic damage. Ongoing damage is still untyped HP loss; stacked resistance and condition immunity need consolidation. |
| Monsters / wildlife | **Partial/adapted** | Shared creatures and generation; bounded cave-hound behavior. Existing bronze guardian has poison immunity and radiant vulnerability. Not faithful Orsino monster catalog/rank/attacks-per-turn. |
| Skills | **Adapted** | Existing woodcraft, lockwork, digging, mending and wayfinding alter executable options. Deterministic requirements, not Orsino skill rolls. |
| Items / traps / shrines | **Partial, shared execution** | Existing effects and atomic ownership/resource changes; actorless hazard/shrine source. No fictitious creature mana/body. Broad item reactions and shrine generation remain unsupported. |
| Reactions / social memory | **New bounded Kyr semantics** | A local witness can refuse service after seeing a fight. Not an Orsino content port, general reputation, combat interrupts or belief system. |
| Summons / transformations / planes / area effects | **Partial or unsupported** | Legacy summon/travel effects exist; persistent campaign ownership of arbitrary summons, transformations, planar passives and object/area spell targeting are not established. |

## Recovery order

Recover families, not arbitrary catalog samples: (1) typed damage/defense and saves, (2) weapon/proficiency and
per-hit attachment semantics, (3) status clocks and typed ongoing effects, (4) consumables and tool skills, (5)
creature behaviors and reactions, (6) character advancement, then broader world/environment/planar content.
Every recovered record needs a source revision/path, a declared adaptation, an executable trace and a composition
check. Existing `data/orsino/overlays.json`, `data/items.json` provenance and the new
`data/orsino/mechanics.json` are the canonical catalogs, not a parallel rules interpreter.
