# Journey review: --world iscoed --as elf/mage/Ilse/scholar

Recorded live, as it was played, at ef84f0ff3, 2026-11-20T19:27:11.122Z.
The lines: doc/architecture/mission-22/s3-0/mage-lines.txt.
53 lines sent, 45 of them consequential; 54 scenes.

| shown | exact | producer only | unknown |
|---|---|---|---|
| lines | 76 (46%) | 73 (45%) | 15 (9%) |
| words | 2515 (69%) | 961 (27%) | 147 (4%) |
| narration lines | 73 (75%) | 9 (9%) | 15 (15%) |
| narration words | 2355 (87%) | 217 (8%) | 147 (5%) |
| choices offered | 2406 (84%) | 385 (13%) | 66 (2%) |

- unknown, 6 lines (61 words): no producer of this step made it
- unknown, 7 lines (51 words): an event line no producer of this step made whole
- unknown, 2 lines (35 words): made more than one way by its step's producers

Each told line is quoted as shown. Marks after a line: · its maker is known only by what produced it (the engine, or the person or thing it is of); ? its maker is unknown. A line with no mark is known exactly: `bin/kyrie review step <dir> <n>` names it.

## the gate-yard of Gatesend

**The opening**

> Your aunt's weir
>
> ‘You’ll be Tegwen’s,’ says the woman at the next door, and looks you over. ‘Nest. I kept her weir going since the burying. The traps want lifting every morning or the eels rot in them.’ She nods up at the gatehouse. ‘And the gate’s not shut since the new moon. Spring tide’s in six days. When the sea comes over, there’s no weir, and no Gatesend either.’
>
> Your aunt Tegwen is a month buried, and her eel-weir is yours: her lease came to you from the reeve’s clerk, folded small. Her door in Gatesend has a wreath of dried rushes on it, and her nets are still on the fence. Below the last houses the fen goes away green and flat. Above the hamlet, where the river meets the sea-bank, stands a squat stone gatehouse. From under it comes a sound you do not remember from when you were a child. It is the sea, running in.
>
> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door. The brothers’ house stands at the back of it behind a low wall, and the village crowds round the front.
>
> Wat the collier is knocking dried clay from a pick, a careful blow at a time.
>
> An aim: Find out why the sea-gate at Gatesend will not shut · follow 1 ·
>

Offered: Find out why the sea-gate · Talk to the runaway acolyte — ask the acolyte where he is going · Read the notice on the well-post · Ask Gek what the old workings are worth · and 68 more.

**1. “Read the notice on the well-post”** (primary; region__s4_u_notice_read(party,region__s4_green)) · consequential 1 · Day 1, 8:10 a.m.

> A notice on the post by the well, in three hands. ‘RATS in the old corn-store, a nest of them. Ten coin, and a lantern. Ask Gek at the gate-yard of Gatesend for the key.’ ‘Whoever will go down into the catacombs under the churchyard, where something has come up: fifteen coin, and the shrine’s thanks. Ask Qeq at the chapel of the brothers’ house.’ ‘SPIDERS in the old quarry. Twelve coin from the house. Ask Dreg at the guest-hall of Gatesend for the gate key.’
>
> Above the roofs, to the east, two columns of smoke stand on the ridge: one thick and black from the digging, one thin and white from the old woman’s fire.
>

- Learned: howe__ridge_told, region__s4_u_notice, region__s4_why
- Time: 1 watch
- By Rule howe__last_fate_broken (rule fired): - at(howe__last, howe__behind); - state(howe__lastseal, howe__set); + howe__last_fate_applied(); + state(howe__lastseal, howe__broken)
- By Rule region__s3_dear (rule fired): - goodsPrice(region__s3_innkeeper, rations) = 2; + goodsPrice(region__s3_innkeeper, rations) = 3
- By Rule region__s4_dear (rule fired): - goodsPrice(region__s4_innkeeper, rations) = 3; + goodsPrice(region__s4_innkeeper, rations) = 4
- By Rule howe__seal_known_broken (rule fired): - state(howe__seal, howe__set); + howe__seal_fate_applied(); + state(howe__seal, howe__forced)
- By Rule tower__well_floods (rule fired): - state(tower__well_water, tower__dry); + state(tower__well_water, tower__flooded)
- By Rule factors__abroad_noted (rule fired): + factors__seenAbroad(factors__principal) = 2
- By Rule temper_greets (rule fired): + greeted(region__s4_cat, party); + greeted(region__s4_inndog, party); + tolerates(region__s4_cat, party); + tolerates(region__s4_inndog, party)
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule stood_first (rule fired): + stoodAt(party, region__s4_green)

Offered: Find out why the sea-gate · Talk to the runaway acolyte — ask the acolyte where he is going · Ask Gek what the old workings are worth · To the old corn-store — look at the corn-store padlock · and 67 more.

**2. “Read Tegwen's lease”** (rest; read_item(origin__lease_scroll)) · consequential 2 · Day 1, 8:12 a.m.

> The weir at Gatesend is yours on the reeve’s lease. Five coin is owed to the reeve of Porthalen at the quarter-day, a month off.
>

- Learned: origin__lease

Offered: Find out why the sea-gate · Talk to the runaway acolyte — ask the acolyte where he is going · Ask Gek what the old workings are worth · To the old corn-store — look at the corn-store padlock · and 66 more.

**3. “follow gate__gate_aim”** (asked; {"follow":"gate__gate_aim"}) · not consequential · Day 1, 8:12 a.m.

> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door. The brothers’ house stands at the back of it behind a low wall, and the village crowds round the front. Beyond the roofs lies the Starmere. The fells rise steeply behind the last houses. Twice this month the Hall’s keeper has driven the town’s pigs off the verge of the old road.
>
> A notice is nailed to the clerk’s own trestle, under the shire-reeve’s mark: THE TALLY OF IRON AND GOLD IS TO BE MADE UP BY MIDWINTER. FOR THE WEIGHT OF IRON AND GOLD WANTING, SEE THE CLERK.
>
> ‘You’ll be Tegwen’s,’ says the woman at the next door, and looks you over. ‘Nest. I kept her weir going since the burying. The traps want lifting every morning or the eels rot in them.’ She nods up at the gatehouse. ‘And the gate’s not shut since the new moon. Spring tide’s in six days. When the sea comes over, there’s no weir, and no Gatesend either.’
>
> Above the roofs, to the east, two columns of smoke stand on the ridge: one thick and black from the digging, one thin and white from the old woman’s fire.
>
> Wat the collier is knocking dried clay from a pick, a careful blow at a time.
>
> The brothers’ dog lies across the doorstep of the guest-hall with his chin on his paws, and watches who comes.
>
> A thin brown cat crouches at the foot of a wall, watching a hole in it without a blink.
>
> Gek, a herb-wife, selling from the house door, is here. The runaway acolyte, an acolyte run from a shrine two valleys over, still in his grey habit, counting the coppers in his palm, is here. Aldous Fenn, the reeve of the wood-wardens, who license the cutting in the woods round Gatesend, is here. So are a drover’s boy, Ifan Rhys, Simkin and Nest. ·
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>
> Provisions: Food for 2 days. ·
>

