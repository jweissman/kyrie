# Mission 22: the owner's commission (16 November 2026, verbatim)

Close M21 with an honest account of its achievements and outstanding commitments. Do not suggest that player acceptance or all inherited obligations have been achieved merely because the engineering phase is ending.

**M22's principal achievement should be extraordinary quality in the first encounter with Westernesse and in the fundamental act of choosing what to do.**

I want the first fifteen seconds, the opening minute, and the repeated act of choosing to receive a level of concentrated aesthetic, interaction, and technical attention that we would ordinarily devote to a much larger feature.

But this is not simply a UI-polish commission.

Westernesse is a literary, painterly, simulation-first RPG in which the world exists independently of the player. Its deepest ambition is that the player can inhabit that world, discover meaningful possibilities, exercise real agency, and change things that persist.

M22 should advance that ambition while establishing a firmer basis for the missions that follow.

**The operating principle is narrow execution, broad investigation.** We should remain intellectually ambitious, use the engine to test difficult design ideas, and continue reducing established obligations. But we must not let a proliferation of projects prevent the central experience from becoming demonstrably better.

---

## Phase 0 — Recover the design and establish reality

**Do this before proposing a new architecture or embarking on major implementation.**

Much of the design work already exists, distributed across mission records, independent reviews, owner rulings, design atlases, and experiential test reports. We should not rediscover it by intuition or replace it with the latest local preference.

### Read the project in this order

**1. Artistic identity and doctrine**

Start with:

- `doc/design/VISION.md`
- `doc/design/DOCTRINE.md`
- `doc/design/ATLAS.md`
- `doc/design/GRAMMAR.md`
- `doc/design/AESTHETICS.md`

Read the Living Design Atlas as a guide to directions, hypotheses, horizons, and unresolved tensions—not as a backlog where every possibility has become a commitment.

Preserve its distinctions. The artistic vision is binding; a speculative implementation technique usually is not.

The recurring standard is that the world must reward attention, the chosen thing must matter, and the player should become interested in what happens next rather than remain conscious of operating an interface.

**2. The M21 commission, evidence, and handoff**

Read:

- `doc/architecture/mission-21/brief.md`
- `doc/architecture/mission-21/retrospective.md`
- `doc/architecture/mission-21/handoff-to-m22.md`
- `doc/architecture/mission-21/obligations-review-15-nov-late.md`
- `doc/architecture/mission-21/owner-rulings-nov16.md`
- `doc/architecture/mission-21/interaction-contract.md`
- `doc/architecture/mission-21/colour-atlas.md`

The most recent explicit owner rulings take precedence over incompatible older suggestions. Identify stale design documentation and reconcile it rather than maintaining two competing contracts.

**3. The previous investigations into the first touch**

Read:

- `doc/architecture/mission-21/owner-first-minute.md`
- `doc/architecture/mission-21/first-touch.md`
- `doc/architecture/mission-21/first-minute/critique.md`
- `doc/architecture/mission-21/interaction/`
- `doc/architecture/mission-21/loading-boundaries.md`
- `doc/architecture/mission-21/performance-report.md`
- `doc/architecture/mission-21/owner-title-onboarding.md`

Understand what was tested, what was actually deployed, which alternatives were rejected, and which remain promising.

Do not start another broad interaction framework before examining the existing gesture, reticle, action-row, input, and observation machinery.

**4. Existing obligations and capability evidence**

Read:

- `doc/architecture/open-register.md`
- `doc/architecture/mission-21/capstones.md`
- `doc/architecture/mission-21/verb-pins.md`
- `doc/architecture/mission-21/rules/srd-fidelity.md`
- `doc/architecture/mission-21/casting-fiction.md`
- `doc/architecture/capability-audit.md`
- `doc/history/findings/`
- The preceding mission briefs, closures, audits, and inherited registers

Use the existing register scripts and feature mapping rather than inventing another tracking system.

Read original adventure-author friction reports where they illuminate expressiveness, prose, dramatic structure, or missing interactions.

The earlier conversation archives and original owner feedback should be consulted when condensed documents conflict or omit an important design intention. Do not treat assistant speculation in those records as an owner ruling.

