# Westernesse: from exposed systems to an inhabitable adventure

Independent product-design review, 4 November 2026.

## Scope and evidence

This is a read-only assessment of the player's interaction model, not an implementation plan derived from the code,
a general architecture audit, or another defect catalogue. It asks what the experience should be, why the present
product does not reliably produce it, and what coherent interaction grammar should replace the remaining web-
application habits.

The assessment considered:

- the Living Design Atlas, Aesthetic Doctrine and Interaction-Design Playbook, and annotated interface specification;
- the M19 mandate, baseline, progress, register, inherited findings, and M18/M19 process audit;
- prior independent cold-play and systemic-enjoyment reports, especially their findings on attention, navigation,
  aims, contextual actions, danger, and the expedition loop;
- current M19 evidence at desktop, tablet, and phone sizes; and
- a fresh Playwright cold-play of the deployed product at `https://jweissman.github.io/kyrie/`.

The fresh play used only controls offered by the product. The first protagonist was Nan, a human diviner and former
scribe, following *The brothers' errand*. She delivered the letter to Isla, learned and travelled the route to
Lunalac, read the old inscription, opened the speaking door, entered the site, cast Light, inspected a humming
obstacle, risked it, and died in one round. A second quick-start protagonist followed *What is owed*, spoke to
Berrian, learned of the king-barrow, explicitly followed the crown aim, and attempted to locate the next step on the
regional map. The latter map was also reviewed at 390 by 844 pixels.

The available browser environment required temporary browser libraries. Playwright artifacts were kept outside the
repository after the session. No game or documentation files were altered during the review.

---

## 1. Executive diagnosis

Westernesse's principal problem is no longer poor styling or a lack of systems. The current product can already
produce brief sequences that feel like a literary RPG: a particular person receives a meaningful answer, gains
knowledge, follows a route, crosses a threshold, uses an ability, and changes a place. Isla's response to the
brothers' letter is the clearest example in this playthrough. It establishes history, hospitality, danger, equipment,
and geography in one natural exchange. The itinerary to Lunalac is lucid. Reading the lintel makes the protagonist's
background matter. Opening the speaking door produces a satisfying physical consequence.

The governing problem is that this experiential grammar is local and intermittent. Between those authored moments,
the product reverts to exposing classifications, entities, destinations, and legal commands. The player can operate
the world, but the interface does not consistently compose what the present moment means.

The central diagnosis is:

> Westernesse still treats a place as a container of commands more often than it treats it as a situation in which
> a protagonist is attending to something.

Five failures have the greatest consequence.

### 1.1 The scene does not decisively own the viewport

The principal M19 composition divides literary presentation from operational choice: prose and retained results on
one side, an action catalogue on the other. This is orderly and often handsome, but it creates two competing
products. One asks the player to inhabit a place; the other asks them to process its inventory.

At phone width the conflict becomes document scrolling. The place, promoted actions, people, ways, and persistent
`Every way / Look about / More` controls form a long page. The player can leave the prose behind before choosing the
act it was meant to motivate. In a sparse cellar, the same fixed composition simply leaves most of the viewport
empty. The template is governing the moment rather than responding to it.

Normal play should use a fixed application viewport. Long text may scroll within a reading surface, but the present
place, subject, and available commitment should remain composed together. Reference catalogues should enter
temporarily rather than requiring the ordinary scene to behave like a dashboard.

This is a structural interaction correction, not a spacing adjustment.

### 1.2 Legal possibility is still mistaken for meaningful possibility

The live character-creation flow begins exceptionally well. Premise, ancestry, calling, and magical school are
staged, readable, and consequential-looking. The former-trade step then exposes dozens of near-synonymous scholarly
professions at once: academician, annalist, antiquarian, arcanist, archivist, atomist, bibliophile, classicist,
encyclopedist, historian, humanist, metaphysician, polymath, scholar, and many more. A rich ontology has been mistaken
for a useful player choice.

The same problem recurs in play. People, rumors, exits, generic actions, nearby features, interface utilities, and
aim-serving acts can all become peers. Grouping and modest promotion reduce visible overload but do not create a
dramatic decision.

The interface requires a semantic distinction between:

- what is immediate or changing;
- what serves the player's current undertaking;
- what may reveal a new intention;
- what is routine reference or merely legal.

