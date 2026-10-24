# Mission 14 report: the deep expedition

Written for: the person who set Mission 14, deciding what it achieved and what to set next. It is candid: where a
thing works, it says what was seen; where it does not, or was not done, it says so.

Mission 14 asked for a game worth playing for hours: above all a generated, persistent, multilevel adventure complex
that ordinary play finds and that sustains several expeditions (Proof A), and three proofs beside it: an argument
with consequences (B), a historical landscape with material consequences (C), and an independently authored
scenario (D). Twenty commits from `637642e`, 212 files, about 6,300 lines added. The suite is 551 tests (538 pass,
13 skipped browser tests, which pass when run with `KYRIE_BROWSER=1`: 7 of 7).

No one but me has played this. Every play described here was mine, through the same choices a player has: the text
harness that plays by the words on the page, and the browser.

## What is now playable

Begin a generated world as a wanderer (seed `wren` is the one recorded). At the home inn the innkeeper tells of the
Delvers' mine and how to get there; the smith tells what the Delvers died for and buys the ore; the priest forbids
opening the walled stair at the bottom. Out over the fell is a four-level mine of about thirty rooms built from what
it was dug for: the adit level, the haulage, a drowned level, the breach. A cage that runs once its seized wheel is
worked free, ladders, a one-way ore pass, a walled stair, a hidden air shaft found by its draft that is a second way
out, a level that drains only while a spring is turned onto a pump wheel a level up and its chain engaged. Dwellers
that rise with depth (a goblin chief, a shift-boss wraith, crystal elementals) and can be talked round or warned off
at odds the page states. Riddle caskets from Orsino. Traps that looking closely explains and tools then make safe.
The Delvers' valuables and ore, which sold are the company's experience, about a level for a level of the mine.
Light that burns down (a torch an hour, a lantern six on a flask of oil). What the kingdom after the Delvers did with
the mine, by the world's own history. A keeper at the bottom too strong to fight, that shrinks from the light of noon
into a rift, and a jar of noonlight two levels up that the makers' own words point to. Bringing the heart of the
vein up into daylight is the objective. While the company is away the mine fills again.

The record of a first expedition, played through, is [`expedition.md`](expedition.md): from the road into Gothgiba
to a night at the inn, eighty-odd choices, one companion lost and raised for 300 coin, 393 coin and experience
brought home. `test/long-expedition.test.ts` replays it and resumes it from a save made halfway down. Browser
screenshots are in [`doc/design/mission-14/shots`](../../design/mission-14/shots).

## Proof A: the deep expedition

**Done and seen to work.** Generation from purpose (`src/world/deep/*`, `data/generation/deep/deep.json`): layout,
Orsino's pacing (sequences, overlays, the step every third room, elites), mechanisms, rooms, the keeper and its bane,
newcomers, the successors' alterations, the argument at the shrine. Placement near the home town, told of there, the
way told by where the fell is entered. Sub-watch time: actions take minutes (`Time 2 minutes.`), doors a minute,
stairs two, minutes add up to watches; the clock tells the minute. Checks (`Resolve check(actor, skill,
difficulty)`), rolled only when the result is in doubt, keyed on the world, the command and its occurrence so that
replays roll the same. Lanterns, oil and candles that burn down. Tries offered only where a thing's look suits them.
A level plan on the map. In play I took the first expedition end to end in ordinary play, and a second as far as
the haulage level: the goblin chief talked round, the spring turned onto the race, a level gained resting at the
earlier party's camp, the wheel freed and the cage ridden down.

