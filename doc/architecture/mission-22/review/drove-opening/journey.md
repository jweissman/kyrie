# Journey review: --world iscoed --as human/warrior/Wenna

Recorded live, as it was played, at f4daf813, 2026-11-19T00:03:45.996Z.
The lines: doc/architecture/mission-22/cold/cold-6-lines.txt, first played at c7fa2382.
43 lines sent, 39 of them consequential; 42 scenes.

| shown | exact | producer only | unknown |
|---|---|---|---|
| lines | 70 (58%) | 47 (39%) | 4 (3%) |
| words | 1923 (84%) | 318 (14%) | 36 (2%) |
| narration lines | 67 (71%) | 23 (24%) | 4 (4%) |
| narration words | 1838 (91%) | 148 (7%) | 36 (2%) |
| choices offered | 1339 (72%) | 518 (28%) | 0 (0%) |

- unknown, 3 lines (32 words): an event line no producer of this step made whole
- unknown, 1 lines (4 words): no producer of this step made it

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

Offered: Ask Owain how many head came down · To the customs-house · Read the notice on the well-post · and 69 more.

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

- Learned: drove__boy_count, gate__boat_offer, gate__failing, pans__cold, region__s1_why
- Moved: drove__owain region__s1_green → drove__pens
- Aims taken up: drove__held_rhyne, pans__cold_aim, gate__gate_aim
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

Offered: To the customs-house · Read the notice on the well-post · Ask the factor about the king-barrow · and 68 more.

**2. “Collect Bran's tally-stick for Wenna”** (rest; take_item(origin__stick,region__member_party_1)) · consequential 2 · Day 1, 8:01 a.m.

> You take Bran’s tally-stick.
>

- Came into the company's hands: origin__stick

Offered: To the customs-house · Read the notice on the well-post · Ask the factor about the king-barrow · and 69 more.

**3. “Read Bran's tally-stick”** (rest; read_item(origin__stick)) · consequential 3 · Day 1, 8:03 a.m.

> Bran’s tally-stick has thirty-six notches for the drove, and four more cut through at the Black Rhyne.
>

- Learned: origin__tally

Offered: To the customs-house · Read the notice on the well-post · Ask the factor about the king-barrow · and 68 more.

**4. “Read the dues-receipt on the post”** (rest; change_thing(region__s1_receipt_a_read)) · consequential 4 · Day 1, 8:06 a.m.

> A wheel; no wing.
>
> RECEIVED OF THE FOLK OF Porthalen, FOR THE KEEPING OF THE ROAD, FOUR CROWNS A HEARTH, BY THE OFFICE OF THE ROAD. The seal: a wheel, in lead. Only a wheel.
>

- Learned: region__s1_rec_a
- Aims taken up: region__s1_rooke_aim_seal

Offered: To the customs-house · Into Porthalen Hall by the avenue up to Porthalen Hall · Read the notice on the well-post · and 67 more.

## the drove pens

**5. “To the drove pens”** (rest; go(drove__pens_gate,drove__pens)) · consequential 5 · Day 1, 8:16 a.m.

> Thirty-six black bullocks of the fells, rough-coated and restless, crowd the rails, bawling to be watered.
>
> Owain is carrying water to them a bucket at a time, in a cloak too big for him.
>

- Moved: party region__s1_green → drove__pens
- Time: 1 watch
- By Rule came_here (rule fired): - stoodAt(party, region__s1_green); + arrivedAt(party) = 1; + stoodAt(party, drove__pens)

Offered: To the Black Rhyne, behind the pens · To the customs-house · Water the drove from the pens' trough · and 44 more.

## the Black Rhyne, behind the pens

**6. “To the Black Rhyne, behind the pens”** (primary; go(drove__rhyne_bank,drove__rhyne)) · consequential 6 · Day 1, 8:26 a.m.

> A dyke of black water between steep banks, the far bank slumped into it where the sea came over in the winter. The smell reaches you before the sight does.
>

