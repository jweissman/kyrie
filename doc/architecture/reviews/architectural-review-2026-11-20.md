# Architectural review of Kyrie

20 November 2026. Read-only review of `main` at `87a51dfe2`.

## Executive judgment

Kyrie has a strong architectural centre. Its intended separation—Deem chooses, Kyr says what things mean, Kyrie
owns truth, and presentation decides what the player sees—is unusually clear for a game whose generated world,
rules language, persistent simulation, two clients and authoring tools have all grown together. The implementation
substantially honours that separation in the places where correctness matters most: stable command identity,
identity-keyed randomness, copy-on-write world facts, a distinct creature store, rollback around commands, one
projection shared by browser and terminal, transcript digests, and extensive executable contracts.

The chief risk is not a bad design. It is that the implementation has become a highly connected semantic monolith
whose boundaries are documented more strongly than they are enforced. The system has layers, but several are
cycles; campaign isolation exists, but depends on swapping process-global catalogs; command atomicity exists, but
crosses two coordinators; TypeScript can ask the world for a misspelled relation and receive an innocent empty list;
and the parser is not yet the sole authority over Kyr source transformations.

The recommendation is evolution, not a rewrite. Four bounded changes would make the intended architecture real:

1. Give each campaign an immutable catalog context and remove process-global catalog activation.
2. Make the command lifecycle explicit, with one transaction boundary and a committed receipt.
3. Establish one immutable player-frame boundary and untangle the `ui`/`presentation` cycle around it.
4. Put name binding and vocabulary validation in the compiler, then enforce dependency direction in CI.

These are enabling changes. They make concurrency safe, failure behaviour legible, projections cacheable, saves
smaller, and future content cheaper to add without altering the character of the game.

## Scope and method

The review read the project contract, architecture map, domain model, status and open register; traced the command,
load, save, restore and projection paths; inspected the language world, module shadowing and local catalogs; examined
TypeScript and ESLint configuration and CI; and ran the repository's November architecture probes without changing
source or data.

The measurements below are observations of this checkout, not release targets:

- 705 TypeScript files under `src`, 1,384 test files and 679 authored `.kyr` files;
- about 84,489 lines of TypeScript under `src` and `web`, beside about 99,985 lines of test TypeScript;
- a scenario-scale start with 1,429 entities, 517 actions, 668 relations, 2,722 facts and 63 offered actions;
- its first screen build at 104 ms and second at 19 ms; its first leaf at 23 ms and second at 16 ms;
- its copied save at 37 ms, JSON checkpoint at 43 ms, restore at 116 ms and checkpoint at about 2.8 MB, of which
  about 1.6 MB was the compiled module;
- 16 shared rule modules: 125 KB of Kyr, 89 actions, 275 relations, 183 entities, 57 rules and a 0.23 MB serialized
  representation;
- 7,339 fact reads by name over a short scenario probe, including four reads of one undeclared name, `mounted`;
- 43,729 string literals in `src` and `web`, including 849 direct reads of shared-rule relations and 180 pieces of
  Kyr source embedded in TypeScript;
- a dependency census showing 33 value imports from `src/ui` to `src/presentation` and 49 in the other direction,
  as well as upward imports from session, rules, campaign, canon and world-generation code.

Timing figures are local and only useful as proportions and clues. The structural observations do not depend on the
machine on which the probes ran.

## What should be preserved

Before discussing debt, the following decisions are load-bearing strengths.

### One authoritative history

`Campaign` owns the running truth. `World` forks rather than exposing arbitrary mutation; creature bodies live in a
separate store; the page and terminal read projections rather than maintaining parallel rules. This is the right
foundation for a persistent world.

### Stable commands, not labels

Choices are executed by id and labels are presentation. This supports rewriting, localisation, different clients and
replay without changing meaning. It is also the correct defence against prose becoming an accidental API.

### Identity-keyed randomness

The promise that giving somebody a rope does not redraw the rest of their life is both a player-facing property and
an architectural one. Named and identity-keyed draws make generation composable and regressions explainable.

### Transactional intent

Campaign execution checkpoints the world, creature store, definitions, observations and log, and restores them on
failure. The creature lease model likewise makes all-or-nothing combat state possible. The gaps identified below
are at the edge of a good transaction model, not evidence that none exists.

### An executable project contract

