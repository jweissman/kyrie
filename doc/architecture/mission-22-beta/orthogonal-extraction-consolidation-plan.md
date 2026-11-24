# M22-beta: orthogonal extraction and consolidation plan

**24 November 2026.** This is a bounded implementation plan for recurring mechanisms found across Kyrie. It is not
a new beta stream, a package-extraction commission, or authority to rearrange the source tree. The owner's
[commission](BRIEF.md), the [execution plan](execution-plan.md), the open register and the active queue govern it.
An extraction lands only as part of work that advances one of those commitments.

The purpose is to make a few small mechanisms independently exercisable where the code already repeats both their
syntax and their failure contract. The test is not whether an abstraction makes a caller shorter. It is whether it
makes a product invariant mechanically harder to violate while leaving the fictional rule visible at the call site.

## Decision

Pursue four consolidations, in this order of confidence:

1. typed traversal of Kyr predicate and value trees;
2. explicit identity- and dependency-aware memoisation;
3. a checked monotone lifecycle for atomic commands;
4. an engine-owned question protocol, proved by creation and one contrasting focused interaction.

Treat transactional participants as a later consolidation of MT-24, not an independent preliminary abstraction.
Do not build a general state-machine framework, event bus, generic AST framework, universal projection pipeline,
repository layer or decorator-based cache system.

The first two are suitable small libraries now. The third should be extracted only while completing MT-24's fault
injection proof. The fourth should begin as shared protocol types and earn any executable framework from a second
real consumer.

## Evidence and common idioms

The review found these repeated tactical forms:

- approximately 100 `WeakMap` constructions in 70 source files, commonly combining an immutable object identity,
  a secondary key, cached `undefined`, length checks, nested weak maps or read-dependency replay;
- at least 33 direct `switch (x.kind)` traversals, besides ternary traversals, over Kyr predicates, values and combat
  effects;
- a declared command lifecycle whose order is kept by `PlaySession`, but whose `OpenCommand.reach` method accepts
  any phase in any order;
- engine-owned questions in creation whose available steps are recomputed from the evolving model, while other
  focused interactions still tend to express their progression as private facts and control rules;
- nested command rollback: `Campaign` checkpoints world and runtime state, while `PlaySession` separately rolls
  back expansion, telling, undertakings and transcript mutation.

Three existing practices constrain the design:

- immutable world and module identity is useful version information, not an implementation accident;
- a cached read must replay what it read into `WorldReads`, or incremental invalidation can keep a stale result;
- domain meaning remains named in domain code. A generic mechanism may enforce ordering, ownership or traversal,
  but it must not decide what a command, predicate, Occasion or choice means.

## Rules for every extraction

Each consolidation must meet all of these conditions.

1. **Two real consumers.** The second consumer must have the same failure contract, not merely similar-looking code.
2. **A construction invariant.** Invalid use is rejected by types or at the mechanism boundary.
3. **A preservation proof.** Before and after behavior is compared at the cheapest reliable rung.
4. **A visible or authorial dividend.** It either closes or advances a registered contract, lowers measured act cost,
   improves diagnostics, or removes control machinery from a real authored interaction.
5. **A deletion.** The migration removes the replaced traversal, cache protocol, lifecycle convention or client-owned
   flow. A wrapper around unchanged duplication is not consolidation.
6. **A stop condition.** If the second consumer needs exceptions that expose a different contract, retain two small
   mechanisms.
7. **No broad move.** Enforce an import boundary before considering a directory or package extraction.

The implementation should normally be one mechanism, its isolated specs, and one or two migrations per landing.
It should pass `bun run check:fast` and `bun run test:changed`; prose changes additionally pass
`bun run test:small` before landing as required by the repository instructions.

## Extraction 1: typed Kyr tree traversal

### Contract

Every structural operation over a Kyr `Predicate` or `Value` visits the same child positions, handles every union
member exhaustively, and distinguishes a read-only visit, a fold and a rewrite. Adding a new syntax variant must
produce a compile-time failure in the traversal kernel rather than silently omitting that variant from scattered
tools.

This is a Kyr-language utility. It belongs in `src/lang`; it must not become a generic tree package and must not
import runtime, presentation or setting code.

### Present evidence

