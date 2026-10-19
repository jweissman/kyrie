# Resource-gated capability experiment: results and limits

This implements a small mechanics test, not an adventure engine. Run both independent experiments with:

```sh
bun test test/resource-gate.test.ts test/npc-goals.test.ts
```

## 1. Generation and execution

Sources: [DEEM templates](../data/experiments/gate.templates.json), [tables](../data/experiments/gate.tables.json), [Kyr schema](../data/experiments/resource-gate.kyr), [headless adapter](../src/experiments/resource-gate.ts), and [tests](../test/resource-gate.test.ts).

One `resource_gate` template composes control, enabling-term, provision-need and operation records using DEEM's existing `buildSetting`, `Template.bootstrapDeem`, nested `gen`, and `Generator.gen`. The main creature/campaign generation paths are unchanged.

The loader validates links, supported recipes, quantities, deadlines and safety requirements; it lowers records to the existing typed module model. Symbolic entity IDs are stable local role aliases (`provider`, `beneficiary`, `capability`); generated identities are validated and resolved to those aliases. This prototype uses group actors, not independently simulated people or creature replicas.

Three shared schema builders ground transfer, activation and operation into checked Kyr `Operator`/`Predicate`/`Change` objects. `ModuleCompiler` checks them; `World.test` checks eligibility and `World.apply` commits changes atomically. There is no new effect interpreter or parameterized grammar. The two trusted recipes move existing grain or consume raw water/coal to produce water. Filters are consumed into an installation; unrelated wealth cannot count as payment, and changing a pump's term to receipt-only cannot bypass its physical safety prerequisite.

The watch harness gives each reactive controller one action after the player's command. Observer latches have no authority over execution. Disabling them produces identical world snapshots and commands.

| Profile and external commands | Delivered by deadline | Frozen deficit |
|---|---:|---:|
| Bridge: visitor contributes two coins | 3 | 0 |
| Bridge: visitor contributes nothing | 0 | 3 |
| Pump: visitor supplies filter and coal | 3 | 0 |
| Pump: visitor supplies filter only | 2 | 1 |

Tests also cover currency/resource accounting, invalid-command atomicity, output repeatability, input validation, and late help that improves current delivery without erasing a recorded deficit.

### Independent composition

Operating availability is a separate table, absent from both complete profile entries:

```json
{
  "anytime": { "notBefore": 0 },
  "late_shift": { "notBefore": 4 }
}
```

The operation subtemplate looks it up through an independent context binding:

```ts
const normal = ResourceGate.generate({ profile: 'pump', deadline: 5 }, 'composition');
const late = ResourceGate.generate({
  profile: 'pump', deadline: 5, constraint: 'late_shift'
}, 'composition');
```

Every generated field remains equal except the selected constraint and `operation.notBefore`. With identical parts, fuel and player commands, normal operation yields three water units; the late shift yields two and leaves one coal unused. Applying the same constraint to the bridge delays its first batch from watch 2 to watch 4, while still finishing by watch 6. No new situation profile, scenario-specific action, or controller branch is added.

**What this proves:** DEEM can compose an independent executable operating constraint with profile data, and shared Kyr mechanics consistently reflect it. It does **not** prove that most interesting situation authorship has moved out of the profiles. Most content is still authored there. Acceptance policies and competing objectives have not become compositional generation axes in this experiment.

## 2. Separate planner experiment

Sources: [courier fixture](../data/experiments/npc-goals.kyr) and [tests](../test/npc-goals.test.ts). This is deliberately separate from the gate adapter.

One courier has two goals competing for one cargo slot and immediate action time: earn two coins or provision a clinic. It references a generated canonical creature in `CreatureStore`; no second HP model is introduced. An authored selector assigns paid work priority 10 and clinic provision priority 5, rising to 20 when an externally supplied `critical(clinic)` fact becomes true. Completed goals are skipped; each candidate is searched with the existing `Planner.search`, its node bound and a four-unit time horizon.

```text
Initially: paid_work
  load_parcel -> to_market -> deliver_parcel

After executing load_parcel, critical(clinic) becomes true:
  unload_parcel -> load_medicine -> to_clinic -> deliver_medicine
```

The test recomputes the next action after each committed step, checks actual cargo/delivery/payment, and verifies that the action definitions never change. Without the disturbance, the original job completes. A dead canonical courier cannot act.

**What this proves:** the existing single-goal symbolic planner can supply multi-step means while a small external selector changes its chosen goal. It does not infer urgency, decide moral priorities, model beliefs, negotiate, or assess uncertain actions. The two objectives compete for immediate resources; they are not permanently mutually exclusive. The priority function is authored, not emergent reasoning.

## Still untested

Neither experiment validates compelling authored adventures, social acceptance, meaningful character motivation, private knowledge, long-term faction behavior, or dramatic progression. The gate controllers are explicitly reactive. The courier demonstrates bounded replanning, not a general NPC architecture. Both use small known worlds, grounded actions, controlled inputs and test-only orchestration; neither original experiment is integrated into campaign play or a persistence/save format. The subsequent [playable campaign slice](playable-campaign.md) integrates these mechanics through the existing campaign runtime.

The next product question is whether authors can express a few consequential competing goals and acceptable methods as reusable data, with understandable decisions and refusals. That requires its own authoring experiment, not a larger claim about these passing mechanics tests.
