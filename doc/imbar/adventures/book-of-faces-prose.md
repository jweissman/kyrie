# The Book of Faces: prose quality pass

Scope: `data/adventures/book-of-faces/*.kyr` (about 960 KB of prose in the `kyrie prose` dump, 2,325 entries). Read in full: openings, the Gate/Hospice, Maskers' Lane and the thief route, Counting Row, the Collegium, the Drip and Row talk, Warrior and Hill samples, all endings and the "act tells" block; the later class files (Hill, Cleric, Monk, Ranger, Post, Bard) by tic-scan and sampling, not line by line. 76 edits in 23 files. No ids, conditions, mechanics or asserted strings were changed (every replaced sentence was grepped against `test/`; none appears there). `bin/kyrie lint`: 0 errors, same 3 warnings as before.

## What I found

The adventure is the best-written of the revised set. Scenes have a face and a place, the set pieces (Peck's name said kindly, Dov's mask that fits nobody, Lacke's clocks, the Standard Pound) have real stakes and turns, and most speakers already have a habit: Thole repeats ("Perfect. Perfect."), Lacke says "rather" and winds a clock, Slee weighs everything, Maule is jovial and blunt, Dov uses contractions and breaks off, Tibb counts columns and knots. The weakness is not boredom but **sameness of finish**: nearly every beat ends on a calm, wry, summarising sentence, and the narrator keeps explaining what the player has just seen.

Patterns, with counts of what I fixed (approximate; total in the files is higher):

| Pattern | Found | Fixed |
|---|---|---|
| "looks at you / it / him for a long time / moment" as the weighing beat | 46 "for a long time/moment", about 30 of them this beat | 27 replaced by a concrete act (tightens a knot, squares forms, turns a knife) |
| Narrator verdict after the beat ("You find you have understood what the Hospice is for", "There is nothing to be glad of in what you have done", "It is the first time you have heard him sound like...") | 14 | 14 cut or turned into an object |
| "a thing that / which" as filler noun (48 in the files) | 48 | 11 |
| "as one X..." / "as a man X" simile closers (about 255 "like a", 139 "as if") | many | 12 removed; the rest are the register and I left them |
| "congregation" image family (pegs, long-cases, masks, even the Warden's pun) | 6 | 3 replaced; the pun stays |
| Same joke twice ("The Watch will be rather less interested in you by Thursday", both of Lacke's buyers) | 2 | 1 cut |
| Aphorism closers ("It keeps better than a name", "the same fear, from the other end") | 6 | 4 cut |
| Exposition where a person should act (Bursar on the colleges, Reeve on the Guild, Ansel on the Hearing, Lamb on the two lovers) | 4 | 4 trimmed or turned to a gesture |
| Duplicate beats (two Peck casts with the same simile and sentence) | 2 | 1 reworked |

## Eight before and after pairs

1. `maskers.kyr`, the drying-loft at night.
   - Before: "...the masks hanging from the lines in their thousands, turning very slightly in the draught, like a congregation that has been told to keep still."
   - After: "...turning very slightly in the draught. Those nearest the lamp have dried to the colour of tea; the far ones are still the white of a boiled egg."

2. `gate.kyr`, Peck's confession.
   - Before: "...the three seconds, in the gallery, in which he might have spoken and did not. You hear it as you were taught to hear, without pity or surprise. ... is lighter by something he does not name."
   - After: "...He counts them aloud: one, two, three. 'And I did not.' ... At the words of release he stays down so long that the lay-brother coughs; when he gets up he has left the stick on the floor, and has to be handed it."

3. `gate.kyr`, sitting up with Peck.
   - Before: "Nobody in thirty-one years has stayed in a room with him for no reason. You find you have understood what the Hospice is for."
   - After: "Nobody in thirty-one years has stayed in a room with him for no reason." (The reader supplies the rest.)

4. `registry.kyr`, Brother Alder lets the Fitted face in.
   - Before: "It is quite untrue that nobody notices a person being let in; but it is true that nobody will ever say so."
   - After: "Two lay-brothers by the font find the roof extremely interesting."

5. `thief.kyr`, casts hung back on the rack.
   - Before: "That is the particular quality of a thing that has been stolen and put back: it looks as if nothing has been done to it."
   - After: "They look exactly as they did. Only the straw is flattened on one side, where a hand held them."

6. `gate.kyr`, the first attempt to greet a ferryman.
   - Before: "Nothing has been done to you. Nobody has been anything but kind."
   - After: "Nothing has been done to you. A woman with a basket steps round you, saying 'Mind' to the air at your elbow, and does not look to see whether it minded. Nobody has been anything but kind." (the closing line "It is a very thorough way of being nobody" is asserted by `ombra-gate.test.ts:38`, so it stays.)

7. `counting.kyr`, Cob on the market's beam (given a speaking habit: dropped articles, "mind", "year" for years).
   - Before: "'The Hall's own. My father hung it, and his father fetched it, in a barrow... Forty years I have weighed the Drip's bread by this...' He believes it. That is the shape of the thing: he believes it, entirely, and has never once had a reason..."
   - After: "'Hall's own. Dad hung it, and his dad fetched it off the Row in a barrow... Forty year I've weighed the Drip's bread by this. Not a loaf gone out under, mind.' He believes it. He has never had a reason to put anything else on the other pan."

8. `gate.kyr`, Father Ansel on the Hearing (given a habit: asks the question, then answers it, in short turns).
   - Before: "'It is for saying a thing in front of those it concerns... So the Concord, who are not fools, kept one room... It also, I will admit, makes it nearly impossible to call.'"
   - After: "'What is it for? For saying a thing in front of those it concerns.' ... 'Is that a safeguard or a lock? I have asked myself for twenty years.' He lowers the hand. 'Both, I think.'"

Others worth reading in the diff: the "looks at you for a long time" beats (Nell turning her knife over; Dunnage squaring a stack of forms that is already square; the Bursar's "face does three things in a row, the last of which is delight"); the Qualified and Interregnum endings now end on a person (a ferryman asking a Watch domino the time, and being told) instead of a verdict; the Candid's room and the Wall of Faces lost their "it is frightening because it is not" and "it is like being cold".

## Speaking habits sharpened (seven)

- Sergeant Vail: no contractions, reports in short counted clauses, ends a statement "Noted."
- Father Ansel: asks the question, answers it, holds up a finger for each point.
- Cob: article dropped, "Dad", "forty year", "mind".
- Madame Pavane: short, weighs words as she weighs masks, no aphorism ("I wore it so long I forgot there was weather.").
- Bursar Gaunt: explains the Collegium as a recited list, then adds one private fact she is not supposed to ("I have never seen it").
- Dov Ashe: contractions, broken sentences (his Collegium line now matches his rooftop speech).
- Absalom Peck: florid and courteous; the aphorism is taken out of his apology so the courtesy carries it ("Of an old man in a blanket.").

## What is still weak

- The dry closing line is still the house finish. Of about 600 speeches I rewrote perhaps 40 closers; the proportion ending on a quoted wry or aphoristic sentence is probably above half still (Tibb, Pavane, Lacke, Fenn, Cosimo all close this way). Each is individually good; as a set they are one voice with different hats.
- The "Of X:" epilogue block (about 60 entries) all end on a small ironic image. Pleasant, but it reads as a list of fortune-cookies. I changed three; the rest need a second pass to vary length and mood (one flat factual line, one unresolved).
- Two forms of "for the first time" (65), "forty years" (65 occurrences, many unrelated: Cob, Pavane, Slee, the cooperage, the Hall) and "to nobody / to the ledger / to the stove" (70). I reduced them only where I was editing the sentence anyway.
- Hill, Warrior, Monk, Ranger and the Bard route were sampled, not read line by line. The warrior's Stair speeches carry the longest lectures (Reeve, Sturry) and I expect more of the Bursar-style exposition there.
- Many `_again` topic entries re-use their long text word for word. That is correct mechanically (the player asked twice) but the second reading is as long as the first.

## What a structural fix would need

1. **A shorter variant on repeat asks.** Every `_again` topic shows the same 80-120 words. A rule that selects a one-line "she says it again, more slowly" Says for repeated topics (or a `Once`/`Again` pair in the topic grammar) would remove several hundred words of verbatim repetition from a normal play and make the second asking mean something.
2. **A speaker voice field checked by lint.** The sameness of closers is a population problem: no single line is wrong. A lint advice that counts, per person, the proportion of Says ending on a quoted sentence of fewer than ten words, or that flags a speech sharing its final five words with another person's, would let authors see it. It is the thing a reader notices after an hour and no editor can see line by line.
3. **Epilogue entries as data with a mood tag** (flat, wry, grave, unresolved) so the news block can be assembled so that no more than two adjacent items share a mood. At present they are free-standing `says` rules fired in whatever order the hour reaches them.
4. **Scene text conditions instead of prose joins.** A few Observes (Hospice hall, Annex) carry three "like a crowd that has looked away" images in different rooms because each room was written alone. A reviewed list of image families per adventure (crowd, congregation, coat on a bench) kept next to the ledger would let the next pass count rather than guess.
