# Westernesse platform maturity study

**Date:** 18 November 2026  
**Method:** independent, read-only architectural research  
**Scope:** Kyr, Deem, assembly, the Kyrie runtime, presentation and clients, Westernesse content, and authoring tools

No code, authored data, language, active M22 plan, or register item was changed for this study. The canonical issue
record remains [the open register](../open-register.md); this report groups existing evidence by architectural cause
and does not create a competing register.

## Executive conclusion

Westernesse does not need a comprehensive engine rewrite or a wholesale migration from TypeScript into Kyr.

Its strongest architecture is already the right one:

- one authoritative, immutable world;
- transactional creature state;
- identity-keyed deterministic generation;
- authored semantics compiled into legal runtime actions;
- a player-safe projection shared by several clients;
- scenario-local namespaces and catalogs;
- extensive semantic tests, visible-label journeys, and generation traces.

The recurring defects concentrate at three incomplete boundaries:

1. **The authoritative projection stops too early.** The engine determines legal actions and knowledge, but clients
   still independently reconstruct grouping, activation, highlighting, and what taking a presented row does. This
   creates several owners of one meaning.
2. **World assembly knows less than the authored and running world.** It constrains places and some strategic
   relations, but not enough about people, institutions, possessions, relationships, prior consequences, or
   qualitative spatial requirements. Authors therefore duplicate bindings, coordinates, and scenario-specific glue.
3. **Several recurring dramatic intentions have execution mechanisms but no stable author-facing capability.**
   Movement on a clock, evolving conversations, institutional authority, participant selection, and reusable
   situation outcomes are repeatedly implemented as collections of low-level rules.

Four proportionate investments address these boundaries:

1. finish the authoritative presenter and query layer;
2. enrich the existing assembly ledger and placement constraints;
3. package recurring dramatic mechanisms as small Kyr libraries and typed module contracts;
4. expose provenance, dependency, compatibility, and explanation through existing tools.

These improvements extend the current architecture. None requires extracting a universal engine.

## 1. Current architecture and maturity

### 1.1 Responsibilities in practice

| Layer | Actual responsibility | Maturity |
|---|---|---|
| **Kyr** | Declares entities, places, containment, passages, facts, observations, actions, effects, objectives, events, pursuits, conversations, milestones, and endings, then compiles them into the runtime semantic model | Strong semantic core; uneven high-level ergonomics |
| **Deem** | Makes seeded, weighted choices from authored alternatives and generated context | Mature for selection and surface variation; deliberately not an execution language |
| **World assembler** | Draws regions, realizes terrain and settlements, places scenario requirements, binds imports, installs modules, and records additive commitments | Strong for geography and place roles; thin for social and historical semantics |
| **Kyrie runtime** | Owns world truth, time, actors, legal actions, effects, bodies, combat, knowledge projection, history, installation, persistence, and replay | The most mature layer |
| **Presentation and UI model** | Converts runtime truth into player-safe choices, narration, maps, screens, and indicators | Substantial shared machinery, but not yet one fully authoritative public capability |
| **Browser, CLI, runner** | Own layout, input, transport, automation, and rendering | Portable in principle; duplicated semantic readings still cause parity defects |
| **Westernesse product** | Owns Imbar, Orsino catalogs, calendars, fantasy creation, prose, paintings, generated-country assumptions, and scenarios | Rich, but still coupled into several nominally generic paths |
| **Authoring tools** | Lint, validation, visible-label play, inspection, assembly traces, audits, replay, censuses, and regression tests | Unusually strong CLI foundation; missing integrated navigation and compatibility views |

