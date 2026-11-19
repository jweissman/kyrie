# World interaction and platform evolution study

**Date:** 18 November 2026  
**Method:** independent, source-grounded architectural investigation  
**Scope:** Kyr, Deem, the Kyrie runtime, world assembly, reusable domain rules, authoring tools, and Westernesse content

This study asks how Kyr and its surrounding systems should evolve to support independently authored worlds in which
substances, bodies, objects, environments, institutions, knowledge, and supernatural phenomena interact coherently.
It begins from the existing implementation and recommends an evolutionary path. It does not propose a migration or
authorize a language implementation.

No source, data, register, language, or active mission document was changed during the investigation. The only later
change was the addition of this report.

Labels used below:

- **Observed** — directly established from source, tests, or maintained architecture documents.
- **Inferred** — an architectural cause or consequence supported by several observations.
- **Proposed** — a candidate design, not an implemented facility.
- **Confidence** — confidence in the finding or recommendation, not a claim that proposed syntax is settled.

## Executive assessment

Kyr is mature enough to become a setting-independent platform, but not yet mature enough for a large `packages/`
extraction or a general transformation ontology.

Its strongest foundations are already correct:

- one authoritative, immutable world-state model;
- transactional creature bodies;
- deterministic generation keyed by stable identities;
- replay and save restoration;
- read-only player observation;
- one compiled action semantics;
- additive assembly commitments with provenance;
- bounded, explainable scenario placement.

The central obstacle is not insufficient generality in the kernel. It is that adjacent systems do not yet communicate
through a sufficiently rich common vocabulary:

1. Assembly can query geography and a small commitment vocabulary, but not most people, institutions, ownership,
   materials, or authored world facts.
2. Kyr can represent arbitrary predicates and effects, but reusable domain concepts—materials, bodies, offices,
   communication, and transformation—are mostly conventions or catalog-specific machinery.
3. Physical state, creature state, epistemic state, and presentation are sound individually but lack explicit,
   reusable bridges.
4. Westernesse assumptions still enter nominally generic creation, catalogs, checks, time, light, currency, and shared
   rules.
5. Authoring diagnostics exist, but their evidence is fragmented across compiler errors, `inspect`, placement traces,
   tests, and source files.

The recommended direction is therefore:

> Preserve the existing kernel and runtime. Introduce a small shared semantic substrate for identity, embodiment,
> composition, capabilities, transformation, and provenance; widen assembly's read-only view of world facts; and
> prove portability with independent worlds before physically extracting packages.

**Overall confidence: high.** The architecture and tests strongly support the diagnosis. The precise surface syntax
of new capabilities remains speculative.

## 1. Evidence and present architecture

### 1.1 Sources reviewed

The investigation began with the maintained architecture map and historical design intent:

- [the architecture map](../README.md);
- [the October composition account](../../history/architecture-2026-10/composition.md);
- [the Kyr/Deem authoring requests](../../history/activation/kyr-deem-requests.md);
- [the capability audit](../capability-audit.md);
- [the M22 world orientation](../mission-22/world/orientation.md);
- [the M22 boundary probe](../mission-22/boundary/report.md);
- [the platform maturity study](platform-maturity-study-2026-11-18.md);
- the language grammar, parser, compiler, query solver, runtime, module assembly, composition ledger and binder;
- current rule modules, authored examples, and focused semantic tests.

The October documents remain valuable statements of intent but are historical. Claims from them were checked against
current source, as the maintained architecture map requires.

### 1.2 Division of responsibility in practice

| Component | Present responsibility | Assessment |
|---|---|---|
| **Deem** | Seeded selection among authored alternatives, using tables and context | Reusable and appropriately limited |
| **Kyr** | Declarations, facts, queries, observations, actions, effects, events, objectives, conversations, and pursuits | Strong reusable semantic kernel |
| **Kyrie runtime** | Authoritative world, time, legal actions, actor planning, bodies, combat, installation, history, and persistence | Most mature layer |
| **World assembler** | Generates regions, binds scenario roles, realizes placement, installs modules, and records commitments | Strong geographically; semantically narrow |
| **RPG/domain rules** | Bodies, inventories, checks, combat, needs, knowledge, trade, and crafting | Useful but partly Orsino/Westernesse-shaped |
| **Presentation** | Player-safe observation, choices, narration, maps, and indicators | Substantial, but not yet a completely authoritative public API |
| **Westernesse product** | Imbar, calendars, catalogs, generation tables, prose, visual policy, and adventures | Rich setting and product layer |
| **Tooling** | Lint, validation, inspection, traces, replay, journeys, audits, and regression tests | Strong foundation; fragmented semantic navigation |

