# Public-generator verification

Finalized source verified on 2026-10-20. [Per-file results and exact serial retry commands](verification-results.json) retain both the initial timing failures and successful retries.

## Kyr

Every test file was run with `bun test ./<path>` in eight isolated processes. Equivalent shell command:

```sh
rg --files test -g '*.test.ts' | sed 's|^|./|' | xargs -P8 -n1 bun test
```

The batch returned **178 passed, 4 skipped, 4 timed out**, across all 28 files. The four timeouts were browser-asset parity, two causal-integration cases and Caught Below's closing-passage case. Each was rerun serially through Bun's `--test-name-pattern` flag, without changing source or timeout limits, and passed.

The complete test set is therefore **182 passed, 4 skipped, 0 unresolved failures** (186 tests). This is a full-suite verification with serial timing retries, not a claim that the parallel attempt was initially green. The four skips belong to the opt-in real-browser suite, including its setup/teardown hooks; `KYRIE_BROWSER` was unset.

```sh
bun run lint
bun run typecheck
```

Lint, root typecheck and web typecheck passed. The focused generator/domain/lifecycle/statistic tests separately passed 48 tests across six files.

## Installed CLI and executable creatures

```sh
bash test/smoke-deem.sh > doc/generation/creature-proof.json
bash test/smoke-deem-choices.sh > doc/generation/choice-space-proof.json
```

Both passed against the installed Deem CLI. The second script generates and validates 608 complete definitions: 32 distinct seeds across fifteen direct/parameterized contexts, plus 128 unrestricted extension seeds. It covers direct `creature`, `dragon`, `animal`, `humanoid` and `construct`; constrained calls to every category; terrain compatibility; lineage/maturity/body/ancestry/class/material/role diversity; reproducibility; rejection of an incompatible blue forest dragon; and table-only boar/jade-lineage extension. Generated capabilities execute through Kyr combat. The ordinary automated test invokes this public-CLI script.

[Compact examples](public-cli-examples.json) contain the exact public commands and outputs; the full proofs retain sample selections and combat events. A unit extension also adds a dragon-only demeanor without changing the general dispatcher. Scoped `gen(type, parameters)` is tested with level 4 to catch additive caller corruption.

## Deem dependency

From the sibling Deem checkout:

```sh
bun test
bun run typecheck
```

**100 tests passed, 0 failed**, across 13 files (387 assertions); typecheck passed. The new tests cover strict contextual selection, nested lookup, candidate binding, native frequency weights, no-match errors, inherited context and scoped object parameters. Existing one-argument generation and permissive lookup tests pass.

The changes are already applied to that dependency here and are captured in [deem-select.patch](deem-select.patch) for review/reproduction in another checkout. Kyr's existing `file:../deem` dependency uses this implementation. No Kyr-only injected functions or table adapter are required.
