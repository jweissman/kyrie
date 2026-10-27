# The Liberty of the Ice

*An independent adventure for Kyrie: Pellam, a wool city on the river Lisk, in the three days of its first Frost Fair
in thirty-one winters, when a street of booths stands on the ice and the ice has its own law, cried every noon from a
mast with a glove on it: **say what you will; keep what you shake on.***

Module `pellam`, in [`data/adventures/liberty-of-the-ice`](../../../data/adventures/liberty-of-the-ice) (twenty-six
files, about 2,700 lines of Kyr). Found in a generated world beyond the **west march of a cold or mountain country**
(`countries.json`; not among the independent adventures, so it changes no other country's place), where the folk tell
of the Frost Fair and the North Road comes down into the snow; there its three days run from the first morning after
it is reached, and after the thaw the city goes on. Played alone, for testing and the terminal, as
[`the-liberty-of-the-ice.campaign.json`](../../../data/campaigns/the-liberty-of-the-ice.campaign.json); it is not on the
title page's list, because it belongs to the world.

## The documents

| | |
|---|---|
| [00-treatment.md](00-treatment.md) | Stage 1: the original treatment, as first written |
| [01-editorial.md](01-editorial.md) | Stage 2: a severe reading of it, and the design as revised |
| [02-adaptation.md](02-adaptation.md) | Stage 3: what Kyr could say, and the plan |
| [03-map.md](03-map.md) | The region, its districts, sites, ways and hours: a spatial account |
| [04-adventures.md](04-adventures.md) | The small adventures, how they touch, what each leaves |
| [05-synopsis.md](05-synopsis.md) | The overarching synopsis, the acts, the people, the conflicts, the settlements |
| [06-builds.md](06-builds.md) | Who the protagonist is: the build matrix |
| [07-rewards.md](07-rewards.md) | Rewards, and what they cost |
| [08-playtests.md](08-playtests.md) | The evidence: tests, wanders, the world beyond the march, keeping; [playtest/](playtest/) has thirteen transcripts |
| [friction.md](friction.md) | What it cost to say this in Kyr, Deem, the engine and the page |
| [09-critique.md](09-critique.md) | An honest literary and experiential critique |
| [10-changes.md](10-changes.md) | The record of changes, treatment to final pass |

## In brief

The roads are shut by snow. Josias Harker, wool-factor and churchwarden, hires the north country's poor on the ice
for "a farm in the hills" and sells their hands, landed, to a lead mine. Some of them have faked their deaths at the
hole on the Black Reach, because a drowned man's hand is no hand. Ursel Cobb, a liar who has never shaken on anything,
wants into Harker's books to find her brother, and offers you a con: be the Squire of Hawsfold, and sell Harker two
hundred ewes nobody can go and see. The real shepherd of Hawsfold is in the Cheaping, asking loudly for Harker.

Two ways into the bondhouse: **the Front Door** (be believed, sup, be shown the stock) and **the Ring** (be hired, and
locked in). Three levers at the Landing on the last afternoon: **the trick** (the hired traded for a flock that does
not exist), **the law** (a heretic's question answered a third way, and Harker's books laid before a Reeve who will
rule), **the flight** (down the Reach on the second night, not landed). Around them: a debtor who lives on the ice, a
bear, a perpetual frost company, an alderman who married the gin-woman for four hours thirty-one winters ago, a
printer in love with the anonymous author of the scandal-sheet, a Liars' Bench, the watermen's saws, and Ursel.

## Running it

```sh
bin/kyrie campaign data/campaigns/the-liberty-of-the-ice.campaign.json   # play in the terminal, alone
bun test test/liberty-of-the-ice                                          # the journeys, builds, wanders, the world
bun scripts/liberty-of-the-ice-transcripts.ts                             # rewrite the playtest transcripts
```

## An authored contribution

The Liberty of the Ice (its law, the Landing, the Court of the Ice and its Reeve), the Frost Fair, Pellam and its
people are this adventure's own. Saint Evenhand, whose scales stand in the Scale Church, is Imbar's, as *What Tessary
Owes* has him. Nothing in the engine or other modules depends on anything here.
