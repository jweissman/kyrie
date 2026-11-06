# Hollins: prose quality pass

Editor's pass on `data/adventures/hollins/*.kyr` (about 207 KB of dumped prose). Text only; no ids, conditions or mechanics changed. Changed strings were grepped against `test/`
first (none asserted).

## What I found

Hollins is the most inventive of the four. Scale is the engine and every room has a sensory fact the reader could not have supplied (a rope ladder to a brass letterbox with MIND THE DROP painted on it; a
village that lives off what falls out of a door; a Tapwarden counting a drip; the Readers who copy a giant's line of print on foot, "We are on M. It has been M for forty years"). The big set pieces
(the Lady's address to the skirting, Dame Honor kneeling to the window, the Keys' hour-long note, the Moot) are earned and specific. Speakers are distinct:

- **Jory Mudge**: bread, flour, "mark you", tells what "we tell nobody".
- **Hob Ludd**: trade patter, "it's not dishonest, it's tradition".
- **Faith Penny**: the register, exact numbers, a joke built on rules ("The Post is not a cupboard").
- **Dame Honor / Mr Ambry**: the Forms, the thimble, ceremonial English cut short by a quiet "Thank you, Mr Ambry".
- **Tapwarden Drewe**: fairness counted in thimbles, "That's how it always starts".
- **Sister Verity / Prior Tobit**: the Winders' grief, fierce short sentences against calm long ones.
- **Mrs Pyecroft**: ledger English; never raises her voice.

The weakness is repetition of *one number and one gesture*: "three hundred years" (and "three hundred and twelve") appears 54 times in the files, and the announced silence ("looks at you a long
moment") sits in the middle of otherwise concrete scenes. The companion-voice lines (`hv_*`) all have one shape: action clause, quote, dry second sentence in the quote.

## Before / after

1. **The Smoking chapter (`acts.kyr`, ch_smoking).** *Before:* "Everyone can feel that something is coming to an end, and nobody can say what." *After:* "Faith Penny has begun to enter every name in the register twice, in case." The dread is carried by a clerk's habit.
2. **Bet Collier hears the fire is to be lit (`drawing.kyr`, warn_bet).** *Before:* "She looks at the logs on the irons, as if for the first time." *After:* "She looks at the logs, and then up the black throat of the chimney, which in ninety years she has never once looked up."
3. **Faith Penny and her cap (`hall.kyr`).** *Before:* "Faith Penny looks at you for a long time. Then she takes off her green cap, and puts it on the counter, and then puts it back on, because it is not a thing she can give." *After:* "Faith Penny takes off her green cap, puts it on the counter, and puts it back on, because the cap is not hers to give." The long look is cut; the gesture stays.
4. **Bootscrape's introduction (`acts.kyr`, ch_bootscrape).** *Before:* "It has done so for three hundred years without once telling anyone from outside what it knows." *After:* "It has done so since before the oldest grandmother in it was born, and has never told a carter what it knows."
5. **The Waiting Stone (`plots.kyr`, fate_stone).** *Before:* "...does not seem to be waiting any more; people who walk up there say so, and cannot say why." *After:* "...the lichen on the house side has grown back over the fresh line, and people who walk up there say it does not seem to be waiting any more." The rumour now has a fact behind it, tied back to the earlier stone-turned line.
6. **The Prior listens to the Lady's word (`hall.kyr`, tobit_told).** *Before:* "he sits for a long while on his bench under the swinging brass sun." *After:* "he sits on his bench under the swinging brass sun until the pendulum has gone over twice." Time measured by the clock he keeps.
7. **Companion voices (`winders.kyr`).** *Warrior at the bed, before:* "{?m} stands at the foot of the counterpane with hands folded, as at a deathbed in a field. 'I have stood watch like this over people in worse places,' {?m} says, very low. 'You do not talk...'" *After:* "'You do not talk,' {?m} says, very low, hands folded at the foot of the counterpane. 'You stay on your feet. You let her see someone is standing.'" *Bard at the bed, before:* a quoted observation ending "They are all keeping the same time." *After:* "'Hush.' {?m} lifts a finger... 'The clock, the keys and her breath,' {?m} says, under all three. 'Same beat. Don't move.'" The line is now said in the moment, not about it.
8. **Fennick on the Regiment (`nursery.kyr`).** *Before:* "'Every morning. Three hundred years.'" *After:* "'Every morning, before light.'" And his silence, "He is quiet a long time", became "His winding hand goes round once on nothing."

Also added a sensory detail to a room that was a list of cold and wet: the wine-cellar foot now has "every few seconds someone in the brick says, quite close to your ear, 'Hush.'" (the cellar folk carry no light).

## Patterns fixed (counts across `data/adventures/hollins`, before to after)

| Pattern | Before | After |
|---|---|---|
| "a long time / while / moment" | 30 | 17 |
| "for the first time" | 4 | 3 |
| "as if" | 31 | 28 |
| "three hundred (and twelve) years" | 54 | 47 |
| `hv_*` companion lines recast so the quote is not the same shape | - | 3 |
| silences replaced by an action | - | 11 |

## Still weak

- **"three hundred years"** remains 47 times. The number is the premise and Jory, Mab and the Winders may say it; the narrator should not. Another pass should replace each narrator use with a concrete age (a dated stone, a name on a lintel).
- **The Wainscot's six hundred** are a crowd with a dozen mouths. The Court, the Readers, the Keys, the Post, the Jarmen and the Risers are distinct; the Nail's regulars and the Bellwalk couriers are not.
- **`_again` repeats** (20-odd verbatim second answers).
- **Two ending families** (`fate_regiment_*`, `fate_pye_*`) lean on the tin soldiers "Captain" gag, which is good once.

## What a structural fix would need

- The Moot, the Smoking and the Lady's death each depend on a clock the player cannot read; a diegetic timekeeper (the Long Clock itself, whose strike is already a mechanic) could carry the dread that prose alone only tells.
- A short second-visit text for each Wainscot district would let the places change with the fire, the poison and the Moot's outcome (today only a few have `*_after` variants).
