# The Lull: prose quality pass

Covers `data/adventures/the-lull/` (campaign `the-lull`). Ids, mechanics, conditions and asserted strings unchanged.
The Lull still does not name its war ("the war that wanted cloth, which nobody now remembers"), and no edit here names it.
Read in full: Sixways, the Linger scenes, the Lindsells (Hester, Tobias, Corin), the Working Day, all the endings;
the rest by search.

## What I found

The Lull has the most worked-out cast of the four: Dorcas (wipes the tap, jokes about the walk), Ruth Coll (puts the
pestle down: "which is a sign of something"), Haskett (sighs at an orchard over a wall), Abel (apologises to a chair),
Simeon (speaks in Glosses), Quick Nan ("love", "Early bird"), Matthias (adores), Mabyn (bosses), Tobias (hands open on
his knees), Hester (dry), Corin (clocks). Faults:

1. **"He does not say anything. He does not need to."** twice (Tobias at the Watching, Piran at his shelf) and "It does
   not need to" in an ending. The sentence announces that a gesture is eloquent instead of letting it be.
2. **A reaction beat doing no work:** "looks at you for a long time" or "does not say anything for a long time" for
   Hester, Tobias, Corin, Simeon, Haskett (24 occurrences of the long-time family).
3. **One image used three times for Hester:** her face changing "the way a field changes when the cloud goes off it"
   (office, poppy, and the Result for the unnamed priest).
4. **Telling:** "her face is a thing you will remember"; "Somewhere in it you understand that this is what the strikers
   stopped"; Aldith's speech about the marginal hand.
5. **Duplicate reactions:** Simeon's "Meaning, not love. Spite holds. Held: I was wrong. Twenty years. Wonderful."
   delivered word for word in two places.

## Before / after

| Where | Before | After |
|---|---|---|
| `ashbys.kyr` Tobias at the Watching | "He does not say anything. He does not need to. Somebody gets up and gives him their place" | "Somebody gets up and gives him their place" |
| `ashbys.kyr` the poppy | "When Tobias comes in he looks at her for a long time, and at the paper, and at you, and he does not say anything at all." | "...he looks at her, and at the twist of paper, and at you, and takes the cup off the sill and rinses it in the basin without a word." |
| `ashbys.kyr` / `builds.kyr` Hester sleeps | "her face changes, all of it, the way a field changes when the cloud goes off it" (x2, plus the same line in the cleric's Office) | the Office keeps the field; the poppy becomes "her face loosens, all of it, like a fist let go"; the unnamed priest's "smooth as a plate" |
| `ashbys.kyr` Corin hears Tobias was inside | "she does not say anything for a long time" | "she winds a loose thread from her cuff round one finger, tighter and tighter" |
| `lore.kyr` Aldith and the glossary | "Somebody walked from wherever this came from to here, a long time ago, carrying a column of marks, and copied them into the Rule of a house for tired people, and did not say why." | "Somebody carried a column of marks from wherever this came from, and copied it into the Rule of a house for tired people.' ... 'I think we have been reading someone else's letter." |
| `law.kyr` Simeon, second telling | the same words as the first | a different reaction: his shoulders shake before you understand he is laughing; "Twenty years I kept the gloss that love is the law, and a Pryce boy has proved it with a rude stone." |
| `sixnight.kyr` working with the Hands | "Somewhere in it you understand that this is what the strikers stopped." | "Somewhere in it you look up for a window, and there is none, and you go on." |
| `working.kyr` Corin on the bridge | "her face is a thing you will remember" | "mud to the eyebrows, with her mouth open" |
| `working.kyr` Hobday on the bank | "He stands there a long time." | "He stands there while the shadow of the Mill crosses the water and reaches the bank." |

## Patterns fixed

- "He does not say anything / does not need to": 12 to 2 (the remainder are Linnet and the Weavers' Row bystanders,
  where silence is the line).
- Long-time family: 24 to 11.
- The cloud-off-the-field image: 3 to 1 for Hester.
- "to nobody": 2 to 1.
- Telling sentences: 4 removed or made physical.
- About 25 passages changed (under 10 percent of the file).

## Still weak

- The fates (`endings.kyr`) are strong but there are 37 of them and the commonest closing move is a domestic detail
  plus a deflating clause ("...and she says he is a fool"). Individually fine, in the aggregate a tic.
- The Weavers' Row and Pleasure Garden Observes are among the best descriptions in the corpus and the Lull-born
  speeches in `linger.kyr` (anonymous groups of "the woman with the beans / the man") are the weakest dialogue:
  four of them explain the Strike as a chorus. Give each of them a name and one thing they want.
- The Pryce/Gale house quarrel is told through Matthias's agony (good) and Mabyn's brisk explanations (flat).

## What a structural fix would need

A scene in which the Glosser's law is *disproved on the player's hands* before Aldith states it. Today the player is
told "it is meaning, not love or wages" by Aldith (law.kyr) after three small experiments; the experiments are good,
the summary is not needed. Removing it needs the Simeon topic to be reachable without it.

## Tests

Lint: 0 errors on all four campaigns. One assertion needed updating: `test/the-lull.test.ts:98` matched the removed
sentence "this is what the strikers stopped"; it now matches "you look up for a window, and there is none". Run, all
passing: `the-lull`, `the-lull-revised`, `the-lull-placed`, `the-lull-wander`. Not run here (CI): the `-browser` files.
