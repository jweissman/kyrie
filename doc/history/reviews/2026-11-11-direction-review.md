# Westernesse creative and technical direction review (11 November 2026, night)

An independent, read-only review the owner passed on at the end of Mission 20 ("if you think it changes anything or
has good items for a register"). It is kept here whole, as given. Where its items stand against the register and the
forward-design record is in `open-register.md` §18. It does not change Mission 20's closing work; it argues for the
order of what follows (see `2026-11-11-forward-design.md`).

---

## Executive assessment

Westernesse has the foundations of an exceptional RPG, but it is presently at an inflection point.

The project has successfully demonstrated several difficult things:

- a persistent generated country can support authored adventures;
- choices can be grounded in one authoritative simulation;
- character knowledge can differ from world truth;
- conversations, paintings, journals, travel, combat, and generated geography can coexist in one application;
- players can form plans the game did not explicitly prescribe;
- actions can have delayed, durable consequences;
- the same public action model can support the browser, terminal, tests, NPC planning, and autoplay.

The bell and firebomb episodes from cold play are the clearest proof of the concept:

1. A person communicated useful information.
2. The player understood it.
3. The player formed a plan.
4. The player found or preserved the necessary resource.
5. The world accepted the plan through its ordinary rules.
6. The situation changed substantially.
7. The player experienced the result as their own idea.

That is Westernesse working.

The central risk is that these successes remain exceptional handcrafted alignments amid a much larger system whose
parts do not yet reliably compose. The project can already generate many places, people, actions, aims, routes,
fights, and facts. What it cannot yet guarantee is that these elements form a satisfying dramatic and causal sequence.

The next stage should therefore emphasize **compositional reliability**, not broader coverage.

My recommended direction is:

> Concentrate Westernesse around a repeatable unit of play in which character-specific evidence leads to a practical
> plan, the world offers meaningful resistance, the result is durably remembered, and the consequence creates a new
> possibility.

Build one dense opening and one exemplary undertaking around that unit. Use them to discover and harden the necessary
authoring and runtime contracts before expanding careers, formations, distant perception, or cosmological scope.

---

# Part I: Creative direction

## 1. The actual game underneath the features

Westernesse's feature list suggests a generated literary fantasy RPG. Its more distinctive identity is:

> A game about becoming capable of perceiving, undertaking, and altering increasingly consequential situations within
> a world that has its own history.

This identity has four movements:

1. **Perception:** What is happening here, and what can this character recognize?
2. **Commitment:** What is worth undertaking?
3. **Practical action:** What approach, preparation, resource, or relationship can change it?
4. **Historical consequence:** What becomes true because the player acted?

This produces a progression more interesting than conventional numerical advancement:

```text
At first:
few capabilities
little knowledge
small social reach
uncertain geography
local undertakings

Later:
specialized perception
tested relationships
rare equipment
institutional access
historical understanding
large undertakings
```

The player's power is an increasingly rich repertoire of meaningful actions.

That idea should govern which features are prioritized. A feature deserves near-term work if it strengthens this
cycle. It should wait if it primarily increases taxonomy, scale, or content volume without making the cycle more
reliable.

---

## 2. Creative pillars

I recommend adopting five ordered pillars.

### Pillar 1: Practical undertakings

Play centers on concrete ventures requiring judgment, preparation, and action.

This includes:

- expeditions;
- investigations;
- rescues;
- thefts;
- negotiations;
- recoveries;
- dangerous journeys;
- scholarly inquiries;
- institutional or personal interventions.

An undertaking should not merely be a journal entry. It is a changing situation with incomplete information,
resistance, and more than one plausible approach.

### Pillar 2: Character is a way of perceiving

Ancestry, calling, background, abilities, companions, and formation alter what evidence becomes intelligible.

This should go beyond bonuses and locked choices. A character's identity changes their reading of the situation.

The ideal output is concrete evidence:

- "The footprints double back, but only the lighter pair returns."
- "The mortar is newer than the surrounding wall."
- "The supposed blessing omits the name required for burial."
- "The ward was made to keep something in, not keep intruders out."

The weaker output is categorical metadata:

- "Ranger opportunity."
- "Knowledge here."
- "Danger detected."
- "Mage option available."

The semantic atlas can orient attention, but the fiction should provide the substance.

### Pillar 3: Resistance rewards intelligence

The material and social world should resist plans in legible ways.

Resistance can be:

- danger;
- cost;
- time pressure;
- missing information;
- physical obstruction;
- social obligation;
- conflicting interests;
- limited trust;
- difficult extraction;
- an irreversible choice;
- a tradeoff between desirable outcomes.

Resistance should not primarily mean higher enemy statistics. The game's best difficulty will arise when players can
improve their position through information and preparation.

### Pillar 4: The world remembers selectively but reliably

The simulation does not need to model every consequence. It does need to remember what the game made important.

High-salience events include:

- promises;
- rescue or abandonment;
- theft and desecration;
- destruction or repair;
- killing a named person;
- accepting payment;
- betraying trust;
- exposing a secret;
- changing access to a place;
- recruiting or dismissing a companion;
- resolving an undertaking.

If the game foregrounds one of these, it should usually alter future facts, dialogue, access, relationships, or
opportunities.

### Pillar 5: Every expedition enlarges the horizon

A successful or failed undertaking should tend to create one or more of:

- new knowledge;
- a relationship;
- a changed place;
- access to a new location;
- an object with practical significance;
- institutional standing;
- a capability;
- a debt or obligation;
- a larger historical question;
- the means or desire for another expedition.

This is the retention engine. Players continue because an accomplished thing changes what they can imagine doing next.

---

# Part II: Creative risk register

## C1. The vision exceeds the current repeatable play grammar

**Concern.** The creative vision includes local adventure, deep dungeons, living cities, political institutions,
warfare, careers, philosophy, planes, material simulation, generated civilizations, literary characters, comedy, and
cosmic history. All are compatible in principle. They are not equally ready for production.

**Evidence.** The current game can expose many hooks, but cold players still encounter: origin climaxes ending in an
empty box; undertakings ending silently; abilities that never become relevant; rewards with no future use; places or
people failing to reflect important acts; trivial or misleadingly forecast resistance.

**Consequence.** Production may accumulate content faster than the underlying grammar can make it consequential. Each
new system then increases the number of possible contradictions.

**Mitigation.** Define the minimum complete unit of Westernesse play: 1. evidence; 2. interpretation; 3. choice of
undertaking; 4. preparation or approach; 5. resistance; 6. resolution or intelligible failure; 7. durable consequence;
8. resulting possibility. Require new major systems to demonstrate how they strengthen at least one of those stages.

**Verification gate.** One undertaking can be played through by three contrasting characters and produces distinct
but coherent histories, including failure or retreat.

**Priority:** Critical.

## C2. The interface may over-classify mystery

**Concern.** The semantic atlas could pre-interpret the world too completely. If every opportunity is visibly labeled
as danger, reward, knowledge, wonder, or quest relevance, the player may read the interface rather than the fiction.

**Consequence.** Discovery becomes selection from pre-sorted content. Wonder becomes another resource icon. Suspicion,
ambiguity, and misinterpretation weaken.

**Mitigation.** Use three degrees of semantic disclosure:

- **Known:** The company understands the opportunity well enough to classify it.
- **Suspected:** Evidence suggests an aspect, but with uncertainty.
- **Uninterpreted:** Something is noticeable, but the player must investigate before its significance is known.

The atlas should be most confident about immediate public facts: an enemy threatening the company; a reward explicitly
promised; a followed undertaking's known next step. It should be less confident about: distant signs; ambiguous
artifacts; unfamiliar magic; concealed motives; historical significance. Do not mark "wonder" merely because an object
is magical. Let violet signify recognized violation of ordinary understanding, not generic fantasy decoration.

**Verification gate.** In the dense opening, at least one important sign is noticeable without its meaning being fully
classified. Different characters form different justified interpretations.

**Priority:** High.

## C3. Character-specific perception could become class-gated content

**Concern.** If the mage alone gets the mage solution and the thief alone gets the thief solution, identity becomes a
keycard system.

**Consequence.** Characters appear different, but the player's reasoning becomes less important. Missing a class may
simply remove content rather than create an alternate route.

**Mitigation.** Separate: **observation** (what is detectable); **interpretation** (what the character understands);
**action** (what approaches are possible); **advantage** (how a capability changes risk or cost). A specialist should
often receive earlier, clearer, or more actionable evidence, not exclusive access to the only viable route. For
example: everyone sees cracks around the sealed door; the thief recognizes recent tampering; the mason knows the wall
can be safely opened; the mage senses the seal is mundane; anyone may attempt to break it, find another way, or ask who
sealed it.

**Verification gate.** Each tested character has at least two viable plans, and no character's route is merely "press
the class button."

**Priority:** Critical.

## C4. The game promises freedom but often delivers isolated commands

**Concern.** Two to four foreground choices improve readability, but a choice is not yet an approach. "Attack,"
"Talk," and "Search" can remain isolated commands rather than parts of a plan.

**Consequence.** The interface looks more intentional without giving the player substantially greater agency.

**Mitigation.** Design situations around approaches composed of ordinary actions:

```text
Goal: get through the occupied gate

Possible approaches:
- learn the guards' grievance and bargain;
- find the neglected postern;
- create a diversion;
- recruit someone the guards recognize;
- fight;
- leave and return prepared.
```

The UI need not announce these as complete branches. It should expose evidence and executable steps from which the
player can form them. Create an authoring checklist for situations: What pressure holds the situation together? What
are the actors trying to preserve or obtain? What physical and social facts can be exploited? What information changes
the available plans? What happens if the player waits? What remains possible after failure?

**Verification gate.** A cold player can describe a plan in their own words before executing it.

**Priority:** Critical.

## C5. Origin stories create obligation before curiosity

**Concern.** The current origins supply identity and a clear goal, but several behave like predetermined quest chains.
Their momentum can expire before the player has learned why the world is interesting.

**Consequence.** Replay exposes repeated structure. Character creation promises biography while actual play wants
immediate adventure.

**Mitigation.** Proceed with the dense situation-led opening. Creation should establish: broad identity; a few
capacities; an immediate material position; one or two unresolved personal facts. The opening should establish:
pressure; curiosity; people; practical decisions; consequences; a route into the larger country. Mine the existing
origin material for later revelations, relationships, and obligations rather than discarding it.

**Verification gate.** The first five decisions include curiosity, practical judgment, and a consequence, not only
travel toward a biographical destination.

**Priority:** Critical.

## C6. Background revelation may feel retroactive or arbitrary

**Concern.** Choosing a specific past during play is promising, but can resemble rewriting the character whenever
convenient.

**Mitigation.** A history slot should have: a bounded family of compatible answers; a specific dramatic trigger;
permanent consequences; at least one benefit and one obligation or constraint; effects beyond a single check. The
choice should answer a question raised by the present scene.

**Verification gate.** A background revelation changes at least two of: capability, recognition, relationship,
obligation, future opportunity, or interpretation.

**Priority:** Medium; defer until the opening works.

## C7. Companions risk becoming equipment with dialogue

**Concern.** Current evidence shows companions can dominate combat while the protagonist's abilities become
irrelevant.

**Consequence.** Recruitment improves survival but diminishes character identity. The party becomes a stack of optimal
capabilities.

**Mitigation.** Each important companion should have: a reason to join; a current obligation; one capability that
changes planning; one meaningful limitation; an opinion or boundary likely to arise in play; a condition under which
they leave, refuse, or change; at least one relationship to the world independent of the protagonist. Combat should
provide reasons to use the protagonist's distinctive abilities even with a warrior present. Targeting, objectives,
protective duties, enemy intentions, or environmental problems can prevent the strongest attacker from solving every
encounter alone.

**Verification gate.** In the opening, recruiting the companion changes a plan but does not make the protagonist
strategically irrelevant.

**Priority:** High.

## C8. Combat is mechanically legible but dramatically thin

**Concern.** The combat presentation is praised, but fights are frequently trivial, one-sided, or resolved by a warrior
before other characters matter. The current positionless, whole-battle command model also limits environmental and
tactical expression.

**Consequence.** Danger appears as a red semantic category but does not reliably produce judgment, fear, sacrifice, or
adaptation.

**Mitigation.** Before expanding combat topology, improve encounter objectives and pressure within the present system:
prevent an escape; survive until a mechanism completes; protect a vulnerable person; interrupt a ritual; seize or
destroy an object; hold a passage while retreating; frighten or divide a group; choose whether to pursue; accept injury
to accomplish something in time. Make enemy intentions consequential and interruptible. Ensure support, control,
knowledge, and escape abilities matter. Calibrate forecasts empirically against created characters and common early
party compositions, not theoretical archetypes.

**Verification gate.** The opening contains: one avoidable danger; one encounter where non-damage action matters; one
credible retreat; one fight whose result is not foregone once a warrior joins.

**Priority:** Critical.

## C9. Forecasts may remove tension or betray trust

**Concern.** Combat forecasts are valuable because unscaled danger must be legible. But inaccurate forecasts are worse
than none, while overly exact forecasts can solve the decision.

**Mitigation.** Represent forecasts as character reasoning with bounded uncertainty: favorable; uncertain; dangerous;
overwhelming. Add relevant causes: "Their armor will turn most of your blows." "Edith can hold them, but they may reach
Merle." "You have no ready answer to the poison." "They cannot easily follow through the narrow door." Forecast the
shape of the risk, not only an aggregate winner.

**Verification gate.** Forecast buckets are calibrated against simulated outcomes for common starting parties, with
explicitly measured false-confidence rates.

**Priority:** High.

## C10. Consequences are inconsistently proportional to prominence

**Concern.** Some modest actions receive excellent callbacks, while major undertakings can conclude silently or with
generic rewards.

**Consequence.** The player cannot predict what the world considers important.

**Mitigation.** Introduce consequence budgets by dramatic prominence. A foregrounded undertaking should ordinarily
receive: immediate acknowledgment; mechanical resolution; journal update; response from an affected person or place;
at least one durable future implication. A minor ambient action may need only local state change.

**Verification gate.** Every followed undertaking in the acceptance slice has an authored or systemic aftermath
appropriate to its prominence.

**Priority:** Critical.

## C11. Payoffs do not consistently enlarge play

**Concern.** Treasure and payment are valid rewards, but become flat if coin, objects, and knowledge have few
compelling future uses.

**Mitigation.** Design rewards in five families: **Means** (gear, spells, transport, specialized tools); **Access**
(introductions, keys, permissions, routes); **Standing** (trust, reputation, institutional recognition);
**Understanding** (knowledge that alters interpretation or exposes a new approach); **Attachment** (relationships and
obligations the player wants to pursue). Prefer compound rewards. The bell episode succeeds because the knowledge and
object together enable a plan.

**Verification gate.** At least half of major rewards in the dense opening visibly change the player's future action
space.

**Priority:** High.

## C12. The living world may become busy rather than alive

**Concern.** Independent schedules, plans, deadlines, wars, economies, and reactive institutions can create enormous
state volume. Activity alone does not produce meaning.

**Mitigation.** Prioritize **relevant agency**: What does this actor want? What can they change? What evidence does
their activity leave? Under what conditions does the player care? How does the player interrupt, assist, exploit, or
misunderstand it? Simulate background activity only where it creates perceptible consequences or supports causal
consistency.

**Verification gate.** Every active plan included in the acceptance slice produces either player-perceivable evidence
or a later explainable consequence.

**Priority:** Medium.

## C13. Generated variety may outpace generated coherence

**Concern.** Structural replayability requires different causal situations, not merely different names and locations.
But generating complete mysteries or social conflicts is substantially harder than placing compatible content.

**Mitigation.** Generate from causal dossiers rather than disconnected tables: prior event; actors and motives;
resources and constraints; present state; evidence left behind; plausible misconceptions; escalation; possible
interventions. Use Deem to select and compose bounded dossiers. Use Kyr to express their consequences and interactions.
Do not attempt unrestricted narrative generation. The proposed murder mystery is a good eventual stress test, but it
should follow the dense opening rather than precede it.

**Verification gate.** A generated dossier can be reconstructed from its evidence, remains internally consistent, and
supports more than one productive line of inquiry.

**Priority:** Later.

## C14. The tonal range risks incoherence

**Concern.** The vision deliberately includes solemn history, comedy, grotesquerie, ordinary life, and metaphysical
wonder. This range is valuable but difficult.

**Mitigation.** Use situation-level tonal centers. A situation may contain contrast, but it should have a dominant
emotional contract. Control transitions through: character voice; consequence; visual composition; pacing; the
seriousness with which the world treats an event. Absurdity should arise from specific circumstances and remain
causally real. The Gaffer screaming like a kettle works because the ridiculous response changes the situation.

**Verification gate.** Playtesters can identify the intended emotional character of a situation without finding its
consequences tonally arbitrary.

**Priority:** Medium.

---

# Part III: Player-experience risk register

## P1. Prominent choices are interpreted as promises

**Concern.** A gold, green, red, or otherwise foregrounded choice carries stronger expectations than an ordinary legal
action. Cold play repeatedly found: gold leading past the relevant danger; gold attached to an action with no
meaningful effect; rewards owed but not led back to; unmarked danger behind a foregrounded route; an origin climax
producing no closure.

**Mitigation.** Treat a promoted opportunity as a checked contract:

```text
Perceived basis
+ executable action or intelligible investigation
+ truthful immediate relevance
+ expected outcome category
+ continuation or closure behavior
```

Create regression fixtures from every false promise documented in cold play.

**Verification gate.** The false-promise corpus passes across representative seeds and party types.

**Priority:** Critical.

## P2. Navigation competes with the world surface

**Concern.** The scene-first design succeeds only if movement and continuity are obvious. Cold players repeatedly had
to leave the scene and search a flat Go list for exits.

**Mitigation.** Use a stable three-level navigation model: 1. **Immediate spatial continuations** remain visible in the
scene. 2. **Nearby alternatives** live in a consistent secondary surface. 3. **Long-range travel** belongs to the map.
A newly opened way should appear immediately and remain spatially associated with what opened it. Never allow an empty
scene when a legal route out exists.

**Verification gate.** A player completes the dense opening without using Go to recover a missing immediate exit.

**Priority:** Critical.

## P3. The toolbar violates motor continuity

**Concern.** Conditional icons shift controls under the player's pointer.

**Mitigation.** Reserve stable positions for core controls. Disabled or unavailable controls can remain visually quiet
without collapsing the layout. Add labels or tooltips where icon meaning is not universal.

**Verification gate.** Automated layout tests confirm stable control positions across scene states and target viewport
sizes.

**Priority:** High, inexpensive.

## P4. Visual contradiction breaks world trust

**Concern.** A painting is not neutral decoration in a painting-led game. A pristine castle for a nettle-covered ruin
or a bright palace for a broken passage asserts false world facts.

**Mitigation.** Introduce art applicability metadata: place kind; architectural culture; interior/exterior;
intact/ruined/burned/flooded; day/night compatibility; required and forbidden visual elements. Permit a restrained
abstract or atmospheric fallback rather than a highly specific contradictory painting. Longer term, support state
variants for prominent places.

**Verification gate.** No painting in the acceptance journey contradicts an explicit textual fact about place type or
state.

**Priority:** High.

## P5. Semantic colors exceed player comprehension

**Concern.** Cold players inferred gold and red fairly well, but blue, rose, green/teal, and violet remained
ambiguous.

**Mitigation.** Reduce simultaneous vocabulary. Introduce categories through repeated contextual use, not a legend
alone. Use short textual cues where meaning matters: "your undertaking"; "something to learn"; "might join you"; "a
reward is waiting." Do not rely on hue distinctions for semantically adjacent states.

**Verification gate.** Cold players correctly explain the primary categories after ordinary play, without being
taught a taxonomy first.

**Priority:** Medium.

## P6. Too many aims dilute commitment

**Concern.** Players can accumulate many open aims quickly. "Your aim" and "another aim" become semantically weak.

**Mitigation.** Distinguish: followed undertaking; active obligations; leads; curiosities; distant possibilities. Not
every piece of information should become an aim. Promotion should identify the undertaking by name where ambiguity
exists.

**Verification gate.** At any point in the opening, the player can say what they are currently trying to accomplish
and why.

**Priority:** High.

## P7. Search risks becoming an interface tax

**Concern.** Important riddles, pressure-plate approaches, or clues may sit behind the Eye even when the scene already
foregrounds their subject.

**Mitigation.** Use the perception tiers consistently: **Ambient** (necessary context and obvious evidence);
**Directed** (intentional examination that spends attention or time); **Sustained** (costly search, detailed
assessment, or interruption risk). Never require directed examination merely to reveal the information needed to
understand an already presented irreversible choice.

**Verification gate.** Every consequential choice exposes its decision-relevant context before commitment.

**Priority:** Critical.

---

# Part IV: Technical risk register

## T1. `Affordances` is becoming a parallel semantic engine

**Concern.** `src/ui/affordances.ts` reconstructs relevance from schemas, arguments, touched entities, nested choices,
aims, regexes, prior actions, needs, spatial facts, and special cases learned from playtests. The code is empirical and
carefully documented, but the accumulation indicates a boundary problem.

**Failure mode.** False promotion; missing promotion; duplicated semantics; a new schema needing UI-specific
accommodation; behavior dependent on command naming conventions; tests fixing examples without stabilizing the
general contract.

**Mitigation.** Do not rewrite it wholesale. Establish a strangler path: 1. Add provenance to every inferred `Why`.
2. Identify the most failure-prone inferences. 3. Add typed sources upstream. 4. Compare typed and inferred outputs in
diagnostics. 5. Remove each inference only after corpus parity. Start with: aim advancement; owed rewards; newly opened
ways; action consequence targets; talk roles; reading actions.

**Verification gate.** The false-promise corpus passes with text inference disabled for migrated categories.

**Priority:** Critical.

## T2. `Why`, aspect, and presentation are not fully separated

**Concern.** A `Why` currently serves several purposes: ranking; urgency; semantic interpretation; display annotation.
`Aspects.by` then maps reasons into player meaning.

**Failure mode.** One ranking concern accidentally determines semantic color. A sign becomes "knowledge" even when it
indicates danger or wonder.

**Mitigation.** Separate four concepts:

```text
RelevanceSource — why this matters in world/player state
AttentionPolicy — why it should be foregrounded now
SemanticAspect — what the company understands it to concern
VisualTreatment — how the client renders it
```

A first incremental type could be:

```ts
interface Relevance {
  aspect?: Aspect;
  source: {
    kind: "aim" | "sign" | "reward" | "threat" | "need" | "novelty";
    id?: string;
  };
  confidence: "known" | "suspected";
  urgency?: "immediate" | "timely";
}
```

Keep `Why` temporarily as the promotion policy input.

**Verification gate.** Changing promotion order does not alter semantic aspects, and changing visual theme does not
alter either.

**Priority:** Critical.

## T3. Authored aspects could become UI metadata in Kyr

**Concern.** Adding "violet," "green," or even direct aspect labels to authored entities risks coupling world meaning
to the current interface vocabulary.

**Mitigation.** Author semantic claims, not colors: `sign of danger`; `evidence concerning X`; `owed benefit`;
`uncanny manifestation`; `relevant to undertaking X`; `possible recruitment`. Projection can derive aspects. The reader
can derive colors and glyphs.

**Verification gate.** A headless client can explain an opportunity's meaning without referring to visual terminology.

**Priority:** High.

## T4. Perception may fragment into bespoke scanners

**Concern.** `src/presentation/perception.ts` is appropriately small today, but extending its companionship traversal
separately for every aspect risks duplicated and expensive world searching.

**Mitigation.** Create a sign-based perception contract before broadening range:

```text
Phenomenon → emits/left sign → detectable under conditions
→ interpreted through capability → player-view fact
```

Perception results should carry: sign identity; origin or subject if knowable; perceiving capability; range;
confidence; specificity; time perceived; whether remembered. Cache or pre-index signs rather than scanning arbitrary
world facts for every facet.

**Verification gate.** Two perception types use the same contract without type-specific traversal logic, and the
glance remains within its performance budget.

**Priority:** High, but implement only after the opening proves the need.

## T5. Opportunity identity is insufficiently durable

**Concern.** Promoted entries primarily identify a page choice, command, subject, and exit. This is enough to draw the
current screen, but weak for longitudinal diagnostics.

**Failure mode.** It is difficult to ask: Did this opportunity persist? Did the player act on it? Did it produce a
result? Is this the same opportunity through an opener or route? Has it become exhausted? Did two clients present it
consistently?

**Mitigation.** Introduce a diagnostic opportunity key based on stable domain identity:

```text
situation/source + subject + approach/action + relevance source
```

Do not necessarily make opportunities first-class world entities. Begin as projected diagnostic identity.

**Verification gate.** The same underlying opportunity retains identity across browser/headless views and through
non-semantic wording changes.

**Priority:** High.

## T6. "Meaningful outcome" lacks an explicit contract

**Concern.** A promoted action can be legally executed yet do nothing the player experiences as a response.

**Mitigation.** Classify public outcomes: state changed; knowledge gained; access changed; position changed; resources
changed; relationship changed; danger changed; undertaking changed; capability changed; attempt failed with a stated
cause; no material change. This should be descriptive instrumentation, not a rule that every action must advance
something. Flag promoted actions ending only in "no material change" unless explicitly justified.

**Verification gate.** Every action in the false-promise corpus records the intended outcome category, and unexplained
no-change promotions fail a diagnostic test.

**Priority:** Critical.

## T7. Command lifecycle concentration threatens causal ordering

**Concern.** `Campaign` coordinates execution, rollback, deferred actions, interruption, watches, combat, perception,
and projection. In this game, ordering determines meaning.

**Mitigation.** Introduce explicit internal phases:

```text
Validate
Begin
Advance time
Complete or interrupt
Apply direct effects
Run watches/events
Commit creature state
Record perceptions
Refresh projection
Record outcome
```

Add assertions at boundaries: no leaked combat leases; world and creature projections agree; rollback restores both;
events are not recorded twice; an interrupted action reports whether its direct effect occurred; player view is
derived after all committed consequences.

**Verification gate.** Golden traces cover interruption, combat onset, deferred success/failure, event chains, and
rollback. Historical transcript digests remain unchanged unless deliberately migrated.

**Priority:** Critical.

## T8. Projection cache correctness is difficult to inspect

**Concern.** `PlayerView.observe` caches against world identity plus several auxiliary keys. Correctness depends on all
perception-relevant mutable state appearing in those keys or associated versions.

**Failure mode.** Stale choices, observations, danger readings, or party information after an unusual state
transition.

**Mitigation.** Document cache dependencies; add a cache-off mode; log invalidation reasons; run differential scenarios
with caches on and off; assert frozen projection immutability.

**Verification gate.** Canonical snapshots, choices, journals, and transcripts are identical under cache-on and
cache-off execution.

**Priority:** High.

## T9. Process-global catalogs constrain concurrency and isolation

**Concern.** Global mutable catalog state is protected through serialization and convention.

**Failure mode.** Cross-campaign leakage, interleaving failures, load contention, and difficult test-order bugs.

**Mitigation.** Near term: queue telemetry; interleaved session stress tests; catalog ownership assertions;
development deep-freeze where possible. Long term: scoped or snapshot catalog state; copy-on-write campaign
registries; removal of load serialization only after isolation is proven.

**Verification gate.** Multiple campaigns load, play, save, restore, and replay under randomized interleavings with
identical digests.

**Priority:** High, not necessarily blocking the opening.

## T10. Save compatibility is an unfulfilled product contract

**Concern.** The fiction promises persistent countries and histories, but the save format has no mature migration
path.

**Mitigation.** Before adding durable background slots, formations, careers, and expanded perception memory: choose a
compatibility policy; establish historical save fixtures; implement a versioned migration harness; test restoration
and replay separately; document which changes require migration.

**Verification gate.** Every supported historical fixture restores, produces its expected projection, and can execute
at least one new command.

**Priority:** Critical before persistent schema expansion.

## T11. Replay identity is coupled to current choices and wording

**Concern.** Transcripts can become fragile when presentation wording or choice organization changes.

**Mitigation.** Separate: durable action identity; action arguments; player-facing label; choice placement. Maintain
aliases only as a compatibility bridge. Test representative historical transcripts after UX changes.

**Verification gate.** A renamed or regrouped action replays through durable identity without resolving through
display text.

**Priority:** High.

## T12. Planner cost may grow faster than perceived world life

**Concern.** Richer agency increases planning branch factor, while much of that work may remain invisible to the
player.

**Mitigation.** Per-actor budgets; adaptive horizons; persistence of safe subplans; priority scheduling; high-agency
benchmark worlds; instrumentation connecting planner cost to perceptible consequence.

**Verification gate.** Defined p95 budgets for command and watch processing remain satisfied in a world with several
simultaneous active situations.

**Priority:** Medium.

## T13. Authoring power may outrun authoring legibility

**Concern.** Kyr can express increasingly complex conditions and consequences, but authors need help understanding
cost, reachability, and whether a player can perceive the necessary facts.

**Mitigation.** Add authoring lint for: expensive queries; actions whose prerequisites are never teachable; aims with
no reachable next step; rewards with no claim action; hidden passages with no discoverable sign; irreversible choices
without decision context; state changes with no possible perception; prominent entities with no aftermath hooks.
Provide a diagnostic "situation contract" report rather than only syntactic validity.

**Verification gate.** The exemplary undertaking passes both mechanical lint and player-legibility lint.

**Priority:** High.

## T14. Art selection needs typed world-state inputs

**Concern.** The painting system appears to select by broad place kind, with insufficient state and cultural
specificity.

**Mitigation.** Add a typed art query: place kind; culture/architectural family; environment; interior/exterior;
condition; light/time; prominent elements; forbidden elements. Allow specificity scoring and safe fallback. Record why
an image was selected for debugging.

**Verification gate.** A screenshot walk reports no hard contradictions and exposes selection provenance for every
painting.

**Priority:** High for a painting-led product.

## T15. Test volume may conceal missing contract tests

The repository has extensive test coverage, but a large test count does not itself protect cross-layer promises.

**Mitigation.** Organize a smaller acceptance corpus around contracts: legal action; truthful promotion; correct
perception; meaningful outcome; durable consequence; save/replay continuity; browser/headless parity; visual-state
agreement. Use the cold-play failures as named fixtures. Preserve ordinary unit coverage, but treat this corpus as the
product's constitutional suite.

**Verification gate.** Mission closure requires the contract corpus plus one uninterrupted rendered journey.

**Priority:** Critical.

---

# Part V: Recommended production path

## Phase 0: Write the acceptance constitution

Before more feature work, define the acceptance slice in operational terms. A new player should be able to:

1. make a recognizable character quickly;
2. enter an immediately charged situation;
3. perceive at least one character-specific piece of useful evidence;
4. form a plan not dictated as a quest step;
5. use a capability, object, or relationship;
6. meet credible resistance;
7. retreat or fail without the game collapsing;
8. cause a durable change;
9. receive a proportionate response;
10. emerge with a new desire and greater possibility.

This should fit within roughly 20–30 minutes, though quality matters more than exact duration.

## Phase 1: Harden trust contracts

Address before ambitious feature expansion: false-promise corpus; immediate navigation continuity; stable toolbar;
meaningful outcome instrumentation; command lifecycle assertions; combat forecast calibration; save compatibility
decision; historical replay lane; art contradiction gate. This phase makes the game trustworthy.

## Phase 2: Build one dense opening

Use a single bounded situation with: pressure; a small geography; one discoverable companion; one avoidable danger; one
meaningful fight; one obstacle supporting several approaches; one historical discovery; one durable consequence; one
route into the open world. Test with three contrasting characters. Avoid adding a generalized background, career, or
formation framework unless the slice specifically proves it necessary.

## Phase 3: Complete one undertaking end to end

Choose an existing situation with strong material and social possibilities. Bring it to exemplary quality across:
evidence; approaches; preparation; resistance; failure; consequence; payoff; continuation. Use this to migrate the
first opportunity inferences to typed provenance.

## Phase 4: Prove company play

Add one or two companions whose presence creates decisions rather than simply strength. Then test a very small
formation model with two or three examples. A formation must change actual play before a catalogue is expanded.

## Phase 5: Generalize perception

Only after the opening has concrete perception examples should the engine generalize: signs; interpretation; range;
confidence; specificity; memory; provenance. Start with two distinct kinds, perhaps danger and companionship or danger
and the uncanny, to prove the contract.

## Phase 6: Expand structural replayability

Once a complete situation grammar works: alternate causal dossiers; varying evidence; different recruitments;
background revelations; institution-linked opportunities; one generated mystery; career emergence. Do not begin with
combinatorial completeness.

---

# Part VI: Decision rules for scope

When considering a new feature, ask:

- **Does it improve the next 30 minutes?** If yes, it may be near-term. If it mainly enriches an imagined hundred-hour
  campaign, defer it until the opening retains players.
- **Does it produce new reasoning or only new classification?** A new perception type is valuable if it changes what
  the player can infer and do. It is weak if it merely adds another colored marker.
- **Does the world respond, or only record?** A journal update is not sufficient consequence for an important act.
- **Does the feature compose through existing actions?** Prefer capabilities that make current objects, people,
  places, and actions newly useful. Avoid parallel minigames or special-case resolution systems.
- **Can it be proven with two examples?** If not, the abstraction may be premature.
- **Can failure remain interesting?** A feature is stronger when unsuccessful use changes the situation rather than
  merely returning "no effect."

---

# Part VII: Key questions the team should answer

1. What is the smallest undertaking that expresses the entire game?
2. How uncertain should the semantic atlas be allowed to appear?
3. When does character perception reveal a fact, and when does it merely suggest where to investigate?
4. Which categories of action must the world remember reliably?
5. What is the intended role of combat: obstacle, climax, resource pressure, tactical expression, or all four in
   different proportions?
6. How often should preparation decisively change an encounter?
7. What does an excellent failure look like in Westernesse?
8. What should a player normally bring home besides money?
9. How much authored aftermath is economically sustainable per undertaking?
10. Which consequences can shared rules generate convincingly, and which require literary authorship?
11. How much ambiguity can the UI preserve without returning to obscurity?
12. What persistent compatibility promise is being made to players now?

The dense opening should be designed partly to answer these questions through play, not only through documentation.

---

# Final recommendation

Do not reduce the vision. Reduce the number of fronts on which it is being pursued simultaneously.

The next milestone should not be "more of Westernesse." It should be:

> One compact piece of Westernesse in which every layer agrees.

The painting depicts the place that exists. The character perceives evidence they are capable of understanding. The
interface foregrounds a truthful possibility. The public action performs what it claims. The world offers intelligible
resistance. The result changes authoritative state. People and places remember what matters. The journal explains
rather than substitutes for consequence. The reward expands future play. The player leaves with a plan of their own.

That slice would be more than a polished prologue. It would be the production template for the entire game. Once it
works, the project can scale outward with confidence. Until it works, additional careers, planes, cities, formations,
and generated situations will multiply both possibility and contradiction.
