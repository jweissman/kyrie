# Kyr / Deem authorability: what was migrated, what is requested

*11 November 2026. Two isolated migrations out of TypeScript into data, both semantics-preserving and tested; a survey of what else is TypeScript that an author would rather write; and narrowly specified requests, each with a reproducible example. Nothing here changes the Kyr language or a shared architecture.*

## A. Migrated (done, tested: `test/authorable-generation.test.ts`)

### A1. How many works of a kind a country holds: `@count N` in the plan

*Before:* a table in `src/world/history/histories.ts` — `counts = { cistern: 2, weir: 1, galleries: 2, watchtower: 3, barrow: 3, singing_hall: 2, keep: 2, abbey: 1, tollhouse: 1 }` — so a person adding a work plan had to change TypeScript to say "three of these, not one".
*Now:* a header line in the plan's own `.kyrt` (`@count 3` in `barrow.kyrt`), read by `WorkPlans.parse`; one where the plan says nothing. The table is gone; the values are the same, so every generated country is unchanged (`bin/kyrie world ember` before and after differ only by the new posting-house). One bug this surfaced: `weir` was named in the table and in `arts.json` but has no plan file at all; nothing misbehaved because the draw ignores plans it cannot find.

### A2. Whether a section of a Kyr template is written: `if` / `unless` in the template

*Before:* `region-outskirts.ts` had a filter, `x.group !== 'road' || station.station`, i.e. TypeScript that knew which group of a Kyr template only applies where a posting-house exists.
*Now:* `--- road station 1 if station` in `outskirts-deep.kyrt` (the same syntax work plans already used: `--- sign star 1 if greatart`), read by `KyrTemplates.parse`/`choose`. A group left with no eligible option writes nothing. Existing templates are unaffected (the new `choose` parameter defaults to empty; the draw order is unchanged for groups that kept all their options).

## B. TypeScript that an author would rather write (survey; not migrated)

| Where | What it does in TypeScript | Natural home | Cost / risk |
|---|---|---|---|
| `region-renewal.ts` `RegionRenewal.work` | writes, as strings, the Kyr for "a work stands empty; some nights later beasts move in; the innkeeper tells; the company is thanked once" | a `.kyrt` section `renewal` with `{beast}`, `{nights}`, `{thanks}` holes | the beast is drawn by ecology; needs a `{!…}` hole for a computed species and the room's `lair`; medium |
| `region-stock.ts` | decides which bare rooms are dens and which hold a cache; writes the Kyr | a plan header `@stock den cache` and a template for each | the "bare room" test reads structure from parsed Kyr; keep in TS, move only the prose |
| `region-riddles.ts` | attaches a riddle door to any work's `{w}_in` with probability 0.4 | a plan header `@riddle 0.4`/`@riddle no` | tiny; see request R3 |
| `region-fellows.ts`, `region-recruits.ts` | the first town's travellers and their prose | `data/generation/scenes/travellers.json` already holds callings; the prose that composes the sentence is TypeScript | the table exists; the grammar does not |
| `Foundings` | picks a settlement's founding by nearest work and river | already `foundings.json` for text; the *rule* is TypeScript | leave |
| `RegionOutskirts.station` (this branch) | finds the posting-house's id, name and where it lies, for a template | a generic `{!find:plan=roadstation}` template function | small; see R2 |
| `scenery.json` (data) | maps a room to a painting by the words in its name or id | authors cannot say "this room is this painting" in a plan | see R4 |

The honest summary: the *prose* of generated places is mostly already data (`.kyrt`, `.json`); what is TypeScript is the **selection** (which place gets which section) and the **composition** (what holes a template receives). The cheapest large gain is *holes*: a handful of generic template functions (`find` a site by plan, `pick` a name by folk and sex) would let authors write the three or four composition rules that now live in six files.

## C. Requests, each with a reproducible example

### R1. Cross-section conditions in plans (and templates)

*Problem.* A plan chooses one option per group independently, so an author cannot keep the groups consistent with each other. The posting-house's `master` (three stationmasters) and `last` (four endings) are chosen separately, and the pairs are sometimes in tension (the *clerk's* day-book with the *stayed* ending reads fine; the *widow's* with *recalled* implies a seal that two sections both mention).
*Request.* `--- last stayed 2 if master:pedant` (an option of a group is eligible only if another group chose this option), or a `weights` row keyed on the pair.
*Reproduce.* `bun scripts/dump-region.ts kahitude e1 | grep -n "last_scene\|daybook"`; change the seed to `a1`/`thorn` and compare the pairs.

