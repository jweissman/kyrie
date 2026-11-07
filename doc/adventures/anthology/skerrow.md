# The Light on Skerrow Holm

*Adventure VII of the anthology. A horror and a love story, in a lighthouse at the end of a tidal causeway. Province `skerrow`, east of the first country, beside marsh, forest, hills or frost. 7 November 2026.*

## What it is

A causeway dries for three hours at noon. At the end of it stands a lighthouse, and the company crosses because the road goes that way and because a notice said they could be back by two. The sea comes in over the sands behind them. They are on the rock until the next low water, and the next low water is the day after.

Seven people are on the rock besides the company: Edmund Seddon the keeper, Hettie Marram (a widow who comes every year on the anniversary), Gaff Mullen (a loud man, with a dog called Sprat), Piers Tolland (a clerk of the Tide Board with a notice he has not delivered), Corrie Fenwether (a rope-seller who read his letter over his shoulder), Dib Wyke (the keeper's boy), and Mr Lowrie (the man the sea gave back). Under the tower, in the cistern, something with the sea's patience calls people by name, in the voice of someone they have lost, when the lamp is low and the fog bell is not ringing and the tide is in.

It is a *tide_caller*, a new aberration in `data/catalog/monsters.json` (no portrait; none of its habitats is a place a generated world grows). Nothing tells the player the rule. They infer it:

* It calls only while it is dark, the tide is in, and the bell has been silent for a while (the bell is Seddon's: ten watches of silence, four of ringing).
* It comes up the stair when the lamp is out, and it goes back down when the lamp is bright again.
* An answer to a voice is fatal. Saying nothing, or keeping someone's hand, is not.
* The one thing Seddon says plainly is "If anybody speaks outside, say nothing."

The night is the second act; the *day that is not* is the fog in the morning, which hides the sands and the causeway and the man who took the rope; and the second night is what the party faces if it cannot cross at noon.

## Why it is not the others

* **Time is the lamp's oil and the tide**, not money, rations or a pursuer. The tide is a Thing keyed to the hour (low 11 to 14), the fog thins only from one to two, the lamp burns a measure down every watch, and the keeper refills it only while he is at his post.
* **The threat is a rule, not a stat block.** Nothing in the adventure has to be fought. The Caller can be hidden from, bargained with (a false answer rings it back for eight watches), driven off (holy water in the store, a pipe in Hettie's basket) or simply never answered.
* **The people are the clock.** At fixed counts of calls Gaff, Dib and Hettie answer the voice and go down the stair unless the player has kept them: Gaff hushed, Dib watched, Hettie held or loved. Each of the three is a decision the player makes in the conversations of the evening.
* **The romance is between two non-player people, and the player is the weather they have to get through.** Seddon has loved Mrs Marram for eleven years and never said it. The `love` measure on the tide is raised by the questions the company puts to her over tea, by taking her up to the lamp room, by watching his hands. Four points are enough for the keeper to come down the iron stair after her when she goes; fewer and he does not. Whether he says it is the player's doing, and the ending knows.
* **No ending is a settlement.** Nobody is tried, the Board does not reform, the cistern is not found. Six endings, and the worst of them is two people drowned in the dark on a rock.

## The map

```
 shore_road ── sands_mid ── landing ── boat_shed
   (causeway_a)  (causeway_b)   │
                                ├── bell_hut   (the east point; open on three sides)
                                └── kitchen ── store ── cistern (under)   [steps, a grating]
                                       │
                                  keeper_room
                                       │
                                  lamp_room ── gallery
```

* `shore_road`: the slipway and the notice. The party stands here at 11:00 with the sea out and the posts going into grey.
* `sands_mid`: the middle of the causeway. Reached only while the tide is low. In fog without a line it is the hazard.
* `landing`: stone, winch, the sea closing over the posts behind.
* `kitchen`: the tea, the range, seven coats on seven pegs; every conversation of the evening happens here.
* `store`: oil flasks, a shelf, the cistern stair.
* `cistern`: the Caller's lair, reachable but never wanted.
* `keeper_room` and `lamp_room`: where the night is kept. The lamp room's text changes with the lamp (bright, low, out).
* `gallery`: the outside walk, where the fog is.
* `bell_hut`: where the bell hangs and Lowrie sits.

## Pressure and play

* Crossing: the tide is the gate. Before eleven it is shut. After noon the fog is thin for an hour and the sea is closing; a party that goes at eleven in fog without a line is lost in the mud (`mud_lost`, `lostTold`). A line pegged along the posts, or a bearing taken on the bell, is what makes the crossing safe.
* The evening: conversations with every one of the seven, five of them questions put to the player (Seddon's, Hettie's, Gaff's, Piers's, Dib's), each with answers that matter at night.
* The night: calls every six watches while the Caller is hunting. Five different sound `Observe`s, so the first call is not the fifth. The lamp must be filled (a flask costs a watch of work) or Seddon must be allowed to; when he follows Hettie he cannot.
* The morning: the fog; the party chooses whether to leave at eleven, with or without those who can be brought, along a line Dib will peg.
* The second night: if no one crosses, the sea comes back and the lamp has to be kept again.

## Endings

| Title | How |
|---|---|
| Everyone Out | The lovers are told, the three who could be lost are kept, Seddon comes over the sands with Hettie. |
| The Light Goes On | Seddon says it, Hettie stays, the company crosses alone. |
| Alive, and Apart | Hettie is held through the night by a hand; Seddon never speaks. |
| The Keeper's Light | Nobody stops Hettie; the keeper keeps his post. |
| Down to the Water | He has said it, and it was not enough: both go down. |
| The Second Dawn | The company stays a second night and sees the second morning, and the thing is still there. |

## Tested

`test/skerrow.test.ts` plays from the road end, by label, with no teleport and no `put`: the lint; the shut causeway and the lost party; each of the endings above; a save and reload after the evening. The fixture `test/fixtures/skerrow/journey.json` holds the shared routes. The only help a spec takes is `j.roll('pass')` before a skill check, as other anthology specs do.

## 1. Content that works in play

* The tide, the fog and the line; the lamp's oil as a clock; Seddon's bell as the rule's only visible counter.
* All seven people, their topics and their fates: Gaff's, Dib's and Hettie's decisions at call counts two, three and four.
* The romance as a measure (`love`) that the player raises by what they ask and where they go, and that decides whether Seddon follows.
* Six endings, reached by label.
* Holy water and the pipe as ways to drive the Caller off; the false answer as a way to turn it for eight watches.

## 2. Authored content present but not reachable (or not specced)

* **Driving the Caller off with holy water or the pipe** is authored (`splash_caller`, `drive_it_off`) and lints, but no spec plays it.
* **The false answer** (`answer_false`) is authored; the spec plays only its absence.
* **Piers leaving alone at day-two eleven** (`piers_leaves`) is reachable by waiting but the spec does not play it.
* **Lowrie's ring topic** (`lowrie_done`, `lowrie_walks`) is reached in the explorer, not in the specs.
* **The bell action** (`ring_bell`) is authored for a party that wants to lengthen the silence; it is not played.
* **The oil actions** `fill_lamp` and `bring_flasks` are played only in the explorer's long routes.

## 3. Actions or consequences the engine cannot yet represent

* **Hearing a name.** The Caller calls "in the voice of someone you have lost", but a sound `Observe` is the same text for every listener; it cannot address a companion by name or the party's own dead. The calls are written to be true for everyone.
* **A person who is removed in the dark with a sound the player hears and cannot attribute.** The fates are told by `Observe` the next morning, not at the moment.
* **A hand held through a night.** `hold_hettie` is one action with a skill check; the night is not played watch by watch with the hand in it.
* **A stranger's fear.** The lamp's brightness has no effect on a companion's morale (there is no morale measure in the shared systems).
* **Two things at once in a room at night**: a person answering in the kitchen while another is on the stair.

## 4. Existing assets whose integration is incomplete

* `unlit`, torches and the lantern: the tower is lit, so the shared dark-room mechanism is not used. The lamp is a Thing with three states instead; this is deliberate, but it means a party's own torches have no role.
* Hiding and slip-past: the Caller does not search, so there is nothing to slip past. Hiding is "not answering".
* Orsino items: holy water is used; the rest of the catalog is not.
* The new species has no portrait and no habitat; the handbook lists it without either.
