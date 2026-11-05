# 3. Severe editorial review

*Written twice: once of the treatment before I implemented it (Stage 3), and once of what I implemented, after
playing it (Stage 6). The second pass is the one that matters, and it changed the work.*

## 3.1 Review of the treatment, before implementation

The brief's own questions, answered against my first plan.

**Are the people convincing?** The first plan had a gap the brief anticipated. I had designed *documents* (a charter,
a tally) and *rulings* (the Court, the vote). That is the corpus's oldest grammar. The people who made the documents
mean something were thin: Venn would have been a villain with a motive of a single line. **Revision made:** Venn
became a man in the Lord's widow's debt, defending a lawsuit with the hill's metal; the reeve became someone who has
been told she keeps ditches and discovers she was an auditor; the priest's grief became that she has preached a king
for twenty years. See `05-dossiers.md`.

**Does history matter in play?** The first plan's charter changed only *text*. The decisive question I asked
was: *what can the company now do that it could not?* Answers that survived: read Venn his own card and he gives up
the key without a ledger; bring the reeve behind you and the key comes with a wage for Dunnet; ask the parish for the
bell and the wall can be mended even when the teeth have gone downriver. Answers that did not: a "legal route" that
only re-labelled the existing ledger route (dropped).

**Are we imposing connections that make the world smaller?** Yes, in two places I stopped:
- I had planned to tie *Quittance's* creditor-fire to *Low Water's* Auditor. Refused: it would have collapsed two
  differently-toned treatments of debt into one cosmic creditor.
- I had planned to make the Hesk of *The Long Man* the Mathematical Age's late hands. Refused: it explains the one
  thing the module is right not to explain, and its "dread" is exactly that you do not know what the keepers are.
  The Hesk are left **undetermined**. The Aeneans mention them only by an exonym (*Hesci*).

**Is the Aenean mystery becoming too explanatory?** It was, in the first draft of `02-history.md`: I had the
Aeneans "reviving" the Age. I rewrote them as the people who wrote the law *about keeping* what they did not make,
which is a claim only about their administrative character. Four accounts of their disappearance are kept alive,
each with a different physical trace (§6 of the history). The adventures I revised say *nothing* about how they
ended.

**Are small adventures receiving appropriate attention?** The two principal revisions are the corpus's two smallest
good ones (659 and 1,688 lines). I did not touch the sprawling ones. The danger the repertoire survey names for large
adventures ("more depth answered by a buried city") was avoided.

## 3.2 Review of the implemented work, after play

