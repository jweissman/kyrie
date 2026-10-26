# Kyrie / Imbar — Living Design Atlas

> **Governing idea.** Kyrie ought to be a beautiful, substantial, literary fantasy RPG in which a particular person enters an already existing world, learns to attend to it, becomes involved in circumstances that have independent histories and causes, acts with others, discovers the extraordinary through the ordinary, and returns to people and places altered by what happened. Kyr is the authorable language of its playable world; Deem contributes generative composition; neither the sophistication of the simulation nor the abundance of material substitutes for a compelling experience.

This is **not** the in-repository *Kyr Player Experience* design atlas, and it does **not** inherit that atlas's older mandates wholesale. In particular, it rejects mandatory party assembly as the initial player experience. It is not a mission backlog or an assertion that the game already works as described.

## How to read and maintain this document

Each major idea has one of four statuses:

- **Direction** — a repeatedly stated or explicitly clarified design intention to preserve in future work.
- **Hypothesis** — a promising model or technique discussed but requiring experiments and critical review.
- **Horizon** — a deliberately long-range ambition, not a current implementation commitment.
- **Open tension** — competing intuitions or unresolved architectural/artistic questions that should not be falsely harmonized.

The source record includes speculative proposals by both the user and the assistant. This atlas privileges **the user's stated intentions and corrections**, distinguishes the assistant's interpretations, and avoids promoting passing speculation to established canon. References of the form `[U189 · L44907]` denote user intervention number and starting line in the archived transcript, not source-code lines. Subsequent-context references are labelled separately.

For future readers or coding agents: **read the one-page orientation, the relevant thematic sections, and the status/tensions before drafting a mission**. Consult the original transcript for fidelity where ideas conflict. Update this document by recording changes of direction, rather than silently overwriting their history.

---

# I. Artistic identity and the experience sought

## 1. What this game is for — **Direction**

Kyrie began in a practical frustration with AI-mediated tabletop fantasy play: rules were hand-waved, module contents forgotten or improvised over, and campaigns lost continuity. The response was not merely a more powerful combat system, but a **world that remembers and obeys its rules without improvisational betrayal**. Early development explored a controlled-English effect language, generated characters, and self-testing battles; the conversation repeatedly returned to the harder problem of making those mechanisms produce interesting decisions and substantive adventures. `[U001 · L8; U006 · L1032; U012 · L1882]`

The work should unite five forms of authorship: **imaginative premises → consequential history and geography → playable circumstances → situated perception and dramaturgy → lucid interaction**. Successful play and authoring must inform the languages and engines in return. This formulation is inherited from the 22 October *Design Research and Authoring Brief* and remains an apt synthesis; it is not a substitute for the more detailed intentions below.

The desired result is neither a traditional roguelike with movement as its principal activity, nor a static illustrated choose-your-own-adventure, nor a menu-driven quest list, nor a browser dashboard that advertises the number of things the engine knows. It must remain a *game*: preparation, danger, abilities, treasures, alternate routes, enemies, friends, companions, development, and genuine uncertainty. It must also be a *work of literature*: intelligence, tone, causality, voices, ideas, humor, wonder, and dramatic shape. `[U013–015 · L2054–2229; U119 · L27832; U249 · L61362]`

### The intended feelings

A reader-player should become curious about an inhabited place, enjoy attending to its details, acquire a motive to investigate, experience real risk and occasional apprehension, encounter characters worth thinking about, make an inference that matters, see an earlier fact transformed by a later discovery, and want to continue exploring after returning home. The work should at times be intense, inspiring, strange, humorous, melancholy, or beautiful, but **not portentous or lurid by default**. `[U190 · L45153; U221 · L54227; U242 · L60283]`

## 2. A situated protagonist, not a party configuration screen — **Direction, specifically reaffirmed**

**Begin as a single, identifiable person** with a credible personal background, abilities, possessions, relationships, and proximate reason for arriving or acting. Introduce that person *before* asking the player to absorb a regional encyclopedia or complicated interface. Different origins may offer different entrances into the same wider world. `[U189 · L44907; U241 · L60132]`

The premise is not that the protagonist must remain alone. They meet others through play; some become companions. Companion recruitment is a **fictional and relational event**, not the filling of three abstract slots. A brother does not become “one of you” by shaking on it as if meeting a contractor. The player's character's social history should shape their interactions. `[U199 · L48003]`

The initial experience may contain introductory chapters, restrained storytelling, or a few consequential choices that help establish this person. But avoid an obligatory long prologue or novel-length exposition. Identity should be discovered in action as well as stated. `[U241 · L60132]`

**Explicit correction to old documents:** The repository's former prescription to create/assemble a three-person company at the outset is **not authoritative for Kyrie's opening**. Company size, recruitment patterns, and tactical differentiation remain legitimate RPG design questions; they do not dictate how a new game must begin.

## 3. The world has dignity and a life before the player — **Direction**

People must have livelihoods, obligations, interests, habits, family networks, professional concerns, pleasures, grievances, and possible futures. A settlement is not a shrine, tavern, and salt-house repeated indefinitely. A road is not simply an edge between featureless nodes. A wonder is something made or produced for a reason, used in a history, misunderstood or repurposed by successors. `[U200 · L48359; U223 · L54395; U287 · L73841]`

**Ordinary life deserves the same authorial precision as the supernatural.** Small human and animal interactions matter: if a dog is present, the player may reasonably want to pet it; if a person is angry because of a specific obligation, the encounter should recognize that obligation. Interactable scenery should not routinely imply actions that cannot be taken. `[U199 · L48003]`

