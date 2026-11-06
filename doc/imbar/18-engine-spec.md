# 18. Engine change specification: an island adventure

*Branch `adventure/imbar-deep-time`. Written read-only: nothing in `src/`, `data/` or `web/` was changed and no suite
was run. I read the code named below and ran one scratch module (outside the repo) to settle item 5. Everything not
verified by reading is marked **UNVERIFIED**. Sources: `07-voyage.md`, `11-technical-report.md`, `friction.md`,
`adventures/*-friction.md` (esp. the Dorothea archipelago, the Ring, the lore sweep), `doc/design/ATLAS.md`.*

## 0. Read this first

**What the maintainers' constraint means in this codebase.** Four facts shape every design below.

1. **There is a proven recipe for "new country kind, no re-seed".** Commit `a51750a` ("A desert country, drawn when
   asked for", OWN-44) added a terrain that no seed draws (`?terrain=desert`, `kyrie world --terrain`). It touched
   `heights.ts` (+10), `land-cover.ts` (+3), generation tables and four web files, and `test/desert-country.test.ts`
   (26 lines). Every gate below copies that shape: **the new behaviour is reached only through a new string** (a terrain
   name, a manifest key, a keyword), so existing seeds never evaluate it.
2. **Any edit under `src/lang`, `src/information`, `src/canon` or `data/catalog` invalidates the on-disk parse cache**
   (`src/lang/parse-store.ts:12-22` hashes those directories). The next run of anything re-parses every module. So
   grammar and `src/lang` changes (items 4, 5, 11) should land **together in one PR**, to pay the cold cache once.
3. **Editing `data/` (including `data/rules/core.kyr`) obliges `bun run web:build`**; `test/repository.test.ts:39-46`
   fails otherwise (it compares `web/bundles.generated.json` with `data/`).
4. **Cheap proof of "no seed moved"** already exists: `bin/kyrie countries --diff [before.json] [seed ...]`
   (`src/cli/countries-tool.ts`) for country placement, and `bin/kyrie world <seed> --json | sha256sum` over, say, 20
   seeds before and after for the generated region. Both take seconds, not suite-minutes. I recommend both be run in
   every PR that touches `src/world`.

**Two findings that change the shopping list** (they are cheaper than the friction files say):

* **`Time <measure>` already works** (item 5). A scratch module with `Measure interest(group)` and
  `Action ... { Time interest(party). }` waited exactly the measure's value (3 watches). `Kyr.ohm:221`
  (`"Time" Call "." -- measured`) and `src/campaign/action-time.ts:10` do it; `data/rules/dominion.kyr:40` and
  `passages.kyr:92` use it. What is missing is arithmetic in `Time` (`Time interest(party) + 2.` is a parse error:
  *Expected "."*). The "blocked" label in `friction.md` #8 and `11-technical-report.md` §11.1 is wrong as worded.
* **A `terrain` relation and a `within` relation already exist** (`data/rules/core.kyr:33-35` and `:48`). Friction A1
  ("a terrain tag other rules can read") is half built: `Initially Assert terrain(region, kind)` is read by combat
  (`Environment.of`, `src/campaign/environment.ts:48`) and by the map; and `within(party, mangrow)` is a computed
  "anywhere inside this area" test, which is what the hand-kept `inGreen` room list (A16) was standing in for. What is
  missing is only the *kinds* (`jungle`, `volcanic`, ...), a rule-readable way to say "any region of that kind", and the
  rendering.

**The map is not 3-D isometric, it is two things.** A flat SVG hex crawl (`web/reader/hex-land.ts`, `map-view.tsx`,
colours in `book.css:76-78`) and a three.js board (`web/reader/board/*`: `board-tiles.ts`, `board-ground.ts`,
`board-flora.ts`, `board-kit.ts`). **Open water already renders in both**: cover `'~'` (`hex-land.ts:27`) is drawn as
`sea`; the board lays "all the open water" as one mesh (`board-tiles.ts:18,62`). So an ocean tile is not a new
rendering problem; producing a *land chart with lots of `'~'` and distant islands* is.

---

## 1. Summary and ranking

Effort S (<1 day), M (1-3 days), L (a week or more). "Re-seeds" = changes any already-drawn world.

| # | Change | Effort | Re-seeds | Parse-cache cold | Best local tests | Rank |
|---|---|---|---|---|---|---|
| 5 | `Time` arithmetic (and docs: bare `Time measure()` works) | S | no | yes (`src/lang`) | parser + `journey-named-time`, `the-slack` | batch A |
| 11 | Test-level dice pin (`Journey.dice(n)`) | S | no | yes (`world.ts`) | `journey-test-aids`, `dorothea-sea` | batch A |
| 4 | `Table` + `draws <row> from <table>` (parse-time desugar) | M | no | yes | parser, `dorothea-sea` | batch A |
| 1 | Terrain kinds: jungle, volcanic, salt, reef, archipelago | S-M | no | no | `land-map`, `authored-land`, browser specs | **PR 1** |
| 2A | Authored archipelago region chart (ocean + islands) | M | no | no | `authored-land`, `land-map`, `map-*` | PR 2 |
| 12a | `befell` error hint; herald export rename (R6) | S | no | partly | `factors-handoff`, lint | PR 4 (with 10) |
| 3A | `vessels` opt-in rule module (Kyr data) | M | no | no | new `vessels.test`, `the-dorothea` | PR 5 |
| 2B | Shore-gate and `coast` option for generated worlds | M | no (gated) | no | `provinces`, `countries-tool`, world hash | PR 6 |
| 7 | Foreknown hidden ways for agents; `byway` to a stand-in | S (rule data) | no | no | `exchange-responds`, `factors-handoff` | PR 4 |
| 6 | Cross-module measure read | M-L | no | yes | `factors-handoff`, `all-in-one-world` | later |
| 8 | Kits for province installs | M-L | no | no | `frontier`, `provinces`, compose tests | later |
| 9 | `hasCalling` portability | M, **risky** | digest if done wrongly | no | `callings`, `all-in-one-world`, traces | later, doc first |
| 3B | `sea` passage kind | S | no | no | `chart-model` tests | optional; `ferry` already does it |
| 2C | Generated archipelago *terrain* for whole countries | L | no (gated) | no | desert-style test + 20-seed hash | defer |

**Recommended order:** (0) a docs-only correction PR, free; (1) PR 1 terrain kinds; (2) PR 2 archipelago chart; (3)
batch A in one PR (`Time` arithmetic, dice pin, `Table`); (4) PR 4 small authoring fixes; (5) vessel module;
(6) forced coast / shore-gate; the rest as demand shows. **First small PR: item 1 (terrain kinds)**, with the docs
correction alongside it; reasons in §14.

---

## 2. Item 1: new terrain kinds (volcano, jungle, salt flat, reef)

### (a) What is blocked

Friction **A1** (`adventures/the-dorothea-archipelago-friction.md`): "No terrain kinds beyond region/settlement/
wilderness/site/building/room. Volcano, jungle and salt flat are prose only." Ashkeld (volcanic) is a `wilderness`
with a hand-written rim hazard. **Mangrow** (jungle) is a `wilderness` plus `settlement`; the heat is a `swelter`
measure raised by a `Rule` that lists the four green rooms in a `Query inGreen`, halved by `netted`, stopped by
`barked`. "Nothing on the chart, in travel time, in rest, in the encounter or sound tables knows the place is hot or
wet." Also A16 (room lists repeated in rules). User-visible symptom: Mangrow, Ashkeld and Port Ness's salt pans all look
like the same green-and-brown hex country on the map, and a fight on a volcano is fought with no environment.

### (b) Where it lives

* Kinds: `data/rules/core.kyr:33-35`: `Kind terrainkind. Relation terrain(place, terrainkind).` and six entities
  (`forest marsh mountain frost desert hills`). `terrainkind` is in `ModuleNamespace.canonical`
  (`src/campaign/module-namespace.ts:18-21`), so these ids are shared by every installation. Landforms (area shape) are
  separate: `core.kyr:36-40`, `landform(place, landkind)` with `land_river land_lake land_peak land_pass land_wood`.
* Generated regions assert it: `src/world/region-writer.ts:152`
  (`Initially Assert terrain(region, <terrain>)`). Authored modules assert it by hand
  (`data/adventures/hollins/clock.kyr:13`, `quittance/city.kyr:9`, ...). The Dorothea asserts none.
* Combat reads it: `Environment.of` (`environment.ts:42-52`) returns the nearest place in the standing chain that says
  a terrain, as a bare string, and that string is "Orsino's environment" (header comment of `environment.ts`).
* The 2-D map: `chart-model.ts:177-181` (`form()` reads `terrain` or `landform`, strips `land_`), `authored-land.ts:19`
  (`AuthoredLand.country`, the per-terrain bands for an authored region), `hex-land.ts:27-31` (cover letters and
  glyph counts), `terrain.tsx:12-18` (glyph paths), `book.css:76-78` (tile fills).
* The 3-D board: `board-tiles.ts:24-39` (per-terrain palettes; `tone(terrain, cover)` picks frost, desert or the
  default), `board-flora.ts:30-31` (per-terrain scatter; frost -> `cold()`, desert -> `dry()`), `board-ground.ts:64`
  (canopy off for desert), `board-kit.ts` (small geometry: `palm` was added by `a51750a`).
* Generated-country terrain (separate and larger) is a string through `Heights.shape` (`heights.ts:45`),
  `LandCover.profiles` (`land-cover.ts:16`), `Settling.counts` (`settling.ts:19`) and ten data tables. **This item does
  not need that**: an authored region's terrain is only a colour and a rule tag.

### (c) Smallest design

Four pieces, all keyed on new strings.

```kyr
// data/rules/core.kyr, after line 35
Entity jungle: terrainkind "jungle". Entity volcanic: terrainkind "volcanic".
Entity saltflat: terrainkind "salt flat". Entity reef: terrainkind "reef".
Entity archipelago: terrainkind "archipelago".
// optional, area shape (item 2): Entity land_volcano: landkind "volcano".
```

```ts
// src/campaign/environment.ts: map an author's kind onto the ground Orsino knows (UNVERIFIED: Orsino is not in
// this checkout; the set below is the one Environment's own header lists plus the six terrainkinds)
static readonly ground: Record<string, string> = { jungle: 'forest', volcanic: 'mountain', 'salt flat': 'desert',
  reef: 'marsh', archipelago: 'hills' };
//   ... in of():   if (terrain) { return Environment.ground[terrain] ?? terrain; }
```

```ts
// web/reader/board/board-tiles.ts: replace the two-way ternary at :38 by a table
private static readonly palettes: Record<string, Record<string, Color[]>> = { frost: BoardTiles.frost,
  desert: BoardTiles.desert, jungle: BoardTiles.jungle, volcanic: BoardTiles.volcanic, 'salt flat': BoardTiles.salt };
static tone(terrain: string | undefined, cover: string): Color[] {
  const own = BoardTiles.palettes[terrain ?? ''] ?? BoardTiles.tones;       // unknown/undefined: today's colours
  return own[cover] ?? own['.']!;
}
// plus three small palettes shaped like :31-34 (volcanic: '.' ash #3a3735/#58534f, 'f' basalt, 'p' red cone,
// ',' sulphur; jungle: '.' #2f5a2c/#4f7d3a, 'w' very dark; salt flat: '.' #cfc9b4/#e9e4d3, ',' brine #8aa0a8)
```

`board-flora.ts:30` gets one more branch per kind (`jungle` -> dense broadleaf + reeds; `volcanic` -> boulders and no
trees; `salt flat` -> nothing). `hex-land.ts` and `book.css` need no change for recolouring (the flat map has no
terrain palette today); add a `salt`/`lava` cover only if item 2 wants one (see there).

A rule can then say what the Dorothea currently spells with a room list:

```kyr
Rule jungle_sting when memberOf(?m, party) and within(party, ?r) and terrain(?r, jungle) and not barked(party) { Increase swelter(party) by 1. }
```

**Gate.** `BoardTiles.palettes[...] ?? tones` returns exactly today's value for `undefined` and every existing terrain;
`Environment.ground[...] ?? terrain` returns the input unchanged for every existing kind; the new core entities are
unreferenced by any generator (`regionTerrain` table, `places.json:2-18`, lists only forest/marsh/mountain/frost).

### (d) Tests

Local (cheap): `test/land-map.test.ts`, `test/authored-land.test.ts`, `test/desert-country.test.ts` (shape of the
precedent), `test/repository.test.ts` (after `bun run web:build`). New: a 15-line test that a module asserting
`terrain(x, jungle)` makes `Environment.of` return `forest`. CI: `test/board-browser.test.ts`, `test/map-browser.test.ts`
(browser specs), `test/traces.test.ts` and `test/digest.test.ts` (to confirm that adding entities to `core.kyr` moves no
digest; I expect no change, since entities are not facts, but I did not prove it).

### (e) Risk / effort

No generator draw is touched, nothing re-seeds. Risks: (i) Orsino's treatment of an unknown `environment` string
(**UNVERIFIED**; the mapping above avoids passing one); (ii) `core.kyr` is compiled into every module: the web bundle
must be rebuilt; (iii) a new Entity id (`jungle`, `reef`) could collide with an author's global name (names are global:
A9). Effort **S-M** (data + three web files + one test).

