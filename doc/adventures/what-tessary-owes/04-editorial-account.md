# What Tessary Owes — editorial account

*What changed between the first conception and the finished work, and why. The first two stages are recorded in
full in [01-treatment.md](01-treatment.md) and [02-critique.md](02-critique.md); this account summarises them and
continues through implementation, play and the final revision.*

## 1. Choosing the premise

Five kernels were sketched before any was chosen: a city that taxes its dead; a city on the back of a moving
mountain; returning legions who cannot stop hearing a binding hymn (*The Long Step*); a debt collector's apprentice
following a chain of obligation down to the oldest debt in the world (*The Lost Ledger*); and a merge of the last two.
The hymn was rejected because its antagonist was a thesis (Plato in a robe) and its play would have been listening;
the ledger because it was allegory without bodies. Merged, each answered the other's weakness: the soldiers gave the
debt faces and a deadline; the debt gave the homecoming a mechanism and a villain who was not an idea.

## 2. The first critique, and what it changed

| Weakness found in the first treatment | Decision |
|---|---|
| The political act was a vote, and a vote is a spreadsheet; worse, a passed vote made the last act unnecessary | The promise is kept only when the deeds reach every hand, the held soldiers' included. A carried vote reveals a worse difficulty, and the Holding follows from the vote by cause |
| Every revelation enlarged; none overturned | The Comptroller drew the note to fail, to fill a hole he made eleven hundred years ago. The creditor became a second strategic power, first met as an ally against the Factor |
| The ending list was a menu; the "Commons" had no mechanism | Endings must be prepared by earlier acts and leave different worlds. The Commons became the Release, which rests on the Scruples' second law: a promise is discharged when its promisee holds the promisor quit |
| The Assessor's arc was "the alien learns to feel" | The Assessor changes for reasons of their own kind: a legal and moral contradiction they can prove. Their turn is a filing |
| The antagonist was a stock merchant villain, nearly given a dead son | No dead son. She is right about the council, frank about her ambition, and the protagonist's first employer |
| Durrance was a type | She believes in the oath, not the city, and events can test the belief in four directions |
| Cosmology as postcard | The vision stays, but the ledger's unevenness has a consequence in Tessary: other stars in the sea, and once, something up the Throat |
| Bank goblins; Ariosto's moon; Portia's quibble | The Scruples are human-descended clerks who own nothing; the Holding keeps pledged, not lost, things; the oath's literal words are one lever among several, never the solution |

## 3. Changes made in building it

**Names.** On reading the existing adventures (only after the design was finished) I found that the previous
independent author had used a dozen of my names: Coyle, Rook, Brack, the Sallows, Fenn(imore), Pell, Harrow, Hal, Ness,
Dace, the Lamplighter, the Registry. The cast was renamed throughout before a line of Kyr was written: Brack became
**Factor Sault**, Rook **Sergeant Durrance**, Fenn **Treasurer Quire**, the Coyles **the Teazles**, the Sallows **the
Withies**, the Kept **the Scruples** (a unit of weight and a moral exactness), the Registrar **the Notary**, Harrow
**Hethra**, the lamplighters **the ebb-runners**. Tessary's surnames came to follow its trade: Quire, Pounce, Deckle.

