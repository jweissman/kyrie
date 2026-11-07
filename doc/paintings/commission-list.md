# Scene paintings to commission

For the owner, 7 November 2026. The scene behind a place is chosen by `src/ui/scenery.ts` from
[data/paintings/scenery.json](../../data/paintings/scenery.json), and it knows only a few kinds of place: a
settlement by its terrain or the river it is on, wild country by its land or terrain, any site, the night, and,
for every room under a roof, one of four interiors (`meditation`, a philosopher's dark room by a spiral stair;
`well`, figures by a well in a courtyard; `library`, a vaulted gothic library; `dissolution`, a vaulted hall lit
by fire). That is why a taproom has shown as a vaulted library, a spider nest under a quarry as a cathedral porch,
and a tower as a log cabin in a valley (`idyll`). The scene does not yet know whether a room is a taproom, a shop,
a shrine or a cellar, or what made a settlement (a harbour, a fort, a market).

This list is top-down: every kind of place the generators and the authored adventures make, grouped by setting,
with a one-line brief for its painting. Each says what covers it today:

- **covered**: a painting in the corpus shows it, and the scene uses it for this kind;
- **in corpus**: a fitting painting exists (named, from [seen.json](../../data/paintings/seen.json)) but the scene
  does not choose it for this kind, or it has a figure in it who could be taken for someone met;
- **poor**: what is shown today contradicts the place;
- **missing**: nothing fits.