This does **not** require that every incidental object be fully simulated or that every NPC possess a planner. Selectively detailed situations can be more alive than indiscriminate background simulation. The criterion is whether the apparent material and social fabric coheres under attention.

---

# II. Dramaturgy, philosophy, and narrative intelligence

## 4. Drama is causal transformation, not a list of plot milestones — **Direction**

Repeated complaints about the early modules centered on their flatness: a few objectives, one tower, a boss, and a return to town do not make an ambitious fantasy campaign. The player should need to visit places, discover evidence, form competing explanations, deal with agents who want different things, and encounter transformations that follow from earlier actions. A major necromancer should not be a small, disconnected “quest”; the scale and implication of the threat should emerge through a large and coherent world situation. `[U139–140 · L32777–33070; U219 · L53770]`

The key dramatic question is not just **what happens next**, but **what becomes possible, necessary, or impossible because this has happened?** The world need not run on authored clocks alone. Agents, institutions, tools, resources, spaces, beliefs, and contested circumstances make different futures available. The user challenged simple timer scripts and repeatedly asked how a campaign could become more than a scripted gauntlet. `[U007–008 · L1258–1356; U140 · L33070]`

A campaign can include chapters and named acts, but acts are not synonymous with rooms, travel stages, enemy tiers, or quest-completion gates. They should mark changes in understanding, alliances, power, available action, and the meaning of previous situations. `[U241 · L60132; U263 · L65109]`

**Author situations before outcomes.** Know what a character or institution is doing before the player arrives; what material constraints their actions obey; what would happen if the player did nothing; and how intervention changes later circumstances. Avoid omniscient “story controllers” that rewrite the world to preserve a plot. Some outcomes should remain surprising even to the author while still arising from coherent rules.

## 5. Against merely dialectical plot formulas — **Direction / intellectual horizon**

The conversation took a distinct philosophical turn on 25 October. The user resisted stopping at a Hegelian template of contradiction and its resolution, preferring a **differential account of transformation**, invention, individuation, and the emergence of possibilities not already implicit as simple opposites. There were connections to henology, Parmenides, Kant, Bergson, and the limits of thought and perception. `[U288–289 · L74063–74267]`

This is not a demand to implement a philosophy engine or mechanically instantiate a favored school of thought. It is a warning against simplistic story architecture and against treating philosophical traditions as cosmetic faction labels.

An adventure may resolve a conflict, transform it into another sort of conflict, generate novel alliances or institutions, or reveal that the apparently central conflict was badly conceived. A valuable play system should permit **more than winning, losing, or choosing one of two opposing ideologies**.

## 6. Music, politics, history, and the formation of people — **Horizon / thematic resources**

The user explored the political and psychological consequences of war, especially the problem of **demobilization**: how a war machine returns to civic life, with new songs, symbols, skills, loyalties, violence, and capacities for collective action. The *Oresteia* and *Antigone* were invoked alongside Greek geography, maritime circulation, civic formation, Callicles, Plato, and social theory. `[U288 · L74063]`

Music has particular interest as both a cultural technology and a means of forming collective and individual life, with reference to Plato, Attali, and Tolkien's cosmology of song. `[U289 · L74267]`

These discussions suggest powerful *possible subjects* for Imbar: returning soldiers, mystery cults, political schools, civic music, competing forms of education, emergent professions, and the reorganization of social life. They are not mandatory universal explanations of Imbar, nor rules for every adventure.

Civilizations might develop characteristic philosophical traditions through geography, economy, conflict, institutions, and transmitted practices; they should not be generated by a crude mapping of mountain = mysticism or coast = sophistry. `[U289 · L74267]`

## 7. Deep characterization as a capstone capability — **Direction**

**Kim Kitsuragi** is a recurrent reference point for the *depth, specificity, duration, intelligence, professional competence, and relational responsiveness* possible in a companion. Other references include Minsc and Boo's unforgettable eccentricity, and the extended philosophical, political, aesthetic, and psychological texture of *Disco Elysium*. The goal is neither to imitate Kim's personality nor to copy the game's ideology. `[U226 · L55043; U270–271 · L68120–68699; U290 · L74515]`

Important characters should sustain hours of situated conversation; possess stakes in institutions and places; remember earlier acts; express intellectual positions that are neither straw men nor magic-skill skins; and sometimes intervene strategically in the world. They should have distinct rhythms of speech, humor, obsessions, blind spots, and possibilities for surprising but earned change.

Dialogue and skill checks should be able to reshape both **how the player understands the world** and **how the player understands their own protagonist**. The agent must not treat “deep character” as a personality table plus affection score. `[U227 · L55287; U290 · L74515]`

**Open tension:** A reusable `kyrie new character` scaffold could make ambitious characterization achievable for authors, but over-templating may produce the very sameness it tries to cure. Strong tools should provide examples, constraints, and editable structure without prescribing a generic psychological arc. `[U270–271 · L68120–68699]`

---

# III. Imbar: an inhabitable and layered world

## 8. Cosmological inheritance — **Setting source with epistemic caveat**

The user supplied an existing Imbar cosmological account from the Orsino worldbuilding tradition. It is a **source tradition within the setting**, not an invitation to flatten all mysteries into certain narrator facts. `[U175 · L41708]`

- **Imbar** is of immemorial age, shaped by innumerable wonders. The **prima materium** binds mortal soul and body and can be manipulated through magic.
- Innumerable planes and realities exist, sometimes near in metaphysical terms while extraordinarily hard for mortals to traverse. Exceptional portals link them.
- The **Virina**, High Arbiters, are said by the Wise to have been sent by the Allfather to broker peace after divine conflict nearly unmade the world, separating the planes to permit divergent orders of existence.
- Beyond ordered planes dwell, or once dwelt, the **Varakiiri**, primordial beings associated with night beyond night, chaotic form, terrible incursions, and outer citadels of steel, glass, void-stuff, or living flesh.
- The **nine Kiritarun jewels** are said to bind the hearts or essential powers of the Varakiiri and to have participated in fastening the planes into being; traditions attribute extraordinary travel and planar passage to them.

