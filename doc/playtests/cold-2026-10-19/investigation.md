# Continued investigation: what Kyr should feel like to play

This follow-up develops the cold review into a cause model, a player contract, three competing presentation concepts, and a bounded roadmap. **Design for review only: no frontend, scenario, rules, or event API changes implemented.**

Read in order:

1. This document: priorities, player experience, narration and memory.
2. [Three presentation concepts](presentation-concepts.md): book, expedition, tabletop; common content, nine wireframes, evaluation and recommendation.
3. [Combat investigation and roadmap](combat-and-roadmap.md): recorded arithmetic, current capabilities, proposed encounter, minimal extensions, and an experiment before a rewrite.

## Evidence and limits

The evidence remains the [cold play record](cold-playtest.md), [screenshots and text](evidence-index.md), and [downloaded end-of-play checkpoint](evidence/end-blind.save.json). This follow-up inspects current rules and the already-recorded events. It does not represent another blind participant, another playthrough, a balance test, or a validated new design. Presentation scores and player benefits are hypotheses to test.

**Correction to the initial report:** Ash's Rending bite deals damage and can apply **bleeding** on a failed Constitution save. It does not apply weakening. The sentinel's Burial chain can apply weakening after its independent damage. The initial report's proposed bite narration and one wireframe conflated these conditions; those examples have been corrected. Actual screenshots and chronological observations are unchanged. This is precisely why narration must identify the effect a save resolves, rather than infer a story from disconnected fragments.

## 1. A prioritized failure model by cause

Kyr currently makes the player reconstruct the adventure from three partial accounts: what prose suggests, what commands permit, and what the log records. Those accounts do not agree reliably. More panels would provide more fragments. The smallest coherent intervention is to make a single intention and its consequences traceable across all three.

Priorities below bundle related observations into nine causes. **P0**: agency or truth must be repaired first. **P1**: needed for a coherent adventure. **P2**: improve content and tactical depth once choices can be understood. Confidence distinguishes observed facts and code-supported explanations from untested design judgments.

