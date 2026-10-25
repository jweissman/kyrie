# The House That Grows: creative fidelity specification

Written 2026-10-22, before any Kyr was written for it, from *The Noon Citadel* Phase One ("A World Worth
Investigating") and Phase Two ("The Strewnfield — a sourcebook"). Those two documents were conceived independently of
Kyr. This file is the reference the implementation is judged against.

## What makes the campaign memorable

The sourcebook's own judgement is that three things are unfamiliar, and I agree with it:

1. **Attention is a physical force, and a civilisation is built on it.** Dream-matter sets into hard *dreg* where no
   waking mind attends to it. A watched room cannot grow, change, or be entered from elsewhere; an unwatched one
   grows; a dream-door opens only when nobody is looking at it. From that one law come watch-lofts, watch-tax, paid
   widows, fines for sleeping unwatched, the trained *stare* that unmakes dreg, and a heresy (the Long Sleep) that is
   good engineering.
2. **Star-stone falls upward.** Selm pulls toward the zenith, so craters have no meteorite, mining is netting, and
   the city in the sky is a sum of lift minus weight.
3. **A city falling because its prisoner is waking.** The House That Grows is one house with two bodies 3.5 km
   apart: a wing (the Annex) in Haddo's barley at Cobble Ring, and the rest in the Keel under the city.

What the sourcebook calls its best mechanism, and what play must preserve: **a door leads to the least-watched copy
of the room beyond it.** Cobble Ring watches the Annex from outside, so an unwatched door in the Annex leads *up*
into the Keel. Coming back down needs the Keel side to be better watched: a companion stays behind, a lit Ithren
lamp is left burning, or Cobble Ring is talked into looking away. Going up costs a turned back; coming down costs
someone left behind. That turns a dream-house into a logistics problem with a human cost.

## The slice

**Cobble Ring, the Annex in Haddo's barley, and the Keel's upper decks (the Long Hall, the Dormitories, the Lamp
Store, the Choir Room, Neme's watch-post), over the first days after Kezu opened the door.** The protagonist is
origin 2, a stare-student of Cobble Ring whose teacher is Kezu. It is late summer, N 3640.

This slice includes:

- an inhabited place with institutions (the Watch, watch-tax, the common sleeping-hall, the council, relic law);
- a journey in hostile space (the Keel: 800 m of hallway whose doors move, with open edges 3.5 km above the
  Strewnfield);
- a substantial site whose rules are unconventional (the Annex and the Keel as one house);
- a small network of people with interests that conflict (Kezu, Tobu, Dace, Haddo, the watchers, the Company, Quill,
  the Footman, the Choir, dream-Neme);
- a significant discovery that changes what the player can do: lit lamps watch, so the house can be navigated and
  left;
- a change in circumstances that happens whether or not the player watches it: the Company's offer, the vote, the
  Footman at dawn, and Kezu's sleepwalking.

## Explicit facts the implementation must keep

These come from the sourcebook. Each has its section reference.

| # | Fact | Source |
|---|---|---|
| F1 | A room watched by one person's unbroken attention is fixed: it cannot grow, change or be entered from elsewhere. A blink does not break attention; looking away does. Paintings and mirrors do not watch; a blindfolded person does not | II §3 rule 1; II §9 laws table |
| F2 | An unwatched room in the house changes with a chance of 1 in 6 each turn (10 minutes), by the d12 Growth table | II §3 rule 2 |
| F3 | A dream-door opens only when nobody is looking at it | II §3 rule 3 |
| F4 | A door leads to the least-watched version of the room beyond it. Cobble Ring watches the Annex, so an unwatched Annex door leads into the Keel. Coming down needs the Keel side better watched | II §3 rule 4 |
| F5 | A lit Ithren selm-glass lamp, set down, watches the room it is in for 1 hour. The Lamp Store holds thousands, all burnt out; a burnt-out lamp is worth 2 m. Relighting needs star-scrapings or Seventh-dreg; a lamp lit with Seventh-dreg watches with the Seventh's attention and sees whoever carries it | II §3 B4; II §8 |
| F6 | Sleeping without a named watcher: on waking, roll 1d6. 1–3 nothing, 4–5 a small dreg, 6 a large one (on a second 6, it moves). Inside the house the odds double | II §7 |
| F7 | The Annex: 14 rooms of glass the green of pond-ice, seamed with warm brown stuff that gives under a thumb. Furniture three times its size. Cobble Ring keeps four watchers on stools around it at all times and charges 1 m a visit | I test piece; II §3 |
| F8 | A1 the Small Door (the only door at human scale) leads into A2 the Bedroom (a bed the size of a hay wagon, blanket in seven folds, under it a coat stitched *Neme* with an orange-glass marble in its pocket). A3 the Cup Shelf (one cup matches the cracked orange cup by Kezu's bed). A4 the Hall of Coats (child's coats, sizes 5 to 14; the doors out). A5 the Root Cellar (warm turf; reaches Haddo's well if unwatched for a week) | II §3 |
| F9 | The Footman of Folded Glass, HD 6. It cannot move while watched. Its touch folds a person alive into the nearest drawer. It can be broken while watched, but reassembles in any unwatched hour. A folded person is unfolded only by someone who watches the drawer for an hour | II §8 bestiary |
| F10 | The Long Hall runs 800 m, with doors at irregular intervals that change. B1 the Dormitory Stair goes up to Rigging Row and is sealed with a knot-door; opening it from the wrong side breaks Netter law, and Rigging Row will know. B2 the Bunk Wall: 1,400 names scratched by Lifted children, one reading *red door, pond arc*. B3 the Choir: forty glass cradles humming one lullaby; anyone listening for 3 turns must save or fall asleep; ear-plugs work; singing back makes it stop. B4 the Lamp Store. B5 Neme's watch-post: a child's chair from which one person sees 40 doors, with twelve years of tally marks; sitting there and watching fixes 40 rooms | II §3 |
| F11 | Kezu, 61, is sleeping too much and lying about her dreams. She dreams the hallway, and someone knocks at the front door, wrong. She wears a dreg ox on a cord, and a cracked orange cup appeared by her bed. She is now a door | I test piece; II §6 origin 2 |
| F12 | Tobu, 17, is Kezu's sister's son. He wants to understand what his aunt did, and will leave if Kezu is harmed | II §6 companions |
| F13 | Dace, 34, is a Company clerk with an Undal mother. He wants to keep his job and his conscience; he carries a knotted cord and a slate. The Company pays 500 m for a verified map, 1,000 m if it includes a Keel room | I test piece; II §6, §7 |
| F14 | Relic law: the landholder owns a fall. Lisle offers Cobble Ring 2,000 m for the Annex; the council splits. If the sale goes through, Company guards replace the town's watchers | II §5 weeks 1–4 |
| F15 | Week 2: the Footman comes through the Annex at dawn and "puts away" a watcher, who is found folded in a drawer, alive | II §5 |
| F16 | Quill, 11, Lifted, wants to go home to a town he cannot name; he remembers a pond and a red door. Isele's crew hides Ninth Span possessions in the Lamp Store | II §2 Rigging Row; II §5 week 2 |
| F17 | Dream-Neme weighs almost nothing and is visible only to people who are not looking for her. She knows the house by heart, and will guide someone through it, but will not go back in alone | II §5 |
| F18 | Keel gravity is light: a person can leap 10 m and fall 20 m unharmed. Its outer face is open to 3.5 km of air; a fall is slow for 30 m, then normal | II §3 |
| F19 | Glass mice: dreg vermin from unwatched cellars. Each swarm in a room dims every lamp there by a turn's worth; in the dark the room grows | II §8 |
| F20 | The long window, a room kind on the Rooms table: in the Annex it shows the Keel | II §3 |

## Necessary additions (mine, marked as such)

The sourcebook leaves some things unsaid that an implementation must decide.

- **A1.** Cobble Ring's geography: the rim with its watch-lofts, the pond, the sleeping-hall, Kezu's house (kitchen,
  watch-loft, sleeping-room), the reeve's house, and the east lip with Haddo's barley. The sourcebook names only the
  hall, the barley and the east lip.
- **A2.** Who runs Cobble Ring: a crater-reeve, Ammu Tessa (*my name*), with a council of arc-elders. The source
  says only "Cobble Ring's council splits".
- **A3.** Haddo is a farmer who has never wanted the thing in his field and would sell it tomorrow. The source names
  only his barley.
- **A4.** Which Annex room joins which Keel room. The source says only that rooms "fold" (Growth result 12) and that
  the house is one dream. I make A2 the Bedroom and A4 the Hall of Coats the two rooms that exist in both bodies. The
  Hall of Coats' far door opens, unwatched, on the Long Hall.
- **A5.** Quill's mother: Sennu Arru of Lowmere, a cord-weaver behind a red door on the pond arc. She is offstage in
  this slice; she is only a name for the bunk wall and Quill to arrive at.
- **A6.** The dog: Cobble Ring's sleeping-hall keeps an old dog, Bolt, who sleeps across the door. The brief asked
  for an ordinary pettable animal, and a crater-town would have one.
- **A7.** Time compression: weekly clocks become days, so a slice of three or four days holds the offer, the vote,
  the Footman's dawn and Kezu's sleepwalking. Growth inside the house stays at the sourcebook's own scale, a 1-in-6
  chance per 10-minute turn. Kyr's watch is also 10 minutes, so the two match.

## Things the implementation may not do

- Turn attention into a flag the player toggles by menu while it has no effect on the world.
- Make doors fixed passages that happen to be described as moving.
- Make the lamps a key item that opens one particular door.
- Let the Footman be an ordinary monster that fights until it is dead.
- Let Tobu join as a hireling, or Kezu answer as a topic dispenser.
- Put the house's mechanics into the engine where another author could not reach them. If that turns out to be
  necessary, that is a finding, not an implementation.

## Player approaches (specified before implementation)

What the fictional world should do under each approach:

1. **Go in.** The stare-student enters the Annex with Tobu. Watching rooms holds them. Opening the Hall of Coats'
   far door with nobody looking at it leads up into the Long Hall, because Cobble Ring watches the Annex. Behind
   them, unwatched rooms grow. To come home they must make the Keel side better watched (Tobu stays, or a lamp is
   lit), or have Cobble Ring stop watching the Annex for a turn. If neither happens, they are stranded until someone
   on the ground looks away.
2. **Map for the Company.** Dace pays 500 m for a verified map of the Annex and 1,000 m if it includes a Keel room. A
   map drawn of a room you are watching is accurate; a map of rooms you left goes stale as they grow. Selling a stale
   map is fraud that Dace will find out when he checks it.
3. **Hold the line.** Refuse to go in and help Cobble Ring keep the Annex fixed. The Annex stays its size. The
   Footman, which comes at dawn when watchers flag in the low hour, is stopped by a watcher who does not look away.
   The fold of a watcher can be undone by an hour's stare at the drawer.
4. **Follow Kezu.** Kezu sleepwalks at night. Watched, she stays put; let to walk, she goes into the Annex, and the
   Annex grows as she passes. Following her unwatched leads into the house by a door in her own sleeping-room.
5. **Unforeseen, and reasonable** (I did not design for these, and the world should still answer):
   - Bribe or persuade the watchers to look away, so that the Small Door can be opened from *outside* while the
     company stands with its back to it.
   - Sell the house: back the Company's offer at the council and let the guards in.
   - Set fire to the seams.
   - Carry a burnt-out lamp out of the Lamp Store and try to sell it in Cobble Ring.
   - Bring Quill down and take him to Lowmere.
   - Stay awake in the Keel and simply refuse to sleep.
   - Pet the dog.

## Ambiguities the implementation had to resolve

These were found while building. Each is a reading of the sourcebook, not a limitation of Kyr.

- **Attention has degrees.** With attention as a yes/no fact, rule 4's two ways down cannot both work:
  - "someone stays behind" needs the Keel copy to beat Cobble Ring's watching of the Annex copy;
  - "Cobble Ring looks away" needs a tie to go down.

  So there are three degrees:
  - **0**: nobody attends to the room;
  - **1**: overlooked from a post outside it, as the stools in the barley or Hanu's shutter overlook their rooms;
  - **2**: held by someone, or a lit lamp, inside it.

  The door opens on the strictly less-watched copy, and a tie goes to the far copy. Every one of the sourcebook's
  cases then comes out as written.
- **"Cannot be entered from elsewhere"** is read strictly: a dream-door will not open into a room someone inside is
  holding, so Quill must be asked, by a knock, to look away from his door.
- **One consequence I did not foresee.** With the stools facing it, the Annex's own hall of coats can be entered only
  while its Keel copy is held. Most visitors who open its door find themselves in the city. That is faithful, and it
  is why the Footman's drawer is the bedroom's chest, "the nearest drawer" to the barley.
- **The visiting mark buys the watchers' backs.** Rule 3 forbids a door opening while anyone looks at it, so a
  visitor can only enter if the stools turn away; the fee is for that. The house may grow while they do.
- **The low hour** (the test piece's "thief") is when the watchers nod. It is the sourcebook's week-2 dawn, compressed
  into the first night.
