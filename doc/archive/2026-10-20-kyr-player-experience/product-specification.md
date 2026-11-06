# B. Kyr Product Specification

Recommended product behavior for review. **D** requirements below are intended behavior, not claims of implementation. **O/I** evidence and exact gaps are in [capabilities and authoring](capabilities-and-authoring.md). The [interface specification](interface-specification.md) fixes view/focus behavior; [combat model](combat-model.md) defines intended encounter rules.

## 1. Gameplay loops and their completion conditions

| Scale | Player decisions | Required information | Communication of progress / consequences | Current break and evidence |
|---|---|---|---|---|
| **Moment: form and resolve an intention** | What matters here? What do I want to attempt, with whom and how? | Place, perceptible situation, actual affordances, actor/target, time/cost, known danger and uncertainty. | Preview → explicit commit → causal event → relevant mechanical result → current state. Inspection does not spend time. | Entity clicks can pick locks, buy healing or attack (`C16`, `N36`, `C67`); useful consequences buried under fragments. |
| **Encounter: reach an outcome** | Fight, bargain, bypass, investigate, rescue, hold a route or withdraw? How should the party cooperate and respond? | Stakes, participants, approaches, constraints, changing threats, resources, exits and outcome conditions. | Situation changes, actor responses and outcome persist through transitions. Encounter can be resolved, deferred, abandoned or worsened. | Rescue works (`C25`, `N61`); combat excludes room/context; flight misattributed; bell retrieval has obscure handover (`N95–97`). |
| **Expedition: leave and return** | What to learn/buy/prepare? Which route and risk? Press on, recover locally or return? What and whom can we carry? | Known opportunities and routes, expected duration, load, condition, food/light/consumables, likely threats and safe refuges. | Preparation changes available approaches; local choices change resources and routes; return presents losses, gains and world changes. | Salve/rope/tribute and burned bridge demonstrate potential (`N09–27`, `N83–90`). Bodies/load, summary and objectives remain weak. |
| **Campaign: grow and choose again** | Which leads and obligations matter? How to develop companions? Whom to trust or oppose? What changed while away? | Remembered threads and sources, relationships/institutional standing, advancement choices, accessible sites, evolving situations. | Earned capabilities/equipment open options; old places respond; independent developments create new decisions. Active and resolved history remain meaningful. | XP/training exist in code; sustained progression not played. Current campaigns are small and journal gives no useful continuity (`N74`, `N94`). |

**PX01 — Complete loops.** A milestone passes only when the player can state an intention, pursue an approach, understand its result, return/recover or explicitly abandon the expedition, and choose a next priority. Completing a single engine action, retrieving loot or gaining XP is insufficient.

Meaningful choice needs distinguishable consequences, not a fixed number of buttons. Some skilled actions can be reliably better; a party that prepared well should benefit. Across an expedition, however, time, supplies, access, uncertainty and competing commitments should prevent one free universal solution. Do not turn every ladder into a die roll or every conversation into a persuasion contest.

## 2. Player-facing world model

**PX02 — Authority and knowledge.** Authoritative state answers what exists and has happened. Party knowledge answers what the company perceived, was told, established or last saw. The interface reads a bounded projection; it does not inspect hidden relations to produce helpful fiction. NPC beliefs are also bounded where their decisions depend on knowledge. Current global planner access is not a product promise of omniscient inhabitants.

