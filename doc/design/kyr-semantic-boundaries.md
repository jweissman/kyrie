# Kyr beyond magical flags

*An ambitious authoring-boundary review, 21 November 2026. The focused knowledge analysis is in
`doc/design/derived-knowledge-indications.md`.*

## Executive finding

Kyr is strongest when an author declares the fictional world and its causal rules, and the engine derives what the
player can perceive, attempt, learn, risk, pursue, and see emphasized. It is weakest when an author must anticipate a
particular engine or interface consumer and attach a flag, choose a magic identifier, or phrase a label so that consumer
will behave correctly.

The distinction is not “structured declarations bad, prose scanning good.” The engine cannot reliably recover stable
facts, identity, causality, provenance, danger, or intention from English. Authors must explicitly model those things.
The healthier boundary is:

> Authors declare fiction, causality, and intentional narrative emphasis. The engine derives operational and
> presentational consequences from those declarations and the current world.

`teaches` is the clearest violation because a property attached to words secretly performs an engine-owned knowledge
change and also drives atlas color, journal provenance, scene budgeting, and aim routing. It is not isolated. Several
other mechanisms show the same family resemblance:

1. observation `aspect` mixes sensory physics, provenance, narration, and page priority;
2. action labels, ids, and namespace shapes sometimes act as an undeclared type system;
3. objectives duplicate their causal structure in `toward` and `route`, while presentation reconstructs further
   dependencies with partial predicate scanners;
4. `grave`, opportunity aspects, and some warnings divide consequence analysis between author annotations and bespoke
   presentation heuristics;
5. rule scheduling and repetition are represented by low-level lifecycle booleans whose meaning is spread across
   compiler sugar and runtime ordering;
6. facts and provenance exist in several parallel representations that consumers join by convention.

These are not equally severe. Some are legitimate semantics with an overloaded representation; some are compatibility
shortcuts; some are direct coupling. The ambitious direction is not a flag purge. It is a typed causal and perceptual
intermediate representation from which player-facing projections are computed consistently.

## A test for a healthy declaration

For each author-facing field, ask four questions:

1. **Fiction:** Does it say something meaningful about the world or the authored experience independent of the current
   UI? “The tablet reveals the tally” passes. “Draw this blue” fails.
2. **Authority:** Is the author the right authority? The author knows that an act is a promise or that a clue should be
   withheld. The engine knows whether the current company already knows the clue or whether an offered action is deadly
   to this party.
3. **Composability:** Will the declaration retain its meaning when modules are combined, prose is rewritten, the player
   arrives by another route, or another client renders it?
4. **Single consequence path:** Is the behavior computed once and shared, or do the map, glance, journal, aim system,
   and terminal each reinterpret the declaration?

This gives a useful classification:

| Declaration | Keep, replace, or derive? | Reason |
|---|---|---|
| `at(person, room)`, `reveals(source, fact)`, an action effect | Keep | Fictional state and causality |
| notice requires `lore`; speech is audible nearby | Keep, but type it | Perceptual semantics |
| an objective is about this person or place | Keep when it expresses authored intentionality | The author owns dramatic focus |
| whether that person is currently the viable next step | Derive | Depends on world and offered effects |
| `teaches fact` on prose | Replace with a perceptual consequence/source relation | It is an engine effect disguised as annotation |
| `Choice.teaches`, atlas blue | Derive | Projection of current possible knowledge delta |
| “this is a question” inferred from `Ask ...` | Replace with a speech-act type | Behavior depends on English wording |
| irreversible oath or consent boundary | Keep as authored semantics | Not inferable solely from state diff |
| mechanical danger to this party | Derive | Depends on party, world, and resolution |
| narrative priority or deliberate reveal | Keep, explicitly presentation-only | Artistic judgment, not simulation truth |

## 1. Observation aspects are an overloaded semantic switch

`Observation.aspect` currently admits `fixture`, `feature`, `sign`, `weather`, `ambience`, `event`, `revelation`,
`reading`, `hearsay`, `sound`, and `felt` (`src/lang/module.ts`). That one field participates in several different
systems:

- `LocalObservations` permits only `sound` and `felt` in darkness
  (`src/campaign/local-observations.ts:97`).
