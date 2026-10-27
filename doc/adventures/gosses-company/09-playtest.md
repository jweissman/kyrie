# Gosse's Company — playthrough evidence

*Every journey below is played by the labels a player sees (`src/session/journey.ts`, the same driver as
`bin/kyrie play`), from the steps in `test/fixtures/gosse`, and asserted in `test/gosses-company.test.ts`. The full
pages are in [playtest/](playtest/). Dice are seeded; a journey is the same journey every time.*

## The journeys, and what each ended in

| Journey | Build, entry | Approach | Ending | Votes | Temper | Fines | Clay / Gammage / Mallory / Carrow (regard − slight) |
|---|---|---|---|---|---|---|---|
| [book](playtest/book.md) | a bard, the city from the road | the Book: struck, nineteen lines restored under the Eighth Ordinance, licensed | **The Patent House** | 3 | 23 | 1 | 10−2 ✓ · 14−2 ✓ · 6−0 ✓ · 4−1 |
| [supper](playtest/supper.md) | the bard | the Book, then the Bench's supper at the Orde house, asked by the Master: the true thing, Gosse's *Dido* note, Swale's innocence, the secret kept, both things true | **The Patent House** | 4 | 23 | 1 | 13−2 ✓ · 16−2 ✓ · 10−0 ✓ · 5−1 ✓ |
| [liberty](playtest/liberty.md) | a soldier, from Wending Cross with the players | the Liberty: whole, in the Soke, the tallymen counting | **The Patent House** | 3 | 24 | 21 | 8−4 ✓ · 14−0 ✓ · 4−2 · 6−0 ✓ |
| [famous](playtest/famous.md) | the same soldier | the Liberty, without giving Clay back his *Dido* | **The Liberty** | 2 | 24 | 21 | 6−4 · 14−0 ✓ · 4−2 · 6−0 ✓ |
| [empty-wing](playtest/empty-wing.md) | the soldier | the Liberty, with nobody between Hepzibah and the Office's men | **The Patent House**, and the proposal never made | 3 | 22 | 21 | 8−4 ✓ · 13−0 ✓ · 3−2 · 6−0 ✓ |
| [bow](playtest/bow.md) | the bard | the Book, and a nod to the Master in the last scene | **The Author's Bow** | 4 | 26 | 0 | 11−2 ✓ · 14−2 ✓ · 7−0 ✓ · 6−1 ✓ |
| [refused](playtest/refused.md) | the bard | the Book, with the siege-tower's wedge knocked out | **The Patent Refused** | 3 | 23 | 1 | as the Book |
| [road](playtest/road.md) | the bard | licensed, two acts rehearsed, nothing else | **The Road Again** | 0 | 7 | 3 | 3−8 · 6−3 · 2−0 · 1−1 |
| [pension](playtest/pension.md) | the bard | told Gosse to take Fallow's pension on the first morning | **The Pension** | — | — | — | — |
| [burned](playtest/burned.md) | the bard | the parcel, one rehearsal, nothing else: Shad prints, Fallow informs | **The Fair Copy Burned** | 0 | 2 | 0 | — |
| [alone](playtest/alone.md) | nobody, from the road | walked to the Westgate and waited | **The Company Broken** | 0 | 6 | 22 | 1−9 · 7−3 · 1−2 · 1−0 |
| [tallyman](playtest/tallyman.md) | a stranger, never hired | signed on with the Office; let the angel off; laid the stick down | **The Company Broken** | 0 | 6 | 14 | — |

All eight endings are reached by at least one journey.

**The two principal approaches differ, and both work.** The Book and the Liberty both win the Patent with three
votes, but not the same three: the Book's clean, licensed night wins the Canon and loses Carrow (who writes CUT in
capitals in the lords' room); the whole play in the Soke wins Carrow and loses the Canon, and needs Clay won some other
way (his manuscript, returned). The Book is fined one crown (an ad-lib); the Liberty twenty-one, paid by the Owl's
subscription or the yard. The nights read differently scene by scene: the Ghost "stands" or "rises"; the Tallyman is
struck out, or is played and turned on the grey bench; the epilogue's account of the play's afterlife is the
licensed play the yard mouths the real lines along with, or the whole play fined every night and paid in pennies into
Patience's bonnet.