| Concept | Immediately visible | Inspection / deliberate investigation | Notes and maps | Deliberately unknown |
|---|---|---|---|---|
| Region/travel | Current region/place, visible departure ways, daylight/weather if known. | Route description, endpoints, duration estimate/range and basis, terrain, known closures, requirements, party pace/load. | Known connections and itineraries; last observed conditions; source of reported routes. | Unvisited threats, exact encounters, unexplored terrain, current remote state without report. |
| Site/topology | Site identity, current room and entry, obvious exits/vertical transitions. | Named passage, obstacle, visible far end; learned routes, direction where authored. | Stable site graph, level grouping, visited/known-unvisited/uncertain edges and actual traversals. | Hidden passages until discovered; exact remote inhabitants. Node layout is not a distance scale. |
| Room/features | Short spatial paragraph, salient people/objects, immediate danger. | Physical properties and states, useful approaches; search/examine action can consume time and reveal facts. | Consequential changes and discovered affordances, not every decorative noun. | Object contents/hidden features before inspection/search; unsupported geometry. |
| People/creatures | Identity or observable description, current visible activity and condition. | Known role, conversation, trade, requests, threats and supported social/physical approaches. | Encounters, witnessed reactions, reports, promises and last-known whereabouts. | Internal plan, allegiance, motive, inventories and exact defenses unless established. |
| Institutions | Signs, representatives, observable authority/practice. | Relevant permissions, services, membership, obligations and known attitudes. | Named relationships, commitments, disputes, access granted/refused and reasons known. | Numerical hidden trust, membership or holdings not learned, institutional omniscience. |
| Situations | Immediate local problem, known urgent threat; accepted commitments distinguished from opportunities. | Stakeholders, reported claims, choices, known deadline estimates and conditions. | Source-linked threads: rumored, investigated, committed, advanced, resolved, failed, expired or stale. | Unseen developments and future branch outcomes. No automatic global quest assignment. |
| Party | Names, urgent condition, current active actor when relevant, actionable warnings. | Roles, abilities, proficiency/provider, attributes, conditions/clocks, advancement and current equipment. | Companion history and consequential injuries/deeds; chosen development. | No hidden player-character rules; unknown magical item properties remain unknown. |
| Inventory/resources | Shared purse and urgent supply/load shortfall when relevant. | Owner, ready/stowed/equipped state, uses, quantity, slots/bulk, requirements, comparisons and transfer cost. | Important finds and losses; locations of caches/abandoned gear. | Unidentified enchantments; remote container inventory not freshly known. |
| Time/recovery | World day/time, explicit imminent known pressure, current action/encounter clock. | Wait/rest/travel duration, expected recovery, costs, interruptions and expiry boundaries. | Completed events with timestamps, public deadlines and their provenance. | Offscreen events unless a rule permits inference or a report reaches the party. |
| Discovery/history | Newly perceived event and salient result. | Exact evidence/source, claim versus established fact, earlier dialogue/results. | Durable, concise memory with links to raw detail and uncertainty. | Author truth of unverified rumors, exact future AI decisions not committed/observable. |

A player may reasonably infer that an estimated deadline has passed; label it “Wren expected closure by now; not checked,” rather than assert a live remote closure. Observing the snow-blocked lane updates that note to an established last-seen fact (`N75`).

**PX03 — Physical consistency.** Places, passages and object states must agree with the available actions. A guarded way identifies its visible obstruction and an actual way to approach it, or clearly states the guard is beyond present interaction. A bell carried to its owner is a candidate handover; it must not require discovering a hidden drop-on-ground predicate. An opened door, ruined bridge or secured ladder updates description, map and actions from the same state.

Scenery can remain scenery; universal object simulation is not required. Descriptions must not imply a usable upstairs, winch, cover position or movable beam where no supported interaction exists. A neutral “look” can describe scenery without promising an operation. Authors decide meaningful physical interventions and their consequences; the client does not invent them.

## 3. Interaction grammar and agency

**PX04 — Stable intention boundary.** The grammar has five operations, but not five mandatory clicks:

| Operation | Meaning | Time / consequence | Required behavior |
|---|---|---|---|
| Inspect | Read currently available description/state of noun, route, person, item, ability or note. | None. | Same for pointer, keyboard and touch. Opening a row never executes its only command. |
| Select | Set intended method, actor/provider and target. | None. | Preselect sole eligible target visibly; never auto-commit from target count. Selection persists until changed/cancelled/stale. |
| Preview | Explain complete pending intention. | None. | Show verb, actor/group, target, duration/cost, relevant effects, enabling capability, known risk and uncertainty. Present inline; no permanent empty pane. |
| Commit | Resolve that named intention against authoritative state. | Declared time/resources/rules. | Explicit verb-labelled control. A fully specified “Walk to the shoulder — 10m” control is already a preview and can commit in one activation. |
| Consequence | Deliver event, numerical effects and updated perceived state. | Resolution already committed. | Preserve result through NPC departure, view changes and next turn. No duplicate current-state paragraph as another event. |

Selection of an object may reveal its verbs and default method preview at once. A complete contextual verb can be chosen and committed without a second confirmation if its target/cost/risk is already visible. Dangerous initiation and irreversible advancement/abandonment show the full preview before commit. Do not add a modal for every pickup to compensate for ambiguous nouns.

