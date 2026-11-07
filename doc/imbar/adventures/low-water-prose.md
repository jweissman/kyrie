# Low Water: prose quality pass

Editor's note on the pass over `data/adventures/low-water/` (campaign `low-water`). Ids, mechanics, conditions and
asserted strings are untouched. Method: read the openings, Isaura's companion track, Halm, the Sounding, the Hearing and
all the endings in full; the rest by search (`voice repeats`, tic greps, every Observe under 330 characters).

## What I found

The adventure is stronger than its reputation: the Observes are specific (the fountain that no longer trembles, the
frost in a ring on the lip), the cast is distinct (Isaura's "Noted", Orr's bad chords on purpose, Halm's dashes and
apologies, Dov's volume, Piet's lock-book capitals, Mag's blue hands), and the Hearing is a real set piece. The faults
were three:

1. **Theme spoken aloud by the wrong mouths.** Isaura and Halm each took a turn explaining the ledger, the census and
   the deposit; the same idea (a ledger is kept for someone to settle) arrived four times from three speakers.
2. **The deep past told at length.** Halm told the Varakiiri, the nine jewels, the Arbiters and the Virina in three
   consecutive speeches (wheels, library, lintel).
3. **Beat-padding.** "A pause." / "A long pause." (25), "for a long time" (20), one closing "Noted" or aphorism per
   speech, and the same last-page letter pasted into three endings.

## Before / after

| Where | Before | After |
|---|---|---|
| `halm.kyr` lintel | "'A census. They built a census of the souls of the world and left it running under a pond.'" | "'What is bound.' He tries it three other ways, and puts each down. 'Body. Breath. The binding.' He laughs, helplessly, and stops. 'Somebody left a census running under a pond.'" |
| `wheels.kyr` Halm at the grille | "'Nine jewels the Varakiiri lost when they were driven out, the Kiritarun, their hearts in them...' ... 'I think whoever's heart that is has been waiting for it to be finished, so that it can be given back.'" | "'There is an old tale about nine jewels.' He starts to tell it, and does not. 'Owed, the dial says. And over the door: what is counted is given.' ... 'Assessor, I don't think anybody has ever read it to the end. I think it is waiting to be.'" (the tale is withheld) |
| `library.kyr` Lector's stones | Halm glosses the Arbiters and the Virina, the Mere standing up in the shapes of the dead, and Aun "died singing it". | Halm reads two lines, will not say the last aloud, and says only that the Aeneans "cut that in stone and I do not think they ever knew what it cost her." |
| `isaura.kyr` the machine is a ledger | "...A ledger is an instrument of settlement. You keep one because somebody, some day, is going to come and settle the account.' She closes the book very gently. 'Who? Settle what?'" | "'You keep a ledger for somebody to come and settle it. Who?'" |
| `wheels.kyr` Isaura on the deposit | "'Those are the only two reasons to keep a ledger that long. To pay, or to put off paying.'" | "'To hand it back. Or to be able to say it was not yet due.'" |
| `isaura.kyr` | "A pause exactly long enough." / "A pause." before four of her confessions | replaced by something her hands do: "She turns the ell-rod over twice"; the pause simply cut elsewhere |
| `endings.kyr` `census_ended` | the Mere has "gone down six spans in one breath and stayed down"; then the letter says it "went through the bottom of the Bowl last night. Not falling. Going." (copied from the other ending, and contradicting it) | "The Mere has not moved since you left. I measure it every morning. I do not know what I am waiting for. I. V." |
| `endings.kyr` Isaura's last line | "Isaura Vant has entered it in the tally as ..." closes six endings | kept for four; two reshaped ("has had to rule a new column for it"; "leaves the line to dry") |

## Patterns fixed (counts, this adventure)

- "for a long time / a long while / a long moment": 39 to 30 (seven replaced by an action, the rest left where the
  length is the point, e.g. the Reckoner's pauses).
- "A pause." and "A beat." tags: 25 to 19.
- Exposition trimmed in six speeches (Halm x4, Isaura x4 passages), roughly 40 percent of their words cut.
- Duplicate ending letter: one of three copies rewritten.
- Image repeats: "the way you would ..." x2, "a thing that counts", "to nobody" x1, a mid-scene "Hymn, at seven" opener that
  appeared in five consecutive Hymn lines (two re-opened).
- Short "again" Observes made specific (Full Measure taproom, the planks on the mud).

About 35 passages changed. That is well short of the 20 to 25 percent asked for: the adventure runs to roughly 430
speeches and results, I read perhaps half closely, and most of what I read was not weak enough to be worth changing.

## Still weak

- The Hearing is long and its five verdict blocks open identically ("The Council accepts the Finding...").
  Deliberate formula, but a reader who plays two endings will notice.
- Halm is "delighted" at the top of most of his speeches (three uses of the word, many more of the posture); he is
  one note, and the note is stated rather than shown.
- The Reckoner's own speeches (citadel) lean on "A pause." as its voice. I left them: it is the one speaker for whom
  the beat is a characteristic.
- Many speeches still end on a short dry quoted line (about 210 of roughly 430 speeches and results, by a rough grep). I cut the glossing
  ones; the rest are mostly in character (Isaura's "Noted" is her habit, not the author's).

## What a structural fix would need

The deep past is carried by Halm in conversation. A scene where the player *reads* it (the Lector's stones, the arch's
table) and the explanation is left to inference would let Halm stay a person rather than a glossary. That means
re-pointing three `teaches`/`Discovery` texts that currently quote his gloss, which was outside this pass.

## Tests

Lint: 0 errors. No test assertion referenced a changed string (checked by comparing every string literal in the adventure's test files against the pre-edit source). Run, all passing: the main file, `-placed`/`-company`/`-wander`/`-revised`/`-beyond` where they exist. Not run here (CI): `-browser` and `low-water-replay`.