- `Perceptions.witness` derives knowledge provenance from `reading` and `hearsay`
  (`src/campaign/perceptions.ts:23-30`).
- `SceneBudget` uses `sign`, `revelation`, `reading`, and `hearsay` as always-bearing prose, while treating fixtures,
  features, weather, and ambience as standing description (`src/presentation/scene-budget.ts:83-99`).
- Prologue and other presentation code use `feature` to decide what receives separate treatment.

These are related, but they are not one axis. “Reading” describes a medium and provenance. “Sound” describes a sensory
channel. “Revelation” describes narrative salience. “Fixture” describes scene persistence and composition. A carved
warning can be simultaneously a fixture, visible writing, evidence for a fact, and a major revelation. The union type
forces the author to select one word and lets downstream systems treat that choice as answers to unrelated questions.

### Failure modes

- A reading is invisible in darkness because it is not `sound`, which is sensible, but this follows indirectly from a
  narrative aspect rather than an explicit visual channel.
- A spoken warning represented as `hearsay` gets `toldBy` provenance using the place as speaker; changing the aspect for
  scene composition can change canonical knowledge records.
- A historical fixture that teaches something needs a special exception in `SceneBudget.bears` to avoid overrunning
  the arrival budget.
- New media—smell, touch, magical apprehension, a mixed inscription read aloud—require adding more values to one list
  and auditing every consumer.

### Mitigation

Split the declaration into orthogonal compiled properties:

```ts
interface PerceptualContent {
  channels: ('sight' | 'hearing' | 'touch' | 'smell' | 'arcane')[];
  medium?: 'scene' | 'speech' | 'writing' | 'trace' | 'memory';
  persistence: 'standing' | 'event';
  salience: 'ordinary' | 'bearing' | 'revelation';
  subject?: EntityId;
  consequences?: KnowledgeConsequence[];
}
```

Authors should normally get these fields from higher-level constructs: `Observe ... as sound` can continue as sugar for
`channels: ['hearing']`; a `Reading` construct supplies visual/writing provenance; a `Source` supplies a knowledge
consequence. The runtime should not interpret one enum as four policies.

This is a high-value migration because it removes coupling without asking the engine to guess prose meaning.

## 2. English labels and identifiers form a hidden type system

The repository has worked deliberately to stop reading behavior from labels, but several conventions remain.

The clearest example is repeated conversation. `WorldConstructs.recall` recognizes a repeatable question with:

```ts
/^(Ask .+?) (about|what|where|who|whom|why|how|whether|if|for|after) /
```

It then rewrites the displayed name by regex and creates an `_again` action. A semantically identical topic phrased
“Question Annis concerning the debt” is not recognized. A translated label may fail. Adding a new grammatical form
changes mechanics. Elsewhere `TalkFocus` recognizes repeat actions through `_again`, distant material through
`_beyond_told_`, and sales through schema prefixes; `ChoiceGrouping` uses schema/id tables and namespace-shaped ids to
decide placement and whether an act is “own.” `AimAdvances` contains additional `buy_` and `sell` prefix tests.

Some of these tests are harmless formatting, and canonical schema ids are better than English labels. The problem is
that the type information is neither consistently declared nor exhaustively checked. It leaks through several string
channels:

- English imperative text (`Ask ...`);
- generated action suffixes (`_again`);
- schema prefixes (`buy_`, `sell...`);
- module namespace spelling (`/^\w+__\w/`);
- special action ids used in maps and grouping tables.

### Failure modes

- Rewording or localization changes repeatability or grouping.
- A new action compatible with selling, asking, or movement is omitted until every string switch is found.
- Two clients can classify the same action differently if they do not share every regex.
- Generated ids become an undocumented API that authors can accidentally imitate.
- Tests preserve current phrases rather than the intended semantic contract.

### Mitigation

Give every action a compiled semantic descriptor independent of its name:

```ts
interface ActionSemantics {
  kind: 'move' | 'inspect' | 'search' | 'speak' | 'trade' | 'fight' | 'rest' | 'manipulate' | 'other';
  speechAct?: 'ask' | 'answer' | 'tell' | 'promise' | 'recruit' | 'refuse';
  transaction?: 'buy' | 'sell' | 'gift' | 'service';
  repetition?: 'repeatable' | 'recall-only' | 'once';
  scope: 'world' | 'module' | 'entity';
  movement?: ExitDefinition;
}
```

