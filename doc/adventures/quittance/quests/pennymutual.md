# The Penny Mutual (`q_pennymutual.kyr`, prefix `pm_`)

*The Bare Wards: Salt Lane, the Penny Mutual's hall, the Night Market, one garret. Communal, practical, and the first hard
evidence of the Appointed Losses. Tests: `test/quittance-pennymutual.test.ts`.*

## Premise

The burial-club of Salt Lane (a penny a week, a farthing for the children) has lost its treasurer and its fund: fourteen coin,
which paid the physic-man a shilling a head and the pit-cart nothing. Nine members are on the NEXT board and begin to die
three at a time on days 3, 5 and 7. The club has **voted, forty-one to one, to forgive her**. It is a club that does not ask
where a thing went; it asks that it come back.

The treasurer, Prudence Ouseley, was paid five coin by the rent-collector's deputy to say nothing of a *stamped notice to quit*
for a block in the Wards (the second night), and understood what such a notice is for. She took the box to be gone and not
asked. She lodges as Mrs Ames over the oven-yard with a packed bag and a boat on the evening of day 2.

**The dilemma.** Bring the fund home with your own coin (the club is saved and ignorant), or find her and let the club find
out *why* she ran (the club gets a culprit it cannot forgive in the old way, and stops being a club that does not ask).

## People and place

| | |
|---|---|
| Keturah Trendle (`pm_trendle`), chair, a laundress | `penny_hall`. Proud. Does not take charity; takes a debt written in the ledger. |
| Josiah Garrowby (`pm_garrowby`), cooper, third name on NEXT | `penny_hall`. Voted against forgiving her ("the frightened ought to be asked what of"). |
| Prudence Ouseley (`pm_ouseley`), treasurer | `pm_garret` (new, off `salt_lane`, hidden until `pm_garret_known`). Leaves by boat at watch 216 if not found. |
| Fenwick Larkworth (`pm_larkworth`), deputy to Skelter | `salt_lane`. Paid her; carries the sealed duplicates. |
| Mother Gammidge / Old Ferrule / Hannah Pennifold | `night_market`, **only from 17:00 to 05:00** (`Seen when`). Eel-pie / second-hand marks / stolen hats. |

## Approaches

**To her** (any one reaches `pm_garret_known`):
- *Tracking* (woodcraft, `capable`): follow the cart-grease and nail marks from the Mutual's door. One try. On failure the
  trail goes under the market, which is the next door.
- *The market*: Mother Gammidge, for a pie and a story (1 coin) or for nothing if the company came by the Gap.
- *The deputy*, four levers: **coin** (5), **nerve** (intimidation; on failure he runs to Skelter: `pm_deputy_warned`), **the
  licence** (an adjuster may read the rent-book for any block named in a claim) and **the clerk's hat** (bought from Hannah
  Pennifold; deception, dc_easy; gets the *sealed duplicate itself*, so the stamp can be seen without ever meeting her).

**With her** (garret):
- *Persuasion*: tell her the club has voted to forgive her. She comes home, walking in front, with the purse and the notice.
- *Intimidation*: she hands over the purse and the notice and is left bitter. The club is told nothing.
- *Stealth* (dc_hard): lift the purse and notice. On failure she hears it on the stair and is **gone**: the fund and the
  stamp with her.

**At the hall** (the coin, no treasurer needed):
- *Lend* fourteen coin against a fire kept for the Night: free for a Gap company, or with Garrowby's word (a ration and an
  hour by his fire), or on one persuasion check. A refusal is final.
- *Leave it in the box* without a word. The fund is home; the club is ashamed and will not be asked for a fire.

**The telling** (when she is brought home): the club asks "is there something the club does not know?" The company either
tells (puts the notice on the table; the club turns on the landlord's office; `pm_told_club`, `pm_rent_strike`; Ouseley will
speak to the Five, `witness(pm_ouseley)`) or keeps the peace (the vote stands; the Mutual stays a club that does not ask).

## The stamp

`d_appointed_notice` and `d_candlewick_next` are taught **only** by `Hold the stamped notice to the light` (Action on a held
`pm_paper`, i.e. `pm_notice` from Ouseley or `pm_form` from Larkworth). The seal is a Phoenix bird with the beak turned the wrong
way. A company that has only *heard* of the notice (Ouseley's "why I ran") has not seen it.

## The warning, and who believes it

Telling Mrs Trendle that Candlewick Court is stamped for the second night is believed if the company came by the Gap, or has
the fund home, or has `regard(wardsfolk) >= 1`. Otherwise she says that the people who know the date of a fire beforehand are
the people who set it, and it is not repeated until something has been done for the club (`pm_disbelieved`, one-shot). On
belief: `pm_court_warned` and the Mutual's cart goes to Candlewick.

## Clocks

- **The nine** (rules keyed on `day(clock)`): NEXT 9 → 8 on day 3, → 6 on day 5, → 4 on day 7 (`pm_neglected`) while the fund is
  out. `pm_dying(wardsfolk)`. The fund home stops the board.
- **The boat**: Ouseley is gone at watch 216 (20:00 on day 2) unless found. If she goes, the coin is the only door left and the
  stamp can only be had from the deputy.
- **The market** exists only at night.

## Writes into the contract

- `regard(wardsfolk)`: Gap +1 (arch.kyr); lend +2 (+1 by argument), box +1, purse laid +1, quiet +1, **telling +2**, warning
  +1. Maximum 4 on the best path; never below nothing.
- `witness(pm_ouseley)` (told the club and asked). `keeper(wards)` (fund home and proud, or lent, or told). `d_appointed_notice`,
  `d_candlewick_next`. No arc moved.
- Own relations the lead and the Hearing may read, all `group`: `pm_fund_home pm_proud pm_ashamed pm_loan pm_told_club
  pm_court_warned pm_disbelieved pm_resolved pm_neglected pm_rent_strike pm_gone pm_cowed pm_robbed pm_stamp_seen
  pm_slighted_wards pm_deputy_warned`. `pm_slighted_wards(party)` is written here and by q_pip when the company wronged the
  Wards (the Hearing should read it).
- `pm_rent_strike(wardsfolk)`: the club, told, stops paying Skelter. The spine may want to answer it.

## Build matrix

| Build | Door |
|---|---|
| Ranger / woodcraft | the trail |
| Warrior / intimidation | the deputy by his collar; Ouseley by force |
| Thief / stealth | the purse off the bed; the deputy's duplicate with a hat |
| Bard / persuasion | Ouseley home; the loan by argument |
| Cleric / insight-ish kindness | Garrowby's word (ration); telling the club |
| Plain with coin | lend or leave fourteen coin; the pie |
| Any licensed adjuster | the licence on the deputy |
| Gap company | trusted: loan, gossip, warning, all without a check |

## Changed from the brief

- The "culprit" is not the treasurer. The brief's *let the club find the real culprit* became a choice about **what the club
  is told** once she is home; the culprit the club finds is the notice's author, and what it loses is its rule of not asking.
- The coin route comes in two kinds (a loan, which keeps the club proud and buys the hearth; a gift, which does not) because
  "the club is ashamed" is only a cost if the other kind exists.
- The licence is one lever on the deputy and nowhere else.
- No negative regard: offence is `pm_slighted_wards`.

## Weakest part

The treasurer's persuasion scene is a single check and a speech. The club's reaction is told by one topic. The fund is fourteen
coin, which is a lot for a first-day company and nothing for a late one; the cost is there on day 0 and almost gone by day 5.
Larkworth should have a hand in the second night (he will be at the Court), and does not.
