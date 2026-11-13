# Novice viability: the first baseline (techniques free every turn)

Every calling the creation offers (warrior, mage, thief, cleric, bard, ranger, monk), at level 1, alone and with the first town's hire, in 8 generated countries (s1, s2, s3, s4, s5, s6, s7, s8; origin debt), against every band of the first country out of town, 10 fights a band each way (both sides by the game's own tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic by seed.

- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly though the company wins at least three in five standing.
- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands, of the share won (PT-11's measure), with the spread of the countries' medians.
- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door, where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran in, the share it got away from.
- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to use up is used (the game's own turns leave that to the player: Battle.plain); the meeting is read from the rules of the watch the company arrives in, not from what other actors decide in it.

## The first ruin

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 67 | 19%: 13 (2 sprung), 35 warn | 3 | 49% | 0.50 (0.00–1.00) | 31% | 46% | 20% | 3% | 96% of 137 |
| warrior | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 25% | 1.00 (0.20–1.00) | 54% | 21% | 21% | 3% | 96% of 149 |
| mage | alone | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 81% | 16% | 3% | 100% of 110 |
| mage | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 58% | 0.40 (0.00–1.00) | 11% | 54% | 32% | 3% | 100% of 218 |
| thief | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 91% | 0.00 (0.00–0.10) | 2% | 75% | 20% | 4% | 99% of 134 |
| thief | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 52% | 0.50 (0.00–0.90) | 19% | 51% | 25% | 5% | 94% of 179 |
| cleric | alone | 67 | 19%: 13 (2 sprung), 35 warn | 4 | 64% | 0.20 (0.00–0.75) | 16% | 55% | 23% | 6% | 93% of 168 |
| cleric | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 29% | 0.90 (0.10–1.00) | 47% | 19% | 30% | 4% | 95% of 208 |
| bard | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 90% | 0.00 (0.00–0.25) | 2% | 75% | 19% | 4% | 98% of 131 |
| bard | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 50% | 0.50 (0.00–1.00) | 21% | 43% | 31% | 5% | 95% of 217 |
| ranger | alone | 67 | 19%: 13 (2 sprung), 35 warn | 3 | 77% | 0.00 (0.00–0.90) | 9% | 64% | 23% | 3% | 98% of 158 |
| ranger | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 43% | 0.60 (0.00–1.00) | 34% | 34% | 28% | 4% | 97% of 192 |
| monk | alone | 67 | 19%: 13 (2 sprung), 35 warn | 4 | 75% | 0.10 (0.00–0.55) | 5% | 70% | 19% | 6% | 92% of 139 |
| monk | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 40% | 0.70 (0.10–1.00) | 36% | 31% | 27% | 6% | 92% of 195 |

## The way into the first ruin (its three nearest bands)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 20 | 10%: 2, 6 warn | 2 | 33% | 0.75 (0.10–1.00) | 42% | 30% | 26% | 2% | 95% of 55 |
| warrior | hired | 20 | 10%: 2, 6 warn | 1 | 9% | 1.00 (0.90–1.00) | 70% | 5% | 21% | 5% | 98% of 43 |
| mage | alone | 20 | 10%: 2, 6 warn | 0 | 94% | 0.00 (0.00–0.40) | 0% | 90% | 10% | 0% | 100% of 20 |
| mage | hired | 20 | 10%: 2, 6 warn | 0 | 45% | 0.50 (0.30–1.00) | 17% | 45% | 37% | 2% | 100% of 73 |
| thief | alone | 20 | 10%: 2, 6 warn | 0 | 76% | 0.05 (0.00–0.70) | 6% | 70% | 21% | 4% | 96% of 44 |
| thief | hired | 20 | 10%: 2, 6 warn | 0 | 35% | 0.70 (0.40–1.00) | 33% | 30% | 35% | 3% | 96% of 73 |
| cleric | alone | 20 | 10%: 2, 6 warn | 0 | 46% | 0.65 (0.00–1.00) | 32% | 35% | 28% | 6% | 87% of 63 |
| cleric | hired | 20 | 10%: 2, 6 warn | 2 | 15% | 1.00 (0.60–1.00) | 62% | 5% | 31% | 3% | 92% of 66 |
| bard | alone | 20 | 10%: 2, 6 warn | 0 | 78% | 0.10 (0.00–0.60) | 7% | 70% | 19% | 5% | 93% of 40 |
| bard | hired | 20 | 10%: 2, 6 warn | 0 | 37% | 0.70 (0.40–1.00) | 35% | 30% | 31% | 5% | 91% of 67 |
| ranger | alone | 20 | 10%: 2, 6 warn | 1 | 53% | 0.60 (0.00–0.90) | 25% | 45% | 28% | 3% | 95% of 58 |
| ranger | hired | 20 | 10%: 2, 6 warn | 1 | 25% | 0.90 (0.60–1.00) | 56% | 10% | 30% | 4% | 95% of 62 |
| monk | alone | 20 | 10%: 2, 6 warn | 0 | 77% | 0.15 (0.00–0.50) | 3% | 80% | 13% | 4% | 81% of 32 |
| monk | hired | 20 | 10%: 2, 6 warn | 2 | 27% | 0.85 (0.40–1.00) | 36% | 20% | 39% | 6% | 94% of 83 |

## The placed troubles (dens, raiders, tolls and the rest)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 78 | 0%: 0, 0 warn | 0 | 48% | 0.50 (0.10–0.95) | 28% | 53% | 17% | 2% | 93% of 146 |
| warrior | hired | 78 | 0%: 0, 0 warn | 0 | 28% | 0.90 (0.35–1.00) | 51% | 31% | 17% | 1% | 97% of 137 |
| mage | alone | 78 | 0%: 0, 0 warn | 0 | 93% | 0.00 (0.00–0.00) | 1% | 97% | 1% | 1% | 71% of 7 |
| mage | hired | 78 | 0%: 0, 0 warn | 0 | 60% | 0.30 (0.00–1.00) | 17% | 63% | 19% | 1% | 94% of 157 |
| thief | alone | 78 | 0%: 0, 0 warn | 0 | 89% | 0.00 (0.00–0.20) | 4% | 91% | 4% | 1% | 88% of 32 |
| thief | hired | 78 | 0%: 0, 0 warn | 0 | 57% | 0.30 (0.05–1.00) | 22% | 60% | 17% | 1% | 95% of 141 |
| cleric | alone | 78 | 0%: 0, 0 warn | 0 | 63% | 0.15 (0.00–0.95) | 23% | 62% | 10% | 6% | 79% of 95 |
| cleric | hired | 78 | 0%: 0, 0 warn | 0 | 35% | 0.90 (0.05–1.00) | 45% | 35% | 18% | 3% | 91% of 152 |
| bard | alone | 78 | 0%: 0, 0 warn | 0 | 87% | 0.00 (0.00–0.40) | 6% | 87% | 5% | 1% | 88% of 48 |
| bard | hired | 78 | 0%: 0, 0 warn | 0 | 57% | 0.30 (0.05–0.95) | 23% | 62% | 14% | 2% | 93% of 120 |
| ranger | alone | 78 | 0%: 0, 0 warn | 0 | 77% | 0.00 (0.00–0.40) | 11% | 81% | 7% | 1% | 89% of 62 |
| ranger | hired | 78 | 0%: 0, 0 warn | 0 | 49% | 0.55 (0.00–1.00) | 34% | 50% | 15% | 2% | 93% of 122 |
| monk | alone | 78 | 0%: 0, 0 warn | 0 | 76% | 0.10 (0.00–0.40) | 12% | 80% | 7% | 1% | 87% of 63 |
| monk | hired | 78 | 0%: 0, 0 warn | 0 | 47% | 0.60 (0.10–1.00) | 32% | 49% | 16% | 4% | 90% of 136 |

## The whole first country (every band out of town)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 216 | 20%: 43 (8 sprung), 66 warn | 14 | 46% | 0.60 (0.10–1.00) | 28% | 44% | 25% | 3% | 96% of 561 |
| warrior | hired | 216 | 19%: 42 (7 sprung), 67 warn | 8 | 27% | 1.00 (0.30–1.00) | 49% | 27% | 23% | 2% | 97% of 503 |
| mage | alone | 216 | 19%: 42 (7 sprung), 67 warn | 1 | 95% | 0.00 (0.00–0.00) | 0% | 80% | 17% | 3% | 100% of 378 |
| mage | hired | 216 | 19%: 41 (6 sprung), 68 warn | 4 | 62% | 0.30 (0.00–0.85) | 12% | 54% | 33% | 2% | 98% of 725 |
| thief | alone | 216 | 20%: 43 (8 sprung), 66 warn | 3 | 89% | 0.00 (0.00–0.00) | 3% | 74% | 21% | 3% | 98% of 462 |
| thief | hired | 216 | 19%: 42 (7 sprung), 67 warn | 7 | 57% | 0.40 (0.00–0.90) | 19% | 50% | 29% | 2% | 97% of 645 |
| cleric | alone | 216 | 19%: 42 (7 sprung), 67 warn | 10 | 65% | 0.20 (0.00–0.90) | 17% | 55% | 23% | 5% | 93% of 534 |
| cleric | hired | 216 | 19%: 41 (6 sprung), 68 warn | 5 | 36% | 0.90 (0.10–1.00) | 41% | 30% | 26% | 2% | 96% of 595 |
| bard | alone | 216 | 19%: 42 (7 sprung), 67 warn | 3 | 88% | 0.00 (0.00–0.30) | 3% | 73% | 21% | 3% | 98% of 452 |
| bard | hired | 216 | 19%: 41 (6 sprung), 68 warn | 10 | 54% | 0.40 (0.00–0.95) | 20% | 48% | 30% | 3% | 96% of 662 |
| ranger | alone | 216 | 19%: 42 (7 sprung), 67 warn | 10 | 77% | 0.00 (0.00–0.40) | 9% | 66% | 22% | 3% | 98% of 492 |
| ranger | hired | 216 | 19%: 41 (6 sprung), 68 warn | 7 | 47% | 0.60 (0.00–1.00) | 32% | 40% | 26% | 2% | 97% of 571 |
| monk | alone | 216 | 19%: 42 (7 sprung), 67 warn | 7 | 76% | 0.10 (0.00–0.50) | 8% | 67% | 21% | 4% | 94% of 479 |
| monk | hired | 216 | 19%: 41 (6 sprung), 68 warn | 5 | 45% | 0.70 (0.10–1.00) | 31% | 38% | 27% | 4% | 94% of 610 |

## The big ruin (PT-11)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 89 | 23%: 20 (4 sprung), 44 warn | 6 | 49% | 0.50 (0.00–1.00) | 30% | 44% | 24% | 3% | 97% of 215 |
| warrior | hired | 89 | 23%: 20 (4 sprung), 44 warn | 4 | 29% | 1.00 (0.20–1.00) | 48% | 25% | 24% | 3% | 97% of 223 |
| mage | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 78% | 19% | 4% | 100% of 165 |
| mage | hired | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 63% | 0.20 (0.00–1.00) | 10% | 53% | 35% | 3% | 99% of 311 |
| thief | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 90% | 0.00 (0.00–0.10) | 2% | 71% | 23% | 4% | 97% of 209 |
| thief | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 57% | 0.40 (0.00–0.90) | 17% | 51% | 28% | 4% | 96% of 260 |
| cleric | alone | 89 | 23%: 20 (4 sprung), 44 warn | 6 | 65% | 0.20 (0.00–0.75) | 15% | 56% | 23% | 6% | 94% of 221 |
| cleric | hired | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 36% | 0.90 (0.10–1.00) | 41% | 27% | 29% | 3% | 96% of 267 |
| bard | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 89% | 0.00 (0.00–0.25) | 2% | 72% | 22% | 5% | 98% of 195 |
| bard | hired | 89 | 23%: 20 (4 sprung), 44 warn | 5 | 54% | 0.40 (0.00–1.00) | 19% | 45% | 32% | 4% | 96% of 299 |
| ranger | alone | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 79% | 0.00 (0.00–0.50) | 9% | 63% | 25% | 4% | 99% of 222 |
| ranger | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 47% | 0.60 (0.00–1.00) | 31% | 38% | 28% | 3% | 98% of 256 |
| monk | alone | 89 | 23%: 20 (4 sprung), 44 warn | 5 | 76% | 0.00 (0.00–0.55) | 6% | 66% | 22% | 6% | 94% of 212 |
| monk | hired | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 45% | 0.70 (0.10–1.00) | 32% | 35% | 29% | 5% | 94% of 272 |

## By trouble, alone (standing: median win / died)

| Trouble | Bands | At once, warn (warrior) | warrior | mage | thief | cleric | bard | ranger | monk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A brood under the hill | 4 | 0, 0 | 0.60 / 45% | 0.00 / 100% | 0.00 / 100% | 0.05 / 95% | 0.00 / 100% | 0.05 / 95% | 0.05 / 95% |
| A den in the wild | 13 | 0, 0 | 0.90 / 22% | 0.00 / 80% | 0.00 / 75% | 0.70 / 45% | 0.10 / 75% | 0.40 / 49% | 0.20 / 53% |
| Customs-men on the road | 10 | 0, 0 | 0.25 / 72% | 0.00 / 100% | 0.00 / 100% | 0.05 / 80% | 0.00 / 100% | 0.00 / 99% | 0.00 / 97% |
| Deserters on the road | 6 | 0, 0 | 0.00 / 95% | 0.00 / 100% | 0.00 / 100% | 0.00 / 83% | 0.00 / 100% | 0.00 / 100% | 0.00 / 100% |
| Hobs | 12 | 0, 0 | 0.90 / 39% | 0.00 / 97% | 0.00 / 74% | 0.30 / 56% | 0.10 / 68% | 0.25 / 61% | 0.05 / 72% |
| Outlaws | 12 | 0, 0 | 0.25 / 68% | 0.00 / 95% | 0.00 / 94% | 0.00 / 73% | 0.00 / 93% | 0.00 / 85% | 0.00 / 86% |
| The country's own sites and wild | 138 | 43, 66 | 0.65 / 46% | 0.00 / 96% | 0.00 / 90% | 0.20 / 67% | 0.00 / 89% | 0.00 / 77% | 0.05 / 76% |
| The unquiet tower | 21 | 0, 0 | 0.80 / 33% | 0.00 / 91% | 0.00 / 91% | 0.60 / 53% | 0.00 / 88% | 0.00 / 79% | 0.30 / 66% |

## The countries

| Seed | First ruin (from the start, bands) | Big ruin (bands) | First hire (fee of the coin carried) | Bands | Unwarned |
|---|---|---|---|---:|---:|
| s1 | Nocstumul, 1.2 h, 1 | Sanhtustumul, 10 | Orym (bard), 3 of 21 coin | 26 | 6 |
| s2 | Umbrarecs, 1.2 h, 11 | Umbrarecs, 11 | Fenwick (mage), 3 of 21 coin | 28 | 9 |
| s3 | Lapisrechies, 2 h, 10 | Lapisrechies, 10 | Delta (mage), 3 of 21 coin | 27 | 6 |
| s4 | Tenebrerecs, 1.5 h, 9 | Tenebrerecs, 9 | Rolen (warrior), 3 of 21 coin | 26 | 8 |
| s5 | Somnumcarmen, 2.3 h, 10 | Somnumcarmen, 10 | Liora (mage), 3 of 21 coin | 24 | 0 |
| s6 | Chitharcaw, 2.3 h, 9 | Chitharcaw, 9 | Cadan (warrior), 3 of 21 coin | 22 | 0 |
| s7 | Graegweard, 1.7 h, 1 | Cuprumtener, 14 | Devlin (bard), 3 of 21 coin | 32 | 8 |
| s8 | Obscuruslac, 1.5 h, 16 | Obscuruslac, 16 | Boddynock (bard), 3 of 21 coin | 31 | 6 |
