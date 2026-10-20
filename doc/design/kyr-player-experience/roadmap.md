# F. Prioritized product roadmap and acceptance gates

**Plan for review, not implementation authorization.** No replacement client or new mechanics have been built in this commission. Scope is relative: **S** bounded repair/projection/content change; **M** coordinated feature across several subsystems; **L** new rules/model plus migration/content/validation. These are not calendar estimates. New rules and numerical content must be reviewed before builders fill gaps.

Foundational requirements carry the product contract IDs from [B](product-specification.md). New combat rules are described in [combat model](combat-model.md). Optional enhancements must not delay agency/truth fixes or substitute for adventure content.

## Milestones and dependencies

~~~text
F0: safe actions + truthful endings + durable causal history
  |
  v
F1: known-world / intention / result / memory contracts
  |                         |
  +-> E1: paper / recorded-event UX experiment
  +-> A1: one current-model expedition with a changed return
  |
  v
C1: readable multi-enemy abstract battle + useful party choices
  |
  v
C2: shared time / explicit casualties / small zone-intent-protect experiment
  |
  v
P1: two linked expeditions, advancement and an independent situation
  |
  v
Production layout/migration decision; expand breadth only after proof
~~~

Work can overlap where independent, but the gates are causal: a nice prototype cannot compensate for false outcomes; a campaign journal cannot invent its missing second expedition; spatial battle cannot precede authoritative reach/occupancy.

## Phase 0 — Foundational correctness

### R1. Restore player agency (required, PX04)

- **Problem/evidence:** noun inspection spends time, buys unwanted healing or initiates combat; delegation labelled Tactics (C16/C67, N36, C57).
- **Scope/owner:** S, client controller/input semantics and shared intention projection. Keep Mono layout while repairing semantics; no rewrite prerequisite.
- **Dependencies:** stable explicit action identity and existing eligibility; no new simulation.
- **Deliver:** inspect/select/preview/commit boundary independent of command count; full verb target/cost; compatible creation options; stale-intent revalidation and duplicate-commit prevention; delegation labelled for its actual one-action effect.
- **Acceptance:** pointer, keyboard and narrow touch-like interactions inspect sentinel/priest/locked exit without any world-time/resource/hostility change. Explicit selected action commits exactly once. Healthy-party service preview explains no recovery benefit, never auto-purchases.
- **Risks/non-goals:** avoid extra universal confirmation dialogs, hidden auto-defaults or a broader verb/parser project. Test list changes/held keys and provider loss, not a brittle mirror of HTML.

### R2. Make consequences attributable and durable (required, PX09–11)

- **Problem/evidence:** enemy flight reported as party flight; reply lost on departure; reverse action fragments; blank imported history; inconsistent save arithmetic/capped damage (C35/C54/C99, N46/N47).
- **Scope/owner:** M, encounter ending/event schema, campaign resolution, presentation/history and save adapter.
- **Dependencies:** audit authoritative event ownership; retain older saves safely.
- **Deliver:** ending actor/team/reason, chronological action/effect groups, explicit save referent and full components, resolved damage versus HP lost, retained authored reply, recent history reconstructed from evidence. Remove invariant/filler/duplicate text. Preserve event-time facts.
- **Acceptance:** show both player and enemy withdrawal correctly; Wren's exact thanks remains after departure; reload retains significant results; old and new category saves display correct total/components; low-HP breath reports harm and capped HP loss separately. Original event records remain available for review.
- **Risks/non-goals:** do not regex flattened strings into new truths; do not invent death, motion or motives; no generic narration service. Unknown historical data is marked unavailable, not reconstructed from today's world as if known.

### R3. Define casualty and defeat truth (required, PX03/06/09)

- **Problem/evidence:** zero-HP companions called dead/revivable inconsistently; one survivor travels/rests with two fallen people and unclear gear location (C58, N83–94).
- **Scope/owner:** M/L, creature life-state/world location, encounter aftermath, recovery/item/carry rules and authoring.
- **Dependencies:** R2; reviewed zero-HP/death/disposition policy before implementation.
- **Deliver:** explicit incapacitated/dead/destroyed states, treatment and defeat dispositions; casualty/gear locations; one-carrier baseline; no implicit corpse teleport. Existing encounters need declared loss policy.
- **Acceptance:** play single down/revival, partial withdrawal, leaving/retrieving gear/person, lethal total defeat, nonlethal loss when authored, save/reload each. Rest restores only eligible recipients. Location/custody and note uncertainty agree.
- **Risks/non-goals:** no universal resurrection, unearned rescuer or complicated death-save system by default. Preserve legitimate lethal dragon danger while making its outcome intelligible. Migration must not silently revive previously dead characters.

