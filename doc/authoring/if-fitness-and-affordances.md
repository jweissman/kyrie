# Kyr as an interactive-fiction authoring language

*30 October 2026. A review of Kyr's fitness for interactive-fiction design, grounded in the current grammar, the
authoring guide, the independent-adventure response, the later substantial adventures, and the current playtests. It
compares authoring models, not only surface syntax, and proposes concrete affordances for the frictions that remain.*

## Executive judgment

Kyr is already well fitted to one demanding kind of interactive fiction: persistent, systemic, party-based
adventures in which time passes, people act away from the company, places change, and consequences survive departure,
return and even the protagonist. Its strongest claim is not *Inform with a different controlled English*. It is:

> A typed language for consequential worlds, in which player choices, NPC planning, tests and presentation derive
> from the same legal transformations of one persistent state.

That is a substantial and distinctive foundation. Inform remains more mature for parser interaction, local
specialisation of actions, mutable object modelling and rule diagnostics. Ink remains much faster for tightly paced
dramatic flow and branching dialogue. TADS offers deeper general-purpose object-oriented control. Kyr's advantage is
the conjunction of declarative meaning, persistent history, deterministic simulation, generated-world composition
and a choice interface that cannot promise an illegal command.

Kyr is therefore a good specialised IF language, but not yet a comfortable general-purpose one. Its principal
authoring problem is no longer whether a sophisticated fiction can be represented. The built adventures show that it
usually can. The problem is how often one fictional transition must be decomposed and manually synchronised across
facts, rules, knowledge, perception, prose, timing, presentation and tests.

The standard for the next language work should be:

> State one fictional event once; let legality, simulation, knowledge, presentation, persistence and tooling derive
> their respective parts from it.

## Evidence and currency

The main evidence is:

- the current grammar, `src/lang/Kyr.ohm`, and the tested [authoring guide](guide.md);
- [How Kyr works](../history/architecture-2026-10/overview.md), especially the webs example from authored change through planning,
  execution, perception and memory;
- [the response to the first authorability study](../history/reviews/findings-response.md) and the later
  [response to four independent adventures](../history/reviews/adventures-response.md);
