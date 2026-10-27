# The Banns at Hessel: the map

*A spatial account of the region as built (`data/adventures/hessel/city.kyr`). Hessel is one hillside, and class is
height: the Season lives at the top, takes its waters halfway down, and is carried between the two by the Old Town,
which lives at the bottom.*

## The Lim valley in the world

The Lim valley (`hessel`) is a region of four areas laid north to south, entered from the south:

| Area | What it is | Rooms |
|---|---|---|
| **The Lim vale** (`lim_vale`) | The river meadows; where the world's road comes in | the south road at Lim Bridge |
| **Hessel** (`hessel_town`) | The spa town, a settlement on the hill | 33 rooms in 13 buildings and the open town |
| **The downs** (`downs`) | Turf and sheep above the town | the Beacon walk, the Sham Castle |
| **The Orm road** (`orm_way`) | The high down north-west to the cathedral town of Orm | the stile, the shepherd's fold and hut, the crossways, Orm's south gate |

In a generated world the valley is an authored country listed in `data/adventures/countries.json`. It stands north
of a forest, fen or frost country (`beside: forest, marsh, frost`), and its marker is Mrs Cherrett. A company
travelling in that country hears the rumour of "the Season at Hessel" from the people there. It crosses the march
north and comes down the south road to Lim Bridge. The march back is open the whole time, and stays open after the
Season ends: the region is a place, not a scenario. `test/hessel.test.ts` ("walked into over the north march") plays
exactly this from a generated world (seed `h14`). The company starts in the country south of the march, finds Hessel
by its marker, enters by `south_road`, lives the Season through to its ending, and walks out again.

## The town

```
                         THE DOWNS
              Sham Castle ── Beacon walk ─────────────── to the Orm road (stile)
                                  │ the Beacon path
   UPPER HESSEL                   │
   Carth House ┄┄ Crescent ── top of the Parade ── Circus ── Mrs Cherrett's parlour ── bedroom
   (hall, study,  (window ┄┄ drawing   │    Brock St / Gay St │   │
    drawing room,  room, by ladder)    │                Mr Twiss's   Assembly Rooms vestibule ── ballroom ── card room
    kitchen,                           │                parlour
    coal cellar)   area ── kitchen     │  the Parade (15 min, steep, ridged; chairs go up it)
                    └ coal-hole ┄ cellar
   Lady Wenlock's drawing room (off the Crescent)
                                       │
   THE BATHS                           │
   Saint Ebba's (nave, vestry) ── ABBEY YARD ── Pump Room ── King's Bath gallery
                                  │       │
                     Doctors' Walk┘       └── Cross Bath
                     (Hartopp's room,             │ steps down
                      apothecary's)               │
   THE OLD TOWN                   │               │
   Hospital ── STALL STREET (chairmen's stand) ── │ ── Two Poles
                     │                            │
                 Quay Lane ───────────── laundry yard
                 (Hetty's shop, Number Four)
                     │
               foot of Lim Bridge ══ Lim Bridge ══ the south road (the way in from the world)
```

`┄` marks a way that is not open to everyone: the drawing-room window, the coal-hole, the sheep-path. Times are the
passage times in `city.kyr`. The walk from the bridge to the Circus is about half an hour; a chair up the Parade
costs two coin and takes the same.

## Ways that are conditions

The map is drawn in hours as well as places. Most of Hessel's doors keep the Season's hours, and several of its ways
are the adventure:

| Way | Open when | So that |
|---|---|---|
| Mr Twiss's door | ten to six | the apology is made in his parlour, by day |
| Lady Wenlock's door | ten to six | the family scene is an afternoon call |
| Saint Ebba's west door | seven in the morning to eight at night | the third reading, at eleven on the third day, can be walked into |
| The Pump Room and its gallery | seven in the morning to six | Mrs Scrope is at the Pump Room from eight to noon |
| The ballroom doors | the Ball night, to those admitted (or bribed in), and to anyone already inside | the Rule is a door |
| Carth House's front door | never, unless someone inside opens it | the whole of S6 |
| The area gate of Carth House | eight to nine, when the coal comes; otherwise picked (lockwork) or wrenched (brawn) | a thief and a warrior each have a way down |
| The coal-hole | once found by searching the area; needs lockwork or brawn | a third way in, with no one's leave |
| The drawing-room window | when Celia has set it ajar (after the poem); a ladder, needing climbing | the night way out |
| The sheep-path, the fold to the crossways | needing woodcraft or wayfinding | a ranger reaches Orm sooner |
| Lim Bridge | always | the region is never closed |

## Where the people are

Everyone keeps a round, by the hour (`clock.kyr` and each strand's file), and yields it while they are going along
with the company:

- **Mrs Cherrett**: her parlour ten to ten; her bed at night, or all day while her ankle is unbound; the Ball on the
  fourth night, in her chair.
- **Ismay**: the Pump Room at eight; the parlour window in the mornings; behind the Sham Castle at noon (her walk).
- **Kit Danby**: the Circus lawn with her chair in the mornings (Stall Street, if he is dismissed or on strike); Stall
  Street in the afternoons; the Two Poles in the evenings; the Sham Castle at noon the day after he has her note.
- **Rob**: the parlour in the mornings; the Crescent lawn from noon, writing; the Two Poles in the evenings.
- **Mopsa**: the parlour; the Beacon by herself from noon to two; Number Four, once it is hers.
- **Rupert Wenlock**: his mother's in the morning, Hetty's shop from noon to two, the King's Bath gallery in the
  afternoon, the card room in the evening (the Two Poles on the second evening, drinking).
- **Nan Bellamy**: the laundry yard, except at two in the morning, when she is on the steps of Carth House.
- **Dr Ottery**: the Hospital, until he leaves for the Beacon at dawn on the second day.
- **Dr Hartopp**: his consulting room nine to five, the Circus five to seven, the card room in the evening.
- **Mrs Scrope**: the Pump Room in the mornings, the card room in the evenings. What she is told is public by three
  in the afternoon.
