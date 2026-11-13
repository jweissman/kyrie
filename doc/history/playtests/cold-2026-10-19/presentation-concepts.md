# Three ways to present the same adventure

Companion to the [continued investigation](investigation.md). These are competing **information hierarchies**, not three skins for the existing five panes. All use its inspect → select → preview → commit grammar. Bracketed controls are proposed; no prototype or replacement interface has been built.

## Shared comparison material

Use the same actual Kyr situation and party for all concepts:

- **Pell:** Hoist room, pinned beneath timber rack; company carries pry bar. Lever 10m, dig 40m, heave with a selected lifter. Existing text warns against hauling; no invented structural physics or guaranteed spoiler of the heave result.
- **Ash:** Casting gallery, hound guards hoist passage. Hunter approach, spend a ration, or attack. Hesta warns that harming him costs her help. In the comparison checkpoint rescue is already complete; this is further exploration, not a necessary fight to save Pell.
- **Sentinel:** Valve chamber; construct resists physical damage, is poison-immune, does not block the two exits. Party starts 7/12/12 HP, Dori has 2/6 mana, earlier potion spent. Steam threatens boiler arch; pipe walk is a separate way. Combat has no positioning or environmental commands. Exact traits shown below assume the current description has established them to the party.

The three scenes occur at different times in the recorded adventure. Wireframes do not combine them into a single fictional instant. Enemy opening sweep and later numerical results are from the recorded encounter, not predictions. The 1:40 p.m. closure shown during the rescue is known from Wren. Graphs reveal only discovered/observed connections; compact sketches omit some links for readability.

## Concept 1 — Illustrated adventure book

**Primary unit:** an unfolding scene and its consequences. An illustration helps recognize the place; it carries no authoritative geometry or hidden action targets. Prose, people/features and contextual intentions form one reading column. Mechanical detail sits under the action; map, Party and Notes replace/open over the spread rather than remaining beside it.

### Pell: scene spread

```text
CAUGHT BELOW   /   Hoist room                 Day 1, 11:40
Find Pell · culvert expected to flood about 1:40      [Map]

[Illustration placeholder: timber rack and hoist drum]
[Evocative scene only; no distances or clickable secret objects]

Pell lies half under the timber rack, one leg trapped.
“Don't just haul on it; I heard something crack already.”

[Inspect rack]  [Speak to Pell]  [Inspect exits]

Rack — pinning Pell
  [Lever with pry bar]  [Dig beneath]  [Heave — choose lifter]
  Selected: lever · company has bar · 10m
                                      [Lever rack — 10m]

Party: Elen 7/7 · Bran 12/12 · Dori 12/12       [Party/Notes]
```

**Flow:** inspect rack → choose method → inline preview → explicit lever action → response replaces choice area, saying Pell pulled free → short changed-state line → escort intention. Illustration may be reused while the caption/state changes; it must not keep showing a pinned person as current reality after release. If no accurate illustration is available, omit it. No image generation is required to validate this concept.

### Ash: conversation and consequential choice

```text
CASTING GALLERY
[Illustration placeholder: moulds and broken roof]
Ash holds the hoist passage. Hesta is here.

Hesta: “Give him space, a little food, or that quiet
hunter's look ... don't strike him ... ask me to patch you up.”

[Inspect Ash] [Speak to Hesta] [Choose a way]
Ash — guarding
  [Approach quietly — hunter skill] [Offer ration] [Attack]
Selected: offer ration · supplies 1 → 0 · 10m
                                 [Toss Ash a ration — 10m]
```

**Flow:** inspect hound → read approaches and known Hesta consequence → select ration/hunter/attack → commit. After calm approach/feed, authored calm state appears and passage becomes usable; attack changes to combat spread. Calm outcome must be taken from actual resolution, not guaranteed by decorative animation. Hesta's words stay in the scene history after moving elsewhere.

### Sentinel: dedicated combat spread

