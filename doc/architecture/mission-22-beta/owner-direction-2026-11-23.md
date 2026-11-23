# The owner's direction for M22-beta (23 November)

The owner's direction given at alpha's close, and how it revises the preparation report's sprint plan. Where this and
the preparation report differ, this governs.

## The direction, as given

**Architecture must provably enrich the first hour.** Beta cannot be about foundations and architecture in the
abstract. It begins with trust, and also with restricting and simplifying the first town.

**The shape of the first hour:**
- **The first town is largely alone** in a vast wilderness the player can hexcrawl.
- **A dungeon proper lies in the same hex**, a very clear point of interest: repeatable, challenging, deep, with
  significant allure and interest.
- **The core adventuring loop is obvious**, not obstructed by fetch quests to boring destinations that lead nowhere.
- **Combat and conversation** are rethought.

**Performance is surgical, and soon:**
- the engine loads in under a second;
- a game starts from the title in under a second;
- **total time to the first meaningful player action targets 1.5 s.**

**The flow, simplified:**
- No long presses.
- The title says only **Play**. It continues a game if there is one, and a game is easy to abandon back to the world.
- Then one choice, presented in the same visual form as the first scene: **create a character**, or **"We enter the
  world as we are"** (a character rolled blind).
- Then immediately in the game. Do the work on the title's load if possible: roll a default world and a character in
  advance, so that going from a pre-rolled random character to the game is as small as possible.

**The opening scenario** has the same visual form as the build-or-roll page: two or three actions as a standard
right-hand menu, the most urgent marked, **Light a torch**. Then the player sees which starting situation they are in.
- These can be stock for now. No amnesia; problems of exploring. For example: injured in a ravine in the deep woods;
  trapped in an arcology after a bridge fell; trapped down a mineshaft after a cave-in.
- Within 5–10 seconds the opening introduces the game's major beats: **(a) light, (b) rations, (c) persuading people
  to join, (d) combat.**
- Two rooms, one person, one combat, one ration to pick up and eat, then a tiny puzzle, riddle box or trap to disarm.
- Then the open world, perhaps low on hit points, needing to heal, rest or sleep.

**The town is quiet:** a small fishing village, a mountain hamlet or a desert encampment. The setting should be able
to vary significantly.
- It is a rustic village with what the adventuring loop needs and not much else.
- Quests are tucked into one another, gated on basic prerequisite quests that teach the mechanics: explore; find the
  first dungeon; return with a certain treasure; fight a certain monster there. Then things open out.
- **Most people are not quest dispensers.** They respond to changes in the world. A payoff from someone should
  generally include a new possible quest.
- Quests scale up, from tiny Opportunities to large epics and stories.

**Kyr: Situation and Incident.** A minimal structure is wanted as an author's construct: a **Situation** populated by
many small **Incidents**, which contribute to its resolution in different ways and may lead to new Situations.

**The corpus, reviewed.**
- The **worst 20%** of authored material is to be pruned, or decomposed into parts, detachable scenarios and
  interesting items, or folded into existing reusable material.
- The **best 20%** is to vary in more significant ways: more tables, templates and replaceable segments that could kit
  in different scenarios, or decomposed fully into a reusable adventure template that could become many things.

**Gamma**, not beta:
- chaining adventures together at a meta level so they interact;
- content build-out;
- full SRD alignment;
- perks and feats;
- completing every migration from Orsino and the SRD's spells and monsters.

## How this revises the sprint plan

The preparation report's architecture stands: one outcome per act, one situation state, atomic commands, setting
independence. But **each sprint is now judged by a first-hour demonstration**, and the architecture is what makes it
possible. Revised order [P]:

| Sprint | First-hour demonstration | Architecture it requires | Gate |
|---|---|---|---|
| **0. Baseline** (done in part; see sprint-0-baseline.md) | Measured counts: continuity breaches, browser timings, presses per intention | none | the counts exist |
| **1. Act cost first** (the owner, 23 November: the first priority of the wave) | Every act answers at once: a way taken, a question asked, a thing taken, each settled in the browser within 300 ms, and a journey's legs walked without a stall | The decision pure and incremental (act-cost-profile.md): legal actions re-grounded only for the operators whose reads an act changed; a journey's legs checked by the facts that can stop them, the frame built once on arrival; routes and perception built only when drawn, memoised per world; tick rules indexed by trigger; fewer copies per command | **A headless decision under 15 ms** at the median (act plus legal actions); a non-journey turn under 30 ms headless; a journey leg under 5 ms without the frame; held by a turn-cost ratchet over every turn of the golden walks |
| **2. The first 90 seconds** | Play → roll blind ("We enter the world as we are") → a stock starting situation (two rooms, one person, one fight, one ration, one small puzzle; Light a torch marked) → out into the wild. No long presses. | Pre-roll a world and character at the title's load; the opening as a **Situation** of **Incidents** (light, ration, recruit, fight, puzzle) in Kyr; one situation state for the frame (the opening is its first user) | Cold-play agents of each kind reach the open world in under two minutes; **first meaningful action within 1.5 s of Play**, measured in the browser |
| **3. The first town and its dungeon** | One settlement alone in a hexcrawlable wilderness, a deep repeatable dungeon in its hex; prerequisite quests that teach (explore, find the dungeon, bring back a treasure, fight a named monster); people who respond rather than dispense | A starting-region profile for generation (one town, one dungeon, wild around); Undertaking with reward and aftermath; responses, not dispensers | The continuity census at zero breaches on the town's walks; cold-play agents complete the loop (town → dungeon → return) unprompted |
| **4. Trust in what is offered** | Every mark true in the town and the dungeon | The Outcome per act, over session commands, for the rows drawn (outcome-cost-study.md) | Predicted equals observed at every turn of the loop's walks |
| **5. Combat and conversation** | A fight that is dangerous and legible (morale, retreat, the cost said before); a conversation that progresses (questions open questions; people remember and respond) | Occasion/engagement as the fight's and the talk's frame; atomic commands under them | Cold-play agents rate the fights as risky and the talks as consequential |
| **6. Separation and authoring** | A non-Westernesse starting situation through the same lifecycle (e.g. the allotment society); the corpus review | Per-campaign catalogs (AR-02); the layer ratchet driven down on that path | The second setting runs beside a1; the best and worst 20% named, with a plan for each |

**Act cost comes first, and performance then runs through every sprint** (the owner, 23 November: "reframe act
cost as the first priority in the next wave"). The 1.5 s target is sprint 2's gate, and beta's three phase budgets are:

- the engine loaded in under a second;
- Play to game in under a second, given pre-rolled work;
- acknowledgement within 100 ms and settling within 300 ms per act.

The current numbers say where the work is [F]:

- a new world takes 5–6 s warm, so it must be pre-rolled at the title, not on Play;
- Set out now is already within a second, because its start is drawn ahead;
- an ordinary act settles in 372 ms, over budget.

**The corpus review** is research for sprint 5, and could begin in parallel as an agent's task. It is to read every
adventure and module, score it, and name the worst and best fifths with reasons.

## Open questions for the owner

- **Which stock starting situations come first?** The ravine, the fallen bridge and the cave-in all fit Iscoed's or
  a1's land. Do they belong to one world, or to each world's own wild?
- **The dungeon in the first town's hex:** grow Porthalen's undertown, the strongest written dungeon today, into the
  deep repeatable one? Or generate a dungeon by kit for each start?
- **Does "repeatable" mean** restocked over time, regenerated levels, or deeper levels unlocked?
