# Gosse's Company — the map

*Where everything is, how a company gets from one place to another, and where Pentrice lies in a world. Read from
`city.kyr`, `road/village.kyr`, `countries.json` and the herald's scenario as built.*

## Pentrice in a generated world

```
                      (north march)
                           │
   ┌──────────────── a forest country ─────────────────┐
   │                                                   │
   │   town A        town B (the west road's seat)     │
   │      ·             · ◄── the players are stuck    │
   │                    │     here, on its heart, with │      the vale of the Arle
 ◄─┼─ old road ─── march-stone ◄──────────────────────┼─────  (Pentrice, the Soke,
   │                                                   │       the West Road)
   └───────────────────────────────────────────────────┘
```

- **Which worlds.** `data/adventures/countries.json` holds Pentrice (`id: pentrice`) on the **west** side of a first
  country whose terrain is **forest**, after the Corrow if the seed has chosen the Corrow for that march. It is not
  one of the "independent" kind that a world holds one of: it is held wherever it fits, as the Long Man and Tessary
  are. (It fitted four terrains when first placed; the full suite showed that this took the west march from too many
  worlds whose generated countries existing tests and saves expect, and it was narrowed to forests. See
  [10-editorial.md](10-editorial.md).)
- **The herald.** Because Pentrice is held, its herald, *the players on the green*, is placed before the region's
  random goings-on, in the town the west road leaves from (the scenario's settlement need is `toward:west`, which any
  scenario may now use). If that town lacks a taproom, a shrine or a shop the players need, they are placed in the
  first town that has them. The players are on the town's heart: a green, a market-place or a pit-head, named as the
  generator named it.
- **Word of it.** The innkeepers of the first region tell of "the Trial of the Wheel at Pentrice" (the country's
  `rumour`); a playbill of the Trial is nailed up in the taprooms (`notice`); after the Trial, the playbill curls and
  the talk is of what happened (`after`), and an innkeeper who is told the story takes the playbill down and keeps it.
  The players themselves are word of it: they are going west to the Trial, and say so.
- **The road in.** The march-stone at the west edge of the region names "the vale of the Arle". The first time the
  company stands there the frontier installs Pentrice as a chapter (`placed.json`), joins it by the old road to
  **the West Road above Pentrice** (`road_end`), and binds what the herald learned to Pentrice's imports: whether the
  company signed on with the players (`joined`), freed their wagon (`freed`), saw them play (`seen_show`) or paid
  their chain-man (`lem_kept`).
- **The clock.** Pentrice's week counts from the first eight in the morning after the march is crossed. A company
  that dawdles on the road does not miss the Trial; a company that comes after the verdict (in a campaign where the
  clock was not shifted) hears it as the city's news and is given no ending (see the week, below).

## The standalone campaign

`data/campaigns/gosses-company.campaign.json` is the same thing built by hand, with no generated world:

```
 Wending Cross (wending)                                   the vale of the Arle (pentrice)
 ┌───────────────────────────────┐   the road across      ┌──────────────────────────────┐
 │ Cobbet's shop   the chapel    │   the march, 2 hours   │ the West Road above Pentrice │
 │        \         /            │ ─────────────────────► │            │ 1 hour          │
 │      the green at Wending ── the west road out ──┘      │      the Westgate …          │
 │        /                      │                        └──────────────────────────────┘
 │ the Wheatsheaf (taproom)      │
 │ the old lime-kiln (players)   │
 └───────────────────────────────┘
```

Wending Cross is a small authored village (`road/village.kyr`) whose green, Wheatsheaf, chapel and shop the herald is
bound to exactly as a generated town's would be. The players' chain-man Lem is at the old lime-kiln outside it.

## Pentrice

Pentrice stands where the Ise falls into the Arle. The City is on the north bank, inside its walls; the **Soke** is on
the south bank, a liberty where the City's writ, and so the Office's licence and the bailiffs' warrants, does not run.

```
                         N
   the West Road ─1h─ WESTGATE ──── THE CHEPE ──── GUILDHALL SQUARE ──── THE CLOSE
   (road_end)          │  ▲          │   │   ╲            │     │            │  │  │
                       │  │      Mayor's  Fish   Bookbinders' Office of   Hill    minster  choir   Canon
                       │  │      Room     Lane   Alley        Plain       Steps   (nave,   school  Mallory's
                       │  └ the Painted     │   PATERNOSTER   Speech      │      bell-    yard    study
                       │    Moon (yard,     │   ROW (the Owl,  (hall,     HILL    loft)
                       │    taproom, loft)  │   Inchbald's)    Master's   STREET ── the Lord Mayor's garden
                       │                    │                  room)       │  │
                       │               THE GULLET                       Orde  conduit
                       │           (Ma Tolly, the ballad stall,         house house
                       │            the fishmongers' chimney)
                       │                    │
                       │             THE WATER STAIRS
                       │              │           ╲
                       │    the watermen's boats    the old weir (hidden until heard of;
                       │      (10 minutes; not       passable from four in the afternoon
                       │       while they strike)    to two in the morning; 30 minutes)
                       │              │                   ╲
               ~~~~~~~~~~~~~~~~~~ the Arle ~~~~~~~~~~~~~~~~~~~╲~~~~~~~~~~~~~~~~
                              THE SOKE LANDING ── SOKE LANE ── the bear-garden
                                                     │
                                                 THE WHEEL (yard and stage)
                                                     │
                                              the tiring-house
                                                     │ (ladder)
                                         the cellarage under the stage
```

