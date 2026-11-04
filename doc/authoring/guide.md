# Authoring a Kyr world

This guide takes you from an empty folder to a playable region: a village with an inn and a shop, the people who
keep them, a ruin across the water, and a situation installed in it. Everything below uses only the recommended
vocabulary ([ontology.md](../architecture/ontology.md)). The example is checked by `test/authoring-guide.test.ts`,
which pulls the code blocks out of this file, installs them and plays them, so the example always works.

You need three files:

| File | What it holds |
|---|---|
| `site.kyr` | The places, passages, people, things and knowledge of your region |
| `module.json` | Which rules the site uses and which of its places a situation may use |
| `*.campaign.json` | Which site and situations to install, and a default company |

## 1. Places: one tree, from region to room

Every place sits inside exactly one other place. The kinds, from outside in, are `region`, `settlement` or
`wilderness`, `site`, `building`, `level` and `room`. Only rooms are somewhere a company can stand. Larger places
give rooms their context: a room inside a building is indoors, and a room inside a settlement is in town. Rules use
both facts. You cannot camp in the inn's taproom or on the village green, but you can on the lake shore.

A place's name is said as the page says where you are and where a way goes, so name it as a player would say it:
"the floor above", "the rooms below stairs" for the levels of a house, since a way through a level is labelled with
its name ("Up to the floor above").

A level of a town or of the hills, not of a building or a site, is a terrace: open to the sky, walked onto from the
rest of the town ("To the quay", not "Into the Dyers' Terrace"), and joined to the terrace above by a stair
(`test/fixtures/probes/terraces`).

The `at x, y` numbers are a room's cell on the map of its area. For an area, they are its position on the region
map. Rooms of different areas never share a map, so you can number each area from zero.

```kyr
Module thornmere "Thornmere" {
  Description "A lake village, the reed shore beyond it, and a drowned chapel on the far side of the ford.".

  Place mere "The Thornmere country" is region.
  Place village "Thornmere" is settlement within mere at 0, 0.
  Place shore "The reed shore" is wilderness within mere at 1, 0.
  Place chapel_site "The drowned chapel" is site within mere at 2, 0.
  Place inn "The Heron" is building within village.
  Place chandlery "Osk's chandlery" is building within village.
  Place crypt "The crypt" is level within chapel_site.

  Place green "the village green" is room within village at 1, 1.
  Place taproom "the Heron's taproom" is room within inn at 1, 0.
  Place counter "Osk's counter" is room within chandlery at 2, 1.
  Place cottage "the reed-cutter's cottage" is room within village at 0, 1.
  Place strand "the lake strand" is room within shore at 0, 0.
  Place porch "the chapel porch" is room within chapel_site at 0, 0.
  Place nave "the flooded nave" is room within chapel_site at 1, 0.
  Place stair_foot "the foot of the crypt stair" is room within crypt at 1, 1.
  Place ossuary "the ossuary" is room within crypt at 2, 1.
```

## 2. Passages: how places connect

