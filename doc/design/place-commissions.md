# Place commissions (21 November)

A painting commission list for places, not people, drawn from the measured blanks in
[art-wishlist.md](art-wishlist.md): ten first-quarter walks of Iscoed (810 steps), the two acceptance routes, and
every one of Iscoed's 756 places under four skies. It is ordered by how much of the first hour each painting would
fill. The numbers are first-hour sightings out of 810 steps, or the places of a kind left blank under a sky.

**What to paint, in one line.** Porthalen rains for 673 of 810 steps, and nearly every first-hour painting is
sunlit, so the fit rules (data/paintings/fit.json) leave half the hour a dim ground. The cheapest fill is the same
subjects again **in rain, at dusk and at night**, not new subjects.

**Naming and binding.** Paint to the name given. In `seen.json` record what it shows, and its light (dawn, sunlit,
overcast, dusk, night, lamplit, dim) and weather (clear, rain, fog, storm, snow). The fit rules then choose it with
no code: rain refuses a sunlit painting, and fair weather refuses a rainy one (added 21 November). A painting is
seen as the place is: wide, no figure in the foreground who could be taken for someone met.

## Filled today

| Painting | Fills |
|---|---|
| `scene-harbor-rain` | the landing at Porthalen in rain, by day or night (wishlist 2: 254 sightings) |
| `scene-harbor-dusk` | the landing on a fair evening or night |
| `scene-harbor-dawn`, `scene-harbor-town` | the harbour kind at dawn and on a bright day |
| `scene-manor-study` | a library or muniment room in rain, Porthalen Hall's among them (wishlist 12: 39) |

## Tier 1: the first hour's own places

The places the warrior's and the mage's first hour walk through, in the sky they are most often met in.

| Paint as | Light, weather | Where met | How often | Brief |
|---|---|---|---|---|
| `scene-manor-forecourt-rain` | overcast, rain | Porthalen Hall's forecourt | 19 | A plain stone manor front under rain: wet gravel, a dripping portico, one lit window over the door, a chained gate beyond. |
| `scene-manor-dusk` | dusk, clear | the Hall, its loggia and walled garden | 6 of 7 manor places blank at evening | The same manor at dusk, a few windows lit, rooks going over; and its walled garden, wet, under low cloud. |
| `scene-salt-house` | dim, (any) | Holgar's salt-house | 16 | Inside a salt-house: sacks, a long counter, a scale and a tally-board, grey light from the door. (It is also a binding: the salt-house is drawn as the pans outside.) |
| `scene-boat-sheds-day` | overcast, rain | the boat-sheds | 12 | Open-fronted timber sheds over a slipway, hulls on trestles, tar-pots, rain off the eaves. |
| `scene-byre-rain` | lamplit, rain | the byre; the stable kind | 10 (4 of 4 stables blank in foul weather and after dark) | A low stone byre in wet weather, cattle steaming, straw underfoot, a lantern on a nail. |
| `scene-drill-yard-rain` | overcast, rain | the drill-yard behind the Stone Horn | 8 | A muddy yard, a practice post hacked pale, a spear rack under a lean-to, puddles. |
| `scene-deepwater-night` | night, clear | Deepwater: the drowned street, the dam's crest, the mere-side stair | 24 | A drowned village by moonlight: roofs above black water, a dam's crest against the sky, steps going down into the mere. |
| `scene-muniment-room-candle` | dim, (any) | the muniment room | 6 | A windowless room of presses and tagged chests by one candle, papers fanned under a green paperweight. (The manor study now serves in rain; a windowless room serves in every sky.) |
| `scene-waterside-rain` | overcast, rain | a town's waterside | 5 of 5 blank in foul weather | A town waterside in rain by day: steps down to the water, moored skiffs, a fish-market's shutters down. |

## Tier 2: the weir route's places (Gatesend)

