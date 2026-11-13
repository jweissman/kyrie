# Westernesse — Mission 19
## The Inhabitable World
### Consolidation, Playability, World Composition, and Human Authorship

The owner's brief, as given on 3 November 2026. The working notes beside it are [baseline.md](baseline.md) (the
independent assessment) and [register.md](register.md) (findings with stable ids).

**Studio:** Seventh Star
**Project:** Westernesse: A History of Emprise (formerly Kyrie), set in Imbar
**Mission posture:** A fresh principal builder context, inheriting the completed work of M18.

## Summary of the priorities

| | Priority | Gate |
|---|---|---|
| I | The mandate: a coherent, compelling, genuinely playable literary fantasy RPG | the player's sentence in XIV |
| II | Independent assessment first, short; correct clear defects promptly | baseline.md |
| III | **Priority One — the adventuring loop works** (ten steps, one continuous experience; a reference town, generalised) | journeys 1, 3, 4 |
| IV | Priority Two — the player-facing product (field of attention, settlements, travel, exploration, journal, conversation, commerce, combat, action integrity) | journeys 1, 4 |
| V | Priority Three — character identity consequential (scholar, priest, thief, magician) | journey 2 |
| VI | Priority Four — migrate and activate the existing content (operational coverage, not registry counts) | journey 6 |
| VII | Priority Five — human-scale generative authorship (languages, effects/spells, treasure, plants/animals, templates, adventures) | journey 5 |
| VIII | Priority Six — world coherence (constraints, ecology, economy, names from geography/language/history, register) | journey 3 |
| IX | Priority Seven — authoring and architectural integrity (no regex over Kyr, typed IR, provenance, no hardcoded taxonomies) | — |
| X | Priority Eight — the Encyclopedia of Imbar as a real product | journey 6 |
| XI | Architecture serves the game: no 3D first-person, naval, strategic AI, grand warfare, or cosmology expansion | — |
| XII | Validation: six player journeys through the actual interface | — |
| XIII | Working method: playability dominant throughout; register with ids; report in player-visible terms | — |
| XIV | Success: the player's sentence and the author's sentence | — |

---

The brief in full follows.

## I. The mandate

Westernesse has developed substantial technical foundations in a very short time: the Kyr authoring language, Deem generative systems, a persistent RPG runtime, a three-dimensional hex map, substantial content inherited from Orsino, independent authored adventures, and increasingly sophisticated character creation.

Nevertheless, the ordinary player experience remains far short of the intended game.

The interface is frequently cumbersome and insufficiently game-like. Navigation is confusing. Quests, encounters, commerce, and local geography often fail to cohere. Generated places can feel arbitrary or shallow. Significant authored and mechanical possibilities exist in the underlying systems without becoming perceptible or usable in play.

**M19's overriding mission is to turn these foundations into a coherent, compelling, genuinely playable literary fantasy RPG.**

This is not a mandate to shrink Westernesse into a conventional dungeon crawler, nor to abandon its extraordinary longer-term ambitions. It is a demand that the world become inhabitable at a human scale before we pursue substantial further expansion.

The project should remain capable of fear, wonder, beauty, comedy, surprise, intellectual discovery, and long lives lived within a changing world. But its immediate success depends on ordinary activities becoming satisfying: making a character, finding one's way, meeting people, pursuing intentions, adventuring, surviving, returning, and continuing.

**The governing test is not how many systems exist, but whether the player can have an absorbing experience through them.**

## II. Begin with an independent assessment

You are beginning in a new builder context. Do not assume that previous implementation claims are necessarily equivalent to demonstrated playability, but do not gratuitously redo completed work.

First, read and reconcile:

- The actual current repository, tests, documentation, and runtime.
- The final M18 report, phase-by-phase closure account, residual issue register, and any technical handoff.
- The Living Design Atlas and Aesthetic Doctrine and Interaction-Design Playbook.
- Recent independent cold-player, technical, architectural, and authoring feedback.
- The available Orsino corpus and migration records, alongside independent adventure modules.

