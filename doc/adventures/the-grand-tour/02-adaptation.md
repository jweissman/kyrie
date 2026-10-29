# The Grand Tour: what Kyr can say, and the plan

*Stage 3. The revised design ([01-editorial.md](01-editorial.md)) checked against the engine as it stands on 29 October
2026 (branch base `87f57dd`, Mission 18's Gate B begun). What was probed, what is said directly, what is worked around
inside the module, and the general extensions made.*

## What was read

The Kyr grammar (`src/lang/Kyr.ohm`), the authoring guide, the shared rules (`data/rules/core.kyr`, `belief.kyr`,
`passages.kyr`, `inhabitants.kyr`), the catalogs (ancestries, species, items, skills, crafts, religion), the
province mechanism of Gate B (`src/world/provinces.ts`, `gates.ts`, `region-gates.ts`, `frontier.ts`), how the
company's capabilities are computed (`src/campaign/creature-facts.ts`, `party-capabilities.ts`), and three adventures'
Kyr as models of a city with many small stories (*The Liberty of the Ice*, *The Banns at Hessel*, *A Parliament of
Books*), with their friction reports. A probe module was written and played in the scratchpad. It tested a capability
of the module's own, granted for a while, a way that needs it, an elsewhere region, and an action that moves the
company.

## What Kyr says directly

| Design need | Kyr |
|---|---|
| Three storeys, three planes | Areas within one region (`sennet`); the planes are regions `elsewhere`, joined by doors and by actions |
| Nine (now seven) days, and the time of day | `day(clock)`, `hour(clock)`; queries per day; chapters for the days |
| Breathing under the bay | `Entity breath: capability`; `granted(party, breath)` with `grantedUntil` (a kiss, three hours); ways down into the Whelm `needing breath`; a rule that drowns and lifts the company when it runs out |
| The brine-glass helm | An item of the module's own kind; a rule grants `breath` while it is held (see W1) |
| Novelty in the Hour Court | A measure `novelty` of each curiosity and of the reigning Monarch; `shown(item)`; `crowned(party)` with an hour's end |
| Patience in the Assembly | `words(motion)`, increased by an action that takes a day (`Time 144`) |
| Reputation in the Gallery | A measure `talk(party)`, raised by what the company does in Cloudgate and the planes; a secret said in the Gallery is `heardOf` by the sylphs, who `overhears`, and carried down |
| Gossip that reaches the murderer | `heardOf` / `passesTo` / `overhears` (belief.kyr): Tolley and Florian pass on what they hear to the Rector |
| Perrin's wrong belief, Rafe's guilt | `believes(perrin, rafe_pushed)`, `believes(rafe, own_guilt)` with conviction; let go by topics that are about people |
| The Ball | An `Occasion` with matters: the arrivals, the dancing, the Dowager's toast, supper |
| A witness who must be served first | Topics gated on what was done for them; the clue taught only then |
| Ambrose's fondness | A measure; topics and dances gated on it; `Promise` to bring him home |
| Ambrose and Chert joining | `willing` and the standard recruitment; `Joins`, `Leaves`; topics `travelling` |
| Taking the petal from the keel | A `Grave` change; Cloudgate's descent as rules over the next hour |
| The Rector's left-alone campaign | Rules on the clock, each guarded by whether she can still act: rivals' petals on days 2 and 4, the raid on the sixth morning, the keel on the seventh night |
| The Door of Doors to anywhere visited | `Action open_on(actor, site, dest: place)` over `been(actor, dest)` and `settled(dest)` and outdoors: every town square and street the company has stood in, in any module |
| Coming back to the Nexus | The Doorward's key: from any indoor room, knock and step through |
| Endings that close the book or, in a world, the chapter | `Ending`, first whose condition holds, in order of particularity |

## Worked around inside the module

**W1. An item cannot grant a capability its own module declares.** `Kind brine_helm … granting breath` is refused:
"which is no skill". `granting` reaches only the shared catalog's skills, and the precedent for an adventure's own (the
Wardens' oath, the singers' knell) was to add it to `core.kyr`, which is the narrow special case the brief warns
against. The module grants `breath` by a rule while a helm is held, and retracts it when it is not, using
`grantedUntil == 0` to tell the helm's grant from a kiss's. This is recorded in the friction report as a general
extension worth making (`granting` a capability declared by the same module, prefixed with it).

**W2. A way under the water must not trap a company whose breath runs out.** `needing` applies both ways, so the
company could not come up again. The way down is one way and needs breath; the way up is one way and needs nothing.
A rule lifts a drowning company to the Fish Stairs and hurts it.

**W3. Who saw what, at the balustrade, is said by people, not by things.** The clues are topics behind services, so
there is no exhibit to show; inference joins them with a rule that `teaches`.

## The general extensions made

**X1. A province's notice.** Marches can nail a notice in every town of the first country (`notice` in
`countries.json`, `RegionBorders.notice`); provinces could not. The Grand Tour's proclamation is that notice: what
draws an ordinary protagonist to Sennet through the world's own fiction, before any innkeeper is asked. `RegionGates`
now writes a province's notice as `RegionBorders` writes a march's: read where travellers are kept in every town,
talked of, and known as heard, with the way in put on the map. Its `after` (talk when the news is stale, the keeper
told) follows as it does for a march. Nothing about any one adventure is in the code.

