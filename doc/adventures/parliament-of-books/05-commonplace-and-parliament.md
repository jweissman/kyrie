# The Commonplace, the two ways in, and the Parliament of the Bound

## The Commonplace

Where Calamy's Sewn books go when they sleep. Its light is attention: every beam coming down from very high up is
someone in Calamy, now, reading; a book nobody reads stands in no beam and fades (the **Foxing**). Its roads are
grammar. Its people are books in the shapes their readers gave them (a house, an old woman of leaves, a wooden
paddle, a grimoire as big as a door) and the **Unwritten**: books nobody wrote, natives of the place, drawn in pencil
and breaking off at the waist. It has no sky and no hour of its own (the module marks it `elsewhere`); it keeps
Calamy's clock because it is read by Calamy's clock.

What is there, and why one would go (see [03-map.md](03-map.md) for the shape): the **Reading Room** and the
Catalogue, with its procedure and its Errata; the **Remainder Market**, where everything is priced in readings and
the Unwritten haggle for bodies; the **Draft-Fields** and the Second Canto; the **Fore-edge**, white country where
marginalia go about in columns like ants, the Scholiasts in their wood of glosses, and Corday's Grammar of the Sword
sulking at the edge; the **Annery Housebook**, a house one walks into (and whose cellar of reckonings it does not
forgive anyone for reading); **Mother Orme's garden** of burnt beds; the **Foxing**, brown and soft as an old map,
full of half-sunk books trying to remember their last sentences, and Dame Tibbet's Primer; the **Wellhead**, a spring
of ink where the first words ever written in Calamy turn over in the basin; the **Tower of Oddny Vask**, with the
Black Letters at its foot and the Lexicon chained at its top; and the **Chamber**, whose floor is the Great Roll.

## The two ways in, and why they differ

| | The Archivist's reading | Crake's back stacks |
|---|---|---|
| **What it takes** | Two pieces of the Colophon found in the city (the rhyme, the Ninth Plea, the variant, the Canon…) so Ottoline Quarles will teach the Inward; the Chained Room's key (the roof, the cheese, or Rhule's warrant); Calam-ink (reed-heart cut at dead low water, Widow Gallon's pot); the Ambery Codex opened (for one who has read aloud to someone who could not read) | Corvell's empty library; Wat the lamplighter; the truth told to Sir Gideon *or* not; Crake's trust (or his lock picked at night, or a threat), and his place-ribbon carried |
| **How long** | The better part of three days of the city's business; the reading itself takes four hours (Grave: it cannot be undone) | Possible on the first day |
| **Where you arrive** | The Reading Room, **entered**: a shelfmark; standing in the Parliament by right | The Remainder Market, **unentered**: no standing; the Errata hunt the uncatalogued (unless Crake is with you) |
| **What it gives** | Standing; the Catalogue's goodwill; the Founders' door home (to the Chained Room) | Crake himself (a companion with a door to keep); the Unwritten's goodwill; the Market's trade; the door licence as a live question |
| **What it costs** | Time; the ink's tide | Standing must be *asked for*: the Second Canto will speak for a reader Crake brings, or one who has read aloud for an hour in the Market. A thief or a bully is found by the Errata and taken to be **corrected**: entered after all, the hard way |

Both are tested end to end: `goes in by the Archivist's reading…` and `goes in by Crake's back stacks, trusted…` in
`test/parliament-of-books.test.ts`; the thief's way and the Errata in the builds test; the transcripts
`lending.md` (reading) and `recall.md` (stacks).

## The Parliament of the Bound

It sits once, on **Kindling eve** (day 9, from noon), when a reader with standing who knows where the Speaker stands
asks it to. Four **articles**, three **readings** each:

| Article | Readings |
|---|---|
| **The Sleep** | the Sewing of all, and the Quick called home (`sew_all`, the Recall) · every book sleeps or wakes by its own leave (`sew_leave`) · the Sewing undone, every book awake in its body (`sew_none`, the Unsewing) |
| **The Fire** | no burning save by the book's leave (`fire_leave`, the old Colophon) · none but by judgment of a court where it may plead (`fire_plea`) · the Censors' discretion (`fire_free`) |
| **The Reading** | the Lyceum's Rounds, every book once a generation (`read_rounds`) · any book may ask, any may refuse (`read_asked`) · no reading owed (`read_none`) |
| **The Door** | none but the Founders' (`door_shut`) · Crake's door under the Catalogue's licence (`door_licensed`) · open to any book that will go (`door_open`) |

**The arithmetic.** Six members vote; a reading carries with more than half of those seated, or on an equal division
if the clerk (the Catalogue) favours it. A reading lost may be put again when a member has come round to it. A member
who walks out, or is silenced, changes the count. **The seal**: the company asks the Speaker to seal the Colophon with
what is carried; every article not carried stands on the Speaker's motion (**the Recall**: `sew_all`, `fire_leave`,
`read_rounds`, `door_shut`). If nobody seals it, the Speaker's motion stands at the Kindling.

### The members, where each starts, and what moves them

