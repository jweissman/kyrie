# The Liberty of the Ice: the broad pass

*Revised against `14-bible.md`. Data only: `callings.kyr`, `deeper.kyr` (new); three Saffery topics gated in `drowned.kyr`; `module.json` and `placed.json` list the new files and name `slack_opened` in `canon`. Tests: `test/liberty-of-the-ice-callings.test.ts`.*

## The Account

| | |
|---|---|
| **Count** | The Watermen's **Book of Frosts**: seven frosts in two hundred years, and in four of them the wolves came down. Against it, Harker's hiring ledger: nine years of heads, "farm in the hills" and, in pencil, "Gallowmoor, eight coin". |
| **Keeper** | Gaffer Tredgold, for the Company; the Company, for the river. (Harker keeps his own; the verger keeps the Saint's scales; Widow Saffery keeps a lantern.) |
| **What it is a count of, really** | The keepers think it is weather. It is what the river did with what was shaken on it: a Reeve hanged for landing a hand, a Fair sent out to sea with an alderman's son on it. Harker's count is of hands. |
| **First page** | The first leaf of the Book has been cut out (`tredgold_stub`): eight leaves in the gathering, seven frosts. Tredgold's father said Reeve Aldith cut it before she had written a word. It is not a wolf leaf. |
| **Price of reading** | At the Landing a reading aloud is never free: a hand is landed or goes out with the river. Harker's candle (`harker_weight`) tells him someone knows the Weight; the Lisk Wife's office costs a night hour in the cold and an old woman's reason for walking alone. |

## Acts and scenes (each with a place and a face)

1. **The Liberty** (first morning, hard blue frost). North Bar broadside; the Cheaping; Swan Stairs and the plank (Mother Gage); Freezeland Street and the Glove Post, boys on sheep-bone skates *(new)*; Court of the Ice (Justice Broom, Callow charged); the Scale Church (Amos Tallis, the scales, the fish and the flame *(new)*).
2. **The Flock That Is Not** (days one and two). Fleece Row and Harker's counting-house (Harker, Kemble); the Hiring Ring (the warrior reads the Ring *(new)*); Hawsfold; supper; the Frozen Lamb and the Liars' Bench (Bel; the bard's "stone in the plum" *(new)*).
3. **The Drowned** (second morning, fog). The hats on the Black Reach; Widow Saffery's rope-walk (the thief's board *(new)*); the starling cellar (Polly); the hulk Patience (Dickon Cobb); the Watermen's Hall (Tredgold's stub, the left glove *(new)*); the Spotted Calf (Nab Pollard's egg *(new)*).
4. **The Night on the Ice** (second night). The bondhouse and the iced bar; Fowke and Kemble's key; the searchers, now with the Lisk Wife's office as a third way *(new)*; the wolves on the sledge road (fire, offal, downwind, face them, the sledges); Tredgold's sledges.
5. **The Landing** (last day, thaw-wind). The wedding; the Landing, case by case; the ice goes out; the morning's news, which now returns the bone skate and Harker's candle *(new)*.

## What changed, before → after

| Checklist | Before | After |
|---|---|---|
| 1 Acts and scenes | Clear (the synopsis names five acts); several rooms had no face | Acts mapped above; every new beat is attached to a place and a face |
| 2 Characterization | Harker, Ursel, Callow, Tansy well drawn in dossier and in play | Harker pressed with the Weight (`harker_weight`): he does not turn his ring, and says it would be paid "if I knew to whom it was owed"; Saffery pressed by an unasked thief: the wheel stops once, and she walks away from them without a word |
| 3 Companion arc | Calling used only as skill (`capable`); no voices | Six calling-keyed voices across the acts (cleric at the scales, warrior at the Ring, mage under the Glove, bard at the Lamb, thief on the boards, ranger at the tracks); a **choice with a consequence** (thief lifts the board: the cellar now, the widow's trust never; or the widow's trust, and the office); a **calling-unique solution** (below) |
| 4 Danger with a way round | Wolves had six exits, searchers four | Searchers gain a fifth: the Lisk Wife's office; none removed |
| 5 Depth | Rich | Cut leaf in the Book; the left glove; the Bankside egg on a spoon (two hundred years of a toll); sheep-bone skates scraping; the Collegium of Measures' brass ell in the Exchange floor; the fish and flame in the pivot of the Saint's scales |
| 6 Links | Few outward | Fish-and-flame (an Aenean keepers' device, explained nowhere; the verger says *keep*, the factors say *owe*); the Collegium of Measures at Sennet (weighs, as against Veyra, which teaches: Tredgold's "canon from Veyra"); a Founders' Exchange board by the Exchange door (inward hook: its carter would come up the North Road); `befell(slack_opened)` read at the Calf (a drover's rumour of a stair under the House of Doors) |
| 7 Tone | A farce with a grave core | The grave scene: the office for Davy Saffery at the hole on the Black Reach (the kept light motif: the lantern; a second light, a child's hand high, for the length of the words) |
| 8 Foreshadowing | Present | **Always pays:** the bone skates on the first day return in the morning news as the small brown skate in the weed at Swan Stairs. **Only if looked for:** the Weight (the candle, the verger, a cleric's reading) returns in the same news as a second pound of wax, or a candle in the thaw |
| 9 Playability | Complete | All new actions are reachable and tested; no new item (nothing given by `Assert lends`, no `j.give`) |

## The calling-unique solution: the Lisk Wife's office

The searchers can be bought (nine coin), lied to (Kemble), met, fought, or slipped. Only a **cleric** can say the office for the drowned at the black hole for Davy Saffery (`read_office`, needing `saffery_davy` and the dark, with Widow Saffery on the Reach). She does not stop walking; she stops walking alone. On a search night the lanterns that come down the Reach stop at the rim of hers, a waterman takes off his cap, and the dog goes with them. The same actor cannot also be the thief's accomplice: if the board was lifted unasked, the widow will not be asked about Davy.

## Links

In (what would bring a visitor from elsewhere): the Founders' Exchange board by the Exchange door; Garthwaite and Swale Head hired children who walk down for the spring hiring. Out: Sennet (Measures' ell; `befell(slack_opened)`), Veyra, the Founders' Exchange, and the fish and flame. No flag is set for another module to read by name.

## Tests

`test/liberty-of-the-ice-callings.test.ts` (12): the voices once each, the ranger's, the Weight told to Harker, the two doors to the cellar, the office (only a cleric; searchers diverted; the news), the news without it, the affront shutting the office, Tredgold's stub/glove and Nab's egg, the Exchange floor, the Calf with and without `slack_opened`. Existing `liberty-of-the-ice*.test.ts` re-run at the end (see report).

## Honest shortfalls

- The standalone campaign's company is `of 1`: voices of several callings together could not be tested in one party. Each calling is tested alone (friction file).
- The preset bard (Tamsin) has a voice and a hint at the bench; the bard-unique solution is the existing bear-ward's tune in `bear.kyr`, not new.
- No new persons: characterization was added to Harker, Saffery and Tredgold in play, not by new dossiers. Ursel, Dickon and Tansy were not retouched.
- Wolves: the ranger's voice makes them stranger and explains nothing, on purpose.
- Not played end to end through the world variant (`placed.json`) beyond the existing placed test.