### R2. A template function to find a site by plan

*Problem.* A template for one place cannot name another place without TypeScript to compute its id (`RegionOutskirts.station`). Every cross-place connection is a bespoke TS lookup.
*Request.* A built-in hole `{!site:roadstation}` returning the id of the (first) site of that plan, and `{!site:roadstation:name}`, with the section's `if site.roadstation` using it.
*Reproduce.* `outskirts-deep.kyrt` needs `station`, `stationname`, `stationwhere`; there is no way to write it without `region-outskirts.ts`.

### R3. Plans must be able to opt out of the riddle door

*Problem.* `RegionRiddles` writes a riddle door onto any plan's `{w}_in` passage with 0.4 probability, so an Aenean posting-house had a "speaking door" (a Mathematical Age thing) on its carriage-arch until the entry passage was renamed `{w}_front` to dodge it.
*Request.* `@riddle no` as a plan header (default: as today).
*Reproduce.* Rename `{w}_front` to `{w}_in` in `roadstation.kyrt`, `bun scripts/play-at.ts kahitude mage e1 zzqq`: the offered ways include "look at the speaking door › Press the word “Feather”".

### R4. An author's painting for a room, in the plan

*Problem.* Which painting a generated room shows is a function of the words in its name or id (`scenery.json`'s `kinds`). The posting-house's approach (`w10` or `e1`, a room in the wild) shows `arcadia` (a pastoral road) instead of the ruined arch because its words name no kind; its yard shows `fane`.
*Request.* A `seen as "…"`-style clause on a Place (`Place {w} "…" is room … painted "scene-ruins".`), or a `@painting` header per plan section, so the painter's intent is in the Kyr.
*Reproduce.* `bun scripts/rooms-painted.ts kahitude e1 e1_yard`: `arcadia` for the approach, a generic arch or fane for the yard (the Empire's posting-house is `e1`).

### R5. A scenario that binds to a *work* and fills it

*Problem.* A scenario may claim only a site that is not a work (`world-assembler.ts`: `!w.work`), so "a stranger who pays in old coin, to be taken to the old place" (the `oldcoin` scenario) gets a one-room ruin with nothing in it; it cannot take the new posting-house, which has twelve rooms and the answer to the coin.
*Request.* `"places": { "ruin": { "work": ["roadstation"] } }` in a scenario manifest, with the plan's `outside` kept and its inside either kept or filled by the scenario's module (the existing "taken" mechanism already exists for kits).
*Reproduce.* `data/scenarios/oldcoin.scenario.json` places `ruin` on `site: ["ruin","tower","barrow"]`, which excludes every work.

### R6. Hold-by-kind reads: a documented predicate for "the company has this"

*Problem.* The state `holding(party, kind)` exists but is a rule over `ownedItem(item, member)`; a spec author asking `owns(party, item)` (the obvious name) gets `Unknown predicate`. Three tries to learn `ownedItem(item, member)`.
*Request.* One line in `doc/authoring/guide.md` ("is the company holding this? `ownedItem(item, anyone)`"); optionally a `carries(party, item)` alias.

### R7. A posted limit (load-bearing bridge)

*Problem.* The arcology conception needs "a deck that tilts under what you carry". Nothing in the rules compares the company's burden to a number; a `Thing` can only `need` a capability or item kind.
*Request.* A change `needing weight(party) <= N`, over the existing burden measure (`burden.test.ts` shows burden is already computed).
*Reproduce.* None yet; this is a request for the arcology, not a bug.

### R8. A name from the town's folk in a template

*Problem.* The Hall's cook, boy, keeper and reeve have fixed names (Orla Pennick, Wimble, Wystan Hale, Aldous Fenn) because a template has no hole for "a name from the town's people". Fixed names are good for authored recurring characters (a deliberate choice here) and wrong for anyone a template draws more than once.
*Request.* `{!name:folk:woman}`, drawing from `names.json` by the town's folk and sex, so the cook can be an Orla in one country and an Aelfgyth in another while remaining the cook.

### R9. Duplicate words in a way's label

*Problem.* A passage and the room it enters with the same name give "Into the carriage-arch by the carriage-arch" in the choice list.
*Request.* The label generator drops the "by X" when X is the destination's own name.
*Reproduce.* `Passage {w}_front "the carriage-arch" is arch between {w} and {w}_gate` (as first written; renamed in this branch).

### R10. The state-name error is noisy

*Problem.* One bad argument (`Manner eager`) produced a block of unrelated "'closed' is already declared by the shared rules" lines (`closed`, `turned`, `shut`, `seized`, `barred`) that are *not* errors, so a newcomer chases the wrong ones.
*Request.* Print only the errors, not the ones the shared-names check lists as context.

### R11. A painting that depends on the state of the place

*Problem.* A room has one painting (or one of a list by hash) whatever has happened in it: a lit undercroft and an unlit one are two paintings, but only one is shown (`scene-undercroft-dark`; the lit `scene-undercroft` is unmapped); a spiders' brood is painted whole after it has been burned (the 10 November commission list, item 2).
*Request.* `scenery.json` kinds accept `when`: a fact or state name, with the painting list for each (`"room": {"dark": ["scene-undercroft-dark"], "lit": ["scene-undercroft"]}`), read from the same relations the page already reads for darkness.
*Reproduce.* `bun scripts/rooms-painted.ts kahitude s1_manor_cellar`, then light a torch in it and run it again: the painting is the same.

### R12. A topic that takes an item from the company

*Problem.* A topic can `Give n gold to actor` and assert and retract relations, but there is no plain way to say "this person takes that item from the company" (the generic `Give to › X` act exists only for someone who `Wants` the kind). The Hall's amends after a theft (the cook takes the silver box back through the kitchen, and the steward's doors reopen) cannot be written.
*Request.* An effect in `On discuss { … }` such as `Take {item} from actor.`, over the same ownership relations the generic give already uses.
*Reproduce.* `bun scripts/play-at.ts kahitude warrior s1_manor_library "Take" ">s1_manor_hall" ">s1_manor_kitchen" "zzqq"`: the box is carried, the doors are shut, and nothing offered in the kitchen can return it.

### R13. One name added to a country re-picks every kin's name

*Problem.* `FantasyRules.another` chooses a kin's given name as `free[hash % free.length]`, where `free` is the pool minus every name already in the country. Adding or removing *one* name from the pool's side changes `free.length` and so re-picks the name of everyone drawn this way: authoring a kitchen boy called "Tam" in the first town turned the drover's son in seed `kite` from Nicol into Hamo (the raiders' chief's name), and would have changed the reference world's brother and mother the same way. Content authors cannot name a person without risking the country's cast.
*Request.* Pick by rendezvous (highest-random-weight) hashing over the pool, so that removing a name changes only the person who held it; or have authors' bare names checked against the pool (the lint can say "Tam is a given name of the folk: choose another or accept a re-cast").
*Reproduce.* In `outskirts-deep.kyrt` rename the kitchen boy "Wimble" to "Tam" and run `bun test test/decision-frame.test.ts`: the spec fails with Hamo for Nicol.

### R14. A feat that a companion's regard can open

*Problem.* `take_feat` offers a companion a feat at levels five, ten and fifteen, from `featOpen(member, feat)`, which the engine derives (`creature-facts.ts`, `Advancement.feats`); no Kyr effect grants a trait or opens a feat. A paragon quest that should end in a feat can only end in a keepsake granting a capability (`bond.kyrt`).
*Request.* `Assert featOpen(member, feat)` accepted from authored rules for feats the author declares, or `Grant trait <id> to <member>` as an effect, with the feat's own prerequisites checked.
*Reproduce.* Add `Assert featOpen(actor, veteran)` to any topic's `On discuss`: the engine rejects it as engine-written.

## D. Requests from the three standing modules (one sequence, R23 to R47)

*The three deep modules were authored apart, each numbering its requests from R15 (the Numbered House R15 to R22; the Bound Howe R15a to R15g; the Silent Lord R15s to R21s), and the integration (`adventure/fs-integrate`, 11 November 2026) renumbered them into one sequence. Where the old number is quoted in a commit, a transcript or a storyboard written before it, this table says what it is now.*

| Old | New | Module | Subject |
|---|---|---|---|
| R15 | R23 | Numbered House | a scenario cannot name, describe or place the site it generates |
| R16 | R24 | Numbered House | a passage that bears a weight |
| R17 | R25 | Numbered House | no way to choose a number |
| R18 | R26 | Numbered House | an action's site is not tied to what it acts on |
| R19 | R27 | Numbered House | a guard's posted state is told from the far end too |
| R20 | R28 | Numbered House | a cast person's name is lost to a conditional role |
| R21 | R29 | Numbered House | Deem facts cannot select among authored sections |
| R22 | R30 | Numbered House | effects written after a `Spend` in a topic are lost |
| R15a | R31 | Bound Howe | a standing scenario cannot say which towns hear of it |
| R15b | R32 | Bound Howe | nothing can be written asleep |
| R15c | R33 | Bound Howe | a light cannot be put out by an authored effect |
| R15d | R34 | Bound Howe | a generated site keeps room text the module cannot replace |
| R15e | R35 | Bound Howe | a lone creature at a high level has the action economy of one |
| R15f | R36 | Bound Howe | a fight in a spec cannot use an item |
| R15g | R37 | Bound Howe | a scenario cannot speak to the first town's authored people |
| R15s | R38 | Silent Lord | a scenario cannot import the first town's authored people and facts (the same as R37) |
| R16s | R39 | Silent Lord | a new kind of site is three data edits in three files |
| R17s | R40 | Silent Lord | a person both `Peaceable` and with a `Temperament` still warns on arrival |
| R18s | R41 | Silent Lord | no routine for people who keep hours |
| R19s | R42 | Silent Lord | a shared relation name taken for a module's own fails at the spec, not at the load |
| R20s | R43 | Silent Lord | a topic whose effect takes coin from a person who has none is never offered |
| R21s | R44 | Silent Lord | two topics with one label, only one eligible, are not offered |
| (new) | R45 | integration | two bound places cannot be compared, so a rumour told by the first town and by the near town can double |
| (new) | R46 | integration | passive hearsay has no once-only line, so a wait shows two modules' lines together |

### The Numbered House (module 1, `adventure/fs-wonder`, 11 November 2026)

*Each met while building the arcology as a standing scenario, worked around in Kyr, and left with the case that reproduces it. The module is `data/situations/arcology`; every case below can be reproduced in it.*

### R23. A scenario cannot name, describe or place the site it generates

*Problem.* A scenario that asks for `"site": ["ruin"]` gets a site named by the country's tongue (`Foliumporta`, "leaf gate"), described in its kind's generic words ("Fallen walls in rough grass; someone built here once.", then "Over the door, cut in the old script: …"), laid by `Atlases.place` wherever the ruin's ground is best hidden, and told of by the nearest settlement and its neighbour on a road. The author cannot say "a day from the first town", "beside the old road", or "this is what it looks like", and the generic lines come first on the page, before the module's own. For a place that is meant to be remembered, the first sentence is the generic one.
*Request.* In a scenario's `places` entry: `"near": "road"` or `"within": {"hours": [4, 12], "of": "start"}`; `"look": "…"` and `"seen": "…"` to replace the kind's generic sentences for this site; and `"cut": "…"`/`"cut": false` to drop or write the name over the door.
*Reproduce.* `bin/kyrie play --world kahitude --as human/warrior/Ralf ">w13"`: the first sentences are the ruin kind's.

### R24. A passage that bears a weight (R7, with what exists now)

*Problem.* R7 asked for a deck that tilts under what it carries. `carried(member)` and `capacity(member)` exist (`belongings.kyr`), so the Bridge of Weights is a `Query overweight(a)` over `carried(?m) > limit(deck)` and a rule that, when the company is standing in the middle room, throws it back to the near room and strikes a hazard. It works, but a crossing cannot be refused at the near end for what is carried (the rule fires after the company is already on the span), and the bridge needs three rooms where one passage would do.
*Request.* `Passage … needing load <= N`, or `Change … when carried(?m) <= N` on a passage's thing, evaluated at the foot of the way with the same refusal text as `opening when`.
*Reproduce.* `data/situations/arcology/tiers.kyr`, `deck_gives`; `test/arcology.test.ts`, "tips a company that carries more than ten".

### R25. No way to choose a number

*Problem.* A lock that wants a number the player works out (the drawer ring in the Drawer Gallery) cannot take one: an action has no numeric argument, a topic no free text. It is a measure turned a notch at a time by one action and tested by another (`turn_ring`, `press_ring`, `ring_opens`, `ring_jams`), and the Count at the Lodge is six actions (`give_one` … `give_six`) differing in one digit.
*Request.* `Action name(actor: group, n: number) "Give the post your number: {n}" for n in 1..6`, offered once per value, or a `Dial` thing with `Change turn "…" from n to n+1`.
*Reproduce.* `data/situations/arcology/entry.kyr`, `give_one` … `give_six`.

### R26. An action's site is not tied to what it acts on

*Problem.* `Action turn_ring(actor: group, site: place)` with `Requires at(actor, site) and state(drawer, locked)` was offered in *every* room the company stood in, because nothing ties `site` to the drawer's place. It was found in the first minute of play ("Turn the ring one notch" at the Landing). Nothing warned.
*Request.* A lint advice: an action whose requirement names a thing's state and a `site: place` parameter, and never `at(thing, site)`.
*Reproduce.* Remove `and at(drawer, site)` from `turn_ring` in `halls.kyr`; `bun scripts/play-at.ts …` at any other room.

### R27. A guard's posted state is told from the far end too

*Problem.* A person who `Guards` a way is told at both its ends in the words of their state. The keepers' niched state ("three tall figures of brass plate stand among the tablets") was told in the Reckoning Room, two rooms from any niche, and the Usher's "across the foot of the stair" from the Terrace above. The way round was `opening when not state(keepers, posted) "…"` on the passage, with no guard.
*Request.* `Guards way from end.` (as `Thing … on way from end` already does), or a state text per end.
*Reproduce.* Give `keepers` `Guards reck_door.` again and stand in the Reckoning Room.

### R28. A cast person's name is lost to a conditional role

*Problem.* A person declared "Someone" and named by generation, with `Role "…" when …`, is called "Someone" on the page (the entity's name is right: `arcology__salvager` is "Oswy"). With an unconditional `Role` the page says "Oswy, salvager".
*Request.* Let the name stand when the role is conditional (name alone, or name and the role that is true).
*Reproduce.* `Role "a salvager shut in the lift cage" when at(salvager, cage).` in `world.kyr` before the fix.

### R29. Deem facts cannot select among authored sections

*Problem.* The stair's order is one of three, and the true source of it differs by country. Generation can assert `pattern(treads, pat_b)`, but Kyr has no way to read a table into a rule except by writing the rule for each value (`seq_one/two/three` read `stepOne(?q, ?p)` facts, `steps_a/b/c` and `wear_a/b/c` are one each). Three values cost nine observations and rules; a fourth would cost three more.
*Request.* A way for a Kyr `Observe` or `Rule` to take a Deem-drawn text hole (`{!pattern:words}`) so that one line serves every value, as `.kyrt` templates do.
*Reproduce.* `data/situations/arcology/entry.kyr`, `wear_a`, `wear_b`, `wear_c`.

### R30. Effects written after a `Spend` in a topic are lost

*Problem.* `On discuss { Spend spoons from party. Retract owed(party). }` took the spoon and left `owed(party)` standing; `{ Retract owed(party). Spend spoon_kind from actor. }` kept the spoon (a module's own *kind* is not spent by its name) and the fact. The cure was an `Assert settled(party)` and a rule that retracts `owed`; the shrine's lamp-chain topic puts its `Spend` last for the same reason.
*Request.* Either apply every effect in the list, or lint a `Spend` that is not the last effect of its block. Say in the guide that a module's own kind is spent by the item's id.
*Reproduce.* `data/situations/arcology/kept.kyr`, `host_account`: put `Retract owed(party).` back after the `Spend` and run the Quiet Floor spec in `test/arcology.test.ts`.
### The Bound Howe (module 3, `adventure/fs-expedition`)

*Numbered R31… so that the other two authors' R16x, R17x continue without collision. Each was met while writing `data/situations/bound-howe` and worked around in Kyr; none is a bug.*

### R31. A standing scenario cannot say which towns hear of it

*Worked round by the integration (11 November): each of the Howe and the House now carries a `first` place bound to the `largest` settlement and tells the news itself, as a passive overheard line in that town's taproom (`Observe ... as hearsay when day(clock) >= N`). The request stands: the hearsay is authored twice, once in each module, and the carrier-made topics for the near town stay as they were.*

*Problem.* A scenario's hooks are told by the nearest settlement to its first site and that settlement's road neighbour (`ScenarioWord.of`, `home = RegionWriter.near(region, site)`), with the member contacts. A standing scenario meant to be found from the first town has no way to ask that the first town's people tell of it: in `kahitude` the Bound Howe's three rumours are told in Brockminster and Fearnmaere, not in Thornhaven (`bin/kyrie world kahitude`: `hook howe.ridge_told: told by s5_innkeeper, s5_traveller, s2_innkeeper, s2_traveller`); in `a1`, `thorn`, `b2`, `c3`, `d4` the first town does hear. The howe is reachable from the start by walking to the neighbour (spec: `is reached from the starting town by the page's own labels`), which is ordinary exploration, but it depends on the seed.
*Request.* A hook field `"towns": ["first"]` (or `"also": "largest"`) adding that settlement's channels' carriers to the tellers.
*Reproduce.* `bin/kyrie world kahitude | grep -A4 boundhowe`.

### R32. Nothing can be written asleep, so a sleeping band cannot be struck first or crept past

*Problem.* `asleep` is engine-written (`engine-writes.ts`); `attack` requires `not peaceable(opponent)`, so a `Peaceable` band that sits in its niches cannot be attacked at all, and a band that is not peaceable falls on the company on arrival (obedient/savage) or warns (territorial). The howe's household "sits until the roll is answered" had to be written as hostile-on-arrival with a rite, a greeting or a roll (`tolerates`) to avoid the fight, and "asleep by day, walking by night" as a rule that moves them (`household_out`). A company cannot surprise sleepers, nor pass them by a stealth check.
*Request.* `Dormant.` on a Person (or `Dormant until <condition>`): not hostile, may be attacked (the company acts first), woken by a rule or by noise (`Assert woken(x)`), and passed by a `check(actor, stealth, …)` Action that the author writes.
*Reproduce.* Add `Peaceable.` to `household` in `data/situations/bound-howe/situation.kyr`, enter the gallery: no "Attack" is offered.

### R33. A light cannot be put out by an authored effect

*Problem.* The chamber of flutes was designed with a draught that snuffs flames (light as a resource the company must carry more of). The player can put a light out; no effect lets a rule do it (`Retract lit(…)` is engine-state). The draught became a sound clue only.
*Request.* An effect `Douse ?c.` (or `Snuff ?light.`) that puts out a carried light as the player's own "Put out" does and spends what is left, so a draught, a wet passage or a gust is a hazard.
*Reproduce.* Try `Rule draught when at(party, flutes) { Retract torchlit(party). }` in the module: rejected as engine-written.

### R34. A site generated for a scenario keeps room text the module cannot replace

*Problem.* A barrow-kind site generated for a scenario is described by its generic room (`A long grassed mound with a stone-lined entrance. Owl pellets lie on the lintel… in the old script: SPINATUMULO.`), which says the room is a barrow's door. The module wanted that room to be the Kin's small marker-barrow at the foot of a ridge, and wrote around it. To replace it a module would write `Observe … instead of w13_scene`, but the generated observation's id is not importable.
*Request.* `@site.scene` (and `@site.letters`) as scenario references, so that a module can say `instead of` them; or a manifest field `"scene": "own"` that omits them for a site the scenario describes itself.
*Reproduce.* `bun scripts/dump-region.ts kahitude w13`.

### R35. A lone creature at a high level has the action economy of one

*Problem.* A level-13 revenant has about 85 hit points and acts once a round; four level-4 characters kill it in two or three rounds with a single casualty. "Level" raises hit points and damage but not the turns a boss takes. The king was given two sworn revenants in the same room (joining the fight by being beside him) to be a fight at all.
*Request.* `Actions 2.` on a Person (the catalog's `statistics.actions` exists for some species); or a variation (`boss`, `legendary`) that adds one.
*Reproduce.* Set `Level 13` on `king` and delete `sworn`; `bun $PA kahitude warrior,warrior,cleric,mage 4 howe__throne "Pack › A torch › Light" "FIGHT Attack"`.

### R36. A fight in a spec cannot use an item

*Problem.* `Journey.fight` plays the fight with the auto controller (attacks and the creature's own abilities). Preparation that acts in a fight (oil against what regenerates, holy water against the dead, a held door) cannot be shown by a spec, only its alternatives (barley prevents the horses' fight, salt keeps the household in, a rite opens the door). The auto controller never throws oil.
*Request.* A `CombatController` in `test/support` that takes a list of items to use in the first round (`Journey.fight(label, Fighting.using('oil_flask'))`).

### R37. A scenario cannot speak to the first town's authored people

*Problem.* A scenario reference `@role.part` resolves to `<module>.<role>_<part>` and the region module exports only settlement roles (green, innkeeper, merchant, priest, traveller, taproom, shrine, shop). The Hall's keeper `s1_manor_keeper` (Wystan Hale, who can join the company) is declared in the first town's template but not exported, so an expedition cannot give him a remark at a barrow's door or a topic after the howe is sealed: `"veteran": "@first.manor_keeper"` fails to load with `Unresolved module import veteran: region.s1_manor_keeper`. The "companion's interest" the commission asked for therefore stayed unwritten.
*Request.* Export the first town's named authored people (`{t}_manor_keeper`, `{t}_reeve`, `{t}_iv`, `{t}_anselm`, `{t}_hesper`) from the region module, or let a scenario reach any entity by its full id (`"veteran": "region.s1_manor_keeper"` with a declared stand-in).
*Reproduce.* Add `"first": {"settlement": "largest"}` to `data/scenarios/bound-howe.scenario.json` and `"veteran": "@first.manor_keeper"` to the module's imports; `bin/kyrie world kahitude`.

### The Silent Lord (module 2, `adventure/fs-social`; text moved here from `modules/keep.md` section 13)

### R38. A scenario cannot import the first town's authored people and facts (was R15s)

*Problem.* The region module exports a fixed list of ids (`RegionWriter.manifest`: greens, rooms, innkeeper, priest, merchant, traveller, sites, ways). *Reproduce.* In `silent-lord.scenario.json` add `"reeve": "@home.reeve"`: `Unresolved module import reeve: region.s1_reeve`. The same as R37.

### R39. A new kind of site is three data edits in three files (was R16s)

*Problem.* `sites.json` (how it looks), the `siteKind` groups (per terrain) and `siteNoun` (names), and nothing says so; a kind absent from any silently fails to place. *Request.* One `kinds` entry in `sites.json` with `terrains` and `nouns`.

### R40. A person who is both `Peaceable` and has a `Temperament` still warns and fights on arrival (was R17s)

*Reproduce.* `Person sentries ... Peaceable. Temperament territorial. Warns "..."`, put the company in its place: the warning is told and the fight begins. The guide says a peaceable person "comes at nobody". Worked round with two groups (day and night sentries) appearing and vanishing by rule.

### R41. No routine for people who keep hours (was R18s)

*Problem.* Seven periods and eleven people are a relation `duty(person, period, room)` and one rule; it works, and the lint cannot see it. *Request.* A `Keeps <room> from <hour> to <hour>.` line on a Person.

### R42. A shared relation name taken for a module's own gives "Unknown predicate" at the spec, not at the load (was R19s)

*Problem.* `settled`, `trusts` and `won` are shared; the module's own were renamed by the shadowing and the spec could not find them (cf. R10). *Request.* The load says "your `settled` is shadowed as `own_settled`". For the three standing modules in one country this was checked (section "Cross-module coherence" of the integration notes): every module's own ids are prefixed by its module (`keep__`, `howe__`, `arcology__`), so the shadowing is within a module only.

### R43. A topic whose effect takes coin from a person who has none is quietly never offered (was R20s)

*Problem.* `Decrease quantity(keeper, gold) by 8` on an innkeeper with less; the page shows no reason. *Request.* Say so in the lint, or let a topic pay from nothing.

### R44. Two topics with one label, only one eligible, are not offered (was R21s)

*Problem.* Four "Ask {keeper} how the muster went" topics (one per outcome) offered none until their labels differed.

### R45. Two bound places cannot be compared (integration)

*Problem.* The House and the Howe now tell their news in the first town (`first`, the largest) as well as in the town nearest the site (`town`). In a country where those are one town (a1, b2, thorn: the House; kite: the Howe) the town's own carriers and the module's overheard line both speak. They do not double (the overheard line is gated on `not knows(party, fact)`, so it is gone once an Ask has taught it, and an Ask is not offered once heard), but the module cannot say "only when first is not town". *Request.* A condition `same(first_taproom, taproom)` or a scenario field `"unless": "town"` that drops a role when it binds the same place as another.
*Reproduce.* `bin/kyrie world a1`: `arcology {"works":"w12","town":"s1"}`.

### R46. Passive hearsay has no once-only line (integration)

*Problem.* An overheard line (`Observe ... as hearsay ... teaches fact`) is shown whenever the company is in the room and the condition holds, so a wait spanning days shows two modules' lines together (`=day 3` from the taproom). *Request.* `Observe ... once`, or a hearsay kind that is told at the first entry after its condition holds and not on waits.
