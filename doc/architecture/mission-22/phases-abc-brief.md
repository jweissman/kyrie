# Phases A–C: playthrough defects, adventure contracts, and the atlas of actions (the owner, 17 November 2026, night)

Verbatim, as the owner gave it.

I have played the current build again. The opening and character creation are still not satisfactory, and I found a concrete identity-generation failure. I also have a few other ideas you can work through in phases.

# Phase A: Playthrough Items

Please treat the first three items below as actionable playthrough defects. The later architectural ideas should receive bounded investigations and prototypes rather than an immediate general-system rewrite.

## 1. The studio opening can be cut off

The studio stab is sometimes interrupted by the title page, so only part of it plays.

Please reproduce this on the deployed build across cold loads, warm loads, slow devices, different refresh conditions, and return visits. Review the timing and ownership of the early studio mark and React's title transition in `web/reader/title-page.tsx`.

**The invariant:** if the studio opening is meant to play, it completes coherently unless the player explicitly skips it. The title must never accidentally preempt it.

I'd welcome a restrained **Hold to skip** instrument: perhaps a small white targeting reticule at the lower right with a discreet Skip label. Skipping should respond promptly, cut cleanly to a usable title, and never accidentally activate New game.

Please consider a further aesthetic treatment of the studio mark. Its timing, proportions, movement, light, and transition into the title should feel deliberate and accomplished, without making people endure a long intro repeatedly.

Respect reduced motion, and ensure all supported inputs have an equivalent way to skip.

## 2. Character creation flickers and feels awkward

I noticed flickering when entering character creation. Record and investigate the actual transition, including layout reflows, image loading, background transitions, component remounts, and focus changes. Establish the cause rather than masking it with a longer fade.

I would like to reconsider **large, plain, elegant selection cards**, especially for ancestry and calling.

But these should not become a second selection system.

The underlying page has one authoritative set of options. The same option may be presented as a menu row, a large card, or another instrument. The visual treatment must not change what choosing the option means.

Explore a deliberately restrained card design: ample room, excellent typography, little ornament, clear focus and selection, and meaningful information revealed on consideration. Avoid decorative borders and dashboard-like containers.

Creation can have a more generous layout than ordinary play. Please experiment with higher-density option menus—perhaps six to ten visible choices where appropriate—without changing the four-foreground-action rule for normal game situations.

This should be an explicit, bounded exception for selection-oriented pages, not an accidental relaxation of the general interaction grammar.

## 3. The name selection is too shallow, and family identity is inconsistent

During my dwarf creation, the name options were sparse. I appeared to get only two pages, with very few names visible at once.

Please inspect both the generated name pools and the interface. I want substantially greater depth and sensible density, with clear paging or rerolling, an editable name field, and no artificial limitation to a tiny handful of suggestions.

More importantly, my dwarf was named **Morgren**, and my brother encountered immediately afterward was also **Morgren**, though the brother had a surname and I did not.

Please reproduce this case and investigate whether the sibling, family, and protagonist are generated from a common identity model or independently assembled.

**Immediate requirement:** relatives should not accidentally receive identical given names, and the protagonist's family name and relationship should be coherent with the family into which the world places them.

Do not merely patch this by forbidding duplicate strings globally. Different people can legitimately share names. The defect is that a supposed family does not exhibit a coherent identity.

Investigate first names, family names, patronymics, house names, regional naming traditions, and ancestry-specific conventions as setting-authored rules.

Where a family relationship is established, its members should have identities derived or reconciled through that relationship, not invented separately by unrelated generators.

## 4. Character creation should become an entry into the encyclopedia

Selecting an ancestry or calling should offer the opportunity to understand what it means.

I would like to explore a substantial **reference or encyclopedia presentation** that can be attended to while considering an option.

For example, considering Dwarf might bring forward an illustrated page or scrollable reference containing relevant lore, attributes, capabilities, languages, cultural information, and other known details.

This must come from authoritative setting definitions and encyclopedia material, not a separate description written for the creation UI that eventually contradicts the actual game.

Distinguish between what the setting knows, what is defined mechanically, and what the character is allowed to know. Don't accidentally reveal hidden setting facts.