- `ModuleWriter.conditionCalls` rewrites calls recursively, including calls inside comparisons and counts.
- `QueryModes` independently traverses predicates and values to find variables, negated reads, bindings and names.
- `World`, `ModuleCompiler`, `Candidates`, `SemanticRecords`, namespace rewriting, author lint and inspection tools
  contain other independent recursive interpretations.
- Several callers use a rewriting callback only to collect calls, making a read operation appear to be a mutation.

The repeated risk is semantic omission: a new or nested child position may be recognized by the compiler but missed
by dependency analysis, namespacing, lint, semantic tracing or presentation.

### Recommended surface

Begin with concrete functions rather than a visitor class:

```ts
export interface PredicateVisitContext {
  readonly parent?: Predicate;
  readonly position: 'root' | 'value' | 'left' | 'right' | 'count';
}

export function visitPredicate(
  predicate: Predicate,
  visit: { call?(call: Call, at: PredicateVisitContext): void;
    value?(value: Value, at: PredicateVisitContext): void },
): void;

export function rewritePredicate(
  predicate: Predicate,
  rewrite: { call?(call: Call): Call; value?(value: Value): Value },
): Predicate;

export function foldPredicate<T>(predicate: Predicate, algebra: PredicateAlgebra<T>): T;
```

The exact context type should follow demonstrated caller needs. Do not add ancestry paths, enter/leave callbacks or
mutation controls in anticipation of future tools. Preserve structural sharing where no child changes if profiling
shows it useful; otherwise prefer the simplest obviously immutable implementation.

`Value` traversal must cover calls, arithmetic operands and the predicate within a count. Predicate traversal must
cover calls, negation, both boolean branches, both comparison values and every literal/terminal form. Use an
exhaustiveness helper in each discriminant switch.

Combat `Effect` traversal is a possible sibling library, not a generic parameter to this one. It has different
nesting and domain rules and should be extracted only after two effect consumers demonstrate the same need.

### Migration slices

1. Add isolated table-driven specs for every current `Predicate` and `Value` variant.
2. Implement `visitPredicate` and `rewritePredicate`; retain `foldPredicate` until a real fold migration establishes
   its useful algebra rather than inventing it from theory.
3. Replace `ModuleWriter.conditionCalls` with a compatibility delegation, then migrate direct callers to the honest
   operation: visitors for collection, rewriters for namespacing or binding.
4. Migrate one independent analytical consumer, preferably the simple variable/read collection in `QueryModes`.
5. Compare the results of the old and new implementations over every predicate in the compiled supported fixture.
6. Delete the compatibility method once no caller needs it, or retain it as a clearly named domain convenience if
   its call-specific signature remains valuable.

Do not migrate all switches mechanically. Evaluation, compilation and modes analysis are algebras with meaningful
domain policy; the traversal should remove child-position bookkeeping while their policy stays local.

### Isolated proof

- identity rewrite is deeply equal to its input;
- every call in a fixture containing all nesting forms is visited exactly once and in documented source order;
- replacing one call changes only that call and the ancestors necessary to return the new tree;
- calls beneath comparisons and counts are included;
- visitor collection and rewrite interception observe the same calls;
- a compile-only exhaustiveness fixture fails when a local synthetic variant is not handled, if this can be expressed
  without weakening the production union.

### Acceptance

Accept the first slice when the kernel has all-variant specs, `ModuleWriter.conditionCalls` and one independent
analysis use it, the compiled-fixture comparison is identical, and at least two handwritten recursive walkers have
been deleted. Report the source lines removed and the diagnostic or semantic consistency gained; line count alone is
not acceptance.

### Risks and stop conditions

- A visitor with many optional hooks can become a less readable switch. Stop at the operations callers actually use.
- A universal fold can hide order-sensitive query semantics. Keep `QueryModes`' recursion explicit where recursion
  guards or left/right binding order are part of the rule.
- Do not couple source rendering to a traversal whose order is undocumented; writer output is a compatibility
  surface.

## Extraction 2: identity- and dependency-aware memoisation

### Contract

A cache states what makes a result current. When a cached computation participates in incremental world reading, a
cache hit must reproduce the dependency observations made by the original computation. Cached `undefined` must be
distinguishable from a miss. No cache infers freshness from mutable contents without declaring that rule.

