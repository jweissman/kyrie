# Kyr at the point of separation

20 November 2026. A language and platform review of Kyr, its authored corpus, its relation to Deem and Kyrie, and
the maturity work already under way. This report turns the broader diagnosis in
[`doc/authoring/if-fitness-and-affordances.md`](../../authoring/if-fitness-and-affordances.md), the platform maturity
track, the KX authorability experiment and the November author friction reports into an implementation order.

## Executive judgment

Kyr's direction is sound. Its present way of evolving is reaching its limit.

Kyr has found a distinctive model for interactive fiction: typed transformations of one persistent world, used by
player choices, NPC planning, simulation, tests, presentation, saves and deterministic replay. Its strongest
properties are not natural-language syntax or general programmability. They are one mechanical truth, persistent
history, typed fictional meaning, autonomous time, strict generated composition and an interface that offers only
legal acts.

The language nevertheless conflates three responsibilities:

1. a small relational transition kernel;
2. a high-level authoring language for consequential fiction;
3. the Westernesse platform's ontology, standard rules, generation, combat and presentation conventions.

The kernel is already present in `src/lang/world.ts`. The platform is broad and increasingly capable. The authoring
layer between them is the weak part. New declarations usually lower into ordinary relations, measures, rules and
actions, but their higher-level identity is not retained. Authors therefore build fictional processes out of private
latches, counters and Boolean conjunctions; the engine runs them correctly, while tools and readers see less of the
author's intent than the surface syntax appeared to state.

The next language phase should be governed by one rule:

> Lower high-level fiction into one engine, but never erase what the author said it was.

The target is not a second interpreter or plot engine. It is a bounded Kyr kernel, a retained semantic authoring
layer, a versioned IF standard library, typed generation through Deem, and an explicit product-assembly boundary.

## 1. What Kyr wants to be

Kyr wants to be **a language for declaring consequential, inspectable fictional processes in persistent generated
worlds**.

A fictional process may be a promise, quarrel, investigation, journey, performance, danger, negotiation,
institutional change or material intervention. Its legality, participants, progress, pressures, consequences,
perception and history should be stated together and remain addressable as one thing after compilation.

Kyr does not principally want to be:

- a general-purpose programming language;
- Inform without a parser;
- Ink with a world model;
- a quest scripting language;
- Westernesse's undifferentiated data format;
- or textual calls into Kyrie internals.

The repository's existing fitness review gives the correct authoring standard: state one fictional event once, then
derive legality, simulation, knowledge, presentation, persistence and tooling from it. This report recommends making
that standard the language's architectural test.

## 2. What should be preserved

Language work should preserve these properties even when they make a convenient feature harder to design.

### 2.1 One execution model

High-level forms should continue to lower into the same facts, queries, actions, changes and watch. There should be no
separate quest scheduler, scene runtime or presentation-only legality.

### 2.2 One mechanical truth

Player choices, NPC planning, terminal play, browser play and tests should use the same grounded actions. A client may
rank or fold legal acts; it must not invent one.

### 2.3 Persistent and deterministic history

Time, offscreen acts, generated choices and consequences must remain seed-stable, replayable and saveable. New
constructs need semantic identities stable enough for compatibility comparisons, not generated rule names alone.

### 2.4 Typed fictional meaning

People, places, discoveries, promises, occasions, undertakings and institutions should remain typed concepts rather
than conventions over strings or tags. Extension should add declared contracts, not an unrestricted scripting escape
hatch.

### 2.5 Strict composition

Imports, exports, generated values and module installation should fail on incompatible meaning. The typed relation
and measure exports landed in KX-03 are the right direction; an implicit global vocabulary is not.

## 3. The principal problems and their mitigations

### 3.1 High-level declarations lose their identity

`Event`, `Promise`, `Occasion`, `Route`, `Passage` and other constructs lower into ordinary machinery. Uniform
execution is valuable, but traces, diagnostics and presentation then encounter generated rules and facts rather than
the declaration the author wrote.

**Mitigation: a semantic map for every lowering.** The compiler should retain, beside the lowered module:

