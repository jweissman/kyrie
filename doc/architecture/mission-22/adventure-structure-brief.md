# Adventure structure proved in play — builder brief

**Date:** 17 November 2026  
**Status:** proposed bounded proof for the Mission 22 first-hour slice  
**Audience:** builder of the authoring declaration, journey review artifact and structural checks  
**Related direction:** [planning-report.md](planning-report.md), the owner's first-minute brief, the owner's plain-prose
and journey-review brief, [prospectus.md](prospectus.md), `doc/history/activation/dramatic-assessment.md`

This brief does not advance the prospectus's Priority 4 “dramatic topology” program. The journey-review artifact serves
the immediate first-hour and prose work and may proceed on that basis. `Incident` is a bounded language experiment
inside that artifact work; it does not authorize a fate graph, act system, divination system or general dramatic model.

## 1. Outcome

Build the smallest facility with which an author can identify a reviewed Story and make two initial claims—**this is
the incident that puts it in motion, and these authored moments are intended to show or reframe it**—and Kyrie can
answer, from a real played journey:

1. what the player was shown before each choice;
2. what they chose and what physically happened;
3. when the incident first became intelligible;
4. what world state changed without waiting for the player;
5. which materially different responses were actually available;
6. whether the journey later enacted a consequence and returned to a place or people able to answer it; and
7. which prose and Kyr declarations produced the experience.

The proof is one representative recorded opening, not a new dramatic engine and not a corpus-wide rewrite. Its output
must be useful to both a human editor and later mechanical checks. The whole journey, rather than a bag of declarations
or isolated strings, is the unit of evidence.

## 2. Why this is the next useful seam

The adventure corpus is not short of content or clocks. The dramatic assessment counted 5,349 rules, 316 measures,
138 objectives and 233 endings in 27 adventures. It found a different deficit: declared machinery often does not form
a legible experienced arc. Twenty-six adventures have a dated reckoning, but much autonomous activity is timetable
movement; observations outnumber actions two to one; some modules have many endings without a clean first experienced
problem, while others have no endings at all.

The recent cold plays make the same point at smaller scale. The first minute can contain a scene, a choice, a roll, a
gain and a goal while still failing to give the player one intelligible account of what happened. A structural checker
that merely counts `Discovery`, `Objective`, `Measure`, `Person` and `Ending` would certify this failure.

Kyrie should therefore check **claims against played order**:

> the author names the intended dramatic fact; a journey supplies evidence that the player encountered and acted on
> it; lint reports where the evidence does not support the claim; a human judges the literary and dramatic quality.

## 3. Product boundary

### In the first proof

- One new non-runtime Kyr block: `Story`, initially containing one `Incident` and a small set of typed `Beat`s.
- One versioned, headlessly generated journey-review artifact.
- One readable chronological Markdown rendering of that artifact.
- One command-line inspector for a selected step.
- Source provenance where it can be exact; an explicit `unknown` otherwise.
- Five bounded structural findings, initially exercised on one selected route and fixtures.
- A before-and-after comparison of the same route after an authored revision.
- A reference-adventure authoring exercise that demonstrates two or three responses, a changing visible condition, a
  physically enacted consequence and a return reaction. These are evidence in the artifact; only Story, Incident and
  Beat receive parser support in the first increment.

### Not in the first proof

- `Approach`, `Thread` or `Outcome` syntax in the first parser increment. Reversal, climax and return are initially
  `Beat` roles, not independent declarations.
- A general screenplay, quest graph or act system.
- Automatic claims that prose is surprising, moving, elegant or satisfying.
- A complete editorial CMS, browser timeline editor or new replay engine.
- A bulk retrofit of all adventures.
- A new runtime notification, heading, colour, objective or player-visible concept called Incident.
- A replacement for `Discovery`, `Objective`, `Milestone`, `Ending`, rules, measures or relations.
- A requirement that all adventures share one dramatic shape.

If the first proof cannot inform a useful edit to the selected journey, stop. Do not generalize the language.

## 4. Existing contracts to preserve

### 4.1 A transcript is a replay recipe

`PlaySession.Transcript` version 1 records the scenario, seed, party, player commands, combat commands and a digest after
each step. It deliberately does not retain rendered pages. Replay rejects a step whose resulting digest differs.

Do not silently add editorial snapshots to transcript v1 or make ordinary saves substantially larger. Frames recorded
live during play and frames reconstructed by a later replay are different evidence and must remain distinguishable.

### 4.2 A Journey already observes much of the needed experience

`Journey.Taken` currently retains, for each scripted step:

- the offered player-facing label;
- the authoritative command;
- the raw telling;
- the page as rendered after the action;
- the `CampaignEvent`, including changes and result;
- grave confirmation and chapter, where present.

`Journey` also builds the actual `Screen`, resolves choices through the same player surface, records ambiguous matches
and contested endings, and can be driven entirely headlessly. Reuse it. Do not introduce a parallel action resolver.

The important missing facts are the complete **before** projection, durable capture, exact state delta, and source
provenance. Add an observer/export path around a Journey or PlaySession; do not make the production session depend on
the review facility.

### 4.3 The page remains authoritative for what was offered

The review artifact must use `ScreenModel`, `ChoiceList` and the normal narration/presentation path. It must not infer
an ersatz list of choices directly from action predicates. The ordinary four-action presentation rule and the owner's
birth-sign exception remain presentation contracts outside this work.

### 4.4 Existing declarations keep their meanings

- A `Discovery` is information the company may know.
- An `Objective` is an undertaking that becomes true and can lead somewhere.
- A `Milestone` gives resolution its worth.
- An `Ending` closes a book or installed chapter.
- A rule or event may advance the world whether or not the company is present.

An Incident nested in a Story identifies the problem these things may express. It is not itself knowledge, an
objective, a countdown or an ending, and a Story does not execute it.

## 5. The initial Story and Incident contract

### 5.1 Meaning

An Incident is **one present-tense problem already capable of changing the world**. It is the principal answer to “what
has happened or is happening here that calls for a response?”

Together, the Story's Incident and Beats must name:

- the predicate that means the problem exists;
- one or more opening or revelation Beats and their authored producers that can show it to the player; and
- the predicate that means it is no longer the same unresolved problem.

The first proof should author one Story and exactly one Incident in it. The parser and `Module.stories` collection should
nevertheless accept more than one Story rather than baking a temporary proof restriction into the language. Review
uses the only Story automatically, or requires `--story <id>` when a module eventually has several. Supporting
incidents and relationships between Stories can wait until a real authoring need appears.

Appendix A gives the compiled types, eventual grammar, concrete adventure mappings and exact first implementation
slice. This section states only the contract the rest of the brief relies on.

### 5.2 Proposed syntax

Use a block compact enough to read with the adventure, for example:

```text
Story keeping "The keeping of the Long Wall" {
  Incident failing_wall "The Long Wall is failing"
    when not state(leak_gate, mended) and not drawn(hollow) and not broke(long_man)
    resolved when state(leak_gate, mended) or drawn(hollow) or broke(long_man).

  Beat wall_shown as revelation
    when knows(party, wall_known)
    shown by sluice_teaches.
}
```

The exact line breaking is not material. The semantics are:

- the Incident's `when`: the problem exists, whether or not the company knows it;
- the Incident's `resolved when`: terminal transformation of this problem, not necessarily a happy outcome;
- a Beat's `when`: the authoritative state the claimed beat is about; and
- a Beat's `shown by`: IDs of player-visible authored producers whose occurrence makes that state available to
  perceive or understand.

For the first proof, `shown by` may name an `Observe`, named `Discovery Source`, `Rule` with words, `Event`, `Topic`, or
an Action with a stable declaration ID and player-visible result. Reject an ID that cannot produce player-visible
words. A `Discovery` alone is resulting knowledge, not an occurrence; name the producer that taught it. Do not accept
an untyped free-form tag or infer showing from matching prose.

If action results presently lack a stable source ID in the compiled module, either add that provenance narrowly or
exclude them from `shown by` in the first grammar. Do not pretend a source mapping is exact when it is not.

### 5.3 Why “within a few steps of the first clue” is not quite the invariant

Counting from a first `Discovery` would reward an expository chain: clue, clue, declaration of danger. It would also
misclassify an opening that physically shows the danger before naming it.