- Moved: party drove__pens → drove__rhyne
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 1; - stoodAt(party, drove__pens); + arrivedAt(party) = 2; + stoodAt(party, drove__rhyne)

Offered: To the customs-house · Search here · To the drove pens · and 43 more.

**7. “Search here”** (primary; search(drove__rhyne)) · consequential 7 · Day 1, 8:46 a.m.

> You search the Black Rhyne, behind the pens with care, a little at a time.
>
> Down where the bank has slumped, under the black water, something big and dark: a bullock, and another beyond it, four in all, the brand of a Brynach drove burnt into each flank. They have been there since last night.
>

- Learned: drove__found_drowned
- Aims taken up: drove__held_proof
- Aims gone: drove__held_rhyne
- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: To the customs-house · To the taproom of the Stone Horn · To the drove pens · and 42 more.

## the customs-house

**8. “To the customs-house”** (primary; travel:drove__customs) · consequential 8 · Day 1, 9:07 a.m.

> A long counter, a strongbox chained to the wall, and a window barred like a gaol’s. Through a grille at the back a big man in a drover’s cloak sits on a bench with his hands between his knees.
>

- Learned: drove__clerk_count
- Moved: party drove__rhyne → drove__customs; region__s1_s5_way_t region__s1_taproom → region__s1_s5_way; region__s2_s3_way_t region__s2_taproom → region__s2_s3_way; region__s2_s4_way_t region__s2_taproom → region__s2_s4_way; region__s4_s3_way_t region__s4_taproom → region__s4_s3_way; region__s5_s2_way_t region__s5_taproom → region__s5_s2_way
- Time: 2 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 2; - stoodAt(party, drove__rhyne); + arrivedAt(party) = 6; + stoodAt(party, drove__customs)
- By Rule region__s1_s5_way_t_out (rule fired): - at(region__s1_s5_way_t, region__s1_taproom); + at(region__s1_s5_way_t, region__s1_s5_way)
- By Rule region__s2_s3_way_t_out (rule fired): - at(region__s2_s3_way_t, region__s2_taproom); + at(region__s2_s3_way_t, region__s2_s3_way)
- By Rule region__s2_s4_way_t_out (rule fired): - at(region__s2_s4_way_t, region__s2_taproom); + at(region__s2_s4_way_t, region__s2_s4_way)
- By Rule region__s4_s3_way_t_out (rule fired): - at(region__s4_s3_way_t, region__s4_taproom); + at(region__s4_s3_way_t, region__s4_s3_way)
- By Rule region__s5_s2_way_t_out (rule fired): - at(region__s5_s2_way_t, region__s5_taproom); + at(region__s5_s2_way_t, region__s5_s2_way)
- By Rule lingers (rule fired): - lingered(party) = 2

Offered: Tell Mardle where the four bullocks are · Ask Bran what happened · To the landing at Porthalen · and 45 more.

**9. “Ask Bran what happened”** (primary; drove__bran_count_t) · consequential 9 · Day 1, 9:07 a.m.

> Bran looks up slowly. ‘Thirty-six crossed. Four went into the Black Rhyne behind the pens, when the bank gave under them. Ask the boy. And I’d pay the tenth on thirty-six without a word if it were the Rì’s tenth.’ He looks past you at the counter. ‘It is not the Rì’s. Ask how many droves Mardle has found four short this year.’
>

- Learned: drove__bran_count
- Aims gone: drove__bran_aim

Offered: Tell Mardle where the four bullocks are · Talk to Silas Mardle · To the landing at Porthalen · and 46 more.

**10. “Talk to Silas Mardle”** (primary; talk_to(drove__clerk)) · consequential 10 · Day 1, 9:07 a.m.

> Silas Mardle finishes what he was saying to someone else first.
>

Offered: Ask Mardle how many droves he has found four short this year · Tell Mardle where the four bullocks are · To the landing at Porthalen · and 47 more.

**11. {"act":"drove__clerk#talk"}** (not in the scene before) · not consequential

