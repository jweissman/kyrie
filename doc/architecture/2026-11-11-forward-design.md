# Forward design: six research directions

The owner, 11 November 2026 (night). These are provisional research directions, not accepted specifications and not
Mission 20 work. Mission 20's delivery goal is unchanged: a compelling first fifteen minutes, a credible first hour,
careful integration of the adventure branch, and fewer opening-critical defects.

For each direction this record gives:

- the experience it is for;
- why the present architecture or workflow falls short;
- where it starts in the code;
- the risks and unknowns;
- the narrowest experiment that would test it;
- its dependencies and place in the sequence;
- what Mission 20 work already advances it.

The code entry points come from one read-only reconnaissance of the tree at 755af2e9 (11 November night), with its
main claims checked by hand. Nothing below has been built or measured for these directions, unless a line says so.

Related: the atlas synthesis of the same night (`mission-20/handoff.md` §2), `mission-20/text-inference.md`, the
risk review (`architecture-risk-mediation-2026-11-11.md`), and the adventure-to-career direction
(`2026-11-11-adventure-to-career.md`).

## A. A derived opportunity atlas, not author-assigned colour tags

**The experience.**
- A player learns to trust the atlas's colours as what this character can tell of the world: a hoard two rooms off
  read as gain, a beast as danger, a stranger who might come along as company.
- An author writes entities, relations, capabilities, knowledge, conditions and consequences in Kyr. The author never
  writes a colour.
- Colours are a presentation vocabulary over what the engine derives for one observer.

**Why the present falls short.** Most of the meaning already comes from typed facts, but not all of it, and the
observer is barely in it.

- **The pipeline.** `Glance.of` (src/presentation/glance.ts:42) builds a `Reading`. `Affordances.of`
  (src/ui/affordances.ts:54) gives candidates with *whys*. `Promotion.pick` (src/ui/promotion.ts:44) promotes them.
  `Aspects.of` (src/presentation/aspects.ts:22) maps whys and marks to the seven aspects, by a fixed table.
- **Typed sources** (most of it):
  - action schemas and bindings, and the facts an act's success would touch (`PlayerView.choices`);
  - aims and objectives;
  - what the company has done, said and seen (`CompanyRecall`);
  - exits, and whether each was visited or blocked;
  - needs (health, daylight, rations);
  - what the last act opened;
  - possible companions (`Companions.possible`);
  - the fight forecast (DangerSense).
- **Author-shaped sources:**
  - Kyr `Change` declarations, which make "authored" acts;
  - module-namespaced action ids, which make an act a place's "own";
  - authored observations used as signs.

  These are structure, not colour tags, which is the right side of the line.
- **Text inference still in the path:**
  - an aim matched to "Ask … about" by regex (`AimAsks`);
  - fees read out of notes;
  - `Marks.fight` keyed on the label "Attack";
  - kin read from a note beginning "your ";
  - the reader-side list in `text-inference.md`.
- **The observer.** `Perception.reach` (src/presentation/perception.ts:14) knows one facet, companionship: one place
  off, three for the Gregarious. Nothing else depends on who is looking.

**Risks and unknowns.**
- **Leaks.** A derived signal can leak what the character does not know. A hoard's gain colour two rooms away is
  privileged unless something the character has (a rumour, a sense, a skill) licenses it.
- **Provenance.** Each signal needs where it came from (which knowledge or capability), or it cannot be checked.
- **Cost.** The glance's 8 ms budget (test/glance-kite) is the constraint.
- **Ownership.** Violet (uncanny) has no source today. Whether Kyr should carry an "uncanny" property of entities (an
  ontology fact) or it should come from, say, magical provenance, is open.

**The narrowest experiment.** Take three situations:
1. the corn-store with its padlock and key-holder;
2. the hobs' hold;
3. a lone stranger at an inn.

For each, write the signals by hand as they should be for two observers, a thief and a bard. Then derive them from
typed facts only (no labels) through one function, with provenance on each. Finally, assert that an observer without
the licensing knowledge gets no signal.

