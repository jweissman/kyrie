# Development throughput and performance review

**Date:** 9 November 2026  
**Scope:** Read-only review of test execution cost, fixture architecture, verification scheduling, runtime performance, and author-integration cost  
**Repository state reviewed:** `main` at `c56669b4`, with focused measurements against the working tree  
**Excluded:** The previously reported player-intent and cross-hex travel defects, general engine redesign, workflow changes, test deletion, and implementation work  
**Central question:** If Westernesse's next thousand commits are to produce substantially more player-visible progress than its previous thousand, what should change about the development architecture and verification loop?

## Executive diagnosis

Westernesse pays too much per useful improvement primarily because its verification unit is too often a complete generated world or a long adventure history rather than the contract being changed.

The engine itself has already received substantial performance work. Ordinary local computation is not generally the dominant problem: in the current focused measurements, a fixed Serewater campaign loaded cold in 1.15 seconds and warm in 6 milliseconds; choices took 46 milliseconds; observation took 13 milliseconds; and an ordinary headless command generally completed in roughly 90–100 milliseconds at the median. The expensive development loop comes from repeatedly constructing, compiling, installing, and then walking large content graphs to reach a small assertion.

The strongest evidence is:

- The current timing inventory records 582 of 736 test files and totals 390.5 test-minutes. It omits about 154 files. One hundred and eight recorded files take at least one minute; fifty take at least three minutes.
- The ten slowest recorded files account for 74.6 test-minutes. Most are long authored journeys or repeated generated-world audits, not isolated engine contracts.
- Tests contain 251 calls to `WorldAssembler.assemble` across 182 files and 382 calls to `PlaySession.start` across 282 files. These source counts do not equal runtime invocation counts: loops and parameterized tests increase the actual total.
- Repeating generated `a1` in one process cost 656 ms assembly plus 5.81 s start, then 327 ms plus 5.02 s on the second run. Each assembly creates a fresh bundle source, so the existing campaign load cache cannot provide the 6 ms warm-load behavior seen when the same immutable fixture and source are reused.
- Every one of the 26 browser test files calls `SiteBuild.site`, so every browser file rebuilds the complete fixture-bearing browser artifact. The files also launch their own Chromium instances. CI's two browser shards consequently repeat expensive builds and browser lifecycles under contention.
- The latest inspected CI run had a 45m40s workflow wall clock. General shards ran 30–44 minutes, while browser shards failed after approximately 15 minutes. Checkout and installation were roughly one minute per job; test execution, not dependency installation, dominates.
- The existing changed-test selector is intentionally incomplete. Static TypeScript imports are handled by Bun, but runtime-loaded content is selected by string matching. Changes to shared rules explicitly fall back to full CI because the selector cannot establish their affected worlds.

The result is a testing pyramid whose top is carrying too much semantic responsibility. Long journeys are valuable acceptance evidence, but they are repeatedly used to prove local rules, content predicates, and presentation semantics. This inflates compute consumption, lengthens diagnosis, and makes generic engine changes pay for the entire authored corpus on every push.

The highest-leverage response is not fewer checks. It is to make expensive checks depend on cheaper, explicit contracts and to reuse immutable construction products safely:

1. Define three reusable fixture levels and make narrow tests stop at the lowest sufficient level.
2. Build the browser artifact once per CI run or shard and reserve Chromium for actual interface behavior.
3. Record content dependencies during fixture construction so author tests can be selected reliably, while retaining broad validation for changes to shared rules, generators, loaders, persistence, and module composition.

These changes preserve full scheduled and release validation. They move it off the critical path of every ordinary edit.

## 1. Evidence and measurement limits

This review used:

- `.github/workflows/ci.yml` and current package scripts;
- `test/timings.json`;
- source counts and representative inspection of the longest tests;
- current GitHub Actions job and step timestamps for run `42635042991` at `c56669b4`;
- the existing `scripts/bench.ts`, `scripts/sim-bench.ts`, and `scripts/scale-bench.ts` harnesses;
- focused repeated generated-world assembly and session-start measurements; and
- existing M15 and M19 browser/runtime profiles where a current browser reproduction would have required rebuilding the test site.

No full test suite was run. No browser suite was rerun. No workflow or implementation file was changed.

Important limitations:

- Checked-in per-file timings are stale for 154 files and include several 180-second estimates or timeout-shaped values.
- Per-file timing does not separate parsing, generation, installation, test setup, and simulation within the file.
- CI step timestamps show job-level critical paths but not CPU contention or per-test profiles.
- Current headless measurements were made in this workspace, not on GitHub runners, and should be compared by shape rather than absolute value.
- Current browser interaction and rendering latency was not remeasured. The browser findings combine CI step timings, source inspection, and the repository's recent instrumented M15/M19 profiles.
- Maximum resident set size from `/usr/bin/time` is a process peak, not retained application memory after garbage collection.

## 2. Current CI critical path

The latest inspected CI run took approximately **45 minutes 40 seconds wall-clock**. The jobs ran concurrently, so this differs from aggregate runner consumption.

| Job | Test-step time | Job wall time | Result |
|---|---:|---:|---|
| Suite 1/5 | 44m19s, then cancelled | 45m14s | Cancelled |
| Suite 2/5 | 34m41s | 35m40s | Passed |
| Suite 3/5 | 37m42s | 38m35s | Passed |
| Suite 4/5 | 30m15s | 31m20s | Passed |
| Suite 5/5 | 30m10s | 31m09s | Passed |
| Browser 1/2 | 14m37s | 15m52s | Failed |
| Browser 2/2 | 15m26s | 16m50s | Failed |
| Long descents | 2m07s | 3m04s | Passed |
| Lint and types | 58s | 1m56s | Passed |

The general suite is the developer critical path. Its aggregate test execution across five runners was at least 177 minutes before the cancelled shard is counted in full. The browser jobs add about 30 runner-minutes. Checkout, Bun setup, Orsino checkout, dependency installation, and Chromium installation are repeated, but they are not the principal cost:

- Main checkout took approximately 48–61 seconds per job.
- Bun installation took about one second in this run.
- Chromium dependency installation took 16–18 seconds per browser job.
- The suite test steps took 30–44 minutes.
- Browser test steps took 14–15 minutes.

Caching package installation alone would therefore improve cost modestly but would not transform feedback latency.

### Timing distribution

The checked-in inventory reports:

| Metric | Recorded value |
|---|---:|
| Test files in repository | 736 |
| Files with recorded timings | 582 |
| Files without recorded timings | about 154 |
| Recorded aggregate duration | 390.5 minutes |
| Recorded files at least 60 seconds | 108 |
| Recorded files at least 180 seconds | 50 |
| Ten slowest files | 74.6 minutes |

The ten slowest recorded files are:

| File | Recorded seconds | Character of work |
|---|---:|---|
| `circus-phase2.test.ts` | 622 | Repeated starts and long calendar/adventure histories |
| `low-water-beyond.test.ts` | 594 | Many separate full-path scenario journeys |
| `world-lint.test.ts` | 584 | Five generated worlds, full campaign lint, then another generated world/session |
| `what-tessary-owes.test.ts` | 534 | Long authored outcomes and repeated setup |
| `gosses-company.test.ts` | 427 | Long adventure histories |
| `hessel.test.ts` | 358 | Adventure integration paths |
| `quittance-coldlamp.test.ts` | 356 | Many scenario actions and branches |
| `circus.test.ts` | 352 | Full circus paths and time advancement |
| `the-third-night.test.ts` | 331 | Long scenario progression |
| `low-water.test.ts` | 317 | Repeated full-world adventure paths |

These are valuable corpus checks. They are poor prerequisites for a small engine edit because failures occur far from the changed contract and are expensive to reproduce.

## 3. Where execution time goes

### 3.1 Kyr parsing, compilation, and installation

The architecture already caches parsed module text and shared joined rules in `src/campaign/module-bundle.ts`. A fixed campaign loaded by `scripts/bench.ts` showed the benefit directly:

| Operation | Current measurement |
|---|---:|
| Fixed Serewater fixture, cold `PlaySession.start` | 1,151 ms |
| Same fixture and source, warm `PlaySession.start` | 6 ms |

This means parsing and deterministic installation are already highly reusable when cache identity is stable.

Generated-world tests often do not obtain that benefit. A focused one-process measurement using the normal generated-world path produced:

| Run | Assembly | Session start |
|---|---:|---:|
| `a1`, first | 656 ms | 5,810 ms |
| `a1`, repeated | 327 ms | 5,018 ms |
| `thorn`, same process | 414 ms | 4,731 ms |