### Establish a reproducible baseline

Before changing the opening, record the current deployed version and play it.

Capture the studio mark, title, complete creation flow, setting out, first scene, and first several actions as one uninterrupted sequence.

Inspect a conversation, a map journey, a spell, and an encounter as well. Include at least one character different from the usual reference warrior.

Record cold and warm loading, time to first usable input, time to acknowledgment of a press, and time until the world becomes playable.

Examine actual touch, keyboard, and pointer behavior. Use real recordings, not merely screenshots.

Run the existing headless opportunity and playability tools and establish their present baseline.

**Initial deliverable:** a concise M22 orientation report identifying what is known, what conflicts, what is unverified, the highest-leverage interventions, and the proposed execution sequence.

This is a short initial investigation, not an indefinite research phase.

---

## Phase 1 — The fundamental act of choosing

This is the primary implementation and aesthetic work of M22.

The game has one interaction grammar:

**Focus → Consider → Press/Hold → Commit → Resolve → Continue.**

Study each part carefully.

How does attention settle on an action? What does the player understand before choosing it? What visual and auditory feedback acknowledges their choice? When does the command commit? How does the resulting world state become perceptible? How does the player continue?

The entire sequence should feel natural, elegant, responsive, and repeatable.

### Requirements

**One authoritative interaction system.**

Every gameplay action must arise from the authoritative current observation, with real identity, legality, availability, and consequences. The browser, terminal, and headless runner must agree on what can be done.

The engine owns the actions and final player-facing content. Clients may compose presentations and support inspection, but must not invent parallel gameplay.

**One foreground, no more than four actions.**

There are no compound action trees that unfold additional gameplay actions beneath the current four.

Attending to a person, object, exit, map, spellbook, or activity replaces the foreground choices. If the current situation genuinely offers more than four possibilities, make the remaining possibilities accessible through coherent focus or paging, without a sprawling list.

Broad actions are preferable when dozens of individual topics have little distinctive decision value. Legal capabilities must not simply disappear for presentation convenience.

**One clear focus and selection grammar.**

Focus must be distinguishable from committed selection. Geometry should remain stable. The player should never be uncertain which option will be chosen or find the target moving beneath a pointer.

The same grammar should operate on the title, creation cards, ordinary actions, conversations, inventory, character sheets, map, and combat, while allowing those situations to have different compositions.

**A press means what it appears to mean.**

Investigate and refine normal presses, sustained commitments, cancellation, interruption, repeated keys, touch release, and accessible equivalents.

The latest owner direction explicitly values meaningful hold interactions on the first page and during creation. Preserve that intention unless new evidence demonstrates a better realization.

A ring must not promise a hold when a tap already performed the command. Nor should routine interaction become unnecessarily slow.

**Immediate response, without excessive choreography.**

Investigate focus appearance, the pressed and taken states, acknowledgment of a command, timing of the result, and the moment the next choices appear.

Explore a restrained optional commitment sound, especially because it can give the action a physical quality without adding visual clutter.

Investigate a consistent Inspect operation for optional detail, such as dice calculations, rather than inventing additional gameplay rows.

The point is not to add motion. It is to make the interaction feel precise and satisfying.

### Acceptance

Demonstrate the grammar through the first action, a conversation, a map interaction, a battle, and a sequence of repeated ordinary actions.

There must be no secondary gameplay-button system, no accumulating action menus, no double commits, and no false or stale action IDs.

The player should be able to forget the control and attend to the situation.

---

## Phase 2 — Make the Color Atlas's opportunity language precise

This is part of the primary interaction-design work, not merely documentation.

The Color Atlas is one of Westernesse's most distinctive design concepts. It describes the kinds of meaningful opportunity a character can perceive in the world.

The current restricted semantic hues are:

- **Gold:** a known, viable next step toward the followed undertaking.
- **Blue:** knowledge or investigation.
- **Green:** a real material or practical payoff.
- **Red:** perceptible danger or conflict.
- **Violet:** something genuinely uncanny or wondrous.

Ordinary controls and most other information remain neutral. Exploration, companionship, passage, and related meanings can be expressed through restrained icons.

