# A first-level warrior's odds in the first hour (CL-08)

Cold play 2's warrior (`bin/kyrie run --world iscoed --as human/warrior/Wenna`) missed about 12 of 16 swings, five
in a row at two 1-HP rats. Measured before any rule was changed: the chance `Fighting.chance` gives a first-level
warrior of each people against every rat, spider, centipede and bandit placed in a1, kite and iscoed (the creatures
of `campaign.readout.creatures`, each projected as the fight projects it: `CombatProjection.fighter`,
`Effects.combatant`). THAC0 at level 1 is 20; a blow needs `20 − AC − toHit` on a d20, a 1 always missing.

## What was wrong: the protagonist of --as was not made as creation makes one

The page (and the runner's `--create`) makes the protagonist of the world's six rolls placed where the calling wants
them (`Creation.protagonist`, `CreationFlow.changed`: `Rolls.suited`), the calling's bonus not added again
(`Content.created`). `--as people/calling/Name` on a world gave no rolls, so the creature took fresh 3d6 in the order
drawn plus the calling's bonus. On iscoed that warrior had **strength 10, dexterity 10, wisdom 15**: to-hit +0. The
same choice made on the page has strength 16 (+3). Fixed at the cause: `--as` gives the member
`Creation.rolled(world, calling)`, what creation would place (src/cli/play-tool.ts, web/engine/creation.ts).

The attack roll itself is right by its source (Orsino's Fighting): no wrong AC, Dex or proficiency was found, and the
darkness penalty (`in_the_dark`, −2) is applied only to a company with no light (`benighted`).

## The distribution (human warrior; ranges over every placed creature of the kind)

| world | made as | Str | to-hit | rat | great rat | spiders (cave, great) | great centipede | bandits, toll-keepers (L1–2 warriors) |
|---|---|---|---|---|---|---|---|---|
| iscoed | --as, before | 10 | +0 | 50–55% | 60% | 45–65% | 55% | 17–51% |
| iscoed | creation (and --as now) | 16 | +3 | 65–70% | 75% | 60–80% | 70% | 21–55% |
| kite | --as, before | 12 | +1 | 55–65% | 65% | 35–65% | 60% | — |
| kite | creation (and --as now) | 17 | +4 | 70–80% | 80% | 50–80% | 75% | 34–55% |
| a1 | --as, before | 14 | +2 | 60–70% | 70% | 50–60% | 65% | — |
| a1 | creation (and --as now) | 13 | +2 | 60–70% | 70% | 50–60% | 65% | 20–55% |

Other peoples follow their strength: on iscoed by creation elf and catfolk (Str 14) 60–65% at a rat, birdfolk (13)
60–65%, dwarf (16) 65–70%; by the old --as, elf, catfolk and birdfolk had Str 7–8 and 45–50%. a1's rolls are low
(its best is 13), so placement there changes nothing much. The iscoed robbers' captain (level 4 ranger, chainmail,
Dex 19, AC 0) is 20% for any first-level warrior: a boss, by the rules as written.

At the old even chance, 4 hits or fewer in 16 swings is about 4% (with the dark's −2, about 17%): unlucky on a defect.
At 65–70% it is 0.03–0.13%.

## Against the SRD

An SRD fighter of level 1 has BAB +1 and Str 16 (+3): +4 against a rat's (Tiny) AC 14, a giant rat's or monstrous
spider's (Small) AC 14–15 and a bandit's (warrior 1, scale or chain) AC 15–16: about 55% at the beasts and 45–50% at
the bandits. Kyrie's creation-made warrior is a little better at the beasts (65–75%) and a little worse at armoured men
(no BAB at level 1, and Dex unbounded under chainmail, so a Dex-18 toll-rider is AC 1). Those are Orsino's numbers and
not defects by the evidence here; the owner has put SRD breadth behind the register, so they are noted, not changed.