The second `a1` assembly is cheaper because lower-level drawing/template caches are warm, but the session is still reconstructed. `WorldAssembler.assemble` returns a new in-memory source, and the campaign load cache keys partly by source identity. Identical generated content therefore fails to behave like an immutable reused fixture.

Recent M19 profiling also found that first-browser-world startup is dominated by parsing generated Kyr. Generated content is emitted as Kyr and then parsed so it is checked against the same language as authored content. That is a valuable correctness boundary. Replacing it with direct AST generation would be a high-risk architectural change and is not justified for the development-loop problem.

### 3.2 Deem generation and world assembly

World assembly itself was hundreds of milliseconds in the focused starting-world measurements, not the five-second majority. The larger expense follows when the generated manifests and sources are parsed, installed, populated, projected, and checked.

The current scale harness shows the resulting world size matters:

| Installed scenarios | Modules | Entities | Schemas | Load | Choices | One tick | Save size |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 | 21 | 7,516 | 1,340 | 3,680 ms | 163 ms | 281 ms | 20,774 KB |
| 6 | 24 | 7,805 | 1,356 | 3,780 ms | 135 ms | 293 ms | 21,241 KB |
| 7 | 26 | 8,074 | 1,378 | 3,912 ms | 151 ms | 292 ms | 21,775 KB |
| 8 | 29 | 8,244 | 1,385 | 4,041 ms | 155 ms | 270 ms | 21,865 KB |
| 9 | 31 | 8,379 | 1,390 | 4,066 ms | 151 ms | 287 ms | 22,009 KB |

The important result is not a dramatic nonlinear runtime collapse. Load grows modestly with installed content, while choice and tick costs remain relatively flat. The large save size and roughly one-gigabyte process peak during the complete scale run make repeated concurrent full worlds expensive in CI even though individual operations remain usable.

### 3.3 Repeated campaign and player-state construction

The source inventory found:

- 251 `WorldAssembler.assemble` call sites across 182 test files;
- 382 `PlaySession.start` call sites across 282 test files.

Loops multiply these. `world-lint.test.ts`, for example, assembles and lints five complete generated worlds in one case, then assembles and starts another in the next. Many long adventure files start a fresh campaign for each outcome rather than restoring a prepared immutable checkpoint immediately before the branch.

Fresh state is necessary for isolation. Fresh parsing, compilation, generation, and installation are not always necessary.

### 3.4 Long histories used as setup

The longest adventure tests commonly replay dozens of labels to establish a local condition. `low-water-beyond.test.ts` repeatedly walks the route to the same acts before testing a distinct late outcome. `circus-phase2.test.ts` repeatedly starts the same campaign, advances through the same fair reckoning, and then branches.

This cost is partly real simulation—time advancement, rules, narration, observation, and action availability are all exercised—but much of it is duplicated prefix work. It also weakens diagnosis: a late assertion can fail because of any earlier presentation label, route, rule, or fixture change.

The right remedy is not to replace every path with state injection. Maintain one or two canonical honest paths, but derive immutable, validated checkpoints at semantically meaningful branch points for tests whose subject begins there.

### 3.5 Ordinary action and projection cost

Current `scripts/bench.ts` measurements on the fixed Serewater campaign were:

| Operation | Time |
|---|---:|
| Player choices | 46 ms |
| Player observation | 13 ms |
| Six-tick causeway movement | 64 ms |
| One wait | 17 ms |
| Six waits | 77 ms |
| Camp | 65 ms |
| JSON save and restore | 94 ms |

The save was approximately 1.65 MB. The process peaked at about 219 MB resident during this complete benchmark.

A current `a1` headless replay completed 59 commands before an obsolete recorded choice was no longer offered:

| Command class | p50 | p90 | maximum |
|---|---:|---:|---:|
| Local | 92 ms | 116 ms | 150 ms |
| Travel | 101 ms | 429 ms | 492 ms |
| Fight | 158 ms | 158 ms | 158 ms |
| All | 96 ms | 400 ms | 492 ms |

The full process, including generated-world start, peaked at about 791 MB resident. These are not browser paint times. They show that ordinary headless action cost is material but does not explain ten-minute test files by itself; repeated startup and long command histories do.

### 3.6 Save/load