Refused: not offered: drove__clerk#talk

**12. “Ask Mardle how many droves he has found four short this year”** (primary; drove__clerk_short_t) · consequential 11 · Day 1, 9:07 a.m.

> ‘Every drove that was four short,’ says Mardle. His finger stays on the line in the book, and he does not look at you.
>

Offered: Tell Mardle where the four bullocks are · Talk to Silas Mardle · To the landing at Porthalen · and 46 more.

**13. “Tell Mardle where the four bullocks are”** (primary; drove__show_drowned(party,drove__customs)) · consequential 12 · Day 1, 9:17 a.m.

> Mardle’s mouth thins. ‘Beasts in a ditch prove nothing to the Rì’s book.’ But the customs-man at the door has heard, and goes out to look, and comes back, and says something low. Mardle shuts the book. ‘Let him out,’ he says. ‘And tell the reeve nothing she need be troubled with.’
>
> ‘Now I sell them, and drink, and go home,’ says Bran. ‘Up the drove road to Caer Brynach, four days with an empty drove.’ He grips your hand like a gate-post. ‘Come up the pass. There’s work in Brynach for anyone who’ll stand by a drover, and the lord pays for a sword: something has been at the cattle on the high pasture. Say Bran ap Ifor sent you.’
>
> Wenna gains 150 experience: saw Bran ap Ifor let out of the customs-house. ?
>
> A long counter and a strongbox chained to the wall. The grille at the back stands open on an empty bench.
>

- Learned: drove__road_west
- Moved: drove__bran drove__customs → drove__pens; drove__owain drove__pens → region__s1_green
- Aims gone: drove__held_proof
- Time: 1 watch
- By Rule drove__bran_out (rule fired): - at(drove__bran, drove__customs); + at(drove__bran, drove__pens)
- By Rule drove__owain_goes (rule fired): - at(drove__owain, drove__pens); + at(drove__owain, region__s1_green)
- By Rule drove__m_freed_achieved (rule fired): + achieved(drove__m_freed)
- By Rule drove__bran_thanks (rule fired): + drove__thanked(party)
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule drove__word_old (rule fired): + stale(drove__held)

Offered: To the taproom of the Stone Horn · To the shrine of Nodens · To the landing at Porthalen · and 43 more.

## the landing at Porthalen

**14. “To the landing at Porthalen”** (primary; go(drove__customs_door,region__s1_green)) · consequential 13 · Day 1, 9:18 a.m.

> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it.
>
> A wheel; no wing.
>
> RECEIVED OF THE FOLK OF Porthalen, FOR THE KEEPING OF THE ROAD, FOUR CROWNS A HEARTH, BY THE OFFICE OF THE ROAD. The seal: a wheel, in lead. Only a wheel.
>

- Moved: party drove__customs → region__s1_green
- By Rule conversation_ends (rule fired): - addressed(drove__clerk, party)
- By Rule came_here (rule fired): - arrivedAt(party) = 6; - stoodAt(party, drove__customs); + arrivedAt(party) = 7; + stoodAt(party, region__s1_green)
- By Rule lingers (rule fired): - lingered(party) = 1

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Read the notice on the well-post · Ask the factor about the king-barrow · and 69 more.

**15. “Talk to Reeve Annis Talfryn”** (rest; talk_to(gate__reeve)) · consequential 14 · Day 1, 9:18 a.m.

> Reeve Annis Talfryn looks at you for longer than is comfortable. ‘Well?’
>

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Ask the reeve about the sea-gate at Gatesend · Read the notice on the well-post · and 71 more.

**16. “Tell the reeve how Mardle counts the droves”** (rest; gate__reeve_mardle) · consequential 15 · Day 1, 9:18 a.m.

> The reeve hears it out without a word. ‘Third drove this year,’ she says at last. ‘I had wondered why the Brynach men stopped selling here.’ She writes something on her tablet and underlines it. ‘He keeps the Rì’s book, and I keep the Rì’s march. I will have the book off him by the quarter-day.’
>

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Ask the reeve about the sea-gate at Gatesend · Read the notice on the well-post · and 70 more.

