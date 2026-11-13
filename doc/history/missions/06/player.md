# The player

The web player is a game, not a set of screens. Mission 6 replaced the client's view layer outright (`web/play-*`).
It keeps the semantic models underneath: `ScreenModel`, `ChoiceList`, `CombatModel` and `PlayerView`, which only ever
offer legal commands.

## What was wrong

A review of the previous client (`web/mono-render.ts`, `mono-screens.ts`, `mono-strip.ts`, now deleted), played
through the Varrow:

- **Six applications.** Exploring, the pack, the company, the journal and the map each replaced the whole screen,
  and a fight replaced it again.
- **The company vanished in a fight.** On a companion's own turn, "Your company" was scrolled out of view.
- **Fights began with no cause.** A fight opened with "The order: Nell, Hulda, Nettle…". The ambush that started it
  ("Shapes rise out of the dark beside the road…") was never shown.
- **Things were said two or three times.**
  - The place name appeared in the top path, the heading, a "where" line and the map.
  - An answer appeared in a response box, then again as "Learned: …", then a third time in the activity strip below.
  - The help line under a choice repeated its label ("Into Ottar's chandlery: Ottar's chandlery.").
- **The engine talked to its authors:**
  - "Nothing has happened yet."
  - "Anyone brought to nothing must save against death. Withdrawing ends the fight for the whole company."
  - "unvisited" against every way out of town.
  - "self" and "party" as ability notes.
- **One typeface throughout.** Prose, labels, numbers and headings were all set alike, so nothing led the eye. The
  map took 40% of the screen and was mostly empty.

## The design

**One frame.** The frame has four parts, and it does not change:

- a status line: the campaign, the region, the hour;
- the page;
- the rail beside it;
- the keys.

What the page shows changes:

- the place;
- a fight;
- the company;
- the pack;
- the journal;
- the full map.

`E C I J M` switch between these, Esc returns to the place, and `H` turns the page to the whole history.

**The page tells the place like a story:**

1. Its name, set in a book face, in small capitals.
2. What it is like now. What has changed since the last visit is marked *new*.
3. Everything that has happened there since the company arrived, top to bottom. Each entry echoes what the company
   did (`› Ask Wenna what is said on the road`, in the terminal face), tells what came of it in prose, and adds
   margin notes for coin spent and things noted in the journal.
4. At the foot, what can be done now.

Moving on turns the page. The transcript is the log; there is no second strip repeating it.

**What can be done** is grouped by what it concerns (a person, a thing, the ways on, the company), numbered for the
keys, and laid out in two columns where there is room. A choice that opens a short list is marked ›, and the
highlighted choice is explained in a line beneath. While a command is carried out, the menu dims and the page shows
what the company is doing.

**The rail keeps the company in view, whatever the page shows.** Beside the company it shows what the moment needs:

- the map and the region's roads, with travel times;
- at a merchant, the counter: what is sold, at what price, how many are left, what is bought and the merchant's
  coin. This is read from the world (`TradeModel`), so a crew buying up the Heron's meal shows on Bryony's
  counter.
- in a fight, the foes, what each means to do this round, and what each shrugs off;
- the daylight left, and when the company must next eat.

**A fight is told on the same page.** It is headed *Set upon at Two Barrows* when others began it, and opens with
what was seen as they did. The heading says who acts after whom. Each exchange is a command echo and its outcome,
and the acting companion's options sit at the foot. The company and the foes stay in the rail throughout. On a phone
the rail becomes two strips across the top, foes first.

**Before play**, the same design system covers:

- the title, with a saved game first if there is one;
- the choice of campaign, as cards;
- forming the company, in three columns:
  1. the pitch and the ready companies;
  2. each companion: ancestry, calling, specialization, and backgrounds grouped by kind and filtered to the calling;
  3. what the three make together: the skills they cover and by whom, the skills nobody has, the formations they
     make, and the formations one named change away.

**Type and colour.** Prose is set in a book face (Iowan Old Style, Palatino, Charter, Georgia). Everything the
player operates is set in a terminal face. Colour carries meaning:

| Colour | Means |
|---|---|
| amber | what is selected, and what the company did |
| teal | ways on |
| gold | people, and money |
| rose | danger and foes |
| violet | spells |
| green | health |

**Phone.** A single column:

- the company rides along the top as a strip;
- the menu takes larger touch targets;
- the views stack;
- the keys scroll.

The browser tests play a whole installation by touch at 390×844. No page ever scrolls, only the regions that hold
more than fits.

## What the tests hold

`test/player-browser.test.ts` checks the following, at desktop size and by touch on a phone:

- a conversation's answer appears on the page once;
- the counter shows Ottar's torches with their price and stock;
- a night ambush on the valley road opens with what began it, with the foes' intents and the whole company in view;
- none of the old developer phrases appear anywhere.

The three journey tests (Caught Below, the living world, the Varrow) play through the new client unchanged. They
drive it by the same semantic hooks: `kyrieMono.inspect()`, `data-action`, `data-id` and the map's markup.

## Limits

- Choice labels still come from the rules' action names. "Melee Attack" and "Ivo: prepare spells" are honest but
  plain.
- Travel planning is the region chart and the daylight line. There is no route planner that weighs a journey's
  dangers.
- The page does not yet pace a fight's exchanges: an enemy's whole turn appears at once.
- Only a dark theme exists.
