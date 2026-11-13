# Novice viability: after the repairs (techniques rest, foes choose by kind, the covenant, marks before commitment)

Every calling the creation offers (warrior, mage, thief, cleric, bard, ranger, monk), at level 1, alone and with the first town's hire, in 8 generated countries (s1, s2, s3, s4, s5, s6, s7, s8; origin debt), against every band of the first country out of town, 10 fights a band each way (both sides by the game's own tactics, at full health, from the moment it is met). Made by `bun scripts/novice-viability.ts`; deterministic by seed.

- **Unwarned**: of the bands, the share that come at the company the moment it arrives, with no turn to back away; how many (and how many of them spring from hiding: the rest are seen as they move, and the company acts first); and how many warn first. The rest hold off on arrival (they let the company be, demand, or wait to be set on). **Misread**: of those that come at once, how many the page in the moment calls grave or deadly though the company wins at least three in five standing.
- **Stand**: fought to the end, the share of the fights that killed the company, and the median, over bands, of the share won (PT-11's measure), with the spread of the countries' medians.
- **Careful**: a novice that, given a turn (a warning, or the sign one lying in wait gives a company next door, where the rules give it one), takes on no fight the page reckons grave or deadly, and runs when the one who plays is at half their hit points, or at once from a fight that came at it reckoned grave or deadly: of its trials, won, declined, got away, died (or taken prisoner). **Flight**: of the fights it ran in, the share it got away from.
- **Limits**: every fight starts at full health, one band at a time (no attrition, no rest); nothing carried to use up is used (the game's own turns leave that to the player: Battle.plain); the meeting is read from the rules of the watch the company arrives in, not from what other actors decide in it.

## The first ruin

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 48% | 0.70 (0.00–1.00) | 37% | 46% | 14% | 3% | 90% of 102 |
| warrior | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 24% | 1.00 (0.05–1.00) | 54% | 19% | 27% | 0% | 99% of 180 |
| mage | alone | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 84% | 16% | 0% | 100% of 110 |
| mage | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 55% | 0.40 (0.00–1.00) | 25% | 51% | 20% | 4% | 99% of 136 |
| thief | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 91% | 0.00 (0.00–0.10) | 2% | 78% | 20% | 1% | 99% of 135 |
| thief | hired | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 50% | 0.50 (0.00–1.00) | 28% | 49% | 20% | 4% | 94% of 140 |
| cleric | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 63% | 0.30 (0.00–0.80) | 20% | 58% | 19% | 3% | 91% of 139 |
| cleric | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 30% | 0.90 (0.15–1.00) | 40% | 25% | 34% | 1% | 99% of 230 |
| bard | alone | 67 | 19%: 13 (2 sprung), 35 warn | 1 | 89% | 0.00 (0.00–0.25) | 2% | 78% | 19% | 2% | 97% of 129 |
| bard | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 48% | 0.50 (0.00–0.90) | 27% | 51% | 19% | 3% | 95% of 137 |
| ranger | alone | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 75% | 0.10 (0.00–0.90) | 11% | 67% | 21% | 1% | 98% of 146 |
| ranger | hired | 67 | 19%: 13 (2 sprung), 35 warn | 2 | 38% | 0.70 (0.00–1.00) | 38% | 31% | 27% | 3% | 96% of 191 |
| monk | alone | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 59% | 0.30 (0.00–0.90) | 15% | 61% | 18% | 6% | 83% of 143 |
| monk | hired | 67 | 19%: 13 (2 sprung), 35 warn | 0 | 33% | 0.90 (0.00–1.00) | 44% | 31% | 22% | 3% | 95% of 158 |

## The way into the first ruin (its three nearest bands)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 20 | 10%: 2, 6 warn | 1 | 34% | 0.90 (0.00–1.00) | 52% | 30% | 16% | 3% | 89% of 35 |
| warrior | hired | 20 | 10%: 2, 6 warn | 0 | 8% | 1.00 (0.90–1.00) | 66% | 10% | 24% | 1% | 98% of 48 |
| mage | alone | 20 | 10%: 2, 6 warn | 0 | 94% | 0.00 (0.00–0.40) | 0% | 90% | 10% | 0% | 100% of 20 |
| mage | hired | 20 | 10%: 2, 6 warn | 0 | 40% | 0.60 (0.20–1.00) | 39% | 30% | 22% | 10% | 98% of 45 |
| thief | alone | 20 | 10%: 2, 6 warn | 0 | 76% | 0.05 (0.00–0.70) | 6% | 70% | 22% | 3% | 96% of 45 |
| thief | hired | 20 | 10%: 2, 6 warn | 0 | 32% | 0.80 (0.50–1.00) | 40% | 35% | 21% | 4% | 98% of 43 |
| cleric | alone | 20 | 10%: 2, 6 warn | 0 | 46% | 0.65 (0.00–1.00) | 32% | 35% | 28% | 5% | 89% of 63 |
| cleric | hired | 20 | 10%: 2, 6 warn | 0 | 16% | 0.90 (0.60–1.00) | 51% | 10% | 37% | 2% | 97% of 76 |
| bard | alone | 20 | 10%: 2, 6 warn | 0 | 77% | 0.10 (0.00–0.70) | 7% | 70% | 19% | 5% | 93% of 40 |
| bard | hired | 20 | 10%: 2, 6 warn | 0 | 36% | 0.70 (0.30–1.00) | 41% | 35% | 22% | 3% | 94% of 47 |
| ranger | alone | 20 | 10%: 2, 6 warn | 1 | 54% | 0.60 (0.00–0.90) | 26% | 45% | 28% | 2% | 95% of 58 |
| ranger | hired | 20 | 10%: 2, 6 warn | 1 | 23% | 0.95 (0.50–1.00) | 57% | 20% | 20% | 3% | 98% of 41 |
| monk | alone | 20 | 10%: 2, 6 warn | 0 | 47% | 0.50 (0.00–1.00) | 22% | 50% | 19% | 10% | 73% of 51 |
| monk | hired | 20 | 10%: 2, 6 warn | 0 | 18% | 0.95 (0.80–1.00) | 57% | 15% | 25% | 4% | 94% of 52 |

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
| warrior | alone | 216 | 20%: 43 (8 sprung), 66 warn | 3 | 50% | 0.50 (0.00–1.00) | 33% | 47% | 18% | 2% | 94% of 407 |
| warrior | hired | 216 | 19%: 42 (7 sprung), 67 warn | 1 | 28% | 0.90 (0.20–1.00) | 50% | 25% | 24% | 1% | 98% of 527 |
| mage | alone | 216 | 19%: 42 (7 sprung), 67 warn | 1 | 95% | 0.00 (0.00–0.00) | 0% | 82% | 17% | 1% | 99% of 365 |
| mage | hired | 216 | 19%: 41 (6 sprung), 68 warn | 3 | 60% | 0.30 (0.00–0.80) | 22% | 54% | 22% | 3% | 97% of 482 |
| thief | alone | 216 | 20%: 43 (8 sprung), 66 warn | 1 | 89% | 0.00 (0.00–0.05) | 3% | 77% | 19% | 1% | 98% of 423 |
| thief | hired | 216 | 19%: 42 (7 sprung), 67 warn | 3 | 54% | 0.40 (0.00–0.90) | 25% | 50% | 23% | 2% | 95% of 520 |
| cleric | alone | 216 | 19%: 42 (7 sprung), 67 warn | 4 | 65% | 0.20 (0.00–0.90) | 19% | 57% | 19% | 4% | 90% of 465 |
| cleric | hired | 216 | 19%: 41 (6 sprung), 68 warn | 1 | 35% | 0.90 (0.10–1.00) | 37% | 32% | 30% | 1% | 98% of 655 |
| bard | alone | 216 | 19%: 42 (7 sprung), 67 warn | 2 | 88% | 0.00 (0.00–0.30) | 4% | 76% | 19% | 1% | 97% of 431 |
| bard | hired | 216 | 19%: 41 (6 sprung), 68 warn | 3 | 51% | 0.40 (0.10–0.90) | 24% | 49% | 25% | 2% | 96% of 558 |
| ranger | alone | 216 | 19%: 42 (7 sprung), 67 warn | 5 | 76% | 0.00 (0.00–0.40) | 11% | 69% | 20% | 1% | 97% of 440 |
| ranger | hired | 216 | 19%: 41 (6 sprung), 68 warn | 2 | 43% | 0.65 (0.00–0.95) | 35% | 38% | 25% | 2% | 96% of 558 |
| monk | alone | 216 | 19%: 42 (7 sprung), 67 warn | 3 | 61% | 0.30 (0.00–0.80) | 16% | 61% | 18% | 5% | 87% of 453 |
| monk | hired | 216 | 19%: 41 (6 sprung), 68 warn | 2 | 35% | 0.80 (0.00–1.00) | 42% | 32% | 24% | 2% | 96% of 550 |

## The big ruin (PT-11)

| Calling | Company | Bands | Unwarned: at once, warn | Misread | Stand: died | median win (countries) | Careful: won | declined | got away | died | Flight |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| warrior | alone | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 49% | 0.60 (0.00–1.00) | 35% | 46% | 16% | 3% | 93% of 157 |
| warrior | hired | 89 | 23%: 20 (4 sprung), 44 warn | 0 | 28% | 0.90 (0.05–1.00) | 52% | 24% | 24% | 0% | 99% of 219 |
| mage | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 97% | 0.00 (0.00–0.10) | 0% | 82% | 18% | 0% | 100% of 160 |
| mage | hired | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 58% | 0.30 (0.00–1.00) | 23% | 52% | 21% | 4% | 97% of 192 |
| thief | alone | 89 | 23%: 20 (4 sprung), 44 warn | 0 | 90% | 0.00 (0.00–0.10) | 3% | 75% | 21% | 1% | 97% of 191 |
| thief | hired | 89 | 23%: 20 (4 sprung), 44 warn | 3 | 54% | 0.40 (0.00–1.00) | 25% | 51% | 22% | 3% | 95% of 206 |
| cleric | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 65% | 0.20 (0.00–0.80) | 18% | 61% | 18% | 3% | 93% of 176 |
| cleric | hired | 89 | 23%: 20 (4 sprung), 44 warn | 0 | 34% | 0.90 (0.15–1.00) | 37% | 30% | 32% | 1% | 99% of 288 |
| bard | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 88% | 0.00 (0.00–0.25) | 3% | 76% | 19% | 2% | 97% of 178 |
| bard | hired | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 52% | 0.40 (0.00–0.90) | 24% | 51% | 23% | 2% | 96% of 214 |
| ranger | alone | 89 | 23%: 20 (4 sprung), 44 warn | 1 | 77% | 0.00 (0.00–0.50) | 11% | 67% | 21% | 0% | 98% of 193 |
| ranger | hired | 89 | 23%: 20 (4 sprung), 44 warn | 2 | 42% | 0.60 (0.00–1.00) | 34% | 37% | 26% | 3% | 97% of 239 |
| monk | alone | 89 | 23%: 20 (4 sprung), 44 warn | 0 | 61% | 0.30 (0.00–0.90) | 17% | 60% | 18% | 6% | 86% of 188 |
| monk | hired | 89 | 23%: 20 (4 sprung), 44 warn | 0 | 36% | 0.80 (0.00–1.00) | 43% | 34% | 21% | 3% | 95% of 197 |

## By trouble, alone (standing: median win / died)

| Trouble | Bands | At once, warn (warrior) | warrior | mage | thief | cleric | bard | ranger | monk |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A brood under the hill | 4 | 0, 0 | 0.45 / 63% | 0.00 / 100% | 0.00 / 100% | 0.05 / 95% | 0.00 / 100% | 0.05 / 95% | 0.10 / 83% |
| A den in the wild | 13 | 0, 0 | 0.90 / 23% | 0.00 / 80% | 0.10 / 74% | 0.70 / 45% | 0.10 / 74% | 0.40 / 48% | 0.70 / 41% |
| Customs-men on the road | 10 | 0, 0 | 0.15 / 81% | 0.00 / 100% | 0.00 / 100% | 0.05 / 78% | 0.00 / 100% | 0.00 / 96% | 0.10 / 88% |
| Deserters on the road | 6 | 0, 0 | 0.00 / 93% | 0.00 / 100% | 0.00 / 100% | 0.00 / 80% | 0.00 / 100% | 0.00 / 98% | 0.00 / 95% |
| Hobs | 12 | 0, 0 | 0.70 / 41% | 0.00 / 97% | 0.00 / 74% | 0.30 / 56% | 0.10 / 68% | 0.25 / 61% | 0.50 / 49% |
| Outlaws | 12 | 0, 0 | 0.10 / 73% | 0.00 / 95% | 0.00 / 94% | 0.00 / 73% | 0.00 / 93% | 0.00 / 85% | 0.20 / 74% |
| The country's own sites and wild | 138 | 43, 66 | 0.60 / 48% | 0.00 / 96% | 0.00 / 90% | 0.20 / 67% | 0.00 / 89% | 0.00 / 76% | 0.30 / 60% |
| The unquiet tower | 21 | 0, 0 | 0.60 / 43% | 0.00 / 91% | 0.00 / 91% | 0.60 / 52% | 0.00 / 87% | 0.00 / 77% | 0.30 / 59% |

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
