# Amendment 6 (11 November): an illustrated, responsive RPG

The owner's design experiment for the first hour, as given. It replaces earlier overlapping UX suggestions with one
coherent direction. Recorded in the [log](log.md) as amendment 6; progress against it is kept there.

The central goal is to transform Westernesse from a web application exposing a game engine into **an illustrated,
responsive RPG in which the player continually encounters intelligible opportunities for meaningful action**.

This is not a request to replace the simulation with a branching visual novel, redesign Kyr/Deem, or launch an
unbounded UI rewrite. Preserve the open-ended mechanics and use rendered play to evaluate the design.

## A. The world is the primary surface

The default resting experience should be the current scene.

Let environmental paintings occupy the viewport, respecting composition and safe zones. Put narration, conversations,
portraits, and contextual actions in restrained overlays rather than permanently splitting the display into multiple
application panels.

Remove or substantially reduce the top rail. Use a compact, coherent toolbar for secondary functions, and unobtrusive
location/time metadata.

Consider consolidating Character and Book into one temporary dossier for character information, equipment, pack,
undertakings, notes, story, and knowledge. Keep the map distinct as a spatial tool.

Maintain continuity: opening a conversation or dossier should feel like engaging with the current world, not navigating
to a different website.

Favor subtraction and clarity over additional decorative effects.

## B. Foreground opportunities, not raw commands

The primary action surface should ordinarily present **two to four salient, genuinely different things worth doing**.

These are opportunities or approaches, not simply arbitrary command verbs.

Examples include investigating a ruin, speaking to a particular person, pursuing tracks, entering a dangerous passage,
claiming a known reward, or seeking another route.

Keep the wider simulation accessible through people, objects, exits, abilities, spells, inventory, and secondary
interactions.

Four choices are an attention budget, not a quota. Never add filler merely to reach four.

Foreground choices must resolve to actual legal, player-visible actions or clearly explained multi-step approaches. Do
not invent opportunities with TypeScript heuristics that have no authored or simulated basis.

## C. A small semantic atlas for interesting possibilities

Establish a consistent semantic vocabulary, grounded in player knowledge:

- **Gold — followed undertaking:** a known next step toward the player's actively selected objective.
- **Silver — promising exploration:** an interesting nearby possibility or lead, including places worth investigating
  even when no quest is followed.
- **Green — available payoff:** a reward, benefit, or claimable opportunity.
- **Blue — learnable knowledge:** a visible clue, discovery, or useful information.
- **Red — perceptible danger:** a hazardous approach, enemy, or credible tactical risk.
- **Violet — recognizable wonder:** an uncanny, magical, or otherwise extraordinary opportunity.
- **Neutral — ordinary controls, selections, status, and decoration.**

Treat these as semantic categories, not requirements to color every button. Use consistent labels/icons and accessible
non-color cues.

The same opportunity may have several attributes. Establish a restrained primary emphasis and secondary cues.

Do not reveal undiscovered secrets or danger through styling.

Gold must not also be used for portrait frames, map selection, generic observations, or decorative highlights.

Silver is particularly important: a player who has not selected a quest should still be able to find interesting
things to investigate.

## D. The playable thread

The golden thread is only one special case of a wider principle.

The game should usually offer a legible continuation into potentially interesting play, whether the character is
following a quest, looking for work, seeking treasure, pursuing a mystery, exploring, or approaching danger.

An opportunity may lead to risk or disappointment. It need not guarantee success. But it should not routinely lead to
an empty location, a noninteractive character, or an inexplicable dead end.

Where a site is closed, the player should have intelligible ways to investigate the obstacle, prepare, seek another
approach, or understand what they lack.

Where a followed undertaking supplies a known next step, its guidance should remain truthful through the actual public
controls.

Preserve the golden thread as a provisional accessibility and diagnostic instrument, not a settled permanent design
requirement.

## E. Make encounters and combat feel like part of the game

Treat combat as a first-class interaction mode of the scene-first redesign, not a separate dashboard of mechanical
commands.

When danger emerges, make the opponent, environment, immediate stakes, and available tactical responses clear.

The combat foreground might ordinarily present attack, relevant abilities, spells or equipment, and a contextual
maneuver or retreat, with fuller options available when needed.

Use existing mechanics; do not fabricate generic actions the engine cannot support.

Create readable transitions between exploration, threat, negotiation, combat, and aftermath.

Investigate the current lack of meaningful combat pressure in the first hour. Ensure ordinary exploration exposes
genuine opportunities for danger, tactical judgment, and consequences, not merely trivial fights or guaranteed
victories.

Avoid simply increasing monster numbers or statistics.

## F. Spatial continuity and discovery

The world map, possible local hex-scale view, and illustrated scene should feel like different scales of the same
geography.

Map consultation is distinct from travel. Planned routes, executed travel, animation, terrain revelation, elapsed time,
and resource use must agree.

Nearby points of interest should be discoverable and meaningfully distinguishable. The map should offer credible
exploration opportunities, including silver leads, without pretending that all undiscovered content is already known.

A closer landscape view is a potential later prototype, not a prerequisite for the present reflow.

## G. Use the interface as an honest integration test

A prominent opportunity is a promise. Its presentation must agree with available public actions and the resulting world
state.

Investigate cases where gold guidance leads to no usable next step, rewards are indicated without claimable actions,
collected items disappear from the pack, or travel diverges from its preview.

The interface must not repair such contradictions merely by inventing persuasive-looking buttons.

Fix the underlying agreement among generation, authoring, player knowledge, navigation, interaction, and feedback.

## H. Lightweight autoplay gauntlets

Consider a small development diagnostic using existing headless sessions and public actions.

Start with a simple **silver-path walker** that selects promising general opportunities, and optionally a gold-path
walker that follows an explicitly selected undertaking.

A basic danger-seeking policy may help exercise combat.

Do not build a general autonomous-gameplay framework or a complex tournament platform.

Record whether the walkers continue finding meaningful situations, reach reachable sites, encounter danger, make
discoveries, obtain rewards, or stall in repetitive actions and navigation loops.

The goal is not to prove that a naive policy can solve every adventure. It is to expose whether the game reliably
offers and fulfills intelligible opportunities.

Preserve independent cold-agent and eventual human-play acceptance; autoplay is supplementary diagnostic evidence.

## I. Execute in two coordinated phases

**Phase A — Visual composition and information architecture.** Establish the painting-led scene, restrained overlays,
coherent conversation and portrait presentation, minimal navigation chrome, backstage dossier, and map access. Preserve
the existing action semantics initially.

**Phase B — Opportunity foreground and encounter flow.** Introduce the small salient-choice foreground, consistent
semantic colors, truthful exploratory and objective guidance, and coherent combat presentation. Verify that the
prominent opportunities are genuine and that other legal interactions remain accessible.

Use rendered desktop/mobile comparison and an uninterrupted first-fifteen-minute journey to judge whether the result is
better. A lightweight autoplay diagnostic may be added where it directly helps verify the resulting interaction
contracts.

## J. Design and delivery discipline

Continue the current M20 stabilization mission, including already identified first-hour defects.

Do not build new adventures, invent a universal narrative grammar, or launch major world-generation refactors as part of
this UI work.

Favor bounded, tested increments integrated into the one canonical game on `main`. Do not pause for routine owner
approval.

Judge success through continuous play: Can a new character enter the world, perceive worthwhile possibilities, choose
an approach, encounter resistance, learn something, and keep going without developer knowledge?

**The central standard is simple: the world should usually offer something worth doing, the interface should make it
intelligible, and doing it should produce a believable response.**
