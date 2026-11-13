# Mission 18: the Grand Tour in the shared world

The owner's addendum of 2026-10-29 asked for the new adventure on `adventure/grand-tour` to be read for how it would
sit in one world: the same canonical planes and the same metropolitan geography, not a Plane of Fire of its own or a
House of Doors of its own. The owner's vision is of the House of Doors as a restricted precinct of the mages' college,
its dangerous upper galleries opened later by an artifact rebuilt from elemental parts. The author's design is to be
kept, and compatibility questions raised before anything is rewritten. Nothing here changes the adventure.

## What it is

Sennet is a port in three storeys. On the bay are the quays, the glass-houses and, on the headland, the House of Doors,
whose doors open on the elemental planes. Above the cloud is Cloudgate, a hill of the old city lifted into the sky two
hundred years ago. Under the bay is the Whelm, the lower town the sea came into when the hill went up, where the
merfolk live in the drowned shops.

Twelve days before play begins, Rector Isadora Quance proclaimed the first Grand Tour in two hundred years: bring her
the four petals of the Rose of the Winds, each asked of its court in its own fashion, and be first through the Door of
Doors. The same night her best student, Perrin Halyard, went over Cloudgate's rail in the fog. A merfolk girl caught
him, and he lives in an air-bell under the bay.

The campaign begins with Tamsin, a bard, at the top of the coast road on the 9th of June 1290. It has seven days, a
contest with rivals, a case (the fall), and the Undertow (an Aenean tide-engine under the Whelm). It has eleven
endings and a closing account of some forty-five fates. In numbers: seventy-six places in three storeys and three
planes, thirty-three people, twenty-three threads, sixty-three actions and a hundred and forty-six topics, in about
2,900 lines of Kyr.

## Its places and planes

| | Where | Reached |
|---|---|---|
| **The House of Doors** | A college on Sennet's headland: the college gate, the quad, the Hall of Doors, the museum, the chapel, the Rector's study, and a tower stair up to the Nexus | The Hall by the quad; the tower by the Rector's key or the cat's flap |
| **The Fire Door, the Earth Door** | In the Hall of Doors, kept by Doorwarden Tench | Through Tench |
| **The Air Door** | In Cloudgate's wind court, behind the Halyards' bar | With leave, with Aubrey, or by breaking it |
| **The Water petal** | Held in the Whelm; no Water Door is built | Through the merfolk |
| **The Plane of Fire** | `fire_world`, the Hour Court (`hour_land`); law `plane_gehenna` | The Fire Door |
| **The Plane of Earth** | `earth_world`, the Slow Assembly, unlit; no law | The Earth Door |
| **The Plane of Air** | `air_world`: the threshold, the Gallery, the eyrie; law `plane_pandemonium` | The Air Door; an updraught once talked of |
| **The Door of Doors** | In the Nexus at the top of the tower | The Rose whole |

The `doorward` can `open_on` a door and `knock_home`. The petals are the story's state (`state.kyr`). The Rose
assembled opens the Door of Doors (`door.kyr`).

## How it attaches to the world now

Sennet is a province of the first country, in the way Gate B attaches the Strewnfield. `countries.json` gives it
`province: true`, `side: east` and marsh terrain. `Provinces.situate` places its way in on the country's own land, and
`RegionGates` writes that way in as a gate room, `gate_sennet`, joined to the nearest town by a road. The Rector's
notice is nailed up wherever travellers are kept, and the keeper answers about the Grand Tour. At the gate,
`Frontier.expand` installs the module as `psennet` within `region__region`. When the book closes, the city stays: the
ending closes the chapter only. The branch generalises a march's notice and after-word to a province
(`region-borders.ts`, `region-gates.ts`), and adds `--as` and `--probe` to `kyrie play`.

