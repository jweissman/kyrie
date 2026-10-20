# Combat investigation and improvement roadmap

Companion to [failure model and contracts](investigation.md) and [presentation concepts](presentation-concepts.md). No mechanics or frontend changes implemented. Findings combine the original play, read-only analysis of its saved events, and current code inspection. Proposed outcomes have not been played or balanced.

## 1. What the current fight actually does

### Recorded sentinel exchange

From the downloaded [end-of-blind checkpoint](evidence/end-blind.save.json), encounter action `attack(party,world__sentinel,world__boiler)`. Names and values are reconstructed directly from its saved creatures/events. “Roll” below is the resolved ability expression before separate power/resistance/armor/Guard, not necessarily an unmodified die face.

| Turn | Actor / action | Consequence |
|---|---|---|
| 1 | Sentinel: Bronze sweep | Bran -1 HP, Dori -1 HP; Elen saves and avoids damage. |
| 2 | Bran: Wounding blow | Sentinel takes 1 from roll 3 after 35% resistance; weakened (-1 power). |
| 3 | Elen: Backstab | Sentinel takes 3 from roll 6 after resistance. |
| 4 | Dori: Bless company | Party gains +2 power; Dori spends last 2 mana. |
| 5 | Sentinel: Burial chain → Elen | Roll 1 with -1 power yields 0 damage. Elen fails save against weakening. |
| 6 | Bran: Sweeping blow | Roll 3 +2 power, resistance → 3 damage. |
| 7 | Elen: Weapon attack | Rolled expression 0, net +1 power (blessed and weakened), resistance/floor → 0. |
| 8 | Dori: Weapon attack | Roll 5 +2 power, resistance → 4. |
| 9 | Sentinel: Guard | Halves damage until its next turn; not exposed next to its HP in current UI. |
| 10 | Bran: Weapon attack | Roll 8 +2 power, resistance then Guard → 3. |
| 11 | Elen: Guard | Protects herself; no enemy attack occurs before her next turn, so it provides no damage reduction in this sequence. |
| 12 | Dori: Weapon attack | Roll 2 +2 power, resistance then Guard → 1. |
| 13 | Sentinel: Burial chain → Bran | Roll 1, weakened already expired → 1 damage; Bran saves against weakening. |
| 14 | Bran: Weapon attack | Roll 5, blessing expired, resistance → 3. |
| 15 | Elen: Weapon attack | Roll 4, statuses expired, resistance → 2; sentinel falls. |

**15 actions: 11 party actions, four enemy actions.** Nine party damage actions, one party buff, one party Guard. Sentinel has 20 HP; party suffers **3 total HP damage**: Bran 2, Dori 1, Elen 0. The fight starts with reduced healing resources, but is not demonstrated to be difficult. It feels tedious because most decisions neither respond to a readable imminent threat nor change the kind of problem being solved. A larger health bar or more attacks would probably lengthen it.

One important temporal issue is visible here: the sentinel acts before Bran, Elen and Dori each cycle. Elen's turn 11 Guard expires at her turn 15, but the only intervening enemy action targets Bran. Guard is therefore useful only if the player can judge timing and likely target. Current presentation hides the queue and current guarding; it also provides no committed target/intention to support that judgment.

### Damage compression and uneven roles

Current formula for these damage effects:

```text
damage = max(0, floor(max(0, resolved roll + power)
                      × (1 − resistance)) − armor)
actual damage = guarding ? floor(damage / 2) : damage
```

Examples above have zero armor. Each ability may have its own expression and damage policy. The formula should be exposed in details with actual values, not printed as scene prose.

The saved party has Elen STR 5/DEX 11, Bran STR 17, Dori STR 13. Kyr's attribute modifier is `round((score−10)/3)`. Consequently, Elen's standard weapon attack is `max(0,1d6−2)`. Against 35% physical resistance without buffs/armor/Guard, its mean is **2/3 HP**, with three of six die results doing zero after flooring. Her Backstab has mean **2.6875 HP** against the same resistance, but goes on cooldown. These are exact small-dice enumerations, not another battle simulation.

| Ability / actor | Mean resolved expression | Mean after 35% resistance only |
|---|---:|---:|
| Elen weapon attack | 1.667 | 0.667 |
| Elen Backstab | 5.000 | 2.6875 |
| Bran weapon attack | 5.500 | 3.000 |
| Bran Sweeping blow, one target | 4.500 | 2.250 |

