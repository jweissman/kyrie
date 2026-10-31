# Behind the Wainscot

*An independent adventure region for Kyrie, on the branch `adventure/behind-the-wainscot`. Written 31 October 2026.
Spoilers throughout.*

In the western hills there is a house twelve times the size of a house. The giants who built it, the Whitlocks, were
the last of the tall gentry west of the march; it has stood shut for three hundred years, and in that time six hundred
people of our own size have come in by its letterbox and made a town in it: in the space behind the skirting, in the
cold grate, in the pantry among jars of honey that have not spoiled, and in the doll's house in the nursery, which,
being made at a twelfth of a giant's size, is exactly the size of a house.

Four days ago the last Whitlock came home to die. Miss Ermengarde Whitlock is three hundred and twenty, the greatest
cartographer in Imbar, nearly blind; she was told at eight that she had imagined the people she hid in her doll's
house, and believed it, and has come home to draw the one map she never dared to. She has lit the fires. Her
companion, a woman of our size called Mrs Pyecroft, has put up a notice on the inn door in the village on the
doorstep: WANTED, A RATCATCHER.

## Playing it

- **In a generated world**: the Hollins country lies over the north march of a mountain, forest or frost country,
  two to four countries out from the first. Whoever keeps travellers in the country next to it tells of "a village
  called Bootscrape, built on a doorstep", and the ratcatcher's notice is nailed up there.
- **From the title page**: *Behind the Wainscot*.
- **From the terminal**: `bin/kyrie play data/campaigns/hollins.campaign.json --choices`.
- **Tests**: `bun test test/hollins.test.ts test/hollins-placed.test.ts`; `KYRIE_BROWSER=1 bun test
  test/hollins-browser.test.ts` (with `HOLLINS_SHOTS=1` to keep screenshots).

## The documents

| Document | |
|---|---|
| [01 — concepts](01-concepts.md) | Five conceptions, and why this one |
| [02 — treatment](02-treatment.md) | The selected conception, before criticism |
| [03 — critique](03-critique.md) | A severe reading (E1–E13), and the design as revised |
| [04 — adaptation](04-adaptation.md) | What Kyr and the engine say directly, what was worked round, what was not attempted |
| [05 — the map](05-map.md) | The world, the country, the house by floors; who is where when; the calendar |
| [06 — synopsis](06-synopsis.md) | The situation, the acts, the people, the themes, the nine endings |
| [07 — the smaller adventures](07-adventures.md) | Thirteen stories and the places with none |
| [08 — builds](08-builds.md) | The interaction matrix; five builds played |
| [09 — rewards](09-rewards.md) | Money, experience, companions, institutions, persistence |
| [10 — playtest](10-playtest.md) | The suites, the journeys, the cold run, the browser; what was not done |
| [11 — the second pass](11-second-pass.md) | Read again as a finished work; what changed; what is still wrong; the record of revisions |
| [friction](friction.md) | Where Kyr, the engine and the page resisted, by severity, with remedies |
| [playtest/](playtest) | Transcripts and browser screenshots |

## What is where

- `data/adventures/hollins/`: the module (about 2,100 lines and 50,000 words of Kyr in eighteen files: 113 things to ask, 52 things to do): `clock` (the country, the days,
  the three routines), `acts` (chapters, aims, her death), `bootscrape`, `hall`, `wainscot`, `drawing`, `library`,
  `kitchen`, `cellar`, `nursery`, `bedroom`, `lady`, `pye`, `plots` (the Smoking, the Concern, the poison, the Moot),
  `endings`, `after`; `company.kyr` for the standalone campaign and `placed.kyr` for a generated world.
- `data/campaigns/hollins.campaign.json`; an entry in `data/adventures/countries.json`; an entry in
  `web/scenarios.ts`.
- `test/hollins.test.ts`, `test/hollins-placed.test.ts`, `test/hollins-browser.test.ts`, `test/support/hollins.ts`,
  `test/fixtures/hollins/` (the journeys, and campaigns for a bard, thief, mage, ranger and cleric).

No engine code was changed. Nothing in `src/`, `data/rules/` or `data/catalog/` was touched.

## Status

| | |
|---|---|
| Implemented | The country, Bootscrape, the moor, the grounds, the house in three floors (48 places a company can stand in all); 33 people and groups; the Lady's, Mrs Pyecroft's and the cat's days; three acts and a last night; the Moot; thirteen minor stories; nine endings with fate lines; nineteen milestones; two companions; return visits in a world |
| Tested | Lint clean (no errors or warnings); 20 standalone journeys and 2 placed tests pass; one browser journey passes |
| Encountered | The author's cold run as an unhired, charmless cleric; the browser to the chart table on the first morning |
| Evaluated | By its author only (`11-second-pass.md`). Nobody else has played it |

## Open questions for the owner

1. **Giant gentry.** May giant households with pianos and portraits exist in Imbar, or should the Whitlocks be the
   only ones? (friction F11)
2. **World events.** When Mission 18's canon rules land, the Freehold should be a `befell` other modules can read.
3. **Wendle.** The county town is named, never visited. Should it be someone's?
