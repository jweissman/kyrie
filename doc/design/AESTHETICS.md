# Kyrie / Imbar — Aesthetic Doctrine and Interaction-Design Playbook

> **Thesis:** Kyrie should feel like a beautifully composed work of contemporary literature that has become inhabitable, responsive, and dangerous. Its interface is not a control room for the simulation. It is the form through which **one situated person attends to a world, forms intentions, and experiences their consequences**.

## 1. The product we are designing *for*

A person enters Imbar as **one particular protagonist**, with a history, capabilities, possessions, relationships, and an immediate reason to act. Others may accompany them later because of who they are and what happens, not because the opening requires filling party slots. The world existed before them and will continue after they leave. It may be strange, beautiful, funny, alarming, prosaic, or intellectually demanding. Its people and places have material and historical reasons for existing.

The player is not principally sorting data. They are **looking, recognizing, questioning, imagining a plan, attempting something, enduring consequences, and returning with changed knowledge**. The interface must make this emotionally and intellectually pleasurable over a sustained evening of play.

A good opening should make the player feel *I am someone, somewhere, and something matters to me*—not *I need to learn the application's taxonomy*. A good map should let the player feel *I know how to get there, though I may not know what awaits*—not *I need to reverse-engineer a graph*. A good encounter should make the player feel *I understand the danger and can decide what to risk*—not *some invisible process is spending my companion's life*.

The aesthetic goal is not minimalism for its own sake. The game must retain the full pleasures of an RPG: complex people, reading and interpretation, spells, equipment, dangerous physical mechanisms, treasures, monsters, multiple routes, recovery, and occasionally dense tactical decisions. **Complexity belongs in the world and the decisions. The interface should reveal it at the appropriate moment.**

## 2. A positive visual doctrine: bright literary modernism

This phrase is an art-direction **starting point**, not a proprietary style name or a rule against variation. It recalls the graphic intelligence of a well-designed contemporary book, literary magazine, exhibition catalogue, or modern Scandinavian editorial object. It does **not** mean imitating parchment, leather, old paper, medieval lettering, terminals, faux manuscript decoration, beige-on-brown austerity, or geometric corporate dashboards.

### 2.1 The page is an invitation

Use open space and strong proportions. The screen should feel composed, generous, and intentional. Empty space is not a bug to fill with cards; it is what allows a place name, a line of dialogue, a small illustration, or a consequential choice to matter.

The **primary reading surface** should be unusually good. Beautiful typesetting—measure, rhythm, line height, contrast, paragraph breaks, emphasis, and intelligent wrapping—matters more than elaborate ornament. A reader must be able to remain in the game for hours without fighting the typography.

Use at most a small number of type voices: a serious, humane face for extended reading; a clear supporting UI face if needed; perhaps a distinct but restrained treatment for small labels and wayfinding. Do not use unfamiliar display fonts merely to advertise fantasy, and do not let typographic effects obstruct legibility.

**Illustrative starting dimensions, not sacred tokens:** normal text roughly 17–19px on desktop with generous leading; a reading measure approximately 55–75 characters for sustained prose; smaller labels reserved for peripheral metadata, never essential warnings or action names. Check phone width rather than scaling desktop miniatures.

### 2.2 Neutral foundations, confident color

The user's clarified direction is **white and near-black, with sparse but vivid red, blue, and yellow**. Restraint concerns how many decisions appear at once, not a mandatory reduction in saturation. A strong blue on an otherwise white page may be calmer than six subtly differing taupes.

An *illustrative palette to explore*, not a final brand system:

| Role | Example | Discipline |
|---|---|---|
| Paper / light | `#FFFFFF` or a nearly white neutral | Clean reading canvas; avoid default parchment tint |
| Ink | `#151515` | High legibility and strong contrast |
| Blue | `#176BEE` | One expressive accent, perhaps navigation or active attention |
| Red | `#E73535` | A vivid accent that must not be the sole carrier of danger |
| Yellow | `#F3C82E` | A concentrated note of warmth, discovery, or emphasis |
| Quiet neutrals | a short grayscale ramp | Structure without multiplying framed boxes |

