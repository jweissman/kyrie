# The Wrong Boat

*Adventure V of [the anthology](README.md). A pursuit. Module `data/adventures/wrongboat/` (province "the Aldwater", south of the first country), campaign `data/campaigns/wrongboat.campaign.json`, spec `test/wrongboat.test.ts`. 7 November 2026, revised after a hostile review. Form and ending rules: [forms.md](forms.md). Frictions: [friction-wrongboat.md](friction-wrongboat.md).*

## What it is

The company has paid for passage on the *Patient Maud*. The Maud has gone. A landlady with a kitchen on fire presses a hamper on them for the Maud's cook, and they step aboard the *Patient Mary*, which looks the same. Under the seed-cakes in the hamper is a music box. The Mary's owner, Hob Garrod, took it from a dead bargeman's widow against a debt, left it at the Heron to be carried to a buyer, and went off to be locked up for eleven shillings. The widow, Bess Lowther, a toll-clerk owed three months' wages, has followed it to the quay; two of the Trust's lads, sent by Sergeant Brill (named in Bess's speech, never met), are coming by another road. Nobody is asking the company to find out anything. The company has to get down a river, over a hill and out of the story, with a thing they cannot put down, and a clock that is not theirs.

## Why it is not the others

| | The usual shape | This |
|---|---|---|
| The party | licensed, competent, welcomed | passengers who got on the wrong boat |
| The time | spent asking and gathering | spent *waiting* (a barge keeps a timetable), *moving* and *being seen* |
| The pressure | a deadline set by the author's festival | **a chaser who hunts the company where it is** (Bess), and a second, waiting at the weir, whom the party can sweep, pay (eight coin), fight (a roll) or lose the pack to |
| What makes the climax possible | evidence laid before a body | a place and a moment: the fen mist, the fair crowd, the relief sluice, the ferry chain |
| The end | a settlement | one of **twenty-six** private endings: a kitchen, a fiasco, a box taken kindly, a friend left on a stage, a fall from a chain |

## The map

```
STAITHE QUAY ──(the Mary)── the river ── FEN LANDING ──── causeway ── bell-cot ── eel-stage
   toll-house, lock-up (Pelham)                                                  │
   Heron and Pipe                         PELHAM QUAY ── fairground ── puppet booth, slop-shop, horse lines
                                                         │
                                           the barge ────┴─ river road
                                           RACE-HEAD ── mill yard ── weir ── sluice hut
                                                                       │
                                         HIGHFOOT stage ── ferry (or the chain) ── far bank ── hill foot ── the Last Pint ── the gap
   (two land ways from the toll-house: the old fen road, 5 h, for Bess; the high back road, 6 h, for the lads)
```

The Mary's four rooms (deck, cabin, hold, galley) are carried from landing to landing by a timetable (`stageNow`), watches counted from the quay: at Staithe to +9, afloat, at the fen +60–70, afloat, at Pelham +150–185, afloat, at the race-head +225–245, afloat, at Highfoot from +290. Each plank is a ferry passage that opens only where she lies, with no closed-way text. A company that steps ashore at the fen is a company the barge will leave.

## Pressure and play