| Cause / priority | Evidence | Player impact | Probable root cause / confidence | Smallest credible remedy |
|---|---|---|---|---|
| **1. Inspection and action share an unstable gesture — P0** | Stores click picks padlock (16); sentinel click attacks (67); “Tactics” attacks (57). | I cannot safely learn what a person, object or ability means. The UI spends time and resources on an intention I did not express. | Controller executes a row's sole legal leaf; different command counts change interaction. Tactics invokes an action selector. Observed and code-confirmed. | A noun/ability click selects and describes it, regardless of action count. Only a verb-labelled action commits. Rename delegation to describe its effect. No extra universal confirmation dialog. |
| **2. Resolution does not preserve who caused what — P0** | Ash uses Retreat; “Your company withdraws” (99). Combat effects appear above their causes (54/71); fall survives summary but revival does not (61). | The player learns false rules and cannot distinguish an enemy decision from their own. | `escaped` omits side/actor; renderer reverses fragments; summary filters strings by keywords. Observed and code-confirmed. | Attribute endings, retain chronological action groups, compute final condition from actual state. Grouping is projection work; retreat identity needs an event/engine amendment. |
| **3. Known world information has incompatible definitions — P1** | Wren's known deadline absent from Journal (05→07); Ash bars an exit without being interactable from that side (28); regional travel understated (43). | I cannot plan a route, infer a reasonable action, or trust adventure notes. | Formal facts, local observations, passage barriers, objectives and installation deadlines use different access/projection paths. Confirmed; intended visibility at thresholds requires an authoring decision. | One player-known projection with provenance and staleness. Expose the named passage's observable obstruction and actual available approaches. Report route itineraries, not an area-edge surrogate. No global omniscience. |
| **4. Fiction, event, and state are flattened into text — P1** | Missing thanks (35), repeated padlock/valve sentences (16/80), invariant prose (61). | Emotional and causal consequences are lost while bookkeeping is repeated. | Generic fallbacks concatenate responses, state differences, resource changes and observations. Speaker departure changes mode before reply remains readable. Confirmed. | Preserve an authored reply as an event independent of speaker presence; compose a single result with attached numeric changes; scene describes current state once. |
| **5. Combat choices lack both explanation and differentiated purpose — P1/P2** | Hidden guarding/cooldown, unexplained conditions (70–78); 15-action sentinel fight (67–79). | I cannot predict value; once decoded, many turns reduce to waiting for a useful attack to return. | Presentation drops existing modifiers/clocks. Single enemy, low damage, no alternate combat objective, overlapping damage abilities, score-based AI. Code-confirmed; better balance remains untested. | First expose current effects, availability and action sequence. Then author a purposeful optional encounter using existing equipment and abilities. Consider one telegraphed threat and one response mechanic only if needed. |
| **6. Place graph is treated as more physical space than it represents — P1** | “A few steps” for 30 minutes (43); known/unvisited/traversed confused; map and barrier inconsistencies (12/28). | False assumptions about closeness, passability, route cost and tactical options. | Place-node coordinates/containment and passage durations support topology; not room geometry. Region merges parallel connections, exploration inferred from endpoint visits. Confirmed. | Honest site graph, passage status and itinerary costs; room layout in authored prose. Track actual traversal and knowledge separately. No combat grid or measured room plan. |
| **7. Scenarios contain verbs and reactions unevenly — P2** | Good rack alternatives (24); Pell asks for carried bar (23); Hesta ignores completed rescue (50); innkeeper only sells services (90). | Some rooms invite inhabiting the world; others feel like interchangeable service menus. | Bounded authored changes/topics; reusable rescue and older creature content only partly adapted to foundry context. Confirmed content boundaries; depth judgment based on one scenario. | State-condition a few high-value replies, resolve misleading scenic affordances, adapt sentinel identity, give remaining opportunities motives. No generalized dialogue or physics system needed first. |
| **8. Persistent world is not persistent adventure memory — P1** | Next morning has one discovery and long chronicle, no rescue summary/relationship changes (94); reload says nothing happened (95). | I lose why I am here, what I changed, and what remains. | Memory equated with formal knowledge and raw events; separate UI log cleared on import. No compact resolved thread. Confirmed. | Rebuild short event history and notes from authoritative records; retain task lifecycle, known deadline and consequential relationships. Do not build a second simulation in the journal. |
| **9. Fixed panel hierarchy competes with the current decision — P1** | Tiny/truncated choices beside large maps; empty menus; map and full HP bars during one-topic talk (04/12/53). | The eye searches several regions to assemble one decision. Information volume is high relative to useful choices. | Persistent layout organized around projections, not reading/decision sequence. Observed; alternative hierarchy unvalidated. | One dominant scene/choice/result region, compact party state, map/detail on demand; battle gives mechanics more space. Reduce simultaneous surfaces, not just tabs. |

### Which are correctness defects?

Do not call every unsatisfying rule a bug. Use three distinct classes:

- **Confirmed incorrect or misleading behavior:** enemy Retreat attributed to the company; final reply lost on NPC departure; Journal denying a deadline explicitly heard; imported checkpoint falsely reporting no history; route display losing relevant alternatives/cost context; map marking an edge walked from endpoint visits. These need narrowly scoped repairs and meaningful regression checks.
- **Consistent behavior with harmful semantics:** a sole command executing on entity click; Tactics delegating an action; arbitrary enemy flee at cooldown; literal effect strings as descriptions; the standard attack doing direct damage. These may be “working as coded” but need product/rules decisions, not an appeal to correctness.
- **Missing depth or content:** no interception, no range, no usable hoist, no continuing situation after rescue. These are not defects merely because a different RPG has them. Add only where a recurring, comprehensible player intention needs support.

Hesta's refusal also needs a semantic decision: current [witness logic](../../../src/campaign/witnesses.ts) records a player damage event against Ash, rather than the hostile initiation itself; its check also does not require a positive damage amount. The Guard-only probe triggered a fight but no player damage, and no refusal. Decide whether she objects to threatening him or harming him; align her warning and the rule. A renderer cannot settle that distinction.

### Dependency order and expected leverage

