# Scene paintings to commission

## Still wanted (10 November, from the first hour)

Drawn from every room a first-hour player can reach in `kahitude` (which painting each gets) and from three rounds of
cold play. **Light and state matter more than subject**: a pitch-dark room painted lit, or a burnt chamber painted
whole, was named every time; a slightly wrong building rarely was.

Covered the same day by the owner's paintings: a mine's working face, ore pass, winze, sump, pump-room, furnace hall
and a tunnel by one candle; a barrow's forecourt, passage, corbelled chamber, recess and stair; an undercroft unlit;
a grain cellar.

Most wanted first:

1. **The hobs' hold and the toll-house** (Seolforfyrd, the debt's first expedition): a ruined stone toll-hall with a
   tariff board and a barrier pole (now a church porch); a small counting-room with scales and an iron-bound chest; a
   smoky lived-in cave with fleeces, a fire, plunder heaped and bells hung clapperless (now the cave mouth again); a
   muck pit in a cave floor with someone in it (now a barred prison cell).
2. **A spider brood-chamber burnt**: blackened sacs, ash, webs burnt to threads (the brood painting shows the sacs
   whole after the player has burned them; the scene would also need to switch on the brood's state).
3. **A small sealed burial vault** under a lifted flag: niches and one sarcophagus (now an ossuary).
4. **The first town's places**: a small town's gate-yard with a timber gate and a guard's shed (Brockminster's is a
   gothic castle gate); narrow lanes with washing and a well (now a chapel); a row of cottages from the street; a
   militia drill-yard with a practice post and a spear rack (now a herd); boat-sheds with hulls on trestles (now a
   mill); a river landing with a jetty and barrels (now a trapper).
5. **Fallbacks**, quiet and nearly empty, for rooms no kind names (there is no indoor one at all, and three old
   masters' vaults for under the ground): a bare plastered room by day; the same by one candle; rough rock by one
   flame; a dressed-stone corridor by one flame.
6. **Second paintings** for kinds that have one, where one painting stands for many places: a stable, a shop, a
   granary, a stair, a guardroom.

Not paintings, but near: an **iron torc** item icon (the torc shows gold and dragon-headed); **Tuck's portrait** (he
shows a halfling's acorn emblem, not a face).

## Still wanted (8 November, after the owner's paintings of 8 November)

Covered now: the rat-runs (a burrow), the drain, the spiders' brood, a mine's gallery and shaft, a cell, a shop's
counter, a cave mouth, the stair down from a street, a town's green, lane and gate, a keep's bailey and gatehouse, the
market and the clothier's without figures, and a door from the House of Doors to every plane, inner and outer.

Most wanted first. Each without anyone in the foreground, wide (landscape), and seen as the place is.

1. **Ways underground:** a long passage of dressed stone, a pillared hall under the ground (old masters' vaults stand
   in for both).
2. **The planes from within**, wide: the House's doors show each plane through its arch, from the House; a plane's
   own country, once the company is through, still falls to old masters' paintings with figures (Hades, Gehenna, the
   Abyss, Limbo, Pandemonium) or to nothing (Mechanus, Nirvana, Zephyrus, the Positive and Negative Energy Planes).
3. **The doors wide:** the portals are tall, and the stage, which is wide, crops their arches; a wide version of each
   (or of the hall) would show whole.
4. **The Positive and Negative Energy Planes' doors**, and planes of ice and storm for the ice and lightning doors
   (painted, not yet in the world).
5. **A tower's roof** (leads and battlements open to the sky), and **a guardroom's** second painting.

Below, the full list as it was drawn up on 7 November.

For the owner, 7 November 2026. The scene behind a place is chosen by `src/ui/scenery.ts` and
`src/ui/scene-kinds.ts` from [data/paintings/scenery.json](../../data/paintings/scenery.json). Until the evening of 7
November it knew only a settlement by its terrain, wild country by its land, any site, the night, and four interiors
for every room under a roof (`meditation`, `well`, `library`, `dissolution`): a taproom had shown as a vaulted
library, a spider nest as a cathedral porch, a tower as a log cabin (`idyll`), the rat-runs as a palm grotto, a crypt
as figures at a well, a market as woodland, a town gate as a mountain range (`bridge`), and the road, the
bridge-foot and the forge as one lane of sheep (`herd`).

