# Rebuilding one situation: Caught Below

19 October 2026. This increment rebuilt one situation end to end: the language constructs, world semantics, scenario
design and player presentation all changed together. It was not a broad UI redesign and not a new campaign. The
intended experience was written before implementation: [caught-below.md](caught-below.md).

**What exists now**

- **Situation:** [the portable situation source](../../data/situations/caught-below/situation.kyr), 121 lines,
  with no site names.
- **Installations:** two in distinct sites, [Reedwake and Censer Hill](../../data/sites/reedwake/site.kyr) (a
  river, early autumn) and [Skellfold](../../data/sites/skellfold/site.kyr) (a slate quarry, first snow), through
  [river](../../data/caught-below/river.campaign.json) and [quarry](../../data/caught-below/quarry.campaign.json)
  campaign manifests.
- **Language:** first-class `Passage`, `Thing` (states, changes, hazards, guards), `Event`, `Objective`, labelled
  `Pursuit`s, one-time topics, `Seen` text, anchored observations, place grid positions, `{entity}` names in text,
  and existential variables (`?x`) in predicates. All of it lowers into the existing fact/rule runtime.
- **World rules:** [data/rulesets/world/](../../data/rulesets/world). Legacy rulesets are unchanged.
- **Mono client:** a real map (SVG from authored grid positions and known passages), a wide bottom activity strip
  with bounded history, the objective under the place name, and the Map and Lately panes removed.
- **Tests:** [test/caught-below.test.ts](../../test/caught-below.test.ts) (simulation),
  [test/world-constructs.test.ts](../../test/world-constructs.test.ts) (language),
  [test/caught-below-browser.test.ts](../../test/caught-below-browser.test.ts) (both installations in Chromium,
  with map checks).

## Before and after: what the player saw

**Before**, in Serewater, from the review's playthrough. Pell had been brought home and thanked. Then:

```
>>> Escort Pell, surveyor to Willow causeway
    You travel together. Your companion remains at the actual destination; no one teleports home.
>>> Escort Pell, surveyor to Chalk ridge
    You travel together. Your companion remains at the actual destination; no one teleports home.
```

Freed but not escorted, Pell stood in the vestibule forever, because his dialogue said so: *"I do not follow people
who walk away without me. If you go deeper, I will wait here."*

**After**, from the recorded browser histories ([river](../playtests/caught-below/river-desktop.md),
[quarry](../playtests/caught-below/quarry-desktop.md)):

```
Ask Pell to come with you          Pell falls in beside you.
Take the hoist passage …           You witness: Pell takes the hoist passage toward Casting gallery.
Take the culvert …                 You witness: Pell takes the drain culvert toward Drain mouth.
Take the causeway path to the quay Wren sees Pell, and runs. For a while nobody says anything sensible.
Speak with Wren                    Wren takes your hands in both of theirs. 'You brought them back yourselves. …'
```

Left alone in the quarry after the rotten ladder broke under Bran, Tamsin went round by the tub incline, which is
the only way still open, met Marrit on the green, and the two of them went home. A test asserts that route. Left
alone behind a guarding hound, Pell is shown as *"making for the ferry house, but no way is open to them"*. He waits,
and he follows if led through the crawl the company knows about.

## Before and after: the source

Serewater's Pell, before:

```kyr
Initially Assert trapped(pell). Initially Assert restrainedBy(pell, rack). Initially Assert mounted(rack, vestibule).
Initially Assert obstruction(rack). Initially Assert home(pell, quay).
Initially Assert route(quay, causeway).
Initially Assert route(causeway, quay).                  // … 55 directed route facts in all
Initially Assert gate(marshfang, causeway, drain).
Initially Assert route(drain, causeway).                 // the boar guards only one direction
Observe scene_vestibule at vestibule when trapped(pell) "… You can shift the rack and escort him back through ordinary routes. …".
Topic pell_free with pell "Ask Pell where to go now" when rescued(pell) { Says "… Use Escort if you want me with you. …". }
```

The same ideas, after:

```kyr
Passage culvert "the drain culvert" between drain_mouth and workshop.
Person hound "Ash" at gallery {
  State guarding blocking "A lean cave hound stands across the hoist passage, head low, lips back from its teeth.".
  State calm "The cave hound lies in the mould dust, watching, no longer barring the hoist passage.".
  Guards hoist_passage.
  Change soothe "Approach {self} slowly, low and quiet" from guarding to calm needing woodcraft.
  Change feed "Toss {self} a ration" from guarding to calm consuming rations.
}
Thing water "the closing" on closing_way {
  State open "{closing_way} is still clear, but {water} will close it at about watch {closesAt(water)}.".
  State closed blocking "{water} has closed {closing_way}.".
}
Pursuit stay_close for guest "staying close to you" priority 30 when following(guest, party) seeks together(guest, party).
Pursuit go_home for guest "making for {home}" priority 20 when freedBy(guest, party) and not following(guest, party)
  and not hobbled(guest) and not returned(guest)
  and (not together(guest, party) or dismissed(guest, party) or reunited(guest)) seeks at(guest, home).
Event reunion near guest when together(guest, relative) and freedBy(guest, party) "{relative} sees {guest}, and runs. …" then {
  Retract following(guest, party). Retract acceptsEscort(guest, party). Assert reunited(guest). Assert state(relative, relieved).
}
```

### What disappeared

| Old declaration | Now |
|---|---|
| Two directed `route` facts per connection (55 in Serewater) | One `Passage … between a and b` (12 per site) |
| `gate(guard, a, b)` plus a separate plain reverse `route` | `Guards passage` on the guard; blocks both ways while its state blocks |
| `hazardPassage(trap, a, b)` plus a plain reverse `route` | A `Thing` on the passage with a `dangerous` state and `Hurts with … when … then …` |
| `trapped` / `restrainedBy` / `obstruction` / `mounted` / `rescued` latches | The thing's state and the person's condition; `following` as an ongoing relation |
| `escort` schemas that move a second group | `lead`, then the person's own `stay_close` goal using the same `go` everyone uses |
| Scene text per flag that also carries the room's base description | Base description separate from each thing's state descriptions, which follow the thing |
| `district(…)` / `townDistrict(…)` classification facts | Containment (`Place … within …`) |
| Topics explaining the mechanics ("Use Escort …") | Removed; the person's visible goal ("making for the ferry house") says it |

### Invariants that are now automatic

- A passage is traversable both ways unless written `one way`, and an obstacle on it applies from either side.
- A thing is in exactly one state (`state` is exclusive), and its description is whichever state it is in.
- A description or event is perceived only where its subject is: at a place, near a thing or person wherever they
  are now, or from either end of a passage.
- An event fires once. A one-time topic is spoken once.
- People, animals and the company move by the same `go`, so an NPC cannot pass where the player could not.
- A hidden passage does not exist for anyone who has not learned of it; a follower may use what their leader knows.
- Text naming `{entity}` shows whatever that role was bound to in this installation.

### Authoring errors now caught at load time

These are covered by [test/world-constructs.test.ts](../../test/world-constructs.test.ts):

- A change or hazard naming an undeclared state.
- A duplicate state.
- A passage whose two ends are the same place.
- Text naming an entity that does not exist.
- An observation or event anchored to the wrong kind of thing.
- A query called with an unbound variable (runtime).
- A role condition the bound site does not satisfy, for example `connects(closing_way, ?a, ?b)`.

## Every important interaction, checked five ways

Columns are the five checks: (1) reason to try, (2) applies to this target, (3) what changes, (4) what the player
is told, (5) what continues afterwards.

