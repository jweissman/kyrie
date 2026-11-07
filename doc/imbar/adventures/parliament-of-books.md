# A Parliament of Books: the broad pass

*Revised against `14-bible.md`. Data only. New files: `post.kyr` (the Road), `voices.kyr` (calling-keyed voices); `module.json` and `placed.json`
list them and add `slack_opened` to the canon. Tests: `test/parliament-of-books-post.test.ts` (10, passing), with the existing eight parliament files (35 more) re-run green.*

The adventure was literary and mostly texture; its "empire nobody remembers" was one Observe on a drowned ridge. The pass gives that empire a
**law, a house, a courier and a count**, and ties it into the Colophon so that the Kindling means more than it did.

## The ledger

| | |
|---|---|
| **Count** | Eleven stages of a road that ended at the Ford in the Calamies, and a twelfth that was never cut. |
| **Keeper** | The Undelivered: the last courier of the House of the Posts, never relieved, waiting under the drowned ridge for the year's book. |
| **First page** | *The Colophon is a relay.* Ambery was the last Master of the Posts; when the Road failed he kept the last stage as a petition: one book a year, of its own leave, to carry the city's word the last mile to the twelfth stage (the Chamber of the Parliament of the Bound). The Kindling was the relay before it was a fire. |
| **Price of reading** | The tide. The house opens at dead low water for two hours and asks for the room back (`2d6` and a strength save, and the company on the mud). |

## Acts and scenes

| Act | Where | Faces |
|---|---|---|
| I. The Hithe | quay, Lamb and Lantern, ferry-stairs, mills, bond, Pudding Lane, the Calamies | Moll Garrow, Jonah Pellow, Old Brannock, Widow Teague, Goody Nance, Gil Marrish, **the Undelivered** |
| II. Stitchgate, Newmarket and the Close | Binders' Hall, Gutter Lane, Crake's shop, Doble's press; Court of Pleas, Imprimatur, Church of the Lamp | Crake, Mott, Doble, Haddon, Canon Abery, Hester Rhule |
| III. The Hill and the Gardens | Lyceum, Tower of Rounds, Chained Room; Corvell House, Quennell's library | Ottoline Quarles, Provost Fairweather, Corvell, Quennell |
| IV. The Commonplace | the Roll, the Housebook, the Canto, the Lexicon, the Primer, Mother Orme; the Stacks | the Roll, Fenwick, Hask, the Catalogue |
| V. The Ash and the Kindling | the Foxing, the Cinderfield, Pardoe's hearth; the Ashpit | Hester Rhule, the Index, the Almanack |

## What changed (before, then after)

**Companion arc.** Wren is a lone bard (a messenger by background) and a penny almanack that goes with the company. Before: neither was
addressed. After, `voices.kyr`: the **bard** hears the tide-table scan (the Almanack's tides are verse), the skipping rope (the Kindling rhyme is the
rule of a relay), the back stacks (a hall for calling names), the Roll (a room that is also the law) and the Ashpit (the quiet before the first
note, and how to hold it): five beats across four acts. Other callings are heard where they would notice (thief: the second lock; ranger: the black
stones; cleric: the Lamp; warrior: the pyre) so that a different preset is not told nothing.

*The calling-unique beat:* **only a bard** can ease the Undelivered by the stage-chant (`chant_the_stages`): the Kindling rhyme *is* the relay, and
the beat is the board's. No other calling is offered it, and it needs `rhyme_heard` (the children on the bridge).

*The consequential choice:* the Almanack, asked properly, will go to the Parliament by post, of its own leave (`post_the_almanack`). The company
loses it (it is no longer carried; the voice remains on the nails). In the Chamber, the Roll answers with *the chair could accept the Sleep by
leave* (`roll_posted`): a second road to `favours(roll, sew_leave)` beside the precedent, the Wellhead, the division and the printed Ninth. The cost
is a friend; the gain is a vote that does not depend on the Court. A company that keeps it keeps the friend.

