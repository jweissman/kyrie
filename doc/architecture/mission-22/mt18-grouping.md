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

## Steps 1 and 2 measured (21 November, branch mt-18b)

With the holders (step 1 and 2) the measure rose 149 → 159, and every new divergence is one person's: Carlin's topics
once she has joined the company (home, knows, night1, rival, hold_here) and Highgate's echo. The runner reads Doable's
rows, so the holder rows change what the runner does: her topics fall under RunnerTalks' own rules and their words
change. Step 2 cannot be measured apart from step 3, since its first consumer is the runner: steps 1 to 3 land together,
the runner rendering a holder's `holds` in place of RunnerTalks, the parity measure the judge.

## Step 3 first try (21 November, mt-18b)

RunnerTalks renders the engine's within: a held row drawn on turning to its person, the person's talk (talk_to)
bearing the fold of what it holds; talk:<person> kept as the no-time turn it was (the kept captures). The measure went
149 → 197: engine only 83, runner only 16 (the runner's own talk:<person> rows gone, 23 → 16). At the taproom on
arrival the engine and the runner agree (Kynes's talk row holds 25, the runner offers her talk_to); the new engine-only
asks (Kynes's, the merchants', Carlin's) come at other turns of the walk, most likely in the runner's talk view (when
the company is talking with someone, Runner.talk), where other people's talks are not offered. Next: give the measure
each divergence's first turn and moment (arrive, outcome, the talk view), then make the talk view offer every holder.


## Step 3, done (20 November)

The runner draws the engine's grouping and nothing of its own: a row within an offered holder is drawn when the company
turns to that person; a person whose acts are held but whose talk is not drawn (led for a question, as Kynes is for what
the waterfront says) has the engine's talk row offered as the engine has it, by what it does, or, a companion's that
only holds (Carlin, once with you), by its own id (`region__s1_traveller#talk`), which turns to them as `talk:` does.
The measure learned two things it had miscounted: an act under an opener the runner draws as one row is offered, as an
act within one is; and a row named by what an engine row does is the engine's. Read with the new measure, m22's own
runner stands at 149 still; this step's at 141, none new. What is left, by cause: the journeys (31, the runner's own
from JourneyFold, not Doable's rows), the follow rows (8, the runner's aims), and the 68 rows the runner names by their
command where the engine names them by the row (AT-13).

## The journeys (20 November)

The runner had made its own journey rows from the screen (the roads, the places further off, a site's way out) and
folded them by JourneyFold, which no other client read; the page's menu and map made theirs by rules of their own. The
engine now makes them (src/presentation/doable-journeys.ts): every journey from here is a Doable row, how long it takes
on it, and a journey JourneyFold does not keep in the rest is marked as on the map (`map`). The runner draws those rows
and folds what the engine marks; nothing of journeys is left in it. The measure holds it: a journey on the map drawn
in the rest, or a count of them folded that is not the engine's, is a divergence. 141 → 107, none new; the page's
menu and map are to read the same rows (step 4).

## Doable's ids, the follow rows, the words (20 November)

The runner offers the engine's rows by the engine's ids (Doable's), each with the command taking it does (`does`),
which may be asked in its place, so that the kept lines play as they were played (RunnerOffer.act). An aim to follow
(follow:) is no longer refused by the runner's own filter of the world's names. A talk the four lead for an act is
called by what it does, in the world's whole words, which the glance now says (LedWords: "Ask Ebba for a lesson",
where her talk's row says "Ask for a lesson"); a stranger's by the talk and the act (CL-45); asked by its id it does
that act (TB-01), and only a holder that does nothing of its own (a companion's) is turned to. The measure plays a walk
re-taken from the golden lines (warrior-walk.txt: the fuel boat's and the sea-gate's aims taken up by asking, as they
now arise; lines the runner refused dropped) and fails on any line refused, which had been passed over (the walk had
followed nothing after T8). 149 → 1: the one left is the scene's "Wait" opener of fragments outside a fight (PB-02,
flat-1). Next: the page's lenses and `serve` in the measure; the runner's own RunnerLed (Said.led) into the engine.
