# Art wishlist: the blanks a player meets (21 November)

> **History.** Superseded by [doc/design/paintings-needed.md](../../design/paintings-needed.md), the one current list.

Measured on main (827040ca8), not remembered. It follows the 12 November list in
[doc/paintings/commission-list.md](../../paintings/commission-list.md). That list is still good for wild country, the
circus, Sarn and the Numbered House, and is not repeated here. This one ranks what the **first hour** meets.

## How it was measured

- **Walks:** ten first-quarter walks of Iscoed by the gold, 80 acts each (`scripts/first-quarter.ts`, replayed). Six
  were a warrior in each life (drove, debt, kin, herbs, order, wanderer); the others were a mage (drove, herbs), a
  cleric (debt) and a thief (kin). At each of the 810 steps the scene's own choice of painting was read
  (`Scenery.seen`), along with everyone shown with an emblem instead of a face.
- **Acceptance routes:** the two S3-0 routes (mission-22/s3-0, the warrior's drove and the mage's weir), counted by
  their places.
- **Every place of Iscoed:** all 756 places, each under four lights: fair day, rain by day, a clear evening, a clear
  night. This shows which kinds go blank in which weather.
- **Creation:** every playable ancestry, calling and presentation against `data/paintings/pcs.json`.

**How a blank happens.** A place shows a painting by its own binding, then by its kind (`data/paintings/scenery.json`),
then by a generic fallback. A painting is refused wherever it shows what the place's words, weather or hour deny
(`src/ui/fits.ts`, `data/paintings/fit.json`). Most scene paintings are **sunlit**, so the "foul weather" and
"evening or night" rules refuse them. When every painting of a kind is refused, the page draws a dim ground. People
with no likeness are drawn by an emblem; a member of the company with no fitting portrait is drawn by the first letter
of their name.

**The headline.** In **409 of the 810 walked steps (50 %) the scene had no painting.**
- It rains in Porthalen for 673 of the 810 steps.
- Every first-hour painting of the town is a sunlit day.
- The kinds have enough subjects. What they lack is **weather and light**.

## The top 15, by how often a first-hour player meets the blank

Counts are of the 810 walked steps unless marked "route" (visits on the two acceptance routes).

| # | slug | kind | where seen | how often | shown now | brief |
|---|---|---|---|---|---|---|
| 1 | `portrait-owain-cousin` | likeness | Owain, Bran's drover's boy (207), and Owain the kin life's cousin (49), on the landing | 256 | an emblem | A lanky boy of fourteen in a wet drover's smock, a hazel stick and a dog's lead, more worried than he lets on. Half-length, rain on his shoulders. |
| 2 | `scene-landing-rain` | scene | the landing at Porthalen, the opening and the hub of every life | 254 (route 6) | dim ground: `scene-landing` is sunlit | The same river landing under low rain: the jetty black with wet, a ferry under a tarpaulin, barrels steaming, lit windows along the water. No one in the foreground. |
| 3 | `portrait-gwil-pryce` | likeness | Gwil Pryce, boat-wright on the landing | 254 | an emblem | A broad man in a leather apron, sleeves rolled, adze in hand, wood shavings in his beard; a flat fen-boat's ribs behind him. |
| 4 | `portrait-guldrice-agent` | likeness | the Guldríce agent, keeper of the company's books, on the landing | 254 | an emblem | A careful clerk in good dark wool and a fur collar, a ledger under his arm and an ink-stained finger; a foreign merchant house's seal on his ring. |
| 5 | `portrait-osmund-pyle` | likeness | Osmund Pyle, the old man with a stick (the walk to the point) | 96 | an emblem | An old man with a bad hip and a stubborn chin, a blackthorn stick and a coin held tight; a good coat gone thin. |
| 6 | `portrait-isaure-venn` | likeness | Isaure Venn, scholar of the old script | 96 | an emblem | A tall woman of fifty in a travelling cloak, spectacles on a cord, rubbings rolled under her arm; patient and turned back twice. |
| 7 | `portrait-dannel-hobb` | likeness | Dannel Hobb, the boy kept indoors | 96 | an emblem | A boy of ten, pale, a white streak through dark hair, looking at the door before he speaks. |
| 8 | `portrait-carlin-eel-catcher` | likeness | Carlin, eel-catcher (taproom; a hire) | 96 | an emblem | A wiry fen woman in an oilskin, eel-glaive over her shoulder, wet to the knee, grinning. |
| 9 | `portrait-aster-factor` | likeness | Aster, factor of the Founders' Exchange, who buys old bronze | 96 | an emblem | A smooth man in an Exchange coat with a brass badge, scales in a case at his feet, looking at your bronze, not at you. |
| 10 | `portrait-factors-hands` | likeness (group) | the factor's hands | 96 | an emblem | Two hard men in leather jerkins, cudgels at their belts, one with a broken nose; behind someone else, waiting. |
| 11 | `portrait-leofric-hiring-man` | likeness | Leofric, the Spade-Company's hiring-man, with a cart | 40 | an emblem | A cheerful red-faced man on a cart-tail, a sheaf of papers and a spade-badge, waving the company over. |
| 12 | `scene-library-candle` | scene, room | Porthalen Hall's library (the seal aim, the press-door) | 39 | dim ground: `scene-library` shows sunlight through windows | A country house library on a wet afternoon: shelves to the ceiling, one candle on a reading stand, rain on the window, a press-door painted shut in the panelling. |
| 13 | `portrait-wimble` | likeness | Wimble, the kitchen boy who went up to the dome | 24 | an emblem | A thin boy in a scullion's apron, looking past whoever is speaking, humming four notes. |
| 14 | `scene-manor-forecourt-rain` | scene | the forecourt of Porthalen Hall | 19 | dim ground: `scene-manor` is sunlit | A plain stone manor front under rain: wet gravel, a dripping portico, one lit window over the door, a chained gate beyond. |
| 15 | `portrait-drovers-lad` | likeness | the drover's lad from over the fells, his dog at heel | 18 | an emblem | A hill boy with a sheepdog pressed to his leg and no drove behind him; a crook too big for him. |

