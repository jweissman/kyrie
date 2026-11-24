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
| 1 | Fights met per game hour, on each walk | band 0.1–1.5 | Conflict should be met at least once in ten hours of play, and should not be the whole game (no more than one fight every forty minutes). |
| 1 | Bands within four hours of the start, per seed | band 5–40 | Enough to choose among in the first hours, but not a country of nothing but foes. |
| 2 | Bands that can kill, asked before (%) | ratchet up | A band counts as able to kill if, in any of twelve seeded trials against the warrior and the first town's hire, the one who plays fell. It counts as asked if it is reckoned grave or deadly, because only those fights ask before they begin (Grave). The aim is 100%. |
| 3 | A day's coin ÷ (starter kit + dearest ware) | band 0.5–3 | A day's coin is the most a company can bring home within six hours' going of the start: valuables at the best price a buyer pays, plus the outright pay of the jobs in the parts of the country that near. A job's full, half and remaining pay count once. The kit is a light, three days' rations and a rope. The dearest ware is the first town's most expensive ware that is not itself treasure. The band means neither starved nor flooded. |
| 4 | Treasure lying ÷ what the markets sell | band 0.5–3 | What can be found should be worth spending, and the markets should hold enough to spend it on. |
| 5 | Atlas marks per turn | band 1–8 | The coloured rows of each turn outside a fight's own menu, counted by the one indicator their aspects make. The note splits them by tone. |
| 5 | Turns with no mark (%) | band ≤ 25 | When a quarter of turns have nothing marked, the player is left without a lead. |
| 5 | Marks without a witness | ratchet down | A coloured row that the glance attests nothing for, by its id, its command, its way or journey, or its opener. This is a trust contract, so the number must be 0. |
| 6 | Things worth doing within two hexes of the first town | band ≥ 3 | Sites, bands out in the wild, wonders, pleasures and goings-on, each counted once (OR-311, OR-312). |
| 7 | Structural kinds of first-hour aim, across seeds | ratchet up | What an aim's condition asks for: kill, fetch, tell, reach, escort, or a story's own stage. Read from every aim the gold-follower held (OR-310). |
| 7 | First-hour aims met in every seed (%) | ratchet down | The same aim template in every world is sameness (OR-310). |
| 8 | Median minutes travelled per aim | ratchet down | The minutes of the moves made while an aim was followed, counted over the aims that were seen through (OR-310). |
| 8 | Aims seen through by arriving alone (%) | ratchet down | An aim that ends when the company arrives, with nothing done there: a fetch to nowhere (OR-310). |
| 9 | Minutes from the first town to the first dungeon | band 15–180 | The first dungeon is the nearest of the country's own sites with a band in it (NoviceCountry's first ruin). It should be near and unmistakable: not the town itself, and not a day away (OR-311). |
| 9 | Hexes from the first town to the first dungeon | band ≤ 2 | In the town's hex or within two (OR-311). |
| 9 | Companion, light and provisions in reach (of 3) | band ≥ 3 | A hire the company can pay for, a light and provisions, each to be had in the first town (OR-311). |
| 10 | Authored content no played world reaches | ratchet down | From the activation census: species with no path to any world, work plans that are not registered, scenarios that no list names, adventures that are no country, and abilities that nothing names. |
| — | Consequential people with a name (%) | report | Those who joined the company, and those an aim was about (OR-304, OR-281). |

## Today's reading (24 November)

These held:

- bands near the start: 20, 26, 31;
- marks per turn: 2.6, 1.6, 2.3, 1.4;
- marks without a witness: 0;
- things worth doing near the first town: 9, 8, 11;
- companion, light and provisions in reach: 3, 3, 3;
- identity: 7 of 7 named.

These ratchets were written from today's numbers:

- fairness: 58%;
- variety: 6 kinds;
- recurrence: 0%;
- minutes travelled per aim: 12;
- aims ended by arriving alone: 19%;
- stranded content: 32.

These did not hold, and each is filed as a defect:

| Measure | Reading | Filed as |
|---|---|---|
| Fights per game hour | 0.05 on the golden walk and on thorn's gold-follower | OR-321 |
| Fairness | 23 of 40 bands that can kill are asked before | OR-322 (ratchet, aim 100%) |
| A day's coin | 21–68× | OR-323 |
| Treasure against the market | 6–13× | OR-324 |
| Turns with no mark | 31% and 44% on two gold-followers | OR-325 |
| The first dungeon, minutes | 192 on thorn | OR-327 |
| The first dungeon, hexes | 4 on a1, 3 on thorn | OR-328 |

Behind OR-325 and part of OR-321 is the thorn gold-follower's shuttle (OR-326). The page's lead goes between the old
quarry pit and each of the town's places in turn, about thirty times.

## What it does not read yet

- The day's coin counts everything within reach as found and sold. It is the most there is to have, not what a
  player is likely to earn.
- The golden walk follows no aim the way a player who chose one would. Its errand minutes are therefore small.
- The aims' structural kinds come from their conditions alone. No situation is tagged with motive, obstacle or rival
  yet, which is what OR-310 asks for. When situations are tagged, the variety measure should read the tags.
- Paintings that were imported but are mapped to nothing are left out of stranded content. They are the owner's to
  place.