Offered: To the sea-bank at Gatesend (led) · Talk to the runaway acolyte — ask the acolyte where he is going · Ask Gek what the old workings are worth · To the old corn-store — look at the corn-store padlock · and 65 more.

## the sea-bank at Gatesend

**4. “To the sea-bank at Gatesend”** (led; go(gate__bank_path,gate__bank)) · consequential 3 · Day 1, 8:22 a.m.

> The sea-bank runs straight as a rule between the grey water and the green fen, a man’s height above both.
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>

- Moved: party region__s4_green → gate__bank
- Time: 1 watch
- By Rule lingers (rule fired): - lingered(party) = 1
- By Rule came_here (rule fired): - stoodAt(party, region__s4_green); + arrivedAt(party) = 2; + stoodAt(party, gate__bank)
- By Rule career__passed_by (rule fired): + career__passed(party)

Offered: To the Wardens' gatehouse (led) · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the churchyard · and 23 more.

## the Wardens' gatehouse

**5. “To the Wardens' gatehouse”** (led; go(gate__gate_door,gate__gatehouse)) · consequential 4 · Day 1, 8:23 a.m.

> Inside, a windlass of black oak as thick as a man fills the room, its drum wound with chain that goes down through a slot in the floor. A ratchet ring of bronze is set round its axle, and beside it an empty socket.
>
> Following: Find out why the sea-gate at Gatesend will not shut, before the spring tide. ·
>

- Moved: party gate__bank → gate__gatehouse
- By Rule came_here (rule fired): - stoodAt(party, gate__bank); + stoodAt(party, gate__gatehouse)

Offered: Search here · and 23 more.

**6. “Search here”** (primary; search(gate__gatehouse)) · consequential 5 · Day 1, 8:43 a.m.

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

Offered: To the gate-well, under the gatehouse (led) · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the churchyard · and 19 more.

## the gate-well, under the gatehouse

**7. “To the gate-well, under the gatehouse”** (led; go(gate__well_ladder,gate__well)) · consequential 6 · Day 1, 8:45 a.m.

> It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.
>
> Following: Find the sea-gate's lost pawl: something heavy went down the gate-well under the gatehouse. ·
>
> Need: Dark, a light to hand ·
>
> Provisions: Food for 2 days · Nothing lit · 1 candle to spare. ·
>

- Moved: party gate__gatehouse → gate__well
- By Rule came_here (rule fired): - arrivedAt(party) = 2; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 4; + stoodAt(party, gate__well)
- By Rule lingers (rule fired): - lingered(party) = 2

Offered: Ilse: light a candle · Ilse: cast Light · and 27 more.

**8. “Ilse: cast Light”** (primary; field_spell(region__member_party_1,conjure_light,region__member_party_1)) · consequential 7 · Day 1, 8:47 a.m.

> Ilse uses Light on Ilse.
>
> A small steady light kindles over Ilse’s shoulder. ?
>
> The iron rungs end in silt. Water stands knee-deep, cold and moving, and the gate’s great chain goes down past you into the dark to the sluice below.
>

- By Rule arcology__bronze_ring_set_mirror__allowed (rule fired): - withheld(arcology__bronze_ring_set_mirror)

Offered: Search here · and 29 more.

**9. “Search here”** (primary; search(gate__well)) · consequential 8 · Day 1, 9:07 a.m.

> With care, a little at a time, you search the gate-well, under the gatehouse.
>
> Your foot finds it before your hands do: under the silt, a curved bar of iron as long as your forearm, bronze-shod, the wardens’ wave cut in its face.
>
> Following: Bring the sea-gate's pawl up out of the gate-well. ·
>

- Learned: gate__pawl_found
- Moved: region__s1_s5_way_t region__s1_taproom → region__s1_s5_way; region__s2_s3_way_t region__s2_taproom → region__s2_s3_way; region__s2_s4_way_t region__s2_taproom → region__s2_s4_way; region__s4_s3_way_t region__s4_taproom → region__s4_s3_way; region__s5_s2_way_t region__s5_taproom → region__s5_s2_way
- Aims taken up: gate__gate_take
- Aims gone: gate__gate_pawl
- Time: 2 watches
- By Rule region__s1_s5_way_t_out (rule fired): - at(region__s1_s5_way_t, region__s1_taproom); + at(region__s1_s5_way_t, region__s1_s5_way)
- By Rule region__s2_s3_way_t_out (rule fired): - at(region__s2_s3_way_t, region__s2_taproom); + at(region__s2_s3_way_t, region__s2_s3_way)
- By Rule region__s2_s4_way_t_out (rule fired): - at(region__s2_s4_way_t, region__s2_taproom); + at(region__s2_s4_way_t, region__s2_s4_way)
- By Rule region__s4_s3_way_t_out (rule fired): - at(region__s4_s3_way_t, region__s4_taproom); + at(region__s4_s3_way_t, region__s4_s3_way)
- By Rule region__s5_s2_way_t_out (rule fired): - at(region__s5_s2_way_t, region__s5_taproom); + at(region__s5_s2_way_t, region__s5_s2_way)
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: Collect the sea-gate's pawl for Ilse · To the sluice gallery · To the guest-hall of Gatesend · and 27 more.

**10. “Collect the sea-gate's pawl for Ilse”** (primary; take_item(gate__pawl,region__member_party_1)) · consequential 9 · Day 1, 9:08 a.m.

> You take the sea-gate’s pawl.
>
> Following: Take the pawl to the windlass at Gatesend, and wind the sea-gate shut. ·
>

- Came into the company's hands: gate__pawl
- Aims taken up: gate__gate_wind
- Aims gone: gate__gate_take

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · To the guest-hall of Gatesend · To the chapel of the brothers' house · and 26 more.

## the Wardens' gatehouse

**11. “To the Wardens' gatehouse”** (led; go(gate__well_ladder,gate__gatehouse)) · consequential 10 · Day 1, 9:10 a.m.

> Inside, a windlass of black oak as thick as a man fills the room, its drum wound with chain that goes down through a slot in the floor.
>
> Turning the pawl over in the light at the door, you see that the stub of its pin is bright and square: sawn through, not worn.
>

- Learned: gate__cut
- Moved: party gate__well → gate__gatehouse
- Aims taken up: gate__gate_cutter
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 4; - stoodAt(party, gate__well); + arrivedAt(party) = 7; + stoodAt(party, gate__gatehouse)
- By Rule lingers (rule fired): - lingered(party) = 2
- By Rule gate__m_cut_achieved (rule fired): + achieved(gate__m_cut)

Offered: Set the pawl in its socket and wind the sea-gate shut · unlikely · To the sluice gallery · and 24 more.

## the gate-yard of Gatesend

**12. “To the gate-yard of Gatesend”** (rest; travel:region__s4_green) · consequential 11 · Day 1, 9:21 a.m.

> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door.
>

- Moved: party gate__gatehouse → region__s4_green
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 7; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 8; + stoodAt(party, region__s4_green)

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Talk to the runaway acolyte — ask the acolyte where he is going · Read the royal proclamation under the notices · and 70 more.

**13. “Talk to Wat”** (rest; talk_to(region__s4_r4)) · consequential 12 · Day 1, 9:21 a.m.

> ‘If it’s trouble,’ says Wat, ‘I have enough of my own.’
>

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Ask Wat about his work · Talk to the runaway acolyte — ask the acolyte where he is going · and 71 more.

