# Defect centres: why Westernesse produces so many issues

20 November 2026. A creative, product and architectural diagnosis of the recurring defects in Westernesse, written
after the architectural review and the review of the cold-play process. Read against the current `main` at
`87a51dfe2`; no code or data was changed for this study.

## Executive answer

Westernesse does not have a thousand independent problems. It has a small number of **defect-producing boundaries**
whose failures appear as hundreds of different symptoms.

The most important centres are:

1. **Several systems own one player-facing meaning.** Runtime, presentation, UI, browser, runner and automation can
   each interpret an opportunity differently.
2. **The world records consequences more readily than it completes responses.** Players can discover and change
   things that nobody can discuss, recognize, reward, repair or carry forward.
3. **One command crosses several lifecycle coordinators.** Travel, combat, time, expansion, narration, aims,
   transcript and projection can disagree about when an act began or ended.
4. **Generated composition is locally valid but globally under-informed.** Pieces are produced independently and
   joined after decisions that would have needed knowledge of one another.
5. **Recurring dramatic intentions are authored from low-level facts.** Each scenario rebuilds schedules,
   conversations, recognition, pursuit, offices and outcomes, creating many near-correct variants.
6. **The supported possibility space is effectively unbounded.** Every generated combination is exposed as though it
   were an equally finished promise.
7. **Verification is strongest below the scale at which players are disappointed.** Thousands of local proofs can
   coexist with a first hour that loses its thread or fails to answer a deed.
8. **The register preserves every kind of obligation in one numerical field.** Discovery, decomposition and honest
   splitting make the count grow even when the product improves.

The highest-leverage response is therefore not a general bug sweep. It is to close the factories:

- one immutable authoritative player frame;
- one explicit command transaction and receipt;
- a first-class response/recognition model;
- bounded situations that control the active possibility surface;
- richer composition contracts and provenance;
- a small library of proven dramatic patterns;
- one supported first-hour slice judged as a complete experience;
- a portfolio register in which only reproduced blockers become active work.

If only three changes can be made, make these:

1. Finish one authoritative `PlayerFrame`/`Doable` boundary and remove client inference.
2. Make every important discovery and deed complete a typed response loop: who can know, what they may do about it,
   what acknowledgment follows, and what new possibility results.
3. Put all first-hour effort into one bounded 30–45 minute experience until rendered cold players voluntarily
   continue, while capping active register work.

## Evidence and limits

The current register reports 1,053 rows, of which 446 are live: 278 open, 123 partly, 45 deferred. There are two live
P0s and 98 live P1s (82 open and 16 partly). These totals are accounting facts, not a defect count: rows include
requirements, decisions, gates, directions, duplicates and split remainders as well as observed failures.

The live-ticket feature view shows where symptoms surface:

| Surface | Live rows | P0/P1 |
|---|---:|---:|
| page UI | 160 | 81 |
| undertakings | 103 | 41 |
| fight | 84 | 41 |
| travel | 58 | 28 |
| opening | 42 | 28 |
| terminal | 36 | 26 |
| atlas | 53 | 25 |
| adventures | 58 | 24 |
| prose | 62 | 23 |
| creation | 37 | 20 |
| talk | 27 | 18 |

These labels overlap in cause. A broken journey can be recorded under travel, undertakings, page UI, atlas and
opening. The table should not be read as “page UI contains 160 unrelated bugs.” It is evidence that player-facing
composition is where deeper disagreements become visible.

Cold plays 2–7 repeatedly scored 5 to 6.5 despite identifying passages of excellent writing and play. Their reports
are more diagnostic than the number:

- cold play 2: “for the writing and the dungeon, not for the interface or the fights”;
- cold play 3: the principal requested improvement was that the offer lead with what was pursued rather than an
  eighty-item wall;
- cold play 4: three small stories with real endings, held down by hidden situations, abrupt threads and accumulating
  contradictions;
- cold play 5: an excellent sea-gate adventure, held down because discoveries and deeds received no answer;
- cold plays 6 and 7: strong openings destroyed by sudden, unreadable deaths with little player participation;
- cold play 9: good town and dungeon play ending in an inability to leave town through the rendered interface.

The evidence is strong enough to identify recurring causes. It is not a statistical sample of human players, and the
feature counts are generated classifications rather than an independent defect taxonomy.

## The important distinction: defect clusters versus defect centres

A **cluster** is where defects are observed: combat, travel, talk, the page. A **centre** is a mechanism that keeps
creating them.

