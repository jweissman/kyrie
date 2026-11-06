# What Tessary Owes: prose quality pass

Covers `data/adventures/what-tessary-owes/` (campaign `what-tessary-owes`). Ids, mechanics, conditions and asserted
strings unchanged. Read in full: the people (Ancel, Pitch, Nan, Wick, Hannelore, Durrance, Fisk, Sault, Quire,
Pounce, the Valuer, the King), the history and lore files, the strongroom speeches, the ways and the endings; the rest
by search.

## What I found

Tessary's descriptions are the best of the four (Observe lines such as the Treasurer holding his folded spectacles
"as if he did not expect to need them again", the goose in the crate, boots toes-to-the-water). The cast is distinct
by habit: Pitch (rope on the left; terse), Nan (needle, no sentiment), Wick (fast, bargains), Durrance (parade-ground
plainness), Fisk (his new coat), Quire (apologises), Pounce (every sentence is a clause), the Valuer (exact, notes
everything, "I will decline a great deal"), Hannelore (wipes the pot). The faults:

1. **The deep past told twice, and once too fully.** The same fact (a whole people's promise to a whole people is the
   only counterweight) is given by the Valuer, then Quire, then the Comptroller. The Comptroller also gives the
   compact, the hole in the ledger, the stars past the bar, "eleven hundred years", and a closing request to "hold both
   of those at once, as I do". The Notary named the Fastening, the nine jewels and the slack place where the player
   came from.
2. **Repeated "only time the book says he wept"** in the Discovery and again in the Topic.
3. **The dry closing line** (163 speeches end on a short quoted sentence; about 15 of those glossed what the speech
   had already shown).
4. **Hannelore** gives nine gossip updates, all in the shape "'X,' says Hannelore." with no business for her hands.
5. **Pause-padding**: "A pause." 13, "for a long time" 15.

## Before / after

| Where | Before | After |
|---|---|---|
| `strongrooms.kyr` Comptroller | "'...Since then there has been a hole in the ledger the shape of a city. Your fishermen have seen what shows through it, on the nights the stars past the bar are wrong.' ... 'I have tried to fill it honestly for eleven hundred years. One cannot...' ... 'I am not proud of it. I would draw it again. I should like you to hold both of those at once, as I do.'" | "'...I have been filling the hole honestly ever since. One cannot. Nobody owes that much.' ... 'I drew the note so that it would fail. Eight thousand sleepers, unharmed, against a hole I made.' A pause, exact. 'I would draw it again.'" (the stars, the number of years and the moral are left to the player) |
| `holding.kyr` Notary and the nine black lights | "The Scruples call it the Fastening; your priests have other words. The nine jewels your songs remember are the tallies of it... at one place in Imbar the ledger is uneven, and the fastening there is slack, and it is the place you came from." | "'Security,' it says. 'For the oldest promise this floor holds.' It puts the line back. 'I do not discuss the terms. They are being kept. At one place the keeping is slack, and I think you have walked on it.'" |
| `people.kyr` Quire | "'Do you know what weighs as much as a king's ancestral oath, in their scales? A promise of a whole people to a whole people. And there is exactly one...'" (the Valuer has already said it) | "'And there is exactly one of those in the city's books, and I have it by heart: land and a pension for every man who comes home.'" |
| `people.kyr` Valuer on release | "'People forget the second. Nobody releases anybody. I have often wondered why.'" | "'People forget the second.'" |
| `history.kyr` Ancel and the plaque | "Nobody has ever taken it down, because nobody has ever been able to say it was kept." | "It is still there. They dust round it." |
| `week.kyr` Hannelore, the canal coats | "'There's grey coats in the canal,' says Hannelore, and almost smiles." | Hannelore has "a grey coat hanging off the end of the bar, dripping into a bucket", and wrings the sleeve over it as she talks; at the Feast she "rubs a clean place on the drum-skin... where it wants no rubbing" |
| `ways.kyr` Sault at the dusk | "She is quiet a long time." | "She picks a crust of salt off her sleeve." |
| `city.kyr` chandlery | "Rope, tar, lanterns, oilskins, hooks, rations in tins, and a ship's chandler in a leather apron behind a counter worn into a dip by elbows." | "Rope in coils from the rafters like sleeping eels... a chandler in a leather apron, splicing something and not looking at his hands." |
| `city.kyr` Watersteps, high tide | "The water stands high on the steps, slopping and green." | "The tide is in, green and slopping at the seventh step. A child is fishing off the bottom rail with a bent pin and no line." |

## Patterns fixed

- Deep-past exposition: four speeches shortened (Comptroller, Notary, Quire, Ancel), each by roughly a third to a half.
- Glossing closers cut: 5 (Valuer, Ancel, Sault, plaque, Evenhand).
- "for a long time / long while / long moment": 36 to 27.
- "A pause" tags: unchanged at 13; most of them are the Valuer's habit and are kept as theirs.
- Flat Observes sharpened: 3.
- About 20 passages changed (under 10 percent of the file; Tessary is 340 KB of source and I
  did not read the whole of `plot.kyr` or `feast.kyr`).

## Still weak

- The Valuer is brilliant in `people.kyr` and a little repetitive across the file: "A pause." precedes many of
  their answers. A second, different habit (they correct a number; they refuse to guess) would help.
- The Feast chapter has long summary paragraphs on the ending sequence ("The Broken Note", "Foreclosure"); both end
  on a chilling detail but run one clause longer than they need.
- The ending fate lines, as elsewhere, close on a deflating aside too often.

## What a structural fix would need

The Valuer, the Comptroller and the Notary are three servants of one Balance and each explains it. One of them should
be made *unable* to (the Notary reads out clauses only; the Comptroller refuses all questions about the compact), so
the player assembles the old city's story from three partial witnesses instead of being given it by two. Doing that
requires deciding which of the `compact_read`/`census`-type Discoveries each would still teach.

## Tests

Lint: 0 errors. No test assertion referenced a changed string (checked by comparing every string literal in the adventure's test files against the pre-edit source). Run, all passing: the main file, `-placed`/`-company`/`-wander`/`-revised`/`-beyond` where they exist. Not run here (CI): `-browser` and `low-water-replay`.
