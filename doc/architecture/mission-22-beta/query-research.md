# Revisioned queries: research and legal-grounding experiment

25 November 2026; source `528ca30`. Commission: whether one demand-driven revisioned query system should replace
the engine's growing family of caches. The experiment is research code, not a product path.

## Decision

**Adapt the existing dependency machinery in measured slices; do not adopt a single universal query engine now.**
The engine already tracks named and selected world reads and checks stamps across immutable world lineages.
`KeptGroundings` already uses those reads to invalidate individual schemas. The experiment confirms that an
additional whole-legal-result query can avoid fresh grounding, but does **not** show a meaningful gain over the
existing incremental grounding on this walk. It also deletes no derivation. That is not evidence for a new
general-purpose runtime.

A complete typed player revision and explicit campaign/compilation contexts are still necessary. A query graph
cannot discover an ambient catalog, session state, mutable controller, random draw, installed capability or
side effect unless it is made an input; it cannot by itself create the knowledge boundary or decide what warrants
attention. Immutable worlds make identity-based reuse cheap, but world identity alone is not a player revision.

The [inventory](query-cache-inventory.md) records the observed caches and limitations. Under its explicit counting
rule there are **at least seven cross-world validation families**. Four use `KeptReading`; Agency and
`CampaignTick.idle` use the same world stamps directly, and Projection compares changed facts and actor/store
inputs. These are consumers' validity policies, not seven independent revision engines. They exclude same-world
identity keys, length checks and eviction; additional hand-maintained validity checks exist for compilation,
fighters, logs and player state. The search did not prove exhaustive enumeration, and some inventory entries need
their full implementation traced. There is no defensible exact count of *all* hand-rolled schemes yet.

`WorldReads` propagates dependencies through nested readings and through a reused `WorldMemo`. `KeptReading` records
lineage and name stamps, optionally selected keys and previously shared relation maps. It falls back to fresh work
on an all-world read. It does not retain the whole world, but selected relation maps and output values can still be
large. `KeptGroundings` combines this with a reverse index and bounded actor cache. `KeptParts`, `PassageModel` and
`ObservationText.presented` add separate contextual checks. These are already a partial incremental query system,
not independent attempts starting from zero.

## Experiment

`scripts/research/legal-query-prototype.ts` wraps the existing `Operators.applicable` in a single actor-keyed
`KeptReading`. It is instantiated for one module and controller list, not shared across campaigns, and rejects a
different module. A same-line changed world is checked against the actual recorded reads; an all-world read is not
retained. A hit propagates reads to an enclosing computation. The query still uses `KeptGroundings` inside; it is
therefore a layered experiment, not a replacement for it. It assumes the module, controller list and ambient
installed context do not mutate during the query's lifetime. Those assumptions are not a production contract.

`test/small/legal-query-prototype.test.ts` checks fresh equality through an unrelated write and a relevant write,
different world lineages and divergent forks, distinct actor keys, rejection of a different module, and dependency
propagation on a hit. It does not prove concurrent campaign isolation or cover all mutable/non-world inputs.

Reproduce the measurement with:

```sh
bun scripts/research/legal-query-walk.ts
```

The script plays all 59 lines using `AsMeant`; errors fail the run. After each line it compares the **entire ordered
operator structures**, not just IDs, with a new `Operators` instance, an independently retained existing
`Operators`, and the prototype, including a second identical query. It reports construction separately. These are
raw `Operators.applicable` results, not the filtered `Campaign.offered` API. They are 59 checkpoints, not the
roughly 35 legal calls made inside each turn; no new query is used to play the walk. The fresh operator instance
does not reuse its schema-grounding cache, but lower-level world and module memos remain shared, and the fresh call
runs first. This is not a cold-cache benchmark, an end-to-end speedup, or a statistical comparison across machines.

One run on Linux x86-64, Bun 1.4.3, two available CPUs (AMD EPYC 9V74):

