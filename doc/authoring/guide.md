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
duration says how long it takes to cross: ten minutes unless you write `taking 30 minutes` or `taking 2 hours`. A
passage can be `hidden until` a fact is known, or `needing` a skill or an item kind.

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
reported.

## 3. The company and the people

The company is declared once, where it starts. Its members come from character creation, or from the campaign's
default `party` if the player skips creation. Coin and rations given to the company go into its members' purses and
packs.

```kyr
  Company party "Your company" of 3 at green.
  Initially Set quantity(party, gold) to 8. Initially Set quantity(party, rations) to 1.
```

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
- **ambush**: strikes, unless a watchful company sees it first;
- **wary**: slips away to its refuge, and fights only when cornered there;
- **obedient**: keeps its post;
- **proud**: names a price.

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
- `Flinches` and `Pleads`: what it does when it is frightened off, and when it is beaten;
- `Lair`, `Refuge` and `Fears`: where it holds, where it runs, and what drives it there (`Fears sunlight.`);
- `Objects`: what a person says on seeing what is theirs in the company's hands (see "Whose things are", below).

A creature given no words is told in plain ones: "A grey wolf stands its ground and watches you. It will not have
you here for long."

## 4. Things with states

A thing stands at a place or on a passage, and is in exactly one state at a time. Each state has the description the
player sees while it holds; the description of the state a change leads to is what the player is told when they make
it. A `blocking` state closes the passage the thing is on, and a `dangerous` state hurts whoever crosses. A `Change`
moves the thing from one state to another. It can need a skill, an item kind or one particular item, or consume a
good, and `at` a place it can be made from there alone. You never write a separate scene line saying the gate is
open: the gate's state says it.

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

`Wants burial_register.` makes the standard `give` available to that person; `Buys … for … coin.` the standard
`sell`. A long activity that someone arriving should break off says so: `Interrupted when threatened(actor).` Its
time passes a watch at a time, and its success applies only if it runs its course.

### Objects: inside, hidden, trapped, tried

A thing can hold others (`Holds.`), and a state flagged `closed` keeps what it holds out of sight and reach. Items
and things can start inside one (`in chest`), and anything can be `hidden until` a fact the company learns; a
discovery can be `Found by searching` a place (optionally `with` a skill), and is then seen there from that time on.
Every thing can be tried: looked over closely, prodded with a pole, pried at with a bar, put to the flame, pushed and
pulled, listened at. Offering a try reveals nothing; what a try finds is an observation or a rule on `tried(thing,
verb)`, and a try that finds nothing says so. A trap is a thing whose rule asserts `strikes(hazard, party)`; the
world turns the hazard on one member. From `test/fixtures/strongroom`:

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

`dice(clock)` is a die from 1 to 100 thrown every watch from the campaign's seed; a rule that reads it is how a
world leaves something to chance (a band on the road at night, the weather turning). Weather is a `scenery` entity
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
  Rule gap_slow when state(sky, rain) { Set travelTime(gap_road) to 18. }
  Rule raiders_on_road when at(party, barrows) and (dark() or state(sky, fog)) and dice(clock) <= 3 and … {
    Assert at(raiders, barrows). Assert assails(raiders, party). }
```

`lightless(place)` is a place where light dies: only a company with `sunlight` sees there, and `benighted(company)`
covers it as well as an unlit place without a light. A change can be `consuming` a kind of item, which uses one up.

### Tolerance, keys and guests

`tolerates(x, company)` means x lets the company be: it does not bar the company's way, fall on it, or break its
rest. A toll, a bribe, an audience or a bargain is a rule or action that asserts it, and a betrayal retracts it.
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

A servant bought off stops serving: in *The Long Man*, paying Dunnet's wages retracts `serves(dunnet, venn)`.

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

```
bun bin/kyrie.ts lint path/to/your.campaign.json
```

Lint reports identity conflicts, places outside the containment tree, passages whose ends are not places,
duplicate passages, passage kinds that contradict their ends, rooms the company cannot reach, actions with no
possible target, items of unknown kinds, and prose that explains the implementation. A recommended world has no
findings.

A module that does not load says where, and what else has the name:

```text
test/fixtures/counting-house/site.kyr:5: Duplicate entity marsh
  'marsh' is already declared by the shared rules at data/rules/core.kyr:13; choose another name