| Place | Kyr id | What is there |
|---|---|---|
| the West Road above Pentrice | `road_end` | the bill-board with AT LAST pencilled under Gosse's bill; the view of the vale |
| the Westgate | `westgate` | the toll-board under the Trial's bills; Abel Tunstall hiring tallymen in the mornings; Grimsditch the bailiff |
| the Painted Moon: yard, taproom, the stable loft | `moon_yard`, `moon_taproom`, `moon_loft` | the company's wagon; Patience's stall; Dick Merriman the ostler; Mistress Bascombe; the loft where the company lodges and rehearses, with the property chest and Hepzibah's trestle |
| the Chepe | `chepe` | the market and its licensed boards; the crier of the Trial; the Mayor's Room (Corin Fallow's playhouse) |
| Guildhall Square | `guildhall_square` | the dry Fountain of Concord; Wat Cundy |
| the Office of Plain Speech: hall, the Master's room | `office_hall`, `master_room` | Tunstall's desk and the chained Ordinances; Clemency Orde, by day |
| the Close | `close` | SILENCE IS LICENSED HERE; the minster and its bell-loft (the Budges); the choir school yard (Ned Cherry); Canon Mallory's study |
| Paternoster Row | `row` | the Owl (Ormsby Clay, Nym Carrow); Inchbald's press-room (Shad) |
| Hill Street | `hill` | the Orde house (Clemency by night; Sukey Rowe in the area); the conduit house; the Lord Mayor's garden, watered by the Fountain's water |
| the Gullet | `gullet` | the fish market; Ma Tolly's honey; Dame Gammage's ballad stall; the Garlicks; the fishmongers' chimney full of bees |
| the Water Stairs | `water_stairs` | Joss Ferriby and the watermen; the boats; the way down to the weir |
| the Soke landing, Soke Lane | `soke_landing`, `soke_lane` | THE CITY'S WRIT RUNS NOT HERE |
| the Wheel, the tiring-house, the cellarage | `wheel`, `tiring_house`, `under_stage` | the yard, the stage, the grey bench, the lords' room; the wall of names with A. GOSSE cut in it; Old Wilmot; the trap and the pump |
| the bear-garden | `bear_pen` | Simeon Bowle; the pen where a stray bear ends up |

Within the walls every street is five minutes. The river is the map's one real distance: the watermen's boats take ten
minutes when the watermen work, and they do not work after four on the fourth day, when Fallow has paid them to
strike. The weir is the other way over: nobody mentions it until Oswin Garlick does (or Ma Tolly, if her bees are
saved), and it can be walked only while the water is low, from four in the afternoon until two in the morning. A
company that goes over to the Soke in the evening can get back across the weir after the play; one that stays out too
late can take a bench in the tiring-house from Old Wilmot for a coin.

## The week, as a timetable

The days are the city's, counted from the first eight in the morning after the company arrives (tday 1). In the
standalone city campaign, watch 0 is eight in the morning of tday 1.

| When | What happens, whoever is there |
|---|---|
| tday 1, 10:00 | Corin Fallow visits the loft: a pension for Gosse, a place for Dorcas |
| tday 1, noon | an old woman who threw the first cabbage recognises Gosse; Merriman gives up the parcel if nobody else has got it out of him |
| tday 1, 14:00 | Patience gets loose in the Gullet, unless she has been fed |
| tday 1, 15:00 | Simeon Bowle takes a loose bear to the bear-garden as a stray |
| tday 2, 08:00 | Dorcas goes to Fallow, if his offer stands and she has not been kept |
| tday 2, 09:00 | Grimsditch the bailiff comes for the costumes |
| at five, the day after Ma Tolly first tells of it | the fishwives burn sulphur under her swarm, unless it is taken or they are talked round |
| tday 2, 18:00 | Inchbald sets the pirate quarto, if Shad is still on the beam |
| tday 2, 19:00 | *The Siege of Arle*, the Lord Mayor's Servants |
| tday 3, 11:00 | Fallow hires Oswin Garlick to heckle, unless Fallow owes the company a siege-tower |
| tday 3, noon | Swale walks out, if he knows what his lines mean and nothing has been settled |
| tday 3, 15:00 | the Office seizes an unlicensed book found within the walls, if Fallow has informed |
| tday 3, 19:00 | *The Patient Daughter*, the Children of the Close |
| tday 3, 20:00 | the watermen decide to strike, unless paid or persuaded |
| tday 4, noon | a seized book is burned in Guildhall Square |
| tday 4, 16:00 | the watermen strike |
| tday 4, 18:00 | the Trial peal, if the Budges are reconciled; the company crosses to the Wheel |
| tday 4, 19:00–22:00 | *The Alderman's Ghost*, nine scenes |
| tday 5, 10:00 | the verdict |
