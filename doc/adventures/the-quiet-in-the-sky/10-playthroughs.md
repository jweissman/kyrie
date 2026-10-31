# The Quiet in the Sky — playthrough evidence

Four kinds of evidence, kept apart:

- **Implemented**: in Kyr and linted clean.
- **Tested mechanically**: a journey test plays offered labels and checks the facts.
- **Encountered in play**: I read the transcript or the screen, as a player would, and noted what was wrong.
- **Evaluated as satisfying**: a judgement, given in the critique (11), not here.

## The tests

| File | What it plays | Result at the last run |
|---|---|---|
| `test/quiet-in-the-sky.test.ts` | Lint; the Larum opening; Ned at noon; the cold; seven journeys to five endings across four builds | 12 pass |
| `test/quiet-in-the-sky-placed.test.ts` | Placement in nine worlds, moving no other country; an ordinary wanderer in the generated world of seed `q335` hears the rumour next door, walks up the valley road, goes up with Jory, comes down, waits out the Testing, sees the chapter close with the world still running, hears the sky from Larum, and walks back up to find the Daily and churned snow | 2 pass |
| `test/quiet-in-the-sky-wander.test.ts` | Six random walks of 250 offered choices (warrior, thief, cleric × two seeds), then waited out; invariants on outcomes, burials and Edith | 6 pass |
| `test/quiet-in-the-sky-browser.test.ts` | In Chromium (`KYRIE_BROWSER=1`): the valley road, the Hark, Bet, Jory, the Coming-in, Halt, the ring; screenshots kept with `LARUM_SHOTS=1` | 1 pass |

The library tests that know about countries and names (`adventure-library`, `adventure-names`) pass with this work in
them. Of the repository's full fast suite, one failure seen on this branch, `origins.test.ts` "does not have the
brother told what he knelt beside", also fails at the base commit `db92e98` without this work, and is not this work's.

## Transcripts (in `playtest/`)

Each is the page as told, step by step, with runs of waiting folded.

| Transcript | Build | Route | Ending |
|---|---|---|---|
| `larum.txt` | warrior | The opening: Larum, Jory, the Coming-in, Ned at noon, Halt, the Oven, the Truce | — |
| `halt.txt` | warrior | Spar and scar; Mab and Ansel; the crock carried; Jory told and gone up; the wedding; Hild brave | Halt |
| `edith.txt` | cleric | The wound read; Edith found by her breath and brought to the ring; the bear fed; Tabula lost twice; the Old Ice grave; Hild brave; Edith home | Halt |
| `strike.txt` | bard | Saltash's horn; Wystan's song; the strike; picking; the Clear (failed) | The Long Quiet |
| `quiet.txt` | warrior | The Teeth with a torch; WENDMERE on the cairn; Halvard hauled down to Larum alone | The Long Quiet |
| `fear.txt` | thief | Spar; told Hild; promised; one stealth strike in the press | The Kept Fear |
| `daily.txt` | warrior | Up once and down again | The Daily, unseen |
| `betrayal.txt` | warrior | Edith given up to Torold, killed, and sent west at the Coming-in; the Runners' bench | The Long Quiet |
| `world-wanderer.txt` | warrior, generated world | From the inn next door to the Daily's return | The Daily, unseen |

## What ordinary play turned up, and what was done about it

The defects below were found by reading these transcripts and the screenshots, not by the assertions.

| Found | Fixed |
|---|---|
| Ned's name never replaced his mask (`Person ned "a boy in a carter's smock"`) | Named Ned Whitlock; `Known as` the mask |
| Hild's topics referred to her pen and map while she walked the lanes | Topics made true in either place |
| The numbness was told twice in a step (an observation and a rule) | The observation removed |
| A first-level warrior waiting outdoors overnight froze without warning | Explicit warnings at the two thresholds; the halls, the Oven and the warren made places to rest |
| Ansel stood at the ford during the Testing | Kept in the press |
| "The way Edith Marl struck" told to a thief who had never heard her name | "The way whoever killed Halvard struck" |
| The ford said "nobody has cleared it" and "cleared overnight" in one breath | The two made conditional |
| Torold "sits on the empty bier" while Halvard was still on it | Two tellings, by the bier's state |
| The epilogue named Edith, Ned and Torold to a protagonist who had met none of them | Each fate gated on what the company knows; an unknown woman in the Scrapes stays unnamed |
| The Long Quiet ending said "a breather knows" to one who did not | Two endings, by whether the law is known |
| The song was hummed in the Truce before it was sung | Only after the song's end |
| The generic Hour line repeated after the burial and the song | Those set the day's Hour as told |
| Jory reached his son instantly | Three hours up the Pass, then down to Halt |
| The milestone said "saw Jory sit with his son" while the protagonist slept in Larum | "brought Jory Whitlock up to his son" |
| Bringing Edith past the ring confessed her automatically | A deliberate, grave action |
| Mab greeted the protagonist cheerfully at the end of her fury | Letters are given, not shown in talk |
| Morrowhall "the only warm you have felt since the pass", after the Oven | Removed |
| The browser glance hid the ballad, the Pass and the quiet | Every key description rewritten to open on its essential |
| Bet shown as an old bearded man | Likenesses chosen by gendered words |
| Halvard's fate in the Halt ending said Torold watched for the blue, after Torold had learned it would never come | A fate for a Torold who knows |

## The screenshots

`playtest/browser-1-valley-road.png` to `browser-6-ring.png`, taken at 1440 × 900 in headless Chromium. They show the
glance (the opening sentence and the ways on), Bet's portrait panel and its topics, the Coming-in's long arrival
paragraph, and the ring with Torold's name as the first choice. I looked at each.

- The first, before the descriptions were rewritten, showed only "The road comes up a long bare valley...", with nothing
  of the Pass or the quiet. It is the reason for that revision.
- The portrait in the third is the reason for the likeness revision.
