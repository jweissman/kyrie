# The Quiet in the Sky: ledger for the broad pass

*New data: `data/adventures/quiet-in-the-sky/fellowship.kyr` (about 80 lines), added to `module.json` and `placed.json`. The Daily, the Sitters and the Mending Bell are as they were. The numbers 900, 700 and 300 are all said and never reconciled; no new line reconciles them.*

## The ledger (14.1)

| | |
|---|---|
| **Count** | The Daily: one battle a day, all mended at the Hour. |
| **Keeper** | Two halls, the Sitters, and a bell at Larum that rings *three and three*. |
| **First page** | The Quarrel over whether a man who came in at noon moves first or last, which Aulus holds and nobody asked. And, now, the bell's real office. |
| **Price of reading** | A man stays dead. Halvard Eld is the first; Torold must be relieved of a watch he has forgotten the reason for. |

## Acts and scenes

1. **Larum** (the Hark, the chapel, Nance's bakehouse, Jory's house): Bet, Ambler, Nance, Jory. *New:* the passing bell; the smith's hollows in the floor; Hume's candles on the ledge; the Lull-cloth curtains; the second cup on Jory's table.
2. **The White and the Coming-in** (Cleeve, Ned): *New:* a curtain-cloth on a nail in the booth that does not frost.
3. **Halt** (Trophy Row, the Oven, the Truce, the ring of spears): Torold, Grimbold, Wystan. *New:* no locks; the watch that has forgotten.
4. **The Halls and the Field** (Morrowhall, Evenhall, the Scrapes): Hild, Mab, Ansel, Gorm, Cuddy, Edith. Unchanged.
5. **The Old Ice** (the bear, the Sitters): Aulus. *New:* the war-bear is on duty, and the ranger knows what that means.
6. **The Testing and the Morning After.** Unchanged.

## What changed, before → after

* **Characterization in play.** Torold (want: the Testing; fear: that nothing returns; lie: "he will get up"; surprise: he puts the sword down when two people disagree about where Halvard should lie, and lets the company decide). The bear (a guard asking only to be relieved).
* **Companion arc.** Five voices: cleric (the Mending Bell is a passing bell), ranger (the bear is a dwarvish war-bear on duty), thief (no lock anywhere on Trophy Row), warrior (the watch has forgotten what it is watching), bard (Halvard's ballad has a patch in its middle).
  * **Calling-unique way through:** the ranger speaks to the bear (`calm_bear`), a third road past the stair, in addition to meat and the climb.
  * **Choice with consequence:** a warrior and a cleric disagree about where Halvard should lie (up among his own, or down under the bell), once Torold consents and the company knows both graves. Siding with one chooses the grave, +1 trust with Torold, and leaves the other silent; the aftermath is written differently at the Old Ice (a third pair of footprints; the lowland office carried into the Field's snow) and at Larum (a spear laid point to the Pass; the first bell in forty days that sounds as if it were for somebody).
* **Lone-company route (review pass).** The shipped party is a warrior alone: no ranger to speak to the bear, no cleric to quarrel with. `salute_bear` (a warrior, a company with no ranger): stand to, give the sentry's countersign of the wrong army, one try, an intimidation check (hard); success and the bear turns its flank and lets you by (it does not lie down); failure and it sets a paw on you (`bear_cuff`, 2d6, dexterity save) and you may not try again. A lone company still chooses Halvard's grave by the topics (`grave_ice`, `grave_larum`) and buries him with no office: a new Observe at each grave says that nobody said it and what Torold said instead. The ranger's speech and the siding remain the best versions.
* **Danger with two exits.** Already present: the bear (meat, climb; now speech or, for a soldier, a gamble) and the frost wolves (fire, going back). Checked, plus one.
* **Depth.** The smith's stance in the stone; fluted candles that no one in Larum can make; Sixways cloth; the second cup on the guide's table.
* **Links.** Out: the Wold of Hume (candles for the parson's vigil, matched on Hume's slate); Sixways (winter wool for cloth that must be given, matched in the Lull). In: Larum buys from both; carters from either country are the road in. No flag is set for another module.
* **Tone.** The Quiet is grave; Grimbold's bread and Ned at the Oven are the existing contrast; none added.
* **Foreshadow and payoff.** Early: the second cup on Jory's table, turned the right way up. Payoff, for whoever brought Jory to his son: both cups are drunk from, and the second is washed. Last act: the burial aftermath above. (The eleven notches over the door, the booth lamp and the rubbing shown to Jory were cut in the review pass.)

## Tests

`test/quiet-in-the-sky-revised.test.ts` (4 `it`s; fixture `test/fixtures/quiet-in-the-sky/revised*`, seeds `q1`/`q2`): Larum's voices and Observes; the ranger and a lone cleric as control; the long journey through the bear, Aulus's board, Torold's trust, the quarrel, siding with the warrior, and the carrying to the Old Ice (five-calling fixture); and **the shipped warrior** (`the-quiet-in-the-sky.campaign.json`, seed `q2`) who salutes the bear (the roll passes at that seed), learns of the ice grave from Aulus, offers to bury Halvard, and is told by the page that nobody says the office.

## Honest shortfalls

* The cleric side (`side_down`) and the Larum aftermath are lint-clean but not played to the grave; the test plays `side_up`. The shipped-warrior test plays the ice burial only, and the salute's failure branch (`saluteFailed`, `bear_cuff`) is not played.
* The Old Ice test depends on a seed in which the stair search succeeds (`q2`/`q3`); a failed search is one-shot in the original data.
* No mage or monk voice; no second grave-site for a company without a cleric (they still choose by topic, as before).