**Do not assign those three chromatic colors a rigid game-mechanical meaning without testing.** Red cannot simultaneously mean an active route, a dangerous threat, a failed skill check, and a character's personality. A particular visual mark must have a stable and explained meaning. Color alone never communicates risk, availability, or identity.

Subtle **OKLab-based gradients** may contribute atmosphere or a sense of light, but only selectively. Avoid gradients filling every card, and avoid turning each location's weather into a new application theme.

### 2.3 Images are editorial decisions

Portraits, landscapes, cartography, and atmospheric imagery can be wonderful. But an inappropriate portrait is worse than no portrait; stock or mismatched art can make a character less believable. Images should have appropriate identity, authorship/licensing, period, tone, crop, and visual consistency.

An illustration must have a purpose: locate a place, establish a person, enrich material atmosphere, clarify architecture, or give an exceptional event its proper gravity. It should not exist to populate an otherwise empty rectangle. The design must remain complete and attractive when no appropriate image is available.

**Do not make darkness a theme switch.** A cellar can be dark in the fiction while the interface retains a beautifully legible reading surface. Dark fighting screens, night palettes, and full-bleed images are deliberate dramatic choices, not automatic consequences of the environment's lighting state.

### 2.4 Rhythm is part of the design

Not all moments should occupy the same visual importance. Ordinary walking may receive a concise transition. A difficult conversation may take the whole stage. A newly discovered inscription may invite unusually close reading. A fatal combat result may demand stillness and an exact account. A cosmological revelation may deserve a rare exceptional composition.

Avoid permanent theatrical intensity. A peaceful morning in a market should be allowed to be simply pleasant. A startling revelation becomes more powerful because most of the world has been allowed to remain ordinary.

## 3. The organizing concept: a continuous field of attention

**The player is always somewhere; their attention is on something; they can shift that attention without losing the world around it.** This is a proposed organizing model for both UX and presentation state.

At any moment, distinguish four questions:

1. **Where am I?** The continuous situated context: location, meaningful time, immediate circumstances, and the protagonist's orientation.
2. **What am I attending to?** A person, feature, text, way, encounter, map, inventory item, memory, or potential action.
3. **What am I considering doing?** A visible intention, with relevant actor, target, resources, cost, uncertainty, and risk.
4. **What has just happened?** The actual event, precise words spoken, salient mechanics, and new state or knowledge.

These are **responsibilities**, not four permanent panels. A composition may foreground one and keep the rest available in compact, unobtrusive forms. Focus should expand and recede naturally. There is no requirement for persistent Adventure / Party / Notes tabs, multiple full-height panes, or a permanent sidebar.

**Continuity invariant:** When the player inspects a speaking door, reads its inscription, listens, and returns to the corridor, they should not experience four unrelated applications, lose the door, forget what was just read, or have the inscription replace the corridor's scene description. The interface changes focus, not worlds.

**Return guarantee:** A clear, predictable way to return from focused examination to the containing scene should remain available, with the subject and last important result still identifiable. Avoid nested modal archaeology.

### A proposed visual grammar

- **Scene:** The readable place and its salient circumstances. Usually the main composition.
- **Subject:** A focused person, artifact, passage, manuscript, mechanism, or situation; opens *within* the current context.
- **Intention:** The selected approach to the subject, with a concise preview where needed.
- **Result:** The completed action's meaningful effects, retained long enough to be understood; it does not disappear beneath refreshed scenery.
- **Reference:** Known geography, party details, inventory, and Notes are accessible when relevant, without insisting on equal visual prominence at every moment.

This is an **interaction model**, not permission to reimplement the simulation inside the client. World truth and action resolution remain authoritative in the engine.

## 4. Three different activities must feel different

The existing design frequently treats travel, exploration, and interaction as variations of one big navigation/menu problem. They share a world, but require distinct forms of attention.

### Travel: going somewhere you know how to reach

Travel through *known* geography should usually be assisted. The player selects a comprehensible destination or route, sees an intelligible itinerary and known costs, and commits to traveling. The world advances by the real duration. Relevant interruptions, changed conditions, meetings, risks, or discoveries stop the journey and require a new decision.

A route is not a teleport. Nor does it need to be twenty rote clicks.

**Good:** “Follow the western road to the mill — about two hours; the flooded crossing may delay you.” **Poor:** “Road through Ebarukaetz” duplicated twice with different unexplained durations, requiring repeated anonymous arrows.