**Shown only piecewise.** The deeper chain: the pump draining the drowned level, breaking the wall, the strongroom
and its jar, the climb to the breach, the keeper shrinking from noon, the heart brought up. Each step was played,
but with the company put in the room (the harness's `@@room`), not walked there. A whole descent to the heart in
ordinary play was not done: it needs several expeditions of levelling, and I did not play them.

**Weak or missing.**
- Three purposes. Besides the Delvers' mine there is the Barrow-Kin's king-barrow (`data/generation/deep/barrow.json`,
  `test/deep-barrow.test.ts`), with its own gear and words: a portal stone on a counterweight, a seal-stone across the
  king's door, a robbers' tunnel round it, a light-box that is a second way out, a king who cannot abide the day.
  And there are the Water-Wardens' cisterns (`waterworks.json`, `test/deep-waterworks.test.ts`): a bronze gate on a
  seized wheel across the stair, a great pipe to go down feet first, a deep cistern that drains only while the master
  sluice turns the springs onto the great wheel and its pump-rods are coupled, an overflow culvert found by the sound
  of running water, and a keeper that shrinks not from the day but from the Wardens' oath. The oath is on a tablet in
  the cisterns' own archive, a kind of thing that exists only in that site, which reads the old script as the
  glossary does, so whoever carries it can also read the warning on the gate. A country gets the first of these its
  makers had (mine, then barrow, then cisterns). The sky and stone arts have no deep purpose yet, so a country of
  only those (seed `d4`) has no deep site.
- A level no longer lays the same kind of trap twice while another kind would do: the cisterns' drowned hall had a
  pressure plate on each of its two ways, each described from both ends.
- Companions died too easily, and I had the reason wrong: this report said Orsino's death save was against 25. Orsino
  has no such save. One who falls in Orsino lies senseless, and at a rest makes a system-shock save (a d20 against
  10), coming round with 1 HP or dying where they fell. Kyrie had made every fall a death, to be raised for 300
  coin; Thoradin fell in all three fights he was in. Now a fall is Orsino's: senseless, then at the next rest in the
  deep, at a camp or in a bed, the save (`FieldUse.shock`), so long as someone is still on their feet to tend them.
  Only the dead can be laid to rest. Orsino's code adds the
  Constitution to the difficulty, where its own message adds it to the roll; Kyrie follows the message.
- Carrying now weighs (`src/rules/burden.ts`, `test/burden.test.ts`). Each kind weighs what it says, or what its
  class or category weighs; a member carries ten and twice their strength. A laden company is told so and goes at
  half its pace; the heart of the vein weighs a warrior down. Nothing is refused for weight.
- The keeper was never fought; whether a party of level 8 or so could fight it is untested.
- Monster experience varies a great deal by kind, as Orsino's does: three goblins 190, two bone hounds 1,265, the
  first more than a level for a company of one. That is Orsino's table, and a fight is now shared among the members
  still standing as Orsino shares it; until now every member got the whole, four times Orsino's for a company of
  four. Whether undead should be worth twelve times a goblin a level in Kyrie is not settled.

## Proof B: an argument with consequences

**Done.** The priest of the mine's home town forbids opening the makers' wall, and will not heal, raise or pray for
whoever does (`src/world/deep/deep-argument.ts`). The company argues it out, each way once, at stated odds:
- the makers' own words as evidence (easy, and offered only to a company that has read them);
- plain argument (hard);
- reading what the priest leaves unsaid (insight), which finds a brother lost in the mine and opens an appeal to
  that grief;
- a lie, which shuts the shrine if found out;
- a threat, which works but shuts the shrine anyway;
- a promise to wall the stair again, which needs no roll.

Won over, the priest tells what the keeper cannot bear: knowledge a company without the old script would otherwise
lack. The promise is held to: the heart brought up with the wall still open shuts the shrine. So does the stair
opened against the priest's word. `test/deep-argument.test.ts` pins all of it. Bands in the deep can be talked
round or warned off the same way.

**Not done.** The philosopher capstone (henology, fluxism, sophistry; truth set against argument, rhetoric, belief
and influence) was not attempted. NPC belief is a fact in the world (won, heard, promised) rather than a model of
belief, and there is no deception detected by evidence beyond the one lie.

## Proof C: a living historical landscape

**Done.** History now has material consequences inside the deep site (`src/world/deep/deep-history.ts`). By the kind
of kingdom that followed the makers:
- warlords held the adit with a gate and barricaded the way from below;
- abbots made a chapel of the Delvers' hall and blessed the wall on the stair again;
- merchant-princes kept a tally-house in the stores and gave the working up.

By how that kingdom fell:
- plague dead in the old stope;
- families wintering in the hall;
- an heir's strongbox buried in the ore bin;
- a raiders' post at the mouth.

The successors' documents teach their history when read, and the abbots' tablet explains the wall the company finds
below. `test/deep-history.test.ts`.

**Done since.** Border marks were the brief's example of repetition: every road out of every country passed "a
march-stone as tall as a man". Now a country's bounds are marked by whoever ruled it after the makers (a ruined
watch-post, a wayside cross, a toll-house) and by the lie of the land (a causeway post in the fen, blazed oaks, a
cairn on a pass), drawn per border so that no two read alike (`data/generation/scenes/borders.json`).