Save and restore are inexpensive for the fixed Serewater fixture but grow with world and history size. The scale world saves were around 20–22 MB. Previous sustained-game profiling found the command log and repeated receipts dominated growing saves.

Tests that serialize after every step, or browser sessions that keep the entire world after every command, pay costs not necessary for a narrow rule assertion. Persistence tests should deliberately pay this cost. Other headless tests should not accidentally become persistence tests.

### 3.7 Browser construction and synchronization

There are 26 browser test files. Each calls `SiteBuild.site`, which:

- regenerates the asset catalog;
- bundles the engine worker with the complete data and test-fixture set;
- embeds that engine into the reader bundle;
- builds the board;
- publishes handbook and encyclopedia HTML; and
- copies styles, fonts, and paintings.

Each file then launches its own browser fixture. This means the browser layer repeatedly tests build reproducibility as a side effect of every UI spec. Under Bun's file parallelism, multiple large builds and Chromium instances can contend for CPU and memory.

The latest CI browser jobs spent only 16–18 seconds installing Chromium but 14–15 minutes executing tests. Build and browser lifecycle reuse are therefore substantially more valuable than caching the installed browser package.

Several browser tests also execute long simulation histories and inspect an exposed semantic screen model. Those histories can be headless contract tests. Chromium should retain responsibility for:

- rendering and layout;
- click, keyboard, focus, and target behavior;
- worker/reader protocol wiring;
- persistence through the browser store;
- representative scene and map rendering; and
- a small number of complete interaction journeys.

### 3.8 Parallelization and contention

Five shards are balanced by `test/timings.json`, but the inventory is incomplete and contains stale estimates. The 30–44 minute spread shows the current balance is poor. Files that construct large worlds concurrently also compete for memory and CPU, so adding workers may increase aggregate contention without reducing the longest shard.

The two browser shards similarly run multiple independent builds and browser instances. Build-once reuse should precede further sharding.

## 4. Recommended fixture architecture

Four explicit fixture levels are sufficient.

### Level 0: Isolated semantic fixtures

Small in-memory Kyr modules and synthetic worlds for parser, predicate, action, movement, objective, combat, inventory, and persistence contracts.

Properties:

- Tens of entities, not thousands.
- No Deem generation.
- No browser.
- One behavior per fixture.
- Expected runtime in milliseconds to low seconds.

Use this level for generic engine correctness. A movement legality or inventory-state test should not need an installed region unless the region is the subject of the test.

### Level 1: Compiled authored-module fixtures

Content-addressed compiled bundles for one adventure plus the shared rules and declared imports.

Properties:

- Parse and validate source once.
- Retain immutable module definitions and manifests.
- Create a fresh mutable campaign fork for each test.
- Exercise author contracts, namespacing, imports, actions, and consequences without world generation.

This level is appropriate for independent author validation.

### Level 2: Deterministic generated-world fixtures

A small named set of generated seeds, assembled once per test process or restored from a content-addressed artifact, with fresh mutable state forked per test.

Recommended references:

- one minimal opening world;
- one content-heavy world;
- one frontier or cross-region save; and
- one world with representative installed adventures.

These fixtures test composition, placement, economy, census, and engine integration. They should not be the default for generic unit tests.

### Level 3: Honest-start journeys

Fresh generation and normal public-command play from the real beginning.

Properties:

- No state injection or teleportation.
- Small in number.
- Headless first, with only a few browser equivalents.
- Mainline smoke or release acceptance depending on duration.

These prove the construction path that cached fixtures intentionally bypass.

### Safe reuse model

Reuse immutable products only:

- parsed Kyr ASTs;
- merged rule modules;
- compiled module definitions;
- generated source bundles and manifests;
- initial campaign definitions; and
- validated checkpoints.

Every test receives fresh mutable state through an existing fork/restore path. Mutation leakage should be detected by hashing the immutable fixture before and after a representative test and by running isolation tests in reversed order.

### Cache invalidation

A reusable fixture key must include content, not only a seed or path. At minimum hash:

- every Kyr source text read;
- module and campaign manifests;
- generator tables and templates;
- the Deem and languages package revisions;
- shared rule sources;
- canonical setting data and referenced catalog files;
- world-generation options, seed, origin, party, and scenario count;
- relevant compiler/runtime schema version; and
- the fixture format version.

