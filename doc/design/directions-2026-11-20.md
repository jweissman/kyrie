# A world of distinctive lives (the owner, 20 November 2026)

Written down at the owner's request as the creative and architectural direction it is, **not** an implementation
commission and **not** a set of tickets: "Keep the conceptual designs together rather than decomposing every
illustrative example into a separate defect ticket. Identify explicit proving experiments and dependencies, but do not
let the register turn an ambitious creative direction into hundreds of premature P1 obligations." M22's essential work
continues first (truthful Atlas and action semantics, coherent interaction design, performance, client parity,
architectural maturity, honest backlog reconciliation). M23 is foreseen as a substantial creative-content and
authorability mission, its scope set after more of M22 and human playtesting. Continues doc/design/directions-2026-11-19.md
and doc/design/VISION.md.

**The central ambition:** a world in which people can live distinctive lives, societies can develop distinctive
capabilities, and dramatic experiences emerge from the interaction of authored situations with a persistent
simulation. The ordinary and the extraordinary in the same world.

## Programs (§16) and their proving experiments

| Program | Sections | Proving experiments named | Depends on |
|---|---|---|---|
| Dramaturgy and situation semantics | 3, 4, 5, 6 | a situation with a bounded area and exits, an engagement inside it that ends while the situation goes on; a missing-child incident whose meaning turns; a direct question answered truthfully, falsely, by silence or refusal; two companions signing in silence | the existing Kyr situation, pursuit, objective and event machinery, studied first (§3) |
| Opening experiences and emotional pacing | 2 | a formative childhood episode (three errands, the third goes wrong), confined then emerging; a start in a meaningful scene within fifteen seconds | situations (§3); perks from experience (§9) |
| Professions, perks, civilizational development | 7, 8, 9 | a few elementary professions across several generations, two differently equipped cultures in contact, recording what combines and spreads | competence / profession / office kept apart (§9; MT-21/MT-22's offices) |
| Ordinary activities, economic life, attachment | 1, 10 | pet the dog, milk a cow, cook, set a bone, comfort the dying, write a song, build a wall, acquire a home (the safehouse) | an economy of recognizable desires (§1; SI-07, WD-07) |
| Dramatic interface composition | 11, 12 | a foundations and specimens gallery on the real tokens and components; palette families with the Atlas semantics fixed | the one action grammar (MT-18, Doable); the design review (UI-19..22) |
| Kyr expressivity and an operational environment ("Mercy") | 13, 14 | a tiny world defined, a situation installed, a perception asked, an action invoked, time advanced, state asserted, in one concise environment | the typed exports (KX-03), the layers (MT-16), the fantasy domain apart (the owner, 20 Nov) |
| A wider range of authored experience | 15 | five contrasting short situations: a childhood errand, a physical predicament, a social confrontation, an encounter with wonder, a return home — each judged by its emotional effect in play | all of the above, and human play |

---

The owner's text, kept whole:

I think the central ambition is to build a world in which people can live distinctive lives, societies can develop
distinctive capabilities, and dramatic experiences can emerge from the interaction of authored situations with a
persistent simulation. So Westernesse should support the ordinary and extraordinary within the same world. A person
should be able to pet a dog, milk a cow, cook a meal, practice a trade, comfort a dying friend, build a house, explore
a ruin, command soldiers, and eventually govern a kingdom. These activities require different amounts of simulation and
different interfaces, but they should not feel like unrelated games.

The great design challenge is to construct the appropriate levels of abstraction: physical acts, skilled practices,
professions, engagements, situations, stories, institutions, and civilizations. Kyr should make these increasingly easy
to express, compose, inspect, and test.

## 1. The missing artistic problem: make the player want something

Correctness and freedom are insufficient foundations for enjoyable play.

A player can understand every interface element, complete every available objective, and still experience the world as
tedious. The game needs to create desire, attachment, anticipation, surprise, and occasionally fear.

Three forms of pleasure deserve deliberate attention.

**Immediate pleasure** comes from an individual action or exchange: a responsive conversation, a clever tactical
maneuver, a striking discovery, a good piece of prose, or a satisfying interaction with an object.

**Anticipation** arises when the player sees a desirable possibility beyond their current reach. A ruined tower they
cannot yet explore, a profession they want to learn, a home they hope to acquire, a person they want to impress, or a
magical capability they aspire to possess.

**Attachment** arises when the player begins to care about something already present in the world: a companion, a dog,
a village, a household, an institution, an ideal, a reputation, or a place of beauty.

These pleasures should reinforce one another.

The player might want to earn money because they have found a cottage they would love to inhabit. They might learn a
profession because it gives them a means of earning that money. They might discover an adventure while pursuing that
livelihood. They might make a friend who eventually visits their home.

The systems become compelling through their connections.

The economy, in particular, must support recognizable desires. Money is not exciting merely because its quantity
increases. It becomes meaningful when it can buy security, independence, equipment, travel, a home, specialized
knowledge, influence, or the means to help someone.

The world should also **want things from the player**. Characters should have independent intentions. A person may ask
a favor, demand an answer, offer a bargain, seek protection, express affection, or object to the player's conduct. The
world should not merely wait to be queried.

A memorable experience often involves incompatible goods. Helping a stranger may mean missing an opportunity. Keeping a
treasure may endanger a relationship. Protecting one person may expose another. Neither alternative should always be
obviously correct.

Failure should also have dramatic value. A failed negotiation, lost fight, broken promise, or abandoned undertaking may
produce new circumstances rather than simply terminate play.

Finally, make room for experiences whose reward is intrinsic. Listening to music, feeding an animal, enjoying an evening
at an inn, visiting a beautiful place, or giving someone a present need not produce a quantified bonus.

Westernesse should sometimes be pleasurable when the player is accomplishing nothing.

## 2. Begin with a small world that opens outward

The opening should be redesigned as a dramatic entrance into life, not primarily a character-configuration workflow.

At least one start should take the player into a meaningful scene almost immediately, ideally within the first fifteen
seconds of interaction.

One promising model is a **formative childhood episode**.

The protagonist begins with an intelligible but limited world: a house, a yard, perhaps a nearby wood, a handful of
people, and a few ordinary responsibilities. The world feels large because the protagonist is young. Familiar places,
unfamiliar adults, and apparently small acts carry unusual importance.

The opening is initiated by an event that changes an ordinary day.

Examples:

- It began the morning the floods came.
- It began the morning an army appeared on the hills.
- It began the morning your father failed to return.
- It began the morning something spoke from the barn.
- It began the morning the old bridge collapsed.
- It began the morning a stranger arrived at the house.

These are not merely interchangeable opening sentences. Each inciting incident creates a different situation, with
different people, physical conditions, pressures, and possibilities.

A flood might involve shelter, rescuing animals, moving possessions, seeking help, and crossing water. An approaching
army involves concealment, authority, divided loyalties, and fear. A disappearance invites observation, conversation,
investigation, and suspicion.

The opening need not start with danger. A child might simply be asked to gather three things for supper. The first two
errands introduce the world through pleasant ordinary activity. On the third errand, something unexpected happens.

This creates a natural dramatic progression without requiring the familiar amnesia, prison, or concussion premise.

**Confinement is a useful formal device.** The protagonist's early world should have a real local boundary. The player
cannot immediately travel across the continent or inspect the entire apparatus of the game. The episode makes a small
set of actions meaningful before the horizon widens.

The moment of emergence should be a major artistic beat. After a confined interior or a familiar patch of countryside,
the player encounters a landscape that visibly and imaginatively exceeds everything they have known. The interface opens
with the world.

The contrast should be felt, not merely announced.

Childhood also offers a way to introduce character identity through action. Helping an animal, confronting a frightened
soldier, rescuing a sibling, repairing something, or showing unusual curiosity can establish a formative history and
grant a distinctive perk.

These perks can be mechanically substantial and narratively specific. A childhood experience with frightened horses
might produce an unusual capacity for handling animals; helping during a flood might develop a practical familiarity with
water and boats.

Do not make the optional childhood experience a mandatory optimization exercise. Players who skip it should receive
viable, comparable background capabilities. Those who play it gain a personal history and consequences that the world
can remember.

The world should also be experienced differently through a child's attention. Time might be described as *before supper*
or *when mother returns* rather than through watches, calendar arithmetic, or wages. The engine can retain precise time
without forcing those details into the child's immediate experience.

The first five to fifteen minutes should expose the principal pleasures of Westernesse through a coherent dramatic
episode: perception, physical interaction, human connection, risk, discovery, and changing circumstances. Combat may
occur, but a mandatory tutorial fight is not required.

The goal is an emotional contour: vulnerability or curiosity, discovery, growing competence, a complication or reversal,
release, and a new desire carrying the player into the larger world.

## 3. Situations and engagements should organize dramatic participation

The authoring system already has situations. The next step is to clarify their dramaturgical and executable meaning,
rather than inventing an unrelated system.

A useful conceptual hierarchy distinguishes:

**Story:** a meaningful development through time, potentially comprising several connected incidents, situations, and
outcomes.

**Plot:** an authored or retrospectively recognizable organization of developments, reversals, and consequences.

**Incident:** a consequential happening that initiates, redirects, interrupts, or intersects with a story.

**Situation:** a bounded episode of play, potentially with several stages, local constraints, and distinct resolutions.

**Engagement:** an immediate interaction demanding a response, such as combat, a direct question, confrontation, or
sudden physical hazard.

**Scene:** an experienced span of place, time, participants, and attention.

**Event:** something that occurs and changes, reveals, or records world state.

**Action:** an actor's attempted intervention in the world.

These concepts overlap but should not be conflated.

The particularly important distinction is between **situation** and **engagement**.

A situation governs a whole episode. It may define a local playable area, meaningful sequence of activities, progression
conditions, and available exits. While it is active, ordinary strategic travel, unrestricted waiting, and unrelated
world-map activity may be unavailable.

An engagement is a more immediate demand within that episode. An enemy attacks. A parent asks a direct question. A beam
begins collapsing. The player must respond to the present circumstance.

An engagement may end while the encompassing situation continues.

For example, a flood might create a situation in which the protagonist must get their family to safety. The house, yard,
and riverbank form the playable area. The player can gather objects, investigate, communicate, and attempt rescues, but
cannot depart on an unrelated strategic expedition.

Within that situation, a brother becomes trapped. The immediate engagement concerns rescue, escape, seeking assistance, or
another relevant action. Later, the father demands to know where the sister has gone; this creates a conversational
engagement.

Eventually the larger situation resolves. The family may be safe, scattered, injured, or lost. Ordinary travel becomes
available again, and the consequences remain part of the persistent world.

Situations need not be dangerous. A village celebration, household errand, apprenticeship examination, dinner, or
ceremony could use the same broader idea.

A situation must have intelligible failure, refusal, interruption, and exit semantics. It must never leave the player
permanently locked into an impossible sequence. Its conclusion need not be success.

Situations also organize temporal attention. Combat may unfold in short intervals, an emergency in minutes, and a
childhood afternoon through a handful of meaningful acts. Preserve coherent world time while allowing local presentation
and progression to operate at the appropriate scale.

Study whether the existing Kyr action, pursuit, objective, event, and situation machinery can support these requirements
cleanly. Add new language or runtime concepts only where the executable distinctions genuinely require them.

## 4. Dramatic structure can be formal without dictating emotion

Authors should be able to describe the intended structure of a story or situation and inspect whether play realizes it.

A dramatic situation often contains an initial arrangement, something unresolved, a developing pressure, opportunities
for action, a turn or reversal, and one or more outcomes.

But a reversal must not be mandatory in every scene, nor should every story be forced into a fixed sequence of stages.

A missing-child incident might initially appear to call for rescue. Investigation reveals that the child fled someone the
protagonist trusted. The meaning of the undertaking changes. Rescue, negotiation, concealment, abandonment, and loss may
all be possible outcomes.

The important structure is causal and interpretive, not merely sequential.

Several stories should also be able to interlace. A dispute over a mill, a threatened invasion, a missing child, and the
protagonist's effort to acquire a home might share people, resources, places, and consequences.

The world should allow their intersections to create new developments, rather than treating each quest as an isolated
branch of a central plot.

A dramaturgical authoring or inspection tool could show:

- The inciting circumstances and participants.
- What each participant wants.
- The major states and possible transitions.
- What the player can learn at each point.
- Which circumstances create pressure or urgency.
- What developments constitute a reversal.
- The supported resolutions and their persistent consequences.
- How the situation connects to other active stories.

This can be represented graphically or topologically, but it should not become a rigid plot scheduler.

Authors may intend fear, sympathy, wonder, relief, or exhilaration. The system can verify the structure and available
consequences; it cannot guarantee the player's emotions.

The difference between intended and experienced dramatic effects should be studied through actual play.

## 5. Conversations should be encounters between wills

Conversation currently risks becoming an interface through which the protagonist interrogates passive characters.

People should initiate exchanges, ask questions, make demands, accuse, bargain, refuse, interrupt, and change their minds.

When someone asks the protagonist a direct question, the interaction should have an immediate conversational shape.

The player may answer truthfully, lie, evade, refuse, remain silent, ask a question in return, or depart where possible.

Those responses should be treated as meaningful actions. Silence is not simply the absence of menu selection. Refusing to
answer can be revealing, irritating, amusing, intimidating, or protective depending on the people and circumstances.

Skill checks belong naturally in these exchanges, but success must respect the other person's knowledge, motives, and
authority. A persuasive answer might secure a limited favor or reveal a new opportunity rather than force unconditional
obedience.

The broader communication system should also distinguish **message, medium, recipient, and knowledge of the medium**.

People communicate through speech, gesture, sign, writing, messengers, horns, flags, signal fires, music, and magic. Each
channel has affordances and constraints.

Speech can be overheard. Sign requires visibility and a shared language. Writing takes time and materials. Military
signals may travel long distances but carry limited messages. A messenger may be delayed or intercepted.

A small stealth situation in which two companions can communicate silently through learned hand signals would be a useful
proof. The same principles could later support signaling between military formations and coordination of large-scale
operations.

Avoid building an exhaustive communications simulator before demonstrating a few valuable cases. But preserve a
conceptual model that can extend naturally from an intimate conversation to command and coordination.

## 6. Combat should be abstract, legible, and dramatically decisive

Do not assume tactical richness requires a grid.

Westernesse should first make its abstract combat satisfying.

When a creature attacks, the foreground should communicate the immediate threat and relevant responses. The player may
stand and fight, flee, surrender, defend someone, use an ability, or take a contextually meaningful environmental action.

An encounter should not be presented alongside unrelated ordinary activities as though nothing urgent is happening.

The situation governs participation; the underlying rules determine what the actors can actually do.

Combat needs visible intentions, intelligible danger, useful preparation, meaningful defenses, and consequences that alter
the encounter. A creature preparing a dangerous attack should communicate enough for the player to recognize the threat. A
companion holding a doorway, an enemy behind cover, or an object that can be overturned should matter without requiring
exact tile-by-tile positioning.

Abstract relationships such as engagement, protection, exposure, reachability, retreat, cover, and formation can carry
substantial tactical meaning.

A future local map, roguelike presentation, or 3D view can project these committed relationships into space. Geometry
should not become the source of truth merely because it is visually convenient.

Make the existing abstract combat loop compelling before building increasingly sophisticated spatial interfaces.

## 7. Professions should form a generative model of civilization

This is a major research direction, not a conventional RPG job tree.

Begin with cultures containing different mixtures of relatively elementary professions and productive practices.

Across several generations, individuals form households, have children, teach, apprentice, trade, migrate, marry, and
encounter people with different traditions.

Knowledge and practices are transmitted, combined, modified, and sometimes lost.

**Professions can recombine to produce new professions.**

A farmer and merchant's traditions might support agricultural trading. Mathematics and masonry might lead toward
architecture. Navigation and astronomy might yield more sophisticated navigation. Healing and botany might develop
specialized medicine. Scholarly and military practices might produce strategy.

The most elementary version of this model could explicitly allow children to develop professional possibilities from
combinations of their parents' practices.

But it should extend to teaching, apprenticeship, intercultural contact, and other means of transmission. Inheritance
provides access, expectations, tools, and knowledge—not an unavoidable destiny.

The combination graph should be sensitive to conditions.

A society cannot develop advanced shipbuilding without suitable materials, tools, productive capacity, and access to
relevant techniques. A mathematical tradition may exist without the institutions needed to turn it into engineering. A new
craft may arise because trade introduces an unfamiliar material or technology.

Over generations, societies acquire different socio-technical repertoires.

A coastal civilization might develop specialized navigation, shipbuilding, commerce, maritime law, and naval warfare.

An inland agricultural society might develop irrigation, surveying, crop management, accounting, grain storage, and
institutions of land administration.

These differences should arise from intelligible historical pathways rather than being assigned as arbitrary cultural
bonuses.

A profession therefore needs a richer formal definition than a name and starting statistics. Relevant properties may
include constituent competences, tools, materials, practices, products, environmental requirements, knowledge
transmission, social recognition, associated institutions, and opportunities for specialization.

Not every one of these requires its own primitive. The goal is a coherent enough model for combinations and historical
development to yield credible results.

Test a small set of starting professions through several generations, allowing contact between two differently equipped
cultures. Record what professional combinations arise, what knowledge spreads, and what material and institutional
differences result.

The simulation need not play every childhood and apprenticeship moment by moment. It can advance populations at an
appropriate aggregate scale while preserving representative histories and meaningful causal relationships.

Its outputs should be visible in the playable world: buildings, trades, tools, goods, people, institutions, and regional
practices.

This would give Westernesse a generative account of **how civilizations acquire their capabilities**, not merely what
capabilities a world generator assigns to them.

## 8. The same profession graph should be playable

The civilizational model should become a major source of character progression and everyday content.

A player can learn the professions available in their homeland, encounter unfamiliar ones through travel and
relationships, and gradually discover combinations.

Each profession should support its own small progression of meaningful activities. These may include apprenticeship,
ordinary work, an unusual problem, a test of competence, and recognition of mastery.

A shepherd might learn animal care, herding, signs of illness, and protection from predators. A mason might learn
materials, repair, structural judgment, and construction. A cook might progress from everyday preparation to the
challenge of an important feast. A clerk might learn accounts, administration, and eventually the detection of fraud.

A large profession graph could support **hundreds of small undertakings and associated perks**, embedded into the ordinary
life of settlements.

This makes perk hunting a legitimate style of play. A player might travel widely to learn unusual trades, complete
characteristic professional challenges, and discover new capabilities through combinations.

The occupational graph becomes a landscape that the player can explore through their own life.

Do not reduce this to performing one repetitive action fifty times.

Progress should arise through meaningful practice, increasing difficulty, application in new circumstances, teaching,
innovation, and demonstration of competence. Routine work can still contribute to experience, but the most engaging
professional progressions should contain distinctive situations.

Professions should also help generate settlement content. A village of millers, farmers, smiths, and herders should
contain work, tools, products, transactions, problems, and relationships arising from those professions.

A port populated by sailors, navigators, merchants, and shipwrights should offer a different texture of everyday life.

This is how the profession system becomes a prolific source of believable content rather than an isolated
character-advancement screen.

## 9. Perks should be a central means of sculpting character identity

Perks may become one of Westernesse's principal mechanisms for character differentiation.

A character's identity can be shaped by ancestry, class or calling, background, upbringing, professions, earned
distinctions, relationships, institutional membership, and exceptional experiences.

These sources need not all use identical progression rules, but they should compose intelligibly.

Perks should frequently alter the **repertoire of possible actions and perceptions**, not just numerical effectiveness.

A person trained in masonry can recognize a weakness in a wall. A navigator can read conditions others overlook. An
experienced animal handler can calm a frightened horse. Someone skilled in administration can recognize a shortage or
implausible account.

Those capabilities should create new opportunities in the same world, making advancement visible in ordinary play.

Some perks can of course be numerical bonuses, especially in combat or physically demanding tasks. Others might alter
requirements, improve reliability, provide new observations, unlock techniques, or change the consequences of an
activity.

Distinguish three things:

- **Competence:** what the person actually knows or can do.
- **Profession:** a sustained practice combining competences and recognizable social activities.
- **Office:** a position of authority or responsibility granted by an institution.

A skilled agricultural trader may be qualified to serve as a grain steward without holding that office. A politically
favored person might hold the office while being bad at the work.

Maintaining these distinctions makes social mobility, institutional life, and personal specialization much more
interesting.

The long-term character fantasy is not merely moving upward through a hierarchy of classes. It is acquiring an
increasingly distinctive history of capability, practice, relationships, and authority.

## 10. Ordinary activities should be real, and some should be delightful

Use a broad repertoire of ordinary human activities as a positive stress test of the simulation.

A useful philosophical inspiration is Heinlein's list of practical and extraordinary human capacities: care for a child,
cook, build, navigate, command, cooperate, make art, fight, and face death.

Westernesse should offer an analogous breadth of participation.

Start with deliberately contrasting examples:

**Pet the dog.** The dog is an actual creature with a disposition and circumstances. A friendly dog may respond
affectionately, a fearful one may withdraw, and a hostile one may bite. The interaction need not yield experience or a
friendship score to be worthwhile.

**Milk a cow.** The activity has relevant conditions, takes time, requires appropriate means, and produces milk that can
be used, traded, or given away. It doesn't require a complete agricultural biophysics model.

**Prepare a meal.** Ingredients, technique, tools, and circumstances produce a recognizable result. The activity may be
routine, or it may become important during a feast, shortage, journey, or act of hospitality.

**Set a broken bone.** Skill and materials can change another person's actual condition, with consequences for recovery
and mobility.

**Comfort the dying.** The player can affect another person's experience without necessarily saving their life or
obtaining a measurable reward.

**Write a song or poem.** The world can recognize creative production and its social consequences without reducing art to
an ordinary commodity.

**Build a wall.** Labor, material, knowledge, and time produce a persistent change to a place.

**Acquire a home.** The player can obtain shelter through purchase, gift, labor, inheritance, or adventure. It becomes a
real persistent location where they can rest, keep possessions, host visitors, and return.

The safehouse is especially valuable as an early emotional reward. At the beginning, the protagonist may be confined in a
place they desperately wish to escape. Later they gain a place they can enter, inhabit, and close against the world by
choice.

That is a powerful transformation from helplessness to belonging.

Don't immediately build a furnishing marketplace or construction-management system. First prove that acquiring,
inhabiting, and returning to a particular place feels meaningful.

These examples should test the relationship between authorable world properties and player intention. Not every
conceivable act needs a dedicated subsystem, but ordinary intentions should not be systematically ignored because they
aren't combat, travel, or quest advancement.

## 11. The Atlas and the four choices organize attention, not the universe of actions

The usual foreground should contain a small number of salient choices, often two to four.

These are not four permanent action categories or an exhaustive enumeration of legal behavior. They express what
currently deserves attention.

At a quiet roadside scene, the foreground might present an interesting traveler, suspicious tracks, and a road onward.

During combat, it should present immediate tactical responses.

In conversation, it should present replies to what the other person has actually said or asked.

During a childhood situation, it may present only two or three meaningful possibilities.

The broader action repertoire remains reachable through people, objects, abilities, local exploration, inventory, and
other focused views where lawful.

The engine and presenter must distinguish:

1. What actions are meaningful in the general simulation.
2. What actions are currently available under the character's circumstances and active situation.
3. Which available actions deserve immediate foreground emphasis.

A situation may remove strategic travel or arbitrary waiting from the lawful action set. The map should yield to the
situation. Attempting to reopen it should communicate why strategic travel is currently unavailable.

An engagement may take command of immediate attention without deleting every underlying affordance.

Color should communicate grounded significance, not the general excitement of an activity.

Ordinary actions that bear no special Atlas aspect can still be valuable. Gray or neutral should not mean boring,
inconsequential, or excluded from character advancement. A player may pursue an ordinary profession for satisfaction,
mastery, income, or the acquisition of perks.

The Atlas should reveal meaningful opportunities, not dictate what the player ought to care about.

## 12. Develop a design system for composing dramatic questions

A single consistent action-row component is a useful foundation, but it should not force every interaction to look like
the same generic menu.

A direct question in a conversation, a decision under immediate danger, a discovery, a formative choice, and a tactical
action can share authoritative selection semantics while receiving different visual compositions.

The page should pose the current question clearly.

A conversational response can appear beneath a portrait and the speaker's words.

A physical predicament can foreground the environment, the danger, and the available interventions.

A character-defining decision can give greater emphasis to the alternatives and their emotional context.

An object interaction can use its likeness, material qualities, and relevant actions.

Keep the interaction grammar coherent. The difference is in visual and narrative composition, not incompatible action
systems.

Build a small **foundations and specimens gallery** using the real design tokens and components.

Show typography, control states, spacing, color swatches, neutral and semantic colors, and representative full-page
compositions. Include creation, ordinary exploration, conversation, danger, discovery, the Book, and the Encyclopedia.

Experiment with coherent palette families: restrained metallic colors, softer pastel variants, heightened luminous or
neon-like treatments, and other aesthetically distinct realizations.

The point isn't to ship arbitrary user themes. It is to see how the same semantic colors and components feel under
different artistic treatments, and to establish a much stronger visual language.

The semantic meaning of gold and other Atlas colors must remain stable. Their specific material and chromatic rendering
can evolve.

## 13. Kyr needs a dramaturgical and authorability review

The language should be evaluated in light of the difficulties encountered while writing actual adventures.

Identify recurring low-level boilerplate, duplicated expressions, awkward composition, inconsistent incident declarations,
missing ways of expressing situations and story progression, and places where authors must write TypeScript to achieve
ordinary fictional effects.

The goal is to climb the abstraction ladder without creating competing engines.

The existing distinction between low-level facts and effects, higher-level authored worlds, and operational commands
deserves deliberate examination.

A more expressive Kyr might support first-class declarations or libraries for situations, professional practices,
reusable dramatic structures, types, measures, units of value, and universe-specific preludes.

A higher-level environment, provisionally **Mercy**, could provide universe configuration, module composition, scenario
instantiation, command execution, inspection, and assertions.

Its role might be that of a small declarative host or interactive shell rather than a second general-purpose interpreter.

For example, the same environment should eventually be capable of defining a tiny world, installing a situation, asking
what a character perceives, invoking an ordinary engine action, advancing time, and asserting the resulting world state.

It should serve as an exceptionally concise proving environment for the engine's concepts.

Explore whether this is best expressed as a superset of Kyr, a separate minimal language, or a module-and-REPL facility
within Kyr itself.

The important objective is **one coherent semantic core with increasingly powerful ways of composing and operating upon
it**.

As Kyr approaches 0.1, distinguish language syntax compatibility, semantic interpretation changes, rule-library changes,
generated-world changes, and persistence/replay compatibility. Breaking changes may be necessary and worthwhile, but their
consequences should be deliberate and visible.

## 14. Build the engine around stable semantic boundaries

The architecture should continue toward a setting-independent simulation core, reusable domain rules, a coherent
world/action API, and one authoritative player projection.

Prefer pure, deterministic functions of explicit inputs where possible. Keep random draws, world-state commitments, time,
and persistence under clear ownership.

Boundary tests are particularly valuable: does a lawful action produce the expected consequence, does a situation restrict
the correct activities, does an engagement preserve its participants and state, does event processing occur in a stable
order, and do browser, terminal, and headless runner agree?

Tests should strongly protect observable behavior without unnecessarily freezing private internal structures.

A substantial refactoring should be able to reorganize implementation details while preserving the same externally
meaningful guarantees.

Profile the actual cost of assembly, installation, acts, projection, and testing before adding general abstractions or
considering a lower-level implementation language.

These are not ends in themselves. They exist to make the authoring of new experiences substantially faster and more
dependable.

## 15. Expand the imaginative range of authored content

Westernesse needs more than greater quantity.

Its existing fiction has repeatedly gravitated toward debts, offices, ledgers, old obligations, custodians, and
misunderstood institutional machinery. That is a legitimate imaginative register, but it cannot constitute the whole
world.

Actively author contrasting forms of experience: romance, wild nature, animal intelligence, comedy, terror, crime,
chivalry, erotic and sensual life where appropriate, art, religious devotion, military danger, extraordinary magic, alien
civilizations, and the grotesque or magnificent.

Let wonders remain wonderful. Not every mystery should resolve into the correct reading of an ancient administrative
procedure.

Strong prose and the author's judgment remain indispensable. Formal dramaturgy cannot substitute for a memorable
character, a strange image, a frightening encounter, or a moving exchange.

Build several genuinely contrasting short situations, not simply more reskins of one opening.

Useful experiments would include:

**A childhood errand:** ordinary life, learning, an unexpected complication, and a formative consequence.

**A physical predicament:** darkness or confinement, perception, environmental interaction, risk, and emergence.

**A social confrontation:** a person asking a difficult question, with truth, deception, silence, refusal, and
relationship consequences.

**An encounter with wonder:** an extraordinary event or creature whose implications exceed the immediate task.

**A return home:** something acquired or changed during an adventure becomes meaningful in the player's ordinary life.

Each should produce real persistent consequences. Each should be judged for its emotional and dramatic effect, not merely
its completion rate.

The most important evidence remains human play: what the player remembers, what they care about, when they feel curious
or afraid, when they become bored, and what they voluntarily want to pursue next.

## 16. How to preserve and develop these directions

These ideas form several distinct but connected programs:

- Dramaturgy and situation semantics.
- Opening experiences and emotional pacing.
- Professions, perks, and civilizational development.
- Ordinary activities, economic life, and attachment.
- Dramatic interface composition.
- Kyr language expressivity and the higher-level operational environment.
- Authoring a wider range of literary and fantasy experiences.

Keep the conceptual designs together rather than decomposing every illustrative example into a separate defect ticket.
Identify explicit proving experiments and dependencies, but do not let the register turn an ambitious creative direction
into hundreds of premature P1 obligations.

Continue M22's essential work: truthful Atlas and action semantics, coherent interaction design, performance, client
parity, architectural maturity, and honest backlog reconciliation.

M23 should be considered a substantial creative-content and authorability mission, using playable situations and broad
content production to discover the next genuinely valuable engine capabilities. The scope should be established after
further M22 progress and human playtesting.

The long-term goal is not a simulation containing every imaginable subsystem.

It is **one world in which human activities, professional traditions, dramatic situations, institutions, cultures, and
individual lives all arise from a coherent set of understandable and composable principles**.

The player begins as one person within that world. Through action, knowledge, relationships, labor, discovery, and
sometimes extraordinary power, they become someone increasingly particular.

The world grows larger as their capabilities and understanding grow.

But even when they can command armies or govern kingdoms, the ordinary world remains available.

They can still come home, cook supper, comfort a friend, or pet the dog.
