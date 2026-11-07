# The Light on Skerrow Holm

*Adventure VII of the anthology. A horror and a love story, in a lighthouse at the end of a tidal causeway. Province `skerrow`, east of the first country, beside marsh, forest, hills or frost. First written 7 November 2026; reworked the same day after a hostile review (see "What the review changed").*

## What it is

A causeway dries for three hours at noon. At the end of it stands a lighthouse, and the company crosses because the road goes that way and because a notice said they could be back by two. The sea comes in over the sands behind them. They are on the rock until the next low water, and the next low water is the day after.

Seven people are on the rock besides the company: Edmund Seddon the keeper, Hettie Marram (a widow who comes every year on the night her husband went into the sea), Gaff Mullen (a loud man, with a dog called Sprat), Piers Tolland (a clerk of the Tide Board with a notice he has not delivered), Corrie Fenwether (a rope-seller who heard her sister in the cistern last year), Dib Wyke (the keeper's boy, taken in off a wreck) and Mr Lowrie (the man the sea gave back a month ago). Under the tower, in the cistern, something with the sea's patience calls people by name.

**The thing is a Thing, not a Person.** It cannot be fought, wounded or killed; there is no combat anywhere in the adventure. It has three states and a position (`caller`: in the cistern, on the stair, in the room), and every other rule reads where it is. It is the new species `tide_caller` in `data/catalog/monsters.json` (no portrait, no habitat) only as natural history; no module Person uses the species. That is an honest gap, listed below.

## The rule, and what shows it

The player is never told the rule. Everything that tells them is something they can see happen:

| What the player sees | What the engine is doing |
|---|---|
| By day nothing. At dusk, with the lamp bright, a knocking under the floor of the tower, twice, every hour or so. | `hunting()` (dark, tide in, and either no bell lately or the lamp out) with `state(lamp, bright)`: `knocks` only. A sound `Observe … within holm as sound`, told on any step that ends within seven watches of it, so no hour-long wait can pass it by. |
| When the lamp sinks to a blue bead, voices. Five of them, each nearer, each in a voice someone has lost. | `calling()` is `hunting()` and not a bright lamp; `the_call` raises `callN` every six watches; five sound `Observe`s (`within holm as sound`) tell it on the page. A spec asserts the text. |
| While the bell is ringing there are no voices, until the lamp is out; then the bell does not help. Seddon pulls a cord in the lamp room, four watches of every ten of the dark. | `bellRecent()` ends `hunting()` unless `state(lamp, out)`; the caller goes back to sea (`caller_sea`). The lamp is the clock; the bell is a respite while there is a lamp. |
| The wet glove on the keeper's sill, a print on every stair, the dog at the foot of the iron stair with her hackles up. | The caller's `state` text shows in the room it has reached: `below`, `stair`, `here`. Sprat's `Observe`s read `at(caller, keeper_room)`. |
| When the lamp is out the thing is in the room the company is in, and an hour and forty minutes later one of them answers it before they have decided to. | `caller_takes_*`: a party in a room the lamp no longer reaches is taken after `outAt + 10` watches, one per six watches (`strikes(taken_by_the_sea)` kills an ally). "Dark" here means the lamp's state, not a room's own light: the kitchen range does not save a party. The kitchen window shows the lantern dimming and going out. In the cistern, two watches. |
| Going outside at the time of a call offers "Answer the voice". Nowhere else does. | `answer_voice` and `answer_false` need `calling()`, a call in the last three watches, and the landing or the gallery. |

Seddon says one thing: *if anyone calls, say nothing.* The lamp and the bell are learned from what happens when they fail. Lowrie speaks only in riddles of the sea's keeping.

**The lamp is the clock.** It burns one measure an hour from arrival. Seddon refills it exactly once (`refills`), because after dark he will not go into the store (the hatch is there; he says so, at the lamp, when the oil runs short); after that the company must, from seven flasks in the store (four hours each). If they answered "No, we'd sooner sleep", Seddon says *touch it and you answer to me*, and the filling is not offered while he is at his post. An unkept lamp sinks about midnight, goes out about three, and the thing is in the kitchen or the lamp room by four. One flask when it goes out brings it back to *low*: the calls go on and the dark rooms are still dangerous, but the lamp room is not. Two keep it bright.

## Why it is not the others

* **Time is the lamp's oil and the tide**, not money, rations or a pursuer.
* **The threat has a position the company can see and a rule it can test.** It is not fought, and it does not strike wherever the party is.
* **The people are the clock.** At fixed counts of calls Gaff (two; one if he has been encouraged to be loud), Dib (three; four if he has said "it isn't him") and Corrie (two, unless she has been paid) answer the voice and go down the stair unless the player has kept them: Gaff hushed, Dib watched, Corrie promised that her sister will be spoken of (she sells the line at cost, and stays in her seat for the promise). Hettie's fourth call is the romance.
* **The romance is between two non-player people, and the player is the weather they have to get through.** Seddon has loved Mrs Marram for eleven years and never said it. A measure (`love`, on the tide) rises with what the company does, and the kitchen shows it at each step (a second cup put out; the stopped clock wound; Seddon looking at the cup, not the table; Seddon half rising whenever she crosses the room). At four the keeper will go down the stair after her and bring her up; below four he goes after her and does not come up. When she walks, the room shows which: *Seddon is at the head of the stair; his hands will not settle*, or *his jersey is already inside out*. The company has two watches to put a hand on his arm and keep him at the lamp (`hold_orrin`).
* **No ending is a settlement.** Nobody is tried, the Board does not reform, the cistern is not found.

## The map

```
 shore_road ── sands_mid ── landing ── boat_shed
   (causeway_a)  (causeway_b)   │
                                ├── bell_hut   (the east point; the bell on its beam, a cord running to the tower)
                                └── kitchen ── store ── cistern (under)   [a hatch, a ladder]
                                       │
                                  keeper_room
                                       │
                                  lamp_room ── gallery
```

* `shore_road`: the slipway and the notice. The sea is out from eleven to two.
* `sands_mid`: the middle of the causeway. Reached only while the tide is low. In fog without a line it is the hazard. The fog is thin one to two only; a party that sets off at eleven is lost at noon.
* `landing`: stone, winch, the sea closing over the posts behind. The outdoor place from which a voice may be answered.
* `kitchen`: the tea, the range, seven coats on seven pegs; every conversation of the evening happens here.
* `store`: oil flasks, holy water, a hatch to the cistern.
* `cistern`: where the thing lies while the lamp is bright, and where a party that goes down at night is taken.
* `keeper_room`: the bunk, the wet glove, Mr Lowrie. Where the thing waits when the lamp is low.
* `lamp_room`: the lamp, the bell-cord, Seddon by night. Its text changes with the lamp (bright, low, out).
* `gallery`, `bell_hut`, `boat_shed`: outdoors.

## Pressure and play

* Crossing: the tide is the gate. A line pegged along the posts (a rope: the party may bring one, or buy Corrie's) or a bearing taken on the bell makes the crossing safe in fog.
* The evening: conversations with every one of the seven, six of them questions put to the player, each with answers that matter at night (oil given or withheld; Gaff loud or hushed; Dib doubting or watched; Hettie's love; Piers's notice now or at dawn; Lowrie's name kept or all of them).
* The night: knocks, then calls. The lamp must be filled. The company decides where to wait, who to keep, and whether to let Seddon go.
* The morning: the fog; the company chooses whether to leave at eleven with or without those who can be brought, along a line Dib will peg.
* The second night: if no one crosses, the lamp has to be kept again (flasks suffice for exactly this, if none are wasted).

## Endings

| Title | How |
|---|---|
| Everyone Out | The lovers are told, everyone who could be lost is kept, Seddon comes over the sands with Hettie. |
| Together, and the Rest Lost | As Everyone Out, but one of Gaff, Dib, Piers, Corrie has answered a voice. |
| The Light Goes On | Seddon says it, Hettie stays, the company crosses alone. |
| Alive, and Apart | Hettie is held through the night by a hand; Seddon never says it. |
| The Keeper's Light | Nobody stops Hettie; the keeper keeps his post. |
| Down to the Water | He has said it, it was not enough to hold her, and he goes after. |
| The Keeper's Last Winter | As The Keeper's Light, but the Board's notice was put into Seddon's hand the evening before (Piers told tonight, or at dawn): he keeps the light for eighteen days. |
| The Second Dawn | The company stays a second night, keeps the lamp, and sees the second morning; the thing is still there. |

## What the review changed

A hostile review found the first version hollow. Changes in answer:

1. The hunter was a Level 4 `Person` that one attack killed, and the calls ran off a query that did not mention it. It is now a `Thing` that nothing can attack; its location, by lamp state, is what the telegraphs and the takings read. Killing it is not an option.
2. The lamp rule was fiction. Now calls need `not state(lamp, bright)`; the lamp state moves the thing; a lamp left out costs a party member; Seddon refills once; the party fills from a finite store.
3. The party was never hunted. A party in a dark room is taken after a delay; the "answer" button appears only out of doors at the moment of a call; the party-wide lock is gone.
4. Rules were stated. Seddon says only "say nothing if anyone calls"; Lowrie no longer recites the rule; Gaff's question no longer says it.
5. The Board's notice no longer carries the happy ending. Seddon goes for Hettie, not the Board.
6. Dead answers were given readers or cut (round two: Corrie's line is bought with a promise, Piers's notice decides an ending, Lowrie leaving unrung counts as lost): Gaff's laugh, Dib's doubt, Lowrie's name, Piers's two answers; Hettie's promise, Seddon's refusal-to-stay and the goodbye to Lowrie were cut. Corrie now sells a line (a rope for the sands) and answers the second call unless she has been paid.
7. The hard persuasions are tried once on failure.
8. The romance is visible in the kitchen at every step; Seddon's chase is a choice the company can make or stop.
9. Seven endings, each played by title; a failed-roll path.
10. Chronology: the date is the night of the drowning ("tonight, eleven years since, at ten past nine"); the Board's notice says "first of next month" (eighteen days); the bell is four watches ringing and six silent; Seddon rings by a cord from the lamp room, so he is seen to ring.

## Tested

`test/skerrow.test.ts` plays from the road end, by label, with no teleport and no `put`: the lint; the shut causeway and the lost party; the lamp and the thing (knocking when bright, on the stair when low, in the cistern when bright again), with the sound text of the knock and of every call asserted on the page; a dark lamp that kills; a voice answered out of doors; the false answer; holy water on the store shelf; the bell once an hour at a cost; flasks carried up in one trip; Seddon forbidding the lamp; Mr Lowrie ringing for two hours and gone; Corrie lost when unpromised and kept when promised; each of the eight endings by title; a failed ask not repeatable; Seddon held at his lamp; and a save and resume. The only helps a spec takes are `j.roll('pass')` or `j.roll('fail')` before a skill check, and `=until` waits.

## What round two changed

The second review found the sounds were never heard: the `Observe`s were anchored `near tide`, a Thing on the sands, so no one on the holm perceived them. They are now `within holm as sound`, windowed so a one-hour wait cannot pass them by, and a spec asserts every text. It also found the bell nullified the lamp (it now needs `not bellRecent()`, costs two watches, and does not hold the thing below once the lamp is out), Lowrie's ring a free night (now two hours), the oil unsignalled for those who said no (Seddon forbids the lamp aloud), Seddon letting his own lamp die (he will not go into the store at night), the false answer punishing success (it no longer advances anyone's fate), Corrie's rescue by transaction (she is kept by a promise about her sister), Piers's notice with no consequence (the eighth ending), the holy water unsignalled (a labelled flask on the shelf), and no lamp information from the kitchen (the window dims). Eight endings; the specs assert text and all of the above.

## 1. Content that works in play

* The tide, the fog and the line; the lamp's oil as a clock; the bell as the only counter the company can see.
* All seven people, their topics and fates: Gaff's, Dib's and Corrie's takings at call counts.
* The romance as a measure the player raises by what they ask and where they go, shown at each step, deciding whether Seddon follows.
* Seven endings, each reached by label.
* A thing that cannot be fought, that moves with the lamp, that takes the party in a dark room.

## 2. Authored content present but not reachable (or not specced)

* **The torch** (`drive_it_off`) is authored and lints, but no spec plays it; holy water and the false answer are specced.
* **Piers's "wait till morning" notice path** is reachable but not specced.
* **`lowrie_walks`** (Lowrie leaving at the fifth call when never asked) and **`piers_leaves`** are reachable but not specced.

## 3. Actions or consequences the engine cannot yet represent

* **Hearing a name.** The Caller calls in the voice of someone you have lost, but a sound `Observe` is the same text for every listener; it cannot address a companion or the party's own dead. The calls are written to be true for everyone.
* **A person removed in the dark with a sound the player hears and cannot attribute.** The fates are told by the rule's `says` the moment they happen, not as a half-heard sound.
* **A party member alone.** The party is one group at one place, so "the one who is alone, in the dark, off the lamp" is a room, not a person: the thing takes *one of the company* in a dark room, not a companion who has wandered off.
* **A companion's fear.** The lamp's brightness has no effect on a companion's morale (no morale measure in the shared systems).
* **The company's own stake.** The company wants only to live and to leave. A reason of its own to be on the rock (a debt, a name in the cistern) is not representable: the sound `Observe` cannot name one of three chosen companions.
* **Two things at once in a room at night**: a person answering in the kitchen while another is on the stair is two rules, not a scene.

## 4. Existing assets whose integration is incomplete

* `tide_caller` is in the catalog (no portrait, no habitat) and used by no module Person. The adventure's creature is a Thing. The species is natural history only, and a handbook entry for a creature the player can never meet is odd.
* `unlit`, torches and the lantern: the tower is lit, so the shared dark-room mechanism is not used. The lamp is a Thing with three states instead. A torch does appear: `drive_it_off` uses `capable(actor, flame)`.
* Hiding and slip-past: the Caller does not search, so there is nothing to slip past. Hiding is "not answering" and "not being in a dark room".
* Orsino items: holy water is used; the rest of the catalog is not.