Use this initial invariant instead:

> In every supported opening trace submitted as evidence, a Beat intended to show the Incident occurs through one of
> its `shown by` producers within six consequential player commands, and the Incident's `when` predicate has already
> held by that moment.

A consequential command is one that passes time, changes world state, teaches something, changes an undertaking, or
moves the company to another meaningful place. `follow:` selections, opening panels and automatic observations do not
consume the budget. Report raw step number as well as consequential-command number so the rule remains inspectable.

Six is a provisional proxy for five to ten minutes, not a law of narrative. Make it a tool option with a default, not
an author-controlled per-adventure escape hatch. Change the default only from play evidence.

### 5.4 “In motion” must be evidenced

The `when` predicate alone proves only that a flag was set. For this proof, an Incident is evidenced as moving if, before
resolution, either:

- an autonomous rule or event changes a fact named by its `when` or `resolved when` predicate; or
- time changes the choices, visible condition or possible resolution associated with it.

The report should show the responsible event and state delta. Initially make failure advice, not an error: some physical
problems are genuinely static until touched. A human can then decide whether “already in motion” was an intended claim.

## 6. Journey-review artifact

### 6.1 Separate live-recorded and replayed evidence

Introduce a review artifact with its own version, for example `JourneyReviewV1`. It is produced alongside a live run or
by replaying a particular transcript, is tied to a build revision, and is not required to resume play.

```ts
interface JourneyReviewV1 {
  version: 1;
  generatedAt: string;
  revision?: string;
  source: {
    kind: 'live-recorded' | 'replay';
    transcript: Transcript;
    replayedAgainst?: string;
  };
  opening: ReviewFrame;
  steps: ReviewStep[];
  findings: ReviewFinding[];
}

interface ReviewStep {
  index: number;
  before: ReviewFrame;
  chosen: { label: string; fullLabel?: string; command: string; grave?: string };
  event: CampaignEvent;
  after: ReviewFrame;
  delta: ReviewDelta;
  sources: SourceRef[];
  annotations?: EditorialAnnotation[];
}
```

This is illustrative, not a demand to serialize the entire `Screen` or `World` types.

### 6.2 A review frame

Store the minimum stable, player-visible projection required to reconstruct the reading experience:

- fictional time and current place;
- headings and prose in display order;
- people/things visibly present;
- primary and remaining offered choices, with IDs, labels, grouping and aspects;
- current followed undertaking and other shown aims;
- visible gains, warnings and outcome lines;
- ending/chapter state;
- a digest of authoritative world state.

Prefer small normalized review DTOs over serializing UI implementation objects. Retain exact rendered strings as
recorded by this artifact, including their order. Also retain semantic IDs so comparisons need not diff prose alone.

### 6.3 State delta

For each step, derive a bounded semantic delta between before and after:

- relations asserted and retracted;
- measures changed, with before and after values;
- knowledge gained;
- undertakings offered, followed, advanced or retired;
- people moved, joined, left, became hostile, fell or recovered;
- goods/items gained, spent or lost;
- places opened, closed or newly led to;
- milestones, promises and endings reached;
- fictional time elapsed.

Do not dump the whole world snapshot into the human report. Keep a machine-readable delta sufficient to audit the
summary. Existing `CampaignEvent.changes` should be the starting point; comparison of checkpoints may fill only gaps
that cannot be represented there.

### 6.4 Source provenance

Every displayed line and choice should carry one of:

```ts
type SourceRef =
  | { kind: 'kyr'; module: string; declaration: string; file?: string; line?: number }
  | { kind: 'template'; table: string; entry: string; file?: string; line?: number }
  | { kind: 'engine'; producer: string }
  | { kind: 'unknown'; reason: string };
```

Stable declaration or template IDs are the contract. File and line are conveniences and may change. Add provenance at
the point text is selected or compiled; do not recover it afterward by searching for equal strings, because repeated
and filled templates make that unsound.

Do not block the proof on complete provenance. Measure coverage and render unknowns honestly. The first selected route
should establish which producers account for the missing share.

### 6.5 Human renderings

Provide two views from the same artifact:

1. **Chronological reading:** grouped by place or scene, showing what the player saw, the choice in their words, the
   resulting account and significant changes in understanding or state.
2. **Step inspector:** before frame, exact offered set, selected choice, event/result, after frame, semantic delta and
   source references.

Markdown and JSON are sufficient for the proof. A later browser scene view may consume the selected frame through the
normal presentation components, but must not be a prerequisite for headless generation.

## 7. Structural analyses in the first proof

Add these as review findings. Only parser/reference errors should initially fail `kyrie lint`; experiential findings
need an explicit journey and belong in the review/verify path.

### DRAMA-01 — no reviewed Story or Incident

For a whole authored adventure selected for this standard, report that no Story is declared or that its Story has no
Incident. Do not apply this automatically to catalogs, situations, small goings-on or legacy modules in the first
change. Gate it by the selected fixture/reference adventure or an explicit verification flag until rollout is decided.

### DRAMA-02 — Incident is not shown in the opening budget

For each submitted opening trace, report:

- first raw step and consequential step at which a `shown by` declaration occurred;
- whether `when` held then;
- traces in which it never occurred; and
- the offered choices immediately before the budget expired.

Do not claim all possible player behavior from one golden route. Call it “unsupported by the submitted traces.” A later
bounded search can establish a stronger universal or existential claim.

### DRAMA-03 — fewer than two materially different responses are evidenced

Do not infer an approach from file names or count every action. For the first proof, compare two or three authored
journeys after the Incident is shown. A response is materially different when its steps establish different persistent
facts, consume different scarce resources, enlist or oppose different actors, or make different later choices possible.

Report the divergence step and semantic deltas. If two traces differ only in wording or route and reconverge without a
persistent distinction, count one response. Keep this heuristic in the review tool, not the Kyr grammar, until its
false positives are understood.

### DRAMA-04 — consequence is recorded but not physically enacted

Flag a submitted resolving trace when the final transition to `resolved when` or an Ending is caused only by acquiring
knowledge, following an aim, or an automatic bookkeeping assertion, with no preceding physical or social act in the
same causal step.

For this check, enacted causes include an authored action, movement/crossing, item use, exchange, fight command, hazard,
or explicit wait through a chosen risk. “Physical” does not mean “violent.” Signing, warning, giving, opening, carrying,
destroying, refusing and enduring are enacted. A topic can qualify if the player makes a consequential commitment and
the event records its world effect; merely asking for exposition cannot.

Show the action and delta rather than assigning a pass from its label.

### DRAMA-05 — no answered return

After resolution, find whether the trace visits a place seen before the climax or speaks with a person met before it.
Pass only if the resulting frame contains a state-dependent reaction caused by the resolution or its cost. Repeated
ambient prose is not a return scene.

An adventure that deliberately ends away from home may waive this check in review, but the first proof should not add
a language-level waiver. Record the design judgment beside the finding.

## 8. The rest of the rubric: proof obligations, not declarations yet

The selected authoring exercise should include the following, and the review artifact should make each inspectable.
Do not add syntax for them in this slice.

| Desired quality | Evidence to put in the selected journeys | What automation may safely say |
|---|---|---|
| One problem in motion | Incident shown early; autonomous or time-driven delta | Shown/not shown; motion delta found/not found |
| Two or three viable approaches | Separate honest traces with persistent divergence | Distinct deltas and complete/reachable traces |
| Companion with agency | Same companion changes state in at least two separated scenes; one change is not a direct player command | Actor and responsible rule/event; separation in steps/time |
| Visible system | A measure or categorical condition is rendered at two values and changes an offered choice or consequence | Values shown and dependent choice/event |
| Interpretive midpoint | Earlier understanding is contradicted or made inadequate; aims/options change | Knowledge and aim delta only; not “a genuine reversal” |
| Enacted climax with cost | Decisive act plus lost resource, closed option, harm, obligation or changed relationship | Cause and cost delta |
| Answered return | Earlier person/place produces resolution-dependent words/action | State-dependent reaction occurred |
| Two to four prepared endings | Each reached by an honest trace; prerequisite facts appear earlier | Count, reachability evidence, preparation facts |

The midpoint is the clearest limit. Kyrie can show that fact B was learned after fact A and that objectives changed. It
cannot determine that B overturns the player's interpretation rather than merely adding information. The report must
use “candidate reversal” and leave the judgment to review.

