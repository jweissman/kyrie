# The Wrong Boat

*Adventure V of [the anthology](README.md). A pursuit. Module `data/adventures/wrongboat/` (province "the Aldwater", south of the first country), campaign `data/campaigns/wrongboat.campaign.json`, spec `test/wrongboat.test.ts`. 7 November 2026, revised after a hostile review. Form and ending rules: [forms.md](forms.md). Frictions: [friction-wrongboat.md](friction-wrongboat.md).*

## What it is

The company has paid for passage on the *Patient Maud*. The Maud has gone. A landlady with a kitchen on fire presses a hamper on them for the Maud's cook, and they step aboard the *Patient Mary*, which looks the same. Under the seed-cakes is Bess Lowther's wedding music box, stolen by Hob Garrod to sell. Bess wants the part of her husband's song that was hers alone. Sergeant Brill wants the private verse under its comb suppressed: it remembers him crying into the wedding cake and riding home backwards on a donkey. His two lads take another road. Nobody asks the company to investigate. They have to get down a river with a thing they cannot put down and a clock that is not theirs. Ordinary fares and Hob's gaol bill remain; debt no longer explains why the box is wanted.

## Why it is not the others

| | The usual shape | This |
|---|---|---|
| The party | licensed, competent, welcomed | passengers who got on the wrong boat |
| The time | spent asking and gathering | spent *waiting* (a barge keeps a timetable), *moving* and *being seen* |
| The pressure | a deadline set by the author's festival | **a chaser who hunts the company where it is** (Bess), and a second, waiting at the weir, whom the party can sweep, pay (fifteen coin), fight (a roll) or lose the pack to |
| What makes the climax possible | evidence laid before a body | a place and a moment: the fen mist, the fair crowd, the relief sluice, the ferry chain |
| The end | a settlement | private endings: a kitchen, a fiasco, a box taken kindly, a friend left on a stage, a fall from a chain |

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
   (two land ways from the toll-house: the old fen road, 5 h, for Bess; the high back road, 6 h, which a walker takes; the lads wait at its end)
