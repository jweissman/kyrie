# Conflict, economy, boredom and stimulation

A grounded design audit of Westernesse's reference game, 26 November 2026.

## Question

The reference game asks one unusually sharp acceptance question: **would a player willingly make a fifth expedition into
the same dungeon, knowing what happened on the first four?** This is the right question because it tests the difference
between a world that can generate activities and a game whose activities form a desire to continue.

This report addresses four connected concerns:

- **Conflict:** what gives a situation stakes, choices and readable consequences?
- **Economy:** how scarcity and reward create plans rather than chores?
- **Boredom:** which repeated acts consume attention without changing the future?
- **Stimulation:** what creates anticipation, surprise, curiosity, mastery and payoff?

The scope is the supported settlement, wilderness and dungeon loop, not the full world. It follows the
[reference-game direction](../design/direction-2026-11-25-reference-game.md), the
[M22-beta brief](../architecture/mission-22-beta/BRIEF.md), and the instruction to hold the first part of the world low
so that later depth is noticed in [Composition by contrast](../design/direction-2026-11-26-composition.md).

## Executive judgment

Westernesse is not suffering primarily from a lack of systems or content. It has combat, flight, morale, surrender,
environmental interaction, finite stock, consumables, encumbrance, recovery, persistent dungeon changes and
knowledge-gated actions. It is suffering from a gap between **legal variety** and **consequential variety**.

The current loop often looks like this:

```text
notice an action -> perform it -> receive text, an item or a fact -> continue
```

The loop should become:

```text
read a developing situation -> prepare under scarcity -> choose an approach ->
resolve a legible conflict -> bring back a persistent consequence -> unlock a new decision ->
choose the next expedition
```

The first loop measures activity. The second creates stimulation because the result of one expedition changes the terms
of the next.

The evidence points to four root causes:

1. **A broad action catalogue is compressed into few recurring situation shapes.** The variety study found that the
   first town's three undertown jobs share the same creature-at-a-locked-place shape and the same payment consequence.
   See [Story-shape variety](../architecture/mission-22/variety-study/report.md).
2. **Scarcity is real but conversion is thin.** A player can run short of coin, food and light, but large expedition
   gains have often not opened another place, capability or relationship. `WD-07` remains the clearest expression of
   this gap.
3. **Boredom is usually state repetition, not sentence repetition.** Repeated prose has improved, but repeated rooms,
   inert searches, greetings without useful information, waits with no object of attention and dead administrative
   actions still occur. The fixed [boredom census](../architecture/mission-22/boredom-census.md) is capable of measuring
   only part of this pattern; its definitions need to grow from “fresh line or changed fact” toward “changed future
   choice”.
4. **The strongest moments are already consequential and specific.** Cold players remembered telegraphed danger, a
   firebomb used against a real weakness, a world that changed while they were away, a drowned hall, a notebook and an
   inscription. They were least interested in generic fights, filler loot, hidden administrative rows and unexplained
   deaths. See [the fifth-expedition cold play](../design/cold-play-2026-11-25.md).

### Recommendation

Do not add a wider quest roster, more settlement businesses or more resource types into play yet. The next useful
increment is a **five-expedition proving scenario** that forces each successful return to create one new strategic
possibility and one persistent world consequence.

The first economic addition should be tested as a tabletop model. The five-resource hypothesis may be sound, but its
terms and conversion graph are not yet the product. First prove the simpler contract that money, materials, knowledge,
relationships and time cannot substitute for one another in every situation.

## 1. Evidence base

This is a source, test and recorded-play audit. No claim of new human acceptance is made.

### 1.1 What is already structurally strong

The game has useful foundations that should not be replaced in pursuit of stimulation:

- Combat is an authoritative, persistent process with attacks, conditions, damage, elimination and legal commands in
  `src/battle.ts`.
- Flight is a distinct resolution rather than an escape animation. Retreat odds and morale are modelled in
  `src/rules/flight.ts` and `src/rules/morale.ts`.
- Surrender is available when a thinking enemy band is losing, as implemented in `src/parley.ts`.
- `Press on` now stops for material danger, company members in trouble and other stated conditions in
  `src/press-on.ts`. This is a trust repair, not merely a pacing improvement.
- `DangerSense` can forecast graded risk from rehearsed outcomes rather than author-written flavour alone.
- The reference settlement has authoritative finite stock and two buyers in `src/world/reference-settlement.ts`.
- Trade haggling, finite purses, item ownership and unaffordable short positions exist.
- Food, light, rest, hunger, weariness and inventory load all affect expeditions.
- Persistent shortcuts and a changing dungeon are proved in
  [the reference-loop pin](../../test/features/world/the-reference-loop.pin.test.ts).