For example, these observations look separate:

- a gold opener executes the wrong child;
- a runner offers sixty flat choices where the page groups them;
- a talk row changes underneath a number key;
- a map signal promises a journey with no executable row;
- an aim is shown but not available after moving between panes.

They cluster in several features. Their common centre is that several layers reconstruct an opportunity instead of
receiving one authoritative typed object.

Work organized by clusters produces endless local fixes. Work organized by centres can remove whole families.

## Centre 1: several owners interpret one opportunity

**Confidence:** very high.  
**Primary symptoms:** page UI, terminal, atlas, undertakings, travel, talk, opening.  
**Existing direction:** `Doable`, the opportunity architecture, trust contracts, architectural-review Finding B.

The runtime knows which grounded operators are legal. `PlayerView`, presentation and UI add knowledge, grouping,
promotion, aims, indicators and wording. Browser, terminal, runner and autoplay then make further decisions about
what a row means, what an opener selects and which command is executed.

The result is semantic fan-out:

```text
offered operator
   ├── player-safe choice
   ├── promoted act
   ├── lens child
   ├── opener
   ├── map mark
   ├── terminal row
   ├── runner offer
   └── browser control
```

When those are derived independently, a correction in one view does not repair the others. Worse, each presentation
object tends to contain only the fields needed by its first consumer. Later consumers infer missing availability,
target, restriction, provenance or purpose from text, position or the first child.

### Why it creates so many rows

Every semantic discrepancy can manifest at every client, viewport, interaction mode and state transition. One missing
field becomes several bugs:

- incorrect highlighting;
- incorrect grouping;
- correct label with wrong command;
- stale control after state changes;
- parity failure between runner and page;
- inability to explain why an opportunity is absent;
- tests that pin one rendering without pinning the shared meaning.

### Specific change

Finish a single immutable `PlayerFrame`, with `Doable` as its executable opportunity:

```ts
interface Doable {
  id: string;
  command: string;
  label: string;
  subject?: EntityRef;
  target?: EntityRef;
  role: OpportunityRole;
  state: 'open' | 'withheld' | 'spent' | 'exhausted';
  reason?: PublicReason;
  provenance: OpportunityProvenance;
  aspects: AspectWitness[];
  children?: Doable[];
}

interface PlayerFrame {
  revision: string;
  scene: VisibleScene;
  opportunities: Doable[];
  aims: PublicAim[];
  company: PublicCompany;
  chronicle: PublicEvent[];
  navigation: PublicNavigation;
}
```

An opener must name its command or explicitly be a non-executable container. A mark must carry the witness that
justifies it. A withheld act must carry its typed reason. No client may choose the first child, parse a label, infer
an aspect from colour or rebuild a target from an id.

### Supporting changes

- Build one frame per committed revision and transfer it once to the browser.
- Make browser, terminal, runner and autoplay consume serialized frame fixtures.
- Eliminate direct client imports of campaign, rules and canon.
- Move grouping and promotion into the shared frame; leave only physical layout and input in the client.
- Add a `why opportunity <id>` query generated from provenance and restriction data.
- Add a dependency rule forbidding new semantic imports from clients.
- Delete client-specific choice models as each client migrates; adapters must be temporary and counted.

### Proof the centre is closed

- For a corpus of frames, every client exposes the same command ids, availability and reasons.
- No production client searches or parses choice labels to determine behaviour.
- A mutation that removes command, target, reason or witness fails frame construction, not a browser test later.
- The opportunity dependency cycle between `src/ui` and `src/presentation` has been removed or confined behind one
  frame builder.
- The offer-parity census remains zero without client-specific exceptions.

## Centre 2: incomplete causal and social response loops

**Confidence:** very high.  
**Primary symptoms:** consequence, talk, discovery, undertakings, adventures, prose.  
**Cold-play signature:** “I cared, acted, and then the world did not answer.”

Kyrie is good at recording factual consequences. It is less systematic about what those consequences mean to other
people and what response they enable. Authors commonly implement:

```text
fact discovered → state changed → experience awarded
```

The player expects:

```text
fact discovered
  → can be shown/told/concealed
  → someone understands or disputes it
  → a relationship, institution or situation changes
  → the changed world acknowledges the deed on return
  → a new desire or cost emerges
```

The sea-gate is the clearest case. The player finds a sawn pin, infers sabotage, finds help and shuts the gate. The
mechanical circuit works. The social circuit is absent: relevant people cannot discuss the pin, the town does not
recognize the rescue, promised payment can disappear and the sabotage produces no next state.