The test estate is larger than the application by lines, and many tests state architectural promises: isolation,
atomicity, deterministic replay, client parity, save restoration, authorability and honest presentation. The open
register also records risks candidly. This is unusually mature infrastructure for continuing architectural work.

## Finding A: local content is process-global state

**Severity:** P1 correctness and concurrency risk.  
**Present evidence:** `src/canon/local-catalog.ts`, `src/campaign/load-cache.ts`; open-register AR-02.

Kyr modules may declare local items and species. At present those declarations are installed by mutating the static
`Canon.items`, `Canon.species`, `Canon.installed` and `ItemCatalog.definitions` collections. A static owner identifies
which campaign's overlay is currently active, and a claimant resets the catalogs and installs its own before use.
The source explicitly records the remaining limitation: two campaigns interleaved within one command can still
meet the wrong catalog.

Loading is serialized through `LoadCache.queue` because parsing and using a loaded module pass through the same
shared catalogs. This prevents one observed race, but makes isolation a scheduling convention. Any new `await`,
parallel simulation, shared worker, hosted server or plugin callback can cross the convention without a type error.

### Failure modes

- Campaign A resumes after campaign B activated its overlay and resolves an item or species against B's meanings.
- Two modules use the same local id differently and a transient global installation produces a false collision.
- A parser or cache key observes a fingerprint belonging to another campaign.
- Parallel tests pass individually and fail when scheduled together.
- A future server serializes all worlds accidentally, turning correctness debt into throughput debt.
- A renderer consults a global catalog after the command that activated the campaign has yielded.

### Preferred mitigation: `CatalogContext`

Introduce an immutable value owned by a campaign:

```ts
interface CatalogContext {
  base: CanonCatalog;
  local: LocalCatalog;
  resolveItem(id: string): ItemKind | undefined;
  resolveSpecies(id: string): Species | undefined;
  resolveAbility(id: string): Ability | undefined;
  fingerprint: string;
}
```

The base catalog can be shared by every context. A module installation returns a new local overlay, structurally
sharing the old one. Resolution checks the overlay, then the base. Parsing and compilation receive the context or a
smaller vocabulary interface; campaign, creature, item and presentation services receive it from their host.

### Incremental mitigations

1. Inventory every read of static `Canon` and `ItemCatalog` state, classifying it as build-time base data,
   campaign-dependent resolution or presentation metadata.
2. Add a `CatalogReader` interface and route new code through it before changing storage.
3. Put existing static access behind an `AsyncLocalStorage` or explicit scoped adapter only as a temporary bridge.
   This can expose missed call paths, but must not be the final design: browser workers and nested asynchronous work
   still deserve explicit ownership.
4. Store a catalog context on `CampaignDefinition` or `Campaign`, and migrate consumers a subsystem at a time.
5. Make module compilation return its overlay rather than installing it as a side effect.
6. Include the immutable base revision and overlay digest in parse and compile cache keys.
7. Remove `LocalKinds.owner`, `activate`, `claim`, `reclaim` and `reset` once no runtime lookup uses globals.
8. Remove the serial load queue after concurrent-load tests prove it unnecessary.
9. Freeze base catalogs in development so a remaining mutation fails immediately.
10. Consider branded ids (`ItemKindId`, `SpeciesId`) at the context boundary to prevent family confusion.

### Verification

- Start two campaigns with the same local id carrying deliberately different definitions; interleave commands at
  every awaited boundary and prove each observes only its own definition.
- Load, restore, render and autoplay those campaigns concurrently in the same process.
- Add a stress spec that injects yields between claim and every former catalog read.
- Assert base catalogs are byte-for-byte unchanged after load, play, restore and failure.
- Run campaign-isolation tests under Bun's parallel test scheduler repeatedly.
- Benchmark parallel loads before and after removing the queue.

## Finding B: the four layers form cycles

**Severity:** P1 change-risk; P2 runtime and build-cost risk.  
**Present evidence:** `scripts/review-2026-11/layers.ts`; open-register AR-06 and AR-07.

The architecture map describes four responsibilities, but directory-level dependencies do not impose them. The
largest conceptual cycle is `src/ui` ↔ `src/presentation`. Session code imports both. Presentation imports campaign,
rules, canon, narrative, data and UI. UI imports presentation, campaign, canon, rules, world and paintings. Some
world-generation code imports paintings and narrative, while campaign code reaches into world composition.

