# The play model: space, time and the expedition loop

19 October 2026. How the canonical vocabulary ([ontology.md](ontology.md)) turns into play: where things are, how
long things take, what the company needs, and what the people around it do. Each section separates what runs now
from what is designed but not built.

## Space

### Containment and traversal are separate

**Containment** answers "what is this inside?" Every place has one parent, from `region` down to `room`
([spatial.ts](../../src/spatial.ts) validates the chain). Rules read containment through two derived facts:
`indoors(place)` (under a building or level) and `settled(place)` (under a settlement).

**Traversal** answers "how do I get from here to there?" Only passages connect places. A passage has two ends, a kind
and a duration, and the same passage is used in both directions unless it is declared `one way`. Containment never
implies a connection: two rooms in one building are not connected unless a passage says so. A connection never
implies containment: a road between two settlements belongs to neither.

The old models merged the two. A `district` fact repeated containment, and `route(a, b)` facts were directed
permissions, so an obstacle could exist in one direction only. In the canonical model obstacles and hazards are
things *on* a passage. They are therefore the same from both sides.

### Passage kinds, distance and scale

| Scale | Typical passage kinds | Typical duration | Map |
|---|---|---|---|
| Room to room | `door`, `doorway`, `arch`, `passage`, `stair`, `steps`, `ladder`, `shaft`, `crawl` | 10 minutes (one tick) | site chart |
| Across a site or settlement | `gate`, `tunnel`, `culvert`, `drift`, `incline`, `bridge` | 10–30 minutes | site chart |
| Between areas | `path`, `track`, `road`, `causeway`, `ford`, `ferry` | 30 minutes to days | region chart |

Time is measured in ticks of ten minutes. A passage's duration (`taking 1 hour`) lowers to `travelTime(passage)`, and
the `go` action takes that long ([action-time.ts](../../src/campaign/action-time.ts)). The same rule applies to
people: an NPC on an hour-long road arrives an hour later and is somewhere on the way in between, not teleported
([campaign-tick.ts](../../src/campaign/campaign-tick.ts) pending actions).

Lint checks that kinds agree with their ends. A `stair`, `ladder`, `shaft` or `incline` must change level, and a
`road`, `path`, `track` or `ford` must not end indoors.

### Known and hidden geography

What the company knows is part of the world. A passage is drawn once one of its ends has been visited. A passage
`hidden until` a fact is invisible and unusable until the company knows the fact. The wayfinding skill (the
explorer background) adds every regional passage (path, track, road, causeway, ford, ferry) to the map before it has
been walked. On the map, rooms never visited are drawn dashed with a "?", and passages never walked are drawn
dashed.

### Maps at two scales

[ChartModel](../../src/ui/chart-model.ts) builds both maps from the same facts:

- **Site chart:** the rooms of the area the company is in, placed on the author's grid, with passages coloured by
  what stands in them (open, shut, guarded, dangerous). A passage leading out of the area ends in a "→ beyond" stub
  named for the next area. Areas inside it (buildings and levels) are drawn as labelled outlines.
- **Region chart:** areas as nodes at their region grid positions, joined by the passages between them and labelled
  with travel time ("1h", "30m").

Scales are never mixed in one drawing. On a phone the site chart is cropped around the company, and the region strip
is hidden.

### Designed, not built: procedural geography

Generation may later produce regions, but only in the same vocabulary an author writes. The pipeline:

1. **Region skeleton.** DEEM chooses a region type and a handful of areas (settlements, wilderness, sites) with
   region grid positions. The output is `Place … is settlement|wilderness|site within region at x, y`.
2. **Connections.** A spanning tree of regional passages plus one or two loops, with kinds chosen by terrain (ford
   where a river crosses, track on hills) and durations from grid distance and terrain cost. The output is
   `Passage … is track between … taking …`.
3. **Area interiors** from authored or generated *site templates*, such as "a village of 4–6 buildings around a
   green" or "a two-level ruin with a hidden way down". Each template is ordinary Kyr with roles, installed like a
   situation.
4. **Population.** People with professions from the area's economy. Overlays provide offers and routines, so a
   generated innkeeper works like an authored one.
5. **Situations** installed by matching their roles against the exports of generated areas.
6. **Lint as the gate.** A generated region is accepted only if `kyrie lint` reports no findings. Authored places
   always win over generated ones under the same precedence rule as people.

