# Sprint 0: the continuity baseline (23 November)

The first item of the preparation report's Sprint 0: the three continuity invariants of the alpha acceptance record,
counted over every turn of the golden walks **as shipped**, with no engine change. It is the count that Sprint 1
(the outcome of an act) and Sprint 2 (one situation) must move. Re-run it with
`bun scripts/continuity-census.ts [out.json]`.

## How it counts

- **Opportunity:** every act on someone or something present is tried, and done then undone (`Campaign.undo`). The
  same goes for every question once a talk is opened, asked on a copy of the game with the talk open there. Each is
  checked for whether it is blue (its witness says knowledge) and whether it teaches (what the company knows grows).
  A breach is blue that teaches nothing, or teaching that is not blue. Also a breach: a person blue as a likeness
  while none of their replies is.
- **Undertaking:** a turn where the followed aim is done, other aims are still held, and nothing is followed on the
  next turn.
- **Focus:** only the frames engaged (by a threat or an occasion) are counted. Whether the page draws them as their
  own is the browser's to measure; Sprint 0's parity extension covers it.

## The baseline, main at 5210cc6ef

| Walk | Turns | Engaged frames | Opportunity breaches | Undertaking breaches |
|---|---|---|---|---|
| The warrior (golden/warrior-walk.txt) | 44 | 3 | 13 | 0 |
| The mage (cold/cold-5-lines.txt, Gatesend) | 96 | 14 | 13 | 0 |

**Distinct cases**, by how many turns each stands:

| Case | Walk | Turns |
|---|---|---|
| A blue likeness with no blue reply: the Guldríce agent | warrior | 3 |
| A blue likeness with no blue reply: Carlin | warrior | 2 |
| A blue likeness with no blue reply: Kynes, Holgar, Luthor, Gek | warrior | 1 each |
| A blue likeness with no blue reply: Gek, Dreg | mage | 3 each |
| A blue likeness with no blue reply: the steward of the Hall | mage | 1 |
| Teaches, not blue: stopping for the old woman's riddle | warrior | 4 |
| Teaches, not blue: offering a bent iron ring for the harbour lantern; looking through Eluned Cadwgan's salvage | mage | 5, 1 |

**What it shows.**
- *[F]* The owner's case 5 is reproduced headlessly: **eight distinct people are blue as a person while none of their
  questions, opened and tried, is blue.** The likeness and the replies are judged by different code (Likenesses
  against Attest.reply over ChoiceGrouping.teaches). This is mechanism A of the preparation report.
- *[I]* The riddle's and the lantern's misses are acts on things whose teaching is an observation shown after the act,
  the second hop the audit predicted a static scan would miss.
- *[F]* No undertaking breach on these two walks. This is not evidence that the hand-off is sound: OR-179 has not been
  reproduced, and these scripted walks follow their own lines rather than the gold. The undertaking invariant needs
  a gold-following walk too (scripts/gold-continuity.ts is the model). That is the next refinement.

## Limits

- Two walks, Iscoed only, as the lines send them. A walk that follows only the gold, and a1, are the obvious
  additions.
- "Teaches" is counted as the company's knowledge growing (the screen's knowledge list). A teaching that changes
  something known, without adding to it, would be missed.
- Acts that fail on their own (a check) are tried once, as the game would roll them: a chance act may teach on one
  roll and not another.
