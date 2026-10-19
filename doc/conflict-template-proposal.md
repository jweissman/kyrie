# One resource-gated capability structure, two situations

**Scope correction:** this models resource-gated capabilities, not yet dramatic conflict or meaningful NPC agency. See [the executable experiment and its limits](resource-gate-results.md).

**Original proposal:** try a reusable **withheld capability** situation: one party controls something another needs, has an explicit condition for enabling it, and faces a deadline. DEEM constructs its participants, links, requirements and initial resources. Kyr defines what transfers, installation and use actually do. Two small controllers evolve it; observers record results. No acts, secrets, governance, or general bargaining.

This deliberately covers one useful family of conflicts, not every dramatic situation. A hostage dispute or contested succession should not be squeezed into an industrial recipe.

## 1. DEEM constructs the situation

Orsino's actual [templates](../../orsino/settings/fantasy/templates.json) select class/racial data through tables, inherit context in nested generation, and compose results through overlays and subtemplates. Its [Template implementation](../../orsino/src/orsino/Template.ts) propagates context into `gen(...)`. Kyr already uses the same pattern for creature attributes. Apply that machinery to relationships as well as characters.

Below is source for an isolated generation setting. These are executable DEEM templates, expressed as JavaScript objects for compactness; no new generator is required. Matching context fields override template defaults before dependent properties are evaluated.

```ts
const tables = {
  conflictProfile: { discriminator: 'profile', groups: {
    bridge: {
      provider: 'wardens', beneficiary: 'village', asset: 'bridge',
      requiredGood: 'gold', requiredAmount: 4, mode: 'receipt',
      output: 'grain', recipe: 'carry_grain', operator: 'beneficiary',
      initial: { provider: { gold: 0 }, beneficiary: { gold: 2 },
        party: { gold: 2 }, source: { grain: 3 } }
    },
    pump: {
      provider: 'guild', beneficiary: 'district', asset: 'pump',
      requiredGood: 'filter', requiredAmount: 2, mode: 'install',
      output: 'water', recipe: 'purify_water', operator: 'provider',
      initial: { provider: { filter: 0, coal: 2 },
        beneficiary: { filter: 1 }, party: { filter: 1, coal: 1 },
        source: { raw_water: 3 } }
    }
  }}
};
const templates = {
  conflict: {
    __no_id: true,
    _profile: '=lookup(conflictProfile, #profile)',
    provider: "=dig(#_profile, 'provider')",
    beneficiary: "=dig(#_profile, 'beneficiary')",
    asset: "=dig(#_profile, 'asset')",
    requiredGood: "=dig(#_profile, 'requiredGood')",
    requiredAmount: "=dig(#_profile, 'requiredAmount')",
    mode: "=dig(#_profile, 'mode')",
    output: "=dig(#_profile, 'output')",
    recipe: "=dig(#_profile, 'recipe')",
    operator: "=dig(#_profile, 'operator')",
    initial: "=dig(#_profile, 'initial')",
    deadline: '=4 + 1d3',
    control: '=gen(control)', term: '=gen(term)', need: '=gen(need)'
  },
  control: { __no_id: true, holder: '=#provider', asset: '=#asset' },
  term: { __no_id: true,
    creditor: '=#provider', debtor: '=#beneficiary', asset: '=#asset',
    resource: '=#requiredGood', amount: '=#requiredAmount', mode: '=#mode'
  },
  need: { __no_id: true,
    party: '=#beneficiary', resource: '=#output', amount: 3,
    deadline: '=#deadline', onMiss: 'record_deficit'
  }
};
```

The two table entries supply content and constraints, not separate construction algorithms. `control`, `term`, and `need` are reusable record constructors; nested `gen` calls inherit their bindings. A context can override `requiredAmount`, `deadline`, or the entire `initial` stock record without copying a template. Reject inconsistent combinations after generation; do not silently repair them.

Use the existing DEEM entry points:

```ts
const setting = buildSetting(tables, templates);
const context = { profile: 'bridge', deadline: 6 }; // second: pump, 5
const runtime = Template.bootstrapDeem({ seed: 'conflict-study' }, setting);
const situation = Generator.gen('conflict', {
  ...context, __setting: setting, __deemRuntime: runtime
});
```

## 2. Resulting adventures

I ran both contexts through the existing DEEM runtime and checked repeatability. These are the generated relationship records; repeated scalar bindings and the unchanged `initial` stock objects shown above are omitted here.

```json
{
  "control": {"holder":"wardens","asset":"bridge"},
  "term": {"creditor":"wardens","debtor":"village","asset":"bridge",
           "resource":"gold","amount":4,"mode":"receipt"},
  "need": {"party":"village","resource":"grain","amount":3,
           "deadline":6,"onMiss":"record_deficit"},
  "recipe":"carry_grain", "operator":"beneficiary"
}
```

The wardens want compensation; the village wants its three sacks across before winter. It has only two coins and would prefer not to spend them. Paying enables passage; it does not declare friendship or erase the expenditure.