## Phase 1 — Experience architecture

### R4. Unify player-known world and adventure memory (required, PX02/12–14)

- **Problem/evidence:** known deadline/report/request missing from Notes; completed rescue becomes a raw chronicle; live state and last-known facts conflated (C07/C94, N20/N74/N94).
- **Scope/owner:** M, player projection, event/knowledge model, situation/commitment authoring and Notes.
- **Dependencies:** R2; decide sources/visibility/staleness and thread lifecycle.
- **Deliver:** known places/routes, reports and discoveries with provenance; active/resolved/stale matters; explicitly accepted commitments; observable deadlines irrespective of implementation as installation/event/thing. Resume summary derived from same record.
- **Acceptance:** after Wren/Tobin speaks, player can find the heard task/window with source; after closure seen, note distinguishes observed state from expired estimate; rescue/refusal/reward survive reload; offscreen truth cannot leak through notes or disabled action reasons.
- **Risks/non-goals:** Notes is not a second world authority, quest checklist or omniscient NPC tracker. Do not require formal fact predicates for every remembered line of speech.

### R5. Correct map semantics and itinerary planning (required, PX02–03/08)

- **Problem/evidence:** lost regional legs/parallel routes, visited endpoints called traversed, local barrier hard to address; burned bridge makes correct alternate route crucial (C28/C43, N83–93).
- **Scope/owner:** M, passage/chart projection, knowledge/traversal records, route planning and map presentation.
- **Dependencies:** R4, existing topology and declared durations; R3 for casualty-adjusted travel.
- **Deliver:** site graph with containment/thresholds, known/unvisited/traversed distinctions and text statuses; region itineraries with actual legs/time and conditions/age; route preview/interruption; map connection-list alternative.
- **Acceptance:** predict quarry short/long routes around closure and crag return after bridge loss; no traversal of blocked passage; two distinct routes remain distinct; screen reader/narrow view can inspect full connection names/costs.
- **Risks/non-goals:** no measured floor plan or tactical grid from place coordinates; no automatic secret reveal; no multi-leg travel bypassing changed requirements.

### R6. Validate a small presentation system (required, PX04/10)

- **Problem/evidence:** simultaneous panes fragment scene/choice/result; action labels clip; history intercepts pointer; current narrow view loses action preview (C12, N76/N78).
- **Scope/owner:** S for paper experiment, then M for isolated event-backed renderer if approved. Product/UX and presentation owners.
- **Dependencies:** designs and shared contracts reviewed; use accurate fixed events first, not a rewritten engine.
- **Deliver:** Adventure/Party/Notes, contextual Map/conversation/feature/battle/aftermath, desktop/narrow layouts from [D](interface-specification.md), consistent focus and retained result.
- **Acceptance:** prototype tasks below pass without moderator explaining engine internals; no unintended commit or lost reply; image-disabled and keyboard flows preserve functionality. Select final hierarchy only after evidence.
- **Risks/non-goals:** no production rewrite, polished art, unrelated extra panels or custom debug APIs. An event replay evaluates presentation, not tactical balance or autonomous play.

## Phase 2 — Adventure quality

### R7. Repair bounded authored situations (required, PX03/10/13)

- **Problem/evidence:** carried-tool ignorance, stale “missing” topics, obscure bell ground deposit, unconditional empty-cote prose, Hesta threat-versus-harm mismatch (C23/C50, N32–40/N95–97).
- **Scope/owner:** S/M, scenario authors plus small handover/witness semantics changes.
- **Dependencies:** R1/R2/R4; typed interaction/note contracts.
- **Deliver:** state-aware topics, explicit NPC handover/custody, current observations after outcomes, located meaningful objects, accurate provider/requirement language, clear local service/refusal reasons.
- **Acceptance:** unaided player returns bell to ringer, sees coherent chapel/town change, understands rescue outcome and reward; threatened/harmed Ash branch produces response consistent with authored rule and known warning.
- **Risks/non-goals:** not every noun needs simulation or every NPC a dialogue tree. Remove false promises or author a few useful interactions; do not fill gaps with procedural chatter.

### R8. Author a complete repeatable expedition (required, PX01/05–08/14)