Grammar constructs such as `Topic`, `Action`, `Change`, and canonical rules populate this descriptor. `name`, `Result`,
and `Description` remain prose only. The compiler validates that a speech act has a speaker/recipient shape and that a
transaction has the relevant transfer effects. Presentation switches exhaustively on the descriptor. Generated ids
become opaque identities rather than behavior.

As an incremental mitigation, centralize all residual id/name conventions in one compatibility adapter and add a lint
that reports when runtime code outside that adapter applies regexes to action names or ids.

## 3. Objectives duplicate causality as routes and targets

An `Objective` has a completion condition, prose, optional `toward[]`, and optional `route`. The comments in
`src/lang/module.ts` explicitly say `toward` tells the page whom or where to lead to, rather than letting the objective's
words name arbitrary things. That is a legitimate correction to prose inference: the words “ask the reeve about the
mill” do not establish a unique simulation target.

The difficulty is that `toward` often duplicates information already present in action requirements/effects, source
locations, and the objective predicate. `AimAdvances` then constructs still more causal links by scanning:

- calls in the objective predicate;
- rule effects and `rule.teaches`;
- positive atoms in teaching-observation predicates;
- action success effects and selected requirements;
- special cases for acquisition, combat, buying, selling, coin, hidden things, and travel.

The comments in `src/presentation/aim-advances.ts` form a history of false leads: every flower, every inn conversation,
every reward, every route asserting `at`, or every generic fact-telling action has at some point appeared as the aim's
next step. This is evidence of a planner being reconstructed inside presentation through partial effect matching.

### What should remain authored

An objective's dramatic subject is not always derivable. An author may intentionally direct the player to the widow
rather than the equally capable clerk, or withhold a mechanically possible shortcut. `toward` can therefore express
authored focus. It should not, however, be the sole bridge between a goal predicate and the actions/sources that can
advance it.

### Mitigation

Compile a causal support graph:

```text
available action/outcome
    -> world changes
    -> enabled perception/rule consequences
    -> facts and relations changed
    -> objective predicate closer to false/completion
```

For each objective, derive candidate supporting actions and sources from grounded or parameterized effect summaries.
Then apply authored guidance as constraints:

- `focus on X`: prefer or expose only routes through X;
- `via X`: require a waypoint for guidance, without changing legality;
- `conceal until P`: do not reveal a causal edge before the player knows P;
- `open`: allow all causally supported approaches.

This changes `toward` from a magic navigation target into an intentional dramatic constraint over a derived causal
graph. The engine can explain why an act advances an aim, and gold can be tested against an actual projected effect.

The first bounded step is to replace `AimAdvances`' separate effect scanner with the same prospective transition summary
recommended for knowledge. A general `TransitionSummary` should include asserted/retracted calls, measures, movement,
inventory, combat outcomes, and epistemic deltas after settlement.

## 4. Consequence, danger, and irreversibility are split across flags and heuristics

Kyr lets an author write `Grave "..."`, after which the page asks for confirmation. The presentation also derives
danger marks from combat, exposure, traps, hostility, and party-relative `DangerSense`. This is a sensible hybrid but
the boundary is not explicit.

Two different ideas are involved:

- **Mechanical severity:** likely death, resource loss, hostility, time pressure, irreversible state change. The engine
  can often derive this from resolution and current party state.
- **Consent or narrative gravity:** swearing an oath, betraying someone, destroying a unique letter, choosing a ruler.
  The author may know this matters even where the immediate state diff looks small.

If `grave` is treated as the whole truth, authors must predict interface policy and can forget warnings the engine could
derive. If it is removed entirely, a generic effect analyzer will miss social or thematic commitments.

### Mitigation

Introduce typed consequence traits:

```ts
interface ConsequenceProfile {
  mechanical: ('death' | 'injury' | 'loss' | 'hostility' | 'time' | 'world-change')[];
  reversibility: 'reversible' | 'costly' | 'irreversible';
  consent?: { kind: 'oath' | 'betrayal' | 'destruction' | 'allegiance' | 'other'; warning: string };
}
```