**Danger with ways round.** The post-house is a room under water with a courier who is not relieved. The fight is possible and costly (Level 1, but a
lone bard has six hit points: the test fights it and she falls). Ways round, all tested: the dead letter from the Hithe hook delivered by hand; the
bard's chant; the built-in "ask it to let you by" (it gives a reading's patience before it falls on a company); and the hour itself, because the tide
ends the scene. The Cinderfield's pickets already had two (the Lamp's taper; the register read aloud), and I did not change them.

**Characterization.** *Jonah Pellow:* wants the hook cleared and cannot bring himself to; fears being the last one who did not ask; lies "it is only
paper"; when pressed he gives away the oldest letter he swore never to. *The Undelivered:* wants to be relieved; fears nothing is a letter until it is
received; says "I do not ask a name" of whoever carries the year's book. Crake and Quarles quarrel in the new topics about what the Road was (Crake:
Ys; Quarles: "the Receiving", and she would be glad if you did not write it down), the contradiction left unreconciled on purpose. Rhule and the
Almanack were already well drawn (see the existing arcs tests) and I did not touch them.

**Depth beyond the frame.** The dead-letter hook; (the stable lamp Jonah lit every dusk for a packet is cut in the second pass, so the Church of the Lamp is the one kept light); the cut cross on
every eleventh stone of the causeway, which the board in the post-house explains and does not explain; the black stones across the flats laid eleven
paces to a stone; the pigeon-holes, each with a name; the Road's one law (sealed, sent, read once at each stage and left alone).

**Links.** *Out:* the Collegium of Measures' glossary of the old script reads the ridge (`read_ridge_glossary`, the Dorothea's surveyor carries it); the hook
grows a letter postmarked from no town when `befell(slack_opened)`; Crake's "Ys" is the cyclopaedia's, and Quarles disagrees. *In:* a company from the Combs
with the old glossary would find the ridge legible without lore; letters from the Slack, posted on the Hithe hook, are what would bring a visitor.

**Tone.** The contrast scene is the post-house itself: the one grave room in a literary comedy of manners, with a courier that will not stop saying
*stage*.

**Foreshadowing.** *Early, paid off in the last act:* the hook and the cut crosses, met in the first hour; delivered as the letter, the die and the
Almanack, and as the Roll's *received*. *Only if the player went looking:* the twelfth stage on the board, the one nobody explains, which is the Chamber.

**Playability.** Every new action is reachable from the shipped campaign (`go:mudbank` at hour 5, `=until deadLow()`, down the hatch). The dead letter and
the die are given and taken, not lent. `post_the_almanack` spends the company's own copy (`Spend almanack_copy`).

## Honest shortfalls

- **The Road is a thread, not a spine.** The Colophon is now a relay, but the endings are unchanged; the new Observes read `after()`, and I did not run the Kindling to see them (the existing ending tests do not set the Road's flags).
- `read_ridge_glossary` and the thief's, cleric's, ranger's and warrior's voices are written and not all played: the ranger's is; the old glossary can only be had in the Dorothea, which is a separate world.
- The Undelivered is the only new physical danger. Wren is a lone six-hit-point bard and every fight here is a coin that may kill her; I did not make that gentler.
- The 3,000-kitchen, Cinderfield, Index and Rhule arcs are as they were. I did not rewrite the Stacks or the Commonplace members.
- Characterization is added for two persons, not five.

## Second pass (critical review, `16-critical-review.md`)

- Motif: the eleven stages and the twelfth that was never cut are this adventure's **one** instance (the board, the die, the Roll's reading); the reviewer's suggestion to renumber the stages to nine or thirteen was **not taken** (the label "the twelfth stage" is in the tests and the Calamy support). The stable lamp at the ferry-stairs is cut; the Church of the Lamp is the one kept light.
- Prose: two closing-line tics cut in `post.kyr` and two in `voices.kyr`.
- Not done: renaming Hester Rhule (three other Hesters elsewhere in the corpus); the labels `Talk to Hester` are in `test/support/calamy.ts` and four test files.
