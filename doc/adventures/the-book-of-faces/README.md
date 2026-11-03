# The Book of Faces

*A metropolitan region for Kyrie: a rain-noir satire of anonymity and transparency, with a dead Registrar, a lie that governs well, two lovers who dislike each other on a ferry, and eight callings' worth of private business. Spoilers throughout.*

Ombra is a delta city where by day everyone is masked and to say aloud who is under a mask is the one crime the city will not forgive. The Registrar who kept the Book of Faces is dead in her chapel, the Book is gone, and in nine days, if the Drawing is not held, every Office dissolves at midnight. The Watch hires a stranger, a **Bare**, to look. Behind the case is a secret (the Urn is empty and has been for thirty-one years) and four people who each did something to her last evening.

| Document | |
|---|---|
| [00 treatment](00-treatment.md) | Stage 1: the original design |
| [01 editorial](01-editorial.md) | Stage 2: a severe reading (E1 to E15) and the design as revised |
| [02 adaptation](02-adaptation.md) | Stage 3: what Kyr says directly, what is worked round, placement |
| [03 map](03-map.md) | The Sleeves, ways that are conditions, who is where when, the calendar |
| [04 adventures](04-adventures.md) | Thirty-eight threads, the eight callings, how they hold together |
| [05 story](05-story.md) | Synopsis, acts, people, strategic conflicts, the ends |
| [06 status, builds, rewards, critique, friction](06-status-and-critique.md) | What was and was not verified; the build matrix; rewards; the friction report; the honest critique |
| [AUTHORS](AUTHORS.md), [notes-*](.) | The brief the ten authors worked to; each author's own notes with their friction |

## Play it

```sh
bin/kyrie lint data/campaigns/the-book-of-faces.campaign.json        # 0 errors, 0 warnings
bin/kyrie play data/campaigns/the-book-of-faces.campaign.json --choices
bun test test/the-book-of-faces-placed.test.ts                       # the province, found and entered from a generated world
bun test test/ombra-<file>.test.ts                                   # one author's tests (minutes each; the full set is heavy: run it on CI)
```

In a generated world it is a province of the first country, west, on fen and meadow: every town's keeper tells of it and the Watch's notice is nailed up where travellers are kept. It is not on the title page.

## Size

About 11,900 lines of Kyr in 34 files; 104 rooms, 114 ways, 103 people, 129 milestones, 486 topics, 560 actions, 285 discoveries, 353 closing fates, ten endings, nine chapters. 341 tests in 18 files plus the placed test. Branch `adventure/book-of-faces`.