Actor/provider is explicit when rules bind an individual. A group action says “company, using Bran's mining capability” only if provider attribution is recorded. Do not infer that Bran performed a motion merely because he holds the tool. A provider being down or absent must remove that capability truthfully; the pending preview explains why it changed.

On commit, revalidate the exact intention. If it is no longer valid, show the changed reason and let the player revise; never substitute another command or charge for stale selection. During resolution show pending state, suppress duplicate commits and serialize world changes. Rollbacks/errors must not masquerade as fictional failure or leave partially committed harm.

Search/read/investigate is distinct from opening an inspection view. A formal ten-minute reading/search action can reveal new knowledge; inspecting a known board title cannot silently perform it. Unavailability reasons may disclose only known prerequisites; do not show a secret key's identity or undiscovered spell solution.

## 4. Party, equipment and advancement

**PX05 — A small company with complementary ways to act.** Three active companions. Creation offers role-readable presets and customization; each companion has a calling, background, ancestry, starting kit and concise examples of likely expedition/combat use. Valid combinations are constrained before launch. A player can see important starting condition and capabilities before confirming; the seed is an optional world setup detail, not the primary game concept.

Combat and exploration differentiation should cross class lines: a hunter can approach wildlife; a locksmith can be a mage; a miner can be a fighter; gear can supply a fallback. No required composition or guaranteed universal tool kit. Avoid a useless baseline action for a companion whose primary combat attribute differs: catalog designs need a viable ordinary action and a useful non-damage choice, without removing scarce spells and special techniques.

**PX06 — Equipment is preparation with physical consequences.** Inventory records owner and location; equipped/ready/stowed are explicit states. One item instance has one authority; views project it. Preview equip/swap/transfer/use with time/action cost, requirements and changed abilities/defenses. Compare relevant effects, not an unexplained “power score.” Buying uses the shared company purse unless clearly labelled otherwise. Personal money only appears if its spending/ownership is meaningful.

Use a bounded bulk/load model rather than per-object physics. Ordinary kit, bulky treasure and incapacitated people have declared carrying requirements. Baseline casualty rule: one mobile companion can carry one incapacitated companion; doing so occupies their hands, prevents using a two-hand item and slows travel according to declared route/pace rules. The party cannot silently move two fallen members with one survivor. Recovery preview requires choosing whom/what to carry, cache or leave; left entities remain at real locations. Exact equipment bulk/capacity and travel multipliers belong in reviewed rules/catalog tables, not CSS or narration.

**PX07 — Advancement expands decisions.** Award enduring achievement/progression for authored exploration, recovery, social outcomes and encounters, not only kills. Rewards identify once-only causes; incapacitated participating companions are not excluded merely because they were down at the ending. Experience thresholds and level gains are class/catalog definitions. Safe preparation points expose available advancement; show the before/after capability, choice constraints and any time/teacher/gold requirement before applying.

Training can teach a specific technique or grant access through a mentor. Do not silently equate XP spending with level advancement: current twenty-XP training is a partial mechanism, not a complete progression design. Recommended product separates earned level progress from technique training costs so progress does not appear to go backward. Final curves, first two levels' gains and spell availability must be designed and reviewed before builders implement advancement math. Respecialization and large reserve rosters are later decisions; replacing losses/recruitment is needed for continuing campaigns but not for the first expedition prototype.

## 5. Time, travel, rest and persistence

**PX08 — Time passes through intentions.** Single-player world is paused while reading/inspecting/planning or closed. Commit movement, wait, rest, search, treatment, training or encounter actions to advance one shared world clock. Actors' travel and services use declared durations; NPCs do not teleport through a thirty-minute route because a player did a ten-minute action. A scheduler may optimize updates, but equal elapsed time and action order must produce equal world outcomes.

Desired combat uses a six-second round shared with the world clock (see combat spec). Existing ten-minute campaign ticks and per-encounter campaign cost are legacy implementation boundaries, not the desired clock. World-time, owner-turn, encounter and until-removed effects are distinct and displayed in those units. “Ten combat turns of the wearer” cannot be narrated as two hours. Expiry boundaries must be explicit, including how owner-turn effects persist outside encounters.

Travel preview shows itinerary, route alternatives, expected duration, known barriers, load/party pace, supplies due during it and knowledge age. Commit one leg or an explicit multi-leg journey. At an authored interruption/changed requirement, stop at the corresponding place/time, explain and ask a new intention; no free onward movement through a changed closed bridge. Returning along a known safe route can be summarized without deleting its clock or events.

