# Attribute generation correctness

Current audit note (2026-10-18): the Orsino checkout at `4cb27ce` now uses division by two in Fighting.statMod. The account below records Kyr’s earlier reviewed division-by-three convention, which Kyr still uses. See [the compatibility report](orsino-compatibility.md) for the explicit difference; do not treat this historical attribution as current source compatibility.

The schema is six **scores**: `strength`, `dexterity`, `intelligence`, `wisdom`, `constitution`, `charisma`. Neither the template output nor the canonical creature/combat projection stores `strengthScore`, `scores`, or cached modifiers. Call `statMod(score)` where a modifier is required.

The rule is Orsino's `Math.round((score - 10) / 3)`, not D&D's usual division by two, and not Kyr's previous `max(0, floor(...))`. Scores 3/6/9/10/12/15/18 yield -2/-1/0/0/1/2/3. Zero is normalized to positive zero; the function rejects nonnumeric, noninteger and nonpositive scores, and accepts scores above 18 for future rules. Generation normally rolls 3d6. Kyr's existing selected-primary bonus remains +2, capped at 18; this does **not** import Orsino's entire class/racial bonus system. Explicit score overrides are exact, not rerolled, bonused, or capped. The standalone template has no implicit primary. A creature normally obtains its primary from class data, with an explicit `primary` context taking precedence.

## Evidence from implementations

Inspected actual source and tests, rather than inferring DEEM syntax from JavaScript:

- [Orsino Fighting.statMod](/home/jweissman/work/orsino/src/orsino/rules/Fighting.ts:28) defines the rounding formula. [Its DEEM stdlib](/home/jweissman/work/orsino/src/deem/stdlib.ts:159) registers a wrapper calling that same rule. Orsino's older evaluator used a static library; current standalone DEEM uses per-runtime libraries.
- [Orsino character templates](/home/jweissman/work/orsino/settings/fantasy/templates.json:119) roll scores, overlay authored class/background/race data, and invoke `statMod(#con)` to derive HP. This provides the score/derived-modifier convention; it does not mandate importing that entire generator.
- [DEEM Template](/home/jweissman/work/deem/src/Template.ts:18) supplies contextual `defined`, `gen`, `genIsolated`, lookup and evaluation helpers. `defined(name)` receives a bare identifier as the literal string `name`; quoted string keys work too. It checks the active context for a value other than `undefined`; it is not JavaScript variable lookup. `#name` dereferences context, and missing references throw. Ternary branches are evaluated lazily.
- [Template assembly](/home/jweissman/work/deem/src/Template.ts:220) processes keys in declaration order. Context values override ordinary keys and suppress their default expression. Prior assembled values become available to later expressions. `_` keys participate normally during assembly and inherited generation, then disappear from public output. They are not deferred variables or JavaScript private members. `__no_id` suppresses automatic identifiers.
- `gen(child)` inherits the current context and shares the same runtime/RNG. `genIsolated` excludes inherited fields but still shares the runtime. `*child` overlays the generated record: numbers add, arrays concatenate, strings replace. It is **not** an object-spread replacement. Avoid declaring a numeric score in a parent and then overlaying the same inherited score again: 3 plus an inherited 3 becomes 6. Kyr's creature template supplies overrides via context and overlays attributes once, with no preassembled duplicate scores.
- [DEEM evaluator](/home/jweissman/work/deem/src/deem.ts:21) supports `stdlib` constructor registration and a public per-instance `stdlib`; contextual functions are resolved against the active evaluation context. [DEEM contextual tests](/home/jweissman/work/deem/test/template.extra.test.ts:1) cover inherited helpers, omitted internals and overlays; [evaluator tests](/home/jweissman/work/deem/test/deem.test.ts:137) cover nested-context reentrancy.

The old `_primary` expression was redundant, rather than evidence of recursive evaluation: an inherited `_primary` suppresses its default before evaluation; without one, the old `defined('_primary')` was false. The new default reads the distinct public input `primary` or uses an empty selector. The parent creature's `_primary` still inherits naturally into the child.

## Changes and shared function boundary

