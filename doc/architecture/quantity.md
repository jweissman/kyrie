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
| 2 | Bands that can kill, asked before (%) | ratchet up | A band counts as able to kill if, in any of twelve seeded trials against the warrior and the first town's hire, the one who plays fell. It counts as asked if it is reckoned grave or deadly, because only those fights ask before they begin (Grave). The aim is 100%. |
| 3 | A day's coin ÷ (starter kit + dearest ware) | band 0.5–3 | A day's coin is one outing and one job in the country's own land (scripts/quantity/purse.ts): the richest one level of a site, site or part of the country within six hours' going of the start, at the best price a buyer pays, and the best pay of one job near. The kit is a light, three days' rations and a rope. The dearest ware is the first town's most expensive ware that is not itself treasure. The band means neither starved nor flooded. (It had counted every valuable within reach as found and sold, with every job's pay, and the circus's isle as a walk: an upper bound no company comes near.) |
| 4 | Treasure lying ÷ what the markets sell | band 0.5–3 | Over the country's own land, not a land of its own a story's voyage reaches (the circus's isle of Sarn). What can be found should be worth spending, and the markets should hold enough to spend it on. |
| 5 | Atlas marks per turn | band 1–8 | The coloured rows of each turn outside a fight's own menu, counted by the one indicator their aspects make. The note splits them by tone. |
| 5 | Turns with no mark (%) | band ≤ 25 | When a quarter of turns have nothing marked, the player is left without a lead. |
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
| — | Consequential people with a name (%) | report | Those who joined the company, and those an aim was about (OR-304, OR-281). |

## Today's reading (24 November, after OR-326)

| Measure | First reading | Now | Holds |
|---|---|---|---|
| Fights per game hour | 0.05 / 0.26 / 0.67 / 0.05 | 0.05 / 0.26 / 0.67 / 0.42 | no: the golden walk (OR-321) |
| Bands near the start | 20 / 26 / 31 | 20 / 26 / 31 | yes |
| Bands that can kill, asked before | 58% | 58% | ratchet yes; the aim is 100% (OR-322) |
| A day's coin | 21–68× (every valuable within reach) | 3.4–4.9× (one outing, one job) | no (OR-323) |
| Treasure against the markets | 6–13× (with the circus's isle) | 4.1–6.5× (the country's own land) | no (OR-324) |
| Marks per turn | 2.6 / 1.6 / 2.3 / 1.4 | 2.6 / 1.6 / 2.3 / 2.1 | yes |
| Turns with no mark | 9 / 31 / 19 / 44% | 9 / 31 / 19 / 7% | no: iscoed's gold-follower (OR-325) |
| Marks without a witness | 0 | 0 | yes |
| Things worth doing near the first town | 9 / 8 / 11 | 9 / 8 / 11 | yes |
| Aim kinds; aims met in every seed | 6; 0% | 6; 0% | yes |
| Minutes per aim; ended by arriving alone | 12; 19% | 13; 20% | rebased: thorn's gold-follower now sees its aims through (the den, the vault), where it had shuttled |
| First-town aims handed out | (new) | 63% (5 of 8) | ratchet written (OR-370) |
| The first dungeon: minutes, hexes | 102 / 151 / 192; 2 / 4 / 3 (a ruin out of any town) | 22 / 32 / 32; 0 / 0 / 0 (the deep site under the first town) | yes (OR-327, OR-328 closed: the measure) |
| Its levels with a boss and a cache | (new) | 4 / 4 / 3 | yes |
| Ready in the town; at the dungeon | 3 of 3; (new) | 3 of 3; 1 of 4 (gear only) | yes; reported |
| Stranded content | 32 | 32 | yes |

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
