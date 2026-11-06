# Low Water: ledger for the broad pass

Register: civic, with a machine under the lake. Revised against `doc/imbar/14-bible.md`. Data only; no `src/`, no shared
files. This adventure had six acts, a Hearing and a lore file but no ledger in `doc/imbar/adventures/`; this is that ledger, and
the third pass (the company's ear, the cleric's office, Isaura at the water, papers from elsewhere) is recorded here. A setup a
test asserts rather than plays is labelled **asserted**.

Files written this pass: `data/adventures/low-water/callings.kyr` (added to `module.json` and `placed.json`),
`test/low-water-company.test.ts`, `test/five-links.test.ts` (shared), additions to `lore.kyr`, and a display rename in
`sounding.kyr`, `after.kyr` and `hearing.kyr`.

## The Account

| | |
|---|---|
| **Count** | The Reckoner's nine wheels, the ninth of them the Remainder; the Mere's gauge, steady for two hundred years by the Office's register and falling for three. |
| **Keeper** | The Office of Measures (Registrar Odile Fenn) and, under the lake, the Auditor. The Sounding keeps the hymn that is the machine's program. |
| **First page** | What the hymn means: a Cantor cut the Seventh verse that told the machine to drink only a cupful. |
| **Price of reading** | The account, closed, is handed back: the count finished or broken, and what the Auditor holds is owed upward. |

## Acts and scenes

The six acts are in `doc/adventures/low-water/` (07, 08, 11); the map by place:

1. **Ammerlin** (days 1-3): the head of the Stair (Isaura Vant), the Rim and the fulling mills (Sella Quenby), the Guild's counting-house (Harrow Quill), the Office of Measures (Registrar Fenn, the clerks), the Sounding (Cantor Orr, Merrin Reed, the Precentor), the Dyers' Walk (Mag Torrin, Abel Tarrant), the Ninth Lock (Piet Harl), the Ward (Dov Vant, Wenn Basset), the dig (Teodor Halm).
2. **The Ear's Library**: the Listening Hall and its jars, the Lector's room, the low archive, the Ear's bell.
3. **The Reckoner**: the Undercroft, the Hall of the Equals, the wheel-rooms, the listening column.
4. **The Hearing**: the Moot Hall, the Council, Quill's terms, the Finding.
5. **The Interval**: Ammerlin in the water.
6. **The Citadel**: the Glass Citadel, the Assayers, the Auditor.

## Before and after

| Checklist | Before | After |
|---|---|---|
| 1 Acts/scenes | As above | Unchanged |
| 2 Characterization | **Isaura Vant** has 31 topics (the Third Grade, her brother Dov, the Registrar, the Deep Gate, the Hearing); at the Hearing she asks to be *asked* to sign (`isaura_sign`: "I'll sign what's true"). **Harrow Quill**: *wants* his charter and his plots; *fears* being the one blamed ("I have lawyers"); *lies* that he withheld his engineers' report to keep the peace; *surprise*: told of the machine he turns into a buyer and offers his Channel to feed it, for the Ward plots (`quill_report`, `quill_engine`, `quill_terms`). **Halm**: *wants* to sound the high voice; can be argued out of it in the column room (`halm_dont`, `halm_reason_ward`, `halm_reason_city`, `halm_promise`). | **Isaura**: sees her own figure among the Reflected at the water; asked, she wants the truth, not the kind thing, and what she is told decides what she does (below). |
| 3 Companion arc | The shipped party (warrior Edda, bard Corin, cleric Thale) had no calling-keyed beat | **Voices, four, all heard by the shipped party:** warrior counting the bailiffs on the Guild's floor, bard in the Sounding's nave ("a fifth short") and in the Moot Hall ("arranged to be convicted"), cleric at the Ward well (`callings.kyr`; played). **Unique solution:** the cleric's office over the Reflected. **Consequential companion choice:** Isaura. |
| 4 Danger with two exits | The Reflected: sung down (the Seventh Remainder), broken with the Ear's bell. The doubles and the Assayers (fights with ways round, per `10-final-revision.md`) | A third: the cleric's office |
| 5 Depth | `echoes.kyr`: frost on the fountain in summer, wet prints on the lock steps in the morning, once the approach has grown | Unchanged |
| 6 Links | `lore.kyr`: Halm hears of the Slack, reads the Prefect's writ, Cattermole, the Collegium's notice calling surveyors to the Pharos; the Office's `collegium_letter` goes to the Grand Tour | **New, played in `five-links.test.ts`:** Halm reads Skeel's keeper's rubbing; the Registrar reads the Ninth Valuer's note on a surety. **Gives** `collegium_letter`, read by Gammer Coller (Long Man), Bartle Tonkin (Skeel) and Tessary's Keeper of the Seal. |
| 7 Contrast | A grave adventure | **The Full Measure's pots** (`measure_pots`, `ruan_line`; played): the Office's standard pot is filled to a brass line and not to the brim, and the clerk who audited it left the tavern a Third Grade. A comic scene with Ruan Tell. |
| 9 Playability | n/a | `low-water-company.test.ts` (6) |