The safest implementation records every `BundleSource.read` performed while constructing the fixture, stores path plus content hash, and includes explicit generator inputs that do not flow through `BundleSource`. A changed author file then invalidates only fixtures that read it. Changes to the module loader, namespace/compiler, generator code, shared rules, save schema, or canonical-data interpretation should invalidate broad fixture classes.

Do not cache a live `Campaign` between tests. Cache an immutable load product or checkpoint and fork/restore it.

## 5. Test ownership and scheduling

### Fast local contracts

Target: under 90 seconds on a normal development machine.

Include:

- Level 0 engine contracts;
- parser/writer round trips;
- module import and namespacing contracts;
- public player-view and command contracts;
- focused save/restore contracts; and
- the small deterministic opening fixture where a generated world is genuinely necessary.

This tier should be deterministic and mandatory locally before handoff.

### Engine integration gate

Target: a few minutes, parallelized by known cost.

Include:

- Level 1 and selected Level 2 fixtures;
- representative combat, inventory, navigation, objective, economy, and persistence paths;
- one honest-start generated-world smoke journey; and
- one large-world scale smoke.

This should be the principal mainline merge gate, not the complete adventure corpus.

### Independent adventure validation

Each adventure branch should own:

- Kyr parse/lint and manifest validation;
- declared import/export contract checks;
- isolated installation against the supported rule edition;
- entry-point reachability and consequence checks;
- one canonical path and important authored branches; and
- a dependency manifest generated from actual reads.

These tests run on the adventure branch and when that adventure or one of its dependencies changes. They need not all run for an unrelated interface edit.

### Browser interaction gate

Use one prebuilt fixture-bearing site artifact. Keep a small required set covering:

- application start;
- one ordinary scene;
- map open and selection;
- dialogue and contextual action;
- combat target interaction;
- inventory/journal presentation;
- persistence/reload; and
- responsive desktop/mobile layout.

Move simulation-only assertions and long scenario histories to headless tests.

### Nightly corpus validation

Run:

- every independently authored adventure;
- multi-adventure composition matrices;
- several generated seeds;
- census/distributional checks;
- long descents and autoplays;
- full browser corpus where still justified; and
- performance trend collection.

Failures remain release-blocking but do not make each ordinary edit wait 45 minutes before receiving relevant feedback.

### Release-candidate acceptance

Retain:

- a clean, uncached build;
- full corpus and browser validation;
- fixed honest-start first-hour journeys;
- save compatibility checks; and
- cold human playtesting.

Scheduling changes must not be represented as reduced correctness. They change when and for which changes a check runs, not whether release candidates receive it.

## 6. Changed-test selection

The current selector is not sound enough to replace broad CI:

- Bun follows static TypeScript imports.
- Runtime-loaded data has no static import edge.
- `scripts/test-changed.ts` string-matches changed data paths, directory names, and stems against test source.
- Shared-rule changes explicitly cannot be selected and are deferred to full CI.
- Generated worlds may depend indirectly on catalogs, tables, templates, manifests, canon, or package revisions without naming them in the test file.

A sound-enough selector requires recorded dependency edges:

```text
test or fixture
  → campaign manifest
  → bundle manifests
  → Kyr sources and shared rules
  → imported/exported modules and canon
  → generator tables/templates
  → external package revision
```

The loader already mediates most reads. Instrument fixture construction to emit these edges. Selection can then take the transitive reverse dependency set.

Broad validation must still run when any of these change:

- `ModuleParser`, module compilation, namespacing, installation, or validation;
- shared rules;
- `WorldAssembler`, Deem integration, shared generation templates, or canonical data interpretation;
- persistence schema or campaign restore;
- player-view/public-command contracts used by all journeys;
- dependency graph construction itself; or
- an unclassified file under `data/`.

Initially, use recorded selection to add tests, not omit them: compare its chosen set with nightly failures for several weeks. Only after it demonstrates recall should it shorten the merge gate.

## 7. Runtime performance findings

### Engine

The measured engine is substantially better than the repository's test latency suggests.

- Fixed authored campaigns benefit strongly from in-process compile/load caches.
- Ordinary local observation, choice listing, and commands are generally tens to low hundreds of milliseconds headlessly.
- Generated starting worlds still take roughly five to six seconds to start headlessly in the focused current run.
- Larger composed worlds increase load and save size more clearly than they increase local choice or tick latency.
- The current `a1` replay showed a 96 ms all-command median and a 492 ms maximum over the 59 commands it could replay.
- The scale process peaked near 997 MB resident while constructing multiple large worlds sequentially. The single `a1` replay process peaked near 791 MB. These peaks make concurrent full-world test construction a plausible CI contention source.

