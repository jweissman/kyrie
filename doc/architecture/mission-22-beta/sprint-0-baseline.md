# Sprint 0: the continuity baseline (23 November)

The first item of the preparation report's Sprint 0: the three continuity invariants of the alpha acceptance record,
counted over every turn of the golden walks **as shipped**, with no engine change. It is the count that Sprint 1
(the outcome of an act) and Sprint 2 (one situation) must move. Re-run it with
`bun scripts/continuity-census.ts [out.json]`.

## How it counts

- **Opportunity:** every act on someone or something present is tried, and done then undone (`Campaign.undo`). The
  person's questions, which are offered at the place, are among them. Each is
  checked for whether it is blue (its witness says knowledge) and whether it teaches (what the company knows grows).
  A breach is blue that teaches nothing, or teaching that is not blue. Also a breach: a person blue as a likeness
  while none of their replies is.
- **Undertaking:** a turn where the followed aim is done, other aims are still held, and nothing is followed on the
  next turn.
- **Focus:** only the frames engaged (by a threat or an occasion) are counted. Whether the page draws them as their
  own is the browser's to measure; Sprint 0's parity extension covers it.

## The baseline (corrected 23 November)

| Walk | Turns | Engaged frames | Opportunity breaches | Undertaking breaches |
|---|---|---|---|---|
| The warrior (golden/warrior-walk.txt) | 44 | 3 | 4 | 0 |
| The mage (cold/cold-5-lines.txt, Gatesend) | 96 | 14 | 6 | 0 |

**Distinct cases:**

| Case | Walk | Turns |
|---|---|---|
| Teaches, not blue: stopping for the old woman's riddle | warrior | 4 |
| Teaches, not blue: offering a bent iron ring for the harbour lantern | mage | 5 |
| Teaches, not blue: looking through Eluned Cadwgan's salvage for a collar | mage | 1 |

**A correction.** The first run of this census reported eight people blue as a likeness with none of their replies
blue. That was the census's own error, not the game's. It tried to open each talk on a copy of the game, but opening a
talk is the page's and the runner's concept, not an act of the campaign's, so the attempt failed and was counted as
"no blue reply". A person's questions are offered at the place already; checked there, every blue likeness on these
walks has a blue reply. The script now checks there.

**What it shows.**
- *[F]* Three acts teach while not blue. Each is an act on a thing whose teaching arrives as something shown after
  the act (the riddle heard; what the lantern's keeper says of the collar). That is the second hop the independent
  audit predicted a scan of an act's own effects would miss: mechanism A of the preparation report.
- *[F]* **The owner's case 5 (blue on a person, none on their topics) is not reproduced** by these two scripted walks.
  Every blue likeness met has a blue reply at the place. The case may live in what the page's talk drawer draws,
  which the parity tool does not measure yet (Sprint 0's parity extension), or on a walk these lines do not take.
- *[F]* No undertaking breach on these walks. That is not evidence that the hand-off is sound: OR-179 has not been
  reproduced, and these scripted walks follow their own lines rather than the gold. The undertaking invariant needs a
  gold-following walk too (scripts/gold-continuity.ts is the model).

## Limits

- Two walks, Iscoed only, as the lines send them. A walk that follows only the gold, and a1, are the obvious
  additions.
- "Teaches" is counted as the company's knowledge growing (the screen's knowledge list). A teaching that changes
  something known, without adding to it, would be missed.
- Acts that fail on their own (a check) are tried once, as the game would roll them: a chance act may teach on one
  roll and not another.

## Next, for Sprint 0

1. **Find case 5 in the talk drawer.** The drawer colours each question by `Attest.reply(frame.leaf.glance, c,
   paying)` and draws a question already asked plain (web/reader/stage/talk-stage.tsx:66-70). The census checks the
   same witness against the place's glance and finds them agreeing. So the owner's case needs one of two things:
   - a glance at the moment of turning to someone that differs from the place's;
   - questions whose own `teaches` flag is false while the opener's knowledge aspect came from elsewhere (the glance's
     inside acts, a rumour). The likeness aggregates the glance's act aspects (src/presentation/likenesses.ts); a reply
     is witnessed by `within` plus `c.teaches` (attest.ts:95).

   Build the drawer headlessly as the page builds it (TalkFocus over the person's replies, with the frame's glance), at
   every turn of a walk that turns to each person. Compare its drawn blue with the likeness. This is the parity
   extension's first piece: tone, not only rows.
2. **A gold-following walk for the undertaking invariant,** after scripts/gold-continuity.ts, so that OR-179's case
   (a payoff that must be chosen as a separate aim) can show.
3. **Parity for the terminal** (src/cli/terminal-scene.ts picks its own colour for "Following"), and for tone across
   all three clients.
