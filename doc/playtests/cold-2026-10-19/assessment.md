# B–G. Diagnosis and proposed player experience

**Follow-up correction:** the bite save prevents bleeding, not weakening. The follow-up traces this distinction to the saved events and ability definition; the original proposed example misidentified the condition. See [continued investigation](investigation.md).

Evidence numbers refer to the [chronological cold record](cold-playtest.md) and [complete gallery](evidence-index.md). Observations precede code inspection. Recommendations are proposals; no new interface was implemented.

## Overall judgment

**Understandable in individual authored situations; confusing across transitions. Occasionally engaging; not yet a compelling continuing RPG.** The rescue lets me understand a problem, acquire a tool, choose an approach, see a person freed, and bring them home. Those are real accomplishments. Much of the rest feels like selecting legal transactions from a changing schema. The UI sometimes commits an action where I expected to inspect an object; sometimes requires three nested selections for a simple pickup. It tells me that invariants held while losing the conversation or event that would make the outcome matter.

The current Mono client is already relatively restrained compared with an unrestricted engine workbench: it has four ordinary tabs, a strong current-location heading, and a real graph map. The problem is not simply the number of tabs. Its five simultaneously prominent regions—scene, entity list, action menu, maps, party—plus history give similar visual authority to different kinds of information. Meanwhile crucial information is missing: the purpose of an action, why a companion enables it, the latest causal exchange, known tasks, and ongoing relationships. Blank panels and repeated labels are visible even when they contain no useful decision.

The design direction should be **a place and its situation, followed by an explicit player intention and a readable consequence**. The engine remains the source of truth; legality alone must stop being the content-selection policy.

## B. Failure inventory

Severity: **P0** undermines agency or materially misstates an outcome; **P1** repeatedly prevents understanding or continuity; **P2** creates friction or weakens fiction. These are player-impact priorities, not security classifications.

| ID | Severity | Evidence / concrete failure | Cause and accountable layer |
|---|---|---|---|
| F01 | P0 | Clicking sentinel starts combat and resolves an enemy sweep (66→67); clicking Dry stores picks a lock (15→16). | UI controller `open()` executes any sole leaf. Entity inspection, action selection and commitment share a gesture. Choice grouping makes the sole action depend on engine legality. |
| F02 | P0 | “Tactics” executes Sweeping blow and Elen falls (56→57). | Mislabelled delegation in frontend; `Tactics.choose` is invoked immediately. This is neither advice nor a tactics screen. |
| F03 | P0 | Ash uses Retreat; result says **our company** withdrew; Ash still guards (99). | Engine outcome `escaped` lacks fleeing side/actor; presenter assumes party flight; world does not enact enemy departure/release. Cannot be solved by prettier text alone. |
| F04 | P1 | Wren gives deadline; Journal says no deadline and nothing established (05→07). | Information contract only exposes formal knowledge facts and installation deadlines. Canonical `closesAt`/event-based pressure and objectives do not feed Journal. Content and UI disagree about what “known” means. |
| F05 | P1 | Thank-you conversation vanishes; only six-coin delta remains (34→35). | NPC moves during action; talk rendering drops speaker/mode as soon as speaker is absent. Topic reply is not retained in immediate history. Authored thanks exists; delivery loses it. |
| F06 | P1 | Save/reload says “Nothing has happened yet” though the journal contains events (95). | Downloaded checkpoint restores simulation; imported UI log is cleared. Two histories are treated as unrelated truths. |
| F07 | P1 | Save, damage, bite, debuff precede causal action in reading order (54, 71). | Renderer reverses individual log lines, truncates to 14; event grouping is lost. Structured combat events already contain much needed information. |
| F08 | P1 | Guard/conditions have names but no magnitude, duration or clock; cooldown abilities disappear (70–78). | Projection strips status instances to IDs, does not expose guarding on combatant rows, offers only legal abilities. Some needed data exists in battle; availability reasons need a richer projection. |
| F09 | P1 | Raw `statMod(#strength)` formulas on primary choice and Company screens (06, 53). | Catalog effect strings are used as descriptions. No player-facing ability summary; actor-specific modifiers not resolved for display. |
| F10 | P1 | Combat erases room, stakes, Hesta, guarded passage; return discards fight summary (53, 59). | Separate mode renders combatants/commands without encounter context or durable aftermath. |
| F11 | P1 | Exploration after rescue has unvisited doors but no continuing situation; day-two Journal is a log, not adventure memory (94). | Scenario is a bounded rescue with incidental loot/combats, and Journal omits objective history, relationships and opportunities. Both authoring and IA. |
| F12 | P1 | From Hoist room, “Ash bars the way,” but Ash cannot be seen or addressed (28). | Passage barrier knowledge and entity interaction access use different locality rules. Need an authored threshold encounter or honest “hound in the far passage” description and approach semantics. |
| F13 | P2 | “Survivors retain their injuries and spent resources” and “You examine the evidence…” (11, 61, 79). | Generic action-feedback fallback describes system guarantees. Not missing authored description alone. |
| F14 | P2 | Padlock and valve state lines duplicated; item pickup narrated and counted twice (15–16, 19, 80). | Feedback uses changed observation as fallback result, then appends same observation; narration and mechanical resource deltas lack deduplication policy. |
| F15 | P2 | `feral cave hound feral cave hound`; “Funerary bronze construct” and Burial chain on foundry inspector (53, 67–71). | Shared species/class composition printed literally; reused content carries a mismatched identity. First is presentation; second needs content adaptation. |
| F16 | P2 | Broad character-creation promise of salvagers/burial keeper; play begins in a different bounded scenario (01–02). | Hardcoded creation copy and seed naming outlive campaign changes; README also points to removed/stale alternatives. |
| F17 | P2 | “They wait for you to speak” for pinned Pell; asks to fetch bar already carried; Hesta calls Pell missing after reunion (22–23, 49). | Generic UI dialogue opener plus insufficient state-conditioned authored topics. |
| F18 | P2 | “Few steps away” for 30-minute ridge movement; 1h+30m regional display obscures 2h upper route (08, 43). | Transition label equates same area with physical closeness; region chart collapses distinct passages between area pairs and omits within-area travel. |
| F19 | P2 | Named question-mark rooms, duplicate floodplain stubs, colour-only passage distinctions, cropped names (12). | Known-vs-unvisited semantics unclear; map consumes constant screen space with low text contrast; status is mainly colour. Coordinates describe diagram nodes, not room geometry. |
| F20 | P2 | Abilities/resources readable in different places: Company has formulas and personal coin, Pack has field healing, global purse elsewhere (06, 62, 92). | State ownership and recovery workflow spread across views without a coherent party model. |
| F21 | P2 | Automatic meal is only `ration: 1 → 0`; inn extends meal clock without clear explanation (87, 93). | Time/resource effects do not produce understandable expedition events; service offer underspecifies effects. |
| F22 | P2 | Shopkeeper/innkeeper cannot converse; stairs, hoist, lamps, jars and moulds are mostly scenery (37, 89). | Missing authored topics and interactions. A frontend cannot infer a usable winch, upstairs room, or merchant knowledge from a noun in prose. |

