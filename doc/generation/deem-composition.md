# Independently invocable creature grammar

Read [the public grammar](choice-grammar.md) for the current decomposition, scoped parameters, selection semantics and authoring costs.

```sh
deem run --type creature --seed public-cli
deem run --type dragon --seed public-cli
deem run --type animal --seed public-cli
deem run --type humanoid --seed public-cli
deem run --type construct --seed public-cli
bash test/smoke-deem-choices.sh > /tmp/choice-space-proof.json
bash test/smoke-deem.sh > /tmp/creature-proof.json
```

`creature` dispatches through ordinary context/family tables. The four public categories initialize their own kind/dimension selections and return complete definitions. Explicitly internal body patterns compose their selected overlays; one `_creature_complete` helper owns defaults, shared adaptation and finalization. Adding a family-specific dimension does not change the dispatcher.

Deem's general `select` addition provides strict contextual weighted selection; optional `gen(type, parameters)` provides scoped object overrides without numeric caller/output merging. The [dependency patch](deem-select.patch) captures the changes applied to the sibling Deem checkout. No expression-grammar change, Kyr-specific selector or runtime table projection is used.

Native `*` overlays add numbers, concatenate arrays, replace strings, OR booleans and shallow-merge objects with existing keys winning. `>` forces final explicit/derived values. Internal fields disappear through Deem's normal cleanup. These existing rules are tested. The former `_choice*`/`eval` selection interpreter is removed.

`CreatureDefinition.accept` validates the finished flat definition, groups immutable base scores and mutable state, and materializes selected equipment. It chooses no family or dimensions. Natural equipment must match canonical anatomy; carried equipment must be proficient. Combat uses existing attacks, area targeting, saves, mitigation and cooldowns. See [statistic ownership](statistic-contract.md), [authoring additions](authoring-cost.md) and [verification](verification.md).

The broader generated-expedition mission remains incomplete. Existing Serewater and Red Crag playthroughs provide regression coverage, not proof of generated encounters/sites/localities or a generated expedition. Background/profession/spell-choice orchestration also remains outside this bounded Deem path.