- **Problem/evidence:** bounded rescue/dragon sites do not prove classical preparation, branching dungeon, treasure/advancement or campaign continuation. Advertised large content unavailable (N49).
- **Scope/owner:** L, content/encounter/rules design with authoring validators.
- **Dependencies:** foundations and basic map/notes; R9 for multi-enemy coverage. Can first use honest abstract combat while zones are under review.
- **Deliver:** current-model hub and one substantial branching site with a loop, genuinely different routes/obstacles, at least one noncombat approach, resource pressure, consequential treasure and a changed return. Include enough depth to require pressing-on versus return decisions; ten to fifteen meaningful local places is a planning target, not a quota of empty rooms.
- **Acceptance:** two different party preparations yield viable different approaches; players can abandon/re-enter without reset; at least one route, service or inhabitant state changes; one useful treasure/equipment decision affects further play. A genuine loss and save/resume are included.
- **Risks/non-goals:** no forced combat gate to showcase battle, no content volume metric as quality proof, no resurrection of obsolete client journeys as certification.

## Phase 3 — Combat quality

### R9. Explain and exercise current mechanics first (required)

- **Problem/evidence:** sentinel attrition, weak ordinary role, invisible cooldown/Guard/condition effect; no shipped multi-enemy encounter found. Registry definitions do not demonstrate play.
- **Scope/owner:** M, combat projection/controller, ability/encounter authors and current abstract renderer.
- **Dependencies:** R1/R2, R7 for purposeful stakes; life-state policy in R3.
- **Deliver:** explicit participant grouping, stable queue, target selection, current conditions/clocks/availability and full calculations; useful ordinary action per companion; coherent enemy fallback/selection; authored multi-enemy encounter and optional/non-kill approach.
- **Acceptance:** play two opponents with target changes, area spell, resisted/immune effect, support spell, equipment/consumable use, defeat/retreat. Players explain why they chose actions. Compare single-target attack versus sweep values; AI does not prefer area damage merely for its label or flee solely on cooldown.
- **Risks/non-goals:** do not “fix” by inflating HP or adding more similar damage buttons. Clear current rules can reveal shallow content; that requires design rather than UI praise.

### R10. Shared time and feature-based tactical experiment (required for intended tactical product; gated)

- **Problem/rationale:** no current position/reach/feature access means physical room decisions disappear in battle. Timing/retreat/world actions have separate clocks. Protection/known threats can provide distinct party choices.
- **Scope/owner:** L, world/location/time, battle/targeting/AI, authoring and save projection.
- **Dependencies:** R2–R5/R9; reviewed rules in [combat model](combat-model.md).
- **Deliver:** fine/coarse shared time contract; authoritative zones/connections/occupancy, movement/reach/visibility; committed intents; Protect; one authored feature action; objective ending and withdrawal transition. Stage intent/protection and space tests separately where possible.
- **Acceptance:** two enemies/two or three zones, one relevant feature/threshold, meaningful movement/protection/control decision, no ghost reach; state affects actual world passage and persists on reload; interruptions and NPC timers agree with elapsed time; save during an active turn resumes intents/positions.
- **Risks/non-goals:** no grid, implicit opportunity attacks, free swaps, invented environmental action or UI-only intent forecast. Migrate old ten-minute clocks explicitly; do not reinterpret legacy owner-turn conditions. If zones add only clicking, revise before expansion.

## Phase 4 — Continuing RPG and longer-term capabilities

### R11. Advancement and the second expedition (required for campaign-capable release, PX07/14)

- **Problem/evidence:** current XP and twenty-XP training do not constitute substantial progression; no linked adventure growth played.
- **Scope/owner:** L, progression/catalog/rules, party/mentor actions, content and development UX.
- **Dependencies:** R3/R4/R8; define first two levels and training policy before building.
- **Deliver:** catalog level/reward curves, achievement eligibility and once-only causes, meaningful technique/equipment choices, safe advancement preview, credible recruitment/replacement when needed. Second site/opportunity uses earned knowledge/capability.
- **Acceptance:** complete two expeditions, earn and choose at least one development, use its new option, return to earlier change; no kill-only reward requirement or double award after reload. Fallen participants' reward policy consistent.
- **Risks/non-goals:** no arbitrary XP math in UI, no regress of level progress disguised as training, no dozens of shallow unlocks or large roster manager in first release.

### R12. Institutions and competing situations (required for persistent-world identity; breadth staged)