### Information architecture audit

| Information | Current treatment | Consequence | Proposed responsibility |
|---|---|---|---|
| **Fiction** | Static observation paragraphs mixed with state paragraphs; dialogue in a mode; event replies sometimes in history. | Strong prose exists but is displaced by prerequisite explanations and vanishes at transitions. | Scene establishes place and observable situation; action response gets immediate reading priority. |
| **Mechanics** | Expression-language ability descriptions; mixed damage/roll/save fragments; repeated XP and resource rows. | Effort goes into decoding computation rather than choosing a response. | Brief numeric consequence beside action; expandable full calculation attached to that action. |
| **State** | Two histories, map, party bars, Company, Pack, Journal facts; objectives only in scene. | No reliable answer to “what still matters?” | Compact party strip; unified party sheet; adventure notes with active/resolved leads and changes. |
| **Choices** | Perceived entities routed into a menu tree; sole legal command may auto-execute. | Discoverability depends on hidden command cardinality. A visible noun is dangerously ambiguous. | Inspect entity; choose a labelled intention with method, provider, cost/time and known risk; commit explicitly. |

This is still too close to a presentation of engine state: schemas determine grouping, legal-command count determines interaction, formal facts determine memory, and event fragments determine storytelling. Determinism does not make those choices legible. Conversely, the prose, containment hierarchy and named passages show that a readable player model can be built without inventing another world model.

## C. Narration diagnosis and contract

### Examples, replacements, and required information

Replacements below are constrained to demonstrated events. Conditional examples are labelled. Do not add flourishes such as a weapon striking a joint, blood on a wall, an enemy stumbling, or a scream unless authored or represented.

