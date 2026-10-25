# The House That Grows: an independent author's test of Kyr

22 October 2026, against `70a81b9`. For the builder of Kyr, and for anyone deciding whether to write in it.

The campaign tested here is *The Noon Citadel*, two sourcebooks written without reference to Kyr. Its central physics
is the law of attention: dream-matter sets where nobody watches, a watched room is fixed, and a dream-door opens only
behind your back, onto the less-watched copy of the room beyond it. A competent author would expect to be fighting a
room-and-quest system over exactly that law.

I wrote a connected slice of the campaign in Kyr and played it in the runtime and in the browser. Every limitation I
met is recorded with a reproducible case. The documents are:

| Document | What it holds |
|---|---|
| [fidelity.md](fidelity.md) | What the implementation had to preserve, written before any Kyr; what it had to decide |
| [ledger.md](ledger.md) | 21 findings, each with intention, attempt, behaviour, workaround, loss, cause and remedy |
| [data/adventures/house-that-grows](../../../data/adventures/house-that-grows) | The module: 819 lines of Kyr in five files |
| [test/house-that-grows.test.ts](../../../test/house-that-grows.test.ts) | 17 journeys, one per way of playing, all passing |
| [test/authorability-probes.test.ts](../../../test/authorability-probes.test.ts) | 12 probes pinning today's limits, on minimal fixtures in [test/fixtures/probes](../../../test/fixtures/probes) |

## 1. Assessment

**A competent author can write an ambitious, living adventure in Kyr, and most of it can be source. It is not yet
"principally Kyr". Roughly a third of the authored lines say what the world is like; the rest is machinery the
author had to build and keep consistent. Three things the sourcebook needs cannot be written at all.**

### What surprised me by working

The sourcebook's hardest mechanism plays as written:

- Cobble Ring watches the Annex, so an Annex door opens onto the Keel, 3.5 km up.
- Coming back down needs the Keel copy better watched. Tobu can be left sitting in it, a lamp lit with dreg can be
  left burning, or the town can turn its stools.
- Each of those routes is a journey test.

The world goes on without the player. While the protagonist sleeps in Kezu's kitchen:

1. The low hour nods the watchers, and the folded man comes out of the house and puts Old Pammu away.
2. Kezu, unwatched for two nights, dreams herself into a door.
3. The council sells the house to the Company at noon on the third day.

The player finds each of these afterwards, as evidence. Unforeseen plans had something to answer them:

- knocking to ask a watcher to look away;
- burning the seams;
- selling a stale map;
- taking a Lifted boy home to Lowmere by way of the house.

### What blocked

1. **An adventure's own things and creatures cannot be declared in it.** Dreg, Ithren lamps and wax plugs had to go
   into the shared item catalog, as *The Long Man*'s bronze teeth and grey mask did. Ledger 1.
2. **Nobody can be put to sleep or folded away outside a fight.** `for 1 hour` passes lint and then stops the game;
   `for 3 turns` is gone within a watch. Ledger 2.
3. **Nothing weighs anything,** so selm, the second of the setting's three laws, has nothing to act on. Ledger 3.

### What cost the most

1. **Attention is not a fact rules can read.** I built it from 9 queries and 35 relations. Ledger 4.
2. **A passage cannot say how it is crossed, or where it leads, under conditions.** That took three bespoke movement
   actions that each repeat `go`. Ledger 5.
3. **Companions are either hirelings with no voice, or voices that cannot fight.** Ledger 6.
4. **Evaluation order is meaning and is invisible.** Ledger 10.

### Where the reader undercut the world

The browser reader did the most damage to the module's best mechanism:

- two distinct doors merged into one choice;
- the world's central verb, "close your eyes and back through the door", is filed under "Yourself" after Wait;
- the Footman is an anonymous "Look and try". Ledger 11.

### The central test

How much of the author's work expresses the world, and how much fights the language?

- **Writing.** About a third of the lines are prose: 230 of 696 non-comment lines. *The Long Man* has the same
  proportion, 193 of 531.
- **Debugging.** Most of the time went to four kinds of problem:
  - evaluation order;
  - ten-minute granularity;
  - unbound queries that crash only in play;
  - presentation workarounds.
- **The fiction itself** was rarely the hard part.