A passage joins two places and can be used in both directions unless it is `one way`. Its kind says what it is
physically. The kinds are `passage`, `door`, `doorway`, `arch`, `gate`, `stair`, `steps`, `ladder`, `shaft`, `path`,
`track`, `road`, `causeway`, `bridge`, `ford`, `tunnel`, `crawl`, `culvert`, `drift`, `incline` and `ferry`. Its
duration says how long it takes to cross: a minute through a door, doorway, arch or gate, two on a stair, steps or a
ladder, ten minutes for anything else, unless you write `taking 3 minutes`, `taking 30 minutes` or `taking 2 hours`. A
passage can be `hidden until` a fact is known (the name of a Discovery or a fact entity, not a condition: `hidden
until chute_known`, never `hidden until knows(party, chute_known)`: Quittance's 20), or `needing` a skill or an item
kind (a Change too, and either of two:
`needing crowbar or lockwork`). A way can need something going one way only, to one of its ends (`needing rope going
to whelm`) or from it (`needing rope from brink`): a company comes up the stairs out of the Whelm without what it needed
to go down them, and the map draws one way (`test/fixtures/probes/one-way-need`; the Grand Tour's W2 wrote each such
way as two one-way passages, and a rule to lift a company that could not climb out).

A way is offered by where it goes ("To the Kept Hall"), which gives a decoy away. One the module marks
`Initially Assert unmarked(left_way).` is offered by its own name, "By the left-hand passage", until the company has
been where it goes, or a rule retracts `unmarked(left_way)` (the script over it read): Let One Remember's F6, which
had renamed each room until reached (`probes/unmarked`). So a journey's steps name a way by where it goes ("To the
weir stones"), and a path split in two at a new room is walked by new steps (Gosse's Company's second pass).

```kyr
  Passage heron_door "the Heron's door" is door between taproom and green.
  Passage chandlery_door "the chandlery door" is door between counter and green.
  Passage cottage_door "the cottage door" is door between cottage and green.
  Passage shore_path "the shore path" is path between green and strand taking 1 hour.
  Passage ford "the chapel ford" is ford between strand and porch taking 30 minutes.
  Passage chapel_door "the chapel door" is doorway between porch and nave.
  Passage crypt_stair "the crypt stair" is stair between nave and stair_foot.
  Passage ossuary_arch "the ossuary arch" is arch between stair_foot and ossuary.
  Passage bone_chute "the bone chute" is shaft between ossuary and strand one way hidden until chute_known.
```

`kyrie lint` checks that the kinds make sense. A stair that does not change level, or a road that ends indoors, is
reported. A ladder is a climb wherever it goes: up a table leg, or into a loft over the same floor, it needs no level
of its own (Behind the Wainscot's 4).

## 3. The company and the people

The company is declared once, where it starts. Its members come from character creation, or from the campaign's
default `party` if the player skips creation. Coin and rations given to the company go into its members' purses and
packs.

```kyr
  Company party "Your company" of 3 at green.
  Initially Set quantity(party, gold) to 8. Initially Set quantity(party, rations) to 1.
```

A company may be of as many as are chosen for it, within bounds: `Company party "Your company" of 1 to 3 at green.` is
of one, two or three, and of one when nobody chooses (`test/fixtures/probes/company-range`; the Lull's F12 kept a copy
of its module for a campaign of three).

A person is a `group` wherever a relation, query or action names one: there is no `person` type, and `Relation
named(person)` will not load where `Relation named(group)` does (the Book of Faces' BOF-32). Each argument may be named
for the part it plays, which tells apart two of one kind: the shared `Relation addressed(person: group, company:
group)` takes the person first, and the handbook and a refused call say so (Wapshott's Circus's 7: written the other
way round, its `metCircus` never held, and nothing warned; `test/relation-roles.test.ts`).

A person has a place and whatever you choose to fix about them: `Ancestry`, `Calling` (class), `Level`, a
`Profession`, a `Background`. Anything you leave open is filled by generation, if the campaign generates people, or
by a default. **What you write always wins.** If a generator suggests a different ancestry, it is ignored and the
conflict is reported by `kyrie lint`.

A profession or background is an overlay adapted from Orsino. It can add attribute modifiers, coin, gear, skills,
services offered to others, and a daily routine. An innkeeper offers lodging and keeps the inn without you writing
either. `Sells` stocks goods, which are counted, or item kinds, which become individual items on the shelf. `Offers`
adds or replaces a service.

```kyr
  Person wenna "Wenna" at taproom {
    Role "innkeeper". Profession innkeeper. Peaceable.
    Sells rations for 2 coin from 4.
  }
  Person osk "Osk" at counter {
    Role "chandler". Ancestry dwarf. Peaceable.
    Sells rations for 2 coin from 6.
    Sells rope for 1 coin from 2.
    Sells bandages for 1 coin from 3.
    Offers healing "salve and clean linen" for 2 coin.
  }
  Person tam "Old Tam" at green {
    Role "eel-catcher". Background hunter. Calling ranger. Peaceable.
  }
```

A `Role` says who someone is, after their name: "Wenna, the innkeeper", "Old Tam, an eel-catcher". Write it as you
would after a comma, without an article; the page gives it the one it wants ("the" for an office, "a" or "an" for the
rest), and says as written a role that begins with its own ("the smith", "who speaks for the parish") or says whose
someone is ("Master Harker's clerk"). A role should not name its person again ("Lady Wenlock, a Lady Wenlock"): the page
says it once, and `kyrie lint` points it out.

A role is said wherever its person is. One that puts them somewhere ("a day stoker at the retort-house") is said
only where it is true, `when` it holds, instead of who they are otherwise (`test/fixtures/probes/role-when`):

```text
  Person mallow "Mallow" at retort_house { Role "a stoker off shift".
    Role "a day stoker at the retort-house" when at(mallow, retort_house). Peaceable. }
```

`kyrie lint` advises of a role that places someone a rule, an action or an errand moves; what they are wherever they
go (a trade, "a die-sinker, retired by the Phoenix") it leaves alone (`test/role-lint.test.ts`; Quittance's an 12, ll 9,
ms 11).

Backgrounds and professions are in `data/catalog/backgrounds.json`:

- Professions: `innkeeper`, `herbalist`, `priest`, `boatman`.
- Backgrounds: `hunter`, `medic`, `locksmith`, `explorer`, `miner`.

Some backgrounds require a class; `hunter`, for example, requires a ranger.

### Classes, traits, equipment and creatures

A person of an ancestry can have a class, a level, traits and equipment.

- **Trait** names a specialization or a feat. A class with specializations takes exactly one: a cleric's domain
  (`vitalist`, the life domain), a mage's school (`evoker`), a warrior's disposition (`brave`, `toughness`,
  `strong_willed`). Name it, or one is drawn at random. A specialist person prepares spells as Orsino's casters do:
  every cantrip of its tradition, and a few spells of its school or domain up to half its level, rounded up. A feat,
  such as `knight`, needs whatever its own requirements say (the knight needs level 3). Lineage traits, such as a
  dwarf's `sturdy`, are not chosen: a person is born with its ancestry's traits.
- **Carries** gives them one of an item kind. A person already starts with a weapon and armour drawn from its class's
  tables; a carried weapon or armour takes the place of that draw and is worn. Other equipment is worn if its slot is
  free, and grants the skill or technique it carries.

A creature that is not a person of an ancestry is a **Species**: a wolf, a cave hound, a golem, a dragon. A species
brings its own statistics, natural attacks and nature traits, so it takes no class. A variant such as `frost_wolf`
or `red_dragon` names its base species in the catalog and changes only what differs.

```kyr
  Person reeve "Hollis" at green {
    Role "reeve". Ancestry human. Calling warrior. Level 3. Trait brave. Trait knight. Background locksmith.
    Carries longsword_of_flames. Peaceable.
  }
  Person sister "Sister Maren" at taproom {
    Role "travelling healer". Ancestry dwarf. Calling cleric. Level 3. Trait vitalist. Background medic. Peaceable.
  }
  Person wolf "a grey wolf" at strand {
    Role "a lone wolf, thin from the winter". Species wolf.
  }
```

The catalogs live in `data/catalog`, one file per concept: `ancestries`, `species`, `classes`, `traits`,
`backgrounds`, `abilities`, `conditions`, `items`, `skills`, `religion`, `organisms` and `rules`. Use the plain
identifiers you find there. Former identifiers still resolve through `aliases.json`, but lint reports them.

### How a creature meets you

A creature that is not `Peaceable` meets a company that comes where it lives by its **temperament**:

- **territorial**: warns, then comes at whoever stays;
- **defensive**: warns, and fights only in its lair;
- **savage**: comes at once;
- **ambush**: strikes, unless a watchful company sees it first; but it gives itself away to a company in the place
  next door, once (a sign in its kind's words, `temper_words_ambush_sign`), so going in is a choice;
- **wary**: slips away to its refuge, and fights only when cornered there;
- **obedient**: keeps its post;
- **proud**: names a price;
- **seizing**: warns, then takes whoever stays, with no fight (`captured(weights, party)`); what follows (the cells, a
  fine) is the module's (What Tessary Owes' Weights, W9).

A species has its own temperament, and a monster without one takes its type's: a beast is territorial, the undead
savage. A person can be given a temperament, and its own words, in its declaration. From *The Long Man*
([data/adventures/the-long-man](../../data/adventures/the-long-man)):

```text
  Person wet "the Wet" at leak {
    Role "a heaving mass of wet clay". Species mud_elemental. Level 5.
    Temperament territorial.
    Warns "At the far end of the wet gallery the floor heaves, and a shape stands up out of the clay, streaming, as tall as a door.".
    Comes "The Wet comes down the gallery at you, faster than mud should.".
  }
```

The words are:

- `Warns` and `Comes`: its warning and its onslaught;
- `Arrives`: how it comes where the company already stands (put there by a rule, or on its own errand), said as it
  comes and before it warns: the shared rules' warning had come before the module could say how a band came (the
  Liberty of the Ice's 22; `test/fixtures/probes/arrives`). A company coming to it is not its coming;
- `Flinches` and `Pleads`: what it does when it is frightened off, and when it is beaten;
- `Lair`, `Refuge` and `Fears`: where it holds, where it runs, and what drives it there (`Fears sunlight.`). What it
  fears is a capability the company has, by what it carries (a lit torch is flame) or granted for a while by what it
  does: `Assert granted(actor, flame). Set grantedUntil(actor, flame) to watch(clock) + 12.` (a brand held up high,
  for two hours; `test/fixtures/probes/brand`);
- `Objects`: what a person says on seeing what is theirs in the company's hands (see "Whose things are", below);
- `Joins` and `Leaves`: what they say on joining the company and on leaving it; `Leaves "…" to <place>.` also takes
  them there as they go, so one who says they are gone is not still among those here;
- `Farewell`: what they say when the company takes its leave of them, every time, in place of the tables' farewells;
- `Greets`, and `Greets again`: what they say the first time the company speaks to them, and when it comes back. One
  with a `Greets` of their own and no `Greets again` says nothing on a return, rather than a line of the voice
  tables that thirty others share.

A creature given no words is told in plain ones: "A grey wolf stands its ground and watches you. It will not have
you here for long."

Only a creature that warns leaves the company a turn for anything but a fight. One that falls on the company without
warning (savage, obedient at its post, wary when cornered, or a person a module sets on it) is seen as it moves: in the
fight's first round the company acts first, and can get back the way it came for certain; the page says how it
reckons the fight. One that lay in wait (an ambush) strikes first, and the company's turn after its first blows is its
moment; one that warned and was not heeded gives none. Running at any other time is an even chance, surer each time
it is tried and fails: three in four the second time, sure the third.

An action that puts the company where a band is races the band's warning: the shared rules warn on the next pass,
before a rule of the module's own can say how the company came there. Settle it in the action's own effects (the
watermen's sledges, which bring the company down onto the sledge road, assert that the wolves tolerate it, and a rule
says how they were outrun: the Liberty of the Ice's 24).

A crew that lets the company be (`tolerates`) is turned on it by retracting that, in the act or rule that turns it: a
stealthy act gone wrong says `On failure { Retract tolerates(sons, actor). }`, and the page tells the act's
`Otherwise`, then the crew's own `Warns`, and it comes on in its `Comes` when its patience is spent. Do not assert
`warned`, `halts` or a `patience` by hand: they are the shared rules' reckoning of a warning, and set by hand they
silence the crew's words and the act's (Quittance's bg 9; `probes/turned`).

A danger with ways round it (a weight held out, a quiet slip along the pool) is territorial or defensive, with a
`Warns` in its own manner that says what the ways round are (What Tessary Owes' Forsworn, W14). Each thing done while
warned spends its patience, so the warning should name its price and the alternative (Bettany Slake's "Five coin for
the use of it, or back up the street the way you came", W22). The patience is the rest of the watch it warned in, and
the page says how long is left ("The wolves will wait 8 minutes more, no longer."), and marks what would take longer;
a module's own answer to a warning (a name given, a letter shown) is an action that retracts `warned` and asserts
`tolerates` within it (the Banns at Hessel's 23). Warned off, one with a `Refuge` gives ground and goes
there, in the plain words of its temperament unless it has words of its own.

Someone not yet in the story, or gone from it, is `nowhere` in place of `at` a place: they cannot be met, spoken to or
seen from the road, and warn no one (Wapshott's Circus's 4: a fortune-teller parked in a hedge was met there before
her entrance; Quittance's 29: wardens sat in their house warned every company from the first minute). They come into
it when something holds, `Arrives at house when hour(clock) >= 17.`, once, and are said to come by their own
`Arrives "…"`; a rule that retracts `at(sallow, ?p)` sends someone out of it again (`test/fixtures/probes/offstage`):

```text
  Person wardens "three wardens of the Phoenix" nowhere {
    Role "the Phoenix's wardens". Ancestry human. Numbers 3. Temperament territorial.
    Arrives at house when watch(clock) >= 6.
    Arrives "Three wardens in brass helmets come in from the yard and stand across the hall.".
  }
```

Someone can be called something else until they are known, or while something holds: `Known as "a woman in a grey
shawl" when not knows(party, her_name).` Until it is false the page calls them that, in place of their name and role
(a mask, a hood, a face not yet put to a name). Whoever the company has spoken with it is `acquainted` with, for good:
`Known as "an old man with a pole" when not acquainted(hob, party).` is Hob from his greeting on, whichever way the
company came to him (`test/fixtures/probes/acquainted`; Quittance's ll 17, where only one topic taught his name).

## 4. Things with states

A thing stands at a place or on a passage, and is in exactly one state at a time. Each state has the description the
player sees while it holds; the description of the state a change leads to is what the player is told when they make
it. A `blocking` state closes the passage the thing is on, and a `dangerous` state hurts whoever crosses. A `Change`
moves the thing from one state to another. It can need a skill, an item kind or one particular item, or consume a
good, and `at` a place it can be made from there alone. You never write a separate scene line saying the gate is
open: the gate's state says it. `changedBy(thing, who)` says who last changed a thing by one of its changes, so a rule
can ask who opened the lockbox, not only that it is open (What Tessary Owes' W15; `test/fixtures/probes/changed-by`).
A change can be made only while something holds, and say why not while it does not, beside the thing: `Change pick
"Pick the escritoire's lock" from locked to open when not at(footman, drawing) "Pargeter stands over the escritoire."`
(`test/fixtures/probes/withheld`; the Grand Tour's 7 offered the lock with the footman standing over it). `kyrie
inspect` names the condition it waits on.

A thing on a way is told at both its ends; one seen from one end only says so (`Thing step "the deep step" on ford from
far_bank`), and so may a line beside a way (`Observe post beside ford from near_bank when true "…"`). A thing on a way
from one end that bars it, bars it from that end only: `Thing toll "Ma Riser's toll-bar" on ladder from foot` with a
`blocking` state stops a company going up, and lets one come down free (`test/fixtures/probes/toll-up`; Behind the
Wainscot's F5, whose toll had been two one-way ladders).

```kyr
  Thing grille "the rusted grille" on ossuary_arch {
    State shut blocking "A rusted iron grille closes the ossuary arch.".
    State open "The grille hangs open on one hinge.".
    Change force "Lever the grille open" from shut to open needing crowbar.
    Change pick "Pick the grille's lock" from shut to open needing lockwork.
  }
  Item lever "a sexton's bar" is crowbar at nave.
```

A key that opens one lock and no other, and a bar on one side of a door, from the counting-house fixture
([test/fixtures/counting-house](../../test/fixtures/counting-house)). A rusty key of the same kind lies in the street
and does not open the strongroom, and from the yard the bar cannot be reached:

```text
  Item brass_key "the strongroom key" is cell_key in coat owned by pim.
  Thing strong_lock "the strongroom lock" on strong_door {
    State locked blocking "The strongroom door is locked.".
    State open "The strongroom door stands open.".
    Change unlock "Unlock the strongroom door" from locked to open needing brass_key.
  }
  Thing back_bar "the bar on the back door" on back_door {
    State barred blocking "The back door is barred.".
    State unbarred "The back door is unbarred.".
    Change lift "Lift the bar off the back door" from barred to unbarred at office.
  }
```

A mechanism of your site is a **Hazard**, written in the same effect language as abilities. It belongs to your
module alone; no other world sees it. A thing hurts whoever crosses it while it is in a dangerous state.

```kyr
  Hazard bone_slide "A slide down the bone chute" means "Deal (1d4) physical damage to ally unless dexterity save against (10).".
  Thing chute_bones "loose bones" on bone_chute {
    State loose dangerous "Loose bones slither down the chute.".
    State settled "The bones have settled at the bottom of the chute.".
    Hurts with bone_slide when loose then settled.
  }
```

What it hurts with, it hurts once, and then is as its `then` says. A danger met on every crossing (foul air in a shaft)
is one that stays as it was, `Hurts with foul_air when foul then foul.`: each crossing is a risk, and the company that
takes it goes over (`test/fixtures/probes/foul-air`; Quittance's bg 7, whose company had been turned back each time).

## 5. Knowledge

A discovery is something that can be known. Its sources are where it can be learned: a document to read, or a person
who will say it. A passage hidden until a fact is known appears on the map once the company knows that fact.

```kyr
  Discovery chute_known "A bone chute drops from the ossuary to the strand; the sexton's ledger marks it." {
    Source ledger "the sexton's ledger" at porch readable by party.
  }
```

A discovery need not have a source. What people know, or a scene shows, is a discovery with nothing to read: `Known
by` says who knows it already, and a topic, a scene or a rule teaches it.

```text
  Discovery strongroom_rumour "The strongroom holds the factor's black ledger." { Known by porter. }
  Discovery wall_known "The Long Man is a wall: it holds Hollow Water back from the dale, and the beck comes through it by a culvert.".
```

A scene can teach what it shows. `teaches` makes seeing it knowing it, and the journal will say "you saw it":

```text
  Observe yard_held at churchyard when holds(necromancer, churchyard) "Fresh earth lies thrown out of the deepest grave under the yew." teaches churchyard_fallen.
```

Condition objectives on what the company knows, not on what has happened where it cannot see.

### A question put to the company

A question someone puts to the company is a topic put `once`; its answers are topics `answering` it. They are offered
once the question has been put, under "Your answer" on the page rather than among the rest, and one of them is given
(`test/fixtures/probes/question`; Low Water's 5 and the Liberty of the Ice's 10, whose answers had stood among the
topics as topics).

```text
  Topic callow_asks with callow "Ask Callow what he wants of you" when true once {
    Says "'Which of you,' says Callow, 'is bound by the hand you gave the Reeve?'".
  }
  Topic say_bound with callow "Say that you are" answering callow_asks when true {
    Says "Callow nods slowly. 'Then the Court will want you, and not the others.'".
    On discuss { Assert bound(actor). }
  }
```

### Said to someone, and it may not come off

Talking someone round, lying to them, asking what they may refuse: an action with a `Speaker` is said to them, and
stands in the talk with them among what can be asked, not among the place's actions. It may roll, and the page says
the odds; their answer is its `Result` or its `Otherwise` (`test/fixtures/probes/spoken-roll`; A Winter in Carth's
10, whose persuasions sat among the actions). It is the topic that rolls: a word that may not come off is written so,
not as a `Topic` (Fair Weather's 16).

```text
  Action ask_will(actor: group, site: place) "Ask Will to light the hearth himself, for the child" {
    Speaker will.
    Requires able(actor) and at(actor, site) and at(will, site) and not consented(will).
    Resolve check(actor, persuasion, dc_hard).
    On success { Assert consented(will). }
    Result "Will Scaife gets up, and you hear him at the mantel.".
    Otherwise "Will Scaife hears you out in the dark, and does not move.".
  }
```

### Asking, giving, selling, waiting

Standard actions cover the usual exchanges, so a module says what a person wants and how they react, not how
the handing over works. Before, a salvager paid for her bearing with a bespoke action:

```text
  Action deliver_prize(actor: group, carrier: member, site: place) "Hand {prize} to {salvager}" {
    Requires able(actor) and at(actor, site) and at(salvager, site) and memberOf(carrier, actor) and awake(carrier)
      and ownedItem(prize, carrier) and not departed(salvager) and watch(clock) < expiresAt(permit).
    Resolve drop(prize, carrier).
    On success { Assert delivered(prize). Decrease quantity(salvager, gold) by 6. Increase quantity(actor, gold) by 6. }
    Result "{salvager} hefts {prize}, checks the stamp against {permit}, and counts six coins into your hand.".
  }
```

Now she buys it like anyone buys anything, and reacts to having it (these snippets are from other modules, not
Thornmere):

```text
  Person salvager "Someone" at station { Role "salvager". Buys bronze_bearing for 6 coin. }
  Event paid near salvager when keeps(salvager, prize) "{salvager} hefts {prize}, checks the stamp against {permit}, and counts six coins into your hand." then { Assert delivered(prize). }
```

What someone answers when asked is a `Topic`: what the company says (the choice's label), when it can be said, what
they say back, and what saying it does.

```text
  Topic give_letter with priest "Give {priest} the brothers' letter" when expects(priest, actor) once {
    Says "{priest} reads it by the door, where the light is, and then reads it again.".
    On discuss { Retract expects(priest, actor). Assert knows(actor, found). }
  }
```

`once` means what it does is done once. A topic that did nothing but teach (an answer, a way, a name) is offered
afterwards as "Ask {priest} again about …", for the same answer and nothing more: a player who has forgotten what was
said can hear it again (the notes keep it too). One that did anything else (a letter given, a key handed over) is
not offered again. Only a topic worded as a question ("Ask {priest} about …", "… why …") is offered again; one worded
otherwise ("Tell …", "Put it to …") goes once said. Write `once only` for a question whose subject can go (a man asked
why he will not go home, who later does): it is not offered again, and needs no guard of its own to stop being asked.
A journey step that names the first wording matches the "again" offer once the first is gone, so a step meant to ask
once comes before anything that would ask it again.

What a topic or an action puts in the company's hands is given in so many words: `Give davy_coat to actor.` gives the
coat to the first of the company who is up, out of whoever had it or from wherever it lay, and the page says "You take
Davy's red coat." Nothing need be set on the floor to be taken (What Tessary Owes' W3, the Banns at Hessel's 14).
A kind given (`Give keepsake_kind to actor.`) is a new one of that kind, each time: a gift, a playbill, a loaf, with
nothing parked in a room to be found first; any kind of the catalog too (`Give lantern to actor.`), and as many as
are said (`Give 2 healingdraught to actor.`). What is given is held: `holding(actor, crypt_key)` holds of it, and a
way `needing crypt_key` opens to it, so a job's key can be given with the job (the town's troubles).
`Spend weight_stone from actor.` gives up one thing of that kind, whichever of the company carries it, and
`holding(actor, weight_stone)` in a requirement says it has one to give (Low Water's 6, which had a pan and a rule on
what was put in it). Named by its own id, `Spend nan_ribbon from party.` gives up that particular thing and no other of
its kind (the Lull's F5, which needed a kind for each ribbon that had to go). `Restore ?c.`, in what a rule or an act
does, makes whoever it names whole: every hit point, no condition, risen if they had fallen or died; so a law that harm
heals at sunset, a raising, a regeneration is written (`test/fixtures/probes/made-whole`; the Lull's F1):

```text
  Topic coat_given with nan "Ask Nan about Davy's coat" when toldNan(actor) once {
    Says "'Take him this,' says Nan. 'He was always cold.'".
    On discuss { Give davy_coat to actor. }
  }
  Action weigh(actor: group, site: place) "Set a weight-stone in the Assayers' pan" {
    Requires able(actor) and at(actor, site) and at(pan, site) and holding(actor, weight_stone).
    On success { Spend weight_stone from actor. Increase weighed(pan) by 1. }
  }
```

`Slay ?g.` is the other way: whoever it names is dead, in the story and in the body, slain for good, so `dead(ullin)`
holds and the page says so; a Second killed on the Stair in the night is `Slay ullin.` in the rule that tells of it
(`test/slay.test.ts`; the Book of Faces' hill 8, whose fates had said it of an offstage double).

`Assert keeps(actor, heart)` does not do it for the company: what it carries is in its members' packs, so what it
keeps is in nobody's hands, and `kyrie lint` says so (Low Water's 3). What someone else keeps is theirs.

`Wants burial_register.` makes the standard `give` available to that person; `Buys … for … coin.` the standard
`sell`. A long activity that someone arriving should break off says so: `Interrupted when threatened(actor).` Its
time passes a watch at a time, and its success applies only if it runs its course.

### Objects: inside, hidden, trapped, tried

A thing can hold others (`Holds.`), and a state flagged `closed` keeps what it holds out of sight and reach. Items
and things can start inside one (`in chest`), and anything can be `hidden until` a fact the company learns; a
discovery can be `Found by searching` a place (optionally `with` a skill), and is then seen there from that time on.
A thing can be tried as what it is: anything looked over closely; one that holds or shuts also prodded with a pole,
pried at with a bar and listened at; one that blocks a way (`on` it) listened at, pushed and pried at; one set in a way
that hurts, prodded from a pace off. Any other try is offered by naming it, `Tries burning, pushing.` (Quittance's
A11: a thing offered only Look closely, and the guide had said every try was offered). Offering a try reveals nothing; what a try finds is an observation or a rule on `tried(thing,
verb)`, and a try that finds nothing says so. A trap is a thing whose rule asserts `strikes(hazard, party)`; the
world turns the hazard on one member, as the dice choose; `strikes(hazard, ?m)` on a member the rule finds strikes
that one (`memberOf(?m, party) and brings(?m, lockwork)`: whoever picked the lock; `test/strikes-member.test.ts`, the
Book of Faces' counting 2). From `test/fixtures/strongroom`:

```text
  Thing chest "an iron-bound chest" at study {
    Holds.
    State locked closed "An iron-bound chest stands under the window, locked.".
    State open "The chest stands open.".
    Change pick "Pick the chest's lock" from locked to open needing lockwork.
  }
  Item vial "a vial of physic" is healingdraught in chest.
  Observe needle_tell near chest when tried(chest, looking) and state(lock, armed) "Around the keyhole the brass is scratched bright…" teaches needle_known.
  Rule needle_springs when state(lock, armed) and not state(chest, locked) { Assert strikes(needle_poison, party). Assert state(lock, sprung). }
  Discovery alcove_known "Behind the hanging map, a low alcove is cut into the wall." { Found by searching study. }
  Passage alcove_way "the low alcove" is crawl between study and alcove hidden until alcove_known.
  Rule ceiling_falls when state(ceiling, poised) and not inside(?weight, plate) { … Assert strikes(falling_stone, party). }
```

### Chance, weather and the dark

A campaign that keeps a calendar (`"calendar": { "year": 1312, "month": 11, "day": 3 }`) counts Imbar's twelve months
of thirty days and its sennight of seven, Sunday to Saturday, running on across the months; the page says the day as
"Monday, the 3rd of Deepwinter…", so a prose that names weekdays agrees with it (the Lull's 11).
`season(clock)` is the season by the campaign's calendar, when it keeps one (1 spring, 2 summer, 3 autumn, 4 winter;
0 with none: Gosse's Company's 7), and `been(party, place)` holds of every place the company has stood in, from the
first time, the engine's own record: where it began, and wherever it came to stand, by a way, a rule or a journey
(the Grand Tour's 13) (Quiet in the Sky's 6: for "come back to", ask `been` and that the company was elsewhere since, as a
relation of the module's own). `dice(clock)` is a die from 1 to 100 thrown every watch from the campaign's seed; a rule
that reads it is how a world leaves something to chance (a band on the road at night, the weather turning). Weather is a `scenery` entity
whose state other things follow by rules; scenery has states and descriptions but is not offered to be tried. A
thing on a way the company does not know of is not noticed, so it does not give the way away. From the Varrow, a
region since retired (it is in the history before commit e4b485b):

```text
  Entity sky: scenery "the sky over the Varrow".
  Rule rain_comes when untilLight(clock) == 1 and state(sky, fair) and dice(clock) <= 25 { Assert state(sky, rain). }
  Thing spate "the Varrow at the ford" on the_ford is scenery {
    State fordable "The Varrow runs knee-deep and clear over the ford stones.".
    State swollen blocking "The Varrow is in spate, brown and loud, over the ford stones. Nobody crosses today.".
  }
  Rule ford_swells when state(sky, rain) and state(spate, fordable) { Assert state(spate, swollen). }
  Rule gap_slow when state(sky, rain) { Set travelTime(gap_road) to 18. }   // in watches of ten minutes: three hours
  Rule raiders_on_road when at(party, barrows) and (dark() or state(sky, fog)) and dice(clock) <= 3 and … {
    Assert at(raiders, barrows). Assert assails(raiders, party). }
```

`dark()` holds from nine in the evening until six in the morning, unless the campaign keeps its own night beside its
calendar: `"night": { "falls": 17, "lifts": 7 }` in its campaign.json is dark from five until seven, and `untilDark`
and `untilLight` count to those hours (A Winter in Carth's February in the north, its friction 1).

`lightless(place)` is a place where light dies: only a company with `sunlight` sees there, and `benighted(company)`
covers it as well as an unlit place without a light. A change can be `consuming` a kind of item, which uses one up.

In the dark nothing is seen, but what sounds or is felt there still is: an observation `as sound` or `as felt` is told
with every light out, as the sea breaking below a grey shore (`test/fixtures/probes/dark-shore`; the Patient Star's 4,
the Road's F5). A light carried can be put out ("Put out Ama's light"), and what was left of it is spent: the dark is
the dark again (the Road's B3: a lantern smothered in a coat had stayed lit).

```text
  Observe surf at shore as sound when true "Somewhere below you the sea breaks on stones, and draws back.".
```

### Tolerance, keys and guests

`tolerates(x, company)` means x lets the company be: it does not bar the company's way, fall on it, or break its
rest. A toll, a bribe, an audience or a bargain is a rule or action that asserts it, and a betrayal retracts it. Any
person or creature, a band of them as well, can stand over a way: a `blocking` state and `Guards drain_way.` bar it
until they let the company by (`test/fixtures/probes/guarded-way`: six rats over a drain, thrown bread). Those who
guard a way can be fought from either side of it, so Attack is offered against them from the room before it
(Quittance's friction 24); one who should only be met inside is at their place, not guarding the way in.
`keyholder(x, thing)` lets x, and whoever serves x, through a way that thing bars. From the Lanthorn, also retired:

```text
  Action pay_toll(actor: group, site: place) "Pay the wardens the Toll, six coin" {
    Requires able(actor) and company(actor) and at(actor, site) and tollAt(wardens, site) and able(wardens)
      and state(wardens, watching) and not tolerates(wardens, actor) and quantity(actor, gold) >= 6.
    On success { Decrease quantity(actor, gold) by 6. Assert tolerates(wardens, actor). } }
  Initially Assert keyholder(ninefingers, gate_bar). Initially Assert serves(carters, ninefingers).
  Change scorch "Unstop the noonlight at the Unlight" from ravening to scorched consuming noonlight.
```

### Whose things are

An item can be someone's: `owned by pim`. When the company carries it where its owner can see, the owner objects,
once, and is hostile to the company after. Someone who `serves` the owner goes to tell them. Lending excuses it: a
topic or an action that asserts `lends(pim, brass_key, actor)` lets the company carry the thing in front of anyone. A
person's `Objects "…"` is what they say, with `{?i}` for the thing they saw. Without it they say "That is mine." From
the counting-house fixture:

```text
  Person porter "the porter" at office {
    Role "the counting-house porter". Ancestry human. Peaceable.
    Objects "The porter looks at {?i} in your hands, and at you, and goes out without a word to find Pim.".
  }
  Initially Assert serves(porter, pim).
  Item brass_key "the strongroom key" is cell_key in coat owned by pim.
  Action bribe_pim(actor: group, site: place) "Pay Pim ten coin to leave the key on his desk and go out for air" {
    Requires able(actor) and company(actor) and at(actor, site) and at(pim, site) and quantity(actor, gold) >= 10
      and inside(brass_key, coat).
    On success {
      Decrease quantity(actor, gold) by 10. Increase quantity(pim, gold) by 10.
      Retract inside(brass_key, coat). Assert inside(brass_key, desk). Assert lends(pim, brass_key, actor). Assert at(pim, street).
    }
    Result "Pim looks at the coins, and at the door, and puts the key on his desk and goes out for some air.".
  }
```

An item may have states and changes as a thing has, in a block after it: they are seen near it, lying somewhere or
carried, and made by whoever reaches it, the company that carries it among them (Quittance's ll 13, whose lantern's
little door could not be opened; `probes/item-state`):

```text
  Item salamander "the Salamander lantern" is lantern at lamp_room {
    State latched "The lantern's little door is latched; something moves behind the horn.".
    State open "The lantern's little door stands open, and a spark sits in it, looking out.".
    Change unlatch "Open the lantern's little door" from latched to open.
  }
```

An item lying in a room (`Item ladder "the Guild's ladder" is folding_ladder at yard owned by clerk.`) is offered as
"Take" under its name to a company that has noticed it: one `hidden until` a fact is taken once the fact is known.
One `at nowhere` is nowhere to be taken, and comes only by being given. A topic that lends it (`On discuss { Assert
lends(clerk, ladder, actor). }`) lets the company take it up in front of its owner (Quittance's sd 6 and wk 8;
`probes/lent-ladder`).

A servant bought off stops serving: in *The Long Man*, paying Dunnet's wages retracts `serves(dunnet, venn)`. One who
`Resents "…"` says that on seeing what is theirs in the company's hands, and is not made its enemy by it: they can
still be talked to (What Tessary Owes' W8; `test/fixtures/probes/resents`).

## 6. Descriptions

An observation describes a place while its condition holds. Write what the company sees; leave out how the game
works. `kyrie lint` reports text that explains the implementation ("persists", "the engine", "flag"). A module needs
no `Goal`: objectives say what the company is trying to do.

```kyr
  Observe green_scene at green when true "Cottages lean around a muddy green. The Heron's sign hangs over one door, and Osk's chandlery smells of tar and candles.".
  Observe taproom_scene at taproom when true "A peat fire and a long table. Eel nets dry in the rafters.".
  Observe counter_scene at counter when true "Coils of rope, jars of salve, and sacks of meal behind a scarred counter.".
  Observe cottage_scene at cottage when true "One room, a reed bed, and a window facing the water.".
  Observe strand_scene at strand when true "Grey water laps a pebble strand. Across the shallows, the chapel's roofline breaks the surface of the reeds.".
  Observe porch_scene at porch when true "A stone porch above the waterline. A ledger lies swollen on the bench.".
  Observe nave_scene at nave when true "Knee-deep water fills the nave. Steps go down at the far end.".
  Observe stair_scene at stair_foot when true "Dry air, and the smell of old bone.".
  Observe ossuary_scene at ossuary when true "Shelves of skulls, and a square black opening in the floor.".
}
```

A double quote inside a text is written `\"`. A text is one paragraph: it cannot hold a line break (the Book of
Faces' BOF-19).

A place is told in the order its lines are written: first what it is (an `Observe` with no `as`), then its features,
signs, weather and ambience (`as feature`, `as sign`, `as weather`, `as ambience`), each in the order written; then who
and what is there, each with its own state. A sentence about a thing that is to come at a chosen point of the place's
telling is an `Observe` of the place, written there, and told while the thing is so: the newer tablet under the west
window after "One tablet only says, HE CAME TOO LATE", not after the smell of wax (`test/fixtures/probes/place-lines`;
the Banns at Hessel's 24).

```text
  Observe nave_scene at nave when true "Tablets line the nave. One tablet only says, HE CAME TOO LATE.".
  Observe tablet_newer at nave when state(tablets, newer) "Under the west window one tablet is newer and whiter than the rest.".
```

A line that is to replace another while something holds is written `instead of` it, in any of the module's files, and
the other is not told meanwhile: `Observe oven_cold at bakehouse instead of bakehouse_scene when coalDead(bakehouse)
"The oven is cold…".` (`test/fixtures/probes/instead`; Quittance's ms 4 could only add the cold oven below "banked and
breathing").

The page at a glance gives a place's first two sentences, with its people and its signs; the rest is under Look
about, and a place come back to is recalled by its first sentence. So a place leads with what matters most in it
(the Lull's friction 10; the sentences split as the page splits them, not at "Mr." or "St.", GTR-17).

An `Observe` is told once for each time the company comes, or once when it comes to hold while the company is there,
and not again while it stays; come back, and the place is recalled by its first sentence. That is the intended rule: a
line about what has changed (the hall ashamed after the hearing, the afterglow of a fire) is told at the step that
made it so, and not read back later. What should stand on the page for as long as it is so belongs to a thing, as one
of its `State`s, which the page shows with the thing each time, or to a topic, which can be asked again (Quittance's
11; its pm 4, wk and sd found the hall's new line told once, and the thing's state the one that lasted).

## 7. module.json: rules and exports

The manifest names the Kyr source of your module, the rules it is written against (`world` is the standard set), and the places a situation may use. Exports are the only way a
situation reaches into your site, so a situation never names a particular room. A site that generates nothing leaves
out `generation`.

```json module.json
{
  "version": 1,
  "source": "site.kyr",
  "rules": ["world"],
  "globals": ["party"],
  "exports": { "party": "party", "home": "cottage", "lookout": "strand", "captive": "ossuary",
    "tools": "nave", "site": "chapel_site", "closing": "ford" }
}
```

## 8. Installing a situation

A situation is a reusable conflict written over roles. *Caught Below*
([data/situations/caught-below](../../data/situations/caught-below)) needs a company, a site, the room where someone
is trapped, a room with a tool, the home they left, a lookout where someone waits, and a passage that will close. The
campaign binds each role to one of your exports. The situation then brings its own people, the fallen weight, the
closing water and its outcomes. Its `setting` chooses the regional flavour: names, what fell, and what closes the
way.

```json campaign.json
{
  "version": 1,
  "name": "Caught Below — Thornmere",
  "modules": [
    { "id": "world", "bundle": "module.json" },
    { "id": "rescue", "bundle": "../../situations/caught-below/module.json", "context": { "setting": "river" },
      "imports": { "party": "world.party", "workings": "world.site", "captive_room": "world.captive",
        "tool_room": "world.tools", "home": "world.home", "lookout": "world.lookout",
        "closing_way": "world.closing" } }
  ],
  "party": [
    { "name": "Ilse", "raceId": "human", "classId": "fighter", "backgroundId": "locksmith" },
    { "name": "Rook", "raceId": "elf", "classId": "ranger", "backgroundId": "hunter" },
    { "name": "Sefa", "raceId": "dwarf", "classId": "cleric", "backgroundId": "medic" }
  ]
}
```

In Thornmere, someone is pinned in the ossuary, someone waits on the strand, and the ford floods in the afternoon.
The grille needs the sexton's bar or the locksmith's skill. The bone chute is a way back for a company that read the
ledger. The Heron sells a night's sleep, Osk sells rope and salve, and every hour on the shore path is an hour of the
river rising.

## 9. Check it

Before naming things: `bin/kyrie names Pargeter Tench` says whether each surname is free or whose it is, and
`bin/kyrie lint --inventory` lists every relation and measure the modules declare, with what the engine keeps (the
clock, its records, what it reads off bodies, who holds what, what is known), which a module reads and never writes;
a load that writes one says which action or rule does (Quittance's 1 and 2).

A hostile's weight cannot be read from its kind's name: two owlbears of level 2 kill a company of level one, and a
cat's paw meant as play (2d6) killed a protagonist of six hit points (Behind the Wainscot's F9). `bin/kyrie forecast
<campaign.json>` reckons each band that could be fought, as the page reckons a fight before it is joined, against
novices of each calling (as many as the campaign's company): `slight`, `fair`, `hard`, `grave` or `deadly`, and a
mark on any a novice of some calling could well not survive. It is a forecast, not a finding: a proud band deadly to
fight may be meant to be paid, a warden meant to be slipped past. What it should prompt is a way round for a novice,
or a warning on the way in, or a lighter kind.

To begin an adventure with everything this section uses:

```
bin/kyrie new ashhollow "Ash Hollow"
```

It writes a module that lints clean and plays (a region, a town, a road and a square, its company in `company.kyr`),
the bundle that places it in a generated world (`placed.json`), its campaign, the steps of a first journey
(`test/fixtures/ashhollow/journey.json`) and the test that plays them (`test/ashhollow.test.ts`). It writes nothing
over a file that is there.

To add a part to an adventure that is there, beside the place its company begins (or `--from` another):

```
bin/kyrie new scene well --in ashhollow
bin/kyrie new item oarlock --in ashhollow
bin/kyrie new chapter bells --in ashhollow
bin/kyrie new character mara --in ashhollow --major
bin/kyrie new site barrow "The Barrow"
```

Each writes a file of the adventure's module, names it among the module's sources (and the placed bundle's), and
writes a test that plays to it and does what it is for (`test/ashhollow-well.test.ts`). Each is a working example to
write over: a scene with a thing to look at closely and to change, and something that happens once when it is; a
kind of thing of the adventure's own and something it is needed for; a chapter that begins, has an objective, and
ends in a milestone; a site of the generator's library with a probe country to walk it in. A character comes in five
weights, each with what the one before has: `--incidental` (a greeting, one thing to ask), `--recurring` (greets you
again as someone seen before; what they tell is remembered and asked after; one who knows the old lore is answered
otherwise), `--major` (a promise remembered, and a mind changed by evidence, by degrees), `--companion` (joins the
company, in their own words), `--antagonist` (guards the way on: talked round, slipped past, or fought).

To play straight to a scene, or into talk with someone, in a context you have named:

```
bin/kyrie play scene well --in ashhollow
bin/kyrie play character mara --in ashhollow --context "after the flood" "Ask Mara what is wrong"
```

A context is the steps to play first, named in `data/adventures/<adventure>/contexts.json`
(`{ "after the flood": ["^To the square", "Wait › An hour"] }`). What can be done there, or asked, is listed after.

A play worth keeping is kept as a test: `--keep <name>` on any `kyrie play` keeps the command and where it came to
(the place, the watch, what the page told at the last step) in `test/fixtures/traces/<name>.json`, and
`bin/kyrie keep <transcript.json> <name>` keeps a game saved from the browser. `test/traces.test.ts` plays every one
again and fails if it comes anywhere else. A check's die depends on the game's seed and on what was done before it, so
a journey is played again on its own seed, and a step whose check what follows does not need is written with `?`
(`"?Puzzle out"`), so that a roll that goes the other way on another seed is not a failure (the Liberty of the Ice's
20: a retry the next night is a real retry). To hold an adventure to everything at once (its lint, its tests and its
kept traces):

```
bin/kyrie verify ashhollow
```

It says too what of the adventure none of its kept traces came to: each rule or event that says something and was
never told, each ending never reached, milestone never achieved, and promise never made, kept or broken (a rule that
says nothing is counted, not judged); `bin/kyrie reach <campaign.json>` says the same of a curious player's plays (the
Grand Tour's 09 and 11: a rule that could never fire was found only by reading; `test/happened.test.ts`).

```
bin/kyrie lint path/to/your.campaign.json
```

Lint reports identity conflicts, places outside the containment tree, passages whose ends are not places,
duplicate passages, passage kinds that contradict their ends, rooms the company cannot reach, actions with no
possible target, items of unknown kinds, and prose that explains the implementation. A recommended world has no
findings.

A long module gathers its author's own habits ("for a long time" fifteen times, "purring like a millstone" twice:
Wapshott's Circus's 25). `bin/kyrie voice repeats data/adventures/<yours>` lists the phrases of three to six words its
texts say more than once, most often first, each with its files and lines; a name, written in capitals or one of the
module's own, is left out (`test/voice-repeats.test.ts`).

A module that does not load says where, and what else has the name:

```text
test/fixtures/counting-house/site.kyr:5: Duplicate entity marsh
  'marsh' is already declared by the shared rules at data/rules/core.kyr:13; choose another name
```

To see your world while you write it:

```
bin/kyrie preview path/to/your.campaign.json
```

This lints the campaign, builds the reader with it, and serves it at `http://localhost:8080/?campaign=…`. Each time a
file is saved it lints and builds again, and the open page reloads. A module that does not load is reported, and the
page keeps the last build that did.

To play it by the labels a player sees, without the page:

```
bin/kyrie play path/to/your.campaign.json --seed s --steps steps.json --probe "knows party mine__map_known" \
  --probe "#dose mine__member_party_1" "^To the gate" "the altar: Set the idol"
```

Each step is a pattern for the choice to take, matched against its label ("Wait › An hour", "Pack › A torch ›
Light", "a torch: Light") and then against the label under its heading ("the Sleeper's left eyelid: Examine › Push
and pull at it"), which tells two things' alike choices apart, and last against the label without the notes the page
adds after it (" · an even chance", so `^Juggle the clubs$` still matches); quotes are quotes, straight or curled. Alike things
carried are one row with their count ("Pack › Three torches › Light"), so a step for any of them is
`Pack › .*torch.* › Light`. `@command` performs a command by its id; `=N` waits until watch N, `=+N` waits N watches
more, `~N` waits until watch N by dark and first light; `=21:00` waits until nine at night comes, and `=day 2 21:00`
until nine at night on the second day (watches are ten minutes, counted from eight on the first morning, so that is
222, not 216: A Winter in Carth's 20); `=until approach(bowl) >= 1` waits a while at a time until a condition holds,
written as the module writes it, or the book closes; `~pattern` is a way not open yet, tried again after a short wait.
`?` before any step takes it if it can be taken and goes on if not (`?Puzzle out`, `?=+6`). Each step is printed as
the page tells it, then where the company is, then the answers to the probes: a fact is yes or no, `#measure` its
number.
`--choices` lists what is offered at the end. The steps file is a list, or named phases played in the order written.
`>place` goes to a place by the shortest way there, a way at a time (`>z3_deep`, or a whole id such as
`ashhollow__square`).

A generated world is played the same way from its seed, for one protagonist with an origin in it:

```
bin/kyrie play --world wren --origin wanderer --as elf/ranger/Aud ">z3_deep" "the turf hut: Examine"
```

To ask why a choice is or is not offered where the steps leave the company:

```
bin/kyrie inspect path/to/your.campaign.json "Wind the sluice up" "Wind the sluice up"
```

The pattern names the choice (as the page says it, or an action's id); the steps after it are played first. A choice
on offer is said to be, with how the page shows it. One that is not is shown for the bindings nearest to being
offered, with each condition they fail in Kyr, with what holds instead and what a query that fails means there:

```text
change_thing "{how}": not offered
  nearest: "Wind the sluice up" (actor=party, how=p__sluice_up, thing=p__sluice, origin=p__wound_down, result=p__wound_up)
    fails: state(p__sluice, p__wound_down); instead state(p__sluice, p__wound_up)
```

A journey test plays the same steps with `Journey` (`src/session/journey.ts`), as the adventures' own tests do
(`test/thrume.test.ts`, `test/house-that-grows.test.ts`, `test/let-one-remember.test.ts`,
`test/patient-star.test.ts`); `JOURNEY_TRACE=1` prints each step as the page told it. A step's `told` is what the
event said (the action's Result, and what rules said with it) as the module wrote it; its `page` is the page's
telling, set as a book is, its quotes curled. A step that matches choices doing different things takes the first and
is kept in `ambiguous`; a journey started `{ strict: true }`, or run with `JOURNEY_STRICT=1`, fails there instead, and
names them (`test/journey-driver.test.ts`). Two people asked of the same thing are told apart by who is asked:
`Kerensa: the night of the wreck` takes what Kerensa is asked of it, not Jinny (Fair Weather's 15). `j.page` is every
step's telling, and a long wait keeps every hour's; `j.latest` is the telling of the last `play` only, so a match after a
wait does not find text from days before (Quittance's ll 11). A module installed as the company went (a province, a
country beyond a march) counts its own days from the first morning after it is reached, and a step waits by them when
it names it: `=sennet day 3 21:00` is nine at night on Sennet's third day, whatever day of the world's that is (the
Grand Tour's 20; `test/journey-test-aids.test.ts`).

Two idioms surprise (the Book of Faces' BOF-31): a step naming a grave act takes it at once, since the page's "are
you sure" is the reader's, not the journey's; and `Take your leave` is there only in a conversation, so after a topic
asked without `Talk to …` first, or an act someone does themselves (`Speaker`), there is no leave to take.

A test asks of the world by the names its module gives (`j.holds('complete', 'reckoner')`, `j.measure('trust',
'pettifer')`, the installed module's prefix found as `=until` finds it), and is told when nothing is called that.
What the steps to it would only repeat, it may make so: `j.assert('knows', 'party', 'map_read')`, `j.put('tobias',
'cellar')`, `j.give('forged_writ')` (into the hands of the first of the company who is up); and `>place` goes to a
place of the region or of an installed module by its own id (`test/journey-helpers.test.ts`; Quittance's friction 8
and 9). A check's die is drawn from the seed and the moment, so a test of one that fails would be a search over seeds:
`j.roll('fail')` has every check from then on come out so (a natural one), `j.roll('pass')` a twenty, and `j.roll()`
lets the die fall again; `kyrie play --roll fail` does the same from the terminal (Quittance's 7).

## 10. What else a module can say

The example above is a village; an adventure of your own will want more. Each construct below is shown by the
smallest module that uses it, under `test/fixtures/probes`, and `test/authorability-probes.test.ts` plays each one.
They answer the findings of an author who wrote a whole adventure in Kyr (the ledger of The House That Grows, on the
branch `house-that-grows-authoring`); the response to each finding is
[doc/authoring/findings-response.md](findings-response.md).

### Kinds and creatures of your own

An item of a kind only your adventure has is declared in it: its category or the kind it is like, its worth in coin,
and its weight, which may be less than nothing. A creature too: `Species fen_cat "a fen cat" like cat tame.`

```text
  Kind dreg_ox "a little ox of dreg, on a cord" is treasure worth 2 weighing 1.
  Kind selm_stone "a fist of selm" is treasure worth 12 weighing -2.
```

`mass(kind)` reads the weight in a rule (`probes/local-kind`, `probes/selm`). A kind like one the catalog has is
carried as that one is; `granting` says what it brings whoever carries it equipped, in place of what that one brings.
The Water-Wardens' oath-tablet is carried as a book is, and brings the oath their keeper cannot abide, not a
glossary's reading of the old script:

```text
  Kind wardens_oath "the Wardens' oath-tablet" like old_glossary granting oath described "A slate tablet…".
```

What it grants may be a skill of the catalog's or a capability the module declares itself (`Entity breath: capability
"Breath under water".`; the Grand Tour's 9, which had written a rule on `holding` for its helm). A kind with nothing to
wear it by (`is gear`, `is document`) brings what it grants to whoever carries it; one like a thing worn, while it is
worn.

A paper of the module's own (a list, a playbill, a letter) `is document`: carried, never equipped, and granting
nothing unless it says so (Wapshott's Circus's 12: one like the glossary was offered "Equip", and taught the old
script). What reading it teaches is `teaching` a discovery: the company reads it where it carries it ("Pack › A
playbill › Read"), and knows it (`test/fixtures/probes/playbill`; Quittance's pm 10, whose stamp was read by an action
offered in every room):

```text
  Kind bill_kind "a playbill" is document teaching bill_read described "A playbill, printed red and black.".
  Discovery bill_read "The playbill says the Strong Woman will lift a horse tonight.".
```

### Asleep, awake, and who sees

A condition laid on someone outside a fight for hours (`Apply asleep to ally for 1 hour`) takes, and wears off with
the clock; while asleep a body can do nothing but lie as it is. `asleep(x)` and `alert(x)` are facts a rule reads,
and `perceives(watcher, place)` is whether someone awake and able is there to see: a sleeping owner does not see her
cup taken (`probes/sleep-hours`, `probes/owner-asleep`).

Every rule runs at every watch of a long act. What the act says holds while it runs, `Meanwhile`, holds for its
watches and not after: a night slept through is `Meanwhile asleep(actor).`, and a rule for a company awake at
midnight asks `alert(party)`, so it neither happens in the sleep nor is told on waking (The Lull's F2;
`probes/meanwhile`). A fact of the module's own may be held so too (`Meanwhile asleep(actor), dreaming(actor).`).

### Chance for each thing, and acts that take no time

`dice(clock)` is the watch's die for the whole world. `dice(?room)` is each thing's own die for the watch, so two
rooms left to chance in the same watch do not come out alike:

```text
  Rule grows when houseRoom(?p) and not attended(?p) and dice(?p) <= 17 { Increase size(?p) by 1. }
```

An action with `Time 0.` takes no watch (a word, a pat on the head); the world's rules still answer it at once.

### Reckoning

Measures and numbers can be added, taken away and multiplied as the world runs, in a requirement, a comparison or a
change: a product is taken before a sum (`fare(actor) * 2 - 1`), each left to right, and parentheses group
(`(fare(actor) - 1) * 2`). The changes of an action happen in the order written, so the second reads what the first
did (`probes/reckoning`):

```text
  Action haggle(actor: group, site: place) "Argue the fare" {
    Requires at(actor, site) and fare(actor) * 2 - 1 < 20.
    Time 0.
    On success { Set fare(actor) to fare(actor) * 2 - 1. Increase owed(actor) by fare(actor) + 1. }
  }
```

A roll in parentheses is a Deem expression, `(2d6)`, rolled once when the module is installed; arithmetic, in
parentheses or out, is worked out each time it is read. A quotient is rounded down (`coin(actor) / 3`), and `min(…, …)`
and `max(…, …)` give the less and the greater of two. A measure may say the most it can be, and nothing takes it past
it (`Measure fondness(group) at most 10.`); nothing takes a count below nothing either (`Decrease … by … or to
nothing`).

A number of the quest's own is a measure of nothing at all, hung on no one: `Measure ruling().`, `Set ruling() to 1.`,
`ruling() >= 3` (Quittance's bg 15 hung one on an office). A query can be given a number, and compare against it:
`Query ruled(n: number) means ruling() >= n.`, asked `ruled(3)` (`test/fixtures/probes/scalar`; Gosse's supper wrote
`supperBeat(pentrice) == 3` out twenty-two times for want of it). How many ways something holds is counted as it is
read, not kept as a tally at every change: `count(lit(?p)) >= 2`, `Set lamps() to count(memberOf(?m, party)).`; its
variables are its own, but for any bound around it (`test/fixtures/probes/counted`; the House That Grows' 6).

Two names are of different things where `distinct(a, b)` holds: "a place other than the Ranks" is
`at(?p, …) and distinct(?p, ranks)` (What Tessary Owes' W5). It tests what is bound and binds nothing, so what it
tests is bound by something before it; one asked of nothing bound is refused as the module is read.

### Your adventure in a generated world

Every authored adventure is a province of a generated world's first country (`"province": true` in
[data/adventures/countries.json](../../data/adventures/countries.json); Mission 18's Gate B): its way in stands a little
in from the side of the country its entry names (`side`), on the land it `covers` (or its terrain's kinds of land), with
a road to it from the nearest town, and the folk of every town speak of it by name (`src/world/provinces.ts`). Of a
province, `beside` and `among` are not read (Quittance's friction 25); they place only a country that lies beyond a
march instead (one without `"province"`), beside the terrains named, and of those `"among": "independent"` a world
holds the one its seed chooses (`src/world/frontier.ts`). `bin/kyrie countries` says where each lies. To offer yours:

- keep its company in a file of its own (`company.kyr`), so that a second bundle, `placed.json`, can leave it out and
  say instead, in `placed.kyr`, `Entity party: group "Your company".`, with `"imports": ["party"]` and
  `"roles": { "party": { "type": "group" } }`;
- export the room the road comes into (`"salt_road": "salt_road"`), outdoors at the country's edge;
- add the country to `countries.json`: its bundle, that entry, an entity only it has (its marker), what it is called
  and what kind of country it is, the side of a generated country it lies on, and the terrains of those it may lie
  beside; and its rumour, what the innkeeper of the town the road leaves from says of it when asked about the road
  (`{keeper}` is the innkeeper), with what the company knows of it once told (`heard`), which the journal keeps as
  heard from them.

What is said passes one way. The country's keepers speak of yours in your words; your people cannot name the
country's towns, inns or keepers, which are drawn for each world after yours is written, so a topic of yours names
only what your module declares or imports (Behind the Wainscot's F14: Jory Mudge of Bootscrape and the innkeeper of
the town next door cannot know each other). Speak of the world beyond your country as its folk would, without names.

Where a country lies depends on every other's `beside`: one offered beside a new terrain can take a place another had.
`bin/kyrie countries [seed ...]` says where each authored country lies in the worlds the tests draw (its cell, its
side, and the terrain of the country it is entered from); run it before and after changing a `beside`, and compare
(A Winter in Carth's 16). Each province's way in is placed in the order `countries.json` lists them, clear of those
before it, so adding one can move others; `bin/kyrie countries --diff` compares the file with as it was committed (or
`--diff before.json`) and names each country the change moves, in which seed (Fair Weather's 1).

Its clock runs from the first morning after it is reached: its own `watch(clock)` is 0 at eight that morning, and below
nothing until then (a rule at `watch(clock) >= 216` waits 216 watches from that morning); its `day(clock)` and
`nightCount(clock)` are counted from that morning too, `day(clock)` being 1 on that first morning, 2 on the next
(Quittance's friction 3), and `hour(clock)` is the world's. A country reached in the
evening has its first day still to come, so a rule for that day's afternoon asks `watch(clock) >= 0` as well, or fires
that evening (the Liberty of the Ice's 7). A measure of a time it keeps (`Set fedAt(goats) to watch(clock)`) reads 0
until set, which before that first morning is later than now: ask a fact that it was set, not that it is above 0
(Half the Hive's 7). What it says of the company that comes in is said by names of its own
(`Initially Set breath(party) to 12`).

### Someone on an errand of their own

Someone can have somewhere to be. A person who goes by the ways (`Uses go.`) and plans the walk (`Plans 14 steps.`,
how many ways ahead they look) takes up a `Pursuit` whose aim is a place: they walk there a way at a time, taking each
way's time; the company sees them go, and can meet them on the road (`test/fixtures/probes/errand`; the Road's F10:
Webb's walk to Keld had been a teleport). Of several pursuits the one of the highest priority whose condition holds is
taken up, until what it seeks holds; then the next (Quittance's A30), so a pursuit of home at a lower priority brings
someone back from an errand done. One who does not `Uses go` goes nowhere, and the lint says so (its 5).

```text
  Person webb "Webb" at yard { Role "a carter". Uses go. Plans 14 steps. Peaceable. Pronouns he. }
  Pursuit to_keld for webb "walking to Keld" priority 5 when day(clock) >= 18 seeks at(webb, keld).
```

Someone declared in a file you may not touch, or in another module, is given what they go by and how far ahead they
plan with the errand itself: `… seeks at(ianthe, guild_hall) using go planning 14 steps.` (Quittance's sd 1, whose
lovers' schedules had been teleporting rules; `probes/errand-elsewhere`). Without `planning`, someone looks four
ways ahead, and an errand further off is never begun.

A Peaceable person goes about their errands and comes at nobody, whatever their kind's temper; one who is to turn (the
young bloods, once the hold is roused) stops being peaceable when a rule retracts `peaceable(bloods)` (Thrume's F2).

### A companion who leaves

Someone who has joined the company leaves it when they no longer travel with it: a rule that retracts
`travelsWith(mirel, party)`, and asserts where she goes, sends her home, and she is there, herself, when the company
comes (`test/fixtures/patient/leaves`). If nothing says where, she stays where the company is.

### How fast a member goes

A member's `speed` is a measure of the shared rules, in hundredths of their own; unset is their own. A company walks
at its slowest member's speed, and laden at half that, so a module that slows someone says so (The Patient Star's
stilling):

```text
  Query slowedMember(m: member) means dose(m) >= 24.
  Rule slowing when memberOf(?m, ?c) and company(?c) and slowedMember(?m) and speed(?m) != 50 { Set speed(?m) to 50. }
  Rule quickening when memberOf(?m, ?c) and company(?c) and not slowedMember(?m) and speed(?m) == 50 { Set speed(?m) to 0. }
```

A query of no arguments is called with empty brackets wherever it is used: `Query lowWater() means …` is tested as
`lowWater()`, and `lowWater(ossel)` is refused as "Unknown function or arity" (What Tessary Owes' W13).

### Who hears what a rule says

A rule's `says` is told to the company wherever it is, unless the rule is anchored: `Rule name at place when … says
"…"` is told only to a company that perceives the place, and `near` someone or something only to one near them
(The Long Man's mower, the drover's son). News that should travel at its own pace is a rule anchored where it
arrives, with a clock for when (The Road the Star Came Down's F9, The Patient Star's 32).

The company hears it as a witness would: if it perceived the anchor as the watch began, before anyone acted in it, or
just before the rule did what it does, or just after. So an event near someone that carries them off is told to the
company beside them, and so is one near someone whose routine, written earlier, took them out in the same watch; an
event at a place that drops the company out of it is told to it as it falls (`probes/witness`; the Grand Tour's 2,
whose event near Quance that carried her to the Nexus was spent unheard).

```text
  Rule son_goes at green when watch(clock) >= 204 and not told(son) and at(son, green) says "{son} has taken his father's old spear and gone out on the road alone." { Retract at(son, green). Assert gone(son). }
```

An anchor says where a rule's words are heard, not whether the rule happens: a rule anchored `at` a place happens
wherever the company is, whenever its condition holds. Two authors met it apart (a purse lifted at a fair from a
company a mile off on the road; a sedan chair run and crashed while the company was crossing the river). A rule that
should happen only in front of the company asks for it in its condition:

```text
  Event purse_lifted at freezeland when at(party, freezeland) and not lifted(party) "A hand is in your purse, and gone." then { Assert lifted(party). Decrease quantity(party, gold) by 5. }
```

A rule anchored `within` an area waits for the company to be in it: what it does, as well as what it says, happens
when the company is anywhere in the area (news of a city told, and done, when the company comes into it). `kyrie lint`
advises on a rule anchored at a place that changes something of the company's own (its coin, where it is, what it
knows) and asks nothing of where the company is: it may be meant (a hand broken at a court the company stayed away
from), and it may not.

When it is meant, say so: a rule written `heard at` (or `heard near`, `heard beside`, `heard within`) anchors only its
words. It happens wherever the company is, whenever its condition holds, and is told only to a company that witnesses
it there; the lint does not advise on it, and one heard within an area does not wait for the company to come into it.
A surveyor's verdict on the landing, given whether or not anyone stood there, had been an unanchored change and an
anchored telling with a latch of its own (The Book of Faces' 5.8, Quittance's surveyor; `probes/heard-only`):

```text
  Rule survey_fails heard at landing when day(clock) == 7 and hour(clock) >= 12 and not boat_sound(party)
    says "'Condemned,' says the surveyor, and BERTH LET is nailed up at the end post." { Assert berth_sold(party). }
```

What happens again and again, a show every night, is told in full the first time the company hears it, and after
that by the words written after `again`; which it has heard is kept with the game (Wapshott's Circus's 26: a nightly
show told in full every night, unless its author kept a fact of having seen it and wrote it twice;
`probes/told-again`):

```text
  Rule show at ring when hour(clock) >= 20 and not shown(party)
    says "The lamps go up, {barker} cries the bill, and the horses come in at a gallop, plumed, round and round the ring."
    again "The horses come in again, and {barker} cries the bill." { Assert shown(party). }
```

Lines written after the again with `then` are said each in its turn, one each time the company hears the rule, and
round again from the again: a talking creature's repertoire, a ghost's, a clock's, in one rule (Quittance's wk 2,
whose parrot took twenty rules; `probes/repertoire`). What sets it off, a cue, a mood, is its condition:

```text
  Rule speaks near fusby when fluffed(fusby) says "'Pieces of eight!' says {fusby}."
    again "'Who's a pretty boy, then?'" then "'Mind the step!'" { Retract fluffed(fusby). }
```

A count taken below nothing stops at nothing: `Decrease dose(?m) by 8` leaves a dose of five at none. An action that
would take one past nothing is not offered, since what cannot be paid for is not bought; where that is backwards (a
company owing one pain kneels a night "for six of your pains"), the action says so: `Decrease pains(actor) by 6 or to
nothing.` (A Winter in Carth's 2).

Whether someone is anywhere in an area is asked as it is said: `within(party, cherrett_lodging)` holds in the
parlour, on the stair and in Mrs Cherrett's room, and `within(rupert, hessel)` anywhere in the town (the Banns at
Hessel's 13, which wrote it room by room). Like `distinct`, it tests what is already named, and finds no one.

### What someone believes, and a lie told to them

Someone holds a claim (`believes(harker, squire_claim)`) as firmly as `conviction(harker, squire_claim)` says: 2, sure
of it; 1, shaken; and at nothing they let it go on the same pass (`let_go`), and `doubts(harker, squire_claim)`
holds instead. So what a lie leads to asks `doubts`, not `believes`: a topic that talks Harker out of the claim
(`Set conviction(harker, squire_claim) to 0`) leaves no `believes` for the next choice to need (the Liberty of the
Ice's 4). A lie that makes someone believe what is false asserts the belief, with a conviction above nothing.

```text
  Topic lie_to_harker with harker "Tell Harker the squire went north by the ice" when believes(harker, squire_claim) once {
    Says "Harker writes it down, and looks at you over the top of the pen.".
    On discuss { Set conviction(harker, squire_claim) to 0. }
  }
  Action send_riders(actor: group, site: place) "Tell Harker to call his riders back" {
    Requires able(actor) and at(actor, site) and at(harker, site) and doubts(harker, squire_claim).
  }
```

A claim argued away (`swayedBy`, as a disputation does) without a reason the world gives (`reasoned(harker,
squire_claim)`) is back by morning, and whoever argued it away is scorned for it (`scorns`): not listened to again.
One let go for a reason, or talked away by a topic as above, stays let go.

What one person hears travels. Whoever is told of something has heard of it (`heardOf(abel, flock_lie)`, asserted by
the topic or rule that tells them); one who passes on what they hear (`passesTo(abel, harker)`: a tattler to their
master) has passed it on once the two are together; one who overhears (`overhears(kemble)`) hears what anyone beside
them has heard. So a lie told to Abel reaches Harker when Abel next stands in his office, and a truth told on the
Liars' Bench in front of Kemble is Kemble's at once (`test/fixtures/probes/carried`; the Liberty of the Ice's 5).

### A place heard of

A fact can say where something is: `Initially Assert leadsTo(barrow_named, barrow).` Once the company knows the fact
(Old Wyn names the Grey Barrow), the place is on its map, as not yet visited, before it has been there or knows the
way (`test/fixtures/probes/leads`). A generated region's sites are led to by their names, and a rumoured country by
its rumour.

### What cannot be undone

An act that cannot be undone says so, and the page asks before it does it: chosen once, it says what it costs; chosen
again, it is done (`test/fixtures/probes/grave`).

```text
  Action break_statue(actor: group, site: place) "Break the founder's statue" {
    Grave "The statue has stood here since the town was founded; broken, it stays broken.".
    …
  }
```

A way that goes `one way` says so of itself, before it is taken. An action that puts the company somewhere nothing
leads back out of (a drop down a well, no way up and nothing to do down there that takes it on) must say so in its
`Grave`: `kyrie lint` reports one that does not (its `commitment` check; `test/fixtures/probes/drop`). And a check
that cannot be tried again once it fails (its failure makes true what it needs to be false, and nothing undoes it)
says "one try" beside its odds, before it is tried.

A topic can be grave too: a hand shaken on a bargain, in the middle of talk (`Grave` before its `Says`, or after).

```text
  Topic shake_reeve with reeve "Shake the Reeve's hand on it" when true once {
    Grave "A hand shaken on the ice binds: the Court will hold you to it.".
    Says "The Reeve's grip is cold, and brief.".
    On discuss { Assert shook(party, reeve). }
  }
```

### Words that teach

What is known is learned, not set: a rule cannot `Assert knows(…)`. A rule's or an event's words can teach what they
say, as an observation does, to a company that hears them (`test/fixtures/patient/knows-rule`):

```text
  Rule put_together when knows(party, prayer) and knows(party, label) and not knows(party, same)
    says "The words of the holding prayer are the clerk's line, word for word." teaches same { }
  Event bell at yard when knows(party, same) "Across the yard the granary bell rings once." teaches rung.
```

An action, or a topic, can `Assert knows(…)`: what the company does, it knows it did (naming the chairman to Lanyon).
A rule or an event happens whether or not the company is there to hear it, so what it teaches is learned by hearing
it, and only then (the Banns at Hessel's 19). A scene that teaches two things is two rules, each saying its part (A
Winter in Carth's 19). So a rule that teaches by being heard at a place is not written `once`: it fires the first time
its condition holds wherever the company is, and if the company is away what it teaches is lost. It is latched on
what it teaches (`and not knows(party, hawk_known)`), and goes on until it is heard; `kyrie lint` advises of one that
is not (`test/fixtures/probes/latched`; the Book of Faces' cisterns 10).

What the company learns, the world answers at once. A rule, an event or an ending on something just seen, read or
heard fires in the command that taught it, and its line is told with what taught it: above, the bell rings in the
same moment the prayer and the line are put together. In `probes/inference` the company reads the Courant: the rule
that sets its account against what Kittiwake saw and finds the lie, and the ending on knowing it, both come on that
one reading (the Grand Tour's 23, whose inference fired only once the company had done something else). Only what the
learning makes hold fires then: a rule that held already goes on as it did.


An observation told once, and not on every view after (the Book of Faces' BOF-23: a scratch on a lock told every
time the chest was looked at), asks for the absence of what it teaches: it is told, it is known, and its condition no
longer holds. The undertown's rat-runs say so (`data/generation/town/undertown.kyrt`):

```text
  Observe rats_run_seen at warren as sign when not knows(party, rats_source) "Along the back wall the rats have worn a path in the dirt, and it goes into the old brickwork." teaches rats_source.
```

### How the story ends

An ending closes the book. The first whose condition holds is reached once: its epilogue is told as it happens, play
stops, and the page closes on its title and epilogue, as it does when no one is left standing
(`test/fixtures/probes/ending`). That is so of an adventure played on its own; placed in a generated world (as every
adventure is, a province of the first country) its ending closes its chapter only, and the world goes on: what its
folk say after (`after` in countries.json) and its aftermath's rules are its dénouement (Fair Weather's 6). What they
say can follow which way it went: `after.by` gives each way its own `talk` or `told`, told once the module marks that
way's word stale as well as its `word` (`word_loud`, declared, imported and optional like `word`: Larum's sky loud
again; the Quiet in the Sky's 4). An ending is reached only by a company that has stood in one of its module's places,
its own or one it imports: a city's verdict does not end the game of a company that never came to the city (Gosse's
Company's friction; `test/fixtures/probes/never-there`):

```text
  Ending opened "The Gate Opens" when state(lever, up) "The gate grinds open on the valley beyond, and the pass is yours.".
```

A module can say what comes after the company dies: an ending on `dead(party)` is read once more after the company
falls, by a fight, a hazard or a rule's blow, and the page closes on it rather than on the shared words (the Quiet in
the Sky's 21: the dead walk in out of the snow; `probes/fallen`).

`reached(opened)` says which ending a game came to, in a kept game as in play. Endings are tried in the order they
are written, so the more particular comes first: the lint says when one asks all that an earlier one asks, and so can
never be reached.

Two endings that can hold at once, neither asking all the other asks, are another matter: the one written first is
reached, whether or not that was meant (the Grand Tour's 4: an accomplice whose hill crushed the Whelm was given the
Second Whelming's ending, written first, and not First Through). An ending reached while such another held carries
that other's name with its line (never told to the player), and a journey warns of it as it happens, naming both and
the one reached (`Journey.contested`). One written
after that asks only part of what the reached one asks (the general after the particular: Low Water's last, `Low
Water` when `departed(party)`) is the order meant, and not said. Say which wins with `over`, before the condition: the
ending is reached before those it names, wherever they are written in its file, and the pair is not warned of
(`test/fixtures/probes/rivals`):

```text
  Ending horn_call "The Horn Call" when state(drum, beaten) and state(horn, blown) "Drum and horn call the valley up.".
  Ending fife_call "The Fife Call" over horn_call when state(drum, beaten) and state(fife, played) "Drum and fife call the valley up.".
```

An ending over another holds it back only while its own condition holds: the Horn Call is not reached while the drum
is beaten and the fife played, and is reached when the horn was blown and the fife was not. What one ending asks of
another is read as it is written: one that holds only where another does by way of a rule or a query (Low Water's
census endings, whose `completedFed(reckoner)` a rule asserts only once `complete(reckoner)` holds) is warned of all
the same, and `over` quiets it.

### A chapter that opens

A day, or an act, that opens is a `Chapter`, written as an ending is: it opens once, the first time its condition holds;
its title heads the page, and its words are told first of what came of the step, in a paragraph of their own, before
the morning's weather or whatever else the step told (`test/fixtures/probes/chapters`; the Liberty of the Ice's 26, the
Banns at Hessel's 22: each day's opening had been a rule and a latch, run on after supper). `chapterOpened(saturday)` says
it has opened. A chapter opens wherever the company is when its condition holds, a day's walk off as readily as in the
room: a day's chapter should, but one that is a scene asks for the company where the scene is (`and at(party,
dancing_hall)`), not anywhere in the country around it. Half the Hive's Calling, asked of anywhere in the Wold, opened
for a company camped a day away under the Far Brow (its 17).

```text
  Chapter saturday "Saturday" when day(clock) == 2 and hour(clock) >= 6 "The bells of Saint Ebba's ring six, and the town is up before them.".
```

### A promise made

A promise the company makes to someone is a `Promise`: made by an action or a topic that asserts `promiseMade(id)`, an
aim while it stands ("Keep your promise to Comptroller Vane: …"), kept the first time its kept condition holds, and
broken the first time its broken condition does, with what keeping or breaking it brings, each in a block after its
words (`test/fixtures/probes/promise`; Quittance's 14; What
Tessary Owes' 5: every promise was a relation, a deadline rule, a kept rule, a broken rule and a consequence, by hand).
`promiseKept(id)` and `promiseBroken(id)` say how it went.

```text
  Promise letter_promise "to bring him the Factor's letter by nightfall" to comptroller
    kept when keeps(comptroller, letter) "The Comptroller draws a line through the promise, neatly." { Assert trusted(party). }
    broken when hour(clock) >= 18 "Somewhere a line is drawn through a promise you made." { Assert forsworn(party). }.
```

A promise to bring someone to one place, and no other, is kept when the company and they are there, and broken when
they are anywhere the module names wrong: `kept when at(party, gap) and at(pip, gap)`, `broken when at(pip, ?p) and
wrong(?p)`, with `Initially Assert wrong(pit)` for each wrong place (`test/promises.test.ts`; Quittance's pm 13).

### An occasion of several matters

A court's cases, a council's business, a hearing: an `Occasion` opens when its condition first holds and takes up its
matters in order. Each is said as it opens and stays open until its own condition closes it or its time is up; then
the next is taken up, and after the last the occasion is over (`test/fixtures/probes/occasion`; the Liberty of the
Ice's 9: its Landing, like Low Water's Hearing and four others, was built by hand in windows of watches). What the
company can do in a matter asks `matterOpen(herring)`; `matterDone`, `occasionBegun` and `occasionOver` say the rest.

```text
  Occasion landing "the Landing" at quay when watch(clock) >= 2 {
    Matter herring "Master Harker brings the herring case before the Reeve." for 30 minutes until decided(herring).
    Matter boat "The boat case is called." for 30 minutes.
    Closes "The Reeve rises, and the Landing is over for the day.".
  }
```

### Words for the moment

An action's `Result` (or its `Otherwise`) can have others for a moment, each `when` something holds as it is done; the
first that holds is told, and the plain one otherwise. The basket's ride told of a fine afternoon at ten at night (the
Grand Tour's 6; `test/fixtures/probes/the-hour`):

```text
    Result "Up into the sun: the middle of a fine afternoon.".
    Result "Up through the cloud into the dark, and the stars over it." when dark().
```

### Numbers in what is said

Any text (an observation, a result, what someone says) can say a measure as it stands when it is told:
`"You owe {creditor} {owed(loan)} coin, by market day."`. A variable its condition binds can be named too: in
`Observe slow_feel near party when memberOf(?m, party) and dose(?m) >= 24 "{?m}'s own footsteps sound late."` it is
whoever the condition finds first. A measure is said as a figure, as a reading is ("The dial reads {dial(clock)}.");
said `in words`, a small one is a word, as speech would have it: `"'I've lost {lost(garth) in words} to them so
far,' says {garth}."` says "one", not "1" (play 9).
A phrase agrees with its count when both its forms follow it: `"{left(rose) in words|petal is|petals are} still to
set."` says "One petal is still to set." and, with three left, "Three petals are". A measure kept of the watch is said
as the time of day it was, `as time`: after `Set loosedAt(lanterns) to watch(clock)`, `"The lanterns went up at
{loosedAt(lanterns) as time}."` says "at 9:30 p.m." (the Grand Tour's 09 and 11; `test/counts-told.test.ts`).

### A way that opens only sometimes

A passage can open only while something holds, and say how it looks while it does not. While shut it is not offered,
and the map and the page give its description as the reason (`probes/moon-gate`):

```text
  Passage gate "the moon gate" is gate between yard and garden
    opening when dark() "The moon gate is a ring of white stone with the wall showing through it. By day it is only a ring.".
```

The condition is read with the world's rules, so it may be anything a rule may test: the hour, a fact, a measure.
A way may wait on more than one thing, each with its own words: it opens when every clause holds, and while shut it
is told in the words of the first clause that fails (`opening when pitched(top) "The circus has gone on."
opening when not showing(top) "The flap is laced: the show is on."`).
It is read again once every rule of the moment has run, so a gate declared before the rule that lets the company
through is open as soon as that rule has (`probes/admitted`; Low Water's Assayers' gate, What Tessary Owes' black
wall).
A way does not shut under a company crossing it: the sea that comes over the sands while the company is half across
keeps it going to the far side, and the way shuts once it is off (Fair Weather's 2; `probes/crossing`). A way that
should turn back whoever is on it is barred by a thing's state instead (`blocking`), as the tide over the ford-road's
causeway is.
A way that opens only sometimes is shut at both its ends: a door shut by day shuts in a company that was inside when
day came (the Book of Faces' counting 5). A door that shuts against one side only is a thing on the way from that end
(`Thing bolt "the kitchen door's bolt" on kitchen_door from street`), whose `blocking` state a rule sets by day and
lifts by night: the company inside walks out, and none comes in from the street (`test/way-end.test.ts`).

### Kin, companions and animals

Anyone willing (`willing(hessa, party)`) can be asked to join the company, for their hire (`Set hire(hessa) to 20`, in
gold, paid as they join; 0 for one who comes for the cause): a talk that ends `On discuss { Assert willing(hessa,
actor). Set hire(hessa) to 0. }` is how one is won over (`bin/kyrie new character --companion` writes one; Quittance's
friction 27). Once with the company they travel with it (`travelsWith(hessa, party)`), and are no longer `at` anywhere
of their own: a rule that asks where they are asks `travelsWith` as well (its 19). Someone the company is kin to
(`kin(party, brother)`) and willing (`willing(brother, party)`) can be asked to come along; they join as themselves, keep what they could be asked at home, and can be sent home again. A dog is
`Species dog`: tame animals keep the peace, greet whom they know, and can be made much of (`test/fixtures/household`).

Someone who follows the company (`following(callow, party)`: led, in custody, a child brought home) goes where it
goes. They are with it on the page, not announced in every room it comes to (the Liberty of the Ice's 14); a rule
that does not ask who follows whom does not move them elsewhere, so an hour's routine need not say `and not
following(rupert, party)` (the Banns at Hessel's 5); and a rule that carries the company off (a chair to the downs)
takes them too (its 6). What someone with the company says on coming somewhere that matters to them is said once,
when they come there with it: `Remarks at fold "…".` in their declaration (A Winter in Carth's 21).

What a companion can do is a capability they bring, not an action of its own for each place it is wanted: a
reader of an old script carries a kind `granting link_script` (`Entity link_script: capability "…".`, `Kind
script_primer "…" is document granting link_script`, `Carries script_primer.`), and every change `needing
link_script` is the company's while she is with it (Let One Remember's F7, which wrote eight "Ask Teshen to read …";
`probes/reader`).

Someone comes along one of two ways. `Initially Assert acceptsEscort(rupert, party).` offers the company's own "Ask
Rupert to come with you" and "Let Rupert make their own way"; or a topic or an action asserts it outright, for one
who comes because of what was said (`On discuss { Assert following(hob, actor). }`), and retracting it lets them go
(Quittance's ll 8, whose lamplighter was taken along so; `probes/follow`). Either way their routine leaves them be
while they follow.

### A law of a module's own

A module may write its law in a file apart and name it among its rules: `"rules": ["world", "../law/law.kyr"]`
(`probes/shared-law`; The Patient Star's stilling and moments). The file is read as one of the module's own, as its
sources are: its relations, measures, rules and kinds are the module's, named for it, and a kind it declares can be
sold by a person in any of the module's files. Only the named rules (`world`, `elements`, `devotion`) are shared
between modules; what a module does not export is its own (the architecture review's A7: a module's rules file had
declared another module's private relation, and written it).

### The order things happen in

A command takes minutes (`Time 2 minutes.`), watches (`Time 1.`, ten minutes each) or hours (`Time 3 hours.`, as a
passage is `taking 3 hours`: Quittance's bg 16); minutes add up, and every ten of them is a watch passed. One that
waits for an hour takes until it comes round, or until that hour of a day, reckoned from the clock as the hours until
dark are: `Time until hour 19.`, `Time until day 2 hour 6.` (`test/fixtures/probes/the-hour`; the circus's 10 kept a
measure of its own, set by a rule every watch, to wait for the show). A command's time passes a watch at a time. In each watch: the clock moves (`watch`, `dark()`,
`hour(clock)`, `day(clock)`, `nightCount(clock)`, `dice(clock)`) and conditions on bodies run down; every other power
and person acts, in the order the campaign lists them; then every rule is tried once, the shared rules first, then each
module in the order the campaign installs it, each in the order its rules are written (its files in the order its
module.json lists them: Quittance's 23); then each way that opens only sometimes is read again; then what a hazard
strikes lands on bodies. A rule sees what the rules before it changed in the same watch, so a shared rule has done its
work before a module's is tried: one brought home is no longer `following` by then (`brought_home` retracts it, and
asserts `cameHome(person)`), and a module's rule for the homecoming waits on `cameHome`, not on `following` (Half the
Hive's 13). A rule whose condition still holds fires again next watch, so a rule meant to happen once is written `once`
(`Rule bell when watch(clock) >= 1 once says "A bell rings." { … }`), changes what it tests (`Assert sung(party)` beside
`not sung(party)`, for once per one of many), or is an `Event`, which happens once. An action that passes no watch (one
that takes no time, or a few minutes) is followed by one pass of the rules and whatever a hazard strikes, and no clock.

So a rule runs once for every action as well as once a watch, and a measure meant to rise once a watch (a district's
heat) keeps the watch it last rose in: `Rule warms when heatAt(party) < watch(clock) { Increase heat(party) by 1. Set
heatAt(party) to watch(clock). }` rises once a watch however many words are said in it. An action's own changes are
made, and its `Result` told, as it is begun, before its time passes: a rule that waits on them fires in the first watch
of a three-hour task, not at its end, so what should come at the end waits on the hour it ends (`Set sawnBy(party) to
watch(clock) + 18`, and a rule `when watch(clock) >= sawnBy(party)`). Talk takes no time: a topic is said between one
watch and the next, however long the argument, so a clocked scene is not hurried by talk; a conversation that should
cost the minutes is an action with a `Speaker` and a `Time` (`test/order-of-a-moment.test.ts`; Quittance's 22).

What happens after a while at a place, not at an hour, asks how long the company has stood there: `lingered(party)`
is the watches since it came (since the first, where it began), so `when at(party, platform) and lingered(party) >= 3
once` is half an hour under the rail (`test/fixtures/probes/lingering`; the Third Night's 15).

The day turns at midnight, and a night keeps its small hours: `nightCount(clock)` is the night that falls on a
day, from noon that day until noon the next, so the second night's small hours are `nightCount(clock) == 2
and hour(clock) < 6`, on the third day by `day(clock)` (`test/fixtures/probes/nights`; the Liberty of the Ice's 6).

### A creature other than its kind

A creature can be an aspect of its kind (Orsino's: agile, venomous, ancient…) or the dead of it (skeletal, zombie,
spectral, vampiric), each adding to its attributes, abilities and traits as `data/catalog/orsino/variants.json` says:

```text
  Person hounds "the hounds" at den { Role "hounds". Species wolf. Aspect venomous. Numbers 2. }
  Person bones "the bones" at barrow { Role "a dead wolf". Species wolf. Undead skeletal. }
```

A band of `Numbers 2` or more is one group: `able(hounds)` while any of them is up, `dead(hounds)` only when every
one is down (Quittance's A17).

### Something said near each one of many

An observation can be near a variable its condition binds: one line for each lit lamp, near that lamp, wherever it
is, as the company comes near it (`probes/lamps`). The variable names it in the text:

```text
  Observe glow near ?lamp when lit(?lamp) "{?lamp} burns low and yellow, and the room leans toward it.".
```

A place the condition finds is written `at ?place` (or `within ?area`): told in whichever place it finds, as the company
stands there (`Observe tents at ?g when pitched(?g) "Striped tents stand in {?g}."`). `near` is for things and people,
which stand somewhere; a place does not. A rule's line is anchored the same way, and heard only near whoever its
condition finds (`Rule juggles near ?j when juggler(?j) and rung(field) says "{?j} juggles three apples." { … }`).

### Seen only by some

A person can be seen only by a viewer for whom a condition holds; `viewer` in the condition is whoever is looking.
To anyone else they are not there: not on the page, and nothing can be done to them (`probes/grey-lady`):

```text
  Person lady "the grey lady" at nave { Role "a woman who died here". Peaceable. Seen when knows(viewer, sight). }
```

The condition may ask anything, not only what the viewer knows: Quittance's lamplighters are about only after dark
(`Seen when hour(clock) >= 17 or hour(clock) < 5.`; its A28).

### Said once for each one it finds

A rule whose condition binds a variable fires once for each binding, and its `says` is told once for each: a roll
called, every member answering in turn (A Parliament of Books' poll; `probes/roll-call`). What it teaches is learned
once. A rule that re-asserts its own precondition fires again on the next pass, so a nightly or once-only rule needs
a latch (`not outTonight(?b)` … `Assert outTonight(?b)`).

```text
  Rule poll_aye at chamber when putting(?o) and sits(?m) and favours(?m, ?o) and not polled(?m) says "{?m}: aye." { Assert polled(?m). }
```

### A book that changes its reader

`Resolve endow(member, quality, degree)` raises one of a member's qualities by `by_one`, `by_two` or `by_three`,
never past twenty-five, outside the level's development: a Manual. It spends nothing; the module says what it asks.
`levelOf(member)` is each member's level, for what a gift asks of its reader (`probes/manual`):

```text
  Action study(actor: group, reader: member, site: place) "Have {reader} read the grey manual" {
    Requires memberOf(reader, actor) and carries(actor, manual) and levelOf(reader) >= 3 and not studied(manual) and at(actor, site).
    Time 36. Resolve endow(reader, intelligence, by_two). On success { Assert studied(manual). }
  }
```

### A spell taught

`Resolve teach(member, spell)` takes a catalog spell or technique into what a member knows, of any tradition, at no
cost: a master's lesson, a researched spell, a song learned by ear. It can be prepared from then on, once the member
can cast its level; a spell is taught only to one who casts spells, and nothing happens to anyone else, or to one who
knows it already (`test/module-teaches-spell.test.ts`). `Resolve learn` is the level's own choice, and spends it.

```text
  Action read_book(actor: group, reader: member, site: place) "Have {reader} read the drowned book" {
    Requires at(actor, site) and memberOf(reader, actor). Resolve teach(reader, drench).
    Result "{reader} reads the drowned book through.".
  }
```

What calling a member follows, and what they have learned, a rule or an action can ask: `hasCalling(?m, calling_mage)`
(one of `calling_warrior`, `calling_mage`, `calling_thief`, `calling_cleric`, `calling_bard`, `calling_ranger`,
`calling_monk`, `calling_commoner`) and `learned(?m, conjure_light)`, with `memberOf(?m, actor)`. A skill is no
calling: a commoner who has learned brawn is no warrior, and `capable(party, brawn)` cannot tell them apart
(`test/callings.test.ts`; the Book of Faces' hill 3, gate 6 and counting 3).

### How deep a place is

A place under the ground can say how many storeys down it is, after `underground`: the page's head says it there
("Two storeys down"), so that a company far into an undertown knows how far it has come. Where it is not said, it is
reckoned: from the open air, or from a place whose depth is said, one more for each `stair`, `steps`, `ladder` or
`shaft` taken and for each level of a site below the one before (`src/ui/depth.ts`; `test/depth.test.ts`). Say it
where a crawl or a culvert goes down, which the reckoning cannot know.

```text
  Place mill_nest "the nest" is room within mill at 0, 6 underground 2 down.
```

### A place out of the world

`elsewhere`, where `outdoors`, `indoors` or `underground` would go, says a place has no sky over it and no hour told
in it: no weather on arrival, and its ways told without the light (the Commonplace in A Parliament of Books). Put it
on the region and its areas; rooms within inherit it.

```text
  Place commonplace "the Commonplace" is region elsewhere.
  Place near_stacks "the Near Stacks" is wilderness within commonplace at 1, 0 elsewhere.
```

### Weariness

A company that sleeps (every company does, unless a module says otherwise) grows weary eighteen hours after it last
slept, and stays so until a bed, a camp or a rest; weary, it fights a little worse (the `weary` condition), and the
page says so. A module can read `weary(company)` and `lastSlept(company)`, and set them (`probes/tired`).

### When a module will not load

An error says the file, line and column, and what it found there:

```text
test/fixtures/probes/bad-kind/site.kyr:4:3: Kind wyrd is like nothing_at_all, which is no kind of item
```
