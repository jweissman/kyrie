# Plain prose: the default for ordinary events (17 November 2026)

## The policy

The owner, 17 November 2026, night, after "The horse throws its head twice and then leans into the collar. With the
wagoner roaring at the wheel, the cart comes up out of the ditch in a slither of meal":

> For ordinary actions, travel, generated descriptions, observations, and consequences, favor plain, exact, literal
> English.
>
> Write what physically happens. Use concrete nouns, accurate verbs, and straightforward syntax. Do not invent
> metaphors or decorative sensory details merely to make a sentence sound literary.
>
> Good prose is not necessarily elaborate prose.

> Please do not respond by adding more adjectives, evocative metaphors, varied synonyms, or a new general-purpose
> prose generator.
>
> And please preserve genuinely excellent authored prose. A remarkable moment can deserve a remarkable sentence. I am
> specifically trying to eliminate the habit of treating **every** mundane event as an opportunity for strained
> poetic invention.
>
> **The acceptance standard is simple: I should be able to read a paragraph aloud without stumbling over its grammar,
> wondering what its imagery means, or wishing the author had just said what happened.**

What this means for a writer of Kyr, a table or an engine string:

1. **Ordinary means:** an act's Result (look, take, open, search, wait, buy, sell, push, listen, light), a journey's
   lines, a place's generated description, a person's activity, a greeting or farewell from a table, a prologue
   meeting's answer, a rule's routine Says. For these, say who does what to what, and what comes of it, in that
   order.
2. **The subject is the one doing it.** "The wagoner heaves at the wheel and the horse pulls; the cart comes out of
   the ditch" over "With the wagoner roaring at the wheel, the cart comes up".
3. **Name the event, not a figure for it.** "Meal spills from the burst sack" over "in a slither of meal". No
   simile, personification or wry aside on an ordinary event ("purrs like a kettle", "the land changes its mind",
   "It is not a dignified dog").
4. **Do not invent detail to sound particular.** A detail goes in when it is true of the world and the player can
   use it or would see it first. "A field of beans gone black with fly" invented a blight to replace a quip; "A wreath
   of ivy, cut fresh at each new moon" invented a rite. Where nothing particular is known, say the plain thing, or
   say less.
5. **Repetition of a plain line is not a fault.** A plain sentence met twice reads as the same fact. Do not answer
   repetition with synonyms or alternative tellings (the owner: no "varied synonyms").
6. **Remarkable moments keep remarkable sentences.** A wonder, a climax, a chapter curtain, an authored adventure's
   staged scene, a named character's own speech: their authors' prose stays. The lint and the watchlist read only
   the ordinary prose (the shared rules, the voice tables, the generation tables and templates, the origins); an
   authored adventure is its author's.
7. **Read it aloud.** Mechanical checks cannot judge cadence, diction, emphasis or sound. The passages met most often
   are read aloud by the owner and kept as a reference corpus ([prose-comparison.md](prose-comparison.md)); an editor
   does not polish an approved passage again.

## What it supersedes in narratology.md

[narratology.md](narratology.md) (7 November) stays the rule for the order and limits of a place's description. Its
note of 17 November marks what this page supersedes:

- **"The senses first ... the light, the ground underfoot, the shape of the space, the noise in it, the smell of its
  work."** Superseded as a requirement: a place's description may begin with what is there and what it is for. Sense
  detail goes in when it is the thing the player would notice first, not to fill a move.
- **"At most one telling detail ... a mark, a sound, a colour."** Kept as a limit, no longer as an invitation: none is
  the default.
- **The before/after example's "slick with trodden cabbage leaves", "his voice cracking on the top note".** No longer
  the model; such detail is decoration unless it is true and useful.
- **"Prefer concrete nouns and active verbs to adjectives."** Kept and strengthened: concrete nouns and accurate verbs,
  and no figure where the literal word exists.
- **"Vary it" (sentence length) and "never two descriptions in one country that open the same way."** The variety a
  kit needs is in what is described, not in synonyms; a plain sentence may open like another.
- **The banned table.** Kept, and now enforced: its entries that still occurred were found by the lint and removed,
  and the ones still worth holding are in `data/editorial/prose-lint.json`.

## Why recognised problems persisted

The editorial guidance was right more often than not. It was not what decided which sentences shipped.