Nothing in steps 1–5 needs a new runtime concept. Generation fills fields that authors would otherwise write.

## Time scales

| Scale | Unit | What happens at this scale |
|---|---|---|
| Combat | turns, inside one command | One attack command resolves a whole battle. Unchanged in this program |
| Action | 1 tick = 10 minutes | Opening a door, crossing a room, picking a lock, asking someone something |
| Activity | several ticks | Digging someone out (40 min), healing at a shrine (1 h), walking a path (30 min–1 h) |
| Rest | 48 ticks = 8 hours | A night at an inn or in camp |
| Day | 144 ticks | Meals: the company eats each evening at 8 p.m. (first at tick 72) |
| Expedition | days | Several sites, several nights, provisions, travel between areas |

Every scale uses one clock, `Campaign.elapsed`, and every action declares its own duration: fixed (`Time 4`) or
computed (`Time travelTime(way)`). Situations set deadlines on the same clock: the closing culvert is a thing whose
state changes at a time.

## The expedition loop

```
   town ── prepare ──► travel ──► site ──► act under time pressure ──► return
    ▲    (buy, rest,    (time,     (obstacles, people,                  │
    │     learn)        food)       hazards, knowledge)                 │
    └──────────── coin, wounds, rations, people brought home ◄──────────┘
```

### Food

`needs.kyr`: a company that `eats` consumes one ration at each `nextMeal`, then the next meal is due a day later. With
no ration it becomes `hungry`. A hungry company cannot camp; a meal or a night's lodging (which includes supper) ends
the hunger. Food creates a reason to plan a return, and makes rations worth carrying and buying. Starvation damage
is not modelled: hunger closes options rather than draining health.

### Rest

| Where | Action | Cost | Effect |
|---|---|---|---|
| An inn | `take_lodging` from someone who offers lodging | the host's fee in coin | 8 hours; supper; full recovery |
| A shrine or healer | `take_healing` | the healer's fee | 1 hour; every wound dressed |
| Open country (not indoors, not in a settlement) | `camp` | must not be hungry | 8 hours; rough recovery (1d6 + 2 health, 2 mana, bleeding stopped) |

The old `restful(place)` flag, and the rest that healed 9999 points, are not used in recommended worlds.

### Economy and services

Coin is held in members' purses and projected as `quantity(company, gold)`. Every price is a measure: `fee(service)`,
`goodsPrice(seller, good)`, or `price(item)`. Every purchase moves coin from buyer to seller, so money is conserved
and the record tests check it. Goods (rations) are counted stock that runs out. Item kinds are individual items on a
shelf with one name throughout. Services come from people, never from places. A profession implies its usual offer,
and an author can add or replace offers on any person.

### Progression

Old-school, after Orsino. Experience comes from defeated creatures (`encounterXp`, or the creature's kind and level)
and from resolving a module (its manifest's `experience`, awarded only when the company resolves it, not when someone
else does). A level is taken at the next sheltered rest once its threshold is reached (1,000 for level 2, 3,000 for
level 3): the class hit die plus Constitution, the caster's slot table, and the level's advances: a point to raise
any quality, and for a specialist caster a spell of its tradition to learn (`raise_quality`, `learn_spell`). Spells
are prepared in slots and recovered by rest (`prepare_spell` takes an hour). Overlays remain the source of
difference at creation: attributes, coin, gear and skills from Orsino backgrounds. The older `train` lesson, bought
with experience, is still in the rules but no content offers it.

### NPC agency

People act on pursuits, which are labelled goals with a priority and a target condition, planned with the same actions
the company uses. A profession adds a low-priority routine: the innkeeper's is "keeping the inn", which means returning
to the taproom if she is elsewhere. A situation adds higher-priority pursuits; Caught Below's guest stays close while
led, goes home when left, and refuses a guarded passage. Multi-tick actions keep NPCs in step with the clock.

Not yet: daily schedules (an innkeeper who sleeps), reactions to witnessed events, memory of the company, or NPCs who
trade with each other.

## What the player sees of all this

The Mono client shows the expedition's state on every screen: the time of day and daylight, coin, rations, and when
the next meal is due ("eat by 8:00 p.m."), with hunger shown in the warning colour. Offers appear with their price
("Take a bed and supper — 3 coin"), and every choice shows how long it takes. The company sheet lists each companion's
background, with what it grants and its Orsino source.
