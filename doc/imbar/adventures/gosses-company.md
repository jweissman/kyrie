# Gosse's Company: broad-pass ledger

*Branch `adventure/imbar-deep-time`. Module `data/adventures/gosses-company/`. New: `voices.kyr`. Edited: `office.kyr` (one condition on the bribe), `module.json`/`placed.json` (source, canon). Test: `test/gosses-company-voices.test.ts`; fixture `test/fixtures/gosse/ranger.campaign.json`.*

## The Account

| | |
|---|---|
| **Count** | The Office's notches: a crown a line for every unlicensed word; behind them the one death the first joke cost. |
| **Keeper** | Abel Tunstall, chief clerk, who is the lamplighter's son and counts the notches. |
| **First page** | A brass plate by the minster's west door: ABEL TUNSTALL, LAMPLIGHTER, who fell from his ladder on the second night of the singing. Nobody reads it. |
| **Price of reading** | Gosse's boast curdles; the Master's Office becomes a debt; the comedy gains its shadow. |

## Acts (already in `doc/adventures/gosses-company/12-second-pass.md`; here by scene and face)

| Act | Scene (place, face) |
|---|---|
| I. Arrival | Wending Cross green (Lem Coyle), the West Road, the Painted Moon's loft (Gosse, Hepzibah) |
| II. Labours | The Office (Tunstall, the Master), the Owl (the Bench), the Soke, the Gullet (Ma Tolly) |
| III. The third night | The empty Wheel (Gosse alone), the weir stones (Nan Scullard), the bear-garden (Bowle) |
| IV. The night | The Wheel: *The Alderman's Ghost* |
| V. The reckoning | Urania Orde's supper; the verdict |

## Characterization

- **Gosse**: wants one more house; fears the day he forgets the words; says a joke never hurt anybody; when pressed, goes alone to the empty Wheel and dries (existing), and apologises when told of the lamplighter (existing).
- **Clemency Orde**: wants her father laughed at kindly; fears to be like him; says it is the law; surprises with "Somebody might".
- **Tunstall**: wants the count to balance; fears the ledger of the dead has an unwritten page; says rigour is a virtue. **In play (new)**: at six of a morning he kneels at his father's plate with a rag, and if a cleric says the office before him, he gives the company his father's lamplighter's seal, and writes two words beside the Eighth Ordinance: SEE PLATE.
- **Urania, Hepzibah**: see the earlier documents.

## Companion arc

The preset party is one traveller; the arc is therefore by calling and by the troupe. Six voices, each once and in a different place: bard in the empty Wheel (the dead left corner, which is Gosse's deaf side), cleric at the plate (rag-polish and a song on a plate), thief at the Office (the Master's lock is the cheap one), warrior in the bear-garden (watch Bowle's left hand), ranger at the weir (a fire banked to be returned to), mage under the stage (a step built to carry a whisper to the last seat).

**The way only a cleric has, and its price.** The Eighth Ordinance (the dead's words may not be struck) can be found by a roll in the Office. A cleric finds it at the plate without a roll, in two ways that exclude each other: **say the office alone** (an hour; no price; the Ordinance and the lamplighter's story) or **say it aloud before Tunstall at six in the morning** (he gives the seal; the Master's trust rises by one; and he can no longer be bribed, so the ten-coin way through the licence is shut). The choice is between a safe, private kindness and a gift that costs a shortcut.

## Danger with two noncombat exits

Already present: Bowle's mastiffs (hush, pay, torch, plead, or the Liberty), the weir-rats (pay, talk, face down, name the Gullet, cross before dark). I checked each has two noncombat exits.

## New depth

1. Tunstall polishes the plate at six of a morning, before the Office opens, as he has since he was nine (Observe at the nave).
2. The Wheel's acoustics: a dead left-hand corner of the stage (bard); the Aenean step carries a whisper to the last row (mage).
3. A fire at the weir banked with wet wood so that it will be there at dusk (ranger).
4. Pudding and the Lord Warden's Men's bill for a ship out of a cellar (below).

## Links

- **Out**: `befell(remainder_harboured)` read by Inchbald: a bill has come up the roads for a play, *The Ship That Came Late, or, The Mariners of No Weather*, by the Lord Warden's Men late of Sennet. Pudding wants machinery. The catalog `lamplighter_seal` is the reward of the aloud requiem (a Lamplighters' seal; the Dorothea's `watch_tally` is the same family of thing).
- **In**: players are the first to hear and the first to put on any prodigy; a visitor from elsewhere comes with the Trial of the Wheel's bills.

## Tone, foreshadow, payoff

- **Contrast**: the requiem is the deliberate grave scene in a comedy.
- **Planted early**: the lamplighter's boy in the Chepe, and the lamp cut under A. GOSSE (earlier pass). **New**: Tunstall at the plate at six, seen by anyone near the minster on day 0 or 1. **Paid in the last act**: the aloud requiem's seal and "SEE PLATE" when the company returns to the Office; the plate in the morning after the verdict (earlier pass).

## Tests

`bun test test/gosses-company-voices.test.ts` (7): lint; six callings in six places; the requiem alone and aloud (the seal, the Master's trust, no bribe, nothing offered to a thief); Tunstall at the plate at six; Inchbald's bill only once the event has befallen. `gosses-company.test.ts` and `gosses-company-wander.test.ts` were re-run.

## Shortfalls

- One-person party; no roster of preset companions to hold a quarrel (the Long Man's `quarrelled` needs two callings).
- The ranger voice and the weir fixture's background are mine; no other build was exercised in the full journeys.
- The lint says the playbill topic has "no possible target": true until the event has befallen.