A rumor that supplies a place name but not precise coordinates may produce *an approximate destination* and an actionable line of inquiry. Do not collapse uncertain geographical knowledge into a false precise pin.

### Exploration: finding out what unfamiliar space contains

Exploration is a purposeful encounter with uncertainty. Here spatial distinctions matter: this door, that staircase, a shaft, the side gallery, an obscured path, a route back to safety. The player should gradually develop a mental map without being shown secrets or forced to memorize nameless connections.

Use directional and spatial language consistently where authored. Distinguish site maps from regional maps; a cave's schematic graph is not a measured floor plan. Allow loops, alternate routes, thresholds, verticality, hidden links, obstacles, and return.

A map is an **instrument of thought**: where am I, what do I know, which possibilities remain, how do I return? An elegant text itinerary or discovered-connection list may be better than an inaccurate graphic.

### Interaction: attending to a particular thing

Conversation, reading, searching, manipulating, examining, fighting, and choosing a course of action are **local interactions**, not routes between UI pages. Treat them as changes in attention within a recognizable situated context.

If the player has turned to inspect a casket, the important screen is the casket and its available interventions—not a panoramic map, global task list, and twelve unrelated menus. If the player is speaking with a priest, the main subject is the priest and what is being said—not a compact settings-style list of dialogue endpoints.

The ordinary gestures **inspect, select, preview, commit, observe result** must be semantically distinct. They do not require five clicks. An explicit, fully described safe action can commit in one activation; opening a person's portrait or examining a label should not initiate an attack or buy treatment.

## 5. Concrete patterns for the principal moments of play

### 5.1 The opening: enter as somebody

A very simple public title: name or provisional title, a short invitation, and *Begin*, *Continue*, and *How to play* (if useful). No registry vocabulary, debug launchers, seed menus, or list of capabilities competing with the invitation. A direct authored-campaign start can exist as an optional alternative, not the primary explanation of the world.

On Begin, establish **one protagonist**: enough about their past, present concern, possessions, and immediate surroundings for a reader to have a reason to act. An origin choice may vary the identity or arrival; avoid compulsory assembly of three characters and six screens of statistical customization.

In the first few minutes, place the player within an encounterable relationship and offer a **credible opening possibility**, not necessarily a quest marker. The opening should be comprehensible without explaining the whole simulation.

### 5.2 The place: a readable literary scene

Put the place's character at the center: a meaningful title, one sharply observed paragraph or several short ones, the people/objects/ways the protagonist can perceive, and only the truly urgent context. Rich prose should make physical promises the game can honor. The scene should have room to breathe.

Use distinct editorial treatments for *things here*, *people here*, and *ways out* only if that distinction improves comprehension; don't automatically render each as a deck of equal-sized cards. Avoid a dozen competing portrait tiles and thirteen exits presented as equivalent objects.

When the player acts, don't replay unchanged paragraphs by default. Preserve the result and update the relevant description.

### 5.3 The person: conversation as an encounter

Entering conversation should focus on the person and their **actual speech**. Keep a sense of who they are, where this exchange occurs, and what just prompted the response. Let topics develop, not merely vanish after a single selection. Repeated inquiry can receive a brief contextual response; meaningful follow-ups should remain possible where authored.

Differentiate an innocuous question, an offered promise, payment, lie, threatened act, or consequential social commitment. Dialogue controls should read like genuine conversational intentions rather than predicate IDs or purchase ledgers. A companion's remarks should sometimes be unsolicited but not formulaically repeated.

Do not replace exact authored lines with “Kildrak tells you about...” in the Story. The same words spoken remain available for rereading later, with provenance and time.

### 5.4 The object, document, and mechanism: close reading

An artifact can become the dominant subject of the page. Show its actual physical state and the details the protagonist can perceive. Reading an inscription should be a continuation of examining the object; after reading, the player can still look, listen, try a tool, or step away.

Support the distinction between *examining currently visible detail* (safe) and *taking time to search, decipher, test, or manipulate* (a real action). Let the protagonist's language, education, profession, and companions affect what the text means to them. Don't silently give everybody a full translation of a script that the protagonist came to copy.

