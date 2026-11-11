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

## Renumbering of the Phase II branches

Four branches each numbered from R47. One sequence now: corpus B R47–R53 (unchanged); corpus C was R47–R51, now R54–R58; corpus A was R47–R58, now R59–R70; Deem variation was R47–R55, now R71–R79. Other docs that cite the branch-local numbers (the corpus reviews, `deem-variation.md`, `deem-proposals.md`) use the old numbers and should be read through this table.

## E. Requests from the corpus pass B (branch `adventure/p2-corpus-b`; nine adventures reviewed in `corpus/*.md`)

Numbered after R46. The integrator renumbers if a sibling branch also continued from R46. Each is a place where Deem generation or a template that invokes Kyr would add variation the hand-written files cannot.

### R47. A Greets that is drawn, not written, for the large casts

*Problem.* 75 of Quittance's 86 Greets, 20 of Muster's 24, 34 of the Parliament's 66 open with "A [adjective] [person] [doing a thing]" and share the glance beat ("looks at you for a long ...", "does not look up"). Patient Star had 47 Persons and one Greets (the other first meetings were generated from Role and Manner and read as a label). *Request.* A `Greets` that is a Deem expression: `Greets draw gesture(calling, manner) + line "..."`, where the gesture comes from a per-adventure pool an author fills and the engine picks per seed without repeating the shape in one room. Authors keep the line (the dialogue) and give the pool; the stock "A man with a ledger who looks up" becomes a pool entry among twelve, not a template. *Reproduce.* `bin/kyrie voice repeats data/adventures/quittance` (top of the list), `grep -c 'Greets "A' data/adventures/quittance/*.kyr`.

### R48. A day-two pass: Observes that vary by what the night did, from a cast table

*Problem.* A kitchen that holds seven people for a night and a day reads the same at nine in the evening and nine in the morning; Skerrow now has six hand-written `d2_*` Observes, one per person, with the survivors' names tested one at a time. *Request.* A template `aftermath` that takes a roster (person, gesture pool for "a night survived", gesture pool for "a night not survived") and a condition, and emits the Observes with a seed-drawn variant per person. The same shape would give Sallowfield's coach passengers a different morning in each world, and the Tallow village (below) its aftermaths. *Reproduce.* `data/adventures/skerrow/lore.kyr` `d2_*`.

### R49. A rumour as a list, drawn by town and keeper

*Problem.* `countries.json` carries one `rumour` per country, spoken by `{keeper}` in every town of the first region. Two towns tell it word for word. The Aenean road (Muster's Kell Ford, Tallow's Calx Way, the posting-house every country carries) is three tellings of one empire and the first region never says so. *Request.* `rumour` may be a list of lines, each with an optional `by` (a keeper manner, a terrain of the town, whether the company has been told of another country), drawn per town; and an optional `echo` that names a second country whose rumour this one points to ("the same road that comes out at Kell Ford"). *Reproduce.* `bin/kyrie countries` and read the keeper lines for two towns of one seed.

### R50. An `after` that an adventure with no Ending can raise

*Problem.* The Patient Star ends on a state (the hold is made or broken) with no `Ending` entity; `after` is raised by hand-writing a `Rule word_old when ...` that restates a condition the module already knows. Tallow has no Ending at all; its `word_old` repeats `state(calx_gate, raised) or namesRead or ticked or laid` from the keeping file. *Request.* `Told when <condition>` as a module line (one condition, one place) that raises `stale(word)` and `befell(<event>)` together; today they are two Rules and two canon edits.

### R51. A Rule over a set of rooms with per-room text

*Problem.* Skerrow's eight `caller_takes_*` rules differ only in the room and a sentence; changing the pacing needs eight edits and the variation among them stays a matter of the author's patience. *Request.* `Rule caller_takes for each r in rooms (...) says table(r)` where the table gives text and verb-shape per room and the engine rotates the skeleton. Tallow's Dial-shelf `restore_*` actions are another such set.