Not every upward import is wrong. A composition root must import all layers, and a player-facing application service
may legitimately return a view. The problem is that there is no narrow seam: semantic visibility, legal choices,
wording, emphasis, itinerary construction, screen grouping and session orchestration know about one another in both
directions.

### Consequences

- It is difficult to tell whether a change belongs to truth, projection, narration or layout.
- A second renderer must understand a large graph instead of one stable frame.
- Projection caching has no obvious ownership or revision key.
- Unit tests import more of the application than their nominal subject requires.
- Circular initialization remains a latent risk as modules acquire top-level work.
- The documented dependency rule can regress without CI noticing.

### Preferred mitigation: one player-frame boundary

Do not begin by moving files. First define the value a client is entitled to receive:

```ts
interface PlayerFrame {
  revision: string;
  scene: VisibleScene;
  choices: PublicChoice[];
  aims: PublicAim[];
  company: PublicCompany;
  chronicle: PublicEvent[];
  navigation: PublicNavigation;
}

interface PublicChoice {
  id: string;
  label: string;
  group: ChoiceGroup;
  availability: 'open' | 'withheld' | 'exhausted';
  reason?: PublicReason;
  provenance: ChoiceProvenance;
  consequences?: PublicProspect;
}
```

The frame is immutable, contains only knowable information, and has no methods that mutate truth. Browser, terminal,
runner and agent interfaces consume it. Narration may either be part of the frame or a deterministic rendering of
typed frame/events, but must not require omniscient campaign access from the client side.

The likely end state is not two peer packages called UI and presentation. It is one projection subsystem with
internal strata:

1. **Semantic projection:** legal/withheld choices, knowledge, provenance, visible facts, aims and consequences.
2. **Narrative projection:** typed clauses and voice derived from visible facts and committed receipts.
3. **Screen composition:** grouping, promotion, emphasis, fold and layout-neutral page structure.
4. **Renderers:** React, terminal, JSON runner and handbook surfaces.

Dependencies flow downward through those strata, never back upward.

### Additional mitigations

- Move journey-driving helpers used only by tests and CLI out of the core session into a driver package.
- Keep `PlaySession` concerned with command submission, replay, checkpoint and combat-controller handoff; move
  wording and screen concerns behind injected ports.
- Define small host interfaces (`WorldReader`, `CampaignReader`, `CatalogReader`) rather than accepting `Campaign`
  everywhere.
- Separate semantic identifiers from formatted text in all public view types.
- Carry typed restriction reasons instead of reconstructing them from strings.
- Carry provenance—authored action, generated affordance, aim lead, system action—on every public choice.
- Make projection functions pure over a read-only snapshot plus catalog context.
- Give each committed campaign state a monotonically increasing or content-derived revision.
- Cache exactly one complete player frame per revision; derive screen variants from that frame.
- Eliminate direct imports from `web/reader` to campaign, rules and canon after the frame is sufficient.
- Add lint/import rules based on a checked-in layer manifest. Permit named composition roots explicitly.
- Report new upward edges in CI, initially as a ratchet: no increase from the current baseline.
- Detect strongly connected components, not merely pairwise upward edges.
- Prefer capability interfaces over catch-all service locators; a new dependency should be visible in a constructor.

### Verification

- Build the terminal and browser from serialized `PlayerFrame` fixtures with no campaign import.
- Compare both clients' command ids, availability and reasons from the same frame.
- Mutation-test hidden facts into the campaign and prove the frame does not expose them.
- Run projection twice at one revision and require structural equality and no new fact reads.
- Establish a CI dependency budget that reaches zero cycles for the intended layers.

## Finding C: command atomicity has two coordinators

**Severity:** P1 correctness risk as the lifecycle grows.  
**Present evidence:** `src/campaign/campaign.ts`, `src/session/play-session.ts`; open-register AR-01.

`Campaign.executeAsync` selects the offered action, checkpoints campaign state, resolves combat, settles the command,
runs watches and commits or rolls back. `PlaySession.perform` then expands the frontier, produces rule words and
narration, updates undertakings, digests the campaign, appends a transcript step and marks words told.

Expansion and initial telling have an explicit catch that calls `campaign.undo()`. Later work does not share that
catch. At present those later functions may be expected not to throw, but the transaction guarantee depends on an
implicit classification of functions as infallible. The transcript and campaign log are also mutated by different
owners.