- **There is no free way, and "keep walking" is not one.** The barge is the slow way and the walk the fast one, and each has a price. *Walking:* the back road reaches the weir in about fifty watches (the barge takes more than two hundred), and the lads are *at the weir already*. They hold the towpath: the passage from the weir to the Highfoot stage is closed to the company ("two men in grey coats… standing in the middle of it") until the lads are paid eight coin, beaten (a roll), swept by the sluice (a roll), robbed of nothing to take (the box dropped), have what they came for, or find the company escorted by Bess. Standing there for five watches is the box. Once met they hunt a company that backs away. *The barge:* Bess is at the fen landing before the Mary, comes aboard the moment a plank opens, and **searches** a hidden company; each hide costs a ration and a watch, wears off in three hours, and does not stop her coming below. The Mary lies the night at the fen and the fair-day at Pelham because Dolly will not run the Wend by dark and the lock-keeper will not open for less than a morning. A company that works its passage in the galley keeps its coin and loses the deck: the cook calls it back below whenever the Mary is afloat.
- **Bess hunts.** `bess_fen` sends her by the old fen road only while the company is aboard (the barge cannot be walked to); otherwise `hunt.kyr` has one pursuit per room (`hunt_bess_<room>`, priority 8) seeking the room the company is in, and she stops when she is in it (`together`). A satisfied pursuit falls to the next lower one, so the itinerary pursuit is off whenever she is with the company; a test asserts that her trail never goes A, B, A. She lags a walker, and arrives eventually; a company that has waited at the Highfoot stage is found there. She is off the hunt for good once she has been *met* (`bessMet`: a successful swear, run or stand, or any answer that sends her off), allied, given the box, or when she has it. That is a design decision, not a bug: one success ends the chase, and the roll was the price.
- **Being met has a cost, and every way out is a decision.** Once she has seen them the company has three watches. If the box or the unopened hamper is in the pack she takes it, kindly. The ways out: put the box (or the hamper) in her hands; walk with her (offered only once the company has something to show, from Mrs Brabant, the lock-up or the wage-slip, or by a persuasion roll on a porter's word that, failed, sticks and costs the box); swear it is cakes (a roll, and a lie); tell her it is not hers (an intimidation roll, a truth: it does not count as a lie); break and run (a roll). A company with nothing in its hands is turned away: she has nothing to ask of it.
- **The kind ending has a price.** Giving Bess the box, whenever she finds the company, is *The Lowther Kitchen* only if the lads have been dealt with. If they have not, two men in grey coats are at her door in the morning and the box goes with them (*The Lowther Kitchen, Briefly*). Taking Bess with the company is *Bess at the Gap* (the box goes back down the hill with her) or, if she is walked to the Pelham lock-up, a reunion in the cell with Hob (*Said to His Face*). An allied Bess is also an escort: the lads stand off and the towpath opens. It costs the box in every case, and a company that sluices the lads (below) cannot have her at all.
- **The relief sluice is not a free win.** It is a brawn roll at the wheel, two watches, and a failure brings the lads up the path to the hut. Success sweeps them off the apron: one is sick on the far shingle and the other is not there. Wilfred Auster fetches one out with a hook. There is no milestone for it, Bess will not walk beside a company that did it, and *Down the Weir* is written as what it is.
- **The lads** are not fought by the engine: they are peaceable people with a plan, and the menace, the five watches and the robbery are rules. The fight is an action with a check, a coin cost and a consequence; a failure leaves the company beaten up on the towpath with nothing in the pack.
- **The ferry is the company's.** It opens only while the company has paid and is standing on the stage, and shuts again when they land. With the pair (or Bess, unmet) on the stage Una will not cross ("I don't take them away from things"), and the chain is the way over: a climbing check, the pack in the water if it fails.
- **Information that changes:** the quay-warden's report (split on whether the company is disguised, or can be bluffed), Parr's mistake, Noll's "behind you now, though the mist is a great liar".
- **False trail:** a ration-cake in a dishcloth in the eel-skiff sends Bess to the eel-stage (`bess_decoy`, priority 9), and a company that lands at the fen on foot has time to lay it.
- **Disguise** (the slop-shop: a bargeman, or a bridegroom in lavender; one fools her and one does not, and the page shows which), **hiding** (hold, galley if Mrs Brabant is willing, bell-cot loft, puppet booth, the ferry stage, the mill yard, Pelham quay after the bluff).

## The box

A music box in the shape of a loaf, brass-cornered, which plays *The Miller's Daughter*, a song the whole river sings with a hundred and nineteen verses added, and which Tom Lowther wrote for his wife. Wind it twice; the third time, a drawer (a wage-slip, seven months unpaid on the Mary). The back-plate says *B.L. from T.L., the day we were wed.* It can be kept, sold (fifty coin to the dealer; forty to Mr Fosse at the Last Pint, who is the buyer Hob meant it for), dropped in the river, traded (to a young gentleman for a horse), surrendered, given back, or carried to the gap. It is never a plot coupon: no door opens with it, and nobody needs to know what it is, which is part of the pleasure.

## Faces

Dolly Prout (skipper, boisterous; fare by coin or by peeling), Mrs Brabant the cook (cries into the soup and means it), Shim Garrod the mate (nineteen, shouts the news of the river to nobody), Mr Peregrine Dally (a young gentleman on the wrong barge for the right reason), Mother Cobbold, Jack Parr, Una Marchbank (the ferrywoman who speaks in few words), Joel Sunderland the dealer, Orpha Tunney the slop-seller, Gabriel Hoby the puppet-man, Noll Fairley the bellman, Tabitha and Wilfred Auster at the mill, Barnaby Fosse at the Last Pint, Hob Garrod in the lock-up.
**Companions with arcs:** *Shim* (interview: whose side are you on when your uncle is wrong; at Pelham, whether to visit the lock-up; at the hill foot he stops or goes on, by what the company did) and *Mr Dally* (a question about love; the bell; the choice to go or to bolt; the horse).
**Side episodes unconnected to the main line:** Hoby's play and the villain the player names; Noll's bell; the miller's boy's sum; the greased fair itself.

## Endings

Tried in written order; `over` marks the contests. Losses: *Left on the Towpath* (beaten, with nothing), *The Aldwater Keeps It* (the chain), *Taken on the Towpath*, *Her Hands on the Box* (kindly). Settlements without a box: *The Lowther Kitchen* (the lads dealt with), *The Lowther Kitchen, Briefly* (they were not), *A Glorious Bad Bargain*, *Forty Coin and a Back-plate* (sold unread), *Forty Coin, Knowing* (sold read), *Hand over Hand*. Companions: *Without Shim*, *Said to His Face* and *Bess at the Gap*, *Blood Is Blood* and *Shim at the Gap* (neither needs the box), *A Peal Behind You* and *The Wrong Church, and Then the Right One* (Mr Dally, in love or not), *Still Flying* (a Dally who bolted and was not traded). Threads left lying, each with its own condition: *Tom, Behind You, Always* (Una heard the box wound), *What Mrs Brabant Said* (shown the box and told where to take it, and did not, never having met Bess in kindness), *A Message Not Passed* (Hob asked for Bess and was not answered), *A Bargeman's Initials* (Fosse refused it), *Walking, Not Running* (Bess pitied), *Paid in Onions* (the galley). Last: *Down the Weir*, *Fifty Coin and No Questions*, *Empty Hands*, *Over the Gap with a Hamper*, *Clean Water* (box unread), *B.L. from T.L.* (box read), *Over the Gap* (nothing in the hands). None settles a society.

## Tested

`test/wrongboat.test.ts`, 38 journeys by the labels a player sees, with waits in pieces because a long wait would let Bess act inside it. Nothing sets Bess aside; where luck decides (a check) the journey forces the roll (`roll('pass' | 'fail')`) and says so. No test stages a relation. The journeys: lint; the porter's cry; Bess never reversing (aboard and dawdling); cast off; not being put ashore mid-river; galley duty; the kitchen with the lads paid, and without them; the box taken; the hamper taken; "it was Hob Garrod" gated, with its roll won and lost and latched; "not hers to ask for" as a roll won and lost; the run for it; hiding that costs and wears off; the first meeting on the deck; the walk blocked at the weir; the walk paid to Clean Water; the lads hunting a company that steps away; the hamper carried unopened and robbed; the fight won (no snatch afterward) and lost; the sluice failed and won; Empty Hands; the empty-handed walker; Fifty Coin; the bargain, the peal, the cold peal and the bolted Dally; the towpath; Mr Fosse's Last Pint and Fosse's refusal; the ferrywoman's refusal and the chain won and lost; the ferry not shared; Bess allied, kept across a save, escorting past the lads, and at the gap; the reunion; Shim three ways; Una, Mrs Brabant, Tabitha and the galley; the fen on foot and the decoy; a message not passed.

Not specced: hiding with Bess in the room by the bell-cot, booth and ferry (the die is not forced in any journey); the miller's boy's sum; Shim's visit to his uncle (`shim_visited`) and the lavender bluff; the mist (read, not asserted).

## 1. Content that works in play

The mistake and the hamper; the barge timetable and planks; the hunt (Bess and the lads walk to the company, board, give up, return); being seen, hiding that wears off, disguise, the mist, the false trail; the cost of a meeting; Bess's conversation; the sluice; the ferry and the chain; the endings above; Shim's interview and Dally's.

## 2. Authored content present but not reachable (or not specced)

Hiding with Bess in the room by the bell-cot, booth, galley and ferry (the die is not forced in any journey); `swear_false` as a roll; Dolly's `put_ashore` at the fen landing when the fare is unpaid; Mrs Brabant's confession (played by hand); Dally's church and the wedding Observes; Shim's visit to his uncle and the two hill-foot rules; Hoby's play; Tabitha's pie; the miller's sum; `pay_lads`; `drop_box`; `Empty Hands`, `Bess at the Gap` and `Clean Water` (reachable, not specced); `quillRead` is a flag with advice only; Sergeant Brill is only spoken of.

## 3. Actions or consequences the engine cannot yet represent

- A **moving place**: the Mary is four rooms, five planks and a timetable, not a thing that goes (circus friction 1).
- A **pursuer who is sighted at a distance**: rumours are Topics keyed on where Bess is; a company cannot look down a road and see her coming.
- A **search of a room**: hiding is a die, not a contest of what is moved.
- A **pursuit that is satisfied falls through** to a lower pursuit (see friction 12), so a chaser's "stay" is written as `not together`.
- No **map** shows the Mary's course, and the chaser's clock is invisible unless asked.

## 4. Existing assets whose integration is incomplete

- The music box is an Orsino valuable (`music_box`, 50): its tune is nothing the engine can play, and the page can only say it plays.
- Orsino gear named by the slop-seller (bargeman's smock, lavender coat) is a fact, not a garment.
- The fen's plants and eels are told in prose only; the river has no herbs in the catalog.
- No **new species**: the river's animals are a heron, geese, a bear on a chain and an unseen eel, all prose.

## 5. How far it resists the formula

Honestly: the setting counters the licensed-outsider shape (the company is not licensed, nobody asks it to investigate, there is no body to convince), and no ending establishes a civic settlement. It does not escape the *reform* shape entirely. The central dilemma is still whose the box is, and the ally route (the cook's word, "it was Hob Garrod", the lock-up) is a form of recognition. What the revision does is give the dilemma a cost curve instead of a free kind ending: the kind ending needs the lads dealt with or it is undone at the door; the harsh acts (the sluice, the fight) cost a roll, coin or an ally, and are written as what they are; and the quiet endings (Una, Mrs Brabant, Fosse, Bess pitied, the galley) now have conditions of their own rather than being "holding the box at the gap" re-skinned. A reviewer can still say that the box is a plot coupon in all but its name. It is never required, and a company can leave it in a river and still reach the gap.