Similar defects recur around crowns, grave rings, books, stolen goods, promises, mysteries, paid jobs and deaths.

### Why it creates so many rows

Consequences have a combinatorial audience. A new fact can matter to its giver, victim, authority, companion,
settlement, faction and future situation. Without an explicit response contract, each connection is remembered only
if an author hand-writes it. Missing connections then appear as separate talk, reward, aim, prose, persistence and
content defects.

### Specific change: typed response contracts

Give important discoveries and deeds an authored response declaration. The exact Kyr syntax should follow study of
current cases, but the semantic contract should cover:

- **subject:** what was learned or done;
- **witness:** who knows directly;
- **bearer:** who may tell, show or conceal it;
- **interested parties:** who can respond and why;
- **response forms:** acknowledge, dispute, reward, punish, ask, reveal, redirect, remember;
- **settlement:** when the response is spent or remains available;
- **persistent consequence:** relationship, standing, access, obligation or world state;
- **successor:** what new possibility, desire or pressure follows.

This should compile into ordinary facts, topics, observations, rules and actions rather than create a parallel story
engine.

### Supporting changes

- Add generic `tell`, `show`, `return`, `apologize`, `repay`, `accuse` and `thank` patterns whose applicability comes
  from typed interests, not one-off topic ids.
- Distinguish a fact being true, a person knowing it, a person caring about it and a person having authority to act.
- Give characters small declared wants and jurisdictions that can generate relevant responses.
- Require every first-hour undertaking to name its return/recognition state and at least one failure response.
- Let failure create a new state—debt, injury, suspicion, lost access, changed terms—rather than merely withhold
  success.
- Give important portable evidence a public affordance: show to relevant people, put back, surrender or use.
- Add a `response audit` that starts from a discovery/deed and lists interested people, available responses and
  dead ends.
- In authoring review, draw the complete circuit rather than inspecting isolated actions.

### Proof the centre is closed

- The canonical first-hour slice contains at least three loops that end in social recognition and a new possibility.
- Every important discovery in that slice has a response audit with no accidental dead end.
- Returning after save/resume produces the same recognition state.
- Cold players can accurately answer “who knew what I did?” and “what changed because of it?”
- The most important cold-play improvement is no longer “make the world answer me.”

## Centre 3: the command lifecycle crosses several coordinators

**Confidence:** high.  
**Primary symptoms:** fights resolving invisibly, stale screens, travel discontinuities, time surprises, missing
transcript steps, repeated prose, interruptions and rollback defects.  
**Existing direction:** architectural-review Finding C; open-register AR-01.

A player experiences one act. Internally it may pass through:

- choice resolution;
- campaign execution;
- combat controller;
- creature leases;
- action consequences;
- journey departure and arrival;
- autonomous watches;
- interruption;
- frontier expansion and module installation;
- narration and told-state;
- undertaking updates;
- digest and transcript;
- frame and screen rebuild.

Those stages are individually reasoned about, but there is no single explicit lifecycle value carrying the command
through all of them. Bugs arise when one coordinator considers the act complete before another does.

Cold plays 6 and 7 show the worst player-facing form: a press that the player understood as entering or continuing a
fight allowed several rounds and death to occur before control and explanation returned. Cold play 9 shows a rendered
variant: a valid semantic journey could become a stale or timing-out browser control.

### Specific change: one command unit of work

Represent phases and their permitted mutations:

```text
accepted
  → proposed
  → simulated
  → expanded
  → committed
  → framed
  → recorded
  → published
```

The transaction owns campaign state, creatures, installations, observations, aims and transcript evidence through
commit. It produces one immutable `CommandReceipt` naming:

- action and bindings;
- starting and ending revision/time/place;
- body changes;
- world changes;
- installed content;
- interruptions and fights;
- player decisions made within the command;
- typed consequences and narration inputs;
- resulting digest.

Presentation consumes the receipt and resulting frame. It does not inspect half-completed campaign state.

### Supporting changes

- Make every transfer of control explicit: combat cannot advance a player-controlled actor without a command.
- Put a budget on how much fictional time or how many autonomous decisions one input may cross before interruption.
- Make travel a sequence of committed legs, each with a receipt, rather than one opaque convenience operation.
- Define atomicity around frontier expansion and transcript append, not only campaign execution.
- Fault-inject before and after every phase.
- Keep exactly one busy/transaction guard at the application boundary.
- Replace duplicated sync/async execution with one lifecycle implementation.
- Give the renderer a stable pending/committed protocol so stale controls cannot submit against an unacknowledged
  revision.
