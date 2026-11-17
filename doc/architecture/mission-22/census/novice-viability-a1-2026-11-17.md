# Novice viability: the baseline

Every calling the creation offers (warrior, mage, cleric, thief), at level 1, alone and with the first town's hire, in 1 generated countries (a1; origin debt), against every band of the first country out of town, 6 fights a band each way (both sides by the game's own tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic by seed.

- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly though the company wins at least three in five standing.
- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands, of the share won (PT-11's measure), with the spread of the countries' medians.
- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door, where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran in, the share it got away from.
- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to use up is used (the game's own turns leave that to the player: Battle.plain); the meeting is read from the rules of the watch the company arrives in, not from what other actors decide in it.

## The first ruin

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 2 | 0%: 0, 2 warn | 0 | 33% | 0.67 (0.67–0.67) | 25% | 50% | 25% | 0% | 100% of 3 |
| warrior | hired | 2 | 0%: 0, 2 warn | 0 | 8% | 0.92 (0.92–0.92) | 67% | 0% | 25% | 8% | 100% of 3 |
| mage | alone | 2 | 0%: 0, 2 warn | 0 | 100% | 0.00 (0.00–0.00) | 0% | 100% | 0% | 0% | 0% of 0 |
| mage | hired | 2 | 0%: 0, 2 warn | 0 | 75% | 0.25 (0.25–0.25) | 0% | 100% | 0% | 0% | 0% of 0 |
| cleric | alone | 2 | 0%: 0, 2 warn | 0 | 58% | 0.42 (0.42–0.42) | 0% | 50% | 17% | 33% | 50% of 4 |
| cleric | hired | 2 | 0%: 0, 2 warn | 0 | 17% | 0.83 (0.83–0.83) | 58% | 0% | 42% | 0% | 100% of 5 |
| thief | alone | 2 | 0%: 0, 2 warn | 0 | 92% | 0.08 (0.08–0.08) | 0% | 100% | 0% | 0% | 0% of 0 |
| thief | hired | 2 | 0%: 0, 2 warn | 0 | 75% | 0.25 (0.25–0.25) | 0% | 100% | 0% | 0% | 0% of 0 |

## The way into the first ruin (its three nearest bands)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 2 | 0%: 0, 2 warn | 0 | 33% | 0.67 (0.67–0.67) | 25% | 50% | 25% | 0% | 100% of 3 |
| warrior | hired | 2 | 0%: 0, 2 warn | 0 | 8% | 0.92 (0.92–0.92) | 67% | 0% | 25% | 8% | 100% of 3 |
| mage | alone | 2 | 0%: 0, 2 warn | 0 | 100% | 0.00 (0.00–0.00) | 0% | 100% | 0% | 0% | 0% of 0 |
| mage | hired | 2 | 0%: 0, 2 warn | 0 | 75% | 0.25 (0.25–0.25) | 0% | 100% | 0% | 0% | 0% of 0 |
| cleric | alone | 2 | 0%: 0, 2 warn | 0 | 58% | 0.42 (0.42–0.42) | 0% | 50% | 17% | 33% | 50% of 4 |
| cleric | hired | 2 | 0%: 0, 2 warn | 0 | 17% | 0.83 (0.83–0.83) | 58% | 0% | 42% | 0% | 100% of 5 |
| thief | alone | 2 | 0%: 0, 2 warn | 0 | 92% | 0.08 (0.08–0.08) | 0% | 100% | 0% | 0% | 0% of 0 |
| thief | hired | 2 | 0%: 0, 2 warn | 0 | 75% | 0.25 (0.25–0.25) | 0% | 100% | 0% | 0% | 0% of 0 |

## The placed troubles (dens, raiders, tolls and the rest)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 37 | 16%: 6 (3 sprung), 20 warn | 1 | 68% | 0.17 (0.17–0.17) | 18% | 68% | 14% | 1% | 97% of 32 |
| warrior | hired | 37 | 8%: 3, 24 warn | 1 | 50% | 0.67 (0.67–0.67) | 33% | 49% | 17% | 1% | 95% of 40 |
| mage | alone | 37 | 16%: 6 (3 sprung), 20 warn | 0 | 92% | 0.00 (0.00–0.00) | 5% | 92% | 3% | 1% | 88% of 8 |
| mage | hired | 37 | 8%: 3, 24 warn | 0 | 78% | 0.00 (0.00–0.00) | 12% | 81% | 6% | 1% | 100% of 14 |
| cleric | alone | 37 | 16%: 6 (3 sprung), 20 warn | 0 | 78% | 0.00 (0.00–0.00) | 12% | 81% | 7% | 0% | 100% of 15 |
| cleric | hired | 37 | 8%: 3, 24 warn | 0 | 61% | 0.33 (0.33–0.33) | 23% | 65% | 12% | 0% | 100% of 27 |
| thief | alone | 37 | 16%: 6 (3 sprung), 20 warn | 0 | 88% | 0.00 (0.00–0.00) | 5% | 89% | 6% | 1% | 93% of 14 |
| thief | hired | 37 | 8%: 3, 24 warn | 0 | 73% | 0.00 (0.00–0.00) | 10% | 70% | 19% | 0% | 100% of 43 |

## The whole first country (every band out of town)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 80 | 13%: 10 (5 sprung), 38 warn | 1 | 45% | 0.67 (0.67–0.67) | 40% | 46% | 13% | 1% | 96% of 66 |
| warrior | hired | 80 | 6%: 5, 44 warn | 2 | 32% | 1.00 (1.00–1.00) | 52% | 33% | 15% | 1% | 97% of 72 |
| mage | alone | 80 | 13%: 10 (5 sprung), 38 warn | 0 | 74% | 0.00 (0.00–0.00) | 22% | 71% | 5% | 2% | 82% of 27 |
| mage | hired | 80 | 6%: 5, 44 warn | 0 | 54% | 0.33 (0.33–0.33) | 37% | 56% | 5% | 2% | 86% of 28 |
| cleric | alone | 80 | 13%: 10 (5 sprung), 38 warn | 1 | 54% | 0.33 (0.33–0.33) | 33% | 54% | 11% | 2% | 93% of 57 |
| cleric | hired | 80 | 6%: 5, 44 warn | 0 | 37% | 0.83 (0.83–0.83) | 48% | 38% | 14% | 1% | 96% of 68 |
| thief | alone | 80 | 13%: 10 (5 sprung), 38 warn | 0 | 67% | 0.00 (0.00–0.00) | 23% | 66% | 9% | 2% | 92% of 47 |
| thief | hired | 80 | 6%: 5, 44 warn | 0 | 50% | 0.50 (0.50–0.50) | 32% | 48% | 20% | 0% | 100% of 97 |

## The big ruin (PT-11)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 12 | 25%: 3 (1 sprung), 5 warn | 0 | 60% | 0.25 (0.25–0.25) | 29% | 58% | 11% | 1% | 89% of 9 |
| warrior | hired | 12 | 17%: 2, 6 warn | 1 | 40% | 0.75 (0.75–0.75) | 35% | 50% | 15% | 0% | 100% of 11 |
| mage | alone | 12 | 25%: 3 (1 sprung), 5 warn | 0 | 92% | 0.00 (0.00–0.00) | 3% | 75% | 18% | 4% | 93% of 14 |
| mage | hired | 12 | 17%: 2, 6 warn | 0 | 56% | 0.25 (0.25–0.25) | 33% | 50% | 11% | 6% | 89% of 9 |
| cleric | alone | 12 | 25%: 3 (1 sprung), 5 warn | 0 | 63% | 0.17 (0.17–0.17) | 24% | 58% | 17% | 1% | 100% of 12 |
| cleric | hired | 12 | 17%: 2, 6 warn | 0 | 38% | 0.75 (0.75–0.75) | 47% | 33% | 14% | 6% | 83% of 12 |
| thief | alone | 12 | 25%: 3 (1 sprung), 5 warn | 0 | 83% | 0.00 (0.00–0.00) | 10% | 67% | 22% | 1% | 94% of 17 |
| thief | hired | 12 | 17%: 2, 6 warn | 0 | 61% | 0.17 (0.17–0.17) | 19% | 58% | 22% | 0% | 100% of 16 |

## By trouble, alone (standing: median win / died)

| Trouble | Bands | At once, warn (warrior) | warrior | mage | cleric | thief |
|---|---:|---:|---:|---:|---:|---:|
| A den in the wild | 4 | 2, 0 | 0.92 / 8% | 0.67 / 38% | 1.00 / 4% | 0.75 / 25% |
| Customs-men on the road | 2 | 0, 0 | 0.00 / 100% | 0.00 / 100% | 0.00 / 100% | 0.00 / 100% |
| Outlaws | 3 | 0, 0 | 0.17 / 72% | 0.00 / 100% | 0.00 / 72% | 0.00 / 100% |
| The Bound Howe | 12 | 3, 8 | 0.00 / 88% | 0.00 / 100% | 0.00 / 96% | 0.00 / 99% |
| The Numbered House | 5 | 0, 5 | 0.17 / 83% | 0.00 / 100% | 0.00 / 100% | 0.00 / 100% |
| The country's own sites and wild | 43 | 4, 18 | 1.00 / 26% | 0.17 / 57% | 0.83 / 34% | 0.33 / 50% |
| The silent lord | 2 | 0, 2 | 0.50 / 50% | 0.00 / 100% | 0.50 / 50% | 0.42 / 58% |
| The unquiet tower | 3 | 0, 0 | 1.00 / 28% | 0.00 / 94% | 0.50 / 61% | 0.00 / 83% |
| Wapshott's Peregrine Circus | 6 | 1, 5 | 0.25 / 67% | 0.00 / 97% | 0.00 / 89% | 0.00 / 100% |

## The countries

| Seed | First ruin (from the start, bands) | Big ruin (bands) | First hire (fee of the coin carried) | Bands | Unwarned |
|---|---|---|---|---:|---:|
| a1 | Ironkeep, 2.4 h, 2 | Stonemound, 12 | Cyril (bard), 6 of 21 coin | 80 | 10 |
