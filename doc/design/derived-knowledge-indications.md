# Deriving knowledge indications from module behavior

*Review, 21 November 2026.*

This report treats the knowledge boundary in depth. The wider audit of similar coupling in observations, actions,
objectives, consequences, rule lifecycles, and provenance is `doc/design/kyr-semantic-boundaries.md`.

## Finding

The atlas should not depend on an author declaring that an interaction is blue, educational, or otherwise worthy of a
knowledge indication. It should derive that indication from the interaction's possible effect on the company's
knowledge in the current world.

For actions and topics, Kyr already contains the necessary semantics. An action whose successful execution adds a new
`knows(actor, fact)` can be recognized as an opportunity to learn. `ChoiceGrouping.teaches` does exactly this, including
the important qualifications that the fact is not already known and is not merely a record of something the same
action just made true.

The remaining `teaches` syntax is not, however, merely redundant metadata over such an effect. For an `Observe` or a
speaking `Rule`, it is currently the only instruction that causes knowledge to change. Observations have no effects,
and rules are forbidden from asserting `knows`. `Perceptions.witness` reads `Observation.teaches` and
`WorldRule.teaches` and manufactures the corresponding `knows`, `witnessed`, `readIn`, or `toldBy` changes. Consequently
the engine cannot presently derive those cases from execution: without `teaches`, their execution contains no
knowledge effect to discover.

The desired change is therefore not better text inference. It is to make perception and speech have ordinary,
inspectable semantic effects, and then derive every indication from those effects.

## Present boundary

There are three different mechanisms under one word:

1. **Explicit action effects.** Topics and actions may assert `knows(actor, fact)`. The UI derives `Choice.teaches` from
   their success changes. This is already behavior-derived.
2. **Triggered observations.** An action can assert a state such as `state(tablet, read)`. `Teaching.shows` searches for
   an authored observation whose condition includes that state and whose `teaches` field names a fact. This is a
   partial, static reconstruction of the perceptual consequence.
3. **Passive perception and speaking rules.** When an observation is seen or a speaking rule is heard,
   `Perceptions.witness` turns its `teaches` field into engine-owned knowledge. Here `teaches` is an executable effect,
   despite being represented as a property of prose.

The data corpus makes the third mechanism substantial rather than exceptional: there are currently 459 authored or
generated `Observe ... teaches ...` forms and 76 `Rule ... teaches ...` forms across 199 Kyr files. Generated features,
zones, tracts, faiths, careers, documents, searches, and discoveries also emit the form. Removing the word without
replacing its semantics would stop those facts from ever becoming known.

Presentation then consumes the same field for concerns other than color: narration budgeting, journal wording,
knowledge provenance, aim routing, dependent discovery, old-name audits, expedition contracts, and author lint. This
is evidence that the field is standing in for a missing first-class information-flow edge, not that each consumer
should independently inspect prose.

### Evidence in the implementation

The direct-action case is already the model the rest should follow:

- `ChoiceGrouping.withheld` asks `ChoiceGrouping.teaches(action.success, world)` before adding the projected boolean
  `Choice.teaches` (`src/ui/choice-grouping.ts:281-305`).
- `ChoiceGrouping.teaches` looks for an asserted `knows`, refuses a fact already known in the current world, and tries
  to exclude knowledge that merely records another effect of the same action. The test
  `test/small/aspect-truth.test.ts:57-74` demonstrates both sides: Annis's topic is blue while `owed` is unknown and
  loses the indication when `owed` is initially known.
- `Aspects.of` converts the projected semantic result into `knowledge`, and only `Emphasis` maps that aspect to blue.
  Thus neither Kyr nor the action projection names a color.

The indirect reading case shows why the present system falls back to `teaches`. In
`test/small/blue-truthful.test.ts:19-47`, “Read the strokes on the wax tablet” only changes the tablet from `shut` to
`read`. A separate observation becomes true in the `read` state and names `oak` with `teaches oak`. The action does not
assert `knows`, so `Teaching.shows` searches teaching observations for a positive condition call matching the action's
asserted state (`src/ui/teaching.ts:12-29`). After the command, `Perceptions.witness` sees that observation and creates
the real `knows(party, oak)` change (`src/campaign/perceptions.ts:14-34`). The test proves that the row is blue before
the command and that `knows` holds afterward—but those two results currently come from two separate readings of the
same author field.

