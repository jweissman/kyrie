# The Third Night: the city, its map, and its clock

Deliverables 2 and 5: the spatial account of Wrayford, and the environmental design that makes the problem of the
dead a problem of place, time and jurisdiction. Everything here is as implemented in `data/adventures/wrayford/`
(`city.kyr` for the places and ways, `clock.kyr` for the hours, `river.kyr`, `night.kyr` and `bridge.kyr` for the
crossings).

## Where it lies

Wrayford is a placed region, not a scenario. `data/adventures/countries.json` puts **the vale of the Wray** beyond the
**south** march of a generated **mountain** country. The innkeepers of that country carry its rumour ("Down the south
road, where the drove roads come down off the fells, there's Wrayford, on the Wray…"; ask them *about the bridge at
Wrayford* and they tell you three were hanged off the gatehouse). A company that walks to the south march-stone finds
the vale drawn there by the frontier, comes down the **drove road** into Northgate, and is a stranger in it. When it
leaves by the drove road again it is back in its own world, and Wrayford stays as the verdict left it.

Played alone (`data/campaigns/the-third-night.campaign.json`), the same module starts the company on the drove road as
Wat Pardoe's elder child, coming home on their mother's letter a week late. The homecomer and the stranger share
every place, person and ending; what changes is what people say to them and which doors are open (see
`06-adventures.md`).

## The shape of it

One river, one bridge, two jurisdictions. North of the Wray is the city, under the reeve and the Bench. South of it is
the Liberty of Saint Wade, under the Abbess, where the reeve's writ does not run. The bridge between them is the
lord's, farmed by the Bridge Company, and its gatehouse is where the three hang.

```
                         the drove road (fells_edge)
                                  │ 30 min
   carters' yards ── NORTHGATE ── Nine Wheels, Win's wash-house
         Wain Row ──┘   │
     (Pardoe kitchen,   │ the Cartway, 10 min
      Pardoe yard)      │
 Guildhall ── THE MARKET CROSS ── counting-house ─ collector's room
 (long hall,        │  │   │  └─ Guildhall yard (the carts)
  cellar below)     │  │   └─ Mercer Steps ─ MERCER HILL: reeve's study,
         Cutler's Lane │                     Gidley's parlour, ice-house
  (Quoin, pawnshop,    │ Shambles Lane
   Tull's)        THE SHAMBLES ─ fish-stair ─ THE WHARF ─ ferry-stage
                       │                         │          ┆ Dorcas's ferry, 20 min
                  Bridge End                bank under      ┆ (6am–10pm, or for those
                       │                    the arches      ┆  she runs it for)
     ┌──────── THE BRIDGE END, under the gatehouse ────────┐┆
     │ burned toll-house    gate-ward's stair ─ the LEADS  ││┆  pier face (climbing or rope)
     │                      (locked; Gault's key)    └─────┘│┆─ bank under the arches
     │ gatehouse arch (the chain, Pinch's booth, the farthing)  ┆
   BRIDGE STREET, on the arches ─ Jennet Hobday's front room  ┆
     │ chapel on the middle pier ─ ladder ─ the STARLING       ┆
     │ the drawbridge (raised 10pm–6am)                         ┆  the old ford, 30 min
   OVERBRIDGE STREET (THE LIBERTY) ── south ferry-stair ┄┄┄┄┄┄┘   (1am–5am, low water;
     │  Saint Wade's ─ WADE'S ACRE           the tan-yards ┄┄┄┄┄┄┄  a deep step halfway)
     │  the Abbess's court        bear-garden ─┘
     │  the Ferry Inn
   the south road (the captain comes this way), 30 min
```

Seventy places in all: one region, two settlements, one site (the bridge), two wildernesses, seventeen buildings,
three levels (the gatehouse top, below the Guildhall, the starling steps) and forty-two rooms, joined by forty-four
passages. Every room exists because something happens in it; none is there to be a corridor.

## How you cross

The problem every approach has to solve is the same: three bodies on the leads of a gatehouse on the north bank, and a
burying ground on the south. There are five ways over, and each belongs to someone.

| Way | Whose | When | What it costs |
|---|---|---|---|
| **The bridge**, through the gatehouse arch and over the drawbridge | The lord's, farmed by the Company | 6am to 10pm; the drawbridge is up at night | A farthing a day at the chain while Pinch keeps the booth (taken as a penny, the three farthings owed until Michaelmas); and carrying the dead through it is the felony the decree names, unless a ruling or a claim makes it lawful |
| **Dorcas Mudd's ferry**, ferry-stage to the south stair | Dorcas's, by a charter older than the bridge | 6am to 10pm; at night only if she has agreed, or for whoever carries her holed penny | A penny; and Dorcas will carry the dead only when Corbin asks her, which he will not |
| **The old ford**, under the first arch to the tan-yards, by **Wade's Step** in the middle | Nobody's: forgotten; the night ford exists because Alderman Dunch's mills at Wrayholme pen the river to fill their ponds | 1am to 5am | The Step, where the saint stumbled, and the **Bargeman** in it: an old pike that lies across the way and kills a lone carrier who goes at it. A woodsman reads the way round along the pier's foot; Ham's old cow knows it; anyone told it can follow it; bread thrown on the water, as the old drovers did, lets you by; and whoever is on the Step when the sluices open is washed back to the bank |
| **The offal cart**, Shambles to tan-yards | The Liberty's, by ancient privilege | 7am and 3pm, toll-free and never looked into | Kemp's word (given to a homecomer, or to whoever gave him the hide) or his boy's silence, which three coin buys and does not keep |
| **The south road** | The lord's | Any time | The way out; the way the captain comes in |