### R52. A world event declared once

*Problem.* A new `befell(x)` is three edits in shared files before any adventure may read it: `data/imbar/events.kyr`, `data/imbar/module.json` canon and exports, and each reading manifest's `canon`. This pass added six events (`scarth_kept`, `scarth_lost`, `calx_opened`, `tallow_names`, `sallowfield_held`, `sallowfield_burned`) and five readers; all six declarations are one block at the end of `events.kyr` and `module.json` so the integrator can resolve a conflict mechanically. *Request.* An event declared where it is first asserted (`Event name "fact text".` in the emitting adventure), and read by a `Reads` line that needs no manifest `canon`; and an `Ending ... emits name` so the Rule that restates the ending's condition goes away (Skerrow, Sallowfield).

### R53. A crowd the company can meet

*Problem.* Sallowfield's Teasdale feeds eleven passengers for three nights; none was a Person. They can only be present as Observes. *Request.* `Crowd 11 "the coach's passengers" at east_road` with a Deem cast (names, a one-line identity each, one in five with a want), listed under Look... and addressable by a topic. The same generator would cast the Fair at Skeel, the Waiting of Patient Star and the Hall of the Five in Quittance with the variation the hand-written casts give a tenth of the people.

## E. Requests from Corpus review C (`adventure/p2-corpus-c`, R54 to R58)

### R54. One `Pursuit` that seeks the company wherever it is

*Problem.* `data/adventures/wrongboat/hunt.kyr` is sixty `Pursuit` lines, one per place the company can stand and per chaser, each of the form `Pursuit hunt_bess_X for bess "coming for you" priority 8 when huntBess() and at(party, X) seeks at(bess, X).` The module's header says why: "a pursuit that seeks a fixed place is an itinerary". *Request.* `Pursuit hunt_bess for bess "coming for you" priority 8 when huntBess() seeks at(party, ?p).` with `?p` bound to wherever the company is when the goal is chosen.
*Reproduce.* `grep -c "^\s*Pursuit" data/adventures/wrongboat/hunt.kyr` (60); add a place to `places.kyr` and the chase silently does not go there until a sixty-first line is written.

### R55. A choice from a table inside a module, per campaign seed

*Problem.* Variation by seed is available to worlds (Deem tables, `.kyrt` sections) and not to an authored adventure played alone: nothing in a module's `.kyr` says "one of these three, drawn when the campaign starts". Wrongboat's central object (the hamper, its label, who it is for) is therefore fixed. *Request.* A `Draw hamper from { … }` that a module may read as `drawn(hamper, "a pie")` and that is fixed for the campaign.
*Reproduce.* Try to make `Mother Cobbold`'s `Says` depend on a seed.

### R56. A country's rumour is one string

*Problem.* `countries.json` `rumour` is substituted only for `{keeper}` (`RegionBorders.rumour`), so every innkeeper tells it in the same words. `after` also requires a `talk` string even where the country has no `notice` (it is read only through the notice), which six of the nine corpus-C modules had to fill with prose nothing reads. *Request.* `rumour` as a list of frames chosen by the innkeeper's `Manner` (or by seed), and `after.talk` optional when there is no `notice`.
*Reproduce.* `bin/kyrie play --world a1 …` and ask two innkeepers about the same country.

### R57. `Greets again` cannot read state

*Problem.* A return greeting is a literal. The corpus could say "Raistrick has not opened the book" but not "Raistrick has opened the book, now that you have found the ash": the person's return line cannot differ by what the company has done, so authors write lines that are true of every case and therefore say little. *Request.* `Greets again when <condition> "…".` repeatable, first match wins; and `Greets again drawn from <table>` for generated persons (see `corpus/deem-proposals.md`, 2).
*Reproduce.* Any `Greets again` in `data/adventures/winter-in-carth/` after Hern is freed.