| Paint as | Light, weather | Where met | How often | Brief |
|---|---|---|---|---|
| `scene-sea-bank` | overcast, (any) | the sea-bank at Gatesend | blank in every sky | A long turf sea-bank under a wide sky, the tide-line below, no boats: a wall against the water. |
| `scene-wardens-gatehouse-rain` | overcast, rain | the Wardens' gatehouse | 6 (route) | A squat sea-gate tower in driving rain, its windlass housing dark, the sluice below loud. |
| `scene-gate-yard-day` | overcast | the gate-yard of Gatesend | 5 (route) | A small walled gate-yard in grey daylight, a well and a herb-seller's door, nets drying. |
| `scene-gate-well-rain` | lamplit, rain | the gate-well under the gatehouse | 2 (route) | A stone shaft with a ladder and a chain, water roaring below, lit from above. |
| `scene-staithe-rain` | overcast, rain | the staithe at Reedbridge | 1 (route) | A river staithe of piled timber, a crane and a moored barge under rain. |
| `scene-reed-landing-rain` | overcast, rain | the reed landing in Mossfen | in the landing kind (4 of 6 blank in rain, evening, night) | A reed-bed landing of laid planks, a punt, mist on the water, rain. |

## Tier 3: kinds every generated country draws

These recur in every world, so each fills places well beyond Iscoed. The counts are Iscoed's.

| Paint as | Light, weather | Kind | Blank (Iscoed) | Brief |
|---|---|---|---|---|
| `scene-room-candle` | lamplit | a roof with no kind (cottages, rooms) | 12 of 14 in foul weather, evening, night | One plain lived-in room by candle: a hearth, a settle, a shuttered window. |
| `scene-stone-room-flame` | dim | the same, below ground or ruined | (same) | A bare stone room by one flame, a doorway into dark. |
| `scene-keep-gate-passage-fire` | lamplit | fort (keep rooms) | 8 of 20 | A keep's gate-passage by torchlight, the portcullis up, a guard-bench. |
| `scene-keep-chamber-fire` | lamplit | fort | (same) | A lord's chamber by firelight: a great bed, a chest, arrow-slit windows dark. |
| `scene-keep-broken-rain` | overcast, rain | fort, ruined | (same) | A broken keep in rain, roofless, ivy, water running down the stair. |
| `scene-bailey-rain`, `scene-bailey-night` | rain; night with a watch-fire | bailey | 4 of 4 | A castle bailey in rain, and the same at night with a watch-fire and a lit gate. |
| `scene-long-barrow` | overcast | barrow | 9 of 43 by day | A grassed long mound with a stone door, by grey day. |
| `scene-stones-mist`, `scene-dome-evening` | fog; dusk | stones | 3 of 11 | The hill-path to the old stones in mist; the dome at evening. |
| `scene-salt-pans-cloud`, `scene-boiling-house-dusk` | overcast; dusk | salt | 3 of 3 | Salt-pans under low cloud; a boiling-house steaming at dusk. |
| `scene-lanes-rain` | overcast, rain | lanes | 3 of 3 | The back lanes of a small town in rain. |
| `scene-counting-room-lamp` | lamplit | counting-room | 4 of 4 at evening and night | A counting-room by one lamp after hours: ledgers, a strongbox, the shutters closed. |
| `scene-well-rain` | overcast, rain | well | rain | A covered well in rain, a bucket on the lip. |
| `scene-charcoal-drizzle` | overcast, rain | charcoal | rain | Charcoal clamps smoking in drizzle at a wood's edge. |
| `scene-granary-lantern` | lamplit | granary | dark | A granary by lantern: sacks, a ladder to the loft. |
| `scene-chandlery-evening` | dusk | chandlery | evening | A chandlery at evening, candles lit in the window. |

## Not paintings

Two blanks need a binding, not a painting; they are for the engine or the data:
- Holgar's salt-house is an interior, but the scene chooses the salt-pans outside it.
- A group of a painted kind (the cellar's rats, the crypt's bats) reaches no plate.

## What this list does not yet know

- **Countries other than Iscoed were not walked.** Tier 3's kinds recur everywhere, but the counts are Iscoed's alone.
  A census of each generated world's places by kind and sky would rank Tier 3 for the whole game.
- **Rooms below ground** (the undertown's cellar, drain, undercroft, crypt and vault) were walked only where the gold
  led; their blanks in other lights are not counted.
