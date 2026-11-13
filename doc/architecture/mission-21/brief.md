# Mission 21: the owner's brief (12 November 2026, verbatim)

M20 is closed as a development assignment. It delivered substantial implementation and adventure integration, but its experiential acceptance remains incomplete.

Westernesse still has serious player-facing defects. Navigation, undertaking guidance, atlas indicators, and interaction surfaces sometimes behave incoherently. The game is often more beautiful than it is dependable, and its underlying richness remains difficult to enjoy.

We have also accumulated substantial obligations across approximately ten recorded missions: outstanding register items, author requests, repeated playtest findings, incomplete demonstrations, architectural liabilities, and expensive tests.

**M21's purpose is to turn that accumulated investment into a genuinely trustworthy, compelling game.**

The mission has three primary objectives:

1. Discharge existing obligations and eliminate serious gamebreakers.
2. Make a substantial, independent aesthetic and interaction-design advance.
3. Restore the pleasures of ordinary adventuring: exploration, discovery, danger, survival, reward, and meaningful consequences.

However, **the first engineering task is to make tests dramatically cheaper**, because we cannot efficiently accomplish the other objectives while paying enormous costs for routine verification.

Our organizing principle remains:

**Make the small thing fast. Make the visible thing clear. Make the chosen thing matter.**

## Phase 0 — Recover the fast development loop

Begin here, before major new feature implementation or large-scale refactoring.

We want to understand why validating an ordinary Kyrie behavior can require so much machinery, and remove that expense from the developer's daily workflow.

### Establish the baseline

Measure the actual routine test cycle, distinguishing cold and warm execution, process startup, Kyr parsing, Deem composition, session setup, repeated fixtures, browser startup, and test execution.

Identify the largest costs and the most expensive test groups.

### Establish a fast test lane

Our initial target is:

**A meaningful quick-test suite completing in approximately 30 seconds total, ideally around 10× faster than the inherited routine feedback cycle.**

Most pure rule and effect tests should execute in milliseconds. Small integration tests should be similarly inexpensive.

Review inherited tests according to what they genuinely prove:

- Pure rules, predicates, effects, and state transitions.
- Small Kyr-world integration.
- Headless multi-action adventure behavior.
- Full Westernesse generation, placement, and content integrity.
- Browser end-to-end behavior.

Move assertions to cheaper layers where their guarantees remain intact.

A rule about inventory transfer, recruitment, gold follow-state, or an atlas facet should not ordinarily require a generated country.

Retain indispensable full-world and browser tests in explicit full-confidence, scheduled, or nightly suites. They must continue running reliably. **Do not manufacture a fast suite by deleting coverage, weakening tests, or silently skipping failures.**

### Prove the new test boundary with real defects

Use representative M20 failures to establish small, inexpensive regression cases:

- Gold appears only for the actively followed undertaking.
- A blue or coral entity signal resolves to a legitimate corresponding interaction.
- Intra-hex movement does not trigger an unintended location exit.
- Conversation reflects actual participants and current circumstances.
- An action produces inspectable, correct state changes.

These should exercise authoritative engine semantics, not parallel mock implementations.

### Investigate the smallest executable Kyr world

Kyrie is a platform; Westernesse should not be required to test its fundamental adventuring rules.

Determine how cheaply an author can validate a Kyr document, instantiate a tiny situation, execute real actions, inspect their effects, and run assertions.

Review the current runtime, CLI, and action contracts before proposing another REPL, command language, or MCP interface.

Prefer simpler execution boundaries, pure effect evaluation, and explicit state dependencies over introducing additional abstractions.

### Timebox this initial investment

The fast-loop phase is an **enabling sprint**, not a new indefinite mission.

Prioritize immediate, high-leverage changes. Establish a useful fast lane as soon as possible, then let ongoing bug fixes strengthen it.

If the 10× improvement cannot be reached promptly, report the measured obstacle and recommended next steps. Do not hold up urgent gameplay repairs while pursuing a speculative kernel rewrite.

**Exit condition:** Developers have substantially faster, reliable feedback for ordinary gameplay changes, and the expensive remaining coverage is organized and understood.

## Parallel work from day one

The performance effort must not leave the other mission lines idle.

### Independent aesthetic investigator

Begin a serious critique of the current Westernesse interface immediately.

Investigate the cinematic resting scene, concise sensory narration, restrained action presentation, meaningful color hierarchy, attention-based People/Things/Places interactions, combat menus, and activity-specific layouts.

Review difficult actual game states and tablet safe zones.

Explore materially different interactive compositions, not merely another styling pass.

Begin establishing a coherent design system with typography, spacing, layout rules, interaction components, atlas semantics, and mechanically enforceable presentation constraints.

The designer should have substantial creative autonomy but must work toward integration with the actual application.

### Independent playability investigator

Begin reproducing the known human-reported failures immediately, even while the fast testing infrastructure is improved.

Maintain an evidence-backed P0/P1 list and prioritize common root causes.

Use the emerging fast tests to turn each durable fix into a cheap regression.

The investigator should not wait until all performance work is complete before correcting an urgent, well-understood gamebreaker.

## Phase 1 — Discharge the inherited obligations