Likewise, a companion is not proved agentic by being a required action parameter or carrying a capability. Useful
structural evidence is an authored rule, event, pursuit, refusal, intervention or departure attributable to that person
at more than one separated beat. Whether this feels like a will belongs to the reader and player.

## 9. Reference authoring exercise

Choose one bounded route from the Sprint 2 golden first hour. Prefer a small physical problem with a person implicated,
not a large mystery whose reversal lies hours away. If an existing authored adventure is used, *The Long Man* is a
better structural laboratory than *Book of Faces* or *Low Water*: its wall, missing teeth, steward, storm and valley can
be rendered physically, while its current breadth remains containable in three traces. It does not currently satisfy
the companion row; use *A Winter in Carth* as the companion-thread contrast unless the commission separately authorizes
content work to make Dunnet a travelling companion.

Before changing prose, write an eight-line synopsis:

1. the problem already in motion;
2. the two or three responses;
3. what the companion wants and does at three moments, where this specimen is meant to prove that row;
4. the visible condition and how the player reads it;
5. the fact that changes the meaning of the opening commission;
6. the enacted decision and its cost;
7. who or what answers on return; and
8. the two to four outcomes, each prepared by an earlier act.

Then implement in four passes:

1. **State spine:** only the incident, its changing condition, response commitments, decisive acts, costs and reaction
   facts.
2. **Three honest journeys:** no `give`, `put`, forced facts or teleporting test aids. Each uses labels the page offered.
3. **Prose pass in sequence:** revise the actual chronological reading under the plain-prose policy. Mundane action is
   literal and causally exact; remarkable sentences are reserved for remarkable moments.
4. **Cold play:** the journeys prove reachability, not intelligibility or desire. A person must play the deployed route.

If Sprint 2 instead selects the generated roadside vignette, use that as the proof and limit the “ending” to a bounded
scene resolution plus an answered later meeting. Do not distort a five-minute situation into a chapter-ending adventure
to satisfy the rubric.

## 10. Commands and artifacts

Names are suggestions; follow existing CLI conventions.

```text
bin/kyrie review journey <transcript-or-checkpoint> [--story <id>] --out <directory>
bin/kyrie review journey <artifact.json> --step 4
bin/kyrie review compare <before.json> <after.json>
bin/kyrie verify <adventure> --drama <journey-a> <journey-b> [journey-c]
```

Expected output directory:

```text
review.json              machine-readable live-recorded or replayed evidence
journey.md               chronological reading
steps/004.md             optional selected step rendering
findings.md              structural findings and provenance coverage
comparison.md            only for a before/after invocation
```

Never overwrite a live-recorded artifact when replaying after a code or prose change. The comparison header must name
both revisions and whether each side was recorded live or reconstructed by replay.

## 11. Implementation sequence

### Phase A — Observe without new language

1. Select and commit one existing transcript/checkpoint and its build revision.
2. Add an observer that records normalized before and after frames around normal `Journey.play`/`PlaySession.leg` calls.
3. Export JSON and chronological Markdown.
4. Add the step inspector and semantic delta.
5. Measure exact/unknown provenance on the selected route.

Exit: a reviewer can identify the bad line, see what surrounded it, see what choice caused it and find its producer.

### Phase B — Add the initial Story block

1. Add `Story`, `Incident` and `Beat` grammar, module types, parser and writer round-trip.
2. Validate unique Story IDs, exactly one Incident in each Story, Beat roles, referenced IDs and predicates. The
   reference module authors only one Story.
3. Record occurrence of each Beat's `shown by` producers in review steps.
4. Add DRAMA-01 and DRAMA-02.
5. Add minimal guide text and a diagnostic fixture for each invalid form.

Exit: the selected opening report states exactly when its intended problem was first shown and whether it was already
true.

### Phase C — Compare paths and consequences

1. Add semantic comparison across two or three review artifacts.
2. Add DRAMA-03 through DRAMA-05 as evidence findings.
3. Reauthor the selected slice in state-first and then prose passes.
4. Generate before/after readings and perform human read-aloud review.
5. Play the deployed slice cold.

Exit: the builder can demonstrate two honest responses, an enacted consequence and an answered return; the human
evidence says whether the scene is understandable and worth continuing.

### Phase D — Decide, do not automatically expand

Review false positives, author burden and edits produced. Decide separately whether to:

- make a Story/Incident block expected of every whole adventure;
- add bounded-search support beyond submitted traces;
- promote any other proof obligation into Kyr syntax;
- integrate the artifact into `kyrie reach`/`verify`; or
- retire the experiment and keep only the journey-review facility.

## 12. Tests

At minimum:

1. Story/Incident/Beat grammar, parser and writer round-trip.
2. Unknown or non-visible `shown by` ID rejected with the declaration named.
3. Duplicate Story IDs rejected; each Story parses with exactly one Incident; a review of several Stories without
   `--story` asks for an unambiguous selection.
4. `when` false when first shown reported distinctly from “not shown.”
5. Opening budget ignores `follow:` and counts consequential commands deterministically.
6. Autonomous measure change attributed to the responsible event/rule.
7. Review replay preserves transcript digest checks and never alters the checkpoint.
8. Before frame contains the exact offered choice later selected.
9. Exact live-recorded text remains unchanged when rendered to Markdown.
10. Unknown provenance survives as unknown; no string-search guess.
11. Two cosmetically different but state-equivalent paths count as one response.
12. Two paths with different persistent deltas count as two.
13. Knowledge-only resolution produces DRAMA-04; a consequential promise or exchange with a world effect does not.
14. Ambient repeated text does not satisfy DRAMA-05; resolution-conditioned reaction does.
15. Before/after comparison names revisions and live-recorded/replay status.
16. Existing transcript v1 replay, checkpoint size and ordinary game behavior are unchanged.

## 13. Acceptance

The proof is accepted when all of the following are demonstrated on a deployed revision:

- One live-recorded opening journey can be read chronologically exactly as the player encountered it.
- A selected step shows the before scene, full offered set, choice, event, after scene, state delta and honest source
  provenance.
- The selected module declares a selected Story with one Incident and reviewed Beats; invalid references fail clearly.
- The report identifies the first observed Beat intended to show the Incident and whether the Incident already held
  within the six-command budget.
- Two or three honest traces exhibit at least two materially different responses.
- At least one trace includes a visible changing condition, a decisive enacted act with a cost and a state-dependent
  reaction on return.
- Original and revised journeys are separate artifacts and compare without silently replaying one as the other.
- A human reads the revised chronological account aloud and records acceptance or specific objections.
- A cold player can state, without being told, what the problem was, what they chose to do and what changed.

Passing these conditions does **not** certify that the adventure has a successful midpoint, companion or ending. It
certifies that Kyrie can expose the relevant experience in order, test a narrow structural claim, and give an editor
and player evidence on which to judge the rest.

## 14. Questions the builder must resolve in Phase A

These are investigations with deliverables, not permission to redesign the system:

1. Which `Screen` fields are required to reproduce the selected step through normal presentation without retaining
   unstable UI internals?
2. Does `CampaignEvent.changes` contain enough information for the semantic delta, and exactly which categories require
   before/after snapshot comparison?
3. Where can declaration/template provenance be attached once and survive through narration, choice wording and voice
   rendering?
4. Can action results be given stable declaration IDs without changing action identity or save compatibility?
5. What is the smallest artifact that preserves exact player-visible order while remaining practical for a first-hour
   run?
6. Which selected-route producers remain `unknown`, and what fraction of displayed prose do they account for?

Answer these in the proof report with measurements from the selected journey. Do not settle them by building a general
provenance framework in advance.

## 15. Specific risks, misleading successes and mitigations

The dangerous outcome is not merely that the experiment fails. It is that it produces clean reports, passing checks
and worse adventures. The builder should treat the following as design cases, not incidental implementation defects.

### 15.1 The declared Incident may be the author's summary, not the player's problem

**Problem.** An author can declare “the wall is failing” while the player experiences “find a missing bronze plate,”
“earn a bounty,” or simply “which of these nine exits should I take?” The predicate may be true and a `shown by` line
may fire without the player understanding what is at stake. A report would then confuse exposure with comprehension.

**Mitigation.** Keep three states separate in the report:

1. **exists:** the Incident's `when` predicate holds;
2. **shown:** a named player-visible declaration occurred; and
3. **understood:** established only by a human playback question, never inferred by Kyrie.

The cold-play question should be open: “What do you think is happening, and what might happen if nobody acts?” Do not
ask “Did you understand that the wall was failing?” Record the player's answer beside, but not inside, the mechanical
finding. If two cold players give a materially different account, revise the opening or the Incident claim before
altering the checker.

**Misleading success to reject:** `shown by crack_seen` occurred at step two, but the line described an old crack as
scenery and the player believed the danger was over.

### 15.2 One Incident can flatten forms that do not begin with a crisis

**Problem.** Festivals, pilgrimages, mysteries, comic pursuits, vigils and social occasions may begin with an
opportunity, obligation or marvel rather than a deteriorating emergency. Requiring “one problem in motion” can turn
every opening into a notice, attack or countdown and erase the corpus's remaining variety. Some adventures also begin
with two inseparable pressures rather than one privileged cause.

**Mitigation.** Apply `Incident` only to the selected reference slice during the proof. Do not make it a universal
`AuthorLint` requirement. At Phase D, classify tested modules before rollout:

- **incident-led:** a present problem is the honest opening shape;
- **occasion-led:** a bounded event or invitation creates the field of action;
- **inquiry-led:** an absence or contradiction becomes a problem through investigation;
- **expedition-led:** desire and destination precede the trouble encountered there; or
- **other:** the proposed taxonomy does not fit.

If more than a small minority of reviewed adventures need strained wording to fit Incident, generalize the concept to
an `OpeningSituation` or keep it as review metadata. Do not add supporting incidents merely to rescue the abstraction.

**Stop condition:** the reference author spends more effort explaining why its opening counts as an Incident than
making the opening intelligible.

### 15.3 `shown by` can reward exposition instead of enactment

**Problem.** The easiest way to pass DRAMA-02 is to put a speech, notice or objective on the first page stating the
whole problem. That can satisfy the timing rule while producing the exact over-explained opening the first-minute brief
rejects. Conversely, an excellent physical demonstration may not teach a formal `Discovery` and could be missed.

**Mitigation.** The review should classify each showing by its producer:

- **witnessed:** a visible change, event or physical condition;
- **reported:** a person, notice or record says it happened;
- **inferred:** two or more perceived facts support the conclusion; or
- **editorial:** an objective, heading or system notification states it.

This classification need not enter Kyr syntax. It can be derived conservatively from declaration kind and displayed in
the report. Require at least one witnessed or reported showing in the reference proof; an editorial heading alone does
not satisfy acceptance. Preserve ambiguity where it creates interest, but make the offered intervention and immediate
risk literal enough to choose.

**Misleading success to reject:** a gold “Your first goal” heading names the emergency although no fictional person or
event has made it perceptible.

### 15.4 A step budget is not elapsed attention

**Problem.** Six commands can take one minute or twenty. A single conversation command can produce a page of prose;
travel can execute several legs; automatic lines may bury the decisive sentence without consuming the budget. Authors
can also split or merge commands and change the score without changing the experience.

**Mitigation.** Report four observations together:

- raw command index;
- consequential-command index;
- displayed word and sentence count before the first showing; and
- observed wall-clock time in cold play, when available.

Only the first two are deterministic checks. Word load is diagnostic, not a target to game, and human time remains the
acceptance evidence for “five to ten minutes.” Keep the default of six provisional. If command count and observed time
regularly disagree, retire the threshold rather than creating elaborate weights for every action kind.

**Stop condition:** the team debates whether a travel leg is 0.5 or 0.7 of a dramatic step without evidence that this
changes an edit.

### 15.5 Submitted traces prove examples, not freedom

**Problem.** Two hand-authored golden journeys can demonstrate two approaches while an ordinary player sees only one,
cannot find either, or can become trapped after an untested choice. The author knows labels, routes and prerequisites
that a cold player does not. Conversely, bounded search can drown in inventory, travel and talk choices without saying
anything useful about intention.

**Mitigation.** Label every claim by evidence strength:

- **exhibited:** one submitted trace did it;
- **repeated:** more than one independently authored or live-recorded trace did it;
- **searched:** bounded exploration found or failed to find it under a named policy and budget;
- **played:** a cold person found it without instruction; and
- **universal:** established by a sound static or exhaustive proof, rarely available here.

DRAMA-02 through DRAMA-05 should initially say “not exhibited by these traces,” never “impossible.” Pair each golden
route with the before-frame showing what choices were actually visible. Later, `kyrie reach` may add bounded evidence,
but do not treat random walk coverage as player comprehension.

**Acceptance guard:** at least one route must originate in live-recorded cold play or be independently followed from only a
neutral destination, not copied from the test author's step list.

### 15.6 Persistent state difference does not necessarily mean a viable approach

**Problem.** Two routes may differ because one spent a torch or happened at another hour, yet offer the same strategy
and outcome. Conversely, two morally or socially different approaches may deliberately converge on the same world
facts. A generic state diff will both over-count noise and under-count meaning.

**Mitigation.** Compare route deltas in tiers:

1. **resolution:** different ending, resolution or unresolved state;
2. **commitment:** different obligation, allegiance, relationship, promise or closed future option;
3. **means:** different person enlisted, item/resource irreversibly used, danger accepted or site transformed;
4. **incidental:** time, position, routine inventory churn or presentation-only variation.

Count an approach only from the first three tiers, and show the exact facts responsible. Maintain a small explicit list
of ignored incidental relations for the reference module rather than a universal semantic ontology. Human review may
recognize a meaningful convergence the tool cannot; record it as such rather than adding a prose tag to force a pass.

**Misleading success to reject:** “repair by persuasion” and “repair by climbing” count as distinct only because the
second route consumed one ration during a longer walk.

### 15.7 Cause is not the same as temporal adjacency

**Problem.** A player acts, then an unrelated clock rule fires, then the Incident resolves. If the tool assigns every
after-state change to the chosen command, it will claim a physically enacted climax that the player did not cause.
Rules can also cascade through several facts, hiding the actual decisive trigger.

**Mitigation.** Preserve causal layers available from execution:

- initiating player command;
- direct action effects;
- rules/events triggered in the same tick, with their IDs and conditions;
- later autonomous changes; and
- the first point at which `resolved when` becomes true.

DRAMA-04 should distinguish **caused**, **enabled**, **coincident** and **unknown**. Initially, only direct effects and
same-command cascades whose conditions newly became true from those effects count as caused. A chosen wait may count as
accepting a known risk, but not as causing every event that occurred during it. If the engine does not retain enough
trigger lineage, report unknown and use the step inspector; do not manufacture causality from timestamps.

**Required fixture:** an unrelated autonomous rule resolves an Incident immediately after a physical action; the action
must not receive causal credit.

### 15.8 World-state change is not necessarily visible system behavior

**Problem.** A measure can change perfectly while remaining hidden. Showing “the wall worsens” twice can still fail to
let the player reason about rate, thresholds or consequences. At the other extreme, exposing a raw meter can make a
fictional situation feel like a dashboard and contradict the design's preference for world-facing instruments.

**Mitigation.** For the reference proof, a visible system needs a four-link chain:

```text
authoritative state -> perceptible sign -> player prediction -> choice or consequence that answers the prediction
```

Record at least two different state values or categories, the exact signs displayed, and the choice/event that depended
on them. Ask the cold player what they expected before the consequence. Do not require a number on screen; water at the
second sill, missing teeth and a newly closed crossing can make a categorical system legible. Do not call a changing
description a system unless the player can use it to anticipate something.

**Misleading success to reject:** `wallStrain` changes from 2 to 4 and two observations mention different cracks, but
no available decision or outcome depends on the difference.

### 15.9 Companion activity can be timetable noise rather than agency

**Problem.** The corpus already has hundreds of autonomous rules moving people between rooms. Counting two independent
companion events would certify a schedule as a character arc. A companion can also act frequently while never wanting,
refusing, risking or changing anything.

**Mitigation.** Candidate agency evidence should name:

- the companion's legible concern or commitment;
- a choice, refusal, intervention or departure attributable to it;
- a persistent consequence for the companion or situation; and
- a later beat that answers or revises the earlier one.

