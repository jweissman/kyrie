# MT-18: one grouping, the engine's (design, 20 November)

The owner's rule: every client the same, the Atlas entirely the engine's. The parity measure (scripts/offer-parity.ts)
shows the runner grouping a person's acts by its own rules (RunnerTalks: `whose`, `many`, `led`, `told`, the
`talk:<person>` rows it makes), the page by its talk drawer, and the engine, until today, by nothing.

## What the engine now says

A Doable row held under another names it: `within` (b42fd21d1). A person's own acts and a word asked of them sit
within their talk, `<person>#talk`. The parity measure counts an act within an offered row as offered: the engine's
acts the runner does not offer fell from 109 to 28.

## What a swap got wrong

Having RunnerTalks read `within` in place of its own `whose`, with its other rules kept, hid Ianto's "Pole the fuel
boat" at the staithe: the act was within `pans__ianto#talk`, but the engine offered no such row there, and the runner
folded the act under a talk it then did not draw (its `led` and `told` rules). The parity measure caught it as a new
"engine only". The lesson: grouping cannot be half the engine's.

## The design

1. **Within names only a row that is offered.** Doable sets `within` only where the named row is among the turn's
   rows; an act whose holder is not offered stands on its own. (The staithe's case: Ianto's talk not offered, his act
   stands loose, as it did.)
2. **The engine's person row holds its acts.** Doable gives a person's talk row (`<person>#talk`, doing `talk_to`) the
   ids of the rows within it (`holds`), in the engine's order. A row both does (greets) and holds; nothing unfolds
   outside a fight (the owner's rule), so a client draws the holder as one row and, when the company turns to that
   person, the held rows as the talk's own (the page's talk, the runner's talk focus) — the same set everywhere.
3. **The runner renders it.** RunnerTalks' grouping is deleted: the rest's rows within an offered holder are left out
   of the rest and offered when the company turns to that person (`ask {"act":"<person>#talk"}`, as `talk:` did);
   `talk:<person>` stays an alias so the cold plays' kept lines play as they were played. Led rows (the four) are never
   folded: what the engine leads with is drawn by itself, whatever it is within.
4. **The page reads the same.** Its talk drawer takes the holder's `holds` in place of its own selection (measured next:
   the page's lenses and serve in the parity measure).
5. **Held by the parity measure.** The baseline falls by the runner-only `talk:` rows and the engine-only acts within an
   undrawn holder; nothing new may appear (the ratchet).

Order: (1) and (2) together in Doable with their tiny-world spec (step 1 alone, tried 20 November, raises the
engine-only count 28 → 34: six people's acts offered with no talk row of the engine's, where the runner invents one;
step 2's holder for every person whose acts are offered is what makes the count fall); (3) the runner, parity re-measured, runner specs read; then
(4) with the page's own measure.