### R58. An `Objective` has no 'until' and is true as long as its condition stands

*Problem.* Eleven new objectives in the corpus each needed a hand-picked resolving fact (`not verdictGiven(consistory)`, `not jennetIced(jennet)`); where the module has none, the objective can never close. *Request.* `Objective … until <fact>` or an automatic close when the objective's `toward` person or place has been reached and asked.
*Reproduce.* `Objective rune_oil` in `data/adventures/the-dorothea/house.kyr`: it closes only on `keptLamp`, `marlSold` or `lampOut`, none of which is the mate's selling stopping.

## Branch `adventure/p2-corpus-a` (corpus review, adventures A)

*Found while reviewing nine adventures. R-numbers continue after R46. The first four are Kyr/Deem engine requests; the rest are concrete Deem and template proposals where generation would add real variation. None is implemented here.*

### R59. A module with places and endings but no milestones is invisible to the lint

*Problem.* `let-one-remember` has 151 places and 54 people and no `Milestone`, no `Ending` and no `experience`; `low-water` has twenty endings and no milestones. Nothing says so; a company that resolves everything gains nothing. *Reproduce.* `grep -c "^ *Milestone" data/adventures/*/*.kyr` per adventure, against `grep -c "^ *Place"`. *Request.* A lint warning when an adventure of more than N places holds no milestone and no manifest `experience`; it is a design decision, so a warning, not an error. (This branch added nine milestones to `let-one-remember`; Low Water is left to the owner.)

### R60. A topic cannot vary by how many times it has been asked

*Problem.* Return visits are authored as chains of `once` topics with differing `when`s (`hanu_sitting`, `hanu_tobu`, the new `hanu_door`). That is fine for events that change the world, but a person asked the same thing three days later has only one answer. *Request.* `Says first "..." again "..." thereafter "...".` (or a list that advances), so a repeated question can be answered differently without three topics and three labels (cf. R44, where same-label topics already break).

### R61. An itinerant is hand-placed in every adventure that mentions her

*Problem.* Jessamy Cattermole has a `Discovery` and a `Topic` in each of ten `lore.kyr` files; none of them knows where she is, and a company meets her only as hearsay. *Request.* A scenario herald with a route (a list of countries in order, visited by the clock) that is placed in a first-region taproom today and says the next stop from the countries the world actually holds (`Countries.plan`), so she can be met and followed. The same shape would serve the surveyor Orlando Pym.

### R62. `after` has one condition per way, but no way to read the company's own part

*Problem.* The first region's innkeeper tells what the road brought down of a country, and the company tells its own part, but the two cannot be compared: the strewnfield `by` words (`free`, `chair`, `sold`) are marked stale by the *country's* facts, so if two ways hold, the first in the list wins. *Request.* An optional `when:` on each `by` entry, in Kyr, so priority is the author's and the lint can check that every ending has a word.

### Deem and template proposals

*Each names the place in the corpus, the table or template that would vary it, and what a player would see.*