Do not casually restore abandoned semantic hues or let unrelated systems appropriate these colors.

### Distinguish hue from condition

Our earlier discussions also proposed a richer expressive language for the *condition* of an opportunity.

Examples include:

- Newly encountered versus familiar.
- Immediate versus distant.
- Clearly perceived versus indistinct.
- Credible versus uncertain.
- Active versus attenuated.
- Still productive versus exhausted or repetitive.
- Particularly urgent or intense.

Investigate whether lightness, value, intensity, diffusion, shape, or a very restrained motion treatment can communicate these distinctions.

A distant opportunity might appear duller. A novel opportunity might have a stronger initial presence. A fully exhausted opportunity might nearly vanish from attention.

But these are design hypotheses to test, not licenses for arbitrary visual effects.

**Hue should continue to mean what kind of opportunity is perceived; the other visual dimensions may express its condition.**

An opportunity should never reveal a secret the character does not actually know. A beautiful but ungrounded indicator is a simulation error.

Consider how multiple meaningful aspects coexist. The project previously explored prismatic overlap; the current system emphasizes one dominant color and secondary icons. Investigate the aesthetic possibilities without silently overturning the current contract.

### Produce a normative appendix

Document the visual and semantic vocabulary clearly enough for authors, generation, browser, terminal, and automated tests to use consistently.

Cover action rows, nearby opportunities, map and POI marks, known distant locations, and opportunities whose significance changes with knowledge or capability.

Use concrete examples: a followed debt, a dangerous opponent, a hidden clue, a recruitable companion, a distant wonder, a depleted location.

Test the indicators by actual player knowledge and available actions, not their decorative appearance.

---

## Phase 3 — The first fifteen seconds and the first minute

Review the studio mark, title, creation, astrology/sign selection, setting out, and first scene as one continuous artistic experience.

Investigate typography, timing, composition, transition, focus, feedback, and restraint.

The foreground should be quiet and exceptionally legible. Richness may live in the painting, atmosphere, sky, and the world's response to attention.

Do not revive old ornamental UI treatments merely because they are technically elaborate.

### Performance is part of the design

The wait during world generation has repeatedly damaged the opening.

Investigate whether compilation, generation, preparation, or the initial locality can be staged earlier, cached, or made available incrementally without compromising deterministic world state.

Measure the actual source of delay. Do not just build a more elaborate waiting animation.

The ideal transition is from choosing a life to finding oneself in that life, with as little application machinery as possible between them.

### The star-sign observatory

Revisit the existing celestial observatory research as a possible special demonstration of responsive presentation.

It should not own the creation rules. The engine supplies the available signs, their significance, and the chosen result. The visual sky is an instrument for attending to that authoritative state.

This is an artistic prototype, not a commission to develop a general 3D framework.

The same principle could later support armillary spheres, locks, artifacts, maps, and other exceptional instruments.

### Prove the complete passage

Record the opening without edits on the deployed build, including the first two or three meaningful gameplay choices.

Review it independently for whether it feels like operating one coherent game or navigating a series of web pages.

Test desktop, tablet, phone, keyboard, pointer, touch, accessibility, and reduced-motion behavior.

---

## Phase 4 — Keep improving the world in parallel

M22 should not become an aesthetic enclave while the underlying game remains impoverished or the inherited register remains large.

Maintain bounded parallel work on the following.

### A. SRD fidelity and engine expressiveness

Continue the SRD concordance and conversion work, with explicit distinctions among faithful implementations, deliberate adaptations, incomplete mechanics, and unsupported effects.

Prefer generic engine capabilities that unlock multiple creatures, spells, and situations.

Important proving cases include:

- Casting spells outside combat, with the same real resource and effect rules.
- Sleep and other hostile spells initiating or altering a confrontation.
- Healing, regeneration, Raise Dead, and Resurrection in combat and outside it.
- Plane Shift and genuine planar laws, with persistent location and consequences.
- Reusable status, targeting, save, check, and effect mechanics needed by the adopted SRD scope.

These are candidate proof cases, not a requirement to complete all of them in M22.

Implement a meaningful subset thoroughly and report the remaining gaps. A spell's presence in a catalog does not establish that it works.

