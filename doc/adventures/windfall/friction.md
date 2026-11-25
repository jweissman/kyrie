# Windfall: friction

## Creative intent
An orchard the Water-Wardens grafted into a living sea-bank has begun to walk inland, because the sea-gate failed and salt reached its roots. It will reach Hythe's churchyard on the fourth morning. It is also following a pear: a cutting of its own Mother Tree, planted over a sexton's wife. Nobody is owed anything. The adventure asks whether anyone can be asked to cut something from the one living thing of the person they lost. Its ties to Imbar are Iscoed's cold salt-pans, the Water-Wardens' sea-gates and the Rì's reeve at Porthalen. It is a wonder, a perilous crossing and a clock together, which the corpus has least of.

## What works
- Six endings, each reached by a journey test: The Burning (the default if nothing is done), Both Banks, Nance's Pear (graft only), Salt Out of the Roots (sluice only), The Green (windfall trail with the axes held off), Midwinter Blossom (orchard walks through the graves, axes held off).
- Several partial answers need different knowledge: the graft needs Tamsin, then Ellery, then a woodcraft roll. The sluice needs Tamsin's bar, the ebb and Hobin's word about the mud. The writ is turned by the marks cut in the sluice-house wall. Bryony is bought off with the prunings, and only Tamsin knows the prunings exist.
- The default is not safe: three nights, then the axes. Waiting is a choice.
- The vigil in the churchyard changes by whether Ellery was told.

## Incomplete or thin
- Nothing is yet in countries.json. Adding the country to the shared registry was out of scope, so the adventure is played by its own campaign. Its placed.json and placed.kyr exist but are not offered by any march.
- Endings are epilogues told wherever the company is (lint advises anchoring them). They are the end of a chapter in the world, so I left them heard everywhere. A company that is far away still hears them.
- Ending timing: every ending waits for 07:00 on day 4, even when the orchard was settled on day 1. A company that solves it early must wait or rest. A settle-then-dawn marker would be better.
- Harrowby's reprieve and Bryony's easing are not exclusive in play. Both lead to Midwinter Blossom.
- A failed graft costs an hour and is retried. The check is seeded, so a test that retries is fragile if the seed changes (the tests use optional steps).
- The orchard moves by a measure, not by a place. Observations say where it is, but the map does not show it walking.
- The Wonder is declared on the orchard and listening teaches salt, but its listening observation never fired in reach.
- No browser eye has looked at the page; \`bin/kyrie preview\` built and served it. No human play is recorded.
- Advisory first-name overlaps: Odile, Verity, Tamsin.

## Authoring difficulties
- Names the shared rules own (\`green\`, \`stage\`, \`pace\`, the state \`shut\`) fail the lint or load with little guidance. I renamed four things.
- \`site == orchard\` in a Requires is refused ("site is no number"). A parameter-free action using \`at(actor, orchard)\` was the answer.
- A topic needs its own \`Talk to\` step in a journey unless the conversation is already open, and the journey tool fails hard on the difference; \`?\` steps help.
- A placed adventure's clock starts at the first morning at eight, but a standalone campaign starts at midnight. A rule for "day 2" behaves slightly differently in the two.

## Proposed Kyr and Deem improvements
- A \`Mover\`: an entity that steps through an ordered chain of rooms on a clock, with the map showing it. The orchard is the second thing I've wanted to walk.
- A way to quiet "heard everywhere" for an Ending whose epilogue is by nature global.
- An ending condition's "settled at" timestamp: \`when settledFor(1 night)\`.
- Journey steps that retry a seeded check until it succeeds, in one line.