- **R63. Cobble Ring's council arcs.** `sellVotes` starts at 5 for the reeve, always. A Deem table of the nine arcs' leanings (two firm, two firm against, five who follow the last to speak) drawn at install, with the arcs named in the reeve's account, would make each world's vote a different argument. The topics that move the vote (`tessa_house`, `tessa_well`, `tessa_sell`) already change it by 2 or 1.
- **R64. What an unwatched sleeper wakes holding.** `sleep_dreg` is always "your father's leather knife, nick and all". A table of loved small things drawn from the sleeper's background (the company's calling and ancestry) in `data/generation/tables` would make the dreg a portrait; `Kezu's ox` and `Quill's cart` are authored one-offs for the same idea.
- **R65. Hessel's gossip.** Mrs Scrope's news is one fixed sentence ("a colonel's gout, a bishop's niece..."). A Deem table of fifteen items (a name, an ailment, a match) drawn on each visit, with the same four-day clock, would let the Pump Room feel inhabited on a second walk; the Season is the one place in the set where return visits should differ.
- **R66. The Frost Fair's booths.** `fair.kyr` places a chandler, a gingerbread-wife, three butchers. A table of stalls with a price and a line each, three drawn per day from twelve, gives the Fair a second morning that is not the first.
- **R67. Halm's finds at the dig (Low Water).** The day's finds on his tray are fixed text; a find table by stratum, drawn by day, with the bell-teeth lot the factor carts down as one entry, would connect the first region's scenario to the dig as an *event* rather than a single line.
- **R68. The Leavers' Market (Half the Hive).** Crispin Polglaze's rows are "chests, chairs, a cradle, a loom in pieces". A table of household goods, each with an owner family and a price, drawn per world, gives the Drewes' table company and lets the Chandlers' Company buy different lives each time.
- **R69. A first-region tie that points in.** `ties.kyrt` shapes tell what a town wants of its nearest site. A shape `traveller` whose text is the `far` line of the next country the world holds (and that flips on `stale`, as `after` already does) would let every first-region town carry one named rumour of a province without touching `countries.json`. Today the six provinces' rumours are the same sentence for every innkeeper.
- **R70. A template that invokes Kyr.** A Kyr template section `--- almanack` that takes a hole `{route}` (the Cattermole route above) and writes both the `Discovery` and the `Topic` from one place would end the ten hand-written copies.

### Deem variation (`adventure/p2-deem`, 11 November)

*Numbered R71… to follow R46. Each was met while making the fellowship (`data/scenarios/fellowship.scenario.json`, `data/situations/fellowship/`) and the richer den (`data/situations/den/`); each has a worked-round form in the data now, and the analysis, the table of what a template can and cannot do, and sample draws are in [deem-variation.md](deem-variation.md). Estimates are lines of TypeScript, plus the spec.*

### R71. Two instances of one scenario draw identically

*Problem.* `WorldAssembler.requests` builds each module's `BundleRequest` without `randomIdentity`, and `ModuleBundle.load` seeds a module's Deem as `RandomStreams.key(seed, 'module', <the module's own id>, request.randomIdentity ?? '')` (`module-bundle.ts:317`). The second den (`den2`) and the first draw the same hoard, lair, marvel and finds; only the site's ecology (which is drawn per site) can tell them apart.
*Reproduce.* `LIB=<a library holding only den.scenario.json> bun <script> a1` (assemble with `scenarios: 2`, read each den's `lairkind`, `marvelled` and `at(find_…)`): a1 `w9` and `w10`, e5 `w10` and `w11`, k11 `w9` and `w10` hold the same lair, marvel and finds in all twelve seeds tried (see the doc's table).
*Request.* `randomIdentity: placement.instance` for an instance after the first (so that every existing first instance keeps its draws). `src/world/world-assembler.ts` (`requests`), nothing else. About 3 lines and a spec that two dens differ. The second instance of every scenario in every country will then draw anew; no kept trace of a first instance moves.

### R72. A scenario's modules are told the folk and town name of one of its towns only

*Problem.* `WorldAssembler.folk` gives a module `folk` and `townName` for the first settlement, in the region's order, that any of the placement's bindings names. A scenario with halls in four towns of different peoples casts every person of the fellowship as the people of the first, and cannot name the other towns in a Deem draw. In `a1` the halls are at Lowmouth (human), Mistshaw (halfling), Millholm (halfling) and Sedgebrook (lizardfolk), and all six people are human (`context folk given to the module: {"folk":"human","townName":"Lowmouth"…}`).
*Reproduce.* `bun <facts script> a1` against `data/scenarios/fellowship.scenario.json`: towns' folk differ, `WorldAssembler.folk(placement, region)` gives one.
*Request.* `folk_<role>` and `townName_<role>` for every settlement role of the placement (`folk_b`, `townName_c`). `src/world/world-assembler.ts` (`folk`). About 8 lines and a spec. It would also let the head name the silent hall's town from a drawn label rather than by an `Event` per town (R78).

