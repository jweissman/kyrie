# The quantity gate

`bun run quantity` (scripts/quantity/quantity.ts) is the quality gate's counterpart over the world (the owner,
24 November; OR-320). The quality gate reads five numbers about the experience (defects, the first act, the turn, the
decision, continuity). This gate reads what the world gives the experience to work with: how often there is a fight,
whether a deadly one is asked before it starts, what money there is and what it buys, how dense the Atlas's marks
are, what lies near the first town, how varied and how long the first hour's aims are, the opening dungeon, and the
authored content no world reaches.

It composes the instruments that already read these things:

- NoviceCountry and FirstHourBands, for the bands, sites and hire of the first country, and fights tried over seeds;
- EconomyMeasure, for what lies and what is sold, and now also what lies within a given reach (`within`);
- HexBoundary and LandModel, for the land's hexes;
- HonestPlayer, the runner and AsMeant, for the walks;
- Attest and Indicator, for the marks and their witnesses;
- DifferenceCensus.key, for an aim's template;
- BoredomCensus, for the clock and the place;
- the activation census (`ActivationCensus.stranded`), for content that is never reached.

It reads three seeds: iscoed, a1 and thorn. For each seed it reads:

- the first country, as a new life begun in its first town finds it (no stock opening);
- the gold-follower walk: HonestPlayer for 80 steps, taking the page's lead every step. On Iscoed the walk starts
  from its stock opening, as a new life does there.

It also reads the warrior's golden walk once. A full run takes about two minutes.

```
bun run quantity                      # read, compare, exit 1 if anything does not hold
bun run quantity -- --only countries  # walks | countries | stranded
bun run quantity -- --seeds iscoed,ash
bun run quantity -- --update          # write a ratchet that moved the right way
bun run quantity -- --rebase          # write every ratchet as read (say why in the commit)
```

## Measure 1, reworked (24 November)

Measure 1 had been fights per game hour over a whole walk. The owner ruled on OR-321 that the key is "more dense
combat in specific, easy-to-find locations which quests return you to periodically and which reward multiple
expeditions", with roads carrying a little more danger. A walk's hours are now put to the ground they were spent on
(scripts/quantity/places.ts): a combat place, a road, or a town. Fights at combat places are held as a band, and
fights on roads are reported. Two floors are added: how many combat places quests send a company back to, and how
many return expeditions still meet a fight and bring something home. A whole-walk rate had mixed a night camped, a
day's drove along the roads and an hour in a barrow into one number, so it said nothing about where the fights are.

## Measure 2, judged once (24 November, OR-322)

Measure 2 had counted a band as able to kill when the one who plays fell in any of the census's twelve trials
(FirstHourBands), and as asked when DangerSense reckoned it grave or deadly. The two are different fights: seeded
apart, fought with different tactics, and the reckoning of a fight joined had dropped its element (the eels in the
water). So the census called bands deadly that the game, by its own fights, had no reason to think so. Now can kill
is the reckoning's own verdict, and the game asks wherever that verdict says the one who plays could fall. The
reading is unsound no longer, but it is close to a tautology: what it holds is that the asking rule is kept. What the
census's trials alone see is reported in the note and filed as OR-410, so the gap between the two is not hidden.

## Measures 3 and 4, and the world they read (24 November, OR-323, OR-324)

