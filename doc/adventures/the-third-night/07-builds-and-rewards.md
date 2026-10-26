# The Third Night: builds, and what is won

Deliverables 6 and 7: how different characters meet the city, and the high-level rewards and what they imply.

## The build matrix, as played

Every row is a playthrough that runs in the tests (`test/the-third-night*.test.ts`), with its transcript in
`playtest/`. Charisma and lore are deliberately absent from most of them.

| Build | Skills that matter here | Route played | Checks needed | Ending |
|---|---|---|---|---|
| **Ranger, herdsman** (the homecomer; charisma −2) | woodcraft | Ice from Honoria, an hour with Jennet, the cart and the farrier, Kit under the arches, Kit's telling, Jennet to Maudie's door | **None** | The Two Mothers |
| The same | woodcraft | Rope from Pell; up the pier face; the three lowered to the bank; read the ford; three trips; buried at dawn | None | Earth on Him (Kit taken at dawn) |
| The same | woodcraft | The same night, then into the Guildhall to say it was you, not Kit | None | Earth on Him (banished, Kit freed) |
| The same | woodcraft, lore-free | The hide read by its brand; a drover's whistle for the bear | None | (local) Ham grateful; Robin home; the Tull knife |
| The same | — | Win's chisels redeemed; the ring argued (fails, charisma −2) then bought | One, failed, with a paid alternative | (local) Win's claim; Annis's ring |
| The same | — | The farrier and Kit's confession sold to Gidley | None | The Company's Bargain |
| The same | — | Kit turned to sinking the board, and nothing else | None | The Fire (his mother taken; the carters rise) |
| The same | — | Maudie kept at home on the third night, and nothing else | None | The Lime |
| **Warrior, smith** (no persuasion, no lore) | craft of arms; intimidation | Hulme answered; Gault asked plainly, soldier to soldier, for the letter; the hand known; Hal on the starling | **None** (Gault's topic opens to the warrior's craft) | The Reeve's Release |
| The same | — | The same, but Hal reached only on the third evening; the worse clause answered to the reeve's face | None | Too Late |
| The same | — | Gidley kept talking at the easel; the release moved at the Bench | None | (satire) the release clause carried by Gidley's tears |
| The same | — | Joining Kit's fire alone | A fight, lost | The Third Night (in the cellar when its mother went) |
| **Thief, criminal** (charisma −1) | deception, lockwork, stealth | Two kind lies to Corbin and Dorcas; the gate-ward's door picked; the dead lowered into the boat | Two deception checks (seed-dependent: a failed lie closes that door for good) | Earth on Him (Dorcas claims her charter; Kit taken) |
| The same | lockwork | The flask from the ash; Pinch cornered; his door picked; the day-book; the captain met on the road, told at supper, and answered as a rebel's child | One persuasion check on the road (may fail) | The Lime, with Maudie spared by the captain |
| **A traveller** (a stranger) | — | The captain's question at supper, answered as someone with nobody on the rail | None | (the captain's view) |
| **Cleric** | rites | The Abbess's terms; the office said under the rail at the curfew; regard two; the claim and sanctuary; the tithe; the charity clause | **None** | The Liberty's Charity |
| **Monk, mendicant** | climbing | Kemp's word (homecomer); up the pier face by climbing; down on Pell's rope to the bank; into the Shambles before dawn; the cart at seven; carried from the tan-yards | None | Earth on Him |
| **Mage, archaeologist** (the "scholar") | digging, lore | The three graves dug by day; Ham's drive on night 2 to learn the ford; two carried before the river rose | None | The Third Man |
| **Bard** | persuasion, lore | The hide to the tanner; the Abbess's claim; the tithe; the charity clause | None needed (the Bench rule is learned, not rolled) | The Liberty's Charity |
| **A seasoned company of strangers** (warrior, cleric, thief, level 4) | arms | Kit's plan learned from the young carters; joining him; Gault and two riders beaten | A fight, won | The Fire (the counting-house burned; the day-book with it) |
| **Warrior** (no woodcraft), wading untaught | arms | The ford at night, meeting the Bargeman across the way; going at it alone | A fight, lost | Death at the first bite: the one place a lone character can die, and only by choosing it |
| The same, with Maudie's bread | — | A loaf thrown on the water at Wade's Step, as the old drovers did | None | Over the ford untaught |
| **Ranger** (homecomer) | — | Maudie's bread sent up to the riders at dusk; the dead cut down at half past ten with the riders awake | None | Not seen |
| **A seasoned company** | arms | Going at the Bargeman | A fight, won | The Bargeman dead, mourned by the eel-men |
| **A traveller** (a stranger, warrior) and **a company from a generated world** | — | Entered by the drove road; Maudie talked to as a stranger; the four days waited out; walked back out to the march-stone | None | The Third Night (chapter closed; world goes on) |

