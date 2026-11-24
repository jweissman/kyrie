# The Leaving Supper: friction and report

## Intent
A small, warm adventure about one day and one dish. Sixty mercenaries leave Haddle Cross when their captain is fed a
supper she thinks is right. She is looking for a grey pot eaten at nine in a country now a lake. The player cooks it
from what the town's quarrelling people hold: the story is in the people, the practice is in the pot. The fiction is
in story.md. It avoids ledgers, inheritances and bureaucracy: the motives are hunger, a boy, a widow, a ladle.

## What works
- The tasting loop: the pot has five places, wrong and right things, Sergeant Ostrey's hints name the first wrong
  one in a soldier's words, and the pot takes 90 minutes, so a day holds about three tries.
- Clues are spread: Imke gives the sorrel and the ash, the miller the barley, the sergeant the salt, Josiah the smoke.
  No one gives the whole recipe (an earlier draft of Imke did; I cut it).
- Two routes to the eel (Nat's message, or the net) and to the salt (coin, or the net).
- The supper: swan, verdict, the ladle scene, then one boon (Nat, Ostrey, the grain, or nothing and a spoon).
- Five endings, six fates read from the player's choices.

## Verification
- `bin/kyrie verify leaving`: clean, 9 journey tests pass. Reach ends in no_supper, since reach takes the first ending.
- Explicit journeys: all five endings but Near Enough/The Swan variants are walked (Skellet Grey, That Will Do,
  Near Enough, The Swan, No Supper), Nat's route, the larder kit, the ash hint.
- Browser: `bin/kyrie preview` built and served (HTTP 200). **I did not look at it by eye.** No human play.
- Not walked: the reeve's persuasion (a die roll), the Ostrey and grain boons as journeys, Imke's wrong-pot reply,
  the miller's and Imke's side topics beyond what reach touched.

## Incomplete or weak
- Satisfying play is unproven. The first right pot may come too easily for a player who finds Imke early: slack is
  large (8:00 to 17:00, a perfect run takes about 5 hours). A harder clock or a scarcer eel would help.
- Deem is used once, minimally: the salt's price is `(1d3) + 1` rolled at install. That is weak variation. I wanted
  the dish's one distinguishing note to be drawn per world, with text for each, and cut it for scope.
- The adventure is standalone: it is not added to countries.json (shared registry, deliberately untouched), so it
  is not yet a province. placed.json exists.
- Prose: "the Captain's" tent etc. repeat a few phrases (voice repeats lists them). Soldiers are scenery apart from
  four named people.

## Authoring difficulties and Kyr/Deem proposals
- Eight per-ingredient actions and eight observe lines stand for one slot choice. A `Choice slot of kinds` form
  with a right/wrong marking would cut this by two thirds.
- Conditional effects inside an action (increase goodness if the right thing) are not available, so right/wrong
  is split into paired actions; a `when` on an effect would be simpler.
- Topics that differ by state need one declaration each (six "taste" topics). A topic with branching replies by
  `when` would be better.
- Ending epilogues cannot read the player's choices, so fates are separate rules; ordering relied on definition
  order (observed to work, not guaranteed).
- Rules and endings that tell need an anchor; the lint advises on endings, which cannot sensibly be anchored.
- Deem draws once at install; a per-play draw (or a seeded table inside Kyr) would give real replay variation.
