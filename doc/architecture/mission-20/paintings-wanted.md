# Mission 20: paintings wanted

Gaps in the backgrounds, ranked by how often a newcomer meets them in the first hour. Sources: a survey of every room
a first-hour player can reach in `kahitude` (111 rooms, which painting each gets), `data/paintings/scenery.json`
(84 kinds, 46 with one painting or none), and the cold players' complaints (rounds 1–3). Each entry gives the file
name it would take, what it must show, and what it replaces now.

General rule from the cold plays: **light and state matter more than subject**. A pitch-dark room painted lit, or a
burnt chamber painted intact, was named every time; a slightly wrong building rarely was.

## 1. Underground, first hour (most seen)

| File | Show | Replaces now |
|---|---|---|
| `mine-adit-dark` | a low timbered adit lit only by one hand-held flame, the rest black | `mine-shaft` (18 rooms) and `mine-gallery` (11): lit, and the same two over and over |
| `mine-winze` | a shaft head inside the workings: windlass, ladder down into black | `mine-shaft` |
| `mine-working-face` | the end of a gallery: rock face, picks left, a cart, a seam | **nothing** ("the old working face" has no painting) |
| `mine-sump` | a flooded lower level, black water to the knees, timbers | `dissolution` |
| `pump-room` | an old pump-house below ground: beam engine or rag-and-chain pump, rust | `dissolution` |
| `ore-pass` | a chute and a loading platform, spilled ore | `mine-gallery` |
| `furnace-hall` | a cold smelting hall underground: hearths, slag, a chimney | `dissolution` |

## 2. Barrows (Dolorechies and the barrow kits)

| File | Show | Replaces now |
|---|---|---|
| `barrow-forecourt` | the mound's mouth outside: kerb stones, a seal-stone across the door, dusk | the ground painting |
| `barrow-passage` | a megalithic passage: upright slabs, a capstone roof, one's own light | `meditation` (a scholar's room) |
| `barrow-chamber` | a corbelled stone chamber, a bier or cist, grave goods | `perdition` (a stained-glass cathedral) — 10 rooms |
| `barrow-recess` | a side cell off the chamber: bones, pots, a niche | `meditation` |
| `barrow-stair` | steps cut down through rock into a mound | `meditation` |

## 3. The hobs' hold and the toll-house (Seolforfyrd)

| File | Show | Replaces now |
|---|---|---|
| `toll-hall` | a ruined stone toll-hall: a tariff board, a barrier pole, hob litter | `narthex` (a church porch) |
| `counting-room` | a small counting-room: a table, scales, an iron-bound chest | `cup` |
| `hob-cavern` | a smoky inhabited cave: fleeces, a fire, plunder heaped, bells hung clapperless | the cave mouth, repeated |
| `captives-pit` | a muck pit in a cave floor, a grating or rope, someone in it | `scene-cell` (a barred prison cell) |

## 4. Under the town (Thornhaven's corn-store, the undercroft, the vault)

| File | Show | Replaces now |
|---|---|---|
| `undercroft-dark` | a vaulted undercroft, unlit, a flagged floor, one flame | `undercroft` (lit candles in a forgotten place) |
| `corn-store-cellar` | a cellar of grain sacks and bins, rats' runs, a padlocked door | `scene-cellar` (also used for the warehouse and bonded cellar) |
| `warehouse` | a quay warehouse inside: bales, a hoist, a loft | `scene-cellar` |
| `brood-burnt` | the spider brood-chamber after fire: blackened sacs, ash, webs burnt to threads | the brood painting with the sacs intact (needs a state switch too) |
| `vault-sealed` | a small burial vault under a lifted flag: niches, a single sarcophagus | `perdition` |

## 5. Town places the first hour walks through

| File | Show | Replaces now |
|---|---|---|
| `village-gate-yard` | a small town's gate-yard: a timber gate, a guard's shed, carts | a gothic castle gate (Brockminster) |
| `town-lanes` | narrow lanes between houses, washing, a well | `chapel` |
| `town-houses` | a row of cottages from the street | `food` |
| `drill-yard` | a militia drill-yard: a practice post, spears in a rack | `herd` |
| `boat-sheds` | boat-sheds on a river or quay, hulls on trestles | `mill` |
| `landing` | a river landing at a small town: a jetty, barrels, a ferry | `trapper` |

## 6. Fallbacks (none exist)

The scenery has **no generic indoor painting and only three underground ones**, so any room the kinds do not name takes
whatever its site happens to have. Four quiet, nearly empty pictures would end most of the remaining mismatches:

- `indoors-plain` — a bare plastered room, a window, a table (daylight)
- `indoors-night` — the same by one candle
- `underground-dark` — rough rock, one flame, blackness beyond
- `underground-worked` — dressed stone corridor, one flame

## 7. Thin kinds (one painting or none) further out

Lower priority; each of these kinds has at most one painting, so every such place looks alike: brood, cell, chandlery,
cloth, drain, granary, guard, infirmary, shop, spicery, stable, stair, woodwork, villa, salt, nymphaeum, manor, mill,
gloriet, ballroom, arena, bailey, bees, bloomery, charcoal, dovecote, fair, furs, huts, maze, menagerie, mews, oasis,
oast, peat, reeds, stockade, stones, timber, tree. A second painting for **stable, shop, granary, stair and guard** would
reach the most places.

## Paintings already in `assets/bg` that nothing uses yet

These can be placed without new art (the builder's work, not a commission): `chandelry` (the chandlery kind has
one), `tannery`, `tallowhouse`, `fullery`, `mint-house`, `parchmentry`, `clockmaker`, `toymaker-workshop`,
`gaming-hall`, `farmhouse`, `log-cabin`, `campfire`, `crossroads`, `meadow-lane`, `wheat-field`, `river-vale`,
`river-vale-night`, `river-gorge`, `firth`, `city-market`, `city-harbor`, `city-neighborhood`, `city-shambles`,
`city-compound`, `portico`, `lone-tower`, `eyrie`, `jungle-falls`, `ancient-tree`, `enchanted-grove`,
`cartographers-guild`, `celestial-map`, `celestial-observatory`, `cliffside-villa`, `crystallarium`, `glowing-crystal`,
`glowing-pool`, `floating-disk`, `shimmering-veil`, `infinite-library`, `ruins-*` (cenotaph, tribunal, installation,
arcology, starship), `ecumenopolis`.

## Not paintings, but nearby

- An **iron torc** item icon (the torc shows gold and dragon-headed).
- **Tuck's portrait**: he shows a halfling acorn emblem rather than a face.
