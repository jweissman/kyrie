# The owner on the terminal as an instrument (14 November, night)

The owner's direction, kept as given, to be folded into Mission 21's fast-test, playability and aesthetic
obligations, not run as a separate feature track. Register §29 (TB-01 to TB-08) carries it.

> The terminal should not be treated as a secondary or simplified client. It could be our cheapest and clearest way
> of testing whether Kyrie actually presents an interesting, intelligible, coherent game.

## 1. Terminal and browser must be projections of the same engine

> The terminal should use the same authoritative player-safe observations, actions, targets, availability, atlas
> facets, knowledge boundaries, and undertaking state as the browser. The goal is **1:1 semantic parity**, not
> identical graphical formatting. ANSI true color should implement the actual canonical atlas, including gold
> follow-state and meaningful multifacet treatments. No separate terminal heuristics for colors, action importance, or
> world knowledge. If both clients are given the same state and observation, they should agree on what is available,
> which four actions are promoted, and what those actions mean.

## 2. Four promoted choices should be a universal interaction convention

> Across ordinary gameplay surfaces (character creation, dialogue, exploration, waiting, and other selection pages)
> when there are four or more legitimate choices, **promote exactly four as the primary options**. This should not be
> confined to the resting scene. A page offering eight, twelve, or twenty choices should not simply dump them all into
> a long list and ask the player to sort them out. It should identify the four most salient choices and provide an
> intentional, easily understood affordance for exploring the rest. Different activities may need different
> compositions: character cards, dialogue choices, tactical actions, and destinations are not visually identical. But
> they should share the same attention hierarchy. The additional options should remain accessible, not silently
> discarded. If fewer than four real choices exist, show the actual choices rather than inventing filler.
>
> For ordinary noncombat scenes, investigate the proposed taxonomy of roughly 10–12 specific action types, with at
> most one promoted action of each type. The System 1 model could receive the current player-safe scene and produce a
> probability distribution over those categories; the action system would then choose grounded actions within the
> leading categories. Combat and other special choice structures may need their own diversity rules. Character
> creation, for instance, may need to rank four cards of the same general kind. Preserve the four-choice presentation
> discipline without mechanically applying an inappropriate category constraint. Please treat this as an
> interaction-pattern language, not merely another action-ranking score.

## 3. Enforce literary economy through blind terminal walks

> Run agents or deterministic walkers through the real terminal projection, with no privileged access to hidden world
> state. For each independent representative walk, fail if automatically presented scene narration averages **more
> than three sentences per scene presentation**. Report severe outliers separately. Also identify repeated location
> descriptions, repeated dates and times, unchanged status dumps, and prose that merely restates previously observed
> facts. We need strong qualitative literary review alongside the numerical budget. Three sentences of dead prose are
> still dead prose. The test should expose poor composition, meaningless generic descriptions, inappropriate
> omniscient statements, awkward generated English, and failure to foreground a scene's interesting details. Use
> captured transcripts to distinguish problems in authored Kyr content, text templates, observation projection, and
> final rendering.

## 4. Make the terminal exceptionally usable for automated agents

> Investigate a simple, robust stdio runner for repeated blind play. Ideally it should offer a human-readable ANSI
> terminal presentation and a structured machine-readable protocol exposing the same player-safe information and
> stable action identifiers. Agents should be able to observe, choose an actual available action, receive its
> outcome, and continue without parsing decorative formatting or using a browser. The runner should support
> reproducible seeds, controlled character builds, transcript capture, and clear failures. It should not introduce a
> separate simulation or bypass the real action semantics. Keep the smallest fixture walks extremely cheap, with
> broader Westernesse walks in an appropriate integration tier.

## 5. Use the runner to evaluate the corpus, not merely engine correctness

> Build the comparative matrix across starting classes, backgrounds, fates, seeds, and player policies. Record
> mechanical and experiential information:
> - Available, promoted, selected, and realized opportunities across the canonical atlas colors.
> - Distribution of action types and how frequently meaningful actions are promoted.
> - Progress, discoveries, combat, companionship, retreat, navigation loops, dead ends, and undertaking completion.
> - How often the player sees repetitive or uninteresting choices.
> - Narration length, repetition, and qualitative prose failures.
> - Differences in what distinct character builds can perceive and accomplish.
>
> Experiment with a small, type-constrained System 1 model both for category-probability estimates used by promotion
> and, separately, as a lightweight player policy for more varied blind walks. Compare these against deterministic
> walkers and expensive reasoning agents. Measure cost, reproducibility, action diversity, and whether they detect
> actual playability failures. The model must not invent action legality, facts, outcomes, or atlas semantics.

## 6. Use the terminal to investigate information design

> What is the minimum a player needs to see on arriving somewhere? What changes after an action? What information
> belongs behind an intentional lens or expansion? How do we make four choices immediately legible while letting an
> interested player discover twenty? The terminal strips away paintings and visual ornament. If the resulting
> interaction is still too wordy, difficult to understand, or repetitive, we can see that immediately. Consider scene
> arrival, action outcome, and deliberate detailed inspection as distinct presentation moments. Avoid printing the full
> world observation on every turn.

## Acceptance

> Several substantive blind terminal walks, each satisfying the prose budget; an example of terminal/browser semantic
> parity; consistently promoted four-choice menus across several different activity types; a meaningful
> class-by-class opportunity matrix; and at least one demonstrated literary or interaction improvement driven by what
> the walks revealed. **The goal is not just a better terminal. It's to make the terminal the fastest place to
> discover when Westernesse is verbose, repetitive, mechanically inaccessible, misleadingly colored, or unable to
> present its most interesting possibilities.**