**14. “Talk to Nest”** (rest; talk_to(origin__nest)) · consequential 13 · Day 1, 9:21 a.m.

> ‘Let me guess,’ says Nest. ‘You want something.’
>

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Ask Nest about Tegwen's weir · Talk to the runaway acolyte — ask the acolyte where he is going · and 73 more.

**15. “Talk to Aldous Fenn”** (rest; talk_to(region__s4_reeve)) · consequential 14 · Day 1, 9:21 a.m.

> Aldous Fenn looks you over, from your boots up. ‘You’ll be walking out to the Hall, I suppose. Everyone with boots does.’
>

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Ask Aldous Fenn about the chain at the Hall · Talk to the runaway acolyte — ask the acolyte where he is going · and 73 more.

**16. “Ask Aldous Fenn about the chain at the Hall”** (primary; region__s4_reeve_chain) · consequential 15 · Day 1, 9:21 a.m.

> ‘The chain across the old road at the Hall’s end,’ says Aldous Fenn, ‘was put up six years ago, when the family stopped coming. The steward says the road-wood is the Hall’s and always was. The wardens have cut there since before there was a Hall. My father swore to it.’ He studies his boots. ‘My father was put out of that house for saying so, and the family never paid his last quarter. I am not asking you to be unfair. I am asking you to find the paper. There is one. There is always one.’
>

- Aims taken up: region__s4_roadwood_aim_read

Offered: To the Wardens' gatehouse (led) · Into Gatesend Hall by the avenue up to Gatesend Hall · Talk to the runaway acolyte — ask the acolyte where he is going · Read the royal proclamation under the notices · and 72 more.

## the Wardens' gatehouse

**17. “To the Wardens' gatehouse”** (led; travel:gate__gatehouse) · consequential 16 · Day 1, 9:32 a.m.

> Inside, a windlass of black oak as thick as a man fills the room, its drum wound with chain that goes down through a slot in the floor.
>

- Moved: party region__s4_green → gate__gatehouse
- Time: 1 watch
- By Rule conversation_ends (rule fired): - addressed(origin__nest, party); - addressed(region__s4_r4, party); - addressed(region__s4_reeve, party)
- By Rule came_here (rule fired): - arrivedAt(party) = 8; - stoodAt(party, region__s4_green); + arrivedAt(party) = 9; + stoodAt(party, gate__gatehouse)

Offered: Set the pawl in its socket and wind the sea-gate shut · unlikely · To the sluice gallery · and 24 more.

**18. “Set the pawl in its socket and wind the sea-gate shut · unlikely”** (primary; gate__wind_gate(party,gate__gatehouse)) · consequential 17 · Day 1, 10:32 a.m.

> The drum will not come round. You hang on the bar until your arms shake and the chain slips back a link at a time. It wants more weight than yours, or a fresh try.
>

- Time: 6 watches
- By Rule lingers (rule fired): + lingered(party) = 6
- By Rule region__s2_s3_way_t_trouble (rule fired): + region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_trouble (rule fired): + region__inTrouble(region__s5_s2_way_t)

Offered: To the sluice gallery · To the guest-hall of Gatesend · To the chapel of the brothers' house · To the churchyard · and 23 more.

## the guest-hall of Gatesend

**19. “To the guest-hall of Gatesend”** (primary; travel:region__s4_taproom) · consequential 18 · Day 1, 10:44 a.m.

> Plain benches stand round a scrubbed table and a fire of small logs. On the whitewash above the hearth the rule of the house is written out in a careful hand, and its first line says that no one is turned away.
>
> ‘Gesk there is looking for work,’ says Dreg. ‘Would go anywhere with anyone, for a few coins and their keep.’
>
> The light over Ilse’s shoulder fades. ?
>
> Following: Take the pawl to the windlass at Gatesend, and wind the sea-gate shut. ·
>

- Learned: region__w13_named
- Moved: party gate__gatehouse → region__s4_taproom
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 9; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 16; + stoodAt(party, region__s4_taproom)
- By Rule lingers (rule fired): - lingered(party) = 6
- By Rule arcology__bronze_ring_set_mirror__withheld (rule fired): + withheld(arcology__bronze_ring_set_mirror)

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Talk to Gesk — ask whether he would come along · Talk to Dreg — ask about the forty crowns in Merrowdale · and 31 more.

**20. “Talk to Gesk — ask whether he would come along”** (primary; region__s4_traveller_brings) · consequential 19 · Day 1, 10:44 a.m.

> ‘I walk from shrine to shrine. The gods have not said where to stop.’ Gesk looks you over. ‘If you are going anywhere, I would come along. 6 coin, and my keep.’
>
> Gesk would join the company: a lizardfolk warrior of level 1, asking 6 coin. Can defend, guard, taunt, steel yourself, cleave, prepare charge, charge, set spear, second wind, sweeping strike. ·
>

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Ask Gesk to join the company · Talk to Dreg — ask about the forty crowns in Merrowdale · and 31 more.

**21. “Ask Gesk to join the company”** (primary; recruit(region__s4_traveller)) · consequential 20 · Day 1, 10:49 a.m.

> Gesk weighs the coin in one hand, then nods. ‘For that, I’ll go as far as you like. Within reason.’
>

Offered: To the Wardens' gatehouse (led) · To the sluice gallery · Talk to Dreg — ask about the forty crowns in Merrowdale · Read a notice from Merrowdale · and 52 more.

## the Wardens' gatehouse

**22. “To the Wardens' gatehouse”** (led; travel:gate__gatehouse) · consequential 21 · Day 1, 11:01 a.m.

> Inside, a windlass of black oak as thick as a man fills the room, its drum wound with chain that goes down through a slot in the floor.
>

- Moved: party region__s4_taproom → gate__gatehouse
- Time: 2 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 16; - stoodAt(party, region__s4_taproom); + arrivedAt(party) = 18; + stoodAt(party, gate__gatehouse)
- By Rule arcology__bronze_ring_set_noon__allowed (rule fired): - withheld(arcology__bronze_ring_set_noon)

Offered: Set the pawl in its socket and wind the sea-gate shut · an even chance · To the sluice gallery · and 43 more.

**23. “Set the pawl in its socket and wind the sea-gate shut · an even chance”** (primary; gate__wind_gate(party,gate__gatehouse)) · consequential 22 · Day 1, 12:01 p.m.

> The drum will not come round, though every one of you is on the bars. You hang there until your arms shake, and the chain slips back a link at a time. It wants more weight than you have between you, or a fresh try.
>

- Time: 6 watches
- By Rule lingers (rule fired): + lingered(party) = 6

Offered: To the sluice gallery · To the chapel of the brothers' house · To the churchyard · To the drill-yard behind the Golden Horse · and 41 more.

**24. “Set the pawl in its socket and wind the sea-gate shut · an even chance”** (rest; gate__wind_gate(party,gate__gatehouse)) · consequential 23 · Day 1, 1:01 p.m.

