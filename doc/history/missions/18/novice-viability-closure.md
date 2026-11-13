# Novice viability: at the closure, 3 November

Every calling the creation offers (warrior, mage, thief, cleric, bard, ranger, monk), at level 1, alone and with the first town's hire, in 8 generated countries (s1, s2, s3, s4, s5, s6, s7, s8; origin debt), against every band of the first country out of town, 10 fights a band each way (both sides by the game's own tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic by seed.

- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly though the company wins at least three in five standing.
- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands, of the share won (PT-11's measure), with the spread of the countries' medians.
- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door, where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran in, the share it got away from.
- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to use up is used (the game's own turns leave that to the player: Battle.plain); the meeting is read from the rules of the watch the company arrives in, not from what other actors decide in it.

## The first ruin

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 65 | 17%: 11, 35 warn | 0 | 44% | 0.70 (0.00–1.00) | 42% | 42% | 14% | 3% | 90% of 102 |
| warrior | hired | 65 | 17%: 11, 35 warn | 0 | 20% | 1.00 (0.25–1.00) | 58% | 14% | 28% | 0% | 100% of 185 |
| mage | alone | 65 | 17%: 11, 35 warn | 1 | 96% | 0.00 (0.00–0.20) | 0% | 83% | 17% | 0% | 100% of 110 |
| mage | hired | 65 | 17%: 11, 35 warn | 0 | 51% | 0.50 (0.00–1.00) | 28% | 46% | 21% | 5% | 99% of 138 |
| thief | alone | 65 | 17%: 11, 35 warn | 0 | 89% | 0.00 (0.00–0.40) | 3% | 75% | 21% | 1% | 98% of 138 |
| thief | hired | 65 | 17%: 11, 35 warn | 1 | 45% | 0.60 (0.00–1.00) | 31% | 43% | 21% | 4% | 93% of 149 |
| cleric | alone | 65 | 17%: 11, 35 warn | 0 | 60% | 0.40 (0.00–0.80) | 22% | 54% | 21% | 3% | 91% of 146 |
| cleric | hired | 65 | 17%: 11, 35 warn | 0 | 25% | 0.90 (0.25–1.00) | 45% | 20% | 35% | 1% | 99% of 228 |
| bard | alone | 65 | 17%: 11, 35 warn | 1 | 87% | 0.00 (0.00–0.50) | 4% | 75% | 19% | 2% | 97% of 130 |
| bard | hired | 65 | 17%: 11, 35 warn | 0 | 44% | 0.50 (0.20–0.95) | 31% | 46% | 20% | 3% | 95% of 136 |
| ranger | alone | 65 | 17%: 11, 35 warn | 2 | 71% | 0.10 (0.00–0.90) | 13% | 63% | 23% | 1% | 97% of 152 |
| ranger | hired | 65 | 17%: 11, 35 warn | 1 | 34% | 0.80 (0.00–1.00) | 42% | 26% | 28% | 3% | 96% of 190 |
| monk | alone | 65 | 17%: 11, 35 warn | 0 | 55% | 0.40 (0.00–0.90) | 18% | 57% | 19% | 6% | 82% of 147 |
| monk | hired | 65 | 17%: 11, 35 warn | 0 | 28% | 0.90 (0.25–1.00) | 49% | 26% | 23% | 3% | 95% of 155 |

## The way into the first ruin (its three nearest bands)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 22 | 5%: 1, 9 warn | 0 | 35% | 0.90 (0.00–1.00) | 56% | 32% | 11% | 2% | 85% of 27 |
| warrior | hired | 22 | 5%: 1, 9 warn | 0 | 11% | 1.00 (0.90–1.00) | 67% | 14% | 19% | 0% | 100% of 42 |
| mage | alone | 22 | 5%: 1, 9 warn | 0 | 91% | 0.00 (0.00–0.40) | 0% | 96% | 5% | 0% | 100% of 10 |
| mage | hired | 22 | 5%: 1, 9 warn | 0 | 36% | 0.65 (0.40–1.00) | 43% | 32% | 16% | 9% | 97% of 37 |
| thief | alone | 22 | 5%: 1, 9 warn | 0 | 74% | 0.15 (0.00–0.70) | 8% | 73% | 16% | 3% | 92% of 38 |
| thief | hired | 22 | 5%: 1, 9 warn | 0 | 29% | 0.85 (0.50–1.00) | 44% | 36% | 16% | 4% | 95% of 37 |
| cleric | alone | 22 | 5%: 1, 9 warn | 0 | 43% | 0.70 (0.00–1.00) | 35% | 36% | 24% | 5% | 87% of 60 |
| cleric | hired | 22 | 5%: 1, 9 warn | 0 | 16% | 0.95 (0.70–1.00) | 55% | 14% | 30% | 2% | 97% of 68 |
| bard | alone | 22 | 5%: 1, 9 warn | 0 | 73% | 0.15 (0.00–0.70) | 10% | 73% | 13% | 5% | 90% of 31 |
| bard | hired | 22 | 5%: 1, 9 warn | 0 | 34% | 0.75 (0.30–1.00) | 45% | 36% | 16% | 2% | 92% of 39 |
| ranger | alone | 22 | 5%: 1, 9 warn | 1 | 50% | 0.70 (0.00–0.90) | 30% | 46% | 22% | 3% | 91% of 54 |
| ranger | hired | 22 | 5%: 1, 9 warn | 0 | 24% | 1.00 (0.50–1.00) | 61% | 23% | 14% | 3% | 97% of 32 |
| monk | alone | 22 | 5%: 1, 9 warn | 0 | 44% | 0.60 (0.00–1.00) | 27% | 50% | 13% | 10% | 64% of 45 |
| monk | hired | 22 | 5%: 1, 9 warn | 0 | 20% | 1.00 (0.80–1.00) | 61% | 18% | 18% | 3% | 93% of 43 |

## The placed troubles (dens, raiders, tolls and the rest)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 78 | 0%: 0, 0 warn | 0 | 54% | 0.40 (0.05–1.00) | 28% | 55% | 15% | 2% | 92% of 124 |
| warrior | hired | 78 | 0%: 0, 0 warn | 0 | 29% | 0.90 (0.25–1.00) | 49% | 30% | 20% | 1% | 97% of 163 |
| mage | alone | 78 | 0%: 0, 0 warn | 0 | 93% | 0.00 (0.00–0.00) | 1% | 96% | 2% | 1% | 80% of 15 |
| mage | hired | 78 | 0%: 0, 0 warn | 0 | 60% | 0.30 (0.00–0.90) | 23% | 63% | 12% | 2% | 91% of 103 |
| thief | alone | 78 | 0%: 0, 0 warn | 0 | 88% | 0.00 (0.00–0.20) | 4% | 91% | 4% | 1% | 88% of 32 |
| thief | hired | 78 | 0%: 0, 0 warn | 0 | 54% | 0.40 (0.00–1.00) | 26% | 58% | 15% | 1% | 97% of 122 |
| cleric | alone | 78 | 0%: 0, 0 warn | 0 | 62% | 0.20 (0.00–0.95) | 23% | 60% | 11% | 7% | 80% of 102 |
| cleric | hired | 78 | 0%: 0, 0 warn | 0 | 35% | 0.90 (0.10–1.00) | 39% | 39% | 21% | 1% | 94% of 176 |
| bard | alone | 78 | 0%: 0, 0 warn | 0 | 86% | 0.00 (0.00–0.40) | 7% | 86% | 6% | 1% | 89% of 53 |
| bard | hired | 78 | 0%: 0, 0 warn | 0 | 51% | 0.40 (0.10–0.95) | 25% | 56% | 17% | 2% | 92% of 141 |
| ranger | alone | 78 | 0%: 0, 0 warn | 0 | 76% | 0.10 (0.00–0.40) | 11% | 81% | 7% | 1% | 89% of 62 |
| ranger | hired | 78 | 0%: 0, 0 warn | 0 | 43% | 0.70 (0.00–1.00) | 36% | 45% | 18% | 2% | 95% of 145 |
| monk | alone | 78 | 0%: 0, 0 warn | 0 | 65% | 0.30 (0.00–0.75) | 16% | 72% | 10% | 3% | 84% of 88 |
| monk | hired | 78 | 0%: 0, 0 warn | 0 | 36% | 0.80 (0.10–1.00) | 39% | 36% | 23% | 2% | 93% of 193 |

## The whole first country (every band out of town)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 263 | 16%: 41 (6 sprung), 115 warn | 1 | 43% | 0.70 (0.10–1.00) | 42% | 40% | 17% | 2% | 92% of 470 |
| warrior | hired | 263 | 15%: 40 (5 sprung), 116 warn | 2 | 22% | 1.00 (0.40–1.00) | 58% | 19% | 21% | 1% | 98% of 574 |
| mage | alone | 263 | 15%: 40 (5 sprung), 116 warn | 1 | 90% | 0.00 (0.00–0.10) | 2% | 81% | 15% | 1% | 97% of 406 |
| mage | hired | 263 | 15%: 39 (4 sprung), 117 warn | 3 | 49% | 0.50 (0.00–1.00) | 31% | 44% | 22% | 3% | 96% of 599 |
| thief | alone | 263 | 16%: 41 (6 sprung), 115 warn | 1 | 83% | 0.00 (0.00–0.10) | 6% | 73% | 19% | 2% | 95% of 520 |
| thief | hired | 263 | 15%: 40 (5 sprung), 116 warn | 3 | 44% | 0.60 (0.00–1.00) | 34% | 40% | 23% | 3% | 95% of 640 |
| cleric | alone | 263 | 15%: 40 (5 sprung), 116 warn | 4 | 56% | 0.40 (0.00–0.90) | 27% | 48% | 19% | 5% | 87% of 579 |
| cleric | hired | 263 | 15%: 39 (4 sprung), 117 warn | 0 | 28% | 0.90 (0.30–1.00) | 46% | 26% | 27% | 1% | 98% of 733 |
| bard | alone | 263 | 15%: 40 (5 sprung), 116 warn | 2 | 81% | 0.00 (0.00–0.40) | 7% | 72% | 18% | 2% | 95% of 508 |
| bard | hired | 263 | 15%: 39 (4 sprung), 117 warn | 5 | 42% | 0.70 (0.20–1.00) | 32% | 41% | 25% | 2% | 96% of 686 |
| ranger | alone | 263 | 15%: 40 (5 sprung), 116 warn | 5 | 67% | 0.10 (0.00–0.50) | 18% | 60% | 20% | 2% | 96% of 555 |
| ranger | hired | 263 | 15%: 39 (4 sprung), 117 warn | 1 | 35% | 0.80 (0.00–1.00) | 45% | 31% | 22% | 2% | 96% of 601 |
| monk | alone | 263 | 15%: 40 (5 sprung), 116 warn | 2 | 53% | 0.40 (0.10–0.90) | 24% | 53% | 19% | 5% | 88% of 573 |
| monk | hired | 263 | 15%: 39 (4 sprung), 117 warn | 1 | 28% | 0.90 (0.40–1.00) | 52% | 25% | 21% | 2% | 96% of 581 |

## The big ruin (PT-11)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 47% | 0.60 (0.00–1.00) | 37% | 44% | 17% | 3% | 93% of 155 |
| warrior | hired | 85 | 21%: 18 (2 sprung), 42 warn | 0 | 25% | 1.00 (0.25–1.00) | 54% | 20% | 26% | 0% | 100% of 224 |
| mage | alone | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 96% | 0.00 (0.00–0.10) | 0% | 81% | 19% | 0% | 100% of 160 |
| mage | hired | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 56% | 0.40 (0.00–1.00) | 25% | 49% | 22% | 4% | 97% of 192 |
| thief | alone | 85 | 21%: 18 (2 sprung), 42 warn | 0 | 89% | 0.00 (0.00–0.10) | 3% | 74% | 22% | 1% | 97% of 191 |
| thief | hired | 85 | 21%: 18 (2 sprung), 42 warn | 3 | 52% | 0.40 (0.00–1.00) | 26% | 47% | 24% | 3% | 95% of 211 |
| cleric | alone | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 63% | 0.30 (0.00–0.80) | 19% | 59% | 19% | 3% | 93% of 176 |
| cleric | hired | 85 | 21%: 18 (2 sprung), 42 warn | 0 | 31% | 0.90 (0.15–1.00) | 39% | 27% | 33% | 1% | 99% of 284 |
| bard | alone | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 88% | 0.00 (0.00–0.25) | 3% | 75% | 20% | 2% | 97% of 178 |
| bard | hired | 85 | 21%: 18 (2 sprung), 42 warn | 2 | 50% | 0.50 (0.00–0.90) | 26% | 48% | 24% | 2% | 96% of 211 |
| ranger | alone | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 76% | 0.00 (0.00–0.50) | 11% | 66% | 22% | 1% | 98% of 193 |
| ranger | hired | 85 | 21%: 18 (2 sprung), 42 warn | 1 | 40% | 0.70 (0.00–1.00) | 36% | 34% | 27% | 3% | 97% of 237 |
| monk | alone | 85 | 21%: 18 (2 sprung), 42 warn | 0 | 59% | 0.30 (0.00–0.90) | 17% | 58% | 19% | 6% | 86% of 188 |
| monk | hired | 85 | 21%: 18 (2 sprung), 42 warn | 0 | 33% | 0.90 (0.20–1.00) | 45% | 31% | 22% | 3% | 95% of 194 |

## By trouble, alone (standing: median win / died)

| Trouble | Bands | At once, warn (warrior) | warrior | mage | thief | cleric | bard | ranger | monk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A brood under the hill | 4 | 0, 0 | 0.45 / 63% | 0.00 / 100% | 0.00 / 100% | 0.05 / 95% | 0.00 / 100% | 0.05 / 95% | 0.10 / 83% |
| A den in the wild | 13 | 0, 0 | 0.90 / 23% | 0.00 / 80% | 0.10 / 74% | 0.70 / 45% | 0.10 / 74% | 0.40 / 48% | 0.70 / 41% |
| Customs-men on the road | 10 | 0, 0 | 0.15 / 81% | 0.00 / 100% | 0.00 / 100% | 0.05 / 78% | 0.00 / 100% | 0.00 / 96% | 0.10 / 88% |
| Deserters on the road | 6 | 0, 0 | 0.00 / 93% | 0.00 / 100% | 0.00 / 100% | 0.00 / 80% | 0.00 / 100% | 0.00 / 98% | 0.00 / 95% |
| Hobs | 12 | 0, 0 | 0.70 / 41% | 0.00 / 97% | 0.00 / 74% | 0.30 / 56% | 0.10 / 68% | 0.25 / 61% | 0.50 / 49% |
| Outlaws | 12 | 0, 0 | 0.10 / 73% | 0.00 / 95% | 0.00 / 94% | 0.00 / 73% | 0.00 / 93% | 0.00 / 85% | 0.20 / 74% |
| The country's own sites and wild | 185 | 41, 115 | 0.80 / 38% | 0.00 / 89% | 0.00 / 80% | 0.50 / 53% | 0.00 / 79% | 0.20 / 63% | 0.50 / 48% |
| The unquiet tower | 21 | 0, 0 | 0.60 / 43% | 0.00 / 91% | 0.00 / 91% | 0.60 / 52% | 0.00 / 87% | 0.00 / 77% | 0.30 / 59% |

## The countries

| Seed | First ruin (from the start, bands) | Big ruin (bands) | First hire (fee of the coin carried) | Bands | Unwarned |
|---|---|---|---|---:|---:|
| s1 | Nocstumul, 1.2 h, 2 | Sanhtustumul, 10 | Orym (bard), 3 of 21 coin | 32 | 6 |
| s2 | Umbrarecs, 1.2 h, 11 | Umbrarecs, 11 | Fenwick (mage), 3 of 21 coin | 35 | 9 |
| s3 | Lapisrechies, 2 h, 10 | Lapisrechies, 10 | Delta (mage), 3 of 21 coin | 33 | 6 |
| s4 | Tenebrerecs, 1.5 h, 9 | Tenebrerecs, 9 | Rolen (warrior), 3 of 21 coin | 33 | 8 |
| s5 | Somnumcarmen, 2.3 h, 10 | Somnumcarmen, 10 | Liora (mage), 3 of 21 coin | 31 | 0 |
| s6 | Chitharcaw, 2.3 h, 9 | Chitharcaw, 9 | Cadan (warrior), 3 of 21 coin | 28 | 0 |
| s7 | Graegweard, 1.7 h, 2 | Cuprumtener, 14 | Devlin (bard), 3 of 21 coin | 38 | 8 |
| s8 | Obscuruslac, 1.5 h, 12 | Obscuruslac, 12 | Boddynock (bard), 3 of 21 coin | 33 | 4 |
