# The Light on Scarth Holm

*Adventure VII of the anthology. A horror and a love story, in a lighthouse at the end of a tidal causeway. Province `skerrow`, east of the first country, beside marsh, forest, hills or frost. First written 7 November 2026; reworked the same day after a hostile review (see "What the review changed").*

## What it is

A causeway dries for three hours at noon. At the end of it stands a lighthouse, and the company crosses because the road goes that way and because a notice said they could be back by two. The sea comes in over the sands behind them. They are on the rock until the next low water, and the next low water is the day after.

Seven people are on the rock besides the company: Edmund Seddon the keeper, Hettie Marram (a widow who comes every year on the night her husband went into the sea), Gaff Mullen (a loud man, with a dog called Sprat), Piers Tolland (a clerk of the Tide Board with a notice he has not delivered), Corrie Fenwether (a rope-seller who heard her sister in the cistern last year), Dib Wyke (the keeper's boy, taken in off a wreck) and Mr Lowrie (the man the sea gave back a month ago). Under the tower, in the cistern, something with the sea's patience calls people by name.

**The thing is a Thing, not a Person.** It cannot be fought, wounded or killed; there is no combat anywhere in the adventure. It has three states and a position (`caller`: in the cistern, on the stair, in the room), and every other rule reads where it is. It is the new species `tide_caller` in `data/catalog/monsters.json` (no portrait, no habitat) only as natural history; no module Person uses the species. That is an honest gap, listed below.

## The rule, and what shows it

The player is never told the rule. Everything that tells them is something they can see or hear:

| What the player sees | What the engine is doing |
|---|---|
| In the evening, with the tide in, a knocking under the floor of the tower, twice, every hour or so. | `hunting()` (dark, tide in, not sent away, and either no bell lately or the lamp out) before midnight: `knocks`, a sound `Observe … within holm as sound`, told on any step that ends within seven watches of it. |
| From midnight to six, voices. Five of them, each nearer, each in a voice someone has lost. They come whatever the lamp is doing. | `calling()` is `hunting()` and the small hours; `the_call` raises `callN` every six watches; five sound `Observe`s tell it on the page. A spec asserts the text. A bright lamp does not stop them: it is not the lamp that is being tested then, but Gaff, Dib, Corrie and Hettie. |
| While the bell is ringing there are no voices, until the lamp is out; then the bell does not help. Seddon pulls a cord in the lamp room, four watches of every ten of the dark. | `bellRecent()` ends `hunting()` unless `state(lamp, out)`; the caller goes back to sea (`caller_sea`). |
| The wet glove on the keeper's sill, a print on every stair, the dog at the foot of the iron stair, or under the table with her eyes on the open cistern door. | The caller's `state` text shows in the room it has reached: `below`, `stair`, `here`. Sprat's `Observe`s read where it is. |
| Where the thing can reach follows the lamp. | `exposed()`: with the lamp bright, only the sea-side rooms (landing, boat shed, bell hut, cistern); sunk, the store and the keeper's room at once, and the kitchen, lamp room and gallery once the lamp has been low for an hour; out, every room. The company is hunted *where it is* (`caller_hunts`); after half an hour there, one of them answers it (`caller_takes_*`, one per hour at most). The lamp room is a refuge only while the lamp is *bright*, which costs the company a flask about every four hours. Moving between floors takes a watch. |
| Holy water, or a flame held out, sends it down. | `repelUntil`: holy water two hours, a torch one, a lie eight watches; and `hunting()` honours it whatever the lamp is doing. A torch is tried once between noons. The bell is not like these: the company may ring it once between noons (`ringN`), at a cost of two oil, so the bell cannot be chained to put the night off. |
| Going outside at the time of a call offers "Answer the voice". Nowhere else does. | `answer_voice` and `answer_false` need `calling()`, a call in the last three watches, and the landing or the gallery. |

Seddon says one thing: *if anyone calls, say nothing.* The lamp and the bell are learned from what happens when they fail. Lowrie speaks only in riddles of the sea's keeping.

**The lamp is the clock.** It burns one measure an hour from arrival. Seddon refills it exactly once (`refills`; twice if Piers was asked to keep the notice till morning and sits up with him), because after dark he will not go into the store (the hatch is there; he says so, at the lamp, when the oil runs short); after that the company must, from seven flasks in the store (four hours each, and the lamp can overshoot its cap by a flask's worth). If they answered "No, we'd sooner sleep", Seddon has said *I'll not have the lamp touched by anyone who'd sooner sleep*, and the filling is not offered until the first call, when he relents aloud (*Oil's in the store. I'll not say I was wrong.*): a hard line of play, not a dead end. An unkept lamp sinks about midnight and goes out about three. Staying in the lamp room is not free: the lamp has to be refilled **before** it sinks (around midnight and again about 03:30), or the thing climbs to it within the hour. **Keeping it bright does not skip the night**: the calls come regardless, and the people are what they test.

## Why it is not the others

* **Time is the lamp's oil and the tide**, not money, rations or a pursuer.
* **The threat has a position the company can see and a rule it can test.** It is not fought, and it goes where the company goes, so hiding costs something: outdoors it is the first place, a dark tower the second, and the lamp room the only one that is safe, while there is a lamp to keep.
* **The people are the clock.** At fixed counts of calls Gaff (two; one if he has been encouraged to be loud), Dib (three; four if he has said "it isn't him") and Corrie (two, unless she has been paid) answer the voice and go down the stair unless the player has kept them: Gaff hushed, Dib watched, Corrie promised that her sister will be spoken of (she sells the line for two gold, and stays in her seat for the promise). Hettie's fourth call is the romance.
* **The romance is between two non-player people, and the player is the weather they have to get through.** Seddon has loved Mrs Marram for eleven years and never said it. A measure (`love`, on the tide) rises with what the company does, and the kitchen shows it at each step (a second cup put out; the stopped clock wound; Seddon looking at the cup, not the table; Seddon half rising whenever she crosses the room). At four the keeper will go down the stair after her and bring her up; below four he goes after her and does not come up. Without a declaration the company can call her back from the landing once (`stop_hettie`: persuasion, and only those she has let sit with her, a love of two); with a failed try, she goes. When she walks, the room shows which: *Seddon is at the head of the stair; his hands will not settle*, or *his jersey is already inside out*. The company has two watches to put a hand on his arm and keep him at the lamp (`hold_orrin`).
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
| The Keeper at His Lamp | As The Keeper's Light, but Seddon had spoken, and the company kept him at his lamp while Hettie walked (`hold_orrin`): he did not forgive it. |
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
9. Eight endings (now nine), each played by title; a failed-roll path.
10. Chronology: the date is the night of the drowning ("tonight, eleven years since, at ten past nine"); the Board's notice says "first of next month" (eighteen days); the bell is four watches ringing and six silent; Seddon rings by a cord from the lamp room, so he is seen to ring.

## Tested

`test/skerrow.test.ts` (42 specs) plays from the road end, by label, with no teleport and no `put`. It covers: the lint; the shut causeway and the lost party; the lamp and the thing (on the stair when low, in the cistern when bright again), with the sound text of the knock and of the first four calls asserted on the page; a lamp kept bright all night that still lets the calls come; the boat shed and the keeper's room as no hiding place; the lamp room taken when the lamp is let sink; a dark lamp that kills; a voice answered out of doors; the false answer; holy water in the kitchen with the lamp out; a torch (a failed try that cannot be repeated, and a pass); the bell once between noons at a cost; flasks carried up in a trip; Seddon forbidding the lamp and relenting; Dib's line refused at high water and accepted at low; a declaration not rolled for when the keeper's trust is earned; a failed ask not repeatable; Hettie called back once, and not by a company she has not let in; Seddon held at his lamp (ending "The Keeper at His Lamp"); Mr Lowrie ringing for two hours, and walking at the fourth call when not asked; Piers following when promised, and told "till morning"; Corrie lost when unpromised and kept when promised; each of the nine endings by title (the ninth, "The Second Dawn", by a two-night route); and a save and resume. A further spec plays the full romance route on six **unforced** seeds, with failed rolls skipped rather than forced: all six reach an ending, by two roads (Everyone Out on two seeds, The Keeper's Last Winter on four). The fifth call is not specced: it is reached only when the lamp is out most of the night.

## What round two changed

The second review found the sounds were never heard: the `Observe`s were anchored `near tide`, a Thing on the sands, so no one on the holm perceived them. They are now `within holm as sound`, windowed so a one-hour wait cannot pass them by, and a spec asserts every text. It also found the bell nullified the lamp (it now needs `not bellRecent()`, costs two watches, and does not hold the thing below once the lamp is out), Lowrie's ring a free night (now two hours), the oil unsignalled for those who said no (Seddon forbids the lamp aloud), Seddon letting his own lamp die (he will not go into the store at night), the false answer punishing success (it no longer advances anyone's fate), Corrie's rescue by transaction (she is kept by a promise about her sister), Piers's notice with no consequence (the eighth ending), the holy water unsignalled (a labelled flask on the shelf), and no lamp information from the kitchen (the window dims). Eight endings; the specs assert text and all of the above.