| Current exact text / evidence | Source of problem | Replacement / destination | Required structured information |
|---|---|---|---|
| “Your company prevails. Survivors retain their injuries and spent resources.” (61, 79) | Generic procedural invariant; wrong information to narrate. | If enemy died: **“Ash falls. The hoist passage is clear.”** Party changes below: Elen 2/7 HP; Dori spent 4 mana. If no relevant world change, stop after “Ash falls.” | Outcome and reason; defeated participants; passage change; per-encounter party deltas. The passage clause must depend on an actual open transition. |
| “Your company withdraws from the encounter.” following “Ash uses Retreat.” (99) | Missing encounter outcome identity plus misleading presentation. | **“Ash withdraws from the fight.”** Do not add “runs away down the passage” or “the way is clear” under current state. Add a mechanical warning that the passage remains blocked only if reporting this unresolved state; fix the world transition first. | Fleeing actor/team, escape reason, resulting location/state, guard change. |
| “You examine the evidence and record what it establishes.” (11) | Generic procedural text. | **“The survey board marks a tram crawl from Dry stores to the Hoist room.”** | Source ID/name; learned proposition; route endpoints and discovery condition. Already substantially available. |
| “The stores door stands open; its padlock hangs from the hasp.” twice (16) | UI composition duplicates fallback result and changed observation. | Once: **“The padlock is open. The stores door can now be used.”** Or retain the existing sentence once. Only name Bran picking it after the action records its provider. | Action identity, state transition, provider attribution. Existing state sentence needs no invented action detail. |
| “Dori gains 1 the warder's copper focus.” (15) | Mechanical terminology/grammar leaking into fiction; duplicate pickup. | **“Dori takes the copper focus.”** Inventory now lists it; omit second prose line. | Item instance/name, quantity, recipient; clean display name distinct from article-bearing authored label. |
| “Deal (max(0, statMod(#strength) + 1d6)) physical damage to enemy.” (06, 53) | Catalog effect DSL used as description. | **“Weapon attack — physical damage to one enemy.”** Detail resolves this actor's damage expression to dice plus signed modifier and explains zero floor; defense/resistance shown separately. | Typed effect, current relevant attribute modifier, equipment sources and conditional modifiers. Don't label the raw roll as final damage. |
| “Guard. Defend.” (06, 76) | Vacuous mechanical description. | **“Guard — halve damage taken until your next turn.”** Guard badge includes its expiration boundary. | Guard flag and owner-turn lifecycle; implemented halving/order. |
| “Apply blessed to party for 3 turns.” (70) | Mechanical label without effects or clock. | **“Bless the company — 2 mana. Each companion gains +2 damage power for 3 of their turns.”** Show any policy-specific qualification in detail. | Condition modifiers, per-owner remaining durations, effect damage policy. Derive exact physical/nonphysical scope from rules, not the word “blessed.” |
| “Elen resists (constitution 21 vs 11).” (54) | Correct rule fragment with missing effect referent. | **“Ash bites Elen for 4 damage. Elen resists the bite's bleeding effect.”** Save arithmetic in details. | Parent action/effect identity, save result, blocked condition application, independent damage result. |
| “the bronze boiler sentinel takes 3 physical damage (roll 8; resists 35%) → 6 HP.” (75) | Presenter omits power/armor/guarding while showing a calculation that appears incomplete. | **“Bran deals 3 damage to the sentinel (6 HP left).”** Details include roll 8, power, resistance, armor and Guard in actual evaluation order. | Existing `damage.modifiers`, guard state and damage event; group with source action. |
| “They wait for you to speak.” (22) | Generic UI filler disregards authored state. | For Pell, retain **“Pell lies pinned beneath the timber rack.”** For people with no relevant action/state, no filler. | Perceived speaker state; no inferred attitude. |
| “nothing compels you to fight it” (66) | Authored narrator defends choice design rather than describes event. | **“The sentinel turns on stiff joints. The arch and pipe walk remain open.”** Put steel resistance/poison immunity in known creature traits if these are established knowledge; otherwise author visible clues without promising exact rules. | Observable behavior, known exits, knowledge provenance for traits. |
| “4 actions over the fight; the journal keeps every blow.” (61) | Self-justifying presentation assertion. | Omit from fiction. Optional **“Combat details”** link near a retained aftermath. | Encounter ID; accessible event history; no narration needed. |
| “Ask Wren what is wrong: Ask Wren what is wrong” (05, 61) | Duplicate UI labels; dialogue reply suppressed from history. | **“Wren asks you to find Pell before the culvert floods at 1:40 p.m.”** Keep verbatim reply available in conversation history. | Speaker/topic/reply, learned task and known deadline. |
| “ration: 1 → 0” (87) | State delta is the only account of an ordinary event. | **“The company eats its last ration.”** State: 0 rations; next meal due tomorrow at 8 p.m. | Actual consumption event, party quantity unit, due-at clock. Don't invent a camp or meal location. |

**Preserve the good prose.** “It lifts a hand's breadth, and Pell drags the leg clear” names a particular physical outcome. Wren keeping a hand on Pell's sleeve tells me more than a “relationship changed” receipt. These are models for authoring, not candidates for procedural expansion. The rescue's stone wedge is authored; a general narrator must not assume every lifted obstruction is wedged on a stone.

### Contract by destination

1. **Scene description:** current place, perceptible features, people and what they visibly do, exits with meaningful barriers/hazards. Order stable spatial context first, urgent situation next. Update descriptions when states change. Do not restate the whole room after every pickup. Distinguish background inhabitants/scenery from entities the engine supports acting on; ordinary description must not promise a simulated upstairs, hoist, or object without support.
2. **Action result:** actor/intention → concrete event → consequential change. Usually one or two sentences. If nothing changes, say why in context. Time/resource cost belongs in a short attached state line. A failure needs an observed reason or explicit uncertainty, not “the attempt resolved.” Preserve results through NPC movement, mode changes and save/reload.
3. **Combat resolution:** one causal group per action, in chronological order. Name source, action, target(s), actual damage/healing, blocked effects, new conditions or falls. Automatic enemy groups follow the player's group before the next prompt. Surface surprising outcomes (zero damage, immunity, interrupted action) with their reason. Never invent hits/misses: the standard current Weapon attack is direct damage, not an attack roll; only abilities with attack rules can claim hits/misses/criticals.
4. **Party display:** current HP/mana, explicit down/dead rule, important condition effects and remaining clock, equipment, usable recovery, shared supplies. Display routine persistence here. Separate personal coin from the spendable company purse or remove the irrelevant number from the default view.
5. **Detailed mechanical log:** full rolls and modifiers in evaluation order, save target and meaning, source item, condition application/expiry, cooldown, action time, resource deltas. Expand under the event being explained. Stable action/event IDs retain source relationships after reload. Keep debugging relation changes outside ordinary play.
6. **Do not narrate:** invariant persistence, execution success, number of dispatched commands, “the journal keeps…” assurances, generic evidence bookkeeping, repeated acquisition totals, absent status removals, hidden world facts, or motivation/emotion/physical motions unsupported by data.

### Minimum event/presentation data

Much of the fix is projection, not new simulation. `CombatEvent` already has turn, source action, targets, saves, damage modifiers, condition events and outcomes. Preserve these as groups instead of flattening to strings. `Fighter` has guarding and status instances; `CombatantRow` currently drops them.

Needed additions or contract changes:

- Stable encounter/action/effect identifiers, grouping for multi-target and multi-effect actions; retain raw structured data until rendering.
- Outcome `{ reason, winner?, fleeingActor?, fleeingTeam?, incapacitated, worldChanges }`. `escaped` alone is insufficient.
- Result envelope with actor/provider, target, authored response, changed properties, perceived events, time spent, and known opportunity changes. Separate enduring state from a one-time reply.
- Known task/pressure/relationship records with provenance and resolved/expired states. Public descriptions and heard dialogue must not require omniscient journal access, nor be discarded because they were not encoded as `fact` entities.
- Semantic ability summaries generated from typed effects, condition definitions, current actor modifiers and availability reasons. Author special summaries when the typed rules cannot explain the intent concisely.

## D. Combat usability study

### Played exchanges and practical conclusions

| Encounter | Party / enemy starting state | Result | What it established |
|---|---|---|---|
| Ash 1 | Party full; Ash 11 HP. | Bran Wounding blow; Ash wounds Elen; player retreats at 3/7. | Turn marker works; auto enemy action and reverse fragments make sequence hard; retreat does not relocate party. |
| Ash 2 | Elen 3/7; Ash 8/11, weakened. | Misleading Tactics executes sweep; Elen falls; Dori spends 4 mana reviving to 2 HP; Bran kills Ash. | Wounds and enemy condition persist, revival works; disadvantaged re-entry has real stakes; compressed aftermath omits recovery context. |
| Sentinel | Party HP 7/12/12, Dori mana 2/6, potion used; physical resistance. | Enemy opens; wounding, backstab, blessing, ordinary attacks and Guard; 15 actions; party survives. | Saves, resistance and condition mechanics exist. Repetitive attrition and weak explanatory feedback dominate. Depleted resources did not make this a hard fight. |
| Directed Guard probe | Fresh pre-combat save; no attacks after initiating. | Enemy Retreat, misreported as party withdrawal. | Outcome identity and world transition are broken; not a defeat test success. |

**Initiation:** multiple-choice Ash at least shows Attack with a risk mark; sole-action sentinel attacks on entity click. Consequence needs an explicit commitment: “Attack the sentinel.” Opening sweep before the first player action should be presented as an enemy action, with initiative/turn order visible.

**Turn ownership:** current actor name and arrow are good. Turn 1 → 3 or 4 → 6 appears to skip unexplained steps because automatic actors run between prompts. Show an ordered queue of known living actors, current actor highlighted, and latest automatic exchange. Call the counter an action/turn index consistently; do not imply it is a round.

**Targeting:** target buttons exist, but sole-target shortcuts hide the choice. Recall automatically targets the only fallen ally; this worked but taught a different gesture from multi-choice menus. Make selection preview independent of target count. Eligibility can still come entirely from `legalCommands`. Multiple-enemy selection was not played in this campaign; do not call it validated.

**Position and environment:** `BattleState` has combatants, actor, turn, outcome. `Fighter` has no position. `Targeting.candidates` filters living/dead/team, not range or line of sight. Turn order sorts speed; no movement action, reach, cover, facing, opportunity attacks, adjacency, combat passage access or traversable arena geometry is present. Place coordinates are world/site diagram coordinates. “Backstab” is a damage ability with no positioning prerequisite. A tile arena would be misleading.

**Attack/spell feedback:** ordinary attacks can do zero from low rolled/modifier values. Do not invent a miss or weapon-deflection story. Bless and Recall materially change the fight, but effects are explained by labels and bars rather than intent and consequence. Cooldowns should remain visible as unavailable choices with the remaining owner turns; Purify on an unpoisoned living target and Second wind at full health illustrate why legality does not establish usefulness. These are code-inspected possibilities, not all attempted actions.

**Damage, resistance and saves:** distinguish actual damage, prevention, save on damage versus save on a secondary condition. Against sentinel, 35% resistance is explicit but Guard and power are omitted from the displayed arithmetic. Damage events already carry those modifiers. Poison immunity was described but not exercised. The engine's attack/save capabilities are broader than this play sample; do not redesign them based on assuming every attack rolls to hit.

**Enemy intention:** Ash guarding a particular way is well authored before combat; battle discards it. Sentinel's sweep and chain are distinguishable rules, but its immediate future action is not an exposed committed intent. Display known role/traits and last action now. An “about to sweep” telegraph requires actual engine commitment or an authored behavior phase; do not predict a weighted AI choice as a fact.

**Coordination:** the party cannot assign a front line, protect Elen through positioning, change formation, intercept attacks, or exploit the room. Guard is self-protection. Buff/debuff and target/healing choices do allow coordination. Explain those before adding mechanics. Revisit encounter design after players can understand them: repeated damage options plus individual cooldowns do not automatically yield interesting tactics.

**Victory and aftermath:** retain a visible final exchange and an aftermath until the player continues. Show dead/down participants, party condition, supplies spent, passage changes, lost services, rewards and remaining leads. In Ash's fight, note Hesta's refusal with its cause. Don't flatten an earlier fall and later revival into “Elen falls” as the apparent final state.

**Retreat:** current effect ends combat with `escaped` and ordinarily leaves locations unchanged. For an immediate presentation fix describe it as disengagement, explicitly retaining current room and barriers. To promise physical retreat, engine must select/validate an exit, time/risk/escort consequences and enemy response; it must also distinguish enemy withdrawal. That is a separate mechanic, not a map animation.

**Defeat:** no full-party defeat was observed. Code inspection shows elimination at zero HP, downed allies eligible for revival during combat, and a no-survivors screen with New company/Journal. It does not establish a richer capture, rescue or recoverable defeat experience. Agree on “down” versus “dead” and when irreversible death occurs before writing evocative death narration. Follow-up must play a true loss and save/resume it. No claim of validated defeat behavior is made here.

### Minimum combat representation

Use a compact **abstract engagement view** anchored in the current room: place name, conflict/stakes, named exits as context, allies/enemies with condition explanations, turn queue, current choice, latest causal exchange. Explicitly explain once that combat has no positioning and choices can target eligible combatants regardless of drawn placement. Do not draw a front/back formation unless it changes rules.

A two-column roster is enough. A small room vignette may remain descriptive, with no distances or draggable tokens. A status such as “Ash guards the hoist passage” reflects authored world state; it is not a reach zone. Keep environmental interactions unavailable during combat unless the session actually supports issuing them. Turning a valve mid-fight would need action timing, allowed targets, hazard resolution, and encounter integration.

## E. Spatial presentation recommendation

**Keep a site connection diagram and an on-demand region route view. Do not add a tactical grid.** Start each room with a short spatial paragraph and a clear list of exits/people/features. A separate local floor plan is not justified by current data.

| Scale | What to show | Actual supporting semantics | Missing / required work |
|---|---|---|---|
| Current room | Relative layout from authored prose; named exits with direction only when authored, stairs/up/down, guarded/closed/dangerous labels, present beings and interactable objects. | Room membership, passages and kinds, anchored observations and thing states. | No room dimensions, object coordinates, visibility cones or within-room distances. A measured floor plan needs these authored/mechanical semantics first. |
| Site / settlement | Topological nodes and named passage edges; containment as building/level grouping; current room, visited rooms, known unvisited exits, barriers and hazards. | Canonical place tree, authored grid node coordinates, bidirectional/one-way connections, hidden-until discovery, traversal durations and thing/guard states. | Preserve edge identity and route knowledge; label drawing “connections, not to scale.” Node coordinates are not evidence of room shape or exact bearings across different parents. |
| Region | Known sites, distinct routes and realistic total travel times; accessible entries and known closures; unresolved leads at places where learned. | Region/site/settlement/wilderness containment, route endpoints, durations, discovery and visits. | Current area-pair aggregation loses parallel routes and internal legs. Accumulate actual passage itineraries; don't imply a region line's 30m is full town-to-foundry travel. |
| Combat | Room name and existing exits as context beside abstract rosters. | Encounter participants and current world location. | No tactical spatial rules. Only add range bands or zones after engine rules implement their consequences. |

For the foundry, player-known graph can express the upper route, culvert shortcut, stores crawl and gallery/pipe-walk loop. This is useful routing play: time, barriers, danger, party capabilities and route knowledge matter. Preserve it. A local artistic map could obscure the more important question of which connection is usable.

Differentiate **visited**, **known but not visited**, **reported route**, and **unknown beyond an exit**. Reveal a destination name only if observable or learned. Discovery source should explain why the tram crawl appears. “Not yet walked” should be based on passage traversal, not merely having visited both endpoints: `ChartModel.edge` currently infers exploration from visited endpoints. A party can visit each end via a loop without crossing the hazard between them.

Current authored node layout makes the diagram possible, but the UI crowds it: small dark labels and multiple external stubs at desktop size, clipped option names nearby, and route status primarily communicated by colour. Use full labels, icon/text status, and a stable layout. Move the region view out of the constant sidebar. Let the player open a map at useful size without losing the current action. A mobile layout was not playtested; no responsive usability claim is made.

## F. Proposed minimum coherent player experience

Three destinations: **Adventure**, **Party**, **Notes**. Map is a full-size overlay from Adventure/Notes, not a permanent parallel dashboard. Conversation, mechanism inspection and combat are contextual states of Adventure. Pack/equipment/recovery belong together in Party. A compact condition strip remains available everywhere; full HP bars and stats expand when needed.

### Adventure, ordinary scene

```text
REEDWAKE QUAY · Reedwake                  Day 1, 8:10 a.m.
Find Pell — Wren says the culvert floods about 1:40 p.m.   [Notes]

Barges nose into reed-fringed piles. ...
Wren watches the path toward Censer Hill.

People         Wren, ferry-keeper — waiting
Ways           Willow causeway · 1h
               Nera's shop · 10m     Returning Oar · 10m
               Shrine · 10m          Ferry house · 10m

[Select Wren → conversation appears here; no time passes yet]

Latest: Wren asks you to find Pell.             [Conversation]
Party: Elen 7/7 · Bran 12/12 · Dori 12/12 | 14 coin, 1 ration
[Adventure]  [Party]  [Notes]                         [Map]
```

Annotations: one reading surface, inline choices, no empty action pane. Critical pressure is persistent but not repeated in every panel. People are visible fiction; exits are destination choices with time; state is a small strip. Selecting a noun never spends time. Selecting an explicit action can commit directly, with its consequence/cost visible; no universal confirmation modal.

### Conversation / mechanism in the same surface

```text
PELL · Hoist room
Pell lies pinned beneath the timber rack.

“It came down on me ... Don't just haul on it.”

[Lever rack with pry bar — 10m; the company has a bar]
[Dig under it — 40m]
[Heave it — choose lifter; Pell warned against hauling]
[Ask what happened]                                  [Back]
```

Annotations: this example combines conversation and nearby physical problem without classifying “free the injured person” as an unrelated engine submenu. The actual action model must keep speaker/target distinct. Provider attribution should say “Bran's lockwork” only when supplied; do not infer who swung a group-owned bar. Risk statement reflects Pell's warning, not omniscient knowledge of the heave outcome.

### Combat / aftermath

```text
CASTING GALLERY — Ash guards the hoist passage
Abstract combat: no movement or distance rules.
Next: Bran [now] → Ash → Elen → Dori

Company                         Opposition
Bran 12/12                      Ash 11/11 — guarding passage
Elen 7/7                        Known: ...
Dori 12/12 · 6 mana

Bran: [Weapon attack] [Wounding blow] [Guard] [More]
Selected: Wounding blow → Ash · 1d4 physical + weakened
Weakened: -1 damage power for 3 owner turns.        [Use action]

Bran's blow deals 3 damage. Ash is weakened.
Ash bites Elen for 4. She resists the bleeding effect.
Elen 7 → 3 HP.                                [Roll details]
```

Annotations: the queue is computed, not an invented intention. The enemy's next chosen ability is not telegraphed without commitment. Damage grouping, target and condition explanation answer “what happened?” before arithmetic. Preview is the same for pointer and keyboard; eligible targets remain selectable. Cooldown/insufficient mana options remain visible with short reasons under More rather than disappearing.

```text
THE FIGHT ENDS
Ash falls. The hoist passage is clear.
Elen 2/7 HP · Dori 2/6 mana · 20 XP each
Hesta refuses her services after you attacked Ash.
[Review party] [Continue exploring] [Combat details]
```

Annotations: outcome, party cost and world change persist until acknowledged or the next explicit intention. “Review party” opens recovery in context; it does not automatically consume a potion. Any rewards or cleared routes shown must derive from this particular encounter's changes.

### Seven representative flows

1. **Arriving at a settlement:** show settlement/current place, a short orienting scene, inhabitants with activity, services/known ways, any immediate concern. Wren's approach can introduce the rescue in fiction. Character creation is campaign-aware and provides three plain role summaries with optional customization; reveal detailed stats on demand. Do not promise absent adventures.
2. **Speaking to a person:** choose Wren; retain room and speaker activity; show topics as player intentions. Reply appears where the choice was, with learned lead/deadline added to Notes. A leaving NPC's final reply remains readable: Wren thanks the company, gives six coins, then goes home. Back returns to scene without destroying the exchange.
3. **Exploring a dungeon room:** read Bell workshop, see the relevant exits and barriers. Selecting stores shows “Locked padlock; Bran can pick it — 10m,” not automatic lockpicking. After it opens, offer “Enter stores — 10m.” Map marks the new state once. If no method is available, show the known barrier and relevant requirement without inventing hidden alternatives.
4. **Interacting with a physical mechanism:** select rack or steam valve, get state, visible methods, providers/items, time and known risks. After turning valve, narrate shut pipe once, show arch now safe, offer crossing separately. No generic physics sandbox is implied; authored alternatives remain the boundary until a generalized interaction mechanic exists.
5. **Entering/resolving combat:** explicit Attack or an actual hostile trigger; preserve location/stakes, explain opening enemy action, highlight current actor. Choose ability, inspect effects/cost/availability, choose target, commit. Show automatic enemy actions grouped in order. Aftermath remains before exploration resumes. Rename existing Tactics to “Choose an action for me” if kept; explain it delegates one current action.
6. **Examining party afterward:** Party opens with injuries, conditions and recovery before stats. Elen's 5 missing HP are visible alongside available potion/healing, cost, recipient and time. Equipment and carried items are one section of this view. Full-health targets remain inspectable but do not receive equal emphasis in healing choices. Inn offer lists recovery, food, eight-hour duration and any restrictions supported by rules.
7. **Returning to the region / unresolved adventure:** Notes retains rescue resolved, Wren's thanks, Hesta's refusal, known loot or unvisited routes, and relevant route closure with timestamps/provenance. Map shows actual alternative itineraries and their time. For a partially completed rescue it says “Pell freed, still at Hoist room; not escorted home,” if known. For this completed rescue, it honestly states no active task remains. Further adventure needs authored leads and reactive content; UI must not manufacture a next quest from an unexplored node.

### Scenario and engine responsibility

Current content explains both the promising moments and the limits. `caught-below/situation.kyr` contains rescue states, slower/faster digging, a risky heave that injures Pell, mending, escort/home pursuits, reunion and differing rewards for escort versus abandonment. This is better structured than a command checklist. Its weaknesses are limited reactivity (already-held tool, premature missing-person worry), repeated topics, and little continuation after resolution.

`reedwake/site.kyr` supplies passages, padlock/steam states, a secret crawl, finite wares, services, optional hound, helper relationship consequence, optional sentinel and magic loot. Preserve the consequence of striking Ash; it makes an NPC more than a vendor. But the old inspector's funerary species/chain, a sword lying unplaced in a room list, largely service-only town residents, and scenery lacking verbs are authoring/content problems. The frontend can make these boundaries clearer; it cannot supply their missing motivations or reactions.

The short route floods at a time but the trapped person has no observed worsening condition or urgent medical clock in this source; closure chiefly adds travel. The default locksmith and discovery route bypass the hound, and the pipe walk bypasses steam. Those are legitimate alternatives, but in this party the successful rescue path is low resistance. Do not confuse the existence of several commands with an interesting choice: a free skill-gated best option, slower fallback, and predictably harmful option need understandable tradeoffs, state-dependent availability or costs. Nor should optional combat be forced into the rescue to make the engine appear consequential.

Engine limitations are distinct: nonspatial combat, undifferentiated escape, no combat environmental actions, and incomplete player memory contracts. Broad physical manipulation is not present merely because prose mentions a hoist or beam. Expand a few meaningful affordances with state and costs rather than adding an unrestricted verb box that cannot honor reasonable attempts.

## G. Implementation priorities

Do this in small, reviewable stages, preserving the current client while validating the player model. No rewrite is prerequisite.

| Order | Work | Layer / dependency | Completion criterion based on play |
|---|---|---|---|
| 1 | Separate inspection from commitment; consistent pointer/keyboard preview; rename Tactics; retain final NPC reply and combat aftermath; campaign-aware launch copy. | Quick controller/presentation fixes, plus campaign metadata. | A fresh player can inspect sentinel without attacking, explain a chosen move before committing, and read Wren's thanks even after departure. |
| 2 | Group combat events chronologically; remove invariant/filler prose and duplicate observations/acquisitions; make existing damage breakdown expandable. | Presentation using existing structured events. | Player accurately recounts Bran→Ash→Elen exchange, why resisting bleeding did not cancel bite damage, and current party condition without opening the full archive. |
| 3 | Correct fleeing-side outcome and define world consequences; settle down/dead and defeat semantics. | Engine/event model before definitive retreat/death prose. | Play player retreat, enemy flight, one fallen-and-revived ally, true party defeat and save/resume. Each reports the right actor and an explicit location/barrier/resulting state. |
| 4 | Unify known tasks, pressures, discoveries, relationships and resolved leads; restore immediate history from authoritative events. | Player-view contract + authored visibility/provenance + Notes presentation. | After Wren speaks, deadline appears correctly; after rescue, journal summarizes outcome; reload never falsely says nothing happened. |
| 5 | Expose condition effects/durations, guarding, cooldown/availability reasons and useful ability summaries; consolidate Party/Pack/recovery. | Projection first, concise authored/typed summaries second. | Player explains why attack is weak, how long blessing lasts, what Guard protects, and how to heal the right companion. No raw DSL required. |
| 6 | Reduce concurrent panes to one Adventure surface, compact party strip and contextual choice/response; maps on demand. | IA increment after contracts stabilize. | Same player completes settlement→rescue→fight→recovery→return without losing place, active task, or last consequence. Check narrow view separately. |
| 7 | Fix graph route aggregation, distinguish known/visited/traversed, label passage status and actual travel itineraries. | Chart projection and traversal/knowledge data. | Player predicts upper route versus culvert duration and closure, identifies a loop/crawl, and never mistakes endpoint visits for crossing a hazard. |
| 8 | Revise rescue temporal logic and state-conditioned topics; give service NPCs a few relevant responses; adapt inspector identity/abilities; locate loot physically. Add a modest continuing situation with a motivated lead and reaction. | Authoring/content, independent of visual polish. | Player can state why to return tomorrow; Wren/Pell/Hesta react consistently to rescue and violence; loot and enemies make sense in foundry fiction. |
| 9 | Reassess encounter design; add only mechanics justified by observed unmet intentions. | Content balance first; engine additions only with explicit semantics. | At least two defensible approaches have understandable different costs/consequences. If range/cover/retreat paths are desired, implement and play them before drawing them. |

Use another cold player after stages 1–4 and again after 6–8. Ask them to explain location, current intention, predicted risk, actual consequence, and remaining opportunity in their own words. Observe pauses, unintended commitments and reconstruction errors. Do not substitute command counts, valid receipts or a deterministic replay for those acceptance criteria.

Before a broader claim, play multi-enemy combat with target changes, a genuine full-party loss, offensive magic with saves/immunity, and a larger site with multiple levels. This review found enough concrete failure to set priorities; it does not certify those unplayed experiences.

### Source trail (inspected after blind play)

- [Controller](../../../web/mono-app.ts): `open`, `choose`, `run`, `record`, `tidy`, `restore`, load handler, auto action. Sole-command execution, reply loss, compression and dual-history behavior.
- [Screens](../../../web/mono-screens.ts) and [renderer](../../../web/mono-render.ts): hardcoded launch, formal-knowledge journal, reversed combat fragments, persistent pane responsibilities.
- [Action feedback](../../../src/presentation/action-feedback.ts): invariant sentence, learned-evidence fallback, duplicate observation composition, outcome phrasing.
- [Player view](../../../src/presentation/player-view.ts): formal `knows` facts, installation-only deadlines, objective projection, event/chronicle details and start-time versus completion-time displays.
- [Combat model](../../../src/ui/combat-model.ts), [types](../../../src/ui/screen-types.ts), [presenter](../../../src/ui/combat-presenter.ts): lossy statuses, missing guard/cooldown state, abbreviated modifiers, generic ending.
- [Battle](../../../src/battle.ts), [battle data](../../../src/model.ts), [targeting](../../../src/targeting.ts), [effects](../../../src/effects.ts), [ability resolution](../../../src/ability-use.ts): nonspatial targeting, owner-turn timers, damage order, optional attack rules and undifferentiated escape.
- [Choice grouping](../../../src/ui/choice-grouping.ts), [passages](../../../src/ui/passages.ts), [chart](../../../src/ui/chart-model.ts), [map renderer](../../../web/mono-map.ts): entity-to-command grouping, local action accessibility, room graph and area aggregation.
- [Reedwake site](../../../data/sites/reedwake/site.kyr), [rescue](../../../data/situations/caught-below/situation.kyr), [campaign](../../../data/campaigns/caught-below-reedwake.campaign.json): actual scenario boundaries and authored responses.
- [Abilities](../../../data/catalog/abilities.json), [conditions](../../../data/catalog/conditions.json), [species](../../../data/catalog/species.json), [tactics](../../../src/tactics.ts): effect strings, power/status definitions, hound flight fallback and funerary construct reuse.