```text
VALVE CHAMBER — fight with the boiler sentinel
Abstract engagement · position and reach are not modeled
Turn: Sentinel → Bran [now] → Elen → Dori

Sentinel 20/20 · physical resistance 35% · poison immune
Company: Bran 11/12 | Elen 7/7 | Dori 11/12, mana 2/6

LAST EXCHANGE
Bronze sweep: Bran and Dori each take 1 damage.
Elen avoids the sweep.                            [Dice]

BRAN'S INTENTION
[Weapon attack] [Wounding blow] [Guard] [Other]
Wounding blow → Sentinel · 1d4 physical + weakened
Known resistance applies; weakens damage power by 1.
                                           [Use on sentinel]
```

**Flow:** inspect creature safely in scene → choose Attack explicitly → opening sweep appears → Bran chooses → causal exchanges append in reading order → retained aftermath → Party/recovery or scene. The illustration is minimized during combat; rosters and effects get the space. No tokens or illustrated foreground/background imply range.

**Strengths:** best continuity for rescue, dialogue and return; fewer permanent distractions; permits grounded authored prose. **Risks:** connections become harder to remember if maps are too remote; a long scrolling “book” can bury choices; artwork can promise objects/space the engine cannot support. Keep current scene, current intention and last exchange bounded, with an explicit map control. Do not let the book become an endless transcript.

**Cost:** medium UI change; low art cost for the experiment (placeholders), potentially high ongoing content/illustration maintenance if every state needs bespoke art. Narrative continuity depends on shared event/memory repairs, regardless of images.

## Concept 2 — Spatial expedition interface

**Primary unit:** a route through known places, obstacles and time. A site graph is the principal navigation surface; current place inspection and intentions open in a replaceable detail area. A “local” view is a feature/exit schematic or text inventory, not a measured floor plan. Expedition supplies/time and known pressures matter more than character stats outside combat.

### Pell: route and local situation

```text
CENSER HILL FOUNDRY — connections, not to scale       [Region]

Vestibule ── Workshop ── Stores
                │            ╲ discovered tram crawl
             Gallery ─────── Hoist [YOU / PELL]
             hound guards     ↑ hoist passage

Selected place: Hoist room                     [Local]
  Hoist drum; slack cable
  Fallen rack — pins Pell; no object coordinates known
  Exits: stores via crawl; gallery blocked by Ash

[Inspect rack] → [Lever / Dig / Heave]
Lever with carried bar · 10m                 [Commit lever]
Clock 11:40 · culvert closes about 1:40          [Notes/Party]
```

Annotations: the graph's strokes encode passage adjacency, not exact shape or orientation. Label the guarded edge clearly, even though Ash is on the other side. It needs a truthful threshold description/access rule before promising interaction from here. This wireframe is a partial graph; full diagram retains other discovered rooms and passage identities.

**Flow:** select current-node feature → inspect rack → choose/preview/commit → node's Pell marker changes to mobile → choose escort → plan return itinerary with closure/time → commit one visible travel leg at a time. A route planner may calculate a path; it must not automatically execute all legs through changing hazards without a separate travel commitment model.

### Ash: obstacle on an edge

```text
CASTING GALLERY [YOU] ── hoist passage ── HOIST ROOM
                       GUARDED: Ash

Gallery: moulds, broken roof; Hesta present
[Local features]   [Ash / passage]   [Hesta]

Ash: holds the passage; does not advance
Hesta warned that harming him costs her services.
[Hunter approach] [Ration] [Attack] [Use another route]
Selected: approach quietly · Woodcraft available · 10m
                                     [Approach Ash — 10m]
```

**Flow:** select guarded edge or Ash → same entity inspection → calm/feed/fight or inspect alternate graph route → commit. After calming, edge status changes and a short event remains in place detail. This concept makes bypass routes easier to discover without implying combat is necessary.

### Sentinel: abstract encounter within the selected node

