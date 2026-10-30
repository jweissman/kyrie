# Half the Hive — playtesting and verification

*What was mechanically tested, what was encountered in ordinary play, and what was looked at in the browser. Nothing
here is evidence that the work is enjoyable; see [11-critique.md](11-critique.md) for judgement.*

## Kinds of evidence

| | Where |
|---|---|
| **Mechanical journeys** (by the labels a player sees, asserted) | `test/half-the-hive.test.ts` (8), `test/half-the-hive-small.test.ts` (3), `test/half-the-hive-placed.test.ts` (2), `test/half-the-hive-browser.test.ts` (2, opt-in) |
| **Full transcripts** of each journey to its ending | `playtest/*.txt` |
| **A cold run by visible labels only**, no shortcuts | `playtest/cold-ordinary.txt` (`test/fixtures/half-the-hive/cold.json`) |
| **A curious autoplayer** (`bin/kyrie reach`, 600 steps) | below |
| **Screens**, desk and phone | `playtest/*.png` |

## The journeys

| Journey | Build | Shows | Ending |
|---|---|---|---|
| Left alone | — | Moss mauled on the third morning; the Calling without the company; the flask at dawn on the fourth day; the lovers cross; the Breck princess stings her sisters; Ivo turned out | The Squire's Bees |
| `far` | ranger, alone | The Gallowtree and Merrit's bee; Hannet's promise; the lovers told; Hild's sting rubbed on the moth in the dark; Ivo along, the drove, Kestrel turned; Ivo's dance; walking with the Leaving; named; the camp's after-talk | Under the Far Brow |
| `dell` | bard | The truce read in chalk and kept; Eben told, both stay; the Stair sung in; Duke and the spoon; cages with Linnet's leave; Hannet dances; the night of the Daughters kept; named by the keeper who stayed; the cast | The Brocks' Peace |
| `gift` | thief | Nell heard out and Aldo visited; Corve's drawings and confession; Linnet's offer; the gift; the flask uncorked at Larkhill on purpose | The Gift at Larkhill |
| `gallow` | thief | The flask picked from its case at night; Nell told on (barred); the flask uncorked in the Gallowtree | The Eighth Leaving |
| `bivouac` | thief | The flask poured away; the brocks' truce; Far Brow and Dell level at noon on the fourth day | In the Open |
| `ivo` | — | Left alone to the Turning-out; Ivo on his milestone; taken into the world | The Squire's Bees, with Ivo |
| `nell` | bard | The phial by Tobit's hand; Nell's night; Agnes's word; Nell named; the Drewes paid fair; the mead talked round | (alone after) |
| `watch` | company of three | The watch kept with a light; Agnes appalled; the Deathshead fought and killed; Linnet's leave to carry Tobit | (alone after) |
| `living` | thief | Wild comb cut and sold to Martin; Kestrel's *hide*; the Breck princess pierced | The Squire's Bees, the Candlish princess reigning |
| Placed | elf ranger, wanderer | Heard of from the innkeeper of a mountain country; over the south march; scented; the Crown; left to itself to its ending; the world goes on; Kestrel at Larkhill; back down the road, the innkeeper has heard | The Squire's Bees |

## The cold run

From the drove road by visible labels only, seed `cold`: Smoke End, Martin, the Apron, Doll, the Scenting House
(paid), the Comb, Kestrel (hired), Hannet, Eben, the linden wood, the Gallowtree, the seventh Leaving, Merrit's bee,
back to Hannet. Forty-nine steps. Observed: an ordinary player entering the Comb without a scent is warned plainly
before anything hurts; the Searchers' notice was not yet in Smoke End (added after); the Apron's glance did not mention
the bees (fixed).

An earlier cold run killed its protagonist: scent lapsed on the second day; the player waited in the Dancing Hall an
hour at a time; one sting a watch. The sting now drives the company out to the Apron.

## The curious autoplayer

```
half-the-hive  rooms 35/36  people 26/26  topics 88/112  acts 7/24  (the book closed at Day 6, 8:00 p.m.)
  unvisited rooms: limbo     never had anything to say: halse (since given two topics)
```

## In the browser

Built with `SiteBuild`, played in headless Chromium at 1440×900 and 390×844 (`KYRIE_BROWSER=1`): the title page
offers *Half the Hive*; the drove road, Smoke End, the Apron, the Scenting House, the Comb, Kestrel. No page errors.
The glance shows one observation and three acts, so the first sentence of each place carries its marvel.

## Not tested

The brocks killed with Moss in the company; Hild's *smoke screen*; the night beside the Mother; the honey linden's
fall; walking with the Leaving to the Dell, Larkhill, the Gallowtree or the bivouac (the founding paragraphs for those
are seen only in the Brow-side runs' absence); returning to a placed Wold more than once.
