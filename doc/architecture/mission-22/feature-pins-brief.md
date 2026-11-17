# Feature pins: a table-stakes test skeleton (the owner, 17 November 2026)

The owner's request, in their words:

> I keep thinking it would be nice to nail down 'feature pins' as a high-level test skeleton helping us get our bearings
> on the overall effort and understand where negative space is. We tried a similar version of this before but seemed
> just to _map_ features onto existing tests; I think the idea would be to introduce a new test structure that spins up
> as much of the environment as needed (or as little) to cover a behavior narrowly. But the idea is that the success of
> the suite would indicate table-stakes features are being met -- maybe a structure like this could help -- it's maybe
> not obvious how to validate all of them but the effort of constructing scenarios seems worthwhile and a good test of
> engine completeness.

The feature list the owner gave (verbatim, with their bracketed notes) follows.

## 📖 Narrative & Prose

This is the defining pillar—the “literary” in literary high fantasy. The text is not a delivery mechanism for mechanics; it *is* the experience.

**Second-person, present-tense narration (or a deliberate, consistent alternative).** Interactive prose conventionally uses “you” to drop the reader into the protagonist’s perspective. The narrative voice must be sustained across thousands of words, with a tone appropriate to high fantasy—often mythic, evocative, and rhythmically varied.

**Rich sensory description and atmospheric density.** High fantasy readers expect immersive worldbuilding through prose: sight, sound, smell, texture, and the weight of history in a place. Descriptions must be substantial enough to build a world but disciplined enough to avoid “purple prose” that stalls pacing.

**Consistent world logic and internal rules.** Magic, politics, geography, and social structures must operate by coherent principles. In a purely textual game, continuity is critical to believability; contradictions shatter immersion instantly.

**Character voice and dialogue systems.** NPCs need distinct registers, motivations, and linguistic fingerprints. Dialogue is a primary vehicle for both characterization and worldbuilding in text-based games.

**A codex, glossary, or compendium for world lore.** High fantasy worlds are dense with proper nouns, factions, histories, and creatures. A searchable or browsable in-game reference is table stakes for helping players retain and engage with that density without leaving the game.

---

## 🎭 Choice & Consequence

The “RPG” half of the equation lives here. Literary prose without agency is a novel; table-stakes RPG choice design requires that the prose *responds*.

**Meaningful branching at multiple scales.** Choices must range from the dramatic (spare or kill a villain) to the mundane (how to spend coin, which order to visit settlements). Note “fluff” choices—small moments that let the player state what their character thinks—are as important for role-play as epic decisions.

**Visible consequence tracking.** The world must remember. Spared enemies should reappear; broken promises should resurface; reputations should shift access to quests, prices, and dialogue. A decision-history engine—whether explicit or hidden—is the mechanical backbone of this promise.

**Reputation and relationship systems.** Factions, settlements, and individual NPCs should track the player’s standing. These systems need not be numerically transparent, but their effects must be legible through changed greetings, altered dialogue options, and shifted quest availability.

**Multiple endings or ending states.** Branching narrative without divergent conclusions feels hollow. Table-stakes does not demand infinite endings, but the final state of the world and the protagonist should reflect the accumulated weight of play.

**Free-form input or a hybrid choice system.** Numbered choices are the baseline, but literary RPGs benefit from allowing players to type actions outside the presented options. This preserves the feeling of a responsive narrative rather than a menu-driven story. [Special command interface to drop down to text? Freeform command parsing?]

---

## 🧙 Character Systems

The player’s build must matter in a world that is judged by its prose. Stats and skills are not separate from the story; they are lenses through which the story is filtered.

**Character creation with meaningful differentiation.** Race, class, background, and traits should shape starting stats, available dialogue, and solutions to problems. A D&D-inspired creator—choosing class, race, traits, and signature abilities—is a common baseline.

**Stat checks woven into narrative moments.** Persuasion, insight, lore, stealth, and similar checks should appear inside dialogue and exploration, not only in combat. The result of a check should alter the prose, not just a number.

**Skill and attribute progression.** Players need a sense of growth. Attribute points, skill points, or equivalent progression should unlock new narrative options—ways to talk, climb, decipher, or sneak past obstacles.

**Inventory and equipment with textual presence.** Items must have descriptions, uses, and narrative weight. A sword is not just a damage value; it has a history, a maker, or a reputation. Inventory management should feel like part of the literary world, not a separate spreadsheet.

---

## ⚔️ Conflict & Challenge

Even a prose-first RPG needs stakes, and in high fantasy those stakes are often violent, magical, or both.

