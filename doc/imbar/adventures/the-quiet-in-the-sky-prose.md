# The Quiet in the Sky: prose quality pass

Covers `data/adventures/quiet-in-the-sky/` (campaign `the-quiet-in-the-sky`). Ids, mechanics, conditions and asserted
strings unchanged. Read in full: the Coming-in, Larum (Hark, bakehouse, chapel), Halls (Hild, Gorm, Mab), the Old Ice,
the funeral and the endings; the rest by tic search.

## What I found

This is the cleanest of the four. Its register (dead soldiers who have become tradesmen, a war that is a commute) is
held, the cast is the most audibly different of any adventure I have read: Cleeve's ledger apology, Mab's blunt "year"
for "years", Torold's forms, Wystan's savage vanity, Aulus's Latinate teasing, Hild's general-thinking, Gorm's
resentment of idle iron, Bet's practicality, Nance's flour. The faults are small and repeated:

1. **Reaction-padding.** "looks at you for a long time / is quiet a long while" as the only stage direction for
   Hild, Torold, Ned and Wystan (35 occurrences of the "long time / while / moment" family).
2. **Narrator glosses on a good line.** "It is very obviously not all." after Hild's "That's all."; "as if he does not
   know what they are for" after Torold has already emptied his hands.
3. **The "nobody ever thought" aphorism.** The Runners' strike is explained by the Runner (good) and again by the
   narrator in the fate line (redundant); "Nobody knows how" in the Mab/Ansel fate.
4. **One long expository Result.** The Tabula win reported the whole Ithel history in a single summary paragraph.

## Before / after

| Where | Before | After |
|---|---|---|
| `halls.kyr` Hild's confession | "'That's all.' It is very obviously not all." | "'That's all.'" |
| `coming-in.kyr` Cleeve on hour-kin | "'It is not a law. Nobody ever said it was a law. It is only how it has always been done.'" | He rights an hourglass that had not fallen. "'There are men in Morrow who have not spoken to a brother in six hundred years, and could not tell you which of them started it.'" |
| `old-ice.kyr` Tabula won | one summary paragraph: "...the smith from Larum who came up the stair three hundred years ago looking for his son, and found him in Morrow, and quarrelled..." | Aulus tells it with the winning stone in his fingers: "'A smith from Larum came up the stair three hundred years ago for his son. Found him in Morrow...' The stone stops. 'At the Hour the Even man did not get up.'" |
| `field.kyr` Eld's sword | "He looks down at the face under the frost as if it belonged to somebody he had never met." | "He looks down at the face under the frost; his hand goes out and stops an inch above it." |
| `halls.kyr` Gorm | "He looks at the hammer as if it had betrayed him." | "He weighs the hammer in his hand, and puts it down." |
| `halls.kyr` Hild, third time | "Hild does not answer for a long time." / "Hild looks at you a long time." | "Hild does not answer." / "Hild's mouth thins." (and "folds the map in half, and unfolds it" where she is silent) |
| `endings.kyr` Mab and Ansel | "Nobody has married them. Nobody knows how." | "Nobody has married them. There is no form for it." (a callback to Ansel's own line) |
| `endings.kyr` Runners' strike | "...because nobody had ever imagined they could say no." | cut; the Runners said it themselves in the Scrapes |
| `testing.kyr` | "the roaring stops as if a door had been shut on it" | "the roaring stops, rank by rank, from the middle outward." |

## Patterns fixed

- "a long time / a long while / a long moment": 35 to 20; each replaced by something a character does with an object
  (turns the second cup, drums two fingers on the cup, shades his eyes with the stick).
- "as if ..." similes: 43 to 39 (the four I cut were the most generic: "had let him down", "had betrayed him", "a door
  shut", "belonged to somebody he had never met").
- Narrator gloss sentences removed: 4.
- Expository Result converted to speech: 1.
- About 25 passages changed. The target was 20 to 25 percent of weak passages; this adventure had fewer weak passages
  than the others, so the percentage of text touched is low (under 10 percent).

## Still weak

- The fate lines (`endings.kyr`) are the best prose in the file and also the most uniform: nearly every one ends on an
  understated domestic image. Three or four could be cut for variety, but cutting them removes a payoff someone earned.
- The bakehouse/Mother thread says "against your skin" twice in Nance's mouth (the gift, then the dead crock). It is a
  refrain on purpose; the dead-crock repeat ("I did say") is the better of the two.
- Hild has a long run of exposition at the Testing (the plan to have a breather kill one man in the press). It is
  functional and in character, but it is a speech where she should be doing something with the map.

## What a structural fix would need

Nothing prose-level. The one structural softness is that most of the dead are voiced by the same bluff-veteran
register (Mab, Gorm, Brand's ballad). A third register (a very young soldier who died on the first day of the war and
still believes in the cause) would give the Halls someone for whom the Halt is not a relief. That is new content, not
an edit.

## Tests

Lint: 0 errors. No test assertion referenced a changed string (checked by comparing every string literal in the adventure's test files against the pre-edit source). Run, all passing: the main file, `-placed`/`-company`/`-wander`/`-revised`/`-beyond` where they exist. Not run here (CI): `-browser` and `low-water-replay`.