This consolidation directly supports OR-183 and the beta performance direction, but it must not displace the
execution plan's measured `KeptGroundings` repair. It should be introduced by a performance repair or by replacing a
known unsafe repetition, not as a repository-wide cache rewrite.

### Present evidence

- `WorldMemo` stores `{ value, reads, picks }` per world and key, then replays the read record on a hit.
- `HexBoundary` has a local weak-primary/strong-secondary `once` implementation for cached values including
  `undefined`.
- query, entity and observation indexes often use array identity plus a length check.
- presentation readers commonly use campaign or world identity plus a secondary index, with locally different
  invalidation assumptions.

These are at least three distinct contracts. The extraction should name them rather than flatten them into one
magical `memoize` function.

### Recommended surface

Use small cache objects with explicit primary identity and optional secondary keys:

```ts
export class WeakValueCache<K extends object, V> {
  get(key: K, compute: () => V): V;
}

export class WeakKeyedCache<K extends object, P, V> {
  get(key: K, part: P, compute: () => V): V;
}

export interface Captured<T, D> { value: T; dependencies: D }

export class ObservedCache<K extends object, P, T, D> {
  get(key: K, part: P, operations: {
    compute(): Captured<T, D>;
    replay(dependencies: D): void;
  }): T;
}
```

Names may follow local vocabulary (`Kept`, `Read`, `WorldMemo`) rather than generic library terminology. The key
design requirements are `Map.has` semantics for cached `undefined`, no string serialization hidden by the library,
and replay visible in the type of the observed cache.

Do not add TTLs, LRU behavior, decorators, global invalidation, deep hashing or promise-specific behavior. Promise
deduplication and process-wide catalog caches have different operational contracts.

An array-identity index with a length guard is not generally safe if elements can be replaced without changing
length. Prefer immutable array identity. Where mutation is an admitted boundary, define a small `IdentityIndex`
whose explicit freshness token is supplied by the owner; do not enshrine `.length` as universal validity.

### Migration slices

1. Inventory cache shapes by contract, not file: immutable identity, keyed immutable identity, observed world read,
   mutable collection with freshness token, recursion-aware analysis, and process-wide content cache.
2. Extract only the immutable weak cache and keyed weak cache. Migrate `HexBoundary.once` and one simple index with
   cached `undefined` coverage.
3. Express `WorldMemo` as the observed-cache specialization or retain it as a domain wrapper over the primitive.
4. Add a differential test showing a cached world read records the same `WorldReads` names and picks as an uncached
   read on every hit.
5. Use the primitive in OR-183 work only if its hit/miss behavior and dependency propagation are directly measured.
6. Migrate further caches opportunistically when touched; do not conduct a 70-file sweep.

### Isolated proof

- a computation runs once per primary identity and secondary key;
- two equal but nonidentical immutable objects do not share entries;
- cached `undefined`, `false`, zero and empty collections are hits;
- weak-primary entries do not require explicit global cleanup;
- an observed cache replays dependencies on every hit, including “read all”;
- distinct dependency sets remain distinct between keys;
- an exception is not cached unless a separately named primitive explicitly promises that behavior;
- recursive computation either fails clearly or uses a separately named recursion-aware mechanism.

### Acceptance

Accept the first slice when `HexBoundary` and `WorldMemo` share a small tested kernel without losing their different
contracts, no behavior changes on their existing specs, and a read-dependency equivalence spec proves hit and miss
paths identical to the invalidation machinery. If the shared kernel makes either domain wrapper harder to understand,
keep only the simple keyed cache and leave `WorldMemo` specialized.

For performance-related adoption, also report before/after hit counts and time in the relevant stage. A cache
abstraction without a measured reduction is housecleaning, not OR-183 progress.

### Risks and stop conditions

- Object identity is valid only while the owner treats the object as immutable. Document the ownership assumption at
  each cache declaration.
- Length guards can bless stale indexes. Do not migrate them without identifying the mutation boundary.
- Read replay is semantic behavior. A convenience cache that forgets it can make incremental and full grounding
  disagree.
- Static caches may cross campaign boundaries when their key is not campaign-owned. The per-campaign isolation proof
  takes precedence over reuse.

## Extraction 3: checked monotone lifecycle

### Contract