### B. Authorability and the abstraction boundary

Continue testing whether Kyr and Deem can express sophisticated situations cheaply and directly.

The M21 handoff suggests author-defined item kinds as a useful initial proof: a custom item with real properties and effects, authored in Kyr without modifying a global catalog.

Also preserve questions about deferred generation, nested composition, reusable rules, persistent generation context, and Kyr/Deem interoperability.

Use small executable experiments to identify genuine limitations. Do not add broad abstractions before the experiment establishes a need.

### C. Opportunity density and the actual first hour

Use static world audits and real walkers together.

Measure:

**Exists → Reachable → Perceptible → Offered → Executable → Realized → Consequential.**

Report these stages by Color Atlas aspect, intention category, meaningful player verb, character capability, and opening circumstance.

Compare multiple generated seeds, classes, ancestries, and origins over the first fifteen minutes and first hour.

Measure novelty, repetition, dead ends, danger, wonder, rewards, opportunities to learn, relationships, and actual persistent change.

Do not optimize merely for maximum density or uniform color frequencies.

We want ordinary life to remain credible and exceptional things to remain exceptional. But each representative character should have a worthwhile breadth of possibilities.

Some characters ought to perceive opportunities others miss. Show where this distinction is truly supported by the engine and where it remains an aspiration.

Preserve the player-facing **Wander** concept: a deterministic, authoritative way to let exploration proceed until an encounter, discovery, danger, or choice warrants attention. It must not become a client-side script secretly taking arbitrary actions. Investigate the smallest proof if it remains unimplemented.

### D. Independent authorial probes

Commission or conduct a bounded set of independent authoring experiments that challenge the current game.

Ask for distinct dramatic forms rather than more of the same quest structure: perhaps an ordinary livelihood, a mystery, an escape, a social conflict, and an encounter with genuine wonder.

Test whether an adventure has an intelligible inciting Incident, an ongoing Problem, meaningful Aims, possible alternative outcomes, and consequences that persist.

Review dead prose, repetitive narration, excessive exposition, and unproductive interactions. The default arrival scene should invite attention, not enumerate a database.

At least one experiment should address the opening: can the character begin with genuine circumstances and obligations rather than simply being assigned one selected quest?

Explore starting assets, liabilities, patronage, debt, exile, inheritance, memories, and diegetic development of background or profession.

For debt specifically, the creditor and the consequences of nonpayment must be real. The gold guidance must not pressure a novice into selling indispensable equipment merely because doing so increases their purse.

Do not replace the entire creation system without first proving a better small example.

---

## Phase 5 — Preserve and organize the larger design program

The following ideas have recurred in the design discussions and should not disappear from the development agenda.

They are **research directions and candidate experiential pins**, not all M22 implementation requirements.

### Characters and meaningful careers

Explore a persistent Record of Deeds or achievements, derived from authoritative resolved events, rather than button presses.

Consider how feats, perks, skills, backgrounds, and professions can recognize genuine accumulated practice.

Develop the idea of paragon journeys: convincing paths from novice activity to extraordinary mastery, with at least one playable example for each major category over time.

Test concrete character fantasies rather than simply counting catalog entries: a ranger with a mount, a knight wielding an enchanted greatsword, a mage mastering evocation, an alchemist discovering recipes, a landholder improving a place, a befriender keeping an animal companion, or a commander giving meaningful orders.

### Instruments of attention

Investigate books, maps, character records, almanacs, journals, and other instruments as different views of authoritative world state rather than disconnected dashboards.

The astronomical almanac is an especially good example: it should genuinely observe the current sign and the stars above, and at least some authored abilities or circumstances should respond to that state.

Consider whether astronomical specialists, rare celestial doors, rituals, or other world phenomena can make that knowledge useful.

### Space and presence

Preserve the proposed middle scale: a topological, possibly geometrically realizable view within a hex, including paths and points of interest.

Explore whether ground-level walking can produce a genuine sense of movement, approach, discovery, and encounter without turning Westernesse into a conventional 3D RPG.

The goal is to experience a place unfolding, not merely to improve cartographic detail.