Usually no more than two or three interventions should be promoted. Everything else may remain reachable through one
deliberate reference action. More content in the current projection would worsen the problem.

### 1.3 Knowledge, intention, route, and action are not reliably connected

The live product contains the beginnings of the right distinctions. Berrian's rumor produces `You know now`, then `A
new aim`, then an explicit `Follow this` choice. This is much stronger than silently converting every conversation
topic into a quest.

The continuity breaks immediately afterwards. The salt-house scene does not show the followed crown undertaking or
its next uncertainty. Opening the map leaves Brightcarr selected and exposes the country at large. A barrow is present
only as `a barrow, not yet made out`; nothing connects it to `the old dead under Brightcarr`, explains whether the
protagonist knows its direction, or says whom to ask next. The player formed an intention, but the game's projection
did not change around it.

In contrast, the authored Lunalac lead carries an exact route and the map selects it automatically. This proves that
the desired experience is possible. It also shows that aim quality currently depends on locally complete authoring
rather than a dependable product contract.

A rumor, a lead, a chosen undertaking, geographic knowledge, a route, and an immediate action are different things.
They require separate records and explicit relationships.

### 1.4 Spatial scale changes without a common orientation grammar

The regional map is the strongest spatial surface. It gives terrain, roads, water, place, distance, discovery, and
an attractive sense of a surrounding country. Its 390-pixel presentation is convincingly game-like, though labels
compete and the followed barrow aim supplies no directional help.

Settlement and interior navigation fall back to lists. After the speaking door opened, the new inward way appeared
simply as `Lunalac`, identical to the site the protagonist already occupied. Inside, a speaking door was labelled
`toward Out to Lunalac`, and the next chamber appeared only as `toward the pillared hall`. These phrases describe
edges without giving the player a stable plan of the site.

Westernesse does not need tactical grids or first-person 3D. It needs a shared spatial vocabulary across four scales:

1. region;
2. settlement;
3. building or adventure site;
4. current locus and visible thresholds.

Every scale should preserve current position, entrance, way back, known connections, barriers, vertical transitions,
and the difference between observed, inferred, traversed, and unknown space.

### 1.5 Attention does not reliably produce usable knowledge

The most serious live-play failure occurred at Lunalac. Light revealed a humming enchanted object blocking the long
stair. The product said it had `Not looked at closely yet` and provided a `Look at the enchanted object` control.
Expanding that inspection revealed no observation, method, inference, ability, or alternative. Choosing `Risk the
enchanted object` required a second click, correctly warning that the act was consequential, but the preview merely
repeated that it was an ordinary-looking thing which hummed.

Nan then died in one round from four damage.

This is not principally a numerical-balance complaint. The interaction promised that close attention might inform
the decision, then failed to reward attention with knowledge. The death therefore felt underinformed rather than
dangerous. A diviner and former scribe did not receive a distinctive reading, a mage did not recognize a magical
hazard, and inspection did not expose a safer experiment or honest ignorance.

When inspection cannot provide useful information, the product should say so plainly and identify what is missing:
another person, a tool, a skill, a sacrifice, or deliberate risk. A feature sheet that expands to nothing is not an
interaction.

### Overall judgment

The existing screen paradigm is not wholly wrong. Several foundations should be preserved:

- a situated individual rather than an opening party-configuration exercise;
- prose as perceptual and dramatic material;
- the regional map and knowledge-sensitive geography;
- explicit confirmation of irreversible acts;
- character capabilities that can change perception;
- the distinction among travel, exploration, and close interaction;
- bright literary modernism and restrained interface chrome.

What should be rejected is the universal `literary content beside an action inventory` composition. It may serve an
overview or preparation state, but it cannot remain the default grammar of play.

---

## 2. A positive product model: situated attention

The Aesthetic Doctrine's continuous field of attention is the right foundation, but its responsibilities should not
be treated as panels or permanent destinations. Scene, subject, intention, action, result, and reference form a cycle:

```text
PLACE
  reveals a SUBJECT
    which invites or threatens an INTENTION
      expressed through an ACTION
        answered by a RESULT
          which changes the PLACE

                  REFERENCE
       map · journal · person · pack · rules
                      |