Mechanical traits are derived from prospective outcomes and canonical effect metadata. The author may declare the
consent boundary and its fictional warning. Confirmation policy is engine-owned and shared by all clients. Lint should
compare authored claims against effects: an action that destroys a unique entity but lacks an intentional consequence
is suspect; a `grave` action whose outcomes are all reversible deserves review.

This same transition analysis can drive red danger, risk words, hold-to-confirm, and post-action feedback without making
any one of them the source of truth.

## 5. Rule lifecycle booleans expose runtime scheduling

Compiled `WorldRule` carries `upkeep`, `late`, `held`, `heard`, and ordinary/anchored behavior. Most authors do not set
all these directly: constructs such as promises, occasions, doors, and openings lower into them. That is good compiler
architecture. The concern is that their semantics live as interacting booleans interpreted by tick ordering rather
than as one explicit lifecycle model.

For example:

- `upkeep` is reread after moment rules;
- `late` is read only after ordinary rules;
- `held` delays words until they can be heard;
- `heard` separates where a rule happens from where its words are perceived;
- `once` is lowered through latches and can interact badly with anchored perception, as author lint already warns.

These are temporal and perceptual semantics, not presentation flags, so they should not simply be derived away. But a
set of booleans permits invalid combinations and makes ordering hard to inspect.

### Mitigation

Replace the compiled booleans with a rule phase and delivery policy:

```ts
interface RuleLifecycle {
  phase: 'immediate' | 'after-effects' | 'upkeep';
  recurrence: 'while-triggered' | 'edge' | 'once';
  delivery: 'none' | 'if-perceived' | 'hold-until-perceived';
  eventLocation?: AnchorRef;
  perceptionLocation?: AnchorRef;
}
```

Higher-level constructs compile into valid combinations. The compiler refuses ambiguous combinations. A trace tool can
say: “rule fired in immediate phase; event occurred at X; company at Y did not hear it; delivery remains pending.” This
would make current timing and lost-news bugs easier to diagnose without forcing authors to understand tick internals.

## 6. Facts, sources, prose, and provenance have parallel identities

The knowledge report showed that the same information may appear as:

- a `fact` entity and its name;
- prose in a Topic result, Rule `says`, Observation text, or Discovery source;
- `knows`, `witnessed`, `readIn`, `toldBy`, and `learnedFrom` relations;
- an observation's `teaches` target;
- an aim's awaited `knows` call;
- a journal discovery event.

This plurality is not inherently wrong: a proposition, a source, an utterance, and an acquisition event are different
things. The problem is that the links are sometimes reconstructed by scanning actions or observations instead of being
preserved as first-class identities. `CompanyKnowledge`, for example, searches observations backward to find a writing
that taught a fact. `AimAdvances` separately searches observations, rules, and `reveals` relations.

### Mitigation

Model an information graph explicitly:

```text
Fact <-reveals- Source
Source <-realized-by- Observation / Speech event / Document
Acquisition(knower, fact, source, mode, moment)
Fact -leads-to-> Place / Entity / Objective support
```

`knows` can remain the efficient current-state projection. Acquisition records preserve source and time. The journal,
Notes, aims, testimony, and map all read this graph instead of reverse-engineering provenance. Facts may be true,
assumed false, stale, disputed, or merely reported without changing how atlas color is derived: the color concerns a
new acquisition opportunity, while reliability belongs to the information model.

This also opens a stronger long-term design space: conflicting testimony, partial facts, inference from several
sources, lies believed by particular people, and knowledge shared between companions can be modeled without adding a
new presentation flag for each case.

## 7. Narrative salience should remain authored—but isolated

An ambitious semantic engine should not try to derive all composition from mechanics. Authors know when a line deserves
its own beat, when a reveal should be delayed, when an ordinary object is thematically central, or when an objective
should point through a particular person despite other viable routes.

The current trouble is not the existence of `revelation`, `toward`, `Grave`, or `once`. It is that authored narrative
judgment and canonical mechanics sometimes share one field. The cure is to make artistic controls explicitly
presentation-only and unable to create world truth.

Good authorial controls might include:

- `salience ordinary | bearing | revelation`;
- `pace standing | beat | interrupt`;
- `focus entity/source/place`;
- `conceal until predicate`;
- `consent warning`;
- `repeat prose policy`.