Experiment with an expansive scrolling or rotating-document instrument, but keep the selection immediately understandable and easy to operate. The reference should enrich consideration, not require reading a textbook before choosing.

## 5. Establish a reusable contract for dual presentation and input

I think we have the beginnings of a general design principle:

**When an option is represented visually by an instrument, the representation itself should be operable.**

A selection card should respond just as its corresponding menu row does.

A constellation should be selectable by touching or manipulating the observatory, not only by pressing the corresponding text row.

Consideration, focus, commitment, and resulting actions must remain synchronized regardless of whether interaction begins with keyboard, pointer, touch, accessibility input, the visual instrument, or the conventional menu.

I would like a small architectural study of how this can work for several future instruments:

- Character selection cards and encyclopedia pages.
- The astrological observatory, including direct touch navigation through signs.
- A compass or bearing instrument.
- A tunable gauge, dial, or meter.
- A map or spatial instrument for selecting destinations.
- A communication or contact instrument for choosing people known to the character.

Use the existing authoritative action and presentation machinery. Avoid a separate controller or event pipeline for every instrument.

Do not implement all these instruments now. Prove the shared behavior with the existing cards and observatory, then identify the smallest reusable primitives.

## 6. A compass as an example of equipment unlocking verbs

As a later proof, consider a compass that has actual gameplay meaning.

A character who acquires a suitable compass may be able to set a known destination or bearing, consult the instrument, and receive useful directional guidance.

The resulting capability should depend on what the character knows and what the instrument can actually do. A mundane compass should not magically reveal unknown passages or the exact path through an uncharted maze.

A magical compass could have additional capabilities defined by its kind.

This could eventually connect the strategic world map, regional map, local geography, known destinations, and active undertakings without creating a second travel system.

The target is not a decorative compass icon. It is **new navigational capability acquired through play**.

## 7. Sending and other contact abilities

Please preserve a related architectural question for the setting/framework investigation.

A spell such as Sending should be able to select an eligible person known to the caster, establish remote contact through the ordinary communication and action machinery, and produce the same sort of authoritative conversational consequences as an in-person interaction.

The spell's actual eligibility, limitations, range, costs, and effects should be governed by its rules, not by a contact-picker UI.

An NPC should know how they were contacted and may respond differently to an unusual magical message.

Do not assume that merely opening a remote conversation makes every recruitment or persuasion option available. Those must still depend on the person's knowledge, disposition, relationship, and circumstances.

Investigate how a character selects among known and partially known people without requiring an unwieldy list of every person in the world.

Again, this is an authorability and instrument-design study, not a commission to build a universal communications system immediately.

## 8. World assembly should respect social structure

The Morgren problem suggests a broader design investigation.

Can Kyr and Deem generate people within persistent family trees, households, lineages, institutions, and other relationships, rather than generating isolated characters and adding relationships afterward?

The world assembler may be the appropriate place to reconcile identity, genealogy, inherited possessions, kinship, and institutional membership as commitments, provided the generic engine need not understand fantasy-specific naming conventions.

Please begin with one tiny proof: a protagonist generated into an existing household, with parents or siblings, a coherent naming tradition, shared history, and meaningful relations that survive save and reload.

Identify what can already be declared in Kyr, what Deem can generate, and what requires a general composition constraint.

Do not start with a massive genealogical simulation. Demonstrate one convincing family first.

## Priorities and evidence

**Immediate:** studio opening truncation, creation flicker, name-option scarcity, and the Morgren sibling identity failure.

**Next playable prototype:** improved ancestry/calling cards with synchronized focus, consideration, richer reference material, and commitment.

**Bounded architectural investigation:** a universal instrument contract and family-aware generation.

**Later examples:** compass navigation, remote communication, tunable instruments, and broader genealogy.

Please report reproductions, minimal causes, actual fixes, and short deployed recordings for the immediate defects. For the architectural items, return the smallest executable proof or a clearly described limitation before undertaking a large refactor.

The aesthetic ambition remains that the player should be able to attend to an object, person, choice, or instrument—and naturally discover what can be learned or done with it—without feeling that they're operating several unrelated interfaces.

# Phase B: Snapshots, Adventure Contracts, and Shared Journeys

