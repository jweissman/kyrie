# The owner's direction: a civilizational atlas (24 November 2026)

The owner's words, as given, kept whole. Gamma's commission, which organises them into work, is
[doc/architecture/mission-22-gamma/COMMISSION.md](../architecture/mission-22-gamma/COMMISSION.md); beta's narrow
proving cases are in [the execution plan](../architecture/mission-22-beta/execution-plan.md) and the register
(OR-440 to OR-443; gamma's OR-450 to OR-457).

---

This is a design direction for gamma, not authorization to enlarge the current beta execution queue.

### A. Settlement coverage

Implement a settlement matrix across at least six principal terrains and four scales: hamlet, town, city, and metropolis.

Each generated world must contain at least 24 distinct settlements satisfying these combinations. Extend to all eight primary terrains (32 combinations) as the ontology becomes complete.

Preserve distinctive nonstandard forms such as mobile encampments, academies, necropolises, and ruined metropolises. Settlement scale, population, habitation, and mobility must remain distinguishable.

### B. Canonical city pins

Certain cities must exist as stable named anchors within the generated geography.

Initial examples include:

- **Aline:** major coastal city near the starting region.
- **Marith:** metropolis of the archipelago.
- **Dun Rìerdan:** valley metropolis, City of Seven Towers.
- **Garzab:** desert city, the Southern Lamp.
- **Andaeen / YDGN:** desert metropolis, City of Immortals (name to settle).
- **Miyan:** sky city.
- **St. Thera's Reach:** sky metropolis.

Other mountain, waste, woodland and plains settlements require further creative definition.

A named anchor must have stable identity, suitable geography, distinctive institutions and material culture, and relevant reusable visual assets. Its identity must survive regeneration with the same seed and compatible content.

### C. Relational and adventure pins

Define important relationships among places.

For example, Aline must provide a realizable means of arranging passage toward Dun Rìerdan. The route must use the actual travel, economic, geographic and simulation systems, with appropriate costs and risks.

Other pins may require a particular dungeon, institution, person, commodity, route, historical connection, or unusual landmark.

A required relationship must be validated as executable or discoverable, not merely asserted in a description.

### D. Terrain and civilization census

For all eight primary terrains—plains, coast, desert, valley, waste, sky, mountain/cave, and woodlands—use the owner's terrain associations as defaults for adapted populations, local demonyms, characteristic wildlife, gemstones, and material resources.

Validate populations, ecology, geology, and symbolic/cultural distributions using appropriate measures rather than one generic percentage.

Use the proposed majority-adapted-population rule as a default to examine, allowing justified cosmopolitan, historical, institutional and environmental exceptions.

### E. Visual geography

Organize and progressively fill a terrain × subject × season × weather × light asset matrix.

Subjects include overviews, shelter, settlements, wilderness or pastoral views, and wonders. Named places require consistent geography and architecture across their variants.

Prioritize coherent recognizability and useful coverage over exhaustive image counts.

### F. Validation

Provide two complementary forms of evidence:

1. **World census:** deterministic inspection verifying settlement coverage, canonical identities, terrain associations and required relationships across varied seeds.
2. **Playable exploration:** agents can discover, travel toward, enter and interact with the principal settlements and pinned content without developer shortcuts.

Report missing or contradictory generation requirements rather than silently omitting them.

### G. Initial proving scope

Begin with a small number of named settlements and a minimal terrain/scale coverage proof. Establish the contract and validator before attempting the entire illustrated atlas.

Preserve the generated world's variation. Canonical anchors constrain the world; they do not turn every seed into the same map.

**Success means that any newly generated Westernesse world is recognizably part of the same civilization, but remains meaningfully different to explore.**

**Continue executing the existing M22-beta plan.** Do not treat this as authorization to expand its active queue indiscriminately, replace its architectural priorities, or conduct another prolonged design investigation. Capture the broader requirements in the feature atlas and prepare them as a substantive M22-gamma commission. Beta should implement only the focused proving cases described below.

## 1. The governing vision

Westernesse should begin intimately and expand into a genuinely immense, persistent world.

The player's first experience should involve a small number of concrete, understandable actions: light a torch, discover a person, enlist help, survive danger, acquire something useful, and encounter something wondrous.

The starting settlement should be small, quiet, and largely isolated, with an obvious nearby dungeon that invites exploration. From the first minutes, however, the player should sense a much greater world: distant cities, unfamiliar peoples, other environments, ancient civilizations, and ambitions that can eventually transform history.

The world must not merely *describe* these possibilities. It must instantiate them as persistent places, people, relationships, resources, and reachable actions.

Our long-range goal is to make the procedural world **constrained by a deliberately authored civilization**, without turning every generated world into an identical map.

## 2. The eight principal terrains

The initial geographical ontology has eight major terrain/biome types:

1. Plains
2. Coast
3. Desert
4. Valley
5. Waste
6. Sky
7. Mountain / cave
8. Woodlands

These are principal types, not an exhaustive terrain taxonomy. Minor terrains, transitional environments, and local variations may be developed later.

Each terrain should inform geography, population, ecology, resources, architecture, institutions, visual identity, and plausible activities.

Terrain is not merely an illustration tag.

## 3. Canonical settlement matrix

The owner proposes four settlement scales: **hamlet, town, city, metropolis**.

The original sketch specifies the following six-terrain matrix. Preserve the distinctions among named canonical places, settlement archetypes, and provisional names.

| Scale | Coast | Mountain / cave | Valley | Desert | Waste | Sky |
|---|---|---|---|---|---|---|
| **Hamlet** | Fish Village | Gnome Rock | Plaintown | The Encampment (mobile) | No-City / New City | Float Rock |
| **Town** | Port Town | The Retreat (Monkston) | Firsttown | Oasis | Oncetown | The Academy |
| **City** | **Aline** | Dwarven city, name provisional (sketch appears to read *Dunwudelft*) | Old City | **Garzab**, the Southern Lamp | Necropolis | **Miyan** |
| **Metropolis** | **Marith**, City of the Archipelago | Undersea Town, the Cave City | **Dun Rì / Dun Rìerdan**, City of Seven Towers | **Ydgn**, also called Andaeen, City of Immortals | Arcology Ruin, City of the Gods | **St. Thera's Reach** |

**Naming notes:**

- **Aline** is the intended spelling, not Aleen. It is the major coastal city associated with the opening region.
- **Dun Rì** is the sketch's short form for the valley metropolis previously discussed as Dun Rìerdan or Dunree. Maintain one canonical identity and allow suitable short names and historical variants.
- **Marith** is the archipelagic metropolis.
- **Ydgn / Andaeen** requires final naming decisions. Preserve both as provisional design names.
- The mountain city's handwritten name is not confidently established; do not silently canonize a transcription.
- **St. Thera's Reach**, Miyan, Garzab, and the other named cities should retain their established design descriptions.
- Plains and woodlands have no completed four-scale settlement columns in this sketch. Leave them explicitly open for further authoring.

These are not necessarily stages in a single developmental ladder. A hamlet, town, city, and metropolis may coexist, exchange goods, dominate one another, or represent alternative forms of habitation.

A waste metropolis may be a ruined built environment rather than a living population center. A desert hamlet may migrate. A sky town may be a specialized academy rather than a conventional municipality. Distinguish **scale, population, habitability, mobility, and institutional complexity**.

### Gamma coverage obligation

As a first substantial world-assembly target, every generated Westernesse world should instantiate **at least one distinct settlement for each combination of the six specified terrains and four scales**: 24 settlements.

Extending the complete matrix to all eight principal terrains would imply 32 terrain/scale combinations.

The purpose is not simply to count settlements. A coastal city and a mountain city should differ meaningfully in geography, architecture, economy, population, materials, available activities, and institutions.

Do not satisfy coverage by generating 24 cosmetically renamed generic towns.

## 4. Terrain correspondences

The owner also proposes a terrain-associated population and material vocabulary.

Preserve the following associations as initial worldbuilding data. Entries marked uncertain or rare should not be silently converted into universal rules.

| Terrain | Adapted species | Gem | Regional demonym / epithet | Animal | Characteristic materials |
|---|---|---|---|---|---|
| **Plains** | Catfolk | Diamond (rare) | Low | Lion | Iron; bronze possibly rare |
| **Coast** | Fishfolk | Lapis lazuli | Sea | Octopus | Shell, pearl |
| **Desert** | Lizardfolk | Rose diamond | Sand | Scorpion | Iron |
| **Valley** | Human | Quartz | River | Fish | Iron, copper (rare) |
| **Waste** | Orc | Onyx | Wild | Spider | Iron |
| **Sky** | Fae / Fey | Sky diamond | High | Eagle | Adamantium |
| **Mountain / cave** | Dwarf | Ruby | Deep / Dark | Dragon | Steel, copper, bronze, gold |
| **Woodlands** | Elf | Jade (provisional; gem row needs confirmation) | Wood | Bear | Iron, petrified wood |

The sketch proposes a general rule that **at least 50% of a terrain's population belongs to its adapted species**.

Treat this as a world-generation design target requiring careful interpretation, not an unconditional assertion about every individual settlement. Capitals, ports, diasporas, conquered regions, mixed cities, and extraordinary environments may produce justified exceptions.

The associations concern several different kinds of fact:

- **Demographic:** which peoples predominantly inhabit a terrain.
- **Ecological:** which animals and other living things characterize it.
- **Geological/material:** which resources actually occur there and in what abundance.
- **Cultural:** which gems, animals, names, and materials inform ornament, heraldry, dress, religion, architecture, or social identity.

These categories should not share a single simplistic frequency rule.

For example, a plains region can contain diamond-bearing geology without offering a diamond in every hex. Lions can be characteristic wildlife without appearing during every journey. The demonym *Low* can apply to inhabitants who are not catfolk.

The owner's developing conception of orcs—as peoples historically formed from extensive admixture and transformation—is a creative direction deserving its own design treatment. Do not reduce it automatically to a mechanical racial essence.

### Gamma biome census

Develop a deterministic census over generated worlds that asks:

- Does the biome have the expected characteristic populations, subject to justified exceptions?
- Are the named local demonyms represented appropriately?
- Are characteristic animals ecologically possible and discoverable?
- Are gems and materials grounded in geology, production, or exchange?
- Do these properties affect actual settlements, inventories, activities, descriptions, and illustrations?

The census should report distributions, absence, and exceptions over varied seeds. A world should be distinctive without contradicting its own material ecology.

## 5. Canonical places and relational pins

We need more than settlement coverage. Certain named places and relationships should be guaranteed by world assembly.

An initial example:

**Aline → Dun Rìerdan**

Aline is the major coastal city accessible from the starting region. It should provide an actual means of booking or arranging passage toward the valley metropolis, Dun Rìerdan.

This is a **relational pin**, not just a line of descriptive text.

The journey must be possible through the ordinary simulation, using appropriate routes, vehicles, costs, time, hazards, permissions, and travel abilities.

A high-level magician's teleportation or planar travel may legitimately bypass ordinary road and maritime difficulties according to the supported rules. The UI should not offer consequence-free teleportation merely because a city has been discovered.

Other pins may specify required institutions, monuments, dungeons, species, historical remains, peculiar resources, or relationships among cities.

### World-construction contract

For canonical pins, the assembler should:

1. Retain the identity and design requirements of the named place.
2. Find or construct geographically appropriate placements within a generated world.
3. Satisfy required connections or give an explicit reason why the constraints cannot be satisfied.
4. Preserve identities, relationships, and histories under compatible deterministic replay.
5. Expose the resulting facts to ordinary play and inspection.

Do not hard-code all coordinates merely to establish these identities.

**Validation requires both a census and traversal.** The census proves that necessary settlements and relationships exist; headless and cold-play journeys prove that players can discover, reach, enter, and interact with them. A random walk alone cannot prove that every canonical city exists, because a valid random walk may simply fail to visit one.

## 6. Visual atlas: a structured library, progressively filled

The owner wants an organized background-asset library indexed by terrain and visual subject, then by season, weather, and light.

For each terrain, establish at least these subject classes:

| Visual subject | Intended use |
|---|---|
| **Overview** | Characteristic establishing view of the biome |
| **Safe house / shelter** | A place to recover, reside, or establish an attachment |
| **Hamlet / town** | Intimate inhabited settlement views |
| **City / metropolis** | Larger urban environments and identifiable canonical settlements |
| **Wilderness / pastoral** | Ordinary landscape, paths, flora, fauna, and environmental life |
| **Wonder** | Striking, sublime, curious, or exceptional places and things |

Wilderness and pastoral views may be distinguished where useful. A wonder need not be supernatural; a remarkable tree, ridge, stone formation, ancient object, or unusual natural phenomenon can qualify.

The dimensions for environmental treatment are **light, season, and weather**. The eventual art library can aspire to broad combinations, but beta and gamma should fill them selectively.

A suggested logical indexing order is:

**terrain → subject → canonical place or reusable archetype → season → weather → light**

Do not require a full Cartesian product before an environment becomes usable.

Most importantly, variants of a canonical place should preserve its recognizable geography, buildings, and visual identity. Four independently generated pictures of four different villages do not constitute four seasons of the same village.

Use existing paintings, identify missing bindings, establish naming and metadata conventions, and let agents help organize the assets without replacing human curation.

## 7. The first 15–30 seconds: minimal cinematic play

Beta should pursue a deliberately constrained, rapid opening.

A possible sequence:

1. **Darkness.** Minimal or no distracting image. One obvious action, perhaps two. Light the torch.
2. **Revelation.** Light changes what the player can perceive, producing a meaningful visual and mechanical change.
3. **Companionship.** Find a person, communicate briefly, and recruit or assist them.
4. **Danger.** Encounter a small genuine fight, ideally one that the new companions can win together through actual combat mechanics.
5. **Reward.** Obtain useful loot or a payoff; understand that actions produce lasting consequences.
6. **Wonder.** Encounter something striking that suggests a world of greater depth than the immediate obstacle.

Aim to introduce the game's principal interaction idioms and several different Atlas indicators within roughly 15–30 seconds of active play, while testing whether players can actually comprehend the sequence. Don't force a fixed-duration cutscene or compromise legitimate player choices to meet a stopwatch.

**Use one or two actions where the situation genuinely needs no more.** Long presses should not be the ordinary way of choosing. A rare dramatic or tactile action may justify a deliberate hold, but the default should be immediate and responsive.

The cinematic objective is successive revelation: darkness, perception, personhood, cooperation, danger, consequence, and discovery.

The opening should be constructed using the same Kyr and Kyrie mechanisms as the rest of the game, not an unrelated scripted tutorial engine.

### Atlas acceptance

Each indicator shown in the opening must correspond to an actual meaning and opportunity. The player should learn the Atlas by experiencing true indications, not through a disconnected legend.

Differentiate an immediate, actionable opportunity from a possible or not-yet-realized one where the underlying semantics justify it. More vivid color should not promise an action that does not exist.

Entering a conversation, encounter, or focused activity must preserve the promised opportunities and the player's broader intention.

## 8. Wonder as a first-class fictional declaration

**This is the main new Kyr/Deem concept proposed in these discussions.**

A `Wonder` should identify a remarkable thing, place, structure, or phenomenon that exists independently of the player's current quest.

A wonder is not simply a collectible, an Atlas color, an achievement, or a quest step.

Distinguish:

- **Wonder:** the persistent thing or phenomenon itself.
- **Discovery:** a character's encounter with or new knowledge of it.
- **Opportunity:** the legitimate actions it makes available.

A wonder may be beautiful, strange, historically significant, technologically extraordinary, magical, planar, dangerous, or cosmologically important. It may be understood differently by different cultures or characters.

Potential authorial properties include:

- Nature or provenance: natural, historical, technological, magical, planar, unknown.
- Relative rarity: ordinary to locals, rare, unique, or apparently impossible.
- Significance: aesthetic, cultural, material, scientific, spiritual, dangerous.
- Affordances: observe, examine, enter, operate, collect, alter, traverse, remember.
- Knowledge: who knows what, and what discovery changes.
- Persistence: stable identity, placement, history, and consequences.

Do not collapse all of these into one scalar “magic” or “wonder” score. Something from the Mathematical Age may be extraordinary for one reason; a planar breach for another; a magnificent natural formation for a third.

Where a wonder has practical effects—opening a route to another plane, operating machinery, changing matter, containing a relic—those effects must execute through the ordinary authoritative simulation.

**Beta proof:** author and place at least one genuine persistent wonder in the supported opening or dungeon. It must be discoverable independently of a quest, have intelligible presentation, allow appropriate interaction, and survive revisits and replay.

**Gamma authoring convention:** ask each substantial authored adventure to contribute approximately one or two notable wonders or other independently interesting world elements. These may connect to the adventure's story, but need not be contingent upon accepting that story.

The purpose is to make every adventure enrich the world even for players who never take up its principal undertaking. Do not turn this into a quota of interchangeable glowing objects.

## 9. The First Aims: optional, nested campaign orientation

The sketch also proposes an expandable orientation structure provisionally called **First Aims**.

Its top-level ambitions are:

| Horizon | Suggested aims |
|---|---|
| **Orient yourself in the region** | Find a dungeon; seek companions; get a horse; acquire a safe house |
| **Find Dun Rìerdan** | Learn of the metropolis; establish or discover a route; seek passage; visit the city |
| **Explore the southern continent** | Travel beyond the initial region; encounter unfamiliar geography and civilizations; find and confront a dinosaur |
| **Shape the wider world** | Form a free company; engage in great conflict; eventually confront the Dark Lord |

This is not a compulsory sequence of chapters or a prophecy handed to every new character.

At least three nested levels should be expressible in the underlying undertaking model: for example, a broad campaign horizon, a regional undertaking, and particular situations or accomplishments.

Distinguish **available, followed, and achieved**. A character who independently discovers a dungeon should receive recognition even if they never formally selected “Find a dungeon.” Following an aim gives the player guidance; it is not a precondition of accomplishment.

Achievements and experience rewards must be idempotent and reflect real world facts. Previous accomplishments should count when a larger undertaking later becomes available.

Situations can branch, overlap, occur out of order, and expose new possibilities. A player may reach the southern continent without first visiting Dun Rìerdan.

**Beta proof:** one optional, nested First Aims undertaking that recognizes independent progress through finding and exploring the nearby dungeon, acquiring help, and learning of a distant destination. Prove focus continuity, honest guidance, and aftermath. Do not require the complete continent or metropolis to exist as detailed playable content in beta.

**Gamma extension:** instantiate the geographical and transport relationships that make the larger aims executable, using the civilizational pins above.

## 10. The opening environment should invite, not obstruct

The starting region should provide a clear reason to explore immediately.

The principal dungeon should be in the same hex or within approximately one or two hexes of town, with its existence made apparent through scenery, rumor, a discoverable approach, or honest Atlas opportunity.

The player should not be required to undertake hours of repetitive errands merely to discover that interesting content exists.

At or near the dungeon entrance, provide a plausible companion and attainable basic equipment or supplies for an initial expedition. The player can still choose to prepare differently, and actual danger remains.

Multiple sites or entrances may inhabit one hex. Preserve the possibility of future topological connections among them, without making a detailed single-hex renderer a beta prerequisite.

### Reconsider the initial undertaking roster

Current openings have exhibited excessive repetition across seeds: minor errands, disproportionate travel, little resistance, and destinations with insufficient content.

The design response is not simply to add more prose or rename the same fetch quest.

Explore a large curated Deem scenario table—conceptually d100 entries sampled and composed several times—whose variation affects:

- The initiating circumstance and what the player must discover.
- People and their motives or relationships.
- Geography and material obstacles.
- Who or what contests the objective.
- Time, risk, equipment, knowledge, and available solutions.
- Payoff, aftermath, and new possibilities.
- Independent places, things, and wonders contributed to the world.

Most undertakings should become available through interacting with people and circumstances rather than appearing as an arbitrary initial assignment list.

Fetching something is acceptable when reaching or obtaining it is genuinely difficult, consequential, or interesting.

For beta, **prove variety with a few strong situations and multi-seed cold play**. The full large table belongs to subsequent content development.

## 11. Execution split and acceptance

### M22-beta: implement the narrow proving cases

Continue the current plan, including performance, authoritative action meaning, situation continuity, command integrity, combat and conversation, and platform separation.

Fit these additional design requirements into the appropriate existing sprints:

1. One rapid, dark-to-revelation opening with constrained choices, companion, credible fight, loot, and a wonder.
2. One clear town–dungeon–return route with nearby discoverable adventure and sensible preparation.
3. One persistent, semantically declared wonder with accurate knowledge, presentation, and interactions.
4. One optional nested First Aims undertaking, recognizing independent accomplishments.
5. A first pass at meaningfully variable opening situations, tested across seeds rather than judged by one generated example.
6. The minimum asset metadata and placement interfaces needed so the later civilizational atlas can be realized without rewriting the presentation or world-assembly model.

Do not delay these tasks for the complete settlement census or city corpus.

### M22-gamma: build the civilizational atlas

Commission the broader program:

1. Six-terrain × four-scale minimum settlement matrix, extending toward eight terrains.
2. Named city identities and placement constraints.
3. Relational pins such as Aline–Dun Rìerdan passage.
4. Biome distributions for species, demonyms, fauna, gems, and materials.
5. Progressive visual-asset coverage across terrain, subject, season, weather, and light.
6. Independent wonders contributed by adventures and generated settings.
7. Deem assembly, census, diagnostics, and playable traversal over different seeds.
8. Expansion of First Aims into a real continent-spanning network of possible ambitions.

### Verification

Apply the existing acceptance ladder:

- **Fast contracts:** validate semantic declarations, required identities, uniqueness, valid placement and dependency constraints without a full game wherever possible.
- **Headless worlds:** census terrain/scale coverage, populations, material distributions, historical persistence, reachable routes, and completed undertakings over many seeds.
- **Automated players:** test different approaches to the first dungeon, independent discoveries, returning to town, and pursuing or ignoring the First Aims.
- **Blind rendered cold play:** determine whether the dungeon invitation, Atlas, opening and world geography are intelligible without implementation knowledge.
- **Human creative acceptance:** evaluate whether places are distinctive, images coherent, adventures varied, and wonders actually wondrous.

Preserve the owner's scarce creative attention for choosing, editing, commissioning, and judging content—not rediscovering elementary engine faults.

## 12. Governing principle

**The game should be immediately playable, locally comprehensible, and globally immense.**

The first torch, person, fight, reward, and wonder should demonstrate the game's fundamental grammar in miniature.

The first settlement and dungeon should reward curiosity rather than compliance with tedious errands.

Beyond that local place, the world's terrain, civilizations, cities, materials, routes, histories, and extraordinary phenomena should have real and persistent existence.

The purpose of these tables is neither to force every settlement into a stereotype nor to populate a checklist of scenery. It is to make Westernesse a recognizable, materially coherent universe whose generated worlds remain meaningfully different—and whose players can gradually discover how large it really is.

---

**Since, the owner (24 November):** "'Ydgn' is intended to be a transliteration of the Lizardfolk name, but Northerners
usually render 'Andayeen'." The desert metropolis is one identity with two names by who speaks.
