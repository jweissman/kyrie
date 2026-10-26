# Low Water

*An adventure for Kyr, conceived before its author read the engine. Spoilers throughout.*

Ammerlin goes down the inside of an old crater in four terraces, and its life is the water of the Stair. For three
years the Mere at the bottom has been falling. The Office of Measures has engaged the company as Independent
Assessor, because nobody who lives in the Bowl can be neutral about water. The Finding is due at the Hearing in six
days.

The cause is a hymn. The city's liturgy is the operating program of a machine of the Mathematical Age under the lake,
and three years ago a good Cantor cut the verse that told it to drink only a cupful.

| Document | |
|---|---|
| [00 — the first conception](00-conception-2026-10-25.md) | Five premises, the one chosen, its people, scenes and a fully specified puzzle, written before any Kyr was read |
| [01 — against the corpus](01-corpus-comparison.md) | The Long Man, Thrume, The House That Grows, Let One Remember, The Patient Star; what collided, what was revised |
| [02 — implementation strategy](02-implementation-strategy.md) | The physical model and the hymn's code, as planned |
| [03 — design dossier](03-dossier.md) | The situation, its actors, the model, the four movements, the eleven endings, the arcs, the puzzles |
| [04 — revisions](04-revisions.md) | Everything that changed, and why |
| [05 — implementation and extension report](05-implementation-report.md) | **The final report**: files, size, the two shared changes, tests, performance, integration |
| [06 — editorial assessment](06-editorial.md) | What works and what does not, after the first pass; with a verdict after the second |
| [07 — the second pass](07-second-pass.md) | Ten times the ambition: the Auditor, the Reflected, six acts (the plan) |
| [08 — the second pass, as built](08-second-pass-built.md) | The Auditor and its heart, Ammerlin in the water, the Glass Citadel, and where the build departed from the plan |
| [09 — a critical reading](09-critique.md) | Depth, pulp, the missing form (double entry), what I was not happy with |
| [10 — the final revision](10-final-revision.md) | Double entry, the Auditor rewritten, foreshadowing, the doubles and the Assayers as fights with ways around them |
| [11 — Act IV](11-act-four.md) | The Hearing as a council of war: the account laid, the creditor named, Quill's arithmetic, three answers |
| [friction.md](friction.md) | Every place Kyr resisted, by severity and kind, with remedies |
| [Play transcripts](../../playtests/low-water-2026-10-25) | Six journeys as the page told them |

**Status: complete.** Six acts, twenty endings, 36 journeys passing, lint clean; ready to integrate as described in
[05 §5](05-implementation-report.md). Low Water is self-contained: it reads nothing from another adventure.

```sh
bin/kyrie lint data/campaigns/low-water.campaign.json
bin/kyrie campaign data/campaigns/low-water.campaign.json
bun test test/low-water.test.ts test/low-water-beyond.test.ts test/low-water-replay.test.ts test/low-water-placed.test.ts \
  test/merrow-to-ammerlin.test.ts test/underground-journey.test.ts test/state-note.test.ts
KYRIE_BROWSER=1 bun test test/low-water-browser.test.ts
bun scripts/low-water-transcripts.ts      # rewrites the play transcripts
```