They can affect ordering, budgeting, disclosure, and confirmation. They must not assert knowledge, make an action legal,
change danger, or satisfy an objective. Conversely, engine semantics must remain correct if a client ignores these
hints and renders a transcript.

## A stronger intermediate representation

The focused report proposed an epistemic delta. Kyr would benefit from generalizing it into a typed transition and
perception model.

```ts
interface TransitionSummary {
  beforeRevision: number;
  outcome: 'success' | 'failure' | 'interrupted' | 'conditional';
  world: {
    asserted: Call[];
    retracted: Call[];
    measures: MeasureDelta[];
    movement: MovementDelta[];
    inventory: InventoryDelta[];
  };
  perceptions: PerceivedEvent[];
  epistemic: EpistemicChange[];
  consequences: ConsequenceProfile;
  supports: ObjectiveSupport[];
}
```

There should be two ways to obtain it:

- **actual:** the one settled result committed after a command;
- **prospective:** summaries for ordinary possible outcomes of a grounded offered action, evaluated without mutation or
  random consumption.

Then the player projection becomes straightforward:

| Player-facing result | Derived from |
|---|---|
| legal/disabled | grounded requirements and authoritative action resolution |
| blue knowledge | prospective new epistemic delta |
| red danger | prospective consequence profile plus party-relative danger |
| green payoff | prospective inventory/resource/relationship benefit |
| gold aim | objective support graph constrained by authored focus |
| movement/exploration | movement delta, visitation, and perception |
| confirmation/hold | consequence profile and consent policy |
| feedback/journal | actual transition summary |

This does not mean simulating an entire random combat for every button. Canonical resolvers can expose conservative
effect summaries, and previews can use bounded deterministic settlement. What matters is one typed contract: UI code
does not inspect action prose, author syntax, or arbitrary relation names to rediscover the result.

## Language direction

An ambitious evolution of Kyr should move toward a small number of high-level fictional constructs that lower into the
typed intermediate representation.

### Prefer these author-facing concepts

- **Fact / Source / Testimony / Reading / Sign:** information and provenance.
- **Action / Topic / Promise / Choice:** intentional acts and speech acts.
- **Event / Occasion / Schedule:** temporal causality and delivery.
- **Objective / Focus / Concealment:** dramatic intent over causal support.
- **Perception:** channel, range, capability, subject, and consequence.
- **Commitment:** oath, allegiance, destruction, or another consent boundary.

### Hide these compiled mechanisms

- latches created only to implement once/edge triggering;
- `_again`, `_beyond_told_`, and namespace-derived behavior;
- `Choice.teaches` and other intermediate booleans consumed as truth;
- rule-phase booleans;
- reverse searches from prose objects to facts;
- duplicated client-side effect scanners.

### Require semantic completeness, not annotation completeness

Lint should ask whether content is causally and perceptually complete:

- A source reveals exactly the facts it can convey.
- A perceived fact has a valid channel and provenance.
- An objective has at least one reachable support path under some valid state.
- A choice described as irreversible has an appropriate consequence, and unique destructive outcomes have consent
  treatment.
- A speaking event says who can hear it and what happens if nobody does.
- An action classification agrees with its parameter and effect shape.

That is more useful than asking whether the author remembered a UI-facing flag.

## Migration programme

This direction is large enough to require staged work. A credible sequence is:

### Stage 1: Inventory and invariants

1. Add a repository check listing every read of action names/ids, observation aspects, objective `toward`, `grave`, and
   compiled lifecycle booleans outside their designated owners.
2. Establish cross-client invariants: browser, terminal, map, Notes, and journal receive the same semantic aspects and
   transition facts.
3. Record representative modules for each pattern: direct topic learning, a state-triggered reading, heard-at news, a
   multi-step aim, a dangerous fight, an oath, and a generated world.

### Stage 2: Shared transition summaries

1. Extract pure application and perception settlement from the live campaign host.
2. Return actual `TransitionSummary` from command resolution.
3. Add prospective summaries for grounded actions, initially for direct effects and local observations.
4. Route knowledge and aim advancement through the common summary before changing author syntax.

### Stage 3: Orthogonal perception and information

