# Situations that move on their own clock: a census (21 November)

The first-hour beat sheet's checkpoint 10 (doc/design/golden-thread.md): a local situation can develop without the
player. The question here is which towns have one, and what the player sees of it passing.

**Measured.** In a1, Iscoed and two generated countries (thorn, ash), each started as the warrior Wenna, the script
counts what is seen in each town as days pass. That is an `Observe`, or a `Rule` said there, anchored in the town's
places, whose condition sets the clock against a fixed mark (`watch(clock) >= 288`, `day(clock) …`). A clock counted
from something the company did (`watch(clock) >= letter_at + 144`) is the company's doing, not the town's, and is not
counted. A town is credited with what it is anchored in, whoever wrote it.

**What moves today.** The things that move fall into three groups.

- **The tie** (data/generation/town/ties.kyrt). Every settlement has one. The kin shape is someone dying, told with a
  pony at the door, then a door shut softly. The debt shape is a merchant gone and come back, then his weights tried.
  The custom shape is a fallen cairn, then a vigil and the bell. These are one or two tellings each, and some of them
  only after the company's own deed (the cairn).
- **The first town's own sections** (neighbours, troubles, conflict). Hesper going, the dogs turning to the hill and
  the bailiff Rooke's fall are told only where the company begins.
- **Stories placed in the country that pass through it.** The walk of the milestones, the drover, the players, the
  circus, the toll-keepers and the Howe's clerk appear only in the towns they pass. Iscoed's drove timetable, the sea-gate
  and Osric's step in The Warm Wall, an authored adventure, are their own situations.

**Before** (towns whose own telling of days passing is seen three or more times):

| country | towns | none | 3+ seen | the towns that are not the first |
|---|---|---|---|---|
| a1 | 5 | 0 | 4 | Millholm 11, Sedgebrook 8, Mistshaw 9, Mossminster 2 (the tie only) |
| Iscoed | 5 | 0 | 1 | Wrackham 2, Edderwick 1, Gatesend 2, Reedbridge 2: the tie only, and at Reedbridge the bailiff Rooke's dues collected |
| thorn | 5 | 0 | 5 | Broadford 3 (the tie and the fever); the others carried by the walk and the drover |
| ash | 5 | 0 | 4 | Whitemoss 2 (the tie and the players) |

No town had nothing. But a town that is not the first, and that no passing story touches, had one or two tellings in
six days: a door shut, a bell. That is true of four of Iscoed's five. Iscoed is the atlas country, where no walk is
placed. What the player sees of that town's days is the weather and the hour.

**Made.** In data/generation/town/afoot.kyrt (src/world/region-afoot.ts), every generated settlement draws one
situation from a pool of five, by its own key. No two settlements of a country draw the same one while others are
left.

- The five are a barn going up; two neighbours over a wall; a sick cow; a wedding; and a boat on trestles, only where
  there is water.
- Each has three stages told on the town's heart (`as sign`, one sentence each): days one and two, days three and
  four, and after.
- At the middle stage the company may step in: raise the last truss, carry a word over the wall (persuasion), walk the
  cow's bloat out (woodcraft), give a coin to the feast, or close the boat's seam (mending).
- The last stage remembers it. The jug on the wall, or the wall head-high. The cow grazing, or her hide on the frame.
- Nothing is paid and nothing is an aim.

**After:**

| country | none | 3+ seen | the towns that are not the first |
|---|---|---|---|
| a1 | 0 | 5 | Millholm 15, Sedgebrook 12, Mistshaw 13, Mossminster 6 |
| Iscoed | 0 | 5 | Wrackham 6, Edderwick 5, Gatesend 6, Reedbridge 6 |
| thorn | 0 | 5 | Merscstede 14, Broadford 7, Fairholt 14, Sedgeminster 13 |
| ash | 0 | 5 | Tincarr 14, Coalshaw 14, Whitemoss 6, Ironford 13 |

**Pinned.**
- test/features/world/town-afoot.pin returns to Wrackham on days 1, 3 and 5. The neighbours are shouting, then silent
  and building, then sharing a jug on the wall, because a word was carried over it. Porthalen's barn is thatched all
  the same where the company did nothing.
- test/small/afoot-every-town checks the four countries' draws.

**Found on the way.** A line written `as ambience` held and was not told: Wrackham's second stage, its condition true,
was missing from the place's telling. The stages are `as sign`, which is told. Which ambience lines are told is worth a
look of its own.