The encounter rewards Elen's DEX-based ability, then leaves her weak standard attack during recharge. There is no baseline dexterity weapon attack or non-damage utility task for her here. Her useful exploration identity (hunter) does not automatically supply a satisfying combat role. Dori can buff or heal but has only two mana left; after blessing, her decisions collapse mostly to attacks. Bran's main choice is damage versus weakening, with recovery if needed. That is a limited but real rules space; the UI currently fails to explain it.

### Why the AI produces a cycle rather than intention

[Tactics](../../../src/tactics.ts) ranks each legal command using effect categories. It rewards damage, low-HP targets, area scope, selected ability IDs, healing need and new conditions. It does not calculate the actual expected roll/damage, current Guard, cooldown planning, encounter objective, or a coherent role plan. It consults species resistance for its estimate rather than the full current effective-defense context.

- Area damage gets `10 + 5 × living enemies`, even with one enemy. Standard damage gets 10. Bran's Sweeping blow therefore outranks ordinary attack despite lower expected damage against one target (when other scoring factors are equal). “Tactics” is a heuristic choice, not tactical advice.
- Low-HP targeting encourages repeated attacks against fragile Elen. There is no formation or ally interception to respond with. The game must not imply Bran can stand between her and Ash.
- Sentinel has sweep, chain and Guard. Cooldowns eliminate attacks from its legal set; Guard fills the gap. Availability drives the apparent pattern rather than an authored inspection/defense behavior.
- Ash has bite and flee. When bite is unavailable, flee can be the only remaining command. This explains the directed probe's retreat without fear, damage threshold or a change in guard duty. Narrating panic would invent motivation.

Improving the heuristic is an engine/controller change; explaining what it actually selected is presentation. Neither requires a grid.

## 2. Capability boundaries and smallest remedies

| Concern | Current implementation | Presentation / information fix | Requires new mechanics or authoring |
|---|---|---|---|
| Initiation | Campaign attack resolves encounter; entity row may auto-commit; NPC enemy controller runs before next player prompt. | Explicit Attack preview/commit; opening action in causal order; preserve place and stakes. | Authored hostile trigger or escalation needs actual conditions; do not add invisible proximity aggro. |
| Position / reach | Team/alive targeting; no combat coordinates, distances, cover, facing or movement. | State abstract engagement; only legal targets, no range claims. | Any zones, reach, interception or movement must change targeting/rules before visualization. |
| Selection | Abilities and eligible targets derive from `legalCommands`; single-target shortcuts auto-execute. | Stable selection/preview for any target count; reasoned unavailability. | Meaningful eligibility rules beyond team/alive need actual rules. |
| Party roles | Attributes, abilities, items, conditions, speed. No front line, protect, facing or formation. | Explain relevant strengths and currently useful choices. Separate role promise from current ability. | New DEX-based baseline attack or ally protection is a genuine rules addition. Class names alone cannot grant them. |
| Environment | Passage steam can be crossed/turned off in campaign. Combat uses creature commands; post-combat elemental exposure can trigger authored world effects elsewhere. | Preserve room context; explain that operating valve is outside this combat action set. | Mid-combat valve, steam aiming, cover, damaging terrain or winch operations need encounter targets/actions, costs, timing and consequence integration. Post-combat exposure is not an environmental action system. |
| Enemy behavior | Heuristic legal-command ranking; fixed-speed queue. | Show last action and known properties; show queue. | Future committed intention/target or authored phases require state, interruption and timing rules. Do not label AI guesses as a telegraph. |
| Feedback | Action/save/damage/condition events exist; fragments flattened, reversed, summarized. | Group cause→effect, show full calculation on demand, preserve final state. | Explicit effect IDs and parent links for robust multi-effect attribution; correct encounter-ending identity. |
| Retreat | `Flee` ends encounter `escaped`; no route movement. | Say disengage and state current location/remaining barrier, pending semantics decision. | To promise physical escape: fleeing side, usable passage, destination/time, escort/downed handling, pursuit policy and guard change. |
| Victory / defeat | Elimination of living team ends fight; fallen allies revivable in combat. No-survivor screen. | Retained aftermath and unambiguous incapacitation terminology. | Decide actual death boundary and defeat policy before inventing capture/rescue or safe revival. A genuine defeat remains unplayed in this review. |

**Correctness repairs first:** identify fleeing actor/team and resolve its world effects; make Hesta's witness condition match her warning; preserve event attribution and replies; settle what zero HP means across battle and aftermath. A log fix must not conceal an incoherent world transition.

## 3. A more interesting sentinel encounter using current capabilities

