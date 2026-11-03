# The Bakery Inspection (`q_bakery.kyr`, prefix `bk_`)

*Test: `bun test test/quittance-bakery.test.ts` (13 tests).*

## Premise

Gwen Tolliver's oven fails the Smokeless Ordinance: it draws too well. The Phoenix's Inspector of Flues, Mr Gudgeon, surveys
it at noon on the second day (watch 312); the cover lapses at midnight the day after (watch 384). Gwen thinks it is the flue.
The truth is a Lent coal that has been in the oven since before the Burning, and a worn line cut over its mouth: LENT,
NOT GIVEN; KEEP IT AND IT KEEPS THE HOUSE. Fix the flue to the pattern and the Ordinance is satisfied and the coal goes out.

Gwen came to the Brickfields at seventeen from Salt Lane in the Wards, where her mother kept a coal in a tin, and has
not told the lane; she banks her oven the way her mother banked hers and cannot say why. Old Mother Tolliver (her late
husband's mother) sits in the chimney-corner and has always known the line by heart.

## People

`bk_gwen` (bakehouse), `bk_granny` (bakehouse), `bk_gudgeon` (Phoenix House; the bakehouse from eleven on the day),
`bk_brundle` (Secretary of the Committee of Exceptions, Phoenix House), and Ianthe Corbett (`ianthe`, borrowed: a topic
of mine, and a rule that sends her to the bakehouse on the day).

## Approaches

| Approach | Needs | Result |
|---|---|---|
| Fix the flue, by trapwork or by brawn | those skills (a check, dc fair); two hours | passes; **the coal dies** (cost hidden until the line is read; after, the label says "though the line says LENT" and carries a Grave) |
| Cook with Gwen, then give Mr Gudgeon a hot loaf | 3 coin, a morning (3 hours), any build | passes on the strength of the bread; Gwen helped; coal alive |
| Borrow a Guild surveyor (Ianthe) | the notice read; her at Surety Hill | she climbs the flue at eleven and certifies "a cause outside the flue" |
| Bribe Mr Gudgeon | 12 coin | passes; he writes the sum down (`bk_bribed_gudgeon`) |
| Lodge Form 44-B with the Committee | licence + the line read + the morning's loaf | a hearth excepted; the Phoenix has it on its Register (`bk_registered`) |
| Do nothing / fail | | cover lapses; the Phoenix takes down its bird; the bakery stands on its coal; Ma Gedge's plate can go up |
| Reading the line | lore *or* rites (one try each), or share a ration with Old Mother Tolliver (no skill) | `d_oven_coal`, `d_lent_coal` |

## Complication

The thing that makes the oven fail is the thing that makes it safe. After the fix: the bakehouse is quiet, the oven does
not hold the night, Old Mother Tolliver turns her chair to the wall, Gwen stands with her hand on the door, and on the
fifth morning a chimney fire (paid by the Phoenix, "UNAVOIDABLE") burns the ceiling of a bakery that has never burned.

## Writes into the contract

`d_oven_coal`, `d_lent_coal`. If the coal lives **and** Gwen trusts the company (she has been helped, and is told what
the line says): `coalSource(bakehouse)` and `keeper(brick)`. If the coal is dead neither is asserted. Regard: `phoenix` +1
for the Committee. Ours: `bk_flue_fixed`, `bk_bribed_gudgeon`, `bk_exempt`, `bk_registered`, `bk_by_bread`, `bk_by_ianthe`,
`bk_trusted`, `bk_own_mark`, `bk_coal_dead(bk_bakery)`, `bk_lapsed(bk_bakery)`.

## Slate and the other doors

Slate claim until noon of the survey (teaches `bk_claim`); the smell in Brick Lane; the notice at the end of Gwen's counter
(teaches `bk_survey`); Mr Gudgeon's breakfast (teaches `bk_bread_hint`).

## Build matrix

Thief: trapwork fix. Warrior: brawn fix. Mage/bard: lore reading. Cleric: rites reading. Anyone: bread, bribe, share a
ration, Ianthe, Committee (with a licence). The plain company is never locked out.

## What changed from the brief

* "Borrow a licence-holding certifier" became Ianthe Corbett (a Guild surveyor outranks an Inspector).
* "The committee" got a person, Mr Brundle, and a form, and a cost: the Phoenix now knows.
* The day-4 chimney fire is the world proving the Tables' paradox on one bakery.

## Weakest part

The Grave is on a duplicate of the action (friction 3). Gwen's trust is a single relation (`bk_helped`), and anything that
helps her sets it, including the Committee. The Inspector never gets a second scene.