An open command follows one legal prefix of the declared lifecycle, reaches exactly one terminal state, and writes
exactly one receipt. An illegal, repeated, skipped or post-terminal transition fails at the lifecycle boundary. The
trace remains inspectable for fault injection and diagnostics.

The lifecycle mechanism records and enforces coordination; it does not execute campaign policy, publish events or
own rollback. Its first and controlling consumer is MT-24.

### Present evidence

`OpenCommand` declares `resolved`, `executed`, `expanded`, `told`, `settled`, `committed` and `undone`, but `reach`
merely appends a string. `PlaySession.perform` manually calls the phases in order and creates a receipt on either
success or error. `Campaign.execute` has a nested checkpoint and rollback boundary. The preparation report therefore
correctly describes atomicity as implemented as labels, not yet as a mechanical guarantee.

### Recommended surface

Prefer a concrete command lifecycle until a second real lifecycle earns parameterisation:

```ts
type OpenPhase = 'resolved' | 'executed' | 'expanded' | 'told' | 'settled';
type TerminalPhase = 'committed' | 'undone';

export class OpenCommand {
  get phase(): OpenPhase | TerminalPhase;
  get trace(): readonly (OpenPhase | TerminalPhase)[];
  advance(next: Exclude<OpenPhase, 'resolved'>): void;
  commit(revision: number, outcome: 'success' | 'failure'): Receipt;
  undo(revision: number, failure?: unknown): Receipt;
}
```

Runtime transition validation is required even if typestate wrappers are added, because the command crosses async
callbacks and error paths where a mutable coordinator remains practical. A type parameter such as
`OpenCommand<'executed'>` is useful only if it does not require casts at every phase.

Declare the transition table once. `undone` is legal from every nonterminal phase; `committed` is legal only after
`settled`, except for explicitly modeled command kinds such as `follow:`. Prefer bringing `follow:` through the same
phases, possibly with no-op work, rather than weakening the lifecycle globally.

The receipt should contain enough evidence for MT-24's proof: command identity, revision, outcome and terminal phase.
Phase timings or failure details may be added only if an existing instrument consumes them.

### Migration slices

1. Write the lifecycle transition table and isolated illegal-transition specs without changing `PlaySession`.
2. Replace `reach` with checked `advance`, `commit` and `undo` operations.
3. Route ordinary commands and `follow:` through the same terminal rules.
4. Add fault injection after resolve, execute, expand, tell and settle. For each point, prove world, creatures,
   campaign definition, observations, event log, undertakings, told words and transcript are restored to the last
   receipt.
5. Only after that proof, decide whether checkpoint/rollback participants can be consolidated as described below.

### Isolated proof

- every legal prefix advances;
- every skipped, reversed or repeated phase throws;
- undo succeeds exactly once from each nonterminal phase;
- commit succeeds exactly once only from the final open phase;
- no operation succeeds after a terminal phase;
- a receipt is produced exactly once and agrees with the terminal trace;
- async failure at each `PlaySession` window produces `undone` and preserves the previous canonical session.

### Acceptance

The lifecycle extraction is accepted only with MT-24's fault-injection matrix. A stricter `OpenCommand` alone is a
useful local repair but does not establish atomic commands. Acceptance requires canonical before/after equality at
every injected failure point and a successful command receipt that agrees with the transcript revision.

### Risks and stop conditions

- Do not confuse lifecycle completion with transaction commitment. The campaign and session state must still be
  restored by proved rollback participants.
- Optional phases weaken the proof. Model a distinct legal route or perform an explicit no-op phase.
- A generic protocol builder is premature. Extract one only after another lifecycle needs the same ordered-prefix and
  terminal-once contract.

## Later consolidation: explicit transactional participants

The campaign checkpoint presently captures creatures, current state, world, compiled module, definition,
observations, event length and encounter count. The session separately restores transcript length and invokes
campaign undo when expansion, telling or undertaking settlement fails. This deserves consolidation only after fault
injection reveals the complete boundary.

If the proof shows a stable participant contract, use an explicit coordinator:

```ts
interface TransactionParticipant<S> {
  readonly name: string;
  capture(): S;
  restore(snapshot: S): void;
}
```

The coordinator may capture all participants, restore them in a documented order and refuse nested or concurrent
transactions. It must not infer participants from decorators or global registration. The list at the command boundary
is important architectural evidence.