I'd like a bounded investigation into making adventure verification simpler, faster, and more expressive, using the existing Kyr, PlaySession, Journey, checkpoint, replay, and browser infrastructure.

The goal is not fewer tests or weaker evidence. It is to stop paying for an entire adventure or generated world whenever we need to verify one local behavior.

**First, audit the current testing arrangements.**

Review `src/session/play-session.ts`, `doc/authoring/trail/08-testing.md`, the Journey support utilities, existing adventure tests, checkpoint and replay tools, browser fixtures, current CI timing data, and the November throughput and headless architecture reviews.

Identify what we already support, where tests repeatedly reconstruct expensive worlds, and which kinds of assertions currently require unnecessarily long journeys.

**Second, define a small common vocabulary of adventure expectations.**

An author should be able to declare a starting situation, take a public action, inspect the player-visible scene, assert authoritative world facts, and save or restore a checkpoint.

Prefer a concise typed API extending the existing Journey harness before introducing a new DSL or parser.

Support small semantic snapshots of scenes, available actions, important entities, state changes, and events. Avoid making huge serialized world snapshots the primary assertion method.

Ensure that regression snapshots do not replace explicit behavioral expectations.

**Third, prove checkpoint-based branching.**

Take one small existing adventure and establish a verified checkpoint before a consequential decision.

Run two alternative actions from that same state, assert their different outcomes, and verify that the original state is unchanged.

Measure the cost of minimal fixture construction, checkpoint restoration, campaign forking, and full replay. Choose the lowest-cost mechanism that still executes the real rules.

Do not implement a parallel consequence predictor. If an action's complete outcome is tested speculatively, it must be resolved by the authoritative engine on an isolated branch.

**Fourth, reuse journey specifications in the browser.**

Create a small, general page-object interface that maps public action identities to actual visible controls and executes them through real browser input.

The same journey specification should run primarily against PlaySession and selectively against the browser reader.

The browser driver must test focus, pagination, holds, accessibility, action submission, and visible results—not silently bypass the UI by invoking the engine.

Provide a secure test-only way to start the browser from a valid PlaySession checkpoint. Use normal restore and validation, and prevent this facility from becoming a production bypass.

Keep one or two full browser journeys that exercise the genuine entry path and critical transitions. Other browser tests should be focused, component-oriented, or checkpoint-based.

**Fifth, address the studio-opening regression with visual evidence.**

Capture the real studio animation on a cold page at several controlled points, including approximately five seconds into playback.

At the completed point, assert that the complete image is visible and that the title has not prematurely covered it.

Also test that an explicit skip transitions promptly to a usable title without accidentally activating a menu option.

Preserve visual snapshots for aesthetic review, supplemented by timing, visibility, and interaction assertions.

Explore the possibility of the studio's towers representing actual readiness stages, but do not make the cinematic duration or visual completion depend on misleading loading percentages.

**Sixth, establish an authoring convention.**

For one existing substantial adventure, demonstrate:

- A fast local test of a distinctive mechanic.
- A semantic snapshot of a meaningful scene.
- A branch test from a verified checkpoint.
- A consequence and persistence test.
- A short headless journey through its dramatic spine.
- A corresponding browser smoke run using the same public action identities.

Document the pattern so independent adventure authors can reproduce it with very little test boilerplate.

**Acceptance.**

Report actual timing differences and evidence quality, not just reduced test counts. The new arrangement should make ordinary author tests shorter, failures easier to diagnose, and full journeys more trustworthy.

Do not undertake a major framework rewrite unless the small experiment establishes that it is necessary.

The intended result is that an author can write a short, readable verification of an adventure's meaningful behavior—and the same underlying proof can be exercised through the real player interface when appropriate.

# Phase C: Atlas of Actions, Lenses, and Character Agency

I would like us to begin using the Living Design Atlas more deliberately to organize the game's opportunities, action verbs, character capabilities, and forms of dramatic tension.

The immediate motive is boredom. The world often presents technically valid actions that are not sufficiently diverse or compelling. I want to investigate whether the Color Atlas and a more explicit taxonomy of player intentions can help us author richer situations and foreground better choices.

**Begin with the actual design record and current implementation.**