## 1. Content that works in play

* The tide, the fog and the line; the lamp's oil as a clock; the bell as the only counter the company can see.
* All seven people, their topics and fates: Gaff's, Dib's and Corrie's takings at call counts.
* The romance as a measure the player raises by what they ask and where they go, shown at each step, deciding whether Seddon follows.
* Nine endings, each reached by label.
* A thing that cannot be fought, that comes to the company wherever it hides, and that the lamp, the bell, holy water and a flame each hold off in their own way.

## 2. Authored content present but not reachable (or not specced)

* **A torch that works** (`drive_it_off` succeeding) is specced only as a failed try that cannot be repeated; a pass is not played.
* **`piers_leaves`** (Piers going alone at day-two eleven) is reachable but not specced.
* **`chase_wins`/`chase_loses` with a bell-held Seddon** are played; a Seddon who follows and loses is the Down to the Water route.

## 3. Actions or consequences the engine cannot yet represent

* **Hearing a name.** The Caller calls in the voice of someone you have lost, but a sound `Observe` is the same text for every listener; it cannot address a companion or the party's own dead. The calls are written to be true for everyone.
* **A person removed in the dark with a sound the player hears and cannot attribute.** The fates are told as sound over the whole holm (a door, a voice, a splash) with the visual remains Observed in the rooms where they would be left (the bonnet on the winch, the empty chair), so they are told truly wherever the company is; but a sound the player hears and cannot attribute is still not representable.
* **A party member alone.** The party is one group at one place, so "the one who is alone, in the dark, off the lamp" is a room, not a person: the thing takes *one of the company* in the room it has come to, not a companion who has wandered off.
* **A companion's fear.** The lamp's brightness has no effect on a companion's morale (no morale measure in the shared systems).
* **The company's own stake.** The company wants only to live and to leave. A reason of its own to be on the rock (a debt, a name in the cistern) is not representable: the sound `Observe` cannot name one of three chosen companions.
* **Two things at once in a room at night**: a person answering in the kitchen while another is on the stair is two rules, not a scene.