### R73. A hook is told in two towns and no others

*Problem.* A hook's tellers are the nearest settlement to the scenario's first place and the first road out of it (`ScenarioWord.of`), whatever the scenario's other roles are. An institution with a hall in each of four towns is talked of at its seat and one neighbour, and not at the hall that is silent. (`hook fellowship.rumour: told by s1_…, s4_…`, and the contact `s2_merchant`; towns `c` and `d` never hear.) The same limit as R31, with the same remedy for a different reason.
*Request.* A hook field `"from": ["a", "c"]` (roles), adding those settlements' carriers. `src/world/scenario-word.ts` (`of`, where `towns` is built) and the `ScenarioManifest` hook type in `src/world/world-assembler.ts`. About 12 lines and a spec.

### R74. A scenario cannot have a member in the next country

*Problem.* `WorldAssembler.settle` is run once for each country, with the placements of that country only (`links` and `along:` reach nothing outside it), and a country beyond a march is drawn when the company first crosses (`Frontier`/`WorldAssembler.beyond`), with the scenarios already placed excluded (`exclude`). A fellowship "across the world" (a chapter whose mother house is a march away) cannot be written; the only thing that goes ahead of a country is a herald, which `Countries.heralds` reads for authored countries on the first ring only.
*Request.* Generalize the herald: a manifest field `"sends": [{ "side": "west", "scenario": "fellowship-hall" }]` which the first country's `settle` records on the placement, and which `Frontier` installs as a module of the country on that side when it is drawn, importing the exports the placement names (as `Frontier.herald` does for authored countries today). `src/world/world-assembler.ts` (manifest type, `place`), `src/world/frontier.ts` (`herald`), `src/world/countries.ts` (`heralds`). About 120 lines and two specs; the largest of these.
*Reproduce.* There is no manifest field to try: read `settle`'s signature (`exclude`, no foreign placements) and `Frontier.herald`.

### R75. A Deem template cannot invoke a Kyr template (a `.kyrt`)

*Problem.* `generation.templates` is parsed as JSON; a `.kyrt` (`data/generation/town/*.kyrt`, `works/`, `wild/`) is read only by TypeScript (`KyrTemplates.parse/choose/fill`, in `src/world/region-*.ts`). So a Deem draw can choose among authored Kyr already in the module (it does, by facts and by `at`) but cannot pull in a section that is not there: an institution's hall with a different set of rooms, topics and actions per kind needs three hundred lines of Kyr all present and all but a third dormant.
*Reproduce.* `"generation": { "templates": "x.kyrt" }` → `JSON Parse error: Unrecognized token '#'`.
*Request.* A generated manifest field `sections`: `[{ "template": "halls.kyrt", "key": "b", "values": { "town": "…" } }]`, which `ModuleBundle.load` (already async, and already holding `source.read`) reads, chooses and fills with `KyrTemplates.choose/fill` and appends to the module's own files before it is parsed. `src/campaign/module-bundle.ts` (`load`, after `generated`), `src/campaign/module-assembly.ts` (`SituationManifest`), `src/world/kyr-template.ts` (no change; `choose` is already pure). About 50 lines and a spec. Kyr invoked from the other side (a Kyr rule calling Deem mid-play) is a different, larger request and is not made: generation is complete before the world runs.

### R76. A manifest's `items` cannot bind any item the author declares

