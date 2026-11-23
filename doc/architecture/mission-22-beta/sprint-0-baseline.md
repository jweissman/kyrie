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
| Gold only (HonestPlayer, the warrior, up to 80 steps) | 14 | 0 | 3 | 0 |

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

**Added 23 November.**
- *[F]* **The drawer's first page:** at every turn where a person is blue, the talk drawer's first page (TalkFocus as
  the page builds it, marked by what the glance found in their opener) shows a blue question, on all three walks.
  So case 5 is not on these walks. The check stays in the census as a guard.
- *[F]* **A gold-only walk** (the page's lead, as HonestPlayer plays it) stops at turn 14, at Redkeep's gate, where
  the page leads with "look at the speaking door", a riddle on a way. The honest player finds nothing to do with it.
  [I] This is probably the honest player's limit (it does not answer a riddle on a way; the browser spec
  test/riddle-on-way does), not a lost thread. To confirm on the page before treating it as a defect. Either way, a
  gold walk that cannot pass a riddle door cannot test the undertaking invariant beyond it: teaching HonestPlayer to
  answer a way's riddle is the next step for this measure.

## Browser timings (CI full run 45195920420, 23 November)

In the browser, at a laptop's size (1280×800, mouse) and a phone's (390×844, touch), from the specs that already
measure them (test/input-answered-browser, test/set-out-now-browser, test/board-update-browser):

| What | 1280×800 | 390×844 | Budget |
|---|---|---|---|
| An act pressed → drawn taken (acknowledged) | 7.7 ms | 8.9 ms | 100 ms |
| A talk opened → the page turned to it | 22.8 ms | 21.4 ms | 100 ms |
| A reply pressed → drawn taken | 10.8 ms | 8.0 ms | 100 ms |
| A journey held → committed at the hold's end, card drawn | 521 → 534 ms | 521 → 523 ms | the hold (520 ms) + 100 ms |
| Set out now → in the world | within 1 s (the start drawn ahead) | | 3 s |
| The map at a journey's end: updated in place, its parts | 97 ms; parts 16–158 ms | 72 ms; parts 9–177 ms | |
| A journey's hexes revealed as it walks | every 0.6–0.75 s | every 0.7 s | |
| **Settled** (pressed → answer drawn, page open again; run 45217483792) | | an act 372 ms, a talk 202 ms, a reply 134 ms | 300 ms p95 |

*[F]* Acknowledgement is far inside budget everywhere. *[F]* Settled is not: an ordinary act (a way taken) settled
at 372 ms at a phone's size, over the 300 ms budget (one sample; test/input-answered-browser logs it every run).

## Limits

- Two walks, Iscoed only, as the lines send them. A walk that follows only the gold, and a1, are the obvious
  additions.
- "Teaches" is counted as the company's knowledge growing (the screen's knowledge list). A teaching that changes
  something known, without adding to it, would be missed.
- Acts that fail on their own (a check) are tried once, as the game would roll them: a chance act may teach on one
  roll and not another.

## Next, for Sprint 0

1. **Find case 5 in the talk drawer.** One hypothesis is ruled out (23 November). It was that turning to someone
   changes the glance the drawer colours by.
   - Opening a talk through the runner (`talk:<id>`) on the warrior's walk changed neither the likeness nor any
     question's blue: Carlin's and Kynes's blue questions stayed blue, and the plain ones were plain.
   - One real miss showed: "Ask about the old quarry" teaches but is plain (OR-178: the job's own given-marker).
   - What is left is the page's own drawing (web/reader/stage/talk-stage.tsx):
     - a question already asked is drawn plain (`spent`);
     - questions are paged three at a time after any answer owed (`Paging.of`), so a person's blue question can sit
       off the first page while the likeness is blue.
   - Build the drawer headlessly (TalkFocus over the person's replies, paged as the page pages) and check that the
     first page shows the blue a blue likeness promises. If it does not, that is case 5, and the fix is the drawer's
     order (the promised question first), not the witness.

2. **A gold-following walk for the undertaking invariant,** after scripts/gold-continuity.ts, so that OR-179's case
   (a payoff that must be chosen as a separate aim) can show.
3. **Parity for the terminal** (src/cli/terminal-scene.ts picks its own colour for "Following"), and for tone across
   all three clients.