- the authored construct's kind, id and source span;
- its participants and subject entities;
- its states or lifecycle;
- its generated relations, measures, actions, rules and observations;
- its read and write sets;
- its visible choices and projection hints;
- and a stable semantic compatibility id.

The runtime can continue to execute only the lowered representation. Inspection, lint, presentation, testing and
compatibility should be able to walk back to the semantic record.

**Acceptance:** `inspect --why` explains a `Promise`, `Occasion` or `Route` in the author's terms and names the
lowered rule only as supporting detail. A renamed generated rule does not break a semantic replay.

### 3.2 Authors build process machines by hand

Substantial adventures use relations such as `beat1`, `routeCold`, `songDone`, `penCalled` and `fatedSpring` as
program counters. Rules advance them; topics and actions intervene; observations project their phase. Their names
carry meanings that the type system cannot check.

**Mitigation: one retained `Undertaking` protocol, proved from the corpus.** It should describe:

- participants and roles;
- named phases;
- pressures or clocks;
- routes or mutually exclusive approaches;
- interventions;
- evidence and requirements;
- resolutions;
- aftermath and durable outcomes.

It must be porous: ordinary world actions can change its facts, actors can leave, time can pass, and no prescribed
plot path is required. It lowers to the existing substrate and retains the map described above.

The first proving slices should be existing protocols, not invented demonstrations: The Warm Wall's four buckets and
fate close, followed by one older large adventure's process machine. The rewrite must reduce authored control facts,
preserve compatibility and improve `inspect` output.

### 3.3 Dramatic hierarchy is inferred too late

Kyr derives legal choices from the world. That is a strength, but it can present many equally valid acts without
saying which belong to the present dramatic matter. Ink and Yarn make this hierarchy explicit because flow is their
source structure.

**Mitigation: a thin dramatic projection.** An undertaking or occasion may declare foreground interventions,
participants, current pressure and closure. The projection ranks and groups existing legal acts; it does not create
or suppress their legality. Background exploration and inventory remain available.

**Acceptance:** the browser, terminal and runner receive the same grouping from the engine; the page contains no
parallel dramatic rule; a cold play can name the current matter and its two or three meaningful interventions.

### 3.4 Bounded scenes and conversations are laborious

Topics work for world-conditioned subjects but multi-beat conversations, performances and physical sequences become
counters plus gated actions. AU-24, AU-25, AU-29, AU-31, AU-41 and AU-42 are facets of this one problem.

**Mitigation: mature `Occasion` before adding several isolated forms.** Extend it to retain:

- participants and optional cast roles;
- named or counted beats;
- choices within a beat;
- continuation, interruption and resumption;
- time policy;
- conditional closing lines in declared order;
- and aftermath.

A small bounded flow notation is appropriate inside an occasion. Arbitrary host callbacks are not. `Fates`,
`Sequence`, `Together` and performance roles should first be tested as aspects of this protocol rather than four
unrelated grammar additions.

### 3.5 Action specialization and refusal are incomplete

Ordinary local exceptions often need a new action, observation and flags. An `Action` cannot currently give an
authorial withheld reason as a `Change` can (AU-31), and its phases are less explicit than mature IF action systems.

**Mitigation: retain an action protocol with named phases:** eligibility, refusal, cost/preparation, execution,
effects and report. Do not automatically perform preparation where taking time, ownership or danger is a meaningful
choice. Permit reusable preconditions to explain or offer a preparatory act.

This work should build on authoritative `Doable`, not reopen presenter ownership.

### 3.6 Material affordances trail the vision

The corpus is stronger at bespoke social state machines than at compositional interaction with rope, water, fire,
containers, fastenings and tools. `Thing`, `State` and `Change` mostly express anticipated transitions.

**Mitigation: a typed affordance library, after semantic retention.** Begin with one narrow family, such as tools
acting on fastenings and obstructions. Kinds grant capabilities; world properties admit operations; actions derive
from their conjunction. A new tool or fastening should participate without bespoke TypeScript or an object-specific
action.

This is library work over Kyr's relations and actions, with compiler support only where inspection or type checking
requires it. It should not become a general physics engine.

### 3.7 Kyr, Westernesse and Kyrie are not cleanly separable