| Interaction | (1) Reason | (2) Applies | (3) Changes | (4) Told | (5) Afterwards |
|---|---|---|---|---|---|
| Find the missing person | Wren watching the road at the quay; her plea; footprints in the vestibule; the cry | Cry fires only beside a pinned person | — | "A voice from low down in the dark …" | Objective updates |
| Pass the hound | It holds the passage (state description, growl) | Soothe needs woodcraft; feed needs a ration; fight not offered against peaceable people | Hound state `calm`, a ration spent, or the hound dead | The calm-state description | Passage open from both sides; hound stays, calm |
| Lever | The person names the bar and where it is | Only with the bar in hand, beside the pinned person | Weight propped; person hurt and free; consent to be led | "You get a pry bar under …" | Person waits, follows, or goes home |
| Dig | No tool needed | Beside the pinned person | Weight dug under; same as lever | "It takes most of an hour …" | 40 minutes pass; the closing approaches |
| Heave | Quick; the cry warns against it | Beside the pinned person | Weight toppled; leg broken; lifter hurt | "… the leg is broken." | Person cannot walk alone; can follow; can be splinted |
| Set the leg | The person says they can't walk | Only if a companion knows a healing touch | Person hurt, can walk | "The leg is straightened and splinted …" | Can now go home alone |
| Lead / part ways | The person says what they mean to do | Lead only after freeing; "make their own way" only if they can walk | `following` or `dismissed` | "Pell falls in beside you." | They walk a step behind, or set out alone |
| The way closes | Wren gives the time; the description near it | — | Closing state `closed` | Event beside the passage only | Shut from both ends; the long way is still open |
| Reunion and thanks | Objective; Wren is at the lookout | Thanks only once, and different if you sent them off alone | Coin moves from Wren's purse to the company; gratitude | Specific thanks and reproach | Wren and the person walk home together |

## One situation, two places

| | Reedwake (river) | Skellfold (quarry) |
|---|---|---|
| Missing person | Pell, surveyor (human) | Tamsin, quarry tally-keeper (dwarf) |
| Waiting | Wren, ferry-keeper, on the quay | Marrit, grandmother, on the green |
| Fallen weight / tool | timber rack / pry bar (a `crowbar`) in the dry stores | derailed ore tub / crowbar in the smithy |
| What closes the short way, and when | the rising river closes the drain culvert (watch 31–34, about 1:10–1:40 p.m.) | drifting snow closes the beck lane (watch 25–28, about 12:10–12:40 p.m.) |
| Obstacle on the way in | a guarding cave hound (fight, soothe, feed) | a rotten ladder (risk it and it breaks; or brace it with a line) |
| Alternative routes | the ridge track; a hidden tram crawl (survey board) | the fell track; the side drift and tub incline |

The tests check that both installations have the same situation actions and goals, and that a freed person walks
home alone in both. Each uses a different route, decided by that site's geography and what has happened in it.

## Spatial representation

- **Passages** are entities with two ends (or one, if `one way`), and may be hidden until a fact is known or need
  an item kind. Things and guards stand *on* them. They lower to `connects`, `on`, `guards`, `revealedBy` and
  `needs` facts; the queries `passable`, `obstructed`, `hazardous` and `visibleTo` read them.
- **The map** ([passage-model.ts](../../src/ui/passage-model.ts) → [mono-map.ts](../../web/mono-map.ts)) draws
  places the company has stood in, the far ends of passages seen from them (marked `?`), and each passage coloured
  by status: open, shut, guarded, dangerous, or not yet walked. Containing areas (level, building, settlement) are
  outlined. The browser test checks that the marked location equals the semantic location at every checkpoint, and
  that guarded and dangerous ways change colour when their condition changes.

**What a terrain-generation phase would have to produce** to replace the hand-authored sites:

1. A containment tree: region, settlement or wilderness, site, building, level, room.
2. A position per room, or an embedding the map can lay out.
3. Passages with two ends, a physical name, and whether each is one-way.
4. For each passage, its scale (steps, a building threshold, an overland journey), which today is uniform.
5. Anchors where a situation can bind: a room for an accident, a home, a lookout, a tool store.
6. At least one passage on a shorter route that an environmental process can close, plus an independent longer
   route, so that "the short way closes" has meaning.
7. Optional obstacles and hazards placed on passages, with their states.
8. Base descriptions per room that do not depend on what may change there.

## Interface changes

- **Activity strip:** a full-width, four-line band at the bottom, newest happening last. It shows the action
  result, events, what you witness people do, and resource changes. <kbd>H</kbd> (or the button) expands it to a
  bounded 120-line history that scrolls inside itself.