The speaking-rule case is more direct. `test/teaching-words.test.ts:16-32` defines a rule whose effect block is empty:

```kyr
Rule bell when watch(clock) >= 1 and not knows(party, bell_rang)
  says "Somewhere across the yard a bell rings, once."
  teaches bell_rang { }
```

Despite the empty block, the company learns `bell_rang`. `Perceptions.witness` manufactures that effect when the rule's
event is heard. The compiler also prohibits the rule from expressing the equivalent effect itself: `knows` belongs to
`EngineOwned.rules`, and `ModuleCompiler` directs authors to use “says ... teaches fact” instead
(`src/lang/engine-owned.ts`, `src/lang/module-compiler.ts:98-112`). In other words, `teaches` is currently executable
syntax disguised as descriptive annotation.

There is already a second, more structural information model in `data/rules/discovery.kyr`:

- `reveals(source, fact)` records the content relationship;
- `examine` requires a noticeable, intact, accessible source and asserts `knows(actor, statement)`;
- `ask` requires testimony, an informed speaker, and an unknown statement, then asserts `knows` and `toldBy`;
- `tell` transfers an established, non-stale fact between trusting actors.

Those actions are automatically classifiable from their effects. They demonstrate that authoring provenance and
content as world relations is enough; no separate atlas annotation is needed.

### What the corpus count does and does not mean

The 535 forms above are syntax occurrences, not 535 distinct hand-authored design decisions. Some are emitted by
generators or by higher-level sugar such as `Discovery`. That strengthens rather than weakens the architectural point:
the compiler and generators already know many of these information relationships structurally, then flatten them into
the same `teaches` field that hand-written observations use. A migration should change the compiled representation and
generators first, not ask authors to mechanically replace hundreds of words with another word.

The unrelated world relation named `teaches(group, ability)` in `data/rules/belongings.kyr` concerns training. It is an
ordinary fictional relation and should not be renamed or included in this migration. The target is specifically
`WorldRule.teaches`, `Observation.teaches`, and the projected `Choice.teaches` boolean.

## The derivation the engine should expose

The useful question is not “does this text contain information?” It is:

> If the company performs this available interaction in this world, can the settled result add a previously absent
> knowledge fact, and what perceived source accounts for it?

Call the answer an **epistemic delta**. It should be computed over canonical changes, after perception and rule
settling, and contain at least:

```ts
interface EpistemicChange {
  knower: string;
  fact: string;
  provenance: 'witnessed' | 'read' | 'told' | 'inferred';
  source?: string;
}
```

`provenance` should be a typed semantic result, not reconstructed from presentation categories after the fact. The
current implementation infers `readIn` from `Observation.aspect === 'reading'`, `toldBy` from `aspect === 'hearsay'`,
and otherwise writes `witnessed`. That makes an observation's narrative layout category choose a canonical world
record. The replacement should let a compiled perceptual consequence say what kind of acquisition it is, while the
author-facing construct normally supplies that through `Source`, `Reading`, testimony, or observation kind.

An offered choice has the knowledge aspect when its prospective settled delta contains a new `knows(company, fact)`.
After execution, the journal and feedback use the actual settled delta. Atlas color remains a presentation mapping from
the derived `knowledge` aspect; it never reads module syntax directly.

This retains several distinctions the current implementation correctly cares about:

- Reasserting an already-known fact is not something to learn.
- Learning a fact is different from recording the action's own accomplishment.
- A reading, testimony, witnessed sign, and inference may all produce `knows`, while retaining different provenance.
- An action which merely exposes an observation can be recognized through the settled perceptual consequence rather
  than by matching one asserted call against an observation condition.
- Darkness, notice capabilities, bindings, locality, and superseded observations remain part of whether the
  consequence can actually be perceived.

## Normalize perception before deleting syntax

The clean internal model is for perceived content to carry effects just as actions do. For example, the compiler could
lower an observation to an internal form resembling:

```ts
{
  id: 'tablet_learned',
  when: state(tablet, read),
  text: 'The count of oak cut by night.',
  onPerceived: [
    Assert knows(perceiver, oak),
    Assert readIn(perceiver, oak)
  ]
}
```

