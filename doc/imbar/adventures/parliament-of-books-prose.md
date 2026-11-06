# The Parliament of Books: prose quality pass

Editor's pass against `doc/imbar/14-bible.md` and `16-critical-review.md` section 4. Read: the seen, rules, endings
dump entire; the talk and acts dump in full for the first two acts, by sample after that (this is the largest of the
three, about 300 KB of prose); `voice repeats`. Lens: boredom and interest.

## What I found

An inventive, cheerful adventure with the widest cast of the three (every book that wakes is a voice). The faults are
the other side of that:

1. **"A pause." as the speaking-book's only stage direction.** 37 "A pause.", 9 "Another pause.", 3 "A long pause."
   Nearly all follow a talking almanack, Housebook, Treatise, Primer or Roll. Since every book talks, every book
   pauses in the same words.
2. **"A long time" as everyone's reaction** (22 "for a long time", 20 more "a long time"), in speeches by Quarles,
   Rhule, Mott, Orme and Jonquil.
3. **Calling voices in one cadence and one stance**: the ten `voice_*` lines are all "{?m} does X, 'deduction,'
   {?m} says, 'Somebody did Y.'" Three of them end "Somebody (laid / trimmed / taught) ...". Every companion
   is wise.
4. **A stray `''`** at the end of `voice_lamp` (an empty quotation left over from a cut).
5. **Author-gloss summaries**: `sewing_understood` ("The Sewing is not a binding. It is a sending.") and
   `kindling_understood` ("is not a custom. It is a rite") tell the player what to conclude after the player has found it.
6. **Flat description** at the bridge's north end, the quay at night and the millrace at night: lists of nouns.

## Before and after

1. The almanack (`almanack.kyr`, nine instances).
   - Before: "'...a stranger from the south bringing news.' A pause. 'That's you, I expect.'" / "A pause. 'There. Now you know, and I've told.'"
   - After: "It rustles on its nail. 'That's you, I expect.'" / "It lowers its voice, which on a nail means turning its face to the wall." / "The paper shivers down its whole length. 'There. Now you know, and I've told.'" (every pause is now something a paper object on a nail can do)
2. The Housebook and the kettle (`members.kyr`).
   - Before: "'He says I don't have to,' says the Housebook. 'He says he'd like me to.' A long pause. 'He says his mother's hand is the last thing he wants to see.'"
   - After: "...The kettle ticks as it cools. 'He says his mother's hand is the last thing he wants to see.'" and "'And kept them.' The kettle stops singing."
3. The lamp (`voices.kyr`, `voice_lamp`).
   - Before: "'... It is a duty. Somebody has trimmed that wick every night of nine hundred years, and the last of them did not know why.' {?m} crosses the nave, slowly, as if not to wake anything. ''"
   - After: "'Nine hundred years and it has never once gone out. That is not a miracle. Look at the wick: it was trimmed this morning, square, with a good knife. It is a duty.' {?m} crosses the nave, slowly, and finds the verger's boy asleep in the last pew with the trimming-scissors in his fist." (a fact the player can check, and a small joke)
4. The tide verse (`voice_tides`).
   - Before: "...Somebody taught this book to count in verse.' {?m} turns the cup in its ring. 'Somebody taught the city, a long time ago, and the city forgot the tune.'"
   - After: "...Somebody taught this book to count in verse.' {?m} turns the cup in its ring. 'I should like to hear the tune.'" (test line kept)
5. The black stones (`voice_flats`).
   - Before: "'Somebody laid those with a measuring-rod and an idea of where they were going. The mud has been moving over them for a thousand years and they are exactly where they were put.'"
   - After: "'They were laid by somebody with a measuring-rod and an appointment. They have been under the mud a thousand years and they are exactly where they were put.'"
6. Colophon glosses (`colophon.kyr`).
   - Before: "The Sewing is not a binding. It is a sending." / "And so the Kindling is not a custom. It is a rite, the city's half of a bargain..."
   - After: "Sewing does not bind a book. It sends it." / "So the Kindling is the city's half of a bargain, kept for nine hundred years by people who had forgotten the other half..."
7. North end of the bridge (`bridge_north_scene`).
   - Before: "Stalls of almanacks and ballads and prints; a toll-house with a window like a ticket-office; and the river stair..."
   - After: "...the stalls change their wares as you walk: pies give way to almanacks, almanacks to ballads, ballads to prints of the Lord Mayor looking nobler than he is. The toll-house has a window like a ticket-office and a clerk behind it who has stopped looking up."
8. The quay and the race at night.
   - Before: "At night the quay is lamplit and much quieter. The tide talks against the steps." / "The millrace at night, black water, and the two mills dark on either side of it."
   - After: "...a third as loud. The eel-boats knock together in the dark like men talking in their sleep ... the Lamb's is the only window on the front still lit, with a cat in it." / "...and a smell of pipe-tobacco that belongs to neither." (a plant for Coddy Fitch at the sluice)

## Patterns fixed, with counts

- Passages rewritten: **58** (about 7 percent of the roughly 850 lines; most are one-clause changes).
- "A pause." and variants: 49 to 13 (the 13 left are mostly the Roll, Quillon and the floor of the Parliament, who are
  allowed to be formal). "for a long time": 22 to 13 and "a long time"
  42 to 25.
- Stray `''` removed from `voice_lamp`; two author-gloss lines trimmed; "Four thousand" shared by two crowd voices
  separated.
- No test needed changing. Asserted strings kept: "Somebody taught this book to count in verse", "It is a relay",
  "straight as a rule".

## Distinct speaking habits (present; kept)

Bet Kettering: blunt market cries ("A dab. A nice eel."). Warden Mott: Sewn / unsewn, carpenter's terms, shouts and
means it not. Ambrose Doble: print runs and figures. Absalom Crake: "my dear", almonds, plausible deniability. Hester
Rhule: clipped legal clauses and a dry "I have been burning litigants." Ottoline Quarles: reading by ear, "a voice like
a pen". Mattea Lusk and Orrin Day: a marriage quarrel in two registers (the long Greek word against the plain one).

## What is still weak

- The Commonplace and the Fore-edge (the country of the books) are rich in place-description but its speakers (the
  Catalogue, the Roll, the Housebook, the Speaker) share a formal cadence: "The chair reminds..." "The floor says..."
  Only the Canto (cheerful, in pencil) and the Housebook (domestic) break it. A structural fix is a rule that the
  floor speaks only in the order paper, and the members speak in their own registers.
- The ten calling voices still each deliver a single deduction. Two should be questions or mistakes, and one
  companion should be wrong (the review's "every companion is wise").
- The `_again` topic repeats (about 130) say the same paragraph twice.
- Nine of eleven endings are single paragraphs of equal weight. The two with an image (`ashen`, `unsewn`) stand out
  because the rest summarise. `by_leave` is a placeholder in comparison.
- I did not read the long middle of the acts (Ash, Fore-edge, Housebook rooms) line by line; the talk dump alone is
  about 160 KB. Another pass would likely find another 20 flat passages there.