| Per checkpoint | Total, 59 calls | Median |
|---|---:|---:|
| Fresh `Operators.applicable`, constructor excluded | 875.20 ms | 11.000 ms |
| Existing incremental `Operators.applicable` | 404.64 ms | 4.797 ms |
| Tracked whole-result query, first ask | 401.82 ms | 5.382 ms |
| Tracked query, immediate second ask | 0.498 ms | 0.00632 ms |
| Fresh `Operators` construction, separately | 509.18 ms | 7.596 ms |

Across 118 tracked asks there were 67 hits and 51 misses; no module/controller reset and no mismatch. The query's
first asks took 54.1% less total time than fresh grounding without construction, but only 0.7% less total time than
the existing incremental instance; its median was **12.2% slower**. The second ask is a same-world microbenchmark,
not a per-turn saving. One run and this order of measurement cannot distinguish a 0.7% difference from noise. In
particular, the earlier 17.6 ms/turn and 3 µs figures are not re-established here. The performance map at
`5f1892c67` reports its own different hardware/load, call boundaries and medians; it must not be added to these
numbers. A product candidate needs a new attribution over *actual* calls, repeated paired runs and heap retention.

The focused prototype and retention specs, typecheck and lint passed. `check:fast` reached its quick-test lane
after typecheck and lint, but that lane began 826 spec files and was stopped after three minutes on this shared
machine; it did not pass. The small suite was not run here. The golden walk was the requested research measurement,
not a browser or human acceptance test.

## What other systems teach

