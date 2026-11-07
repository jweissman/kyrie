# The Wrong Boat

*Adventure V of [the anthology](README.md). A pursuit. Module `data/adventures/wrongboat/` (province "the Aldwater", south of the first country), campaign `data/campaigns/wrongboat.campaign.json`, spec `test/wrongboat.test.ts`. 7 November 2026, revised after a hostile review. Form and ending rules: [forms.md](forms.md). Frictions: [friction-wrongboat.md](friction-wrongboat.md).*

## What it is

The company has paid for passage on the *Patient Maud*. The Maud has gone. A landlady with a kitchen on fire presses a hamper on them for the Maud's cook, and they step aboard the *Patient Mary*, which looks the same. Under the seed-cakes in the hamper is a music box. The Mary's owner, Hob Garrod, took it from a dead bargeman's widow against a debt, left it at the Heron to be carried to a buyer, and went off to be locked up for eleven shillings. The widow, Bess Lowther, a toll-clerk owed three months' wages, has followed it to the quay; two of the Trust's lads, sent by Sergeant Brill (named in Bess's speech, never met), are coming by another road. Nobody is asking the company to find out anything. The company has to get down a river, over a hill and out of the story, with a thing they cannot put down, and a clock that is not theirs.

## Why it is not the others

| | The usual shape | This |
|---|---|---|
| The party | licensed, competent, welcomed | passengers who got on the wrong boat |
| The time | spent asking and gathering | spent *waiting* (a barge keeps a timetable), *moving* and *being seen* |
| The pressure | a deadline set by the author's festival | **a chaser who hunts the company where it is** (Bess), and a second the party can sweep, pay or fool (the lads) |
| What makes the climax possible | evidence laid before a body | a place and a moment: the fen mist, the fair crowd, the relief sluice, the ferry chain |
| The end | a settlement | one of **seventeen** private endings: a kitchen, a fiasco, a box taken kindly, a friend left on a stage, a fall from a chain |

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

- **Bess hunts.** `bess_fen` sends her by the old fen road on the porter's cry (fourteen watches) or after twenty; thereafter `hunt.kyr` has one pursuit per room (`hunt_bess_<room>`, priority 8) seeking *the room the company is in*, so she walks to where they are, boards the deck when a plank is open at her landing, and cannot board on open water. The hunt is off while the company is hiding, for thirty watches after a lost trail, once she is an ally, and after she has the box. She *sees* them in a room unless they are hiding, disguised or in the fen mist; hiding wears off in three hours and has to be taken up again.
- **Being met has a cost.** Once she has seen them they have three watches. If the box is still in the pack she takes it, kindly (`bessTook`, an ending). The ways out: put it in her hands; name Hob and walk with her; swear it is cakes (a roll; failure tells her you lie); break and run (a roll; failure and she has it).
- **The lads** take the back road to the weir; once the company has used the Highfoot stage they hunt it as Bess does. A territorial pair: after five watches in the room they snatch the box (`caught`), unless the relief sluice has swept them down the weir, they have been paid fifteen coin, the box is theirs, or the company is not in the room.
- **Information that changes:** the quay-warden's report (split on whether the company is disguised, or can be bluffed), Parr's mistake, Noll's "behind you now, though the mist is a great liar".
- **False trail:** a ration-cake in a dishcloth in the eel-skiff sends Bess to the eel-stage (`bess_decoy`, priority 9).
- **Disguise** (the slop-shop: a bargeman, or a bridegroom in lavender; one fools her and one does not), **hiding** (hold, galley if Mrs Brabant is willing, bell-cot loft, puppet booth, the ferry), **the fen mist**.
- **The chain.** If the ferry is not paid, Highfoot can be crossed hand over hand on the cable: a climbing check, the box in the water on a fall.

## The box

A music box in the shape of a loaf, brass-cornered, which plays *The Miller's Daughter*, a song the whole river sings with a hundred verses added, and which Tom Lowther wrote for his wife. Wind it twice; the third time, a drawer (a wage-slip, seven months unpaid on the Mary). The back-plate says *B.L. from T.L., the day we were wed.* It can be kept, sold (fifty coin to the dealer; forty to Mr Fosse at the Last Pint, who is the buyer Hob meant it for), dropped in the river, traded (to a young gentleman for a horse), surrendered, given back, or carried to the gap. It is never a plot coupon: no door opens with it, and nobody needs to know what it is, which is part of the pleasure.

