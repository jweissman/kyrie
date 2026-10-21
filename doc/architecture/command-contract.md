# Canonical command and consequence contract

This is the Reedwake/Caught Below implementation contract, not a claim of full Orsino parity. The Campaign coordinator still owns command execution. `AbilityUse` prepares and resolves body effects; `Effects` reduces them; `World.apply` reduces physical, spatial, knowledge and relationship facts; `CreatureStore` owns mutable bodies and inventory. There is no new executor.

## Attempt, commit and receipt

1. `PlaySession` resolves a player-visible choice. `Campaign.action` checks current applicability. Rejection throws: no time, resource expenditure, event or transcript step.
2. Campaign checkpoints world, bodies, scheduler, observations and event position. Battle/field/item adapters acquire detached creature leases. Actor identity and source identity are distinct: an equipped item's instance is its source; an exposed pipe has a source and recipients but no creature actor.
3. `AbilityUse.perform` validates typed effects, cost, selectors and save definitions, binds recipients, evaluates conditional expressions and prepares amounts before deducting mana. Explicit recipient lists restrict selection; an absent target cannot be silently substituted. Invalid commands roll back at the coordinator.
4. A valid attempt spends its cost even if an attack misses or a target saves. Effects resolve in authored order against the same bound bodies. Amount expressions are prepared in authored order, then attack dice, then saves. This ordering is part of replay semantics.
5. Body changes commit through CreatureStore. The action's success/failure changes commit through World. A fatal exposure selects the failure branch: it cannot also move a fallen adventurer through the barrier. Ordinary damage or a successful hazard save can still permit crossing.
6. Present, surviving, nonparticipant witnesses can establish `witnessedAttack`. Existing latched `Event` rules perform bounded reactions. Each elapsed campaign unit advances world-time conditions, NPC scheduling, rules and outcome observation. A world-time death can fail the command; earlier committed consequences are not magically undone. Success/failure World branches describe immediate resolution, not a retroactive undo of developments during elapsed time. Delayed recovery with no survivors commits failure rather than throwing and rolling back those deaths.
7. Canonical modules receive a versioned `CampaignEvent.resolution` receipt: command sequence, actor, source, bound names, elapsed interval, changed body states, typed World changes, resolution events and outcome. It includes consequences during the action's elapsed time, not just its immediate mutation. Receipts are omniscient developer/save data, not player narration. Offscreen world-clock effects are marked private and excluded from the player-facing event stream; they still change bodies and remain in the receipt.
8. A runtime exception anywhere in the command rolls back the checkpoint, including body changes, ownership, scheduler state and emitted events. A resolved miss, death or retreat is a committed result, not an exception.

Amounts and `when` clauses read the actor's pre-cost numerical snapshot, or explicit values for a source without a body. They are prepared once, not reevaluated after earlier effects. One area effect shares its prepared amount across recipients; each recipient saves independently. `#target` expressions are not implemented. A battle consumes its authored campaign-action duration; world-time is not inferred from its combat-turn count. Non-creature cooldown scheduling is not implemented; environmental repetition should be governed by authored World state/time.

The `witnessedAttack` canonical-core declaration currently enables receipts. Legacy fixtures do not gain new serialized event fields. This is a compatibility seam, not a permanent language-version mechanism.

`AbilityUse` reports success, failure or partial effect resolution (mixed saves/hits, including half damage). Campaign's historical `result` remains success/failure; its receipt additionally identifies battle retreat as interruption. Unsafe delayed recovery is also recorded as interruption. Campaign world actions still have two authored consequence branches. We have **not** introduced arbitrary partial-success quest branches or interruptible individual combat effects.

## Execution paths consolidated

| Entry point | Common contract now exercised | Boundary retained |
| --- | --- | --- |
| Combat weapon/spell | AbilityUse validation, bound targets, costs, attack/save events and Effects; CreatureStore commit | Legacy abilities keep their arithmetic and implicit owner-turn ongoing damage. |
| Field ability | Same AbilityUse/Effects; equipped grants participate in eligibility and preserve item identity | The field safety whitelist remains bounded to healing, removal and persistent wards. |
| Consumable / trap / shrine | Existing Items lease adapter delegates to AbilityUse/Effects; consumed ownership commits with effects | Item ownership operations remain domain operations, not English effect descriptions. |
| Timed ongoing condition | Battle and campaign-time adapters call Effects for explicitly clocked damage and expiration | World-time periodic damage requires a declared type; old bleeding has not been guessed into a new type. |
| Object / movement / discovery / relationship | Existing typed World changes under the same Campaign checkpoint and committed receipt | These use World signatures, not fabricated Fighter targets or a second body-effect interpreter. |
| Witness / reaction / feedback | The same committed mechanical events feed bounded witness memory and public feedback; World events change service access | No universal recursive reaction bus. Attempt-only social reactions and general belief logic are not implemented. |

