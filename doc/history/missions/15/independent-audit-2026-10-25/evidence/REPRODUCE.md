# Reproduction record

The live audit clone is `/tmp/kyrie-review-20261025/kyrie`, detached at `ab9055a2a2f832330c2ad80e0217444b51dfc8d3`. Sibling Deem and Languages clones are pinned in the report. The builder's live checkout was never used to run probes or modified by them.

To reconstruct: clone Kyrie to a separate directory; checkout the report's exact SHA; clone and checkout both pinned dependencies beside it; run `bun install --frozen-lockfile` in each dependency and Kyrie. Bun is 1.4.3. Copy the retained probe `.ts` files into an `audit/` directory directly below that isolated Kyrie root. They intentionally use production APIs and relative fixture paths. `probes.ts` and `fiction.ts` write small audit-only modules under `audit/`.

Extract the independent content into this isolated tree using `git archive <exact-adventure-SHA> <paths> | tar -x`, with the branch commits available as refs/objects. Do not substitute those branches' old engine code. Paths:

- Thrume: `data/adventures/thrume`, `data/campaigns/thrume.campaign.json`, `test/thrume.test.ts`, `test/fixtures/thrume-tomb`, `doc/adventures/thrume`.
- House: `data/adventures/house-that-grows`, `data/campaigns/the-house-that-grows.campaign.json`, `test/house-that-grows.test.ts`, `doc/adventures/house-that-grows`.
- Patient Star: `data/adventures/patient-star`, both `data/campaigns/hold-one-season.campaign.json` and `data/campaigns/the-patient-star.campaign.json`, `test/fixtures/patient`, `test/hold-one-season.test.ts`, `test/patient-star.test.ts`, `test/patient-probes.test.ts`, `doc/adventures/patient-star`.

The Patient Star branch itself lacks `test/fixtures/patient/law-sells/site/module.json`; P8's ENOENT is preserved, not repaired. The first season run preceded extracting its complete fixture tree; use `season-complete.log` for the corrected opening-suite result.

Commands used, from the isolated Kyrie root:

```sh
bun audit/probes.ts
bun audit/catalog-poison.ts
bun audit/lifecycle.ts
bun audit/fiction.ts
bun test test/module-shadow.test.ts test/frontier-replay.test.ts test/drawn-replay.test.ts test/save-codec.test.ts test/command-contract.test.ts test/candidates.test.ts
bun test test/authorability-probes.test.ts test/authoring-guide.test.ts test/authoring.test.ts test/the-dead.test.ts test/prose-fit.test.ts
bun test test/composition.test.ts test/continuation.test.ts test/deep-argument.test.ts test/journey.test.ts
bun test test/thrume.test.ts test/house-that-grows.test.ts
bun test test/hold-one-season.test.ts
bun test test/patient-star.test.ts
bun test test/patient-probes.test.ts
bun run typecheck
bun run web:build
bun scripts/journey-profile.ts wren --out ../wren.jsonl --every 50 --deadline 240
LD_LIBRARY_PATH=/tmp/kyr-browser-deps/unpack/usr/lib/x86_64-linux-gnu bun scripts/journey-browser.ts ../wren.jsonl wren --every 50 --out ../browser.jsonl
bun scripts/journey-profile.ts audit-frontier --wander 110 --out ../frontier.jsonl --every 25 --deadline 180 --checkpoint-every 50 --checkpoints ../checkpoints
bun audit/restore-profile.ts
/usr/bin/time -v bun scripts/sim-bench.ts wren --layers A,B
bun audit/phases.ts
```

The existing `--wander 110` option selects wandering but does not limit the run to 110 commands; the run stopped after 284 commands when its next choice was unavailable. Use `--steps` to impose a count. Checkpoints are retained in the temporary audit directory (59 MB total), not copied into the builder's documentation. `restore-profile.ts` reads step 250; reproduce the profile first. Browser runtime dependencies and permission requirements are environment-specific, not repository defects.

CLI checks used bad-kind fixture lint/compile (both exit 1), a deliberate failing external `/tmp/kyrie-audit-canary.test.ts` through `bin/kyrie test` (exit 1), absolute moon-gate campaign lint from `/tmp` (exit 0), and the moon-gate fixture copied to `audit/path with spaces/` (absolute campaign path, exit 0). The canary is not part of the repository suite.

Broad test attempt: `bun test --parallel --path-ignore-patterns='test/(thrume|house-that-grows|hold-one-season|patient-probes|patient-star).test.ts'`. It was terminated after approximately five minutes with no summary. No coverage, success or regression conclusion is drawn from it. A simultaneous builder parallel suite was observed; only the audit's identified runner and worker were terminated.

`summary.json` is computed from the retained JSONL records using the source profiler's percentile convention. C saves are separately timed, not included in command totals. Browser page heap does not measure the engine worker heap. `phases.ts` uses temporary inclusive method wrappers; nested observation/choice times overlap. All timings are subject to the shared-machine conditions in the report.