> The pawl drops into its socket with a sound like a bell. Then the long work: the windlass bars, a turn and a rest and a turn, the chain coming up wet out of the slot link by link, the pawl clacking over the ratchet. Below, at last, something enormous seats itself in stone, and the mill-race sound stops.
>
> Below the gatehouse a flat-bottomed boat noses up the sluice-cut against the shut gate, low in the water with sacks, and Ifan Rhys at the pole. He looks up at you through the slot in the floor and does not call out.
>
> Ilse and Gesk each gain 200 experience: shut the last of the Water-Wardens’ sea-gates. ?
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
- Aims taken up: gate__gate_claim
- Aims gone: gate__gate_wind
- Time: 6 watches
- By Rule gate__boat_comes (rule fired): - at(gate__ifan, region__s4_green); + at(gate__ifan, gate__gatehouse); + at(gate__ifanboat, gate__gatehouse); + gate__boatCome(party)
- By Rule lingers (rule fired): - lingered(party) = 6; + lingered(party) = 12
- By Rule gate__m_mended_achieved (rule fired): + achieved(gate__m_mended)
- By Rule gate__word_old (rule fired): + stale(gate__failing)

Withdrawn: Give the sea-gate's pawl to Gesk · Set down the sea-gate's pawl.
Offered: To the sea-bank at Gatesend · To the sluice gallery · Ifan Rhys's boat · and 42 more.

## the gate-yard of Gatesend

**25. “To the gate-yard of Gatesend”** (rest; travel:region__s4_green) · consequential 24 · Day 1, 1:12 p.m.

> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door.
>
> Every weir below the sea-bank has a trap set in it, and the water through them runs the right way: out.
>
> Doors are open all along the lane. Someone has chalked a wave inside a ring on the well-post, and an old man you have never met takes your hand in both of his and says nothing at all.
>

- Moved: party gate__gatehouse → region__s4_green
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 18; - stoodAt(party, gate__gatehouse); + arrivedAt(party) = 31; + stoodAt(party, region__s4_green)
- By Rule lingers (rule fired): - lingered(party) = 12
- By Rule gate__hamlet_thanks (rule fired): + gate__thanked(party)

Offered: Set out for Porthalen (led) · To the sluice gallery · Talk to the runaway acolyte — ask the acolyte where he is going · Read the royal proclamation under the notices · and 86 more.

**26. “Talk to Nest”** (rest; talk_to(origin__nest)) · consequential 25 · Day 1, 1:12 p.m.

> ‘Still here,’ says Nest. ‘I suppose that’s something.’
>

Offered: Set out for Porthalen (led) · To the sluice gallery · Ask Nest about Tegwen's weir · Talk to the runaway acolyte — ask the acolyte where he is going · and 89 more.

**27. {"act":"region__s4_u_rats_job_ask"}** (not in the scene before) · consequential 26 · Day 1, 1:12 p.m.

> ‘They’ve got into the old corn-store from underneath,’ says Gek. ‘Rats, a couple of them at the least, and bold with it. I’ve lost a third of the grain.’ A key comes off a nail behind the counter. ‘There’s a trapdoor in the floor. Kill them, and find where they’re getting in, or they’ll be back by harvest. Ten coin, and I’ll see you right for a lantern besides.’ And, looking you over: ‘Or lay ratsbane where they come up, if you’d sooner not be bitten. It wants a night.’
>
> Ilse takes the corn-store key. ?
>

- Learned: region__s4_u_rats_job
- Came into the company's hands: corn_store_key_given1
- Aims taken up: region__s4_u_rats_job_aim

Withdrawn: Wrench the padlock's hasp out of the old door.
Offered: Set out for Porthalen (led) · To the old corn-store · Ask Gek what the old workings are worth · Talk to the runaway acolyte — ask the acolyte where he is going · and 93 more.

**28. {"act":"talk:region__s4_merchant"}** (not in the scene before) · not consequential · Day 1, 1:12 p.m.

> Gek, herb-wife, selling from the house door ?
>

Offered: Ask Gek about the old well behind a lone tower, where the green light burns · Ask Gek about the clerk's call for iron and gold, and the king's torc · Ask Gek about the coin on the cord round their neck · Haggle with Gek over the price of ration · unlikely · one try · and 93 more.

**29. “Ask Gek about the coin on the cord round their neck”** (primary; region__s4_th_coin_ask) · consequential 27 · Day 1, 1:12 p.m.

> ‘This?’ says Gek. ‘A traveller left it for a night’s lodging in the year of the hard winter. It is Imperial. The wheel with a wing; the Posts. I have shown it to two scholars. The first said it was a forgery because it is too bright. The second said it could not be, because whoever forged it knew a regnal year no forger would know.’ They turn it in the light. ‘It buys a loaf. I have never spent it.’
>

- Learned: region__s4_th_coin

Offered: Set out for Porthalen (led) · To the sluice gallery · Ask Gek what the old workings are worth · Talk to the runaway acolyte — ask the acolyte where he is going · and 92 more.

## the old corn-store

**30. “To the old corn-store”** (rest; go(region__s4_u_store_door,region__s4_u_store)) · consequential 28 · Day 1, 1:13 p.m.

> Sacks are stacked to the rafters, and the place smells of mice. A sack of grain weighs down a trapdoor in the floor, and every wall is gnawed through at its foot.
>

- Moved: party region__s4_green → region__s4_u_store
- By Rule conversation_ends (rule fired): - addressed(origin__nest, party)
- By Rule came_here (rule fired): - stoodAt(party, region__s4_green); + stoodAt(party, region__s4_u_store)

Offered: To the gate-yard of Gatesend · Down to the corn-store cellar · To the sluice gallery · To the gate-yard of Gatesend — look at the corn-store padlock · and 46 more.

**31. “follow region__s4_u_rats_job_aim”** (asked; {"follow":"region__s4_u_rats_job_aim"}) · not consequential · Day 1, 1:13 p.m.

> Sacks are stacked to the rafters, and the place smells of mice. A sack of grain weighs down a trapdoor in the floor, and every wall is gnawed through at its foot.
>
> Following: Clear the rats out of the corn-store cellar, under the old corn-store at Gatesend, and find where they get in. ·
>
> Provisions: Food for 2 days. ·
>

Offered: Down to the corn-store cellar (led) · To the sluice gallery · To the chapel of the brothers' house · To the churchyard · and 46 more.

**32. “Search here”** (rest; search(region__s4_u_store)) · consequential 29 · Day 1, 1:33 p.m.

> With care, a little at a time, you search the old corn-store. Nothing is hidden here but what you can already see.
>

- Time: 2 watches
- By Rule lingers (rule fired): + lingered(party) = 2

Offered: Down to the corn-store cellar (led) · To the sluice gallery · To the chapel of the brothers' house · To the churchyard · and 45 more.

**33. “Have Ilse prepare Siphon Life in place of Second Sight, in a first-level slot”** (rest; prepare_spell(region__member_party_1,siphon_life,second_sight,circle_1)) · consequential 30 · Day 1, 2:33 p.m.

> Ilse spends an hour over Siphon Life.
>
> Ilse: Siphon Life is ready. ?
>

- Time: 6 watches
- By Rule lingers (rule fired): - lingered(party) = 2; + lingered(party) = 8
- By Rule arcology__bronze_ring_set_noon__withheld (rule fired): + withheld(arcology__bronze_ring_set_noon)

Withdrawn: Have Ilse prepare Charm Person in place of Second Sight, in a first-level slot · Have Ilse prepare Light in place of Second Sight, in a first-level slot.
Offered: Down to the corn-store cellar (led) · To the sluice gallery · To the chapel of the brothers' house · To the churchyard · and 45 more.