The language rewards an author who thinks in states, evidence and consequences. It punishes one who thinks in
perception, bodies and physical quantities.

## 2. The module

**Cobble Ring, the Annex in Haddo's barley, and the Keel's upper decks, over three days after Kezu opened the door.**
The protagonist is origin 2, Kezu's stare-student. The module is one Kyr module in five files:

| File | Lines | What it holds |
|---|---|---|
| [cobble-ring.kyr](../../../data/adventures/house-that-grows/cobble-ring.kyr) | 193 | The region; the crater-town; Kezu, Hanu, Tobu, Wenu and her hall, Bolt; the reeve, the council and the Company's offer; Kezu's sleepwalking |
| [attention.kyr](../../../data/adventures/house-that-grows/attention.kyr) | 139 | The law: who attends to a room, looking away, dream-doors and the less-watched copy, growth, lamps, sleep |
| [annex.kyr](../../../data/adventures/house-that-grows/annex.kyr) | 283 | The barley, the stools and the visiting mark, Dace's map, Haddo, the five Annex rooms, the folded man and his drawer, the Company's guards |
| [keel.kyr](../../../data/adventures/house-that-grows/keel.kyr) | 173 | The Long Hall and Neme's chair, the bunk room and its names, the lamp store and Quill, the Choir, the knot-door to Rigging Row, the open edge |
| [lowmere.kyr](../../../data/adventures/house-that-grows/lowmere.kyr) | 31 | The causeway, and Sennu Arru behind the red door |

It contains:

- 42 places and 27 passages;
- 13 people;
- 23 things and 8 items;
- 62 observations, 24 topics and 22 discoveries;
- 48 rules and 18 actions;
- 35 relations, 11 measures and 9 queries.

Outside the module, it needed three item kinds added to `data/catalog/items.json` and no engine change.

### Play it

```sh
bun bin/kyrie.ts preview data/campaigns/the-house-that-grows.campaign.json
# open the printed http://localhost:8080/?campaign=… and choose Set out
bun test test/house-that-grows.test.ts test/authorability-probes.test.ts
```

How to get in:

1. Ask Tobu what happened, then ask him to come.
2. Go out to the barley and pay the watchers a mark.
3. Tell Tobu to look at you, not the door.
4. Close your eyes and back through the small door.

In the house:

- Look for the long window.
- Bring Kezu's cup to the cup shelf.
- Try a door: push it while you look at it.
- If you go up, think about how you will come down.

Two setup notes:

- `bun install` needs `../languages` and a current `../deem` (ledger 20).
- The campaign is not on the published title page, which would need an entry in `web/scenarios.ts`.

### The approaches, and what the world does

Approaches 1–4 were specified in [fidelity.md](fidelity.md) before implementation. The unforeseen ones were tried
afterwards.

| Approach | What happens | Journey |
|---|---|---|
| Go in | Neither Tobu nor the stools will let the small door open while they look. Paid and turned, they let it open; the hall of coats then opens on the city's copy, because the barley's is overlooked | `opens the Annex door onto the city…` |
| Come down | From the city the same door keeps opening upward. Tobu left watching the city's copy, or a lamp lit with dreg set down in it, brings the company down | `strands the company…`, `comes down by a lamp…` |
| Map for the Company | Dace lends his slate; drawing a room is a lapse, and the folded man closes. A true Annex map pays 500 m; a map of a room that has grown since is refused; a mapper alone in the city cannot get back to be paid | `pays for a true map…`, `maps the Annex and a room of the city…`, `lets the folded man close on a lapse…` |
| Hold the line | Someone standing the low hour with the watchers keeps Pammu on his stool. If he was put away, an hour's stare at the drawer unfolds him | `keeps Old Pammu…`, `loses Old Pammu…` |
| Follow Kezu | Two unwatched nights grow a green door in her wall that opens on the Long Hall; sitting up with her prevents it | `makes Kezu a door…`, `keeps Kezu from becoming a door…` |
| The council | It sells by default, and Company guards take the stools; told the house is one house with the city, the reeve swings it | `sells the house to the Company unless…` |
| *Unforeseen:* knock | A watcher inside a room holds it shut; knocking asks them to look away | (in `comes down by a lamp…`) |
| *Unforeseen:* fire | A lit torch held to a seam cracks the pane, rings, and turns every head on the stools; the seam heals when nobody watches | `answers a torch held to the seams…` |
| *Unforeseen:* plug your ears | No count of panes is heard, and no dream | `answers a torch held to the seams…` |
| *Unforeseen:* Quill home | Search the bunk room, tell Quill of the red door, take him down by the lamp and along the causeway to his mother, who says a name that is not Quill | `takes a boy of the city home…` |
| *Unforeseen:* the Choir | Three turns listening, and you are in the dream of the hallway for an hour | `sings a listener into the dream…` |
| *Unforeseen:* the dog | Bolt rolls over for his belly, but only because he is a `Thing` and not a creature (ledger 13) | `lets a peaceable dog be a dog` |
| *Unforeseen:* never sleep | Nothing happens. Nobody needs to (ledger 19) | — |