PLACE → SUBJECT → INTENTION → ACTION → RESULT → changed PLACE
```

Call this the **situated-attention grammar**.

### Rule 1: one place anchors every activity

The persistent place line answers where the protagonist is, within what larger place, at what relevant time, and by
what known way they may return. Conversation, commerce, inspection, and combat occur in that place; they do not
launch unrelated applications.

### Rule 2: one subject owns the middle of the viewport

The subject may be a waiting person, a town's immediate activity, a mechanism, a passage, an enemy, a clue, or the
consequence of returning. Selecting it focuses the field while retaining enough peripheral context to preserve
place.

### Rule 3: promoted actions are sentences about the subject

Prefer complete, contextual actions:

- `Ask Berrian how people reach the old dead.`
- `Test the humming object with a loose stone — unknown response.`
- `Force the hasp with your crowbar — loud, about 10 minutes.`
- `Withdraw up the stair before the swarm closes.`

Every commitment should expose its object or destination, expected cost, known danger, relevant capability, and
relationship to the followed undertaking when applicable. `Other possibilities…` opens the legal reference set; it
does not compete equally with the present decision.

### Rule 4: results temporarily replace choices

After commitment, do not immediately refill the page with another command set. Protect the causal beat:

```text
ATTEMPT   You wedge the crowbar beneath the hasp.
OUTCOME   The staple tears out; the crack echoes below.
CHANGE    Door open · 10 minutes passed · something has stirred.
NEXT      Enter quietly / call down / leave before it comes nearer
```

Mechanical detail may expand underneath. The result remains until acknowledged or until the player begins the next
intentional act.

### Rule 5: reference surfaces are temporary lenses

Map, journal, inventory, character, relationship, and rules surfaces open beside the scene on wide displays and
replace it with a clear return context on narrow displays. They remember what invoked them. A map opened from the
crown undertaking should show what is known, unknown, or merely rumored about the crown's location, then return to
that undertaking.

### Rule 6: space uses maps; drama uses scenes

- Region travel uses the terrain map.
- Town orientation uses a compact settlement plan.
- Buildings and dungeons use a structural diagram.
- People, objects, and confrontations use the focused scene.
- Books and inventories use reference sheets.

These are distinct compositions but one game because place, subject, undertaking, result, typography, and transition
remain continuous.

---

## 3. Five representative experiences

The sketches specify information hierarchy and behavior, not decorative art direction.

### A. Arriving in a town

```text
┌ MILLHOLM · the eastern camp              Morning · humid ┐
│ You arrived by the Mistshaw road                      MAP │
├───────────────────────────────────────────────────────────┤
│                  [compact town plan]                      │
│       Mill road ─ Green ─ Old corn-store                 │
│                       │          ◉ you                    │
│                  Chandler                                │
│                                                           │
│ MILLHOLM                                                  │
│ Half houses, half wagons. Everyone looks up when a        │
│ stranger comes. Your brother is waiting by the road.      │
│                                                           │
│ OSBERT IS WATCHING THE MISTSHAW ROAD                      │
│ He has your father's spear across his knees.              │
├───────────────────────────────────┬───────────────────────┤
│ You came to find your father.     │ Speak to Osbert       │
│ Last known: Mistshaw road.        │ Ask at the salter's   │
│                                   │ Look at the notice    │
│                                   │ Other possibilities…  │
└───────────────────────────────────┴───────────────────────┘
```

The player first recognizes the place, then their reason for being there, then one living subject. Public jobs remain
on a notice until it is read; they do not arrive as three quest paragraphs inside the town description. A full town
directory is deliberate reference, not the initial decision.

The prose should provide one town image and one immediate observation. Gazetteer information belongs in later
attention or reference.

### B. Entering a building and meeting someone

```text
┌ MILLHOLM · Bask's salt-house                  8:35 a.m. ┐
│ Green ← front door                                      MAP │
├──────────────────────────────┬────────────────────────────┤
│ Front room                   │ BASK                       │
│ counter · scales · rear door │ Salter; flour on one sleeve│
│                              │                            │
│ Bask is lifting a sack       │ “You've read the notice,  │
│ onto the scales.             │ then?”                     │
│                              │                            │
│                              │ Ask for the store key      │
│                              │ Ask what came through here │
│                              │ Buy supplies               │
│                              │ Let him finish weighing    │
├──────────────────────────────┴────────────────────────────┤
│ Also present: locked rear door · sacks · account book    │
│ Leave for the Green                              INSPECT… │
└───────────────────────────────────────────────────────────┘
```

The inhabitant acts or speaks before becoming a database of topics. Conversation shows the latest exchange and a
small set of appropriate responses. Introducing another subject is available but secondary.

Commerce remains within the encounter. The establishment first presents useful, characteristic offers; complete
stock is reference. Closing commerce returns to the current exchange. Leaving returns to the town plan with the
building behind the protagonist.

### C. Following an undertaking

The product should preserve four distinct records:

```text
HEARD
“Something has come up beneath the churchyard.”
Source: notice at Millholm well