## the corn-store cellar

**34. “Down to the corn-store cellar”** (led; go(region__s4_u_trap,region__s4_u_cellar)) · consequential 31 · Day 1, 2:35 p.m.

> It is pitch dark. Without a light you can see nothing here, and do nothing that needs seeing.
>
> Following: Clear the rats out of the corn-store cellar, under the old corn-store at Gatesend, and find where they get in. ·
>
> Provisions: Food for 2 days · Nothing lit · 1 torch, 2 candles to spare. ·
>

- Moved: party region__s4_u_store → region__s4_u_cellar
- By Rule came_here (rule fired): - arrivedAt(party) = 31; - stoodAt(party, region__s4_u_store); + arrivedAt(party) = 39; + stoodAt(party, region__s4_u_cellar)
- By Rule lingers (rule fired): - lingered(party) = 8

Offered: Ilse: light a candle · Gesk: light a torch · Ilse: cast Light · To the rat-runs · and 35 more.

**35. “Gesk: light a torch”** (primary; light_item(region__s4_traveller_person__torch)) · consequential 32 · Day 1, 2:36 p.m.

> Gesk lights a torch.
>
> A low brick cellar under the corn-store, damp to the touch. Spilled grain is trodden black on the floor, among the droppings of something bigger than mice.
>

- Went out of them: region__s4_traveller_person__torch
- By Rule arcology__bronze_ring_set_mirror__allowed (rule fired): - withheld(arcology__bronze_ring_set_mirror)

Withdrawn: Give a torch to Ilse · Set down a torch.
Offered: To the rat-runs · Up to the old corn-store · and 36 more.

## the rat-runs

**36. “To the rat-runs”** (primary; go(region__s4_u_runs,region__s4_u_warren)) · consequential 33 · Day 1, 2:46 p.m.

> A crawlway of earth and old brick runs behind the cellar wall, gnawed wider than any rat should need. It is littered with husks and bones, and stinks of a nest.
>
> The rats under the corn-store are here, each a brown rat of the barns, long-tailed and sharp-faced, with bright black eyes and yellow teeth. ·
>
> They stand their ground and watch you. They will not have you here for long. ?
>
> Following: Clear the rats out of the corn-store cellar, under the old corn-store at Gatesend, and find where they get in. ·
>

- Learned: region__s4_u_rats_source
- Moved: party region__s4_u_cellar → region__s4_u_warren
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 39; - stoodAt(party, region__s4_u_cellar); + arrivedAt(party) = 40; + stoodAt(party, region__s4_u_warren)
- By Rule temper_warns (rule fired): + patience(region__s4_u_rats) = 41; + warned(region__s4_u_rats, party)

Offered: Attack the rats under the corn-store · To the corn-store cellar · and 41 more.

**37. “Attack the rats under the corn-store”** (primary; attack(region__s4_u_rats)) · consequential 34 · Day 1, 2:46 p.m.


- Aims gone: region__s4_u_rats_job_aim, gate__gate_claim, gate__gate_cutter, region__s4_roadwood_aim_read

Withdrawn: To the corn-store cellar · Search here · Have Ilse use Light on Ilse · Have Ilse use Light on Gesk · Down to the nest · Risk the air in the culvert on the way to the old drain; Ilse goes first · it would hurt badly · Risk the air in the culvert on the way to the old drain; Gesk goes first · it would hurt a little · Prop the trapdoor open above and let the air down the culvert · Prod the air in the culvert with the pole · Have Ilse prepare Charm Person in place of Siphon Life, in a first-level slot · Have Ilse prepare Second Sight in place of Siphon Life, in a first-level slot · Have Ilse prepare Light in place of Siphon Life, in a first-level slot · Have Ilse prepare Charm Person in place of Light, in a first-level slot · ready after the next rest · Have Ilse prepare Second Sight in place of Light, in a first-level slot · ready after the next rest · Have Ilse prepare Siphon Life in place of Light, in a first-level slot · ready after the next rest · Wait a while · Wait an hour · Wait until dark · Wait and watch, until something changes · Put out Gesk's light for good · Light a candle · Give a staff to Gesk · Give clothing to Gesk · Give a spellbook to Gesk · Give a candle to Gesk · Give a battleaxe to Ilse · Give ring mail to Ilse · Give a ten-foot pole to Ilse · Give a candle to Ilse · Give Tegwen's lease to Gesk · Give the corn-store key to Gesk · Set down a staff · Set down clothing · Set down a spellbook · Set down a candle · Set down a battleaxe · Set down ring mail · Set down a ten-foot pole · Set down Tegwen's lease · Set down the corn-store key.
Offered: Melee Attack at Rat 1 · Flee · Light at Gesk · Let Ilse fight this turn · Melee Attack at Rat 2 · Defend · Wait · Second Sight at Ilse · Second Sight at Gesk · Siphon Life at Rat 1 · Siphon Life at Rat 2 · Light at Ilse.

**38. “Siphon Life at Rat 1”** (rest; fight:siphon_life:region__s4_u_rats_person) · not consequential · Day 1, 2:46 p.m.

> Ilse 4/4 · Gesk 17/17 | against you: Rat 1 0/1 · Rat 2 1/1 ·
>

Offered: Melee Attack at Rat 2 · Flee · Guard at Gesk · Let Gesk fight this turn · Cleave at Rat 2 · Defend · Prepare Charge · Second Wind · Sweeping Strike at Rat 2 · Taunt at Rat 2 · Steel Yourself · Wait · Guard at Ilse.

**39. “Melee Attack at Rat 2”** (fight; fight:melee:region__s4_u_rats_person_2) · consequential 35 · Day 1, 2:56 p.m.

> Gesk hits Rat 2 with the battleaxe, for 6. Rat 2 falls. Gesk sneers: ‘Pathetic.’ ·
>
> The fight is won. ·
>
> Following: Clear the nest down the rats' run from the rat-runs under the old corn-store. Deal with the old buck rat that keeps it, or they will be back. ·
>

- Aims taken up: region__s4_u_rats_job_run, gate__gate_claim, gate__gate_cutter, region__s4_roadwood_aim_read
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule region__s4_u_rats_cleared (rule fired): + region__s4_u_done(region__s4_u_rats_job)

Offered: Down to the nest (led) · Prop the trapdoor open above and let the air down the culvert · Prod the air in the culvert with the pole · Down to the old drain — risk the air in the culvert · and 37 more.

## the nest

**40. “Down to the nest”** (led; go(region__s4_u_nest_way,region__s4_u_nest)) · consequential 36 · Day 1, 3:06 p.m.

> A dry shelf above the drain water, heaped with chewed sacking, straw and grain-husks over bones. The stink is enough to make the eyes run.
>
> A brown rat of the barns, long-tailed and sharp-faced, with bright black eyes and yellow teeth. ·
>
> The old buck rat stands its ground and watches you. It will not have you here for long. ?
>
> Following: Clear the nest down the rats' run from the rat-runs under the old corn-store. Deal with the old buck rat that keeps it, or they will be back. ·
>

