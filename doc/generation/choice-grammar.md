# Public creature generators

The public generators are `creature`, `dragon`, `animal`, `humanoid` and `construct`. Every one returns a complete Kyr-compatible definition through the installed Deem CLI, without a Kyr runtime, injected tables or injected functions.

```sh
deem run --type creature --seed public-cli
deem run --type dragon --seed public-cli
deem run --type animal --seed public-cli
deem run --type humanoid --seed public-cli
deem run --type construct --seed public-cli
```

## Decomposition

`creature` chooses a category from `creatureFamilyPool[terrain]`, or dispatches the supplied family through `creatureFamilies`. A supplied canonical race can resolve its category from the ordinary eligibility rows. It does not select dragon lineage, maturity, class, material or role. It contains no dimension registry, request interpreter, predicate evaluator or family switch.

Each public category selects its own eligible kind and relevant dimensions:

| Generator | Choices it owns |
|---|---|
| `dragon` | Shared dragon body; compatible lineage and maturity |
| `animal` | Animal body/species |
| `humanoid` | Ancestry, compatible class, proficient weapon and armor |
| `construct` | Fixed body, compatible material and role |

The public generators initialize all their inputs themselves. They do not require a prior call to `creature`. Their `_..._body` helpers are explicitly internal construction patterns; they compose the selected overlays through native `*` fields. All categories call one `_creature_complete` helper for defaults, environmental adaptation, authored name/level, final statistics and deduplication. The complete body is passed in a private field so finalization does not add the same scores twice. Helper contracts are internal to a self-contained category, rather than implicit prerequisites supplied by a factory.

The former `creature_choice`, `creature_constraints`, `_choiceTable`, `_choiceGroup`, `_choiceCondition`, `eval` and giant cross-family predicate are gone. `wolf` is a species, not a family. Public animal calls use `body=wolf`; Kyr's existing species convenience API passes its race to Deem, which selects the category.

## Constraint calls use native scoped parameters

Deem now supports optional object overrides with its existing `gen` function:

```json
{
  "blue_ancient": {
    "__no_id": true,
    "_parameters": {"lineage": "blue", "maturity": "ancient"},
    "*dragon": "=gen(dragon, #_parameters)"
  },
  "frost_bear": {
    "__no_id": true,
    "_parameters": {"body": "bear", "adaptation": "frost"},
    "*animal": "=gen(animal, #_parameters)"
  },
  "ranger": {
    "__no_id": true,
    "_parameters": {"raceId": "elf", "classId": "ranger", "level": 4},
    "*humanoid": "=gen(humanoid, #_parameters)"
  }
}
```

The one-argument `gen(type)` still inherits context. The second object overrides that child context; it is not composed into the caller's output. This matters for numeric constraints: putting `level: 4` beside `*result` would add the caller's 4 to the generated 4. Keeping parameters in `_parameters` produces level 4. The CLI has no arbitrary context flags; the smoke fixture loads these ordinary parameter-binding callers together with the shared templates.

```sh
fixture=$(mktemp -d /tmp/kyr-public-creatures.XXXXXX)
bun run bin/prove-creature-choices.ts prepare "$fixture"
deem run --type blue_ancient --seed choice- --templates "$fixture/templates.json"
deem run --type bear_fixed --seed choice- --templates "$fixture/templates.json"
deem run --type ranger_fixed --seed choice- --templates "$fixture/templates.json"
deem run --type guardian_fixed --seed choice- --templates "$fixture/templates.json"
rm -rf "$fixture"
```

`family` and `terrain` are dispatcher constraints. Body/race and family-specific dimensions belong to the category that declares them; pass `family` when using them through the general generator, or call the category directly. There is no global solver inferring a family from an arbitrary future dimension name. Ambient inherited context is not a universal schema of strict arguments.