Treat the current code and verified tests as evidence of implementation; the design documents as statements of intent; and cold-play reports as evidence of player experience. Resolve contradictions explicitly rather than silently adopting whichever document is most recent or most convenient.

Establish a concise baseline of what is implemented, reachable, usable, and genuinely enjoyable. Identify the most consequential shared causes of remaining failures.

**Do not let this assessment become a prolonged preliminary research project.** Begin correcting clear defects promptly, and continue updating the assessment as the work proceeds.

Preserve working foundations. Avoid a wholesale rewrite unless there is compelling evidence that a particular subsystem cannot support its required responsibilities.

## III. Priority One — Make the adventuring loop work

This is the decisive priority of M19.

A newly created character should be able to:

1. Begin with an intelligible identity, background, profession, abilities, equipment, and available spells.
2. Enter a settlement and understand where they are.
3. Find useful people, services, opportunities, and nearby places.
4. Acquire a reason to undertake an adventure, whether through a rumor, quest, curiosity, employment, or exploration.
5. Prepare using functioning commerce, equipment, supplies, and abilities.
6. Reach an actual mine, crypt, ruin, cave, or dungeon without fighting the interface.
7. Explore an internally coherent location with understandable passages, features, obstacles, dangers, and opportunities.
8. Use abilities, conversation, investigation, combat, magic, stealth, and other appropriate means to make consequential decisions.
9. Discover something worthwhile, survive or suffer intelligible consequences, and return.
10. Use the results of the expedition to improve their circumstances, develop their character, pursue another intention, or discover a new possibility.

This should be tested as **a continuous player-facing experience**, not ten unrelated technical demonstrations.

A single town and its immediate vicinity may serve as the principal integration benchmark. It is entirely acceptable to concentrate quality work there. This is not permission to disable the wider world, abandon the hex map, or create an unrepresentative bespoke adventure.

The reference area should use the ordinary engine and authoring mechanisms. Demonstrate that its successful patterns generalize to another location, seed, or adventure.

Do not declare the loop complete merely because every step is technically reachable. It must be understandable and reasonably pleasant to play.

## IV. Priority Two — Repair the player-facing product

The interface presently exposes too much underlying machinery and insufficiently supports the player's immediate situation.

Use the Aesthetic Doctrine's concept of a **continuous field of attention**: the player is somewhere, attending to something, considering an action, and receiving a meaningful consequence.

Give each activity an appropriate interaction model.

**Settlements and interiors:** Provide intelligible orientation, recognizable buildings and entrances, accessible principal inhabitants, clear routes, and sensible transitions. Do not bury shopkeepers or essential actions behind generic inspection menus.

**Travel:** Preserve and improve the existing three-dimensional hex map. Travel along known routes should be straightforward, with sensible time and risk information. A route should not require endless rote clicking, but neither should automated travel bypass meaningful interruptions.

**Exploration:** Unknown places should be discovered, not omnisciently displayed. Distinguish known routes from genuine investigation. The player should be able to maintain a mental model of entrances, passages, stairs, obstacles, and the way home.

**Towns and dungeons may benefit from simple architectural or schematic representations** showing their actual structure. Investigate clean spatial or vector-based approaches if they improve orientation. Do not undertake a large first-person 3D expansion or new asset-production program in M19.

**Journal and intentions:** Reconsider the current Aim system wherever it produces indiscriminate or misleading guidance. Distinguish the protagonist's knowledge, selected undertakings, known leads, and geographical routes. Familiar, competent RPG journal conventions are preferable to an elaborate abstraction that the player cannot use.

**Conversation:** Make dialogue a readable, continuous exchange. Preserve actual authored speech, meaningful choices, relevant skills and background knowledge, and the consequences of what was said.

**Commerce and inventory:** Restore sensible browsing, pricing, buying, selling, equipping, consuming, and using. Inventories should not appear as enormous undifferentiated lists. A merchant's offerings and interests should accord with their establishment.

**Combat and magic:** Make encounters readable, tactically meaningful, and reasonably satisfying. The older Squaresoft/JRPG tradition is a useful influence for clarity, decisive abilities, and expressive presentation. There is no requirement to introduce full spatial tactics.

