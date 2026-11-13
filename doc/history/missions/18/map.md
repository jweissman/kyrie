# Mission 18: the map, and exploring the open country

The owner's correction of 2026-10-29: the interim map (37970a0, a painted land on square cells within the stage) was
not a hex crawl; the map was to be reconsidered from first principles, allowed the whole screen, with three treatments
prototyped and compared and one chosen by how it looks and plays; and wilderness exploration was to become one of the
game's central pleasures. The map is not accepted until the owner has reviewed it as a visual and interactive
experience.

## Three treatments, compared

Each was drawn from the same generated country (kite's Acornweald, a few days' wandering known, the ring of country
just beyond it glimpsed), at the whole of a 1440 by 900 screen, with the same places, rivers and roads, the same marks
for where you are and where you are bound, and a chosen place's card at the foot.

| | A: an illustrated hex crawl | B: a restrained isometric hex terrain | C: a hybrid, painted land under a hex grid |
|---|---|---|---|
| | ![A](map/a-illustrated.png) | ![B](map/b-isometric.png) | ![C](map/c-hybrid.png) |
| The land | each hex its land at a glance: trees, fells, a peak, reeds, water | tiles raised by their land; at this scale the height reads as a shadow | soft and continuous; the hexes, which are what is walked, disappear |
| Rivers, roads | features over the hexes, legible | the same, but the view is squashed into a band | legible, but on a ground with no grain |
| The unknown | a dotted ring of glimpsed hexes, then dark | the same | the painting fading out |
| Room for the country | most of the screen | a band across it; names crowd | most of the screen |
| Moving across it | the hex you would step into is plain | plain, but harder to point at | not plain |

**Chosen: A**, the illustrated terrain-first hex crawl. It is the only one in which what the company walks (a hex) is
what the eye reads first, it gives the country the most of the screen, and its marks carry the land's character
without a painting's blur. The isometric treatment added little height at this scale and took the room the country
needed; the hybrid was the most painterly and the least usable.

## What was built

**The map** (web/reader/map-view.tsx, hex-land.ts, hex-symbols.tsx): the whole screen, over the stage, with as little
over it as will do: where you are at the top left, the close and nearer, further and back-to-you at the top right, a
chosen hex or place in a card at the foot. Every hex the company knows is drawn as its land (one palette, dusk over an
old country: muted earth for the lands, deep water, marks in ink with a lit side, ivory names, gold for you and where
you are bound). The ring just beyond what is known is the edge of the unknown, dotted; past it, dark. Rivers and roads
run through the hexes' middles as curves, broken where they leave what is known, never leaping it. Each place known
stands on its hex with its own sign (a town's roofs, a tower, a ruin, a cave, a shrine, a barrow, a camp, a standing
stone, a tarn, a crag, a ford, a grove, a way in), its name beside it, a town's large, a place not yet been to in gold.
It is dragged to move about, its wheel or buttons bring it nearer; a hex chosen says its land and offers to go there
across country, a place chosen says the way there, leg by leg, and sets out.

