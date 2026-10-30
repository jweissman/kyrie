# Mission 18: one universe

The owner's directive of 2026-10-30 (register OWN-31 to OWN-38) asks that every adventure take place in one coherent
universe. The planes are world-owned and unique. Gehenna and Pandemonium are outer planes, never the names of Fire and
Air. There is one House of Doors. Imbar, the House, the City of Seven Towers and the Infinite Library have an identity
before any adventure is installed. The Grand Tour's imaginative geography, people and dramatic structure are kept.

This is the design. It rests on a read-only investigation of main at 827354c and of the Grand Tour's branch (five
readers, each checked by a second), and on an author-proxy's reading of the Grand Tour's own documents. The evidence
is in the investigation's reports; the claims below that matter are cited.

## What there is now

**No canonical identity for places.** An installed module's ids are scoped to it (`<install>__id`) unless they are
of a catalog type (a law, a capability, an element), a manifest `global`, or an import
(`src/campaign/module-namespace.ts:19-29`). In practice the only global is `party`. Relations shared between
modules are only those of the shared rules (`:30-33`).

**Imbar is six private planes.** Hessel, A Winter in Carth, Wrayford, What Tessary Owes, The Liberty of the Ice and
The Patient Star each declare `Place imbar "Imbar" is plane`. Installed, these are `x1y0__imbar`, `x0y1__imbar`
and so on: six planes named Imbar, with nothing to say they are one. The generated countries between them lie in no
plane at all (`src/world/region-writer.ts:141`). So the road over a march into one of those adventures is told as a
crossing between planes (`src/ui/passages.ts:30-33`). The Grand Tour declares no Imbar, contrary to the first reading.

**The planes are the Grand Tour's own.** `fire_world`, `earth_world` and `air_world` are declared as planes in its
module. Its Hour Court is governed by the catalog's `plane_gehenna` and its Gallery by `plane_pandemonium`
(`fire.kyr:7-8`, `air.kyr:7-8`). Those are Orsino's outer planes, with a spell DC of −1, and they would be shown by
those names in a fight. The catalog has no condition for an elemental or energy plane. Orsino's lore names none of
the inner planes, and no House of Doors, college or Infinite Library either. The only canon for Dun Rì is a waystone
that "may point the way to Dun Rì, the city of seven towers".

**The Infinite Library is not a plane.** It is A Parliament of Books's own rooms: the Commonplace, a top-level region
of that module with `elsewhere` for shelter, and in it the Stacks, two wildernesses of fifteen rooms
(`parliament-of-books/commonplace.kyr:4-12`, `stacks.kyr:5-21`). "The rest of the Library" is one sealed room. Its
Hexagon of Doors leads to Cthelll and the Mount of the Exalted, which are wildernesses of a module region, not
planes. Nothing of it is exported; no second module could add to it. Its own fiction already invites sharing: every
city that writes has a Commonplace.

**What already works.** A manifest `global` that an installed module exports is bound to that module's entity, in
any order of installation (`src/campaign/module-bundle.ts:166-171`). The second declaration is dropped after its
type is checked (`src/campaign/module-installations.ts:85-105`). No module has used this for anything but the
company. Laws pass down through every enclosing place (`src/campaign/environment.ts:26-31`).

## The design

### A world-owned canon, installed first

`data/imbar/` is a module that every campaign and every generated world installs first. It declares every canonical
entity once, lists each in its `globals` and exports it. It holds two kinds of entity.

- **Canonical places.** Imbar, the material plane. The six inner planes: Fire, Air, Earth, Water, and the Positive
  and Negative Energy Planes. The outer planes: Orsino's nine (Arcadia, Cthell, Gehenna, Hades, Limbo, Mechanus,
  Pandemonium, Ysgard, Zephyrus) and the owner's Abyss and Nirvana. The Infinite Library. The upper House beyond the
  Door of Doors.
  - Only regions may stand in a plane (`src/spatial.ts:143`). So each plane has one canonical region and in it a
    canonical threshold. Doors from elsewhere arrive at the threshold, and authors attach to it.
  - The threshold is all the canon builds. A plane's courts, cities and wastes are whatever authors add.
- **Canonical identities that are not yet places.** The mages' college. The House of Doors. The City of Seven Towers.
  The Rose of the Winds. The Rector's office. A set of world events that other modules may read. Each can be named
  now, before any place for it is built.
  - Where an adventure builds a place for one, it says so with a shared relation, `seatOf(identity, place)`.
  - This keeps an entity's existence and identity apart from its detailed content, from what the protagonist knows of
    it, and from the routes to it (OWN-35).