A tiny world still imports platform catalogs, Deem, creature grounding and the Imbar canon. Engine-owned vocabulary
is partly held by hard-coded names. This obscures what the language is and raises the cost of every test and external
use.

**Mitigation: four explicit strata.**

1. **Kyr Core:** entities, relations, measures, queries, actions, changes, goals, modules and deterministic values.
2. **Kyr Worlds:** places, passages, people, perception, knowledge, conversation, commitments, occasions and
   undertakings as a versioned IF standard library.
3. **Kyrie/Westernesse packages:** the Imbar canon, company model, planning, Orsino, catalogs, presentation policy and
   generated-country composition.
4. **Studio:** product assembly, generator bindings, build targets, verification and compatibility policy.

Core should not know `party`, `at`, `knows`, combat, Imbar, Orsino or Deem. Those are supplied by declared preludes or
capability packages.

### 3.8 Deem communicates through a costly and weakly typed boundary

Deem can fill declared slots and TypeScript-owned `.kyrt` templates can emit unbounded generated Kyr. Generated text
is parsed again; generator provenance is reconstructed later; a module cannot naturally declare a generator for new
instances or local variation. AU-34, AU-40 and KX-04 are one boundary problem.

**Mitigation: a shared typed declaration IR.** Human Kyr parses into it. Deem may construct it directly through
validated `Place`, `Person`, `Item`, `Kind`, `Fact` and `Situation` constructors. Generated Kyr text remains an
explanation and serialization, not the only interchange.

Kyr should also be able to declare a generation site with constraints, identity scope and a Deem generator. Shared
schemas should drive compiler validation, Deem output validation, catalog types, editor completion and generated host
bindings.

The first slice should be small: module-local generated item instances or local conversational variation. Do not
replace the country generator wholesale.

### 3.9 The teaching corpus proves syntax rather than advantage

Small examples are schematic; large adventures obscure their ideas with lifecycle machinery. An independent author
cannot yet point to a compact work and understand why Kyr is the right language for it.

**Mitigation: one canonical exemplary work after `Undertaking` lands.** In 150–250 lines it should contain a timed
matter, independent actors, discoverable evidence, several interventions, an NPC resolution if ignored, a lasting
return consequence and one Deem variation. Documentation should show authored source, retained semantic outline,
lowered Core and a causal trace.

## 4. Recommended product and language architecture

### 4.1 Kyr Core

Core is a small typed relational transition calculus. Its public artifact is a compiled module plus semantic/source
map. It can be embedded without Westernesse and can run a tiny program without a catalog or generated party.

Required boundary work:

- inject catalog-dependent validation into the compiler;
- make Deem parsing lazy or external to Core;
- move generic grounding behind an interface;
- replace hard-coded engine vocabulary with a declared prelude;
- permit `SingleModule` without canon, company or shared Westernesse rules;
- generate typed host bindings from imports and exports.

### 4.2 Kyr Worlds

This is the author-facing IF library and retained semantic layer. Some forms may remain compiler syntax, but their
meaning and extension contract belong here. Version it independently from Westernesse data.

Its initial packages should be:

- `World.Place` and movement;
- `World.Time` and scheduling;
- `World.Person` and presence;
- `World.Knowledge` and perception;
- `World.Action` and affordances;
- `World.Conversation`;
- `World.Commitment`;
- `World.Occasion` and `World.Undertaking`.

### 4.3 Kyrie and Westernesse

Kyrie hosts campaigns, planning, persistence, replay and projections. Westernesse supplies its canon, world rules,
catalogs and generation. Orsino is a package integrated through declared mechanical contracts rather than a property
of Kyr itself.

### 4.4 Studio language

A higher-level command language is useful, but should be a sibling assembly language rather than an unrestricted
superset mixed into adventures. It should declare:

- preludes and package versions;
- schemas and catalogs;
- Deem generator bindings;
- campaign and situation installation;
- projection policy;
- build targets;
- compatibility promises;
- proving worlds and journeys;
- generated TypeScript/API bindings.

Its first version can be a typed manifest with a compiler, not a new free-form grammar. Design it only after the Core
and package boundaries exist; otherwise it will encode the present coupling.