Movement alone, availability of a companion ability, damage dealt under generic combat AI and being passed as an action
parameter do not count. The review tool may gather candidate beats from rules/events/pursuits, but a human selects and
explains the sequence. In cold play, ask what the companion seemed to want, not merely what they did.

**Stop condition:** supporting the check requires a new general desire model. That belongs to the prospectus's later
derived “who wants what of whom” research, not this proof.

### 15.10 A candidate reversal can be merely another fact

**Problem.** Knowledge A followed by knowledge B and a changed Objective is easy to detect. It says nothing about
whether B changes the meaning of A. Authors may mechanically retire an objective at the midpoint to earn the shape.

**Mitigation.** Do not create a reversal score or pass/fail finding in this proof. The artifact should prepare a human
comparison with four fields:

- what the player was invited to believe before;
- the later fact or event;
- which earlier observations acquire a different reading; and
- which intended actions become newly attractive, suspect or impossible.

Require at least one earlier line to be cited in the editorial annotation. In cold play, ask “Did anything change what
you thought was going on?” and record the answer. If the answer is no, the structure may still be sound; do not force a
twist into every short adventure.

**Misleading success to reject:** the player learns the steward's name after learning that bronze is missing, but their
interpretation and intended response do not change.

### 15.11 Mechanical cost can be trivial, hidden or falsely exclusive

**Problem.** Spending one common coin technically satisfies a cost. A relation can close another ending even though the
player never knew that possibility existed. Conversely, an emotionally meaningful promise may have no numeric cost.

**Mitigation.** A climax cost in the reference proof must be:

- **prepared:** its possibility or value was perceptible before commitment;
- **attributable:** the decisive act causes or knowingly accepts it;
- **persistent:** it survives the immediate result; and
- **answerable:** later prose, opportunity or state acknowledges it.

Classify costs as resource, bodily risk, relationship, obligation, place/world change or foreclosed option. Report the
preparatory showing and later answer. Do not compare unlike costs numerically. A foreclosed option counts only if it was
previously available or credibly foreshadowed to this player.

**Misleading success to reject:** an ending condition asserts `paidPrice(party)` after deducting one abundant ration,
with no prior mention or later consequence.

### 15.12 Ending and return semantics can conflict

**Problem.** In a standalone campaign an `Ending` closes the book immediately; in an installed chapter the world can
continue and aftermath can answer it. A checker that asks for a post-ending return may demand an impossible trace in
one context or accidentally test only the generated-world installation. Some existing adventures deliberately end at
the remote site.

**Mitigation.** State the host context in every review artifact: standalone book, installed chapter, situation or
going-on. Define “return” structurally as **an answer after the decisive act**, not always travel after a formal Ending.
It may occur:

- before the standalone Ending is reached;
- after a chapter Ending in the shared world;
- in the ending epilogue, if it specifically renders earlier people/place reacting; or
- at a later revisit for a continuing situation.

DRAMA-05 must report which form supplied the answer. Do not add a dummy walk home before every Ending. If the design is
tragic disappearance, exile or death, record the deliberate absence of return and ask what answers the action instead.

**Required fixtures:** one standalone ending with pre-ending return, and one installed chapter with post-ending
aftermath.

### 15.13 Generated and assembled worlds complicate source ownership

**Problem.** A first-hour scene may combine an origin template, generated person, shared rule, authored place, voice
table and installed adventure. “The module's Incident” may not own the opening or even be installed when the game
begins. IDs can be namespaced or generated, and the same template can produce different words from seed values.

**Mitigation.** Provenance must distinguish:

- declaration owner;
- installation/namespace;
- generator or template entry;
- rendered values and seed; and
- the module whose dramatic claim is being assessed.

An Incident check begins only when its installation exists and `when` can be evaluated. Do not charge an authored
province's six-command budget against character creation or a distant country's road. For a generated roadside scene,
attach the experimental claim to the scene/template instance, not to the whole generated country.

Store the rendered output in the artifact; provenance alone is not sufficient to reproduce a filled template after
tables change.

### 15.14 Provenance can infect every presentation type

**Problem.** Adding source references to every string, screen field, voice entry and action label could become a broad
type migration that delays the actual reading tool. Partial provenance may also be mistaken for complete lineage, and
file-line references become stale after edits.

**Mitigation.** Begin with an out-of-band provenance envelope at the review boundary and instrument only producers met
on the selected route. Use stable semantic IDs as identity; file and line are display hints. Report coverage by visible
unit and word count, separated into exact, producer-only and unknown. Never infer exact provenance by string equality.

Promote provenance into shared presentation types only after Phase A identifies repeated manual joins or ambiguity
that cannot be solved at the boundary. A 70% honest route report is preferable to a six-week “universal provenance”
refactor with no reviewed journey.

**Stop condition:** Phase A changes save formats or more than a narrow set of presentation producers before emitting
its first chronological Markdown.

### 15.15 Live-recorded and replayed pages can both be true and disagree

**Problem.** A transcript replayed after prose, ranking, generation or presentation changes may take the same command
and reach the same digest but show different choices or narration. A digest proves state agreement, not experiential
agreement. The chosen command may no longer have been visibly offered under the same label.

**Mitigation.** A live-recorded artifact freezes exact before/after frames during the original commands. A replay artifact records fresh
frames and links the source transcript and current revision. Comparison has three independent verdicts:

- **state:** step digests agree or diverge;
- **offer:** the command remains offered, with same or changed label/rank/context; and
- **presentation:** displayed prose/structure agrees or differs.

Do not let a state-equivalent replay overwrite live-recorded pages. If a command resolves by ID but no longer appears in the
before frame, mark the replay experientially invalid even if execution succeeds.

**Required test:** same command and digest, changed visible label and narration; state passes while offer/presentation
report changes.

### 15.16 Review artifacts can become enormous or expose private play data

**Problem.** First-hour frames can repeat most of the page and offered set at every step. Captured annotations or custom
character names may contain player-provided material. Committing all artifacts can bloat the repository and preserve
data a participant did not agree to publish.

**Mitigation.** Normalize repeated structures where practical, but optimize only after measuring the reference hour.
Keep one small, consented reference artifact in the repository; store larger recordings in the existing evidence
location or outside version control according to project practice. Before committing, remove participant identity and
review free text, custom names and recording metadata. The artifact format should support a redacted display name while
retaining stable internal entity IDs.

Record artifact size, generation time and peak memory as Phase A evidence. Set budgets from that measurement rather
than inventing compression machinery in advance.

### 15.17 Legacy rollout can turn advice into hundreds of meaningless failures

**Problem.** The corpus contains different forms, unfinished modules, adventures with no Objectives or Endings, and
historical content not authored for this declaration. Enabling DRAMA-01 globally would produce a wall of warnings,
invite mechanical retrofits and make existing useful lint harder to hear.

**Mitigation.** Roll out through explicit conformance:

1. one fixture and one reference slice;
2. an opt-in `--drama` verification profile;
3. two contrasting adventures reviewed by humans;
4. a corpus report with no failures added to ordinary lint; and only then
5. a decision about expectations for new whole adventures.

If adopted, distinguish “legacy/unassessed,” “declared/unevidenced,” “trace-evidenced” and “player-accepted.” Never
rewrite legacy status as failure merely because the declaration did not exist.

### 15.18 Checks can become targets and displace the actual first-hour outcome

**Problem.** Once named DRAMA checks exist, work can optimize their counts: insert an early incident line, branch two
flags, move an NPC twice, decrement a resource, add reaction text and declare success. This would reproduce the planning
report's central warning: mechanisms landed while independent reviewers perceive no improvement.

**Mitigation.** Keep the hierarchy explicit:

```text
cold player's coherent account and desire to continue
    > chronological journey review
        > trace evidence
            > declaration and lint hygiene
```

The Phase C demonstration fails if the checks pass but the cold player cannot state the problem, choice and consequence
or does not encounter a reason to continue. Do not respond by weakening the player protocol or adding more declarations.
Use the artifact to find the mismatch and revise the experience.

No DRAMA pass count belongs in the project headline, sprint velocity or corpus quality percentage. Report findings per
reviewed journey with their evidence strength.

## 16. Decision record required after the proof

Phase D should end with a short decision record answering these questions with evidence, not enthusiasm:

1. Did the journey artifact lead to edits that a cold player or human editor preferred?
2. Did `Incident` reveal a problem the chronological reading alone did not?
3. Could two authors apply the declaration consistently to the same adventure?
4. Which findings produced useful edits, and which produced argument or mechanical compliance?
5. How much production code, artifact size and author work did the proof add?
6. Did the chosen adventure become more legible without becoming more formulaic?
7. Should the outcome be: adopt Incident, revise it to a broader opening-situation concept, retain it only as review
   metadata, or remove it while keeping the journey-review facility?

The default after an ambiguous proof is to keep the observational facility and decline the new language. Observation is
useful across prose, first-minute coherence and later research; a weak dramatic abstraction would become permanent
authoring debt.

## Appendix A — Recommended source model and concrete annotation plan

The preceding sections deliberately left open whether the author's dramatic claim should be a sidecar, annotations on
existing declarations, or a new Kyr object. Reading the actual adventures makes the choice clearer.

### A.1 Recommendation: one centralized, non-runtime `Story` block in Kyr

Use **new Kyr syntax**, but make it declarative review metadata rather than executable fiction:

```text
Story keeping "The keeping of the Long Wall" {
  Incident failing_wall "The Long Wall is failing"
    when not state(leak_gate, mended) and not drawn(hollow) and not broke(long_man)
    resolved when state(leak_gate, mended) or drawn(hollow) or broke(long_man).

  Beat false_bounty as opening
    when knows(party, bounty_known)
    shown by notice.

  Beat wall_and_theft as reversal
    when knows(party, wall_known) and knows(party, teeth_taken)
    shown by sluice_teaches, teeth_missing
    reframes false_bounty.
}
```

This is an annotation layer in the semantic sense—it describes existing material—but it is not punctuation attached
to every `Observe`, `Rule`, `Action` or `Ending`. It should live in one `story.kyr` file per reviewed module and compile
to typed tables on `Module`. It must not lower into entities, relations, rules or actions, and it must not alter play.

This design is preferable to the alternatives:

| Form | Advantage | Structural problem | Decision |
|---|---|---|---|
| Add `Opening`, `Reversal`, etc. to existing declarations | The role sits beside the prose | A beat often consists of several declarations in different files; roles become scattered and hard to review; one declaration can serve several stories | Reject as the primary form |
| JSON/YAML sidecar | Cheap prototype; no grammar work | No Kyr parser references, namespacing, predicate checking or writer round-trip; IDs drift; author must learn two languages | Use only for a throwaway Phase A mock-up |
| Make `Incident` a runtime entity with relations | Existing world machinery can query it | Pollutes ontology and saves with an editorial abstraction; encourages player UI and rules to depend on plot metadata | Reject |
| Make `Incident` one large object containing every route, companion and ending | Everything is centralized | Makes “incident” mean the entire adventure and creates a monolithic grammar that cannot represent occasion-led forms honestly | Reject |
| Central `Story` metadata block with typed parts | One reviewable declaration; predicates and IDs compile with the module; no runtime effects | Requires a small grammar/parser/compiler path and careful namespacing | Adopt experimentally |

The block is not a canonical plot. A module may contain more than one reviewed Story; the first proof authors and
selects one. The Story's IDs exist in an authoring namespace only; they are not addressable by Kyr predicates.

### A.2 Separate three kinds of annotation

Do not put all review information into the same table.

1. **Authored structural claims live in the `Story` block.** These include the incident, intended beat roles, paths,
   visible-system thread, companion thread and prepared outcomes. They are versioned with the content and use stable
   declaration IDs and predicates.
2. **Observed occurrences live in `JourneyReviewV1`.** These say that `sluice_teaches` was actually perceived at step
   18, `field_wets` fired at watch 240, or a path's commitment predicate became true after a particular command. They
   are generated evidence, never hand-authored source.
3. **Editorial judgments live in review annotations.** “This really overturns the bounty,” “Hern seems to choose,” or
   “the cost was not legible” belongs to the review artifact or review Markdown, with reviewer and revision. It is
   not a Kyr fact and must not be required to run the module.

This separation prevents the worst circularity: the author cannot make a beat happen by labelling it, and the tool
cannot turn an occurrence into a judgment merely because it matched a predicate.

### A.3 Proposed compiled representation

Add an optional authoring-only field to `Module`:

```ts
export type StoryBeatRole =
  | 'opening' | 'pressure' | 'preparation' | 'revelation' | 'reversal'
  | 'companion' | 'climax' | 'cost' | 'return';

export interface StoryRef {
  // A declaration that can be observed in a review trace. The compiler resolves and namespaces it.
  id: string;
  kind: 'observation' | 'source' | 'rule' | 'event' | 'topic' | 'action';
}

export interface StoryIncident {
  id: string;
  title: string;
  when: Predicate;
  resolved: Predicate;
}

export interface StoryBeat {
  id: string;
  role: StoryBeatRole;
  when: Predicate;
  shownBy: StoryRef[];
  reframes?: string[];       // Story beat IDs, not runtime declaration IDs.
}

export interface StoryApproach {
  id: string;
  title: string;
  available: Predicate;
  committed: Predicate;
  resolved: Predicate;
  evidencedBy: StoryRef[];
  costs?: string[];          // Story beat IDs whose role is cost.
}

export interface StoryThread {
  id: string;
  kind: 'companion' | 'system';
  subject?: string;          // Required person for companion; optional entity for system.
  beats: string[];           // Ordered Story beat IDs.
}

export interface StoryOutcome {
  id: string;
  title: string;
  when: Predicate;
  preparedBy: string[];      // Earlier Story beat or approach IDs.
  endings?: string[];        // Existing Ending IDs where the module has them; several epilogues may share an outcome.
}

export interface StorySpec {
  id: string;
  title: string;
  incident: StoryIncident;
  beats: StoryBeat[];
  approaches?: StoryApproach[];
  threads?: StoryThread[];
  outcomes?: StoryOutcome[];
}

export interface Module {
  // existing fields …
  stories?: StorySpec[];
}
```

Keep the original local IDs in parse fields until the normal module namespacing step. The module compiler must resolve
every `StoryRef`, companion subject and optional Ending against the fully joined module, using the same local-to-module
identity rules as Objectives and predicates. Do not store file line as identity.

`StorySpec` must be omitted from `WorldState` and the gameplay digest. It may travel with a serialized compiled module
where the module already does, but changing only Story metadata must not change offered actions, runtime state or replay
agreement.

### A.4 Proposed grammar

Do not put all of this into the first parser change. The eventual grammar can be:

```text
Story = "Story" ident string "{" StoryIncident StoryPart* "}"
StoryPart = StoryBeat | StoryApproach | StoryThread | StoryOutcome

StoryIncident = "Incident" ident string
  "when" Predicate
  "resolved" "when" Predicate "."

StoryBeat = "Beat" ident "as" StoryBeatRole
  "when" Predicate
  "shown" "by" NonemptyListOf<ident, ",">
  StoryReframes? "."
StoryBeatRole = "opening" | "pressure" | "preparation" | "revelation" | "reversal"
  | "companion" | "climax" | "cost" | "return"
StoryReframes = "reframes" NonemptyListOf<ident, ",">

StoryApproach = "Approach" ident string
  "available" "when" Predicate
  "committed" "when" Predicate
  "resolved" "when" Predicate
  "evidenced" "by" NonemptyListOf<ident, ",">
  StoryCosts? "."
StoryCosts = "costing" NonemptyListOf<ident, ",">

StoryThread = "Thread" ident "as" StoryThreadKind StorySubject?
  "through" NonemptyListOf<ident, ","> "."
StoryThreadKind = "companion" | "system"
StorySubject = "of" ident

StoryOutcome = "Outcome" ident string
  "when" Predicate
  "prepared" "by" NonemptyListOf<ident, ",">
  StoryEndings? "."
StoryEndings = "endings" NonemptyListOf<ident, ",">
```

The first grammar increment should implement only `Story`, `Incident` and `Beat`. That is enough to prove centralized
metadata, reference validation, trace occurrence and reframing without prematurely fixing the route-equivalence model.
Add `Approach`, `Thread` and `Outcome` only after Phase A can show their predicates and occurrences in the artifact.

