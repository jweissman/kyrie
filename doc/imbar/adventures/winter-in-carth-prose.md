# A Winter in Carth: prose quality pass

Editor's pass against `doc/imbar/14-bible.md` and `16-critical-review.md` section 4. Read: the seen, rules, talk, acts
and endings dumps (`bin/kyrie prose`; the `_again` repeats skipped), plus `voice repeats`. Lens: boredom and interest.

## What I found

The adventure is in good condition. Its people are distinct (Hern, Raistrick, Annis, Dinsdale, Pickersgill and her
figs, Bess Ackroyd, Hawise, Joby), every scene has a stake, and the Fastens' Eve and Ash Day set pieces turn. The faults:

1. **"A long time" as the all-purpose beat.** 19 "for a long time" and 14 other "a long time"s, mostly in the speeches
   of Hern, Bess, Joby and the Lady Penitentiary, so that everyone thinks for a long time before every answer.
2. **The laughter that stops.** Three set pieces in a row end on the same move: a crowd laughs, then stops (the Row
   watching the burgesses walk, the nave at the adjourned Consistory, the butcher). The turn is good once.
3. **Calling voices in one cadence.** The five scholar/bard/thief/cleric voices each run: gesture, quoted
   deduction, "A pause.", dry kicker. The Fat Lamb voice and the final leaf both used the image of a missing stair.
4. **Author's gloss as a closing aphorism**: Matthias Dent's candle-stub speech was already complete and then ended on
   "Merit is what's left when the wax is gone."
5. **Cross-adventure echoes**: the wolves round the deadfall used the exact "wet finger ... rank, like a wet dog in
   a hot room" sentence from Liberty of the Ice; Ploughwright had Harker's "quarter-inch of his bow".
6. **Flat places**: the Row ditch at night, the Stand empty.
7. A **typographical slip** (`fate_lantern`: "north tower The lodge") and a dangling flat closer ("It is going to be a
   long winter at Carth.") after the best last image in the endings.

## Before and after

1. Wolves round the deadfall (`act`, `round_deadfall`).
   - Before: "You wet a finger and hold it up, and go off the woodmen's path ... with the wind coming at you off the wolves, rank, like a wet dog in a hot room."
   - After: "You go off the woodmen's path onto the bank of the beck ... and keep the wind on your cheek so that it carries your smell away from them and not to them; theirs comes down on you, rank and warm."
2. The bard at the Fat Lamb (`voice_lamb`).
   - Before: "'Every song in this room has had the same verse taken out of it ... It is like a stair that is not there: everyone puts a foot down for it and takes a half-step.' A smile that does not stay."
   - After: "'Listen to the fiddler. Eight bars into every tune he takes a breath, and the drum takes it with him, and not one of these people has noticed that all four tunes stopped at the same place.' {?m} taps the table at the gap, once, and the man across the table taps it too, looking puzzled."
3. The Row watches the burgesses (`row_struck_told`).
   - Before: "Nobody laughs at first. Then a child does, and then everybody does, and then, quite soon, nobody does again."
   - After: "The Row watches from its doorsteps with its feet in its bowls. Somebody begins to count the burgesses aloud, and gets to forty before the counting stops being funny."
4. The adjourned Consistory (`trial_struck_told`).
   - Before: "The Row, in the nave, begins to laugh, and then, because it is Ash Day, stops."
   - After: "In the nave the Row, which has been on its feet since six, sits down on the flagstones where it stands."
5. The first leaf read aloud (`leaf_known`).
   - Before: "...the sound of it in the long room, with forty books standing in the quiet, is like a step on a stair someone had forgotten was there."
   - After: "In the long room a pen is put down, and then another, and a young clerk at the back lays both hands flat on his desk and leaves them there."
6. Matthias Dent (`dent_inch`).
   - Before: "...He sets the dish down gently. 'Merit is what's left when the wax is gone,' says Matthias Dent."
   - After: "He sets the dish down gently, and wipes the knife again, though it is clean." (test changed: now asserts "lawfullest thing in the Fat Lamb")
7. The Row ditch at night (`ditch_night`).
   - Before: "The Row ditch at night, frozen, empty, and very quiet."
   - After: "...frozen, the slide worn black down the middle by a day of children, and at the far end one boot, forgotten, standing upright."
8. The Ash-reeve and the wet hearth (`reeve_kept_wet`, `morning_wet`).
   - Before: "For a long time he says nothing at all; you can hear him thinking, which is a sound like a man very slowly turning over a stone." / Will: "'Kept,' he says, as if trying the word for weight" (the same simile twice, in two scenes).
   - After: "He says nothing; you can hear him thinking, a sound like a stone being turned over in a field." / Will says "Kept" and then "says it again, to see whether it will hold". (The relit morning keeps its original line; a test asserts it.)

## Patterns fixed, with counts

- Passages rewritten: **35** (about 7 percent of the roughly 500 lines read; see "What is still weak").
- "for a long time" / "a long time": 19 to 5 and 33 to 11. "to nobody": 7 to 3. "laugh then stop" closers: 3 to 1.
- Duplicate images removed: the missing stair (2 to 1), the wet-dog wolves, the quarter-inch bow, "as if trying the word
  for weight" (2 to 1).
- Tests updated: `winter-in-carth-callings.test.ts` (Dent line; the Fat Lamb voice), `winter-in-carth.test.ts`
  (cleric ending no longer closes on "a long winter at Carth").

## Distinct speaking habits (kept; where I touched them, I left them alone)

Hern: proxy's trade slang, "I was the best there was", the dangerous-person refrain. Raistrick: exact, neat,
procedural ("Kept."). Annis Scaife: flat, list-like, no adjectives. Joan Pickersgill: figs and hurried digressions.
Grizel Dinsdale: volume and arithmetic. Doctor Ploughwright: "irrefragable"; Doctor Quist: contrary and delighted.
Bess Ackroyd: kneeling "on the mind". Canon Laverock: "gently".

## What is still weak

- The four `hern_stands_*` speeches and the six `gaol_live_*`/`window_live_*` pairs share long identical
  paragraphs around one swapped sentence. Mechanically sound; as prose it is read in full four times on a replay.
  A structural fix: split the speech into a shared opening and one variant `Says` for the swapped clause.
- Many "fate" closers still end on a dry reversal ("which in Gaunt is the same as owning a cow"). They are good
  individually; as a set they are the book's version of the quoted dry closer. Cutting a third would help.
- The calling voices are present at Heb, the plinth, the byre, the deadfall and the Lamb, but only one hears them on
  Fastens' Eve at watch 360 and the shipped party is a lone bard. See review item 1.
- "Nobody laughs", "nobody speaks", "says nothing at all" (about 20 uses). I changed the three loudest; the rest are
  each doing a job, but the total is high.