## 5. Prioritized feature list

Priority is based on leverage over the corpus, dependency order, compatibility risk and the active acceptance plan.
P0 here means first in the language program, not ahead of Mission 22's game P0s.

| Priority | Feature | Why now | Proving slice | Compatibility |
|---|---|---|---|---|
| **L0** | Retained semantic/source map for all existing high-level forms | Prerequisite for better inspection, replay, lint and future forms; prevents further semantic loss | `Route`, `Promise`, `Occasion` explained in authored terms | No world movement; serialized compiler artifact may change |
| **L0** | Bounded Core runner and declared prelude | Establishes language/platform boundary; makes tiny tests and external use credible | Existing kernel prototype plus one action, watch and inspect | No existing campaign movement; import/build changes |
| **L0** | Semantic compatibility ids and compiler golden corpus | Makes later lowering changes safe | Existing parse store and compatibility harness compare semantic declarations | Tooling only at first |
| **L1** | `Undertaking` retained process protocol | Removes the corpus's largest source of control facts and exposes dramatic structure | Warm Wall buckets/fates; one older large process | Potentially world-moving; require lowering equivalence first |
| **L1** | Mature `Occasion`: beats, cast, interruption, ordered closure | Unifies AU-24/25/29/41/42 instead of adding fragments | Ninth Voice sequence and Warm Wall hatch | Lower to equivalent rules before adopting new behavior |
| **L1** | Dramatic projection from undertaking/occasion | Addresses flat legal-choice surfaces while preserving authority | Same rows on page, runner and terminal, grouped by matter | Presentation-only when ranking is unchanged; otherwise classify |
| **L1** | Action refusal and reusable precondition protocol | Makes local specialization intelligible; closes AU-31 | One crossing with a missing participant/tool and a useful refusal | Additive presentation; action ids stable |
| **L1** | Typed Deem declaration constructors and provenance | Connects generated and authored content without reparsing as the only bridge | Module-local generated items or speech variation | Additive; generated output compared structurally |
| **L2** | Declared generation sites and instance creation | Resolves KX-04 F3/F6 and AU-40 | A module creates a seed-stable variable number of local items | World-moving; keyed identities required first |
| **L2** | Versioned Kyr Worlds packages and generated host bindings | Turns implicit standard rules into an extension contract | Extract one package without changing a pinned world | Large structural change; semantic compatibility required |
| **L2** | Typed material affordance family | Advances the vision beyond bespoke actions | Two tools × two fastening kinds, no pair-specific code | New possibilities are additive but can alter offered rows |
| **L2** | Studio/product assembly manifest | Separates language, platform and product configuration | Assemble tiny world and Westernesse from explicit packages | Build/packaging first; no world movement |
| **L3** | Canonical exemplary Kyr work and rewritten authoring trail | Makes maturity visible and teaches patterns | 150–250-line complete work with causal trace | Documentation and fixture |
| **L3** | Broader social schemas: offices, duties, institutions, agreements | Builds on retained commitments and current office facts | One office succession and one agreement | World-moving where installed |

Features deliberately not prioritized:

- unrestricted macros or arbitrary TypeScript callbacks;
- a second quest or scene interpreter;
- global `shared` vocabulary by name;
- general inheritance for kinds;
- a comprehensive physics simulation;
- large syntax additions without a corpus rewrite and inspection story.

## 6. Delivery sequence and stop rules

### Phase A: retain and bound

1. Define the semantic record and source-map schema.
2. Populate it for existing `Route`, `Promise` and `Occasion` lowering.
3. Teach `inspect`, dependents and compatibility snapshots to use it.
4. Turn the kernel prototype into a supported Core runner.
5. Move engine-owned names into a declared prelude.

**Exit:** a tiny setting-free module runs and is inspected; three existing high-level forms explain themselves without
generated ids; every existing Kyr file parses identically.

### Phase B: prove one fictional process

1. Specify `Undertaking` from two corpus machines.
2. Lower it into current rules without moving either journey.
3. Retain its phases, participants and intervention mapping.
4. Project its current matter through authoritative `Doable`.
5. Replace the old hand-built protocol only after equivalence and cold review.