1. **The guidance was not enforced.** narratology.md's banned table (7 November) lists "with the air of a man who
   ...", "and thinks better of it" and claims the narrator cannot vouch for. Ten days later the first town's reeve
   greeted every a1 walk of the census with "Aldous Fenn looks you over with the air of a man sizing up timber"
   (`data/generation/town/outskirts-deep.kyrt`), and a night journey said "An owl keeps pace with you for a while, and
   then thinks better of it" (`data/voice/journey.json`). Nothing read the table; it was a page, not a check.
2. **The linters measured density, not diction.** ClauseLoad (`src/presentation/clause-load.ts`) counts words and
   joints; empty-words counts "whatever", "something" and "as if". The carter's line is two sentences of 12 and 19
   words with one joint each, and passes both. Worse, the density pass of 13 November (ca83da36, "The road prologues
   say one image or one fact a sentence: 23 heavy to none") is the commit that made the sentence the owner read: it
   split "...leans into the collar, and with the wagoner roaring at the wheel the cart comes up out of the ditch with
   a lurch and a slither of meal" in two and kept every figure. A ratchet that rewards splitting will split
   ornament, not remove it.
3. **Ornament was rewarded.** Each owner complaint (7 November "bland", 14 November "abhorrent ... unspecific")
   was answered by making sentences more particular, and the standards said how: "the senses first", "one telling
   detail", "name the thing: which flower, which tool". The editor, asked for specificity with no facts to be
   specific about, invented them: "a field of beans gone black with fly", "a wreath of ivy, cut fresh at each new
   moon", "his voice cracking on the top note" (mission-21/prose-editing.md, narratology.md's own model). The
   test of empty-words cites the invented wreath as its example of a good line.
4. **Templates were checked unfilled.** narratology.md says "Read every template filled, with the longest and
   shortest names", and nothing did. clause-census and empty-words read the quoted strings of the data files, slots
   and all; a slot left empty, "a" before a filled vowel, a lower-case name opening a sentence, or a word said twice
   across a slot's edge cannot be seen there.
5. **Each pass polished afresh.** Each editorial round (DN-03, DN-06, prose-1..6) re-edited what the last had
   edited, by an agent's taste, with no record of which passages the owner had read and accepted. The same carter
   line was edited three times (6, 7 and 13 November) and never read aloud.
6. **The audit asked for hierarchy, not plainness.** The density audit of 13 November judged the opening roads'
   prose "usually good" and asked for fewer beats; its own "after" kept "counting as though each hurt him". Its
   acceptance criteria are about how many beats, not what they say.

## What changes

- **A prose lint** (`src/presentation/prose-lint.ts`, `scripts/prose-lint.ts`, `test/small/prose-lint`, so it runs in
  `check:fast`): exact banned expressions and constructions, each with the sentence that earned it
  (`data/editorial/prose-lint.json`), over every narrated string of the ordinary prose; and the faults of filled text
  (an unfilled slot, a word said twice, a/an, a sentence begun in lower case, a space before a stop) over text that
  generated worlds actually said.
- **Filled text is what is tested.** `scripts/prose-census.ts` walks the first hour of a1, kite, thorn and Iscoed with
  the autoplay laboratory's players and keeps every page as the narrator told it; the lint reads those pages
  (`test/fixtures/prose/first-hour.json`, recorded, and re-recorded when the prose moves) and, on CI, a world drawn
  fresh (`test/prose-filled.test.ts`).
- **A watchlist** (`data/editorial/watchlist.json`, `bun scripts/prose-lint.ts --watch`): constructions that have
  hidden what happened (an absolute "with" clause, a motion noun for a verb, a simile on an ordinary act, the land
  given a mind, the narrator winking), each with its evidence, for an editor to read. Not failures, and no ordinary
  word is listed for one bad sentence.
- **The first hour's commonest passages rewritten plainly**, facts and consequences unchanged; the before and after
  of each, with the reason, in [prose-comparison.md](prose-comparison.md).
- **A reference corpus awaiting the owner's reading**: the passages a first hour meets most, listed in
  prose-comparison.md. Once the owner has read them aloud and approved them, they are not polished again without the
  owner's word; the lint keeps their banned expressions out, and a change to one is said in its commit.
- **Reviews read the journey.** The playthrough reader (a separate commission) lets an editor read the prose in the
  order the player met it; this page's census is its headless sibling.