### Failure modes

- A new validation in undertaking updates throws after world truth committed but before the transcript step exists.
- Digesting encounters a non-serializable or invalid value and leaves a command without replay evidence.
- Marking narration told throws after the transcript was appended.
- Expansion installs content and a later presentation failure undoes only part of the wider operation.
- A caller invokes `Campaign.executeAsync` directly and obtains behaviour different from the canonical player path.
- Tests prove individual phases but not their order, exactly-once behaviour or rollback boundary.

### Preferred mitigation: explicit phases and a unit of work

Represent the lifecycle rather than leaving it in call order:

```text
accepted → simulated → expanded → committed → projected → recorded → published
              \________________ rollback _________________/
```

One application-level `CommandUnitOfWork` should own every mutable participant through commit. The simulation returns
a proposed receipt. Expansion joins the proposal. Aim changes that are game state join the proposal; aim-selection
that is player preference belongs in an explicitly separate preference transaction. Only after all fallible state
work succeeds does the unit commit campaign state and append the transcript atomically.

Narrative publication should consume the committed receipt. If it is deterministic and pure, it may safely happen
after commit and be recomputed. If the exact voiced result is part of history, compute it before commit and include
it in the receipt.

### Additional mitigations

- Make `CommandResolution` the canonical immutable receipt and extend it with installed modules, aim changes,
  narrated clauses, RNG identities used and the resulting revision/digest.
- Replace `Campaign.undo()` as a public after-the-fact escape hatch with an owned transaction object that can commit
  once or dispose.
- Mark phase methods with types such as `ProposedCommand`, `ExpandedCommand` and `CommittedCommand` so phases cannot
  be called out of order.
- Make transcript append part of the same commit object, or write an intent record before executing and finalize it
  after success.
- Ensure every phase is idempotent or explicitly one-shot.
- Move `busy` ownership into the unit of work so no alternate entry point bypasses it.
- Replace duplicated synchronous and asynchronous execute paths with one async implementation; a synchronous adapter
  may call a lower pure simulation primitive if still required.
- Declare which failures are player refusals, rule failures, engine defects and infrastructure failures.
- Ensure expected refusal never begins a transaction and never advances RNG or history.
- Give external expansion a bounded port that returns proposed modules rather than mutating the campaign directly.
- Record a golden lifecycle trace: phase, revision, elapsed time, fact count, creature lease count, log length and
  transcript length.
- Add assertions that no save, install or observation occurs while a transaction is half-committed unless explicitly
  part of that phase.

### Verification

- Inject a throw before and after every phase and compare world, creatures, modules, observations, history,
  transcript, aims, RNG state and digest with the pre-command checkpoint.
- Repeat for commands with combat, frontier expansion, interruption, arrival, death and follow/unfollow.
- Prove one accepted command produces exactly one receipt and transcript step.
- Replay only committed receipts and obtain the same digest.
- Test process termination between durable intent and durable commit if saves ever move to a server or database.

## Finding D: TypeScript fact reads are stringly and permissive

**Severity:** P1 defect-detection gap; usually low-cost to mitigate.  
**Present evidence:** `src/lang/world.ts`, `scripts/review-2026-11/unknown-reads.ts`; open-register AR-03 and AR-11 are
adjacent risks.

Kyr predicate evaluation rejects an unknown relation. Direct TypeScript calls to `World.related`, `relatedTo`, `one`
and `measured` instead return an empty view when no storage exists. That is correct for a declared relation with no
facts, but the method does not distinguish that case from an undeclared or misspelled relation.

The short probe found undeclared `mounted` reads. More importantly, the static census found hundreds of literal-name
reads spread across campaign, presentation and UI. Renaming a relation can therefore remove behaviour without a
compiler error or runtime failure.

### Mitigations

- In development and tests, make `related`, `relatedTo`, `one` and `measured` throw when the module does not declare
  the name in the appropriate family.