Close behind the top 15:

| slug | kind | where seen | how often | shown now | brief |
|---|---|---|---|---|---|
| `scene-salt-house` | scene, room | Holgar's salt-house, interior | 16 | dim ground in rain; by day the salt-pans outside | Inside a salt-house: sacks, a long counter, a scale and a tally-board, grey light from the door. |
| `scene-boat-sheds-day` | scene | the boat-sheds | 12 | dim ground by day: the only painting is at evening | Open-fronted timber sheds over a slipway, hulls on trestles, tar-pots, rain off the eaves. |
| `portrait-silas-mardle` | likeness | Silas Mardle, the Rì's customs clerk | 12 | an emblem | A dry little man in a customs cap behind a grille, tally-sticks in a rack, counting. |
| `scene-byre-rain` | scene, room | the byre | 10 | dim ground in rain | A low stone byre in wet weather, cattle steaming, straw underfoot, lantern on a nail. |
| `portrait-bran-ap-ifor` | likeness | Bran ap Ifor, the lead-drover held behind the grille | 10 | an emblem | A big grey-bearded drover in a wet cloak, hands on the bars, furious and polite. |
| `scene-drill-yard-rain` | scene | the drill-yard behind the Stone Horn | 8 | dim ground in rain | A muddy yard with a practice post hacked pale, a spear rack under a lean-to, puddles. |
| `scene-deepwater-night` | scene | Deepwater, the drowned street, the dam's crest and the mere-side stair | 24 together | dim ground at night | A drowned village by moonlight: roofs above black water, a dam's crest against the sky, steps going down into the mere. |
| `scene-muniment-room-candle` | scene, room | the muniment room | 6 | dim ground (a library, sunlit, is refused) | A windowless room of presses and tagged chests by one candle, papers fanned under a green paperweight. |
| `portrait-rats-cellar`, `-bats-crypt`, `-keeper-of-the-mere` | creature (group) | the Hall cellar's rats, the crypt's bats, the keeper of the mere | 9, 3, 5 | an emblem: a group of a painted kind reaches no plate | A plate for a *group*: a dozen rats in a cellar's lantern light; bats wheeling down a vault; a cold shape under black water. |

## The two acceptance routes (Gatesend and the drove road)