If the interface offers “Listen at the door,” the reply must recognize that door and the observation; “You carry out the action” is unacceptable. An action can genuinely reveal nothing conclusive, but its response should still be causally and sensorially appropriate. Suppress a global action if the described place cannot support its apparently relevant use; authors may intentionally expose a failed manipulation when the failure itself is informative.

### 5.5 The road and map: a journey, not a graph debugger

A known road can be rendered as a clear itinerary; selecting it reveals duration, known danger, source and age of knowledge, needed means, and destination. A rumored site should produce either usable approximate directions or a concrete way to learn more.

Maps may be graphical, typographic, or mixed, but must distinguish **here / known / visited / traversed / reported / unknown** appropriately. They must not invent coordinates or reveal the hidden significance of an object through an omniscient tooltip. Labels for alternative ways must remain distinct. A town mentioned in a contract should be findable through its corresponding information.

An interruption is not just a hazard icon. If a road can kill Wenna, the player needs a recognizable causal event, a choice or clearly explained unavoidable effect, a readable condition change, and a means of understanding what is now possible. Do not have hidden damage accumulate inside generic route execution.

### 5.6 Combat: concentrated, trustworthy attention

Combat should temporarily recompose the central stage around **participants, intentions, threats, resources, and the next decision**. A clear JRPG-like arrangement of opposing sides may be preferable to unneeded maps or grids. If spatial zones are genuinely mechanical, present them where they change decisions. Do not introduce geometry merely for spectacle.

Always display the relevant current actors and urgent conditions, accessible ability descriptions (not hover-only), meaningful target distinctions, and known imminent threats. Resolve one action in an understandable chronology: intention → action → roll/effect where appropriate → mitigation → condition → outcome. Show who acted and who was affected. Keep the chosen last action visible when transitioning to victory, retreat, or defeat.

A retreat must tell the truth about whether it succeeded and where everyone went. A fallen protagonist must not vanish from their own obituary. A dead companion is a fictional and mechanical consequence requiring accurate report, not a tiny bar decreasing offscreen.

### 5.7 Return, recollection, and continuation

The return is a major dramatic moment. The game should show changed conditions through the **same people and places**, not only a success toast. Notes should preserve witnessed versus reported events; the Story should preserve actual speech and significant action results through saves.

The UI should help the player answer: What have I discovered? Whom did I leave? What was promised? What remains uncertain? What changed while I was away? What could I do next?

Do not make Notes omniscient. A rumor is a rumor; an offstage event becomes knowable through credible evidence. A quiet familiar street and one altered line from a familiar person may be more moving than a large quest-completed banner.

## 6. Interaction mechanics: the visible contract

This is a UX contract, not a new implementation architecture.

**Selection should be reversible.** Looking at a person or object is not consenting to a dangerous or paid action.

**Commitment should be explicit.** Significant irreversible actions name the action and its known stakes before execution. A fully clear short action should not require redundant confirmation.

**Uncertainty should be honest.** “Dangerous creatures reported on the pass” is not the same as a guaranteed ambush or a hidden exact enemy stat block. Color, probabilities, warnings, and source must not contradict one another.

**Results should persist through transitions.** Show what actually happened, not a generic fallback that buries the consequence underneath the refreshed scene.

**Options should have coherent granularity.** Don't place “Look,” “Take,” “Travel 2 hours,” “Attack,” “Pay 50 coins,” and “Listen” in one undifferentiated list. Group according to the situated subject and intention, not the engine's verb registry.

**The player must never have to reconstruct hidden program structure.** Avoid duplicated action labels, unexplained internal names, button text that looks like database records, or object-specific actions hidden behind generic global menus.

**Focus must be stable.** Mouse hover must not remount content, move buttons, or change meanings unexpectedly. Keyboard, pointer, and touch should reach the same meaningful interactions. The back affordance must restore an intelligible previous context, not secretly rewind game state.

**Time and consequences belong to the fictional action.** Reading an already-visible label costs no hour; deciphering an ancient text may. Spell preparation that takes an hour must be labeled before the player agrees.

## 7. The compositional challenge: three materially different prototypes

Do not begin by styling the current screen hierarchy. First sketch or prototype three genuinely different ways to compose **the same fixed sequence of events**. The full event content and available actions should remain identical, so the comparison tests presentation rather than different games.