**17. “Ask the reeve about the sea-gate at Gatesend”** (primary; gate__reeve_gate) · consequential 16 · Day 1, 9:18 a.m.

> ‘It will not shut,’ says the reeve. ‘It has not shut since the new moon. I have written to the Rì’s engineers in Dun Rìerdan, and they will come in the summer, with a bill, and the fen will have been sea since the spring.’ She looks at you as if measuring rope. ‘Six days to the spring tide. Thirty crowns. Nobody in Gatesend will go into the gatehouse now, with the sea running under it like a mill-race.’
>

- Learned: gate__tide

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Read the notice on the well-post · Ask the factor about the king-barrow · and 70 more.

**18. “Talk to your cousin”** (rest; talk_to(drove__owain)) · consequential 17 · Day 1, 9:18 a.m.


Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Ask Owain what he will do now · Read the notice on the well-post · and 70 more.

**19. “Ask Owain what he will do now”** (primary; drove__owain_after) · consequential 18 · Day 1, 9:18 a.m.

> ‘Go home with Bran,’ says Owain. ‘He sells them at the sales, and then it’s four days up the drove road to Caer Brynach.’ He looks at you, and then away. ‘You could come. He said so.’
>

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Read the notice on the well-post · Ask the factor about the king-barrow · and 70 more.

**20. “Take your leave of Owain”** (rest; take_leave(drove__owain)) · consequential 19 · Day 1, 9:18 a.m.

> ‘Be careful,’ says Owain. ‘I know you won’t, but be careful.’
>

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Read the notice on the well-post · Ask the factor about the king-barrow · and 70 more.

**21. “Read the notice on the well-post”** (primary; region__s1_u_notice_read(party,region__s1_green)) · consequential 20 · Day 1, 9:28 a.m.

> A notice on the post by the well, in three hands. ‘RATS in the old corn-store, a nest of them. Ten coin, and a lantern. Ask Holgar for the key.’ ‘Whoever will go down into the catacombs under the churchyard, where something has come up: fifteen coin, and the shrine’s thanks. Ask Leif.’ ‘SPIDERS in the old quarry. Twelve coin from the house. Ask Kynes for the gate key.’
>

- Learned: region__s1_u_notice
- Aims taken up: region__s1_u_rats_job_sought, region__s1_u_dead_job_sought, region__s1_u_spiders_job_sought
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Ask the factor about the king-barrow · Ask the surveyor's son what he wants with the measure · and 68 more.

## the shrine of Nodens

**22. “To the shrine of Nodens”** (rest; go(region__s1_shrine_door,region__s1_shrine)) · consequential 21 · Day 1, 9:29 a.m.

> A figure of grey stone, taller than a man, its face worn smooth: the figure of Nodens, God of Nature. A wreath of ivy hangs on it, cut fresh at each new moon.
>
> Under the lamp at the back, a young acolyte in a grey habit is copying the offering-book’s yearly sums onto a slate.
>
> You see the laid-out man and the shrine’s offering-box. ·
>

- Learned: region__s1_holy_past
- Moved: party region__s1_green → region__s1_shrine
- By Rule conversation_ends (rule fired): - addressed(gate__reeve, party)
- By Rule came_here (rule fired): - arrivedAt(party) = 7; - stoodAt(party, region__s1_green); + arrivedAt(party) = 8; + stoodAt(party, region__s1_shrine)
- By Rule lingers (rule fired): - lingered(party) = 1
- By Rule career__passed_by (rule fired): + career__passed(party)

Offered: Ask Leif about the noises under the churchyard · Ask Brother Anselm what he is counting · Climb the tower and look out over Porthalen · and 50 more.

**23. “Ask Leif about the noises under the churchyard”** (primary; region__s1_u_dead_job_ask) · consequential 22 · Day 1, 9:29 a.m.