LEAD
Perrin at the shrine may know what happened.

UNDERTAKING
Find what is disturbing the churchyard.
Chosen by the player.

ROUTE KNOWLEDGE
Shrine known in Millholm.
Catacomb entrance not yet known.
```

The journal then presents knowledge and uncertainty rather than a prescribed solution:

```text
┌ BOOK · Undertakings                                      ┐
│ FIND WHAT IS DISTURBING THE CHURCHYARD                   │
│                                                         │
│ What you know                                           │
│ • The notice promises fifteen coin.                     │
│ • Perrin at the shrine is named as the contact.         │
│                                                         │
│ What remains uncertain                                  │
│ • Where the entrance is.                                │
│ • What “has come up.”                                   │
│                                                         │
│ [Show Perrin on town plan] [Suspend undertaking]        │
└─────────────────────────────────────────────────────────┘
```

Opening the map from here highlights confirmed destination, approximate area, known route, and route gaps. If the
location is not known—as in the live crown example—the map must not pretend to know it. It should say who or what
might resolve that uncertainty.

Discovery should report an epistemic change, not only a location unlock: what was found, which prior claim it
confirms or revises, and what connection the protagonist can now use.

### D. Exploring a dungeon

A simple structural diagram would materially improve orientation:

```text
┌ CATACOMBS BENEATH MILLHOLM · upper level       Torch 52m ┐
│ Entrance: vestry stair                     Retreat: clear │
├──────────────────────────────────┬─────────────────────────┤
│ [Vestry stair]──[Passage]──[YOU] │ THE OSSUARY             │
│                      │           │ Shelves of opened bones.│
│                 barred arch      │ Grain husks lie in the  │
│                      │           │ floor joints.           │
│                 [unknown]        │                         │
│                                  │ A scratching has stopped│
│ solid = traversed                │ behind the eastern wall.│
│ pale = seen                      │                         │
│ broken = inferred, not confirmed │ Examine the grain trail │
│                                  │ Listen at the wall      │
│                                  │ Open the barred arch    │
│                                  │ Return to vestry stair  │
└──────────────────────────────────┴─────────────────────────┘
```

The diagram is topological, not tactical or metrically exact. It requires stable places and passages, containment,
level, transition type, direction or consistent placement, reversibility, barrier, knowledge state, and entrance/
exit relationships. Unknown rooms are not named question marks; only observed continuations appear.

Inspection focuses on methods appropriate to the protagonist. A scholar, thief, mage, and ordinary traveller should
sometimes receive different readings of the same cue. If none can learn more, the interface says why.

Danger becomes apprehensible through noise, tracks, scale, changing conditions, visible intent, or retreat cost
before it becomes damage. Novice content needs an informed basis for judgment even when certainty is impossible.

### E. Resolving an encounter and returning

```text
┌ RAT-RUNS · beneath the corn-store           Round 2 · 12s ┐
│ Exit: west passage · cellar stair beyond                  │
├──────────────────────────────────┬─────────────────────────┤
│ THE SWARM                        │ YOUR TURN               │
│ Rats pour through two wall gaps. │ Wenna 7/10 · torch 31m │
│ One mass circles the lantern.    │                        │
│ Bask's missing sack is behind it.│ Sweep with spear       │
│                                  │ Throw oil at the gap    │
│ Condition and known intent,      │ Protect the lantern    │
│ not an omniscient stat block.    │ Withdraw west          │
├──────────────────────────────────┴─────────────────────────┤
│ LAST EXCHANGE                                             │
│ You drove the nearest rats back, but three reached the oil│
│ flask. Lantern threatened next turn.                      │
└───────────────────────────────────────────────────────────┘
```

Combat concentrates stakes, current actor, perceptible intent, party resources, restrained actions, retreat, and the
latest causal exchange. It should not become the ordinary command browser with greater urgency.

After resolution, an aftermath surface protects the result:

```text
THE SWARM WITHDREW INTO THE EASTERN CRACKS