The relations that cross modules (`seatOf`, `befell`, and those a canonical place needs) are declared in a shared
rules file, `data/rules/canon.kyr`. That file declares relations only. It has no entities and no Initially facts,
because the shared rules' facts are applied again at every installation, which would undo a world event.

### Extending, not redeclaring

A module names the canonical ids it uses in its manifest: `"canon": ["inner_fire", "house_of_doors"]`. The loader
gives the module the canonical declarations from the one source and binds them as globals, so the author writes no
stand-in. A module that declares a canonical id of its own is refused, naming the id and the canon.

A module may add regions within a canonical plane. It may add passages to a canonical threshold, and assert shared
relations of a canonical entity. It may not put a law on a canonical place: that law would hold for every author's
places within it. Its local laws go on its own places.

Two modules extending the Plane of Fire therefore name one entity. Their regions are siblings within it, both joined
to the plane's threshold, and a company that comes through any Fire door can walk from one to the other.

### Imbar

The six adventures bind the canonical `imbar` instead of declaring it. Each generated country is a region within
Imbar. Marches stop reading as planar crossings. When a province is nested, only its material region is re-parented
into the host country, never an `elsewhere` region such as the Commonplace or Thrume's Between
(`src/campaign/module-bundle.ts:306-310`).

### Inner and outer planes

- **Elemental planes carry no plane-wide law yet.** One may be written into canon later, for every author.
- **Outer planes carry Orsino's laws.** Gehenna and the rest keep their `plane_*` conditions, marked as laws, on the
  canonical outer planes, where they belong.
- **The Grand Tour's −1 to spell DCs stays, under the courts' own names.** It becomes local laws, `hour_court_law`
  and `gallery_law` (after `unlit_law`), on its courts.
- **Spelling.** The canonical plane is spelt "Cthell", as the owner wrote it. The catalog keeps its condition id
  `plane_cthelll` for its provenance.
- **Parliament's realms move into the planes they name.** The Mount of the Exalted becomes a region within its
  canonical outer plane. Parliament's Cthelll becomes a region within Cthell.

### The House of Doors: one House, at Sennet, of the college at Dun Rì

The Grand Tour's geography ties the doors to Sennet's ground:

- the Fire and Earth Doors are in the Hall;
- the Air Door is in Cloudgate;
- the Water Door is in the drowned town;
- the Aeneans' tide-engine drives a shaft up through the headland to the Nexus;
- the Door of Doors is at the top of the Rector's own tower.

So the one House stands at Sennet. It is the restricted precinct of the mages' college, and the college's principal
seat is Dun Rì, the City of Seven Towers. This is the owner's "a distinct port with an established college
dependency": the dependency is the House itself.

- **The college and its foundation.** The Collegium of Veyra, which the Handbook already names as the body that
  keeps the House, becomes the college's foundation at Sennet. Rector Isadora Quance keeps her office. The House's
  lower precinct is licensed and paid for, as the author's satire needs: the Hall with the Fire and Earth Doors, the
  Air Door at Cloudgate kept by the Halyards, and a Water Door from the Undercroft. Its upper precinct is sealed.
- **What it costs.** About six lines of the adventure change. Keeping the House at Dun Rì instead would cost most of
  the Grand Tour's Acts IV and V. One reading of OWN-33 is assumed here and reported below.
- **Low Water's Collegium of Lesser Instruments at Corran** becomes another foundation of the same college, not a
  rival. Hessel's College of Physicians is not a mages' college.

### The Rose and the upper House

The whole Rose opens the Door of Doors. Its far side is the canonical upper House: a first gallery, and sealed doors
in it to the outer planes.

- **The opening is a world event, and nothing resets it.** `befell(door_of_doors_opened)` is asserted, and the Rose
  is not reset at any ending.
- **No outer plane becomes reachable or safe by it.** Their doors stay sealed until a later story opens them.
- **The Undertow holds the Door open only while the Aeneans' engine turns**, a day and a night, after the author-
  proxy's reading. The company can still go through first. Only the whole Rose opens the upper House for good.
- **The Doorward opens only on places within Imbar** where the company has stood. It knocks home only from Imbar.
  It never opens on the upper House or on another plane.

### The Grand Tour's courts in the canonical planes

- **The courts become regions within the canonical planes.** Each keeps its rooms, people and rules. Its region is
  renamed from "the Plane of Fire" to the court's own name. Its queries (`inFire()` and the rest) read only that
  region, so its heat, its carrying-out and its keeper's let-out never reach another author's part of the plane.
- **Each court is joined to its plane's threshold.** That joining is the only change to its routes.
- **Text that says a court is the whole plane is softened.** "Nothing in the Fire lasts more than an hour" becomes
  "Nothing in the Hour Court". The Handbook's tourist headings stay as the guidebook's voice.