The branch forks from 87f57dd. Merged onto today's main (22ebb73) in a scratch worktree, it conflicts only in
`web/bundles.generated.json`, which is generated. With that index written again, its own six suites pass: 30 tests,
136 expectations, in about nine minutes. The full gate has not been run on the merged tree.

## Against the owner's vision

The House of Doors is already a college, with a Rector, its students, a museum, a chapel and a guarded hall: in
spirit, the precinct the owner describes. The Rose of the Winds is already an artifact rebuilt from four elemental
parts, and what it opens is the Door of Doors at the top of the tower. That is close to the dangerous upper galleries
opened later, with three differences:

- In the Grand Tour the Rose is rebuilt within one week's contest and its opening is the climax. In the owner's
  vision, the opening is the start of what later adventures find.
- The adventure's House is Sennet's. The owner's House belongs to the mages' college of the shared world.
- The planes are the adventure's own. Their ids are private to the module and installed only when Sennet is reached.

## Where it meets the shared world

1. **Its planes are its own.** `fire_world`, `hour_land`, `earth_world` and `air_world` are namespaced to the module
   (`psennet__…`) once installed. Another adventure's visit to the Plane of Fire would be a different place.
2. **It cannot be referred to before arrival.** The module installs lazily at its gate, so no other module can name the
   House of Doors, the Rose or the Rector before the company has walked into Sennet.
3. **The planes' laws are unprefixed.** `plane_gehenna` (Fire) and `plane_pandemonium` (Air) are world-level names. A
   second module declaring either must declare it identically.
4. **`licence_kind` collides.** The Grand Tour declares a `licence_kind` of its own. Hessel's `banns.kyr:99` already
   declares one: a marriage licence from the surrogate at Orm.
5. **New shared conditions.** `breath` (for the Whelm) and `heatproof` (for the Fire) are declared unprefixed in the
   adventure, not in the catalog.
6. **Imbar is declared more than once.** Several adventures each declare their own `imbar`. The Grand Tour is one more.
7. **The Water Door is spoken of but not built.** The Air Door stands in Cloudgate, outside the House.

## Questions for the owner and the author

1. Is Sennet the city of the mages' college? Or is it a port province apart from the City of Seven Towers, which would
   keep a college and a House of Doors of its own?
2. Should the elemental planes be world-owned, with one Plane of Fire for every module, and the Hour Court, the Slow
   Assembly and the Gallery placed in them by this adventure?
3. Are those three courts canonical, the courts any visitor to their planes would find, or this adventure's?
4. The Plane of Water: is it built later as a canonical plane, or does the Whelm stand for it?
5. Should the Air Door stay in Cloudgate (the author's design), or be one of the doors of the House's precinct?
6. Are Gehenna and Pandemonium the canonical natures of Fire and Air, or this adventure's?
7. Is the Nexus the first of the House's upper galleries, with the Door of Doors opening the rest?
8. Once the Rose is whole and the Door opened, does it stay open for later adventures? Can the Rose be broken and
   rebuilt?
9. Which outcomes should other modules see: Cloudgate up or down, the Second Whelming, the Rector's fate, Perrin's?
10. Which `licence_kind` is renamed, the Grand Tour's or Hessel's?
11. Should there be one Imbar entity, owned by the world, rather than one declared in each adventure?
12. May the Doorward `open_on` any plane in the shared world, or only those this adventure builds?
13. Should `breath` and `heatproof` go into the catalog for every module?

## A way through, once answered

Nothing in the adventure needs rewriting to keep its design. A suggested order:

1. Merge the branch as it stands, with the bundle index written again and the full gate run.
2. Settle the names (questions 10, 11 and 13).
3. Add a world-owned planes module with canonical ids. The adventure's courts become placements within those planes
   (B4's declarative placement) rather than planes of their own.
4. Make the House of Doors a canonical institution, in Sennet or in the metropolis depending on question 1, with the
   Nexus as its first upper gallery.
5. Make the Rose whole and the Door opened world facts for later modules (Gate B7: one clock and world state across
   modules).