```text
Explicit intention ───────┐
Accurate actor/effect ─────┼─> believable immediate consequence
Known-world projection ───┘                 │
                                           v
                         durable adventure memory + purposeful content
                                           │
                                           v
                          evaluate presentation and tactical depth
```

Agency and truth unlock every modality. Better event grouping makes existing combat easier to follow; it does not make it deep. Better memory makes authored consequences visible; it cannot produce an unauthored next adventure. A richer combat engine is a poor first investment while the player cannot inspect a sentinel without attacking it.

## 2. Essential experience and interaction grammar

A player should usually be able to answer five questions: **Where are we? What is happening here? What do we want? What can this choice cost or change? What actually happened?** Unknown information should remain a specific uncertainty, not an empty panel or a confidently invented answer.

| Moment | Minimum understanding | Reasonable player intentions | What the system must convey |
|---|---|---|---|
| Arrive at settlement | Current quay within Reedwake; recognizable buildings and people; Wren's concern; party readiness. | Look around, speak, enter a building, prepare, leave. | Stable location and routes, known urgency, time/resource costs when acting. Character formation explains roles, not an unexplained seed and promises from another campaign. |
| Meet a person | Who/where they are, what they visibly do, why they matter if known. | Inspect, ask relevant topic, offer/receive something, end exchange. | Topic versus transaction; preserve reply when they leave. No generic attitude inferred from ancestry or a service role. |
| Enter unfamiliar site | Site identity, entry just used, local layout, immediately visible exits/obstacles, known purpose and time pressure. | Inspect features, choose a route, investigate a source, return. | Named passages, observed hazard/guard, known vs unseen rooms. No room map or precise distance invented from node coordinates. |
| Examine object | What is perceptible, current state, supported interactions and known purpose. | Inspect board, take bar, lever rack, turn valve. | Reading existing description is free; a time-consuming search/examination is a distinct action. Merely opening an object sheet never picks up or operates it. |
| Choose consequential action | Method, actor or group, target, time/cost, known danger and uncertainty. | Choose lever rather than dig/heave; choose whom to heal. | Preview remains stable until committed; only expose outcome certainty warranted by rules/knowledge. Actor attribution may be group-level when no provider is recorded. |
| Enter combat | Why confrontation began, where it occurs, who participates, who acts first, whether escape is possible. | Select action/target, review effects, delegate explicitly, disengage. | No silent entity-click attack. Abstract combat boundary explained; automatic enemy actions visibly occur in sequence. |
| Retreat or win | Who withdrew/won, what physically changed, current party state, available ways and lost services. | Review recovery, inspect aftermath, continue. | Outcome is not a generic receipt. Do not announce a cleared way, moved party or death without those facts. |
| Return to changed world | What we previously changed, what remains known or unresolved, what people now do. | Follow a lead, revisit someone, rest, choose route, end adventure. | Current observations plus time-stamped notes of prior knowledge. Returning does not reset the tale or imply fresh quests without content. |

### Four operations, one stable meaning

**Inspect:** open known description/current perceived state of a noun, route, person, ability or item. No world time, resources, rolls, hostility or discovery are triggered. An action such as “Read the survey board — 10m” can establish new information; opening its inspection view is not that action.

**Select:** choose an intention and, if required, an actor and target. It changes only the player's pending choice. It never resolves a sole target automatically merely because there is one. Preselecting the only target is fine if still shown before commitment.

**Preview:** show the complete intention with cost/time, effect summary, target eligibility, known risk and source of an enabling capability. This is not a separate permanent pane or necessarily a separate click. Choosing an intention can reveal its inline preview immediately. Preview is not a promised roll, exact hidden damage, or hidden AI plan.

**Commit:** execute a verb-labelled control containing enough intention to be unambiguous: “Pick stores padlock — 10m,” “Use potion on Elen — 10m,” “Attack Ash,” “Guard.” Pointer, keyboard, touch and single/multiple-target cases follow this same boundary. Enter acts only on the explicit commit control after intention selection; arrows/focus inspect/select. No automatic commit when a list changes or the next actor arrives.

A clear route card “Walk to Chalk ridge — 30m” may commit directly because destination, action and duration are already visible: the preview is the card itself. A noun “Chalk ridge” selects the route and its preview. Likewise a full “Guard — halve damage until your next turn” action can be one explicit commit. Do not add confirm modals to every ordinary action to compensate for ambiguous labels.