Once the fast test lane is useful, make aggressive progress against the actual backlog.

Prioritize the defects that prevent sustained ordinary play:

**Navigation and intention.** Fix unexpected location ejections, intra-hex movement, circular roads, route previews, inaccurate movement geometry, and destinations that do not remain intelligible across screens.

**Undertakings and gold.** Exactly one followed undertaking; no gold without explicit follow-state; credible next-step guidance; no loops that lead out of a location and back without advancing anything.

**Atlas continuity.** Blue clues, coral recruitment, green collectibles, and other perceptible opportunities must remain identifiable in the concrete actions that realize them.

**Action discoverability.** Important interactions should not be buried in unrelated perception menus while the scene offers only generic choices. Aim to promote a few meaningful actions from across the whole situation.

**Ordinary RPG completeness.** Functional shops, useful tools, meaningful equipment, worthwhile search and examination, survivable but dangerous encounters, intelligible retreat, rewards, recovery, and progression.

**Contextual correctness.** Characters, dialogue, locations, relationships, consequences, save/resume, and combat must respect current world state.

Burn down affordable authorial requests and register items as capacity permits.

Distinguish actual defects from larger gameplay ambitions. Do not convert future systems into urgent technical debt merely because they have been discussed.

## Phase 2 — Renew Westernesse's presentation and play

Integrate the strongest aesthetic experiments into the real game.

The intended direction is a beautiful, cinematic, game-native experience rather than a web application displaying RPG data.

At rest, the player should encounter a place: artwork, evocative prose, and a manageable number of worthwhile choices.

Further detail should unfold through attention and action.

Experiment with a three-sentence initial narration budget, including sensory detail, without enforcing repetitive writing formulas.

Preserve the painterly identity while exploring warmer or geometric sans-serif typography, restrained radiance, dark and light compositions, and coherent activity-specific layouts.

The interface must remain usable in crowded scenes, dialogue, combat, exploration, Book, and Pack—not merely in attractive screenshots.

### Restore the dramatic core

Westernesse should be capable of providing a compelling OSR adventure through a small number of interacting circumstances.

We want exploration, uncertainty, scarcity, danger, preparation, retreat, treasure, and the relief of returning alive.

Test whether a compact expedition can create meaningful choices involving light, time, supplies, injury, companions, and valuable objects.

This is a **creative benchmark**, not a requirement to build a new survival-horror game or impose a universal set of encumbrance mechanics.

Keep the larger ambition intact: a living historical-fantasy world with extraordinary authored adventures, institutions, careers, companies, and long-term consequences.

We want to prove that the ordinary game is rewarding enough to sustain the journey between those exceptional moments.

## Project retrospective and debt accountability

Review the approximately ten recorded missions.

Determine what each principally promised, what was implemented, what actually worked in play, what survived as unfinished work, and what had to be repaired in later missions.

Assess whether our issue register is shrinking or accumulating debt faster than we resolve it.

Look for repeated root causes and recurrent failures hidden behind different ticket descriptions.

Examine whether the mission process itself encourages overly broad commissions, green test reports, premature declarations of completion, and inadequate human acceptance.

Reconcile the register and authorial requests, consolidate duplicates, and identify obsolete documentation and branches conservatively.

The retrospective must help improve how we work, not merely recount past activity.

## Validation and acceptance

M21 should demonstrate four concrete outcomes.

**1. The development loop is substantially cheaper.** Ordinary changes receive useful feedback quickly; full confidence remains available through managed slow suites.

**2. The game is dependable.** Across multiple starts and player strategies, an unfamiliar player can sustain fifteen minutes of coherent play without serious navigation, interaction, or undertaking failures, with credible evidence extending into a worthwhile first hour.

**3. The presentation is significantly better.** A coherent, aesthetically convincing interface has been implemented and evaluated in actual play, including tablet and crowded states.

**4. Inherited obligations have been materially discharged.** P0s are eliminated from accepted flows, major P1s are substantially reduced, authorial requests and legacy commitments are accurately accounted for, and the most persistent defects have genuine regressions protecting their fixes.

Run independent headless and browser reviews, but calibrate them against known human failures. A positive automated clarity rating cannot overrule a reproducible human gamebreaker.

Do not hide outstanding failures behind an aggregate score or impressive test count.

## Explicit limits

M21 is not a general expansion mission.

Do not launch major new systems for ordinary-life professions, teacher curricula, full counterfactual planning, deeper substance simulation, comprehensive lazy world generation, a new imperative command language, or an entirely new campaign.

These remain legitimate future research directions. Preserve their rationale and dependencies, and investigate them only when directly relevant to current work.

Keep the existing world and adventure library as the principal material to improve.

## Final mandate

**First make it cheap to prove a change is correct. Then use that speed to repair what is broken and honor what has already been promised. In parallel, make a decisive aesthetic advance and restore the excitement of playing.**

The goal is not a larger Westernesse.

The goal is a Westernesse that finally delivers the pleasures we have been building toward: a beautiful world that rewards attention, a dangerous adventure that rewards judgment, and a persistent life whose choices matter.

M21 succeeds when the project becomes both **more enjoyable to play and dramatically easier to improve**.