*Problem.* `ModuleAssembly.generatedItems` lets generation decide an item's kind, but an `Item` is declared with `is <kind>`, which asserts `itemKind` itself, and the function refuses an item that has one ("needs a declared item, kind and no duplicate authored binding"). Nothing reaches it; no spec or template uses `items`. A treasure table that names the item (`data/generation/tables/treasure.json` has the tiers) cannot be drawn into a hoard; the den parks every candidate in a room called Nowhere and moves the drawn one by an `at` fact.
*Reproduce.* `Item prize "a prize" is torch at ga.` with `"items": { "prize": "torch" }` in the template: `Generated item prize needs a declared item, kind and no duplicate authored binding`. (As an `itemKind(prize, torch)` fact instead, the item has two kinds.)
*Request.* In `generatedItems`, replace the authored kind rather than refuse it. `src/campaign/module-assembly.ts` (`generatedItems`). About 6 lines and a spec.

### R77. A Deem fact cannot name a module's own nested room in a relation of its own

*Problem.* `Relation hushed(entity).` and a template fact `hushed(hall_b)`, where `Place hall_b "The hall" is room within town_b at 3, 1.`, loads as `Invalid argument hall_b in hushed(hall_b)`; the same fact on an own top-level `Place` loads, and `at(treasurer, hall_b)` loads. The relation takes a module's own entity, not a nested one.
*Reproduce.* Copy `data/situations/fellowship/` and its scenario, add `Relation hushed(entity).` to the copy's `situation.kyr`, `gen(fl_hush)` to the `facts` of its `fellowship` template and `"fl_hush": { "__no_id": true, ">name": "hushed", "args": "=concat('hall_' + #_silent)" }`; assembling `a1` with `library` set to a library of the copy (`WorldAssembler.assemble('a1', source, { library, scenarios: 0, towns: 1 })`) gives the error above (done).
*Request.* Find why `ModuleCompiler.type` (`src/lang/module-compiler.ts:232`) has no type for the id on this path (the lookup is `this.lookup.types`, built from `module.entities`), and either type it or say so. Unknown size; diagnosis first. Worked round: the fact is on the persons (`at(keeper, hall_b)`).

### R78. A rule's or event's `says` is told before the topic's own text

*Problem.* A topic's answer that depends on a Deem fact has to be a rule or an event with a condition on the fact (Kyr has no way to take the text from the fact; R29). The page tells the rule's line first, then the room's description, then the topic's `Says`: "'It is Mistshaw,' [the hall] Piers says it without looking up". The cure that works is not to use a rule: a Deem label (`{page_text}`) names an entity and the topic's `Says` includes it (§ "Drawn prose by label" of the doc), but a label is one string for the whole country, and cannot hold a town's name until R72. An `Event … then { Assert knows(…) }` is also refused ("a rule teaches what it says").
*Request.* Tell a rule or event that fires on a topic's effect after that topic's `Says`, or let an event `teach`. Where it lies is for the owner to say (it is in the presentation of a turn, not in `src/lang`). Size unknown.

### R79. A settlement role is always bound

*Problem.* `ScenarioTowns.town` falls back to `region.settlements[0]` and every country has exactly five settlements (40 of 40 seeds drawn), so a scenario cannot have "two to four halls": a role it cannot bind is bound anyway, to a town already used, and a module's `when` on the role never fails. The fellowship's four halls are fixed; the vacancy it needs (a hall with nobody) is a person parked at Nowhere.
*Request.* A trailing `?` on a settlement need (`"along:c?"`) which leaves the role unbound when no unbound town is left, so that `modules[].when` and Kyr `when` can drop it. `src/world/scenario-towns.ts` (`town`, `along`), `src/world/world-assembler.ts` (`place`). About 10 lines and a spec.

## E. Requests from `adventure/p2-encounters` (encounter audit; R80 to R84)

*Measurements are in [encounters.md](encounters.md); `bun scripts/encounter-audit.ts` reproduces them. Each request is an engine or driver cause that authored data cannot cure.*

### R80. One scripted step is a whole fight, and the company's fall leaves nothing offered (the "one Attack" of the blind playtests)