The current sentinel does not guard a necessary route or the sword by rule. The blade can be taken without defeating it; steam can be bypassed via pipe walk or shut using the bar. **Do not sell this encounter as an unavoidable guardian battle.** That would contradict the world.

### First revision: a useful optional expedition encounter

Use the present affordances as an intelligible preparation decision:

1. Hesta gives a concrete, state-aware lead to the blade and a warning about the inspector; if Pell is already safe, she acknowledges that rather than asking about a missing person. Adapt funerary naming/chain fiction to foundry context. These are authoring changes, not new tactical rules.
2. Room description locates blade, valve, open ways and inspector without making a false proximity/guard claim. Expose the choice to leave it alone.
3. Let the player inspect and take/equip the blade before choosing a fight. This already has engine support: the item grants a typed piercing/fire strike with an attack roll. It offers preparation against physical resistance, not a new elemental puzzle invented by UI. Taking/equipping costs and eligibility come from current commands. No free equipment change during combat is assumed.
4. Keep valve operation as expedition preparation/route improvement. Do not suggest it disables, powers down or burns the sentinel; no such causal link exists.
5. If the player fights, show its opening sweep, resistance, current Guard, condition clocks and available player responses. Show the choice between spending scarce healing/buff resources, using the blade, ordinary attacks and disengagement. Retain the aftermath and opportunity to leave the site.

This makes the **encounter as part of exploration** more interesting without pretending that its existing slugfest is deep. Taking the blade and leaving is a valid success if that is the player's purpose. Defeating the sentinel currently gives no authored encounter-XP reward in this site; do not invent one in a mockup. If an author wants a reason to destroy it, add an explicit motivated request and supported consequence rather than implying all visible monsters are objectives.

### Content-only combat revision to test, not claim as already supported behavior

Using existing typed effects, damage/save system, cooldowns and content definitions, make a short sentinel-specific ability set rather than borrowed funerary attacks. Retain recognizable sweep/chain/guard functions; adjust cooldown and damage only after an explained-rules playtest. Give the inspector an authored purpose and revise its descriptions accordingly. An idle/basic strike for Ash would remove forced flight on cooldown using an already supported damage ability; prefer that to making the AI invent fear.

Do not just increase HP or every damage value. Proposed balance goals are decision-based: at least one useful alternative to ordinary attack for each companion over two cycles; a reason to preserve or spend the last mana; understandable value from debuff or mitigation. Test low-STR Elen's downtime explicitly. A content definition for a modest DEX-based ordinary attack uses existing effect machinery but **adds a player capability**; treat it as a rules/balance decision, not a label change. Preserve distinctions between direct damage and attack-roll weapon techniques.

This revision still lacks response to a known future threat. State that limit. Existing ability authoring can supply different numbers and effects; it cannot supply a committed telegraph, new objectives such as disarming an encounter target, or environmental interactions without integration.

## 4. Smallest additional tactical mechanics worth considering

Do not bundle all of these into an implementation. Test the baseline first, then introduce the smallest pair that gives a new understandable decision.

### Recommended first pair: committed enemy intent + protect one ally

**A. Committed enemy intent.** After an enemy's turn, commit its next action and target policy for its next turn. Show that commitment through authored behavior and a precise mechanical preview. The target policy is fixed enough that responding makes sense; do not secretly retarget after the party reacts. Specify cancellation/reselection when a target falls, conditions prevent acting, or resources change; log any changed intent. The opening action requires a fair entry trigger/preview or an explicitly immediate ambush. Showing current turn order needs no new mechanic; committing future behavior does.

This makes existing self-Guard a timing choice against a known sweep or chain. A visible “winding up” sentence without a stored commitment is misleading decoration. Avoid an extra free enemy preparation turn unless deliberately chosen as a balance rule.

**B. Protect one ally.** Spend the acting companion's turn protecting a named ally against the next eligible single-target physical strike before the protector's next turn. Redirect that strike to the protector, then consume protection; no damage reduction is invented, so it trades a turn and who takes harm. One protector per target, no redirection chains, no area-attack interception, no stacking with a second protector; incapacitation cancels it. Resolve against the receiving actor's actual defenses. This is abstract protection, not claiming a grid position. Exact interaction with Guard/conditions and actor turn boundaries must be reviewed and tested.

Together these support a concrete decision: sentinel commits a chain against frail Elen; Bran can trade damage output to protect her, Elen can guard, or the party can risk it and press the attack. Existing heal/bless/debuff now interact with an understandable threat. They do not require range bands or detailed movement.

### Required world mechanic independent of tactical depth

