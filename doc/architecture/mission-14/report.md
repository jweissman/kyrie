# Mission 14 report: the deep expedition

Written for: the person who set Mission 14, deciding what it achieved and what to set next. It is candid: where a
thing works, it says what was seen; where it does not, or was not done, it says so.

Mission 14 asked for a game worth playing for hours: above all a generated, persistent, multilevel adventure complex
that ordinary play finds and that sustains several expeditions (Proof A), and three proofs beside it: an argument
with consequences (B), a historical landscape with material consequences (C), and an independently authored
scenario (D). Fifty-three commits from `637642e`, 235 files, about 9,900 lines added. The suite is 607 tests: 589
pass and 18 are opt-in. Those are the browser tests (`KYRIE_BROWSER=1`: 8 of 8 pass), the four kept descents
(`KYRIE_LONG=1`: 4 of 4), and the Orsino checks that need a pinned Orsino checkout.

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

- the way into Barzelrehes nearest the mine was called "the foot of Barzelrehes by Muzgkom", though no way from
  Muzgkom reached it: every way in went to the place nearest where it started, and Muzgkom is two hours off. An
  edge no way comes to now has a path up from the settlement it is known by (`test/wild-country.test.ts`).

- a trap that had gone off still offered to be prodded. Something that can do harm, in a state where it does none,
  is not prodded (`harmless` in `data/rules/passages.kyr`; `test/marvels.test.ts`).

- the trails of wild country joined its parts in order, each part's landmark set as far as could be from the
  others, so on fells running nearly the width of the country a single trail took eleven hours and the next
  seventeen. Each landmark is now joined to the nearest of those already joined, beginning at the edge; the longest
  trail on Barzelrehes is five hours and twenty minutes. A way to a site is told along the trails from whichever
  edge is nearest it by them (`test/wild-country.test.ts`).