Recovered: Bask's sack; a broken shrine seal
Cost: Wenna 4/10 · lantern lost · 6 minutes
Unfinished: eastern breach remains open

[Inspect the seal] [Bind wounds] [Return to Bask]
[Search further despite the open breach]
```

The first scene on returning to town is the consequence, not the generic town menu. Recognition, payment, changed
place, new interpretation, and successor possibility appear before ordinary navigation resumes. Familiarity becomes
satisfying because the player can see both what endured and what changed.

---

## 4. Visual identity

Bright literary modernism is a sufficiently strong and distinctive direction. It is preferable to parchment fantasy,
generic dashboards, and ornamental card grids. The current dark M19 presentation has atmosphere and confidence, but
without a stronger interaction composition it risks becoming a handsome command console.

Use a small rule set:

1. One expressive display face for place and major consequence; one excellent literary face for prose; one restrained
   control face for costs and metadata.
2. Keep prose to roughly 55–75 characters per line. Mechanical explanation does not impersonate literary prose.
3. One principal subject per viewport. Borders mark thresholds or sheets, not every entity.
4. Gold means committed intention or meaningful change, not every combination of selection, focus, destination, and
   availability. Use a second restrained color for knowledge and discovery; reserve red for danger or irreversible
   cost. Every state also has text or shape.
5. Regional maps are geographic; settlement maps are spare plans; interiors are structural diagrams. All distinguish
   current position, selection, destination, route, rumor, and unknown space.
6. Use 150–300 ms transitions to preserve continuity: subject focus within place, map opening from the current marker,
   a connection drawing in, a result receding into history. Respect reduced motion.
7. Illustration is editorial, not infrastructural. A place without bespoke art remains convincing through typography,
   spatial form, concrete prose, restrained color, and a living subject. Images never carry exclusive state or
   navigation.

The mobile map is the strongest evidence that Westernesse can already look like a designed game without an expanded
art pipeline. Its next refinement should reduce competing labels and make the followed undertaking visually
authoritative rather than add more scenery.

---

## 5. Required semantic capabilities

This redesign cannot be achieved by styling alone. It requires bounded additions to player-facing semantics:

| Capability | Player-experience responsibility |
|---|---|
| Situation with subject, pressure, participants, phases, and aftermath | Stage what is happening rather than list entities |
| Salience facets: immediate, undertaking-serving, revealing, reference | Distinguish meaningful from merely legal action |
| Knowledge record with source, confidence, age, and subject | Separate rumor, perception, and fact |
| Distinct lead, undertaking, route knowledge, and immediate action | Give intention a coherent lifecycle |
| Spatial containment, adjacency, level, threshold, and reversibility | Draw honest settlement and dungeon plans |
| Action preview with duration, cost, commitment, known risk, and affected pressure | Make decisions trustworthy |
| Structured result and state delta | Show attempt, outcome, change, and next relevance |
| Aftermath surface | Make persisted consequences perceptible |
| NPC initiative | Let people ask, warn, refuse, or act before being queried |
| Capability-sensitive perception | Make identity change how a shared situation is read |
| Explicit danger cues and perceptible intent | Create apprehension before penalty |
| Merchant role, stock rationale, service, and interest | Make commerce an encounter rather than an item list |

The interface cannot manufacture dramatic content. A mine becomes inviting because a discrepancy, person, valued
possibility, or meaningful uncertainty points into it. A conversation feels personal because the other character has
a current purpose, limits, memory, and possible response. No layout can turn an undifferentiated topic or destination
inventory into drama.

---

## 6. Prioritized implementation sequence

### Phase 1 — Establish one new scene contract

**Structural change.** Recompose the reference town and first expedition around place, current subject, at most three
promoted actions, one `Other possibilities…` reference entrance, a protected result state, and a persistent way back.
Remove `Every way`, `Look about`, and `More` from equal permanent prominence.

Do this before redesigning every secondary screen.

### Phase 2 — Separate knowledge, intention, and route

**Necessary correction and architectural dependency.** Introduce distinct player-facing records for heard knowledge,
leads, selected undertakings, route knowledge, discoveries, and resolved consequences. Make journal, map, scenes, and
conversation project the same records.

The live crown example is the acceptance case: after `Follow this`, the player must see the next known uncertainty or
the means of resolving it.

### Phase 3 — Add local spatial projections

**Structural change and architectural dependency.** Create one reusable settlement plan, building plan, and dungeon
plan using actual containment and connections. Support levels, entrances, barriers, traversed paths, and honest
unknowns. Preserve the existing regional map.

### Phase 4 — Recompose three central activities

**Immediate interface work.** Apply the same grammar to:

1. conversation and commerce;
2. feature inspection and contextual ability use;
3. combat, aftermath, and retreat.

Each activity retains place, subject, undertaking, and return context.

### Phase 5 — Supply dramatic semantics

**Content and generative dependency.** In the reference loop and one second location require one person with
initiative, one visible pressure or uncertainty, two materially different approaches, one capability-specific
perception, one readable danger, one return consequence, and one successor possibility or clearly settled quiet.

Express these through reusable situation and aftermath contracts rather than bespoke town logic.

### Phase 6 — Refine the visual system

**Desirable enhancement.** Normalize type and action treatments, refine map tokens and diagram symbols, add restrained
transitions, improve responsive composition, and selectively use accurate illustration. Do not begin with a reskin or
new art pipeline.

### Smallest coherent release slice

The minimum credible redesign is:

1. fixed-viewport scene;
2. semantically promoted actions;
3. structured retained results;
4. separate undertaking, knowledge, and route records;
5. one settlement plan and one dungeon plan;
6. one complete leave–investigate–resolve–return loop; and
7. independent replay.

Anything smaller risks rearranging the same legal-action inventory.

---

## 7. Acceptance protocol

Recruit five players who have not read the design documents. Give no procedural help beyond how to begin. Record the
screen, actions, pauses, and spoken understanding. Use the reference scenario, one alternate calling, and one second
generated or authored location.

### Comprehension

Within one minute of arrival, each player can state where they are, why the protagonist is there, what is happening,
one person or feature that matters, and two sensible acts. They do not open the complete action reference to answer.

### Orientation

After entering a building and a three-room site, the player can identify entrance, current location, unexplored
continuation, known barrier, and route back. Four of five answer correctly without reconstructing the place from the
story history.

### Intention

After hearing two rumors and selecting one undertaking, players correctly distinguish what they heard, what they
chose, where they know to go, and what remains uncertain. After commerce and rest they resume it without searching
the journal from scratch.

### Action integrity

Before a consequential act, ask what the player expects to spend or risk. Afterwards, ask what changed. Expectations
should match the actual commitment, and the result should be noticed without opening a log. Inspection must either
change the player's information or plainly explain why it cannot.

### Continuity

Across town → person → commerce → map → travel → dungeon → encounter → aftermath → town, players can name their place
and present purpose after each transition. No activity feels like an unrelated application.

### Pacing and attention

Measure document-level scrolling in ordinary play, openings of complete action reference, scanning time before the
first meaningful act, accidental navigation, repeated rereading, and actions chosen only to discover what an
interface category contains. The target is not zero hesitation; it is hesitation about the world's decision rather
than the interface's organization.

### Motivation

At the end of the return scene ask what the player wants to do, what they are curious about, what changed, and whether
they would continue without being asked to test more. At least four of five should name a concrete self-formed
intention and elect to continue for another twenty minutes.

That final measure is decisive. A comprehensible interface that produces no curiosity has not solved Westernesse.

---

## Final judgment

Westernesse should not become a conventional menu RPG, tactical grid, illustrated gamebook, or map simulator. Its
distinctive experience is already visible: a particular person attends closely to an enormous world; one fact
connects to another; action changes the meaning of a place; returning reveals that the world remembers.

The product becomes convincing when it stops displaying everything the simulation permits and starts composing what
the present moment means.

The decisive work is therefore not a larger menu hierarchy or another visual pass. It is to make **place, subject,
intention, action, result, and remembered consequence** the authoritative grammar of play—and require runtime,
content, maps, prose, and interface to speak that grammar together.
