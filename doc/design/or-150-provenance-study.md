# OR-150: narration by perception, questions as things (a study, 20 November)

The owner's ask (playtest, 20 November, night): each assertion the telling makes should carry how the company knows it;
an investigative question should be a thing the world holds (shown in blue), not a sentence shaped like a question;
interrogative syntax only where a real question is asked. "Do not simply add another prose-style lint": study the
authoring and projection models first. This is that study and a proposed small experiment. Nothing here is built yet.

## What the models already hold

- **Authoring.** `Observe <id> at <place> [as <aspect>] [noticed by <skill>] when <predicate> "<text>"` (src/lang/Kyr.ohm
  189). The census over data/: `as sign` 330, `feature` 163, `reading` 100, `fixture` 66, `ambience` 58, `sound` 57,
  `revelation` 20, `weather` 16, `event` 8, `felt` 5, `hearsay` 3. `noticed by` woodcraft 27, lore 13, perception 9,
  rites 5, trapwork 3, insight 3, others 2 each.
- **The finding.** `as` mixes two axes. Most of its values say *what the line is* (a sign, a feature, a fixture, an
  event). A few say *how it reaches you* (sound, felt, hearsay, reading). `noticed by` says *whose skill* found it. Nothing
  says *seen*, and the default is unmarked: of 5,787 Observes in data/, 259 (about 4%) name how they are known.
- **Projection.** The Atlas already has a witness model (src/presentation/attest.ts). Every mark carries a witness: its
  aspects and a `WitnessKind` (`direct` | `directional`, with a distance). The told line (`Voiced`: id, kind, text) has
  no witness.

## Proposal: one witness, for marks and lines alike

1. **A `by` axis on Observe, apart from `as`.** Its values: `sight` (the default where the line describes something
   standing at the place), `sound`, `smell`, `touch`, `told` (with a teller: `told by <person>`), `recalled` (with the
   skill: lore), `reckoned` (inference). The current `as sound|felt|hearsay|reading` and `noticed by` map onto it
   mechanically, so the migration is a recipe, not a rewrite.
2. **The witness travels with the line.** `Voiced` gains `witness: { by, from?, far? }`, built by the same code that
   builds the Atlas witness, so a line and its mark can't disagree (the MT-18 rule: one projection).
3. **Questions are objects.** `Question <id> about <term> "<what the company wonders>" opened when <p> closed when <p>`.
   The engine holds the company's open questions. The frame shows them in blue as wonderings ("Where did the four head
   go in the dark?"), and the rows that bear on one say so. Prose elsewhere states; it does not ask.
4. **The check is structural, not stylistic.** A line with `by told` must name a teller who is present or remembered. A
   line `by sight` must be about something at the place or within sight of it. A `Question` must have a closing
   predicate that some act can make true. Those are compiler diagnostics over the model, not a regex over prose.

## The experiment (small, one place)

Iscoed's green and the Black Rhyne only. Author with the new axis:
- three observations (one seen, one heard, one told by Owain);
- one direct question put to Owain;
- one investigative question, the four head (opened by the count, closed by the find);
- one illusion (a thing seen that isn't so, the witness `sight` and the fact false; shown as seen, not as true).

Judge it by reading the turn aloud, and by a pin that each line's witness agrees with its mark. If it reads better and
the pin holds, the axis becomes the default for new Observes and the migration recipe runs over the corpus.
