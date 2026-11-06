# The Long Man: prose quality pass

Editor's pass on `data/adventures/the-long-man/*.kyr` (all eight files read). Text only; no ids, conditions or mechanics changed.

## What I found

Strong where the adventure is physical (the drowned street, the face-house, the lantern half sunk in the clay, "The Long Man in your back teeth" at the springs) and thin where it was supposed to be a *place*: eight of the village and Hall rooms in `dale.kyr` were a single functional sentence ("A cupboard of a room, with the parish register chained to a shelf"; "A stone landing... with rings for mooring"). Speeches differ well (Venn's smile that arrives first, Coller's ditch-look, Ysolt's christenings-and-burials, Pask's loud clocks, Teller's denials); the lawyerly three-minute speeches from Ysolt, Coller and Venn on the charter share a cadence but are justified by their content.

## Before / after

1. **The vestry.** *Before:* "A cupboard of a room, with the parish register chained to a shelf and a basin of cold water." *After:* "...chained to a shelf by a chain too long for it, so that it lies on the floor between visits like a tired dog... a surplice on a nail, mended in a thread of a different white."
2. **The study.** *Before:* "a fire, a desk heaped with bills, and the Hall's accounts in a row of ledgers." *After:* each bill weighted with a different thing from the Hall (a pestle, a horse-brass, a stone egg); ledgers "whose spines have been re-lettered so often that the leather has gone to felt."
3. **The yard and the chamber.** The yard now loses the sun an hour before the green ("the hill is so close"), with "a pump with a rag tied round its handle; a mounting-block; a kennel with no dog." The bedchamber window "looks straight up at the hill, so that whoever sleeps here wakes to it."
4. **The landing.** *Before:* "rings for mooring." *After:* "worn bright on the downstream side only, where every rope that was ever tied here has pulled to be gone." Downriver, "pollard willows, their heads cut off for firewood" (echoing the saplings the Mower cuts on the crest).
5. **The millhouse.** "The cat asleep on the sacks is white to the whiskers", the lamp has a halo of flour, the shake "gets into your teeth."
6. **The bell, four times.** "With a sound like a bell" occurred in the charter's Mower event, the Mower's mending, the twelve teeth, and the unmasking. Now: "one low note that you feel in the soles of your feet"; "the note comes up through the dale, and every dog in Merrow lifts its head"; "Each seats a little lower in pitch than the one before." The unmasking keeps "a cracked bell" because it is the odd one.
7. **"Of grey stone", seven times.** The sluice wheels are "pale as old tallow"; the keeper's niche ledge now holds tools "each lying exactly where a hand would put it down"; the culvert arch is "smooth and pale as a tooth"; the drowned street "dressed-stone houses"; the water-house wheel "of the same stone". Stone is no longer the only adjective the hill has.
8. **A calling-voice tic.** The cleric/warrior pair ended on "to nobody"; now "to the doorpost".

## Patterns fixed

| Pattern | Before | After |
|---|---|---|
| "with a sound like a bell" | 4 | 1 |
| "of grey stone" | 7 | 2 |
| one-sentence room descriptions (dale.kyr) | 8 | 0 |
| "to nobody" | 1 | 0 |

## Speaking habits

Venn ("friend"; straightens a straight ledger), Ysolt (counts the dead by parish), Coller (looks at people as at a ditch; "Shut the door"), Pask (loud, wagers), Teller (denies what is evident), Dunnet (slow; hands), the Mower (silent, notches), Cass Rowell (letters moved by lips).

## Still weak

- The three charter speeches (Ysolt's Latin lesson, Venn's reading, Coller's office) are the longest in the adventure and all end with the speaker facing a consequence in an almost identical sentence shape.
- Teaching text on the Wall is carried by Discoveries, so the prose there is dictated.
- "The Mower" has no sensory identity apart from "grey, tall, smooth": no sound of walking, no smell.

## What a structural fix would need

Give the Mower a footfall that the game can announce on the crest at night (an Observe keyed to `at(mower, crest)` already exists: add a second sensory channel); turn one of the charter speeches into an action with Ysolt carrying the register to the font.

## Tests

Campaign lint: 0 errors. `the-long-man`, `the-long-man-charter` pass after two assertions were updated from "sound like a bell" to "every dog in Merrow lifts its head" (the Mower mending the wall).