Do not extract this if participants need interleaved rollback policy or if restoring one requires private knowledge
of another. In that case, keep the concrete campaign checkpoint and add a single session-level snapshot that names
the remaining state.

## Extraction 4: engine-owned question protocol

### Contract

The engine owns the current question, its intelligibly labeled choices, presentation hints and the consequences of a
choice. A client renders the question and submits a choice identity; it does not keep a parallel step or phase
machine. The next question is derived from the resulting model, because available questions may change after any
choice.

This is the reusable part of `CreationFlow`. Character rules, ranking, names, spell selection and background policy
remain in creation.

### Present evidence

`CreationFlow` already supplies `CreationStep`: id, question, cards, chosen value and render hints. It owns current
position and recomputes the step list as ancestry, calling, specialty, spells, past and presentation change. Page and
terminal can therefore render the same engine answer.

The implicit state is more complex than the `at` field: `named`, `asked`, `past`, `traded`, `rolls` and `dealt`
influence which questions exist and what choosing means. Replacing this with a fixed generic FSM would misrepresent
the design. The reusable concept is an engine-owned question over a model, not a static graph.

### Recommended surface

First extract shared data and result types:

```ts
export interface EngineChoice<ID extends string = string> {
  id: ID;
  label: string;
  description?: string;
  unavailable?: string;
}

export interface EngineQuestion<Q extends string, C extends EngineChoice> {
  id: Q;
  prompt: string;
  choices: readonly C[];
  selected?: C['id'] | readonly C['id'][];
  presentation?: { kind: string; all?: boolean; promoted?: number };
}

export type FlowResult<Q, R> = { kind: 'question'; question: Q } | { kind: 'complete'; result: R };
```

Do not immediately force `CreationStep` into the most generic possible type. Preserve its cards, handbook entries,
emblems, rolling and writing fields through a creation-specific extension.

An executable helper is justified only after a second consumer. The preferred contrasting proof is one bounded
engine-owned Occasion—a riddle, card hand or dialectic—not another setup wizard. It should demonstrate:

- a question whose choices depend on prior consequences;
- an interruption or exit represented by the engine;
- identical page and terminal questions;
- durable world consequences rather than a private UI result.

A minimal navigator may then own current identity, legal choice validation and back/exit rules. Domain code still
derives questions and applies choices.

### Migration slices

1. Extract common question, choice and completion types while keeping `CreationFlow` behavior unchanged.
2. Add contract specs asserting every offered choice has a nonempty label, the current question exists, and a stale or
   unavailable choice is refused by the engine.
3. Adapt the terminal and page creation clients to consume the common protocol without client step knowledge.
4. Choose one real focused interaction already in the beta path. Express its questions through the same protocol
   while its world effects remain Kyr/runtime effects.
5. Compare page and terminal projections at every question and after interruption/return.
6. Extract navigation only for behavior demonstrably duplicated by both consumers; otherwise stop at protocol types.

### Isolated proof

- every selectable choice has a stable id and nonempty intelligible label;
- submitting a choice not present in the current question fails without mutation;
- choosing a leading option recomputes the next question before it is rendered;
- back, exit and completion are engine results rather than client conventions;
- serializing/restoring at a question boundary yields the same question;
- both clients render the same ids, order, selected state and availability;
- the contrasting Occasion survives interruption and return with its focus intact.

### Acceptance

The type extraction is accepted when creation clients use it and no client owns creation phase. A flow framework is
accepted only when creation and the focused interaction use the same navigation mechanism without domain-specific
conditionals in the shared code. The visible dividend is one fewer page-shaped interaction and a parity proof, not
merely fewer interfaces.

### Risks and stop conditions

- Creation permits dense lists, written answers, rerolls and multi-selection; a conversation or riddle may not. Keep
  capabilities explicit rather than optionalizing dozens of fields in one universal question.
- Backtracking in creation changes a draft model; returning to an Occasion may restore durable focus. They may share
  presentation protocol but not navigation semantics.
- Do not create a second Kyr process language in TypeScript. Authored Incidents and Occasions remain Kyr constructs;
  the question protocol is their player-facing engine projection.

## Candidate deliberately deferred: projection and witness pipelines