- The page, runner and terminal share one projected `PlayerFrame`; promotion keeps the visible scene to a small number
  of choices rather than presenting the complete legal-action graph.

These are the raw materials for a good game. The question is how they become a legible promise and a remembered result.

### 1.2 What the measurements actually say

The older broad-world measurements should be read as evidence about failure families, not as a current score for the
entire reference slice.

- The boredom baseline covered 20 walks and 1,200 acts. Across it, `talk_to` happened 138 times and taught one thing;
  13 searches found something twice; 221 waits consumed 52,390 simulated minutes; 100 of 474 moves were dead; no
  generated wonder was met.
- After prose, journey and unsuccessful-search fixes, repeat rates fell in every sampled region. Wonders were still
  heard of in only three walks and met in none.
- The experience matrix found `c3` exposing about 256 opportunities per 30-turn walk while burying about 220. This is
  not evidence of enjoyable variety. It is evidence that catalogue breadth and perceived opportunity differ sharply.
- The generated-world economy study measured home value divided by spend at roughly 2.78 to 4.98. This indicates more
  available value than useful uses; it does not measure whether each choice matters.
- The 25 November cold agents all found interesting mysteries and reasons to return. All four answered only “maybe” to
  the fifth expedition. The limiting reasons were repeated descent, unforeseeable or trivial combat, loot with no buyer
  or purpose, and interface/administration pressure.
- Two of the four cold runs began outside the intended reference settlement. This weakens conclusions about the exact
  supported route but strengthens the conclusion that the deeper structure can be compelling when its local loop is
  connected.

The core gap is not “the content is boring.” Some content is good enough that players remember it. The gap is that good
content too rarely changes what the player can do next.

## 2. A causal model of stimulation

Stimulation can be treated as a chain of four conversions:

```mermaid
flowchart LR
  A[Information] --> B[Anticipation]
  B --> C[Choice under cost]
  C --> D[Persistent consequence]
  D --> E[New capability or changed situation]
  E --> B
```

A break in any link weakens the whole experience:

| Broken link | Felt result | Current examples |
|---|---|---|
| Information does not become anticipation | “I do not know what this means for me.” | a sign with no followable route; a clue after its puzzle is solved |
| Anticipation does not require choice | “This merely happens next.” | a deterministic route through rooms or an automatic favourable fight |
| Choice has no material cost | “There is no reason to deliberate.” | abundant resources, trivial combat, consequences independent of approach |
| Consequence does not persist | “It did not matter.” | a solved situation pays identically regardless of method; static jobs |
| Persistence does not create a new decision | “Now I only have more coin.” | loot that pays for nothing unavailable before; lore with no use |

The target is not constant intensity. A good loop alternates low and high pressure. The doctrine and composition ruling
require a sparse start so that unusual events stand out. Stimulation comes from contrast:

- ordinary travel makes a new warning matter;
- scarcity makes a purchase significant;
- a restrained description makes a strange room memorable;
- a reversible mistake makes a later irreversible choice tense;
- a difficult encounter makes retreat, preparation and return meaningful;
- a quiet settlement makes change to that settlement visible.

## 3. Conflict audit

### 3.1 The implemented breadth is stronger than the experienced decision space

Conflict can currently resolve through combat, flight, enemy morale, surrender, bribes, rites, tools, puzzles,
conversations and environmental actions. That is a good base. It satisfies the important principle that conflict is
broader than damage.

But mechanical breadth does not imply that a player faces meaningful alternatives. A choice is meaningful only if the
player can compare:

- a likely benefit;
- a material cost;
- a risk;
- a different future state;
- enough evidence to understand the distinction.

The cold play's strongest fights were not strong because they lasted longer. They were strong because the danger had
been read correctly and preparation changed the outcome: the telegraphed she-bear, the ghouls met after preparation,
and the spider brood handled by fire. This is the design pattern to generalise.

### 3.2 Conflict currently has a bimodal difficulty problem

Recorded evidence describes many trivial fights punctuated by sudden lethal events. This is especially damaging because
it produces two bad kinds of learning:

- in trivial fights, the player learns that combat can be compressed or ignored;
- in sudden lethal fights, the player learns that information is not trustworthy.

The result is not legitimate old-school danger. It is an unreliable calibration between what the game says and what the
engine will do. Danger should be unfair in the fictional situation when that is intelligible, but not arbitrary in the
interface.

The reference loop also covers some escape and recovery patterns more strongly than its hardest conflict cases. For
example, generated lore, stakes and consequences are still explicit gaps in `combat-and-stakes.pin.test.ts`.

### 3.3 Social and material conflicts are under-converted

