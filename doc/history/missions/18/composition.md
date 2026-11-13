# Mission 18: one country (Gate B), the design

Mission 17 put every installed adventure into one world, but each as a country of its own beyond a march-stone: one
runtime, thirteen countries. Gate B asks for one principal country they share, with a metropolitan anchor (Orsino's
City of Seven Towers, Dun Rì), and for independent adventures to contribute to the same town, road and valley.

## What is installed now

| Country (id) | Module | What it is | Terrain; where it lies now | Entry |
|---|---|---|---|---|
| Merrowdale (longman) | the-long-man | A dale under a long ridge; the village of Merrow | mountain; north | road_end |
| Thrume | thrume | Saltgrave, a salt town under the fells | mountain; east | salt_road |
| the Strewnfield | house-that-grows | A room of glass in a barley field by Cobble Ring | marsh; south | rim |
| the Corrow | let-one-remember | A mountain hanging in the sky on a chain | mountain; west | eighth_bend |
| the Ghessil Uplands | patient-star | Light on the glass that slows what drinks it | mountain; west | square |
| the Bowl of Ammerlin | low-water | A city down the inside of a crater; its lake going down | hills; south | rim_road |
| the Ossel delta | what-tessary-owes | Tessary, where the marsh meets the sea | marsh; east | causeway_end |
| the vale of the Wray | wrayford | Wrayford, where the drove roads come off the fells | hills; south | drove_road |
| Calamy | parliament-of-books | Where the cold country meets the sea, miles of reeds | marsh; east | causey |
| the vale of the Arle | gosses-company | Pentrice, a minster town where the Ise falls into the Arle | hills; west | road_end |
| Pellam on the Lisk | liberty-of-the-ice | The wool city where the North Road meets the Lisk | hills; west | north_road |
| the Lim valley | hessel | Hessel, where the water comes up out of the hill | hills; north | south_road |
| the Levels of Gaunt | winter-in-carth | Gaunt, the city of the Minster, over Carth Fell | frost; north | cross_road |

Each declares its own region, settlements (one to nine), wild country, sites and rooms (31 to 139 rooms), and is
reached by a road across a march from a generated country.

## The shape proposed

Three layers, kept apart (B3):

1. **Canon: Imbar's chassis.** A stable description of the principal country and the lands around it: where the
   coast is, the great river and its mouth, the mountains, the forest, the fens, the uplands, the cold north; its
   peoples, livelihoods, trade roads and institutions; and Dun Rì, the City of Seven Towers, at its heart. Data, not
   plot (data/imbar/).
2. **Procedural: local substance.** The country's land is drawn from the seed inside the chassis (the coast stays
   where canon puts it; the hills and woods between are drawn), with its towns, roads, people and goings-on, as
   generated countries are now.
3. **Adventures: particular places, people, events.** Each adventure is installed into the country by what it asks
   for (B4): "a city on a river", "a dale under the northern fells", "a town where the marsh meets the sea", "a
   minster town where two rivers meet", "a field in fen country". The installer finds land that answers, gives the
   adventure's places cells there (so they are on the one map), joins its way in to the country's roads (no
   march-stone), and records where it put it and why (provenance, B4). An adventure whose fiction needs to be far
   (a mountain on a chain, over the cold fell) is placed at the country's edge, or in the lands beyond, joined by the
   same roads.

Contributing to one town (B1): a module may ask not for land but for a place in a settlement that exists ("an inn on
the green of a town", "a stall in a market", "a ward of the city"), and its rooms are joined to that settlement's own
(as scenarios already bind `@town.green`, `@town.innkeeper`). The first demonstration: two adventures in one
settlement and its hinterland, neither duplicating the other's geography nor overwriting it; then the library.

Standalone launch and each adventure's own tests stay as they are: its campaign still builds its own region when
launched alone.

## The mechanism

What exists already: an authored country is a module installed with its imports (the company, a herald's exports) and
joined to the generated country by a link module, a road from a march-stone (`here.edge_<side>`) to its entry room
(Frontier.expand); a module may carry a chart, the land of its region (ModuleBundle `chart`), and the map draws the
chart of the region the company is in (ChartModel.region: `regionOf`, the innermost region in a place's ancestry);
scenarios already declare their places by role (a site of a kind, a settlement toward a side, the road out of it) and
bind a module's imports to a town's parts (`@town.green`, `@town.innkeeper`: WorldAssembler.place).

What a province needs:

1. **Nesting.** An installation that puts a module's top-level region inside a host place (`within`), as installing
   already prefixes its ids: the adventure's region becomes a part of the first country, its settlements and wild
   country within it.
2. **One country as home.** The map, the sky, the news and the calendar answer to the outermost region a place lies
   in (`findLast`, where they now take the innermost): for the generated countries, which are never nested, nothing
   changes.
3. **Land.** The host's chart gives the province's places cells: a patch of the country's land whose cover answers what
   the adventure asks (fen for the Ossel delta, fell for Merrowdale), each of its settlements, sites and stretches of
   wild country a cell in it, and the road in drawn on the land; recorded with why it was chosen.
4. **The road in.** A link module as now, but from one of the country's towns (its road out on the right side) to the
   adventure's entry, an ordinary road of the country, not a march; no chapter heading of a new country on crossing.
5. **Placement as data.** Each adventure's needs said in its own manifest (where it may lie, near what, how far from
   the city), not in countries.json's sides and terrains, so an author adds one without editing a shared list.


1. The placement inventory and report (this table, with each adventure's needs read from its fiction).
2. One adventure installed as a province of the first country rather than beyond a march: its places on the
   country's land, its entry on the country's roads, its rumours where its neighbours would tell them.
3. A second in the same country, sharing a town or a valley with the first (or with Dun Rì).
4. Dun Rì: wards, streets, markets, institutions, residents, the seven towers.
5. The rest of the library; the tour (NAV-10) re-run in the one country; one protagonist through three adventures.