**Exit:** materially fewer control relations and rules, the same world history, better causal inspection, and a source
an author can understand without executing predicates mentally.

### Phase C: complete the bounded dramatic layer

1. Extend `Occasion` with beats, roles, interruption and ordered closure.
2. Add action refusal/precondition semantics.
3. Rewrite the Ninth Voice and Warm Wall proving slices.
4. Produce the canonical example and update the authoring trail.

### Phase D: join generation and packages

1. Define typed declaration constructors shared by parser and Deem.
2. Add provenance and keyed identity.
3. Prove module-local generation.
4. Extract the first versioned Kyr Worlds package.
5. Introduce an explicit Studio assembly manifest.

At every phase:

- one real Westernesse slice and one construction invariant are required;
- world-moving adoption waits on compatibility classification;
- no feature is complete at grammar production alone;
- the old spelling remains until the corpus migration is measured;
- no migration should rewrite prose while it is proving semantics;
- and a new declaration must be inspectable in its own terms before broad adoption.

## 7. Impact on existing maturity workstreams

This program should absorb and reorder existing work, not create a second register. Mission 22 acceptance and its
P0s remain ahead of it. Language work begins in the maturity slot and becomes a Mission 23 program after Phase A's
small, non-world-moving slices.

### 7.1 Mission 22 acceptance and Sprint 3

**No change of priority.** S3-P's per-act target, the replaying proofs, deployed browser checks and the remaining
false-promise repairs remain first. The language diagnosis explains why the authored skeletons are being preserved
while prose approval is deferred, but it does not justify pausing acceptance work for a new language system.

Immediate benefit from Phase A is limited and safe: richer semantic ids can make replay and promise-corpus findings
less dependent on generated implementation names. Do not put `Undertaking` into the golden route during Sprint 3.

### 7.2 The maturity track (MT)

Keep the track's four rules: subordinate to play, one proving slice and invariant, compile into the current engine,
and classify world movement. Amend “compile into what is there” to require **semantic retention** as well as lowering.

Existing steps map as follows:

| Existing work | Effect of this report |
|---|---|
| MT-01 authoritative presentation | Foundation for dramatic projection; do not reopen ownership |
| MT-02 semantic lint | Consume semantic records; prefer process-level findings to lexical flag inference |
| MT-03 / KX-03 typed exports | Foundation for package contracts and shared schemas |
| MT-04 `why` and dependents | First consumer of retained identities; extend rather than replace |
| MT-05 routes and counted conversation | Treat as evidence for retained lowering; retrofit `Route` semantic maps |
| MT-06 compatibility harness | Add semantic declaration ids before process rewrites |
| MT-07 social facts | Proceed with additive office facts; broader institutions wait for retained social schemas |
| MT-08 declarative placement | Remains M23 and world-moving; later consume typed generation provenance |

Add one Phase A track step, small and non-world-moving: **MT semantic retention**, covering `Route`, `Promise` and
`Occasion`, `inspect` output and semantic compatibility snapshots. Do not add the whole language roadmap to M22.

### 7.3 Kyr expressivity (KX)

KX-01 and KX-03 proved that new kinds and explicit typed vocabulary can cross modules. Preserve their decision
against implicit `shared` names.

Reframe KX-04 into three ordered rows:

1. **KX-Core:** inject platform dependencies and prove the setting-free runner.
2. **KX-Generate:** typed Deem constructors and module-local instance generation.
3. **KX-Packages:** new kind categories and behavior supplied by package schemas rather than TypeScript switches.

KX-02's nondeterministic Deem lookup remains an immediate defect because typed generation cannot be built on an
unkeyed operation.

### 7.4 Authorability (AU)

Continue the small M22 tooling and documentation fixes: AU-35, AU-36, AU-37, AU-38, AU-39 and AU-43 are inexpensive
protections for present authors.

Consolidate the M23 language rows rather than implementing each literally:

| Rows | Consolidated work |
|---|---|
| AU-24, AU-25, AU-29, AU-41, AU-42 | retained `Occasion` / scene protocol |
| AU-31 | retained action refusal and precondition protocol |
| AU-33 | package and third-party module boundary plus Studio placement |
| AU-34, AU-40 | Kyr-declared typed Deem generation sites |