No current evidence justifies a broad runtime rewrite. The most important runtime concerns remain cold generated-world startup, large persistent state, and tail latency on travel/time advancement.

### Browser

The most recent instrumented browser evidence in the repository found ordinary commands around 190–365 ms after M19 screen-projection fixes, with engine work around 50–90 ms and screen derivation around 77–110 ms. Earlier sustained M15 profiling reported approximately 94 ms median and 293 ms p99 over a 334-command built-page journey after optimization. These measurements used different worlds and dates and should not be combined into a single current benchmark.

The current review did not reproduce browser medians. It can establish:

- browser CI time is dominated by test execution, builds, and browser lifecycles rather than Chromium installation;
- every browser file rebuilds a complete site;
- the browser worker runs the same substantial engine and generated-world startup path;
- a large amount of browser journey logic tests simulation semantics that can run headlessly; and
- no evidence shows environmental painting changes or ordinary React rendering to be a primary current bottleneck.

The performance benchmark set proposed below should make this distinction current and reproducible.

## 8. Authoring and integration scalability

The architecture has real reusable boundaries:

- adventures declare manifests, source files, rules, imports, exports, canon, and optional generation;
- modules are namespaced and installed through generic machinery;
- parsed texts and shared rules are cached;
- deterministic seeds and public headless sessions support reproducible validation; and
- generated worlds can already be inspected through CLI and script-level tools without the browser.

The expensive part is that dependencies are explicit to the loader but not retained as a test-selection artifact. Consequently, a generic engine change has no trusted way to identify which adventure contracts it can affect, and an authored content change is often validated through a whole generated world rather than its declared module boundary.

Adding an adventure should normally require its content, manifest, declared imports/exports, author tests, and an integration catalogue entry. If the main builder repeatedly modifies engine code or unrelated scenarios to admit it, that is evidence that the authoring contract is incomplete. This review did not find evidence that package extraction would solve that problem.

A lightweight headless development harness largely exists in pieces:

- `PlaySession` and `Journey` execute public commands;
- `PlayerView` exposes observable state and choices;
- `scripts/sim-bench.ts` replays and profiles;
- CLI inspect and playtext tools expose parts of the state; and
- world census/audit scripts exist.

The small missing piece is a single builder-facing command that starts or restores a named fixture, prints the current player view and public commands, executes one command, and reports phase timings plus fixture/dependency identity. This is assembly of existing capabilities, not a new runtime architecture.

Failure reports should include:

- fixture content hash and seed;
- phase timing: assemble, compile/install, start, setup prefix, assertion path;
- last successful public command;
- current place, followed objective, and installed-module list where relevant;
- the dependency files that selected the test; and
- replay/checkpoint output for long failures.

This would reduce repair time even where total execution time is unchanged.

## 9. Ranked interventions

The benefit estimates below are reasoned ranges, not measured post-change results.

| Rank | Intervention | Local latency | CI wall clock / compute | Diagnosis / correctness | Effort and risk | Horizon |
|---:|---|---|---|---|---|---|
| 1 | Introduce explicit fixture levels and reuse content-addressed immutable generated/compiled fixtures | Very high for tests now rebuilding worlds | High compute reduction; wall-clock depends on migrated long tests | Better isolation; retain honest-start tests | Medium; state-leak and invalidation risks must be tested | Immediate–near-term |
| 2 | Build one browser artifact per run/shard and reuse it; share browser lifecycle where practical | Medium | High browser compute reduction; likely material browser wall-clock reduction | Separates build failures from UI failures | Low–medium; isolation/storage cleanup required | Immediate |
| 3 | Split mainline contracts from scheduled authored-corpus validation | Very high | High mainline latency reduction; total nightly compute retained | Faster relevant failures while preserving release coverage | Low process risk; requires disciplined ownership | Immediate |
| 4 | Record loader/generator dependencies and use them for affected-test selection | High once trusted | High compute reduction for localized content changes | More reliable than string matching; auditable selection | Medium; initially advisory | Near-term |
| 5 | Replace duplicated long setup prefixes with validated checkpoints/forks while retaining canonical full paths | High for author work | High compute reduction in longest files | Shorter failure distance; risk of checkpoint overfitting | Medium | Near-term |
| 6 | Refresh timings automatically and isolate long-tail files from normal balanced shards | Low local | Moderate wall-clock reduction from better balance | More honest CI reporting | Low | Immediate |
| 7 | Move browser tests of simulation semantics to headless public-view contracts | Medium | High browser compute reduction | Stronger semantic diagnosis; browser retains actual UI contracts | Medium; classification judgment needed | Near-term |
| 8 | Add phase timings and replay/checkpoint metadata to long-test failures | Medium diagnosis benefit | Little direct speedup | High repair efficiency | Low | Immediate |
| 9 | Establish a small trend-reporting performance suite | Low direct | Prevents regressions without another large gate | Makes runtime claims current | Low | Immediate–near-term |
| 10 | Optimize save/log representation and remaining large-world projections only after benchmark evidence | Low test-loop benefit today | Possible later runtime/compute reduction | Player responsiveness and long sessions | Medium–high; compatibility risk | Later |