**Attributable disengagement with defined location outcome.** First repair encounter ending identity. Then decide whether “disengage” stays in the room or physical “retreat” travels via an available passage. For the latter, store destination and party/escort policy and apply a single world transition with time/risk. An enemy withdrawing from guard duty needs an explicit state/location outcome. Do not grant victory rewards or unlock routes just from the word `escaped`.

### Defer environmental actions and spatial combat

A single authored combat mechanism could be tested later: a valve as a legal encounter target whose operation consumes a turn and causes explicitly defined effects. It would need shared world/encounter authority, cancellation, post-combat consistency, targeting and visibility. It is larger than changing a button. Do not add it alongside intent/protect in the first study, or a positive result will not identify what helped.

Range bands, zones, front-line slots, cover and reach can all create decisions, but each changes ability targeting and encounter authoring broadly. Current problems do not establish that these are necessary. Solve a demonstrable recurring need before committing to that model.

## 5. Concrete roadmap and review gates

No stage below has been implemented as part of this investigation. “Immediate” denotes priority and bounded scope, not permission to start an interface rewrite.

| Stage | Changes | Owner / dependencies | Evidence of completion |
|---|---|---|---|
| **0. Truth and agency repairs** | Safe entity/ability inspection; explicit verb commit; rename delegation; preserve Wren reply; fix fleeing side and reported location/barrier; accurate imported history. Remove duplicated/invariant narration. | Controller/presenter plus narrow ending/event semantics. Existing client retained. | Manual pointer/keyboard pass through stores, sentinel inspection, Wren's departure, both sides' retreat and reload; targeted regression checks for these outcomes. Valid receipt alone does not pass. |
| **1. Player information contract** | Action groups, per-effect attribution, actor/provider, known-world visibility, actual condition/cooldown/guard information, stable event-time reply, coherent task/deadline/relationship notes. | Projection/event changes; no new simulation for already available fields. | Player correctly predicts intention/cost and reconstructs a bite's damage vs bleeding save, sentinel resistance vs Guard, and final party state. Known pressure appears after Wren speaks. |
| **2. Authoring corrections** | Timeline wording; carried-tool/topic reactivity; Hesta rescue/refusal logic; clear item placement; adapt sentinel identity; remove false actionable scenery promises; authored continuation or explicit adventure completion. | Content modules and limited witness semantics. | NPC responses agree with observed rescue/harm; player can name why to continue or that this adventure has ended. No fabricated procedural hooks. |
| **3. Map semantics** | Preserve distinct passages and full itinerary costs; distinguish known/visited/traversed/stale; clarify current place and blocked approaches; text status alongside colour. | Chart/knowledge/traversal model. No measured room map. | Player chooses upper route versus culvert using correct totals and deadline; never mistakes a visited endpoint for a traversed hazard. |
| **4. Presentation experiment** | Compare three paper concepts, then replay recorded event groups through chosen book-led hierarchy; test the map access and battle spread. | Design artifacts and user review first; isolated prototype only if approved. | Pass the explicit tasks below before choosing a production layout. |
| **5. Current-rule encounter revision** | Present/equip existing blade, purposeful optional inspector, useful actor-specific summaries, targeted ability/balance and AI selection improvements. | Content/controller; unchanged nonspatial combat semantics unless a rule change is approved. | Readable fights have distinguishable choices; benchmark fragile-actor downtime and why an action is chosen. Avoid arbitrary target-number or HP inflation. |
| **6. Minimal tactical extension, conditional** | Committed intent then protect ally; world retreat policy separately. | Engine/event contracts and balance review. | New choices change a player's plan for a reason they can explain. Test cancellations, actor falls, saves, party defeat, enemy flight and persistence. |
| **7. Production implementation decision** | Select final hierarchy and migration scope from experiment results. | Explicit review of findings, prototype evidence and costs. | A small validated interaction model, not a mandate to rebuild every existing screen. |

Correctness work should have focused tests where events/state can regress. Presentation/content proposals need exploratory human play; a replay of the expected button sequence cannot validate comprehension. No broad test suite was run for this documentation-only follow-up.

## 6. Small experiment before any full rewrite

### Phase A — compare paper concepts without changing the game

Prepare the nine wireframes in [presentation concepts](presentation-concepts.md), identical scene facts, action descriptions and outcome cards. Do not make one option artificially more informative. Use three to five fresh participants if available; this is a formative sample, not statistical proof. Counterbalance concept order, and show static views for later concepts before revealing outcomes so prior story learning does not masquerade as better design.