**Observed.** This division is substantially real. A command enters `PlaySession`, changes `Campaign`, is projected
through `PlayerView` and `ScreenModel`, and is rendered by clients
([architecture map](../README.md#from-a-command-to-the-page)).

The boundary is not perfectly enforced:

- clients and automation still derive some choice semantics separately;
- the compiler and runtime assembly import canonical catalog facilities;
- people and creation assume ancestry, calling, species, and catalog skills;
- time, light, currency, and shared rules retain product assumptions;
- `src/world` is Westernesse's country generator, not a generic world-assembly kernel;
- generated-world TypeScript sometimes makes choices authors cannot express through public declarations.

### 1.3 Invariants to preserve

The valuable invariants are explicit in [the architecture map](../README.md#invariants-worth-defending) and current
construction boundaries:

- **One world, many views.** `Campaign` owns authoritative state; presentation and planning read projections.
- **Bodies belong to the creature store.** Rules read projected body facts and cannot write them directly.
- **Engine-owned facts are protected.** Modules cannot write clock, projection, record, or creature capability facts.
- **One mechanical meaning.** Typed effects drive both execution and explanation.
- **Identity-keyed randomness.** Adding an unrelated thing does not change another entity's draw.
- **Selecting is not committing.** Presented actions do not mutate the world until chosen.
- **Install and save boundaries are disciplined.** Modules install at command boundaries; creature leases commit all
  or none.

These are not impediments to more sophisticated worlds. They are the conditions under which richer interactions can
remain deterministic, replayable, and explainable.

**Recommendation: do not replace these mechanisms to obtain a tidier package structure. Confidence: high.**

### 1.4 The reusable core is real, but incomplete

`World` is immutable in operation: applying changes produces a forked world, while relations and measures are indexed
for read-only access (`src/lang/world.ts`). Its solver handles existential variables, conjunction, disjunction,
negation, named queries, and stable binding order. `QueryModes` establishes which predicate arguments bind or must
already be known (`src/lang/query-modes.ts`). This is a genuine general query kernel.

Kyr's grammar already covers places, passages, people, items, object states and changes, observations, discoveries,
events, rules, objectives, promises, occasions, conversations, actions, and pursuits (`src/lang/Kyr.ohm`). Higher-level
facilities should compile into these constructs rather than add a second execution language.

The Tethys boundary probe demonstrates both portability and leakage. A canonless science-fiction world uses ordinary
Kyr places, passages, checks, knowledge, actions, travel, reporting, and trade. Its test proves that it runs without
Imbar (`test/small/boundary-tethys.test.ts`). It nevertheless uses catalog character assumptions, a catalog skill, and
the measure called `gold` ([boundary report](../mission-22/boundary/report.md#3-verified-leaks)).

**Finding: a reusable platform already exists inside the repository, but its dependency boundary is not yet explicit
enough to move safely. Confidence: high.**

## 2. Substance, identity, state, and transformation

### 2.1 Existing distinctions

Kyr and Kyrie already distinguish several important dimensions, though they do not present them as one ontology:

- **Numerical identity:** stable entity IDs, namespaced per installation.
- **Kind:** Kyr kinds, entity types, item kinds, local species, and canonical catalog families.
- **Spatial presence:** `at`, `inside`, containment, places, passages, and plane membership.
- **Ownership and custody:** `ownedItem`, `owns`, `keeps`, `wearing`, and `inside`.
- **Creature embodiment:** species or device chassis and mutable records in `CreatureStore`.
- **Temporary bodily conditions:** catalog conditions with lifetimes and modifiers.
- **Knowledge:** `knows`, discoveries, sources, denials, observations, and inferred facts.
- **Agency:** actors, groups, actions, pursuits, and planners.
- **Object states:** `Thing` states and `Change` declarations.
- **Creation and consumption:** generic effects plus domain rules for crafting and item use.
- **Capabilities:** catalog traits, abilities, equipment, and projected `capable` facts.

These facilities already compose into meaningful chains. The alchemist proving case combines item kinds, possession,
experimentation, knowledge, recipes, consumption, and creation without a bespoke runtime. The test proves that a
secret recipe is initially unavailable, can be learned through experimentation, and then produces an owned antidote
(`test/small/alchemist.test.ts`, `data/rules/making.kyr`).

Knowledge also supports source-sensitive progression: a wonder can teach two fragments whose conjunction permits a
further inference, while a company that never encounters it learns nothing (`test/small/wonder-fragment.test.ts`).

### 2.2 Missing shared semantics

There is no general account of:

- what an object is materially composed of;
- quantities of material inside containers;
- contact, wetness, saturation, coating, temperature, or exposure;
- parts that remain identifiable through assembly and disassembly;
- body plans, organs, faculties, and capability derivation;
- identity continuity through replacement of body or form;
- provenance across division, combination, destruction, and creation;
- transformations that systematically propagate physical, biological, magical, social, and epistemic effects.

These can all be modeled locally with arbitrary relations and rules. That is not the same as independent libraries
being able to interoperate. A vessel system, weather system, enchantment, animal body, and perception system cannot
currently recognize one another's implications without a shared authored chain.

Consider an enchanted vessel left in a forest. Rain fills it. An animal drinks. A person observes the animal and
draws a conclusion.

Today an author can declare a vessel, an animal, the person, custom `filled`, `enchanted`, `drank`, and `knows` facts,
and events or actions that transfer them. What the runtime cannot infer is the chain from more general statements:

- the vessel contains a quantity of water;
- contact with the vessel imparts a property to that water;
- drinking transfers applicable properties to the animal;
- the property changes something perceptible;
- a witness receives evidence, not automatically infallible truth.

Every new vessel, liquid, property, or recipient therefore tends toward parallel scripting or TypeScript support.

**Observed gap: shared transformation semantics, not raw predicate expressiveness. Confidence: high.**

### 2.3 A minimal optional model

The platform should not adopt a universal ontology. A small optional simulation library should establish six
separable concepts.

#### Identity

Stable entity identity survives ordinary state changes. Duplication creates a new identity with explicit lineage,
not an alias.

Illustrative relations, not settled syntax:

```kyr
Relation derivedFrom(entity, entity).
Relation resembles(entity, entity).
Relation remembers(entity, fact).
```

Identity should not be inferred from name, appearance, memories, body, or origin.

#### Embodiment

Agency and identity are not equivalent to a material body:

```kyr
Relation embodiedBy(agent, body).
Relation controls(agent, body).
Relation manifestsAt(agent, place).
```

Ordinary-person authoring sugar may still create an agent and body together. The underlying semantics should permit
them to diverge.

#### Composition

Use distinct relationships rather than a vague universal `partOf`:

```kyr
Relation componentOf(entity, assembly).
Relation madeOf(entity, substance).
Relation contains(container, entity).
Relation portionOf(entity, substance).
```

`contains` is spatial or custodial. `componentOf` contributes to an assembly. `madeOf` characterizes constitution.
The distinctions matter when a gem is removed from a crown, water is poured from a cup, or a body loses a limb.

#### State and condition

Keep these categories distinct:

- durable properties, such as material or enchantment;
- transient environmental states, such as wet, heated, or filled;
- bodily conditions kept transactionally by the creature store;
- acquired capabilities derived from body, equipment, condition, knowledge, or grant.

The categories may share authoring tools without sharing ownership or lifetime rules.

#### Faculties and capabilities

Model organs only where the fiction or mechanics care about them. Prefer capability derivation from traits:

```kyr
Relation affords(entity, capability).
Relation dependsOn(capability, component).
```

A quadruped template might grant locomotion and natural attacks without requiring a cellular anatomy model. Losing a
relevant component can remove a faculty because a declared dependency exists, not because all bodies are simulated at
the same resolution.

#### Transformations

A reusable transformation should declare:

- inputs and participants;
- identity policy: preserve, create, destroy, divide, or combine;
- fact transfers;
- generated or removed entities;
- source provenance;
- ordinary Kyr preconditions and effects.

Begin as a domain library plus the smallest required runtime effects. Do not introduce a second rule engine.

**Confidence: high on the distinctions; medium on the proposed vocabulary; low on exact syntax.**

### 2.4 Supernatural proving cases

The difficult cases do not require one miscellaneous `magic` primitive.

#### Ghost

A ghost is an agent retaining memory, intention, knowledge, and actions without an ordinary `embodiedBy` relation.
It may have a nonmaterial manifestation or perceiver-specific appearance. It need not be physically `at` every place
where it can be perceived.

#### Duplicate

A duplicate is a new identity with `derivedFrom` lineage and selected copied memories, appearance, capabilities, or
relationships. Subsequent history is independent. Shared origin is not shared numerical identity.

#### Telepathy

Telepathy is a communication channel that transfers a proposition, image, or experience subject to faculties,
capabilities, resistance, and provenance. It does not require spatial co-presence or audible speech.

#### Vision or apparition

A vision is perceptual content anchored to a perceiver or source without asserting physical `at`. Its source can be
truthful, mistaken, deceptive, or merely symbolic.

#### Transformation

An identity-preserving transformation may replace `embodiedBy`, material, form, or capabilities. A destructive
transformation instead creates successors with declared lineage. The author chooses which continuity matters.

#### Animated or intelligent object

A book or statue can acquire an agent or controller and perceptual or action faculties while remaining materially an
object. A playable viewpoint follows from agency and a player projection, not from humanoid species.

The crucial invariant is:

> `at`, perceptible-to, known-by, embodied-by, controlled-by, and numerically-identical-to remain different
> relations.

**Confidence: high.** Existing knowledge, observation, actor, place, and body boundaries support these distinctions;
the missing work is making them stable author-facing capabilities.

## 3. Settings, adventures, and semantic compatibility

### 3.1 The present data organization

The current `data/` structure already distinguishes catalogs, rules, Imbar, campaigns, reusable situations,
scenarios, kits, generation, and assembly ([data README](../../../data/README.md)). A module declares content and
roles; a campaign or assembler decides where it is installed.

This is a useful foundation. The problem is semantic overlap, not primarily folder names:

- `data/imbar` mixes setting canon with defaults historically installed everywhere;
- `data/rules` mixes reusable rules with canon-shaped assumptions;
- scenarios and kits express overlapping placement concerns through different vocabularies;
- `data/adventures` can mean a self-contained authored geography, a dramatic situation, or a product campaign;
- generated countries know terrain better than they know institutions, resources, history, or law.

Moving existing directories without clarifying these contracts would not improve authorability.

### 3.2 Proposed setting responsibility

A setting manifest should declare:

- laws and optional capability libraries;
- cosmology and spatial roots;
- kinds, substances, peoples, languages, and institutions;
- calendars, currencies, and environmental policies;
- generation vocabularies and permitted constructors;
- semantic capabilities it provides to adventures.

These declarations need not all be global. A setting may provide several cultural or regional realizations of the
same interface.

### 3.3 Proposed adventure responsibility

An adventure manifest should declare:

- dramatic roles;
- structural and institutional requirements;
- participant constraints;
- required capability libraries;
- consequences and exports;
- optional variants;
- which missing structures the assembler is permitted to create.

Compatibility should be capability-based, with optional named-setting restrictions:

```json
{
  "requires": [
    "institution.recognized-authority@1",
    "social.competing-claims@1",
    "knowledge.located-evidence@1"
  ],
  "settings": {
    "tested": ["westernesse"],
    "exclusive": false
  }
}
```

Capability names must refer to validated semantics, not cosmetic tags. A setting satisfies
`recognized-authority` only if it provides an office or institution model with the jurisdiction, grants, or remedy
interface the scenario consumes.

An adventure can then require a dispute adjudicated by recognized authority without assuming a reeve, judge, crown,
guild, or modern court. The setting determines what a valid claim means and which remedies are culturally available.

**Confidence: medium-high.** Typed roles and export classifications have direct evidence; versioned capability names
need a bounded prototype before becoming manifest policy.

## 4. Construction, runtime, and perception queries

### 4.1 Three authorities

Construction, runtime, and perception queries should not become one unrestricted facility.

| Query kind | Reads | May commit? | Authority |
|---|---|---:|---|
| **Construction query** | Assembly ledger plus approved projections from generated modules | Through assembler only | Composer |
| **Runtime query** | Authoritative running `World` | No | Runtime and tooling |
| **Perception query** | Runtime truth filtered through one being's faculties, position, sources, and knowledge | No | Perception/player projection |

Kyr's existing `World.solve` is suitable as the common predicate evaluator. The three operations differ by accessible
facts and authority, not necessarily by query language.

This distinction preserves several invariants:

- a construction query cannot silently mutate a running world;
- a runtime inspection cannot disclose omniscient truth through a player view;
- perception cannot assert physical presence merely because something appears;
- a query result does not become a commitment until the assembler records it.

### 4.2 Extend composition rather than duplicate it

The existing composition system already provides:

- ordered slots;
- hard requirements and weighted preferences;
- Deem proposals;
- implications that add dependent slots;
- deterministic tie-breaking;
- bounded backtracking;
- additive commitments;
- provenance and explanation traces;
- late introduction into a running campaign.

The ledger is itself backed by a Kyr `World` and exposes `test` and `solve`
(`src/world/compose/ledger.ts`). Conflicting measures are rejected. The binder evaluates candidates against hard
requirements and preferences with a fixed search budget (`src/world/compose/binder.ts`).

`test/composition.test.ts` proves:

- author-fixed roles and open roles use the same mechanism;
- broken hard requirements fail with a named reason;
- open binding is deterministic for a seed;
- kits can consume facts established by earlier kits;
- a kit can be introduced during play without moving existing entities or taking prior placements.

A general deferred-query facility should therefore be an extension of composition, not a new recursive generator.

**Confidence: high.**

### 4.3 Typed deferred requests

A request should declare:

- request ID and source;
- assembly phase;
- typed inputs and outputs;
- read predicate;
- hard constraints and preferences;
- whether it may allocate or generate;
- deterministic random identity;
- maximum attempts or search budget;
- facts it commits if resolved;
- optionality and failure policy.

A staged process should distinguish:

1. foundational setting and spatial structure;
2. generated geography and population;
3. monotonic derived facts;
4. role binding against existing entities;
5. permitted generation of missing structures;
6. validation and final commitment;
7. Kyr module installation;
8. ordinary runtime execution.

### 4.4 Fixed points and generative choice

Monotonic derivation may run toward a bounded fixed point because it only adds facts implied by established facts.
Generative requests must not participate in an unrestricted fixed point. They allocate resources, create identities,
and can exclude later choices.

Generative work should therefore use declared phase and dependency order, bounded search, and explicit commit points.
It must not reconsider an earlier commitment unless a bounded transaction has not yet committed.

Cycles should be diagnosed as one of:

- a derivation cycle that adds no facts;
- mutually required unresolved outputs;
- a generative dependency cycle;
- a contradiction with a prior commitment;
- exhaustion of a declared search budget.

Some requirements may deliberately remain dormant until a later world event. Those are runtime conditions or future
installation triggers, not unresolved initial assembly work.

Incremental installation after play begins should reuse `Composition.introduce`'s existing guarantee: prior
commitments and world facts remain stable. New requests must receive stable identities derived from campaign,
installation, request, and candidate identities so replay and saves do not depend on incidental evaluation order.

### 4.5 Worked adaptable scenario

An adventure requires:

- a settlement with recognized authority;
- two people with incompatible claims to one possession;
- a reachable site containing relevant evidence;
- people capable of acting on the dispute.

Illustrative manifest form:

```json
{
  "id": "disputed-possession",
  "requires": {
    "settlement": "settlement(?s) and hasAuthority(?s, ?office)",
    "claimantA": "resident(?a, ?s) and claims(?a, ?object)",
    "claimantB": "resident(?b, ?s) and claims(?b, ?object) and distinct(?a, ?b)",
    "evidenceSite": "accessibleFrom(?site, ?s) and evidenceAbout(?site, ?object)"
  },
  "prefers": [
    "jurisdiction(?office, ?object)",
    "knows(?witness, ?claim)"
  ],
  "provides": [
    "dispute(?object, ?a, ?b)",
    "hearingAt(?object, ?office)",
    "evidenceFor(?site, ?object)"
  ]
}
```

The assembler would:

1. query committed settlements;
2. bind an authority whose jurisdiction is meaningful in that setting;
3. bind two incompatible claims over the same possession;
4. find a reachable site with evidence;
5. score culturally appropriate combinations;
6. tie-break by request, slot, and candidate identity;
7. commit bindings and provenance;
8. install a normal Kyr module importing those roles.

In Westernesse, this might become a reeve, inherited eel-weir rights, a guild lease, and tide records. Another setting
might supply a clan council, salvage law, and a ship's log. The adventure supplies the dramatic relation; the setting
supplies what ownership, authority, evidence, and remedy mean.

When no valid binding exists:

- an optional adventure is refused with candidate-level explanations;
- a required adventure fails assembly;
- generation may create only structures the setting explicitly permits;
- the assembler must not invent a generic authority that erases the setting's institutions.

**Confidence: high that this should extend the current composer; medium on the proposed request surface.**

## 5. Higher-level capability APIs

The following candidates are grounded in repeated authoring requests, the capability audit, current low-level rules,
and the platform maturity study.

| Capability | Present problem | Correct layer | Smallest credible improvement |
|---|---|---|---|
| Moving groups and schedules | Authors spell routes as stage facts or repeated location rules | Domain library compiling to Kyr pursuits, clocks, and movement | Declarative itinerary and schedule templates |
| Perception and communication | Sight, knowledge, hearsay, source, speech, and darkness are partly specialized | Domain library plus player-safe query API | Typed sensory and communication channels with provenance |
| Material transformation | Recipes exist, but material, contact, quantity, and transfer do not compose generally | Domain library; small runtime effects only if required | Container, substance, exposure, and transformation contracts |
| Bodies and natural abilities | Catalog chassis and natural attacks work, but body plans are not author-facing | Reusable RPG/simulation library | Body templates, faculties, slots, and derived capabilities |
| Institutions and obligations | Offices, grants, jurisdiction, claims, and standing are bespoke relations | Domain library plus assembly projection | Institution/office/holder/grant interfaces |
| Scenario roles and casting | Kits bind geographic roles; people and institutions are much thinner | Assembler | Typed deferred role requests over approved world facts |
| Knowledge-aware descriptions | Evidence and source machinery exists but is not one navigable public contract | Runtime query and presentation API | Fact/source/explanation view shared by tools and clients |
| Discoverable affordances | Legal actions exist, but clients still interpret some opportunity meaning | Runtime presenter API | One authoritative action/opener/refusal projection |

### 5.1 Language feature versus library feature

Most candidates do not initially require grammar changes:

- routes, schedules, social relations, institutions, and simple transformations can be libraries over facts, queries,
  actions, rules, and pursuits;
- scenario binding belongs to assembly manifests and tooling;
- explanation and provenance belong to compiler/runtime APIs and CLI output;
- body plans belong to a reusable domain catalog or library;
- perception channels may eventually justify small language support where observations need typed delivery semantics;
- transformations may eventually justify effects for identity creation, division, or combination, but only after
  proving cases show that ordinary effects are insufficient.

The test for a language feature is not frequency alone. It should be required for validation, deterministic execution,
or semantics that libraries cannot safely express.

## 6. Setting-independent package architecture

### 6.1 One package first

Do not begin with several published packages. Begin with one internal workspace package and enforced subpath
boundaries:

```text
packages/kyr/
  language/       parser, AST, diagnostics, source locations
  kernel/         World, predicates, queries, actions, effects
  modules/        namespaces, imports/exports, installation contracts
  composition/    ledger, binder, traces, deterministic requests
  tooling/        lint/index/inspect library APIs
```

Keep outside it initially:

```text
src/domain/       actors, bodies, inventory, time, combat, knowledge
src/world/        Westernesse generation and geographic realization
src/product/      Imbar, catalogs, creation, prose and visual policy
web/              player application
```

The illustrative paths describe ownership, not an immediate directory move. One package initially avoids inventing
version boundaries before dependencies are understood. The internal areas can later become `@kyr/language`,
`@kyr/runtime`, and `@kyr/tooling` only when separate consumers and compatibility requirements justify them.

### 6.2 Legitimate and illegitimate dependencies

Legitimate dependencies include:

- runtime depending on the language's compiled model;
- domain libraries depending on kernel relations, actions, and effects;
- assemblers emitting ordinary module requests and Kyr modules;
- product code depending on domain libraries and presentation contracts;
- tooling depending on public compiler and runtime inspection APIs.

Dependencies to remove or invert include:

- compiler dependence on the global Westernesse/Orsino canon;
- generic checks depending on `Canon.skills`;
- generic creation requiring ancestry and calling;
- generic display assuming gold, coin, solar night, or Imbar months;
- core module installation always selecting Westernesse rule sets;
- assembly kernels importing Westernesse country generation.

The boundary probe's six pinned leaks provide a practical extraction checklist rather than a theoretical one.

### 6.3 Incremental extraction sequence

1. Add dependency checks without moving files.
2. Define a minimal public API around parser, compiler, `World`, queries, effects, diagnostics, and module installation.
3. Remove canonical catalog imports from the compiler through injected vocabulary and capability interfaces.
4. Parameterize currency, calendar or night, starting equipment, checks, and default shared rules.
5. Make assembly consume declared setting adapters rather than `src/world` assumptions.
6. Run Westernesse and Tethys through the same public API.
7. Create the internal workspace package with compatibility re-exports.
8. Move code mechanically only after dependency tests prove the boundary.
9. Split packages only after another independent consumer demonstrates separate versioning needs.

This sequence preserves current imports, tests, runtime behavior, and author workflows while making architectural
progress measurable.

**Confidence: high.** A large initial move would provide little benefit and obscure the product leaks that actually
prevent portability.

## 7. Authoring and tooling

### 7.1 Library API first

The compiler, query engine, composition trace, and runtime inspection should expose structured library APIs. The CLI
should be a thin user-facing wrapper around those APIs. This avoids creating separate semantics for tests, agents,
editors, and command-line tools.

An MCP service can later expose the same stable, mostly read-only operations to authoring agents. It should not begin
as an autonomous editing or world-mutating service.

### 7.2 Unified semantic inspection

Extend existing `inspect`, diagnostics, ledger provenance, and traces with:

- `why fact <fact>` — declaration or generated source, derivation, current truth, and runtime changes;
- `why action <id>` — schema, binding, requirements, failed predicates, effects, and player projection;
- `why placement <id>` — candidates, exclusions, preferences, random key, and final commitment;
- `dependents <symbol>` — imports, predicates, templates, tests, and presenters;
- `unresolved` — deferred requests, missing inputs, cycles, contradictions, and exhausted budgets;
- `trace transformation <entity>` — inputs, identity policy, outputs, transferred facts, and consequences.

### 7.3 Source and dependency graph

Build a read-only semantic index during lint or compilation:

- declarations and source locations;
- typed imports and exports;
- predicate reads and writes;
- generated commitments and their provenance;
- request inputs and outputs;
- tests and retained traces naming a capability.

Start with JSON and CLI queries. Language-server navigation, completion, and diagnostics should follow the graph
rather than precede it.

### 7.4 Compatibility harness

Pinned worlds and journeys should compare:

- public compiled module schema;
- stable command IDs and presented action rows;
- save restoration;
- replay digest;
- generation and placement commitments;
- source-version and migration requirements.

Classify changes as additive, presentation-only, world-moving, save-breaking, or replay-breaking. Package extraction
should not begin until this harness can distinguish intentional boundary changes from accidental behavior changes.

## 8. Diagnostic experiments

### 8.1 Material transformation

**Shortest correct expression today:** custom item plus custom `filled`, `enchanted`, `drank`, and `knows` relations;
events or actions transfer each state. Existing making rules can consume two item kinds to create another.

**Obstacle:** there is no common semantics for substance quantities, containment, exposure, property transfer, or a
transformation's identity policy.

**Smallest plausible improvement:** an optional container/substance library and declarative transformation records.
Prove only water in a vessel, enchantment by contact, drinking, one acquired property, and one observable consequence.

### 8.2 Supernatural identity

**Shortest correct expression today:** a `Person` or actor with a species or device body, custom visibility facts, and
custom actions; an apparition can be approximated as an observation without moving its source.

**Obstacle:** convenient authoring declarations conflate identity, body, agency, and presence, while creature
capabilities are strongly catalog-shaped.

**Smallest plausible improvement:** explicit agent, embodiment, manifestation, faculty, and controller relations,
with ordinary persons lowered into them.

### 8.3 Deferred scenario binding

**Shortest correct expression today:** a composition kit with slots over facts manually present in the assembly
vocabulary, or older scenario placement TypeScript for towns and coordinates.

**Obstacle:** assembly cannot query most people, offices, claims, ownership, evidence, or authored runtime facts.

**Smallest plausible improvement:** a whitelisted, provenance-carrying projection of selected generated facts into the
ledger, followed by typed request inputs and outputs.

### 8.4 Setting-independent execution

**Shortest correct expression today:** the Tethys fixture already executes a small non-Westernesse world through the
ordinary parser, compiler, runtime, journey, and action systems with `canon: false`.

**Obstacle:** creation, skills, equipment, currency, solar time, and shared rules retain product assumptions.

**Smallest plausible improvement:** repair the six verified boundary leaks before extracting a package.

### 8.5 Verification performed

The focused investigation ran:

```text
bun test test/composition.test.ts \
  test/small/boundary-tethys.test.ts \
  test/small/alchemist.test.ts \
  test/small/wonder-fragment.test.ts \
  test/small/state-changes.test.ts
```

Result: **21 passing tests, 0 failures**. These cover deterministic and explainable composition, kit dependencies,
late installation, canonless execution, crafting and discovery, knowledge inference, world-state changes, and action
refusal diagnostics.

## 9. Ranked roadmap

### Near-term consolidation: M23 candidates

#### 1. Unified semantic inspection and provenance

- **Problem:** authors must reconstruct causes from compiler errors, traces, runtime inspection, and source.
- **Evidence:** `Diagnostics`, `inspect`, `Ledger.about`, composition `Trace`, and action refusal explanations already
  hold complementary evidence.
- **Reuse:** existing diagnostics, traces, source locations, and query evaluator.
- **Change:** one structured explanation API and CLI family.
- **Unlocks:** explainable placement, actions, facts, and transformations; stable agent tooling.
- **Eliminates:** repeated bespoke debugging scripts and implementation archaeology.
- **Migration:** additive.
- **Risk:** low to medium; provenance retention may increase memory or build-index cost.
- **Proof:** an independent author diagnoses one failed placement and one absent action without reading runtime source.

**Confidence: high.**

#### 2. Common construction-query vocabulary

- **Problem:** scenarios cannot bind against much of the world already generated or authored.
- **Evidence:** the ledger handles geography and kit facts, while runtime Kyr holds people, ownership, professions,
  knowledge, and social facts.
- **Reuse:** `World.solve`, `Ledger`, `Binder`, commitments, traces, and keyed randomness.
- **Change:** project selected generated facts into the ledger with provenance; add typed request outputs.
- **Unlocks:** setting-adaptable casting and institution-aware situations.
- **Eliminates:** hard-coded entity IDs, town-selection TypeScript, and duplicate placement vocabularies.
- **Migration:** additive; old kits remain valid.
- **Risk:** leakage of runtime or secret facts into construction; control with explicit projection policies.
- **Proof:** bind the disputed-possession example in two differently structured settings.

**Confidence: high.**

#### 3. Boundary enforcement before package movement

- **Problem:** nominally generic code imports product catalogs and assumptions.
- **Evidence:** the Tethys probe's six pinned leaks.
- **Reuse:** canonless campaign support and the existing tiny-world harness.
- **Change:** import rules, injected vocabulary interfaces, and parameterized currency, time, checks, gear, and rules.
- **Unlocks:** genuine independent Kyr execution and tooling.
- **Eliminates:** product assumptions in core consumers.
- **Migration:** retain Westernesse as the compatibility default.
- **Risk:** accidental world, save, or presentation changes; mitigate with compatibility fixtures.
- **Proof:** run Tethys and Westernesse through the same public API without fake `gold` or catalog character types.

**Confidence: high.**

#### 4. Typed module roles, exports, and scenario requirements

- **Problem:** imports and exports identify entities but do not consistently express semantic contracts.
- **Evidence:** current module roles, module export classifications, kit role interfaces, and cross-module authoring
  failures.
- **Reuse:** namespace and installation validation.
- **Change:** classify and validate participant, place, fact, outcome, institution, resource, and capability exports.
- **Unlocks:** safer composition and clearer compatibility errors.
- **Eliminates:** convention-only interfaces and late unknown-predicate failures.
- **Risk:** overclassification or migration burden; begin with advisory lint.
- **Proof:** two independently authored modules satisfy the same scenario role contract.

**Confidence: high.**

### Focused language or engine sprints

#### 5. Perception, knowledge, and communication channels

Generalize observations by sense or communication channel while preserving source, contradiction, hearsay, inference,
and deliberate deception. Telepathy should become one channel, not a spatial exception.

**Confidence: medium-high. Risk: medium.** The main danger is disclosing omniscient truth through convenience APIs.

#### 6. Embodiment and body-capability library

Introduce body templates or traits, faculties, locomotion, equipment compatibility, natural actions, and explicit
embodiment. Keep detailed anatomy optional and prove the abstraction with a humanoid, quadruped, ghost, and animated
book.

**Confidence: medium. Risk: medium-high.** Catalog migration and combat compatibility require care.

#### 7. Institutions and changing social state

Define institutions, offices, holders, jurisdiction, grants, obligations, claims, standing, and remedies as a reusable
library visible to assembly. Begin with one Westernesse office and the disputed-possession scenario.

**Confidence: medium-high. Risk: medium.** The model must preserve cultural difference rather than normalize every
institution into a modern state office.

#### 8. Routes and schedules

Compile common itineraries and routines into existing pursuits, clocks, movement, and action schemas. This is an
authoring API over mature machinery, not a new autonomous simulation.

**Confidence: high for routes; medium for general strategic adversaries.**

### Long-range research

#### 9. Transformation protocol

Prototype identity-preserving, creating, destroying, dividing, and combining transformations with provenance and
declared transfer policies. Prove it on the enchanted vessel chain and one body transformation before adding grammar.

**Confidence: medium on value; low-medium on final design.**

#### 10. More expressive staged composition

Add typed dependency graphs and bounded monotonic derivation only after the shared assembly projection succeeds.
Preserve explicit phases and prohibit arbitrary world-mutating queries.

**Confidence: medium.**

#### 11. Independent toolchain and eventual package split

Make the library API authoritative, wrap it with the CLI, then expose stable read-only operations through an MCP
service. Add language-server facilities after the semantic source graph exists. Split packages only when independent
consumers demonstrate the need.

**Confidence: high on sequence.**

### Ideas to defer or reject

- unrestricted recursive generation;
- a universal ontology;
- full chemistry or cellular biology;
- arbitrary runtime queries that mutate world state;
- Deem-generated executable semantics;
- a large directory move before dependency inversion;
- one miscellaneous supernatural subsystem;
- autonomous editing services or a visual studio before diagnostics are coherent.

Their complexity exceeds the demonstrated authoring value, and several would weaken determinism, provenance, or
authorial control.

## 10. Final judgement

Kyr's next step is not to become maximally general. It is to make explicit a few distinctions that Westernesse already
needs:

- identity versus body;
- physical presence versus manifestation;
- world truth versus perception and knowledge;
- kind versus material;
- containment versus composition;
- state change versus identity-changing transformation;
- query versus commitment;
- setting law versus adventure requirement.

The highest-leverage investment is a common, explainable semantic bridge between authored Kyr, generated commitments,
and runtime truth. Once that bridge exists, institutions, material transformations, supernatural embodiments, and
adaptable adventures can be implemented as composable libraries over the existing kernel instead of isolated
TypeScript mechanisms.

The practical standard remains the right one:

> Can an author express more interesting, coherent, and consequential interactions with less bespoke code, while the
> platform becomes more reliable, comprehensible, and independent of the setting?

The next credible steps are unified explanations, a richer but bounded assembly projection, typed module contracts,
and repair of the verified setting leaks. General transformation semantics and package extraction should follow only
after those steps have been demonstrated through independent authoring exercises.
