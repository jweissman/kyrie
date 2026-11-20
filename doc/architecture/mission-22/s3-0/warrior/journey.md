# Journey review: --world iscoed --as human/warrior/Wenna

Recorded live, as it was played, at ef84f0ff3, 2026-11-20T19:24:36.163Z.
The lines: doc/architecture/mission-22/s3-0/warrior-lines.txt.
53 lines sent, 46 of them consequential; 54 scenes.

| shown | exact | producer only | unknown |
|---|---|---|---|
| lines | 110 (52%) | 90 (43%) | 11 (5%) |
| words | 3312 (73%) | 1090 (24%) | 142 (3%) |
| narration lines | 107 (82%) | 12 (9%) | 11 (8%) |
| narration words | 3227 (89%) | 250 (7%) | 142 (4%) |
| choices offered | 2483 (84%) | 467 (16%) | 15 (1%) |

- unknown, 7 lines (84 words): an event line no producer of this step made whole
- unknown, 4 lines (58 words): no producer of this step made it

Each told line is quoted as shown. Marks after a line: · its maker is known only by what produced it (the engine, or the person or thing it is of); ? its maker is unknown. A line with no mark is known exactly: `bin/kyrie review step <dir> <n>` names it.

## the landing at Porthalen

**The opening**

> Down the drove road
>
> Eleven days you have walked Bran ap Ifor’s drove down from the fells to sell. The last mile, in the dark, was the worst.
>
> Porthalen came at first light, all salt-houses and masts. The customs-men were waiting at the march-stone with their staves. They counted, and they took Bran. He went without a word, only throwing his tally-stick down at your feet. The drove is in the pens behind the customs-house. Owain is at your elbow, your cousin, fourteen and frightened.
>
> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it. Gulls sit along it in a row, facing the wind, over the slap of water on stone.
>
> Owain stands at the edge of the quay with his hands in his armpits, watching the customs-house door.
>
> You see the dues-receipt nailed to the post and Bran’s tally-stick. ·
>
> An aim: Ask Owain how many head came down · follow 1 ·
>

Offered: Ask Owain how many head came down · Ask Owain how many head came down · To the customs-house · Talk to the tinker's daughter — ask why she was left behind · and 68 more.

**1. “Ask Owain how many head came down”** (primary; drove__owain_count_t) · consequential 1 · Day 1, 8:00 a.m.

> ‘Thirty-six,’ says Owain at once, and then, because you are listening: ‘There were forty at Hafod. At the Black Rhyne the bank went from under the last of them, in the dark. We heard them in the water. Bran said leave them, or we’d lose the rest.’ He points with his chin, behind the pens. ‘They’re still there.’
>
> Patch barks twice, then comes to see who you are.
>
> Over the salt-houses only one chimney is smoking, thin and grey. A salter stands in a doorway with his arms folded, looking up the river for the fuel boat from Reedbridge, two days late.
>
> A notice is nailed to the post by the well, newer than the others, the reeve’s seal at its foot.
>
> On the landing a man is caulking the seams of a flat-bottomed boat no longer than a cart, and three more stand finished on trestles with a chalked price on each: thirty.
>

- Learned: drove__boy_count, gate__boat_offer, gate__gate_posted, pans__chimney, region__s1_why
- Moved: drove__owain region__s1_green → drove__pens
- Aims taken up: drove__held_rhyne
- Aims gone: drove__held_aim
- By Rule drove__owain_to_pens (rule fired): - at(drove__owain, region__s1_green); + at(drove__owain, drove__pens)
- By Rule howe__last_fate_broken (rule fired): - at(howe__last, howe__behind); - state(howe__lastseal, howe__set); + howe__last_fate_applied(); + state(howe__lastseal, howe__broken)
- By Rule region__s3_dear (rule fired): - goodsPrice(region__s3_innkeeper, rations) = 2; + goodsPrice(region__s3_innkeeper, rations) = 3
- By Rule region__s4_dear (rule fired): - goodsPrice(region__s4_innkeeper, rations) = 3; + goodsPrice(region__s4_innkeeper, rations) = 4
- By Rule howe__seal_known_broken (rule fired): - state(howe__seal, howe__set); + howe__seal_fate_applied(); + state(howe__seal, howe__forced)
- By Rule tower__well_floods (rule fired): - state(tower__well_water, tower__dry); + state(tower__well_water, tower__flooded)
- By Rule factors__abroad_noted (rule fired): + factors__seenAbroad(factors__principal) = 1
- By Rule temper_greets (rule fired): + greeted(region__s1_inndog, party); + tolerates(region__s1_inndog, party)
- By Rule stood_first (rule fired): + stoodAt(party, region__s1_green)

Offered: Search for the four that went in · To the customs-house · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 67 more.

**2. “follow drove__held_rhyne”** (asked; {"follow":"drove__held_rhyne"}) · not consequential · Day 1, 8:00 a.m.

> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it. Gulls sit along it in a row, facing the wind, over the slap of water on stone. The Whitewater runs by below the houses. The boat-sheds are short of oak this year: the Hall has chained the road-wood, and the good timber is behind it. At dusk every dog in the town turns its head toward the hill, and the geese go silent.
>
> Porthalen came at first light, all salt-houses and masts. The customs-men were waiting at the march-stone with their staves. They counted, and they took Bran. He went without a word, only throwing his tally-stick down at your feet. The drove is in the pens behind the customs-house. Owain is at your elbow, your cousin, fourteen and frightened.
>
> Eleven days you have walked Bran ap Ifor’s drove down from the fells to sell. The last mile, in the dark, was the worst.
>
> Across the green the customs-house door stands open, and a customs-man in the Rì’s blue leans on the jamb with his staff. From the pens beyond comes the bawling of cattle nobody has fed.
>
> A boat is coming in under half its sail, and a man waits on the quay with a coil of rope over his arm.
>
> Sabine is crying wares along the street: pots mended, knives ground.
>
> Thurstan is showing a boy how to hold a staff, and correcting his feet without a word.
>
> Aldred stands by the door with a cudgel at his belt, watching the street.
>
> Baldric the painting master is weighing a handful of nails on a small brass scale.
>
> The inn’s dog lies across the doorstep of the Stone Horn with his chin on his paws, and watches who comes.
>
> A woman in black sits on the step of a cold house with her hands in her lap, watching the road.
>
> Dandelions stand in the grass, yellow and seeding: a tea of them cleans the blood.
>
> A bay tree grows in the gardens about the green, dark and glossy, clipped for its leaves.
>
> A notice is nailed to the post by the well, written over in several hands.
>
> A strip of vellum is nailed to the post by the well, in a fair clerk’s hand, with a lead seal pressed in a blob of wax.
>
> A notice in a clerk’s hand is nailed to the post by the well: THE SEA-GATE AT GATESEND IS TO BE MENDED BEFORE THE SPRING TIDE. THIRTY CROWNS OF THE REEVE TO WHOEVER MENDS IT. A. TALFRYN, REEVE.
>
> The spring-head by the green has been running low for a year. The rope comes up with a hand’s depth of brown water in the bucket and a smell of wet stone, and the women who draw it do so in silence, to save breath.
>
> Bran’s tally-stick lies on the cobbles at your feet, where he threw it to you.
>
> The Guldríce agent, who keeps the books of the Guldríce company, is here. The tinker’s daughter, a tinker’s daughter left behind when the cart went on, picking a lock on a strongbox for the fun of it, is here. Aldous Fenn, the reeve of the wood-wardens, who license the cutting in the woods round Porthalen, is here. So are Hesper Lowe, the surveyor’s son, Ffion Wyn, Reeve Annis Talfryn, Gwil Pryce and the woman in black. ·
>
> Following: Search the Black Rhyne behind the pens for the four that went in. ·
>
> Provisions: Food for 2 days. ·
>

Offered: To the drove pens (led) · To the customs-house · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 66 more.

**3. “Collect Bran's tally-stick for Wenna”** (rest; take_item(origin__stick,region__member_party_1)) · consequential 2 · Day 1, 8:01 a.m.

> You take Bran’s tally-stick.
>

- Came into the company's hands: origin__stick

Offered: To the drove pens (led) · To the customs-house · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 67 more.

## the drove pens

**4. “To the drove pens”** (led; go(drove__pens_gate,drove__pens)) · consequential 3 · Day 1, 8:11 a.m.

> Thirty-six black bullocks of the fells, rough-coated and restless, crowd the rails, bawling to be watered.
>
> Owain is carrying water to them a bucket at a time, in a cloak too big for him.
>
> Following: Search the Black Rhyne behind the pens for the four that went in. ·
>

- Moved: party region__s1_green → drove__pens
- Time: 1 watch
- By Rule came_here (rule fired): - stoodAt(party, region__s1_green); + arrivedAt(party) = 1; + stoodAt(party, drove__pens)

Offered: To the Black Rhyne, behind the pens (led) · To the customs-house · Water the drove from the pens' trough · To the landing at Porthalen · and 23 more.

**5. “Read Bran's tally-stick”** (rest; read_item(origin__stick)) · consequential 4 · Day 1, 8:13 a.m.

> Bran’s tally-stick has thirty-six notches for the drove, and four more cut through at the Black Rhyne.
>

- Learned: origin__tally

Offered: To the Black Rhyne, behind the pens (led) · To the customs-house · Water the drove from the pens' trough · To the landing at Porthalen · and 22 more.

## the Black Rhyne, behind the pens

**6. “To the Black Rhyne, behind the pens”** (led; go(drove__rhyne_bank,drove__rhyne)) · consequential 5 · Day 1, 8:23 a.m.

> A dyke of black water between steep banks, the far bank slumped into it where the sea came over in the winter. The smell reaches you before the sight does.
>
> Following: Search the Black Rhyne behind the pens for the four that went in. ·
>

- Moved: party drove__pens → drove__rhyne
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 1; - stoodAt(party, drove__pens); + arrivedAt(party) = 2; + stoodAt(party, drove__rhyne)

Offered: Search here · To the customs-house · and 23 more.

**7. “Search here”** (primary; search(drove__rhyne)) · consequential 6 · Day 1, 8:43 a.m.

> With care, a little at a time, you search the Black Rhyne, behind the pens.
>
> Down where the bank has slumped, under the black water, something big and dark: a bullock, and another beyond it, four in all, the brand of a Brynach drove burnt into each flank. They have been there since last night.
>
> Following: Tell the customs clerk what you found, at his counter or before the reeve on the green, and have Bran let out. ·
>

- Learned: drove__found_drowned
- Aims taken up: drove__held_proof
- Aims gone: drove__held_rhyne
- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: To the customs-house (led) · To the taproom of the Stone Horn · To the shrine of Nodens · To Holgar's salt-house · and 20 more.

**8. “look”** (asked; {"look":true}) · not consequential · Day 1, 8:43 a.m.

> A dyke of black water between steep banks, the far bank slumped into it where the sea came over in the winter. The smell reaches you before the sight does.
>
> Following: Tell the customs clerk what you found, at his counter or before the reeve on the green, and have Bran let out. ·
>
> Provisions: Food for 2 days. ·
>

Offered: To the customs-house (led) · To the taproom of the Stone Horn · To the shrine of Nodens · To Holgar's salt-house · and 20 more.

**9. “follow drove__held_proof”** (asked; {"follow":"drove__held_proof"}) · not consequential · Day 1, 8:43 a.m.

> A dyke of black water between steep banks, the far bank slumped into it where the sea came over in the winter. The smell reaches you before the sight does.
>
> Following: Tell the customs clerk what you found, at his counter or before the reeve on the green, and have Bran let out. ·
>
> Provisions: Food for 2 days. ·
>

Offered: To the customs-house (led) · To the taproom of the Stone Horn · To the shrine of Nodens · To Holgar's salt-house · and 20 more.

## the drove pens

**10. “To the drove pens”** (rest; go(drove__rhyne_bank,drove__pens)) · consequential 7 · Day 1, 8:53 a.m.

> Thirty-six black bullocks of the fells, rough-coated and restless, crowd the rails, bawling to be watered.
>

- Moved: party drove__rhyne → drove__pens
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 2; - stoodAt(party, drove__rhyne); + arrivedAt(party) = 5; + stoodAt(party, drove__pens)
- By Rule lingers (rule fired): - lingered(party) = 2

Offered: To the customs-house (led) · Water the drove from the pens' trough · To the landing at Porthalen · and 23 more.

## the landing at Porthalen

**11. “To the landing at Porthalen”** (primary; go(drove__pens_gate,region__s1_green)) · consequential 8 · Day 1, 9:03 a.m.

> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it.
>

- Moved: party drove__pens → region__s1_green; region__s1_s5_way_t region__s1_taproom → region__s1_s5_way; region__s2_s3_way_t region__s2_taproom → region__s2_s3_way; region__s2_s4_way_t region__s2_taproom → region__s2_s4_way; region__s4_s3_way_t region__s4_taproom → region__s4_s3_way; region__s5_s2_way_t region__s5_taproom → region__s5_s2_way
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 5; - stoodAt(party, drove__pens); + arrivedAt(party) = 6; + stoodAt(party, region__s1_green)
- By Rule region__s1_s5_way_t_out (rule fired): - at(region__s1_s5_way_t, region__s1_taproom); + at(region__s1_s5_way_t, region__s1_s5_way)
- By Rule region__s2_s3_way_t_out (rule fired): - at(region__s2_s3_way_t, region__s2_taproom); + at(region__s2_s3_way_t, region__s2_s3_way)
- By Rule region__s2_s4_way_t_out (rule fired): - at(region__s2_s4_way_t, region__s2_taproom); + at(region__s2_s4_way_t, region__s2_s4_way)
- By Rule region__s4_s3_way_t_out (rule fired): - at(region__s4_s3_way_t, region__s4_taproom); + at(region__s4_s3_way_t, region__s4_s3_way)
- By Rule region__s5_s2_way_t_out (rule fired): - at(region__s5_s2_way_t, region__s5_taproom); + at(region__s5_s2_way_t, region__s5_s2_way)