- Introduce explicit optional forms such as `relatedIfDeclared`; make the exceptional intent visible at the call.
- Resolve current unknown reads rather than allowlisting them without explanation.
- Generate a `SharedRelations` vocabulary from the compiled shared rules, exporting branded names and signatures.
- Use generic helpers so `one(Relations.at, actor)` knows that `at` is binary and returns a place id.
- Represent optional module vocabulary with capabilities: `if (world.has(Vocabulary.mounts))` returns a typed reader.
- Have `ModuleCompiler` emit a symbol table consumed by runtime readers, avoiding repeated string lookup.
- Include relation family and arity in runtime assertions.
- Track reads by symbol in diagnostics, not only by name, so shadowed/local relations remain distinguishable.
- Run unknown-read instrumentation in a representative start, turn, fight, save/restore and generated-country walk
  in CI.
- Add mutation tests that misspell or remove frequently read relations and require a loud failure.
- Ratchet the direct string-literal count down; forbid new literal reads outside compiler/runtime adapters.

### Caution

Do not make “no stored facts” itself an error. The distinction is declaration versus current contents. Nor should
optional cross-module vocabulary force every module to declare everything: the capability form exists for that case.

## Finding E: shadowing rewrites source text before parsing

**Severity:** P2 compiler correctness and maintenance risk.  
**Present evidence:** `src/campaign/module-shadow.ts`; open-register AR-08.

When an authored module and shared rules use the same name, `ModuleShadow.text` rewrites function-like occurrences
with regular expressions, taking care to skip comments and rewrite only brace calls inside quoted prose. Actions are
renamed later in parsed structures. This solved a real compatibility problem, but it leaves a second lexer beside
Ohm and divides name binding between text and AST transformations.

### Failure modes

- New string, comment or interpolation grammar is understood by Ohm but not by the shadow rewriter.
- A diagnostic names generated `own_` text or points at an offset no longer matching the author's source.
- A syntactically similar occurrence is rewritten without being a bound reference.
- Tooling that parses original source and runtime code that parses rewritten source disagree.
- `own_` collides with an authored identifier or becomes a de facto reserved prefix.

### Mitigations

- Parse original source once and retain source spans on declarations and references.
- Add a binding pass that assigns each declaration a symbol identity and resolves every reference to a symbol.
- Namespace symbols internally with module identity; display the author's name in diagnostics.
- Let shared and local declarations have the same spelling because identity, not rewritten spelling, distinguishes
  them.
- Lower prose interpolations to typed reference nodes during parsing rather than rediscovering calls in strings.
- Rename only in a printed/exported representation if one is required, never as the semantic operation.
- Reserve generated ids structurally, not through an author-visible prefix.
- Preserve source maps through template expansion, parsing, binding and lowering.
- Add adversarial grammar fixtures: escaped quotes, braces, comments, nested interpolations, names that prefix other
  names, Unicode text and future multiline strings.
- Keep the current transformer behind differential tests until bound-AST compilation produces identical modules.
- Delete it only after every shadowing corpus case compiles and plays through the new binder.

## Finding F: saves contain compiled representation rather than chiefly state

**Severity:** P2 performance, compatibility and storage risk.  
**Present evidence:** `Campaign.save` and `restore`; open-register SP-01 through SP-03.

The current checkpoint is robust because it carries the compiled module, campaign definition, state, creature
snapshot, event log, encounter and observations. It is also large and closely coupled to current internal shapes.
The scenario measurement placed more than half its 2.8 MB JSON checkpoint in the module.

### Mitigations

- Define the durable save contract independently of the current `CampaignSave` interface.
- Give every immutable content bundle a canonical digest incorporating engine schema version, source digests,
  compiler version and catalog base revision.
- Keep compiled modules in a content-addressed cache; save the digest plus module-local/generated source necessary to
  reconstruct content not in the distribution.
- Persist changed state, creatures, observations, command receipts and player preferences, not derived indexes.
- Separate replay transcript, recovery checkpoint and portable archival save: they need not have identical payloads.
- Add an explicit save schema version and migrations between durable versions.
- Use a canonical codec with validation and bounds, rather than trusting arbitrary deserialized objects.
- Consider compression only after representation is reduced; compression can hide needless duplication.
- Deduplicate repeated strings and symbol names in a binary or table-based format if portable-save size still matters.
- Keep a self-contained export mode for archival or sharing, even if routine browser checkpoints reference cached
  compiled content.
- Retain integrity digests, and add content-digest verification before restore.
- Budget save, restore and checkpoint sizes per representative scale in CI.
- Test restoration with caches empty, caches warm, content unavailable and an older supported schema.
- Document whether code upgrades promise old-save compatibility, migration, or only same-build restoration.