> Leif looks at the floor. ‘The catacombs. Something has come up out of the bone-heaps, and there have been lights in the churchyard at night that were not mine.’ The crypt key is unhooked from a belt. ‘I cannot ask anyone to go. If you will, lay them, and find out who is doing it. Fifteen coin, and what the shrine can give besides.’
>
> You take the crypt key. ?
>

- Learned: region__s1_u_dead_job
- Came into the company's hands: crypt_key_given1
- Aims taken up: region__s1_u_dead_job_aim
- Aims gone: region__s1_u_dead_job_sought

Offered: Ask Leif why there are two chronicles of the kingdom · Climb the tower and look out over Porthalen · Ask Brother Anselm what he is counting · and 54 more.

**24. “Look under the cloth”** (rest; change_thing(region__s1_dead_look)) · consequential 23 · Day 1, 9:32 a.m.

> He was hit, or fell against something hard, before he went in the water; and he had walked a long way on wet ground.
>
> Under the cloth: Joss Hatherly, the wardens’ scaler, a bruise the size of a hand over one ear, river-silt in the seams of his boots, and in the boot-heel, hobnails of a pattern the Hall’s keeper does not wear.
>

- Learned: region__s1_death_bruise
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1

Offered: Climb the tower and look out over Porthalen · Ask Brother Anselm what he is counting · To the landing at Porthalen · and 49 more.

## the landing at Porthalen

**25. “To the landing at Porthalen”** (primary; go(region__s1_shrine_door,region__s1_green)) · consequential 24 · Day 1, 9:33 a.m.

> A quay of grey stone runs out into the water at Porthalen, its edge worn round and green with weed, and the town climbs behind it.
>
> A wheel; no wing.
>
> RECEIVED OF THE FOLK OF Porthalen, FOR THE KEEPING OF THE ROAD, FOUR CROWNS A HEARTH, BY THE OFFICE OF THE ROAD. The seal: a wheel, in lead. Only a wheel.
>

- Moved: party region__s1_shrine → region__s1_green
- By Rule came_here (rule fired): - arrivedAt(party) = 8; - stoodAt(party, region__s1_shrine); + arrivedAt(party) = 9; + stoodAt(party, region__s1_green)
- By Rule lingers (rule fired): - lingered(party) = 1

Offered: Into Porthalen Hall by the avenue up to Porthalen Hall · Read the royal proclamation under the notices · Ask the factor about the king-barrow · and 70 more.

## the churchyard

**26. “To the churchyard”** (rest; go(region__s1_u_yard_gate,region__s1_u_yard)) · consequential 25 · Day 1, 9:34 a.m.

> Old stones lean in the grass. In the corner by the wall, a low stone door goes into the ground.
>

- Learned: region__s1_u_dead_robbed
- Moved: party region__s1_green → region__s1_u_yard
- By Rule came_here (rule fired): - stoodAt(party, region__s1_green); + stoodAt(party, region__s1_u_yard)

Offered: Down to the crypt · To the taproom of the Stone Horn · Wait · and 47 more.

## the crypt

**27. “Down to the crypt”** (primary; go(region__s1_u_crypt_stair,region__s1_u_crypt)) · consequential 26 · Day 1, 9:36 a.m.

> It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.
>
> Need: Dark, a light to hand ·
>
> Provisions: Food for 2 days · Nothing lit · 1 torch, 1 candle to spare. ·
>

- Moved: party region__s1_u_yard → region__s1_u_crypt
- By Rule came_here (rule fired): - stoodAt(party, region__s1_u_yard); + stoodAt(party, region__s1_u_crypt)

Offered: Wenna: light a torch · Wenna: light a candle · Up to the churchyard · and 13 more.

**28. “Wenna: light a torch”** (primary; light_item(region__party_1__torch)) · consequential 27 · Day 1, 9:37 a.m.

