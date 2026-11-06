# What Tessary Owes: ledger for the broad pass

Register: a city of seals and queues, going to the sea. Revised against `doc/imbar/14-bible.md`. Data only; no `src/`, no shared
files. This adventure had a long design set (`doc/adventures/what-tessary-owes/`), a lore file and voices of a different kind
but no ledger in `doc/imbar/adventures/`; this is that ledger, and the third pass (the thief's ear and his way on the quay,
papers from elsewhere) is recorded here. A setup a test asserts rather than plays is labelled **asserted**.

Files written this pass: `data/adventures/what-tessary-owes/callings.kyr` (added to `module.json` and `placed.json`),
`test/what-tessary-owes-company.test.ts`, `test/five-links.test.ts` (shared), additions to `lore.kyr`.

## The Account

| | |
|---|---|
| **Count** | The Long Muster's oaths, eight thousand of them, weighed on the Balance and held as the collateral of a war note. |
| **Keeper** | The Scruples, the drowned city's clerks' descendants, who cannot lie; the Ninth Valuer, who walks the Withies with a ledger. The Comptroller (eldest of them) drew the note. |
| **First page** | The compact of the drowned city and its default, in the Room of Defaults, in the Comptroller's own hand. |
| **Price of reading** | The note is called: the Muster's oaths fall into the Holding if the principal cannot be paid in a promise of equal weight. |

## Acts and scenes

Five movements on a fortnight of spring ebbs (`doc/adventures/what-tessary-owes/03-revised-design.md`), not gates:

1. **The Homecoming**: the Landgate, the Withies (the eel-wife, Wick Teazle), the Muffled Drum (Hannelore Rackham, Sergeant Durrance), Scriveners' Row and the Office of Seals (Ulric Deckle), the Exchequer (Josiah Quire), Panhythe (Factor Imma Sault), the Terraces.
2. **Lowtide**: the Watersteps and the Swatch Stair, the Weed Colonnade, the Drowned Forum, the Street of Scales, the ebb-runners' landing (Bettany Slake), the bath-house, the aqueduct, the Hall of Oaths.
3. **The Strongrooms**: the weighing floor, the Room of Defaults, the Gallery of Pans, the Weights, the Comptroller.
4. **The Feast Approaching**: the Council, the Board, the vote, the Muster.
5. **The Holding**: the white floor.

## Before and after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | As above | Unchanged |
| 2 Characterization | **Sergeant Durrance**: *wants* her Third Company home; is uneasy at the stone she swore on ("Now I know what I swore on", `durrance_hall`); *surprise*: on the seventh night she walks barefoot to the Steps in her sleep, and either the drum or a hard hold stops her (played: "the Release"). **Factor Sault**: *wants* to buy the note and govern with the Muster; *lies* "I keep the money at the pans" (`strongbox_seen`); *surprise*: she seeks the company out on the Tidewall at dusk and speaks of her father (played) and pays twenty coin for what is taking her lads (played). **The Valuer**: cannot lie; *wants* the record true; *surprise*: balances the pans "as a child of seven does", and states the city's affairs to the Board, which cannot call them a liar (both played). | Unchanged; already shown in play |
| 3 Companion arc | The Valuer and Durrance travel with the company, with events at most places they pass (`voices.kyr`). No calling-keyed beat | **Voices, four, for a thief:** the Factor's strongbox, the Office of Seals' queue, the Withies' doors, the ebb-runners' board (`callings.kyr`, played). **Unique solution:** the thief reads the board and passes (below). **Consequential companion choice:** Durrance on the seventh night (hold her, or beat the stand-down on the drum, or neither): the drum is the road for a company that cannot throw her; "the Release" ends on it. Played, in `what-tessary-owes.test.ts`; not new in this pass. |
| 4 Danger with two exits | The ebb-runners: pay five coin, say you work for the Factor, take the letter by telling Slake what her letters are for (played), or be beaten and dumped on the Pans | A fourth: the thief's sign |
| 5 Depth | The flood and the Swatch; the eel-mother at the foot of the Stair (played); the Forum under the Legion Yard | **New, off the path (played):** the smell and sound of Scriveners' Row (reed-paper drying, three hundred nibs) and the lintel of the Muffled Drum, cut with a dozen sets of initials and the words HELD. QUIT. |
| 6 Links | `lore.kyr`: the queue's rumour of a ship (`remainder_harboured`); the Valuer reads the Prefect's writ; Sault's sealed packet for Tolleth (`exchange_ledger`); Pym | **New, played in `five-links.test.ts`:** the Valuer reads Skeel's keeper's rubbing; Ulric Deckle reads the Collegium's letter (Low Water); Lemuel Pitch reads the bell-teeth (Long Man). **Gives** `surety_terms`, read by Mother Ysolt (Long Man), Mother Jago (Skeel) and the Registrar (Low Water). |
| 7 Contrast | A grave adventure; the Muffled Drum and the Office of Seals' queue are its comedy | Unchanged |
| 9 Playability | n/a | `what-tessary-owes-company.test.ts` (4) |