- the friction reports for [Thrume](../adventures/thrume/friction.md),
  [Low Water](../adventures/low-water/friction.md),
  [The Third Night](../adventures/the-third-night/09-friction.md),
  [Gosse's Company](../adventures/gosses-company/friction.md),
  [Wapshott's Peregrine Circus](../adventures/wapshotts-circus/friction.md), and
  [the Parliament of Books](../adventures/parliament-of-books/friction.md);
- the current [independent review](../history/playtests/independent-review-2026-10-30/report.md) and
  [systemic-enjoyment review](../history/playtests/systemic-enjoyment-2026-10-30/review.md).

The individual friction reports are records of the version on which each work was written. They are not all current
defect lists. In particular, current Kyr already has or repairs:

- `Ending`, `Chapter`, `Promise` and `Occasion` declarations;
- `Rule … teaches` and `Event … teaches`, while still refusing arbitrary `Assert knows`;
- conditional roles and viewer-dependent `Known as`;
- `Topic … answering …`;
- counts that stop at nothing;
- aggregated reports of all identifier collisions in a failed load;
- shared journey and terminal-play support;
- several narration, visibility, choice-identity and companion-lifecycle repairs recorded in
  [adventures-response.md](../history/reviews/adventures-response.md).

Recommendations below concern the remaining mechanism or the natural completion of those repairs, not a request to
reimplement what now exists.

### Capability is not binary

A second source audit, prompted by `kyrie inspect`, changes the diagnosis further. Several recommendations in this
report were phrased as missing features when Kyr already contains their important core. The useful question is not
only whether a capability exists, but how far it travels through the authoring system:

1. **Runtime substrate:** the engine can represent or perform it.
2. **Authored declaration:** Kyr can state it without rebuilding its protocol from facts and rules.
3. **Semantic retention:** after lowering, the runtime still knows which authored construct it is executing.
4. **Composition:** other declarations can refer to it by its meaning rather than its generated implementation.
5. **Inspection:** tools can explain its legality, state and history in the author's terms.
6. **Projection:** the player surface presents the same meaning and causal boundaries.
7. **Documentation and examples:** an independent author can find and learn it.
8. **Corpus proof:** a substantial adventure uses it without a parallel hand-built protocol.

“Implemented” at rung one or two can therefore coexist with severe authorial friction at rungs four through seven.
Conversely, a friction report can remain valuable evidence even after its immediate defect has been repaired: it may
show that an author could not discover the intended mechanism, or that the mechanism did not compose with the rest
of the language. The register should record the highest demonstrated rung, not only Open/Fixed.

The ten proposals below are best read as **completion paths for existing semantic islands**:

| Area | What demonstrably exists now | The material gap |
|---|---|---|
| Explanation | `kyrie inspect` plays to a state, finds offered or nearest grounded actions, expands failed queries, reports what holds instead, and explains inadmissible decreases | Historical rule/watch/fact provenance, source locations and a causal account of what actually fired |
| Transformations | `Give`, item- or kind-specific `Spend`, strict decreases, clamped `or to nothing`, movement resolvers and journey accompaniment | One retained transaction identity shared by lint, preview, narration and trace; several ordinary transforms remain manual |
| Affordance projection | typed observation aspects, trials, aims and an engine-owned glance/promotion ranking | an authored, inspectable link from evidence to the families of attention or action it opens |
| Situations | `Occasion` owns opening, timed sequential matters, conditional closure and final words; `Promise`, `Chapter` and `Ending` own adjacent lifecycles | participants, interventions, pressure, resolution and aftermath composed as one referable activity |
| Rule composition | read-set analysis, idle-rule invalidation and a second upkeep pass already settle important derived state | named causal phases/defaults and an execution explanation; authored order still carries logical meaning |
| Knowledge | teaching, `knows`, `witnessed`, `readIn`, `toldBy`, teaching settlement, conditional visibility and `Known as` | richer source/time/content identity and one viewer-relative projection used by every surface |
| Identity and place | conditional roles, canonical entities, following/travel ties and mutable `at` facts | explicit office succession, offstage lifecycle and portable-area invariants as authored constructs |
| Narrative transaction | `CampaignEvent` records action, elapsed time, changes, combat, NPC decisions, response, interruption, perceptions, prelude, flight and selected voice lines | a declared causal grouping/order that survives all the way to narration and can be inspected as one transition |
| Reusable patterns | warnings, tries, observations, passages, promises, occasions, endings and several generated-world protocols | a small documented library with explicit contracts, rather than similar protocols independently assembled in adventures |
| Scale tooling | preview/lint, terminal play, probes, `inspect`, strict journeys, semantic command ids, replay and verification | indices, coverage, source-aware timelines, stable selectors throughout, and a coherent documented studio workflow |

This is a more favorable assessment of Kyr than “ten missing features,” but it also identifies a deeper problem than
documentation alone. Better documentation would unlock real existing power immediately. It would not by itself make
lowered constructs referable, unify projections, preserve causal provenance or remove the duplicate protocols that
authors currently maintain.

## Comparative position

| Dimension | Kyr now | Comparative judgment |
|---|---|---|
| Persistent world state | Excellent | A defining strength |
| Time, offscreen events and NPC agency | Strong | More central than in typical Inform work |
| Typed domain semantics | Strong | Safer than loosely related story flags |
| Deterministic replay | Excellent | Unusually valuable for long systemic fiction |
| Spatial adventure construction | Strong, with directional and moving-place gaps | Comparable in ambition to Inform/TADS |
| Choice authority | Strong foundation | Better boundary than most bespoke choice engines |
| Parser interaction | Not Kyr's aim | Inform/TADS are categorically stronger |
| Dramatic flow and dialogue | Capable but laborious | Ink is much faster and clearer |
| Runtime transformation | Uneven | Inform/TADS make ordinary object mutation easier |
| Rule diagnostics | Useful action diagnosis, weak historical trace | `inspect` is substantial; causal rule/watch provenance remains the largest gap from Inform's authoring experience |
| Independent-author ergonomics | Promising but uneven | The main obstacle to wider use |

Inform begins with a command and asks which rules interpret, permit, carry out and report it. Kyr begins with legal
world transformations and projects them into choices. Inform is especially good at answering *what does this command
mean here?* Kyr is especially good at answering *what can actually be done now, by the player or another actor?*
For a choice-driven persistent RPG, Kyr's direction is sound.

Ink begins instead with authored flow: the writer explicitly places the present choices and their continuations.
That gives Ink dramatic hierarchy almost for free, but little autonomous recombination. Kyr derives many legal
choices from a world and can therefore expose forty equally valid commands without saying which three constitute the
present moment. Kyr needs a thin dramaturgical projection over its world, not a replacement flow language.

### What maturity means in peer systems

The useful comparison is not feature count. Each mature peer has stabilised a different contract among language,
library, host runtime and authoring tools.

**Inform:** its durable achievement is a constitutional standard library and inspectable action protocol, not natural
English by itself. Actions pass through named rules, the Index shows the rules that affect an action, and author-only
commands such as `ACTIONS` and `RULES` expose execution. Its documentation treats rules, activities, relations and
testing as parts of one authoring environment. See Inform's official
[action documentation](https://ganelson.github.io/inform-website/book/WI_7_1.html) and
[documentation index](https://ganelson.github.io/inform-website/doc/). Kyr should emulate the inspectability and
library contract, not Inform's parser assumptions or full rulebook hierarchy.

**TADS 3:** its action pipeline distinguishes logical verification, checks, reusable preconditions, execution and
reporting. Preconditions can sometimes establish a missing condition through an implicit action. See the official
[precondition guide](https://tads.dev/docs/adv3/doc/gsg/precond.htm) and
[verify/check analysis](https://tads.dev/docs/adv3/doc/techman/t3verchk.htm). Kyr needs the semantic distinctions,
but should be more conservative about implicit preparation: automatically taking, paying or opening may erase an OSR
decision about time, ownership or danger.

**Dialog:** a relational language can remain compact while its standard library supplies world behavior, actions,
ticks, scenes, NPCs and even choice mode. Its distribution explicitly includes compiler, interactive debugger,
standard debugging extension and unit-test library. See the
[Dialog manual](https://www.linusakesson.net/dialog/docs/) and
[community distribution](https://github.com/Dialog-IF/dialog). This supports Kyr's fact/rule foundation while
undercutting the idea that representability alone is maturity: library and debugger are part of the language authors
actually use.

**Ink and Yarn Spinner:** these systems own bounded narrative flow and meet the host game through an explicit bridge.
Ink's knots, stitches, choices, diverts and threads make the current dramatic alternatives authored structure rather
than a projection from a world; see the official
[Ink writing guide](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md). Yarn's Dialogue Runner
delivers lines, options and commands while storage and presentation are supplied separately; custom commands are an
explicit boundary into game mechanics. See Yarn's
[runner documentation](https://docs.yarnspinner.dev/components/dialogue-runner) and
[commands and functions](https://docs.yarnspinner.dev/yarn-spinner-for-unity/creating-commands-functions). Kyr should
permit bounded authored flow inside an occasion or conversation, but make its commands typed world intentions rather
than arbitrary host callbacks.

**Unreal Gameplay Ability System:** this is not an IF peer, but it is instructive for Kyr's mechanical half. It
separates actor-owned abilities, attributes/resources, reusable gameplay effects, long-running ability tasks, tags
that gate or cancel execution, and cosmetic cues. Authoritative gameplay and cosmetic response are deliberately
separate. See Epic's
[Gameplay Ability System overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system)
and [ability execution documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine).
Kyr should take the separation of effect, orchestration and presentation, while avoiding an untyped tag vocabulary or
an unrestricted scripting escape hatch.

Together the peers suggest a maturation sequence: stabilise execution semantics; grow a standard library; retain
source identity into debugging; expose indices and previews; then support an ecosystem of extensions. Kyr adds one
requirement the peers generally do not share: the same causal vocabulary must remain meaningful from a blow or spell
through a world action to an offscreen undertaking and campaign history.

## What should be preserved

Language work should preserve four properties demonstrated by the current architecture:

1. **One mechanical truth.** Player choice, NPC planning, tests and UI legality use the same action semantics.
2. **Typed meaning.** Places, passages, people, discoveries, promises and consequences are not merely UI labels.
3. **One persistent history.** State changes, elapsed time and perception survive save, return and replay.
4. **Strict composition.** Generation and module installation fail rather than silently substituting incompatible
   content.

The remedies below should generally lower into current facts and operators. They should not install a second quest
engine or allow presentation code to invent rules.

## Further source-level findings

The recommendations above were first derived from reports. Reading the current substantial adventures and following
their declarations through the compiler changes and sharpens the diagnosis. Kyr is not an empty fact language waiting
for high-level constructs. It already has several of them, a structured campaign event, a perception settlement loop,
typed creature effects and explicit special treatment for derived passage state. The problem is where those meanings
stop surviving.

### The corpus is building process machines by hand

Five current substantial adventures give a useful scale sample:

| Adventure | Kyr lines | Relations | Rules | Actions | Topics | Observations |
|---|---:|---:|---:|---:|---:|---:|
| *The Liberty of the Ice* | 2,935 | 135 | 264 | 91 | 104 | 130 |
| *Low Water* | 2,917 | 101 | 236 | 66 | 205 | 203 |
| *What Tessary Owes* | 2,366 | 92 | 178 | 49 | 112 | 151 |
| *The Parliament of Books* | 3,590 | 146 | 168 | 66 | 236 | 257 |
| *Gosse's Company* | 3,307 | 127 | 333 | 126 | 113 | 132 |

These counts are descriptive, not a claim that fewer declarations are automatically better. The works are large and
genuinely intricate. What matters is the shape visible in their sources: many relations are not enduring domain
concepts but private lifecycle markers such as `callowPut`, `callowPressed`, `gantSpoke`, `releaseGathered`,
`pleasPrinted`, `pleasAbroad` and `awlsWarned`. Rules advance among them; topics and actions supply the interventions;
observations project the current phase.

In other words, authors are implementing finite-state processes, but the language sees chiefly unrelated predicates.
That has three costs:

1. tools cannot say which relations are phases, alternatives, evidence, latches or durable consequences;
2. presentation cannot ask which current actions belong to the same developing matter;
3. lint cannot check process coverage, impossible phases or missing aftermath without reconstructing intent from
   names and negations.

This is stronger evidence for a shared process protocol than the friction reports alone. It is not an argument for a
plot engine: the state machines in these adventures are deliberately porous, spatial and time-sensitive. It is an
argument for giving their identity and lifecycle to the compiler.

### High-level declarations are first-class only during compilation

`WorldConstructs` states the current policy plainly: first-class declarations are lowered into ordinary entities,
facts, observations and rules so that the runtime keeps one execution model. This succeeds mechanically. A `Passage`
becomes connections, kind, travel time, needs and observations; a thing state becomes `state`, flags, generic changes
and state-conditioned observations.

The cost is most visible in the newer constructs:

- an `Event` becomes an ordinary rule guarded by a generated `once_<id>` relation;
- a `Promise` becomes an entity, `promiseMade/Kept/Broken` facts, two rules and an objective;
- an `Occasion` becomes stage measures, open/closed facts and rules advancing its matters;
- a passage opening becomes two `upkeep` rules and an `unopened` fact.

After lowering, the runtime can execute these efficiently and uniformly, but much of the declared intention is no
longer directly addressable. A trace sees a generated rule rather than an event transition; a promise's acceptance is
whatever external topic happens to assert `promiseMade`; an occasion knows sequential matters but not participants,
interventions or aftermath.

The healthy remedy is **semantic retention**, not a second executor. Keep the lowered facts and rules, but retain a
source-level semantic record and source map:

```text
promise letter_promise
  lowers to: promiseMade, letter_promise_kept, letter_promise_broken, letter_promise_aim
  lifecycle: proposed? → made → kept | broken
  source: promise/site.kyr:13
```

Runtime events and tooling can then refer back to the declared construct. This is analogous to a compiler retaining
debug symbols: machine execution stays simple without pretending the source program has disappeared.

### Kyr already has an event structure, but not yet an event model

`CampaignEvent` records a player action, elapsed time, success or failure, a resolution, stringified changes, combat
events, NPC decisions, response, interruption, perceptions and voiced lines. NPC decisions retain actor, goal, action,
plan, time and changes. Perception settlement records observations, events and newly learned discoveries. This is a
much stronger foundation than a prose transcript or a bare before/after world.

The remaining gap is uneven semantic identity:

- combat events are typed;
- NPC decisions are structured;
- a rule's happening is `{ id, text, kind: event }`;
- general world changes are strings;
- an authored `Event` is indistinguishable at runtime from the generated rule it became;
- causal parentage among action, rule, discovery and report is implicit in array order.

The needed step is therefore incremental. Kyr does not need wholesale event sourcing. It needs typed world-transition
records alongside the existing state commitment:

```text
WorldTransition {
  id, kind, cause, sourceDeclaration, actor, subjects, place,
  before?, after?, changes, occurredAt, witnesses
}
```

Only semantically important operations need specialised kinds: moved, transferred, placed, office-assigned,
promise-made, promise-recognised, discovery-learned, process-resolved. An unfamiliar rule can still emit a generic
fact-change event. This preserves an escape hatch without forcing narration to reverse-engineer every important
transition.

### Authors have independently invented a public-event and news protocol

*The Liberty of the Ice* provides especially strong evidence. It declares `happened(fact)` and `heardNews(fact)`,
then repeatedly writes a pair:

```kyr
Rule bear_breaks when ... {
  Assert bearLoose(absolute).
  Assert at(absolute, ox_roast).
  Assert happened(ev_bear_breaks).
}

Rule bear_breaks_heard when happened(ev_bear_breaks) and inPellam()
  and not heardNews(ev_bear_breaks)
  says "Word comes down Freezeland Street at a run: ..." {
  Assert heardNews(ev_bear_breaks).
}
```

The same pattern covers raids, weddings, the bear, a newspaper, an arrest, a channel cut and other public happenings.
Across the adventure corpus there are at least twenty-two explicit `Assert happened(ev_...)` sites and twenty-five
`heardNews(ev_...)` uses. These counts omit equivalent patterns with story-specific names.

This is not merely repetitive syntax. It exposes a missing semantic distinction:

```text
occurrence → direct witnesses → reports propagate → recipient hears report
```

An anchored rule currently combines occurrence and immediate telling. The hand-built protocol separates them, which
is exactly what a persistent campaign needs. A mature event declaration should be able to state both:

```kyr
Event bear_breaks at ox_roast when ... {
  ...effects...
  Witness "Absolute tears loose...".
  Report within pellam after 0 minutes
    "Word comes down Freezeland Street at a run: ...".
}
```

The report is not magical omniscience. It is a scheduled propagation with a scope, delay and source; later versions
could name a messenger or institution. The company may witness the occurrence, hear the report, both, or neither.
The journal can record the appropriate provenance.

### The two mechanical languages meet at a narrow seam

Kyr's campaign language and ability language are related but distinct:

- campaign predicates and changes govern facts, measures, places, knowledge and authored actions;
- `Abilities.ohm` parses damage, healing, conditions, saves, resources, summoning, travel and learning into typed
  creature effects;
- catalog abilities are JSON records containing either that effect language or its generated typed form;
- a local `Hazard … means "..."` reuses the ability effect language;
- campaign actions enter creature mechanics through named `Resolve` calls such as `check`, `combat`, `expose` and
  `acquire`.

This is broadly healthy. A trap and a spell can both deal typed fire damage without a trap becoming a learnable
ability. A persuasion check remains a campaign resolution rather than an attack. But the seam currently has two
limitations.

First, the effect language's targets are creature roles (`enemy`, `ally`, `self`, `party`), while campaign changes
target world terms and relations. A single fictional act that both wounds someone and changes a place crosses the
boundary through bespoke resolver coordination or a later rule. Second, `Resolve` is open by identifier but not
described in Kyr: the author cannot inspect its required parameters, preview contract, emitted events or permissible
contexts from the language itself.

The maturation goal should be a **shared transaction protocol**, not a universal action language. An action may
coordinate several typed domains atomically:

```text
Resolution transaction
  creature effects: damage, condition, resource
  world effects: move, state, custody, measure
  epistemic effects: learn, report
  process effects: promise made, matter resolved
```

Each domain keeps its vocabulary and validator. The transaction supplies source, actor, targets, randomness,
atomicity, time and semantic events. A fireball, a collapsing bridge and a public verdict can then share execution
infrastructure without pretending to be the same authored object.

### Clock predicates are serving as an informal scheduler

A rough corpus scan finds nearly a thousand uses of `watch(clock)`, `day(clock)` or `hour(clock)` in adventure Kyr.
Many are ordinary and readable. Others combine exact-hour predicates, arithmetic deadlines and latches into a
scheduler:

```kyr
day(clock) == 5 and hour(clock) == 18 and not pleasPrinted(doble)
watch(clock) >= awlsAt(awls) + 3 and not awlsStopped(saul)
```

This works, and it gives authors the full power of predicates. Its cost is that the engine cannot readily answer:

- what is scheduled next;
- whether a long action crosses it;
- whether an equality-hour event can be skipped;
- which scheduled event is urgent or merely reportable;
- whether two events compete for the same participant;
- which latches exist only to make a schedule fire once.

`At`, `After` and `Every` should therefore be semantic scheduling forms that lower to clock predicates while
retaining their schedule metadata. Authors should still be able to write an arbitrary clock predicate where needed.
The common form becomes inspectable; the unusual form remains expressible.

### The strongest current source reads as authored circumstances, not generic systems

The Callow disputation in *Liberty of the Ice* is instructive. It is made from ordinary topics and relations, but the
source clearly expresses a coherent dramatic object: Callow poses one public question; three mutually exclusive
answers produce different rejoinders; two answers open investigations; the third requires evidence found elsewhere;
the crowd and named bystanders respond.

The prose and causal design are already strong. Replacing it with a generic dialogue tree would lose its virtues.
The language improvement is to let the author group the existing declarations:

```kyr
Disputation callows_question ... {
  Opens with callow_puts.
  Answers callow_public_binds, callow_public_changes, callow_public_knowing exclusive.
  Followups ...
  Witnesses crowd, gant, ursel.
  Bears on court_case.
}
```

This grouping should not own the prose or force a branching-flow execution model. It supplies identity, mutual
exclusion, participants, relevance and coverage to tools and presentation. The underlying topics can remain ordinary
legal actions. This is a representative maturation principle: **annotate and compose what good authors already write;
do not replace it with a more generic but less expressive template.**

## The deeper language architecture

The source findings and peer systems suggest five layers. They share predicates, identities, time and causal events,
but should not collapse into one universal construct.

### Layer 1: effect algebra

The small typed operations that change a creature, item, place, knowledge state or process. Every effect needs source,
targets, applicability, resolution, lifetime, clock, atomic delta and emitted event. Creature effects already provide
much of this for damage, conditions and resources. World, epistemic and social effects need equivalent typed
operations where their meaning matters.

### Layer 2: executable intentions

Abilities, world actions and NPC actions share a protocol:

```text
applicable → attemptable → preparable → committable → completed/interrupted
```

They do not share every field. Abilities have grants, cooldowns and combat targeting; world actions have perceived
affordances, witnesses, campaign duration and ownership. Separating applicability from commitment prevents costs and
invalid state transitions from silently masquerading as false preconditions.

### Layer 3: semantic transitions

Committed intentions and autonomous occurrences emit causally identified transitions. Current `CampaignEvent`, combat
events, NPC decisions and perception records are the basis. Retained source declarations and typed important changes
complete it.

### Layer 4: processes

Promises, occasions, disputes, investigations, pursuits, conflicts and environmental cycles are identified processes
over multiple transitions. A minimal shared lifecycle is:

```text
latent → perceptible/invited → active → resolved/failed/abandoned/superseded → aftermath → settled
```

Individual kinds may omit stages. This is not a quest pipeline. It gives tools and presentation an address for the
open circumstances authors currently implement with private relations.

### Layer 5: campaign protocols

Modules compose through behavioral capabilities as well as entity IDs: an institution able to recognise a returned
item, a public place able to host a hearing, a route along which news can travel, a person authorised to bargain, a
wilderness able to host an encampment. Shared identity without shared behavioral contracts produces one namespace,
not one world.

## A maturation path particular to Kyr

Peer systems suggest that mature languages stabilise an execution constitution, a standard library and author-facing
introspection before pursuing unlimited expressiveness. Kyr's additional obligation is to carry one causal vocabulary
from an ability through a persistent OSR campaign.

### Stage 1: publish the semantic constitution

Specify and probe:

- stored state, pure derivation, transition and historical record;
- applicability, attemptability, preparation, cost and atomic commitment;
- rule phases and derived-state settlement;
- action intervals, interruption and deferred notice;
- event identity, causal parentage and witness scope;
- perception, learning, report and current salience;
- the authority boundary among runtime, narration and client.

This is Kyr's analogue to Inform's Standard Rules and action protocol, without copying its rulebook inventory.

**Exit:** an author can explain an absent action and a completed transition from author-facing tools without reading
TypeScript.

### Stage 2: retain semantics through lowering

Add source maps and retained declarations for `Event`, `Promise`, `Occasion`, `Ending`, passage openings, thing
changes and future process forms. Generated rules should point back to their declaration and role.

**Exit:** traces, lint, indices and tests name the construct the author wrote, not only generated latch rules.

### Stage 3: complete transactional effects

Add typed movement, placement, transfer, stock, payment, bounded measures, office, membership and knowledge/report
operations. Define how a resolver composes creature, world, epistemic and process effects atomically.

**Exit:** a trap may wound a member, move the company, change the mechanism and teach what happened in one auditable
transaction, without making traps and spells the same content type.

### Stage 4: make time inspectable

Introduce retained `At`, `After`, `Every` and deadline forms; advance long actions to relevant event boundaries;
classify events as interrupting, reconsidering, deferred notice or silent. Preserve arbitrary clock predicates as the
escape hatch.

**Exit:** the engine can list what is due next, preview what a long action crosses, and avoid simulating empty watches
one by one without changing deterministic history.

### Stage 5: grow the standard world library

Stabilise repeated protocols: physical access, visibility, containment, custody, theft and witnesses, warning/grace,
commerce, handover, recurrence, directional passages, conversation initiative, promises and reports. Each needs an
index entry, trace vocabulary and interaction tests.

**Exit:** a new adventure declares its peculiar circumstances instead of reimplementing common warning clocks,
payments, news propagation or item handover.

### Stage 6: add process identity and dramaturgical projection

Generalise the existing `Promise` and `Occasion` approach. Let authors group existing topics, actions, rules and
events into disputes, investigations, performances and undertakings without forcing flow. Project relevance from
visible activity, active processes, pressure and aims.

**Exit:** the Callow disputation, a court, a show and an offscreen institutional undertaking are each inspectable as
one process while remaining interruptible, avoidable and spatially situated.

### Stage 7: compose public campaign protocols

Extend imports and exports from identity/type bindings to behavioral requirements and public events. Version these
contracts and preserve save migrations. Only then make module-local generators capable of instantiating them.

**Exit:** independently written modules can affect the same institution and recognise one another's consequences
without importing private relation names.

### Stage 8: build the authoring environment over stable identities

Provide action/rule/process indices, live `why-not`, event timelines, schedule views, relation ownership, coverage,
transcript skeins and source-aware migration. Inform's lesson is the value of inspectability, not the form of its IDE.

**Exit:** an independent author can discover the public model and diagnose ordinary failures from generated indices
and examples rather than reading engine source or several mature adventures.

## Overworld, epistemic and social abilities

Kyr's dual role creates an opportunity traditional IF and combat-oriented ability systems rarely address together:
an ability can be a typed intervention in the same persistent world that passages, pursuits, promises, institutions
and offscreen histories inhabit. *Control Weather* is not merely a combat buff with a long duration. *Sending* is not
merely dialogue text. *Sense Motive*, charm, truth magic and a geas bear on what people know, intend, promise and later
do.

The current model proves useful pieces but not their composition:

- weather is chiefly descriptive, generated, or adventure-specific state read by observations and rules;
- `persuasion`, `deception`, `intimidation` and `insight` are capabilities used through `Resolve check`;
- authors state the particular consequence of a successful social action by hand;
- hostility, tolerance, alliance, belief-like relations and conviction measures exist in particular systems;
- promises, discoveries, witness scope and NPC pursuits provide durable social consequences;
- catalog `charm` applies a creature condition, which is suitable for resistance and combat modifiers but insufficient
  to say what a charmed person will do in the world.

The way forward is not a single larger effect list. It is a family of effect domains sharing one transaction:

| Domain | Typical targets | Examples |
|---|---|---|
| Somatic | creature, member, group | damage, healing, sleep, transformation |
| Material/spatial | item, thing, passage, place | move, mend, open, shape stone, create food |
| Environmental | area, route, region, phenomenon | weather, light, flood, fire, growth, season |
| Epistemic | perceiver, proposition, source | detect, reveal, obscure, report, scry, remember |
| Social/institutional | person, group, office, institution, terms | persuade, compel, authorise, condemn, reconcile |
| Process/cosmological | promise, occasion, pursuit, conflict, law | bind, release, delay, foretell, consecrate |

An ability may coordinate effects in more than one domain. The domains retain distinct validation and consequences.

### Weather should be a phenomenon, not a global flag

A useful weather model needs at least:

```text
phenomenon identity
kind and intensity
spatial extent
movement or persistence
onset and expected end
source: natural, generated or magical
confidence with which it is forecast
```

Places query the phenomena affecting them; the engine derives local sky, precipitation, wind, temperature and
visibility. A weather spell modifies or creates a phenomenon rather than setting `raining=true` everywhere.

A proposed declaration might read conceptually:

```kyr
Ability control_weather "Control Weather" {
  Cast 1 hour. Sustain up to 8 hours. Cost 3 slots.
  Target region perceived from here within 12 miles.
  Choose precipitation by one step, wind by one step, or temperature by one step.
  On complete Influence weather(target) toward choice over 1 hour.
}
```

The precise syntax belongs to the ability language, not necessarily the campaign grammar. Its execution must create a
world transition with region, extent, onset, duration and magical source. Shared laws then derive consequences:

- visibility and surveying range;
- road, river, sea and wilderness travel time or closure;
- exposure and rest quality;
- fire behavior;
- tracks, mud, snow and other evidence;
- ships, harvests, markets and scheduled public activity;
- what NPC planners can perceive and which routes they choose.

This is what makes it overworld magic. The spell does not contain bespoke clauses for every adventure. Adventures and
institutions already sensitive to rain, wind, flood or frost respond because they read canonical environmental
queries.

Several design rules follow:

1. **Large scope requires onset and commitment.** A region-changing spell should normally be interruptible and
   forecastable rather than an instant menu toggle.
2. **Duration belongs to world time.** It persists while the company travels or sleeps and affects offscreen actors.
3. **Overlapping influences compose explicitly.** Natural fronts, another caster and local magical laws may reinforce,
   oppose or bound an influence; last-writer-wins weather would be arbitrary.
4. **Forecast is knowledge, not truth.** The company may know that a storm is expected without knowing its exact
   duration or path. Divination can improve confidence.
5. **Consequences remain situated.** Rain in a marsh, drought during a fair and wind on a cliff need not produce the
   same authored opportunities even though they share physical effects.

The same architecture supports `Control Water`, `Plant Growth`, `Hallow`, `Move Earth`, a months-long winter curse,
and mundane engineering. Magic is distinguished by source, cost, resistance and fictional permissions, not by using
an entirely separate world model.

### Social action should operate on reasons and commitments, not social hit points

The current adventures show the right raw material. Callow's argument changes which question can be put at court;
Harker's belief in a fictitious squire depends on props, testimony and prior knowledge; Ursel's trust changes what she
will disclose; Tessary's promises bind institutions and outlive individuals. These are richer than a disposition
meter.

A social intention should be representable as:

```text
speaker
audience
speech act: claim, ask, offer, promise, threaten, accuse, command
proposition or terms
evidence and leverage invoked
authority or relationship
privacy and witnesses
resistance or uncertainty
result: accepted, refused, countered, believed, doubted, concealed
```

The result need not expose a universal mental state. It may create a commitment, permission, pursuit, report or
belief record that matters to later conduct.

For example, persuasion should usually propose actual terms:

```kyr
Offer safe_passage to reeve {
  Give bell as surety.
  Ask passage(party, north_gate) until dawn.
}
```

Persuasion may affect whether the reeve accepts those terms. It should not invent the terms, make the reeve generally
friendly, or guarantee unrelated favors.

This suggests a useful separation:

- **terms and possible consequences are authored/world facts;**
- **social ability affects interpretation, willingness, confidence or the cost of agreement;**
- **the NPC's authority, interests, knowledge and current commitments bound the result;**
- **acceptance creates a typed commitment or permission that the planner and later witnesses recognise.**

### Belief needs provenance and limited scope

Some adventures already use bespoke `believes` and `conviction` relations. A reusable belief record should minimally
identify:

```text
holder
proposition
stance: accepts, doubts, rejects, undecided
source or evidence
confidence, where gradation matters
last revision
```

Not every NPC needs a simulated belief database. Beliefs should be instantiated for propositions that a process,
pursuit or authored response reads. This keeps the model bounded.

Conflicting testimony need not overwrite truth or one another. Harker can believe the squire claim because of a
printed tally and trusted word; Abel's testimony can later defeat or reinforce that belief. A trace can then explain
conduct in fictional terms: which evidence and commitment supported the decision, not merely that a persuasion roll
passed.

### `Sense Motive` should reveal evidence, not hidden source code

A conventional implementation gives a numeric bonus or reports whether a speaker is lying. Kyr can do better because
observations, knowledge and source already matter.

`Sense Motive` or insight should expose authored signs and bounded inferences:

```kyr
Sign harker_glove of harker
  when discussing(squire_claim) and knows(harker, swale_head)
  noticed by insight
  "He looks at the glove before he answers, not at the tally."
  supports harker_knows_hawsfold.
```

The player learns a sign and perhaps an inference, with provenance. They do not receive `harkerLies=true` or every
hidden motive. A failed check can miss the sign without asserting the opposite. Magic such as detect thoughts may
reveal more, but should still specify depth, resistance, notice and what kind of mental content it can access.

This supports mystery and uncertainty better than binary truth detection.

### Social magic needs explicit agency semantics

Different spells currently risk collapsing into the same `charmed` condition. They should instead declare their
fictional authority.

**Charm:** changes reception, attention or presumptive trust toward the caster for a duration. It does not create
arbitrary obedience, erase prior evidence, grant institutional authority or force self-destructive conduct. The target
may later recognise the influence, depending on the spell.

**Suggestion:** installs one bounded proposed intention, with stated refusal conditions and duration. The target's
planner may pursue it using ordinary legal actions. It does not give the caster direct control of the target's body.

**Command:** creates one short compulsory intention with a narrow action vocabulary. It is appropriate for a turn or
moment, not a relationship.

**Zone of Truth:** constrains speech acts made within an area. It does not reveal beliefs, compel answers or prevent
evasion and silence. Statements can carry `sincere` or `knownFalse` status relative to the speaker's beliefs; the zone
blocks the latter.

**Geas:** is closest to a magically enforced `Promise` or pursuit. It needs terms, subject, deadline or continuing
condition, known consequence, means of release and evidence of fulfilment. The subject retains agency among ways of
complying and may resist, seek release or accept the consequence.

**Sending:** creates a report through a magical channel with known sender, audience, content and reply bounds. It
should use the same knowledge-provenance machinery as a messenger, but with different range and interception rules.

**Scrying:** creates a temporary remote perception relation, limited by target, familiarity, resistance and sensory
channel. It teaches only what is perceptible through that relation, not all facts at the remote place.

These distinctions make social magic legible to authors, planners and players. They also make consent, coercion and
aftermath expressible rather than buried in prose.

### Diplomacy should be an encounter without becoming combat

Kyr could support a typed diplomatic encounter with:

- participants and represented institutions;
- authority to offer particular terms;
- interests, reservations and existing commitments relevant to this negotiation;
- public and private information;
- proposals and counterproposals;
- time pressure and outside events;
- agreement as a durable, witnessed commitment;
- breakdown without necessarily producing hostility or violence.

It should not reuse HP, initiative or attack targeting. The commonality with combat is the transaction protocol:
legal intentions, costs, uncertain resolution, time, interruption and aftermath. The state and victory conditions are
socially meaningful terms.

This would let persuasion, insight, deception, reputation, gifts, leverage and magic modify a concrete negotiation
rather than act as isolated skill buttons.

### Ability previews must extend beyond arithmetic

Kyr already explains mechanical calculations for creature abilities. Overworld and social abilities need an equally
strict preview contract:

```text
Control Weather
  affects: the Pellam basin and roads within twelve miles
  begins changing the sky after one hour
  may close the south road and improve travel on the frozen Reach
  lasts while sustained, up to eight hours
  current opposing influence: the month-long snow, stronger than this spell

Charm Harker
  may make him hear you as a trusted acquaintance for one hour
  cannot make him surrender another person's property or forget contrary evidence
  he receives a charm save and may recognise the influence afterward
```

Preview must not reveal hidden opposition, future rolls or secret consequences. It should state public scope,
authority, cost, duration and known limits. This is the overworld counterpart of explaining damage and saves.

### Acceptance demonstrations

This direction should be proven with joined systems rather than catalog coverage:

1. **Weather:** a company changes wind or precipitation; a route, visibility, an NPC undertaking and a later report
   all respond without spell-specific rules in those systems.
2. **Insight:** the same conversation offers different signs to an insightful and an untrained protagonist, neither
   receiving hidden truth directly.
3. **Persuasion:** a negotiated safe-conduct records actual terms, authority, witnesses and expiry; an NPC and a guard
   later honour it.
4. **Charm:** the target's bounded conduct changes, an incompatible request still fails, and the target may recognise
   the enchantment afterward.
5. **Geas:** a magically bound undertaking persists offscreen, guides the target's planner, can be fulfilled by more
   than one route and produces a witnessed release or consequence.
6. **Sending and scrying:** both convey knowledge with correct source and scope, and neither grants omniscient Notes.

These demonstrations would establish something more distinctive than a longer spell list: abilities that participate
honestly in geography, institutions, partial knowledge and continuing history.

## OSR-specific constraints on maturation

Kyr's campaign equity is not merely “more simulation.” Its best play depends on impartial circumstances, partial
knowledge, preparation, costly time, resource pressure, routes, retreat and consequences that continue without the
company. The maturation path should therefore avoid four attractive mistakes.

1. **Do not turn every process into a quest.** A feud, storm or ruin may remain unresolved or become somebody else's
   problem. Process identity supplies continuity, not an obligation to complete it.
2. **Do not turn salience into prescription.** The runtime supplies reasons an action matters; the client stages
   them. It must remain possible to inspect the whole legal world, leave, wait or pursue an unrelated opportunity.
3. **Do not make every prerequisite implicit.** TADS can silently take or open something before the commanded act.
   Kyr should expose preparation where time, ownership, danger or commitment makes it meaningful.
4. **Do not require total physical simulation.** Typed transformations should cover consequential distinctions.
   Authors need an explicit boundary for what a work leaves abstract, not an ever-growing ontology of every noun.

This last point suggests an additional authoring affordance: a declared **adjudication boundary**. A module should be
able to say that a prop is scenery, a journey is abstract between named interruptions, or a conflict has authored
factors rather than tactical positions. Lint can then distinguish an intentional abstraction from a forgotten
affordance.

## Verification should mature at three levels

The current project has unusually strong deterministic tests and long journeys. They should be organised by the kind
of claim they can establish:

| Level | Question | Suitable evidence |
|---|---|---|
| Mechanistic | Does one construct lower and execute correctly? | probes, property tests, catalog-wide effect tests |
| Causal/campaign | Can states and processes reach coherent outcomes over time? | model checks, schedule analysis, autoplay, kept journeys |
| Experiential | Can an unaided player perceive, intend and understand it? | ordinary browser play, reach/choice/aftermath measures |

Compiler validity does not establish reachability; autoplay reachability does not establish salience; a staged
builder journey does not establish independent comprehension. The register already distinguishes some of these in
practice. Making the levels explicit would prevent a typed declaration or passing journey from being treated as proof
that the authored experience works.

## Ten authoring affordances

### 1. A complete causal trace and `why-not`

This is the highest-leverage **extension of an existing tool**, not a greenfield feature. `kyrie inspect` already
answers the present-tense action question well: after playing supplied steps it says whether a matching grounded
action is offered and how the page exposes it; otherwise it ranks the nearest bindings, prints their failed
predicates, expands a failed query, names relevant facts that hold instead, and reports a decrease that would take a
count below nothing. `test/inspect-tool.test.ts` proves each of those cases. The remaining gap is historical and
causal: why the world came to have those facts, which rules actually ran in a watch, why one ran before another, and
which source declaration produced a lowered rule or effect.

A large share of the recorded cost came from an absent action or late rule whose conditions looked correct:
`keeps(group, item)` did not satisfy `carries(group, item)`, passage-opening rules ran before the fact that opened
them, and fallback verdicts preceded specific verdicts in another file. The first class is now often diagnosable by
`inspect`; the latter classes are not.

#### Author affordance

```text
bin/kyrie inspect campaign.json "Assay the stone" --steps before-gate.json
bin/kyrie trace save.json --watch 431
bin/kyrie trace save.json --fact admitted(party)
bin/kyrie trace save.json --rule council_rejects
```

Do not add a synonym such as `why` merely to imitate Inform. Extend `inspect` to show source locations and, where
useful, all requirements rather than only the nearest failures. It already reports effect admissibility. For example,
its current form can explain the equivalent of:

```text
help_ned was not offered

Requirements all hold.
Effect simulation failed:
  Decrease regard(mallory) by 2
  current 1; proposed -1; minimum 0
Defined at gosse/green.kyr:143
```

A watch trace should show actual runtime phases, rule bindings, predicate values, effects, perception and narration,
including a fact's provenance. It must expose actual execution rather than reconstruct a plausible explanation after
the event.

Static lint should additionally report:

- shadowed and evidently contradictory endings;
- an uncovered verdict or ending fallback where the relevant state space is finite;
- fallback-shaped rules ordered before rules that establish their latch;
- an `opening when` dependent only on a fact asserted later in the pass;
- unanchored speech in a shared country;
- effects which can fail after their explicit requirements pass;
- taught abilities unavailable from the loaded catalog.

#### Friction addressed

The existing command already addresses silent action refusal and reversed or misunderstood relations. Its trace
extension would address invisible manifest order, Low Water's late gate, Parliament's petition-and-seat lag,
unreachable endings, and journey failures discovered several assertions after the wrong choice. It does not itself
change those semantics; it makes them observable and cheap to diagnose.

### 2. Typed transformations

Kyr has generic fact effects and specialised resolvers. Authors, lint and narration nevertheless need to know that a
change is a movement, placement, transfer, payment, creation or social reassignment rather than an arbitrary pair of
assertions and retractions.

#### Author affordance

```kyr
Move party to oubliette.
Place keepers_ring in ring_socket.
Set down ninth_heart at assayers_gate.
Give bridge_token to first able member of party.
Give any weight_stone carried by party to assayers_pan.
Destroy letter.

Measure regard(person) from 0 to 10.
Pay 8 coin from party.
Lower regard(mallory) by 2.
Increase regard(mallory) by 2 to at most 10.
```

These effects may lower to ordinary facts, but their identity should survive into lint, the event log and narration.
`Move party to oubliette` makes the destination reachable to lint, performs exclusive-location maintenance, records
involuntary movement and triggers arrival perception. It avoids inventing a false passage solely to satisfy the
reachability checker. `Place` transfers a particular item from its carrier or prior location without destroying it,
repairing the fiction of a ring simultaneously carried and set in a lock.

`Pay` should be a strict admissibility condition; insufficient coin withholds the action. `Lower` should clamp at a
declared floor. This separates the correct behavior of a price from the wrong behavior of displeasure silently making
an action impossible.

Runtime stock should distinguish fungible quantities from identified objects:

```kyr
Stock torches "torches" of torch_kind at chandler quantity 12.
Create one torch from torches for buyer.
```

Identity should be instantiated when an individual enters persistent play, not because a shop nominally holds twelve
interchangeable torches.

#### Friction addressed

Typed transformations address Thrume's oubliette and socketed relics, The Third Night's rules unable to give items,
Low Water's payment with any carried item of a kind, group custody versus member packs, bare `Take` workarounds,
strict decreases used for non-cost state, reachability lint, runtime stock and item stacking. They do not decide who
witnesses a transfer or how a move is narrated; later items supply those semantics.

### 3. First-class semantic affordances

The playtests repeatedly find a vivid noun followed by a generic verb. A smith works, people shout to a boat, ruts
cross mud, or a child is visibly ill, but ordinary play offers only Talk, Search, Buy or leave. Observations should be
able to expose kinds of attention without defining a bespoke button unrelated to the action model.

#### Author affordance

```kyr
Observe muddy_cart at yard
  when cartPassed(yard)
  "Fresh cart-ruts cross the yard. Bolt has black mud on one forepaw."
  affords tracking cart_trail, asking bolt_mud, examining ruts
  teaches cart_evidence.
```

An affordance links perceived evidence to a reusable action family. A deliberately small initial vocabulary would
cover the needs already demonstrated: `examine`, `track`, `ask`, `assist`, `interrupt`, `use`, `read`, `listen`,
`work`, `perform`, `treat`, `survey`, `bargain` and `test`.

Different capabilities may disclose different readings of the same situation:

```kyr
Affordance old_wound treating child
  noticed by capable(viewer, medicine)
  "The flush begins at the wound, not the fever.".

Affordance false_joinery examining door
  noticed by capable(viewer, lockwork)
  "The plate is decorative; the hinge carries the lock.".
```

Every applicable action should carry computed projection reasons:

- **Immediate:** answers visible activity, danger or a short clock;
- **Aim-serving:** advances or prepares for a current intention;
- **Revealing:** may form or materially revise an intention;
- **Reference:** legal but routine, familiar or inventory-level.

These are not author-supplied ranking numbers. They are provenance: which observation exposed the action, which aim
it serves, and which pressure it answers. Presentation can stage the first three and leave the complete legal set one
deliberate inspection away.

#### Friction addressed

This addresses observations that promise unsupported interaction, class identity that does not steer ordinary play,
generic Search where a specific feature is evident, natural verbs absent from the choice surface, aims that live only
in Notes, and crowded scenes where all legal commands are peers. It does not create outcomes automatically; authors
or shared rules must still say what tracking, treating or performing can accomplish.

### 4. Situation composition by extending `Occasion`

Current Kyr already has `Occasion`, timed matters, `Chapter`, `Promise`, `Objective` and `Ending`. The natural next
step is to let an occasion describe a whole perceptible activity rather than add a disconnected situation engine.

#### Author affordance

```kyr
Occasion callows_disputation "Callow's disputation"
  at cheaping when fairOpen(pellam) and not decided(callow_question) {
  Participants callow as questioner, harker as opposed, crowd as witness.
  Opens "Callow turns from the Glove Post and calls you into the ring.".
  Pressure until hour(clock) >= 13
    "The crowd will break for the bear-baiting at one.".

  Matter promise_same "Is a promise the same promise when called in?" for 10 minutes {
    Answer reeve_answer "Stand by the promise.".
    Answer callow_answer "No past self can bind the present one.".
    Answer distinguish_answer "Ask what was understood then." requiring lore.
  }

  Resolves when answered(callow_question).
  Aftermath callow_answered.
  Closes "Callow bows to the answer and the ring breaks apart.".
}
```

The form should lower into ordinary active-occasion, matter, deadline, participation and outcome facts. It should add:

- participants and their roles;
- an opening or invitation, giving important NPCs modest initiative;
- visible pressure and comparison with action duration;
- answers/interventions belonging to the matter that raised them;
- an explicit resolution condition;
- one or more aftermath surfaces.

An action longer than a visible pressure should remain legal where appropriate but acquire its consequence in its
label: “Wait an hour — the owlbear will attack before you finish.”

Aftermath should be perceptible, not merely a completion flag: a greeting, price, absence, report, opened way,
invitation, obligation or visibly settled quiet. Lint can require at least one aftermath surface for a significant
occasion while allowing deliberately private or inconclusive events to say so explicitly.

#### Friction addressed

This addresses hearings assembled from disconnected topics and rules, questions whose answers do not belong together,
performances with no first-class recurrence or audience, NPCs who act only when selected, urgency represented in the
simulation but not the choice hierarchy, and resolutions that produce “Nothing more is asked of you.” It does not by
itself simulate Thrume's war; an offscreen conflict needs typed factors and outcomes, not counterfeit party combat.

### 5. Explicit rule composition

Three problems recur: manifest order determines rule order, logical defaults look like ordinary rules, and some
derived changes lag a watch. Kyr should expose a small amount of causal structure without reproducing Inform's large
rulebook surface.

#### Author affordance

Use a few named phases:

```kyr
Rule admit_bell during reactions when ...
Rule open_gate during consequences when ...
Rule council_rejects during defaults when ...
```

Allow rare explicit dependencies:

```kyr
Rule seat_index after petition_index when ...
```

Avoid arbitrary numeric priorities. `priority 37` merely exchanges manifest order for an undocumented number line.

Give fallbacks first-class meaning:

```kyr
Rule council_rejects otherwise for verdict(council)
  when remedyProposed(council) says "The council rejects it." {
  Assert rejected(council).
}
```

Purely current-state meanings should be queries, not event rules that mirror one fact into another. Passage openings,
visibility and similar derived constructs should be recomputed to stability after command effects and consequence
phases. Narrated event rules should not all run blindly to a fixpoint: that invites repeated prose, nontermination and
surprising intermediate events.

#### Friction addressed

This addresses Low Water's opening rules preceding admission, Parliament's petition-and-seat delay, fallback verdicts
pre-empting later files, first-match ending hazards and cross-file rule chains that briefly expose inconsistent state.
It does not abolish order; it gives the necessary order names, dependencies and diagnostics.

### 6. One knowledge, perception and communication model

Kyr correctly refuses arbitrary `Assert knows`: a world fact should not become player knowledge merely because a rule
changed. Current `Rule/Event … teaches` repairs an important earlier gap. The remaining work is to preserve source,
channel and moment, and to use one viewer-relative projection everywhere.

#### Author affordance

Extend teaching events with provenance:

```kyr
Event rememberer_explains at shrine
  when saltReturned
  source rememberer to party by speech
  teaches thrume_nature
  "The Rememberer closes their hand around the salt...".
```

The learned record should retain who or what supplied it, where, when and by which channel. Channels should include
speech, writing, gesture, signs, demonstration, report and inference. This lets Hush matter without forcing signed or
mediated communication into `Says`.

Keep scene text separate from the lasting journal summary. In the moment, tell the event or observation; afterward,
Notes use the discovery summary. Teaching must not make a `not knows(...)` condition false before its own scene text
is rendered.

Every surface must use the same viewer-relative entity projection:

```text
perceptible(entity, viewer)
nameOf(entity, viewer)
roleOf(entity, viewer)
```

Room prose, greetings, talk choices, warnings, combat, patience clocks and interpolated text must not each decide
visibility or naming separately. This completes the current `Seen when` and `Known as` work and prevents a hidden hob
from greeting, or “Bramble” appearing in a warning before the name is learned.

Finally distinguish where an event occurs from where it is perceived:

```kyr
Event chair_crashes at chair_room audible within house when ...
```

News that travels later should be a report derived from the event, not an unanchored rule heard across the world.

#### Friction addressed

This addresses source-less discoveries, scene text replaced by journal text, knowledge and dialogue requiring separate
clicks, hidden people or names leaking through secondary UI, speech as the only conversational medium, events spent
offscreen, and global circus news. Concealment should also accept an ordinary predicate—`hidden when not
state(left_lid, pressed)`—because not every secret is a knowledge fact.

### 7. Dynamic identity, office and place

Conditional `Role` now handles part of the earlier fixed-at-load complaint. It does not yet make a discovered name,
a coup, an institutional office or a travelling circus a first-class change in the world.

#### Author affordance

Names remain viewer-relative while entity identity remains stable:

```kyr
Person crowned_figure "Ardath" at tomb {
  Known as "the crowned figure" when not knows(viewer, ardath_name).
  Known as "Ardath" when knows(viewer, ardath_name).
}
```

Institutional offices need addressable semantics:

```kyr
Office thane of hold.
Initially Assign eadred to thane of hold.
Assign skarn to thane of hold.
Depose eadred from thane of hold.
```

Generic rules can then derive authority, titles, access, obligations and NPC conduct. This should build on Mission
18's canonical institution identity rather than create module-private offices that generated residents cannot share.

Portable areas would solve the circus directly:

```kyr
Place circus "Wapshott's Peregrine Circus" is portable encampment.
Pitch circus within fair_town at 3, 2.
Move circus within rest_town at 1, 4.
```

Internal rooms and occupants retain identity and topology; external entrances, parent context, weather and map
placement change atomically. Only declared portable areas may move.

Offstage existence should also be explicit:

```kyr
Person sallow "Madame Sallow" nowhere { ... }
Bring sallow onstage at cookhouse.
Remove sallow from play.
```

`nowhere`, permanently removed and merely unknown are different conditions.

#### Friction addressed

This addresses Ardath never becoming Ardath, Skarn's coup changing prose but not authority, roles and institutions
that do not affect conduct, the circus duplicated into fifteen rooms, characters parked on roads before entering the
story, and parent-sensitive place names. Whether the company learns of a coup remains a knowledge/perception matter.

### 8. Narrative transactions and causal telling

Several apparently separate bugs have one cause: direct effects, triggered rules, teaching, results and scene refresh
are narrated from different snapshots. This produces consequence-before-act, duplicate speech, a journal summary
before its revealing scene, harmless news interrupting timed work, and disagreement between `page` and `told`.

#### Runtime affordance

Treat every command as a semantic transaction:

```text
intent
→ direct commit
→ immediate consequences
→ perceived knowledge
→ outcome
→ changed scene
→ deferred news
```

The default telling order should be act, immediate result, reactions, discoveries, changed scene, then remote or later
news. Authors may override a local case, but should not normally coordinate this with extra latches.

Events need interruption policy:

```kyr
Event funeral ... notice after action.
Event owlbear_attack ... interrupts action.
Event distant_news ... notice on next pause.
```

Danger, relocation, incapacity or invalidation of a command may interrupt. Remote news should normally queue until a
timed action completes rather than silently close a route by aborting a search.

Repeated description should be declarative:

```kyr
Observe bridge at bridge_end when true
  First "The whole city narrows here..."
  Again "The bridge stands above the brown water.".
```

The same pattern applies to greetings, farewells, performances and recurring incidents. Authors should not need
`visitedBefore` facts and paired observations for every transit room.

Browser, terminal and journeys should consume one ordered stream of semantic narration events. Rendering may differ,
but an action result shown on the page must not disappear from `told`. Tests should be able to assert source and event
kind rather than exact curly-quoted text.

#### Friction addressed

This addresses Thrume's consequence-before-act report, teaching summaries replacing scenes, duplicate rule text,
Parliament's funeral aborting a library search, repeated full descriptions, people introduced twice, hidden greetings,
endings reached inside waits, omitted wait events and `page`/`told` disagreement.

### 9. A small library of proven authoring patterns

The friction reports now provide repeated evidence for several constructs. They should lower into ordinary facts and
rules rather than become a second runtime.

#### Warning and grace

```kyr
Warns after 1 watch "The Assayers lower their staves."
  unless admitted(party).
```

This establishes a visible deadline on first perception, temporarily preserves tolerance, clears when the company
leaves, and matures into the declared pursuit or attack. It replaces copied measures and latches in several encounters.

#### Dates and recurrence

```kyr
Every 6 watches while alive(thrume) { ... }
At 10:00 on day 4 { ... }
Daily at 19:00 while pitched(circus) { Begin show. }
Time until 19:00.
```

Occurrences should be identity-keyed and linted for impossible dates, accidental endless recurrence and collision
with endings.

#### Directional passages

```kyr
Passage gate_climb between yard and tower {
  From yard needing climbing or rope "Climb the gatehouse";
  From tower "Climb down inside the wall";
}
```

Per-end labels, descriptions, conditions, needs, costs and risks repair asymmetric climbing, Thrume's one-sided dust
and Wapshott's way down. A bridge toll belongs to crossing semantics rather than a watcher rule after arrival.

#### Containers and kind-bound transfer

```kyr
Thing pan ... {
  Accepts one item of weight_stone.
  On receive ?stone { ... }
}
```

This formalises Low Water's effective but undocumented `Holds` idiom.

#### Promises, questions and outcomes

The current `Promise` should grow source, acceptance, deadline, evidence of fulfilment and perceptible report. A modest
`Question` could group evidence and supported conclusions without solving mysteries automatically. A typed `Verdict`
could make exhaustive, ordered outcomes easier to lint than seventeen unrelated first-match endings. An offscreen
`Conflict` could name participants, relevant factors and authored outcomes without pretending armies use party combat.

#### Friction addressed

These patterns address copied hostility clocks, hand-latched calendars, no modulo or period form, asymmetric passages,
tolls detached from crossings, spending any item of a kind, hand-built obligation lifecycles, disconnected evidence,
ending coverage and Thrume's collapsed offscreen war. A construct belongs here only after several works have needed
the same semantics.

### 10. Scale ergonomics

At eighty rooms or several thousand lines, namespace, prose and test irritants become structural hazards.

#### Scoped subordinate names and typed relation roles

State names should be local to their thing:

```kyr
state(left_lid, pressed)
state(door, sealed)
```

They need not collide with an entity or another thing's state. Occasion matters, answers and action-local parameters
should likewise be scoped. Global names should be reserved for declarations intended to compose globally.

Relations should declare meaningful argument roles:

```kyr
Relation addressed(speaker:person, audience:group).
Relation owes(debtor:person, creditor:person).
```

This catches semantically reversed arguments even when both arguments share a broad runtime kind.

Current aggregated collision reporting should be supplemented with ownership queries:

```text
bin/kyrie names --owner alarmed
bin/kyrie names --available sealed
```

#### Coverage and prose tools

```text
bin/kyrie coverage data/adventures/thrume
bin/kyrie prose data/adventures/wapshotts-circus
```

Coverage should distinguish authored, offered, chosen and consequential topics/actions, and list endings never reached
by kept journeys. Prose analysis should report repeated phrases, repeated sentence openings, recurring observations
without `Again`, and text shared across generated countries.

#### Stable journey selectors

Journeys should prefer semantic identities:

```text
@action assay_stone
@topic isaura_answer
@go assayers_gate
@until admitted(party)
@expect learned ledger_of_water
@expect said-by quill_prices /.../
```

A label selector matching more than one choice must fail immediately and list the matches. This avoids choosing another
person's similarly worded topic, labels changing when a name is learned, odds appended to labels, generic `Take` or
`Examine`, and typography-sensitive assertions.

A first-class transcript command should include time, stable command ID, events during waits, interruption status,
rendered page and optional causal trace. Scaffolds for a person, occasion, promise or investigation should contain a
small tested interaction rather than an empty declaration.

#### Friction addressed

This addresses namespace minefields, reversed relations, brittle regex journeys, source labels unlike page labels,
faults found only after scratch transcript scripts, large amounts of dialogue never offered in ordinary play, repeated
authorial tics and the cost of learning patterns by reading several mature adventures.

## Recommended implementation sequence

The dependencies argue for this order:

1. **Finish `inspect`, then add causal provenance.** Document its existing action diagnosis, add source identity, and
   trace actual rules, watches and facts without creating a competing `why` command.
2. **Typed transformations.** Give movement, placement, transfer and payment semantic identities that trace and lint
   can understand.
3. **One viewer-relative projection.** Make visibility, naming and role consistent across every surface.
4. **Knowledge provenance and narrative transactions.** Preserve source/channel and tell an action in causal order.
5. **Explicit defaults and stable derived constructs.** Remove reliance on manifest order for logical meaning.
6. **Semantic affordances and projection facets.** Connect authored observations, aims and pressures to the choice
   surface.
7. **Extend `Occasion`.** Compose initiative, pressure, interventions, resolution and aftermath.
8. **Add only the repeated patterns proven across adventures.** Warning grace, recurrence, directional passages and
   typed verdicts are the strongest candidates.
9. **Dynamic offices and portable areas.** Build them on canonical shared identity rather than local display state.
10. **Coverage, prose and IDE-scale tooling.** Use the semantic identities established above.

The smallest valuable tranche begins with a documentation-and-retention pass: publish the capabilities already in
`inspect`, knowledge provenance, `Occasion`, narrative events, journeys and the studio CLI; then preserve their source
identities through lowering. Only after that audit should new syntax be chosen. This both yields immediate value and
prevents new declarations from duplicating mechanisms that already exist. Items 2–7 remain the first substantive
language tranche through the first extension of `Occasion`.

## Acceptance criteria

Language work should be judged in existing adventures, not only probes:

1. **Absent-action diagnosis:** each historically silent action failure can be explained by `kyrie inspect`, with a
   source location and no runtime-source reading; current supported cases remain unchanged.
2. **Single transition:** Thrume's oubliette and socketed relic each use one typed effect and require no lint-only
   fictional passage or duplicate possession fact.
3. **Viewer consistency:** an unseen or unnamed person cannot appear by true name in greetings, warnings, talk,
   combat or patience text.
4. **Teaching integrity:** a taught discovery shows its scene once, records its source/channel, and thereafter shows
   its summary without an extra click.
5. **Rule causality:** Low Water's gate and Parliament's petition/seat settle in the same command without manifest-file
   tricks, and the trace explains why.
6. **Affordance continuity:** a dog-and-ruts observation exposes tracking, says which aim it serves and remains a legal
   runtime action rather than a presentation invention.
7. **Pressure:** no action longer than a visible threat clock is presented without stating that the threat matures
   during it.
8. **Occasion:** one existing hearing or performance declares participants, initiative, matter, resolution and
   aftermath together, with fewer hand-authored latches and topics.
9. **Return:** resolving a substantial situation causes a declared perceptible aftermath before generic navigation on
   return.
10. **Journey stability:** kept journeys select important actions by semantic identity; ambiguous prose selectors fail
    at the point of ambiguity.

## Final assessment

Kyr should not compete with Inform by becoming a more English-like parser language, nor with Ink by scripting every
present choice. Its opportunity is systemic literary adventure: authored circumstances that remain coherent while
time, place, party, knowledge and independent actors recombine.

The core is capable of this now. The strongest adventures demonstrate breathing places, conditional perception,
guest-right, public argument, promises, institutions, persistent mechanisms, offscreen events and exact replay. The
cost is that authors still too often act as the integration layer among those systems.

The next generation of Kyr should make fictional causality the unit the language understands. A movement should be
known as a movement, teaching as communication from a source, a public dispute as one occasion, a deadline as pressure
on every longer action, and a resolution as something with an aftermath. Once those meanings survive from source
through runtime and presentation, Kyr's constraint becomes its advantage: authors state less, while the world can
reliably do more with what they state.