*Problem.* `PlaySession.perform` runs a battle to its end with `PlaySession.auto` (`Tactics.choose`) for the player's side unless a controller is given, and `bin/kyrie play` and `Journey` give none. A blind player who drives the CLI gets "Attack" and the whole fight in one step, bosses included. After the company falls, `Journey.choices()` is empty and the campaign records no ending.
*Reproduce.* World `a1`, warrior, `room = region__<site>_grave_heart` (the barrow king's room, as in `test/deep-barrow.test.ts`'s `Barrow.enter`), light a torch, take "Attack": the king hits, "Wenna takes 5 piercing damage (0 HP left). Wenna falls. The fight is lost." Then `choices()` is `[]`. With a controller printing the state each command: round 2, Wenna 1/14, king 48/48; round 3, 5/14; the flee at 1 hit point is not legal.
*Request (narrow).* `kyrie play`/`Journey` step form that gives the fight one round at a time: `Attack` plays until the company next has to choose, prints each side's hit points as the page shows them, and the next step (`Attack`, `Defend`, `Flee`, an ability by its label) is the next command; `--auto-fights` keeps today's behaviour. And an ending screen (a "the company is lost" choice to begin again or load) in place of an empty page when `partyIds` all stand at 0 hit points.

### R81. The damage line says the clipped amount, so a long fight's last blow reads as a one-hit kill

*Problem.* `Effects.hp` pushes `{ rolled: amount, amount: applied }` with `applied = Math.min(remaining, target.hp)`; `Narration` drops `(roll N)`. A blow of 9 against 1 hit point reads "takes 1 fire damage (0 HP left)". Transcripts all over `doc/adventures/*/playtest` have the form ("takes 3 slashing damage (0 HP left)").
*Request.* Tell the amount rolled (and the foe's wound, R82) in the line, or say a killing blow as one ("finishes it") rather than as small damage.

### R82. Wounds are not told, and the `hurt` lines are never said

*Problem.* `data/voice/combat.json` has eight `hurt` lines; `Barks.moment` emits only kill, fall, crit, flee and miss, so they cannot be said. Nothing in the narration says how hurt a member of the company or a foe is, so a level-1 company can be taken down by attrition without a sign (the playtest that lost one).
*Request.* `Barks.moment` yields `['hurt', target]` once each time an exchange takes a fighter across half and across a quarter of their maximum hit points, and `when` takes `wound: "half" | "quarter"`; and the same words are used for a foe. Authors can then write the lines (drafts, for the company, by manner: "{Actor} is bleeding through the sleeve and has stopped talking."; "{Actor} is white, and holds the wall."; for a foe: "It has slowed, and one arm hangs."; "It is hardly standing."), with no new rule.

### R83. A creature's damage does not grow with its level

*Problem.* `growth` in `data/catalog/monsters.json` has only `hitPoints`; natural weapons are 1d3 to 1d8 with one action. A level-12 mummy deals 1d4 a round, so level makes a keeper long, not dangerous (the barrow king before this branch: four level-3 characters won in four rounds, scratched). Worked round by giving the mummy two actions and a slam.
*Request.* `growth.damage: { perLevel: n }` (flat bonus per level, or extra dice) in `Creation.grown`; kinds then re-measured with `bin/kyrie bestiary challenge`.

### R84. A deep site's dwellers cannot carry their own warning, lure or way round

*Problem.* `DeepGroup` (`src/world/deep/deep-purposes.ts`) is species, count, label, role, temperament and variations, and `DeepRooms.dwellers` writes only those; the keeper alone takes `words`. So the most-trodden fights, the rooms of a generated deep site, have the plain words of their temperament and no alternative (the placed troubles have them: smoke, rites, a thrown bone, a ewe).
*Request.* `DeepGroup.words: { Warns, Comes, Flinches }`, passed through as the keeper's are, and `DeepGroup.ways: [{ label, needs, effect }]` for one authored alternative a group may be given (a lure of the kind's food, the rites for the dead), written as the situations' `Change ... needing <skill>` is, so a purpose can say how its ghouls are laid and its hounds thrown a bone.