1. Add perceptual channels, medium, persistence, salience, and knowledge consequences to the compiled model.
2. Normalize legacy observation aspects and `teaches` at load time.
3. Move darkness, provenance, scene budget, and knowledge acquisition to their respective axes.
4. Introduce acquisition records and make the journal/Notes read them.

### Stage 4: Typed action and rule semantics

1. Add `ActionSemantics`; populate it from existing grammar constructs and canonical schemas.
2. Remove label regexes and id-prefix classification from runtime consumers.
3. Add `RuleLifecycle`; make promises, occasions, openings, and once-rules lower into it.
4. Provide compiler traces so authors can inspect lowered actions and events.

### Stage 5: Causal objective support

1. Build effect dependencies from transition summaries and information sources.
2. Derive candidate steps for objective predicates.
3. Recast `toward`/`route` as focus and concealment constraints.
4. Remove special-purpose effect matching from `AimAdvances` as each class is covered.

### Stage 6: Author syntax and corpus

1. Design concise surface syntax only after the intermediate representation works on existing modules.
2. Migrate generators before hand-authored adventures.
3. Provide an automatic legacy normalizer and semantic diff: old and new forms must produce the same actual and
   prospective summaries in fixture states.
4. Deprecate old syntax across a save-compatible window, then remove it.

## Concrete near-term commissions

If this direction is accepted, the next bounded pieces should be:

1. **Semantic convention census.** Produce a machine-readable inventory of every runtime regex/prefix test on action
   names and ids, with owner and replacement field. This is small and exposes the hidden type system.
2. **Perception axes spike.** Re-express the wax tablet, a sound in darkness, hearsay, and a standing historical fixture
   with orthogonal channel/medium/salience/consequence fields. Prove identical narration and stronger provenance.
3. **Pure transition preview.** Replace `Teaching.shows` for local observations with post-change evaluation through
   `LocalObservations`; add the false-positive and false-negative tests in the focused report.
4. **Objective support experiment.** On one multi-stage module such as the Iscoed gate, compare current gold guidance
   with support derived from prospective transition summaries. Keep authored focus as a constraint and report every
   disagreement.
5. **Rule lifecycle trace.** Without changing syntax, render why each rule fired, in which phase, where it happened,
   whether it was perceived, and whether delivery remains pending. Use it on the existing heard/once lint cases.

These experiments attack the shared architectural problem without committing immediately to a new surface grammar.

## Risks of the ambitious direction

- **Accidental planner:** deriving causal support can become an omniscient walkthrough. Knowledge and concealment must
  limit which edges the player projection may reveal.
- **Preview cost:** prospective settlement can become expensive. Dependency indexes and conservative resolver summaries
  should optimize a correct model, not replace it with string matching.
- **Loss of authorial control:** a fully derived interface can flatten deliberate pacing. Focus, concealment, salience,
  and consent remain legitimate authored controls, clearly separated from world effects.
- **Migration scale:** compiled modules live in saves and generators emit Kyr. Normalize old forms at the compiled
  boundary and migrate producers before the corpus.
- **False precision:** some outcomes, especially combat and social interpretation, cannot be cheaply predicted. The
  summary must express possible ranges and uncertainty rather than claim an exact future.
- **Ontology inflation:** adding types for every special case would recreate flags under new names. New fields should
  represent orthogonal domain concepts used by several systems, not one consumer's convenience.

## Boundary doctrine

The stronger Kyr is not a language that infers the world from literary prose. It is a language in which the literary
prose is attached to a coherent model of what happens, who perceives it, what it means as information, and how it bears
on intentions.

Authors should be able to say:

- this inscription is visible writing and reveals this fact;
- this person promises this outcome and can later break it;
- this action destroys the only copy and constitutes a betrayal;
- this objective is complete under this condition, with this person as the intended dramatic focus.

From that, the engine should determine:

- whether this company can perceive or understand it now;
- whether the interaction can add new knowledge;
- whether it is dangerous, profitable, exploratory, or aim-supporting;
- whether it deserves blue, red, green, gold, or no color;
- what is recorded in the journal and Notes;
- what another client or combined module sees.

That is the ambitious boundary: explicit fiction and causality in Kyr, derived behavior and presentation everywhere
else, and authored aesthetic control that never masquerades as simulation truth.
