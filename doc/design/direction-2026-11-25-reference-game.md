# The reference game: one small place worth inhabiting (the owner's direction, 25 November)

Three notes from the owner on 25 November: narrow the playable core; a five-resource economy and a minimal
settlement; planning the next phase. What follows keeps the owner's own terms. Where the owner marked something as a
hypothesis, it stays a hypothesis here. The governing ambition, in the owner's words: **make one small place worth
inhabiting, then make it possible to build a thousand more.**

The beta execution plan continues: performance, authoritative actions, situation continuity, platform separation, Kyr's
maturity. This is a bounded flagship within it, not a restart.

## 1. One permanent reference game

A brutally constrained Westernesse scenario, kept playable continuously, and made more interesting over time rather than
replaced:

**One tiny settlement → one nearby wilderness → discoverable dungeon entrances → repeated descents → retreat and
recovery → another descent.**

It must be compelling even if the player never leaves the town, the woods and the dungeon. New language, runtime, rules,
generation and interface capabilities show their value through it where they can. The acceptance question:
**would I willingly make a fifth expedition into this dungeon, knowing what happened on the first four?** Until the
answer is yes, more world content is not the priority.

## 2. The settlement: three functions, each working end to end

The first settlement is terrain-appropriate (a fishing village, farming cooperative, desert encampment, mountain
hamlet). It varies in character, people, products and constraints. Its function is almost absurdly small:

- **Trader 1:** provisions, equipment, buying and selling.
- **Trader 2:** local specialties, exchange, information, perhaps companions.
- **Shrine:** rest, recovery, reflection, ritual.

These may be three people or stations in one encampment. There are no decorative businesses, large social rosters or
errand lists. **Trade opens a real exchange:** authoritative inventories, prices, ownership and consequences. Routine
upkeep gets easier as the character grows, rather than staying a sequence of chores.

## 3. The wilderness: a genuine exploratory environment

The old woods lie just outside the settlement, and the player can go at once. Exploring is repeatable, with real costs
in time, fatigue, provisions, light and risk. It offers:

- varied encounters, discoveries and resources;
- conditions that depend on the weather;
- occasional wonders;
- several points of interest, some known and some found by exploration, observation, rumour, tracks or changing
  circumstance.

**A hex holds several independent points of interest and entrances, not one forcibly connected topology.** No chains of
empty map clicks, and no generic fetch errands.

## 4. The dungeon: the main game

The dungeon is deep enough for a long campaign of descents, conceptually hundreds of levels (perhaps about 900). It is a
long-range generative target, not something to author, instantiate or exhaustively test.

**What matters is a repeatable, progressively demanding dungeon ecology:**
- the early levels teach combat, light, provisions, traps, equipment, retreat and recovery;
- deeper levels expose environmental hazards, resistant and unusual creatures, magic, status effects, specialised
  equipment, strategic preparation, distinct enemy behaviour, and harder choices.

Dungeons connect plausibly to broader underground places (caverns, mines, old industrial or military complexes, buried
cities, stranger structures) without every one becoming the same rooms and stairs. Retreat is legitimate and often
wise, and returning is part of the game. It is **the principal integration gauntlet for combat and SRD work**.

## 5. Deterministic, lazy realisation (with a living world)

The dungeon, the wilderness and the network of points of interest derive from stable seeds and persistent world state.
A place may exist as a deterministic generative specification until it is approached. It is then realised in detail,
and its consequential state is persisted.

**What lazy realisation must guarantee:**
- revisiting recovers the same geography and established contents, changed by what has happened since;
- generation must not depend on exploration order: stable site identities, local seeds, generation versions and
  explicit persistence boundaries;
- two traversal orders give consistent shared geography;
- revisits keep the player's changes: enemies defeated, resources depleted.

**Lazy is not "exists only when observed"** (the owner, the same day, on SP-02):
- unvisited places keep abstract histories, populations, pressures and transitions, simulated at an appropriate
  resolution;