### Dramatic topology, fate, and divination

Investigate whether a graph of actors, obligations, adversaries, pressures, conflicts, and possible transformations could be derived from the authoritative world.

Tarot or fortune-telling might provide partial symbolic readings of that structure.

A genuine prophecy should reveal or condition real possibilities, not force scripted outcomes regardless of what the world and player do.

Preserve this as a research direction unless a small executable example demonstrates its value.

### The larger world and its genres

Maintain experiential tests for cities, institutions, deep mines, extraordinary geography, seas and voyages, strange cultures, planes, magical artifacts, ordinary professions, and different dramatic genres.

Use these as pressure tests of the general-purpose engine and authoring language.

For each proposed pin, ask: What does the world know? What can the character perceive? What can they actually do? What persists afterward? What is the smallest convincing demonstration?

The output of this work should be a prioritized design prospectus, not a collection of half-built systems.

---

## Phase 6 — Historical audit and obligation reduction

Audit the promises and outcomes of earlier missions against the current repository, not merely against prior reports of completion.

Reconcile the historical briefs, mission reports, inherited findings, authorial friction, skipped tests, capability audits, and consolidated register.

Classify outstanding items as:

- Verified defects to repair.
- Incomplete commitments.
- Implemented work still lacking verification.
- Design decisions already settled by doctrine.
- Genuine open design questions.
- Deliberately deferred ambitions.
- Superseded or obsolete proposals.

Close completed work with evidence. Repair high-leverage defects as resources permit.

Do not use "blocked on design" as a substitute for exercising engineering or aesthetic judgment.

Where a substantial new decision is genuinely necessary, produce a recommendation with the relevant prior rulings, tradeoffs, and a small experiment that could discriminate between alternatives.

**Aim for zero unaccounted obligations, rather than pretending the project has no remaining ambitions.**

Keep the register current and ensure every new finding has a meaningful disposition.

---

## Execution order

Please propose a concrete working plan after the orientation, but I suggest this sequence:

**First:** Read the design and mission sources, reproduce the present opening, measure its costs, and identify the current interaction conflicts.

**Second:** Establish the precise semantic and input contracts for the primary action and opportunity indicator. Prototype and compare materially different treatments, using live behavior rather than isolated stills.

**Third:** Land the most promising treatment as one coherent interaction across the opening and representative gameplay situations. Test the same actions through the terminal and headless runner.

**Fourth:** Improve the actual first-touch performance and continuity; record the full opening again and seek independent judgment.

**In parallel:** Run the SRD/authorability proofs, opportunity census, independent authorial investigations, and historical audit with explicit budgets and incremental outcomes.

**Finally:** Produce an honest account of what improved, what remains partial, what evidence supports acceptance, and what design or engine work should shape subsequent missions.

Do not let documentation and research displace code, or code displace the actual experience of playing.

---

## M22 acceptance

The mission's primary outcome is not that an action-button component has been restyled or that the title looks more polished.

It is that **entering Westernesse and choosing what to do feels unmistakably like participating in a beautiful, responsive game**.

I want:

1. An independently reviewed, unedited deployed recording of the first fifteen seconds, first minute, and entrance into actual play.
2. A coherent, well-tested primary interaction that transfers from title and creation to exploration, conversations, maps, combat, and repeated ordinary actions.
3. A normative, implemented Color Atlas opportunity-indicator specification, with the restricted semantic palette and carefully evaluated expressive dimensions.
4. Measured performance improvement where startup or response latency materially interferes with play, or an exact technical account of a remaining bottleneck.
5. Real progress in at least a bounded subset of the SRD/engine, authorability, opportunity-density, and backlog work, measured by executable behavior rather than claims of coverage.
6. A reconciled obligations register and a useful set of design recommendations for the next mission.

Do not claim that a beautiful recording proves the first hour is compelling, or that a successful headless walker proves a human enjoys the game. Record those separately.

M22 should preserve M21's technical advances, deepen our understanding of the intended game, and give us something unusually satisfying to operate.

**The player should feel that the controls have almost disappeared, leaving them with an inhabited world, a handful of meaningful possibilities, and the pleasure of choosing what happens next.**