## 10. Three immediate interventions

### 10.1 Reusable deterministic fixture service

**Sketch**

Add test support—not production package extraction—that exposes:

```ts
const fixture = await GeneratedFixture.get({ seed, options, edition });
const session = await fixture.freshSession();
```

`GeneratedFixture.get` should:

1. compute a content-addressed key from seed, options, dependency reads, package revisions, and fixture version;
2. assemble and validate once per process or retrieve a validated artifact;
3. retain the immutable bundle source and initial loaded campaign definition; and
4. return a fresh campaign fork or checkpoint restore for every test.

Affected subsystems:

- test support directory;
- `BundleSource` read tracing;
- existing `LoadCache`/campaign fork path;
- `WorldAssembler` result packaging; and
- a small initial set of expensive tests such as generated-world lint and repeated adventure branches.

Verification:

- Canonical state of fresh and reused starts must be byte-identical.
- Run the same tests in different orders and concurrently.
- Hash fixture inputs and immutable output before and after each test in an isolation suite.
- Modify one Kyr source, generator table, shared rule, and package revision in controlled fixture tests and verify invalidation.
- Retain at least one uncached honest-start test for every reference fixture.

Expected benefit:

The measured contrast is 5.0–5.8 seconds for repeated generated starts versus 6 milliseconds for a warm fixed-source campaign. A fixture service will not make every generated start 6 ms because cloning/restoration and content size remain, but eliminating repeated parse/install work from hundreds of tests should materially reduce aggregate compute and local latency. No exact suite-wide speedup is claimed until representative files are migrated and timed.

### 10.2 Build browser fixtures once

**Sketch**

Build the fixture-bearing static site once in a dedicated CI step or job, archive it, and provide its path to browser tests. Within each shard, use a worker-level browser fixture rather than one build and browser launch per file. Tests must still receive isolated pages/contexts and cleared storage.

Affected subsystems:

- `SiteBuild.site` invocation in browser test support;
- `MonoBrowser` lifecycle;
- browser test setup conventions; and
- CI artifact or workspace setup.

Verification:

- Run browser files in different orders.
- Give each test a fresh browser context or explicitly cleared local/IndexedDB state.
- Retain one separate build-integrity test that compares bundled assets and fixture availability.
- Verify that a failed test cannot contaminate the next page, worker, or saved game.
- Compare browser shard wall time and peak memory before and after.

Expected benefit:

All 26 browser files currently rebuild the site. Removing 25 redundant builds per complete browser corpus is a direct compute saving. Browser execution and long journeys will remain, so a proportional 26-fold suite speedup is not credible. A material reduction in the current 14–15 minute browser test steps is plausible and must be measured.

### 10.3 Establish a contract gate plus scheduled corpus gate

**Sketch**

Create a named mainline contract group using existing fast tests plus:

- one minimal generated opening world;
- one content-heavy load/choice/tick smoke;
- one honest-start headless journey;
- one save/restore contract; and
- the small browser interaction smoke against the shared build.

Continue the complete five-shard corpus nightly, on broad architectural changes, and for release candidates. Adventure branches run their own author validation before integration.

Affected subsystems:

- package scripts and test categorization metadata;
- documented ownership of author versus engine tests;
- CI scheduling after M19, not the implementation itself; and
- failure summaries.

Verification:

- For an initial observation period, run both old and proposed gates and record which failures each catches.
- Seed mutations in representative engine, shared-rule, generator, adventure, browser, and persistence areas to verify routing.
- Treat unclassified changes as broad.
- Do not remove a full-corpus release requirement.

Expected benefit:

The current developer wall-clock is approximately 45 minutes. A contract group built from sub-two-second tests plus a few reference integrations should provide useful feedback in a few minutes; the prior focused navigation contract target of under 90 seconds remains appropriate for its narrower subset. The exact mainline target should be set after categorization rather than promised in advance.

## 11. Performance regression protection

Use a small reporting suite, not another expensive mandatory matrix.

| Benchmark | Fixture | Metrics | Policy |
|---|---|---|---|
| Kyr parse and module install | One fixed authored bundle, cold and warm | Parse, compile, install, cache hit | Gate only gross regressions on dedicated runner; otherwise trend |
| Deterministic world assembly | Minimal and content-heavy fixed seeds | Assemble, start, modules/entities, peak memory | Trend on main; alert on sustained regression |
| Ordinary action | Fixed authored campaign | p50/p90/p99 by local/travel/time | Trend; generous ceiling for catastrophic regression |
| Objective/route/screen projection | Fixed small and large worlds | choices, observe, screen build, route plan | Trend and selected hard ceiling |
| Combat | Fixed encounter set | setup, turn, resolution | Trend |
| Save/load | Small and large checkpoints | save bytes, encode, restore, retained state | Gate format correctness; trend speed/size |
| Honest-start headless journey | One release seed | total and phase times | Mainline smoke; trend performance |
| Browser responsiveness | One prebuilt scene journey | startup, command p50/p95, long tasks | Scheduled dedicated runner; trend |

Benchmark rules:

- Pin Bun version, runner class, seed, party, and fixture content hash.
- Report median of several repetitions after a cold observation where appropriate.
- Store raw JSON alongside human summaries.
- Compare against a rolling baseline, not one developer laptop.
- Fail mandatory gates only on large, reproducible regressions—for example a repeated doubling or a strict user-facing ceiling—not small noisy percentage changes.
- Treat memory and artifact size as first-class metrics.
- Never hide correctness failures because a performance sample is noisy.

## 12. Work to defer explicitly

Do not undertake these changes before the first-hour playability gate is green:

- Extracting Kyr, Deem integration, or tests into new repositories.
- Replacing generated Kyr text with direct AST construction.
- Rewriting the runtime around a new ECS, database, worker topology, or package graph.
- Replacing Bun's test runner solely because the suite is slow.
- Building a fully general remote build cache.
- Snapshotting live mutable campaigns without content hashes and isolation checks.
- Removing long adventure journeys because faster contracts exist.
- Making changed-test selection authoritative before recorded dependency selection has been compared with full-corpus results.
- Optimizing React, Three.js, or environmental painting loading without a current browser profile identifying them as hotspots.
- Redesigning save format during M19 merely to make tests faster.
- Increasing shard or worker count before eliminating repeated construction and measuring contention.

## Conclusion

Westernesse does not principally need more computation. It needs smaller verification units and stable reuse boundaries.

The repository already contains many of the necessary mechanisms: deterministic seeds, parsed-module caches, campaign forks, public headless sessions, journey replay, scale benchmarks, and explicit module manifests. They do not yet form a coherent development architecture. Generated sources lose cache identity; test fixtures do not declare levels; dependency reads are not retained for selection; long adventure prefixes are replayed repeatedly; and every browser file rebuilds the complete site.

For the next thousand commits to yield more player-visible progress:

1. Make isolated contracts and immutable fixture reuse the default development loop.
2. Preserve a small number of honest-start journeys to prove those fixtures are truthful.
3. Build browser assets once and use Chromium only for behavior that requires a browser.
4. Make adventure ownership and dependency relationships machine-readable.
5. Move complete corpus traversal to nightly, broad-change, and release gates while keeping it mandatory there.
6. Report phase timings and replay artifacts so a failure says whether it is parsing, installation, setup history, simulation, projection, persistence, or rendering.

That combination should improve feedback per unit of compute without weakening release correctness or committing the project to another architectural campaign.