The action model already allows conversation, influence and environmental manipulation. Yet the variety study found
that generated trouble repeatedly ends in confrontation with the same kind of reward. The problem is not missing
verbs; it is that investigation, exchange and protection often converge on the same terminal fact.

A strong conflict needs one or more different cruxes:

| Crux | Example | Useful capability types | Persistent result |
|---|---|---|---|
| Understand | determine what caused the trouble | study, lore, observation | a method or route becomes available |
| Influence | change what a person chooses | persuasion, leverage, relationship | an ally, concession or lasting grievance |
| Exchange | acquire consent or access at a cost | goods, money, service, debt | a changed market or obligation |
| Protect | keep a person, place or process from harm | healing, watchfulness, construction | a survivor, strengthened place or altered clock |
| Confront | stop an active threat | combat, intimidation, pursuit | territory, inhabitants and access change |
| Evade | achieve an aim without exposing the company | stealth, disguise, alternate access | a secret remains useful or risk is deferred |

Generated situations should vary the crux, not just the enemy species and payer. A rat notice can lead to a rat nest,
an apprentice stealing through a drain, a predator driving rats upward or a poisoned water source. These share a
visible opening but call for different evidence, tools and consequences.

### 3.4 Conflict mitigation

#### A. A reference conflict matrix

For each important reference encounter, record:

- telegraph before initiation;
- at least two viable response families;
- expected resource cost for attack, bypass, bargain and retreat;
- expected outcome variance by calling and party size;
- persistent world or relationship consequence;
- the first warning that makes a player reconsider.

Test fixed seeds and a small number of representative companies. The cheapest disconfirming check is a matrix in which
an encounter is:

- survivable only by a single calling, with no missing capability available nearby; or
- resolved with the same cost and result by every approach; or
- unexpectedly lethal without an earlier truthful warning.

A matrix pass should not mean every encounter is easy or every calling is equal. It should mean the encounter's
inequalities are readable and answerable with preparation.

#### B. Telegraph before punishment

A telegraphed enemy can still be dangerous. Every lethal-capable encounter should expose one or more witnesses:

- tracks, remains or territorial damage;
- a visible preparation for a powerful action;
- a local witness with accurate but incomplete knowledge;
- a failed attempt left at the scene;
- a material sign of resistance or weakness.

The witness should enable a decision: retreat, prepare, negotiate, lure, weaken or approach differently. A warning that
only changes prose is atmospheric, not strategic.

#### C. Different approaches create different persistent facts

Examples:

- A defeated raider band leaves a dangerous road temporarily cleared, but its leader's allies react later.
- A bribed band moves its camp and becomes a future source of illicit trade.
- A social resolution preserves a relationship and loses time.
- An avoided threat remains active and may move during the player's expedition.
- A burned brood removes its food source and changes what moves through nearby rooms.

The implementation need not choose these facts globally. One authored reference region is enough to prove the contract.

## 4. Economy audit

### 4.1 Scarcity exists

The current reference start has meaningful initial poverty. A player cannot purchase the complete shop and a useful
companion together. Food, light, oil, recovery and equipment require real expenditure. Encumbrance and finite trader
stock make hoarding and impulsive collection costly.

This is a worthwhile baseline. It should not be diluted by making the first town comfortable or every item profitable.

### 4.2 The conversion ladder is missing

Scarcity stimulates only while the player can imagine worthwhile uses for what remains scarce. The recorded problem is
not merely “nothing to spend on.” It is “spent and found nothing changed in the action space.”

Current progression is too often shaped like this:

```text
more dungeon -> more coin -> replace consumed equipment -> go to more dungeon
```

That loop can sustain a short game. It does not yet provide a strong answer to “why a fifth expedition?” because the
player is purchasing continuity rather than expanding possibility.

`WD-07` names the intended distinction: expedition gains should open a new way into the world. `OR-678` names the
broader open direction: little treasure, no meaningful constraints, upgrades or new verbs. The five-resource model in
the reference direction is still explicitly a hypothesis and is not yet implemented.

### 4.3 Gold should not trivially substitute for everything

A resource family is useful only if it has a source, a conversion and a non-interchangeable consumer. “Five colours”
are not enough. Nor are five inventories enough.

The minimum viable economic proposition should be:

| Input | Producer | Consumer or conversion | What gold cannot replace |
|---|---|---|---|
| Coin | sale, service, task | equipment, lodging, hiring | earned trust, rare local knowledge |
| Materials | hunting, gathering, salvage | repair, medicine, traps, tools | legality or skill needed to use them |
| Knowledge | observation, study, witnesses, books | decipherment, routes, preparation, new actions | the fact must be learned by someone |
| Relationship | keeping promises, help, influence | introductions, access, warning, companion aid | a purchased substitute does not carry social memory |
| Time or fatigue | exploration, work, recovery, transformation | every serious expedition activity | cash can improve recovery but cannot remove all clocks |