`data/default/templates/deem.templates.json` now emits the six scores directly. `src/fantasy-rules.ts` is the single pure implementation of `statMod`. `Content` registers it on the bootstrapped generation runtime's existing library; `Expressions` registers the exact same function through DEEM's `stdlib` option. Nested generation retains that runtime. No global evaluator replacement, generator extension, or DEEM source patch was needed.

The existing canonical `Creature.base` and detached `Fighter` now contain those scores directly. Score overrides use `{strength: 18}`, not `{strengthScore: 18}`. Old serialized creatures containing the redundant `scores` record are explicitly rejected as requiring migration; there is no silent reinterpretation of old modifiers as scores or automatic save reset.

HP/speed generation, saving throws, and shipped ability expressions now request derived modifiers explicitly. Damage/healing expressions clamp the **final amount** to zero when necessary; HP has a minimum of one and speed a minimum of zero. The modifier itself remains signed. `Expressions.integer` supports signed results, while `number`/effect amounts retain their nonnegative contract. Because the former rounding/clamping was wrong, generated values and exact seeded combat outcomes may change compared with the old implementation; repeatability is preserved within the corrected rules.

## Executed examples

From the Kyr repository, using the installed DEEM CLI linked to `../deem/bin/deem.ts`:

```sh
deem run --type attributes --seed attribute-review
```

```json
{"strength":12,"dexterity":9,"intelligence":9,"wisdom":9,"constitution":10,"charisma":15}
```

The scores of 9 yield zero modifiers under Orsino's rounding rule; low scores such as 3 or 6 yield negative modifiers. These modifiers are computed, not output fields. `--count 3` produced additional records including `{strength:9,dexterity:17,intelligence:13,wisdom:6,constitution:12,charisma:10}`.

A temporary CLI fixture reused the **actual** attributes definition with this contextual caller:

```json
{"caller":{"__no_id":true,"_primary":"wisdom","strength":3,"charisma":18,"child":"=gen(attributes)"}}
```

```sh
deem run --type caller --seed attribute-review --templates /tmp/kyr-attributes-cli.json
```

```json
{"strength":3,"charisma":18,"child":{"strength":3,"dexterity":12,"intelligence":9,"wisdom":11,"constitution":9,"charisma":18}}
```

This exercises inherited exact scores, internal primary selection, omitted internal output, and nested generation through the actual CLI. The temporary fixture contains the production attributes definition plus the shown caller; it is not another production template. DEEM's stock CLI has no custom-function module loader, so these CLI checks intentionally use score-only attributes. Creature templates requiring Kyr's registered `statMod` and synthesized race/class tables are exercised through `Content`, their normal host; stock CLI absence of application registrations is not an evaluator defect.

## What the tests prove

`bun test test/attributes.test.ts test/creature-generation.test.ts` checks:

- Exactly the six score keys; no IDs, leaked `_` fields, cached modifiers or intermediate score records.
- Known modifier pairs independently of generation, shared registration in template/runtime hosts, signed expression results and invalid inputs.
- For 256 fixed seeds, each of the 1,536 generated scores equals the corresponding direct DEEM `3d6` roll. Per-stat sample means range from 10.211 to 10.680 around the theoretical 10.5; 591 scores are below 10 and 142 are at least 15, with observed bounds 3–18. This checks actual distribution and draw ordering, not merely absence of exceptions.
- All six primary selectors across multiple seeds: only the selected stat gains +2, capped at 18. All six explicit overrides survive, including low scores and an overridden primary. Invalid canonical inputs and obsolete override names are rejected.
- All class defaults, explicit primary replacement, `character -> creature -> attributes` inheritance, exact score overrides, numeric overlay behavior, and registered functions used after nested generation.
- Identical seed/context reproduce complete output; different seeds vary it. The automated CLI-entrypoint checks call DEEM's own `runGeneration`; separate shell commands above exercise the actual `deem run` executable.

There is no isolated DEEM engine failure to report or patch. The defect was Kyr's template/schema/formula convention and insufficient semantic tests. Future “validated template” claims should specify output invariants, override behavior, composition semantics, distribution checks, and deterministic inputs—not just that generation returned successfully.
