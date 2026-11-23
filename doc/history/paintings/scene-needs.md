# Scenes still needed (21 November)

> **History.** Superseded by [doc/design/paintings-needed.md](../../design/paintings-needed.md), the one current list.

The one current list of the scene paintings, the backgrounds, that the game still lacks. It supersedes the scene
parts of [art-wishlist.md](art-wishlist.md) and [place-commissions.md](place-commissions.md), which stay as the record
of how the list was first made. Portraits (people, creatures, creation's grid) are not here; they remain in
art-wishlist.md.

**How it is measured.** `bun scripts/scene-census.ts <world>` puts the company at every place of a generated world in
turn, builds the screen as play builds it, and asks for the scene's painting (Scenery.seen) under four skies: a fair
day, rain by day, a fair evening and a fair night. A place is *blank* in a sky when no painting fits it there, and the
page draws a dim ground. Run it again after each batch; the counts below are from 21 November, after the owner's 61
paintings of that day.

**Where things stood on 21 November.** Iscoed: 83 of 756 places blank in some sky. a1: 124 of 877. Nearly every blank is in two of
the four skies, so what is wanted is mostly the same subject under another light, not new subjects.

## The asks, checked against what was delivered (22 November)

Each ask of the 21 November list, the paintings that answered it, and what the census (`bun scripts/scene-census.ts`,
Iscoed and a1 together) still finds blank. **Iscoed: 60 of 756 places blank in some sky; a1: 95 of 877** (from 83 and
124). A row is *filled* when its kind has a painting in every sky the ask named.

| Ask | Delivered | Status | Still blank (both worlds) |
|---|---|---|---|
| A plain room by lamp | `scene-hearth` | **filled** | none |
| A keep's chamber and gate-passage by firelight | `scene-chamber`, `scene-keep-gate` (both by day) | **open** at evening and night | 21 keep rooms |
| A bailey at night | none | **open** | 10 baileys at evening and night |
| The manor at night and its garden at dusk | `scene-manor-night` (the house and forecourt) | **partly**: the library, loggia, walled garden and muniment room at evening, and in rain | 8 |
| A byre by lantern | none (the byre painted shows rain at its door) | **open** | 8 stables at evening and night |
| A counting-room by lamp | `scene-accountancy-night` (and `scene-accountancy` by day) | **filled** | none |
| Back lanes at evening | none | **open** | 9 lanes at evening and night |
| A chandlery at evening | none | **open** | 4 |
| A kitchen by firelight | `scene-kitchen-evening` | **filled** | none |
| A store at evening | `scene-store-evening`, `scene-store-night` | **filled** | none |
| A mill at dusk | `scene-watermill-dawn`, `-dusk`, `-night` (the mill outside) | **partly**: the mill as a room (its floor) at evening | 2 |
| A drill-yard at dusk | `scene-town-drillyard`, `-dusk`, `-night` | **filled** | none |
| A long barrow by grey day | `scene-hill-door` on the barrows' ground | **partly**: by day yes; in rain no | 18 barrows in rain |
| A dam by day | `scene-dam`, `scene-dam-night` | **partly**: in rain no | 9 |
| A great house by day (the Numbered House, a chapter-house, a moot-house) | none | **open** | 11 by day |
| A fairground by day | `scene-fairground`, `-night`; the menagerie tent | **partly**: in rain no | 8 |
| Sea-cliffs by day | `scene-sea-cliffs`, `scene-seacoast`, `-dusk` | **partly**: in rain no | 3 |
| A sluice by day | `scene-sluice`, `scene-sluice-night` | **partly**: "the broken sluice" refuses a whole one (the ruin rule) | 2 by day |
| The boat-sheds by day | none | **open** | 2 by day |
| The gate-yard on a fair day | `scene-courtyard` | **filled** | none |
| The old stones in mist; the dome at evening | none | **open** | 6 in rain, evening and night |
| A granary by lantern | none | **open** | 5 |
| The great oak in rain and at dusk | `scene-great-oak`, `-dusk`, `-night` | **partly**: in rain no | 4 |
| Charcoal clamps in drizzle | none | **open** | 4 |
| A well in rain | none | **open** | 2 |
| A cave, dim | `scene-cave-mouth-interior` (a room) | **partly**: a cave seen as ground (a hollow, a far end of a hall) in rain and dark | 3 |
| The menagerie tent | `scene-fairground-menagerie`, `-evening` | **filled** | none |

**Beyond the asks**, also placed: a hoard and a treasury (strongrooms), a mountain valley in each season and by moon, a
snowbound village (a frost country's winter), and the door in the hill as its own kind.

**What would close most of what is left**, in order of places filled: the same subjects **in rain** (barrows, dam,
fair, oak, coast, cave, granary, charcoal: about 50 places); **a keep's rooms after dark** (21); **a great house by
day** (11); **a bailey at night** (10); **back lanes at evening** (9); **a byre by lantern** (8); **the manor's rooms at
evening** (8). Then single places: a wright's yard, a lime-kiln, an inn's garden, a fulling-mill, a preserve-house, a
ship's great cabin, kennels, a stalled lift.

## How to paint and bind

- Paint to the name given. Record it in `data/paintings/seen.json` by looking at it: what it shows, and its light
  (dawn, daylight, sunlit, overcast, dusk, night, lamplit, dim) and weather (clear, rain, fog, storm, snow). Add its
  season only if it shows one; a painting of a season is shown only in that season.
- Put it on its kind in `data/paintings/scenery.json` (a kind's `ground` for outdoors, `room` for indoors). The fit
  rules (`data/paintings/fit.json`) then choose it by sky with no code.
- For rooms, the light inside is the light painted: a room by day is refused at evening and night, and a room showing
  rain through its door is refused on a fair day. A room for every sky is best painted lamplit or dim, with no weather.
- Wide, no figure in the foreground who could be taken for someone met, and seen as the place is.

## 1. Rooms and yards after dark (the largest group)

Blank at evening and at night only. Each wants one painting **lamplit or firelit, no weather showing**.

| Paint as | For | Blank places (Iscoed + a1) | Brief |
|---|---|---|---|
| `scene-room-lamplit` | a room with no kind of its own (bedrooms, floors, tiers, a dwelling) | 11 + 15 | A plain room at night by one lamp: a bed or a settle, shutters closed, a hearth low. |
| `scene-keep-chamber-firelit`, `scene-keep-passage-torchlit` | a keep's rooms: the lord's chamber, the gate-passage, the store-pit, under the hall, the gatehouse, the keep's top | 8 + 13 | A lord's chamber by firelight; a gate-passage by torchlight, the gate shut. |
| `scene-bailey-night` | a bailey or ward | 4 + 6 | A castle bailey at night: a watch-fire, the gate lit, the keep a shape. |
| `scene-manor-night`, `scene-manor-garden-dusk` | a manor and its parts: the Hall, its forecourt, library, loggia, muniment room, walled garden | 6 + 6 | The manor at night, a few windows lit; its walled garden at dusk. (The study and the store serve these rooms only in rain or dim; a lamplit library would serve every evening.) |
| `scene-byre-lamplit` | a byre or stable | 4 + 4 | The byre on a fair night: cattle in their stalls, a lantern on a beam, the door shut. (The byre painted has rain through its door, so it is refused on fair days.) |
| `scene-counting-room-lamp` | a counting-room, office, chancery, customs-house | 4 + 3 | A counting-room after hours by one lamp: ledgers, a strongbox, shutters closed. |
| `scene-lanes-lamplit` | the back lanes behind a town | 3 + 6 | Back lanes at evening, a few windows lit, a lantern at a corner. |
| `scene-chandlery-evening` | a chandlery | 2 + 2 | A chandlery at evening, candles lit in the window. |
| `scene-kitchen-firelit` | the Hall kitchen, a kitchen | 1 + 2 | A great kitchen by its fire at night, pots on the hearth. |
| `scene-store-evening` | a general store, larder | 1 | A village store at evening, a lamp on the counter. |
| `scene-mill-evening` | a mill | 0 + 2 | A water-mill at dusk, the wheel still, a light in the miller's window. |
| `scene-drill-yard-dusk` | a drill-yard | 1 + 1 | The drill-yard at dusk, the practice post and rack, a torch at the gate. |

## 2. Places blank by day

Blank on a fair day and in rain by day; the paintings they have are of evening or night.

| Paint as | For | Blank places | Brief |
|---|---|---|---|
| `scene-long-barrow` | a barrow (long mounds, grassed mounds, the king-howe) | 9 + 9 | A grassed long mound with a stone door by grey day; and the same in rain. |
| `scene-dam-day` | a dam and its mere: the dam's top and crest, the mere, a dam of dressed stone | 5 + 4 | A dressed-stone dam across a valley by day, water spilling, the mere behind. (The drowned village serves at night.) |
| `scene-house-day` | a named great house: the Numbered House, the upper House, a chapter-house, a moot-house | 3 + 8 | A tall old house of many windows by day, its door up a flight of steps. |
| `scene-fairground-day` | a fair: a showground, a circus's backyard, a long court | 0 + 8 | A fairground by day: tents and booths, pennants, a trodden field. |
| `scene-coast-day` | a coast: the nesting cliffs, their foot, the clifftops | 0 + 3 | Sea-cliffs by day, birds on the ledges, surf below. (The coast's paintings are both at sunset.) |
| `scene-sluice-day` | a sluice: the broken sluice, the sluice gallery | 2 | A stone sluice by day in fair weather, the gate half-open. (The sluice painted is in a storm.) |
| `scene-boat-sheds-day` | the boat-sheds | 1 | The boat-sheds by day; the one painted is at sunset. |
| `scene-gate-yard-day` | the gate-yard of Gatesend | 1 | The gate-yard on a fair day: the well, the herb-seller's door, nets drying. |

## 3. Rain, mist and the rest

| Paint as | For | Blank places | Brief |
|---|---|---|---|
| `scene-stones-mist`, `scene-dome-evening` | the old stones: the hill-path, the dome, the old tree | 3 + 3 | The hill-path to the stones in mist; the dome at evening. |
| `scene-granary-lantern` | a granary, the old corn-store | 2 + 3 | A granary by lantern, sacks and a ladder to the loft; serves rain and dark. |
| `scene-great-oak-rain` | the great oak | 1 + 3 | The great oak in rain, and at dusk. |
| `scene-charcoal-drizzle` | charcoal-burners' clearings and clamps | 2 + 2 | Charcoal clamps smoking in drizzle; the clearing at dusk. |
| `scene-well-rain` | a well (the makers' well; the gate-well) | 2 | A covered well in rain, a bucket on the lip. |
| `scene-cave-dim` | a cave or hollow, the far end of a hall | 1 + 2 | A cave mouth from within, dim, a trickle of water. |
| `scene-menagerie-tent` | the menagerie tent | 0 + 4 | Inside a menagerie tent by lamplight: cages, straw, a big cat's eyes. |

## Not paintings: bindings to fix

These are blank, or wrongly painted, because of how a place is named or ruled, not for want of a painting.

- **"A square doorway in a hillside"** is read as a market (by the word *square*). It wants its own kind (a doorway,
  a door in a hill) or the market rule refined.
- **"The drowned street"** reads as a lane (*street*), so the drowned village never reaches it at night.
- **Holgar's salt-house** is an interior but is shown the salt-pans outside it.
- **A group of a painted kind** (the cellar's rats, the crypt's bats) reaches no plate.
- **Rooms judged by the weather outside:** a room painted with rain at its door is refused on a fair day. Whether a
  room's painting should answer the weather at all is a rule to decide; until then, paint rooms without weather.

## What is not counted

- Only Iscoed and a1 were walked. Other countries draw the same kinds, but their counts are not here.
- Seasons are not walked (all four skies are in the default season); a kind whose only paintings are of one season is
  blank in the other three, which this census does not show.
- The census asks for the scene the place itself would show; the opening, creation and the map's own paintings are
  not part of it.
