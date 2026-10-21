# The canonical vocabulary of a Kyr world

This document defines the small set of concepts every Kyr world is built from, who owns each piece of mutable
state, and how Kyr, DEEM, Orsino, situations, campaigns and clients divide the work. The audit that motivated it
and its staged migration plan were carried out and removed (see [legacy-material.md](../archive/legacy-material.md));
the author-facing guide is [doc/authoring/guide.md](../authoring/guide.md).

## Design rule

**A few strongly defined concepts, composed.** A construct earns its place if it removes bookkeeping that every
author would otherwise repeat, and if it lowers into ordinary facts, rules and actions that the runtime already
executes deterministically. Low-level relations remain available for anything the constructs do not cover.

## Primitive concepts

| Concept | Meaning | Authored as | Lowers to |
|---|---|---|---|
| **Entity** | Anything with persistent identity: an id, a kind, a name, and provenance (who set each field) | `Entity id: kind "name".` | entity record |
| **Place** | A location in one containment tree: plane › region › settlement/wilderness › site › building › level › room | `Place id "name" is kind within parent at x, y.` | entity with `space`; `indoors`/`settled` facts |
| **Passage** | A physical connection with one or two ends, a kind, a duration, and optionally a hidden state or a requirement | `Passage id "name" is road between a and b taking 2 hours.` | entity; `connects` (both ways unless `one way`); `passageKind`; `travelTime` |
| **Thing** | A physical object standing at a place or on a passage, in exactly one state at a time | `Thing id "name" at place { State …. Change …. Hurts …. }` | entity; `at`/`on`; `state`; transitions; anchored descriptions |
| **Item** | A portable thing of a catalog kind, with one instance name | `Item id "name" is kind at place.` | entity; `itemKind`; `at` |
| **Person** | Someone with an identity, a body, a location, overlays, states, goals and knowledge | `Person id "Name" at place { Ancestry. Calling. Profession. Background. Plans. … }` | group actor + generated creature; overlays |
| **Company** | The player's party: an actor whose members are chosen at character creation | `Company party "Your company" of 3 at quay.` (members from creation, else the campaign's default `party`) | player actor, member creatures, meals |
| **Fact** | Something that can be known | `Discovery id "text" { Source … }` | `knows`, sources |
| **Event** | Something that happens once and is perceived where it happens | `Event id near X when P "text" then { … }.` | latched rule with an anchored message |
| **Offer** | A service or goods someone provides at a price | inside a Person: `Offers lodging "a bed and supper" for 3 coin.`, `Sells rations for 2 coin from 6.`; or implied by a profession | `offers`, `serviceOf`, `fee`; `sells`, `goodsPrice` and stock quantities; item instances for sale |
| **Quantity** | Counted goods: coin, rations | `Initially Set quantity(x, rations) to 3.` | measure |
| **Time** | One clock; one tick is ten minutes | — | `watch(clock)` |

Mechanical primitives come from catalogs: **ancestry**, **class**, **ability**, **condition (body status)**,
**item kind**, **overlay** (profession and background), **skill**.

## Derived concepts

These are queries, never stored: `passable(way, who)`, `obstructed(way)`, `hazardous(way)`, `visibleTo(way, who)`,
`together(a, b)`, `holding(who, kind)`, `meets(who, need)`, `mobile(who)`, `reaches(who, thing)`. The
party-level skill `capable(company, skill)` is a declared projection of members' overlays, class and equipment.

## Extensions

Rulesets that give primitives behavior. Each lives in one place under `data/rulesets/world/`:

| Ruleset | Adds |
|---|---|
| `core` | bodies, location, violence against those who are not peaceable, waiting |
| `passages` | traversal (`go`, `risk`), obstacles and hazards, changing a thing's state |
| `people` | leading, parting, following |
| `needs` | daily meals from carried rations, hunger |
| `services` | lodging, meals, buying goods, camping |
| `belongings`, `care` | items, equipment, field healing, lessons (forked from the legacy rules with plain narration) |
| `discovery` (shared) | reading, asking, telling |

## Authority

| Mutable property | Single authority | Projection (read-only facts) |
|---|---|---|
| Where anything is | World `at` | — |
| Body (hp, mana, conditions, level, experience) | `CreatureStore` | `able`, `dead`, `awake`, `needsCare`, `canCast`, `treatable` |
| Items held by a creature | `CreatureStore` inventory | `ownedItem`, `wearing` |
| Items lying somewhere | World `at` | — |
| Coin | Creature purses | `quantity(actor, gold)` (deltas written back by `CreatureFacts.commitMoney`) |
| Other goods (rations, stock) | World `quantity` | — |
| Identity (name, ancestry, class, overlays) | The creature, frozen at creation from authored > generated > default | entity name |
| Skills | Derived from class, overlays and equipped items | `capable(company, skill)` |
| A thing's or person's situation (pinned, guarding, open) | World `state` | descriptions |
| Knowledge | World `knows` | — |
| Time | `Campaign.elapsed` | `watch(clock)` |