Every brief is for a painting without a foreground figure (the scene must never show someone the player could take
for a person met), wide enough to read behind text, and true in all seasons unless it says winter. Where a kind
wants several (one each for a country's few towns), the count is in brackets.

## 1. Town exteriors (the heart of a settlement, by what founded it)

| Place | Brief | Today |
|---|---|---|
| Market-place of a market town [3] | A cobbled square of stalls under faded awnings, a stone market cross, tall gabled houses opening onto it | poor (`herd`, `chapel`, `arcadia` by terrain) |
| Landing or quay of a harbour town [3] | A stone quay and boats drawn up on shingle, nets on fences, a town climbing behind | poor (`trapper`, an islet, at best); `fisherman` in corpus has figures |
| Strand of a fishing hamlet [2] | Drying racks of fish on a low shore, upturned boats, a few low grey houses | missing |
| Ford or bridge-foot of a crossing [2] | A road going down into a shallow river between houses, a rope on posts across | covered (`bridge`), [1 more] |
| Village green of a farming place [4] | Houses round a green with a pond, a lane out to fields | covered (`herd`, `chapel`, `arcadia`) |
| Hamlet [2] | A handful of houses and a byre about a well, a track | covered (`herd`) |
| Bailey of a fort on a pass | A rough stone curtain wall and leaning gate-tower round a muddy yard on a rise | missing; `redoubt`, `castle` in corpus (distant) |
| Gate-yard of a brothers' house | A swept yard before a low-walled monastery, a bell-cote over the gate | in corpus (`abbey`, distant) |
| Old stones of a village built on the makers' work | Houses ringed round a paving of great squared stones and a wide well-mouth | in corpus (`trilith`, a ring on a plain) |
| Camp of newcomers | Painted wagons without wheels, awnings, cook-fires, washing lines | in corpus (`encampment`, palms: desert only; `the-fire`, with cattle) |
| Pit-head of a tin working | A winding-wheel over a shaft in a yard of trodden mud, spoil heaps | missing |
| Bloomery yard of an iron working | Low clay hearths smoking red, heaps of ore and charcoal | missing; `smelter` in corpus has figures |
| Quarry-yard of a slate working | A hillside cut in blue-grey steps, slate stacked in the yard | in corpus (`quarrier`) |
| Salt-pans | Square steaming pans on a white shore, fires under them | missing |
| Peat-banks | Black cut steps in a moor, stacks of peat taller than a house | missing |
| Charcoal burners' clearing | Turf-covered clamps smoking blue in a woodland clearing | missing |
| Timber-yard | Stripped trunks stacked by a sawpit in a forest clearing | missing |
| Reed-yard | Ricks of reed taller than thatched houses, a fen behind | missing |
| Try-works of a whaling place | Iron pots over fire-pits on a shore, black smoke, jawbone gateposts | missing; `whaler` in corpus has figures |
| Drying-frames of a fur post | A long hall in a stockade among frames of stretched pelts | missing |
| Bee-garden | Rows of straw skeps along garden walls, clover | missing |
| Lanes behind the green | A narrow lane between yards and workshops, doors open | missing |
| Home fields | Strips of field running from the houses to the hedges | covered (`herd`); `harvest` in corpus has figures |
| Waterside | Boats on a bank, nets on poles, a plank jetty | in corpus (`trapper`) |
| Churchyard | A lych-gate, leaning stones, a squat church beyond | missing |
| Old quarry pit at the edge of town | A flooded quarry hollow with a gated adit in its face | in corpus (`quarrier`, dry) |
| Town at night [2] | Shuttered houses, one lit window, a lamp over an inn door | poor (`camp`, `moon`: wild-country nights) |
| Town in winter [2] | Snow on roofs and a frozen river | covered (`wintre`, `ice-cutter`) |
| A town of the desert's edge | Flat roofs, a well, palms, a caravan yard | in corpus (`street`, `encampment`) |
| Dun Rìerdan, the City of Seven Towers [3] | A walled city on its rock with seven towers over it; a street of it; its gate | missing; `urbs`, `castle` in corpus |

## 2. Town interiors, by kind of room

| Place | Brief | Today |
|---|---|---|
| Taproom of a town inn [2] | A long beamed room with a fire at each end, hams overhead, benches and a counter | poor (`library`, `meditation`, `well`, `dissolution`); `innkeeper` in corpus has a figure |
| Taproom of a village inn [2] | A low smoky room, a settle by the fire, pewter on hooks | poor (as above) |
| Taproom of a hamlet inn | One room: a fire at one end, barrels at the other, one long table | poor (as above) |
| Alehouse in someone's kitchen | A cottage kitchen with a range, a barrel on trestles, a cat on the settle | in corpus (`kitchenmaid`, a figure; `caretaker`) |
| Guest-hall of a brothers' house | A long whitewashed hall, a row of cots, a fire at the end | missing |
| Canteen of a garrison | A lean-to against a fort wall, a counter, two barrels, a chalked slate | missing |
| Chandlery | Shelves to the ceiling of rope, lamps, candles, sacks of meal | missing |
| General store | Sacks on the floor, shelves to the beams, a worn counter | missing |
| Clothier's | Bolts of cloth on end, tunics on a pole, boots in pairs | missing |
| Herb-shop | Herbs drying from every beam, labelled jars, a simmering pot | missing; `hothouse` in corpus (wrong) |
| Apothecary or dispensary | Drawers to the ceiling, a ladder on a rail, brass scales | missing |
| Alchemist's still-room | Retorts and phials, a copper coil dripping, a slow fire | in corpus (`experimenter`, figures) |
| Potion-shop, shop of small magics | Shelves of coloured bottles, charms on strings | missing |
| Forge or smithy | A forge glowing in a dark corner, tongs and hammers on the wall | in corpus (`smelter`, figures) |
| Armourer's or weapon-shop | Hide coats on pegs, spears in a rack, a whetstone | missing |
| Ironmongery | Hooks, chain, a barrel of nails | in corpus (`shipwright`, a figure) |
| Wood-yard of a woodwright | Stacked timber, shavings, half a cart on trestles | in corpus (`shoemaker`, figures) |
| Salt-house | Sacks of salt to the rafters, barrels of brine | missing |
| Fur-store | Pelts hanging from rafters, a bench of sorted skins | missing |
| Provision-shop or cook-shop | Hams and cheeses, a counter onto the street, a griddle | in corpus (`chef`, `nurseryman`: figures) |
| Jeweller's | A small bright room, a tray of rings under glass by one window | missing |
| Scriptorium of a scrivener | Pigeon-holes of rolled paper, a sloping desk | in corpus (`bibliophile`, `researcher`: figures) |
| Emporium, variety-shop, curiosities | A dim shop heaped with everything, shapes under cloths | in corpus (`seeker`, a figure) |
| Exchange or money-changer | A counting-house, scales, ledgers, a barred window | in corpus (`money-changer`, a figure) |
| Shrine of a town (altar, statue, fountain, obelisk, mural, relic) [3] | A small stone shrine room: a long stone under shingles, lamps, offerings laid before it | poor (`library` and the rest); `hierophant` in corpus has a figure |
| Chapel of the brothers | A plain whitewashed chapel, benches, one window | in corpus (`cathedral`, far too grand) |
| Garrison chapel | A bare stone room in a fort wall, a weapon-rack by the altar | missing |
| Top of the shrine's tower | Roofs below and the country beyond, from a bell-loft | missing |
| Gate-tower of a fort | A cold stone room with a ladder to a trapdoor | missing |
| The mill | A dim mill floor, flour on everything, the stones turning | in corpus (`miller`, exterior) |
| Boat-sheds | Long open sheds with hulls half built, ribs bare | in corpus (`shipwright`, a figure) |
| Boiling-house of the salt-pans | Steam over seething pans, salt in baskets along a wall | missing |
| Old corn-store | A barn of sacks and spilled grain, a trapdoor in the floor | missing |
| A home [2] | A cottage room: hearth, table, a bed in an alcove | in corpus (`caretaker`, `lullabye`: figures) |
| A stable or byre | A dim stable, straw, a horse's stall | in corpus (`horse`, a figure) |

## 3. Wilderness, by terrain and land

| Place | Brief | Today |
|---|---|---|
| Wood [3] | Deep woods with a sunlit clearing; dark trees by a pool; a track under oaks | covered (`forest`, `grove`, `gale`) |
| Fen [2] | Black water between tussocks, a line of stakes, reeds to the sky | poor (`grove`, `trapper`) |
| Heath [2] | Open heather under a big sky, a track and a cairn | missing (falls to `herd`, `idyll`) |
| Fell [2] | Bare fellside, a beck, stone walls going up | poor (`idyll`, a cabin; `bear`); in corpus (`mountain`) |
| Peak | Crags and snowfields above the treeline | covered in winter (`avalanche`); poor otherwise (`idyll`, a cabin) |
| Pass | A road climbing between crags to a saddle | poor (`idyll`: a log cabin) |
| Meadow and farmland | Hedged fields and a lane | covered (`herd`) |
| River vale | A river winding in a wide valley | covered (`indolence`, `arcadia`) |
| River gorge | A stream in a deep rocky gorge | in corpus (`river`, `falls`) |
| Lake | A long lake under crags | covered (`bear`) |
| Frost country [2] | Snowfields and a frozen shore, low turf houses | covered (`wintre`, `ice-cutter`, `trapper`) |
| Desert [2] | Dunes under glare; a rocky waste with a dry wadi | poor (`encampment`, palms at dusk, only) |
| A road through the land | A road between hedges or across moor, a milestone | in corpus (`road`) |
| Camp in the wild at night | A fire under a lean-to | covered (`camp`) |
| Night in the open | A moon over dark country; stars | covered (`moon`, `firmament`, `aurora`) |
| A wonder of the wild (lights, fog, music) | Lights hanging over a dim glade; mist on a moor | missing |

## 4. Sites and their rooms, by kind

| Place | Brief | Today |
|---|---|---|
| Cave, from outside | A dark mouth in a hillside, a scree fan | poor (`arch`, `ruin`, `trilith`, `tower` for every site) |
| Barrow, from outside | A long grassed mound with a stone-lined entrance | poor (as above) |
| Ruin, from outside | Fallen walls in rough grass | covered (`ruin`, `arch`, `rest`, `fane`) |
| Lone tower, from outside | A ruined round tower above the land | covered (`tower`, `bolt`); poor when chosen for other sites |
| Grove | Old trees crowded close, green light under them | in corpus (`grove`) |
| Bog | A black bog, stakes marking a path | missing |
| Old mine | Spoil heaps and a timbered adit in a hillside | missing |
| Sinkhole | A round pit in turf, its edge falling away | missing |
| Makers' keep or watchtower | A squared tower of old dressed stone on a rise | in corpus (`redoubt`) |
| Makers' tollhouse or riddle-door | A carved stone door in a hillside | missing |
| Makers' abbey | A roofless abbey church | in corpus (`fane`, `abbey`) |
| Tower interior: a hall [2] | A round stone room with a stair rising along the wall | poor (`library`, `meditation`) |
| Tower interior: library or study | Shelves and a desk at the top of a tower | covered (`library`) |
| Tower roof | Leads and battlements open to the sky | missing |
| Keep: bailey and chapel | A courtyard inside curtain walls; a small fort chapel | missing |
| Bandits' or beasts' den | A rock shelter strewn with bones and bedding | missing |
| A watch-post or guardroom | A bare room with a brazier and a weapon-rack | missing |
| Brood hollow, nest | A dim hollow choked with web and husks | poor (`colonnade`, `perdition`) |

## 5. Underground

| Place | Brief | Today |
|---|---|---|
| Cellar under a town | A low brick cellar, damp, spilled grain | poor (`meditation`, `well`, `dissolution`, `grotto`) |
| Rat-runs and nest | An earth crawlway, gnawed brick, litter of husks | poor (as above) |
| Old drain | A brick culvert with water running along its floor | missing |
| Crypt under a churchyard | A low vault, coffin shelves pushed askew | in corpus (`dissolution`, too grand) |
| Ossuary | Bones stacked to the roof in courses, skulls in rows | missing |
| Quarry adit and gallery | A square-cut gallery, pick-marks, webs at face height | poor (`perdition`, `colonnade`) |
| Spiders' brood-chamber | A crack opening into a cave hung with web and egg-sacs | poor (`colonnade`: a cathedral porch) |
| Barrow: passage-grave, halls of the dead, king's grave [3] | A stone-lined passage; a pillared hall of niches; a chamber with a grave-goods bier | missing |
| Mine: adit, stope, shaft, haulage level [3] | Timbered galleries, a shaft with a ladder, tubs on rails | missing |
| Cistern and waterworks [2] | A drowned vaulted cistern, pillars standing in black water | in corpus (`dissolution`) |
| Singing hall | A hall of the makers whose walls are cut in ribs | missing |
| Galleries of an argument (a makers' court) | A carved hall of benches and a dais underground | missing |
| A natural cave | A cave chamber, stalactites, a pool | covered (`grotto`, sea-facing) |
| Under a site, generally [2] | A stair going down into the dark; a vault lit by one torch | covered (`meditation`, `dissolution`) |

## 6. Sea and coast

| Place | Brief | Today |
|---|---|---|
| Open shore and shingle | A shingle beach under a cliff, gulls | missing |
| Sea cliffs and a headland | Cliffs and a tower on the edge | covered (`tower`) |
| The open sea, from a boat [2] | Grey water to the horizon; a storm | covered (`wreck`, `tempest`) |
| Firth and estuary | A wide estuary of mudflats and channels at low water | missing |
| A ship's deck | A deck at sea, rigging and a rail | missing |
| Below decks | A hold lit by a lantern | in corpus (`pirate`, figures) |
| A lighthouse | A light on a rock in a heavy sea | in corpus (`lighthouse`) |
| A sunken or drowned place | Green water light through a drowned room | missing |
| A sea cave | A cave mouth on a lagoon | covered (`grotto`) |

## 7. Planes and the House of Doors

| Place | Brief | Today |
|---|---|---|
| The House of Doors: a gallery of doors | A long gallery lined with doors of every age and make | missing |
| The Infinite Library | Hexagonal reading-rooms going on for ever, lamps and stairs | in corpus (`library`, one vault) |
| Plane of Fire | A plain of fire under a black sky | in corpus (`cthelll`, `call`: figures) |
| Plane of Air | Cloud islands in an endless sky | missing |
| Plane of Earth | A world of stone and veins of ore lit from within | missing |
| Plane of Water | Bright deep water and drifting light, no surface | missing |
| Positive and Negative Energy Planes [2] | A field of blinding light; a grey nothing | missing |
| Arcadia, Ysgard, the Mount of the Exalted [3] | Orchards in perfect rows; a hall of heroes on a mountain; a peak in light | in corpus (`palace`, `world`, `temple`) |
| Mechanus | Interlocking wheels and gears without end | missing |
| Limbo, Pandemonium | Churning chaos; a howling cavernous wind-world | in corpus (`pandaemonium`, `limbo`: figures) |
| Hades, Gehenna, Cthelll, the Abyss [4] | Grey ashen fields; volcanic slopes; a burning tower; a pit without bottom | in corpus (`cthelll`, `inferno`: figures) |
| Nirvana, Zephyrus [2] | A still lake of light; wind-scoured cliffs | missing |
| The threshold of a plane | A doorway standing alone, light of another sky through it | missing |

## 8. The authored adventures' own places

These have places no generator makes. Each wants one or two paintings of its own; until then they fall into the
categories above.

| Adventure | Places that want a painting | Today |
|---|---|---|
| A Parliament of Books | the hexagons of the stacks; the post-house sunk in mud; the sluice and mills | `library` (one vault) |
| The Grand Tour | the collegium; a drowned church tower and belfry; an air-bell under water | indoors set |
| The Patient Star | a hall of a frozen storm; masonry halls three hundred metres high | indoors set |
| The Book of Faces | the cisterns and the Drain's weirs | underground set |
| Quittance | a house of a dead man, its wake | indoors set |
| The Lull, Sixways | a crossroads town and its workshops | settlement set |
| Winter in Carth | a walled town in snow, its gaol | `wintre`; indoors set |
| Low Water | a citadel; a river at low water | settlement and indoors sets |
| Hessel, Skeel, Liberty of the Ice, What Tessary Owes | their towns and their ice | settlement and frost sets |

## What the scene needs to use these

The scene chooses by `views` and `within` keys. Commissioned paintings need keys it can read: a settlement's heart by
its founding (`settlement:market`, `settlement:harbour`, `settlement:fortress` …), a room by its role (`indoors:taproom`,
`indoors:shop`, `indoors:shrine`, `indoors:home` …), a site by its kind (`site:cave`, `site:barrow` …) and an
underground room by its kind (`underground:cellar`, `underground:crypt`, `underground:mine` …). Adding those keys to
`scenery.json` and to `Scenery.of` and `Scenery.inside` is a small change, owned by whoever works on the scene; this
list is the content it would draw on.
