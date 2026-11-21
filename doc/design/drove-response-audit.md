# The held drove: who answers what was done (20 November)

The first proof of the defect-centres review's Centre 2, "the world does not answer"
(doc/architecture/reviews/defect-centres-and-process-2026-11-20.md). It covers the held drove at Porthalen
(data/goings-on/iscoed-drove/situation.kyr) and was made with what Kyr already has: Topics, Rules and Observes. For each
deed or find, the table says who knows of it directly and who can be told. It says who cares and why, and what they can
do about it. The last column gives the dead ends as they were before this pass.

| Deed or find | Knows directly | Can be told | Cares, and why | Can do | Dead end before |
|---|---|---|---|---|---|
| **The four found drowned in the Rhyne** | the company | Owain (pens); Mardle (counter); the reeve (green, with Mardle called out) | Owain: he heard them go in and left them. Bran: it clears him. Mardle: it breaks his count. | Owain: nothing, but it is his grief and his relief. Mardle and the reeve: let Bran out. | **Owain could not be told.** The find "just sits there" (cold play 9, T7). |
| **The count proven to Mardle** (the four, or the ink) | Mardle, the customs-man | the reeve, the waterfront (the innkeeper) | Mardle: his book and his children. The reeve: three droves this year. The waterfront: nobody crosses him. | Mardle: let Bran out (or be turned out, with the ink). The reeve: rule on the green. The innkeeper: say what is said. | The innkeeper's "what the waterfront is saying" answered it, but only in the taproom and only if asked. |
| **The twelve crowns paid** | Mardle, Bran | the waterfront | Bran: it was your coin, and you may have known better. Mardle: he keeps the counter. | Bran: remember it. Mardle: count the next drove the same. | **Bran's thanks were the same whatever was done.** Paying, finding and reading the ink all drew one speech. |
| **Bran out** | Bran, Owain, the customs-house | the landing | Bran: home, the sale, the pass. Owain: home with him. The landing: a drover got out from under Mardle. | Bran: sell, pay a share, send you west. Owain: go home. | **The green did not remember.** Coming back, nobody on the landing said a word. The innkeeper said it only when asked, indoors. |
| **Bran still held** (time running) | the customs-men, Owain | the company, by the sale cried | Owain: he stands in the gate. Mardle: he sells the drove. | Mardle: cry the sale, sell half, send Bran north. | Already answered: the sale is cried, the buyer comes, half is sold, Bran is sent north. |

## Closed in this pass

1. **Owain told at the pens.** "Tell Owain you found the four in the Rhyne": "Owain's face goes still. 'All four,' he
   says. Then, not looking at you: 'Thanks. I couldn't go in there.'" It is the first gratitude, once.
2. **Bran says how he came out.** This is said first, then his thanks and the pass as before. It differs by what was done:
   - For the four found: "'You found them in the Rhyne,' says Bran. 'Nobody else looked.'"
   - For the ink: "'You read his ink,' says Bran, and looks back at the counter. 'Good.'"
   - For the crowns: "'Twelve crowns of yours,' says Bran. 'I won't forget it.'"
   - For the crowns paid by someone who knew where the four lay: "'You knew where they lay,' says Bran, 'and you paid
     him all the same.' He does not say it kindly."
3. **The green remembers.** Coming back to the landing once Bran is out, Owain is telling two drovers off the Wrackham
   boat how it went, as a line of his on the landing, seen while the company is there:
   - "…about the Rhyne, and stops when he sees you: 'That's who.'"
   - "…how you read Mardle's ink: 'In front of him, too.'"
   - "…that you paid Mardle's twelve crowns: 'Out of your own purse.'"

All four paths are played in test/drove-answers.test.ts: the four found, the ink read, the crowns paid, and the crowns
paid knowing where the four lay. Each Bran line and each landing line is said once, where it belongs.

## Still open

- The reeve says nothing to the company after a quiet settlement at the counter.
- The customs-man who checked the Rhyne is never seen again.
- Mardle's family's going is told, but nobody speaks of it to the company.
- None of these needs an engine abstraction yet. What repeats is the shape: a deed, then the person it is about, then a
  short line, once, and where it is said. That is the case for one later.