The world was changed first. A great work's one treasure is 200 to 300 coin, not 500 to 800 (the `great` lists in
data/generation/history/arts.json: a golden amulet, not a kraken's claw; a golden torc, not a titan's statue). The
Delvers' mine has half the star-iron it had, at the fifteen coin a lump the merchant pays for it (deep.json's
`ore`: 17 lumps at 15, not 36 at 30). And every master-at-arms has a coat of the smith's best on the rack beside the
fine blades: fine scale, lamellar, chain, banded or splint, a point more armour at four times the plain coat's price
(Canon's fine makes; 160 to 280 coin), the dear, useful thing in a first town that a company saves a few outings for.

Measure 4 had then still read treasure at its list worth against wares at their price. List worth is twice what a
dealer pays, and no coin anyone is given. What a find is worth spending is what it fetches, so it is now read at
the most a buyer pays, as measure 3 reads a day's coin. Both are said: at what it fetches 1.78 / 2.11 / 1.49; at
list worth 3.24 / 4.23 / 2.99, where it had been 5.05 / 6.47 / 4.06.

## Measure 5's blank turns, read by the indicator (24 November, OR-325)

Iscoed's gold-follower had 17 turns of 55 with no mark (31%). Read one by one, ten had a lead drawn with the icon
for somewhere worth a look: a way further in, a place not yet gone to. Since the owner's ruling of 15 November
(TP-03), exploration is drawn as an icon and no colour, and the measure had counted colours only. A turn is now
unmarked only when no row has a colour or an icon: iscoed 13%, a1 8%, thorn 4%, the golden walk 0%. The seven left
are real, and have one cause: in a site whose rooms have all been seen, with no aim held there (Redkeep, after its
roll was read and its hounds and wolves fought), the page leads back through rooms already seen, which promise
nothing (PB-24), and nothing is marked. That is OR-411.

## Return expeditions, built (24 November, OR-321 closed: OR-412 to OR-414)

The creative director's three calls. The page never leads into a fight that could end the life of the one who plays
(grave, deadly, or one whose reckoned fights felled them): the way back is led, or someone to take along, and the
attack stays a plain row, asked. The places under the first town restock: with the first job done and the company
come up, rats come up into the room the old ways go on by, the next aim there. And they turn over what lay hidden
in that room, so a second trip has something the page leads to. Thorn's gold-follower now hires Arlen, clears the
den, is paid, comes down again, fights the rats at the old working face, and searches up six coin: expeditions back
that meet a fight and bring something home, 0 → 1 (floor 1).

Authored content no played world reaches had read 33: batch 13 integrated the Weather Drove (weatherdrove) with no
country placing it. Raising the ratchet to hold it was a band widened, and is undone: the Weather Drove is now a
province of the first country, its way in toward the Great Desert to the south (OR-415), and the measure reads 32
again, the ratchet back at 32.

## Measure 5's last blank turns, the way up (25 November, OR-411 closed)

Thorn's gold-follower had crept back to 26% unmarked, against a ceiling of 25, nearly all of it under the first
town after the dead were laid. The priest was to be told, and the way toward the churchyard went by the crypt's stair
up, barred and dark, so the page led into the crypt to listen at it, and back, nine times. With the vault's keeper
beyond the company, the ways toward the vault led on, plain, to and fro. The band was not moved; the lead was. A way
toward an aim goes by the ways the company can take where there are any. Where the aim's place is shut, or its keeper
set aside, nothing of the aim's leads. Where only the bare ways are left, the way toward the town's ground leads as
the way out ('out', its icon; plain where it is a retreat). Thorn's walk now goes up, is paid at the shrine, takes on
a sellsword, fights the keeper and goes on below: 0% unmarked, iscoed 8%, a1 16%.

Going up, the walk takes up more of the first town's aims, and one reading of measure 8 was unsound: looking under
the cloth at the drowned man in the shrine, his bruise read, had counted as the job handed out. An act whose author's
reading was perceived (`Observe … as reading`) is investigation now. Measure 8 reads 36%, its ratchet 38.

## Measure 10, every adventure placed (25 November, OR-420 closed)

The last five adventures no world reached (the Eel Bell, A Voice for Hexworth, the Warm Wall, the Leaving Supper and
the Rain-Gourd) are provinces of the first country, placed after the others so that no way in placed before them
moves. Authored content no played world reaches 33 → 28; adventures 0. The ratchets that fell with OR-411 were written
down with it: errands 13 → 11, nowhere 19 → 17, handed out 38 → 36.

## Measure 8's first town, the town itself (24 November, OR-370)

An aim taken up in the first town had included the ground under it, which is within the town (the undertown's
rooms): the rats come up into the working face, met there, had been an aim handed out in the town. Under the town is
the combat place (measure 1's), and an aim taken up there by coming on what it is about is uncovered by going
there. Measure 8's first-town aims are now those taken up in the town above it. With thorn's bear job asked after
only by one who has read the notice or seen the gate: 60% (3 of 5), the ratchet written at 60.

## Bands and ratchets

Each measure is one of three kinds:

- **A band** is a number held between a floor and a ceiling (either may be open). It holds only if every seed's or
  every walk's value lies inside it, not just the median. Bands are set by hand in
  `scripts/quantity/baseline.json`. Each band's first values, and its reason, are in `scripts/quantity/measures.ts`.
  `--update` never moves a band. Widening a band is a design decision: make it in the baseline and say why.
- **A ratchet** may move only one way: down (it may only fall) or up (it may only rise). `--update` writes the new
  number only when it has moved the right way, so the gain is kept. A loss is never written by `--update`. When a
  change is meant to move a ratchet the wrong way, for example new content that is not yet reached, run `--rebase`
  and say why in the commit.
- **A report** is shown but not held yet.

## The measures

| # | Measure | Kind | Why |
|---|---|---|---|
| 1 | Fights per game hour at combat places, on each walk | band 0.5–4 | Combat is dense in specific places (the owner, 24 November, OR-321): a combat place is inside a site, or under a town (its undertown and the deep site below, one place). Read over each walk's time there, on walks with half an hour or more there. |
| 1 | Fights per game hour on the roads, on each walk | report | Roads with a little more danger: one band of footpads to a country, going up and down a stretch of its roads, met now and then on a leg and warning first (roving.kyrt's road group). Said, not held. |
| 1 | Combat places quests return a company to, near the first town | band ≥ 2 | A combat place within four hours of the start, with three bands or more in it, that two of the country's aims or more send the company to. |
| 1 | Expeditions back to a combat place that still meet a fight and reward | band ≥ 1 | Over every walk: an expedition (going into a combat place until coming out) to a place gone into before, which met a fight and brought something home (coin, or a valuable taken up). |
| 1 | Bands within four hours of the start, per seed | band 5–40 | Enough to choose among in the first hours, but not a country of nothing but foes. |
| 1 | Fights per game hour delving the first dungeon | ratchet up | A delver (scripts/quantity/delver.ts, the acceptance ladder's third rung): the walks' warrior set down at the way into each seed's first dungeon, made hard to kill (three hundred hit points, so that what is read is what the deep holds, not how soon a first life falls), going on room by room for sixty steps (whoever is there fought, a room not yet been in first and deeper first, a trap looked at, prodded and risked, a working part tried once). The golden walk and the gold-follower never go down into the deep (OR-1238). Before OR-1230 to OR-1234: 1.64 (iscoed 5 fights in 3 h, a1 5 in 3.1 h, thorn 4 in 1.5 h); after: 3.33 (14, 12 and 11 fights). |
| 1 | Expeditions after the first that open an option and change the loop (of 4) | report | Five expeditions on the reference seed (scripts/quantity/expeditions.ts, OR-1390, the economy review's Priority 0) by an explicit policy: prepare (rest or work for keep, spend a level, buy a light, a ration, a firebomb), go down, delve (fight what the reckoning says no one would fall to, go round the rest, take up what lies about, go round a grave way, look at and prod traps, risk none that could kill, one level deeper each time), turn back hurt, come home and sell. Each command is classed (decision, consequence, traversal, recovery, administration, exposition), and each return set against the last (options newly legal, the world changed, facts learned, risk, what people remember). Said, not held, as it does not hold yet: 3 of 4 (OR-1442). |
| 1 | Distinct preparations over five expeditions | report | The review's disconfirming test (OR-1440): 2 of 5 (two torches before the third and the fifth, nothing else; with OR-1392's answers, before the second, fourth and fifth). |
| 1 | Kinds of answer to what is met below, over five expeditions | ratchet up | Each of the first dungeon's levels its own conflict grammar (OR-1392): of fought, gone round, listened for, talked round, lied to, warned off, asked, searched, a thing worked and a trap risked, those the five expeditions used. The policy before OR-1392 (fight, go round, work a thing, risk a trap): 4, the same on the fourth and fifth trips. After (words to a band that talks at the best odds the page gives, a band that lets the company be asked what it knows, a way listened at before it is taken, a room searched): 8, no two trips alike. |
| 1 | Traversal and administration after the first expedition (%) | ratchet down | The review's first threshold, a fifth (OR-1440, OR-1461): 79%; 80% with OR-1392's answers; 74% once a deep level's known, unchanged ground is crossed in one act (OR-1448: 70 routine moves below where there had been 97). |
| 1 | Watches spent below and above after the first expedition | report | Beside routine, the review's acceptance for compressing it (OR-1395): world time not falling (291 watches before OR-1448, 295 after), nor the rooms below the company knows by each return (16 by the last before, 18 after). |
| 1 | Kinds of the bestiary the deep can field | ratchet up | Of the catalog's kinds, those a deep site's tables name (dwellers, elites, keeper) or its rooms are found holding over forty sites of every purpose (a party composed from its habitats), each by its base kind; beside it, those some generated placement can field (the deep, a den, the open ground). "Deploying as much of our bestiary as possible" (the owner, 26 November; OR-1230): scripts/quantity/bestiary.ts, held in test/small/deep-bestiary too. |
| 2 | Bands that can kill, asked before (%) | ratchet up | Can kill is judged once, by the company's own reckoning: the one who plays fell in a fight it played out (DangerSense's `mortal`), against the warrior and the first town's hire. It counts as asked by the rule the page's mark reads (Marks.asks: grave, deadly, or mortal). The census's own twelve trials are said beside it, the bands they alone saw fell the one who plays (OR-410). The aim is 100%. |
| 3 | A day's coin ÷ (starter kit + dearest ware) | band 0.5–3 | A day's coin is one outing and one job in the country's own land (scripts/quantity/purse.ts): the richest one level of a site, site or part of the country within six hours' going of the start, at the best price a buyer pays, and the best pay of one job near. The kit is a light, three days' rations and a rope. The dearest ware is the first town's most expensive ware that is not itself treasure. The band means neither starved nor flooded. (It had counted every valuable within reach as found and sold, with every job's pay, and the circus's isle as a walk: an upper bound no company comes near.) |
| 4 | Treasure lying ÷ what the markets sell | band 0.5–3 | Over the country's own land, not a land of its own a story's voyage reaches (the circus's isle of Sarn), and at what it fetches: the most a buyer pays for each thing (a dealer pays half its list worth), as measure 3 reads a day's coin. Its list worth is said beside it. What can be found should be worth spending, and the markets should hold enough to spend it on. |
| 5 | Atlas marks per turn | band 1–8 | The coloured rows of each turn outside a fight's own menu, counted by the one indicator their aspects make. The note splits them by tone. |
| 5 | Turns with no mark (%) | band ≤ 25 | When a quarter of turns have nothing marked, the player is left without a lead. A row is marked by its indicator: a colour, or an icon with none (somewhere worth a look is an icon and no colour: TP-03). |
| 5 | Marks without a witness | ratchet down | A coloured row that the glance attests nothing for, by its id, its command, its way or journey, or its opener. This is a trust contract, so the number must be 0. |
| 6 | Things worth doing within two hexes of the first town | band ≥ 3 | Sites, bands out in the wild, wonders, pleasures and goings-on, each counted once (OR-311, OR-312). |
| 7 | Structural kinds of first-hour aim, across seeds | ratchet up | What an aim's condition asks for: kill, fetch, tell, reach, escort, or a story's own stage. Read from every aim the gold-follower held (OR-310). |
| 7 | First-hour aims met in every seed (%) | ratchet down | The same aim template in every world is sameness (OR-310). |
| 8 | Median minutes travelled per aim | ratchet down | The minutes of the moves made while an aim was followed, counted over the aims that were seen through (OR-310). |
| 8 | Aims seen through by arriving alone (%) | ratchet down | An aim that ends when the company arrives, with nothing done there: a fetch to nowhere (OR-310). |
| 8 | First-town aims handed out, not uncovered (%) | ratchet down | Of the aims the gold-follower takes up in its first town (not its life's own errand), those whose giving acts were no investigation: a check, a search, a look closer, or a question that only something learned first opens. A question offered to anyone who walks in is the job handed out by its label (the owner, 24 November; OR-370). |
| 9 | Minutes from the first town to the first dungeon | band 15–180 | The first dungeon, as the owner defines it (OR-311), is the nearest site with two levels or more, each with a boss (its strongest band, led by one of the second level or above) and a cache (what lies in it, worth 25 coin or more to a dealer): scripts/quantity/dungeon.ts. It should be near and unmistakable: not the town itself, and not a day away. |
| 9 | Levels of the first dungeon with a boss and a cache | band ≥ 2 | "At least two levels of serious resistance, each with a boss and a treasure cache" (the owner, 24 November). |
| 9 | Hexes from the first town to the first dungeon | band ≤ 2 | In the town's hex or within two (OR-311). |
| 9 | Companion, light and provisions in reach (of 3) | band ≥ 3 | A hire the company can pay for, a light and provisions, each to be had in the first town (OR-311). |
| 10 | Authored content no played world reaches | ratchet down | From the activation census: species with no path to any world, work plans that are not registered, scenarios that no list names, adventures that are no country, and abilities that nothing names. |
| 9 | Moves from a new life to the first dungeon's mouth, by the page's leads (median) | report | The reference game's first hour (scripts/quantity/leads.ts, OR-1500): fifteen lives on s0, a warrior, a mage and a thief each begun for each of Oakhythe's five reasons (the brothers' errand, the debt, come over the hills, a dead man's map, a lost sister), played sixty steps by the page's leads (the gold-follower). On main, 27 November: 22 (9 and 10 for the map and the sister, 22 for the errand, 28 for the hills, 53 to 55 for the debt). |
| 9 | Lives whose wanderer never comes to the first dungeon's mouth in the first hour | report | The same lives played by a curious wanderer who never follows the gold: a way not yet taken, else an act the page marks, else the way least walked (OR-1501: its mouth a seen place, never found by circling). On main: 4 of 15. |
| 5 | Atlas colours met above ground in the first hour (median, of 5) | report | The tones of the rows the gold-follower is offered before it goes down (OR-1500). On main: 2 (gold and blue; the errand's 4; the map's and the sister's 1). |
| 8 | First-hour aims seen through that open something later play reads (%) | report | Each aim seen through, and what came of it over the next two steps: another aim, a fact some condition asks or a thing is hidden until, someone joined (OR-1503). On main: 79% (56 of 71); opening nothing, the errand's way home, the dead man's box, the sister's pin and the way down for those two. |
| 5 | Moves with nothing worth going to in reach, first hour (median a life) | report | Moves after which the page marks nothing in reach but the aim's own gold (for the wanderer, nothing at all), over both players (OR-1502). On main: 14; most at the fallen stones (35), the shrine (30) and the first level's rooms. |
| — | Consequential people with a name (%) | report | Those who joined the company, and those an aim was about (OR-304, OR-281). |

## Today's reading (24 November, after OR-326)

| Measure | First reading | Now | Holds |
|---|---|---|---|
| Fights per game hour | 0.05 / 0.26 / 0.67 / 0.05 | 0.05 / 0.26 / 0.67 / 0.42 | no: the golden walk (OR-321) |
| Return expeditions that meet a fight and bring something home | (new) | 1 (thorn: the rats come up into the working face, six coin) | yes (OR-321 closed) |
| Bands near the start | 20 / 26 / 31 | 20 / 26 / 31 | yes |
| Bands that can kill, asked before | 58% | 100% (43 of 43, judged once) | yes (OR-322 closed; the census's trials alone: 3, OR-410) |
| A day's coin | 21–68× (every valuable within reach) | 1.71 / 2.19 / 1.18 (the great works' treasure, the ore, a fine coat for sale) | yes (OR-323 closed) |
| Treasure against the markets | 6–13× (with the circus's isle) | 1.78 / 2.11 / 1.49 at what it fetches (3.24 / 4.23 / 2.99 listed) | yes (OR-324 closed) |
| Marks per turn | 2.6 / 1.6 / 2.3 / 1.4 | 2.6 / 1.6 / 2.3 / 2.1 | yes |
| Turns with no mark | 9 / 31 / 19 / 44% | 0 / 8 / 16 / 0% (an icon is a mark; the way up led) | yes (OR-325, OR-411 closed) |
| Marks without a witness | 0 | 0 | yes |
| Things worth doing near the first town | 9 / 8 / 11 | 9 / 8 / 11 | yes |
| Aim kinds; aims met in every seed | 6; 0% | 6; 0% | yes |
| Minutes per aim; ended by arriving alone | 12; 19% | 13; 20% | rebased: thorn's gold-follower now sees its aims through (the den, the vault), where it had shuttled |
| First-town aims handed out | (new) | 60% (3 of 5, the town above ground) | ratchet written at 60 (OR-370 open) |
| The first dungeon: minutes, hexes | 102 / 151 / 192; 2 / 4 / 3 (a ruin out of any town) | 22 / 32 / 32; 0 / 0 / 0 (the deep site under the first town) | yes (OR-327, OR-328 closed: the measure) |
| Its levels with a boss and a cache | (new) | 4 / 4 / 3 | yes |
| Ready in the town; at the dungeon | 3 of 3; (new) | 3 of 3; 1 of 4 (gear only) | yes; reported |
| Stranded content | 32 | 28 (every adventure placed: OR-420) | yes |

OR-326 (the gold shuttling on thorn) is closed: down in the adit, dark, a torch to hand, the way back up no longer
leads over lighting it, and the adit the aim's words name is the aim's place. Thorn's fights, blank turns and aims
moved with it.

## What it does not read yet

- The day's coin is the best one outing and one job within reach: the most a day can bring, not what a player is
  likely to earn.
- The golden walk follows no aim the way a player who chose one would. Its errand minutes are therefore small.
- The aims' structural kinds come from their conditions alone. No situation is tagged with motive, obstacle or rival
  yet, which is what OR-310 asks for. When situations are tagged, the variety measure should read the tags.
- Paintings that were imported but are mapped to nothing are left out of stranded content. They are the owner's to
  place.