A speaking rule would similarly carry an `onHeard` effect. These effects should remain engine-owned: an author should
not be able to forge arbitrary knowledge or provenance records. They can be produced by compiler lowering from a
content relationship such as a discovery source, or by a narrowly typed perceptual effect—not by unrestricted rule
changes.

Kyr already has a promising higher-level model. A `Discovery` creates a fact and source entities, and the core rules
use `reveals(source, fact)` to make examining or hearing a source assert `knows(actor, fact)`. This is closer to the
right boundary: content declares that a source reveals a fact; knowledge acquisition and presentation follow from the
generic rules. The remaining observation and speaking-rule forms should converge on the same model.

This does not require preserving the word `teaches`. Possible author-facing forms include a typed `reveals fact`, a
source attached to a `Discovery`, or an observation explicitly `of fact`. The important point is that the authored
relationship is fictional content—this sign or testimony is evidence for this proposition—not an atlas instruction.

Some explicit relationship must remain wherever later mechanics refer to a stable proposition. Natural-language
scanning cannot reliably decide that two differently worded lines convey the same fact, distinguish a newly learned
truth from ordinary feedback, or preserve behavior through rewriting and localization. That relationship can often be
generated structurally, but it cannot in general be recovered from prose alone.

### Do not replace one boolean with another

Renaming `teaches` to `reveals` on every observation without changing the compiled representation would improve the
English but not the boundary. Presentation and aim code could still become coupled to the new property. The compiled
module should instead contain an engine-owned consequence, for example:

```ts
interface KnowledgeConsequence {
  fact: EntityId;
  knower: 'perceiver';
  provenance: 'witnessed' | 'read' | 'told' | 'inferred';
  source?: EntityId;
}

interface Observation {
  // existing perception fields
  consequences?: KnowledgeConsequence[];
}
```

This is intentionally narrower than arbitrary `Change[]`. An observation should not become a back door through which
authors can change the clock, move people, grant inventory, or forge another actor's knowledge. The compiler is allowed
to produce the consequence from trusted authoring constructs; the settlement engine alone instantiates `perceiver`,
checks novelty and applies canonical provenance records.

Speaking rules need the same treatment, but the consequence is conditional on actually hearing the event. An unanchored
rule may happen while the company is elsewhere; its world effects still occur, but its `onHeard` knowledge consequence
must not. This is why lowering `teaches` into the rule's ordinary effect block would be wrong. The effect belongs to the
perception event, not merely to the rule firing.

## Problems in the current derivation

### 1. Direct action analysis is a useful heuristic, not a semantic delta

`ChoiceGrouping.teaches` only inspects the declared success changes. It does not run settlement. This has several
consequences:

- A failure branch that reveals something is not considered.
- A conditional or alternative result beyond the selected `success` list is not considered here.
- Knowledge produced by a rule that answers the action is invisible unless another heuristic finds it.
- Its “fact made by the same action” exclusion gathers every argument of every non-learning assertion into one set.
  This can suppress a genuine lesson merely because the same fact identifier occurs as an argument to an unrelated
  record. The code is defending against a real false positive, but entity occurrence is not equivalent to “the action
  made this proposition true.”
- It asks whether *some* `knows` is added, without returning which fact, recipient, source, or branch supplied it.
  Downstream consumers therefore have to rediscover those details independently.

**Mitigation:** make the analysis return structured deltas per outcome rather than a boolean. Determine “knowledge of
one's own deed” from an explicit record/proposition relationship or provenance, not from shared string arguments.

### 2. `Teaching.shows` can over-promise

`Teaching.shows` collects every positive call under an observation's `and` predicates, then marks an action if any
asserted success call matches any collected call. It does not test the whole observation predicate in the post-action
world.

For an observation conditioned on:

```kyr
state(tablet, read) and capable(party, lore) and not benighted(party)
```

an action that asserts only `state(tablet, read)` is classified as teaching even if the company lacks lore or is in
darkness. The actual perception pipeline may withhold the observation, so blue can promise learning that will not
occur.

**Mitigation:** apply the grounded branch to an immutable world, run the same local-observation selection used after a
real command, and test the complete predicate and perception constraints. Never infer an enabled observation from one
matching conjunct.

### 3. `Teaching.shows` can miss real learning

The extractor deliberately traverses only calls and conjunctions. It cannot recognize an action that enables a
teaching observation by:

- retracting a fact required under `not`;
- increasing a measure past a comparison threshold;
- satisfying one branch of an `or`;
- producing two changes whose combination satisfies the condition;
- causing a speaking rule, which then causes another rule or observation;
- moving the company or a perceived subject into the relevant locality;
- enabling knowledge on a later settlement pass.

`Perceptions.settle` explicitly performs up to three learn-and-answer passes (`src/campaign/perceptions.ts:36-57`), so
the actual engine acknowledges chains the preview heuristic cannot see.

**Mitigation:** preview the same settlement transition used by execution. If a full preview is initially too expensive,
extract a pure perception reducer and use it after applying each grounded outcome; do not expand the predicate-pattern
heuristic piecemeal.

### 4. One field controls unrelated policies

`teaches` currently participates in at least four different decisions:

- canonical acquisition of knowledge;
- prospective opportunity coloring;
- whether scene prose is “bearing” and exempt from ordinary sentence budgeting;
- where an aim believes its awaited fact can be found.

These decisions overlap, but they are not identical. A fixture can convey historical knowledge without deserving to
break the scene budget; `SceneBudget.bears` already contains an exception for fixture, feature, weather, and ambience.
A known fact still has provenance and narrative importance even though it should no longer color an action blue. An aim
needs a route to a source, not merely the fact that some line somewhere can teach it.

**Mitigation:** split the concepts:

- `KnowledgeConsequence` says what perception can add to the world;
- observation `aspect` and an explicit narrative-bearing policy control scene budgeting;
- source/location relations (`reveals`, `at`, `testimony`) support aim routing;
- `EpistemicDelta` relative to the current world controls opportunity indication.

### 5. Presentation names leak back into engine semantics

The type `Choice.teaches?: boolean` is semantically better than a color flag, but its name encourages presentation code
to treat “teaching” as a generic property. `Aspects.of` then needs contextual rules about when teaching replaces
exploration. Meanwhile `Perceptions.witness` derives `readIn` and `toldBy` from observation aspects.

**Mitigation:** project `epistemic?: { possible: number; certain: number }` or, if the facts must remain hidden, a
simple engine-owned aspect `knowledge` plus opaque provenance. Presentation should consume `Aspect[]`; it should not
receive or interpret `teaches`. Keep full fact identities on the engine side unless a Notes or journal view is
authorized to show them.

## Prospective analysis, not merely syntax scanning

The pre-action atlas indication concerns a future result, while `knows` is only added after execution. There are two
implementation choices:

1. **Static effect analysis.** Traverse the action's success changes and the perceptual/rule dependencies they may
   enable, then subtract facts already known. This is fast and deterministic, but it must understand predicates,
   bindings, locality, and settling. The present `Teaching.shows` is a deliberately small version and only extracts
   positive calls from conjunctions.
2. **Speculative settlement.** Run the action's deterministic consequences and the perception/rule settling pipeline
   against an immutable copy of the world, then diff knowledge. This gives the most faithful answer but must not roll
   random checks, consume random streams, emit events, or mutate campaign state.

A shared effect analyzer is the safer first implementation. The action system already exposes success and failure
branches, while perception settling is deterministic once a branch is chosen. It can return `certain` and `possible`
epistemic deltas. The design must then decide whether blue promises guaranteed learning or an opportunity to learn. The
current implementation examines only the success branch, so in practice blue means “successful use can teach,” not
“this press certainly teaches.” That policy should become explicit rather than remain an accident of the projection.

### Recommended policy for uncertain outcomes

Blue is described as a promise about an available opportunity, not a guarantee that a check will succeed. Therefore a
choice should receive the knowledge aspect when at least one ordinary resolved outcome can produce a new epistemic
delta and the interaction is genuinely directed at investigation, reading, asking, or noticing. Failure risk should be
communicated by the existing risk/check treatment, not by withholding the knowledge aspect.

However, incidental information in an exceptional failure should not turn an otherwise unrelated action blue. To keep
that distinction deterministic, the action schema or result should classify outcomes as intended versus incidental;
alternatively, use the success/ordinary branches for prospective aspects and include all branches only in actual
post-action feedback. This preserves today's broad policy while making it explicit.

The analyzer should return facts internally even if projection reveals only counts:

```ts
interface ProspectiveEpistemics {
  certain: EpistemicChange[]; // intersection of ordinary outcomes
  possible: EpistemicChange[]; // union of ordinary outcomes
}
```

The actual command path returns a single `EpistemicChange[]`. Both values must be produced by the same reducer.

## Concrete target architecture

The smallest coherent change has four parts.

### A. Compile information-bearing content

Add `KnowledgeConsequence[]` to the compiled forms for observations and heard events. Continue accepting legacy
`teaches fact`, but lower it immediately and discard the token before runtime. Higher-level `Discovery`, document kinds,
generated signs, and testimony should emit consequences or `reveals` relations directly.

Compilation validates that:

- the target is a `fact` entity;
- the fact is established locally or explicitly imported;
- the provenance is compatible with the content form;
- a named source exists and has the appropriate type;
- only the perceiver can become the knower through this path.

### B. Extract a pure settlement reducer

Refactor the knowledge-producing portion of `Perceptions.settle` into a function with no host mutation, event emission,
random consumption, or UI work:

```ts
settlePerception(input: {
  module: Module;
  before: World;
  after: World;
  player: string;
  happenings: Happening[];
}): {
  world: World;
  perceived: CampaignEvent['perceptions'];
  epistemic: EpistemicChange[];
  answered: Change[];
}
```

The live command path commits this result. Preview applies a grounded outcome to a copy and calls the same function.
This removes the dangerous possibility that preview and execution disagree because they implement observation
eligibility or multi-pass answering differently.

If answering rules themselves require host services, split their pure transition selection from committing and
narration first. A preview that stops before the same closure point as execution is not a reliable atlas promise.

### C. Project aspects, not teaching flags

Replace the path

```text
action changes -> Choice.teaches -> Aspects.of(..., teaches) -> knowledge -> blue
```

with

```text
grounded outcomes -> prospective settled epistemic delta -> Aspect.knowledge -> Emphasis -> blue
```

`Choice`, `Act`, promotion, affordances, attestations, and terminal notes should receive the already-derived aspect or a
small epistemic summary. Only the engine analysis sees facts and provenance.

### D. Route other consumers to their real inputs

- Action feedback and the journal use the actual `EpistemicChange[]` from settlement.
- Company knowledge uses provenance records produced by the consequence, not a reverse search through observations.
- Aim advancement indexes `reveals(source, fact)`, source location, testimony, and action effects.
- Scene budgeting uses observation aspect plus an explicit bearing classification; it does not use prospective color.
- Author lint validates unreachable or losable knowledge consequences, including heard-at rules, against compiled
  consequences rather than syntax.
- World audits and expedition contracts query the information graph, not `.teaches` fields.

## Performance and caching

A full speculative play session per visible row would be excessive. The proposal does not require that.

Cache compiled dependencies from relations and predicates, but use them only to select candidate observations and
rules. For each grounded action branch:

1. apply its small change list to an immutable `World`;
2. reevaluate only candidate perceptions whose dependencies intersect changed relations, locality, light, or player
   capability;
3. run the bounded knowledge/answer closure;
4. diff the player's `knows` relation.

Cache the result by module identity, world revision, grounded action identity, and outcome definition. Invalidate on
world revision. This retains semantic evaluation of complete predicates while avoiding a scan of every observation for
every row. Begin without caching in the small tests and measure representative generated worlds before adding indexes;
correctness is the boundary, and dependency indexes are an optimization.

## Compatibility and migration detail

Compiled modules are stored in saves, so this cannot be treated as a parser-only cleanup. Use a staged migration:

1. **Dual-read:** module loading accepts `.teaches` and `consequences`; normalization converts the former to the latter.
2. **Single runtime form:** after normalization, no campaign, presentation, or audit code reads `.teaches`.
3. **Writer transition:** `ModuleWriter` can preserve legacy output for an older format version while current output
   emits the chosen content construct.
4. **Generator migration:** change `Discovery`, region features/zones/tracts, careers, faiths, documents, and scaffolding
   before bulk-editing authored Kyr.
5. **Corpus migration:** rewrite hand-authored observations and rules, using `Discovery` sources where provenance and
   reuse matter and a narrow perceptual consequence where the fact is local and ephemeral.
6. **Save migration:** normalize old compiled `teaches` fields on load and write only the new representation on the
   next save. Keep the migration until the supported-save horizon passes.