Use mystery responsibly. A tradition told by priests, scholars, or survivors can be profound, partially wrong, politically interested, or incomplete. The setting should admit contradictory accounts and new evidence without erasing established material consequences. **Not every significant adventure needs a Kiritarun, a portal, or a cosmic confrontation.**

## 9. Deep time, succession, and the Mathematical Age — **Direction / horizon**

Tolkien's legendarium remains a principal inspiration: not just its fantasy furniture but its immense felt historical depth—layers of forgotten states, adapted architecture, linguistic residue, conflicting memories, and past civilizations whose achievements are no longer understood. `[U175–176 · L41708–41844; U223 · L54395; U287 · L73841]`

The **Aenean** language and civilization constitute one older layer. A much older **Mathematical Age** may have left devices and transformations that a contemporary fantasy society experiences as magic, but whose makers would have understood in scientific or technical terms. Later dark ages, reconstructions, empires, migrations, and ecological changes may accumulate over its remains. `[U231 · L56923; U243–245 · L60559–60906; U287 · L73841]`

Possible horizons discussed include vacuum and cosmological engineering, immense computation, ancient energy sources, ruins with working machinery, irradiated or otherwise altered wastelands, sky cities and levitating infrastructure, and high fantasy intersecting with science fiction. They should be treated as *a repertoire of coherent possibilities*, not an obligation to place a ray gun in every ruin.

**Historical generation:** Deem and the world assembly might construct antecedent societies and play selected eras forward, yielding present remains, artifacts, institutions, altered ecologies, names, and disputed accounts. The requirement is **consequential traceability**, not millions of decorative annals. A history is valuable if it explains something the player can actually observe or interact with. `[U092 · L22107; U176 · L41844; U223 · L54395]`

**Time travel** was raised as an eventual speculative capstone and explicitly marked as an *idle thought*, not an axis on which to reorganize the project. `[U271–272 · L68699–69175]`

## 10. Languages and cultural transmission — **Direction / developing system**

The separate **languages** library and its name-generation/corruption work are not ornamental. Names can encode meanings, ancestry, migration, cultural replacement, and historical misunderstanding. Deem should be able to retain an entity's name-generation/assembly trace so a later scholar, priest, or fluent companion can reconstruct components or variants. `[U089–093 · L21769–22280]`

An inferred or translated place name must not disclose the name, exact location, or historical significance of something the protagonist has not discovered. Distinguish Common-language renderings, original forms, etymologies, unreliable local translations, and extinct-language scholarship. The user repeatedly objected to UI translations leaking information that the character could not know. `[U253 · L62246]`

A potential fifth, especially ancient or difficult language and deeper linguistic puzzles have arisen in later conversation. These should involve **learning from contextual evidence, partial comprehension, and real scholarly competence**, not a universal substitution cipher or an automatic global reveal.

The world may contain meaningful cultural differences in phonotactics, professions, religion, material culture, mythology, and vernacular speech, rather than decorative random syllables.

## 11. Ecology, geography, professions, and civilization — **Direction / horizon**

Generation should include actual relations among terrain, watershed, climate, plant and animal populations, craft, settlement, commerce, law, political institutions, and belief. A dwarven mining culture and a protected elven forest should not be assigned through simplistic race clichés, but the physical and social relations can produce real adventures: extraction pierces a burial, water rights generate a dispute, or migration after disaster changes a city. `[U026 · L4757; U246 · L60984; U287–289 · L73841–74267]`

The user repeatedly sought restoration and enlargement of Orsino's wide content palette—species, backgrounds, monsters, animals, wonders, traps, plants, equipment, and abilities—but **not a mechanical migration of old JSON folders or a proliferation of special-case species templates**. `[U067 · L15842; U095–096 · L22470–22754; U197 · L47684]`

Professions could ultimately participate in a richer model of cultural and social development: how does a society differentiate crafts, sciences, offices, classes, and new ways of life? The idea of a **profession algebra** was raised as a speculative connection between game mechanics and civic formation. It remains open, not a design for an immediate class system. `[U289 · L74267]`

The larger world should encompass credible cities and states, political and economic history, geopolitics, and diverse settlement forms—not only hamlets, mines, forests, and towers. A great city should have layered wards, residents, institutions, trade, books, academies, streets, history, and problems unrelated to adventurers. `[U287 · L73841]`

---

# IV. Adventures, spatial discovery, and campaign composition

## 12. Major authored adventures are the substance, not accessories — **Direction**

A fully realized adventure should not be a three-room storylet or a sequence of quest tasks. References recur to **Colossal Cave Adventure**, intricate classic AD&D modules (including *Tomb of Horrors*), sprawling connected campaigns, *Rogue*'s overarching amulet, and *Disco Elysium*'s dense social and intellectual investigation. `[U157–160 · L38483–38848; U219–223 · L53770–54395]`

A substantial adventure may range across cities, roads, dungeons, ruins, political intrigue, remote countries, subterranean civilizations, and planes; or it may concentrate all of its richness in one immense, internally coherent site. Size is not the count of chambers but the abundance of *meaningful* reasoning, investigation, risk, character interaction, exploration, and transformation.

A dungeon should have a reason to exist, physical topology and history, architectural and ecological distinctions, loops and alternate entrances, interdependent mechanisms, secrets and clues, and the possibility of preparation, withdrawal, recovery, and return. It should reward player understanding rather than obscure command syntax. The player should encounter real enemies, traps, treasures, ingenious machines, and mysteries whose causes can be investigated. `[U140 · L33070; U221 · L54227]`