- Moved: party region__s4_u_warren → region__s4_u_nest; region__s1_s5_way_t region__s1_s5_way → region__s5_taproom; region__s2_s4_way_t region__s2_s4_way → region__s4_taproom; region__s4_s3_way_t region__s4_s3_way → region__s3_taproom
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 40; - stoodAt(party, region__s4_u_warren); + arrivedAt(party) = 42; + stoodAt(party, region__s4_u_nest)
- By Rule region__s1_s5_way_t_in0 (rule fired): - at(region__s1_s5_way_t, region__s1_s5_way); - region__journeysTo(region__s1_s5_way_t, region__s5_green); + at(region__s1_s5_way_t, region__s5_taproom); + region__journeysTo(region__s1_s5_way_t, region__s1_green)
- By Rule region__s2_s4_way_t_in0 (rule fired): - at(region__s2_s4_way_t, region__s2_s4_way); - region__journeysTo(region__s2_s4_way_t, region__s4_green); + at(region__s2_s4_way_t, region__s4_taproom); + region__journeysTo(region__s2_s4_way_t, region__s2_green)
- By Rule region__s4_s3_way_t_in0 (rule fired): - at(region__s4_s3_way_t, region__s4_s3_way); - region__journeysTo(region__s4_s3_way_t, region__s3_green); + at(region__s4_s3_way_t, region__s3_taproom); + region__journeysTo(region__s4_s3_way_t, region__s4_green)
- By Rule lingers (rule fired): - lingered(party) = 1
- By Rule temper_let_go (rule fired): - warned(region__s4_u_rats, party)
- By Rule temper_warns (rule fired): + patience(region__s4_u_buck) = 43; + warned(region__s4_u_buck, party)

Offered: Attack the old buck rat · Up to the rat-runs · and 35 more.

**41. “Attack the old buck rat”** (primary; attack(region__s4_u_buck)) · consequential 37 · Day 1, 3:06 p.m.


- Aims gone: region__s4_u_rats_job_run, gate__gate_claim, gate__gate_cutter, region__s4_roadwood_aim_read

Withdrawn: Up to the rat-runs · Search here · To the old drain · Have Ilse prepare Charm Person in place of Siphon Life, in a first-level slot · ready after the next rest · Have Ilse prepare Second Sight in place of Siphon Life, in a first-level slot · ready after the next rest · Have Ilse prepare Light in place of Siphon Life, in a first-level slot · ready after the next rest · Have Ilse prepare Charm Person in place of Light, in a first-level slot · ready after the next rest · Have Ilse prepare Second Sight in place of Light, in a first-level slot · ready after the next rest · Have Ilse prepare Siphon Life in place of Light, in a first-level slot · ready after the next rest · Wait a while · Wait an hour · Wait until dark · Wait and watch, until something changes · Put out Gesk's light for good · Light a candle · Give a staff to Gesk · Give clothing to Gesk · Give a spellbook to Gesk · Give a candle to Gesk · Give a battleaxe to Ilse · Give ring mail to Ilse · Give a ten-foot pole to Ilse · Give a candle to Ilse · Give Tegwen's lease to Gesk · Give the corn-store key to Gesk · Set down a staff · Set down clothing · Set down a spellbook · Set down a candle · Set down a battleaxe · Set down ring mail · Set down a ten-foot pole · Set down Tegwen's lease · Set down the corn-store key.
Offered: Melee Attack at the old buck rat · Flee · Guard at Gesk · Let Gesk fight this turn · Cleave at the old buck rat · Defend · Prepare Charge · Second Wind · Sweeping Strike at the old buck rat · Taunt at the old buck rat · Steel Yourself · Wait · Guard at Ilse.

**42. “Taunt at the old buck rat”** (rest; fight:taunt:region__s4_u_buck_person) · not consequential · Day 1, 3:06 p.m.

> Ilse 4/4 · Gesk 17/17 | against you: the old buck rat 8/8 ·
>

Offered: Melee Attack at the old buck rat · Flee · Wait · Let Ilse fight this turn · Defend.

**43. “Defend”** (rest; fight:defend:region__party_1) · not consequential · Day 1, 3:06 p.m.

> The old buck rat's gnawing bite catches Gesk, for 2. Gesk does not bleed from it. Ilse stands down. ·
>
> Ilse 4/4 · Gesk 15/17 | against you: the old buck rat 8/8 ·
>

Offered: Melee Attack at the old buck rat · Flee · Wait · Let Ilse fight this turn.

**44. “Melee Attack at the old buck rat”** (fight; fight:melee:region__s4_u_buck_person) · not consequential · Day 1, 3:06 p.m.

> Ilse 4/4 · Gesk 15/17 | against you: the old buck rat 3/8 ·
>

Offered: Melee Attack at the old buck rat · Flee · Let Gesk fight this turn · Press on to the end · Cleave at the old buck rat · Defend · Prepare Charge · Second Wind · Sweeping Strike at the old buck rat · Steel Yourself · Wait · Guard at Ilse · Guard at Gesk.

**45. “Melee Attack at the old buck rat”** (fight; fight:melee:region__s4_u_buck_person) · consequential 38 · Day 1, 3:16 p.m.

> Gesk hits the old buck rat with the battleaxe, for 10. The old buck rat falls. ·
>
> The fight is won. ·
>
> Following: Tell Gek at the gate-yard of Gatesend that the rats and their nest are dealt with. Ten coin are yours, and a lantern. ·
>

- Aims taken up: region__s4_u_rats_job_owed_whole, gate__gate_claim, gate__gate_cutter, region__s4_roadwood_aim_read
- Time: 1 watch
- By Rule lingers (rule fired): + lingered(party) = 1
- By Rule region__s4_u_nest_ended (rule fired): + region__s4_u_nest_cleared(region__s4_u_rats_job)

Offered: Up to the rat-runs · To the old drain · and 34 more.

## the old drain

**46. “To the old drain”** (primary; go(region__s4_u_nest_shelf,region__s4_u_drain)) · consequential 39 · Day 1, 3:26 p.m.

> An old drain of fitted stone, tall enough to stoop along, with a black trickle down the middle. The walls are furred with something pale that moves when the light touches it.
>
> A long, many-legged centipede, red-brown and segmented, its feelers raised and its fangs curved. ·
>
> A great centipede stands its ground and watches you. It will not have you here for long. ?
>
> Following: Tell Gek at the gate-yard of Gatesend that the rats and their nest are dealt with. Ten coin are yours, and a lantern. ·
>

- Moved: party region__s4_u_nest → region__s4_u_drain
- Time: 1 watch
- By Rule came_here (rule fired): - arrivedAt(party) = 42; - stoodAt(party, region__s4_u_nest); + arrivedAt(party) = 44; + stoodAt(party, region__s4_u_drain)
- By Rule lingers (rule fired): - lingered(party) = 1
- By Rule temper_let_go (rule fired): - warned(region__s4_u_buck, party)
- By Rule temper_warns (rule fired): + patience(region__s4_u_crawler) = 45; + warned(region__s4_u_crawler, party)

Offered: Prop the trapdoor open above and let the air down the culvert · Attack a great centipede · To the nest · Prod the air in the culvert with the pole · and 37 more.

## the gate-yard of Gatesend

**47. “Out to the gate-yard of Gatesend”** (rest; travel:region__s4_green) · consequential 40 · Day 1, 3:59 p.m.

> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door.
>
> Gesk’s torch gutters out. ?
>

- Moved: party region__s4_u_drain → region__s4_green
- Time: 3 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 44; - stoodAt(party, region__s4_u_drain); + arrivedAt(party) = 47; + stoodAt(party, region__s4_green)
- By Rule temper_let_go (rule fired): - warned(region__s4_u_crawler, party)
- By Rule arcology__bronze_ring_set_mirror__withheld (rule fired): + withheld(arcology__bronze_ring_set_mirror)

Offered: Tell Gek the rats under the corn-store are dead, nest and all · To the sluice gallery · Talk to the runaway acolyte — ask the acolyte where he is going · Read the royal proclamation under the notices · and 83 more.

**48. “Tell Gek the rats under the corn-store are dead, nest and all”** (primary; region__s4_u_rats_job_paid) · consequential 41 · Day 1, 3:59 p.m.

> Gek hears about the nest and the old buck rat with a face that says the grain is the least of it. Ten coin are counted out, and a lantern and two flasks of oil set on the counter beside them. ‘That drain goes under half the town,’ says Gek. ‘If you’re going back down it, go with a light that won’t blow out.’
>
> Ilse gains 1 Lantern. ?
>
> Ilse gains 2 flasks of lamp oil. ?
>
> Following: The old ways under Gatesend go on past the corn-store's cellar. The rat-runs lead into an old drain. Steps go down behind the ossuary's bone-heaps, and a breach opens in the quarry gallery's floor. They meet below, in the undercroft. ·
>

- Came into the company's hands: lamp_oil_given1, lamp_oil_given2, lantern_given1
- Aims taken up: region__s4_u_onward_sought
- Aims gone: region__s4_u_rats_job_owed_whole
- By Rule thanks_priced (rule fired): - goodsPrice(region__s4_merchant, rations) = 2; + goodsPrice(region__s4_merchant, rations) = 1; + thanksPriced(region__s4_merchant, rations)
- By Rule thanks_priced_item (rule fired): - price(region__s4_merchant_antidote_1) = 3; - price(region__s4_merchant_antidote_2) = 3; - price(region__s4_merchant_dandelion_1) = 2; - price(region__s4_merchant_heather_1) = 2; and 20 more
- By Rule region__renown (rule fired): + region__renowned(party)
- By Rule region__s4_u_rats_onward (rule fired): + region__s4_u_done(region__s4_u_onward); + region__s4_u_onward_by(region__s4_u_warren)

Withdrawn: Haggle with Gek over the price of a prepared yarrow poultice · unlikely · one try · Haggle with Gek over the price of a twist of ratsbane · unlikely · one try · Haggle with Gek over the price of a dandelion · unlikely · one try · Haggle with Gek over the price of heather · unlikely · one try.
Offered: To the old corn-store · To the sluice gallery · Ask Gek what the old workings are worth · Talk to the runaway acolyte — ask the acolyte where he is going · and 94 more.

**49. “follow gate__gate_claim”** (asked; {"follow":"gate__gate_claim"}) · not consequential · Day 1, 3:59 p.m.

> The gate-yard of Gatesend is swept clean to the cobbles, and smells of wet stone and beeswax from the chapel door. The brothers’ house stands at the back of it behind a low wall, and the village crowds round the front. Beyond the roofs lies the Starmere. The fells rise steeply behind the last houses. Twice this month the Hall’s keeper has driven the town’s pigs off the verge of the old road.
>
> A notice is nailed to the clerk’s own trestle, under the shire-reeve’s mark: THE TALLY OF IRON AND GOLD IS TO BE MADE UP BY MIDWINTER. FOR THE WEIGHT OF IRON AND GOLD WANTING, SEE THE CLERK.
>
> Every weir below the sea-bank has a trap set in it, and the water through them runs the right way: out.
>
> Above the roofs, to the east, two columns of smoke stand on the ridge: one thick and black from the digging, one thin and white from the old woman’s fire.
>
> Wat the collier is knocking dried clay from a pick, a careful blow at a time.
>
> The brothers’ dog lies across the doorstep of the guest-hall with his chin on his paws, and watches who comes.
>
> A thin brown cat crouches at the foot of a wall, watching a hole in it without a blink.
>
> Gek, a herb-wife, selling from the house door, is here. The runaway acolyte, an acolyte run from a shrine two valleys over, still in his grey habit, counting the coppers in his palm, is here. Aldous Fenn, the reeve of the wood-wardens, who license the cutting in the woods round Gatesend, is here. So are a drover’s boy, Simkin and Nest. ·
>
> Gek will not forget what you did. ?
>
> Following: Tell the reeve at Porthalen that the sea-gate shuts. ·
>
> Provisions: Food for 2 days. ·
>

Offered: Set out for Porthalen (led) · To the sluice gallery · Ask Gek what the old workings are worth · Talk to the runaway acolyte — ask the acolyte where he is going · and 94 more.

## the bridge over the Whitewater

**50. “Set out for Porthalen”** (led; travel:region__s1) · consequential 42 · Day 2, 12:09 a.m.

> The road crosses the Whitewater by a bridge of old grey stone, three arches green with moss; the river runs deep and quick beneath. An otter’s head breaks the water downstream and is gone.
>
> Wrackham is built round the makers’ well, which is older than the town: it goes down further than anyone has followed it, and has never once run dry. Holyking: a great long mound with a door of stone in Addermoss. Hobs took the bell out of its frame over the well at Wrackham one night, and carried it off to their hold at Holyking.
>
> Provisions: Food for 1 day. ·
>