## 3. The ledger, ranked

Full entries, with reproducible cases, are in [ledger.md](ledger.md).

| # | Finding | Severity | Kind |
|---|---|---|---|
| 1 | An adventure's own objects and creatures must go into the shared catalogs | blocking | missing |
| 2 | Nobody can be incapacitated outside a fight; `for N hours` crashes the session | blocking | defect, missing |
| 3 | Nothing weighs anything | blocking here | missing |
| 4 | Perception is not a fact rules can read | severe | missing |
| 5 | A passage cannot say how it is crossed, or where it leads, under conditions | severe | missing |
| 6 | Companions: hireling or shadow; `part_ways` before joining; `kin` inert | severe | defect, missing |
| 7 | An owner asleep objects, and is the taker's enemy for ever | severe | defect |
| 8 | One die for the whole world; no arithmetic at run time | severe | missing |
| 9 | Ten minutes is the smallest act | severe | missing |
| 10 | Order is meaning, and it is invisible | severe | hidden |
| 11 | The reader merges, misplaces and unnames what the module made distinct | severe | frontend |
| 12 | Errors at run time, or with no place | moderate | defect |
| 13 | A species' temper overrides `Peaceable` | moderate | defect |
| 14 | Roles, topics and populations fixed at load | moderate | missing |
| 15 | A travelling phenomenon needs an observation per object | moderate | missing |
| 16 | A law cannot be shared between modules | moderate | missing |
| 17 | A person cannot be hidden, or seen only by some | moderate | missing |
| 18 | Smaller gaps; the guide omits half the language | moderate | missing, hidden |
| 19 | Nobody ever needs to sleep | moderate | missing |
| 20 | Stale siblings, stale READMEs, a TypeScript registry | moderate | defect |
| 21 | Minor friction | minor | various |

## 4. Improvement agenda

### Immediate repairs (small, local, no new concepts)

- **Reject what crashes.**
  - Lint checks query binding and arity (12).
  - It rejects `for N hours` hazards until they work (2).
  - It carries a source location on every declaration-level error (12).
- **Fix shared rules.**
  - `part_ways` requires `following` (6).
  - `temper_warns` respects `peaceable` (13).
  - `owner_objects` requires the owner to be awake, or better, to perceive the item (7).
- **Fix the reader.**
  - Merge choices by command, not label.
  - Name a thing in its tries ("Hold a flame to the seams").
  - Default an unvisited destination to an alias.
  - File an authored action under its passage or thing parameter.
  - Fix the article on numbered groups and possessive roles (11).
- **Fix the documentation.**
  - The authoring guide gains `seen as`, aspects, `noticed by`, shelter, `Query`, namespacing, and the evaluation
    model (one pass, authored order, cascade, no `knows` in rules) (10, 18).
  - The READMEs stop recommending the retired March (20).

### Language and runtime changes (each a general construct, not a feature for this setting)

**Local kinds** (1):

```kyr
Kind ithren_lamp "Ithren lamp" is gear worth 2 { Description "A lamp of selm-glass the size of a pear…". }
Species hall_dog "dog" is beast like wolf { Temperament tame. }
```

**Perception as a projection** (4, 7, 17). The engine already knows who perceives what, for narration; let rules read
it.

```kyr
Person hanu "Hanu" at kezu_loft { … Watches kezu_bed. }
Rule house_grows when houseRoom(?p) and not attended(?p) and roll(?p) <= 17 { Increase grown(?p) by 1. }
Person neme "Neme" at pond_arc { … Seen when not searching(party, pond_arc). }
```

