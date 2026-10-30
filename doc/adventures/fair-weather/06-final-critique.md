# Fair Weather — Stage 6: the second critique, what was revised, and what is still wrong

*Written after the module was built, played and tested, as an editor reading a finished work. The first critique is
[03-critique.md](03-critique.md); this one is harder on the result than that one was on the plan.*

## What works (as played)

- **The tide is the game.** The best thing in Fair Weather is that the player plans by the water. You walk out on the
  ebb with a guide, win a dog with thrown bread, work an hour in the hold, and the tide-bell rings, and the men stop
  as if a string had been cut; and if you stayed to sound the channel, the sea is round your waist and the withy
  behind you goes under. That sentence was written to be read, but it is also what happened, mechanically, in the
  first journey I played. A careless itinerary strands you on the Holm, on the wreck, on Inish. Malachy's rule —
  "walk out on the ebb and sail home on the flood, and never the other way about" — is advice a player actually needs.
- **The confession.** Loveday, with or without the spectacles, asking "Hender. Did you put the sea in my oil." It is
  a mind changed by a person, as the collection survey asked, prepared three ways (his ears went red when he lied as
  a boy; she says she will not have anyone else say it; he cannot lie to her) and paid off in one line of action.
- **The dog in the loft.** The joke is structural, not decorative: the whole town's winter on a wet dog whose name is
  also the Lord Admiral's, the inn's, and the figurehead's. The loft roars; the Reeve writes the words in the voice he
  uses for numbers; the laughter stops as if cut.
- **The world moves.** The sale at nine, the Cawse lads at low water, the offer, Constance on the evening flood, the
  Supper, Piran's climb at nine at night, the Court at four whether or not you are there, the drowned on the third
  ebb, the packet on the fourth evening. Left alone, Piran falls; left alone, the dog is netted and penned (and the
  Reeve, it turns out, could not drown it).
- **Small stories that are not clues.** Ewan's letter changes Ewan and nothing else. The supper is only a supper.
- **Ordinary entry works.** In a generated world an innkeeper two or three countries away says, of a town the company
  has never heard of, "They say there's a dog", and the coast road comes over the down.

## What I am not satisfied with

1. **The Pilots is still the collection's favourite ending.** The survey's sharpest charge was that every work
   resolves by restoring the old practice rightly understood. The Pilots is exactly that: the station reopened, the
   leading mark written down. I moved its agency to Kerensa and its money to Constance, and the epilogue knows Skeel
   does not know how to feel; but it is the Chesterton's fence ending again, and it is the one the module rewards
   most (800 experience). An honest revision would make it cost something real: Hender's daughter piloting ships past
   the bank her father wrecked one on, with the town's resentment, in a hungry first winter, and Malachy dead by
   spring. It does not.
2. **Hender is seen almost only in his offices.** The design gave him an inner life; the build shows it in the
   confession, the offer, the dog he could not drown, and the board he oils. There is no scene of him alone that the
   player can come upon: walking the Strand at night, say, where he walked from the boy. That scene is the one the
   module most lacks.
3. **Constance is a function with good lines.** Two topics, a letter, a ring, a sum done in a margin, a kneeling on the
   sand. Her firm's ruin is told, not felt. Her grace is a single roll.
4. **The mystery is not one.** The Reeve's bruised eyes are in his first description, and Nye describes "marks under
   his eyes". That was a choice ([03-critique.md](03-critique.md): the question is what you do, not who), but a player
   who wanted a mystery will feel the work tip its hand on the first afternoon.
5. **The Court is still a deadline.** It is a better scene than a vote, and the town goes on after it, but the three
   days are shaped by four o'clock on the third, as every other work in the collection is shaped by its hearing.
6. **The voice is the house voice.** Second person, present tense, plain declaratives, the action beat after the line.
   The survey asked for different narrators. Fair Weather has a little more comedy and a little more weather, and the
   same narrator.
7. **Thin places.** Working the climbers' ropes is a die roll with a paragraph. The sale is three bids. Bartle's wheel
   is a coin and a sentence. They are livelihoods, which the commission asked for, but not stories.
8. **Danger is mostly water.** The flood, the sand, the Gut and the wind on the edge are honest and frequent; the
   fights (the Cawse lads, Ewan) are small, and the lads' fight kills where it should bruise ([friction 17](friction.md)).
   There is no encounter that cannot safely be approached as a routine fight *except* the sea.
9. **The four-day spring cycle** is a simplification that a sailor would laugh at.

## The record of revisions (conception → final)

| From | To | Why |
|---|---|---|
| A great conger in the Gut | The Gut's current, the Sill at slack | What Tessary Owes has an eel-mother in a tidal channel; the sea itself is the better danger |
| The Court at noon | At four, "on the flood, so the island men can come" | The harbour dries at low water: Ewan could not bring the boy by boat at noon. The tide shaped the institution |
| Eight small stories feeding the light | Three cut loose (letter, supper, ropes) | Charge 1 of the first critique |
| Soundings only after Malachy asks | Soundings any time with a lead-line | A player with a lead-line should be able to use it before anyone tells them why |
| The Pulpit only by the face (climbing) | Also along the edge (no skill; the wind strikes) | Builds without climbing; and the edge is a better scene |
| Lore, woodcraft, insight, deception unused | Jacob's chart; sitting downwind of the dog; Hender's hands; lying about the drowning | The build matrix had holes |
| Kerensa's testimony told and never used | Asked for in the loft (grave): she stands, or walks out and takes the gig | A character should be able to change her mind in front of the player, and be wronged by being asked |
| Constance only takes | She can be asked to leave a part, fair if you did right by her brother | Minds moved by people |
| An exposed Reeve after "wreck" left the ship wreck | A false light voids the wreck, older than the charter | Inconsistency found in play |
| Endings at the Court | Endings when the packet sails | So the third ebb, Matthew found, the names cut, could be played |
| `among: independent` beside fens and forests | North beside fen, forest and frost, last in the list | It moved six other adventures in the test seeds ([friction 1](friction.md)) |
| The lads warriors with swords | Commoners with fists; Skeel refuses a company that kills them | A village fight killed the protagonist in one blow |
| The sale goes on after the Reeve confesses | No sale; Jack Cawse sells off what will not keep | A confessed man does not stand on a barrel |

## What has been verified, and how much

- **Implemented**: 17 Kyr files, about 1,690 lines; one entry in `countries.json`; nothing else shared.
- **Tested mechanically**: 16 journeys (`test/skeel.test.ts`, `test/skeel-placed.test.ts`): all seven
  endings (*Wreck* itself only in the placed test), a thief's build, the tide, the Craigs, the lads, the
  world entry and a return to Fore Street after. Lint clean.
- **Encountered in ordinary play** (CLI, reading every page): the opening, the town, the tide, the stern at night, the
  Craigs, the Skerry, Inish, the Court four ways, the third ebb. Transcripts in [playtest/](playtest).
- **Not played at all**: the night watch with Loveday; the purse; Kerensa refusing in the loft; pushing past Ewan;
  the kind lie and the unread letter; Matthew's chest forced; Admiral or Kerensa as companions after; Constance's
  grace; a monk's or a mage's build; the browser (see README).
- **Evaluated as satisfying**: by me, of my own work, which is worth little. The tide, the confession and the dog are
  the parts I would defend to a stranger.