- strategic adversaries act whether or not the player watches;
- anything that can affect the player, or that the player could learn of, is simulated at a scale that captures it.

## 6. The economy: a hypothesis to prove on a tabletop first

A compact resource economy makes the game strategic rather than a sequence of menus, wiki-like talk and errands. The
owner's **provisional** associations of Atlas colour, resource family and play:

| Colour | Resource family | Play | Payoff |
|---|---|---|---|
| Gold | money, exchangeable valuables | trade, work, rewarded tasks | equipment, services, shelter, help |
| Blue | glass, lenses, gems, instruments | investigate, observe, study | knowledge, routes, discoveries, materials |
| Red | meat, hides, trophies, game | hunt, confront, fight | sustenance, trophies, materials, martial chances |
| Green | plants, timber, crops, husbandry | gather, grow, tend | food, medicine, crafting, renewables |
| Fifth, to be settled | perhaps relics, minerals, the sacred | explore, excavate, wonder | rare capabilities, transformations |

**These are hypotheses, not replacements for the Atlas's established meanings.** Audit the current meanings first,
settle the fifth from the actual ontology, and preserve useful semantics. Colours orient the player to *a kind of
opportunity*; they do not promise a currency. Time and fatigue are shared constraints, not colours.

**The design requirements:**
- **Competing, viable strategies,** not upkeep chores and not five isolated minigames. Each resource needs:
  - what produces it and what consumes it;
  - what it can be traded for or turned into;
  - what it enables;
  - what gold cannot simply substitute for.
- **Resources flow into one another:** hunting meets gathering; specimens invite observation and comparison;
  investigation reveals finer distinctions, improves future hunting and gathering, and uncovers new affordances.
- **Terrain grounds the economy in the world model,** not in flavour text: a coast trades fish, shell, pearl and lapis;
  a desert has caravans, glass, rare stones and oasis growing; mountains have metals, fungi and stone. Implement **one**
  terrain thoroughly, with contracts that let a second be tried cheaply.
- **A daily activity economy:** meaningful work, hunting, exploring, investigating and recovery take time or fatigue
  while others and the world change. There is no universal cost per click, and routines and institutions absorb chores
  once the character can afford them.
- **Tabletop first:** a one-page rules sheet and a production-and-conversion table; about 15–20 consequential
  activities; a few people with their own motives; a short run of simulated days. Play or simulate a hunter who sells
  game, an investigator who trades earnings for tools and knowledge, a gatherer or cultivator who builds a reliable
  supply, and an opportunist who combines them. **If optimal play reduces to grinding one action for gold, revise the
  economy before encoding it.**
- **Architectural boundaries:**
  - ordinary authoritative facts, inventories, actions, time, effects and rules, with no parallel minigame engine;
  - Kyr keeps the authorial meanings, and Deem varies terrain without breaking the relationships;
  - the common player presents costs, effects, inventories and opportunities without deciding legality or value;
  - other settings with other resources must be able to use the model.

## 7. The same place reveals more as the character learns

This is a guiding principle. The player first sees a forest, animals, plants, perhaps a ruin. Through hunting,
gathering, observation, conversation, instruments and reflection they come to know the same place more precisely, and
new knowledge reveals new actions and material properties. **Knowledge belongs to characters; truth belongs to the
world; the interface respects the distinction.**

**The microscope is the exemplar:**
- Examining a specimen can reveal elaborate structures (mechanical, organic or hybrid), possible material traces of the
  late Mathematical Age and its deliberate diversification of life.
- It is not a generic "reveal secret" button. Observations follow from the specimen, the instrument's capability and
  established facts. Characters may form different hypotheses, and may be wrong.
- **A modest proving progression:** meet a plant or creature → collect a specimen (it keeps its identity and properties)
  → examine it with the senses → acquire or use an instrument → discover a new property → unlock a consequential
  investigation or capability. The player is never given the precise investigation before having a legitimate reason
  to form it.