| slug | where seen | how often (route) | shown now | brief |
|---|---|---|---|---|
| `scene-wardens-gatehouse-rain` | the Wardens' gatehouse | 6 | dim ground in rain (`scene-keep-gatehouse` sunlit) | A squat sea-gate tower in driving rain, its windlass housing dark, the sluice below loud. |
| `scene-gate-yard-day` | the gate-yard of Gatesend | 5 | dim ground by day: only evening paintings | A small walled gate-yard in grey daylight, a well and a herb-seller's door, nets drying. |
| `scene-sea-bank` | the sea-bank at Gatesend | 3 | nothing in any light (the one sea painting shows ships, which a sea-bank denies) | A long turf sea-bank under a wide sky, the tide-line below, no boats: a wall against the water. |
| `scene-gate-well-rain` | the gate-well under the gatehouse | 2 | dim ground in rain | A stone shaft with a ladder and a chain, water roaring below, lit from above. |
| `scene-staithe` | the staithe at Reedbridge | 1 | dim ground in rain | A river staithe of piled timber, a crane and a moored barge under rain. |
| `portrait-gek-herb-wife`, `portrait-wat-collier` | the gate-yard's people | route | emblems | A herb-wife selling from her door, bunches hung to dry; a young collier black to the elbows. |

## Creation and the company

**Creation's portrait grid** (`data/paintings/pcs.json`) has **64 empty cells** among the 15 playable ancestries and 7
callings. A member there is drawn by the first letter of their name:
- **half-elf:** every calling, man and woman (14);
- **fae:** mage, thief, cleric, bard (8);
- **glimmerkin:** mage, thief, ranger (6);
- **halfling:** warrior, thief, bard (6);
- **gnome:** mage, thief, bard (6);
- **half-orc:** warrior, thief, ranger (6);
- **lizardfolk:** warrior, thief, ranger (6);
- **goblin:** thief, ranger (4);
- **sylph:** mage, cleric (4);
- **undine:** mage, cleric (4).

Each is wanted head and shoulders in the style of the existing grid: the calling's colours, the people's own features
(no human painted as a lizardfolk: CP-04), and the face in the upper third.

## The rest of Iscoed, by kind (each place under four lights)

What goes blank, and in which light. "Fair / foul / evening / night" counts the kind's places with no painting under
that light.

| kind | places | blank fair / foul / evening / night | wanted |
|---|---|---|---|
| (a roof and no kind) | 14 | 0 / 12 / 12 / 12 | One plain lived-in room by candle, and one stone room by one flame (still wanted from 10 November). |
| fort (keep rooms) | 20 | 1 / 8 / 8 / 8 | A keep's gate-passage and lord's chamber by firelight; a broken keep in rain. |
| barrow (long mounds) | 43 | 9 / 9 / 0 / 0 | A grassed long mound with a stone door by grey day. |
| manor | 7 | 0 / 6 / 6 / 6 | The Hall's loggia and walled garden in rain; the Hall at dusk. |
| landing | 6 | 0 / 4 / 4 / 4 | River and reed landings in rain and at dusk (item 2, and the reed landing in Mossfen). |
| stable | 4 | 0 / 4 / 4 / 4 | A byre and a long stable by lantern. |
| bailey | 4 | 0 / 4 / 4 / 4 | A bailey in rain, and at night with a watch-fire. |
| salt | 3 | 0 / 3 / 3 / 3 | Salt-pans under low cloud, a boiling-house steaming at dusk. |
| stones | 11 | 0 / 3 / 3 / 3 | The hill-path to the old stones in mist; the dome at evening. |
| lanes | 3 | 0 / 3 / 3 / 3 | Back lanes of a small town in rain; a drowned street at night. |
| counting-room | 4 | 0 / 0 / 4 / 4 | A counting-room by one lamp after hours. |
| waterside | 5 | 0 / 5 / 0 / 0 | A town waterside in rain by day. |
| well, charcoal, granary, market, chandlery, stair | 2–8 each | rain or dark | A covered well in rain; charcoal clamps smoking in drizzle; a granary by lantern; a chandlery at evening, candles lit in the window. |
| sea | 1 | blank in every light | Item: `scene-sea-bank`. |

## Notes for whoever paints or binds

- **Variants first.** The same subject in rain and at dusk fills more of the first hour than any new subject. Name
  variants `<slug>-rain`, `<slug>-dusk` and `<slug>-night`, and say their light and weather in `seen.json`. The Fits
  rules then choose them without code.
- **Two blanks need a binding, not a painting.**
  - Holgar's salt-house is an interior but is shown the salt-pans outside it.
  - A group of a painted kind (the rats, the bats) has no plate.
  Both are engine or data fixes to raise beside the commissions.
- Each painting wide, with no figure in the foreground who could be taken for someone met, and seen as the place is
  (the doctrine's first rule: an invitation, not an inventory).