And there are three ways up to the dead: the gate-ward's stair (locked; pick it, or lift Gault's key at the Nine
Wheels, or ask to look and be walked up and down again by day), and the pier face from the bank under the arches (a
climber's way, or anyone's with a rope from Pell or Dorcas), and, on the second morning, the reeve's own stair if
someone has moved him to use it. On the leads the riders sleep from one until four unless something wakes them, and
they see whoever cuts the cords if they are awake.

## The clock

The city keeps hours whether or not the company is there, and most of what can be done depends on when.

| Hours | What is open, and who is where |
|---|---|
| 6am | The drawbridge comes down. Dorcas starts the ferry. The day turns (`dayN` counts dawns) |
| 7am, 3pm | The offal cart goes over |
| 8am | Pinch opens the booth and his door locks behind him; the gate-ward's door relocks; Inchbold opens the counting-house |
| 9am | Gidley weeps under the rail, beautifully, then asks for the takings. Hal and the reeve go to the Guildhall |
| 10am–noon, day 2 | The Abbess's court sits on the hide |
| 10am–5pm | Gidley at the Guildhall; Lumley painting there until six |
| noon–2pm, day 2 | The Bench sits on the Remonstrance; anyone may rise and move a clause |
| 6pm–9pm | Hal on the starling; Lumley and Inchbold at the Nine Wheels; Gault at his jug from about seven |
| 8pm | Dorcas and Corbin shout at each other across the water, unless something has changed |
| 10pm | The curfew bell; the drawbridge goes up; Pinch to bed behind the counting-house |
| 11pm–5am | Dorcas asleep, unless she has agreed to row |
| 1am–4am | The riders asleep on the leads, and Gault too |
| 1am–5am | Low water at the ford |
| midnight, night 2 | Kit and the young carters go for the counting-house, and Gault is waiting |
| 1am–3am, night 2 | Ham drives sixty head over the ford |
| noon, day 3 | Riders sighted on the south road; the captain on the road from three |
| dusk, day 3 | The captain arrives and sups with the Bench |
| 2am–6am, night 3 | Maudie goes up with the bread knife, unless held or promised |
| 9am, day 4 | The verdict |
| noon, day 4 | The captain rides out |
| 11am, day 5 | The Bridge Feast, whatever the city has become |

A world-placed Wrayford keeps the same hours by the world's clock, counting its days from the dawns after the company
arrived. A company that comes down the drove road at night has a first "day" that is only an evening; the verdict
comes correspondingly later in the world's reckoning, and is still on the fourth morning.

## The city's past

Places carry what happened in them. Ten small stones stand by the north wall of Wade's Acre, one date and no names:
the **Michaelmas Burning** thirty-one years ago, when Captain Ralf Sefton hanged ten from the drawbridge chains and
fired Water Lane. One lane of Overbridge is all raw brick of a single year. The Nine Wheels' ceiling is nine
cart-wheels, one for every carter the fell road has killed. The bridge chapel's painting of Saint Wade is old and
grim; the church's is the Company's repainting, smiling. The south road's milestone says HARBURY XII; the fell road
goes up past the shielings to the drop at Scar Top. None of it is needed to finish the adventure, and all of it is
there to be asked about.

## What the place does to the problem

- **The jurisdictional seam is physical.** Overbridge Street begins at the foot of the drawbridge, and the reeve's men
  stop there: the Abbess's sanctuary is real (a company with her regard that is south of the drawbridge at the dawn
  reckoning is not taken), and the dead found lying on the city side are carried up to the Guildhall yard, but the
  reeve's men do not go looking in the Liberty.
- **Every lawful route is a category.** The toll-board's lines (carcass by the hundredweight, goods of a felon,
  pilgrim on his own feet, the Abbess's tithe and the Liberty's offal free by ancient privilege) are not flavour: they
  are the satire's mechanism, and each ruling Pinch gives changes something later (see `06-adventures.md`).
- **Night is a resource with a budget.** Low water lasts four hours. A lone carrier takes a body over the ford, up
  Overbridge Street and into the Acre in about an hour and a half; three bodies do not fit in one night by the ford
  alone, which is why the scholar's playthrough ends one man short (The Third Man). The boat, the cart, a companion,
  or a second night change the arithmetic.
- **The city sees.** Riders on the leads see the cutting if awake; the butcher's boy talks if only bribed; the clerk
  minutes the lock you picked in front of him; Pinch writes down those who owe him a farthing. Nothing is hidden
  that someone in Wrayford has not seen, and the dawn reckoning asks who.