**Action integrity:** Selecting or examining something must not silently execute a different action. Costs, risks, and consequential commitments should be explicit. The outcome must correspond to the action actually chosen and remain visible long enough to understand.

Remove raw internal identifiers, duplicated destinations, contradictory labels, generic engine prose, unstable controls, and other obvious leaks from the underlying representation into the player experience.

Favor a restrained, literate, beautifully composed game interface over a generic web dashboard. Do not confuse additional panels, artwork, animations, or decoration with better interaction design.

## V. Priority Three — Make character identity consequential

The developing character-creation experience is one of the most promising areas of recent progress. The player can increasingly construct a distinctive protagonist through background, profession, abilities, and spells.

M19 should make those choices matter after the introduction.

A scholar should sometimes recognize something others cannot. A priest should have meaningful relationships with religious institutions and practices. A thief should have opportunities to use stealth, cunning, or illicit knowledge. A magician's spells should create actual alternatives in suitable situations.

These need not be entirely separate storylines. They should produce recognizable differences in perception, available approaches, social responses, and outcomes.

Test several markedly different protagonists in the same reference region. Verify that their capabilities and histories yield meaningful variation rather than cosmetic differences.

Preserve the design principle of beginning as a situated individual. Companions should be recruited through plausible relationships and events, not imposed through legacy assumptions about fixed party size.

## VI. Priority Four — Migrate, integrate, and activate the existing content

Westernesse has inherited a large body of imaginative and mechanical work from Orsino and from independent authors. M19 should make a comprehensive effort to bring this material into the actual game.

Establish an inventory and migration status for the existing corpus, including where applicable:

- Peoples, species, backgrounds, professions, classes, advancement, feats, and abilities.
- Spells, magical traditions, effects, conditions, and related mechanics.
- Equipment, treasures, artifacts, materials, and economic content.
- Creatures, plants, animals, habitats, and ecological relationships.
- Languages, naming systems, and cultural or historical material.
- Places, settlements, architectures, geographical features, and world lore.
- Major authored adventures and their associated characters, factions, institutions, and content.

Migrate as much of the available corpus as the actual architecture can responsibly support, resolving integration issues rather than silently flattening rich material into generic placeholders.

**A record existing in a registry does not mean its gameplay functionality has been migrated.**

Verify that important content can be encountered, selected, used, traded, recognized, or otherwise exercised as appropriate. Preserve expressive mechanisms and provenance, not just names and statistics.

Independent adventure modules should coexist in a shared persistent Imbar with stable identities, appropriate placement, discoverable hooks, and functioning interactions. Avoid treating them as isolated demonstrations in disconnected worlds.

Where integration exposes missing Kyr or Deem capabilities, prefer general, bounded improvements grounded in concrete authoring needs.

## VII. Priority Five — Recover human-scale generative authorship

A central purpose of Westernesse is to make the design of an enormous imaginative world accessible to human authors.

Orsino provided substantial pleasure through the careful design of generative templates, languages, effects, spells, treasures, and related systems. That capacity should be recovered and made more usable.

An author should be able to discover how a content family is defined, understand its structure, change its rules, generate examples, evaluate their quality, and test the results in the running game.

Prioritize workable authoring paths for:

- Language grammars, roots, morphology, phonology, and context-sensitive naming.
- Effect definitions, spell construction, and meaningful mechanical composition.
- Treasure and equipment families, including materials, properties, and distributions.
- Plants and animals, including habitats, behaviors, resources, uses, and ecological relationships.
- Local encounter, site, and narrative templates.
- Authored adventures, persons, relationships, institutions, and appropriate placement rules.

The entire creative process need not occur through handwritten Kyr source. Structured data, specialist editors, well-designed commands, preview tools, and generated examples may be more appropriate for particular tasks.

But author-facing systems must be coherent. They should not require routine modification of the engine to introduce an ordinary new category of world content.

At least several representative authoring workflows should be demonstrated end to end: modify a definition or template, generate a result, inspect it, validate it, and encounter or use it in play.

**The authoring interface and the player-facing world should be connected views of the same creative material.**

## VIII. Priority Six — Improve the world's internal coherence