The first implementation should not need a parallel economic engine. It can use existing ownership, facts, actions,
inventories, time and Kyr effects.

### 4.4 A concrete economic ladder

For the reference loop, each return should offer at least one of three economically distinct purchases or commitments:

1. **Continuity:** replace rations, light and ordinary tools. This keeps the expedition possible.
2. **Advantage:** buy a firebomb, hire a person with brawn, acquire a manual or improve a piece of gear. This makes one
   previously dangerous situation easier.
3. **Access:** fund a repair, leave a rope, acquire a licence or instrument, or build a relationship. This opens a route,
   action or negotiated outcome that did not exist before.

Continuity alone has weak stimulating power. Advantage creates planning. Access creates long-term desire.

A useful early ladder for one reference dungeon could be:

| Expedition | Return gain | Meaningful purchase | New option next time |
|---|---|---|---|
| 1 | woundwort, scrap, one valuable find | one preparation item or partial payment | bypass a previously costly hazard |
| 2 | enemy material and a useful map fragment | a special tool or trusted companion | open a second route to deeper rooms |
| 3 | a contested resource node | a repair, licence or transformation | retain a route or recurring local income |
| 4 | knowledge of the next threat | targeted consumable, instrument or rite | safely attempt a boss or extraordinary door |
| 5 | an uncommon capability, relation or access right | invest in a new kind of life in the settlement | choose between deeper expeditions and another local undertaking |

The important rule is that every row above survives a save and affects legal actions, risks or relationships. Flavourful
loot with no owner, buyer or use should not count.

### 4.5 Tabletop proof before the five-resource implementation

The existing direction already recommends a short tabletop test. It should explicitly disprove dominant strategies.

Use 15–20 activities across five to ten simulated days, including:

- hunt, gather, trade, investigate, study, repair, rest and transform;
- one dangerous source of uncommon material;
- one buyer with finite demand;
- one relationship that changes price or access;
- one conversion with material loss;
- one clock that progresses while the company works elsewhere;
- one route opened by knowledge rather than coin.

Required observations:

- no activity is the universally best way to grow wealth;
- each resource has a source and a sink;
- no resource is created as dead decorative inventory;
- gold cannot bypass every bottleneck;
- fatigue or time prevents chaining the profitable conversions without consequence;
- two different styles each reach a viable fifth expedition;
- an activity can be a good choice in one situation and a poor choice in another.

If this fails, revise the economy on paper. Do not encode the proposed graph and discover its dominant strategy in the
engine.

## 5. Boredom audit

### 5.1 Boredom is not a demand for constant content

Sparse play is compatible with a compelling game. Walking down a quiet corridor can create tension if the player knows
what may be ahead and has something at risk. A long journey can be meaningful if weather, supplies, companions or a
pursuit alter the situation.

An act becomes boring when it is:

- **predictable in form and outcome;**
- **costly without changing the future;**
- **repeated after the uncertainty it addressed is gone;**
- **presented as a decision despite having an automatic best answer;** or
- **administration that interrupts a larger intention.**

The target is not fewer quiet moments. It is fewer moves that pretend to be choices.

### 5.2 The measured failures

The boredom census exposes several distinct families:

| Failure family | Evidence | Why it matters |
|---|---|---|
| Repeated narration | journey phrases previously told up to seven times | diminishes the sense of a moving world |
| Empty investigation | 13 searches, two discoveries | teaches the player not to look closely |
| Repeated topology | 100 of 474 moves dead in the baseline | spends motion without exposing or resolving uncertainty |
| Empty waiting | 6,490 simulated minutes in watch acts, much of it dead | time passes without a prediction or payoff |
| Inert conversation | 138 greetings, one teaching fact | trains the player to skip social attention |
| No early capability growth | no new verb came from a lesson | removes anticipation of learning and mastery |
| Hidden wonder | zero wonders met in 20 baseline walks | the world is less strange in play than it is in data |
| Static situations | 13 of 18 sampled situation modules had no clock rule | order and delay have little strategic meaning |

Line-level improvements are valuable and should remain. But repeating a fresh sentence in ten otherwise identical
situations will still become boring. The dominant remaining issue is structural similarity.

### 5.3 Opportunity count is not a stimulation count

The engine can expose hundreds of legal opportunities while the player perceives only a handful. A field of 220
individual gathering acts is not 220 choices. A person carrying 19 rumours is not nineteen distinct social
opportunities if each is reached and answered through the same long procedure.

