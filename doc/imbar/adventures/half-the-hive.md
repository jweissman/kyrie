# Half the Hive: ledger for the broad pass

*Branch `adventure/imbar-deep-time`; brief `doc/imbar/14-bible.md`. New data: `data/adventures/half-the-hive/wake.kyr` (about 130 lines), added to `module.json` and `placed.json`. No other adventure file was touched. The seventh Leaving is eighty-one years dead in the Gallowtree and the Leaving's origin is left unexplained.*

## The ledger (14.1)

| | |
|---|---|
| **Count** | The Leavings: the Brow remembers six and does not say the seventh. |
| **Keeper** | The Cappers (the board in the Capped Gallery); today Tobit Mellor's line. Kestrel Dunn keeps the Searchers' count, Hannet Coke the one nobody asked her for. |
| **First page** | Where the Leavings came from (never explained), and what became of the seventh. Before this pass the Brow had *forgotten* it; now the Brow visibly *erased* it, and a company that goes looking can read where. |
| **Price of reading** | Hannet stops dancing; Merrit must be capped in someone's wax; the white comb cannot serve both the dead and the Stair; whoever tells the Drewes loses the factor's goodwill. |

## Acts and scenes

1. **The Notice** (Smoke End): the Smoker's Rest (Martin Sayle), Nell Quarrie's shop, Thorle's smithy (Hild), the Leavers' Market (Crispin Polglaze, the Drewes). *New:* the factor's slate (Sixways, Larum, the Measures' stamp) and the filed pan.
2. **The Searching** (the Scenting House, the Apron, the Dancing Hall): Elspet Garnock, Doll Rowntree, Kestrel, Hannet, Moss. *New:* the seventh run cut low by the door, smeared; (the kept lantern is cut).
3. **The Comb** (Brood, Stores, Crown): Agnes Mellor, Huw Penry (the comic contrast scene, already there), Eben, Linnet, Pim. *New:* the Cappers' board with a smoothed seventh place; the carrying office.
4. **The Calling and the Leaving** (the Hall, then the four sites): unchanged.
5. **The Daughters and the Turning-out** (royal gallery, the Escort, Ivo): unchanged.
6. **Out on the Wold** (a side-act, any day): the bothy (banked fire, the lintel quarrel), the honey linden, the Gallowtree and its knoll, the Dell, the Toot. *New:* the staged east road on the knoll, Merrit's capping.

## What changed, before → after

* **Characterization in play.** Crispin Polglaze (want: a price; fear: being seen to be one; lie: "I am not a bad man"; does when pressed: offers a hush of four coin with a smile) and the Drewes' mother (when told: packs, and withdraws her stock). Hannet's reply to Merrit's capping differs by wax.
* **Companion arc (14.4.3).** Five calling-keyed voices, each at its own room and each saying something only that calling would: cleric (the Capped Gallery: the dead are kept standing), ranger (the knoll: the cart-road that goes east and stops), thief (the Leavers' Market: the filed pan), warrior (the sett: the sow's reach), bard (the Dancing Hall: six dances scan, the seventh has had its breath taken out). 
  * **Calling-unique way through:** only a cleric can say the lowland *carrying* office to Linnet, which wins leave for Agnes to carry Tobit without anyone having sat the dark watch (`say_carrying_office`). Before, the only road was the watch and the moth.
  * **Choice with consequence:** only a cleric can cap Merrit Coke, and must choose the wax: the seventh Leaving's own white comb (which Eben's Stair also needs, and there is only one cut), or Brow wax (which makes her the Brow's, after eighty-one years of nobody's). Neither can be undone; Hannet answers each differently; the account closes with a different line. A second choice, for the thief: take Polglaze's four coin or tell the Drewes (not both).
* **Lone-company route (review pass).** The shipped party is Wren the ranger alone. With no cleric in the company, `cap_merrit_white_unsaid` and `cap_merrit_brow_unsaid` let anyone with the wax cap Merrit with their hands and no office; Hannet asks who spoke for her (nobody did) and the account has its own line (`fate_merrit_u`). The choice of wax survives; the office does not. The cleric's versions stay the best, and say the words. The lantern at the foot of the stair, and the ledger's earlier claim of it, are cut.
* **Danger with two exits (14.4.4).** Already present and checked, not added: the brocks (the old gift, fire, Moss waiting), the moth (keep still, the sting), the black bees (smoke, the shepherds' drove). Each already has two noncombat exits.
* **Depth beyond the frame (14.4.5).** The seventh run smeared by a thumb; the Cappers' board smoothed over M. COKE; the bothy's banked fire and the lintel ("HE WAS RIGHT ABOUT THE SHEEP"); the filed pan under the Measures' stamp.
* **Links (14.4.6).** Out: Sixways (the Haskett cart asks for the candles *unlit*), Larum (nine bundles for the parson's vigil), the Collegium of Measures (the stamp; weighs, as the bible rules). A Lull trade read in the other direction is in `the-lull/fellowship.kyr`. In: the candles are the hook, and the Hume cart already runs to Sixways and Larum.
* **Tone (14.4.7).** Huw Penry's mead is the comic scene in a grave adventure (existing); the taproom was not given a second.
* **Foreshadow and payoff (14.4.8).** Early: the smeared seventh run, the smoothed place on the board. Last act: the fate line for Merrit, whichever wax. Only if you looked: after the Gallowtree, the same wall reads *west*, turned round by a hand; the board gives up M. COKE under the thumb; the ranger's road says the east was *laid*.

## Tests

`test/half-the-hive-revised.test.ts` (five `it`s; the first four use the five-calling fixture `test/fixtures/half-the-hive/company5/` and `revised.campaign.json`, and move by `>place` steps): every voice; Polglaze/Drewes exclusive; the cleric office with a lone warrior as control; Merrit capped in the white and the fate line at the account. The fifth plays **the shipped campaign** (`half-the-hive.campaign.json`, Wren alone): Examines the bones, takes the bee, climbs for the white comb, caps Merrit with no office, gives the bee to Hannet, and reads the account's line (no `give`, no `assert`).

## Honest shortfalls

* The shipped campaign is still Wren alone (`company.kyr` says `of 1`); I did not change it, because every existing journey is keyed to it. The cleric's calling-unique beats (the carrying office, the words over Merrit) are locked for that party; its route is the wordless capping above. The rest shows in a drawn world's company (`placed.kyr`) and in the fixture.
* No mage or monk voice. No second comic scene. The ranger's staged-east finding has no mechanical consequence beyond `east_staged`; nothing reads it (it is there to be known, and to colour Kestrel's report).
* `company3/module.json` was not given `wake.kyr`; `company5` has it.