Presentation contains recurring select, index, derive, group and attest stages. `Attest` already centralizes witness
construction, and the Outcome work is commissioned to become the authoritative meaning of an offered row. A generic
projection pipeline now would risk blessing today's downstream reconstruction just before that authority moves into
the engine.

Revisit only after Outcome and situation state land. The evidence required is three projections that share:

- the same source rows;
- the same stable identity rule;
- the same derivation/witness relationship;
- the same incremental invalidation boundary.

Until then, consolidate semantics into Outcome and keep presentation transformations concrete.

## Candidate rejected: a general state-machine framework

Kyrie's difficult states carry different obligations:

- creation dynamically derives questions from a draft character;
- an open command coordinates an ordered atomic lifecycle;
- combat is a rules process with legal commands and initiative;
- a situation is authoritative world/player focus;
- an Undertaking is durable authored intention and aftermath.

They share the word “state” but not a transition contract. A generic machine would either be too weak to enforce
their invariants or strong enough to hide fictional causality in tables and callbacks. Extract the checked lifecycle
and engine-owned question protocols separately. Reconsider common machinery only if their isolated proofs converge.

## Delivery sequence

These are opportunistic consolidation slices, not four new sprints.

| Order | Slice | Rides with | Required proof | Expected deletion/dividend |
|---|---|---|---|---|
| 1 | Predicate/value traversal kernel and two migrations | MT-30 authorability or a touched compiler/lint task | all-variant and compiled-fixture equivalence | two handwritten walkers; one definition of child positions |
| 2 | Weak keyed cache plus observed cache specialization | OR-183 / incremental grounding | hit/miss dependency equivalence and measured stage result | local `once` patterns; safer invalidation |
| 3 | Checked command lifecycle | MT-24 | phase fault-injection matrix and canonical rollback | phase convention replaced by enforcement |
| 4 | Shared question protocol | first minute or situation continuity | client parity and stale-choice refusal | client phase knowledge removed |
| 5 | Second question consumer and only then navigation helper | Occasion / conversation / riddle work | interruption and return through both clients | one focused interaction no longer a private control machine |
| 6 | Transaction participant coordinator, if earned | MT-24 completion | every participant captured and restored | nested rollback coordination made explicit |

Only one extraction should be actively reshaping a layer at a time. The traversal and cache kernels can be developed
independently, but their migrations should remain small so failures are attributable. The command and question work
must follow the active integration fixture rather than landing as unused infrastructure.

## Consolidation scorecard

For each landed slice, record:

| Measure | Why |
|---|---|
| Register row or commissioned contract advanced | prevents an unowned refactor stream |
| Consumers before / after | shows the mechanism is genuinely shared |
| Handwritten mechanisms deleted | proves consolidation rather than wrapping |
| New isolated specs | makes the mechanism exercisable on its own |
| Differential or parity proof | protects behavior during migration |
| Performance before / after, where relevant | prevents cache work from resting on intuition |
| Imports added across layers | must be zero upward/wrong-way additions |
| Exceptions added to the shared API | exposes a false abstraction early |
| Player or author dividend | ties structure back to the doctrine |

No target line-count reduction is set. A slightly larger checked mechanism may be better than a short convention if
it prevents a half-command, stale action, missed Kyr child or client-owned phase.

## Immediate recommendation

The first implementation should be the predicate/value traversal kernel, because it is setting-independent, purely
functional, cheap to prove and directly useful to semantic tracing and author tools. Land it with two migrations,
not a repository-wide conversion.

The next implementation should occur inside OR-183 work: extract only the cache primitive that the measured repair
needs, demonstrate dependency-equivalent hits and lower the relevant timing baseline. If OR-183 does not need a
shared primitive, migrate `HexBoundary` and `WorldMemo` as a separate small structural proof only when it does not
displace the active queue.

MT-24 then supplies the correct moment for the checked lifecycle. Its fault-injection results, not architectural
symmetry, decide whether a transaction-participant abstraction exists. Finally, the first-minute and situation work
can use shared question types; a framework is earned only by one excellent focused interaction beyond creation.

The governing call is: **extract repeated obligations, not repeated shapes**. A successful consolidation makes the
engine's authority, causality and invalidation more explicit, helping the player forget the interface because fewer
parts of the system can quietly disagree about what happens next.