- **Problem/rationale:** current goal pursuit and routines are promising but do not prove world responsiveness beyond individual tasks. Product needs purposes/resources/obligations that outlast a quest.
- **Scope/owner:** L, authoring/world agency/knowledge/commitment contracts and campaign content.
- **Dependencies:** R4/R7/R8; bounded NPC knowledge/action durations; R11 for campaign milestone.
- **Deliver:** one concrete institution with representative, resource/access rules, explicit promise/permission, reports and restitution; two situations with conflicting time/resource interests; independent progress while party away; specific changed access/dialogue.
- **Acceptance:** player can defer one opportunity, fulfill/amend/breach another, observe/report an independent development and choose a next priority without a quest checklist. Institution knows only actual witnessed/reported information. State survives save, time and return.
- **Risks/non-goals:** no global reputation number replacing people, no fully simulated economy/universe, no omniscient NPC planning or invented faction motives.

**Optional after these proofs:** richer cover/range or metric tactics if zones demonstrably fail; broader bestiary/classes/spells; additional regions and long arcs; richer economy/transport/crafting; larger roster; illustrations and animated effects. Each needs a player decision and content cost rationale. Multiplayer, wall-clock/offline progression and procedural infinite campaigns are separate product choices, not prerequisites.

## Reviewable implementation experiment before a rewrite

**Step A — paper/fixed-event comparison, no software change.** Use the three previously developed modalities with equal information, then the recommended layouts in D. Five fresh participants is a useful formative target; smaller samples report individuals, not pseudo-statistical certainty. Counterbalance order; don't let story learning be mistaken for a better design. Ask them to inspect a guard without attacking, choose rescue method, compare routes, interpret a save/damage exchange, hand over treasure and resume unfinished business.

**Step B — isolated event-backed prototype, only after review.** Three scenes and an aftermath: Pell's rack, Ash's passage, sentinel or dragon exchange; one Party/Notes flow, site graph and region itinerary. Actual recorded events for loss/reward/refusal and immutable snapshots. Include desktop, 390px and image-disabled variants. Do not hand-author fake successful outcomes for unsupported branches. If free exploration is needed, use the existing session behind a thin reviewed adapter rather than quietly mixing real and fabricated resolution. Keep Mono available.

**Step C — rules experiment, separately reviewed.** Two actual enemies, target/area/resource decisions under current abstract rules, then a feature-zone/intention/protection version. Hold party/content information as comparable as possible. Test changed plans, not just completion speed. No full campaign rewrite to evaluate a turn mechanic.

Suggested gates are **targets, not measured results**:

- Zero unintended world-changing actions in inspection/selection tasks; stale selection never commits a different action.
- At least four of five independently explain location, chosen approach, known deadline/uncertainty and actual cost; report exact individual outcomes if fewer participants.
- Same threshold for reconstructing actor/action/effect, bleeding-save versus bite damage, Guard/resistance, next actor and who fled.
- After return/resume, participants identify casualty/gear location, actual recovered reward, resolved matter, remaining opportunity and last-known route change without reading the entire log.
- Players find alternate route without moderator pointing to Map; otherwise trial compact site graph in expedition scenes before adding more panels.
- Each companion has a defensible useful action over two cycles; players can explain at least one choice other than best available damage. Movement/protection/feature decision changes a plan in the tactical experiment.
- Keyboard/text scaling/390px show no hidden commit control, inaccessible result or overlay interception; no essential hover/art reliance.
- One independent world event and one player-caused persistent change are correctly distinguished from reports/unknown state.

Any silent action, wrong attribution, false map implication or lost outcome fails the contract regardless of aesthetic preference. If readable battle remains repetitive, change encounter/role rules. If all modalities fail similarly, fix shared data/knowledge before commissioning another skin.

## Release evidence, not a backlog burn-down

A coherent first product passes:
1. Safe readable intentions and outcomes.
2. One complete expedition with actual preparation, meaningful approaches, danger/treasure and changed return.
3. Multi-enemy party decisions, real defeat/recovery/withdrawal and consistent spatial/time semantics.
4. Save/resume preserving world, knowledge and encounter history.
5. Two linked expeditions with a real development and independent situation/institution response.

Correctness checks protect event/state invariants; exploratory participants establish comprehension and decision quality. A valid receipt, successful replay, test count, illustration or number of authored rooms proves none of the latter on its own.

## Changes not to make

Do not implement a replacement frontend in this commission. Do not preserve Mono's panel architecture as the product template. Do not make current nonspatial battle a permanent ceiling, or draw tactical space before rules exist. Do not force every opportunity into a quest, every NPC into a dialogue tree, or every noun into physics. Do not use generic narration to cover absent world/authoring semantics. Do not claim multi-enemy/progression/campaign support from types or registry coverage. Do not replace meaningful consequences with more meters, more commands, more similar spells, more HP or compulsory combat.
