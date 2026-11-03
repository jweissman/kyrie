# The Queue (`q_queue.kyr`, prefix `qu_`)

## Premise

In the Exchange cellars the dead of the Burning stand in a line, in nightclothes and Sunday best, to file claims ninety-four
years late. They are polite about it. Dobbin Tench, a junior clerk, has been taking their claims down in secret: a ledger
of eleven hundred, with the PAID column empty. Every way down but the First Flue passes the Queue; the gate is the
`qu_line` Thing on `down_glass`, blocked until `queueOpen(party)`.

## People

Dobbin Tench (people.kyr, `cellar_arcade`; moves to `queue_hall` once he has been asked to do something). Claimants:
**Mrs Gorringe** (furniture; wants to be recorded as the householder), **Ned Pounceby** (seven; boots), **Mr Fluellen**
(a house that was never his; he rented the first floor), **Mr Crumpe** (not dead: joined forty years ago by mistake;
claims his own death benefit; the brief gave a "woman who is not dead" and "he" in the same paragraph, I took the man),
**the Creditor** (the Fire files a claim for hospitality given and not repaid; seen only by those who know of the ledger).

## Ways past (`qu_way`)

| Way | What it needs | What it costs |
|---|---|---|
| 1 A penny a head | three coin | nothing but the poverty of the gesture; Tench never met |
| 2 Adjust the claims | fair settlements for four of the five | none; regard(sovereign) +1; the dead are fond of you; `qu_regard` up |
| 3 The office said | `rites` fair (if the ledger is known) or hard (if not) | the dead go home unpaid; Tench is left with a book of names and nobody to call |
| 4 A ticket | 144 watches | a day |
| 5 Push through | nothing (a Grave action) | `qu_pushed`, `qu_slighted_dead`, `qu_slighted_fire`; Tench and Gorringe go cold |

A claim settled badly is spoiled and not offered again; one bad settlement is forgiven (four of five are enough), two
are not. The five fair settlements: Gorringe is entered as the householder (not paid forty pounds, not twelve); Ned is
given the boots, for a coin; Fluellen is allowed the tenant's interest; Crumpe is told he is not dead; the Creditor is
given a receipt: "received, not refused, to be answered at the Night". Mother Mawdsley (Annuitant) is Gorringe's
descendant; telling Gorringe so is a fair settlement that costs nothing.

## Tench's spine (`qu_nerve`)

0 apologetic. 1 asked, and answered: either by being asked to call the roll aloud (eleven hundred answer "Present"), or by
being brought the sexton's register of the unclaimed. 2 sits in the clerk's chair: by settling Mrs Gorringe's claim
himself, on the company's asking. At 2 he gives the ledger (`tench_ledger`) and `witness(tench)`: "If it is a Hall,
I'll stand up in it." The ledger can instead be lifted from his sleeve (stealth): the company keeps it and loses the witness.

## Writes

`queueOpen(party)`, `d_unpaid_ledger` (told by Tench, or by any claimant), `d_tithe_debt` (reading the Creditor's claim),
`tench_ledger` (an `Item qu_ledger` given), `witness(tench)`, `regard(sovereign)` +1 (adjustment only). For the Descent
and the Hearing: `qu_pushed`, `qu_slighted_dead`, `qu_slighted_fire`, `qu_fire_receipted`, `qu_released`, `qu_penny`,
`qu_ledger_stolen`; measures `qu_way`, `qu_regard` (the dead's), `qu_nerve`, `qu_fairs`.

## Build matrix

Plain company: coin, ticket, push. Insight: Tench told gently. Cleric: the office. Thief: the ledger. Anyone with
patience and a coin: the settlements, which need judgment, not skill.

## Weakest part

Four claimants and a creditor is a small game; the "right" answers are all findable from the claimant's own words but a
careful player will find them all in one pass. The ticket is trivially cheap for anyone who can wait a day (that is the
point, but it is a free door). The descendant is only Gorringe's.
