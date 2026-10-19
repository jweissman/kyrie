# One persistent, playable crossing

This records the original one-module slice. The subsequent [module bundle milestone](module-bundles.md) adds file-loaded installations and a two-site campaign through the same runtime.

Run `bun run kyrie adventure slice`. Choose numbered actions, `inspect`, or `save /tmp/crossing.json`; resume with `bun run kyrie resume /tmp/crossing.json`. `q` leaves the terminal. The player can travel away, wait, return, and attack again. Commands remain available after the immediate objective succeeds or the deadline fails. `hint` is a bounded player-only mechanical plan; it cannot predict NPC cooperation, combat victories, or future clock changes.

Run the four reproducible headless histories and integration checks with:

```sh
bun test test/campaign-vertical.test.ts
bun run check
```

## Integration audit and boundary

The existing `Campaign` remains the runtime. `CreatureStore` owns creature identity, generated characteristics, HP, mana, currency, learned abilities, and persistent conditions. `Battle.encounter` still leases those records, resolves Kyr-authored abilities, and commits changes. No combat engine, creature model, or generator was replaced.

`World` remains the owner of typed situation facts, locations, cargo, permissions, claims, and delivery accounts. Its existing copy/apply mechanism validates an entire action's symbolic changes before publishing them. DEEM's existing template/context/table machinery constructs the initial manifest; each manifest creature is generated once through the existing compositional `creature` template. Restore loads the resulting creatures, not their generation instructions.

The missing connections were finite grounding of reusable action schemas, attaching authored controllers to `Campaign`, a watch-by-watch NPC opportunity loop, and saving the complete aggregate. `ModuleAssembly` supplies generic source/manifest assembly and validation; `ActionSchemas` grounds typed entity parameters; `Agency` selects authored priorities and calls the existing bounded `Planner`. No new search algorithm was introduced. The old single-puzzle campaign entry points retain their behavior.

The highest-risk boundary was creature state versus symbolic planning facts. `CreatureFacts` materializes `able(group)`, `dead(group)`, and personal coin totals from canonical creatures. It does not invent another HP store. Symbolic coin transfers commit atomically to canonical wallets, and combat changes are projected back before NPC decisions. Stock accounts such as the market's delivery fund remain world resources. Cargo and food remain group-level world inventory, with one owner; individualized equipment and looting are outside this slice.

## What the author writes

The complete example is split along reusable boundaries:

| File | Responsibility |
| --- | --- |
| `data/rulesets/adventure.kyr` | Shared typed relations, queries and parameterized actions: travel, restricted footpaths, gated passage, coin/food transfer, collection/deposit, delivery work, eating, release, combat, waiting. |
| `data/modules/living-crossing.kyr` | Four places, three actor groups, stock locations, routes, guard control, collection permissions, and outcome queries. **No action definitions.** |
| `data/default/templates/deem.templates.json` | `adventure` composes context parameters, table content, a pressure subtemplate, and initial resource subtemplates; existing `creature` generates every inhabitant. |
| `data/default/tables/deem.tables.json` | `adventureSetting.crossing`: creature contexts, membership, controller order, action capabilities, goals/priorities and observable outcome predicates. Race/class choices are data. |
| `src/campaign/modules.ts` | One catalog entry associates the existing DEEM setting with the two source files through generic `ModuleAssembly.compose`. |

For this module, authors write **no TypeScript decisions or solution orchestration** and duplicate no action definitions. A new module currently needs a TypeScript catalog registration/import of its source and ruleset, or a caller of `ModuleAssembly.compose`; the CLI does not yet load an external three-file manifest bundle. New mechanics beyond the ruleset still require ruleset work. This is an explicit remaining product boundary.

Actual Kyr source:

```text
Action cross(actor: group, origin: place, destination: place, defender: group) "Cross the guarded route" {
  Requires able(actor) and at(actor, origin) and gate(defender, origin, destination)
    and (released(defender) or not able(defender)).
  On success { Assert at(actor, destination). }
}

Initially Assert gate(guard, bank, road).
Initially Assert mayCollect(carrier, consignment).
Query supplied() means quantity(granary, grain) >= required(granary, grain).
Query settled() means paid(guard).
Query missed() means recorded(winter) and deficit(winter) > 0.
Goal supplied().
```

The carrier's actual table-authored goals are:

```json
[
  { "id": "wages", "when": "true", "target": "quantity(carrier, gold) >= 1", "priority": 10 },
  { "id": "provision", "when": "true", "target": "supplied()", "priority": 5,
    "urgent": { "when": "watch(clock) >= urgentAt(clock)", "priority": 20 } }
]
```

These strings parse into the existing typed predicate representation. They are not English instructions evaluated at runtime. Each actor also declares stable creature IDs, permitted action schemas, and a planning horizon. The carrier can collect/deliver cargo and earn a fee; it cannot release another actor's blockade or assume a victorious fight. The guard can eat and end its own blockade when paid, fed, or past its authored mercy threshold. That acceptance policy is explicit, not an undefined negotiation system.

DEEM composition uses ordinary context and subtemplates (excerpt from the actual templates):

```json
{
  "adventure": {
    "__no_id": true,
    "profile": "crossing",
    "_setting": "=lookup(adventureSetting, #profile)",
    "deadline": 8,
    "mercyAt": 7,
    "urgentAt": 4,
    "creatures": "=dig(#_setting, 'creatures')",
    "actors": "=gen(adventure_actors)",
    "pressure": "=gen(adventure_pressure)"
  },
  "adventure_pressure": {
    "__no_id": true,
    "id": "winter",
    "at": "=#deadline",
    "measure": { "kind": "call", "name": "quantity", "args": ["granary", "grain"] },
    "required": "=#grain"
  }
}
```