7. **Syntax removal:** only after runtime searches find no `.teaches` consumer should the grammar reject
   `RuleTeaches` and `ObservationTeaches`.

Do not bulk-replace the separate training relation `teaches(group, ability)` or catalog vocabulary that genuinely
describes what an item teaches as content; review those individually against the information-source model.

## Verification plan

The migration is complete only if behavior, projection, and negative cases agree. Add or adapt tests for:

1. A topic asserting a new `knows` is knowledge-colored; the same topic is neutral when the fact is already known.
2. A reading that changes state and exposes an observation is knowledge-colored and actually adds the same fact.
3. The same reading in darkness, without a required capability, or with another conjunct false is not promised as
   learning and does not teach.
4. Retraction, measure threshold, disjunction, movement, and a two-pass answering chain are recognized when they really
   lead to knowledge.
5. A failed check that teaches nothing does not produce actual epistemic feedback; a success does.
6. An action that records knowledge of its own newly made state does not become blue merely for that record.
7. A heard-at rule teaches only when heard; firing elsewhere does not.
8. Reading, witnessing, testimony, and inference produce the right provenance without consulting observation aspect.
9. The scene budget and aim route remain correct after compiled `.teaches` is removed.
10. A legacy save/module with `.teaches` normalizes to the same world changes and projected aspects as the new form.
11. No browser, terminal, or map component reads author syntax or independently infers knowledge.
12. A corpus census verifies zero runtime `.teaches` consumers and separately permits the training relation.

The strongest invariant test should enumerate every currently offered grounded choice in representative small and
generated worlds: whenever projection assigns the `knowledge` aspect, at least one previewed ordinary outcome must
contain a new epistemic delta; whenever a previewed ordinary outcome contains such a delta, the projected act that
causes it must expose the aspect unless policy explicitly classifies the learning as incidental.

## Recommended migration

1. Introduce one engine-level `KnowledgeDelta`/`EpistemicChange` analysis used by choice projection, feedback, journal,
   aims, and audits.
2. Represent perception and hearing as typed engine effects (`onPerceived`, `onRead`, `onHeard`) and make
   `Perceptions.witness` apply those effects rather than inspect `.teaches`.
3. Lower existing `teaches fact` syntax into those effects temporarily, preserving saves and module compatibility.
4. Make `Discovery` sources and `reveals(source, fact)` the preferred authoring route, extending them to signs,
   ambient observations, readings, testimony, and inferred conclusions where necessary.
5. Change `Teaching.shows` to ask the common effect analyzer for the prospective settled epistemic delta. Remove its
   condition-call matching.
6. Move narration budgeting and aim routing onto explicit observation kind, provenance, and knowledge dependencies;
   they should not inspect an obsolete authoring token.
7. Migrate generated and authored modules, retain a parser deprecation window, then remove `RuleTeaches`,
   `ObservationTeaches`, and the `teaches` fields from compiled module types.

### Immediate, bounded mitigation if the full refactor is deferred

If the full settlement extraction is too large for the next change, the present false-positive risk can be reduced
without pretending the architecture is finished:

1. Replace `Teaching.shows`' call-intersection test with: apply the grounded success changes to a copy of the world,
   read local observations before and after through `LocalObservations`, and identify newly visible consequences.
2. Return the fact ids rather than a boolean and subtract facts already known.
3. Keep `Perceptions.witness` authoritative for actual acquisition.
4. Add darkness, unmet-conjunct, retraction, threshold, and already-known regression tests.
5. Name this API `previewKnowledge` rather than `teaches`, making its prospective nature explicit.

This bounded step would align readings and looks with actual observation eligibility. It would not solve speaking-rule
chains, provenance coupling, scene-budget coupling, or removal of author syntax, so it should be documented as an
intermediate mitigation rather than the final model.

## Boundary ruling

The user's proposed rule is correct with one qualification:

> Atlas indications should be derived solely from the module's executable semantics and the current world. If an
> interaction's settled execution can add a new `knows` fact for the company, it is knowledge-related; no atlas-facing
> flag is required.

Today, direct action knowledge already satisfies that rule. Observations and speaking rules do not, because their
`teaches` property is secretly their executable knowledge effect. The architectural repair is to expose that effect in
the semantic model and analyze it uniformly—not to infer mechanics from the wording of prose.