The syntax deliberately uses predicates for `when`, `available`, `committed`, `resolved` and outcome conditions. Those
are statements about authoritative state. It uses IDs for `shown by` and `evidenced by`, because those are statements
about authored perceptible moments. Do not substitute prose strings or infer either kind from the other.

### A.5 Stable references: what can be named now and what cannot

The current module already gives stable IDs to:

- `Observe`, `Rule`, `Event`, `Action`, `Topic`, `Discovery` and its named `Source`, `Objective`, `Milestone` and
  `Ending` declarations;
- people, things, items, places and passages; and
- predicates over relations, measures and state.

Those are suitable Story references after compiler validation. Two cases need care:

1. **A named `Discovery Source` is an entity, not a prose-producing declaration.** It counts as shown only in a step
   that examines or hears that source and newly gains the fact it reveals. Merely standing near `notice` or finding it
   `noticeable` is not an occurrence. The review observer must record the chosen source and knowledge delta so it can
   make this attribution without guessing from text.
2. **A `Thing`'s `Change` is not authored as a top-level declaration.** Its runtime command is a generated
   `change_thing(...)` operator whose identity incorporates thing and change IDs. Do not expose that generated command
   spelling in Story source. In the first version, describe commitment with the resulting predicate—for example
   `state(wheel, turned)`—and cite a subsequent visible rule such as `lake_drawn`. Later, if direct evidence is needed,
   introduce a typed source reference such as `wheel.turn`, resolved by the compiler to the generated operator.
3. **A `Discovery` does not itself occur.** It is known because an observation, topic, action or rule teaches/asserts it.
   `shown by bounty_known` is therefore ambiguous unless the review system can identify the exact source that taught
   it. Prefer the concrete producer (`beadle_why`, `sluice_teaches`, `teeth_missing`) in Story beats. Permit a Discovery
   ID only as an assertion about resulting knowledge, not as evidence that particular words appeared.

If the proof later needs direct references to nested changes, extend the compiled union with a typed
`{ kind: 'change'; subject: string; change: string }` and add unambiguous source syntax such as `wheel.turn`. Do not add
string forms for generated rules or commands merely to make the annotations pass.

### A.6 Concrete Story sketch: *The Long Man*

*The Long Man* is the best first structural specimen because its runtime state already expresses most of the rubric.
Its Story block would annotate these existing beats:

| Intended beat | Existing declaration/state | Why it belongs |
|---|---|---|
| Misleading commission | `bounty_known`, concretely taught by the notice/topic that exposes it | The player is told to lay the Mower for forty crowns |
| Problem already moving | `mower_hunts`, `field_wets`, later `storm_comes` | Bronze is already gone; the keeper seeks it; water rises without the party |
| First visible symptoms | `springs_hum`, `field_drowned`, `folk_water`, `ox_bailing` | The leak becomes physical and public rather than a hidden counter |
| Mower's contrary behavior | `mower_crest` teaches `mower_keeps` | The supposed monster is maintaining the wall |
| Structural revelation | `sluice_teaches` teaches `wall_known` | The “Long Man” is a dam, not a barrow or giant |
| Human cause | `teeth_missing` teaches `teeth_taken`; `ledger_known` identifies Venn's sales | The bounty is reframed as cover for the steward's theft |
| Repair preparation | `shutter_looked`, `fit_teeth`, state `leak_gate = fitted` | The physical means and missing material are legible |
| Repair by company | `fit_teeth`, then `leak_gate.heave`, ending in `state(leak_gate, mended)` | One enacted resolution |
| Repair by keeper | `mower_mends` or `mower_mends_bell` | A socially different resolution: trust the apparent monster or sacrifice the parish bell |
| Draw down the lake | `rod_fits`, `wheel.turn`, `draw_begins`, `lake_drawn` | A third resolution that saves the wall by flooding field and mill |
| Evacuate and endure failure | `notches_known`, `bell_rung`, `long_man_breaks`, `folk_saved` | Prepared survival rather than repair; the place pays the cost |
| Costs | `bellSpent`, `drowned(low_field)`, `drowned(millhouse)`, `broke(long_man)`, possibly the taken `mask` | Costs are different in kind and visibly answered |
| Return/answer | `after_mended`, `after_drawn`, `after_broken`, plus `after_bell`, `after_warden`, `after_hall_cold` | The green, yard, parish and Hall answer what happened |
| Outcomes | the existing `Goal`: mended; drawn; or broken/calm/folk saved | Three outcomes exist even though the module declares no formal `Ending` |

A fuller illustrative block—not the required first parser increment—would be:

```text
Story keeping "The keeping of the Long Wall" {
  Incident failing_wall "The Long Wall is failing"
    when not state(leak_gate, mended) and not drawn(hollow) and not broke(long_man)
    resolved when state(leak_gate, mended) or drawn(hollow) or broke(long_man).

  Beat bounty as opening
    when knows(party, bounty_known)
    shown by notice.
  Beat water_rises as pressure
    when drowned(low_field)
    shown by field_drowned, folk_water, ox_bailing.
  Beat keeper_seen as revelation
    when knows(party, mower_keeps)
    shown by mower_crest
    reframes bounty.
  Beat wall_and_teeth as reversal
    when knows(party, wall_known) and knows(party, teeth_taken)
    shown by sluice_teaches, teeth_missing
    reframes bounty, keeper_seen.
  Beat venn_exposed as revelation
    when knows(party, ledger_known)
    shown by ledger
    reframes bounty.

  Beat bell_cost as cost
    when bellSpent()
    shown by mower_mends_bell, after_bell.
  Beat draw_cost as cost
    when drawn(hollow)
    shown by lake_drawn, mill_drowned.
  Beat breach_cost as cost
    when broke(long_man)
    shown by long_man_breaks, after_broken.

  Beat dale_answers_mended as return
    when calm(long_man) and state(leak_gate, mended)
    shown by after_mended.
  Beat dale_answers_drawn as return
    when calm(long_man) and drawn(hollow)
    shown by after_drawn.
  Beat dale_answers_broken as return
    when calm(long_man) and broke(long_man)
    shown by after_broken.

  Approach restore_teeth "Restore the stolen bronze"
    available when knows(party, teeth_taken)
    committed when state(leak_gate, fitted) or keeps(mower, teeth)
    resolved when state(leak_gate, mended)
    evidenced by fit_teeth, mower_mends.
  Approach draw_lake "Draw Hollow Water down"
    available when knows(party, rod_fits)
    committed when state(wheel, turned)
    resolved when drawn(hollow)
    evidenced by draw_begins, lake_drawn
    costing draw_cost.
  Approach save_dale "Warn Merrow and survive the breach"
    available when knows(party, notches_known)
    committed when convinced(ysolt)
    resolved when broke(long_man) and not lostToWater(folk)
    evidenced by bell_rung, folk_saved
    costing breach_cost.

  Thread water as system of long_man
    through water_rises, wall_and_teeth, draw_cost, breach_cost.

  Outcome kept "The wall is kept"
    when state(leak_gate, mended)
    prepared by wall_and_teeth, restore_teeth.
  Outcome lowered "The lake is lowered"
    when drawn(hollow)
    prepared by wall_and_teeth, draw_lake.
  Outcome broken_saved "The wall breaks and Merrow lives"
    when broke(long_man) and calm(long_man) and not lostToWater(folk)
    prepared by water_rises, save_dale.
}
```

The `notice` and `ledger` IDs are existing named `Discovery Source`s. The `wheel.turn` reference is illustrative syntax
for a nested `Thing Change` and does not exist as a source-level reference today; its commitment predicate is usable
without it. That gap should be resolved only if Phase A shows that direct change provenance is necessary.

#### The companion requirement does not currently pass

Dunnet has strong authored beats—`mower_hunts` injures him, `dunnet_bound` changes his stance, `pell_told` makes him
confess, `pell_known` exposes Venn, and he may become warden in `after_warden`. But he is not a recruited companion with
agency across the expedition. The Mower is an actor with desire (`Wants bell_teeth`) and decisive behavior, but not a
companion either.

Do not annotate either as passing the companion row. Choose one of three honest responses:

1. reauthor Dunnet so he can join for part of the descent and independently refuses/intervenes/leaves across separated
   beats;
2. use *The Long Man* to prove every row except companion agency and use a second specimen for that row; or
3. revise the rubric from “one companion” to “one continuing character with agency” if that is the actual design
   intention.