```text
SITE: ... Gallery ── [VALVE CHAMBER / fight] ── Workshop
                                               steam at arch

Combat is confined to an abstract encounter at this place.
The graph is context; clicking an exit does not evade a turn.

Turn queue: Sentinel → Bran [now] → Elen → Dori
Sentinel 20 HP | resistance 35%      Company 11 / 7 / 11

Selected action: Wounding blow → Sentinel
Effect / cost / known resistance                [Use action]
Latest: Bronze sweep; Bran -1, Dori -1, Elen saves. [Details]
```

**Flow:** inspect sentinel → Attack → graph stays as small context, mechanics replace local inspection → resolve → graph resumes with observed aftermath. An exit during combat opens a disengagement explanation; current engine cannot move there as a combat action. No on-map token dragging or range circles.

**Strengths:** best route planning, culvert urgency, alternate approaches and return orientation; barriers have visible physical context. **Risks:** players may treat the graph as a battle map or click routes as free escape; map-first play can reduce NPCs to markers; objects within rooms still require authored descriptions. Unknown-node markers must not reveal hidden content.

**Cost:** medium/high because current graphs merge alternatives and infer traversed edges incorrectly; route knowledge/traversal projection must be repaired first. A true local floor plan would be a separate, expensive modeling project and is excluded. A graph with good labels is feasible within existing spatial semantics.

## Concept 3 — Focused digital tabletop

**Primary unit:** a clear situation with party capabilities and explicit rulings. Character and encounter cards are persistent when useful; a shared outcome tray shows the last resolved action. Scene/map is a compact location reference, not an illustrated narrative page or the primary navigation space. Mechanical detail is easy to inspect, but no debug facts or symbolic planner appear.

### Pell: a shared physical problem

```text
HOIST ROOM — Pell pinned beneath timber rack         [Site map]
Objective: free Pell; then get them home
Pell warns against hauling. Bar carried by Bran.

COMPANY / RELEVANT CAPABILITIES      SITUATION: TIMBER RACK
Elen · Woodcraft · rope             [Inspect] current: pinning
Bran · Lockwork · pry bar           [Lever with bar — 10m]
Dori · Mending · bandages           [Dig — 40m]
                                   [Heave — choose lifter]

PENDING: company levers rack · bar requirement satisfied
                                                     [Resolve]
OUTCOME TRAY: authored result; time and state changes
```

Annotations: “Resolve” should include the selected verb in the final control (for example “Resolve: lever rack”), not be a generic unknown command. Capability cards explain what supports an approach without inventing a bound individual actor. Avoid showing irrelevant combat stats during rescue.

**Flow:** select rack card → inspect → select method, required lifter only for heave → resolve intention → result tray persists → add escort situation. Supports direct comparison of time and capability costs; risks making an injured person look like a mechanical challenge card.

### Ash: approaches and relationships

```text
CASTING GALLERY                     HESTA / ASH
Ash guards hoist passage            Hesta offers healing, 2 coin
                                   Warning: won't serve if Ash harmed

APPROACH                       COST / BASIS             SELECT
Quiet hunter's approach        Woodcraft; 10m             [ ]
Offer ration                   1 of 1 rations; 10m        [ ]
Attack                         encounter; harm risk      [ ]

PENDING: approach Ash quietly                   [Commit approach]
Party details collapsed until needed; scene text stays available.
```

**Flow:** compare grounded options → select → commit → outcome tray + relationship/passage state. State-conditioned approach summaries must not expose unknown reaction triggers. Ash remains a character in the described scene, not a generic lock with three unlock methods.

### Sentinel: mechanics in focus