- Include frame revision with every browser command and refuse stale commands with a recoverable refresh.

### Proof the centre is closed

- One player input cannot contain an unseen player turn.
- A throw at any pre-commit phase leaves world, bodies, modules, transcript and aims unchanged.
- Each accepted command produces exactly one receipt, one transcript step and one new revision.
- The page never renders controls from revision N after revision N+1 has committed.
- Journey and combat traces show every decision boundary in order.

## Centre 4: generated composition is under-informed

**Confidence:** high.  
**Primary symptoms:** untied story threads, irrelevant rumours, people who cannot discuss nearby events, paintings or
prose that fit a type but not the state, placements that are valid but dramatically awkward.  
**Existing direction:** platform-maturity study §3.2; architectural-review Finding I.

World generation happens in stages. Early stages know geography and templates. Later stages add people, local kinds,
stories, institutions and runtime consequences. A stage can only compose with information already represented in its
vocabulary.

This produces locally valid but globally weak joins:

- a rumour names a site before the raider-hold kit places hobs there;
- a person is generated near a story but has no declared interest in it;
- a painting matches place kind and hour but not the specific condition;
- a module wants a relevant merchant, authority or relation but can request only a place role;
- later situations cannot select someone the company helped or alienated.

### Specific change: richer composition contracts

Extend the assembly ledger with a deliberately bounded semantic projection:

- place roles and qualitative constraints;
- persons, homes, professions and offices;
- ownership and custody;
- wants, debts, loyalties and conflicts;
- institutions and jurisdiction;
- important generated threats and opportunities;
- selected persistent consequences from prior play.

Modules declare requirements, preferences, exports and outcomes against those typed facts. The assembler records why
each binding was selected and which later commitments may consume it.

### Supporting changes

- Delay prose that depends on later bindings until those bindings exist, or render it from typed references at
  runtime.
- Separate topology and qualitative intent from exact geometry.
- Give every generated contribution provenance: table, template, binding, seed and consuming module.
- Permit a later assembly pass to enrich earlier rumours and encyclopedia entries without redrawing identities.
- Define compatibility contracts for modules consuming another module's local kinds or outcomes.
- Add negative constraints and exclusions, not only additive commitments.
- Give scenarios a supported query for relevant people rather than inventing them redundantly.
- Keep the semantic projection small and versioned; do not expose arbitrary runtime facts to generation.

### Proof the centre is closed

- A generated rumour can name the actual occupants, institution or threat placed at its destination.
- A later situation can bind to a person the company helped without hard-coded ids.
- Removing or reordering an unrelated kit does not redraw existing identities.
- An assembly explanation answers why each participant and place was chosen.
- Cross-module story-thread audits report no unnamed or unreachable required endpoint in the supported slice.

## Centre 5: dramatic intentions are rebuilt from low-level facts

**Confidence:** high.  
**Primary symptoms:** repeated near-misses in conversations, schedules, pursuits, institutions, recognition, stages and
outcomes.  
**Existing direction:** platform-maturity study §3.3.

Kyr is expressive enough to implement many dramatic structures, but authors repeatedly spell them as bespoke sets of
facts, rules, stages and topics. Expressiveness without a stable idiom produces variation in correctness.

Examples include:

- a person greeting differently on a second meeting;
- a direct question awaiting an answer, refusal or silence;
- a person moving between places on a schedule;
- pursuit of a moving target;
- an office whose holder has authority;
- a bounded situation with an engagement inside it;
- an undertaking resolving through success, failure, abandonment or changed meaning;
- a deed being recognized on return.

Every hand-built instance can omit one stage, reset rule, interruption, witness or outcome.

### Specific change: extract a small dramatic standard library

Do not add broad new grammar first. Select patterns with at least two successful authored examples and package them
as Kyr libraries, compiler sugar or typed declarations that lower into existing semantics.

The first candidates should be:

1. **Response/recognition**, because cold play repeatedly asks for it.
2. **Situation/engagement lifecycle**, because it bounds the action surface and controls urgency.
3. **Conversation exchange**, including direct questions, answer/refuse/lie/silence and subsequent state.
4. **Schedule/pursuit**, because staged movement is repeatedly handwritten.
5. **Office/authority**, because social consequences need somebody empowered to answer them.

### Supporting changes

