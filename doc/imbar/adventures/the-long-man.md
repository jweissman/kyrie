# The Long Man: ledger for the broad pass

Register: pastoral, with a drowned town under it. Revised against `doc/imbar/14-bible.md`. Data only; no `src/`, no
shared files. This adventure had a charter, a bell and company voices from earlier passes but no ledger file; this is
that ledger, and the third pass (company, ranger's drain, priest and reeve, links) is recorded here. Claims below are
checked against the Kyr and the tests; a setup that a test asserts rather than plays is labelled **asserted**.

Files written this pass: `data/adventures/the-long-man/kin.kyr` (added to `module.json` and `placed.json`),
`test/the-long-man-company.test.ts`, `test/five-links.test.ts` (shared with the other four of the five), and one
fix in `voices.kyr`.

## The Account

| | |
|---|---|
| **Count** | The notches in the keeper's niche, which stop at forty-one, and the tally on the door-post of the last house in the drowned town, which stops at the same number. The Hesk meant to come back. |
| **Keeper** | The Mower, who cuts the saplings on the crest and goes after its bronze. Aldous Venn keeps the Hall and its key; Mother Ysolt the chapel and the font; Gammer Coller the dyke-reeve's rod. |
| **First page** | Why the last house was barred from outside with a table laid for four. The dale's own account of the wall is the framed charter in the steward's study (the Hall is given the keeping, *non dominium sed custodia*), which three centuries of lords have read as a holding. |
| **Price of reading** | The Mower's grey face is a standing. Levered off by day it lays the keeper, and the wall is left with nobody to keep it (`the-long-man.test.ts`, "lays its keeper by day"). Telling the priest what the font measures gets Merrow up the Hall lane when the bell rings (`the-long-man.test.ts`, "gets Merrow up the hill"); showing Venn his own ledger sends him downriver on the Heron. |

## Acts and scenes

There are no `Chapter` objects; the dale runs on three days and the clock (the storm at watch 312, the wall breaks at 396).

1. **Day one, the green and the Hall** (watch 0-96): the green and the well (the people of Merrow), the Drowned Ox (Martin Pask), the chapel and its font (Mother Ysolt), Teller's mill (Hob), Gammer Coller's kitchen, the Hall yard (Dunnet, the covered cart), the study (Venn), the cellar. Night one: the Mower comes down for its bronze and turns the cart over.
2. **Day two, the hill** (96-216): the crest, the gauge stone and shaft, the grey gallery, the niche, the sluice chamber, the wet gallery (the Wet), the springs, the low field, the mill landing (Cass Rowell's barge Heron, 168-204), the Hollow Door. And the lake: the punt, the Water-House, the drowned street, the face-house, the last house.
3. **Day three, the storm** (216-432): whatever was done; the wall holds or breaks.

## Before and after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | As above, each with a face | Unchanged |
| 2 Characterization | Venn: *wants* the Chancery suit paid for and the Hall kept; *fears* the suit being lost in the Chancery, and the Hall with it; *lies* "old metal, nobody had a use for it" (`venn_bronze`); *surprise*: read his own charter he sits down, hangs up the key and writes to Dame Isolde that he has been a fool (`venn_charter`, tested in `the-long-man-charter.test.ts`, "the ordinary Venn in the Lord's debt"). Dunnet: fears the wet gallery, is bought by an arm bound properly (tested). Hob: confesses the spade-cuts. | **Ysolt**: *wants* the parish safe, *fears* that if the king is taken from them they will have nothing to be careful of, *lies* "he was a king and cruel, the notches are sins"; asked what she will preach, she says she will tell the parish the font is a measure, and the font shows a chalk line and a child's HERE (`ysolt_sermon`, played). **Gammer Coller**: *wants* a reeve after her, *fears* being the last, *lies* "I do not know what the notches measure"; shown that the rod fits the Water-House wheel she says she has measured the lake at Lammas for forty years and gives the rod away (`nell_last`, played with the lent rod). |
| 3 Companion arc | Six calling-keyed voices and a quarrel between warrior and cleric (`voices.kyr`) | The shipped party (ranger Elen, warrior Bran, cleric Dori) hears three voices (font, crest, cart) and the quarrel: four beats. The quarrel bark **never fired where anyone could hear it**: it was written to be heard at the green but its condition did not say the company was there, so it fired in the galleries when the notches were read. Fixed (`at(party, green)`). **Unique solution:** the ranger reads the ground at the springs and finds the reeve's old drain into the sluice chamber (below). **Consequential choice:** the quarrel, now played both ways (below). |
| 4 Danger with two exits | The Mower: bronze given back, the bell given, the rod, the charter, the key. Fighting it is an option with a standing | Unchanged; the drain is a further way past the Hall's grate and key |
| 5 Depth | Pell's lantern, the toy bell, the moulds in the face-house | **Sensory** (off the path): at the springs by day, a note too low to hear in the back teeth and a smell of a cellar with a bell in it. **History**: two clocks in the Ox that disagree, and a standing wager on the beam. |
| 6 Links | `lore.kyr`: the carters' talk of the Slack and the ship; Mother Ysolt reading Skeel's rubbing; Cattermole | **In:** Gammer Coller reads a letter of the Collegium of Lesser Instruments (Low Water), Mother Ysolt reads the Ninth Valuer's note on a surety (What Tessary Owes). **Out:** the grey mask is read by Parson Hosken (Skeel); the bell-teeth by Lemuel Pitch (Tessary). |
| 7 Contrast | A grave adventure | The Ox's two clocks (`martin_clocks`, played): a comic scene with Pask |

### The ranger's drain

`read_the_ground`: at the springs, a company with a ranger may walk the spring-ditch and find a reeve's drain older than the
Hall's grate (`drain_known`); it opens a passage from the springs into the sluice chamber (`reeve_drain`). The steward's key,
the grate and the steward's ill will are never touched. A company without a ranger is not offered it.

**Played** (`the-long-man-company.test.ts`): the shipped campaign, no give/put/assert: buy a torch, go to the springs, read the
ground, go to the sluice, light the torch. `grate` is still locked, `cell_key` not held, `hostile(venn, party)` false. A
warrior-cleric-thief company at the same spring is not offered the reading. The ordinary way (ask Venn, take the key off the hook,
unlock the grate) is played in the same file.

**Lone-company route.** The shipped company is three. A company without a ranger has the key (any calling); a company of one
ranger has both.

### The quarrel, played both ways

`quarrel_over_bounty` fires at the green once the company knows the notice and the notches. `side_warrior` costs three coin,
pays Dunnet, opens the cellar bar at dark and takes the foreman from the steward's service; `side_cleric` takes time, wakes
Mother Ysolt (she will ring the bell). One answer closes the other (`the-long-man-company.test.ts`: both offered, the taken
one sets `sidedWarrior`/`sidedCleric` and its consequence, the other one is no longer offered). The earlier test of this beat
only walked to the quarrel.

## Links, in and out

- **Out (read of a world event):** `slack_opened` and `remainder_harboured` at the Ox (the Grand Tour's events). Played in
  `lore-links.test.ts` for `slack_opened`; `remainder_harboured` is **linted only**.
- **Out (to an item):** Ysolt reads `tally_rubbing` (Skeel; `lore-links.test.ts`).
- **New in this pass, both played in `five-links.test.ts` (item handed over with `j.give` and company placed with `j.put`:
  asserted setup; the reaction is under test):** Gammer Coller / `collegium_letter`; Mother Ysolt / `surety_terms`.
- **Gives, read elsewhere:** `bell_teeth` (Low Water's Halm and the Exchange; **new:** Tessary's Pitch), `keeper_mask`
  (**new:** Skeel's Hosken), `sluice_rod`, `prefects_writ` (Tessary's Valuer; Low Water's Halm).
- **Grand Tour:** it reads `sluice_rod`, `keeper_mask` and `prefects_writ` from this dale (15-lore-ledger 2.2; not re-audited
  here, `hours.kyr`/`remainder.kyr` are not mine).
- **Inward hook:** Martin Pask says a notice for forty crowns for a giant has been read aloud in the Bowl's market
  (`lore_pask_cattermole`).

## Tests

`the-long-man.test.ts` (14), `the-long-man-charter.test.ts` (5), `the-long-man-company.test.ts` (7, new: drain with the
ranger, drain absent without one, the key route, both sides of the quarrel, the sermon and the font, the reeve's rod,
the clocks and the hum), `five-links.test.ts` (10 cases across four adventures; two are this dale's), `lore-links.test.ts`.
Lint: `bin/kyrie lint data/campaigns/the-long-man.campaign.json`: 0 errors, 0 warnings.

## Honest shortfalls

- The shipped party never hears the thief, bard or mage voices; they are for other companies.
- The drain gets the company into the hill unseen but nothing changes after: Ysolt must still be told the notches, the bronze
  still taken from the cellar. It is a door, not an ending.
- The sensory piece is played only in that it is read (`the-long-man-company.test.ts`, "a hum at the springs"); there is no
  consequence to it, by design.
- `remainder_harboured` at the Ox is linted, not played.
- The advice list still carries `longman__buried` and `longman__rung` as written and never read.
- Item 8 (foreshadowing) was not audited in this pass.