- Learned: raidersFolk__bell_taken, region__s2_why, region__w8_named
- Moved: howe__household howe__gallery → howe__forecourt; party region__s4_green → region__s5_s2_way; region__s1_r1 region__s1_sheds → region__s1_houses; region__s1_r10 region__s1_green → region__s1_houses; region__s1_r2 region__s1_waterside → region__s1_houses; region__s1_r3 region__s1_fields → region__s1_houses; region__s1_r4 region__s1_saltpans → region__s1_houses; region__s1_r5 region__s1_byre → region__s1_houses; region__s1_r6 region__s1_fields → region__s1_houses; region__s1_r7 region__s1_green → region__s1_houses; region__s1_r8 region__s1_green → region__s1_houses; region__s1_r9 region__s1_green → region__s1_houses; region__s2_r1 region__s2_well → region__s2_houses; region__s2_r2 region__s2_fields → region__s2_houses; region__s2_r3 region__s2_waterside → region__s2_houses; region__s2_r4 region__s2_fields → region__s2_houses; region__s2_r5 region__s2_green → region__s2_houses; region__s2_r6 region__s2_green → region__s2_houses; region__s2_r7 region__s2_green → region__s2_houses; region__s2_s3_way_t region__s2_s3_way → region__s3_taproom; region__s3_r1 region__s3_green → region__s3_houses; region__s3_r2 region__s3_green → region__s3_houses; region__s3_r3 region__s3_lanes → region__s3_houses; region__s3_r4 region__s3_clamps → region__s3_houses; region__s3_r5 region__s3_byre → region__s3_houses; region__s3_r6 region__s3_green → region__s3_houses; region__s3_r7 region__s3_green → region__s3_houses; region__s4_r1 region__s4_cloister → region__s4_houses; region__s4_r2 region__s4_lanes → region__s4_houses; region__s4_r3 region__s4_fields → region__s4_houses; region__s4_r4 region__s4_green → region__s4_houses; region__s5_r1 region__s5_crossing → region__s5_houses; region__s5_r2 region__s5_green → region__s5_houses; region__s5_r3 region__s5_waterside → region__s5_houses; region__s5_r4 region__s5_green → region__s5_houses; region__s5_s2_way_t region__s5_s2_way → region__s2_taproom; tower__risen tower__hall → region__s3_green
- Aims taken up: raidersFolk__bell_sought
- Time: 49 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 47; - stoodAt(party, region__s4_green); + arrivedAt(party) = 96; + stoodAt(party, region__s5_s2_way)
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
- By Rule region__s1_tie_takes (rule fired): - at(region__s1_tie_token, region__w5)
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
- By Rule region__s3_tie_takes (rule fired): - at(region__s3_tie_token, region__w9)
- By Rule region__s4_r1_evening (rule fired): - at(region__s4_r1, region__s4_cloister); + at(region__s4_r1, region__s4_houses)
- By Rule region__s4_r2_evening (rule fired): - at(region__s4_r2, region__s4_lanes)
- By Rule region__s4_r3_evening (rule fired): - at(region__s4_r3, region__s4_fields); + at(region__s4_r3, region__s4_houses)
- By Rule region__s4_r4_evening (rule fired): - at(region__s4_r4, region__s4_green)
- By Rule region__s5_r1_evening (rule fired): - at(region__s5_r1, region__s5_crossing); + at(region__s5_r1, region__s5_houses)
- By Rule region__s5_r2_evening (rule fired): - at(region__s5_r2, region__s5_green)
- By Rule region__s5_r3_evening (rule fired): - at(region__s5_r3, region__s5_waterside); + at(region__s5_r3, region__s5_houses)
- By Rule region__s5_r4_evening (rule fired): - at(region__s5_r4, region__s5_green)
- By Rule region__s5_s2_way_t_in0 (rule fired): - at(region__s5_s2_way_t, region__s5_s2_way); - region__journeysTo(region__s5_s2_way_t, region__s2_green); + at(region__s5_s2_way_t, region__s2_taproom); + region__journeysTo(region__s5_s2_way_t, region__s5_green)
- By Rule region__s5_tie_takes (rule fired): - at(region__s5_tie_token, region__w1)
- By Rule tower__walk (rule fired): - at(tower__risen, tower__hall); + at(tower__risen, region__s3_green)
- By Rule meal (rule fired): - nextMeal(party) = 72; - quantity(party, rations) = 2; + nextMeal(party) = 216; + quantity(party, rations) = 1
- By Rule region__s2_s3_way_t_sorted (rule fired): - region__inTrouble(region__s2_s3_way_t)
- By Rule region__s5_s2_way_t_sorted (rule fired): - region__inTrouble(region__s5_s2_way_t)
- By Rule arcology__lilies_close (rule fired): - state(arcology__blossoms, arcology__open); + state(arcology__blossoms, arcology__folded)
- By Rule gate__conger_rises (rule fired): + at(gate__conger, gate__well)
- By Rule howe__hirer_arrives_from_nowhere (rule fired): + at(howe__hirer, region__s1_green); + howe__hirer_arrived()
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
- By Rule drove__sale_cried (rule fired): + drove__cried(party)
- By Rule temper_greets (rule fired): + greeted(region__s2_cat, party); + greeted(region__s2_inndog, party); + tolerates(region__s2_cat, party); + tolerates(region__s2_inndog, party)
- By Rule region__s1_tie_goes (rule fired): + region__s1_tie_gone(party)
- By Rule region__s3_tie_goes (rule fired): + region__s3_tie_gone(party)
- By Rule region__s5_tie_goes (rule fired): + region__s5_tie_gone(party)

Offered: Set out for Porthalen (led) · To a long range of roofs behind a gate-arch · Make camp for the night · To the fen of Addermoss by the road, an hour and a half out of Reedbridge · and 84 more.

## the road between Porthalen and Reedbridge

**51. “Set out for Porthalen”** (led; travel:region__s1) · consequential 43 · Day 2, 2:49 a.m.

> The road between Porthalen and Reedbridge goes through scattered woods and the clearings of charcoal-burners. A stag stands in a clearing, watching, before it turns away.
>
> It is a long time since anyone slept. The company is weary, and will fight the worse for it until it sleeps. ?
>
> Need: Weary ·
>

- Moved: party region__s5_s2_way → region__s1_s5_way
- Time: 16 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 96; - stoodAt(party, region__s5_s2_way); + arrivedAt(party) = 112; + stoodAt(party, region__s1_s5_way)
- By Rule weariness (rule fired): + weary(party)

Offered: To the landing at Porthalen (led) · Set out for Porthalen (led) · Make camp and sleep · To a broken keep · and 95 more.

## the landing at Porthalen

**52. “Set out for Porthalen”** (led; travel:region__s1) · consequential 44 · Day 2, 5:39 a.m.

> Porthalen is shuttered for the night. A lamp burns over the door of the Stone Horn.
>
> Owain stands at the edge of the quay with his hands in his armpits, watching the customs-house door.
>
> Patch lifts his head, looks at you, and puts it down again.
>

- Learned: drove__held, gate__boat_offer, pans__chimney
- Moved: party region__s1_s5_way → region__s1_green
- Aims taken up: drove__held_aim, drove__bran_aim
- Time: 17 watches
- By Rule came_here (rule fired): - arrivedAt(party) = 112; - stoodAt(party, region__s1_s5_way); + arrivedAt(party) = 129; + stoodAt(party, region__s1_green)
- By Rule gate__eels_ebb (rule fired): - state(gate__eels, gate__hunting); + peaceable(gate__eels); + state(gate__eels, gate__stranded)
- By Rule temper_greets (rule fired): + greeted(region__s1_inndog, party); + tolerates(region__s1_inndog, party)

Offered: Talk to Reeve Annis Talfryn — tell the reeve the sea-gate at Gatesend shuts · Ask Owain how many head came down · To the customs-house · Into the Stone Horn by the door · and 88 more.

**53. “Talk to Reeve Annis Talfryn — tell the reeve the sea-gate at Gatesend shuts”** (primary; gate__claim) · consequential 45 · Day 2, 5:39 a.m.

> The reeve rides out to see for herself before she pays, and stands on the sea-bank a long while with the wind in her cloak. Then thirty crowns, counted out on the gatehouse sill. ‘The fen owes you,’ she says. ‘So do I. When the tally goes up to the Tower of the Scales this quarter, I will need someone to carry it who knows what the sea costs.’
>
> Ilse takes the reeve’s quarter-tally, in a scroll-case. ?
>
> Following: Take the reeve's tally north up the salt road to the Tower of the Scales in Dun Rìerdan. ·
>

- Learned: gate__road_north
- Came into the company's hands: gate__tally_case
- Aims taken up: gate__north_aim
- Aims gone: gate__gate_claim

Offered: Ask Owain how many head came down · To the customs-house · Into the Stone Horn by the door · Talk to Leofric — sign on with Leofric as a digger for the Spade-Company · and 91 more.