**Authored density over endless bland content.** The user imagined a large eventual library—possibly hundreds or more independent authored modules—but rejected endless shallow modules and procedural “islands in porridge.” Independent authors should produce genuinely different works, with different modes of adventure, voices, spatial structures, and dramaturgical forms. `[U250 · L61618; U255 · L62819]`

## 13. World assembly and independent modules — **Direction with unresolved scope**

The important composition problem is how an independent Kyr adventure enters a region shaped by Deem without being merely inserted into a generic hub or depending upon hard-coded builder knowledge.

The conversation articulated a **two-way composition**: a module advertises suitability (terrain, institutions, people, magic, planar setting, social or historical conditions); the assembler places it in an appropriate world; the module in turn may request or trigger additional generation of roads, people, ruins, legends, artifacts, witnesses, and social relationships. The user explicitly sought stable identities, author-visible handles for generated entities, and diegetic rumors that cross settlement boundaries. `[U122–126 · L28666–29541]`

Several modules may inhabit one region and interact through public world relations. A kingdom's scholarly court could enter into conflict with a necromancer from a completely different module; their representatives might exchange information, deploy agents, and alter the conditions of both adventures. `[U290 · L74515]`

**Do not equate that ambition with a requirement to build a universal compositor immediately.** Subsequent architectural review favored small placement contracts using existing import, country, route, and rumor facilities before expanding generality. The artistic ambition and the correct incremental architecture are related but distinct.

The key questions remain: what gets committed at module installation? What can be elaborated later? How do distinct modules make competing claims? How are stable references and ownership preserved? How does an imported actor know only what it could learn? How can the generator vary an adventure without changing the historical facts the player has already discovered?

## 14. Rumor, knowledge, and discoverability — **Direction**

Adventure hooks should travel through the world through plausible means: tavern stories, returning expeditions, a scholar's notice, a religious institution, merchants, guides, accidental physical discoveries, or testimony brought from another region. A module should own distinctive hooks and their availability, not rely on a hidden developer menu. `[U123–126 · L28982–29541]`

**A player's route to interesting content should be discoverable through the fiction and navigable through the interface.** The repeated inability to find actual dungeons, despite extensive world generation, is among the most consistent firsthand complaints in the transcript. `[U219 · L53770; U247 · L61036; U281 · L72496]`

Distinguish:

- What exists in world truth.
- What the protagonist directly perceives.
- What the protagonist recognizes through background, competence, or language.
- What someone tells them and how reliable the source may be.
- What they infer or suspect.
- What they last knew, which may now be stale.

Maps and Notes should represent **the player's developing knowledge**, not omniscient database projections. A rich map must help form and pursue geographic intentions; duplicate arrows, opaque edges, etymology spoilers, meaningless tile coverage, and tedious short movements are symptoms of a broken relationship between geography and agency.

## 15. A living strategic world — **Direction / graduated horizon**

The original motivation included the possibility of **strategic opponents** who can take meaningful actions independently of the player's arrival, potentially within the same language as player actions. The user rejected treating dramaturgy as merely pre-scripted clocks; conflict needs agents, material resources, objectives, partial information, and actual consequences. `[U007 · L1258; U141 · L33288; U176 · L41844]`

A living world can begin with bounded authored situations and institutions rather than a universal AI planner. Eventually, more sophisticated opponents might observe the world, choose legal strategic acts, commission expeditions, retaliate, negotiate, produce propaganda, or intervene across module boundaries.

There was also speculative interest in giving a powerful opponent an LLM-mediated reasoning layer able to express or choose legal Kyr actions. This is a **research horizon**, not permission for a model to invent or override game-world truth. If pursued, such an agent should be bounded by the same permissions, time, location, information, consequences, and replay contracts as any other actor. `[U141 · L33288; U151 · L37496]`

**Critical distinction:** The world changing offscreen is not yet dramatic. The player must be able to encounter *evidence* of those changes through people, objects, routes, institutions, and investigations, at believable times and in believable ways.

---

# V. Kyr, Deem, authorability, and generative dramaturgy

## 16. Three related but noninterchangeable systems — **Direction**

**Deem** is a compositional and expression language: seeded generation, tables and lookups, specialization/overlays, symbolic values, and structure. It should be used effectively rather than imitating ordinary object construction through huge lists of literals and custom one-off generators.

**Kyr** is the authoring language for playable circumstances: entities, locations, relationships, observations, conditions, actions, effects, rules, conversations, goals, and commitments. The controlled-English ambition was to make authoring readable **without losing typed semantics**, with Deem expressions embedded where quantitative or procedural computation is needed. `[U001–005 · L8–776; U083 · L20068]`

**Kyrie** is the stateful runtime and player-facing medium in which authored and generated content becomes real action, persistent world state, discoverable opportunities, and sensible presentation.

These responsibilities can exchange structured artifacts, but generic app-kernel TypeScript that writes adventure-specific Kyr source or hides whole conversations inside template strings is an architectural failure **when it makes the feature unavailable to independent Kyr authors**. `[U261 · L64356]`

The user repeatedly objected to confusing Deem templates that were actually hard-coded class/creature constructors, with specialized `dragon` / `humanoid` / `goblin` behavior instead of general generators specialized through tables, contexts, and overlays. Preserve that architectural intent when reviewing new generative capabilities. `[U022 · L4068; U095–112 · L22470–26375]`

## 17. Expression meaning and explanation — **Direction / open mechanics**