Offered: Call Mardle out to the reeve, and say what you found before her · To the customs-house (led) · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 68 more.

**12. “Call Mardle out to the reeve, and say what you found before her”** (primary; drove__before_reeve(party,region__s1_green)) · consequential 9 · Day 1, 9:23 a.m.

> The reeve sends the customs-man in for Mardle, and he comes out onto the step with the tally-book under his arm. You tell it in front of all three of them: the four bullocks in the Black Rhyne, a Brynach brand on each. Mardle says that beasts in a ditch prove nothing to the Rì’s book, and the customs-man beside him says nothing at all, and will not look at you. The reeve hears it out. ‘The book is his,’ she says at last, ‘and I will not take it off him for a ditch. But no drover is held here for beasts the sea took.’ She sends the customs-man to open the grille. Mardle watches you from the step until Bran is out.
>
> ‘Now I sell them, and drink, and go home,’ says Bran. ‘Up the drove road to Caer Brynach, four days with an empty drove.’ He grips your hand like a gate-post. ‘Come up the pass. There’s work in Brynach for anyone who’ll stand by a drover, and the lord pays for a sword: something has been at the cattle on the high pasture. Say Bran ap Ifor sent you.’
>
> Wenna gains 150 experience: saw Bran ap Ifor let out of the customs-house. ?
>

- Learned: drove__reeve_ruled, drove__road_west
- Moved: drove__bran drove__customs → drove__pens; drove__owain drove__pens → region__s1_green
- Aims gone: drove__held_proof, drove__bran_aim
- Time: 2 watches
- By Rule drove__bran_out (rule fired): - at(drove__bran, drove__customs); + at(drove__bran, drove__pens)
- By Rule drove__owain_goes (rule fired): - at(drove__owain, drove__pens); + at(drove__owain, region__s1_green)
- By Rule drove__m_freed_achieved (rule fired): + achieved(drove__m_freed)
- By Rule drove__bran_thanks (rule fired): + drove__thanked(party)
- By Rule lingers (rule fired): + lingered(party) = 2
- By Rule drove__word_old (rule fired): + stale(drove__held)

Offered: Ask the Guldríce agent about the king-barrow · Ask Owain what he will do now · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · Wrench the padlock's hasp out of the old door · and 68 more.

## the taproom of the Stone Horn

**13. “Into the Stone Horn by the door”** (rest; go(region__s1_inn_door,region__s1_taproom)) · consequential 10 · Day 1, 9:24 a.m.

> A busy room in two parts with a counter between them, and a stair going up to the bedrooms. It smells of roasting meat, and the clatter of the kitchen comes through the back door.
>
> ‘Carlin there is looking for work,’ says Kynes. ‘Would go anywhere with anyone, for a few coins and their keep.’
>
> You see a wax tablet in a wooden case. ·
>

- Moved: party region__s1_green → region__s1_taproom
- By Rule came_here (rule fired): - arrivedAt(party) = 6; - stoodAt(party, region__s1_green); + arrivedAt(party) = 8; + stoodAt(party, region__s1_taproom)
- By Rule lingers (rule fired): - lingered(party) = 2

Offered: Talk to Carlin — ask whether she would come along · Talk to Kynes — ask what the waterfront is saying · Read the strokes on the wax tablet · Read a notice from Merrowdale · and 28 more.

**14. “Talk to Kynes — ask what the waterfront is saying”** (primary; drove__keeper_after) · consequential 11 · Day 1, 9:24 a.m.

> ‘That you got the Brynach drover out from under Mardle,’ says Kynes, and puts a loaf on the counter and pushes it across. ‘For the road.’
>
> ‘And on the green, before the reeve, with half the waterfront watching. He keeps his book. But he’ll count the next drove straight, with her looking.’
>

- By Rule drove__heard_ruled (rule fired): + drove__told(party)

Offered: Ask Kynes about the forty crowns in Merrowdale · Talk to Carlin — ask whether she would come along · Read the strokes on the wax tablet · Read a notice from Merrowdale · and 28 more.

**15. “Talk to Carlin — ask whether she would come along”** (primary; region__s1_traveller_brings) · consequential 12 · Day 1, 9:24 a.m.

> ‘The eels are not running. Nothing is, this season.’ Carlin looks you over. ‘If you are going anywhere, I would come along. 6 coin, and my keep.’
>
> Carlin would join the company: a human ranger of level 1, asking 6 coin. Can defend, call animal companion, set spear, hunter's mark, ensnare. ·
>

Offered: Ask Carlin to join the company · Read the strokes on the wax tablet · Read a notice from Merrowdale · To the south road, past the Exchange's yard · and 28 more.

**16. “Ask Carlin to join the company”** (primary; recruit(region__s1_traveller)) · consequential 13 · Day 1, 9:29 a.m.

> Carlin counts the coin twice, puts it away, and shoulders her pack. ‘Where are we going, then?’
>

Withdrawn: Buy a torch for Wenna · 1 coin · Buy a candle for Wenna · 1 coin.
Offered: Read the strokes on the wax tablet · Read a notice from Merrowdale · To the south road, past the Exchange's yard · Out to the landing at Porthalen · and 43 more.

## Holgar's salt-house

**17. “To Holgar's salt-house”** (rest; travel:region__s1_shop) · consequential 14 · Day 1, 9:31 a.m.

> Salt in sacks stacked to the rafters, barrels of fish in brine along the wall, and a smell of tar and the sea that gets into everything.
>

- Moved: party region__s1_taproom → region__s1_shop
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 8; - stoodAt(party, region__s1_taproom); + arrivedAt(party) = 9; + stoodAt(party, region__s1_shop)

Offered: Ask Holgar about the old kingdom · To the boiling-house behind the salt-house · To the shrine of Nodens · To Mabel's chandlery · and 44 more.

**18. {"act":"pans__trader_cold"}** (not in the scene before) · consequential 15 · Day 1, 9:31 a.m.

> Holgar wipes salt off both hands. ‘No fuel. The boat from Reedbridge is two days late and there’s not a stick to be had in Porthalen: the ridge wood is the reeve’s and the peat is wet. Three days cold and the brine’s spoiled, and the season with it.’ A look at your arms. ‘If you’ve a back, I’ll pay for it. Get me fuel and there’s work here after.’
>

- Learned: pans__cold
- Aims taken up: pans__cold_aim

Offered: Find out what has become of Holgar's fuel boat at Reedbridge · Ask Holgar about the old kingdom · To the boiling-house behind the salt-house · To the shrine of Nodens · and 54 more.

**19. “follow pans__cold_aim”** (asked; {"follow":"pans__cold_aim"}) · not consequential · Day 1, 9:31 a.m.

> Salt in sacks stacked to the rafters, barrels of fish in brine along the wall, and a smell of tar and the sea that gets into everything.
>
> Holgar, a salter, is here. ·
>
> Following: Find out what has become of Holgar's fuel boat at Reedbridge: the salt-pans at Porthalen go cold in three days without it. ·
>
> Provisions: Food for 3 days. ·
>

Offered: Set out for Reedbridge (led) · Ask Holgar about the old kingdom · To the boiling-house behind the salt-house · To the shrine of Nodens · and 53 more.

## the bridge-foot at Reedbridge

**20. “Set out for Reedbridge”** (led; travel:region__s5) · consequential 16 · Day 1, 2:32 p.m.

> Reedbridge is a crossing with houses at each end of it, the near end the larger, and the Whitewater between them, brown and quick. On this side the mud is churned by hooves and cartwheels down to the water’s edge.
>
> Gamel is going round the cart wheel by wheel, a kick and a look at each.
>
> You see the dues-receipt on the lintel. ·
>
> Smut comes to wind once round your ankles, and goes back to her place.
>
> Following: Find out what has become of Holgar's fuel boat at Reedbridge: the salt-pans at Porthalen go cold in three days without it. ·
>

- Learned: region__s5_why
- Moved: party region__s1_shop → region__s5_green
- Time: 30 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 9; - stoodAt(party, region__s1_shop); + arrivedAt(party) = 39; + stoodAt(party, region__s5_green)
- By Rule temper_greets (rule fired): + greeted(region__s5_cat, party); + greeted(region__s5_inndog, party); + tolerates(region__s5_cat, party); + tolerates(region__s5_inndog, party)
- By Rule region__s2_s3_way_t_trouble (rule fired): + region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_trouble (rule fired): + region__inTrouble(region__s5_s2_way_t)

Offered: To the staithe at Reedbridge (led) · Talk to Bartle — talk shop with Bartle · Read the dues-receipt on the lintel · Talk to Luthor — ask about the old paved road · and 65 more.

## the staithe at Reedbridge

**21. “To the staithe at Reedbridge”** (led; go(pans__staithe_lane,pans__staithe)) · consequential 17 · Day 1, 2:42 p.m.

> A flat-bottomed fuel boat lies tied up at the staithe, sacks of charcoal heaped in her waist. On the bank a man sits with his arm strapped across his chest, looking at her.
>
> You see two sacks of charcoal. ·
>
> Following: Bring Holgar, salter at Porthalen, fuel from Ianto's boat at Reedbridge: pole her down the cut, or carry two sacks. ·
>

- Learned: pans__boatman
- Moved: party region__s5_green → pans__staithe
- Aims taken up: pans__cold_fetch
- Aims gone: pans__cold_aim
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 39; - stoodAt(party, region__s5_green); + arrivedAt(party) = 40; + stoodAt(party, pans__staithe)

Offered: Pole Ianto's fuel boat down the cut to Porthalen · likely · one try · To Afran's alehouse · To the crossing stones · To the bridge-foot at Reedbridge · and 39 more.

**22. {"act":"talk:pans__ianto"}** (not in the scene before) · not consequential · Day 1, 2:42 p.m.

> Ianto, the fuel boatman of Reedbridge, with a broken arm ?
>

Offered: Ask Ianto about the fuel boat · Ask Ianto why nobody will take her through the cut · and 43 more.

**23. “Pole Ianto's fuel boat down the cut to Porthalen · likely · one try”** (rest; pans__pole_boat) · consequential 18 · Day 1, 3:42 p.m.

> The boat is heavy and the cut is half-silted below the staithe where the sluice has let the sea in, and twice you ground her on the mud and lever her off with the pole. Then she is clear, low in the water and going down with the ebb, and Porthalen is the rest of the way down the cut.
>
> Following: Bring Ianto's fuel boat down the cut to Holgar's salt-house at Porthalen. ·
>

- Learned: pans__poled
- Moved: region__s1_s5_way_t region__s1_s5_way → region__s5_taproom; region__s2_s4_way_t region__s2_s4_way → region__s4_taproom; region__s4_s3_way_t region__s4_s3_way → region__s3_taproom
- Aims taken up: pans__cold_down
- Aims gone: pans__cold_fetch
- Time: 6 watches
- By Rule region__s1_s5_way_t_in0 (rule fired): - at(region__s1_s5_way_t, region__s1_s5_way); - region__journeysTo(region__s1_s5_way_t, region__s5_green); + at(region__s1_s5_way_t, region__s5_taproom); + region__journeysTo(region__s1_s5_way_t, region__s1_green)
- By Rule region__s2_s4_way_t_in0 (rule fired): - at(region__s2_s4_way_t, region__s2_s4_way); - region__journeysTo(region__s2_s4_way_t, region__s4_green); + at(region__s2_s4_way_t, region__s4_taproom); + region__journeysTo(region__s2_s4_way_t, region__s2_green)
- By Rule region__s4_s3_way_t_in0 (rule fired): - at(region__s4_s3_way_t, region__s4_s3_way); - region__journeysTo(region__s4_s3_way_t, region__s3_green); + at(region__s4_s3_way_t, region__s3_taproom); + region__journeysTo(region__s4_s3_way_t, region__s4_green)
- By Rule lingers (rule fired): + lingered(party) = 6

Offered: Set out for Porthalen (led) · Ask Ianto about the fuel boat · To Afran's alehouse · To the bridge-foot at Reedbridge · and 39 more.

## the landing at Porthalen

**24. “Set out for Porthalen”** (led; travel:region__s1) · consequential 19 · Day 1, 8:52 p.m.

> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it.
>
> Up on the hill above the roofs, in the dome of the old stones, a pale light goes round and round.
>
> The bailiff’s men have been through again. The price is five crowns a hearth now, and the reeve has been seen reading the receipt by the well and putting it in his pocket.
>
> Ianto’s fuel boat noses into Porthalen’s quay, low in the water, and men come running from the salt-house.
>
> Following: Tell Holgar, salter at Porthalen, in the salt-house that the fuel boat is at the quay. ·
>