## Faces

Dolly Prout (skipper, boisterous; fare by coin or by peeling), Mrs Brabant the cook (cries into the soup and means it), Shim Garrod the mate (nineteen, shouts the news of the river to nobody), Mr Peregrine Dally (a young gentleman on the wrong barge for the right reason), Mother Cobbold, Jack Parr, Una Marchbank (the ferrywoman who speaks in few words), Joel Sunderland the dealer, Orpha Tunney the slop-seller, Gabriel Hoby the puppet-man, Noll Fairley the bellman, Tabitha and Wilfred Auster at the mill, Barnaby Fosse at the Last Pint, Hob Garrod in the lock-up.
**Companions with arcs:** *Shim* (interview: whose side are you on when your uncle is wrong; at Pelham, whether to visit the lock-up; at the hill foot he stops or goes on, by what the company did) and *Mr Dally* (a question about love; the bell; the choice to go or to bolt; the horse).
**Side episodes unconnected to the main line:** Hoby's play and the villain the player names; Noll's bell; the miller's boy's sum; the greased fair itself.

## Endings

Tried in written order; `over` resolves the two contests. *Left on the Towpath* (the lads, a dead company). *The Aldwater Keeps It* (the chain). *Taken on the Towpath* (the lads). *Her Hands on the Box* (Bess takes it, kindly). *The Lowther Kitchen* (given back). *A Glorious Bad Bargain*. *Forty Coin and a Back-plate*. *Hand over Hand*. *Without Shim*. *Bess at the Gap*. *Shim at the Gap*. *Down the Weir*. *Fifty Coin and No Questions*. *Empty Hands*. *Over the Gap with a Hamper*. *Clean Water*. *Over the Gap*. None settles a society.

## Tested

`test/wrongboat.test.ts`, thirteen journeys by the labels a player sees, with waits in pieces because a long wait would let Bess act inside it: lint; the porter's cry and Bess coming to the deck; cast off with the chaser left on the quay; the kitchen; the box taken when a meeting is left to lie; the run for it, failed and passed; the deck at Highfoot not a sanctuary; the weir; the dealer; the bargain with Mr Dally; the towpath; Mr Fosse; Bess walking with the company, kept across a save. `adventure-names`, `adventure-library`, `countries-tool`, `provinces` pass.

## 1. Content that works in play

The mistake and the hamper; the barge timetable and planks; the hunt (Bess and the lads walk to the company, board, give up, return); being seen, hiding that wears off, disguise, the mist, the false trail; the cost of a meeting; Bess's conversation; the sluice; the ferry and the chain; the endings above; Shim's interview and Dally's.

## 2. Authored content present but not reachable (or not specced)

Hiding with Bess in the room by the bell-cot, booth, galley and ferry (the die is not forced in any journey); `swear_false` as a roll; Dolly's `put_ashore` after ten watches without fare; Mrs Brabant's confession (played by hand); Dally's church and the wedding Observes; Shim's visit to his uncle and the two hill-foot rules; Hoby's play; Tabitha's pie; the miller's sum; `pay_lads`; `drop_box`; `Empty Hands`, `Bess at the Gap` and `Clean Water` (reachable, not specced); `quillRead` is a flag with advice only; Sergeant Brill is only spoken of.

## 3. Actions or consequences the engine cannot yet represent

- A **moving place**: the Mary is four rooms, five planks and a timetable, not a thing that goes (circus friction 1).
- A **pursuer who is sighted at a distance**: rumours are Topics keyed on where Bess is; a company cannot look down a road and see her coming.
- A **search of a room**: hiding is a die, not a contest of what is moved.
- A **pursuit that is satisfied falls through** to a lower pursuit (see friction 13), so a chaser's "stay" is written with arrival flags.
- No **map** shows the Mary's course, and the chaser's clock is invisible unless asked.

## 4. Existing assets whose integration is incomplete

- The music box is an Orsino valuable (`music_box`, 50): its tune is nothing the engine can play, and the page can only say it plays.
- Orsino gear named by the slop-seller (bargeman's smock, lavender coat) is a fact, not a garment.
- The fen's plants and eels are told in prose only; the river has no herbs in the catalog.
- No **new species**: the river's animals are a heron, geese, a bear on a chain and an unseen eel, all prose.