**The open country** (src/world/region-tracts.ts): every cell of a generated country's land is a stretch of it, a
place, named for its land and where it lies from the nearest town ("open heath north of Weligtún", "the fells of
Barzelrehes"), and told as that land is, with its river, its road, the land rising to one side, a town close by. From
each stretch, the way across country into each of the six about it, as long as the harder land is going (half an hour
over fields, two over the heights), longer over a river; into whatever stands on it (a town, a site, a landmark, a
march-stone); onto the road that crosses it. A town has a way out into the country about it, so that a protagonist can
leave it simply to explore. On the page, those six ways are a compass ("Across country": north-west, the fells of
Barzelrehes, 1h 30m), apart from the place's own ways and the roads.

**Exploring** (LandModel.explored, ChartModel, Itineraries): a stretch walked makes known those about it; looked out
over from it ("Look out over the country from here", not in the dark), the country further off, as far as its land lets
the eye go (from the heights far, from a wood or a fen hardly past the next stretch), a stretch further for someone who
knows how to look or has a glass, only the nearer land in haze or rain. What stands up from the land within sight (a
town, a tower, a ruin, a crag; worked out by the lie of the land between, as from the vantage points of Mission 17) is
told by its bearing and distance and is known from then on, on the map and somewhere to set out toward. What does not
stand up (a cave, a grove, a clearing) is found by coming to its stretch. A journey may strike out across the open
country, walked or not, toward a hex chosen on the map, a place seen, or somewhere been (the way home); toward a place
only heard of it still goes by known ways to the edge of its wild country and asks there (PT-16).

Measured: a generated country now has some 380 places and 880 ways (from 135 and 170) and starts in about four seconds
(from three and a half). test/exploration.test.ts plays it: out of Ramavor into the country about it with no
destination, up onto the fells by the compass, looking out (a square tower a long way off, Barzelmizela some way off;
the known land from 81 hexes to 146), and across the country to the tower, kept known.

## The second round: the map in three dimensions

The owner's addendum of 2026-10-29 asked for something more ambitious than the flat hex crawl: an isometric, 2.5D or
3D terrain map (Three.js permitted) over the whole screen, with relief, light and atmosphere, a palette of a piece
with the title, roads and rivers in the land, mist over unknown country, places recognisable by their form, where you
are and can see and are bound, pan, zoom and choosing by mouse, keys and touch, wilderness steps, long journeys and
going into a site told apart, and every approach judged by how the actual map looks and plays.

Two different renderers were built over the same generated country (kite's world b2, after a morning on the fells
above Ramavor), and published as one playable page for the owner (a claude.ai artifact, private to the owner, built
from scratch code that has not yet entered the reader):

- **Relief**: one continuous landscape, heights blended between hexes, the fells and heights broken into ridges,
  rivers on flat valley floors, a reflective lake with shallows, the hexes drawn only where they matter (yours in
  gold, the six about you, the one pointed at, the one you are bound for) in the land's own shader.
- **Tiles**: a table of hex tiles, each a low terrace by its height, turf over soil at its sides, its top swelling a
  little and mottled in its land's colours, sand where it meets water, a darker bank by a river; mountains, forests
  in clumps, heather and walls on the fells, hedges and farmsteads near towns, pools in the fens, sheep.

Both share the rest: a dusk sky with a gold thread at the horizon after the title's; mist from one small noise texture
in two drifting banks over whatever is not known; towns modelled by their size (roofs about a church tower, a wall
where roads meet, windows lit); places by their kind (a square tower with its pennant, broken walls with an arch, a
cave mouth in rocks, stepping-stones, a standing stone, a cairn where a wild country is entered), each with a small
sign of its kind; the way to where you are bound dotted over the land to a gold pennant; knowledge arriving as the
mist going off the hexes nearest first (tiles standing up out of it).

| | |
|---|---|
| ![Tiles](map/3d-tiles.jpg) | ![Tiles from a corner](map/3d-tiles-corner.jpg) |
| ![Tiles, near](map/3d-tiles-near.jpg) | ![Relief](map/3d-relief.jpg) |

The owner's notes after trying it, and what each changed:

| Note | Done |
|---|---|
| Performance miserable | Nothing drawn unless something has changed (the mist drifting a few times a second when idle); shadows cast once (the sun does not move); no point lights (seven before; lamps and lanterns are glows); the mist two texture reads instead of thirty noise octaves; names measured once, not every frame; the pixel ratio held to 1.5; the tiles merged into three meshes (563 draw calls before); hex lines worked out only near you, the pointer and the bound. In software GL at an iPad's density, about twice the frames while dragging, the worst from four seconds to under one. |
| A more angled view | The camera low over the land as from a hill (about 25° below the horizon), the far country going into haze. |
| Clearer places, cities, towers, mountains, forests | As above; signs of a place's kind always on, its name when pointed at or chosen. |
| The tiles more appealing, but too steep | Terraces of at most five gentle steps; the heights as small mountains on their tiles. |
| Roads and rivers to meander | Curves through each hex with a bend between, a river wandering further than a road, laid over the land where it is known. |
| Richer land | Mottled tops, shores, banks, verges, sides of turf and soil; the furniture above. |
| Less text | Only town names and places' signs; the steps about you, the wild countries' names and the label on you gone. |

The tiles are the owner's preference and the treatment carried forward; the relief stays on the page for comparison.

## The tiles in the reader

The tiles are now the reader's map (web/reader/board/, a script of its own, board.js, fetched only when the map is
first opened; web/reader/board-field.tsx mounts it). Where a browser cannot draw it, the flat hex crawl stands in its
place. Its towns and places are buttons, reached by Tab (the view glides to whichever has the focus, even one off the
screen) and chosen with Enter or a touch, as on the flat map; a known hex is chosen by pointing at it; the card at the
foot plans the way and sets out, as before. What became known since the map was last open arrives as the mist going
off it and the tiles standing up. test/board-browser.test.ts plays it in a real browser (software GL standing in for a
GPU): the country drawn over the whole screen, you on it, a town chosen by the keys, planned and set out for.

## What remains

- On the board itself, a step to the next hex, a journey and going into a place each its own act (they are the card's
  now, as on the flat map).
- The owner's review of the map, in play.
- The wild's own life: what is met in the open country (beasts, travellers, weather's hazards) by its land, and the
  small finds of a stretch (a spring, a shepherd's hut, a wreck of a cart) beyond the places it already holds.
- Authored regions' open country: their land is drawn (AuthoredLand), but their stretches are their authors' rooms.
- The demonstration (OWN-11), played through the reader.