Rest preview states shelter safety/uncertainty, duration, food/coin, recoverable conditions, who benefits and who does not. Do not sell healing as a sole auto-action on a healthy party. Long rest advances other actors and situations. Interruptions distinguish paid/spent costs from completed recovery and explain the actual event. No speculative random interruption unless the rules generate one.

**PX09 — One saveable world and history.** Save/load preserves party/gear, world locations and changes, clocks, actor activity, scenario state, RNG state or equivalent reproducible resolution, pending long actions, known facts and source-linked event history. Explicit saves may branch a single-player history. Loading does not advance offline time or rewrite past dialogue with current names/values.

Safe snapshots at committed action boundaries are required first. Saving mid-combat is required for the full product once encounters have persistent turns/positions/intents; if a first milestone cannot save during a resolution, clearly label that constraint and preserve the latest safe state. On resume show location, party condition, last significant result and unfinished priorities. “Nothing happened” is never a substitute for missing UI cache.

## 6. Narration, mechanics and adventure memory

**PX10 — Five responsibilities, no prose guessing.**

| Layer | Responsible source | Presentation rule |
|---|---|---|
| Authored scene | Current perceptible observations and state variants. | Concise place/layout/people; urgent change if present; stable context before requirements. Refresh truthfully without repeating every paragraph after each action. |
| Event narration | Authored reply/result or typed, perceived event. | Actor → concrete occurrence → consequence, usually 1–2 sentences; keep causal sequence and exact speech. Preserve events independently of current speaker presence. |
| Mechanical resolution | Structured action/effect result and actual before/after. | Show useful amounts, costs, saves and conditions attached to the event. Expand exact arithmetic/source/clock when asked. Do not call capped HP loss the full damage without explaining it. |
| Persistent state | Authoritative current state filtered for player knowledge. | Bars/counts/status/access/locations update once; routine persistence is displayed, not narrated as a guarantee. |
| Adventure memory | Perceived/heard/learned events with source/time and thread associations. | Brief active/resolved/last-known summaries; preserve evidence and uncertainty. Not a second authority or a dump of world relations. |

**PX11 — Structured result contract.** Logical requirements, not a prescribed wire protocol:

```text
Action identity + original intention + bound actor/provider/targets
Begin/end world time + action/round sequence + disposition
Authored response/speech: speaker, text or event-time-stable reference
Effects: stable IDs + parent action/effect + source + target + visibility
  actual roll, evaluated expression, all modifiers in evaluation order
  save: what effect it controls; result, total and full components
  damage: resolved harm, mitigation, HP lost, remaining HP, overkill if relevant
  condition: definition, source, clock, remaining duration/expiry boundary
World changes: entity/property/old/new + cause + knowledge exposure
Encounter ending: winner/fleeing side, reason, disposition, destination/left entities
Perceived world/NPC events in order; evidence-backed note/thread updates
```

Most current combat data can be projected rather than replaced. Missing grouping/identity, fleeing side, known-world semantics and event-time facts require contract work. Retain typed data until presentation; do not flatten strings and recover meaning with regex/keywords. An automated language renderer may shorten structured text, but it cannot decide new fictional facts, rules or player knowledge.

### Feedback for each action category

| Category | Immediate feedback | State / memory |
|---|---|---|
| Movement | Destination and entry, new local situation, any actual transit event. | Clock/supplies/party location, traversed passage and known map. Do not replay full departure dialogue. |
| Inspect | Known perceptible description; explicit search/read verbs if further investigation possible. | No time/state changes from opening details. Time-consuming investigation produces separate discovery event/source. |
| Conversation/social | Selected player topic/offer → exact reply → following action such as coins/departure. | Commitments only on explicit acceptance; important reports/relationship changes source-linked. |
| Skill/mechanism | Chosen method and bound provider if known → physical change or contextual reason it failed. | Time/tool costs, state of obstruction, new/revoked approaches; relevant notes. |
| Combat | One action group: intent/action → hit/save where actually rolled → damage/condition → visible response. | Current turn queue/conditions and retained final aftermath. No reverse fragment sequence. |
| Item/equipment | Who uses/equips/transfers what, target and actual effect. | Quantity/ownership/equipment/abilities and clocks. One acquisition sentence, not a duplicate “gains 1 a…” line. |
| World change | Observable event now; or a later report identifying source. | Update known place/thread with observed time. Hidden offscreen change does not generate omniscient notes. |

