# Placements: the first country's fights, fought where they are placed

Evidence for PL-07 (the first fights are trivial) and for whether the SRD kinds can be placed (the ghoul's lesson:
[srd-invariants.md](srd-invariants.md), "Withdrawn"). **Nothing here is retuned**; each row is a measurement and each
flag a recommendation for whoever owns the placement.

## Method

- **The country:** `a1`, assembled whole (`WorldAssembler`, 13 s), with its creatures exactly as the world made them:
  their kind, level, hit points, variations and conditions (the creature records, cloned), in the numbers placed.
- **What is fought:** every hostile group of the first town's undertown (`s1_u_*`, from
  `data/generation/town/undertown.kyrt`) and of the first wild sites round it (`w1`–`w8`, `e1`); tame and domestic
  animals left out. Each placement of Orsino's ghoul is fought a second time with the barrow ghoul (`ghoul/barrow`,
  the SRD's) in its place, same number, as the answer to "can it go there".
- **Against:** three first-level companies of humans, made by the ordinary creation path from 20 seeds each: a
  warrior alone, a warrior and a cleric, a thief alone. Both sides chosen by the battle's own tactics
  (`Tactics.choose`), as the bestiary measures.
- **Recorded:** the company's win rate; the median rounds of a win; the median harm (share of the company's hit
  points gone at the end, every fight, won or lost); the share of fights in which one of the company fell.