- **Canon to develop carefully, not to simulate in beta:** the differentiation of intelligent species, and pervasive
  biological and microscopic machinery, may come from deliberate interventions in the late Mathematical Age, meant to
  make civilisation resilient against monoculture.

## 8. What to stop, for this slice

- A sprawling initial quest roster standing in for content.
- Hours of travel for inconsequential errands.
- Geographic breadth as a substitute for depth.
- More NPCs, settlement services, quest types, regions or bespoke interfaces, until the existing ones have
  consequential interactions.

Make one trader economically interesting, one companion memorable, one dungeon region dangerous, and one discovery
genuinely surprising.

**Kept alive as gamma and later commitments,** never allowed to enlarge the reference game:
- the civilizational atlas;
- canonical cities and full-city simulation;
- deeper historical simulation;
- broad SRD/Orsino completion;
- advanced instruments;
- speculative 3D;
- a complete narrative campaign.

## 9. The platform it proves

The loop exercises:
- authoritative actions, situation state, focus and Atlas truth;
- time, fatigue, recovery, materials, inventory, equipment and trade;
- character and companion capabilities, tactical combat and risk;
- generated places, persistent identity, deterministic replay and lazy realisation;
- encounter, discovery, wonder and knowledge;
- Kyr authoring and typed Deem generation;
- fast isolated tests and seeded journeys;
- the setting-independent engine and common player.

Separation continues (Kyr; the authoritative interpreter and kernel; the runtime and installed domain; the common player;
the clients). A deeply simulated island, this dungeon expedition and a science-fiction vessel remain the architectural
counterexamples that keep fantasy assumptions out of the platform. Not all three are built now.

**Each substantial technical change should have a low-level invariant and a playable or authorial demonstration.** For
example, knowledge gating should make conversation believable, and a unified action model should end contradictory
Atlas signals.

## 10. Acceptance measures repeated play

An independent player:
1. begins a life quickly and understands the immediate possibilities;
2. obtains equipment and companions;
3. explores the woods and discovers an interesting entrance;
4. meets meaningful resistance, gains something valuable, and decides whether to push deeper;
5. retreats, recovers, sells or keeps loot, and prepares better;
6. returns to find persistent, comprehensible changes;
7. descends farther, meeting new challenges rather than the first level again.

Test repeated expedition cycles across seeds: whether combat consumes meaningful resources, whether retreat is
sometimes rational, whether discovery is novel, and whether deeper play adds mechanics. Prove a small contiguous depth
slice, then sparse much-deeper samples and the generation and revisit invariants.

**Classify failures at their own level, and fix them there:**
- **mechanical:** broken commands, wrong outcomes, contradictory knowledge, persistence, invalid generation;
- **design:** trivial choices, dominant strategies, pointless travel, too little resistance, unclear progression;
- **editorial:** dull prose, forgettable people, unconvincing places, discoveries that stir no curiosity.

Do not repair boring writing with engine abstractions, or disguise broken simulation with prose. A literary review and a
tabletop balance exercise can run beside engineering.

**Report progress in terms of experience,** beside invariants and performance:
- What became more interesting to do?
- What became easier to understand?
- What new possibility can the player discover?
- What can an author now express more naturally?
- What unnecessary complexity was removed?

## 11. Deliverables (the economy note's)

1. A one-page economic rules model and an explicit resource-conversion table.
2. A playable minimal settlement with two real traders and a shrine.
3. One terrain-specific resource economy connected to wilderness and dungeon.
4. A multi-day, repeat-expedition test with meaningful consumption and payoff.
5. An assessment of which colour associations work and which should change.

**The ninety-day outcome stands** (late February): an extremely fast, well-isolated, genuinely playable platform, with:
- a polished common interface;
- enforceable package boundaries and strong tests;
- substantial SRD/Orsino coverage;
- at least one satisfying complete game loop.

The ninety-day work should make the one-year ambitions easier, not merely accumulate prerequisites for them.