### The thief's sign

`chalk_the_sign` at the ebb-runners' landing: a thief reads the board of notches by the tunnel mouth as a tally of who may pass
and answers it in the same cant; Bettany Slake and the runners tolerate the company (`slakeLetsPass`), without five coin and
without working for the Factor. Nothing is stolen; a lockbox picked in her sight is still her quarrel.

**Played** (`what-tessary-owes-company.test.ts`): the shipped campaign, Ivo alone, no give/put/assert: the Landgate, the Withies,
the Watersteps, the head of the Swatch, wait to the ebb (watch 156), down, the Weed, the Forum, the Street of Scales, the
ebb-runners. Both "Chalk the quay's own sign" and "Pay Bettany" are offered; the sign is chalked; the purse is the same; Slake and
the runners tolerate the company; the payment is no longer offered. Picking the lockbox in plain sight afterwards still makes Slake
hostile (asserted *true* in the test: the sign is a pass, not a licence). A warrior at the same quay is offered only the payment.

**Lone-company route.** The shipped company is a lone thief, so the sign is the shipped route, and the five coin the route for
anyone else.

## Links, in and out

- **Out (world event):** `remainder_harboured` at the Office of Seals' queue (**linted only**, not played).
- **Out (items):** `prefects_writ` (the Valuer; played, `lore-links.test.ts`); **new:** `tally_rubbing`, `collegium_letter`,
  `bell_teeth`.
- **Gives:** `surety_terms` (to the Grand Tour's Remainder, and **new** to three others), `exchange_ledger` (Sault's packet, played
  in `lore-links.test.ts` in a generated world).
- **Inward hook:** the Orsett factors, the packet for Captain Bascom; Pym's chain.

## Tests

`what-tessary-owes.test.ts` (26), `what-tessary-owes-wander.test.ts` (4), `what-tessary-owes-company.test.ts` (4, new),
`five-links.test.ts` (3 of its cases are Tessary's), `lore-links.test.ts`. Lint: 0 errors, 0 warnings (17 advice items).

## Honest shortfalls

- The thief's way is a pass, not a plot: it does not get the letter. Slake still gives it only to someone who tells her what her
  letters are for.
- The consequential companion choice (Durrance) predates this pass.
- Only the thief hears the four voices. No voice exists for any other calling in the shipped campaign because it has none.
- `Josiah Quire` and the Grand Tour's `Josiah Pumphrey` share a first name; their ids are pinned by tests (`quire` in
  `what-tessary-owes.test.ts`) and were not renamed.
- The Strongrooms' Room of Defaults has a lock a thief can pick (`lockwork`), and also a way the Valuer opens it; I did not add a
  test of the pick, so that second thief route is unplayed.