**A. The literary page.** Primarily typography, proportion, rich but disciplined prose, compact situated labels, context-sensitive actions, and reference details summoned when needed. No portrait, map, or atmospheric image in the baseline. This is the **first, deliberately hard experiment**: can the game be understood and enjoyed with nothing but well-composed text and a few colors?

**B. The inhabited scene.** The same literary content with a carefully selected portrait or scenic image, stronger editorial distinction between foreground subject and contextual place, and maps available for genuine spatial questions. Illustration never displaces practical information.

**C. The traveler’s folio.** The same events organized around an itinerary and gradually assembled known-world record: strong route affordances and places as anchors, with close reading/conversation taking central focus when needed. More explicitly cartographic, but never a global graph viewer.

These differ in how attention and geography are composed—not just background colors. They may yield a **hybrid final direction**, but only after comparing real tasks. Avoid an architecture migration before a serious examination of these alternatives. If a prototype is obviously poor, discard it rather than implementing it for completeness.

### Fixed test sequence for all three

Use identical content and choices to play:

1. **Arrival:** a situated person with a small immediate concern, one recognizable relationship, and a route lead.
2. **Conversation:** hear a precise warning and ask a consequential follow-up.
3. **Travel:** follow directions to a known landmark; see what is not yet known; encounter a meaningful interruption.
4. **Investigation:** examine, read, and manipulate one object without losing the enclosing scene.
5. **Danger:** understand a threatened character and either act tactically, avoid, or withdraw.
6. **Return:** hear what changed, preserve a result in memory, and choose a next intention.

Test at full desktop size, a mid-width viewport, phone width, keyboard-only, and reduced-motion/image-absent presentation. The main test is whether a fresh player understands **what they are doing and why** while finding the composition pleasurable to inhabit.

## 8. Actual visual evaluation, not aesthetic self-certification

An interface can be correct and unpleasant. It can also be beautiful in a screenshot and exhausting to play. Both must be assessed independently.

Evaluate **usability**: can an unfamiliar player state where they are, what they are looking at, what they can do, what the cost and danger might be, what changed, and how to go back? Can they follow a lead to an adventure without relying on developer knowledge? Can they survive or fail for understandable reasons?

Evaluate **aesthetic quality**: Is the typography enjoyable for prolonged reading? Does the hierarchy feel composed rather than assembled? Is color vivid but economical? Are images appropriately selected and placed? Does the page create atmosphere without forced effects? Does the scene remain coherent as focus shifts? Would a person want to spend an evening here?

Evaluate **fictional integrity**: Are words, names, locations, perceptions, actions, and reported results accurate? Are attention and prose spent on meaningful details? Does an offered interaction reward attention rather than suppress it?

Evaluate **performance and accessibility**: Does the surface remain responsive as world and history grow? Can someone access essential information without hover, color discrimination, or precise pointing? Does reduced motion preserve orientation? Is important text readable without scrolling through a maze of panels?

Use at least one independent unfamiliar player/critic after a designer walkthrough. The builder's satisfaction with its own screen is not evidence of visual success. Record specific disagreements and the evidence behind them; do not pretend aesthetics can be graded through an arbitrary universal score.

### Suggested passing demonstrations

- In **under ten minutes of ordinary play**, the player knows who they are, where they are, and one genuinely interesting thing they might investigate. This is a qualitative orientation test, not a forced tutorial quest.
- A previously unknown but discoverable authored adventure can be reached through in-world information; no guessed hidden edge-stone, `?dev`, or repeated ambiguous arrows.
- A speaking door can be examined, its inscription read, and its mechanism investigated while the **object remains the focus** and the enclosing place remains recoverable.
- A companion at risk of dying receives visible causal warning and accurate, intelligible injury/aftermath reporting. No miniature unexplained red dot stands in for danger.
- The player can explain the difference between visiting a place, knowing a report of it, and having traveled a route to it.
- After an authored exchange, exact significant dialogue and results remain available through a save and restore.
- At narrow width and without images, the game still appears deliberately composed, not like a broken desktop app.
- One independent critic can identify **a visually beautiful moment**, **a memorable person**, and **an interesting discovery**, with concrete reasons rather than compliments about polish.

## 9. Antipatterns to reject