```text
VALVE CHAMBER / abstract encounter                  [Scene]
QUEUE: Sentinel → BRAN → Elen → Dori

BRAN 11/12       ELEN 7/7        DORI 11/12 · 2 mana
Condition detail available on each card
SENTINEL 20/20 · 35% physical resistance · poison immune

ACTION                         TARGET             EFFECT
Weapon attack                  Sentinel           physical
Wounding blow                  Sentinel           1d4 + weakened
Guard                          Bran               halve damage
Unavailable abilities show cooldown/reason under [All actions]

PENDING: Wounding blow → Sentinel               [Commit blow]
OUTCOME: action → actual damage → condition → enemy response
[Calculation: roll, power, resistance, armor, guard in order]
```

**Flow:** inspect actor/condition → select ability and target → commit → read outcome tray → next actor highlighted. During combat, actual remaining durations and cooldowns are visible. Victory changes tray to final condition/world consequences; character cards offer recovery. No spatial positioning is implied by card placement.

**Strengths:** best inspectable mechanics, party roles and action/cost comparison; straightforward abstract battle. **Risks:** strongest temptation to retain every card/table permanently; moves attention toward solving a rules board instead of inhabiting a place; faction/relationship state can spoil authored uncertainty if displayed as exact hidden meters.

**Cost:** medium after availability/event projection repairs; possibly lower renderer risk than a book layout, but greater restraint needed to avoid recreating the current engine-facing dashboard. Benefits depend on a sensible compact rules vocabulary, not exposing every engine property.

## Comparison and recommendation

Evaluations are informed hypotheses from the cold record, **not measured user-study scores**. Costs assume the common agency/event/memory repairs; no concept avoids those.

| Criterion | Adventure book | Spatial expedition | Digital tabletop |
|---|---|---|---|
| Situation clarity | Strong for people/events; needs concise exits. | Strong for paths/barriers; local people need explicit detail. | Strong for actionable state; weaker fictional emphasis. |
| Player agency | Strong with common grammar; art must not obscure verbs. | Strong for routing; risk of free-click movement expectations. | Strong for deliberate action/target choice; risk of exposing irrelevant choices. |
| Spatial comprehension | Adequate with accessible graph; weak if prose-only. | Strongest for site's actual topology and travel. No room geometry advantage from current data. | Adequate compact graph/reference; abstract cards do not solve physical layout. |
| Combat readability | Strong only with a dedicated mechanical spread. | Moderate: site context helps, graph cannot explain targeting. | Strongest for rules, current state and coordination. |
| Narrative continuity | Strongest; persistent scene events and replies. | Moderate; requires deliberate event/memory design. | Moderate; outcome tray and notes must carry continuity. |
| Cognitive load | Lowest ordinary-scene competition; scrolling risk. | Higher topology burden; best for routing decisions. | Higher rules burden; useful when rules determine a decision. |
| Implementation cost | Medium, with optional art/content cost. | Medium/high; route/traversal corrections needed. | Medium; event/availability projection needed. |
| Biggest failure mode | Attractive prose hides choices/rules. | False tactical map or NPC-as-marker experience. | A smaller workbench with fantasy labels. |

**Recommend book-led scenes, an explicit expedition map, and tabletop-level combat clarity.** Preserve the book's continuity, not permanent illustrated real estate. Use the map as a purposeful temporary view when planning a route; keep a named exit list in ordinary play. Use a focused battle spread with party/foe conditions, queue and causal exchange. Return to the scene through an aftermath, not an abrupt switch.

This is a small interface: Adventure, Party, Notes; Map opens from location/Notes. Within Adventure, conversation, object inspection, pending action, event result and combat have a shared place in the reading flow. The hybrid does **not** retain all three concepts' panels. There is one dominant view at a time, with persistent location/task and compact party condition.

The design choice to test first is **whether the book-led hierarchy preserves spatial planning well enough when the map is one explicit action away**. If it fails on culvert/upper-route choice despite accurate route information, promote a compact site graph during expedition scenes. Do not respond by permanently adding the region graph, tactical cards and history alongside it. If battle comprehension fails, improve action/effect grouping before adding artwork or spatial tokens.