The first option is content work, not metadata work, and must be cold-played. The second is the safest implementation
proof. The third requires an owner decision because it changes the desired game.

### A.7 Contrast specimen: *A Winter in Carth*

This adventure shows why the outer object should be `Story`, not `Incident`. Its opening is an occasion and commission:
the Consistory will sit on Ninian Hern on Ash Day, and an injured beadle asks the company to take him there. The problem
is not initially “a wall is failing”; it is “what will you do with responsibility for this man before a judgment?”

Candidate annotations from existing declarations are:

| Story role | Existing beat |
|---|---|
| Opening occasion | `beadle_why` teaches `beadle_offer`; `take_custody` or `refuse_custody` is the first commitment |
| Agency/companion beat 1 | Hern accepts custody and follows, or `hernAhead` after refusal; he proceeds either way |
| Interpretive question | `cross_question`, followed by `say_love`, `say_own` or the trade answer |
| Independent agency | `hern_gives_himself_up`, `hern_leaves_you` or `hern_keeps_appointment` at noon on Fastens' Eve |
| System | `pains(party)`, the Register/penance economy and the Ash Day clock; these must be shown through actual tallies, prices and consequences, not merely counted |
| Reframing evidence | `vigil_kept`, `ellen_wray`, `vigil_refused`, and Hern's conduct at Carth test whether proxy penance is commerce, love or evasion |
| Climax | `testify_carth`, `testify_road`, `offer_to_bear`, or refusal to intervene during the Consistory |
| Costs | bearing the sentence, Hern's recantation/putting-out, unpaid pains, compromised households or institutions |
| Return/answer | the fate rules and endings after `accounting()`; some answers occur in epilogue rather than literal return travel |

For the experiment, declare an Incident only if its title can be stated without falsifying that form, for example:

```text
Incident hern_judged "Ninian Hern will be judged on Ash Day"
  when not verdictGiven(consistory)
  resolved when verdictGiven(consistory).
```

That is a bounded impending decision, not a deteriorating physical crisis. If the tooling assumes every Incident has a
numeric pressure or autonomous damage, this specimen should fail the tooling—not be rewritten to imitate the Long Man.

Hern is a much stronger companion-thread candidate than Dunnet because he travels with the company, asks a question,
acts at Carth, keeps his own appointment and may accept or reject what follows. An illustrative thread could be:

```text
Thread hern as companion of hern
  through custody_taken, question_walked, carth_choice, appointment_kept, judgment_answered.
```

The named beats still require actual `Beat` declarations connecting these editorial names to existing rules/actions.
The thread itself does not grant agency; the report must show that at least `appointment_kept` arose from Hern's rule,
not a direct player command.

### A.8 Negative specimen: *Wrayford / The Third Night*

Wrayford has an exceptionally clear opening image and pressure:

- `drove_home` / `drove_stranger` show three shapes on the gatehouse;
- the rail's `hanging` state and `decree_scene` make the physical problem present;
- `hulme_reasons` and `captain_question` establish the captain's third-day judgment;
- `kit_plan`, `worse_clause`, `mothers_walk` and the captain's arrival advance the city without the player;
- `hand_match` and `hal_wrote` reframe responsibility inside the reeve's family;
- `cut_down`, lawful release, the mothers' procession and political bargaining create distinct enacted approaches.

It is nevertheless a poor first conformance target. It declares eleven formal Endings, while the proposed rubric asks
for two to four. Several endings distinguish where the player was or which body crossed rather than four prepared
strategic outcomes. Its ensemble has several candidate continuing characters, but no single obvious companion spine.

Use Wrayford as a **negative architecture test**:

1. Can one Incident and pressure system be annotated without pretending there is one protagonist NPC?
2. Does outcome grouping reveal four larger families—rebellion/disaster, lawful release, covert burial, compromise or
   betrayal—without changing the runtime Endings?
3. Can the report show that eleven endings exist beneath four editorial outcome families?
4. Does the annotation burden become unreasonable for a deliberately ensemble adventure?

This is why `StoryOutcome.endings` is a list: one prepared outcome family may include several runtime epilogues. Do not
add Outcome parser support in the first slice; preserve this as a model requirement established by Wrayford.

If Wrayford can conform only by deleting meaningful distinctions or inventing a companion, the rubric is too narrow
for this form. The report should say so rather than make the adventure mechanically pass.

### A.9 What the builder should implement first

The concrete first change should be smaller than the full grammar above:

1. Add `stories?: StorySpec[]` with only `StoryIncident` and `StoryBeat` populated; keep approaches, threads and
   outcomes optional and behind no parser support.
2. Add `Story`, `StoryIncident`, `StoryBeat`, `StoryBeatRole` and `StoryReframes` to `Kyr.ohm`.
3. Implement a dedicated `StoryParser` parallel to `InformationParser`, `Endings` and `Milestones`; do not crowd
   `ModuleParser` with all semantics.
4. Add a `story` field to `module-declarations.ts` that **collects** Story metadata but does not lower it into runtime
   rules. Extend `ModuleBundle.joined` explicitly; it currently enumerates every optional collection and would otherwise
   discard Stories declared in source files.
5. Extend `ModuleNamespace` explicitly. Scope Incident/Beat predicates through its predicate mapper; prefix Story and
   Beat IDs in an authoring namespace; and resolve each producer reference to the same installed ID assigned to its
   observation, rule, action, topic, event or named source. A parsed local Story must remain connected to occurrences
   after the adventure is installed as a chapter.
6. In `module-compiler.ts`, validate Story predicates with the other predicates and settle any permitted Deem
   expressions during instantiation. Validate:
   - unique Story IDs and exactly one Incident per Story (the grammar should make the latter structural);
   - unique Story-local IDs;
   - every `shown by` reference resolves to a perceptible producer;
   - every `reframes` reference resolves to another beat in the same Story, and the reframing graph has no cycle;
   - predicates type-check through the existing call/signature validation; and
   - Story metadata does not introduce variables or reference unavailable local declarations.
7. Teach `ModuleWriter` to round-trip the block without reconstructing it from runtime rules.
8. Add one fixture containing an observation, a teaching topic, an autonomous rule and a two-beat Story; prove parse,
   namespace, join, write and reload.
9. Add only the opening and reversal beats for *The Long Man*. Generate the chronological report and inspect whether
   those references actually occur before adding route syntax.

The second change should add `Approach` only after semantic deltas can distinguish `available`, `committed` and
`resolved`. The third should add threads/outcomes only after *Winter in Carth* and Wrayford have tested the model's
limits. This order prevents the grammar from encoding guesses that the review artifact cannot observe.

### A.10 Diagnostics the syntax needs

Diagnostics should speak in authoring terms and point to both sides of the reference:

```text
Story keeping, Beat wall_and_teeth: shown by teeth_taken, which is a Discovery,
but no occurrence of a Discovery is directly visible; name the Observe, Topic, Rule,
Event or Action that teaches it (perhaps teeth_missing).
```

```text
Story keeping: the reframing chain bounty -> wall_and_teeth -> bounty is circular;
reframing must describe an acyclic change of interpretation.
```

```text
Story keeping: Incident failing_wall is already resolved whenever it exists;
its `when` and `resolved when` predicates overlap in the initial world.
```

The last diagnostic cannot be proved for all worlds by syntax alone. At minimum evaluate both predicates in the
campaign's initial state and in submitted traces, and phrase the finding accordingly. Do not build a general theorem
prover for predicates.

### A.11 Author workflow after implementation

For one adventure, the intended workflow is:

1. Run or record an honest journey without Story metadata.
2. Read its chronological account and mark candidate moments in review annotations.
3. Write a small `Story` block referencing the existing declarations that actually produced those moments.
4. Run `kyrie review` to overlay claimed beats on observed steps.
5. Revise content where a beat is absent, late, hidden or contradicted. Do not revise the annotation merely to point at
   an easier passing line.
6. Add a second and third honest route, then introduce `Approach` metadata if the comparison proves useful.
7. Conduct human and cold-player review.
8. Only after the experience is accepted should the Story block become a maintained conformance artifact.

The Story block is therefore the final concise account of an observed and revised structure, not a substitute for
authoring the adventure and not the first outline from which runtime content is generated.