- Moved: party pans__staithe → region__s1_green; region__s1_r1 region__s1_sheds → region__s1_taproom; region__s1_r10 region__s1_green → region__s1_taproom; region__s1_r2 region__s1_waterside → region__s1_houses; region__s1_r3 region__s1_fields → region__s1_taproom; region__s1_r4 region__s1_saltpans → region__s1_taproom; region__s1_r5 region__s1_byre → region__s1_houses; region__s1_r6 region__s1_fields → region__s1_taproom; region__s1_r7 region__s1_green → region__s1_houses; region__s1_r8 region__s1_green → region__s1_taproom; region__s1_r9 region__s1_green → region__s1_houses; region__s2_r1 region__s2_well → region__s2_taproom; region__s2_r2 region__s2_fields → region__s2_houses; region__s2_r3 region__s2_waterside → region__s2_houses; region__s2_r4 region__s2_fields → region__s2_houses; region__s2_r5 region__s2_green → region__s2_houses; region__s2_r6 region__s2_green → region__s2_houses; region__s2_r7 region__s2_green → region__s2_houses; region__s2_s3_way_t region__s2_s3_way → region__s3_taproom; region__s3_r1 region__s3_green → region__s3_houses; region__s3_r2 region__s3_green → region__s3_houses; region__s3_r3 region__s3_lanes → region__s3_houses; region__s3_r4 region__s3_clamps → region__s3_houses; region__s3_r5 region__s3_byre → region__s3_taproom; region__s3_r6 region__s3_green → region__s3_taproom; region__s3_r7 region__s3_green → region__s3_houses; region__s4_r1 region__s4_cloister → region__s4_houses; region__s4_r2 region__s4_lanes → region__s4_taproom; region__s4_r3 region__s4_fields → region__s4_houses; region__s4_r4 region__s4_green → region__s4_taproom; region__s5_r1 region__s5_crossing → region__s5_houses; region__s5_r2 region__s5_green → region__s5_taproom; region__s5_r3 region__s5_waterside → region__s5_houses; region__s5_r4 region__s5_green → region__s5_taproom; region__s5_s2_way_t region__s5_s2_way → region__s2_taproom
- Aims taken up: pans__cold_told
- Aims gone: pans__cold_down
- Time: 31 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 40; - stoodAt(party, pans__staithe); + arrivedAt(party) = 77; + stoodAt(party, region__s1_green)
- By Rule region__s1_r1_evening (rule fired): - at(region__s1_r1, region__s1_sheds); + at(region__s1_r1, region__s1_taproom)
- By Rule region__s1_r10_evening (rule fired): - at(region__s1_r10, region__s1_green); + at(region__s1_r10, region__s1_taproom)
- By Rule region__s1_r2_evening (rule fired): - at(region__s1_r2, region__s1_waterside); + at(region__s1_r2, region__s1_houses)
- By Rule region__s1_r3_evening (rule fired): - at(region__s1_r3, region__s1_fields); + at(region__s1_r3, region__s1_taproom)
- By Rule region__s1_r4_evening (rule fired): - at(region__s1_r4, region__s1_saltpans); + at(region__s1_r4, region__s1_taproom)
- By Rule region__s1_r5_evening (rule fired): - at(region__s1_r5, region__s1_byre); + at(region__s1_r5, region__s1_houses)
- By Rule region__s1_r6_evening (rule fired): - at(region__s1_r6, region__s1_fields); + at(region__s1_r6, region__s1_taproom)
- By Rule region__s1_r7_evening (rule fired): - at(region__s1_r7, region__s1_green); + at(region__s1_r7, region__s1_houses)
- By Rule region__s1_r8_evening (rule fired): - at(region__s1_r8, region__s1_green); + at(region__s1_r8, region__s1_taproom)
- By Rule region__s1_r9_evening (rule fired): - at(region__s1_r9, region__s1_green); + at(region__s1_r9, region__s1_houses)
- By Rule region__s1_tie_takes (rule fired): - at(region__s1_tie_token, region__w5)
- By Rule region__s2_r1_evening (rule fired): - at(region__s2_r1, region__s2_well); + at(region__s2_r1, region__s2_taproom)
- By Rule region__s2_r2_evening (rule fired): - at(region__s2_r2, region__s2_fields); + at(region__s2_r2, region__s2_houses)
- By Rule region__s2_r3_evening (rule fired): - at(region__s2_r3, region__s2_waterside); + at(region__s2_r3, region__s2_houses)
- By Rule region__s2_r4_evening (rule fired): - at(region__s2_r4, region__s2_fields); + at(region__s2_r4, region__s2_houses)
- By Rule region__s2_r5_evening (rule fired): - at(region__s2_r5, region__s2_green); + at(region__s2_r5, region__s2_houses)
- By Rule region__s2_r6_evening (rule fired): - at(region__s2_r6, region__s2_green); + at(region__s2_r6, region__s2_houses)
- By Rule region__s2_r7_evening (rule fired): - at(region__s2_r7, region__s2_green); + at(region__s2_r7, region__s2_houses)
- By Rule region__s2_s3_way_t_in0 (rule fired): - at(region__s2_s3_way_t, region__s2_s3_way); - region__journeysTo(region__s2_s3_way_t, region__s3_green); + at(region__s2_s3_way_t, region__s3_taproom); + region__journeysTo(region__s2_s3_way_t, region__s2_green)
- By Rule region__s3_r1_evening (rule fired): - at(region__s3_r1, region__s3_green); + at(region__s3_r1, region__s3_houses)
- By Rule region__s3_r2_evening (rule fired): - at(region__s3_r2, region__s3_green); + at(region__s3_r2, region__s3_houses)
- By Rule region__s3_r3_evening (rule fired): - at(region__s3_r3, region__s3_lanes); + at(region__s3_r3, region__s3_houses)
- By Rule region__s3_r4_evening (rule fired): - at(region__s3_r4, region__s3_clamps); + at(region__s3_r4, region__s3_houses)
- By Rule region__s3_r5_evening (rule fired): - at(region__s3_r5, region__s3_byre); + at(region__s3_r5, region__s3_taproom)
- By Rule region__s3_r6_evening (rule fired): - at(region__s3_r6, region__s3_green); + at(region__s3_r6, region__s3_taproom)
- By Rule region__s3_r7_evening (rule fired): - at(region__s3_r7, region__s3_green); + at(region__s3_r7, region__s3_houses)
- By Rule region__s3_tie_takes (rule fired): - at(region__s3_tie_token, region__w9)
- By Rule region__s4_r1_evening (rule fired): - at(region__s4_r1, region__s4_cloister); + at(region__s4_r1, region__s4_houses)
- By Rule region__s4_r2_evening (rule fired): - at(region__s4_r2, region__s4_lanes); + at(region__s4_r2, region__s4_taproom)
- By Rule region__s4_r3_evening (rule fired): - at(region__s4_r3, region__s4_fields); + at(region__s4_r3, region__s4_houses)
- By Rule region__s4_r4_evening (rule fired): - at(region__s4_r4, region__s4_green); + at(region__s4_r4, region__s4_taproom)
- By Rule region__s5_r1_evening (rule fired): - at(region__s5_r1, region__s5_crossing); + at(region__s5_r1, region__s5_houses)
- By Rule region__s5_r2_evening (rule fired): - at(region__s5_r2, region__s5_green); + at(region__s5_r2, region__s5_taproom)
- By Rule region__s5_r3_evening (rule fired): - at(region__s5_r3, region__s5_waterside); + at(region__s5_r3, region__s5_houses)
- By Rule region__s5_r4_evening (rule fired): - at(region__s5_r4, region__s5_green); + at(region__s5_r4, region__s5_taproom)
- By Rule region__s5_s2_way_t_in0 (rule fired): - at(region__s5_s2_way_t, region__s5_s2_way); - region__journeysTo(region__s5_s2_way_t, region__s2_green); + at(region__s5_s2_way_t, region__s2_taproom); + region__journeysTo(region__s5_s2_way_t, region__s5_green)
- By Rule region__s5_tie_takes (rule fired): - at(region__s5_tie_token, region__w1)
- By Rule lingers (rule fired): - lingered(party) = 6
- By Rule meal (rule fired): - nextMeal(party) = 72; - quantity(party, rations) = 3; + nextMeal(party) = 216; + quantity(party, rations) = 2
- By Rule pans__boat_in (rule fired): - pans__afloat(party); + pans__carted(party)
- By Rule region__s2_s3_way_t_sorted (rule fired): - region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_sorted (rule fired): - region__inTrouble(region__s5_s2_way_t)
- By Rule region__s1_tie_goes (rule fired): + region__s1_tie_gone(party)
- By Rule region__s3_tie_goes (rule fired): + region__s3_tie_gone(party)
- By Rule region__s5_tie_goes (rule fired): + region__s5_tie_gone(party)

Offered: To Holgar's salt-house (led) · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · Talk to the Guldríce agent — ask about the king-barrow · and 78 more.

## Holgar's salt-house

**25. “To Holgar's salt-house”** (led; go(region__s1_shop_door,region__s1_shop)) · consequential 20 · Day 1, 8:53 p.m.

> Salt in sacks stacked to the rafters, barrels of fish in brine along the wall, and a smell of tar and the sea that gets into everything.
>

- Moved: party region__s1_green → region__s1_shop
- By Rule came_here (rule fired): - stoodAt(party, region__s1_green); + stoodAt(party, region__s1_shop)

Offered: Tell Holgar the fuel boat is at the quay · To the boiling-house behind the salt-house · To the shrine of Nodens · To Mabel's chandlery · and 44 more.

**26. “Tell Holgar the fuel boat is at the quay”** (primary; pans__boat_come) · consequential 21 · Day 1, 9:03 p.m.

> Holgar goes out onto the quay and stands looking at the heaped boat for a long moment. ‘The whole load,’ Holgar says. ‘A month.’ Fifteen coin on the boards, slowly. ‘There’s three a shift for you here, whenever you want it. And I’ll remember it.’
>
> Wenna and Carlin each gain 100 experience: kept Holgar’s pans burning. ?
>
> Provisions: Food for 2 days. ·
>

- Learned: pans__salt_whole, pans__work
- Moved: howe__household howe__gallery → howe__forecourt; region__s1_r1 region__s1_taproom → region__s1_houses; region__s1_r10 region__s1_taproom → region__s1_houses; region__s1_r3 region__s1_taproom → region__s1_houses; region__s1_r4 region__s1_taproom → region__s1_houses; region__s1_r6 region__s1_taproom → region__s1_houses; region__s1_r8 region__s1_taproom → region__s1_houses; region__s2_r1 region__s2_taproom → region__s2_houses; region__s3_r5 region__s3_taproom → region__s3_houses; region__s3_r6 region__s3_taproom → region__s3_houses; region__s4_r2 region__s4_taproom → region__s4_houses; region__s4_r4 region__s4_taproom → region__s4_houses; region__s5_r2 region__s5_taproom → region__s5_houses; region__s5_r4 region__s5_taproom → region__s5_houses; tower__risen tower__hall → region__s3_green
- Aims gone: pans__cold_told
- Time: 1 watch
- By Rule howe__household_out (rule fired): - at(howe__household, howe__gallery); + at(howe__household, howe__forecourt)
- By Rule region__s1_r1_night (rule fired): - at(region__s1_r1, region__s1_taproom); + at(region__s1_r1, region__s1_houses)
- By Rule region__s1_r10_night (rule fired): - at(region__s1_r10, region__s1_taproom); + at(region__s1_r10, region__s1_houses)
- By Rule region__s1_r3_night (rule fired): - at(region__s1_r3, region__s1_taproom); + at(region__s1_r3, region__s1_houses)
- By Rule region__s1_r4_night (rule fired): - at(region__s1_r4, region__s1_taproom); + at(region__s1_r4, region__s1_houses)
- By Rule region__s1_r6_night (rule fired): - at(region__s1_r6, region__s1_taproom); + at(region__s1_r6, region__s1_houses)
- By Rule region__s1_r8_night (rule fired): - at(region__s1_r8, region__s1_taproom); + at(region__s1_r8, region__s1_houses)
- By Rule region__s2_r1_night (rule fired): - at(region__s2_r1, region__s2_taproom); + at(region__s2_r1, region__s2_houses)
- By Rule region__s3_r5_night (rule fired): - at(region__s3_r5, region__s3_taproom); + at(region__s3_r5, region__s3_houses)
- By Rule region__s3_r6_night (rule fired): - at(region__s3_r6, region__s3_taproom); + at(region__s3_r6, region__s3_houses)
- By Rule region__s4_r2_night (rule fired): - at(region__s4_r2, region__s4_taproom); + at(region__s4_r2, region__s4_houses)
- By Rule region__s4_r4_night (rule fired): - at(region__s4_r4, region__s4_taproom); + at(region__s4_r4, region__s4_houses)
- By Rule region__s5_r2_night (rule fired): - at(region__s5_r2, region__s5_taproom); + at(region__s5_r2, region__s5_houses)
- By Rule region__s5_r4_night (rule fired): - at(region__s5_r4, region__s5_taproom); + at(region__s5_r4, region__s5_houses)
- By Rule tower__walk (rule fired): - at(tower__risen, tower__hall); + at(tower__risen, region__s3_green)
- By Rule arcology__lilies_close (rule fired): - state(arcology__blossoms, arcology__open); + state(arcology__blossoms, arcology__folded)
- By Rule pans__m_fuelled_achieved (rule fired): + achieved(pans__m_fuelled)
- By Rule gate__conger_rises (rule fired): + at(gate__conger, gate__well)
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule pans__word_old (rule fired): + stale(pans__cold)

Withdrawn: Wait until dark.
Offered: Ask Holgar about the bend in the old road at the fallen walls · Ask Holgar about the old kingdom · To the shrine of Nodens · To Mabel's chandlery · To the boiling-house behind the salt-house · and 54 more.

## Mabel's chandlery

**27. “To Mabel's chandlery”** (primary; travel:region__s1_chandlery) · consequential 22 · Day 1, 9:05 p.m.

> Shelves to the ceiling: coils of rope, lamps and lamp-oil, candles in bundles, sacks of meal; everything a traveller forgets, and the smell of tallow over it all.
>