**The Assessor gave everything away in half an hour.** The first build let the Assessor answer every question it was
asked: the collateral, the terms, the weight, the next page, all in one conversation on the first morning. It was
accurate to their nature and ruinous to the mystery. They now decline a debtor's affairs to a third party, confirm
only what the protagonist already has evidence for ("You have seen the Treasurer's list; I may confirm what he has
let you see"), and point onward with exactness rather than answering ("a scrivener keeps his drafts; I say so as an
observation about scriveners"). The chain of revelation now runs through the notice, the calling, the Treasurer's list,
the scrivener's draft and the drowned court, and can be walked in several orders.

**The drum.** Durrance's eighth night was designed with three ways to keep her back; a fourth came in the building,
and is the best: the calling speaks to what an oath was sworn by, so the stand-down beaten on the Third Company's
muffled drum breaks the step of every soldier who hears it. Hannelore tells you not to touch the drum; the Assessor,
standing under it, notes that a cloth does not stop the calling and that they "would not be surprised if it answered
to the drum in other ways. I make no recommendation." It is the adventure's one true puzzle of attention, and it costs:
whoever is kept back, another goes, and the boots on the steps the next morning belong to a drummer of nineteen.

**The world was announced, not inhabited.** The first full runs told the protagonist Tessary's news wherever they
were, including twelve days under the sea. News now reaches the protagonist only in the city, and a company that comes
up from below finds the changes waiting: Durrance's boots on the bar, the Exchequer shut with a black ribbon round the
bottle, glass in the gutters of the Terraces, Marrable in bandages, the Speaker's notice on the Landgate board.

**The Weights.** Bailiffs of bronze were first written as a fight; a companion cleric dismantled two of them. That was
the wrong instrument. The Weights now seize the forsworn the way the tide seizes the stubborn: they carry the company up
the Long Stair and the black wall does not open to it again. It is the hardest consequence in the adventure, and it
follows only from a lie told on a floor that announced it would hold what was said.

**The letter.** The Factor's letter was first her property; carrying it made her object and turn hostile, which
closed every conversation with her and made the compromise ending unreachable. Now she sees it in your hand, says
nothing, and goes on about the price of peat.

**The goose.** Haverick's goose was a joke on the bill-board; in building Lowtide it became the means of the
adventure's one piece of stealth: knock the peg out of the crate and the whole quay chases a goose while you pick the
ebb-runners' lockbox. Brought home, she is a vote on the Board.

**Growth.** A long adventure of finding out and persuading gave a first-level protagonist almost no experience,
because Kyr awarded it only for fights and for a module's single goal. The `Milestone` construct was added to the
engine for this (see [friction.md](friction.md)).

**An ending in a world that goes on.** Kyr's `Ending` stopped the whole game, which would have ended a player's
generated world. A country installed beyond a march now closes its own chapter, and an aftermath was written so that
Tessary, afterwards, shows what became of it.

## 4. The final editorial pass

Read as a player, in the page's own telling (`playtest/`), the work had these faults, each revised:

- **Places repeated in full on every return.** The thirteen places a player returns to most now have a short form
  for returns; what changed is told, not the whole again.
- **The Release's great scene could be missed.** A player who reached the Yard before the crowd and waited never saw
  it come. It now comes, told as it happens; and when Fisk has turned, the Factor's lightermen are seen turned back at
  the gate, so her move on the Feast night is present even when it fails.
- **The Assembly convened silently** round a player waiting in the nave. Its arrival is told.
- **News printed twice**, once as a journal line and once as narration. News that nothing else reads now latches on a
  plain relation.
- **The Assessor's leave-taking line** ("I am on page nine") was absurd when they left to prepare an indictment.
- **No repose.** The design promised quiet; the build had flattened it. Added: supper with the Teazles (Nan does not
  ask you to stay; she puts a third bowl on the table), dawn at the Oath Stone with Durrance, and in the Holding a
  stoppered jar in which a woman of the Withies, who pledged her voice against her sweetheart's return and never came
  for it, is still singing the ballad the Copyist under the sea has read two hundred and eleven times.
- **The notice read as a summary.** It is now in Nan's own hand: NOT A BODY. WHERE HE WENT.

## 5. Cut, and why

- **The Commons** (veterans swearing a new oath to each other): no mechanism that respected the Balance's own logic.
  Replaced by the Release.
- **The pledge as an ending**: kept as a personal act inside any ending (one name, one person redeemed).
- **Lucan Sault**, the doubting heir; **Councillors Orme, Greaves, Vantage, Lisle and Dauntry** as speaking parts (they
  are present in the Board's session, and counted); **the Settlement Fields upriver** (told in the endings, not
  visited). Each would have added a place or a voice without adding a decision.
- **A second wager-goose subplot.** One goose is comedy; two would be a theme.