What the matrix shows:

- **Both principal approaches finish with no charisma and no scholarship.** The ranger reaches The Two Mothers (by
  day) and Earth on Him (by night) without a single roll. The warrior reaches The Reeve's Release without one.
- **The approaches differ in kind, not only in flavour.** By day is talk and errands across the city and costs an
  office or a toll; by night is weight, time and low water, and costs someone their freedom at dawn. The same build
  feels the difference: the ranger's night is three hours of carrying three men through mud; their day is an hour
  sitting by a dead boy's bed saying nothing.
- **Skills open doors; they rarely decide outcomes.** Woodcraft reads the ford (anyone can be told it); lockwork
  picks two doors (a key, a jug, or the reeve's own walk will do instead); deception tells two kind lies (a hard
  persuasion, or the Abbess's order, will do instead); rites earn the Abbess's regard (a judgment in her court will
  too). Where a check exists, failing it closes that door and leaves the others.
- **Kinship is the largest single key.** The homecomer has the answer to Hulme's question, the coat for the dog, the
  promise to their mother, Kemp's word for the offal cart, the hand of Hal's letter recognised at a glance. A
  stranger reaches the same endings by longer ways (the hide for Kemp, the insight check for Gault, the vigil for the
  ford, `stand_in_door` and `free_kit_stranger` for Kit).

## Rewards

Experience comes from **twenty-three milestones**, for what is resolved rather than what is killed (`growth.kyr`):
from 150 (the dog home, a ruling from Pinch, the hide) through 300 (who was driving, a clause the Bench passed,
Corbin and Dorcas speaking) and 400 (Kit's confession, who sent the riders, who burned the toll-house) to 500 (the
two widows together) and 600 (the three buried). The Two Mothers playthrough, which touches six small adventures,
earns the homecomer 1,750 on the way to the walk (and Kit, walking with them, 500).

| Reward | From | Mechanical | What it implies afterwards |
|---|---|---|---|
| **Kit Pardoe** | His trust, earned under the arches; asked to join | A kinsman who joins as himself (warrior, level 1) | A brother at your side, who will not let anyone else drive his father's horse; or, if you sold him, nobody |
| **Bramble** | Bread, the coat, or patience | A dog that follows | Finds people at night; a dog who lies where the cart stood |
| **The Company's purse** | Gidley, for Kit | Forty crowns | Kit hanged at Harbury; Maudie never looks at you again |
| **The freedom of the bridge** | The Bench, entering its charity in the minutes | A brass token; the farthing never taken again | Standing in Wrayford, of the most embarrassing kind |
| **Dorcas Mudd's penny** | Corbin and Dorcas brought together, or her boat used | The ferry at any hour, including the night | A crossing the bridge never sees, for life |
| **The Abbess's sanctuary** | Her regard, twice earned | The reeve's men stop at the drawbridge for you at the dawn reckoning | The Liberty's protection, and her frame for the reeve's letter |
| **The Tull knife** | Robin home | A good dagger | Goodwife Tull's opinion of you |
| **Three pies** | Annis, for the ring | Rations | — |
| **Wat Pardoe's coat** | Maudie, after a burial by night (homecomer) | A worn cloak | What he left |
| **The captain's view** | A walk at her stirrup; the truth with proof; a funeral; a drover; an answer to her question; the yards, if quiet | Counts toward three | At three, Maudie is not hanged for the decree, whatever else |
| **Banishment** | Taken at the rail, or standing in for Kit | Fined; put on the south road; the gatehouse barred to you "this year" | The bridge closed to a continuing company |

In a world that goes on, the region remains, and so do its consequences: the flowers on the rail, or the cut ropes
with black wool, or Wain Row burned; the reeve's empty chair; Annis on the Wharf; Corbin and Dorcas quarrelling
comfortably in the boat at dusk. The Bridge Feast on the fifth day is a last observable effect of which ending was
reached: no Feast after the fire; the Abbess refusing the bridge penny after the mothers ("The city paid this year.
Twice."); Gidley weeping beautifully under an empty rail otherwise.