- Moved: party region__s1_shop → region__s1_chandlery
- By Rule came_here (rule fired): - arrivedAt(party) = 77; - stoodAt(party, region__s1_shop); + arrivedAt(party) = 78; + stoodAt(party, region__s1_chandlery)
- By Rule lingers (rule fired): - lingered(party) = 1

Offered: To the shrine of Nodens · To Wulfrun's herb-shop · To the landing at Porthalen · To the drill-yard behind the Stone Horn · and 76 more.

**28. “Buy a lantern for Wenna · 7 coin”** (rest; buy_item(region__s1_chandler_lantern_1,region__member_party_1)) · consequential 23 · Day 1, 9:08 p.m.

> Mabel is paid, and Wenna takes a lantern. It burns oil, and none of you carries any.
>

- Came into the company's hands: region__s1_chandler_lantern_1

Withdrawn: Haggle with Mabel over the price of a lantern · an even chance · one try · Buy a spyglass for Wenna · 15 coin · Buy a lantern for Carlin · 7 coin · Buy a spyglass for Carlin · 15 coin.
Offered: To the shrine of Nodens · To Wulfrun's herb-shop · To the landing at Porthalen · To the drill-yard behind the Stone Horn · and 78 more.

## the landing at Porthalen

**29. “To the landing at Porthalen”** (primary; go(region__s1_chandlery_door,region__s1_green)) · consequential 24 · Day 1, 9:09 p.m.

> Porthalen is shuttered for the night.
>

- Moved: party region__s1_chandlery → region__s1_green
- By Rule came_here (rule fired): - stoodAt(party, region__s1_chandlery); + stoodAt(party, region__s1_green)

Offered: Ask Owain what he will do now · Into the Stone Horn by the door · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 80 more.