**Not done.** Ecology, settlements' fortunes and regional powers with visible plans were not worked on this
mission. A deep era sequence (a primordial age, the Mathematical
Age, planar contact) was not attempted. Truth and belief are not yet separated in what people say of history.

## Proof D: an independently authored scenario

**Done.** An adventure's own kinds of thing and of creature are its own (`src/canon/local-catalog.ts`). They are in
the catalogs while its campaign is played, out of them when another is, and back with a saved game.
`test/fixtures/locals` holds two adventures that give the same names to different things:
- at the mere, moonglass is treasure and a mere hound a territorial wolf;
- at the works, moonglass is a lantern's lens and a mere hound a tame dog.

`test/local-isolation.test.ts` plays them in turn and restores one after the other. A kind declared in Kyr is an
entity of its world whether or not any of it is placed.

**Not done.** Local abilities, laws and generation tables, dynamic entity creation, conditional passage destinations,
counted offers and rule tracing. (Weight and carrying are done: see Proof A.) The fixtures are small; there is no full independently written
scenario of the size the brief imagines.

## The interface

Done:
- Tries suit what a thing looks like, with authored additions (`Tries pushing.`): no "Listen at scattered coins".
- Probing a trap teaches what it is, which opens its remedies.
- A casket's own page offers what is in it.
- A riddle's four words are offered together, not the answer apart from the rest, which had given it away.
- A way named for where it goes is not named twice.
- In the dark, who is there is heard, not seen.
- A long answer in conversation shows from its start.
- Someone with no likeness that fits is a named card, not a painting-sized frame (the goblins had been painted as
  a monk, and then shown as a giant lowercase "t").
- The map draws a site's level.
- The dead click on a way with a fallen guard, and the angry owner with nothing to click, were fixed at the start
  (`baseline.md`).

Not done:
- A title screen with New Game, Continue and Options beyond what exists.
- Character creation with Orsino's backgrounds as openings.
- Conversation memory of fresh and exhausted topics beyond "asked".
- The map's up and down between levels.
- Pronouns in Kyr text (the priest's lines are written to need none).

## Invariants

`bin/` holds only `bin/kyrie`; the tools are subcommands (lint, compile, test, preview, world, voice, handbook,
orsino, playtext and more); utilities live in `scripts/`. `test/repository.test.ts` checks this, and the project
contract is [`doc/CONTRACT.md`](../../CONTRACT.md).

## Performance and persistence

Measured in Chromium on this machine, nothing else running (`scratchpad m12/latency2.ts`):

| | |
|---|---|
| Cold load to the first page | 1.65 s |
| Begin, after reading the creation page (the country is read meanwhile) | 2.85 s |
| Begin, clicked at once | 3.86 s |
| An action, click to second frame | 180–445 ms (engine 80–340) |
| Reload to play (Continue) | 1.45 s |

Begin holds at the 2.85 s the brief quoted, though the region is 16% larger with the mine (428 KB of Kyr, 67 KB of
it the mine). Parsing is about 1 s of it in bun and is done while the player reads. The rest is composing and
compiling the region, which waits for Begin because the company's file is in the region's bundle. Splitting it out
would let the region be composed in advance; that is the next step, not taken. Parses are cached by content in memory.
A persistent cache would help only a world begun twice, since Continue restores the compiled game. Persistence: the
whole first expedition replays from its record and resumes from a halfway save to the identical world
(`test/long-expedition.test.ts`). Local kinds come back with a saved game.

## Orsino

The behavioural audit of Orsino's dungeons against the deep sites is [`orsino-dungeon.md`](orsino-dungeon.md).
Most of Orsino's pacing and escalation is now Faithful or Adapted, read from its own tables. Missing: its shrines in
the deep, its auras, building types other than the mine, and its trap DCs (the table is copied but unused).

## What I would do next

1. Play the mine to the heart in ordinary play, over as many expeditions as it takes, and recalibrate from what
   happens: companion deaths, the keeper, the drowned level's timing, how much a company can carry.
2. Deep purposes for the sky and stone arts (an observatory, halls), now that the generator takes all of a purpose's
   words and its own kinds of thing from its data.
3. Split the company out of the region bundle so Begin can be composed while the player reads.
4. The philosopher capstone, on the argument machinery built here.
5. Dynamic entities, and pronouns in Kyr text.