### The cleric's office

`say_the_office` at a landing where the Reflected stand (dark, `approach >= 1`, not yet stilled): the shipped cleric says the
office of the dead and names them; the Reflected go out in a row, `reflectedStilled` is asserted and the approach goes back
**by two**; the bell takes it back by one. At the end the water says the cleric's own name back, once, in the cleric's voice:
that is the price. It needs neither the Seventh's tones (`remainders_tones`, from the Sounding's hymnal) nor the Ear's bell
(the Library and its valves).

**Played** (`low-water-company.test.ts`): the shipped campaign, no give/put/assert: Isaura asked to join, down the Stair to
the Ward landing, wait to watch 375. The approach is 3; the company carries no bell and does not know the tones; the office is
offered, said, the approach is 1, and it is not offered again that night. A warrior, thief and mage company at the same landing
at the same watch is not offered it.

**Lone-company route.** The shipped party has a cleric. A company without one has the hymn and the bell, as before.

### Isaura at the water

With the approach at 3 or more she sees her own figure (`reflected_isaura`); `isaura_water` (while she travels with the company
and the Reflected are up) asks what she should make of it. Two answers:

- *Tell her what it is: what the Office will make of her if the count is allowed to finish.* She will sign the Finding unasked
  (`isauraSigns`), and goes back up alone to the Office; she no longer travels, the Undercroft and the wheel-rooms go without her
  figures and remarks.
- *Tell her it is only the water.* She stays at the company's side the rest of the night, and does **not** sign until she is
  asked on the Hearing morning, as she said she wanted to be (`isaura_sign`). The Hearing's exhibit of her tally needs her
  signature (`hearing.kyr`, `isauraSigns(isaura)`).

Played (`low-water-company.test.ts`, "Isaura at the water"): both, with their relations and her place. **Not played:** the
Hearing itself with either answer. The state is set and the existing `isaura_sign` is unchanged; I did not run the council.

## Links, in and out

- **Out (world event):** `slack_opened` at the taproom and in Halm's letters (played in `lore-links.test.ts`).
- **Out (items):** `prefects_writ` (Halm); **new:** `tally_rubbing`, `surety_terms` (see above).
- **Gives:** `collegium_letter`, `old_glossary`. **Reads** `bell_teeth` from the Long Man (Halm; the Exchange).
- **Inward hook:** the Office's printed notice calling surveyors to the Pharos (`lore_measures_notice`); Cattermole's rubbing.

## Tests

`low-water.test.ts` (16), `low-water-beyond.test.ts`, `low-water-placed.test.ts`, `low-water-replay.test.ts`,
`low-water-company.test.ts` (6, new), `five-links.test.ts` (2 of its cases), `lore-links.test.ts`. Lint: 0 errors and the same
two warnings it had before this pass (`lore_halm_black`, `lore_halm_black_again` have no possible target in a Bowl-only world,
because they are read only when the Slack has opened).

## Honest shortfalls

- The office is a stronger answer than the bell and the hymn: I priced it with time, the cleric's name, and the dark, not with a
  second resource. If it proves too easy, put `officeSaid` into the Hearing's account.
- The Isaura choice is mechanical (signs unasked and leaves, or stays and must be asked) and its Hearing consequence is not
  played.
- Voices are heard by warrior, bard and cleric only; the thief and mage in other companies hear none.
- No new sensory piece was written; `echoes.kyr` already carries the Bowl's.
- `Tamsin Reed` is renamed `Merrin Reed` (display only; the id `tamsin` stays), because other adventures have a Tamsin (the Grand Tour's Tamsin Quaye, and shipped lone heroes named Tamsin in
  Hessel, Hold One Season, the Grand Tour, the Liberty of the Ice and the Patient Star).