The right unit is the **decision family with a distinguishable consequence**. Two actions count as distinct for this
purpose when they differ in at least one of:

- information available before choosing;
- preparation or capability used;
- risk, cost or opportunity cost;
- persistent fact produced;
- future option enabled;
- participant or relationship changed.

This is compatible with the four-choice resting frame. The projection should lead with a small set of genuinely
distinct families, then retain the complete legal set behind deliberate lenses. The present machinery is already
designed for that; the data and consequence contracts must give it better material to rank.

### 5.4 Boredom mitigation

#### A. Never offer an investigation if it has no answer

Search, listen, examine, watch and wait should be offered only when the situation supplies at least one of:

- a hidden object or fact;
- an explicit honest absence that clarifies the scene;
- a future event the player can wait for;
- a changed condition based on capability or instrument;
- a risk or cost meaningful to the current choice.

A general “search” as a navigation escape hatch is less useful than no search at all. The existing `BO-03` change,
which says clearly that nothing is hidden, is preferable to silence, but removing an inert row is stronger still once
the scene model can distinguish it.

#### B. Give every first conversation a grounded exchange

The first exchange should supply at least one of:

- the person's intention;
- a witnessed fact about the immediate trouble;
- a material limitation;
- a relationship or debt;
- an actionable lead;
- a reason not to trust the person.

Subsequent attention should depend on grounds. Recalled knowledge belongs in memory or the journal rather than being
presented as an endlessly repeatable question.

#### C. Make development visible on a clock

Static situations should not always wait. A compact reference conflict can develop in one or two ways while the player
is absent, but each step needs a visible sign in the place where the player is likely to return. Examples include a
cleared passage being occupied, a wounded creature changing territory, merchants closing a damaged route or a missing
person leaving a trace.

The first criterion is legibility, not simulation volume: the player should be able to say what changed, why it might
have changed and what action is newly urgent.

#### D. Compress solved work, retain new uncertainty

The project has already introduced persistent shortcuts, so the same rule can be applied more broadly:

- a cleared route may be compressed when nothing consequential remains on it;
- the route should reopen as ordinary play when an inhabitant, weather condition or new object makes it uncertain again;
- routine upkeep should become a purchase, retained preparation or one-command routine as the party grows;
- inventory rows should not occupy promoted choices merely because the operation is legal.

This reduces the expedition tax without erasing time, resources or risk. Compression is an editorial choice about what
is newly uncertain, not a free teleport.

## 6. Stimulation audit

### 6.1 The desired sources

Westernesse's stimulation should come from several layers, not one endless stream of dramatic prose:

1. **Anticipation:** incomplete information, a developing situation and a credible future event.
2. **Agency:** preparation, route and response choices that change consequences.
3. **Mastery:** the player learns to read a place, tool, creature or person more accurately.
4. **Contrast:** ordinary routines, dangerous exceptions and rare astonishment.
5. **Attachment:** people and places remember useful choices.
6. **Discovery:** knowledge changes the action space in the same place rather than merely filling an encyclopaedia.
7. **Recovery:** returning, selling, healing and reflecting are part of the arc, not an end-screen pause.
8. **Surprise:** the world changes for comprehensible reasons, not because it withholds necessary information.

### 6.2 The strongest existing pattern

Cold play repeatedly praised a **specific mystery with a promised material answer**: a drowned level, a notebook that
points at a machine, a channel that can be found, an inscription whose meaning matters, a place that changes while
unvisited.

This is stronger than a generic “quest marker” because it has all four stimulation conversions:

- evidence creates an inference;
- the inference suggests a way to prepare;
- the next expedition can test it;
- the result changes what the company knows or can reach.

Mystery must therefore not become an authorial fog. Each mystery needs:

- a clue the player can legitimately acquire;
- a known or discoverable means of testing it;
- a consequence for being wrong;
- one concrete reward for being right;
- later use of the learned fact where possible.

### 6.3 Surprise must remain causally legible

A surprising event is stimulating only after the player can form a story of why it happened. “A monster appears” is
noise. “The cleared hall has new inhabitants because you left it open and spent the night in town” is a world change.

A good event should be explainable at three levels:

1. **Immediate clue:** a trace, absence, sound or changed relationship.
2. **Causal fact:** the process by which the change occurred.
3. **Player-facing significance:** what is newly dangerous, useful or possible.

The engine does not need to expose the entire causal model. It needs to expose enough that a careful player could have
anticipated the possibility.

## 7. A worked intervention: five expeditions through the drowned way

This is a compact design probe, not a proposal to hard-code these exact contents. It demonstrates the intended chain:
conflict, economy, boredom and stimulation reinforce one another.