The declared four-layer division in [the architecture map](../README.md#the-four-layers) is substantially real rather
than aspirational. A command enters `PlaySession`, changes `Campaign`, is projected through `PlayerView` and
`ScreenModel`, and is rendered by multiple clients ([architecture map](../README.md#from-a-command-to-the-page)).

The boundary is not perfectly enforced. In particular:

- the runner, terminal, autoplay, and page still derive some choice semantics separately;
- the compiler imports the Westernesse/Orsino canon vocabulary;
- character creation assumes ancestry and calling;
- shared time, currency, light, and rule modules retain product assumptions;
- generated-world TypeScript sometimes chooses prose sections or composition conventions that authors cannot
  express through public data or language interfaces.

The Tethys boundary probe demonstrates both facts: the core can run a small science-fiction campaign, while creation,
kits, night, currency, catalog skills, and canon rules still leak Westernesse assumptions
([boundary report](../mission-22/boundary/report.md#3-verified-leaks)).

### 1.2 What should not be rewritten

#### Authoritative world and creature boundaries — **high confidence**

`Campaign` installs modules at command boundaries, refreshes projections, rejects installation while executing or
while creatures are leased, and only saves between commands (`src/campaign/campaign.ts:109-177`). Creature records
and engine-projected facts have a disciplined ownership boundary. Deterministic streams and save restoration are
explicit project contracts ([CONTRACT.md](../../CONTRACT.md#3-determinism-and-persistence)).

This is a strong construction boundary. It should be extended to new public views rather than replaced.

#### Deterministic generation — **high confidence**

Regions are keyed by world cell, seed, context, and named random streams; neighbouring countries are independently
reproducible (`src/world/world-grid.ts:10-68`). This is the correct foundation for replay, compatibility checks, and
declarative placement.

#### Kyr as one execution semantics — **high confidence**

Kyr already covers much more than static content. Its grammar includes events, objectives, pursuits, conversations,
promises, occasions, effects, spatial containment, and conditional passages (`src/lang/Kyr.ohm:1-90`). Higher-level
authoring APIs should compile into these constructs rather than introduce a second interpreter.

#### Deem's limited role — **high confidence**

Deem should continue to choose compatible authored structure rather than synthesize arbitrary executable semantics.
The variety study correctly observes that this keeps consequences and player-facing prose under authorial control
([variety report](../mission-22/variety-study/report.md#4-genuine-architectural-and-authoring-limitations)).

#### Existing CLI and semantic-test approach — **high confidence**

Visible-label journeys, absent-action inspection, whole-campaign validation, deterministic traces, and tiny-world
tests are strong architectural assets. They should become the basis of better authoring queries, not be replaced by a
visual studio.

### 1.3 Maturity by dimension

| Dimension | Assessment |
|---|---|
| **Expressiveness** | High for facts, places, actions, checks, consequences, clocks, discovery, and fixed participants. Medium-low for recurring social processes, cross-module institutions, participant matching, and scenario-local placement requirements. |
| **Composability** | High inside one compiled module; medium across modules. Imports and exports work, but export meaning is untyped and assembly cannot query much of the runtime vocabulary. |
| **Correctness** | High where construction APIs exist: spatial validation, module installation, engine-owned facts, saves, creature leases, and indicator witnesses. Lower where conventions remain, particularly choice interpretation, outcome exports, and cross-client grouping. |
| **Observability** | Good but fragmented. `inspect`, diagnostics, commitment provenance, and assembly traces exist. There is no single source, dependency, and fact-explanation interface. |
| **Stability** | Strong deterministic foundation. Language, module, save, and public-presentation compatibility are protected mostly by current tests rather than explicit schema and migration policies. |
| **Ergonomics** | Good for known idioms; poor where authors must reproduce low-level stages, duplicate participants, or choose drawing coordinates. |
| **Portability** | A genuinely reusable core exists, but creation, catalogs, checks, light, time, currency, and shared rules retain Westernesse/Orsino assumptions. |

## 2. Capability map

### 2.1 Mature shared capabilities

- Immutable world facts and solver-backed predicates.
- Legal action grounding from authored preconditions.
- Time advanced through watches, including autonomous actor planning.
- Typed combat effects and transactional bodies.
- Player-safe observations, knowledge provenance, and masked names.
- Deterministic region generation, terrain, roads, settlements, and ecology.
- Module installation, local namespace isolation, and scenario imports.
- Reproducible CLI and browser journeys, replay, and persistence.
- Whole-campaign lint and compact tiny-world tests.
- Placement commitments with provenance: facts are additive and contradictions are rejected
  (`src/world/compose/ledger.ts:5-56`).
- Constraint binding with requirements, preferences, deterministic tie-breaking, bounded backtracking, and an
  explanation trace (`src/world/compose/binder.ts:11-77`, `src/world/compose/trace.ts:1-35`).

### 2.2 Partially generalized capabilities

#### Player presentation

`PlayerView` provides a rich player-safe snapshot, including stable choice IDs, knowledge sources, deadlines,
capabilities, objectives, and map topology (`src/presentation/player-view.ts:27-79`). Clients nevertheless still
interpret some rows, openers, grouping, and activation differently.

#### Spatial modelling

Containment and passage semantics are validated strongly, including cycles, parent kinds, plane transitions, and
movement modes (`src/spatial.ts:104-175`). Exact grid placement remains mixed into the `Place` declaration.

#### Scenario placement

Settlements can be selected by largest, named, near another binding, along a road, or toward a border
(`src/world/scenario-towns.ts:20-95`). Terrain, watershed, elevation, travel interval, visibility, defensibility, and
ecological suitability are not first-class scenario requirements.

#### Generated-situation composition

Kits support slots, requirements, preferences, implications, and traces. They coexist with the older scenario
placement and `.kyrt` paths rather than supplying one common placement vocabulary.

#### Bodies and natural attacks

Catalog species and typed natural weapons are reusable. Bespoke bodies and creature capabilities remain strongly
catalog-shaped, and no stable author-facing body-plan abstraction spans locomotion, equipment, and natural attacks.

#### Conversations and relationships

Topics and state predicates can express repeated encounters. The common intention “greet or answer differently on a
later meeting” is still written as bespoke facts and rules.

#### Pursuits and schedules

The runtime supports pursuits and autonomous action, but authors repeatedly spell itineraries as stage rules.

### 2.3 Bespoke or missing capabilities

- Institutions as actors with offices, holders, grants, jurisdiction, and standing.
- Typed scenario requirements and outcome contracts.
- Assembly queries over generated people, ownership, debts, loyalties, and selected prior consequences.
- Cross-country module semantics that safely consume exported local kinds and outcomes.
- Qualitative placement constraints with deterministic geometric realization.
- One authoritative client-facing model for what a row opens or does.
- A maintained language, module, presentation, save, and replay compatibility manifest.
- A navigable semantic graph across declarations, imports, generated commitments, runtime facts, tests, and
  presentation consumers.

## 3. Defect clusters by architectural cause

At the time of this study, `scripts/register-tickets.ts` read 215 open and 188 partly resolved rows. Feature labels
show where symptoms are visible—page UI, prose, adventures, architecture, combat, undertakings, and travel—but they
do not by themselves identify shared causes.

### 3.1 Several owners interpret one opportunity — **high confidence**

The runner, terminal, autoplay, and browser each read an offered choice differently. The current design note
identifies five readings, including first-child guesses for openers and custom talk slicing
([Doable design](../mission-22/doable-design.md#the-problem-five-readings-of-one-offer)). This has caused:

- a gold opener to execute a failed exploratory child;
- a flat runner list of sixty to eighty rows where the page used lenses;
- `Talk to` choices to execute an incidental topic;
- page and terminal divergence for one seed.

The indicator-witness work demonstrates the right preventive form: an Atlas indicator can only be built from a
branded witness issued by the authoritative glance; no witness means no semantic indicator
([trust contracts](../mission-22/trust-contracts.md#2-the-architecture-an-indicator-needs-a-witness)).

**Candidate mechanism:** complete `Doable` as the canonical row, opener, lens, command, and witness model. Apply the
same construction pattern to map opportunities, conversations, bodies, and documents where clients currently infer
meaning.

**Concrete register impact:** TB-01, TB-09, TB-10, OR-38, OR-72, PB-02, PB-06, CL-33, CL-34, and CL-49. This mechanism
should not be credited with unrelated prose, combat, or content defects.

### 3.2 Assembly and runtime use different semantic vocabularies — **high confidence**

The assembly ledger can bind places, roads, powers, and some strategic facts. Runtime Kyr already knows ownership,
kinship, debts, beliefs, wants, homes, and trade. An author cannot ask for “a merchant between two settlements with
something at risk and a conflict with authority” because the assembler cannot see those facts
([variety report](../mission-22/variety-study/report.md#4-genuine-architectural-and-authoring-limitations)).

Assembly also recomposes from manifest and seed rather than a selected projection of play state. A later situation
cannot ask for a person the company alienated or a town it saved unless that dependency was anticipated and wired by
the original module.

**Candidate mechanism:** add a deliberately bounded, read-only projection of reusable generated facts—and later a
small whitelist of runtime consequences—to the existing ledger. Retain additive commitments and provenance.

**Concrete impact:** participant reuse, institutions, consequence-sensitive situations, cross-settlement
organizations, and the R37/R38/R72–R75 family of authoring workarounds.

### 3.3 Dramatic processes are repeatedly implemented at a low level — **high confidence**

Independent authors repeatedly implement movement on a clock, pursuit of a moving target, repeated greetings,
counted conversations, and staged organizational behaviour. The activation study's highest-ranked request is movement
and pursuit: multiple modules encode “here on day N, there on day M” as a rule per stage
([Kyr/Deem requests](../../history/activation/kyr-deem-requests.md#triage-the-ten-that-matter-read-this-first)).

**Candidate mechanism:** small libraries or compiler sugar that expand into ordinary Kyr:

- route and schedule definitions;
- moving-target pursuit;
- counted or phase-based conversation;
- a small institution, office, and grant pattern;
- typed situation lifecycle and outcomes.

Each should be introduced only after at least two current examples compile into the same existing semantics.

### 3.4 Geometry is used as authorial layout notation — **high confidence**

Kyr's `Place` declaration directly accepts integer grid coordinates (`src/lang/Kyr.ohm:4-9`). The Iscoed sea-gate,
for example, assigns coordinates to the bank, gatehouse, well, gallery, tide-room, store, undercroft, cut, mere, and
chapel (`data/goings-on/iscoed-gate/situation.kyr:16-18,113-116,190-192`). Much of that is drawing layout rather than
scenario meaning.

Generated-site authors have the opposite problem. They can ask for a ruin but cannot require that it be beside an old
road, four to twelve hours from the start, or carry scenario-specific first impressions
([Kyr/Deem request R23](../../history/activation/kyr-deem-requests.md#r23-a-scenario-cannot-name-describe-or-place-the-site-it-generates)).

**Candidate mechanism:** separate topology and qualitative constraints from metric realization, while keeping exact
coordinates available when they are consequential.

### 3.5 Validation knows syntax better than intention — **medium-high confidence**

Diagnostics now provide source locations, collision explanations, and clearer parse failures
(`src/lang/diagnostics.ts:1-110`). Whole-campaign lint checks containment, passages, applicability, labels, targets,
movers, endings, commitments, and more (`src/cli/kyr-lint.ts:103-112`).

Remaining failures tend to concern intention:

- an action's place parameter is not connected to the object it changes;
- an export has no declared semantic role;
- a person starts nowhere and has no arrival path;
- a generated placement is valid but contradicts the authored fiction.

**Candidate mechanism:** extend lint with semantic patterns and declared module contracts rather than enlarging the
grammar for every error.

## 4. Kyr, Deem, topology, constraints, and geometry

### 4.1 Division of responsibility

**Kyr owns meaning and executable consequences:**

- containment and named adjacency;
- passages and conditional accessibility;
- facts, states, observations, knowledge, actions, effects, clocks, and outcomes;
- exact geometry when it is itself consequential.

**Deem owns choice among authored alternatives:**

- compatible participants or causes;
- weighted surface and structural variants;
- deterministic tie-breaking;
- selection of an authored realization strategy.

**The assembler owns commitment and realization:**

- binding roles against prior commitments;
- enforcing hard qualitative constraints;
- scoring preferences;
- choosing exact cells, paths, extents, and coordinates;
- recording why a candidate won and which facts were committed.

**Presentation owns rendering geometry:**

- map projection, line routing, label placement, and responsive arrangement;
- never the semantic meaning of an adjacency, opportunity, or route.

### 4.2 Three spatial levels

1. **Topology:** contains, connects, lies beyond, blocks, overlooks, is reachable from, or shares a route with.
2. **Qualitative constraints:** near a road, downstream, above flood level, defensible, visible from town, on suitable
   terrain, within a travel interval.
3. **Metric realization:** grid coordinates, exact paths, distances, extents, bearings, and drawing layout.

The existing assembler is already close to supporting this separation. It has a commitment ledger, deterministic
binding, preference scores, candidate-refusal reasons, terrain distances, and generated road geometry. The proposed
improvement should extend those components, not create another placement engine.

### 4.3 Worked comparison: the Iscoed sea-gate

The current authored form includes:

```kyr
Place bank "the sea-bank at {hamlet}" is room within hamlet at 4, 0.
Place gatehouse "the Wardens' gatehouse" is room within hamlet at 5, 0.
Place well "the gate-well, under the gatehouse" is room within hamlet at 5, 1.
Place gallery "the sluice gallery" is room within hamlet at 5, 2.
Place tideroom "the wardens' tide-room" is room within hamlet at 6, 2.
Place store "the smugglers' store, behind the chain" is room within hamlet at 4, 2.
Place undercroft "the wardens' undercroft" is room within hamlet at 5, 3.
Place mere "the drowned mere" is room within hamlet at 1, 4 outdoors.
Place chapel "the drowned chapel in the drowned mere" is room within hamlet at 0, 4.
```

The meaningful commitments are not the integers:

- the gatehouse adjoins the bank;
- the well lies below the gatehouse;
- the gallery continues below the well;
- the tide-room and store branch from the gallery;
- the undercroft lies beyond the sluice door;
- the sluice-cut reaches the store by water;
- the mere lies beyond the sea-bank;
- the chapel stands in the mere and is reachable by boat.

An illustrative declarative form could be:

```kyr
Place gatehouse "the Wardens' gatehouse" is building within hamlet beside bank.
Place well "the gate-well" is room within gatehouse below bank.
Place gallery "the sluice gallery" is level below well.
Place tideroom "the wardens' tide-room" is room off gallery.
Place store "the smugglers' store" is room off gallery near sluicecut.
Place undercroft "the wardens' undercroft" is room beyond sluice_door.
Place mere "the drowned mere" is wilderness beyond bank needing fen_boat.
Place chapel "the drowned chapel" is site within mere.
```

This syntax is a design illustration, not a language recommendation. The capability could instead live in a scenario
manifest or assembly kit. Its required behaviour is more important than its surface syntax:

1. compile topological clauses into assembly predicates;
2. reject cycles, missing endpoints, impossible containment, and unsatisfied hard constraints;
3. enumerate candidate cells or rooms from the generated land and settlement;
4. filter hard constraints, score preferences, and use an identity-keyed stream for ties;
5. commit topology and metrics to the ledger with provenance;
6. emit ordinary Kyr places and passages containing exact coordinates;
7. retain the realized coordinates in the compiled installed world and therefore in save and replay behaviour.

This remains deterministic because the seed, candidates, constraint order, and tie-breaking key are stable. Existing
coordinate-authored content remains valid.

### 4.4 When exact coordinates should remain authored

- Tactical or puzzle geometry where position is the mechanism.
- Maps with intentional iconic composition.
- Exact sailing courses or moving vessels whose location affects time and interception.
- Visibility, line-of-sight, area effects, elevation, or physical machinery.
- Legacy adventures whose maps are part of their identity.

Coordinates are an implementation leak when they merely make rooms appear next to one another or keep a generated
landmark near an already generated feature.

## 5. Authorability case studies

### 5.1 A moving rival or scheduled group — **high confidence for routes; medium for general adversaries**

**Authorial intention:** a rival company travels toward the same objective and leaves traces.

**Current expression:** one stage fact or pursuit per location and time. The author must understand clocks, `at`,
planner priorities, arrival rules, and every possible target place.

**Candidate public capability:**

```kyr
Route hands for company hands {
  At lodge until day 2.
  Travel by north_road to tower taking 1 day.
  At tower until objective archive_opened.
}

Pursuit hunt for bess seeks party by known_passages.
```

The compiler would expand this into existing pursuits, events, movement, and clock predicates. The runtime remains
authoritative; no second scheduler is introduced.

**Concrete limitations addressed:** R41, R54, R89, R32, moving-target pursuit duplication, and groundwork for a
single strategic rival.

### 5.2 A situation bound to existing people and institutions — **high confidence for generated facts; medium for runtime facts**

**Authorial intention:** choose a real merchant, official, debtor, or witness already present in the generated world.

**Current expression:** scenario-specific imports, stock-role assumptions, or newly duplicated NPCs. First-town
authored people are often unavailable to standing scenarios.

**Candidate public capability:** project selected person, trade, office, kin, debt, home, and ownership facts into
the existing ledger, then bind roles through kits:

```json
{
  "slots": {
    "creditor": {
      "is": "person(?creditor)",
      "requires": [
        "merchant(?creditor)",
        "homeOf(?creditor, ?town)",
        "inDebtTo(?debtor, ?creditor)"
      ]
    }
  }
}
```

The current trace model is already suitable: list candidates, failed requirements, scores, and the chosen binding.

**Concrete limitations addressed:** R37, R38, R85, duplicate NPCs, institutional composition, and
consequence-sensitive participant selection.

### 5.3 Repeated conversation and relationship evolution — **medium-high confidence**

**Authorial intention:** a person greets differently on a later encounter, remembers help, and changes what they will
discuss.

**Current expression:** bespoke relations and `once` facts for each topic or greeting.

**Candidate public capability:** first try a reusable library rather than new grammar:

```kyr
Conversation reeve with reeve {
  First greeting_initial.
  Again greeting_after when helped(reeve).
  Again greeting_cold otherwise.
  Topic gate changes trust(reeve) by 1.
}
```

This would compile to ordinary relations, topic predicates, effects, and counted encounters. `inspect` should expose
the expanded predicates and say why a conversational row is absent.

**Concrete limitations addressed:** R60, R46, R57, empty repeated interactions, and relationships that never evolve.

### 5.4 Bodies and natural attacks — **medium confidence**

**Authorial intention:** a creature's body determines locomotion, equipment compatibility, and natural attacks.

**Current expression:** catalog statistics, species overlays, natural-weapon items, and TypeScript construction paths.
Natural attacks are typed, but body plan is not a stable author-facing concept.

**Candidate public capability:** retain catalogs and typed effects; introduce reusable body templates or traits rather
than arbitrary anatomical simulation:

```json
{
  "body": "quadruped",
  "locomotion": ["walk"],
  "naturalAttacks": ["bite", "claw"],
  "equipment": {"hands": 0, "body": 1}
}
```

Kyr scenarios should normally refer to consequences such as `capable(creature, flight)` or
`naturalAttack(creature, bite)`, not manipulate limbs directly. The evidence does not justify a universal anatomy
simulator.

## 6. Platform and product boundary

### 6.1 Recommended ownership

#### Reusable Kyr and Deem platform

- parser, compiler, module system, predicates, actions, and effects;
- deterministic selection and named random streams;
- module-local catalogs and namespaces;
- assembly ledger, constraint binding, provenance, and traces;
- persistence schema and replay;
- generic player-safe query and presenter contracts.

#### Generic RPG and simulation domain

- actors, bodies, inventories, time, movement, checks, combat, knowledge, conversations, organizations, and
  opportunities;
- none should assume Imbar names, gold, Orsino classes, or a solar day.

#### Player-facing runtime protocol

- legal rows and openers;
- action requirements and refusal reasons;
- knowledge and evidence views;
- map topology and realized geometry;
- body and combat presentation;
- conversation and document presenters;
- semantic indicators backed by witnesses.

#### Westernesse product

- Imbar cosmology, calendar, stars, planes, currencies, careers, ancestries, paintings, prose voice, colour usage,
  atlas, scenarios, and campaign defaults;
- Orsino-derived catalogs and SRD adaptation;
- generation tables describing Westernesse.

### 6.2 Migration approach

Repair product leaks when Westernesse or a bounded proving case needs them:

1. parameterize currency display and calendar or night policy;
2. move canon-only rules out of the unconditional shared set;
3. permit campaign-local capabilities and person kinds;
4. retain the current Westernesse manifest as the compatibility default.

Do not extract packages or repositories until these seams have at least two active consumers.

Westernesse's artistic identity belongs in authored voice, paintings, emblems, typography, and product policy. A
generic witness may say “knowledge opportunity”; Westernesse presentation decides that it is blue and how it reads in
the book.

## 7. Tooling opportunities

### 7.1 Unified semantic inspection — **high leverage, low-medium risk**

Extend the existing `inspect` command and assembly traces with:

- `why fact <id>`: source declaration, generated commitment, runtime effect, and current truth;
- `why action <id>`: schema, binding, requirements, failed predicates, witness, and presenter row;
- `why placement <id>`: candidates, exclusions, preferences, random key, and final geometry;
- `dependents <symbol>`: imports, rules, templates, tests, and presenters.

Most of the machinery already exists in `Diagnostics`, `InspectTool`, `Ledger.about`, and `Trace`.

### 7.2 Queryable source and dependency graph — **high leverage, medium risk**

Build a read-only index during lint or compilation:

- declarations and source locations;
- imports, exports, and typed roles;
- predicate reads and writes;
- generated template dependencies;
- tests and kept traces naming a capability.

Start as JSON plus CLI queries. This provides most of the value of language-server navigation before an LSP is built.

### 7.3 Better semantic lint — **high leverage, low risk**

Add advisories for:

- place or action parameters not connected to acted-on entities;
- people placed nowhere with no arrival path;
- exports not classified as fact, outcome, participant, place, or capability;
- generated placements whose generic scene conflicts with an authored replacement;
- client code attempting to construct semantic indicators or action rows outside approved presenters.

### 7.4 Compatibility harness — **high leverage, medium risk**

For pinned worlds and journeys, compare:

- compiled public module schema;
- command IDs and presenter rows;
- save restoration;
- generated placement commitments;
- replay digest;
- source-version and migration requirements.

Classify changes as additive, presentation-only, world-moving, save-breaking, or replay-breaking.

### 7.5 Language-server features — **medium leverage, medium risk**

After the source graph exists, add diagnostics, go-to declaration, references, import and export completion,
predicate signature help, and generated-expansion preview.

### 7.6 Bounded local authoring service — **defer writes**

A read-only local service exposing compile, inspect, dependency, provenance, and preview queries is justified.
Repository-writing or autonomous editing is outside this study.

The incremental path should be:

**inspect → explain provenance → validate contracts → preview generated realization → only later consider structured editing**.

## 8. Evolution roadmap

### 8.1 Immediate consolidation

#### A. Finish the authoritative `Doable` and presenter contract

| Consideration | Assessment |
|---|---|
| Evidence | Five client readings and several parity defects |
| Affected systems | Presentation, UI, runner, terminal, autoplay, browser protocol |
| Migration | Add beside current paths; parity-test; move one client at a time; delete old readers last |
| Cost and risk | Medium cost; low semantic risk |
| Register impact | Concentrated impact on the TB, PB, and CL parity cluster |
| Author benefit | One meaning for every offered row, opener, and indicator |
| Success proof | Identical IDs, commands, openers, witnesses, grouping, and refusal meanings from the same state across clients |

#### B. Type module exports and situation outcomes

| Consideration | Assessment |
|---|---|
| Evidence | Parents must read a child's Kyr to understand untyped exports |
| Affected systems | Manifests, compiler validation, source graph, kits |
| Migration | Optional metadata first; infer legacy exports; warn before requiring |
| Cost and risk | Small-medium; low runtime risk |
| Register impact | Composition and reusable-situation defects rather than presentation defects |
| Author benefit | Sub-scenarios become inspectable black boxes |
| Success proof | A parent composes a complication using only declared roles, requirements, outcomes, and signals |

#### C. Add semantic lint and source/dependency queries

| Consideration | Assessment |
|---|---|
| Evidence | Several known failures already have reproducible intention-level patterns |
| Affected systems | Lint, diagnostics, compiler index, CLI |
| Migration | Advisory-only initially |
| Cost and risk | Small; low |
| Author benefit | Common mistakes fail near their source rather than during play or a distant spec |
| Success proof | R26, R42, and “nowhere without arrival” probes receive useful source-located findings |

### 8.2 Focused capability sprints

#### D. Declarative placement constraints and deterministic realization

| Consideration | Assessment |
|---|---|
| Evidence | Coordinate-heavy scenario layouts and generated sites that cannot express proximity or terrain requirements |
| Affected systems | Kyr spatial declarations or scenario manifests, assembly vocabulary, binder, land realization, map |
| Migration | Coordinates remain valid; new constraints compile to coordinates; pin existing worlds |
| Cost and risk | Medium-high; world-moving if defaults change |
| Author benefit | Authors state spatial meaning without laying out generated maps by hand |
| Success proof | Migrate one sea-gate or arcology slice without changing its reference realization; generate other seeds with an explanation for each placement |

#### E. Project social and world facts into assembly

| Consideration | Assessment |
|---|---|
| Evidence | The assembler cannot select existing people, debts, offices, possessions, or prior consequences |
| Affected systems | Region writer, composition ledger, installation boundary, provenance |
| Migration | Project a small whitelist first: person, home, profession, institution, kin, ownership |
| Cost and risk | Medium; compatibility risk manageable while additive |
| Author benefit | Situations bind to the world instead of duplicating it |
| Success proof | One existing situation binds to a generated resident and refuses with a clear explanation where no compatible resident exists |

#### F. Add two high-level dramatic libraries

Start with route or schedule plus moving-target pursuit, and counted or stateful conversation.

| Consideration | Assessment |
|---|---|
| Evidence | Highest-frequency author requests with several independent implementations |
| Affected systems | Kyr compiler or libraries, lint, inspection |
| Migration | Compile into current constructs; preserve expanded form in diagnostics and saves |
| Cost and risk | Medium |
| Author benefit | Common dramatic intentions become concise without gaining a second semantics |
| Success proof | Replace two implementations of each pattern without changing their kept journeys |

### 8.3 Longer-term platform evolution

#### G. Institution capability

Add offices, holders, grants, jurisdiction, standing, and institutional actions. This should follow social-fact
projection and typed outcomes.

#### H. Versioned public schemas and migrations

Version Kyr module IR, presenter protocol, saves, and generated commitments separately. Supply compatibility checks
before changing defaults.

#### I. Runtime-sensitive situation introduction

Allow later composition to consume a carefully selected read-only projection of play consequences. This is powerful
and should follow typed outcomes, provenance, and compatibility work.

### 8.4 Ideas to defer

- A universal anatomy simulator.
- Arbitrary Deem-generated Kyr structure.
- A complete visual authoring studio.
- Generic strategic AI for every organization.
- Broad platform extraction into independent packages.
- Eliminating TypeScript from generation.
- Unconstrained runtime recomposition from every world fact.

These are attractive but insufficiently justified by current defects.

### 8.5 Dependency order

```text
authoritative presenters
        |
        v
typed exports and outcomes ---> source graph and semantic lint
        |
        v
assembly fact projection
        |
        v
declarative placement and social participant binding
        |
        v
institutions and runtime-sensitive situation introduction
```

Route and conversation libraries can proceed after the source graph, independently of placement.

## 9. Relationship to mission planning

The architectural program should remain subordinate to playable missions.

- Keep the existing register canonical. Architectural proposals cite clusters of register IDs rather than creating
  another ledger.
- Give each platform sprint one player-visible proving slice and one construction invariant.
- Record new feedback immediately, but admit it to an active sprint only if it breaks that sprint's acceptance path,
  persistence, or a protected contract.
- Maintain parallel lanes for opening and playability, SRD and combat fidelity, authorability and platform work, and
  register stewardship.
- Close a capability only when it works through a real Westernesse sequence, not merely when a new type or grammar
  production exists.

The proposed small cinematographic increments are compatible with this roadmap:

1. world presentation and character entry consume one authoritative presenter;
2. the first scene and invitation prove opportunity witnesses and action parity;
3. the first short journey proves authoritative per-leg travel;
4. the first evolving relationship proves repeated conversation;
5. the first world-bound situation proves participant selection and declarative placement.

Each increment remains playable. None waits for a comprehensive engine rewrite.

## 10. Prioritized finding summary

| Finding | Confidence | Preserve or change |
|---|---|---|
| The immutable world, creature-store boundary, and deterministic generation are sound foundations | High | Preserve |
| Kyr should remain the one execution semantics; Deem should remain a chooser | High | Preserve |
| Client parity defects share the absence of one authoritative presented-action model | High | Complete `Doable` and related presenters |
| Assembly's thin social and historical vocabulary prevents reuse of the generated world | High | Project bounded facts into the existing ledger |
| Coordinates mix authorial topology with rendering realization | High | Add optional qualitative constraints; retain exact geometry |
| Routes, moving pursuits, and repeated conversations merit reusable author-facing forms | High to medium-high | Introduce as libraries or compiler sugar after real migrations |
| Institutions are a valuable next domain capability | Medium | Build after fact projection and typed outcomes |
| A general anatomy simulator or universal engine extraction is justified now | Low | Defer |

## Conclusion

Westernesse is already a capable domain platform embedded in a particular game, not a prototype awaiting replacement.
Its central runtime architecture is more mature than its author-facing public interfaces.

The highest-leverage course is to make existing authority travel farther:

- from the engine's offer to every client row;
- from generated world facts into composition;
- from authored spatial intention into deterministic geometry;
- from low-level Kyr mechanisms into a few reusable dramatic libraries;
- from compiler and runtime decisions into inspectable provenance.

That would make broad classes of parity, placement, composition, and authoring defects structurally difficult or
impossible while preserving the determinism, authored specificity, and playable continuity the present system already
does well.