| System | Evidence and consequence |
|---|---|
| [salsa](https://github.com/salsa-rs/salsa/blob/master/book/src/overview.md), [cycles](https://github.com/salsa-rs/salsa/blob/master/book/src/cycles.md) | Memoized deterministic queries over explicit inputs and tracked dependencies; cycles need an explicit policy. Good model for a small typed contract, not a TypeScript dependency. |
| [Adapton](https://github.com/Adapton/adapton.rust) | Demand-driven incremental computation and stable names for reused computations. A useful reference for names and lifetimes; the cited Rust implementation is archived. |
| [Soufflé](https://github.com/souffle-lang/souffle) | Datalog compilation, indexing and provenance are relevant to rule analysis. Its cited README establishes batch compilation/interpretation, not an interactive incremental update contract. Do not infer one from Datalog alone. |
| [DDlog](https://github.com/vmware-archive/differential-datalog) | Bottom-up incremental Datalog consumes changes and emits deltas over Differential Dataflow. The repository is archived; it is not a suitable new dependency. |
| [Differential Dataflow](https://github.com/TimelyDataflow/differential-dataflow) | Incremental collection joins, reductions and iteration process additions and removals. Strong reference for high-volume relational rule wake-ups, but time/weight semantics, relational encoding and a Rust boundary would be expensive for this slice. |
| [Ceptre](https://github.com/chrisamaphone/interactive-lp) | Linear-logic rules, stages and quiescence make state transitions explicit. This informs rule scheduling and semantic tracing, not a drop-in query cache. |
| [Inform 7](https://github.com/ganelson/inform) | Its open compiler establishes a useful interactive-fiction comparison, but this survey did not verify its runtime's derived-state/invalidation internals. No architectural conclusion about its caching follows. |
| Dwarf Fortress-style simulation | Large evolving worlds motivate bounded work and demand, but this survey found no verified primary account of Dwarf Fortress's derived-state implementation. Do not claim it uses any particular cache, scheduler or query architecture. |

Bun uses JavaScriptCore, not V8; [its compatibility documentation](https://github.com/oven-sh/bun/blob/main/docs/runtime/nodejs-compat.mdx)
describes `async_hooks` limitations and `AsyncLocalStorage` worker/MessagePort propagation limits. Its
[worker documentation](https://github.com/oven-sh/bun/blob/main/docs/runtime/workers.mdx) describes workers as
experimental. The current synchronous `WorldReads` stack is not an async or cross-worker context: keep the
prototype synchronous, pass context explicitly across asynchronous boundaries, and do not use finalization timing
as a correctness or memory bound. These are engineering constraints, not proof that Bun cannot host a query system.

## If a later profile warrants a slice

After the immediate queue's attribution, leg/attention work, on-demand routes and frame migration, **remeasure**.
Step 6 names the dominant remaining derivation, whether legality, perception or rule wake-ups. Make only that
derivation a query; require:

1. A typed key containing installation/campaign identity, world lineage and every relevant session/question or
   module/controller input. A lineage is not a substitute for campaign identity. Inputs must be immutable or have
   explicit revisions, not length-only checks.
2. Synchronous, complete dependency tracking, transitive hit propagation, conservative all-read fallback, cycle
   policy, and a fresh oracle. Side effects, random draws and time must be explicit inputs or outside the query.
3. Bounded ownership and eviction; no retained worlds, a measured post-GC heap slope, interleaved two-campaign and
   divergent-fork tests, relevant and irrelevant writes, reordering, module replacement and session-only changes.
4. An independently measured latency improvement and deletion of the redundant production derivation before the
   next slice. Compare against the **existing** cache, not just against a deliberately fresh implementation.

Potential consolidation targets are `KeptGroundings`, `KeptParts`, `PassageModel` and
`ObservationText.presented`, but each has different non-world inputs and lifetimes. None is retired by this
prototype. OR-183 (legal grounding), AX-10/AX-05 (journey work), and OR-521's performance work might benefit if
their remaining profile identifies an applicable query; the remaining knowledge-boundary work is OR-560, the
remaining ambient installed/compilation contexts are OR-531, and TB-09 requires engine-owned questions. OR-527,
OR-520 and OR-540 are already closed on their recorded proofs; their remaining work is not reopened here.
No register row or immediate-queue step is closed by this research. A typed revision helps frame reuse but does not
replace the settled situation, the journey attention semantics, or the pure projection boundary in the fifth
review. Likewise, the immediate queue's step 7 delays broad restructuring; it is not itself a cache to retire.

| Candidate, only if measured dominant | What a successful slice could retire | What remains to prove |
|---|---|---|
| Schema-level legality | The replaced part of `KeptGroundings` and its duplicated validity/index logic, not the action semantics. | OR-183's decision target and fresh parity, including movement, module/controller changes and isolation. |
| Ways or page-part reads | The replaced `PassageModel.lasting` or `KeptParts` entry and its duplicate validation, one consumer at a time. | OR-560's knowledge/noninterference boundary and OR-521's on-demand route behavior; a cache hit is not a boundary. |
| Rule wake-ups or projection | Only a replaced index or projection derivation once the same rules and consequences are proven. | AX-10's full-watch equivalence, real interruptions and leg budget; no skipping simulation merely because a page did not change. |
| Player frame | A duplicate row/frame computation after a complete typed player revision exists. | Question, session, installation, narration and world inputs; step 1's revision and step 2's settled situation remain explicit authorities. |

Costs are dependency instrumentation and key design, validation, retention/eviction, profiling overhead, and
fresh-oracle tests. A universal graph would add cycle handling, ownership, scheduling, debugging and migration
cost before a measured benefit. Prefer extracting a common obligation from a second proven slice, not imposing
one graph on every parse, deterministic generation memo, and per-world index.

## Next actions for the maturity stream

1. **Finish the audit before using its count for a consolidation decision.** Inventory remaining retained fields,
   including non-Map storage, and trace every ellipsis entry to its actual key, invalidation, retained value and
   oracle. Acceptance: a reproducible source-to-inventory census with exclusions and a separately stated count of
   cross-world and non-world validation families; no claim that weak keys alone prove bounded memory.
2. **Follow the existing immediate queue, then remeasure.** After the queued frame and route changes, run the turn
   attribution and quality instruments on the same golden walk. Acceptance: report actual call counts, medians and
   tails for decisions, non-journey turns and journey legs; select the largest *remaining* derivation, not this
   prototype by default.
3. **Only if step 2 justifies it, commission one replacement.** Compare against today's production path in repeated
   paired runs, including heap retention and the complete fresh-result oracle. Acceptance: a measured improvement
   under the relevant budget, interleaved-campaign and invalidation cases passing, and one redundant production
   derivation deleted. Otherwise retain the targeted caches and do not start a query-engine project.