- **Map:** always visible on the explore and conversation screens. The Map mode, and its list-as-navigation, is gone.
- **Objectives** appear under the place name. They are authored, state-dependent and in fictional terms.
- **People** show their visible condition (pinned, hurt, guarding, calm) or what they are trying to do.
- **Modes:** Explore, Pack, Company and Journal, plus conversation and combat when they happen. The separate Party
  and Map modes and the Lately pane were removed.

## Cold playthrough

I played the river installation from the start, reading only what the screen model shows, and deliberately avoided
the designed path: I skipped Wren, climbed by the ridge, fought the hound, heaved the rack, wandered, and led Pell
home by an unplanned route. Each moment of confusion is recorded with its cause. The fixes are in world state or
scenario design, not tutorial prose.

| Moment | Cause | Resolution |
|---|---|---|
| At the quay nothing suggested going anywhere in particular; the reason to get involved was hidden inside the ferry house | Missing motivation | **Fixed in the scenario:** Wren now waits at a `lookout` role, watching the road, and hurries over when you pass |
| The survey board names Pell before you know who he is | Missing information (ordering) | Open. It is acceptable as world information, but it reads oddly when you meet the board first |
| Heave had no visible downside until you had asked Pell | Missing information | **Fixed:** Pell's cry now warns against hauling on the weight |
| With a broken leg, "Let them make their own way" was offered | Inappropriate action | **Fixed:** `part_ways` requires that the person can walk |
| "The river will close it before evening" when it closed before noon | Weak world state reflected in prose | **Fixed:** the prose renders the generated closing time ("about 11:40 a.m.") |
| Wren asked "Did you see Pell?" as Pell walked in behind you | Incoherent event ordering | **Fixed:** greeting conditions; the reunion now happens wherever they meet |
| "Get Pell home" still showed after Wren had him; "has Pell home" showed on the quay | Weak world state (latched objective/description) | **Fixed:** conditions on `reunited`, and a rewritten relieved description |
| Ask Pell to come with you was still offered at home | Weak world state, the same family as the original bug | **Fixed:** the homecoming withdraws consent; a test covers it |
| Freed Pell walked off the instant he was freed | Weak world state (goal too eager) | **Fixed:** he waits while the company is with him |
| Item narration explained persistence ("will remain with them between expeditions") | Prose explaining implementation | **Fixed** in the forked world rules; legacy rules left alone to keep Serewater histories byte-identical |
| The map was unreadable small type; adjacent passages invisible | UI presentation | **Fixed:** wider column, two-line labels, wider spacing |
| On a phone, the map is a thumbnail and the strip shows two lines | UI presentation | Open |
| Wren's first greeting cannot happen before the first action | Engine: rules do not run at time 0 | Open; see the language direction below |
| Every generated person is "they" | Missing information (no pronoun model) | Open, and deliberate: no gender is guessed |

This is a developer's cold run, not a first-time player's. No unfamiliar human has played Caught Below.

## What this reveals about Kyr's long-term language direction

1. **The fact/rule core was sufficient. The missing piece was vocabulary.** Every new construct lowers into
   existing relations, rules and actions; no second interpreter was needed. The one runtime addition that mattered
   is existential variables. Without them, "is anything blocking this passage?" cannot be written generically, so
   authors wrote one-off flags.
2. **Situations need *intention*, not flags.** Two labelled pursuits and one ongoing relation (`following`)
   replaced the rescue/escort machinery and produced behavior the old version could not express: walking home
   alone, refusing a guarded passage, waiting, being met halfway. The planner was already there; nobody had been
   given goals.
3. **Physical state belongs to things.** Descriptions, obstacles, hazards and transitions attached to the thing they
   describe removed the contradiction class where scene prose depends on unrelated flags.
4. **Text needs names, not grammar.** `{entity}` interpolation plus sentence capitalization was enough for both
   installations to read naturally. A narration language was not required for this scale.
