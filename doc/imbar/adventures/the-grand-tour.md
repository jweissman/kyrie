# The Grand Tour: ledger for the broad pass

Register: comedy of manners in three storeys, with a fall from a balustrade in the middle. Revised against
`doc/imbar/14-bible.md`. Data only; no `src/`, no shared files. This adventure has a large design set
(`doc/adventures/the-grand-tour/`, with a second pass in `12-second-pass.md`) and a lore file, but no ledger in
`doc/imbar/adventures/`; this is that ledger, and the third pass (the bard's ear, the Quay's song and the North Wind) is
recorded here. **The Slack material in `hours.kyr` and `remainder.kyr` is not mine to this pass and was not touched or
re-audited.** A setup a test asserts rather than plays is labelled **asserted**; nothing in `the-grand-tour-company.test.ts`
is asserted.

Files written this pass: `data/adventures/the-grand-tour/callings.kyr` (added to `module.json` and `placed.json`),
`test/the-grand-tour-company.test.ts`.

## The Account

| | |
|---|---|
| **Count** | The Roll of the Grand Tour in the Hall of Doors (five Tours in three hundred years, the last "DECLARED NOTHING"), and the Rose of the Winds, whose four petals each court gave away or lost. |
| **Keeper** | The Rector of the House of Doors, Magistra Isadora Quance, who keeps the Roll and wants to be first through the Door. |
| **First page** | What is under the black square beside the Door of Doors (the Slack: not this pass's). |
| **Price of reading** | The Door opened below: the Undertow opens the Door of Doors from underneath (`the-grand-tour-outcomes.test.ts`, "the Undertow"). |

## Acts and scenes

Seven `Chapter`s in `clock.kyr`, one a day: **The Coast Road**, **The Courts**, **The Letting-Down**, **Ascension Day**, **The Morning
After**, **The Divers**, **The Keel**. By storey: the Quay and Lamp Street (Old Bethan, Peg Arklow, Mr Pumphrey, Prue Quickly,
Fabian Murrey), the House of Doors (the Rector, Mr Tolley, Dr Cole, Mr Threlkeld), Cloudgate (Lady Imogen Halyard, Aubrey, Jem
Tuttle), the Whelm (No Admittance, Ha'penny, Mercy, Perrin Halyard), and the planes: Fire (the Hour Court), Earth (the Slow
Assembly, Chert), Air (the sylphs, Tramontane).

## Before and after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | As above | Unchanged |
| 2 Characterization | Done in the second pass (`12-second-pass.md`): the Rector's history in the Courant, the Dowager with a mirror, the Sexton, a wrong answer. In play: **Lady Imogen** kneels and is sorry (`the-grand-tour-outcomes.test.ts`, "the Keepsake"); **the Rector** takes all four petals, goes through first and does not come back ("the Rector's Door"); **Aubrey's** own story, carried to Sergeant Bassett, puts him in the Watch-house and pleases the Rector ("the wrong answer", `the-grand-tour-second.test.ts`). **Tramontane**: *wants* her to have meant it (`tramontane_want`); *fears* that he was a lever ("I gave her my heart and she used it as a lever", `tramontane_ysabeau`). | **Tramontane's surprise, in play:** told the Quay's song of the girl who never went back up the arch but left her window latched to nothing every night of her life, he decides that she meant it and renews the gift (below) |
| 3 Companion arc | The shipped bard is alone. Gates for each calling are tabled in `07-builds.md` (persuasion, lore, rites, lockwork) and played for bard, warrior, cleric, thief and monk | **Voices, four, for a bard:** the Quay's street-cries, the Roll's "DECLARED NOTHING", the drowned street's signs, the Balustrade with no echo (`callings.kyr`; all four played by the shipped bard in one run). **Unique solution:** the Quay's song for the North Wind. **Consequential companion choice:** the four ways to the North Wind, below |
| 4 Danger with two exits | The Sexton fights up the tower at the wrong hour and lies still at the turn (`the-grand-tour-second.test.ts`); the Weights; the Hour Court's Lists | Unchanged |
| 5 Depth | `history.kyr` (the Roll, the Museum's labels, Lir's register, the merfolk's English, the Rector's keys) | **New and off the path:** Old Bethan's last verse; the unlatched casement in Halyard House's drawing room, which a footman shuts every evening and finds open every morning |
| 6 Links | `lore.kyr`: the Roll chalked or pencilled when the Slack's ship has been harboured or kept; Orrel Sabe's title; the ship's name | Four of the other five read this adventure's events: the Long Man (`slack_opened`, `remainder_harboured`), Skeel (`remainder_kept`, `slack_opened`), Low Water (`slack_opened`), Tessary (`remainder_harboured`) |
| 7 Contrast | The adventure is the comic one; its grave scene is the funeral on the Balustrade and the drowned church's bell | Unchanged |
| 9 Playability | n/a | `the-grand-tour-company.test.ts` (3) |

### The Quay's song

`bethan_ballad` (Old Bethan, daytime): only a bard asks whether the song she hums over the eels has a last verse, and she gives
it: the girl from the hill, who never went back up the arch but left her window latched to nothing every night of her life, and
her daughters after her (`ysabeau_ballad`). The casement is seen in the drawing room (`casement_unlatched`, anyone, `casement_known`).
`sing_to_the_wind` at the eyrie, once Tramontane has been heard: a bard with both facts sings it; the gift is renewed
(`giftRenewed`) as it is by the letter or the Dowager's apology, and the petal stays in the keel. The Air petal is *not* taken
home.

**The four ways to the North Wind's answer**: Ysabeau's letter (a thief picks the Dowager's escritoire by night, or the Dowager
gives it once sorry; "the Letter"); Lady Imogen's own apology (she goes up with the company, `halyard_sorry`; "the Keepsake" plays her sorry); the petal returned
(Cloudgate comes down, "the Coming Down"); and, new, a bard's song. Only the last needs a calling and no object.

**Played** (`the-grand-tour-company.test.ts`): the shipped campaign, Tamsin alone, no give/put/assert, on the `tour` fixture
route (fire, earth, whelm, cloudgate), then the Quay at midday, Old Bethan, the winch and the Balustrade to the drawing room,
Imogen, the Wind Court, the Gallery, the eyrie, Tramontane's first two answers, and the song. `giftRenewed` is true, `airHome` is
false, no letter is carried, Imogen has not been sorry. A company of one thief is not offered the verse at the Quay.

**Lone-company route.** The shipped company *is* a lone bard, so the song is the shipped route; a thief's route is the letter
("the Letter"); a warrior skips the Air altogether (the Undertow).

## Links, in and out

- **Out (world events, from the House's Hall):** `remainder_harboured`, `remainder_kept` (`lore.kyr`; 15-lore-ledger notes these
  are **linted only**).
- **Out (items):** the Slack reads `sluice_rod`, `keeper_mask`, `prefects_writ`, `collegium_letter`, `surety_terms`,
  `tally_rubbing`, `pharos_lens`, `watch_tally` (15-lore-ledger 2.2; not re-audited, because `hours.kyr`/`remainder.kyr` are not
  mine).
- **Inward hooks:** a visitor with a Prefect's writ, a rubbing or a letter is the Slack's concern; a visitor with a **bard** now has
  a reason to come: the Quay's song.

## Tests

`the-grand-tour.test.ts` (3), `-outcomes` (11), `-builds` (3), `-placed`, `-second` (6), `-autoplay`,
`the-grand-tour-company.test.ts` (3, new), `the-slack.test.ts`, `lore-links*.test.ts`. Lint: 0 errors, 0 warnings (31 advice).

## Honest shortfalls

- The bard's unique solution leads to the same state as two other ways. It adds a way; it does not add a consequence. A
  company that sings leaves the Dowager unapologised-to.
- The casement is seen by every company in the drawing room; the verse is the bard's. Both are needed. The test of "verse without
  casement" could not be played, because the shipped `cloudgate` fixture phase already passes the drawing room.
- No new contrast scene and no new foreshadowing were added.
- `Tamsin Quaye` shares a name with the shipped bard (`Tamsin`) and with other adventures' lone heroes. Her display name is pinned
  by `gifts.test.ts` and `the-slack.test.ts` and was not changed.
- The slack material is unaudited here.