Disabled actions show a useful known reason, such as no mana or remaining cooldown. Do not list every hypothetical action/capability the engine could eventually support. A known padlock can say “Needs lockwork” even if no current action is legal. Unseen keys, secret outcomes and unavailable hidden techniques must not leak through disabled menus.

On commit, revalidate the intention against the current world. If it changed, report the reason and refresh the preview; never substitute a different action. After resolution, retain the result above subsequent choices. A new turn, room, or NPC departure does not destroy the last event. Selecting another thing doesn't erase an unread consequence.

### Fiction, feedback and state: separate jobs, one reading order

```text
PLACE / SITUATION      “Pell lies pinned beneath the rack.”
INTENTION              Lever rack with bar · company action · 10m
EVENT                  authored lift-and-release response
MECHANICAL CONSEQUENCE 10m passed; state changed; relevant costs only
PERSISTENT STATE       Pell hurt/mobile, rack propped, escort available
```

The event is one occurrence, the scene is true now, and the note is what the party remembers later. They can refer to the same fact without printing the same sentence three times simultaneously. Show event first after action, then refresh the scene on continued inspection. Keep routine bars and counts quiet until they change or matter to the current decision. Detailed arithmetic attaches to the event; it is not competing fantasy narration.

## 3. Narration and adventure-memory contract

### Four distinct kinds of writing

| Kind | Authority | Job | Excluded |
|---|---|---|---|
| Authored scene prose | Authored observation + current state + perception rules. | Establish place, visible people/features and situation. Stable identity and clear physical relations. | Generic method promises; inferred room geometry; exact monster traits without justified knowledge. |
| Event narration | Authored response or conservative rendering of typed, perceived event. | Say what just occurred and what it changed. Include actual speaker/action/target. | Implementation assurances, invented motions/emotions, post-hoc rationale for absent mechanics. |
| Mechanical result | Resolution events and before/after state, not guessed prose. | Explain damage/healing, costs, saves, conditions and rule exceptions. | A miss when no attack roll occurred; “resisted” without naming the affected effect. |
| Adventure notes | Player-observed/heard/learned events with source and time. | Preserve active/resolved matters, last-known places, promises, consequences and useful connections. | Omniscient facts; live status of unseen NPCs; raw relation dumps; algorithmic next quests. |

**The contract is a data requirement, not a demand for more generated prose.** If an authored response already describes the result, display it. If a typed event only supports “Elen recovers 5 HP,” that can remain a mechanical line. There is no need to invent luminous hands, ragged breaths, or gratitude.

### Proposed logical action result (not a new API implementation)

```text
Resolution
  identity: event id, parent action / encounter id, sequence
  intention: action kind, acting group, provider if actually bound, targets
  timing: began-at, completed-at, time spent; declared combat/world clocks
  disposition: completed / partial / blocked / failed / cancelled
  response: optional authored text with speaker and content/version reference
  effects[]:
    id, parent effect/action, source, target, kind, visibility
    before, after, amount, damage/healing type
    roll + all actual modifiers + save resolved-for effect
    condition id, source, clock and expiration boundary
  encounter-end?: outcome, reason, winning/fleeing actor or team
  perceived-world-events[]: speaker, subject, text/reference, sequence/time
  known-changes[]: entity/property before→after, provenance, visibility
  note-updates[]: thread/key, transition, evidence references
```

Existing `CombatEvent` already supplies many effect fields, turn, action, source, modifiers and saves. Group these rather than duplicating simulation. Needed additions include reliable identity/grouping across persistence, explicit save-to-effect association, escaping side, stable authored reply independent of speaker location, and intentional note-update semantics. Existing action responses and world diffs should feed this contract, not be replaced by an LLM interpreting arbitrary engine text.

Events retain event-time facts/names/response values, or stable references that reconstruct them at that time. A journal rebuilt with today's world values must not retroactively rewrite yesterday's promise, speaker or deadline. Notes can update a thread while keeping its evidence. A saved state is authoritative for current reality; perceived events are authoritative for remembered experience. A note is derived presentation, not another mutable authority for the world.

