# Low Water — implementation strategy

*Written 2026-10-25 after studying the engine (Kyr grammar `src/lang/Kyr.ohm`, the shared
rules in `data/rules`, the authoring guide, the five adventures' Kyr and journeys). This is
the working specification the Kyr was built against; later changes are recorded in
`04-revisions.md`.*

## What Kyr offers that this adventure leans on

| Need | Kyr construct |
|---|---|
| Basin levels, the Mere, the engine's count | `Measure level(basin)`, arithmetic in rules, `{level(x)}` in prose |
| Gates and sluices | `Thing … { State … Change … }`; rules that `Assert state(...)` |
| Water flowing over time | A rule per watch: while a gate is open and one level is above another, one mark passes |
| A floor walkable only when dry | `Passage … opening when level(dyers) == 0 "…"` |
| The hymn as the city's clock | Rules on `hour(clock)`; the Short Hymn and the restored Seventh as facts |
| Evidence | `Discovery`, `Source … readable`, `Observe … teaches`, `Rule … teaches` (put-together inferences) |
| Conversation | `Topic … when … once { Says … On discuss { … } }`, `travelling` topics for Isaura on the way |
| A companion | `willing(isaura, party)` + the standard recruit; conditions on `travelsWith(isaura, party)` |
| The engine's code | Actions at the listening column that build a phrase in a measure; rules that read the phrase |
| The Equals | `bronze_construct` people, a pan as a Thing, a rule that sets them on whoever unbalances it |
| The hearing | Actions in the Moot Hall gated on what the company knows and who has agreed to stand with it |
| Endings | `Ending … when departed(party) and …` in a file the standalone campaign alone installs |
| A place in the shared world | `data/adventures/countries.json`, a `placed.json` without the company and the endings |
| Cross-adventure | Halm buys and answers The Long Man's catalog kinds (`keeper_mask`, `bell_teeth`) |

## The physical model

### Stocks
* `mere(bowl)` — depth on the Ward gauge, in spans. Starts at **40**.
* `count(engine)` — the Reckoner's count, of **900**. Starts at **640**. `ninths(engine)` is kept
  in step for prose.
* `level(b)` for the Dyers' Terrace basins: Upper Cistern 4 (of 5), Dyers' Basin 3 (of 3),
  Sump 1 (of 3).

### The Deep Gate (`deep_gate`, at the Ninth Lock)
States: `raised` (the intake wide), `half`, `lowered` (the cupful), `logged` (jammed with the
lock's stop-logs; the engine starved). Moved by: the hymn (the Sixth raises, the Seventh
lowers), phrases at the listening column, the stop-log crane, the Equals pulling logs out.

### The Fulling Channel head (`channel_gate`, at the Rim Gauge)
States: `to_mills` (as found), `to_mere` (the Ninefold's old course), `to_deep` (the old feeder
course, found on the Office's oldest map and in Abel Lusk's rhyme: the Rim water carried
straight to the Ninth Lock and down the Deep mouth, past the Mere).

### Rates (checked every eight hours, `nextReckon(bowl)`)
| Condition | Mere | Count |
|---|---|---|
| Deep raised, not fed | −1 | +12 |
| Deep half, not fed | −1 every other reckoning | +6 |
| Deep lowered | 0 | +0 |
| Deep logged | 0 | +0 (and the engine calls) |
| Channel to the Deep (fed) | 0 from the Deep | +60 |
| Channel to the mills | −1 once a day | — |
| Channel to the Mere, and the Deep not drawing | +1 once a day | — |

Left alone: the Mere goes 40 → about 17 by day 8, the count completes on day 8 in the evening.

### Thresholds
| Mere | What follows |
|---|---|
| ≤ 37 | The *Tench* is on the mud; Dov cannot fish |
| ≤ 34 | The roof of the Hall's throat is out of the water: the diggers can reach the Undercroft wall |
| ≤ 30 | The Ward well fails; the Ward begins to leave |
| ≤ 24 | The Listening Hall stands in the air entire |
| ≤ 18 | The Mere is a pond; Tench Row is empty |

## The hymn and the engine's code

The Long Hymn's seven **Remainders** are phrases of the engine's own notation. Four voices:
**deep, middle, high, bright**. A phrase is two tones: the first names the organ, the second
the amount.

| First tone | Organ | | Second tone | Amount |
|---|---|---|---|---|
| deep | the mouth (intake) | | deep | least |
| middle | the count | | middle | some |
| high | the last door | | high | more |
| bright | its own voice | | bright | all |

| Phrase | In the hymn | What the engine does |
|---|---|---|
| deep, deep | **the Seventh Remainder** (sung as four deep notes — "like somebody counting") | the Deep Gate lowered: the cupful |
| deep, bright | **the Sixth Remainder**, "the Rising" | the Deep Gate raised |
| deep, middle / deep, high | — | the Deep Gate half |
| middle, any | **the Long Amen** (middle, middle) | the engine sounds its count, in ninths |
| bright, deep | **the First Remainder** | the engine sounds its question |
| bright, bright | — | the engine sings back the whole Long Hymn up every pipe in the city |
| high, bright | never sung ("the high voice is not sung; it is the end of the song") | the last door opens: the census delivered now |
| high, other | — | a refusal |

The evidence: the Dyers' arch fragment ("the deep voice is its mouth"); the keystone in the
Listening Hall (the four voices and the four amounts); Cantor Orr's hymnal (the Remainders'
tones); Abel Lusk's rhyme (which verse moves which gate); watching the Deep Gate at dusk.