```

To see your world while you write it:

```
bun bin/kyrie.ts preview path/to/your.campaign.json
```

This lints the campaign, builds the reader with it, and serves it at `http://localhost:8080/?campaign=…`. Each time a
file is saved it lints and builds again, and the open page reloads. A module that does not load is reported, and the
page keeps the last build that did.

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

`mass(kind)` reads the weight in a rule (`probes/local-kind`, `probes/selm`).

### Asleep, awake, and who sees

A condition laid on someone outside a fight for hours (`Apply asleep to ally for 1 hour`) takes, and wears off with
the clock; while asleep a body can do nothing but lie as it is. `asleep(x)` and `alert(x)` are facts a rule reads,
and `perceives(watcher, place)` is whether someone awake and able is there to see: a sleeping owner does not see her
cup taken (`probes/sleep-hours`, `probes/owner-asleep`).

### Chance for each thing, and acts that take no time

`dice(clock)` is the watch's die for the whole world. `dice(?room)` is each thing's own die for the watch, so two
rooms left to chance in the same watch do not come out alike:

```text
  Rule grows when houseRoom(?p) and not attended(?p) and dice(?p) <= 17 { Increase size(?p) by 1. }
```

An action with `Time 0.` takes no watch (a word, a pat on the head); the world's rules still answer it at once.

### Reckoning

Measures and numbers can be added, taken away and multiplied as the world runs, left to right, in a requirement, a
comparison or a change. The changes of an action happen in the order written, so the second reads what the first
did (`probes/reckoning`):

```text
  Action haggle(actor: group, site: place) "Argue the fare" {
    Requires at(actor, site) and fare(actor) * 2 - 1 < 20.
    Time 0.
    On success { Set fare(actor) to fare(actor) * 2 - 1. Increase owed(actor) by fare(actor) + 1. }
  }
```

A number in parentheses is a Deem expression, `(2d6)`, rolled once when the module is installed; arithmetic outside
parentheses is worked out each time it is read.

### A way that opens only sometimes

A passage can open only while something holds, and say how it looks while it does not. While shut it is not offered,
and the map and the page give its description as the reason (`probes/moon-gate`):

```text
  Passage gate "the moon gate" is gate between yard and garden
    opening when dark() "The moon gate is a ring of white stone with the wall showing through it. By day it is only a ring.".
```

The condition is read with the world's rules, so it may be anything a rule may test: the hour, a fact, a measure.

### Kin, companions and animals

Someone the company is kin to (`kin(party, brother)`) and willing (`willing(brother, party)`) can be asked to come
along; they join as themselves, keep what they could be asked at home, and can be sent home again. A dog is
`Species dog`: tame animals keep the peace, greet whom they know, and can be made much of (`test/fixtures/household`).

### Laws shared between modules

A module may take another module's relations and rules as its own law by naming its file among its rules:
`"rules": ["world", "../law/law.kyr"]` (`probes/shared-law`).

### The order things happen in

A command's time passes a watch at a time. In each watch: the clock moves (`watch`, `dark()`, `hour(clock)`,
`dice(clock)`) and conditions on bodies run down; every other power and person acts, in the order the campaign
lists them; then every rule is tried once, the shared rules first, then each module in the order the campaign
installs it, each in the order its rules are written; then what a hazard strikes lands on bodies. A rule sees what
the rules before it changed in the same watch. A rule whose condition still holds fires again next watch, so a rule
meant to happen once either changes what it tests (`Assert sung(party)` beside `not sung(party)`) or is an `Event`,
which happens once. An action that takes no time is followed by one pass of the rules, and no clock.

### When a module will not load

An error says the file, line and column, and what it found there:

```text
test/fixtures/probes/bad-kind/site.kyr:4:3: Kind wyrd is like nothing_at_all, which is no kind of item
```