```

The Mary's four rooms (deck, cabin, hold, galley) are carried from landing to landing by a timetable (`stageNow`), watches counted from the quay: at Staithe to +9, afloat, at the fen +60–70, afloat, at Pelham +150–185, afloat, at the race-head +225–245, afloat, at Highfoot from +290. Each plank is a ferry passage that opens only where she lies, with no closed-way text. A company that steps ashore at the fen is a company the barge will leave.

## Pressure and play

- **The quick road costs what a company has, and it costs a meeting.** The barge takes more than two hundred watches; the walk takes about fifty. The coin is scarce and has competing uses: the lads' toll is fifteen of the twenty the company starts with, Una's fare is four on a fair-day, the bargeman's smock is four and the lavender seven. A company that pays the lads, and Una, has one coin left, and has not bought a disguise. The lads are *at the weir already* and hold the towpath: the passage from the weir to the Highfoot stage is closed to a company that carries something ("two men in grey coats… standing in the middle of it") until they are paid, beaten (a roll), swept (a roll, once), have what they came for, or find the company escorted. A company that carries nothing, because it never took the hamper or has dropped the box, walks past them; there is nothing to take. Paying takes two watches.
- **Bess reaches a walker.** A hunt by pursuit answers a move after the move is made, so the engine leaves her a whole hop behind any company that walks a long road (friction 19). She would never arrive. So the carrier on the high road runs a dog-cart, and she rides it on the Trust's name: she is at the weir from watch 52 and at the Highfoot stage from watch 64, whatever the company has done (a fixed clock gate, not a pursuit; see friction 25). At the stage Una will not cross while she is there unmet. The walker's clean run is therefore not clean: it needs the lads dealt with *and* Bess (a roll, a truth, a lie, the box, or an ally), and the coin for both.
- **The barge** is the slow way and is safe from the lads: Bess is at the fen landing before the Mary, comes aboard the moment a plank opens, and **searches** a hidden company. A hide costs a ration and a watch, wears off in three hours, and is a gamble: she finds you one time in three (and you are confronted as ever), otherwise she is satisfied and goes off the hunt for ninety watches. Una's tarpaulin and Noll's loft are hides she does not search. The Mary lies the night at the fen and the fair-day at Pelham because Dolly will not run the Wend by dark and the lock-keeper will not open for less than a morning. A company that works its passage in the galley keeps its coin and loses the deck.
- **Bess hunts.** `bess_fen` sends her by the old fen road only while the company is aboard; otherwise `hunt.kyr` has one pursuit per room seeking the room the company is in. A satisfied pursuit falls to the next lower one, so the itinerary pursuit is off whenever she is with the company; a test asserts that her trail never goes A, B, A. She is off the hunt for good once she has been *met* (a successful swear, run or stand, or any answer that sends her off), allied, given the box, or when she has it. That is a design decision: one success ends the chase, and the roll was the price.
- **Being met has a cost, and every way out is a decision.** Once she has seen them the company has three watches. If the box or the unopened hamper is in the pack she takes it, kindly. The ways out: put it in her hands; walk with her (offered only once the company has something to show, from Mrs Brabant, Parr's recognition, the lock-up or the private verse, or by a persuasion roll on a porter's word; and **not after a failed oath**, because swearing first and falling back on Hob is closed); swear it is cakes (a roll, and a lie, which loses the cook's goodwill); tell her it is not hers (an intimidation roll, a truth); or break and run (a roll). A company with nothing in its hands is turned away.
- **The kind ending has a price, and so do the others.** Giving Bess the box is *The Lowther Kitchen* only if the lads have been dealt with; if not, two men are at her door in the morning (*Briefly*). Publishing the verse gives a separate closed-window kitchen: safe but no longer private. Taking her with the company costs the box in every case, and an allied Bess is an escort: the lads stand off, the towpath opens, and Una will cross with the pair on the stage. Walking her to the Pelham lock-up is a reunion in the cell and Bess stays there. Giving the box to Hob, who owns the boat but not the gift, is an ending of its own. Selling it sends Bess to the dealer. Dropping it ends the chase and everyone's use for the company, and its price is the river.
- **The relief sluice is not a free win.** It is a brawn roll at the wheel, two watches, and **one try**: a failure brings the lads up the path to the hut and the wheel cannot be spun again. Success sweeps them off the apron: one is sick on the far shingle and the other is not there. There is no milestone for it. An allied Bess turns round and goes ("Tom went in at that weir"), and *Down the Weir* is written as what it is.
- **The lads** are not fought by the engine: they are peaceable people with a plan, and the menace, the five watches and the robbery are rules. The fight is an action with a check, a coin cost and a consequence; a failure leaves the company beaten up with nothing in the pack.
- **The ferry is the company's.** It opens only while the company has paid and is standing on the stage, and shuts again when they land. With the pair (or Bess, unmet) on the stage, and no escort, Una will not cross, and the chain is the way over: a climbing check, the pack in the water if it fails.
- **Information that changes:** the quay-warden's report (split on whether the company is disguised, or can be bluffed), Parr's mistake, Noll's "behind you now, though the mist is a great liar".
- **False trail:** a ration-cake in a dishcloth in the eel-skiff sends Bess to the eel-stage, and a company that lands at the fen on foot has time to lay it.
- **Disguise** (the slop-shop: a bargeman, or a bridegroom in lavender; one fools her and one does not, and the page shows which), **hiding** (hold, galley if Mrs Brabant is willing and the company has not lied to Bess, bell-cot loft, puppet booth, the ferry stage, the mill yard, Pelham quay after the bluff).

## The box

A music box in the shape of a loaf, brass-cornered, which plays *The Miller's Daughter*, a song the whole river sings with a hundred and nineteen verses added, and which Tom Lowther wrote for his wife. Wind it twice; the third time, a drawer containing the private wedding verse and Hob's instruction to sell it. The back-plate says *B.L. from T.L., the day we were wed.* It can still be kept, sold, dropped, traded, surrendered, returned or carried to the gap. Reading the verse supplies another route: give it to Hoby's audience. The children make confiscating the original pointless, so the lads cease blocking the way and cannot undo its return. But Bess's private memory becomes everybody's joke. There is no hearing, verdict or compulsory revelation.

## Corpus-review follow-up, 27 November

The pursuit, timetable, fares, checks and existing escapes stay. Three local connections make attention matter:

- Parr recognises Hob's handwriting on the hamper; this now supplies the existing evidence needed to approach Bess honestly.
- A company that cannot claim to have lost anybody can stay and peel without prying. Five minutes earn a meal and Mrs Brabant's existing shelter, not a confession.
- Naming Hob as Hoby's villain opens the public-song route. Reading the actual document is necessary; remembering its contents is enough, so the box need not be sacrificed. The returned-box aftermath has a separate closed-window scene when the verse was published.

The intimate cost is not a coin price. Publishing protects an object while changing what it means to its owner. Keeping it private leaves the old payment, escort, evasion and force routes available. This episode needs no Empty Seat state or other campaign installed.

The focused proof is [corpus-aftercare.test.ts](../../../test/small/corpus-aftercare.test.ts): actual authored fragments on shared rules, including a hidden route, a guard before and after performance, restored memory and the distinct aftermath. Full pursuit walks and rendered-page acceptance remain separate; the new proof does not rerun them.

## Faces

Dolly Prout (skipper, boisterous; fare by coin or by peeling), Mrs Brabant the cook (cries into the soup and means it), Shim Garrod the mate (nineteen, shouts the news of the river to nobody), Mr Peregrine Dally (a young gentleman on the wrong barge for the right reason), Mother Cobbold, Jack Parr, Una Rendle (the ferrywoman who speaks in few words), Joel Sunderland the dealer, Orpha Tunney the slop-seller, Gabriel Hoby the puppet-man, Noll Fairley the bellman, Tabitha and Wilfred Auster at the mill, Barnaby Fosse at the Last Pint, Hob Garrod in the lock-up.
**Companions with arcs:** *Shim* (interview: whose side are you on when your uncle is wrong; at Pelham, whether to visit the lock-up; at the hill foot he stops or goes on, by what the company did) and *Mr Dally* (a question about love; the bell; the choice to go or to bolt; the horse).
**Side episodes unconnected to the main line:** Hoby's play and the villain the player names; Noll's bell; the miller's boy's sum; the greased fair itself.

## Endings

Tried in written order; `over` marks the contests. Losses: *Left on the Towpath*, *The Aldwater Keeps It*, *Taken on the Towpath*, *Her Hands on the Box*. Returns: *The Owner of the Boat, Not the Box* (given to Hob), *The Lowther Kitchen* (the lads dealt with), *Briefly* (they were not), and *with the Window Shut* (the verse published). Sales, the horse bargain and the chain crossing have their own aftermaths.

Companions leave or stay: Shim for blood, tobacco or the one wronged; Bess to confront Hob; Dally to marry or keep running. Una's song, Mrs Brabant's warning, Fosse's refusal, Tabitha's tea and the galley work remain separately remembered. The last escapes distinguish carrying a known box, an unknown box, an unopened hamper or nothing. None settles a society.

## Tested

`test/wrongboat.test.ts`, 45 journeys and a lint test, by the labels a player sees, with waits in pieces because a long wait would let Bess act inside it. Nothing sets Bess aside. Where luck decides (a check) the journey forces the roll (`roll('pass' | 'fail')`) and says so; the walking journeys deal with the dog-cart Bess by a forced-pass oath at the stage (`@bess` in the test), and the hiding journey runs eight seeds and asserts that both a find and a miss occur. No test stages a relation. The journeys: lint; the porter's cry; Bess never reversing (aboard and dawdling); cast off; not being put ashore mid-river; galley duty; the kitchen with the lads paid, and without them; the box taken; the hamper taken; empty hands turned away; "it was Hob Garrod" gated, with its roll won and lost and latched; a failed oath closing the fallback; "not hers to ask for" as a roll; the run; hiding that costs, wears off and gambles; the first meeting on the deck; the walk blocked at the weir; the walk paid to Clean Water; the lads hunting a company that steps away; the hamper carried unopened and robbed; the fight won and lost; the sluice failed (once only), won and with an ally; Empty Hands; the walker with nothing; Fifty Coin; the bargain, the peal, the cold peal and the bolted Dally; the towpath; Mr Fosse's Last Pint and Fosse's refusal; the ferrywoman's refusal and the chain won and lost; the escort trap; the ferry not shared; Bess allied, kept across a save, escorting, at the gap, and in the lock-up; Shim four ways; Una, Mrs Brabant, Tabitha and the galley; the fen on foot and the decoy; a message not passed.

Not specced: hiding in Una's tarpaulin and Noll's loft with Bess in the room; the miller's boy's sum; the lavender bluff; *The Owner of the Boat, Not the Box*; the mist (read, not asserted).

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

Honestly: the setting counters the licensed-outsider shape (the company is not licensed, nobody asks it to investigate, there is no body to convince), and no ending establishes a civic settlement. It does not escape the *reform* shape entirely. The central dilemma is still whose the box is, and the ally route (the cook's word, "it was Hob Garrod", the lock-up) is a form of recognition. What the revision does is give the dilemma a cost curve instead of a free kind ending: the kind ending needs the lads dealt with or it is undone at the door; the harsh acts (the sluice, the fight) cost a roll, coin or an ally, and are written as what they are; and the quiet endings (Una, Mrs Brabant, Fosse, Bess pitied, the galley) now have conditions of their own rather than being "holding the box at the gap" re-skinned. A reviewer can still say that the box is a plot coupon in all but its name. It is never required, and a company can leave it in a river and still reach the gap. The honest weak point: the reform route is still the *kindest*, and its price (the box, a roll or an ally, a trip to Pelham) is a price in ordinary game currency; a reviewer who wants the cheap routes (sell, drop, keep) to carry moral weight as well as material cost can find only text in the endings for it, and one consequence (Bess to the dealer).
