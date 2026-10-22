# Writing *The Long Man* in Kyr: before and after

*The Long Man* was designed in prose first (README.md), then written in Kyr. Where Kyr could not say what the design
said, the module worked around it, and `mismatches.md` lists each workaround. Mission 8 then changed Kyr where the
workarounds showed a missing idea rather than a missing feature, and rewrote the module with the changes. The same
ideas are tested on their own in a small fixture, the counting-house (`test/fixtures/counting-house`, played by
`test/authoring.test.ts`): a clerk, his coat, his key, a porter, a strongroom, a barred back door and a yard dog.

"Before" is the module as committed in 4ca78b1. "After" is the module now. The adventure plays the same five ways in
`test/the-long-man.test.ts`, before and after.

## Whose things are

The design: *Venn notices his key gone from his belt. Gammer Coller notices her rod gone from her wall.* Before, each
needed a relation of its own to say it was lent, and a rule of its own to notice it:

```text
  Item key "the steward's iron key" is cell_key in key_hook.
  Relation lentKey(group).
  Rule venn_misses_key when holding(party, cell_key) and together(venn, party) and not lentKey(venn) says "Venn's hand goes to his belt, and his face changes. 'That is the Hall's key,' he says. 'Give it here.'" { Assert hostile(venn, party). }
  …
  Relation lent(entity).
  Rule nell_sees_rod when holding(party, sluice_rod) and together(nell, party) and not lent(rod) and not angered(nell) says "'That is the reeve's rod,' …" { Assert angered(nell). }
  Relation angered(group).
```

`holding(party, cell_key)` is any key of that kind, so Venn objected to every iron key. Now the item says whose it is,
and the person says what they say:

```text
  Person venn "Aldous Venn" at study {
    Role "steward of the Hall". Ancestry human. Peaceable.
    Objects "Venn sees {?i} in your hands, and his face changes. 'That belongs to the Hall,' he says. 'Give it here.'".
  }
  Item key "the steward's iron key" is cell_key in key_hook owned by venn.
  Topic venn_bounty with venn "Ask Aldous Venn about the Mower" when … {
    …
    On discuss { Assert knows(actor, bounty_known). Assert lends(venn, key, actor). Assert state(key_hook, hung). }
  }
```

The belongings rules do the rest. An owner who sees the company carrying the thing unlent objects once, in their own
words if they have any, and is hostile after. Someone who `serves` the owner goes to tell them. The same convention
replaced a third rule, Dunnet telling Venn about the bronze (`dunnet_tells`): the teeth are `owned by venn`, Dunnet
serves Venn, and paying Dunnet's wages retracts that (`Retract serves(dunnet, venn)`), because "I never saw you."

Because ownership is now general, the design's "Venn's key, lifted" works. Venn sleeps after supper in the room
behind his study, which the design implied and the module now has: two rules and a room. A company can take the key
off the hook at night. Venn says nothing until he sees it in their hands.

## A bar on one side of a door

The design: *the cellar door is barred on the cellar side.* A `Change` on a thing on a passage was offered from both
ends, so the bar became a bespoke action:

```text
  Thing cellar_door "the door in the broken wall" on broken_wall {
    State barred blocking "A heavy door closes the hole broken through the wall, barred on the cellar side.".
    State unbarred "The door in the broken wall stands with its bar off.".
  }
  Action lift_bar(actor: group, site: place) "Lift the oak bar off the door in the broken wall" {
    Requires able(actor) and company(actor) and at(actor, site) and at(actor, cellar) and state(cellar_door, barred).
    On success { Assert state(cellar_door, unbarred). }
    Result "The bar comes off its brackets with a groan, and cold, dry air comes round the door.".
  }
```

Now:

```text
  Thing cellar_door "the door in the broken wall" on broken_wall {
    State barred blocking "A heavy door closes the hole broken through the wall, barred on the cellar side.".
    State unbarred "The bar is off the door in the broken wall, and cold, dry air comes round its edges.".
    Change lift "Lift the oak bar off the door in the broken wall" from barred to unbarred at cellar.
  }
```

The bespoke action's result text moved into the state, which is where Kyr says what a thing looks like.