I played the new routes (transcripts in `playtests/`), read them cold, and judged them against the repertoire's
moratoria (`doc/adventures/repertoire-2026-11-03.md` §4: "a late revelation that the custom is an ancient machine";
"a council, court, hearing or vote as climax"; "an honest ledger-holder companion"; "a protagonist hired by the first
elder").

### What works

1. **The reeve's discovery** in *The Long Man* is the best new moment. Gammer Coller has a rod whose notches "match
   no measure I know," a rhyme about the Mower, and the unspoken belief that she is an old woman who keeps ditches.
   The charter tells her she was the dale's *auditor of the Hall*. The scene is two people reading a line, one of
   whom is seventy-one. It changes what she does (she appears behind Venn with the rod across her arm), not just what
   she knows. This is history as pressure on a person.
2. **The bell.** It is the only thing in the revision that *costs* something. The parish gives its bell; the bell is
   what rang the evacuation; the evacuation without it is *told* as three times as slow (the rule changes the words, not the clock: the
   mechanical cost is none) and the green's children bang a pan thereafter. Its cost is therefore *narrative and not mechanical*, which is a weakness: a hard-headed player loses nothing by giving the bell. A true cost would have the town slower to the hill. It is the same shape as the 200-year-old register entry ("the Hall's men having sold the
   teeth… the bell of the Ford"), which is the best reason to do it: the dale has *been here before*, and the player
   learns that by reading a leaf of the register at a moment when it solves a problem.
3. **"Neither man nor dog nor cat."** The re-reading of the charter's most absurd line as a keeper's *columns* is
   funny and quiet and changes what the earlier-encountered charter *is*: it was an arbitrary rule; now it is
   a notation. The player encountered the phrase first as the town's whim. This is the "later discovery changes an
   earlier encounter" pattern, and it works because the earlier encounter was untouched.
4. **The handoff fiction.** The player stood in a dale where those teeth held a lake; the cloth on Halm's dig is a
   moment where an act in one book's economy is a heavy object in another's. No flag announces it.

### What does not work, or works less than it appears to

1. **The exposition is a document dump.** `charter_read` and the search-with-lore result are a long Latinate list
   (custodia, sheaf, hinder, take, sell, another House, the reeve's rod). I broke it across Ysolt, Gammer Coller,
   Venn and Dunnet, and each of those *is* a scene, but the lore search still delivers 120 words of paraphrase at
   once. A better version would reveal one clause per person, so that no one has the whole until the company has
   carried it between them. **Not fixed.** It is the first thing I would change.
2. **The ending is a settlement.** Both revisions end in a civic reclassification: *the dale chooses a warden*,
   *the Court notes the tally*. This is exactly the formal habit the survey names (*"what settlement the town
   reached"*). The warden board on the lime tree is charming, and is also a Consistory. The bell option is the
   honest counter-example (it ends in a boy with a pan), and the Hall's cold study (Venn's half-written letter) has
   no civic closure. I'd keep those two and cut the warden board if I were doing a third pass.
3. **Both revisions turn on the same device**: *an old office whose meaning was lost and is found in a document.*
   The Long Man's *custodia* and Skeel's *keeper certifies* are the same idea in two coats. The Long Man's
   rod-as-audit and Skeel's tally are both **a measuring thing that was an office**. That is a house habit of mine,
   not Imbar's. The next adventure to take this commission should deliberately pick a history that does **not**
   help: a past that is wrong, shameful, unusable, or merely sad (for example, the Hive's seventh Leaving, which
   nobody should explain).
4. **Companions are unchanged.** The commission asks for companions who participate in events rather than
   commenting. I could not do this for *The Long Man*: preset party members cannot receive authored lines
   (§4.1 of the authorability report). The substitute (Dunnet as a prospective warden; Loveday already follows) is
   not the same thing. This is an architectural gap I report, not a literary one I solved.
5. **The Exchange is thin.** The factor is a Deem-cast name with a topic or two. She has a voice ("I do not ask
   where a thing was, only what it weighs") and one observed detail (the tin tag NORTH), but not a biography, a
   conflicting obligation or a fear. As a *generated* character this may be right; as a *proof of Deem
   composing with Kyr* it proves composition, not richness.
6. **I did not do the third small adventure** (The Third Night's bridge penny) I judged best for "ordinary life."
   Of the four worked examples in the workbook, three are implemented and one is a proposal.
7. **The play evidence is mostly mine.** I played each new route by labels and under tests (seven new played tests in three files), but I did not run a cold-player pass with a different character build for the Long Man's
   charter beyond the preset cleric/warrior/ranger party, nor did I test the Skeel tally for a player with no lore
   (the Parson route covers it, and is tested; a thief or warrior with *neither* lore nor the Parson would find
   the cell's bench a look-and-wonder, which I think is right).

### Things I decided the second pass should not do

- **Not add Hesk lore to the stones in Low Water.** Halm already names Hesk weirstone; he should remain correct and
  incomplete.
- **Not give the Exchange a motive.** A mundane trade ring with a good customer is more Imbarish, and more
  dangerous, than a cabal. The Exchange is not part of a conspiracy; nothing in the corpus should make it one.
- **Not make Venn's lawsuit decide anything.** Dame Isolde is a name and a debt. Nobody can reach Marlow.

### Changes made between the passes

- Venn's second topic was a monologue that excused him entirely; I made the reading *cost* him (he writes that
  night, in the first person, to the person he has ruined).
- Gammer Coller's first draft said she had walked after the Mower "on the crest all my life", which was untrue to
  the module (she is a ditcher). Rewritten: *"It was never the Mower I ought to have been watching on the crest. It
  was the Hall."*
- The first Skeel draft had the Court *vote* on the keeper's status. Replaced by Hender declining ("The Court does
  not relieve what it did not appoint"). A vote would have been the fifth hearing in a row.
- The factor's text had fixed pronouns; Deem cast a man (Jeremiah) in one world. Pronouns removed from the module
  and its text rewritten to the factor's name.