- **What it is not:** the fight in the session. It has no weariness, light or darkness, no opening moment (who saw
  whom first), no choice to turn back or flee before the first blow, and the party is the AI's, not a player's. Real
  play is somewhat kinder (a player can retreat) and somewhat harsher (a weary or unlit company). The tool is a
  scratch script, `/var/tmp/kyrie/steps/placed.ts` (lists a country's bodies) and `placements.ts` (fights them),
  about 50 s for the 39 groups × 3 companies × 20 seeds.

Each cell is **win · median rounds · median harm · a death**.

| Placement | Foes as placed (HP) | Warrior | Warrior + cleric | Thief | Verdict |
|---|---|---|---|---|---|
| w1_frogs | 3 × frog L1 (2/2/2) | 90% · 3 · 0% · 5% | 100% · 2 · 0% · 0% | 70% · 5 · 50% · 30% | trivial |
| w1_newcomers | 2 × hound/cave L2 (10/10) | 70% · 9 · 20% · 30% | 100% · 5 · 17% · 5% | 15% · 5 · 100% · 85% | fair |
| w1_denned | 1 × hound/cave L1 (6) | 100% · 2 · 0% · 0% | 100% · 2 · 0% · 0% | 65% · 3 · 62% · 35% | trivial |
| w2_newcomers | 2 × hound/cave L2 (8/10) | 80% · 7 · 21% · 20% | 100% · 4 · 12% · 10% | 10% · 6 · 100% · 90% | fair |
| w2_denned | 1 × hound/cave L1 (7) | 100% · 2 · 0% · 0% | 100% · 2 · 0% · 0% | 80% · 3 · 0% · 20% | trivial |
| w3_dead | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% | 95% · 5 · 13% · 5% | 5% · 7 · 100% · 95% | fair |
| w3_dead | 2 × ghoul/barrow (in place of the ghouls) (13/13) | 15% · 4 · 100% · 85% | 30% · 7 · 100% · 80% | 0% · – · 100% · 100% | hypothetical |
| w3_newcomers | 2 × zombie L2 (10/9) | 85% · 7 · 27% · 15% | 95% · 4 · 12% · 5% | 5% · 4 · 100% · 95% | fair |
| w3_denned | 1 × zombie L1 (6) | 100% · 3 · 0% · 0% | 100% · 2 · 0% · 0% | 90% · 3 · 0% · 10% | trivial |
| w4_dead | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% | 95% · 5 · 13% · 5% | 5% · 7 · 100% · 95% | fair |
| w4_dead | 2 × ghoul/barrow (in place of the ghouls) (13/13) | 15% · 4 · 100% · 85% | 30% · 7 · 100% · 80% | 0% · – · 100% · 100% | hypothetical |
| w4_newcomers | 2 × zombie L2 (7/9) | 95% · 5 · 20% · 5% | 100% · 3 · 8% · 5% | 15% · 4 · 100% · 85% | fair |
| w4_denned | 1 × zombie L1 (7) | 100% · 2 · 0% · 0% | 100% · 2 · 0% · 0% | 70% · 3 · 50% · 30% | trivial |
| w5_newcomers | 1 × ghoul L2 (16) | 95% · 4 · 12% · 0% | 100% · 3 · 0% · 0% | 20% · 7 · 100% · 80% | trivial |
| w5_newcomers | 1 × ghoul/barrow (in place of the ghouls) (16) | 60% · 5 · 75% · 40% | 90% · 3 · 17% · 30% | 0% · – · 100% · 100% | hypothetical |
| w5_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% | 100% · 2 · 0% · 0% | 45% · 4 · 100% · 55% | trivial |
| w5_denned | 1 × ghoul/barrow (in place of the ghouls) (13) | 60% · 5 · 67% · 40% | 85% · 3 · 16% · 30% | 5% · 3 · 100% · 95% | hypothetical |
| w6_wolves | 3 × wolf L1 (6/8/6) | 55% · 5 · 60% · 45% | 90% · 6 · 30% · 25% | 5% · 5 · 100% · 95% | fair |
| w6_newcomers | 1 × ghoul L3 (19) | 90% · 9 · 0% · 10% | 100% · 5 · 0% · 5% | 0% · – · 100% · 100% | trivial |
| w6_newcomers | 1 × ghoul/barrow (in place of the ghouls) (19) | 35% · 4 · 100% · 65% | 80% · 4 · 22% · 35% | 0% · – · 100% · 100% | hypothetical |
| w6_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% | 100% · 2 · 0% · 0% | 45% · 4 · 100% · 55% | trivial |
| w6_denned | 1 × ghoul/barrow (in place of the ghouls) (13) | 60% · 5 · 67% · 40% | 85% · 3 · 16% · 30% | 5% · 3 · 100% · 95% | hypothetical |
| w7_keeper | 1 × elemental/water_element L5 (35) | 0% · – · 100% · 100% | 25% · 6 · 100% · 75% | 0% · – · 100% · 100% | lethal |
| w8_barrow_chamber_dwellers | 4 × bat L1 (1/1/1/1) | 90% · 2 · 0% · 10% | 100% · 3 · 0% · 0% | 45% · 5 · 100% · 55% | trivial |
| w8_barrow_chamber_device | 1 × phylactery L1 (8) | 90% · 2 · 0% · 10% | 95% · 2 · 0% · 5% | 60% · 3 · 43% · 40% | trivial |
| w8_barrow_recess_dwellers | 5 × rat L2 (2/2/2/2/2) | 85% · 6 · 21% · 15% | 95% · 4 · 18% · 10% | 5% · 7 · 100% · 95% | fair |
| w8_halls_gallery_dwellers | 2 × zombie L1 (9/8) | 100% · 6 · 0% · 0% | 100% · 3 · 8% · 5% | 25% · 5 · 100% · 75% | trivial |
| w8_halls_gallery_dwellers_beside | 1 × centipede L1 (2) | 100% · 2 · 8% · 0% | 100% · 1 · 4% · 0% | 85% · 1 · 18% · 15% | trivial |
| w8_halls_mourners_dwellers | 3 × hound/skeletal L2 (11/11/11) | 30% · 12 · 100% · 70% | 85% · 6 · 20% · 30% | 0% · – · 100% · 100% | lethal |
| w8_halls_ossuary_dwellers | 3 × spider L1 (4/4/4) | 0% · – · 100% · 100% | 35% · 5 · 100% · 90% | 0% · – · 100% · 100% | lethal |
| w8_halls_embalmers_dwellers | 2 × spirit L3 (17/17) | 5% · 23 · 100% · 55% | 20% · 13 · 57% · 65% | 0% · – · 100% · 100% | lethal |
| w8_halls_newcomers | 3 × ghoul L2 (16/16/16) | 30% · 10 · 100% · 70% | 60% · 11 · 48% · 45% | 0% · – · 100% · 100% | lethal |
| w8_halls_newcomers | 3 × ghoul/barrow (in place of the ghouls) (16/16/16) | 0% · – · 100% · 100% | 0% · – · 100% · 100% | 0% · – · 100% · 100% | hypothetical |
| w8_keeper | 1 × mummy L12 (48) | 0% · – · 100% · 100% | 15% · 16 · 100% · 95% | 0% · – · 100% · 100% | lethal |
| e1_wolves | 3 × wolf L2 (7/12/9) | 30% · 11 · 100% · 70% | 75% · 6 · 39% · 40% | 0% · – · 100% · 100% | lethal |
| e1_newcomers | 1 × ghoul L3 (19) | 90% · 9 · 0% · 10% | 100% · 5 · 0% · 5% | 0% · – · 100% · 100% | trivial |
| e1_newcomers | 1 × ghoul/barrow (in place of the ghouls) (19) | 35% · 4 · 100% · 65% | 80% · 4 · 22% · 35% | 0% · – · 100% · 100% | hypothetical |
| e1_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% | 100% · 2 · 0% · 0% | 45% · 4 · 100% · 55% | trivial |
| e1_denned | 1 × ghoul/barrow (in place of the ghouls) (13) | 60% · 5 · 67% · 40% | 85% · 3 · 16% · 30% | 5% · 3 · 100% · 95% | hypothetical |
| s1_u_rats | 5 × rat L1 (2/2/2/2/2) | 85% · 6 · 25% · 15% | 100% · 4 · 8% · 0% | 10% · 9 · 100% · 90% | fair |
| s1_u_buck | 1 × rat/great L2 (8) | 100% · 2 · 0% · 0% | 100% · 2 · 0% · 5% | 85% · 4 · 18% · 15% | trivial |
| s1_u_dead | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% | 95% · 5 · 13% · 5% | 5% · 7 · 100% · 95% | fair |
| s1_u_dead | 2 × ghoul/barrow (in place of the ghouls) (13/13) | 15% · 4 · 100% · 85% | 30% · 7 · 100% · 80% | 0% · – · 100% · 100% | hypothetical |
| s1_u_spiders | 2 × spider/great/cave L1 (6/7) | 35% · 4 · 100% · 65% | 80% · 3 · 46% · 45% | 0% · – · 100% · 100% | lethal |
| s1_u_mother | 1 × spider/great/cave L2 (15) | 70% · 4 · 42% · 30% | 95% · 3 · 21% · 25% | 10% · 6 · 100% · 90% | fair |
| s1_u_shamblers | 3 × zombie L1 (8/6/7) | 85% · 8 · 33% · 15% | 100% · 5 · 16% · 10% | 0% · – · 100% · 100% | fair |
| s1_u_beetles | 5 × beetle L1 (2/2/2/2/2) | 75% · 5 · 29% · 25% | 100% · 4 · 18% · 10% | 10% · 6 · 100% · 90% | fair |
| s1_u_crawler | 1 × centipede/great L2 (7) | 100% · 2 · 7% · 0% | 100% · 2 · 11% · 10% | 55% · 3 · 80% · 45% | trivial |
| s1_u_keeper | 1 × ghoul L2 (16) | 95% · 4 · 12% · 0% | 100% · 3 · 0% · 0% | 20% · 7 · 100% · 80% | trivial |
| s1_u_keeper | 1 × ghoul/barrow (in place of the ghouls) (16) | 60% · 5 · 75% · 40% | 90% · 3 · 17% · 30% | 0% · – · 100% · 100% | hypothetical |

Counts: 18 trivial, 13 fair, 8 lethal; 11 hypothetical rows (the barrow ghoul in a ghoul's place).

Verdicts: **trivial** is a warrior alone winning 90 % or more for 15 % harm or less, and the pair 95 % or more;
**lethal** is a warrior alone winning under half, or the pair under 70 %.

## What it says

**PL-07 is real, and it is the company that decides it.** For a first-level warrior, eighteen of the 39 placements
are trivial: every *denned* single (one cave hound, one zombie, one ghoul of the first level: 100 %, 2–4 rounds, no
harm), the undertown's great rat buck, great centipede and ghoul keeper, the frogs, the barrow's bats and gallery.
With a cleric beside him the whole undertown but its spiders is a walkover (95–100 %, 21 % harm at most). The fights that are
not trivial for a warrior are the *packs*: three wolves (55 %), five rats (85 %, 25 % harm), five beetles (75 %).

**A thief alone dies to nearly everything.** A win in 20 % or fewer of the fights against every pack but the frogs
and the bats, and against most second-level foes (not the great rat or the great centipede), with a death in 80–100 %
of them. Whatever PL-07 decides, a lone first-level thief is a different game from a lone
warrior; the ecology's budget (a company of one) prices them the same.

**The SRD ghoul cannot go where Orsino's is.** In the ossuary (`s1_u_dead`, two ghouls of the first level) a lone
warrior wins 80 % against Orsino's and 15 % against the barrow ghoul (death 85 %); the pair 95 % against 30 %. The
barrow ghoul is a second-level warrior's fight one-for-one (its measured challenge, 2), and two of them are more.
Alone and denned it is a fair fight for a warrior (60 %, two-thirds harm) and a fair one for the pair (85 %).

## Flags and recommendations

| Placement | Flag | Recommendation |
|---|---|---|
| Denned singles (`w1`–`w6`, `e1` `_denned`; one cave hound, zombie or ghoul of the first level) | trivial | Keep them as the first rung, but give each its pair or a second den on the way (number, not the kind's numbers): one alone teaches nothing after the first. |
| `w5_newcomers`, `w6_newcomers`, `e1_newcomers` (one ghoul of level 2–3) | trivial for a warrior (90–95 %, no harm) | Orsino's ghoul grows only its hit points with level (16, 19); its blows do not. These are the natural place for the barrow ghoul *alone* (60 %/85 %): a fair fight. Not without a placement review of each. |
| `s1_u_buck`, `s1_u_crawler`, `s1_u_keeper` | trivial | The undertown's "boss" rooms are the easiest in it. A keeper ought to be the hardest: put it last, or make it a pair. |
| `w1_frogs`, `w8` bats, phylactery, gallery | trivial | Leave: atmosphere, not fights. |
| `s1_u_spiders` (two great cave spiders) | lethal (warrior 35 %, pair 80 %, thief 0 %) | The undertown's deadliest room is not its keeper's. Tell it before the door (the webs, the bones), or swap it with the keeper's place so it is met last. |
| `w8_halls_ossuary` (three spiders) | lethal (warrior 0 %, pair 35 %) | Poison in threes is the barrow's real killer; plain spiders out-kill its skeletal hounds. Mark it, or two not three. |
| `w8_halls_mourners`, `w8_halls_newcomers`, `w8_halls_embalmers` | lethal | A second- or third-level barrow; right for its depth if the barrow says so at its door. Leave the kinds; check that the barrow is not a first site of a first-level company's aims. |
| `w8_keeper` (mummy, level 12), `w7_keeper` (water elemental, level 5) | lethal | Keepers meant to be beyond the company: they must be told as beyond it before the fight, and escapable. |
| `e1_wolves` (three wolves of level 2) | lethal (warrior 30 %) | A first site's pack of three second-level wolves is the most dangerous open-country fight here; one level lower (as `w6`'s) makes it fair. |
| Every ghoul placement, with the barrow ghoul | hypothetical, mostly lethal | Do not place the barrow ghoul in a brood. Alone, at the depth of a second-level company, it is the fair fight these ghoul rooms are not. |

## The SRD kinds' standing, beside this

| Kind | Challenge (level 1, 5) | Placed |
|---|---|---|
| `ghoul` (Orsino's) | 0.5, 1 | barrows, ruins, fens, the ossuary |
| `ghoul/barrow` | 2, 4 | nowhere (`unplaced`) |
| `unicorn` | 24, 24 | nowhere (no habitat) |
| `golem/flesh` | 24, 24 | nowhere (`unplaced`) |

The unicorn and the flesh golem are at the table's ceiling because no blade the catalog has passes 10/magic or
5/adamantine: until a magic or adamantine weapon exists, neither can be a fight for a company of blades, at any level.

## Acted on: the lead's PL-07 decisions (13 November, batch 3)

Every change is to placement data or telling, none to a stat block.

1. **Denned singles get company by number.** A work's den holds half its den's number, and never one alone where two
   are still within a first den's danger (`RegionStock.numbers`: two of a kind of challenge one or less; one beyond the
   budget stays alone). Spec: `test/region-stock-numbers.test.ts` (0.3 s; both halves of the rule mutation-checked).
2. **The undertown's deepest room is no longer its easiest.** The vault's keeper is the barrow ghoul alone (decision
   5's room; see below), where Orsino's ghoul had been won 95 % of the time by a lone first-level warrior.
3. **The spider room is told at the door.** At the quarry adit, before the gallery, anyone with a light sees the husks
   in the web ("a fox, a dog, something the size of a calf"): an observation of the place, while the spiders live
   (`undertown.kyrt`). The fight is as it was.
4. **Lethal keepers are told and escapable, as placed.** Each of a1's keepers is territorial and has its own warning
   line (the mere's water elemental, the barrow king, now the vault's ghoul): a territorial group warns, and falls on the
   company only if it stays out the watch (`inhabitants.kyr`, `temper_closes`), so the company can back out of the room;
   and a fight once joined always offers Flight (one try in two, then three in four, then sure). None was neither, so no
   telling or exit was changed. Not keepers, but worth the lead's eye: the barrow's embalmers (two spirits of the third
   level, lethal) are *savage* and fall on the company without warning.
5. **The barrow ghoul is placed once, alone:** the keeper of the sealed vault under the first town, three levels down,
   behind the lettered flag, at the bottom of the fights the town's comment says bring a company to the second level.
   Not the ossuary, the king-barrow or the Howe.
6. **A lone thief dies in most fights: open, for the lead.** A calling question, not a placement one: against every
   pack but the frogs and the bats a first-level thief alone wins 20 % or fewer of its fights and dies in 80–100 % of
   them, where a warrior alone wins most. The ecology prices a company of one the same whatever its calling. Nothing
   about the thief is changed here.

Spec of the placements as placed: `test/placements-a1.test.ts` (a1, 14 s: the vault's keeper is the barrow ghoul at 13,
the ossuary's brood Orsino's, every den at least a pair, and the husks told at the adit; each mutation-checked by
taking the barrow ghoul and the husks back out of the template).

### Before and after (the groups whose placement changed; every other group fought the same, seed for seed)

Each cell is **win · median rounds · median harm · a death**, first-level companies, 20 seeds.

| Placement | Before: foes | Before: warrior / pair / thief | After: foes | After: warrior / pair / thief | Verdict before → after |
|---|---|---|---|---|---|
| w1_denned | 1 × hound/cave L1 (6) | 100% · 2 · 0% · 0% / 100% · 2 · 0% · 0% / 65% · 3 · 62% · 35% | 2 × hound/cave L1 (6/9) | 85% · 5 · 0% · 15% / 100% · 3 · 8% · 0% / 25% · 4 · 100% · 75% | trivial → fair |
| w2_denned | 1 × hound/cave L1 (7) | 100% · 2 · 0% · 0% / 100% · 2 · 0% · 0% / 80% · 3 · 0% · 20% | 2 × hound/cave L1 (7/6) | 85% · 5 · 20% · 15% / 100% · 3 · 0% · 10% / 20% · 5 · 100% · 80% | trivial → fair |
| w3_denned | 1 × zombie L1 (6) | 100% · 3 · 0% · 0% / 100% · 2 · 0% · 0% / 90% · 3 · 0% · 10% | 2 × zombie L1 (6/9) | 100% · 5 · 0% · 0% / 100% · 3 · 0% · 5% / 55% · 7 · 90% · 45% | trivial → trivial |
| w4_denned | 1 × zombie L1 (7) | 100% · 2 · 0% · 0% / 100% · 2 · 0% · 0% / 70% · 3 · 50% · 30% | 2 × zombie L1 (7/6) | 95% · 5 · 17% · 5% / 100% · 3 · 9% · 5% / 20% · 4 · 100% · 80% | trivial → fair |
| w5_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% / 100% · 2 · 0% · 0% / 45% · 4 · 100% · 55% | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% / 95% · 5 · 13% · 5% / 5% · 7 · 100% · 95% | trivial → fair |
| w6_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% / 100% · 2 · 0% · 0% / 45% · 4 · 100% · 55% | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% / 95% · 5 · 13% · 5% / 5% · 7 · 100% · 95% | trivial → fair |
| e1_denned | 1 × ghoul L1 (13) | 100% · 4 · 0% · 0% / 100% · 2 · 0% · 0% / 45% · 4 · 100% · 55% | 2 × ghoul L1 (13/13) | 80% · 8 · 14% · 20% / 95% · 5 · 13% · 5% / 5% · 7 · 100% · 95% | trivial → fair |
| s1_u_keeper | 1 × ghoul L2 (16) | 95% · 4 · 12% · 0% / 100% · 3 · 0% · 0% / 20% · 7 · 100% · 80% | 1 × ghoul/barrow L2 (13) | 60% · 5 · 75% · 40% / 90% · 3 · 17% · 30% / 0% · – · 100% · 100% | trivial → fair |

Verdicts over the 39 groups: before 18 trivial, 13 fair, 8 lethal; after **11 trivial, 20 fair, 8 lethal**. The pairs
turn six of the seven trivial dens fair for a lone warrior (two zombies stay trivial); the lone thief, already the
weak case, loses more of them (decision 6).

### The barrow ghoul in the vault, by the companies of placements.md

| Company | Level 1 | Level 2 (the room's company) |
|---|---|---|
| Warrior alone | 60 % · 5 · 75 % · 40 % | 75 % · 5 · 47 % · 25 % |
| Warrior + cleric | 90 % · 3 · 17 % · 30 % | 100 % · 3 · 9 % · 5 % |
| Thief alone | 0 % · – · 100 % · 100 % | 0 % · – · 100 % · 100 % |

A fair fight for the company the room is for, and a hard one for a first-level warrior who finds the flag early; told
before it is joined (its warning) and escapable.