Deem should produce places that feel inhabited and causally intelligible, not merely valid collections of generated entities.

A church should contain plausible activities and people. A forest's vegetation and creatures should reflect its ecology. A mountain's geology should affect its resources and nearby settlements. A merchant's stock and prices should reflect their trade and economic circumstances.

Develop stronger contextual and exclusion constraints for generation: not only what is possible, but what is appropriate, inappropriate, likely, rare, or dependent on particular circumstances.

Pay particular attention to:

- Repetition and sameness across generated regions.
- Plausible relationships among geography, ecology, settlement, roads, resources, occupations, and commerce.
- Encounter appropriateness and location identity.
- Coherent histories and persistent facts.
- Appropriate dramatic and literary register.
- Generative templates whose structure and outputs can be inspected and improved by human authors.

**Place-names should increasingly arise from geography, language, and history.** A forest's dominant trees, a mountain's minerals, a river's behavior, or a settlement's occupation may influence local names, mediated by the actual language and cultural traditions of those who named the places.

Names should be persistent historical facts with plausible etymologies, not recomputed whenever a landscape changes. Avoid making every name transparently descriptive or revealing resources that the naming culture could not have known.

Generated text should be concrete, restrained, situated, and tonally varied. Do not make every place ominous or mysterious. Ordinary life, humor, beauty, hospitality, and familiarity are necessary to make exceptional danger and wonder meaningful.

Keep the distinction between world truth, character knowledge, rumor, speculation, and player-facing reference clear.

## IX. Priority Seven — Establish authoring and architectural integrity

Audit structural weaknesses that make the present system brittle or difficult to extend.

In particular, inspect generated literal prose, generated or "blessed" Kyr, structural manipulation of Kyr source through regex, hardcoded content taxonomies, hidden engine defaults, and application code that writes adventure-specific source.

When manipulating Kyr's semantic structure, use parsed syntax, typed representations, or suitable intermediate forms rather than brittle text substitutions.

Preserve clear responsibilities:

- **Deem:** generative expressions, composition, variation, and structured generation.
- **Kyr:** authored playable definitions, entities, relationships, actions, effects, circumstances, and commitments.
- **Kyrie:** runtime semantics, persistent state, action resolution, and player-facing presentation.

Do not force every data structure into a single language. The requirement is that authorable concepts remain discoverable, structured, extensible, and meaningful.

Distinguish authored source, generative rules, generated instances, compiled artifacts, and persistent world state. Preserve identity and provenance.

Replace structural special cases where they obstruct ordinary authoring or play, but avoid a wholesale compiler, engine, or data-model rewrite without clear evidence and demonstrated benefit.

A single reference town may be used to prove quality; it must not become a collection of hardcoded exceptions.

## X. Priority Eight — Make the Encyclopedia of Imbar a real product

The Encyclopedia should become a beautiful, useful, player-facing reference work, accessible from the game's main navigation or title screen.

It should recover something of the imaginative appeal of Orsino's manuals: a sourcebook that makes the reader curious about the lives, places, abilities, creatures, and adventures possible in Imbar.

Include meaningful coverage of the actual available content: peoples, backgrounds, professions, classes, abilities, spells, effects, monsters, equipment, treasures, languages, geography, histories, institutions, planes, and other substantive categories.

The encyclopedia should not merely expose database fields. It needs strong organization, readable prose, coherent cross-references, and effective browsing.

Mechanical descriptions should agree with functioning game definitions. Authors and imported modules should be able to contribute entries without maintaining disconnected copies of the same facts.

**Distinguish the Encyclopedia from the character's journal.** The former is an out-of-world reference that may reveal the setting's breadth; the latter represents what a particular protagonist knows and has undertaken. Preserve appropriate protection for authored mysteries and significant spoilers.

Aim for a reference work that inspires ambitions as well as explaining rules.

## XI. Architecture must serve the game, not displace it

M19 should support the original ambitions of Westernesse: a vast persistent Imbar, many possible lives, enduring institutions, extraordinary adventures, changing history, and eventually such possibilities as naval voyages, grand political struggles, profound magical research, and journeys into strange realms or ages.