Two invariants follow. A description can never disagree with the state it describes, because descriptions are
owned by the state. A passage cannot be dangerous in only one direction by accident, because danger belongs to the
thing on the passage, not to a directed edge.

## Responsibilities

| Layer | Owns | Must not |
|---|---|---|
| **Kyr** (language and runtime) | Meaning: entities, containment, passages, states, actions, events, time, saves | Contain campaign vocabulary in shared rulesets |
| **DEEM** | Variation: names, distributions, regional character, generated values for fields an author left open | Define what a person or place is; override authored fields; emit fields the runtime cannot interpret |
| **Orsino** | Reusable fantasy rules and content: ancestries, classes, abilities, gear, backgrounds, skills, shop types | Be copied wholesale without an adaptation record |
| **Situations** | A reusable conflict expressed over roles: who, where, what can happen, what follows | Name a particular place or person |
| **Campaigns / sites** | Particular places, people, histories and situation installations | Redefine canonical relations |
| **Clients** | Presenting observable state and offered actions | Decide legality or invent state |

## How authored, generated and default values combine

For every field of a person or entity:

1. **Authored** values win. If an author writes `Ancestry human`, it holds.
2. **Generated** values fill fields the author left open. A generator contributes to declared fields only:
   `name`, `raceId`, `classId`, `level` and `backgroundId` for people, and `name` for entities. Anything else is
   an error.
3. **Defaults** fill whatever remains.

Each field records its provenance (`authored`, `generated`, `default`). A generated value that conflicts with an
authored one is discarded and reported by `kyrie lint`; it never silently wins.

## Overlays

A character is a composition: ancestry + class + overlays. Each overlay (a profession or a background, adapted from
an Orsino `backgroundModifier` entry) contributes typed effects, each tagged with its source:

| Effect | Runtime meaning |
|---|---|
| `attributes` | Added to the creature's generated scores (Orsino's stat modifiers) |
| `gold` | Added to the creature's purse |
| `gear` | Item instances of catalog kinds placed in the creature's inventory |
| `skills` | Skills the creature provides to its company (`capable`) |
| `offers` | For a person: services or goods offered, with fees |
| `routine` | For a person: a default goal, such as staying at their workplace |

**Conflicts are errors** ([overlays.ts](../../src/overlays.ts) `validate`): an overlay used in the wrong role (a
profession given as a background), an unknown profession, a `requiredClass` the character lacks, or gear whose kind
is missing from the item catalog. A character has at most one background and one profession by construction. An
authored offer of the same kind as a profession's offer replaces it rather than duplicating it.

## Example: one town, before and after

Before (Serewater, abridged):

```kyr
Entity inn: place "Reedwake · The Returning Oar".
Initially Assert district(inn, reedwake).
Initially Assert route(quay, inn). Initially Assert route(inn, quay).
Initially Assert restful(inn). Initially Assert restful(quay).
Person nera "Nera" at outfitter { Role "outfitter". Race human. Class commoner. Level 2. Uses travel. }
Initially Assert offers(nera, rations).
Entity medicine_1: item "Nera’s first antidote".
Initially Assert itemKind(medicine_1, antidote). Initially Assert at(medicine_1, outfitter).
Initially Assert soldBy(medicine_1, nera). Initially Assert forSale(medicine_1). Initially Set price(medicine_1) to 3.
Observe scene_inn at inn when true "… A shared ration buys six hours on the upstairs pallets, with full recovery …".
```

After ([data/regions/serewater-march/region.kyr](../../data/regions/serewater-march/region.kyr)):

```kyr
Place oar "The Returning Oar" is building within reedwake_town.
Place taproom "the Oar's taproom" is room within oar at 1, 0.
Passage oar_door "the Oar's door" is door between taproom and quay.
Passage causeway_path "the causeway path" is path between quay and causeway taking 1 hour.
Person maud "Maud" at taproom {
  Role "innkeeper". Profession innkeeper. Peaceable.
  Sells rations for 2 coin from 4.
}
Person nera "Nera" at shop_floor {
  Role "herbalist". Profession herbalist. Peaceable.
  Sells rations for 2 coin from 6.
  Sells healingdraught for 3 coin from 1.
}
```

Maud offers lodging because the `innkeeper` overlay contributes a lodging offer (3 coin) and the routine "keeping the
inn". The draught on Nera's shelf is an item instance named after its catalog kind; it keeps that name in the shop
list, in the purchase message and in the pack.

Being an innkeeper means keeping the inn and offering lodging. Lodging means a night's sleep, supper, and
recovery, because the `services` and `needs` rules give those words their meaning, not because a flag says the
place is restful.