### (f) Author's use; Dorothea example

```kyr
Initially Assert terrain(ashkeld, volcanic).
Initially Assert terrain(mangrow, jungle).
Initially Assert terrain(portness, saltflat).
```

Then `mangrow.kyr`'s `Query inGreen` collapses to the rule above, the fever `Hazard` rule can be written once for "any
jungle", and the board colours Ashkeld black and Mangrow deep green. Ashkeld's rim hazard stays authored (a hazard is
content, not a terrain).

---

## 3. Item 2: an ocean / archipelago world

The brief asks for "a sea of N ocean tiles with islands placed far apart" and for placing island provinces. Three levels,
by cost. I recommend 2A now, 2B soon, 2C only if whole archipelago *countries* are wanted.

First, what is true today:

* A generated country is **20 x 14 cells, a cell about three miles** (`Terrain.size`, `terrain.ts:11-12`). Its sea is a
  fringe: `Heights.make` gives a coast on one side with probability `coastChance` (forest 0.4, marsh 0.7, mountain 0.3,
  frost 0.5, `heights.ts:11-12,22`), and `Drainage.sea` (`drainage.ts:41-57`) floods low cells reached *from that side
  only*. Four sides, so a sea on the east is at most 0.7 x 0.25 = 17.5% (forest 10%, mountain 7.5%).
* **Tolleth, the Dorothea's harbour, is a province with `side: "east"`, terrain `hills`**
  (`data/adventures/countries.json`, entry `tolleth`). `Provinces.lands.hills = [heath, meadow, fell]`
  (`provinces.ts:19-20`) and `Gates.one` (`gates.ts:27`) picks the first such cell 2-6 in from the east, **with no
  requirement of a shore**. So in at least 82% of worlds "a harbour the colour of slate" stands on an inland moor. This
  is the "appropriate ocean" blocker on the generated side, independent of any archipelago.
* Provinces and marches differ. `Country.beside` (`countries.ts:13`) is a list of *neighbouring generated terrains* and
  matters only for non-province countries entered across a march (`Countries.fits`, `plan`, `way`: placed on the
  `WorldGrid` of 60-mile region cells, up to `reach = 4` out). A province is placed by `side` + `covers` on the first
  country's land (`Provinces.situate`, `provinces.ts:24-30`). All 22 current entries in `countries.json` are provinces.