## The calendar (left alone)

| When | What |
|---|---|
| Day 1, morning | The Assessor arrives at the Rim. Halm is at the dig. |
| Each dusk (19:00) | The Short Hymn: the Sixth raises the Deep Gate. If the Seventh is restored, it is sung at 20:00 and lowers it. |
| Day 3, 10:00 | Quill's agent buys the dig's plot, unless the Office has frozen the Ward's titles |
| Day 3, 15:00 | Quill's bailiffs at the dig; a fight with the diggers unless someone stands between |
| Day 4, 06:00 | The diggers breach the Undercroft wall under the waterline, unless warned off or the Mere has stopped falling above 34 |
| Day 5, night | Halm goes down and sounds the high voice and the bright, unless stopped |
| Day 7, 12:00 | The Hearing in the Moot Hall. Postponed to day 9 if the Registrar is shown cause |
| Day 8, evening | The count completes, if the Deep is still raised |

## Files

| File | Holds |
|---|---|
| `bowl.kyr` | The Bowl, the shared physics (Mere, count, reckoning), the calendar, the hymn |
| `rim.kyr` | The Rim, the Rim Gauge and the Channel, the mills, Quill |
| `measures.kyr` | Measures Terrace: the Office, the Registrar, the Full Measure, the Moot Hall |
| `sounding.kyr` | The Sounding, Cantor Orr, the choir, the bell-well |
| `dyers.kyr` | The Dyers' Terrace and its basins, Mag Torrin, Abel Lusk |
| `locks.kyr` | The Nine Locks, Piet Harl, the Deep Gate, the intake culvert |
| `ward.kyr` | The Mere Ward, Dov Vant, the diggers, the *Tench* |
| `merebed.kyr` | The lakebed, the dig, the Listening Hall |
| `undercroft.kyr` | The Reckoner: the Equals, the counting gallery, the column, the governor, the last door |
| `interval.kyr` | The Interval |
| `isaura.kyr` | Isaura Vant: her joining, her travelling conversation, her arc |
| `halm.kyr` | Teodor Halm and the Collegium |
| `hearing.kyr` | The Hearing and the verdicts; the city after |
| `company.kyr` | The standalone company (the placed version imports its party) |
| `endings.kyr` | The endings (standalone only) |