But **these are not instructions to implement all those systems during M19**.

Do not begin a large first-person 3D program, a comprehensive naval or space-travel engine, universal strategic AI, grand warfare simulation, or massive new cosmological expansion merely because the architecture could theoretically support it.

Preserve reasonable extensibility, and undertake bounded experiments only when they directly establish a needed capability or unblock existing authored work.

The priority is to realize existing possibilities, not to continually increase their theoretical number.

## XII. Validation and evidence

Maintain a small, stable set of genuine player journeys, alongside existing automated tests.

At minimum, demonstrate:

**1. A complete cold-start adventure.** Create a character, enter the world, discover and reach an adventure, prepare, explore, face consequences, return, and meaningfully continue.

**2. A second character with different capabilities.** Show that background, profession, skills, and spells affect available information, actions, or outcomes.

**3. A second location or generated region.** Show that the improvements are general and do not depend on a carefully hardcoded town.

**4. Genuine exploration.** Travel through partially known geography, discover a site, navigate its structure, and return without revealing everything in advance or losing orientation.

**5. A human-authoring exercise.** Edit or create a spell/effect, generative template, language rule, creature, plant, or similar definition, generate and inspect results, and verify that the content functions in the game.

**6. A content and encyclopedia integration exercise.** Trace representative inherited or independently authored material from its source through migration, runtime behavior, and player-facing reference.

Perform these through the actual interface and real authoring workflow wherever possible. Automated tests should support these demonstrations, not substitute for them.

Review the experience for clarity, pacing, coherence, responsiveness, aesthetic quality, and desire to continue.

Fix recurring causes rather than repeatedly patching individual symptoms.

A test passing does not prove that an interaction is usable. An interaction being usable does not prove that it is enjoyable. Report these distinctions candidly.

## XIII. Working method and mission reporting

Organize the mission so that **playability remains the dominant workstream throughout**, rather than being postponed until after a long period of migration or architecture work.

Use a bounded reference region to integrate features and test improvements. Maintain a reproducible build and seed for comparison, along with tests on other seeds and locations.

Keep a working register with stable finding identifiers, evidence, source, priority, resolution, and verification. Incorporate inherited M18 items and independent-review feedback without allowing the register to become an unlimited wishlist.

Distinguish:

- Blocking correctness or action-integrity defects.
- Systemic UX and gameplay deficiencies.
- Content and authoring integration gaps.
- Architectural weaknesses requiring bounded remediation.
- Larger ambitions deliberately deferred beyond M19.

Do not silently dismiss significant issues; equally, do not treat every large speculative feature as an overdue defect.

Report major progress in terms of the **player-visible change**, the author-visible change, and the evidence of improvement. Counts of commits, tests, imported records, and generated regions may be included, but are not measures of artistic success.

At mission closure, provide:

1. A concise account of the finished playable experience.
2. End-to-end play demonstrations and any remaining problems they expose.
3. A content migration inventory with operational coverage, not just file counts.
4. Representative authoring workflows that now work.
5. The status of the Encyclopedia and independent adventure integration.
6. Principal architectural corrections and remaining technical debt.
7. A truthful residual issue register and recommendations for the next mission.

## XIV. Definition of success

M19 succeeds when Westernesse becomes recognizably and reliably enjoyable as a literary fantasy RPG; when the existing richness of Imbar becomes accessible through play rather than hidden inside implementation; and when authors can meaningfully inspect and extend the creative machinery of the world.

A player should be able to say:

*I made an interesting person, entered a place that felt real, found something worth doing, undertook a dangerous adventure, and returned with new possibilities. I want to continue.*

An author should be able to say:

*I can understand how this world is composed. I can change its languages, creatures, spells, effects, treasures, and places. I can see the consequences of my work without having to rebuild the engine.*

The Encyclopedia should give both of them a sense of how much more exists beyond their immediate experience.

**Do not measure this mission principally by the quantity of new machinery. Measure it by the degree to which Westernesse has become an inhabitable world, a coherent game, and a usable instrument of human imagination.**

The long-term ambition remains enormous.

For M19, **land the plane**.