- **The all-purpose dashboard:** several permanently open panels of map, actors, inventory, choices, log, conditions and lore. It displays systems, not attention.
- **The decorative book:** parchment, seals, flourishes, medieval-looking headings, and ornate borders substituting for real editorial composition.
- **Minimalism by starvation:** stripping away the mechanics a player needs to judge risk, spells, equipment, target selection, and navigation.
- **False Scandinavian restraint:** gray and cream everywhere, square borders as the principal design language, timid low-contrast badges, and overly geometric novelty typography.
- **Fantasy as constant darkness:** changing the whole app's mode for each gloomy place, making essential information difficult to read, confusing atmosphere with low contrast.
- **The global verb catalogue:** attaching every feasible-looking command to every object so that “Listen” and “Look closely” habitually answer “Nothing comes of it.”
- **The premature map:** a diagram of internal edges that is neither geographically truthful nor useful to a traveler.
- **The vanishing event:** a good authored reply or final blow overwritten by a new screen or generic Story line.
- **The cosmetic response:** making an ignored choice look attractive while it still does nothing meaningful.
- **The automated beauty verdict:** green checks for spacing and responsive layout being used to claim that the page is artistically successful.

## 10. What Priority III should deliver

The mission need not finish every long-term feature. It should, however, deliver **a coherent interaction and compositional direction demonstrated in playable software**, not merely a moodboard or a restyled set of current screens.

Recommended sequence:

1. **Audit the actual attentional and navigation failures**, including the owner's play sessions, the independent cold report, and representative authored adventures. Keep correctness bugs distinct from presentation defects, while recognizing their interaction.
2. **Write a very short art-direction sheet** and choose a provisional typographic/color system, without allowing those tokens to dictate layout.
3. **Prototype the same six-moment journey in two or three genuinely different compositions**. Include a purely textual approach. Do not stop at title-screen mockups.
4. **Select a direction through critical review** of beauty, clarity, fictional coherence, and sustained interaction. State what was rejected and why.
5. **Implement one complete ordinary-player journey** through arrival, meaningful social contact, directed travel, focused investigation, understandable risk, and consequential return. Preserve the ability to start as one person.
6. **Carry the interaction grammar across the actual game**, not merely a showcase: ordinary places, conversations, object inspection, navigation, combat, party and pack when they become relevant, Notes, save/resume.
7. **Verify by cold play and screenshots across the real journey**, not only isolated components, tests, or the number of panels removed.

### Deliverable package

- One-page **visual doctrine and interaction model**, incorporating or critically revising this proposal.
- Comparative compositions using the same fictional content, including the rejected approaches and reasons.
- Final interface patterns for opening, place, person, object, route, battle, memory, and return.
- Working ordinary-player journey showing these patterns, plus desktop/mobile/keyboard/image-absent checks.
- Evidence of actual design criticism: what remains ugly, confusing, or insufficiently literary, not just what was technically implemented.
- A list of any missing **engine or authoring semantics** discovered by the design work. Do not disguise missing action consequences as a CSS issue.

**Avoid merging the conceptual phase into a giant engine rewrite.** The interface should project authoritative game state and submit actual intentions. Where the engine's public contract cannot support the intended UX, identify the smallest honest extension and test it.

---

## A compact art-direction card

**Subject:** One person encountering an enormous, particular world.  
**Feeling:** Curious, lucid, inviting, intelligent, sometimes anxious; never relentlessly portentous.  
**Visual register:** Bright literary modernism; white/near-black; scarce vivid red, blue, yellow; selective subtle gradients.  
**Typographic principle:** A beautiful contemporary reading page, not a terminal, fake medieval manuscript, or dashboard.  
**Compositional principle:** Place → attention → intention → consequence, continuously and without unnecessary screen rupture.  
**Interaction principle:** Travel known space; explore unknown space; attend closely to particular people and things.  
**Narrative principle:** World truth → situated perception → exact response → remembered consequence.  
**Map principle:** Show what the traveler knows, not what the generator stores.  
**Illustration principle:** Earn the image; absence is better than a mismatched image.  
**Dramatic principle:** Most moments are ordinary; exceptional moments earn exceptional form.  
**Test:** Would a stranger understand what is happening, find something worth doing, and want to remain?