## Finding G: shared rules are repeatedly cloned and composed

**Severity:** P2 startup and scaling cost.  
**Present evidence:** `scripts/review-2026-11/rules-size.ts`, loading-boundary and performance documents.

The shared rules are modest in isolation but participate in each installation's composition and cloning. Generated
worlds multiply the cost. The architecture currently treats composition largely as construction of another complete
module rather than linking immutable definitions against local declarations.

### Mitigations

- Compile shared rules once to immutable IR.
- Separate declaration tables from instance state; installations reference shared declarations by symbol id.
- Link local modules against shared symbols rather than copying shared actions, relations and entities.
- Intern immutable predicates, expressions, parameter lists and source metadata.
- Store local overrides and additions as overlays.
- Replace blanket `structuredClone` with constructors that copy only mutable state or with persistent collections.
- Deep-freeze compiled IR in development, making structural sharing safe and enforcing the convention.
- Cache compilation by source digest plus vocabulary/catalog digest.
- Track cache hit/miss reasons and bytes retained, not only elapsed time.
- Differential-test cache on/off and linked/copied compilation for identical modules, worlds and play.
- Set startup budgets by phase: source acquisition, parse, bind, link, instantiate, settle, project, clone/transfer.
- Treat worker `structuredClone` and browser transfer as first-class phases in benchmarks.
- Explore lazy installation only after identity-keyed generation and linking make order independence provable.

## Finding H: player projection is recomputed through a broad graph

**Severity:** P2 latency and consistency risk.  
**Present evidence:** first/second screen measurements; open-register AR-06 and SP-03.

The first screen was substantially more expensive than the second, showing useful memoization. Yet a turn crosses
screen and glance work multiple times, and `Campaign` exposes both copied state and read-only live readouts. Without
one frame owner and one revision, independent callers can rebuild overlapping projections or accidentally cache
against insufficient inputs.

### Mitigations

- Assign every committed campaign state a revision that changes for world facts, creatures, installations,
  observations and player-facing preferences.
- Build one `PlayerFrame` per revision and cache it at the application boundary.
- Make leaf, glance, screen, runner offer and terminal output consume that frame or typed subprojections.
- Record the relation/symbol dependencies of expensive facets and invalidate them from command-receipt writes.
- Use coarse whole-frame caching first; add incremental facets only when measurements justify complexity.
- Ensure caches are owned by the projection service, not scattered static maps.
- Make cache keys include locale/voice, viewport-independent presentation policy and catalog context where relevant.
- Prove cached and uncached projections equal over an autoplay corpus.
- Track frame build time, fact reads, allocations, cache hit rate and serialized size.
- For the browser, transfer the frame once per turn rather than allowing several request/response projections.

## Finding I: authored meaning still leaks into TypeScript

**Severity:** P2 authorability and setting-portability risk; not all occurrences are defects.  
**Present evidence:** hardcoded-string census; open-register AR-09, AR-13 and AR-16.

The census found 180 pieces of Kyr source embedded in TypeScript, 142 under world generation, and substantial prose
and catalog identity in code. Some of this is legitimate desugaring or generic narration. Some is content assembled
in TypeScript because the language or template system cannot yet express the generator conveniently.

The danger is not merely “strings in code.” It is having no crisp test for whether a plot, place, profession or
setting law can travel with a module, be inspected by authoring tools, shadow safely, cite its source and be changed
without an engine release.

### Classification and mitigations

Classify every embedded Kyr fragment:

- **Language desugaring:** move to parser/compiler lowering and test at the language level.
- **Generic generator template:** move to a versioned `.kyrt` or typed generation asset with escaped substitutions.
- **Setting/scenario content:** move to `data` alongside its module and sources.
- **Algorithmic runtime construction:** keep in TypeScript, but build typed IR rather than source strings.
- **Scaffolding emitted by authoring commands:** keep as templates/assets used by the tool, not literals in its logic.

Then:

- Give templates a typed parameter schema, required placeholders and safe escaping by syntactic position.
- Fail on every unfilled placeholder unless explicitly declared as a later Kyr reference.
- Prefer AST/IR builders for generated structure once generation is beyond simple substitution.
- Preserve provenance from generated node to template, table choice and authored source.
- Make setting ports supply calendar, planes, world shape and encyclopedia contributions through explicit interfaces.
- Ratchet embedded Kyr source and direct setting-id counts by subsystem, not as one indiscriminate target.
- Add a portability proving case: load a minimal non-Imbar setting without importing Imbar data.
- Add authoring tests that a scenario-local kind, law, word and generator table travel together without a central
  registry edit.