### Expedition 1: one mystery and an incomplete answer

- A first-level hall contains a sealed stair, an old pump and one survivor's notebook.
- The notebook says that a bar freed the wheel, but the bar itself is absent.
- A small, non-lethal fight teaches combat and retreat. A sign of larger tracks discourages an immediate push.
- The player can take scrap and one saleable object, but not carry everything.
- Return: sell enough for a better light or a repair, not for the full shop.

**Decision:** keep scarce loot, spend on light, or preserve coin for a tool.

**Persistent consequence:** the notebook exists in company knowledge. The scrap moved. The larger creature is alerted
only if the player disturbed its marked den.

### Expedition 2: preparation has a witness

- The old woods' tool seller remembers a company from the mine and offers a lever, at a high price or in exchange for
  work.
- A companion can instead provide brawn, but takes a share or requires a promise.
- The bar releases the pump, which lowers water on one branch but wakes something in the other.
- The player finds a damaged lift and learns that oil will restore it, but not yet where to source the oil reliably.

**Decision:** speed and individual strength, or coin and an owned tool; lower the water or avoid the awakened area.

**Persistent consequence:** the pump stays moved and a shortcut is now visible, but powered access is not free.

### Expedition 3: the world answers absence

- Because a night was spent away, another band occupies the open hall.
- The player can fight, offer looted material, or use a hidden maintenance route revealed by a prior clue.
- A local specialty bought from the second trader is required for oil purification; gold alone cannot buy the recipe.
- The purified oil repairs the lift. The next expedition can skip cleared rooms, but upkeep and competition remain.

**Decision:** clear the occupants, make an arrangement or preserve the route for another use.

**Persistent consequence:** the hall belongs to or is disputed by the resulting faction; the lift changes travel cost.

### Expedition 4: a known danger can be prepared for

- Accurate signs reveal the resistance and terrain advantage of the next foe.
- A manual found by study teaches a weakness, a firebomb purchased earlier exploits it and a rope creates a safer
  retreat.
- The player receives a choice between a high-value cache and rescuing a person who knows what lies below.
- This is an intentional opportunity cost: all loot does not fit, and time changes who else reaches the room.

**Decision:** wealth, a relationship or immediate access. The player has more than one viable route.

**Persistent consequence:** the survivor returns to the settlement, the cache remains or is removed, and later trade or
conversation reflects the choice.

### Expedition 5: the place pays for prior decisions

The fifth expedition is different because the player now possesses combinations unavailable on the first:

- a compressed route through the repaired lift;
- a person or faction with knowledge of the next level;
- a material weakness learned from an earlier action;
- either the coin-rich or relationship-rich result of the fourth expedition;
- a changed settlement that visibly acknowledges the four expeditions.

The proof is not that the player can reach deeper terrain. It is that the fifth expedition presents at least three
meaningful reasons to continue that could not exist at the start.

## 8. Mitigation plan

### Priority 0: measure the right loop before adding systems

1. Make one fixed reference seed start in the intended settlement for every supported origin.
2. Add a five-expedition headless transcript that records preparation, departure, conflict, retreat or success, return
   and purchase at each cycle.
3. Classify each command as **decision, consequence, traversal, recovery, administration or exposition**.
4. Record not just new text but `changed option`, `changed world`, `learned fact`, `changed risk` and `durable memory`.
5. Require every expedition after the first to create at least one new strategic option and one persistent change.

The cheapest disconfirming result is a five-trip transcript that completes but whose second through fifth preparations
contain the same item set and combat approach.

### Priority 1: close the conflict-to-reward chain

1. Give each of the first three levels one distinct conflict grammar.
2. Add a truthful pre-conflict witness and at least one non-attack response to each dangerous class.
3. Make approach-dependent consequences consumed by a later place or person.
4. Test reference parties across warrior, mage and a low-survivability calling.
5. Preserve genuine difficulty, but pin unexpected lethal outcomes and missing counterplay.

Suggested first-level grammars:

- **Territorial hazard:** observe, prepare, avoid or fight.
- **Maintained mechanism:** bargain, repair, sabotage or operate.
- **Thinking inhabitants:** negotiate, deceive, intimidate, evade or fight.

These create differentiated decisions without requiring the first hour to use every combat rule.

### Priority 2: prove the economy on paper, then in one lane

1. Build the 15–20-activity tabletop sheet named by `OR-678`.
2. Simulate two different strategies through ten days and five expeditions.
3. Verify at least one non-gold bottleneck, one expensive conversion and one relationship-derived access route.
4. Implement only the smallest successful graph in the reference world.
5. Add an item-to-affordance census so every stocked item has an intentional in-slice consumer or is explicitly
   trade-only/future-tagged.