**Done since: the homecoming.** Once the heart is up, the innkeeper who first told of the site hears what the
company brought, in the site's own words ("'Out from under Nocstumul?' Eamon puts down the jug and looks a long
while at the crown, and does not touch it"), and keeps it as a guest: the next bed and supper there are on the
house (`guest` and `take_lodging_guest` in `data/rules/services.kyr`, `test/homecoming.test.ts`). Before this, the
crown came into daylight and nobody in Murkstede said a word. On the roads, where all a traveller had to say of the
company was that "some stranger's been making themselves useful", it is now what everyone is saying ("Word is,
somebody went down into Nocstumul and brought the crown of the first king up into the daylight"). It is one deed
remembered, by name; people do not yet remember what else a company did.

**Weak or missing.**
- Four purposes. Besides the Delvers' mine there is the Barrow-Kin's king-barrow (`data/generation/deep/barrow.json`,
  `test/deep-barrow.test.ts`), with its own gear and words: a portal stone on a counterweight, a seal-stone across the
  king's door, a robbers' tunnel round it, a light-box that is a second way out, a king who cannot abide the day.
  And there are the Water-Wardens' cisterns (`waterworks.json`, `test/deep-waterworks.test.ts`): a bronze gate on a
  seized wheel across the stair, a great pipe to go down feet first, a deep cistern that drains only while the master
  sluice turns the springs onto the great wheel and its pump-rods are coupled, an overflow culvert found by the sound
  of running water, and a keeper that shrinks not from the day but from the Wardens' oath. The oath is on a tablet in
  the cisterns' own archive, a kind of thing that exists only in that site, carried as a book is; no scholar's
  learning stands in for it. And there is the Stone-Singers' hall
  (`singing.json`, `test/deep-singing.test.ts`), cut whole out of a hill by song: a pivot-door settled on its stone
  across the stair, a round door that opens to the note cut over it for whoever reads the old script (and not to
  force), a crack round it for a climber or a rope, a sounding-shaft where the wind sings, a chorus of the singers turned
  to stone, and a keeper that is their own last song, which only their own knell stills, rung on the dirge bell
  the last cantor took down to the unfinished hall. A country
  gets the first of these its makers had (mine, barrow, cisterns, hall). Only the sky art has no deep purpose yet:
  the Star-Readers built towers, which rise, and the generator, its danger by depth and the map's level stack all
  go down.
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
- A second world, played from its first page: a1, with a cleric, a lone wanderer at Murkstede. The record so far is
  `scratchpad m14/a1.tokens`. Asked at the inn, the innkeeper told of the king-barrow at Nocstumul; the merchant
  told of what the old folk buried and bought it; Cyril the pedlar joined for 3 coin. On the first afternoon the
  barrow's upper chambers gave up 300 coin of grave-goods, sold for 255 experience each, and the boundary stones
  were settled for 100 more. Then the barrow's way down stopped this company, as it should have: a portal stone
  that needs brawn or a crowbar to raise, a climb over it that needs a rope, and below that a switch that would cut
  either of them in half, which wants a pole or someone who knows traps. Play found these faults:
  - the page did not say what the company lacked. A thing that wants brawn said only "Needs brawn", though a crowbar
    would do. A thing that wants a pole said nothing at all, because only missing skills were offered as disabled
    choices. A way to a place barred twice (the portal stone, and a climb wanting a rope) told only the first. A
    way that needed climbing or a rope was called closed to a company with the rope, because only its first need was
    asked about. Now every need is named, a missing kind of thing is a disabled choice like a missing skill ("Needs a
    ten-foot pole, and the company has none"), and both bars are told (`test/what-it-takes.test.ts`);
  - a trap risked did not say where its way went, nor how bad it was. It says both now, once the trap is understood:
    "Risk the hidden switch on the way to the hall of the bones; Wenna goes first · it could kill". The trap's harm is
    read from its effect on an average roll against the one who would go first (`src/rules/harm.ts`);
  - the bats in a chamber were offered to be attacked but never said to be there: only people were;
  - every alike thing on a shelf was its own choice ("Buy a candle" twice; "Light a torch" three times in the
    descent). Choices alike in action and words are one;
  - a sale said "Wenna: set down a silver arm-ring" after the merchant had paid for it, and readying the glossary
    said so twice. What an action says is what it did;
  - "'Murkstede?' Says Hob": a quotation ending in a question went on into a capital;
  - the merchant's bribe could be taken before the merchant had offered it; the innkeeper promised suppers on the
    house that were then paid for; the arrival text had the quarrelling pair shouting in the street, where the
    quarrel is that they will not speak. The arrivals no longer give anyone a sex the scenario does not;
  - the town's news was told twice on coming in (as what happened, and as what had changed), and so was everyone in
    the taproom;
  - bandages and herbs were offered on everyone, hurt or not. A remedy is offered to whoever it would help, as a
    spell of healing already was (`relieves`, projected like `treatable`);
  - two people in a country often shared a name: an Avice kept geese at Murkstede and cut wood at Wǽttún, a
    pedlar and a carpenter were both Garret, and Gothgiba in wren had two Rangrims. Townsfolk, residents,
    shopkeepers and road travellers are now named clear of one another, and when a people's few names have all
    been given, a name given again comes with a family's ("Adrik Strakeln");
  - Cora wanted a lantern brought "and would pay you back and a bit over", and paid three coin for a seven-coin
    lantern; she pays its price and a coin now;
  - the journal's way to a site in open country said only "The way to a long mound north of Faennslím". It says
    where the track to it goes from.

  The country was busy round them: a lord's toll on the Deopex road that makes food dearer, a drover gone missing,
  graves opened under a lone tower with a green light, and the brothers of Aergodríce, gone up to Nocstumul the
  second morning after the same crown. The pole, a lantern and oil were a day's walk off at Wǽttún. Aghavan, a
  scholar, joined there, and Ambrose, a soldier paid off at midsummer, at Faennslím. Back at the barrow on the
  fifth day, the brothers' cross was on the forecourt wall. Ambrose levered the counterweight free, the pole sprang
  the switch from a pace off, and the glyph on the next way was unsaid with the glossary. Then the company went
  into the ossuary, where an elite of the halls, an alpha mourner, fell on it as it came in. Wenna, Cyril and
  Aghavan went down; Ambrose killed it alone, and carried them into the mourners' hall to rest. The bone hounds
  that keep that hall were letting him be, for a while. He stayed to pick up a cloak-pin, and they killed him.
  No one was left standing on the fifth afternoon. That is a fair end for a level-1 company, but the ossuary gave
  no sign of what was in it before the company was inside. Now a band that falls on whoever comes in, keeps its
  ground, or is one of the deep's worst is heard from every room a way leads from ("From the ossuary comes a sound
  you do not like at all: something large, that is not in any hurry"). The ending named the killer "Knitted bone
  hound 1" and quoted the command it interrupted. It says "One of the agile bone hounds" now, and "as you went to
  collect a gold cloak-pin" (`test/obituary.test.ts`).
- A third world: thorn, with a ranger, whose record is `scratchpad m14/t1.tokens`. Arlen, a pilgrim, joined at
  Merscheald for 3 coin. The innkeeper told of the cisterns at Paliduslac, and the salter of the Wardens' black
  glass. The ranger read the land at the door (the herons fish every pool but these). A dead delver's camp in the
  colonnade held a notebook that told the puzzle: the master sluice turns the springs, and the great wheel's rods go
  down into the deep cistern. Over two days and a walk home for food, the company did these things:
  - fought an ooze that waited at the great wheel, and coupled the rods;
  - turned the springs down the race, and came back to find the cistern pumped dry and the room taken by the
    drowned, who had moved in meanwhile;
  - went past a rune that hurt Arlen badly, as the choice said it would, and fought two more bands of the drowned;
  - reached the sealed gate of the deep cistern. It wants brawn or a crowbar, and lore for the words cut round it,
    and the company had neither;
  - walked a day for a soldier's strength, by road to Meósdael and back. Corrin, a scholar who fights, tore the
    bronze plate from the gate;
  - fought the cistern-water on the landing and the drowned wardens in the hall, and sprang the pressure plate and
    the glyph with the pole;
  - took the Wardens' oath-tablet from the archive, which reads the old script. Read aloud at the still water, it
    drove the keeper back into the source;
  - took the reading-glass from its pillar, opened a riddle-casket ("tough as nails yet cannot endure the sun":
    ice) for a jeweled torc, and brought the glass up into the daylight at the doorway, on the fourth evening.

  The cisterns are the second deep site played to its heart, in a second world, by a different company: a ranger
  and a pilgrim at level 2 and a soldier-scholar at level 1, who never fought the keeper. The record is kept as
  `test/fixtures/descent/thorn.choices` (163 choices), replayed with wren's by `test/descent.test.ts`. The brothers of Reodweard
  were two levels behind. Faults found and fixed:
  - the widow on her step was "the woman in black" on the page and in one choice, and "Talk to Mark" in another. She
    is the woman in black in all of them now;
  - a drover resting at the inn gave news of the town he sat in, and had his cattle "penned for the night" at eight
    in the morning. Resting, a traveller tells of where they came from, and of a morning makes ready for the road;
  - what lies in wait (the ooze, cave spiders) gave no sign before it struck. Now someone who reads sign sees its
    slime at the mouth of the way. Bands that move into a cleared room are heard as the first ones were;
  - a fight told after it said "Spirit 1 falls"; it says "The first of the drowned falls";
  - once the springs were turned down the race, the stream still ran out under the door, and the race was still
    called "dry now". The doorway and the hillside now show the springs gone another way, and a drained cistern
    goes on saying so at the wheel;
  - news of a boy gone out after his father, in another town, reached the company in the cisterns and woke it from
    its rest; it is told only on that town's green;
  - "a heather" and "a comfrey" at the apothecary are heather and comfrey;
  - one choice that wanted brawn or a crowbar was listed twice, once for each;
  - the torn-off seal was still offered to be pushed, pried at and listened at, and gathered coins to be looked at.
    Something undone (a trap gone off, a seal broken, a lid off) is not tried, and a purse gathered is done with;
  - a goat that had got loose could be told "not to wait for you".
- A fourth: d4, with a bard, whose record is `test/fixtures/descent/d4.choices` (the third kept descent;
  90 choices at first). Gareth, a pilgrim, joined at Muntheald for 3 coin, and brought the rites of the dead; Liora the smith
  sold a crowbar and a pole. Akarn, a mason who fights, joined at Stānhricg, past the philosophers on the green.
  The play went like this:
  - the bar lifted the pivot-door across the stair, and a voice at its foot was fought;
  - the bard unsaid the glyph before the cantors' rooms, and the company took the dirge bell from its niche;
  - a crack in the unsung stone led round the singing door to the chorus, and the riddle-caskets there gave up a
    rose-quartz note and two rings of protection;
  - rung over the stone singers, the bell sent the keeper back into the root of the hill;
  - the tuning-stone came up at first light on the second day, though the company had run out of food.

  That was too easy, and I say so. The hall has three short levels; the crack makes the singing door's puzzle a
  choice rather than a need; and someone in the company had the one thing the keeper cannot bear from the first
  hour. Three level-1 characters fought one band. The hall should be deeper, or its crack narrower, or its bell
  harder to come by, before it is worth an evening. Faults found and fixed:
  - "the wildtype voice": Orsino's wildtype is the kind as it is, and is no longer said;
  - "disputing on the camp at Stānhricg", "a child on the bailey": the fever and the disputation now say "at" before
    whatever a town's heart is called, and the dispute is "here" when you are at it;
  - "the settled pivot-door" stayed settled once it swung; it is the pivot-door;
  - a notebook read was still offered to be looked at closely.

  Then I went back to make the hall worth the evening, and found it was easier than it looked. Gareth had not needed
  the bell at all: the Unsung feared the rites of the dead, which any pilgrim or cleric has. The Wardens' still water
  in thorn feared lore, which any bard or scholar has, or a 60-coin glossary from a shrine. Only the mine's and the
  barrow's keepers feared something nobody brings, the daylight in a jar. And the Unsung, a keeper of level 8, had
  13 hit points: the golem's level-1 line was fixed in two places, the catalog and Deem's body table, so its level
  counted for nothing. With the bell left in its niche, three level-1 characters killed it in one round. Changed:
  - each keeper fears only what its makers left against it. The dirge bell brings the singers' knell, and the
    oath-tablet the Wardens' oath, and nothing else answers either. A keeper's bane must be found in the deep. To
    make the tablet, Kyr's `Kind` gained `granting`: a kind of the module's own, carried as a catalog kind is, that
    brings its own capability (`Kind wardens_oath "…" like old_glossary granting oath`). It is in the authoring
    guide and in the local-kind probe;
  - a golem's line grows three hit points a level above the first, as Orsino's monster template grows a line: 13 at
    level 1 as before, 34 at level 8 (Deem's `hpPerLevel`, beside `fixedHp`). A great snake and a
    great centipede, the cisterns' and the hall's elites at the top, were Orsino's animals, whose lines do not grow:
    a "great snake" heard from every room had 3 hit points. They are Kyr's own kinds now, and grow by hit die;
  - the still halls are a long hall and an unfinished hall longer, with the hall of echoes always there, and they have
    dwellers: a hard note in the long hall and the unsung stone in the unfinished one. The bell is no longer in the
    cantors' rooms beside the crack. It is in the unfinished hall, in the hand of the last cantor, who went down with
    it ("THE LAST OF THE CANTORS HAS THE BELL", the door says). The crack now lands in the hall of echoes, and needs
    a climber or a rope.

  Played again from the cantors' rooms with the same company: down the crack on the rope, a pressure plate sprung
  with the pole, the riddle in the chorus, past the hard note while its patience lasted and the glyph on the way
  unsaid, then into the unfinished hall, where taking the bell brought the unsung stone on. It was killed, with Wenna
  at half her hit points. Rung in the last hall, the bell sent the Unsung back. The way out was the crack again, and
  the tuning-stone came into daylight at first light on the second day. The record is now 101 choices. It is better,
  not yet good: one fight more than before and a real one, but the hall is still the shortest of the four, and a
  company that brings a rope and a pole has its two hard ways in solved before it arrives.
- a1 again, with a warrior, to the barrow's heart: the fourth kept descent, `test/fixtures/descent/a1.choices`
  (132 choices). Cyril the pedlar joined at Murkstede again. There were two expeditions:
  - the first afternoon: the outer barrow's grave-goods, and Wenna's brawn on the jammed counterweight, which frees
    the portal stone. Home to Murkstede, the goods sold at Mik's, a glossary of the old script bought at the shrine,
    and a bed at the Lucky Phoenix;
  - the second day: by road to Faennslím, the lord's toll paid at the bridge, and at Wǽttún a pole, a lantern and
    oil, bandages, and Aghavan, a scholar. A bench by Tazala's fire for the night;
  - the third day: back through Eikwudu and in. The switch on the stair was looked at closely, then pushed in with
    the pole's end. Ghouls were killed in the long gallery and the restless dead in the embalmers' room, and the jar
    of noonlight taken. At the king's door the words were read with the glossary ("HE CANNOT ABIDE THE DAY. THE
    EMBALMERS KEPT THE DAY IN A JAR"), the casket's riddle answered (the stamp) for a jade idol, and the seal-stone
    broken. Carried in before them, the jar drove the king back into the deep grave. The company came out with the
    crown at ten at night, waited on the forecourt, and the crown was brought into daylight at six on the fourth
    morning.

  The cleric's company died in the ossuary and the mourners' hall. This one was warned off both by what was heard
  from them, went round, and was never felled. Two fights took 2 of Aghavan's 5 hit points. Wenna and Cyril ended at
  954 experience, 46 short of a second level, which is taken under a roof. The treasury and the deep grave were left
  unvisited. This is the right shape: the first company to go in blind died; the second was ready, and what it
  readied with came from the world (the counterweight wants a strong arm, the stair a pole, the words a glossary
  sold one town off, the king the embalmers' own jar). It is the easiest of the four after d4's. Faults found and
  fixed:
  - turning off the road into the wood just past the reeve's bar, by a path that starts at the bridge, outlawed the
    company for running the toll, and the reeve sent riders after it. Passages now say which ways are road (a
    road, a bridge, a ford) and which way a company last went by. The toll is run only by going on along the road
    from the bar by a way the company did not come by, and only once it gets there (`test/toll.test.ts`);
  - "The toll-reeve are against you now": voice lines are written for they ("{Actor} [are|is]"). A verb after a
    name now agrees with one person or a band of many, and one after "they" agrees with the pronoun;
  - the light-box over the barrow's door laid "a thread of grey daylight" along the passage at ten at night. By
    night it is the night air.

  - the forecourt counted as indoors, being part of the barrow's first level, so the company could not make camp
    there and was weary at first light. A deep room can now be under the open sky (`open` in a purpose's role,
    written as the Kyr place's `outdoors`), and a place's declared shelter is what `indoors` follows.

  Still open from this play: "Take the king's door" names no destination when the way and the room beyond it share
  a name.
- A fifth world, cov2 (Ironfells), with a thief, from the first page: the first time a calling with trapwork and
  lockwork but no fighting to speak of has gone in. The world would not start at first (see Invariants). Then:
  - at Brantfeallan, Rharash, a half-orc minstrel who fights, joined for 3 coin, and the factor of the Alberíce
    company named the mine, Argentumons, and stood 30 coin against the heart of the vein, for 2,500;
  - the first morning in the adit: the switch at the mouth wedged by the thief, star-iron in the stopes, a dead
    camp's notebook, goblin thieves of level 3 talked into letting the company be, and cave spiders out of the
    props at the winze head with no warning (nobody in the company reads sign), which left Wenna at 1 HP;
  - out to Khesefrehes, the town nearest the mine, which keeps its god at a cross by the way: the smith bought
    star-iron (his purse ran dry at 60 coin; the rest was shown him, and bought next morning), Mabon, a drover who
    fights, joined for 7, and the keeper of the cross, Rangrim, was read wrong and then promised that the stair
    would be walled again, which got the company what the walled-in thing cannot bear;
  - the second day, as the factor's diggers set out: the goblin chief at the shaft head refused to let the company
    by and was killed when its patience ran out; the wheel freed with a crowbar and the cage ridden down; on the
    haulage level the mud came at the company, and the Delvers' bone hounds after it, and Wenna fell; the ghouls
    broke the first rest in the Delvers' hall; at the second she came round and both companions took a second
    level; a casket's riddle (a word), the stores' ledger, a tripwire pinned, and the pump's chain set;
  - the third day: the alpha pale pack, two cave hounds of level 5, killed, and Wenna felled again; a cursed
    shift-boss at the walled stair; back to rest, where she failed her save and died. The two carried her out and
    over to Brantfeallan, where the priest raised her for 300 of the company's 351 coin, on the fourth morning.

  On the fifth day, back in with 150 coin: the cave hounds that had moved into the haulage way felled Wenna again,
  the cursed shift-boss was killed, and at the rest she failed her save a second time. The mine is not played to its
  heart in cov2, and I stopped there: the harness fights every fight by the game's own tactics, the protagonist's
  turns included, so a thief of 9 HP stands in the line and is struck down by whatever reaches her, where a player
  in the browser would have her keep back, hide and dodge. It is still the hardest of the five starts. Below the
  walled stair are the drowned level and the keeper. Faults found and fixed:
  - two fights in one action were told as one: attacking the mud, the hounds came on after it, and the page told
    only the hounds, not the mud, nor Wenna falling (`test/two-fights.test.ts`); then, telling the blow that felled
    each who fell, the miss before Wenna's wound was told as the blow;
  - a rest ate two rations when the day's meal fell due as it began (`test/lantern.test.ts`);
  - the store-room's camp on the haulage level was the old stope's above, word for word; the same party's camps
    further down are told as theirs (`test/deep-camps.test.ts`).

  Noted, not fixed: the wright's yard, all timber, sells no ten-foot pole; and the ledger, like the galleries' tally,
  teaches the country's history as a finished account before its own words.
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

**The philosopher's capstone.** On some town's green two philosophers dispute on market days, and the town takes
sides: one of the One (henology: all things are one, and change is only seeming), one of the Flow (fluxism: nothing
stays, and nothing made outlasts its making), and a sophist who argues either side for two coin
(`data/goings-on/disputation`, placed by the world assembler like any trouble; seeds b2 and d4 have it). Belief is
now the world's own, in a rules module any author can use (`data/rules/belief.kyr`): who believes what and how
firmly, what fact refutes a claim, whether it was let go for a reason or only to argument, and who argued it away.
- Truth: the country's own history refutes each doctrine, for whoever has found it. The first makers' marks, which
  still read though no one alive has seen a maker, answer the Flow; how the makers ended, and the kingdom after
  them, answer the One. A scenario names that history (`@history.makers`, `.fate`, `.successors`), whatever the
  country's makers were. Put with lore, at easy odds, it settles the matter for good: the philosopher says so on
  the green and would come with the company.
- Rhetoric and sophistry: arguing the philosopher down (persuasion, hard) or paying the sophist wins the day, and
  the crowd laughs at the philosopher. By morning the doctrine is believed again (a rule of the belief module), and
  the one who argued it away is scorned and not listened to again, so the reason they might have given is lost.
- A passive check: someone in the company who reads people (insight) sees, without a roll, where the philosopher
  of the Flow keeps looking while saying that nothing stays (at the oldest stones in the town), and that is a reason
  of its own to put, at even odds, for a company without the history.
`test/disputation.test.ts` plays each way. What it does not do: the crowd's sides are told, not counted; nothing
in the town changes with the philosophers' views beyond the green; and there is still no deception detected by
evidence beyond the priest's one lie.

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

**Done since: a power after the same prize.** The heirs of whatever kingdom came after a deep site's makers want
what the makers died for (`data/generation/deep/powers.json`, `src/world/deep/deep-rivals.ts`). Warlords' heirs
have a castellan at the fort nearest the site; an order's survivors have a prior; merchant-princes' heirs have the
factor of their company, with a parchment that says the site is theirs. In wren the kingdom after the Delvers was
an order of monks. Their brothers' tablet is still in the Delvers' hall, and their prior is at Gothgiba.

The head says what they want and why, and pays a price for the prize (the warlords its worth, the poor brothers
half, the company a quarter over, to sell it on). The head also stands the company an advance, which comes off
that price. Their delving is an ambition (`data/rules/ambitions.kyr`: an ambition moves a stage at a pace while
its power is able and it is neither won nor foiled).
- On the second morning their people set out, and the talk at the inn is of nothing else.
- Every two days they are a level deeper, and their mark is on each level they pass.
- At the bottom, while the company is not on that level, a keeper still there breaks them. What they carried
  (lanterns, oil, rope) lies where they fell, and the head pays half as much again.
- If the keeper is gone and the prize still there, they bring it up. It stands in their settlement, and the
  company's errand is over.

The company can take the money, sell them the prize, or ignore them; they go on either way. In the recorded descent
the brothers were two days behind: their cross was on the shaft bottom when the company came back down on the
sixth day, and the heart came up on the eighth, two days before they would have reached it
(`test/deep-rivals.test.ts`).

**Done since: the land shows what is under it.** The ground round a deep site's door tells of what keeps its
bottom (`land` in each purpose's data, `test/deep-land.test.ts`), so that the ecology is a clue and not scenery.
Anyone sees the blight: at the mine the heather stops short of the adit mouth and nothing nests in the spoil; on
the barrow nothing grazes and no bird sits; in the cisterns' ditch there is no weed and no frog. Someone with a
skill reads more in it, and what they read is a hint at what the keeper cannot bear:
- a ranger sees that the ravens come down onto the mine's spoil only at noon, with the sun full on the hill;
- a priest of the dead sees the barrow's grass pressed flat by morning, as by something that got up again before
  the sun;
- a scholar reads the cisterns' door as a promise kept;
- the Stone-Singers' hill gives out a dirge that nobody finished.

Once the keeper is gone, the land comes back.

**Not done.** Ecology beyond this, and settlements' fortunes, were not worked on this mission. Only the one kind of ambition is
written, and its power does nothing else: it does not hire guards, buy up the oil or close the road. A deep era
sequence (a primordial age, the Mathematical Age, planar contact) was not attempted. Truth and belief are not yet
separated in what people say of history.

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
- The map draws a site's level, and above it the site's levels the company has stood on, top to bottom, the one it
  is on in ink ("The bell foundry ↓ The flood refuge"); a way off the level to another is marked up or down ("↑ Dry
  stores"). `test/level-chart.test.ts`.
- The dead click on a way with a fallen guard, and the angry owner with nothing to click, were fixed at the start
  (`baseline.md`).
- The title has Options (`web/reader/options-page.tsx`): the light the page is read by (as the device has it, paper,
  or lamplight, which darkens the day's page too; the night and the deep are dark whatever is chosen, that being
  the world's), the size of the letters, and whether the dice are told. A check's roll is now its own kind of line,
  told quietly under what came of it, or not at all. Kept in the browser; `test/reader-browser.test.ts`.
- Creation says what the reason for coming makes you ("The brothers' errand makes you a scribe, who knows lore"),
  and one who comes over the hills "with your trade and not much else" chooses the trade from the calling's own
  backgrounds, as Orsino's creation offers them (a warrior's twelve: champion, guard, mercenary, sellsword...).
  An origin's background now always holds: the letter that calls you one who reads the old script is not given to
  a mercenary. The peoples offered are Orsino's own player races, human, elf and dwarf.

- An opening incident: one who comes over the hills arrives as the town's own trouble is happening, seen on the way
  in (a mother in her doorway calling for herbs, a shepherd dragging a half-eaten ewe off the road, two men
  shouting over some stones), and so knows of it from the first page (`data/origins/wanderer/arrivals.json`). The
  other origins open on something pressing already: a debt due by market day, feverwort to be taken without
  dawdling, a mother at the hearth.

Not done:
- An incident for every town: where the town holds none of the troubles that have an arrival, one who comes over
  the hills still arrives to a quiet road.
- Conversation memory of fresh and exhausted topics beyond "asked".
- Pronouns in Kyr text (the priest's lines are written to need none).

## An independent review, and what came of it

On 24 October another agent played the deployed game (at `be30f26`) cold through the browser, as a new player, and
wrote it up: [`independent-review-2026-10-24/report.md`](independent-review-2026-10-24/report.md), with an action
log and screenshots. It is an agent's review, not a human's. Its verdict: a credible opening and real curiosity, but
"a brittle relationship to its own fiction", and it would probably not have gone on after fifteen minutes. It played
a brothers' errand to a small tin-miners' galleries (not the deep site) and fought a toll-keeper.

What it found, checked against the source, and repaired:
- **The dead spoke.** It was talking to Sergeant Mawr when it attacked him; dead, he could still be talked to, and
  answered a farewell. A conversation now ends when whoever it was with falls or turns on the company, and nobody
  down says anything (`test/the-dead.test.ts`).
- **Looking at what is on a way did nothing.** The lift-cage, the pressure plate and the speaking door opened
  nothing visible: a door drew what might be tried at it, but not what one of those opened. It now opens under it
  (`test/door-browser.test.ts`, on a new probe with a tripwire across a gate).
- **Guard closed the menu it was in**, so whom to guard was never shown. Opening one thing now closes only what is
  beside it in its own list (`src/ui/choice-tree.ts`, `test/menu-siblings.test.ts`).
- **Prose that was not so.** A crowbar taken still lay where a miner left it; winding the lift-cage up told of it
  going down; the deserters said to go off up the road stayed by their fire. Each now says what is so
  (`test/said-as-it-is.test.ts`). Finding the lift's words showed that a fight which follows something done (the
  cage wound up, and then what drops out of the frame) lost what was done; it is told now, before the fight.
- **Prepare Charge hid its commitment.** A condition now says what it binds its holder to: "Preparing to Charge:
  +2 to hit, +2 damage; and the next turn can only be Charge, nothing else."
- **The light gave no warning.** Somewhere unlit, or while a light burns, the company's light is told under the
  company: "Wenna's torch, 40 minutes left · 2 torches to spare" (`test/light-left.test.ts`).
- **A companion's wounds were missing** from the status at the foot of the page; a hurt companion now says so there.
- **Looking at an altar in the open turned the page black**, as if somewhere dark. Looking closely keeps the place's
  light; a fight, and lying fallen, are still dark.
- **The same question answered again.** Asking someone about their work is asked once.
- **News for nothing, and none to give.** A tinker crying "news for nothing" had only her work to talk of. Whoever
  goes round the roads now has news of a neighbour along one, in the travellers' own words (`src/world/region-news.ts`).
- **The last blow was lost**, and two awards of experience came with no reason. The fight's page closes as the
  last blow lands, and the account told afterwards kept only who fell; it now keeps the blow that felled each, as
  "Rharash critically hits the mud. The mud takes 11 slashing damage (0 HP left). The mud falls." Experience for
  something seen through says so: "each gain 300 experience: deserters on the road, seen through."

Not yet repaired, and why:
- **Discovery arrives as certification.** Reading one tally in the galleries teaches both who the makers were and
  how they ended, and with both known the page declares the story "whole" and points to the great work. That is how
  history is learned across every work, not a slip in one: it wants inscriptions that teach one thing each, what is
  read kept apart from what is inferred, and the reveal to need more than one source. It is the next piece of Proof C.
- **Portraits that contradict the prose** (the sergeant in a red coat painted as a courtier). The likeness scores
  station, era and sex, not dress or equipment, and when nothing fits it still takes whoever of the right sex scores
  best. I tried painting nobody that no picture fits by work or station: in a1 that left 42 of 64 people bare,
  priests, salters and innkeepers among them, so the corpus and its stations want widening before that rule can be
  used. The cure is more fitting pictures first, then fewer and smaller ones.
- **Combat leaves the scene.** Holding the outcome, the wounds and the rewards together until the player turns away,
  rather than returning at once to the place, is the next interface work.

## Invariants

`bin/` holds only `bin/kyrie`; the tools are subcommands (lint, compile, test, preview, world, voice, handbook,
orsino, playtext and more); utilities live in `scripts/`. `test/repository.test.ts` checks this, and the project
contract is [`doc/CONTRACT.md`](../../CONTRACT.md).

Every generated world must start. I started a hundred and ten (`cov0` to `cov109`, the first thirty by each of the
five origins), and two of the first thirty would not: in `cov2` the town nearest the mine keeps its god at a cross
by the way and has no shrine, but the priest's word on the walled stair was kept at a shrine all the same; in `cov24`
the brothers' prior was of the town's elves, and an elf is no cleric. The shrine's rules now stand where the priest
does, the order's novice begins there too, and a power's head takes their people's calling when the power's is not
one of them (`test/world-starts.test.ts`). All hundred and ten start. All of them have a deep site: of the first
forty, sixteen a mine, thirteen a barrow, six a singing hall and five cisterns.

## Performance and persistence

Measured in Chromium on this machine, nothing else running (`scratchpad m12/latency2.ts`):

| | |
|---|---|
| Cold load to the first page | 1.15 s |
| Begin, after reading the creation page for a few seconds | 0.22–0.28 s (2.32 s before the start was made ready) |
| Begin, an origin changed three seconds before | 3.35 s |
| Begin, clicked at once | 3.85 s |
| An action, click to second frame | 180–445 ms (engine 80–340) |
| Reload to play (Continue) | 0.95 s |

The region is 16% larger with the mine (428 KB of Kyr, 67 KB of it the mine). While the player reads the creation
page, the start itself is made ready: 1.2 s after the last change (a name, a calling, an origin) the engine composes
and compiles the world for the choices as they then stand, and a Begin asking the same takes it up at once
(`EngineHost.prepare`). A Begin asking something else starts afresh. The worst case is a change just before Begin,
when the start made ready for the old choices is still running on the engine's one thread and the new one waits
behind it (3.35 s). Clicked at once, before anything is ready, Begin takes as long as it did (3.85 s against 3.84 s
at the commit before). Parses are cached by content in memory, and a campaign load by its source, so a second start
of the same world takes 21 ms. Continue restores the compiled game. Persistence: the
whole first expedition replays from its record and resumes from a halfway save to the identical world
(`test/long-expedition.test.ts`). Local kinds come back with a saved game.

## Orsino

The behavioural audit of Orsino's dungeons against the deep sites is [`orsino-dungeon.md`](orsino-dungeon.md).
Most of Orsino's pacing and escalation is now Faithful or Adapted, read from its own tables. Missing: its shrines in
the deep, its auras, building types other than the mine, and its trap DCs (the table is copied but unused).

## What I would do next

1. Play more of it. The barrow and the cisterns have each been played from the first page, and each found a dozen
   faults that no test had. a1's first company died in the barrow's halls on the fifth day; its second, a warrior's,
   brought the crown out on the fourth morning. Thorn's brought the Wardens' reading-glass up on the fourth, and
   d4's the Stone-Singers' tuning-stone on the second, too easily, and again, deepened, less so. The mine with another company is still to play,
   and the barrow's treasury and deep grave are still unvisited.
   Things to look at from this play:
   - a level-1 company has little room for a bad fight; three of four were felled by one elite;
   - a recruit or a tool (a pole, a crowbar) is often a day's walk away;
   - the wild trails, now between neighbours, are still two to five hours a leg;
   - what lies on the way is fine, but the deep's rooms are dense with things to fight, and every one of them is a
     full fight.
2. A deep purpose for the sky art: the Star-Readers' tower, which wants the generator to build upward.
3. Let a start made ready for choices since changed give way, rather than run to its end before the new one.
4. Let what people believe change what they do: the philosophers' views reaching the town's council and its
   prices, the priest's doctrine modelled in the belief module rather than as its own facts.
5. Dynamic entities, and pronouns in Kyr text.