Read `doc/design/ATLAS.md`, `doc/design/DOCTRINE.md`, `doc/design/GRAMMAR.md`, `src/presentation/aspects.ts`, `src/presentation/emphasis.ts`, `src/ui/affordances.ts`, `src/ui/promotion.ts`, and the current lens and authoring contracts.

Distinguish settled meanings, current implementations, historical rulings, and new hypotheses. In particular, the existing five-color palette is intentional; adding a sixth color would be a conscious revision, not an incidental styling change.

### A. Study diversity-aware foreground promotion

Investigate whether the four promoted actions in a scene can preferentially represent different kinds of opportunity and different intentions.

Where several choices are similarly valuable, prefer genuine diversity of aspect, verb, target, method, tension, and consequence.

Do not impose a quota of four colors. Do not displace immediate threats, urgent needs, or the real next step of the followed undertaking. Do not invent or promote irrelevant actions to fill a menu.

Use real situations from existing adventures. Compare current and proposed foregrounds, then measure whether the new selection produces better decisions in actual play.

### B. Examine the five-color lens hypothesis

Explore an alternative organization in which each Color Atlas aspect can become a lens for attending to opportunities.

Compare it against the existing people, things, places, and time lenses. Do not assume one must replace the other.

The lenses must consume authoritative, character-perceivable opportunities. They cannot manufacture actions, reveal secret world facts, or give gold to something that does not advance the followed undertaking.

Prototype the alternative in one or two scenes and obtain an independent usability judgment.

### C. Investigate social influence as a distinct semantic aspect

Consider a proposed **Influence** aspect encompassing persuasion, recruitment, leadership, inspiration, intimidation, mediation, and other attempts to affect another character's decisions.

Test whether a restrained rose hue genuinely improves comprehension compared with existing green and neutral treatments.

Social challenges should have meaningful difficulty, resistance, and consequences. Not every social act requires a roll; willingness, relationships, institutions, obligations, and uncertainty must determine the resolution.

Report whether the sixth color merits adoption, with the resulting implications for the palette and semantic contract.

### D. Define and test a player-intention verb taxonomy

Build a provisional taxonomy of roughly ten to twelve broad families of activity, grounded in the current Kyr action vocabulary and actual adventure examples.

For each family, identify:

- Existing executable verbs and authored situations.
- Missing generic capabilities.
- Tools, knowledge, professions, and abilities that unlock further approaches.
- Relevant forms of risk, uncertainty, cost, reward, and persistence.
- Concrete examples at novice and experienced levels.

Use the taxonomy to identify missing kinds of adventures, not merely to relabel existing commands.

Consider how independent adventure authors might be asked to exercise neglected verbs and produce distinct dramatic structures.

### E. Test three starting forms of agency

Investigate three simple character-creation possibilities: **Commoner, Adventurer, Aristocrat**.

These should be coherent, diegetic beginnings rather than abstract numerical difficulty presets.

A commoner has an ordinary life, limited specialist capabilities, and real opportunities for development. An adventurer begins with a calling and useful training. An aristocrat begins with a form of social standing, resources, or institutional access, but need not have an adventuring class.

Do not conceal the entire interesting world from the commoner. Distinguish what characters can perceive, what they understand, what they can attempt, and what they are qualified or equipped to accomplish.

Test whether the three beginnings produce genuinely different opportunities and meaningful progression without forcing separate interfaces or separate game rules.

### F. Deliver a compact playable proof

Construct one small place offering several genuinely different kinds of activity: perhaps a dangerous creature, an unresolved question, someone needing assistance, a valuable object, and an unfamiliar phenomenon.

Run the same place with different character circumstances and capabilities.

Show how the authoritative choices, visible aspects, relevant instruments or lenses, and possible outcomes differ.

Then compare the quality and variety of the four foreground choices against the existing system.

**Deliver an evidence-based design proposal, a small executable demonstration, a provisional verb taxonomy, and specific recommendations for changes to the promotion and authoring contracts.**

Do not implement a new universal lens system, overhaul the palette, or restructure character creation before the experiment demonstrates a benefit.

The criterion is not that more colors or verbs appear on screen.

**The criterion is that different characters encounter more intelligible, varied, consequential ways of becoming involved in the world.**