- Publish one canonical recipe and lint for each pattern.
- Generate lifecycle diagrams and reachable outcome lists from compiled modules.
- Warn about a begun situation with no escape or terminal outcome.
- Warn about a direct question with no player response forms.
- Warn about a promised alternative whose required item or supplier is absent.
- Warn about a paid undertaking with no reachable payer/settlement state.
- Keep escape hatches for unusual authored structures, but require an explicit annotation.
- Extract only after finished situations prove the pattern; do not design an exhaustive dramaturgy framework from
  theory alone.

### Proof the centre is closed

- New authors can build the five patterns without copying scenario-specific rules.
- The compiler or lint catches omitted stages that previously reached cold play.
- Two different situations reuse each pattern while retaining distinct prose and choices.
- Pattern use reduces source and defect count without reducing expressive outcomes.

## Centre 6: unsupported breadth is presented as a promise

**Confidence:** very high.  
**Primary symptoms:** huge menus, inert objects, unreachable goals, thin generated people, combinations that have
never been played, register growth after every exploratory cold play.

The generated world exposes a vast possibility space. The interface often treats technically legal or knowable
content as part of the current playable promise. But “the engine can represent it,” “the generator produced it” and
“this experience is finished” are different claims.

If every generated person, object, site, profession, rumour and route is foregrounded, the product implicitly promises
that they compose. The number of pairwise and temporal interactions grows faster than content can be authored or
tested.

### Specific change: explicit support horizons

Define three horizons:

- **foreground:** composed and supported now; may be promoted and is held to the full response contract;
- **background:** exists and may be perceived, but is not presented as an actionable promise unless activated;
- **future:** generated or recorded for continuity, not yet exposed to ordinary play.

A bounded situation activates a small set of people, objects, places and actions into the foreground. Everything else
remains quiet unless the player deliberately leaves or changes focus.

### Supporting changes

- Let situations temporarily govern relevant action families, local area and time scale.
- Cap promoted and secondary actions by semantic diversity and relevance, not only count.
- Do not generate aims from mere awareness; leads become aims only through commitment.
- Require an activation contract before a generated thread enters the foreground.
- Hide actions whose only result is generic acknowledgement until they have a specific authored response.
- Build one excellent country/start as the supported product surface; treat other seeds as robustness probes, not
  equally finished content.
- Add a “promise census”: every foreground mark, named alternative and undertaking must resolve to a tested circuit.
- Prefer removing or deferring a weak opportunity to repairing its presentation indefinitely.

### Proof the centre is closed

- The canonical opening no longer presents dozens of undifferentiated rows.
- Every promoted first-hour opportunity has a complete or deliberately open response circuit.
- Cold players distinguish atmospheric background from actionable foreground without feeling deceived.
- New generated content does not automatically create active register obligations.

## Centre 7: verification is strongest at the wrong scale

**Confidence:** very high.  
**Primary symptoms:** local specs pass while composed play fails; replay and census evidence do not prevent recurrence;
golden routes prove facts but not the rendered interaction; human acceptance remains deferred.

The test estate is exceptional. The weakness is distribution, not quantity. Small-world tests prove semantic parts;
many full-world tests prove particular chains; browser tests prove selected controls and geometry. The player judges
the composition of all of them over time.

The closure tribunal found the characteristic pattern: proved clauses were real, but no partial row was wholly met.
Evidence often covered headless behaviour but not the browser, one seed but not the stated breadth, a census but not a
ratchet, or code inspection but not a failing regression test.

### Specific change: an experience acceptance harness

Make one 30–45 minute rendered route the common evidence spine. At each meaningful beat record:

- frame revision and chosen `Doable`;
- visible scene, promoted choices and restrictions;
- place, time, light and living participants;
- important world and body changes;
- narration and painting identity;
- active desire/undertaking;
- response/recognition state;
- save/resume digest at selected boundaries.

The harness should drive the actual browser protocol, retain frames and screenshots and produce a readable chronology.
It should assert semantic invariants but leave prose and emotional judgment available for editorial review.

### Supporting changes

- Keep tiny tests for rule semantics and the acceptance trace for integration; do not make either substitute for the
  other.
- Convert every closure census used as evidence into a bounded ratchet where feasible.
- Run cache-on/cache-off, page/runner and save/resume differential tests over the same trace.
- Test failures by injection at lifecycle boundaries.
- Use two or three trusted humans on the 15-minute opening before waiting for a supposedly finished hour.
- Score desire, trust, agency, comprehension, payoff and interface disappearance separately.
- Watch recordings before reading defect reports; reports rationalize moments that video reveals directly.
- Delete tests that preserve superseded UI arrangements during redesign; retain semantic promises.