Do not treat home-to-spend ratio as sufficient. Pair it with the proportion of treasure that enables a new action or
route and the number of viable preparation plans at each depth.

### Priority 3: retire repeated work without erasing consequence

1. Add a shortcut for depth already reached, but only as a consequence of preparation or a persistent repair.
2. Hide or fold actions whose represented task is complete and has no changed condition.
3. Compress known room traversal unless a living process, item, threat or relation has changed there.
4. Remove unconditional watches and searches without a witness or pending event.
5. Promote one distinctive, available family rather than one row from each legal-action taxonomy when taxonomy is the
   only distinction.

The acceptance condition is not “the lowest move count.” It is a drop in routine movement and administration without a
drop in meaningful world time, resource cost or the player's understanding of where they are.

### Priority 4: make capability growth visible and specific

1. Give each level a meaningful perk, feat or learned method within the current rules direction.
2. Let a lesson, instrument or companion expose a new legal action near the supported loop.
3. Announce the next attainable capability in grounded prose or an existing projection mechanism, not a generic skill
   list detached from current play.
4. Revisit earlier ground with at least one capability-dependent observation or route.
5. Measure verbs gained by lesson, companion, tool and knowledge across five expeditions.

A player should be able to say, “I learned this, so now I can do that,” before the game says “level complete.”

### Priority 5: improve social consequence

1. Each key person should have one desire, one limitation and one fact that changes after an expedition.
2. At least half of consequential social acts should cause a callback, changed price, changed topic or changed access
   within four turns of meeting again.
3. A promise made in town should be revisited through actual world state, not only an aim description.
4. A first exchange should provide grounds for the next question. The player should not receive highly specific hidden
   questions before evidence.

## 9. Proposed acceptance measures

The current game should retain its trust and performance instruments, then add a small set of experience measures. They
should be calculated over the reference seed and generated only when the relevant test scope is played.

### 9.1 Conflict quality

- **Counterplay coverage:** proportion of lethal-capable encounters with one useful response besides direct attack.
- **Forecast fidelity:** proportion of telegraphed danger whose severity and main risk are borne out by fixed-seed
  outcomes.
- **Approach divergence:** number of persistent facts that differ by attack, evasion, exchange or influence.
- **Triviality:** proportion of fights producing no material damage, consumable use, position change or consequence.
- **Involuntary wipe rate:** encounters that end a life before a truthful previous decision point.

A target worth proving first: every grave encounter has a witness and counterplay, and no supported “Press on” action
crosses a leader-down or newly lethal threshold without a pause.

### 9.2 Economic quality

- **Preparation diversity:** number of viable, materially different loadouts at each depth.
- **Foregone purchase rate:** choices in which the player cannot afford all desirable preparations.
- **Reward conversion:** proportion of expeditions whose return opens a new action, route, relationship or preparation.
- **Dormant item rate:** stocked items with no present, intentional consumer.
- **Continuity share:** proportion of spending used only to restore consumed basics versus advantage or access.

The first reference loop should aim for every expedition to offer a continuity need and at least one advantage/access
choice. The engine need not enforce an arbitrary numeric split until the loop has been played repeatedly.

### 9.3 Boredom and pacing

Keep the current census classifications, then add:

- **Empty decision:** a chosen action changes neither known world state, risk, capability, relationship, memory nor an
  actual future event.
- **Repeated resolved action:** an act repeats after its uncertainty, target or process is already complete.
- **Administration share:** turns spent on pickup, light management, buying, assigning or other routine without an
  immediate strategic trade-off.
- **Compressed traversal share:** return to previously reached depth without replaying cleared, unchanged rooms.
- **Grounded attention:** proportion of look, study, search and question actions that produce a typed consequence.

A reasonable first threshold, to calibrate through play rather than ratchet by wish, is no more than 20% of post-first
expedition moves in administration plus unchanged traversal combined.

### 9.4 Stimulation and willingness to continue

The final metric remains the fifth expedition, but record the reason:

- new mystery;
- promised capability;
- expected material reward;
- changed world or relationship;
- unfinished undertaking;
- obligation or threat;
- no concrete reason, only continued route availability.

A blind run is a better pass when it states a specific reason to return. “I can continue” is not equivalent to “I want
to continue.”

Acceptance should be reported as three separate facts:

1. mechanically complete;
2. cold-agent compelling for stated player types;
3. human accepted.

No one of these may silently stand for another.

## 10. Risks and trade-offs

### Too much scarcity

Resource poverty can become a sequence of unavoidable maintenance. Preserve one spare strategic decision in normal
preparation and make routine upkeep more efficient as capability grows.