- **The canonical Plane of Water is not the Whelm.** The Court of Waters, which the merfolk's grandmothers left, is a
  canonical place in it. The Grand Tour names it but does not build it. The Water Door goes from the Undercroft to
  the plane's threshold; it is shut but by No Admittance's leave, and opened in the Coming Down.
- **Its outcomes become world events.** Among them: the Rose made whole, the Door of Doors opened, Cloudgate fallen,
  the Whelm crushed or emptied, the merfolk gone home, the Rector's fate and Perrin's. Other modules read them by
  `befell`.

### The week, the world's clock and the ordinary player

- **The protagonist.** The adventure's Kyr already assumes no name, gender, ancestry or calling. Tamsin the bard is
  only in its standalone campaign's party. She becomes a preset, and that campaign starts from the choice of a life.
  In a world, the company that comes down the coast road is the world's own.
- **The week.** Its seven days are counted today from the company's arrival, so the world waits for the company and
  there is no late arrival (`src/campaign/clock-shift.ts`). In one world, the Tour is proclaimed on a world date.
  Ascension Day is a fixed festival. Arriving late, the company finds what happened without it: the funeral missed,
  the crowned Florian, the raid on the Whelm. Late arrival is caught up by "on or after the day, and not yet done"
  guards on the city's own moves.
  - A late module writing the world's watch into a shared measure is GTR-01. It is mended with this.
- **What Sennet tells outside Sennet.** Its chapters, endings and news are held to Sennet, or told on return.
- **Discoverability is measured in play.** How many commands a newcomer in a generated world takes to hear of Sennet,
  to reach its gate and to find the Tour; how many of its seventy-odd places and how much of its talk an hour's
  ordinary play meets.

## Decisions taken, and the questions they leave

These are taken so the work goes on. Each is chosen to keep the author's design and to be reversible.

1. **"Whose principal seat is the City of Seven Towers" is read as the college's.** The House stands at Sennet. If
   the owner means the upper galleries must physically be in Dun Rì, the Door of Doors at Sennet opens onto galleries
   in a tower of Dun Rì instead. That costs the open Door's description and adds a canonical place in Dun Rì, but none
   of Acts I to IV.
2. **The Undertow holds the Door open for a day and a night only.**
3. **A world that never visits Sennet records nothing of the Tour.** The other choice is a lazy history in which, left
   alone, the Rector takes the Rose and goes through on the seventh night. Every neglected world would then have its
   upper House opened by her. It is the author's own schedule, and it is the owner's to choose.
4. **Cthell is spelt as the owner spelt it.** The catalog condition keeps its id.
5. **The other demiplanes stay their modules' own for now:** the Keeping, the Masonry, the Interval, the Margin, and
   the Varakiiri void beyond the gates of being. Whether the three Varakiiri citadels are one place is a question for
   the canon of the Varakiiri.

## Demonstrations (OWN-38)

Each is a test that plays, not a fixture that places.

1. **One Plane of Fire.** Two modules extend the Plane of Fire: the Grand Tour's Hour Court, and a second module's
   place. A company comes through the Fire Door to the threshold and walks to both.
2. **One Infinite Library.** Two modules contribute to it: Parliament's Commonplace and Stacks, and a second module's
   room. Both are reached from the Library's threshold.
3. **The courts persist.** The Grand Tour's courts keep their state when the company leaves Sennet, a second adventure
   is installed, and the company comes back.
4. **One House.** It can be named by a module that never installs the Grand Tour. The college at Dun Rì and the Collegium
   at Sennet both point to it.
5. **The upper House.** A whole Rose opens the Door of Doors onto the upper House, whose doors to the outer planes are
   sealed. Nothing calls Fire "Gehenna".
6. **Another module knows.** A Grand Tour outcome is recognised by another module: the country's innkeepers tell that
   the Door of Doors at Sennet stands open.
7. **An ordinary protagonist.** A protagonist made in a generated world (not Tamsin, not a bard) hears of the Tour,
   reaches Sennet and plays its first day.

## Phases

1. The canon and the engine: `data/imbar/`, `data/rules/canon.kyr`, installation first, the `canon` field, the
   refusals, Imbar bound in the six adventures and generated countries, `nest`, the outer planes' laws, the Library as
   a plane with Parliament in it. Demonstrations 1 and 2, with a second module for each.
2. The Grand Tour integrated: canon bindings, the courts in the planes, the laws renamed, the House and its doors, the
   Water Door, the upper House, the Doorward bounded, the Undertow, outcomes as events, its text softened.
   Demonstrations 3 to 6. Only now is it merged.
3. The week on the world's clock, late arrival, Sennet's telling held to Sennet, the preset protagonist, and
   discoverability measured. Demonstration 7.