## The ways in

| Entry | Evidence |
|---|---|
| **A generated world** | [generated-world.md](playtest/generated-world.md) and the last test in `test/gosses-company.test.ts`: seed `gosse`, a forest country, holds the vale of the Arle west; the players are on the market-place of Tussanand, the west road's town; the innkeeper tells of the Trial; a playbill is nailed up; the reckoning paid, service taken; the march-stone; Pentrice drawn as a chapter; in the Moon's taproom, Gosse greets the company as one of his own (`inCompany` true from the herald's `joined`) |
| **With the players, from Wending Cross** (the standalone campaign) | [green.md](playtest/green.md) and [liberty.md](playtest/liberty.md): freed and signed on at Wending Cross; the road across the march; "Tell Gosse you have come, as you said on the green" |
| **From the road, a stranger** | [book.md](playtest/book.md): never met the players; asks Gosse at the Moon whether the company needs a hand |
| **As the Office's tallyman** | [tallyman.md](playtest/tallyman.md): signed on with Tunstall at the Westgate; never one of the company |
| **Too late, or never** | the wander test: a company that never crossed the march, or came after the verdict, is given no ending and the campaign goes on |

## Negotiations

Social choices in Kyrie are checks with the odds shown; the evidence is what happens on both sides of them.

- **Dorcas and the Widow.** The bard on seed `g1`: "Tell Dorcas the Widow is the best part… · an even chance", 17
  against 16, and she asks for it. On seed `b1` the same words fail, 10 against 16 ("'That's what Absalom says,' says
  Dorcas, and goes on darning"), and the journey cannot go on as written; the alternatives are the old notice from
  Gammage's stall (used by the soldier, who is never offered the persuasion at good odds) or, for a player by trade,
  "as one player to another", with no roll.
- **The Canon and Ned.** The bard fails the hard persuasion, 14 against 16 ("Ask me again when he is a man"); the
  cleric is heard without a roll ("as one who keeps the faith").
- **Carrow's claim.** Caught by insight (18 against 10 for the bard, 11 against 10 for the soldier at wisdom −1), then
  kept quiet rather than exposed: Carrow votes for the whole play in the Liberty and stops claiming it.
- **The Office's men in the wing.** The soldier faces them down on a natural 20; the bard instead carries the
  prompt-book round to the bench, which needs no roll.
- **Merriman's speech.** Written with lore, exactly 13 against 13.
- **The Master.** Told that the company knows, she tells the riot as her own story; told that Gosse is sorry, she
  will not be told anything more ("I shall be on the grey bench"); trusted, she comes up on the stage.
- **Ferriby and the watermen.** Paid the second penny (8 coin) in the Book; struck in the Liberty, and the crowd led
  over the weir from the bollard.

## Alternate outcomes of the small stories

| Story | Outcomes seen in play |
|---|---|
| the parcel | the playbill shown (Book); the cabbage-throwing old woman at noon (Liberty, alone) |
| the Widow | persuaded (Book); the old notice (Liberty); the player's word (tragedian); Dorcas gone to the wardrobe and Tam plays Bell in a frock (tallyman, alone) |
| the Ghost's lines | cut with Hepzibah (Book); innocent, and told in the roar that they love him (Liberty); innocent and alone, shaken, playing to the floorboards (alone) |
| Swale and Pudding | the letter (Book, Liberty); never spoken (alone: the scenes go ragged) |
| Kit's voice | held by the Canon's trick (Book, Liberty); Kit plays the Widow as his grandmother (alone) |
| Patience | led home with honey (Book); Pudding hums her home (Liberty); taken by Bowle and kept in the bear-garden (alone) |
| the bees | the fishwives talked into waiting (Book); the climb failed and the sulphur burned (Liberty) |
| the siege-tower | the wedge driven home (Book, Liberty); knocked out (refused) |
| the pirate | Shad called down and his tablet wiped (Book, Liberty); the quarto printed, Fallow informs, the book seized and burned (burned) |
| the heckler | Meg cast, Garlick heckles on cue and Pudding answers "I'm wearing yours tomorrow" (Book, Liberty); hired by Fallow, unanswered, heckles the whole scene (alone, tallyman) |
| the bailiff | costumes carried over the river (Book, Liberty) |
| the Fountain | set running (Book: the Mayor's line about it gets the loudest laugh in forty years); dry (Liberty: Tam's watering-can) |
| the ringers | the jackdaws found, the Trial peal rung (Book); never asked (others) |
| the wing | the line given from Gosse's good side (Book, Liberty); Gosse dries alone and apologises (alone) |
| Hepzibah at the end | kept in her wing, and "Yes. And your line is: And so, good night" (Book, Liberty); taken to the bench and the proposal never made, Gosse turning to an empty wing ([empty-wing](playtest/empty-wing.md), the Liberty with nobody in the way: still the Patent) |
| the angel | let off by a tallyman (tallyman) |
| the Master | bowed (bow); kept her secret and comes in Sukey's hood (Book) |

## Persistence and determinism

- **Kept and opened again.** The Book journey is saved mid-week (at the start of the third day), the checkpoint
  serialised to JSON and resumed in a new session; the rest of the journey ends in the same ending, at the same
  elapsed time, with the same voters as an unbroken run.
- **Twice from one seed.** Eighty steps of the Book, played twice from the same seed, tell the same page.
- **The engine fix's regression.** Two campaigns begun alternately in one process (the players' bear is a module
  species) begin again without error (`test/campaign-isolation.test.ts`).

## Wandering

`test/gosses-company-wander.test.ts` plays the standalone campaign from Wending Cross at random: from a seeded start,
one of whatever the page offers, two hundred times, with a long wait one time in five. After every step it checks
that the company is in a place, the Trial's day never goes backward or past six, the votes stay between nothing and
four, the Ghost and The Wolf King are never both played, the book is in one state at a time, and no part has two players.

It found two real faults, both fixed: a company that never left Wending Cross reached an ending at the verdict, from a
city it had never entered (and the campaign stopped); and a company that wandered in weeks later had the campaign end
at the gate. Two of the three seeds spend their whole walk in and around Wending Cross; the third reaches the Soke's
bear-garden. Random play is not a substitute for reading a journey; it is the cheapest way to find what nobody
thought to try.

## Combat

As first built there was no fight in Gosse's Company: every opponent (the bailiff, the Office's men, the heckler, the
watermen, the bear-ward) was met by a check, coin or a thing carried. The second pass ([12-second-pass.md](12-second-pass.md))
added two dangers, each with more ways round it than through it, and the suite plays them by setting the scene
directly (no journey walks into them by chance):

- **Bowle's mastiffs.** A thief picks Patience's pen under Bowle's nose; he draws the kennel bolt, and three mastiffs
  stand between the company and the gate and wait for the word. Walking out with the bear in that watch, she is got
  away clean; staying, the fight is lost (a level-one thief against three bear-dogs), and the company comes round in
  Soke Lane, bitten, with Patience in her pen again and a new padlock. By night the dogs run the ring while Bowle
  sleeps over the kennels, and a drover's hush (woodcraft) or fire is offered against them.
- **The weir-rats.** At nine at night on the weir stones Long Nan Scullard asks two crowns. The page offers talking
  her round, facing her down, paying, fighting and turning back; a company that has asked Ma Tolly (or taken Garlick's
  directions) can name the Gullet and is let by. Paid, the purse is two crowns lighter; beaten, the company is fished
  out at the Soke landing, poorer. In the Liberty journey the crowd led over the weir scatters the rats for good.

A build made for fighting is still not needed anywhere: brawn carries the costumes, frees the trap and turns the
conduit wheels, and intimidation holds the wing and faces Nan down.