Ask each participant to identify where they are, inspect without committing, select a rescue method, explain the costs and known risks, interpret the outcome, choose an Ash approach, and explain a sentinel exchange. Record unintended commitments, incorrect causal explanations, information searches and moderator intervention. Don't ask which looks prettiest as the primary question. Test return/reload notes by asking what changed and what remains, without replaying all events.

### Phase B — only after review: an isolated event-backed experiment

Proposed scope: three scenes (Hoist room, Casting gallery, valve chamber), compact Party, one foundry graph, and one Notes thread. Feed unchanged recorded events/snapshots to the candidate presentation, with explicit branches supported by real resolutions. Do not hand-author false consequences for convenience. No new art, classes, campaign, backend, tactical map or generic verb parser. Do not replace Mono; keep the experiment separable.

Validate the **presentation contract** first using recorded outcomes: Wren reward despite departure, Hesta refusal, guard/resistance arithmetic, final party state, and resumed notes. This is a renderer experiment, not a play/balance claim. If participants must be free to pick unrecorded actions, add a thin adapter to the existing session only after approval; never silently switch from real resolution to invented outcome cards.

Suggested acceptance gates (design targets, not measured results):

- Zero unintended world-changing actions in the defined inspection/selection tasks.
- At least four of five participants, if five are recruited, can independently state location, task and known deadline and distinguish a known-unvisited place from an unknown one. For a smaller sample, report individual outcomes rather than percentages.
- The same participants can explain that the bite's save prevents bleeding, not damage; identify who fled; distinguish resistance from Guard; and identify the next actor without moderator teaching.
- After the reward and reload, participants can recount Pell's rescue, Wren's six coins, Hesta's refusal when applicable, and the last-known culvert/arch state from Notes.
- Participants can find a valid alternative route without being shown the graph by the moderator. If book-led navigation fails this, trial a compact site graph in expedition scenes before adding any other panel.
- Document why actions were chosen and turns felt repetitive. Faster clicking and fewer controls alone are not evidence of an engaging fight.

**Stop/revise:** any silent commitment, wrong actor attribution, false map implication or lost response fails the contract regardless of visual preference. If readable combat still produces “use the best available damage button” decisions, address encounter/role rules, not panel arrangement. If all three concepts fail similarly, repair shared information rather than commissioning a fourth skin.

## 7. Changes explicitly not recommended

- No full frontend rewrite before the shared semantics and small experiment are reviewed.
- No tactical grid, draggable formations, cover/range indicators or detailed local floor plan that implies nonexistent rules.
- No permanent book + regional map + site map + character cards + log dashboard. The hybrid changes dominant view with the task.
- No extra universal confirmation modals, arbitrary menu nesting, or auto-selected action merely because one legal command exists.
- No generic narration model inventing actions, motives, knowledge, hits or environmental effects. Do not replace authored scenes with verbose procedural filler.
- No hidden-rule spoilers disguised as “helpful” disabled choices, live omniscient journal updates, or invented next objectives.
- No cosmetic enemy-intention text without stored commitments; no escape animation that leaves world state unchanged while claiming departure.
- No larger sentinel HP pool, forced rescue combat, extra trash fights, or more damage abilities as a substitute for distinct decisions.
- No simultaneous adoption of initiative redesign, zones, environmental simulation, new death rules and new classes. Review each against an observed need.
- No art production as the first validation milestone. Illustration cannot repair attribution, missing memory, weak NPC reactions or a purposeless fight.

## Source trail and verification

Read-only investigation used [Battle](../../../src/battle.ts), [model](../../../src/model.ts), [Targeting](../../../src/targeting.ts), [Tactics](../../../src/tactics.ts), [AbilityUse](../../../src/ability-use.ts), [Effects](../../../src/effects.ts), [FantasyRules](../../../src/fantasy-rules.ts), [PlaySession](../../../src/session/play-session.ts), [campaign completion](../../../src/campaign/campaign.ts), [Witnesses](../../../src/campaign/witnesses.ts), [Exposure](../../../src/campaign/exposure.ts), [field use](../../../src/campaign/field-use.ts), [abilities](../../../data/catalog/abilities.json), [items](../../../data/catalog/items.json), [conditions](../../../data/catalog/conditions.json), [Reedwake](../../../data/sites/reedwake/site.kyr), [rescue](../../../data/situations/caught-below/situation.kyr), and the recorded checkpoint. The [combat facts artifact](combat-facts.json) preserves extracted action counts, damage, party stats and exact small-dice expectations with assumptions. It is analysis of recorded play, not new gameplay or a replacement for it.
