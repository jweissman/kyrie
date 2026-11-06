# The Banns at Hessel: broad-pass ledger

*Adventure `data/adventures/hessel/`, campaign `hessel`. Hessel was already the densest of the three (2,350 lines, a chapter for each of five days, seven callings' routes tested). I did not add deep time; I added a **layer of local depth and a second grave key**, in `season.kyr` (132 lines).*

## The Account

| | |
|---|---|
| **Count** | The Season's dead, in the sexton's book and the pumper's head. (The chalk slate, 'eleven strokes and a blank', and the candle-ends tied in elevens were cut in the review pass; the one tally motif left is the minuet's missing twelfth bar.) |
| **Keeper** | The pumper (who keeps the Season's count); Mr Twiss (the Rule: no music after eleven "though the King himself should ask"); Mrs Scrope (the town's tongue). |
| **First page (missing)** | Why the music stops at eleven. It is the stopped minuet of the old King, who sat down mid-bar; the twelfth bar survives only as the **wrong fourth change** of Saint Ebba's peal, which the ringers of Orm have called wrong for two hundred years. |
| **Price of reading** | Mr Twiss's Rule is his life. A bard can finish the minuet privately (he is grateful, the Rule stands) or aloud (the Rule breaks, the Ball goes on, he loses the one law he has kept). |

## Acts and scenes

Hessel already told its acts as `Chapter`s (Friday..Tuesday). Map: **Friday** the south road, Lim Bridge, Quay Lane, the chairmen; **Saturday** the Circus, the Rooms, Dr Ottery and the Orm road; **Sunday** the third reading, Saint Ebba's, the peal (new), Carth House; **Monday** the Closing Ball; **Tuesday** the coaches. Every place has a face (Big Lanyon, Mrs Cherrett, Mr Twiss, Mrs Scrope, Mrs Brannagh, Mr Pyne, the pumper, Dr Ottery, Colonel Ede (new)).

## What changed (before → after)

* **The Colonel (new grave scene in a comic book)**: **Colonel Ede** on the end bed of the Hospital, who "is being very slow"; `sit_with_ede` (any company, at night); the fate line differs by whether anyone sat with him (a stranger let sleep an hour, or buried in his boots on the Tuesday). Dr Ottery, if with you, says his one piece of tact.
* **Signpost (review pass)**: `season_bill`, an Observe on the Pump Room board, posts both time-windowed beats before either is reached: the Closing Ball and the band stopping at eleven, and Saint Ebba's peal on the third morning from first light with the ringers of Orm saying it is wrong in the fourth change. Nothing in it says what the change is.
* **The King's Hesitation (new, calling-unique)**: on Sunday morning the peal at the Abbey Yard stumbles in the fourth change. A **bard** hears that it is the last bar of a tune (`peal_understood` teaches `fourth_change`). At the Ball, after eleven, the bard has two actions: `hum_bar_privately` (Twiss's favour +2; the Rule stands) or `hum_bar_aloud` (favour +3; the Rule breaks; Mrs Cherrett dances; the Rooms stay up). Other callings hear the stumble and nothing more.
* **Voices by calling** (ten rules over six places and seven callings): bard (Pump Room, Stall Street, Cross Bath), thief (Pump Room, nave), warrior (Stall Street), cleric (nave), mage and monk (Hospital), ranger (Beacon).
* **Depth** (not on the critical path): left-hand gloves only in the Pump Room's lost-property box; the quarter-turn at the north pillar of the Cross Bath, which a boy on the step explains (wrongly, he says, and they do it anyway); the lost-property gloves, explained by the pumper in a way the box contradicts; the 200-year quarrel of Orm and Saint Ebba's ringers (Mr Pyne); Mopsa on the Delve Cut.
* **Links**: out, Mrs Scrope on who comes to Hessel (Corran's gouty, the coast's nervous) and Mopsa on the Delve Cut joining the cut at Corran, where **the Lesser Instruments** bought the first pump; read of a world event (`befell(slack_opened)`, `befell(remainder_harboured)` change what Mrs Scrope is telling, with `canon` extended in `module.json`/`placed.json`). In, what would bring a visitor from elsewhere: Mrs Cherrett's canal, and anyone with an inheritance and no one to leave it to.
* **Danger with a way round** (already present; verified): the **footpads** at the crossways: fight, pay the tribute (3 coin), or name Lanyon's boy (`name_lanyon`); **Sir Gervase** at Carth House at night: fight or tell him of the letter. No new combat added.

## Characterization

| Person | Want | Fear | Lie | Surprise |
|---|---|---|---|---|
| **Mr Twiss** | the Rooms kept in form | silence (a Ball with no band) | "the Rule is the King's" | **I was seven. My father hummed it, wrong, to put me to sleep** (`hum_bar_privately`) |
| **Colonel Ede** | to be told nothing | being "told he is dying" | "I'm not dying; I'm being very slow" | remembers every button of his regiment and no name |
| **Mrs Scrope** (existing) | a story | an empty morning | "I never repeat anything" | takes up the coast's new news the same morning |

## Companion arc

The preset party is a **bard** (Tamsin), alone. Companions in play: **Dr Ottery** (monk by calling; comes on the Orm road) and **Mopsa**. New beats: Ottery at the Colonel's bed (`ede_ottery_sits`), Mopsa on the Delve Cut. Calling-unique: the bard's bar (above). Choice with a consequence: private or aloud, which decides whether Mr Twiss keeps his Rule.

## Foreshadow and payoff

* The Sunday chapter has always said "a peal the ringers of Orm have called wrong in the fourth change". It is now the clue.
* Early: the bill on the Pump Room board, and the lost-property box of left gloves. Late: the Colonel's fate line, by whether anyone sat with him.

## Tests

`test/hessel-season.test.ts` (7 `it`s), plus `test/hessel.test.ts` and `test/hessel-wander.test.ts` unchanged and not re-run in the review pass. The tests play (the Ball ones through the `rooms.json` fixture phases and the clock step `=`, which jump the clock and prove the mechanism, not discoverability; the signpost test reads the Pump Room page from a walk from Lim Bridge): bard voices; the peal heard by the bard and not by a thief; the bar aloud (Rooms stay up, ending `last_dance`); the bar privately (+2 favour); Colonel Ede sat with and left alone; the Scrope world-event read. `bin/kyrie lint`: 0 errors, advice only.

## Honest shortfalls

* No new physical danger (Hessel has two already).
* Hessel is ordinary and local by design; deep time is not added.
* Voices for the **ranger**, **mage**, **monk** are single beats each; only the bard has the unique solution.
* `befell(remainder_harboured)` is written but not tested.
* The cut slate removed the pumper's reaction to the wax rubbing of a keeper's bench (`lore_pumper_rubbing`); Hessel no longer reads that cross-link.
* The Colonel dies on the fourth night regardless; the choice only changes what the pumper does.