### Memory rules

- **Scope:** record heard tasks, personally witnessed consequential changes, formal discoveries and relevant relationships. A player can remember Wren's words without a formal `knows` predicate.
- **Provenance:** distinguish “Wren said,” “we saw,” and “survey board marks.” Distinguish last seen from currently perceived. Reports may be wrong; do not silently promote hearsay to omniscient truth.
- **Lifecycle:** active → advanced → resolved, failed, expired or superseded. Resolving Pell's thread retains the story and rewards; it does not delete the active objective and leave nothing.
- **Clocks:** a known closure is represented even when implemented by a thing/event rather than an installation deadline. Show the heard estimate until observed, then “culvert closed when last seen.” Do not infer remote flooding just because a clock passed unless the game grants that inference.
- **Consequences:** record Hesta's refusal and reason once. Later notes can be revised by an observed reconciliation; do not invent one.
- **Space:** retain discovered connections and known traversability with time/source. State can become stale; no live offscreen sentinel tracker.
- **Resumption:** reconstruct recent results and notes from the same saved authoritative history. Imported saves do not start an empty fictional history. If older saves lack evidence, say “Earlier details unavailable,” not “nothing happened.”
- **Economy:** one compact summary per adventure thread, linked to evidence. New information updates it. No ever-growing list of every acquired item, meal, turn and repeated room paragraph in default Notes.

### Actual content at the moment and afterward

These examples show different times/views, not four copies to show together. New wording summarizes observed facts; quoted authored responses should be retained verbatim where available.

| Event | During play | Mechanical line / current state | Later Notes |
|---|---|---|---|
| **Pell freed** | Existing authored response: bar lifts rack a hand's breadth; Pell pulls the leg clear, bruised and cut. | 10m; rack propped; Pell hurt but mobile. Offer escort as the next reasonable choice. Attribute to company unless a lifter is recorded. | **Pell — freed, then brought back to Reedwake.** Released the timber rack with a pry bar. Wren reunited with Pell at the quay. While still unfinished: “Pell freed; last seen in Hoist room; not yet home.” |
| **Wren's reward** | Preserve existing thanks: “You brought them back yourselves. I won't forget it.” Authored six-coin handover remains readable even as Wren goes home. | Shared purse +6, 14→20. Wren/Pell depart for ferry house as a separate following event. | **Rescue resolved. Wren gave six coins for escorting Pell.** Last seen heading to ferry house. Do not say Pell is now settled until observed or legitimately reported. |
| **Hesta refuses** | Keep authored refusal: “I saw you strike Ash. Find your salve elsewhere.” Place it after the encounter outcome in causal order. | Hesta's healing/trade no longer available; party state remains available for recovery. | **Hesta refused service after witnessing us harm Ash.** Last known alternative: Nera's shop. Record a threat instead of harm only if the witness rule changes and that is what happened. |
| **Foundry changed** | On return, scene says open padlock/clear arch, absent live guards or corpse rows as actually perceived. No replay of every previous victory. | Stores open; steam shut; observed culvert closed; Ash and sentinel dead; taken sword absent from room. | **Foundry, last visit:** stores opened, boiler arch made safe; culvert closed; guards defeated; flame sword taken by Bran. Attach these to place/thread notes. Only retain facts the party perceived, and distinguish observed state from later unseen change. |

Hesta's advice about the sword is a known opportunity, not automatically a quest. Once sword is collected, that lead resolves. The inn and shrine being unvisited is route knowledge, not proof of an adventure. After completing the current content, Notes should be able to say no active task remains. More continuation requires authored motivation and world response.

## 4. Player-facing design decision

Recommend a **contextual adventure book with an explicit expedition map and a focused abstract combat spread**. The book supplies continuity, the graph supplies routing, and the battle spread supplies rules at the moment they matter. These are alternate views of the same intention/result contract, not three simultaneous dashboards.

See [concept evaluation](presentation-concepts.md) for costs and tradeoffs. The recommendation is provisional until the paper/replayed-event experiment in the [roadmap](combat-and-roadmap.md) establishes whether players can choose and explain actions consistently.