## Finding J: identity is sometimes encoded in strings

**Severity:** P3 until renaming or composition expands; then P2.  
**Present evidence:** open-register AR-11.

Several consumers infer a module or region from id prefixes and construct related identities by convention. This is
compact, but makes an identifier carry identity, namespace, ownership and sometimes location at once.

### Mitigations

- Introduce an `EntityRef` containing stable id, defining module and kind.
- Store explicit links such as place → sky, region → terrain and line → source paragraph.
- Keep human-readable compound ids for diagnostics if desired, but never parse them for semantics.
- Centralize legacy id parsing at restore/import boundaries.
- Generate new ids from namespace plus local id through one service.
- Test renaming prefixes while preserving explicit links.
- Include source identity in compiler symbols and command provenance.

## Finding K: mutable shared structures rely on convention

**Severity:** P3 latent correctness risk.  
**Present evidence:** open-register AR-04 and the use of shared modules/catalogs.

The project intentionally shares module structures and returns some live values “for reading only.” TypeScript's
`readonly` is shallow and erased at runtime. One accidental push or property mutation can corrupt caches or make one
campaign affect another.

### Mitigations

- Deep-freeze compiled modules, schemas, base catalogs and public frames in development/test builds.
- Use persistent/immutable collection types for hot shared structures where freezing is too expensive.
- Expose iterators and query methods rather than mutable arrays where practical.
- Brand owned mutable snapshots separately from borrowed read views.
- Remove casts that turn readonly structures back into writable records outside construction adapters.
- Add mutation probes that attempt to modify shared definitions and require failure.
- Make copy ownership explicit in names: `snapshot`, `view`, `take`, `borrow`, `owned`.

## Finding L: verification is excellent but architectural enforcement can be cheaper

**Severity:** P2 feedback risk.  
**Present evidence:** CI workflow and verification documentation.

The project has extraordinary behavioural coverage, but the full suite and browser matrix are expensive enough to
be nightly while pushes use selected lanes. Architectural invariants such as dependency direction, unknown relation
reads, global catalog mutation and save budgets can be checked much more cheaply than end-to-end play.

### Mitigations

- Add a sub-minute architecture job containing dependency-cycle, unknown-read, catalog-mutation and generated-file
  checks.
- Convert the current layer report to a baseline ratchet, then to fixed forbidden edges.
- Map source files and data ids to focused tests using the existing changed-test tooling; report uncovered changes.
- Split deterministic pure projection tests from browser layout tests.
- Keep representative tiny, scenario and full scales for every performance contract.
- Store benchmark distributions and alert on statistically meaningful changes rather than single timings.
- Quarantine genuinely long evidence runs from correctness gates, but keep their most important invariants in small
  synthetic worlds.
- Test concurrency and failure injection explicitly; ordinary happy-path volume does not substitute for them.
- Keep generated reports reproducible byte for byte and record the command and revision in each.
- Add a contract coverage index connecting each architecture promise to its cheapest proving test.

## Recommended target architecture

The smallest useful target is:

```text
Sources / Deem tables / Kyr text
                 │
                 ▼
       Parse → bind → immutable IR
                 │          │
                 │          └── immutable base + local CatalogContext
                 ▼
       Campaign runtime and stores
       World · Creatures · Clock · Plans
                 │
        proposed/committed receipt
                 │
                 ▼
        Application / PlaySession
       transaction · transcript · save
                 │
          immutable PlayerFrame
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
    browser   terminal   runner/tools
```

The arrows are dependencies and data flow. The runtime does not import projection. Session does not formulate prose.
Renderers do not import campaign, rules or catalogs. Compilation does not mutate process globals. A command receipt
is the handoff from truth to history and projection.

## Sequenced programme

### Stage 0: establish guardrails

This stage should change little runtime behaviour.

- Check in a dependency graph baseline and reject new cycles/upward edges.
- Make undeclared relation reads fail in tests, with explicit optional-read escape hatches.
- Deep-freeze shared definitions in tests.
- Add two-campaign interleaving and phase-failure test harnesses, initially documenting failures.
- Record startup, frame, save and restore budgets at tiny/scenario/full scales.