> You light a torch.
>
> A vaulted crypt under the churchyard, its shelves of coffins pushed askew. The dust on the floor is scuffed through in a dozen places by feet that dragged.
>
> On the crypt floor is a ring of chalk with marks round it. Inside it, the ends of black candles are burned to the floor.
>

- Learned: region__s1_u_dead_raised
- Went out of them: region__party_1__torch
- By Rule arcology__bronze_ring_set_mirror__allowed (rule fired): - withheld(arcology__bronze_ring_set_mirror)

Offered: Set your shoulder to the stone door until the old lock gives · To the ossuary · Wait · and 15 more.

**29. “Search here”** (rest; search(region__s1_u_crypt)) · consequential 28 · Day 1, 9:57 a.m.

> You search the crypt with care, a little at a time. Nothing is hidden here but what you can already see.
>

- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: To the ossuary · Wait · Light a candle · and 14 more.

## the ossuary

**30. “To the ossuary”** (primary; go(region__s1_u_bone_arch,region__s1_u_ossuary)) · consequential 29 · Day 1, 9:58 a.m.

> Bones are stacked to the roof in patient courses, with skulls in rows along the top like a frieze. There are gaps in the courses where some have lately been taken down.
>
> The man with the black candle is here. ·
>
> You see the black candle. ·
>
> A man in a muddy coat stands up behind a burning black candle, among the bones. ‘Go back up,’ he says. ‘This is not yours.’
>

- Moved: party region__s1_u_crypt → region__s1_u_ossuary
- By Rule came_here (rule fired): - arrivedAt(party) = 9; - stoodAt(party, region__s1_u_crypt); + arrivedAt(party) = 11; + stoodAt(party, region__s1_u_ossuary)
- By Rule lingers (rule fired): - lingered(party) = 2
- By Rule temper_warns (rule fired): + patience(region__s1_u_raiser) = 12; + warned(region__s1_u_raiser, party)

Offered: Ask the man with the black candle to let you by · an even chance · one try · Tell the man with the black candle the town knows what he has done, and that it ends now · an even chance · Attack the man with the black candle · and 18 more.

**31. “Talk to the man with the black candle”** (rest; talk_to(region__s1_u_raiser)) · consequential 30 · Day 1, 9:58 a.m.

> The man with the black candle backs against the wall at the sight of you, a blade up. ‘I want no trouble,’ he says, ‘and I will give it if I have to.’
>
> The man with the black candle will give you a few minutes, no more. ?
>

Offered: Ask the man with the black candle to let you by · an even chance · one try · Tell the man with the black candle the town knows what he has done, and that it ends now · an even chance · Attack the man with the black candle · and 19 more.

**32. “Tell the man with the black candle the town knows what he has done, and that it ends now · an even chance”** (primary; region__s1_u_raiser_talked(party,region__s1_u_ossuary)) · consequential 31 · Day 1, 9:58 a.m.

> He looks at you a long time over the flame, and then at the dead. Then he wets his fingers and pinches the candle out. He goes past you up the stair without a word, and out of Porthalen before morning. The book he leaves on the bones.
>
> His book lies on the bones.
>
> With the candle out, the dead fold down into the bone-heaps like coats let fall, and are only bones again.
>
> In the charnel passage behind the bone-heaps, the dead fall down too.
>
> The black candle is out, and smells of something worse than tallow.
>

- Learned: region__s1_u_book_left
- Aims taken up: region__s1_u_dead_job_owed, region__s1_u_onward_sought
- Aims gone: region__s1_u_dead_job_aim
- By Rule conversation_ends (rule fired): - addressed(region__s1_u_raiser, party)
- By Rule region__s1_u_dead_lie (rule fired): - at(region__s1_u_dead, region__s1_u_ossuary); + region__s1_u_done(region__s1_u_dead_job)
- By Rule region__s1_u_charnel_lie (rule fired): - at(region__s1_u_shamblers, region__s1_u_charnel)
- By Rule temper_let_go (rule fired): - warned(region__s1_u_raiser, party)
- By Rule region__s1_u_candle_pinch__allowed (rule fired): - withheld(region__s1_u_candle_pinch)
- By Rule region__s1_u_dead_onward (rule fired): + region__s1_u_done(region__s1_u_onward)

