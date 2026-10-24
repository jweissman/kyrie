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
replays roll the same. Lanterns, oil and candles that burn down, while they are wanted. Tries offered only where a thing's look suits them.
A level plan on the map. In play I took the first expedition end to end in ordinary play, and a second as far as
the haulage level: the goblin chief talked round, the spring turned onto the race, a level gained resting at the
earlier party's camp, the wheel freed and the cage ridden down.

**The heart brought up in ordinary play.** I went on from the second expedition, playing only the choices on the
page, the record replayed each time by its labels (`scratchpad m14/x3.tokens`, 335 choices in all). As I fixed
what play found, the rules changed under the record, and it was replayed from the last point it still held: once a
fall stopped being a death, Thoradin came round at the second expedition's camp instead of being carried home dead,
and play went on from there. On that line, over six expeditions and eight days of the world's time:
- the bone hounds of the ore bin killed, the pump set, home with 751 coin of finds, a level for Thoradin at the inn,
  the priest won over by his grief;
- the mud of the long haulage killed, Thoradin felled by it, failing his save at the hall's rest and dying; Wenna's
  third level taken there, Thoradin carried home and raised;
- nobody in Gothgiba would join, so over the Karavor to Muzgkom, where Veit the mason joined for 7 coin;
- with three, the ghouls at the walled stair killed; the makers' words read with the glossary and the wall broken
  (the priest consenting); the drowned level dry; a glyph unsaid by reading it; the ooze killed (Thoradin falling
  again, and dying again at the next rest: the dice were against him); the jar of noonlight taken from the
  strongroom; home for food, and Thoradin raised a second time;
- the sixth expedition: past the newcomer that had moved into the furnace hall while the company was away, and past
  the overseer in the deep cut, both standing their ground and letting the company by while their patience lasted;
  the climb on the rope to the breach; a crown of star-iron, gloves of dexterity, galvorn mail; the thing in the vein
  drawing back from the jar's noon into the rift; the heart of the vein taken, the company laden with it at half its
  pace, and carried up and out by the air shaft. It came out at midnight, and the objective is to bring it into
  daylight: it was raised at first light.

None of it was done by putting the company in a room. It took a level-3 warrior, a level-2 companion raised twice
and a level-1 hireling, three dead companions, two raisings at 300 coin, a recruit from another town, and a
newcomer and an elite passed rather than fought. The keeper was never fought. What the expeditions found on the way
was worth as much as the descent, and each was fixed and pinned by a test:
- buying a second flask of oil with a lantern in the pack stopped play outright (two choices of one name); `kyrie
  lint` now reports any action that hides which of its items it means, and found the Long Man's bounty doing the same;
- a fallen companion could still be asked about the fells, and answered;
- the innkeeper went on telling of a fevered child's fever after the child had died;
- a night at the inn counted the day's waking from bedtime, so a company was weary ten hours after sleeping;
- a fight's experience went whole to every member (Orsino shares it), and a fall was a death (see below);
- the smith's two torches and three flasks were all the light the village would ever sell; what is used up now comes
  back to the shelf at dawn;
- the drowned level drained in twenty minutes of small actions instead of two hours, and its draining was heard an
  hour's walk away;
- a lantern burned through every night's sleep, every vigil and every walk in daylight; a flame now burns only where
  the company is in the dark and awake (which in turn showed that a level's unspent points were lost whenever a
  member had anything on the clock, a torch or a poison, over a watch: the fight projection dropped them);
- a raising did not say its price, and said "at first light" at one in the afternoon;
- a rest on the last ration, with a meal falling due in its six hours, ate the ration twice and stopped play; and
  with no ration at all, the rest simply was not there. It is offered now, and says what it wants.

- ways named for one direction read wrongly taken the other ("Take the road down from the Karavor to Muzgkom to the
  top of the Karavor", "Take the rough cut down to the deep cut" climbing up); a road's halves are now named for
  what they cross (the Karavor road), or plainly the road, and the mine's climbs for what they are.

Found and not yet fixed: the way into Barzelrehes nearest the mine is called "the foot of Barzelrehes by Muzgkom",
though no way from Muzgkom reaches it; a spent trap still offers to be prodded.

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
  Only the dead can be laid to rest. Orsino's code adds the Constitution to the difficulty, where its own message
  adds it to the roll; Kyrie follows the message.
- Carrying now weighs (`src/rules/burden.ts`, `test/burden.test.ts`). Each kind weighs what it says, or what its
  class or category weighs; a member carries ten and twice their strength. A laden company is told so and goes at
  half its pace; the heart of the vein weighs a warrior down. Nothing is refused for weight.
- The keeper was never fought; whether a party of level 8 or so could fight it is untested.
- Monster experience varies a great deal by kind, as Orsino's does: three goblins 190, two bone hounds 1,265, the
  second more than a level for a company of one. That is Orsino's table, and a fight is now shared among the members
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

1. Play more of it, in other worlds and with other companies: the barrow and the cisterns to their ends, and a mine
   with a different company. Play found a dozen faults in a day that no test had; more play is the best test there
   is. Calibration to look at from this play: Thoradin fell in almost every fight (a level-2 companion beside a
   level-3 warrior); a recruit had to be fetched from another town; and the walk to the mine and back, eight hours,
   is most of an expedition's time.
2. Deep purposes for the sky and stone arts (an observatory, halls), now that the generator takes all of a purpose's
   words and its own kinds of thing from its data.
3. Split the company out of the region bundle so Begin can be composed while the player reads.
4. The philosopher capstone, on the argument machinery built here.
5. Dynamic entities, and pronouns in Kyr text.