**Conditional passages** (5):

```kyr
Passage coats_door "the door into the hall of coats" is door between bedroom and coats_low
  or coats_high when nearLess(coats_high, coats_low), opening when not perceived(coats_door).
```

**World-time conditions** (2). `asleep`, `paralysed` and `folded` last hours, are kept on the body, and are projected
as `awake`.

**Per-identity dice and measure arithmetic** (8). `roll(?p)` and `dice(entity)`, keyed as `RandomStreams.key` already
keys everything else; `Set x(?p) to grown(?p) + 1`.

**Instant acts** (9). `Time 0` for speech and glances.

**One companion model** (6). A companion keeps their entity, voice and role inside the company and can be left at a
place. `recruit` reads `kin` and takes `Joins "…"`.

**Shareable laws** (16). `"rules": ["world", "./attention.kyr"]` in a module manifest.

### Larger architectural changes (worth deciding on deliberately)

- **A physical-quantity layer** (3): mass, and a load derived from it. It is the smallest thing that makes ballast,
  buoyancy, encumbrance and a weigh-in expressible.
- **Bodily needs beyond food** (19): fatigue on the pattern of `hunger`.
- **Entity creation at run time** (14): items of a declared kind first, so that a dream can leave a second dreg.

## 5. Creative fidelity review

Against the facts F1–F20 in [fidelity.md](fidelity.md).

| Fact | Outcome | How |
|---|---|---|
| F1 a watched room is fixed | **Preserved** | `held` and `overlooked` (attention.kyr). The dark counts as not watching |
| F2 unwatched rooms grow 1 in 6 a turn, by the Growth table | **Compromised** | Random timing by die bands, correlated across the two bodies; each room's growth is an authored sequence of thresholds. The table cannot generate (8, 14) |
| F3 doors open only behind your back | **Preserved in the world, weakened on the page** | `back_through` actions; Tobu and the watchers must look away. But the act is filed under "Yourself", and each glance costs ten minutes (9, 11) |
| F4 the less-watched copy | **Preserved**, the best thing in the module | Three degrees of attention, ties to the far copy. Only the hall of coats exists twice: a room that folds at run time would need a pre-declared copy |
| F5 lit lamps watch for an hour | **Mostly preserved** | Lit with any dreg of the house (Kezu's cup, Neme's marble, the bunk-room cart); set down, it holds its room for six watches; glass mice burn it down. "Sees whoever carries it" is not implemented, and star-scrapings are out of the slice |
| F6 sleeping unwatched leaves dreg | **Compromised** | Only through the module's own `lie_down`; the standard camp and lodging cannot be given the consequence; one pre-declared dreg; and nobody needs to sleep (10, 14, 19) |
| F7 the Annex, its watchers and the mark | **Preserved** | The mark buys the watchers' backs (an addition, see fidelity.md) |
| F8 rooms A1–A5 | **Preserved**: the bed's folds, Neme's coat and marble, the twin cups, the hall of coats | The root cellar grows into Haddo's well and opens a way nobody watches; that is written, but no journey reaches it |
| F9 the Footman | **Preserved in behaviour, lost as a creature** | A `Thing` that moves only unwatched, closes on a lapse, puts the sleeper away, can be broken while watched and mends unwatched; its HD 6 and its fight are gone. "Put away" is a room (2) |
| F10 the Long Hall and B1–B5 | **Mostly preserved** | Neme's chair holds the Keel's rooms while you sit; the tallies tell twelve years; the Choir counts panes (plugs stop it, singing hushes it); the knot-door breaks Netter law at the slice's edge. One name on the bunk wall, not 1,400 |
| F11 Kezu | **Preserved** | Asleep until afternoon; lies about her dreams until shown the cups; becomes a door after two unwatched nights; sleepwalks to the knocking. Her ox is prose |
| F12 Tobu | **Preserved as a person, not as a companion who fights** | Escort, look-away, stay-and-watch. "Leaves if Kezu is harmed" is written, but nothing in the slice harms her |
| F13 Dace | **Preserved** | The slate is lent; true, stale and city maps pay differently. His cord's count is a fixed line (14) |
| F14 relic law, the offer, the vote, the guards | **Preserved as institutions; relic law as words** | Votes are a measure the reeve's topics move; the guards take the stools and nod in the low hour |
| F15 the Footman at dawn puts away a watcher | **Preserved** | Off-screen, found afterwards |
| F16 Quill | **Preserved**, including the homecoming | Isele is absent |
| F17 dream-Neme | **Impossible** | A person cannot be hidden or seen only by those not looking (17) |
| F18 light gravity, the open edge | **Prose** | The edge has a wind hazard; slow falls are not modelled |
| F19 glass mice | **Partial** | A swarm that fights in its refuge and burns lamps down; "in darkness the room grows" follows from the law |
| F20 the long window | **Preserved** | Seeing it, then standing in the hall it showed, teaches `house_one` |
| *Selm, star-stone that falls upward* | **Impossible beyond a rule that loses it** | No weight (3) |