**A functional combat or conflict-resolution system.** This need not be a full tactical wargame, but encounters must have meaningful outcomes, resource costs, and consequences. Turn-based combat, stat-based resolution, or narrative “conflict” systems all qualify—so long as the player’s build and choices matter.

**Spells, abilities, and special maneuvers.** Magic is a genre expectation. Spells and abilities should have both mechanical effects and textual descriptions that reinforce the world’s magical logic.

**Creatures and adversaries with lore integration.** Encounters should connect to the world’s ecology, politics, or mythology. A compendium entry for a creature—its habits, weaknesses, and cultural role—turns a stat block into a piece of worldbuilding.

**Difficulty options or transparent stakes.** Players should understand what is at risk in a given encounter. Whether through explicit difficulty modes, permadeath options, or clear narrative framing of danger, the game must communicate consequence.

---

## 🗺️ World & Exploration

High fantasy is a genre of maps, journeys, and ancient places. A text-driven RPG must make exploration feel spatial and discovery feel earned.

**A structured world with locations that reward reading.** Rooms, regions, and settlements need distinct descriptions, connection logic, and landmarks. Exploration should be driven by curiosity about the prose as much as by quest markers. [Maybe icons for each hierarchical layer: worlds, countries, regions, city/wilderness hex, building or structure icons; present whenever the relevant entity is mentioned]

**Non-linear or open traversal.** Players should have meaningful freedom in where to go and in what order. This does not require a fully open world, but it does require that the world does not feel like a single corridor of text. [Hex crawl answers _some_ but not all of this; and there are some pretty dense defects around the world map to address -- eg a traversal needs to reveal the land _as_ you traverse, not as an afterthought; in general open-ended exploration as an activity in specified regions should be implemented as one of the core action types, and it should roll on a table to see what you find; but similarly just crossing into a new hex should also be a lottery etc. You should get XP for revealing hexes, and ultimately there should be a paragon quest with a Cartographer's guild that rewards you for exploration]

**Environmental interaction and puzzles.** Examinable objects, hidden clues, and logic or knowledge-based puzzles are table stakes for text-based exploration. Puzzles should integrate with the story rather than sit apart as minigames. [More puzzles than riddles does seem important; I don't think we even have a key-based dungeon challenge yet]

**A map or navigation aid.** Even a simple textual map or location list helps players hold the world in their minds, especially when the prose is dense. [We will likely want a 'strategic' map view of countries as the final zoom-out layer, as well as a middle-ground 'hex view' which zooms into a specific hex shows local POIs]

---

## 🖥️ Interface & Persistence

The mechanical shell around the prose must not get in the way of the literary experience.

**Choice-based input with clear feedback.** Numbered or lettered options are the standard. The interface should make it obvious what is selectable and what the consequences of selection might be, without breaking the prose voice.

**Save/load and session persistence.** Players need to be able to leave and return without losing narrative momentum. Autosave or chapter-based saving is acceptable; the key is that the text-based experience respects the player’s time.

**A journal, quest log, or recap system.** Long-form prose is easy to lose track of. A lightweight journal that records key decisions, open threads, and recent events is essential for keeping the player oriented.

**Accessibility and readability controls.** Font size, contrast, text-speed (if text is revealed progressively), and content warnings are baseline expectations for a text-heavy experience.

---

In short, the core feature list for a text-driven literary high-fantasy RPG is: **prose that earns the “literary” label; a world that rewards attention through a codex and consistent lore; choices that are tracked and consequential across scales; character stats that open narrative doors; conflict systems that feel integrated rather than bolted on; exploration that treats locations as texts to be read; and an interface that stays out of the story’s way.** Without any one of these, the game may still function—but it will feel like it is missing a load-bearing pillar of the subgenre.

## The structure (the lead's design, 17 November)

- `test/features/<pillar>/<feature>.pin.test.ts`: one file per table-stakes feature, each a narrow scenario that builds
  only the world it needs (a tiny Kyr fixture through `Tiny`, a generated region through `Glanced`, the page's
  projection through the reader's own models), and asserts the behaviour a player would recognize.
- A feature is **met** (its pins pass), **partly** (some pass, the rest written as `it.failing` naming what is missing),
  or **missing** (only `it.failing` pins: the negative space, each a minimal proof of what the engine cannot yet do).
- `bun scripts/feature-pins.ts` runs the pins and writes `doc/architecture/feature-pins.md`: the matrix by pillar,
  each feature's state and its missing behaviours. A missing pin that starts passing is a feature met: it fails its
  `it.failing` and must be promoted, so the matrix cannot quietly fall out of date.
