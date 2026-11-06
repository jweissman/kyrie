# Behind the Wainscot: broad-pass ledger

*Adventure `data/adventures/hollins/`, campaign `hollins`. Already 2,130 lines of ten-day, many-threaded domestic book. The layer is `winders.kyr` (112 lines), loaded **before** `endings.kyr` so its fate lines win their slots.*

## The Account

| | |
|---|---|
| **Count** | The days the Long Clock has stood at **ten past four**: three hundred and twelve years of them. The Winders have painted the hands, over and over, on the back of the case, in rows of twelve. |
| **Keeper** | The Winders: Prior Tobit Hale (who oils and does not wind; wants her to know someone kept faith) and Sister Verity Cogg (who will jam the strike train rather than let the Day end). |
| **First page (missing)** | A girl of eleven, sent out of the house at that minute, who stopped the clock with her finger "so that it would be the same day when I came back", and meant to scratch her **twelfth** notch on the plinth when she did. Eleven notches and a blank are at the foot of the Clock (behind the Winders' curtain). |
| **Price of reading** | The Winders' whole belief. The Prior pays it gladly; Verity cannot until she is read the Child's diary. Reading it to the Lady costs the Lady her last secret, and she gives her chart of the coast away. |

## Acts and scenes

Told in the book's own `Chapter`s: **Bootscrape** (Jory Mudge, Hob Ludd, Widow Arkle, Mr Salcombe); **I. The Ratcatcher** (the Hall, the Letterdrift, Faith Penny, the Long Clock and the Winders, Ma Riser's ladders, the kitchen and the Jarl's Pantry, the Library and Sorrel); **Ten Past Four** (the Clock strikes); **II. The Thaw** (the Hearth and the colliers, Bet and Nan; the Skirting, the Nail, Ottoline Fogg's market, the Bell Walk; the nursery and the Small House); **III. The Smoking** (Mrs Pyecroft's sulphur, the Jarl's poison, the Tin Regiment's march); **The Last Night** (the counterpane, the gathering, the Little Ship).

## What changed (before → after)

* **Calling voices** (new, `winders.kyr`): twelve rules across five scenes: **warrior** at the Long Clock, the Hall floor, the Fort and the deathbed; **cleric** at the Clock and in the kitchen; **thief** at the Clock and the pantry door; **ranger** in the Hall; **bard** at the Fort and the counterpane; plus **Nan Collier** as a companion voice under the Clock.
* **Calling-unique solution (warrior)**: `order_stand_easy`. A warrior who has the Regiment's word and its orders can give the order the Captain knows the form of ("Regiment. The war is over. The Colonel is home. Stand easy."), standing the Regiment down **long before** the Lady can (her route needs `ladyKnows`). It costs something: the nightly tin drum stops in the Skirting, and the children lie awake (`skirting_no_drum`); a fate line reads the order (`fate_regiment_word`).
* **First page / foreshadow and payoff**: the Clock case shows 11 painted hands and a pencilled twelfth; searching the foot of the Clock finds the eleven notches and a space (`notch_tally`, **only for a player who went looking**). Told to the Lady (`lady_notches`) she says what they are, and **gives her chart of the northern coast** (`Give`, a `map` kind). After her death the Prior scratches the twelfth with a pin from her workbox, in a fate line.
* **Depth, not on the path**: *the Quiet* (the Button Market drops its awnings for a minute at ten past four); the Readers' lost leaf of Volume T ("Time is that which...") that the Jarmen used to wrap honey-cakes two hundred years ago; the smell under the Clock (whale-oil, wet wool, and boiled sweets no one can account for); the cat's claw-marks scored in the Hall flags, four to a stroke.
* **Contrast**: Ottoline Fogg's weekly **button auction** (a gavel that is a pickle-fork; a lady who has not been bidding is sold a button the size of a tea-tray), a comic scene in a gentle house.
* **Links**: out, the Lady's chart is of the northern coast with a tower and a lamp "KEPT, BY SOMEONE, FOR NO ONE I KNOW" (the Pharos, the kept light); a pilot "off the southern coast, a lamp-keeper's cousin" comes once a year for a chart (Jory); the Lady's chart takes a **world event**, `befell(rose_made_whole)` (`canon` extended in `module.json`/`placed.json`): a compass rose drawn whole in the corner, "made good this season, by someone else". In, a stranger starts at Bootscrape: the post goes by the Slot and the Slot goes by the village.
* **Danger with two noncombat exits** (already present; verified): the **cat** (bell it, catmint, keep to the Letterdrift by night); the **fire** at the Hearth (warn Bet; urge her; the colliers' evacuation); the **poison** (spill the sugar; stop Hasp; empty the pot); the **Tin Regiment** (the Lady's word, or now the warrior's order; or wind them with Fennick).

## Characterization

| Person | Want | Fear | Lie | Surprise when pressed |
|---|---|---|---|---|
| **Prior Tobit Hale** | that she should know someone kept faith | that the Day was never a day | "I need no thanks" | takes a coil of rope for the weights: "Every Sunday. Forty turns. I shall need a team." |
| **Sister Verity Cogg** | the Child, still coming | the stranger upstairs | "the Child is still coming" | lays down the giant's pin and laughs: "it's today" |
| **Captain Ordinance** | the Colonel's word | being taken for Mother's | "THE REGIMENT NEVER STOPS" | sits his Regiment down at a soldier's order |
| **The Lady (Miss Whitbread)** | to be seen as she is | that she is mad | "I thought it was my own fault" | gives away her happiest chart to someone who has been to look |

## Companion arc

The preset party is a lone **warrior** (Wren). Companions in play: Nan Collier (hearth to Small House), Fennick (the Regiment's winder), Sorrel (Reader), Mr Salcombe. The warrior's order is calling-unique; the consequential choice is Fennick's/the Regiment's (wind them for another day, march them on Mrs Pyecroft, stand them easy by the Lady's word, or by a soldier's).

## Tests

`test/hollins-winders.test.ts` (new, 5): the voices and the notches found by searching; the warrior's order (and its absence before the Captain gives his orders); the Lady told the notches (map held, twelfth notch fate); the Jory topic. Existing `test/hollins*.test.ts` run unchanged. `bin/kyrie lint`: 0 errors, 0 warnings.

## Honest shortfalls

* `lady_regiment` is not offered once `standDown` holds, so a company that gave the order cannot also have the Lady's word; the Lady never learns the Regiment was waiting for her.
* `skirting_no_drum` and `fate_regiment_word` are prose consequences only; no later rule reads `orderedEasy`.
* The `chart_rose` world-event read is not tested (needs `assert befell`); the Jory topic is tested.
* The cleric and thief voices are barks; only the warrior has a unique solution.