* Every settlement in a generated region stands on one connected landmass: `Settling.make` restricts to
  `reach = this.land(...)` (`settling.ts:26-35`); `Roads.cost` and `.hours` are `Infinity` for sea and lake
  (`roads.ts:17-20`).

### 2A. Authored archipelago region (recommended)

**(a) Blocked.** A2: "No distance on the world map for a module-local archipelago ... the chart knows nothing of the
sea." Today every island is a separate region (`skerrow`, `portness`, `antlers`, `ashkeld`, `mangrow`, `ship_region`:
`ship.kyr:6,18`; `isle.kyr:4`; ...), so no map can show them together or show the water between. 07-voyage §7.3: "The
ship does not show on the world map." Symptom: a player sees five isolated pocket maps and a distance only as a `Time`.

**(b) Where.** `AuthoredLand.chart` (`authored-land.ts:30-52`) draws the land of any authored region from the grid
coordinates of its areas (`Place x ... within region at gx, gy`), one 6x6 block per area (`block = 6`, `:17`), over a
base country chosen by the region's `terrain` (`country[...]`, `:19`; `ground()` at `:82`); `lay()` (`:54`) shapes a block
by its `landform`. Roads between areas are drawn as straight-ish lines (`roads()`), and `chart-model.ts:16,33`
already treat `way_ferry` as a regional road. The base cover `'~'` is already a legal cover letter (`hex-land.ts:27`;
the region-writer glyph table `region-writer.ts:264`).

**(c) Design (behind `terrain(region, archipelago)`).**

```ts
// authored-land.ts
static readonly country = { ..., archipelago: ['~'] };                       // base: open sea (new key only)
static chart(...): // terrain is already read at :78 by this.terrain(module, region)
    const terrain = this.terrain(module, region);
    const cover = this.ground(f, terrain, draw);                             // all '~' for archipelago
    for (const a of areas) { this.lay(cover, a, { form: forms.get(a.id), f, draw, terrain }); }
private static lay(cover, a, at) {
  ...existing lines unchanged...
  if (at.terrain === 'archipelago') { this.isle(cover, a, at); }             // new, 100% inside the if
}
private static isle(cover: string[], a: Entity, { form, f, draw }) {
  const mid = this.centre(a, f), B = this.block;
  for (const c of this.blob(mid, f.width, B / 2 - 0.5)) { cover[c] = draw.chance(0.25) ? '.' : 'w'; }
  for (const c of this.blob(mid, f.width, B / 2 - 1.5)) { cover[c] = form === 'volcano' ? 'p' : form === 'jungle' ? 'w' : '.'; }
  if (form === 'volcano') { for (const c of this.blob(mid, f.width, B / 2 - 0.5)) { if (cover[c] !== 'p') { cover[c] = 'f'; } } }
  if (form === 'flat') { for (const c of this.blob(mid, f.width, B / 2 - 0.5)) { cover[c] = ','; } }   // salt pans read as fen
}
```

(The exact cover choices are cosmetic; the point is that the sea is the base and each area becomes one island.)

Distance is the author's grid: a step is 6 cells = about 18 miles. **At a ketch's pace the Dorothea's Skerrow leg (140
watches) is about 5-6 grid steps; Ashkeld (396) 15; Mangrow (700) 30 steps = 180 cells wide.** Put the near islands on
the chart and leave Mangrow and Ashkeld as "off the chart" (a region of their own, as now), or accept a 100 x 60 cell
chart (6000 characters of `cover`; cheap as data, but the board's cost for a land of that size is **UNVERIFIED**; the
flat map draws known cells only, `hex-land.ts:51`, which suggests fine).

Sea routes: `Passage crossing "the Skerrow passage" is ferry between harbour_quay and skerrow_landing taking 23 hours.`
(`ferry` already exists: `world-constructs.ts:140`, and the chart draws it as a road across the `~` cells). Whether the
board's path layer (`board-paths.ts`, `path-reach.ts`) draws or snaps a road across wet hexes is **UNVERIFIED**; read
`path-reach.ts` before building.

**Gate.** `country[terrain]` exists only for the new key; `lay`'s new call is inside `if (at.terrain === 'archipelago')`;
`terrain(...)` defaults to `'forest'` (`:78`), and no existing module asserts `archipelago` (the entity does not exist
until item 1).

**(d) Tests.** Local: `test/authored-land.test.ts` (add one case: two areas 12 apart give a chart whose cover is mostly
`~` with two blobs), `test/land-map.test.ts`. CI: the browser map specs.

**(e) Risk/effort.** No generator, no draw order, no existing module affected. **M** (the chart code is 25 lines; the
work is choosing glyphs and checking the board). Depends on item 1 (the `archipelago` and `volcano` ids).

**(f) Author's use.**

```kyr
Place reach "The Reach" is region.
Initially Assert terrain(reach, archipelago).
Place tolleth_isle "Tolleth" is settlement within reach at 0, 0.
Place skerrow_isle "Skerrow" is wilderness within reach at 5, 1.
Initially Assert landform(skerrow_isle, land_volcano).      // optional shape
```

### 2B. Shore gate and a forced coast for generated worlds

**(a) Blocked.** Tolleth is a harbour with no sea (above). Also nothing lets a world be asked for "a country with a sea
on its east".

**(b) Where.** `Country` (`countries.ts:11`), `Provinces.situate` (`provinces.ts:24-30`), `Gates.cells`
(`gates.ts:43`), `Heights.make` (`heights.ts:13-26`), `Atlases.make` (`atlas.ts:23`), `WorldAssembler.lay`
(`world-assembler.ts:230`), `DrawnWorld.options` (`drawn-world.ts:10`).

**(c) Design.**

```ts
// countries.ts, Country: shore?: boolean;      // "its way in stands on a cell by the sea, where the country has one"
// provinces.ts: wanted = provinces.map(c => ({ id: c.id, side: c.side, covers: ..., shore: c.shore }))
// gates.ts: Wanted gets shore?: boolean; in one(), before the `covers` loops:
const coastal = (cell: number) => Terrain.neighbours(land, cell).some(n => land.cover[n] === 'sea');
const pool = this.cells(land, w.side, covers, taken);
const cells = w.shore && pool.some(coastal) ? [...pool.filter(coastal), ...pool.filter(c => !coastal(c))] : pool;
```

`countries.json` gets `"shore": true` on `tolleth`. **Gate:** `w.shore` is undefined for the other 21 provinces, and for
Tolleth in a country with no sea `pool.some(coastal)` is false, so the order is today's. For Tolleth in the ~15% of worlds
that do have an east sea, the gate moves to the shore: that *does* change those worlds, which is the point, but means
"shore" must be added with the same ritual as adding a province (below).

Forced coast (the opt-in to get a sea): `Heights.make(key, terrain, size, force?: Side)`:

```ts
const coast = force ?? (draw.chance(this.coastChance[terrain] ?? 0.4) ? draw.pick(sides) : undefined);
```

This is the last use of `draw` in `make`, so with `force` undefined every draw is consumed exactly as now. Thread
`force` through `Terrain.make`, `Atlases.make(..., at.coast)`, `WorldAssembler.lay(drawn.coast)` and
`DrawnWorld.options` (`{ region: { terrain, coast } }`, like `terrain`), plus `kyrie world --coast east`. A sea forced on
the east still needs cells below `seaLevel = 0.14` at that edge: `Heights.fall` (`:70-77`) subtracts up to 0.7 over the
last cells (`0.7 * near ** 1.6`), so I expect a sea in most draws; **UNVERIFIED**.

**(d) Tests.** Local: `test/provinces.test.ts`, `test/countries-tool.test.ts`, `kyrie countries --diff` on 20 seeds, and a
`kyrie world <seed> --json | sha256sum` loop with and without the change (must match on every seed where Tolleth is
not shore-eligible and with no `--coast`). CI: `seeds-load`, `traces`, `digest`, `all-in-one-world`.

