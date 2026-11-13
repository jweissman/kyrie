# Novice viability: the true baseline (techniques rest as Orsino rests them)

Every calling the creation offers (warrior, mage, thief, cleric, bard, ranger, monk), at level 1, alone and with the first town's hire, in 8 generated countries (s1, s2, s3, s4, s5, s6, s7, s8; origin debt), against every band of the first country out of town, 10 fights a band each way (both sides by the game's own tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic by seed.

- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly though the company wins at least three in five standing.
- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands, of the share won (PT-11's measure), with the spread of the countries' medians.
- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door, where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran in, the share it got away from.
- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to use up is used (the game's own turns leave that to the player: Battle.plain); the meeting is read from the rules of the watch the company arrives in, not from what other actors decide in it.

## The first ruin

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 50% | 0.50 (0.00–1.00) | 30% | 46% | 19% | 5% | 93% of 140 |
| warrior | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 30% | 0.90 (0.10–1.00) | 51% | 24% | 23% | 2% | 98% of 158 |
| mage | alone | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 81% | 16% | 3% | 100% of 110 |
| mage | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 60% | 0.30 (0.00–1.00) | 10% | 57% | 31% | 3% | 100% of 205 |
| thief | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 91% | 0.00 (0.00–0.10) | 2% | 75% | 20% | 4% | 99% of 135 |
| thief | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 55% | 0.40 (0.00–0.90) | 19% | 54% | 22% | 5% | 93% of 159 |
| cleric | alone | 67 | 19%: 13 (2 sprung), 35 warn | 4 | 63% | 0.30 (0.00–0.80) | 16% | 55% | 23% | 6% | 93% of 167 |
| cleric | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 30% | 0.90 (0.10–1.00) | 48% | 21% | 27% | 4% | 95% of 193 |
| bard | alone | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 89% | 0.00 (0.00–0.25) | 2% | 75% | 19% | 4% | 98% of 131 |
| bard | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 51% | 0.50 (0.00–1.00) | 22% | 42% | 32% | 5% | 95% of 226 |
| ranger | alone | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 75% | 0.10 (0.00–0.90) | 11% | 64% | 22% | 3% | 97% of 148 |
| ranger | hired | 67 | 19%: 13 (2 sprung), 35 warn | 3 | 41% | 0.60 (0.00–1.00) | 33% | 33% | 29% | 5% | 96% of 204 |
| monk | alone | 67 | 19%: 13 (2 sprung), 35 warn | 5 | 59% | 0.30 (0.00–0.90) | 12% | 57% | 23% | 9% | 87% of 174 |
| monk | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 34% | 0.80 (0.00–1.00) | 43% | 30% | 24% | 3% | 94% of 172 |

## The way into the first ruin (its three nearest bands)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 20 | 10%: 2, 6 warn | 1 | 37% | 0.90 (0.00–1.00) | 48% | 30% | 20% | 3% | 91% of 44 |
| warrior | hired | 20 | 10%: 2, 6 warn | 1 | 13% | 1.00 (0.90–1.00) | 68% | 10% | 22% | 1% | 100% of 43 |
| mage | alone | 20 | 10%: 2, 6 warn | 0 | 94% | 0.00 (0.00–0.40) | 0% | 90% | 10% | 0% | 100% of 20 |
| mage | hired | 20 | 10%: 2, 6 warn | 0 | 46% | 0.50 (0.30–1.00) | 20% | 45% | 34% | 2% | 100% of 68 |
| thief | alone | 20 | 10%: 2, 6 warn | 0 | 76% | 0.05 (0.00–0.70) | 6% | 70% | 22% | 3% | 96% of 45 |
| thief | hired | 20 | 10%: 2, 6 warn | 0 | 36% | 0.70 (0.40–1.00) | 33% | 35% | 30% | 3% | 95% of 63 |
| cleric | alone | 20 | 10%: 2, 6 warn | 0 | 46% | 0.65 (0.00–1.00) | 32% | 35% | 28% | 5% | 89% of 63 |
| cleric | hired | 20 | 10%: 2, 6 warn | 2 | 14% | 1.00 (0.60–1.00) | 63% | 10% | 26% | 2% | 96% of 54 |
| bard | alone | 20 | 10%: 2, 6 warn | 0 | 77% | 0.10 (0.00–0.70) | 7% | 70% | 19% | 5% | 93% of 40 |
| bard | hired | 20 | 10%: 2, 6 warn | 0 | 35% | 0.75 (0.40–1.00) | 36% | 25% | 35% | 5% | 92% of 75 |
| ranger | alone | 20 | 10%: 2, 6 warn | 1 | 54% | 0.60 (0.00–0.90) | 26% | 45% | 28% | 2% | 95% of 58 |
| ranger | hired | 20 | 10%: 2, 6 warn | 2 | 20% | 0.90 (0.60–1.00) | 56% | 10% | 30% | 4% | 95% of 63 |
| monk | alone | 20 | 10%: 2, 6 warn | 1 | 46% | 0.50 (0.00–1.00) | 21% | 50% | 21% | 9% | 78% of 54 |
| monk | hired | 20 | 10%: 2, 6 warn | 2 | 13% | 1.00 (0.40–1.00) | 54% | 15% | 29% | 2% | 94% of 62 |

## The placed troubles (dens, raiders, tolls and the rest)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 78 | 0%: 0, 0 warn | 0 | 58% | 0.30 (0.05–1.00) | 26% | 59% | 12% | 2% | 90% of 107 |
| warrior | hired | 78 | 0%: 0, 0 warn | 0 | 32% | 0.90 (0.25–1.00) | 48% | 33% | 17% | 1% | 94% of 141 |
| mage | alone | 78 | 0%: 0, 0 warn | 0 | 93% | 0.00 (0.00–0.00) | 1% | 97% | 1% | 1% | 71% of 7 |
| mage | hired | 78 | 0%: 0, 0 warn | 0 | 60% | 0.25 (0.00–1.00) | 17% | 60% | 21% | 2% | 94% of 176 |
| thief | alone | 78 | 0%: 0, 0 warn | 0 | 88% | 0.00 (0.00–0.20) | 4% | 91% | 4% | 1% | 88% of 32 |
| thief | hired | 78 | 0%: 0, 0 warn | 0 | 58% | 0.30 (0.05–0.95) | 22% | 62% | 16% | 1% | 96% of 133 |
| cleric | alone | 78 | 0%: 0, 0 warn | 0 | 62% | 0.20 (0.00–0.95) | 23% | 60% | 11% | 7% | 80% of 103 |
| cleric | hired | 78 | 0%: 0, 0 warn | 0 | 35% | 0.85 (0.05–1.00) | 45% | 35% | 17% | 3% | 88% of 147 |
| bard | alone | 78 | 0%: 0, 0 warn | 0 | 86% | 0.00 (0.00–0.40) | 6% | 87% | 5% | 1% | 88% of 48 |
| bard | hired | 78 | 0%: 0, 0 warn | 0 | 56% | 0.30 (0.10–1.00) | 22% | 63% | 14% | 1% | 94% of 118 |
| ranger | alone | 78 | 0%: 0, 0 warn | 0 | 76% | 0.05 (0.00–0.40) | 11% | 81% | 7% | 1% | 89% of 62 |
| ranger | hired | 78 | 0%: 0, 0 warn | 0 | 48% | 0.60 (0.00–1.00) | 34% | 47% | 17% | 2% | 93% of 139 |
| monk | alone | 78 | 0%: 0, 0 warn | 0 | 64% | 0.20 (0.05–0.75) | 16% | 72% | 9% | 3% | 83% of 87 |
| monk | hired | 78 | 0%: 0, 0 warn | 0 | 36% | 0.80 (0.30–1.00) | 39% | 37% | 19% | 5% | 88% of 169 |

## The whole first country (every band out of town)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 216 | 20%: 43 (8 sprung), 66 warn | 13 | 53% | 0.40 (0.00–1.00) | 26% | 48% | 23% | 3% | 95% of 513 |
| warrior | hired | 216 | 19%: 42 (7 sprung), 67 warn | 6 | 32% | 0.90 (0.20–1.00) | 47% | 29% | 23% | 1% | 97% of 516 |
| mage | alone | 216 | 19%: 42 (7 sprung), 67 warn | 1 | 95% | 0.00 (0.00–0.00) | 0% | 80% | 17% | 3% | 100% of 378 |
| mage | hired | 216 | 19%: 41 (6 sprung), 68 warn | 5 | 62% | 0.20 (0.00–0.90) | 11% | 54% | 33% | 2% | 98% of 736 |
| thief | alone | 216 | 20%: 43 (8 sprung), 66 warn | 3 | 89% | 0.00 (0.00–0.05) | 3% | 74% | 21% | 3% | 98% of 463 |
| thief | hired | 216 | 19%: 42 (7 sprung), 67 warn | 7 | 58% | 0.40 (0.00–0.90) | 19% | 53% | 26% | 2% | 96% of 587 |
| cleric | alone | 216 | 19%: 42 (7 sprung), 67 warn | 11 | 65% | 0.20 (0.00–0.90) | 17% | 54% | 24% | 5% | 93% of 546 |
| cleric | hired | 216 | 19%: 41 (6 sprung), 68 warn | 5 | 37% | 0.80 (0.10–1.00) | 42% | 31% | 25% | 3% | 95% of 574 |
| bard | alone | 216 | 19%: 42 (7 sprung), 67 warn | 5 | 88% | 0.00 (0.00–0.30) | 3% | 73% | 21% | 3% | 98% of 452 |
| bard | hired | 216 | 19%: 41 (6 sprung), 68 warn | 9 | 54% | 0.40 (0.10–0.95) | 19% | 48% | 30% | 3% | 97% of 672 |
| ranger | alone | 216 | 19%: 42 (7 sprung), 67 warn | 8 | 76% | 0.00 (0.00–0.40) | 10% | 66% | 22% | 3% | 98% of 477 |
| ranger | hired | 216 | 19%: 41 (6 sprung), 68 warn | 7 | 46% | 0.60 (0.00–1.00) | 32% | 39% | 27% | 2% | 97% of 593 |
| monk | alone | 216 | 19%: 42 (7 sprung), 67 warn | 18 | 61% | 0.30 (0.00–0.80) | 13% | 58% | 23% | 6% | 91% of 547 |
| monk | hired | 216 | 19%: 41 (6 sprung), 68 warn | 8 | 36% | 0.80 (0.10–1.00) | 38% | 32% | 26% | 3% | 94% of 606 |

## The big ruin (PT-11)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 89 | 23%: 20 (4 sprung), 44 warn | 5 | 52% | 0.40 (0.00–0.95) | 27% | 45% | 24% | 5% | 95% of 220 |
| warrior | hired | 89 | 23%: 20 (4 sprung), 44 warn | 4 | 33% | 0.80 (0.10–1.00) | 44% | 27% | 27% | 2% | 98% of 245 |
| mage | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 78% | 19% | 4% | 100% of 165 |
| mage | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 64% | 0.20 (0.00–1.00) | 9% | 55% | 33% | 3% | 99% of 298 |
| thief | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 90% | 0.00 (0.00–0.10) | 2% | 71% | 23% | 4% | 97% of 210 |
| thief | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 59% | 0.40 (0.00–0.90) | 17% | 53% | 26% | 4% | 95% of 240 |
| cleric | alone | 89 | 23%: 20 (4 sprung), 44 warn | 6 | 65% | 0.20 (0.00–0.80) | 15% | 56% | 23% | 6% | 95% of 220 |
| cleric | hired | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 36% | 0.80 (0.10–1.00) | 42% | 28% | 27% | 3% | 96% of 253 |
| bard | alone | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 88% | 0.00 (0.00–0.25) | 2% | 72% | 22% | 5% | 98% of 195 |
| bard | hired | 89 | 23%: 20 (4 sprung), 44 warn | 4 | 55% | 0.50 (0.00–1.00) | 19% | 44% | 33% | 4% | 96% of 308 |
| ranger | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 77% | 0.00 (0.00–0.50) | 11% | 63% | 23% | 4% | 98% of 207 |
| ranger | hired | 89 | 23%: 20 (4 sprung), 44 warn | 4 | 46% | 0.60 (0.00–1.00) | 30% | 38% | 28% | 4% | 97% of 262 |
| monk | alone | 89 | 23%: 20 (4 sprung), 44 warn | 7 | 60% | 0.30 (0.00–0.90) | 13% | 54% | 24% | 9% | 89% of 242 |
| monk | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 37% | 0.80 (0.00–1.00) | 39% | 32% | 26% | 3% | 96% of 246 |

## By trouble, alone (standing: median win / died)

| Trouble | Bands | At once, warn (warrior) | warrior | mage | thief | cleric | bard | ranger | monk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A brood under the hill | 4 | 0, 0 | 0.45 / 63% | 0.00 / 100% | 0.00 / 100% | 0.05 / 95% | 0.00 / 100% | 0.05 / 95% | 0.10 / 83% |
| A den in the wild | 13 | 0, 0 | 0.90 / 23% | 0.00 / 80% | 0.10 / 74% | 0.70 / 45% | 0.10 / 74% | 0.40 / 48% | 0.70 / 41% |
| Customs-men on the road | 10 | 0, 0 | 0.15 / 79% | 0.00 / 100% | 0.00 / 100% | 0.05 / 77% | 0.00 / 100% | 0.00 / 98% | 0.10 / 84% |
| Deserters on the road | 6 | 0, 0 | 0.00 / 98% | 0.00 / 100% | 0.00 / 100% | 0.00 / 80% | 0.00 / 100% | 0.00 / 98% | 0.05 / 93% |
| Hobs | 12 | 0, 0 | 0.70 / 41% | 0.00 / 97% | 0.00 / 74% | 0.30 / 56% | 0.10 / 68% | 0.25 / 61% | 0.50 / 49% |
| Outlaws | 12 | 0, 0 | 0.05 / 74% | 0.00 / 95% | 0.00 / 94% | 0.00 / 73% | 0.00 / 93% | 0.00 / 85% | 0.20 / 74% |
| The country's own sites and wild | 138 | 43, 66 | 0.50 / 50% | 0.00 / 96% | 0.00 / 90% | 0.20 / 66% | 0.00 / 89% | 0.00 / 76% | 0.30 / 59% |
| The unquiet tower | 21 | 0, 0 | 0.40 / 57% | 0.00 / 91% | 0.00 / 91% | 0.60 / 53% | 0.00 / 88% | 0.00 / 77% | 0.30 / 59% |

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