## Mechanical policies

| Concern | Explicit policy |
| --- | --- |
| Legacy attacks | No attack metadata: automatic hit, unchanged arithmetic and roll ordering. |
| New typed attacks | `attack: {stat, defense, critical}`: d20 + Kyr statMod against authored ascending defense; natural 1 misses; natural 20 hits and multiplies rolled damage by `critical`. One attack roll per bound target gates all components. This is a Kyr adaptation, not Orsino THAC0. |
| Damage components | Each typed component has its own type, resistance and recorded amount. Exact subtype falls back to broad physical resistance. |
| `damagePolicy: typed-v1` | Power and armor apply once to the first physical component per target; elemental components bypass flat armor and do not acquire physical power. Resistance applies before flat armor, rounding down; guarding halves afterward. Immunity is resistance 1; negative resistance is vulnerability. |
| Legacy damage | Missing policy preserves power and armor on every component, including elemental ones. Do not describe this as faithful Orsino arithmetic. |
| Saves | d20 + Kyr statMod + equipped/status save modifiers against explicit difficulty. Default success negates; typed damage can declare `save.success: half`. Halving adjusts the prepared component before power/armor; criticals multiply the rolled component, not the later power bonus. Save categories and formula remain Kyr adaptations. |
| Save categories | `save: {kind, difficulty, success}` names an Orsino category instead of an attribute: d20 + statMod(the category's attribute, from `rules.json`) + level + the category's status bonuses + all-save bonuses. `immune` categories succeed without rolling; a fourth success in one category per encounter fails (Orsino's `savedTimes`). Kyr statMod. |
| Passive traits | `traits` on an ancestry or calling name statuses that always apply. They are read by the same armor, power, save and resistance queries as conditions, and are never applied, expired or removed. |
| Hazards | A site or situation declares `Hazard id "name" means "<effect>".` The hazard is a module entity carrying its effect; `expose` resolves it under typed-v1 damage. Global abilities are not used for mechanisms of places. |
| Exposure | In modules that include `rules/elements.kyr`, an area damage effect of an element during a combat command records `exposedTo(place, element)` in the receipt. Things react through ordinary events. Physical damage is not an element. |
| Conditions | Missing clock retains owner-turn compatibility. Explicit `owner-turn` ongoing damage uses Effects; `world-time` ticks once per elapsed campaign unit; `until-removed` does not expire automatically. The latter two require a persistent status definition. One unit currently represents ten fictional minutes. The casting command itself consumes time on that clock. Periodic effects need a declared damage type; the engine does not guess one. The new poisoned clock declares poison damage. Legacy bleeding remains an owner-turn compatibility effect until explicitly defined for the new clock. |
| Stacking/removal | Status replacement by id, or id + source for source-refresh. Explicit removal removes that status's attachments. Revival restores HP without silently erasing unrelated persistent attachments. |
| Equipment | Equipment grants derive from owned, equipped instances. Projection does not convert them into learned abilities. The same grant now participates in field eligibility. Applied timed spells are independent of later unequipping their casting focus. |
| Area binding | `Items.exposeArea` requires an explicit finite creature-id list and plural effect selectors. It does not infer radius, line of sight or arbitrary geographic containment. No synthetic combatants. |
| Physical/knowledge/social effects | Existing typed World assert/retract/set/increase/decrease changes, validated by the existing module compiler and reducer. Locks, passage access, discoveries and service refusals remain authoritative world facts. |
| Reactions | Authored, bounded World events, not a recursively dispatched universal reaction bus. Hesta's service refusal reads the same attack resolution used for damage feedback. |

The body and world effect vocabularies remain distinct typed domains under one coordinator and receipt. A spell that mutates an arbitrary object is not yet a general-purpose body-ability selector. Movement during an encounter, concentration, reaction recursion, condition immunities and granular interruption remain unsupported. Persistent summons, general combat teleportation into World locations and tactical inventory commands are not proven by this slice. Area membership is currently a finite bound list supplied by the caller, not an authored radius/line-of-sight subsystem. `until-removed` still carries an ignored positive remaining value for schema compatibility; a dedicated no-duration representation remains awkward.

## Authoring examples and compatibility

`data/catalog/abilities.json` (formerly `data/sources/orsino/mechanics.json`) contains typed definitions, not English evaluated during execution:

```json
{
  "attack": {"stat": "strength", "defense": 10, "critical": 2},
  "damagePolicy": "typed-v1",
  "effects": [
    {"kind":"damage", "target":"enemy", "damageType":"piercing",
     "amount":{"kind":"deem","expression":"1d8"}},
    {"kind":"damage", "target":"enemy", "damageType":"fire",
     "amount":{"kind":"deem","expression":"1d6"}}
  ]
}
```

```json
{"kind":"apply", "status":"orsino_fireproof", "duration":12,
 "clock":"world-time", "target":"ally"}
```

The canonical steam definition also explicitly selects `typed-v1`; armor does not become fire resistance merely because its source is environmental. Critical and half-save events retain the original roll alongside their explicit adjustments.

The site remains ordinary Kyr:

```kyr
Item ward_focus "the warder's copper focus" is foundry_ward_focus at workshop.
Item ward_sword "the foundry's Longsword of Flames" is longsword_of_flames_typed at boiler.
Thing steam_pipe "the split steam pipe" on boiler_arch {
  State leaking dangerous "A split pipe hisses over the arch. Its valve needs a bar.".
  State shut "The valve is shut; the arch is clear.".
  State vented "The last pressure has escaped.".
  Change close "Turn the steam valve with a bar" from leaking to shut needing crowbar.
  Hurts with foundry_steam when leaking then vented.
}
Event hesta_refuses near hesta when witnessedAttack(hesta, party, hound)
  "Hesta draws her basket away. 'Find your salve elsewhere.'"
  then { Assert refusesService(hesta, party). }
```

No grammar changes were required. New typed mechanical fields are `attack`, `damagePolicy`, condition `clock`, and save `success`. No situation-specific TypeScript decides whether the pipe, blade, focus or service refusal works. Authors no longer need separate field eligibility plumbing for an equipped ability. They still need catalog definitions, a site item reference and text; that fragmentation has not disappeared.

## Orsino proof and limits

Inspected checkout: `/home/jweissman/work/orsino`, revision `4cb27ce68cb204a82c6ce6eb1a29c2131dc67eb3`. This is the locally inspected revision, not a new assertion about remote HEAD.

| Definition | Evidence | Fidelity |
| --- | --- | --- |
| Longsword of Flames | `settings/fantasy/tables/items.json`, `longsword_of_flames`: 1d8 piercing + onAttackHit 1d6 fire | Exact dice/types and on-hit gating in the typed variant. Accuracy, critical multiplier, power and armor are explicit Kyr adaptations. Old weapon remains available as compatibility data. |
| Fireproof | `settings/fantasy/statuses.json:fireproof`: resistFire 0.5 | Exact resistance. Mana, duration and casting focus are Kyr policies. World-time and owner-turn variants have distinct identifiers. |
| Poison/cleansing | Existing Kyr poisoned/antidote fixture | Shared application/removal, source attribution and consumption; not a faithful port of all Orsino poison conditions. |
| Boiler sentinel | Existing Kyr bronze_construct/mortuary_custodian catalogs | Deliberate Kyr content: 35% broad physical resistance, poison damage immunity, radiant vulnerability. **Not** imported Orsino golem fidelity. |
| Steam | Original Kyr environment | Actorless physical source, explicit Dexterity save and fire damage; not an Orsino spell. |
| Lockwork / woodcraft | Existing Orsino-derived background overlays + Kyr capabilities | Deliberate noncombat adaptation. Orsino background stat/gold definitions do not themselves implement Kyr's guaranteed lock opening or calming. |

Orsino `src/orsino/rules/Fighting.ts` uses level-sensitive THAC0, defender AC/Dexterity, its own statMod and critical bonus (not a simple doubled damage roll). `Commands.ts` has broader defenses. Those mechanics remain incomplete. There is no claim of full class, equipment or monster parity.

The client history, resolution trace, browser/replay verification and playtest account recorded for this contract
were removed with the legacy clients in October 2026; they remain in git history (`git show c125f9c^:doc/playtests/command-contract/README.md`).