**Dependencies.**
- Replace the remaining text inferences first (the handoff's §2.1). The derivation must not rest on labels.
- Per-facet reach and provenance (handoff §2.3) is the same work seen from perception.

**Advanced by Mission 20.**
- Typed town entry (`entry`, `Promoted.enters`, `afar`).
- Typed aims (`Exchange.aims`, follow by id), and a typed end to a fight.
- The text-inference inventory itself, and the one-indicator grammar.
- Companionship perception, a first observer-relative facet.

## B. Bounded counterfactual evaluation and story distance

**The experience.**
- An opportunity can be near in story, not only in space. Helping a wounded knight, which earns an obligation, which
  opens a manor, which holds an investigation, is a lead the engine can see, explain, and offer at the first step.
- Two measures are kept apart:
  - *possible*: under favourable legal outcomes;
  - *likely*: for this character.
- What the player is shown uses only what the character knows or can infer.

**Why the present falls short.** No evaluation looks more than one act ahead for the player. The pieces for one exist,
more than expected:

- **The World is persistent.** `World.apply` (src/lang/world.ts:255) forks a world by sharing its per-relation maps
  (`World.fork`, :46) and copying a relation's map only when it is written. So a hypothetical world costs what it
  changes, not the world's size.
  - `admits` (:264) is a dry run.
  - `key` (:369) is an order-free state hash.
  - `changes`/`differing` (:426, :443) give the delta between two worlds.
- **A planner already searches over worlds.** `Planner.search` (src/campaign/planner.ts:20) is used for the people
  of the world (`Agency`, `CampaignPlan`), with node budgets and an explanation trail. It applies only an action's
  success changes.
- **The fight forecast is the precedent for trials under real rules.** DangerSense (src/presentation/danger-sense.ts)
  runs 6 to 18 seeded trials (`trial`, :174) on cloned creatures and a fresh battle, never touching the world, and
  caches the results.

**Risks and unknowns.**
- **State outside the World.**
  - Creatures (health, slots, conditions) live in the `CreatureStore` beside the World, and the campaign's checkpoint
    clones them (`Campaign.checkpoint`, about campaign.ts:272).
  - Checks are seeded by world, skill and step (`Checks.make`, src/rules/checks.ts:84). Seen tonight: a castellan's
    roll came up the same for every name.
  - What happens each watch (rules, events, `Occasion`s, through `WatchLoop`) runs in the campaign, not in `apply`.

  A counterfactual that ignores these is optimistic in ways that matter: a fight lost, a light out, a warner's grace
  run out.
- **Undo is one level.** `Campaign.undo` undoes the last command only. A branch must never be committed, only
  evaluated.
- **Runtime growth.** The country beyond is drawn and installed at runtime (`Frontier`), so a hypothetical step
  across a border would grow the module. Branches must stop at a frontier.
- **Leaks.** "Possible" is privileged truth. Only its knowledge-safe shadow may reach the page (see A).
- **Cost.** It must run in a background budget, never in the glance's 8 ms.

**The narrowest experiment.** A small authored situation of three or four decisions: the knight, the obligation, the
manor door, the room within.

1. From the first state, a bounded search over the world (`Planner.search` with a node budget, over the offered
   actions' success effects) finds the chain to the downstream affordance.
2. Each step of the chain is then replayed through the real `PlaySession.perform` on a checkpointed copy (as the
   parity test does), to verify it under the actual rules, checks included.
3. The chain is kept as a causal explanation.
4. An uninformed observer's projection is shown to carry nothing of the hidden end.

The experiment answers three questions: whether the success-only search agrees with real play, what it costs, and
where it misleads.

**Dependencies.**
- A, for what may be shown.
- Typed effects on actions, which Kyr already has.
- A clear line between the World and the creature store (the risk review's R1 and R2: command phases and
  per-campaign catalog state).

**Advanced by Mission 20.**
- The gold walk (test/gold-walk) is a one-step counterfactual check of the existing gold.
- The forecast fixes (E139: a lone company's worst case) sharpen the precedent.

## C. Persistent headless sessions and structured agent play

**The experience.**
- An agent playtester, or a script, starts one long-lived process. It creates a session and gets a compact,
  structured view of the player's situation.
- It sends authoritative action ids and gets the next view. It can checkpoint, replay and later fork, without
  parsing a terminal.
- An MCP wrapper can sit over it for IDE agents, but is never the game.

**Why the present falls short.** The engine is already shared, and the protocol nearly exists. What is missing is a
stdio front, and process hygiene for more than one game.

- **Clients.**
  - bin/kyrie → `KyrieCli.main` (src/cli/kyrie.ts:57: play, inspect, reach, forecast, replay, resume…).
  - `Terminal.play` (src/cli/terminal.ts:117), over the same PlayerView, ScreenModel and Narrator as the browser.
- **`PlaySession`** (src/session/play-session.ts:34) has `start`, `resume(checkpoint)`, `fromSave`, `checkpoint`,
  `leg`, `perform`, `replay(steps)` and `canonical()` (the host-independent result the parity test compares).
- **The browser's engine host is already a message protocol.** `EngineHost.handle` (web/engine/engine-host.ts:76) holds
  one session.
  - Requests: catalog, setting, world, preview, begin, ready, resume, perform, fight, travel, plan, unbind, follow,
    checkpoint, story, kept.
  - Messages: reply, frame, saved, unkept, progress.
- **Saves.** `SaveCodec` (gzip and base64), and `KeptGame` (the world once, the state as a diff).
- **Parity.** `Digest.of` per transcript step. test/client-parity puts EngineHost and PlaySession through the same
  commands and compares digests, places and led acts; a save from one reloads in the other.
- **Startup.** A fresh country takes about 10 s headless, half of it parsing, at 550–620 MB resident (handoff §2.8).
  A long-lived process pays this once.

**Risks and unknowns.**
- **One campaign at a time per process.**
  - `LocalKinds` (src/canon/local-catalog.ts) mutates the global catalogs for whichever campaign is active, and reading
    `Campaign.world` claims them.
  - Static caches (DangerSense, ParseCache, ModuleBundle parses) are process-wide.

  Several sessions in one process need either strict claim and release around each request or one process per
  session. Forking a session (C's "eventually") meets the same constraint.
- **The view must be bounded.** The full frame is large. The structured view must be a stable subset with typed ids
  (see D), not the page's frame.
- **Cost.** Every leg lists the choices more than once (seen tonight: a third listing ran a spec past its 25 minutes).
  A protocol that lists them once per step is a measurable win.

**The narrowest experiment.** A `kyrie serve` reading newline-delimited JSON on stdin:

- `{create}` → `{session, view}`;
- `{act, id}` → `{view, told}`;
- `{checkpoint}` → `{save}`;
- `{replay, steps}`.

It is backed by `EngineHost.handle` for one session, with the view taken from the glance and the choices (D). Then a
benchmark: twenty actions through it, against the same twenty through `kyrie play` with text parsed. Measure the time,
and the bytes an agent must read per decision.

**Dependencies.**
- D's frame.
- The risk review's lifecycle assertions around command execution (R1) before forking.

**Advanced by Mission 20.**
- The headless investigation: the CLI and terminal client, the parity test, typed `does` for buy, sell and gather.
- The startup measurements.
- The specs' walk made cheaper (E144 follow-up, 11 November night).

## D. Four promoted choices and inexpensive automated walkers

**The experience.**
- At any moment the page leads with a few genuinely worthwhile, player-safe acts.
- An ordinary journey can be walked by choosing among them. A cheap deterministic policy (gold first, wonder first,
  gain first, company first, danger first, balanced) can be run across one world to find loops, stalls and dead ends.
- A small fast model reads compact typed frames. A deliberate agent is kept for ambiguity, stagnation and criticism.
- The promoted few guide the player; they never restrict the whole action space.

**Why the present falls short.** The surface is nearly ready. The walkers exist, but read their choices partly by
command patterns, and there is no common harness across one world.

- **Caps.** `Promotion.cap` is 3, not four (promotion.ts:33). Within that: at most 2 ways, 1 of a place's own, and 1
  per subject (2 for a danger). Talk plates do not count. Glance `ways` hold at most 3.
- **Typed fields.** Promoted acts carry the exact choice id, the command (or `travel:`), `for`, subject, exit, why,
  facets, tier, aspects, `continues`, `enters`/`afar`, and marks. `DecisionFrame` and `AfterAct`
  (src/presentation/decision-frame.ts) are typed. A frame can be emitted without scraping prose, apart from the text
  inferences listed in A.
- **Walkers.** `AutoPlayer` (src/autoplay/player.ts:32) has the policies wander, intent, fight, investigate, care,
  expedition, deviate, follow, silver and gold, and a mixed policy. Follow, silver and gold go by the glance's led
  acts; the rest classify choices by command patterns (`AutoPlayer.kinds`). `AutoplayRun` (src/autoplay/run.ts)
  drives them, alongside Curious, Tour, EncounterLab and Shrinker.

**Risks and unknowns.**
- **Three or four.** Whether the cap should be four is a design choice to test, not assume. Round 7's players found
  the right acts under Go… as often as among the led.
- **Policy honesty.** A walker that takes only the led acts measures the atlas's honesty, but cannot see what the atlas
  hides.
- **Facet policies need facets.** "Violet first" has no violet source today (A).

**The narrowest experiment.** One generated world (kahitude), one start. Then:

1. Five deterministic policies over the led acts, each run for 200 steps.
2. One report: where each went, what it resolved (aims seen through, fights, finds), where it looped (the gold walk's
   circle test, generalised) and where it stalled (no led act).
3. Escalate to an agent only for the stalls.

**Dependencies.**
- E's events, to report on.
- C's frame, if the walkers are to run out of process.

**Advanced by Mission 20.**
- test/gold-walk, the risk review's R9 gate: a gold-only walker with circle detection. It found the Seolforfyrd loop.
- The typed promoted acts and the parity test of led acts.
- The town walk's minutes made true (E149), so a walker's clock means something.

## E. Prismatic character and campaign telemetry

**The experience.**
- A terminal view of eight headless runners at once. Each has a few coloured bars, on a scale of 0 to 20, of the kinds
  of opportunity it has met.
- At a glance it shows whether a thief and a bard, or a gold walker and a wanderer, see different parts of Westernesse,
  and which kinds of opportunity hardly ever appear.

**Why the present falls short.**
- The run metrics count steps, commands, travels, arrivals, fights won, lost and fled, kinds of act, places,
  countries, watches, milliseconds, and chosen against unchosen (`AutoplayRun.empty`, run.ts:170; `Metrics`, :29).
  Violations are recorded by kind.
- Nothing distinguishes an opportunity that exists, one the character could perceive, one the page promoted, one
  chosen, and one resolved. So twenty choices of one fruitless act look like twenty discoveries.

**Risks and unknowns.**
- **Counting.** "Exists" needs the world's own inventory of opportunities: dangers present, things to find, people
  who could join, aims open. Some of that is typed (sites, inhabitants, items hidden until a discovery,
  `Companions.possible`, objectives); some is not (an authored situation's "wonders").
- **Identity.** An opportunity must be one identity across the five stages, or the bars double-count.
- **Not 1:1.** The bars are not the six attributes. Capabilities affect perception many-to-many (A).

**The narrowest experiment.** A derived report, not a new system of annotations. From existing typed events:

- promoted: the glance's acts by aspect, deduplicated by choice id per place;
- chosen: the command taken;
- resolved: aims seen through, milestones, fights won, items gained, companions joined.

Run eight short walks (D's policies × two callings) and print one line each, with the counts by aspect for promoted,
chosen and resolved. "Exists" and "perceived" come later, with A.

**Dependencies.** D (the runs), A (perceived), and the typed milestones and aims Mission 20 added.

**Advanced by Mission 20.** Typed aims and the fight's typed end, milestones with experience on finds (E142, E146 and
tonight's sister and castellan), and the CI timings (TC-01).

## F. Unified observer-relative inspection, and the Book

**The experience.**
- One way to look at anything: a person, a plant, an object, a place, an institution, a creature.
- A compact card, and a fuller entry in the Book where there is one.
- The same engine truth gives the player what the character knows, and an author or debugger everything, with its
  provenance.
- Identity, present form, knowledge, relations, history and provenance stay apart. A polymorphed person is still who
  they are.
- The Book grows with what the player has learned. It is not a static encyclopedia.

**Why the present falls short.** Pieces exist in different places, and no contract joins them.

- **The scene's subject** (`SceneSubject`, src/ui/scene.ts:5) carries kind, note, about, danger, what they say,
  state, recruit terms, stake and portrait.
- **Close looks.** `LookAnswers` (src/campaign/look-answers.ts:11) offers a close look only where some rule reads it.
- **Knowledge with provenance.** `CompanyKnowledge.of` (src/presentation/company-knowledge.ts:12) gives seen, found,
  heard and read, from whom, and confirmed. But when something was learned is found by a pattern over the log's change
  strings, which is text parsing.
- **The Encyclopedia** is a static generated site in a frame (src/handbook/encyclopedia*.ts,
  web/reader/encyclopedia-overlay.tsx), linked by base species only.
- **The dossier** is the company's own sheet.
- **Form against identity.**
  - A creature's `raceId` is its identity. Its variations are baked in at creation (src/creature-variants.ts:100).
  - The `polymorphed` condition exists, but its form-changing effects are marked "Kyr does not execute this Orsino
    effect yet" (data/catalog/orsino/conditions.json).
  - There is no runtime change of shape.
- **Author views** are CLI only: `kyrie inspect` (why a choice is or is not offered, with the failing Kyr conditions),
  `reach`, `forecast`, `bestiary`, and `play --probe`.

**Risks and unknowns.**
- **One contract, two clients.** It must serve the page and the headless view (C), and filter by knowledge, never by
  presentation.
- **Transformation.** Shape change needs runtime form state, which does not exist.
- **The Book's line.** Where the Book's accumulation ends and the Notes begin.

**The narrowest experiment.** An `Inspection.of(campaign, observer, entity, mode: 'player' | 'author')` returning
typed sections (identity, form, what is known and from whom, relations known, history known), built from
`SceneSubject`, `CompanyKnowledge` and the module's entity. Show it for three things:

1. one person;
2. one plant or thing;
3. one transformed creature, faked by a variation, since there is no runtime polymorph.

Then assert that the player mode carries nothing the knowledge does not license, and that the author mode carries
provenance.

**Dependencies.**
- A typed time for when something was learned (replacing the log-string pattern).
- C, for the headless client.
- Polymorph execution, only for the full stress test.

**Advanced by Mission 20.** The Notes' grouping and provenance lines, the typed aims, and tonight's credits fix
(E152). The credits fix is small, but it is the same principle: say what is known, as it would be said.

## The feature inventory (the owner's second list, 11 November night)

The six directions above compress the discussion into architecture; the owner's second note keeps the features someone
should eventually *experience*, so that "observer-relative inspection" still ends in the small, beautiful card that
prompted it. These are proposals, not all approved. Sequencing as the owner gave it: **M20** opening-critical only;
**M21** near-term investigation or prototype; **Later** broader game and platform work. Where the owner gave no tag,
none is guessed.

The common theme, in the owner's words: not tooltips, colours or planning, but *the gradual revelation of meaningful
possibilities in a persistent world*. A foxglove illustration matters because a player learns to recognise the plant;
a house's emblem because they may later know it on a stranger's shield; a person's card because the person has a
history, loyalties and perhaps a secret; the Book because those discoveries accumulate into a personal understanding.
The owner's illustrated references: the Master of Claude de France's *Book of Flower Studies* (c. 1510–1515), a
leaf of a ducal *Dogale* (Walters Art Museum W.481.1V), and genealogical trees as a visual language of history.

### Entities, cards, illustrations, and the Book

1. **Universal entity cards** (M21 prototype). One compact, consistent card for any entity (person, animal, plant,
   object, place, institution, house, creature), from scene references, map elements, portraits, the pack and anything
   else that bears an entity; described from structured engine information, not a second hand-written tooltip system.
2. **Canonical imagery and heraldry** (M21 research). Reusable canonical illustrations for kinds and concepts (the
   foxglove); portraits for named people; arms or emblems for houses, guilds, orders and institutions. An illustration
   of a kind is not a portrait of one instance. Existing assets first, loaded economically.
3. **The living Book** (M21 research, later implementation). An evolving record of discovered entities, known
   relations, rumours, experiences and unresolved questions, not a static encyclopedia; references followed between a
   house, its emblem, its retainers, a document and a place; established knowledge, uncertain belief and remembered
   encounter kept apart.
4. **Structured references in prose.** Names and meaningful references in scene text open cards or Book entries, by
   typed entity references, never by searching strings; not every noun clickable.
5. **Levels of inspection.** A quick glance card, a fuller known-details view and a deliberate investigation are
   different interactions; investigation may cost time or carry risk, ordinary inspection does not.
6. **Player-safe against privileged inspection.** The same entity as the character understands it, or as the engine
   holds it; the debugger shows the facts, state, provenance, and why a capability or opportunity exists; nothing
   hidden leaks into ordinary cards.
7. **Identity across transformation.** A polymorphed knight is the same person seen as a raven: identity, current
   form, perceived appearance and what the observer knows kept apart. The strongest test of the description model.
8. **Responsive interaction.** Hover on a desktop, tap or focus on touch, keys where fitting: a feature, not a detail.

### Opportunity perception and counterfactual reasoning

9. **A derived semantic atlas.** Colours from the world's affordances and their consequences, not author flags; Kyr
   and Deem know nothing of Westernesse's presentation vocabulary.
10. **Spatial propagation.** An opportunity a few traversable rooms or hexes off casts a weaker signal toward the
    approaches that plausibly lead to it; walls, locks, sight, evidence and capability matter.
11. **Story-distance propagation.** An act that may bind an obligation, open access, reveal a clue or make an alliance
    signals a downstream opportunity several decisions off; distinct from distance in space.
12. **Bounded hypothetical execution.** Candidate chains tried against speculative overlays, not the whole world
    copied and simulated; the real rules, randomness and side effects isolated, only the relevant deltas kept.
13. **Possibility against likelihood.** A rare legal good outcome is not a likely one; possibility, probability,
    distance and confidence kept distinct.
14. **Observer-relative forecasting.** By the character's last best-known information and legitimate inference, not
    the engine's truth; callings, backgrounds, skills, experience and company see different possibilities.
15. **Explanation traces.** The debugger shows the chain that made a signal (help the knight → an obligation → the
    manor → a find), to diagnose misleading colours and unreachable promises.
16. **Unified action promotion.** About four salient, player-safe acts with stable ids and typed reasons; never the
    whole legal set.
17. **Character-dependent sensitivity.** Range, clarity, confidence and kinds of evidence vary, many-to-many across
    abilities, knowledge, training, background, ancestry and company; never one attribute to one colour.
18. **A restrained prismatic interface.** One meaningful signal per act or entity, soft gradients only for genuine
    multiple facets, faint signals for indirect opportunity, no pile-up of pips and borders; the gradient beside a
    place's name kept.

### Character prisms and headless observation

19. **An Orsino-like rainbow stat display.** Six compact coloured bars, 0–20, handsome in a terminal and restrained on
    the character sheet; separate from the atlas, whose seven meanings are not the six attributes.
20. **A derived sensitivity prism.** If useful, a second profile of how well a character recognises kinds of
    opportunity, changing with knowledge, experience, training and company, without redefining the attributes.
21. **An eight-runner rainbow monitor.** A compact terminal view of several headless playtests at once, a row each
    with the kinds of opportunity met: divergent adventures and missing content at a glance.
22. **Opportunity-stage telemetry.** Exists, perceivable, promoted, chosen, resolved; distinct opportunities counted,
    repeats not; real counts kept though bars cap at twenty.
23. **Colour-following walkers.** Very cheap policies after undertakings, wonder, wealth, company, danger, or balance,
    making coherent progress by the promoted acts.
24. **A fast-model decision mode.** A small model given a compact typed frame, not a transcript, choosing among the
    promoted acts or weighting them; token cost and quality measured against deterministic and deliberate testing.
25. **Escalation to deliberate playtesting.** A capable tester called where the cheap walker stalls, loops, meets
    ambiguity, needs an unusual plan or reaches what needs judging; it says whether the trouble is guidance,
    mechanics, content, or difficulty worth having.
26. **A persistent structured headless server.** A long-lived JSONL stdio process: sessions created, the player-safe
    view observed, authoritative acts done, permitted entities inspected, checkpoints restored; the CLI and browser
    stay clients of the same engine.
27. **Forking and reproducible replay.** Different decisions from one checkpoint without rebuilding the world; small
    replay artefacts (configuration, commands, outcomes) shared between agents and builders; MCP a thin optional wrapper.

### Adventure, people, and campaign life

28. **Dramatic situations as authorable units.** More than places and quest chains: people with incompatible motives,
    approaches, conditional developments, consequences. Whether Kyr and Deem already say this cleanly is the question.
29. **Adversary plans and situation clocks.** Rival knights, households, orders and powers pursue their purposes while
    the player acts; time matters by meaningful scheduled developments, not exhaustive simulation of lives.
30. **Dramatic memory.** Significant acts become structured events with participants, witnesses, meaning and
    propagation: a spared enemy, a betrayed employer, a rescued child remembered and interpreted later.
31. **Companions with interests and relations.** They remember, object, recognise, want, and sometimes leave; their
    ties to people and institutions connect the company to larger situations.
32. **Company formation and emerging careers.** Formations of calling, ancestry, background and relation; a durable
    company identity; professions found in play, not all chosen at creation.
33. **Stronger in-medias-res openings.** A failed expedition, an escape, a siege, a mystery, varied coherently across
    generated worlds; origins become later material, not mandatory preliminary errands.
34. **A deliberately dense proving region.** One settlement, danger near, institutions, companions and overlapping
    situations for several hours of differentiated play: the dramatic standard set before the generator is scaled.
35. **A first strategic engagement.** The player prepares, commits resources or relations, acts against a consequential
    problem and sees lasting results, arising from the first hour, not merely a larger fight.

### Authoring and platform hygiene

36. **A usable Kyrie authoring introduction.** Kyrie as the platform, Westernesse the flagship game; real examples of
    writing and testing a small situation.
37. **Literate Kyr.** Markdown-like `.kyrt` with fenced semantic declarations, readable prose, an unambiguous short form
    for simple dialogue or page sequences; one authoritative compile and runtime path.
38. **Typed authoring sets.** Named sets and batches for entities, classes, creature categories, spell kits, party
    members and other recurring concepts, not brittle hand-written condition lists.
39. **Repository and record reconciliation.** Audit divergent branches, recover unmerged work and neglected author
    requests, tell current architecture from obsolete proposals, retire misleading documents carefully.

## Architectural seams worth investigating

The owner's question: can three seemingly different features run on one small engine interface?

- a **card** saying what this character knows of an entity;
- a **promoted act** saying what the character could do and why it matters;
- a **headless tester** asking what that act might change.

From the reconnaissance, five seams carry most of the inventory:

1. **Entity plus observer knowledge.** The module's `Entity` (id, type, name, space), the World's facts about it, and
   `CompanyKnowledge` (what is known of it, from whom, confirmed or not). The card (1, 5–7), the Book (3), prose
   references (4) and the debug view (6, 15) all read this; the gap is a typed "learned when" (today a pattern over the
   log) and identity apart from form (7).
2. **The offered action and its typed effects.** `PlayerView.choices` gives each choice its action, schema, bindings
   and the facts its success would change (`touches`); the promoted act (16) is a ranking over these, and the tester's
   question (12, 15, 26) is the same effects applied to a forked World. One record (action id, bindings, effects,
   requirements) can serve the act's *why* and the tester's *what changes*.
3. **The persistent World.** `World.apply` forks cheaply; `changes`/`differing` give deltas; `Planner.search` searches.
   This is the overlay of 11–12 already, for world facts. Creature state, checks and the watch's rules are outside it.
4. **The session protocol.** `EngineHost.handle` and `PlaySession` (checkpoint, replay, canonical digest): the server
   of 26–27 is a front on these, not a new engine.
5. **Typed events of play.** Aims seen through, milestones, fights' typed ends, `ActionFeedback.taken`: the telemetry
   of 21–22 and the dramatic memory of 30 both want these as structured events with participants.

Whether the card, the promoted act and the tester can share seams 1–3 is what the three prototypes below are to find
out; if they need three unrelated paths through Kyrie, that is the finding.

## The three prototypes (owner, 11 November night, after Mission 20's playable work)

Each is to report concept validation ("the engine can expose this") apart from feature feasibility ("a useful,
beautiful, knowledge-safe card for any entity can be made of it").

1. **A universal entity card** with a player and a debug projection: the first, being small, useful to people at once,
   and revealing of what the engine knows; it forces the line between world truth, observer knowledge and presentation
   without multistep planning.
2. **A structured headless decision and session interface** (C, D).
3. **Derived opportunities in one small scenario**, with a bounded two- or three-step causal chain (A, B).

### Prototype 1, the entity card: what it found (12 November, early)

`EntityCard.of(campaign, id, 'player' | 'author')` (src/presentation/entity-card.ts, test/entity-card.test.ts) is
about a hundred lines. It is not drawn on any page and not served headless. It reads:

- the module's entity;
- the company's knowledge (`PlayerView.observe(...).knowledge`);
- the company's own relations to it;
- the offered actions bound to it (`PlayerView.choices` rows), with the glance's reasons where the page leads with one.

Probed in kahitude's debt start on four kinds of thing: Tuck the creditor, the mound Dolorechies, the dandelion on the
green, and the ring's lieutenant.

**Concept validation: what the engine can already expose.**

- **One path for three features.**
  - The card's acts are the same typed rows the page's promoted acts come from. The spec asserts that the card's *why*
    for Tuck is the glance's *why*.
  - In author mode, each act lists its success changes. That is a headless tester's "what would this change": asking
    Tuck about the old well is `+ knows(party, tower__old_well)`.
  - That fact `leadsTo` a place. So act → knowledge → place, a two-step story-distance chain, reads from typed data
    with no simulation.

  The card, the promoted act and the tester do **not** need three unrelated paths. They share the entity, knowledge,
  action and effect records. This is the most promising finding.
- **Identity apart from appearance, gated by knowledge, already in Kyr.**
  - An entity's `alias` names it as it looks until a fact is known. The mound is "a long mound north of Thornhaven"
    until the company knows its name, then Dolorechies; the spec checks both.
  - Its `roles` say who someone is now, by condition. Tan is "a man in a good coat behind the chandler's back-table"
    to the company and "Tan, the ring's man on the coast" to the author.

  A polymorphed knight could be authored the same way, as a role ("a raven") while a condition holds, though no
  runtime shape change exists.
- **Knowledge references entities by id.** A fact's words name entities as `{id}` references (`ObservationText.map`),
  and facts `leadsTo` places and are `revealedBy` things. The card finds what is known of an entity without searching
  any words. This is also the seam for typed references in prose (inventory item 4).
- **The author view is free:** every fact and measure the entity is in, its alias and roles, and its module.

**Feature feasibility: what a useful, beautiful, knowledge-safe card still needs.** The record is there; the feature
is not.

1. **No relation is typed as known or unknown.** Beyond presence, `knows(company, fact)` and observations, nothing says
   which facts about an entity the company may see. The prototype shows only facts whose subject is the company
   (`inDebtTo(party, Tuck)`): a stopgap, not a contract.
2. **An act's effects are only partly typed.** `Give`, `Bring`, `Slay` and resolved checks are not plain calls.
   Gathering the dandelion lists the crop taken but not the herb given. A tester's "what changes" needs every
   effect, with checks marked as uncertain (possibility against likelihood, item 13).
3. **When something was learned** is still found by a pattern over the log's change strings (`CompanyKnowledge`).
4. **What makes a card worth opening is elsewhere.**
   - A kind's illustration (data/paintings/plants.json, animals, monsters) and its natural history (the
     Encyclopedia) are not reached from an instance. The dandelion's card has only its line in the scene.
   - People have portraits; houses have emblems in places (TargetRow's `emblem`).
   - A person's history and loyalties are scattered over facts no one has typed as history.
5. **Provenance per fact is missing.** The module is read off the id prefix. Which module or rule asserted a fact is
   not kept.
6. **Cost.** A card builds the screen and the glance (milliseconds). That is fine on demand, but not for every name in
   a page of prose.

**Next, if the owner wants it:**
- a card drawn from a tap on a portrait or a scene name, in the player mode only;
- the effect list completed for `Give`, `Bring` and checks;
- a typed "known" mark for relations, tried on one person with a secret.

Preliminary research only, notes not systems: general counterfactual planning, the evolving Book, elaborate
perception profiles, dramatic memory, institutional plans, literate authoring, careers and companies.

## Recommended sequence

1. **First, the typing** that every direction leans on: the remaining text inferences (A, D, F) and a typed time for
   learning (F). Small, and already Mission 21's first architectural item.
2. **D and E together.** One world, five policies, the derived report. Cheapest, and it measures the atlas as it is.
3. **C's stdio front** over `EngineHost`, once D's frame is fixed. Then benchmark against the CLI.
4. **A's derivation** for three situations, with provenance. It needs 1, and gives E its "perceived".
5. **B's experiment** on one authored chain, after A says what may be shown. The persistent World and the planner
   make it cheaper than it sounds; state outside the World is what decides whether it is honest.
6. **F's contract**, when the Book is next redesigned, on 1 and C.

None of these is a Mission 20 requirement. Mission 20's handoff reports what was delivered and verified, apart from
what this record registers.