**(e) Risk/effort.** Adding `shore` to Tolleth **re-seeds the worlds where an east sea exists** (Tolleth's gate cell moves;
the road to it and `web/bundles.generated.json` move). That is the documented three-step ritual (`friction.md` #9:
`bun run web:build`, `bun scripts/redigest-trace.ts` for `wren-tower-climbed`, and any seeded test, `wild-meetings`,
`exploration`). **M** and **medium** risk. If that is unacceptable, ship only the forced-coast option (re-seeds nothing)
and leave `shore` off Tolleth until the maintainers choose to re-record.

**(f) Use.** `{"id":"tolleth", ..., "shore": true}`; `bin/kyrie world s1 --terrain hills --coast east`.

### 2C. A generated archipelago terrain (defer)

A whole first country (or a march-entered country) of ocean and islands, drawn when asked for, following `a51750a`. It
needs: a `Heights.shape` branch (islands as noise thresholded by distance from several seeds) and a `coastChance`
bypass; `Drainage.sea` to flood *every* sub-`seaLevel` cell, not only those reached from a side (`:41-57`);
`LandCover.profiles.archipelago`; `Settling.counts.archipelago` and, necessarily, **a way to join seats on different
islands**: `Roads.route` gives `Infinity` across sea (`roads.ts:17-20`), so seats are confined to the largest island
(`settling.ts:26-35`) and other islands' sites are unreachable. A ferry link needs a per-terrain cost override
(`Roads.cost` is a static `Record<Cover,number>`) and a `Passage ... is ferry` emitter in `RegionRoads`; plus ten
`data/generation/*` table entries (the desert commit shows which: `places`, `peoples`, `creatures`, `weather`,
`borders`, `common-names`, history `arts`, two kits' `tables.json`, `origins/tables.json`, two situations' tables), the
board palette, a test. **L**, medium risk (touches `Roads`/`Settling` behind `terrain === 'archipelago'`). Not worth it
until 2A and 2B prove the island adventure plays; the Dorothea needs one archipelago, not a country type.

Ocean tiles at the `WorldGrid` scale (60-mile regions that are pure sea, between authored countries) would need a
`Region` with no settlements (`places.json:11` always draws three) and a `Frontier` path that installs nothing but a
ferry link (`frontier.ts:56-76`). Also **L**; 2A's hex-scale sea gives "lots of ocean tiles" without it.

---

## 4. Item 3: a vessel / sea passage that is clean

### (a) What is blocked

`07-voyage.md` §7.2-7.3 and `11-technical-report.md` §11.3: no vessel entity, no mobile location, no interruptible
passage. The Dorothea works round it with a `hull` Thing at six stations, gangway passages with `opening when at(hull,
...) and booked(party)`, a `progress` counter, a `troubled(hull)` stop, and per-leg `bound/seaEnd/stayFor/homeOpenAt...`
(`the-dorothea-archipelago.md` "Route choice"). Cost, in the friction files: **A3** (a passage's `opening when` shuts at
both ends, trapping a company), **A8** (the second voyage's `Retract` list), **16** (one route, no route choice), **A14**
(the draw cap cannot be per call). Symptom: every new island is another 40-100 lines of hand-built station logic and a
test to prove each reset.

The honest finding is that the engine's `go` is fine for a *crossing you cannot be interrupted in* (it lands at the
destination: 07 §7.2) but not for a voyage with events; the hull pattern is **correct, just verbose**. So the cleanest
fix is a rule module, not an engine class.

### (b) Where

`data/rules/dominion.kyr:1-42` is the precedent: a rule module of Kinds, Relations, a Measure, two Actions
(`depart`, `arrive`) that make an agent `travelling` and later arrive at a `bywayTo` place after `bywayTime`. Rule
modules are named in a module's `rules` list; `ModuleBundle.world` (`module-bundle.ts:61-62`) is the standard set and
`ModuleBundle.ruleNames = [...world, 'elements', 'devotion']` (`:65`) the allowed names. A rule module in `ruleNames` but
**not** in `world` is opt-in by manifest (`elements` and `devotion` already work that way:
`region-writer.ts` manifests `rules: ['world','elements','devotion']`). Passage kinds: `WorldConstructs.wayKinds`
(`world-constructs.ts:139`), which already has `ferry`.

### (c) Design

3A. `data/rules/vessels.kyr` (new, plus `'vessels'` in `ruleNames`), named only by modules that list
`"rules": ["world", "vessels"]`:

```kyr
Module vessels "How a ship goes from call to call" {
  Kind leg.
  Relation legOf(leg, entity). Relation legFrom(leg, place). Relation legTo(leg, place). Relation nextLeg(leg, leg).
  Measure legLength(leg).                    // in watches
  Relation sailing(entity, leg). Relation troubled(entity). Relation moored(entity).
  Measure legRun(entity).
  Rule ship_makes_way when sailing(?v, ?l) and not troubled(?v) and legRun(?v) < legLength(?l) { Increase legRun(?v) by 1. }
  Rule ship_arrives when sailing(?v, ?l) and legRun(?v) >= legLength(?l) and legTo(?l, ?p) and at(?v, ?q)
    { Retract at(?v, ?q). Assert at(?v, ?p). Retract sailing(?v, ?l). Set legRun(?v) to 0. Assert moored(?v). }
  Action cast_off(actor: group, ship: entity, leg: leg) "Cast off" {
    Requires moored(ship) and legFrom(leg, ?p) and at(ship, ?p).
    On success { Retract moored(ship). Assert sailing(ship, leg). }
  }
}
```

The author keeps gangways, crew, events and prose; the module removes `progress`, the arrival rule and the station
chain, and `troubled` becomes the standard stop. A leg's length and `nextLeg` give route choice as data (with the
`Table` of item 4 for events). Note `troubled` is already an author-declared relation in the Dorothea (`voyage.kyr`), so
the rule module and the Dorothea must agree on the name (global names, A9/R7). Whether these Rule/Action forms compile
exactly as sketched is **UNVERIFIED**; they copy `dominion.kyr`'s shapes.

**Gate:** the module is parsed only if a manifest lists it. No existing manifest does. It is not in `ModuleBundle.world`,
so generated worlds never load it.

3B. A `sea` passage kind: **not needed**. `ferry` is already a valid kind, a `waykind` entity (`world-constructs.ts:86`),
drawn as a regional road (`chart-model.ts:16,33`) and walked as a road (`journeys.ts:119`). The two real gaps are that
a `go` cannot be interrupted (use 3A) and that a cross-*region* way is never on a chart (`chart-model.ts` `charted`
requires both ends in one region): solved by 2A putting the islands in one region. Add `sea` only for distinct styling;
that is a three-file change (`wayKinds`, the two `chart-model.ts` lists) and I would not do it.

### (d) Tests

New `test/vessels.test.ts` (a 3-place fixture under `test/fixtures/`: leg runs, trouble stops it, resume arrives).
Existing, run only if the Dorothea is migrated: `the-dorothea`, `dorothea-sea`, `dorothea-routes`, `skerrow-night`. CI: the
rest of the `dorothea-*` set.

### (e) Risk/effort

No engine code. The risk is in migrating the Dorothea (it has a save-resume test in fog and in the Combs,
`the-dorothea.test.ts`); do not migrate in the same PR. **M** for the module and its test; **M** to migrate.

### (f) Use; Dorothea example

```kyr
Entity skerrow_run: leg. Initially Assert legFrom(skerrow_run, quay). Initially Assert legTo(skerrow_run, skerrow_roads).
Initially Set legLength(skerrow_run) to 140.
Initially Assert legOf(skerrow_run, hull).
```

---

## 5. Item 4: `Draw <row> from <table>` in a rule (per-watch random events)

### (a) What is blocked

Friction **13-15** and **A14**: "A table in Kyr is a set of rules with mutually exclusive `dice(x)` ranges, one per row;
there is no weighted Draw ... Deem tables roll at install, not per watch." The Dorothea's table is five 400-character
`Rule` headers differing only in `dice(hull) > 5 and dice(hull) <= 10` (`weather.kyr:13,36,56,79,96`), plus five `...Done`
relations and a `seaDrawn < 2` cap in every rule. Symptom: adding a sixth event means editing five other rules' ranges.

