# The Grand Tour: the map

*Where Sennet stands in a generated world, how its three storeys and three planes are laid out, which ways are
conditions rather than corridors, and who is where at what hour. Spoilers throughout.*

## In the world

Sennet is a **province** of the first country (Mission 18's Gate B), not a country beyond a march. Its entry in
`data/adventures/countries.json` follows the Strewnfield's: `side: east`, `terrain: marsh`, `covers: meadow, fen,
heath`, `province: true`. `Provinces.situate` stands its way in on the country's own land a little in from the east
edge, clear of the Strewnfield's cell, and `RegionGates` writes it as a gate room, `gate_sennet`, joined to the nearest
town by a road.

How a protagonist of the world comes to know of it is by **the proclamation**, not a menu:

- In every town, where travellers are kept, the Rector's notice of the Grand Tour is nailed up (`notice` in the
  country entry, written by `RegionBorders.notice`, now general to a province as to a march).
- Whoever keeps travellers there answers *"Ask … about the Grand Tour at Sennet"* with the rumour; once told (or once
  the notice is read) the way in is on the map (`region__gate_sennet_beyond`).
- At the gate, `Frontier.expand` installs the module as `psennet` within `region__region`, and the gate's link is
  *"To the top of the coast road"*.
- When the book closes, the city does not: the ending closes the chapter only (`after` in the country entry: what
  is said of Sennet once it is seen through), and the company can walk back out.

Evidence: `test/the-grand-tour-placed.test.ts` (seed `kite`): the province is among `Countries.provinces` and not
among the marches; the notice entities exist; the keeper's topic is played; the gate is travelled to; the module is
installed within the country; the coast road is reached; left alone the week ends in the Second Whelming and the
campaign is still running.

## The storeys

```
                 THE PLANE OF AIR                 (through the Air Door, Cloudgate)
                 air_threshold ── gallery ══ eyrie      ══ updraught: open when talked of (talk ≥ 3) or with the Dowager

  CLOUDGATE      landing_stage ── promenade ── balustrade
  (aloft)                │            ├── wind_court ═ Air Door (Halyards' bar; leave, Aubrey, or broken)
                         │            ├── ascension_chapel
                         │            └═ halyard_door (Jem) ── drawing_room ── aubrey_rooms
                         │                                        └── servants_hall ── wine_cellar ═ keel_ladder ── keel
                         │                                                                (hidden until known)
              ┃ the basket (winch: 5 coin / free to the gang / laundry at dawn / strike day 4 noon–six)
              ┃ the anchor chain (a ladder, 2 hours, climbing)
              ┃ the ferry (only once the hill is down)

  SENNET         coast_road ── landward_gate ── glass_market ── ascent_yard ── winch_floor
  (the bay)                                        │    └── the Haul ── quay ── fish_stairs
                                                   │                  ├── taproom (the Sounding Line)
                                                   │                  └── pumphrey_office
                                                   └── lamp_street ── glasshouse · murrey_shop · outfitter
                                                            └ Headland Steps ── college_gate ── quad
                                                                   quad ── hall_of_doors ═ Fire Door · Earth Door (Tench)
                                                                        ── museum · chapel · rector_study
                                                                   rector_study ── tower_stair ═ tower door ── nexus
                                                                                   (Rector's key / Chert's cat-flap)
              ┃ the Fish Stairs, down: one way, needing breath
              ┃ the Fish Stairs, up: one way

  THE WHELM      drowned_stair ── drowned_street ── guildhall ══ air_bell (hidden until known)
  (under)                             └── drowned_church      └── undercroft ── engine_room
                                                                         └── shaft_foot ═ the Aenean cage ── nexus

  THE PLANE OF FIRE   fire_threshold ── hour_court ── ash_market · lists
  THE PLANE OF EARTH  earth_threshold ══ long tunnel ══ assembly ── minutes       (unlit: bring a light)
```

Seventy-five places in all: fifty rooms, fifteen areas and buildings, three planes with their regions, and the
offstage room. Fifty passages.

## Ways that are conditions

Most of Sennet's interest is in how you get from one storey to another; every one is a small negotiation.

| Way | What it asks | Who it favours |
|---|---|---|
| The basket (Ascent) | 5 coin up, down free; runs 5–22, late on the Night of Lanterns; not during the strike | Anyone with coin |
| The basket, as a friend | A three-hour shift on a capstan (`gangFriend`) | Anyone with three hours: no skill |
| The laundry basket | Dawn, 5–8; a hamper; you come out in the servants' hall, behind Jem | Anyone who gets up early |
| The anchor chain | A ladder, two hours, `climbing` | A monk; anyone with the North Wind's feather |
| Halyard House door | Jem lets in the court-born, a licence, or Aubrey's company; a thief slips past | Court backgrounds, Tourists, thieves |
| The Air Door | The Halyards' bar: leave (after the funeral), Aubrey, the Dowager, or break the seal (talked of) | Anyone, at a price |
| The updraught to the eyrie | Being talked of in the Air (talk ≥ 3) or bringing the Dowager | Gossip, theft, deeds in Cloudgate |
| The Fire and Earth Doors | Tench: a licence, or four coin | Anyone entered, or anyone with a tip |
| The Fish Stairs, down | Breath: a helm, Ha'penny (short), the guards (long), Mercy | Kindness to a child; a sailor's greeting |
| The air-bell | Known only once told (Mercy, Ha'penny) | Anyone who listens |
| The keel ladder | Known only once told (Aubrey) or searched for in the cellar | Anyone who reaches the cellar |
| The tower door | The Rector's key; Chert through the cat-flap; picked | Chert's friend; a thief |
| The Aenean cage | While the tide-engine runs | Whoever starts it |
| The ferry | Only after Cloudgate is down | — |

## Who is where, when

| Person | Day | Evening / night |
|---|---|---|
| The Rector | Study 9–17, Hall of Doors 17–19 | Study 19–23 (writing); abed; on the Promenade on the Night of Lanterns; at the funeral day 3 noon; in the air-bell at 2am after she hears Perrin is alive; at the keel on the seventh night with three petals |
| Tolley | Study 9–17 | The Sounding Line 19–23 |
| Jem Tuttle | Drawing room 8–18 | Servants' hall 18–8; the Sounding Line or the glass-house once freed |
| Lady Halyard | Chapel 8–12 while mourning, drawing room after | Drawing room till 23; the Promenade on the Night of Lanterns |
| Aubrey | His rooms, drinking | The Promenade on the Night of Lanterns |
| Mother Kittiwake | The winch-house 5–22 | — |
| Bassett | Lamp Street by day; the glass-house day 2 and 3, 10–13, while Prue is in trouble | — |
| Fabian | His shop 8–19 | Upstairs |
| Florian and Miss Sone | Their own schedule: the Fire on day 2, the Earth on day 4, the Rector's desk at 17 | — |
| Mercy, Perrin | The Guildhall, the air-bell | Mercy goes home by midnight from anywhere |
| Thursday the cat | Hall 8–12, tower stair 12–16, Quad after | — |

## The calendar

Day 1 begins at eight in the morning at the top of the coast road (watch 0); each day begins at watch
`(day − 1) × 144`. Day 2, 10:00: the Watch comes to Prue's. Day 2, noon: Florian may be crowned in the Hour Court.
Day 3, noon: Perrin's coffin goes off the Balustrade. Day 4: Ascension Day, the winch-gang's strike at noon, the Night
of Lanterns from seven (guests, toast, dancing, the loosing at half past nine, supper). Day 4 also: the House orders
divers; Florian digs in the Earth at ten. Day 6, 5am: the divers raid the Whelm. Day 7, 22:00: the Rector at the keel
with three petals. The book closes at nine on the morning after the Door is opened or Cloudgate comes down, or on the
eighth morning.