### Too much procedural development

If the world changes constantly, the player cannot form a plan. Use few visible processes with honest signals and stable
identities, not a continual encounter clock.

### Too much compression

Collapsing every cleared corridor erases orientation and risk. Compress only repeated, unchanged material. Reopen the
route when a new situation makes traversal uncertain again.

### Too much authored consequence

Writing every possible solution combinatorially will not scale. Use a small set of typed outcome facts that later
situations can read, rather than a unique branch for every command. The variety study's argument for reusable causal
shapes remains sound.

### Mistaking mystery for withholding

A mystery is a question supported by evidence. Missing a route, buyer, capability or warning should not be disguised as
a clue. The player needs enough information to construct a plausible plan even when the plan is wrong.

### Adding the five resources too soon

The resource tournament is still a creative hypothesis. Encoding it before proving its production, conversion and
consumption graph would convert design uncertainty into engine and data cost. Prove it at the table first.

## 11. Recommended sequence

### Week-sized slice A: the loop is measurable

- Stabilise every relevant new life in the reference settlement.
- Extend the existing reference-loop pin from three successful approaches to five consequential expeditions.
- Add outcome classification and a simple report.
- Re-run blind player styles after the existing shortcut repairs.

**Evidence:** one reproducible transcript, move classes, coin/items at every return, persistent changes and each player's
reason for another expedition.

### Week-sized slice B: danger earns preparation

- Choose one dangerous creature and one dungeon social/mechanical conflict.
- Make each telegraphed, with two non-attack options and a preparation route.
- Add a persistent consequence for each approach.
- Tune fixed-seed outcomes for representative parties.

**Evidence:** fixed threat testimony before initiation, useful approach divergence and no unexplained wipe.

### Week-sized slice C: returns buy possibility

- Prove the tabletop economy.
- Add one material, one knowledge and one relationship sink that open a route or action.
- Ensure the first three expedition loadouts cannot all be identical and optimal.
- Add an item-affordance report for the reference traders.

**Evidence:** each expedient return converts at least one gain into a new lawful action or changed risk.

### Week-sized slice D: the dungeon develops

- Add one clocked process when the company leaves a cleared level.
- Compress unchanged rooms while preserving the changed room as an ordinary encounter.
- Give the new state a visible sign and a consequence for delay.

**Evidence:** the fourth or fifth visit is shorter in routine movement but richer in changed decisions than the first.

## 12. Conclusion

Westernesse already contains the components of an exciting text RPG: real danger, finite preparation, persistent places,
learning, companions, strange depths and a strong visual/literary identity. Its weakness is that these components are
not yet reliably connected into a cycle where each use of attention purchases a more interesting future choice.

The design test should therefore be:

> Did this expedition make the next expedition different enough to desire, and understandable enough to plan?

Conflict should offer readable counterplay and persistent consequences. Economy should convert scarce inputs into access
and capability, not merely replace what was consumed. Boredom should be diagnosed as unresolved repetition of state and
outcome, not just repeated wording. Stimulation should come from contrast, anticipation and causally legible surprise.

The smallest strong next move is one fixed five-expedition loop in which every return changes at least one future menu.
That is more likely to improve excitement than another content layer, another shop or another hundred legal actions.

## Evidence index

- [M22-beta brief](../architecture/mission-22-beta/BRIEF.md): supported experience, conflict, trust and acceptance ladder.
- [Reference-game direction](../design/direction-2026-11-25-reference-game.md): fifth-expedition criterion and economy
  hypothesis.
- [Composition by contrast](../design/direction-2026-11-26-composition.md): sparse start, grounded knowledge and
  meaningful progression.
- [Cold play, fifth expedition](../design/cold-play-2026-11-25.md): four blind agents, remembered strengths and stopping
  causes.
- [Boredom census](../architecture/mission-22/boredom-census.md): repeated, dead and empty acts before and after line
  fixes.
- [Story-shape variety](../architecture/mission-22/variety-study/report.md): causal variation, development and approach
  consequences.
- [Experience matrix](../architecture/mission-21/terminal/experience.md): opportunity breadth versus buried choices and
  continuation failures.
- [The money of a country](../architecture/mission-22/sites/economy-now.md): the older aggregate abundance measurement.
- [Open register](../architecture/open-register.md): `OR-678`, `OR-760`, `OR-1081`, `OR-1082`, `OR-1083`, `WD-07`,
  `BO-05`, `BO-06`, `BO-07`, `BO-11` and `BO-12`.
- [The reference-loop pin](../../test/features/world/the-reference-loop.pin.test.ts): the cheapest existing implementation
  anchor for the first five-expedition proof.