Deem expressions embedded in Kyr rules may need to be evaluated at different times. An expression can refer to a context (e.g., an actor's current attribute), include symbolic randomness, and remain unresolved until the relevant action takes place.

The user proposed **concretization**: resolving deterministic, presently known parts of a Deem expression against an explicit context while preserving random or unknown parts as a valid Deem expression. Separate this from execution/sampling and from explanation in player language. `[U004–005 · L666–776]`

Potential operations:

1. **Evaluate** an expression, consuming randomness only at the legitimate resolution point.
2. **Concretize** against a specified world snapshot, preserving unresolved symbolic operations.
3. **Explain** its meaning with optional context, without consuming randomness or falsifying what is known.

This could help with tooltips, ability previews, combat events, debugging, and authoring diagnostics. It should not allow tooltips to reveal future rolls or secret facts.

## 18. Recursive, module-owned generation — **Major open architectural puzzle**

**Can an independently authored Kyr module contribute its own Deem tables and generators, and can generated content in turn produce further playable Kyr?** The user explicitly raised local tables, generating entirely new module-specific kinds of content, scaffolding characters and scenes, and recursive code generation that stays within the authoring layer. `[U270 · L68120]`

This suggests several distinct cases:

- **Assembly time:** Deem generates a world or region, yielding concrete Kyr entities and contexts.
- **Adventure specialization:** A module selects from its own authored tables, generating locally varied persons, mechanisms, accounts, sites, or conflicts.
- **Lazy elaboration:** A discovered or activated generator adds a bounded region, book, machine, or encounter to the existing world when relevant.
- **Higher-order generation:** A generated artifact or site carries a definition of how to generate further things. This must be bounded, testable, and subject to world commitments.

The artistic standard is not “random rooms and names”; it is **generative variation with causal structure**. A generated riddle must agree with its answer; an invented mechanism must produce its own clues and physical affordances; a later revelation must respect earlier established facts.

**Architectural questions to resolve experimentally:**

- What language or typed intermediate representation may a generator emit, and when must it be compiled and validated?
- What can a module add to its own public vocabulary, and what requires a core language extension?
- How do generated entities acquire stable identities and safe references?
- How do generation seeds, trace, dependency stamps, versioning, saves, and replay work across nested generation?
- Which facts are committed immediately and which remain unresolved possibilities?
- Can generators safely add rules or only instances of already-declared rule schemas?
- How are authority, scope, recursion depth, resource budgets, and conflicting module claims bounded?
- What evidence proves that variation improves actual play rather than merely content volume?

**Important:** This system is a research/design frontier, not a reason to make every adventure into a meta-programming experiment. Independent authors should be free to use the existing language simply when bespoke authorship is better.

## 19. The authoring environment should make strong work possible — **Direction**

A serious independent author should be able to conceive a world and its characters **before reading Kyr's current syntax**, then translate that vision into content without losing half its affordances. Earlier independent experiments exposed serious friction: adventures could mostly be represented in Kyr but required elaborate adaptation, missing semantics, and unattractive workarounds. `[U192–193 · L45935–46070; U210 · L49921]`

A coherent authoring workflow may eventually include `kyrie new adventure`, `new chapter`, `new scene`, `new character`, and `new table`, each producing an understandable editable scaffold and examples of actual interactions. `kyrie lint` should provide useful locations and errors; preview and journey testing should be fast. `[U256 · L63471; U270 · L68120]`

Character scaffolding deserves special attention: not a stock personality profile, but a structure that supports character-specific dialogue, ongoing relationships, social history, differing knowledge, skill-mediated exchange, and changing responses over time. AI assistance may help populate drafts but cannot replace human literary judgment.

Keep **one coherent canonical ontology and content catalog** rather than accumulating overlapping folders, pseudo-canonical prefixes, obsolete migration commentary, or scenario-specific competing definitions. This is about what the definitions *mean*, not simply file organization. `[U061–064 · L13696–14803; U070–075 · L16563–17739]`

## 20. Independent authors as a research method — **Direction**

The user repeatedly chose separate builders and reviewers to counteract local architectural inertia: one agent conceives a major adventure first, another implements it, an independent cold player tests actual experience, an architectural reviewer checks boundary violations. `[U031 · L5537; U192 · L45935; U250 · L61618; U269 · L67258]`

An author-builder should **conceive without reading code**, then examine existing adventures, implement the full work, justify missing capabilities through concrete authoring needs, and revise through play. The author is not only an analyst and should not be told to stop after a design dossier. Subsequent conversation explicitly corrected that mistake.

A substantial corpus of independently authored adventures is both a content program and an architectural test: if each demands bespoke application code to be playable, the language is not doing its work.

---

# VI. Mechanics, danger, interface, and human experience

## 21. RPG depth is indispensable — **Direction**

The project must support D&D-like pleasures even while questioning familiar genre limitations: varied character archetypes, meaningful abilities, monsters, spells, magical items, exploration, traps, wonders, preparation, treasure, encounters, danger, and growing capabilities. A high-level character model is pointless if the campaign never supplies enough significant experiences for a character to grow. `[U067 · L15842; U186 · L43744; U197 · L47684]`

The early **universal character** insight remains valuable: a creature, companion, antagonist, animal, or civilized nonhuman can arise from related compositional machinery rather than entirely disjoint player/enemy species. Preserve semantic specificity and cultural reality; don't collapse everyone into generic randomized stats. `[U001 · L8; U022 · L4068]`

Combat should be **legible and deliberately chosen**, with meaningful tactics rather than simply watching an autobattler. The user preferred a clean JRPG-like presentation—opposing sides and comprehensible action/target choice—over demanding a tile-grid roguelike. `[U014–015 · L2102–2229; U119 · L27832]`

**Open tension:** Later discussions also explored feature-based tactical zones, reach, protection, and environmental interactions; earlier statements cautioned that complex cover/reach systems might obscure the purity of a clear abstract combat model. This is an experiment to adjudicate, not a settled mandate to replace abstract combat. `[U132 · L31014]`

Both danger and recovery must be credible. The player should be able to understand what threatens a fragile protagonist or companion; choose preparation, negotiation, avoidance, or retreat; and see truthful accounts of damage, incapacitation, death, and what is left behind. Serious consequences are appropriate; unexplained consequences are not.

## 22. Geography and the journey itself — **Direction**

**Colossal Cave** is compelling in part because its geography feels physically grounded, investigable, and specific. A map should help the player learn, remember, and explore that kind of place, not turn the game into a collection of indistinguishable directional arrows. `[U221 · L54227; U247 · L61036]`

Distance and travel should be perceptually meaningful. A slow animation or busy wait is not a journey. Sometimes a route should be brief and uneventful; sometimes landscape, weather, changing light, a small encounter, fatigue, or news gives travel texture. Appropriate time costs and consequences must still apply. `[U201–203 · L48508–48624]`

Site-scale geography, regional routes, exploration, and combat spaces may call for **different representations**. Avoid conflating containment, access, direction, Euclidean map position, tactical reach, and world travel. Assisted travel along known routes is desirable when it eliminates rote clicking but must not bypass meaningful interruptions.

## 23. Presentation must feel like literature and a game, not software — **Direction**

The persistent aesthetic objection in the transcript is not a preference for one CSS theme. It is a profound dissatisfaction with **busy webapp structure, illegible navigation, clipped overlays, excessive panels, repeated text, mismatched portraits, flickering hover updates, intrusive information, and poor responsiveness**. `[U060 · L13418; U164–169 · L40049–40803; U189 · L44907; U216 · L52498; U247–259 · L61036–63965]`

The 22 October brief proposes **interface reticence**: let a scene be primarily legible prose; bring the map forward when geography matters; provide stable battle context when fighting; show character and equipment details when preparing; avoid advertising every possible system simultaneously.

Possible modalities discussed include restrained typographic IF, modern *Disco Elysium*'s dialogue-oriented informational density, classical LORD/terminal-like directness, contextual cards, an unobtrusive atmospheric or cartographic canvas, and public-domain/Old-Master portraiture. **No single modality was conclusively selected.** `[U119 · L27832; U167–169 · L40397–40803; U204–205 · L48670–48771]`

**Beauty is structural**: a good font cannot rescue meaningless writing, a portrait cannot rescue inconsistent character identity, and a map cannot rescue false topology. The interface must not reveal what the protagonist doesn't know, replace exact authored remarks with mechanically generated summaries, or hide the last action before the consequence screen.

The player should not need to click every technical subview to discover the actual verb for inspecting, reading, talking, acting, or moving. Inspection should not silently buy, attack, consume time, or commit irreversible consequences. Controls should state what action will happen and report the actual result clearly.

## 24. Literary prose requires editorial discipline — **Direction**

The authorial voice should be observant, restrained, concrete, rhythmically varied, and socially attentive. It should distinguish ordinary bustle, comedy, danger, loss, mystery, the uncanny, and extraordinary revelation, **without making every lane portentous or every room haunted**. `[U173 · L41610; U190 · L45153; U198 · L47780]`

Good generated language needs more than phrase variety: each description should respect physical place, actors, context, prior actions, current weather and light, and epistemic limits. A person cannot repeatedly greet an established acquaintance as a stranger; an open door cannot remain barred in the current narration; a description must not assume walls in an open moor.

**Authoring-specific responses** are essential. If the game offers “listen” at a speaking door or “look closely” at a suspicious device, its reply should honor that concrete interaction, even if no new information is gained. Do not offer verbs that consistently collapse into “Nothing comes of it.”

Use curated externalizable language material, idioms, speech and combat barks keyed to meaningful events and temperament where useful, so human writers can improve it without editing application logic. The user suggested periodic human editorial passes on generated prose and recalled Orsino's temperament-based battle barks. `[U211–212 · L50204–50365]`

## 25. Performance and iteration speed are product qualities — **Direction**

A slow pure-function text game that responds with an ornamental ellipsis is a failure of both experience and development process. Tests and generation that should be cheap but take minutes/hours impede the builder's inner loop and mask poor responsiveness. The user repeatedly asked to frontload performance and review expensive Deem generation traces and browser delays. `[U101 · L23466; U115 · L26816; U145–147 · L34459–35356; U201 · L48508; U285 · L73599]`

Maintain deterministic seeds, affordable tests, browser journey checks, meaningful profiling, and clean dependency installation. Use the existing public Deem/languages packages coherently, and keep the developer command surface intelligible (one `kyrie` CLI with purposeful subcommands, ancillary experiments in `scripts/`). `[U256 · L63471; U276 · L71450; U292 · L75100]`

A good inner loop is an artistic enabler: authors must be able to test scenes rapidly, see prose in context, and revise without waiting through a long integration cycle.

---

# VII. Design tensions and not-yet-decisions

## 26. Open questions to preserve honestly

1. **How much should the world simulate?** History, ecology, institutions, professions, and strategic actors can generate profound depth, but exhaustive simulation could produce dullness and huge costs. What actually improves play?
2. **What is the operative boundary between Deem and Kyr?** Deem builds definitions and symbolic computations; Kyr defines playable semantics. How do they recursively compose without arbitrary source generation in the kernel?
3. **At what point does a generated possibility become committed history?** Lazy generation and partial knowledge must not rewrite evidence or replayed events.
4. **What form of strategic agency is enough?** Bounded rules and situations first; more general planning or LLM-directed opponents only if their decisions materially enrich the shared world.
5. **How should combat evolve?** Directly legible abstract party combat versus limited feature-based spatial tactics; prove added decisions before adopting more machinery.
6. **How much player-character definition belongs at the start?** An authored or generated situated origin is preferable to a party configuration screen; customization must not destroy narrative identity.
7. **What should a reusable character authoring scaffold standardize?** Make ambitious characters authorable without mechanically imposing generic flaws, companion arcs, or dialogue templates.
8. **How do strong independent adventure modules interoperate?** Preserve module-owned identity and writing while allowing meaningful cross-module political, geographic, and relational interaction.
9. **How far should setting canon be fixed?** Imbar's inherited cosmology, languages, and ages provide structure, but knowledge should often be partial, interpretive, and contested.
10. **What presentation language best realizes the game?** Typography, portraits, maps, contextual spatial illustrations, and combat readability should be tested against the same moments of play, not decided by fashion.
11. **How can procedural prose be excellent rather than merely valid?** Human editorial curation, bounded variation, situated selection, and authored scene design remain indispensable.
12. **What is a complete long-running game?** The first meaningful expedition is a proof of potential; sustained development demands second and third adventures, continuing characters, new capabilities, and enduring world effects.

These questions are productive constraints on future experiments, not justification for a universal rewrite.

## 27. Things explicitly not to make obligatory

- Beginning by building a three-person party.
- A universal quest checklist or requirement that the player follow one main plot.
- A procedural generator that simply replaces independent literary authors.
- Dungeons as linear fight-the-boss gauntlets.
- Grids, tiles, or spatial tactics simply because many RPGs have them.
- A universal strategic AI planner before small social situations work.
- LLM-authored live world truth or AI improvisation that overrides deterministic mechanics.
- Cosmological spectacle, planar travel, Kiritarun, or Mathematical Age artifacts in every story.
- Time travel as the mandatory endgame.
- A single theory of philosophy, music, or historical causation imposed as setting canon.
- New broad engine abstractions without a concrete authored need and demonstrated player value.
- Treating clean test reports, room counts, catalog counts, or screenshots as evidence of genuine literary/game excellence.

---

# VIII. From the later conversation: review evidence and M16 (post-transcript addendum)

**This section records subsequent conversation and shared reports after the archived October 25 transcript ended. It is intentionally separated from the transcript-grounded atlas.** It should be checked and revised when the builder's next reports are available.

## 28. Reviews are evidence, not the roadmap

An independent architecture review was preserved on `review/architecture-2026-10-25`, based on a pinned snapshot. Its most important reported failures included **initial-knowledge invalidation after learning facts**, **checkpoint/transcript race on border crossing**, **misidentified border countries**, **uninterpolated bound variables in text**, and **observations failing to teach knowledge**. The review also argued for tests using actually offered actions, shared-world integration through small contracts, and restraint around proposed universal compositors and strategic systems.

An independent cold player then reported substantial authored adventures hidden from ordinary discovery, catastrophically punishing early expeditions, misleading casualty and combat reports, opaque abilities, weak generated language, empty offered interactions, and invisible institutional progress. Importantly, the tester also found **real artistic promise**: the priest's response to an old letter, a convincing ancient inscription, a dramatic offstage expedition by four brothers, and a satisfying debt repayment. This indicates that the **world is at times more interesting than the player can successfully experience**.

The project owner independently experienced severe navigational confusion, unexplained injury and death during attempted travel, and repeated `invalid knowledge` blockers. These are firsthand reports requiring comparison against precise commits—not grounds for assuming one bug's root cause without reproduction.

A further independent adventure author-builder was commissioned to **conceive first, then implement a full ambitious adventure**; it should not stop at an architectural design dossier. Its branch must be assessed for maturity and integrations, rather than automatically merged.

**Branch handoff for future builders:** Discover the current HEADs and divergence of the architecture review branch, latest cold-play branch (initial report named `claude/inspiring-pascal-18tohw`), and independent adventure branch. Read the finished artifacts; do not assume any is ready to merge. Preserve reviewer independence and avoid treating the oldest branch snapshot as present `main`.

## 29. M16 should be derived from artistic principles, not the stale feature list

An earlier proposed M16 named **“One World, Many Adventures”** and sought reliable shared-world journeys, discoverable independent modules, an inhabited city, meaningful travel and companions. Later, the cold playtest prompted an overly reactive replacement organized around repair tickets and prebuilt three-person parties. **The project owner explicitly corrected that turn**: keep advancing the artistic roadmap *on our own terms*; the old repository design atlas may be stale; begin with an individual person and let companions enter later.

A responsible M16 should therefore be framed as a **concrete artistic and gameplay advance that also clears unavoidable playability blockers**, rather than a universal architecture rewrite or a laundry list of reviewer requests.

Promising integrated acceptance case:

> A protagonist with an identifiable past enters an inhabited world; learns of something worth investigating through character and circumstance; forms intentions, reads geography and social evidence, and reaches an adventure by ordinary means; experiences distinct people, meaningful practical problems, wonder and danger; returns with durable consequences, losses, gains and questions; discovers that other people have continued acting; and wants to go out again.

This is a *candidate organizing test*, not a finalized M16 instruction. It leaves room for a meaningful city, two interacting adventures, a deep companion, new Kyr/Deem authorability, and richer mechanics—provided they advance the experience rather than exist as independent feature demonstrations.

**Do not send the earlier “The Continuing Adventure” mission brief unchanged.** It incorrectly prioritized building a party at launch and treated the older repository player-experience atlas as normative.

---

# IX. A practical constitution for later conversations and builder briefs

## 30. Questions to ask before declaring a design ready

**Imagination and situation**

- Does the world exist for reasons other than the protagonist?
- Is there a materially and historically intelligible situation, not just plot instructions?
- Are characters intelligent, particular, and affected by their environment and commitments?
- Does an extraordinary thing have an origin, history, present consequences, and investigable clues?

**Play**

- Who is the protagonist, why are they here, and what can they sensibly do now?
- Can the player find a genuinely interesting destination through the game itself?
- Can they build a mental map, investigate, prepare, choose and execute an intention, and understand the result?
- Can they change course, withdraw, fail, or return without losing the coherence of the world?
- Does a later discovery transform the meaning of something earlier?
- Can a decision affect what others can do next?

**Language and authorability**

- Could an independent author express the fictional circumstance principally in Kyr and module-owned Deem data?
- Are any custom behaviors hidden in app TypeScript that should belong to the authoring medium?
- Does generation preserve causality, identity, determinism, authorial specificity, and already-established facts?
- Is the prose worth reading, or is it merely grammatical filler?

**Presentation**

- Is the page calm, elegant, readable, and responsive?
- Does it help the player attend to the world rather than to the interface's machinery?
- Are uncertainty and knowledge boundaries honest?
- Are offered interactions specific and outcomes causally and mechanically truthful?

**Evaluation**

- Has it been played from the ordinary public beginning without cheat knowledge?
- Are claims grounded in reproducible journeys and the player's actual comprehension?
- Were artistic shortcomings examined independently of test pass counts?
- Did the work expand what Kyrie can express, or merely add another narrow example?

## 31. One-page orientation for a new assistant or builder

**Identity:** Kyrie is a literary fantasy RPG and authorable world-simulation medium set principally in Imbar. The project aims for rigorous mechanics and persistent causality, deep hand-authored adventures enriched by procedural composition, distinctive characters, meaningful geography and history, and a beautiful restrained browser experience.

**Beginning:** One particular protagonist with a situated background and immediate reason to act. Companions encountered and developed through play—not compulsory party creation at launch.

**Experience:** Arrival → attention → deliberation → resistance → revelation → return are recurring *dramatic moments*, not mandated quest steps. Risk, discovery, preparation, combat, spatial and social reasoning, and continuing campaigns must all matter.

**World:** Imbar contains deep and partly unreliable cosmological traditions (prima materium, Virina, Varakiiri, Kiritarun), extinct and successor cultures, Aenean and Mathematical Age strata, languages, real ecology, politics, institutions and everyday life. The world is not a generic terrain graph decorated with mythology.

**Character:** Aim for Kim-Kitsuragi-grade specificity and longevity: a recognizable perspective, history, humor, intellectual life, relationships, sustained consequences, and dialogue that can explore philosophy, politics, art, science and personal experience.

**Drama:** Causes and changing possibilities; not quest flags, formulaic contradiction/resolution, or a sequence of boss fights. Long-form adventures with real clues, geography, puzzles, alternative methods, peril, and transformative returns.

**Authoring:** Deem supplies compositional/generative expressions; Kyr defines executable playable circumstances; Kyrie interprets and presents. Modules should own content and potentially tables/generation hooks. Recursive Deem→Kyr composition, lazy generation, and long-term strategic agents are important open questions requiring disciplined experiments, not unconstrained meta-programming.

**Presentation:** Restraint, visual beauty, concrete precise prose, maps for actual orientation, truthful action results, sensible known-world information, no repetitive filler or engine-shaped dashboards. An attractive screenshot does not establish that the interface is pleasant to inhabit.

**Method:** Let independent writers imagine first and build fully; use separate cold players and architects as adversarial evidence; preserve the builder's separate work. Do not access, edit, or merge code unless explicitly instructed. Review branch maturity and source alignment before integration.

**Current correction:** The old in-repo player-experience atlas contains useful analyses, but is **not** the governing statement of the project's artistic intentions. The October 2026 conversation and this living synthesis have priority where they disagree. New missions should be derived from this vision and informed—not dictated—by review findings.

---

## Editorial provenance and update log

- **16 Oct:** Original motivations: D&D continuity/rules, controlled-English effects, Deem expressions, universal characters, autobattler; discovery that stateful campaigns and compelling decisions are the real challenge. `[U001–015 · L8–2229]`
- **17–20 Oct:** Kyr language, Deem templates, persistence, scenario authoring, UI and ontology troubles; concern about builder-specialized generators; story versus simulation; independent reviewers and early product-spec work. `[U016–161 · L2337–38848]`
- **21–22 Oct:** Imbar lore, ages and cultures, literary ambition, situated protagonist, artistic charter, independent authoring experiment, critical design brief. `[U162–215 · L39320–51491]`
- **23–24 Oct:** Need for substantial adventures, deep companions, readable maps, real authorability, module-specific tables, semantic boundaries, aesthetics, reviews and correction of one-off app code. `[U216–285 · L52498–73599]`
- **25 Oct, transcript:** Civilizational complexity, geophilosophy, war and demobilization, music, differential dramaturgy, deep character interaction and cross-module institutions. `[U286–294 · L73815–75974]`
- **25 Oct, later conversation:** Review synthesis; independently built adventure commission; new cold play reports; explicit correction that the in-repo design atlas is outdated as the governing product reference and that single-protagonist arrival is the preferred opening.

**Future revision discipline:** Append an entry when a design direction is promoted, rejected, or superseded. Keep competing visions as open tensions until an actual decision or successful playable experiment resolves them. This document should be revised by the project owner and collaborators, not treated as an immutable spec.