## 4. Existing assets whose integration is incomplete

* `tide_caller` is in the catalog (no portrait, no habitat) and used by no module Person. The adventure's creature is a Thing. The species is natural history only, and a handbook entry for a creature the player can never meet is odd.
* `unlit`, torches and the lantern: the tower is lit, so the shared dark-room mechanism is not used. The lamp is a Thing with three states instead. A torch does appear: `drive_it_off` uses `capable(actor, light)`; a torch must be lit when the thing is already in the room, because it burns out in the wait.
* Hiding and slip-past: the Caller does not search, so there is nothing to slip past. Hiding is "not answering" and "being in the lamp room with the lamp lit".
* Orsino items: holy water is used; the rest of the catalog is not.

## What round three changed

A third review found the lamp could be used to skip the night, the tower was safe in most rooms, and several rules could not fire. In answer:

1. **Calls come whatever the lamp is doing**, from midnight; the lamp decides where the thing can climb, not whether the voices come. A lamp kept bright all night no longer skips Gaff, Dib, Corrie and Hettie. A spec plays that night.
2. **The thing hunts where the company is** (`exposed()`, `caller_hunts`): the boat shed, the bell hut, the store, the keeper's room, the kitchen and the lamp room all have takings, according to the lamp. Specs play the boat shed and the keeper's room.
3. **`caller_takes_stair` could not fire** (it waited thirty watches on a lamp that is low for eighteen). The takings are timed from the thing's arrival, not the lamp's change, and the keeper's room at low is a spec.
4. **`stop_hettie` and `drive_it_off` are latched** (once a night); calling Hettie back needs a love of two, so her life depends on how the company has spent the evening.
5. **The counters hold**: holy water, a torch and a lie set `repelUntil`, which `hunting()` honours whatever the lamp is doing. A spec throws holy water in the kitchen with the lamp out.
6. **Corrie's price is charged** (two gold); the line is washed off the posts by the tide, so Dib's line is needed on the second morning; a bearing is taken once.
7. **Fates are told by sound over the holm** with visual remains in the rooms, not narrated from the wrong place.
8. **Hettie's hand on his sleeve is not told after she drowns**; the second cup is not put out for a dead woman; the notice no longer raises `love`.
9. **Lowrie walks at the fourth call** if he was not asked to ring, on the first night; Piers, promised, follows the company; Piers told "till morning" can give the notice only from the second morning. All played.
10. **The jersey** (Everyone Out) is no longer put on "the right way round"; "Hull", "paraffin", "newspaper" and the repeated "size of" are gone.