**Exit:** known violations are measured; new violations cannot accumulate silently.

### Stage 1: isolate catalogs

- Introduce catalog reader/context interfaces.
- Put a context on campaigns and compiler inputs.
- Migrate item/species/ability resolution away from statics.
- Make compilation return local overlays without installing them.
- Prove concurrent campaigns and remove the queue.

**Exit:** no campaign-dependent global mutation; parallel play is correct.

### Stage 2: make commands one unit

- Define phase types and extend committed receipts.
- Put expansion and gameplay-relevant undertaking changes inside the transaction.
- Make narration a pure receipt/frame derivation or include its typed result before commit.
- Atomically commit campaign state and transcript evidence.
- Collapse sync/async execution duplication.

**Exit:** fault injection at every phase leaves either all or none of a command.

### Stage 3: establish the player frame

- Define public choice, reason, provenance, visible scene and chronicle types.
- Build the frame once per revision.
- Move browser, terminal and runner to it.
- Move journey drivers and test navigation outside core session.
- Untangle and then reorganize `ui` and `presentation` around one-way projection strata.

**Exit:** clients import no runtime truth and can render serialized frame fixtures.

### Stage 4: harden compilation and linking

- Add compiler symbol identities and source spans.
- Replace source-text shadowing with binding.
- Compile shared rules once and link overlays.
- Generate typed shared vocabulary.
- Move or classify embedded Kyr and setting dependencies.

**Exit:** the parser/compiler is the sole authority over Kyr meaning; shared rules are immutable linked IR.

### Stage 5: narrow persistence

- Define durable save schemas and content digests.
- Store state and references to immutable content, with a self-contained export form.
- Add migrations and cache-empty restore tests.
- Set checkpoint size/latency budgets.

**Exit:** routine saves are chiefly changed state, not a copy of the program.

## Things not to do

- Do not rewrite the engine or language. The existing semantics and test corpus are assets.
- Do not reorganize directories before semantic seams exist; that changes the map, not the dependency graph.
- Do not introduce a general dependency-injection container. Explicit narrow contexts and ports are easier to audit.
- Do not pursue fine-grained incremental projection before whole-frame caching is measured and insufficient.
- Do not make all content data-driven indiscriminately. Algorithms belong in code; the classification is about
  ownership and portability.
- Do not optimize save compression before removing duplicated compiled representation.
- Do not hide catalog globals behind ambient async state as the final solution.
- Do not treat the full test suite as the only defence; cheap structural checks should fail first.
- Do not expose omniscient runtime objects to clients merely to ease migration. Build adapters toward the frame.

## Decision register suggested for the owner

The programme requires a few explicit choices:

1. Is more than one campaign in a process a supported contract now, or only a near-term enabling constraint? The
   recommended design supports it either way, but its priority follows from the answer.
2. Is exact narration durable history, or may it be regenerated from a committed typed receipt? Durable wording
   simplifies continuity across code changes; regenerated wording makes saves smaller but can retell old events.
3. Must portable saves survive engine upgrades? If so, versioned durable schemas and migrations should precede
   further growth of `CampaignSave`.
4. Is `PlayerFrame` allowed to include layout-neutral grouping and emphasis, or should those remain client policy?
   The current project contract suggests grouping and emphasis are shared presentation truth, while physical layout
   remains client-owned.
5. Is Kyr intended to support settings other than Imbar? If yes, calendar, planes, world shape and encyclopedia ports
   become architectural work; if not, their coupling is product scope rather than debt.

## Closing assessment

Kyrie's architecture is already good enough to deserve careful consolidation rather than reinvention. Its core
model—authored declarative meaning over a deterministic persistent world, projected honestly to several clients—is
distinctive and sound. The main debt comes from success: more content, more projection semantics, more tools and more
performance work have crossed seams that began as conventions.

The next maturity step is to make those conventions impossible to violate accidentally. Per-campaign catalogs make
worlds genuinely independent. An explicit command unit makes history genuinely atomic. A single player frame makes
clients genuinely subordinate to truth. Compiler-owned symbols make Kyr genuinely authoritative. Dependency and
unknown-read checks keep those gains from eroding.

None of that changes what the game is. It gives the existing idea a structure capable of carrying considerably more
of it.
