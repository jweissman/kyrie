# Mark Street (`q_markstreet.kyr`, prefix `ms_`)

*Test: `bun test test/quittance-markstreet.test.ts` (18 tests).*

## Premise

At ten on the first morning (watch 12) the kitchen chimney of Number Nine, Mark Street, goes up. The house wears the
Phoenix's gilt bird; the Guild's surveyor nailed it on Monday out of the wrong bag. The family's real policy, in a
tin-lined drawer in the burning front room, is with the Lamprey (Aubrey Peascod is clerk to a chandler whose firm insures all
its clerks). Captain Garrity of the Phoenix stands on the plate, Mate Marchbanks of the Lamprey (Captain Dree's mate; Dree
himself is at the Reach) stands on the policy, and the two hoses lie across the cobbles and stop in the middle. Each is
right: Garrity that a mark on the door is the policy, Marchbanks that the policy is the policy. The company is the third
thing in the street.

The fire has a clock. The house is worth ten watches of dispute at ten o'clock; it falls by one a watch; at nothing the
roof goes in. Whatever closes the dispute leaves a house of that worth: saved (8+), half (4+), a shell (1+), a heap.

## People

| id | who | where | what they are for |
|---|---|---|---|
| `garrity` (people.kyr) | Captain Garrity | drill_yard; mark_street from the fire to its end | arc 0 → 1 only by being *asked*; argued with, bribed, she holds |
| `tobias` (people.kyr) | Tobias Pargeter | pargeter_front; mark_street at the fire | fetches the book, hands out blankets, joins if grateful |
| `ms_mate` | Mate Marchbanks | lamprey_floor; mark_street at the fire | the Lamprey side: coin or fear sends him home |
| `ms_mrs`, `ms_kids` | Hester Peascod and her three children | the kitchen; the street at the fire; the kitchen, or the Pargeters' back room if the house is lost | the family; she will be a Hearing witness if paid |
| `ms_tapley` | Mr Tapley, Guild surveyor | the Wayward Hen; the street at the fire | the drunk who nailed the wrong plate; will not swear to it for any sum |
| `ms_quennell` | Master Voakes of the Salvors' Yard | salvor_yard; arrives at the fire if the plate is pulled | the satire: an unmarked house is nobody's and therefore his |

## Place map (all in the Brickfields, `brick`)

`mark_street` — the fire. `nine_yard` — the pump, the ladder, the swollen kitchen door. New: building `ms_nine_b` with
`ms_front` (the front room; the bureau and the book) and `ms_kitchen`; passages `ms_front_door` (a fire-hazard door while
the house burns: the first to cross is hurt, 1d6 fire, save against dexterity 12), `ms_kitchen_door` (jammed by the heat:
brawn or lockwork) and `ms_hall` between them.

## The approaches, and what each needs

| Approach | Needs | Result |
|---|---|---|
| Form a bucket-line | any hands (brawn takes the head of it: more water) | the Phoenix saves it, **wrongly**; the family's Lamprey cover is void; precedent for marks as policy; Tobias grateful |
| Carry the furniture out | any hands | contents saved whether or not the house is; Tobias grateful even at a heap |
| Ask Captain Garrity, as a favour, to let the Lamprey's hose lie alongside | nothing; not an order, not coin, not a case | arc(garrity) 0 → 1; two more watches of house; makes the Third Certification possible |
| Certify the mark false | licence + the book (read) | the Lamprey saves it; Garrity humiliated; family paid |
| Certify a third thing (**the Mark Street Rule**) | licence + the book + Garrity asked | both brigades, the Phoenix's mark and the Lamprey's money; `ms_rule`; family paid; regard up with all three |
| Prise the bird off (stealth) | stealth | the house is nobody's; the brigades stand down; the Salvors come in three watches and keep a third |
| Swap Number Ten's fish for the bird (stealth, harder) | stealth | Garrity: "a mark on the door is the policy"; the Lamprey saves it quietly; Number Ten has a pale square |
| Bribe the Lamprey's mate (8 coin) | coin | the Lamprey goes home; the Phoenix saves it; precedent wrongly set; Lamprey slighted |
| Frighten the Lamprey's mate | intimidation | the same; a failure makes the Lamprey an enemy |
| Offer Garrity coin | 10 coin | insulted; she cannot be asked until she has been begged pardon |
| Get the book | (a) the front door, one member hurt; (b) the kitchen door, brawn or lockwork; (c) ask Tobias, who loses his eyebrows and two watches | |
| After the fact | licence + book (from the ash) + Garrity asked, at the drill-yard | the Rule if not the house; family paid; the Lamprey's "ABOUT TIME" |

Nothing: it burns. The family go to the Pargeters' back room, Tobias hands out blankets, the Slate reports it the next
morning, and the afterwards path above is still open.

## Complication

Garrity's argument and Marchbanks's are both correct, and the company's most efficient move (the bucket-line) *proves
the wrong one*. The family cannot be paid by the Phoenix (no policy) or by the Lamprey (the Lamprey never attended). The
only road to money is the certification, and that costs the furniture, or the front wall's worth of house.

## Writes into the contract

Regard: `phoenix`, `lamprey`, `brigades` as the table above (all by `Increase` or `Decrease … or to nothing`).
`arc(garrity)` 0 → 1 only by the ask. `tobiasWilling(party)` when `ms_tier >= 2` or the contents were saved, and not when
the Salvors saved it. `witness(ms_mrs)` if paid. Our own, for the Hearing to read by name:
`ms_rule(party)`, `ms_precedent_mark(party)`, `ms_slighted_lamprey(party)`, `ms_slighted_phoenix(party)`,
`ms_slighted_brigades(party)`, `ms_garrity_shamed(party)`, `ms_swapped(party)`, `ms_burned(party)`,
`ms_paid(ms_nine)`, `ms_unpaid(party)`, `ms_asked(party)`. Discoveries: `ms_claim`, `ms_alarm`, `ms_lamprey_cover`,
`ms_nailed_wrong`, `ms_proof`.

## Slate and the other doors

The claim is chalked at the Bell & Slip from ten (teaches `ms_claim`, Objective `ms_obj_fire`), and a boy runs across Gate
Plaza with two buckets (teaches `ms_alarm`); Mrs Pudsey sends the company up Brick Lane; the Phoenix and Lamprey bells ring
wherever the company is (the Event teaches `ms_alarm`). A company in Policy Row at ten can still come in time (tested).

## Build matrix

Plain (rangers): buckets, furniture, Tobias for the book, coin to the mate, the ask. Warrior: the strong bucket-line,
intimidation, the kitchen door. Thief: both plates, the kitchen bolt. Licence-holder of any build: both certifications.
Cleric/monk: none of their own skill here (see critique).

## What changed from the brief, and why

* **Dree is not at the fire**; his mate is. Moving Dree out of `dree_room` would have fought the barge author for him.
* Bucket-line is two actions (any hands; brawn), because `capable(brawn)` is the only handle for "better with muscle".
* The Third Certification needs Garrity to have been asked; the false certification does not. That is the whole point of
  her lever and it makes "ask" the one door that opens the best ending, which the brief wanted.
* "The family's later greeting" is done in observations (Mrs Peascod's kitchen; Garrity near the yard) and by Tobias's
  topics; Greets text is fixed in Kyr.

## Weakest part

Talk is free in the engine, so *arguing* does not cost watches; the clock only bites on physical acts. The fire cannot punish
a company for a long conversation with Garrity (friction 8). The second weak point: cleric and monk builds have no door of
their own (they fall to the plain ones). The Salvors' scene is a joke that plays once.