5. **Next language work, in order:**
   - Rules evaluated at initialization.
   - Per-passage scale, so time depends on distance.
   - Reusable *approaches*: lever, dig and heave are still bespoke actions. A `Change` with time, risk and effects
     on other entities would absorb them.
   - Reactions to observed events: witnessing violence, noticing absence.
   - NPC actions longer than one tick.
   - Pronouns or other identity data from generation.

## Serewater patterns to deprecate or migrate

| Pattern | Status |
|---|---|
| Hand-written `route(a, b)` pairs | Deprecate; migrate to `Passage` |
| `gate`, `cross`, `released` | Deprecate; migrate to `Guards` and guard states with `Change`s |
| `hazardPassage`, `risk_passage`, `cleared_passage`, `armed` / `triggered` | Deprecate; migrate to a `Thing` on a passage with `Hurts …` and the generic `risk` |
| `climbingPassage`, `climb` | Migrate to `Passage … needing ropekit` |
| `informedPassage`, `passage` | Migrate to `Passage … hidden until fact` |
| `trapped`, `restrainedBy`, `obstruction`, `mounted`, `rescued`, `escort` | Deprecate; use thing state, person condition, `following` and goals |
| `district`, `townDistrict`, `wildernessDistrict`, `undergroundDistrict` | Remove; containment already says it |
| Scene `Observe … when <flag>` that carries base description | Split into a base description plus thing state descriptions |
| Topics and results that explain mechanics | Rewrite as what people say and what happens |
| Generic `pay` / `give_food` to any group | Deprecate; express exchanges as changes or topics on those who trade or eat |
| Backgrounds that unlock one campaign's puzzles | Review; keep the capability but tie puzzles to what a character can do |

Serewater itself is unchanged and remains a regression reference. Its two recorded histories still replay
identically. Migrating it is now mechanical, but it is not done here.

## Boundaries of what was proven

- One situation, two installations, both authored by the same person who wrote the constructs. No general claim
  about scenario authoring follows from that.
- The sites are small (10–11 rooms and 11–12 passages each) and hand-placed on a grid; nothing was procedurally generated.
- NPC behavior is bounded: goal-directed movement and state-based reactions. There is no memory, no conversation
  driven by belief, and no reaction to events the NPC did not cause or encounter.
- Every passage takes ten minutes. Time pressure works only because the sites were laid out with that in mind.
- The simulation tests check causal behavior. The browser tests check that the interface works and fits the
  screen. Neither establishes that a newcomer understands or enjoys it.

## Update, 19 October 2026: the region around the situation

The consolidation round ([doc/architecture/milestones.md](../architecture/milestones.md)) rebuilt the two sites with the
canonical vocabulary. The situation's causes are unchanged. What changed:

- **Distance.** Passages have kinds and durations: the causeway path takes an hour, the ridge track and the low path
  thirty minutes each, a doorway ten. The closing times were moved later to match, so the race against the water is
  set by the map, not by counting moves.
- **A town to prepare in.** Reedwake has an inn (Maud, an innkeeper by profession: a night's lodging with supper and
  full recovery for 3 coin), a herbalist's shop with counted stock (rations, bandages, rope, a healing draught), and
  a shrine. Skellfold has a smith and a miner. Prices move coin from the company to the seller, and stock runs out.
- **Food and rest.** The company eats a ration each evening. Without one it goes hungry and cannot sleep rough.
  Camping is possible in open country, not in town or indoors.
- **Who the company is.** Each companion has an Orsino background (hunter, locksmith, medic, explorer, miner) that
  brings attribute changes, a little coin, gear and a skill. Skills open different approaches: lockwork opens the
  stores padlock, woodcraft calms the hound, mending sets a broken leg, digging halves the dig, and wayfinding puts
  the region's roads on the map. A company without a locksmith pays the hound a ration and goes round.
- **Maps at two scales.** The site chart shows the area the company is in, with stubs for ways out of it. A region
  strip shows areas and the time between them.

Two items from the "next language work" list above are now done: per-passage scale, and NPC actions longer than one
tick (an NPC on an hour-long road arrives an hour later). The boundary "every passage takes ten minutes" no longer
holds.