## What round four changed

1. **The bell cannot be chained.** `ring_bell` is once between noons (`ringN`), costs two oil and slows the lens, so a night cannot be put off by ringing and filling.
2. **Dib's line is offered only at low water** (it was retracted the same tick at high water), and the mud is now three dice against a save of fourteen, not a nuisance.
3. **The lamp room is not a free refuge.** A lamp low for an hour exposes the kitchen, lamp room and gallery; moving between floors takes a watch. The refuge costs a flask every four hours and a visit to the store.
4. **The declaration is earned, not rolled.** With a love of three, `ask_orrin_speak_known` needs no roll. Love is raised by choices: Hettie's answers, a new question ("Ask Seddon what Tam was to him"), watching his hands, taking Hettie up, sitting with her. Each risky try is made once.
5. **"No, we'd sooner sleep" warns, and has a line of play.** Seddon says in the question that he will not have the lamp touched by one who'd sooner sleep, and relents at the first call.
6. **`orrin_returns` no longer re-posts a Seddon who has come away.**
7. **Told text is not tied to a room**: "Below…" and "Overhead…" are gone.
8. **Latches and costs**: `read_orrin` and `hush_gaff` are tried once (hushing costs a watch); `keep_dib` is a roll; the torch resets at noon, not whenever the bell lapses.
9. **The questions differ.** "No, they are gone" gives Hettie two more calls; "Some of them, perhaps" brings her to the water at the third. Laughing with Gaff loses Gaff at the first call but covers Dib and Corrie for one more. Piers told "till morning" sits up with Seddon (one more refill); told "tonight", he does not. The notice colours two endings (The Keeper's Last Winter, and The Keeper at His Lamp when Seddon was held).
10. **A ninth ending**, "The Keeper at His Lamp": Seddon declared, was held at his lamp by the company, and Hettie was lost.
11. Continuity and tics: Hettie is "a widow in black"; the window in the keeper's room is no longer opened twice; "quietly", "kindly", "gently", "tenderly", "patiently" and two of three "slow and even" are cut.