### (b) Where

`dice(x)` is real and per-watch: `World.die` (`src/lang/world.ts:164-170`) hashes `dice(clock)`, the watch and the
thing's name to 1-100; `CampaignTick.clock` writes `dice(clock)` (`campaign-tick.ts:66-69`). Rules: `Kyr.ohm:158`
(`WorldRule`), `module-parser.ts:336`, `WorldRule` type at `module.ts:85`. The grammar change is in `src/lang`.

### (c) Design: a parse-time desugar, no runtime change

```ohm
Table = "Table" ident "on" ident "{" NonemptyListOf<TableRow, ","> "}"       // Table sea_events on hull { squall 5, raft 5, fever 5 }
TableRow = ident integer
WorldRule = "Rule" ident RuleWhere? "when" Predicate RuleDraws? RuleOnce? ...
RuleDraws = "draws" ident "from" ident                                         // draws squall from sea_events
```

At the end of `ModuleParser.parse`, for each rule with `draws row from table`: compute `lo` = sum of the weights of the
rows before it and `hi = lo + weight` (cumulative, in table order), then replace `when` with
`{ kind:'and', left: when, right: <dice(on) > lo and dice(on) <= hi> }`, using the same AST the author writes by hand
today. The result is **the rule the Dorothea already has**, so the evaluator, the planner, saves and `canonical()` see
nothing new. A table whose weights total under 100 leaves the rest as "nothing happens" (the Dorothea's 25/100). Errors:
unknown table or row, a row drawn by two rules, total weight over 100.

A per-call cap (A14, `seaCap(hull)` as a measure) is just `seaDrawn(hull) < seaCap(hull)` in the author's `when`; no
engine support needed.

**Gate.** `Table` and `draws` are new keywords; a module that does not use them has no `draws` field and no change.

### (d) Tests

Local: a parser unit (new `test/kyr-table.test.ts`, modelled on `kyr-escapes.test.ts`), `test/dorothea-sea.test.ts`
(rewrite `weather.kyr` with `Table` and require the same six-seed sweep to pass, which proves the desugar), and
`test/parse-diagnostics.test.ts`. The rest waits for CI (the parse cache is cold anyway; see §0).

### (e) Risk/effort

No re-seed (unused syntax). **M** (grammar + one post-parse pass + diagnostics). Batch with items 5 and 11.

### (f) Use; Dorothea example

```kyr
Table sea_events on hull { squall 5, raft 5, fever 5, calm 5, fleet 5 }
Rule sea_squall when at(hull, open_sea) and sailed(hull) and not troubled(hull) and seaWindow(hull) and seaDrawn(hull) < seaCap(hull)
  draws squall from sea_events says "The horizon to windward has gone the colour of a bruise..." {
  Assert squall(hull). Assert troubled(hull). Increase seaDrawn(hull) by 1.
}
```

---

## 6. Item 5: `Time <expression>` on actions

### (a) What is blocked, corrected

The friction (`friction.md` #8; `11-technical-report.md` §11.1; the Slack's "interest ... is announced, not charged")
says an action's `Time` "cannot be a measure." **That is false for a bare measure**: I compiled and played

```kyr
Measure interest(group).  Initially Set interest(party) to 3.
Action wait_it(actor: group, site: place) "Wait out the interest" { Requires at(actor, site). Time interest(party). Result "You wait.". }
```

and `-- watch 3` followed the step (scratch module, not in the repo; command
`bin/kyrie play <campaign.json> --probe "#interest party" "Wait out the interest"`). `Time interest(party) + 2.` fails to
parse (*Expected "."*). So the Slack can charge its interest **today** with a measure the action's own earlier steps keep;
what is missing is only arithmetic. `Time` is in watches (ten minutes each).

### (b) Where

`Kyr.ohm:217-221` (`Time = ... | "Time" Call "." -- measured`), `module-parser.ts:49` (`Time_measured:
StatementParser.Duration`), `statement-parser.ts:25` (stores `duration` as the Call AST), `module.ts:58`
(`duration?: Call`), `module-namespace.ts:76` and `action-schemas.ts:128` (bind variables with `this.call`),
`action-time.ts:10,18` (`world.number(action.duration)`; `d?.kind === 'call'` at `:18` for the walking pace).

### (c) Design (S)

`World.number` (`world.ts:146-160`) already evaluates `arith`, `count` and `number` Values, not just calls. So:

```ohm
       | "Time" Value "." -- measured          // was Call; Value includes Call, numbers and arithmetic (Kyr.ohm:258)
```

```ts
// module.ts:58  duration?: Value;     statement-parser.ts:25  unchanged (ModuleParser.ast works on any Value)
// module-namespace.ts:76 and action-schemas.ts:128: bind with the Value binder these files already use for
//   `Set ... to <Value>` changes (UNVERIFIED which helper name; both files have one for change values)
// action-time.ts:18   const walked = d?.kind === 'call' && d.name === 'travelTime';   // unchanged: arith is never "walked"
```

PEG order: `Time integer "."` (`-- fixed`) is tried first, so `Time 3.` keeps meaning a fixed 3; `Time 3 + 2.` falls through
to the new alternative.

**Gate.** Only text that did not parse before can reach the new alternative; every existing `Time` line parses as before
(`Call` is a `Value`).

### (d) Tests

Local: `test/journey-named-time.test.ts`, `test/the-slack.test.ts`, a parser case in a new `test/kyr-time.test.ts`, and
`test/parse-diagnostics.test.ts`. CI: everything (the parse cache is cold).

### (e) Risk/effort

**S**. `ActionTime.of` is also used by the planner (`planner.ts:56`) and the result is clamped by `Math.max(1, ...)`
already (`action-time.ts:10`). The `Time until ...` alternative must stay before `Value` (it does, `:219`). No re-seed.

### (f) Use

```kyr
Time depthBelow(party) * 2 + 1.
```

Slack example: a climb that takes as many watches as the company spent below: today `Time spent(party).` with `spent`
kept by the descent's rules; with the change, `Time spent(party) / 2 + 1.`

---

## 7. Item 6: reading measures across modules / shared canonical measures

### (a) Blocked

Ring **R5**: "The Dorothea cannot read the town's `stay`/`away`/`seenAbroad`. The two modules therefore keep separate
clocks for the same person and meet at a shared place. The first design (one `leg` measure) was refused by the loader."
**R6**: `herald.exports` binds export name to the same import name (the Ring's head had to be `ring_head`, not
`principal`). Also lore sweep 3 / A9 / friction #10 (global names).

### (b) Where

Heralds: `Country.herald { scenario, exports: string[] }` (`countries.ts:32`); bound in `Frontier.herald`
(`frontier.ts:142-152`: `Object.fromEntries(country.herald.exports.map(name => [name, `${id}.${name}`]))`). Imports are
entity ids only (`ModuleNamespace` constructor, `module-namespace.ts:23-27`: `bindings.imports[e.id] ?? ...`). Functions
(relations/measures/queries) are mapped to `scope + name` unless they appear in the shared rules (`:28-30`).

### (c) Design

Two steps, the first trivial and independent.

1. **R6, rename on export (S).**

```ts
// countries.ts:32   herald?: { scenario: string; exports: (string | Record<string, string>)[] }   // "ring_head" or { principal: "ring_head" }
// frontier.ts:151   return Object.fromEntries(country.herald.exports.flatMap(e => typeof e === 'string' ? [[e, `${id}.${e}`]]
//                       : Object.entries(e).map(([imp, exp]) => [imp, `${id}.${exp}`])));
```

   Gate: every existing entry is a string, taking the first branch, which is today's expression.

2. **R5, measure import (M-L, design only).** Let a module import a function by alias. The importer declares
   `Measure stay(group)` and lists `"fn:stay"` in its imports; the binding maps it to the exporter's prefixed name:

```ts
// module-namespace.ts:28-30   functions: shared ? f.name : bindings.imports[`fn:${f.name}`] ?? scope + f.name
```

   Unresolved questions (**UNVERIFIED**, not read): the loader's check that every import is bound
   (`module-assembly.ts` / `definition.ts` roles), whether an imported measure's *initial* value is set once by the
   exporter and not also by the importer, and save/`canonical()` effects. Because of those I would not start here; the
   workaround (a shared place plus a relation) is working and tested. Prefer a rule module instead: a single canonical
   measure `away(group)` in `data/rules/dominion.kyr`, which all modules already share (a `shared` function keeps its
   name, `:28`), is a pure-data change. That is "shared canonical measures" and needs no ModuleNamespace edit. Cost: a
   `dominion` edit forces `web:build` and every module sees the measure.

### (d) Tests

R6: `test/factors-handoff.test.ts`, `test/exchange-responds.test.ts`. Shared measure in `dominion.kyr`: those plus
`test/all-in-one-world.test.ts` (CI) and `test/repository.test.ts` (`web:build`).

### (e) Risk/effort

R6: no re-seed, **S**. Shared measure in `dominion.kyr`: no re-seed, **S**. Import aliasing: **M-L**, medium risk.

### (f) Use

```json
"herald": { "scenario": "factors.scenario.json", "exports": ["ring", { "principal": "ring_head" }] }
```

---

## 8. Item 7: agent routes to a not-yet-installed region; Pursuit through hidden doors

### (a) Blocked

Ring **R1** (measured; the best evidence in the repo): (a) a `Pursuit ... seeks at(ring_head, X) using go` toward the
bonded store "never moved in twelve days: the store's doors are `hidden until` facts and the planner does not take a
hidden way"; (b) a target in a country not yet installed "cannot be named, and Tolleth is installed only when a company
first stands at its way in". Same shape: A10 (Orsett, "the Wednesday boat", no province to seed), friction 16.

### (b) Where

Planner: `src/campaign/planner.ts:9-41` (operators = actions; `Planner.applicable` tests `requires`). The `go` action's
`requires` includes `passable(way, actor)` (`data/rules/passages.kyr:84-86`) and `passable` includes
`visibleTo(w, a)` (`passages.kyr:51`): `not revealedBy(w, ?f) or (revealedBy(w, ?f) and knows(a, ?f))`. `knows(a, ?f)` for
an NPC pursuer is false, so a `hidden until` way is invisible to its planning. Off-stage movement:
`dominion.kyr:32-41`: `depart` / `arrive` over a `byway` (`bywayFrom/To/Time`, `knowsWay`, `travelling`).

### (c) Design

7a. **Foreknowledge of a hidden way (S, rule data).**

```kyr
// data/rules/passages.kyr:51, extend
Relation foreknows(group, passage).
Query visibleTo(w: passage, a: group) means not revealedBy(w, ?f) or (revealedBy(w, ?f) and knows(a, ?f)) or foreknows(a, w).
```

Author: `Initially Assert foreknows(ring_head, store_door).` The Principal's planner then takes the door; the company still
cannot see it. Gate: `foreknows` is asserted in no existing module, so the new `or` is false everywhere else.
Caveat: `passages.kyr` is in `world`, so every module recompiles and `web:build` is needed. (`visibleTo` is also read by
`inhabitants.kyr:152,245`; same extra disjunct, same gate.)

7b. **A destination that is not installed yet (no engine change; document and test).** Declare a stand-in place in the
agent's own module and a byway to it:

```kyr
Place beyond_tolleth "Beyond Tolleth" is room.            // offstage stand-in, like `abroad`
Entity ring_road: byway. Initially Assert bywayFrom(ring_road, quay). Initially Assert bywayTo(ring_road, beyond_tolleth).
Initially Set bywayTime(ring_road) to 72.  Initially Assert knowsWay(ring_head, ring_road).
```

The agent departs, is `travelling` (out of sight), and arrives after `bywayTime`; a country that installs later can
*move* him out of the stand-in by a rule keyed on a herald fact (the existing herald pattern). This is what
`11-technical-report.md` §11.4 wanted ("a carter can be somewhere on the road to Corran"). **UNVERIFIED:** no test plays a
byway end to end in this branch (`grep byway test/` finds one fixture, `test/fixtures/march/conflicts/register-of-names`).
Write that test before relying on it.

A *first-class* "byway to a named uninstalled region" (resolve the target when the region installs) would be a change in
`Frontier.expand` and the importer; **L**, and I would not do it before 7b is tried.

### (d) Tests

Local: `test/exchange-responds.test.ts`, `test/factors-handoff.test.ts`, new `test/ring-pursuit.test.ts` (Principal reaches
the store through a foreknown door; byway round trip). CI: `test/the-dorothea.test.ts`, `all-in-one-world`.

### (e) Risk/effort

7a: **S**, no re-seed, but **it changes the compiled `world` rules**: re-run `web:build`. 7b: **S** (a test and a doc).
Ring friction **R8** (a `Refuge` un-routes at first light, `inhabitants.kyr` `temper_rallies`) is a data trap that a pursuing
Principal would hit; document it with this change.

### (f) Use; Dorothea example

See above; `Initially Assert foreknows(ring_head, store_door)` in `ring.kyr` lets the Principal's round be a `Pursuit`
(R1's deferred design) instead of timers.

---

## 9. Item 8: kits for adventure manifests

### (a) Blocked

`11-technical-report.md` §11.2: "a kit is requested only in a campaign or framework manifest. An adventure's
`placed.json`/`countries.json` entry has no `kits:` key." So a province cannot get a bounty board, a toll road or a raider
hold composed into it the way a generated region can.

### (b) Where

Kits are `KitEntry { kit, id, fix?, optional? }` in a *campaign* manifest's `modules` (`composition.ts:13`), expanded by
`Composition.expand` (`:41`) against a ledger of modules that carry an `assembly` block
(`Composition.region`, `:75-86`: `manifest.assembly.commitments`, e.g. `['terrain','region',t]` in
`region-writer.ts:254`). A province installs through `Frontier.province` (`frontier.ts:81-95`) with no composition.
**`Composition.introduce` (`:61-71`) already exists** ("Places a kit into a campaign already composed ... The modules it
returns are installed into the running campaign") and, by grep, **no code under `src/` outside `compose/` calls it**
(UNVERIFIED whether the CLI or a test does).

### (c) Design

Two uses, different cost.

8a. **Standalone adventure campaigns already work** with no engine change: list the kit after the module in the
campaign manifest and give the adventure's `module.json` an `assembly: { commitments: [...] }` block (the Dorothea's has
none). Document it. Test with a fixture campaign.

8b. **Province installs (M-L):**

```ts
// countries.ts, Country: kits?: { kit: string; id: string; fix?: Record<string,string>; optional?: boolean }[]
// frontier.ts province(), after the adventure and link install:
for (const k of country.kits ?? []) {
  const placed = await Composition.introduce(manifestPath, { ...k, id: `${install}${k.id}` }, { seed: this.seed, source: this.base });
  for (const request of placed.placement?.modules ?? []) { await campaign.install(request, this.base, false, true); }
}
```

Open problems (**UNVERIFIED**): `introduce` needs a campaign *manifest path* to rebuild the ledger, but a generated world
is a written manifest (`world-assembler.ts:126-130`) whose ledger must also contain the province's `assembly`
commitments; the kit's slots must bind to the province's exported places; the kit's Deem tables must have rows for the
province's terrain (the desert commit added rows to the kit `tables.json` files; a new terrain like `jungle` would need
them too, or be omitted from the kit's `terrain` context via the item 1 mapping).

**Gate.** `country.kits` is undefined for every current entry.

### (d) Tests

Local: `test/frontier.test.ts`, `test/provinces.test.ts`, compose tests (`ls test | grep compose`). CI: the rest.

### (e) Risk/effort

8a **S**. 8b **M-L**; no re-seed (the new path runs only for a country with `kits`), and a kit placed mid-play at install
draws from the world seed, so each world's result is stable per seed.

### (f) Use

```json
{ "id": "tolleth", "kits": [{ "kit": "data/kits/bounty/kit.json", "id": "tbounty", "optional": true }] }
```

---

## 10. Item 9: `hasCalling` portability

### (a) Blocked

Gosse friction row 1 and Dorothea friction **17**: `hasCalling(?m, calling_cleric)` in a module's rule fires in a
one-module campaign but never in the four-module standalone campaign: "the party's `hasCalling` facts name
`westmarch__calling_cleric` (the last module's install), `pentrice__calling_cleric` is a distinct, unattached entity." The
Dorothea's calling-keyed voices work in the Dorothea-only campaigns (tested) but the Dorothea is also installed in
generated worlds, where I found **no test** that its voices fire (UNVERIFIED).

### (b) Root cause (read, not run)

`ModuleNamespace.canonical` (`module-namespace.ts:18-21`) lists catalog-backed entity types whose ids are the same in
every installation. `callingkind` is **not in it** (`terrainkind`, `capability`, `difficulty` are). So each installed
module that includes `core.kyr` (`Entity calling_cleric: callingkind "cleric"`, `core.kyr:113-116`) gets its own
`<install>__calling_cleric`. The projection then picks one: `creature-facts.ts:115`,
`callings: new Map(entities.filter(e => e.type === 'callingkind').map(e => [e.id.replace(/^.*__calling_/, ''), e.id]))`,
and a `Map` built this way keeps the **last** entity for each class. A module whose own id is not the last one writes
rules against an id nobody is given.

### (c) Design (three options; the third is my recommendation)

* *Make `callingkind` canonical* (add it to `canonical`): the right end state, but it renames every `x__calling_y` entity
  and every `hasCalling` fact in **every** world and saved game. It changes `canonical()` strings, digests, kept traces and
  browser saves. **Do not.**
* *Project every variant*: `callings: Map<string, string[]>` and `this.set(scope, 'hasCalling', reference, variants)` (the
  `set` helper already takes an array, `creature-facts.ts:222`). Correct, but adds `hasCalling` facts to every
  multi-module campaign, which changes `world.key()`, planner state and the kept trace digests. **Unsafe unless gated.**
* **Gate it by a campaign-manifest key (recommended, M):**

```ts
// CampaignManifest (module-bundle.ts:31): portableCallings?: boolean
// creature-facts.ts:115: callings values become string[]; the extra variants are emitted only when scope says so:
const variants = scope.portableCallings ? all : [last];            // `last` is today's single element
```

  Authors opt in per campaign; every existing manifest omits it, so the projection is byte-identical. I could not
  determine how `scope` receives manifest flags (**UNVERIFIED**; `Scope` is built from `declared(world.module)`, which
  has no manifest handle).

* **Until then (S, docs, free):** say in `04-authorability.md` and the Kyr guide that the portable forms are
  `capable(party, <capability>)` and, within a single-module campaign, `hasCalling`. Gosse's rewrite to
  `capable(party, performance|rites|lockwork|intimidation|woodcraft|perception)` is the evidence that it works.
  `memberOf(?m, party)` and `{?m}` printing must be kept (`11-technical-report.md` §11.6).

### (d) Tests

Local: `test/callings.test.ts`, `test/liberty-of-the-ice-callings.test.ts`, `test/dorothea-voices.test.ts`. CI:
`all-in-one-world`, `traces`, `digest`, `seeds-load` (the gate must prove byte-identical output without the key).

### (e) Risk / effort

**M**, and the only item in this list where a mistake changes existing digests. Docs first.

### (f) Use

`"portableCallings": true` in a campaign manifest; rules unchanged (`hasCalling(?m, calling_ranger)`).

---

## 11. Item 10: the generated-institution gaps from `ring-friction.md`

The Ring's institution (the Founders' Exchange, factors, cell, lieutenant, Principal) is generated by Deem at assembly
(`17-the-ring.md` §17.5). The gaps, with status:

| Ring row | Gap | Fix | Size | Where |
|---|---|---|---|---|
| R17 | Deem draws are sequential: adding a rank re-rolled every world's `run/stock/muscle`. | **Process, not code**: new draws go last, as `"*ring": "=gen(factors_ring)"`, with `">casting"`, `">initial"` overlays. Write it down in `doc/architecture/content-authoring.md`; add a one-seed regression test asserting the Exchange's measures are unchanged when a rank is added. | S | `data/goings-on/factors/*`, `test/exchange-responds.test.ts` |
| R6 | Herald binds export name = import name. | §7 step 1. | S | `countries.ts:32`, `frontier.ts:151` |
| R5 | A measure cannot be read across two modules. | §7 step 2 / shared measure in `dominion.kyr`. | S / M-L | `dominion.kyr`, `module-namespace.ts` |
| R1 | Pursuit cannot use a `hidden until` way or name an uninstalled place. | §8. | S | `passages.kyr:51` |
| R8 | `routed` is not permanent for anyone with a `Refuge`; `inhabitants.kyr` retracts it at first light (`temper_rallies`). | Docs now; later a `Fallen` fact the rally rule respects. | S | `data/rules/inhabitants.kyr` |
| R2 | A fair fight for a level-1 company: a generated level 4-5 head is lethal; no way to see the odds. | `bin/kyrie forecast <campaign.json>` exists ("each band against novices of each calling", per `bin/kyrie help`). Document how to run it on a generated world's written manifest; **UNVERIFIED** that it accepts one. A `breaks at half` line for bands (A15) is the authoring half. | S | `src/cli` |
| R3 | The institution cannot know what the company did without a hand-made trace per act. | `Notices when ...` (§11.4 of the technical report): a declaration of what a person perceives, read as `perceived(person, act)`. New grammar. | M | `Kyr.ohm`, `inhabitants.kyr` |
| R4 | No "hurt someone to make him tell" action. | Content decision; not an engine change. | -- | -- |
| R12 | The standalone Dorothea has no ring (stand-ins). | By design; documented. | -- | -- |
| 17.6 | The institution exists only in countries that exist. | §8 7b. | S | -- |

None of these re-seeds a world by itself. R17 is the one that already did, and the fix is process.

---

## 12. Item 11: a test-level `Journey` option to pin `dice()`

### (a) Blocked

Friction **15**: fixed-timeline tests break the moment a chance table exists (seven failed); the author must invent a
`seaQuiet` relation (`weather.kyr:6`) and every module that has chance does the same. `Journey.roll('pass'|'fail')`
(`journey.ts:288-290`, `campaign.forced`) pins *checks* only; `dice(x)` is separate.

### (b) Where

`World.die` (`world.ts:164-170`), `CampaignTick.clock` (`campaign-tick.ts:66-69`), `Campaign` (`campaign.ts:39` has
`forced`; `:79,391` call `CampaignTick.clock(this.world, this.current)`), `Journey.roll` (`journey.ts:290`).

### (c) Design (S)

Encode a pin as a negative `dice(clock)`: a real roll is 1-100, so a negative value can only come from a test.

```ts
// campaign.ts, next to `forced`:         dicePin?: number;
// campaign.ts:79,391:                    CampaignTick.clock(this.world, { ...this.current, ...this.dicePin ? { pin: this.dicePin } : {} })
// campaign-tick.ts:66-69:                value: ModuleWriter.number(pin !== undefined ? -pin : new Expressions(...).number('1d100'))
// world.ts:164 die(of):                  const base = this.reading('dice'); if (base < 0) { return -base; }
// journey.ts:                            dice(n?: number) { this.campaign.dicePin = n; }
```

(`die` returns the pin for every thing, so `dice(hull) > 25` is true for `dice(99)`: "no event this watch".)

**Gate.** `dicePin` is undefined unless a test calls `Journey.dice(n)`; `die` returns the hash unless `dice(clock) < 0`,
which no real roll produces; the tick expression is unchanged when `pin` is undefined. Because `world.ts` is under
`src/lang`, the parse cache goes cold once; batch with items 4 and 5.

### (d) Tests

Local: `test/journey-test-aids.test.ts` (add: pinning at 99 for N watches yields no event; at 3 yields the squall),
`test/dorothea-sea.test.ts` (replace `seaQuiet` with `j.dice(99)`). CI: everything else (the cold cache).

### (e) Risk/effort

**S**, no re-seed, no production path touched. A subtlety: a world loaded from a save inside a pinned test keeps the
negative `dice(clock)` in its facts; tests only.

### (f) Use

```ts
const j = await Journey.start('data/campaigns/the-dorothea.campaign.json'); j.dice(99);   // no chance event ever
j.dice(3);                                                                                   // the squall, every watch
j.dice();                                                                                    // let it fall again
```

---

## 13. Item 12: anything else recurring in the friction files

Counted by how many adventures hit it, with the smallest repair and where. Sizes as above.

| Recurs | Friction | Smallest repair | Where | Size |
|---|---|---|---|---|
| 5 adventures (Thrume 1, Hessel, Quittance 1, Parliament 1, Liberty 2) + Gosse | `befell(slack_opened)` fails at load: "Invalid argument ... in befell(...)"; the event must also be named in `canon` | Make the error say so: in the message built at `module-compiler.ts:243`, when the call is `befell` and the unknown arg is a canon event id, append "name it in the manifest's `canon` list (module.json and placed.json)". Pure message. | `module-compiler.ts:243` | S |
| 4 (Thrume 6, Parliament 2, ...) | `holding(actor, <catalog kind>)` in an `Observe` is "Invalid argument" though fine in `Requires` | Resolve catalog kinds in every condition position (a name-resolution path difference). | `module-compiler.ts` near `:243` | M, UNVERIFIED |
| 4 (Liberty 3, Carth 4, HTG, Hessel) | no way to read what an Observe printed without `screen().prose` | `Journey.seen(text)` helper. | `journey.ts:235` | S |
| 3 (Thrume 3, Parliament 4, HTG) | `Journey.choices()` is empty in a fight; `session.perform(command, runner)` is the workaround | `Journey.fight(runner = 'melee')`. | `journey.ts` | S |
| 3 (Liberty 1, Quittance 4, Gosse) | preset party size is fixed (`of 1`) | `Journey.start(..., { party })` already exists (`journey.ts:66-69`): document it. | docs | S |
| 3 (friction 4, A4, A11) | `Decrease` below zero hides the action; two `Give` in one effect list give one item | Clamp by default (or lint error); `Give 2 kind`. | `world.ts` `apply`, lint `author-lint.ts:26` | M (semantics; opt-in `or to nothing` exists) |
| 4 (A9, lore 3, #10, Thrume 7) | global person/kind/relation names | Lint already refuses duplicates; module-qualified names are a language change. Leave. | -- | L |
| 2 (friction 7, 11, A5) | hand-made clocks and timer tests colliding | `Clock <name> ticks every N` with `after`/`within`. New grammar. | `Kyr.ohm` | M |
| 2 (A3) | an `opening when` shuts at both ends | `opening ... shuts behind` side. | `world-constructs.ts` `opening` | S-M |
| 2 (A8, friction 2) | `Reset <relations>`; `Hazard` after a failed action | new constructs | `Kyr.ohm` | M |
| 2 (friction 3, HTG, Hollins) | `nowhere` per module | a built-in `nowhere` in `core.kyr` would collide with every module that declares one: **do not**; a lint tip is safer | -- | skip |
| 3 (Thrume 9, Parliament 5, 11.6) | backgrounds/races not projected | project `hasKind`/`hasBackground` in `creature-facts.ts` (same gating problem as item 9: extra facts) | `creature-facts.ts` | M, digest risk |
| 1 (friction 9) | adding a province re-seeds every drawn world | not solvable without changing `Gates.make`'s incremental `taken` list (`gates.ts:20-26`); mitigate with `kyrie countries --diff` | -- | L |
| 1 (A15, Ring R2, Thrume 4) | no gradient for combat difficulty; level-1 presets die | `bin/kyrie forecast`; a danger rating in lint | `src/cli` | M |
| 1 (Gosse 2) | `Give` leaves `owned by` | clear ownership on `Give` (`Consequences.hand`) | `consequences.ts` | S, semantic |

---

## 14. Plan

**PR 0 (free, docs):** correct `friction.md` #8 and `11-technical-report.md` §11.1 (`Time <measure>` works); add the
portable-calling note; document `within`/`terrain`/`landform` and `byway`; document `Journey.roll`.

**PR 1: terrain kinds (item 1).** Chosen as the first PR because:
* it answers the user's first ask (volcano, jungle, salt flat, reef) and removes two hand-kept room lists (A1, A16);
* it is the only change whose gate is a *new string nothing draws* (the `a51750a` shape), so it can be proven by reading;
* it touches no generator, no grammar (no cold parse cache) and no digest I know of;
* its tests are small: `land-map`, `authored-land`, `desert-country` (as a shape), a new environment-mapping test,
  `repository` after `web:build`; the browser specs go to CI;
* it is the prerequisite for item 2A (the ids `archipelago`, `volcano`).

**PR 2: archipelago chart (2A)** on top of it. **PR 3 ("batch A", `src/lang` together):** `Time` arithmetic, `Table` /
`draws`, `Journey.dice`. **PR 4:** small authoring (befell hint, herald rename, `foreknows`, `Journey.seen/fight`).
**PR 5:** `vessels` rule module and, separately, the Dorothea migration. **PR 6:** forced coast (2B, re-seeds nothing),
then `shore` on Tolleth only when the maintainers accept re-recording. **Later / on demand:** kits for provinces,
cross-module measures, the `hasCalling` gate, generated archipelago terrain.

### What to run locally vs in CI

*Local, every time (seconds to a couple of minutes):* `bun run typecheck`; `bun run lint`; `bun run test:changed`;
`bin/kyrie countries --diff` and the 20-seed `kyrie world --json | sha256sum` loop for anything under `src/world`;
`bin/kyrie lint data/campaigns/the-dorothea.campaign.json` (path UNVERIFIED); and, per PR, only the files named in that
PR's section (d).

*CI only:* the full 5-shard suite; `traces`, `digest`, `seeds-load`, `all-in-one-world`, `frontier-replay`,
`desert-country`; the browser specs (`board-browser`, `map-browser`, `reader-browser`, ...); the long descents.

### What I could not determine

* Orsino's accepted `environment` values (external registry, not in this checkout): the item 1 mapping assumes the set in
  `environment.ts`'s header.
* Whether the 3-D board draws a road or path across wet hexes, and its cost for a 100 x 60 cell land (read `path-reach.ts`,
  `board-paths.ts`, `hex-grid.ts`).
* Whether adding entities to `core.kyr` moves any digest (expected not; unproven).
* The exact helper names for binding `Value`s in `module-namespace.ts:76` / `action-schemas.ts:128` (item 5).
* Whether the `vessels.kyr` sketch compiles as written (it copies `dominion.kyr`'s shapes).
* How a manifest flag reaches `creature-facts.ts`'s `Scope` (item 9), and the loader's treatment of an unbound function
  import (item 7 step 2).
* Whether `Composition.introduce` is reachable from a generated world's manifest (item 8b).
* That the Dorothea's calling voices fire inside a generated world (no test found); and that `bin/kyrie forecast`
  accepts a generated world's manifest.
* No suite was run. The only execution was a scratch module in the session scratchpad confirming that
  `Time interest(party).` waits the measure and `Time interest(party) + 2.` does not parse.