The full template also composes initial claim, urgency, supplies, delivery fee, purse and ration records with `concat(gen(...), ...)`. Context `{deadline: 8, mercyAt: 7, urgentAt: 4}` independently constrains timing; changing urgency does not require another full profile. A focused test changes urgency to 1 and shows the same carrier choosing grain over paid work when passage is possible, then choosing paid work after an unexpected delivery satisfies its other goal.

DEEM chooses/constructs initial content once; the source defines topology and permissions. Authors remain responsible for coherent stakes, resource amounts, policy thresholds, goals, and whether the map allows the intended approaches. This slice does not prove automatic generation of good adventures. Its town-name variation is cosmetic; its context parameters and structured resources/controllers are executable.

## Time, authority, and save semantics

An invalid command changes nothing and consumes no time. Inspecting, saving and asking for hints consume no time. A valid player action commits its actual effects, then advances by its declared `Time`. For each elapsed watch, `Campaign` updates the clock, gives each NPC one opportunity in authored order (guard, then carrier), checks due pressures, and observes outcomes. NPCs recompute unsatisfied goals, sort by current priority, search within their authored horizon and 2,000-node bound, execute **one** action, then discard the speculative remainder. An unplannable goal falls through to another goal; no plan means no action.

The sample uses one-watch actions. NPC planning excludes combat and other actors' actions. Clock changes, scheduled pressures and future NPC choices are not simulated inside a plan. Combat uses the existing manual or automatic controller; the whole resolved encounter advances one campaign watch. Battle turns do not independently advance campaign watches. This is a deliberately coarse scheduler, not a world-time/combat-time conversion system.

Leaving uses ordinary travel to another persistent location. NPC opportunities do not depend on player proximity. Time advances through commands, including waiting; closing the application does not advance real-world time.

At watch 8, after NPC actions, winter records the missing grain amount **once**. Later delivery can make `supplied()` true but cannot erase the historical deficit. The deadline records provision failure; it does not simulate starvation or secretly damage creatures. Current outcome predicates and first-observed developments are separate. A legacy summary may say success/failure, but neither closes this persistent campaign or resets the module. A dead player party cannot issue further commands.

Saves contain the instantiated module, controllers, world facts, canonical creatures, elapsed clock, pressure ledger, observations, encounter counter and event log. Save is allowed only between commands and without active creature leases. Restore validates the module/creatures and rejects inconsistent materialized creature facts. Continuing from a JSON roundtrip produces the same complete state and log as uninterrupted execution. Save version 1 is a same-ruleset checkpoint, not a migration or cross-version replay format. Command effects, NPC actions and deadline recording are individual commits; there is no durable database transaction spanning an entire watch.

## Four histories of the same seed (`slice`)

All begin with one generated human fighter, one generated goblin guard, one generated human carrier, three player coins, one market coin, one grain unit, one parcel and one ration.

| History | Commands and autonomous behavior | Persistent results at watch 11 |
| --- | --- | --- |
| Cooperate | Travel to bank; transfer three coins. Guard releases at watch 4. Carrier earns its fee first, then delivers grain at 8. | Provision met on time; claim paid; guard alive; no hostilities. |
| Violence | Travel; attack using the existing combat engine. For this seed the guard dies and the fighter loses HP. No authored victory flag grants passage: the actual `able(guard)` projection becomes false. | Provision met at 8; unpaid claim; dead original guard; mutual hostility remains. |
| Leave | Take the footpath to the market and wait. Guard releases at 7; only then can the carrier plan delivery, finishing at 11. | Deficit of one recorded at 8; eventual supply; unpaid claim. Returning changes location without resetting anything. |
| Partial resolution | Travel; transfer a ration. Guard eats at 2 and releases at 3. Carrier delivers at 8. | Supply on time and guard fed; three-coin obligation still outstanding; no hostility. |

Resource conservation tests count stock and carried cargo together; delivery transfers the market's existing coin rather than minting one. All histories conserve four coins, one parcel and one grain unit. Eating explicitly consumes the ration. Tests compare complete saves from independent runs, not just outcome labels. Separate tests inflict the Kyr-authored `wounding_blow`, retreat, leave, JSON-save/reload, return, and encounter the same injured guard with the persistent `weakened` condition. Combat cooldowns and encounter conditions retain their existing local lifetime.

## What this proves—and leaves open

This proves that generated structured content, canonical creatures, reusable typed world actions, bounded goal selection/replanning, combat, campaign time, and save/restore can operate in **one** existing runtime. Success is recognized from quantities and other world predicates, never from a named player solution. It supplies a small playable authoring surface and divergent persistent histories.

It does not validate rich dramatic progression, believable social reasoning or compelling generated stories. The guard's policy is intentionally simple. The planner has complete public facts, deterministic tie-breaking and no predictive model of other controllers. There is no autonomous NPC combat controller. Only one loaded adventure is hosted; the refuge demonstrates leaving a situation, not general multi-module streaming. Group inventory is aggregate, cargo capacity is one unit, gold/food conventions and the release query are ruleset-specific, and pressure recording is a threshold/debt ledger rather than a general scheduler. Spatial combat, dialogue, evidence, world-time condition recovery, loot/equipment, full race/class catalogs, module bundles, cross-version saves and a general event/act director remain deferred.