AU-44 remains content work. Rewrite its thin material only after the relevant construct lands; do not use content
revision as the mechanism test.

### 7.5 Performance and architecture

The Core boundary supports current performance work rather than competing with it:

- compiler catalog injection and lazy Deem reduce imports;
- typed generated IR avoids reparsing generated text as the only path;
- smaller package graphs make tiny tests genuinely small;
- semantic ids allow lowerings to change without textual replay churn.

Do not combine the Core extraction with per-turn optimization in one change. Preserve the existing performance
baselines and prove identical world hashes first.

### 7.6 Deem and generation

Do not replace `.kyrt` or country generation at once. First establish constructors and provenance for one local
generator. Deem remains the selector and variation language; Kyr remains the language of world meaning. Their shared
boundary is a typed declaration model, not a merger of grammars.

The generation work should adopt MT-14's keyed-draw requirement before it creates variable numbers of entities.

### 7.7 Open register and mission planning

The register should remain the sole ledger. The recommended bookkeeping change is:

- one M22/Phase A row for semantic retention over existing forms;
- three KX-04 successor rows as described above;
- one M23 `Undertaking` row that subsumes process-machine authorability;
- one M23 `Occasion` row consolidating AU-24/25/29/41/42;
- one M23 action-protocol row for AU-31;
- links from the existing AU rows to their owning consolidated row, without deleting their evidence.

Mission 23 should sequence retain-and-bound before new expressive forms. A feature count is not maturity; maturity is
the full path from declaration through retention, composition, inspection, projection, documentation and corpus use.

## 8. Risks and countermeasures

### A high-level plot engine replaces systemic play

Keep undertakings porous, compile to ordinary facts and actions, and require that unanticipated legal acts can affect
their declared conditions.

### Semantic metadata becomes a second mutable truth

Treat it as immutable compiler output. Runtime state remains facts and measures; metadata describes ownership and
meaning, never current truth.

### The grammar grows faster than understanding

Require two existing corpus reproductions for a new major form and reject syntax whose only proof is a toy example.

### Platform extraction destabilizes the game

Extract dependency injection and declared preludes before moving files or changing behavior. Compare compiled modules,
world hashes, rows, saves and replays at each boundary.

### A Studio language becomes another general-purpose language

Keep it declarative and closed over packages, generators, builds and verification. It should not express adventure
logic or arbitrary runtime callbacks.

### Deem and Kyr duplicate each other

Maintain the division: Deem chooses and varies; Kyr declarations state what selected things mean. Share schemas,
identity and provenance, not control-flow syntax.

## 9. Measures of success

The language program is working when all of these are true:

- a setting-free Kyr module starts, acts, watches and inspects without Westernesse or Deem;
- a high-level declaration is explainable after lowering in its authored terms;
- one substantial process uses at least half as many private lifecycle relations and rules;
- the page, terminal and runner agree on the current dramatic matter and its legal interventions;
- a module generates typed, seed-stable instances through Deem without a TypeScript template import;
- a new kind and its vocabulary ship as a package with generated host bindings;
- a canonical 150–250-line work demonstrates time, autonomy, evidence, intervention, return and generation;
- and an independent author can complete, inspect, verify and place it without learning implementation naming rules.

The most important qualitative measure is simpler: reading the source should reveal the fictional design before it
reveals the machinery that implements it.

## Recommendation

Finish Mission 22's acceptance and performance obligations. In the maturity slot, add semantic retention for the
high-level forms already present and establish the setting-free Core boundary. Make those the prerequisites for
Mission 23 language work.

Then build one retained `Undertaking`, mature `Occasion` around the authorability evidence already collected, and
prove both by replacing hand-built process machinery without moving the story. Only after that should Kyr and Deem
share typed declaration constructors and the platform split into versioned packages and a Studio assembly layer.

Kyr does not chiefly need more expressive power. It needs its existing meanings to survive, compose and explain
themselves. Once that is true, the language can grow without making every new convenience another invisible machine.