| Member | Starts | Its contradiction | What moves it (each a thing found, brought, known, been, or with you) |
|---|---|---|---|
| **The Great Roll of Pleas** (Speaker) | Recall entire | moves to recall the Quick; its own printed child, the penny Pleas, is one of them | *to Sleep by leave*: the Court's ruling that a book may plead · the first words at the Wellhead · a court-craft protagonist moves to divide the question · the Principle of the Text (from the disputation) with the Pleas awake: *a copy altered is a child* · the Ninth Plea restored in the printed Pleas. *To the licensed door*: a merchant (or Crake) argues a licence is a toll, and a toll is a Plea |
| **The Annery Housebook** | Sew all; fire by leave; read by asking; door shut | demands the right to refuse reading; wants only to be read by Jonquil, who sold her | Jonquil's letter (→ Sleep by leave, licensed door, and she goes home to him) · the Almanack, if it *kept* the secret, tells her what it did with three thousand kitchens · the Canon's ruling on souls, or a priest. *Offended* (walks out) if her cellar of reckonings is read |
| **The Second Canto** (Unwritten) | Unsewing; by leave; by asking; open door | wants bodies; a body is a finished text, and it has spent four hundred years being unfinished | the Effusions, who want to burn *because* they are finished · one who has been held captive (margins craft) says what a body not chosen is · Crake asks it to let him keep his door (→ licensed). It also **sponsors** a reader who has no entry |
| **The Black Lexicon of Oddny Vask** | Unsewing; by leave; Rounds; open door | the only member who wants exactly what it says | *freed* (strike its chains): it votes for everything, the Housebook walks out, and Rhule can no longer become the Advocate · *a link's slack* (lockwork): its vote on one article · *bound* (rites: the words for the dead) for the session: silent, one fewer seated · the Black Letters that guard its tower are quieted by naming them, from the Catalogue's story of Vask (a way up without a fight) |
| **Dame Tibbet's Primer** | Sew all; by judgment; Rounds; licensed door | fading; would vote for the Recall tomorrow if the Recall came with readers | read aloud, A to Z (→ reading by asking) · Quarles's message · you read its copy to the bridge children · the Almanack offers it three thousand kitchens · told of the Unwritten nobody has ever read (→ open door) |
| **Mother Orme's Physick** | By leave; by leave; by asking; licensed | wants her chapters back; one of them is a poison, and Pardoe was right to cut it | told Pardoe was right about the seventeenth (healer or mender) · Rhule brought to stand before her · her fifteenth chapter cured the ague (→ the Rounds) · a soldier swears to stand between books and the mob (→ by judgment) · a traveller on toll-roads (→ open door) |
| **The Catalogue** (clerk; ties) | Recall entire | procedure | Crake's green ledger: eleven hundred and four walked in, unentered (→ licensed door) |

**Some two dozen ways to move a vote**, no member with only one, and none that is only a dice roll. Persuasion here is
almost wholly evidence and identity; the checks are in getting the evidence (a lock, a court, a tide).

### The settlements

The morning after the Kindling, the standalone campaign ends on one of these (in a generated world, the same facts
change the city and it goes on):

| Ending | When | What Calamy is like |
|---|---|---|
| **The Year of Ash** | the almanacks burned against their leave, the Index not ended, and its bargain not carried | the smoke does not go up; every night something cuts a little more out of Calamy, very cleanly |
| **The Year of Voices** | the Colophon broken (almanacks burned on the Kindling fire against their leave, but no Index to take them), or the Unsewing carried | every book awake in its body, at once |
| **The Recall** | the Recall, the door shut | the books asleep; the almanacks silent on their nails, very far off, seeing the spring |
| **The Separation** | the Recall, with a door kept | the Bound sleep; the Quick go, under licence, entered |
| **The Lending Accord** | by leave, reading by asking, the licensed door | the Housebook goes up a garret stair in a dying man's hands; Quennell's has a queue |
| **The Pleading Accord** | by leave, burning only by judgment | the Court of Pleas sits Thursdays for books; first case, a cookery book ashamed of its pastry |
| **The Open Door** | by leave, the doors open | nobody quite sure which books were written by anyone |
| **The Colophon by Leave** | by leave, otherwise | most of the Bound sleep, most of the Quick talk, some change their minds |

### The Index in the chamber

If the Ash has risen (a Thursday has burned, and the Index is neither ended nor its ranks released), then after the
Speaker opens the session the burned come up the gangway and the Index claims a seat for those who were never asked.
The Roll, bound by procedure, rules the claim **in order**: the Index sits, the order paper counts it, and it votes
for the Recall, *the Censors' discretion*, *no reading owed* and the Founders' door, which turns a 3–3 that the clerk
would have broken into a 3–4 loss. It can be answered there: the Lamp's flame carried down the gangway; the burned read
their names from Rhule's register; Rhule herself, beside the company, turning her back on it; or a soldier clearing
the gangway like a street. Answered, its seat goes to ash and it goes back to its hearth. See
[11-second-pass.md](11-second-pass.md) for the Cinderfield and every way of ending it.

### The Kindling, which decides as much as the vote

The Parliament settles the terms; the **fire** decides whether the city keeps them. At twenty hundred on day 9 the
Ashpit fills. The almanacks are **spared** if Rhule has become the Advocate, or the Canon has ruled (told what the
Kindling was), or the protagonist climbs the pile and tells Calamy what the Kindling was (a hard persuasion check; sure for one of the stage, the faith or the courts, who has held a crowd before), or the Almanack (its secret kept)
speaks for itself, or the Recall has already called it home. Otherwise three thousand awake almanacks go on the fire,
and the Colophon breaks; and unless the Index has been ended, or bought off, they go down to it. **Renewal** is
separate: one book must go into the fire *of its own leave*, and the one that asks to is Absalom Gallon's *Effusions*.

Tested: `test/parliament-of-books-outcomes.test.ts` (Recall, Separation, Pleading, Open Door, the Effusions'
renewal), `test/parliament-of-books.test.ts` (Lending, the Year of Ash), `test/parliament-of-books-ash.test.ts` (the
Cinderfield, the names, Rhule's candle, the Index burned, the Year of Voices), the arcs test (Rhule's three ends at the
fire).
