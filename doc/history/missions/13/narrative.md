# Mission 13: narrative review

No line is written at run time by a model. Everything said is a table line (`data/voice`, `data/generation`), a
module's own words, or composed from the world by rule; the work of this mission was to make those say what is
true where they are said, in a voice worth reading, and to fix a bad line where it is made rather than where it shows.

## The registers

| Register | Where it comes from | What changed |
|---|---|---|
| The place | its founding, its scene, its observations, its weather, what lives there | Foundings give each settlement its own reason and heart; sentences of where it stands are composed, not listed; a wonder is told with the place |
| Someone speaking to you | `data/voice/address.json`, `farewell.json`, `join.json`, `part.json`, by bond, manner, hour and memory | New bonds (*expected*, *creditor*, *neighbour*; *friend* is now someone you did a good turn); who someone is to you outranks their manner |
| A module's people | Topics' `Says` | Unchanged in kind; several made true (the priest's bed exists; a creditor's debt is a bond) |
| The road | `data/voice/journey.json`, by hour, sky, land, the way itself, and length | A road and a path are told apart; the sky (fair, grey, rain, fog, wind, cold, hot, ash) is respected; lines rotate |
| What happens | rules' `says`, actions' results, the combat telling | Resource changes in words; harm told as harm; a search said as a search |
| A fight | `src/ui/combat-telling.ts`, `data/voice/combat.json` (barks) | Barks only at turning points, by chance; "is hurt, for 2" |
| What you know | discoveries and observations that teach | The teaching observation is told when it teaches; notes keep their sentence |

## Before and after

Each of these was met in play this mission and fixed at its source.

1. A priest who has never met you, before: "Sienna knows you before you are close, and comes to meet you. 'I wondered
   if you'd come this way.'" After: "'You've come a long way to find somebody,' says Sienna. 'Is it me?'"
2. Your mother, before (a manner line beat the kin line by chance): "Jocelyn looks at you for longer than is
   comfortable. 'Well?'" After: "Jocelyn looks at you as if counting the years you have been away, and then just
   holds on to you a moment."
3. A neighbour, before: "Glen looks up, and puts her hands still, and waits for you to say what you want." After:
   "'You're back, then,' says Glen, as if you had been gone a week and not three years."
4. A wonder, before: "There is visions that appear and disappear at the edge of your sight here." After: "At the edge
   of your sight there are people: a woman at a well, a man with a dog, children running. Look straight at them and
   they are not there." (All 43 of Orsino's wonders that Kyr runs now have such a look, written by hand in
   `data/generation/scenes/wonders.json`; Orsino gives an effect, not what it is to see one.)
5. A trap, before: "An intricate glyph etched into the wall, shimmering faintly." After: "A glyph is cut in the wall
   beside the way, and it shimmers faintly, as if it had only just been written."
6. A town, before: "It grew up beside the Albeex. It looks out over Seolforclaene. The fells rise behind it." After:
   "It grew up beside the Albeex, looking out over the Seolforclaene, with the fells at its back."
7. Setting out in rain, before: "You set out from the tarn in the full of the afternoon, the road pale with dust."
   After: "You set out from the tarn in the middle of the afternoon, and the rain sets out with you."
8. A scree path, before: "…and a cairn now and then to say you are still on the road." After: "…still on the path."
9. A summer moor, before: "A stoat in its winter white bounds across the snow." After: "A grouse gets up out of the
   heather at your feet and goes off low, scolding."
10. A clue, before: "Noted: The grey dog came home caked in black ditch-mud, the off forefoot cut as if on iron".
    After, told as you find it: "Under your hand her coat is stiff with dried black mud to the belly: ditch-mud, not
    road dust, as if she had lain a long time somewhere low and wet. The pad of the off forefoot is cut clean
    across, the way iron cuts."
11. A fight, before: "Wenna takes 2 physical." After: "Wenna is hurt, for 2."
12. A barrow, before: "On the stone across the entrance, in the old script: FEN HOWE. … This is Fen Howe." After: the
    stone says it once.

Earlier in the mission (598686e): a shrine no longer describes its altar as "a slab of the old stone" and then "cut
from the first tree felled" (seats and histories carry material tags and agree); weather lines no longer assume a
green; a telling greets once.

## Rhythm and memory

- **Journeys** are a sentence or two: setting out, the land, the light going if it goes, coming in sight. When every
  line that fits has been said, a looser fit not yet said comes before a close one said again, and then the one said
  longest ago (`Voice.tiers`, `Editor.choose`, `Editor.recency`).
- **People remember**: a second address is an "again" line; a question asked is marked "asked" on the page; a
  creditor stops being one when paid; someone you helped becomes a friend.
- **Places remember**: lines not seen before at a place seen before are marked fresh; a wonder met is told as it is
  after ("There is nothing at the edge of sight now").
- **Comedy** stays where it was earned: "The grey dog rolls over at once and shows you her belly. It is not a
  dignified dog"; a drover "shouting at a hedge. One of the cattle has gone through it and is somewhere on the
  other side, being a cow"; a sheep that watches you "as if you were the one who had strayed".

## Barks without chatter

Combat barks come only at a turning point (a fall, a kill, a telling blow, a flight, a miss), by chance, never the
same line twice in a fight; three animal greetings at once are told as one. Companions speak at places their
author or table gives them a word for (Orym at a carved door: "Whoever made that prayed to something. I would
like to know what."), not at every step.

## The editor's tools

- `bin/voice.ts` and `VoiceReview`: every voice line in every person it can be said of, with faults (doubled words,
  verbs out of agreement, blanks left unfilled). The journey's new `{way}` was caught here before it shipped.
- `test/narration-audit.test.ts`: a seeded walk through fresh countries reading the page as told; nothing said twice
  on one page, nobody speaking who is not there, no animal speaking. It caught a goat saying "You know where to find
  me" and a wonder told twice.
- `test/prose-fit.test.ts`: nothing said in a settlement mentions an inn, a green, a shop or a shrine it has not got.
- `src/world/world-audit.ts`: every story can be found and finished.

## What is still weak

- The voice is consistent but narrow: one narrator, plain and wry, for every country.
- Speech is mostly single lines; few people have more than two things to say, and they do not answer each other.
- Generic tries ("Listen at the letters round the door") still read as a game's menu, not a person's thought.