Offered: To the charnel passage · Wait · Search here · and 14 more.

**33. “Collect a book of the dead for Wenna”** (rest; take_item(region__s1_u_raiser_book,region__member_party_1)) · consequential 32 · Day 1, 9:59 a.m.

> You take a book of the dead.
>

- Came into the company's hands: region__s1_u_raiser_book

Offered: To the charnel passage · Wait · Search here · and 14 more.

**34. {"act":"read_item(region__s1_u_raiser_book)"}** (not in the scene before) · not consequential

Refused: not offered: read_item(region__s1_u_raiser_book)

**35. “look”** (asked; {"look":true}) · not consequential · Day 1, 9:59 a.m.

> Bones are stacked to the roof in patient courses, with skulls in rows along the top like a frieze. There are gaps in the courses where some have lately been taken down.
>
> The black candle is out, and smells of something worse than tallow.
>
> An aim: Find out what has become of Holgar's fuel boat at Reedbridge · follow 1 ·
>
> Provisions: Food for 2 days · Wenna's torch, 40 minutes left · 1 candle to spare. ·
>

Offered: To the charnel passage · Wait · Search here · and 14 more.

**36. “Search here”** (primary; search(region__s1_u_ossuary)) · consequential 33 · Day 1, 10:19 a.m.

> You search the ossuary with care, a little at a time.
>
> Over the oldest niche, behind the bone-heaps, a ring of letters cut small, three of them deeper than the rest.
>

- Learned: region__s1_u_letters
- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2
- By Rule region__s2_s3_way_t_trouble (rule fired): + region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_trouble (rule fired): + region__inTrouble(region__s5_s2_way_t)

Offered: To the charnel passage · Wait · Light a candle · and 13 more.

## the charnel passage

**37. “To the charnel passage”** (primary; go(region__s1_u_charnel_arch,region__s1_u_charnel)) · consequential 34 · Day 1, 10:29 a.m.

> A long low passage lined with shelves of the older dead, wrapped in cloth gone brown. Some of the shelves are empty, and the cloth on the floor under them is torn.
>

- Moved: party region__s1_u_ossuary → region__s1_u_charnel
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 11; - stoodAt(party, region__s1_u_ossuary); + arrivedAt(party) = 14; + stoodAt(party, region__s1_u_charnel)
- By Rule lingers (rule fired): - lingered(party) = 2

Offered: To the undercroft · Wait · Search here · and 14 more.

## the undercroft

**38. “To the undercroft”** (primary; go(region__s1_u_ossuary_steps,region__s1_u_undercroft)) · consequential 35 · Day 1, 10:31 a.m.

> It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.
>
> Wenna’s torch gutters out. ?
>
> Provisions: Food for 2 days · Nothing lit · 1 candle to spare. ·
>

- Moved: party region__s1_u_charnel → region__s1_u_undercroft
- Aims taken up: region__s1_u_floor_sought
- Aims gone: region__s1_u_onward_sought
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 14; - stoodAt(party, region__s1_u_charnel); + arrivedAt(party) = 15; + stoodAt(party, region__s1_u_undercroft)
- By Rule arcology__bronze_ring_set_mirror__withheld (rule fired): + withheld(arcology__bronze_ring_set_mirror)

Offered: Wenna: light a candle · Press the three deep-cut letters on the flag, as the ring below has them · To the old drain · and 16 more.

**39. “Wenna: light a candle”** (primary; light_item(region__party_1__candle)) · consequential 36 · Day 1, 10:32 a.m.

> You light a candle.
>
> A long room of round pillars, older than anything above it. The corn-store, the church and the quarry were all dug down into it from three sides. Those who dug did not know it was here.
>
> One flag in the middle of the floor is cut with a ring of letters nobody here can read. It does not sit quite level with the rest.
>

