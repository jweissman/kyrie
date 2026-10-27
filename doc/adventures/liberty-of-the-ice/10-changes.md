# The record of changes: treatment → revision → implementation → final pass

## Treatment → editorial revision (Stage 1 → Stage 2)

| Treatment | Revision | Why |
|---|---|---|
| Four genres, one per district | A comedy with a romance in it; horror is the comedy at night, philosophy is the law argued | F1: a catalogue, not a work |
| An informer in the hiding network, unnamed | Cut. The leak is the company's own tongue: what it tells whom | F2: a slot filled by nobody; the survey's *fault* made systemic |
| Fifteen small adventures | Eleven, each cut against the brief's seven ingredients | F3: the ox, the Silver Skate and the pardoner were a want and a fetch |
| "Lies told to particular people" | Claims held as belief, moved by props; collisions; compounding | F4: the farce as a game, not a description |
| The law explained in four clauses | Taught by three bites in the first hour: the stairs, the purse, the crier | F6 |
| A city of marks | Every principal person has a want that is not the company's | F7 |
| Ursel's arc in a sentence | Three people who change by people: Ursel, Callow, Gosling | F9 |
| Endings listed | Two principal approaches (Front Door, Ring) and three levers (trick, law, flight) | F10 |
| Romance as a pursuit | Romance as shared history, read once, at a question that is hers to ask | F12; the atlas's warning |
| Five days | Three days and three nights | F13 |

## Revision → implementation (Stage 3 → Stage 4)

| Design | As built | Why |
|---|---|---|
| The ice as wilderness | The Fair as a settlement; the Reach a wilderness | play: camping in the middle of Freezeland Street |
| The bear-garden in Bankside | A bear-stake on the ice | Wrayford already has a bear-garden; and a bear-ward at a fair is right |
| A bridge chapel | A rope-walk house with a cellar in the starling | Wrayford and Calamy both have bridge chapels |
| The Squire's price in one payment | Half at the handshake, half at the Landing | the farce's tension: to be paid in full you must be where the hand binds |
| The Score as leaving with the money | Leaving past Harker's man at the North Bar, by stealth or a lie, or hiding in the Clink | play: the Score was otherwise a walk |
| The informer's role | `tattles`/`toldOf`/`harkerKnows`; Abel; Kemble's five coin; a lantern that sees you go out to the hulk | F2 |
| Callow's "positions" | Three answers, the third only for someone who has seen a hand shaken on a lie; his slipping is the consequence of the second | the philosophy as a game |
| The Gazette as a lever | Built in the final pass (it was referenced and never set) | Stage 6 |
| The Lisk Wife never explained | Explained (Widow Saffery) and one unexplained second light kept | Stage 6: the treatment's "merely" was lost in building |

## Implementation → final pass (Stage 5 → Stage 6)

Found by playing, then fixed (see [08-playtests.md](08-playtests.md) for how each was found):

1. Anchored events now require the company's presence where they change it (the purse lifted from the North Road).
2. The ice is a settlement; the stocks and planks are scenery.
3. Roles rewritten as noun phrases ("a preacher of the Flow, charged with unswearing").
4. Harker has 160 coin, so the coin handshake can be offered.
5. The tour of the stock returns the Squire to the wharf before it ends.
6. Belief begins at one, and is held at four.
7. Every night-time condition rewritten for days that turn at dawn.
8. Pellam's first day waits for its own watch in a world that goes on.
9. Nineteen pieces of city news split into what happens and what is heard, heard in Pellam (late, if away).
10. The Landing's cases lengthened from twenty minutes to thirty.
11. The real shepherd shouts *Hawsfold* when he comes in, so a Squire can see the collision coming.
12. Harker's man watches the North Bar from the handshake on (a blocking thing on the road, not a rule on the way).
13. The searchers take prisoners; a beaten company wakes in the bondhouse with the bar back on, and may try again.
14. A noisy breakout under the wharf is heard; a stealthy one is not; a warrior can fight it out.
15. Ursel can be won a third way (seeing her left hand), and her double-cross can be seen coming (insight).
16. Ursel's question waits for the Ice Chapel, and is foreshadowed that morning.
17. Thessaly's supper-table watching pays off: she sees through the Squire, and trades her key for the books' truth.
18. The Landing's two ways of ruling on the books: the city witnessing, or the Reeve alone when Harker's son-in-law
    will not; the text no longer has an alderman witness who would not.
19. The Gazette column built; the Squire's absence from the wedding noticed.
20. A climb down the starling, for climbers and anyone with Saffery's rope.
21. Hay Stairs charges its own nine pennies.
22. Callow's question no longer assumes you ate the ox; the cut Silver Skate is no longer mentioned.
23. Kinds and a place renamed where another adventure had them first.

What was planned and not built, and why:

- **Belief that travels by itself** between people (the survey's G3/G8): written by hand for the leak; a general
  construct should be designed, not improvised (friction 5).
- **An *Away* ending test**: the ending exists and is plain; no journey plays it.
- **The Squire's own wedding present beyond a share or cream**: a pedlar's silver pin was in the treatment; cut, since
  two presents make the point.
- **A browser journey**: the placed test walks a generated world by the session's commands; no Playwright journey was
  recorded for Pellam.

## Final pass → second pass (a second, harder reading)

Asked to read it again as literature and as dramaturgy (see [09-critique.md](09-critique.md), "The second reading"):

1. **The days as acts** (`frosts.kyr`): each morning's heading and sky (blue frost; the drowned fog; the thaw-wind);
   area observations of fog and thaw on the Fair (`within the_ice`), and room ones at the Glove Post, the Reach, the
   bridge and the ox; a bill on the Glove Post each day naming what is on.
2. **Foreshadowing**: an empty pillory with a blank placard; Callow "shall not see it go out"; Hester's bear who would
   "go to the water"; the wolves in the Book of Frosts, in Abel's fold, in Nab's taproom and in the snow.
3. **The wolves** (`wolves.kyr`): four, on the sledge road on the second night; fought, or driven with a brand, fed
   the offal, rounded downwind, faced down, or outrun; Dickon's fate if he goes alone, warned or not; Ursel and the
   cap.
4. **Paid men**: Kemble's gin (the farm in the hills found out) and his key; the searchers bribed; Fowke sat with.
5. **The Book of Frosts** (seven frosts; the Glove; the Black Lambing; the hanged Reeve) and **the Statute of Servants**
   (the verger; Gosling; the indictment nailed to Harker's door in the thaw); Harker's candle "for the weight".
6. **Swale Head**: Harker, Ursel and Tansy of one parish; Ursel's three confidences at night; her question to Harker at
   the Landing ("I remember the hands").
7. **Dickon and Tansy**: Gallowmoor's ladder and its overman; the slate of lies and the burned letters; Tansy's home,
   her cow Lady, her milking song at night on the bondhouse floor.
8. **The Landing's list**, chalked at the Reeve's elbow; Ursel watching Harker's hands.
9. **A Ring hand fetched** the same afternoon if it walks away (not from the Clink).
10. **Prose**: the six "long moment"s and most of the "long time"s replaced by something happening in the silence.
11. Three milestones (past the wolves without a fight; the Statute; Ursel's confidence): 31, 8,400 in all.
12. Seven new fixtures and tests; four new transcripts; the test router no longer walks through barred doors.
13. **The open door, found**: after the second reading, the question whether Harker held Ursel's father's note was
    left open and made findable: the Exchange's register says "J. H.", Fleece Row has two, and Ursel, told, does not
    decide. (The author was asked; the choice to keep it ambiguous but discoverable is the designer's.)