**X2. A province held beside some terrains only** *(considered, not made).* Every province is in every world, as the
Strewnfield is. A port in three storeys fits any country with a coast road. The choice of sides is the adventure's
(`side: east`, on fen or meadow), and no terrain filter is needed.

## Placement

A **province of the first country** (Gate B), not a country beyond a march: Sennet is that country's sea-city, its
way in a few cells in from the east, on low ground (`covers: fen, meadow, heath`), with a road from the nearest town.
Every town's innkeeper tells of it, and every town has the Rector's proclamation nailed up (X1). The first time the
company stands at the way in, the module is installed within the country, and the road on comes down the coast road
to the Landward Gate. Its own region is drawn at its way in, on the country's map. Standalone, for tests and the
terminal, `data/campaigns/the-grand-tour.campaign.json` builds its region alone. It is not on the title page's list:
it belongs to the world.

## The files

| File | What |
|---|---|
| `clock.kyr` | Days, hours, chapters, where word reaches the company |
| `city.kyr` | Every place and way: Sennet, Cloudgate, the Whelm, the planes |
| `harbour.kyr` | The Fish Stairs: Old Bethan and the bell; Twopence and the third step; the Harbourmaster |
| `lamp.kyr` | Lamp Street: Nance and the petals; the outfitter |
| `murrey.kyr` | Oswin Murrey, the Handbook, the companion, the fondness, the seventh edition |
| `handbook.kyr` | What the sixth edition says, and the seventh |
| `ascent.kyr` | Mother Gannet, the capstans, the basket, the laundry, the chain |
| `collegium.kyr` | The House of Doors: the Rector, Tolley, Dr. Rook and the ember, Thursday, the doors, the Tour, the Nexus |
| `cloudgate.kyr` | The Halyards, Pollard, the coffin, Rafe, the keel |
| `ball.kyr` | The Ascension Ball |
| `whelm.kyr` | The merfolk: No Admittance, Mercy, Twopence below; breath; the table; Perrin in the air-bell |
| `undertow.kyr` | The Aenean Undercroft and the tide-engine |
| `fire.kyr`, `earth.kyr`, `air.kyr` | The Hour Court, the Slow Assembly, the Gallery of Winds |
| `rivals.kyr` | Florian Mottram and Miss Sone |
| `rector.kyr` | What the Rector does if nobody stops her |
| `fall.kyr` | The mystery: clues, inference, the accusation |
| `door.kyr` | The Rose, the Door of Doors, the keel's petal and Cloudgate's descent |
| `endings.kyr`, `aftermath.kyr` | The settlements, and the city after, in a world that goes on |
| `company.kyr`, `placed.kyr` | Standalone and in a world |

## Scale

About 60 rooms, 40 people, 7 days. Previous works of this size run 2,700 to 3,000 lines of Kyr, and this one will be
larger. Tests: one per principal approach, one per settlement, a build matrix of six protagonists, exploratory
offered-action play, kept-and-resumed, determinism, and an ordinary journey from a generated world's first town.