### Proof the centre is closed

- A green acceptance trace means the rendered player can actually complete the supported experience.
- A recurrence found in cold play becomes a failing assertion at the same state and client boundary.
- Human observers report product problems not already obvious to robot play, rather than basic broken controls.
- The route remains editable because tests protect roles and consequences, not exact prose or row positions.

## Centre 8: stringly identity and semantic inference

**Confidence:** high.  
**Primary symptoms:** text-dependent behaviour, stale labels, id-prefix coupling, silent unknown relation reads,
source-rewrite shadowing, prose and mechanics disagreement.

Several architectural shortcuts encode semantics in strings:

- relation names passed directly from TypeScript;
- module/region identity inferred from id prefixes;
- labels or notes parsed back into kinds;
- Kyr source renamed by regular expression before parsing;
- generated prose carrying references that are not bound symbols.

These shortcuts are individually convenient. Together they create defects that evade types and appear only when
wording, namespace or composition changes.

### Specific changes

- Throw on undeclared relation reads in development; provide explicit optional vocabulary readers.
- Generate branded relation/action identifiers and signatures from compiled shared rules.
- Give entities explicit defining module, kind and semantic links; stop parsing prefixes for meaning.
- Put shadowing and name resolution in the compiler's binding pass.
- Make notes, consequences and restrictions typed values rendered to text, never text parsed back into values.
- Preserve source spans and provenance through templates, parsing, binding and lowering.
- Ratchet direct semantic string reads down in CI.

### Proof the centre is closed

- Renaming displayed prose changes no behaviour.
- Renaming a symbol is compiler-checked across every reference.
- Unknown relation reads fail immediately.
- No runtime transformation rewrites Kyr source text to establish identity.

## Centre 9: the register is both memory and queue

**Confidence:** very high.  
**Primary symptoms:** row count rises during successful work; priorities lose discrimination; audits create more work
than builds; active missions inherit historical and future scope.

The register is doing several jobs:

- defect database;
- requirements trace;
- product roadmap;
- architectural risk register;
- human acceptance log;
- historical narrative;
- evidence index;
- decision queue.

Its lossless character is valuable, but the global live count cannot also be a useful sprint queue. Honest splitting
increases rows. A new cold play exposes previously masked layers. Ambitious directions become visible long before
they should become implementation obligations.

The current classification work in `register-kinds.json` is a useful start. It needs an operating consequence.

### Specific change: portfolio views and work-in-progress limits

Keep the canonical ledger, but derive four queues:

1. **Supported-experience blockers:** reproduced P0/P1 failures inside the current slice.
2. **Platform obligations:** architectural invariants and reusable capability work selected for the current mission.
3. **Creative opportunities:** directions and desired experiences, never active merely because recorded.
4. **Evidence/decision gates:** measurements, human judgment and owner rulings scheduled explicitly.

Only the first two are implementation work. Cap them—for example, no more than ten active blockers and three platform
investments. Adding one requires closing, demoting with evidence or returning another to observation.

### Supporting changes

- Cold play may nominate at most three immediate blockers: those that most damaged desire, trust or continuation.
- Keep the rest in its report until a later play reproduces it or triage promotes it.
- Give every active row one owner, one supported reproducer and one acceptance condition.
- Expire stale observed defects to “needs reproduction” after a major redesign or fixed interval.
- Count new obligation, clarified remainder and newly observed symptom separately.
- Report throughput by experience outcome, not total row closure.
- Never decompose a creative direction automatically; select a proving experiment first.
- Merge symptoms under one causal row when one centre owns them.
- Audit the active queue weekly; audit the full historical ledger much less frequently.

### Proof the centre is closed

- The active queue remains bounded while the historical ledger may grow.
- A sprint can state which complete experience improves and which platform centre it attacks.
- Splitting a row does not make progress appear negative.
- Priority predicts what will actually receive work.

## Centre 10: creative authority is distributed, while acceptance is delayed

**Confidence:** medium-high.  
**Primary symptoms:** many technically valid local decisions, slow owner rulings, redesign mixed with repair, strong
moments surrounded by unselected material.

The project has a clear doctrine, but no single person or role appears to own the complete playable sequence from
opening image through final beat. Authors own modules, engine work owns capabilities, presentation owns rows, cold
players discover failures and tribunals judge evidence. The owner retains aesthetic authority, but many decisions
reach that authority as isolated register questions after implementation.