The history is physically discoverable here. Pre-Lifting graves and the Floor Rite are out of the slice, but what is in
it is found, not told:

- the names on the bunk shelves;
- Neme's twelve years of tallies;
- the cups;
- the window;
- the Choir's count.

Nothing in the slice became an exposition menu: every topic is a person's words with their own reasons. The wonders
that survived are the ones that compose with ordinary rules:

- the doors, with the stools, the knock and the lamp;
- the house, with the council and the guards;
- Kezu's sleep, with Hanu's shutter and the low hour.

The ones that did not survive all need the body (sleep, folding), a quantity (selm), or perception (dream-Neme).

## 6. The authoring workflow

- **Documentation.** The authoring guide is good on places, passages, things, knowledge and trade, and its example is
  tested. It omits most of what the last month added (`seen as`, aspects, `noticed by`, shelter) and everything about
  evaluation order. Both READMEs describe a retired corpus. I learned the language from `Kyr.ohm` and the rule
  modules, which an author should not need to do.
- **Diagnostics.**
  - Parse errors are exact.
  - Load errors name the entity but often not the file.
  - Five load errors had no location.
  - Three crashes happened only in play: an unbound query twice, a long hazard once.
  - It took nine edit-and-lint rounds to get the first load.
- **Preview.** `kyrie preview` lints, builds in 621 ms and reloads the page; it reached a campaign outside the title
  list by `?campaign=`. This is the best part of the workflow.
- **Testing.** Playing by the labels a player sees (the pattern of `test/the-long-man.test.ts`) is the right way to
  test a world, and fast: 17 journeys in about 5 s. It also exposed the reader's problems early: identical labels,
  "Look and try › Hold a flame to it" four times, the appended "(Isa Wennu)". A driver that prints the page after each
  step was the main debugging tool. Something like it belongs in `bin/`.
- **Organisation.** One module split across files by place works, and the manifest's `source` list is the only build
  file. But file order is rule order (10), observation ids clash across files with no location, and a law cannot be
  factored into a module other adventures install (16).
- **Extensibility.** No engine change was needed, which is a real achievement. The extension points an author does need
  are global files: the item and species catalogs, `data/rules`, and `web/scenarios.ts`.

## 7. Highest-leverage recommendations

1. **Let modules declare their own kinds and species.** Every adventure has unique things, so every adventure is
   blocked or pollutes the global catalog. This is the single change that most moves Kyr toward "an adventure is its
   source".
2. **Expose perception to rules** (`perceives`, `attends`, `Watches`, `Seen when`). It turns this setting's physics
   into a few lines. It also fixes ownership (7), concealment (17) and ambushes and sentries in any setting, and it
   costs little, because the runtime already computes it for narration.
3. **Give passages conditions and conditional ends, and file authored actions by their subject.** Doors, gates, ferries,
   one-way drops and portals stop needing bespoke movement actions that repeat `go`. The reader can then show a world's
   central verb where it belongs.
4. **Make bodies last in world time.** Sleep, paralysis and capture are basic to adventure; today one crashes the game
   and the other evaporates.
5. **Write the evaluation model down, and catch what breaks it at compile time.** Order of rules, cascade, query
   binding and the ten-minute act cost me more debugging than all the fiction together. A page of documentation and
   three lint checks would have saved most of it.
6. **One companion model.** Kin and friends who come with you should keep their voices, be leavable, and fight. That
   is the difference between a party of people and a party of hit points.