- Went out of them: region__party_1__candle
- By Rule arcology__bronze_ring_set_mirror__allowed (rule fired): - withheld(arcology__bronze_ring_set_mirror)

Offered: To the old drain · To the old working face · Press the three deep-cut letters on the flag, as the ring below has them · and 16 more.

**40. “Press the three deep-cut letters on the flag, as the ring below has them”** (primary; region__s1_u_flag_pressed(party,region__s1_u_undercroft)) · consequential 37 · Day 1, 10:42 a.m.

> One, then the next, then the last. Each gives a little under your thumb, with a click somewhere under the floor. The flag sinks a finger’s width, and slides aside on its own weight. Under it, a stair goes down into the dark.
>

- Learned: region__s1_u_vault_found
- Aims taken up: region__s1_u_vault_sought
- Aims gone: region__s1_u_floor_sought
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1

Offered: To the sealed vault · To the old drain · Wait · and 15 more.

## the sealed vault

**41. “To the sealed vault”** (primary; go(region__s1_u_vault_stair,region__s1_u_vault)) · consequential 38 · Day 1, 10:44 a.m.

> A small square vault, dry as an oven, smelling of old spice. A stone chair stands at the far end, and niches in the walls once kept something.
>
> A gaunt grey thing that was a man, long-nailed and hollow-cheeked, crouched over bones. ·
>
> You see a cord of old rings and a moonstone the size of a thumb. ·
>
> Something stands up from a stone chair at the far end of the vault. It rises slowly, as if it had been waiting a long time.
>

- Moved: party region__s1_u_undercroft → region__s1_u_vault
- By Rule came_here (rule fired): - arrivedAt(party) = 15; - stoodAt(party, region__s1_u_undercroft); + arrivedAt(party) = 16; + stoodAt(party, region__s1_u_vault)
- By Rule lingers (rule fired): - lingered(party) = 1
- By Rule region__s1_u_vault_reached_achieved (rule fired): + achieved(region__s1_u_vault_reached)
- By Rule temper_warns (rule fired): + patience(region__s1_u_keeper) = 17; + warned(region__s1_u_keeper, party)

Offered: To the undercroft · Attack the keeper of the vault · To the stair below the vault · and 15 more.

**42. “Attack the keeper of the vault”** (primary; attack(region__s1_u_keeper)) · consequential 39 · Day 1, 10:54 a.m.

> The keeper of the vault misses Wenna. ·
>
> The keeper of the vault hits Wenna. ·
>
> Wenna takes 2 slashing damage (12 HP left). ·
>
> Wenna resists (reflex). ·
>
> Wenna fails to resist (fortitude). ·
>
> Wenna cannot move. ·
>
> Wenna cannot act. ·
>
> Wenna takes 6 piercing damage (6 HP left). ·
>
> Wenna resists (bleed). ·
>
> Wenna resists (fortitude). ·
>
> Wenna takes 0 slashing damage (6 HP left). ·
>
> Wenna fails to resist (fortitude). ·
>
> Wenna can move again. ·
>
> Wenna takes 6 piercing damage (0 HP left). ·
>
> Wenna falls. ·
>
> Wenna fails to resist (death). ·
>
> The fight is lost. ·
>
> Need: No light · Wenna: down ·
>

- Aims gone: pans__cold_aim, gate__gate_aim, region__s1_u_vault_sought, region__s1_u_rats_job_sought, region__s1_u_dead_job_owed, region__s1_u_spiders_job_sought, region__s1_rooke_aim_seal
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule arcology__bronze_ring_set_mirror__withheld (rule fired): + withheld(arcology__bronze_ring_set_mirror)

Offered: Begin again in this country, from its first day.

**43. “look”** (asked; {"look":true}) · not consequential · Day 1, 10:54 a.m.

> Need: No light · Wenna: down ·
>
> Provisions: Food for 2 days · Wenna's candle, an hour and 40 minutes left · nothing to spare. ·
>

Offered: Begin again in this country, from its first day.