```json
{
  "control": {"holder":"guild","asset":"pump"},
  "term": {"creditor":"guild","debtor":"district","asset":"pump",
           "resource":"filter","amount":2,"mode":"install"},
  "need": {"party":"district","resource":"water","amount":3,
           "deadline":5,"onMiss":"record_deficit"},
  "recipe":"purify_water", "operator":"provider"
}
```

The guild refuses to operate unsafe machinery; the district wants water immediately but owns only one replacement filter. Unlike passage, pumping needs a qualified operator and consumes fuel every use. Money does not substitute for filters, and removing the guild would not make missing parts appear. This is a different operational problem within the same conflict structure.

## 3. Kyr gives the records executable meaning

The loader assigns module-scoped IDs, creates typed parties/assets/stocks, and binds any representatives to canonical creature IDs. Existing inhabitants are referenced, not regenerated on entry. Controllers must respect their representatives' ability to act. For this fixture, actors can interact at the checkpoint/workshop; source stocks are capability-bound inputs, not goods that a local transfer can move across a closed bridge or turn into potable water.

Minimal shared facts and proposed schema signatures:

```kyr
Relation controls(party, asset).
Relation enabled(asset).
Measure quantity(entity, good).
Measure received(term).
Measure delivered(need).

Action transfer(actor: party, recipient: party, goods: good,
                amount: number, toward: term).
Action activate(actor: party, target: asset).
Action perform(actor: party, target: asset, for: need).
```

These parameterized actions are **proposed**, not current `Kyr.ohm` syntax. Their exact contracts are small:

| Shared action | Authoritative checks and effects |
|---|---|
| `transfer` | Check custody, access, positive amount and balance; atomically debit/credit stocks. A matching transfer toward a term also increments its receipt counter. Existing unrelated wealth is not payment. |
| `activate` | Require control and the term's matching receipts. Receipt mode records permission without consuming payment again. Install mode additionally consumes the specified physical components and records installation. Both enable the asset once. |
| `perform` | Require enabled asset, permitted operator, valid input stock and unmet need. Execute one registered recipe batch and increment delivery. Never generate missing ingredients. |

Only two ruleset recipes are needed: `carry_grain` moves one existing sack from the linked source to the beneficiary; `purify_water` consumes one raw-water unit and one provider coal, producing one delivered water unit. These are trusted ruleset definitions, not arbitrary conversion instructions sampled by DEEM. Activation of the pump is also its safety prerequisite.

At each watch: one player command, then provider, then beneficiary, each at most one command; finally check the deadline. Two policies suffice:

- **Provider:** enable when its condition is satisfied; otherwise hold. Once enabled, perform while the need is unmet if the profile assigns operation to the provider.
- **Beneficiary:** while provision is incomplete, contribute available matching inputs toward the unsatisfied term; otherwise perform if assigned operation. An impossible action produces an obstruction, not a fabricated resource.

No planner is necessary for this first experiment. Goals select from these permitted actions. Read-only observers record `enabled`, `provisioned`, and the deadline's frozen deficit; observer records never authorize physical changes.

## 4. Choices produce different developments

| Situation | Player choice and evolution | Persistent consequence |
|---|---|---|
| Bridge | Donate two coins in watch 1; village contributes its two. Wardens enable in watch 2; village carries sacks in watches 2–4. | Provision achieved; wardens received four real coins, both donors spent their balances. |
| Bridge | Decline to contribute. Village contributes two, but the condition remains unmet through watch 6. | Blockade persists; deficit three recorded. No forced battle or invented concession. |
| Pump | Supply one filter in watch 1 and one coal in watch 2. District contributes its filter; guild installs in watch 2 and pumps in watches 3–5. | Safety restored and provision achieved; filters and fuel consumed. |
| Pump | Supply the filter but keep the coal. Guild installs, then pumps only twice. | Capability enabled but deficit one at watch 5. Settling the dispute was insufficient to meet the need. |

Late help may improve present circumstances but cannot retract a recorded missed deadline. Other player capabilities can participate later; the template contains no named “donate,” “fight,” or “negotiate” solution branches.

## 5. Author responsibility and the next test

**Author/ruleset:** choose the actual disagreement, acceptable inputs, resource ownership, recipe, operator qualifications, policy limits, and meaning of a missed deadline. Those choices carry the drama. **DEEM:** compose their linked records, bind supplied overrides, and safely sample approved profiles/amounts/timings. Sampling must preserve declared constraints; it should not guarantee a painless solution. Validate references, positive quantities, supported modes/recipes and compatible input/output types before execution.

**One next test:** a table-driven headless test generates both contexts, lowers their records into the existing `World`, and runs the four command tapes above through the same tiny action definitions. Assert the predicted deficits and conserved/consumed resources; rerun with the same seed; then disable observers and require identical world histories. Use the existing `World.apply` transaction mechanism, not another effect interpreter. Only generation has been executed for this proposal; that execution adapter is the next experiment.

Do not extend the large crossing study, add social subsystems, or replace the current module generator yet. The product test is whether authors can change the conflict's content and operating constraints through tables/context while retaining one comprehensible construction and execution contract.