Missing dimensions generate choices. `terrain=any` is the explicit neutral context meaning unrestricted geography. `none` is a weighted neutral adaptation/material/role, not an obligatory default. Non-dragon starting level remains 1 unless supplied. Name, level, equipment and dimension requests are preserved; HP, mana and stored speed are derived after composition under the existing [statistic contract](statistic-contract.md).

## The two small general Deem capabilities

The dependency changes are applied in the sibling Deem checkout and captured in [deem-select.patch](deem-select.patch). They do not add a Kyr-specific evaluator or change the expression grammar:

- `select(table, group, predicate)` uses the same groups, frequency weights and seeded stream as lookup. Its predicate runs in the active runtime with the candidate bound as `__it`, so contextual functions and nested lookups work. No matching row throws. Legacy `lookup` retains its permissive fallback. Candidate binding also correctly overrides any outer `__it`.
- `gen(type, parameters)` optionally overrides inherited child context with an object. Existing one-argument behavior is retained. Runtime/setting/trace bindings remain authoritative.

The library tests cover contextual filtering, nested lookup, candidate binding, multiplicity weights, no-match errors and numeric scoped parameters. The inherited-context/weighted-table facilities already existed; no replacement generation engine was needed. Deem uses single-quoted predicate strings without interpolation; double-quoted strings interpolate `#variables`. Parenthesize compound conditions, especially negation, under its existing operator precedence.

## Declarative content and weights

`creatureFamilyPool` contains terrain-specific frequency lists of category names. Its unrestricted pool weights animal 5, humanoid 5, dragon 1 and construct 1. These are content frequencies, not combat-balance claims. Family eligibility rows own species/ancestry habitats and compatible class/adaptation/role pools. A body selected for a context must have an appropriate adaptation; for example a frost-terrain bear cannot take its neutral forest/mountain profile. A blue lineage excludes forest. Incompatible scoped requests throw through `select`, rather than silently accepting lookup's first-row fallback.

Native table flattening makes new overlay groups available to unspecified selection. Maturity weights are wyrmling 3, young 4, adult 2, ancient 1. Neutral adaptation has weight 4 against frost 1 and marsh 1. Neutral material and role have weight 2 against their current nonneutral option. Lineages and supported classes have equal weight. Repetition encodes frequency, not independent creature definitions.

- Another body: add its anatomy overlay and eligible kind row; register a new canonical species in Kyr if necessary. Broaden the terrain family pool if the new body introduces that category into a new context. No construction template or TypeScript family branch is needed.
- Another lineage: add its ordinary `dragonLineage` group with key, habitats and executable contributions. It automatically joins unspecified dragon generation; there is no second lineage-name list.
- Another adaptation/class/material/role: add its overlay and compatible eligibility data. Arbitrary biological compatibility is not assumed.
- Another family-specific dimension: add its selection and overlay to that family's definitions. The test adds a watchful dragon demeanor without changing `creature` or a central predicate.
- A different construction pattern: add a public category and its body pattern, dispatch and terrain-pool rows. Defaults and completion are reused.

The [compact CLI examples](public-cli-examples.json) record direct and constrained public commands with complete outputs. The [full CLI proof](choice-space-proof.json) samples 608 complete definitions: 32 seeds across fifteen public/parameterized contexts and 128 unrestricted extension seeds. It includes every public category directly, constrained calls to each, actual outputs and combat events. Temporary data-only additions introduce a canonical boar and jade lineage into unrestricted generation without editing templates. Seed reproducibility and rejection of an incompatible blue forest dragon are checked too.

Deem reduces string seeds to character sums; `choice-12` and `choice-21` collide. The sweep uses `choice-` followed by increasing numbers of `x` characters to obtain distinct sums. That limitation and the intentionally shared stream within an expansion are unchanged.

The supported pools remain bounded: two animals, two ancestries/classes, five dragon lineages/four maturities, and one construct body with material/role variation. Background, profession and spell-preparation orchestration, encounter budgets, generated sites/localities and the complete expedition remain unfinished. Geometric breath shapes and Orsino's copper blinding breath are also unsupported.