## A particular key

The design: *Venn's key opens Venn's grate.* Before: `needing cell_key`, so any iron key would do. Now `needing key`
names the item. In the counting-house, a rusty key of the same kind lies in the street and does not open the
strongroom.

## How a creature meets you

The design: *the Wet holds its ground and comes at whoever stays; the Old Jack lies in wait.* Before, each creature
took five lines outside its declaration:

```text
  Person wet "the Wet" at leak {
    Role "a heaving mass of wet clay". Species mud_elemental. Level 5.
  }
  Initially Assert temperament(wet, temper_territorial). Initially Assert warning(wet, wet_rises). Initially Assert onslaught(wet, wet_comes).
  Entity wet_rises: fact "At the far end of the wet gallery the floor heaves, …".
  Entity wet_comes: fact "The Wet comes down the gallery at you, faster than mud should.".
```

Now it is said with the creature:

```text
  Person wet "the Wet" at leak {
    Role "a heaving mass of wet clay". Species mud_elemental. Level 5.
    Temperament territorial.
    Warns "At the far end of the wet gallery the floor heaves, …".
    Comes "The Wet comes down the gallery at you, faster than mud should.".
  }
```

## Things people know

The design has facts nobody reads anywhere: the rod's history, what the Long Man is, what the Mower does. A
`Discovery` needed a source to read or a place to search, so each such fact was an entity plus an initial assertion,
a second notation for the same idea:

```text
  Entity wall_known: fact "The Long Man is a wall: it holds Hollow Water back from the dale, …".
  Initially Assert established(wall_known).
```

Now a discovery can have no source. A scene, a topic or a rule teaches it, and `Known by` says who knows it already:

```text
  Discovery wall_known "The Long Man is a wall: it holds Hollow Water back from the dale, …".
  Discovery strongroom_rumour "The strongroom holds the factor's black ledger." { Known by porter. }
```

Six facts in the adventure changed this way.

## One module in three files

Each of the three files had to end with `Goal false.` A module now needs no goal. The adventure's objectives say what
the company is trying to do.

## Errors that say where

The design named a place *the marsh*, another *the hills*, a thane *lord* and a lake *the deep*. Each failed to load
with a message that named no file, and none said what else had the name. Now a load error gives the file and line,
and says what else has the name and where:

```text
test/fixtures/counting-house/site.kyr:5: Duplicate entity marsh
  'marsh' is already declared by the shared rules at data/rules/core.kyr:13; choose another name

test/fixtures/counting-house/site.kyr:16: Parameter shadows entity lord
  'lord' is a parameter of a shared rule at data/rules/inhabitants.kyr:103; choose another name

test/fixtures/counting-house/site.kyr:8: Invalid argument yard in state(strong_lock, yard)
  'yard' names two things, at test/fixtures/counting-house/site.kyr:8 and test/fixtures/counting-house/site.kyr:41; give one of them another name
```

`bun bin/kyrie.ts preview <campaign.json>` runs the loop. It lints the campaign, builds the reader with it, and serves
it. On each save it lints and builds again (about a second for the counting-house) and reloads the open page. A
module that does not load is reported this way, and the page keeps the last build that did.

## What is still awkward

- **A person cannot carry a particular item that others can take.** Venn's key is on his belt by day and on a hook at
  night. The belt is a container thing with a `closed` state, the hook, and two rules that move between them.
- **A merchant does not resell what she bought.** Cass's resale of the teeth is three rules.
- **A readable source cannot need a skill.** Only a search can (`Found by searching rest with lore`).
- **New creatures and items go in the global catalogs.** The bell-teeth, the rod, the mask and the pike are entries in
  `data/catalog`, though only this dale has them.

In numbers, the rewrite removed:

- three bespoke relations;
- three noticing rules;
- one bespoke action;
- six fact-and-assertion pairs;
- two creature-fact blocks;
- three goals.

It added one room, two rules and three people's words, and took the module from 501 lines to 494. The revisions
after the browser pass came later and brought it to 520:

- Venn's exposure;
- laying the Mower by day with an iron bar from the cellar;
- Ysolt burying its mask;
- a cellar door found by searching.