The scene now chooses by what the place is (`kinds` in scenery.json, read in order):

- an author's own painting for a place (`places`, by id) first;
- then the kind its name says, else its id says: the head word before the name's first preposition ("Green Cave" is
  a cave), else the first after it ("the shrine of Lugh"); a possessor only where nothing else names a kind ("the
  Exchange's cellar" is a cellar); a plain kind (hall, passage, shop, home) gives way to its level's or site's ("the
  cross-chamber" of a passage-grave is a room of the dead);
- each kind has a `ground` (seen from the open) and a `room` (seen from within); under the ground only the room is
  ever shown, never a country;
- a kind with nothing in the corpus (`plain`) shows a dim ground, not a wrong picture: a forge, the rat-runs and a
  drain, a spiders' brood, a cell, a mine, a cave from within, a shop of unknown trade;
- rooms of one site that are named differently (the crypt, the ossuary, the vault) take the kind's paintings in turn,
  so a barrow's rooms are not all one painting;
- with no kind: settlement and wild country by land and terrain as before (with the cabin and the mountain range
  taken out of the town, tower, peak and pass lists), a site's deep rooms by its vaults and stairs, and nothing for
  an unknown room under a roof.

The paintings used for kinds are mostly still lifes with no one in them (`journal`, a tankard on a shelf, for a
taproom; `food` for a larder, a chandlery, a cellar; `silver` and `cup` for a jeweller's or a treasury; `poppy` and
`orb` for a herb-shop; `breviary`, `astrolabe`, `globe` for a study; `death` and `vanity` for a crypt; `folio` for an
armoury), which fit a room better than any vault. They stand in for the commissions below; each painting
commissioned should be added to its kind's list in scenery.json.

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
| Market-place of a market town [3] | A cobbled square of stalls under faded awnings, a stone market cross, tall gabled houses opening onto it | stand-in (`chapel`, a village street); [3] wanted |
| Landing or quay of a harbour town [3] | A stone quay and boats drawn up on shingle, nets on fences, a town climbing behind | stand-in (`trapper`, `mill`); `fisherman` in corpus has figures |
| Strand of a fishing hamlet [2] | Drying racks of fish on a low shore, upturned boats, a few low grey houses | missing |
| Ford or bridge-foot of a crossing [2] | A road going down into a shallow river between houses, a rope on posts across | covered (`bridge`, `arcadia`) |
| Village green of a farming place [4] | Houses round a green with a pond, a lane out to fields | covered (`herd`, `chapel`, `arcadia`) |
| Hamlet [2] | A handful of houses and a byre about a well, a track | covered (`herd`) |
| Bailey of a fort on a pass | A rough stone curtain wall and leaning gate-tower round a muddy yard on a rise | stand-in (`castle`, `redoubt`, distant) |
| Gate-yard of a brothers' house | A swept yard before a low-walled monastery, a bell-cote over the gate | stand-in (`abbey`, `fane`) |
| Old stones of a village built on the makers' work | Houses ringed round a paving of great squared stones and a wide well-mouth | in corpus (`trilith`, a ring on a plain) |
| Camp of newcomers | Painted wagons without wheels, awnings, cook-fires, washing lines | in corpus (`encampment`, palms: desert only; `the-fire`, with cattle) |
| Pit-head of a tin working | A winding-wheel over a shaft in a yard of trodden mud, spoil heaps | stand-in (`quarrier`) |
| Bloomery yard of an iron working | Low clay hearths smoking red, heaps of ore and charcoal | missing; `smelter` in corpus has figures |
| Quarry-yard of a slate working | A hillside cut in blue-grey steps, slate stacked in the yard | covered (`quarrier`) |
| Salt-pans | Square steaming pans on a white shore, fires under them | missing |
| Peat-banks | Black cut steps in a moor, stacks of peat taller than a house | missing |
| Charcoal burners' clearing | Turf-covered clamps smoking blue in a woodland clearing | missing |
| Timber-yard | Stripped trunks stacked by a sawpit in a forest clearing | missing |
| Reed-yard | Ricks of reed taller than thatched houses, a fen behind | missing |
| Try-works of a whaling place | Iron pots over fire-pits on a shore, black smoke, jawbone gateposts | missing; `whaler` in corpus has figures |
| Drying-frames of a fur post | A long hall in a stockade among frames of stretched pelts | missing |
| Bee-garden | Rows of straw skeps along garden walls, clover | missing |
| Lanes behind the green | A narrow lane between yards and workshops, doors open | stand-in (`chapel`, `herd`) |
| Home fields | Strips of field running from the houses to the hedges | covered (`herd`); `harvest` in corpus has figures |
| Waterside | Boats on a bank, nets on poles, a plank jetty | covered (`trapper`, `mill`) |
| Churchyard | A lych-gate, leaning stones, a squat church beyond | stand-in (`chapel`, `abbey`) |
| Old quarry pit at the edge of town | A flooded quarry hollow with a gated adit in its face | stand-in (`quarrier`, dry) |
| Town at night [2] | Shuttered houses, one lit window, a lamp over an inn door | poor (`camp`, `moon`: wild-country nights) |
| Town in winter [2] | Snow on roofs and a frozen river | covered (`wintre`, `ice-cutter`) |
| A town of the desert's edge | Flat roofs, a well, palms, a caravan yard | in corpus (`street`, `encampment`) |
| Dun Rìerdan, the City of Seven Towers [3] | A walled city on its rock with seven towers over it; a street of it; its gate | missing; `urbs`, `castle` in corpus |

## 2. Town interiors, by kind of room

| Place | Brief | Today |
|---|---|---|
| Taproom of a town inn [2] | A long beamed room with a fire at each end, hams overhead, benches and a counter | stand-in (`journal`, `food`: still lifes of a tankard and a stone shelf); `innkeeper` has a figure |
| Taproom of a village inn [2] | A low smoky room, a settle by the fire, pewter on hooks | stand-in (`journal`, `food`) |
| Taproom of a hamlet inn | One room: a fire at one end, barrels at the other, one long table | stand-in (`journal`, `food`) |
| Alehouse in someone's kitchen | A cottage kitchen with a range, a barrel on trestles, a cat on the settle | stand-in (`journal`, `food`); `kitchenmaid` has a figure |
| Guest-hall of a brothers' house | A long whitewashed hall, a row of cots, a fire at the end | stand-in (`journal`, `food`) |
| Canteen of a garrison | A lean-to against a fort wall, a counter, two barrels, a chalked slate | stand-in (`journal`, `food`) |
| Chandlery | Shelves to the ceiling of rope, lamps, candles, sacks of meal | stand-in (`food`) |
| General store | Sacks on the floor, shelves to the beams, a worn counter | stand-in (`food`) |
| Clothier's | Bolts of cloth on end, tunics on a pole, boots in pairs | stand-in (`myth`, flowers on a rich cloth) |
| Herb-shop | Herbs drying from every beam, labelled jars, a simmering pot | stand-in (`poppy`, `orb`) |
| Apothecary or dispensary | Drawers to the ceiling, a ladder on a rail, brass scales | stand-in (`poppy`, `orb`) |
| Alchemist's still-room | Retorts and phials, a copper coil dripping, a slow fire | stand-in (`poppy`, `orb`); `experimenter` has figures |
| Potion-shop, shop of small magics | Shelves of coloured bottles, charms on strings | stand-in (`astrolabe`, `globe`, `trick`; potions `poppy`, `orb`) |
| Forge or smithy | A forge glowing in a dark corner, tongs and hammers on the wall | missing: a dim ground; `smelter` has a smith |
| Armourer's or weapon-shop | Hide coats on pegs, spears in a rack, a whetstone | stand-in (`folio`, armour on a cloth) |
| Ironmongery | Hooks, chain, a barrel of nails | missing: a dim ground |
| Wood-yard of a woodwright | Stacked timber, shavings, half a cart on trestles | missing: a dim ground |
| Salt-house | Sacks of salt to the rafters, barrels of brine | missing |
| Fur-store | Pelts hanging from rafters, a bench of sorted skins | missing |
| Provision-shop or cook-shop | Hams and cheeses, a counter onto the street, a griddle | stand-in (`food`) |
| Jeweller's | A small bright room, a tray of rings under glass by one window | covered (`silver`, `cup`) |
| Scriptorium of a scrivener | Pigeon-holes of rolled paper, a sloping desk | stand-in (`breviary`, `astrolabe`, `globe`) |
| Emporium, variety-shop, curiosities | A dim shop heaped with everything, shapes under cloths | stand-in (`astrolabe`, `globe`, `trick`) |
| Exchange or money-changer | A counting-house, scales, ledgers, a barred window | stand-in (`silver`, `cup`) |
| Shrine of a town (altar, statue, fountain, obelisk, mural, relic) [3] | A small stone shrine room: a long stone under shingles, lamps, offerings laid before it | stand-in (`chapel`, `abbey`, from outside); `breviary` under a roof |
| Chapel of the brothers | A plain whitewashed chapel, benches, one window | stand-in (`chapel`, `abbey`; `breviary` under a roof) |
| Garrison chapel | A bare stone room in a fort wall, a weapon-rack by the altar | stand-in (`breviary`, a candle and books in a cell) |
| Top of the shrine's tower | Roofs below and the country beyond, from a bell-loft | missing |
| Gate-tower of a fort | A cold stone room with a ladder to a trapdoor | stand-in (`castle`, `redoubt`; `dissolution` within) |
| The mill | A dim mill floor, flour on everything, the stones turning | stand-in (`mill`, `miller`, from outside) |
| Boat-sheds | Long open sheds with hulls half built, ribs bare | in corpus (`shipwright`, a figure) |
| Boiling-house of the salt-pans | Steam over seething pans, salt in baskets along a wall | missing |
| Old corn-store | A barn of sacks and spilled grain, a trapdoor in the floor | stand-in (`food`, `journal`) |
| A home [2] | A cottage room: hearth, table, a bed in an alcove | stand-in (`food`, `journal`) |
| A stable or byre | A dim stable, straw, a horse's stall | stand-in (`horse`: a small figure at the door) |

## 3. Wilderness, by terrain and land

| Place | Brief | Today |
|---|---|---|
| Wood [3] | Deep woods with a sunlit clearing; dark trees by a pool; a track under oaks | covered (`forest`, `grove`, `gale`) |
| Fen [2] | Black water between tussocks, a line of stakes, reeds to the sky | poor (`grove`, `trapper`) |
| Heath [2] | Open heather under a big sky, a track and a cairn | missing (falls to `herd`, `idyll`) |
| Fell [2] | Bare fellside, a beck, stone walls going up | stand-in (`bear`, `bridge`: no cabin) |
| Peak | Crags and snowfields above the treeline | covered in winter (`avalanche`); stand-in otherwise (`bear`, `bridge`) |
| Pass | A road climbing between crags to a saddle | stand-in (`bridge`, `road`) |
| Meadow and farmland | Hedged fields and a lane | covered (`herd`) |
| River vale | A river winding in a wide valley | covered (`indolence`, `arcadia`) |
| River gorge | A stream in a deep rocky gorge | in corpus (`river`, `falls`) |
| Lake | A long lake under crags | covered (`bear`) |
| Frost country [2] | Snowfields and a frozen shore, low turf houses | covered (`wintre`, `ice-cutter`, `trapper`) |
| Desert [2] | Dunes under glare; a rocky waste with a dry wadi | poor (`encampment`, palms at dusk, only) |
| A road through the land | A road between hedges or across moor, a milestone | covered (`road`, `arcadia`) |
| Camp in the wild at night | A fire under a lean-to | covered (`camp`) |
| Night in the open | A moon over dark country; stars | covered (`moon`, `firmament`, `aurora`) |
| A wonder of the wild (lights, fog, music) | Lights hanging over a dim glade; mist on a moor | missing |

## 4. Sites and their rooms, by kind

| Place | Brief | Today |
|---|---|---|
| Cave, from outside | A dark mouth in a hillside, a scree fan | stand-in (`river`, `falls`: a rocky gorge) |
| Barrow, from outside | A long grassed mound with a stone-lined entrance | stand-in (`trilith`) |
| Ruin, from outside | Fallen walls in rough grass | covered (`ruin`, `arch`, `rest`, `fane`) |
| Lone tower, from outside | A ruined round tower above the land | covered (`tower`, `redoubt`, `bolt`), for towers only |
| Grove | Old trees crowded close, green light under them | in corpus (`grove`) |
| Bog | A black bog, stakes marking a path | missing |
| Old mine | Spoil heaps and a timbered adit in a hillside | missing |
| Sinkhole | A round pit in turf, its edge falling away | missing |
| Makers' keep or watchtower | A squared tower of old dressed stone on a rise | stand-in (`castle`, `redoubt`) |
| Makers' tollhouse or riddle-door | A carved stone door in a hillside | missing |
| Makers' abbey | A roofless abbey church | covered (`abbey`, `fane`) |
| Tower interior: a hall [2] | A round stone room with a stair rising along the wall | stand-in (`meditation`, a dark room by a spiral stair) |
| Tower interior: library or study | Shelves and a desk at the top of a tower | covered (`library`) |
| Tower roof | Leads and battlements open to the sky | stand-in (`tower`, `redoubt`) |
| Keep: bailey and chapel | A courtyard inside curtain walls; a small fort chapel | stand-in (`castle`, `redoubt`; chapel `breviary`) |
| Bandits' or beasts' den | A rock shelter strewn with bones and bedding | missing: a dim ground |
| A watch-post or guardroom | A bare room with a brazier and a weapon-rack | missing |
| Brood hollow, nest | A dim hollow choked with web and husks | missing: a dim ground |

## 5. Underground

| Place | Brief | Today |
|---|---|---|
| Cellar under a town | A low brick cellar, damp, spilled grain | stand-in (`food`, `journal`) |
| Rat-runs and nest | An earth crawlway, gnawed brick, litter of husks | missing: a dim ground |
| Old drain | A brick culvert with water running along its floor | missing: a dim ground |
| Crypt under a churchyard | A low vault, coffin shelves pushed askew | stand-in (`perdition`, `death`, `vanity`, `dissolution`, in turn) |
| Ossuary | Bones stacked to the roof in courses, skulls in rows | stand-in (as the crypt) |
| Quarry adit and gallery | A square-cut gallery, pick-marks, webs at face height | missing: a dim ground |
| Spiders' brood-chamber | A crack opening into a cave hung with web and egg-sacs | missing: a dim ground |
| Barrow: passage-grave, halls of the dead, king's grave [3] | A stone-lined passage; a pillared hall of niches; a chamber with a grave-goods bier | stand-in (`perdition`, `death`, `vanity`, `dissolution`, varied by room; treasury `cup`, `silver`; stairs `meditation`) |
| Mine: adit, stope, shaft, haulage level [3] | Timbered galleries, a shaft with a ladder, tubs on rails | missing: a dim ground (stairs `meditation`, strongroom `silver`) |
| Cistern and waterworks [2] | A drowned vaulted cistern, pillars standing in black water | stand-in (`dissolution`, `narthex`) |
| Singing hall | A hall of the makers whose walls are cut in ribs | missing |
| Galleries of an argument (a makers' court) | A carved hall of benches and a dais underground | missing |
| A natural cave | A cave chamber, stalactites, a pool | missing: a dim ground (`grotto` is a sea cave only) |
| Under a site, generally [2] | A stair going down into the dark; a vault lit by one torch | covered (`dissolution`, `meditation`, `perdition`) |

## 6. Sea and coast

| Place | Brief | Today |
|---|---|---|
| Open shore and shingle | A shingle beach under a cliff, gulls | missing |
| Sea cliffs and a headland | Cliffs and a tower on the edge | covered (`tower`) |
| The open sea, from a boat [2] | Grey water to the horizon; a storm | covered (`wreck`, `tempest`) |
| Firth and estuary | A wide estuary of mudflats and channels at low water | missing |
| A ship's deck | A deck at sea, rigging and a rail | stand-in (`tempest`, `wreck`) |
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

## Where a commissioned painting goes

Every kind above is a `kinds` entry in scenery.json, with the words that name it: a painting of the open goes in its
kind's `ground`, one of a room in its `room` (a kind marked `plain` shows a dim ground until it has one). A kind's
paintings are given in turn to the differently named rooms of one site, so three or four per kind keeps a barrow or a
mine from repeating. An authored adventure's own place takes a painting by its id in `places`. Nothing in the engine
needs to change.

Most wanted, in order: a taproom (three), a forge, a cellar and the rat-runs, a natural cave from within, a mine
gallery, a town market-place, a town gate, a barrow from outside and its passage, a shrine room, a shop counter.
