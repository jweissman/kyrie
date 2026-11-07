# 19. A sea region: terrains no generator draws, and an opt-in archipelago

*Branch `adventure/imbar-deep-time`. Follows `18-engine-spec.md` items 1 and 2A. Small, additive, opt-in: nothing a
generator draws was touched.*

## What was built

1. **Five terrain kinds, drawn by nothing.** `data/rules/core.kyr` gains `jungle`, `volcanic`, `saltflat` ("salt
   flat"), `reef` and `archipelago` beside `desert`. An authored region may say `Initially Assert terrain(reach,
   volcanic).` Their ids are used as the key everywhere (so the salt flat is `saltflat`, never the spaced string).
   - `src/world/authored-land.ts`: a country band for each (`AuthoredLand.country`), so a region of that terrain is
     laid in its own covers.
   - `web/reader/board/board-tiles.ts`: a tile palette each (ash and red cone; deep green; white crust and brine; pale
     shoals) found through one small table; every other terrain falls through to today's expression.
   - `web/reader/board/board-flora.ts`: `saltflat` and `volcanic` use the desert's sparse growth; `jungle` and `reef`
     use the default growth.
2. **`terrain(region, archipelago)`** makes `AuthoredLand.chart` lay open sea (`~`) and each area as one island: a 3x3
   block with, now and then, a spit one cell east or south. Areas sit on a 6-cell grid, so two islands are always at
   least two hexes of water apart. A `peak`/`pass` form is rock with a cone, a `wood` form is trees, a `lake` form is
   a lagoon. The branch is entered only for that terrain; the `draw` sequence of every other region is unchanged.
3. `test/sea-region.test.ts`.

## What it looks like

Six areas on the grid (0,0) (2,0) (0,1) (3,2) (1,3) (5,1), three seeds. `~` is open water, `.` open ground.

```
seed a (42 x 30)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~....~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~....~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
seed b (42 x 30)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~....~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~....~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
seed c (42 x 30)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~....~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~....~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## What was checked, and what was not

- The flat SVG hex map (`web/reader/hex-land.ts`) has **no per-terrain palette** (only per-cover tile fills in
  `book.css`) and is not what the reader draws; the live land is the three.js board. So there is nothing terrain-wise to
  colour there; the sea hex (`~`) already renders in both. There is also **no terrain legend** anywhere to extend.
- The board palettes were not looked at in a browser here (no browser in this session). `test/board-browser.test.ts` /
  `test/map-browser.test.ts` in CI will draw only the existing terrains; a new-terrain visual check is still owed.
- `Environment.of` (combat) returns the raw terrain string; Orsino's handling of `jungle` etc. is unverified, so the
  spec's `ground` mapping was **not** added (a fight on a volcano still has no environment, as before).

## Deferred: wiring the Dorothea archipelago (step c)

Not done, deliberately. The Dorothea's islands are separate regions (`skerrow`, `portness`, `antlers`, `ashkeld`,
`mangrow`, `ship_region`), each its own pocket map, joined by a hull Thing and gangway passages, and none asserts a
`terrain`. Putting them on one sea chart means re-parenting places into a single region (`within reach at gx, gy`),
which changes entity ids, `canonical()` strings, the recorded Dorothea traces and the world installs, and the sea legs
are 140-700 watches (5-30 grid steps, i.e. a chart up to 180 cells wide). That is a migration of a played adventure,
not a gate, so it is left as a follow-up: first give the Dorothea a *new* region `reach` of the near islands only (as a
second, additional map), then migrate. Generated whole-country archipelagos (spec 2C) and a forced coast (2B) remain
as in `18-engine-spec.md`.