### Actual before/after examples

Proposed text below only uses represented facts. Where actor/motion is not known, keep group/state wording.

- `C61`: “Your company prevails. Survivors retain their injuries and spent resources.” → **“Ash falls. The hoist passage is clear.”** Attach final Elen HP, Dori mana and actual XP once; Hesta's refusal follows as its own authored response. The cleared passage clause requires an actual state change.
- `C11`: “You examine the evidence and record what it establishes.” → **“The survey board marks a tram crawl from Dry stores to the Hoist room.”** Note the source and discovered connection; omit generic bookkeeping.
- `C35`: coin delta and NPC departure conceal Wren's authored thanks → show Wren's actual thank-you and six-coin handover, then their departure. Keep reply in history after speaker leaves.
- `N36`: clicking Cate spends two coins on unwanted healing → inspection shows service, cost, duration and **“No current wounds would benefit.”** Commit remains a deliberate labelled purchase if allowed. The UI need not narrate cleaning wounds that do not exist.
- `N46`: `constitution save (3 + -1 = 3 against 16)` → **“Dori fails the save against the breath.”** Detail includes die, attribute, level and other actual components. Show breath harm after resistance separately from six HP actually lost; do not invent weak flames because HP was low.
- `N81`: sleep cast disappears into defeat summary → **“Elen casts Binding sleep. Calder resists it.”** Show 3 mana, Wisdom save 13 against 13 in detail; then bite/hit/fall in causal order; retain the encounter's final result.
- `N83`: burned bridge appears alongside duplicate state and event → keep authored flame/bridge-collapse event once, then blocked crossing and known alternate route in state/map. No assertion that the player escaped across that bridge.
- `N73`: preserve Marrit's exact reproach and three coins. Notes: **“Tamsin returned independently; Marrit gave three coins and said we should have escorted them.”** Do not turn it into an invented numeric reputation penalty.

Prose standards: concrete subjects/verbs, specific observable changes, short clauses, no implementation terms, no redundant temporal assurances. Avoid “the action resolved,” “wounds persist,” generic atmosphere after every command, invented emotional states, or precision the characters cannot know. Keep good authored physical prose and dialogue; not every mechanical event needs a new sentence of fiction.

## 7. Continuity and responsiveness

**PX12 — Opportunities are not all quests.** Surface an opportunity when a person speaks, a source reveals it, a place invites investigation or a consequence reaches the company. Notes can retain it without acceptance. An explicit promise records parties, terms, deadline estimate, consideration, fulfillment condition, source and known consequences. Player can decline, defer or revise priorities; pinning a note does not create a contract.

Situation memory has lifecycle and evidence. A completed rescue remains resolved with who was freed/how/where last seen and what was given. An abandoned rescue remains unresolved with last-known condition. A rumor may conflict with another report. New evidence updates a summary without deleting its history. A deadline that passes unseen becomes uncertain/stale unless its outcome is known.

**PX13 — People and places react through authored causes.** NPCs pursue declared goals, perform actions taking time, and learn what they can perceive or are told. Institutions act through members, resources, permissions and obligations. A witnessed attack may close services; restoring a bell may change a representative's dialogue, use of the bell and public scene. Every change needs a cause and owner. No universal sentiment meter stands in for these relationships.

Return view emphasizes meaningful changes since last observed: open store, repaired ladder, absent resident, rebuilt/burned crossing, changed service. Revisit does not replay old introductory narration as current fact. If nothing significant is known to have changed, orient briefly and offer current choices; do not fabricate bustle or a new quest.

Situations may develop without the player: snow blocks a way, a dragon hunts, someone returns home, rivals move goods. Larger product needs competing situations and institutions, not merely timed closure. Offscreen change can reach the player through observation, credible reports or visible evidence; the game keeps authoritative state independently of whether a note was written.

**PX14 — Continuing campaign.** After an immediate objective: present actual aftermath, unresolved interests and known openings, party needs and available development. Do not force a “next quest.” The player may rest, train, revisit, investigate a rumor or depart. A campaign milestone requires a second expedition whose options differ because of prior knowledge, equipment, development or relationships, while at least one independent situation has advanced. This is currently missing content as well as presentation; a smarter Journal cannot supply it alone.