**30. “Talk to Reeve Annis Talfryn”** (rest; gate__reeve#talk) · consequential 25 · Day 1, 9:09 p.m.

> Reeve Annis Talfryn does not look up. ‘Say it, then.’
>

Withdrawn: Talk to Reeve Annis Talfryn.
Offered: Ask Owain what he will do now · Into the Stone Horn by the door · Ask the reeve about the sea-gate at Gatesend · Talk to the tinker's daughter — ask why she was left behind · and 81 more.

**31. “Ask the reeve about the sea-gate at Gatesend”** (primary; gate__reeve_gate) · consequential 26 · Day 1, 9:09 p.m.

> ‘It will not shut,’ says the reeve. ‘It has not shut since the new moon. I have written to the Rì’s engineers in Dun Rìerdan, and they will come in the summer, with a bill, and the fen will have been sea since the spring.’ She looks at you as if measuring rope. ‘Six days to the spring tide. Thirty crowns. Nobody in Gatesend will go into the gatehouse now, with the sea running under it like a mill-race.’
>

- Learned: gate__failing, gate__tide
- Aims taken up: gate__gate_aim

Offered: Find out why the sea-gate · Into the Stone Horn by the door · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 82 more.

**32. “follow gate__gate_aim”** (asked; {"follow":"gate__gate_aim"}) · not consequential · Day 1, 9:09 p.m.

> Porthalen is shuttered for the night. A lamp burns over the door of the Stone Horn. The boat-sheds are short of oak this year: the Hall has chained the road-wood, and the good timber is behind it. At dusk every dog in the town turns its head toward the hill, and the geese go silent. The bailiff’s men have been through again. The price is five crowns a hearth now, and the reeve has been seen reading the receipt by the well and putting it in his pocket. The surveyor’s son has gone: his mule is not at the rail, and the boy at the stable says he was gone before light, with a spade. The merchant keeps looking up the road with the face of a person doing sums.
>
> Up on the hill above the roofs, in the dome of the old stones, a pale light goes round and round.
>
> The inn’s dog lies across the doorstep of the Stone Horn with his chin on his paws, and watches who comes.
>
> A woman in black sits on the step of a cold house with her hands in her lap, watching the road.
>
> A notice is nailed to the post by the well, written over in several hands.
>
> A strip of vellum is nailed to the post by the well, in a fair clerk’s hand, with a lead seal pressed in a blob of wax.
>
> A notice in a clerk’s hand is nailed to the post by the well: THE SEA-GATE AT GATESEND IS TO BE MENDED BEFORE THE SPRING TIDE. THIRTY CROWNS OF THE REEVE TO WHOEVER MENDS IT. A. TALFRYN, REEVE.
>
> The spring-head by the green has been running low for a year. The rope comes up with a hand’s depth of brown water in the bucket and a smell of wet stone, and the women who draw it do so in silence, to save breath.
>
> The Guldríce agent, who keeps the books of the Guldríce company, is here. The tinker’s daughter, a tinker’s daughter left behind when the cart went on, picking a lock on a strongbox for the fun of it, is here. Aldous Fenn, the reeve of the wood-wardens, who license the cutting in the woods round Porthalen, is here. So are Hesper Lowe, Owain, Ffion Wyn, Reeve Annis Talfryn, Gwil Pryce and the woman in black. ·
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>
> Provisions: Food for 2 days. ·
>

Offered: Set out for Gatesend (led) · Into the Stone Horn by the door · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 81 more.

## the bridge over the Whitewater

**33. “Set out for Gatesend”** (led; travel:region__s4) · consequential 27 · Day 2, 2:39 a.m.

> The road crosses the Whitewater by a bridge of old grey stone, three arches green with moss; the river runs deep and quick beneath. An otter’s head breaks the water downstream and is gone.
>
> It is a long time since anyone slept. The company is weary, and will fight the worse for it until it sleeps. ?
>
> Need: Weary ·
>

- Moved: party region__s1_green → region__s5_s2_way
- Time: 33 watches
- By Rule conversation_ends (rule fired): - addressed(gate__reeve, party)
- By Rule came_here (rule fired): - arrivedAt(party) = 78; - stoodAt(party, region__s1_green); + arrivedAt(party) = 111; + stoodAt(party, region__s5_s2_way)
- By Rule howe__hirer_arrives_from_nowhere (rule fired): + at(howe__hirer, region__s1_green); + howe__hirer_arrived()
- By Rule weariness (rule fired): + weary(party)

Offered: Set out for Gatesend (led) · To a long range of roofs behind a gate-arch · Make camp and sleep · To the fen of Addermoss by the road, an hour and a half out of Reedbridge · and 77 more.

## Highgate

**34. “To a long range of roofs behind a gate-arch”** (primary; travel:region__e1) · consequential 28 · Day 2, 4:39 a.m.

> The road comes out of the fen south-west of Reedbridge as a strip of kerbed stone, straighter than anything the folk have built. It runs through a gate-arch into a walled yard.
>
> An owl roosts where a roof-beam was.
>
> You see the numbered post by the road and the dish on the post. ·
>
> Wenna and Carlin each gain 20 experience: found Highgate. ?
>

- Learned: region__e1_named, region__e1_old
- Moved: party region__s5_s2_way → region__e1
- Aims taken up: region__e1_sought
- Time: 12 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 111; - stoodAt(party, region__s5_s2_way); + arrivedAt(party) = 123; + stoodAt(party, region__e1)
- By Rule gate__eels_ebb (rule fired): - state(gate__eels, gate__hunting); + peaceable(gate__eels); + state(gate__eels, gate__stranded)
- By Rule region__e1_reached_achieved (rule fired): + achieved(region__e1_reached)

Offered: Set out for Gatesend (led) · Into the carriage-arch by the fallen gate · Make camp and sleep · Leave a coin in the dish on the post, as the carters do · and 40 more.

**35. “Make camp and sleep”** (primary; camp(region__e1)) · consequential 29 · Day 2, 12:39 p.m.

> You find what shelter there is, and sleep as well as you can, with one ear open.
>

- Moved: howe__household howe__forecourt → howe__gallery; region__s1_r1 region__s1_houses → region__s1_sheds; region__s1_r10 region__s1_houses → region__s1_green; region__s1_r2 region__s1_houses → region__s1_waterside; region__s1_r3 region__s1_houses → region__s1_fields; region__s1_r4 region__s1_houses → region__s1_saltpans; region__s1_r5 region__s1_houses → region__s1_byre; region__s1_r6 region__s1_houses → region__s1_fields; region__s1_r7 region__s1_houses → region__s1_green; region__s1_r8 region__s1_houses → region__s1_green; region__s1_r9 region__s1_houses → region__s1_green; region__s1_s5_way_t region__s5_taproom → region__s1_s5_way; region__s2_r1 region__s2_houses → region__s2_well; region__s2_r2 region__s2_houses → region__s2_fields; region__s2_r3 region__s2_houses → region__s2_waterside; region__s2_r4 region__s2_houses → region__s2_fields; region__s2_r5 region__s2_houses → region__s2_green; region__s2_r6 region__s2_houses → region__s2_green; region__s2_r7 region__s2_houses → region__s2_green; region__s2_s3_way_t region__s3_taproom → region__s2_s3_way; region__s2_s4_way_t region__s4_taproom → region__s2_s4_way; region__s3_r1 region__s3_houses → region__s3_green; region__s3_r2 region__s3_houses → region__s3_green; region__s3_r3 region__s3_houses → region__s3_lanes; region__s3_r4 region__s3_houses → region__s3_clamps; region__s3_r5 region__s3_houses → region__s3_byre; region__s3_r6 region__s3_houses → region__s3_green; region__s3_r7 region__s3_houses → region__s3_green; region__s4_r1 region__s4_houses → region__s4_cloister; region__s4_r2 region__s4_houses → region__s4_lanes; region__s4_r3 region__s4_houses → region__s4_fields; region__s4_r4 region__s4_houses → region__s4_green; region__s4_s3_way_t region__s3_taproom → region__s4_s3_way; region__s5_r1 region__s5_houses → region__s5_crossing; region__s5_r2 region__s5_houses → region__s5_green; region__s5_r3 region__s5_houses → region__s5_waterside; region__s5_r4 region__s5_houses → region__s5_green; region__s5_s2_way_t region__s2_taproom → region__s5_s2_way; tower__risen region__s3_green → tower__hall
- Time: 48 watches
- By Rule gate__conger_sinks (rule fired): - at(gate__conger, gate__well)
- By Rule howe__household_in (rule fired): - at(howe__household, howe__forecourt); + at(howe__household, howe__gallery)
- By Rule region__s1_r1_day (rule fired): - at(region__s1_r1, region__s1_houses); + at(region__s1_r1, region__s1_sheds)
- By Rule region__s1_r10_day (rule fired): - at(region__s1_r10, region__s1_houses); + at(region__s1_r10, region__s1_green)
- By Rule region__s1_r2_day (rule fired): - at(region__s1_r2, region__s1_houses); + at(region__s1_r2, region__s1_waterside)
- By Rule region__s1_r3_day (rule fired): - at(region__s1_r3, region__s1_houses); + at(region__s1_r3, region__s1_fields)
- By Rule region__s1_r4_day (rule fired): - at(region__s1_r4, region__s1_houses); + at(region__s1_r4, region__s1_saltpans)
- By Rule region__s1_r5_day (rule fired): - at(region__s1_r5, region__s1_houses); + at(region__s1_r5, region__s1_byre)
- By Rule region__s1_r6_day (rule fired): - at(region__s1_r6, region__s1_houses); + at(region__s1_r6, region__s1_fields)
- By Rule region__s1_r7_day (rule fired): - at(region__s1_r7, region__s1_houses); + at(region__s1_r7, region__s1_green)
- By Rule region__s1_r8_day (rule fired): - at(region__s1_r8, region__s1_houses); + at(region__s1_r8, region__s1_green)
- By Rule region__s1_r9_day (rule fired): - at(region__s1_r9, region__s1_houses); + at(region__s1_r9, region__s1_green)
- By Rule region__s1_s5_way_t_out (rule fired): - at(region__s1_s5_way_t, region__s5_taproom); + at(region__s1_s5_way_t, region__s1_s5_way)
- By Rule region__s2_r1_day (rule fired): - at(region__s2_r1, region__s2_houses); + at(region__s2_r1, region__s2_well)
- By Rule region__s2_r2_day (rule fired): - at(region__s2_r2, region__s2_houses); + at(region__s2_r2, region__s2_fields)
- By Rule region__s2_r3_day (rule fired): - at(region__s2_r3, region__s2_houses); + at(region__s2_r3, region__s2_waterside)
- By Rule region__s2_r4_day (rule fired): - at(region__s2_r4, region__s2_houses); + at(region__s2_r4, region__s2_fields)
- By Rule region__s2_r5_day (rule fired): - at(region__s2_r5, region__s2_houses); + at(region__s2_r5, region__s2_green)
- By Rule region__s2_r6_day (rule fired): - at(region__s2_r6, region__s2_houses); + at(region__s2_r6, region__s2_green)
- By Rule region__s2_r7_day (rule fired): - at(region__s2_r7, region__s2_houses); + at(region__s2_r7, region__s2_green)
- By Rule region__s2_s3_way_t_out (rule fired): - at(region__s2_s3_way_t, region__s3_taproom); + at(region__s2_s3_way_t, region__s2_s3_way)
- By Rule region__s2_s4_way_t_out (rule fired): - at(region__s2_s4_way_t, region__s4_taproom); + at(region__s2_s4_way_t, region__s2_s4_way)
- By Rule region__s3_r1_day (rule fired): - at(region__s3_r1, region__s3_houses); + at(region__s3_r1, region__s3_green)
- By Rule region__s3_r2_day (rule fired): - at(region__s3_r2, region__s3_houses); + at(region__s3_r2, region__s3_green)
- By Rule region__s3_r3_day (rule fired): - at(region__s3_r3, region__s3_houses); + at(region__s3_r3, region__s3_lanes)
- By Rule region__s3_r4_day (rule fired): - at(region__s3_r4, region__s3_houses); + at(region__s3_r4, region__s3_clamps)
- By Rule region__s3_r5_day (rule fired): - at(region__s3_r5, region__s3_houses); + at(region__s3_r5, region__s3_byre)
- By Rule region__s3_r6_day (rule fired): - at(region__s3_r6, region__s3_houses); + at(region__s3_r6, region__s3_green)
- By Rule region__s3_r7_day (rule fired): - at(region__s3_r7, region__s3_houses); + at(region__s3_r7, region__s3_green)
- By Rule region__s4_r1_day (rule fired): - at(region__s4_r1, region__s4_houses); + at(region__s4_r1, region__s4_cloister)
- By Rule region__s4_r2_day (rule fired): - at(region__s4_r2, region__s4_houses); + at(region__s4_r2, region__s4_lanes)
- By Rule region__s4_r3_day (rule fired): - at(region__s4_r3, region__s4_houses); + at(region__s4_r3, region__s4_fields)
- By Rule region__s4_r4_day (rule fired): - at(region__s4_r4, region__s4_houses); + at(region__s4_r4, region__s4_green)
- By Rule region__s4_s3_way_t_out (rule fired): - at(region__s4_s3_way_t, region__s3_taproom); + at(region__s4_s3_way_t, region__s4_s3_way)
- By Rule region__s5_r1_day (rule fired): - at(region__s5_r1, region__s5_houses); + at(region__s5_r1, region__s5_crossing)
- By Rule region__s5_r2_day (rule fired): - at(region__s5_r2, region__s5_houses); + at(region__s5_r2, region__s5_green)
- By Rule region__s5_r3_day (rule fired): - at(region__s5_r3, region__s5_houses); + at(region__s5_r3, region__s5_waterside)
- By Rule region__s5_r4_day (rule fired): - at(region__s5_r4, region__s5_houses); + at(region__s5_r4, region__s5_green)
- By Rule region__s5_s2_way_t_out (rule fired): - at(region__s5_s2_way_t, region__s2_taproom); + at(region__s5_s2_way_t, region__s5_s2_way)
- By Rule tower__dawn (rule fired): - at(tower__risen, region__s3_green); - tower__opened(tower__churchyard) = 5; + at(tower__risen, tower__hall); + tower__opened(tower__churchyard) = 6
- By Rule gate__eels_flow (rule fired): - peaceable(gate__eels); - state(gate__eels, gate__stranded); + state(gate__eels, gate__hunting)
- By Rule tollKeepers__eats (rule fired): - quantity(tollKeepers__chief, rations) = 4; + quantity(tollKeepers__chief, rations) = 3
- By Rule ambition_advances (rule fired): - stageDue(region__w8_rivals) = 132; + stage(region__w8_rivals) = 1; + stageDue(region__w8_rivals) = 420
- By Rule arcology__lilies_open (rule fired): - state(arcology__blossoms, arcology__folded); + state(arcology__blossoms, arcology__open)
- By Rule arcology__bronze_ring_set_noon__allowed (rule fired): - withheld(arcology__bronze_ring_set_noon)
- By Rule lingers (rule fired): + lingered(party) = 48
- By Rule region__s1_tie_returns (rule fired): + region__s1_tie_back(party)
- By Rule region__s3_tie_returns (rule fired): + region__s3_tie_back(party)
- By Rule region__s5_tie_returns (rule fired): + region__s5_tie_back(party)

Withdrawn: Wait until first light.
Offered: Set out for Gatesend (led) · Into the carriage-arch by the fallen gate · Leave a coin in the dish on the post, as the carters do · To open fields south-west of Reedbridge · and 40 more.

## the gate-yard of Gatesend

**36. “Set out for Gatesend”** (led; travel:region__s4) · consequential 30 · Day 2, 10:19 p.m.

> The brothers’ gate is shut, but a lamp burns over it, and a bell hangs by it for late comers.
>
> The brothers’ dog lies across the doorstep of the guest-hall with his chin on his paws, and watches who comes.
>
> ‘Wrackham,’ says Carlin, and stands a moment where the track comes in. ‘Smaller than it was.’
>
> Provisions: Food for 1 day. ·
>

- Learned: howe__ridge_told, raidersFolk__bell_taken, region__s2_why, region__w8_named
- Moved: howe__household howe__gallery → howe__forecourt; party region__e1 → region__s4_green; region__s1_r1 region__s1_sheds → region__s1_houses; region__s1_r10 region__s1_green → region__s1_houses; region__s1_r2 region__s1_waterside → region__s1_houses; region__s1_r3 region__s1_fields → region__s1_houses; region__s1_r4 region__s1_saltpans → region__s1_houses; region__s1_r5 region__s1_byre → region__s1_houses; region__s1_r6 region__s1_fields → region__s1_houses; region__s1_r7 region__s1_green → region__s1_houses; region__s1_r8 region__s1_green → region__s1_houses; region__s1_r9 region__s1_green → region__s1_houses; region__s1_s5_way_t region__s1_s5_way → region__s1_taproom; region__s2_r1 region__s2_well → region__s2_houses; region__s2_r2 region__s2_fields → region__s2_houses; region__s2_r3 region__s2_waterside → region__s2_houses; region__s2_r4 region__s2_fields → region__s2_houses; region__s2_r5 region__s2_green → region__s2_houses; region__s2_r6 region__s2_green → region__s2_houses; region__s2_r7 region__s2_green → region__s2_houses; region__s2_s3_way_t region__s2_s3_way → region__s2_taproom; region__s2_s4_way_t region__s2_s4_way → region__s2_taproom; region__s3_r1 region__s3_green → region__s3_houses; region__s3_r2 region__s3_green → region__s3_houses; region__s3_r3 region__s3_lanes → region__s3_houses; region__s3_r4 region__s3_clamps → region__s3_houses; region__s3_r5 region__s3_byre → region__s3_houses; region__s3_r6 region__s3_green → region__s3_houses; region__s3_r7 region__s3_green → region__s3_houses; region__s4_r1 region__s4_cloister → region__s4_houses; region__s4_r2 region__s4_lanes → region__s4_houses; region__s4_r3 region__s4_fields → region__s4_houses; region__s4_r4 region__s4_green → region__s4_houses; region__s4_s3_way_t region__s4_s3_way → region__s4_taproom; region__s5_r1 region__s5_crossing → region__s5_houses; region__s5_r2 region__s5_green → region__s5_houses; region__s5_r3 region__s5_waterside → region__s5_houses; region__s5_r4 region__s5_green → region__s5_houses; region__s5_s2_way_t region__s5_s2_way → region__s5_taproom; tower__risen tower__hall → region__s3_green
- Aims taken up: raidersFolk__bell_sought
- Time: 58 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 123; - stoodAt(party, region__e1); + arrivedAt(party) = 229; + stoodAt(party, region__s4_green)
- By Rule howe__household_out (rule fired): - at(howe__household, howe__gallery); + at(howe__household, howe__forecourt)
- By Rule region__s1_r1_evening (rule fired): - at(region__s1_r1, region__s1_sheds)
- By Rule region__s1_r10_evening (rule fired): - at(region__s1_r10, region__s1_green)
- By Rule region__s1_r2_evening (rule fired): - at(region__s1_r2, region__s1_waterside); + at(region__s1_r2, region__s1_houses)
- By Rule region__s1_r3_evening (rule fired): - at(region__s1_r3, region__s1_fields)
- By Rule region__s1_r4_evening (rule fired): - at(region__s1_r4, region__s1_saltpans)
- By Rule region__s1_r5_evening (rule fired): - at(region__s1_r5, region__s1_byre); + at(region__s1_r5, region__s1_houses)
- By Rule region__s1_r6_evening (rule fired): - at(region__s1_r6, region__s1_fields)
- By Rule region__s1_r7_evening (rule fired): - at(region__s1_r7, region__s1_green); + at(region__s1_r7, region__s1_houses)
- By Rule region__s1_r8_evening (rule fired): - at(region__s1_r8, region__s1_green)
- By Rule region__s1_r9_evening (rule fired): - at(region__s1_r9, region__s1_green); + at(region__s1_r9, region__s1_houses)
- By Rule region__s1_s5_way_t_in1 (rule fired): - at(region__s1_s5_way_t, region__s1_s5_way); - region__journeysTo(region__s1_s5_way_t, region__s1_green); + at(region__s1_s5_way_t, region__s1_taproom); + region__journeysTo(region__s1_s5_way_t, region__s5_green)
- By Rule region__s2_r1_evening (rule fired): - at(region__s2_r1, region__s2_well)
- By Rule region__s2_r2_evening (rule fired): - at(region__s2_r2, region__s2_fields); + at(region__s2_r2, region__s2_houses)
- By Rule region__s2_r3_evening (rule fired): - at(region__s2_r3, region__s2_waterside); + at(region__s2_r3, region__s2_houses)
- By Rule region__s2_r4_evening (rule fired): - at(region__s2_r4, region__s2_fields); + at(region__s2_r4, region__s2_houses)
- By Rule region__s2_r5_evening (rule fired): - at(region__s2_r5, region__s2_green); + at(region__s2_r5, region__s2_houses)
- By Rule region__s2_r6_evening (rule fired): - at(region__s2_r6, region__s2_green); + at(region__s2_r6, region__s2_houses)
- By Rule region__s2_r7_evening (rule fired): - at(region__s2_r7, region__s2_green); + at(region__s2_r7, region__s2_houses)
- By Rule region__s2_s3_way_t_in1 (rule fired): - at(region__s2_s3_way_t, region__s2_s3_way); - region__journeysTo(region__s2_s3_way_t, region__s2_green); + at(region__s2_s3_way_t, region__s2_taproom); + region__journeysTo(region__s2_s3_way_t, region__s3_green)
- By Rule region__s2_s4_way_t_in1 (rule fired): - at(region__s2_s4_way_t, region__s2_s4_way); - region__journeysTo(region__s2_s4_way_t, region__s2_green); + at(region__s2_s4_way_t, region__s2_taproom); + region__journeysTo(region__s2_s4_way_t, region__s4_green)
- By Rule region__s3_r1_evening (rule fired): - at(region__s3_r1, region__s3_green); + at(region__s3_r1, region__s3_houses)
- By Rule region__s3_r2_evening (rule fired): - at(region__s3_r2, region__s3_green); + at(region__s3_r2, region__s3_houses)
- By Rule region__s3_r3_evening (rule fired): - at(region__s3_r3, region__s3_lanes); + at(region__s3_r3, region__s3_houses)
- By Rule region__s3_r4_evening (rule fired): - at(region__s3_r4, region__s3_clamps); + at(region__s3_r4, region__s3_houses)
- By Rule region__s3_r5_evening (rule fired): - at(region__s3_r5, region__s3_byre)
- By Rule region__s3_r6_evening (rule fired): - at(region__s3_r6, region__s3_green)
- By Rule region__s3_r7_evening (rule fired): - at(region__s3_r7, region__s3_green); + at(region__s3_r7, region__s3_houses)
- By Rule region__s4_r1_evening (rule fired): - at(region__s4_r1, region__s4_cloister); + at(region__s4_r1, region__s4_houses)
- By Rule region__s4_r2_evening (rule fired): - at(region__s4_r2, region__s4_lanes)
- By Rule region__s4_r3_evening (rule fired): - at(region__s4_r3, region__s4_fields); + at(region__s4_r3, region__s4_houses)
- By Rule region__s4_r4_evening (rule fired): - at(region__s4_r4, region__s4_green)
- By Rule region__s4_s3_way_t_in1 (rule fired): - at(region__s4_s3_way_t, region__s4_s3_way); - region__journeysTo(region__s4_s3_way_t, region__s4_green); + at(region__s4_s3_way_t, region__s4_taproom); + region__journeysTo(region__s4_s3_way_t, region__s3_green)
- By Rule region__s5_r1_evening (rule fired): - at(region__s5_r1, region__s5_crossing); + at(region__s5_r1, region__s5_houses)
- By Rule region__s5_r2_evening (rule fired): - at(region__s5_r2, region__s5_green)
- By Rule region__s5_r3_evening (rule fired): - at(region__s5_r3, region__s5_waterside); + at(region__s5_r3, region__s5_houses)
- By Rule region__s5_r4_evening (rule fired): - at(region__s5_r4, region__s5_green)
- By Rule region__s5_s2_way_t_in1 (rule fired): - at(region__s5_s2_way_t, region__s5_s2_way); - region__journeysTo(region__s5_s2_way_t, region__s5_green); + at(region__s5_s2_way_t, region__s5_taproom); + region__journeysTo(region__s5_s2_way_t, region__s2_green)
- By Rule tower__walk (rule fired): - at(tower__risen, tower__hall); + at(tower__risen, region__s3_green)
- By Rule lingers (rule fired): - lingered(party) = 48
- By Rule meal (rule fired): - nextMeal(party) = 216; - quantity(party, rations) = 2; + nextMeal(party) = 360; + quantity(party, rations) = 1
- By Rule arcology__lilies_close (rule fired): - state(arcology__blossoms, arcology__open); + state(arcology__blossoms, arcology__folded)
- By Rule gate__conger_rises (rule fired): + at(gate__conger, gate__well)
- By Rule region__s1_r1_night (rule fired): + at(region__s1_r1, region__s1_houses)
- By Rule region__s1_r10_night (rule fired): + at(region__s1_r10, region__s1_houses)
- By Rule region__s1_r3_night (rule fired): + at(region__s1_r3, region__s1_houses)
- By Rule region__s1_r4_night (rule fired): + at(region__s1_r4, region__s1_houses)
- By Rule region__s1_r6_night (rule fired): + at(region__s1_r6, region__s1_houses)
- By Rule region__s1_r8_night (rule fired): + at(region__s1_r8, region__s1_houses)
- By Rule region__s2_r1_night (rule fired): + at(region__s2_r1, region__s2_houses)
- By Rule region__s3_r5_night (rule fired): + at(region__s3_r5, region__s3_houses)
- By Rule region__s3_r6_night (rule fired): + at(region__s3_r6, region__s3_houses)
- By Rule region__s4_r2_night (rule fired): + at(region__s4_r2, region__s4_houses)
- By Rule region__s4_r4_night (rule fired): + at(region__s4_r4, region__s4_houses)
- By Rule region__s5_r2_night (rule fired): + at(region__s5_r2, region__s5_houses)
- By Rule region__s5_r4_night (rule fired): + at(region__s5_r4, region__s5_houses)
- By Rule gate__ifan_poled (rule fired): + gate__ifanPoled(party)
- By Rule temper_greets (rule fired): + greeted(region__s2_cat, party); + greeted(region__s2_inndog, party); + greeted(region__s4_cat, party); + greeted(region__s4_inndog, party); and 4 more
- By Rule region__s1_traveller_homecoming (rule fired): + region__once_s1_traveller_homecoming()
- By Rule region__s2_tie_blamed (rule fired): + region__s2_tie_lost(party)
- By Rule region__s4_tie_blamed (rule fired): + region__s4_tie_lost(party)
- By Rule arcology__bronze_ring_set_noon__withheld (rule fired): + withheld(arcology__bronze_ring_set_noon)

Offered: To the sea-bank at Gatesend (led) · Into the brothers' house at Gatesend · Ask Gek about the coin on the cord round their neck · Talk to a drover's boy — ask the drover's boy what he was doing on the hill · and 78 more.

## the sea-bank at Gatesend

**37. “To the sea-bank at Gatesend”** (led; go(gate__bank_path,gate__bank)) · consequential 31 · Day 2, 10:29 p.m.

> The sea-bank runs straight as a rule between the grey water and the green fen, a man’s height above both.
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>

- Moved: party region__s4_green → gate__bank
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 229; - stoodAt(party, region__s4_green); + arrivedAt(party) = 230; + stoodAt(party, gate__bank)

Offered: To the Wardens' gatehouse (led) · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the cloister · and 40 more.

## the Wardens' gatehouse

**38. “To the Wardens' gatehouse”** (led; go(gate__gate_door,gate__gatehouse)) · consequential 32 · Day 2, 10:30 p.m.

> Something big is feeding in the gate-well: down the slot in the floor its water slaps and heaves, though the tide has not turned. Over it a windlass of black oak as thick as a man fills the room, its drum wound with chain that goes down through the slot.
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>

- Moved: party gate__bank → gate__gatehouse
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 230; - stoodAt(party, gate__bank); + arrivedAt(party) = 231; + stoodAt(party, gate__gatehouse)

Offered: Search here · To the gate-well, under the gatehouse · and 37 more.

**39. “Search here”** (primary; search(gate__gatehouse)) · consequential 33 · Day 2, 10:50 p.m.

> With care, a little at a time, you search the Wardens’ gatehouse.
>
> The socket beside the ratchet is empty, and its pin-holes are bright. The pawl that should stand in it, the iron tooth that holds the drum, is gone. Whatever held it, it went down: there are fresh scrapes on the slot’s edge where something heavy fell.
>
> Following: Find the sea-gate's lost pawl: something heavy went down the gate-well under the gatehouse. ·
>

- Learned: gate__fault_found
- Aims taken up: gate__gate_pawl
- Aims gone: gate__gate_aim
- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: To the gate-well, under the gatehouse (led) · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the cloister · and 34 more.

## the gate-well, under the gatehouse

**40. “To the gate-well, under the gatehouse”** (led; go(gate__well_ladder,gate__well)) · consequential 34 · Day 2, 10:52 p.m.

> It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.
>
> The conger in the gate-well is here. ·
>
> The water about your knees heaves. A grey back as long as you are rolls past the chain, turns, and comes round again, slower.
>
> Following: Find the sea-gate's lost pawl: something heavy went down the gate-well under the gatehouse. ·
>
> Need: Dark, a light to hand ·
>
> Provisions: Food for 1 day · Nothing lit · 1 torch, 2 candles to spare · a lamp, and no oil for it. ·
>

- Moved: party gate__gatehouse → gate__well
- By Rule came_here (rule fired): - arrivedAt(party) = 231; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 233; + stoodAt(party, gate__well)
- By Rule lingers (rule fired): - lingered(party) = 2
- By Rule temper_warns (rule fired): + patience(gate__conger) = 234; + warned(gate__conger, party)

Offered: Wenna: light a torch · Wenna: light a candle · Attack the conger in the gate-well · To the sluice gallery · and 43 more.

**41. “Wenna: light a torch”** (primary; light_item(region__party_1__torch)) · consequential 35 · Day 2, 10:53 p.m.

> Wenna lights a torch.
>
> The iron rungs end in silt. Water stands knee-deep, cold and moving, and the gate’s great chain goes down past you into the dark to the sluice below.
>
> The conger in the gate-well is watching you. In 7 minutes it will be on you. ?
>
> Provisions: Food for 1 day · Wenna's torch, an hour left · 2 candles to spare · a lamp, and no oil for it. ·
>

- Went out of them: region__party_1__torch
- By Rule arcology__bronze_ring_set_mirror__allowed (rule fired): - withheld(arcology__bronze_ring_set_mirror)

Withdrawn: Give a torch to Carlin · Set down a torch.
Offered: Search here · Attack the conger in the gate-well · To the Wardens' gatehouse · To the sluice gallery · and 42 more.

**42. “Search here”** (primary; search(gate__well)) · consequential 36 · Day 2, 11:03 p.m.

> The conger in the gate-well comes at you! ·
>
> Wenna 14/14 · Carlin 10/10 | against you: the conger in the gate-well 12/12 ·
>

- Aims gone: gate__gate_pawl, region__e1_sought, raidersFolk__bell_sought
- Time: 1 watch
- By Rule temper_closes (rule fired): - warned(gate__conger, party); + assails(gate__conger, party)
- By Rule lingers (rule fired): + lingered(party) = 1

Withdrawn: Attack the conger in the gate-well · To the Wardens' gatehouse · To the sluice gallery · Wait a while · Wait an hour · Wait until first light · Wait and watch, until something changes · Put out Wenna's light for good · Light a candle · Give a lantern to Carlin · Give a longsword to Carlin · Give ring mail to Carlin · Give a ten-foot pole to Carlin · Give a candle to Carlin · Give a shortbow to Wenna · Give leather armor to Wenna · Give a bedroll to Wenna · Give firewood to Wenna · Give a flask to Wenna · Give a candle to Wenna · Give Bran's tally-stick to Carlin · Set down a lantern · Set down a longsword · Set down ring mail · Set down a ten-foot pole · Set down a candle · Set down a shortbow · Set down leather armor · Set down a bedroll · Set down firewood · Set down a flask · Set down Bran's tally-stick.
Offered: Melee Attack at the conger in the gate-well · Flee · Guard at Carlin · Let Wenna fight this turn · Cleave at the conger in the gate-well · Defend · Prepare Charge · Second Wind · Sweeping Strike at the conger in the gate-well · Taunt at the conger in the gate-well · Steel Yourself · Wait · Guard at Wenna.

**43. {"act":"fight:through"}** (not in the scene before) · consequential 37 · Day 2, 11:13 p.m.

> Carlin shoots the conger in the gate-well with the shortbow, for 3. The conger in the gate-well falls. Carlin chuckles: ‘That was fun!’ ·
>
> The fight is won. ·
>
> The conger comes at you out of the silt, its jaws wide.
>
> Provisions: Food for 1 day · Wenna's torch, 40 minutes left · 2 candles to spare · a lamp, and no oil for it. ·
>

- Aims taken up: gate__gate_pawl, region__e1_sought, raidersFolk__bell_sought
- Time: 1 watch
- By Rule lingers (rule fired): - lingered(party) = 1; + lingered(party) = 2

Offered: To the guest-hall of Gatesend · To the chapel of the brothers' house · To the sluice gallery · To the cloister · and 41 more.

**44. “Search here”** (rest; search(gate__well)) · consequential 38 · Day 2, 11:33 p.m.

> With care, a little at a time, you search the gate-well, under the gatehouse.
>
> Your foot finds it before your hands do: under the silt, a curved bar of iron as long as your forearm, bronze-shod, the wardens’ wave cut in its face.
>
> Following: Bring the sea-gate's pawl up out of the gate-well. ·
>
> Provisions: Food for 1 day · Wenna's torch, 20 minutes left · 2 candles to spare · a lamp, and no oil for it. ·
>

- Learned: gate__pawl_found
- Aims taken up: gate__gate_take
- Aims gone: gate__gate_pawl
- Time: 2 watches
- By Rule lingers (rule fired): - lingered(party) = 2; + lingered(party) = 4

Offered: Collect the sea-gate's pawl for Wenna · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the sluice gallery · and 42 more.

**45. “Collect the sea-gate's pawl for Wenna”** (primary; take_item(gate__pawl,region__member_party_1)) · consequential 39 · Day 2, 11:34 p.m.

> Wenna takes the sea-gate’s pawl.
>
> Following: Take the pawl to the windlass at Gatesend, and wind the sea-gate shut. ·
>

- Came into the company's hands: gate__pawl
- Aims taken up: gate__gate_wind
- Aims gone: gate__gate_take

Withdrawn: Collect the sea-gate's pawl for Carlin.
Offered: To the Wardens' gatehouse (led) · To the guest-hall of Gatesend · To the sluice gallery · To the chapel of the brothers' house · and 42 more.

## the Wardens' gatehouse

**46. “To the Wardens' gatehouse”** (led; go(gate__well_ladder,gate__gatehouse)) · consequential 40 · Day 2, 11:36 p.m.

> Something big is feeding in the gate-well: down the slot in the floor its water slaps and heaves, though the tide has not turned.
>
> Turning the pawl over in the light at the door, you see that the stub of its pin is bright and square: sawn through, not worn.
>
> Provisions: Food for 1 day · Wenna's torch, put out with 20 minutes left · 2 candles to spare · a lamp, and no oil for it. ·
>

- Learned: gate__cut
- Moved: party gate__well → gate__gatehouse
- Aims taken up: gate__gate_cutter
- By Rule came_here (rule fired): - arrivedAt(party) = 233; - stoodAt(party, gate__well); + arrivedAt(party) = 237; + stoodAt(party, gate__gatehouse)
- By Rule lingers (rule fired): - lingered(party) = 4
- By Rule gate__m_cut_achieved (rule fired): + achieved(gate__m_cut)

Offered: Set the pawl in its socket and wind the sea-gate shut · likely · To the sluice gallery · and 38 more.

**47. “Set the pawl in its socket and wind the sea-gate shut · likely”** (primary; gate__wind_gate(party,gate__gatehouse)) · consequential 41 · Day 3, 12:36 a.m.

> The pawl drops into its socket with a sound like a bell. Then the long work: the windlass bars, a turn and a rest and a turn, the chain coming up wet out of the slot link by link, the pawl clacking over the ratchet. Below, at last, something enormous seats itself in stone, and the mill-race sound stops.
>
> Below the gatehouse a flat-bottomed boat noses up the sluice-cut against the shut gate, low in the water with sacks, and Ifan Rhys at the pole. He looks up at you through the slot in the floor and does not call out.
>
> Wenna and Carlin each gain 50 experience: found that the sea-gate’s pawl had been sawn loose. ?
>
> Wenna and Carlin each gain 200 experience: shut the last of the Water-Wardens’ sea-gates. ?
>
> Inside, a windlass of black oak as thick as a man fills the room, its drum wound tight with chain that goes down through a slot in the floor. A ratchet ring of bronze is set round its axle, and the pawl stands in its socket against a tooth of it. Over the door a wave inside a ring is cut in the lintel.
>
> Below the slot Ifan Rhys holds his boat against the shut gate with the pole, and waits.
>
> Following: Tell the reeve at Porthalen that the sea-gate shuts. ·
>

- Learned: gate__shut, pans__cut_clear
- Moved: gate__ifan region__s4_green → gate__gatehouse
- Went out of them: gate__pawl
- Aims taken up: gate__gate_claim, howe__ridge_aim
- Aims gone: gate__gate_wind
- Time: 6 watches
- By Rule gate__boat_comes (rule fired): - at(gate__ifan, region__s4_green); + at(gate__ifan, gate__gatehouse); + at(gate__ifanboat, gate__gatehouse); + gate__boatCome(party)
- By Rule gate__m_mended_achieved (rule fired): + achieved(gate__m_mended)
- By Rule arcology__rv_start (rule fired): + arcology__rivalAt(arcology__house) = 240; + arcology__rivalStage(arcology__house) = 1
- By Rule howe__levy_men_arrives_from_nowhere (rule fired): + at(howe__levy_men, region__s4_green); + howe__levy_men_arrived()
- By Rule lingers (rule fired): + lingered(party) = 6
- By Rule gate__word_old (rule fired): + stale(gate__failing)

Withdrawn: Give the sea-gate's pawl to Carlin · Set down the sea-gate's pawl.
Offered: To the sea-bank at Gatesend · To the sluice gallery · Ifan Rhys's boat · and 37 more.

**48. “follow gate__gate_claim”** (asked; {"follow":"gate__gate_claim"}) · not consequential · Day 3, 12:36 a.m.

> Ifan Rhys, an eel-man of Gatesend, mending a trap at his door, is here. ·
>
> Wenna makes the brawn check (d20 11 + strength 3 + brawn 2 = 16 against 13). ?
>
> Following: Tell the reeve at Porthalen that the sea-gate shuts. ·
>
> Provisions: Food for 1 day · Wenna's torch, put out with 20 minutes left · 2 candles to spare · a lamp, and no oil for it. ·
>

Offered: To the sea-bank at Gatesend · To the sluice gallery · Ifan Rhys's boat · and 37 more.

## the sea-bank at Gatesend

**49. “To the sea-bank at Gatesend”** (primary; go(gate__gate_door,gate__bank)) · consequential 42 · Day 3, 12:37 a.m.

> The sea-bank runs straight between the grey water and the green fen. Under the gatehouse the water lies still.
>

- Moved: party gate__gatehouse → gate__bank
- By Rule came_here (rule fired): - arrivedAt(party) = 237; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 243; + stoodAt(party, gate__bank)
- By Rule lingers (rule fired): - lingered(party) = 6

Offered: Set out for Porthalen (led) · To the sluice gallery · To the guest-hall of Gatesend · To the chapel of the brothers' house · and 42 more.

## the bridge over the Whitewater

**50. “Set out for Porthalen”** (led; travel:region__s1) · consequential 43 · Day 3, 8:57 a.m.

> The road crosses the Whitewater by a bridge of old grey stone, three arches green with moss; the river runs deep and quick beneath.
>
> Doors are open all along the lane. Someone has chalked a wave inside a ring on the well-post, and an old man you have never met takes your hand in both of his and says nothing at all.
>
> Need: Weary ·
>

- Learned: renewal1fever__sick, renewal1fever__sick, renewal1fever__sick, renewal1fever__sick, renewal1fever__sick, renewal1fever__sick
- Moved: howe__household howe__forecourt → howe__gallery; party gate__bank → region__s5_s2_way; region__s1_r1 region__s1_houses → region__s1_sheds; region__s1_r10 region__s1_houses → region__s1_green; region__s1_r2 region__s1_houses → region__s1_waterside; region__s1_r3 region__s1_houses → region__s1_fields; region__s1_r4 region__s1_houses → region__s1_saltpans; region__s1_r5 region__s1_houses → region__s1_byre; region__s1_r6 region__s1_houses → region__s1_fields; region__s1_r7 region__s1_houses → region__s1_green; region__s1_r8 region__s1_houses → region__s1_green; region__s1_r9 region__s1_houses → region__s1_green; region__s2_r1 region__s2_houses → region__s2_well; region__s2_r2 region__s2_houses → region__s2_fields; region__s2_r3 region__s2_houses → region__s2_waterside; region__s2_r4 region__s2_houses → region__s2_fields; region__s2_r5 region__s2_houses → region__s2_green; region__s2_r6 region__s2_houses → region__s2_green; region__s2_r7 region__s2_houses → region__s2_green; region__s3_r1 region__s3_houses → region__s3_green; region__s3_r2 region__s3_houses → region__s3_green; region__s3_r3 region__s3_houses → region__s3_lanes; region__s3_r4 region__s3_houses → region__s3_clamps; region__s3_r5 region__s3_houses → region__s3_byre; region__s3_r6 region__s3_houses → region__s3_green; region__s3_r7 region__s3_houses → region__s3_green; region__s4_r1 region__s4_houses → region__s4_cloister; region__s4_r2 region__s4_houses → region__s4_lanes; region__s4_r3 region__s4_houses → region__s4_fields; region__s4_r4 region__s4_houses → region__s4_green; region__s5_r1 region__s5_houses → region__s5_crossing; region__s5_r2 region__s5_houses → region__s5_green; region__s5_r3 region__s5_houses → region__s5_waterside; region__s5_r4 region__s5_houses → region__s5_green; tower__risen region__s3_green → tower__hall
- Came into the company's hands: renewal1fever__mother_person__cloth, renewal1fever__sister_person__battleaxe, renewal1fever__sister_person__candle, renewal1fever__sister_person__pole, renewal1fever__sister_person__scale, renewal1fever__sister_person__torch
- Time: 50 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 243; - stoodAt(party, gate__bank); + arrivedAt(party) = 293; + stoodAt(party, region__s5_s2_way)
- By Rule gate__conger_sinks (rule fired): - at(gate__conger, gate__well)
- By Rule howe__household_in (rule fired): - at(howe__household, howe__forecourt); + at(howe__household, howe__gallery)
- By Rule region__s1_r1_day (rule fired): - at(region__s1_r1, region__s1_houses); + at(region__s1_r1, region__s1_sheds)
- By Rule region__s1_r10_day (rule fired): - at(region__s1_r10, region__s1_houses); + at(region__s1_r10, region__s1_green)
- By Rule region__s1_r2_day (rule fired): - at(region__s1_r2, region__s1_houses); + at(region__s1_r2, region__s1_waterside)
- By Rule region__s1_r3_day (rule fired): - at(region__s1_r3, region__s1_houses); + at(region__s1_r3, region__s1_fields)
- By Rule region__s1_r4_day (rule fired): - at(region__s1_r4, region__s1_houses); + at(region__s1_r4, region__s1_saltpans)
- By Rule region__s1_r5_day (rule fired): - at(region__s1_r5, region__s1_houses); + at(region__s1_r5, region__s1_byre)
- By Rule region__s1_r6_day (rule fired): - at(region__s1_r6, region__s1_houses); + at(region__s1_r6, region__s1_fields)
- By Rule region__s1_r7_day (rule fired): - at(region__s1_r7, region__s1_houses); + at(region__s1_r7, region__s1_green)
- By Rule region__s1_r8_day (rule fired): - at(region__s1_r8, region__s1_houses); + at(region__s1_r8, region__s1_green)
- By Rule region__s1_r9_day (rule fired): - at(region__s1_r9, region__s1_houses); + at(region__s1_r9, region__s1_green)
- By Rule region__s2_r1_day (rule fired): - at(region__s2_r1, region__s2_houses); + at(region__s2_r1, region__s2_well)
- By Rule region__s2_r2_day (rule fired): - at(region__s2_r2, region__s2_houses); + at(region__s2_r2, region__s2_fields)
- By Rule region__s2_r3_day (rule fired): - at(region__s2_r3, region__s2_houses); + at(region__s2_r3, region__s2_waterside)
- By Rule region__s2_r4_day (rule fired): - at(region__s2_r4, region__s2_houses); + at(region__s2_r4, region__s2_fields)
- By Rule region__s2_r5_day (rule fired): - at(region__s2_r5, region__s2_houses); + at(region__s2_r5, region__s2_green)
- By Rule region__s2_r6_day (rule fired): - at(region__s2_r6, region__s2_houses); + at(region__s2_r6, region__s2_green)
- By Rule region__s2_r7_day (rule fired): - at(region__s2_r7, region__s2_houses); + at(region__s2_r7, region__s2_green)
- By Rule region__s3_r1_day (rule fired): - at(region__s3_r1, region__s3_houses); + at(region__s3_r1, region__s3_green)
- By Rule region__s3_r2_day (rule fired): - at(region__s3_r2, region__s3_houses); + at(region__s3_r2, region__s3_green)
- By Rule region__s3_r3_day (rule fired): - at(region__s3_r3, region__s3_houses); + at(region__s3_r3, region__s3_lanes)
- By Rule region__s3_r4_day (rule fired): - at(region__s3_r4, region__s3_houses); + at(region__s3_r4, region__s3_clamps)
- By Rule region__s3_r5_day (rule fired): - at(region__s3_r5, region__s3_houses); + at(region__s3_r5, region__s3_byre)
- By Rule region__s3_r6_day (rule fired): - at(region__s3_r6, region__s3_houses); + at(region__s3_r6, region__s3_green)
- By Rule region__s3_r7_day (rule fired): - at(region__s3_r7, region__s3_houses); + at(region__s3_r7, region__s3_green)
- By Rule region__s4_r1_day (rule fired): - at(region__s4_r1, region__s4_houses); + at(region__s4_r1, region__s4_cloister)
- By Rule region__s4_r2_day (rule fired): - at(region__s4_r2, region__s4_houses); + at(region__s4_r2, region__s4_lanes)
- By Rule region__s4_r3_day (rule fired): - at(region__s4_r3, region__s4_houses); + at(region__s4_r3, region__s4_fields)
- By Rule region__s4_r4_day (rule fired): - at(region__s4_r4, region__s4_houses); + at(region__s4_r4, region__s4_green)
- By Rule region__s5_r1_day (rule fired): - at(region__s5_r1, region__s5_houses); + at(region__s5_r1, region__s5_crossing)
- By Rule region__s5_r2_day (rule fired): - at(region__s5_r2, region__s5_houses); + at(region__s5_r2, region__s5_green)
- By Rule region__s5_r3_day (rule fired): - at(region__s5_r3, region__s5_houses); + at(region__s5_r3, region__s5_waterside)
- By Rule region__s5_r4_day (rule fired): - at(region__s5_r4, region__s5_houses); + at(region__s5_r4, region__s5_green)
- By Rule tower__dawn (rule fired): - at(tower__risen, region__s3_green); - tower__opened(tower__churchyard) = 6; + at(tower__risen, tower__hall); + tower__opened(tower__churchyard) = 7
- By Rule tollKeepers__eats (rule fired): - quantity(tollKeepers__chief, rations) = 3; + quantity(tollKeepers__chief, rations) = 2
- By Rule arcology__lilies_open (rule fired): - state(arcology__blossoms, arcology__folded); + state(arcology__blossoms, arcology__open)
- By Rule region__sky_5 (rule fired): - state(region__sky, region__weather_rainy); + state(region__sky, region__weather_foggy)
- By Rule gate__hamlet_thanks (rule fired): + gate__thanked(party)
- By Rule region__s1_tie_turns (rule fired): + region__s1_tie_lost(party)
- By Rule region__s3_tie_turns (rule fired): + region__s3_tie_lost(party)
- By Rule region__s5_tie_turns (rule fired): + region__s5_tie_lost(party)
- By Rule weariness (rule fired): + weary(party)

Offered: Set out for Porthalen (led) · Make camp and sleep · To the fen of Addermoss by the road, an hour and a half out of Reedbridge · To the fen of Addermoss by the road, two hours out of Reedbridge · and 79 more.

**51. “Make camp and sleep”** (primary; camp(region__s5_s2_way)) · consequential 44 · Day 3, 4:57 p.m.

> You find what shelter there is, and sleep as well as you can, with one ear open.
>
> Wenna recovers 2 HP (14 HP). ?
>
> Odo is standing in the road shouting at a hedge. One of the cattle has gone through it into the field beyond.
>

- Moved: arcology__crew arcology__landing → arcology__terrace; arcology__quill arcology__landing → arcology__terrace; region__s1_s5_way_t region__s1_taproom → region__s5_taproom; region__s2_s3_way_t region__s2_taproom → region__s2_s3_way; region__s2_s4_way_t region__s2_taproom → region__s4_taproom; region__s4_s3_way_t region__s4_taproom → region__s3_taproom; region__s5_s2_way_t region__s5_taproom → region__s5_s2_way
- Time: 48 watches
- By Rule arcology__rv_wedge (rule fired): - arcology__rivalAt(arcology__house) = 240; - arcology__rivalStage(arcology__house) = 1; - at(arcology__crew, arcology__landing); - at(arcology__quill, arcology__landing); and 7 more
- By Rule region__s1_s5_way_t_out (rule fired): - at(region__s1_s5_way_t, region__s1_taproom)
- By Rule region__s2_s3_way_t_out (rule fired): - at(region__s2_s3_way_t, region__s2_taproom); + at(region__s2_s3_way_t, region__s2_s3_way)
- By Rule region__s2_s4_way_t_out (rule fired): - at(region__s2_s4_way_t, region__s2_taproom)
- By Rule region__s4_s3_way_t_out (rule fired): - at(region__s4_s3_way_t, region__s4_taproom)
- By Rule region__s5_s2_way_t_out (rule fired): - at(region__s5_s2_way_t, region__s5_taproom); + at(region__s5_s2_way_t, region__s5_s2_way)
- By Rule region__s1_s5_way_t_in0 (rule fired): - region__journeysTo(region__s1_s5_way_t, region__s5_green); + at(region__s1_s5_way_t, region__s5_taproom); + region__journeysTo(region__s1_s5_way_t, region__s1_green)
- By Rule region__s2_s4_way_t_in0 (rule fired): - region__journeysTo(region__s2_s4_way_t, region__s4_green); + at(region__s2_s4_way_t, region__s4_taproom); + region__journeysTo(region__s2_s4_way_t, region__s2_green)
- By Rule region__s4_s3_way_t_in0 (rule fired): - region__journeysTo(region__s4_s3_way_t, region__s3_green); + at(region__s4_s3_way_t, region__s3_taproom); + region__journeysTo(region__s4_s3_way_t, region__s4_green)
- By Rule gate__eels_ebb (rule fired): - state(gate__eels, gate__hunting); + peaceable(gate__eels); + state(gate__eels, gate__stranded)
- By Rule arcology__hum_falls (rule fired): + arcology__humAt(arcology__house) = 312
- By Rule lingers (rule fired): + lingered(party) = 48
- By Rule region__s2_s3_way_t_trouble (rule fired): + region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_trouble (rule fired): + region__inTrouble(region__s5_s2_way_t)
- By Rule arcology__plate_high_strike_high__withheld (rule fired): + withheld(arcology__plate_high_strike_high)
- By Rule arcology__plate_low_strike_low__withheld (rule fired): + withheld(arcology__plate_low_strike_low)
- By Rule arcology__plate_mid_strike_mid__withheld (rule fired): + withheld(arcology__plate_mid_strike_mid)

Offered: Set out for Porthalen (led) · Go through the hedge after Odo's cow · To the fen of Addermoss by the road, an hour and a half out of Reedbridge · Talk to Odo · and 80 more.

## the landing at Porthalen

**52. “Set out for Porthalen”** (led; travel:region__s1) · consequential 45 · Day 3, 10:27 p.m.

> Porthalen is shuttered for the night.
>
> The wardens have stopped paying. A hayrick at Reedbridge has burned in the night, and the bailiff has put up a new notice: SIX CROWNS, AND A FINE FOR THE FIRE.
>
> The merchant’s stall is shuttered at midday. The surveyor’s son has the head of the market, and the brass-bound measure, and a following, and a way of saying ‘mine’ that has gone from a claim to a custom.
>
> A pedlar is coming the other way along the sheep-track, bent under a pack on a frame, and lifts his staff to you from a long way off.
>
> Out across the gulf, a chain tightens, and a weight the size of a bell goes up the cliff-face through a slot in the glass, slowly.
>
> Need: Pick the corn-store padlock: needs lockwork ·
>
> Provisions: No food · Wenna's torch, put out with 20 minutes left · 2 candles to spare · a lamp, and no oil for it. ·
>

- Moved: arcology__crew arcology__terrace → arcology__bridge_mid; arcology__quill arcology__terrace → arcology__bridge_near; howe__household howe__gallery → howe__forecourt; party region__s5_s2_way → region__s1_green; region__s1_r1 region__s1_sheds → region__s1_houses; region__s1_r10 region__s1_green → region__s1_houses; region__s1_r2 region__s1_waterside → region__s1_houses; region__s1_r3 region__s1_fields → region__s1_houses; region__s1_r4 region__s1_saltpans → region__s1_houses; region__s1_r5 region__s1_byre → region__s1_houses; region__s1_r6 region__s1_fields → region__s1_houses; region__s1_r7 region__s1_green → region__s1_houses; region__s1_r8 region__s1_green → region__s1_houses; region__s1_r9 region__s1_green → region__s1_houses; region__s2_r1 region__s2_well → region__s2_houses; region__s2_r2 region__s2_fields → region__s2_houses; region__s2_r3 region__s2_waterside → region__s2_houses; region__s2_r4 region__s2_fields → region__s2_houses; region__s2_r5 region__s2_green → region__s2_houses; region__s2_r6 region__s2_green → region__s2_houses; region__s2_r7 region__s2_green → region__s2_houses; region__s2_s3_way_t region__s2_s3_way → region__s3_taproom; region__s3_r1 region__s3_green → region__s3_houses; region__s3_r2 region__s3_green → region__s3_houses; region__s3_r3 region__s3_lanes → region__s3_houses; region__s3_r4 region__s3_clamps → region__s3_houses; region__s3_r5 region__s3_byre → region__s3_houses; region__s3_r6 region__s3_green → region__s3_houses; region__s3_r7 region__s3_green → region__s3_houses; region__s4_r1 region__s4_cloister → region__s4_houses; region__s4_r2 region__s4_lanes → region__s4_houses; region__s4_r3 region__s4_fields → region__s4_houses; region__s4_r4 region__s4_green → region__s4_houses; region__s5_r1 region__s5_crossing → region__s5_houses; region__s5_r2 region__s5_green → region__s5_houses; region__s5_r3 region__s5_waterside → region__s5_houses; region__s5_r4 region__s5_green → region__s5_houses; region__s5_s2_way_t region__s5_s2_way → region__s2_taproom; region__wr134 region__t134 → region__t174; tower__risen tower__hall → region__s3_green
- Time: 33 watches
- By Rule arcology__lift_b (rule fired): - arcology__limit(arcology__deck) = 10; + arcology__lifted(arcology__winch_b); + arcology__limit(arcology__deck) = 20
- By Rule arcology__rv_wind (rule fired): - arcology__rivalAt(arcology__house) = 300; - arcology__rivalStage(arcology__house) = 2; - at(arcology__crew, arcology__terrace); - at(arcology__quill, arcology__terrace); and 8 more
- By Rule came_here (rule fired): - arrivedAt(party) = 293; - stoodAt(party, region__s5_s2_way); + arrivedAt(party) = 374; + stoodAt(party, region__s1_green)
- By Rule howe__household_out (rule fired): - at(howe__household, howe__gallery); + at(howe__household, howe__forecourt)
- By Rule region__s1_r1_evening (rule fired): - at(region__s1_r1, region__s1_sheds)
- By Rule region__s1_r10_evening (rule fired): - at(region__s1_r10, region__s1_green)
- By Rule region__s1_r2_evening (rule fired): - at(region__s1_r2, region__s1_waterside); + at(region__s1_r2, region__s1_houses)
- By Rule region__s1_r3_evening (rule fired): - at(region__s1_r3, region__s1_fields)
- By Rule region__s1_r4_evening (rule fired): - at(region__s1_r4, region__s1_saltpans)
- By Rule region__s1_r5_evening (rule fired): - at(region__s1_r5, region__s1_byre); + at(region__s1_r5, region__s1_houses)
- By Rule region__s1_r6_evening (rule fired): - at(region__s1_r6, region__s1_fields)
- By Rule region__s1_r7_evening (rule fired): - at(region__s1_r7, region__s1_green); + at(region__s1_r7, region__s1_houses)
- By Rule region__s1_r8_evening (rule fired): - at(region__s1_r8, region__s1_green)
- By Rule region__s1_r9_evening (rule fired): - at(region__s1_r9, region__s1_green); + at(region__s1_r9, region__s1_houses)
- By Rule region__s2_r1_evening (rule fired): - at(region__s2_r1, region__s2_well)
- By Rule region__s2_r2_evening (rule fired): - at(region__s2_r2, region__s2_fields); + at(region__s2_r2, region__s2_houses)
- By Rule region__s2_r3_evening (rule fired): - at(region__s2_r3, region__s2_waterside); + at(region__s2_r3, region__s2_houses)
- By Rule region__s2_r4_evening (rule fired): - at(region__s2_r4, region__s2_fields); + at(region__s2_r4, region__s2_houses)
- By Rule region__s2_r5_evening (rule fired): - at(region__s2_r5, region__s2_green); + at(region__s2_r5, region__s2_houses)
- By Rule region__s2_r6_evening (rule fired): - at(region__s2_r6, region__s2_green); + at(region__s2_r6, region__s2_houses)
- By Rule region__s2_r7_evening (rule fired): - at(region__s2_r7, region__s2_green); + at(region__s2_r7, region__s2_houses)
- By Rule region__s2_s3_way_t_in0 (rule fired): - at(region__s2_s3_way_t, region__s2_s3_way); - region__journeysTo(region__s2_s3_way_t, region__s3_green); + at(region__s2_s3_way_t, region__s3_taproom); + region__journeysTo(region__s2_s3_way_t, region__s2_green)
- By Rule region__s3_r1_evening (rule fired): - at(region__s3_r1, region__s3_green); + at(region__s3_r1, region__s3_houses)
- By Rule region__s3_r2_evening (rule fired): - at(region__s3_r2, region__s3_green); + at(region__s3_r2, region__s3_houses)
- By Rule region__s3_r3_evening (rule fired): - at(region__s3_r3, region__s3_lanes); + at(region__s3_r3, region__s3_houses)
- By Rule region__s3_r4_evening (rule fired): - at(region__s3_r4, region__s3_clamps); + at(region__s3_r4, region__s3_houses)
- By Rule region__s3_r5_evening (rule fired): - at(region__s3_r5, region__s3_byre)
- By Rule region__s3_r6_evening (rule fired): - at(region__s3_r6, region__s3_green)
- By Rule region__s3_r7_evening (rule fired): - at(region__s3_r7, region__s3_green); + at(region__s3_r7, region__s3_houses)
- By Rule region__s4_r1_evening (rule fired): - at(region__s4_r1, region__s4_cloister); + at(region__s4_r1, region__s4_houses)
- By Rule region__s4_r2_evening (rule fired): - at(region__s4_r2, region__s4_lanes)
- By Rule region__s4_r3_evening (rule fired): - at(region__s4_r3, region__s4_fields); + at(region__s4_r3, region__s4_houses)
- By Rule region__s4_r4_evening (rule fired): - at(region__s4_r4, region__s4_green)
- By Rule region__s5_r1_evening (rule fired): - at(region__s5_r1, region__s5_crossing); + at(region__s5_r1, region__s5_houses)
- By Rule region__s5_r2_evening (rule fired): - at(region__s5_r2, region__s5_green)
- By Rule region__s5_r3_evening (rule fired): - at(region__s5_r3, region__s5_waterside); + at(region__s5_r3, region__s5_houses)
- By Rule region__s5_r4_evening (rule fired): - at(region__s5_r4, region__s5_green)
- By Rule region__s5_s2_way_t_in0 (rule fired): - at(region__s5_s2_way_t, region__s5_s2_way); - region__journeysTo(region__s5_s2_way_t, region__s2_green); + at(region__s5_s2_way_t, region__s2_taproom); + region__journeysTo(region__s5_s2_way_t, region__s5_green)
- By Rule region__wr134_comes (rule fired): - at(region__wr134, region__t134); + at(region__wr134, region__t174); + region__roved(region__wr134)
- By Rule tower__walk (rule fired): - at(tower__risen, tower__hall); + at(tower__risen, region__s3_green)
- By Rule lingers (rule fired): - lingered(party) = 48
- By Rule meal (rule fired): - nextMeal(party) = 360; - quantity(party, rations) = 1; + nextMeal(party) = 504
- By Rule arcology__crew_sours_bridge (rule fired): - peaceable(arcology__crew); + temperament(arcology__crew, temper_proud); + tribute(arcology__crew) = 5
- By Rule gate__eels_flow (rule fired): - peaceable(gate__eels); - state(gate__eels, gate__stranded); + state(gate__eels, gate__hunting)
- By Rule region__s2_s3_way_t_sorted (rule fired): - region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_sorted (rule fired): - region__inTrouble(region__s5_s2_way_t)
- By Rule arcology__lilies_close (rule fired): - state(arcology__blossoms, arcology__open); + state(arcology__blossoms, arcology__folded)
- By Rule arcology__lift_a (rule fired): + arcology__lifted(arcology__winch_a)
- By Rule region__s1_r1_night (rule fired): + at(region__s1_r1, region__s1_houses)
- By Rule region__s1_r10_night (rule fired): + at(region__s1_r10, region__s1_houses)
- By Rule region__s1_r3_night (rule fired): + at(region__s1_r3, region__s1_houses)
- By Rule region__s1_r4_night (rule fired): + at(region__s1_r4, region__s1_houses)
- By Rule region__s1_r6_night (rule fired): + at(region__s1_r6, region__s1_houses)
- By Rule region__s1_r8_night (rule fired): + at(region__s1_r8, region__s1_houses)
- By Rule region__s2_r1_night (rule fired): + at(region__s2_r1, region__s2_houses)
- By Rule region__s3_r5_night (rule fired): + at(region__s3_r5, region__s3_houses)
- By Rule region__s3_r6_night (rule fired): + at(region__s3_r6, region__s3_houses)
- By Rule region__s4_r2_night (rule fired): + at(region__s4_r2, region__s4_houses)
- By Rule region__s4_r4_night (rule fired): + at(region__s4_r4, region__s4_houses)
- By Rule region__s5_r2_night (rule fired): + at(region__s5_r2, region__s5_houses)
- By Rule region__s5_r4_night (rule fired): + at(region__s5_r4, region__s5_houses)

Offered: Tell the reeve the sea-gate at Gatesend shuts · Into the Stone Horn by the door · Talk to the tinker's daughter — ask why she was left behind · Read the notice on the well-post · and 102 more.

**53. “Tell the reeve the sea-gate at Gatesend shuts”** (primary; gate__claim_whole) · consequential 46 · Day 3, 10:27 p.m.

> The reeve rides out to see for herself before she pays, and stands on the sea-bank a long while with the wind in her cloak. Then thirty crowns, counted out on the gatehouse sill. ‘The fen owes you,’ she says. ‘So do I. When the tally goes up to the Tower of the Scales this quarter, I will need someone to carry it who knows what the sea costs.’ Before she seals the tally she adds a line to it in her own hand, reading it out as she writes: ‘Salt of Porthalen: one salter’s pans, a month’s boiling; Ffion Wyn’s, none.’ She seals it. ‘A short march. The Exchange will price Iscoed’s jar as dear as ever, and thank me for it.’
>
> Wenna takes the reeve’s quarter-tally, in a scroll-case. ?
>
> Following: Take the reeve's tally north up the salt road to the Tower of the Scales in Dun Rìerdan. ·
>

- Learned: gate__road_north
- Came into the company's hands: gate__tally_case
- Aims taken up: gate__north_aim
- Aims gone: gate__gate_claim

Offered: Into the Stone Horn by the door · Show the reeve the pawl's sawn pin · Talk to the tinker's daughter — ask why she was left behind · Talk to the surveyor's son — buy the measure from the surveyor's son, though the market has gone his way · and 105 more.