This encourages local optimisation. Nobody is explicitly empowered to say:

- remove this otherwise valid opportunity from the opening;
- stop this route after its strongest return;
- this person, not the system, is the emotional centre;
- this mystery remains atmospheric, while that one must be answerable;
- this fight does not yet deserve to ship;
- this general capability is unnecessary for the current experience.

### Specific change: one experience owner

For the canonical slice, appoint one creative owner responsible for:

- intended emotion and desire at each beat;
- foreground selection;
- pacing and contrast;
- response loops;
- prose and painting coherence;
- where the slice ends;
- the final accept/revise decision.

Builders still own technical quality. The experience owner owns whether the composition works. Their acceptance
cannot be replaced by passing tests, and their decisions should occur before work decomposes into tickets.

### Supporting changes

- Write a one-page experience brief, not a feature brief.
- Hold editorial play before cold play each week.
- Review complete recordings, not screenshots or transcripts alone.
- Use a small stable panel of unfamiliar players so changes can be compared longitudinally.
- Separate repair weeks from exploratory feature work when necessary.
- Reserve explicit capacity for prose/content revision; do not expect engine fixes to create drama automatically.
- Give the owner decision packets in context: recording, exact state, alternatives and trade-off, not a list of row
  ids.

### Proof the centre is closed

- The slice has a recognizable emotional contour described before implementation and observed afterward.
- Weak but technically correct material is removed without needing a defect rationale.
- Cold-play reports discuss choices and consequences more than interface archaeology.
- Decisions are made at the experience level before producing many dependent tickets.

## Ranked interventions

The following order is based on defects prevented, player impact and ability to unlock later work.

### 1. Authoritative player frame and opportunity model

**Why first:** the largest visible clusters pass through this boundary. It reduces page, terminal, atlas, undertaking,
travel and testing defects at once. It also gives the browser a stable contract for the acceptance slice.

**Concrete first increment:** represent every first-hour row, opener and map opportunity as one `Doable`, including
command, state, reason, target and provenance; migrate runner and one page surface to it; differential-test them.

### 2. Recognition and response contract

**Why second:** this most directly raises cold-play scores. The cold plays already contain desire and good authored
material; they repeatedly lose it because the world does not answer.

**Concrete first increment:** take the sea-gate and declare responses for the sawn pin, asking for help, shutting the
gate, promised payment and suspected sabotage. Make three relevant people respond differently and produce one new
choice after the return.

### 3. Command receipt and decision boundaries

**Why third:** invisible fights and discontinuous travel can destroy an otherwise excellent hour. This is a trust and
data-integrity boundary.

**Concrete first increment:** produce a receipt for every command and combat decision; forbid an input from advancing
a player-controlled combatant twice; attach revision to browser commands.

### 4. Bounded situation for the opening

**Why fourth:** it reduces the active possibility surface and allows composition. It also proves the proposed
situation/engagement semantics with a real artistic case.

**Concrete first increment:** make the drove or sea-gate a bounded situation with a local area, active participants,
relevant actions, safe exits, failure outcomes and explicit conclusion. Suppress unrelated strategic rows while it is
active.

### 5. One rendered acceptance trace

**Why fifth:** it turns the prior changes into one observable product result and prevents local proofs from drifting
apart.

**Concrete first increment:** drive the actual page through opening → investigation/preparation → danger → decision →
recognition → return → save/resume, keeping frames and screenshots at each beat.

### 6. Register portfolio and WIP cap

**Why now:** without it, every improvement will be surrounded by expanding obligations and attention will fragment
again.

**Concrete first increment:** derive and publish the supported-slice blocker list; cap it at ten; limit each cold play
to three promoted blockers.

### 7. Compiler-owned vocabulary and binding

**Why next:** it removes a quieter but persistent class of semantic regressions and makes the player-frame and
response contracts safer to evolve.

**Concrete first increment:** fail unknown relation reads in tests, fix the resulting cases and introduce generated
handles for the most-read shared relations.

### 8. Richer assembly semantics

**Why after a finished slice:** the response and situation work will reveal which social and historical facts
generation actually needs. Building the general ledger before those examples risks another broad abstraction without
an excellent use.

**Concrete first increment:** allow one later situation to bind a person the company helped and explain the binding.

## A centre-hunting method

Future defect analysis should ask five questions before creating a row:

1. **Which boundary first lost the truth?** Runtime, response, lifecycle, assembly, projection, client or test?
2. **What other symptoms share that mechanism?** Search the register and cold corpus before treating it as unique.
3. **What field, phase or contract was missing?** Prefer adding explicit information over another downstream guard.
4. **Can the producer refuse to construct the invalid state?** Construction-time prevention beats presentation-time
   detection.
5. **What representative mutation would prove the factory closed?** A regression test for the symptom is necessary;
   a mutation of the missing contract proves the centre.

Each active defect-centre programme should maintain:

- a symptom census;
- the proposed invariant;
- a small representative corpus;
- an architectural prevention test;
- the count of compatibility adapters remaining;
- a deletion condition.

Do not credit a centre with every row in its visible feature. Credit only rows whose causal chain has been inspected.

## Suggested six-week sequence

This is a sequence of outcomes, not a commission or estimate.

### Week 1: choose and cut the supported slice

- Select drove or sea-gate as the 30–45 minute product surface.
- Name its emotional contour and final beat.
- Derive at most ten current blockers.
- Suppress unrelated foreground opportunities.
- Record the rendered baseline.

### Week 2: make opportunities authoritative

- Complete `Doable` for the slice.
- Migrate page and runner.
- Remove label/first-child inference encountered on the route.
- Pin parity and provenance.

### Week 3: make the world answer

- Complete the central discovery/deed response circuit.
- Add recognition, payment, dispute or successor pressure.
- Cross save/resume.
- Editorially revise the return.

### Week 4: make danger and time trustworthy

- Put the slice through explicit command receipts.
- Ensure every player combat decision returns control.
- Give failure a continuing authored state.
- Eliminate opaque lethal transitions.

### Week 5: prove the rendered experience

- Build the chronological browser harness.
- Run two robot temperaments and two trusted human observers.
- Review recordings and revise composition rather than merely filing symptoms.

### Week 6: extract only what repeated

- Identify which response, situation and exchange patterns occurred more than once.
- Package those as small authoring capabilities.
- Update the platform plan from evidence.
- Decide whether the slice is good enough to widen or needs another concentrated pass.

## Expected effect on the register

The register may not shrink immediately. Closing a centre typically has three phases:

1. **Discovery:** instrumentation reveals more affected symptoms.
2. **Migration:** old and new paths coexist; compatibility rows may temporarily grow.
3. **Deletion:** downstream guards, duplicate implementations and symptom rows can be removed or closed together.

Progress should therefore be reported as:

- centre invariant established or not;
- production consumers migrated / total;
- compatibility adapters remaining;
- representative mutations killed;
- supported-slice blockers live;
- cold-play trust and desire scores.

Do not judge centre work by global live-row count during migration.

## What not to do

- Do not sweep all page-UI rows independently; many are projection symptoms.
- Do not invent a universal story engine. Compile a few proven dramatic patterns into existing Kyr semantics.
- Do not expand generated breadth while the supported slice lacks complete response loops.
- Do not turn every cold-play observation into active P1 work.
- Do not wait for all robot-found defects to disappear before observing a few trusted humans.
- Do not preserve weak foreground content merely because it is technically legal or expensive to build.
- Do not reorganize `ui` and `presentation` directories without first establishing the player-frame seam.
- Do not optimize global row closure at the expense of one excellent return, conversation or decision.
- Do not use more prose to explain a missing mechanic or response.
- Do not let tests pin accidental menu topology during the redesign.

## Final judgment

The number of issues is a consequence of three things at once: Westernesse is genuinely ambitious, its verification
is unusually willing to expose failure, and several central boundaries are still porous. The first two are strengths.
The third is tractable.

Most visible problems originate where meaning changes representation or ownership:

- authored intention into generated composition;
- runtime truth into player opportunity;
- one command into several temporal systems;
- a changed fact into another person's response;
- a broad world into a selected dramatic foreground;
- a local proof into a complete played experience.

Those are the places to hunt. Repairing individual outputs will continue to improve the game, but it will not reduce
the rate at which new defects appear. The rate falls when those transitions become explicit, typed, single-owned and
tested at their natural scale.

The practical opportunity is encouraging. Cold play already finds excellent material: the drove, the black candle,
the sawn pin, the gate, the Hall's people, the hidden ways. Westernesse is not trying to invent its quality from
nothing. It is trying to stop losing that quality between systems.

One authoritative player frame, one command receipt, one response contract and one bounded finished experience would
do more than a broad hundred-row repair campaign. They attack the factories rather than their output.
