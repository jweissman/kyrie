# Half the Hive: prose quality pass

Editor's pass on `data/adventures/half-the-hive/*.kyr` (about 171 KB dumped). Text only. No ids, conditions or mechanics touched; changed strings grepped against `test/` first (none asserted).

## What I found

Pastoral and cruel, as the bible says, and well kept: smoke at the mouth of the gorge, warmth "out of all proportion to the day", a honeycomb the size of a town, a Dancing Hall tilted like a roof whose
walls are scored with generations of dances, a Capped Gallery where the dead stand in clear wax. The people are distinct and mostly true:

- **Kestrel Dunn**: gruff, hands before words, tells you a rule while doing something to a strap.
- **Ivo Gildersleeve**: grand, comic, a Drone's vocabulary ("I should be delighted"), and under it a man who cannot do anything.
- **Martin** (the deaf ear): understatement, wipes the board.
- **Huw Penry**: vain, the one man who cannot be told.
- **Elspet Garnock**: smell and spectacles, the Scent-warden's rule as courtesy.
- **Crispin Polglaze**: "I am a price", the villain who never raises his voice.
- **Hannet / Agnes**: the old, plain, practical; Hannet's "carried, like a cheese".

The weak places were again announced silences ("is quiet a long time", "looks at you a long time", sixteen in all), several moments where a character ended on a motif sentence about what the
Comb *is*, and the pair "I am not cruel / I am the door" which were aphorisms spoken by a character who is not a speaker of aphorisms. Elsewhere "I am not a bad man / I am not cruel / I'm not glad" was a shared denial formula.

## Before / after

1. **Kestrel at Larkhill, rent (`after.kyr`).** *Before:* "does not say anything at all for so long that you think she has not heard. Then she says, 'Rent,' as if it were a word in another language, and goes back to splitting withies." *After:* "and says nothing; she splits two withies while you wait. Then she says, 'Rent,' the way you would name a sickness, and goes back to splitting." Silence now has work in it.
2. **Elspet on Nell (`apron.kyr`).** *Before:* "'She asks me every year. I say no every year. I am not cruel,' she says. 'I am the door. A door that opens to everyone is not a door.'" *After:* "'I say it kindly, now,' she says. 'It took me some years to learn how.'" The Scent-warden is no longer announcing her office; the sentence is about her.
3. **Elspet smells the stolen scent.** *Before:* "She looks at you over her spectacles for a long moment, and does not ask where you got it, which is worse." *After:* "...and does not ask where you got it. You would rather she had." Same beat, one image fewer.
4. **Kestrel hears of the seventh Leaving (`dance.kyr`).** *Before:* "When you tell her about the people in the comb inside the tree she is quiet a long time." *After:* "...she wipes the dance-slate clean, though it is clean."
5. **Agnes's dark watch (`talk`).** *Before:* "She looks at you a long time. 'Tonight,' she says." *After:* "Agnes counts something on the fingers of one hand. 'Tonight,' she says." Eben's "He looks at you a long time, and decides" is now "He looks you over, and you can see him deciding".
6. **Kestrel's reaction to Ivo's drove (`ivo.kyr`).** *Before:* "She looks at Ivo for a long moment." *After:* "She looks at Ivo's boots, which have never done a mile of work." The comedy of the Escort is the one that stings her.
7. **The Dell (`dell.kyr`, `country.kyr`).** *Before:* "For a long moment nothing. Then a broad striped head comes out of the dark." *After:* "Nothing. A fly walks along the chalk. Then a broad striped head..." And the Dell floor scene, a pleasant harebell list, gained: "In the grass lies a bone the length of a man's thigh, gnawed pale and clean, and nobody has moved it."
8. **Agnes stays (`calling.kyr`).** *Before:* "'I'll not leave him alone up there,' she says, to nobody, and sits down." *After:* "...to the floor, and sits down." Eben staying, "as if he could see through her", is now "and goes on looking". Hannet's "does not say anything" at the gift of the wax bee became "closes her fingers over it".

## Patterns fixed (counts across `data/adventures/half-the-hive`, before to after)

| Pattern | Before | After |
|---|---|---|
| "a long time / while / moment" | 16 | 2 |
| "to nobody" | 4 | 3 |
| "as if" | 41 | 38 |
| aphorism closer in a non-sage's mouth | 3 | 0 |
| "does not say anything" (announced silence) | 6 | 2 |
| bare-list room given a concrete unguessable detail | - | 1 |

## Speaking habits (kept)

Kestrel, Ivo, Martin, Huw, Elspet, Crispin, Hannet. The Searchers and the Drones are the two easiest groups to tell apart in the file.

## Still weak

- **The Calling** is eleven consecutive "X stands up and says Y" variants (Brecks, Candlishes, Mellors, Hannet...). Each is cleanly different, but the *shape* is one shape; the scene is also the one in the file with the greatest weight. A single interruption or mishap in the middle (a child laughing, a slate dropped) would break the run.
- **"the new comb"** appears 17 times, partly the name, partly the narrator; "four hundred years" 8 times.
- **`_again` repeats** and the `founding_*` family (the same arrival paragraph with a different place name and two sentences changed).
- **Ending paragraphs** end on an image of the comb with a closing consoling note.

## What a structural fix would need

- The ledger lists "the east was laid" as a payoff and no scene delivers it; prose cannot repair that, only a place or a find on the Far Brow road.
- Distinct *Searcher* calling-keyed beats beyond the first three: the companion party (warrior, bard, cleric, thief) get one voice each on the Apron and then nothing in the wood or the Dell, where the danger is. Four more `hv_*`-style rules would be a Kyr-only change (`memberOf(?m, party) and hasCalling(...)`), outside a prose pass.
